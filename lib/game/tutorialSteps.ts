import type { TranslationKey } from "@/lib/i18n/dictionaries";

export type TutorialCellState = "closed" | "open" | "flag" | "mine";

export interface TutorialCell {
  state: TutorialCellState;
  /** 0..8, only relevant when state is "open" and not a mine */
  adjacent: number;
  /** True if this cell is a mine (used after wrong clicks / for "reveal-all" demos). */
  isMine: boolean;
}

export type Action = "reveal" | "flag" | "chord";

export interface TutorialStep {
  id: number;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  taskKey?: TranslationKey;
  successKey?: TranslationKey;
  /** Frozen board state. If undefined, this is a presentation-only step. */
  board?: TutorialCell[][];
  /** Cell to highlight (visual cue for the user). */
  highlight?: { x: number; y: number };
  /** Correct interaction; undefined → "Next" advances immediately. */
  expected?: { x: number; y: number; action: Action };
}

/* =========================================================================
   BOARD PARSER
   ---
   Each cell is one character:
     '.' = closed safe (could be opened)
     'M' = closed mine
     'F' = flag (always on a mine in tutorial)
     '0'-'8' = open with that adjacent count
   Whitespace is allowed between cells for readability.
   ========================================================================= */
function parseBoard(rows: string[]): TutorialCell[][] {
  return rows.map((row) => {
    const cleaned = row.replace(/\s+/g, "");
    return Array.from(cleaned).map((ch): TutorialCell => {
      if (ch === ".") return { state: "closed", adjacent: 0, isMine: false };
      if (ch === "M") return { state: "closed", adjacent: 0, isMine: true };
      if (ch === "F") return { state: "flag", adjacent: 0, isMine: true };
      if (/^[0-8]$/.test(ch))
        return { state: "open", adjacent: Number(ch), isMine: false };
      // Unknown char — treat as closed safe
      return { state: "closed", adjacent: 0, isMine: false };
    });
  });
}

/* =========================================================================
   STEP CONFIGS — 7 steps total
   ========================================================================= */

// Step 1 — visual: a "won" board (everything opened, mines flagged)
const STEP_1_BOARD = parseBoard([
  "1 1 1 0 0",
  "1 F 1 0 0",
  "1 1 1 0 0",
  "0 0 0 1 1",
  "0 0 0 1 F",
]);

// Step 2 — empty board, expecting click in the center
const STEP_2_BOARD = parseBoard([
  ". . . . . . .",
  ". . . . . . .",
  ". . . . . . .",
  ". . . . . . .",
  ". . . . . . .",
  ". . . . . . .",
  ". . . . . . .",
]);

// Step 3 — visual: a "1" surrounded by 8 closed cells (one is the mine)
const STEP_3_BOARD = parseBoard([
  ". . . . .",
  ". . . . .",
  ". . 1 . .",
  ". . . . .",
  ". . . . .",
]);

// Step 4 — a "1" with seven open neighbors and ONE closed mine.
// The closed cell at (4, 2) is the mine; user must flag it.
const STEP_4_BOARD = parseBoard([
  "0 0 0 0 0",
  "0 0 0 0 0",
  "0 0 1 . M",
  "0 0 0 0 0",
  "0 0 0 0 0",
]);
// Mine is at (4, 2). Surrounding the "1" at (3, 2):
// (2,1)=0, (3,1)=0, (4,1)=0, (2,2)=0, (4,2)=M, (2,3)=0, (3,3)=0, (4,3)=0.
// We want only ONE closed neighbor of the "1" — let's redefine:
const STEP_4_BOARD_FIXED = parseBoard([
  "0 0 0 0 0",
  "0 0 0 0 0",
  "0 0 1 . .",
  "0 0 0 0 0",
  "0 0 0 0 0",
]);
// Hmm — that gives 2 closed neighbors (3,2)=. and (4,2)=. but the "1" is at (2,2).
// Neighbors of (2,2): (1,1)(2,1)(3,1)(1,2)(3,2)(1,3)(2,3)(3,3).
// (3,2) is closed, (4,2) is closed but not a neighbor of (2,2).
// So actually we only need (3,2) to be the mine.

