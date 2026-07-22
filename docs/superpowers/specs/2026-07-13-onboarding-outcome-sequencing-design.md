# Onboarding Outcome-Sequencing Design

**Goal:** Reorder the existing 12-step onboarding flow so both paywall touches come *after* the user has experienced the product's value (quick-win phrase + interactive scenario), instead of the first paywall touch interrupting before any value has been shown.

**Scope:** A pure reordering of existing screens within `fasih-mobile/src/screens/OnboardingFlow.tsx`. No new screens, no new components, no data-flow or business-logic changes. This is the first, narrowly-scoped piece of the broader Phase 5 paywall-conversion work (`docs/superpowers/plans/2026-07-13-security-consistency-paywall-fixes.md`, Task 5.3) — social proof, experimentation infrastructure, and copy changes are separate, independent follow-ups not covered here.

---

## Current state

The onboarding flow (`OnboardingFlow.tsx`) is a single-file, 12-step (`step` state 0–11) wizard rendered via a `switch (step)` in `renderStep()`. Steps, in current order:

| # | Content |
|---|---|
| 0 | Welcome screen (generic intro, mascots, "Get Started") |
| 1 | Mode selection (career / social) |
| 2 | Name input |
| 3 | Role/profession selection |
| 4 | Goals selection |
| 5 | Commitment ritual (hold-to-commit gesture) |
| 6 | Notifications permission |
| 7 | **Paywall #1** — trial timeline pitch ("Unlock full potential") |
| 8 | First Arabic phrase "quick win" |
| 9 | Feature list + "See Plans" CTA (soft second pitch) |
| 10 | Interactive café scenario (the actual outcome-demonstrating experience) |
| 11 | **Paywall #2** — plan selection (final ask) |

## Problem

Paywall #1 (step 7) asks for a trial commitment immediately after notifications permission (step 6) — before the user has experienced anything the app actually does. Per the paywall-conversion research this plan is built around, a payment ask should feel like "the natural next step" after value has been demonstrated, not an interruption before it.

Separately, step 9 (feature list, a soft pitch) currently sits *between* the quick-win (8) and the scenario (10) — meaning the flow shows a sales pitch, then lets the user experience the product, then asks again. The pitch content should sit adjacent to the final ask, not sandwiched in the middle of the value-demonstration moments.

## Proposed order

| # | Content | Change |
|---|---|---|
| 0–6 | Unchanged | — |
| 7 | First Arabic phrase "quick win" | moved from 8 |
| 8 | Interactive café scenario | moved from 10 |
| 9 | **Paywall #1** — trial timeline pitch | moved from 7 |
| 10 | Feature list + "See Plans" CTA | moved from 9 |
| 11 | **Paywall #2** — plan selection | unchanged position |

Both value-demonstrating moments (quick-win, scenario) now happen back-to-back immediately after setup (0–6), and both paywall-adjacent screens (timeline pitch, feature list) sit back-to-back immediately before the final plan-selection ask — matching the "multi-page paywall unfolds gradually" pattern instead of pitch → prove it → ask again.

## Implementation notes

- Swap the four `case` blocks' positions in `renderStep()`'s switch statement; update each block's `// Step N: ...` inline comment to match its new position.
- `TOTAL` stays `12`; the progress bar, back-button visibility (`step > 0 && step < 11`), and the hold-to-commit logic (gated to step 5, which doesn't move) are all keyed to numeric ranges/positions, not content, so they don't need structural changes.
- Verified `next()`, `back()`, and `skip()` (the flow's only step-transition functions) are fully generic — `next()` is `step < TOTAL - 1 ? setStep(s => s + 1) : finishWithTrial()`, `back()` is `setStep(s => s - 1)`, `skip()` shows a confirm alert then calls `onSkipTrial()` + `finish()`. None special-case a specific step number, so the reorder is mechanically safe with no hidden jump logic to update.
- Still worth a final grep during implementation for any numeric step comparison *outside* the main switch (e.g., an analytics event or review-prompt trigger keyed to a specific step number expecting the *old* meaning) — none were found during design, but this should be explicitly checked as an implementation step, not assumed absent.
- No changes to `STRINGS`, the scenario engine, `useAppStore`, or any file outside `OnboardingFlow.tsx`.

## Testing / verification

This is a hand-built, heavily-animated flow with gesture-based navigation (swipe back/forward) — not meaningfully unit-testable. Verification is a manual end-to-end walkthrough of all 12 steps, in both the `career` and `social` mode branches (role/goal content differs between them), confirming:
- Step transitions, back-gesture, and forward-gesture all still work at every index
- The progress bar reflects the correct step count throughout
- The hold-to-commit step (index 5) is unaffected
- Quick-win and scenario render correctly in their new earlier positions
- Both paywall touches still correctly call `next()`/`finishWithTrial()`/`skip()` as before, just from their new step indices

## Out of scope (tracked separately in the Phase 5 plan)

- Social proof / testimonials (Task 5.2)
- Experimentation infrastructure decision — RevenueCat hosted paywall vs. custom variant flagging (Task 5.4)
- Analytics/funnel event tracking (Task 5.5)
- Any copy changes to the paywall screens themselves
