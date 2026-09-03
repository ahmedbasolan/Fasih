# Onboarding analytics — design

**Date:** 2026-09-03
**Branch:** `feat/sadaf-art-direction` (spec only — implementation is its own branch)
**Status:** awaiting review
**Related:** [`2026-09-03-sadaf-art-direction-design.md`](./2026-09-03-sadaf-art-direction-design.md) §9 step 5

---

## 1. What this is for

Fasih needs to know which kinds of learner are actually signing up, so scenarios and phrases
can be written for them rather than guessed at. Today that information is collected during
onboarding, written to the local store, and never aggregated.

The requirement as stated: **counts only, no names, no emails.** Enough to answer "how many
people picked Hospitality and Social mode" so the next scenario is written for a real
audience.

### What it must answer

The useful question is not "how many picked Hospitality" — it is **"how many Hospitality
users picked Social"**. Scenario authoring needs the joint distribution across mode, role and
goals, because that combination is what a scenario is written for. A design that only stores
per-option totals cannot answer it, so this design stores one row per completed onboarding
with all three fields on it.

---

## 2. Scope boundary

This is a separate spec from the Sadaf art direction on purpose — different concern, different
risk, different review. Per `CLAUDE.md`, one feature is one branch and one PR.

They share exactly one thing: `OnboardingFlow.tsx` is rebuilt in step 5 of the Sadaf plan, and
that is the cheapest moment to add the instrumentation hook. **Sequence them together, ship
them separately.**

---

## 3. The privacy decision, stated precisely

"Anonymous" and "no names or emails" are not the same claim, and the difference matters here
because of how the Supabase client is wired.

`src/lib/supabase.ts` forwards the **Clerk session token on every request**, and RLS policies
read `auth.jwt()->>'sub'` to identify the user. So a write from a signed-in user is an
authenticated request whether or not the row carries an identifier.

The guarantee this design makes is therefore precise:

> **Anonymous at rest.** The stored row contains no user identifier and no value that can be
> joined back to one. The request that created it is authenticated, and Postgres does not
> persist that identity anywhere on the row.

That is a real and defensible guarantee. It is not the same as "the server never sees who you
are", and the privacy policy should not claim that it is.

### The date field is the subtle one

A full `timestamptz` would be a re-identification vector: role + goals + exact second, joined
against `user_data.created_at`, would often identify a single person. The column is therefore
**`date`, not `timestamptz`** — `current_date`, no time component. This is the single most
important line in the schema and it should not be "improved" later by someone adding
precision back.

### What this design deliberately cannot do

Stating these now so they are not discovered as bugs:

- **No per-user deletion.** There is nothing to delete — that is the point of anonymisation,
  and it is the standard basis for not honouring erasure requests against this table.
  `005_account_deletion.sql` will not touch it, by design.
- **No deduplication.** See §6.
- **No funnel or drop-off analysis.** You cannot tell whether the same person abandoned.
- **No cohort retention.** You cannot follow a group over time.

If any of those become requirements later, that is a *pseudonymous* design with materially
different obligations, and it needs its own spec rather than a column added to this table.

---

## 4. Consent

Decided in conversation: **no prompt, opt-out toggle in Profile.**

- Collection is on by default. Onboarding is not interrupted.
- Profile settings gains a toggle that stops collection.
- The privacy policy gets a plain-language line describing what is collected and that it
  carries no identifier.
- **Both app stores still require a data-collection declaration** even for anonymous data —
  Apple's App Privacy questionnaire (Product Interaction / Usage Data, *not* linked to
  identity) and Google Play's Data Safety form. This is a release checklist item, not an
  implementation one, and it is easy to miss because nothing in the code prompts for it.

---

## 5. Schema

One table. No foreign keys, because there is deliberately nothing to reference.

```sql
create table public.onboarding_selections (
  id           bigint generated always as identity primary key,

  mode         text not null
                 check (mode in ('career', 'social')),

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

  -- DATE, never timestamptz. See §3. Adding time precision here would make the
  -- row re-identifiable by joining against user_data.created_at.
  completed_on date not null default current_date
);
```

Values are taken verbatim from `STRINGS.onboarding.roles` (8) and `STRINGS.onboarding.goals`
(5) in `src/constants/strings.ts`. A ninth role added to the app without adding it here will
fail the check constraint and — per §7 — be silently dropped rather than break onboarding, so
**the constraint and the strings file must be changed together.**

### Why `text` + `check` rather than an enum

Enums cannot have values removed and are awkward to reorder; the role list is product
content and will change. A check constraint is a one-line `alter table` either way.

