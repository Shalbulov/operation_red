export type CellState = "closed" | "open" | "flag" | "question";

export interface Cell {
  x: number;
  y: number;
  mine: boolean;
  adjacent: number; // 0-8
  state: CellState;
}

export type Board = Cell[][];

export type GameStatus = "idle" | "playing" | "won" | "lost";

export interface GameState {
  board: Board;
  width: number;
  height: number;
  mines: number;
  status: GameStatus;
  flagsPlaced: number;
  cellsOpened: number;
  startedAt: number | null;
  endedAt: number | null;
  firstMoveMade: boolean;
  seed: number | null;
  hintsUsed: number;
  lastHint: { x: number; y: number; action: "reveal" | "flag" } | null;
}

export interface RevealResult {
  state: GameState;
  exploded: { x: number; y: number } | null;
}
