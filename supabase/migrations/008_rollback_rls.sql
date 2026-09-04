-- ============================================================
-- Fasih — Migration 008: EMERGENCY ROLLBACK of 007_enable_rls.sql
--
-- Run this ONLY if enabling RLS broke saving in the live app.
--
-- Symptoms that justify running it:
--   • Signed-in users' progress stops syncing (the in-app sync banner shows an
--     error, or Supabase → Table Editor → user_data stops gaining rows).
--   • Supabase → Logs shows "new row violates row-level security policy".
--
-- This returns the database to exactly the state it was in before 007 — the
-- Option A posture described in 003_rls.sql. It does NOT delete any data.
--
-- ⚠ AFTER RUNNING THIS, THE ORIGINAL SECURITY HOLE IS BACK OPEN: anyone with
-- the app's public key can read or write any user's row. Treat it as a
-- stop-the-bleeding measure, not a resting state. The usual cause is that
-- Clerk↔Supabase Third-Party Auth is not actually connected, which is checked
-- by running this while signed in:
--
--     select auth.jwt()->>'sub';     -- must return the Clerk user id, not NULL
-- ============================================================

-- Drop the policies added by 007.
DROP POLICY IF EXISTS "Users read own data"   ON user_data;
DROP POLICY IF EXISTS "Users write own data"  ON user_data;
DROP POLICY IF EXISTS "Users update own data" ON user_data;

DROP POLICY IF EXISTS "Public read choice stats"          ON scenario_choice_stats;
DROP POLICY IF EXISTS "Authenticated insert choice stats" ON scenario_choice_stats;
DROP POLICY IF EXISTS "Authenticated update choice stats" ON scenario_choice_stats;

DROP POLICY IF EXISTS "Public read ending stats"          ON scenario_ending_stats;
DROP POLICY IF EXISTS "Authenticated insert ending stats" ON scenario_ending_stats;
DROP POLICY IF EXISTS "Authenticated update ending stats" ON scenario_ending_stats;

-- Turn RLS back off.
ALTER TABLE user_data             DISABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_choice_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_ending_stats DISABLE ROW LEVEL SECURITY;

-- Remove the subscription_status lock.
DROP TRIGGER  IF EXISTS lock_subscription_status ON user_data;
DROP FUNCTION IF EXISTS prevent_client_subscription_write();

-- NOTE: the DELETE/TRUNCATE revokes from 007 are deliberately NOT restored.
-- Granting DELETE back to `authenticated` would let any signed-in client wipe
-- rows, which was never intended in either posture. Account deletion goes
-- through the delete_my_account() RPC (005), which is SECURITY DEFINER and
-- unaffected by these grants.
