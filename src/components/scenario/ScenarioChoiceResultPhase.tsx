import React from 'react';
import { View, Text, Pressable } from 'react-native';
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

/** Legacy scenes (no `kind`) keep their old grade labels. */
const outcomeLabel: Record<string, string> = {
  excellent: 'Excellent',
  good: 'Good choice',
  neutral: 'Neutral',
  bad: 'Cultural misstep',
};

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
  const accentColor = C.JADE;
  const violetColor = C.VIOLET;

  const choice = scene.choices.find(c => c.id === selectedChoiceId);
  if (!choice) return null;

  // A valid judgement choice is not graded: no label, no score. The NPC's
  // reaction and the cultural note carry it (spec 2026-09-14 §2.4).
  const graded = feedback.kind !== 'reaction';
  const heading =
    feedback.kind === 'graded' ? outcomeLabel[feedback.outcome]
    : feedback.kind === 'correct' ? STRINGS.scenarios.feedbackCorrect
    : feedback.kind === 'not-quite' ? STRINGS.scenarios.feedbackNotQuite
    : feedback.kind === 'misstep' ? STRINGS.scenarios.feedbackMisstep
    : STRINGS.scenarios.feedbackReaction(scene.charName.split(' ')[0]);

  const totalImpact = (choice.impact?.trust ?? 0) + (choice.impact?.respect ?? 0) + (choice.impact?.culture ?? 0);

  // Butterfly effect: predict tone for next scene
  const nextTone = nextScene?.charDialogue && activeScenarioState
    ? getTone(activeScenarioState, nextScene.charName, nextScene)
    : 'neutral';
  const showButterflyEffect = nextTone !== 'neutral' && !!nextScene?.charDialogue;

  return (
    <MotiView
      key={`choice-result-${scene.id}`}
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <View style={{ gap: 20, paddingTop: 10 }}>

        {/* Outcome header */}
        <View style={{ alignItems: 'center', gap: 8 }}>
          {graded && (
            <View
              style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: `${color}15`, alignItems: 'center', justifyContent: 'center' }}
            >
              <CheckCircle size={32} color={color} />
            </View>
          )}
          <Text style={{ fontFamily: graded ? FONT_LATIN_BOLD : FONT_HEADING_SEMI, fontSize: graded ? 22 : 16, color: graded ? color : C.TEXT2 }}>
            {heading}
          </Text>
        </View>

        {/* What you said */}
        <View style={{ borderRadius: 20, padding: 18, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
          <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 11, color: C.TEXT3, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            You Said
          </Text>
          <Text style={{ fontFamily: FONT_ARABIC, fontSize: 22, color: accentColor, textAlign: 'right', marginBottom: 6, lineHeight: 30 }}>
            {replaceName(arabicForUser(choice))}
          </Text>
          <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, lineHeight: 22 }}>
            {replaceName(choice.text)}
          </Text>
        </View>

        {/* Language scene, near miss: show the form to use */}
        {feedback.kind === 'not-quite' && feedback.correct && (
          <View style={{ borderRadius: 20, padding: 18, backgroundColor: C.JADE_SURFACE, borderWidth: 1, borderColor: C.JADE_BORDER }}>
            <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 11, color: C.TEXT3, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              {STRINGS.scenarios.feedbackRightForm}
            </Text>
            <Text style={{ fontFamily: FONT_ARABIC, fontSize: 22, color: accentColor, textAlign: 'right', marginBottom: 6, lineHeight: 30 }}>
              {replaceName(arabicForUser(feedback.correct))}
            </Text>
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: `${accentColor}80`, fontStyle: 'italic', marginBottom: 4 }}>
              {replaceName(feedback.correct.roman)}
            </Text>
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, lineHeight: 22 }}>
              {replaceName(feedback.correct.text)}
            </Text>
          </View>
        )}

        {/* Kaf's cultural insight */}
        <View style={{ borderRadius: 20, padding: 20, backgroundColor: C.VIOLET_SURFACE, borderWidth: 1, borderColor: C.VIOLET_BORDER, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Companion size={32} />
            <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 14, color: violetColor }}>Cultural Insight</Text>
          </View>
          <Text style={{ fontFamily: FONT_LATIN, fontSize: 16, color: C.TEXT2, lineHeight: 24 }}>
            {choice.note || 'A solid choice in this context. Keep it up!'}
          </Text>
        </View>

        {/* Impact total — graded choices only */}
        {graded && (
          <View style={{ alignItems: 'center', paddingVertical: 16, borderRadius: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
            <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 28, color: totalImpact >= 0 ? C.JADE2 : C.ERROR }}>
              {totalImpact > 0 ? `+${totalImpact}` : totalImpact}
            </Text>
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.8 }}>Impact</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.CULTURAL_GOLD }}>T: {choice.impact?.trust ?? 0}</Text>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.JADE2 }}>R: {choice.impact?.respect ?? 0}</Text>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.VIOLET }}>C: {choice.impact?.culture ?? 0}</Text>
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
            <View style={{
              borderRadius: 14, padding: 14,
              backgroundColor: nextTone === 'warm' ? C.JADE_ACCENT_DIM : C.SURFACE,
              borderWidth: 1, borderColor: nextTone === 'warm' ? C.JADE_ACCENT_BORDER : C.BORDER,
              flexDirection: 'row', alignItems: 'center', gap: 10,
            }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: nextTone === 'warm' ? C.JADE_ACCENT : C.TEXT3, flexShrink: 0 }} />
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: nextTone === 'warm' ? C.JADE_ACCENT : C.TEXT3, flex: 1, lineHeight: 18 }}>
                {nextTone === 'warm'
                  ? `${nextScene.charName.split(' ')[0]} will be more open with you in the next scene`
                  : `${nextScene.charName.split(' ')[0]} will be more guarded in the next scene`}
              </Text>
            </View>
          </MotiView>
        )}

        {/* Continue */}
        <Pressable
          onPress={onNext}
          accessibilityRole="button"
          accessibilityLabel={isLastStep ? 'See final result' : 'Continue'}
          style={{ borderRadius: 20, overflow: 'hidden', marginTop: 10 }}
        >
          <LinearGradient colors={[...G.GOLD_STOPS]} start={ANGLE_135.start} end={ANGLE_135.end} style={{ paddingVertical: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
            <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 16, color: C.BG }}>
              {isLastStep ? 'See Final Result' : 'Continue'}
            </Text>
            <ArrowRight size={20} color={C.BG} />
          </LinearGradient>
        </Pressable>

      </View>
    </MotiView>
  );
}
