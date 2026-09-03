import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { ArrowRight, Volume2 } from '../icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  FONT_ARABIC, FONT_ARABIC_BLACK, FONT_LATIN, FONT_LATIN_BOLD, FONT_HEADING_SEMI,
} from '../design/tokens';
import { ANGLE_135 } from '../design/gradients';
import { useTheme } from '../../hooks/useTheme';
import { useArabicTTS } from '../../hooks/useArabicTTS';
import { KafMascot } from '../features/KafMascot';
import { STRINGS } from '../../constants/strings';
import { PHRASE_BY_ID } from '../../constants/phrases';
import type { Scenario, ScenarioEnding, ScenarioScene, ScenarioScript, Phrase } from '../../types';

interface Props {
  scriptData: ScenarioScript;
  scenario: Scenario | undefined;
  scenes: ScenarioScene[];
  endings: ScenarioEnding[];
  unlockedPhrases: Phrase[];
  onBegin: () => void;
}

export function ScenarioIntroPhase({ scriptData, scenario, scenes, endings, unlockedPhrases, onBegin }: Props) {
  const { C, G } = useTheme();
  const { speak } = useArabicTTS();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const nonBonusSceneCount = scenes.filter(s => !s.bonus).length;

  // Primer phrases preview the ones this scenario will unlock — resolve from the
  // library directly since they are not owned yet (hear now → earn later).
  const primerPhrases = (scriptData.primerPhrases ?? [])
    .map((id) => PHRASE_BY_ID[id])
    .filter((p): p is Phrase => !!p)
    .slice(0, 3);

  const playPrimer = (phraseId: string, arabic: string) => {
    setPlayingId(phraseId);
    speak(arabic);
  };

  return (
    <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 360 }}>
      <View style={{ alignItems: 'center', gap: 18, paddingTop: 12 }}>

        {/* Kaf icon with Arabic watermark */}
        <View style={{ position: 'relative', width: '100%', alignItems: 'center', height: 72, justifyContent: 'center' }}>
          <Text style={{ fontFamily: FONT_ARABIC, fontSize: 72, color: C.JADE_ACCENT, opacity: 0.07, position: 'absolute' }}>
            {scenario?.arabicScene || ''}
          </Text>
          <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: C.JADE_ACCENT_DIM, borderWidth: 1.5, borderColor: C.JADE_ACCENT_BORDER, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 26, color: C.JADE_ACCENT }}>ك</Text>
          </View>
        </View>

        {/* Title and subtitle */}
        <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
          <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 22, color: C.TEXT, marginBottom: 8, textAlign: 'center' }}>
            {scriptData.title}
          </Text>
          <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, textAlign: 'center', lineHeight: 22 }}>
            {scenario?.subtitle || STRINGS.scenarios.introDesc}
          </Text>
        </View>

        {/* Kaf's introduction */}
        <View style={{ width: '100%', borderRadius: 16, padding: 14, backgroundColor: C.VIOLET_SURFACE, borderWidth: 1, borderColor: C.VIOLET_BORDER, flexDirection: 'row', gap: 12 }}>
          <KafMascot size="xs" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 11, color: C.VIOLET2, marginBottom: 3 }}>
              {STRINGS.scenarios.kafSays}
            </Text>
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, lineHeight: 20 }}>
              {scenario?.kafIntro || STRINGS.scenarios.kafIntro}
            </Text>
          </View>
        </View>

        {/* Primer — listen-only phrase chips */}
        {primerPhrases.length > 0 && (
          <View style={{ width: '100%', gap: 8 }}>
            <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 11, color: C.TEXT2, letterSpacing: 0.4, textTransform: 'uppercase' }}>
              {STRINGS.scenarios.primerTitle}
            </Text>
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginTop: -4 }}>
              {STRINGS.scenarios.primerSub}
            </Text>
            {primerPhrases.map((p) => {
              const isPlaying = playingId === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => playPrimer(p.id, p.arabic)}
                  accessibilityRole="button"
                  accessibilityLabel={`${p.arabic} — ${p.english}. ${STRINGS.scenarios.primerListen}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 14,
                    backgroundColor: isPlaying ? C.JADE_ACCENT_DIM : C.SURFACE,
                    borderWidth: 1,
                    borderColor: isPlaying ? C.JADE_ACCENT_BORDER : C.BORDER,
                  }}
                >
                  <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: isPlaying ? C.JADE_DIM : C.JADE_ACCENT_DIM, alignItems: 'center', justifyContent: 'center' }}>
                    <Volume2 size={14} color={isPlaying ? C.JADE : C.PRIMARY} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 17, color: C.TEXT, textAlign: 'right' }}>
                      {p.arabic}
                    </Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, textAlign: 'right', fontStyle: 'italic' }}>
                      {p.roman}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: C.TEXT3, maxWidth: 110 }}>
                    {isPlaying ? STRINGS.scenarios.playing : p.english}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Stats: decisions / outcomes / phrases */}
        <View style={{ width: '100%', flexDirection: 'row', gap: 10 }}>
          {[
            [`${nonBonusSceneCount}`, STRINGS.scenarios.decisionLabel(nonBonusSceneCount)],
            [`${endings.length}`, STRINGS.scenarios.outcomeLabel(endings.length)],
            [unlockedPhrases.length > 0 ? `${unlockedPhrases.length}` : '8+', STRINGS.scenarios.phraseLabel(8)],
          ].map(([v, l]) => (
            <View key={l} style={{ flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 14, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
              <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 20, color: C.TEXT }}>{v}</Text>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: C.TEXT3, marginTop: 2 }}>{l}</Text>
            </View>
          ))}
        </View>

        {/* Secret ending hint */}
        {scriptData.endings.some(e => e.secret) && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: C.VIOLET_SURFACE, borderWidth: 1, borderColor: C.VIOLET_BORDER }}>
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: C.VIOLET2 }} />
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.VIOLET2 }}>
              {STRINGS.scenarios.secretEndingExists}
            </Text>
          </View>
        )}

        {/* Begin button */}
        <Pressable onPress={onBegin} accessibilityRole="button" style={{ width: '100%', borderRadius: 16, overflow: 'hidden' }}>
          <LinearGradient colors={[...G.GOLD_STOPS]} start={ANGLE_135.start} end={ANGLE_135.end} style={{ paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
            <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 15, color: C.BG }}>{STRINGS.scenarios.begin}</Text>
            <ArrowRight size={17} color={C.BG} />
          </LinearGradient>
        </Pressable>

      </View>
    </MotiView>
  );
}