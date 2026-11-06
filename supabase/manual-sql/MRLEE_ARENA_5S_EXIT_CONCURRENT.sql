-- Two people can exit in the same five-second window even if the first
-- exit incremented room.version. This RPC locks the room and validates UID,
-- deadline and status server-side; a stale client version cannot prevent exit.
CREATE OR REPLACE FUNCTION public.mrlee_arena_finish_exit(p_code character varying, p_uid text, p_expected_version bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
 r public.mrlee_arena_rooms%rowtype; leaving jsonb; deadline timestamptz;
BEGIN
 SELECT * INTO r FROM public.mrlee_arena_rooms WHERE code=p_code FOR UPDATE;
 IF NOT FOUND OR r.status<>'finished'
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
$function$;
REVOKE ALL ON FUNCTION public.mrlee_arena_finish_exit(varchar,text,bigint) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.mrlee_arena_finish_exit(varchar,text,bigint) TO service_role;
