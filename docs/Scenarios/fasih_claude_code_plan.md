# Fasih (فصيح) — Claude Code Action Plan
## Full Audit + Implementation Instructions

---

## PROJECT CONTEXT

You are working on **Fasih**, a Gulf Arabic learning app for UAE expats.
- React Native + Expo
- State: Zustand + AsyncStorage (`src/store/useAppStore.ts`)
- Animations: Moti
- Auth: Supabase
- Subscriptions: RevenueCat
- Fonts: Tajawal (Arabic), Plus Jakarta Sans (Latin)
- Theme: `src/theme/index.ts` (barrel exports from `src/components/design/tokens.ts`)

**Before touching any file:**
1. Read the file first
2. Make only the changes specified
3. Confirm it compiles before moving to the next task
4. Never hardcode colors — always use theme tokens (`C.PRIMARY`, `C.JADE`, etc.)
5. Never recreate `StyleSheet.create()` inside a component body — always wrap in `useMemo(() => StyleSheet.create({...}), [C])`

---

## PHASE 1 — CRITICAL FIXES (do these first, in order)

---

### TASK 1.1 — Create SituationalConfidence component

**File to create:** `src/components/home/SituationalConfidence.tsx`

This replaces the WeeklyXP component. Use the exact code below:

```tsx
/**
 * SituationalConfidence.tsx
 *
 * Replaces WeeklyXP on the home screen.
 * Shows readiness across real UAE situations, calculated from:
 *   - completedScenarios (50% weight per completed scenario mapped to situation)
 *   - categoryMastery accuracy (50% weight from phrase practice)
 *
 * Data comes entirely from existing useAppStore — no new store fields needed.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import { useTheme, FONT_LATIN, FONT_LATIN_SEMI, FONT_HEADING_SEMI } from '../../theme';
import { useAppStore } from '../../store/useAppStore';

type ConfidenceLevel = 'confident' | 'familiar' | 'learning' | 'not-started';

interface SituationConfig {
  id: string;
  label: string;
  icon: string;
  scenarioIds: string[];
  phraseCategories: string[];
}

interface SituationResult extends SituationConfig {
  score: number;
  level: ConfidenceLevel;
  phrasesStudied: number;
  scenariosCompleted: number;
}

const SITUATIONS: SituationConfig[] = [
  {
    id: 'cafe-social',
    label: 'Café & Social',
    icon: '☕',
    scenarioIds: ['coffee-invitation', 'cafe-friends'],
    phraseCategories: ['Social', 'Food & Drink'],
  },
  {
    id: 'hotel-hospitality',
    label: 'Hotel & Hospitality',
    icon: '🏨',
    scenarioIds: ['hotel-guest'],
    phraseCategories: ['Hospitality'],
  },
  {
    id: 'workplace',
    label: 'Workplace',
    icon: '💼',
    scenarioIds: ['first-morning', 'office-meeting'],
    phraseCategories: ['Workplace', 'Greetings'],
  },
  {
    id: 'cultural-moments',
    label: 'Cultural Moments',
    icon: '🌙',
    scenarioIds: ['eid-greeting', 'ramadan-shift'],
    phraseCategories: ['Gratitude', 'Social'],
  },
  {
    id: 'daily-navigation',
    label: 'Daily Navigation',
    icon: '🧭',
    scenarioIds: [],
    phraseCategories: ['Everyday'],
  },
  {
    id: 'healthcare',
    label: 'Healthcare',
    icon: '🏥',
    scenarioIds: ['the-checkup'],
    phraseCategories: [],
  },
  {
    id: 'family-friends',
    label: 'Family & Friends',
    icon: '👨‍👩‍👧',
    scenarioIds: ['weekend-invite'],
    phraseCategories: ['Family'],
  },
];

function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 70) return 'confident';
  if (score >= 40) return 'familiar';
  if (score > 0)  return 'learning';
  return 'not-started';
}

const LEVEL_LABELS: Record<ConfidenceLevel, string> = {
  'confident':   'Confident',
  'familiar':    'Familiar',
  'learning':    'Learning',
  'not-started': 'Not started',
};

interface SituationalConfidenceProps {
  limit?: number;
  onSeeAll?: () => void;
}

export function SituationalConfidence({
  limit = 5,
  onSeeAll,
}: SituationalConfidenceProps) {
  const { C } = useTheme();
  const completedScenarios = useAppStore((s) => s.completedScenarios);
  const phraseReviews      = useAppStore((s) => s.phraseReviews);
  const stats              = useAppStore((s) => s.stats);

  const situations = useMemo<SituationResult[]>(() => {
    return SITUATIONS.map((sit) => {
      const totalScenarios = sit.scenarioIds.length;
      let scenarioScore = 0;
      let scenariosCompleted = 0;
      if (totalScenarios > 0) {
        for (const id of sit.scenarioIds) {
          if (completedScenarios[id]) {
            scenariosCompleted++;
            const ending = completedScenarios[id].endingType;
            const bonus = ending === 'exceptional' ? 1.2
              : ending === 'success_strong' ? 1.1
              : ending === 'failed' ? 0.6
              : 1.0;
            scenarioScore += (50 / totalScenarios) * bonus;
          }
        }
      }

      const totalCategories = sit.phraseCategories.length;
      let phraseScore = 0;
      let phrasesStudied = 0;
      if (totalCategories > 0 && stats.categoryMastery) {
        for (const cat of sit.phraseCategories) {
          const mastery = stats.categoryMastery[cat];
          if (mastery && mastery.phrasesStudied > 0) {
            phrasesStudied += mastery.phrasesStudied;
            const accuracyContrib = (mastery.accuracy / 100) * (50 / totalCategories);
            const totalInCat = mastery.phrasesTotal || 1;
            const coverageBonus = Math.min(mastery.phrasesStudied / totalInCat, 1) * 10;
            phraseScore += accuracyContrib + (coverageBonus / totalCategories);
          }
        }
      }

      const raw = Math.min(Math.round(scenarioScore + phraseScore), 100);
      return {
        ...sit,
        score: raw,
        level: getConfidenceLevel(raw),
        phrasesStudied,
        scenariosCompleted,
      };
    });
  }, [completedScenarios, phraseReviews, stats.categoryMastery]);

  const sorted = useMemo(() => {
    return [...situations].sort((a, b) => {
      if (a.score === 0 && b.score > 0) return 1;
      if (b.score === 0 && a.score > 0) return -1;
      return b.score - a.score;
    });
  }, [situations]);

  const displayed = sorted.slice(0, limit);
  const activeSituations = sorted.filter((s) => s.score > 0).length;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      borderRadius: 20,
      backgroundColor: C.CARD_BG,
      borderWidth: 1,
      borderColor: C.BORDER,
      shadowColor: C.CARD_SHADOW,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 14,
    },
    title: {
      fontFamily: FONT_HEADING_SEMI,
      fontSize: 16,
      color: C.TEXT,
      fontWeight: '700',
    },
    subtitle: {
      fontFamily: FONT_LATIN,
      fontSize: 11,
      color: C.TEXT2,
      marginTop: 2,
    },
    seeAllBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: C.JADE_DIM,
    },
    seeAllText: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 11,
      color: C.PRIMARY,
      fontWeight: '600',
    },
    divider: {
      height: 1,
      backgroundColor: C.BORDER,
      marginHorizontal: 20,
      marginBottom: 14,
    },
    situationsList: {
      paddingHorizontal: 20,
      paddingBottom: 18,
      gap: 12,
    },
    situationRow: {
      gap: 6,
    },
    situationTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    situationLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    situationIcon: {
      fontSize: 14,
    },
    situationName: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 13,
      color: C.TEXT,
      fontWeight: '600',
    },
    levelBadge: {
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: 99,
    },
    levelText: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    barTrack: {
      height: 5,
      backgroundColor: C.SURFACE,
      borderRadius: 99,
      overflow: 'hidden',
    },
    footer: {
      paddingHorizontal: 20,
      paddingBottom: 16,
      paddingTop: 4,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: C.BORDER,
      marginTop: 4,
    },
    footerText: {
      fontFamily: FONT_LATIN,
      fontSize: 12,
      color: C.TEXT2,
    },
    footerHighlight: {
      color: C.TEXT,
      fontFamily: FONT_LATIN_SEMI,
      fontWeight: '600',
    },
  }), [C]);

  function getLevelColors(level: ConfidenceLevel) {
    switch (level) {
      case 'confident':   return { badge: 'rgba(0,255,149,0.12)', text: C.PRIMARY,       bar: [C.PRIMARY, C.JADE] as [string,string] };
      case 'familiar':    return { badge: 'rgba(0,214,252,0.10)', text: C.TERTIARY,      bar: [C.TERTIARY, '#007dc0'] as [string,string] };
      case 'learning':    return { badge: 'rgba(255,184,0,0.10)', text: C.CULTURAL_GOLD, bar: [C.CULTURAL_GOLD, '#cc8800'] as [string,string] };
      case 'not-started': return { badge: 'rgba(255,255,255,0.06)', text: C.TEXT3,       bar: [C.SURFACE, C.SURFACE] as [string,string] };
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>UAE Situations</Text>
          <Text style={styles.subtitle}>
            {activeSituations === 0
              ? 'Start a scenario to build your confidence'
              : `${activeSituations} of ${SITUATIONS.length} situations in progress`}
          </Text>
        </View>
        {onSeeAll && (
          <Pressable
            onPress={onSeeAll}
            style={({ pressed }) => [styles.seeAllBtn, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
            accessibilityLabel="See all situations"
          >
            <Text style={styles.seeAllText}>All</Text>
            <ChevronRight size={12} color={C.PRIMARY} strokeWidth={2.5} />
          </Pressable>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.situationsList}>
        {displayed.map((sit, idx) => {
          const colors = getLevelColors(sit.level);
          return (
            <MotiView
              key={sit.id}
              from={{ opacity: 0, translateY: 6 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 300, delay: idx * 50 }}
              style={styles.situationRow}
            >
              <View style={styles.situationTop}>
                <View style={styles.situationLabel}>
                  <Text style={styles.situationIcon}>{sit.icon}</Text>
                  <Text style={styles.situationName}>{sit.label}</Text>
                </View>
                <View style={[styles.levelBadge, { backgroundColor: colors.badge }]}>
                  <Text style={[styles.levelText, { color: colors.text }]}>
                    {LEVEL_LABELS[sit.level]}
                  </Text>
                </View>
              </View>
              <View style={styles.barTrack}>
                <MotiView
                  from={{ width: '0%' }}
                  animate={{ width: `${sit.score}%` as any }}
                  transition={{ type: 'spring', stiffness: 150, damping: 20, delay: idx * 80 + 100 }}
                  style={{ height: '100%' }}
                >
                  <LinearGradient
                    colors={sit.level === 'not-started' ? [C.SURFACE, C.SURFACE] : colors.bar}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1, borderRadius: 99 }}
                  />
                </MotiView>
              </View>
            </MotiView>
          );
        })}
      </View>

      {activeSituations > 0 && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Most improved:{' '}
            <Text style={styles.footerHighlight}>
              {sorted.find((s) => s.score > 0)?.label ?? '—'}
            </Text>
          </Text>
          <Text style={styles.footerText}>
            <Text style={styles.footerHighlight}>{activeSituations}</Text>{' '}active
          </Text>
        </View>
      )}
    </View>
  );
}
```

