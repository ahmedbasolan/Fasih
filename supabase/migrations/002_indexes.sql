-- ============================================================
-- Fasih — Migration 002: Performance Indexes
-- Run after 001_initial_schema.sql
-- ============================================================

-- ─── user_data ────────────────────────────────────────────────────────────────

-- Most common query pattern: fetch one user's row by ID.
-- The PRIMARY KEY already creates this index — documented here for completeness.
-- CREATE UNIQUE INDEX user_data_pkey ON user_data (user_id);

-- Allow fast "who was active today / this week?" queries without scanning JSONB.
CREATE INDEX IF NOT EXISTS idx_user_data_last_active
  ON user_data (last_active_date)
  WHERE last_active_date IS NOT NULL;

-- Allow fast "how many subscribed users?" analytics queries.
CREATE INDEX IF NOT EXISTS idx_user_data_subscription
  ON user_data (subscription_status);

-- Combined index for "find active subscribers" — covers both filters in one scan.
CREATE INDEX IF NOT EXISTS idx_user_data_sub_active
  ON user_data (subscription_status, last_active_date)
  WHERE last_active_date IS NOT NULL;

-- ─── scenario_choice_stats ───────────────────────────────────────────────────

-- Fetch all choices for a given scene (used by getChoiceStats before showing a scene).
-- This is the hot read path — called just before each scene is displayed.
CREATE INDEX IF NOT EXISTS idx_choice_stats_scene
  ON scenario_choice_stats (scenario_id, scene_id);

-- ─── scenario_ending_stats ───────────────────────────────────────────────────

-- Fetch all endings for a given scenario (used by getEndingStats on result screen).
CREATE INDEX IF NOT EXISTS idx_ending_stats_scenario
  ON scenario_ending_stats (scenario_id);
