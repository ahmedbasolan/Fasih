-- ============================================================
-- Fasih — Migration 006: Clerk↔Supabase auth check
--
-- Run this BEFORE 007_enable_rls.sql. It changes no data and grants no new
-- access — it exists so the prerequisite for RLS can actually be verified.
--
-- THE PROBLEM IT SOLVES
-- --------------------
-- 003_rls.sql and 005_account_deletion.sql both say to verify with:
--
--     select auth.jwt()->>'sub';
--
-- but running that in the Supabase SQL editor ALWAYS returns NULL, because the
-- SQL editor connects as a privileged database user and carries no Clerk
-- session token. The check is only meaningful when made by the app, signed in,
-- over the same client that does the syncing.
--
-- whoami() is SECURITY INVOKER (the default), so it sees exactly the caller's
-- own JWT — which is the point. It returns NULL for an anonymous caller and the
-- Clerk user id for a signed-in one.
--
-- Once RLS is enabled and confirmed working, this function can be dropped:
--     DROP FUNCTION IF EXISTS public.whoami();
-- ============================================================

CREATE OR REPLACE FUNCTION public.whoami()
RETURNS TABLE (clerk_user_id text, jwt_role text)
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT
    (select auth.jwt()->>'sub')  AS clerk_user_id,
    (select auth.jwt()->>'role') AS jwt_role;
$$;

-- Callable by both roles so the check works before and after sign-in.
GRANT EXECUTE ON FUNCTION public.whoami() TO anon, authenticated;
