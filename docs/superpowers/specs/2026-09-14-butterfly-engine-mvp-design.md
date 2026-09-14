# Butterfly engine + MVP scenarios — design

**Date:** 2026-09-14
**Status:** design approved in conversation (grilling session, Q1–Q30), awaiting spec review
**Scope:** scenario engine rework, the 6 launch scenarios, end-screen replay loop, phrase audio, Apple trial paywall.
**Governs:** `docs/language/authority.md` still wins on anything Arabic. Nothing here overrides it.

---

## 1. Why this exists

Goal: every run teaches something real, a replay leads somewhere *different*, some endings are hidden, and no branch is obvious. Career mode (climbing the ladder) is the priority; social mode is living comfortably. Launch on iOS with a free trial and 6 fixed scenarios, 3 per mode.

### What the current engine does (measured 2026-09-14, all 9 scripts, every path)

| Finding | Evidence |
|---|---|
| Endings are a grade ladder, not destinations | `evaluateEnding` sums trust+respect+culture into one number and walks thresholds. The three meters never matter separately. |
| Scenes do not branch | 7 of 9 scripts: identical scene order every run. Taxi branches 2 scenes, Elevator 1, both re-merge immediately. The only "butterfly" is warm/neutral/cold line variants. |
| Every scene has one dominant answer | 39/40 scenes: the `excellent` choice is also max impact. |
| The answer is guessable | 36/40 scenes: the longest Arabic line is the best answer. |
| Grades shown per choice | `ScenarioChoiceResultPhase` labels Excellent / Cultural misstep. Run 2 = pick the green ones. |
| Replay only offers worse endings | Endings ranked exceptional→failed. No reason to replay for "The Quiet Start". |
| Secret endings not hidden | First Morning's secret flags sit on the excellent answers; greedy play reaches it 100% of the time. Only Gym hides a flag on a non-best choice. |
| No endings collection possible | `completedScenarios[id]` stores one `endingType`, overwritten per run. |
| Fabricated stats | Gym ending text "Only 8% of users discover this" (random play: 0.6%). `ENDING_STAT_SEEDS` in `syncService.ts` shows invented distributions pre-launch. Share text claims rarity. |
| Paywall gives itself away | `FREE_ACCESS_SCENARIO_COUNT = 3`: completing any 3 unlocks everything. Local 4-day trial runs separately from Apple. |
| Career content ≠ onboarding audience | Onboarding roles are front-line (hotel, F&B, retail, clinic, drivers, security, admin, teaching). Existing career scripts are job-specific (hotel, gym, nurse). |

