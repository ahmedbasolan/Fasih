import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Briefcase, Users, ArrowRight } from '../../components/icons';
import {
  FONT_LATIN, FONT_LATIN_SEMI, FONT_LATIN_MEDIUM,
  FONT_HEADING_SEMI, FONT_HEADING_EXTRA, FONT_ARABIC_BLACK,
} from '../../components/design/tokens';
import { SPACE, SCREEN_MARGIN } from '../../components/design/spacing';
import { useTheme } from '../../hooks/useTheme';
import { STRINGS } from '../../constants/strings';
import { FadeIn, ShimmerButton } from '../../components/ui';
import { haptic } from '../../lib/haptics';
import type { OnboardingStepProps } from './types';

/**
 * The mode watermark roots, enabled after review.
 *
 * WHAT WAS CHECKED, and by whom: this is Claude's analysis at Ahmed's request,
 * not a native-speaker review. Recording the distinction because
 * docs/language/authority.md exists to stop exactly that conflation.
 *
 *   1. The roots are correct for the senses used. ع-م-ل underlies عمل / عامل
 *      (work, worker); ص-ح-ب underlies صاحب / صحبة (companion, company). Both
 *      are standard triliteral roots, not coinages.
 *   2. They do not engage the no-MSA rule. That rule bans MSA word FORMS, and
 *      a bare root is not a form in any variety — it is the consonantal
 *      skeleton MSA and Khaleeji both derive from. Both roots are live in Gulf
 *      speech (صاحبي "my friend", عمل "work"), so neither is MSA-specific.
 *   3. Orthography passes: bare letters, no tashkeel. Enforced now rather than
 *      asserted, since the strings live in STRINGS and the lint walks it.
 *
 * WHAT WAS NOT CHECKED: whether an Emirati reader finds the device natural or
 * odd. That is a naturalness judgement and needs a native speaker.
 *
 * The risk that carries is small and worth naming: this is decoration at 3-8%
 * opacity, hidden from screen readers, that nobody is asked to read, say or
 * learn. Being wrong here is an aesthetic miss, not a teaching error — which is
 * a materially lower bar than a phrase card, and why this ships while the
 * corpus stays UNSOURCED.
 */
const MODE_ROOTS_APPROVED = true;
const MODE_ROOTS: Record<'career' | 'social', string> = {
  career: STRINGS.onboarding.modeRootCareer,
  social: STRINGS.onboarding.modeRootSocial,
};

/**
 * Step 1: Career or Social.
 *
 * This forks the whole product -- which scenarios exist, which phrases are
 * taught, and what the relationship metric is even called. It is the
 * differentiator, so it is the one screen where Sadaf's ruled-page logic
 * breaks: two full-width plates, edge to edge, separated by a single hairline.
 *
 * Selection is carried by TYPE, not by fill: the chosen plate's title takes
 * C.PRIMARY and its body stays at full strength, while the other plate's text
 * drops to C.TEXT3. Nothing gains a border or a background.
 */
