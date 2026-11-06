-- MR LEE verified G ledger: preserve one unique entry PER ROUND while reusing a room.
-- Existing ledger rows correspond to round 1, untouched.
ALTER TABLE public.mrlee_arena_wallet_ledger
 ADD COLUMN IF NOT EXISTS round_index integer NOT NULL DEFAULT 1;
ALTER TABLE public.mrlee_arena_wallet_ledger
 ADD CONSTRAINT mrlee_arena_wallet_ledger_round_positive CHECK(round_index >= 1);
ALTER TABLE public.mrlee_arena_wallet_ledger
 DROP CONSTRAINT mrlee_arena_wallet_ledger_room_code_firebase_uid_reason_key;
ALTER TABLE public.mrlee_arena_wallet_ledger
 ADD CONSTRAINT mrlee_arena_ledger_room_user_reason_round_key
 UNIQUE(room_code,firebase_uid,reason,round_index);

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
  insert into public.mrlee_arena_wallet_ledger(firebase_uid,room_code,reason,gold_delta,round_index)
   values(uid,p_code,'refund',amount_out,coalesce((r.state->>'roundIndex')::integer,1));
  details:=details||jsonb_build_array(jsonb_build_object('seat',seat,'loss',loss,'refunded',amount_out));
  if seat=p_winner then winner_uid:=uid;end if;
 end loop;
 if winner_uid is not null and total_gain>0 then
  update public.mrlee_arena_wallets set gold=gold+total_gain,updated_at=now()
    where firebase_uid=winner_uid;
  insert into public.mrlee_arena_wallet_ledger(firebase_uid,room_code,reason,gold_delta,round_index)
    values(winner_uid,p_code,'win_bonus',total_gain,coalesce((r.state->>'roundIndex')::integer,1));
 end if;
 update public.mrlee_arena_rooms
 set status='finished',state=p_state,version=version+1,updated_at=now(),
   expires_at=now()+interval '20 minutes' where code=p_code;
 return jsonb_build_object('winner',p_winner,'gained',total_gain,'details',details,'stake',r.min_gold);
