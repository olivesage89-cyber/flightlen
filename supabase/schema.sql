-- FlightLine starter schema.
-- Run this in the Supabase SQL editor once you've created a project and
-- filled in NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.
--
-- Designed to support the MVP (optional accounts + favorites) while
-- leaving room for the premium features described in the product spec
-- (alerts, watchlists, history) without a schema rewrite.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.favorite_airports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  icao text not null,
  created_at timestamptz not null default now(),
  unique (user_id, icao)
);

create table if not exists public.favorite_flights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  callsign text not null,
  created_at timestamptz not null default now(),
  unique (user_id, callsign)
);

-- Placeholders for future premium features (not used by the MVP app code).
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('airport', 'flight', 'weather', 'crosswind')),
  target text not null, -- icao or callsign
  threshold jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.favorite_airports enable row level security;
alter table public.favorite_flights enable row level security;
alter table public.alerts enable row level security;

create policy "Users manage their own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users manage their own favorite airports" on public.favorite_airports
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own favorite flights" on public.favorite_flights
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own alerts" on public.alerts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
