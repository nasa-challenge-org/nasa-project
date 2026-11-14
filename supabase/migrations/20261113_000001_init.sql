-- LunarEdge app-owned metadata only.
-- Do not store Horizons samples or LOLA rasters in PostgreSQL.

create extension if not exists pgcrypto;

create table if not exists public.landing_sites (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  gsfc_site_id text,
  latitude_deg double precision,
  longitude_east_deg double precision,
  altitude_km double precision,
  coordinate_reference text not null,
  verification_status text not null default 'unverified',
  description text,
  source_url text,
  data_page_url text,
  dem_product_id text,
  dem_resolution_m numeric,
  terrain_status text not null default 'not_configured',
  created_at timestamptz not null default now(),
  check (latitude_deg is null or latitude_deg between -90 and 90),
  check (
    longitude_east_deg is null
    or (longitude_east_deg >= 0 and longitude_east_deg < 360)
  ),
  check (
    verification_status in ('unverified', 'verified', 'rejected')
  ),
  check (
    (
      verification_status = 'verified'
      and latitude_deg is not null
      and longitude_east_deg is not null
    )
    or verification_status <> 'verified'
  )
);

create table if not exists public.mission_scenarios (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  site_id uuid references public.landing_sites(id),
  start_utc timestamptz not null,
  duration_hours integer not null check (duration_hours between 1 and 336),
  step_minutes integer not null check (step_minutes in (5, 10, 15, 30, 60)),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analysis_summaries (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.mission_scenarios(id) on delete cascade,
  source_status text not null,
  sunlight_hours numeric,
  earth_visibility_hours numeric,
  longest_earth_blackout_hours numeric,
  mean_solar_elevation_deg numeric,
  terrain_method text,
  data_provenance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.landing_sites is
  'Curated site metadata. Coordinates may be null until verified. Not NASA official landing coordinates.';
comment on table public.mission_scenarios is
  'User/app saved scenario configuration. No ephemeris samples.';
comment on table public.analysis_summaries is
  'Small derived summary only. Null metrics mean not computed.';

alter table public.landing_sites enable row level security;
alter table public.mission_scenarios enable row level security;
alter table public.analysis_summaries enable row level security;

-- Public read of curated catalogue only. No public writes.
create policy landing_sites_public_read
  on public.landing_sites
  for select
  to anon, authenticated
  using (true);

-- Writes: service role bypasses RLS. Do not add anon insert/update/delete policies.
-- mission_scenarios and analysis_summaries have RLS enabled with no public policies.
