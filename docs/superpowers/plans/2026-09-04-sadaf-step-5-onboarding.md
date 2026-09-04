# Sadaf Step 5 (Onboarding) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the 1,441-line onboarding file along its existing step boundaries, give mode selection the one full-bleed moment in the app, replace the two-fox avatar with the monogram, and drop 3.5 MB of PNG.

**Architecture:** `OnboardingFlow` is already a 12-case switch over a single `step` integer. That switch *is* the seam: each case becomes a component file taking the same props, and the parent keeps the state machine, the progress bar and the navigation. No behaviour changes in the split — it is a move, verified by the app still completing onboarding — and the Sadaf work happens afterwards, on files small enough to hold in context.

**Tech Stack:** React Native 0.8x / Expo ~56, TypeScript strict, Zustand, Moti, jest + jest-expo.

**Spec:** [`docs/superpowers/specs/2026-09-03-sadaf-art-direction-design.md`](../specs/2026-09-03-sadaf-art-direction-design.md) — §5.1 is mode as a running head, §4 the material, §2 the avatar decision.

## Global Constraints

- **Do not alter any Arabic string**, and do not add one. Content goes through `docs/language/pipeline.md`.
- No hardcoded colours (`C.TOKEN`), strings (`STRINGS`), or fonts (`FONT_*`).
- Spacing from `SPACE` / `SCREEN_MARGIN` / `RADIUS`.
- Depth budget: `SheetPanel` is the only shadow. Radius: sheet 24, pills 999, else 0.
- Icons: Lucide, 1.5 stroke.
- `StyleSheet.create` in `useMemo` with `[C]`.
- No `any`. **Never `git add -A`.**
- Branch off `feat/sadaf-step-6` (or `feat/sadaf-step-7` if 6 is not done): `git checkout -b feat/sadaf-step-5`.
- Verify `npx tsc --noEmit` **alone**, checking `echo $?`.
- **The paywall path must keep working.** Steps 9–11 are the trial and plan selection; a regression there is a revenue regression. `app/(tabs)/../onboarding.tsx` passes `onComplete`, `onStartTrial`, `onSkipTrial` — all three must still fire.

---

## The existing shape

Verified against the file. `renderStep()` at line 317 switches on `step`:

| `case` | Line | What it is | Art it holds |
|---|---|---|---|
| 0 | 319 | Welcome, gender/avatar choice, theme toggle | `IMAGES.foxyMale` / `foxyFemale` (343, 346) |
| 1 | 391 | Career vs Social | `IMAGES.careerMode` / `socialMode` (403, 404) |
| 2 | 459 | — | `KafMascot` (464) |
| 3 | 579 | Role | |
| 4 | 709 | Goals | |
| 5 | 793 | Hold-to-commit | `KafMascot` (801) |
| 6 | 884 | Inline SVG illustration | |
| 7 | 1054 | — | `IMAGES.foxyMale` (1059) |
| 8 | 1142 | short block | |
| 9 | 1167 | Paywall | |
| 10 | 1223 | Everything included | |
| 11 | 1291 | Choose plan | |

Helpers `GhostBtn` (95) and `ProgressBar` (108) stay in the parent.

---

## File Structure

**Create** — `src/screens/onboarding/`

| File | Cases | Responsibility |
|---|---|---|
| `IdentityStep.tsx` | 0 | Welcome, monogram avatar, theme. |
| `ModeStep.tsx` | 1 | The full-bleed mode plates. |
| `ProfileSteps.tsx` | 2–5 | Role, goals, commitment. |
| `QuickWinSteps.tsx` | 6–8 | The taster scenario. |
| `PaywallSteps.tsx` | 9–11 | Trial and plan selection. |
| `types.ts` | — | The shared props contract. |

**Modify:** `src/screens/OnboardingFlow.tsx` (keeps state, nav, progress), `src/constants/images.ts`.

**Delete:** `assets/images/foxy_male.png`, `foxy_girl.png`, `career_mode.png`, `social_mode.png`.

---

## Task 1: The props contract

