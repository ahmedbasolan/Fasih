import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import { X, Check, ArrowRight, RotateCcw, Trophy, BookOpen, Volume2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, FONT_ARABIC_BLACK, FONT_LATIN, FONT_LATIN_BOLD, FONT_LATIN_SEMI } from '../components/design/tokens';
import { GOLD_STOPS, JADE_STOPS, ANGLE_135 } from '../components/design/gradients';
import { PHRASES } from '../constants/phrases';
import type { Phrase } from '../types';

const { width: SCREEN_W } = Dimensions.get('window');

type PracticeMode = 'menu' | 'flashcard' | 'quiz' | 'result';

interface Props {
  onExit: () => void;
  onPhraseReview?: (phraseId: string, correct: boolean) => void;
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

// ─── Flashcard Component ──────────────────────────────────────────────────────
function FlashCard({
  phrase,
  flipped,
  onFlip,
  index,
}: {
  phrase: Phrase;
  flipped: boolean;
  onFlip: () => void;
  index: number;
}) {
  return (
    <MotiView
      key={phrase.id}
      from={{ opacity: 0, translateX: 40 }}
      animate={{ opacity: 1, translateX: 0 }}
      exit={{ opacity: 0, translateX: -40 }}
      transition={{ type: 'timing', duration: 280 }}
    >
      <Pressable onPress={onFlip}>
        <View
          style={{
            borderRadius: 24,
            padding: 28,
            minHeight: 260,
            backgroundColor: flipped ? 'rgba(72,187,120,0.06)' : C.SURFACE,
            borderWidth: 1.5,
            borderColor: flipped ? C.JADE_BORDER : C.BORDER,
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
              <Text
                style={{
                  fontFamily: FONT_LATIN,
                  fontSize: 12,
                  color: C.TEXT3,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Tap to reveal
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
                  backgroundColor: 'rgba(255,255,255,0.08)',
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
}: {
  text: string;
  state: 'idle' | 'correct' | 'wrong';
  onPress: () => void;
  delay: number;
}) {
  const bg =
    state === 'correct'
      ? 'rgba(72,187,120,0.12)'
      : state === 'wrong'
      ? 'rgba(224,112,112,0.12)'
      : 'rgba(255,255,255,0.03)';
  const border =
    state === 'correct'
      ? C.JADE_BORDER
      : state === 'wrong'
      ? 'rgba(224,112,112,0.3)'
      : C.BORDER;
  const textColor =
    state === 'correct' ? C.JADE2 : state === 'wrong' ? '#E07070' : C.TEXT2;

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
        {state === 'wrong' && <X size={16} color="#E07070" />}
        <Text
          style={{
            fontFamily: FONT_LATIN,
            fontSize: 14,
            color: textColor,
            flex: 1,
          }}
        >
          {text}
        </Text>
      </Pressable>
    </MotiView>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function PracticeScreen({ onExit, onPhraseReview, onSessionComplete }: Props) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<PracticeMode>('menu');
  const [deck, setDeck] = useState<Phrase[]>([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0, skipped: 0 });
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [selfRatings, setSelfRatings] = useState<('knew' | 'learning' | 'new')[]>([]);

  const DECK_SIZE = 8;

  const startFlashcards = useCallback(() => {
    const shuffled = shuffle(PHRASES).slice(0, DECK_SIZE);
    setDeck(shuffled);
    setCurrent(0);
    setFlipped(false);
    setScore({ correct: 0, wrong: 0, skipped: 0 });
    setSelfRatings([]);
    setMode('flashcard');
  }, []);

  const startQuiz = useCallback(() => {
    const shuffled = shuffle(PHRASES).slice(0, DECK_SIZE);
    setDeck(shuffled);
    setCurrent(0);
    setScore({ correct: 0, wrong: 0, skipped: 0 });
    setQuizAnswer(null);
    generateQuizOptions(shuffled, 0);
    setMode('quiz');
  }, []);

  const generateQuizOptions = (phrases: Phrase[], idx: number) => {
    const correct = phrases[idx];
    const others = PHRASES.filter((p) => p.id !== correct.id);
    const wrong = shuffle(others).slice(0, 3);
    const options = shuffle([correct.english, ...wrong.map((w) => w.english)]);
    setQuizOptions(options);
    setQuizAnswer(null);
  };

  // Flashcard navigation
  const rateCard = (rating: 'knew' | 'learning' | 'new') => {
    const newRatings = [...selfRatings, rating];
    setSelfRatings(newRatings);

    if (rating === 'knew') setScore((s) => ({ ...s, correct: s.correct + 1 }));
    else if (rating === 'new') setScore((s) => ({ ...s, wrong: s.wrong + 1 }));
    else setScore((s) => ({ ...s, skipped: s.skipped + 1 }));

    // Record spaced repetition review
    onPhraseReview?.(deck[current].id, rating === 'knew');

    if (current + 1 >= deck.length) {
      onSessionComplete?.();
      setMode('result');
    } else {
      setCurrent((c) => c + 1);
      setFlipped(false);
    }
  };

  // Quiz answer
  const handleQuizAnswer = (answer: string) => {
    setQuizAnswer(answer);
    const isCorrect = answer === deck[current].english;
    if (isCorrect) setScore((s) => ({ ...s, correct: s.correct + 1 }));
    else setScore((s) => ({ ...s, wrong: s.wrong + 1 }));
    // Record spaced repetition review
    onPhraseReview?.(deck[current].id, isCorrect);
  };

  const nextQuizQuestion = () => {
    if (current + 1 >= deck.length) {
      onSessionComplete?.();
      setMode('result');
    } else {
      const next = current + 1;
      setCurrent(next);
      generateQuizOptions(deck, next);
    }
  };

  const phrase = deck[current];
  const progress = deck.length > 0 ? ((current + 1) / deck.length) * 100 : 0;

  return (
    <View style={{ flex: 1, backgroundColor: C.BG }}>
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
          <Text
            style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 18, color: C.TEXT }}
          >
            {mode === 'menu'
              ? 'Practice'
              : mode === 'flashcard'
              ? 'Flashcards'
              : mode === 'quiz'
              ? 'Quiz'
              : 'Results'}
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
        {(mode === 'flashcard' || mode === 'quiz') && (
          <View style={{ marginTop: 12 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 6,
              }}
            >
              <Text
                style={{
                  fontFamily: FONT_LATIN,
                  fontSize: 11,
                  color: C.TEXT3,
                }}
              >
                {current + 1} of {deck.length}
              </Text>
              <Text
                style={{
                  fontFamily: FONT_LATIN_SEMI,
                  fontSize: 11,
                  color: C.GOLD,
                }}
              >
                {score.correct} correct
              </Text>
            </View>
            <View
              style={{
                height: 4,
                borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.06)',
              }}
            >
              <MotiView
                animate={{ width: `${progress}%` }}
                transition={{ type: 'timing', duration: 300 }}
                style={{ height: 4, borderRadius: 2 }}
              >
                <LinearGradient
                  colors={[...GOLD_STOPS]}
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
      >
        {/* ─── MODE SELECT ─── */}
        {mode === 'menu' && (
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 350 }}
          >
            <View style={{ gap: 16, paddingTop: 20 }}>
              <Text
                style={{
                  fontFamily: FONT_ARABIC_BLACK,
                  fontSize: 40,
                  color: C.GOLD,
                  textAlign: 'center',
                  opacity: 0.15,
                }}
              >
                تدريب
              </Text>
              <Text
                style={{
                  fontFamily: FONT_LATIN,
                  fontSize: 14,
                  color: C.TEXT2,
                  textAlign: 'center',
                  marginBottom: 12,
                }}
              >
                Choose how you want to practice
              </Text>

              {/* Flashcard option */}
              <Pressable onPress={startFlashcards}>
                <View
                  style={{
                    borderRadius: 20,
                    padding: 20,
                    backgroundColor: C.GOLD_DIM,
                    borderWidth: 1,
                    borderColor: C.GOLD_BORDER,
                    gap: 8,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      backgroundColor: 'rgba(200,145,58,0.15)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <RotateCcw size={20} color={C.GOLD} />
                  </View>
                  <Text
                    style={{
                      fontFamily: FONT_LATIN_BOLD,
                      fontSize: 17,
                      color: C.TEXT,
                    }}
                  >
                    Flashcards
                  </Text>
                  <Text
                    style={{
                      fontFamily: FONT_LATIN,
                      fontSize: 13,
                      color: C.TEXT2,
                      lineHeight: 20,
                    }}
                  >
                    See Arabic phrases, tap to reveal the meaning. Rate your
                    knowledge after each card.
                  </Text>
                  <Text
                    style={{
                      fontFamily: FONT_LATIN_SEMI,
                      fontSize: 11,
                      color: C.GOLD,
                    }}
                  >
                    {DECK_SIZE} cards · Self-paced
                  </Text>
                </View>
              </Pressable>

              {/* Quiz option */}
              <Pressable onPress={startQuiz}>
                <View
                  style={{
                    borderRadius: 20,
                    padding: 20,
                    backgroundColor: C.JADE_DIM,
                    borderWidth: 1,
                    borderColor: C.JADE_BORDER,
                    gap: 8,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      backgroundColor: 'rgba(72,187,120,0.15)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Trophy size={20} color={C.JADE2} />
                  </View>
                  <Text
                    style={{
                      fontFamily: FONT_LATIN_BOLD,
                      fontSize: 17,
                      color: C.TEXT,
                    }}
                  >
                    Translation Quiz
                  </Text>
                  <Text
                    style={{
                      fontFamily: FONT_LATIN,
                      fontSize: 13,
                      color: C.TEXT2,
                      lineHeight: 20,
                    }}
                  >
                    Read the Arabic phrase, choose the correct English
                    translation from four options.
                  </Text>
                  <Text
                    style={{
                      fontFamily: FONT_LATIN_SEMI,
                      fontSize: 11,
                      color: C.JADE2,
                    }}
                  >
                    {DECK_SIZE} questions · Multiple choice
                  </Text>
                </View>
              </Pressable>
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
                  How well did you know this?
                </Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Pressable
                    onPress={() => rateCard('new')}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 14,
                      backgroundColor: 'rgba(224,112,112,0.1)',
                      borderWidth: 1,
                      borderColor: 'rgba(224,112,112,0.25)',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: FONT_LATIN_SEMI,
                        fontSize: 13,
                        color: '#E07070',
                      }}
                    >
                      New to me
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => rateCard('learning')}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 14,
                      backgroundColor: C.GOLD_DIM,
                      borderWidth: 1,
                      borderColor: C.GOLD_BORDER,
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: FONT_LATIN_SEMI,
                        fontSize: 13,
                        color: C.GOLD,
                      }}
                    >
                      Learning
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => rateCard('knew')}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 14,
                      backgroundColor: C.JADE_DIM,
                      borderWidth: 1,
                      borderColor: C.JADE_BORDER,
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: FONT_LATIN_SEMI,
                        fontSize: 13,
                        color: C.JADE2,
                      }}
                    >
                      Knew it
                    </Text>
                  </Pressable>
                </View>
              </MotiView>
            )}
          </View>
        )}

        {/* ─── QUIZ MODE ─── */}
        {mode === 'quiz' && phrase && (
          <View style={{ gap: 16, paddingTop: 8 }}>
            {/* Question */}
            <MotiView
              key={`quiz-${current}`}
              from={{ opacity: 0, translateX: 30 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', duration: 260 }}
            >
              <View
                style={{
                  borderRadius: 24,
                  padding: 28,
                  backgroundColor: C.SURFACE,
                  borderWidth: 1,
                  borderColor: C.BORDER,
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: FONT_LATIN,
                    fontSize: 11,
                    color: C.TEXT3,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  Translate this phrase
                </Text>
                <Text
                  style={{
                    fontFamily: FONT_ARABIC_BLACK,
                    fontSize: 32,
                    color: C.GOLD,
                    textAlign: 'center',
                    lineHeight: 48,
                    marginVertical: 8,
                  }}
                >
                  {phrase.arabic}
                </Text>
                <Text
                  style={{
                    fontFamily: FONT_LATIN,
                    fontSize: 13,
                    color: `${C.GOLD}70`,
                    fontStyle: 'italic',
                  }}
                >
                  {phrase.roman}
                </Text>
              </View>
            </MotiView>

            {/* Options */}
            <View style={{ gap: 10 }}>
              {quizOptions.map((option, i) => {
                let state: 'idle' | 'correct' | 'wrong' = 'idle';
                if (quizAnswer) {
                  if (option === phrase.english) state = 'correct';
                  else if (option === quizAnswer) state = 'wrong';
                }
                return (
                  <QuizOption
                    key={`${current}-${option}`}
                    text={option}
                    state={state}
                    onPress={() => handleQuizAnswer(option)}
                    delay={i * 60}
                  />
                );
              })}
            </View>

            {/* Cultural note after answer */}
            {quizAnswer && phrase.culturalNote && (
              <MotiView
                from={{ opacity: 0, translateY: 8 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 250 }}
              >
                <View
                  style={{
                    borderRadius: 16,
                    padding: 14,
                    backgroundColor: C.VIOLET_DIM,
                    borderWidth: 1,
                    borderColor: C.VIOLET_BORDER,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: FONT_LATIN_BOLD,
                      fontSize: 10,
                      color: C.VIOLET2,
                      textTransform: 'uppercase',
                      letterSpacing: 0.6,
                      marginBottom: 4,
                    }}
                  >
                    Cultural note
                  </Text>
                  <Text
                    style={{
                      fontFamily: FONT_LATIN,
                      fontSize: 12,
                      color: C.TEXT2,
                      lineHeight: 18,
                    }}
                  >
                    {phrase.culturalNote}
                  </Text>
                </View>
              </MotiView>
            )}

            {/* Next button */}
            {quizAnswer && (
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: 'timing', duration: 200, delay: 300 }}
              >
                <Pressable
                  onPress={nextQuizQuestion}
                  style={{ borderRadius: 16, overflow: 'hidden' }}
                >
                  <LinearGradient
                    colors={[...GOLD_STOPS]}
                    start={ANGLE_135.start}
                    end={ANGLE_135.end}
                    style={{
                      paddingVertical: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: FONT_LATIN_BOLD,
                        fontSize: 15,
                        color: '#05050E',
                      }}
                    >
                      {current + 1 >= deck.length ? 'See Results' : 'Next'}
                    </Text>
                    <ArrowRight size={17} color="#05050E" />
                  </LinearGradient>
                </Pressable>
              </MotiView>
            )}
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
                      ? 'rgba(72,187,120,0.08)'
                      : score.correct >= deck.length * 0.5
                      ? 'rgba(200,145,58,0.08)'
                      : 'rgba(224,112,112,0.08)',
                  borderWidth: 1.5,
                  borderColor:
                    score.correct >= deck.length * 0.75
                      ? C.JADE_BORDER
                      : score.correct >= deck.length * 0.5
                      ? C.GOLD_BORDER
                      : 'rgba(224,112,112,0.25)',
                }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor:
                      score.correct >= deck.length * 0.75
                        ? C.JADE_DIM
                        : C.GOLD_DIM,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Trophy
                    size={28}
                    color={
                      score.correct >= deck.length * 0.75 ? C.JADE2 : C.GOLD
                    }
                  />
                </View>
                <Text
                  style={{
                    fontFamily: FONT_LATIN_BOLD,
                    fontSize: 28,
                    color: C.TEXT,
                  }}
                >
                  {score.correct}/{deck.length}
                </Text>
                <Text
                  style={{
                    fontFamily: FONT_LATIN,
                    fontSize: 14,
                    color: C.TEXT2,
                    textAlign: 'center',
                  }}
                >
                  {score.correct >= deck.length * 0.75
                    ? 'Excellent! Your Arabic is growing fast.'
                    : score.correct >= deck.length * 0.5
                    ? 'Good effort! Keep practicing.'
                    : "Keep going — every new phrase is a step forward."}
                </Text>
              </View>

              {/* Breakdown */}
              <View
                style={{
                  borderRadius: 16,
                  padding: 16,
                  backgroundColor: C.SURFACE,
                  borderWidth: 1,
                  borderColor: C.BORDER,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                  }}
                >
                  {[
                    { label: 'Correct', value: score.correct, color: C.JADE2 },
                    {
                      label: 'Learning',
                      value: score.skipped,
                      color: C.GOLD,
                    },
                    { label: 'Missed', value: score.wrong, color: '#E07070' },
                  ].map(({ label, value, color }) => (
                    <View key={label} style={{ alignItems: 'center' }}>
                      <Text
                        style={{
                          fontFamily: FONT_LATIN_BOLD,
                          fontSize: 22,
                          color,
                        }}
                      >
                        {value}
                      </Text>
                      <Text
                        style={{
                          fontFamily: FONT_LATIN,
                          fontSize: 10,
                          color: C.TEXT3,
                          marginTop: 2,
                        }}
                      >
                        {label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Learning summary */}
              <View
                style={{
                  borderRadius: 16,
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  backgroundColor: C.GOLD_DIM,
                  borderWidth: 1,
                  borderColor: C.GOLD_BORDER,
                }}
              >
                <BookOpen size={16} color={C.GOLD} />
                <Text
                  style={{
                    fontFamily: FONT_LATIN_BOLD,
                    fontSize: 14,
                    color: C.GOLD,
                  }}
                >
                  {deck.length} phrases reviewed
                </Text>
              </View>

              {/* Action buttons */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable
                  onPress={() => setMode('menu')}
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
                  <Text
                    style={{
                      fontFamily: FONT_LATIN_SEMI,
                      fontSize: 14,
                      color: C.TEXT2,
                    }}
                  >
                    Practice Again
                  </Text>
                </Pressable>
                <Pressable
                  onPress={onExit}
                  style={{ flex: 1, borderRadius: 16, overflow: 'hidden' }}
                >
                  <LinearGradient
                    colors={[...GOLD_STOPS]}
                    start={ANGLE_135.start}
                    end={ANGLE_135.end}
                    style={{
                      paddingVertical: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: FONT_LATIN_BOLD,
                        fontSize: 14,
                        color: '#05050E',
                      }}
                    >
                      Done
                    </Text>
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
