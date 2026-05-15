export type Difficulty = "easy" | "medium" | "hard" | "custom" | "daily";

export interface DifficultyConfig {
  id: Difficulty;
  label: string;
  width: number;
  height: number;
  mines: number;
  reward: number; // coins
}

export const DIFFICULTIES: Record<
  Exclude<Difficulty, "custom" | "daily">,
  DifficultyConfig
> = {
  easy: {
    id: "easy",
    label: "EASY",
    width: 9,
    height: 9,
    mines: 10,
    reward: 5,
  },
  medium: {
    id: "medium",
    label: "MEDIUM",
    width: 16,
    height: 16,
    mines: 40,
    reward: 15,
  },
  hard: {
    id: "hard",
    label: "HARD",
    width: 30,
    height: 16,
    mines: 99,
    reward: 40,
  },
};

export const DAILY_CONFIG: DifficultyConfig = {
  id: "daily",
  label: "DAILY",
  width: 16,
  height: 16,
  mines: 40,
  reward: 25,
};

export const CUSTOM_LIMITS = {
  minWidth: 5,
  maxWidth: 30,
  minHeight: 5,
  maxHeight: 30,
  maxMineRatio: 0.3,
} as const;

export const AI_LIMITS = {
  freeHintsPerGame: 3,
  proHintsPerGame: 999,
} as const;

export const COIN_BONUSES = {
  fastBonus: 5, // < median time
  perfectAccuracy: 10, // 100% flag accuracy
  noHints: 5, // no AI hints used
  dailyFirst: 50,
} as const;
