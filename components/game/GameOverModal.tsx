"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/stores/gameStore";
import { useInventoryStore } from "@/lib/stores/inventoryStore";
import { formatTime } from "@/lib/utils/format";
import { computeFlagAccuracy } from "@/lib/game/engine";
import { Trophy, Skull, RotateCw, Coins, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function GameOverModal() {
  const status = useGameStore((s) => s.status);
  const startedAt = useGameStore((s) => s.startedAt);
  const endedAt = useGameStore((s) => s.endedAt);
  const width = useGameStore((s) => s.width);
  const height = useGameStore((s) => s.height);
  const mines = useGameStore((s) => s.mines);
  const newGame = useGameStore((s) => s.newGame);
  const fullState = useGameStore((s) => s);

  const addCoins = useInventoryStore((s) => s.addCoins);
  const [dismissed, setDismissed] = useState(false);
  const [coinsAwarded, setCoinsAwarded] = useState(0);

  const open = (status === "won" || status === "lost") && !dismissed;

  // Award coins once per game-over
  useEffect(() => {
    if (status === "won" && coinsAwarded === 0) {
      // Reward scaled by mine count
      const base = Math.max(5, Math.round(mines * 0.6));
      addCoins(base);
      setCoinsAwarded(base);
    }
    if (status === "playing" || status === "idle") {
      setCoinsAwarded(0);
      setDismissed(false);
    }
  }, [status, mines, addCoins, coinsAwarded]);

  if (!open) return null;

  const ms = startedAt && endedAt ? endedAt - startedAt : 0;
  const acc = computeFlagAccuracy(fullState);
  const won = status === "won";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm safe-bottom">
      <div className="relative w-full sm:max-w-md frame-elevated">
        {/* header */}
        <div
          className={cn(
            "px-6 py-4 border-b border-steel-700 flex items-center justify-between",
            won ? "bg-red-blood/30" : "bg-steel-900",
          )}
        >
          <div className="flex items-center gap-3">
            {won ? (
              <Trophy className="w-6 h-6 text-red-alert" />
            ) : (
              <Skull className="w-6 h-6 text-red-alert" />
            )}
            <h2 className="display text-2xl">
              {won ? "ПОЛЕ ОЧИЩЕНО" : "ПОДРЫВ"}
            </h2>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-steel-400 hover:text-bone"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* stats */}
        <div className="grid grid-cols-3 gap-px bg-steel-700">
          <Stat label="ВРЕМЯ" value={formatTime(ms)} />
          <Stat label="ТОЧНОСТЬ" value={`${Math.round(acc.pct * 100)}%`} />
          <Stat label="ПОЛЕ" value={`${width}×${height}`} />
        </div>

        {/* coins */}
        {won && coinsAwarded > 0 && (
          <div className="px-6 py-4 bg-panel flex items-center justify-between border-t border-steel-700">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-red-alert" />
              <span className="mono text-xs uppercase tracking-widest text-steel-300">
                Награда
              </span>
            </div>
            <span className="mono text-xl font-bold text-red-alert">
              +{coinsAwarded}
            </span>
          </div>
        )}

        {/* actions */}
        <div className="p-4 grid grid-cols-2 gap-2 bg-panel border-t border-steel-700">
          <button
            onClick={() => {
              setDismissed(true);
              newGame(width, height, mines);
            }}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <RotateCw className="w-4 h-4" />
            Снова
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="btn-ghost"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-panel px-4 py-3 text-center">
      <div className="mono text-[10px] uppercase tracking-widest text-steel-500 mb-1">
        {label}
      </div>
      <div className="mono text-lg tabular-nums text-bone font-bold">
        {value}
      </div>
    </div>
  );
}
