-- MR LEE GAME ARENA 2026-11: multiplayer room state, separate from grades and Game Zone XP.
-- Server-authoritative: browser never accesses this table or its raw hands via Data API.
-- One game-room state per row. Version used for atomic compare-and-swap updates.
create table if not exists public.mrlee_arena_rooms (
  code varchar(8) primary key check (code ~ '^[A-Z2-9]{8}$'),
  game text not null check (game in ('chess','tienlen','colors')),
  visibility text not null check (visibility in ('private','public')),
  min_gold integer not null default 0 check (min_gold in (0,100,500,1000)),
  status text not null default 'waiting' check (status in ('waiting','playing','finished','closed')),
  members jsonb not null default '[]'::jsonb check (jsonb_typeof(members)='array' and jsonb_array_length(members)<=4),
  state jsonb not null default '{}'::jsonb check (jsonb_typeof(state)='object'),
  version bigint not null default 1 check (version>=1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now()+interval '90 minutes')
);
create index if not exists mrlee_arena_rooms_lobby_idx
  on public.mrlee_arena_rooms (game,visibility,status,created_at desc);
create index if not exists mrlee_arena_rooms_expire_idx
  on public.mrlee_arena_rooms (expires_at);
create index if not exists mrlee_arena_rooms_members_gin
  on public.mrlee_arena_rooms using gin (members jsonb_path_ops);
alter table public.mrlee_arena_rooms enable row level security;
revoke all on public.mrlee_arena_rooms from anon,authenticated;
-- No public RLS policies. The Edge Function verifies Firebase JWT on every request.
-- The function uses the Supabase service-role key on the server to enforce membership,
-- legal actions, and that no opponent's private cards are included in responses.
comment on table public.mrlee_arena_rooms is
  'Private Firebase-verified Arena rooms. No direct student SQL rights. Demo only; no bets or academic rewards.';
