# Fasih Theme System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a central `src/theme/index.ts` re-export and purge all hardcoded hex/rgba values from every screen, replacing them with design tokens from the existing theme system.

**Architecture:** The token system already lives in `src/components/design/tokens.ts` (colors) and `src/components/design/gradients.ts` (gradients) — it is correct and complete. `src/theme/index.ts` is a thin barrel that re-exports everything plus semantic aliases, so screens can import from one canonical location. Screen fixes then replace raw hex strings with `C.*` / `G.*` references from `useTheme()`.

**Tech Stack:** React Native (Expo), TypeScript, `useTheme()` hook → `{ C: ThemeColors, G: ThemeGradients, isDark }`, `expo-linear-gradient`, Moti animations.

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| **Create** | `src/theme/index.ts` | Barrel re-export + semantic aliases |
| **Modify** | `src/screens/ScenariosScreen.tsx` | Replace `CARD_PALETTES`, `HEADER_GRADIENT`, impact bar colors, locked-state colors |
| **Modify** | `src/screens/ScenarioPlayer.tsx` | Replace `isDark ? '#hex' : '#hex'` patterns with `C.*` tokens |
| **Modify** | `src/screens/PhraseLibrary.tsx` | Replace hardcoded category color map with `C.CATEGORY_*` tokens |
| **Modify** | `src/screens/ProfileScreen.tsx` | Replace 2 hardcoded values |
| **Modify** | `src/screens/OnboardingFlow.tsx` | Replace inline gradient arrays with `G.*` tokens |

---

## Task 1: Create `src/theme/index.ts`

**Files:**
- Create: `src/theme/index.ts`

This file re-exports all design tokens and adds semantic aliases matching the Fasih brand naming the product team uses (Primary/Secondary/Tertiary instead of Gold/Jade/Violet).

- [ ] **Step 1: Create the file**

```typescript
// src/theme/index.ts
// Central theme barrel — import everything from here instead of from
// src/components/design/* directly.

export {
  darkTheme,
  lightTheme,
  SPRING,
  SPRING_SLOW,
  FONT_ARABIC,
  FONT_ARABIC_SEMI,
  FONT_ARABIC_EXTRA,
  FONT_ARABIC_BLACK,
  FONT_HEADING,
  FONT_HEADING_SEMI,
  FONT_HEADING_MEDIUM,
  FONT_HEADING_EXTRA,
  FONT_LATIN,
  FONT_LATIN_LIGHT,
  FONT_LATIN_MEDIUM,
  FONT_LATIN_SEMI,
  FONT_LATIN_BOLD,
} from '../components/design/tokens';
export type { ThemeColors } from '../components/design/tokens';

export {
  darkGradients,
  lightGradients,
  ANGLE_135,
  ANGLE_145,
  ANGLE_TO_BOTTOM,
} from '../components/design/gradients';
export type { ThemeGradients } from '../components/design/gradients';

export { useTheme } from '../hooks/useTheme';
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: zero errors related to the new file.

- [ ] **Step 3: Commit**

```bash
git add src/theme/index.ts
git commit -m "feat: add src/theme/index.ts central design-system barrel"
```

---

## Task 2: Fix `ScenariosScreen.tsx`

**Files:**
- Modify: `src/screens/ScenariosScreen.tsx`

**Problems to fix:**
1. `CARD_PALETTES` — 6 hardcoded `{ bg, accent, iconBg }` objects → use `C.CATEGORY_*` tokens
2. `HEADER_GRADIENT` const — `['#00D69A', '#00FF95', '#02B986']` → use `[C.JADE2, C.GOLD, C.JADE]` inline
3. `ImpactPreviewStrip` colors — `'#4A90D9'`, `'#5BA85A'`, `'#C07AB8'`, `'#FF7043'`, `'#EC407A'`, `'#7E57C2'` → use `C.*` tokens
4. Progress track bg `'#E5E7EB'` → `C.BORDER`
5. Label color `'#6B7280'` → `C.TEXT2`
6. Percent label `'#9CA3AF'` → `C.TEXT3`
7. Locked title `'#9CA3AF'` → `C.TEXT3`, locked subtitle `'#6B7280'` → `C.TEXT2`, locked icon `'#CBD5E1'` → `C.TEXT3`
8. "Coming Soon" badge bg `'#0D0D0D'` → `C.NEUTRAL_900`, text `'#FFFFFF'` → `C.WHITE`

- [ ] **Step 1: Remove `CARD_PALETTES` constant and replace card background logic**

Delete lines 39–46 (the `CARD_PALETTES` array) and replace usage in `ScenarioCard` with theme category colors.

The mapping by index (mod 6):

```
0 → { bg: C.CATEGORY_MINT,  accent: C.JADE,    iconBg: C.JADE_SURFACE }
1 → { bg: C.CATEGORY_BLUE,  accent: C.VIOLET,  iconBg: C.VIOLET_SURFACE }
2 → { bg: C.CATEGORY_CREAM, accent: C.JADE2,   iconBg: C.JADE_SURFACE }
3 → { bg: C.CATEGORY_MINT,  accent: C.JADE,    iconBg: C.JADE_SURFACE }
4 → { bg: C.CATEGORY_BLUE,  accent: C.VIOLET,  iconBg: C.VIOLET_SURFACE }
5 → { bg: C.CATEGORY_PEACH, accent: C.JADE2,   iconBg: C.JADE_SURFACE }
```

Replace the `CARD_PALETTES` constant with a function inside `ScenarioCard`:

```typescript
// Delete CARD_PALETTES array entirely.

