import type { Background } from "./types";

export const BACKGROUNDS: Record<string, Background> = {
  void: {
    id: "void",
    name: "Void",
    description: "Чистая пустота. Только ты и поле.",
    rarity: "common",
    priceCents: 0,
    priceCoins: 0,
    style: { background: "var(--bg-void)" },
  },
  tacGrid: {
    id: "tacGrid",
    name: "Tactical Grid",
    description: "Координатная сетка военного планшета.",
    rarity: "common",
    priceCents: 149,
    priceCoins: 200,
    style: {
      backgroundColor: "var(--bg-void)",
      backgroundImage: `
        linear-gradient(to right, rgba(230, 57, 70, 0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(230, 57, 70, 0.04) 1px, transparent 1px)
      `,
      backgroundSize: "40px 40px",
    },
  },
  concrete: {
    id: "concrete",
    name: "Concrete Bunker",
    description: "Бетонные стены подземного штаба.",
    rarity: "rare",
    priceCents: 199,
    priceCoins: 500,
    style: {
      backgroundColor: "#1c1c1c",
      backgroundImage: `
        radial-gradient(circle at 20% 30%, rgba(255,255,255,0.02) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(255,255,255,0.02) 0%, transparent 50%)
      `,
    },
  },
  topo: {
    id: "topo",
    name: "Topographic",
    description: "Топографическая карта местности операции.",
    rarity: "rare",
    priceCents: 199,
    priceCoins: 500,
    style: {
      backgroundColor: "#0a0a0a",
      backgroundImage: `
        repeating-radial-gradient(circle at center, transparent 0px, transparent 22px, rgba(230,57,70,0.04) 22px, rgba(230,57,70,0.04) 24px)
      `,
    },
  },
  bloodMoon: {
    id: "bloodMoon",
    name: "Blood Moon",
    description: "Красное сияние на горизонте. Premium.",
    rarity: "epic",
    priceCents: 299,
    priceCoins: 1000,
    style: {
      backgroundColor: "#0a0a0a",
      backgroundImage: `
        radial-gradient(ellipse 80% 50% at center top, rgba(139,0,0,0.4) 0%, transparent 60%),
        radial-gradient(circle at 50% -20%, rgba(230,57,70,0.5) 0%, transparent 40%)
      `,
    },
  },
};

export const DEFAULT_BACKGROUND_ID = "void";
export const BACKGROUND_LIST = Object.values(BACKGROUNDS);

export function getBackground(id: string | null | undefined): Background {
  if (!id) return BACKGROUNDS[DEFAULT_BACKGROUND_ID];
  return BACKGROUNDS[id] ?? BACKGROUNDS[DEFAULT_BACKGROUND_ID];
}
