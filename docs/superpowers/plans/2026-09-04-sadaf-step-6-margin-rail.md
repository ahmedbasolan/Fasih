# Sadaf Step 6 (Scenario Player + Margin Rail) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the butterfly-effect engine visible. The scenario player gains a margin rail that accretes one mark per choice, so by the end the learner can see the shape of the conversation they had — and the scenario surfaces move onto Sadaf, freeing `SceneIllustrations` and `KafMascot`.

**Architecture:** The rail is a **pure derivation**, not new state. `ScenarioState.choiceHistory` is already an ordered record of every choice, and each `ScenarioChoice` already carries an `outcome`. So `railMarks(state, script)` is a function from existing data to a render model, fully testable with no React. The renderer is deliberately dumb. Slot count is derived from the script rather than read from `Scenario.decisions`, because that metadata is authored separately and can drift — and a test asserts the two agree.

**Tech Stack:** React Native 0.8x / Expo ~56, TypeScript strict, Moti, jest + jest-expo.

**Spec:** [`docs/superpowers/specs/2026-09-03-sadaf-art-direction-design.md`](../specs/2026-09-03-sadaf-art-direction-design.md) — §5.2 is the rail, §4 the material, §7 motion.

## Global Constraints

- **Do not alter any Arabic string**, and do not add one. Content goes through `docs/language/pipeline.md`.
- **`src/engine/` stays pure** — no React, no hooks, no store access. The rail reads state; no rendering concern moves into the engine.
- No hardcoded colours (`C.TOKEN`), strings (`STRINGS`), or fonts (`FONT_*`).
- Spacing from `SPACE` / `SCREEN_MARGIN` / `RADIUS`.
- Depth budget: `SheetPanel` is the only shadow. Radius: sheet 24, pills 999, else 0.
- Icons: Lucide, 1.5 stroke.
- **Never distinguish rail marks by colour alone** — warm and cold differ in weight and fill, per the accessibility finding on the option grids.
- No `any`. **Never `git add -A`.**
- Branch off `feat/sadaf-step-7`: `git checkout feat/sadaf-step-7 && git pull && git checkout -b feat/sadaf-step-6`.
- Verify `npx tsc --noEmit` **alone**, checking `echo $?`.

---

## File Structure

**Create**

| File | Responsibility |
|---|---|
| `src/engine/marginRail.ts` | `decisionSlots` and `railMarks`. Pure. |
| `src/engine/__tests__/marginRail.test.ts` | Tests, including the metadata-drift check. |
| `src/components/scenario/MarginRail.tsx` | Renders a `RailMark[]`. No logic. |

**Modify**

| File | Change |
|---|---|
| `src/screens/ScenarioPlayer.tsx` | Mount the rail; Sadaf surfaces. |
| `src/components/scenario/ScenarioResultPhase.tsx` | Rail becomes the ending summary; drop `KafMascot`. |
| `src/components/scenario/ScenarioIntroPhase.tsx` | Drop `KafMascot` for `Companion`. |
| `src/components/scenario/ScenarioChoiceResultPhase.tsx` | Drop `KafMascot` for `Companion`. |
| `src/screens/ScenarioDetailScreen.tsx` | Drop `HeroSceneBg`; Sadaf surfaces. |

**Delete (after the above)**

`src/components/features/SceneIllustrations.tsx` (107 hex) · `src/components/features/KafMascot.tsx` (46 hex)

---

## Task 1: `decisionSlots` — how long is the track?

**Files:**
- Create: `src/engine/marginRail.ts`
- Test: `src/engine/__tests__/marginRail.test.ts`

**Interfaces:**
- Consumes: `ScenarioScript`, `ScenarioState`, `ChoiceOutcome` from `src/types`.
- Produces: `decisionSlots(script: ScenarioScript): number`.

- [ ] **Step 1: Write the failing test**

Create `src/engine/__tests__/marginRail.test.ts`:

