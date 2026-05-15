"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/lib/stores/gameStore";
import { computeFlagAccuracy } from "@/lib/game/engine";
import { compute3BV } from "@/lib/game/solver";
import { DIFFICULTIES } from "@/lib/constants";

interface GameReporterProps {
  difficulty?: "easy" | "medium" | "hard" | "custom" | "daily";
}

/**
 * Watches game store; when status transitions to won/lost, POSTs result to
 * /api/games. Silent on errors (network/unauth/etc.) — local play still works.
 */
export function GameReporter({ difficulty = "easy" }: GameReporterProps) {
  const status = useGameStore((s) => s.status);
  const state = useGameStore((s) => s);
  const reportedRef = useRef<string>("");

  useEffect(() => {
    if (status !== "won" && status !== "lost") {
      reportedRef.current = "";
      return;
    }
    const sig = `${state.startedAt}-${state.endedAt}-${status}`;
    if (reportedRef.current === sig) return;
    reportedRef.current = sig;

    const ms = state.endedAt && state.startedAt ? state.endedAt - state.startedAt : 0;
    const acc = computeFlagAccuracy(state);
    const tbv = compute3BV(state.board);

    fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        difficulty,
        width: state.width,
        height: state.height,
        mines: state.mines,
        status,
        time_ms: ms,
        three_bv: tbv,
        flags_correct: acc.correct,
        flags_total: acc.total,
        hints_used: state.hintsUsed,
        seed: state.seed ?? null,
      }),
    }).catch(() => {
      /* offline / unauthenticated — silent */
    });
  }, [status, state, difficulty]);

  return null;
}

/** Helper: pick difficulty label from current dimensions. */
export function difficultyFromDims(w: number, h: number, m: number) {
  for (const d of Object.values(DIFFICULTIES)) {
    if (d.width === w && d.height === h && d.mines === m) return d.id;
  }
  return "custom" as const;
}
