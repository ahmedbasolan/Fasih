import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Calendar, BookOpen, ChevronRight, Settings, Coffee, Building2, ShoppingBag, Utensils, Briefcase, Car, Shield, Activity, MessageCircle, Check, Feather, LogOut } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, FONT_LATIN_BOLD, FONT_LATIN, FONT_LATIN_SEMI, FONT_ARABIC_BLACK } from '../components/design/tokens';
import { useCountUp } from '../components/design/hooks';
import { StatCard } from '../components/ui/StatCard';
import { CATEGORY_COLORS } from '../constants/phrases';
import type { UserProfile, UserStats, LearningMilestone, JournalEntry } from '../types';

interface Props {
  user: UserProfile | null;
  stats: UserStats;
  milestones: LearningMilestone[];
  journal: JournalEntry[];
  onSignOut?: () => void;
}

const roleIcons: Record<string, React.ElementType> = {
  barista: Coffee, hotel: Building2, retail: ShoppingBag, restaurant: Utensils,
  office: Briefcase, healthcare: Activity, driver: Car, security: Shield,
};

const goalLabels: Record<string, string> = {
  professional: 'Sound Professional', friends: 'Build Friendships', culture: 'Understand Culture',
  daily: 'Daily Life', career: 'Career Advancement',
};

