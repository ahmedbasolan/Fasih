-- ============================================================
-- Fasih — Migration 004: Schema v2 additions
-- Run this if your database was created before schema_version 2.
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS guards).
-- ============================================================

-- Add schema_version column (introduced in schema v2)
ALTER TABLE user_data
  ADD COLUMN IF NOT EXISTS schema_version INTEGER NOT NULL DEFAULT 1;

-- Add unlocked_phrase_ids column (phrases unlocked through scenario completion)
-- Previously only stored in AsyncStorage — now synced to cloud so reinstalls
-- restore all unlocked phrases.
ALTER TABLE user_data
  ADD COLUMN IF NOT EXISTS unlocked_phrase_ids TEXT[] NOT NULL DEFAULT '{}';

-- Bump existing rows to schema_version = 1 (they predate versioning)
UPDATE user_data
  SET schema_version = 1
  WHERE schema_version IS NULL OR schema_version = 0;

-- Ensure the auto-update trigger exists (idempotent — from migration 001)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate trigger if it doesn't exist (DROP+CREATE is safe for triggers)
DROP TRIGGER IF EXISTS user_data_updated_at ON user_data;
CREATE TRIGGER user_data_updated_at
  BEFORE UPDATE ON user_data
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
