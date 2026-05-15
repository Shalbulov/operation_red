import { Checkout } from "@polar-sh/nextjs";

export const dynamic = "force-dynamic";

/**
 * Polar Checkout handler.
 * Usage from client: <a href={`/api/polar/checkout?products=${POLAR_PRODUCT_ID}&customerEmail=...`} />
 */
export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN ?? "",
  successUrl:
    process.env.POLAR_SUCCESS_URL ??
    "http://localhost:3000/shop?success=true",
  server: (process.env.POLAR_SERVER as "sandbox" | "production") ?? "sandbox",
});
