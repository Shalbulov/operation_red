import { mulberry32, shuffle } from "./seedrandom";
import type { Board, Cell } from "./types";

export function makeEmptyBoard(width: number, height: number): Board {
  const board: Board = [];
  for (let y = 0; y < height; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < width; x++) {
      row.push({ x, y, mine: false, adjacent: 0, state: "closed" });
    }
    board.push(row);
  }
  return board;
}

const NEIGHBORS = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0],           [1, 0],
  [-1, 1],  [0, 1],  [1, 1],
];

function forNeighbors(
  board: Board,
  x: number,
  y: number,
  fn: (cell: Cell, nx: number, ny: number) => void,
) {
  const h = board.length;
  const w = board[0].length;
  for (const [dx, dy] of NEIGHBORS) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
      fn(board[ny][nx], nx, ny);
    }
  }
}

/**
 * Place mines on an empty board, excluding a "safe zone" around (safeX, safeY).
 * Safe zone = the clicked cell + all 8 neighbors → guarantees a non-trivial
 * first opening (flood fill) on first click.
 *
 * If seed is provided, uses mulberry32 for deterministic placement.
 */
export function placeMines(
  board: Board,
  mines: number,
  safeX: number,
  safeY: number,
  seed?: number,
): Board {
  const h = board.length;
  const w = board[0].length;
  const rng = seed != null ? mulberry32(seed) : Math.random;

  const safe = new Set<number>();
  safe.add(safeY * w + safeX);
  for (const [dx, dy] of NEIGHBORS) {
    const nx = safeX + dx;
    const ny = safeY + dy;
    if (nx >= 0 && nx < w && ny >= 0 && ny < h) safe.add(ny * w + nx);
  }

  const candidates: number[] = [];
  for (let i = 0; i < w * h; i++) {
    if (!safe.has(i)) candidates.push(i);
  }

  // Edge case: too many mines for the available cells — clamp.
  const minesToPlace = Math.min(mines, candidates.length);

  const picked = shuffle(candidates, rng).slice(0, minesToPlace);

  // Mutate copy
  const next = board.map((row) => row.map((c) => ({ ...c })));
  for (const idx of picked) {
    const x = idx % w;
    const y = Math.floor(idx / w);
    next[y][x].mine = true;
  }

  // Compute adjacency counts
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (next[y][x].mine) continue;
      let count = 0;
      forNeighbors(next, x, y, (c) => {
        if (c.mine) count++;
      });
      next[y][x].adjacent = count;
    }
  }

  return next;
}
