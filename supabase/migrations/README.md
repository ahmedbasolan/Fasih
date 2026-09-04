# Fasih — Supabase Migrations

Run these files in the Supabase SQL editor (Dashboard → SQL Editor), in number
order, **skipping the ones the Required column says to skip**. One file in here
is a decision document rather than a migration, and running it does damage —
see `003_rls.sql` below.

Do **not** use `npx supabase db push`. These files are hand-numbered
(`001_`, `002_`…) rather than in the CLI's `<timestamp>_name.sql` format, so the
CLI does not recognise them as an applied history and will try to replay the
whole directory — starting with `001_initial_schema.sql`.

| File | What it does | Required |
|------|-------------|----------|
| `001_initial_schema.sql` | Creates all tables, triggers, RPC functions | Yes (first-time setup) |
| `002_indexes.sql` | Performance indexes on all tables | Yes |
| `003_rls.sql` | Row Level Security decision doc — ⚠ **do not run**, see below | Read only |
| `004_schema_v2.sql` | Adds `schema_version` + `unlocked_phrase_ids` columns | Yes (if DB existed before v2) |
| `005_account_deletion.sql` | Account deletion RPC + cleanup | Yes |
| `006_schema_v3.sql` | Adds `pattern_progress` + `secret_endings_earned` columns (Sentence Builder) | Yes (if DB existed before v3) |
| `006_auth_check.sql` | Adds `whoami()` so the Clerk↔Supabase bridge can actually be verified | Yes — before `007` |
| `007_enable_rls.sql` | Enables RLS properly (the "Option B" posture) | Yes, once its check passes |
| `008_rollback_rls.sql` | Emergency undo for `007` | Only if `007` breaks syncing |
| `009_onboarding_selections.sql` | Anonymous onboarding aggregate — insert-only table | Yes, for onboarding analytics |

## Two files are numbered 006

`006_schema_v3.sql` and `006_auth_check.sql` are unrelated and were added
independently. They do not conflict — one adds columns, the other adds a
function — and either order works. The collision is recorded here rather than
renumbered, because renaming a file that has already been applied to production
makes the history harder to reconcile, not easier. **The next migration is
`010`.**

## The file headers are misnumbered — trust this table, not them

Two comment headers disagree with their own filenames, and both cross-reference
files that do not exist under those names. The SQL in each file is correct; only
the prose is wrong.

| File | Its header says | Its cross-references say |
|------|-----------------|--------------------------|
| `007_enable_rls.sql` | "Migration 006" | "TO UNDO, see `007_rollback_rls.sql`" — it means `008` |
| `008_rollback_rls.sql` | "Migration 007" | "ROLLBACK of `006_enable_rls.sql`" — it means `007` |

This matters most in the case you would hit it: reaching for the rollback
during a live sync outage and opening the wrong file.

## First-time setup

Run `001` → `002` in order, then `006_auth_check` → `007_enable_rls`
(see "RLS posture"), then `009` if you want onboarding analytics.

**Do not run `003_rls.sql`.** See the warning below — it is not merely
redundant, it is actively harmful now.

## Existing database (upgrading)

Run whichever of `004_schema_v2.sql`, `005_account_deletion.sql` and
`006_schema_v3.sql` you have not already applied — each adds columns or
functions and takes defaults for existing rows. Then `006_auth_check.sql`,
then `007_enable_rls.sql`, then `009_onboarding_selections.sql`.

## RLS posture

`003_rls.sql` describes two options. **Option B is the one in force.**

- **Option A:** RLS disabled. Anyone with the app's public anon key can read or
  write any user's row. It was the starting posture and is not shippable.
- **Option B:** Clerk JWT → Supabase RLS. `007_enable_rls.sql` is the
  ready-to-run form; nothing in it needs editing.

### ⚠ Running `003_rls.sql` today would turn RLS back off

This is the trap in following "run these in order" literally. `003` presents
two options and says to choose one — but **Option A's SQL is uncommented and
live at the top of the file**, while Option B's is commented out. So running
`003` does not offer a choice; it executes Option A:

```sql
ALTER TABLE user_data             DISABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_choice_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_ending_stats DISABLE ROW LEVEL SECURITY;
```

That silently reverses `007` and reopens the hole, with no error and no visible
change in the app. Treat `003` as the document that explains the decision.
`007_enable_rls.sql` is the executable form of the option that was chosen.

### Verify the bridge before running `007`

`007` requires two one-time dashboard steps (Clerk → "Connect with Supabase",
and Supabase → Authentication → Third-Party Auth → add Clerk). Enabling RLS
before both are done silently breaks every sync write — the app keeps working
and saves nothing.

The obvious check does not work from the SQL editor:

```sql
select auth.jwt()->>'sub';   -- always NULL here, whatever the truth is
```

The SQL editor connects as a privileged database user carrying no Clerk token,
so it returns NULL whether or not the bridge is up. **The check is only
meaningful made from the app while signed in**, which is what
`006_auth_check.sql` exists for: it adds `whoami()`, and the app surfaces it at
Profile → "Check database connection" (a dev-only row). That must return your
Clerk user id and `role: authenticated` before you run `007`.

If `007` does break syncing — the in-app sync banner errors, or Supabase → Logs
shows "new row violates row-level security policy" — run
`008_rollback_rls.sql`. It restores the pre-`007` state and deletes no data,
but it reopens the security hole, so treat it as stopping the bleeding rather
than a resting state.

## `009` has its own gate

`009_onboarding_selections.sql` creates an **insert-only** table: the client can
write to it but must never read it. After running it, verify both of these from
the app while signed in:

1. an insert succeeds;
2. `supabase.from('onboarding_selections').select('*')` returns an RLS error or
   an empty set — **never data**.

The second is the one that matters, and an empty result with no error is the
failure mode to watch for, because it looks like success.

The table is anonymous at rest and carries no user identifier, which is why
`005_account_deletion.sql` deliberately does not touch it — there is nothing to
delete. See
[`docs/superpowers/specs/2026-09-03-onboarding-analytics-design.md`](../../docs/superpowers/specs/2026-09-03-onboarding-analytics-design.md).

## Schema version history

`CURRENT_SCHEMA_VERSION` in `src/lib/syncService.ts` must match the highest
version listed here. This tracks the shape of the synced `user_data` row only —
`onboarding_selections` is not part of it and does not bump the version.

| Version | Changes |
|---------|---------|
| 1 | Initial schema (all JSONB blobs, no versioning) |
| 2 | Added `schema_version` + `unlocked_phrase_ids` columns |
| 3 | Added `pattern_progress` + `secret_endings_earned` columns |
