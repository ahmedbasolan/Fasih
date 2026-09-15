import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { ArrowRight, Volume2 } from '../icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  FONT_ARABIC, FONT_ARABIC_BLACK, FONT_LATIN, FONT_LATIN_BOLD, FONT_HEADING_SEMI,
} from '../design/tokens';
import { ANGLE_135 } from '../design/gradients';
import { useTheme } from '../../hooks/useTheme';
import { useArabicTTS } from '../../hooks/useArabicTTS';
import { Companion } from '../ui/Companion';
import { STRINGS } from '../../constants/strings';
import { PHRASE_BY_ID } from '../../constants/phrases';
import type { EndingHint, EndingsProgress } from '../../engine/scenarioPresentation';
import type { Scenario, ScenarioEnding, ScenarioScript, Phrase } from '../../types';

interface Props {
  scriptData: ScenarioScript;
  scenario: Scenario | undefined;
  endings: ScenarioEnding[];
  unlockedPhrases: Phrase[];
  /** Decisions per run — not scenes, which a fork doubles up. */
  decisions: number;
  progress: EndingsProgress;
  /** Hints toward endings not found yet. Empty on a first play, so it stays fresh. */
  hints: EndingHint[];
  onBegin: () => void;
}

export function ScenarioIntroPhase({ scriptData, scenario, endings, unlockedPhrases, decisions, progress, hints, onBegin }: Props) {
  const { C, G } = useTheme();
  const { speak } = useArabicTTS();
  const [playingId, setPlayingId] = useState<string | null>(null);

  const styles = useMemo(() => StyleSheet.create({
    column: { alignItems: 'center', gap: 18, paddingTop: 12 },
    flex: { flex: 1 },
    // Icon with the scene's Arabic watermark
    iconArea: { position: 'relative', width: '100%', alignItems: 'center', height: 72, justifyContent: 'center' },
    watermark: { fontFamily: FONT_ARABIC, fontSize: 34, color: C.JADE_ACCENT, opacity: 0.07, position: 'absolute' },
    iconTile: { width: 52, height: 52, borderRadius: 16, backgroundColor: C.JADE_ACCENT_DIM, borderWidth: 1.5, borderColor: C.JADE_ACCENT_BORDER, alignItems: 'center', justifyContent: 'center' },
    iconGlyph: { fontFamily: FONT_ARABIC_BLACK, fontSize: 28, color: C.JADE_ACCENT },
    // Title
    titleBlock: { alignItems: 'center', paddingHorizontal: 16 },
    title: { fontFamily: FONT_HEADING_SEMI, fontSize: 22, color: C.TEXT, marginBottom: 8, textAlign: 'center' },
    subtitle: { fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, textAlign: 'center', lineHeight: 22 },
    // Cultural note
    note: { width: '100%', borderRadius: 16, padding: 14, backgroundColor: C.VIOLET_SURFACE, borderWidth: 1, borderColor: C.VIOLET_BORDER, flexDirection: 'row', gap: 12 },
    noteLabel: { fontFamily: FONT_LATIN_BOLD, fontSize: 11, color: C.VIOLET2, marginBottom: 3 },
    noteBody: { fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, lineHeight: 20 },
    // Primer
    primer: { width: '100%', gap: 8 },
    blockTitle: { fontFamily: FONT_LATIN_BOLD, fontSize: 11, color: C.TEXT2, letterSpacing: 0.4, textTransform: 'uppercase' },
    primerSub: { fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginTop: -4 },
    chip: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
    chipIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    chipArabic: { fontFamily: FONT_ARABIC_BLACK, fontSize: 18, color: C.TEXT, textAlign: 'right' },
    chipRoman: { fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, textAlign: 'right', fontStyle: 'italic' },
    chipEnglish: { fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, maxWidth: 110 },
    // Stats
    stats: { width: '100%', flexDirection: 'row', gap: 10 },
    stat: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 14, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER },
    statValue: { fontFamily: FONT_LATIN_BOLD, fontSize: 22, color: C.TEXT },
    statLabel: { fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginTop: 2 },
    // Endings collection and hints
    endingsPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: C.VIOLET_SURFACE, borderWidth: 1, borderColor: C.VIOLET_BORDER },
    endingsDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.VIOLET2 },
    endingsText: { fontFamily: FONT_LATIN, fontSize: 11, color: C.VIOLET2 },
    hintsCard: { width: '100%', borderRadius: 14, padding: 14, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER, gap: 8 },
    hintText: { fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, lineHeight: 19 },
    // Begin
    begin: { width: '100%', borderRadius: 16, overflow: 'hidden' },
    beginFill: { paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
    beginText: { fontFamily: FONT_HEADING_SEMI, fontSize: 16, color: C.BG },
  }), [C]);

  // Primer phrases preview the ones this scenario will unlock — resolve from the
  // library directly since they are not owned yet (hear now → earn later).
  const primerPhrases = (scriptData.primerPhrases ?? [])
    .map((id) => PHRASE_BY_ID[id])
    .filter((p): p is Phrase => !!p)
    .slice(0, 3);

  // The playing indicator has to clear itself. Setting it without a reset left
  // the chip lit permanently after the first tap, since expo-speech gives this
  // component no completion callback. Same timer-ref pattern as PhraseLibrary
  // and ScenarioPlayer, including the unmount cleanup those learned to need.
  const primerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (primerTimerRef.current) clearTimeout(primerTimerRef.current);
  }, []);

  const playPrimer = (phraseId: string, arabic: string) => {
    if (primerTimerRef.current) clearTimeout(primerTimerRef.current);
    setPlayingId(phraseId);
    speak(arabic);
    primerTimerRef.current = setTimeout(() => {
      setPlayingId(null);
      primerTimerRef.current = null;
    }, 4000);
  };

  return (
    <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 360 }}>
      <View style={styles.column}>

        {/* Icon with Arabic watermark */}
        <View style={styles.iconArea}>
          <Text style={styles.watermark}>{scenario?.arabicScene || ''}</Text>
          <View style={styles.iconTile}>
            <Text style={styles.iconGlyph}>ك</Text>
          </View>
        </View>

        {/* Title and subtitle */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{scriptData.title}</Text>
          <Text style={styles.subtitle}>{scenario?.subtitle || STRINGS.scenarios.introDesc}</Text>
        </View>

        {/* Cultural note */}
        <View style={styles.note}>
          <Companion size={32} />
          <View style={styles.flex}>
            <Text style={styles.noteLabel}>{STRINGS.scenarios.kafSays}</Text>
            <Text style={styles.noteBody}>{scenario?.kafIntro || STRINGS.scenarios.kafIntro}</Text>
          </View>
        </View>

        {/* Primer — listen-only phrase chips */}
        {primerPhrases.length > 0 && (
          <View style={styles.primer}>
            <Text style={styles.blockTitle}>{STRINGS.scenarios.primerTitle}</Text>
            <Text style={styles.primerSub}>{STRINGS.scenarios.primerSub}</Text>
            {primerPhrases.map((p) => {
              const isPlaying = playingId === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => playPrimer(p.id, p.arabic)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`${p.arabic} — ${p.english}. ${STRINGS.scenarios.primerListen}`}
                  style={[styles.chip, {
                    backgroundColor: isPlaying ? C.JADE_ACCENT_DIM : C.SURFACE,
                    borderColor: isPlaying ? C.JADE_ACCENT_BORDER : C.BORDER,
                  }]}
                >
                  <View style={[styles.chipIcon, { backgroundColor: isPlaying ? C.JADE_DIM : C.JADE_ACCENT_DIM }]}>
                    <Volume2 size={14} color={isPlaying ? C.JADE : C.PRIMARY} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.chipArabic}>{p.arabic}</Text>
                    <Text style={styles.chipRoman}>{p.roman}</Text>
                  </View>
                  <Text style={styles.chipEnglish}>{isPlaying ? STRINGS.scenarios.playing : p.english}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Stats: decisions / outcomes / phrases */}
        <View style={styles.stats}>
          {[
            [`${decisions}`, STRINGS.scenarios.decisionLabel(decisions)],
            [`${endings.length}`, STRINGS.scenarios.outcomeLabel(endings.length)],
            // The real count. The fallback was a typed-in '8+'.
            [`${unlockedPhrases.length}`, STRINGS.scenarios.phraseLabel(unlockedPhrases.length)],
          ].map(([v, l]) => (
            <View key={l} style={styles.stat}>
              <Text style={styles.statValue}>{v}</Text>
              <Text style={styles.statLabel}>{l}</Text>
            </View>
          ))}
        </View>

        {/* Endings collection — "0 of 5 endings found · 1 hidden" */}
        <View style={styles.endingsPill}>
          <View style={styles.endingsDot} />
          <Text style={styles.endingsText}>{STRINGS.scenarios.endingsSummary(progress)}</Text>
        </View>

        {/* Hints — replays only */}
        {hints.length > 0 && (
          <View style={styles.hintsCard}>
            <Text style={styles.blockTitle}>{STRINGS.scenarios.hintsTitle}</Text>
            {hints.map((h) => (
              <Text key={h.endingId} style={styles.hintText}>
                {h.hidden ? `${STRINGS.scenarios.hintHidden}: ` : ''}{h.hint}
              </Text>
            ))}
          </View>
        )}

        {/* Begin button */}
        <Pressable onPress={onBegin} accessibilityRole="button" style={styles.begin}>
          <LinearGradient colors={[...G.GOLD_STOPS]} start={ANGLE_135.start} end={ANGLE_135.end} style={styles.beginFill}>
            <Text style={styles.beginText}>{STRINGS.scenarios.begin}</Text>
            <ArrowRight size={17} color={C.BG} />
          </LinearGradient>
        </Pressable>

      </View>
    </MotiView>
  );
}
