/**
 * Local Minesweeper solver — fallback when AI Coach is unavailable.
 *
 * Approach:
 *   1. For every open numbered cell, look at its closed (non-flag) neighbors.
 *      The constraint is: (# mines in those neighbors) = adjacent - (# flags already there).
 *   2. If constraint = 0 → all neighbors safe. Suggest opening any of them.
 *   3. If constraint = # closed neighbors → all neighbors are mines.
 *      Suggest flagging.
 *   4. Otherwise compute a per-cell probability estimate and recommend the
 *      lowest-probability cell, or randomly when nothing is known.
 */
import type { Board, GameState } from "./types";

export interface SolverHint {
  x: number;
  y: number;
  action: "reveal" | "flag";
  confidence: number; // 0..1 (1 = certain)
  reasoning: string;
  fallback: true;
}

const NEIGHBORS = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0],           [1, 0],
  [-1, 1],  [0, 1],  [1, 1],
];

function neighborsOf(board: Board, x: number, y: number) {
  const h = board.length;
  const w = board[0].length;
  const out: { x: number; y: number; state: string; mine: boolean }[] = [];
  for (const [dx, dy] of NEIGHBORS) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
    const c = board[ny][nx];
    out.push({ x: nx, y: ny, state: c.state, mine: c.mine });
  }
  return out;
}

export function localHint(state: GameState): SolverHint | null {
  const { board, width, height } = state;
  if (state.status !== "playing" && state.status !== "idle") return null;

  // If no moves have been made yet → suggest the center as a heuristic start.
  if (!state.firstMoveMade) {
    return {
      x: Math.floor(width / 2),
      y: Math.floor(height / 2),
      action: "reveal",
      confidence: 0.7,
      reasoning:
        "Первый клик защищён, центр поля даёт максимальный flood-fill.",
      fallback: true,
    };
  }

  // Pass 1: deduce certain safes & mines
  const probability = new Map<string, number>(); // key "x,y" → mine prob estimate
  const constraints: { closed: { x: number; y: number }[]; mines: number }[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const c = board[y][x];
      if (c.state !== "open" || c.adjacent === 0) continue;
      const neigh = neighborsOf(board, x, y);
      const closed = neigh.filter(
        (n) => n.state === "closed" || n.state === "question",
      );
      const flagged = neigh.filter((n) => n.state === "flag");
      const remaining = c.adjacent - flagged.length;
      if (closed.length === 0) continue;

      if (remaining === 0) {
        // All closed neighbors are safe.
        return {
          x: closed[0].x,
          y: closed[0].y,
          action: "reveal",
          confidence: 1.0,
          reasoning: `Клетка (${x}, ${y}) уже окружена ${flagged.length} флагами при числе ${c.adjacent}. Соседи безопасны.`,
          fallback: true,
        };
      }
      if (remaining === closed.length) {
        // All closed neighbors are mines.
        return {
          x: closed[0].x,
          y: closed[0].y,
          action: "flag",
          confidence: 1.0,
          reasoning: `Число ${c.adjacent} в (${x}, ${y}) при ${flagged.length} флаге равно числу закрытых соседей. Все они — мины.`,
          fallback: true,
        };
      }

      constraints.push({ closed, mines: remaining });
      const p = remaining / closed.length;
      for (const n of closed) {
        const key = `${n.x},${n.y}`;
        const prev = probability.get(key) ?? 0;
        probability.set(key, Math.max(prev, p));
      }
    }
  }

  // No certainty → recommend lowest probability cell among constrained.
  if (probability.size > 0) {
    let best: { x: number; y: number; p: number } | null = null;
    for (const [key, p] of probability) {
      if (!best || p < best.p) {
        const [bx, by] = key.split(",").map(Number);
        best = { x: bx, y: by, p };
      }
    }
    if (best) {
      return {
        x: best.x,
        y: best.y,
        action: "reveal",
        confidence: 1 - best.p,
        reasoning: `Оценка по соседним числам: вероятность мины ≈ ${(best.p * 100).toFixed(0)}%. Из всех неопределённых — самая безопасная.`,
        fallback: true,
      };
    }
  }

  // Fully unconstrained → recommend any closed cell with global density.
  const totalClosed: { x: number; y: number }[] = [];
  let flagsTotal = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const c = board[y][x];
      if (c.state === "flag") flagsTotal++;
      if (c.state === "closed") totalClosed.push({ x, y });
    }
  }
  if (totalClosed.length === 0) return null;
  const minesLeft = state.mines - flagsTotal;
  const density = Math.max(0, Math.min(1, minesLeft / totalClosed.length));
  const pick = totalClosed[Math.floor(totalClosed.length / 2)];
  return {
    x: pick.x,
    y: pick.y,
    action: "reveal",
    confidence: 1 - density,
    reasoning: `Нет локальных подсказок. Глобальная плотность мин ≈ ${(density * 100).toFixed(0)}%. Угадай.`,
    fallback: true,
  };
}

/**
 * 3BV — Board Benchmark Value.
 * Counts the minimum number of left-clicks needed to clear a board,
 * assuming optimal play. Each "opening" (flood-fill region) = 1 click;
 * every isolated non-zero number cell that's not part of an opening = 1 click.
 */
export function compute3BV(board: Board): number {
  const h = board.length;
  const w = board[0].length;
  const visited: boolean[][] = Array.from({ length: h }, () => new Array(w).fill(false));
  let bv = 0;

  // Flood-fill openings (zero cells and their bordering numbers).
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (visited[y][x] || board[y][x].mine || board[y][x].adjacent !== 0) continue;
      // BFS expand through zeroes
      bv++;
      const q: [number, number][] = [[x, y]];
      while (q.length) {
        const [cx, cy] = q.shift()!;
        if (visited[cy][cx]) continue;
        visited[cy][cx] = true;
        if (board[cy][cx].adjacent === 0) {
          for (const [dx, dy] of NEIGHBORS) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
            if (visited[ny][nx] || board[ny][nx].mine) continue;
            if (board[ny][nx].adjacent === 0) {
              q.push([nx, ny]);
            } else {
              visited[ny][nx] = true;
            }
          }
        }
      }
    }
  }

  // Count remaining isolated non-zero number cells
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (visited[y][x] || board[y][x].mine) continue;
      if (board[y][x].adjacent > 0) bv++;
    }
  }
  return bv;
}
