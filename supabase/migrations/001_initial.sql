-- =====================================================================
-- OPERATION RED — Initial schema
-- =====================================================================
-- Run this in the Supabase SQL editor:
-- https://supabase.com/dashboard/project/_/sql/new
-- =====================================================================

-- Extensions
create extension if not exists "pgcrypto";

-- =====================================================================
-- PROFILES (1:1 with auth.users)
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  city text,
  country text,
  avatar_url text,
  coins int not null default 0,
  is_pro boolean not null default false,
  pro_expires_at timestamptz,
  polar_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_city_idx on public.profiles(city);
create index if not exists profiles_polar_customer_idx on public.profiles(polar_customer_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- GAMES (history)
-- =====================================================================
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  difficulty text not null check (difficulty in ('easy','medium','hard','custom','daily')),
  width int not null,
  height int not null,
  mines int not null,
  status text not null check (status in ('won','lost','abandoned')),
  time_ms int not null,
  three_bv int,
  flags_correct int not null default 0,
  flags_total int not null default 0,
  hints_used int not null default 0,
  seed bigint,
  finished_at timestamptz not null default now()
);

create index if not exists games_user_idx on public.games(user_id, finished_at desc);
create index if not exists games_leaderboard_idx on public.games(difficulty, status, time_ms asc);

-- =====================================================================
-- DAILY CHALLENGES
-- =====================================================================
create table if not exists public.daily_challenges (
  date date primary key,
  seed bigint not null,
  difficulty text not null default 'medium',
  width int not null default 16,
  height int not null default 16,
  mines int not null default 40,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_results (
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null references public.daily_challenges(date),
  status text not null check (status in ('won','lost')),
  time_ms int not null,
  three_bv int,
  flags_correct int not null default 0,
  flags_total int not null default 0,
  hints_used int not null default 0,
  finished_at timestamptz not null default now(),
  primary key (user_id, date)
);

create index if not exists daily_results_date_idx on public.daily_results(date, time_ms asc);

-- =====================================================================
-- SKINS catalog
-- =====================================================================
create table if not exists public.skins (
  id text primary key,
  name text not null,
  description text,
  kind text not null default 'board' check (kind in ('board','background','bundle')),
  rarity text not null default 'common',
  price_cents int not null default 0,
  price_coins int not null default 0,
  polar_product_id text,
  is_pro_only boolean not null default false,
  preview_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_skins (
  user_id uuid not null references public.profiles(id) on delete cascade,
  skin_id text not null references public.skins(id) on delete cascade,
  acquired_via text not null check (acquired_via in ('free','coins','polar','pro','admin')),
  acquired_at timestamptz not null default now(),
  primary key (user_id, skin_id)
);

-- =====================================================================
-- PURCHASES (Polar webhook audit)
-- =====================================================================
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  polar_order_id text unique not null,
  polar_product_id text,
  product_slug text,
  amount_cents int,
  currency text,
  payload jsonb,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- AI HINT RATE LIMITING (simple in-DB counter)
-- =====================================================================
create table if not exists public.ai_hint_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists ai_hint_log_user_time_idx on public.ai_hint_log(user_id, created_at desc);

-- =====================================================================
-- RLS
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.daily_challenges enable row level security;
alter table public.daily_results enable row level security;
alter table public.skins enable row level security;
alter table public.user_skins enable row level security;
alter table public.purchases enable row level security;
alter table public.ai_hint_log enable row level security;

-- profiles: read public (for leaderboard), write self
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
  on public.profiles for update
  using (auth.uid() = id);

-- games: read public, insert self
drop policy if exists "games_select_all" on public.games;
create policy "games_select_all"
  on public.games for select
  using (true);

drop policy if exists "games_insert_self" on public.games;
create policy "games_insert_self"
  on public.games for insert
  with check (auth.uid() = user_id);

-- daily_challenges: read public; writes via service role
drop policy if exists "daily_challenges_select_all" on public.daily_challenges;
create policy "daily_challenges_select_all"
  on public.daily_challenges for select
  using (true);

-- daily_results: read public, insert self
drop policy if exists "daily_results_select_all" on public.daily_results;
create policy "daily_results_select_all"
  on public.daily_results for select
  using (true);

drop policy if exists "daily_results_insert_self" on public.daily_results;
create policy "daily_results_insert_self"
  on public.daily_results for insert
  with check (auth.uid() = user_id);

-- skins: read public
drop policy if exists "skins_select_all" on public.skins;
create policy "skins_select_all"
  on public.skins for select
  using (true);

-- user_skins: self read/insert
drop policy if exists "user_skins_select_self" on public.user_skins;
create policy "user_skins_select_self"
  on public.user_skins for select
  using (auth.uid() = user_id);

drop policy if exists "user_skins_insert_self" on public.user_skins;
create policy "user_skins_insert_self"
  on public.user_skins for insert
  with check (auth.uid() = user_id);

-- purchases: self read only (writes via service role)
drop policy if exists "purchases_select_self" on public.purchases;
create policy "purchases_select_self"
  on public.purchases for select
  using (auth.uid() = user_id);

-- ai_hint_log: self read/insert
drop policy if exists "ai_hint_log_select_self" on public.ai_hint_log;
create policy "ai_hint_log_select_self"
  on public.ai_hint_log for select
  using (auth.uid() = user_id);

drop policy if exists "ai_hint_log_insert_self" on public.ai_hint_log;
create policy "ai_hint_log_insert_self"
  on public.ai_hint_log for insert
  with check (auth.uid() = user_id);

-- =====================================================================
-- SEED SKIN CATALOG
-- =====================================================================
insert into public.skins (id, name, description, kind, rarity, price_cents, price_coins, is_pro_only) values
  ('ops',       'OPS Default',  'Стандартная экипировка сапёра',                  'board', 'common',     0,    0, false),
  ('carbon',    'Carbon Fiber', 'Карбоновое плетение, красные циферки',           'board', 'rare',     299,  800, false),
  ('blueprint', 'Blueprint',    'Технический чертёж, инженерная точность',        'board', 'rare',     299,  800, false),
  ('neonTokyo', 'Neon Tokyo',   'Кислотный неон, киберпанк',                      'board', 'epic',     399, 1500, false),
  ('vintage',   'Vintage War',  'Сепия, военные карты, красные пометки',          'board', 'epic',     249, 1200, false),
  ('ink',       'Ink Wash',     'Японская тушь, минимализм',                       'board', 'rare',       0,  600, false),
  ('glass',     'Glass',        'Frosted glassmorphism, эксклюзив Pro',           'board', 'legendary',  0,    0, true ),
  ('void',      'Void',         'Чистая пустота',                                  'background', 'common',     0,    0, false),
  ('tacGrid',   'Tactical Grid','Координатная сетка',                              'background', 'common',     0,  200, false),
  ('concrete',  'Concrete Bunker', 'Бетонные стены подземного штаба',              'background', 'rare',     199,  500, false),
  ('topo',      'Topographic',  'Топографическая карта',                           'background', 'rare',     199,  500, false),
  ('bloodMoon', 'Blood Moon',   'Кровавая луна',                                   'background', 'epic',     299, 1000, false)
on conflict (id) do nothing;
