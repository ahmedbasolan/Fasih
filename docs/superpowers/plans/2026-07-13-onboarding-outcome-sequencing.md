# Onboarding Outcome-Sequencing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorder 4 of the 12 onboarding steps in `OnboardingFlow.tsx` so both value-demonstrating moments (quick-win phrase, interactive scenario) land before either paywall touch, instead of the first paywall touch interrupting before any value has been shown.

**Architecture:** A same-file reorder of four `switch (step)` case blocks (currently at indices 7, 8, 9, 10) into a new order, with each block's `// Step N:` comment updated to its new index. No new files, no new components, no logic changes — the JSX bodies themselves are moved verbatim.

**Tech Stack:** React Native, Expo Router, Moti (animations) — no new dependencies.

**Spec:** `docs/superpowers/specs/2026-07-13-onboarding-outcome-sequencing-design.md`

---

## Task 1: Reorder the four case blocks

**Files:**
- Modify: `fasih-mobile/src/screens/OnboardingFlow.tsx`

Current order (verified against the file as of this plan, branch `dev`):

| Old index | Content | Line range (comment → closing `);`) |
|---|---|---|
| 7 | Paywall #1 — trial timeline pitch | 993–1047 |
| 8 | First Arabic phrase "quick win" | 1049–1134 |
| 9 | Feature list + "See Plans" CTA | 1136–1202 |
| 10 | Interactive café scenario (uses a `case 10: { ... }` block form with local `const`s, not a plain `return`) | 1204–1226 |
| 11 | Paywall #2 — plan selection | 1228–1342 (unchanged, does not move) |

New order:

| New index | Content | Was old index |
|---|---|---|
| 7 | First Arabic phrase "quick win" | 8 |
| 8 | Interactive café scenario | 10 |
| 9 | Paywall #1 — trial timeline pitch | 7 |
| 10 | Feature list + "See Plans" CTA | 9 |
| 11 | Paywall #2 — plan selection | 11 (unchanged) |

- [ ] **Step 1: Read the full file to reconfirm line numbers haven't shifted**

