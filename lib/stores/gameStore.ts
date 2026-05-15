"use client";

import { create } from "zustand";
import {
  createInitialState,
  revealCell as engineReveal,
  toggleFlag as engineFlag,
  chord as engineChord,
} from "@/lib/game/engine";
import type { GameState } from "@/lib/game/types";

interface GameStore extends GameState {
  // commands
  newGame: (width: number, height: number, mines: number, seed?: number) => void;
  reveal: (x: number, y: number) => { exploded: { x: number; y: number } | null };
  flag: (x: number, y: number) => void;
  chordAt: (x: number, y: number) => { exploded: { x: number; y: number } | null };
  setHint: (hint: { x: number; y: number; action: "reveal" | "flag" } | null) => void;
  incHints: () => void;
}

const initial = createInitialState(9, 9, 10);

export const useGameStore = create<GameStore>((set, get) => ({
  ...initial,
  newGame: (width, height, mines, seed) => {
    set({ ...createInitialState(width, height, mines, seed) });
  },
  reveal: (x, y) => {
    const result = engineReveal(get(), x, y);
    set({ ...result.state });
    return { exploded: result.exploded };
  },
  flag: (x, y) => {
    set({ ...engineFlag(get(), x, y) });
  },
  chordAt: (x, y) => {
    const result = engineChord(get(), x, y);
    set({ ...result.state });
    return { exploded: result.exploded };
  },
  setHint: (hint) => set({ lastHint: hint }),
  incHints: () => set({ hintsUsed: get().hintsUsed + 1 }),
}));
