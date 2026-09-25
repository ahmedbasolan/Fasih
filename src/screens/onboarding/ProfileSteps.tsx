import React from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, AnimatePresence } from 'moti';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, useAnimatedStyle } from 'react-native-reanimated';
import { Check } from '../../components/icons';
import { FONT_ARABIC, FONT_LATIN, FONT_LATIN_BOLD, FONT_LATIN_SEMI, FONT_LATIN_MEDIUM, FONT_HEADING_SEMI, ARABIC_SCALE } from '../../components/design/tokens';
import { ANGLE_135 } from '../../components/design/gradients';
import { SPACE, RADIUS } from '../../components/design/spacing';
import { ONBOARDING_CHROME_HEIGHT, TYPE } from '../../components/design/layout';
import { categoriesForRole, phraseCountForRole } from '../../engine/roleCategories';
import { GeoPattern } from '../../components/design/GeoPattern';
import { HotelIcon, RetailIcon, RestaurantIcon, OfficeIcon, HealthcareIcon, DriverIcon, SecurityIcon, ProfessionalIcon, FriendsIcon, CultureIcon, DailyLifeIcon, CareerIcon } from '../../components/features/RoleGoalIcons';
import { Companion } from '../../components/ui/Companion';
import { useTheme } from '../../hooks/useTheme';
import { STRINGS } from '../../constants/strings';
import { FadeIn, ShimmerButton, Screen } from '../../components/ui';
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

