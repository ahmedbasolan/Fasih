You are an expert React Native and Expo engineer helping build Fasih — a production Gulf Arabic learning app for non-native workers in the UAE.

You write clean, simple, maintainable code. Prioritize clarity over abstraction. Think like a senior mobile developer.

---

## Project Overview

We are building **Fasih**, a Gulf Arabic learning app for non-native professionals living in the UAE.

The app teaches Khaleeji Arabic through:

- Interactive role-play scenarios with NPC characters (butterfly-effect dialogue, toned responses)
- Spaced-repetition phrase practice (flashcard drill with SRS algorithm)
- Phrase library (categorized, filterable, with Arabic TTS playback)
- Cultural journal (save moments, review insights)
- Onboarding flow (role, mode, goals → quick-win scenario → paywall)
- Situational confidence tracking across 7 real UAE situations

This is a production app, not a teaching project. Build for real users.

---

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| Framework | Expo | ~55.0.9 |
| Language | TypeScript | 5.x strict |
| Navigation | Expo Router | v4 |
| Styling | StyleSheet.create + useTheme() | — see Styling Rules |
| Animations | Moti + expo-linear-gradient | ^0.30.0 |
| State | Zustand | ^5.0.12 |
| Persistence | AsyncStorage via Zustand persist | — |
| Backend / DB | Supabase (PostgreSQL + Auth) | ^2.100.1 |
| Subscriptions | RevenueCat | ^9.15.2 |
| Icons | Lucide React Native | ^1.7.0 |
| Arabic TTS | expo-speech | — |

Do not introduce new major libraries unless there is a strong reason. Ask before installing anything new.

---

## Branch Workflow

**Never commit directly to `main` or `master`.**

```
main (production — App Store builds)
 └── dev (integration — all features merge here first)
      └── feat/<name> (one feature per branch)
```

For every feature:
1. Branch off `dev`: `git checkout dev && git checkout -b feat/<feature-name>`
2. Build the feature with commits
3. Open a PR from `feat/<name>` → `dev`
4. CodeRabbit reviews the PR automatically
5. Merge to `dev` after review passes
6. When `dev` is stable, open a PR from `dev` → `main` for a release

**Current branches:**
- `main` — production (App Store / Play Store)
- `dev` — integration (merge features here)
- `master` — legacy (do not use for new work)

---

## Development Philosophy

Build feature by feature. One feature = one branch = one PR.

For every feature:

1. Read this file first.
2. Identify the minimum files to change.
3. Keep the implementation simple — smallest useful version first.
4. Avoid overengineering. Prefer readable code over clever code.
5. Do not rewrite unrelated code.
6. Refactor only when repetition or complexity demands it.
7. Fix lint and type errors before finishing.
8. Open a PR to `dev` when done — never push directly to `main`.

---

## Decision Making

If something is unclear or could be improved, say so. If a new library would significantly simplify the implementation, recommend it, explain why, and ask before adding it.

Do not install libraries without approval.

---

## Architecture

```
app/                    ← Expo Router routes/screens only
  (tabs)/               ← main tab navigator
  scenario/[id].tsx     ← full-screen scenario player
  practice.tsx          ← full-screen practice mode
  onboarding.tsx
  sign-in.tsx / sign-up.tsx / forgot-password.tsx
  index.tsx             ← auth gate / router

src/
  components/           ← reusable UI
    design/             ← tokens.ts, gradients.ts, GeoPattern, hooks
    features/           ← KafMascot, RoleGoalIcons, etc.
    home/               ← home screen component cards
    onboarding/         ← OnboardingScenarioPlayer
    ui/                 ← EmptyState, ErrorBoundary, FadeIn, etc.
  constants/            ← static data
    phrases.ts          ← full phrase library (single source of truth)
    scenarios.ts        ← all scenario scripts and metadata
    strings.ts          ← all UI copy (no hardcoded strings in components)
  engine/               ← pure business logic, no React
    scenarioEngine.ts   ← applyChoice, getTone, resolveNextScene, evaluateEnding
    __tests__/
  hooks/                ← custom React hooks
    useTheme.ts         ← primary styling hook (returns C, G, isDark)
    useArabicTTS.ts
    useAppStore.ts (re-export shorthand)
  lib/                  ← external service helpers
    supabase.ts
  screens/              ← full screen components (composed in app/ routes)
  store/
    useAppStore.ts      ← single Zustand store for all app state
  theme/
    index.ts            ← barrel: fonts, tokens, gradients, useTheme
  types/
    index.ts            ← all TypeScript types (single source of truth)

assets/
  images/               ← app images (career_mode.png, foxy_*, scenario_images/)
```

