import { makeEmptyBoard, placeMines } from "./generator";
import type { Board, GameState, RevealResult } from "./types";

export function createInitialState(
  width: number,
  height: number,
  mines: number,
  seed?: number,
): GameState {
  return {
    board: makeEmptyBoard(width, height),
    width,
    height,
    mines,
    status: "idle",
    flagsPlaced: 0,
    cellsOpened: 0,
    startedAt: null,
    endedAt: null,
    firstMoveMade: false,
    seed: seed ?? null,
    hintsUsed: 0,
    lastHint: null,
  };
}

const NEIGHBORS = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0],           [1, 0],
  [-1, 1],  [0, 1],  [1, 1],
];

function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((c) => ({ ...c })));
}

function countMines(board: Board): number {
  let m = 0;
  for (const row of board) for (const c of row) if (c.mine) m++;
  return m;
}

function totalSafeCells(state: GameState): number {
  return state.width * state.height - state.mines;
}

/**
 * Flood-reveal: BFS, opens current cell and recursively expands
 * all 0-adjacent cells (and one ring of numbers around them).
 */
function floodReveal(board: Board, sx: number, sy: number): { board: Board; opened: number } {
  const h = board.length;
  const w = board[0].length;
  const queue: [number, number][] = [[sx, sy]];
  let opened = 0;

  while (queue.length) {
    const [x, y] = queue.shift()!;
    const cell = board[y][x];
    if (cell.state !== "closed") continue;
    if (cell.mine) continue;
    cell.state = "open";
    opened++;
    if (cell.adjacent === 0) {
      for (const [dx, dy] of NEIGHBORS) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const n = board[ny][nx];
        if (n.state === "closed" && !n.mine) {
          queue.push([nx, ny]);
        }
      }
    }
  }
  return { board, opened };
}

/** Reveal mines after a loss — for display. */
function revealAllMines(board: Board): Board {
  for (const row of board) {
    for (const c of row) {
      if (c.mine && c.state === "closed") c.state = "open";
    }
  }
  return board;
}

export function revealCell(
  state: GameState,
  x: number,
  y: number,
  now: number = Date.now(),
): RevealResult {
  if (state.status === "won" || state.status === "lost") {
    return { state, exploded: null };
  }

  const cell = state.board[y][x];
  if (cell.state === "flag" || cell.state === "question") {
    return { state, exploded: null };
  }

  let board = cloneBoard(state.board);

  // First click — defer mine placement to guarantee safety.
  let mines = state.mines;
  if (!state.firstMoveMade) {
    board = placeMines(board, mines, x, y, state.seed ?? undefined);
    mines = countMines(board);
  }

  const target = board[y][x];

  // Already revealed → no-op
  if (target.state === "open") {
    return { state, exploded: null };
  }

  // Boom
  if (target.mine) {
    target.state = "open";
    const finalBoard = revealAllMines(board);
    return {
      state: {
        ...state,
        board: finalBoard,
        status: "lost",
        firstMoveMade: true,
        endedAt: now,
        startedAt: state.startedAt ?? now,
      },
      exploded: { x, y },
    };
  }

  // Safe reveal → flood
  const { opened } = floodReveal(board, x, y);
  const cellsOpened = state.cellsOpened + opened;
  const safe = state.width * state.height - mines;
  const won = cellsOpened >= safe;

  return {
    state: {
      ...state,
      board,
      mines,
      cellsOpened,
      firstMoveMade: true,
      startedAt: state.startedAt ?? now,
      status: won ? "won" : "playing",
      endedAt: won ? now : state.endedAt,
    },
    exploded: null,
  };
}

export function toggleFlag(state: GameState, x: number, y: number): GameState {
  if (state.status === "won" || state.status === "lost") return state;
  const board = cloneBoard(state.board);
  const cell = board[y][x];
  if (cell.state === "open") return state;

  let flags = state.flagsPlaced;
  if (cell.state === "closed") {
    cell.state = "flag";
    flags++;
  } else if (cell.state === "flag") {
    cell.state = "question";
    flags--;
  } else {
    cell.state = "closed";
  }

  return { ...state, board, flagsPlaced: flags };
}

/**
 * Chord click — when clicking an open numbered cell, if the number of
 * neighboring flags equals the cell's adjacent count, reveal all unflagged
 * neighbors. Classic Minesweeper feature.
 */
export function chord(state: GameState, x: number, y: number, now: number = Date.now()): RevealResult {
  if (state.status !== "playing") return { state, exploded: null };
  const cell = state.board[y][x];
  if (cell.state !== "open" || cell.adjacent === 0) {
    return { state, exploded: null };
  }
  const h = state.height;
  const w = state.width;
  let flagCount = 0;
  for (const [dx, dy] of NEIGHBORS) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
    if (state.board[ny][nx].state === "flag") flagCount++;
  }
  if (flagCount !== cell.adjacent) return { state, exploded: null };

  let result: RevealResult = { state, exploded: null };
  for (const [dx, dy] of NEIGHBORS) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
    const n = result.state.board[ny][nx];
    if (n.state === "closed") {
      result = revealCell(result.state, nx, ny, now);
      if (result.exploded || result.state.status !== "playing") return result;
    }
  }
  return result;
}

export function getElapsedMs(state: GameState, now: number = Date.now()): number {
  if (!state.startedAt) return 0;
  return (state.endedAt ?? now) - state.startedAt;
}

/** Accuracy of flag placement: correct flags / total flags. */
export function computeFlagAccuracy(state: GameState): {
  correct: number;
  total: number;
  pct: number;
} {
  let correct = 0;
  let total = 0;
  for (const row of state.board) {
    for (const c of row) {
      if (c.state === "flag") {
        total++;
        if (c.mine) correct++;
      }
    }
  }
  return { correct, total, pct: total ? correct / total : 1 };
}
