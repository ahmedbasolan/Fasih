import React from 'react';
import { View, Text, Pressable, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Sun, Moon } from '../../components/icons';
import { FONT_LATIN, FONT_HEADING_SEMI, FONT_HEADING_EXTRA } from '../../components/design/tokens';
import { ANGLE_135 } from '../../components/design/gradients';
import { useTheme } from '../../hooks/useTheme';
import { STRINGS } from '../../constants/strings';
import { FadeIn, SwitchButton } from '../../components/ui';
import { useAppStore } from '../../store/useAppStore';
import { IMAGES } from '../../constants/images';
import type { OnboardingStepProps } from './types';

/**
 * Step 0: welcome and the theme toggle.
 *
 * Note what is NOT here: the gender choice lives on step 2 beside the name,
 * as a labelled two-option control. The art on this screen is decoration.
 */
export function IdentityStep({ next, draft }: OnboardingStepProps) {
  const { C, G, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const setTheme = useAppStore((s) => s.setTheme);
  const { mode } = draft;

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
}
