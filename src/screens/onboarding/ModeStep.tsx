import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, AnimatePresence } from 'moti';
import { Briefcase, Users, Check } from '../../components/icons';
import { FONT_LATIN, FONT_LATIN_SEMI, FONT_LATIN_MEDIUM, FONT_HEADING_SEMI, FONT_HEADING_EXTRA } from '../../components/design/tokens';
import { useTheme } from '../../hooks/useTheme';
import { STRINGS } from '../../constants/strings';
import { FadeIn, ShimmerButton } from '../../components/ui';
import { IMAGES } from '../../constants/images';
import { haptic } from '../../lib/haptics';
import type { OnboardingStepProps } from './types';

/**
 * Step 1: Career or Social.
 *
 * The fork that shapes every scenario, phrase and metric label afterwards --
 * the differentiator, and the one screen in the app that earns a full-bleed
 * treatment.
 */
export function ModeStep({ next, draft }: OnboardingStepProps) {
  const { C } = useTheme();
  const insets = useSafeAreaInsets();
  const { mode, setMode } = draft;

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
}
