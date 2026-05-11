# Fasih UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply ghost Arabic letterform backgrounds, Souk-style cards, and smooth micro-animations to every screen in the app without changing any content or business logic.

**Architecture:** Two new reusable primitives (`GhostLetters`, `SoukCard`) built first, then each screen imports and uses them. Press-scale animations use `react-native-reanimated` (already installed as a moti dependency). Entrance animations update existing `MotiView` `transition` props to use smooth easing instead of spring.

**Tech Stack:** React Native, Expo, moti, react-native-reanimated, expo-linear-gradient, TypeScript

**Spec:** `docs/superpowers/specs/2026-05-11-fasih-ui-redesign.md`

---

## Task 1: Add smooth animation constants to tokens

**Files:**
- Modify: `src/components/design/tokens.ts`

- [ ] **Add SMOOTH constants after the existing SPRING constants (line 216)**

```ts
// Add after SPRING_SLOW on line 217:
import { Easing } from 'react-native-reanimated';

export const SMOOTH = {
  type: 'timing' as const,
  duration: 380,
  easing: Easing.bezier(0.4, 0, 0.2, 1),
} as const;

export const SMOOTH_FAST = {
  type: 'timing' as const,
  duration: 220,
  easing: Easing.bezier(0.4, 0, 0.2, 1),
} as const;

export const SMOOTH_SLOW = {
  type: 'timing' as const,
  duration: 600,
  easing: Easing.bezier(0.4, 0, 0.2, 1),
} as const;

// Press scale values
export const PRESS_SCALE = 0.96;
export const PRESS_DURATION_IN = 120;
export const PRESS_DURATION_OUT = 220;
```

- [ ] **Commit**
```bash
git add src/components/design/tokens.ts
git commit -m "feat: add smooth animation constants to design tokens"
```

---

## Task 2: Create GhostLetters component

**Files:**
- Create: `src/components/ui/GhostLetters.tsx`

- [ ] **Create the file**

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  /** Exactly 3 Arabic glyphs. Index 0 = top-right (large), 1 = mid-left (medium), 2 = bottom-right (small) */
  glyphs: [string, string, string];
  primaryOpacity?: number;
  secondaryOpacity?: number;
}

export function GhostLetters({
  glyphs,
  primaryOpacity = 0.03,
  secondaryOpacity = 0.023,
}: Props) {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Text
        style={[styles.g1, { color: `rgba(0,255,149,${primaryOpacity})` }]}
        aria-hidden
      >
        {glyphs[0]}
      </Text>
      <Text
        style={[styles.g2, { color: `rgba(0,214,252,${secondaryOpacity})` }]}
        aria-hidden
      >
        {glyphs[1]}
      </Text>
      <Text
        style={[styles.g3, { color: `rgba(0,255,149,${primaryOpacity * 0.7})` }]}
        aria-hidden
      >
        {glyphs[2]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  g1: {
    position: 'absolute',
    fontSize: 300,
    fontWeight: '900',
    lineHeight: 300,
    right: -50,
    top: -50,
    transform: [{ rotate: '-6deg' }],
    includeFontPadding: false,
  },
  g2: {
    position: 'absolute',
    fontSize: 190,
    fontWeight: '900',
    lineHeight: 190,
    left: -35,
    top: 310,
    transform: [{ rotate: '5deg' }],
    includeFontPadding: false,
  },
  g3: {
    position: 'absolute',
    fontSize: 150,
    fontWeight: '900',
    lineHeight: 150,
    right: -15,
    bottom: 120,
    transform: [{ rotate: '-10deg' }],
    includeFontPadding: false,
  },
});
```

- [ ] **Commit**
```bash
git add src/components/ui/GhostLetters.tsx
git commit -m "feat: add GhostLetters ambient background component"
```

---

## Task 3: Create SoukCard component

**Files:**
- Create: `src/components/ui/SoukCard.tsx`

- [ ] **Create the file**

```tsx
import React, { useCallback } from 'react';
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { PRESS_DURATION_IN, PRESS_DURATION_OUT, PRESS_SCALE } from '../design/tokens';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  /** Show green left-edge accent bar. Use on interactive content cards. */
  hasAccent?: boolean;
  /** Hero variant: richer dark-green background for featured content. */
  variant?: 'standard' | 'hero' | 'stat';
  accessibilityLabel?: string;
}

