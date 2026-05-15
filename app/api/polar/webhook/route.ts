import { Webhooks } from "@polar-sh/nextjs";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { findProductById } from "@/lib/polar/products";

export const dynamic = "force-dynamic";

async function syncSubscription(raw: unknown, considerActive: boolean) {
  try {
    const sub = raw as Record<string, unknown>;
    const customer = (sub.customer ?? null) as
      | { externalId?: string; external_id?: string }
      | null;
    const externalId =
      customer?.externalId ?? customer?.external_id ?? null;
    const customerId = String(sub.customerId ?? sub.customer_id ?? "");
    const status = String(sub.status ?? "");
    const periodEnd =
      (sub.currentPeriodEnd as string | undefined) ??
      (sub.current_period_end as string | undefined) ??
      null;
    const admin = createSupabaseServiceClient();

    let userId: string | null = null;
    if (externalId) {
      const { data: p } = await admin
        .from("profiles")
        .select("id")
        .eq("id", externalId)
        .maybeSingle();
      if (p) userId = p.id;
    }
    if (!userId && customerId) {
      const { data: p } = await admin
        .from("profiles")
        .select("id")
        .eq("polar_customer_id", customerId)
        .maybeSingle();
      if (p) userId = p.id;
    }
    if (!userId) return;

    const active =
      considerActive && (status === "active" || status === "trialing");
    await admin
      .from("profiles")
      .update({
        is_pro: active,
        pro_expires_at: periodEnd,
        ...(customerId ? { polar_customer_id: customerId } : {}),
      })
      .eq("id", userId);
  } catch (e) {
    console.error("[polar webhook] syncSubscription error:", e);
  }
}

/**
 * Polar webhook receiver.
 *
 * Set webhook URL in Polar dashboard to:
 *   {NEXT_PUBLIC_APP_URL}/api/polar/webhook
 * Use the signing secret as POLAR_WEBHOOK_SECRET.
 */
export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET ?? "",

  onOrderCreated: async (payload) => {
    try {
      const order = payload.data as Record<string, unknown>;
      const productId = String(order.productId ?? order.product_id ?? "");
      if (!productId) return;
      const product = findProductById(productId);
      if (!product) return;

      const admin = createSupabaseServiceClient();

      // Resolve user via:
      //   1. customer.external_id (set during checkout from supabase user.id)
      //   2. polar_customer_id stored on profile from a prior purchase
      const customer = (order.customer ?? null) as
        | { email?: string; externalId?: string; external_id?: string }
        | null;
      const externalId =
        customer?.externalId ?? customer?.external_id ?? null;
      const customerId = String(order.customerId ?? order.customer_id ?? "");
      let userId: string | null = null;

      if (externalId) {
        // external_id IS the supabase user.id
        const { data: p } = await admin
          .from("profiles")
          .select("id")
          .eq("id", externalId)
          .maybeSingle();
        if (p) userId = p.id;
      }
      if (!userId && customerId) {
        const { data: p } = await admin
          .from("profiles")
          .select("id")
          .eq("polar_customer_id", customerId)
          .maybeSingle();
        if (p) userId = p.id;
      }

      // Persist purchase
      await admin.from("purchases").insert({
        user_id: userId,
        polar_order_id: String(order.id),
        polar_product_id: productId,
        product_slug: product.slug,
        amount_cents: (order.amount as number | undefined) ?? null,
        currency: (order.currency as string | undefined) ?? null,
        payload: order,
      });

      if (!userId) return;

      // Link customer id for future requests
      if (customerId) {
        await admin
          .from("profiles")
          .update({ polar_customer_id: customerId })
          .eq("id", userId);
      }

      // Grant skins/bgs
      const grants: { user_id: string; skin_id: string; acquired_via: "polar" }[] = [];
      for (const id of product.grantsSkins ?? []) {
        grants.push({ user_id: userId, skin_id: id, acquired_via: "polar" });
      }
      for (const id of product.grantsBackgrounds ?? []) {
        grants.push({ user_id: userId, skin_id: id, acquired_via: "polar" });
      }
      if (grants.length) {
        await admin.from("user_skins").upsert(grants, { onConflict: "user_id,skin_id" });
      }
    } catch (e) {
      console.error("[polar webhook] onOrderCreated error:", e);
    }
  },

  onSubscriptionCreated: async (payload) => {
    await syncSubscription(payload.data, true);
  },

  onSubscriptionUpdated: async (payload) => {
    await syncSubscription(payload.data, true);
  },

  onSubscriptionCanceled: async (payload) => {
    await syncSubscription(payload.data, false);
  },
});
