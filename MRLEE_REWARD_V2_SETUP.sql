-- MR LEE REWARD V2 (Supabase) - execute in SQL Editor on the SAME project as admin.html.
-- This migration is additive: NEVER drops V1 tables or changes existing points.
-- WARNING: Requires public.mrlee_admins with user_id (same assumption as Reward V1).
DO $$ BEGIN
  IF to_regclass('public.mrlee_admins') IS NULL OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public'
    AND table_name='mrlee_admins' AND column_name='user_id'
  ) THEN RAISE EXCEPTION 'STOP: public.mrlee_admins(user_id) is missing. Adjust admin identity mapping before deploying.';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.mrlee_reward_v2_is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.mrlee_admins a
    WHERE a.user_id::text = auth.uid()::text
  );
$$;
REVOKE ALL ON FUNCTION public.mrlee_reward_v2_is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mrlee_reward_v2_is_admin() TO authenticated;

CREATE TABLE IF NOT EXISTS public.mrlee_reward_v2_awards (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  week_start date NOT NULL CHECK (EXTRACT(ISODOW FROM week_start) = 1),
  firebase_uid text NOT NULL CHECK (char_length(firebase_uid) BETWEEN 1 AND 128),
  full_name text NOT NULL CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 100),
  points integer NOT NULL CHECK (points > 40),
  rank smallint NOT NULL CHECK (rank BETWEEN 1 AND 3),
  prize text GENERATED ALWAYS AS (CASE rank WHEN 1 THEN '20.000 VND' WHEN 2 THEN '10.000 VND' ELSE '1 gói bim bim' END) STORED,
  prize_type text GENERATED ALWAYS AS (CASE WHEN rank=3 THEN 'item' ELSE 'money' END) STORED,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (week_start, firebase_uid),
  UNIQUE (week_start, rank)
);
CREATE INDEX IF NOT EXISTS mrlee_reward_v2_awards_uid_idx ON public.mrlee_reward_v2_awards(firebase_uid,week_start DESC);
ALTER TABLE public.mrlee_reward_v2_awards ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mrlee_reward_v2_awards FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE (published) ON public.mrlee_reward_v2_awards TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.mrlee_reward_v2_awards_id_seq TO authenticated;
DROP POLICY IF EXISTS mrlee_reward_v2_awards_admin_select ON public.mrlee_reward_v2_awards;
CREATE POLICY mrlee_reward_v2_awards_admin_select ON public.mrlee_reward_v2_awards
  FOR SELECT TO authenticated USING ((SELECT public.mrlee_reward_v2_is_admin()));
DROP POLICY IF EXISTS mrlee_reward_v2_awards_admin_insert ON public.mrlee_reward_v2_awards;
CREATE POLICY mrlee_reward_v2_awards_admin_insert ON public.mrlee_reward_v2_awards
  FOR INSERT TO authenticated WITH CHECK ((SELECT public.mrlee_reward_v2_is_admin()) AND published = false);
DROP POLICY IF EXISTS mrlee_reward_v2_awards_admin_publish ON public.mrlee_reward_v2_awards;
CREATE POLICY mrlee_reward_v2_awards_admin_publish ON public.mrlee_reward_v2_awards
  FOR UPDATE TO authenticated USING ((SELECT public.mrlee_reward_v2_is_admin()) AND published = false)
  WITH CHECK ((SELECT public.mrlee_reward_v2_is_admin()) AND published = true);