```ts
import { decisionSlots } from '../marginRail';
import { getScenarioScripts, getAllScenarios } from '../../constants/scenarios';
import { darkTheme } from '../../components/design/tokens';
import type { ScenarioScript } from '../../types';

const scripts = getScenarioScripts();

describe('decisionSlots', () => {
  it('counts scenes that present a choice', () => {
    const script = {
      id: 't', title: 't',
      scenes: [
        { id: 's1', choices: [{ id: 'a' }, { id: 'b' }] },
        { id: 's2', choices: [] },
        { id: 's3', choices: [{ id: 'c' }] },
      ],
      endings: [],
    } as unknown as ScenarioScript;
    expect(decisionSlots(script)).toBe(2);
  });

  it('excludes bonus scenes, which only appear on the secret path', () => {
    // A bonus scene is not on everyone's route, so counting it would leave a
    // permanently unfillable slot on the rail for most learners.
    const script = {
      id: 't', title: 't',
      scenes: [
        { id: 's1', choices: [{ id: 'a' }] },
        { id: 's2', choices: [{ id: 'b' }], bonus: true },
      ],
      endings: [],
    } as unknown as ScenarioScript;
    expect(decisionSlots(script)).toBe(1);
  });

  it('is at least 1 for every shipped script', () => {
    for (const s of Object.values(scripts)) {
      expect(decisionSlots(s as ScenarioScript)).toBeGreaterThan(0);
    }
  });
});

describe('authored decision counts match their scripts', () => {
  // `Scenario.decisions` drives the browse list; `decisionSlots` drives the
  // rail. They are authored in different files and can drift. If they disagree
  // the rail will be the wrong length, so this fails rather than letting a
  // silently short track ship.
  it('every scenario with a script agrees', () => {
    const mismatches: string[] = [];
    for (const scenario of getAllScenarios(darkTheme)) {
      const script = (scripts as Record<string, ScenarioScript>)[scenario.id];
      if (!script) continue;
      const derived = decisionSlots(script);
      if (scenario.decisions !== derived) {
        mismatches.push(`${scenario.id}: metadata ${scenario.decisions}, script ${derived}`);
      }
    }
    expect(mismatches).toEqual([]);
  });
});
```

- [ ] **Step 2: Confirm the real accessor names**

Run: `grep -nE "^export (function|const) (get[A-Za-z]+Scenario|getScenarioScripts|getAllScenarios)" src/constants/scenarios.ts`
The test assumes `getScenarioScripts()` returns a record keyed by scenario id and `getAllScenarios(C)` returns `Scenario[]`. **Use the real signatures.** If `getScenarioScripts` takes an argument or returns an array, adapt the test — do not change the constants file.

- [ ] **Step 3: Run test to verify it fails**

Run: `npx jest src/engine/__tests__/marginRail.test.ts`
Expected: FAIL — `Cannot find module '../marginRail'`.

- [ ] **Step 4: Write the implementation**

Create `src/engine/marginRail.ts`:

```ts
import type { ScenarioScript, ScenarioState, ChoiceOutcome } from '../types';

/**
 * How many marks the rail's track holds.
 *
 * Derived from the script rather than read from `Scenario.decisions`, because
 * that field is authored in a different file and can drift from the content it
 * describes. The rail's length is a fact about the script; taking it from
 * metadata would mean a mis-typed number ships as a wrong-length track.
 *
 * Bonus scenes are excluded: they appear only on the secret-ending path, so
 * counting them would leave most learners with a slot that can never fill.
 */
export function decisionSlots(script: ScenarioScript): number {
  return script.scenes.filter((s) => !s.bonus && s.choices.length > 0).length;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx jest src/engine/__tests__/marginRail.test.ts`
Expected: PASS.

**If the drift test fails, do not adjust either number to make it green.** Report the mismatched scenario ids — one of the two sources is wrong about the content, and which one is a question for Ahmed.

- [ ] **Step 6: Commit**

