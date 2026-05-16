"use client";

import { useEffect, useState } from "react";
import { Flag, Bomb } from "lucide-react";
import type {
  TutorialCell,
  Action,
} from "@/lib/game/tutorialSteps";
import { cn } from "@/lib/utils/cn";

interface TutorialBoardProps {
  board: TutorialCell[][];
  highlight?: { x: number; y: number };
  expected?: { x: number; y: number; action: Action };
  onCorrect?: () => void;
  onWrong?: () => void;
}

/**
 * Frozen mini-board for tutorial steps. The user can only interact in the
 * way the step expects; other clicks shake the board and trigger onWrong.
 * After a correct action the board mutates (e.g. flag appears, chord-opens
 * neighbors) then onCorrect fires.
 */
export function TutorialBoard({
  board: initial,
  highlight,
  expected,
  onCorrect,
  onWrong,
}: TutorialBoardProps) {
  const [board, setBoard] = useState(initial);
  const [shake, setShake] = useState(false);
  const [solved, setSolved] = useState(false);

  // Reset when input board changes (advancing steps)
  useEffect(() => {
    setBoard(initial);
    setShake(false);
    setSolved(false);
  }, [initial]);

  const height = board.length;
  const width = board[0]?.length ?? 0;
  const cellSize = Math.min(48, Math.max(28, Math.floor(360 / width)));

  const handle = (x: number, y: number, action: Action) => {
    if (solved || !expected) return;
    if (x !== expected.x || y !== expected.y || action !== expected.action) {
      setShake(true);
      onWrong?.();
      if (navigator.vibrate) navigator.vibrate(30);
      window.setTimeout(() => setShake(false), 400);
      return;
    }

    // Apply the action to the board visually
    const next = board.map((row) => row.map((c) => ({ ...c })));
    const cell = next[y][x];
    if (action === "flag") {
      cell.state = "flag";
    } else if (action === "reveal") {
      cell.state = "open";
      cell.adjacent = 0;
    } else if (action === "chord") {
      // Open all closed (non-flag) neighbors
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          const n = next[ny][nx];
          if (n.state === "closed" && !n.isMine) {
            n.state = "open";
          }
        }
      }
    }

    setBoard(next);
    setSolved(true);
    if (navigator.vibrate) navigator.vibrate(15);
    window.setTimeout(() => onCorrect?.(), 480);
  };

  const handleClick = (x: number, y: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    const cell = board[y][x];
    if (cell.state === "open" && cell.adjacent > 0) {
      handle(x, y, "chord");
    } else {
      handle(x, y, "reveal");
    }
  };

  const handleContext = (x: number, y: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    handle(x, y, "flag");
  };

  // long-press support for mobile
  let pressTimer: number | null = null;
  let didLongPress = false;

  const handleTouchStart = (x: number, y: number) => () => {
    didLongPress = false;
    pressTimer = window.setTimeout(() => {
      didLongPress = true;
      handle(x, y, "flag");
    }, 380);
  };
  const handleTouchEnd = (x: number, y: number) => (e: React.TouchEvent) => {
    if (pressTimer) clearTimeout(pressTimer);
    if (!didLongPress) {
      e.preventDefault();
      const cell = board[y][x];
      if (cell.state === "open" && cell.adjacent > 0) handle(x, y, "chord");
      else handle(x, y, "reveal");
    }
  };

  return (
    <div className="flex justify-center w-full">
      <div
        className={cn(
          "frame-elevated p-1 inline-block",
          shake && "shake",
        )}
        data-skin="ops"
      >
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${height}, ${cellSize}px)`,
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {board.map((row, y) =>
            row.map((cell, x) => {
              const isHighlighted =
                highlight?.x === x && highlight?.y === y && !solved;
              const isOpen = cell.state === "open";
              const isFlag = cell.state === "flag";
              const isMine = cell.isMine && isOpen;
              const numColor =
                cell.adjacent > 0 ? `var(--num-${cell.adjacent})` : undefined;

              return (
                <button
                  type="button"
                  key={`${x}-${y}`}
                  onClick={handleClick(x, y)}
                  onContextMenu={handleContext(x, y)}
                  onTouchStart={handleTouchStart(x, y)}
                  onTouchEnd={handleTouchEnd(x, y)}
                  className={cn(
                    "cell flex items-center justify-center select-none touch-none",
                    isOpen && "cell-open",
                    isMine && "cell-mine",
                    isHighlighted && "cell-hint",
                  )}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    fontSize: Math.floor(cellSize * 0.55),
                    color: numColor,
                  }}
                >
                  {isFlag && (
                    <Flag
                      fill="currentColor"
                      className="text-red-alert"
                      style={{ width: cellSize * 0.55, height: cellSize * 0.55 }}
                    />
                  )}
                  {isMine && (
                    <Bomb
                      className="text-bone"
                      style={{ width: cellSize * 0.6, height: cellSize * 0.6 }}
                    />
                  )}
                  {isOpen && !isMine && cell.adjacent > 0 && (
                    <span style={{ color: numColor }}>{cell.adjacent}</span>
                  )}
                </button>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}
