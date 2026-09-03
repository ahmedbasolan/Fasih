-- ============================================================
-- Fasih — Migration 006: Enable Row Level Security (Option B)
--
-- This is the uncommented, ready-to-run form of the Option B block in
-- 003_rls.sql. Run it as-is; nothing in this file needs editing.
--
-- ⚠ DO NOT RUN THIS UNTIL THE PREREQUISITE CHECK PASSES.
--
-- PREREQUISITES (both dashboards, one-time):
--   1. Clerk Dashboard    → "Connect with Supabase"
--        Adds the required  role: "authenticated"  claim to session tokens.
--   2. Supabase Dashboard → Authentication → Third-Party Auth → add Clerk
--        Clerk domain for this project:  enjoyed-elf-2.clerk.accounts.dev
--
-- THE CHECK — run this FIRST, from the app while signed in (not from the SQL
-- editor, which has no Clerk token):
--
--     select auth.jwt()->>'sub';
--
--   Signed in, it must return the Clerk user id (looks like  user_2abc...).
--   If it returns NULL, STOP. Enabling RLS now would silently break every
--   sync write — the app would appear to work while saving nothing.
--
-- This script is safe to re-run: every policy is dropped before it is created,
-- so a partial run can simply be run again.
--
-- TO UNDO, see 007_rollback_rls.sql.
-- ============================================================

-- ─── Table-level grants ──────────────────────────────────────────────────────
-- A request carrying a Clerk token runs as `authenticated`, NOT `anon`. The
-- REVOKEs in 003_rls.sql only name `anon`, so they do not cover signed-in
-- requests at all. Without these the table-level grant stays wide open no
-- matter what the policies below say.
REVOKE DELETE, TRUNCATE ON user_data              FROM authenticated;
REVOKE DELETE            ON scenario_choice_stats FROM authenticated;
REVOKE DELETE            ON scenario_ending_stats FROM authenticated;

-- ─── user_data: each learner sees only their own row ─────────────────────────
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- pushProgress() upserts, so INSERT *and* UPDATE policies are both required.
-- UPDATE additionally needs SELECT, or it silently affects 0 rows.
-- `TO authenticated` means a token-less (anon) request matches no policy and is
-- denied outright, rather than relying on auth.jwt() being NULL.
DROP POLICY IF EXISTS "Users read own data"   ON user_data;
DROP POLICY IF EXISTS "Users write own data"  ON user_data;
DROP POLICY IF EXISTS "Users update own data" ON user_data;

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

-- ─── Lock subscription_status against client writes ──────────────────────────
-- The policies above only check row OWNERSHIP — nothing stops a signed-in user
-- writing subscription_status: 'subscribed' onto their own row and getting
-- paywalled content free. RLS cannot express "this row, but not this column",
-- so the column is locked with a trigger instead.
--
-- RevenueCat re-confirms the real entitlement on every app launch, so this
-- column is a convenience cache, not the authority. Locking it costs a genuine
-- subscriber at most a brief flash of pre-purchase UI on cold start.
-- A future RevenueCat webhook writing via the service_role key is deliberately
-- NOT intercepted by this trigger.
CREATE OR REPLACE FUNCTION prevent_client_subscription_write()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  IF (select auth.jwt()->>'role') = 'authenticated' THEN
    IF TG_OP = 'INSERT' THEN
      NEW.subscription_status := 'free';
    ELSIF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status THEN
      NEW.subscription_status := OLD.subscription_status;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lock_subscription_status ON user_data;
CREATE TRIGGER lock_subscription_status
  BEFORE INSERT OR UPDATE ON user_data
  FOR EACH ROW EXECUTE FUNCTION prevent_client_subscription_write();

-- ─── Community stats: anonymous aggregates ───────────────────────────────────
-- Public read, authenticated write. Deliberately NOT `FOR ALL`: that would
-- cover DELETE, letting any signed-in user wipe the shared stats table.
-- (increment_choice_stat / increment_ending_stat are SECURITY DEFINER and
-- bypass RLS anyway — these policies are defence in depth.)
ALTER TABLE scenario_choice_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read choice stats"          ON scenario_choice_stats;
DROP POLICY IF EXISTS "Authenticated insert choice stats" ON scenario_choice_stats;
DROP POLICY IF EXISTS "Authenticated update choice stats" ON scenario_choice_stats;

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

DROP POLICY IF EXISTS "Public read ending stats"          ON scenario_ending_stats;
DROP POLICY IF EXISTS "Authenticated insert ending stats" ON scenario_ending_stats;
DROP POLICY IF EXISTS "Authenticated update ending stats" ON scenario_ending_stats;

CREATE POLICY "Public read ending stats"
  ON scenario_ending_stats FOR SELECT USING (true);
CREATE POLICY "Authenticated insert ending stats"
  ON scenario_ending_stats FOR INSERT TO authenticated
  WITH CHECK ((select auth.jwt()->>'sub') IS NOT NULL);
CREATE POLICY "Authenticated update ending stats"
  ON scenario_ending_stats FOR UPDATE TO authenticated
  USING ((select auth.jwt()->>'sub') IS NOT NULL)
  WITH CHECK ((select auth.jwt()->>'sub') IS NOT NULL);
