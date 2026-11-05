-- MR LEE Game Arena Daily Check-in + Lucky Wheel, 2026-11-05.
-- Server-verified Firebase UID is supplied only by the service-role Edge Function.
-- One check-in (+1,000 virtual G and +1 Arena verified study point) per VN day.
-- One independently randomized lucky spin (100..5,000 G) per VN day.
-- No real-money redemption and no changes to Firebase legacy academic wallet.
create table if not exists public.mrlee_arena_daily_rewards(
 firebase_uid text not null references public.mrlee_arena_wallets(firebase_uid),
 reward_day date not null,
 checked_in_at timestamptz,
 study_points smallint not null default 0 check(study_points in (0,1)),
 checkin_gold integer not null default 0 check(checkin_gold in (0,1000)),
 spun_at timestamptz,
 spin_gold integer not null default 0 check(spin_gold in (0,100,200,300,500,800,1000,1500,2000,3000,5000)),
 primary key(firebase_uid,reward_day),
 constraint mrlee_arena_checkin_consistency
 check ((checked_in_at is null and study_points=0 and checkin_gold=0)
     or (checked_in_at is not null and study_points=1 and checkin_gold=1000)),
 constraint mrlee_arena_spin_consistency
 check ((spun_at is null and spin_gold=0)
     or (spun_at is not null and spin_gold>0))
);
create index if not exists mrlee_arena_daily_rewards_day_idx
 on public.mrlee_arena_daily_rewards(reward_day desc);
alter table public.mrlee_arena_daily_rewards enable row level security;
revoke all on public.mrlee_arena_daily_rewards from public,anon,authenticated;
grant select,insert,update on public.mrlee_arena_daily_rewards to service_role;
comment on table public.mrlee_arena_daily_rewards is
 'Firebase-verified daily virtual Game Arena G and Arena study point; VN local calendar day, unique per student/day.';

alter table public.mrlee_arena_wallet_ledger
 drop constraint if exists mrlee_arena_wallet_ledger_reason_check;
alter table public.mrlee_arena_wallet_ledger
 add constraint mrlee_arena_wallet_ledger_reason_check
 check(reason in ('convert','reserve','refund','win_bonus','daily_checkin','lucky_spin'));

-- This is a ledgered, authenticated study point. It is convertible at 1 point=10G
-- but is intentionally separate from unverified browser-based Firebase studyPoints.
create or replace function public.mrlee_arena_verified_study_points(p_uid text)
returns bigint
language sql stable security definer set search_path=public,pg_temp
as $$
 select
   (select coalesce(sum(a.xp),0)::bigint from public.mrlee_game_awards a
     where a.firebase_uid=p_uid)
   +(select coalesce(sum(d.study_points),0)::bigint from public.mrlee_arena_daily_rewards d
     where d.firebase_uid=p_uid);
$$;
revoke all on function public.mrlee_arena_verified_study_points(text) from public,anon,authenticated;
grant execute on function public.mrlee_arena_verified_study_points(text) to service_role;

create or replace function public.mrlee_arena_daily_status(p_uid text)
returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare d public.mrlee_arena_daily_rewards%rowtype;
        vn_day date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
begin
 if p_uid is null or length(p_uid) not between 8 and 128
 then raise exception 'INVALID_UID' using errcode='P0001';end if;
 select * into d from public.mrlee_arena_daily_rewards
 where firebase_uid=p_uid and reward_day=vn_day;
 return jsonb_build_object('day',vn_day,'timeZone','Asia/Ho_Chi_Minh',
  'checkedIn',coalesce(d.checked_in_at is not null,false),
  'spun',coalesce(d.spun_at is not null,false),
  'spinGold',coalesce(d.spin_gold,0),
  'dailyGold',coalesce(d.checkin_gold,0),
  'studyPoints',coalesce(d.study_points,0));
end $$;
revoke all on function public.mrlee_arena_daily_status(text) from public,anon,authenticated;
grant execute on function public.mrlee_arena_daily_status(text) to service_role;

create or replace function public.mrlee_arena_daily_claim(p_uid text,p_kind text)
returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare d public.mrlee_arena_daily_rewards%rowtype;
        w public.mrlee_arena_wallets%rowtype;
        vn_day date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
        gift integer := 0;
        points integer := 0;
        already boolean := false;
        prizes integer[] := array[100,200,300,500,800,1000,1500,2000,3000,5000];