---

### TASK 1.2 — Export SituationalConfidence from barrel

**File:** `src/components/home/index.ts`

Add this line:
```ts
export { SituationalConfidence } from './SituationalConfidence';
```

---

### TASK 1.3 — Update HomeScreenNew.tsx

**File:** `src/screens/HomeScreenNew.tsx`

**Change A — Update import:**
```ts
// ADD:
import { SituationalConfidence } from '../components/home/SituationalConfidence';
```

**Change B — Remove unused XP variables** (find and delete these lines):
```ts
const totalXP = calculateXPFromReviews(phraseReviews) + stats.scenariosCompleted.length * 50;
const goalXP = 500;
const weeklyXPDays = useMemo(() => getWeeklyXPFromReviews(phraseReviews), [phraseReviews]);
const weeklyTotal = weeklyXPDays.reduce((sum, d) => sum + d.value, 0);
```

Also remove the functions `calculateXPFromReviews` and `getWeeklyXPFromReviews` from the top of the file.

**Change C — Replace the entire "This Week" section:**

Find this block:
```tsx
{/* Weekly XP Section */}
<Text style={styles.sectionLabel}>This Week</Text>
<View style={styles.sectionContent}>
  {isNewUser ? (
    <MotiView ...>
      <View style={styles.emptyCard}>
        <Text style={{ fontSize: 32 }}>📊</Text>
        <Text style={styles.emptyTitle}>Your weekly stats will appear here</Text>
        <Text style={styles.emptySubtitle}>Complete a scenario or review phrases to start earning XP</Text>
      </View>
    </MotiView>
  ) : (
    <WeeklyXP
      days={weeklyXPDays}
      currentXP={weeklyTotal}
      goalXP={goalXP}
      xpToReward={Math.max(0, goalXP - weeklyTotal)}
    />
  )}
</View>
```

