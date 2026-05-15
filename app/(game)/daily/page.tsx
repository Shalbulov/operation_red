"use client";

import { useEffect, useState } from "react";
import { Board } from "@/components/game/Board";
import { Timer } from "@/components/game/Timer";
import { MineCounter } from "@/components/game/MineCounter";
import { AICoachPanel } from "@/components/game/AICoachPanel";
import { GameOverModal } from "@/components/game/GameOverModal";
import { useGameStore } from "@/lib/stores/gameStore";
import { Radio, Trophy, Loader2 } from "lucide-react";
import { formatTime } from "@/lib/utils/format";
import { computeFlagAccuracy } from "@/lib/game/engine";
import { compute3BV } from "@/lib/game/solver";

interface Challenge {
  date: string;
  seed: number;
  width: number;
  height: number;
  mines: number;
}

interface ResultEntry {
  user_id: string;
  status: "won" | "lost";
  time_ms: number;
  finished_at: string;
  profiles: { username: string | null; city: string | null; is_pro: boolean };
}

export default function DailyPage() {
  const newGame = useGameStore((s) => s.newGame);
  const status = useGameStore((s) => s.status);
  const state = useGameStore((s) => s);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [results, setResults] = useState<ResultEntry[]>([]);
  const [reported, setReported] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch today's challenge and seed the board
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/daily");
        if (!res.ok) return;
        const c = await res.json();
        setChallenge(c);
        newGame(c.width, c.height, c.mines, c.seed);
        const lr = await fetch(`/api/daily/result?date=${c.date}`);
        if (lr.ok) {
          const j = await lr.json();
          setResults(j.results ?? []);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Submit result when finished
  useEffect(() => {
    if (!challenge) return;
    if (status !== "won" && status !== "lost") {
      setReported(false);
      return;
    }
    if (reported) return;
    setReported(true);
    const ms = state.endedAt && state.startedAt ? state.endedAt - state.startedAt : 0;
    const acc = computeFlagAccuracy(state);
    const tbv = compute3BV(state.board);
    fetch("/api/daily/result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: challenge.date,
        status,
        time_ms: ms,
        three_bv: tbv,
        flags_correct: acc.correct,
        flags_total: acc.total,
        hints_used: state.hintsUsed,
      }),
    })
      .then(() => fetch(`/api/daily/result?date=${challenge.date}`))
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j && setResults(j.results ?? []))
      .catch(() => {});
  }, [status, challenge, reported, state]);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-red-alert" />
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col px-3 sm:px-6 py-4 sm:py-6 gap-4">
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <Radio className="w-5 h-5 text-red-alert" />
        <span className="tag tag-red">
          <span className="block w-1.5 h-1.5 bg-red-alert animate-pulse" />
          DAILY · {challenge?.date}
        </span>
        {challenge && (
          <span className="tag">
            {challenge.width}×{challenge.height} / {challenge.mines} MINES
          </span>
        )}
        <span className="h-px flex-1 bg-steel-700" />
      </div>

      <div className="frame-elevated p-4 sm:p-6">
        <h1 className="display text-2xl sm:text-4xl mb-2">
          СЕГОДНЯШНЕЕ <span className="text-red-alert">ПОЛЕ</span>
        </h1>
        <p className="text-bone-dim text-sm">
          Одно поле для всех игроков мира. Один шанс. Покажи лучшее время.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Timer />
        <MineCounter />
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1">
        <div className="flex-1 min-w-0">
          <Board />
        </div>
        <aside className="lg:w-80 flex flex-col gap-3">
          <AICoachPanel />
          <div className="frame">
            <div className="flex items-center gap-2 border-b border-steel-700 p-3">
              <Trophy className="w-3.5 h-3.5 text-red-alert" />
              <span className="stencil text-xs">DAILY LEADERBOARD</span>
            </div>
            <div className="max-h-72 overflow-auto">
              {results.length === 0 ? (
                <div className="p-4 text-center text-steel-500 mono text-[10px] uppercase tracking-widest">
                  Будь первым сегодня
                </div>
              ) : (
                results.slice(0, 20).map((r, i) => (
                  <div
                    key={r.user_id}
                    className="flex items-center gap-2 px-3 py-2 border-t border-steel-700 first:border-t-0 text-xs"
                  >
                    <span className="mono tabular-nums text-steel-400 w-6">
                      {i + 1}
                    </span>
                    <span className="flex-1 truncate text-bone">
                      {r.profiles?.username ?? "agent"}
                    </span>
                    <span
                      className={`mono tabular-nums font-bold ${r.status === "won" ? "text-red-alert" : "text-steel-500"}`}
                    >
                      {r.status === "won" ? formatTime(r.time_ms) : "BOOM"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      <GameOverModal />
    </main>
  );
}
