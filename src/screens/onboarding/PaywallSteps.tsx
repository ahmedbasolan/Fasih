import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import Svg, { Path } from 'react-native-svg';
import { Shield, TrendingUp, Globe, ArrowRight, Check, Star, Lock, Mic, BookOpen, Layers, Trophy, Zap, Flame, Sparkles } from '../../components/icons';
import { FONT_LATIN, FONT_LATIN_BOLD, FONT_LATIN_SEMI, FONT_HEADING_SEMI } from '../../components/design/tokens';
import { ANGLE_135 } from '../../components/design/gradients';
import { SPACE } from '../../components/design/spacing';
import { TYPE } from '../../components/design/layout';
import { useTheme } from '../../hooks/useTheme';
import { STRINGS } from '../../constants/strings';
import { FadeIn, ShimmerButton, Screen, Stack } from '../../components/ui';
import type { OnboardingStepProps } from './types';

/**
 * Steps 9-11: the trial timeline, the feature grid, and plan selection.
 *
 * This is the revenue path. `next` advances 9 -> 10 -> 11, `finishWithTrial`
 * starts the subscription, and `skip` leaves without one -- all three are the
 * parent's, and all three must keep firing.
 */
export function PaywallSteps({ step, next, skip, finishWithTrial, draft }: OnboardingStepProps) {
  const { C, G } = useTheme();
  const { plan, setPlan } = draft;

  // The three action zones repeat the same fine print and skip link, so they
  // are defined once rather than inline three times with drifting values.
  const styles = useMemo(
    () =>
      StyleSheet.create({
        fineprint: { ...TYPE.micro, fontFamily: FONT_LATIN, color: C.TEXT3, textAlign: 'center' },
        fineprintAccent: { ...TYPE.micro, fontFamily: FONT_LATIN, color: C.JADE2, textAlign: 'center' },
        skipRow: { paddingVertical: SPACE.md, alignItems: 'center' },
        skipText: { ...TYPE.body, fontFamily: FONT_LATIN, color: C.TEXT2, textDecorationLine: 'underline' },
        skipTextQuiet: { ...TYPE.body, fontFamily: FONT_LATIN, color: C.TEXT3, textDecorationLine: 'underline' },
      }),
    [C],
  );

  switch (step) {
      case 9:
        return (
          <Screen
            onboardingChrome
            action={
              <FadeIn delay={800}>
                <Stack gap="sm">
                  <ShimmerButton onPress={next} Icon={ArrowRight} accessibilityLabel={STRINGS.onboarding.startFreeTrial}>
                    {STRINGS.onboarding.startFreeTrial}
                  </ShimmerButton>
                  <Text style={styles.fineprint}>{STRINGS.onboarding.cancelAnytime}</Text>
                  <Pressable onPress={skip} accessibilityRole="button" style={styles.skipRow}>
                    <Text style={styles.skipText}>{STRINGS.onboarding.skipForNow}</Text>
                  </Pressable>
                </Stack>
              </FadeIn>
            }
          >
            <FadeIn delay={100}>
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 22, color: C.TEXT, marginBottom: 6 }}>{STRINGS.onboarding.paywallTitle}</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>{STRINGS.onboarding.paywallSub}</Text>
              </View>
            </FadeIn>

            <View style={{ flex: 1, gap: 16 }}>
              {STRINGS.onboarding.timeline.map(({ day, title, desc }, i) => {
                const iconData = [
                  { Icon: Zap,      fill: true,  gradientColors: [C.JADE,          C.PRIMARY_DARK]         as [string, string] },
                  { Icon: Sparkles, fill: false, gradientColors: [C.JADE2,         C.JADE]                 as [string, string] },
                  { Icon: Flame,    fill: true,  gradientColors: [C.CULTURAL_GOLD, C.CULTURAL_GOLD_DARK]   as [string, string] },
                  { Icon: Lock,     fill: false, gradientColors: [C.BORDER2, C.BORDER] as [string, string] },
                ][i];
                const labelColor = i === 0 ? C.JADE_ACCENT : i === 1 ? C.JADE2 : i === 2 ? C.CULTURAL_GOLD : C.TEXT3;
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
                        <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 16, color: C.TEXT, marginBottom: 4 }}>{title}</Text>
                        <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, lineHeight: 20 }}>{desc}</Text>
                      </View>
                    </View>
                  </FadeIn>
                );
              })}
            </View>

          </Screen>
        );

      // Step 10: Everything included — features
      case 10:
        return (
          <Screen
            onboardingChrome
            action={
              <Stack gap="xs">
                <FadeIn delay={900}>
                  <ShimmerButton onPress={next} Icon={ArrowRight} accessibilityLabel={STRINGS.onboarding.seePlans}>
                    {STRINGS.onboarding.seePlans}
                  </ShimmerButton>
                </FadeIn>
                <FadeIn delay={1000}>
                  <Pressable onPress={skip} accessibilityRole="button" style={styles.skipRow}>
                    <Text style={styles.skipTextQuiet}>{STRINGS.onboarding.skipForNow}</Text>
                  </Pressable>
                </FadeIn>
              </Stack>
            }
          >
            <FadeIn delay={100}>
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 22, color: C.TEXT, marginBottom: 6 }}>{STRINGS.onboarding.everythingIncluded}</Text>
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
                        <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: C.TEXT }}>{label}</Text>
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
                  <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: C.JADE2 }}>{STRINGS.onboarding.satisfactionGuarantee}</Text>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3 }}>{STRINGS.onboarding.refundPolicy}</Text>
                </View>
              </View>
            </FadeIn>

          </Screen>
        );

      // Step 11: Paywall — plans
      case 11:
        return (
          <Screen
            onboardingChrome
            action={
              <FadeIn delay={650}>
                <Stack gap="sm">
                  <ShimmerButton onPress={finishWithTrial} Icon={ArrowRight} accessibilityLabel={STRINGS.onboarding.startFreeTrial}>
                    {STRINGS.onboarding.startFreeTrial}
                  </ShimmerButton>
                  <Text style={styles.fineprint}>
                    {STRINGS.onboarding.thenPrice(plan === 'yearly' ? 'AED 199/year' : 'AED 39/month')}
                  </Text>
                  <Text style={styles.fineprintAccent}>{STRINGS.onboarding.refundGuarantee}</Text>
                  <Pressable onPress={skip} accessibilityRole="button" style={styles.skipRow}>
                    <Text style={styles.skipText}>{STRINGS.onboarding.skipUnlock}</Text>
                  </Pressable>
                </Stack>
              </FadeIn>
            }
          >
            <FadeIn delay={100}>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 22, color: C.TEXT, marginBottom: 6 }}>{STRINGS.onboarding.choosePlan}</Text>
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
                  style={{ borderRadius: 24, padding: 20, backgroundColor: plan === 'yearly' ? C.JADE_ACCENT_DIM : C.SURFACE, borderWidth: 2, borderColor: plan === 'yearly' ? `${C.JADE_ACCENT}70` : C.BORDER }}
                >
                  <View style={{ position: 'absolute', top: 16, right: 16, borderRadius: 8, overflow: 'hidden' }}>
                    <LinearGradient colors={[...G.GOLD_STOPS]} start={ANGLE_135.start} end={ANGLE_135.end} style={{ paddingHorizontal: 10, paddingVertical: 4 }}>
                      <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 11, color: C.BG }}>{STRINGS.onboarding.savePct(57)}</Text>
                    </LinearGradient>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingRight: 80 }}>
                    <MotiView
                      animate={{ scale: plan === 'yearly' ? [0.8, 1.2, 1] : 1 }}
                      transition={{ type: 'timing', duration: 220 }}
                      style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: plan === 'yearly' ? C.JADE_ACCENT : C.BORDER2, alignItems: 'center', justifyContent: 'center' }}
                    >
                      {plan === 'yearly' && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.JADE_ACCENT }} />}
                    </MotiView>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <Svg width={18} height={16} viewBox="0 0 24 20">
                          <Path d="M2 16 L5 6 L9 11 L12 2 L15 11 L19 6 L22 16 Z" fill={C.JADE_ACCENT} opacity={0.85} />
                          <Path d="M3 17.5 L21 17.5" stroke={C.JADE_ACCENT} strokeWidth={2} strokeLinecap="round" />
                        </Svg>
                        <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 16, color: C.TEXT }}>{STRINGS.onboarding.yearlyPlan}</Text>
                      </View>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginBottom: 8 }}>{STRINGS.onboarding.yearlyBest}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
                        <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 28, color: C.JADE_ACCENT }}>AED 16.6</Text>
                        <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT3, paddingBottom: 4 }}>{STRINGS.onboarding.perMonth}</Text>
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
                      transition={{ type: 'timing', duration: 220 }}
                      style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: plan === 'monthly' ? C.VIOLET2 : C.BORDER2, alignItems: 'center', justifyContent: 'center' }}
                    >
                      {plan === 'monthly' && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.VIOLET2 }} />}
                    </MotiView>
                    <View>
                      <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 16, color: C.TEXT, marginBottom: 2 }}>{STRINGS.onboarding.monthlyPlan}</Text>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginBottom: 8 }}>{STRINGS.onboarding.monthlyFlex}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
                        <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 28, color: C.TEXT }}>AED 39</Text>
                        <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT3, paddingBottom: 4 }}>{STRINGS.onboarding.perMonth}</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              </FadeIn>

              {/* Features included — each row cascades, matching the timeline/feature-grid pattern above */}
              <View style={{ borderRadius: 16, padding: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
                {STRINGS.onboarding.features.slice(0, 4).map((f, i) => (
                  <FadeIn key={f.label} delay={400 + i * 60}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}>
                      <Check size={13} color={C.JADE2} />
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>{f.label}</Text>
                    </View>
                  </FadeIn>
                ))}
              </View>
            </View>

          </Screen>
        );

      default:
        return null;
    }
}
