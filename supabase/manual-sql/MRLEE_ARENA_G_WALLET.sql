-- MR LEE ARENA G currency: 1 verified Game Zone academic XP -> 10G, irreversible.
-- VIRTUAL GAME CURRENCY ONLY. Not redeemable as cash, gifts, tuition or scholarships.
-- No changes to academic scores, TOPIK Spark, school grades, legacy points or Reward V2.
alter table public.mrlee_arena_rooms drop constraint if exists mrlee_arena_rooms_min_gold_check;
alter table public.mrlee_arena_rooms add constraint mrlee_arena_rooms_min_gold_check
  check (min_gold in (5,10,50,100,500,1000,5000,10000,50000,100000,500000,1000000));
alter table public.mrlee_arena_rooms alter column min_gold set default 5;

create table if not exists public.mrlee_arena_wallets(
 firebase_uid text primary key check(length(firebase_uid) between 8 and 128),
 gold bigint not null default 0 check(gold>=0),
 converted_points bigint not null default 0 check(converted_points>=0),
 updated_at timestamptz not null default now()
);
create table if not exists public.mrlee_arena_wallet_ledger(
 id bigint generated always as identity primary key,
 firebase_uid text not null references public.mrlee_arena_wallets(firebase_uid),
 room_code varchar(8),
 reason text not null check(reason in ('convert','reserve','refund','win_bonus')),
 points bigint not null default 0 check(points>=0),
 gold_delta bigint not null,
 created_at timestamptz not null default now(),
 unique(room_code,firebase_uid,reason)
);
create table if not exists public.mrlee_arena_escrows(
 room_code varchar(8) not null references public.mrlee_arena_rooms(code),
 firebase_uid text not null references public.mrlee_arena_wallets(firebase_uid),
 amount bigint not null check(amount>=0),
 settled boolean not null default false,
 created_at timestamptz not null default now(),
 primary key(room_code,firebase_uid)
);
create index if not exists mrlee_arena_wallet_ledger_uid_idx
 on public.mrlee_arena_wallet_ledger(firebase_uid,created_at desc);
create index if not exists mrlee_arena_escrows_uid_idx
 on public.mrlee_arena_escrows(firebase_uid);
alter table public.mrlee_arena_wallets enable row level security;
alter table public.mrlee_arena_wallet_ledger enable row level security;
alter table public.mrlee_arena_escrows enable row level security;
revoke all on public.mrlee_arena_wallets,public.mrlee_arena_wallet_ledger,public.mrlee_arena_escrows from public,anon,authenticated;
comment on table public.mrlee_arena_wallets is
 'Virtual non-cash G currency. 1 awarded server verified Game Zone XP converts into 10G, academic grades untouched.';

create or replace function public.mrlee_arena_convert(p_uid text,p_points integer)
returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare w public.mrlee_arena_wallets%rowtype; earned bigint; available bigint;
begin
 if p_uid is null or length(p_uid) not between 8 and 128 or p_points not between 1 and 10000
 then raise exception 'INVALID_CONVERSION' using errcode='P0001'; end if;
 insert into public.mrlee_arena_wallets(firebase_uid) values(p_uid) on conflict do nothing;
 select * into w from public.mrlee_arena_wallets where firebase_uid=p_uid for update;
 select coalesce(sum(xp),0) into earned from public.mrlee_game_awards where firebase_uid=p_uid;
 available:=greatest(earned-w.converted_points,0);
 if available<p_points then raise exception 'INSUFFICIENT_VERIFIED_POINTS' using errcode='P0001';end if;
 update public.mrlee_arena_wallets
 set gold=gold+p_points*10::bigint,converted_points=converted_points+p_points,updated_at=now()
 where firebase_uid=p_uid returning * into w;
 insert into public.mrlee_arena_wallet_ledger(firebase_uid,reason,points,gold_delta)
 values(p_uid,'convert',p_points,p_points*10::bigint);
 return jsonb_build_object('gold',w.gold,'convertedPoints',w.converted_points,
  'availableVerifiedPoints',earned-w.converted_points);
end $$;

create or replace function public.mrlee_arena_start_match(
 p_code varchar,p_expected_version bigint,p_state jsonb
) returns bigint
language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.mrlee_arena_rooms%rowtype; m jsonb; uid text; n integer;
 needed bigint; funds bigint;
