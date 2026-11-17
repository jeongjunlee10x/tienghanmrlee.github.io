-- MR LEE GOOSE MYSTERY PvP — isolated migration (manual review, no automatic deployment).
-- This schema does NOT alter arena cards, gold, learning scores or existing user data.
BEGIN;
CREATE TABLE IF NOT EXISTS public.mrlee_goose_rooms (
 code varchar(8) PRIMARY KEY CHECK (code ~ '^[A-Z2-9]{8}$'),
 visibility text NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','public')),
 locked boolean NOT NULL DEFAULT false,
 status text NOT NULL DEFAULT 'waiting'
  CHECK (status IN ('waiting','playing','meeting','reveal','finished','closed')),
 members jsonb NOT NULL DEFAULT '[]'::jsonb
  CHECK (jsonb_typeof(members)='array' AND jsonb_array_length(members)<=16),
 state jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(state)='object'),
 version bigint NOT NULL DEFAULT 1 CHECK (version>0),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL DEFAULT (now()+interval '90 minutes')
);
CREATE INDEX IF NOT EXISTS mrlee_goose_lobby_idx
 ON public.mrlee_goose_rooms(visibility,status,created_at DESC);
CREATE INDEX IF NOT EXISTS mrlee_goose_expiry_idx ON public.mrlee_goose_rooms(expires_at);

ALTER TABLE public.mrlee_goose_rooms ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mrlee_goose_rooms FROM anon,authenticated,public;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.mrlee_goose_rooms TO service_role;

-- Single-row transaction + optimistic version lock prevents conflicting votes,
-- doubles kills, two concurrent joins and out-of-order position updates.
CREATE OR REPLACE FUNCTION public.mrlee_goose_cas(
 p_code varchar, p_expected_version bigint,
 p_members jsonb, p_state jsonb, p_status text, p_locked boolean
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path=public,pg_temp
AS $$
DECLARE existing public.mrlee_goose_rooms%ROWTYPE;
BEGIN
 SELECT * INTO existing FROM public.mrlee_goose_rooms WHERE code=p_code FOR UPDATE;
 IF NOT FOUND OR existing.version<>p_expected_version
    OR existing.expires_at<=now()
 THEN RAISE EXCEPTION 'ROOM_CHANGED' USING ERRCODE='P0001';END IF;
 IF p_members IS NULL OR jsonb_typeof(p_members)<>'array'
    OR jsonb_array_length(p_members)>16 OR jsonb_array_length(p_members)<0
    OR jsonb_typeof(p_state)<>'object'
    OR p_status NOT IN ('waiting','playing','meeting','reveal','finished','closed')
 THEN RAISE EXCEPTION 'INVALID_ROOM_STATE' USING ERRCODE='P0001';END IF;
 UPDATE public.mrlee_goose_rooms
 SET members=p_members,state=p_state,status=p_status,locked=p_locked,
  version=version+1,updated_at=now(),
  expires_at=CASE WHEN p_status='finished' THEN now()+interval '30 minutes'
                  ELSE now()+interval '90 minutes' END
 WHERE code=p_code RETURNING * INTO existing;
 RETURN to_jsonb(existing);
END $$;

REVOKE ALL ON FUNCTION public.mrlee_goose_cas(varchar,bigint,jsonb,jsonb,text,boolean)
 FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.mrlee_goose_cas(varchar,bigint,jsonb,jsonb,text,boolean)
 TO service_role;
COMMENT ON TABLE public.mrlee_goose_rooms IS
 'Server-authoritative Goose Mystery rooms; Firebase JWT verified by Edge Function; no public SQL/RLS. Virtual non-wagered gameplay only.';
COMMIT;

-- After confirming deployment, stale finished/expired rooms can be cleaned during
-- scheduled maintenance: DELETE FROM public.mrlee_goose_rooms WHERE expires_at<now();
