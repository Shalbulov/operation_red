"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/lib/stores/settingsStore";

/**
 * Reads theme from settings store and applies `data-theme` on <html>.
 * Renders nothing. Must be a client component because the store is browser-only.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-theme", theme);
    // Update theme-color meta for mobile browser chrome
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "light" ? "#f5f3ee" : "#0a0a0a");
    }
  }, [theme]);

  return <>{children}</>;
}
