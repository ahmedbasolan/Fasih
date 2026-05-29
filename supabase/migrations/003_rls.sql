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
-- OPTION B — Proper: Clerk JWT + RLS (recommended for production)
--
-- Prerequisites (one-time Clerk dashboard setup):
--
--  1. In Clerk Dashboard → JWT Templates → Create new template named "supabase"
--  2. Set the template claims to:
--       {
--         "sub":  "{{user.id}}",
--         "role": "authenticated",
--         "iss":  "https://clerk.your-app.com"
--       }
--  3. Copy the JWKS URL from Clerk (Clerk Dashboard → API Keys → Advanced → JWT)
--  4. In Supabase Dashboard → Settings → Auth → JWT Settings:
--     - Paste the JWKS URL as the "JWT Secret" (or use the signing secret)
--
-- Then in the client (supabase.ts), add the Clerk JWT to every request:
--
--   import { useAuth } from '@clerk/expo';
--   const { getToken } = useAuth();
--   const clerkToken = await getToken({ template: 'supabase' });
--   supabase.functions.setAuth(clerkToken ?? '');
--
-- Once Clerk JWTs are wired to Supabase, un-comment and run the block below:
-- ════════════════════════════════════════════════════════════

/*
-- Extract Clerk user ID from the JWT subject claim
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT LANGUAGE sql STABLE AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', TRUE)::json ->> 'sub',
    ''
  );
$$;

ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Users can only read and write their own row
CREATE POLICY "Users read own data"
  ON user_data FOR SELECT
  USING (user_id = requesting_user_id());

CREATE POLICY "Users write own data"
  ON user_data FOR INSERT
  WITH CHECK (user_id = requesting_user_id());

CREATE POLICY "Users update own data"
  ON user_data FOR UPDATE
  USING (user_id = requesting_user_id())
  WITH CHECK (user_id = requesting_user_id());

-- Community stats are anonymous aggregates — public read, authenticated write
ALTER TABLE scenario_choice_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read choice stats"
  ON scenario_choice_stats FOR SELECT USING (true);
CREATE POLICY "Authenticated write choice stats"
  ON scenario_choice_stats FOR ALL
  USING (requesting_user_id() IS NOT NULL);

ALTER TABLE scenario_ending_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read ending stats"
  ON scenario_ending_stats FOR SELECT USING (true);
CREATE POLICY "Authenticated write ending stats"
  ON scenario_ending_stats FOR ALL
  USING (requesting_user_id() IS NOT NULL);
*/
