import React, { useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, FONT_LATIN_SEMI, FONT_HEADING_SEMI, FONT_LATIN } from '../theme';
import { GhostLetters } from '../components/ui';
import { MotiView } from 'moti';
import {
  HomeHeader,
  StreakWidget,
  QuickChallenge,
  MissionCard,
  DailyPhrase,
  WeeklyXP,
  CommunityBar,
} from '../components/home';
import { useAppStore } from '../store/useAppStore';
import { PHRASES } from '../constants/phrases';
import { getFeaturedScenario, getAllScenarios } from '../constants/scenarios';
import { useArabicTTS } from '../hooks/useArabicTTS';
import { ChevronRight } from 'lucide-react-native';
import { STRINGS } from '../constants/strings';

interface HomeScreenNewProps {
  userName: string;
  onSettingsPress?: () => void;
  onMissionPress?: (missionId: string) => void;
}

// Derive week-day status from streak + lastActiveDate
function getWeekDays(streak: number, lastActiveDate: string | null) {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return days.map((label, idx) => {
    const dayIndex = idx === 0 ? 6 : idx - 1; // Map to Mon-Sun order
    if (dayIndex < dayOfWeek) return { label, status: 'done' as const };
    if (dayIndex === dayOfWeek) return { label, status: 'today' as const };
    return { label, status: 'future' as const };
  });
}

// Unified XP calculation: 10 XP per correct phrase, 2 XP per incorrect attempt
function calculateXPFromReviews(
  phraseReviews: Record<string, { correct: number; incorrect: number; lastReviewed: string }>,
) {
  return Object.values(phraseReviews).reduce((total, card) => {
    return total + card.correct * 10 + card.incorrect * 2;
  }, 0);
}

// Deterministic weekly XP from phrase review data
function getWeeklyXPFromReviews(
  phraseReviews: Record<string, { correct: number; incorrect: number; lastReviewed: string }>,
) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const jsDay = today.getDay() === 0 ? 6 : today.getDay() - 1;

  // Accumulate XP (correct * 10 + incorrect * 2) per weekday from last 7 days
  const xpByDay = [0, 0, 0, 0, 0, 0, 0];
  const now = new Date();
  for (const card of Object.values(phraseReviews)) {
    const reviewed = new Date(card.lastReviewed);
    const diffDays = Math.floor((now.getTime() - reviewed.getTime()) / (86400000));
    if (diffDays < 7 && diffDays >= 0) {
      const reviewedJsDay = reviewed.getDay() === 0 ? 6 : reviewed.getDay() - 1;
      xpByDay[reviewedJsDay] += card.correct * 10 + card.incorrect * 2;
    }
  }

  return days.map((label, idx) => ({
    label,
    value: xpByDay[idx],
    isToday: idx === jsDay,
  }));
}

// Phrase of the day — deterministic based on date
function getPhraseOfTheDay() {
  const today = new Date();
  const dayIndex = today.getDate() + today.getMonth() * 31;
  return PHRASES[dayIndex % PHRASES.length];
}

