-- MR LEE: migration for one-way Firebase -> Supabase sync.
-- Execute ONCE in the current Supabase Admin project SQL Editor.
-- Keeps old admin roles, students, scores and Row Level Security policies.
-- Do not run the old base setup SQL again to replace existing data.

create extension if not exists pgcrypto;

alter table public.mrlee_students
  add column if not exists firebase_uid text,
  add column if not exists firebase_synced_at timestamptz,
  add column if not exists firebase_email_verified boolean,
  add column if not exists firebase_learning_level text,
  add column if not exists last_activity_at timestamptz;

create unique index if not exists mrlee_students_firebase_uid_uq
  on public.mrlee_students(firebase_uid);

alter table public.mrlee_scores
  add column if not exists firebase_attempt_id text,
  add column if not exists firebase_created_at timestamptz,
  add column if not exists source_kind text not null default 'manual';

create unique index if not exists mrlee_scores_firebase_attempt_id_uq
  on public.mrlee_scores(firebase_attempt_id);

create table if not exists public.mrlee_learning_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.mrlee_students(id) on delete cascade,
  firebase_event_id text not null unique,
  kind text not null default 'visit',
  page text not null default '',
  title text not null,
  detail text not null default '',
  happened_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists mrlee_learning_events_happened_idx
  on public.mrlee_learning_events(happened_at desc);
create index if not exists mrlee_learning_events_student_idx
  on public.mrlee_learning_events(student_id, happened_at desc);

create table if not exists public.mrlee_sync_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null check (status in ('success', 'failed')),
  started_at timestamptz not null,
  finished_at timestamptz not null,
  students_seen integer not null default 0,
  students_created integer not null default 0,
  events_seen integer not null default 0,
  attempts_seen integer not null default 0
);
create index if not exists mrlee_sync_runs_finished_idx
  on public.mrlee_sync_runs(finished_at desc);

alter table public.mrlee_learning_events enable row level security;
alter table public.mrlee_sync_runs enable row level security;
revoke all on table public.mrlee_learning_events from public, anon, authenticated;
revoke all on table public.mrlee_sync_runs from public, anon, authenticated;
grant select on table public.mrlee_learning_events to authenticated;
grant select on table public.mrlee_sync_runs to authenticated;

-- Admin-only read. No browser (including an admin) may modify sync logs/events.
drop policy if exists mrlee_events_admin_select on public.mrlee_learning_events;
create policy mrlee_events_admin_select on public.mrlee_learning_events
  for select to authenticated using (
    exists (select 1 from public.mrlee_admins a where a.user_id = (select auth.uid()))
  );
drop policy if exists mrlee_sync_runs_admin_select on public.mrlee_sync_runs;
create policy mrlee_sync_runs_admin_select on public.mrlee_sync_runs
  for select to authenticated using (
    exists (select 1 from public.mrlee_admins a where a.user_id = (select auth.uid()))
  );

-- Important: The backend uses the Supabase SECRET key (service role), never the
-- anon / publishable key. It bypasses RLS. Store it ONLY in GitHub Secrets.
-- This migration does not alter policies on mrlee_students or mrlee_scores.
