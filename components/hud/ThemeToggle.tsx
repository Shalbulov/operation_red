"use client";

import { Moon, Sun } from "lucide-react";
import { useSettingsStore } from "@/lib/stores/settingsStore";

export function ThemeToggle() {
  const theme = useSettingsStore((s) => s.theme);
  const toggle = useSettingsStore((s) => s.toggleTheme);

  return (
    <button
      type="button"
      onClick={toggle}
      className="frame p-2 hover:border-red-alert transition-colors"
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
    >
      {theme === "dark" ? (
        <Sun className="w-3.5 h-3.5 text-red-alert" />
      ) : (
        <Moon className="w-3.5 h-3.5 text-red-alert" />
      )}
    </button>
  );
}
