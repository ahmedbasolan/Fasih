import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft, Blocks, Check, ChevronRight, Lock, RotateCcw,
  Sparkles, Trophy, Volume2, X,
} from '../components/icons';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { EmptyState } from '../components/ui/EmptyState';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { GeoPattern } from '../components/design/GeoPattern';
import { ANGLE_135 } from '../components/design/gradients';
import {
  FONT_ARABIC_BLACK, FONT_HEADING_SEMI,
  FONT_LATIN, FONT_LATIN_SEMI,
} from '../components/design/tokens';
import { useTheme } from '../hooks/useTheme';
import { useArabicTTS } from '../hooks/useArabicTTS';
import { haptic } from '../lib/haptics';
import { STRINGS } from '../constants/strings';
import { GRAMMAR_PATTERNS, resolveReferencedPhrase } from '../constants/grammar';
import { PHRASES } from '../constants/phrases';
import { useAppStore } from '../store/useAppStore';
import {
  buildSentence, canonicalForms, getAvailablePatterns, validateBuild,
} from '../engine/sentenceBuilder';
import { splitBilingualTitle } from '../engine/text';
import type { GrammarPattern } from '../types';

type Step = 'list' | 'notice' | 'swap' | 'build';
type BuildStatus = 'idle' | 'correct' | 'wrong';

