"use client";

import { DIFFICULTIES } from "@/lib/constants";
import { useGameStore } from "@/lib/stores/gameStore";
import { cn } from "@/lib/utils/cn";

export function DifficultyPicker() {
  const newGame = useGameStore((s) => s.newGame);
  const w = useGameStore((s) => s.width);
  const h = useGameStore((s) => s.height);
  const m = useGameStore((s) => s.mines);

  const matches = (cw: number, ch: number, cm: number) =>
    cw === w && ch === h && cm === m;

  return (
    <div className="flex flex-wrap gap-px bg-steel-700 border border-steel-700 p-px">
      {Object.values(DIFFICULTIES).map((d) => {
        const active = matches(d.width, d.height, d.mines);
        return (
          <button
            key={d.id}
            onClick={() => newGame(d.width, d.height, d.mines)}
            className={cn(
              "mono text-xs font-bold uppercase tracking-widest px-4 py-3 transition-colors",
              active
                ? "bg-red-alert text-void"
                : "bg-panel text-bone-dim hover:bg-elevated hover:text-bone",
            )}
          >
            {d.label}
            <span className="ml-2 opacity-60 text-[10px]">
              {d.width}×{d.height}
            </span>
          </button>
        );
      })}
    </div>
  );
}