CREATE TABLE IF NOT EXISTS public.mrlee_reward_v2_claims (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  firebase_uid text NOT NULL,
  week_start date NOT NULL,
  full_name text NOT NULL,
  rank smallint NOT NULL CHECK (rank BETWEEN 1 AND 3),
  points integer NOT NULL CHECK (points > 40),
  prize text NOT NULL,
  prize_type text NOT NULL CHECK (prize_type IN ('money','item')),
  bank_name text NOT NULL DEFAULT '',
  account_number text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','paid')),
  admin_note text NOT NULL DEFAULT '',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  UNIQUE (firebase_uid, week_start),
  CONSTRAINT reward_v2_claim_award_fk FOREIGN KEY (week_start,firebase_uid)
    REFERENCES public.mrlee_reward_v2_awards(week_start,firebase_uid)
);
CREATE INDEX IF NOT EXISTS mrlee_reward_v2_claims_date_idx ON public.mrlee_reward_v2_claims(submitted_at DESC);
ALTER TABLE public.mrlee_reward_v2_claims ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mrlee_reward_v2_claims FROM anon, authenticated;
GRANT SELECT, UPDATE (status,admin_note,reviewed_at) ON public.mrlee_reward_v2_claims TO authenticated;
DROP POLICY IF EXISTS mrlee_reward_v2_claims_admin_select ON public.mrlee_reward_v2_claims;
CREATE POLICY mrlee_reward_v2_claims_admin_select ON public.mrlee_reward_v2_claims
  FOR SELECT TO authenticated USING ((SELECT public.mrlee_reward_v2_is_admin()));
DROP POLICY IF EXISTS mrlee_reward_v2_claims_admin_update ON public.mrlee_reward_v2_claims;
CREATE POLICY mrlee_reward_v2_claims_admin_update ON public.mrlee_reward_v2_claims
  FOR UPDATE TO authenticated USING ((SELECT public.mrlee_reward_v2_is_admin()))
  WITH CHECK ((SELECT public.mrlee_reward_v2_is_admin()));

-- Only Edge Function's service role may execute the following atomic claim RPC.
CREATE OR REPLACE FUNCTION public.mrlee_reward_v2_submit_claim(
  p_firebase_uid text, p_week_start date, p_full_name text,
  p_bank_name text, p_account_number text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE w public.mrlee_reward_v2_awards%ROWTYPE;
BEGIN
  SELECT * INTO w FROM public.mrlee_reward_v2_awards
  WHERE firebase_uid = p_firebase_uid AND week_start = p_week_start AND published = true
  FOR SHARE;
  IF NOT FOUND OR w.points <= 40 OR w.rank NOT IN (1,2,3) THEN
    RAISE EXCEPTION 'not eligible' USING ERRCODE = 'P0001';
  END IF;
  IF length(btrim(p_full_name)) NOT BETWEEN 2 AND 100 OR p_full_name ~ '[<>]' THEN
    RAISE EXCEPTION 'invalid name' USING ERRCODE = 'P0001';
  END IF;
  IF w.prize_type = 'money' THEN
    IF length(btrim(p_bank_name)) NOT BETWEEN 2 AND 90 OR
      p_account_number !~ '^[0-9]{6,20}$' OR p_bank_name ~ '[<>]' THEN
      RAISE EXCEPTION 'invalid bank details' USING ERRCODE = 'P0001';
    END IF;
  ELSIF p_bank_name <> '' OR p_account_number <> '' THEN
    RAISE EXCEPTION 'item prize does not need bank details' USING ERRCODE = 'P0001';
  END IF;
  INSERT INTO public.mrlee_reward_v2_claims
    (firebase_uid,week_start,full_name,rank,points,prize,prize_type,bank_name,account_number)
  VALUES
    (p_firebase_uid,p_week_start,btrim(p_full_name),w.rank,w.points,w.prize,w.prize_type,
     CASE WHEN w.prize_type='money' THEN btrim(p_bank_name) ELSE '' END,
     CASE WHEN w.prize_type='money' THEN p_account_number ELSE '' END);
END; $$;
REVOKE ALL ON FUNCTION public.mrlee_reward_v2_submit_claim(text,date,text,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mrlee_reward_v2_submit_claim(text,date,text,text,text) TO service_role;

-- Test after migration: SELECT public.mrlee_reward_v2_is_admin();  -- true only as signed-in admin.
-- NOTE: Do NOT enter real bank details into test records; only collect after security validation.