interface Props {
  initialPatternId?: string | null;
  onExit: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Distractors ──────────────────────────────────────────────────────────────
// Same-category unlocked words that could NOT form a valid sentence — they make
// a "wrong" build truly wrong (e.g. "أنا قهوة" for the ana-adj pattern).
function pickDistractors(pattern: GrammarPattern, targetTokens: string[]): string[] {
  const catSet = new Set(
    pattern.slots.flatMap((s) =>
      s.options.flatMap((id) => {
        const p = PHRASES.find((ph) => ph.id === id);
        return p ? [p.category] : [];
      }),
    ),
  );
  const canonical = new Set(canonicalForms(pattern).flatMap((f) => f.split(' ')));
  const target = new Set(targetTokens);
  const out: string[] = [];

  for (const p of PHRASES) {
    if (!catSet.has(p.category)) continue;
    if (p.arabic.includes(' ')) continue;
    if (target.has(p.arabic) || canonical.has(p.arabic) || out.includes(p.arabic)) continue;
    out.push(p.arabic);
    if (out.length >= 2) break;
  }
  return out;
}

export function SentenceBuilder({ initialPatternId, onExit }: Props) {
  const { C, G } = useTheme();
  const insets = useSafeAreaInsets();
  const { speak } = useArabicTTS();

  const user = useAppStore((s) => s.user);
  const unlockedPhraseIds = useAppStore((s) => s.unlockedPhraseIds);
  const completedScenarios = useAppStore((s) => s.completedScenarios);
  const secretEndingsEarned = useAppStore((s) => s.secretEndingsEarned);
  const patternProgress = useAppStore((s) => s.patternProgress);
  const recordPatternBuild = useAppStore((s) => s.recordPatternBuild);
  const recordPhraseReview = useAppStore((s) => s.recordPhraseReview);
  const recordPhraseRating = useAppStore((s) => s.recordPhraseRating);

  const [step, setStep] = useState<Step>('list');
  const [patternId, setPatternId] = useState<string | null>(null);
  const [slotChoices, setSlotChoices] = useState<Record<string, string>>({});
  const [placedTiles, setPlacedTiles] = useState<{ id: string; word: string }[]>([]);
  const [bank, setBank] = useState<{ id: string; word: string }[]>([]);
  const [buildStatus, setBuildStatus] = useState<BuildStatus>('idle');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [showMastery, setShowMastery] = useState(false);

  const available = useMemo(
    () => getAvailablePatterns(unlockedPhraseIds, completedScenarios, secretEndingsEarned),
    [unlockedPhraseIds, completedScenarios, secretEndingsEarned],
  );

  const pattern = useMemo(
    () => GRAMMAR_PATTERNS.find((p) => p.id === patternId) ?? null,
    [patternId],
  );

  // Deep link: jump straight into a pattern when it's available.
  useEffect(() => {
    if (!initialPatternId) return;
    if (available.some((p) => p.id === initialPatternId)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPatternId(initialPatternId);
      setStep('notice');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPatternId]);

  const gender = user?.gender === 'female' ? 'female' : 'male';
  const patternTitle = useMemo(
    () => (pattern && gender === 'female' && pattern.titleFeminine ? pattern.titleFeminine : pattern?.title ?? ''),
    [pattern, gender],
  );
  const builds = pattern ? patternProgress[pattern.id]?.correctBuilds ?? 0 : 0;

  const play = useCallback((arabic: string, id?: string) => {
    setPlayingId(id ?? null);
    speak(arabic);
  }, [speak]);

  const handlePick = useCallback((p: GrammarPattern) => {
    haptic.light();
    setPatternId(p.id);
    setSlotChoices({});
    setPlacedTiles([]);
    setBank([]);
    setBuildStatus('idle');
    setShowMastery(false);
    setStep('notice');
  }, []);

  const handleSwapToBuild = useCallback(() => {
    haptic.medium();
    setStep('build');
    setBuildStatus('idle');
  }, []);

  // Swap step: tap an option tile to fill that slot. Tapping a different option
  // while one is chosen replaces it (the chosen tile itself toggles clear).
  const handleOptionTap = useCallback((slotId: string, phraseId: string) => {
    setSlotChoices((prev) => {
      if (prev[slotId] === phraseId) return prev;
      return { ...prev, [slotId]: phraseId };
    });
  }, []);

  const handleOptionClear = useCallback((slotId: string) => {
    setSlotChoices((prev) => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
  }, []);

  // Build step: assemble the bank when entering.
  const targetSentence = useMemo(() => {
    if (!pattern) return null;
    return buildSentence(pattern, slotChoices, gender);
  }, [pattern, slotChoices, gender]);

  const targetTokens = useMemo(
    () => (targetSentence?.valid ? targetSentence.arabic.split(' ').filter((w) => w.trim().length > 0) : []),
    [targetSentence],
  );

  const startBuild = useCallback(() => {
    if (targetTokens.length === 0) return;
    const distractors = pickDistractors(pattern!, targetTokens);
    const words = [...targetTokens, ...distractors].map((w, i) => ({ id: `w-${i}-${w}`, word: w }));
    setBank(shuffle(words));
    setPlacedTiles([]);
    setBuildStatus('idle');
    setShowMastery(false);
    handleSwapToBuild();
  }, [targetTokens, pattern, handleSwapToBuild]);

  const handleTileTap = useCallback((id: string) => {
    if (buildStatus === 'correct') return;
    const inBank = bank.find((t) => t.id === id);
    if (inBank) {
      haptic.light();
      setBank((prev) => prev.filter((t) => t.id !== id));
      setPlacedTiles((prev) => [...prev, inBank]);
      return;
    }
    const inPlaced = placedTiles.find((t) => t.id === id);
    if (inPlaced) {
      haptic.light();
      setPlacedTiles((prev) => prev.filter((t) => t.id !== id));
      setBank((prev) => [...prev, inPlaced]);
    }
  }, [bank, placedTiles, buildStatus]);

  const handleCheck = useCallback(() => {
    if (!pattern) return;
    const words = placedTiles.map((t) => t.word);
    const result = validateBuild(pattern, words);
    if (result.valid) {
      haptic.success();
      setBuildStatus('correct');
      if (targetSentence?.valid) play(targetSentence.arabic);
      const newBuilds = builds + 1;
      recordPatternBuild(pattern.id, true);
      // Feed SRS for every component phrase: the chosen slot phrases + examples.
      const componentIds = new Set<string>([
        ...Object.values(slotChoices),
        ...pattern.examples.map((e) => e.phraseId),
      ]);
      componentIds.forEach((id) => {
        recordPhraseReview(id, true);
        recordPhraseRating(id, 'knew');
      });
      if (newBuilds >= 3) setShowMastery(true);
    } else {
      haptic.error();
      setBuildStatus('wrong');
    }
  }, [pattern, placedTiles, targetSentence, builds, slotChoices, play, recordPatternBuild, recordPhraseReview, recordPhraseRating]);

  const handleRetry = useCallback(() => {
    if (!pattern || targetTokens.length === 0) return;
    const distractors = pickDistractors(pattern, targetTokens);
    const words = [...targetTokens, ...distractors].map((w, i) => ({ id: `w-${i}-${w}`, word: w }));
    setBank(shuffle(words));
    setPlacedTiles([]);
    setBuildStatus('idle');
    haptic.light();
  }, [pattern, targetTokens]);

  const handleNextPattern = useCallback(() => {
    haptic.light();
    setPatternId(null);
    setSlotChoices({});
    setStep('list');
  }, []);

  // ─── Fixed template tokens (the "shared" part revealed in examples) ────────
  // Whole-phrase patterns (template = ["{phrase}"]) have no fixed tokens — fall
  // back to the title's leading Arabic words (e.g. "ما" from "ما ___") so the
  // anchor word still lights up in the examples.
  const sharedTokens = useMemo(() => {
    if (!pattern) return [] as string[];
    const fixed = pattern.template.arabic.filter((t) => !t.startsWith('{'));
    if (fixed.length > 0) return fixed;
    const titleArabic = splitBilingualTitle(pattern.title).arabic;
    return titleArabic
      .split(/[\s/]+/)
      .filter((t) => t.length > 0 && t !== '___' && /[\u0600-\u06FF]/.test(t));
  }, [pattern]);

  const styles = useMemo(() => ({
    screen: { flex: 1, backgroundColor: C.BG },
    hero: {
      paddingTop: insets.top + 16,
      paddingBottom: 20,
      paddingHorizontal: 20,
      overflow: 'hidden' as const,
    },
    heroRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      marginBottom: 18,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: 'rgba(255,255,255,0.16)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.22)',
    },
    heroArabic: {
      fontFamily: FONT_ARABIC_BLACK,
      fontSize: 30,
      color: C.WHITE,
      textAlign: 'right' as const,
      writingDirection: 'rtl' as const,
      marginBottom: 2,
    },
    heroSub: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 12,
      color: 'rgba(255,255,255,0.85)',
      writingDirection: 'ltr' as const,
      marginTop: 4,
    },
    stepRow: {
      flexDirection: 'row' as const,
      gap: 8,
      marginTop: 18,
    },
    stepPill: {
      flex: 1,
      borderRadius: 14,
      paddingVertical: 10,
      alignItems: 'center' as const,
      borderWidth: 1,
    },
    stepPillArabic: {
      fontFamily: FONT_ARABIC_BLACK,
      fontSize: 15,
      marginBottom: 1,
    },
    stepPillLatin: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 9,
      letterSpacing: 0.5,
      textTransform: 'uppercase' as const,
    },
    content: { flex: 1 },
    scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 },
    // Notice
    patternCard: {
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      marginBottom: 14,
    },
    patternCardArabic: { fontFamily: FONT_ARABIC_BLACK, fontSize: 26, marginBottom: 6, textAlign: 'center' as const, writingDirection: 'rtl' as const },
    patternCardSub: {
      fontFamily: FONT_LATIN,
      fontSize: 12,
      textAlign: 'center' as const,
      lineHeight: 18,
    },
    noteCard: {
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row' as const,
      gap: 10,
      marginBottom: 18,
      borderWidth: 1,
    },
    noteTitle: { fontFamily: FONT_HEADING_SEMI, fontSize: 11, marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: 0.6 },
    noteText: { fontFamily: FONT_LATIN, fontSize: 13, lineHeight: 20 },
    sectionLabel: {
      fontFamily: FONT_HEADING_SEMI,
      fontSize: 12,
      marginBottom: 10,
      letterSpacing: 0.4,
    },
    exampleCard: {
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
    },
    exampleRow: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      direction: 'rtl' as const,
      justifyContent: 'flex-end' as const,
      gap: 4,
      marginBottom: 6,
    },
    exampleToken: {
      fontFamily: FONT_ARABIC_BLACK,
      fontSize: 20,
      color: C.TEXT,
    },
    exampleTokenShared: {
      fontFamily: FONT_ARABIC_BLACK,
      fontSize: 20,
      color: C.CULTURAL_GOLD_DARK,
    },
    exampleRoman: { fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, fontStyle: 'italic' as const, textAlign: 'right' as const, marginBottom: 2 },
    exampleEnglish: { fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, marginBottom: 8 },
    playRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
    },
    playChip: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
    },
    playChipText: { fontFamily: FONT_HEADING_SEMI, fontSize: 11 },
    // Swap
    frameCard: {
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1.5,
      borderStyle: 'dashed' as const,
    },
    frameRow: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      direction: 'rtl' as const,
      justifyContent: 'center' as const,
      gap: 8,
    },
    frameToken: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1.5,
    },
    frameTokenText: { fontFamily: FONT_ARABIC_BLACK, fontSize: 20 },
    frameSlot: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1.5,
      borderStyle: 'dashed' as const,
    },
    frameSlotText: { fontFamily: FONT_ARABIC_BLACK, fontSize: 20 },
    optionsLabel: { fontFamily: FONT_HEADING_SEMI, fontSize: 12, marginBottom: 10 },
    optionsRow: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      direction: 'rtl' as const,
      justifyContent: 'center' as const,
      gap: 10,
    },
    optionTile: {
      paddingHorizontal: 22,
      paddingVertical: 14,
      borderRadius: 16,
      borderWidth: 1.5,
    },
    optionTileText: { fontFamily: FONT_ARABIC_BLACK, fontSize: 22 },
    previewCard: {
      borderRadius: 16,
      padding: 16,
      marginTop: 16,
      borderWidth: 1,
    },
    previewArabic: {
      fontFamily: FONT_ARABIC_BLACK,
      fontSize: 24,
      textAlign: 'center' as const,
      marginBottom: 4,
    },
    previewRoman: {
      fontFamily: FONT_LATIN,
      fontSize: 12,
      color: C.TEXT3,
      textAlign: 'center' as const,
      fontStyle: 'italic' as const,
      marginBottom: 2,
    },
    previewEnglish: {
      fontFamily: FONT_LATIN,
      fontSize: 13,
      color: C.TEXT2,
      textAlign: 'center' as const,
    },
    previewPlay: {
      position: 'absolute' as const,
      right: 12,
      top: 12,
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    // Build
    goalCard: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      alignItems: 'center' as const,
    },
    goalArabic: {
      fontFamily: FONT_ARABIC_BLACK,
      fontSize: 24,
      color: C.TEXT,
      marginBottom: 4,
      opacity: 0.55,
    },
    goalHint: { fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, textAlign: 'center' as const, lineHeight: 16 },
    answerArea: {
      minHeight: 110,
      borderRadius: 20,
      borderWidth: 2,
      borderStyle: 'dashed' as const,
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      alignItems: 'center' as const,
      alignContent: 'center' as const,
      justifyContent: 'center' as const,
      padding: 14,
      gap: 10,
      marginBottom: 16,
      direction: 'rtl' as const,
    },
    bankArea: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      justifyContent: 'center' as const,
      gap: 10,
      marginBottom: 20,
      direction: 'rtl' as const,
    },
    tile: {
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 16,
      borderWidth: 1.5,
    },
    tileText: { fontFamily: FONT_ARABIC_BLACK, fontSize: 21 },
    resultCard: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 10,
      borderWidth: 1,
    },
    resultText: { fontFamily: FONT_HEADING_SEMI, fontSize: 15 },
    masteryBadge: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
      alignSelf: 'center' as const,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      marginBottom: 14,
    },
    masteryText: { fontFamily: FONT_HEADING_SEMI, fontSize: 12 },
    footer: { paddingHorizontal: 20, paddingBottom: insets.bottom + 12 },
    // List
    patternRow: {
      borderRadius: 18,
      padding: 18,
      marginBottom: 12,
      borderWidth: 1,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 14,
    },
    patternRowLocked: { opacity: 0.55 },
    patternRowText: { flex: 1 },
    patternRowArabic: { fontFamily: FONT_ARABIC_BLACK, fontSize: 19, marginBottom: 3, color: C.TEXT, writingDirection: 'rtl' as const },
    // The gloss declares its own direction so it cannot inherit RTL from the
    // Arabic half above it — the two runs are what the bidi fix is.
    patternRowEnglish: { fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, writingDirection: 'ltr' as const },
    patternRowHint: { fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginTop: 6, lineHeight: 16 },
    masteryDots: { flexDirection: 'row' as const, gap: 4, marginTop: 8 },
    masteryDot: { width: 8, height: 8, borderRadius: 4 },
    skillChip: {
      alignSelf: 'flex-start' as const,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      marginTop: 8,
    },
    skillChipText: { fontFamily: FONT_HEADING_SEMI, fontSize: 10, textTransform: 'capitalize' as const },
  }), [C, insets]);

  // ─── LIST STEP ──────────────────────────────────────────────────────────────
  if (step === 'list') {
    const lockedPatterns = GRAMMAR_PATTERNS.filter((p) => !available.some((a) => a.id === p.id));
    return (
      <View style={styles.screen}>
        {/* The subtitle used to sit in the same row as the back button, in a
            right-aligned block, and ran underneath it. ScreenHeader gives back,
            title and subtitle their own rows, so that arrangement is not
            expressible rather than merely corrected.

            The three builder-step heroes below keep their gradient: they put a
            SHORT step label beside the back button and stack their content
            underneath, so they never collided, and they carry a step indicator
            ScreenHeader does not model. Converting them is a restyle of the
            builder flow, not this fix.

            The Arabic wordmark كوّن is dropped rather than moved — GhostLetters
            already carries this screen's Arabic identity, and ScreenHeader's
            title slot is Latin-styled. */}
        <ScreenHeader
          onBack={onExit}
          title={STRINGS.sentenceBuilder.title}
          subtitle={STRINGS.sentenceBuilder.subtitle}
        />

        <ScrollView style={styles.content} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.sectionLabel, { color: C.TEXT2 }]}>{STRINGS.sentenceBuilder.patternsTitle}</Text>
          {available.map((p, idx) => {
            const mastered = (patternProgress[p.id]?.correctBuilds ?? 0) >= 3;
            return (
              <MotiView
                key={p.id}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 340, delay: 60 + idx * 50 }}
              >
                <Pressable
                  onPress={() => handlePick(p)}
                  accessibilityRole="button"
                  accessibilityLabel={p.title}
                  style={[styles.patternRow, { backgroundColor: C.CARD_BG, borderColor: C.BORDER }]}
                >
                  <View style={styles.patternRowText}>
                    <Text style={styles.patternRowArabic}>{splitBilingualTitle(p.title).arabic}</Text>
                    <Text style={styles.patternRowEnglish}>{splitBilingualTitle(p.title).english}</Text>
                    <View style={[styles.skillChip, { backgroundColor: `${C.JADE_ACCENT}18` }]}>
                      <Text style={[styles.skillChipText, { color: C.PRIMARY }]}>{STRINGS.sentenceBuilder.skillLabel}: {p.softSkill}</Text>
                    </View>
                    <View style={styles.masteryDots}>
                      {[0, 1, 2].map((i) => (
                        <View
                          key={i}
                          style={[styles.masteryDot, {
                            backgroundColor: (patternProgress[p.id]?.correctBuilds ?? 0) > i ? C.JADE_ACCENT : C.BORDER2,
                          }]}
                        />
                      ))}
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: C.TEXT3, marginLeft: 6 }}>
                        {STRINGS.sentenceBuilder.progress(patternProgress[p.id]?.correctBuilds ?? 0)}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'center', gap: 6 }}>
                    <Blocks size={20} strokeWidth={1.5} color={mastered ? C.CULTURAL_GOLD : C.PRIMARY} />
                    {mastered && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Trophy size={12} strokeWidth={1.5} color={C.CULTURAL_GOLD} />
                        <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 9, color: C.CULTURAL_GOLD }}>{STRINGS.sentenceBuilder.mastered}</Text>
                      </View>
                    )}
                    <ChevronRight size={16} strokeWidth={1.5} color={C.TEXT3} />
                  </View>
                </Pressable>
              </MotiView>
            );
          })}

          {lockedPatterns.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { color: C.TEXT3, marginTop: 8 }]}>{STRINGS.sentenceBuilder.lockedTitle}</Text>
              {lockedPatterns.map((p) => (
                <View key={p.id} style={[styles.patternRow, styles.patternRowLocked, { backgroundColor: C.SURFACE, borderColor: C.BORDER }]}>
                  <View style={styles.patternRowText}>
                    <Text style={[styles.patternRowArabic, { color: C.TEXT3 }]}>{splitBilingualTitle(p.title).arabic}</Text>
                    <Text style={[styles.patternRowEnglish, { color: C.TEXT3 }]}>{splitBilingualTitle(p.title).english}</Text>
                    <Text style={styles.patternRowHint}>
                      {p.secretUnlock ? STRINGS.sentenceBuilder.secretPatternHint : STRINGS.sentenceBuilder.lockedPatternHint}
                    </Text>
                  </View>
                  <Lock size={18} strokeWidth={1.5} color={C.TEXT3} />
                </View>
              ))}
            </>
          )}

          {available.length === 0 && (
            <EmptyState
              arabic="ما في"
              title={STRINGS.sentenceBuilder.emptyTitle}
              subtitle={STRINGS.sentenceBuilder.emptySubtitle}
            />
          )}
        </ScrollView>
      </View>
    );
  }

  if (!pattern) return null;

  // ─── NOTICE STEP ────────────────────────────────────────────────────────────
  if (step === 'notice') {
    return (
      <View style={styles.screen}>
        <LinearGradient colors={[...G.GOLD_STOPS]} start={ANGLE_135.start} end={ANGLE_135.end} style={styles.hero}>
          <GeoPattern opacity={0.06} color="#FFFFFF" size={44} />
          <View style={styles.heroRow}>
            <Pressable onPress={onExit} accessibilityRole="button" accessibilityLabel={STRINGS.common.back} style={styles.backBtn}>
              <ArrowLeft size={18} strokeWidth={1.5} color={C.WHITE} />
            </Pressable>
            <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
              {STRINGS.sentenceBuilder.noticeStep}
            </Text>
          </View>
          <Text style={styles.heroArabic}>{splitBilingualTitle(patternTitle).arabic}</Text>
          <Text style={styles.heroSub}>{splitBilingualTitle(patternTitle).english}</Text>

          <View style={styles.stepRow}>
            {(['notice', 'swap', 'build'] as Step[]).map((s) => {
              const active = s === step;
              const isDone = false;
              return (
                <View
                  key={s}
                  style={[styles.stepPill, {
                    backgroundColor: active ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)',
                    borderColor: active ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.14)',
                  }]}
                >
<Text style={[styles.stepPillArabic, {
                    color: active || isDone ? C.WHITE : 'rgba(255,255,255,0.55)',
                  }]}>
                    {s === 'notice' ? STRINGS.sentenceBuilder.noticeStepArabic : s === 'swap' ? STRINGS.sentenceBuilder.swapStepArabic : STRINGS.sentenceBuilder.buildStepArabic}
                  </Text>
                  <Text style={[styles.stepPillLatin, { color: active ? C.WHITE : 'rgba(255,255,255,0.5)' }]}>
                    {s === 'notice' ? STRINGS.sentenceBuilder.noticeStep : s === 'swap' ? STRINGS.sentenceBuilder.swapStep : STRINGS.sentenceBuilder.buildStep}
                  </Text>
                </View>
              );
            })}
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 380 }}>
            <View style={[styles.patternCard, { backgroundColor: C.CARD_BG, borderColor: C.BORDER }]}>
              <Text style={[styles.patternCardArabic, { color: C.TEXT }]}>{splitBilingualTitle(patternTitle).arabic}</Text>
              <Text style={styles.patternCardSub}>{STRINGS.sentenceBuilder.noticeTitle}</Text>
            </View>

            <View style={[styles.noteCard, { backgroundColor: `${C.CULTURAL_GOLD}14`, borderColor: `${C.CULTURAL_GOLD}30` }]}>
              <Sparkles size={16} strokeWidth={1.5} color={C.CULTURAL_GOLD_DARK} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.noteTitle, { color: C.CULTURAL_GOLD_DARK }]}>{STRINGS.sentenceBuilder.whyItMatters}</Text>
                <Text style={[styles.noteText, { color: C.TEXT2 }]}>{pattern.goodImpressionNote}</Text>
              </View>
            </View>

            <Text style={[styles.sectionLabel, { color: C.TEXT2 }]}>{STRINGS.sentenceBuilder.exampleLabel}</Text>
            {pattern.examples.map((ex, idx) => {
              const phrase = resolveReferencedPhrase(ex.phraseId);
              if (!phrase) return null;
              const tokens = phrase.arabic.split(' ').filter((w) => w.trim().length > 0);
              return (
                <MotiView
                  key={ex.phraseId}
                  from={{ opacity: 0, translateY: 8 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: 'timing', duration: 320, delay: 120 + idx * 80 }}
                >
                  <Pressable
                    onPress={() => play(phrase.arabic, ex.phraseId)}
                    accessibilityRole="button"
                    accessibilityLabel={`${phrase.english} — ${STRINGS.sentenceBuilder.tapToHear}`}
                    style={[styles.exampleCard, {
                      backgroundColor: C.SURFACE,
                      borderColor: playingId === ex.phraseId ? C.JADE_ACCENT : C.BORDER,
                    }]}
                  >
                    <View style={styles.exampleRow}>
                      {tokens.map((t, i) => (
                        <Text
                          key={`${t}-${i}`}
                          style={sharedTokens.includes(t) ? styles.exampleTokenShared : styles.exampleToken}
                        >
                          {t}
                        </Text>
                      ))}
                    </View>
                    <Text style={styles.exampleRoman}>{phrase.roman}</Text>
                    <Text style={styles.exampleEnglish}>{phrase.english}</Text>
                    <View style={styles.playRow}>
                      <View style={[styles.playChip, { backgroundColor: playingId === ex.phraseId ? C.JADE_DIM : C.CARD_BG, borderColor: playingId === ex.phraseId ? C.JADE_ACCENT_BORDER : C.BORDER }]}>
                        <Volume2 size={13} strokeWidth={1.5} color={playingId === ex.phraseId ? C.JADE : C.PRIMARY} />
                        <Text style={[styles.playChipText, { color: playingId === ex.phraseId ? C.JADE : C.PRIMARY }]}>
                          {playingId === ex.phraseId ? STRINGS.scenarios.playing : STRINGS.sentenceBuilder.tapToHear}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                </MotiView>
              );
            })}
          </MotiView>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton onPress={() => { haptic.medium(); setStep('swap'); }}>
            {STRINGS.sentenceBuilder.seeIt}
          </PrimaryButton>
        </View>
      </View>
    );
  }

  // ─── SWAP STEP ──────────────────────────────────────────────────────────────
  if (step === 'swap') {
    const slots = pattern.slots;
    const allFilled = slots.every((s) => slotChoices[s.id]);
    const assembled = buildSentence(pattern, slotChoices, gender);

    return (
      <View style={styles.screen}>
      <LinearGradient colors={[...G.GOLD_STOPS]} start={ANGLE_135.start} end={ANGLE_135.end} style={styles.hero}>
        <GeoPattern opacity={0.06} color="#FFFFFF" size={44} />
        <View style={styles.heroRow}>
          <Pressable onPress={onExit} accessibilityRole="button" accessibilityLabel={STRINGS.common.back} style={styles.backBtn}>
            <ArrowLeft size={18} strokeWidth={1.5} color={C.WHITE} />
          </Pressable>
          <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
            {STRINGS.sentenceBuilder.swapStep}
          </Text>
        </View>
        <Text style={styles.heroArabic}>{splitBilingualTitle(patternTitle).arabic}</Text>
        <Text style={styles.heroSub}>{STRINGS.sentenceBuilder.swapTitle}</Text>

        <View style={styles.stepRow}>
          {(['notice', 'swap', 'build'] as Step[]).map((s) => {
            const active = s === step;
            const isDone = s === 'notice';
            return (
              <View
                key={s}
                style={[styles.stepPill, {
                  backgroundColor: active ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)',
                  borderColor: active ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.14)',
                }]}
              >
                <Text style={[styles.stepPillArabic, { color: active || isDone ? C.WHITE : 'rgba(255,255,255,0.55)' }]}>
                  {s === 'notice' ? STRINGS.sentenceBuilder.noticeStepArabic : s === 'swap' ? STRINGS.sentenceBuilder.swapStepArabic : STRINGS.sentenceBuilder.buildStepArabic}
                </Text>
                <Text style={[styles.stepPillLatin, { color: active ? C.WHITE : 'rgba(255,255,255,0.5)' }]}>
                  {s === 'notice' ? STRINGS.sentenceBuilder.noticeStep : s === 'swap' ? STRINGS.sentenceBuilder.swapStep : STRINGS.sentenceBuilder.buildStep}
                </Text>
              </View>
            );
          })}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 380 }}>
          <Text style={[styles.sectionLabel, { color: C.TEXT2 }]}>{STRINGS.sentenceBuilder.swapHint}</Text>

          <View style={[styles.frameCard, { backgroundColor: C.CARD_BG, borderColor: C.BORDER }]}>
            <View style={styles.frameRow}>
              {pattern.template.arabic.map((token, i) => {
                if (token.startsWith('{')) {
                  const slot = pattern.slots.find((s) => `{${s.id}}` === token);
                  if (!slot) return null;
                  const chosen = slotChoices[slot.id];
                  const phrase = chosen ? resolveReferencedPhrase(chosen) : null;
                  return (
                    <Pressable
                      key={`slot-${i}`}
                      onPress={() => chosen && handleOptionClear(slot.id)}
                      accessibilityRole="button"
                      style={[styles.frameSlot, {
                        backgroundColor: chosen ? C.JADE_DIM : C.SURFACE,
                        borderColor: chosen ? C.JADE_ACCENT : C.BORDER2,
                      }]}
                    >
                      <Text style={[styles.frameSlotText, { color: chosen ? C.JADE : C.TEXT3 }]}>
                        {chosen ? phrase?.arabic : '___'}
                      </Text>
                    </Pressable>
                  );
                }
                return (
                  <View key={`fixed-${i}`} style={[styles.frameToken, { backgroundColor: C.SURFACE, borderColor: C.BORDER }]}>
                    <Text style={[styles.frameTokenText, { color: C.TEXT }]}>{token}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {pattern.slots.map((slot) => {
            const chosen = slotChoices[slot.id];
            const takenElsewhere = Object.entries(slotChoices)
              .filter(([id]) => id !== slot.id)
              .map(([, val]) => val);
            const options = slot.options.filter((id) => !takenElsewhere.includes(id));
            return (
              <View key={slot.id} style={{ marginBottom: 14 }}>
                <Text style={[styles.optionsLabel, { color: C.TEXT3 }]}>
                  {chosen ? STRINGS.sentenceBuilder.slotChosen(slot.label) : STRINGS.sentenceBuilder.chooseSlot(slot.label)}
                </Text>
                <View style={styles.optionsRow}>
                  {options.map((phraseId) => {
                    const phrase = resolveReferencedPhrase(phraseId);
                    if (!phrase) return null;
                    const isChosen = chosen === phraseId;
                    return (
                      <Pressable
                        key={phraseId}
                        onPress={() => (isChosen ? handleOptionClear(slot.id) : handleOptionTap(slot.id, phraseId))}
                        accessibilityRole="button"
                        accessibilityLabel={phrase.english}
                        style={[styles.optionTile, {
                          backgroundColor: isChosen ? C.JADE_DIM : C.CARD_BG,
                          borderColor: isChosen ? C.JADE_ACCENT : C.BORDER,
                        }]}
                      >
                        <Text style={[styles.optionTileText, { color: isChosen ? C.JADE : C.TEXT }]}>{phrase.arabic}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}

          {allFilled && assembled.valid && (
            <MotiView from={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 16, stiffness: 200 }}>
              <View style={[styles.previewCard, { backgroundColor: C.JADE_SURFACE, borderColor: C.JADE_BORDER }]}>
                <Pressable
                  onPress={() => play(assembled.arabic)}
                  accessibilityRole="button"
                  accessibilityLabel={STRINGS.sentenceBuilder.tapToHear}
                  style={[styles.previewPlay, { backgroundColor: C.JADE_DIM }]}
                >
                  <Volume2 size={14} strokeWidth={1.5} color={C.JADE} />
                </Pressable>
                <Text style={styles.previewArabic}>{assembled.arabic}</Text>
                <Text style={styles.previewRoman}>{assembled.roman}</Text>
                <Text style={styles.previewEnglish}>{assembled.english}</Text>
              </View>
            </MotiView>
          )}
        </MotiView>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton disabled={!allFilled} onPress={startBuild}>
          {STRINGS.sentenceBuilder.swapDone}
        </PrimaryButton>
      </View>
    </View>
  );
  }

  // ─── BUILD STEP ─────────────────────────────────────────────────────────────
  if (step === 'build') {
  return (
    <View style={styles.screen}>
      <LinearGradient colors={[...G.GOLD_STOPS]} start={ANGLE_135.start} end={ANGLE_135.end} style={styles.hero}>
        <GeoPattern opacity={0.06} color="#FFFFFF" size={44} />
        <View style={styles.heroRow}>
          <Pressable onPress={onExit} accessibilityRole="button" accessibilityLabel={STRINGS.common.back} style={styles.backBtn}>
            <ArrowLeft size={18} strokeWidth={1.5} color={C.WHITE} />
          </Pressable>
          <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
            {STRINGS.sentenceBuilder.buildStep}
          </Text>
        </View>
        <Text style={styles.heroArabic}>{splitBilingualTitle(patternTitle).arabic}</Text>
        <Text style={styles.heroSub}>{STRINGS.sentenceBuilder.buildTitle}</Text>

        <View style={styles.stepRow}>
          {(['notice', 'swap', 'build'] as Step[]).map((s) => {
            const active = s === step;
            const isDone = s === 'notice' || s === 'swap';
            return (
              <View
                key={s}
                style={[styles.stepPill, {
                  backgroundColor: active ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)',
                  borderColor: active ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.14)',
                }]}
              >
                <Text style={[styles.stepPillArabic, { color: active || isDone ? C.WHITE : 'rgba(255,255,255,0.55)' }]}>
                  {s === 'notice' ? STRINGS.sentenceBuilder.noticeStepArabic : s === 'swap' ? STRINGS.sentenceBuilder.swapStepArabic : STRINGS.sentenceBuilder.buildStepArabic}
                </Text>
                <Text style={[styles.stepPillLatin, { color: active ? C.WHITE : 'rgba(255,255,255,0.5)' }]}>
                  {s === 'notice' ? STRINGS.sentenceBuilder.noticeStep : s === 'swap' ? STRINGS.sentenceBuilder.swapStep : STRINGS.sentenceBuilder.buildStep}
                </Text>
              </View>
            );
          })}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {showMastery && (
          <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 14, stiffness: 200 }}>
            <View style={[styles.masteryBadge, { backgroundColor: `${C.CULTURAL_GOLD}16`, borderColor: `${C.CULTURAL_GOLD}38` }]}>
              <Trophy size={14} strokeWidth={1.5} color={C.CULTURAL_GOLD_DARK} />
              <Text style={[styles.masteryText, { color: C.CULTURAL_GOLD_DARK }]}>
                {STRINGS.sentenceBuilder.masteryToast(3)}
              </Text>
            </View>
          </MotiView>
        )}

        <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 380 }}>
          {targetSentence?.valid && (
            <View style={[styles.goalCard, { backgroundColor: C.SURFACE, borderColor: C.BORDER }]}>
              <Text style={styles.goalArabic}>{targetSentence.arabic}</Text>
              <Text style={styles.goalHint}>{STRINGS.sentenceBuilder.buildHint}</Text>
            </View>
          )}

          <View style={[styles.answerArea, { backgroundColor: C.SURFACE2, borderColor: buildStatus === 'correct' ? C.JADE_ACCENT : C.BORDER2 }]}>
            {placedTiles.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => handleTileTap(t.id)}
                accessibilityRole="button"
                style={[styles.tile, { backgroundColor: buildStatus === 'correct' ? C.JADE_DIM : C.JADE_ACCENT_SURFACE, borderColor: C.JADE_ACCENT }]}
              >
                <Text style={[styles.tileText, { color: C.JADE }]}>{t.word}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.bankArea}>
            {bank.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => handleTileTap(t.id)}
                accessibilityRole="button"
                style={[styles.tile, { backgroundColor: C.CARD_BG, borderColor: C.BORDER }]}
              >
                <Text style={[styles.tileText, { color: C.TEXT2 }]}>{t.word}</Text>
              </Pressable>
            ))}
          </View>

          {buildStatus === 'correct' && (
            <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300 }}>
              <View style={[styles.resultCard, { backgroundColor: C.JADE_SURFACE, borderColor: C.JADE_BORDER }]}>
                <Check size={18} strokeWidth={1.5} color={C.JADE2} />
                <Text style={[styles.resultText, { color: C.JADE2 }]}>
                  {STRINGS.sentenceBuilder.correct} — {STRINGS.sentenceBuilder.buildYourOwn}
                </Text>
              </View>
            </MotiView>
          )}

          {buildStatus === 'wrong' && (
            <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300 }}>
              <View style={[styles.resultCard, { backgroundColor: C.ERROR_SURFACE, borderColor: C.ERROR_BORDER }]}>
                <X size={18} strokeWidth={1.5} color={C.ERROR} />
                <Text style={[styles.resultText, { color: C.ERROR }]}>{STRINGS.sentenceBuilder.incorrect}</Text>
              </View>
            </MotiView>
          )}
        </MotiView>
      </ScrollView>

      <View style={styles.footer}>
        {buildStatus === 'idle' && (
          <PrimaryButton disabled={placedTiles.length === 0} onPress={handleCheck}>
            {STRINGS.sentenceBuilder.buildCheck}
          </PrimaryButton>
        )}
        {buildStatus === 'wrong' && (
          <PrimaryButton variant="jade" onPress={handleRetry}>
            {STRINGS.sentenceBuilder.buildRetry}
          </PrimaryButton>
        )}
        {buildStatus === 'correct' && (
          <View style={{ gap: 10 }}>
            <PrimaryButton onPress={handleNextPattern}>
              {STRINGS.sentenceBuilder.buildNext}
            </PrimaryButton>
            <Pressable
              onPress={onExit}
              accessibilityRole="button"
              style={{
                paddingVertical: 14,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: C.SURFACE,
                borderWidth: 1,
                borderColor: C.BORDER,
              }}
            >
              <RotateCcw size={14} strokeWidth={1.5} color={C.TEXT2} />
              <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 14, color: C.TEXT2 }}>
                {STRINGS.sentenceBuilder.buildDone}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
  }
}

