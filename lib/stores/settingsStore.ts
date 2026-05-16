"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEFAULT_SKIN_ID } from "@/lib/skins/registry";
import { DEFAULT_BACKGROUND_ID } from "@/lib/skins/backgrounds";

import type { Locale } from "@/lib/i18n/dictionaries";

export type FlagMode = "tap" | "long-press";
export type Theme = "dark" | "light";

interface SettingsStore {
  skinId: string;
  backgroundId: string;
  flagMode: FlagMode;
  haptics: boolean;
  /** When true, single tap places flag instead of revealing. Mobile toggle. */
  flagToggle: boolean;
  theme: Theme;
  locale: Locale;
  setSkin: (id: string) => void;
  setBackground: (id: string) => void;
  setFlagMode: (m: FlagMode) => void;
  setHaptics: (v: boolean) => void;
  setFlagToggle: (v: boolean) => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setLocale: (l: Locale) => void;
  cycleLocale: () => void;
}

const LOCALE_ORDER: Locale[] = ["ru", "en", "kz"];

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      skinId: DEFAULT_SKIN_ID,
      backgroundId: DEFAULT_BACKGROUND_ID,
      flagMode: "long-press",
      haptics: true,
      flagToggle: false,
      theme: "dark",
      locale: "ru",
      setSkin: (id) => set({ skinId: id }),
      setBackground: (id) => set({ backgroundId: id }),
      setFlagMode: (m) => set({ flagMode: m }),
      setHaptics: (v) => set({ haptics: v }),
      setFlagToggle: (v) => set({ flagToggle: v }),
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () =>
        set({ theme: get().theme === "dark" ? "light" : "dark" }),
      setLocale: (l) => set({ locale: l }),
      cycleLocale: () => {
        const idx = LOCALE_ORDER.indexOf(get().locale);
        const next = LOCALE_ORDER[(idx + 1) % LOCALE_ORDER.length];
        set({ locale: next });
      },
    }),
    {
      name: "ops-red:settings",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