**Files:**
- Create: `src/screens/onboarding/types.ts`

**Interfaces:**
- Produces: `OnboardingStepProps`.

- [ ] **Step 1: Read what the cases actually close over**

Run: `sed -n '132,320p' src/screens/OnboardingFlow.tsx` and list every piece of state, setter and callback the case bodies use. This is the contract; getting it wrong makes every later task fight the types.

- [ ] **Step 2: Write it**

Create `src/screens/onboarding/types.ts` declaring one interface with exactly what you found — `step`, `setStep`, the draft profile fields and their setters, and `onComplete` / `onStartTrial` / `onSkipTrial`. Give each field a real type from `src/types`, never `any`.

Group into sub-objects only where a group is genuinely cohesive (e.g. `nav: { step, next, back }`). A flat interface of 20 members is worse than three named groups, and worse still is one that lies about coupling.

- [ ] **Step 3: Typecheck and commit**

Run: `npx tsc --noEmit`, `echo $?` — 0.

```bash
git add src/screens/onboarding/types.ts
git commit -m "feat(onboarding): the step props contract

Extracted before any code moves, because the 12 case bodies close over parent
state implicitly and the split is only safe once that coupling is written down.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 2–6: Move the cases, one file per group

Repeat this shape for each of `PaywallSteps` (9–11), `QuickWinSteps` (6–8), `ProfileSteps` (2–5), `ModeStep` (1), `IdentityStep` (0) — **in that order**. Paywall first because it is the highest-risk and gets the most attention while you are freshest; identity last because it changes most in the Sadaf pass that follows.

For each group:

- [ ] **Step A: Move the case bodies verbatim**

Cut the JSX from `renderStep()` into the new file as a component taking `OnboardingStepProps`. **Change nothing but the closure** — same JSX, same styles, same strings. A move and a redesign in one commit is unreviewable.

- [ ] **Step B: Render it from the parent**

Replace the case bodies with a delegation, e.g.:

```tsx
case 9:
case 10:
case 11:
  return <PaywallSteps {...stepProps} />;
```

The group component switches internally on `step`.

- [ ] **Step C: Verify the move changed nothing**

Run: `npx tsc --noEmit`, `echo $?` — 0.
Run: `npx jest` — pass.
Run: `git diff --stat HEAD` — the line count moved out of `OnboardingFlow.tsx` should match the count moved into the new file, within the import boilerplate. A large discrepancy means something was rewritten, not moved.

- [ ] **Step D: Commit**

```bash
git add src/screens/OnboardingFlow.tsx src/screens/onboarding/<File>.tsx
git commit -m "refactor(onboarding): move cases <n>-<m> to <File>

Pure move -- same JSX, same styles, same strings. The Sadaf pass comes after,
on a file small enough to hold in context. A move and a redesign in one commit
is unreviewable.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

**After all five moves,** `OnboardingFlow.tsx` should hold the state machine, `GhostBtn`, `ProgressBar` and a 12-line switch. Run `wc -l src/screens/OnboardingFlow.tsx` — expect roughly 250–350. If it is still over 600, a group kept logic that belongs to it.

---

## Task 7: Monogram avatar

**Files:**
- Modify: `src/screens/onboarding/IdentityStep.tsx`

- [ ] **Step 1: Replace the fox pair**

The two `Image` elements at former lines 343/346 are a **gender selection**, not decoration — `setUserGender` drives `Scenario.requiresGender` filtering, so removing the choice breaks scenario gating. Keep the choice; change what it looks like.

Render two bordered options (the pattern the Profile option grids use — flat, `borderColor: active ? C.PRIMARY : C.BORDER`, label weight changes on active) labelled with `STRINGS.onboarding.genderMale` / `genderFemale` and their Arabic examples. No character art.

Show a `<Monogram name={name} />` beside them once a name exists, so the user sees the avatar they are actually getting.

- [ ] **Step 2: Verify the gating still works**

