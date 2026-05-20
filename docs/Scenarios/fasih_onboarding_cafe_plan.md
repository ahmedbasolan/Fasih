# Fasih — Onboarding Café Scenario
## Scenario Data + Claude Code Implementation Plan

---

## PART 1 — SCENARIO DATA

### Character

**Barista (career mode customer / social mode server):**
Name: **Noura** (نورا)
Personality: Warm, efficient, friendly. Always greets in Arabic first. Patient with non-Arabic speakers.

She speaks Arabic first. The user gives a short, simple reply.

---

### Phrases Unlocked (6 total — mapped to existing phrase IDs)

| Phrase | ID | Category | Scene unlocked |
|---|---|---|---|
| تفضل | h1 | Hospitality | Scene 1 |
| أهلا وسهلا | g2 | Greetings | Scene 1 |
| من فضلك | (new: e_new1) | Everyday | Scene 2 |
| مشكور | gr1 | Gratitude | Scene 2 |
| زين | e1 | Everyday | Scene 3 |
| الله يعطيك العافية | gr4 | Gratitude | Scene 3 |

> Note: "من فضلك" is not in the current phrases.ts. Add it:
> ```ts
> { id: 'e_new1', arabic: 'من فضلك', roman: 'min fadlak', english: 'Please (to a male)', category: 'Everyday', type: 'vocab', difficulty: 'basic', pronTip: '"min FAD-lak" — for a female: "min fadlich".', culturalNote: 'The universal Gulf way to make a polite request. Works for ordering, asking for help, or getting someone\'s attention.' },
> ```

---

### Scenario Object (add to scenarios.ts)

```ts
export const getOnboardingScenario = (C: ThemeColors): Scenario => ({
  id: 'onboarding-cafe',
  iconName: 'Coffee',
  title: 'The Café',
  subtitle: 'Your first Arabic conversation.',
  decisions: 3,
  endings: 2,
  phrases: '6',
  level: 'Beginner',
  locked: false,
  color: C.JADE2,
  gradientColors: ['#0A1A0F', '#050D08'],
  arabicScene: 'المقهى',
  kafIntro: 'Every Arabic conversation starts with a greeting. Just reply — Noura will do the rest.',
  mode: 'career', // overridden at runtime based on user mode
  dialect: 'Emirati Gulf',
  impactPreview: { trust: 70, respect: 60, culture: 80 },
  isOnboarding: true, // new flag — used to skip ImpactBar and show phrase unlock UI
});
```

---

### Script — Social Mode (user = customer)

