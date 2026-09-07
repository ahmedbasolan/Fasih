# Synced Progress Module — Collapsing the Cloud-Sync Seam

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Ships as **three** PRs off `dev` — do not collapse them.

**Goal:** Give the learner's synced progress a single owner. Today the set of synced fields is hand-declared in six places and the "push after this mutation" rule is copy-pasted at 19 call sites; nothing fails when they drift, and two bugs are already sitting in the gaps. After this, one policy table is the only place any of it is stated, and omitting a field is a compile error.

**Architecture:** A new pure engine module `src/engine/syncedProgress.ts` (no React, no store, no network) owns a `FIELD_POLICY` table keyed by a new `PersistableState` interface. The table drives cloud codecs, the merge, `partialize`, and the sign-out reset. `src/engine/syncMerge.ts` survives as an internal seam — its seven atoms and their tests are untouched, imported by the table. `src/lib/syncService.ts` drops to a thin Supabase adapter: row in, row out. `useAppStore` loses `scheduleSync` entirely; one subscriber diffs the synced keys and pushes.

**Tech Stack:** TypeScript 5.x strict, Zustand 5 (`persist` + `subscribe`), Supabase JS 2.x, jest-expo for engine tests.

**Origin:** `/mattpocock-skills:improve-codebase-architecture` review, 2026-09-07 — candidate A of three, selected as top recommendation. Design settled over five grilling rounds, then revised against an engineering review that found three ship-blocking bugs in the first draft (see Phase 4).

---

## Why

The synced field set is currently declared six times, in six shapes:

| # | Location | Shape |
|---|---|---|
| 1 | `AppState` interface | TS declarations |
| 2 | `partialize()` | object literal of persisted keys |
| 3 | `syncToCloud()` payload | store → `CloudUserData` |
| 4 | `pushProgress()` | `CloudUserData` → DB columns |
| 5 | `pullProgress()` | DB → `CloudUserData`, via `asRecord`/`asArray` |
| 6 | `syncFromCloud()` merge | `CloudUserData` → state patch |
| (7) | `signOut()` reset | which keys get wiped |

Adding one synced field means editing six files. Missing one is silent: the field just never syncs, or never clears.

Separately, `scheduleSync(() => get().syncToCloud())` is hand-appended after ~19 mutations. "Which mutations push" has no locality — it is remembered, not declared.

### Two live bugs this closes

1. **Account bleed.** `signOut()` ([useAppStore.ts:600-625](../../../src/store/useAppStore.ts)) does not reset `patternProgress` or `secretEndingsEarned`. Both are persisted *and* synced. Sign out, sign into a second account on the same device, and that account inherits the first user's Sentence Builder progress and secret endings — then pushes them into the new account's cloud row.
2. **`stats` can disagree with the maps it is derived from.** `computeMastery` is called from three places (`recordPhraseReview`, `recordPhraseRating`, `syncFromCloud`) that must all agree. Nothing enforces it.

### Not bugs, but newly visible

`streakFreezes`, `favoriteScenarios`, `sceneProgress`, `dailyXP` are persisted locally but never synced — lost on reinstall or second device. **Out of scope here** (each needs its own merge rule and a schema change); file separately once the table makes the gap legible.

---

## Settled design

Decisions reached by grilling; rationale kept because the reasons are load-bearing.

| Decision | Answer | Why |
|---|---|---|
| Manifest scope | One `FIELD_POLICY` table: `{ persist, sync, clearOnSignOut, urgent, column, decode, merge }` | All three lists ask the same question ("what happens to this field?"). Anything less leaves drift somewhere to hide. |
| Fix vs preserve | Fix the sign-out bleed here; file un-synced fields separately | The bleed is a correctness/privacy bug and the table is where it becomes visible. New synced fields are a schema change. |
| Location | `src/engine/syncedProgress.ts`, pure | Respects the engine-purity rule in `CLAUDE.md`; sits beside the `syncMerge.ts` atoms it uses. |
| Decoders | Move into the table (`decode` per field) | Leaving them in `syncService` keeps a fifth copy of the field set. |
| Push trigger | One Zustand subscriber diffing synced keys | Makes "which mutations sync" structurally true instead of remembered. |
| Pull → push | Let it fire; guard with a payload comparison | The merge is a *union*, so post-pull local holds records the cloud lacks. Suppressing that push strands offline work. |
| Exhaustiveness | Mapped type over `PersistableState` + a coverage test | Omission becomes a compile error; the test covers what types can't (`sync: true` ⇒ has `merge` + `column`). |
| `stats` | Derived, not stored | Removes the three-way agreement problem outright. |
| Sign-out vs delete | One `clearOnSignOut` flag; `deleteAccount` keeps its explicit `hasOnboarded` line | Two flags across ~26 fields to express one exception makes every other row carry a dead column. |
| Tests | Keep atom tests; add composition, coverage, round-trip, key-snapshot | The atoms have real invariants worth pinning directly. The gap is composition — `mergeCloudState` has never had a test. |
| Wire format | Unchanged. Full `stats` blob still written, derived on read | Zero schema cost, no version bump, no SQL migration. Older clients still read a complete object. |
| Urgent pushes | `urgent: true` on `subscriptionStatus` / `trialStartedAt` / `trialPlan` | Seven sites currently bypass the debounce by hand because subscription state is money. Declare it once. |
| Public interface | `syncFromCloud`, `retryPush`, `retryPull`, `isSyncing`, `lastSyncedAt`, `lastSyncError`, `dismissSyncError` | `syncToCloud` as a public action is what let 19 sites reach for it. |

