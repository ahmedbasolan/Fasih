# Fasih — Supabase Migrations

Run these files **in order** in the Supabase SQL editor (Dashboard → SQL Editor).

| File | What it does | Required |
|------|-------------|----------|
| `001_initial_schema.sql` | Creates all tables, triggers, RPC functions | Yes (first-time setup) |
| `002_indexes.sql` | Performance indexes on all tables | Yes |
| `003_rls.sql` | Row Level Security — Option A (disabled). Superseded by `005_enable_rls.sql`, kept for history only | No (superseded) |
| `004_schema_v2.sql` | Adds `schema_version` + `unlocked_phrase_ids` columns | Yes (if DB existed before v2) |
| `005_enable_rls.sql` | Enables RLS via Clerk JWT + locks `subscription_status` against client writes | Yes |

## First-time setup

Run `001` → `002` → `004` → `005` in order. Skip `003` — it's superseded by `005`. Done.

## Existing database (upgrading)

Run `004_schema_v2.sql` to add the new columns, then `005_enable_rls.sql` if it hasn't been applied yet.
Already-existing rows will get default values.

## RLS — current posture

RLS is **enabled** on `user_data` via `005_enable_rls.sql`, using Clerk JWTs verified by Supabase
(`requesting_user_id()` reads `request.jwt.claims ->> 'sub'`). Requires the Clerk dashboard
`supabase` JWT template to be configured — see `005_enable_rls.sql` for the policy definitions.

- Users can only read/insert/update rows where `user_id = requesting_user_id()`.
- `subscription_status` cannot be set by an authenticated client on **either** INSERT or UPDATE —
  the `lock_subscription_status` trigger (`prevent_client_subscription_write()`) forces it to
  `'free'` on INSERT and freezes it to its previous value on UPDATE, for any request whose JWT
  role is `authenticated`. Only service-role/webhook writes (e.g. the RevenueCat webhook) can
  change it.
- `003_rls.sql` (Option A — RLS disabled) is superseded and should not be run on new databases.

## Schema version history

| Version | Changes |
|---------|---------|
| 1 | Initial schema (all JSONB blobs, no versioning) |
| 2 | Added `schema_version` + `unlocked_phrase_ids` columns |
