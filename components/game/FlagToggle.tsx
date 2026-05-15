"use client";

import { useSettingsStore } from "@/lib/stores/settingsStore";
import { Flag, MousePointer2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Mobile-friendly toggle: switch between reveal-on-tap and flag-on-tap. */
export function FlagToggle() {
  const flagToggle = useSettingsStore((s) => s.flagToggle);
  const setFlagToggle = useSettingsStore((s) => s.setFlagToggle);

  return (
    <button
      type="button"
      onClick={() => setFlagToggle(!flagToggle)}
      className={cn(
        "frame flex items-center gap-2 px-4 py-3 transition-colors min-h-[44px]",
        flagToggle
          ? "bg-red-alert border-red-alert text-void"
          : "hover:border-bone",
      )}
      aria-pressed={flagToggle}
    >
      {flagToggle ? (
        <>
          <Flag className="w-4 h-4" fill="currentColor" />
          <span className="mono text-xs font-bold uppercase tracking-widest">FLAG</span>
        </>
      ) : (
        <>
          <MousePointer2 className="w-4 h-4" />
          <span className="mono text-xs font-bold uppercase tracking-widest">REVEAL</span>
        </>
      )}
    </button>
  );
}