begin
 if p_uid is null or length(p_uid) not between 8 and 128 or
    p_kind not in ('checkin','spin') or p_kind is null
 then raise exception 'INVALID_DAILY_ACTION' using errcode='P0001';end if;
 -- Serialize all gold/points operations for a UID. Concurrent requests cannot double-award.
 insert into public.mrlee_arena_wallets(firebase_uid) values(p_uid) on conflict do nothing;
 select * into w from public.mrlee_arena_wallets where firebase_uid=p_uid for update;
 insert into public.mrlee_arena_daily_rewards(firebase_uid,reward_day)
 values(p_uid,vn_day) on conflict do nothing;
 select * into d from public.mrlee_arena_daily_rewards
 where firebase_uid=p_uid and reward_day=vn_day for update;
 if p_kind='checkin' then
  already:=d.checked_in_at is not null;
  if not already then
   gift:=1000;points:=1;
   update public.mrlee_arena_daily_rewards
    set checked_in_at=now(),checkin_gold=gift,study_points=points
    where firebase_uid=p_uid and reward_day=vn_day;
  end if;
 else
  already:=d.spun_at is not null;
  if not already then
   -- Prize selected by database RNG. Browser's visual labels/animation cannot choose it.
   gift:=prizes[1+floor(random()*array_length(prizes,1))::integer];
   update public.mrlee_arena_daily_rewards
    set spun_at=now(),spin_gold=gift
    where firebase_uid=p_uid and reward_day=vn_day;
  end if;
 end if;
 if not already then
  update public.mrlee_arena_wallets
   set gold=gold+gift,updated_at=now()
   where firebase_uid=p_uid returning * into w;
  insert into public.mrlee_arena_wallet_ledger(firebase_uid,reason,points,gold_delta)
   values(p_uid,case when p_kind='checkin' then 'daily_checkin' else 'lucky_spin' end,
          points,gift);
 end if;
 return jsonb_build_object('day',vn_day,'action',p_kind,'already',already,
   'awardedGold',gift,'awardedPoints',points,
   'gold',w.gold,'spinGold',case when p_kind='spin'
      then (select spin_gold from public.mrlee_arena_daily_rewards
            where firebase_uid=p_uid and reward_day=vn_day)
      else coalesce(d.spin_gold,0) end);
end $$;
revoke all on function public.mrlee_arena_daily_claim(text,text) from public,anon,authenticated;
grant execute on function public.mrlee_arena_daily_claim(text,text) to service_role;

-- Preserve the original atomic conversion/escrow semantics, with daily +1 point included.
create or replace function public.mrlee_arena_convert(p_uid text,p_points integer)
returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare w public.mrlee_arena_wallets%rowtype; earned bigint; available bigint;
begin
 if p_uid is null or length(p_uid) not between 8 and 128 or p_points not between 1 and 10000
 then raise exception 'INVALID_CONVERSION' using errcode='P0001'; end if;
 insert into public.mrlee_arena_wallets(firebase_uid) values(p_uid) on conflict do nothing;
 select * into w from public.mrlee_arena_wallets where firebase_uid=p_uid for update;
 earned:=public.mrlee_arena_verified_study_points(p_uid);
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
revoke all on function public.mrlee_arena_convert(text,integer) from public,anon,authenticated;
grant execute on function public.mrlee_arena_convert(text,integer) to service_role;

-- Maintain stale-escrow cleanup performed by the existing wallet_status RPC.
create or replace function public.mrlee_arena_wallet_status(p_uid text)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare w public.mrlee_arena_wallets%rowtype; earned bigint; old_room record;
begin
 if p_uid is null or length(p_uid) not between 8 and 128
 then raise exception 'BAD_UID' using errcode='P0001';end if;
 for old_room in select code,version from public.mrlee_arena_rooms
   where status='playing' and expires_at<now()
   and members @> jsonb_build_array(jsonb_build_object('uid',p_uid))
   order by code loop
  perform public.mrlee_arena_abort_match(old_room.code,old_room.version);
 end loop;
 insert into public.mrlee_arena_wallets(firebase_uid) values(p_uid) on conflict do nothing;
 select * into w from public.mrlee_arena_wallets where firebase_uid=p_uid;
 earned:=public.mrlee_arena_verified_study_points(p_uid);
 return jsonb_build_object('gold',w.gold,'earnedPoints',earned,
   'convertedPoints',w.converted_points,
   'availablePoints',greatest(earned-w.converted_points,0));
end $$;
revoke all on function public.mrlee_arena_wallet_status(text) from public,anon,authenticated;
grant execute on function public.mrlee_arena_wallet_status(text) to service_role;
