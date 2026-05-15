import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { seedForDate } from "@/lib/game/seedrandom";
import { DAILY_CONFIG } from "@/lib/constants";

export const dynamic = "force-dynamic";

function todayIso(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function GET() {
  const date = todayIso();

  // Try to fetch from DB; fall back to deterministic-from-date if Supabase is
  // unavailable (still gives a stable seed shared by all clients).
  try {
    const supabase = await createSupabaseServerClient();
    const { data: existing } = await supabase
      .from("daily_challenges")
      .select("*")
      .eq("date", date)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        date: existing.date,
        seed: Number(existing.seed),
        width: existing.width,
        height: existing.height,
        mines: existing.mines,
        difficulty: existing.difficulty,
      });
    }

    // Create today's challenge (service role bypasses RLS).
    try {
      const admin = createSupabaseServiceClient();
      const seed = seedForDate(date);
      const { data: created } = await admin
        .from("daily_challenges")
        .insert({
          date,
          seed,
          difficulty: "medium",
          width: DAILY_CONFIG.width,
          height: DAILY_CONFIG.height,
          mines: DAILY_CONFIG.mines,
        })
        .select()
        .single();
      if (created) {
        return NextResponse.json({
          date: created.date,
          seed: Number(created.seed),
          width: created.width,
          height: created.height,
          mines: created.mines,
          difficulty: created.difficulty,
        });
      }
    } catch {
      /* fall through to deterministic */
    }
  } catch {
    /* Supabase unavailable — deterministic fallback */
  }

  // Deterministic fallback — same seed across clients on same date
  return NextResponse.json({
    date,
    seed: seedForDate(date),
    width: DAILY_CONFIG.width,
    height: DAILY_CONFIG.height,
    mines: DAILY_CONFIG.mines,
    difficulty: "medium",
  });
}
