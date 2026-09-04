-- ============================================================
-- Fasih — Migration 006: Schema v3 additions (Sentence Builder)
-- Run this if your database was created before schema_version 3.
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS guards).
-- ============================================================

-- Add pattern_progress column (Sentence Builder pattern mastery)
-- PatternProgress: { correctBuilds: number, lastBuilt?: ISO date }
-- Previously only stored in AsyncStorage — now synced to cloud so reinstalls
-- restore Sentence Builder progress.
ALTER TABLE user_data
  ADD COLUMN IF NOT EXISTS pattern_progress JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Add secret_endings_earned column (scenarioId → secret ending title)
-- Earned once per scenario and never overwritten on replay — synced so the
-- unlock is never lost on reinstall.
ALTER TABLE user_data
  ADD COLUMN IF NOT EXISTS secret_endings_earned JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Bump existing rows to schema_version = 2 (they predate schema v3)
UPDATE user_data
  SET schema_version = 2
  WHERE schema_version < 2;

-- Ensure the auto-update trigger still exists (idempotent — from migration 001)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_data_updated_at ON user_data;
CREATE TRIGGER user_data_updated_at
  BEFORE UPDATE ON user_data
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
