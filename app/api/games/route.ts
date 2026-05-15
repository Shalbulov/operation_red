import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const Body = z.object({
  difficulty: z.enum(["easy", "medium", "hard", "custom", "daily"]),
  width: z.number().int().min(3).max(50),
  height: z.number().int().min(3).max(50),
  mines: z.number().int().min(1).max(500),
  status: z.enum(["won", "lost", "abandoned"]),
  time_ms: z.number().int().min(0),
  three_bv: z.number().int().nullable().optional(),
  flags_correct: z.number().int().min(0),
  flags_total: z.number().int().min(0),
  hints_used: z.number().int().min(0).default(0),
  seed: z.number().int().nullable().optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("games")
    .insert({
      user_id: user.id,
      ...parsed.data,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Award coins for wins (server-side, authoritative)
  if (parsed.data.status === "won") {
    const COIN_REWARD: Record<string, number> = {
      easy: 5,
      medium: 15,
      hard: 40,
      custom: 0,
      daily: 25,
    };
    const reward = COIN_REWARD[parsed.data.difficulty] ?? 0;
    if (reward > 0) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("coins")
        .eq("id", user.id)
        .single();
      const currentCoins = profile?.coins ?? 0;
      await supabase
        .from("profiles")
        .update({ coins: currentCoins + reward })
        .eq("id", user.id);
    }
  }

  return NextResponse.json({ ok: true, game: data });
}

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const limit = Math.min(50, Number(req.nextUrl.searchParams.get("limit") ?? 20));
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("user_id", user.id)
    .order("finished_at", { ascending: false })
    .limit(limit);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ games: data });
}