```ts
export const onboardingCafeScriptSocial: ScenarioScript = {
  scenarioId: 'onboarding-cafe',
  scenes: [
    {
      id: 'oc-social-1',
      setting: 'A café counter. Morning. Noura smiles as you approach.',
      character: 'Noura',
      characterGender: 'female',
      dialogue: {
        arabic: 'أهلا! تفضل.',
        roman: 'ahlan! tifaddal.',
        english: 'Welcome! Please, come forward.',
      },
      culturalNote: 'Noura greets you with أهلا and تفضل — two of the most common Gulf hospitality phrases. تفضل means "please" but also "go ahead", "come in", and "here you go" depending on context.',
      phrasesUnlocked: ['g2', 'h1'],
      choices: [
        {
          id: 'oc-s1-a',
          arabic: 'أهلا!',
          roman: 'ahlan!',
          english: 'Hello!',
          points: 3,
          effects: { trust: 2, respect: 1, cultural: 2 },
          butterfly: 'Noura smiles. Replying in Arabic — even one word — signals respect.',
          nextScene: 'oc-social-2',
        },
        {
          id: 'oc-s1-b',
          arabic: 'Hello!',
          roman: 'hello',
          english: 'Hello! (in English)',
          points: 1,
          effects: { trust: 1, respect: 0, cultural: 0 },
          butterfly: 'Noura nods. She switches to English — but the moment for connection passed.',
          nextScene: 'oc-social-2',
        },
      ],
    },
    {
      id: 'oc-social-2',
      setting: 'Noura gestures to the menu board above her.',
      character: 'Noura',
      characterGender: 'female',
      dialogue: {
        arabic: 'شو تحب تشرب؟ عندنا إسبانيش لاتيه، ماكياتو، قهوة عربية.',
        roman: 'shuu tihibb tishrab? \'indana Spanish latte, macchiato, gahwa \'arabiyya.',
        english: 'What would you like to drink? We have Spanish latte, macchiato, Arabic coffee.',
      },
      culturalNote: null,
      phrasesUnlocked: ['e_new1', 'gr1'],
      choices: [
        {
          id: 'oc-s2-a',
          arabic: 'إسبانيش لاتيه، من فضلك',
          roman: 'Spanish latte, min fadlak',
          english: 'Spanish latte, please',
          points: 3,
          effects: { trust: 1, respect: 1, cultural: 2 },
          butterfly: 'Clean and polite. من فضلك is the Gulf way to say please — Noura appreciates it.',
          nextScene: 'oc-social-3',
        },
        {
          id: 'oc-s2-b',
          arabic: 'ماكياتو، من فضلك',
          roman: 'macchiato, min fadlak',
          english: 'Macchiato, please',
          points: 3,
          effects: { trust: 1, respect: 1, cultural: 2 },
          butterfly: 'Good choice. من فضلك lands naturally — Noura smiles.',
          nextScene: 'oc-social-3',
        },
        {
          id: 'oc-s2-c',
          arabic: 'قهوة عربية، من فضلك',
          roman: 'gahwa \'arabiyya, min fadlak',
          english: 'Arabic coffee, please',
          points: 4,
          effects: { trust: 2, respect: 2, cultural: 3 },
          butterfly: 'Ordering Arabic coffee surprises Noura. "Ordering local" is a cultural signal that opens doors.',
          nextScene: 'oc-social-3',
        },
      ],
    },
    {
      id: 'oc-social-3',
      setting: 'Noura hands you your order with a warm smile.',
      character: 'Noura',
      characterGender: 'female',
      dialogue: {
        arabic: 'تفضل! يعطيك العافية.',
        roman: 'tifaddal! ya\'tiik il-\'aafya.',
        english: 'Here you go! May God grant you wellness.',
      },
      culturalNote: 'يعطيك العافية is said when someone is working or when you hand them something. The correct reply is الله يعافيك. Saying it back shows you understand the exchange.',
      phrasesUnlocked: ['e1', 'gr4'],
      choices: [
        {
          id: 'oc-s3-a',
          arabic: 'مشكور!',
          roman: 'mashkuur!',
          english: 'Thanks! (Khaleeji)',
          points: 3,
          effects: { trust: 2, respect: 1, cultural: 2 },
          butterfly: 'مشكور over شكرا — Noura notices. Local vocabulary always lands better.',
          nextScene: null,
          ending: 'good',
        },
        {
          id: 'oc-s3-b',
          arabic: 'شكراً',
          roman: 'shukran',
          english: 'Thank you',
          points: 2,
          effects: { trust: 1, respect: 1, cultural: 1 },
          butterfly: 'Polite and correct. Nothing wrong with شكراً — it just sounds a little formal in a café.',
          nextScene: null,
          ending: 'good',
        },
      ],
    },
  ],
};
```

---

### Script — Career Mode (user = barista trainee)

