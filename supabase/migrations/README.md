# Fasih — Supabase Migrations

Run these files **in order** in the Supabase SQL editor (Dashboard → SQL Editor).

| File | What it does | Required |
|------|-------------|----------|
| `001_initial_schema.sql` | Creates all tables, triggers, RPC functions | Yes (first-time setup) |
| `002_indexes.sql` | Performance indexes on all tables | Yes |
| `003_rls.sql` | Row Level Security — read comments, choose Option A or B | Yes |
| `004_schema_v2.sql` | Adds `schema_version` + `unlocked_phrase_ids` columns | Yes (if DB existed before v2) |

## First-time setup

Run `001` → `002` → `003` (Option A for now) in order. Done.

## Existing database (upgrading)

Run `004_schema_v2.sql` to add the new columns. Already-existing rows will get default values.

## RLS — which option to choose

**Option A (current):** RLS disabled. Simplest. Suitable until launch.

**Option B (recommended for production):** Proper Clerk JWT → Supabase RLS.
Requires one-time Clerk dashboard configuration. See `003_rls.sql` for step-by-step instructions.

## Schema version history

| Version | Changes |
|---------|---------|
| 1 | Initial schema (all JSONB blobs, no versioning) |
| 2 | Added `schema_version` + `unlocked_phrase_ids` columns |
