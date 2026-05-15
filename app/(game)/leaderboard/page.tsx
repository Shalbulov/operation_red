"use client";

import { useEffect, useState } from "react";
import { Trophy, Filter } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatTime } from "@/lib/utils/format";

type Entry = {
  id: string;
  time_ms: number;
  three_bv: number | null;
  finished_at: string;
  user_id: string;
  profiles: {
    username: string | null;
    city: string | null;
    country: string | null;
    avatar_url: string | null;
    is_pro: boolean;
  };
};

const DIFFS = ["easy", "medium", "hard", "daily"] as const;
type Diff = (typeof DIFFS)[number];

export default function LeaderboardPage() {
  const [diff, setDiff] = useState<Diff>("medium");
  const [city, setCity] = useState<string>("");
  const [data, setData] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const params = new URLSearchParams({ difficulty: diff });
      if (city) params.set("city", city);
      try {
        const res = await fetch(`/api/leaderboard?${params}`);
        if (!res.ok) {
          setData([]);
          return;
        }
        const j = await res.json();
        setData(j.results ?? []);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [diff, city]);

  return (
    <main className="flex-1 px-3 sm:px-6 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-3">
          <Trophy className="w-5 h-5 text-red-alert" />
          <span className="tag tag-red">ЛИДЕРБОРД</span>
          <span className="h-px flex-1 bg-steel-700" />
        </div>
        <h1 className="display text-4xl sm:text-5xl mb-6">
          ТОП <span className="text-red-alert">САПЁРОВ</span>
        </h1>

        {/* Filter strip */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-px bg-steel-700 border border-steel-700">
            {DIFFS.map((d) => (
              <button
                key={d}
                onClick={() => setDiff(d)}
                className={cn(
                  "mono text-xs font-bold uppercase tracking-widest px-3 sm:px-4 py-2 transition-colors",
                  diff === d
                    ? "bg-red-alert text-void"
                    : "bg-panel text-bone-dim hover:bg-elevated hover:text-bone",
                )}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-steel-400" />
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="фильтр по городу"
              className="px-3 py-2 bg-sunken border border-steel-700 mono text-xs placeholder:text-steel-500 focus:outline-none focus:border-red-alert"
            />
          </div>
        </div>

        {/* Table */}
        <div className="frame">
          <div className="grid grid-cols-[40px_1fr_120px_80px] sm:grid-cols-[60px_1fr_180px_120px] gap-px bg-steel-700 mono text-[10px] uppercase tracking-widest text-steel-400">
            <div className="bg-sunken px-3 py-2">#</div>
            <div className="bg-sunken px-3 py-2">АГЕНТ</div>
            <div className="bg-sunken px-3 py-2 hidden sm:block">ГОРОД</div>
            <div className="bg-sunken px-3 py-2 text-right">ВРЕМЯ</div>
          </div>

          {loading && (
            <div className="px-3 py-12 text-center text-steel-500 mono text-xs uppercase tracking-widest">
              Сканирование...
            </div>
          )}

          {!loading && data.length === 0 && (
            <div className="px-3 py-12 text-center text-steel-500 mono text-xs uppercase tracking-widest">
              Пока никто не победил. Будь первым.
            </div>
          )}

          {!loading &&
            data.map((row, i) => (
              <div
                key={row.id}
                className={cn(
                  "grid grid-cols-[40px_1fr_120px_80px] sm:grid-cols-[60px_1fr_180px_120px] gap-px bg-steel-700 text-sm border-t border-steel-700",
                )}
              >
                <div className="bg-panel px-3 py-3 mono tabular-nums text-steel-400">
                  {i + 1}
                </div>
                <div className="bg-panel px-3 py-3 flex items-center gap-2">
                  <span className="text-bone truncate">
                    {row.profiles?.username ?? "agent"}
                  </span>
                  {row.profiles?.is_pro && (
                    <span className="tag tag-red !text-[9px] !px-1.5 !py-0.5">
                      PRO
                    </span>
                  )}
                </div>
                <div className="bg-panel px-3 py-3 hidden sm:flex items-center text-bone-dim text-xs">
                  {row.profiles?.city ?? "—"}
                </div>
                <div className="bg-panel px-3 py-3 mono text-right tabular-nums text-red-alert font-bold">
                  {formatTime(row.time_ms)}
                </div>
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}