/**
 * The progress ring, animated on the UI thread.
 *
 * react-native-svg's Circle does not accept animated props directly; this is
 * the standard wrapper that lets Reanimated drive strokeDashoffset without a
 * React render per frame.
 */
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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
      style={{ borderRadius: RADIUS.pill, paddingVertical: SPACE.lg, alignItems: 'center', borderWidth: 1, borderColor: C.BORDER }}
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
export function ProfileSteps({ screen, next, draft, hold }: OnboardingStepProps) {
  const { C, G } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    name, setName, gender, setGender, role, setRole,
    profession, setProfession, selectedGoals, toggleGoal, typedGreeting,
  } = draft;
  const { holdProgress, holdComplete, isHolding, startHold, endHold, circum } = hold;

  // Both derive from the shared value, so they update on the UI thread without
  // re-rendering this component. Declared unconditionally — hooks cannot live
  // inside the switch below.
  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: circum * (1 - holdProgress.value),
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: holdProgress.value * 0.18,
    transform: [{ scale: 1 + holdProgress.value * 0.35 }],
  }));

  switch (screen) {

      // Name input — consistent upward entrance
      case 'name':
        return (
          // Lays itself out rather than using `Screen`: both steps are centred,
          // non-scrolling compositions with their own horizontal margin. The top
          // padding still comes from ONBOARDING_CHROME_HEIGHT so it tracks the
          // chrome it is clearing — it was SPACE.huge, the same 64, but tied to
          // nothing.
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: insets.top + ONBOARDING_CHROME_HEIGHT, paddingBottom: insets.bottom + SPACE.xl }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', marginTop: 40, gap: 24 }}>
              <FadeIn delay={100}>
                <Companion size={72} name={name} />
              </FadeIn>
              
              <FadeIn delay={200}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 22, color: C.TEXT, marginBottom: 6 }}>{STRINGS.onboarding.whatsYourName}</Text>
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
                  // A ruled line, not a filled box. Sadaf separates by hairline
                  // and space; a rounded fill here is the card language steps
                  // 0-1 no longer use.
                  style={{
                    fontFamily: FONT_HEADING_SEMI,
                    fontSize: 22,
                    color: C.TEXT,
                    paddingVertical: SPACE.md,
                    borderRadius: RADIUS.flat,
                    borderBottomWidth: 1,
                    borderBottomColor: name.trim() ? C.PRIMARY : C.BORDER2,
                    textAlign: 'center',
                  }}
                />
              </FadeIn>

              <FadeIn delay={380} style={{ width: '100%' }}>
                <View style={{ alignItems: 'center', gap: 10 }}>
                  <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 16, color: C.TEXT }}>
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
                            borderRadius: RADIUS.flat,
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: SPACE.xs,
                            // Flat. Selection is a border and a weight change,
                            // matching the mode plates on step 1 — no fill.
                            borderWidth: 1,
                            borderColor: selected ? C.PRIMARY : C.BORDER,
                          }}
                        >
                          <Text style={{ fontFamily: selected ? FONT_LATIN_BOLD : FONT_LATIN_SEMI, fontSize: 14, color: selected ? C.PRIMARY : C.TEXT }}>
                            {opt.label}
                          </Text>
                          <Text style={{ fontFamily: FONT_ARABIC, fontSize: Math.round(13 * ARABIC_SCALE), color: selected ? C.PRIMARY : C.TEXT3 }}>
                            {opt.example}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </FadeIn>

              {/* No FadeIn here. AnimatePresence can only drive an exit on its
                  DIRECT child, and FadeIn's root is a plain View since the
                  blank-screen fix — so wrapping this hid the MotiView's own
                  `exit` and the greeting vanished instead of fading. The
                  MotiView already carries the entrance, so FadeIn was doubling
                  a translateY as well. */}
              <AnimatePresence>
                {typedGreeting && (
                  <MotiView
                      key="greeting"
                      from={{ opacity: 0, translateY: 10 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'timing', duration: 380 }}
                      style={{ width: '100%' }}
                    >
                      {/* Was a glowing tile: accent fill, 1.5pt accent border,
                          a coloured drop shadow AND a text-shadow halo on the
                          Arabic. SheetPanel is the app's only shadow, and the
                          learner's own name typed in Arabic does not need a
                          glow to feel like an event. Hairline and space. */}
                      <View style={{
                        width: '100%', borderRadius: RADIUS.flat, paddingVertical: SPACE.lg,
                        borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.BORDER,
                        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.BORDER,
                      }}>
                        <Text style={{ fontFamily: FONT_ARABIC, fontSize: Math.round(28 * ARABIC_SCALE), color: C.PRIMARY, textAlign: 'center', marginBottom: SPACE.xs }}>{typedGreeting}</Text>
                        <Text style={{ fontFamily: FONT_LATIN_MEDIUM, fontSize: 12, color: C.TEXT2, textAlign: 'center' }}>
                          {name.length > 4 ? STRINGS.onboarding.welcomeName(name) : STRINGS.onboarding.keepTyping}
                        </Text>
                      </View>
                  </MotiView>
                )}
              </AnimatePresence>
            </View>

            <FadeIn delay={500}>
              <ShimmerButton onPress={next} disabled={!name.trim() || !gender}>{STRINGS.common.continue}</ShimmerButton>
            </FadeIn>
          </View>
        );

      // Step 3: Role Selection — clean 2-column grid layout
      case 'role':
        return (
          <Screen
            // The role grid scrolls, the heading and the profession tray do not.
            // Screen must therefore NOT scroll: two same-axis ScrollViews nested
            // is a native gesture conflict, and only one of them would ever win.
            scroll={false}
            onboardingChrome
            action={
              <FadeIn delay={600}>
                <ShimmerButton onPress={next} disabled={!role || !profession} accessibilityLabel={STRINGS.common.continue}>
                  {STRINGS.common.continue}
                </ShimmerButton>
              </FadeIn>
            }
          >
            <FadeIn delay={100}>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 22, color: C.TEXT, marginBottom: 6 }}>{STRINGS.onboarding.whatsYourRole}</Text>
                <Text style={{ fontFamily: FONT_LATIN_MEDIUM, fontSize: 14, color: C.TEXT2 }}>{STRINGS.onboarding.roleTailored}</Text>
              </View>
            </FadeIn>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, paddingBottom: 16 }}>
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
                          gap: SPACE.sm,
                          // Flat, bordered, no fill and no gradient wash — the
                          // same selection language as the mode plates.
                          borderRadius: RADIUS.flat,
                          borderWidth: 1,
                          borderColor: selected ? C.PRIMARY : C.BORDER,
                          overflow: 'hidden'
                        }}
                      >
                        <Icon size={20} color={selected ? C.PRIMARY : C.TEXT3} />

                        <Text style={{
                          fontFamily: selected ? FONT_LATIN_BOLD : FONT_LATIN_SEMI,
                          fontSize: 12,
                          color: selected ? C.PRIMARY : C.TEXT,
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
                            paddingHorizontal: SPACE.lg,
                            paddingVertical: SPACE.sm,
                            // Chips stay pill-shaped — RADIUS.pill is in the
                            // budget precisely for interactive pills. The fill
                            // is what goes.
                            borderRadius: RADIUS.pill,
                            borderWidth: 1,
                            borderColor: chipSelected ? C.PRIMARY : C.BORDER,
                          }}
                        >
                          <Text style={{
                            fontFamily: chipSelected ? FONT_LATIN_SEMI : FONT_LATIN,
                            fontSize: 14,
                            color: chipSelected ? C.PRIMARY : C.TEXT2,
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

            {/* The payoff. The flow collected a role and a profession and then
                never mentioned them again until the paywall; this reflects the
                answer back on the screen that asked for it, which is a shorter
                causal link than asking here and paying off a screen later.

                Categories lead, count supports. Greetings and Everyday apply to
                every job, so every role resolves to a similar total and the
                number differentiates far less than the category list does. */}
            {profession ? (
              <FadeIn delay={80}>
                <View
                  style={{
                    marginTop: SPACE.lg,
                    paddingTop: SPACE.lg,
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: C.BORDER,
                  }}
                >
                  <Text
                    style={{
                      ...TYPE.micro,
                      fontFamily: FONT_LATIN_MEDIUM,
                      letterSpacing: 1.6,
                      textTransform: 'uppercase',
                      color: C.TEXT3,
                      marginBottom: SPACE.sm,
                    }}
                  >
                    {STRINGS.onboarding.shiftHeading}
                  </Text>
                  <Text
                    style={{
                      ...TYPE.bodyLarge,
                      fontFamily: FONT_LATIN_SEMI,
                      color: C.TEXT,
                      marginBottom: SPACE.xs,
                    }}
                  >
                    {categoriesForRole(role).join(STRINGS.onboarding.shiftCategorySeparator)}
                  </Text>
                  <Text style={{ ...TYPE.body, fontFamily: FONT_LATIN, color: C.TEXT2 }}>
                    {STRINGS.onboarding.shiftCount(phraseCountForRole(role))}
                  </Text>
                </View>
              </FadeIn>
            ) : null}

          </Screen>
        );

      // Step 4: Goals Selection — consistent upward entrance
      case 'goals':
        return (
          <Screen
            // Same as the role screen: the goal list owns the scrolling, so Screen must not.
            scroll={false}
            onboardingChrome
            contentStyle={{ gap: SPACE.lg }}
            action={
              <FadeIn delay={600}>
                <ShimmerButton onPress={next} disabled={selectedGoals.length === 0} accessibilityLabel={STRINGS.common.continue}>
                  {STRINGS.common.continue}
                </ShimmerButton>
              </FadeIn>
            }
          >
            <FadeIn delay={100}>
              <View>
                <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 22, color: C.TEXT, marginBottom: 6 }}>{STRINGS.onboarding.whatsDrivesYou}</Text>
                <Text style={{ fontFamily: FONT_LATIN_MEDIUM, fontSize: 14, color: C.TEXT2 }}>{STRINGS.onboarding.selectEverything}</Text>
              </View>
            </FadeIn>

            {/* Ruled rows, not stacked cards: a list of goals IS a list. */}
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: SPACE.lg }}>
              {goals.map(({ id, label, sub, Icon }, idx) => {
                const selected = selectedGoals.includes(id);
                return (
                  <FadeIn key={id} delay={200 + idx * 80}>
                    <Pressable
                      onPress={() => toggleGoal(id)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: selected }}
                      accessibilityLabel={`${label}. ${sub}`}
                      style={{
                        flexDirection: 'row', alignItems: 'center', gap: SPACE.md,
                        borderRadius: RADIUS.flat, paddingVertical: SPACE.lg,
                        borderTopWidth: idx === 0 ? StyleSheet.hairlineWidth : 0,
                        borderTopColor: C.BORDER,
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: C.BORDER,
                      }}
                    >
                      <Icon size={20} color={selected ? C.PRIMARY : C.TEXT3} />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ fontFamily: selected ? FONT_LATIN_BOLD : FONT_LATIN_SEMI, fontSize: 16, color: selected ? C.TEXT : C.TEXT2 }}>{label}</Text>
                        <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, lineHeight: 20, color: C.TEXT3, marginTop: 2 }}>{sub}</Text>
                      </View>
                      <View style={{
                        width: 24, height: 24, borderRadius: RADIUS.pill, borderWidth: 1,
                        borderColor: selected ? C.PRIMARY : C.BORDER2,
                        backgroundColor: selected ? C.PRIMARY : 'transparent',
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
            </View>
          </Screen>
        );

      // Commitment — consistent upward entrance
      case 'commitment':
        return (
          // Lays itself out rather than using `Screen`: both steps are centred,
          // non-scrolling compositions with their own horizontal margin. The top
          // padding still comes from ONBOARDING_CHROME_HEIGHT so it tracks the
          // chrome it is clearing — it was SPACE.huge, the same 64, but tied to
          // nothing.
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: insets.top + ONBOARDING_CHROME_HEIGHT, paddingBottom: insets.bottom + SPACE.xl }}>
            {/* Arabic geometric background pattern */}
            <GeoPattern opacity={0.035} color={C.JADE_ACCENT} size={48} />

            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 32 }}>
              <FadeIn delay={100} style={{ zIndex: 2 }}>
                <Companion size={72} name={name} />
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
                  {/* Glow and ring both read the shared value directly, so the
                      whole hold runs on the UI thread. The MotiView that used
                      to sit here had its `animate` prop rewritten every frame,
                      which restarted a 80ms animation 60 times a second. */}
                  <Animated.View
                    style={[
                      { position: 'absolute', width: 136, height: 136, borderRadius: 68, backgroundColor: C.JADE_ACCENT },
                      glowStyle,
                    ]}
                  />
                  <Svg width={136} height={136} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
                    {/* Outer glow ring */}
                    <Circle cx={68} cy={68} r={52} fill="none" stroke={C.JADE_ACCENT} strokeWidth={14} opacity={0.1} />
                    {/* Track ring */}
                    <Circle cx={68} cy={68} r={52} fill="none" stroke={C.SURFACE} strokeWidth={8} />
                    {/* Progress ring */}
                    <AnimatedCircle cx={68} cy={68} r={52} fill="none"
                      stroke={holdComplete ? C.JADE2 : C.JADE_ACCENT} strokeWidth={8} strokeLinecap="round"
                      strokeDasharray={`${circum}`}
                      animatedProps={ringProps} />
                  </Svg>

                  <Pressable
                    onPressIn={startHold}
                    onPressOut={endHold}
                    accessibilityRole="button"
                    accessibilityLabel={holdComplete ? 'Commitment made' : 'Hold to commit'}
                    accessibilityHint={holdComplete ? undefined : 'Press and hold for 2 seconds to make your commitment'}
                    style={{ width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: holdComplete ? C.JADE2 : isHolding ? C.JADE_ACCENT : C.BORDER2, overflow: 'hidden', zIndex: 2 }}
                  >
                    {holdComplete ? (
                      <MotiView from={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'timing', duration: 220 }}>
                        <LinearGradient colors={[...G.JADE_STOPS]} start={ANGLE_135.start} end={ANGLE_135.end} style={{ width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={34} color={C.BG} />
                        </LinearGradient>
                      </MotiView>
                    ) : isHolding ? (
                      /* The live percentage is gone. It could only be rendered by
                         reading progress on the JS thread, which is the thing
                         that made this stutter — and a number racing 0 to 100 in
                         2.2 seconds is not readable anyway. The ring is the
                         progress display; this is the instruction. */
                      <LinearGradient colors={[...G.GOLD_STOPS]} start={ANGLE_135.start} end={ANGLE_135.end} style={{ width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' }}>
                        <Text numberOfLines={1} style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 11, color: C.BG, letterSpacing: 1.2 }}>{STRINGS.onboarding.holdKeepHolding}</Text>
                      </LinearGradient>
                    ) : (
                      <View
                        style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Text numberOfLines={1} style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 12, color: C.TEXT2, letterSpacing: 1.2 }}>{STRINGS.onboarding.holdToCommit}</Text>
                      </View>
                    )}
                  </Pressable>
                </View>
              </FadeIn>

              {/* No AnimatePresence: nothing here declares an `exit`, and
                  FadeIn's plain-View root means it could not drive one anyway.
                  The line just unmounts, which is what it already did. */}
              {!holdComplete && (
                <FadeIn delay={400} style={{ zIndex: 2 }}>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, textAlign: 'center', lineHeight: 20 }}>
                    {STRINGS.onboarding.dailyHabit}
                  </Text>
                </FadeIn>
              )}
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
