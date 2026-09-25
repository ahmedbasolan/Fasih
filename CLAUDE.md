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
- Situational confidence tracking across 3 real UAE situations (one per group of MVP scenarios)

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
| Auth | Clerk (`@clerk/expo`) | ^3.2.12 |
| Backend / DB | Supabase (PostgreSQL only — no Supabase Auth) | ^2.100.1 |
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

**Git discipline (learned the hard way — see `docs/lessons-learned.md`):**
- Never `git add -A` or `git add .`. Stage exact file paths. A broad add has repeatedly swept up unrelated pre-existing uncommitted work (someone else's WIP, or your own from an earlier task) into the wrong commit.
- If `git status` shows modified files you didn't just touch, do not assume they're safe to ignore or overwrite. Check `git diff` on them first. If they're unrelated to your current task, `git stash push -u -m "<description>" -- <exact paths>` before you start, and `git stash pop` to restore them once your own commit is made — never let unrelated WIP silently ride along in your commit, and never let it silently vanish either.
- Before considering a branch done, verify it compiles **from a clean checkout**, not just against your current working tree. `git stash` (temporarily, stashing everything) then `npx tsc --noEmit`, then `git stash pop`. A commit that only compiles because of an unrelated uncommitted file sitting in the working tree will break for anyone else who pulls the branch, and CI will catch it publicly instead of you catching it privately.
- One feature = one branch, strictly — including design/token work, which touches files that *feel* like "just tweaking constants" but is its own PR-worthy change.

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
    scenarioEngine.ts   ← applyChoice, getTone, leadingRoute, resolveNextScene, evaluateEnding
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

## Language Authority (CRITICAL — read before touching any Arabic)

**Full rules: [`docs/language/authority.md`](docs/language/authority.md). Curriculum: [`docs/language/curriculum.md`](docs/language/curriculum.md). How to add content: [`docs/language/pipeline.md`](docs/language/pipeline.md).**

Every checkable rule lives in `src/constants/curriculum.ts` and is enforced by
`src/engine/__tests__/languageContent.test.ts`. **Never restate a threshold in prose** —
two documents disagreeing about tashkeel is the exact failure this system exists to stop.

**1. No MSA. Anywhere.** Not in choice cards, NPC dialogue, phrases, grammar patterns,
UI Arabic, or audio. MSA in content is a bug, not a style choice. Arabic is diglossic and
MSA is nobody's spoken register — teaching an expat MSA to survive in Dubai is the classic
failure mode. The blocklist is `MSA_BLOCKLIST`; it was validated against all 457 Arabic
strings in the app, and four candidates were rejected on evidence. Read that comment before
re-proposing any of them. The rule does **not** apply to English teaching notes, which
legitimately quote MSA to contrast it.

**2. Target: contemporary urban Emirati** — Dubai/Abu Dhabi speech as spoken *today*, not
the most "authentically Emirati" form available. Younger Emiratis have shifted toward a
pan-Gulf koine, so a pan-Gulf form is often the current one and a distinctly-Emirati form is
sometimes the archaic one. The flag that matters is `currency` (`current` / `dated` /
`heritage` / `unknown`), not how Emirati something sounds. Other dialects (Egyptian,
Levantine) are `use: 'recognise'` only — understand them, answer in Khaleeji.

**3. Cite a source, split by claim type.** `Phrase.source` is required. Grammar ages slowly
and lexicon fast, so Qafisheh (1977) and Holes (1990) are valid for `morphosyntax` **only** —
never as a sole citation for word choice, usage or register. For those, use contemporary
sources (Ramsa corpus 2026, Al Ramsa, Leung 2024). `UNSOURCED` is an honest, permitted value.
**Never invent a page number** — a fabricated citation is worse than an admitted gap.

**4. Bare Arabic script. No tashkeel.** Only shadda (real gemination: `عليّ` vs `علي`) and
conventional tanwīn (`شكراً`) are allowed. Harakat encode MSA's vowel system and cannot
write Emirati mid-vowels (`shloon`, `zain`) — vocalising dialect means inventing conventions
*and* importing MSA machinery. **Romanisation is the authoritative pronunciation channel.**

**5. Ahmed's approval is a product decision, never a linguistic one.** He does not read
or speak Arabic **at all** — not just unfamiliar with the dialect. There is no human
anywhere in this loop who can catch a wrong Arabic string by looking at it. Never record
content as verified because he approved it, and never invent a citation — a plausible-
sounding page number that wasn't checked is worse than `UNSOURCED`, because nobody
downstream can catch the fabrication either (see `docs/language/authority.md` §0). No
native speaker has reviewed this content; the lint catches wrong *forms*, not unnatural
ones.

**Audio is a standing violation of rule 1.** `ar-AE` is a locale tag, not a dialect model —
device Arabic voices are MSA-trained, so the app says *qahwa* while the card teaches *gahwa*.
Do not "fix" this with a locale change; it needs human recordings.

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

**Use NativeWind `className` for structural/layout props only.** Keep all color tokens in `style` props via `C`. The two coexist cleanly:

```tsx
// ✅ Correct — NativeWind for layout, style prop for colors
<View className="flex-1 items-center justify-center" style={{ backgroundColor: C.BG }}>

// ❌ Wrong — NativeWind cannot express runtime theme colors
<View className="flex-1 bg-surface" />
```

NativeWind classes that are safe: `flex-1`, `flex-row`, `items-center`, `justify-center`, `justify-between`, `gap-*`, `w-full`, `h-full`, `overflow-hidden`, `absolute`, `relative`, `z-*`, `rounded-*` (only when not using a `C.BORDER` token).

Always keep `backgroundColor`, `color`, `borderColor`, and any other color-bearing styles in the `style` prop using `C.TOKEN`.

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

### Changing Token Values (contrast verification is mandatory, not optional)

This session has no way to view the app on a device or take a screenshot to "eyeball" a color change — verification has to be computed, not visual. Before changing any color in `tokens.ts` or `gradients.ts`:

1. Grep every real usage of the token across `src/` and `app/` first. Don't trust the type's section comment — a token commented "main accent" may turn out to be used only as a rare category-badge background, and a token that looks decorative may turn out to be live correctness-feedback text (this happened with `JADE2` in `PhraseBuilder.tsx`).
2. Compute the actual WCAG contrast ratio (`(L1+0.05)/(L2+0.05)` on relative luminance) for every real foreground/background pairing found. Text needs ≥4.5:1 (AA). Don't estimate from the hex values.
3. Check ad-hoc gradient combinations (`colors={[C.X, C.Y]}` literals in component files, not just what's declared in `gradients.ts`) — a label color that passes against one stop can fail against the other end of the same gradient.
4. Re-verify your own replacement values the same way before shipping them. A first-draft palette is not automatically correct just because it looks more "on brand" — this session's own first draft of a new palette had 4 contrast failures, caught only by running the same check against it that was run against the original.
5. `TEXT_ON_LIGHT` exists specifically for text sitting on pastel/light category-badge backgrounds regardless of overall theme — don't reuse the main `TEXT` token there, and don't assume a token used as a light pastel wash needs the same value as a token used as literal foreground text, even if they're named similarly.

See `docs/lessons-learned.md` for the specific numbers and mistakes from past sessions — check it before large design/token changes, and add to it when you find a new one.

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

Language types: `CEFRBand`, `SourceRef`, `SourceClaim`, `SourceId`, `PhraseCurrency`, `PhraseUse`, `PhraseOrigin`, `PhraseRegister`. There is ONE difficulty scale — CEFR. `PhraseDifficulty` and `ScenarioScript.difficulty` are gone; do not reintroduce a second scale.

---

## Scenario Engine Rules

The scenario engine (`src/engine/scenarioEngine.ts`) consists of **pure functions only**:

- `applyChoice(state, choice, npcId)` → new `ScenarioState`
- `getTone(state, npcId, scene)` → `'warm' | 'neutral' | 'cold'`
- `leadingRoute(state, script)` → the route id the run leans toward
- `resolveNextScene(state, choice, script)` → `string | null` (state from before the choice)
- `sceneAfterChoice(state, resolved, script)` → next main-path scene, the bonus scene, or `null` for the result
- `evaluateEnding(state, script)` → `ScenarioEnding`
- `isChoiceVisible(choice, state)` → `boolean` (flag-based gating)

Scenario presentation rules (feedback by scene kind, endings collection, hints) live in `src/engine/scenarioPresentation.ts`; content rules in `src/engine/scenarioRules.ts`.

Never add React imports, side effects, or Zustand calls to the engine. Test it with unit tests in `src/engine/__tests__/`.

---

## Authentication Rules

Use **Clerk** (`@clerk/expo` v3.x) for all authentication. Supabase is used for the database only — no Supabase Auth.

**Clerk v3 API (signals-based):**
- `useSignIn()` returns `{ signIn: SignInFutureResource, errors, fetchStatus }` — NOT `{ signIn, setActive, isLoaded }`
- `useSignUp()` returns `{ signUp: SignUpFutureResource, errors, fetchStatus }`
- `useClerk()` provides `setActive` and `signOut`
- `useAuth()` provides `{ isLoaded, isSignedIn, userId }` for auth gate
- All resource methods return `{ error: ClerkAPIError | null }` — check `error`, not a status return value
- `signIn.status` and `signUp.status` are reactive properties on the resource object

**Sign-in flow:** `signIn.create()` → `signIn.password()` → check `signIn.status === 'complete'` → `signIn.finalize()` → `setActive({ session: signIn.createdSessionId })`

**Sign-up flow:** `signUp.create()` → `signUp.verifications.sendEmailCode()` → `signUp.verifications.verifyEmailCode()` → check `signUp.status === 'complete'` → `signUp.finalize()` → `setActive({ session: signUp.createdSessionId })`

**Password reset:** `signIn.create()` → `signIn.resetPasswordEmailCode.sendCode()` → `signIn.resetPasswordEmailCode.verifyCode()` → `signIn.resetPasswordEmailCode.submitPassword()` → `signIn.finalize()` → `setActive()`

**Auth gate** (`app/index.tsx`): uses `useAuth()` from Clerk. Signed-in + onboarded → `/(tabs)`. Signed-in but not onboarded → `/onboarding`. Signed-out + previously onboarded → `/sign-in`. New user → `/onboarding`.

**Supabase DB queries** use `clerkUserId` (from `useAppStore`) as the user identifier — this replaces the old `supabaseUserId`.

Never expose the Supabase service role key in the client. Never expose `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` in server-side privileged operations.

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

1. Read this file first, including `docs/lessons-learned.md` — and `docs/language/` for anything touching Arabic.
2. Check existing patterns in similar screens — match them exactly.
3. Identify the minimum files to touch.
4. Keep changes focused — do not rewrite unrelated code.
5. Ensure the feature works end to end.
6. Run `npx tsc --noEmit` before finishing — zero errors required. If the working tree has unrelated uncommitted changes sitting in it, also verify from a clean stash (see Git Discipline above) — a compile that only passes because of someone else's uncommitted file is not a passing compile.

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
- A color that is safe **as text** on a background is not automatically safe **as a fill** with text on top of it — they sit at opposite ends of the luminance range. Any token used both ways (e.g. an accent color used for icon/text color in one place and as a button's `backgroundColor` in another) needs its label color checked against it specifically, not assumed. `ShimmerButton.tsx` and `PhraseBuilder.tsx` both shipped with hardcoded `#FFFFFF`/`#fff` label text that failed contrast the moment the fill wasn't a dark color anymore — twice, same root cause, two different files. Use `C.BG` as the label color convention (see `OnboardingScenarioPlayer.tsx`), not a hardcoded hex.
- When changing a shared token's value (anything in `tokens.ts`/`gradients.ts`), grep for every real usage first — a token's *comment* ("Primary green — main accent") does not reliably describe its *actual* usage. Tokens can be combined ad-hoc as gradient stops in component files (`colors={[C.PRIMARY, C.JADE]}`) even when `gradients.ts` doesn't define that combination — those combinations need verifying too, not just each token in isolation.

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

## Agent skills

### Issue tracker

Issues live in GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Label vocabulary for the five canonical triage roles. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout. See `docs/agents/domain.md`.