```bash
git add src/engine/marginRail.ts src/engine/__tests__/marginRail.test.ts
git commit -m "feat(engine): decisionSlots, the margin rail's track length

Derived from the script, not from Scenario.decisions -- that field is authored
separately and can drift, and a rail whose length comes from metadata ships a
wrong-length track when the number is mistyped. A test asserts the two agree,
so drift fails loudly instead.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 2: `railMarks` — what goes in each slot

**Files:**
- Modify: `src/engine/marginRail.ts`
- Test: `src/engine/__tests__/marginRail.test.ts`

**Interfaces:**
- Consumes: `decisionSlots` from Task 1.
- Produces:

```ts
export type RailMark =
  | { state: 'filled'; outcome: ChoiceOutcome; npcId: string; sceneId: string }
  | { state: 'empty' };

export function railMarks(state: ScenarioState, script: ScenarioScript): RailMark[];
```

- [ ] **Step 1: Write the failing test**

Append to `src/engine/__tests__/marginRail.test.ts`:

```ts
import { railMarks } from '../marginRail';
import type { ScenarioState } from '../../types';

function scriptOf(outcomes: Record<string, ChoiceOutcome>): ScenarioScript {
  return {
    id: 't', title: 't', endings: [],
    scenes: [
      { id: 's1', choices: [{ id: 'a', outcome: outcomes.a }, { id: 'b', outcome: outcomes.b }] },
      { id: 's2', choices: [{ id: 'c', outcome: outcomes.c }] },
      { id: 's3', choices: [{ id: 'd', outcome: outcomes.d }] },
    ],
  } as unknown as ScenarioScript;
}

function stateOf(history: { sceneId: string; choiceId: string; npcId: string }[]): ScenarioState {
  return {
    scenarioId: 't', currentSceneId: 's1',
    flags: new Set<string>(), impactByNpc: {}, totalScore: 0, scoreByNpc: {},
    choiceHistory: history.map((h) => ({ ...h, timestamp: '2026-09-04T00:00:00Z' })),
    scenesVisited: new Set<string>(), startedAt: '2026-09-04T00:00:00Z',
  };
}