```ts
export const onboardingCafeScriptCareer: ScenarioScript = {
  scenarioId: 'onboarding-cafe',
  scenes: [
    {
      id: 'oc-career-1',
      setting: 'Your first shift. Noura, senior barista, turns to you as a customer enters.',
      character: 'Noura',
      characterGender: 'female',
      dialogue: {
        arabic: 'تفضل، قول لهم أهلا.',
        roman: 'tifaddal, guul lahum ahlan.',
        english: 'Go ahead — greet them.',
      },
      culturalNote: 'Noura is handing you the floor. In Gulf hospitality, the first word sets everything. Greet the customer before asking what they want.',
      phrasesUnlocked: ['g2', 'h1'],
      choices: [
        {
          id: 'oc-c1-a',
          arabic: 'أهلا وسهلا! تفضل.',
          roman: 'ahlan wa sahlan! tifaddal.',
          english: 'Welcome! Please come forward.',
          points: 4,
          effects: { trust: 2, respect: 2, cultural: 2 },
          butterfly: 'Noura nods — you used both greeting and invitation. The customer relaxes immediately.',
          nextScene: 'oc-career-2',
        },
        {
          id: 'oc-c1-b',
          arabic: 'أهلا!',
          roman: 'ahlan!',
          english: 'Hello!',
          points: 2,
          effects: { trust: 1, respect: 1, cultural: 1 },
          butterfly: 'Short but warm. Noura smiles — a good start.',
          nextScene: 'oc-career-2',
        },
      ],
    },
    {
      id: 'oc-career-2',
      setting: 'The customer looks at the menu. They seem unsure.',
      character: 'Noura',
      characterGender: 'female',
      dialogue: {
        arabic: 'اسألهم شو يحبون.',
        roman: '\'is\'alhum shuu yihibbuun.',
        english: 'Ask them what they want.',
      },
      culturalNote: null,
      phrasesUnlocked: ['e_new1', 'gr1'],
      choices: [
        {
          id: 'oc-c2-a',
          arabic: 'شو تحب تشرب؟',
          roman: 'shuu tihibb tishrab?',
          english: 'What would you like to drink?',
          points: 4,
          effects: { trust: 2, respect: 2, cultural: 2 },
          butterfly: 'Natural and direct. The customer smiles and answers easily.',
          nextScene: 'oc-career-3',
        },
        {
          id: 'oc-c2-b',
          arabic: 'Can I help you?',
          roman: 'can I help you',
          english: 'Can I help you? (English)',
          points: 1,
          effects: { trust: 0, respect: 0, cultural: -1 },
          butterfly: 'Noura whispers: "Try in Arabic — even the basics make a difference."',
          nextScene: 'oc-career-3',
        },
      ],
    },
    {
      id: 'oc-career-3',
      setting: 'The customer orders a Spanish latte. You hand it over.',
      character: 'Noura',
      characterGender: 'female',
      dialogue: {
        arabic: 'زين، قدمه وقول له تفضل.',
        roman: 'zain, gaddimh wa guul lah tifaddal.',
        english: 'Good — hand it to them and say تفضل.',
      },
      culturalNote: 'تفضل when handing something means "here you go". You can add يعطيك العافية — it shows you see the customer's presence as valuable.',
      phrasesUnlocked: ['e1', 'gr4'],
      choices: [
        {
          id: 'oc-c3-a',
          arabic: 'تفضل! يعطيك العافية.',
          roman: 'tifaddal! ya\'tiik il-\'aafya.',
          english: 'Here you go! May God grant you wellness.',
          points: 4,
          effects: { trust: 3, respect: 2, cultural: 3 },
          butterfly: 'The customer lights up. Noura gives you a nod — that phrase shows real cultural fluency.',
          nextScene: null,
          ending: 'good',
        },
        {
          id: 'oc-c3-b',
          arabic: 'تفضل!',
          roman: 'tifaddal!',
          english: 'Here you go!',
          points: 2,
          effects: { trust: 1, respect: 1, cultural: 1 },
          butterfly: 'Clean and correct. You\'re building confidence one phrase at a time.',
          nextScene: null,
          ending: 'good',
        },
      ],
    },
  ],
};
```

---

## PART 2 — CLAUDE CODE IMPLEMENTATION PLAN

---

### TASK A — Add missing phrase to phrases.ts

