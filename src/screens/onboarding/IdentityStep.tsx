import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sun, Moon, ArrowRight } from '../../components/icons';
import { FONT_LATIN, FONT_HEADING_EXTRA } from '../../components/design/tokens';
import { SPACE, SCREEN_MARGIN } from '../../components/design/spacing';
import { useTheme } from '../../hooks/useTheme';
import { STRINGS } from '../../constants/strings';
import { FadeIn, SwitchButton, ShimmerButton, Monogram } from '../../components/ui';
import { useAppStore } from '../../store/useAppStore';
import type { OnboardingStepProps } from './types';

/**
 * Step 0: welcome and the theme toggle.
 *
 * Note what is NOT here: the gender choice lives on step 2 beside the name, as
 * a labelled two-option control. The two fennec PNGs that used to sit on this
 * screen were decoration only, so retiring them changes no behaviour --
 * `requiresGender` scenario filtering is unaffected.
 *
 * The monogram appears only when a name already exists, which happens when
 * Clerk prefills one. Rendering an empty avatar to everyone else would promise
 * an identity the learner has not given yet.
 */
export function IdentityStep({ next, draft }: OnboardingStepProps) {
  const { C, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const setTheme = useAppStore((s) => s.setTheme);
  const { name } = draft;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        page: {
          flexGrow: 1,
          paddingHorizontal: SCREEN_MARGIN,
          paddingTop: insets.top + SPACE.xxl,
          paddingBottom: insets.bottom + SPACE.xl,
          backgroundColor: C.BG,
        },
        toggleRow: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          marginBottom: SPACE.xxxl,
        },
        // The title is the screen. Nothing sits behind it, so it has to carry
        // the weight the illustration used to.
        title: {
          fontFamily: FONT_HEADING_EXTRA,
          fontSize: 34,
          lineHeight: 42,
          letterSpacing: -0.6,
          color: C.TEXT,
        },
        accent: { color: C.PRIMARY },
        subtitle: {
          fontFamily: FONT_LATIN,
          fontSize: 15,
          lineHeight: 24,
          color: C.TEXT2,
          marginTop: SPACE.md,
        },
        rule: {
          height: StyleSheet.hairlineWidth,
          backgroundColor: C.BORDER,
          marginVertical: SPACE.xl,
        },
        body: {
          fontFamily: FONT_LATIN,
          fontSize: 15,
          lineHeight: 24,
          color: C.TEXT2,
        },
        spacer: { flex: 1, minHeight: SPACE.xxl },
      }),
    [C, insets.top, insets.bottom],
  );

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.toggleRow}>
        <FadeIn delay={50}>
          {/* The icons sit on the knob's C.BG fill, so C.TEXT serves both
              themes — that is the core ink-on-page pairing the token guard
              already asserts. */}
          <SwitchButton
            value={isDark}
            onToggle={() => setTheme(isDark ? 'light' : 'dark')}
            iconOn={<Moon size={14} strokeWidth={1.5} color={C.TEXT} />}
            iconOff={<Sun size={14} strokeWidth={1.5} color={C.TEXT} />}
            // Was C.JADE_ACCENT / C.VIOLET2 — the same gold as the primary
            // button, which made a theme switch the loudest thing on the
            // welcome screen and put it in direct competition with Get Started.
            // A utility control should read as one.
            backgroundColor={C.TEXT3}
            accessibilityLabel={STRINGS.onboarding.themeToggle}
          />
        </FadeIn>
      </View>

      {name.trim().length > 0 && (
        <FadeIn delay={120} style={{ marginBottom: SPACE.xl }}>
          <Monogram name={name} size={72} />
        </FadeIn>
      )}

      <FadeIn delay={200}>
        <Text style={styles.title}>
          {STRINGS.onboarding.welcomeLead}{' '}
          <Text style={styles.accent}>{STRINGS.onboarding.welcomeLeadAccent}</Text>
        </Text>
        <Text style={styles.subtitle}>{STRINGS.onboarding.welcomeSubtitle}</Text>
      </FadeIn>

      <View style={styles.rule} />

      <FadeIn delay={300}>
        <Text style={styles.body}>{STRINGS.onboarding.welcomeBody}</Text>
      </FadeIn>

      <View style={styles.spacer} />

      <FadeIn delay={400}>
        <ShimmerButton onPress={next} Icon={ArrowRight} accessibilityLabel={STRINGS.onboarding.getStarted}>
          {STRINGS.onboarding.getStarted}
        </ShimmerButton>
      </FadeIn>
    </ScrollView>
  );
}
