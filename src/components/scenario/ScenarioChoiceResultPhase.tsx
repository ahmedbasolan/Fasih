import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { CheckCircle, ArrowRight } from '../icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  FONT_ARABIC, FONT_LATIN, FONT_LATIN_BOLD, FONT_HEADING_SEMI,
} from '../design/tokens';
import { ANGLE_135 } from '../design/gradients';
import { useTheme } from '../../hooks/useTheme';
import { Companion } from '../ui/Companion';
import { STRINGS } from '../../constants/strings';
import { getTone } from '../../engine/scenarioEngine';
import type { ChoiceFeedback } from '../../engine/scenarioPresentation';
import type { ScenarioChoice, ScenarioScene, ScenarioState } from '../../types';

interface Props {
  scene: ScenarioScene;
  selectedChoiceId: string;
  /** What kind of feedback this choice gets — decided in engine/scenarioPresentation. */
  feedback: ChoiceFeedback;
  color: string;
  /** No scene follows this choice: the button leads to the result. */
  isLastStep: boolean;
  /** The scene that follows, for the tone preview. */
  nextScene: ScenarioScene | null;
  activeScenarioState: ScenarioState | null;
  replaceName: (text: string) => string;
  arabicForUser: (choice: ScenarioChoice) => string;
  onNext: () => void;
}

