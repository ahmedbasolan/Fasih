-- ============================================================
-- Fasih — Migration 013: align the live database with these files
--
-- Audited 2026-09-25 against the live project. The database had been built up
-- over several sessions from older copies of these files, so it had drifted:
-- it was still at schema v1 (004, 006_schema_v3, 009, 011, 012 unapplied, no
-- performance indexes, no whoami()). Those were applied first, unchanged.
--
-- What was left are differences this file closes. Each one is a case where the
-- live database and the .sql in this folder disagreed, so re-running the old
-- files would not have converged:
--
--   1. increment_choice_stat / increment_ending_stat were created by a copy of
--      001 that predates SECURITY DEFINER. 010's whole rationale — "they bypass
--      RLS, so EXECUTE is the gate" — was false against the live functions,
--      which ran as the caller and leaned on 007's table policies instead.
--      Recreated as 001 declares them, plus the `SET search_path` that a
--      SECURITY DEFINER function needs and 001 omits.
--   2. set_updated_at had no search_path either.
--   3. The stats tables' read policies are named "Public read" live and
--      "Public read choice stats" / "Public read ending stats" in 007, so a
--      re-run of 007 would have left two SELECT policies on each table.
--   4. TRUNCATE was never revoked: anon and authenticated both still held it on
--      the stats tables. TRUNCATE ignores RLS. PostgREST cannot issue one, so
--      this was reachable only with a direct connection as those roles — still
--      not a privilege either of them needs.
--   5. The live user_data was missing created_at and both CHECK constraints
--      from 001 (subscription_status, trial_plan).
--
-- Safe to re-run. Safe on a fresh database built from 001 upward, where every
-- statement is already true.
-- ============================================================

-- ── 1 + 2. Functions: match 001, and pin search_path ────────────────────────
CREATE OR REPLACE FUNCTION increment_choice_stat(
  p_scenario_id TEXT,
  p_scene_id    TEXT,
  p_choice_id   TEXT
) RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  INSERT INTO scenario_choice_stats (scenario_id, scene_id, choice_id, pick_count)
  VALUES (p_scenario_id, p_scene_id, p_choice_id, 1)
  ON CONFLICT (scenario_id, scene_id, choice_id)
  DO UPDATE SET pick_count = scenario_choice_stats.pick_count + 1;
$$;

CREATE OR REPLACE FUNCTION increment_ending_stat(
  p_scenario_id TEXT,
  p_ending_type TEXT
) RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  INSERT INTO scenario_ending_stats (scenario_id, ending_type, reach_count)
  VALUES (p_scenario_id, p_ending_type, 1)
  ON CONFLICT (scenario_id, ending_type)
  DO UPDATE SET reach_count = scenario_ending_stats.reach_count + 1;
$$;

-- CREATE OR REPLACE resets privileges to the default (EXECUTE to PUBLIC), so
-- 010's grants are restated here rather than assumed.
REVOKE ALL ON FUNCTION increment_choice_stat(text, text, text) FROM public, anon;
GRANT  EXECUTE ON FUNCTION increment_choice_stat(text, text, text) TO authenticated;
REVOKE ALL ON FUNCTION increment_ending_stat(text, text) FROM public, anon;
GRANT  EXECUTE ON FUNCTION increment_ending_stat(text, text) TO authenticated;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ── 3. One read policy per stats table, under 007's names ───────────────────
DROP POLICY IF EXISTS "Public read" ON scenario_choice_stats;
DROP POLICY IF EXISTS "Public read" ON scenario_ending_stats;

DROP POLICY IF EXISTS "Public read choice stats" ON scenario_choice_stats;
CREATE POLICY "Public read choice stats"
  ON scenario_choice_stats FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read ending stats" ON scenario_ending_stats;
CREATE POLICY "Public read ending stats"
  ON scenario_ending_stats FOR SELECT USING (true);

-- ── 4. No TRUNCATE or DELETE for the client roles ───────────────────────────
-- The only deletion the app performs is delete_my_account(), which is
-- SECURITY DEFINER and does not need the caller to hold DELETE.
REVOKE DELETE, TRUNCATE ON user_data              FROM anon, authenticated;
REVOKE DELETE, TRUNCATE ON scenario_choice_stats  FROM anon, authenticated;
REVOKE DELETE, TRUNCATE ON scenario_ending_stats  FROM anon, authenticated;

-- ── 5. user_data: the column and the constraints 001 declares ───────────────
ALTER TABLE user_data
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE user_data DROP CONSTRAINT IF EXISTS user_data_subscription_status_check;
ALTER TABLE user_data
  ADD CONSTRAINT user_data_subscription_status_check
  CHECK (subscription_status IN ('free', 'trial', 'subscribed'));

ALTER TABLE user_data DROP CONSTRAINT IF EXISTS user_data_trial_plan_check;
ALTER TABLE user_data
  ADD CONSTRAINT user_data_trial_plan_check
  CHECK (trial_plan IN ('monthly', 'yearly') OR trial_plan IS NULL);
