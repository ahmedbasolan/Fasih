import React from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, AnimatePresence } from 'moti';
import Svg, { Circle } from 'react-native-svg';
import { Check } from '../../components/icons';
import { FONT_ARABIC, FONT_LATIN, FONT_LATIN_BOLD, FONT_LATIN_SEMI, FONT_LATIN_MEDIUM, FONT_HEADING_SEMI, ARABIC_SCALE } from '../../components/design/tokens';
import { ANGLE_135 } from '../../components/design/gradients';
import { GeoPattern } from '../../components/design/GeoPattern';
import { HotelIcon, RetailIcon, RestaurantIcon, OfficeIcon, HealthcareIcon, DriverIcon, SecurityIcon, ProfessionalIcon, FriendsIcon, CultureIcon, DailyLifeIcon, CareerIcon } from '../../components/features/RoleGoalIcons';
import { Companion } from '../../components/ui/Companion';
import { useTheme } from '../../hooks/useTheme';
import { STRINGS } from '../../constants/strings';
import { FadeIn, ShimmerButton } from '../../components/ui';
import { haptic } from '../../lib/haptics';
import type { OnboardingStepProps } from './types';

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

/** Secondary action. Only these four steps offer one, so it lives here. */
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

/**
 * Steps 2-5: name, role, goals, and the hold-to-commit ring.
 *
 * The profile the learner is actually building. `PROFESSION_CATEGORIES` and
 * `goals` moved here with the cases -- nothing else reads them.
 */
export function ProfileSteps({ step, next, draft, hold }: OnboardingStepProps) {
  const { C, G } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    name, setName, gender, setGender, role, setRole,
    profession, setProfession, selectedGoals, toggleGoal, typedGreeting,
  } = draft;
  const { holdProgress, holdComplete, startHold, endHold, circum } = hold;

  switch (step) {

      // Step 2: Name Input — consistent upward entrance
      case 2:
        return (
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: insets.top + 80, paddingBottom: insets.bottom + 24 }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', marginTop: 40, gap: 24 }}>
              <FadeIn delay={100}>
                <Companion size={72} />
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
                <Companion size={72} />
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
      default:
        return null;
    }
}
