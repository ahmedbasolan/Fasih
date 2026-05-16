# Scenario State Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the ad-hoc scenario logic scattered across `ScenarioPlayer.tsx` into a tested pure-function engine (`scenarioEngine.ts`) backed by a shared Zustand state slot, enabling butterfly-effect mechanics, per-NPC relationships, and secret endings.

**Architecture:** A new `src/engine/scenarioEngine.ts` holds all pure logic (no React, no store). `useAppStore` gains an `activeScenarioState` slot plus five actions. `ScenarioPlayer` becomes a thin UI coordinator that reads from the store and calls engine functions, replacing its current scattered local state.

**Tech Stack:** TypeScript 5.9, Zustand 5, jest-expo 55, React Native 0.83.4, Expo ~55

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/types/index.ts` | Add `ScenarioState`, `ImpactDelta`, `Tone` |
| Create | `src/engine/scenarioEngine.ts` | 5 pure engine functions, no side effects |
| Create | `src/engine/__tests__/scenarioEngine.test.ts` | Unit tests for all engine functions |
| Modify | `src/store/useAppStore.ts` | Add `activeScenarioState` + 5 store actions |
| Modify | `src/screens/ScenarioPlayer.tsx` | Refactor to use engine + store |
| Modify | `package.json` | Add jest, jest-expo, @types/jest, test script |

---

## Task 1: Add Types to `src/types/index.ts`

**Files:**
- Modify: `src/types/index.ts` (append after `MainTab` at line 207)

- [ ] **Step 1: Read the file to confirm current end**

  Run: open `src/types/index.ts` and confirm the last line is `export type MainTab = 'home' | 'scenarios' | 'library' | 'profile';`

- [ ] **Step 2: Append new types**

  Add the following block at the bottom of `src/types/index.ts`:

  ```typescript
  // ─── Scenario State Engine ────────────────────────────────────────────────────

  /** Per-NPC running totals for trust, respect, and culture dimensions */
  export interface ImpactDelta {
    trust: number;    // negative allowed (e.g. -2 to +3 per choice)
    respect: number;
    culture: number;
  }

  /** NPC dialogue warmth level, derived from accumulated ImpactDelta */
  export type Tone = 'warm' | 'neutral' | 'cold';

  /**
   * Complete runtime state for one scenario run.
   * Lives in Zustand as activeScenarioState — NOT persisted between sessions.
   * Sets are used internally; the field is excluded from AsyncStorage partialize.
   */
  export interface ScenarioState {
    scenarioId: string;
    currentSceneId: string;
    /** Flag IDs set by choices so far (e.g. 'GREETED_IN_DIALECT') */
    flags: Set<string>;
    /** Per-NPC accumulated impact — keyed by charName (must be unique per scenario) */
    impactByNpc: Record<string, ImpactDelta>;
    /**
     * Sum of choice.score values — this drives warmThreshold / coldThreshold.
     * Kept separate from impactByNpc because script authors write thresholds
     * against choice.score, not the T/R/C impact sum.
     */
    totalScore: number;
    /** Ordered history of every choice made in this run */
    choiceHistory: Array<{
      sceneId: string;
      choiceId: string;
      npcId: string;   // charName of the NPC in that scene
      timestamp: string; // ISO date-time
    }>;
    /** All scene IDs visited so far (for completeness tracking) */
    scenesVisited: Set<string>;
    startedAt: string; // ISO date-time
  }
  ```

- [ ] **Step 3: Verify TypeScript compiles**

  Run: `npx tsc --noEmit`
  Expected: no errors

- [ ] **Step 4: Commit**

  ```bash
  git add src/types/index.ts
  git commit -m "feat(types): add ScenarioState, ImpactDelta, Tone for state engine"
  ```

---

## Task 2: Set Up Jest

**Files:**
- Modify: `package.json`
- Create: `jest.config.js`

- [ ] **Step 1: Install test dependencies**

  Run: `npm install --save-dev jest jest-expo @types/jest`
  Expected: installs without errors, no peer dependency warnings for expo 55

- [ ] **Step 2: Add test script to package.json**

  Open `package.json`. In the `"scripts"` block, add:
  ```json
  "test": "jest"
  ```
  So scripts becomes:
  ```json
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "lint": "expo lint",
    "test": "jest"
  }
  ```

- [ ] **Step 3: Create jest.config.js in project root**

  Create `fasih-mobile/jest.config.js`:
  ```js
  module.exports = {
    preset: 'jest-expo',
    testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    transformIgnorePatterns: [
      'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|moti|@motify/.*)',
    ],
  };
  ```

- [ ] **Step 4: Verify jest runs (no tests yet)**

  Run: `npm test -- --passWithNoTests`
  Expected: `Test Suites: 0 passed` — exits 0

- [ ] **Step 5: Commit**

  ```bash
  git add package.json jest.config.js package-lock.json
  git commit -m "chore: add jest-expo test infrastructure"
  ```

---

## Task 3: Create Engine — `applyChoice` and `getTone`

**Files:**
- Create: `src/engine/scenarioEngine.ts`
- Create: `src/engine/__tests__/scenarioEngine.test.ts`

### 3a — Write failing tests for `applyChoice` and `getTone`

- [ ] **Step 1: Create the test file with failing tests**

  Create `src/engine/__tests__/scenarioEngine.test.ts`:

  ```typescript
  import { applyChoice, getTone } from '../scenarioEngine';
  import type { ScenarioState, ScenarioChoice, ScenarioScene } from '../../types';

  // ─── Shared test fixtures ─────────────────────────────────────────────────────

  function makeEmptyState(scenarioId = 'test-scenario', sceneId = 'scene-1'): ScenarioState {
    return {
      scenarioId,
      currentSceneId: sceneId,
      flags: new Set(),
      impactByNpc: {},
      totalScore: 0,
      choiceHistory: [],
      scenesVisited: new Set([sceneId]),
      startedAt: '2026-01-01T00:00:00.000Z',
    };
  }

  function makeChoice(overrides: Partial<ScenarioChoice> = {}): ScenarioChoice {
    return {
      id: 'choice-1',
      text: 'Hello',
      arabic: 'مرحبا',
      roman: 'marhaba',
      score: 5,
      outcome: 'good',
      impact: { trust: 2, respect: 1, culture: 0 },
      ...overrides,
    };
  }

  function makeScene(overrides: Partial<ScenarioScene> = {}): ScenarioScene {
    return {
      id: 'scene-1',
      charName: 'Ahmed',
      charGender: 'male',
      setting: 'Office lobby',
      arabic: 'أهلا',
      roman: 'ahlan',
      english: 'Welcome',
      choices: [],
      ...overrides,
    };
  }

  // ─── applyChoice ─────────────────────────────────────────────────────────────

  describe('applyChoice', () => {
    it('adds the choice score to totalScore', () => {
      const state = makeEmptyState();
      const choice = makeChoice({ score: 7 });
      const next = applyChoice(state, choice, 'Ahmed');
      expect(next.totalScore).toBe(7);
    });

    it('accumulates scores across multiple choices', () => {
      const state = makeEmptyState();
      const c1 = makeChoice({ id: 'c1', score: 5 });
      const c2 = makeChoice({ id: 'c2', score: 3 });
      const after1 = applyChoice(state, c1, 'Ahmed');
      const after2 = applyChoice(after1, c2, 'Ahmed');
      expect(after2.totalScore).toBe(8);
    });

    it('accumulates impact per NPC', () => {
      const state = makeEmptyState();
      const choice = makeChoice({ impact: { trust: 2, respect: 1, culture: 3 } });
      const next = applyChoice(state, choice, 'Sara');
      expect(next.impactByNpc['Sara']).toEqual({ trust: 2, respect: 1, culture: 3 });
    });

    it('sums impact for the same NPC across multiple choices', () => {
      const state = makeEmptyState();
      const c1 = makeChoice({ id: 'c1', impact: { trust: 1, respect: 0, culture: 2 } });
      const c2 = makeChoice({ id: 'c2', impact: { trust: -1, respect: 2, culture: 1 } });
      const after1 = applyChoice(state, c1, 'Ahmed');
      const after2 = applyChoice(after1, c2, 'Ahmed');
      expect(after2.impactByNpc['Ahmed']).toEqual({ trust: 0, respect: 2, culture: 3 });
    });

    it('tracks impact independently per NPC', () => {
      const state = makeEmptyState();
      const c1 = makeChoice({ id: 'c1', impact: { trust: 3, respect: 0, culture: 0 } });
      const c2 = makeChoice({ id: 'c2', impact: { trust: 0, respect: 2, culture: 1 } });
      const after1 = applyChoice(state, c1, 'Ahmed');
      const after2 = applyChoice(after1, c2, 'Sara');
      expect(after2.impactByNpc['Ahmed']).toEqual({ trust: 3, respect: 0, culture: 0 });
      expect(after2.impactByNpc['Sara']).toEqual({ trust: 0, respect: 2, culture: 1 });
    });

    it('sets a flag when the choice carries one', () => {
      const state = makeEmptyState();
      const choice = makeChoice({ flag: 'GREETED_IN_DIALECT' });
      const next = applyChoice(state, choice, 'Ahmed');
      expect(next.flags.has('GREETED_IN_DIALECT')).toBe(true);
    });

    it('does not mutate the original state', () => {
      const state = makeEmptyState();
      const choice = makeChoice({ score: 10, flag: 'TEST_FLAG' });
      applyChoice(state, choice, 'Ahmed');
      expect(state.totalScore).toBe(0);
      expect(state.flags.size).toBe(0);
    });

    it('appends a record to choiceHistory', () => {
      const state = makeEmptyState();
      const choice = makeChoice({ id: 'choice-99' });
      const next = applyChoice(state, choice, 'Ahmed');
      expect(next.choiceHistory).toHaveLength(1);
      expect(next.choiceHistory[0].choiceId).toBe('choice-99');
      expect(next.choiceHistory[0].npcId).toBe('Ahmed');
      expect(next.choiceHistory[0].sceneId).toBe('scene-1');
    });

    it('handles a choice with no impact gracefully (impact defaults to 0s)', () => {
      const state = makeEmptyState();
      const choice = makeChoice({ impact: undefined });
      const next = applyChoice(state, choice, 'Ahmed');
      expect(next.impactByNpc['Ahmed']).toEqual({ trust: 0, respect: 0, culture: 0 });
    });
  });

  // ─── getTone ─────────────────────────────────────────────────────────────────

  describe('getTone', () => {
    it('returns neutral when scene has no charDialogue', () => {
      const state = makeEmptyState();
      const scene = makeScene(); // no charDialogue
      expect(getTone(state, 'Ahmed', scene)).toBe('neutral');
    });

    it('returns warm when totalScore meets warmThreshold', () => {
      const state = { ...makeEmptyState(), totalScore: 15 };
      const scene = makeScene({
        warmThreshold: 15,
        coldThreshold: 5,
        charDialogue: {
          warm: { arabic: 'a', roman: 'a', english: 'a' },
          neutral: { arabic: 'b', roman: 'b', english: 'b' },
          cold: { arabic: 'c', roman: 'c', english: 'c' },
        },
      });
      expect(getTone(state, 'Ahmed', scene)).toBe('warm');
    });

    it('returns cold when totalScore is below coldThreshold', () => {
      const state = { ...makeEmptyState(), totalScore: 4 };
      const scene = makeScene({
        warmThreshold: 15,
        coldThreshold: 5,
        charDialogue: {
          warm: { arabic: 'a', roman: 'a', english: 'a' },
          neutral: { arabic: 'b', roman: 'b', english: 'b' },
          cold: { arabic: 'c', roman: 'c', english: 'c' },
        },
      });
      expect(getTone(state, 'Ahmed', scene)).toBe('cold');
    });

    it('returns neutral when score is between cold and warm thresholds', () => {
      const state = { ...makeEmptyState(), totalScore: 10 };
      const scene = makeScene({
        warmThreshold: 15,
        coldThreshold: 5,
        charDialogue: {
          warm: { arabic: 'a', roman: 'a', english: 'a' },
          neutral: { arabic: 'b', roman: 'b', english: 'b' },
          cold: { arabic: 'c', roman: 'c', english: 'c' },
        },
      });
      expect(getTone(state, 'Ahmed', scene)).toBe('neutral');
    });
  });
  ```

- [ ] **Step 2: Run tests — confirm they fail with "Cannot find module"**

  Run: `npm test`
  Expected: FAIL — `Cannot find module '../scenarioEngine'`

### 3b — Implement `applyChoice` and `getTone`

- [ ] **Step 3: Create `src/engine/scenarioEngine.ts` with the two functions**

  Create `src/engine/scenarioEngine.ts`:

  ```typescript
  import type {
    ScenarioState,
    ScenarioChoice,
    ScenarioScene,
    ScenarioScript,
    ScenarioEnding,
    Tone,
    ImpactDelta,
  } from '../types';

  // ─── applyChoice ─────────────────────────────────────────────────────────────
  /**
   * Given the current run state and a choice the user just made, returns a new
   * ScenarioState with:
   *  - the choice's flag added to flags (if it has one)
   *  - the choice's impact merged into impactByNpc[npcId]
   *  - choice.score added to totalScore
   *  - a new record appended to choiceHistory
   *
   * Pure: does not mutate state.
   */
  export function applyChoice(
    state: ScenarioState,
    choice: ScenarioChoice,
    npcId: string,
  ): ScenarioState {
    const prev: ImpactDelta = state.impactByNpc[npcId] ?? { trust: 0, respect: 0, culture: 0 };
    const delta = choice.impact ?? { trust: 0, respect: 0, culture: 0 };

    const newFlags = new Set(state.flags);
    if (choice.flag) newFlags.add(choice.flag);

    return {
      ...state,
      flags: newFlags,
      totalScore: state.totalScore + choice.score,
      impactByNpc: {
        ...state.impactByNpc,
        [npcId]: {
          trust: prev.trust + delta.trust,
          respect: prev.respect + delta.respect,
          culture: prev.culture + delta.culture,
        },
      },
      choiceHistory: [
        ...state.choiceHistory,
        {
          sceneId: state.currentSceneId,
          choiceId: choice.id,
          npcId,
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }

  // ─── getTone ─────────────────────────────────────────────────────────────────
  /**
   * Determines NPC warmth for a scene based on accumulated totalScore.
   * totalScore (sum of choice.score) is used — not the T/R/C impact sum —
   * because script authors write warmThreshold/coldThreshold against choice.score.
   *
   * Returns 'neutral' if the scene has no charDialogue variants defined.
   */
  export function getTone(
    state: ScenarioState,
    _npcId: string,
    scene: ScenarioScene,
  ): Tone {
    if (!scene.charDialogue) return 'neutral';
    const score = state.totalScore;
    if (scene.warmThreshold !== undefined && score >= scene.warmThreshold) return 'warm';
    if (scene.coldThreshold !== undefined && score < scene.coldThreshold) return 'cold';
    return 'neutral';
  }
  ```

- [ ] **Step 4: Run tests — all should pass**

  Run: `npm test`
  Expected: `Tests: 13 passed`

- [ ] **Step 5: Commit**

  ```bash
  git add src/engine/scenarioEngine.ts src/engine/__tests__/scenarioEngine.test.ts
  git commit -m "feat(engine): add applyChoice and getTone with full test coverage"
  ```

---

## Task 4: Engine — `resolveNextScene`, `evaluateEnding`, `isChoiceVisible`

**Files:**
- Modify: `src/engine/__tests__/scenarioEngine.test.ts` (append tests)
- Modify: `src/engine/scenarioEngine.ts` (append functions)

### 4a — Write failing tests

- [ ] **Step 1: Append tests to `src/engine/__tests__/scenarioEngine.test.ts`**

  Add the following after the existing `getTone` describe block:

  ```typescript
  import { resolveNextScene, evaluateEnding, isChoiceVisible } from '../scenarioEngine';
  import type { ScenarioScript, ScenarioEnding } from '../../types';

  // ─── Shared script fixture ────────────────────────────────────────────────────

  function makeScript(overrides: Partial<ScenarioScript> = {}): ScenarioScript {
    return {
      id: 'test-scenario',
      title: 'Test Scenario',
      scenes: [
        { ...makeScene(), id: 'scene-1', choices: [makeChoice()] },
        { ...makeScene(), id: 'scene-2', choices: [makeChoice()] },
        { ...makeScene(), id: 'scene-3', choices: [makeChoice()] },
      ],
      endings: [
        { min: 20, title: 'Exceptional', arabic: 'ممتاز', roman: 'mumtaz', en: 'Exceptional', desc: 'Excellent outcome', color: '#00FF00', type: 'exceptional' },
        { min: 10, title: 'Good',        arabic: 'جيد',   roman: 'jayid',  en: 'Good',        desc: 'Good outcome',      color: '#FFFF00', type: 'success'     },
        { min: 0,  title: 'Mixed',       arabic: 'مقبول', roman: 'maqbul', en: 'Mixed',       desc: 'Mixed outcome',     color: '#FFA500', type: 'mixed'       },
        { min: -99,title: 'Failed',      arabic: 'فشل',   roman: 'fashal', en: 'Failed',      desc: 'Failed outcome',    color: '#FF0000', type: 'failed'      },
      ],
      ...overrides,
    };
  }

  // ─── resolveNextScene ─────────────────────────────────────────────────────────

  describe('resolveNextScene', () => {
    it('returns choice.next when the choice specifies an explicit branch', () => {
      const state = { ...makeEmptyState(), currentSceneId: 'scene-1' };
      const choice = makeChoice({ next: 'scene-3' });
      const script = makeScript();
      expect(resolveNextScene(state, choice, script)).toBe('scene-3');
    });

    it('returns the next scene in order when choice has no next', () => {
      const state = { ...makeEmptyState(), currentSceneId: 'scene-1' };
      const choice = makeChoice({ next: undefined });
      const script = makeScript();
      expect(resolveNextScene(state, choice, script)).toBe('scene-2');
    });

    it('returns null when on the last scene and choice has no next', () => {
      const state = { ...makeEmptyState(), currentSceneId: 'scene-3' };
      const choice = makeChoice({ next: undefined });
      const script = makeScript();
      expect(resolveNextScene(state, choice, script)).toBeNull();
    });
  });

  // ─── evaluateEnding ───────────────────────────────────────────────────────────

  describe('evaluateEnding', () => {
    it('returns exceptional ending when totalScore is 20+', () => {
      const state = { ...makeEmptyState(), totalScore: 22 };
      const ending = evaluateEnding(state, makeScript());
      expect(ending.type).toBe('exceptional');
    });

    it('returns success ending when totalScore is 10-19', () => {
      const state = { ...makeEmptyState(), totalScore: 12 };
      const ending = evaluateEnding(state, makeScript());
      expect(ending.type).toBe('success');
    });

    it('returns mixed ending when totalScore is 0-9', () => {
      const state = { ...makeEmptyState(), totalScore: 4 };
      const ending = evaluateEnding(state, makeScript());
      expect(ending.type).toBe('mixed');
    });

    it('falls back to last ending when no standard ending matches', () => {
      // totalScore below all non-secret min values
      const state = { ...makeEmptyState(), totalScore: -50 };
      const ending = evaluateEnding(state, makeScript());
      expect(ending.type).toBe('failed');
    });

    it('returns secret ending when requiredFlags met AND score >= min', () => {
      const state = {
        ...makeEmptyState(),
        totalScore: 25,
        flags: new Set(['FLAG_A', 'FLAG_B']),
      };
      const script = makeScript({
        endings: [
          ...makeScript().endings,
          {
            min: 20, title: 'Secret', arabic: 'سري', roman: 'sirri', en: 'Secret',
            desc: 'Rare ending', color: '#8B00FF', type: 'exceptional',
            secret: true, requiredFlags: ['FLAG_A', 'FLAG_B'],
          },
        ],
      });
      const ending = evaluateEnding(state, script);
      expect(ending.secret).toBe(true);
      expect(ending.title).toBe('Secret');
    });

    it('does NOT return secret ending when requiredFlags not all set', () => {
      const state = {
        ...makeEmptyState(),
        totalScore: 25,
        flags: new Set(['FLAG_A']), // FLAG_B missing
      };
      const script = makeScript({
        endings: [
          ...makeScript().endings,
          {
            min: 20, title: 'Secret', arabic: 'سري', roman: 'sirri', en: 'Secret',
            desc: 'Rare ending', color: '#8B00FF', type: 'exceptional',
            secret: true, requiredFlags: ['FLAG_A', 'FLAG_B'],
          },
        ],
      });
      const ending = evaluateEnding(state, script);
      expect(ending.secret).not.toBe(true);
    });

    it('does NOT return secret ending when score is below secret min', () => {
      const state = {
        ...makeEmptyState(),
        totalScore: 15, // below secret min of 20
        flags: new Set(['FLAG_A', 'FLAG_B']),
      };
      const script = makeScript({
        endings: [
          ...makeScript().endings,
          {
            min: 20, title: 'Secret', arabic: 'سري', roman: 'sirri', en: 'Secret',
            desc: 'Rare ending', color: '#8B00FF', type: 'exceptional',
            secret: true, requiredFlags: ['FLAG_A', 'FLAG_B'],
          },
        ],
      });
      const ending = evaluateEnding(state, script);
      expect(ending.secret).not.toBe(true);
    });
  });

  // ─── isChoiceVisible ─────────────────────────────────────────────────────────

  describe('isChoiceVisible', () => {
    it('returns true for any choice (all choices visible in current implementation)', () => {
      const state = makeEmptyState();
      const choice = makeChoice();
      expect(isChoiceVisible(choice, state)).toBe(true);
    });
  });
  ```

- [ ] **Step 2: Run tests — confirm new tests fail**

  Run: `npm test`
  Expected: FAIL — `resolveNextScene is not a function` (and similar for the others)

### 4b — Implement the three remaining functions

- [ ] **Step 3: Append three functions to `src/engine/scenarioEngine.ts`**

  Add after the `getTone` function:

  ```typescript
  // ─── resolveNextScene ─────────────────────────────────────────────────────────
  /**
   * Returns the ID of the next scene to navigate to.
   * Priority: choice.next (explicit branch) → next scene in script array → null (end of script).
   */
  export function resolveNextScene(
    state: ScenarioState,
    choice: ScenarioChoice,
    script: ScenarioScript,
  ): string | null {
    if (choice.next) return choice.next;
    const idx = script.scenes.findIndex(s => s.id === state.currentSceneId);
    return script.scenes[idx + 1]?.id ?? null;
  }

  // ─── evaluateEnding ───────────────────────────────────────────────────────────
  /**
   * Determines which ending the player earned.
   * Secret endings are checked first (most restrictive).
   * Standard endings are checked in descending min-score order.
   * Falls back to the last ending in the array if nothing matches.
   */
  export function evaluateEnding(
    state: ScenarioState,
    script: ScenarioScript,
  ): ScenarioEnding {
    const score = state.totalScore;

    // Check secret endings first
    for (const ending of script.endings.filter(e => e.secret)) {
      const flagsMet = (ending.requiredFlags ?? []).every(f => state.flags.has(f));
      if (flagsMet && score >= ending.min) return ending;
    }

    // Standard endings — highest min wins
    const standard = [...script.endings]
      .filter(e => !e.secret)
      .sort((a, b) => b.min - a.min);

    return standard.find(e => score >= e.min) ?? standard[standard.length - 1];
  }

  // ─── isChoiceVisible ─────────────────────────────────────────────────────────
  /**
   * All choices are visible in the current build.
   * Butterfly effect is expressed through consequences, not by hiding options.
   * Reserved for flag-gated choices in a future iteration.
   */
  export function isChoiceVisible(
    _choice: ScenarioChoice,
    _state: ScenarioState,
  ): boolean {
    return true;
  }
  ```

- [ ] **Step 4: Run all tests — all should pass**

  Run: `npm test`
  Expected: `Tests: 26 passed` (13 from Task 3 + 13 new)

- [ ] **Step 5: Commit**

  ```bash
  git add src/engine/scenarioEngine.ts src/engine/__tests__/scenarioEngine.test.ts
  git commit -m "feat(engine): add resolveNextScene, evaluateEnding, isChoiceVisible with tests"
  ```

---

## Task 5: Add `activeScenarioState` to Zustand Store

**Files:**
- Modify: `src/store/useAppStore.ts`

- [ ] **Step 1: Read `src/store/useAppStore.ts` to confirm current structure**

  Confirm that the file imports from `'../types'` at line 25 and that `AppState` interface ends around line 226.

- [ ] **Step 2: Add engine import at the top of the file**

  After the existing imports block (after line 28 `import { PHRASES, PHRASE_CATEGORIES } from '../constants/phrases';`), add:

  ```typescript
  import {
    applyChoice as applyChoiceEngine,
    resolveNextScene,
    evaluateEnding,
  } from '../engine/scenarioEngine';
  import type { ScenarioState, ScenarioChoice, ScenarioScript, ScenarioEnding } from '../types';
  ```

  Also update the existing `import type` line (line 25) to include `ScenarioState`:
  ```typescript
  import type { UserProfile, UserStats, PhraseReviewData, JournalEntry, LearningMilestone, PhraseCategory, SubscriptionStatus, ScenarioState } from '../types';
  ```
  Wait — `ScenarioState` is already imported in the engine import above. Remove it from the line above (keep in the engine import). The existing line 25 stays as-is:
  ```typescript
  import type { UserProfile, UserStats, PhraseReviewData, JournalEntry, LearningMilestone, PhraseCategory, SubscriptionStatus } from '../types';
  ```

- [ ] **Step 3: Add `activeScenarioState` to the `AppState` interface**

  In `src/store/useAppStore.ts`, find the `interface AppState` block (around line 132). Add the following block after the existing `// Computed helpers` section (after `getDueReviews` around line 225), before the closing `}`:

  ```typescript
  // ─── Active scenario run (not persisted) ─────────────────────────────────────
  activeScenarioState: ScenarioState | null;
  startScenario: (scenarioId: string, firstSceneId: string) => void;
  applyScenarioChoice: (choice: ScenarioChoice, npcId: string) => void;
  advanceScenarioScene: (nextSceneId: string) => void;
  finalizeScenario: (ending: ScenarioEnding) => void;
  abandonScenario: () => void;
  ```

  > **Note:** The store actions are named `applyScenarioChoice` and `advanceScenarioScene` (not `applyChoice`/`advanceScene`) to avoid collision with the engine functions imported above.

- [ ] **Step 4: Add `activeScenarioState` default value in the store body**

  In the `create<AppState>()(persist((set, get) => ({` block, after the `unlockedPhraseIds: [],` line (around line 252), add:

  ```typescript
  activeScenarioState: null,
  ```

- [ ] **Step 5: Add the five store actions**

  In the store body, after the `getDueReviews: () => {` block (around line 639), add the following before the closing `}),` of the main object:

  ```typescript
  // ─── Active scenario run ────────────────────────────────────────────────────
  startScenario: (scenarioId, firstSceneId) =>
    set({
      activeScenarioState: {
        scenarioId,
        currentSceneId: firstSceneId,
        flags: new Set<string>(),
        impactByNpc: {},
        totalScore: 0,
        choiceHistory: [],
        scenesVisited: new Set<string>([firstSceneId]),
        startedAt: new Date().toISOString(),
      },
    }),

  applyScenarioChoice: (choice, npcId) =>
    set(s => ({
      activeScenarioState: s.activeScenarioState
        ? applyChoiceEngine(s.activeScenarioState, choice, npcId)
        : null,
    })),

  advanceScenarioScene: (nextSceneId) =>
    set(s => {
      if (!s.activeScenarioState) return {};
      const visited = new Set(s.activeScenarioState.scenesVisited);
      visited.add(nextSceneId);
      return {
        activeScenarioState: {
          ...s.activeScenarioState,
          currentSceneId: nextSceneId,
          scenesVisited: visited,
        },
      };
    }),

  finalizeScenario: (ending) =>
    set(s => {
      if (!s.activeScenarioState) return {};
      const { scenarioId } = s.activeScenarioState;
      return {
        completedScenarios: {
          ...s.completedScenarios,
          [scenarioId]: {
            endingType: ending.type,
            date: new Date().toISOString(),
          },
        },
        stats: {
          ...s.stats,
          scenariosCompleted: [
            ...new Set([...s.stats.scenariosCompleted, scenarioId]),
          ],
        },
        activeScenarioState: null,
      };
    }),

  abandonScenario: () => set({ activeScenarioState: null }),
  ```

- [ ] **Step 6: Exclude `activeScenarioState` from persist partialize**

  In the `partialize:` block (around line 650), confirm that `activeScenarioState` is NOT listed. The field is intentionally absent — in-progress runs reset on app close. No change needed if it's already absent.

- [ ] **Step 7: Run TypeScript compile check**

  Run: `npx tsc --noEmit`
  Expected: no errors

- [ ] **Step 8: Run tests to confirm nothing broke**

  Run: `npm test`
  Expected: `Tests: 26 passed`

- [ ] **Step 9: Commit**

  ```bash
  git add src/store/useAppStore.ts
  git commit -m "feat(store): add activeScenarioState slot with 5 scenario run actions"
  ```

---

## Task 6: Refactor `ScenarioPlayer.tsx`

**Files:**
- Modify: `src/screens/ScenarioPlayer.tsx`

This is the largest task. The goal is to replace the ad-hoc local state (`score`, `impact`, `flags`, `choiceHistory`, `nextSceneId`) with `activeScenarioState` from the store and engine function calls. Local UI state (`phase`, `step`, `selectedChoiceId`, `choicesVisible`, `completionFired`, `toneHistory`) stays local.

- [ ] **Step 1: Read `src/screens/ScenarioPlayer.tsx` to confirm current state**

  Verify lines 253–265 contain:
  ```typescript
  const [phase, setPhase] = useState<Phase>('intro');
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [impact, setImpact] = useState({ trust: 0, respect: 0, culture: 0 });
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [choiceHistory, setChoiceHistory] = useState<ScenarioChoice[]>([]);
  const [choicesVisible, setChoicesVisible] = useState(false);
  const [completionFired, setCompletionFired] = useState(false);
  const [flags, setFlags] = useState<Record<string, boolean>>({ FLAG_1: false, FLAG_2: false, FLAG_3: false });
  const [nextSceneId, setNextSceneId] = useState<string | null>(null);
  const [toneHistory, setToneHistory] = useState<...>([]);
  ```

- [ ] **Step 2: Update imports**

  Replace the existing import block at lines 1–25 with the following (adds engine imports and store actions, removes `ScenarioChoice` from type imports since it's now used via engine):

  ```typescript
  import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
  import { View, Text, ScrollView, Pressable, Share } from 'react-native';
  import { useSafeAreaInsets } from 'react-native-safe-area-context';
  import { MotiView } from 'moti';
  import { X, ChevronRight, RotateCcw, Home, ArrowRight, Volume2, BookOpen, Compass, Users, CheckCircle } from 'lucide-react-native';
  import { LinearGradient } from 'expo-linear-gradient';
  import * as Haptics from 'expo-haptics';
  import {
    FONT_ARABIC, FONT_ARABIC_BLACK, FONT_LATIN, FONT_LATIN_BOLD,
    FONT_LATIN_SEMI, FONT_HEADING_SEMI,
  } from '../components/design/tokens';
  import { ANGLE_135 } from '../components/design/gradients';
  import { useTheme } from '../hooks/useTheme';
  import { useTypewriter } from '../components/design/hooks';
  import { WaveBars } from '../components/features/WaveBars';
  import { RippleEffect } from '../components/ui/RippleEffect';
  import { KafMascot } from '../components/features/KafMascot';
  import { EmptyState } from '../components/ui/EmptyState';
  import { GhostLetters } from '../components/ui';
  import { getScenarioScript, getScenarioById } from '../constants/scenarios';
  import { PHRASES } from '../constants/phrases';
  import { useAppStore } from '../store/useAppStore';
  import { useArabicTTS } from '../hooks/useArabicTTS';
  import { STRINGS } from '../constants/strings';
  import { getTone, resolveNextScene, evaluateEnding } from '../engine/scenarioEngine';
  import type { UserProfile, ScenarioChoice, ScenarioScene } from '../types';
  ```

- [ ] **Step 3: Replace store subscriptions (lines 235–238)**

  Find:
  ```typescript
  const getCommunityEndingStat = useAppStore((s) => s.getCommunityEndingStat);
  const fetchCommunityEndingStats = useAppStore((s) => s.fetchCommunityEndingStats);
  const recordChoiceStatAction = useAppStore((s) => s.recordChoiceStat);
  const user = useAppStore((s) => s.user);
  ```

  Replace with:
  ```typescript
  const getCommunityEndingStat = useAppStore((s) => s.getCommunityEndingStat);
  const fetchCommunityEndingStats = useAppStore((s) => s.fetchCommunityEndingStats);
  const recordChoiceStatAction = useAppStore((s) => s.recordChoiceStat);
  const user = useAppStore((s) => s.user);
  const activeScenarioState = useAppStore((s) => s.activeScenarioState);
  const startScenario = useAppStore((s) => s.startScenario);
  const applyScenarioChoice = useAppStore((s) => s.applyScenarioChoice);
  const advanceScenarioScene = useAppStore((s) => s.advanceScenarioScene);
  const finalizeScenario = useAppStore((s) => s.finalizeScenario);
  ```

- [ ] **Step 4: Replace local state declarations (lines 253–264)**

  Find:
  ```typescript
  const [phase, setPhase] = useState<Phase>('intro');
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [impact, setImpact] = useState({ trust: 0, respect: 0, culture: 0 });
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [choiceHistory, setChoiceHistory] = useState<ScenarioChoice[]>([]);
  const [choicesVisible, setChoicesVisible] = useState(false);
  const [completionFired, setCompletionFired] = useState(false);
  const [flags, setFlags] = useState<Record<string, boolean>>({ FLAG_1: false, FLAG_2: false, FLAG_3: false });
  const [nextSceneId, setNextSceneId] = useState<string | null>(null);
  // Tone history: records the NPC tone at the moment each scene was entered
  const [toneHistory, setToneHistory] = useState<Array<{ sceneId: string; tone: 'warm' | 'neutral' | 'cold' }>>([]);
  ```

  Replace with:
  ```typescript
  const [phase, setPhase] = useState<Phase>('intro');
  const [step, setStep] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [choicesVisible, setChoicesVisible] = useState(false);
  const [completionFired, setCompletionFired] = useState(false);
  // toneHistory is local UI state — records tone at scene entry for the end-screen arc
  const [toneHistory, setToneHistory] = useState<Array<{ sceneId: string; tone: 'warm' | 'neutral' | 'cold' }>>([]);
  // lastResolvedNextSceneId holds the branch target from the most recent choice (for next())
  const [lastResolvedNextSceneId, setLastResolvedNextSceneId] = useState<string | null>(null);
  ```

- [ ] **Step 5: Add bootstrap effect (mount → startScenario)**

  After the TTS timer cleanup effect (around line 252, after the `useEffect(() => { return () => { ... }; }, []);` block), add:

  ```typescript
  // Bootstrap: initialise (or re-initialise) the run when the component mounts
  useEffect(() => {
    if (scriptData) {
      startScenario(scenarioId, scriptData.scenes[0].id);
    }
    // Intentionally not listing startScenario / scenarioId in deps to avoid
    // re-initialising mid-run if the parent re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  ```

- [ ] **Step 6: Replace the tone-history recording effect (lines 300–312)**

  Find:
  ```typescript
  // Record NPC tone the moment each scene is entered (only for scenes with charDialogue)
  useEffect(() => {
    if (phase !== 'scene' || !scene?.charDialogue) return;
    setToneHistory(prev => {
      if (prev.some(t => t.sceneId === scene.id)) return prev;
      const entryTone: 'warm' | 'neutral' | 'cold' =
        score >= (scene.warmThreshold ?? Infinity) ? 'warm'
        : score < (scene.coldThreshold ?? -Infinity) ? 'cold'
        : 'neutral';
      return [...prev, { sceneId: scene.id, tone: entryTone }];
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, phase]);
  ```

  Replace with:
  ```typescript
  // Record NPC tone the moment each scene is entered (engine-driven)
  useEffect(() => {
    if (phase !== 'scene' || !scene?.charDialogue || !activeScenarioState) return;
    setToneHistory(prev => {
      if (prev.some(t => t.sceneId === scene.id)) return prev;
      const entryTone = getTone(activeScenarioState, scene.charName, scene);
      return [...prev, { sceneId: scene.id, tone: entryTone }];
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, phase]);
  ```

- [ ] **Step 7: Replace the result/completion effect (lines 314–332)**

  Find:
  ```typescript
  useEffect(() => {
    if (!scriptData || phase !== 'result' || completionFired) return;
    const _endings = scriptData.endings;
    const _total = impact.trust + impact.respect + impact.culture;
    const _secret = _endings.find(e => e.secret);
    const _flagsMet = !_secret?.requiredFlags ||
      _secret.requiredFlags.every(f => flags[f] === true);
    const currEnding = (_secret && _flagsMet && _total >= 20)
      ? _secret
      : _endings.find(e => !e.secret && _total >= e.min) ?? _endings[_endings.length - 1];
    setCompletionFired(true);
    const hapticType =
      currEnding.type === 'failed' ? Haptics.NotificationFeedbackType.Error
      : currEnding.type === 'mixed' ? Haptics.NotificationFeedbackType.Warning
      : Haptics.NotificationFeedbackType.Success;
    void Haptics.notificationAsync(hapticType).catch(() => {});
    onComplete?.(scenarioId, currEnding.type);
    if (currEnding.type !== 'failed') onJournalEntry?.(currEnding.arabic, currEnding.en, currEnding.desc);
  }, [phase, completionFired, scenarioId, scriptData, impact, flags, onComplete, onJournalEntry]);
  ```

  Replace with:
  ```typescript
  useEffect(() => {
    if (!scriptData || phase !== 'result' || completionFired || !activeScenarioState) return;
    const currEnding = evaluateEnding(activeScenarioState, scriptData);
    setCompletionFired(true);
    finalizeScenario(currEnding);
    const hapticType =
      currEnding.type === 'failed' ? Haptics.NotificationFeedbackType.Error
      : currEnding.type === 'mixed' ? Haptics.NotificationFeedbackType.Warning
      : Haptics.NotificationFeedbackType.Success;
    void Haptics.notificationAsync(hapticType).catch(() => {});
    onComplete?.(scenarioId, currEnding.type);
    if (currEnding.type !== 'failed') onJournalEntry?.(currEnding.arabic, currEnding.en, currEnding.desc);
  }, [phase, completionFired, scenarioId, scriptData, activeScenarioState, onComplete, onJournalEntry, finalizeScenario]);
  ```

- [ ] **Step 8: Replace `handleChoice` (lines 372–404)**

  Find:
  ```typescript
  const handleChoice = useCallback((choice: ScenarioChoice) => {
    if (selectedChoiceId || !scenes[step]) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setScore(prev => prev + choice.score);
    if (choice.impact) {
      setImpact(prev => ({
        trust: prev.trust + choice.impact!.trust,
        respect: prev.respect + choice.impact!.respect,
        culture: prev.culture + choice.impact!.culture,
      }));
    }
    // Set flag if choice has one
    if ('flag' in choice && choice.flag) {
      setFlags(prev => ({ ...prev, [choice.flag as string]: true }));
    }
    // Store next scene ID for branching (social mode scenarios)
    if (choice.next) {
      setNextSceneId(choice.next);
    } else {
      setNextSceneId(null);
    }
    setChoiceHistory(prev => [...prev, choice]);
    setSelectedChoiceId(choice.id);
    void recordChoiceStatAction(scenarioId, scenes[step].id, choice.id);
    // Transition to choice-result phase after a short delay
    setTimeout(() => {
      setPhase('choice-result');
    }, 600);
  }, [selectedChoiceId, recordChoiceStatAction, scenarioId, scenes, step]);
  ```

  Replace with:
  ```typescript
  const handleChoice = useCallback((choice: ScenarioChoice) => {
    if (selectedChoiceId || !scenes[step] || !activeScenarioState || !scriptData) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    // Apply choice to engine state (updates flags, impact, totalScore, choiceHistory)
    applyScenarioChoice(choice, scenes[step].charName);

    // Resolve next scene for branching (stored for use in next())
    const resolved = resolveNextScene(activeScenarioState, choice, scriptData);
    setLastResolvedNextSceneId(resolved);

    setSelectedChoiceId(choice.id);
    void recordChoiceStatAction(scenarioId, scenes[step].id, choice.id);
    setTimeout(() => setPhase('choice-result'), 600);
  }, [selectedChoiceId, activeScenarioState, scriptData, applyScenarioChoice, recordChoiceStatAction, scenarioId, scenes, step]);
  ```

- [ ] **Step 9: Replace `next` function (lines 406–443)**

  Find:
  ```typescript
  const next = useCallback(() => {
    setSelectedChoiceId(null);
    setNextSceneId(null);
    
    // Handle branching: if choice specified a next scene ID, navigate to it
    if (nextSceneId) {
      const targetIndex = scenes.findIndex(s => s.id === nextSceneId);
      if (targetIndex !== -1) {
        setStep(targetIndex);
        setPhase('scene');
        return;
      }
    }
    
    // Default linear progression
    const nextStep = step + 1;

    // Check if we should show bonus scene for secret ending (only if not already on it)
    const isOnBonusScene = scenes[step]?.bonus === true;
    if (!isOnBonusScene && nextStep >= scenes.length && scriptData) {
      const total = impact.trust + impact.respect + impact.culture;
      const secretEnding = scriptData.endings?.find(e => e.secret);
      const requiredFlagsMet = !secretEnding?.requiredFlags ||
        secretEnding.requiredFlags.every(f => flags[f] === true);

      if (secretEnding && requiredFlagsMet && total >= 20) {
        const bonusScene = scenes.find(s => s.bonus === true);
        if (bonusScene) {
          setStep(scenes.indexOf(bonusScene));
          setPhase('scene');
          return;
        }
      }
    }

    if (nextStep >= scenes.length) setPhase('result');
    else { setStep(nextStep); setPhase('scene'); }
  }, [step, scenes.length, flags, scriptData, scenes, impact, nextSceneId]);
  ```

  Replace with:
  ```typescript
  const next = useCallback(() => {
    setSelectedChoiceId(null);

    // Handle explicit branch from most recent choice
    if (lastResolvedNextSceneId) {
      const targetIndex = scenes.findIndex(s => s.id === lastResolvedNextSceneId);
      if (targetIndex !== -1) {
        advanceScenarioScene(lastResolvedNextSceneId);
        setStep(targetIndex);
        setLastResolvedNextSceneId(null);
        setPhase('scene');
        return;
      }
    }

    setLastResolvedNextSceneId(null);
    const nextStep = step + 1;

    // Check bonus scene eligibility for secret ending
    const isOnBonusScene = scenes[step]?.bonus === true;
    if (!isOnBonusScene && nextStep >= scenes.length && scriptData && activeScenarioState) {
      const secretEnding = scriptData.endings?.find(e => e.secret);
      const requiredFlagsMet = !secretEnding?.requiredFlags ||
        secretEnding.requiredFlags.every(f => activeScenarioState.flags.has(f));
      if (secretEnding && requiredFlagsMet && activeScenarioState.totalScore >= secretEnding.min) {
        const bonusScene = scenes.find(s => s.bonus === true);
        if (bonusScene) {
          advanceScenarioScene(bonusScene.id);
          setStep(scenes.indexOf(bonusScene));
          setPhase('scene');
          return;
        }
      }
    }

    if (nextStep >= scenes.length) {
      setPhase('result');
    } else {
      const nextScene = scenes[nextStep];
      if (nextScene) advanceScenarioScene(nextScene.id);
      setStep(nextStep);
      setPhase('scene');
    }
  }, [step, scenes, scriptData, activeScenarioState, lastResolvedNextSceneId, advanceScenarioScene]);
  ```

- [ ] **Step 10: Replace `restart` function (lines 455–466)**

  Find:
  ```typescript
  const restart = useCallback(() => {
    setPhase('intro');
    setStep(0);
    setScore(0);
    setImpact({ trust: 0, respect: 0, culture: 0 });
    setSelectedChoiceId(null);
    setChoiceHistory([]);
    setCompletionFired(false);
    setFlags({ FLAG_1: false, FLAG_2: false, FLAG_3: false });
    setNextSceneId(null);
    setToneHistory([]);
  }, []);
  ```

  Replace with:
  ```typescript
  const restart = useCallback(() => {
    if (scriptData) startScenario(scenarioId, scriptData.scenes[0].id);
    setPhase('intro');
    setStep(0);
    setSelectedChoiceId(null);
    setChoicesVisible(false);
    setCompletionFired(false);
    setToneHistory([]);
    setLastResolvedNextSceneId(null);
  }, [scriptData, scenarioId, startScenario]);
  ```

- [ ] **Step 11: Update derived values (lines 483–500)**

  Find:
  ```typescript
  const scene = scenes[step];
  // totalScore = sum of all three meters (as per guide)
  const total = impact.trust + impact.respect + impact.culture;

  // Butterfly effect: NPC tone driven by accumulated score
  const sceneTone: 'warm' | 'neutral' | 'cold' = scene?.charDialogue
    ? score >= (scene.warmThreshold ?? Infinity) ? 'warm'
      : score < (scene.coldThreshold ?? -Infinity) ? 'cold'
      : 'neutral'
    : 'neutral';

  // Determine ending — secret endings require requiredFlags + score threshold
  const secretEnding = endings.find(e => e.secret);
  const requiredFlagsMet = !secretEnding?.requiredFlags ||
    secretEnding.requiredFlags.every(f => flags[f] === true);
  const ending = (secretEnding && requiredFlagsMet && total >= 20)
    ? secretEnding
    : endings.find(e => !e.secret && total >= e.min) ?? endings[endings.length - 1];
  ```

  Replace with:
  ```typescript
  const scene = scenes[step];

  // Derive per-NPC impact totals for the ImpactBar (sum all NPCs)
  const impact = activeScenarioState
    ? Object.values(activeScenarioState.impactByNpc).reduce(
        (acc, d) => ({
          trust:   acc.trust   + d.trust,
          respect: acc.respect + d.respect,
          culture: acc.culture + d.culture,
        }),
        { trust: 0, respect: 0, culture: 0 }
      )
    : { trust: 0, respect: 0, culture: 0 };

  // Butterfly effect: NPC tone from engine (uses totalScore to match script thresholds)
  const sceneTone: 'warm' | 'neutral' | 'cold' =
    activeScenarioState && scene
      ? getTone(activeScenarioState, scene.charName, scene)
      : 'neutral';

  // Ending evaluated from engine (used only on result screen — completionFired guards double-fire)
  const ending = (activeScenarioState && scriptData)
    ? evaluateEnding(activeScenarioState, scriptData)
    : endings[endings.length - 1];

  // total for score display on result screen
  const total = impact.trust + impact.respect + impact.culture;
  ```

- [ ] **Step 12: Fix `culturalJourneyNotes` (line 361)**

  Find:
  ```typescript
  const culturalJourneyNotes = useMemo(() => choiceHistory
    .map(c => c.note)
    .filter((note): note is string => Boolean(note))
    .slice(0, 4), [choiceHistory]);
  ```

  Replace with:
  ```typescript
  const culturalJourneyNotes = useMemo(() => {
    if (!activeScenarioState || !scriptData) return [];
    return activeScenarioState.choiceHistory
      .map(({ sceneId, choiceId }) => {
        const sc = scriptData.scenes.find(s => s.id === sceneId);
        const ch = sc?.choices.find(c => c.id === choiceId);
        return ch?.note;
      })
      .filter((note): note is string => Boolean(note))
      .slice(0, 4);
  }, [activeScenarioState, scriptData]);
  ```

- [ ] **Step 13: Fix butterfly forward prediction in choice-result phase (lines 768–800)**

  Find the butterfly effect block inside choice-result:
  ```typescript
  // Respect branching: if the choice set a nextSceneId, look that scene up
  const nextIdx = nextSceneId
    ? scenes.findIndex(s => s.id === nextSceneId)
    : step + 1;
  ```

  Replace that line only with:
  ```typescript
  const nextIdx = lastResolvedNextSceneId
    ? scenes.findIndex(s => s.id === lastResolvedNextSceneId)
    : step + 1;
  ```

  Also in the same block, find:
  ```typescript
  const nextTone: 'warm' | 'neutral' | 'cold' =
    score >= (nextScene.warmThreshold ?? Infinity) ? 'warm'
    : score < (nextScene.coldThreshold ?? -Infinity) ? 'cold'
    : 'neutral';
  ```

  Replace with:
  ```typescript
  const nextTone: 'warm' | 'neutral' | 'cold' = activeScenarioState
    ? getTone(activeScenarioState, nextScene.charName, nextScene)
    : 'neutral';
  ```

- [ ] **Step 14: Verify TypeScript compiles**

  Run: `npx tsc --noEmit`
  Expected: no errors

- [ ] **Step 15: Run tests**

  Run: `npm test`
  Expected: `Tests: 26 passed` (engine tests untouched)

- [ ] **Step 16: Smoke-test in the simulator**

  Run: `expo start`
  Open a scenario. Verify:
  - Intro screen appears
  - Scenes progress, ImpactBar updates on choice
  - DialogueBubble shifts tone on a scene with charDialogue when score crosses threshold
  - Ending screen appears at end with correct ending type
  - Retry button resets to intro
  - Exit button works

- [ ] **Step 17: Commit**

  ```bash
  git add src/screens/ScenarioPlayer.tsx
  git commit -m "refactor(player): wire ScenarioPlayer to engine + store, remove ad-hoc local state"
  ```

---

## Self-Review Checklist

- [x] **Spec coverage:** All four spec sections covered — types (Task 1), engine functions (Tasks 3–4), store (Task 5), player (Task 6)
- [x] **No placeholders:** All steps contain complete code; no TBDs
- [x] **Type consistency:** `ScenarioState` defined in Task 1, used identically in Tasks 3, 5, 6. `applyChoiceEngine` alias used in store to avoid naming collision with engine's `applyChoice`. `applyScenarioChoice` / `advanceScenarioScene` store action names used consistently across Tasks 5 and 6
- [x] **Secret ending min:** `evaluateEnding` tests use `secretEnding.min` (20) consistently with the engine implementation
- [x] **`totalScore` vs impact sum:** Spec note about `score` driving tone thresholds is honoured — `getTone` uses `state.totalScore`, not the impact sum. Tests confirm this
- [x] **`activeScenarioState` null guard:** Every engine call in ScenarioPlayer guards against null activeScenarioState with `&&` checks