// Inside ScenarioCard component, after `const { C } = useTheme();`:
const PALETTES = (c: typeof C) => [
  { bg: c.CATEGORY_MINT,  accent: c.JADE,    iconBg: c.JADE_SURFACE },
  { bg: c.CATEGORY_BLUE,  accent: c.VIOLET,  iconBg: c.VIOLET_SURFACE },
  { bg: c.CATEGORY_CREAM, accent: c.JADE2,   iconBg: c.JADE_SURFACE },
  { bg: c.CATEGORY_MINT,  accent: c.JADE,    iconBg: c.JADE_SURFACE },
  { bg: c.CATEGORY_BLUE,  accent: c.VIOLET,  iconBg: c.VIOLET_SURFACE },
  { bg: c.CATEGORY_PEACH, accent: c.JADE2,   iconBg: c.JADE_SURFACE },
];
```

Then inside `ScenarioCard`:

```typescript
function ScenarioCard({ scenario, index, isLeft, onPress }: { ... }) {
  const { C } = useTheme();   // add this line
  const { iconName, title, phrases, locked, comingSoon, impactPreview, mode } = scenario;
  const Icon = ICON_MAP[iconName] || Coffee;
  const palette = PALETTES(C)[index % 6];
  const cardHeight = BENTO_HEIGHTS[index % BENTO_HEIGHTS.length];
  // ... rest unchanged
```

- [ ] **Step 2: Remove `HEADER_GRADIENT` constant and inline with tokens**

Delete line 53:
```
// DELETE: const HEADER_GRADIENT: [string, string, string] = ['#00D69A', '#00FF95', '#02B986'];
```

In `ScenariosScreen`, add `const { C, G } = useTheme();` at the top of the component (it already has `const { C, G } = useTheme();`).

Replace the `LinearGradient` usage:
```typescript
// BEFORE:
<LinearGradient colors={HEADER_GRADIENT} ...>

// AFTER:
<LinearGradient colors={[C.JADE2, C.GOLD, C.JADE] as [string,string,string]} ...>
```

- [ ] **Step 3: Fix `ImpactPreviewStrip` — pass `C` as prop and replace hex colors**

`ImpactPreviewStrip` is a standalone function component that doesn't currently call `useTheme`. Add the hook:

```typescript
function ImpactPreviewStrip({
  impactPreview,
  mode,
}: {
  impactPreview: ImpactMetrics;
  mode: 'career' | 'social';
}) {
  const { C } = useTheme();   // ADD THIS
  const isCareer = mode === 'career';

  const metrics = isCareer
    ? [
        { label: 'Trust',   value: impactPreview.trust,   color: C.CULTURAL_GOLD },
        { label: 'Respect', value: impactPreview.respect, color: C.JADE },
        { label: 'Culture', value: impactPreview.culture, color: C.VIOLET },
      ]
    : [
        { label: '🔥 Vibe',    value: impactPreview.trust,   color: C.ERROR },
        { label: '🤝 Rapport', value: impactPreview.respect, color: C.JADE },
        { label: '🌙 Culture', value: impactPreview.culture, color: C.VIOLET },
      ];
```

Then fix the remaining inline colors in the render:
```typescript
// Label text: '#6B7280' → C.TEXT2
color: C.TEXT2,

// Progress track background: '#E5E7EB' → C.BORDER
backgroundColor: C.BORDER,

// Percentage text: '#9CA3AF' → C.TEXT3
color: C.TEXT3,
```

- [ ] **Step 4: Fix locked state + Coming Soon badge colors in `ScenarioCard`**

```typescript
// Title text:
// BEFORE: color: locked ? '#9CA3AF' : '#1F2937',
// AFTER:
color: locked ? C.TEXT3 : C.TEXT,

// Subtitle text:
// BEFORE: color: locked ? '#9CA3AF' : '#6B7280',
// AFTER:
color: locked ? C.TEXT3 : C.TEXT2,

// Icon:
// BEFORE: color={locked ? '#CBD5E1' : palette.accent}
// AFTER:
color={locked ? C.TEXT3 : palette.accent}

// Coming Soon badge background:
// BEFORE: backgroundColor: '#0D0D0D',
// AFTER:
backgroundColor: C.NEUTRAL_900,

// Coming Soon text:
// BEFORE: color: '#FFFFFF',
// AFTER:
color: C.WHITE,
```

- [ ] **Step 5: Verify no hardcoded hex remains**

```bash
grep -n "#[0-9A-Fa-f]\{6\}" src/screens/ScenariosScreen.tsx
```

Expected: zero matches.

- [ ] **Step 6: Commit**

```bash
git add src/screens/ScenariosScreen.tsx
git commit -m "fix: replace hardcoded colors in ScenariosScreen with theme tokens"
```

---

## Task 3: Fix `ScenarioPlayer.tsx`

**Files:**
- Modify: `src/screens/ScenarioPlayer.tsx`

**Problems to fix (all are `isDark ? '#hex' : '#hex'` patterns):**
- `trustColor = isDark ? '#FFB800' : '#B8860B'` → `C.CULTURAL_GOLD`
- `respectColor = isDark ? '#00D69A' : '#02936B'` → `C.JADE2`
- `cultureColor = isDark ? '#38BDF8' : '#0369A1'` → `C.VIOLET`
- `accentText = isDark ? C.GOLD : '#02936B'` → `C.JADE` (dark jade is readable on both modes)
- Dot `backgroundColor: isDark ? C.JADE2 : '#02936B'` → `C.JADE`
- `jadeText = isDark ? C.JADE2 : '#02936B'` → `C.JADE`
- `accentColor = isDark ? C.GOLD : '#02936B'` → `C.JADE`
- `violetColor = isDark ? C.VIOLET2 : '#0369A1'` → `C.VIOLET`
- Inline repeat at lines 680–682: same trust/respect/culture pattern
- Inline repeat at lines 752–754: same pattern
- Line 820: `isDark ? C.JADE2 : '#02936B'` → `C.JADE`

**Key insight:** `C.CULTURAL_GOLD`, `C.JADE2`, `C.VIOLET` already have light-mode values that are legible (`#FFB800`, `#00D69A`, `#00D6FC`). The comment says neon green is illegible on light — that's true for `C.GOLD` (#00FF95), but `C.JADE` (#02B986) and `C.JADE2` (#00D69A) are dark enough for light mode. The existing `isDark` ternaries were compensating for this correctly — we're collapsing them to the teal/jade tokens which are readable in both modes.

- [ ] **Step 1: Fix `ImpactBar` component (lines 37–76)**

```typescript
function ImpactBar({ trust, respect, culture, maxValues }: { ... }) {
  const { C } = useTheme();   // REMOVE isDark from destructure
  // DELETE the three trustColor/respectColor/cultureColor lines
  // USE direct token references instead:

  const Col = ({ label, value, color, maxVal }: ...) => { ... };

  return (
    // ...
    <Col label="Trust"   value={trust}   color={C.CULTURAL_GOLD} maxVal={max.trust} />
    // ...
    <Col label="Respect" value={respect} color={C.JADE2}         maxVal={max.respect} />
    // ...
    <Col label="Culture" value={culture} color={C.VIOLET}        maxVal={max.culture} />
  );
}
```

- [ ] **Step 2: Fix `DialogueBubble` component**

```typescript
function DialogueBubble({ scene }: { scene: ScenarioScene }) {
  const { C } = useTheme();   // remove isDark
  // DELETE: const accentText = isDark ? C.GOLD : '#02936B';
  // REPLACE all uses of accentText with C.JADE
```

Find every occurrence of `accentText` and replace with `C.JADE`.

Find the dot background:
```typescript
// BEFORE: backgroundColor: isDark ? C.JADE2 : '#02936B'
// AFTER:  backgroundColor: C.JADE
```

- [ ] **Step 3: Fix result/choice-result phase inline colors (lines 167–194)**

```typescript
// BEFORE:
const jadeText = isDark ? C.JADE2 : '#02936B';
const accentColor = isDark ? C.GOLD : '#02936B';
const violetColor = isDark ? C.VIOLET2 : '#0369A1';

// AFTER (delete those 3 lines, replace usages):
// jadeText    → C.JADE
// accentColor → C.JADE
// violetColor → C.VIOLET
```

- [ ] **Step 4: Fix inline choice impact labels (lines 680–682)**

```typescript
// BEFORE:
<Text style={{ ..., color: isDark ? '#FFB800' : '#B8860B' }}>T: ...</Text>
<Text style={{ ..., color: isDark ? '#00D69A' : '#02936B' }}>R: ...</Text>
<Text style={{ ..., color: isDark ? '#38BDF8' : '#0369A1' }}>C: ...</Text>

// AFTER:
<Text style={{ ..., color: C.CULTURAL_GOLD }}>T: ...</Text>
<Text style={{ ..., color: C.JADE2 }}>R: ...</Text>
<Text style={{ ..., color: C.VIOLET }}>C: ...</Text>
```

- [ ] **Step 5: Fix end-of-scenario summary bar (lines 752–754)**

```typescript
// BEFORE:
{ label: 'Trust',   value: trust,   color: isDark ? '#FFB800' : '#B8860B' },
{ label: 'Respect', value: respect, color: isDark ? '#00D69A' : '#02936B' },
{ label: 'Culture', value: culture, color: isDark ? '#38BDF8' : '#0369A1' },

// AFTER:
{ label: 'Trust',   value: trust,   color: C.CULTURAL_GOLD },
{ label: 'Respect', value: respect, color: C.JADE2 },
{ label: 'Culture', value: culture, color: C.VIOLET },
```

- [ ] **Step 6: Fix remaining jade reference (line 820)**

```typescript
// BEFORE: color: isDark ? C.JADE2 : '#02936B'
// AFTER:  color: C.JADE
```

- [ ] **Step 7: Verify no hardcoded hex remains**

```bash
grep -n "#[0-9A-Fa-f]\{6\}" src/screens/ScenarioPlayer.tsx
```

Expected: zero matches.

- [ ] **Step 8: Commit**

```bash
git add src/screens/ScenarioPlayer.tsx
git commit -m "fix: replace isDark hex ternaries in ScenarioPlayer with theme tokens"
```

---

## Task 4: Fix `PhraseLibrary.tsx`

**Files:**
- Modify: `src/screens/PhraseLibrary.tsx`

**Problem:** Lines 26–33 define a hardcoded `CATEGORY_STYLES` map with raw hex values for `bg`, `accent`, and `darkBg`. The `bg` colors match `C.CATEGORY_*` tokens exactly. The `accent` values can be mapped to `C.JADE`, `C.VIOLET`, `C.CULTURAL_GOLD`, etc.

- [ ] **Step 1: Replace `CATEGORY_STYLES` constant with a theme-aware function**

The existing constant (to be deleted):
```typescript
// DELETE lines 26–33:
const CATEGORY_STYLES: Record<string, { bg: string; accent: string; darkBg: string }> = {
  'Greetings':   { bg: '#E0FAFF', accent: '#00D6FC', darkBg: '#00D6FC' },
  'Gratitude':   { bg: '#FFE0EC', accent: '#E84D6D', darkBg: '#E84D6D' },
  'Hospitality': { bg: '#FFF5E0', accent: '#D4920A', darkBg: '#FFB800' },
  'Workplace':   { bg: '#E0FFF0', accent: '#02B986', darkBg: '#02B986' },
  'Social':      { bg: '#FFE0D0', accent: '#E86735', darkBg: '#FF8C42' },
  'Everyday':    { bg: '#D5F5EC', accent: '#1AB387', darkBg: '#22C993' },
  'Food & Drink':{ bg: '#FFECD0', accent: '#D4700A', darkBg: '#FFB800' },
  'Family':      { bg: '#D0E8FF', accent: '#4A7FE0', darkBg: '#6D8FFC' },
};
```

Replace with a function that takes `C` and returns the same shape using tokens:

```typescript
function getCategoryStyles(C: ThemeColors): Record<string, { bg: string; accent: string }> {
  return {
    'Greetings':    { bg: C.CATEGORY_BLUE,  accent: C.VIOLET },
    'Gratitude':    { bg: C.CATEGORY_PINK,  accent: C.ERROR },
    'Hospitality':  { bg: C.CATEGORY_CREAM, accent: C.CULTURAL_GOLD },
    'Workplace':    { bg: C.CATEGORY_MINT,  accent: C.JADE },
    'Social':       { bg: C.CATEGORY_PEACH, accent: C.ERROR },
    'Everyday':     { bg: C.CATEGORY_MINT,  accent: C.JADE2 },
    'Food & Drink': { bg: C.CATEGORY_CREAM, accent: C.CULTURAL_GOLD },
    'Family':       { bg: C.CATEGORY_BLUE,  accent: C.VIOLET },
  };
}
```

Add `ThemeColors` to the import from tokens (or from `../theme`):
```typescript
import { ThemeColors, FONT_... } from '../components/design/tokens';
```

- [ ] **Step 2: Update call sites**

Find all usages of `CATEGORY_STYLES[category]` in the component and replace with `getCategoryStyles(C)[category]`. The component already has `const { C, G, isDark } = useTheme();`, so `C` is available.

Also fix line 437:
```typescript
// BEFORE: color: active ? '#FFFFFF' : C.TEXT3
// AFTER:  color: active ? C.WHITE : C.TEXT3
```

And line 495 (already uses tokens-ish but references raw hex):
```typescript
// BEFORE: colors={isDark ? ['#0A1F14', '#0A0F0C'] : ['#E8FFF0', '#D5F5EC']}
// AFTER:  colors={isDark ? G.SCENARIO_GOLD_STOPS : G.SCENARIO_JADE_STOPS}
```

- [ ] **Step 3: Verify no hardcoded hex remains**

```bash
grep -n "#[0-9A-Fa-f]\{6\}" src/screens/PhraseLibrary.tsx
```

Expected: zero matches.

- [ ] **Step 4: Commit**

```bash
git add src/screens/PhraseLibrary.tsx
git commit -m "fix: replace hardcoded category colors in PhraseLibrary with theme tokens"
```

---

## Task 5: Fix `ProfileScreen.tsx`

**Files:**
- Modify: `src/screens/ProfileScreen.tsx`

**Problems (2 violations):**
1. Line 130: `color="#E066A0"` and `color="#E066A0"` in `<StatCard>` — hardcoded pink icon color
2. Line 359: `<LinearGradient colors={['#FBBF24', '#F59E0B']}` — hardcoded amber/gold premium badge gradient

- [ ] **Step 1: Fix StatCard icon color**

```typescript
// BEFORE (line 130):
<StatCard icon={<MessageCircle size={18} color="#E066A0" />} value={...} label={...} color="#E066A0" bg={C.CATEGORY_PINK} />

// AFTER:
<StatCard icon={<MessageCircle size={18} color={C.ERROR} />} value={...} label={...} color={C.ERROR} bg={C.CATEGORY_PINK} />
```

- [ ] **Step 2: Fix premium badge gradient**

```typescript
// BEFORE (line 359):
<LinearGradient colors={['#FBBF24', '#F59E0B']} ...>

// AFTER:
<LinearGradient colors={[C.CULTURAL_GOLD, C.CULTURAL_GOLD_DARK] as [string,string]} ...>
```

- [ ] **Step 3: Verify**

```bash
grep -n "#[0-9A-Fa-f]\{6\}" src/screens/ProfileScreen.tsx
```

Expected: zero matches.

- [ ] **Step 4: Commit**

```bash
git add src/screens/ProfileScreen.tsx
git commit -m "fix: replace hardcoded colors in ProfileScreen with theme tokens"
```

---

## Task 6: Fix `OnboardingFlow.tsx`

**Files:**
- Modify: `src/screens/OnboardingFlow.tsx`

**Problems (42 violations — many are SVG/decorative `'#FFFFFF'` on gradient surfaces, which are intentional and correct. Focus only on the structural/brand violations):**

Categorized violations:
- `'#FFFFFF'` on gradient surfaces (decorative) → these are intentional, leave them
- `'#0D0E12'` in scrim gradient → `C.BG`
- Streak icon gradient `['#02B986', '#016B4E']` → `G.PRIMARY_STOPS` (first 2)
- Sparkles icon gradient `['#34D9A5', '#22C993']` → `[C.JADE2, C.JADE]`
- Flame icon gradient `['#FBBF24', '#F59E0B']` → `[C.CULTURAL_GOLD, C.CULTURAL_GOLD_DARK]`
- Lock icon gradient `['#64748B', '#475569']` → `[C.NEUTRAL_600, C.NEUTRAL_700]`
- Label color `i === 2 ? '#F59E0B'` → `C.CULTURAL_GOLD`
- Feature icon gradients (line 1021–1027): same pattern as above
- `'rgba(0,0,0,0.6)'` / `'rgba(0,0,0,0.85)'` scrim → acceptable (generic dark overlay)

- [ ] **Step 1: Fix scrim gradient background stop**

```typescript
// BEFORE (line 350):
<LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.85)', '#0D0E12']} ...>

// AFTER:
<LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.85)', C.BG] as [string,string,string,string]} ...>
```

- [ ] **Step 2: Fix streak/plan tier icon gradients (lines 965–968)**

```typescript
// BEFORE:
{ Icon: Zap,      fill: true,  gradientColors: ['#02B986', '#016B4E'] as [string, string] },
{ Icon: Sparkles, fill: false, gradientColors: ['#34D9A5', '#22C993'] as [string, string] },
{ Icon: Flame,    fill: true,  gradientColors: ['#FBBF24', '#F59E0B'] as [string, string] },
{ Icon: Lock,     fill: false, gradientColors: ['#64748B', '#475569'] as [string, string] },

// AFTER (these need C so must be inside the component — move to useMemo or inline):
{ Icon: Zap,      fill: true,  gradientColors: [C.JADE,          C.PRIMARY_DARK]         as [string, string] },
{ Icon: Sparkles, fill: false, gradientColors: [C.JADE2,         C.JADE]                 as [string, string] },
{ Icon: Flame,    fill: true,  gradientColors: [C.CULTURAL_GOLD, C.CULTURAL_GOLD_DARK]   as [string, string] },
{ Icon: Lock,     fill: false, gradientColors: [C.NEUTRAL_600,   C.NEUTRAL_700]          as [string, string] },
```

The array is defined inline inside the render (already inside the component body), so `C` is accessible.

- [ ] **Step 3: Fix label color for Flame tier (line 970)**

```typescript
// BEFORE:
const labelColor = i === 0 ? C.GOLD : i === 1 ? C.JADE2 : i === 2 ? '#F59E0B' : C.TEXT3;

// AFTER:
const labelColor = i === 0 ? C.GOLD : i === 1 ? C.JADE2 : i === 2 ? C.CULTURAL_GOLD : C.TEXT3;
```

- [ ] **Step 4: Fix feature icon gradients (lines 1021–1027)**

```typescript
// BEFORE:
{ Icon: Mic,        gradientColors: ['#02B986', '#016B4E'] as [string, string] },
{ Icon: BookOpen,   gradientColors: ['#FBBF24', '#F59E0B'] as [string, string] },
{ Icon: Layers,     gradientColors: ['#34D9A5', '#22C993'] as [string, string] },
{ Icon: Globe,      gradientColors: ['#FF8A7A', '#E8766C'] as [string, string] },
{ Icon: Trophy,     gradientColors: ['#00D6FC', '#00A0C0'] as [string, string] },
{ Icon: TrendingUp, gradientColors: ['#2DD4BF', '#14B8A6'] as [string, string] },

// AFTER:
{ Icon: Mic,        gradientColors: [C.JADE,          C.PRIMARY_DARK]       as [string, string] },
{ Icon: BookOpen,   gradientColors: [C.CULTURAL_GOLD, C.CULTURAL_GOLD_DARK] as [string, string] },
{ Icon: Layers,     gradientColors: [C.JADE2,         C.JADE]               as [string, string] },
{ Icon: Globe,      gradientColors: [C.ERROR,         C.ERROR]              as [string, string] },
{ Icon: Trophy,     gradientColors: [C.VIOLET,        C.TERTIARY]           as [string, string] },
{ Icon: TrendingUp, gradientColors: [C.JADE2,         C.JADE]               as [string, string] },
```

- [ ] **Step 5: Leave intentional `'#FFFFFF'` values**

The following are correct and should NOT be changed — they are white text/icons/fills on gradient or dark surfaces where a literal white is the right value regardless of theme:
- Lines 765, 770: `color={'#FFFFFF'}` on gradient hold-button
- Lines 830–831, 845, 863: SVG `stopColor`/`fill`/`stroke` `"#FFFFFF"` in the app store badge illustration
- Line 856: `fill="#000000"` shadow in SVG illustration
- Lines 980, 1037, 1099: `color="#FFFFFF"` icons on colored gradient tiles
- Line 313: `color: '#FFFFFF'` text on gradient button surface

These are on colored/gradient backgrounds and the white is content, not a brand color decision.

- [ ] **Step 6: Verify remaining hex values are all intentional whites/blacks on gradients**

```bash
grep -n "#[0-9A-Fa-f]\{6\}" src/screens/OnboardingFlow.tsx
```

Remaining matches should only be `#FFFFFF`, `#000000`, `#0D0E12` → all replaced above except the intentional SVG decoration ones.

- [ ] **Step 7: Commit**

```bash
git add src/screens/OnboardingFlow.tsx
git commit -m "fix: replace hardcoded brand gradients in OnboardingFlow with theme tokens"
```

---

## Self-Review

### Spec Coverage

| Requirement | Task |
|-------------|------|
| `src/theme/index.ts` central file | Task 1 ✓ |
| Brand colors match spec | Already correct in `tokens.ts` — no change needed ✓ |
| Typography tokens | Already correct in `tokens.ts` — re-exported in Task 1 ✓ |
| Fix most broken screen (ScenariosScreen) | Task 2 ✓ |
| Fix ScenarioPlayer isDark patterns | Task 3 ✓ |
| Fix PhraseLibrary category map | Task 4 ✓ |
| Fix ProfileScreen 2 values | Task 5 ✓ |
| Fix OnboardingFlow brand gradients | Task 6 ✓ |
| HomeScreen (2 violations) | Omitted — violations are minor and HomeScreen already uses `C.*` correctly in most places; the 2 remaining are in `LinearGradient` using `G.*` — review after Task 6 and add a task if needed |
| PracticeScreen (1 violation) | Omitted — 1 violation, review after Task 6 |

### Placeholder Scan

No TBDs, TODOs, or vague steps found.

### Type Consistency

- `ThemeColors` used consistently as `C: ThemeColors`
- `C.PRIMARY_DARK` referenced in Tasks 2 and 6 — defined in `darkTheme` as `'#02B986'` ✓
- `C.NEUTRAL_600`, `C.NEUTRAL_700` referenced in Task 6 — defined in `darkTheme` ✓
- `G.SCENARIO_GOLD_STOPS`, `G.SCENARIO_JADE_STOPS` referenced in Task 4 — defined in `ThemeGradients` ✓
- `getCategoryStyles` takes `ThemeColors` — exported type available from tokens ✓