Replace with:
```tsx
{/* Situational Confidence Section */}
<Text style={styles.sectionLabel}>Your Confidence</Text>
<View style={styles.sectionContent}>
  <SituationalConfidence
    limit={5}
    onSeeAll={onSeeAll}
  />
</View>
```

**Change D — Add `onSeeAll` to props interface:**
```ts
interface HomeScreenNewProps {
  userName: string;
  onSettingsPress?: () => void;
  onMissionPress?: (missionId: string) => void;
  onSeeAll?: () => void;  // ADD THIS
}
```

And destructure it:
```ts
export function HomeScreenNew({
  userName = 'there',
  onSettingsPress,
  onMissionPress,
  onSeeAll,  // ADD THIS
}: HomeScreenNewProps) {
```

---

### TASK 1.4 — Fix StreakWidget XP language

**File:** `src/components/home/StreakWidget.tsx`

**Change A — Fix the empty state and XP display:**

Find:
```tsx
<Text style={isEmpty ? styles.emptyTitle : styles.xpRow}>
  {isEmpty ? 'Start your streak! 🔥' : `${currentXP} / ${goalXP} XP`}
</Text>
```

Replace with:
```tsx
<View style={styles.streakInfoRow}>
  <Text style={styles.daysTitle}>Learning Days</Text>
  {!isEmpty && (
    <Text style={styles.bestDays}>Best: {Math.max(streakDays, 1)}</Text>
  )}
  {isEmpty && (
    <Text style={styles.emptyHint}>Start today</Text>
  )}
</View>
```

