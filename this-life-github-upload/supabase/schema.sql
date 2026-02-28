-- THIS LIFE Supabase schema (single-user setup)
-- Run in Supabase SQL Editor once.

create extension if not exists pgcrypto;

create table if not exists public.timetable_logs (
  date text not null,
  task_id text not null,
  status text not null,
  zone text,
  updated_at timestamptz not null default now(),
  primary key (date, task_id)
);
create index if not exists timetable_logs_date_idx on public.timetable_logs (date);

create table if not exists public.protocol_logs (
  date text not null,
  item_id text not null,
  status text not null,
  zone text,
  auto boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (date, item_id)
);
create index if not exists protocol_logs_date_idx on public.protocol_logs (date);

create table if not exists public.work_schedule (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  date text not null,
  time text,
  priority text,
  created_at timestamptz not null default now()
);
create index if not exists work_schedule_date_idx on public.work_schedule (date);

create table if not exists public.meetings_schedule (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  with_whom text,
  date text not null,
  time text,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists meetings_schedule_date_idx on public.meetings_schedule (date);

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  category text not null,
  linked_brand text,
  created_at timestamptz not null default now()
);
create index if not exists ideas_created_at_idx on public.ideas (created_at desc);

create table if not exists public.brands_current (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.brands_pipeline (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,
  planned_start_date text,
  source_idea text,
  sort_order int not null default 1,
  created_at timestamptz not null default now()
);
create index if not exists brands_pipeline_sort_order_idx on public.brands_pipeline (sort_order asc);

create table if not exists public.brands_live (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date text,
  revenue_log jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  phase int,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists public.brands_archive (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  reason text,
  closed_date text,
  total_revenue numeric not null default 0,
  summary text,
  created_at timestamptz not null default now()
);

create table if not exists public.connections (
  date text primary key,
  count int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.planning_monthly (
  month_key text primary key,
  goals jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.planning_weekly (
  week_key text primary key,
  goals jsonb not null default '[]'::jsonb,
  tasks jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.planning_daily (
  date text primary key,
  goals jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.settings_app (
  id text primary key,
  dream_version_description text,
  countdown_start_date text,
  last_visit_date text,
  updated_at timestamptz not null default now()
);

insert into public.settings_app (id, dream_version_description, countdown_start_date, last_visit_date)
values ('app', 'Build an unstoppable body, mind, and business machine.', to_char(now(), 'YYYY-MM-DD'), null)
on conflict (id) do nothing;

-- Single-user permissive policies (because app uses no Supabase Auth)
-- IMPORTANT: For stronger security, migrate to Supabase Auth and tighten policies.

do $$
declare
  t text;
begin
  foreach t in array array[
    'timetable_logs',
    'protocol_logs',
    'work_schedule',
    'meetings_schedule',
    'ideas',
    'brands_current',
    'brands_pipeline',
    'brands_live',
    'brands_archive',
    'connections',
    'planning_monthly',
    'planning_weekly',
    'planning_daily',
    'settings_app'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "%I_public_all" on public.%I;', t, t);
    execute format('create policy "%I_public_all" on public.%I for all using (true) with check (true);', t, t);
  end loop;
end $$;

-- Ensure anon/authenticated roles can access these tables when policies allow it.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

alter default privileges in schema public
grant select, insert, update, delete on tables to anon, authenticated;

alter default privileges in schema public
grant usage, select on sequences to anon, authenticated;
