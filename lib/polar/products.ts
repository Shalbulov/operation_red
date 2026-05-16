/**
 * Polar product mapping. After creating products in the Polar dashboard
 * (sandbox or production), paste their IDs here so the server-side webhook
 * handler knows which skin/sub each purchase grants.
 *
 * Until configured, the shop falls back to coin-based purchases only.
 */

export type ProductSlug =
  | "skin_carbon"
  | "skin_blueprint"
  | "skin_neon_tokyo"
  | "skin_vintage"
  | "bg_tac_grid"
  | "bg_concrete"
  | "bg_topo"
  | "bg_blood_moon"
  | "bundle_mega"
  | "pro_monthly";

export interface PolarProduct {
  slug: ProductSlug;
  name: string;
  description: string;
  polarProductId: string; // Fill in after creating in Polar dashboard
  /** Skins/Bgs to grant on successful purchase. */
  grantsSkins?: string[];
  grantsBackgrounds?: string[];
  /** True for Pro subscription. */
  isSubscription?: boolean;
  priceCents: number;
}

export const PRODUCTS: Record<ProductSlug, PolarProduct> = {
  skin_carbon: {
    slug: "skin_carbon",
    name: "Carbon Fiber Skin",
    description: "Карбоновый скин доски с красными циферками",
    polarProductId: process.env.POLAR_PRODUCT_SKIN_CARBON ?? "",
    grantsSkins: ["carbon"],
    priceCents: 299,
  },
  skin_blueprint: {
    slug: "skin_blueprint",
    name: "Blueprint Skin",
    description: "Технический чертёж — скин доски",
    polarProductId: process.env.POLAR_PRODUCT_SKIN_BLUEPRINT ?? "",
    grantsSkins: ["blueprint"],
    priceCents: 299,
  },
  skin_neon_tokyo: {
    slug: "skin_neon_tokyo",
    name: "Neon Tokyo Skin",
    description: "Киберпанк-неон",
    polarProductId: process.env.POLAR_PRODUCT_SKIN_NEON ?? "",
    grantsSkins: ["neonTokyo"],
    priceCents: 399,
  },
  skin_vintage: {
    slug: "skin_vintage",
    name: "Vintage War Skin",
    description: "Военная сепия с красными пометками",
    polarProductId: process.env.POLAR_PRODUCT_SKIN_VINTAGE ?? "",
    grantsSkins: ["vintage"],
    priceCents: 249,
  },
  bg_tac_grid: {
    slug: "bg_tac_grid",
    name: "Tactical Grid Background",
    description: "Координатная сетка военного планшета",
    polarProductId: process.env.POLAR_PRODUCT_BG_TACGRID ?? "",
    grantsBackgrounds: ["tacGrid"],
    priceCents: 149,
  },
  bg_concrete: {
    slug: "bg_concrete",
    name: "Concrete Bunker Background",
    description: "Бетонные стены подземного штаба",
    polarProductId: process.env.POLAR_PRODUCT_BG_CONCRETE ?? "",
    grantsBackgrounds: ["concrete"],
    priceCents: 199,
  },
  bg_topo: {
    slug: "bg_topo",
    name: "Topographic Background",
    description: "Топографическая карта местности",
    polarProductId: process.env.POLAR_PRODUCT_BG_TOPO ?? "",
    grantsBackgrounds: ["topo"],
    priceCents: 199,
  },
  bg_blood_moon: {
    slug: "bg_blood_moon",
    name: "Blood Moon Background",
    description: "Кровавая луна на горизонте",
    polarProductId: process.env.POLAR_PRODUCT_BG_BLOODMOON ?? "",
    grantsBackgrounds: ["bloodMoon"],
    priceCents: 299,
  },
  bundle_mega: {
    slug: "bundle_mega",
    name: "Mega Bundle",
    description: "Все скины и фоны навсегда",
    polarProductId: process.env.POLAR_PRODUCT_BUNDLE_MEGA ?? "",
    grantsSkins: ["carbon", "blueprint", "neonTokyo", "vintage"],
    grantsBackgrounds: ["concrete", "topo", "bloodMoon"],
    priceCents: 999,
  },
  pro_monthly: {
    slug: "pro_monthly",
    name: "Pro Monthly",
    description: "Все скины, ∞ AI hints, PRO-бейдж",
    polarProductId: process.env.POLAR_PRODUCT_PRO_MONTHLY ?? "",
    isSubscription: true,
    priceCents: 499,
  },
};

export function findProductById(id: string): PolarProduct | undefined {
  return Object.values(PRODUCTS).find((p) => p.polarProductId === id);
}

export function findProductBySlug(slug: ProductSlug): PolarProduct {
  return PRODUCTS[slug];
}

/**
 * Pure id-to-slug mapping (safe to use on the client).
 * The slug is then resolved to a real Polar product id on the server.
 */
const SKIN_TO_SLUG: Record<string, ProductSlug> = {
  carbon: "skin_carbon",
  blueprint: "skin_blueprint",
  neonTokyo: "skin_neon_tokyo",
  vintage: "skin_vintage",
};
const BACKGROUND_TO_SLUG: Record<string, ProductSlug> = {
  tacGrid: "bg_tac_grid",
  concrete: "bg_concrete",
  topo: "bg_topo",
  bloodMoon: "bg_blood_moon",
};

export function getSlugForSkin(skinId: string): ProductSlug | undefined {
  return SKIN_TO_SLUG[skinId];
}

export function getSlugForBackground(bgId: string): ProductSlug | undefined {
  return BACKGROUND_TO_SLUG[bgId];
}

/**
 * @deprecated — these read env vars and only work server-side.
 * Use slug-based redirect through /api/polar/buy on the client.
 */
export function getPolarProductForSkin(
  skinId: string,
): PolarProduct | undefined {
  const slug = SKIN_TO_SLUG[skinId];
  return slug ? PRODUCTS[slug] : undefined;
}

/** @deprecated — see getPolarProductForSkin. */
export function getPolarProductForBackground(
  bgId: string,
): PolarProduct | undefined {
  const slug = BACKGROUND_TO_SLUG[bgId];
  return slug ? PRODUCTS[slug] : undefined;
}