**File:** `src/constants/phrases.ts`

In the `// ── EVERYDAY ──` section, add after `e4`:
```ts
{ id: 'e_new1', arabic: 'من فضلك', roman: 'min fadlak', english: 'Please (to a male)', category: 'Everyday', type: 'vocab', difficulty: 'basic', pronTip: '"min FAD-lak" — for a female: "min fadlich".', culturalNote: 'The universal Gulf way to make a polite request. Works for ordering, asking for help, or getting someone\'s attention.' },
```

---

### TASK B — Add `isOnboarding` flag to Scenario type

**File:** `src/types/index.ts`

Find the `Scenario` interface and add:
```ts
isOnboarding?: boolean;
```

---

### TASK C — Add scenario data to scenarios.ts

**File:** `src/constants/scenarios.ts`

1. Add the `getOnboardingScenario` export at the top (after imports).
2. Add `onboardingCafeScriptSocial` and `onboardingCafeScriptCareer` as named exports at the bottom.
3. Use the exact data from Part 1 above.

Also update `getScenarioScript` function to handle the onboarding scenario:
```ts
export function getScenarioScript(scenarioId: string, mode?: string): ScenarioScript | null {
  if (scenarioId === 'onboarding-cafe') {
    return mode === 'career'
      ? onboardingCafeScriptCareer
      : onboardingCafeScriptSocial;
  }
  // ... existing logic
}
```

---

### TASK D — Create OnboardingScenarioPlayer component

**File:** `src/components/onboarding/OnboardingScenarioPlayer.tsx`

This is a simplified version of ScenarioPlayer — no ImpactBar, no community stats, no ending outcomes screen. Just:
- Scene dialogue with character name
- Arabic text (large, RTL, Tajawal font)
- Roman transliteration below
- English translation below that
- Cultural note card (if present) — shown before choices
- 2–3 choice buttons
- Phrase unlock celebration after each scene (slide-up card showing the phrase just learned)
- On final scene: "You unlocked 6 phrases → View in Phrase Library" CTA button