What already works and stays: pure engine, per-NPC tone, flag-gated choices (Faisal's "tomorrow the coffee is on me"), ⚖️ divergent choices, choice-derived end-screen notes, reachability tests.

---

## 2. Decisions

### 2.1 Outcome model (Q1, Q7)

Each scenario has **~5 endings**:

- **2–3 destinations**, each with a **strong** and a **weak** version: different *kinds* of result, all culturally valid.
- **1 shared failure** ending.
- **1 hidden** ending.

**Route tags pick the destination.** Valid judgement choices carry `route: '<routeId>'`. Destination = route with most tags in the run; tie → route of the most recent tagged choice; no tags → script `defaultRoute`.

**Meters pick the quality.** trust+respect+culture (unchanged `relationshipScore`) decides strong vs weak within the destination, and failure below the destination's weak `min`. Meters are visible; routes are not — that is what keeps the destination non-obvious.

### 2.2 Choice design (Q2)

Two scene kinds, declared per scene:

- **`language`** — there is a right form (صباح النور answers صباح الخير). One correct answer.
- **`judgement`** — social strategy. ≥2 valid choices tagged to *different* routes, no single best. May also contain a clear cultural misstep.

Length must not signal quality (test, §4).

### 2.3 Structure (Q8, Q10)

- **6 decisions per run** on every route: ~2 language + ~4 judgement, ~6–8 min.
- **One fork** near the midpoint: the leading route selects the variant of 1–2 scenes, then all routes merge into the finale. The finale NPC line varies by route.
- Hidden ending adds its **bonus scene** (existing mechanism).
- Scenarios are standalone. **No cross-scenario state** in MVP.

### 2.4 Feedback during play (Q9)

| Choice | Shown immediately |
|---|---|
| Cultural misstep (any scene) | Flagged as a misstep + note |
| Language scene | Correct / Not quite + the right form |
| Valid judgement choice | NPC reaction + cultural note. **No grade, no score, no route name.** |

Tone preview ("Faisal warms to you") stays. The end screen reveals: destination, the moments that sent you there (choices tagged to the winning route), and hints toward other destinations + the hidden ending.

### 2.5 Hidden endings (Q6, Q12)

- **All 6 scenarios** have one.
- Announced: "5 endings · 1 hidden". Cultural hints on the end screen and intro.
- Rule (tested): greedy play (always the max-impact visible choice) must **not** reach it; requires ≥2 flags set in **different scenes**; ≥1 of those flags on a choice that is **not** max impact in its scene.
- No invented percentages anywhere, ever.

### 2.6 Replay loop (Q11, Q21)

- **Phrases per outcome:** ~5 core phrases on any completion (failure included) + 2–3 per destination reached + 1 for the hidden ending. ~15 per scenario, all into SRS.
- **Endings collection:** "3 of 5 found · 1 hidden" on scenario card, intro, end screen.
- **Community stats:** "% of players reached this" only when the scenario has ≥100 completions. Below that, nothing. `ENDING_STAT_SEEDS` deleted.

### 2.7 Gender (Q14)

NPC lines that address the learner get feminine variants (شلونك / شلونج, يا ولدي / يا بنتي). Choices keep `arabicFeminine`. Reviewer checks both.

### 2.8 The 6 scenarios (Q3, Q13, Q24)

All settings job-neutral ("the staff room", "your manager's office") so a receptionist, nurse or driver fits.

| Mode | # | Scenario | Status | Free |
|---|---|---|---|---|
| Career | 1 | **First Morning** — first day, a colleague's welcome (moved out of the hotel) | rewrite | ✅ |
| Career | 2 | **Coffee Invitation** — building the relationship | rewrite, 3→6 decisions | |
| Career | 3 | **The Meeting** — your Emirati senior manager; raise an idea / ask for responsibility. Small talk before business, address, reading a stalling إن شاء الله, disagreeing without loss of face. Destinations: sponsor / trusted voice / given the responsibility. Reuses `office-meeting` id. | new | |
| Social | 1 | **The Taxi Ride** — Egyptian driver, answer in Khaleeji | rewrite | ✅ |
| Social | 2 | **The Elevator** — Jordanian neighbour | rewrite | |
| Social | 3 | **Eid Greetings** — Emirati neighbour's home | rewrite, 3→6 decisions | |

Destination names for 1, 2, 4, 5, 6 are content work in each scenario's branch.

- **Both modes visible** to every learner, own mode first (Q19). 2 free scenarios each.
- **Free play order** within a mode, displayed as an arc (Q20).
- **Deleted** (git history keeps them): Hotel Guest, Gym Consultation, The Checkup, Café Connection, the medical list, all `comingSoon` catalog entries except `office-meeting` (Q17).
- **Onboarding café** mini-scenario untouched.

### 2.9 Surrounding features

- **Situational Confidence** (Q25): 3 situations — Workplace (First Morning, Coffee, Meeting), Getting around (Taxi), Neighbours & celebrations (Elevator, Eid). Confidence from best tier reached + endings found.
- **Sentence Builder** (Q26): stays. Gym-unlocked patterns re-home — أبي ___ / خلني → The Meeting; تفضل → Eid; `بـ + verb` → wherever the rewrite uses it. Pattern examples must be reviewed phrases.
  - *Amended in branch 1:* `abi-verb` and `b-future` were **removed**, not made library basics — every slot option came from gym dialogue, so as basics they could never be built. They return with The Meeting / whichever rewrite uses the form. `imperative-polite` lost its gym quote phrase and secret gate and is a library basic (عطني / تفضل) until Eid claims it.
- **`impactPreview`** fake percentages on cards removed.

### 2.10 Language & audio (Q4, Q16, Q18, Q22, Q27)

- **Emirati reviewer**: Dubai/Abu Dhabi, ~20–35, paid per scenario, written brief (naturalness, currency, gender forms, register). Reviews all 6 before launch. First Morning first, to calibrate the brief.
- **Dialect reviewers**: an Egyptian speaker for Taxi NPC lines, a Levantine speaker for Elevator NPC lines.
- **Audio**: human recordings of unlocked phrases only (~90 phrases, ~180 clips). Two young urban Emirati voices — masculine forms male voice, feminine forms female voice, shared phrases both. **Device TTS turned off everywhere.** Dialogue has no audio; romanisation carries pronunciation.
- Review provenance is recorded as its own field, never folded into `source`, and never set from Ahmed's approval (authority rule 5). Shape designed in the First Morning branch.

### 2.11 Paywall (Q5, Q15)

- Free forever: scenario 1 of each mode, replays included.
- Scenarios 2–3: Apple **7-day free trial on yearly only** (App Store Connect introductory offer, read via RevenueCat) or subscription.
- Removed: local `TRIAL_DAYS` trial, `FREE_ACCESS_SCENARIO_COUNT` "complete 3 → full access" rule.

### 2.12 Launch gate & success (Q28, Q29, Q30)

- **No fixed date.** Launch when all 6 are reviewed and recorded.
- **Checkpoint 1:** First Morning rebuilt → playtested on a real iPhone via TestFlight → reviewed. Only then the other 5. TestFlight again before submission.
- **Metrics** (Supabase stats, nothing beyond `docs/privacy-data-inventory.md`): ending id + run number per completion, distinct endings per player, hidden-ending discovery rate, trial→paid.
- **Success bar:** ≥30% of completers replay the same scenario within 7 days.

---

## 3. Engine & data changes

Engine stays pure (`src/engine/scenarioEngine.ts`, no React, no store).

**Types (`src/types/index.ts`)**

- `ScenarioScript`: `routes: { id: string; label: string }[]`, `defaultRoute: string`, `phrases: { core: string[]; byEnding: Record<string, string[]> }` (replaces `phrasesUnlocked`). *Amended in branch 2:* no `failBelow` — each destination's weak ending `min` is its failure line, so `min` means "score needed" on every ending.
- `ScenarioScene`: `kind: 'language' | 'judgement'`, `nextByRoute?: Record<string, string>` (the fork), feminine variants for learner-addressing NPC lines.
- `ScenarioChoice`: `route?: string`.
- `ScenarioEnding`: `id: string` (stable), `route?: string`, `tier?: 'strong' | 'weak'`, `hint: string`. `type` kept and derived: hidden → `exceptional`, strong → `success`, weak → `mixed`, failure → `failed` (keeps Situational Confidence and stats readable).
- `ScenarioState`: unchanged. Route standing is **derived** from `choiceHistory` + script, not stored twice.

**Functions**

- `leadingRoute(state, script)` → route id (most tags, tie → most recent, none → `defaultRoute`).
- `resolveNextScene`: `choice.next` → `scene.nextByRoute[leadingRoute]` → linear → null.
- `evaluateEnding`: hidden (flags + min) → destination of `leadingRoute`: strong if score ≥ its strong `min`, weak if ≥ its weak `min`, else failure. Scripts without `routes` keep the legacy ladder until rewritten.

**Store (`src/store/useAppStore.ts`)**

- `endingsFound: Record<scenarioId, endingId[]>`, `scenarioRuns: Record<scenarioId, number>`. Persisted + synced.
- `completedScenarios` kept for access/confidence.
- No migration for deleted scenario ids (pre-launch).

---

## 4. Content rules (tests in `scenarioContent.test.ts`)

New, applied to every **route** script (legacy scripts are exempt until their rewrite branch; rule 11 and unique ending ids apply to all). Implemented as `routeScriptProblems()` in `src/engine/scenarioRules.ts`, which simulates runs with the real engine:

1. Greedy path never reaches the hidden ending.
2. Hidden ending: ≥2 required flags set in different scenes; ≥1 on a non-max-impact choice.
3. Every ending (each destination × tier, failure, hidden) reachable.
4. Every route's main path = 6 decisions.
5. Judgement scenes: ≥2 valid choices with different `route`s.
6. Language scenes: no `route` tags; exactly one correct choice.
7. Longest-line tell: max-impact choice is also the longest Arabic line in ≤50% of scenes.
8. Fork variant scenes: every choice has `next` into the merge scene.
9. Every `nextByRoute` key is a declared route; every route has a destination ending.
10. Every `byEnding` key is a real ending id; all phrase ids exist.
11. No `%` or rarity claims in ending text or share copy.
12. Learner-addressing NPC lines have a feminine variant.

Kept: tier bands, one-mistake-doesn't-fail, top ending not flawless, flag/`next` integrity, language hygiene, no-MSA lint.

---

## 5. Branches

Each branches off `dev`, one PR into `dev`. Order = dependency order.

| # | Branch | Contains | Depends on |
|---|---|---|---|
| 1 | `feat/mvp-content-cleanup` | Delete non-MVP scripts/catalog/phrases; delete `ENDING_STAT_SEEDS`, "Only 8%", rarity share copy, `impactPreview` numbers; Situational Confidence → 3 situations; gym-only grammar patterns removed, `imperative-polite` → library basic (see §2.9) | — |
| 2 | `feat/butterfly-engine` | Types, `leadingRoute`, fork in `resolveNextScene`, new `evaluateEnding`, engine tests, content rules §4, `endingsFound` / `scenarioRuns` in store + sync | 1 |
| 3 | `feat/butterfly-player-ui` | Feedback by scene kind, fork navigation, end screen (destination, moments, hints), endings collection on card/intro/end, stats ≥100 gate, feminine NPC variants, both modes visible | 2 |
| 4 | `feat/scenario-first-morning` | Reference scenario on the new model; review-provenance field. **Checkpoint:** TestFlight playtest + Emirati reviewer calibration | 3 |
| 5 | `feat/scenario-coffee-invitation` | Rewrite to 6 decisions | checkpoint |
| 6 | `feat/scenario-the-meeting` | New scenario (`office-meeting`), re-home أبي / خلني patterns | checkpoint |
| 7 | `feat/scenario-taxi` | Rewrite + Egyptian line review | checkpoint |
| 8 | `feat/scenario-elevator` | Rewrite + Levantine line review | checkpoint |
| 9 | `feat/scenario-eid` | Rewrite to 6 decisions, re-home تفضل pattern | checkpoint |
| 10 | `feat/phrase-audio` | Bundled recorded clips keyed by phrase id + gender; TTS removed | recordings |
| 11 | `feat/paywall-apple-trial` | RevenueCat intro offer, free = scenario 1 per mode, remove local trial + complete-3 rule | 1 |
| 12 | `feat/scenario-analytics` | Ending id + run number, distinct endings, hidden discovery, replay metric | 2 |

5–9 run in parallel after the checkpoint. 11 can run anytime after 1.

### Ahmed's tasks (not code)

- Hire Emirati reviewer (brief drafted in branch 4).
- Hire Egyptian + Levantine line reviewers (before 7, 8).
- Hire two Emirati voices; record after all 6 reviewed (before 10).
- App Store Connect: yearly subscription intro offer, 7-day free trial (before 11 ships).
- TestFlight playtest at checkpoint and before submission.

---

## 6. Risks

- **Content volume.** ~400+ Arabic lines plus feminine variants, all needing review. The checkpoint exists to catch a bad route/fork design after one scenario, not six.
- **Replay bar may miss.** If <30% replay, first suspects: hints too vague, destinations too similar, 6 decisions too long.
- **Unreviewed until reviewed.** No scenario content counts as verified before the native review lands, whatever the tests say — tests catch wrong forms, not unnatural ones.
- **iOS unobserved.** All development verification so far is Android; TestFlight gates are mandatory, not optional.
