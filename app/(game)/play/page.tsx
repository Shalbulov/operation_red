"use client";

import { useEffect } from "react";
import { Board } from "@/components/game/Board";
import { Timer } from "@/components/game/Timer";
import { MineCounter } from "@/components/game/MineCounter";
import { DifficultyPicker } from "@/components/game/DifficultyPicker";
import { AICoachPanel } from "@/components/game/AICoachPanel";
import { GameOverModal } from "@/components/game/GameOverModal";
import { GameReporter, difficultyFromDims } from "@/components/game/GameReporter";
import { useGameStore } from "@/lib/stores/gameStore";
import { DIFFICULTIES } from "@/lib/constants";
import { RotateCw } from "lucide-react";

export default function PlayPage() {
  const newGame = useGameStore((s) => s.newGame);
  const width = useGameStore((s) => s.width);
  const height = useGameStore((s) => s.height);
  const mines = useGameStore((s) => s.mines);
  const firstMoveMade = useGameStore((s) => s.firstMoveMade);

  // Initialize once on mount (default easy)
  useEffect(() => {
    if (!firstMoveMade) {
      const d = DIFFICULTIES.easy;
      newGame(d.width, d.height, d.mines);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="flex-1 flex flex-col px-3 sm:px-6 py-4 sm:py-6 gap-4">
      {/* Mission header */}
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="tag tag-red">
          <span className="block w-1.5 h-1.5 bg-red-alert animate-pulse" />
          MISSION ACTIVE
        </span>
        <span className="tag hidden sm:inline-flex">
          {width}×{height} / {mines} MINES
        </span>
        <span className="h-px flex-1 bg-steel-700" />
        <button
          onClick={() => newGame(width, height, mines)}
          className="btn-ghost flex items-center gap-2 !py-2 !px-3"
          aria-label="Restart"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">RESTART</span>
        </button>
      </div>

      {/* Difficulty picker */}
      <DifficultyPicker />

      {/* HUD strip */}
      <div className="flex items-center gap-2 flex-wrap">
        <Timer />
        <MineCounter />
      </div>

      {/* Layout: board + AI panel side-by-side on desktop */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1">
        <div className="flex-1 min-w-0">
          <Board />
        </div>
        <aside className="lg:w-80 flex flex-col gap-3">
          <AICoachPanel />
          <div className="frame p-4 text-bone-dim text-xs leading-relaxed">
            <div className="stencil text-xs text-bone mb-2">УПРАВЛЕНИЕ</div>
            <ul className="space-y-1.5">
              <li>
                <span className="mono text-red-alert">CLICK</span> — открыть клетку
              </li>
              <li>
                <span className="mono text-red-alert">RIGHT-CLICK</span> — флаг
              </li>
              <li>
                <span className="mono text-red-alert">CLICK</span> на цифре —
                открыть соседей (chord)
              </li>
              <li className="lg:hidden">
                <span className="mono text-red-alert">LONG-PRESS</span> — флаг
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <GameOverModal />
      <GameReporter difficulty={difficultyFromDims(width, height, mines)} />
    </main>
  );
}