### Why there are no indexes

The only query pattern is an aggregate over substantially the whole table
(`group by role, mode`). Postgres will sequential-scan for that regardless, and indexes on
2-value and 8-value columns would never be chosen by the planner. Adding them would cost
write throughput and buy nothing. Revisit only if this table reaches a scale where a
`where completed_on > …` filter becomes selective enough to matter — which is a good problem
and a long way off.

### RLS — insert-only

The critical property: **the client can write but never read.** Without this, any signed-in
user could select the whole table and read every learner's onboarding choices.

```sql
alter table public.onboarding_selections enable row level security;

-- Table-level grants first. Following 007_enable_rls.sql: a request carrying a
-- Clerk token runs as `authenticated`, so revoking only from `anon` leaves the
-- table wide open to exactly the traffic this app produces.
revoke all on public.onboarding_selections from anon, authenticated;
grant insert on public.onboarding_selections to authenticated;

create policy "insert only, no read"
  on public.onboarding_selections
  for insert
  to authenticated
  with check (true);
```

No `select`, `update` or `delete` policy exists, so those are denied to both roles. Reading
is done from the Supabase dashboard or SQL editor under the service role, never from the app.
The service role key stays server-side per `CLAUDE.md`.

**`with check (true)` is correct here, not lax.** There is no user column to constrain the row
against — the row is anonymous by construction. The check constraints in the table definition
do the validation that matters.

---

## 6. Accuracy, honestly

Because rows carry no identifier, uniqueness cannot be enforced in the database. A user who
reinstalls and completes onboarding again produces a second row.

Mitigation is client-side and deliberately modest: a persisted `analyticsOnboardingSent` flag
means the write fires at most once per install. That is not tamper-proof and is not meant to
be — this is product analytics for authoring decisions, not billing.

**Treat the counts as approximate.** They are more than good enough to answer "should the next
scenario be written for hospitality or for drivers", which is the entire purpose. They are not
good enough to report as user numbers to anyone external.

---

## 7. Client implementation

### Store

Three additions to `useAppStore`, all persisted:

| Field | Default | Purpose |
|---|---|---|
| `analyticsEnabled` | `true` | Opt-out state, driven by the Profile toggle |
| `analyticsOnboardingSent` | `false` | Fire-once guard, §6 |
| `setAnalyticsEnabled(v)` | — | Action for the toggle |

### When it fires

**On onboarding completion only** — not per step. A partially completed onboarding produces
no row; otherwise abandoned runs skew the distribution with incomplete or default selections,
which is worse than having no data.

### Failure is silent, always

The write is fire-and-forget:

- It never blocks or delays the transition out of onboarding.
- A network failure, an RLS rejection or a check-constraint violation is caught and dropped.
- Nothing is queued or retried. A lost row is acceptable; a user stuck on a spinner because
  an analytics insert timed out is not.

Guard order: `analyticsEnabled === true` **and** `analyticsOnboardingSent === false`.

### Profile toggle

Lives in the existing settings section of `ProfileScreen.tsx`, alongside the theme control.
Copy goes in `STRINGS` per `CLAUDE.md` — no hardcoded display text. The label should say what
is actually collected in plain language, not "improve your experience".

**Sequencing note:** the settings rows currently use `C.CATEGORY_LAVENDER`, which the Sadaf
spec deletes. If Sadaf step 3 has landed, build the toggle on the `Rule` primitive. If not,
build it plainly and let the Sadaf pass restyle it — do not introduce a new use of a token
that is scheduled for deletion.

---

## 8. Build order

1. **Migration** `009_onboarding_selections.sql` — table, check constraints, RLS, grants.
   Follows the conventions in `007_enable_rls.sql` including its prerequisite check.
2. **Verify insert-only from the app while signed in.** An insert must succeed and a select
   must return zero rows *and* no error-free leak. This is the security gate; do not proceed
   past it.
3. **Store fields and the fire-once write.**
4. **Profile toggle** + `STRINGS` copy.
5. **Privacy policy line**, and the two store declarations (§4).

---

## 9. Open questions

- **`app_version` — keep or drop?** It is useful for spotting when a change to onboarding
  shifted the distribution, and it is coarse enough not to identify anyone. It is also the
  only field here with no direct authoring value. My recommendation is keep; it costs nothing
  and answering "did the new mode screen change what people pick" later without it is
  impossible.
- **Does the toggle stop future writes only, or is it retroactive?** It can only be the
  former — there is no way to find and delete an anonymous row. The toggle copy must not
  imply otherwise.
