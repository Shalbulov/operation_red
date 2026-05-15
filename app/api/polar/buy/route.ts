import { NextResponse, type NextRequest } from "next/server";
import { findProductBySlug, type ProductSlug, PRODUCTS } from "@/lib/polar/products";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Resolve a product slug to its actual Polar product id (server-side, where
 * env vars are available), enrich with the logged-in user's email/external_id,
 * then redirect to /api/polar/checkout (the @polar-sh/nextjs adapter handler).
 *
 *   /api/polar/buy?slug=skin_carbon
 *   /api/polar/buy?slug=pro_monthly
 */
export async function GET(req: NextRequest) {
  const slugParam = req.nextUrl.searchParams.get("slug");
  if (!slugParam || !(slugParam in PRODUCTS)) {
    return NextResponse.json(
      { error: "invalid_slug", got: slugParam },
      { status: 400 },
    );
  }

  const product = findProductBySlug(slugParam as ProductSlug);
  if (!product.polarProductId) {
    return NextResponse.json(
      {
        error: "product_not_configured",
        slug: slugParam,
        hint:
          "Set POLAR_PRODUCT_" +
          slugParam.toUpperCase() +
          " in environment variables.",
      },
      { status: 503 },
    );
  }

  const params = new URLSearchParams({ products: product.polarProductId });

  // Attach user identity so Polar webhook can grant the entitlement.
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      if (user.email) params.set("customerEmail", user.email);
      params.set("customerExternalId", user.id);
    }
  } catch {
    // anon checkout — purchase will still complete but won't auto-link
  }

  const checkoutUrl = new URL(
    `/api/polar/checkout?${params.toString()}`,
    req.url,
  );
  return NextResponse.redirect(checkoutUrl, 307);
}
