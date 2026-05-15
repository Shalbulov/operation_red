import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { serializeBoard } from "@/lib/ai/serializeBoard";
import { getCoachHint } from "@/lib/ai/gemini";
import { AI_LIMITS } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CellSchema = z.object({
  state: z.enum(["closed", "open", "flag", "question"]),
  adjacent: z.number().int().min(0).max(8),
});

const BodySchema = z.object({
  board: z.array(z.array(CellSchema)),
  width: z.number().int().min(3).max(50),
  height: z.number().int().min(3).max(50),
  mines: z.number().int().min(1).max(500),
  flagsPlaced: z.number().int().min(0),
});

const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const FREE_LIMIT = 3;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "gemini not configured" },
      { status: 503 },
    );
  }

  // Auth + rate-limit
  let userId: string | null = null;
  let isPro = false;
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      userId = user.id;
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_pro")
        .eq("id", user.id)
        .single();
      isPro = profile?.is_pro ?? false;

      if (!isPro) {
        const since = new Date(Date.now() - WINDOW_MS).toISOString();
        const { count } = await supabase
          .from("ai_hint_log")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", since);
        if ((count ?? 0) >= FREE_LIMIT) {
          return NextResponse.json(
            {
              error: "rate_limit",
              message: `Free лимит: ${FREE_LIMIT}/${WINDOW_MS / 60000}мин. Upgrade to Pro.`,
            },
            { status: 429 },
          );
        }
      }
    }
  } catch {
    // Supabase not configured — allow anonymous usage (helpful for dev)
  }

  const boardText = serializeBoard(
    parsed.data.board,
    parsed.data.width,
    parsed.data.height,
  );

  try {
    const hint = await getCoachHint({
      boardText,
      width: parsed.data.width,
      height: parsed.data.height,
      mines: parsed.data.mines,
      flagsPlaced: parsed.data.flagsPlaced,
    });

    // Validate the cell is actionable (not already open)
    const target = parsed.data.board[hint.y]?.[hint.x];
    if (!target || target.state === "open") {
      return NextResponse.json(
        { error: "invalid_target_from_ai" },
        { status: 502 },
      );
    }

    // Log usage
    if (userId) {
      try {
        const supabase = await createSupabaseServerClient();
        await supabase.from("ai_hint_log").insert({ user_id: userId });
      } catch {
        /* best-effort */
      }
    }

    return NextResponse.json(hint);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "ai error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

void AI_LIMITS;
