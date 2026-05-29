import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { X, Check, ArrowRight, RotateCcw, Trophy, BookOpen, Volume2, ArrowLeftRight, Layers } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { FONT_ARABIC_BLACK, FONT_LATIN, FONT_LATIN_BOLD, FONT_LATIN_SEMI, FONT_HEADING_SEMI, FONT_HEADING_EXTRA } from '../components/design/tokens';
import { ANGLE_135 } from '../components/design/gradients';
import { useTheme } from '../hooks/useTheme';
import { PHRASES } from '../constants/phrases';
import { useAppStore } from '../store/useAppStore';
import { useArabicTTS } from '../hooks/useArabicTTS';
import { STRINGS } from '../constants/strings';
import { PhraseBuilder } from '../components/features/PhraseBuilder';
import { GhostLetters } from '../components/ui';
import { EmptyState } from '../components/ui/EmptyState';
import type { Phrase } from '../types';


type PracticeMode = 'menu' | 'flashcard' | 'quiz' | 'reverse-quiz' | 'phrase-builder' | 'result';

interface Props {
  onExit: () => void;
  onPhraseReview?: (phraseId: string, correct: boolean) => void;
  onPhraseRating?: (phraseId: string, rating: 'new' | 'learning' | 'knew') => void;
  onSessionComplete?: () => void;
}

// Shuffle utility
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Flashcard Component ──────────────────────────────────────────────────────────────────
function FlashCard({
  phrase,
  flipped,
  onFlip,
  onSpeak,
  onSpeakSlow,
  isPlaying,
  index,
}: {
  phrase: Phrase;
  flipped: boolean;
  onFlip: () => void;
  onSpeak: () => void;
  onSpeakSlow: () => void;
  isPlaying: boolean;
  index: number;
}) {
  const { C } = useTheme();
  return (
    <MotiView
      key={phrase.id}
      from={{ opacity: 0, translateX: 40 }}
      animate={{ opacity: 1, translateX: 0 }}
      exit={{ opacity: 0, translateX: -40 }}
      transition={{ type: 'timing', duration: 280 }}
    >
      <Pressable
        onPress={onFlip}
        accessibilityRole="button"
        accessibilityLabel={flipped ? 'Flip back to Arabic' : 'Tap to reveal translation'}
      >
        <View
          style={{
            borderRadius: 24,
            padding: 28,
            minHeight: 260,
            backgroundColor: flipped ? C.JADE_SURFACE : C.GOLD_SURFACE,
            borderWidth: 1.5,
            borderColor: flipped ? C.JADE_BORDER : C.GOLD_BORDER,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {!flipped ? (
            <View style={{ alignItems: 'center', gap: 16 }}>
              <Text
                style={{
                  fontFamily: FONT_ARABIC_BLACK,
                  fontSize: 36,
                  color: C.GOLD,
                  textAlign: 'center',
                  lineHeight: 52,
                }}
              >
                {phrase.arabic}
              </Text>
              <Pressable
                onPress={(e) => { e.stopPropagation?.(); onSpeak(); }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 14, backgroundColor: isPlaying ? C.JADE_SURFACE : C.SURFACE, borderWidth: 1, borderColor: isPlaying ? C.JADE_BORDER : C.BORDER }}
              >
                <Volume2 size={14} color={isPlaying ? C.JADE2 : C.TEXT3} />
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: isPlaying ? C.JADE2 : C.TEXT3 }}>{isPlaying ? STRINGS.common.playing : STRINGS.common.listen}</Text>
              </Pressable>
              <Text
                style={{
                  fontFamily: FONT_LATIN,
                  fontSize: 12,
                  color: C.TEXT3,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginTop: 8,
                }}
              >
                {STRINGS.practice.tapToReveal}
              </Text>
            </View>
          ) : (
            <View style={{ alignItems: 'center', gap: 12 }}>
              <Text
                style={{
                  fontFamily: FONT_ARABIC_BLACK,
                  fontSize: 28,
                  color: C.GOLD,
                  textAlign: 'center',
                  marginBottom: 4,
                }}
              >
                {phrase.arabic}
              </Text>
              <Text
                style={{
                  fontFamily: FONT_LATIN,
                  fontSize: 14,
                  color: `${C.GOLD}90`,
                  fontStyle: 'italic',
                }}
              >
                {phrase.roman}
              </Text>
              <View
                style={{
                  height: 1,
                  width: 60,
                  backgroundColor: C.SURFACE,
                  marginVertical: 4,
                }}
              />
              <Text
                style={{
                  fontFamily: FONT_LATIN_BOLD,
                  fontSize: 18,
                  color: C.TEXT,
                  textAlign: 'center',
                }}
              >
                {phrase.english}
              </Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                <Pressable
                  onPress={(e) => { e.stopPropagation?.(); onSpeak(); }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 14, backgroundColor: isPlaying ? C.JADE_SURFACE : C.SURFACE, borderWidth: 1, borderColor: isPlaying ? C.JADE_BORDER : C.BORDER }}
                >
                  <Volume2 size={12} color={isPlaying ? C.JADE2 : C.TEXT3} />
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: isPlaying ? C.JADE2 : C.TEXT3 }}>{isPlaying ? STRINGS.common.playing : STRINGS.common.listen}</Text>
                </Pressable>
                <Pressable
                  onPress={(e) => { e.stopPropagation?.(); onSpeakSlow(); }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 14, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}
                >
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3 }}>{STRINGS.common.slow}</Text>
                </Pressable>
              </View>
              {phrase.culturalNote && (
                <View
                  style={{
                    marginTop: 8,
                    borderRadius: 12,
                    padding: 12,
                    backgroundColor: C.VIOLET_DIM,
                    borderWidth: 1,
                    borderColor: C.VIOLET_BORDER,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: FONT_LATIN,
                      fontSize: 11,
                      color: C.TEXT2,
                      lineHeight: 18,
                      textAlign: 'center',
                    }}
                  >
                    {phrase.culturalNote}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </Pressable>
    </MotiView>
  );
}

