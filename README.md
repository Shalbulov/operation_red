# OPERATION RED — Advanced Minesweeper

Брутальный военно-индустриальный Сапёр с AI-коучем (Google Gemini), ежедневным челленджем для всех игроков мира, лидербордами по городам и магазином скинов/фонов на Polar.sh.

**Стек:** Next.js 16 · TypeScript · Tailwind v4 · Zustand · Supabase · Gemini 2.5 Flash · Polar.sh · Framer Motion · Vitest

---

## Быстрый старт

```bash
cd minesweeper
pnpm install
cp .env.local.example .env.local   # заполнить ключи (см. ниже)
pnpm dev
```

Открой `http://localhost:3000`. Без `.env.local` игра играется локально — но AI-коуч уходит на локальный probability-solver (fallback), а авторизация и Polar-checkout будут показывать соответствующие сообщения.

### Тесты движка

```bash
pnpm test        # все 20 юнит-тестов pure-engine
```

### Production build

```bash
pnpm build && pnpm start
```

---

## Настройка интеграций

### 1. Supabase

1. Создай проект в [supabase.com/dashboard](https://supabase.com/dashboard).
2. В **SQL Editor** выполни весь файл `supabase/migrations/001_initial.sql` — он создаёт таблицы, RLS, триггер auto-create профиля и сидит каталог скинов.
3. **Settings → API** скопируй `URL`, `anon` и `service_role` ключи в `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...   # секретный, только сервер
   ```
4. **Authentication → Providers**: включи Google (или email — works out of the box) и добавь redirect URL: `http://localhost:3000/api/auth/callback`.

### 2. Gemini (AI Coach)

1. Получи бесплатный ключ на [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).
2. В `.env.local`:
   ```env
   GEMINI_API_KEY=...
   GEMINI_MODEL=gemini-2.5-flash
   ```
3. Без ключа коуч автоматически использует локальный probability solver — игра остаётся играбельной.

### 3. Polar.sh (скины + Pro)

1. Зарегистрируйся в **sandbox** по адресу [sandbox.polar.sh](https://sandbox.polar.sh).
2. Создай продукты в дашборде (пример):
   - Pro Monthly — subscription, $4.99
   - Skin Pack: Carbon — $2.99
   - Skin Pack: Blueprint — $2.99
   - Skin Pack: Neon Tokyo — $3.99
   - Skin Pack: Vintage — $2.49
   - Background: Blood Moon — $2.99
   - Mega Bundle — $9.99
3. Скопируй `Product ID` каждого в `.env.local`:
   ```env
   POLAR_ACCESS_TOKEN=polar_oat_...
   POLAR_WEBHOOK_SECRET=whsec_...
   POLAR_SERVER=sandbox
   POLAR_SUCCESS_URL=http://localhost:3000/shop?success=true
   POLAR_PRODUCT_PRO_MONTHLY=prod_...
   POLAR_PRODUCT_SKIN_CARBON=prod_...
   POLAR_PRODUCT_SKIN_BLUEPRINT=prod_...
   POLAR_PRODUCT_SKIN_NEON=prod_...
   POLAR_PRODUCT_SKIN_VINTAGE=prod_...
   POLAR_PRODUCT_BG_BLOODMOON=prod_...
   POLAR_PRODUCT_BUNDLE_MEGA=prod_...
   ```
4. **Webhooks** → создай endpoint на `http://localhost:3000/api/polar/webhook` (для локалки используй ngrok), скопируй webhook secret.

Подробнее: [polar.sh/docs/integrate/sdk/adapters/nextjs](https://polar.sh/docs/integrate/sdk/adapters/nextjs).

---

## Структура

```
minesweeper/
├── app/
│   ├── (auth)/login/         — magic-link + Google auth
│   ├── (game)/
│   │   ├── play/             — основная игра
│   │   ├── daily/            — Daily Challenge
│   │   ├── leaderboard/      — топ по сложности + city-filter
│   │   ├── shop/             — скины · фоны · Pro
│   │   └── profile/          — статистика + история
│   ├── api/
│   │   ├── ai-coach/         — Gemini proxy + rate-limit
│   │   ├── daily/            — сегодняшний seed
│   │   ├── games/            — запись результата + начисление монет
│   │   ├── leaderboard/      — выборка с RLS
│   │   ├── skins/buy/        — покупка за внутриигровые монеты
│   │   └── polar/{checkout,portal,webhook}
│   ├── layout.tsx            — fonts + grain overlay
│   ├── globals.css           — дизайн-система OPS·RED
│   └── page.tsx              — лендинг
├── components/
│   ├── game/                 — Board, Cell, Timer, MineCounter, AICoachPanel, GameOverModal
│   ├── shop/SkinPreview.tsx
│   └── hud/TopBar.tsx
├── lib/
│   ├── game/                 — pure engine + tests
│   ├── ai/                   — Gemini client + prompt + board serializer
│   ├── skins/                — registry скинов и фонов (CSS-tokens)
│   ├── stores/               — Zustand (game / settings / inventory)
│   ├── supabase/             — клиент / сервер / middleware
│   └── polar/products.ts     — маппинг Polar product_id → entitlements
├── supabase/migrations/001_initial.sql
├── proxy.ts                  — Supabase session refresh (Next 16 proxy)
└── vitest.config.ts
```

---

## Game Engine

Чистый TypeScript, 0 React-зависимостей. См. `lib/game/`:

- `engine.ts` — `revealCell`, `toggleFlag`, `chord`, immutable state.
- `generator.ts` — **first-click safe** (мины расставляются ПОСЛЕ первого клика, исключая 3×3 вокруг).
- `seedrandom.ts` — Mulberry32 PRNG + `seedForDate(...)` для Daily.
- `solver.ts` — 3BV-метрика + локальный probability-solver (fallback для AI-коуча).

20 юнит-тестов в `engine.test.ts` (vitest).

---

## Дизайн-система OPS·RED

Палитра — только красный / серый / чёрный / белый. Брутализм, военно-индустриальная эстетика. Никаких градиентов, эмодзи и закруглений (radius 0).

| Token | Использование |
|---|---|
| `--bg-void`, `--bg-panel`, `--bg-elevated` | Фоны |
| `--steel-*` | Серые акценты, бордеры |
| `--bone`, `--bone-dim` | Текст |
| `--red-alert`, `--red-blood`, `--red-glow` | Акценты, кнопки, ошибки |
| `--num-1` … `--num-8` | Цвета цифр в клетках (переопределяются скинами) |

Шрифты: Space Grotesk (display, uppercase), Geist Mono (числа/UI), Inter (body).

---

## Скины

7 скинов доски + 5 фонов — все в `lib/skins/registry.ts` и `lib/skins/backgrounds.ts`. Скин = набор CSS-переменных (`--cell-bg`, `--num-*`, ...) применяемых к `<Board>`. Чтобы добавить новый скин — задай токены и зарегистрируй его в реестре + соответствующая строка в `supabase/migrations/001_initial.sql` (seed catalog).

---

## Production checklist

- [ ] Все ключи в `.env.local` (Supabase + Gemini + Polar)
- [ ] Миграция `001_initial.sql` выполнена
- [ ] Polar-products созданы и Product ID добавлены в env
- [ ] Webhook URL зарегистрирован в Polar dashboard
- [ ] Google OAuth redirect URL добавлен в Supabase Authentication
- [ ] `pnpm test` и `pnpm build` зелёные
- [ ] Деплой на Vercel (`vercel deploy`) — env-vars дублируются в Vercel dashboard

---

**Operation Red — тренируй мозг, а не только рефлексы.**
