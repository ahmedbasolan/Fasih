import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { Compass, Users, BookOpen, RotateCcw, Home, ArrowRight, Volume2, Blocks, Sparkles } from '../icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  FONT_ARABIC, FONT_LATIN, FONT_LATIN_BOLD, FONT_LATIN_SEMI, FONT_HEADING_SEMI,
} from '../design/tokens';
import { ANGLE_135 } from '../design/gradients';
import { useTheme } from '../../hooks/useTheme';
import { Companion } from '../ui/Companion';
import { MarginRail } from './MarginRail';
import { STRINGS } from '../../constants/strings';
import { GRAMMAR_PATTERNS } from '../../constants/grammar';
import type { RailMark } from '../../engine/marginRail';
import type { EndingHint, EndingsProgress } from '../../engine/scenarioPresentation';
import type { Phrase, ScenarioChoice, ScenarioEnding } from '../../types';

// ─── PhraseCard ───────────────────────────────────────────────────────────────
// Only used on the result screen, so it lives here alongside its only consumer.

function PhraseCard({ arabic, roman, english, onSpeak, isPlaying }: {
  arabic: string;
  roman: string;
  english: string;
  onSpeak: () => void;
  isPlaying: boolean;
}) {
  const { C } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    card: { borderRadius: 14, padding: 14, backgroundColor: C.JADE_SURFACE, borderWidth: 1, borderColor: C.JADE_BORDER, gap: 4 },
    top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    arabic: { fontFamily: FONT_ARABIC, fontSize: 22, color: C.JADE, textAlign: 'right', flex: 1, lineHeight: 30 },
    speak: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, marginLeft: 10 },
    roman: { fontFamily: FONT_LATIN, fontSize: 11, color: `${C.JADE}80`, fontStyle: 'italic' },
    english: { fontFamily: FONT_LATIN_BOLD, fontSize: 14, color: C.TEXT2, marginTop: 2 },
  }), [C]);

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.arabic}>{arabic}</Text>
        <Pressable
          hitSlop={8}
          onPress={onSpeak}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? STRINGS.scenarios.stopAudio : STRINGS.scenarios.listenToPhrase}
          style={[styles.speak, {
            backgroundColor: isPlaying ? C.JADE_DIM : C.SURFACE,
            borderColor: isPlaying ? C.JADE_BORDER : C.BORDER,
          }]}
        >
          <Volume2 size={13} color={isPlaying ? C.JADE : C.TEXT3} />
        </Pressable>
      </View>
      <Text style={styles.roman}>{roman}</Text>
      <Text style={styles.english}>{english}</Text>
    </View>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  ending: ScenarioEnding;
  impact: { trust: number; respect: number; culture: number };
  total: number;
  scenarioId: string;
  /**
   * The completed run, one mark per decision. Locked by the player before
   * `finalizeScenario()` nulls the live state — see `finalizedRail` there.
   * Empty for a run whose state was already gone, in which case the section
   * is not rendered at all.
   */
  railMarks: RailMark[];
  unlockedPhrases: Phrase[];
  /** Endings found so far, this run included. */
  progress: EndingsProgress;
  /** Route label of the ending's destination; undefined for the hidden and failure endings. */
  destinationLabel: string | undefined;
  /** Choices this run made toward the destination — "what sent you here". */
  moments: ScenarioChoice[];
  /** Hints toward endings not found yet. */
  hints: EndingHint[];
  arabicForUser: (choice: ScenarioChoice) => string;
  toneHistory: { sceneId: string; tone: 'warm' | 'neutral' | 'cold' }[];
  culturalJourneyNotes: string[];
  /**
   * Share of players who reached this ending; 0 when there is no data. A value,
   * not a getter: the stats arrive after this screen mounts, and a getter read
   * once at render never saw them.
   */
  communityEndingPct: number;
  isSpeaking: boolean;
  playingPhraseId: string | null;
  onPlayEndPhrase: (phraseId: string, arabic: string) => void;
  onRestart: () => void;
  onExit: () => void;
  onShare: (title: string, arabic: string, en: string, isSecret: boolean, total: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ScenarioResultPhase({
  ending, impact, total, scenarioId,
  railMarks, unlockedPhrases, progress, destinationLabel, moments, hints, arabicForUser,
  toneHistory, culturalJourneyNotes,
  communityEndingPct: communityPct, isSpeaking, playingPhraseId,
  onPlayEndPhrase, onRestart, onExit, onShare,
}: Props) {
  const { C, G } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    column: { gap: 14, paddingTop: 8 },
    card: { borderRadius: 16, padding: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER },
    sectionLabel: { fontFamily: FONT_LATIN_BOLD, fontSize: 11, color: C.TEXT3, textTransform: 'uppercase', letterSpacing: 0.9 },
    // Ending card — its colours come from the ending, so they are applied inline.
    endingCard: { borderRadius: 24, padding: 22, borderWidth: 1.5 },
    center: { alignItems: 'center' },
    eyebrow: { fontFamily: FONT_LATIN_BOLD, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },
    endingTitle: { fontFamily: FONT_LATIN_BOLD, fontSize: 28, color: C.TEXT, marginBottom: 8, textAlign: 'center' },
    endingDesc: { fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, lineHeight: 20, textAlign: 'center', marginBottom: 16 },
    endingQuote: { width: '100%', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 14 },
    endingArabic: { fontFamily: FONT_ARABIC, fontSize: 22, textAlign: 'center', marginBottom: 4 },
    endingRoman: { fontFamily: FONT_LATIN, fontSize: 11, textAlign: 'center', fontStyle: 'italic', marginBottom: 4 },
    endingEnglish: { fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT3, textAlign: 'center' },
    // Discovery badge
    discovery: { borderRadius: 14, paddingVertical: 11, paddingHorizontal: 14, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER, flexDirection: 'row', alignItems: 'center', gap: 10 },
    flex: { flex: 1 },
    discoveryTitle: { fontFamily: FONT_LATIN_BOLD, fontSize: 14, color: C.TEXT },
    discoverySub: { fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginTop: 1 },
    // What sent you here
    momentsCard: { borderRadius: 16, padding: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER, gap: 10 },
    momentsSub: { fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginTop: 2 },
    moment: { gap: 2 },
    momentArabic: { fontFamily: FONT_ARABIC, fontSize: 18, color: C.JADE, textAlign: 'right', lineHeight: 26 },
    momentEnglish: { fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, lineHeight: 18 },
    // Hints
    hintsCard: { borderRadius: 14, padding: 14, backgroundColor: C.VIOLET_SURFACE, borderWidth: 1, borderColor: C.VIOLET_BORDER, gap: 10 },
    hintsTitle: { fontFamily: FONT_LATIN_BOLD, fontSize: 11, color: C.VIOLET2, textTransform: 'uppercase', letterSpacing: 0.9 },
    hintRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    hintDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.VIOLET2, marginTop: 6 },
    hintText: { fontFamily: FONT_LATIN, fontSize: 12, color: C.VIOLET2, flex: 1, lineHeight: 19 },
    // Relationship arc
    arcTitle: { marginBottom: 16 },
    row: { flexDirection: 'row', alignItems: 'center' },
    arcStop: { alignItems: 'center', gap: 6 },
    arcRing: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    arcDot: { width: 8, height: 8, borderRadius: 4 },
    arcLabel: { fontFamily: FONT_LATIN, fontSize: 11 },
    arcLine: { flex: 1, height: 1.5, backgroundColor: C.BORDER, marginHorizontal: 6, marginBottom: 16 },
    arcSummary: { fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginTop: 12, textAlign: 'center', lineHeight: 17 },
    // Community stat
    community: { borderRadius: 14, padding: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
    communityText: { fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: C.TEXT, flex: 1, lineHeight: 20 },
    // Rail
    railSub: { fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, lineHeight: 17 },
    // Meters
    meters: { gap: 12 },
    meterRow: { flexDirection: 'row', justifyContent: 'space-around' },
    meterLabel: { fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, textTransform: 'uppercase', letterSpacing: 0.8 },
    meterValue: { fontFamily: FONT_LATIN_BOLD, fontSize: 22, marginTop: 4 },
    // Final score
    finalScore: { borderRadius: 16, padding: 20, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER, alignItems: 'center', gap: 4 },
    finalScoreLabel: { fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, textTransform: 'uppercase', letterSpacing: 1 },
    finalScoreValue: { fontFamily: FONT_LATIN_BOLD, fontSize: 34 },
    // Cultural journey
    journeyCard: { borderRadius: 16, padding: 16, backgroundColor: C.VIOLET_SURFACE, borderWidth: 1, borderColor: C.VIOLET_BORDER },
    journeyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    journeyTitle: { fontFamily: FONT_LATIN_BOLD, fontSize: 14, color: C.VIOLET },
    list: { gap: 8 },
    journeyRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
    journeyDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.VIOLET, marginTop: 6, flexShrink: 0 },
    journeyNote: { fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, lineHeight: 19, flex: 1 },
    // Phrases unlocked
    phrasesCard: { borderRadius: 16, padding: 16, backgroundColor: C.JADE_SURFACE, borderWidth: 1, borderColor: C.JADE_BORDER },
    blockHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    phrasesTitle: { fontFamily: FONT_LATIN_BOLD, fontSize: 14, color: C.JADE },
    blockSub: { fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginBottom: 12 },
    // Pattern unlocked
    patternCard: { borderRadius: 16, padding: 16, backgroundColor: `${C.CULTURAL_GOLD}12`, borderWidth: 1, borderColor: `${C.CULTURAL_GOLD}30` },
    patternTitle: { fontFamily: FONT_LATIN_BOLD, fontSize: 14, color: C.CULTURAL_GOLD_DARK },
    patternLink: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 14,
      backgroundColor: `${C.CULTURAL_GOLD}14`,
      borderWidth: 1,
      borderColor: `${C.CULTURAL_GOLD}30`,
      marginBottom: 8,
    },
    patternLinkLead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    patternIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: `${C.CULTURAL_GOLD}22`, alignItems: 'center', justifyContent: 'center' },
    patternName: { fontFamily: FONT_ARABIC, fontSize: 16, color: C.TEXT },
    diagonal: { transform: [{ rotate: '-45deg' }] },
    // Share and actions
    share: { borderRadius: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderWidth: 1 },
    shareText: { fontFamily: FONT_LATIN_SEMI, fontSize: 14 },
    actions: { flexDirection: 'row', gap: 10 },
    retry: { flex: 1, paddingVertical: 15, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER },
    retryText: { fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: C.TEXT2 },
    homeButton: { flex: 1, borderRadius: 16, overflow: 'hidden' },
    homeFill: { paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    homeText: { fontFamily: FONT_HEADING_SEMI, fontSize: 14, color: C.BG },
  }), [C]);

  // A destination ending names its destination; the hidden and failure endings say what they are.
  const eyebrow = destinationLabel
    ? STRINGS.scenarios.destinationEyebrow(destinationLabel, ending.tier)
    : ending.secret ? STRINGS.scenarios.hiddenEndingEyebrow
    : STRINGS.scenarios.failedEndingEyebrow;
  const impactValues = [
    { label: STRINGS.scenarios.trust,   value: impact.trust,   color: C.CULTURAL_GOLD },
    { label: STRINGS.scenarios.respect, value: impact.respect, color: C.JADE2 },
    { label: STRINGS.scenarios.culture, value: impact.culture, color: C.VIOLET },
  ];

  const finalTone = toneHistory[toneHistory.length - 1]?.tone;
  const hasTurn = toneHistory.some((t, i) => i > 0 && t.tone !== toneHistory[i - 1].tone);
  const arcSummary =
    finalTone === 'warm' ? (hasTurn ? STRINGS.scenarios.arcSummary.warmTurned : STRINGS.scenarios.arcSummary.warmSteady)
    : finalTone === 'cold' ? (hasTurn ? STRINGS.scenarios.arcSummary.coldTurned : STRINGS.scenarios.arcSummary.coldSteady)
    : null;

  const unlockedPatterns = GRAMMAR_PATTERNS.filter(
    (p) => p.unlockedByScenario === scenarioId && !p.secretUnlock,
  );
  const shareAccent = ending.secret ? C.VIOLET2 : C.JADE2;

  return (
    <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 360 }}>
      <View style={styles.column}>

        {/* Ending card */}
        <View style={[styles.endingCard, { backgroundColor: `${ending.color}18`, borderColor: `${ending.color}40` }]}>
          <View style={styles.center}>
            <Text style={[styles.eyebrow, { color: ending.color }]}>{eyebrow}</Text>
            <Text style={styles.endingTitle}>{ending.title}</Text>
            <Text style={styles.endingDesc}>{ending.desc}</Text>
            <View style={[styles.endingQuote, { backgroundColor: `${ending.color}10` }]}>
              <Text style={[styles.endingArabic, { color: ending.color }]}>{`"${ending.arabic}"`}</Text>
              <Text style={[styles.endingRoman, { color: `${ending.color}85` }]}>{ending.roman}</Text>
              <Text style={styles.endingEnglish}>{ending.en}</Text>
            </View>
          </View>
        </View>

        {/* Discovery badge */}
        <View style={styles.discovery}>
          <Compass size={15} color={C.VIOLET2} />
          <View style={styles.flex}>
            <Text style={styles.discoveryTitle}>{STRINGS.scenarios.endingsSummary(progress)}</Text>
            <Text style={styles.discoverySub}>{STRINGS.scenarios.tryDifferentChoices}</Text>
          </View>
        </View>

        {/* What sent you here — destination endings only */}
        {moments.length > 0 && (
          <MotiView from={{ opacity: 0, translateY: 6 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 340, delay: 40 }}>
            <View style={styles.momentsCard}>
              <View>
                <Text style={styles.sectionLabel}>{STRINGS.scenarios.momentsTitle}</Text>
                <Text style={styles.momentsSub}>{STRINGS.scenarios.momentsSub}</Text>
              </View>
              {moments.map((m, i) => (
                <View key={`${m.id}-${i}`} style={styles.moment}>
                  <Text style={styles.momentArabic}>{arabicForUser(m)}</Text>
                  <Text style={styles.momentEnglish}>{m.text}</Text>
                </View>
              ))}
            </View>
          </MotiView>
        )}

        {/* Hints toward endings not found yet */}
        {hints.length > 0 && (
          <MotiView from={{ opacity: 0, translateY: 6 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 340, delay: 60 }}>
            <View style={styles.hintsCard}>
              <Text style={styles.hintsTitle}>{STRINGS.scenarios.hintsTitle}</Text>
              {hints.map((h) => (
                <View key={h.endingId} style={styles.hintRow}>
                  <View style={styles.hintDot} />
                  <Text style={styles.hintText}>
                    {h.hidden ? `${STRINGS.scenarios.hintHidden}: ` : ''}{h.hint}
                  </Text>
                </View>
              ))}
            </View>
          </MotiView>
        )}

        {/* Relationship arc */}
        {toneHistory.length > 0 && (
          <MotiView from={{ opacity: 0, translateY: 6 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 340, delay: 140 }}>
            <View style={styles.card}>
              <Text style={[styles.sectionLabel, styles.arcTitle]}>{STRINGS.scenarios.relationshipArcTitle}</Text>
              <View style={styles.row}>
                {toneHistory.map(({ sceneId, tone }, i) => {
                  const dotColor = tone === 'warm' ? C.JADE_ACCENT : tone === 'cold' ? C.ERROR : C.TEXT3;
                  return (
                    <React.Fragment key={sceneId}>
                      <View style={styles.arcStop}>
                        <View style={[styles.arcRing, { backgroundColor: `${dotColor}20`, borderColor: dotColor }]}>
                          <View style={[styles.arcDot, { backgroundColor: dotColor }]} />
                        </View>
                        <Text style={[styles.arcLabel, { color: dotColor }]}>{STRINGS.scenarios.toneLabel[tone]}</Text>
                      </View>
                      {i < toneHistory.length - 1 && <View style={styles.arcLine} />}
                    </React.Fragment>
                  );
                })}
              </View>
              {arcSummary && <Text style={styles.arcSummary}>{arcSummary}</Text>}
            </View>
          </MotiView>
        )}

        {/* Community stat — real Supabase data only. No data, no line: the old
            seed percentages and "almost no one finds this" fallback were invented. */}
        {communityPct > 0 && (
          <MotiView from={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'timing', duration: 700, delay: 280 }}>
            <View style={[styles.community, {
              backgroundColor: ending.secret ? `${C.VIOLET}12` : `${C.JADE_ACCENT}12`,
              borderColor: ending.secret ? `${C.VIOLET}28` : `${C.JADE_ACCENT}28`,
            }]}>
              <Users size={18} color={ending.secret ? C.VIOLET2 : C.JADE_ACCENT} />
              <Text style={styles.communityText}>
                {ending.secret
                  ? STRINGS.scenarios.communityEndingSecret(communityPct)
                  : STRINGS.scenarios.communityEnding(communityPct)}
              </Text>
            </View>
          </MotiView>
        )}

        {/* The path you took — shape above totals. The rail says WHAT you did
            and where it turned; the three numbers below say how much it added
            up to. Different questions, so both stay. */}
        {railMarks.some((m) => m.state === 'filled') && (
          <MotiView from={{ opacity: 0, translateY: 6 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 340, delay: 100 }}>
            <View
              accessible
              accessibilityRole="text"
              accessibilityLabel={STRINGS.scenarios.railSummary(
                railMarks
                  .filter((m) => m.state === 'filled')
                  .map((m) => STRINGS.scenarios.railWord[(m as Extract<RailMark, { state: 'filled' }>).outcome]),
              )}
              style={styles.card}
            >
              <Text style={styles.sectionLabel}>{STRINGS.scenarios.railTitle}</Text>
              <MarginRail marks={railMarks} orientation="horizontal" />
              <Text style={styles.railSub}>{STRINGS.scenarios.railSub}</Text>
            </View>
          </MotiView>
        )}

        {/* Meter summary */}
        <View style={[styles.card, styles.meters]}>
          <View style={styles.meterRow}>
            {impactValues.map(({ label, value, color }) => (
              <View key={label} style={styles.center}>
                <Text style={styles.meterLabel}>{label}</Text>
                <Text style={[styles.meterValue, { color: value !== 0 ? color : C.TEXT3 }]}>
                  {value > 0 ? `+${value}` : value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Final score */}
        <View style={styles.finalScore} accessible accessibilityRole="text" accessibilityLabel={STRINGS.scenarios.finalScoreA11y(total)}>
          <Text style={styles.finalScoreLabel}>{STRINGS.scenarios.finalScore}</Text>
          <Text style={[styles.finalScoreValue, { color: ending.color }]}>{total}</Text>
        </View>

        {/* Cultural journey */}
        {culturalJourneyNotes.length > 0 && (
          <MotiView from={{ opacity: 0, translateY: 6 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300, delay: 200 }}>
            <View style={styles.journeyCard}>
              <View style={styles.journeyHeader}>
                <Companion size={32} />
                <Text style={styles.journeyTitle}>{STRINGS.scenarios.culturalJourneyTitle}</Text>
              </View>
              <View style={styles.list}>
                {culturalJourneyNotes.map((note, i) => (
                  <View key={i} style={styles.journeyRow}>
                    <View style={styles.journeyDot} />
                    <Text style={styles.journeyNote}>{note}</Text>
                  </View>
                ))}
              </View>
            </View>
          </MotiView>
        )}

        {/* Phrases unlocked */}
        {unlockedPhrases.length > 0 && (
          <MotiView from={{ opacity: 0, translateY: 6 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300, delay: 380 }}>
            <View style={styles.phrasesCard}>
              <View style={styles.blockHeader}>
                <BookOpen size={14} color={C.JADE2} />
                <Text style={styles.phrasesTitle}>{STRINGS.scenarios.phrasesUnlocked(unlockedPhrases.length)}</Text>
              </View>
              <Text style={styles.blockSub}>{STRINGS.scenarios.phrasesUnlockedSub}</Text>
              <View style={styles.list}>
                {unlockedPhrases.map((p) => (
                  <PhraseCard
                    key={p.id}
                    arabic={p.arabic}
                    roman={p.roman}
                    english={p.english}
                    onSpeak={() => onPlayEndPhrase(p.id, p.arabic)}
                    isPlaying={playingPhraseId === p.id && isSpeaking}
                  />
                ))}
              </View>
            </View>
          </MotiView>
        )}

        {/* Pattern unlocked */}
        {unlockedPatterns.length > 0 && (
          <MotiView from={{ opacity: 0, translateY: 6 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300, delay: 420 }}>
            <View style={styles.patternCard}>
              <View style={styles.blockHeader}>
                <Sparkles size={14} color={C.CULTURAL_GOLD_DARK} />
                <Text style={styles.patternTitle}>{STRINGS.scenarios.patternUnlockedTitle}</Text>
              </View>
              <Text style={styles.blockSub}>{STRINGS.scenarios.patternUnlockedSub}</Text>
              {unlockedPatterns.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => router.push(`/sentence-builder?pattern=${p.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`${p.title} — ${STRINGS.sentenceBuilder.title}`}
                  style={styles.patternLink}
                >
                  <View style={styles.patternLinkLead}>
                    <View style={styles.patternIcon}>
                      <Blocks size={15} color={C.CULTURAL_GOLD_DARK} />
                    </View>
                    <Text style={styles.patternName}>{p.title}</Text>
                  </View>
                  <ArrowRight size={14} color={C.CULTURAL_GOLD_DARK} style={styles.diagonal} />
                </Pressable>
              ))}
            </View>
          </MotiView>
        )}

        {/* Share result */}
        <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300, delay: 460 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={ending.secret ? STRINGS.scenarios.shareHiddenEnding : STRINGS.scenarios.shareResult}
            onPress={() => onShare(ending.title, ending.arabic, ending.en, !!ending.secret, total)}
            style={[styles.share, {
              backgroundColor: ending.secret ? `${C.VIOLET}18` : `${C.JADE}14`,
              borderColor: ending.secret ? `${C.VIOLET}35` : `${C.JADE}30`,
            }]}
          >
            <ArrowRight size={14} color={shareAccent} style={styles.diagonal} />
            <Text style={[styles.shareText, { color: shareAccent }]}>
              {ending.secret ? STRINGS.scenarios.shareHiddenEnding : STRINGS.scenarios.shareResult}
            </Text>
          </Pressable>
        </MotiView>

        {/* Action buttons */}
        <View style={styles.actions}>
          <Pressable onPress={onRestart} accessibilityRole="button" style={styles.retry}>
            <RotateCcw size={14} color={C.TEXT2} />
            <Text style={styles.retryText}>{STRINGS.scenarios.retry}</Text>
          </Pressable>
          <Pressable onPress={onExit} accessibilityRole="button" style={styles.homeButton}>
            <LinearGradient colors={[...G.GOLD_STOPS]} start={ANGLE_135.start} end={ANGLE_135.end} style={styles.homeFill}>
              <Home size={14} color={C.BG} />
              <Text style={styles.homeText}>{STRINGS.scenarios.home}</Text>
            </LinearGradient>
          </Pressable>
        </View>

      </View>
    </MotiView>
  );
}
