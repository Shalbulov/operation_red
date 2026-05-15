"use client";

import { memo, useCallback } from "react";
import { Flag, Bomb, HelpCircle } from "lucide-react";
import type { Cell as CellT } from "@/lib/game/types";
import { cn } from "@/lib/utils/cn";

interface CellProps {
  cell: CellT;
  hinted: boolean;
  exploded: boolean;
  onReveal: (x: number, y: number) => void;
  onFlag: (x: number, y: number) => void;
  onChord: (x: number, y: number) => void;
  size: number;
}

function CellInner({ cell, hinted, exploded, onReveal, onFlag, onChord, size }: CellProps) {
  const { x, y, state, mine, adjacent } = cell;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (state === "open" && adjacent > 0) {
        onChord(x, y);
      } else {
        onReveal(x, y);
      }
    },
    [state, adjacent, x, y, onReveal, onChord],
  );

  const handleContext = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onFlag(x, y);
    },
    [x, y, onFlag],
  );

  // Long-press handling for touch
  let pressTimer: number | null = null;
  let didLongPress = false;

  const handleTouchStart = (e: React.TouchEvent) => {
    didLongPress = false;
    pressTimer = window.setTimeout(() => {
      didLongPress = true;
      onFlag(x, y);
      if (navigator.vibrate) navigator.vibrate(15);
    }, 380);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
    if (!didLongPress) {
      e.preventDefault();
      if (state === "open" && adjacent > 0) onChord(x, y);
      else onReveal(x, y);
    }
  };
  const handleTouchCancel = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  };

  const isOpen = state === "open";
  const isFlag = state === "flag";
  const isQuestion = state === "question";

  const numColorVar = adjacent > 0 ? `var(--num-${adjacent})` : undefined;

  return (
    <button
      type="button"
      aria-label={`Cell ${x},${y}`}
      onClick={handleClick}
      onContextMenu={handleContext}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      style={{
        width: size,
        height: size,
        color: numColorVar,
        fontSize: Math.floor(size * 0.55),
      }}
      className={cn(
        "cell flex items-center justify-center font-mono font-bold",
        "select-none touch-none",
        isOpen && "cell-open",
        isOpen && mine && "cell-mine",
        hinted && "cell-hint",
        exploded && "shake",
      )}
    >
      {isFlag && (
        <Flag
          className="text-red-alert"
          fill="currentColor"
          style={{ width: size * 0.55, height: size * 0.55 }}
        />
      )}
      {isQuestion && (
        <HelpCircle
          className="text-bone-dim"
          style={{ width: size * 0.55, height: size * 0.55 }}
        />
      )}
      {isOpen && mine && (
        <Bomb
          className="text-bone"
          style={{ width: size * 0.6, height: size * 0.6 }}
        />
      )}
      {isOpen && !mine && adjacent > 0 && (
        <span style={{ color: numColorVar }}>{adjacent}</span>
      )}
    </button>
  );
}

export const Cell = memo(CellInner, (a, b) => {
  return (
    a.cell.state === b.cell.state &&
    a.cell.mine === b.cell.mine &&
    a.cell.adjacent === b.cell.adjacent &&
    a.hinted === b.hinted &&
    a.exploded === b.exploded &&
    a.size === b.size
  );
});