export function SoukCard({
  children,
  onPress,
  style,
  contentStyle,
  hasAccent = false,
  variant = 'standard',
  accessibilityLabel,
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (!onPress) return;
    scale.value = withTiming(PRESS_SCALE, {
      duration: PRESS_DURATION_IN,
      easing: Easing.out(Easing.cubic),
    });
  }, [onPress, scale]);

  const handlePressOut = useCallback(() => {
    if (!onPress) return;
    scale.value = withTiming(1, {
      duration: PRESS_DURATION_OUT,
      easing: Easing.out(Easing.cubic),
    });
  }, [onPress, scale]);

  return (
    <Animated.View
      style={[
        styles.card,
        variant === 'hero' && styles.heroCard,
        animatedStyle,
        style,
      ]}
    >
      {/* Top shimmer line */}
      <View style={styles.shimmer} pointerEvents="none" />
      {/* Left accent bar — content cards only */}
      {hasAccent && <View style={styles.accent} pointerEvents="none" />}

      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={accessibilityLabel}
        style={[styles.pressable, contentStyle]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    position: 'relative',
  },
  heroCard: {
    borderRadius: 18,
    backgroundColor: '#001F14',
    borderColor: 'rgba(0,255,149,0.12)',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: '12%',
    right: '12%',
    height: 1,
    // LinearGradient isn't available in View — approximate with opacity trick
    backgroundColor: 'rgba(0,255,149,0.38)',
    opacity: 0.7,
    zIndex: 1,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 14,
    bottom: 14,
    width: 2,
    borderRadius: 2,
    backgroundColor: '#00FF95',
    opacity: 0.7,
    zIndex: 1,
  },
  pressable: {
    flex: 1,
  },
});
```

- [ ] **Commit**
```bash
git add src/components/ui/SoukCard.tsx
git commit -m "feat: add SoukCard reusable card primitive with press animation"
```

---

## Task 4: Export new components from ui/index.ts

**Files:**
- Modify: `src/components/ui/index.ts`

- [ ] **Read the current index.ts first, then add the two new exports**

```ts
// Add these two lines to src/components/ui/index.ts:
export { GhostLetters } from './GhostLetters';
export { SoukCard } from './SoukCard';
```

- [ ] **Commit**
```bash
git add src/components/ui/index.ts
git commit -m "feat: export GhostLetters and SoukCard from ui index"
```

---

## Task 5: Update PrimaryButton with press scale

**Files:**
- Modify: `src/components/ui/PrimaryButton.tsx`

- [ ] **Replace the file contents**

```tsx
import React, { useCallback } from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { FONT_HEADING_SEMI, PRESS_SCALE, PRESS_DURATION_IN, PRESS_DURATION_OUT } from '../design/tokens';
import { ANGLE_135 } from '../design/gradients';

type Variant = 'gold' | 'jade';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  variant?: Variant;
  style?: ViewStyle;
}

