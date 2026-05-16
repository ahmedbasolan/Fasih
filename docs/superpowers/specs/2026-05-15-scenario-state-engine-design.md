# Scenario State Engine — Design Spec
**Date:** 2026-05-15  
**Project:** Fasih — Gulf Arabic Learning App  
**Status:** Approved, ready for implementation

---

## What We're Building and Why

Fasih teaches Gulf Arabic through real-life scenarios: you step into a situation (a job interview, meeting a colleague's family, navigating a local market) and make choices that affect how the other person responds to you.

Right now the app plays scenarios linearly — you choose, you get a reaction, you move on. What's missing is the sense that your choices *accumulate*. In real life, if you're slightly too informal with your boss in the first five minutes of a meeting, the damage doesn't show up immediately — it colors every exchange that follows. The same applies to language learning: the learner needs to feel that cultural and linguistic precision matters beyond any single moment.

This spec defines the **Scenario State Engine**: the system that tracks everything that has happened in a scenario run and uses it to shape what happens next.

---

## The Core Idea: Your History Follows You

Every scenario has a central path — you will always start at the beginning and reach an ending. But along the way, two things accumulate:

**1. Flags** — significant moments that get remembered.  
A flag is a marker. When you choose to address your host formally on arrival, a flag is set: `RESPECTED_HOST_ON_ARRIVAL`. Later, when you make a slightly awkward request, the host remembers that first impression and responds with patience instead of irritation. If you had been rude on arrival, the same awkward request would have gone badly.

The learner never sees flags. They just experience consequences that feel earned.

**2. Impact scores per character** — relationship points, tracked per person.  
Every NPC (named character) in a scenario has three running scores:
- **Trust** — does this person rely on you to behave appropriately?
- **Respect** — have you treated them with the cultural regard they expect?
- **Culture** — have you demonstrated awareness of Gulf customs and language?

Each choice adds or subtracts from these. They stack across scenes. By the end of the scenario, the combined score — across all three dimensions, across all characters — determines which ending you get.

---

## How Dialogue Changes Based on Relationship

Each scene with a character can have three versions of their dialogue:

- **Warm** — the character is at ease with you, speaks openly, may offer a cultural tip
- **Neutral** — baseline, professional, reserved
- **Cold** — the character is noticeably distant, formal to a fault, terse

Which version plays depends entirely on that character's accumulated impact score at the moment you reach their scene. A character you've built trust with over three scenes greets you warmly in scene four. The same scene, on a different run where you made dismissive choices, plays cold.

This is the butterfly effect: a learner who makes culturally aware choices throughout feels the relationship warm up organically. A learner who doesn't notices the chill — and on replay, recognizes exactly which moments caused it.

---

## Secret Endings

Standard endings are determined by total score alone. Secret endings require both a minimum score *and* specific flags to be set.

Example: The gym scenario has a secret ending. To reach it, the learner must have:
- Set `GREETED_IN_DIALECT` (used Gulf Arabic greeting instead of Modern Standard Arabic)
- Set `OFFERED_HELP_UNPROMPTED` (volunteered help before being asked)
- Reached a total impact score above the threshold

If either condition is missing, the player gets a standard ending. The secret ending is a reward for cultural attentiveness across the whole run — not a single lucky choice.

---

## Replayability: Why Different Runs Feel Different

Because impact scores and flags accumulate differently based on choices, two playthroughs of the same scenario produce genuinely different experiences:

- NPC dialogue tone changes across scenes
- Scene transitions may follow different branches where explicit branching exists
- The ending changes
- On a second run, a learner who previously got a cold ending can deliberately target the moments they missed

The scenario doesn't change. The player's relationship with it does — which mirrors how language learning actually works.

---

## System Architecture: Four Components

### 1. Data Structures (the memory of a run)
A `ScenarioState` object holds everything about an in-progress run:
- Which scenario and scene you're currently in
- All flags set so far
- Impact scores for every character you've interacted with
- A history of every choice made (for analytics and end-screen summary)
- Every scene visited (for completeness tracking)
- When the run started

Additionally, `EndingRequirements` defines what each ending needs: minimum/maximum score, required flags, forbidden flags.

### 2. Engine Functions (pure logic, no side effects)
Five functions that take the current state and return results — no storage, no React, no UI. Fully testable in isolation.

- `applyChoice` — given a choice and which NPC it's directed at, returns updated state with new flags and scores
- `getTone` — given the current state and a scene, returns `warm`, `neutral`, or `cold`
- `resolveNextScene` — returns the ID of the next scene to show (follows explicit branch from choice, or linear fallback)
- `evaluateEnding` — scans all endings, checks secret endings first (most restrictive), falls back to score-threshold endings
- `isChoiceVisible` — currently all choices are always visible; reserved for future flag-gated choice visibility

### 3. Zustand Store (runtime state management)
The active scenario run lives in global app state (Zustand), separate from persisted save data. This means:
- The run is accessible from any screen during play
- On run completion, only the ending type and date are written to persisted save data — not the full run state
- If the app closes mid-run, the run resets (resumable runs are a future feature)

Five store actions: `startScenario`, `applyChoice`, `advanceScene`, `finalizeScenario`, `abandonScenario`.

The split between `applyChoice` and `advanceScene` is intentional: the choice updates scores and flags immediately, but the scene only advances *after* the outcome animation finishes — giving the learner a moment to absorb the NPC's reaction before the story continues.

### 4. ScenarioPlayer Component (UI coordinator)
The screen that plays scenarios becomes a thin coordinator:
- Reads current scene and state from the store
- Calls `getTone` to determine which dialogue version to show
- Renders the NPC dialogue bubble with a subtle visual warmth cue (warm/cold border, no explicit score display)
- Renders choices, passes selection to `applyChoice`
- Shows `teachingNote` cultural context after NPC speaks, before choices appear
- On final scene, calls `evaluateEnding` and routes to the end screen

The ImpactBar (already in the app) continues to show live scores as visual feedback during play.

---

## What the Learner Experiences

They never see:
- Flag IDs
- Score numbers changing
- "You gained +2 Trust"

They do see:
- An NPC's demeanor shift across scenes
- A teaching note explaining *why* a certain phrase or register matters here
- Endings that feel like a natural consequence of the whole run, not a final quiz
- On replay: different dialogue, different outcome — because they made different choices

---

## Files to Create or Modify

| File | Change |
|---|---|
| `src/types/index.ts` | Add `ScenarioState`, `Tone`, `ToneThresholds`, `EndingRequirements`, `ImpactDelta` |
| `src/engine/scenarioEngine.ts` | New file — the five pure engine functions |
| `src/store/useAppStore.ts` | Add `activeScenarioState` + five store actions |
| `src/screens/ScenarioPlayer.tsx` | Refactor to use store + engine; add tone-driven dialogue and teaching note rendering |

No database changes required. No new dependencies. Everything builds on what's already in the project.

> **Implementation note:** NPC identity in `impactByNpc` uses `charName` as the key. Scenario scripts must ensure no two distinct NPCs share the same name within a single scenario. If a future scenario needs two characters with the same name, a unique `charId` field should be added to `ScenarioScene`.

---

## Out of Scope (Not in This Build)

- Resume a run after app close
- Flag-gated choice hiding (choices are always shown; consequences vary)
- Multi-scenario butterfly effects (flags don't carry between separate scenarios)
- Community choice distribution (already exists separately in the store)
