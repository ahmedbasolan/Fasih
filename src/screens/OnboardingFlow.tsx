import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MotiView, AnimatePresence } from 'moti';
import Svg, { Circle, Path, Rect, Defs, Stop, LinearGradient as SvgLinearGradient, G as SvgG } from 'react-native-svg';
import { GestureDetector, Gesture, Directions } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { Briefcase, Users, Shield, TrendingUp, Globe, ChevronLeft, ArrowRight, Check, Bell, Star, Lock, Mic, BookOpen, Layers, Trophy, Sun, Moon, Zap, Flame, Sparkles } from 'lucide-react-native';
import { FONT_ARABIC, FONT_LATIN, FONT_LATIN_BOLD, FONT_LATIN_SEMI, FONT_HEADING_SEMI, FONT_HEADING_EXTRA } from '../components/design/tokens';
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

interface Props {
  onComplete: (profile: UserProfile) => void;
  onStartTrial: (plan: 'monthly' | 'yearly') => void;
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
      style={{ position: 'absolute', top: insets.top + 8, left: 24, right: 24, zIndex: 20, flexDirection: 'row', gap: 4 }}
      accessibilityLabel={`Step ${step + 1} of ${total}`}
      accessibilityRole="progressbar"
    >
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: C.SURFACE, overflow: 'hidden' }}>
          <MotiView
            animate={{ width: i <= step ? segmentWidth : 0 }}
            transition={{ type: 'spring', damping: 80, stiffness: 120, delay: i * 60 }}
            style={{ height: 4, borderRadius: 2, backgroundColor: i <= step ? C.PRIMARY : 'transparent' }}
          />
        </View>
      ))}
    </View>
  );
}

