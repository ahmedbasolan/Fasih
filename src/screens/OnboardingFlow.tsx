import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, AnimatePresence } from 'moti';
import Svg, { Circle, Path, Rect, Defs, Stop, LinearGradient as SvgLinearGradient, G as SvgG } from 'react-native-svg';
import { GestureDetector, Gesture, Directions } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { Briefcase, Users, Shield, TrendingUp, Globe, ChevronLeft, ArrowRight, Check, Bell, Star, Lock, Mic, BookOpen, Layers, Trophy, Sun, Moon, Zap, Flame, Sparkles } from '../components/icons';
import { FONT_ARABIC, FONT_LATIN, FONT_LATIN_BOLD, FONT_LATIN_SEMI, FONT_LATIN_MEDIUM, FONT_HEADING_SEMI, FONT_HEADING_EXTRA, ARABIC_SCALE } from '../components/design/tokens';
import { ANGLE_135 } from '../components/design/gradients';
import { GeoPattern } from '../components/design/GeoPattern';
import { HotelIcon, RetailIcon, RestaurantIcon, OfficeIcon, HealthcareIcon, DriverIcon, SecurityIcon, ProfessionalIcon, FriendsIcon, CultureIcon, DailyLifeIcon, CareerIcon } from '../components/features/RoleGoalIcons';
import { useTheme } from '../hooks/useTheme';
import { useTypewriter } from '../components/design/hooks';
import { useArabicTTS } from '../hooks/useArabicTTS';
import { KafMascot } from '../components/features/KafMascot';
import { STRINGS } from '../constants/strings';
import { FadeIn, ShimmerButton, SwitchButton, GhostLetters } from '../components/ui';
import type { UserProfile } from '../types';
import { useAppStore } from '../store/useAppStore';
import { OnboardingScenarioPlayer } from '../components/onboarding/OnboardingScenarioPlayer';
import { getOnboardingScenario, getScenarioScript } from '../constants/scenarios';
import { IMAGES } from '../constants/images';
import { computeOnboardingChecklist, computeDailyGoalXP } from '../engine/onboardingProgress';
import { useUser } from '@clerk/expo';
import { haptic } from '../lib/haptics';
import { PaywallSteps } from './onboarding/PaywallSteps';
import type { OnboardingStepProps } from './onboarding/types';


interface Props {
  onComplete: (profile: UserProfile) => void;
  onStartTrial: (plan: 'monthly' | 'yearly') => Promise<boolean>;
  onSkipTrial: () => void;
}

const PROFESSION_CATEGORIES = [
  {
    id: 'hospitality',
    label: STRINGS.onboarding.roles.hospitality,
    Icon: HotelIcon,
    professions: ['Hotel receptionist', 'Concierge', 'Bellboy', 'Housekeeping', 'Doorman'],
  },
  {
    id: 'food_beverage',
    label: STRINGS.onboarding.roles.food_beverage,
    Icon: RestaurantIcon,
    professions: ['Waiter / Waitress', 'Barista', 'Host / Hostess', 'Chef', 'Catering staff'],
  },
  {
    id: 'retail_sales',
    label: STRINGS.onboarding.roles.retail_sales,
    Icon: RetailIcon,
    professions: ['Sales associate', 'Cashier', 'Personal shopper', 'Store owner'],
  },
  {
    id: 'health_wellness',
    label: STRINGS.onboarding.roles.health_wellness,
    Icon: HealthcareIcon,
    professions: ['Pharmacy worker', 'Clinic receptionist', 'Nurse', 'Spa therapist', 'Personal trainer'],
  },
  {
    id: 'transport_logistics',
    label: STRINGS.onboarding.roles.transport_logistics,
    Icon: DriverIcon,
    professions: ['Taxi / Ride-share driver', 'Delivery driver', 'Airport employee', 'Ground staff', 'Valet'],
  },
  {
    id: 'property_facilities',
    label: STRINGS.onboarding.roles.property_facilities,
    Icon: SecurityIcon,
    professions: ['Security guard', 'Building security', 'Maintenance worker', 'Property agent', 'Facilities manager'],
  },
  {
    id: 'office_corporate',
    label: STRINGS.onboarding.roles.office_corporate,
    Icon: OfficeIcon,
    professions: ['Admin assistant', 'Receptionist', 'HR coordinator', 'Bank teller', 'Customer service'],
  },
  {
    id: 'education_childcare',
    label: STRINGS.onboarding.roles.education_childcare,
    Icon: ProfessionalIcon,
    professions: ['School teacher', 'Nursery worker', 'Tutor', 'School admin'],
  },
];

const goals = [
  { id: 'professional', label: STRINGS.onboarding.goals.professional.label, sub: STRINGS.onboarding.goals.professional.sub, Icon: ProfessionalIcon },
  { id: 'friends', label: STRINGS.onboarding.goals.friends.label, sub: STRINGS.onboarding.goals.friends.sub, Icon: FriendsIcon },
  { id: 'culture', label: STRINGS.onboarding.goals.culture.label, sub: STRINGS.onboarding.goals.culture.sub, Icon: CultureIcon },
  { id: 'daily', label: STRINGS.onboarding.goals.daily.label, sub: STRINGS.onboarding.goals.daily.sub, Icon: DailyLifeIcon },
  { id: 'career', label: STRINGS.onboarding.goals.career.label, sub: STRINGS.onboarding.goals.career.sub, Icon: CareerIcon },
];