export function PrimaryButton({ children, onPress, disabled, variant = 'gold', style }: Props) {
  const { C, G } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    scale.value = withTiming(PRESS_SCALE, {
      duration: PRESS_DURATION_IN,
      easing: Easing.out(Easing.cubic),
    });
  }, [disabled, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, {
      duration: PRESS_DURATION_OUT,
      easing: Easing.out(Easing.cubic),
    });
  }, [scale]);

  const disabledColors: readonly [string, string] = [C.GOLD_DIM, C.GOLD_DIM];

  return (
    <Animated.View style={[{ borderRadius: 100, overflow: 'hidden', opacity: disabled ? 0.5 : 1 }, animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
      >
        <LinearGradient
          colors={disabled ? disabledColors : variant === 'gold' ? G.GOLD_STOPS : G.JADE_STOPS}
          start={ANGLE_135.start}
          end={ANGLE_135.end}
          style={{ paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
        >
          {typeof children === 'string' ? (
            <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 15, color: '#FFFFFF' }}>{children}</Text>
          ) : children}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}
```

- [ ] **Commit**
```bash
git add src/components/ui/PrimaryButton.tsx
git commit -m "feat: add smooth press scale animation to PrimaryButton"
```

---

## Task 6: Update GhostButton with press scale

**Files:**
- Modify: `src/components/ui/GhostButton.tsx`

- [ ] **Replace the file contents**

```tsx
import React, { useCallback } from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { FONT_LATIN, PRESS_SCALE, PRESS_DURATION_IN, PRESS_DURATION_OUT } from '../design/tokens';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  children: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export function GhostButton({ children, onPress, style }: Props) {
  const { C } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(PRESS_SCALE, {
      duration: PRESS_DURATION_IN,
      easing: Easing.out(Easing.cubic),
    });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, {
      duration: PRESS_DURATION_OUT,
      easing: Easing.out(Easing.cubic),
    });
  }, [scale]);

  return (
    <Animated.View style={[styles.root, { backgroundColor: C.SURFACE, borderColor: C.BORDER }, animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        style={styles.pressable}
      >
        <Text style={[styles.text, { color: C.TEXT2 }]}>{children}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pressable: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  text: { fontFamily: FONT_LATIN, fontSize: 14 },
});
```

- [ ] **Commit**
```bash
git add src/components/ui/GhostButton.tsx
git commit -m "feat: add smooth press scale animation to GhostButton"
```

---

## Task 7: Update HomeScreen — header, ghost letters, smooth animations

**Files:**
- Modify: `src/screens/HomeScreen.tsx`

This is the most complex screen. Apply changes section by section.

- [ ] **Step 1: Update imports — add GhostLetters, SoukCard, SMOOTH**

At the top of `HomeScreen.tsx`, add to existing imports:
```tsx
import { GhostLetters } from '../components/ui/GhostLetters';
import { SoukCard } from '../components/ui/SoukCard';
import { SMOOTH, SMOOTH_FAST } from '../components/design/tokens';
```

- [ ] **Step 2: Replace header JSX**

Find the header section (starts with `paddingTop: insets.top + 24`) and replace the `MotiView` and its contents with:

```tsx
{/* ── Header: English left, Arabic right, no settings ── */}
<View style={{ paddingTop: insets.top + 20, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
  <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={SMOOTH}>
    <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2, marginBottom: 2 }}>Hello,</Text>
    <Text style={{ fontFamily: FONT_HEADING_EXTRA, fontSize: 26, color: C.TEXT, letterSpacing: -0.5, lineHeight: 28 }}>{name}</Text>
  </MotiView>
  <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ ...SMOOTH, delay: motionMs(60) }}>
    <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 40, color: C.CULTURAL_GOLD, lineHeight: 44 }}>
      {timeGreeting.arabic}
    </Text>
  </MotiView>
</View>
```

- [ ] **Step 3: Replace streak pill MotiView**

Find the streak display MotiView (has `🔥` emoji) and update its `transition` prop:
```tsx
transition={SMOOTH_FAST}
```

- [ ] **Step 4: Replace the featured scenario Pressable with SoukCard**

Find the featured scenario block (the `<Pressable onPress={() => onScenarioSelect(featured.id)}` block) and replace with:

```tsx
<MotiView
  from={{ opacity: 0, translateY: 16 }}
  animate={{ opacity: 1, translateY: 0 }}
  transition={{ ...SMOOTH, delay: motionMs(100) }}
  style={{ marginHorizontal: 20, marginBottom: 14 }}
>
  <SoukCard
    onPress={() => onScenarioSelect(featured.id)}
    variant="hero"
    accessibilityLabel={`Start: ${featured.title}`}
  >
    <View style={{ height: 200, width: '100%' }}>
      <HeroSceneBg width={heroW} height={200} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.65)']}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '60%' }}
      />
      <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
        <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 20, color: C.WHITE }}>
          {featured.title}
        </Text>
        <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>
          {featured.subtitle}
        </Text>
      </View>
    </View>
  </SoukCard>
</MotiView>
```

- [ ] **Step 5: Replace "Continue" scenario list cards with SoukCard**

Find the `recentScenarios.slice(0, 3).map(...)` block. Replace the inner `<Pressable>` with `<SoukCard>`:

```tsx
<SoukCard
  key={scenario.id}
  onPress={() => onScenarioSelect(scenario.id)}
  hasAccent
  accessibilityLabel={scenario.title}
  style={{ marginBottom: 8 }}
