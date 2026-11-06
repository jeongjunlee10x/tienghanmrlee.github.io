-- MR LEE 2026-11-06: safe same-table PvP rematch.
-- SECURITY: only the verified-Firebase Edge Function calls this SERVICE_ROLE RPC.
-- Every player votes; the last vote reserves G and deals the next round atomically.
CREATE OR REPLACE FUNCTION public.mrlee_arena_continue_match(
 p_code varchar, p_uid text, p_expected_version bigint, p_state jsonb
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_temp'
AS $fn$
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
  insert into public.mrlee_arena_wallet_ledger(firebase_uid,room_code,reason,gold_delta)
   values(uid,p_code,'reserve',-needed);
 end loop;
 next_round:=coalesce((r.state->>'roundIndex')::int,1)+1;
 update public.mrlee_arena_rooms
 set state=p_state || jsonb_build_object('roundIndex',next_round),
     version=version+1,status='playing',updated_at=now(),
     expires_at=now()+interval '90 minutes'
 where code=p_code;
 return jsonb_build_object('started',true,'round',next_round);
end
$fn$;

REVOKE ALL ON FUNCTION public.mrlee_arena_continue_match(varchar,text,bigint,jsonb)
 FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.mrlee_arena_continue_match(varchar,text,bigint,jsonb)
 TO service_role;