end $function$;
CREATE OR REPLACE FUNCTION public.mrlee_arena_abort_match(p_code character varying, p_expected_version bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare r public.mrlee_arena_rooms%rowtype; e record;
begin
 select * into r from public.mrlee_arena_rooms where code=p_code for update;
 if not found or r.version<>p_expected_version or r.status<>'playing'
 then return false;end if;
 for e in select * from public.mrlee_arena_escrows where room_code=p_code and settled=false order by firebase_uid for update loop
  update public.mrlee_arena_wallets set gold=gold+e.amount,updated_at=now()
   where firebase_uid=e.firebase_uid;
  update public.mrlee_arena_escrows set settled=true where room_code=e.room_code and firebase_uid=e.firebase_uid;
  insert into public.mrlee_arena_wallet_ledger(firebase_uid,room_code,reason,gold_delta,round_index)
   values(e.firebase_uid,p_code,'refund',e.amount,coalesce((r.state->>'roundIndex')::integer,1));
 end loop;
 update public.mrlee_arena_rooms set status='closed',version=version+1,updated_at=now()
 where code=p_code;
 return true;
end $function$;
CREATE OR REPLACE FUNCTION public.mrlee_arena_continue_match(p_code character varying, p_uid text, p_expected_version bigint, p_state jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
 r public.mrlee_arena_rooms%rowtype;
 m jsonb; voter jsonb; votes jsonb; uid text; n int; seat int;
 needed bigint; funds bigint; escrow_count int; changed int;
 all_voted boolean:=true; next_round int;
begin
 select * into r from public.mrlee_arena_rooms where code=p_code for update;
 if not found or r.status<>'finished' or r.version<>p_expected_version
 then raise exception 'ROOM_CHANGED' using errcode='P0001'; end if;
 if r.expires_at<now() then raise exception 'ROOM_EXPIRED' using errcode='P0001'; end if;
 select x.value into voter from jsonb_array_elements(r.members) as x(value)
 where x.value->>'uid'=p_uid limit 1;
 if voter is null then raise exception 'NOT_ROOM_MEMBER' using errcode='P0001'; end if;
 n:=jsonb_array_length(r.members);
 if (r.game='chess' and n<>2) or (r.game='colors' and n<>4)
   or (r.game='tienlen' and n not between 2 and 4)
 then raise exception 'INVALID_PLAYER_COUNT' using errcode='P0001'; end if;
 if jsonb_typeof(p_state)<>'object' then
  raise exception 'INVALID_NEW_DEAL' using errcode='P0001';
 end if;
 if r.game in ('tienlen','colors') and
   (jsonb_typeof(p_state->'hands') is distinct from 'array'
    or jsonb_array_length(p_state->'hands')<>n)
 then raise exception 'INVALID_NEW_DEAL' using errcode='P0001';end if;
 votes:=coalesce(r.state->'rematchVotes','{}'::jsonb);
 if jsonb_typeof(votes)<>'object' then votes:='{}'::jsonb;end if;
 votes:=jsonb_set(votes,array[voter->>'seat'],'true'::jsonb,true);
 for m in select x.value from jsonb_array_elements(r.members) as x(value) loop
  if votes->>(m->>'seat') is distinct from 'true' then all_voted:=false; end if;
 end loop;
 if not all_voted then
  update public.mrlee_arena_rooms
  set state=jsonb_set(r.state,'{rematchVotes}',votes,true),
      version=version+1,updated_at=now(),expires_at=now()+interval '30 minutes'
  where code=p_code;
  return jsonb_build_object('started',false,'votes',votes);
 end if;
 next_round:=coalesce((r.state->>'roundIndex')::int,1)+1;
 needed:=r.min_gold::bigint *
   (case when r.game='tienlen' then 13 when r.game='colors' then 20 else 1 end);
 select count(*) into escrow_count from public.mrlee_arena_escrows
  where room_code=p_code and settled=true;
 if escrow_count<>n then
  raise exception 'PREVIOUS_SETTLEMENT_MISSING' using errcode='P0001';
 end if;
 -- Acquire wallet row locks in deterministic UID order; avoid double-spending.
 for uid in select x.value->>'uid' from jsonb_array_elements(r.members) as x(value)
  order by 1 loop
  select gold into funds from public.mrlee_arena_wallets
    where firebase_uid=uid for update;
  if funds is null or funds<needed then
   raise exception 'PLAYER_INSUFFICIENT_G' using errcode='P0001';
  end if;
 end loop;
 for m in select x.value from jsonb_array_elements(r.members) as x(value) loop
  uid:=m->>'uid';
  update public.mrlee_arena_wallets
   set gold=gold-needed,updated_at=now() where firebase_uid=uid;
  update public.mrlee_arena_escrows set amount=needed,settled=false
   where room_code=p_code and firebase_uid=uid and settled=true;
  get diagnostics changed=row_count;
  if changed<>1 then
   raise exception 'ESCROW_NOT_SETTLED' using errcode='P0001';
  end if;
  insert into public.mrlee_arena_wallet_ledger(firebase_uid,room_code,reason,gold_delta,round_index)
   values(uid,p_code,'reserve',-needed,next_round);
 end loop;
 update public.mrlee_arena_rooms
 set state=p_state || jsonb_build_object('roundIndex',next_round),
     version=version+1,status='playing',updated_at=now(),
     expires_at=now()+interval '90 minutes'
 where code=p_code;
 return jsonb_build_object('started',true,'round',next_round);
end
$function$;

REVOKE ALL ON FUNCTION public.mrlee_arena_continue_match(varchar,text,bigint,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.mrlee_arena_continue_match(varchar,text,bigint,jsonb) TO service_role;
