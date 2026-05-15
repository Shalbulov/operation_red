"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEFAULT_SKIN_ID } from "@/lib/skins/registry";
import { DEFAULT_BACKGROUND_ID } from "@/lib/skins/backgrounds";

interface InventoryStore {
  coins: number;
  ownedSkins: string[];
  ownedBackgrounds: string[];
  isPro: boolean;
  addCoins: (n: number) => void;
  spendCoins: (n: number) => boolean;
  grantSkin: (id: string) => void;
  grantBackground: (id: string) => void;
  setPro: (v: boolean) => void;
  ownsSkin: (id: string) => boolean;
  ownsBackground: (id: string) => boolean;
}

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      coins: 0,
      ownedSkins: [DEFAULT_SKIN_ID],
      ownedBackgrounds: [DEFAULT_BACKGROUND_ID, "tacGrid"],
      isPro: false,
      addCoins: (n) => set({ coins: get().coins + n }),
      spendCoins: (n) => {
        const cur = get().coins;
        if (cur < n) return false;
        set({ coins: cur - n });
        return true;
      },
      grantSkin: (id) => {
        if (get().ownedSkins.includes(id)) return;
        set({ ownedSkins: [...get().ownedSkins, id] });
      },
      grantBackground: (id) => {
        if (get().ownedBackgrounds.includes(id)) return;
        set({ ownedBackgrounds: [...get().ownedBackgrounds, id] });
      },
      setPro: (v) => set({ isPro: v }),
      ownsSkin: (id) => {
        const s = get();
        return s.isPro || s.ownedSkins.includes(id);
      },
      ownsBackground: (id) => {
        const s = get();
        return s.isPro || s.ownedBackgrounds.includes(id);
      },
    }),
    {
      name: "ops-red:inventory",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