export function ProfileScreen({ user, stats, milestones, journal, onSignOut }: Props) {
  const insets = useSafeAreaInsets();
  const streakCount = useCountUp(stats.currentStreak, 900, 100);
  const phrasesStudied = useCountUp(stats.phrasesStudied, 900, 200);
  const phrasesMastered = useCountUp(stats.phrasesMastered, 900, 200);
  const name = user?.name || 'Learner';
  const RoleIcon = roleIcons[user?.role || ''] || Briefcase;

  const reachedMilestones = milestones.filter(m => m.reached);
  const nextMilestone = milestones.find(m => !m.reached);
  const categories = Object.values(stats.categoryMastery);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.BG }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 80, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 24, color: C.TEXT }}>Profile</Text>
        <Pressable style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER, alignItems: 'center', justifyContent: 'center' }}>
          <Settings size={17} color={C.TEXT2} />
        </Pressable>
      </View>

      {/* User Identity Card */}
      <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400 }}>
        <LinearGradient colors={['#130A24', '#0A0516', '#190E2E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(200,145,58,0.2)' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: C.GOLD_DIM, borderWidth: 1.5, borderColor: C.GOLD_BORDER, alignItems: 'center', justifyContent: 'center' }}>
              <RoleIcon size={24} color={C.GOLD} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 22, color: C.TEXT }}>{name}</Text>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2, textTransform: 'capitalize', marginTop: 2 }}>{user?.role || 'Learner'} · {user?.mode || 'Career'} focus</Text>
            </View>
          </View>

          {/* Learning summary inside card */}
          <View style={{ flexDirection: 'row', gap: 20 }}>
            {[
              { value: stats.daysActive, label: 'days active' },
              { value: stats.phrasesStudied, label: 'studied' },
              { value: stats.phrasesMastered, label: 'mastered' },
              { value: stats.scenariosCompleted.length, label: 'scenarios' },
            ].map(({ value, label }) => (
              <View key={label} style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 18, color: C.TEXT }}>{value}</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 9, color: C.TEXT3, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>{label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </MotiView>

      {/* Gentle streak */}
      <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 100 }}>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <StatCard icon={<Calendar size={18} color={C.GOLD} />} value={streakCount} label={streakCount === 1 ? 'day learning' : 'days learning'} color={C.GOLD} bg={C.GOLD_DIM} />
          <StatCard icon={<BookOpen size={18} color={C.JADE2} />} value={phrasesMastered} label="mastered" color={C.JADE2} bg={C.JADE_DIM} />
          <StatCard icon={<MessageCircle size={18} color={C.VIOLET2} />} value={stats.scenariosCompleted.length} label="scenarios" color={C.VIOLET2} bg={C.VIOLET_DIM} />
        </View>
      </MotiView>

      {/* Category Mastery */}
      {categories.length > 0 && (
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 150 }}>
          <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 15, color: C.TEXT, marginBottom: 10 }}>Skill Areas</Text>
          <View style={{ borderRadius: 16, padding: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER, gap: 14, marginBottom: 20 }}>
            {categories.map((cat, i) => {
              const color = CATEGORY_COLORS[cat.category] || C.TEXT2;
              const pct = cat.phrasesTotal > 0 ? Math.round((cat.phrasesStudied / cat.phrasesTotal) * 100) : 0;
              return (
                <View key={cat.category}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2 }}>{cat.category}</Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3 }}>
                      {cat.phrasesStudied}/{cat.phrasesTotal} · {cat.accuracy}% accuracy
                    </Text>
                  </View>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)' }}>
                    <MotiView
                      from={{ width: '0%' }}
                      animate={{ width: `${pct}%` }}
                      transition={{ type: 'timing', duration: 1000, delay: 300 + i * 100 }}
                      style={{ height: 6, borderRadius: 3, backgroundColor: color }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </MotiView>
      )}

      {/* Goals */}
      {user?.goals && user.goals.length > 0 && (
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 200 }}>
          <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 15, color: C.TEXT, marginBottom: 10 }}>Your Goals</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {user.goals.map(g => (
              <View key={g} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: C.JADE_DIM, borderWidth: 1, borderColor: C.JADE_BORDER }}>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.JADE2 }}>{goalLabels[g] || g}</Text>
              </View>
            ))}
          </View>
        </MotiView>
      )}

      {/* Milestones */}
      <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 250 }}>
        <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 15, color: C.TEXT, marginBottom: 10 }}>Learning Milestones</Text>
        <View style={{ borderRadius: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER, overflow: 'hidden', marginBottom: 20 }}>
          {milestones.map((m, i) => (
            <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: i < milestones.length - 1 ? 1 : 0, borderBottomColor: C.BORDER, opacity: m.reached ? 1 : 0.4 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: m.reached ? C.JADE_DIM : 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: m.reached ? C.JADE_BORDER : C.BORDER, alignItems: 'center', justifyContent: 'center' }}>
                {m.reached ? <Check size={13} color={C.JADE2} /> : <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)' }} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 12, color: m.reached ? C.TEXT : C.TEXT3 }}>{m.label}</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginTop: 1 }}>{m.description}</Text>
              </View>
              {m.dateReached && (
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 9, color: C.TEXT3 }}>{m.dateReached}</Text>
              )}
            </View>
          ))}
        </View>
      </MotiView>

      {/* Cultural Journal */}
      {journal.length > 0 && (
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 300 }}>
          <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 15, color: C.TEXT, marginBottom: 10 }}>Cultural Journal</Text>
          <View style={{ gap: 10, marginBottom: 20 }}>
            {journal.slice(0, 5).map((entry, i) => (
              <MotiView key={entry.id} from={{ opacity: 0, translateY: 6 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 250, delay: 350 + i * 60 }}>
                <View style={{ borderRadius: 14, padding: 14, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Feather size={12} color={C.GOLD} />
                    <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 16, color: C.GOLD }}>{entry.arabic}</Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginLeft: 'auto' }}>{entry.date}</Text>
                  </View>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT2, fontStyle: 'italic', marginBottom: 4 }}>{entry.english}</Text>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, lineHeight: 18 }}>{entry.insight}</Text>
                </View>
              </MotiView>
            ))}
          </View>
        </MotiView>
      )}

      {/* Account */}
      <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 350 }}>
        <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 15, color: C.TEXT, marginBottom: 10 }}>Account</Text>
        <View style={{ borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.BORDER }}>
          {[['Notifications', 'Enabled'], ['Display Language', 'English'], ['About Fasih', 'v1.0']].map(([label, val], i, arr) => (
            <Pressable key={label} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'rgba(255,255,255,0.02)', borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: C.BORDER }}>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>{label}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT3 }}>{val}</Text>
                <ChevronRight size={14} color={C.TEXT3} />
              </View>
            </Pressable>
          ))}
        </View>
      </MotiView>

      {/* Sign Out */}
      {onSignOut && (
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 400, delay: 400 }}>
          <Pressable onPress={onSignOut} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, paddingVertical: 16, borderRadius: 16, backgroundColor: 'rgba(232,118,108,0.08)', borderWidth: 1, borderColor: 'rgba(232,118,108,0.2)' }}>
            <LogOut size={16} color="#E07070" />
            <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: '#E07070' }}>Sign Out</Text>
          </Pressable>
        </MotiView>
      )}
    </ScrollView>
  );
}