// ─── Quiz Option ──────────────────────────────────────────────────────────────
function QuizOption({
  text,
  state,
  onPress,
  delay,
  isArabic = false,
}: {
  text: string;
  state: 'idle' | 'correct' | 'wrong';
  onPress: () => void;
  delay: number;
  isArabic?: boolean;
}) {
  const { C } = useTheme();
  const bg =
    state === 'correct'
      ? C.JADE_SURFACE
      : state === 'wrong'
      ? C.ERROR_SURFACE
      : C.SURFACE;
  const border =
    state === 'correct'
      ? C.JADE_BORDER
      : state === 'wrong'
      ? C.ERROR_BORDER
      : C.BORDER;
  const textColor =
    state === 'correct' ? C.JADE2 : state === 'wrong' ? C.ERROR : C.TEXT2;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 220, delay }}
    >
      <Pressable
        onPress={onPress}
        disabled={state !== 'idle'}
        style={{
          borderRadius: 16,
          padding: 16,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: border,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {state === 'correct' && <Check size={16} color={C.JADE2} />}
        {state === 'wrong' && <X size={16} color={C.ERROR} />}
        <Text
          style={{
            fontFamily: isArabic ? FONT_ARABIC_BLACK : FONT_LATIN,
            fontSize: isArabic ? 18 : 14,
            color: textColor,
            flex: 1,
            textAlign: isArabic ? 'right' : 'left',
            lineHeight: isArabic ? 28 : 20,
          }}
        >
          {text}
        </Text>
      </Pressable>
    </MotiView>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function PracticeScreen({ onExit, onPhraseReview, onPhraseRating, onSessionComplete }: Props) {
  const { C, G } = useTheme();
  const insets = useSafeAreaInsets();
  const { speak, speakSlow, isSpeaking } = useArabicTTS();
  const getDueReviews = useAppStore((s) => s.getDueReviews);
  const [mode, setMode] = useState<PracticeMode>('menu');
  const [deck, setDeck] = useState<Phrase[]>([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0, skipped: 0 });
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);

  const DECK_SIZE = 8;

  const startFlashcards = useCallback(() => {
    // SRS-aware deck: due cards first, filled up with fresh phrases.
    // This ensures the spaced-repetition schedule is actually honoured.
    const dueIds = new Set(getDueReviews().map(r => r.phraseId));
    const due = shuffle(PHRASES.filter(p => dueIds.has(p.id)));
    const rest = shuffle(PHRASES.filter(p => !dueIds.has(p.id)));
    const pool = [...due, ...rest].slice(0, DECK_SIZE);
    setDeck(pool);
    setCurrent(0);
    setFlipped(false);
    setScore({ correct: 0, wrong: 0, skipped: 0 });
    setMode('flashcard');
  }, [getDueReviews]);

  const startQuiz = useCallback(() => {
    const shuffled = shuffle(PHRASES).slice(0, DECK_SIZE);
    setDeck(shuffled);
    setCurrent(0);
    setScore({ correct: 0, wrong: 0, skipped: 0 });
    setQuizAnswer(null);
    generateQuizOptions(shuffled, 0);
    setMode('quiz');
  }, []);

  const startReverseQuiz = useCallback(() => {
    const shuffled = shuffle(PHRASES).slice(0, DECK_SIZE);
    setDeck(shuffled);
    setCurrent(0);
    setScore({ correct: 0, wrong: 0, skipped: 0 });
    setQuizAnswer(null);
    generateReverseQuizOptions(shuffled, 0);
    setMode('reverse-quiz');
  }, []);

  // Phrase Builder only works on phrases that ship word-tile breakdowns.
  const PHRASES_WITH_TILES = useMemo(
    () => PHRASES.filter((p) => Array.isArray(p.wordTiles) && p.wordTiles.length > 0),
    []
  );

  const startPhraseBuilder = useCallback(() => {
    const pool = shuffle(PHRASES_WITH_TILES);
    const shuffled = pool.slice(0, Math.min(DECK_SIZE, pool.length));
    setDeck(shuffled);
    setCurrent(0);
    setScore({ correct: 0, wrong: 0, skipped: 0 });
    setMode('phrase-builder');
  }, [PHRASES_WITH_TILES]);

  // Arabic → Transliteration options (standard quiz — no English)
  const generateQuizOptions = (phrases: Phrase[], idx: number) => {
    const correct = phrases[idx];
    const others = PHRASES.filter((p) => p.id !== correct.id);
    const wrong = shuffle(others).slice(0, 3);
    const options = shuffle([correct.roman, ...wrong.map((w) => w.roman)]);
    setQuizOptions(options);
    setQuizAnswer(null);
  };

  // English → Arabic options (reverse quiz)
  const generateReverseQuizOptions = (phrases: Phrase[], idx: number) => {
    const correct = phrases[idx];
    const others = PHRASES.filter((p) => p.id !== correct.id);
    const wrong = shuffle(others).slice(0, 3);
    const options = shuffle([correct.arabic, ...wrong.map((w) => w.arabic)]);
    setQuizOptions(options);
    setQuizAnswer(null);
  };

  // Flashcard navigation — calls 3-tier rating for real SRS scheduling
  const rateCard = useCallback((rating: 'knew' | 'learning' | 'new') => {
    void Haptics.impactAsync(
      rating === 'knew' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
    ).catch(() => {});
    if (rating === 'knew') setScore((s) => ({ ...s, correct: s.correct + 1 }));
    else if (rating === 'new') setScore((s) => ({ ...s, wrong: s.wrong + 1 }));
    else setScore((s) => ({ ...s, skipped: s.skipped + 1 }));

    // 3-tier SRS scheduling (1/3/7 days)
    onPhraseRating?.(deck[current].id, rating);
    // Also record binary for backward compat (milestones, category mastery)
    onPhraseReview?.(deck[current].id, rating === 'knew');

    if (current + 1 >= deck.length) {
      onSessionComplete?.();
      setMode('result');
    } else {
      setCurrent((c) => c + 1);
      setFlipped(false);
    }
  }, [current, deck, onPhraseRating, onPhraseReview, onSessionComplete]);

  const fireAnswerHaptic = useCallback((correct: boolean) => {
    void Haptics.notificationAsync(
      correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    ).catch(() => {});
  }, []);

  // Standard quiz answer (Arabic → Transliteration)
  const handleQuizAnswer = useCallback((answer: string) => {
    if (quizAnswer) return; // already answered — ignore double-taps
    setQuizAnswer(answer);
    const isCorrect = answer === deck[current].roman;
    fireAnswerHaptic(isCorrect);
    if (isCorrect) setScore((s) => ({ ...s, correct: s.correct + 1 }));
    else setScore((s) => ({ ...s, wrong: s.wrong + 1 }));
    onPhraseReview?.(deck[current].id, isCorrect);
  }, [quizAnswer, deck, current, fireAnswerHaptic, onPhraseReview]);

  // Reverse quiz answer (English → Arabic)
  const handleReverseQuizAnswer = useCallback((answer: string) => {
    if (quizAnswer) return;
    setQuizAnswer(answer);
    const isCorrect = answer === deck[current].arabic;
    fireAnswerHaptic(isCorrect);
    if (isCorrect) setScore((s) => ({ ...s, correct: s.correct + 1 }));
    else setScore((s) => ({ ...s, wrong: s.wrong + 1 }));
    onPhraseReview?.(deck[current].id, isCorrect);
  }, [quizAnswer, deck, current, fireAnswerHaptic, onPhraseReview]);

  const nextQuizQuestion = useCallback(() => {
    if (current + 1 >= deck.length) {
      onSessionComplete?.();
      setMode('result');
    } else {
      const next = current + 1;
      setCurrent(next);
      if (mode === 'reverse-quiz') generateReverseQuizOptions(deck, next);
      else generateQuizOptions(deck, next);
    }
  }, [current, deck, mode, onSessionComplete]);

  const phrase = deck[current];
  const progress = deck.length > 0 ? ((current + 1) / deck.length) * 100 : 0;

  // Memoize result stats to prevent recreation on every render
  // Must be before any early return to satisfy Rules of Hooks
  const resultStats = useMemo(() => [
    { label: STRINGS.practice.correctCount(score.correct).split(' ')[1], value: score.correct, color: C.JADE2 },
    { label: STRINGS.practice.learning, value: score.skipped, color: C.GOLD },
    { label: STRINGS.practice.missed, value: score.wrong, color: C.ERROR },
  ], [score, C]);

  if (mode !== 'menu' && (!deck || deck.length === 0)) {
    return (
      <View style={{ flex: 1, backgroundColor: C.BG, justifyContent: 'center' }}>
        <EmptyState
          arabic="لا يوجد"
          title="No phrases to practice"
          subtitle="Add phrases to your library first"
        />
      </View>
    );
  }

  // Dynamic header title
  const headerTitle =
    mode === 'menu' ? STRINGS.practice.title
    : mode === 'flashcard' ? STRINGS.practice.flashcards
    : mode === 'quiz' ? STRINGS.practice.quiz
    : mode === 'reverse-quiz' ? STRINGS.practice.reverseQuiz
    : STRINGS.practice.results;

  return (
    <View style={{ flex: 1, backgroundColor: C.BG }}>
      <GhostLetters glyphs={['ف', 'ك', 'ر']} />
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 12,
          paddingBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 18, color: C.TEXT }}>
            {headerTitle}
          </Text>
          <Pressable
            onPress={onExit}
            style={{
              width: 32,
              height: 32,
              borderRadius: 12,
              backgroundColor: C.SURFACE,
              borderWidth: 1,
              borderColor: C.BORDER,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={15} color={C.TEXT2} />
          </Pressable>
        </View>

        {/* Progress bar */}
        {(mode === 'flashcard' || mode === 'quiz' || mode === 'reverse-quiz') && (
          <View style={{ marginTop: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3 }}>
                {STRINGS.practice.xOfY(current + 1, deck.length)}
              </Text>
              <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 11, color: C.GOLD }}>
                {STRINGS.practice.correctCount(score.correct)}
              </Text>
            </View>
            <View style={{ height: 4, borderRadius: 2, backgroundColor: C.SURFACE }}>
              <MotiView
                animate={{ width: `${progress}%` }}
                transition={{ type: 'timing', duration: 300 }}
                style={{ height: 4, borderRadius: 2 }}
              >
                <LinearGradient
                  colors={[...G.GOLD_STOPS]}
                  start={ANGLE_135.start}
                  end={ANGLE_135.end}
                  style={{ flex: 1, borderRadius: 2 }}
                />
              </MotiView>
            </View>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 24,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      >
        {/* ─── MODE SELECT ─── */}
        {mode === 'menu' && (
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 350 }}
          >
            <View style={{ gap: 14, paddingTop: 20 }}>
              <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 40, color: C.GOLD, textAlign: 'center', opacity: 0.15 }}>
                تدريب
              </Text>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, textAlign: 'center', marginBottom: 8 }}>
                {STRINGS.practice.chooseHowToPractice}
              </Text>

              {/* 1: Flashcards */}
              <Pressable onPress={startFlashcards} accessibilityRole="button" accessibilityLabel="Start flashcard practice">
                <View style={{ borderRadius: 20, padding: 20, backgroundColor: C.GOLD_DIM, borderWidth: 1.5, borderColor: C.GOLD_BORDER, gap: 8 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: C.GOLD_SURFACE, alignItems: 'center', justifyContent: 'center' }}>
                    <RotateCcw size={20} color={C.GOLD} />
                  </View>
                  <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 17, color: C.TEXT }}>{STRINGS.practice.flashcards}</Text>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2, lineHeight: 20 }}>{STRINGS.practice.flashcardDesc}</Text>
                  <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 11, color: C.GOLD }}>{STRINGS.practice.flashcardMeta(DECK_SIZE)}</Text>
                </View>
              </Pressable>

              {/* 2: Translation Quiz (Arabic → English) */}
              <Pressable onPress={startQuiz} accessibilityRole="button" accessibilityLabel="Start translation quiz">
                <View style={{ borderRadius: 20, padding: 20, backgroundColor: C.JADE_DIM, borderWidth: 1.5, borderColor: C.JADE_BORDER, gap: 8 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: C.JADE_SURFACE, alignItems: 'center', justifyContent: 'center' }}>
                    <Trophy size={20} color={C.JADE2} />
                  </View>
                  <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 17, color: C.TEXT }}>{STRINGS.practice.quizTitle}</Text>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2, lineHeight: 20 }}>{STRINGS.practice.quizDesc}</Text>
                  <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 11, color: C.JADE2 }}>{STRINGS.practice.quizMeta(DECK_SIZE)}</Text>
                </View>
              </Pressable>

              {/* 3: Reverse Quiz (English → Arabic) — NEW */}
              <Pressable onPress={startReverseQuiz} accessibilityRole="button" accessibilityLabel="Start reverse quiz">
                <View style={{ borderRadius: 20, padding: 20, backgroundColor: C.VIOLET_DIM, borderWidth: 1.5, borderColor: C.VIOLET_BORDER, gap: 8 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: `${C.VIOLET2}18`, alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowLeftRight size={20} color={C.VIOLET2} />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 17, color: C.TEXT }}>{STRINGS.practice.reverseQuiz}</Text>
                    <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: C.VIOLET2 }}>
                      <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 9, color: '#fff', letterSpacing: 0.5 }}>NEW</Text>
                    </View>
                  </View>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2, lineHeight: 20 }}>{STRINGS.practice.reverseQuizDesc}</Text>
                  <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 11, color: C.VIOLET2 }}>{STRINGS.practice.reverseQuizMeta(DECK_SIZE)}</Text>
                </View>
              </Pressable>

              {/* 4: Phrase Builder — only enabled if there are phrases with word tiles */}
              {PHRASES_WITH_TILES.length > 0 ? (
                <Pressable onPress={startPhraseBuilder} accessibilityRole="button" accessibilityLabel="Start phrase builder">
                  <View style={{ borderRadius: 20, padding: 20, backgroundColor: C.GOLD_SURFACE, borderWidth: 1.5, borderColor: C.GOLD_BORDER, gap: 8 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: C.GOLD_DIM, alignItems: 'center', justifyContent: 'center' }}>
                      <Layers size={20} color={C.GOLD} />
                    </View>
                    <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 17, color: C.TEXT }}>{STRINGS.practice.phraseBuilder}</Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2, lineHeight: 20 }}>{STRINGS.practice.phraseBuilderDesc}</Text>
                    <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 11, color: C.GOLD }}>
                      {STRINGS.practice.phraseBuilderMeta(Math.min(DECK_SIZE, PHRASES_WITH_TILES.length))}
                    </Text>
                  </View>
                </Pressable>
              ) : null}
            </View>
          </MotiView>
        )}

        {/* ─── FLASHCARD MODE ─── */}
        {mode === 'flashcard' && phrase && (
          <View style={{ gap: 16, paddingTop: 8 }}>
            <FlashCard
              phrase={phrase}
              flipped={flipped}
              onFlip={() => setFlipped(true)}
              onSpeak={() => speak(phrase.arabic)}
              onSpeakSlow={() => speakSlow(phrase.arabic)}
              isPlaying={isSpeaking}
              index={current}
            />

            {flipped && (
              <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 250 }}
              >
                <Text
                  style={{
                    fontFamily: FONT_LATIN,
                    fontSize: 11,
                    color: C.TEXT3,
                    textAlign: 'center',
                    marginBottom: 8,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                  }}
                >
                  {STRINGS.practice.howWellDidYouKnow}
                </Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {/* New to me — 1 day */}
                  <Pressable
                    onPress={() => rateCard('new')}
                    accessibilityRole="button"
                    accessibilityLabel="New to me - schedule review in 1 day"
                    style={{ flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: C.ERROR_SURFACE, borderWidth: 1.5, borderColor: C.ERROR_BORDER, alignItems: 'center', gap: 2 }}
                  >
                    <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 13, color: C.ERROR }}>{STRINGS.practice.newToMe}</Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 9, color: `${C.ERROR}80` }}>{STRINGS.practice.newToMeSub}</Text>
                  </Pressable>
                  {/* Learning — 3 days */}
                  <Pressable
                    onPress={() => rateCard('learning')}
                    accessibilityRole="button"
                    accessibilityLabel="Learning - schedule review in 3 days"
                    style={{ flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: C.GOLD_DIM, borderWidth: 1.5, borderColor: C.GOLD_BORDER, alignItems: 'center', gap: 2 }}
                  >
                    <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 13, color: C.GOLD }}>{STRINGS.practice.learning}</Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 9, color: `${C.GOLD}80` }}>{STRINGS.practice.learningSub}</Text>
                  </Pressable>
                  {/* Knew it — 7 days */}
                  <Pressable
                    onPress={() => rateCard('knew')}
                    accessibilityRole="button"
                    accessibilityLabel="Knew it - schedule review in 7 days"
                    style={{ flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: C.JADE_DIM, borderWidth: 1.5, borderColor: C.JADE_BORDER, alignItems: 'center', gap: 2 }}
                  >
                    <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 13, color: C.JADE2 }}>{STRINGS.practice.knewIt}</Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 9, color: `${C.JADE2}80` }}>{STRINGS.practice.knewItSub}</Text>
                  </Pressable>
                </View>
              </MotiView>
            )}
          </View>
        )}

        {/* ─── QUIZ MODE (Arabic → Transliteration matching) ─── */}
        {mode === 'quiz' && phrase && (
          <View style={{ gap: 16, paddingTop: 8 }}>
            {/* Question: Arabic phrase with audio */}
            <MotiView
              key={`quiz-${current}`}
              from={{ opacity: 0, translateX: 30 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', duration: 260 }}
            >
              <View style={{ borderRadius: 24, padding: 28, backgroundColor: C.GOLD_SURFACE, borderWidth: 1.5, borderColor: C.GOLD_BORDER, alignItems: 'center', gap: 8 }}>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {STRINGS.practice.matchPronunciation || 'Match the pronunciation'}
                </Text>
                <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 32, color: C.GOLD, textAlign: 'center', lineHeight: 48, marginVertical: 8 }}>
                  {phrase.arabic}
                </Text>
                <Pressable
                  onPress={() => speak(phrase.arabic)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 16, backgroundColor: isSpeaking ? C.JADE_SURFACE : C.SURFACE, borderWidth: 1, borderColor: isSpeaking ? C.JADE_BORDER : C.BORDER }}
                >
                  <Volume2 size={16} color={isSpeaking ? C.JADE2 : C.TEXT3} />
                  <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 13, color: isSpeaking ? C.JADE2 : C.TEXT3 }}>{isSpeaking ? STRINGS.common.playing : STRINGS.common.listen}</Text>
                </Pressable>
              </View>
            </MotiView>

            {/* Options: Transliterations (romanized text) */}
            <View style={{ gap: 10 }}>
              {quizOptions.map((option, i) => {
                let state: 'idle' | 'correct' | 'wrong' = 'idle';
                if (quizAnswer) {
                  if (option === phrase.roman) state = 'correct';
                  else if (option === quizAnswer) state = 'wrong';
                }
                return (
                  <QuizOption
                    key={`${current}-${i}`}
                    text={option}
                    state={state}
                    onPress={() => handleQuizAnswer(option)}
                    delay={i * 60}
                  />
                );
              })}
            </View>

            {/* Show Arabic + meaning after answer */}
            {quizAnswer && (
              <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 250 }}>
                <View style={{ borderRadius: 16, padding: 14, backgroundColor: C.GOLD_DIM, borderWidth: 1, borderColor: C.GOLD_BORDER, alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 20, color: C.GOLD }}>{phrase.arabic}</Text>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: `${C.GOLD}80`, fontStyle: 'italic' }}>{phrase.roman}</Text>
                  <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 13, color: C.TEXT2, marginTop: 2 }}>{phrase.english}</Text>
                </View>
              </MotiView>
            )}

            {/* Cultural note after answer */}
            {quizAnswer && phrase.culturalNote && (
              <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 250, delay: 100 }}>
                <View style={{ borderRadius: 16, padding: 14, backgroundColor: C.VIOLET_DIM, borderWidth: 1, borderColor: C.VIOLET_BORDER }}>
                  <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 10, color: C.VIOLET2, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>
                    {STRINGS.phrases.culturalContext}
                  </Text>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, lineHeight: 18 }}>{phrase.culturalNote}</Text>
                </View>
              </MotiView>
            )}

            {/* Next button */}
            {quizAnswer && (
              <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 200, delay: 300 }}>
                <Pressable onPress={nextQuizQuestion} accessibilityRole="button" style={{ borderRadius: 16, overflow: 'hidden' }}>
                  <LinearGradient
                    colors={[...G.GOLD_STOPS]}
                    start={ANGLE_135.start}
                    end={ANGLE_135.end}
                    style={{ paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 15, color: C.WHITE }}>
                      {current + 1 >= deck.length ? STRINGS.practice.seeResults : STRINGS.practice.next}
                    </Text>
                    <ArrowRight size={17} color={C.WHITE} />
                  </LinearGradient>
                </Pressable>
              </MotiView>
            )}
          </View>
        )}

        {/* ─── REVERSE QUIZ MODE (English → Arabic recall) ─── */}
        {mode === 'reverse-quiz' && phrase && (
          <View style={{ gap: 16, paddingTop: 8 }}>
            {/* Question: English meaning */}
            <MotiView
              key={`reverse-${current}`}
              from={{ opacity: 0, translateX: 30 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', duration: 260 }}
            >
              <View style={{ borderRadius: 24, padding: 28, backgroundColor: C.VIOLET_DIM, borderWidth: 1.5, borderColor: C.VIOLET_BORDER, alignItems: 'center', gap: 10 }}>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.VIOLET2, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {STRINGS.practice.pickTheArabic}
                </Text>
                <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 24, color: C.TEXT, textAlign: 'center', lineHeight: 34, marginVertical: 8 }}>
                  {`"${phrase.english}"`}
                </Text>
                {phrase.culturalNote && (
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT3, textAlign: 'center', lineHeight: 18, fontStyle: 'italic' }}>
                    {phrase.culturalNote}
                  </Text>
                )}
              </View>
            </MotiView>

            {/* Options: Arabic phrases (rendered RTL) */}
            <View style={{ gap: 10 }}>
              {quizOptions.map((option, i) => {
                let state: 'idle' | 'correct' | 'wrong' = 'idle';
                if (quizAnswer) {
                  if (option === phrase.arabic) state = 'correct';
                  else if (option === quizAnswer) state = 'wrong';
                }
                return (
                  <QuizOption
                    key={`${current}-rev-${i}`}
                    text={option}
                    state={state}
                    onPress={() => handleReverseQuizAnswer(option)}
                    delay={i * 60}
                    isArabic
                  />
                );
              })}
            </View>

            {/* Show romanization of correct answer after answering */}
            {quizAnswer && (
              <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 250 }}>
                <View style={{ borderRadius: 16, padding: 14, backgroundColor: C.GOLD_SURFACE, borderWidth: 1, borderColor: C.GOLD_BORDER, alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 22, color: C.GOLD }}>{phrase.arabic}</Text>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: `${C.GOLD}80`, fontStyle: 'italic' }}>{phrase.roman}</Text>
                  <Pressable
                    onPress={() => speak(phrase.arabic)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, backgroundColor: isSpeaking ? C.JADE_SURFACE : C.SURFACE, borderWidth: 1, borderColor: isSpeaking ? C.JADE_BORDER : C.BORDER }}
                  >
                    <Volume2 size={13} color={isSpeaking ? C.JADE2 : C.TEXT3} />
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: isSpeaking ? C.JADE2 : C.TEXT3 }}>{isSpeaking ? STRINGS.common.playing : STRINGS.common.listen}</Text>
                  </Pressable>
                </View>
              </MotiView>
            )}

            {/* Next button */}
            {quizAnswer && (
              <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 200, delay: 300 }}>
                <Pressable onPress={nextQuizQuestion} accessibilityRole="button" style={{ borderRadius: 16, overflow: 'hidden' }}>
                  <LinearGradient
                    colors={[...G.GOLD_STOPS]}
                    start={ANGLE_135.start}
                    end={ANGLE_135.end}
                    style={{ paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 15, color: C.WHITE }}>
                      {current + 1 >= deck.length ? STRINGS.practice.seeResults : STRINGS.practice.next}
                    </Text>
                    <ArrowRight size={17} color={C.WHITE} />
                  </LinearGradient>
                </Pressable>
              </MotiView>
            )}
          </View>
        )}

        {/* ─── PHRASE BUILDER ─── */}
        {mode === 'phrase-builder' && deck[current] && (
          <View style={{ flex: 1, backgroundColor: C.BG }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: 16 }}>
              <Pressable onPress={() => setMode('menu')} accessibilityRole="button" accessibilityLabel="Back to menu" style={{ width: 32, height: 32, borderRadius: 12, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER, alignItems: 'center', justifyContent: 'center' }}>
                <X size={15} color={C.TEXT2} />
              </Pressable>
              
              {/* Progress bar */}
              <View style={{ flex: 1, marginHorizontal: 20, height: 6, borderRadius: 3, backgroundColor: C.SURFACE, overflow: 'hidden' }}>
                <MotiView from={{ width: '0%' }} animate={{ width: `${(current / deck.length) * 100}%` }} transition={{ type: 'timing', duration: 400 }} style={{ height: '100%', backgroundColor: C.GOLD, borderRadius: 3 }} />
              </View>
            </View>

            <PhraseBuilder
              key={deck[current].id}
              english={deck[current].english}
              arabic={deck[current].arabic}
              wordTiles={deck[current].wordTiles}
              onComplete={(isCorrect) => {
                fireAnswerHaptic(isCorrect);
                if (isCorrect) {
                   setScore(s => ({ ...s, correct: s.correct + 1 }));
                   onPhraseRating?.(deck[current].id, 'knew');
                } else {
                   setScore(s => ({ ...s, wrong: s.wrong + 1 }));
                   onPhraseRating?.(deck[current].id, 'learning');
                }
                if (current + 1 >= deck.length) {
                   setMode('result');
                } else {
                   setCurrent(c => c + 1);
                }
              }}
            />
          </View>
        )}

        {/* ─── RESULTS ─── */}
        {mode === 'result' && (
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 350 }}
          >
            <View style={{ gap: 16, paddingTop: 16 }}>
              {/* Score card */}
              <View
                style={{
                  borderRadius: 24,
                  padding: 28,
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor:
                    score.correct >= deck.length * 0.75
                      ? C.JADE_SURFACE
                      : score.correct >= deck.length * 0.5
                      ? C.GOLD_SURFACE
                      : C.ERROR_SURFACE,
                  borderWidth: 1.5,
                  borderColor:
                    score.correct >= deck.length * 0.75
                      ? C.JADE_BORDER
                      : score.correct >= deck.length * 0.5
                      ? C.GOLD_BORDER
                      : C.ERROR_BORDER,
                }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: score.correct >= deck.length * 0.75 ? C.JADE_DIM : C.GOLD_DIM,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Trophy size={28} color={score.correct >= deck.length * 0.75 ? C.JADE2 : C.GOLD} />
                </View>
                <Text style={{ fontFamily: FONT_HEADING_EXTRA, fontSize: 28, color: C.TEXT }}>
                  {score.correct}/{deck.length}
                </Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, textAlign: 'center' }}>
                  {score.correct >= deck.length * 0.75
                    ? STRINGS.practice.excellentResult
                    : score.correct >= deck.length * 0.5
                    ? STRINGS.practice.goodResult
                    : STRINGS.practice.keepGoingResult}
                </Text>
              </View>

              {/* Breakdown */}
              <View style={{ borderRadius: 16, padding: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                  {resultStats.map(({ label, value, color }) => (
                    <View key={label} style={{ alignItems: 'center' }} accessible={true} accessibilityRole="text" accessibilityLabel={`${label}: ${value}`}>
                      <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 22, color }}>{value}</Text>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: C.TEXT3, marginTop: 2 }}>{label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* SRS schedule note */}
              <View style={{ borderRadius: 14, padding: 14, backgroundColor: C.GOLD_DIM, borderWidth: 1, borderColor: C.GOLD_BORDER, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <BookOpen size={16} color={C.GOLD} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 13, color: C.GOLD }}>
                    {STRINGS.practice.phrasesReviewed(deck.length)}
                  </Text>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: `${C.GOLD}80`, marginTop: 2 }}>
                    Your ratings schedule the next review — harder phrases come back sooner.
                  </Text>
                </View>
              </View>

              {/* Action buttons */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable
                  onPress={() => setMode('menu')}
                  accessibilityRole="button"
                  accessibilityLabel="Practice again"
                  style={{
                    flex: 1,
                    paddingVertical: 16,
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
                  <RotateCcw size={15} color={C.TEXT2} />
                  <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: C.TEXT2 }}>
                    {STRINGS.practice.practiceAgain}
                  </Text>
                </Pressable>
                <Pressable onPress={onExit} accessibilityRole="button" accessibilityLabel="Done" style={{ flex: 1, borderRadius: 16, overflow: 'hidden' }}>
                  <LinearGradient
                    colors={[...G.GOLD_STOPS]}
                    start={ANGLE_135.start}
                    end={ANGLE_135.end}
                    style={{ paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 14, color: C.WHITE }}>{STRINGS.common.done}</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </MotiView>
        )}
      </ScrollView>
    </View>
  );
}