### Dropped from the first draft

The original sketch had a `syncedSet(patch)` store helper. The subscriber makes it unnecessary — mutations keep using plain `set()`.

---

## Phase 1 (PR1): The pure module — DONE (PR #50)

Branch: `feat/synced-progress-module`. **No runtime behaviour change.** Nothing is wired; the store still works exactly as it does today.

- [x] Split `AppState` into `PersistableState` (data) + action interfaces. `activeScenarioState` and `communityStatsCache` stay in the ephemeral half.
      *This is load-bearing: without the split, `DataKey` needs a hand-maintained `Omit` of ephemeral keys — a second list, reintroducing the exact drift this plan removes.*
- [x] Create `src/engine/syncedProgress.ts`.
- [x] Define `FieldPolicy`: `{ persist, sync, clearOnSignOut, urgent?, column?, decode?, merge? }`.
- [x] Define `FIELD_POLICY: { [K in keyof PersistableState]: FieldPolicy }` — the mapped type makes a missing key a compile error.
- [x] Port every field's current behaviour into the table verbatim, **including today's bugs** (the sign-out gaps stay wrong until PR2). Reference: the six lists in `useAppStore.ts` and `syncService.ts`.
- [x] `toCloud(state) → CloudUserData` — table-driven. Runs `derive()` first so `stats` still ships as a full blob.
- [x] `fromCloud(row) → Partial<PersistableState>` — table-driven, per-field `decode`. Absorbs `asRecord`, `asArray`, `normalizeStats`.
- [x] `mergeCloudState(local, row) → Partial<PersistableState>` — per-field merges, then a derive pass. This is the composition that has never been tested.
- [x] `persistedKeys()` and `clearedOnSignOut()` helpers.
- [x] Keep `syncMerge.ts` where it is. The table references its seven atoms. Nothing outside `src/engine/` imports it after PR2.
- [x] Tests: `mergeCloudState` composition; policy coverage (`sync: true` ⇒ has `merge` and `column`); `toCloud → fromCloud` round-trip.
- [x] `syncMerge.test.ts` unchanged — verify it still passes untouched.
- [x] `npx tsc --noEmit` clean; `npx jest` green.

---

## Phase 2 (PR2): Wire it — DONE

Branch: `feat/synced-progress-wiring`. Changes **when pushes fire** and **what the interface is**.

Two things came up during implementation that the plan had not anticipated:

1. **The arming gate stranded onboarding.** `app/index.tsx` only called `syncFromCloud` on the `hasOnboarded` path, so a user still in onboarding never armed the scheduler and *nothing they did during onboarding reached the cloud*. Before this branch, `scheduleSync` fired regardless of arming, so it worked by accident. Fixed by running the pull on both paths — a brand-new user's pull returns no row, which arms and flushes to create one. `recordDailyActivity`/`checkMilestones` stay onboarded-only, unchanged.
2. **The simulated-purchase guard was already leaky.** `if (!result.simulated) syncToCloud()` only skipped the push on that tick; any later mutation, and every relaunch, pushed the persisted simulated `subscribed` anyway. A subscriber makes that worse, not better. Replaced with a persisted `simulatedEntitlement` field that `_pushToCloud` checks — a genuine RevenueCat entitlement change clears it, and so does sign-out.

- [x] `partialize` derives from `persistedKeys()`.
- [x] Add a Jest test asserting the persisted key set equals a hard-coded list — the permanent guard against silent data loss on upgrade. Updated only deliberately.
- [x] `signOut()` resets from `clearedOnSignOut()`. **Mark `patternProgress` and `secretEndingsEarned` `clearOnSignOut: true` — this is the account-bleed fix.**
- [x] `deleteAccount()` keeps its explicit `hasOnboarded: false` line.
- [x] Add the push subscriber: diff synced keys → 1500ms debounce; `urgent` fields flush immediately.
- [x] **Arm the subscriber only after `_hydrated === true` AND the first `syncFromCloud` settles.**
      *Blocker if missed: `persist` rehydrates async and calls `set()`, which mutates synced keys and fires the subscriber. On a second device with less local data that pushes a thin row over good cloud data, and the subsequent pull then merges against the row it just clobbered. The payload guard below is empty on cold start, so it does not catch this.*
