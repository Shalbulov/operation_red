"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEFAULT_SKIN_ID } from "@/lib/skins/registry";
import { DEFAULT_BACKGROUND_ID } from "@/lib/skins/backgrounds";

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
  setSkin: (id: string) => void;
  setBackground: (id: string) => void;
  setFlagMode: (m: FlagMode) => void;
  setHaptics: (v: boolean) => void;
  setFlagToggle: (v: boolean) => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      skinId: DEFAULT_SKIN_ID,
      backgroundId: DEFAULT_BACKGROUND_ID,
      flagMode: "long-press",
      haptics: true,
      flagToggle: false,
      theme: "dark",
      setSkin: (id) => set({ skinId: id }),
      setBackground: (id) => set({ backgroundId: id }),
      setFlagMode: (m) => set({ flagMode: m }),
      setHaptics: (v) => set({ haptics: v }),
      setFlagToggle: (v) => set({ flagToggle: v }),
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () =>
        set({ theme: get().theme === "dark" ? "light" : "dark" }),
    }),
    {
      name: "ops-red:settings",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
