<div align="center">

# `OPERATION_RED`

### Advanced Minesweeper for probabilistic minds

[![Live](https://img.shields.io/badge/LIVE-opsred.vercel.app-e63946?style=for-the-badge&logoColor=white)](https://opsred.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Polar](https://img.shields.io/badge/Polar.sh-Merchant-1c1c1c?style=for-the-badge)](https://polar.sh)
[![Tests](https://img.shields.io/badge/tests-20%20passing-22c55e?style=for-the-badge)](./lib/game/engine.test.ts)

```
┌──────────────────────────────────────────────────────────┐
│  [ OPS ]  [ SECTOR-04 ]  [ CLASSIFIED ]  [• LIVE ]       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│          DEFUSE THE FIELD.                               │
│                                                          │
│          Not another Minesweeper clone — a trainer       │
│          for the kind of probabilistic reasoning         │
│          that real-life decisions need.                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### **[→ Play it now at opsred.vercel.app](https://opsred.vercel.app)**

</div>

---

## The pitch

Most browser Minesweeper clones are technically Minesweeper — and nothing else. **Operation Red** treats the game as a starting point for something bigger:

- a **trainer** for probabilistic reasoning, with a hybrid AI Coach that explains *why* a move is safe;
- a **competitive platform** with a Daily Challenge — one identical field for every player on Earth — and city-level leaderboards;
- a **commercial prototype** with skin / background marketplace and Pro subscription billing through **real Polar.sh checkouts** that hit production. Not a fake "Upgrade to Pro" button — actual payments, with webhooks, entitlements and tax handled.

Shipped as one deployment, three languages, any screen.

---

## What's inside the box

### `01` AI Coach — solver-first hybrid

Every hint request runs **two analyses before responding**:

1. **Server-side constraint solver** (pure TypeScript). Walks the board, builds constraints, applies subset deduction. If it finds a logically certain move, returns `confidence: 1.0` — no LLM call.
2. **Google Gemini 2.5 Flash** as a fallback for genuinely ambiguous positions. Receives a textual grid render and a `responseSchema` for structured output. Returns the safest closed cell with reasoning.

Each answer carries a visible badge so the player knows what they're looking at:

| Badge | Meaning |
|---|---|
| `SOLVER · 100%` | Logically deduced. Mathematically guaranteed. |
| `GEMINI AI` | Probabilistic guidance from the LLM (may be wrong on hard positions). |
| `HEURISTIC` | Local fallback when neither is possible (no key / rate-limited / offline). |

If Gemini is offline or the user hits the free limit, the server degrades to the solver's probabilistic guess instead of returning an error.

### `02` Daily Challenge

The seed for each day's board is **deterministic** — derived from the UTC date through Mulberry32 — so two players in Almaty and Tokyo open the exact same field and compete on time and accuracy. Results live in their own `daily_results` table with a dedicated leaderboard.

### `03` City-level leaderboards

Every game is logged with the player's `profiles.city`. The leaderboard view filters by city ("Top players from Almaty") on top of the global ranking, so local communities compete inside the broader ladder.

### `04` Visual language — brutalist `OPS·RED`

The whole product is themed as a military command interface. Red / grey / black / white only. Sharp 0px-radius corners, monospaced UI, stencil tags, subtle film grain and scan-lines, animated detonation shake.

- **Two themes** — `dark` (default) and `light`, both designed from scratch (light isn't auto-generated).
- **7 board skins × 8 backgrounds = 56 combinations** — Carbon, Blueprint, Neon Tokyo, Vintage War, Ink Wash, Glass (PRO exclusive); over Tactical Radar, Concrete Bunker, Topographic, Blood Moon, Dossier, Carrara Marble, Snow Ops.
- Each skin is a **CSS-variable token pack** (`--cell-bg`, `--num-1` … `--num-8`) — one Cell component, dramatically different art.
- Backgrounds are **inline SVG data URIs** — no image files in the repo. Radar screen with concentric rings and azimuths. Concrete bunker with hazard chevrons and an emergency lamp. Military topographic map with two peaks, a compass and Almaty coordinates. Blood moon with craters, stars and fog. Cream archive paper with red `CLASSIFIED` stamps. White Carrara marble with red veining.

### `05` Real payments via Polar.sh

The shop isn't a mock. Buying redirects through `/api/polar/buy?slug=…`, which:

1. Resolves the slug to the real Polar product id **server-side** (env vars are server-only — never leak into the client bundle).
2. Attaches the Supabase user's email and `external_id`.
3. Forwards to the `@polar-sh/nextjs` Checkout handler.

A signed webhook receives `order.created` and `subscription.*` events, links the Polar customer to a Supabase profile through `external_id`, inserts entitlements into `user_skins`, and toggles `is_pro` on profiles. Pro subscribers get `∞` AI hints and unlock the legendary `Glass` skin.

There's also an in-game currency (`coins`) earned by winning games, so the marketplace has both a paid path and a grind path. Server-side `/api/skins/buy` is authoritative (validates balance + grants atomically).

### `06` Trilingual — `RU` / `EN` / `KZ`

Every user-facing string lives in a typed dictionary. The globe button cycles through the three languages and persists the choice. **Names of skins and backgrounds stay as their brand identifiers**, but descriptions, server responses, AI Coach reasoning, toasts, form labels — everything else swaps instantly.

For Gemini specifically, the chosen language is embedded into the system prompt so the LLM's free-form reasoning matches whatever the player picked. Try the same hint in three languages — you'll get three different answers in three different languages, each grammatically correct.

---

## Tech stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | **Next.js 16** App Router | RSC + edge runtime, fast iteration |
| Language | **TypeScript 5.9** (strict) | End-to-end types, including the DB schema |
| Styling | **Tailwind CSS v4** | CSS-variable theming for skins / themes |
| State | **Zustand** + `persist` | No boilerplate, localStorage out of the box |
| Engine | **Pure TypeScript** | Zero React deps; 20 Vitest tests |
| Auth + DB | **Supabase** (`@supabase/ssr`) | Postgres + RLS + magic-link / password / OAuth |
| AI | **Google Gemini 2.5 Flash** | Cheap, fast, structured output via `responseSchema` |
| Payments | **Polar.sh** (`@polar-sh/nextjs`) | Merchant of record — handles tax / VAT globally |
| Animation | **Framer Motion** | Reveal ripple, detonation shake |
| Toasts | **Sonner** | Custom-styled, matches the brutalist theme |
| Tests | **Vitest** | Engine unit tests |

---

## Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                       Browser  (RSC + Client)                     │
│                                                                   │
│    ┌─────────────┐   ┌──────────────┐   ┌────────────────────┐    │
│    │ Game Store  │   │  Settings    │   │  Inventory Store   │    │
│    │  (Zustand)  │   │ theme · lang │   │  skins · coins · ★ │    │
│    └──────┬──────┘   └──────────────┘   └─────────┬──────────┘    │
│           │                                       │               │
│           ▼                                       │               │
│    ┌─────────────────────────────┐                │               │
│    │   Pure Engine + Solver      │                │               │
│    │   first-click safe          │                │               │
│    │   flood-fill · chord · 3BV  │                │               │
│    └─────────────┬───────────────┘                │               │
│                  │                                │               │
└──────────────────┼────────────────────────────────┼───────────────┘
                   │                                │
       POST /api/ai-coach                /api/polar/buy?slug=
       POST /api/games                              │
                   │                                │
                   ▼                                ▼
       ┌──────────────────────┐         ┌────────────────────┐
       │   /api/ai-coach      │         │      Polar.sh      │
       │                      │         │   Checkout +       │
       │   1. Solver  ── ✓ ── │ ─→ done │   Webhook signer   │
       │   2. Gemini  ── ? ── │ ─→ LLM  └─────────┬──────────┘
       │   3. Rate-limit      │                   │
       └──────────┬───────────┘                   │
                  │                               │
                  ▼                               ▼
       ┌──────────────────────────────────────────────────────┐
       │                       Supabase                        │
       │   profiles · games · daily_challenges · daily_results │
       │       skins · user_skins · purchases · hint_log       │
       │                  Postgres + RLS                       │
       └──────────────────────────────────────────────────────┘
```

---

## Things that took thought, not just code

A few decisions where the right answer wasn't obvious:

- **Solver-first AI Coach.** Calling Gemini for every hint would have been simpler. But LLMs hallucinate on positions a 50-line constraint solver could prove are trivially safe. So the API always tries the deterministic solver first; Gemini is only invoked on genuinely ambiguous boards. Free-tier rate limits drop, and the player gets correct moves on easy positions every time.

- **First-click safety.** Mines are placed *after* the first click, excluding the clicked cell and all eight of its neighbors. This guarantees a meaningful flood-fill on move one — no "you lost on the first click" frustration. Stress-tested in `engine.test.ts` against dense boards.

- **Server-side product resolution.** Polar product IDs were initially read from `process.env.POLAR_PRODUCT_*` directly in the shop **client component**. That silently failed in production because Next.js doesn't inline non-`NEXT_PUBLIC_` env vars into the client bundle — every Buy button was passing `undefined`. Fixed by adding a thin `/api/polar/buy?slug=` redirect that resolves the slug on the server and 307s through to the Polar adapter.

- **Backgrounds as SVG data URIs.** No image files in the repo. Each background is a hand-tuned ~1–3KB SVG inlined via `url("data:image/svg+xml;utf8,...")`. Encoding correctness was non-trivial (double-encoded `%23` for hex colors broke the first attempt). Zero extra requests, zero CDN dependency, everything is part of the JS bundle.

- **i18n that includes AI output.** The chosen language is sent to `/api/ai-coach` and forwarded into Gemini's system prompt, so the model writes its reasoning in whatever language the player picked. The constraint solver renders its proofs through `tServer(locale, key, params)` with `{x}/{y}/{pct}` interpolation. The locale dictionary stays a flat typed map — autocomplete works on every `t("…")` call.

- **First-class light theme.** Most apps either don't have a light theme or auto-derive it from `prefers-color-scheme`. Operation Red has both themes designed deliberately, with separate palettes — the brutalist red accent is the only constant. Skins and backgrounds were re-tuned so the page looks editorial in either mode.

- **3BV in the DB.** Every game logs Bechtel's Board Benchmark Value. Not surfaced in the UI yet, but it lets the leaderboard one day rank by "skill per second" instead of pure time.

---

## Local development

```bash
pnpm install
cp .env.local.example .env.local       # fill in the keys (instructions inside)
pnpm dev                                # → http://localhost:3000
pnpm test                               # 20 engine tests
pnpm build                              # production build
```

Without `.env.local`, the game is still fully playable locally — only auth, leaderboards, AI Coach (Gemini), and Polar checkout are gated on real keys. The AI Coach gracefully falls back to the local solver.

### Keys you need

- **Supabase** project URL + anon + service-role keys → run `supabase/migrations/001_initial.sql` in the SQL editor of a new project.
- **Gemini** API key → free tier on [aistudio.google.com](https://aistudio.google.com/app/apikey).
- **Polar.sh** access token + 11 product IDs (skins, backgrounds, Pro Monthly, Mega Bundle).

Full step-by-step instructions live in [`.env.local.example`](./.env.local.example).

---

## Project layout

```
minesweeper/
├── app/
│   ├── (auth)/         login · reset-password
│   ├── (game)/         play · daily · leaderboard · shop · profile
│   ├── api/            ai-coach · daily · games · leaderboard · polar/*
│   └── page.tsx        landing
├── components/
│   ├── game/           Board · Cell · Timer · AICoachPanel · GameOverModal
│   ├── hud/            TopBar · ThemeToggle · LanguageToggle · BackgroundSurface
│   └── shop/           SkinPreview
├── lib/
│   ├── game/           engine · generator · solver · seedrandom    ← pure TS
│   ├── ai/             gemini · prompt · serverSolver · serializeBoard
│   ├── i18n/           dictionaries (RU/EN/KZ) · useT · serverT
│   ├── skins/          registry (CSS-variable token packs) · backgrounds (SVG)
│   ├── polar/          products + slug↔id mapping
│   ├── stores/         game · settings · inventory (Zustand + persist)
│   └── supabase/       client · server · session-refreshing proxy
└── supabase/migrations/001_initial.sql
```

---

## Roadmap

Honest list of things that would matter for a real launch:

- [ ] Sound effects (currently silent — brutalist aesthetic doesn't need a "ping")
- [ ] Real-time multiplayer — watch a friend's board, head-to-head races
- [ ] Replay system — save move-by-move history so winning runs are shareable
- [ ] PWA / offline mode
- [ ] Friend / following / private leaderboards
- [ ] Tournament brackets for the Daily Challenge
- [ ] Difficulty-specific 3BV percentile surfaced in the UI

---

## Credits

- Game theory & **3BV** from the classic Minesweeper community.
- `@polar-sh/nextjs` adapter pattern.
- `@supabase/ssr` cookie handling.
- All other code, design, dictionaries, and SVG art written from scratch.

---

<div align="center">

```
[ OPERATION RED · MISSION ACTIVE ]
```

**Train your probabilistic mind. Defuse the field.**

### **[opsred.vercel.app](https://opsred.vercel.app)**

</div>
