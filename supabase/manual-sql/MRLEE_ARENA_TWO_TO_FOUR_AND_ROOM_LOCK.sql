-- MR LEE Arena 2026-11-06: dedicated Tiến Lên waiting table, host-controlled lock and flexible 2–4 play.
-- Server identity is Firebase-verified in Edge Function; do NOT grant public table writes.
ALTER TABLE public.mrlee_arena_rooms
 ADD COLUMN IF NOT EXISTS locked boolean NOT NULL DEFAULT false;
COMMENT ON COLUMN public.mrlee_arena_rooms.locked IS 'Host locks joining; existing members remain and can ready/play.';

CREATE OR REPLACE FUNCTION public.mrlee_arena_start_match(p_code character varying, p_expected_version bigint, p_state jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare r public.mrlee_arena_rooms%rowtype; m jsonb; uid text; n integer;
 needed bigint; funds bigint;
begin
 select * into r from public.mrlee_arena_rooms where code=p_code for update;
 if not found or r.version<>p_expected_version or r.status<>'waiting'
 then raise exception 'ROOM_CHANGED' using errcode='P0001';end if;
 n:=jsonb_array_length(r.members);
 -- Two to four members may play Tiến Lên; chess needs two and Colors four.
 if (r.game='chess' and n<>2) or (r.game='colors' and n<>4) or
  (r.game='tienlen' and n not between 2 and 4) or
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
end $function$;
CREATE OR REPLACE FUNCTION public.mrlee_arena_settle_match(p_code character varying, p_expected_version bigint, p_state jsonb, p_winner integer, p_remaining integer[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare r public.mrlee_arena_rooms%rowtype; m jsonb; uid text; seat integer; n integer;
 escrow_amount bigint; loss bigint; total_gain bigint:=0; winner_uid text;
 details jsonb:='[]'::jsonb; amount_out bigint;
begin
 select * into r from public.mrlee_arena_rooms where code=p_code for update;
 if not found or r.status<>'playing' or r.version<>p_expected_version
 then raise exception 'ROOM_CHANGED_OR_SETTLED' using errcode='P0001';end if;
 n:=jsonb_array_length(r.members);
 if (r.game='chess' and n<>2) or (r.game='colors' and n<>4) or
  (r.game='tienlen' and n not between 2 and 4) or
  array_length(p_remaining,1)<>n or
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
end $function$;

-- Preserve existing service_role-only grants and RLS. No new public API permissions.
