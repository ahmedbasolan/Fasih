-- ============================================================
-- Fasih — Migration 005: Enable RLS via Clerk JWT
-- Supersedes 003_rls.sql Option A. Run after Clerk JWT template
-- "supabase" is configured and verified in the Supabase dashboard.
-- ============================================================

CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT LANGUAGE sql STABLE AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', TRUE)::json ->> 'sub',
    ''
  );
$$;

ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own data" ON user_data;
CREATE POLICY "Users read own data"
  ON user_data FOR SELECT
  USING (user_id = requesting_user_id());

DROP POLICY IF EXISTS "Users write own data" ON user_data;
CREATE POLICY "Users write own data"
  ON user_data FOR INSERT
  WITH CHECK (user_id = requesting_user_id());

DROP POLICY IF EXISTS "Users update own data" ON user_data;
CREATE POLICY "Users update own data"
  ON user_data FOR UPDATE
  USING (user_id = requesting_user_id())
  WITH CHECK (user_id = requesting_user_id());

-- Locks subscription_status against client writes on BOTH insert and update.
-- (Prior version only guarded UPDATE, which left INSERT open: a user's own
-- valid JWT is enough to satisfy the "Users write own data" INSERT policy,
-- so nothing stopped a first-time row from being inserted with
-- subscription_status: 'subscribed' before any legitimate row existed.)
-- Service-role/webhook writes (e.g. RevenueCat webhook updating entitlement
-- status) bypass this because request.jwt.claims ->> 'role' is not
-- 'authenticated' for those requests.
CREATE OR REPLACE FUNCTION prevent_client_subscription_write()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF (current_setting('request.jwt.claims', TRUE)::json ->> 'role') = 'authenticated' THEN
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

ALTER TABLE scenario_choice_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read choice stats" ON scenario_choice_stats;
CREATE POLICY "Public read choice stats" ON scenario_choice_stats FOR SELECT USING (true);

ALTER TABLE scenario_ending_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read ending stats" ON scenario_ending_stats;
CREATE POLICY "Public read ending stats" ON scenario_ending_stats FOR SELECT USING (true);