begin
 select * into r from public.mrlee_arena_rooms where code=p_code for update;
 if not found or r.version<>p_expected_version or r.status<>'waiting'
 then raise exception 'ROOM_CHANGED' using errcode='P0001';end if;
 n:=case when r.game='chess' then 2 else 4 end;
 if jsonb_array_length(r.members)<>n or
  exists(select 1 from jsonb_array_elements(r.members) member
   where (member->>'ready')::boolean is distinct from true)
 then raise exception 'ROOM_NOT_READY' using errcode='P0001';end if;
 if r.expires_at<now() then raise exception 'ROOM_EXPIRED' using errcode='P0001';end if;
 if r.min_gold not in (5,10,50,100,500,1000,5000,10000,50000,100000,500000,1000000)
 then raise exception 'INVALID_STAKE' using errcode='P0001';end if;
 needed:=r.min_gold::bigint*
  (case when r.game='tienlen' then 13 when r.game='colors' then 20 else 1 end);
 -- Lock all wallets deterministically so concurrent rooms cannot double-spend G.
 for uid in select x.value->>'uid' from jsonb_array_elements(r.members) x order by 1 loop
  insert into public.mrlee_arena_wallets(firebase_uid) values(uid) on conflict do nothing;
  select gold into funds from public.mrlee_arena_wallets where firebase_uid=uid for update;
  if funds<needed then raise exception 'PLAYER_INSUFFICIENT_G' using errcode='P0001';end if;
 end loop;
 for m in select value from jsonb_array_elements(r.members) loop
  uid:=m->>'uid';
  update public.mrlee_arena_wallets set gold=gold-needed,updated_at=now() where firebase_uid=uid;
  insert into public.mrlee_arena_escrows(room_code,firebase_uid,amount)
   values(p_code,uid,needed);
  insert into public.mrlee_arena_wallet_ledger(firebase_uid,room_code,reason,gold_delta)
   values(uid,p_code,'reserve',-needed);
 end loop;
 update public.mrlee_arena_rooms
 set status='playing',state=p_state,version=version+1,updated_at=now(),expires_at=now()+interval '90 minutes'
 where code=p_code returning version into p_expected_version;
 return p_expected_version;
end $$;

create or replace function public.mrlee_arena_settle_match(
 p_code varchar,p_expected_version bigint,p_state jsonb,
 p_winner integer,p_remaining integer[]
) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.mrlee_arena_rooms%rowtype; m jsonb; uid text; seat integer; n integer;
 escrow_amount bigint; loss bigint; total_gain bigint:=0; winner_uid text;
 details jsonb:='[]'::jsonb; amount_out bigint;
begin
 select * into r from public.mrlee_arena_rooms where code=p_code for update;
 if not found or r.status<>'playing' or r.version<>p_expected_version
 then raise exception 'ROOM_CHANGED_OR_SETTLED' using errcode='P0001';end if;
 n:=jsonb_array_length(r.members);
 if n not in (2,4) or array_length(p_remaining,1)<>n or
  (p_winner<0 or p_winner>=n) and p_winner<>-1
 then raise exception 'BAD_MATCH_RESULT' using errcode='P0001';end if;
 -- Lock all escrow and wallet rows. Transfer only virtual amounts reserved before play.
 perform 1 from public.mrlee_arena_escrows where room_code=p_code order by firebase_uid for update;
 for uid in select x.value->>'uid' from jsonb_array_elements(r.members) x order by 1 loop
  perform 1 from public.mrlee_arena_wallets where firebase_uid=uid for update;
 end loop;
 for m in select value from jsonb_array_elements(r.members) loop
  uid:=m->>'uid';seat:=(m->>'seat')::integer;
  select amount into escrow_amount from public.mrlee_arena_escrows
   where room_code=p_code and firebase_uid=uid and settled=false;
  if escrow_amount is null then raise exception 'ESCROW_MISSING' using errcode='P0001';end if;
  if p_remaining[seat+1] not between 0 and 108 then raise exception 'BAD_REMAINING' using errcode='P0001';end if;
  loss:=case when p_winner=-1 or seat=p_winner then 0 else
    least(escrow_amount,r.min_gold::bigint*
      (case when r.game='chess' then 1 when r.game='colors' then least(p_remaining[seat+1],20) else least(p_remaining[seat+1],13) end)) end;
  total_gain:=total_gain+loss;
  amount_out:=escrow_amount-loss;
  update public.mrlee_arena_wallets set gold=gold+amount_out,updated_at=now()
   where firebase_uid=uid;
  update public.mrlee_arena_escrows set settled=true where room_code=p_code and firebase_uid=uid;
  insert into public.mrlee_arena_wallet_ledger(firebase_uid,room_code,reason,gold_delta)
   values(uid,p_code,'refund',amount_out);
  details:=details||jsonb_build_array(jsonb_build_object('seat',seat,'loss',loss,'refunded',amount_out));
  if seat=p_winner then winner_uid:=uid;end if;
 end loop;
 if winner_uid is not null and total_gain>0 then
  update public.mrlee_arena_wallets set gold=gold+total_gain,updated_at=now()
    where firebase_uid=winner_uid;
  insert into public.mrlee_arena_wallet_ledger(firebase_uid,room_code,reason,gold_delta)
    values(winner_uid,p_code,'win_bonus',total_gain);
 end if;
 update public.mrlee_arena_rooms
 set status='finished',state=p_state,version=version+1,updated_at=now(),
   expires_at=now()+interval '20 minutes' where code=p_code;
 return jsonb_build_object('winner',p_winner,'gained',total_gain,'details',details,'stake',r.min_gold);
