import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const Body = z.object({ skinId: z.string().min(1).max(60) });

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Fetch skin & profile
  const [{ data: skin }, { data: profile }, { data: owned }] = await Promise.all([
    supabase
      .from("skins")
      .select("id, name, price_coins, is_pro_only")
      .eq("id", parsed.data.skinId)
      .single(),
    supabase.from("profiles").select("coins, is_pro").eq("id", user.id).single(),
    supabase
      .from("user_skins")
      .select("skin_id")
      .eq("user_id", user.id)
      .eq("skin_id", parsed.data.skinId)
      .maybeSingle(),
  ]);

  if (!skin) {
    return NextResponse.json({ error: "skin_not_found" }, { status: 404 });
  }
  if (owned) {
    return NextResponse.json({ error: "already_owned" }, { status: 409 });
  }
  if (skin.is_pro_only) {
    return NextResponse.json({ error: "pro_only" }, { status: 403 });
  }
  if (!skin.price_coins || skin.price_coins <= 0) {
    return NextResponse.json({ error: "not_for_coins" }, { status: 400 });
  }
  const coins = profile?.coins ?? 0;
  if (coins < skin.price_coins) {
    return NextResponse.json({ error: "insufficient_coins" }, { status: 402 });
  }

  // Deduct + grant (no transaction support in PostgREST; best-effort sequential)
  await supabase
    .from("profiles")
    .update({ coins: coins - skin.price_coins })
    .eq("id", user.id);

  await supabase.from("user_skins").insert({
    user_id: user.id,
    skin_id: skin.id,
    acquired_via: "coins",
  });

  return NextResponse.json({ ok: true, coinsLeft: coins - skin.price_coins });
}
