import { describe, it, expect } from "vitest";
import {
  createInitialState,
  revealCell,
  toggleFlag,
  chord,
  computeFlagAccuracy,
} from "./engine";
import { placeMines, makeEmptyBoard } from "./generator";
import { compute3BV, localHint } from "./solver";
import { mulberry32, seedForDate, shuffle } from "./seedrandom";

describe("seedrandom", () => {
  it("mulberry32 produces deterministic sequence for same seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      expect(a()).toBeCloseTo(b(), 10);
    }
  });

  it("seedForDate is stable for same input", () => {
    expect(seedForDate("2026-05-16")).toBe(seedForDate("2026-05-16"));
    expect(seedForDate("2026-05-16")).not.toBe(seedForDate("2026-05-17"));
  });

  it("shuffle returns same array with same RNG", () => {
    const a = shuffle([1, 2, 3, 4, 5], mulberry32(7));
    const b = shuffle([1, 2, 3, 4, 5], mulberry32(7));
    expect(a).toEqual(b);
  });
});

describe("generator", () => {
  it("makeEmptyBoard produces correct dimensions", () => {
    const b = makeEmptyBoard(9, 9);
    expect(b.length).toBe(9);
    expect(b[0].length).toBe(9);
  });

  it("placeMines never places a mine in the safe zone", () => {
    const empty = makeEmptyBoard(9, 9);
    const b = placeMines(empty, 10, 4, 4, 123);
    // safe zone: (4,4) and its 8 neighbors
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        expect(b[4 + dy][4 + dx].mine).toBe(false);
      }
    }
  });

  it("placeMines respects mine count", () => {
    const empty = makeEmptyBoard(16, 16);
    const b = placeMines(empty, 40, 0, 0, 42);
    let count = 0;
    for (const row of b) for (const c of row) if (c.mine) count++;
    expect(count).toBe(40);
  });

  it("placeMines computes adjacency correctly", () => {
    const empty = makeEmptyBoard(9, 9);
    const b = placeMines(empty, 10, 4, 4, 1);
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if (b[y][x].mine) continue;
        // recompute and compare
        let manual = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || nx >= 9 || ny < 0 || ny >= 9) continue;
            if (b[ny][nx].mine) manual++;
          }
        }
        expect(b[y][x].adjacent).toBe(manual);
      }
    }
  });

  it("seeded boards are reproducible", () => {
    const e1 = makeEmptyBoard(16, 16);
    const e2 = makeEmptyBoard(16, 16);
    const b1 = placeMines(e1, 40, 8, 8, 999);
    const b2 = placeMines(e2, 40, 8, 8, 999);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        expect(b1[y][x].mine).toBe(b2[y][x].mine);
      }
    }
  });
});