const STEP_4_FINAL = parseBoard([
  "0 0 0 0 0",
  "0 0 0 0 0",
  "0 0 1 M 0",
  "0 0 0 0 0",
  "0 0 0 0 0",
]);
// "1" at (2,2). Mine at (3,2). All other neighbors are 0 (open). Perfect.

// Step 5 — a "2" with 2 flags adjacent + 1 closed safe cell. User clicks the safe.
// "2" at (2,2). Mines flagged at (1,1) and (3,1). Safe closed at (3,3).
const STEP_5_BOARD = parseBoard([
  "0 0 0 0 0",
  "0 F 0 F 0",
  "0 0 2 0 0",
  "0 0 0 . 0",
  "0 0 0 0 0",
]);
// Neighbors of "2" at (2,2): (1,1)=F (mine), (2,1)=0, (3,1)=F (mine), (1,2)=0, (3,2)=0, (1,3)=0, (2,3)=0, (3,3)=.
// 2 flagged mines → the "2" is satisfied → (3,3) is guaranteed safe.

// Step 6 — chord: "2" at (2,2) with 2 flags + several closed safe cells around it.
// User clicks the "2" (already open) → chord opens all unflagged neighbors.
const STEP_6_BOARD = parseBoard([
  "0 0 0 0 0",
  "0 F . F 0",
  "0 . 2 . 0",
  "0 . . . 0",
  "0 0 0 0 0",
]);
// "2" at (2,2), flags at (1,1) and (3,1). 5 closed safe cells around.
// User clicks the "2" → all 5 closed neighbors open at once.

// Step 7 — visual: a satisfying victory state
const STEP_7_BOARD = parseBoard([
  "F 1 0 0 0",
  "1 1 0 0 0",
  "0 0 0 1 1",
  "0 0 0 1 F",
  "0 0 0 1 1",
]);

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    titleKey: "tut.s1.title",
    descKey: "tut.s1.desc",
    board: STEP_1_BOARD,
    // No expected → "Next" enabled immediately
  },
  {
    id: 2,
    titleKey: "tut.s2.title",
    descKey: "tut.s2.desc",
    taskKey: "tut.s2.task",
    successKey: "tut.s2.success",
    board: STEP_2_BOARD,
    highlight: { x: 3, y: 3 },
    expected: { x: 3, y: 3, action: "reveal" },
  },
  {
    id: 3,
    titleKey: "tut.s3.title",
    descKey: "tut.s3.desc",
    board: STEP_3_BOARD,
    highlight: { x: 2, y: 2 },
  },
  {
    id: 4,
    titleKey: "tut.s4.title",
    descKey: "tut.s4.desc",
    taskKey: "tut.s4.task",
    successKey: "tut.s4.success",
    board: STEP_4_FINAL,
    highlight: { x: 3, y: 2 },
    expected: { x: 3, y: 2, action: "flag" },
  },
  {
    id: 5,
    titleKey: "tut.s5.title",
    descKey: "tut.s5.desc",
    taskKey: "tut.s5.task",
    successKey: "tut.s5.success",
    board: STEP_5_BOARD,
    highlight: { x: 3, y: 3 },
    expected: { x: 3, y: 3, action: "reveal" },
  },
  {
    id: 6,
    titleKey: "tut.s6.title",
    descKey: "tut.s6.desc",
    taskKey: "tut.s6.task",
    successKey: "tut.s6.success",
    board: STEP_6_BOARD,
    highlight: { x: 2, y: 2 },
    expected: { x: 2, y: 2, action: "chord" },
  },
  {
    id: 7,
    titleKey: "tut.s7.title",
    descKey: "tut.s7.desc",
    board: STEP_7_BOARD,
  },
];

// Suppress unused warning — kept for clarity that fix iterations were considered
void STEP_4_BOARD;
void STEP_4_BOARD_FIXED;
