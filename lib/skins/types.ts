export type SkinKind = "board" | "background" | "bundle";
export type SkinRarity = "common" | "rare" | "epic" | "legendary";

export interface BoardSkin {
  id: string;
  name: string;
  description: string;
  rarity: SkinRarity;
  /** Price in cents (USD). 0 = free. */
  priceCents: number;
  /** Price in coins (in-game currency). 0 = not buyable with coins. */
  priceCoins: number;
  /** Polar product id (set after creating in Polar dashboard). */
  polarProductId?: string;
  /** Only unlocked through Pro subscription. */
  proOnly?: boolean;
  /**
   * CSS variables applied to <Board> root via inline style.
   * Keys must use --cell-* / --num-* names referenced in globals.css.
   */
  tokens: Record<string, string>;
}

export interface Background {
  id: string;
  name: string;
  description: string;
  rarity: SkinRarity;
  priceCents: number;
  priceCoins: number;
  polarProductId?: string;
  proOnly?: boolean;
  /** Inline style for the board wrapper. */
  style: React.CSSProperties;
}
