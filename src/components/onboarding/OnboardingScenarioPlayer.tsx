import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, FONT_LATIN, FONT_LATIN_SEMI, FONT_ARABIC, FONT_ARABIC_EXTRA } from '../../theme';
import { ONBOARDING_CHROME_HEIGHT } from '../design/layout';
import { initialFor, ltrParagraph } from '../../engine/text';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from '../icons';
import { ShimmerButton } from '../ui';
import { STRINGS } from '../../constants/strings';
import { FONT_HEADING_SEMI } from '../design/tokens';
import type { ScenarioScript, ScenarioChoice, Phrase } from '../../types';
import { PHRASES } from '../../constants/phrases';

interface OnboardingScenarioPlayerProps {
  script: ScenarioScript;
  onComplete?: (unlockedPhraseIds: string[]) => void;
}

type Phase = 'scene' | 'outcome' | 'unlock';

// Outcome is carried by colour and by the note's own words, as it is in the
// real player. The emoji set that used to live here (🌟 ✅ 💬 ⚠️) appears
// nowhere else in the app.
const OUTCOME_TOKEN: Record<string, 'PRIMARY' | 'JADE2' | 'TEXT3' | 'ERROR'> = {
  excellent: 'PRIMARY',
  good: 'JADE2',
  neutral: 'TEXT3',
  bad: 'ERROR',
};