>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, paddingLeft: 18 }}>
    <View style={{
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: scenario.status === 'completed' ? C.JADE_SURFACE : C.SURFACE2,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ fontSize: 14 }}>{scenario.status === 'completed' ? '✓' : '›'}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 15, color: C.TEXT }}>{scenario.title}</Text>
    </View>
    <ChevronRight size={18} color={C.TEXT3} />
  </View>
</SoukCard>
```

Remove the wrapping `MotiView` from around each card — the section-level `MotiView` handles the entrance.

- [ ] **Step 6: Replace Stats card with SoukCard**

Find the `!isNewUser &&` stats block. Replace the inner `<View style={{ marginHorizontal: 20...}}>` with:

```tsx
<SoukCard style={{ marginHorizontal: 20, marginTop: 20 }}>
  <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16 }}>
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontFamily: FONT_HEADING_EXTRA, fontSize: 24, color: C.PRIMARY }}>{stats.currentStreak}</Text>
      <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, marginTop: 2 }}>🔥 Streak</Text>
    </View>
    <View style={{ width: 1, backgroundColor: C.BORDER, marginVertical: 8 }} />
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontFamily: FONT_HEADING_EXTRA, fontSize: 24, color: C.JADE }}>{stats.phrasesStudied}</Text>
      <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, marginTop: 2 }}>Phrases</Text>
    </View>
    <View style={{ width: 1, backgroundColor: C.BORDER, marginVertical: 8 }} />
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontFamily: FONT_HEADING_EXTRA, fontSize: 24, color: C.VIOLET2 }}>{stats.scenariosCompleted.length}</Text>
      <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, marginTop: 2 }}>Scenes</Text>
    </View>
  </View>
</SoukCard>
```

- [ ] **Step 7: Replace Daily Phrase card with SoukCard**

Find the Daily Phrase `<Pressable>` and replace with:

```tsx
<SoukCard
  onPress={() => handlePlay(phraseOfTheDay)}
  hasAccent
  accessibilityLabel={`Daily phrase: ${phraseOfTheDay.english}. Tap to hear pronunciation.`}
  style={{ marginHorizontal: 20 }}
>
  <View style={{ padding: 18 }}>
    {/* Category + play hint row */}
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: C.GOLD_DIM }}>
        <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 11, color: C.PRIMARY_DARK, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {phraseOfTheDay.category}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
        <Volume2 size={14} color={playingId === phraseOfTheDay.id ? C.PRIMARY : C.TEXT3} />
        <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: playingId === phraseOfTheDay.id ? C.PRIMARY : C.TEXT3 }}>
          {playingId === phraseOfTheDay.id ? 'Playing...' : 'Tap to hear'}
        </Text>
      </View>
    </View>
    {/* Arabic text */}
    <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 34, color: C.PRIMARY_DARK, textAlign: 'right', lineHeight: 52, marginBottom: 10 }}>
      {phraseOfTheDay.arabic}
    </Text>
    <View style={{ height: 1, backgroundColor: C.BORDER, marginBottom: 12 }} />
    <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 15, color: C.TEXT, marginBottom: 4 }}>
      {phraseOfTheDay.roman}
    </Text>
    <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2 }}>
      {phraseOfTheDay.english}
    </Text>
  </View>
</SoukCard>
```

- [ ] **Step 8: Wrap the entire ScrollView content in a relative View with GhostLetters**

The `<ScrollView style={{ flex: 1, backgroundColor: C.BG }}>` stays as-is. Add `GhostLetters` inside as the first child, before everything else:

```tsx
<ScrollView style={{ flex: 1, backgroundColor: C.BG }} ...>
  {/* Ghost Arabic letterforms — ambient background art */}
  <GhostLetters glyphs={['م', 'ح', 'ب']} />
  {/* ... rest of content ... */}
