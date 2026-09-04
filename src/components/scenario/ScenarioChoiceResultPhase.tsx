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
import { getTone } from '../../engine/scenarioEngine';
import type { ScenarioScene, ScenarioScript, ScenarioState } from '../../types';

const outcomeLabel: Record<string, string> = {
  excellent: 'Excellent',
  good: 'Good choice',
  neutral: 'Neutral',
  bad: 'Cultural misstep',
};

interface Props {
  scene: ScenarioScene;
  selectedChoiceId: string;
  step: number;
  scenes: ScenarioScene[];
  scriptData: ScenarioScript;
  activeScenarioState: ScenarioState | null;
  lastResolvedNextSceneId: string | null;
  outcomeColor: Record<string, string>;
  replaceName: (text: string) => string;
  onNext: () => void;
}

export function ScenarioChoiceResultPhase({
  scene, selectedChoiceId, step, scenes, scriptData,
  activeScenarioState, lastResolvedNextSceneId,
  outcomeColor, replaceName, onNext,
}: Props) {
  const { C, G } = useTheme();
  const accentColor = C.JADE;
  const violetColor = C.VIOLET;

  const choice = scene.choices.find(c => c.id === selectedChoiceId);
  if (!choice) return null;

  const color = outcomeColor[choice.outcome];
  const totalImpact = (choice.impact?.trust ?? 0) + (choice.impact?.respect ?? 0) + (choice.impact?.culture ?? 0);
  const isLastScene = scenes[step]?.bonus || step + 1 >= scenes.length || scenes[step + 1]?.bonus;

  // Butterfly effect: predict tone for next scene
  const nextIdx = lastResolvedNextSceneId
    ? scenes.findIndex(s => s.id === lastResolvedNextSceneId)
    : step + 1;
  const nextScene = nextIdx >= 0 && nextIdx < scenes.length ? scenes[nextIdx] : null;
  const nextTone = nextScene?.charDialogue && activeScenarioState
    ? getTone(activeScenarioState, nextScene.charName, nextScene)
    : 'neutral';
  const showButterflyEffect = nextTone !== 'neutral' && !!nextScene?.charDialogue;

  return (
    <MotiView
      key={`choice-result-${step}`}
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <View style={{ gap: 20, paddingTop: 10 }}>

        {/* Outcome header */}
        <View style={{ alignItems: 'center', gap: 8 }}>
          <View
            style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: `${color}15`, alignItems: 'center', justifyContent: 'center' }}
          >
            <CheckCircle size={32} color={color} />
          </View>
          <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 24, color }}>
            {outcomeLabel[choice.outcome]}
          </Text>
        </View>

        {/* What you said */}
        <View style={{ borderRadius: 20, padding: 18, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
          <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 10, color: C.TEXT3, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            You Said
          </Text>
          <Text style={{ fontFamily: FONT_ARABIC, fontSize: 20, color: accentColor, textAlign: 'right', marginBottom: 6, lineHeight: 30 }}>
            {replaceName(choice.arabic)}
          </Text>
          <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, lineHeight: 22 }}>
            {replaceName(choice.text)}
          </Text>
        </View>

        {/* Kaf's cultural insight */}
        <View style={{ borderRadius: 20, padding: 20, backgroundColor: C.VIOLET_SURFACE, borderWidth: 1, borderColor: C.VIOLET_BORDER, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Companion size={32} />
            <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 14, color: violetColor }}>Cultural Insight</Text>
          </View>
          <Text style={{ fontFamily: FONT_LATIN, fontSize: 15, color: C.TEXT2, lineHeight: 24 }}>
            {choice.note || 'A solid choice in this context. Keep it up!'}
          </Text>
        </View>

        {/* Impact total */}
        <View style={{ alignItems: 'center', paddingVertical: 16, borderRadius: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
          <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 28, color: totalImpact >= 0 ? C.JADE2 : C.ERROR }}>
            {totalImpact > 0 ? `+${totalImpact}` : totalImpact}
          </Text>
          <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: C.TEXT3, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.8 }}>Impact</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.CULTURAL_GOLD }}>T: {choice.impact?.trust ?? 0}</Text>
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.JADE2 }}>R: {choice.impact?.respect ?? 0}</Text>
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.VIOLET }}>C: {choice.impact?.culture ?? 0}</Text>
          </View>
        </View>

        {/* Butterfly effect: next scene tone prediction */}
        {showButterflyEffect && (
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
                  ? `${nextScene!.charName.split(' ')[0]} will be more open with you in the next scene`
                  : `${nextScene!.charName.split(' ')[0]} will be more guarded in the next scene`}
              </Text>
            </View>
          </MotiView>
        )}

        {/* Continue */}
        <Pressable
          onPress={onNext}
          accessibilityRole="button"
          accessibilityLabel={isLastScene ? 'See final result' : 'Continue'}
          style={{ borderRadius: 20, overflow: 'hidden', marginTop: 10 }}
        >
          <LinearGradient colors={[...G.GOLD_STOPS]} start={ANGLE_135.start} end={ANGLE_135.end} style={{ paddingVertical: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
            <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 16, color: C.BG }}>
              {isLastScene ? 'See Final Result' : 'Continue'}
            </Text>
            <ArrowRight size={20} color={C.BG} />
          </LinearGradient>
        </Pressable>

      </View>
    </MotiView>
  );
}