export function OnboardingScenarioPlayer({
  script,
  onComplete,
}: OnboardingScenarioPlayerProps) {
  const { C } = useTheme();
  const insets = useSafeAreaInsets();
  const [sceneIdx, setSceneIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('scene');
  const [chosenChoice, setChosenChoice] = useState<ScenarioChoice | null>(null);

  const scene = script.scenes[sceneIdx];
  const isLastScene = sceneIdx === script.scenes.length - 1;

  const unlockedPhrases = useMemo<Phrase[]>(() => {
    return (script.phrasesUnlocked ?? [])
      .map((id) => PHRASES.find((p) => p.id === id))
      .filter((p): p is Phrase => p !== undefined);
  }, [script.phrasesUnlocked]);

  function handleChoice(choice: ScenarioChoice) {
    setChosenChoice(choice);
    setPhase('outcome');
  }

  function handleNext() {
    if (isLastScene) {
      setPhase('unlock');
    } else {
      setSceneIdx((i) => i + 1);
      setChosenChoice(null);
      setPhase('scene');
    }
  }

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: { flex: 1 },
        // Rendered inside `OnboardingFlow`, which overlays a progress bar and a
        // back button. This is a bare ScrollView rather than a `Screen`, so it
        // has to clear both itself — without this the setting badge renders
        // through the progress bar and the first card sits under the chevron.
        content: {
          padding: 24,
          paddingTop: insets.top + ONBOARDING_CHROME_HEIGHT,
          paddingBottom: 120,
        },

        settingBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 12,
          paddingVertical: 5,
          borderRadius: 20,
          backgroundColor: C.SURFACE,
          borderWidth: 1,
          borderColor: C.BORDER,
          alignSelf: 'flex-start',
          marginBottom: 20,
        },
        settingText: {
          fontFamily: FONT_LATIN,
          fontSize: 11,
          color: C.TEXT3,
          letterSpacing: 0.3,
        },

        npcCard: {
          borderRadius: 20,
          padding: 20,
          marginBottom: 20,
          backgroundColor: C.CARD_BG,
          borderWidth: 1,
          borderColor: C.BORDER,
        },
        charRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          marginBottom: 16,
        },
        charAvatar: {
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: C.JADE_DIM,
          alignItems: 'center',
          justifyContent: 'center',
        },
        charInitial: {
          fontFamily: FONT_LATIN_SEMI,
          fontSize: 16,
          color: C.JADE2,
        },
        charName: {
          fontFamily: FONT_LATIN_SEMI,
          fontSize: 14,
          color: C.TEXT2,
          fontWeight: '600',
        },
        npcArabic: {
          fontFamily: FONT_ARABIC_EXTRA,
          fontSize: 28,
          color: C.TEXT,
          textAlign: 'right',
          writingDirection: 'rtl',
          marginBottom: 6,
          lineHeight: 38,
        },
        npcRoman: {
          fontFamily: FONT_LATIN_SEMI,
          fontSize: 14,
          color: C.JADE2,
          fontWeight: '600',
          marginBottom: 4,
        },
        npcEnglish: {
          fontFamily: FONT_LATIN,
          fontSize: 14,
          color: C.TEXT2,
          lineHeight: 18,
        },
        teachingNote: {
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: C.BORDER,
        },
        teachingNoteText: {
          fontFamily: FONT_LATIN,
          fontSize: 11,
          color: C.TEXT3,
          lineHeight: 16,
        },

        choicesLabel: {
          fontFamily: FONT_LATIN_SEMI,
          fontSize: 11,
          color: C.TEXT3,
          fontWeight: '600',
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          marginBottom: 10,
        },
        // Matches the real player's choice card: same fill, border and radius,
        // and the same Arabic -> romanisation -> English order. This screen had
        // English first, Arabic second and NO romanisation at all, so a learner
        // was asked to pick an Arabic line they had no way to pronounce.
        choiceButton: {
          borderRadius: 16,
          padding: 14,
          marginBottom: 8,
          backgroundColor: C.JADE_ACCENT_SURFACE,
          borderWidth: 1,
          borderColor: C.BORDER,
        },
        choiceArabic: {
          fontFamily: FONT_ARABIC,
          fontSize: 18,
          lineHeight: 26,
          color: C.JADE,
          textAlign: 'right',
          writingDirection: 'rtl',
          marginBottom: 3,
        },
        choiceRoman: {
          fontFamily: FONT_LATIN,
          fontSize: 11,
          fontStyle: 'italic',
          color: `${C.JADE}70`,
          marginBottom: 5,
        },
        choiceText: {
          fontFamily: FONT_LATIN,
          fontSize: 14,
          lineHeight: 20,
          color: C.TEXT2,
        },

        youSaidLabel: {
          fontFamily: FONT_LATIN_SEMI,
          fontSize: 11,
          color: C.TEXT3,
          fontWeight: '600',
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          marginBottom: 10,
        },
        youSaidCard: {
          borderRadius: 14,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: `${C.PRIMARY}40`,
          backgroundColor: `${C.PRIMARY}08`,
        },
        youSaidArabic: {
          fontFamily: FONT_ARABIC_EXTRA,
          fontSize: 22,
          color: C.TEXT,
          textAlign: 'right',
          writingDirection: 'rtl',
          marginBottom: 4,
          lineHeight: 30,
        },
        youSaidRoman: {
          fontFamily: FONT_LATIN_SEMI,
          fontSize: 14,
          color: C.PRIMARY,
          fontWeight: '600',
        },
        outcomeCard: {
          borderRadius: 14,
          padding: 16,
          marginBottom: 20,
          backgroundColor: C.CARD_BG,
          borderWidth: 1,
          borderColor: C.BORDER,
        },
        outcomeText: {
          fontFamily: FONT_LATIN,
          fontSize: 14,
          color: C.TEXT,
          lineHeight: 20,
        },

        unlockHeader: {
          alignItems: 'center',
          marginBottom: 24,
          gap: 8,
        },
        unlockTitle: {
          fontFamily: FONT_HEADING_SEMI,
          fontSize: 22,
          color: C.TEXT,
          fontWeight: '700',
          textAlign: 'center',
        },
        unlockSubtitle: {
          fontFamily: FONT_LATIN,
          fontSize: 14,
          color: C.TEXT2,
          textAlign: 'center',
        },
        phraseCard: {
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: 12,
        },
        phraseCardInner: {
          padding: 20,
        },
        phraseArabic: {
          fontFamily: FONT_ARABIC_EXTRA,
          fontSize: 28,
          color: C.TEXT,
          textAlign: 'right',
          writingDirection: 'rtl',
          marginBottom: 6,
          lineHeight: 42,
        },
        phraseRoman: {
          fontFamily: FONT_LATIN_SEMI,
          fontSize: 14,
          color: C.TEXT2,
          fontWeight: '600',
          marginBottom: 2,
        },
        phraseEnglish: {
          fontFamily: FONT_LATIN,
          fontSize: 14,
          color: C.TEXT2,
        },
        phraseUnlockedTag: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          marginTop: 10,
          alignSelf: 'flex-start',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 8,
          backgroundColor: C.BORDER,
        },
        phraseUnlockedTagText: {
          fontFamily: FONT_LATIN_SEMI,
          fontSize: 11,
          color: C.TEXT2,
          fontWeight: '700',
          letterSpacing: 0.3,
        },
        culturalNoteCard: {
          borderRadius: 12,
          borderWidth: 1,
          borderColor: C.BORDER,
          backgroundColor: C.SURFACE,
          padding: 14,
          marginBottom: 20,
        },
        culturalNoteLabel: {
          fontFamily: FONT_LATIN_SEMI,
          fontSize: 11,
          color: C.TEXT3,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          marginBottom: 6,
          fontWeight: '600',
        },
        culturalNoteText: {
          fontFamily: FONT_LATIN,
          fontSize: 12,
          color: C.TEXT2,
          lineHeight: 18,
        },

        // Spacing only. The pill, the gradient and the label all belong to
        // ShimmerButton now — this used to be a hand-rolled copy of it that put
        // its row layout on the Pressable's own style callback, where it did not
        // apply, so the label and chevron stacked instead of sitting inline.
        nextButton: {
          marginTop: 8,
        },
      }),
    [C, insets.top]
  );

  // ── Scene phase ──────────────────────────────────────────────────────────────
  if (phase === 'scene' && scene) {
    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* No opacity in the `from` of any entrance on this screen. A stalled
            animation driver would leave them at 0 and the scene would render
            blank — the same failure FadeIn had, reproduced here because these
            are raw MotiViews rather than FadeIn. Movement carries it instead. */}
        <MotiView
          from={{ translateY: 6 }}
          animate={{ translateY: 0 }}
          transition={{ type: 'timing', duration: 300 }}
        >
          {/* A jade dot, matching the real player's setting badge. The emoji
              that was here is not in the app's visual language anywhere else. */}
          <View style={styles.settingBadge}>
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: C.JADE }} />
            <Text style={styles.settingText}>{scene.setting}</Text>
          </View>
        </MotiView>

        <MotiView
          from={{ translateY: 8 }}
          animate={{ translateY: 0 }}
          transition={{ type: 'timing', duration: 350, delay: 80 }}
        >
          <View style={styles.npcCard}>
            <View style={styles.charRow}>
              {/* Character art is retired app-wide; the real player shows the
                  NPC's initial. An emoji face was the last one left. */}
              <View style={styles.charAvatar}>
                <Text style={styles.charInitial}>{initialFor(scene.charName)}</Text>
              </View>
              <Text style={styles.charName}>{scene.charName}</Text>
            </View>
            <Text style={styles.npcArabic}>{scene.arabic}</Text>
            <Text style={styles.npcRoman}>{scene.roman}</Text>
            <Text style={styles.npcEnglish}>{scene.english}</Text>
            {scene.teachingNote ? (
              <View style={styles.teachingNote}>
                <Text style={styles.teachingNoteText}>{ltrParagraph(scene.teachingNote)}</Text>
              </View>
            ) : null}
          </View>
        </MotiView>

        <MotiView
          from={{ translateY: 8 }}
          animate={{ translateY: 0 }}
          transition={{ type: 'timing', duration: 350, delay: 200 }}
        >
          <Text style={styles.choicesLabel}>{STRINGS.onboarding.scenarioYourResponse}</Text>
          {scene.choices.map((choice, idx) => (
            <MotiView
              key={choice.id}
              from={{ translateX: -6 }}
              animate={{ translateX: 0 }}
              transition={{ type: 'timing', duration: 280, delay: 240 + idx * 60 }}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.choiceButton,
                  pressed && { opacity: 0.75, borderColor: C.PRIMARY },
                ]}
                onPress={() => handleChoice(choice)}
                accessibilityRole="button"
                accessibilityLabel={`${choice.text} — ${choice.roman}`}
              >
                {choice.arabic !== '—' ? (
                  <Text style={styles.choiceArabic}>{choice.arabic}</Text>
                ) : null}
                {choice.roman ? (
                  <Text style={styles.choiceRoman}>{choice.roman}</Text>
                ) : null}
                <Text style={styles.choiceText}>{choice.text}</Text>
              </Pressable>
            </MotiView>
          ))}
        </MotiView>
      </ScrollView>
    );
  }

  // ── Outcome phase ────────────────────────────────────────────────────────────
  if (phase === 'outcome' && chosenChoice) {
    const outcomeColor = C[OUTCOME_TOKEN[chosenChoice.outcome] ?? 'TEXT3'];
    const nextLabel = isLastScene
      ? STRINGS.onboarding.scenarioSeeUnlocked
      : STRINGS.common.continue;
    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View>
          <Text style={styles.youSaidLabel}>{STRINGS.onboarding.scenarioYouSaid}</Text>
          <View style={styles.youSaidCard}>
            {chosenChoice.arabic !== '—' ? (
              <Text style={styles.youSaidArabic}>{chosenChoice.arabic}</Text>
            ) : null}
            <Text style={styles.youSaidRoman}>{chosenChoice.roman}</Text>
          </View>

          {chosenChoice.note ? (
            <View style={[styles.outcomeCard, { borderLeftWidth: 3, borderLeftColor: outcomeColor }]}>
              <Text style={styles.outcomeText}>{ltrParagraph(chosenChoice.note)}</Text>
            </View>
          ) : null}

          <View style={styles.nextButton}>
            <ShimmerButton
              onPress={handleNext}
              Icon={ChevronRight}
              accessibilityLabel={nextLabel}
            >
              {nextLabel}
            </ShimmerButton>
          </View>
        </View>
      </ScrollView>
    );
  }

  // ── Unlock phase ─────────────────────────────────────────────────────────────
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <MotiView
        from={{ translateY: 10 }}
        animate={{ translateY: 0 }}
        transition={{ type: 'timing', duration: 350 }}
      >
        <View style={styles.unlockHeader}>
          <Text style={{ fontSize: 34 }}>✨</Text>
          <Text style={styles.unlockTitle}>{STRINGS.onboarding.scenarioUnlockTitle}</Text>
          <Text style={styles.unlockSubtitle}>{STRINGS.onboarding.scenarioUnlockSubtitle}</Text>
        </View>

        {unlockedPhrases.length === 0 ? (
          <View style={[styles.phraseCard, { backgroundColor: C.SURFACE }]}>
            <View style={styles.phraseCardInner}>
              <Text style={[styles.phraseEnglish, { color: C.TEXT2 }]}>{STRINGS.onboarding.scenarioComplete}</Text>
            </View>
          </View>
        ) : (
          unlockedPhrases.map((phrase) => (
            <View key={phrase.id}>
              <View style={styles.phraseCard}>
                <LinearGradient
                  colors={[C.PRIMARY, C.JADE]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.phraseCardInner}
                >
                  <Text style={styles.phraseArabic}>{phrase.arabic}</Text>
                  <Text style={styles.phraseRoman}>{phrase.roman}</Text>
                  <Text style={styles.phraseEnglish}>{phrase.english}</Text>
                  <View style={styles.phraseUnlockedTag}>
                    <Text style={{ fontSize: 11 }}>✨</Text>
                    <Text style={styles.phraseUnlockedTagText}>{STRINGS.onboarding.scenarioUnlockedTag}</Text>
                  </View>
                </LinearGradient>
              </View>

              {phrase.culturalNote ? (
                <View style={styles.culturalNoteCard}>
                  <Text style={styles.culturalNoteLabel}>{STRINGS.onboarding.scenarioCulturalNote}</Text>
                  <Text style={styles.culturalNoteText}>{ltrParagraph(phrase.culturalNote)}</Text>
                </View>
              ) : null}
            </View>
          ))
        )}

        <MotiView
          from={{ translateY: 10 }}
          animate={{ translateY: 0 }}
          transition={{ type: 'timing', duration: 350, delay: 400 }}
        >
          <View style={styles.nextButton}>
            <ShimmerButton
              onPress={() => onComplete?.(script.phrasesUnlocked ?? [])}
              Icon={ChevronRight}
              accessibilityLabel={STRINGS.onboarding.scenarioContinueToApp}
            >
              {STRINGS.onboarding.scenarioContinueToApp}
            </ShimmerButton>
          </View>
        </MotiView>
      </MotiView>
    </ScrollView>
  );
}