```tsx
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, FONT_ARABIC_EXTRA, FONT_LATIN, FONT_LATIN_SEMI, FONT_HEADING_SEMI } from '../../theme';
import { useArabicTTS } from '../../hooks/useArabicTTS';
import { PHRASES } from '../../constants/phrases';
import { useAppStore } from '../../store/useAppStore';

interface OnboardingScenarioPlayerProps {
  script: ScenarioScript;
  onComplete: (unlockedPhraseIds: string[]) => void;
}

export function OnboardingScenarioPlayer({ script, onComplete }: OnboardingScenarioPlayerProps) {
  const { C } = useTheme();
  const { speak } = useArabicTTS();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [choiceMade, setChoiceMade] = useState(false);
  const [showPhraseUnlock, setShowPhraseUnlock] = useState(false);
  const [allUnlockedIds, setAllUnlockedIds] = useState<string[]>([]);

  const scene = script.scenes[sceneIndex];
  const isLastScene = sceneIndex === script.scenes.length - 1;

  const handleChoice = (choice: SceneChoice) => {
    if (choiceMade) return;
    setChoiceMade(true);

    // Collect phrase IDs unlocked by this scene
    const newIds = scene.phrasesUnlocked ?? [];
    const updated = [...allUnlockedIds, ...newIds];
    setAllUnlockedIds(updated);

    if (newIds.length > 0) {
      setShowPhraseUnlock(true);
    } else {
      advanceScene(updated, choice);
    }
  };

  const advanceScene = (unlockedIds: string[], choice?: SceneChoice) => {
    setShowPhraseUnlock(false);
    setChoiceMade(false);
    if (isLastScene) {
      onComplete(unlockedIds);
    } else {
      setSceneIndex((i) => i + 1);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.BG },
    progressDots: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
      paddingTop: 16,
      paddingBottom: 8,
    },
    dot: {
      width: 6, height: 6, borderRadius: 3,
      backgroundColor: C.SURFACE,
    },
    dotActive: { backgroundColor: C.PRIMARY, width: 18 },
    sceneArea: {
      flex: 1,
      paddingHorizontal: 28,
      paddingTop: 24,
      gap: 16,
    },
    characterName: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 12,
      color: C.TEXT2,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    arabicText: {
      fontFamily: FONT_ARABIC_EXTRA,
      fontSize: 34,
      color: C.TEXT,
      textAlign: 'right',
      writingDirection: 'rtl',
      lineHeight: 52,
    },
    romanText: {
      fontFamily: FONT_LATIN,
      fontSize: 14,
      color: C.TEXT2,
      fontStyle: 'italic',
    },
    englishText: {
      fontFamily: FONT_LATIN,
      fontSize: 15,
      color: C.TEXT3,
    },
    speakBtn: {
      alignSelf: 'flex-start',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: C.JADE_DIM,
      borderWidth: 1,
      borderColor: C.PRIMARY,
    },
    speakBtnText: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 12,
      color: C.PRIMARY,
    },
    culturalNote: {
      backgroundColor: C.SURFACE,
      borderRadius: 14,
      padding: 14,
      borderLeftWidth: 3,
      borderLeftColor: C.PRIMARY,
    },
    culturalNoteText: {
      fontFamily: FONT_LATIN,
      fontSize: 13,
      color: C.TEXT2,
      lineHeight: 20,
    },
    choicesArea: {
      paddingHorizontal: 24,
      paddingBottom: 40,
      gap: 10,
    },
    choiceBtn: {
      borderRadius: 16,
      padding: 16,
      backgroundColor: C.CARD_BG,
      borderWidth: 1,
      borderColor: C.BORDER,
      gap: 4,
    },
    choiceArabic: {
      fontFamily: FONT_ARABIC_EXTRA,
      fontSize: 20,
      color: C.TEXT,
      textAlign: 'right',
      writingDirection: 'rtl',
    },
    choiceEnglish: {
      fontFamily: FONT_LATIN,
      fontSize: 12,
      color: C.TEXT2,
    },
    // Phrase unlock overlay
    phraseUnlockSheet: {
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      backgroundColor: C.CARD_BG,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      padding: 28,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: C.BORDER,
    },
    unlockLabel: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 10,
      color: C.PRIMARY,
      letterSpacing: 2,
      textTransform: 'uppercase',
    },
    unlockArabic: {
      fontFamily: FONT_ARABIC_EXTRA,
      fontSize: 36,
      color: C.PRIMARY,
      textAlign: 'right',
      writingDirection: 'rtl',
    },
    unlockEnglish: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 16,
      color: C.TEXT,
    },
    unlockRoman: {
      fontFamily: FONT_LATIN,
      fontSize: 13,
      color: C.TEXT2,
    },
    continueBtn: {
      marginTop: 8,
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: 'center',
    },
    continueBtnText: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 15,
      color: C.BG,
      fontWeight: '700',
    },
  });

  // Find the first unlocked phrase to display in the sheet
  const latestPhraseId = scene.phrasesUnlocked?.[0];
  const latestPhrase = latestPhraseId
    ? PHRASES.find((p) => p.id === latestPhraseId)
    : null;

  return (
    <View style={styles.container}>
      {/* Progress dots */}
      <View style={styles.progressDots}>
        {script.scenes.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === sceneIndex && styles.dotActive]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.sceneArea}
        showsVerticalScrollIndicator={false}
      >
        {/* Character name */}
        <Text style={styles.characterName}>{scene.character}</Text>

        {/* Arabic dialogue */}
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
        >
          <Text style={styles.arabicText}>{scene.dialogue.arabic}</Text>
        </MotiView>

        {/* Roman */}
        <Text style={styles.romanText}>{scene.dialogue.roman}</Text>

        {/* English */}
        <Text style={styles.englishText}>{scene.dialogue.english}</Text>

        {/* Listen button */}
        <Pressable
          style={styles.speakBtn}
          onPress={() => speak(scene.dialogue.arabic)}
        >
          <Text style={styles.speakBtnText}>🔊 Listen</Text>
        </Pressable>

        {/* Cultural note */}
        {scene.culturalNote && (
          <View style={styles.culturalNote}>
            <Text style={styles.culturalNoteText}>{scene.culturalNote}</Text>
          </View>
        )}
      </ScrollView>

      {/* Choices */}
      {!showPhraseUnlock && (
        <View style={styles.choicesArea}>
          {scene.choices.map((choice) => (
            <Pressable
              key={choice.id}
              onPress={() => handleChoice(choice)}
              disabled={choiceMade}
              style={({ pressed }) => [
                styles.choiceBtn,
                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text style={styles.choiceArabic}>{choice.arabic}</Text>
              <Text style={styles.choiceEnglish}>{choice.english}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Phrase unlock bottom sheet */}
      {showPhraseUnlock && latestPhrase && (
        <MotiView
          from={{ translateY: 300 }}
          animate={{ translateY: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          style={styles.phraseUnlockSheet}
        >
          <Text style={styles.unlockLabel}>🔓 Phrase Unlocked</Text>
          <Text style={styles.unlockArabic}>{latestPhrase.arabic}</Text>
          <Text style={styles.unlockRoman}>{latestPhrase.roman}</Text>
          <Text style={styles.unlockEnglish}>{latestPhrase.english}</Text>

          <Pressable
            onPress={() => advanceScene(allUnlockedIds)}
            style={({ pressed }) => [pressed && { opacity: 0.8 }]}
          >
            <LinearGradient
              colors={[C.PRIMARY, C.JADE]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueBtn}
            >
              <Text style={styles.continueBtnText}>
                {isLastScene ? 'See all 6 phrases →' : 'Continue →'}
              </Text>
            </LinearGradient>
          </Pressable>
        </MotiView>
      )}
    </View>
  );
}
```