export function ModeStep({ next, draft }: OnboardingStepProps) {
  const { C } = useTheme();
  const insets = useSafeAreaInsets();
  const { mode, modeChosen, chooseMode } = draft;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: C.BG, paddingTop: insets.top + SPACE.huge },
        header: { paddingHorizontal: SCREEN_MARGIN, marginBottom: SPACE.xl },
        title: {
          fontFamily: FONT_HEADING_EXTRA,
          fontSize: 28,
          letterSpacing: -0.5,
          color: C.TEXT,
          marginBottom: SPACE.xs,
        },
        headerSub: { fontFamily: FONT_LATIN_MEDIUM, fontSize: 16, color: C.TEXT2 },
        plates: { flex: 1 },
        plate: {
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: SCREEN_MARGIN,
          paddingVertical: SPACE.xl,
          overflow: 'hidden',
        },
        // The only separator on the screen. No cards, no radius, no fills.
        divider: { height: StyleSheet.hairlineWidth, backgroundColor: C.BORDER },
        watermark: {
          position: 'absolute',
          right: -SPACE.xl,
          bottom: -SPACE.xl,
          fontFamily: FONT_ARABIC_BLACK,
          fontSize: 150,
          lineHeight: 150,
          color: C.TEXT,
          includeFontPadding: false,
        },
        plateTitle: { fontFamily: FONT_HEADING_SEMI, fontSize: 28, letterSpacing: -0.4 },
        plateSub: {
          fontFamily: FONT_LATIN_SEMI,
          fontSize: 12,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          marginBottom: SPACE.sm,
        },
        plateDesc: { fontFamily: FONT_LATIN, fontSize: 16, lineHeight: 24, maxWidth: 420 },
        footer: {
          paddingHorizontal: SCREEN_MARGIN,
          paddingTop: SPACE.lg,
          paddingBottom: insets.bottom + SPACE.xl,
        },
      }),
    [C, insets.top, insets.bottom],
  );

  const plates = [
    {
      id: 'career' as const,
      Icon: Briefcase,
      title: STRINGS.onboarding.careerMode,
      sub: STRINGS.onboarding.careerSub,
      desc: STRINGS.onboarding.careerDesc,
    },
    {
      id: 'social' as const,
      Icon: Users,
      title: STRINGS.onboarding.socialMode,
      sub: STRINGS.onboarding.socialSub,
      desc: STRINGS.onboarding.socialDesc,
    },
  ];

  return (
    <View style={styles.root}>
      <FadeIn delay={100}>
        <View style={styles.header}>
          <Text style={styles.title}>{STRINGS.onboarding.choosePath}</Text>
          <Text style={styles.headerSub}>{STRINGS.onboarding.choosePathSub}</Text>
        </View>
      </FadeIn>

      <View style={styles.plates}>
        {plates.map(({ id, Icon, title, sub, desc }, i) => {
          // Nothing is selected until the learner picks. `mode` still holds a
          // valid default underneath, so the profile is never malformed — but
          // the screen must not show a decision nobody made.
          const selected = modeChosen && mode === id;
          return (
            <React.Fragment key={id}>
              {i > 0 && <View style={styles.divider} />}
              <Pressable
                onPress={() => { haptic.selection(); chooseMode(id); }}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${title}. ${sub}. ${desc}`}
                style={styles.plate}
              >
                {MODE_ROOTS_APPROVED && (
                  <Text
                    style={[styles.watermark, { opacity: selected ? 0.08 : 0.03 }]}
                    accessibilityElementsHidden
                    importantForAccessibility="no"
                  >
                    {MODE_ROOTS[id]}
                  </Text>
                )}

                <MotiView
                  animate={{ translateX: selected ? 4 : 0 }}
                  transition={{ type: 'timing', duration: 220 }}
                >
                  <Icon
                    size={22}
                    strokeWidth={1.5}
                    color={selected ? C.PRIMARY : C.TEXT3}
                    style={{ marginBottom: SPACE.md }}
                  />
                  <Text style={[styles.plateSub, { color: selected ? C.PRIMARY : C.TEXT3 }]}>
                    {sub}
                  </Text>
                  <Text style={[styles.plateTitle, { color: selected ? C.PRIMARY : C.TEXT3 }]}>
                    {title}
                  </Text>
                  <Text style={[styles.plateDesc, { color: selected ? C.TEXT2 : C.TEXT3, marginTop: SPACE.sm }]}>
                    {desc}
                  </Text>
                </MotiView>
              </Pressable>
            </React.Fragment>
          );
        })}
      </View>

      <View style={styles.footer}>
        <FadeIn delay={400}>
          <ShimmerButton
            onPress={next}
            disabled={!modeChosen}
            Icon={ArrowRight}
            accessibilityLabel={STRINGS.common.continue}
          >
            {STRINGS.common.continue}
          </ShimmerButton>
        </FadeIn>
      </View>
    </View>
  );
}