**Change B — Add new style tokens** (inside the `StyleSheet.create` call):
```ts
streakInfoRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
daysTitle: {
  fontFamily: FONT_LATIN_SEMI,
  fontSize: 12,
  color: C.TEXT,
  fontWeight: '600',
},
bestDays: {
  fontFamily: FONT_LATIN,
  fontSize: 11,
  color: C.TEXT2,
},
emptyHint: {
  fontFamily: FONT_LATIN,
  fontSize: 11,
  color: C.TEXT3,
},
```

**Change C — Wrap StyleSheet.create in useMemo:**

The current code has `StyleSheet.create({...})` directly inside the component body.
Wrap it:
```ts
const styles = useMemo(() => StyleSheet.create({
  // ... all existing styles ...
}), [C, screenW]);
```

Add `useMemo` to the React import if not already there.

---

### TASK 1.5 — Fix MissionCard scene tag

**File:** `src/components/home/MissionCard.tsx`

Find:
```tsx
<View style={styles.sceneTag}>
  <Text style={styles.sceneTagText}>Scenario</Text>
</View>
```

Replace with:
```tsx
<View style={styles.sceneTag}>
  <Text style={styles.sceneTagText}>
    {scenesCurrent > 0
      ? `Scene ${scenesCurrent} of ${scenesTotal}`
      : `${scenesTotal} scenes`}
  </Text>
</View>
```

Also wrap StyleSheet.create in useMemo:
```ts
const styles = useMemo(() => StyleSheet.create({
  // ... existing styles ...
}), [C]);
```

---

### TASK 1.6 — Fix scenesCompletedForFeatured binary logic

**File:** `src/screens/HomeScreenNew.tsx`

**Step 1 — Add scene progress to store**

Open `src/store/useAppStore.ts`.

