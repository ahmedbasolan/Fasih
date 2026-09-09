# Onboarding resequence — design

**Date:** 2026-09-09
**Branch:** `feat/onboarding-resequence` (stacked on `feat/onboarding-header-inset`, PR #52)
**Status:** design approved in conversation, awaiting spec review
**Relationship to Sadaf:** works inside `2026-09-03-sadaf-art-direction-design.md`. Introduces no motion, no character art, no new hue. See §7.

---

## 1. Why this exists

Ahmed's report: the onboarding is **"just boring to go through."**

Not a rendering complaint — the rendering defects found alongside it are fixed separately in PR #52. This is about what it feels like to advance through the flow.

### The measured cause

Mapping every step by whether it **asks** the learner for something or **gives** them something:

| Step | Screen | |
|---|---|---|
| 0 | Welcome splash | — |
| 1 | Choose your path | ask |
| 2 | Name + gender | ask ×2 |
| 3 | Role + profession | ask ×2 |
| 4 | What drives you | ask |
| 5 | Make a commitment | ask |
| 6 | Notifications | ask |
| 7 | First phrase شلونك | **give** |
| 8 | Café scenario | **give** |
| 9–11 | Paywall ×3 | ask ×3 |

**Seven consecutive asks before the first give.** That is the defect. It is structural, so no restyle addresses it.

Two aggravating factors:

1. **Six pieces of data are collected and none is reflected back** before the paywall — mode, name, gender, role, profession, goals. The Arabic name typewriter on step 2 is the sole exception, and it is the one moment in the run that is not boring. That is evidence for the fix, not a coincidence.
2. **Step 5 asks for a 2.2-second hold and returns nothing for it.** The most demanding interaction in the flow, placed sixth in the ask-run, paying out nothing.

### Correction, 2026-09-09 — the "redundancy" this spec first claimed does not exist

An earlier draft of this section asserted that step 7 duplicates
`ScenarioScript.primerPhrases` and should be folded into it. **That is wrong**, and the
plan built on it would have failed the existing suite on the first run. Checked before
planning:

| Fact | Where |
|---|---|
| `primerPhrases` must be a subset of `phrasesUnlocked` | `scenarioContent.test.ts:150` |
| If present, must be 2–3 chips | `scenarioContent.test.ts:153` |
| **Onboarding scenarios are explicitly exempted from having a primer** | `scenarioContent.test.ts:160` — `!s.id.startsWith('onboarding')` |
| `onboarding-cafe-career` unlocks exactly one phrase, `e_new1` | `scenarios.ts:1254` |
| Primer chips are rendered by `ScenarioIntroPhase`, which the onboarding player does not use | `ScenarioIntroPhase.tsx` |

So a valid primer for the café would need 2–3 phrases drawn from a `phrasesUnlocked`
list holding one, plus an intro phase the onboarding player does not have, plus new
Arabic authored under the language authority. And the exemption on line 160 is a
recorded decision, not a gap.

**Step 7 is not a duplicate. It IS the primer** — hear-now-earn-later, implemented as its
own screen precisely because the onboarding player has no intro phase. It stays, and it
moves to where a primer belongs: immediately before the scenario.

This correction improves the result. The phrase screen is a cheap, fast give, so putting
it at step 3 lands the first give one step *earlier* than the original plan, and it
touches no content, no scenario script and no content test.

---

## 2. Decision

**Resequence. Do not restyle.**

The first give moves from step 7 to step 3. Ask-run before it: **7 → 2**.

| | Screen | | Change |
|---|---|---|---|
| 0 | Welcome | — | unchanged |
| 1 | Mode | ask | unchanged |
| 2 | Name + gender | ask | unchanged |
| 3 | **First phrase شلونك** | **give** | **moved from 7.** Content unchanged |
| 4 | **Café scenario** (+ unlock phase) | **give** | **moved from 8.** Content unchanged |
| 5 | Role + profession **+ inline payoff** | ask → **give** | moved down from 3. §4 renders on selection |
| 6 | Goals | ask | unchanged |
| 7 | Commitment | ask | moved down from 5 — now lands after value, not before |
| 8 | Notifications | ask | unchanged |
| 9–11 | Paywall ×3 | ask | **untouched.** §6 |

Twelve steps before, twelve after. **The count is not the problem and this spec does not chase it.** The rhythm is:

```
old   —  ask ask ask ask ask ask  GIVE GIVE  ask ask ask
new   —  ask ask  GIVE GIVE  ask→give  ask ask ask  ask ask ask
              ↑ first give at step 3
```

Nothing is cut. The two gives that were buried at 7–8 move to 3–4, the profile questions
move behind them, and the payoff in §4 rides on a screen that already exists rather than
adding a thirteenth step.

### Sub-decisions taken in conversation

| Question | Decision |
|---|---|
| How early the first give lands | After mode + gender. Those two are the scenario's hard dependencies — `getScenarioScript` takes `mode`, and gender gates scenarios per CLAUDE.md. Step 3 is the earliest it can legally run. |
| The commitment screen | **Kept.** Proposed for cutting; Ahmed chose to keep it. It moves after the payoff instead. This also avoids changing `ONBOARDING_CHECKLIST_ITEMS` — see §5. |
| The standalone phrase screen | **Kept and moved** to step 3, immediately before the scenario. It is the primer, not a duplicate of one — see the correction in §1. |
| Paywall | **Untouched.** §6. |
| Art direction | Unchanged. §7. |

---

## 3. Alternatives rejected

- **Interleave small gives, keep the order.** Each profile question hands something back in place. Rejected: still six screens before the real moment, and it needs new per-question content that does not exist.
- **Cut and compress only.** Drop commitment, merge role+goals, fold the paywall. Rejected: shorter boring is still boring. It reduces the count without changing the ask/give shape, which is the actual complaint.

---

## 4. "Your shift" — the payoff, inline on the role screen

**Not a new step.** It renders on step 5 as soon as a profession is chosen, in the space
below the chips.

That screen already works this way: picking a role category reveals the profession chips
inline, on the same screen, without advancing. The payoff extends that pattern by one
beat — pick category, pick profession, see what it maps to. Ask and answer in the same
place, which is a stronger causal link than ask-then-advance, and it keeps the flow at
twelve steps instead of thirteen.

It exists because the flow already collects role and profession and never uses them.

### What it can honestly say

`Phrase` carries `category: PhraseCategory` and **no role or profession field**. `ScenarioScript` has no role tag either. There is no data linking *"Hotel receptionist"* to a set of phrases, so the screen cannot claim per-profession coverage without content work that does not exist yet.

What **is** derivable today is a **role → `PhraseCategory`** mapping, with counts computed from `PHRASES`:

```
Hotel receptionist
Hospitality · Greetings · Workplace
57 phrases in your shift
```

The library holds **136 phrases** across eight categories:

| Category | Phrases |
|---|---|
| `Everyday` | 31 |
| `Greetings` | 23 |
| `Workplace` | 20 |
| `Social` | 19 |
| `Hospitality` | 14 |
| `Gratitude` | 12 |
| `Food & Drink` | 9 |
| `Family` | 8 |

### The count differentiates less than it looks like it does

Measured across all eight roles, every mapping lands between **46 and 74** phrases out of 136. `Greetings` and `Everyday` are large and apply to essentially every job, so they dominate any three-category mapping and flatten the differences.

Two consequences for the screen:

- **The categories are the personalisation, not the number.** A waiter seeing `Food & Drink` and a nurse seeing `Everyday` is the part that proves the app listened. "57" versus "62" proves nothing.
- **The distinctive category leads.** Order the categories so the role-specific one is first — `Hospitality · Greetings · Workplace`, not alphabetically or by size. The universal categories are context, not the claim.

The count still appears, because a concrete number reads as real where a bare list reads as decorative. But it is the supporting line, not the headline, and the copy must not imply the set was authored for that job — it was not.

No mapping resolves to zero, so the empty-payoff case cannot occur with the current library. The test in §8 pins that rather than trusting it to stay true.

### Why this is a product decision, not a linguistic one

The mapping groups existing categories. It introduces **no new Arabic**, makes **no claim about any phrase's form, register or currency**, and therefore does not engage `docs/language/authority.md`. Per CLAUDE.md rule 5, mapping a job title to a set of topics is exactly the kind of product call Ahmed can make. The pipeline in `docs/language/pipeline.md` is not involved.

### The count must be real

The number is computed by counting `PHRASES` in the mapped categories, never written as a literal. A hardcoded figure would be a fabricated statistic on a screen whose entire purpose is to prove the app was listening — and it would drift the moment a phrase is added.

### Placement

Renders on step 5 the moment a profession is selected. It reflects **role and profession
only** — not goals, which are still two screens away at that point. Reflecting one signal
immediately beats reflecting two after a delay, and it avoids inventing a thirteenth
screen to hold both.

---

## 5. Contracts this touches

### Unchanged, because commitment stays

`ONBOARDING_CHECKLIST_ITEMS` keeps all five members — `profession`, `goals`, `commitment`, `first_phrase`, `first_scenario`. `computeOnboardingChecklist` is unchanged, `UserProfile.onboardingChecklist` is unchanged, and no persisted data migrates. Keeping the commitment screen bought this.

### Changed

**`phraseRevealed` keeps its screen and its trigger.** The phrase screen survives the
correction in §1, so the flag is still set by its tap-to-hear and still feeds the
`first_phrase` checklist item. Nothing about it changes except which step index it lives on.

**No scenario content changes.** `scenarios.ts` is untouched. `primerPhrases`,
`phrasesUnlocked` and `scenarioContent.test.ts` are all left exactly as they are — the
correction in §1 removed the only reason to touch them.

**Step routing.** `OnboardingFlow`'s `switch` maps step indices to the four step components. Every index from 3 up shifts. `TOTAL` stays 12.

**Swipe guards.** `composedGesture` blocks forward swipes on steps that require explicit interaction, currently hardcoded as steps 1, 2 and 5. Those indices move with the screens and must move with them. **A missed guard here banks an unmade choice silently** — the exact failure the existing guards were written to prevent.

**Analytics.** `src/lib/onboardingAnalytics.ts` and `src/engine/onboardingAnalytics.ts` record step progression. Step numbers change meaning, so historical rows are not comparable across the change. This is a reporting discontinuity to note, not a migration to write.

---

## 6. Out of scope

**The paywall stays three screens.** Compressing it is a conversion decision with revenue attached, and pricing is not yet decided — CLAUDE.md forbids hardcoding a price, and RevenueCat offerings do not exist yet. The paywall's missing price disclosure is a real store-submission blocker (Apple 3.1.2, Play billing policy) and is tracked separately from this work.

**Per-profession phrase tagging.** The stronger version of §4 — *"receptionists hear these six phrases every shift"* — needs a `professions` field on `Phrase` and content authored against it. That is a content project under the language authority, not a resequence.

**The tail run.** After the payoff at step 6 there are five consecutive asks: commitment, notifications, and three paywall screens. This spec does not fix that; three of the five are the paywall and out of scope, and the other two were kept deliberately. It is the largest remaining rhythm problem and the obvious candidate for the next pass.

---

## 7. Relationship to Sadaf

`2026-09-03-sadaf-art-direction-design.md` is the app's art direction and this work does not revise it.

Specifically, this spec introduces **no** entrance animations, **no** ambient or looping decoration, **no** character art, and **no** new hue. §7 of Sadaf bans all four by name, and the `Companion` seam that would allow reintroducing a character stays exactly as it is.

That restraint is deliberate and is the reason the diagnosis in §1 was done by mapping ask/give rather than by looking at screenshots. "Boring to go through" turned out to describe the sequence, and the sequence is the thing Sadaf has no opinion about.

One Sadaf decision is already reversed on `dev` and is **not** revisited here: `5a507ae feat(ui): give ShimmerButton its shimmer back` undid §7's shimmer ban. That reversal stands or falls on its own; this spec neither extends nor undoes it.

---

## 8. Verification

1. **`npx tsc --noEmit` clean**, verified from a clean stash per CLAUDE.md — the working tree carries unrelated WIP.
2. **A test over the step order.** The routing, the swipe guards and the checklist triggers all key off step indices that this change shifts. A pure function mapping step index → screen identity, with the guards derived from it rather than restated, so the two cannot drift. This is the same treatment `ONBOARDING_CHROME` got in PR #52 for the same reason.
3. **A test for the role → category map**: every role in `PROFESSION_CATEGORIES` maps to at least one category, every mapped category is a real `PhraseCategory`, and every mapping resolves to a non-zero phrase count against `PHRASES`. A role that silently maps to nothing would render an empty payoff. The measured range today is 46–74; the test asserts non-zero rather than a range, so adding phrases cannot fail it.
4. **No new hardcoded strings.** All new copy in `STRINGS.onboarding`, per the strings rule.
5. **No new hardcoded colours.** The new screen composes existing tokens only.

---

## 9. Build order

Each step ends compiling and usable.

1. **Step-order module.** The pure index → screen mapping and the swipe guards derived from it, with its test. Nothing moves yet; this only makes the current order explicit and testable, so step 2 is a data change rather than a hunt through a switch.
2. **Resequence.** Phrase to 3, scenario to 4, role to 5, goals to 6, commitment to 7. Pure reordering — no screen's content changes.
3. **The payoff.** The role → category map with its test, then the inline block on step 5.

Steps 1–2 are shippable without step 3: the rhythm fix is the bulk of the value and does not depend on the payoff.

---

## 10. Open risks

- **The scenario now runs before the learner has told the app much.** It takes only `mode` and gender, which is why step 4 is legal — but the café scenario was authored to sit after the profile questions, and its copy may assume context the learner has not yet given. **The script needs reading against its new position** before this ships. `kafIntro` on both onboarding scripts is the first thing to check: *"Your first moment speaking Gulf Arabic"* still reads correctly at step 4, but it is the sentence most likely to have assumed a later position.
- **The tail is now the boring part.** §6. Moving the first give forward does not add gives to the end, and five consecutive asks close the flow.
- **Not verifiable without a device.** As with PR #52, nothing here can be confirmed by running the app in this session. The ask/give mapping is checkable from source; how the new order *feels* is not.
