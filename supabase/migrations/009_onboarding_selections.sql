-- ============================================================
-- Fasih — Migration 009: onboarding_selections
--
-- Anonymous aggregate of what kind of learner is signing up, so scenarios and
-- phrases can be written for a real audience rather than a guessed one.
--
-- Spec: docs/superpowers/specs/2026-09-03-onboarding-analytics-design.md
--
-- ⚠ PREREQUISITE: 007_enable_rls.sql must already be applied and its check
--   passing (`select auth.jwt()->>'sub'` returns a user_2... id when run FROM
--   THE APP while signed in — the SQL editor carries no Clerk token and always
--   returns NULL). This table's policy is `TO authenticated`, which is the role
--   a Clerk-token request runs as. Without that bridge working, every insert
--   here is denied and the app silently records nothing.
--
-- THE GUARANTEE THIS TABLE MAKES, precisely:
--
--   Anonymous AT REST. The stored row contains no user identifier and no value
--   that can be joined back to one. The request that creates it IS
--   authenticated — src/lib/supabase.ts forwards the Clerk session token on
--   every request — and Postgres does not persist that identity on the row.
--
--   That is not the same as "the server never sees who you are", and the
--   privacy policy must not claim that it is.
--
-- Consequences, stated so they are not later discovered as bugs:
--   • No per-user deletion. There is nothing to delete; that is the point, and
--     it is the basis for 005_account_deletion.sql deliberately not touching
--     this table.
--   • No deduplication. A reinstall produces a second row. The client holds a
--     fire-once flag per install, which is not tamper-proof and is not meant
--     to be. Treat the counts as APPROXIMATE.
--   • No funnel, drop-off or cohort analysis. You cannot tell whether the same
--     person abandoned.
--
-- If any of those become requirements, that is a PSEUDONYMOUS design with
-- materially different obligations. It needs its own spec, not a column added
-- to this table.
--
-- This script is safe to re-run.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.onboarding_selections (
  id           bigint generated always as identity primary key,

  mode         text not null
                 check (mode in ('career', 'social')),

  -- Values are verbatim from STRINGS.onboarding.roles (8) and
  -- STRINGS.onboarding.goals (5) in src/constants/strings.ts. A ninth role
  -- added to the app without being added here fails this check, and the client
  -- drops the write silently rather than breaking onboarding — so the
  -- constraint and the strings file MUST be changed together.
  role         text not null
                 check (role in (
                   'hospitality', 'food_beverage', 'retail_sales', 'health_wellness',
                   'transport_logistics', 'property_facilities', 'office_corporate',
                   'education_childcare'
                 )),

  goals        text[] not null
                 check (
                   array_length(goals, 1) between 1 and 5
                   and goals <@ array[
                     'professional', 'friends', 'culture', 'daily', 'career'
                   ]::text[]
                 ),

  app_version  text,

  -- DATE, NEVER timestamptz.
  --
  -- This is the single most important line in the schema. Role + goals + an
  -- exact second, joined against user_data.created_at, would often identify one
  -- person. `current_date` has no time component and cannot be joined that way.
  -- Do not "improve" this later by adding precision back.
  completed_on date not null default current_date
);

-- No indexes, deliberately. The only query pattern is an aggregate over
-- substantially the whole table (`group by role, mode`), which Postgres
-- sequential-scans regardless. Indexes on a 2-value and an 8-value column
-- would never be chosen by the planner: they would cost write throughput and
-- buy nothing. Revisit only if `where completed_on > …` ever becomes selective
-- enough to matter, which is a good problem and a long way off.

-- ─── RLS: insert-only ────────────────────────────────────────────────────────
-- The critical property is that the client can WRITE but never READ. Without
-- it, any signed-in user could select the whole table and read every learner's
-- onboarding choices.

ALTER TABLE public.onboarding_selections ENABLE ROW LEVEL SECURITY;

-- Table-level grants first, following 007_enable_rls.sql. A request carrying a
-- Clerk token runs as `authenticated`, not `anon`, so revoking only from `anon`
-- would leave the table open to exactly the traffic this app produces.
REVOKE ALL    ON public.onboarding_selections FROM anon, authenticated;
GRANT  INSERT ON public.onboarding_selections TO   authenticated;

DROP POLICY IF EXISTS "insert only, no read" ON public.onboarding_selections;

-- `WITH CHECK (true)` is correct here rather than lax: there is no user column
-- to constrain the row against, because the row is anonymous by construction.
-- The CHECK constraints in the table definition do the validation that matters.
CREATE POLICY "insert only, no read"
  ON public.onboarding_selections
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- No SELECT, UPDATE or DELETE policy exists, so all three are denied to both
-- roles. Reading is done from the Supabase dashboard or SQL editor under the
-- service role, never from the app. The service role key stays server-side.

-- ─── The security gate ───────────────────────────────────────────────────────
-- Before shipping the client write, verify BOTH of these from the app while
-- signed in. Do not proceed past a failure.
--
--   1. An insert succeeds.
--   2. A select returns zero rows AND does not leak — an empty result with no
--      error is the failure mode to watch for, because it looks like success.
--
--   supabase.from('onboarding_selections').select('*')
--     → expect an RLS error or an empty set, never data.
