-- MR LEE GAME ZONE: additive, separate from TOPIK Spark and existing rewards.
-- Inspect in Supabase SQL Editor before first execution. Never rerun the legacy setup.
-- Students use Firebase Auth; Supabase Admin accounts alone manage question records.
-- Awarded Game XP is educational only: not cash, certificates, scholarships or discipline.
create table if not exists public.mrlee_game_questions (
  id uuid primary key default gen_random_uuid(),
  cap smallint not null check (cap between 1 and 6),
  bai smallint not null check (bai between 1 and 15),
  kind text not null check (kind in ('vocabulary','grammar','reading')),
  prompt text not null check (char_length(prompt) between 3 and 500),
  options jsonb not null check (jsonb_typeof(options)='array' and jsonb_array_length(options)=4),
  answer_index smallint not null check (answer_index between 0 and 3),
  explanation text not null default '',
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  unique (cap,bai,kind,prompt)
);
create index if not exists mrlee_game_questions_lookup_idx
  on public.mrlee_game_questions(cap,bai,approved);

create table if not exists public.mrlee_game_sessions (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text not null check (char_length(firebase_uid) between 10 and 128),
  cap smallint not null check (cap between 1 and 6),
  bai smallint not null check (bai between 1 and 15),
  question_ids uuid[] not null check (array_length(question_ids,1)=5),
  state text not null default 'active' check (state in ('active','completed')),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null default (now()+interval '10 minutes'),
  completed_at timestamptz
);
create index if not exists mrlee_game_sessions_uid_day_idx
  on public.mrlee_game_sessions(firebase_uid,started_at desc);

create table if not exists public.mrlee_game_attempts (
  session_id uuid primary key references public.mrlee_game_sessions(id),
  firebase_uid text not null,
  cap smallint not null,
  bai smallint not null,
  correct smallint not null check (correct between 0 and 5),
  total smallint not null default 5 check (total=5),
  xp integer not null check (xp between 0 and 20),
  week_start date not null,
  finished_at timestamptz not null default now()
);
create index if not exists mrlee_game_attempts_uid_idx
  on public.mrlee_game_attempts(firebase_uid,finished_at desc);

create table if not exists public.mrlee_game_awards (
  firebase_uid text not null,
  week_start date not null,
  cap smallint not null,
  bai smallint not null,
  xp integer not null check (xp between 1 and 20),
  earned_on date not null,
  session_id uuid not null unique references public.mrlee_game_sessions(id),
  earned_at timestamptz not null default now(),
  primary key(firebase_uid,week_start,cap,bai)
);
create index if not exists mrlee_game_awards_daily_idx
  on public.mrlee_game_awards(firebase_uid,earned_on);

create table if not exists public.mrlee_game_weekly (
  firebase_uid text not null,
  week_start date not null,
  alias text not null check(char_length(alias) between 1 and 64),
  xp integer not null default 0 check (xp >= 0),
  awarded_lessons integer not null default 0 check (awarded_lessons >= 0),
  updated_at timestamptz not null default now(),
  primary key(firebase_uid,week_start)
);
create index if not exists mrlee_game_weekly_rank_idx
 on public.mrlee_game_weekly(week_start,xp desc,updated_at);

-- All new tables deny public access by default. Supabase Admin JWT is not a Firebase JWT.
alter table public.mrlee_game_questions enable row level security;
alter table public.mrlee_game_sessions enable row level security;
alter table public.mrlee_game_attempts enable row level security;
alter table public.mrlee_game_awards enable row level security;
alter table public.mrlee_game_weekly enable row level security;
revoke all on public.mrlee_game_questions,public.mrlee_game_sessions,
  public.mrlee_game_attempts,public.mrlee_game_awards,public.mrlee_game_weekly
  from anon,authenticated;

-- Supabase Admin reads dashboards, reviews and uploads questions. No student browser SQL writes.
grant select,insert,update on public.mrlee_game_questions to authenticated;
grant select on public.mrlee_game_sessions,public.mrlee_game_attempts,
  public.mrlee_game_awards,public.mrlee_game_weekly to authenticated;
drop policy if exists game_bank_admin_select on public.mrlee_game_questions;
create policy game_bank_admin_select on public.mrlee_game_questions for select to authenticated
  using (exists(select 1 from public.mrlee_admins a where a.user_id=(select auth.uid())));
drop policy if exists game_bank_admin_insert on public.mrlee_game_questions;
create policy game_bank_admin_insert on public.mrlee_game_questions for insert to authenticated
  with check (exists(select 1 from public.mrlee_admins a where a.user_id=(select auth.uid())));
