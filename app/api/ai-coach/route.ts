import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { serializeBoard } from "@/lib/ai/serializeBoard";
import { getCoachHint } from "@/lib/ai/gemini";
import { solveBoardServer, type ServerHint } from "@/lib/ai/serverSolver";
import { parseLocale, tServer } from "@/lib/i18n/serverT";

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
  locale: z.enum(["ru", "en", "kz"]).optional(),
});

const WINDOW_MS = 5 * 60 * 1000;
const FREE_LIMIT = 5;

/** Confidence threshold above which we trust the deterministic solver. */
const SOLVER_TRUST = 0.99;

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
  const locale = parseLocale(parsed.data.locale);

  // ── 1. Try deterministic solver first ─────────────────────────
  const solverHint: ServerHint | null = solveBoardServer(
    parsed.data.board,
    parsed.data.width,
    parsed.data.height,
    parsed.data.mines,
    parsed.data.flagsPlaced,
    locale,
  );

  if (solverHint && solverHint.confidence >= SOLVER_TRUST) {
    // Logical certainty — no need to call the LLM, no rate-limit charge.
    return NextResponse.json({
      ...solverHint,
      // Make sure target cell is actually actionable
      ...assertActionable(parsed.data.board, solverHint),
    });
  }

  // ── 2. Need Gemini for an ambiguous position ──────────────────
  if (!process.env.GEMINI_API_KEY) {
    // Fall back to solver's probabilistic guess (still informative)
    if (solverHint) return NextResponse.json(solverHint);
    return NextResponse.json({ error: "gemini not configured" }, { status: 503 });
  }

  // Auth + rate-limit (only counts paid Gemini calls)
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
          if (solverHint) {
            return NextResponse.json({
              ...solverHint,
              reasoning:
                tServer(locale, "server.geminiOverLimit") +
                " " +
                solverHint.reasoning,
            });
          }
          return NextResponse.json(
            {
              error: "rate_limit",
              message: tServer(locale, "server.rateLimit", {
                limit: FREE_LIMIT,
                minutes: WINDOW_MS / 60000,
              }),
            },
            { status: 429 },
          );
        }
      }
    }
  } catch {
    /* Supabase not configured — anonymous use */
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
      locale,
    });

    // Sanity check — never recommend an already-open cell
    const target = parsed.data.board[hint.y]?.[hint.x];
    if (!target || target.state === "open") {
      // Fall back to solver
      if (solverHint) return NextResponse.json(solverHint);
      return NextResponse.json(
        { error: "invalid_target_from_ai" },
        { status: 502 },
      );
    }

    // Cap Gemini confidence — model tends to over-estimate. If solver disagrees
    // with high confidence on the same cell, prefer solver.
    let finalHint = { ...hint, source: "ai" as const };
    if (solverHint && solverHint.x === hint.x && solverHint.y === hint.y) {
      finalHint = {
        ...finalHint,
        confidence: Math.max(hint.confidence, solverHint.confidence),
      };
    }

    if (userId) {
      try {
        const supabase = await createSupabaseServerClient();
        await supabase.from("ai_hint_log").insert({ user_id: userId });
      } catch {
        /* best-effort */
      }
    }

    return NextResponse.json(finalHint);
  } catch (e) {
    // Gemini failed — serve solver guess if we have one
    if (solverHint) {
      return NextResponse.json({
        ...solverHint,
        reasoning:
          tServer(locale, "server.geminiOffline") + " " + solverHint.reasoning,
      });
    }
    const msg = e instanceof Error ? e.message : "ai error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

function assertActionable(
  board: { state: string }[][],
  hint: ServerHint,
): Partial<ServerHint> {
  const target = board[hint.y]?.[hint.x];
  if (!target || target.state === "open") {
    // Should never happen, but bail with confidence 0 to signal frontend
    return { confidence: 0, reasoning: "[invalid solver target]" };
  }
  return {};
}