end $$;

create or replace function public.mrlee_arena_abort_match(p_code varchar,p_expected_version bigint)
returns boolean
language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.mrlee_arena_rooms%rowtype; e record;
begin
 select * into r from public.mrlee_arena_rooms where code=p_code for update;
 if not found or r.version<>p_expected_version or r.status<>'playing'
 then return false;end if;
 for e in select * from public.mrlee_arena_escrows where room_code=p_code and settled=false order by firebase_uid for update loop
  update public.mrlee_arena_wallets set gold=gold+e.amount,updated_at=now()
   where firebase_uid=e.firebase_uid;
  update public.mrlee_arena_escrows set settled=true where room_code=e.room_code and firebase_uid=e.firebase_uid;
  insert into public.mrlee_arena_wallet_ledger(firebase_uid,room_code,reason,gold_delta)
   values(e.firebase_uid,p_code,'refund',e.amount);
 end loop;
 update public.mrlee_arena_rooms set status='closed',version=version+1,updated_at=now()
 where code=p_code;
 return true;
end $$;
revoke all on function public.mrlee_arena_convert(text,integer) from public,anon,authenticated;
revoke all on function public.mrlee_arena_start_match(varchar,bigint,jsonb) from public,anon,authenticated;
revoke all on function public.mrlee_arena_settle_match(varchar,bigint,jsonb,integer,integer[]) from public,anon,authenticated;
revoke all on function public.mrlee_arena_abort_match(varchar,bigint) from public,anon,authenticated;
grant execute on function public.mrlee_arena_convert(text,integer) to service_role;
grant execute on function public.mrlee_arena_start_match(varchar,bigint,jsonb) to service_role;
grant execute on function public.mrlee_arena_settle_match(varchar,bigint,jsonb,integer,integer[]) to service_role;
grant execute on function public.mrlee_arena_abort_match(varchar,bigint) to service_role;


create or replace function public.mrlee_arena_wallet_status(p_uid text)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare w public.mrlee_arena_wallets%rowtype; earned bigint;
begin
 if p_uid is null or length(p_uid) not between 8 and 128
 then raise exception 'BAD_UID' using errcode='P0001';end if;
 insert into public.mrlee_arena_wallets(firebase_uid) values(p_uid) on conflict do nothing;
 select * into w from public.mrlee_arena_wallets where firebase_uid=p_uid;
 select coalesce(sum(xp),0) into earned from public.mrlee_game_awards where firebase_uid=p_uid;
 return jsonb_build_object('gold',w.gold,'earnedPoints',earned,
   'convertedPoints',w.converted_points,
   'availablePoints',greatest(earned-w.converted_points,0));
end $$;
revoke all on function public.mrlee_arena_wallet_status(text) from public,anon,authenticated;
grant execute on function public.mrlee_arena_wallet_status(text) to service_role;
