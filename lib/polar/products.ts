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
 * Resolve a Polar product for a given skin id (skin.id from skins/registry).
 * Returns undefined if there is no paid SKU (e.g. ops/ink/glass).
 */
export function getPolarProductForSkin(
  skinId: string,
): PolarProduct | undefined {
  const map: Record<string, ProductSlug> = {
    carbon: "skin_carbon",
    blueprint: "skin_blueprint",
    neonTokyo: "skin_neon_tokyo",
    vintage: "skin_vintage",
  };
  const slug = map[skinId];
  return slug ? PRODUCTS[slug] : undefined;
}

/**
 * Resolve a Polar product for a given background id.
 */
export function getPolarProductForBackground(
  bgId: string,
): PolarProduct | undefined {
  const map: Record<string, ProductSlug> = {
    bloodMoon: "bg_blood_moon",
  };
  const slug = map[bgId];
  return slug ? PRODUCTS[slug] : undefined;
}