describe('railMarks', () => {
  const script = scriptOf({ a: 'excellent', b: 'bad', c: 'neutral', d: 'good' });

  it('returns one mark per slot, all empty before any choice', () => {
    const marks = railMarks(stateOf([]), script);
    expect(marks).toHaveLength(3);
    expect(marks.every((m) => m.state === 'empty')).toBe(true);
  });

  it('fills slots in the order the choices were made', () => {
    const marks = railMarks(
      stateOf([
        { sceneId: 's1', choiceId: 'b', npcId: 'Ahmed' },
        { sceneId: 's2', choiceId: 'c', npcId: 'Ahmed' },
      ]),
      script,
    );
    expect(marks[0]).toEqual({ state: 'filled', outcome: 'bad', npcId: 'Ahmed', sceneId: 's1' });
    expect(marks[1]).toEqual({ state: 'filled', outcome: 'neutral', npcId: 'Ahmed', sceneId: 's2' });
    expect(marks[2]).toEqual({ state: 'empty' });
  });

  it('keeps the track length fixed when history outruns it', () => {
    // Bonus scenes are not counted as slots but CAN be chosen on the secret
    // path. Growing the track mid-run would re-animate every mark and destroy
    // the comparability the fixed length exists for, so extra choices append.
    const marks = railMarks(
      stateOf([
        { sceneId: 's1', choiceId: 'a', npcId: 'Ahmed' },
        { sceneId: 's2', choiceId: 'c', npcId: 'Ahmed' },
        { sceneId: 's3', choiceId: 'd', npcId: 'Ahmed' },
        { sceneId: 'bonus', choiceId: 'z', npcId: 'Ahmed' },
      ]),
      script,
    );
    expect(marks).toHaveLength(4);
    expect(marks[3].state).toBe('filled');
  });

  it('falls back to neutral when a choice id is not in the script', () => {
    // Defensive: a persisted run from an older script version must not crash
    // the player. An unknown choice still occupies its slot.
    const marks = railMarks(
      stateOf([{ sceneId: 's1', choiceId: 'gone', npcId: 'Ahmed' }]),
      script,
    );
    expect(marks[0]).toEqual({ state: 'filled', outcome: 'neutral', npcId: 'Ahmed', sceneId: 's1' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/engine/__tests__/marginRail.test.ts`
Expected: FAIL — `railMarks is not a function`.

- [ ] **Step 3: Write the implementation**

Append to `src/engine/marginRail.ts`:

```ts
export type RailMark =
  | { state: 'filled'; outcome: ChoiceOutcome; npcId: string; sceneId: string }
  | { state: 'empty' };

/**
 * The rail's render model: one mark per decision, in the order they were made.
 *
 * Pure derivation from data that already exists — `choiceHistory` is ordered
 * and complete, and every choice carries an `outcome`. The engine gains no new
 * state for this; the rail simply shows what the run already recorded.
 */
export function railMarks(state: ScenarioState, script: ScenarioScript): RailMark[] {
  const slots = decisionSlots(script);

  const outcomeOf = (sceneId: string, choiceId: string): ChoiceOutcome => {
    const scene = script.scenes.find((s) => s.id === sceneId);
    const choice = scene?.choices.find((c) => c.id === choiceId);
    // A run persisted against an older script can reference a choice that no
    // longer exists. It still happened, so it keeps its slot.
    return choice?.outcome ?? 'neutral';
  };

  const filled: RailMark[] = state.choiceHistory.map((h) => ({
    state: 'filled',
    outcome: outcomeOf(h.sceneId, h.choiceId),
    npcId: h.npcId,
    sceneId: h.sceneId,
  }));

  if (filled.length >= slots) return filled;
  return [...filled, ...Array.from({ length: slots - filled.length }, () => ({ state: 'empty' as const }))];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/engine/__tests__/marginRail.test.ts`
Expected: PASS.

If `ScenarioChoice.outcome` turns out optional in `src/types/index.ts`, the `?? 'neutral'` already covers it — do not make the field required, that is content schema.

- [ ] **Step 5: Commit**

```bash
git add src/engine/marginRail.ts src/engine/__tests__/marginRail.test.ts
git commit -m "feat(engine): railMarks — the butterfly effect as a render model

Pure derivation from data the run already records: choiceHistory is ordered and
complete, and every choice carries an outcome. The engine gains no state for
this -- the rail shows what was always there and never rendered.

Extra choices append rather than growing the track: bonus scenes are not slots
but can be chosen, and resizing mid-run would re-animate every mark and destroy
the comparability a fixed length exists for.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 3: `MarginRail` — the renderer

**Files:**
- Create: `src/components/scenario/MarginRail.tsx`

**Interfaces:**
- Consumes: `RailMark` from Task 2.
- Produces: `MarginRail({ marks }: { marks: RailMark[] })`.

- [ ] **Step 1: Write the component**

Create `src/components/scenario/MarginRail.tsx`:

```tsx
import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import type { RailMark } from '../../engine/marginRail';
import { SPACE } from '../design/spacing';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  marks: RailMark[];
}

const UNIT = 8;

/**
 * The margin rail — the scenario's consequence, made visible.
 *
 * One mark per decision, accreted in order down the leading edge of the page.
 * By the end you can see the shape of the conversation you had: where it ran
 * warm, where it turned.
 *
 * Warm and cold marks differ in FILL and WIDTH, not only in colour. A rail read
 * by hue alone would be unreadable to a colour-blind learner, and this is the
 * one surface in the app whose entire job is being read at a glance.
 */
export function MarginRail({ marks }: Props) {
  const { C } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        rail: { width: UNIT * 2, alignItems: 'center', gap: SPACE.sm, paddingVertical: SPACE.md },
        track: { position: 'absolute', top: 0, bottom: 0, width: StyleSheet.hairlineWidth, backgroundColor: C.BORDER },
        empty: { width: UNIT, height: UNIT, borderWidth: 1, borderColor: C.BORDER2, backgroundColor: 'transparent' },
        // Filled marks: a strong choice is wider and solid, a weak one is
        // narrow and hollow. Shape carries the reading; colour reinforces it.
        excellent: { width: UNIT * 2, height: UNIT, backgroundColor: C.PRIMARY },
        good: { width: UNIT * 1.5, height: UNIT, backgroundColor: C.PRIMARY },
        neutral: { width: UNIT, height: UNIT, backgroundColor: C.TEXT3 },
        bad: { width: UNIT * 2, height: UNIT, borderWidth: 1, borderColor: C.ERROR, backgroundColor: 'transparent' },
      }),
    [C],
  );

  const styleFor = (m: RailMark) => {
    if (m.state === 'empty') return styles.empty;
    switch (m.outcome) {
      case 'excellent': return styles.excellent;
      case 'good': return styles.good;
      case 'bad': return styles.bad;
      default: return styles.neutral;
    }
  };

  return (
    <View style={styles.rail} accessibilityElementsHidden importantForAccessibility="no">
      <View style={styles.track} />
      {marks.map((m, i) => (
        <View key={i} style={styleFor(m)} />
      ))}
    </View>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`, `echo $?` — expected 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/scenario/MarginRail.tsx
git commit -m "feat(scenario): MarginRail renderer

Deliberately dumb -- it maps a RailMark[] to views and holds no logic, because
all of it is tested in engine/marginRail.

Marks differ in fill and width, not only colour. This is the one surface whose
entire job is being read at a glance, so hue alone would be the wrong encoding.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 4: Mount the rail in the player

**Files:**
- Modify: `src/screens/ScenarioPlayer.tsx`

- [ ] **Step 1: Read the file first**

`ScenarioPlayer.tsx` is ~785 lines. Read it before editing and locate: where `activeScenarioState` is read from the store, where the scene body renders, and the choice list.

- [ ] **Step 2: Mount it**

Wrap the scene body in a row with the rail on the leading edge:

```tsx
const marks = useMemo(
  () => (state && script ? railMarks(state, script) : []),
  [state, script],
);
```

```tsx
<View style={{ flexDirection: 'row', paddingHorizontal: SCREEN_MARGIN }}>
  <MarginRail marks={marks} />
  <View style={{ flex: 1, minWidth: 0 }}>
    {/* existing scene content */}
  </View>
</View>
```

Use the real names the file already uses for the state and script — do not rename them.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`, `echo $?` — expected 0. Run `npx jest` — expected pass.

- [ ] **Step 4: Commit**

```bash
git add src/screens/ScenarioPlayer.tsx
git commit -m "feat(scenario): mount the margin rail in the player

The engine has tracked per-NPC impact and flag-gated branching since it was
written, and the interface rendered none of it. The rail is the first surface
that shows a run its own shape as it happens.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 5: The rail as the ending summary

**Files:**
- Modify: `src/components/scenario/ScenarioResultPhase.tsx`

- [ ] **Step 1: Replace the three-bar readout**

The result phase currently shows Trust/Respect/Culture bars. Put the completed rail above them, horizontally, as the primary payload — this is the moment the shape of the conversation is the point. Keep the three bars beneath it: the rail shows *shape*, the bars show *totals*, and they answer different questions.

Render the rail horizontally here by wrapping it in a `View` with `transform: [{ rotate: '90deg' }]`, or add an `orientation?: 'vertical' | 'horizontal'` prop to `MarginRail` and switch `flexDirection`. **Prefer the prop** — a rotate transform breaks layout measurement and accessibility ordering.

- [ ] **Step 2: Drop `KafMascot`**

Replace `<KafMascot size="xs" />` with `<Companion size={32} />` and remove the import.

- [ ] **Step 3: Verify and commit**

Run: `npx tsc --noEmit`, `echo $?` — 0. `npx jest` — pass.

```bash
git add src/components/scenario/ScenarioResultPhase.tsx src/components/scenario/MarginRail.tsx
git commit -m "feat(scenario): the rail is the ending summary

Shape above totals. The three bars say how it went; the rail says what you did,
in order, and where it turned -- which is the thing no flashcard app can copy.

Horizontal via an orientation prop rather than a rotate transform: rotation
breaks layout measurement and accessibility ordering.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 6: Retire the last mascot and scene art

**Files:**
- Modify: `src/components/scenario/ScenarioIntroPhase.tsx`, `ScenarioChoiceResultPhase.tsx`, `src/screens/ScenarioDetailScreen.tsx`
- Delete: `src/components/features/KafMascot.tsx`, `src/components/features/SceneIllustrations.tsx`

- [ ] **Step 1: Swap the two remaining mascot sites**

In both phase files, replace `<KafMascot size="xs" />` with `<Companion size={32} />` and drop the import.

- [ ] **Step 2: Drop `HeroSceneBg`**

`ScenarioDetailScreen.tsx` imports `HeroSceneBg` from `SceneIllustrations`. Remove it and give the hero a `ScreenHeader` instead, matching what Sentence Builder's list step now does.

- [ ] **Step 3: Prove both files are orphaned, then delete**

Run: `grep -rn "KafMascot\|SceneIllustrations\|HeroSceneBg" src app --include=*.tsx --include=*.ts | grep -v "features/KafMascot.tsx\|features/SceneIllustrations.tsx"`
Expected: only the comment in `src/components/ui/Companion.tsx`, which mentions `KafMascot` in prose. **If any import remains, stop** — onboarding (step 5) may still hold one.

```bash
git rm src/components/features/KafMascot.tsx src/components/features/SceneIllustrations.tsx
```

Update `src/components/ui/Companion.tsx`'s doc comment: it currently says `KafMascot.tsx is deliberately left on disk, unimported, for that day.` That stops being true. Replace with a note that the seam remains the single place to reintroduce a character, and that the old art is recoverable from git history.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`, `echo $?` — 0. `npx jest` — pass.
Run: `grep -rnoE "#[0-9A-Fa-f]{6}\b" src app --include=*.tsx --include=*.ts | grep -v "design/tokens.ts\|design/gradients.ts\|__tests__" | wc -l`
Expected: **51**, down from 204 — the 153 literals in those two files.

- [ ] **Step 5: Commit**

```bash
git add src/components/scenario/ScenarioIntroPhase.tsx src/components/scenario/ScenarioChoiceResultPhase.tsx src/screens/ScenarioDetailScreen.tsx src/components/ui/Companion.tsx
git commit -m "refactor(scenario): retire KafMascot and SceneIllustrations

The last five call sites are gone, so 153 hardcoded hex literals go with them.
Product-code hex debt 204 to 51.

Companion's comment is corrected: the files are no longer on disk, and the seam
rather than the artefact is what makes reintroducing a character cheap. The art
itself is in git history.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 7: PR

- [ ] **Step 1: Clean-tree verification**

```bash
git stash push -u -m "pre-verify"
npx tsc --noEmit; echo "TSC: $?"
npx jest
npx eslint src app --ext .ts,.tsx
git stash pop
```

- [ ] **Step 2: Open against `feat/sadaf-step-7`**

If that branch has merged, target its base instead. Describe the rail as the emphasis moment, state the new hex count, and say plainly that the rail is new interaction design that may need iteration on device — it is the one thing in this branch that has never been seen running.

---

## Self-Review

**Spec coverage.** §5.2 the rail → Tasks 1–5. §6 `MarginRail` → Task 3. Step 6's mascot and scene-art retirement → Task 6. The scenario surfaces' Sadaf restyle is folded into Tasks 4–6 rather than given its own task, because it is the same edits.

**Placeholder scan.** No TBD. Tasks 4 and 5 give instructions rather than complete file bodies because `ScenarioPlayer.tsx` is 785 lines and `ScenarioResultPhase.tsx` 355 — reproducing them would invite trusting the plan over the file. Both open with "read the file first".

**Type consistency.** `RailMark` is defined once in Task 2 and consumed with that exact shape in Task 3. `decisionSlots(script)` and `railMarks(state, script)` keep their signatures across Tasks 1, 2 and 4.

**Two risks.**
1. The drift test in Task 1 may fail on existing content. That is a finding, not a test bug — report the ids rather than adjusting either number.
2. The rail is the only part of this branch that is genuinely new interaction design. Everything else is restyling with a known target. Budget for iterating it after seeing it on a device, and do not let a first draft's shape be treated as settled.
