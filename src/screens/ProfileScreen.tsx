import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Calendar, BookOpen, Circle, ChevronRight, MessageCircle, Check, Feather, LogOut, Sun, Moon, Monitor, Star, RotateCcw, CreditCard, Briefcase as CareerIcon, Users as SocialIcon } from '../components/icons';
import { FONT_LATIN, FONT_LATIN_SEMI, FONT_LATIN_MEDIUM, FONT_ARABIC, FONT_ARABIC_BLACK, FONT_HEADING, FONT_HEADING_SEMI, FONT_HEADING_EXTRA } from '../components/design/tokens';
import { SPACE, SCREEN_MARGIN, RADIUS } from '../components/design/spacing';
import { GhostLetters, Companion, Rule } from '../components/ui';
import { useTheme } from '../hooks/useTheme';
import { useCountUp } from '../components/design/hooks';
import { StatCard } from '../components/features/StatCard';
import { STRINGS } from '../constants/strings';
import { getNotificationPermissionStatus } from '../lib/notifications';
import { checkAuthBridge } from '../lib/syncService';
import * as Application from 'expo-application';
import { isLegalUrlSet, openLegal } from '../constants/legal';
import type { UserProfile, UserStats, LearningMilestone, JournalEntry, SubscriptionStatus } from '../types';
import { useAppStore } from '../store/useAppStore';

interface Props {
  user: UserProfile | null;
  stats: UserStats;
  milestones: LearningMilestone[];
  journal: JournalEntry[];
  subscriptionStatus?: SubscriptionStatus;
  // Optional, and guarded at their render sites: the whole block is omitted
  // when the handler is absent.
  onSignOut?: () => void;
  onDeleteAccount?: () => void;
  // Required. The subscription section always renders, and its rows draw a
  // chevron unconditionally. `Rule` degrades to a non-pressable View when it
  // gets no handler, so an optional callback here produces a row that looks
  // tappable and does nothing — the same failure the paywall had in c5520ac.
  // Making them required moves that from a silent runtime dud to a compile
  // error, which is the only place it can be caught reliably.
  onManageSubscription: () => void;
  onUpgrade: () => void;
  onRestorePurchases: () => void;
  isDeletingAccount?: boolean;
}

// Read from the build rather than hardcoded. This was '1.0' in two places,
// so the About row reported 1.0 through every release and support could not
// tell which build a user was on.
const APP_VERSION = Application.nativeApplicationVersion ?? '—';