function GhostBtn({ children, onPress }: { children: string; onPress?: () => void }) {
  const { C } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{ borderRadius: 16, paddingVertical: 16, alignItems: 'center', backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}
    >
      <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>{children}</Text>
    </Pressable>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  const { C } = useTheme();
  const insets = useSafeAreaInsets();
  const [segmentWidth, setSegmentWidth] = React.useState(0);
  return (
    <View
      onLayout={(e) => setSegmentWidth((e.nativeEvent.layout.width - 4 * (total - 1)) / total)}
      style={{ position: 'absolute', top: insets.top + 12, left: 24, right: 24, zIndex: 20, flexDirection: 'row', gap: 4 }}
      accessibilityLabel={`Step ${step + 1} of ${total}`}
      accessibilityRole="progressbar"
    >
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: C.SURFACE, overflow: 'hidden' }}>
          <MotiView
            animate={{ width: i <= step ? segmentWidth : 0 }}
            transition={{ type: 'timing', duration: 380, delay: i * 40 }}
            style={{ height: 4, borderRadius: 2, backgroundColor: i <= step ? C.PRIMARY : 'transparent' }}
          />
        </View>
      ))}
    </View>
  );
}

export function OnboardingFlow({ onComplete, onStartTrial, onSkipTrial }: Props) {
  const { C, G, isDark } = useTheme();
  const { setTheme, unlockPhrase } = useAppStore();
  const { speak } = useArabicTTS();
  const { user: clerkUser } = useUser();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');

  useEffect(() => {
    if (clerkUser?.firstName && !name) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(clerkUser.firstName);
    }
  }, [clerkUser, name]);
  const [mode, setMode] = useState<'career' | 'social'>('career');
  // Arabic marks the speaker's own gender, so we need this to teach the right
  // forms — it also gates scenarios that only work for one gender.
  const [gender, setGender] = useState<'male' | 'female' | undefined>(undefined);
  const [role, setRole] = useState('');
  const [profession, setProfession] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [holdProgress, setHoldProgress] = useState(0);
  const [holdComplete, setHoldComplete] = useState(false);
  const [phraseRevealed, setPhraseRevealed] = useState(false);
  const [phraseEverRevealed, setPhraseEverRevealed] = useState(false);
  const [scenarioCompleted, setScenarioCompleted] = useState(false);
  // Notification toggles for Step 6 — default all on to feel welcoming
  const [toggleNotifs, setToggleNotifs] = useState([true, true, true]);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStart = useRef(0);
  // Tracks which haptic milestones (33, 66, 100%) have already fired this hold
  const hapticMilestones = useRef<Set<number>>(new Set());
  
  const TOTAL = 12; // 0-6 setup, 7 quick win, 8 scenario, 9 paywall (timeline), 10 features, 11 paywall (plans)
  const HOLD_DURATION = 2200;

  // Compute Arabic greeting for name input
  const arabicGreeting = name.length === 0 ? '' : name.length < 3 ? 'أهـ' : name.length < 5 ? 'أهلاً' : `أهلاً وسهلاً ${name}`;
  
  // Character-by-character typewriter effect for Arabic
  const { displayed: typedGreeting } = useTypewriter(arabicGreeting, 80, 0);

  const finish = useCallback(() => {
    const onboardingChecklist = computeOnboardingChecklist({
      profession, goalsCount: selectedGoals.length, holdComplete, phraseRevealed: phraseEverRevealed, scenarioCompleted,
    });
    const dailyGoalXP = computeDailyGoalXP(selectedGoals.length, mode);
    onComplete({ name: name || 'Guest', mode, gender, role, profession, goals: selectedGoals, plan, onboardingChecklist, dailyGoalXP });
  }, [onComplete, name, mode, gender, role, profession, selectedGoals, plan, holdComplete, phraseEverRevealed, scenarioCompleted]);
  const finishWithTrial = useCallback(async () => {
    haptic.success();
    const shouldFinish = await onStartTrial(plan);
    if (shouldFinish) finish();
  }, [onStartTrial, plan, finish]);
  const next = useCallback(() => {
    haptic.light();
    if (step < TOTAL - 1) setStep(s => s + 1);
    else finishWithTrial();
  }, [step, finishWithTrial]);
  const back = useCallback(() => {
    if (step > 0) {
      haptic.light();
      setStep(s => s - 1);
    }
  }, [step]);
  const skip = useCallback(() => {
    Alert.alert(
      STRINGS.onboarding.skipWarningTitle,
      STRINGS.onboarding.skipWarningMessage,
      [
        {
          text: STRINGS.onboarding.skipWarningCancel,
          style: 'cancel',
        },
        {
          text: STRINGS.onboarding.skipWarningConfirm,
          onPress: () => {
            onSkipTrial();
            finish();
          },
        },
      ]
    );
  }, [onSkipTrial, finish]);

  const toggleGoal = (id: string) => {
    haptic.selection();
    setSelectedGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  const startHold = useCallback(() => {
    if (holdComplete) return;
    holdStart.current = Date.now();
    hapticMilestones.current = new Set();
    holdTimer.current = setInterval(() => {
      const elapsed = Date.now() - holdStart.current;
      const p = Math.min(elapsed / HOLD_DURATION, 1);
      setHoldProgress(p);
      // Fire haptic pulses at 33%, 66%, and 100%
      const pct = Math.round(p * 100);
      [33, 66, 100].forEach((milestone) => {
        if (pct >= milestone && !hapticMilestones.current.has(milestone)) {
          hapticMilestones.current.add(milestone);
          haptic.medium();
        }
      });
      if (p >= 1) {
        if (holdTimer.current) clearInterval(holdTimer.current);
        setHoldComplete(true);
        setTimeout(() => nextRef.current(), 700);
      }
    }, 16);
  }, [holdComplete]);

  const endHold = useCallback(() => {
    if (holdComplete) return;
    if (holdTimer.current) clearInterval(holdTimer.current);
    setHoldProgress(0);
  }, [holdComplete]);

  useEffect(() => {
    return () => { if (holdTimer.current) clearInterval(holdTimer.current); };
  }, []);

  const circum = 2 * Math.PI * 52;
  
  // -- Stable State Refs for Gestures --
  const stepRef = useRef(step);
  const nameRef = useRef(name);
  const genderRef = useRef(gender);
  const holdCompleteRef = useRef(holdComplete);
  const nextRef = useRef(next);
  const backRef = useRef(back);

  useEffect(() => {
    stepRef.current = step;
    nameRef.current = name;
    genderRef.current = gender;
    holdCompleteRef.current = holdComplete;
    nextRef.current = next;
    backRef.current = back;
  }, [step, name, gender, holdComplete, next, back]);

  useEffect(() => {
    setPhraseRevealed(false);
  }, [step]);

  // -- Swipe Gesture Logic (Memoized) --
  const composedGesture = useMemo(() => {
    const swipeNext = () => {
      // Block swiping next on steps that require explicit interaction
      if (stepRef.current === 2 && (!nameRef.current.trim() || !genderRef.current)) return;
      if (stepRef.current === 5 && !holdCompleteRef.current) return;
      nextRef.current();
    };

    const leftFling = Gesture.Fling()
      .direction(Directions.LEFT)
      .onEnd(() => {
        runOnJS(swipeNext)();
      });

    // Mirrors swipeNext: a plain JS closure that dereferences the ref when it
    // runs. `runOnJS(backRef.current)()` would read .current at the point the
    // gesture callback is constructed rather than inside the JS-thread call,
    // which is the kind of asymmetry that works until RNGH decides to treat
    // this callback as a worklet.
    const swipeBack = () => {
      backRef.current();
    };

    const rightFling = Gesture.Fling()
      .direction(Directions.RIGHT)
      .onEnd(() => {
        runOnJS(swipeBack)();
      });

    return Gesture.Exclusive(leftFling, rightFling);
    // Created once on purpose: next/back are reached through nextRef/backRef,
    // which are kept current by the effect above, so this closure never goes
    // stale and has no reactive dependencies to declare.
  }, []);

  // The contract every step component receives. Assembled once here so the
  // switch below reads as routing rather than as twelve different call shapes.
  const stepProps: OnboardingStepProps = {
    step,
    next,
    skip,
    finishWithTrial,
    draft: {
      name, setName, mode, setMode, gender, setGender, role, setRole,
      profession, setProfession, selectedGoals, toggleGoal, plan, setPlan,
      typedGreeting,
    },
    hold: { holdProgress, holdComplete, startHold, endHold, circum },
    quickWin: {
      phraseRevealed, setPhraseRevealed, setPhraseEverRevealed,
      setScenarioCompleted, toggleNotifs, setToggleNotifs,
    },
  };

  const renderStep = () => {
    switch (step) {
            case 0:
        return (
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            {/* Green gradient background - top half */}
            <LinearGradient
              colors={[...G.ONBOARDING_STOPS]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={{ flex: 1, minHeight: '55%', alignItems: 'center', justifyContent: 'center', paddingTop: insets.top + 40, paddingBottom: 56 }}
            >
              {/* Theme Toggle */}
              <FadeIn delay={50} style={{ position: 'absolute', top: insets.top + 16, right: 24, zIndex: 100 }}>
                <SwitchButton
                  value={isDark}
                  onToggle={() => setTheme(isDark ? 'light' : 'dark')}
                  iconOn={<Moon size={14} color={isDark ? C.WHITE : C.PRIMARY} />}
                  iconOff={<Sun size={14} color={isDark ? C.WHITE : C.PRIMARY} />}
                  backgroundColor={mode === 'career' ? C.JADE_ACCENT : C.VIOLET2}
                />
              </FadeIn>

              {/* Fox mascots on green gradient */}
              <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'row', gap: 12 }}>
                <FadeIn delay={200}>
                  <Image source={IMAGES.foxyMale} style={{ width: 130, height: 130 }} resizeMode="contain" />
                </FadeIn>
                <FadeIn delay={280}>
                  <Image source={IMAGES.foxyFemale} style={{ width: 130, height: 130 }} resizeMode="contain" />
                </FadeIn>
              </View>
            </LinearGradient>

            {/* White bottom section - raised higher */}
            <View style={{ backgroundColor: C.BG, borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -80, paddingHorizontal: 24, paddingTop: 36, paddingBottom: insets.bottom + 36, minHeight: '45%' }}>
              <FadeIn delay={300}>
                <View style={{ alignItems: 'flex-start', marginBottom: 16 }}>
                  <Text style={{ fontFamily: FONT_HEADING_EXTRA, fontSize: 28, color: C.TEXT, lineHeight: 36 }}>
                    Let&apos;s Begin{' '}<Text style={{ color: C.PRIMARY }}>Growing</Text>
                  </Text>
                  <Text style={{ fontFamily: FONT_HEADING_EXTRA, fontSize: 28, color: C.TEXT, lineHeight: 36 }}>
                    Our Skills.
                  </Text>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, marginTop: 8, lineHeight: 22 }}>
                    {STRINGS.onboarding.welcomeSubtitle}
                  </Text>
                </View>
              </FadeIn>

              {/* Intro text + Button */}
              <FadeIn delay={400}>
                <View style={{ gap: 16 }}>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, textAlign: 'center', lineHeight: 22 }}>
                    Master Gulf Arabic through interactive scenarios. Learn real phrases for work, social life, and daily conversations in the UAE.
                  </Text>
                  <Pressable onPress={next} accessibilityRole="button" accessibilityLabel="Get Started" style={{ width: '100%' }}>
                    <LinearGradient
                      colors={[...G.GOLD_STOPS]}
                      start={ANGLE_135.start}
                      end={ANGLE_135.end}
                      style={{ borderRadius: 100, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 15, color: C.BG }}>
                        Get Started
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </FadeIn>
            </View>
          </ScrollView>
        );

      case 1:
        return (
          <View style={{ flex: 1, paddingTop: insets.top + 80 }}>
            <FadeIn delay={100}>
              <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
                <Text style={{ fontFamily: FONT_HEADING_EXTRA, fontSize: 28, color: C.TEXT, marginBottom: 6 }}>{STRINGS.onboarding.choosePath}</Text>
                <Text style={{ fontFamily: FONT_LATIN_MEDIUM, fontSize: 15, color: C.TEXT2 }}>Select your primary focus</Text>
              </View>
            </FadeIn>

            <View style={{ flex: 1, paddingHorizontal: 24, gap: 16 }}>
              {[
                { id: 'career' as const, image: IMAGES.careerMode, Icon: Briefcase, title: STRINGS.onboarding.careerMode, sub: STRINGS.onboarding.careerSub, desc: STRINGS.onboarding.careerDesc, color: C.JADE_ACCENT },
                { id: 'social' as const, image: IMAGES.socialMode, Icon: Users, title: STRINGS.onboarding.socialMode, sub: STRINGS.onboarding.socialSub, desc: STRINGS.onboarding.socialDesc, color: C.VIOLET2 },
              ].map(({ id, image, Icon, title, sub, desc, color }, idx) => {
                const selected = mode === id;
                return (
                  <FadeIn key={id} delay={200 + idx * 100} style={{ flex: 1 }}>
                    <Pressable
                    onPress={() => { haptic.selection(); setMode(id); }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={title}
                    style={{ flex: 1, borderRadius: 28, overflow: 'hidden', borderWidth: 2, borderColor: selected ? color : C.BORDER }}
                  >
                      <Image source={image} style={{ position: 'absolute', width: '100%', height: '100%', opacity: selected ? 0.95 : 0.65 }} resizeMode="cover" accessibilityElementsHidden />
                      <LinearGradient colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.75)', 'rgba(0,0,0,0.95)', C.BG] as [string,string,string,string]} locations={[0, 0.4, 0.7, 1]} style={{ position: 'absolute', width: '100%', height: '100%' }} />
                      
                      <View style={{ flex: 1, padding: 24, justifyContent: 'flex-end' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', position: 'absolute', top: 20, left: 20, right: 20 }}>
                          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.4)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                            <Icon size={20} color={selected ? color : C.WHITE} />
                          </View>
                          <AnimatePresence>
                            {selected && (
                              <MotiView
                                from={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: 'timing', duration: 220 }}
                              >
                                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
                                  <Check size={16} color={C.INVERTED} />
                                </View>
                              </MotiView>
                            )}
                          </AnimatePresence>
                        </View>
                        
                        <MotiView animate={{ translateY: selected ? -4 : 0 }} transition={{ type: 'timing', duration: 220 }}>
                          <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 24, color: selected ? color : C.WHITE, marginBottom: 4, textShadowColor: 'rgba(0,0,0,0.95)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 }}>{title}</Text>
                          <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 13, color: 'rgba(255,255,255,0.9)', marginBottom: 8, letterSpacing: 0.5, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}>{sub}</Text>
                          <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>{desc}</Text>
                        </MotiView>
                      </View>
                    </Pressable>
                  </FadeIn>
                );
              })}
            </View>

            <FadeIn delay={400} style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: insets.bottom + 24 }}>
              <ShimmerButton onPress={next}>{STRINGS.common.continue}</ShimmerButton>
            </FadeIn>
          </View>
        );

      // Step 2: Name Input — consistent upward entrance
      case 2:
        return (
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: insets.top + 80, paddingBottom: insets.bottom + 24 }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', marginTop: 40, gap: 24 }}>
              <FadeIn delay={100}>
                <KafMascot size="md" mood="thinking" />
              </FadeIn>
              
              <FadeIn delay={200}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 24, color: C.TEXT, marginBottom: 6 }}>{STRINGS.onboarding.whatsYourName}</Text>
                  <Text style={{ fontFamily: FONT_LATIN_MEDIUM, fontSize: 14, color: C.TEXT2 }}>{STRINGS.onboarding.kafGreetingSub}</Text>
                </View>
              </FadeIn>

              <FadeIn delay={300} style={{ width: '100%' }}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder={STRINGS.onboarding.placeholderName}
                  placeholderTextColor={C.TEXT3}
                  accessibilityLabel="Your name"
                  autoCapitalize="words"
                  returnKeyType="done"
                  style={{
                    fontFamily: FONT_LATIN_SEMI,
                    fontSize: 18,
                    color: C.TEXT,
                    padding: 16,
                    borderRadius: 12,
                    backgroundColor: C.SURFACE,
                    borderWidth: 1,
                    borderColor: C.BORDER,
                    textAlign: 'center',
                  }}
                />
              </FadeIn>

              <FadeIn delay={380} style={{ width: '100%' }}>
                <View style={{ alignItems: 'center', gap: 10 }}>
                  <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 15, color: C.TEXT }}>
                    {STRINGS.onboarding.genderQuestion}
                  </Text>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT3, textAlign: 'center', lineHeight: 18 }}>
                    {STRINGS.onboarding.genderWhy}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                    {([
                      { value: 'male' as const, label: STRINGS.onboarding.genderMale, example: STRINGS.onboarding.genderMaleExample },
                      { value: 'female' as const, label: STRINGS.onboarding.genderFemale, example: STRINGS.onboarding.genderFemaleExample },
                    ]).map((opt) => {
                      const selected = gender === opt.value;
                      return (
                        <Pressable
                          key={opt.value}
                          onPress={() => { haptic.light(); setGender(opt.value); }}
                          accessibilityRole="radio"
                          accessibilityState={{ selected }}
                          accessibilityLabel={opt.label}
                          style={{
                            flex: 1,
                            minHeight: 72,
                            paddingVertical: 12,
                            paddingHorizontal: 10,
                            borderRadius: 14,
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4,
                            backgroundColor: selected ? C.JADE_ACCENT_DIM : C.SURFACE,
                            borderWidth: selected ? 1.5 : 1,
                            borderColor: selected ? C.JADE_ACCENT_BORDER : C.BORDER,
                          }}
                        >
                          <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: selected ? C.JADE_ACCENT : C.TEXT }}>
                            {opt.label}
                          </Text>
                          <Text style={{ fontFamily: FONT_ARABIC, fontSize: Math.round(13 * ARABIC_SCALE), color: selected ? C.JADE_ACCENT : C.TEXT3 }}>
                            {opt.example}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </FadeIn>

              <AnimatePresence>
                {typedGreeting && (
                  <FadeIn delay={0}>
                    <MotiView
                      key="greeting"
                      from={{ opacity: 0, translateY: 10 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'timing', duration: 380 }}
                      style={{ width: '100%' }}
                    >
                      <View style={{
                        width: '100%', borderRadius: 18, padding: 18,
                        backgroundColor: C.JADE_ACCENT_DIM, borderWidth: 1.5, borderColor: C.JADE_ACCENT_BORDER,
                        shadowColor: C.JADE_ACCENT, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 4,
                      }}>
                        <Text style={{ fontFamily: FONT_ARABIC, fontSize: Math.round(28 * ARABIC_SCALE), color: C.JADE_ACCENT, textAlign: 'center', marginBottom: 4, textShadowColor: C.JADE_ACCENT_SURFACE, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12 }}>{typedGreeting}</Text>
                        <Text style={{ fontFamily: FONT_LATIN_MEDIUM, fontSize: 12, color: C.TEXT2, textAlign: 'center' }}>
                          {name.length > 4 ? STRINGS.onboarding.welcomeName(name) : STRINGS.onboarding.keepTyping}
                        </Text>
                      </View>
                    </MotiView>
                  </FadeIn>
                )}
              </AnimatePresence>
            </View>

            <FadeIn delay={500}>
              <ShimmerButton onPress={next} disabled={!name.trim() || !gender}>{STRINGS.common.continue}</ShimmerButton>
            </FadeIn>
          </View>
        );

      // Step 3: Role Selection — clean 2-column grid layout
      case 3:
        return (
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: insets.top + 80, paddingBottom: insets.bottom + 24 }}>
            <FadeIn delay={100}>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 24, color: C.TEXT, marginBottom: 6 }}>{STRINGS.onboarding.whatsYourRole}</Text>
                <Text style={{ fontFamily: FONT_LATIN_MEDIUM, fontSize: 14, color: C.TEXT2 }}>{STRINGS.onboarding.roleTailored}</Text>
              </View>
            </FadeIn>

            <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, paddingBottom: 16 }}>
              {PROFESSION_CATEGORIES.map(({ id, label, Icon }, idx) => {
                const selected = role === id;
                const hasSelection = !!role;

                return (
                  <FadeIn key={id} delay={150 + idx * 50} style={{ width: '48%' }}>
                    <MotiView
                      animate={{ 
                        opacity: !hasSelection || selected ? 1 : 0.5,
                      }}
                      transition={{ type: 'timing', duration: 200 }}
                    >
                      <Pressable
                        onPress={() => { haptic.selection(); setRole(id); setProfession(''); }}
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                        accessibilityLabel={label}
                        style={{
                          height: 92,
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          gap: 8,
                          backgroundColor: selected ? C.JADE_SURFACE : C.SURFACE,
                          borderRadius: 20,
                          borderWidth: selected ? 2 : 1,
                          borderColor: selected ? C.JADE : C.BORDER,
                          overflow: 'hidden'
                        }}
                      >
                        {selected && (
                          <LinearGradient
                            colors={[C.JADE_SURFACE, 'transparent']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                          />
                        )}

                        <View style={{
                          width: 34,
                          height: 34,
                          borderRadius: 12,
                          backgroundColor: selected ? C.JADE : C.BORDER,
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Icon size={16} color={selected ? C.BG : C.TEXT2} />
                        </View>

                        <Text style={{
                          fontFamily: FONT_LATIN_SEMI,
                          fontSize: 12,
                          color: selected ? C.JADE2 : C.TEXT,
                          textAlign: 'center',
                        }} numberOfLines={1}>
                          {label}
                        </Text>
                      </Pressable>
                    </MotiView>
                  </FadeIn>
                );
              })}
            </ScrollView>

            {/* Profession chip tray — animates in when a category is selected */}
            <AnimatePresence>
              {!!role && (
                <MotiView
                  from={{ opacity: 0, translateY: 10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: 10 }}
                  transition={{ type: 'timing', duration: 300 }}
                  style={{ marginTop: 12, marginBottom: 4 }}
                >
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, marginBottom: 8 }}>
                    {STRINGS.onboarding.pickYourRole}
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {PROFESSION_CATEGORIES.find(c => c.id === role)?.professions.map(p => {
                      const chipSelected = profession === p;
                      return (
                        <Pressable
                          key={p}
                          onPress={() => setProfession(p)}
                          accessibilityRole="radio"
                          accessibilityState={{ selected: chipSelected }}
                          style={{
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            borderRadius: 20,
                            borderWidth: 1.5,
                            borderColor: chipSelected ? C.JADE_ACCENT : C.BORDER,
                            backgroundColor: chipSelected ? C.JADE_ACCENT_SURFACE : C.SURFACE,
                          }}
                        >
                          <Text style={{
                            fontFamily: FONT_LATIN,
                            fontSize: 13,
                            color: chipSelected ? C.JADE_ACCENT : C.TEXT2,
                          }}>
                            {p}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </MotiView>
              )}
            </AnimatePresence>

            <FadeIn delay={600}>
              <ShimmerButton onPress={next} disabled={!role || !profession}>{STRINGS.common.continue}</ShimmerButton>
            </FadeIn>
          </View>
        );

      // Step 4: Goals Selection — consistent upward entrance
      case 4:
        return (
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: insets.top + 80, paddingBottom: insets.bottom + 24, gap: 16 }}>
            <FadeIn delay={100}>
              <View>
                <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 24, color: C.TEXT, marginBottom: 6 }}>{STRINGS.onboarding.whatsDrivesYou}</Text>
                <Text style={{ fontFamily: FONT_LATIN_MEDIUM, fontSize: 14, color: C.TEXT2 }}>{STRINGS.onboarding.selectEverything}</Text>
              </View>
            </FadeIn>

            <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 16 }}>
              {goals.map(({ id, label, sub, Icon }, idx) => {
                const selected = selectedGoals.includes(id);
                return (
                  <FadeIn key={id} delay={200 + idx * 80}>
                    <Pressable
                      onPress={() => toggleGoal(id)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: selected }}
                      accessibilityLabel={label}
                      style={{
                        flexDirection: 'row', alignItems: 'center', gap: 12,
                        borderRadius: 16, padding: 14,
                        backgroundColor: selected ? C.JADE_SURFACE : C.SURFACE,
                        borderWidth: selected ? 2 : 1,
                        borderColor: selected ? C.JADE : C.BORDER,
                      }}
                    >
                      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: selected ? C.JADE_DIM : C.BORDER, alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={18} color={selected ? C.JADE2 : C.TEXT2} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: selected ? C.TEXT : C.TEXT2 }}>{label}</Text>
                        <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: selected ? C.TEXT2 : C.TEXT3 }}>{sub}</Text>
                      </View>
                      <View style={{
                        width: 26, height: 26, borderRadius: 13, borderWidth: 2,
                        borderColor: selected ? C.JADE2 : C.BORDER2,
                        backgroundColor: selected ? C.JADE2 : 'transparent',
                        alignItems: 'center', justifyContent: 'center'
                      }}>
                        <AnimatePresence>
                          {selected && (
                            <MotiView
                              from={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: 'timing', duration: 180 }}
                            >
                              <Check size={14} color={C.BG} />
                            </MotiView>
                          )}
                        </AnimatePresence>
                      </View>
                    </Pressable>
                  </FadeIn>
                );
              })}
            </ScrollView>

            <View>
              <AnimatePresence>
                {selectedGoals.length > 0 && (
                  <MotiView
                    key="goal-count"
                    from={{ opacity: 0, translateY: 6 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0, translateY: 6 }}
                    transition={{ type: 'timing', duration: 250 }}
                  >
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.JADE2, textAlign: 'center', marginBottom: 12 }}>
                      {STRINGS.onboarding.goalCount(selectedGoals.length)}
                    </Text>
                  </MotiView>
                )}
              </AnimatePresence>
              <FadeIn delay={600}>
                <ShimmerButton onPress={next} disabled={selectedGoals.length === 0}>{STRINGS.common.continue}</ShimmerButton>
              </FadeIn>
            </View>
          </View>
        );

      // Step 5: Commitment — consistent upward entrance
      case 5:
        return (
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: insets.top + 80, paddingBottom: insets.bottom + 24 }}>
            {/* Arabic geometric background pattern */}
            <GeoPattern opacity={0.035} color={C.JADE_ACCENT} size={48} />

            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 32 }}>
              <FadeIn delay={100} style={{ zIndex: 2 }}>
                <KafMascot size="md" mood={holdComplete ? 'happy' : 'idle'} />
              </FadeIn>

              <FadeIn delay={200} style={{ zIndex: 2 }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 22, color: C.TEXT, marginBottom: 8 }}>{STRINGS.onboarding.makeCommitment}</Text>
                  <Text style={{ fontFamily: FONT_LATIN_MEDIUM, fontSize: 14, color: C.TEXT2, textAlign: 'center' }}>
                    {holdComplete ? STRINGS.onboarding.committed : STRINGS.onboarding.commitmentSub}
                  </Text>
                </View>
              </FadeIn>

              <FadeIn delay={300} style={{ zIndex: 2 }}>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  {/* Outer ambient glow that grows with hold progress */}
                  <MotiView
                    animate={{ scale: 1 + holdProgress * 0.35, opacity: holdProgress * 0.18 }}
                    transition={{ type: 'timing', duration: 80 }}
                    style={{ position: 'absolute', width: 136, height: 136, borderRadius: 68, backgroundColor: C.JADE_ACCENT }}
                  />
                  <Svg width={136} height={136} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
                    {/* Outer glow ring */}
                    <Circle cx={68} cy={68} r={52} fill="none" stroke={C.JADE_ACCENT} strokeWidth={14} opacity={0.1} />
                    {/* Track ring */}
                    <Circle cx={68} cy={68} r={52} fill="none" stroke={C.SURFACE} strokeWidth={8} />
                    {/* Progress ring */}
                    <Circle cx={68} cy={68} r={52} fill="none"
                      stroke={holdComplete ? C.JADE2 : C.JADE_ACCENT} strokeWidth={8} strokeLinecap="round"
                      strokeDasharray={`${circum}`}
                      strokeDashoffset={`${circum * (1 - holdProgress)}`} />
                  </Svg>

                  <Pressable
                    onPressIn={startHold}
                    onPressOut={endHold}
                    accessibilityRole="button"
                    accessibilityLabel={holdComplete ? 'Commitment made' : 'Hold to commit'}
                    accessibilityHint={holdComplete ? undefined : 'Press and hold for 2 seconds to make your commitment'}
                    style={{ width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: holdComplete ? C.JADE2 : holdProgress > 0 ? C.JADE_ACCENT : C.BORDER2, overflow: 'hidden', zIndex: 2 }}
                  >
                    {holdComplete ? (
                      <MotiView from={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'timing', duration: 220 }}>
                        <LinearGradient colors={[...G.JADE_STOPS]} start={ANGLE_135.start} end={ANGLE_135.end} style={{ width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={34} color={C.BG} />
                        </LinearGradient>
                      </MotiView>
                    ) : holdProgress > 0 ? (
                      <LinearGradient colors={[...G.GOLD_STOPS]} start={ANGLE_135.start} end={ANGLE_135.end} style={{ width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 11, color: C.BG, letterSpacing: 1.2 }}>{Math.round(holdProgress * 100)}%</Text>
                      </LinearGradient>
                    ) : (
                      <View
                        style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 12, color: C.TEXT2, letterSpacing: 1.2 }}>{STRINGS.common.done}</Text>
                      </View>
                    )}
                  </Pressable>
                </View>
              </FadeIn>

              <AnimatePresence>
                {!holdComplete && (
                  <FadeIn delay={400} style={{ zIndex: 2 }}>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2, textAlign: 'center', lineHeight: 20 }}>
                      {STRINGS.onboarding.dailyHabit}
                    </Text>
                  </FadeIn>
                )}
              </AnimatePresence>
            </View>

            <AnimatePresence>
              {!holdComplete && (
                <FadeIn delay={500}>
                  <GhostBtn onPress={next}>{STRINGS.onboarding.skipForNow}</GhostBtn>
                </FadeIn>
              )}
            </AnimatePresence>
          </View>
        );

      // Step 6: Notifications
      case 6:
        return (
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: insets.top + 60, paddingBottom: insets.bottom + 24 }}>
            <View style={{ flex: 1, alignItems: 'center', gap: 20 }}>

              {/* Animated bell with expanding rings - moved higher */}
              <FadeIn delay={100}>
                <View style={{ alignItems: 'center', justifyContent: 'center', width: 140, height: 140, marginTop: 20 }}>
                  {/* Phone frame backdrop - smaller */}
                  <View style={{ position: 'absolute', width: 110, height: 140, alignItems: 'center' }}>
                    <Svg width={110} height={160} viewBox="0 0 160 230">
                      <Defs>
                        {/* Metallic bezel gradient */}
                        <SvgLinearGradient id="phoneBezel" x1="0%" y1="0%" x2="100%" y2="100%">
                          <Stop offset="0" stopColor={C.BORDER} />
                          <Stop offset="0.5" stopColor={C.SURFACE} />
                          <Stop offset="1" stopColor={C.BORDER} />
                        </SvgLinearGradient>
                        {/* Screen glass gradient */}
                        <SvgLinearGradient id="screenGlass" x1="0%" y1="0%" x2="0%" y2="100%">
                          <Stop offset="0" stopColor={C.BG} />
                          <Stop offset="1" stopColor={C.SURFACE} />
                        </SvgLinearGradient>
                        {/* Notification glass effect */}
                        <SvgLinearGradient id="notifGlass" x1="0%" y1="0%" x2="100%" y2="100%">
                          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.9} />
                          <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0.5} />
                        </SvgLinearGradient>
                      </Defs>

                      {/* Phone body bezel */}
                      <Rect x={10} y={0} width={140} height={230} rx={32} fill="url(#phoneBezel)" />
                      <Rect x={12} y={2} width={136} height={226} rx={30} fill={C.TEXT3} opacity={0.1} />

                      {/* Screen area */}
                      <Rect x={18} y={10} width={124} height={210} rx={24} fill="url(#screenGlass)" />

                      {/* Glass glare overlay */}
                      <Path
                        d="M18 60 L142 10 L142 50 L18 100 Z"
                        fill="#FFFFFF"
                        opacity={0.06}
                        pointerEvents="none"
                      />

                      {/* Dynamic Notch */}
                      <Rect x={55} y={18} width={50} height={6} rx={3} fill={C.TEXT3} opacity={0.6} />

                      {/* Floating Glass Notification */}
                      <SvgG transform="translate(14, 40)">
                        {/* Shadow */}
                        <Rect x={4} y={6} width={124} height={40} rx={12} fill="#000000" opacity={0.08} />
                        {/* Glass Body */}
                        <Rect x={0} y={0} width={132} height={40} rx={12} fill="url(#notifGlass)" />
                        <Rect x={0} y={0} width={132} height={40} rx={12} stroke="#FFFFFF" strokeWidth={1} />

                        {/* App Icon */}
                        <Circle cx={16} cy={20} r={8} fill={C.JADE_ACCENT} />
                        <Path d="M14 18 L18 22 M18 18 L14 22" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" />

                        {/* Text lines */}
                        <Rect x={32} y={14} width={70} height={4} rx={2} fill={C.TEXT} opacity={0.8} />
                        <Rect x={32} y={22} width={50} height={3} rx={1.5} fill={C.TEXT2} opacity={0.5} />

                        {/* Time label */}
                        <Rect x={110} y={14} width={12} height={3} rx={1} fill={C.TEXT3} opacity={0.4} />
                      </SvgG>
                    </Svg>
                  </View>
                  <View style={{ position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: C.JADE_ACCENT, opacity: 0.1 }} />
                  {/* Bell */}
                  <LinearGradient
                    colors={[...G.GOLD_STOPS]}
                    start={ANGLE_135.start}
                    end={ANGLE_135.end}
                    style={{ width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Bell size={28} color={C.BG} />
                  </LinearGradient>
                </View>
              </FadeIn>

              {/* Title & subtitle - moved up */}
              <FadeIn delay={200}>
                <View style={{ alignItems: 'center', gap: 6, marginTop: 10 }}>
                  <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 24, color: C.TEXT, textAlign: 'center' }}>Never miss a day</Text>
                  <Text style={{ fontFamily: FONT_LATIN_MEDIUM, fontSize: 14, color: C.TEXT2, textAlign: 'center' }}>Daily practice builds fluency 3× faster</Text>
                </View>
              </FadeIn>

              {/* Feature notification cards — elevated floating style */}
              <View style={{ width: '100%', gap: 12, marginTop: 10 }}>
                {([
                  { NotifIcon: Bell, text: 'Daily streak reminders', sub: 'Keep your learning momentum going' },
                  { NotifIcon: Star, text: 'New scenario alerts', sub: 'Discover fresh cultural scenarios' },
                  { NotifIcon: TrendingUp, text: 'Progress milestones', sub: 'Celebrate every achievement' },
                ] as const).map(({ NotifIcon, text, sub }, i) => (
                  <FadeIn key={text} delay={350 + i * 100}>
                    <Pressable
                      onPress={() => {
                        haptic.selection();
                        setToggleNotifs(prev => prev.map((v, idx) => idx === i ? !v : v));
                      }}
                      style={[{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 14,
                        borderRadius: 18,
                        padding: 16,
                        backgroundColor: isDark ? C.CARD_BG : C.WHITE,
                        borderWidth: 1,
                        borderColor: toggleNotifs[i] ? C.JADE_BORDER : C.BORDER,
                      }, {
                        shadowColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.07)',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 1,
                        shadowRadius: 12,
                        elevation: isDark ? 4 : 3,
                      }]}
                    >
                      {/* Icon badge */}
                      <View style={{
                        width: 44, height: 44, borderRadius: 14,
                        backgroundColor: toggleNotifs[i] ? C.JADE_ACCENT_DIM : C.SURFACE,
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <NotifIcon size={20} color={toggleNotifs[i] ? C.JADE_ACCENT : C.TEXT3} />
                      </View>

                      {/* Text block */}
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: C.TEXT, marginBottom: 2 }}>{text}</Text>
                        <Text style={{ fontFamily: FONT_LATIN_MEDIUM, fontSize: 12, color: C.TEXT2 }}>{sub}</Text>
                      </View>

                      {/* Animated toggle switch */}
                      <MotiView
                        animate={{ backgroundColor: toggleNotifs[i] ? C.JADE_ACCENT : C.BORDER }}
                        transition={{ type: 'timing', duration: 200 }}
                        style={{ width: 44, height: 26, borderRadius: 13, padding: 3, justifyContent: 'center' }}
                      >
                        <MotiView
                          animate={{ translateX: toggleNotifs[i] ? 18 : 0 }}
                          transition={{ type: 'timing', duration: 200 }}
                          style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: C.WHITE }}
                        />
                      </MotiView>
                    </Pressable>
                  </FadeIn>
                ))}
              </View>
            </View>

            {/* Buttons */}
            <View style={{ gap: 12, marginTop: 'auto' }}>
              <FadeIn delay={750}>
                <ShimmerButton onPress={next} Icon={Bell}>
                  Allow Notifications
                </ShimmerButton>
              </FadeIn>
              <FadeIn delay={850}>
                <Pressable onPress={next} accessibilityRole="button" style={{ paddingVertical: 12, alignItems: 'center' }}>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT3 }}>Maybe later</Text>
                </Pressable>
              </FadeIn>
            </View>
          </View>
        );

      // Step 7: Your first Arabic phrase quick win
      case 7:
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, backgroundColor: C.BG }}>
            {/* Mascot at top */}
            <Image
              source={IMAGES.foxyMale}
              style={{ width: 80, height: 80, marginBottom: 24 }}
              resizeMode="contain"
            />

            <Text style={{
              fontFamily: FONT_LATIN_SEMI,
              fontSize: 13,
              color: C.TEXT2,
              textAlign: 'center',
              marginBottom: 8,
            }}>
              Your first Gulf Arabic phrase:
            </Text>

            <Text style={{
              fontFamily: FONT_ARABIC,
              fontSize: Math.round(42 * ARABIC_SCALE),
              color: C.PRIMARY,
              textAlign: 'center',
              writingDirection: 'rtl',
              marginBottom: 6,
            }}>
              مرحبا
            </Text>

            <Text style={{
              fontFamily: FONT_LATIN_MEDIUM,
              fontSize: 14,
              color: C.TEXT2,
              marginBottom: 4,
            }}>
              mar-haba
            </Text>

            {!phraseRevealed ? (
              <Pressable
                onPress={() => {
                  setPhraseRevealed(true);
                  setPhraseEverRevealed(true);
                  speak('مرحبا');
                }}
                style={{
                  marginTop: 20,
                  paddingHorizontal: 28,
                  paddingVertical: 14,
                  borderRadius: 16,
                  backgroundColor: C.PRIMARY,
                }}
              >
                <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 15, color: C.BG, fontWeight: '700' }}>
                  Tap to hear it 🔊
                </Text>
              </Pressable>
            ) : (
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 300 }}
                style={{ alignItems: 'center', marginTop: 16 }}
              >
                <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 15, color: C.TEXT, textAlign: 'center', marginBottom: 24 }}>
                  Welcome – you just said it. ✨
                </Text>
                <Pressable
                  onPress={next}
                  style={{
                    paddingHorizontal: 28,
                    paddingVertical: 14,
                    borderRadius: 16,
                    backgroundColor: C.PRIMARY,
                  }}
                >
                  <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 15, color: C.BG, fontWeight: '700' }}>
                    Continue →
                  </Text>
                </Pressable>
              </MotiView>
            )}
          </View>
        );

      // Step 8: Onboarding Scenario — Café
      case 8: {
        const onboardingScenario = getOnboardingScenario(C);
        // Use the local mode state — user hasn't been saved to the store yet at this step
        const script = onboardingScenario ? getScenarioScript('onboarding-cafe', C, mode) : undefined;

        if (!script) {
          return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Loading...</Text></View>;
        }

        return (
          <OnboardingScenarioPlayer
            script={script}
            onComplete={(unlockedPhraseIds) => {
              // Store unlocked phrases in app store
              unlockedPhraseIds.forEach((phraseId) => {
                unlockPhrase(phraseId);
              });
              setScenarioCompleted(true);
              next();
            }}
          />
        );
      }

      // Steps 9-11: the paywall. See PaywallSteps -- next advances the three
      // screens, finishWithTrial subscribes, skip leaves without subscribing.
      case 9:
      case 10:
      case 11:
        return <PaywallSteps {...stepProps} />;

      default:
        return null;
    }
  };

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={{ flex: 1, backgroundColor: C.BG }}>
        <GhostLetters glyphs={['ب', 'د', 'أ']} />
        {step > 0 && step < 11 && <ProgressBar step={step} total={11} />}
        
        <AnimatePresence>
          {step > 0 && (
            <MotiView
              key="back-btn"
              from={{ opacity: 0, translateX: -10 }}
              animate={{ opacity: 1, translateX: 0 }}
              exit={{ opacity: 0, translateX: -10 }}
              transition={{ type: 'timing', duration: 250 }}
              style={{ position: 'absolute', top: insets.top + 24, left: 20, zIndex: 30 }}
            >
              <Pressable
                onPress={back}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ChevronLeft size={28} color={C.TEXT3} />
              </Pressable>
            </MotiView>
          )}
        </AnimatePresence>

        {renderStep()}
      </View>
    </GestureDetector>
  );
}