Run: read `fasih-mobile/src/screens/OnboardingFlow.tsx` in full (it's ~1382 lines) immediately before editing. The line ranges in the table above were correct at plan-writing time, but re-verify the four `// Step N:` comments (`// Step 7: Paywall`, `// Step 8: Your first Arabic phrase`, `// Step 9: Everything included`, `// Step 10: Onboarding Scenario`) still mark the same content before cutting anything — if a prior change shifted lines, locate the blocks by their comment text and `case N:` label instead of trusting the line numbers literally.

- [ ] **Step 2: Cut and reassemble the four blocks in the new order**

Using the Edit tool, restructure the `switch (step)` block (currently `case 7` through `case 10`, immediately followed by unchanged `case 11`) so the bodies appear in this sequence, each with **only its comment and `case N:` label changed** — the JSX body of each block is moved verbatim, no other content changes:

1. `// Step 7: Your first Arabic phrase quick win` / `case 7:` — body is the *old* `case 8` content (old lines 1050–1134, everything from `return (` through the final `);` of that block).
2. `// Step 8: Onboarding Scenario — Café` / `case 8: {` — body is the *old* `case 10` content (old lines 1205–1226; keep the block-brace form `case 8: { ... }` since it declares local `const onboardingScenario`/`const script` before its `return`).
3. `// Step 9: Paywall — Unlock full potential` / `case 9:` — body is the *old* `case 7` content (old lines 994–1047).
4. `// Step 10: Everything included — features` / `case 10:` — body is the *old* `case 9` content (old lines 1137–1202).
5. `// Step 11: Paywall — plans` / `case 11:` — **unchanged**, stays exactly as-is (old lines 1228–1342), immediately after the block above.

Do not alter anything inside the JSX bodies themselves (colors, strings, animation delays, etc.) — this is a pure structural move, not a content edit. If anything inside a block references `step` directly (e.g., a `key` prop using the literal number), check for it and leave it as-is unless it would break — none were found during design (`phraseRevealed`'s reset effect keys off the `step` state generically via `useEffect(() => setPhraseRevealed(false), [step])`, not a literal step number, so it's unaffected by the move).

- [ ] **Step 3: Update the stale `TOTAL` comment**

The current line is:
```ts
const TOTAL = 12; // 0-9 onboarding steps + 10 scenario step + 11 paywall step
```
Replace with:
```ts
const TOTAL = 12; // 0-6 setup, 7 quick win, 8 scenario, 9 paywall (timeline), 10 features, 11 paywall (plans)
```

- [ ] **Step 4: Run the TypeScript check**

Run: `cd fasih-mobile && npx tsc --noEmit`
Expected: no new errors introduced by this change. This worktree/branch is based on `dev`, which has a known, pre-existing, unrelated baseline of compile errors (a missing `global.css` type declaration in `app/_layout.tsx`, a stale `StyleSheet.absoluteFillObject` API reference in `src/components/ui/GhostLetters.tsx`/`ShimmerButton.tsx`, and `@types/jest`-related errors in `src/engine/__tests__/*.test.ts`) — confirm the error list is identical to that known set (same files, same error codes), not that there are zero errors.

- [ ] **Step 5: Commit**

```bash
git add fasih-mobile/src/screens/OnboardingFlow.tsx
git commit -m "refactor(onboarding): move quick-win + scenario before both paywall touches"
```

---

## Task 2: Manual verification walkthrough

This flow is gesture-driven and heavily animated — there is no automated test that meaningfully covers step-to-step navigation, so this task is a documented manual walkthrough, not a script.

**Files:** none (verification only)

- [ ] **Step 1: Launch the app on a simulator/device or dev client build** (plain Expo Go will not work — this project uses native modules requiring an EAS development-client build; use whatever build the team already has configured, per `eas.json`'s `development` profile)

- [ ] **Step 2: Walk the full 12-step flow in `career` mode**

Starting from a fresh onboarding entry (new user, or force-reset local state per however the team already does this for testing), tap/swipe through all 12 steps in order, confirming:
- Step 0 (welcome) → 1 (mode: select "career") → 2 (name) → 3 (role) → 4 (goals) → 5 (commitment hold-gesture) → 6 (notifications) all render and transition exactly as before this change (none of these moved).
- Step 7 now shows the **quick-win Arabic phrase** screen (previously step 8's content) — confirm the phrase reveals on tap and "Continue" advances.
- Step 8 now shows the **interactive café scenario** (previously step 10's content) — confirm it loads (not stuck on "Loading..."), plays through, and calls through to the next step on completion.
- Step 9 now shows the **paywall timeline pitch** (previously step 7's content) — confirm "Start Free Trial" advances and "Skip for now" triggers the skip-confirmation alert correctly.
- Step 10 now shows the **feature list + "See Plans"** (previously step 9's content) — confirm it renders and "See Plans" advances.
- Step 11 (plan selection) is unchanged — confirm plan selection and "Start Free Trial" still call `finishWithTrial()` correctly.

- [ ] **Step 2: Repeat the full walkthrough in `social` mode** (role/goal content differs by mode — confirm the reordered steps still render correctly with the social-mode data path)

- [ ] **Step 3: Confirm swipe gestures still work at every step**, including the two gated steps that block forward-swipe (step 2 without a name entered, step 5 without completing the hold gesture) — these are unaffected by the reorder since they're keyed to steps 2 and 5, which didn't move, but verify anyway since they're the only gesture special-cases in the file.

- [ ] **Step 4: Confirm the progress bar and back button** behave correctly across all 12 steps (both are keyed to the numeric range 0–11 generically, not to specific step content, so they should be unaffected — but this is a visual detail worth eyeballing during the walkthrough rather than assuming).

- [ ] **Step 5: Report results.** If anything breaks, do not "fix forward" silently — stop and describe exactly what step and what broke, since this plan's Task 1 diff should be the only cause if something regresses (nothing else changed).

---

## Self-review notes (from writing this plan)

- **Spec coverage:** The design doc's "Proposed order" table is fully covered by Task 1; the design doc's "Testing / verification" section is fully covered by Task 2. The design doc's "Implementation notes" callout about auditing for stray numeric step comparisons was done during plan-writing (re-read the whole file) — found only the two gesture-gating checks (`step === 2`, `step === 5`) and the two boundary checks (`step > 0`, `step < 11`), none of which reference the moved indices 7/8/9/10 by content-specific meaning, so no additional updates are needed beyond Task 1's block move.
- **Out of scope**, per the design doc, and not touched by this plan: social proof, experimentation infrastructure, analytics events, paywall copy changes.
- **Known pre-existing issue, not fixed here (out of scope):** `ProgressBar` is called with a hardcoded `total={11}` rather than `total={TOTAL}` (`TOTAL - 1`, which would be 11 anyway since `TOTAL` is 12 — so this happens to be numerically correct today, but it's a magic-number duplication of `TOTAL`'s value rather than a derived reference). Not touched here since it's unrelated to step ordering and pre-dates this change.
