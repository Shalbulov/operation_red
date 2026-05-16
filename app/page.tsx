"use client";

import Link from "next/link";
import { Radio, Crosshair, Flame, Trophy, Sparkles, Lock } from "lucide-react";
import { ThemeToggle } from "@/components/hud/ThemeToggle";
import { LanguageToggle } from "@/components/hud/LanguageToggle";
import { useT } from "@/lib/i18n/useT";

export default function LandingPage() {
  const t = useT();
  return (
    <main className="flex flex-1 flex-col">
      {/* HERO */}
      <section className="relative border-b border-steel-700 px-6 py-8 sm:py-14 md:px-12">
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between gap-2 border-b border-steel-700 bg-sunken px-6 py-2 md:px-12">
          <div className="flex items-center gap-3">
            <span className="tag tag-red flex items-center gap-1.5">
              <span className="block w-1.5 h-1.5 bg-red-alert animate-pulse" />
              {t("landing.tag.live")}
            </span>
            <span className="tag hidden sm:inline-flex">{t("landing.tag.sector")}</span>
            <span className="tag hidden md:inline-flex">{t("landing.tag.classified")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="mono text-[10px] text-steel-500 uppercase tracking-widest hidden sm:inline">
              v0.1 / OPS-RED
            </span>
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        <div className="mx-auto max-w-6xl pt-12 sm:pt-8">
          <div className="mb-6 flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-red-alert" />
            <span className="mono text-[11px] uppercase tracking-[0.3em] text-steel-400">
              {t("landing.brief")}
            </span>
          </div>

          <h1 className="display text-5xl sm:text-7xl md:text-8xl leading-[0.85] mb-4">
            {t("landing.title.line1")}
            <br />
            <span className="text-red-alert">{t("landing.title.line2")}</span>
          </h1>

          <p className="max-w-xl text-bone-dim text-base sm:text-lg leading-relaxed mb-8">
            {t("landing.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/play" className="btn-primary inline-flex items-center justify-center gap-2">
              <Flame className="w-4 h-4" />
              {t("landing.cta.play")}
            </Link>
            <Link href="/daily" className="btn-ghost inline-flex items-center justify-center gap-2">
              <Radio className="w-4 h-4" />
              {t("landing.cta.daily")}
            </Link>
            <Link href="/shop" className="btn-ghost inline-flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              {t("landing.cta.shop")}
            </Link>
          </div>

          {/* HUD readouts */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-px bg-steel-700 border border-steel-700">
            <Readout label={t("landing.stats.players")} value="1,247" />
            <Readout label={t("landing.stats.defused")} value="284,109" />
            <Readout label={t("landing.stats.boom")} value="91,420" />
            <Readout label={t("landing.stats.record")} value="0:08.2" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-b border-steel-700 px-6 py-12 md:px-12 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-8">
            <span className="tag">02 / {t("landing.brief.tag")}</span>
            <span className="h-px flex-1 bg-steel-700" />
          </div>

          <h2 className="display text-3xl sm:text-5xl mb-10">
            {t("landing.brief.heading.1")}{" "}
            <span className="text-red-alert">{t("landing.brief.heading.2")}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-steel-700 border border-steel-700">
            <Feature
              icon={<Crosshair className="w-5 h-5" />}
              title={t("landing.feature.aicoach.title")}
              desc={t("landing.feature.aicoach.desc")}
            />
            <Feature
              icon={<Radio className="w-5 h-5" />}
              title={t("landing.feature.daily.title")}
              desc={t("landing.feature.daily.desc")}
            />
            <Feature
              icon={<Trophy className="w-5 h-5" />}
              title={t("landing.feature.leaderboard.title")}
              desc={t("landing.feature.leaderboard.desc")}
            />
            <Feature
              icon={<Flame className="w-5 h-5" />}
              title={t("landing.feature.difficulty.title")}
              desc={t("landing.feature.difficulty.desc")}
            />
            <Feature
              icon={<Sparkles className="w-5 h-5" />}
              title={t("landing.feature.skins.title")}
              desc={t("landing.feature.skins.desc")}
            />
            <Feature
              icon={<Lock className="w-5 h-5" />}
              title={t("landing.feature.safe.title")}
              desc={t("landing.feature.safe.desc")}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="tag tag-red mb-6 inline-flex">{t("landing.cta2.tag")}</span>
          <h2 className="display text-4xl sm:text-6xl mb-6 leading-none">
            {t("landing.cta2.title.1")}{" "}
            <span className="text-red-alert">{t("landing.cta2.title.2")}</span>
          </h2>
          <p className="text-bone-dim mb-8">{t("landing.cta2.subtitle")}</p>
          <Link href="/play" className="btn-primary inline-flex items-center gap-2">
            <Flame className="w-4 h-4" />
            {t("landing.cta2.button")}
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-steel-700 px-6 py-6 md:px-12">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row justify-between gap-3 mono text-[11px] uppercase tracking-widest text-steel-500">
          <span>{t("landing.footer.copy")}</span>
          <span>{t("landing.footer.tag")}</span>
        </div>
      </footer>
    </main>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-panel p-4 sm:p-5">
      <div className="mono text-[10px] uppercase tracking-widest text-steel-500 mb-1">
        {label}
      </div>
      <div className="display text-2xl sm:text-3xl text-bone tabular-nums">
        {value}
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-panel p-6 group hover:bg-elevated transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <span className="flex items-center justify-center w-9 h-9 border border-steel-700 text-red-alert group-hover:border-red-alert transition-colors">
          {icon}
        </span>
        <h3 className="stencil text-sm text-bone">{title}</h3>
      </div>
      <p className="text-bone-dim text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
