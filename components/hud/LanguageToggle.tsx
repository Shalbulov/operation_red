"use client";

import { useSettingsStore } from "@/lib/stores/settingsStore";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const locale = useSettingsStore((s) => s.locale);
  const cycle = useSettingsStore((s) => s.cycleLocale);

  return (
    <button
      type="button"
      onClick={cycle}
      className="frame flex items-center gap-1.5 px-2 sm:px-2.5 py-2 hover:border-red-alert transition-colors"
      aria-label={`Language: ${locale.toUpperCase()}`}
      title={`Language: ${locale.toUpperCase()} (click to cycle)`}
    >
      <Globe className="w-3 h-3 text-red-alert" />
      <span className="mono text-[10px] font-bold uppercase tracking-widest">
        {locale}
      </span>
    </button>
  );
}