---

### TASK E — Insert scenario step into OnboardingFlow.tsx

**File:** `src/screens/OnboardingFlow.tsx`

**Step 1 — Import the new component and data:**
```ts
import { OnboardingScenarioPlayer } from '../components/onboarding/OnboardingScenarioPlayer';
import {
  getOnboardingScenario,
  onboardingCafeScriptSocial,
  onboardingCafeScriptCareer,
} from '../constants/scenarios';
```

**Step 2 — Add state for unlocked phrases:**
```ts
const [onboardingUnlockedPhraseIds, setOnboardingUnlockedPhraseIds] = useState<string[]>([]);
```

**Step 3 — Find where steps/screens are defined.**

Locate the step that renders the paywall (look for `paywallTitle`, `StartFreeTrial`, or RevenueCat purchase UI).

Insert the café scenario step IMMEDIATELY before the paywall step.

The step should read the `selectedMode` state that already exists in OnboardingFlow (it's set when user picks Career or Social). Pass the correct script:

```tsx
// Onboarding café scenario step — insert before paywall
{currentStep === CAFE_SCENARIO_STEP && (
  <OnboardingScenarioPlayer
    script={selectedMode === 'career'
      ? onboardingCafeScriptCareer
      : onboardingCafeScriptSocial}
    onComplete={(phraseIds) => {
      setOnboardingUnlockedPhraseIds(phraseIds);
      goToNextStep(); // whatever the existing next-step function is called
    }}
  />
)}
```

**Step 4 — Add a constant for the step index:**

Find where step indices are defined (likely a constant or enum). Add:
```ts
const CAFE_SCENARIO_STEP = PAYWALL_STEP - 1; // insert just before paywall
```

Update the total step count in the progress bar by +1.

**Step 5 — Unlock phrases in the store when scenario completes:**

In the `onComplete` callback, also call the store action that marks phrases as encountered:
```ts
onComplete={(phraseIds) => {
  setOnboardingUnlockedPhraseIds(phraseIds);
  // Unlock phrases in the library
  phraseIds.forEach((id) => {
    useAppStore.getState().unlockPhrase(id); // see Task F below
  });
  goToNextStep();
}}
```

---

### TASK F — Add unlockPhrase action to useAppStore.ts

**File:** `src/store/useAppStore.ts`

**Step 1 — Add to AppState interface:**
```ts
unlockedPhraseIds: string[]; // phrases unlocked via scenarios
```

**Step 2 — Add to initial state:**
```ts
unlockedPhraseIds: [],
```

**Step 3 — Add action:**
```ts
unlockPhrase: (phraseId: string) => void;
```

**Step 4 — Implement:**
```ts
unlockPhrase: (phraseId) => {
  set((s) => {
    if (s.unlockedPhraseIds.includes(phraseId)) return {};
    return { unlockedPhraseIds: [...s.unlockedPhraseIds, phraseId] };
  });
},
```

**Step 5 — Add to partialize persist list:**
```ts
unlockedPhraseIds: state.unlockedPhraseIds,
```

---

### TASK G — Show unlocked badge in PhraseLibrary

**File:** `src/screens/PhraseLibrary.tsx`

**Step 1 — Read unlocked IDs from store:**
```ts
const unlockedPhraseIds = useAppStore((s) => s.unlockedPhraseIds);
```

**Step 2 — Add unlocked indicator to phrase cards:**

Find the phrase card render. Add a small badge when a phrase's ID is in `unlockedPhraseIds`:

```tsx
{unlockedPhraseIds.includes(phrase.id) && (
  <View style={styles.unlockedBadge}>
    <Text style={styles.unlockedBadgeText}>🔓 From your first scenario</Text>
  </View>
)}
```

Styles to add:
```ts
unlockedBadge: {
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 8,
  backgroundColor: 'rgba(0,255,149,0.1)',
  borderWidth: 1,
  borderColor: 'rgba(0,255,149,0.2)',
  alignSelf: 'flex-start',
  marginTop: 6,
},
unlockedBadgeText: {
  fontFamily: FONT_LATIN_SEMI,
  fontSize: 10,
  color: C.PRIMARY,
  fontWeight: '600',
},
```

---

### CHECKLIST — Onboarding Café Scenario

- [ ] A: من فضلك added to phrases.ts as id `e_new1`
- [ ] B: `isOnboarding?: boolean` added to Scenario type
- [ ] C: getOnboardingScenario, onboardingCafeScriptSocial, onboardingCafeScriptCareer added to scenarios.ts
- [ ] C2: getScenarioScript updated to handle 'onboarding-cafe' with mode param
- [ ] D: OnboardingScenarioPlayer.tsx created at src/components/onboarding/
- [ ] E1: Imports added to OnboardingFlow.tsx
- [ ] E2: onboardingUnlockedPhraseIds state added
- [ ] E3: Café scenario step inserted before paywall step
- [ ] E4: CAFE_SCENARIO_STEP constant defined, progress bar total updated
- [ ] E5: unlockPhrase called in onComplete callback
- [ ] F1: unlockedPhraseIds added to AppState interface
- [ ] F2: unlockedPhraseIds added to initial state
- [ ] F3: unlockPhrase action implemented
- [ ] F4: unlockedPhraseIds in partialize persist list
- [ ] G1: unlockedPhraseIds read from store in PhraseLibrary
- [ ] G2: Unlocked badge rendered on matching phrase cards

---

### RULES (same as main plan)

1. Read every file before editing it.
2. One task at a time — confirm before moving on.
3. No hardcoded colors — use theme tokens.
4. StyleSheet always in useMemo.
5. Arabic text: Tajawal font, textAlign right, writingDirection rtl.
6. Report after each task: "Task X complete — [file] updated."
