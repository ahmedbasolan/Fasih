import React, { useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IMAGES } from '../constants/images';
import { useTheme, FONT_LATIN_SEMI, FONT_HEADING_SEMI, FONT_LATIN } from '../theme';
import { GhostLetters, PrimaryButton } from '../components/ui';
import { MotiView } from 'moti';
import {
  HomeHeader,
  StreakWidget,
  StreakRiskBanner,
  QuickChallenge,
  MissionCard,
  DailyPhrase,
  SituationalConfidence,
} from '../components/home';
import { useAppStore } from '../store/useAppStore';
import { PHRASES } from '../constants/phrases';
import { getFeaturedScenario, getAllScenarios, filterScenariosForLearner } from '../constants/scenarios';
import { useArabicTTS } from '../hooks/useArabicTTS';
import { STRINGS } from '../constants/strings';
import { todayISO, addDays } from '../engine/srsEngine';
import { isStreakAtRisk } from '../engine/streakEngine';

interface HomeScreenNewProps {
  userName: string;
  onSettingsPress?: () => void;
  onMissionPress?: (missionId: string) => void;
}

// Derive week-day status from streak + lastActiveDate
function getWeekDays(streak: number, lastActiveDate: string | null): { label: string; status: 'done' | 'today' | 'future' }[] {
  const todayIso = todayISO();
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Consecutive streak window ending at the last active day (yesterday if the
  // user hasn't practiced today yet). Past days are only 'done' when they fall
  // inside this window — never display unearned checkmarks.
  const streakEnd = lastActiveDate ?? todayIso;
  const streakStart = addDays(streakEnd, -(Math.max(streak, 1) - 1));

  // Index of today within a Monday-first week: Mon=0 … Sun=6.
  // Deriving each cell's date from the Monday of *this* week is what makes the
  // Sunday column correct. The previous version compared JS day numbers
  // (Sun=0) against today's, so Sunday always tested as "in the past" and its
  // date was computed as a negative offset — i.e. last week's Sunday — which
  // rendered a checkmark for a day that had not happened yet.
  const todayIdx = (new Date().getDay() + 6) % 7;
  const monday = addDays(todayIso, -todayIdx);

  return days.map((label, idx) => {
    if (idx > todayIdx) return { label, status: 'future' };
    if (idx === todayIdx) return { label, status: 'today' };
    const date = addDays(monday, idx);
    return { label, status: date >= streakStart && date <= streakEnd ? 'done' : 'future' };
  });
}

// Phrase of the day — deterministic based on date
function getPhraseOfTheDay() {
  const today = new Date();
  const dayIndex = today.getDate() + today.getMonth() * 31;
  return PHRASES[dayIndex % PHRASES.length];
}

/** A different phrase each day for the recall challenge, offset from the
 *  phrase of the day so the two home cards never coincide. */
function getChallengePhrase() {
  const today = new Date();
  const dayIndex = today.getDate() + today.getMonth() * 31;
  return PHRASES[(dayIndex + Math.floor(PHRASES.length / 2)) % PHRASES.length];
}

export function HomeScreenNew({
  userName = 'there',
  onSettingsPress,
  onMissionPress,
}: HomeScreenNewProps) {
  const { C, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Real store data
  const user = useAppStore((s) => s.user);
  const stats = useAppStore((s) => s.stats);
  const completedScenarios = useAppStore((s) => s.completedScenarios);
  const lastActiveDate = useAppStore((s) => s.lastActiveDate);
  const toggleSavedPhrase = useAppStore((s) => s.toggleSavedPhrase);
  const streakFreezes = useAppStore((s) => s.streakFreezes);
  const dailyXP = useAppStore((s) => s.dailyXP);
  const spendStreakFreeze = useAppStore((s) => s.spendStreakFreeze);

  const { speak } = useArabicTTS();

  const [streakMood, setStreakMood] = useState<'happy' | 'excited' | 'celebrating'>('happy');

  // Derived data
  const streakDays = stats.currentStreak;
  // XP earned *today*, against today's goal. This used to be
  // scenariosCompleted.length * 50 — a lifetime total measured against a
  // per-day target, so the ring filled permanently after about ten scenarios
  // and never reset at midnight.
  const todayXP = dailyXP.date === todayISO() ? dailyXP.xp : 0;
  const goalXP = user?.dailyGoalXP ?? 500;
  const isNewUser = stats.daysActive === 0;
  const checklistTotal = 5;
  const checklistCompleted = user?.onboardingChecklist?.length ?? 0;
  const isStreakRisk = isStreakAtRisk(stats.currentStreak, lastActiveDate, todayISO()) && new Date().getHours() >= 18;

  const weekDays = useMemo(() => getWeekDays(streakDays, lastActiveDate), [streakDays, lastActiveDate]);

  // Featured scenario (first unlocked, uncompleted one for user's mode)
  const userMode = useAppStore((s) => s.user?.mode) || 'career';
  const userGender = useAppStore((s) => s.user?.gender);
  const sceneProgress = useAppStore((s) => s.sceneProgress);
  const featured = useMemo(() => {
    const all = filterScenariosForLearner(getAllScenarios(C), userGender);
    const modeMatch = all.filter((s) => s.mode === userMode && !s.locked && !s.comingSoon);
    // Pick first one not yet completed
    const uncompleted = modeMatch.find((s) => !completedScenarios[s.id]);
    return uncompleted ?? modeMatch[0] ?? getFeaturedScenario(C);
  // isDark is the stable bool that determines C — prevents recomputing on every render
  // since C is a new object reference each render but isDark only changes on theme switch.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark, userMode, userGender, completedScenarios]);

  const scenesCompletedForFeatured = sceneProgress[featured.id] ?? 0;

  // Phrase of the day
  const phraseOfTheDay = getPhraseOfTheDay();
  // A second, different phrase for the recall challenge — offset so the two
  // home cards never show the same phrase on the same day.
  const challengePhrase = getChallengePhrase();

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
    emptyMascot: {
      width: 48,
      height: 48,
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

      {/* Streak-at-risk banner */}
      {isStreakRisk && (
        <StreakRiskBanner
          streakDays={streakDays}
          freezesLeft={streakFreezes}
          onPracticeNow={() => onMissionPress?.(featured.id)}
          onUseFreeze={() => spendStreakFreeze()}
        />
      )}

      {/* HERO SECTION: Today's Mission (Primary CTA) */}
      <Text style={[styles.sectionLabel, { marginTop: 10 }]}>{STRINGS.homeSections.todaysMission}</Text>
      <View style={styles.sectionContent}>
        {isNewUser ? (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
          >
            <View style={styles.emptyCard}>
              <Image source={IMAGES.foxyMale} style={styles.emptyMascot} resizeMode="contain" />
              <Text style={styles.emptyTitle}>{STRINGS.home.noProgressYet}</Text>
              <Text style={styles.emptySubtitle}>{STRINGS.home.newUserTip}</Text>
              <PrimaryButton
                onPress={() => onMissionPress?.(featured.id)}
                accessibilityLabel={STRINGS.homeSections.beginFirstScenario}
                style={{ alignSelf: 'stretch', marginTop: 4 }}
              >
                {STRINGS.home.beginScenario}
              </PrimaryButton>
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

      {/* Streak Widget */}
      <View style={{ marginTop: 6 }}>
        <StreakWidget
          streakDays={streakDays}
          currentXP={todayXP}
          goalXP={goalXP}
          weekDays={weekDays}
          mood={streakMood}
          checklistCompleted={isNewUser ? checklistCompleted : undefined}
          checklistTotal={isNewUser ? checklistTotal : undefined}
          onComplete={() => {
            setStreakMood('celebrating');
            setTimeout(() => setStreakMood('happy'), 3000);
          }}
        />
      </View>

      {/* Quick Challenge Section */}
      <Text style={styles.sectionLabel}>{STRINGS.homeSections.quickChallenge}</Text>
      <View style={styles.sectionContent}>
        <QuickChallenge
          prompt={challengePhrase.english}
          answer={challengePhrase.arabic}
          roman={challengePhrase.roman}
          onRevealed={() => setStreakMood('excited')}
        />
      </View>

      {/* Daily Phrase Section */}
      <Text style={styles.sectionLabel}>{STRINGS.homeSections.dailyPhrase}</Text>
      <View style={styles.sectionContent}>
        <DailyPhrase
          arabic={phraseOfTheDay.arabic}
          phonetic={phraseOfTheDay.roman}
          english={phraseOfTheDay.english}
          onPlay={() => speak(phraseOfTheDay.arabic)}
          category={phraseOfTheDay.category}
          onSave={() => toggleSavedPhrase(phraseOfTheDay.id)}
        />
      </View>

      {/* Situational Confidence Section */}
      <Text style={styles.sectionLabel}>{STRINGS.homeSections.yourConfidence}</Text>
      <View style={styles.sectionContent}>
        <SituationalConfidence limit={5} />
      </View>

      {/* Community section intentionally not rendered.
          It read "47 expats in Dubai completed a scenario today" — an invented
          count and an invented city, shown to every user regardless of where
          they are, behind a "TODO: replace with real count from API" comment.
          There is no such API yet, so the card stated something false as fact.
          CommunityBar is still available and now requires real values; render
          it again once a genuine count exists. */}
    </ScrollView>
    </View>
  );
}