In the `AppState` interface, add:
```ts
sceneProgress: Record<string, number>; // scenarioId → scenes completed count
```

In the initial state (find where `completedScenarios: {}` is defined), add:
```ts
sceneProgress: {},
```

Add a new action to the store actions:
```ts
recordSceneProgress: (scenarioId: string, sceneIndex: number) => void;
```

Implement it:
```ts
recordSceneProgress: (scenarioId, sceneIndex) => {
  set((s) => {
    const current = s.sceneProgress[scenarioId] ?? 0;
    if (sceneIndex + 1 <= current) return {}; // never go backwards
    return { sceneProgress: { ...s.sceneProgress, [scenarioId]: sceneIndex + 1 } };
  });
},
```

Add `sceneProgress` to the `partialize` persist list:
```ts
sceneProgress: state.sceneProgress,
```

**Step 2 — Use it in HomeScreenNew.tsx**

Replace:
```ts
const scenesCompletedForFeatured = completedScenarios[featured.id] ? featured.decisions : 0;
```

With:
```ts
const sceneProgress = useAppStore((s) => s.sceneProgress);
const scenesCompletedForFeatured = sceneProgress[featured.id] ?? 0;
```

**Step 3 — Call recordSceneProgress in ScenarioPlayer**

In `src/screens/ScenarioPlayer.tsx`, find where a scene advances (after a choice is made and confirmed). Call:
```ts
const recordSceneProgress = useAppStore((s) => s.recordSceneProgress);
// ... after scene advances:
recordSceneProgress(scenarioId, currentSceneIndex);
```

---

### TASK 1.7 — Fix StyleSheet in remaining components

Apply the same `useMemo` wrap to these files. In each file, change:
```ts
const styles = StyleSheet.create({ ... });
```
to:
```ts
const styles = useMemo(() => StyleSheet.create({ ... }), [C]);
```

Files to fix:
- `src/components/home/DailyPhrase.tsx`
- `src/components/home/QuickChallenge.tsx`
- `src/components/home/WeeklyXP.tsx`
- `src/components/home/CommunityBar.tsx`
- `src/screens/ScenarioDetailScreen.tsx` (currently has no StyleSheet at all — add one)

---

## PHASE 2 — HIGH PRIORITY FIXES

---

### TASK 2.1 — Fix ScenarioDetailScreen double lock icon

**File:** `src/screens/ScenarioDetailScreen.tsx`

Find the scene row for locked scenes. There are two `<Lock>` icons rendered. Remove the one on the RIGHT side:
```tsx
{isLocked && <Lock size={18} color={C.TEXT3} />}  // DELETE THIS LINE
```
Keep only the one inside the left block.

---

### TASK 2.2 — Fix ScenarioDetailScreen lock logic

**File:** `src/screens/ScenarioDetailScreen.tsx`

Replace:
```ts
const isLocked = index > 0 && !isCompleted;
```

With:
```ts
const sceneProgress = useAppStore((s) => s.sceneProgress);
const scenesUnlocked = sceneProgress[scenarioId] ?? 0;
const isLocked = index > scenesUnlocked && !isCompleted;
```

This means: scene 0 is always unlocked, subsequent scenes unlock as you progress.

---

### TASK 2.3 — Fix HomeHeader settings button border

**File:** `src/components/home/HomeHeader.tsx`

Find `settingsButton` style and add:
```ts
settingsButton: {
  width: 40,
  height: 40,
  borderRadius: 12,
  backgroundColor: C.CARD_BG,
  borderWidth: 1,        // ADD
  borderColor: C.BORDER, // ADD
  alignItems: 'center',
  justifyContent: 'center',
},
```

---

### TASK 2.4 — Fix DailyPhrase Play button icon color

**File:** `src/components/home/DailyPhrase.tsx`

Find:
```tsx
<Volume2 size={14} color={C.TEXT} />
```

Change to:
```tsx
<Volume2 size={14} color={C.PRIMARY} />
```

---

### TASK 2.5 — Fix ScenarioDetailScreen hardcoded author

**File:** `src/screens/ScenarioDetailScreen.tsx`

Find:
```tsx
<Text ...>By Ahmed Al-Maktoum</Text>
```

Replace with:
```tsx
<Text ...>By Fasih Team</Text>
```