- [x] **Preserve the simulated-purchase guard.** Today `purchaseSubscription` does `if (!result.simulated) get().syncToCloud()` ([useAppStore.ts:691](../../../src/store/useAppStore.ts)). A policy-driven subscriber pushes on any `subscriptionStatus` change, which would send dev purchases to the cloud and grant permanent free Pro on a real account. Either add a suppress-next-push hatch, or keep simulated purchases out of `subscriptionStatus` entirely. The existing comment at that line is the spec.
- [x] Idempotence: skip the push when the serialised synced slice equals the last successfully-pushed payload. **Compare at push time only, post-debounce** — a per-mutation comparison would serialise all of `phraseReviews` on every card rated.
- [x] Retry falls out of the above for free (a failed push leaves the payload un-advanced, so the next mutation retries). Add a flush on app foreground.
- [x] Delete `scheduleSync` and all 19 call sites.
- [x] Remove `syncToCloud` from the public interface. Add `retryPush()` and `retryPull()` — `lastSyncError` is set by both paths, so a single `retrySync` cannot know what to redo.
- [x] Update `SyncStatusBanner.tsx` to call the right retry.
- [x] Reduce `syncService.ts` to an adapter: `pullProgress` generic over the table, coercion gone.
- [x] `npx tsc --noEmit` clean; `npx jest` green.

---

## Phase 3 (PR3): Derive `stats` — DONE

One correction to the plan, found on contact: it called for `daysActive` and `currentStreak` to become **two top-level scalars**. They can't — the database has a single `stats` JSONB column, and two state fields cannot each own one column (the policy table's own uniqueness test catches this). Instead one field, `counters: ActivityCounters`, holds exactly the two non-derivable values and owns the `stats` column.

That made the column's write shape and read shape genuinely differ, so the binding gained an `encode` (write the full blob for older clients) alongside `decode` (read back only the counters), and `fromCloud` returns a `DecodedCloudRow` where `stats` is narrowed. `toCloud`'s hard-coded `row.stats = …` special case is gone — the table drives every column now.

Branch: `feat/derived-stats`. Changes **persisted shape**. Separate because it is its own refactor, not part of the sync seam.

Only four files read `stats` outside the store: `SituationalConfidence.tsx`, `HomeScreenNew.tsx`, `app/(tabs)/profile.tsx`, `syncService.ts`.

- [x] `daysActive` and `currentStreak` become top-level scalars in `PersistableState` (merge rule: `Math.max`).
- [x] `phrasesStudied`, `phrasesMastered`, `categoryMastery`, `scenariosCompleted` become a memoised `useStats()` selector over `phraseReviews` + `completedScenarios`. `scenariosCompleted` is just `Object.keys(completedScenarios)`.
- [x] Memoisation is required, not optional — `categoryMastery` is O(reviews) and would otherwise recompute every render.
- [x] Delete all three `computeMastery` call sites.
- [x] `toCloud` still writes the full `stats` blob (computed at push time) so the wire and older clients are unaffected.
- [x] Add `version` + `migrate` to the `persist` config: read `daysActive`/`currentStreak` out of the legacy `stats` blob for existing installs.
- [x] Update the persisted-key-set snapshot test from PR2 — deliberately.
- [x] Update the four reader files.
- [x] `npx tsc --noEmit` clean; `npx jest` green.

---

## Phase 4: Review findings folded in

Recorded so they are not re-litigated. The first draft of this plan had three ship-blocking defects:

1. **Rehydrate race → data loss.** Fixed by the arming gate in Phase 2.
2. **Simulated-purchase guard silently broken.** Fixed by the escape hatch in Phase 2.
3. **`DataKey` needed a second hand-kept list**, which falsified the "drift becomes impossible" claim. Fixed by the `PersistableState` split in Phase 1.

Plus two smaller corrections:

4. **PR slicing.** The original two-PR split claimed PR1 was behaviour-identical while putting `partialize` in it — `partialize` is a persistence surface. Re-sliced to three.
5. **Idempotence comparison timing** (push-time, not per-mutation) and **`retrySync` ambiguity** (split into push/pull).

And one clarification: `toCloud` is not a clean per-field projection once `stats` is derived — it must run `derive()` first. Not a problem, but the table does not drive that one field alone.

---

## Out of scope

- Syncing `streakFreezes`, `favoriteScenarios`, `sceneProgress`, `dailyXP`. Each needs a merge rule and a schema change. File as separate issues once the table makes the gap legible.
- Candidates B (lift the scenario run out of `ScenarioPlayer`) and C (derive milestones) from the same architecture review.

## Also

- [ ] Create `CONTEXT.md` at the repo root, seeded with the four terms this work names: **synced progress**, **field policy**, **urgent field**, **derived stat**. `docs/agents/domain.md` already instructs agents to read a `CONTEXT.md` that does not yet exist.

## Notes

- CodeRabbit's free plan allows one review per hour **plan-wide**, so three PRs means three review windows. Sequence them; do not open all three at once.
- Wire format is unchanged throughout. `CURRENT_SCHEMA_VERSION` stays at 3. No SQL migration in any phase.
