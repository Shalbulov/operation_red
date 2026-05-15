"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/stores/gameStore";
import { formatTime } from "@/lib/utils/format";

export function Timer() {
  const startedAt = useGameStore((s) => s.startedAt);
  const endedAt = useGameStore((s) => s.endedAt);
  const status = useGameStore((s) => s.status);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (status !== "playing" || !startedAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 80);
    return () => clearInterval(id);
  }, [status, startedAt]);

  const ms = startedAt ? (endedAt ?? now) - startedAt : 0;

  return (
    <div className="frame flex flex-col items-center px-4 py-2 min-w-[110px]">
      <span className="mono text-[10px] uppercase tracking-widest text-steel-500 mb-0.5">
        TIME
      </span>
      <span className="mono text-2xl tabular-nums text-red-alert font-bold">
        {formatTime(ms)}
      </span>
    </div>
  );
}
