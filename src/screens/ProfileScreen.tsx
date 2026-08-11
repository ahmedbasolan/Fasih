import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform, Linking, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, BookOpen, ChevronRight, Coffee, Building2, ShoppingBag, Utensils, Briefcase, Car, Shield, Activity, MessageCircle, Check, Feather, LogOut, Sun, Moon, Monitor, Star, RotateCcw, CreditCard, Briefcase as CareerIcon, Users as SocialIcon } from '../components/icons';
import { FONT_LATIN, FONT_LATIN_SEMI, FONT_ARABIC, FONT_ARABIC_BLACK, FONT_HEADING, FONT_HEADING_SEMI, FONT_HEADING_EXTRA } from '../components/design/tokens';
import { GhostLetters } from '../components/ui';
import { ANGLE_135 } from '../components/design/gradients';
import { useTheme } from '../hooks/useTheme';
import { useCountUp } from '../components/design/hooks';
import { StatCard } from '../components/features/StatCard';
import { getCategoryColors } from '../constants/phrases';
import { STRINGS } from '../constants/strings';
import { getNotificationPermissionStatus } from '../lib/notifications';
import type { UserProfile, UserStats, LearningMilestone, JournalEntry, SubscriptionStatus } from '../types';
import { useAppStore } from '../store/useAppStore';

interface Props {
  user: UserProfile | null;
  stats: UserStats;
  milestones: LearningMilestone[];
  journal: JournalEntry[];
  subscriptionStatus?: SubscriptionStatus;
  onSignOut?: () => void;
  onManageSubscription?: () => void;
  onUpgrade?: () => void;
  onRestorePurchases?: () => void;
}

const roleIcons: Record<string, React.ElementType> = {
  barista: Coffee, hotel: Building2, retail: ShoppingBag, restaurant: Utensils,
  office: Briefcase, healthcare: Activity, driver: Car, security: Shield,
};

