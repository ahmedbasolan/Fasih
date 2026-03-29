import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import Svg, { Circle } from 'react-native-svg';
import { Briefcase, Users, Coffee, Building2, ShoppingBag, Utensils, Car, Shield, Heart, Activity, TrendingUp, Globe, Map, Award, ChevronLeft, ArrowRight, Check, Bell, Star, Lock, Mic, BookOpen, Layers, Trophy } from 'lucide-react-native';
import { C, FONT_ARABIC_BLACK, FONT_LATIN, FONT_LATIN_BOLD, FONT_LATIN_SEMI } from '../components/design/tokens';
import { GOLD_STOPS, JADE_STOPS, ANGLE_135 } from '../components/design/gradients';
import { KafMascot } from '../components/KafMascot';
import type { UserProfile } from '../types';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

const roles = [
  { id: 'barista', label: 'Barista', Icon: Coffee },
  { id: 'hotel', label: 'Hotel Staff', Icon: Building2 },
  { id: 'retail', label: 'Retail', Icon: ShoppingBag },
  { id: 'restaurant', label: 'Restaurant', Icon: Utensils },
  { id: 'office', label: 'Office', Icon: Briefcase },
  { id: 'healthcare', label: 'Healthcare', Icon: Activity },
  { id: 'driver', label: 'Driver', Icon: Car },
  { id: 'security', label: 'Security', Icon: Shield },
];

const goals = [
  { id: 'professional', label: 'Sound Professional', sub: 'Master workplace dialogue', Icon: TrendingUp },
  { id: 'friends', label: 'Build Friendships', sub: 'Create genuine connections', Icon: Heart },
  { id: 'culture', label: 'Understand Culture', sub: 'Go beyond the surface', Icon: Globe },
  { id: 'daily', label: 'Navigate Daily Life', sub: 'Shops, taxis, neighbourhoods', Icon: Map },
  { id: 'career', label: 'Advance Your Career', sub: 'Open doors through trust', Icon: Award },
];

function PrimaryBtn({ children, onPress, disabled }: { children: React.ReactNode; onPress?: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={{ borderRadius: 16, overflow: 'hidden', opacity: disabled ? 0.5 : 1 }}>
      <LinearGradient
        colors={disabled ? ['rgba(200,145,58,0.2)', 'rgba(200,145,58,0.2)'] : GOLD_STOPS}
        start={ANGLE_135.start}
        end={ANGLE_135.end}
        style={{ paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
      >
        {typeof children === 'string' ? (
          <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 15, color: disabled ? C.TEXT3 : '#05050E' }}>{children}</Text>
        ) : children}
      </LinearGradient>
    </Pressable>
  );
}

function GhostBtn({ children, onPress }: { children: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ borderRadius: 16, paddingVertical: 14, alignItems: 'center', backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
      <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>{children}</Text>
    </Pressable>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <View style={{ position: 'absolute', top: 56, left: 24, right: 24, zIndex: 20, flexDirection: 'row', gap: 4 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{ flex: 1, height: 2, borderRadius: 1, backgroundColor: i <= step ? C.GOLD : 'rgba(255,255,255,0.1)' }} />
      ))}
    </View>
  );
}

