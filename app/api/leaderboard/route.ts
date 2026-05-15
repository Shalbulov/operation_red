import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const difficulty = req.nextUrl.searchParams.get("difficulty") ?? "easy";
  const city = req.nextUrl.searchParams.get("city");
  const limit = Math.min(
    100,
    Number(req.nextUrl.searchParams.get("limit") ?? 50),
  );

  let query = supabase
    .from("games")
    .select(
      "id, time_ms, three_bv, finished_at, user_id, profiles!inner(username, city, country, avatar_url, is_pro)",
    )
    .eq("difficulty", difficulty)
    .eq("status", "won")
    .order("time_ms", { ascending: true })
    .limit(limit);

  if (city) {
    query = query.eq("profiles.city", city);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ results: data ?? [] });
}
