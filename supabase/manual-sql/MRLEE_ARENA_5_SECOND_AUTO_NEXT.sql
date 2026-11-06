-- MR LEE Arena: after each settled round, allow exactly 5s to exit;
-- all remaining players auto-continue by default. No client G authority.
CREATE OR REPLACE FUNCTION public.mrlee_arena_start_match(p_code character varying, p_expected_version bigint, p_state jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare r public.mrlee_arena_rooms%rowtype; m jsonb; uid text; n integer;
 needed bigint; funds bigint; next_round integer; escrow_change integer;
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
 next_round:=coalesce((r.state->>'roundIndex')::integer,0)+1;
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
  insert into public.mrlee_arena_escrows(room_code,firebase_uid,amount,settled)
   values(p_code,uid,needed,false)
   on conflict (room_code,firebase_uid) do update set
     amount=excluded.amount,settled=false
    where mrlee_arena_escrows.settled=true;
  get diagnostics escrow_change=row_count;
  if escrow_change<>1 then raise exception 'ESCROW_ACTIVE' using errcode='P0001';end if;
  insert into public.mrlee_arena_wallet_ledger(firebase_uid,room_code,reason,gold_delta,round_index)
   values(uid,p_code,'reserve',-needed,next_round);
 end loop;
 update public.mrlee_arena_rooms
 set status='playing',state=p_state || jsonb_build_object('roundIndex',next_round),
     version=version+1,updated_at=now(),expires_at=now()+interval '90 minutes'
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
 set status='finished',
     state=p_state || jsonb_build_object('nextRoundDeadline',now()+interval '5 seconds','exitUids','[]'::jsonb),
     version=version+1,updated_at=now(),
   expires_at=now()+interval '20 minutes' where code=p_code;
 return jsonb_build_object('winner',p_winner,'gained',total_gain,'details',details,'stake',r.min_gold);
end $function$;
CREATE OR REPLACE FUNCTION public.mrlee_arena_auto_next(
 p_code varchar,p_expected_version bigint,p_state jsonb
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_temp'
AS $auto$
DECLARE
 r public.mrlee_arena_rooms%rowtype;
 m jsonb; surviving jsonb:='[]'::jsonb; leaving jsonb;
 uid text; n int:=0; min_players int; needed bigint; funds bigint;
 next_round int; changed int; escrow_count int; low_gold boolean:=false;
 deadline timestamptz; reason text;
BEGIN
 SELECT * INTO r FROM public.mrlee_arena_rooms WHERE code=p_code FOR UPDATE;
 IF NOT FOUND OR r.status<>'finished' OR r.version<>p_expected_version
 THEN RAISE EXCEPTION 'ROOM_CHANGED' USING errcode='P0001';END IF;
 IF r.expires_at<now() THEN RAISE EXCEPTION 'ROOM_EXPIRED' USING errcode='P0001';END IF;
 deadline:=coalesce(nullif(r.state->>'nextRoundDeadline','')::timestamptz,
                    r.updated_at+interval '5 seconds');
 IF now()<deadline THEN RAISE EXCEPTION 'EXIT_WINDOW_OPEN' USING errcode='P0001';END IF;
 leaving:=coalesce(r.state->'exitUids','[]'::jsonb);
 IF jsonb_typeof(leaving)<>'array' THEN RAISE EXCEPTION 'BAD_EXIT_STATE' USING errcode='P0001';END IF;
 FOR m IN SELECT value FROM jsonb_array_elements(r.members) LOOP
  IF leaving @> jsonb_build_array(m->>'uid') THEN CONTINUE;END IF;
  surviving:=surviving || jsonb_build_array(
   jsonb_set(jsonb_set(m,'{seat}',to_jsonb(n)),'{ready}','false'::jsonb));
  n:=n+1;
 END LOOP;
 min_players:=CASE WHEN r.game='chess' THEN 2
                   WHEN r.game='colors' THEN 4 ELSE 2 END;
 next_round:=coalesce((r.state->>'roundIndex')::integer,1)+1;
 IF n>=min_players THEN
  IF jsonb_typeof(p_state)<>'object'
    OR (r.game IN ('tienlen','colors') AND
      (jsonb_typeof(p_state->'hands') IS DISTINCT FROM 'array'
       OR jsonb_array_length(p_state->'hands')<>n))
  THEN RAISE EXCEPTION 'INVALID_NEXT_DEAL' USING errcode='P0001';END IF;
  needed:=r.min_gold::bigint*(
   CASE WHEN r.game='tienlen' THEN 13 WHEN r.game='colors' THEN 20 ELSE 1 END);
  SELECT count(*) INTO escrow_count FROM public.mrlee_arena_escrows e
  WHERE e.room_code=p_code AND e.settled=true
    AND EXISTS(SELECT 1 FROM jsonb_array_elements(surviving) x
               WHERE x->>'uid'=e.firebase_uid);
  IF escrow_count<>n THEN
   reason:='escrow_unavailable';
  ELSE
   -- Lock wallets in stable order BEFORE making any debit.
   FOR uid IN SELECT x.value->>'uid' FROM jsonb_array_elements(surviving) x
    ORDER BY 1 LOOP
    SELECT gold INTO funds FROM public.mrlee_arena_wallets
     WHERE firebase_uid=uid FOR UPDATE;
    IF funds IS NULL OR funds<needed THEN low_gold:=true;END IF;
   END LOOP;
   IF NOT low_gold THEN
    FOR m IN SELECT value FROM jsonb_array_elements(surviving) LOOP
     uid:=m->>'uid';
     UPDATE public.mrlee_arena_wallets
       SET gold=gold-needed,updated_at=now() WHERE firebase_uid=uid;
     UPDATE public.mrlee_arena_escrows
       SET amount=needed,settled=false
       WHERE room_code=p_code AND firebase_uid=uid AND settled=true;
     GET DIAGNOSTICS changed=ROW_COUNT;
     IF changed<>1 THEN RAISE EXCEPTION 'ESCROW_CONFLICT' USING errcode='P0001';END IF;
     INSERT INTO public.mrlee_arena_wallet_ledger(firebase_uid,room_code,reason,gold_delta,round_index)
       VALUES(uid,p_code,'reserve',-needed,next_round);
    END LOOP;
    UPDATE public.mrlee_arena_rooms SET
      members=surviving,state=p_state || jsonb_build_object('roundIndex',next_round),
      status='playing',version=version+1,updated_at=now(),expires_at=now()+interval '90 minutes'
      WHERE code=p_code;
    RETURN jsonb_build_object('started',true,'roundIndex',next_round,'players',n);
   END IF;
   reason:='insufficient_gold';
  END IF;
 ELSE
  reason:='not_enough_players';
 END IF;
 -- If someone exits, one person remains, or anyone cannot guarantee G,
 -- do NOT auto-bet. Retain the same room in waiting state instead.
 UPDATE public.mrlee_arena_rooms SET
   members=surviving,
   state=jsonb_build_object('roundIndex',next_round-1,'waitingReason',reason),
   status=CASE WHEN n=0 THEN 'closed' ELSE 'waiting' END,
   locked=false,version=version+1,updated_at=now(),expires_at=now()+interval '45 minutes'
   WHERE code=p_code;
 RETURN jsonb_build_object('started',false,'waiting',n>0,'players',n,'reason',reason);
END
$auto$;
CREATE OR REPLACE FUNCTION public.mrlee_arena_finish_exit(
 p_code varchar,p_uid text,p_expected_version bigint
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_temp'
AS $leave$
DECLARE
 r public.mrlee_arena_rooms%rowtype; leaving jsonb; deadline timestamptz;
BEGIN
 SELECT * INTO r FROM public.mrlee_arena_rooms WHERE code=p_code FOR UPDATE;
 IF NOT FOUND OR r.status<>'finished' OR r.version<>p_expected_version
 THEN RAISE EXCEPTION 'ROOM_CHANGED' USING errcode='P0001';END IF;
 deadline:=coalesce(nullif(r.state->>'nextRoundDeadline','')::timestamptz,
                    r.updated_at+interval '5 seconds');
 IF now()>=deadline THEN RAISE EXCEPTION 'EXIT_TIME_EXPIRED' USING errcode='P0001';END IF;
 IF NOT EXISTS(SELECT 1 FROM jsonb_array_elements(r.members) x WHERE x->>'uid'=p_uid)
 THEN RAISE EXCEPTION 'NOT_ROOM_MEMBER' USING errcode='P0001';END IF;
 leaving:=coalesce(r.state->'exitUids','[]'::jsonb);
 IF NOT (leaving @> jsonb_build_array(p_uid)) THEN
   leaving:=leaving||jsonb_build_array(p_uid);
   UPDATE public.mrlee_arena_rooms
   SET state=jsonb_set(r.state,'{exitUids}',leaving,true),
       version=version+1,updated_at=now() WHERE code=p_code;
 END IF;
 RETURN jsonb_build_object('left',true);
END
$leave$;
REVOKE ALL ON FUNCTION public.mrlee_arena_auto_next(varchar,bigint,jsonb) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.mrlee_arena_finish_exit(varchar,text,bigint) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.mrlee_arena_auto_next(varchar,bigint,jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.mrlee_arena_finish_exit(varchar,text,bigint) TO service_role;
