create table if not exists public.climate_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  farm_name text not null,
  location text,
  crop text not null,
  crop_stage text not null,
  acreage numeric,
  readings jsonb not null,
  report jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists climate_reports_user_created_idx on public.climate_reports(user_id, created_at desc);

alter table public.climate_reports enable row level security;

drop policy if exists "Users can view own reports" on public.climate_reports;
drop policy if exists "Users can create own reports" on public.climate_reports;
drop policy if exists "Users can delete own reports" on public.climate_reports;

create policy "Users can view own reports" on public.climate_reports
  for select using (auth.uid() = user_id);

create policy "Users can create own reports" on public.climate_reports
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own reports" on public.climate_reports
  for delete using (auth.uid() = user_id);
