"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Flame,
  SkipForward,
} from "lucide-react";
import { TUTORIAL_STEPS, type TutorialStep } from "@/lib/game/tutorialSteps";
import { TutorialBoard } from "@/components/tutorial/TutorialBoard";
import { useT } from "@/lib/i18n/useT";
import { cn } from "@/lib/utils/cn";

export default function TutorialPage() {
  const t = useT();
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [solvedIds, setSolvedIds] = useState<Set<number>>(new Set());
  const [wrongShake, setWrongShake] = useState(false);
  const [done, setDone] = useState(false);

  const total = TUTORIAL_STEPS.length;
  const step: TutorialStep = TUTORIAL_STEPS[idx];

  const needsAction = !!step.expected;
  const stepSolved = solvedIds.has(step.id);
  const canAdvance = !needsAction || stepSolved;

  // Reset the per-step "wrong shake" indicator when step changes
  useEffect(() => {
    setWrongShake(false);
  }, [idx]);

  // When user solves the step, mark it
  const handleCorrect = () => {
    setSolvedIds((prev) => new Set(prev).add(step.id));
  };
  const handleWrong = () => {
    setWrongShake(true);
    window.setTimeout(() => setWrongShake(false), 1200);
  };

  const next = () => {
    if (idx < total - 1) {
      setIdx(idx + 1);
    } else {
      setDone(true);
    }
  };

  const back = () => {
    if (idx > 0) setIdx(idx - 1);
  };

  const progressPct = useMemo(() => ((idx + 1) / total) * 100, [idx, total]);

  if (done) {
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="frame-elevated max-w-md w-full p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-red-alert mx-auto mb-4" />
          <span className="tag tag-red mb-3 inline-flex">{t("tut.tag")}</span>
          <h1 className="display text-3xl sm:text-4xl mb-3">
            {t("tut.complete.title")}
          </h1>
          <p className="text-bone-dim text-sm mb-6">{t("tut.complete.desc")}</p>
          <button
            onClick={() => router.push("/play")}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Flame className="w-4 h-4" />
            {t("tut.btn.startPlaying")}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-3 sm:px-6 py-6 sm:py-10">
      <div className="max-w-2xl mx-auto">
        {/* Header strip */}
        <div className="flex items-center gap-3 mb-3">
          <GraduationCap className="w-5 h-5 text-red-alert" />
          <span className="tag tag-red">{t("tut.tag")}</span>
          <span className="h-px flex-1 bg-steel-700" />
          <Link
            href="/play"
            className="mono text-[10px] uppercase tracking-widest text-steel-400 hover:text-red-alert flex items-center gap-1.5"
          >
            <SkipForward className="w-3 h-3" />
            <span className="hidden sm:inline">{t("tut.btn.skip")}</span>
          </Link>
        </div>

        <h1 className="display text-3xl sm:text-5xl mb-6 leading-none">
          {t("tut.heading.1")}{" "}
          <span className="text-red-alert">{t("tut.heading.2")}</span>
        </h1>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="mono text-[10px] uppercase tracking-widest text-steel-400">
              {t("tut.progress", { n: idx + 1, total })}
            </span>
            <span className="mono text-[10px] uppercase tracking-widest text-steel-500">
              {Math.round(progressPct)}%
            </span>
          </div>
          <div className="h-1 bg-steel-800 relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-red-alert transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="frame-elevated p-5 sm:p-7 space-y-5">
          <div>
            <h2 className="display text-xl sm:text-2xl mb-2">
              {t(step.titleKey)}
            </h2>
            <p className="text-bone-dim text-sm leading-relaxed">
              {t(step.descKey)}
            </p>
          </div>

          {step.board && (
            <div className="py-2">
              <TutorialBoard
                board={step.board}
                highlight={step.highlight}
                expected={step.expected}
                onCorrect={handleCorrect}
                onWrong={handleWrong}
              />
            </div>
          )}

          {/* Task / success line */}
          {needsAction && (
            <div
              className={cn(
                "frame p-3 transition-colors",
                stepSolved
                  ? "border-red-alert"
                  : wrongShake
                    ? "border-red-alert bg-red-alert/10"
                    : "",
              )}
            >
              {stepSolved ? (
                <div className="flex items-start gap-2 text-bone text-sm">
                  <CheckCircle2 className="w-4 h-4 text-red-alert shrink-0 mt-0.5" />
                  <span>{t(step.successKey!)}</span>
                </div>
              ) : wrongShake ? (
                <div className="text-red-alert text-sm">{t("tut.wrong")}</div>
              ) : (
                <div className="text-bone-dim text-sm">{t(step.taskKey!)}</div>
              )}
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex items-center justify-between gap-2 pt-2">
            <button
              onClick={back}
              disabled={idx === 0}
              className="btn-ghost flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t("tut.btn.back")}</span>
            </button>

            <button
              onClick={next}
              disabled={!canAdvance}
              className={cn(
                "btn-primary flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed",
                !canAdvance && "disabled:hover:transform-none",
              )}
            >
              {idx === total - 1
                ? t("tut.btn.startPlaying")
                : t("tut.btn.next")}
              {idx === total - 1 ? (
                <Flame className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
