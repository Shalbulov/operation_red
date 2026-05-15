import type { CellState } from "@/lib/game/types";

interface SerializableCell {
  state: CellState;
  adjacent: number;
}

/**
 * Render board as compact text grid for the LLM.
 *  ▢ = closed
 *  ⚑ = flag
 *  ? = question
 *  . = open zero-adjacent
 *  1-8 = open numbered
 */
export function serializeBoard(
  board: SerializableCell[][],
  width: number,
  height: number,
): string {
  const header =
    "    " +
    Array.from({ length: width }, (_, i) => String(i).padStart(2)).join("") +
    "\n";
  const rows: string[] = [];
  for (let y = 0; y < height; y++) {
    const cells: string[] = [];
    for (let x = 0; x < width; x++) {
      const c = board[y][x];
      let ch = "▢";
      if (c.state === "flag") ch = "⚑";
      else if (c.state === "question") ch = "?";
      else if (c.state === "open") {
        ch = c.adjacent === 0 ? "." : String(c.adjacent);
      }
      cells.push(` ${ch}`);
    }
    rows.push(`${String(y).padStart(2)} ${cells.join("")}`);
  }
  return header + rows.join("\n");
}
