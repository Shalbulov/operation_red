"use client";

import { useState } from "react";
import { Brain, Sparkles, Loader2, AlertTriangle, Calculator, Cpu } from "lucide-react";
import { toast } from "sonner";
import { useGameStore } from "@/lib/stores/gameStore";
import { useInventoryStore } from "@/lib/stores/inventoryStore";
import { localHint } from "@/lib/game/solver";
import { AI_LIMITS } from "@/lib/constants";

interface AIResponse {
  x: number;
  y: number;
  action: "reveal" | "flag";
  confidence: number;
  reasoning: string;
  source?: "solver" | "ai" | "heuristic";
  fallback?: boolean;
}

export function AICoachPanel() {
  const state = useGameStore((s) => s);
  const setHint = useGameStore((s) => s.setHint);
  const incHints = useGameStore((s) => s.incHints);
  const hintsUsed = useGameStore((s) => s.hintsUsed);
  const status = useGameStore((s) => s.status);
  const isPro = useInventoryStore((s) => s.isPro);

  const [loading, setLoading] = useState(false);
  const [last, setLast] = useState<AIResponse | null>(null);

  const limit = isPro ? AI_LIMITS.proHintsPerGame : AI_LIMITS.freeHintsPerGame;
  const remaining = limit - hintsUsed;

  const requestHint = async () => {
    if (status !== "playing" && status !== "idle") {
      toast.error("Игра не идёт");
      return;
    }
    if (remaining <= 0) {
      toast.error(`Лимит исчерпан (${limit}). Upgrade to Pro.`);
      return;
    }
    setLoading(true);
    try {
      // Try server (Gemini) first; fall back to local solver on error.
      const board = state.board.map((row) =>
        row.map((c) => ({
          state: c.state,
          adjacent: c.adjacent,
        })),
      );
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          board,
          width: state.width,
          height: state.height,
          mines: state.mines,
          flagsPlaced: state.flagsPlaced,
        }),
      });
      let data: AIResponse;
      if (res.ok) {
        data = await res.json();
      } else {
        throw new Error("ai-coach unavailable");
      }
      setLast(data);
      setHint({ x: data.x, y: data.y, action: data.action });
      incHints();
    } catch {
      // local fallback
      const h = localHint(state);
      if (!h) {
        toast.error("Не могу подсказать на пустом поле");
        setLoading(false);
        return;
      }
      const data: AIResponse = { ...h };
      setLast(data);
      setHint({ x: data.x, y: data.y, action: data.action });
      incHints();
      toast("AI offline — локальный анализ", { duration: 2000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="frame p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-red-alert" />
          <span className="stencil text-sm">AI COACH</span>
        </div>
        <span className="mono text-[10px] text-steel-400 uppercase tracking-widest">
          {isPro ? "PRO ∞" : `${remaining}/${limit}`}
        </span>
      </div>

      <button
        type="button"
        onClick={requestHint}
        disabled={loading || remaining <= 0 || status === "won" || status === "lost"}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {loading ? "Анализ..." : "Получить подсказку"}
      </button>

      {last && (
        <div className="mt-3 border-t border-steel-700 pt-3">
          <div className="flex items-center justify-between mb-2 gap-2">
            <span className="tag tag-red">
              {last.action === "reveal" ? "ОТКРЫТЬ" : "ФЛАГ"} ({last.x}, {last.y})
            </span>
            <span className="mono text-[10px] text-steel-400 uppercase tracking-widest">
              {Math.round(last.confidence * 100)}%
            </span>
          </div>

          {/* Source badge */}
          <div className="flex items-center gap-1.5 mb-2">
            {last.source === "solver" ? (
              <span
                className="tag flex items-center gap-1 !text-[9px] border-red-alert text-red-alert"
                title="Логически выведено — 100% надёжно"
              >
                <Calculator className="w-2.5 h-2.5" />
                SOLVER · 100%
              </span>
            ) : last.source === "ai" ? (
              <span
                className="tag flex items-center gap-1 !text-[9px]"
                title="Ответ от Gemini AI"
              >
                <Cpu className="w-2.5 h-2.5" />
                GEMINI AI
              </span>
            ) : (
              <span className="tag flex items-center gap-1 !text-[9px]">
                <Brain className="w-2.5 h-2.5" />
                ЭВРИСТИКА
              </span>
            )}
          </div>

          <p className="text-bone-dim text-xs leading-relaxed">{last.reasoning}</p>

          {/* AI-fallibility disclaimer — only for AI / heuristic */}
          {last.source !== "solver" && last.confidence < 1 && (
            <div className="mt-2 flex items-start gap-1.5 text-[10px] text-steel-500 mono uppercase tracking-wider">
              <AlertTriangle className="w-2.5 h-2.5 mt-0.5 shrink-0 text-red-alert" />
              <span>
                AI может ошибаться на сложных позициях. Финальное решение за тобой.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
