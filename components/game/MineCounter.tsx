"use client";

import { useGameStore } from "@/lib/stores/gameStore";
import { pad3 } from "@/lib/utils/format";
import { useT } from "@/lib/i18n/useT";

export function MineCounter() {
  const t = useT();
  const mines = useGameStore((s) => s.mines);
  const flagsPlaced = useGameStore((s) => s.flagsPlaced);
  const remaining = Math.max(0, mines - flagsPlaced);

  return (
    <div className="frame flex flex-col items-center px-4 py-2 min-w-[110px]">
      <span className="mono text-[10px] uppercase tracking-widest text-steel-500 mb-0.5">
        {t("play.hud.mines")}
      </span>
      <span className="mono text-2xl tabular-nums text-bone font-bold">
        {pad3(remaining)}
      </span>
    </div>
  );
}
