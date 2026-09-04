-- ============================================================
-- Fasih — Migration 010: Secure the community-stat RPCs
--
-- increment_choice_stat() and increment_ending_stat() (001_initial_schema.sql)
-- are SECURITY DEFINER, so they bypass RLS entirely — the INSERT/UPDATE
-- policies on scenario_choice_stats / scenario_ending_stats added in
-- 007_enable_rls.sql are correctly labelled "defence in depth" there, not the
-- actual gate. The actual gate is EXECUTE privilege on the function, and it
-- was never restricted: Postgres grants EXECUTE on a new function to PUBLIC by
-- default, so both RPCs have been callable by anyone holding the app's public
-- anon key — no Clerk sign-in required — since 001 was first applied.
--
-- Impact: supabase.rpc('increment_choice_stat', { p_scenario_id, p_scene_id,
-- p_choice_id }) accepts arbitrary strings, and the composite primary key has
-- no length or format constraint, so an anonymous caller could (a) insert
-- unbounded rows — a storage-abuse DoS — and (b) skew the "X% of players
-- picked this" community stats shown on scenario result screens.
--
-- ⚠ PREREQUISITE: 007_enable_rls.sql must already be applied. A request
-- carrying a Clerk token runs as `authenticated`; without 007's bridge in
-- place there is no `authenticated` role reachable from the app at all, and
-- this migration would lock the RPCs out for every caller, signed in or not.
--
-- This script is safe to re-run.
-- ============================================================

REVOKE ALL ON FUNCTION increment_choice_stat(text, text, text) FROM public;
REVOKE ALL ON FUNCTION increment_choice_stat(text, text, text) FROM anon;
GRANT  EXECUTE ON FUNCTION increment_choice_stat(text, text, text) TO authenticated;

REVOKE ALL ON FUNCTION increment_ending_stat(text, text) FROM public;
REVOKE ALL ON FUNCTION increment_ending_stat(text, text) FROM anon;
GRANT  EXECUTE ON FUNCTION increment_ending_stat(text, text) TO authenticated;

COMMENT ON FUNCTION increment_choice_stat(text, text, text) IS
  'Atomically bumps a community choice-pick counter. SECURITY DEFINER — bypasses RLS, so EXECUTE is restricted to authenticated (Clerk-signed-in) callers here rather than relied on via table policy.';

COMMENT ON FUNCTION increment_ending_stat(text, text) IS
  'Atomically bumps a community ending-reach counter. SECURITY DEFINER — bypasses RLS, so EXECUTE is restricted to authenticated (Clerk-signed-in) callers here rather than relied on via table policy.';