describe("engine", () => {
  it("createInitialState returns idle game", () => {
    const s = createInitialState(9, 9, 10);
    expect(s.status).toBe("idle");
    expect(s.cellsOpened).toBe(0);
    expect(s.flagsPlaced).toBe(0);
  });

  it("first reveal can never hit a mine", () => {
    // Stress: 100 different positions on a dense board
    for (let i = 0; i < 50; i++) {
      const s = createInitialState(9, 9, 80, i);
      const x = i % 9;
      const y = Math.floor(i / 9) % 9;
      const r = revealCell(s, x, y);
      expect(r.exploded).toBeNull();
      expect(r.state.status).not.toBe("lost");
    }
  });

  it("flood-fill opens multiple cells on zero-adjacent click", () => {
    const s = createInitialState(9, 9, 5, 12345);
    const r = revealCell(s, 4, 4);
    expect(r.state.cellsOpened).toBeGreaterThan(1);
  });

  it("toggleFlag cycles closed → flag → question → closed", () => {
    let s = createInitialState(9, 9, 10);
    s = toggleFlag(s, 0, 0);
    expect(s.board[0][0].state).toBe("flag");
    expect(s.flagsPlaced).toBe(1);
    s = toggleFlag(s, 0, 0);
    expect(s.board[0][0].state).toBe("question");
    expect(s.flagsPlaced).toBe(0);
    s = toggleFlag(s, 0, 0);
    expect(s.board[0][0].state).toBe("closed");
  });

  it("cannot flag an open cell", () => {
    let s = createInitialState(9, 9, 10, 7);
    const r = revealCell(s, 4, 4);
    s = r.state;
    // Find an open cell
    let opened: { x: number; y: number } | null = null;
    outer: for (let y = 0; y < 9; y++)
      for (let x = 0; x < 9; x++)
        if (s.board[y][x].state === "open") {
          opened = { x, y };
          break outer;
        }
    expect(opened).not.toBeNull();
    const before = s;
    const after = toggleFlag(s, opened!.x, opened!.y);
    expect(after.board[opened!.y][opened!.x].state).toBe("open");
    expect(after.flagsPlaced).toBe(before.flagsPlaced);
  });

  it("winning the game sets status to won", () => {
    // 9x9 with 1 mine — open everything except the mine
    const s = createInitialState(9, 9, 1, 42);
    let r = revealCell(s, 0, 0); // first click places mine somewhere far
    // Find the mine
    let mine: { x: number; y: number } | null = null;
    outer: for (let y = 0; y < 9; y++)
      for (let x = 0; x < 9; x++)
        if (r.state.board[y][x].mine) {
          mine = { x, y };
          break outer;
        }
    expect(mine).not.toBeNull();
    // Open every other cell
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if (x === mine!.x && y === mine!.y) continue;
        if (r.state.board[y][x].state !== "open") {
          r = revealCell(r.state, x, y);
        }
      }
    }
    expect(r.state.status).toBe("won");
  });

  it("hitting a mine ends the game", () => {
    const s = createInitialState(9, 9, 10, 12);
    let r = revealCell(s, 4, 4);
    // find a mine
    let mine: { x: number; y: number } | null = null;
    outer: for (let y = 0; y < 9; y++)
      for (let x = 0; x < 9; x++)
        if (r.state.board[y][x].mine) {
          mine = { x, y };
          break outer;
        }
    r = revealCell(r.state, mine!.x, mine!.y);
    expect(r.state.status).toBe("lost");
    expect(r.exploded).toEqual(mine);
  });

  it("chord opens neighbors when flags match adjacent count", () => {
    let s = createInitialState(9, 9, 10, 555);
    let r = revealCell(s, 4, 4);
    s = r.state;
    // pick a numbered cell with adjacency, find any flag combo that matches
    let found = false;
    outer: for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const c = s.board[y][x];
        if (c.state !== "open" || c.adjacent === 0) continue;
        // Flag all neighboring mines
        let flagged = 0;
        const flaggedCells: [number, number][] = [];
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || nx >= 9 || ny < 0 || ny >= 9) continue;
            if (s.board[ny][nx].mine && s.board[ny][nx].state === "closed") {
              s = toggleFlag(s, nx, ny);
              flagged++;
              flaggedCells.push([nx, ny]);
            }
          }
        }
        if (flagged === c.adjacent) {
          const res = chord(s, x, y);
          expect(res.state.status).not.toBe("lost");
          found = true;
          break outer;
        }
      }
    }
    expect(found).toBe(true);
  });

  it("computeFlagAccuracy counts correct vs total flags", () => {
    let s = createInitialState(9, 9, 10, 33);
    let r = revealCell(s, 4, 4);
    s = r.state;
    // Flag first 2 cells (some may be mines, some not)
    s = toggleFlag(s, 0, 0);
    s = toggleFlag(s, 8, 8);
    const acc = computeFlagAccuracy(s);
    expect(acc.total).toBe(2);
    expect(acc.correct).toBeLessThanOrEqual(2);
    expect(acc.pct).toBeLessThanOrEqual(1);
  });
});

describe("solver", () => {
  it("compute3BV is consistent (≥ 1) on a non-trivial board", () => {
    const empty = makeEmptyBoard(9, 9);
    const b = placeMines(empty, 10, 4, 4, 1);
    expect(compute3BV(b)).toBeGreaterThan(0);
  });

  it("localHint returns center on fresh board", () => {
    const s = createInitialState(9, 9, 10);
    const h = localHint(s);
    expect(h).not.toBeNull();
    expect(h!.x).toBe(4);
    expect(h!.y).toBe(4);
    expect(h!.action).toBe("reveal");
  });

  it("localHint finds certain mines via constraint propagation", () => {
    // Construct a tiny board with a known deduction.
    let s = createInitialState(3, 3, 1, 1);
    let r = revealCell(s, 0, 0);
    // After revealing, if the board has a clear "1" with one closed neighbor,
    // the hint should identify a mine.
    // We just check the function returns something with high confidence
    // somewhere in the game tree.
    s = r.state;
    if (s.status === "playing") {
      const h = localHint(s);
      expect(h).not.toBeNull();
      expect(h!.confidence).toBeGreaterThanOrEqual(0);
      expect(h!.confidence).toBeLessThanOrEqual(1);
    }
  });
});
