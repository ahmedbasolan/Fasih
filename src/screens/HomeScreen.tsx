import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Calendar, BookOpen, Volume2, ChevronRight, Sparkles, MessageCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, FONT_ARABIC_BLACK, FONT_LATIN, FONT_LATIN_BOLD, FONT_LATIN_SEMI } from '../components/design/tokens';
import { GOLD_STOPS, ANGLE_135 } from '../components/design/gradients';
import { useCountUp } from '../components/design/hooks';
import { StatCard } from '../components/ui/StatCard';
import { QUICK_PRACTICE_PHRASES, CATEGORY_COLORS, PHRASE_CATEGORIES } from '../constants/phrases';
import { getFeaturedScenario } from '../constants/scenarios';
import { useArabicTTS } from '../hooks/useArabicTTS';
import type { UserProfile, UserStats } from '../types';

interface Props {
  user: UserProfile | null;
  stats: UserStats;
  dueReviewCount: number;
  onScenarioSelect: (id: string) => void;
  onPractice?: () => void;
}

export function HomeScreen({ user, stats, dueReviewCount, onScenarioSelect, onPractice }: Props) {
  const insets = useSafeAreaInsets();
  const streakCount = useCountUp(stats.currentStreak, 1000, 200);
  const phrasesStudied = useCountUp(stats.phrasesStudied, 900, 300);
  const phrasesMastered = useCountUp(stats.phrasesMastered, 900, 300);
  const { speak } = useArabicTTS();
  const [playingId, setPlayingId] = useState<string | null>(null);

  const featured = getFeaturedScenario();
  const name = user?.name || 'there';
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'صباح الخير' : hour < 18 ? 'مساء النور' : 'مساء الخير';
  const timeEn = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const isNewUser = stats.daysActive === 0 && stats.phrasesStudied === 0;

  const handlePlay = (phrase: { id: string; arabic: string }) => {
    setPlayingId(phrase.id);
    speak(phrase.arabic);
    setTimeout(() => setPlayingId(null), 3000);
  };

  // Compute overall mastery from category data
  const categories = Object.values(stats.categoryMastery);
  const overallAccuracy = categories.length > 0
    ? Math.round(categories.reduce((s, c) => s + c.accuracy, 0) / categories.length)
    : 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.BG }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 80, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting */}
      <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 100 }}>
        <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 30, color: C.GOLD, marginBottom: 2 }}>
          {timeGreeting}
        </Text>
        <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>
          {timeEn}, <Text style={{ color: C.TEXT, fontFamily: FONT_LATIN_SEMI }}>{name}</Text>
        </Text>
      </MotiView>

      {/* New user welcome banner */}
      {isNewUser && (
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 180 }}>
          <View style={{ borderRadius: 16, padding: 16, marginTop: 20, flexDirection: 'row', gap: 12, backgroundColor: C.GOLD_DIM, borderWidth: 1, borderColor: C.GOLD_BORDER }}>
            <Sparkles size={20} color={C.GOLD} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 14, color: C.GOLD, marginBottom: 4 }}>Welcome to Fasih!</Text>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, lineHeight: 18 }}>Begin with a cultural scenario below, or explore the phrase library to start learning.</Text>
            </View>
          </View>
        </MotiView>
      )}

      {/* Learning summary row */}
      <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 200 }}>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 24 }}>
          <StatCard icon={<Calendar size={18} color={C.GOLD} />} value={streakCount} label={streakCount === 1 ? 'day learning' : 'days learning'} color={C.GOLD} bg={C.GOLD_DIM} />
          <StatCard icon={<BookOpen size={18} color={C.JADE2} />} value={phrasesStudied} label="studied" color={C.JADE2} bg={C.JADE_DIM} />
          <StatCard icon={<MessageCircle size={18} color={C.VIOLET2} />} value={stats.scenariosCompleted.length} label="scenarios" color={C.VIOLET2} bg={C.VIOLET_DIM} />
        </View>
      </MotiView>

      {/* Review prompt */}
      {dueReviewCount > 0 && onPractice && (
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 250 }}>
          <Pressable onPress={onPractice} style={{ borderRadius: 16, padding: 16, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.JADE_DIM, borderWidth: 1, borderColor: C.JADE_BORDER }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(72,187,120,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} color={C.JADE2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 13, color: C.JADE2 }}>
                {dueReviewCount} phrase{dueReviewCount !== 1 ? 's' : ''} ready for review
              </Text>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT2, marginTop: 2 }}>Revisit phrases before you forget them</Text>
            </View>
            <ChevronRight size={16} color={C.JADE2} />
          </Pressable>
        </MotiView>
      )}

      {/* Featured Scenario */}
      <MotiView from={{ opacity: 0, translateY: 14 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 300 }}>
        <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 15, color: C.TEXT, marginBottom: 12 }}>Continue Learning</Text>

        <Pressable onPress={() => onScenarioSelect(featured.id)} style={{ borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(91,70,200,0.25)' }}>
          <LinearGradient colors={['#130B28', '#0D0618', '#1A102E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={{ padding: 20 }}>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: C.GOLD_DIM, borderWidth: 1, borderColor: C.GOLD_BORDER }}>
                  <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 10, color: C.GOLD }}>{featured.mode === 'career' ? 'Career' : 'Social'}</Text>
                </View>
                <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: C.SURFACE }}>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: C.TEXT3 }}>{featured.level}</Text>
                </View>
              </View>

              <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 20, color: C.TEXT, marginBottom: 4 }}>{featured.title}</Text>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2, lineHeight: 20, marginBottom: 16 }}>
                {featured.subtitle}. Practice real conversations and learn cultural nuance.
              </Text>

              <View style={{ flexDirection: 'row', gap: 24, marginBottom: 16 }}>
                {[[String(featured.decisions), 'decisions'], [String(featured.endings), 'outcomes'], [featured.phrases, 'phrases']].map(([v, l]) => (
                  <View key={l}>
                    <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 18, color: C.TEXT }}>{v}</Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: C.TEXT3 }}>{l}</Text>
                  </View>
                ))}
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: C.GOLD }}>Begin Scenario</Text>
                <ChevronRight size={16} color={C.GOLD} />
              </View>
            </View>
          </LinearGradient>
        </Pressable>
      </MotiView>

      {/* Category mastery */}
      <MotiView from={{ opacity: 0, translateY: 14 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 400 }}>
        <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 15, color: C.TEXT, marginTop: 24, marginBottom: 12 }}>Your Learning</Text>
        {isNewUser ? (
          <View style={{ borderRadius: 16, padding: 24, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER, alignItems: 'center', gap: 8 }}>
            <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 32, color: C.TEXT3 }}>٠</Text>
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT3, textAlign: 'center' }}>Practice phrases or complete a scenario to see your progress here</Text>
          </View>
        ) : (
          <View style={{ borderRadius: 16, padding: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER, gap: 14 }}>
            {PHRASE_CATEGORIES.map((cat, i) => {
              const mastery = stats.categoryMastery[cat];
              const studied = mastery?.phrasesStudied ?? 0;
              const total = mastery?.phrasesTotal ?? 0;
              const accuracy = mastery?.accuracy ?? 0;
              const color = CATEGORY_COLORS[cat] || C.TEXT2;
              const pct = total > 0 ? Math.round((studied / total) * 100) : 0;

              return (
                <View key={cat}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2 }}>{cat}</Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3 }}>{studied}/{total} phrases</Text>
                  </View>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)' }}>
                    <MotiView
                      from={{ width: '0%' }}
                      animate={{ width: `${pct}%` }}
                      transition={{ type: 'timing', duration: 1000, delay: 500 + i * 120 }}
                      style={{ height: 6, borderRadius: 3, backgroundColor: color }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </MotiView>

      {/* Quick Practice Phrases */}
      <MotiView from={{ opacity: 0, translateY: 14 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 500 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 }}>
          <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 15, color: C.TEXT }}>Listen & Learn</Text>
          {onPractice && (
            <Pressable onPress={onPractice} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 12, color: C.GOLD }}>Practice Mode</Text>
              <ChevronRight size={14} color={C.GOLD} />
            </Pressable>
          )}
        </View>

        <View style={{ gap: 10 }}>
          {QUICK_PRACTICE_PHRASES.map((phrase) => {
            const isPlaying = playingId === phrase.id;
            return (
              <Pressable key={phrase.id} onPress={() => handlePlay(phrase)} style={{ borderRadius: 16, padding: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 18, color: C.GOLD }}>{phrase.arabic}</Text>
                  <Pressable style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: isPlaying ? C.JADE_DIM : C.GOLD_DIM, alignItems: 'center', justifyContent: 'center' }}>
                    <Volume2 size={16} color={isPlaying ? C.JADE2 : C.GOLD} />
                  </Pressable>
                </View>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2, marginBottom: 4 }}>{phrase.roman}</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT3 }}>{phrase.english}</Text>
              </Pressable>
            );
          })}
        </View>
      </MotiView>
    </ScrollView>
  );
}
