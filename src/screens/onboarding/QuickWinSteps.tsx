import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import Svg, { Circle, Path, Rect, Defs, Stop, LinearGradient as SvgLinearGradient, G as SvgG } from 'react-native-svg';
import { Bell, Star, TrendingUp } from '../../components/icons';
import { FONT_ARABIC, FONT_LATIN, FONT_LATIN_SEMI, FONT_LATIN_MEDIUM, FONT_HEADING_SEMI, ARABIC_SCALE } from '../../components/design/tokens';
import { ANGLE_135 } from '../../components/design/gradients';
import { useTheme } from '../../hooks/useTheme';
import { useArabicTTS } from '../../hooks/useArabicTTS';
import { STRINGS } from '../../constants/strings';
import { FadeIn, ShimmerButton } from '../../components/ui';
import { useAppStore } from '../../store/useAppStore';
import { OnboardingScenarioPlayer } from '../../components/onboarding/OnboardingScenarioPlayer';
import { getOnboardingScenario, getScenarioScript } from '../../constants/scenarios';
import { Companion } from '../../components/ui/Companion';
import { haptic } from '../../lib/haptics';
import type { OnboardingStepProps } from './types';

/**
 * Steps 6-8: notification opt-ins, the first phrase, and the taster scenario.
 *
 * This is the quick win -- the learner speaks Arabic before being asked to pay.
 */
export function QuickWinSteps({ step, next, draft, quickWin }: OnboardingStepProps) {
  const { C, G, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { speak } = useArabicTTS();
  const unlockPhrase = useAppStore((s) => s.unlockPhrase);
  const { mode } = draft;
  const {
    phraseRevealed, setPhraseRevealed, setPhraseEverRevealed,
    setScenarioCompleted, toggleNotifs, setToggleNotifs,
  } = quickWin;

  switch (step) {
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
            <View style={{ marginBottom: 24 }}>
              <Companion size={80} />
            </View>

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
      default:
        return null;
    }
}