export function ProfileScreen({ user, stats, milestones, journal, subscriptionStatus = 'free', onSignOut, onManageSubscription, onUpgrade, onRestorePurchases }: Props) {
  const { C, G, themePreference, setTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const streakCount = useCountUp(stats.currentStreak, 900, 100);
  const phrasesMastered = useCountUp(stats.phrasesMastered, 900, 200);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    getNotificationPermissionStatus().then((status) => setNotificationsEnabled(status === 'granted'));
  }, []);
  const name = user?.name || STRINGS.profile.learner;
  const RoleIcon = roleIcons[user?.role || ''] || Briefcase;
  const CATEGORY_COLORS = useMemo(() => getCategoryColors(C), [C]);

  const categories = Object.values(stats.categoryMastery);

  const getGoalLabel = (g: string) => {
    return (STRINGS.onboarding.goals as any)[g]?.label || g;
  };

  const getRoleLabel = (r: string) => {
    return (STRINGS.onboarding.roles as any)[r] || r;
  };

  const summaryStats = useMemo(() => [
    { value: stats.daysActive, label: STRINGS.profile.daysActive },
    { value: stats.phrasesStudied, label: STRINGS.profile.studied },
    { value: stats.phrasesMastered, label: STRINGS.profile.mastered },
    { value: stats.scenariosCompleted.length, label: STRINGS.profile.scenarios },
  ], [stats]);

  const appearanceModes = useMemo(() => [
    { id: 'light', label: STRINGS.profile.appearanceModes.light, Icon: Sun },
    { id: 'dark', label: STRINGS.profile.appearanceModes.dark, Icon: Moon },
    { id: 'system', label: STRINGS.profile.appearanceModes.system, Icon: Monitor },
  ], []);

  const accountItems = useMemo(() => [
    {
      label: STRINGS.profile.notifications,
      value: notificationsEnabled ? STRINGS.profile.enabled : STRINGS.profile.disabled,
      onPress: () => Linking.openSettings(),
    },
    {
      // No language switcher exists yet — English is the only option, so this
      // row is informational rather than tappable.
      label: STRINGS.profile.displayLanguage,
      value: 'English',
      onPress: undefined,
    },
    {
      label: STRINGS.profile.aboutFasih,
      value: STRINGS.profile.version('1.0'),
      onPress: () => Alert.alert(STRINGS.profile.aboutFasih, STRINGS.profile.version('1.0')),
    },
  ], [notificationsEnabled]);

  return (
    <View style={{ flex: 1, backgroundColor: C.BG }}>
    <GhostLetters glyphs={['أ', 'ن', 'ا']} />
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 80, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 24, color: C.TEXT }}>{STRINGS.profile.title}</Text>
      </View>

      {/* User Identity Card */}
      <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400 }}>
        <View style={{
          borderRadius: 24, padding: 24, marginBottom: 20, backgroundColor: C.CATEGORY_LAVENDER,
          ...Platform.select({
            ios: { shadowColor: C.PRIMARY, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 16 },
            android: { elevation: 4 },
          }),
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <LinearGradient
              colors={G.AVATAR_STOPS}
              start={ANGLE_135.start}
              end={ANGLE_135.end}
              style={{ width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
            >
              <RoleIcon size={26} color={C.WHITE} />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT_HEADING_EXTRA, fontSize: 22, color: C.PRIMARY_DARK }}>{name}</Text>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT_ON_LIGHT, textTransform: 'capitalize', marginTop: 2 }}>{getRoleLabel(user?.role || '') || STRINGS.profile.learner} · {user?.mode || 'Career'} focus</Text>
            </View>
          </View>

          {/* Summary stats */}
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {summaryStats.map(({ value, label }) => (
              <View key={label} style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: FONT_HEADING, fontSize: 20, color: C.PRIMARY_DARK }}>{value}</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 9, color: C.TEXT_ON_LIGHT, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
      </MotiView>

      {/* Stats cards */}
      <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 100 }}>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <StatCard icon={<Calendar size={18} color={C.PRIMARY} />} value={streakCount} label={streakCount === 1 ? STRINGS.profile.dayLearning : STRINGS.profile.daysLearning} color={C.PRIMARY} bg={C.CATEGORY_LAVENDER} />
          <StatCard icon={<BookOpen size={18} color={C.JADE} />} value={phrasesMastered} label={STRINGS.profile.mastered} color={C.JADE} bg={C.CATEGORY_MINT} />
          <StatCard icon={<MessageCircle size={18} color={C.VIOLET} />} value={stats.scenariosCompleted.length} label={STRINGS.profile.scenarios} color={C.VIOLET} bg={C.CATEGORY_PINK} />
        </View>
      </MotiView>

      {/* Category Mastery */}
      {categories.length > 0 && (
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 150 }}>
          <Text style={{ fontFamily: FONT_HEADING, fontSize: 17, color: C.TEXT, marginBottom: 12 }}>{STRINGS.profile.skillAreas}</Text>
          <View style={{
            borderRadius: 20, padding: 16, backgroundColor: C.CARD_BG, gap: 14, marginBottom: 20,
            ...Platform.select({
              ios: { shadowColor: C.CARD_SHADOW, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8 },
              android: { elevation: 2 },
            }),
          }}>
            {categories.map((cat: any, i) => {
              const color = CATEGORY_COLORS[cat.category] || C.PRIMARY;
              const pct = cat.phrasesTotal > 0 ? Math.round((cat.phrasesStudied / cat.phrasesTotal) * 100) : 0;
              return (
                <View key={cat.category}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 12, color: C.TEXT1_5 }}>{cat.category}</Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3 }}>
                      {cat.phrasesStudied}/{cat.phrasesTotal} · {STRINGS.profile.accuracy(cat.accuracy)}
                    </Text>
                  </View>
                  <View style={{ height: 8, borderRadius: 4, backgroundColor: C.SURFACE }}>
                    <MotiView
                      from={{ width: '0%' }}
                      animate={{ width: `${pct}%` }}
                      transition={{ type: 'timing', duration: 1000, delay: 300 + i * 100 }}
                      style={{ height: 8, borderRadius: 4, backgroundColor: color }}
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
          <Text style={{ fontFamily: FONT_HEADING, fontSize: 17, color: C.TEXT, marginBottom: 12 }}>{STRINGS.profile.yourGoals}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {user.goals.map(g => (
              <View key={g} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.CATEGORY_MINT }}>
                <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 12, color: C.JADE }}>{getGoalLabel(g)}</Text>
              </View>
            ))}
          </View>
        </MotiView>
      )}

      {/* Milestones */}
      <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 250 }}>
        <Text style={{ fontFamily: FONT_HEADING, fontSize: 17, color: C.TEXT, marginBottom: 12 }}>{STRINGS.profile.milestones}</Text>
        <View style={{
          borderRadius: 20, backgroundColor: C.CARD_BG, overflow: 'hidden', marginBottom: 20,
          ...Platform.select({
            ios: { shadowColor: C.CARD_SHADOW, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8 },
            android: { elevation: 2 },
          }),
        }}>
          {milestones.map((m, i) => (
            <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: i < milestones.length - 1 ? 1 : 0, borderBottomColor: C.BORDER, backgroundColor: m.reached ? C.CATEGORY_LAVENDER : 'transparent' }}>
              {m.reached && (
                <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: C.PRIMARY, borderTopLeftRadius: i === 0 ? 20 : 0 }} />
              )}
              <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: m.reached ? C.JADE_ACCENT_DIM : C.SURFACE, alignItems: 'center', justifyContent: 'center', opacity: m.reached ? 1 : 0.5 }}>
                {m.reached ? <Check size={14} color={C.PRIMARY} /> : <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.TEXT2 }} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 13, color: m.reached ? C.PRIMARY_DARK : C.TEXT2 }}>{m.label}</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: m.reached ? C.TEXT_ON_LIGHT : C.TEXT2, marginTop: 1 }}>{m.description}</Text>
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
          <Text style={{ fontFamily: FONT_HEADING, fontSize: 17, color: C.TEXT, marginBottom: 12 }}>{STRINGS.profile.journal}</Text>
          <View style={{ gap: 10, marginBottom: 20 }}>
            {journal.slice(0, 5).map((entry, i) => (
              <MotiView key={entry.id} from={{ opacity: 0, translateY: 6 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 250, delay: 350 + i * 60 }}>
                <View style={{
                  borderRadius: 16, padding: 14, backgroundColor: C.CARD_BG,
                  ...Platform.select({
                    ios: { shadowColor: C.CARD_SHADOW, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6 },
                    android: { elevation: 2 },
                  }),
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Feather size={12} color={C.PRIMARY} />
                    <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 16, color: C.PRIMARY }}>{entry.arabic}</Text>
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

      {/* Appearance */}
      <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 320 }}>
        <Text style={{ fontFamily: FONT_HEADING, fontSize: 17, color: C.TEXT, marginBottom: 12 }}>{STRINGS.profile.appearance}</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          {appearanceModes.map(({ id, label, Icon }) => {
            const active = themePreference === id;
            return (
              <Pressable
                key={id}
                onPress={() => setTheme(id as any)}
                accessibilityRole="button"
                accessibilityLabel={`${label} theme`}
                accessibilityState={{ selected: active }}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 16,
                  backgroundColor: active ? C.CATEGORY_LAVENDER : C.SURFACE,
                  borderWidth: active ? 2 : 1,
                  borderColor: active ? C.PRIMARY : C.BORDER,
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Icon size={18} color={active ? C.PRIMARY : C.TEXT3} />
                <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 12, color: active ? C.PRIMARY : C.TEXT3 }}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </MotiView>

      {/* Learning Mode Toggle */}
      <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 330 }}>
        <Text style={{ fontFamily: FONT_HEADING, fontSize: 17, color: C.TEXT, marginBottom: 12 }}>{STRINGS.profile.learningMode.title}</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          {[
            { id: 'career', label: STRINGS.profile.learningMode.career, Icon: CareerIcon, desc: STRINGS.profile.learningMode.careerDesc },
            { id: 'social', label: STRINGS.profile.learningMode.social, Icon: SocialIcon, desc: STRINGS.profile.learningMode.socialDesc },
          ].map(({ id, label, Icon, desc }) => {
            const active = user?.mode === id;
            return (
              <Pressable
                key={id}
                onPress={() => useAppStore.getState().setUserMode(id as 'career' | 'social')}
                accessibilityRole="button"
                accessibilityLabel={`${label} mode`}
                accessibilityState={{ selected: active }}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 16,
                  backgroundColor: active ? C.CATEGORY_LAVENDER : C.SURFACE,
                  borderWidth: active ? 2 : 1,
                  borderColor: active ? C.PRIMARY : C.BORDER,
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Icon size={18} color={active ? C.PRIMARY : C.TEXT3} />
                <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 12, color: active ? C.PRIMARY : C.TEXT3 }}>{label}</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: active ? C.TEXT_ON_LIGHT : C.TEXT3 }}>{desc}</Text>
              </Pressable>
            );
          })}
        </View>
      </MotiView>

      {/* Arabic Forms — Arabic marks the speaker's own gender, so this changes
          which phrasing we teach, and unlocks scenarios written for one gender. */}
      <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 332 }}>
        <Text style={{ fontFamily: FONT_HEADING, fontSize: 17, color: C.TEXT, marginBottom: 4 }}>{STRINGS.profile.arabicForms.title}</Text>
        <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT3, marginBottom: 12, lineHeight: 18 }}>{STRINGS.profile.arabicForms.subtitle}</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          {[
            { id: 'male', label: STRINGS.onboarding.genderMale, example: STRINGS.onboarding.genderMaleExample },
            { id: 'female', label: STRINGS.onboarding.genderFemale, example: STRINGS.onboarding.genderFemaleExample },
          ].map(({ id, label, example }) => {
            const active = user?.gender === id;
            return (
              <Pressable
                key={id}
                onPress={() => useAppStore.getState().setUserGender(id as 'male' | 'female')}
                accessibilityRole="radio"
                accessibilityLabel={label}
                accessibilityState={{ selected: active }}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 16,
                  backgroundColor: active ? C.CATEGORY_LAVENDER : C.SURFACE,
                  borderWidth: active ? 2 : 1,
                  borderColor: active ? C.PRIMARY : C.BORDER,
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 12, color: active ? C.PRIMARY : C.TEXT3 }}>{label}</Text>
                <Text style={{ fontFamily: FONT_ARABIC, fontSize: 12, color: active ? C.TEXT_ON_LIGHT : C.TEXT3 }}>{example}</Text>
              </Pressable>
            );
          })}
        </View>
      </MotiView>

      {/* Daily Goal */}
      <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 335 }}>
        <Text style={{ fontFamily: FONT_HEADING, fontSize: 17, color: C.TEXT, marginBottom: 12 }}>{STRINGS.profile.dailyGoal.title}</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          {[
            { xp: 250, label: STRINGS.profile.dailyGoal.casual, sub: STRINGS.profile.dailyGoal.casualSub },
            { xp: 500, label: STRINGS.profile.dailyGoal.regular, sub: STRINGS.profile.dailyGoal.regularSub },
            { xp: 750, label: STRINGS.profile.dailyGoal.intense, sub: STRINGS.profile.dailyGoal.intenseSub },
          ].map(({ xp, label, sub }) => {
            const active = (user?.dailyGoalXP ?? 500) === xp;
            return (
              <Pressable
                key={xp}
                onPress={() => useAppStore.getState().setDailyGoalXP(xp)}
                accessibilityRole="button"
                accessibilityLabel={`${label} daily goal`}
                accessibilityState={{ selected: active }}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 16,
                  backgroundColor: active ? C.CATEGORY_LAVENDER : C.SURFACE,
                  borderWidth: active ? 2 : 1,
                  borderColor: active ? C.PRIMARY : C.BORDER,
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 12, color: active ? C.PRIMARY : C.TEXT3 }}>{label}</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: active ? C.TEXT_ON_LIGHT : C.TEXT3 }}>{sub}</Text>
              </Pressable>
            );
          })}
        </View>
      </MotiView>

      {/* Subscription */}
      <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 340 }}>
        <Text style={{ fontFamily: FONT_HEADING, fontSize: 17, color: C.TEXT, marginBottom: 12 }}>{STRINGS.profile.subscription.title}</Text>
        {subscriptionStatus === 'subscribed' ? (
          <View style={{ borderRadius: 20, overflow: 'hidden', backgroundColor: C.CARD_BG }}>
            {/* Active badge */}
            <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: C.BORDER }}>
              <LinearGradient colors={G.AVATAR_STOPS} start={ANGLE_135.start} end={ANGLE_135.end} style={{ width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                <Star size={16} color={C.WHITE} />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: C.TEXT }}>{STRINGS.profile.subscription.proName}</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT3 }}>{STRINGS.profile.subscription.active}</Text>
              </View>
            </View>
            <Pressable
              onPress={onManageSubscription}
              accessibilityRole="button"
              accessibilityLabel="Manage subscription"
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: C.BORDER }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <CreditCard size={16} color={C.TEXT2} />
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT }}>{STRINGS.profile.subscription.manage}</Text>
              </View>
              <ChevronRight size={14} color={C.TEXT3} />
            </Pressable>
            <Pressable
              onPress={onRestorePurchases}
              accessibilityRole="button"
              accessibilityLabel="Restore purchases"
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <RotateCcw size={16} color={C.TEXT2} />
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT }}>{STRINGS.profile.subscription.restore}</Text>
              </View>
              <ChevronRight size={14} color={C.TEXT3} />
            </Pressable>
          </View>
        ) : (
          <View style={{ borderRadius: 20, overflow: 'hidden', backgroundColor: C.CARD_BG }}>
            <Pressable
              onPress={onUpgrade}
              accessibilityRole="button"
              accessibilityLabel="Upgrade to Fasih Pro"
              style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: C.BORDER }}
            >
              <LinearGradient colors={[C.CULTURAL_GOLD, C.CULTURAL_GOLD_DARK] as [string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                <Star size={16} color={C.WHITE} />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: C.TEXT }}>{STRINGS.profile.subscription.upgradeTitle}</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT3 }}>{STRINGS.profile.subscription.upgradeDesc}</Text>
              </View>
              <ChevronRight size={14} color={C.TEXT3} />
            </Pressable>
            <Pressable
              onPress={onRestorePurchases}
              accessibilityRole="button"
              accessibilityLabel="Restore purchases"
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <RotateCcw size={16} color={C.TEXT2} />
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT }}>{STRINGS.profile.subscription.restore}</Text>
              </View>
              <ChevronRight size={14} color={C.TEXT3} />
            </Pressable>
          </View>
        )}
      </MotiView>

      {/* Account */}
      <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 350 }}>
        <Text style={{ fontFamily: FONT_HEADING, fontSize: 17, color: C.TEXT, marginBottom: 12 }}>{STRINGS.profile.account}</Text>
        <View style={{
          borderRadius: 20, overflow: 'hidden', backgroundColor: C.CARD_BG,
          ...Platform.select({
            ios: { shadowColor: C.CARD_SHADOW, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8 },
            android: { elevation: 2 },
          }),
        }}>
          {accountItems.map(({ label, value, onPress }, i, arr) => (
            <Pressable
              key={label}
              onPress={onPress}
              disabled={!onPress}
              accessibilityRole={onPress ? 'button' : 'text'}
              accessibilityLabel={label}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: C.BORDER }}
            >
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT }}>{label}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT3 }}>{value}</Text>
                {onPress && <ChevronRight size={14} color={C.TEXT3} />}
              </View>
            </Pressable>
          ))}
        </View>
      </MotiView>

      {/* Sign Out */}
      {onSignOut && (
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 400, delay: 400 }}>
          <Pressable
            onPress={onSignOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, paddingVertical: 16, borderRadius: 16, backgroundColor: C.ERROR_SURFACE, borderWidth: 1, borderColor: C.ERROR_BORDER }}
          >
            <LogOut size={16} color={C.ERROR} />
            <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 14, color: C.ERROR }}>{STRINGS.profile.signOut}</Text>
          </Pressable>
        </MotiView>
      )}
    </ScrollView>
    </View>
  );
}