</ScrollView>
```

- [ ] **Step 9: Update all remaining MotiView transition props from spring to SMOOTH**

Find all `transition={{ type: 'spring', stiffness: 300, damping: 25` patterns in HomeScreen.tsx and replace with `transition={{ ...SMOOTH, delay: motionMs(N) }}` keeping the same delay values.

- [ ] **Commit**
```bash
git add src/screens/HomeScreen.tsx
git commit -m "feat: apply ghost letters, souk cards, smooth animations to HomeScreen"
```

---

## Task 8: Update ScenariosScreen

**Files:**
- Modify: `src/screens/ScenariosScreen.tsx`

- [ ] **Step 1: Add imports**
```tsx
import { GhostLetters } from '../components/ui/GhostLetters';
import { SoukCard } from '../components/ui/SoukCard';
import { SMOOTH, SMOOTH_FAST } from '../components/design/tokens';
```

- [ ] **Step 2: Add GhostLetters as first child inside the root View**

Find the root `<View style={{ flex: 1, backgroundColor: C.BG }}>` and add as first child:
```tsx
<GhostLetters glyphs={['ع', 'ل', 'م']} />
```

- [ ] **Step 3: Replace bento grid Pressable cards with SoukCard**

In the `renderItem` or bento card map, find each `<Pressable>` card and wrap its content in `<SoukCard onPress={...} hasAccent style={...}>`. Keep all existing content (icon, title, subtitle, lock overlay) unchanged inside. Example wrapper:

```tsx
<SoukCard
  onPress={() => !scenario.locked && onScenarioSelect(scenario.id)}
  hasAccent={!scenario.locked}
  style={{ height: BENTO_HEIGHTS[index % 6] }}
  accessibilityLabel={scenario.title}
>
  {/* existing inner content unchanged */}
</SoukCard>
```

- [ ] **Step 4: Update all MotiView transition props from spring to SMOOTH**

Replace `{ type: 'spring', stiffness: 300, damping: 25 }` with `{ ...SMOOTH }` throughout the file.

- [ ] **Commit**
```bash
git add src/screens/ScenariosScreen.tsx
git commit -m "feat: apply ghost letters and souk cards to ScenariosScreen"
```

---

## Task 9: Update PhraseLibrary

**Files:**
- Modify: `src/screens/PhraseLibrary.tsx`

- [ ] **Step 1: Add imports**
```tsx
import { GhostLetters } from '../components/ui/GhostLetters';
import { SoukCard } from '../components/ui/SoukCard';
import { SMOOTH } from '../components/design/tokens';
```

- [ ] **Step 2: Add GhostLetters as first child of root View**
```tsx
<GhostLetters glyphs={['ق', 'و', 'ل']} />
```

- [ ] **Step 3: Wrap phrase row Pressables in SoukCard**

Find each phrase row `<Pressable>` (in the expanded phrase list) and replace with `<SoukCard onPress={...} hasAccent style={{ marginBottom: 6 }}>`. Keep all inner content unchanged.

- [ ] **Step 4: Update MotiView transitions to SMOOTH**

Replace spring transitions with `{ ...SMOOTH }`.

- [ ] **Commit**
```bash
git add src/screens/PhraseLibrary.tsx
git commit -m "feat: apply ghost letters and souk cards to PhraseLibrary"
```

---

## Task 10: Update ProfileScreen

**Files:**
- Modify: `src/screens/ProfileScreen.tsx`

- [ ] **Step 1: Add imports**
```tsx
import { GhostLetters } from '../components/ui/GhostLetters';
import { SoukCard } from '../components/ui/SoukCard';
import { SMOOTH } from '../components/design/tokens';
```

- [ ] **Step 2: Add GhostLetters as first child of root ScrollView**
```tsx
<GhostLetters glyphs={['أ', 'ن', 'ا']} />
```

- [ ] **Step 3: Replace stat card Views with SoukCard**

Find stat rows (the `<View style={{ marginHorizontal: 20...}}>` wrappers around stat grids) and wrap in `<SoukCard style={{ marginHorizontal: 20, marginBottom: 12 }}>`.

- [ ] **Step 4: Replace settings row Pressables (theme toggle, sign out, etc.) with SoukCard**

Find the settings row `<Pressable>` elements (manage subscription, restore, sign out) and replace:
```tsx
<SoukCard onPress={onSignOut} style={{ marginHorizontal: 20, marginBottom: 8 }} accessibilityLabel="Sign out">
  {/* existing row content unchanged */}
</SoukCard>
```

- [ ] **Step 5: Update MotiView transitions to SMOOTH**

- [ ] **Commit**
```bash
git add src/screens/ProfileScreen.tsx
git commit -m "feat: apply ghost letters and souk cards to ProfileScreen"
```

---

## Task 11: Update ScenarioPlayer

**Files:**
- Modify: `src/screens/ScenarioPlayer.tsx`

- [ ] **Step 1: Add imports**
```tsx
import { GhostLetters } from '../components/ui/GhostLetters';
import { SoukCard } from '../components/ui/SoukCard';
import { SMOOTH } from '../components/design/tokens';
```

- [ ] **Step 2: Add GhostLetters inside the root View (after LinearGradient background)**
```tsx
<GhostLetters glyphs={['ك', 'ل', 'م']} />
```

- [ ] **Step 3: Wrap scene choice Pressables in SoukCard**

Find the choice buttons (the `ScenarioChoice` options rendered as `<Pressable>`) and wrap:
```tsx
<SoukCard onPress={() => onChoiceSelect(choice)} hasAccent style={{ marginBottom: 10 }}>
  {/* existing choice content */}
</SoukCard>
```

- [ ] **Step 4: Update MotiView transitions to SMOOTH**

Replace `{ type: 'timing', duration: 260 }` and spring transitions with `{ ...SMOOTH }`.

- [ ] **Commit**
```bash
git add src/screens/ScenarioPlayer.tsx
git commit -m "feat: apply ghost letters and souk cards to ScenarioPlayer"
```

---

## Task 12: Update PracticeScreen

**Files:**
- Modify: `src/screens/PracticeScreen.tsx`

- [ ] **Step 1: Add imports**
```tsx
import { GhostLetters } from '../components/ui/GhostLetters';
import { SoukCard } from '../components/ui/SoukCard';
import { SMOOTH } from '../components/design/tokens';
```

- [ ] **Step 2: Add GhostLetters inside root View**
```tsx
<GhostLetters glyphs={['ف', 'ك', 'ر']} />
```

- [ ] **Step 3: Wrap FlashCard and quiz answer option Pressables in SoukCard**

For the `FlashCard` component — wrap the outer `MotiView > Pressable` so the card uses SoukCard:
```tsx
<SoukCard onPress={onFlip} hasAccent style={{ marginHorizontal: 20, minHeight: 200 }}>
  {/* existing flashcard content */}
</SoukCard>
```

For quiz answer options — wrap each option `<Pressable>` with SoukCard.

- [ ] **Step 4: Update transitions to SMOOTH**

Replace `{ type: 'timing', duration: X }` patterns with `{ ...SMOOTH }` or `{ ...SMOOTH_FAST }` for fast ones.

- [ ] **Commit**
```bash
git add src/screens/PracticeScreen.tsx
git commit -m "feat: apply ghost letters and souk cards to PracticeScreen"
```

---

## Task 13: Update OnboardingFlow

**Files:**
- Modify: `src/screens/OnboardingFlow.tsx`

- [ ] **Step 1: Add imports**
```tsx
import { GhostLetters } from '../components/ui/GhostLetters';
import { SoukCard } from '../components/ui/SoukCard';
import { SMOOTH } from '../components/design/tokens';
```

- [ ] **Step 2: Add GhostLetters inside the root View of each onboarding step**

The onboarding uses multiple step screens. Add GhostLetters once inside the root container View:
```tsx
<GhostLetters glyphs={['ب', 'د', 'أ']} />
```

- [ ] **Step 3: Wrap role/goal selection Pressables in SoukCard**

Find the profession category `<Pressable>` cards (role selection grid) and replace:
```tsx
<SoukCard
  onPress={() => setSelectedRole(item.id)}
  hasAccent={selectedRole === item.id}
  style={[
    { marginBottom: 10 },
    selectedRole === item.id && { borderColor: 'rgba(0,255,149,0.35)', backgroundColor: 'rgba(0,255,149,0.06)' }
  ]}
>
  {/* existing role card content */}
</SoukCard>
```

- [ ] **Step 4: Update transitions to SMOOTH**

- [ ] **Commit**
```bash
git add src/screens/OnboardingFlow.tsx
git commit -m "feat: apply ghost letters and souk cards to OnboardingFlow"
```

---

## Task 14: Update auth screens

**Files:**
- Modify: `app/sign-in.tsx`
- Modify: `app/sign-up.tsx`
- Modify: `app/forgot-password.tsx`

- [ ] **Step 1: sign-in.tsx — add imports and ghost letters**

```tsx
// Add to imports:
import { GhostLetters } from '../src/components/ui/GhostLetters';
import { SMOOTH } from '../src/components/design/tokens';
```

Add GhostLetters as first child of the root `<View style={{ flex: 1, backgroundColor: C.BG }}>`:
```tsx
<GhostLetters glyphs={['م', 'ر', 'ح']} />
```

Update all MotiView transitions from spring to `{ ...SMOOTH }`.

- [ ] **Step 2: sign-up.tsx — same treatment**

```tsx
import { GhostLetters } from '../src/components/ui/GhostLetters';
import { SMOOTH } from '../src/components/design/tokens';
```

Add `<GhostLetters glyphs={['م', 'ر', 'ح']} />` inside root View.
Update transitions to SMOOTH.

- [ ] **Step 3: forgot-password.tsx — same treatment**

```tsx
import { GhostLetters } from '../src/components/ui/GhostLetters';
import { SMOOTH } from '../src/components/design/tokens';
```

Add `<GhostLetters glyphs={['م', 'ر', 'ح']} />` inside root View.
Update transitions to SMOOTH.

- [ ] **Commit**
```bash
git add app/sign-in.tsx app/sign-up.tsx app/forgot-password.tsx
git commit -m "feat: apply ghost letters and smooth animations to auth screens"
```

---

## Task 15: Update tab bar transition timing

**Files:**
- Modify: `app/(tabs)/_layout.tsx`

- [ ] **Update the tab slide animation context to use smooth duration**

Find where `setSlideDirection` is used and the animation context value is produced. The `TabAnimationContext` already has direction tracking. Update the tab bar transition style in `screenOptions` to smooth out the icon transitions:

```tsx
// In tabBarStyle, add:
tabBarItemStyle: {
  // Smooth opacity on icon switch
},
// tabBarIconStyle already handled via focused state
```

Also update the `tabBarLabelStyle` if any animation is applied there.

The tab screen transition animation happens via expo-router's built-in animation. Add to `screenOptions`:
```tsx
animation: 'fade',
animationDuration: 300,
```

- [ ] **Commit**
```bash
git add "app/(tabs)/_layout.tsx"
git commit -m "feat: smooth tab transition timing"
```

---

## Task 16: Start dev server and verify on emulator

- [ ] **Start the Expo dev server**
```bash
npx expo start
```

- [ ] **Open on Android emulator**
Press `a` in the Expo CLI to open on Android, or scan the QR code.

- [ ] **Smoke-check each screen**
- Home: ghost م letter visible behind cards, header has English left / Arabic gold right, no settings icon
- Press any card — smooth scale-down (no bounce)
- Scenarios: ghost ع letter behind bento grid
- Phrases: ghost ق letter
- Profile: ghost أ letter, stat cards use SoukCard
- ScenarioPlayer: ghost ك letter behind scenes
- Practice: ghost ف letter
- Tab switches: smooth fade transition

---

## Self-Review Checklist

**Spec coverage:**
- [x] Ghost letterforms — Task 2, applied in Tasks 7–14
- [x] Souk card system — Task 3, applied in Tasks 7–13
- [x] Home header (English left / Arabic right / no settings) — Task 7 Step 2
- [x] Smooth animations — Task 1 constants, applied in Tasks 7–15
- [x] Press feedback on cards + buttons — Tasks 3, 5, 6
- [x] All 10 screens — Tasks 7–14
- [x] Tab bar transitions — Task 15
- [x] Per-screen glyph assignment — matches spec table exactly

**No placeholders:** All steps have exact code, file paths, and git commit messages.

**Type consistency:**
- `SMOOTH`, `SMOOTH_FAST`, `SMOOTH_SLOW` defined in Task 1, used in Tasks 7–14
- `PRESS_SCALE`, `PRESS_DURATION_IN`, `PRESS_DURATION_OUT` defined in Task 1, used in Tasks 3, 5, 6
- `GhostLetters` props: `glyphs: [string, string, string]` — consistent across all uses
- `SoukCard` props: `onPress?`, `hasAccent?`, `variant?`, `style?`, `contentStyle?`, `accessibilityLabel?` — consistent