export function OnboardingFlow({ onComplete, onStartTrial, onSkipTrial }: Props) {
  const { C, G, isDark } = useTheme();
  const { setTheme, unlockPhrase, user } = useAppStore();
  const { speak } = useArabicTTS();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'career' | 'social'>('career');
  const [role, setRole] = useState('');
  const [profession, setProfession] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [holdProgress, setHoldProgress] = useState(0);
  const [holdComplete, setHoldComplete] = useState(false);
  const [phraseRevealed, setPhraseRevealed] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStart = useRef(0);
  
  const TOTAL = 12; // 0-9 onboarding steps + 10 scenario step + 11 paywall step
  const HOLD_DURATION = 2200;

  // Compute Arabic greeting for name input
  const arabicGreeting = name.length === 0 ? '' : name.length < 3 ? 'أهـ' : name.length < 5 ? 'أهلاً' : `أهلاً وسهلاً ${name}`;
  
  // Character-by-character typewriter effect for Arabic
  const { displayed: typedGreeting } = useTypewriter(arabicGreeting, 80, 0);

  const next = () => step < TOTAL - 1 ? setStep(s => s + 1) : finishWithTrial();
  const back = () => step > 0 && setStep(s => s - 1);
  const finish = () => onComplete({ name: name || 'Guest', mode, role, profession, goals: selectedGoals, plan });
  const finishWithTrial = () => { onStartTrial(plan); finish(); };
  const skip = () => { onSkipTrial(); finish(); };

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  const startHold = useCallback(() => {
    if (holdComplete) return;
    holdStart.current = Date.now();
    holdTimer.current = setInterval(() => {
      const elapsed = Date.now() - holdStart.current;
      const p = Math.min(elapsed / HOLD_DURATION, 1);
      setHoldProgress(p);
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
  const holdCompleteRef = useRef(holdComplete);
  const nextRef = useRef(next);

  useEffect(() => {
    stepRef.current = step;
    nameRef.current = name;
    holdCompleteRef.current = holdComplete;
    nextRef.current = next;
  }, [step, name, holdComplete, next]);

  useEffect(() => {
    setPhraseRevealed(false);
  }, [step]);

  // -- Swipe Gesture Logic (Memoized) --
  const composedGesture = useMemo(() => {
    const swipeNext = () => {
      // Block swiping next on steps that require explicit interaction
      if (stepRef.current === 2 && !nameRef.current.trim()) return;
      if (stepRef.current === 5 && !holdCompleteRef.current) return;
      nextRef.current();
    };

    const leftFling = Gesture.Fling()
      .direction(Directions.LEFT)
      .onEnd(() => {
        runOnJS(swipeNext)();
      });

    const rightFling = Gesture.Fling()
      .direction(Directions.RIGHT)
      .onEnd(() => {
        runOnJS(back)();
      });

    return Gesture.Exclusive(leftFling, rightFling);
  }, []); // Only create once

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
                  backgroundColor={mode === 'career' ? C.GOLD : C.VIOLET2}
                />
              </FadeIn>

              {/* Floating decorative particles */}
              {[
                { top: '12%', left: '8%', size: 5, color: 'rgba(255,255,255,0.3)', delay: 0, dur: 5000 },
                { top: '18%', right: '12%', size: 4, color: 'rgba(255,255,255,0.2)', delay: 800, dur: 4200 },
                { top: '55%', left: '5%', size: 6, color: 'rgba(255,255,255,0.25)', delay: 1600, dur: 6000 },
                { top: '65%', right: '8%', size: 4, color: 'rgba(255,255,255,0.2)', delay: 2400, dur: 4800 },
                { top: '38%', right: '6%', size: 5, color: 'rgba(255,255,255,0.3)', delay: 400, dur: 5500 },
              ].map((p, i) => (
                <MotiView
                  key={`particle-${i}`}
                  from={{ opacity: 0, translateY: 0 }}
                  animate={{ opacity: [0, 0.85, 0], translateY: [-8, 8, -8] }}
                  transition={{ type: 'timing', duration: p.dur, loop: true, delay: p.delay }}
                  style={{ position: 'absolute', top: p.top as any, left: (p as any).left, right: (p as any).right, width: p.size, height: p.size, borderRadius: p.size / 2, backgroundColor: p.color }}
                />
              ))}

              {/* Fox mascots on green gradient */}
              <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'row', gap: 12 }}>
                <FadeIn delay={150} style={{ position: 'absolute' }}>
                  <MotiView
                    from={{ opacity: 0.05, scale: 0.95 }}
                    animate={{ opacity: [0.05, 0.15, 0.05], scale: [0.95, 1.1, 0.95] }}
                    transition={{ type: 'timing', duration: 3500, loop: true }}
                    style={{ width: 260, height: 220, borderRadius: 62, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  />
                </FadeIn>

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
                      <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 15, color: C.WHITE }}>
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
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 15, color: C.TEXT2 }}>Select your primary focus</Text>
              </View>
            </FadeIn>

            <View style={{ flex: 1, paddingHorizontal: 24, gap: 16 }}>
              {[
                { id: 'career' as const, image: IMAGES.careerMode, Icon: Briefcase, title: STRINGS.onboarding.careerMode, sub: STRINGS.onboarding.careerSub, desc: STRINGS.onboarding.careerDesc, color: C.GOLD },
                { id: 'social' as const, image: IMAGES.socialMode, Icon: Users, title: STRINGS.onboarding.socialMode, sub: STRINGS.onboarding.socialSub, desc: STRINGS.onboarding.socialDesc, color: C.VIOLET2 },
              ].map(({ id, image, Icon, title, sub, desc, color }, idx) => {
                const selected = mode === id;
                return (
                  <FadeIn key={id} delay={200 + idx * 100} style={{ flex: 1 }}>
                    <Pressable
                    onPress={() => setMode(id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={title}
                    style={{ flex: 1, borderRadius: 28, overflow: 'hidden', borderWidth: 2, borderColor: selected ? color : C.BORDER }}
                  >
                      <Image source={image} style={{ position: 'absolute', width: '100%', height: '100%', opacity: selected ? 0.95 : 0.6 }} resizeMode="cover" accessibilityElementsHidden />
                      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.85)', C.BG] as [string,string,string,string]} locations={[0, 0.4, 0.7, 1]} style={{ position: 'absolute', width: '100%', height: '100%' }} />
                      
                      <View style={{ flex: 1, padding: 24, justifyContent: 'flex-end' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', position: 'absolute', top: 20, left: 20, right: 20 }}>
                          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                            <Icon size={20} color={selected ? color : C.WHITE} />
                          </View>
                          <AnimatePresence>
                            {selected && (
                              <MotiView
                                from={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: 'spring', damping: 80, stiffness: 100 }}
                              >
                                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
                                  <Check size={16} color={C.INVERTED} />
                                </View>
                              </MotiView>
                            )}
                          </AnimatePresence>
                        </View>
                        
                        <MotiView animate={{ translateY: selected ? -4 : 0 }} transition={{ type: 'spring', damping: 80, stiffness: 200 }}>
                          <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 24, color: selected ? color : C.WHITE, marginBottom: 4, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }}>{title}</Text>
                          <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 8, letterSpacing: 0.5 }}>{sub}</Text>
                          <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 20 }}>{desc}</Text>
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
                <KafMascot size="md" animate mood="thinking" />
              </FadeIn>
              
              <FadeIn delay={200}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 24, color: C.TEXT, marginBottom: 6 }}>{STRINGS.onboarding.whatsYourName}</Text>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>{STRINGS.onboarding.kafGreetingSub}</Text>
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

              <AnimatePresence>
                {typedGreeting && (
                  <FadeIn delay={0}>
                    <MotiView
                      key="greeting"
                      from={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.85, opacity: 0 }}
                      transition={{ type: 'spring', damping: 80, stiffness: 100 }}
                      style={{ width: '100%' }}
                    >
                      <View style={{ width: '100%', borderRadius: 16, padding: 16, backgroundColor: C.GOLD_DIM, borderWidth: 1, borderColor: C.GOLD_BORDER }}>
                        <Text style={{ fontFamily: FONT_ARABIC, fontSize: 26, color: C.GOLD, textAlign: 'center', marginBottom: 4, textShadowColor: C.GOLD_SURFACE, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12 }}>{typedGreeting}</Text>
                        <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, textAlign: 'center' }}>
                          {name.length > 4 ? STRINGS.onboarding.welcomeName(name) : STRINGS.onboarding.keepTyping}
                        </Text>
                      </View>
                    </MotiView>
                  </FadeIn>
                )}
              </AnimatePresence>
            </View>

            <FadeIn delay={500}>
              <ShimmerButton onPress={next} disabled={!name.trim()}>{STRINGS.common.continue}</ShimmerButton>
            </FadeIn>
          </View>
        );

      // Step 3: Role Selection — consistent upward entrance
      case 3:
        return (
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: insets.top + 80, paddingBottom: insets.bottom + 24 }}>
            <FadeIn delay={100}>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 24, color: C.TEXT, marginBottom: 6 }}>{STRINGS.onboarding.whatsYourRole}</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>{STRINGS.onboarding.roleTailored}</Text>
              </View>
            </FadeIn>

            <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 16 }}>
              {PROFESSION_CATEGORIES.map(({ id, label, Icon }, idx) => {
                const selected = role === id;
                const hasSelection = !!role;
                
                // Dynamic Bento Box Configuration
                const getBento = (i: number): { width: any, height: number, dir: 'row'|'column', align: 'center'|'flex-start', px: number } => {
                  switch(i) {
                    case 0: return { width: '100%', height: 100, dir: 'row', align: 'center', px: 24 };
                    case 3: return { width: '63%', height: 110, dir: 'row', align: 'flex-start', px: 20 };
                    case 4: return { width: '33%', height: 110, dir: 'column', align: 'center', px: 12 };
                    case 5: return { width: '33%', height: 110, dir: 'column', align: 'center', px: 12 };
                    case 6: return { width: '63%', height: 110, dir: 'row', align: 'flex-start', px: 20 };
                    case 7: return { width: '100%', height: 90, dir: 'row', align: 'center', px: 24 };
                    default: return { width: '47.5%', height: 120, dir: 'column', align: 'center', px: 16 };
                  }
                };
                const bento = getBento(idx);

                return (
                  <FadeIn key={id} delay={200 + idx * 80} style={{ width: bento.width }}>
                    <MotiView
                      animate={{ 
                        opacity: !hasSelection || selected ? 1 : 0.45,
                        scale: 1 // removed scaling to prevent overflow cutoff on 100% elements
                      }}
                      transition={{ type: 'spring', damping: 80, stiffness: 200 }}
                    >
                      <Pressable
                        onPress={() => { setRole(id); setProfession(''); }}
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                        accessibilityLabel={label}
                        style={{
                          height: bento.height,
                          flexDirection: bento.dir,
                          alignItems: 'center',
                          justifyContent: bento.align,
                          paddingHorizontal: bento.px,
                          gap: bento.dir === 'row' ? 16 : 12,
                          backgroundColor: selected ? C.GOLD_SURFACE : C.SURFACE,
                          borderRadius: 24,
                          borderWidth: selected ? 2 : 1,
                          borderColor: selected ? C.GOLD : C.BORDER,
                          overflow: 'hidden'
                        }}
                      >
                        {/* Gold gradient wash on selected */}
                        {selected && (
                          <LinearGradient
                            colors={[C.GOLD_SURFACE, 'transparent']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                          />
                        )}

                        <View style={{
                          width: bento.dir === 'row' ? 38 : 32,
                          height: bento.dir === 'row' ? 38 : 32,
                          borderRadius: 12,
                          backgroundColor: selected ? C.GOLD : C.BORDER,
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Icon size={bento.dir === 'row' ? 18 : 14} color={selected ? C.WHITE : C.TEXT2} />
                        </View>

                        <Text style={{
                          fontFamily: FONT_LATIN_BOLD,
                          fontSize: bento.dir === 'row' ? 14 : 11,
                          color: selected ? C.GOLD : C.TEXT,
                          textAlign: bento.dir === 'column' ? 'center' : 'left',
                          flexShrink: 1
                        }}>
                          {label}
                        </Text>

                        <AnimatePresence>
                          {selected && (
                            <MotiView
                              from={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: 'spring', damping: 12, stiffness: 260 }}
                              style={{ position: 'absolute', top: 10, right: 10 }}
                            >
                              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: C.GOLD, alignItems: 'center', justifyContent: 'center' }}>
                                <Check size={12} color={C.WHITE} />
                              </View>
                            </MotiView>
                          )}
                        </AnimatePresence>
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
                  transition={{ type: 'spring', damping: 20, stiffness: 200 }}
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
                            borderColor: chipSelected ? C.GOLD : C.BORDER,
                            backgroundColor: chipSelected ? C.GOLD_SURFACE : C.SURFACE,
                          }}
                        >
                          <Text style={{
                            fontFamily: FONT_LATIN,
                            fontSize: 13,
                            color: chipSelected ? C.GOLD : C.TEXT2,
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
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>{STRINGS.onboarding.selectEverything}</Text>
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
                        borderWidth: 1.5,
                        borderColor: selected ? C.JADE_BORDER : C.BORDER,
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
                              transition={{ type: 'spring', damping: 12, stiffness: 280 }}
                            >
                              <Check size={14} color={C.WHITE} />
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
                    transition={{ type: 'spring', damping: 30, stiffness: 100 }}
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
            <GeoPattern opacity={0.035} color={C.GOLD} size={48} />

            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 32 }}>
              <FadeIn delay={100} style={{ zIndex: 2 }}>
                <KafMascot size="md" animate mood={holdComplete ? 'happy' : 'idle'} />
              </FadeIn>

              <FadeIn delay={200} style={{ zIndex: 2 }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 22, color: C.TEXT, marginBottom: 8 }}>{STRINGS.onboarding.makeCommitment}</Text>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, textAlign: 'center' }}>
                    {holdComplete ? STRINGS.onboarding.committed : STRINGS.onboarding.commitmentSub}
                  </Text>
                </View>
              </FadeIn>

              <FadeIn delay={300} style={{ zIndex: 2 }}>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  {/* Pulsing hint ring when idle - simplified */}
                  {!holdComplete && holdProgress === 0 && (
                    <MotiView
                      from={{ scale: 1, opacity: 0.3 }}
                      animate={{ scale: 1.15, opacity: 0.1 }}
                      transition={{ type: 'spring', stiffness: 150, damping: 15, loop: true }}
                      style={{ position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: C.GOLD }}
                    />
                  )}
                  {/* Celebration burst on complete - simplified */}
                  {holdComplete && (
                    <MotiView
                      from={{ scale: 0.8, opacity: 0.6 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                      style={{ position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: C.JADE2 }}
                    />
                  )}
                  <Svg width={136} height={136} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
                    <Circle cx={68} cy={68} r={52} fill="none" stroke={C.SURFACE} strokeWidth={5} />
                    <Circle cx={68} cy={68} r={52} fill="none"
                      stroke={holdComplete ? C.JADE2 : C.GOLD} strokeWidth={5} strokeLinecap="round"
                      strokeDasharray={`${circum}`}
                      strokeDashoffset={`${circum * (1 - holdProgress)}`} />
                  </Svg>

                  <Pressable
                    onPressIn={startHold}
                    onPressOut={endHold}
                    accessibilityRole="button"
                    accessibilityLabel={holdComplete ? 'Commitment made' : 'Hold to commit'}
                    accessibilityHint={holdComplete ? undefined : 'Press and hold for 2 seconds to make your commitment'}
                    style={{ width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: holdComplete ? C.JADE2 : holdProgress > 0 ? C.GOLD : C.BORDER2, overflow: 'hidden', zIndex: 2 }}
                  >
                    {holdComplete ? (
                      <MotiView from={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 22, stiffness: 300 }}>
                        <LinearGradient colors={[...G.JADE_STOPS]} start={ANGLE_135.start} end={ANGLE_135.end} style={{ width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={34} color={C.WHITE} />
                        </LinearGradient>
                      </MotiView>
                    ) : holdProgress > 0 ? (
                      <LinearGradient colors={[...G.GOLD_STOPS]} start={ANGLE_135.start} end={ANGLE_135.end} style={{ width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 11, color: C.WHITE, letterSpacing: 1.2 }}>{Math.round(holdProgress * 100)}%</Text>
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
                        <Circle cx={16} cy={20} r={8} fill={C.GOLD} />
                        <Path d="M14 18 L18 22 M18 18 L14 22" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" />

                        {/* Text lines */}
                        <Rect x={32} y={14} width={70} height={4} rx={2} fill={C.TEXT} opacity={0.8} />
                        <Rect x={32} y={22} width={50} height={3} rx={1.5} fill={C.TEXT2} opacity={0.5} />

                        {/* Time label */}
                        <Rect x={110} y={14} width={12} height={3} rx={1} fill={C.TEXT3} opacity={0.4} />
                      </SvgG>
                    </Svg>
                  </View>
                  {/* Soft background glow */}
                  <MotiView
                    from={{ opacity: 0.06 }}
                    animate={{ opacity: [0.06, 0.18, 0.06] }}
                    transition={{ type: 'timing', duration: 3000, loop: true }}
                    style={{ position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: C.GOLD }}
                  />
                  {/* Expanding rings */}
                  {[0, 1, 2].map((i) => (
                    <MotiView
                      key={`ring-${i}`}
                      from={{ scale: 0.9, opacity: 0.55 }}
                      animate={{ scale: 2.4, opacity: 0 }}
                      transition={{ type: 'timing', duration: 2200, loop: true, delay: i * 730 }}
                      style={{ position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 1.5, borderColor: C.GOLD }}
                    />
                  ))}
                  {/* Jiggling bell - smaller */}
                  <MotiView
                    animate={{ rotate: ['0deg', '-9deg', '9deg', '-6deg', '6deg', '-2deg', '0deg'] }}
                    transition={{ type: 'timing', duration: 1500, loop: true, delay: 700 }}
                  >
                    <LinearGradient
                      colors={[...G.GOLD_STOPS]}
                      start={ANGLE_135.start}
                      end={ANGLE_135.end}
                      style={{ width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Bell size={28} color={C.BG} />
                    </LinearGradient>
                  </MotiView>
                </View>
              </FadeIn>

              {/* Title & subtitle - moved up */}
              <FadeIn delay={200}>
                <View style={{ alignItems: 'center', gap: 6, marginTop: 10 }}>
                  <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 24, color: C.TEXT, textAlign: 'center' }}>Never miss a day</Text>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, textAlign: 'center' }}>Daily practice builds fluency 3× faster</Text>
                </View>
              </FadeIn>

              {/* Feature list - moved higher */}
              <View style={{ width: '100%', gap: 10, marginTop: 10 }}>
                {([
                  { NotifIcon: Bell, text: 'Daily streak reminders' },
                  { NotifIcon: Star, text: 'New scenario alerts' },
                  { NotifIcon: TrendingUp, text: 'Progress milestones' },
                ] as const).map(({ NotifIcon, text }, i) => (
                  <FadeIn key={text} delay={350 + i * 100}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, padding: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
                      <View style={{ width: 32, height: 32, borderRadius: 12, backgroundColor: C.GOLD_DIM, alignItems: 'center', justifyContent: 'center' }}>
                        <NotifIcon size={16} color={C.GOLD} />
                      </View>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT }}>{text}</Text>
                    </View>
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

      // Step 7: Paywall — Unlock full potential
      case 7:
        return (
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: insets.top + 80, paddingBottom: insets.bottom + 24 }}>
            <FadeIn delay={100}>
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 24, color: C.TEXT, marginBottom: 6 }}>{STRINGS.onboarding.paywallTitle}</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>{STRINGS.onboarding.paywallSub}</Text>
              </View>
            </FadeIn>

            <View style={{ flex: 1, gap: 16 }}>
              {STRINGS.onboarding.timeline.map(({ day, title, desc }, i) => {
                const iconData = [
                  { Icon: Zap,      fill: true,  gradientColors: [C.JADE,          C.PRIMARY_DARK]         as [string, string] },
                  { Icon: Sparkles, fill: false, gradientColors: [C.JADE2,         C.JADE]                 as [string, string] },
                  { Icon: Flame,    fill: true,  gradientColors: [C.CULTURAL_GOLD, C.CULTURAL_GOLD_DARK]   as [string, string] },
                  { Icon: Lock,     fill: false, gradientColors: [C.NEUTRAL_600,   C.NEUTRAL_700]          as [string, string] },
                ][i];
                const labelColor = i === 0 ? C.GOLD : i === 1 ? C.JADE2 : i === 2 ? C.CULTURAL_GOLD : C.TEXT3;
                return (
                  <FadeIn key={day} delay={200 + i * 120}>
                    <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
                      <LinearGradient
                        colors={iconData.gradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                      >
                        <iconData.Icon size={22} color={C.WHITE} {...(iconData.fill ? { fill: C.WHITE } : {})} />
                      </LinearGradient>
                      <View style={{ flex: 1, paddingTop: 4 }}>
                        <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 11, color: labelColor, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 3 }}>{day}</Text>
                        <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 15, color: C.TEXT, marginBottom: 4 }}>{title}</Text>
                        <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2, lineHeight: 20 }}>{desc}</Text>
                      </View>
                    </View>
                  </FadeIn>
                );
              })}
            </View>

            <FadeIn delay={800}>
              <View style={{ gap: 8, width: '100%' }}>
                <ShimmerButton onPress={next} Icon={ArrowRight}>
                  {STRINGS.onboarding.startFreeTrial}
                </ShimmerButton>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, textAlign: 'center' }}>{STRINGS.onboarding.cancelAnytime}</Text>
                <Pressable onPress={skip} accessibilityRole="button" style={{ paddingVertical: 12, alignItems: 'center' }}>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2, textDecorationLine: 'underline' }}>{STRINGS.onboarding.skipForNow}</Text>
                </Pressable>
              </View>
            </FadeIn>
          </ScrollView>
        );

      // Step 8: Your first Arabic phrase quick win
      case 8:
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
              fontSize: 42,
              color: C.PRIMARY,
              textAlign: 'center',
              direction: 'rtl',
              marginBottom: 6,
            }}>
              مرحبا
            </Text>

            <Text style={{
              fontFamily: FONT_LATIN,
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
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
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

      // Step 9: Everything included — features
      case 9:
        return (
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: insets.top + 80, paddingBottom: insets.bottom + 24 }}>
            <FadeIn delay={100}>
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 24, color: C.TEXT, marginBottom: 6 }}>{STRINGS.onboarding.everythingIncluded}</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>{STRINGS.onboarding.oneSubscription}</Text>
              </View>
            </FadeIn>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              {STRINGS.onboarding.features.map(({ label, sub }, i) => {
                const featureData = [
                  { Icon: Mic,        gradientColors: [C.JADE,          C.PRIMARY_DARK]       as [string, string] },
                  { Icon: BookOpen,   gradientColors: [C.CULTURAL_GOLD, C.CULTURAL_GOLD_DARK] as [string, string] },
                  { Icon: Layers,     gradientColors: [C.JADE2,         C.JADE]               as [string, string] },
                  { Icon: Globe,      gradientColors: [C.ERROR,         C.ERROR]              as [string, string] },
                  { Icon: Trophy,     gradientColors: [C.VIOLET,        C.TERTIARY]           as [string, string] },
                  { Icon: TrendingUp, gradientColors: [C.JADE2,         C.JADE]               as [string, string] },
                ][i] || { Icon: Star, gradientColors: [C.JADE, C.PRIMARY_DARK]               as [string, string] };
                return (
                  <FadeIn key={label} delay={200 + i * 100} style={{ width: '47%' }}>
                    <View style={{ borderRadius: 16, padding: 16, gap: 10, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
                      <LinearGradient
                        colors={featureData.gradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <featureData.Icon size={20} color={C.WHITE} />
                      </LinearGradient>
                      <View>
                        <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 13, color: C.TEXT }}>{label}</Text>
                        <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, marginTop: 2 }}>{sub}</Text>
                      </View>
                    </View>
                  </FadeIn>
                );
              })}
            </View>

            <FadeIn delay={800}>
              <View style={{ borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.JADE_DIM, borderWidth: 1, borderColor: C.JADE_BORDER, marginBottom: 16 }}>
                <Shield size={17} color={C.JADE2} />
                <View>
                  <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 13, color: C.JADE2 }}>{STRINGS.onboarding.satisfactionGuarantee}</Text>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3 }}>{STRINGS.onboarding.refundPolicy}</Text>
                </View>
              </View>
            </FadeIn>

            <FadeIn delay={900}>
              <View style={{ width: '100%' }}>
                <ShimmerButton onPress={next} Icon={ArrowRight}>
                  {STRINGS.onboarding.seePlans}
                </ShimmerButton>
              </View>
            </FadeIn>
            
            <FadeIn delay={1000}>
              <Pressable onPress={skip} style={{ paddingVertical: 12, alignItems: 'center', marginTop: 4 }}>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT3, textDecorationLine: 'underline' }}>{STRINGS.onboarding.skipForNow}</Text>
              </Pressable>
            </FadeIn>
          </ScrollView>
        );

      // Step 10: Onboarding Scenario — Café
      case 10: {
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
              next();
            }}
          />
        );
      }

      // Step 11: Paywall — plans
      case 11:
        return (
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: insets.top + 80, paddingBottom: insets.bottom + 24 }}>
            <FadeIn delay={100}>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 24, color: C.TEXT, marginBottom: 6 }}>{STRINGS.onboarding.choosePlan}</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>{STRINGS.onboarding.trialCancel}</Text>
              </View>
            </FadeIn>

            <View style={{ gap: 12, marginBottom: 16 }}>
              {/* Yearly — consistent upward */}
              <FadeIn delay={200}>
                <Pressable
                  onPress={() => setPlan('yearly')}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: plan === 'yearly' }}
                  accessibilityLabel="Yearly plan, AED 16.6 per month"
                  style={{ borderRadius: 24, padding: 20, backgroundColor: plan === 'yearly' ? C.GOLD_DIM : C.SURFACE, borderWidth: 2, borderColor: plan === 'yearly' ? `${C.GOLD}70` : C.BORDER }}
                >
                  <View style={{ position: 'absolute', top: 16, right: 16, borderRadius: 8, overflow: 'hidden' }}>
                    <MotiView animate={{ scale: [1, 1.08, 1] }} transition={{ type: 'timing', duration: 2000, loop: true }}>
                      <LinearGradient colors={[...G.GOLD_STOPS]} start={ANGLE_135.start} end={ANGLE_135.end} style={{ paddingHorizontal: 10, paddingVertical: 4 }}>
                        <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 10, color: C.WHITE }}>{STRINGS.onboarding.savePct(57)}</Text>
                      </LinearGradient>
                    </MotiView>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingRight: 80 }}>
                    <MotiView
                      animate={{ scale: plan === 'yearly' ? [0.8, 1.2, 1] : 1 }}
                      transition={{ type: 'spring', damping: 10, stiffness: 200 }}
                      style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: plan === 'yearly' ? C.GOLD : C.BORDER2, alignItems: 'center', justifyContent: 'center' }}
                    >
                      {plan === 'yearly' && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.GOLD }} />}
                    </MotiView>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <Svg width={18} height={16} viewBox="0 0 24 20">
                          <Path d="M2 16 L5 6 L9 11 L12 2 L15 11 L19 6 L22 16 Z" fill={C.GOLD} opacity={0.85} />
                          <Path d="M3 17.5 L21 17.5" stroke={C.GOLD} strokeWidth={2} strokeLinecap="round" />
                        </Svg>
                        <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 16, color: C.TEXT }}>{STRINGS.onboarding.yearlyPlan}</Text>
                      </View>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginBottom: 8 }}>{STRINGS.onboarding.yearlyBest}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
                        <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 28, color: C.GOLD }}>AED 16.6</Text>
                        <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT3, paddingBottom: 4 }}>{STRINGS.onboarding.perMonth}</Text>
                      </View>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginTop: 2 }}>{STRINGS.onboarding.billingYearly('AED 199', 'AED 269')}</Text>
                    </View>
                  </View>
                </Pressable>
              </FadeIn>

              {/* Monthly — consistent upward */}
              <FadeIn delay={300}>
                <Pressable
                  onPress={() => setPlan('monthly')}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: plan === 'monthly' }}
                  accessibilityLabel="Monthly plan, AED 39 per month"
                  style={{ borderRadius: 24, padding: 20, backgroundColor: plan === 'monthly' ? C.VIOLET_DIM : C.SURFACE, borderWidth: 2, borderColor: plan === 'monthly' ? `${C.VIOLET}60` : C.BORDER }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <MotiView
                      animate={{ scale: plan === 'monthly' ? [0.8, 1.2, 1] : 1 }}
                      transition={{ type: 'spring', damping: 10, stiffness: 200 }}
                      style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: plan === 'monthly' ? C.VIOLET2 : C.BORDER2, alignItems: 'center', justifyContent: 'center' }}
                    >
                      {plan === 'monthly' && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.VIOLET2 }} />}
                    </MotiView>
                    <View>
                      <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 16, color: C.TEXT, marginBottom: 2 }}>{STRINGS.onboarding.monthlyPlan}</Text>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginBottom: 8 }}>{STRINGS.onboarding.monthlyFlex}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
                        <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 28, color: C.TEXT }}>AED 39</Text>
                        <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT3, paddingBottom: 4 }}>{STRINGS.onboarding.perMonth}</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              </FadeIn>

              {/* Features included — consistent upward */}
              <FadeIn delay={400}>
                <View style={{ borderRadius: 16, padding: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
                  {STRINGS.onboarding.features.slice(0, 4).map((f, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}>
                      <Check size={13} color={C.JADE2} />
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2 }}>{f.label}</Text>
                    </View>
                  ))}
                </View>
              </FadeIn>
            </View>

            <FadeIn delay={600}>
              <View style={{ gap: 8, marginTop: 16, width: '100%' }}>
                <ShimmerButton onPress={finishWithTrial} Icon={ArrowRight}>
                  {STRINGS.onboarding.startFreeTrial}
                </ShimmerButton>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, textAlign: 'center' }}>
                  Then {plan === 'yearly' ? 'AED 199/year' : 'AED 39/month'} · {STRINGS.onboarding.cancelAnytime}
                </Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.JADE2, textAlign: 'center' }}>
                  {STRINGS.onboarding.refundGuarantee}
                </Text>
                <Pressable onPress={skip} accessibilityRole="button" style={{ paddingVertical: 12, alignItems: 'center' }}>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2, textDecorationLine: 'underline' }}>{STRINGS.onboarding.skipUnlock}</Text>
                </Pressable>
              </View>
            </FadeIn>
          </ScrollView>
        );

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
              transition={{ type: 'spring', damping: 30, stiffness: 100 }}
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
