# Sadaf Step 7 + Step 8a (Bidi, Header, Dead Art) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the mixed-direction Arabic/Latin rendering bug in Sentence Builder, replace its colliding header with `ScreenHeader`, and delete the illustration layer that lost its last consumer — the parts of spec steps 7 and 8 that do not depend on steps 5 or 6.

**Architecture:** The bidi bug is a rendering defect, not a content defect: the pattern titles are stored correctly and three call sites disagree about how to render them. One pure `splitBilingualTitle` helper in `src/engine/text.ts`, tested, then used at every site so each half renders in its own `Text` with explicit direction. The header collision is fixed by adopting the `ScreenHeader` primitive that already exists. The dead-art deletion is pure subtraction.

**Tech Stack:** React Native 0.8x / Expo ~56, TypeScript strict, jest + jest-expo, `lucide-react-native`.

**Spec:** [`docs/superpowers/specs/2026-09-03-sadaf-art-direction-design.md`](../specs/2026-09-03-sadaf-art-direction-design.md) — §4.4 chrome, §6 component inventory, §8 verification, §9 build order steps 7–8.

## Global Constraints

- **Do not alter any Arabic string.** The pattern titles in `src/constants/grammar.ts` are correct as stored; this is a *rendering* fix. Content changes go through `docs/language/pipeline.md`.
- **No hardcoded colours** — `C.TOKEN` via `useTheme()`. **No hardcoded strings** — `STRINGS`. **No hardcoded fonts** — `FONT_*`.
- Spacing from `SPACE` / `SCREEN_MARGIN` / `RADIUS` in `src/components/design/spacing.ts`.
- `StyleSheet.create` wrapped in `useMemo` with `[C]` in themed components.
- Depth budget: `SheetPanel` is the only shadow. Radius budget: sheet 24, pills 999, everything else 0.
- Icons: `lucide-react-native`, 1.5 stroke, round caps.
- No `any`.
- **Never `git add -A` or `git add .`** — stage exact paths.
- Branch off `feat/sadaf-art-direction` (PR #38, still open): `git checkout feat/sadaf-art-direction && git pull && git checkout -b feat/sadaf-step-7`.
- Verify with `npx tsc --noEmit` run **alone**, checking `echo $?` — never piped into `head`.

---

## Why this plan is scoped to 7 and 8a

Spec step 8 says "dead asset removal", but three of the four assets still have live consumers, and they belong to steps not yet built:

| Asset | Hex literals | Last consumer | Deletable |
|---|---|---|---|
| `CategoryIllustrations.tsx` | **130** | `CategoryCard.tsx`, which is itself now unreferenced except by a barrel export | **Yes, now** |
| `CategoryCard.tsx` | 0 | only `features/index.ts` re-exports it | **Yes, now** |
| `SceneIllustrations.tsx` | 107 | `ScenarioDetailScreen.tsx` | No — step 6 |
| `KafMascot.tsx` | 46 | 3 scenario phases (step 6) + `OnboardingFlow` (step 5) | No — steps 5 and 6 |
| `foxy_*.png` (3.5 MB) | — | `OnboardingFlow`, `MissionCard`, `StreakWidget`, `HomeScreenNew` | No — step 5 |

So this plan takes **130 of the 283** illustration hex literals now and leaves the rest with the steps that free them. Attempting the whole sweep here would mean deleting files that still have imports.

**Steps 5 and 6 need their own plans.** Step 5 is a 1,441-line file split plus new mode plates; step 6 is the margin rail, which is new interaction design rather than a restyle and which the spec deliberately scheduled last, "on settled primitives". Folding either into this plan would produce a document too large to execute reliably.

---

## File Structure

**Create**

| File | Responsibility |
|---|---|
| `src/engine/__tests__/bilingualTitle.test.ts` | Tests for the splitter, including the exact strings that render wrong today. |

**Modify**

| File | Change |
|---|---|
| `src/engine/text.ts` | Add `splitBilingualTitle`. Pure, no React. |
| `src/screens/SentenceBuilder.tsx` | Use the splitter at lines 253, 613, 652; replace the gradient hero with `ScreenHeader`. |
| `src/screens/PhraseLibrary.tsx` | Replace its ad-hoc `.split(' — ')` with the shared helper. |
| `src/components/features/index.ts` | Drop the `CategoryCard` re-export. |

**Delete**

`src/components/features/CategoryCard.tsx` · `src/components/features/CategoryIllustrations.tsx`

---

## Task 1: `splitBilingualTitle`

**Files:**
- Modify: `src/engine/text.ts`
- Test: `src/engine/__tests__/bilingualTitle.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `splitBilingualTitle(title: string): { arabic: string; english: string }` from `src/engine/text.ts`.

- [ ] **Step 1: Write the failing test**

Create `src/engine/__tests__/bilingualTitle.test.ts`:

```ts
import { splitBilingualTitle } from '../text';
import { GRAMMAR_PATTERNS } from '../../constants/grammar';

describe('splitBilingualTitle', () => {
  it('splits on the em-dash separator', () => {
    expect(splitBilingualTitle('أنا ___ — I am ___')).toEqual({
      arabic: 'أنا ___',
      english: 'I am ___',
    });
  });

  it('keeps a title with no separator whole, as Arabic', () => {
    expect(splitBilingualTitle('كوّن')).toEqual({ arabic: 'كوّن', english: '' });
  });

  it('splits only on the first separator', () => {
    // A gloss may itself contain a dash. Splitting on every one would drop text.
    expect(splitBilingualTitle('مب ___ — not ___ — informal')).toEqual({
      arabic: 'مب ___',
      english: 'not ___ — informal',
    });
  });

  it('trims surrounding whitespace on both halves', () => {
    expect(splitBilingualTitle('يلا ___  —  let us ___')).toEqual({
      arabic: 'يلا ___',
      english: 'let us ___',
    });
  });

  it('handles a Latin-first title without misassigning the halves', () => {
    // `noun + my/your — ___ of mine` starts Latin. The first half is still the
    // pattern side and the second is still the gloss; the function is about
    // position, not script.
    expect(splitBilingualTitle('noun + my/your — ___ of mine')).toEqual({
      arabic: 'noun + my/your',
      english: '___ of mine',
    });
  });

  it('every shipped pattern title splits into two non-empty halves', () => {
    // The real defect: a title rendered as one string lets the bidi algorithm
    // reorder the trailing `?` of the gloss. Splitting is only safe if every
    // title actually has both halves.
    for (const p of GRAMMAR_PATTERNS) {
      const { arabic, english } = splitBilingualTitle(p.title);
      expect(arabic.length).toBeGreaterThan(0);
      expect(english.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Confirm the export name for the pattern list**

Run: `grep -nE "^export (const|type) " src/constants/grammar.ts | head`
The test imports `GRAMMAR_PATTERNS`. If the array is exported under a different name, **use the real name** and update the import — do not rename the constant.

- [ ] **Step 3: Run test to verify it fails**

Run: `npx jest src/engine/__tests__/bilingualTitle.test.ts`
Expected: FAIL — `splitBilingualTitle is not a function`.

- [ ] **Step 4: Write the implementation**

Append to `src/engine/text.ts`:

```ts
/** The separator used in `GrammarPattern.title`: an em dash with spaces either side. */
const TITLE_SEPARATOR = ' — ';

/**
 * Split a bilingual pattern title into its two halves.
 *
 * Titles are stored as one string — `'كم / وين / شو — how much? where? what?'`.
 * Rendered in a single Text, the Unicode bidirectional algorithm resolves the
 * paragraph direction from the first strong character (Arabic), and the
 * trailing `?` of the Latin gloss is a neutral, so it is placed by RTL rules
 * and lands on the wrong side: `how much? ?where? what`. The string is not
 * wrong; rendering it as one run is.
 *
 * Splitting lets each half render in its own Text with an explicit direction,
 * which is the only reliable fix short of embedding directional control
 * characters in the content — and the content is governed by the language
 * authority, so it does not get edited for a rendering problem.
 *
 * Splits on the FIRST separator only: a gloss may contain its own dash.
 */
export function splitBilingualTitle(title: string): { arabic: string; english: string } {
  const at = title.indexOf(TITLE_SEPARATOR);
  if (at === -1) return { arabic: title.trim(), english: '' };
  return {
    arabic: title.slice(0, at).trim(),
    english: title.slice(at + TITLE_SEPARATOR.length).trim(),
  };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx jest src/engine/__tests__/bilingualTitle.test.ts`
Expected: PASS, 6 tests.

If the last test fails, a shipped title lacks a separator. **Do not weaken the test** — report which title, because a title that cannot be split is a title that will still render wrong.

- [ ] **Step 6: Commit**

```bash
git add src/engine/text.ts src/engine/__tests__/bilingualTitle.test.ts
git commit -m "feat(text): splitBilingualTitle, the fix for mixed-direction titles

Pattern titles are stored as one string. Rendered as one Text, the bidi
algorithm resolves paragraph direction from the leading Arabic and places the
gloss's trailing '?' by RTL rules, so 'how much? where? what?' renders as
'how much? ?where? what'. The content is correct; rendering it as a single run
is not, and the content is governed by the language authority so it does not
get edited for a rendering bug.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 2: Render both halves with explicit direction

**Files:**
- Modify: `src/screens/SentenceBuilder.tsx:253,613,652`
- Modify: `src/screens/PhraseLibrary.tsx` (the pattern strip)

**Interfaces:**
- Consumes: `splitBilingualTitle` from Task 1.
- Produces: nothing importable.

- [ ] **Step 1: Replace the two list rows in Sentence Builder**

`SentenceBuilder.tsx:613` and `:652` currently render the whole title in one Arabic-styled Text — these are the two sites that produce the visible bug:

```tsx
<Text style={styles.patternRowArabic}>{p.title}</Text>
```

Replace each with two Texts. The Arabic half declares RTL; the gloss declares LTR, so neither can borrow the other's direction:

```tsx
<Text style={styles.patternRowArabic}>{splitBilingualTitle(p.title).arabic}</Text>
<Text style={styles.patternRowGloss}>{splitBilingualTitle(p.title).english}</Text>
```

At line 652 keep the existing dimmed override on the Arabic half (`[styles.patternRowArabic, { color: C.TEXT3 }]`) and apply the same override to the gloss.

- [ ] **Step 2: Add the two styles**

In the file's `StyleSheet.create`, ensure `patternRowArabic` carries `writingDirection: 'rtl'` and add:

```ts
patternRowGloss: {
  fontFamily: FONT_LATIN,
  fontSize: 13,
  color: C.TEXT2,
  writingDirection: 'ltr',
  marginTop: SPACE.xs,
},
```

Match the surrounding style-object conventions in that file — if its styles are built inside a `useMemo(() => StyleSheet.create({...}), [C])`, add it there.

- [ ] **Step 3: Use the helper at the third site**

`SentenceBuilder.tsx:253` already does `pattern.title.split(' — ')[0]` by hand. Replace with `splitBilingualTitle(pattern.title).arabic` so all three sites share one definition of the split.

- [ ] **Step 4: Use the helper in Phrase Library**

The pattern strip renders `p.title.split(' — ')[0]` and `p.title.split(' — ')[1] ?? ''`. Replace both with a single `const { arabic, english } = splitBilingualTitle(p.title);` above the return, and add `writingDirection: 'rtl'` to the Arabic Text and `'ltr'` to the gloss Text.

- [ ] **Step 5: Verify no ad-hoc splits remain**

Run: `grep -rn "split(' — ')" src app`
Expected: no output.

Run: `npx tsc --noEmit` then `echo $?` — expected 0.
Run: `npx jest` — expected all suites pass.

- [ ] **Step 6: Commit**

```bash
git add src/screens/SentenceBuilder.tsx src/screens/PhraseLibrary.tsx
git commit -m "fix(sentence-builder): render bilingual titles as two directed runs

The pattern list rendered the whole title in one Arabic-styled Text, so the
gloss's trailing '?' was placed by RTL rules: 'how much? ?where? what'. Each
half now renders in its own Text with an explicit writingDirection, so neither
can borrow the other's direction.

Three sites had three different answers -- one split by hand, one did not split
at all, one split twice. They now share splitBilingualTitle.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 3: Sentence Builder header

**Files:**
- Modify: `src/screens/SentenceBuilder.tsx:570-593`

**Interfaces:**
- Consumes: `ScreenHeader` from `src/components/ui`.

- [ ] **Step 1: Replace the gradient hero**

The current hero is a `LinearGradient` containing a `heroRow` with the back button and a right-aligned block holding the Arabic wordmark and `heroSub`. The subtitle is what collides with the back button.

Replace the whole `<LinearGradient>…</LinearGradient>` block with:

```tsx
<ScreenHeader
  onBack={onExit}
  title={STRINGS.sentenceBuilder.title}
  subtitle={STRINGS.sentenceBuilder.subtitle}
/>
```

Check `STRINGS.sentenceBuilder` for an existing `title`; if there is none, add one rather than hardcoding. **Do not move the Arabic wordmark `كوّن` into `ScreenHeader`** — that component's title slot is Latin-styled. Dropping the wordmark here is correct: `GhostLetters` already carries the screen's Arabic identity.

- [ ] **Step 2: Remove what the hero owned**

Delete the now-unused `hero`, `heroRow`, `heroArabic`, `heroSub`, `backBtn` styles, and any import left dangling (`LinearGradient`, `ANGLE_135`, `GeoPattern`, `Wand2`, `ArrowLeft`). The hero also used `GeoPattern` with a hardcoded `color="#FFFFFF"` — that literal goes with it.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`, `echo $?` — expected 0.
Run: `npx eslint src/screens/SentenceBuilder.tsx` — expected 0 errors and no `never used` warnings.
Run: `grep -c '#FFFFFF' src/screens/SentenceBuilder.tsx` — expected one fewer than before.

- [ ] **Step 4: Commit**

```bash
git add src/screens/SentenceBuilder.tsx
git commit -m "feat(sentence-builder): adopt ScreenHeader, drop the gradient hero

The subtitle was right-aligned in a row with the back button and ran underneath
it. ScreenHeader gives back, title and subtitle their own rows, which makes
that arrangement unrepresentable rather than merely fixed.

Takes the gradient, the hardcoded #FFFFFF GeoPattern tint and the Arabic
wordmark with it -- GhostLetters already carries this screen's Arabic identity.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 4: Delete the orphaned illustration layer

**Files:**
- Delete: `src/components/features/CategoryCard.tsx`, `src/components/features/CategoryIllustrations.tsx`
- Modify: `src/components/features/index.ts`

- [ ] **Step 1: Prove they are orphaned**

Run: `grep -rn "CategoryCard\|CATEGORY_ILLUSTRATIONS\|CategoryIllustrations" src app --include=*.tsx --include=*.ts`
Expected: hits only inside those two files and the `features/index.ts` re-export. If anything else appears, **stop** — the Phrase Library rewrite was supposed to remove the last consumer, and a surviving one changes this task.

- [ ] **Step 2: Delete and unexport**

```bash
git rm src/components/features/CategoryCard.tsx src/components/features/CategoryIllustrations.tsx
```

Remove these lines from `src/components/features/index.ts`:

```ts
export { CategoryCard } from './CategoryCard';
export { CATEGORY_ILLUSTRATIONS } from './CategoryIllustrations';
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`, `echo $?` — expected 0.
Run: `npx jest` — expected all suites pass.
Run: `grep -rnoE "#[0-9A-Fa-f]{6}\b" src app --include=*.tsx --include=*.ts | grep -v "design/tokens.ts\|design/gradients.ts\|__tests__" | wc -l`
Expected: **205**, down from 335 — the 130 literals that lived in `CategoryIllustrations`.

- [ ] **Step 4: Commit**

```bash
git add src/components/features/index.ts
git commit -m "refactor: delete the orphaned category illustration layer

CategoryCard lost its only consumer when the Phrase Library moved to
PhraseEntry, and CategoryIllustrations existed only to feed it. 642 lines and
130 hardcoded hex literals, reachable from nothing.

Product-code hex debt: 335 to 205. The remaining 153 are in SceneIllustrations
and KafMascot, which still have live consumers in spec steps 5 and 6.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 5: Icon grammar

**Files:**
- Modify: every file rendering a Lucide icon without `strokeWidth`.

- [ ] **Step 1: Find the offenders**

Run: `grep -rn "<[A-Z][A-Za-z0-9]* size={" src app --include=*.tsx | grep -v "strokeWidth" | wc -l`
Then list them: same command without `| wc -l`.

- [ ] **Step 2: Add `strokeWidth={1.5}` to each**

Icons in content are 24 px on the 24 px grid; tab bar icons are 22 px; inline icons beside text may stay at their current size. **Only add the missing `strokeWidth`** — do not resize an icon whose size is deliberate, and do not touch files owned by steps 5 and 6 (`OnboardingFlow.tsx`, `ScenarioPlayer.tsx`, `ScenarioDetailScreen.tsx`, `src/components/scenario/*`, `src/components/home/*`). Those get their icons when their screens are rebuilt; changing them here creates merge conflicts with those branches for no benefit.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`, `echo $?` — expected 0.
Run: `npx jest` — expected pass.

- [ ] **Step 4: Commit**

```bash
git add <exact paths touched>
git commit -m "style(icons): one Lucide grammar at 1.5 stroke

Icons shipped at four different stroke weights because each call site chose
its own. Scoped to files this branch already owns; the home cards, onboarding
and scenario screens get theirs when steps 5 and 6 rebuild them, so touching
them here would only create conflicts.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 6: Open the PR

- [ ] **Step 1: Clean-tree verification**

```bash
git stash push -u -m "pre-verify"
npx tsc --noEmit; echo "TSC: $?"
npx jest
npx eslint src app --ext .ts,.tsx
git stash pop
```

Expected: tsc 0, all suites pass, eslint 0 errors. If `git stash pop` conflicts, **stop and report** — do not resolve by discarding.

- [ ] **Step 2: Push and open against `feat/sadaf-art-direction`**

This branch stacks on PR #38, so it targets that branch, not `dev`. If #38 has merged to `dev` by now, target `dev` instead.

```bash
git push -u origin feat/sadaf-step-7
gh pr create --base feat/sadaf-art-direction --title "Sadaf step 7 + 8a — bidi, header, dead art" --body "$(cat <<'EOF'
Spec steps 7 and the independent half of 8. Stacks on #38.

## The bug

The Sentence Builder pattern list rendered each bilingual title in a single
Arabic-styled `Text`. The bidi algorithm resolves paragraph direction from the
leading Arabic, so the gloss's trailing `?` — a neutral — is placed by RTL
rules: `كم / وين / شو — how much? ?where? what`.

The stored string is correct. Rendering it as one run is not, and the content is
governed by `docs/language/authority.md`, so it does not get edited to work
around a rendering defect. Each half now renders in its own `Text` with an
explicit `writingDirection`, via one tested `splitBilingualTitle` helper — three
call sites previously had three different answers.

## Also here

- Sentence Builder adopts `ScreenHeader`, so the subtitle can no longer run
  under the back button.
- `CategoryCard` and `CategoryIllustrations` deleted — orphaned when the Phrase
  Library moved to `PhraseEntry`. 642 lines and 130 hex literals reachable from
  nothing. Product-code hex debt 335 → 205.
- Lucide icons standardised to 1.5 stroke in the files this branch owns.

## Not here, and why

The rest of step 8 cannot land yet: `SceneIllustrations` (107 hex) still has a
consumer in `ScenarioDetailScreen`, and `KafMascot` (46 hex) in the three
scenario phases and `OnboardingFlow`. Those are freed by steps 6 and 5
respectively, so the deletion travels with them.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-Review

**Spec coverage.** §8.3 bidi test → Task 1. Step 7 header → Task 3. Step 8 dead assets → Task 4 (the deletable subset, with the rest justified in "Why this plan is scoped"). Step 8 icon grammar → Task 5. Step 8's hex *lint rule* is **deliberately not here**: a rule banning hex outside `tokens.ts` would fail on the 205 literals still in `SceneIllustrations` and `KafMascot`, so it lands with step 6, when the count reaches zero. Adding it now would mean shipping a lint rule with a suppression list, which is the thing it exists to prevent.

**Placeholder scan.** No TBD/TODO. Every code step carries real code. Task 2 Step 2 and Task 5 Step 2 say "match the surrounding conventions" and "only add the missing prop" rather than listing every line, because the exact set is enumerated by the grep in the preceding step — that is an instruction with a determinate output, not a placeholder.

**Type consistency.** `splitBilingualTitle(title: string): { arabic: string; english: string }` is defined in Task 1 and consumed with that exact shape in Task 2 at four call sites. `ScreenHeader`'s props (`title`, `subtitle`, `eyebrow`, `onBack`) match its definition in `src/components/ui/ScreenHeader.tsx`.

**One risk.** Task 1's last test asserts every shipped pattern title splits into two non-empty halves. If a title lacks the separator the test fails, and the instruction is to report rather than weaken it — because such a title is exactly one that will still render wrong. Verify the `GRAMMAR_PATTERNS` export name in Step 2 before assuming the import is right.
