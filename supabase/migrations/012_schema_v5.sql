-- ============================================================
-- Fasih — Migration 012: Schema v5 (scenario run history)
-- Run BEFORE shipping app code with CURRENT_SCHEMA_VERSION = 5:
-- that code upserts this column, and PostgREST rejects an upsert
-- naming a column the table doesn't have — sync would fail for everyone.
-- Safe to run multiple times (IF NOT EXISTS guard).
-- ============================================================

-- scenario_history: scenarioId → each completed run, in order, e.g.
-- { "first-morning": [
--     { "endingId": "friendly-not-close", "endingType": "mixed",   "on": "2026-09-15" },
--     { "endingId": "coffee-from-home",   "endingType": "exceptional", "on": "2026-09-17" }
-- ] }
-- A record's position is its run number. `on` is a local calendar DAY, never a
-- timestamp: enough to measure a replay within 7 days (spec 2026-09-14 §2.12),
-- too coarse to line up against anything else. Capped at 20 runs per scenario
-- by the app (src/engine/scenarioHistory.ts).
--
-- Read by supabase/queries/scenario_metrics.sql. Deleted with the rest of the
-- row by delete_my_account() (005_account_deletion.sql) — nothing to add there.
ALTER TABLE user_data
  ADD COLUMN IF NOT EXISTS scenario_history JSONB NOT NULL DEFAULT '{}'::jsonb;

-- No schema_version UPDATE, same as 011: v5 is purely additive, and each row
-- becomes v5 on its next push.
