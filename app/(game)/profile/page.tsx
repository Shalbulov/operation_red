"use client";

import { useEffect, useState } from "react";
import { User, LogOut, Loader2, Edit2, Trophy } from "lucide-react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatTime } from "@/lib/utils/format";
import { toast } from "sonner";
import { useT } from "@/lib/i18n/useT";

type Profile = {
  id: string;
  username: string | null;
  city: string | null;
  country: string | null;
  avatar_url: string | null;
  coins: number;
  is_pro: boolean;
};

type Game = {
  id: string;
  difficulty: string;
  status: string;
  time_ms: number;
  finished_at: string;
};

export default function ProfilePage() {
  const t = useT();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ username: "", city: "" });
  const [supabaseAvailable, setSupabaseAvailable] = useState(true);

  useEffect(() => {
    const load = async () => {
      let supabase;
      try {
        supabase = createSupabaseBrowserClient();
      } catch {
        setSupabaseAvailable(false);
        setLoading(false);
        return;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(p as Profile);
      if (p) setDraft({ username: p.username ?? "", city: p.city ?? "" });

      const res = await fetch("/api/games?limit=20");
      if (res.ok) {
        const j = await res.json();
        setGames(j.games ?? []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const save = async () => {
    if (!profile) return;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("profiles")
      .update({ username: draft.username || null, city: draft.city || null })
      .eq("id", profile.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setProfile({ ...profile, username: draft.username, city: draft.city });
    setEditing(false);
    toast.success(t("profile.toast.saved"));
  };

  const signOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (!supabaseAvailable) {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="frame-elevated max-w-md p-8 text-center">
          <h1 className="display text-2xl mb-2">SUPABASE НЕ НАСТРОЕН</h1>
          <p className="text-bone-dim text-sm">
            Заполни <code className="mono text-red-alert">.env.local</code>.
          </p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-red-alert" />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="frame-elevated max-w-md p-8 text-center">
          <User className="w-10 h-10 text-red-alert mx-auto mb-4" />
          <h1 className="display text-2xl mb-3">{t("profile.unauthorized.title")}</h1>
          <p className="text-bone-dim text-sm mb-6">
            {t("profile.unauthorized.desc")}
          </p>
          <Link href="/login" className="btn-primary inline-flex">
            {t("profile.btn.login")}
          </Link>
        </div>
      </main>
    );
  }

  const wins = games.filter((g) => g.status === "won").length;
  const losses = games.filter((g) => g.status === "lost").length;
  const winRate = games.length ? Math.round((wins / games.length) * 100) : 0;
  const fastest = games
    .filter((g) => g.status === "won")
    .reduce<{ time: number; diff: string } | null>(
      (acc, g) =>
        !acc || g.time_ms < acc.time
          ? { time: g.time_ms, diff: g.difficulty }
          : acc,
      null,
    );

  return (
    <main className="flex-1 px-3 sm:px-6 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="frame-elevated">
          <div className="flex items-center justify-between border-b border-steel-700 p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 frame flex items-center justify-center">
                <User className="w-8 h-8 text-red-alert" />
              </div>
              <div>
                <span className="tag tag-red mb-1">{t("profile.tag")}</span>
                <h1 className="display text-2xl sm:text-3xl">
                  {profile.username ?? "agent"}
                </h1>
                <div className="mono text-xs text-steel-400 uppercase tracking-widest mt-1">
                  {profile.city ?? "Unknown sector"}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setEditing(!editing)}
                className="btn-ghost flex items-center gap-2 !py-2 !px-3"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{editing ? t("common.cancel") : t("profile.btn.edit")}</span>
              </button>
              <button
                onClick={signOut}
                className="btn-ghost flex items-center gap-2 !py-2 !px-3"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t("profile.btn.signout")}</span>
              </button>
            </div>
          </div>

          {editing && (
            <div className="p-6 space-y-3 border-b border-steel-700 bg-sunken">
              <div>
                <label className="mono text-[10px] text-steel-400 uppercase tracking-widest block mb-1">
                  {t("profile.field.username")}
                </label>
                <input
                  value={draft.username}
                  onChange={(e) => setDraft({ ...draft, username: e.target.value })}
                  className="w-full px-3 py-2 bg-void border border-steel-700 mono text-sm focus:outline-none focus:border-red-alert"
                />
              </div>
              <div>
                <label className="mono text-[10px] text-steel-400 uppercase tracking-widest block mb-1">
                  {t("profile.field.city")}
                </label>
                <input
                  value={draft.city}
                  onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                  className="w-full px-3 py-2 bg-void border border-steel-700 mono text-sm focus:outline-none focus:border-red-alert"
                  placeholder="Almaty"
                />
              </div>
              <button onClick={save} className="btn-primary">
                {t("common.save")}
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-steel-700">
            <Stat label={t("profile.stat.wins")} value={String(wins)} />
            <Stat label={t("profile.stat.losses")} value={String(losses)} />
            <Stat label={t("profile.stat.winrate")} value={`${winRate}%`} />
            <Stat
              label={t("profile.stat.best")}
              value={fastest ? formatTime(fastest.time) : "—"}
              hint={fastest?.diff}
            />
          </div>
        </div>

        {/* Recent games */}
        <div className="frame">
          <div className="flex items-center gap-2 border-b border-steel-700 p-4">
            <Trophy className="w-4 h-4 text-red-alert" />
            <span className="stencil text-sm">{t("profile.history.title")}</span>
          </div>
          {games.length === 0 ? (
            <div className="p-8 text-center text-steel-500 mono text-xs uppercase tracking-widest">
              {t("profile.history.empty")} <Link href="/play" className="text-red-alert underline">{t("profile.history.start")}</Link>
            </div>
          ) : (
            <div>
              {games.map((g, i) => (
                <div
                  key={g.id}
                  className="grid grid-cols-[40px_80px_1fr_80px] gap-px border-t border-steel-700 first:border-t-0"
                >
                  <div className="bg-panel px-3 py-2.5 mono text-xs tabular-nums text-steel-400">
                    {i + 1}
                  </div>
                  <div className="bg-panel px-3 py-2.5">
                    <span
                      className={`tag !text-[9px] ${
                        g.status === "won"
                          ? "border-red-alert text-red-alert"
                          : ""
                      }`}
                    >
                      {g.status === "won" ? "WIN" : g.status === "lost" ? "BOOM" : "—"}
                    </span>
                  </div>
                  <div className="bg-panel px-3 py-2.5 mono text-xs uppercase text-bone-dim">
                    {g.difficulty}
                  </div>
                  <div className="bg-panel px-3 py-2.5 mono text-xs tabular-nums text-right">
                    {formatTime(g.time_ms)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="bg-panel px-4 py-3 text-center">
      <div className="mono text-[10px] uppercase tracking-widest text-steel-500 mb-1">
        {label}
      </div>
      <div className="mono text-xl sm:text-2xl tabular-nums text-bone font-bold">
        {value}
      </div>
      {hint && (
        <div className="mono text-[10px] uppercase tracking-widest text-steel-400 mt-0.5">
          {hint}
        </div>
      )}
    </div>
  );
}