export function HomeScreenNew({
  userName = 'there',
  onSettingsPress,
  onMissionPress,
}: HomeScreenNewProps) {
  const { C } = useTheme();
  const insets = useSafeAreaInsets();

  // Real store data
  const stats = useAppStore((s) => s.stats);
  const completedScenarios = useAppStore((s) => s.completedScenarios);
  const phraseReviews = useAppStore((s) => s.phraseReviews);
  const lastActiveDate = useAppStore((s) => s.lastActiveDate);
  const toggleSavedPhrase = useAppStore((s) => s.toggleSavedPhrase);

  const { speak } = useArabicTTS();

  const [streakMood, setStreakMood] = useState<'happy' | 'excited' | 'celebrating'>('happy');

  // Derived data
  const streakDays = stats.currentStreak;
  const totalXP = calculateXPFromReviews(phraseReviews) + stats.scenariosCompleted.length * 50;
  const goalXP = 500;
  const isNewUser = stats.daysActive === 0;

  const weekDays = useMemo(() => getWeekDays(streakDays, lastActiveDate), [streakDays, lastActiveDate]);
  const weeklyXPDays = useMemo(() => getWeeklyXPFromReviews(phraseReviews), [phraseReviews]);
  const weeklyTotal = weeklyXPDays.reduce((sum, d) => sum + d.value, 0);

  // Featured scenario (first unlocked, uncompleted one for user's mode)
  const userMode = useAppStore((s) => s.user?.mode) || 'career';
  const featured = useMemo(() => {
    const all = getAllScenarios(C);
    const modeMatch = all.filter((s) => s.mode === userMode && !s.locked && !s.comingSoon);
    // Pick first one not yet completed
    const uncompleted = modeMatch.find((s) => !completedScenarios[s.id]);
    return uncompleted ?? modeMatch[0] ?? getFeaturedScenario(C);
  }, [C, userMode, completedScenarios]);

  const scenesCompletedForFeatured = completedScenarios[featured.id] ? featured.decisions : 0;

  // Phrase of the day
  const phraseOfTheDay = getPhraseOfTheDay();

  const styles = useMemo(() => StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: C.BG,
    },
    scrollContent: {
      paddingBottom: insets.bottom + 100,
    },
    sectionLabel: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 10,
      color: C.TEXT2,
      textTransform: 'uppercase',
      letterSpacing: 1.8,
      fontWeight: '600',
      paddingHorizontal: 24,
      marginTop: 20,
      marginBottom: 10,
    },
    sectionContent: {
      paddingHorizontal: 24,
      marginBottom: 14,
    },
    emptyCard: {
      borderRadius: 20,
      backgroundColor: C.CARD_BG,
      borderWidth: 1,
      borderColor: C.BORDER,
      padding: 16,
      alignItems: 'center',
      gap: 8,
      // Add shadow in light mode for depth
      shadowColor: C.CARD_SHADOW,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    emptyTitle: {
      fontFamily: FONT_HEADING_SEMI,
      fontSize: 15,
      color: C.TEXT,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontFamily: FONT_LATIN,
      fontSize: 12,
      color: C.TEXT2,
      textAlign: 'center',
      lineHeight: 18,
    },
    emptyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: C.JADE_DIM,
      borderWidth: 1,
      borderColor: C.PRIMARY,
    },
    emptyButtonText: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 13,
      color: C.PRIMARY,
      fontWeight: '600',
    },
  }), [C, insets.bottom]);

  return (
    <View style={{ flex: 1, backgroundColor: C.BG }}>
    <GhostLetters glyphs={['م', 'ح', 'ب']} />
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews
    >
      {/* Header */}
      <View style={{ paddingTop: insets.top }}>
        <HomeHeader userName={userName} onSettingsPress={onSettingsPress} />
      </View>

      {/* Streak Widget */}
      <View style={{ marginTop: 6 }}>
        <StreakWidget
          streakDays={streakDays}
          currentXP={totalXP}
          goalXP={goalXP}
          weekDays={weekDays}
          mood={streakMood}
          onComplete={() => {
            setStreakMood('celebrating');
            // Reset mood after celebration animation completes
            setTimeout(() => setStreakMood('happy'), 3000);
          }}
        />
      </View>

      {/* Quick Challenge Section */}
      <Text style={styles.sectionLabel}>Quick Challenge</Text>
      <View style={styles.sectionContent}>
        <QuickChallenge 
          onRevealed={() => setStreakMood('excited')} 
        />
      </View>

      {/* Mission Section */}
      <Text style={styles.sectionLabel}>Today&apos;s Mission</Text>
      <View style={styles.sectionContent}>
        {isNewUser ? (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
          >
            <View style={styles.emptyCard}>
              <Text style={{ fontSize: 40 }}>🦊</Text>
              <Text style={styles.emptyTitle}>{STRINGS.home.noProgressYet}</Text>
              <Text style={styles.emptySubtitle}>{STRINGS.home.newUserTip}</Text>
              <Pressable
                onPress={() => onMissionPress?.(featured.id)}
                style={({ pressed }) => [styles.emptyButton, pressed && { opacity: 0.7 }]}
                accessibilityRole="button"
                accessibilityLabel="Begin your first scenario"
              >
                <Text style={styles.emptyButtonText}>{STRINGS.home.beginScenario}</Text>
                <ChevronRight size={16} color={C.PRIMARY} />
              </Pressable>
            </View>
          </MotiView>
        ) : (
          <MissionCard
            scenarioTitle={featured.title}
            scenesCurrent={scenesCompletedForFeatured}
            scenesTotal={featured.decisions}
            hookLine={featured.subtitle}
            onPress={() => onMissionPress?.(featured.id)}
          />
        )}
      </View>

      {/* Daily Phrase Section */}
      <Text style={styles.sectionLabel}>Daily Phrase</Text>
      <View style={styles.sectionContent}>
        <DailyPhrase
          arabic={phraseOfTheDay.arabic}
          phonetic={phraseOfTheDay.roman}
          english={phraseOfTheDay.english}
          onPlay={() => speak(phraseOfTheDay.arabic)}
          onSave={() => toggleSavedPhrase(phraseOfTheDay.id)}
        />
      </View>

      {/* Weekly XP Section */}
      <Text style={styles.sectionLabel}>This Week</Text>
      <View style={styles.sectionContent}>
        {isNewUser ? (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
          >
            <View style={styles.emptyCard}>
              <Text style={{ fontSize: 32 }}>📊</Text>
              <Text style={styles.emptyTitle}>Your weekly stats will appear here</Text>
              <Text style={styles.emptySubtitle}>Complete a scenario or review phrases to start earning XP</Text>
            </View>
          </MotiView>
        ) : (
          <WeeklyXP
            days={weeklyXPDays}
            currentXP={weeklyTotal}
            goalXP={goalXP}
            xpToReward={Math.max(0, goalXP - weeklyTotal)}
          />
        )}
      </View>

      {/* Community Section */}
      <Text style={styles.sectionLabel}>Community</Text>
      <View style={styles.sectionContent}>
        {/* TODO: Replace with real count from API */}
        <CommunityBar count={47} location="Dubai" />
      </View>
    </ScrollView>
    </View>
  );
}