export function ProfileScreen({ user, stats, milestones, journal, subscriptionStatus = 'free', onSignOut, onManageSubscription, onUpgrade, onRestorePurchases, onDeleteAccount, isDeletingAccount = false }: Props) {
  const { C, themePreference, setTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const streakCount = useCountUp(stats.currentStreak, 900, 100);
  const phrasesMastered = useCountUp(stats.phrasesMastered, 900, 200);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const analyticsEnabled = useAppStore((s) => s.analyticsEnabled);
  const setAnalyticsEnabled = useAppStore((s) => s.setAnalyticsEnabled);

  useEffect(() => {
    getNotificationPermissionStatus().then((status) => setNotificationsEnabled(status === 'granted'));
  }, []);
  const name = user?.name || STRINGS.profile.learner;

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

  // `as const` so `id` is the union setTheme takes, rather than `string` cast
  // back to it at the call site.
  const appearanceModes = useMemo(() => [
    { id: 'light', label: STRINGS.profile.appearanceModes.light, Icon: Sun },
    { id: 'dark', label: STRINGS.profile.appearanceModes.dark, Icon: Moon },
    { id: 'system', label: STRINGS.profile.appearanceModes.system, Icon: Monitor },
  ] as const, []);

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
    // Legal rows only appear once their URL is configured — a Privacy Policy
    // row that opens nothing is worse than no row. See src/constants/legal.ts.
    ...(isLegalUrlSet('privacy') ? [{
      label: STRINGS.legal.privacyPolicy,
      value: '',
      onPress: () => openLegal('privacy'),
    }] : []),
    ...(isLegalUrlSet('terms') ? [{
      label: STRINGS.legal.termsOfService,
      value: '',
      onPress: () => openLegal('terms'),
    }] : []),
    {
      label: STRINGS.profile.aboutFasih,
      value: STRINGS.profile.version(APP_VERSION),
      onPress: () => Alert.alert(STRINGS.profile.aboutFasih, STRINGS.profile.version(APP_VERSION)),
    },
    // Dev-only. This is the prerequisite check for enabling Row Level Security:
    // running `select auth.jwt()->>'sub'` in the Supabase SQL editor always
    // returns NULL because that connection carries no Clerk token, so the
    // check is only meaningful made from the signed-in app. Remove this row
    // once RLS is enabled and confirmed working.
    ...(__DEV__ ? [{
      label: 'Check database connection',
      value: 'Dev only',
      onPress: async () => {
        const { clerkUserId, jwtRole, error } = await checkAuthBridge();
        if (error) {
          Alert.alert(
            'Check failed',
            `${error}\n\nIf this says the function does not exist, run supabase/migrations/006_auth_check.sql first.`,
          );
          return;
        }
        if (!clerkUserId) {
          Alert.alert(
            'Not connected',
            'Supabase cannot see your Clerk identity, so it is not safe to enable Row Level Security yet.\n\nFinish steps 1 and 2 of the runbook (Clerk → Connect with Supabase, then Supabase → Third-Party Auth → Clerk) and check again.',
          );
          return;
        }
        Alert.alert(
          'Connected',
          `Supabase sees you as:\n\n${clerkUserId}\nrole: ${jwtRole ?? 'unknown'}\n\nThis is what needs to be true before enabling Row Level Security.`,
        );
      },
    }] : []),
  ], [notificationsEnabled]);

  return (
    <View style={{ flex: 1, backgroundColor: C.BG }}>
    <GhostLetters glyphs={['أ', 'ن', 'ا']} />
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: insets.top + SPACE.lg, paddingBottom: insets.bottom + 80, paddingHorizontal: SCREEN_MARGIN }} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={{ marginBottom: SPACE.xl }}>
        <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 24, color: C.TEXT }}>{STRINGS.profile.title}</Text>
      </View>

      {/* Identity. A monogram, a name, and a running head naming the mode —
          no raised card, no gradient tile, no shadow. */}
      <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400 }}>
        <View style={{
          paddingBottom: SPACE.xl,
          marginBottom: SPACE.xl,
          borderBottomWidth: 1,
          borderBottomColor: C.BORDER,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACE.lg, marginBottom: SPACE.xl }}>
            <Companion size={64} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT_HEADING_EXTRA, fontSize: 22, color: C.TEXT }}>{name}</Text>
              <Text style={{
                fontFamily: FONT_LATIN_MEDIUM,
                fontSize: 10,
                letterSpacing: 1.6,
                textTransform: 'uppercase',
                color: C.TEXT3,
                marginTop: SPACE.xs,
              }}>
                {getRoleLabel(user?.role || '') || STRINGS.profile.learner} · {user?.mode || 'Career'}
              </Text>
            </View>
          </View>

          {/* Summary stats */}
          <View style={{ flexDirection: 'row', gap: SPACE.xl }}>
            {summaryStats.map(({ value, label }) => (
              <View key={label}>
                <Text style={{
                  fontFamily: FONT_HEADING_EXTRA,
                  fontSize: 20,
                  color: C.TEXT,
                  fontVariant: ['tabular-nums'],
                }}>{value}</Text>
                <Text style={{
                  fontFamily: FONT_LATIN_MEDIUM,
                  fontSize: 9,
                  color: C.TEXT3,
                  textTransform: 'uppercase',
                  letterSpacing: 1.6,
                  marginTop: SPACE.xs,
                }}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
      </MotiView>

      {/* Stats */}
      <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 100 }}>
        <View style={{ flexDirection: 'row', gap: SPACE.lg, marginBottom: SPACE.xl }}>
          <StatCard icon={<Calendar size={18} strokeWidth={1.5} color={C.PRIMARY} />} value={streakCount} label={streakCount === 1 ? STRINGS.profile.dayLearning : STRINGS.profile.daysLearning} />
          <StatCard icon={<BookOpen size={18} strokeWidth={1.5} color={C.PRIMARY} />} value={phrasesMastered} label={STRINGS.profile.mastered} />
          <StatCard icon={<MessageCircle size={18} strokeWidth={1.5} color={C.PRIMARY} />} value={stats.scenariosCompleted.length} label={STRINGS.profile.scenarios} />
        </View>
      </MotiView>

      {/* Category Mastery */}
      {categories.length > 0 && (
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 150 }}>
          <Text style={{ fontFamily: FONT_HEADING, fontSize: 17, color: C.TEXT, marginBottom: 12 }}>{STRINGS.profile.skillAreas}</Text>
          {/* Ruled entries, not a raised card. The progress bar is the only
              mark that carries the accent; the hairline does the separating. */}
          <View style={{ marginBottom: SPACE.xl }}>
            {categories.map((cat, i) => {
              // Sadaf: one accent. Category is the label beside the bar, not a hue.
              const pct = cat.phrasesTotal > 0 ? Math.round((cat.phrasesStudied / cat.phrasesTotal) * 100) : 0;
              return (
                <Rule key={cat.category} first={i === 0}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACE.sm }}>
                    <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 12, color: C.TEXT1_5 }}>{cat.category}</Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, fontVariant: ['tabular-nums'] }}>
                      {cat.phrasesStudied}/{cat.phrasesTotal} · {STRINGS.profile.accuracy(cat.accuracy)}
                    </Text>
                  </View>
                  <View style={{ height: 2, backgroundColor: C.BORDER }}>
                    <MotiView
                      from={{ width: '0%' }}
                      animate={{ width: `${pct}%` }}
                      transition={{ type: 'timing', duration: 1000, delay: 300 + i * 100 }}
                      style={{ height: 2, backgroundColor: C.PRIMARY }}
                    />
                  </View>
                </Rule>
              );
            })}
          </View>
        </MotiView>
      )}

      {/* Goals */}
      {user?.goals && user.goals.length > 0 && (
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 200 }}>
          <Text style={{ fontFamily: FONT_HEADING, fontSize: 17, color: C.TEXT, marginBottom: 12 }}>{STRINGS.profile.yourGoals}</Text>
          {/* Labels, not chips — a goal is a read-only fact, not a control, so
              it gets no box. But the labels are multi-word ("Professional
              Growth", "Connect with Friends"), and set uppercase with wide
              tracking and only a gap between them they read as one run-on
              string. A middot does the delimiting the chip border used to,
              without spending a fill on it. This is why CEFR and type can be
              bare labels in PhraseEntry and these cannot: those are single
              words. */}
          <Text
            style={{
              fontFamily: FONT_LATIN_MEDIUM,
              fontSize: 10,
              letterSpacing: 1.6,
              lineHeight: 18,
              textTransform: 'uppercase',
              color: C.TEXT2,
              marginBottom: SPACE.xl,
            }}
          >
            {user.goals.map(getGoalLabel).join('  ·  ')}
          </Text>
        </MotiView>
      )}

      {/* Milestones */}
      <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 250 }}>
        <Text style={{ fontFamily: FONT_HEADING, fontSize: 17, color: C.TEXT, marginBottom: 12 }}>{STRINGS.profile.milestones}</Text>
        <View style={{ marginBottom: SPACE.xl }}>
          {milestones.map((m, i) => (
            <Rule key={m.id} first={i === 0}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACE.md }}>
                {m.reached
                  ? <Check size={16} strokeWidth={1.5} color={C.PRIMARY} />
                  : <Circle size={16} strokeWidth={1.5} color={C.TEXT3} />}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 14, color: m.reached ? C.TEXT : C.TEXT3 }}>{m.label}</Text>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, marginTop: SPACE.xs }}>{m.description}</Text>
                </View>
                {m.dateReached && (
                  <Text style={{
                    fontFamily: FONT_LATIN_MEDIUM,
                    fontSize: 10,
                    letterSpacing: 1.6,
                    textTransform: 'uppercase',
                    color: C.TEXT3,
                  }}>{m.dateReached}</Text>
                )}
              </View>
            </Rule>
          ))}
        </View>
      </MotiView>

      {/* Cultural Journal */}
      {journal.length > 0 && (
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 300 }}>
          <Text style={{ fontFamily: FONT_HEADING, fontSize: 17, color: C.TEXT, marginBottom: 12 }}>{STRINGS.profile.journal}</Text>
          {/* Ruled entries. The stacked cards each carried a shadow and a
              radius; the stagger they were revealed with is the list entrance
              animation §7 rules out. Arabic is ink here, not gold — the accent
              is spent on the mark beside it, not on the script. */}
          <View style={{ marginBottom: SPACE.xl }}>
            {journal.slice(0, 5).map((entry, i) => (
              <Rule key={entry.id} first={i === 0}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACE.sm, marginBottom: SPACE.sm }}>
                  <Feather size={12} strokeWidth={1.5} color={C.PRIMARY} />
                  <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 16, color: C.TEXT }}>{entry.arabic}</Text>
                  <Text style={{
                    fontFamily: FONT_LATIN_MEDIUM,
                    fontSize: 10,
                    letterSpacing: 1.6,
                    textTransform: 'uppercase',
                    color: C.TEXT3,
                    marginLeft: 'auto',
                  }}>{entry.date}</Text>
                </View>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT2, fontStyle: 'italic', marginBottom: SPACE.xs }}>{entry.english}</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, lineHeight: 18 }}>{entry.insight}</Text>
              </Rule>
            ))}
          </View>
        </MotiView>
      )}

      {/* Appearance */}
      <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 320 }}>
        <Text style={{ fontFamily: FONT_HEADING, fontSize: 17, color: C.TEXT, marginBottom: 12 }}>{STRINGS.profile.appearance}</Text>
        {/* An option grid, not a list — so these stay bordered buttons rather
            than becoming Rules. Flat, no fill: selection is the PRIMARY border
            and the PRIMARY label. The border width is constant, because
            thickening it on select shifted the label by a pixel. */}
        <View style={{ flexDirection: 'row', gap: SPACE.md, marginBottom: SPACE.xl }}>
          {appearanceModes.map(({ id, label, Icon }) => {
            const active = themePreference === id;
            return (
              <Pressable
                key={id}
                onPress={() => setTheme(id)}
                accessibilityRole="button"
                accessibilityLabel={`${label} theme`}
                accessibilityState={{ selected: active }}
                style={{
                  flex: 1,
                  paddingVertical: SPACE.lg,
                  borderRadius: RADIUS.flat,
                  borderWidth: 1,
                  borderColor: active ? C.PRIMARY : C.BORDER,
                  alignItems: 'center',
                  gap: SPACE.sm,
                }}
              >
                <Icon size={18} strokeWidth={1.5} color={active ? C.PRIMARY : C.TEXT3} />
                <Text style={{ fontFamily: active ? FONT_HEADING_EXTRA : FONT_HEADING_SEMI, fontSize: 12, color: active ? C.PRIMARY : C.TEXT3 }}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </MotiView>

      {/* Learning Mode Toggle */}
      <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 330 }}>
        <Text style={{ fontFamily: FONT_HEADING, fontSize: 17, color: C.TEXT, marginBottom: 12 }}>{STRINGS.profile.learningMode.title}</Text>
        <View style={{ flexDirection: 'row', gap: SPACE.md, marginBottom: SPACE.xl }}>
          {([
            { id: 'career', label: STRINGS.profile.learningMode.career, Icon: CareerIcon, desc: STRINGS.profile.learningMode.careerDesc },
            { id: 'social', label: STRINGS.profile.learningMode.social, Icon: SocialIcon, desc: STRINGS.profile.learningMode.socialDesc },
          ] as const).map(({ id, label, Icon, desc }) => {
            const active = user?.mode === id;
            return (
              <Pressable
                key={id}
                onPress={() => useAppStore.getState().setUserMode(id)}
                accessibilityRole="button"
                accessibilityLabel={`${label} mode`}
                accessibilityState={{ selected: active }}
                style={{
                  flex: 1,
                  paddingVertical: SPACE.lg,
                  borderRadius: RADIUS.flat,
                  borderWidth: 1,
                  borderColor: active ? C.PRIMARY : C.BORDER,
                  alignItems: 'center',
                  gap: SPACE.xs,
                }}
              >
                <Icon size={18} strokeWidth={1.5} color={active ? C.PRIMARY : C.TEXT3} />
                <Text style={{ fontFamily: active ? FONT_HEADING_EXTRA : FONT_HEADING_SEMI, fontSize: 12, color: active ? C.PRIMARY : C.TEXT3 }}>{label}</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: active ? C.TEXT2 : C.TEXT3 }}>{desc}</Text>
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
        <View style={{ flexDirection: 'row', gap: SPACE.md, marginBottom: SPACE.xl }}>
          {([
            { id: 'male', label: STRINGS.onboarding.genderMale, example: STRINGS.onboarding.genderMaleExample },
            { id: 'female', label: STRINGS.onboarding.genderFemale, example: STRINGS.onboarding.genderFemaleExample },
          ] as const).map(({ id, label, example }) => {
            const active = user?.gender === id;
            return (
              <Pressable
                key={id}
                onPress={() => useAppStore.getState().setUserGender(id)}
                accessibilityRole="radio"
                accessibilityLabel={label}
                accessibilityState={{ selected: active }}
                style={{
                  flex: 1,
                  paddingVertical: SPACE.lg,
                  borderRadius: RADIUS.flat,
                  borderWidth: 1,
                  borderColor: active ? C.PRIMARY : C.BORDER,
                  alignItems: 'center',
                  gap: SPACE.xs,
                }}
              >
                <Text style={{ fontFamily: active ? FONT_HEADING_EXTRA : FONT_HEADING_SEMI, fontSize: 12, color: active ? C.PRIMARY : C.TEXT3 }}>{label}</Text>
                <Text style={{ fontFamily: FONT_ARABIC, fontSize: 12, color: active ? C.TEXT2 : C.TEXT3 }}>{example}</Text>
              </Pressable>
            );
          })}
        </View>
      </MotiView>

      {/* Daily Goal */}
      <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 335 }}>
        <Text style={{ fontFamily: FONT_HEADING, fontSize: 17, color: C.TEXT, marginBottom: 12 }}>{STRINGS.profile.dailyGoal.title}</Text>
        <View style={{ flexDirection: 'row', gap: SPACE.md, marginBottom: SPACE.xl }}>
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
                  paddingVertical: SPACE.lg,
                  borderRadius: RADIUS.flat,
                  borderWidth: 1,
                  borderColor: active ? C.PRIMARY : C.BORDER,
                  alignItems: 'center',
                  gap: SPACE.xs,
                }}
              >
                <Text style={{ fontFamily: active ? FONT_HEADING_EXTRA : FONT_HEADING_SEMI, fontSize: 12, color: active ? C.PRIMARY : C.TEXT3 }}>{label}</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: active ? C.TEXT2 : C.TEXT3 }}>{sub}</Text>
              </Pressable>
            );
          })}
        </View>
      </MotiView>

      {/* Subscription */}
      <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 340 }}>
        <Text style={{ fontFamily: FONT_HEADING, fontSize: 17, color: C.TEXT, marginBottom: 12 }}>{STRINGS.profile.subscription.title}</Text>
        {/* Ruled rows. The gradient tile behind the star was a fill doing a
            job the icon already does, and the rounded card around the group
            was the radius the budget spends on the sheet. */}
        {subscriptionStatus === 'subscribed' ? (
          <View style={{ marginBottom: SPACE.xl }}>
            <Rule first>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACE.md }}>
                <Star size={18} strokeWidth={1.5} color={C.PRIMARY} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: C.TEXT }}>{STRINGS.profile.subscription.proName}</Text>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT3 }}>{STRINGS.profile.subscription.active}</Text>
                </View>
              </View>
            </Rule>
            <Rule onPress={onManageSubscription} accessibilityLabel={STRINGS.profile.subscription.manage}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACE.md }}>
                  <CreditCard size={16} strokeWidth={1.5} color={C.TEXT2} />
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT }}>{STRINGS.profile.subscription.manage}</Text>
                </View>
                <ChevronRight size={14} strokeWidth={1.5} color={C.TEXT3} />
              </View>
            </Rule>
            <Rule onPress={onRestorePurchases} accessibilityLabel={STRINGS.profile.subscription.restore}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACE.md }}>
                  <RotateCcw size={16} strokeWidth={1.5} color={C.TEXT2} />
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT }}>{STRINGS.profile.subscription.restore}</Text>
                </View>
                <ChevronRight size={14} strokeWidth={1.5} color={C.TEXT3} />
              </View>
            </Rule>
          </View>
        ) : (
          <View style={{ marginBottom: SPACE.xl }}>
            <Rule first onPress={onUpgrade} accessibilityLabel={STRINGS.profile.subscription.upgradeTitle}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACE.md }}>
                <Star size={18} strokeWidth={1.5} color={C.PRIMARY} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: C.TEXT }}>{STRINGS.profile.subscription.upgradeTitle}</Text>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT3 }}>{STRINGS.profile.subscription.upgradeDesc}</Text>
                </View>
                <ChevronRight size={14} strokeWidth={1.5} color={C.TEXT3} />
              </View>
            </Rule>
            <Rule onPress={onRestorePurchases} accessibilityLabel={STRINGS.profile.subscription.restore}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACE.md }}>
                  <RotateCcw size={16} strokeWidth={1.5} color={C.TEXT2} />
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT }}>{STRINGS.profile.subscription.restore}</Text>
                </View>
                <ChevronRight size={14} strokeWidth={1.5} color={C.TEXT3} />
              </View>
            </Rule>
          </View>
        )}
      </MotiView>

      {/* Account */}
      <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 350 }}>
        <Text style={{ fontFamily: FONT_HEADING, fontSize: 17, color: C.TEXT, marginBottom: 12 }}>{STRINGS.profile.account}</Text>
        {/* Genuinely a list, so these are Rules. Rows with no handler render
            as plain Views — the display-language row is informational and was
            previously a disabled Pressable pretending otherwise. */}
        <View>
          {accountItems.map(({ label, value, onPress }, i) => (
            <Rule key={label} first={i === 0} onPress={onPress} accessibilityLabel={label}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACE.md }}>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT }}>{label}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACE.sm }}>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT3 }}>{value}</Text>
                  {onPress && <ChevronRight size={14} strokeWidth={1.5} color={C.TEXT3} />}
                </View>
              </View>
            </Rule>
          ))}

          {/* The anonymous onboarding aggregate opt-out.
              Not a `Rule`: Rule hardcodes accessibilityRole="button", and a
              control whose state is the point has to announce as a switch with
              that state. It carries its own hairline instead. */}
          <Pressable
            onPress={() => setAnalyticsEnabled(!analyticsEnabled)}
            accessibilityRole="switch"
            accessibilityLabel={STRINGS.profile.analytics.title}
            accessibilityHint={STRINGS.profile.analytics.body}
            accessibilityState={{ checked: analyticsEnabled }}
            style={{
              paddingVertical: SPACE.lg,
              borderBottomWidth: 1,
              borderBottomColor: C.BORDER,
              gap: SPACE.sm,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACE.md }}>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT, flex: 1 }}>
                {STRINGS.profile.analytics.title}
              </Text>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: analyticsEnabled ? C.PRIMARY : C.TEXT3 }}>
                {analyticsEnabled ? STRINGS.profile.analytics.on : STRINGS.profile.analytics.off}
              </Text>
            </View>
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, lineHeight: 18, color: C.TEXT2 }}>
              {STRINGS.profile.analytics.body}
            </Text>
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, lineHeight: 18, color: C.TEXT3 }}>
              {STRINGS.profile.analytics.note}
            </Text>
          </Pressable>
        </View>
      </MotiView>

      {/* Sign Out */}
      {onSignOut && (
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 400, delay: 400 }}>
          <Pressable
            onPress={onSignOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACE.sm, marginTop: SPACE.xl, paddingVertical: SPACE.lg, borderRadius: RADIUS.flat, borderWidth: 1, borderColor: C.ERROR_BORDER }}
          >
            <LogOut size={16} strokeWidth={1.5} color={C.ERROR} />
            <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 14, color: C.ERROR }}>{STRINGS.profile.signOut}</Text>
          </Pressable>
        </MotiView>
      )}

      {/* Delete account — deliberately quieter than Sign Out. This is rare and
          irreversible, so it reads as a text link rather than a filled button
          that invites a mis-tap. */}
      {onDeleteAccount && (
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 400, delay: 440 }}>
          <Pressable
            onPress={onDeleteAccount}
            disabled={isDeletingAccount}
            accessibilityRole="button"
            accessibilityLabel={STRINGS.profile.deleteAccount.button}
            accessibilityState={{ disabled: isDeletingAccount }}
            style={{ alignItems: 'center', marginTop: SPACE.lg, paddingVertical: SPACE.md, opacity: isDeletingAccount ? 0.5 : 1 }}
          >
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT3, textDecorationLine: 'underline' }}>
              {isDeletingAccount ? STRINGS.profile.deleteAccount.deleting : STRINGS.profile.deleteAccount.button}
            </Text>
          </Pressable>
        </MotiView>
      )}
    </ScrollView>
    </View>
  );
}