Run: `grep -rn "requiresGender" src/constants/scenarios.ts src/engine/*.ts | head`
Confirm `filterScenariosForLearner` still receives a gender. Run `npx jest` — the scenario-content suites cover this.

- [ ] **Step 3: Commit**

```bash
git add src/screens/onboarding/IdentityStep.tsx
git commit -m "feat(onboarding): monogram avatar, no character art

The two foxes were a gender SELECTION, not decoration -- setUserGender drives
requiresGender scenario filtering, so deleting the choice would silently change
which scenarios a learner is offered. The choice stays; the art goes, and the
monogram shows the avatar they actually get.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 8: The mode plates

**Files:**
- Modify: `src/screens/onboarding/ModeStep.tsx`
- Modify: `src/constants/strings.ts`

This is the one full-bleed moment in the app (spec §5.1). Everything else in Sadaf is a ruled page; this is where the rule breaks, deliberately, because choosing a mode forks the whole product.

- [ ] **Step 1: Build two plates**

Replace the two image cards with two full-width plates stacked vertically, each occupying roughly half the viewport:

- Ground: `C.BG`, separated from each other by a single hairline. No fills, no cards, no radius.
- A large `FONT_HEADING_EXTRA` title (`STRINGS.onboarding.careerMode` / `socialMode`), the existing sub and desc beneath in `TEXT2`.
- **A watermark root per plate**, using the existing `GhostLetters`-style treatment at plate scale — `ع م ل` for Career, `ص ح ب` for Social.
- Selection: the plate's title goes `C.PRIMARY` and gains weight; the unselected plate's text drops to `C.TEXT3`. No fill, no border change.

- [ ] **Step 2: The Arabic roots are BLOCKED until checked**

Spec §3 records `ع م ل` and `ص ح ب` as **proposed, not verified**. Do not ship them on Ahmed's say-so — he does not speak Gulf Arabic and the spec says his approval is a product decision, never a linguistic one.

Implement the plates with an `eyebrow` label in English (`STRINGS.onboarding.careerSub` / `socialSub`) and leave the watermark behind a constant:

```ts
// Proposed, unverified. See spec §3 — isolated consonantal roots plausibly do
// not engage the MSA rule, but "plausibly" is not this project's standard.
// Set to true only after a check against docs/language/authority.md.
const MODE_ROOTS_APPROVED = false;
```

Render the watermark only when that is true. Shipping the English-only plates is the correct default, not a fallback.

- [ ] **Step 3: Delete the mode images**

Remove `careerMode` and `socialMode` from `src/constants/images.ts` and delete `assets/images/career_mode.png`, `social_mode.png`.

- [ ] **Step 4: Verify and commit**

Run: `npx tsc --noEmit`, `echo $?` — 0. `npx jest` — pass.
Run: `grep -rn "careerMode\|socialMode" src app --include=*.tsx --include=*.ts | grep -v STRINGS` — expected no `IMAGES` hits.

```bash
git rm assets/images/career_mode.png assets/images/social_mode.png
git add src/screens/onboarding/ModeStep.tsx src/constants/images.ts src/constants/strings.ts
git commit -m "feat(onboarding): mode plates, the one full-bleed moment

Career vs Social forks the whole product and was two PNGs in a row. It is now
the single place Sadaf's ruled-page logic breaks, deliberately.

The per-mode Arabic watermark roots stay behind a flag set to false: the spec
records them as proposed and unverified, and no native speaker has reviewed
this content. English-only plates are the correct default, not a fallback.

Drops 1.2 MB of PNG.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 9: Last mascot and the fox PNGs

**Files:**
- Modify: `src/screens/onboarding/ProfileSteps.tsx`, `QuickWinSteps.tsx`, `src/constants/images.ts`

- [ ] **Step 1: Swap both `KafMascot` sites**

Former lines 464 and 801 → `<Companion size={72} />`, imports dropped.

- [ ] **Step 2: Swap the remaining `IMAGES.foxyMale`**

Former line 1059 → `<Companion size={96} />`.

- [ ] **Step 3: Delete the assets**