(Or use `scenario.author` if that field exists on the Scenario type. Check `src/types/index.ts` — if `author` doesn't exist, use "By Fasih Team" as the fallback.)

---

### TASK 2.6 — Fix ScenariosScreen motivational copy

**File:** `src/screens/ScenariosScreen.tsx`

Find `MOTIVATIONAL_HEADINGS` array. Replace ALL entries with:
```ts
const MOTIVATIONAL_HEADINGS = [
  { text: 'Gulf Arabic', sub: 'Choose a real situation.', icon: Sparkles },
  { text: 'Build Confidence', sub: 'One scenario at a time.', icon: Target },
  { text: 'Your Next Situation', sub: 'Practice Gulf Arabic.', icon: Rocket },
  { text: 'Real Conversations', sub: 'Cultural fluency awaits.', icon: Zap },
  { text: 'Master the Dialect', sub: 'Start where you are.', icon: Sparkles },
  { text: 'Practice Today', sub: 'A few minutes is enough.', icon: Target },
];
```

---

### TASK 2.7 — Fix MissionCard fox emoji → mascot image

**File:** `src/components/home/MissionCard.tsx`

Find:
```tsx
<Text style={styles.foxEmoji}>🦊</Text>
```

Replace with:
```tsx
<Image
  source={require('../../../assets/images/foxy_male.png')}
  style={styles.foxImage}
  resizeMode="contain"
/>
```

Add to styles:
```ts
foxImage: {
  width: 48,
  height: 48,
  alignSelf: 'center',
  marginBottom: 8,
},
```

Add `Image` to the React Native import if not already there.

---

## PHASE 3 — ONBOARDING QUICK WIN

---

### TASK 3.1 — Add Arabic Quick Win step to OnboardingFlow

**File:** `src/screens/OnboardingFlow.tsx`

This is the highest-impact retention fix. A user must experience one Arabic phrase before seeing the paywall.

**Step 1** — Find where the steps/screens are defined (likely an array or switch statement with step indices).

**Step 2** — Insert a new step BEFORE the paywall step. The step should:

```tsx
// New step: "Your first Arabic phrase"
// Position: immediately before the paywall screen

function QuickWinStep({ onNext }: { onNext: () => void }) {
  const { C } = useTheme();
  const [revealed, setRevealed] = useState(false);
  const { speak } = useArabicTTS();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
      {/* Kaf mascot at top */}
      <Image
        source={require('../../assets/images/foxy_male.png')}
        style={{ width: 80, height: 80, marginBottom: 24 }}
        resizeMode="contain"
      />

      <Text style={{
        fontFamily: FONT_LATIN_SEMI,
        fontSize: 13,
        color: C.TEXT2,
        textAlign: 'center',
        marginBottom: 8,
      }}>
        Your first Gulf Arabic phrase:
      </Text>

      <Text style={{
        fontFamily: FONT_ARABIC_EXTRA,  // import from tokens
        fontSize: 42,
        color: C.PRIMARY,
        textAlign: 'center',
        direction: 'rtl',
        marginBottom: 6,
      }}>
        مرحبا
      </Text>

      <Text style={{
        fontFamily: FONT_LATIN,
        fontSize: 14,
        color: C.TEXT2,
        marginBottom: 4,
      }}>
        mar-haba
      </Text>

      {!revealed ? (
        <Pressable
          onPress={() => {
            setRevealed(true);
            speak('مرحبا');
          }}
          style={{
            marginTop: 20,
            paddingHorizontal: 28,
            paddingVertical: 14,
            borderRadius: 16,
            backgroundColor: C.PRIMARY,
          }}
        >
          <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 15, color: C.BG, fontWeight: '700' }}>
            Tap to hear it →
          </Text>
        </Pressable>
      ) : (
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          style={{ alignItems: 'center', marginTop: 16 }}
        >
          <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 15, color: C.TEXT, textAlign: 'center', marginBottom: 24 }}>
            Welcome — you just said it.
          </Text>
          <Pressable
            onPress={onNext}
            style={{
              paddingHorizontal: 28,
              paddingVertical: 14,
              borderRadius: 16,
              backgroundColor: C.PRIMARY,
            }}
          >
            <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 15, color: C.BG, fontWeight: '700' }}>
              Continue →
            </Text>
          </Pressable>
        </MotiView>
      )}
    </View>
  );
}
```

**Step 3** — Wire it into the step flow so it appears just before the paywall. The total step count increases by 1 — update the ProgressBar `total` accordingly.

---

## PHASE 4 — LIGHT MODE CARD DEPTH

---

### TASK 4.1 — Verify all cards have shadow/border in light mode

Check `src/components/design/tokens.ts` — confirm that `C.CARD_SHADOW` has a value in the light theme.

In every card component that uses `shadowColor: C.CARD_SHADOW`, also verify:
```ts
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.08,
shadowRadius: 4,
elevation: 2,
```
These values must be present on: `StreakWidget`, `DailyPhrase`, `QuickChallenge`, `MissionCard`, `WeeklyXP`, `CommunityBar`.

---

## CHECKLIST — Track progress as you complete tasks

Go through this checklist as you work. Mark each item done when confirmed compiling and correct.

### Phase 1 — Critical
- [ ] 1.1 SituationalConfidence.tsx created
- [ ] 1.2 Exported from components/home/index.ts
- [ ] 1.3a HomeScreenNew imports SituationalConfidence
- [ ] 1.3b XP variables and functions removed from HomeScreenNew
- [ ] 1.3c "This Week" section replaced with "Your Confidence"
- [ ] 1.3d onSeeAll prop added to HomeScreenNew
- [ ] 1.4a StreakWidget XP text replaced with "Learning Days"
- [ ] 1.4b StreakWidget StyleSheet wrapped in useMemo
- [ ] 1.5a MissionCard scene tag shows "Scene X of Y"
- [ ] 1.5b MissionCard StyleSheet wrapped in useMemo
- [ ] 1.6a sceneProgress field added to AppState interface
- [ ] 1.6b sceneProgress initial state added
- [ ] 1.6c recordSceneProgress action implemented
- [ ] 1.6d sceneProgress added to partialize persist list
- [ ] 1.6e HomeScreenNew uses sceneProgress for mission card
- [ ] 1.6f ScenarioPlayer calls recordSceneProgress on scene advance
- [ ] 1.7a DailyPhrase StyleSheet in useMemo
- [ ] 1.7b QuickChallenge StyleSheet in useMemo
- [ ] 1.7c WeeklyXP StyleSheet in useMemo
- [ ] 1.7d CommunityBar StyleSheet in useMemo
- [ ] 1.7e ScenarioDetailScreen gets a StyleSheet

### Phase 2 — High Priority
- [ ] 2.1 ScenarioDetailScreen double lock icon removed
- [ ] 2.2 ScenarioDetailScreen lock logic uses sceneProgress
- [ ] 2.3 HomeHeader settings button has border
- [ ] 2.4 DailyPhrase Play icon uses C.PRIMARY
- [ ] 2.5 ScenarioDetailScreen hardcoded author fixed
- [ ] 2.6 ScenariosScreen motivational headings replaced
- [ ] 2.7 MissionCard uses mascot image not fox emoji

### Phase 3 — Onboarding
- [ ] 3.1a QuickWinStep component written
- [ ] 3.1b QuickWinStep inserted before paywall step
- [ ] 3.1c Step count updated in ProgressBar

### Phase 4 — Polish
- [ ] 4.1 All cards have shadow in light mode

---

## RULES FOR CLAUDE CODE

1. **Read before writing.** Always view the file before making changes.
2. **One task at a time.** Complete and verify before moving to next.
3. **Never hardcode colors.** Use `C.PRIMARY`, `C.BORDER`, `C.CARD_BG` etc.
4. **StyleSheet always in useMemo.** No exceptions.
5. **Arabic text always gets:** `fontFamily: FONT_ARABIC_EXTRA` (or FONT_ARABIC), `textAlign: 'right'`, `writingDirection: 'rtl'`.
6. **If a type doesn't exist**, check `src/types/index.ts` before adding it elsewhere.
7. **If an import path is wrong**, find the correct path by reading the directory — don't guess.
8. **Report after each task:** "Task X.X complete — [filename] updated, compiles correctly."