export function OnboardingFlow({ onComplete }: Props) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'career' | 'social'>('career');
  const [role, setRole] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [tapCount, setTapCount] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [holdComplete, setHoldComplete] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStart = useRef(0);
  
  const TOTAL = 7;
  const HOLD_DURATION = 2200;

  const next = () => step < TOTAL - 1 ? setStep(s => s + 1) : finish();
  const back = () => step > 0 && setStep(s => s - 1);
  const finish = () => onComplete({ name: name || 'Guest', mode, role, goals: selectedGoals, plan });

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
        setTimeout(next, 700);
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

  const renderStep = () => {
    switch (step) {
      // Step 0: Welcome
      case 0:
        return (
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: insets.top + 80, paddingBottom: insets.bottom + 24 }}>
            <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'timing', duration: 600 }}>
              <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 56, color: C.GOLD, textAlign: 'center', marginBottom: 8 }}>مرحبا</Text>
            </MotiView>
            
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, marginVertical: 40 }}>
              <Pressable onPress={() => setTapCount(c => c + 1)}>
                <KafMascot size="xl" animate tapCount={tapCount} />
              </Pressable>
              
              {tapCount > 0 && (
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.GOLD }}>
                  {tapCount === 1 ? 'Hello! I am Kaf, your guide' : tapCount < 5 ? 'Keep going…' : 'Alright — let us begin!'}
                </Text>
              )}
              
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 20, color: C.TEXT, marginBottom: 4 }}>Gulf Arabic, for Real Dubai Life</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2, textAlign: 'center' }}>Learn through real stories, not textbooks</Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[['4 Live Scenarios', C.GOLD], ['22 Core Phrases', C.JADE2], ['Listen & Learn', C.VIOLET2]].map(([t, c]) => (
                  <View key={t} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: `${c}12`, borderWidth: 1, borderColor: `${c}30` }}>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: c }}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={{ gap: 8 }}>
              <PrimaryBtn onPress={next}>
                <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 15, color: '#05050E' }}>Begin Your Journey</Text>
                <ArrowRight size={16} color="#05050E" />
              </PrimaryBtn>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, textAlign: 'center' }}>Free to start · No credit card required</Text>
            </View>
          </ScrollView>
        );

      // Step 1: Mode Selection
      case 1:
        return (
          <View style={{ flex: 1, paddingTop: insets.top + 64 }}>
            <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT3, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>STEP 1 OF 6</Text>
              <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 24, color: C.TEXT }}>Choose your path</Text>
            </View>

            <View style={{ flex: 1, paddingHorizontal: 24, gap: 12 }}>
              {[
                { id: 'career' as const, Icon: Briefcase, title: 'Career Mode', sub: 'Hospitality · Retail · Office', desc: 'Master workplace conversations', color: C.GOLD },
                { id: 'social' as const, Icon: Users, title: 'Social Mode', sub: 'Cafés · Events · Friendships', desc: 'Build genuine connections', color: C.JADE2 },
              ].map(({ id, Icon, title, sub, desc, color }) => {
                const selected = mode === id;
                return (
                  <Pressable key={id} onPress={() => setMode(id)} style={{ flex: 1, borderRadius: 24, padding: 20, backgroundColor: selected ? `${color}12` : C.SURFACE, borderWidth: 1.5, borderColor: selected ? `${color}50` : C.BORDER }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                      <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: selected ? `${color}20` : 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={22} color={selected ? color : C.TEXT3} />
                      </View>
                      {selected && (
                        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={14} color="#05050E" />
                        </View>
                      )}
                    </View>
                    <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 18, color: selected ? C.TEXT : C.TEXT2, marginBottom: 2 }}>{title}</Text>
                    <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 11, color, marginBottom: 6 }}>{sub}</Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2 }}>{desc}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: insets.bottom + 24 }}>
              <PrimaryBtn onPress={next}>Continue</PrimaryBtn>
            </View>
          </View>
        );

      // Step 2: Name Input
      case 2:
        const arabicGreeting = name.length === 0 ? '' : name.length < 3 ? 'أهـ' : name.length < 5 ? 'أهلاً' : `أهلاً وسهلاً ${name}`;
        return (
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: insets.top + 80, paddingBottom: insets.bottom + 24 }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 }}>
              <KafMascot size="md" animate />
              
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 24, color: C.TEXT, marginBottom: 6 }}>What's your name?</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>Kaf will greet you every morning</Text>
              </View>

              <View style={{ width: '100%' }}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name…"
                  placeholderTextColor={C.TEXT3}
                  style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 22, color: C.TEXT, textAlign: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: name ? C.GOLD_BORDER : C.BORDER }}
                />
              </View>

              {arabicGreeting ? (
                <View style={{ width: '100%', borderRadius: 16, padding: 16, backgroundColor: C.GOLD_DIM, borderWidth: 1, borderColor: C.GOLD_BORDER }}>
                  <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 26, color: C.GOLD, textAlign: 'center', marginBottom: 4 }}>{arabicGreeting}</Text>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, textAlign: 'center' }}>
                    {name.length > 4 ? `"Welcome, ${name}"` : 'Keep typing…'}
                  </Text>
                </View>
              ) : null}
            </View>

            <PrimaryBtn onPress={next} disabled={!name.trim()}>Continue</PrimaryBtn>
          </View>
        );

      // Step 3: Role Selection
      case 3:
        return (
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: insets.top + 80, paddingBottom: insets.bottom + 24, gap: 16 }}>
            <View>
              <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 24, color: C.TEXT, marginBottom: 6 }}>What's your role?</Text>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>Scenarios tailored to your workplace</Text>
            </View>

            <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 16 }}>
              {roles.map(({ id, label, Icon }) => {
                const selected = role === id;
                return (
                  <Pressable key={id} onPress={() => setRole(id)} style={{ width: '48%', borderRadius: 16, padding: 16, alignItems: 'center', gap: 12, backgroundColor: selected ? C.GOLD_DIM : C.SURFACE, borderWidth: 1.5, borderColor: selected ? `${C.GOLD}60` : C.BORDER }}>
                    <Icon size={24} color={selected ? C.GOLD : C.TEXT3} />
                    <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 12, color: selected ? C.GOLD : C.TEXT2 }}>{label}</Text>
                    {selected && (
                      <View style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: C.GOLD, alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={11} color="#05050E" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            <PrimaryBtn onPress={next} disabled={!role}>Continue</PrimaryBtn>
          </View>
        );

      // Step 4: Goals Selection
      case 4:
        return (
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: insets.top + 80, paddingBottom: insets.bottom + 24, gap: 16 }}>
            <View>
              <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 24, color: C.TEXT, marginBottom: 6 }}>What drives you?</Text>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>Select everything that applies</Text>
            </View>

            <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 16 }}>
              {goals.map(({ id, label, sub, Icon }) => {
                const selected = selectedGoals.includes(id);
                return (
                  <Pressable key={id} onPress={() => toggleGoal(id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 14, backgroundColor: selected ? C.JADE_DIM : C.SURFACE, borderWidth: 1.5, borderColor: selected ? C.JADE_BORDER : C.BORDER }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: selected ? `${C.JADE2}20` : 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} color={selected ? C.JADE2 : C.TEXT3} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: selected ? C.TEXT : C.TEXT2 }}>{label}</Text>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT3 }}>{sub}</Text>
                    </View>
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: selected ? C.JADE2 : 'transparent', borderWidth: 2, borderColor: selected ? C.JADE2 : 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
                      {selected && <Check size={13} color="#05050E" />}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View>
              {selectedGoals.length > 0 && (
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.JADE2, textAlign: 'center', marginBottom: 12 }}>
                  {selectedGoals.length} goal{selectedGoals.length > 1 ? 's' : ''} selected
                </Text>
              )}
              <PrimaryBtn onPress={next} disabled={selectedGoals.length === 0}>Continue</PrimaryBtn>
            </View>
          </View>
        );

      // Step 5: Notifications
      case 5:
        return (
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: insets.top + 80, paddingBottom: insets.bottom + 24 }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 }}>
              <MotiView from={{ rotate: '0deg' }} animate={{ rotate: ['0deg', '-8deg', '8deg', '-8deg', '8deg', '0deg'] }} transition={{ type: 'timing', duration: 600, loop: true, repeatReverse: false, delay: 2500 }}>
                <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: C.GOLD_DIM, borderWidth: 1.5, borderColor: C.GOLD_BORDER, alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={36} color={C.GOLD} />
                </View>
              </MotiView>

              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 22, color: C.TEXT, marginBottom: 8 }}>Build a gentle routine</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>A few small learning moments each day go a long way</Text>
              </View>

              <View style={{ width: '100%', gap: 8 }}>
                {[
                  { Icon: BookOpen, text: 'Review a few phrases when you have a minute' },
                  { Icon: Globe, text: 'Notice one cultural detail in every scenario' },
                  { Icon: TrendingUp, text: 'Let steady practice build your confidence' },
                ].map(({ Icon, text }) => (
                  <View key={text} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 14, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
                    <View style={{ width: 32, height: 32, borderRadius: 12, backgroundColor: C.GOLD_DIM, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} color={C.GOLD} />
                    </View>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>{text}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={{ gap: 8 }}>
              <PrimaryBtn onPress={next}>
                <BookOpen size={16} color="#05050E" />
                <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 15, color: '#05050E' }}>Keep Going</Text>
              </PrimaryBtn>
              <GhostBtn onPress={next}>Skip for now</GhostBtn>
            </View>
          </View>
        );

      // Step 6: Commitment Hold
      case 6:
        return (
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: insets.top + 80, paddingBottom: insets.bottom + 24 }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 32 }}>
              <KafMascot size="md" animate mood={holdComplete ? 'happy' : 'idle'} />

              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 22, color: C.TEXT, marginBottom: 8 }}>Make your commitment</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, textAlign: 'center' }}>
                  {holdComplete ? 'Committed. Kaf believes in you.' : 'Hold the button to commit to 10 minutes a day'}
                </Text>
              </View>

              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={136} height={136} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
                  <Circle cx={68} cy={68} r={52} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={5} />
                  <Circle cx={68} cy={68} r={52} fill="none"
                    stroke={holdComplete ? C.JADE2 : C.GOLD} strokeWidth={5} strokeLinecap="round"
                    strokeDasharray={`${circum}`}
                    strokeDashoffset={`${circum * (1 - holdProgress)}`} />
                </Svg>

                <Pressable
                  onPressIn={startHold}
                  onPressOut={endHold}
                  style={{ width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: holdComplete ? C.JADE2 : holdProgress > 0 ? C.GOLD : 'rgba(255,255,255,0.12)', overflow: 'hidden' }}
                >
                  {holdComplete ? (
                    <LinearGradient colors={JADE_STOPS} start={ANGLE_135.start} end={ANGLE_135.end} style={{ width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={34} color="#05050E" />
                    </LinearGradient>
                  ) : holdProgress > 0 ? (
                    <LinearGradient colors={GOLD_STOPS} start={ANGLE_135.start} end={ANGLE_135.end} style={{ width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 11, color: '#05050E', letterSpacing: 1.2 }}>{Math.round(holdProgress * 100)}%</Text>
                    </LinearGradient>
                  ) : (
                    <View style={{ width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.07)' }}>
                      <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 11, color: C.TEXT3, letterSpacing: 1.2, textTransform: 'uppercase' }}>Hold</Text>
                    </View>
                  )}
                </Pressable>
              </View>

              {!holdComplete && (
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, textAlign: 'center', maxWidth: 240 }}>
                  Small routines become real progress over time
                </Text>
              )}
            </View>

            {!holdComplete && <GhostBtn onPress={next}>Skip for now</GhostBtn>}
          </View>
        );

      // Step 7: Paywall — Timeline
      case 7:
        return (
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: insets.top + 80, paddingBottom: insets.bottom + 24 }}>
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: C.GOLD_DIM, borderWidth: 1, borderColor: C.GOLD_BORDER, alignSelf: 'flex-start', marginBottom: 16 }}>
                <Star size={11} color={C.GOLD} />
                <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 11, color: C.GOLD }}>3-Day Free Trial</Text>
              </View>
              <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 24, color: C.TEXT, marginBottom: 6 }}>Full access, no card.</Text>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>Try everything Fasih offers, risk-free</Text>
            </View>

            <View style={{ flex: 1, paddingLeft: 27 }}>
              <View style={{ position: 'absolute', left: 27, top: 24, bottom: 24, width: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
              {([
                { day: 'Today', title: 'Trial begins', desc: 'Full access to all scenarios and features', color: C.GOLD, Icon: ArrowRight },
                { day: 'Day 2', title: 'First milestone', desc: 'Check your progress and cultural score', color: C.JADE2, Icon: TrendingUp },
                { day: 'Day 3', title: 'Last free day', desc: "We'll remind you before the trial ends", color: C.VIOLET2, Icon: Bell },
                { day: 'Day 4+', title: 'Keep learning', desc: 'Continue at AED 39/mo or cancel free', color: C.TEXT3, Icon: Lock },
              ] as const).map(({ day, title, desc, color, Icon }, i) => (
                <MotiView key={day} from={{ opacity: 0, translateX: -12 }} animate={{ opacity: 1, translateX: 0 }} transition={{ type: 'timing', duration: 300, delay: i * 100 }}>
                  <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: `${color}18`, borderWidth: 1.5, borderColor: `${color}40`, alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                      <Icon size={18} color={color} />
                    </View>
                    <View style={{ flex: 1, paddingTop: 4 }}>
                      <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 10, color, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>{day}</Text>
                      <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 15, color: C.TEXT, marginBottom: 3 }}>{title}</Text>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2 }}>{desc}</Text>
                    </View>
                  </View>
                </MotiView>
              ))}
            </View>

            <View style={{ gap: 8 }}>
              <PrimaryBtn onPress={next}>
                <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 15, color: '#05050E' }}>Start Free Trial</Text>
                <ArrowRight size={16} color="#05050E" />
              </PrimaryBtn>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, textAlign: 'center' }}>Cancel anytime · No surprise charges</Text>
            </View>
          </ScrollView>
        );

      // Step 8: Paywall — Features
      case 8:
        return (
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: insets.top + 80, paddingBottom: insets.bottom + 24 }}>
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 24, color: C.TEXT, marginBottom: 6 }}>Everything included</Text>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>One subscription, the full Fasih experience</Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              {[
                { Icon: Mic, label: 'Voice Practice', sub: 'Unlimited sessions', color: C.VIOLET2 },
                { Icon: BookOpen, label: 'Phrase Library', sub: '500+ expressions', color: C.GOLD },
                { Icon: Layers, label: 'All Scenarios', sub: '40+ situations', color: C.JADE2 },
                { Icon: Globe, label: 'Cultural Notes', sub: 'Deep context', color: '#E8766C' },
                { Icon: Trophy, label: 'Achievements', sub: 'Badges & levels', color: C.GOLD2 },
                { Icon: TrendingUp, label: 'Career Paths', sub: '5 industries', color: C.JADE3 },
              ].map(({ Icon, label, sub, color }, i) => (
                <MotiView key={label} from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300, delay: i * 70 }} style={{ width: '47%' }}>
                  <View style={{ borderRadius: 16, padding: 16, gap: 10, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${color}18`, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={19} color={color} />
                    </View>
                    <View>
                      <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 13, color: C.TEXT }}>{label}</Text>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginTop: 2 }}>{sub}</Text>
                    </View>
                  </View>
                </MotiView>
              ))}
            </View>

            <View style={{ borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.JADE_DIM, borderWidth: 1, borderColor: C.JADE_BORDER, marginBottom: 16 }}>
              <Shield size={17} color={C.JADE2} />
              <View>
                <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 13, color: C.JADE2 }}>7-Day Satisfaction Guarantee</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3 }}>Full refund, no questions asked</Text>
              </View>
            </View>

            <PrimaryBtn onPress={next}>
              <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 15, color: '#05050E' }}>See Plans</Text>
              <ArrowRight size={16} color="#05050E" />
            </PrimaryBtn>
          </ScrollView>
        );

      // Step 9: Paywall — Plans
      case 9:
        return (
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: insets.top + 80, paddingBottom: insets.bottom + 24 }}>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 24, color: C.TEXT, marginBottom: 6 }}>Choose your plan</Text>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>3-day free trial · Cancel anytime</Text>
            </View>

            <View style={{ gap: 12, marginBottom: 16 }}>
              {/* Yearly */}
              <Pressable onPress={() => setPlan('yearly')} style={{ borderRadius: 24, padding: 20, backgroundColor: plan === 'yearly' ? C.GOLD_DIM : C.SURFACE, borderWidth: 2, borderColor: plan === 'yearly' ? `${C.GOLD}70` : C.BORDER }}>
                <View style={{ position: 'absolute', top: 16, right: 16, borderRadius: 8, overflow: 'hidden' }}>
                  <LinearGradient colors={GOLD_STOPS} start={ANGLE_135.start} end={ANGLE_135.end} style={{ paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 10, color: '#05050E' }}>SAVE 57%</Text>
                  </LinearGradient>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingRight: 80 }}>
                  <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: plan === 'yearly' ? C.GOLD : 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                    {plan === 'yearly' && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.GOLD }} />}
                  </View>
                  <View>
                    <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 16, color: C.TEXT, marginBottom: 2 }}>Yearly Plan</Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginBottom: 8 }}>Best for committed learners</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
                      <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 28, color: C.GOLD }}>AED 16.6</Text>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT3, paddingBottom: 4 }}>/month</Text>
                    </View>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginTop: 2 }}>Billed AED 199/year · Saves AED 269</Text>
                  </View>
                </View>
              </Pressable>

              {/* Monthly */}
              <Pressable onPress={() => setPlan('monthly')} style={{ borderRadius: 24, padding: 20, backgroundColor: plan === 'monthly' ? C.VIOLET_DIM : C.SURFACE, borderWidth: 2, borderColor: plan === 'monthly' ? `${C.VIOLET}60` : C.BORDER }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: plan === 'monthly' ? C.VIOLET2 : 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                    {plan === 'monthly' && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.VIOLET2 }} />}
                  </View>
                  <View>
                    <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 16, color: C.TEXT, marginBottom: 2 }}>Monthly Plan</Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginBottom: 8 }}>Maximum flexibility</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
                      <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 28, color: C.TEXT }}>AED 39</Text>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT3, paddingBottom: 4 }}>/month</Text>
                    </View>
                  </View>
                </View>
              </Pressable>

              {/* Features included */}
              <View style={{ borderRadius: 16, padding: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
                {['Full scenario library', 'Unlimited voice practice', '500+ phrase library', 'Cultural intelligence notes'].map((f, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}>
                    <Check size={13} color={C.JADE2} />
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2 }}>{f}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={{ gap: 8, marginTop: 16 }}>
              <PrimaryBtn onPress={finish}>Start 3-Day Free Trial</PrimaryBtn>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, textAlign: 'center' }}>
                Then {plan === 'yearly' ? 'AED 199/year' : 'AED 39/month'} · Cancel anytime
              </Text>
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.BG }}>
      {step > 0 && <ProgressBar step={step} total={TOTAL} />}
      
      {step > 0 && (
        <Pressable onPress={back} style={{ position: 'absolute', top: insets.top + 54, left: 16, zIndex: 30, width: 32, height: 32, borderRadius: 16, backgroundColor: C.SURFACE, alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={18} color={C.TEXT2} />
        </Pressable>
      )}

      {renderStep()}
    </View>
  );
}
