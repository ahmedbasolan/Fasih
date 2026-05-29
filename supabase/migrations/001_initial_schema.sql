-- ============================================================
-- Fasih — Migration 001: Initial Schema
-- Run this once in your Supabase SQL editor to create all tables.
-- ============================================================

-- ─── user_data ────────────────────────────────────────────────────────────────
-- One row per user. user_id stores the Clerk user ID (e.g. "user_2abc...").
-- Progress is stored as JSONB for schema flexibility while the product is evolving.
-- Do NOT use this for analytics queries — read the JSONB locally or denormalise
-- specific fields into separate columns when you need queryable data.

CREATE TABLE IF NOT EXISTS user_data (
  user_id               TEXT        PRIMARY KEY,
  schema_version        INTEGER     NOT NULL DEFAULT 1,

  -- Blobs (flexible, locally consumed)
  user_profile          JSONB       NOT NULL DEFAULT '{}',
  stats                 JSONB       NOT NULL DEFAULT '{}',
  phrase_reviews        JSONB       NOT NULL DEFAULT '{}',
  completed_scenarios   JSONB       NOT NULL DEFAULT '{}',
  saved_phrases         TEXT[]      NOT NULL DEFAULT '{}',
  unlocked_phrase_ids   TEXT[]      NOT NULL DEFAULT '{}',
  milestones            JSONB       NOT NULL DEFAULT '[]',
  journal               JSONB       NOT NULL DEFAULT '[]',

  -- Queryable scalars
  last_active_date      TEXT,
  subscription_status   TEXT        NOT NULL DEFAULT 'free'
                          CHECK (subscription_status IN ('free', 'trial', 'subscribed')),
  trial_started_at      TEXT,
  trial_plan            TEXT
                          CHECK (trial_plan IN ('monthly', 'yearly') OR trial_plan IS NULL),

  -- Timestamps
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every write
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER user_data_updated_at
  BEFORE UPDATE ON user_data
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── scenario_choice_stats ────────────────────────────────────────────────────
-- Aggregate: how many times each choice was picked in each scene.
-- No PII — purely anonymous aggregate counters.

CREATE TABLE IF NOT EXISTS scenario_choice_stats (
  scenario_id  TEXT    NOT NULL,
  scene_id     TEXT    NOT NULL,
  choice_id    TEXT    NOT NULL,
  pick_count   BIGINT  NOT NULL DEFAULT 1,
  PRIMARY KEY (scenario_id, scene_id, choice_id)
);

-- ─── scenario_ending_stats ───────────────────────────────────────────────────
-- Aggregate: how many times each ending was reached per scenario.

CREATE TABLE IF NOT EXISTS scenario_ending_stats (
  scenario_id  TEXT    NOT NULL,
  ending_type  TEXT    NOT NULL,
  reach_count  BIGINT  NOT NULL DEFAULT 1,
  PRIMARY KEY (scenario_id, ending_type)
);

-- ─── Atomic increment RPCs ───────────────────────────────────────────────────
-- Called from the client via supabase.rpc(). Uses INSERT ... ON CONFLICT to
-- guarantee atomicity without application-level locking.

CREATE OR REPLACE FUNCTION increment_choice_stat(
  p_scenario_id TEXT,
  p_scene_id    TEXT,
  p_choice_id   TEXT
) RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  INSERT INTO scenario_choice_stats (scenario_id, scene_id, choice_id, pick_count)
  VALUES (p_scenario_id, p_scene_id, p_choice_id, 1)
  ON CONFLICT (scenario_id, scene_id, choice_id)
  DO UPDATE SET pick_count = scenario_choice_stats.pick_count + 1;
$$;

CREATE OR REPLACE FUNCTION increment_ending_stat(
  p_scenario_id TEXT,
  p_ending_type TEXT
) RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  INSERT INTO scenario_ending_stats (scenario_id, ending_type, reach_count)
  VALUES (p_scenario_id, p_ending_type, 1)
  ON CONFLICT (scenario_id, ending_type)
  DO UPDATE SET reach_count = scenario_ending_stats.reach_count + 1;
$$;