export function ScenarioChoiceResultPhase({
  scene, selectedChoiceId, feedback, color, isLastStep, nextScene,
  activeScenarioState, replaceName, arabicForUser, onNext,
}: Props) {
  const { C, G } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    column: { gap: 20, paddingTop: 10 },
    header: { alignItems: 'center', gap: 8 },
    iconRing: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
    reactionHeading: { fontFamily: FONT_HEADING_SEMI, fontSize: 16, color: C.TEXT2 },
    gradedHeading: { fontFamily: FONT_LATIN_BOLD, fontSize: 22 },
    card: { borderRadius: 20, padding: 18, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER },
    rightFormCard: { borderRadius: 20, padding: 18, backgroundColor: C.JADE_SURFACE, borderWidth: 1, borderColor: C.JADE_BORDER },
    cardLabel: { fontFamily: FONT_LATIN_BOLD, fontSize: 11, color: C.TEXT3, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
    arabic: { fontFamily: FONT_ARABIC, fontSize: 22, color: C.JADE, textAlign: 'right', marginBottom: 6, lineHeight: 30 },
    roman: { fontFamily: FONT_LATIN, fontSize: 12, color: `${C.JADE}80`, fontStyle: 'italic', marginBottom: 4 },
    english: { fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, lineHeight: 22 },
    insightCard: { borderRadius: 20, padding: 20, backgroundColor: C.VIOLET_SURFACE, borderWidth: 1, borderColor: C.VIOLET_BORDER, gap: 12 },
    insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    insightTitle: { fontFamily: FONT_LATIN_BOLD, fontSize: 14, color: C.VIOLET },
    insightBody: { fontFamily: FONT_LATIN, fontSize: 16, color: C.TEXT2, lineHeight: 24 },
    impactCard: { alignItems: 'center', paddingVertical: 16, borderRadius: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER },
    impactTotal: { fontFamily: FONT_LATIN_BOLD, fontSize: 28 },
    impactLabel: { fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.8 },
    impactRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
    impactMeter: { fontFamily: FONT_LATIN, fontSize: 11 },
    tonePreview: { borderRadius: 14, padding: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
    toneDot: { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },
    toneText: { fontFamily: FONT_LATIN, fontSize: 12, flex: 1, lineHeight: 18 },
    button: { borderRadius: 20, overflow: 'hidden', marginTop: 10 },
    buttonFill: { paddingVertical: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 },
    buttonLabel: { fontFamily: FONT_HEADING_SEMI, fontSize: 16, color: C.BG },
  }), [C]);

  const choice = scene.choices.find(c => c.id === selectedChoiceId);
  if (!choice) return null;

  // A valid judgement choice is not graded: no label, no score. The NPC's
  // reaction and the cultural note carry it (spec 2026-09-14 §2.4).
  const graded = feedback.kind !== 'reaction';
  const npcFirstName = scene.charName.split(' ')[0];
  const heading =
    feedback.kind === 'graded' ? STRINGS.scenarios.choiceOutcome[feedback.outcome]
    : feedback.kind === 'correct' ? STRINGS.scenarios.feedbackCorrect
    : feedback.kind === 'not-quite' ? STRINGS.scenarios.feedbackNotQuite
    : feedback.kind === 'misstep' ? STRINGS.scenarios.feedbackMisstep
    : STRINGS.scenarios.feedbackReaction(npcFirstName);

  const totalImpact = (choice.impact?.trust ?? 0) + (choice.impact?.respect ?? 0) + (choice.impact?.culture ?? 0);

  // Butterfly effect: predict tone for next scene
  const nextTone = nextScene?.charDialogue && activeScenarioState
    ? getTone(activeScenarioState, nextScene.charName, nextScene)
    : 'neutral';
  const showButterflyEffect = nextTone !== 'neutral' && !!nextScene?.charDialogue;
  const warm = nextTone === 'warm';
  const buttonLabel = isLastStep ? STRINGS.scenarios.seeFinalResult : STRINGS.scenarios.continue;

  return (
    <MotiView
      key={`choice-result-${scene.id}`}
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <View style={styles.column}>

        {/* Outcome header */}
        <View style={styles.header}>
          {graded && (
            <View style={[styles.iconRing, { backgroundColor: `${color}15` }]}>
              <CheckCircle size={32} color={color} />
            </View>
          )}
          <Text style={graded ? [styles.gradedHeading, { color }] : styles.reactionHeading}>
            {heading}
          </Text>
        </View>

        {/* What you said */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>{STRINGS.scenarios.youSaid}</Text>
          <Text style={styles.arabic}>{replaceName(arabicForUser(choice))}</Text>
          <Text style={styles.english}>{replaceName(choice.text)}</Text>
        </View>

        {/* Language scene, near miss: show the form to use */}
        {feedback.kind === 'not-quite' && feedback.correct && (
          <View style={styles.rightFormCard}>
            <Text style={styles.cardLabel}>{STRINGS.scenarios.feedbackRightForm}</Text>
            <Text style={styles.arabic}>{replaceName(arabicForUser(feedback.correct))}</Text>
            <Text style={styles.roman}>{replaceName(feedback.correct.roman)}</Text>
            <Text style={styles.english}>{replaceName(feedback.correct.text)}</Text>
          </View>
        )}

        {/* Kaf's cultural insight */}
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Companion size={32} />
            <Text style={styles.insightTitle}>{STRINGS.scenarios.culturalInsight}</Text>
          </View>
          <Text style={styles.insightBody}>{choice.note || STRINGS.scenarios.noteFallback}</Text>
        </View>

        {/* Impact total — graded choices only */}
        {graded && (
          <View style={styles.impactCard}>
            <Text style={[styles.impactTotal, { color: totalImpact >= 0 ? C.JADE2 : C.ERROR }]}>
              {totalImpact > 0 ? `+${totalImpact}` : totalImpact}
            </Text>
            <Text style={styles.impactLabel}>{STRINGS.scenarios.impactLabel}</Text>
            <View style={styles.impactRow}>
              <Text style={[styles.impactMeter, { color: C.CULTURAL_GOLD }]}>{STRINGS.scenarios.impactShort.trust(choice.impact?.trust ?? 0)}</Text>
              <Text style={[styles.impactMeter, { color: C.JADE2 }]}>{STRINGS.scenarios.impactShort.respect(choice.impact?.respect ?? 0)}</Text>
              <Text style={[styles.impactMeter, { color: C.VIOLET }]}>{STRINGS.scenarios.impactShort.culture(choice.impact?.culture ?? 0)}</Text>
            </View>
          </View>
        )}

        {/* Butterfly effect: next scene tone prediction */}
        {showButterflyEffect && nextScene && (
          <MotiView
            from={{ opacity: 0, translateY: 6 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300, delay: 420 }}
          >
            <View style={[styles.tonePreview, {
              backgroundColor: warm ? C.JADE_ACCENT_DIM : C.SURFACE,
              borderColor: warm ? C.JADE_ACCENT_BORDER : C.BORDER,
            }]}>
              <View style={[styles.toneDot, { backgroundColor: warm ? C.JADE_ACCENT : C.TEXT3 }]} />
              <Text style={[styles.toneText, { color: warm ? C.JADE_ACCENT : C.TEXT3 }]}>
                {warm
                  ? STRINGS.scenarios.tonePreviewWarm(nextScene.charName.split(' ')[0])
                  : STRINGS.scenarios.tonePreviewCold(nextScene.charName.split(' ')[0])}
              </Text>
            </View>
          </MotiView>
        )}

        {/* Continue */}
        <Pressable
          onPress={onNext}
          accessibilityRole="button"
          accessibilityLabel={buttonLabel}
          style={styles.button}
        >
          <LinearGradient colors={[...G.GOLD_STOPS]} start={ANGLE_135.start} end={ANGLE_135.end} style={styles.buttonFill}>
            <Text style={styles.buttonLabel}>{buttonLabel}</Text>
            <ArrowRight size={20} color={C.BG} />
          </LinearGradient>
        </Pressable>

      </View>
    </MotiView>
  );
}
