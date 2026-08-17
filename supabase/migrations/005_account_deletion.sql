-- ============================================================
-- Fasih — Migration 005: Account deletion
--
-- Apple requires in-app account deletion from any app that offers account
-- creation (App Store Review Guideline 5.1.1(v)).
--
-- WHY THIS NEEDS AN RPC AT ALL
-- ----------------------------
-- 003_rls.sql deliberately revokes DELETE on user_data from `anon` (and, in the
-- commented Option B block, from `authenticated` too) so that a leaked anon key
-- can't be used to wipe rows. That revoke is correct and stays — which means the
-- client cannot delete its own row directly. This SECURITY DEFINER function is
-- the one narrow, audited exception.
--
-- WHY IT TAKES NO ARGUMENTS
-- -------------------------
-- The caller's identity is read from the Clerk session token, never passed in.
-- A function like delete_account(p_user_id TEXT) would let anyone holding the
-- public anon key delete any account by supplying someone else's Clerk id.
-- Taking zero parameters makes that class of bug impossible to write.
--
-- ⚠ PREREQUISITE — this function fails closed until Clerk↔Supabase Third-Party
-- Auth is configured, because auth.jwt() will be NULL without it:
--   1. Clerk Dashboard  → "Connect with Supabase"
--   2. Supabase Dashboard → Authentication → Third-Party Auth → add Clerk
--      (domain for this project: enjoyed-elf-2.clerk.accounts.dev)
-- These are the same prerequisites already listed for Option B in 003_rls.sql.
--
-- Verify before relying on it — signed in, this must return the Clerk user id:
--   select auth.jwt()->>'sub';
-- If it returns NULL, deletion will correctly refuse rather than silently
-- delete nothing and report success.
-- ============================================================

CREATE OR REPLACE FUNCTION delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  caller_id text;
BEGIN
  caller_id := (select auth.jwt()->>'sub');

  -- Fail loudly rather than deleting zero rows and letting the client report
  -- success to a user who was promised their data was erased.
  IF caller_id IS NULL OR caller_id = '' THEN
    RAISE EXCEPTION 'delete_my_account: no authenticated caller (auth.jwt()->>''sub'' is null) — is Clerk Third-Party Auth configured?';
  END IF;

  DELETE FROM user_data WHERE user_id = caller_id;
END;
$$;

-- Only signed-in callers. `anon` must not reach this at all — without a token
-- it could never pass the check above, but revoking is clearer than relying on
-- the guard, and keeps the grant surface explicit.
REVOKE ALL     ON FUNCTION delete_my_account() FROM public;
REVOKE ALL     ON FUNCTION delete_my_account() FROM anon;
GRANT  EXECUTE ON FUNCTION delete_my_account() TO authenticated;

COMMENT ON FUNCTION delete_my_account() IS
  'Deletes the calling user''s user_data row. Identity comes from the Clerk session token (auth.jwt()->>''sub''), never from a parameter. Raises if unauthenticated.';

-- ── Note on the community stats tables ──────────────────────────────────────
-- scenario_choice_stats and scenario_ending_stats are anonymous aggregate
-- counters — they hold no user id and nothing that can be traced back to a
-- person, so there is deliberately nothing to delete there on account removal.
