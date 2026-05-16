import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useTheme, FONT_LATIN, FONT_LATIN_SEMI, FONT_ARABIC_EXTRA } from '../../theme';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import { FONT_HEADING_SEMI } from '../design/tokens';
import type { ScenarioScript, ScenarioChoice, Phrase } from '../../types';
import { PHRASES } from '../../constants/phrases';

interface OnboardingScenarioPlayerProps {
  script: ScenarioScript;
  onComplete?: (unlockedPhraseIds: string[]) => void;
}

type Phase = 'scene' | 'outcome' | 'unlock';

const OUTCOME_EMOJI: Record<string, string> = {
  excellent: '🌟',
  good: '✅',
  neutral: '💬',
  bad: '⚠️',
};

export function OnboardingScenarioPlayer({
  script,
  onComplete,
}: OnboardingScenarioPlayerProps) {
  const { C } = useTheme();
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
        content: { padding: 24, paddingBottom: 120 },

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
        charName: {
          fontFamily: FONT_LATIN_SEMI,
          fontSize: 13,
          color: C.TEXT2,
          fontWeight: '600',
        },
        npcArabic: {
          fontFamily: FONT_ARABIC_EXTRA,
          fontSize: 26,
          color: C.TEXT,
          textAlign: 'right',
          writingDirection: 'rtl',
          marginBottom: 6,
          lineHeight: 38,
        },
        npcRoman: {
          fontFamily: FONT_LATIN_SEMI,
          fontSize: 13,
          color: C.JADE2,
          fontWeight: '600',
          marginBottom: 4,
        },
        npcEnglish: {
          fontFamily: FONT_LATIN,
          fontSize: 13,
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
        choiceButton: {
          borderRadius: 14,
          padding: 14,
          marginBottom: 10,
          backgroundColor: C.SURFACE,
          borderWidth: 1,
          borderColor: C.BORDER,
        },
        choiceText: {
          fontFamily: FONT_LATIN_SEMI,
          fontSize: 14,
          color: C.TEXT,
          fontWeight: '600',
          marginBottom: 4,
        },
        choiceArabic: {
          fontFamily: FONT_ARABIC_EXTRA,
          fontSize: 16,
          color: C.TEXT2,
          textAlign: 'right',
          writingDirection: 'rtl',
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
          fontSize: 20,
          color: C.TEXT,
          textAlign: 'right',
          writingDirection: 'rtl',
          marginBottom: 4,
          lineHeight: 30,
        },
        youSaidRoman: {
          fontFamily: FONT_LATIN_SEMI,
          fontSize: 13,
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
          fontSize: 13,
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
          color: '#000',
          textAlign: 'right',
          writingDirection: 'rtl',
          marginBottom: 6,
          lineHeight: 42,
        },
        phraseRoman: {
          fontFamily: FONT_LATIN_SEMI,
          fontSize: 14,
          color: '#000',
          opacity: 0.8,
          fontWeight: '600',
          marginBottom: 2,
        },
        phraseEnglish: {
          fontFamily: FONT_LATIN,
          fontSize: 13,
          color: '#000',
          opacity: 0.7,
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
          backgroundColor: 'rgba(0,0,0,0.12)',
        },
        phraseUnlockedTagText: {
          fontFamily: FONT_LATIN_SEMI,
          fontSize: 10,
          color: '#000',
          opacity: 0.7,
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
          fontSize: 10,
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

        nextButton: {
          borderRadius: 14,
          overflow: 'hidden',
          marginTop: 8,
        },
        nextButtonContent: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingVertical: 15,
          paddingHorizontal: 20,
        },
        nextButtonText: {
          fontFamily: FONT_LATIN_SEMI,
          fontSize: 15,
          color: C.BG,
          fontWeight: '700',
        },
      }),
    [C]
  );

  // ── Scene phase ──────────────────────────────────────────────────────────────
  if (phase === 'scene' && scene) {
    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 300 }}
        >
          <View style={styles.settingBadge}>
            <Text style={{ fontSize: 11 }}>☕</Text>
            <Text style={styles.settingText}>{scene.setting}</Text>
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 350, delay: 80 }}
        >
          <View style={styles.npcCard}>
            <View style={styles.charRow}>
              <View style={styles.charAvatar}>
                <Text style={{ fontSize: 16 }}>{scene.charGender === 'female' ? '👩' : '👨'}</Text>
              </View>
              <Text style={styles.charName}>{scene.charName}</Text>
            </View>
            <Text style={styles.npcArabic}>{scene.arabic}</Text>
            <Text style={styles.npcRoman}>{scene.roman}</Text>
            <Text style={styles.npcEnglish}>{scene.english}</Text>
            {scene.teachingNote ? (
              <View style={styles.teachingNote}>
                <Text style={styles.teachingNoteText}>📌 {scene.teachingNote}</Text>
              </View>
            ) : null}
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 350, delay: 200 }}
        >
          <Text style={styles.choicesLabel}>Your response</Text>
          {scene.choices.map((choice, idx) => (
            <MotiView
              key={choice.id}
              from={{ opacity: 0, translateX: -6 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', duration: 280, delay: 240 + idx * 60 }}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.choiceButton,
                  pressed && { opacity: 0.75, borderColor: C.PRIMARY },
                ]}
                onPress={() => handleChoice(choice)}
                accessibilityRole="button"
              >
                <Text style={styles.choiceText}>{choice.text}</Text>
                {choice.arabic !== '—' ? (
                  <Text style={styles.choiceArabic}>{choice.arabic}</Text>
                ) : null}
              </Pressable>
            </MotiView>
          ))}
        </MotiView>
      </ScrollView>
    );
  }

  // ── Outcome phase ────────────────────────────────────────────────────────────
  if (phase === 'outcome' && chosenChoice) {
    const emoji = OUTCOME_EMOJI[chosenChoice.outcome] ?? '💬';
    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <MotiView
          from={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 150 }}
        >
          <Text style={styles.youSaidLabel}>You said</Text>
          <View style={styles.youSaidCard}>
            {chosenChoice.arabic !== '—' ? (
              <Text style={styles.youSaidArabic}>{chosenChoice.arabic}</Text>
            ) : null}
            <Text style={styles.youSaidRoman}>{chosenChoice.roman}</Text>
          </View>

          {chosenChoice.note ? (
            <View style={styles.outcomeCard}>
              <Text style={styles.outcomeText}>
                {emoji} {chosenChoice.note}
              </Text>
            </View>
          ) : null}

          <View style={styles.nextButton}>
            <LinearGradient
              colors={[C.PRIMARY, C.JADE]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.nextButtonContent,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={handleNext}
                accessibilityRole="button"
              >
                <Text style={styles.nextButtonText}>
                  {isLastScene ? 'See what you unlocked' : 'Continue'}
                </Text>
                <ChevronRight size={18} color={C.BG} strokeWidth={2.5} />
              </Pressable>
            </LinearGradient>
          </View>
        </MotiView>
      </ScrollView>
    );
  }

  // ── Unlock phase ─────────────────────────────────────────────────────────────
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 350 }}
      >
        <View style={styles.unlockHeader}>
          <Text style={{ fontSize: 36 }}>✨</Text>
          <Text style={styles.unlockTitle}>Phrase Unlocked!</Text>
          <Text style={styles.unlockSubtitle}>You learned this in your first Gulf Arabic exchange</Text>
        </View>

        {unlockedPhrases.length === 0 ? (
          <View style={[styles.phraseCard, { backgroundColor: C.SURFACE }]}>
            <View style={styles.phraseCardInner}>
              <Text style={[styles.phraseEnglish, { color: C.TEXT2 }]}>Scenario complete</Text>
            </View>
          </View>
        ) : (
          unlockedPhrases.map((phrase, idx) => (
            <MotiView
              key={phrase.id}
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 150, damping: 15, delay: idx * 200 }}
            >
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
                    <Text style={{ fontSize: 10 }}>✨</Text>
                    <Text style={styles.phraseUnlockedTagText}>Unlocked</Text>
                  </View>
                </LinearGradient>
              </View>

              {phrase.culturalNote ? (
                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: 'timing', duration: 350, delay: idx * 200 + 200 }}
                >
                  <View style={styles.culturalNoteCard}>
                    <Text style={styles.culturalNoteLabel}>Cultural Note</Text>
                    <Text style={styles.culturalNoteText}>{phrase.culturalNote}</Text>
                  </View>
                </MotiView>
              ) : null}
            </MotiView>
          ))
        )}

        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 350, delay: 400 }}
        >
          <View style={styles.nextButton}>
            <LinearGradient
              colors={[C.PRIMARY, C.JADE]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.nextButtonContent,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => onComplete?.(script.phrasesUnlocked ?? [])}
                accessibilityRole="button"
              >
                <Text style={styles.nextButtonText}>Continue to App</Text>
                <ChevronRight size={18} color={C.BG} strokeWidth={2.5} />
              </Pressable>
            </LinearGradient>
          </View>
        </MotiView>
      </MotiView>
    </ScrollView>
  );
}