drop policy if exists game_bank_admin_update on public.mrlee_game_questions;
create policy game_bank_admin_update on public.mrlee_game_questions for update to authenticated
  using (exists(select 1 from public.mrlee_admins a where a.user_id=(select auth.uid())))
  with check (exists(select 1 from public.mrlee_admins a where a.user_id=(select auth.uid())));
do $$
declare tab text;
begin
 for tab in select unnest(array['mrlee_game_sessions','mrlee_game_attempts','mrlee_game_awards','mrlee_game_weekly']) loop
   execute format('drop policy if exists game_admin_read on public.%I',tab);
   execute format(
    'create policy game_admin_read on public.%I for select to authenticated using (exists(select 1 from public.mrlee_admins a where a.user_id=(select auth.uid())))',tab);
 end loop;
end $$;

-- Atomic completion: verify answers against private bank in SQL, not untrusted client score.
create or replace function public.mrlee_game_finish(
  p_session_id uuid, p_firebase_uid text, p_answers jsonb
) returns jsonb
language plpgsql security definer set search_path=''
as $$
declare
 s public.mrlee_game_sessions%rowtype;
 idx integer;
 hits integer;
 earned integer := 0;
 spent_today integer;
 today_vn date;
 week_vn date;
 result_row public.mrlee_game_attempts%rowtype;
 inserted_xp integer;
begin
 if p_firebase_uid is null or char_length(p_firebase_uid) < 10 then
   raise exception 'Invalid identity';
 end if;
 select * into s from public.mrlee_game_sessions
 where id=p_session_id and firebase_uid=p_firebase_uid for update;
 if not found then raise exception 'Session not found';end if;
 if s.state='completed' then
   select * into result_row from public.mrlee_game_attempts where session_id=s.id;
   return jsonb_build_object('status','already','correct',result_row.correct,'total',5,
    'xp',result_row.xp,'week_start',result_row.week_start);
 end if;
 if s.expires_at < now() then raise exception 'Session expired';end if;
 if jsonb_typeof(p_answers) is distinct from 'array' or jsonb_array_length(p_answers)<>5
 then raise exception 'Invalid answer length';end if;
 for idx in 0..4 loop
   if jsonb_typeof(p_answers->idx) is distinct from 'number' or
      (p_answers->>idx) !~ '^[0-3]$'
   then raise exception 'Invalid selected answer';end if;
 end loop;
 select count(*)::integer into hits from
   unnest(s.question_ids) with ordinality item(question_id,ord)
   join public.mrlee_game_questions q on q.id=item.question_id
 where (p_answers->>(item.ord::integer-1))::integer=q.answer_index;
 today_vn := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
 week_vn := date_trunc('week',now() at time zone 'Asia/Ho_Chi_Minh')::date;
 -- Lock per learner/day for consistent daily XP cap across parallel submissions.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_firebase_uid||today_vn::text,0));
 if hits>=3 then
   select coalesce(sum(a.xp),0)::integer into spent_today
   from public.mrlee_game_awards a
   where a.firebase_uid=p_firebase_uid and a.earned_on=today_vn;
   earned := greatest(0,least(100-spent_today,hits*4));
   if earned>0 then
     insert into public.mrlee_game_awards(firebase_uid,week_start,cap,bai,xp,earned_on,session_id)
       values (p_firebase_uid,week_vn,s.cap,s.bai,earned,today_vn,s.id)
       on conflict (firebase_uid,week_start,cap,bai) do nothing
       returning xp into inserted_xp;
     earned := coalesce(inserted_xp,0);
   end if;
 end if;
 update public.mrlee_game_sessions
   set state='completed',completed_at=now() where id=s.id;
 insert into public.mrlee_game_attempts
   (session_id,firebase_uid,cap,bai,correct,xp,week_start)
   values(s.id,p_firebase_uid,s.cap,s.bai,hits,earned,week_vn)
   returning * into result_row;
 if earned>0 then
   insert into public.mrlee_game_weekly(firebase_uid,week_start,alias,xp,awarded_lessons)
     values(p_firebase_uid,week_vn,'Học viên '||left(p_firebase_uid,6),earned,1)
   on conflict(firebase_uid,week_start) do update set
     xp=public.mrlee_game_weekly.xp+excluded.xp,
     awarded_lessons=public.mrlee_game_weekly.awarded_lessons+1,updated_at=now();
 end if;
 return jsonb_build_object('status','graded','correct',hits,'total',5,'xp',earned,
   'week_start',week_vn,'minimum_correct',3);
end;
$$;
revoke all on function public.mrlee_game_finish(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.mrlee_game_finish(uuid,text,jsonb) to service_role;
comment on function public.mrlee_game_finish(uuid,text,jsonb) is
 'Service-role only: atomic answer verification, once per lesson per Vietnam week and 100 XP/day cap. Separate from Spark.';
