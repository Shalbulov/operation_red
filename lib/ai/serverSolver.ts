import { tServer } from "@/lib/i18n/serverT";
import type { Locale } from "@/lib/i18n/dictionaries";

/**
 * Pure constraint solver that works directly on the serialized board payload
 * sent from the client. Used inside /api/ai-coach to handle deterministic
 * cases BEFORE calling Gemini, eliminating LLM errors on easy positions.
 *
 * Reasoning strings are localized via tServer using the provided locale.
 */

interface CellPayload {
  state: "closed" | "open" | "flag" | "question";
  adjacent: number;
}

interface SolverConstraint {
  cells: Set<string>; // "x,y" keys
  mines: number; // mines hidden in those cells
}

export interface ServerHint {
  x: number;
  y: number;
  action: "reveal" | "flag";
  confidence: number; // 0..1, 1 = logical certainty
  reasoning: string;
  source: "solver" | "ai" | "heuristic";
}

const NEIGHBORS = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0],           [1, 0],
  [-1, 1],  [0, 1],  [1, 1],
];

function key(x: number, y: number) {
  return `${x},${y}`;
}

function parseKey(k: string): [number, number] {
  const [x, y] = k.split(",").map(Number);
  return [x, y];
}

function neighborhood(width: number, height: number, x: number, y: number) {
  const out: { x: number; y: number }[] = [];
  for (const [dx, dy] of NEIGHBORS) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      out.push({ x: nx, y: ny });
    }
  }
  return out;
}

export function solveBoardServer(
  board: CellPayload[][],
  width: number,
  height: number,
  totalMines: number,
  flagsPlaced: number,
  locale: Locale = "ru",
): ServerHint | null {
  // Helper accessors
  const cellAt = (x: number, y: number) => board[y][x];

  // Collect constraints
  const constraints: SolverConstraint[] = [];
  const allClosed = new Set<string>();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const c = cellAt(x, y);
      if (c.state === "closed" || c.state === "question") {
        allClosed.add(key(x, y));
      }
      if (c.state !== "open" || c.adjacent === 0) continue;
      const neigh = neighborhood(width, height, x, y);
      const closed = neigh.filter((n) => {
        const s = cellAt(n.x, n.y).state;
        return s === "closed" || s === "question";
      });
      const flagged = neigh.filter((n) => cellAt(n.x, n.y).state === "flag");
      if (closed.length === 0) continue;
      const remaining = c.adjacent - flagged.length;
      if (remaining < 0) continue; // over-flagged, skip
      constraints.push({
        cells: new Set(closed.map((n) => key(n.x, n.y))),
        mines: remaining,
      });
    }
  }

  // Pass 1 — trivial deductions
  for (const c of constraints) {
    if (c.mines === 0 && c.cells.size > 0) {
      const k = c.cells.values().next().value!;
      const [x, y] = parseKey(k);
      return {
        x,
        y,
        action: "reveal",
        confidence: 1,
        reasoning: tServer(locale, "solver.safeByFlags", { x, y }),
        source: "solver",
      };
    }
    if (c.mines === c.cells.size && c.cells.size > 0) {
      const k = c.cells.values().next().value!;
      const [x, y] = parseKey(k);
      return {
        x,
        y,
        action: "flag",
        confidence: 1,
        reasoning: tServer(locale, "solver.mineByFlags", {
          x,
          y,
          num: c.cells.size,
          fx: 0,
          fy: 0,
          flags: 0,
        }),
        source: "solver",
      };
    }
  }

  // Pass 2 — subset deduction
  // If constraint A.cells ⊂ B.cells, then B \ A contains (B.mines - A.mines) mines.
  for (let i = 0; i < constraints.length; i++) {
    for (let j = 0; j < constraints.length; j++) {
      if (i === j) continue;
      const a = constraints[i];
      const b = constraints[j];
      if (a.cells.size >= b.cells.size) continue;
      // Check subset
      let subset = true;
      for (const k of a.cells) {
        if (!b.cells.has(k)) {
          subset = false;
          break;
        }
      }
      if (!subset) continue;
      const diffCells = new Set<string>();
      for (const k of b.cells) if (!a.cells.has(k)) diffCells.add(k);
      const diffMines = b.mines - a.mines;
      if (diffMines < 0) continue;
      if (diffMines === 0 && diffCells.size > 0) {
        const k = diffCells.values().next().value!;
        const [x, y] = parseKey(k);
        return {
          x,
          y,
          action: "reveal",
          confidence: 1,
          reasoning: tServer(locale, "solver.subsetSafe", { x, y }),
          source: "solver",
        };
      }
      if (diffMines === diffCells.size && diffCells.size > 0) {
        const k = diffCells.values().next().value!;
        const [x, y] = parseKey(k);
        return {
          x,
          y,
          action: "flag",
          confidence: 1,
          reasoning: tServer(locale, "solver.subsetMine", { x, y }),
          source: "solver",
        };
      }
    }
  }

  // Pass 3 — probabilistic best guess
  // For each closed cell, take the max mine-probability across constraints
  // it appears in. Lowest = safest pick.
  const probability = new Map<string, number>();
  for (const c of constraints) {
    if (c.cells.size === 0) continue;
    const p = c.mines / c.cells.size;
    for (const k of c.cells) {
      const prev = probability.get(k) ?? 0;
      probability.set(k, Math.max(prev, p));
    }
  }

  // Global density for cells not in any constraint
  const inSome = new Set<string>();
  for (const c of constraints) for (const k of c.cells) inSome.add(k);
  const unconstrained: string[] = [];
  for (const k of allClosed) if (!inSome.has(k)) unconstrained.push(k);
  const totalConstrainedMines = constraints.reduce(
    (s, c) => s + c.mines,
    0,
  );
  // upper bound — actual estimate is harder, but global density is fine
  const minesLeft = Math.max(0, totalMines - flagsPlaced);
  const globalDensity = unconstrained.length
    ? Math.min(1, minesLeft / Math.max(1, allClosed.size))
    : 1;

  let best: { x: number; y: number; p: number; source: "constraint" | "global" } | null = null;
  for (const [k, p] of probability) {
    if (!best || p < best.p) {
      const [x, y] = parseKey(k);
      best = { x, y, p, source: "constraint" };
    }
  }
  if (unconstrained.length && globalDensity < (best?.p ?? 1)) {
    // Pick a corner/edge of unconstrained area
    const k = unconstrained[0];
    const [x, y] = parseKey(k);
    best = { x, y, p: globalDensity, source: "global" };
  }

  void totalConstrainedMines; // not used directly but kept for clarity

  if (best) {
    const conf = 1 - best.p;
    return {
      x: best.x,
      y: best.y,
      action: "reveal",
      confidence: conf,
      reasoning:
        best.source === "constraint"
          ? tServer(locale, "solver.probability", {
              pct: Math.round(best.p * 100),
            })
          : tServer(locale, "solver.global", {
              pct: Math.round(best.p * 100),
            }),
      source: conf >= 0.99 ? "solver" : "heuristic",
    };
  }

  // Truly empty board — first-move heuristic, center
  return {
    x: Math.floor(width / 2),
    y: Math.floor(height / 2),
    action: "reveal",
    confidence: 0.7,
    reasoning: tServer(locale, "solver.centerStart"),
    source: "heuristic",
  };
}
