# Onboarding Resequence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the onboarding's first reward from step 7 to step 3 so the learner stops answering seven questions in a row before the app gives them anything.

**Architecture:** Introduce a pure step-order module that names each screen and derives the routing and swipe guards from one ordered array. The four step components switch on a screen *name* instead of a numeric index, so the resequence becomes a one-line data change rather than four hand-edited switch statements. A separate pure module maps a role to phrase categories, and the role screen renders that mapping inline once a profession is picked.

**Tech Stack:** React Native 0.85 / Expo 56, TypeScript strict, Jest, Zustand, `StyleSheet.create` in `useMemo` with `useTheme()`.

**Spec:** `docs/superpowers/specs/2026-09-09-onboarding-resequence-design.md`

## Global Constraints

- **Branch:** `feat/onboarding-resequence`, stacked on `feat/onboarding-header-inset` (PR #52). Never commit to `main`, `master` or `dev`.
- **Never `git add -A` or `git add .`** — stage exact paths. The tree carries unrelated WIP (two deleted images under `assets/images/scenario_images/`, untracked `.agents/skills/`). Leave all of it alone.
- **No hardcoded colours.** Use `C.TOKEN` from `useTheme()`.
- **No hardcoded display strings.** All copy in `src/constants/strings.ts` under `STRINGS`.
- **No hardcoded fonts.** Use the `FONT_*` constants.
- **No `any`.** TypeScript strict.
- **`src/engine/` is pure** — no React, no hooks, no Zustand, no side effects.
- **Font sizes must come from the `TYPE` scale** in `src/components/design/layout.ts` — a lint test asserts no off-scale sizes.
- **Spacing must come from `SPACE`** in `src/components/design/spacing.ts`.
- **`npx tsc --noEmit` must be clean** before any task is considered done.
- **Do not touch `src/constants/scenarios.ts`.** The spec's §1 correction removed the only reason to; `scenarioContent.test.ts` enforces invariants that a naive edit would break.
- **`TOTAL` stays 12.** No screen is added or removed.

---

### Task 1: The step-order module

Names every onboarding screen and puts the order in one array. Nothing moves yet — this task only makes the *current* order explicit and testable, so Task 3 is a data edit.

**Files:**
- Create: `src/engine/onboardingSteps.ts`
- Create: `src/engine/__tests__/onboardingSteps.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type OnboardingScreen` — a string union of the twelve screen names
  - `ONBOARDING_SCREENS: readonly OnboardingScreen[]` — the order
  - `screenAt(index: number): OnboardingScreen | undefined`
  - `indexOfScreen(screen: OnboardingScreen): number`
  - `REQUIRES_INTERACTION: readonly OnboardingScreen[]`
  - `requiresInteraction(index: number): boolean`

- [ ] **Step 1: Write the failing test**

Create `src/engine/__tests__/onboardingSteps.test.ts`:

```ts
import {
  ONBOARDING_SCREENS,
  screenAt,
  indexOfScreen,
  requiresInteraction,
  REQUIRES_INTERACTION,
} from '../onboardingSteps';

describe('onboarding step order', () => {
  it('has exactly twelve screens', () => {
    // TOTAL in OnboardingFlow is 12 and this array is now the source of it.
    expect(ONBOARDING_SCREENS).toHaveLength(12);
  });

  it('names every screen uniquely', () => {
    expect(new Set(ONBOARDING_SCREENS).size).toBe(ONBOARDING_SCREENS.length);
  });

  it('round-trips a screen through its index', () => {
    for (const screen of ONBOARDING_SCREENS) {
      expect(screenAt(indexOfScreen(screen))).toBe(screen);
    }
  });

  it('returns undefined past the end rather than throwing', () => {
    expect(screenAt(ONBOARDING_SCREENS.length)).toBeUndefined();
    expect(screenAt(-1)).toBeUndefined();
  });

  it('opens on welcome and ends on the last paywall screen', () => {
    expect(ONBOARDING_SCREENS[0]).toBe('welcome');
    expect(ONBOARDING_SCREENS[ONBOARDING_SCREENS.length - 1]).toBe('paywall-plans');
  });

  it('gates the three screens that must not be swiped past', () => {
    // Swiping past an unmade choice banks a default silently. These three are
    // the screens where that would happen.
    expect([...REQUIRES_INTERACTION].sort()).toEqual(['commitment', 'mode', 'name']);
  });

  it('derives the guard from the order, so a reorder cannot desync it', () => {
    for (const screen of REQUIRES_INTERACTION) {
      expect(requiresInteraction(indexOfScreen(screen))).toBe(true);
    }
    expect(requiresInteraction(indexOfScreen('goals'))).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/engine/__tests__/onboardingSteps.test.ts`
Expected: FAIL — `Cannot find module '../onboardingSteps'`

- [ ] **Step 3: Write the implementation**

Create `src/engine/onboardingSteps.ts`:

```ts
/**
 * The onboarding flow's screen order.
 *
 * Pure data plus three lookups. No React, no theme — same contract as
 * scenarioEngine.ts.
 *
 * This exists because the order was previously spread across four `switch`
 * statements keyed on bare integers plus a hardcoded list of guarded indices
 * in the swipe gesture. Reordering meant editing all five in step, and a
 * missed guard silently banks a choice the learner never made.
 *
 * With the order here, a resequence is an edit to ONE array.
 */

export type OnboardingScreen =
  | 'welcome'
  | 'mode'
  | 'name'
  | 'role'
  | 'goals'
  | 'commitment'
  | 'notifications'
  | 'phrase'
  | 'scenario'
  | 'paywall-timeline'
  | 'paywall-features'
  | 'paywall-plans';

/**
 * The order the learner sees.
 *
 * This is the CURRENT order, recorded as-is. Task 3 changes it; nothing else
 * in the app should need editing when it does.
 */
export const ONBOARDING_SCREENS: readonly OnboardingScreen[] = [
  'welcome',
  'mode',
  'name',
  'role',
  'goals',
  'commitment',
  'notifications',
  'phrase',
  'scenario',
  'paywall-timeline',
  'paywall-features',
  'paywall-plans',
] as const;

/**
 * Screens a forward swipe must not skip.
 *
 * Named rather than indexed, so they travel with the screen when the order
 * changes. `mode` and `name` guard unmade choices that would otherwise bank a
 * default; `commitment` guards the hold that has not completed.
 */
export const REQUIRES_INTERACTION: readonly OnboardingScreen[] = [
  'mode',
  'name',
  'commitment',
] as const;

/** The screen at an index, or undefined when the index is out of range. */
export function screenAt(index: number): OnboardingScreen | undefined {
  return ONBOARDING_SCREENS[index];
}

/** The index of a screen. Total, because the union cannot name a missing screen. */
export function indexOfScreen(screen: OnboardingScreen): number {
  return ONBOARDING_SCREENS.indexOf(screen);
}

/** Whether the screen at this index requires an explicit interaction to leave. */
export function requiresInteraction(index: number): boolean {
  const screen = screenAt(index);
  return screen !== undefined && REQUIRES_INTERACTION.includes(screen);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/engine/__tests__/onboardingSteps.test.ts`
Expected: PASS, 7 tests

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no output

- [ ] **Step 6: Commit**

```bash
git add src/engine/onboardingSteps.ts src/engine/__tests__/onboardingSteps.test.ts
git commit -m "feat(onboarding): name the steps and put their order in one place"
```

---

### Task 2: Route the flow through the module

Replaces the numeric `switch` cases and the hardcoded guard indices with screen names. **The order does not change in this task** — this is a refactor whose success condition is that the app behaves identically.

**Files:**
- Modify: `src/screens/onboarding/types.ts` — add `screen` to `OnboardingStepProps`
- Modify: `src/screens/OnboardingFlow.tsx` — route and guard by screen name
- Modify: `src/screens/onboarding/ProfileSteps.tsx` — switch on `screen`
- Modify: `src/screens/onboarding/QuickWinSteps.tsx` — switch on `screen`
- Modify: `src/screens/onboarding/PaywallSteps.tsx` — switch on `screen`

**Interfaces:**
- Consumes: `OnboardingScreen`, `ONBOARDING_SCREENS`, `screenAt`, `requiresInteraction` from Task 1.
- Produces: `OnboardingStepProps.screen: OnboardingScreen`, consumed by every step component.

- [ ] **Step 1: Add `screen` to the step contract**

In `src/screens/onboarding/types.ts`, add the import and the field:

```ts
import type { OnboardingScreen } from '../../engine/onboardingSteps';
```

Then inside `OnboardingStepProps`, directly below `step: number;`:

```ts
  /**
   * Which screen this is, by name.
   *
   * `step` stays because the progress bar and the back button are genuinely
   * positional. Everything that cares about WHICH screen it is switches on
   * this instead, so reordering the flow does not touch any component.
   */
  screen: OnboardingScreen;
```

- [ ] **Step 2: Derive `TOTAL`, routing and guards from the module**

In `src/screens/OnboardingFlow.tsx`:

Add to the imports:

```ts
import {
  ONBOARDING_SCREENS,
  screenAt,
  requiresInteraction,
  indexOfScreen,
} from '../engine/onboardingSteps';
```

Replace the `TOTAL` declaration:

```ts
  // Was a hand-maintained 12 sitting next to a comment listing the order.
  const TOTAL = ONBOARDING_SCREENS.length;
```

In `stepProps`, add `screen` next to `step`:

```ts
  const screen = screenAt(step) ?? 'welcome';

  const stepProps: OnboardingStepProps = {
    step,
    screen,
    next,
    // ...everything else unchanged
```

Replace the `renderStep` switch body with a screen-name switch:

```ts
  const renderStep = () => {
    switch (screen) {
      case 'welcome':
        return <IdentityStep {...stepProps} />;

      case 'mode':
        return <ModeStep {...stepProps} />;

      case 'name':
      case 'role':
      case 'goals':
      case 'commitment':
        return <ProfileSteps {...stepProps} />;

      case 'notifications':
      case 'phrase':
      case 'scenario':
        return <QuickWinSteps {...stepProps} />;

      case 'paywall-timeline':
      case 'paywall-features':
      case 'paywall-plans':
        return <PaywallSteps {...stepProps} />;
    }
  };
```

Replace the swipe guard inside `composedGesture`'s `swipeNext`:

```ts
    const swipeNext = () => {
      // Which screens are gated lives in onboardingSteps.ts, so a reorder
      // cannot leave a guard pointing at the wrong screen.
      const current = stepRef.current;
      if (requiresInteraction(current)) {
        const s = screenAt(current);
        if (s === 'mode' && !modeChosenRef.current) return;
        if (s === 'name' && (!nameRef.current.trim() || !genderRef.current)) return;
        if (s === 'commitment' && !holdCompleteRef.current) return;
      }
      nextRef.current();
    };
```

Replace the two positional chrome conditions so they name what they mean:

```ts
        {step > 0 && step < indexOfScreen('paywall-plans') && <ProgressBar step={step} total={11} />}
```

- [ ] **Step 3: Switch the step components on `screen`**

In `src/screens/onboarding/ProfileSteps.tsx`, change the destructure and the switch:

```ts
export function ProfileSteps({ screen, next, draft, hold }: OnboardingStepProps) {
```

```ts
  switch (screen) {
    case 'name':      // was: case 2
    case 'role':      // was: case 3
    case 'goals':     // was: case 4
    case 'commitment' // was: case 5
```

Apply the same change to `QuickWinSteps.tsx` (`case 6` → `'notifications'`, `case 7` → `'phrase'`, `case 8` → `'scenario'`) and `PaywallSteps.tsx` (`case 9` → `'paywall-timeline'`, `case 10` → `'paywall-features'`, `case 11` → `'paywall-plans'`).

Each component keeps `step` in its props for anything positional; only the `switch` subject changes.

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no output. A missed case surfaces here — the `OnboardingScreen` union makes the switch exhaustive.

- [ ] **Step 5: Run the full suite**

Run: `npx jest`
Expected: all suites pass. No behaviour changed, so nothing should move.

- [ ] **Step 6: Commit**

```bash
git add src/screens/OnboardingFlow.tsx src/screens/onboarding/types.ts src/screens/onboarding/ProfileSteps.tsx src/screens/onboarding/QuickWinSteps.tsx src/screens/onboarding/PaywallSteps.tsx
git commit -m "refactor(onboarding): route and guard by screen name, not step index"
```

---

### Task 3: The resequence

The actual change. One array reorders; nothing else moves.

**Files:**
- Modify: `src/engine/onboardingSteps.ts` — the array
- Modify: `src/engine/__tests__/onboardingSteps.test.ts` — assert the new rhythm

**Interfaces:**
- Consumes: everything from Task 1, unchanged.
- Produces: no new exports. The order itself is the deliverable.

- [ ] **Step 1: Write the failing test**

Append to `src/engine/__tests__/onboardingSteps.test.ts`:

```ts
/**
 * The reason this change exists.
 *
 * Screens either ASK the learner for something or GIVE them something. The
 * flow shipped with seven consecutive asks before the first give, which is
 * what "boring to go through" described.
 */
describe('ask/give rhythm', () => {
  const GIVES: readonly string[] = ['phrase', 'scenario'];

  const firstGiveIndex = () =>
    ONBOARDING_SCREENS.findIndex(s => GIVES.includes(s));

  it('reaches the first give within three screens', () => {
    // Was 7. The scenario depends on mode and gender, so 3 is the earliest
    // legal position for it and the phrase sits immediately before it.
    expect(firstGiveIndex()).toBeLessThanOrEqual(3);
  });

  it('opens with at most two asks', () => {
    // Screen 0 is the welcome splash and asks nothing.
    expect(firstGiveIndex() - 1).toBeLessThanOrEqual(2);
  });

  it('plays the phrase immediately before the scenario', () => {
    // The phrase is the primer — hear now, earn later. It is only priming if
    // it lands first.
    expect(indexOfScreen('scenario') - indexOfScreen('phrase')).toBe(1);
  });

  it('asks for a commitment only after something has been given', () => {
    // A 2.2-second hold placed before any payoff is the flow's most demanding
    // interaction asked at its least earned moment.
    expect(indexOfScreen('commitment')).toBeGreaterThan(firstGiveIndex());
  });

  it('keeps the scenario after the two things it depends on', () => {
    // getScenarioScript takes mode; gender gates scenarios via requiresGender.
    expect(indexOfScreen('scenario')).toBeGreaterThan(indexOfScreen('mode'));
    expect(indexOfScreen('scenario')).toBeGreaterThan(indexOfScreen('name'));
  });

  it('pays the role question off on the same screen, so goals may follow it', () => {
    expect(indexOfScreen('goals')).toBeGreaterThan(indexOfScreen('role'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/engine/__tests__/onboardingSteps.test.ts`
Expected: FAIL — `expect(7).toBeLessThanOrEqual(3)` on the first-give test, plus the phrase/scenario adjacency and commitment tests.

- [ ] **Step 3: Reorder the array**

In `src/engine/onboardingSteps.ts`, replace `ONBOARDING_SCREENS` and its comment:

```ts
/**
 * The order the learner sees.
 *
 * Ordered by ask/give rhythm, not by what is convenient to collect. The flow
 * previously ran seven consecutive asks before the first give: mode, name,
 * gender, role, profession, goals, a 2.2-second hold, and a notifications
 * prompt, all before the learner was handed a single Arabic phrase.
 *
 * The phrase and the scenario now sit at 3 and 4 — the earliest legal
 * position, since the scenario needs `mode` and gender — and the profile
 * questions follow them. `role` pays itself off inline rather than banking
 * the answer for later.
 */
export const ONBOARDING_SCREENS: readonly OnboardingScreen[] = [
  'welcome',
  'mode',
  'name',
  'phrase',
  'scenario',
  'role',
  'goals',
  'commitment',
  'notifications',
  'paywall-timeline',
  'paywall-features',
  'paywall-plans',
] as const;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest src/engine/__tests__/onboardingSteps.test.ts`
Expected: PASS, 13 tests

- [ ] **Step 5: Run the full suite and typecheck**

Run: `npx jest && npx tsc --noEmit`
Expected: all suites pass, no type output. No component was edited — that is the point of Task 2.

- [ ] **Step 6: Commit**

```bash
git add src/engine/onboardingSteps.ts src/engine/__tests__/onboardingSteps.test.ts
git commit -m "feat(onboarding): move the first give from step 7 to step 3"
```

---

### Task 4: Role to phrase-category map

Pure data. The role screen collects a profession today and nothing reads it.

**Files:**
- Create: `src/engine/roleCategories.ts`
- Create: `src/engine/__tests__/roleCategories.test.ts`

**Interfaces:**
- Consumes: `PhraseCategory` from `src/types`, `PHRASES` from `src/constants/phrases`.
- Produces:
  - `ROLE_CATEGORIES: Record<string, readonly PhraseCategory[]>`
  - `categoriesForRole(roleId: string): readonly PhraseCategory[]`
  - `phraseCountForRole(roleId: string): number`

- [ ] **Step 1: Write the failing test**

Create `src/engine/__tests__/roleCategories.test.ts`:

```ts
import { ROLE_CATEGORIES, categoriesForRole, phraseCountForRole } from '../roleCategories';
import { PHRASES } from '../../constants/phrases';

// Mirrors PROFESSION_CATEGORIES in ProfileSteps.tsx. Duplicated deliberately:
// the component's list is UI data and this asserts the two agree.
const ROLE_IDS = [
  'hospitality',
  'food_beverage',
  'retail_sales',
  'health_wellness',
  'transport_logistics',
  'property_facilities',
  'office_corporate',
  'education_childcare',
];

describe('role to phrase categories', () => {
  it('maps every role the role screen offers', () => {
    for (const id of ROLE_IDS) {
      expect(Object.keys(ROLE_CATEGORIES)).toContain(id);
    }
  });

  it('maps no role the role screen does not offer', () => {
    // A stale key here renders for nobody and hides a rename.
    expect(Object.keys(ROLE_CATEGORIES).sort()).toEqual([...ROLE_IDS].sort());
  });

  it('gives every role two or three categories', () => {
    for (const id of ROLE_IDS) {
      const n = categoriesForRole(id).length;
      expect(n).toBeGreaterThanOrEqual(2);
      expect(n).toBeLessThanOrEqual(3);
    }
  });

  it('maps only to categories phrases actually carry', () => {
    const real = new Set(PHRASES.map(p => p.category));
    for (const id of ROLE_IDS) {
      for (const cat of categoriesForRole(id)) {
        expect(real.has(cat)).toBe(true);
      }
    }
  });

  it('resolves every role to a non-zero phrase count', () => {
    // The payoff screen shows this number. A role resolving to zero would
    // render an empty boast on the screen meant to prove the app listened.
    for (const id of ROLE_IDS) {
      expect(phraseCountForRole(id)).toBeGreaterThan(0);
    }
  });

  it('leads each role with a category that is not universal', () => {
    // Greetings and Everyday apply to every job, so a mapping that leads with
    // one of them is not personalisation, it is filler.
    const universal = ['Greetings', 'Everyday'];
    for (const id of ROLE_IDS) {
      expect(universal).not.toContain(categoriesForRole(id)[0]);
    }
  });

  it('returns empty for an unknown role rather than throwing', () => {
    expect(categoriesForRole('not_a_role')).toEqual([]);
    expect(phraseCountForRole('not_a_role')).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/engine/__tests__/roleCategories.test.ts`
Expected: FAIL — `Cannot find module '../roleCategories'`

- [ ] **Step 3: Write the implementation**

Create `src/engine/roleCategories.ts`:

```ts
import type { PhraseCategory } from '../types';
import { PHRASES } from '../constants/phrases';

/**
 * Which phrase categories belong to which job.
 *
 * A PRODUCT decision, not a linguistic one. This groups categories that
 * already exist; it introduces no Arabic and makes no claim about any
 * phrase's form, register or currency, so docs/language/authority.md and the
 * content pipeline are not engaged. Per CLAUDE.md rule 5, mapping a job title
 * to a set of topics is exactly the kind of call Ahmed makes.
 *
 * `Phrase` has no role or profession field, so this is the strongest honest
 * mapping available today. The stronger version — phrases tagged per
 * profession — is content work under the language authority and is out of
 * scope.
 *
 * ORDER MATTERS. The first entry is the role-distinctive category and is what
 * the screen leads with. `Greetings` (23 phrases) and `Everyday` (31) apply to
 * every job and dominate any count they appear in, so they are context and
 * never the headline. Measured across all eight roles the totals land between
 * 46 and 74 of 136 — the categories are the personalisation, the number is
 * only support.
 */
export const ROLE_CATEGORIES: Record<string, readonly PhraseCategory[]> = {
  hospitality:         ['Hospitality', 'Greetings', 'Workplace'],
  food_beverage:       ['Food & Drink', 'Hospitality', 'Greetings'],
  retail_sales:        ['Workplace', 'Gratitude', 'Greetings'],
  health_wellness:     ['Workplace', 'Everyday', 'Greetings'],
  transport_logistics: ['Gratitude', 'Everyday', 'Greetings'],
  property_facilities: ['Workplace', 'Everyday', 'Greetings'],
  office_corporate:    ['Workplace', 'Gratitude', 'Greetings'],
  education_childcare: ['Family', 'Everyday', 'Greetings'],
};

/** Categories for a role, distinctive one first. Empty for an unknown role. */
export function categoriesForRole(roleId: string): readonly PhraseCategory[] {
  return ROLE_CATEGORIES[roleId] ?? [];
}

/**
 * How many phrases the library holds for a role.
 *
 * Counted from PHRASES, never written down. A literal would be a fabricated
 * statistic on a screen whose whole purpose is to prove the app was listening,
 * and it would drift the moment a phrase is added.
 */
export function phraseCountForRole(roleId: string): number {
  const cats = categoriesForRole(roleId);
  if (cats.length === 0) return 0;
  return PHRASES.filter(p => cats.includes(p.category)).length;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/engine/__tests__/roleCategories.test.ts`
Expected: PASS, 7 tests

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no output

- [ ] **Step 6: Commit**

```bash
git add src/engine/roleCategories.ts src/engine/__tests__/roleCategories.test.ts
git commit -m "feat(onboarding): map each role to the phrase categories it needs"
```

---

### Task 5: The inline payoff on the role screen

Renders the mapping the moment a profession is chosen, in the space below the profession chips. Not a new step.

**Files:**
- Modify: `src/constants/strings.ts` — three new keys
- Modify: `src/screens/onboarding/ProfileSteps.tsx` — the `'role'` case

**Interfaces:**
- Consumes: `categoriesForRole`, `phraseCountForRole` from Task 4.
- Produces: nothing other modules read.

- [ ] **Step 1: Add the copy**

In `src/constants/strings.ts`, inside the `onboarding` object directly below `roleTailored`:

```ts
    /**
     * The payoff under the profession chips. `shiftCount` deliberately says
     * "in your shift" rather than "for your job" — the phrases are grouped by
     * category, not authored per profession, and the copy must not imply
     * otherwise.
     */
    shiftHeading: 'What you\'ll practise',
    shiftCount: (n: number) => `${n} phrases in your shift`,
    shiftCategorySeparator: ' · ',
```

- [ ] **Step 2: Import the engine functions**

In `src/screens/onboarding/ProfileSteps.tsx`, add below the existing engine-free imports:

```ts
import { categoriesForRole, phraseCountForRole } from '../../engine/roleCategories';
```

- [ ] **Step 3: Render the payoff**

In the `'role'` case, immediately after the profession-chip tray and before the closing `</Screen>`, add:

```tsx
            {profession ? (
              <FadeIn delay={80}>
                <View
                  style={{
                    marginTop: SPACE.lg,
                    paddingTop: SPACE.lg,
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: C.BORDER,
                  }}
                >
                  <Text
                    style={{
                      ...TYPE.micro,
                      fontFamily: FONT_LATIN_MEDIUM,
                      letterSpacing: 1.6,
                      textTransform: 'uppercase',
                      color: C.TEXT3,
                      marginBottom: SPACE.sm,
                    }}
                  >
                    {STRINGS.onboarding.shiftHeading}
                  </Text>
                  <Text
                    style={{
                      ...TYPE.bodyLarge,
                      fontFamily: FONT_LATIN_SEMI,
                      color: C.TEXT,
                      marginBottom: SPACE.xs,
                    }}
                  >
                    {categoriesForRole(role).join(STRINGS.onboarding.shiftCategorySeparator)}
                  </Text>
                  <Text style={{ ...TYPE.body, fontFamily: FONT_LATIN, color: C.TEXT2 }}>
                    {STRINGS.onboarding.shiftCount(phraseCountForRole(role))}
                  </Text>
                </View>
              </FadeIn>
            ) : null}
```

`TYPE` must be added to the existing `design/layout` import if it is not already there.

- [ ] **Step 4: Typecheck and run the suite**

Run: `npx tsc --noEmit && npx jest`
Expected: no type output, all suites pass. The type-scale lint asserts every `fontSize` comes from `TYPE`; this block uses only `TYPE` spreads, so it passes.

- [ ] **Step 5: Lint**

Run: `npx expo lint`
Expected: 0 errors. Pre-existing warnings are unchanged — do not fix them here.

- [ ] **Step 6: Commit**

```bash
git add src/constants/strings.ts src/screens/onboarding/ProfileSteps.tsx
git commit -m "feat(onboarding): show what the chosen role actually unlocks"
```

---

### Task 6: Verify from a clean tree and open the PR

**Files:** none modified.

- [ ] **Step 1: Verify from a clean stash**

The working tree carries unrelated WIP, so a passing compile here is not proof the branch compiles for anyone else.

```bash
git stash push -m "temp: unrelated WIP" -- assets/images/scenario_images/Office_morning.jpg assets/images/scenario_images/scene.jpg
npx tsc --noEmit
npx jest
git stash pop
```

Expected: no type output, all suites pass, and `git status --porcelain` afterwards shows the two deletions restored.

- [ ] **Step 2: Read the café script against its new position**

Open `src/constants/scenarios.ts` and read `kafIntro` on `onboarding-cafe-career` and `onboarding-cafe-social`. Both currently read *"Your first moment speaking Gulf Arabic. The barista is warm and unhurried — perfect for your first exchange."*

The scenario now runs at step 4 instead of step 8, before the learner has given their role, profession or goals. **This is a content check, not a code change** — report whether the copy still reads correctly at the earlier position rather than editing it. Any edit to scenario copy goes through `docs/language/pipeline.md`.

- [ ] **Step 3: Push and open the PR**

```bash
git push -u origin feat/onboarding-resequence
gh pr create --base dev --head feat/onboarding-resequence --title "feat(onboarding): resequence so the first give lands at step 3" --body-file <path>
```

The PR body must state: the ask/give rhythm before and after, that the step count is unchanged at twelve, that no scenario content was touched, and that nothing is device-verified.

**This PR is stacked on PR #52** and will show its four commits until that merges. Say so in the body.

---

## Self-Review

**Spec coverage:**

| Spec section | Task |
|---|---|
| §2 resequence, phrase → 3, scenario → 4 | Task 3 |
| §2 role → 5, goals → 6, commitment → 7 | Task 3 |
| §4 role → category map, real counts, distinctive category first | Tasks 4, 5 |
| §4 renders inline on step 5 | Task 5 |
| §5 `phraseRevealed` keeps its trigger | Tasks 2–3 — the phrase screen is untouched |
| §5 no scenario content changes | Global constraint; Task 6 Step 2 verifies by reading only |
| §5 step routing and swipe guards move together | Tasks 1–2 |
| §5 `TOTAL` stays 12 | Task 1 test asserts twelve screens |
| §6 paywall untouched | No task modifies its content |
| §7 no motion, character or hue introduced | Task 5 adds text and a hairline only |
| §8.1 clean-stash verification | Task 6 Step 1 |
| §8.2 step-order test | Tasks 1, 3 |
| §8.3 role-map test | Task 4 |
| §8.4 no new hardcoded strings | Task 5 Step 1 |
| §8.5 no new hardcoded colours | Task 5 Step 3 — tokens only |
| §10 café script read against its new position | Task 6 Step 2 |

**Gap accepted:** §5's note that analytics step numbers change meaning has no task. It is a reporting discontinuity to be aware of, not code to write — `onboardingAnalytics` records whatever index it is given and keeps working.

**Type consistency:** `OnboardingScreen`, `ONBOARDING_SCREENS`, `screenAt`, `indexOfScreen`, `requiresInteraction`, `REQUIRES_INTERACTION` are defined in Task 1 and used with those exact names in Tasks 2 and 3. `categoriesForRole` and `phraseCountForRole` are defined in Task 4 and used with those names in Task 5. `PhraseCategory` and `PHRASES` are existing exports.