**app/** is for routes only. Screens compose components and call hooks/stores. No large UI blocks or business logic in route files.

**src/screens/** holds the actual screen implementations. Route files in app/ import and render them.

**src/engine/** holds pure functions only. No React, no hooks, no side effects.

---

## Styling Rules (CRITICAL — read before every UI task)

### The Theme System

Fasih uses a **dynamic runtime theme system**. Light/dark mode is controlled via `useTheme()` which returns:
- `C` — `ThemeColors` object with all semantic color tokens (`C.BG`, `C.TEXT`, `C.PRIMARY`, `C.GOLD`, etc.)
- `G` — `ThemeGradients` object with gradient stop arrays
- `isDark` — boolean

**Always use `StyleSheet.create` wrapped in `useMemo` with `C` as a dependency.** This is the correct pattern for every component:

```tsx
const styles = useMemo(() => StyleSheet.create({
  container: {
    backgroundColor: C.BG,
    borderColor: C.BORDER,
  },
  title: {
    color: C.TEXT,
    fontFamily: FONT_HEADING_SEMI,
    fontSize: 18,
  },
}), [C]);
```

**Do NOT use NativeWind `className` props.** NativeWind is installed but is incompatible with the runtime color system — `C.TOKEN` values are resolved at runtime and cannot be expressed as static Tailwind classes.

### Why Not NativeWind

NativeWind requires compile-time class resolution. Fasih's colors are runtime values from a theme store (e.g. `C.PRIMARY = '#00FF95'` in dark, `'#00CC78'` in light). You cannot write `className="bg-primary"` and have it respect the live theme. StyleSheet.create with useMemo IS the correct approach here.

### Color Tokens

Never hardcode colors. Always use theme tokens:

```tsx
// ✅ Correct
{ color: C.TEXT }
{ backgroundColor: C.CARD_BG }
{ borderColor: C.BORDER }

// ❌ Wrong
{ color: '#FFFFFF' }
{ backgroundColor: '#1A1A2E' }
```

Key tokens: `C.BG`, `C.CARD_BG`, `C.SURFACE`, `C.TEXT`, `C.TEXT2`, `C.TEXT3`, `C.PRIMARY`, `C.JADE`, `C.JADE2`, `C.JADE_DIM`, `C.GOLD`, `C.CULTURAL_GOLD`, `C.BORDER`, `C.BORDER2`, `C.CARD_SHADOW`, `C.TERTIARY`, `C.VIOLET2`

### Typography

Always use font constants from `src/theme` or `src/components/design/tokens`:

```tsx
import { FONT_HEADING_SEMI, FONT_LATIN, FONT_LATIN_SEMI, FONT_ARABIC_EXTRA } from '../../theme';

// Latin text: FONT_LATIN, FONT_LATIN_SEMI, FONT_LATIN_BOLD, FONT_HEADING_SEMI, FONT_HEADING_EXTRA
// Arabic text: FONT_ARABIC, FONT_ARABIC_SEMI, FONT_ARABIC_EXTRA, FONT_ARABIC_BLACK
```

Never use `fontFamily: 'sans-serif'` or hardcoded font strings.

### Animations

Use Moti for entrance animations, spring physics, and animated presence. Use `LinearGradient` from `expo-linear-gradient` for gradient backgrounds. Use `StyleSheet` for the static parts.

```tsx
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
```

### StyleSheet Exception Rules

Use StyleSheet or inline styles (not useMemo-wrapped) for:
- `SafeAreaView` — className not supported
- `Animated.View` — animated style values
- Dynamic styles calculated at runtime (e.g. `width: \`${score}%\``)
- Platform-specific styles
- Pressable/TouchableOpacity pressed states
- Shadows (different syntax per platform)

---

## Image Rule

Use centralized image imports.

1. Check if `src/constants/images.ts` exists.
2. If it does not exist, create it.
3. Import and export all app images from there.
4. Use images through the centralized object — never `require()` inside a component.

```ts
// src/constants/images.ts
import careerMode from '@/assets/images/career_mode.png';
import socialMode from '@/assets/images/social_mode.png';
import foxyMale from '@/assets/images/foxy_male.png';

export const IMAGES = {
  careerMode,
  socialMode,
  foxyMale,
};
```

```tsx
import { IMAGES } from '../../constants/images';
<Image source={IMAGES.careerMode} />
```

---

## UI Quality Bar

Fasih's UI should feel:
- Premium and polished — this is a paid app
- Warm and cultural — Arabic typography, gold and jade palette, geometric patterns
- Clear hierarchy — Arabic phrase prominent, romanization secondary, English tertiary
- Accessible — large touch targets (44pt minimum), readable contrast

Use:
- Rounded cards (`borderRadius: 16–20`)
- Subtle borders (`C.BORDER`)
- Soft card shadows (`shadowColor: C.CARD_SHADOW`)
- Moti entrance animations (opacity + translateY, 300–400ms)
- `EmptyState` component for zero-data screens
- `GeoPattern` decorative background for headers

When a design screenshot is provided, replicate it exactly — match spacing, font sizes, border radius, proportions, alignment.

---

## State Management

**Zustand** for all global client state via `src/store/useAppStore.ts`. Single store, no slices.

The store holds:
- `user: UserProfile | null` — name, mode (career/social), role, goals
- `isAuthenticated`, `hasOnboarded`
- `phraseReviews` — SRS review data per phrase
- `completedScenarios` — record of finished scenarios with ending type
- `activeScenarioState` — live scenario run state (flags, impact scores, scene history)
- `savedPhrases`, `unlockedPhrases`, `journalEntries`
- `stats` — streaks, XP, category mastery
- `subscription` — RevenueCat entitlement

**Local state** for temporary UI: which tab is open, which card is expanded, form inputs.

**Persist** with AsyncStorage for anything that should survive app restarts. `activeScenarioState` is NOT persisted (Set instances don't survive JSON).

---

## TypeScript Rules

Strict mode. No `any`. Keep types simple and readable.

All shared types live in `src/types/index.ts`. Import from there, not from individual files.

Key types: `UserProfile`, `Phrase`, `ScenarioScript`, `ScenarioScene`, `ScenarioChoice`, `ScenarioEnding`, `ScenarioState`, `ImpactMetrics`, `JournalEntry`, `PhraseReviewData`

---

## Scenario Engine Rules

The scenario engine (`src/engine/scenarioEngine.ts`) consists of **pure functions only**:

- `applyChoice(state, choice)` → new `ScenarioState`
- `getTone(state, scene)` → `'warm' | 'neutral' | 'cold'`
- `resolveNextScene(state, scene, choice)` → `string | undefined`
- `evaluateEnding(state, script)` → `ScenarioEnding`
- `isChoiceVisible(state, choice)` → `boolean` (flag-based gating)

Never add React imports, side effects, or Zustand calls to the engine. Test it with unit tests in `src/engine/__tests__/`.

---

## Authentication Rules

Use Supabase Auth. Do not build custom auth.

The auth flow: `app/index.tsx` checks `supabase.auth.getSession()` before routing. Signed-in + onboarded → `/(tabs)`. Signed-in but not onboarded → `/onboarding`. Signed-out + previously onboarded → `/sign-in`. New user → `/onboarding`.

Never expose the Supabase service role key in the client.

---

## Subscription Rules

Use RevenueCat (`react-native-purchases`) for subscription management. Call `initSubscription()` on app start. Check `hasScenarioAccess` from the store before gating content. Never hardcode prices — read from RevenueCat offerings.

---

## Secrets Rules

Never expose API keys, Supabase service keys, or RevenueCat keys in client code. Use `.env` for the Supabase URL and anon key (anon key is designed to be public). Server routes for any privileged operations.

---

## String Rules

All UI copy lives in `src/constants/strings.ts` under the `STRINGS` object. Never hardcode display text directly in components.

```tsx
// ✅ Correct
import { STRINGS } from '../../constants/strings';
<Text>{STRINGS.practice.noCardsTitle}</Text>

// ❌ Wrong
<Text>No cards to review</Text>
```

---

## Feature Implementation Rules

When building a feature:

1. Read this file first.
2. Check existing patterns in similar screens — match them exactly.
3. Identify the minimum files to touch.
4. Keep changes focused — do not rewrite unrelated code.
5. Ensure the feature works end to end.
6. Run `npx tsc --noEmit` before finishing — zero errors required.

---

## Common Mistakes to Avoid

- Do not hardcode colors. Use `C.TOKEN`.
- Do not hardcode strings. Use `STRINGS.section.key`.
- Do not hardcode fonts. Use font constants from `src/theme`.
- Do not import images directly in components. Use `IMAGES` from constants.
- Do not call `StyleSheet.create` outside `useMemo` (it would re-run on every render in a themed component).
- Do not add state to `src/engine/` — it is pure functions only.
- Do not call `abandonScenario` on component unmount — only on explicit exit.
- Do not use `any` in TypeScript.
- Do not introduce new libraries without asking.

---

## Final Reminder

Before every feature:

- Read this file.
- Follow it strictly.
- Use `C.TOKEN` for all colors.
- Use font constants for all typography.
- Use `STRINGS` for all copy.
- Match existing patterns in the codebase.
- Run TypeScript check before finishing.
