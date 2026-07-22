-- ============================================================
-- Fasih — Migration 003: Row Level Security
-- Run after 001_initial_schema.sql
--
-- IMPORTANT: This app uses Clerk for auth, NOT Supabase Auth.
-- auth.uid() always returns NULL for Clerk users — any policy that
-- uses auth.uid() will silently block all operations.
--
-- Two options are provided below. Choose ONE and run it.
-- ============================================================

-- ════════════════════════════════════════════════════════════
-- OPTION A — Simple: Disable RLS entirely (current default)
--
-- Access control is enforced by:
--   1. The Supabase anon key (public key, safe to expose)
--   2. user_id === clerkUserId in the application layer
--   3. Supabase dashboard → Table Editor → Row-level permissions
--      to restrict which operations the anon key can perform
--
-- Risk: Any client with the anon key can read/write any row.
-- Mitigation: Revoke DELETE and TRUNCATE from anon role in dashboard.
-- Suitable for: early-stage product, pre-security-audit phase.
-- ════════════════════════════════════════════════════════════

ALTER TABLE user_data               DISABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_choice_stats   DISABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_ending_stats   DISABLE ROW LEVEL SECURITY;

-- Restrict dangerous operations from the public anon role:
REVOKE DELETE ON user_data             FROM anon;
REVOKE TRUNCATE ON user_data           FROM anon;
REVOKE DELETE ON scenario_choice_stats FROM anon;
REVOKE DELETE ON scenario_ending_stats FROM anon;

-- ════════════════════════════════════════════════════════════
-- OPTION B — Proper: Clerk session token + RLS (production)
--
-- NOTE: The old "create a JWT template named supabase" flow is DEPRECATED.
-- Since April 2025 the native Third-Party Auth integration is the supported
-- path — no JWT template, and no pasting JWKS into the JWT Secret field.
--
-- Prerequisites (one-time, both dashboards):
--
--  1. Clerk Dashboard → "Connect with Supabase".
--     This adds the required  role: "authenticated"  claim to session tokens.
--
--  2. Supabase Dashboard → Authentication → Third-Party Auth → add Clerk.
--     Clerk domain for this project:  enjoyed-elf-2.clerk.accounts.dev
--
--  3. Local dev only — supabase/config.toml:
--       [auth.third_party.clerk]
--       enabled = true
--       domain = "enjoyed-elf-2.clerk.accounts.dev"
--
-- Client wiring is ALREADY DONE in src/lib/supabase.ts: the client passes an
-- `accessToken` callback that returns the Clerk session token via
-- getClerkInstance().session?.getToken().
--
-- ⚠ ORDER MATTERS: confirm a signed-in request actually carries the token
-- BEFORE enabling RLS. Verify with:
--     select auth.jwt()->>'sub';        -- should return the Clerk user id
-- If that returns NULL, enabling RLS will silently break every sync write.
--
-- Once verified, un-comment and run the block below.
-- ════════════════════════════════════════════════════════════

/*
-- auth.jwt()->>'sub' is the Clerk user id. The (select ...) wrapper lets
-- Postgres evaluate it once per query instead of once per row.

-- A request carrying a Clerk token runs as the `authenticated` role, NOT `anon`.
-- The REVOKEs at the top of this file only name `anon`, so they do not cover
-- signed-in requests at all. Re-apply them for `authenticated` or the table-level
-- grant stays wide open regardless of what the policies below say.
REVOKE DELETE, TRUNCATE ON user_data              FROM authenticated;
REVOKE DELETE            ON scenario_choice_stats FROM authenticated;
REVOKE DELETE            ON scenario_ending_stats FROM authenticated;

ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Users can only read and write their own row.
-- NOTE: pushProgress() upserts, so INSERT *and* UPDATE policies are both
-- required. UPDATE additionally needs SELECT, or it silently affects 0 rows.
-- `TO authenticated` means a token-less (anon) request matches no policy and is
-- denied outright, rather than relying on auth.jwt() being NULL.
CREATE POLICY "Users read own data"
  ON user_data FOR SELECT TO authenticated
  USING (user_id = (select auth.jwt()->>'sub'));

CREATE POLICY "Users write own data"
  ON user_data FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.jwt()->>'sub'));

CREATE POLICY "Users update own data"
  ON user_data FOR UPDATE TO authenticated
  USING (user_id = (select auth.jwt()->>'sub'))
  WITH CHECK (user_id = (select auth.jwt()->>'sub'));

-- Community stats are anonymous aggregates — public read, authenticated write.
-- Deliberately NOT `FOR ALL`: that covers DELETE too, so any signed-in user
-- could wipe the shared stats table. Grant only the two writes the app actually
-- performs — insert a new counter row, or bump an existing one.
ALTER TABLE scenario_choice_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read choice stats"
  ON scenario_choice_stats FOR SELECT USING (true);
CREATE POLICY "Authenticated insert choice stats"
  ON scenario_choice_stats FOR INSERT TO authenticated
  WITH CHECK ((select auth.jwt()->>'sub') IS NOT NULL);
CREATE POLICY "Authenticated update choice stats"
  ON scenario_choice_stats FOR UPDATE TO authenticated
  USING ((select auth.jwt()->>'sub') IS NOT NULL)
  WITH CHECK ((select auth.jwt()->>'sub') IS NOT NULL);

ALTER TABLE scenario_ending_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read ending stats"
  ON scenario_ending_stats FOR SELECT USING (true);
CREATE POLICY "Authenticated insert ending stats"
  ON scenario_ending_stats FOR INSERT TO authenticated
  WITH CHECK ((select auth.jwt()->>'sub') IS NOT NULL);
CREATE POLICY "Authenticated update ending stats"
  ON scenario_ending_stats FOR UPDATE TO authenticated
  USING ((select auth.jwt()->>'sub') IS NOT NULL)
  WITH CHECK ((select auth.jwt()->>'sub') IS NOT NULL);
*/