```bash
git rm assets/images/foxy_male.png assets/images/foxy_girl.png
```

Remove `foxyMale` and `foxyFemale` from `src/constants/images.ts`.

- [ ] **Step 4: Prove nothing else uses them**

Run: `grep -rn "IMAGES.foxy" src app` — expected none.
Run: `grep -rn "KafMascot" src app --include=*.tsx | grep -v "ui/Companion.tsx"` — expected none if step 6 has landed; if step 6 has not, the three scenario phases will still appear and `KafMascot.tsx` stays on disk for now.

- [ ] **Step 5: Verify and commit**

Run: `npx tsc --noEmit`, `echo $?` — 0. `npx jest` — pass.

```bash
git add src/screens/onboarding/ProfileSteps.tsx src/screens/onboarding/QuickWinSteps.tsx src/constants/images.ts
git commit -m "feat(onboarding): retire the fennec PNGs

2.3 MB for three renders. Every site now goes through Companion, so bringing a
character back stays a one-file change.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 10: Sadaf pass over the split files

**Files:** all five files in `src/screens/onboarding/`

- [ ] **Step 1: One file at a time**

For each: remove `Platform.select` shadows, remove `backgroundColor: C.CARD_BG`, set `borderRadius` to `RADIUS.flat` except pills, move spacing onto `SPACE` / `SCREEN_MARGIN`, put option grids on the bordered-button pattern with a weight change on the active label, and add `strokeWidth={1.5}` to every Lucide icon.

Commit per file, so a reviewer can reject one screen without rejecting five.

- [ ] **Step 2: Verify the budget holds**

Run: `grep -c 'shadowColor\|elevation:' src/screens/onboarding/*.tsx` — expected 0 for each.
Run: `grep -rnoE "#[0-9A-Fa-f]{6}\b" src/screens/onboarding/ | wc -l` — expected 0.

---

## Task 11: PR

- [ ] **Step 1: Walk the flow end to end before opening it**

This is the only task in the branch that cannot be checked by `tsc`. Complete onboarding on a device or simulator: every step advances, the gender choice still filters scenarios, and **all three of `onComplete`, `onStartTrial` and `onSkipTrial` fire**. A split that typechecks and strands the paywall is the failure mode here.

- [ ] **Step 2: Clean-tree verification, then open**

```bash
git stash push -u -m "pre-verify"
npx tsc --noEmit; echo "TSC: $?"
npx jest
npx eslint src app --ext .ts,.tsx
git stash pop
```

State in the PR: the new line count of `OnboardingFlow.tsx`, the MB dropped, that the mode watermark roots are flagged off pending a language check, and that the flow was walked manually because nothing automated covers it.

---

## Self-Review

**Spec coverage.** §2 avatar decision → Task 7. §5.1 mode as the full-bleed moment → Task 8. §6 character art retired via the `Companion` seam → Task 9. §4 material → Task 10. §3's unverified roots → Task 8 Step 2, shipped disabled.

**Placeholder scan.** Tasks 2–6 are a repeated shape rather than five spelled-out task bodies. That is deliberate and not a placeholder: the operation is identical for each group, the groups are enumerated with their case numbers and line offsets in "The existing shape", and writing it five times would invite the executor to skim. Task 1 Step 1 and Task 10 Step 1 say "read and list" because the exact set is discovered by the command given.

**Type consistency.** `OnboardingStepProps` is defined in Task 1 and consumed by all five step components. `Monogram` and `Companion` keep the signatures they have in `src/components/ui/`.

**Three risks.**
1. **The paywall.** Steps 9–11 are revenue. The split is a pure move and the flow is walked manually before the PR, but this is the thing to be careful about.
2. **The gender choice looks like decoration and is not.** Deleting the fox images without keeping the selection would silently change which scenarios a learner is offered, via `requiresGender`. Task 7 leads with this.
3. **The 1,441-line file makes "pure move" hard to verify.** Task C's line-count check is a weak proxy. If a group's diff shows substantially more added than removed, stop and diff the JSX rather than trusting `tsc`.
