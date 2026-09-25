-- ============================================================
-- Fasih — Migration 011: Schema v4 additions (replay loop)
-- Run BEFORE shipping app code with CURRENT_SCHEMA_VERSION = 4:
-- that code upserts these columns, and PostgREST rejects an upsert
-- naming a column the table doesn't have — sync would fail for everyone.
-- Safe to run multiple times (IF NOT EXISTS guards).
-- ============================================================

-- endings_found: scenarioId → ending ids ever reached, e.g.
-- { "first-morning": ["the-warm-welcome", "one-of-the-boys"] }
-- Only grows. Drives the "3 of 5 endings found" collection.
ALTER TABLE user_data
  ADD COLUMN IF NOT EXISTS endings_found JSONB NOT NULL DEFAULT '{}'::jsonb;

-- scenario_runs: scenarioId → completed runs, e.g. { "first-morning": 3 }
-- A count above 1 means the learner replayed — the launch success metric.
ALTER TABLE user_data
  ADD COLUMN IF NOT EXISTS scenario_runs JSONB NOT NULL DEFAULT '{}'::jsonb;

-- No schema_version UPDATE: existing rows keep whatever version they were
-- written at (the truth), the app merges them safely because v4 is purely
-- additive, and each row becomes v4 on its next push.
