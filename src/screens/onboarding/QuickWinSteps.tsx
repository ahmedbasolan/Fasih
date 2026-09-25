import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Bell, Star, TrendingUp, Check } from '../../components/icons';
import { FONT_ARABIC, FONT_LATIN, FONT_LATIN_SEMI, FONT_LATIN_MEDIUM, FONT_HEADING_EXTRA, ARABIC_SCALE } from '../../components/design/tokens';
import { SPACE, RADIUS } from '../../components/design/spacing';
import { TYPE, ONBOARDING_CHROME_HEIGHT } from '../../components/design/layout';
import { useTheme } from '../../hooks/useTheme';
import { useArabicTTS } from '../../hooks/useArabicTTS';
import { STRINGS } from '../../constants/strings';
import { FadeIn, ShimmerButton, Screen, Stack } from '../../components/ui';
import { useAppStore } from '../../store/useAppStore';
import { OnboardingScenarioPlayer } from '../../components/onboarding/OnboardingScenarioPlayer';
import { getOnboardingScenario, getOnboardingScript } from '../../constants/scenarios';
import { Companion } from '../../components/ui/Companion';
import { haptic } from '../../lib/haptics';
import type { OnboardingStepProps } from './types';

/**
 * Steps 6-8: notification opt-ins, the first phrase, and the taster scenario.
 *
 * This is the quick win -- the learner speaks Arabic before being asked to pay.
 */
export function QuickWinSteps({ screen, next, draft, quickWin, hold }: OnboardingStepProps) {
  const { C } = useTheme();
  const insets = useSafeAreaInsets();
  const { speak } = useArabicTTS();
  const unlockPhrase = useAppStore((s) => s.unlockPhrase);
  const unlockedPhraseIds = useAppStore((s) => s.unlockedPhraseIds);
  const { mode, name } = draft;
  const { holdComplete } = hold;
  const {
    phraseRevealed, setPhraseRevealed, setPhraseEverRevealed,
    setScenarioCompleted, toggleNotifs, setToggleNotifs,
    phraseEverRevealed, scenarioCompleted,
  } = quickWin;

  switch (screen) {
      /* Notification opt-ins.
         Was a skeuomorphic SVG phone -- metallic bezel, glass glare, a fake
         drop-shadowed notification -- above three floating drop-shadowed cards.
         Six hardcoded hex literals and two shadows, none of it telling the
         learner anything. It is now three ruled rows. */
      case 'notifications':
        return (
          <Screen
            onboardingChrome
            action={
              <Stack gap="md">
                <FadeIn delay={550}>
                  <ShimmerButton onPress={next} Icon={Bell} accessibilityLabel={STRINGS.onboarding.notifAllow}>
                    {STRINGS.onboarding.notifAllow}
                  </ShimmerButton>
                </FadeIn>
                <FadeIn delay={620}>
                  <Pressable onPress={next} accessibilityRole="button" style={{ paddingVertical: SPACE.md, alignItems: 'center' }}>
                    <Text style={{ ...TYPE.body, fontFamily: FONT_LATIN, color: C.TEXT2 }}>{STRINGS.onboarding.notifLater}</Text>
                  </Pressable>
                </FadeIn>
              </Stack>
            }
          >
            <FadeIn delay={100}>
              <Bell size={24} strokeWidth={1.5} color={C.PRIMARY} style={{ marginBottom: SPACE.lg }} />
              <Text style={{ fontFamily: FONT_HEADING_EXTRA, fontSize: 28, letterSpacing: -0.5, color: C.TEXT, marginBottom: SPACE.sm }}>
                {STRINGS.onboarding.notifTitle}
              </Text>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 16, lineHeight: 24, color: C.TEXT2, marginBottom: SPACE.xl }}>
                {STRINGS.onboarding.notifSub}
              </Text>
            </FadeIn>

            <View>
              {([
                { NotifIcon: Bell,       text: STRINGS.onboarding.notifStreak,     sub: STRINGS.onboarding.notifStreakSub },
                { NotifIcon: Star,       text: STRINGS.onboarding.notifScenarios,  sub: STRINGS.onboarding.notifScenariosSub },
                { NotifIcon: TrendingUp, text: STRINGS.onboarding.notifMilestones, sub: STRINGS.onboarding.notifMilestonesSub },
              ] as const).map(({ NotifIcon, text, sub }, i) => (
                <FadeIn key={text} delay={250 + i * 80}>
                  <Pressable
                    onPress={() => {
                      haptic.selection();
                      setToggleNotifs(prev => prev.map((v, idx) => idx === i ? !v : v));
                    }}
                    accessibilityRole="switch"
                    accessibilityLabel={`${text}. ${sub}`}
                    accessibilityState={{ checked: toggleNotifs[i] }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: SPACE.md,
                      paddingVertical: SPACE.lg,
                      borderTopWidth: i === 0 ? StyleSheet.hairlineWidth : 0,
                      borderTopColor: C.BORDER,
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: C.BORDER,
                    }}
                  >
                    <NotifIcon
                      size={20}
                      strokeWidth={1.5}
                      color={toggleNotifs[i] ? C.PRIMARY : C.TEXT3}
                    />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 16, color: toggleNotifs[i] ? C.TEXT : C.TEXT3 }}>{text}</Text>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, lineHeight: 20, color: C.TEXT3, marginTop: 2 }}>{sub}</Text>
                    </View>
                    {/* The track is the only rounded thing on the screen, and it
                        earns it: a pill is what a switch looks like.

                        Knob position is the state, so the knob has to be visible
                        in BOTH states. C.BG on C.PRIMARY is 11.52 dark / 5.37
                        light; C.BG on C.TEXT3 is 5.83 / 5.27. The obvious
                        off-track, C.BORDER2, gives 1.97 / 1.76 -- a knob you
                        cannot find is a switch you cannot read. */}
                    <MotiView
                      animate={{ backgroundColor: toggleNotifs[i] ? C.PRIMARY : C.TEXT3 }}
                      transition={{ type: 'timing', duration: 200 }}
                      style={{ width: 44, height: 26, borderRadius: RADIUS.pill, padding: 3, justifyContent: 'center' }}
                    >
                      <MotiView
                        animate={{ translateX: toggleNotifs[i] ? 18 : 0 }}
                        transition={{ type: 'timing', duration: 200 }}
                        style={{ width: 20, height: 20, borderRadius: RADIUS.pill, backgroundColor: C.BG }}
                      />
                    </MotiView>
                  </Pressable>
                </FadeIn>
              ))}
            </View>

          </Screen>
        );

      case 'phrase':
        return (
          // Centred composition with inline buttons rather than a pinned action,
          // so it lays itself out. The chrome padding is still needed: it
          // centres the content in the space BELOW the progress bar and back
          // button, not in the whole screen — without it the mascot drifts up
          // under the chrome as soon as the revealed state adds two more rows.
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingTop: insets.top + ONBOARDING_CHROME_HEIGHT, backgroundColor: C.BG }}>
            {/* Mascot at top */}
            <View style={{ marginBottom: 24 }}>
              <Companion size={80} name={name} />
            </View>

            <Text style={{
              fontFamily: FONT_LATIN_SEMI,
              fontSize: 14,
              color: C.TEXT2,
              textAlign: 'center',
              marginBottom: 8,
            }}>
              {STRINGS.onboarding.firstPhraseEyebrow}
            </Text>

            <Text style={{
              fontFamily: FONT_ARABIC,
              fontSize: Math.round(42 * ARABIC_SCALE),
              color: C.PRIMARY,
              textAlign: 'center',
              writingDirection: 'rtl',
              marginBottom: 6,
            }}>
              {STRINGS.onboarding.firstPhraseArabic}
            </Text>

            <Text style={{
              fontFamily: FONT_LATIN_MEDIUM,
              fontSize: 14,
              color: C.TEXT2,
              marginBottom: 4,
            }}>
              {STRINGS.onboarding.firstPhraseRoman}
            </Text>

            <Text style={{
              fontFamily: FONT_LATIN,
              fontSize: 14,
              color: C.TEXT3,
              marginBottom: 4,
            }}>
              {STRINGS.onboarding.firstPhraseEnglish}
            </Text>

            {!phraseRevealed ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={STRINGS.onboarding.firstPhraseHear}
                onPress={() => {
                  setPhraseRevealed(true);
                  setPhraseEverRevealed(true);
                  speak(STRINGS.onboarding.firstPhraseArabic);
                }}
                style={{
                  marginTop: 20,
                  paddingHorizontal: 28,
                  paddingVertical: 14,
                  borderRadius: 16,
                  backgroundColor: C.PRIMARY,
                }}
              >
                <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 16, color: C.BG, fontWeight: '700' }}>
                  {STRINGS.onboarding.firstPhraseHear}
                </Text>
              </Pressable>
            ) : (
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 300 }}
                style={{ alignItems: 'center', marginTop: 16 }}
              >
                {/* The payoff is the contrast, not the translation. Saying it
                    is the win; knowing it is not what the textbook taught is
                    the reason to keep going. */}
                <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 16, color: C.TEXT, textAlign: 'center', marginBottom: SPACE.md }}>
                  {STRINGS.onboarding.firstPhraseDone}
                </Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, lineHeight: 20, color: C.TEXT2, textAlign: 'center', marginBottom: SPACE.xl }}>
                  {STRINGS.onboarding.firstPhraseWhy}
                </Text>
                <Pressable
                  onPress={next}
                  accessibilityRole="button"
                  accessibilityLabel={STRINGS.common.continue}
                  style={{
                    paddingHorizontal: 28,
                    paddingVertical: 14,
                    borderRadius: 16,
                    backgroundColor: C.PRIMARY,
                  }}
                >
                  <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 16, color: C.BG, fontWeight: '700' }}>
                    {STRINGS.common.continue}
                  </Text>
                </Pressable>
              </MotiView>
            )}
          </View>
        );

      /* The progress reveal, immediately before the paywall.
         The paywall's title, subtitle and CTA all say "don't lose your
         progress" to a learner who had never been shown any. This is what
         makes those three strings true.

         Every row is gated on the state that proves it happened. A learner who
         swiped past the scenario does not get told they held a conversation —
         a summary that claims credit for skipped steps is worth less than no
         summary, because the one thing it has to be is believable. */
      case 'progress': {
        const done = [
          { key: 'phrase', label: STRINGS.onboarding.progressPhraseHeard, show: phraseEverRevealed },
          { key: 'scenario', label: STRINGS.onboarding.progressScenarioDone, show: scenarioCompleted },
          {
            key: 'unlocked',
            label: STRINGS.onboarding.progressPhrasesUnlocked(unlockedPhraseIds.length),
            show: unlockedPhraseIds.length > 0,
          },
          { key: 'committed', label: STRINGS.onboarding.progressCommitted, show: holdComplete },
        ].filter(r => r.show);

        return (
          <Screen
            onboardingChrome
            action={
              <FadeIn delay={400}>
                <ShimmerButton onPress={next} accessibilityLabel={STRINGS.onboarding.progressContinue}>
                  {STRINGS.onboarding.progressContinue}
                </ShimmerButton>
              </FadeIn>
            }
          >
            <FadeIn delay={100}>
              <Text style={{ fontFamily: FONT_HEADING_EXTRA, fontSize: 28, letterSpacing: -0.5, color: C.TEXT, marginBottom: SPACE.sm }}>
                {STRINGS.onboarding.progressTitle}
              </Text>
              <Text style={{ ...TYPE.bodyLarge, fontFamily: FONT_LATIN, color: C.TEXT2, marginBottom: SPACE.xl }}>
                {STRINGS.onboarding.progressSub}
              </Text>
            </FadeIn>

            {/* Ruled rows, no fills — the same treatment as the notification
                opt-ins two screens earlier. */}
            <View>
              {done.map(({ key, label }, i) => (
                <FadeIn key={key} delay={200 + i * 80}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: SPACE.md,
                      paddingVertical: SPACE.lg,
                      borderTopWidth: i === 0 ? StyleSheet.hairlineWidth : 0,
                      borderTopColor: C.BORDER,
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: C.BORDER,
                    }}
                  >
                    <Check size={20} strokeWidth={1.5} color={C.PRIMARY} />
                    <Text style={{ ...TYPE.bodyLarge, fontFamily: FONT_LATIN_SEMI, color: C.TEXT, flex: 1, minWidth: 0 }}>
                      {label}
                    </Text>
                  </View>
                </FadeIn>
              ))}
            </View>

            <FadeIn delay={200 + done.length * 80}>
              <View style={{ marginTop: SPACE.xl }}>
                <Text style={{ fontFamily: FONT_HEADING_EXTRA, fontSize: 34, letterSpacing: -0.5, color: C.PRIMARY }}>
                  {STRINGS.onboarding.progressDayOne}
                </Text>
                <Text style={{ ...TYPE.body, fontFamily: FONT_LATIN, color: C.TEXT2, marginTop: SPACE.xs }}>
                  {STRINGS.onboarding.progressDayOneSub}
                </Text>
              </View>
            </FadeIn>
          </Screen>
        );
      }

      // Onboarding Scenario — Café
      case 'scenario': {
        const onboardingScenario = getOnboardingScenario(C);
        // Use the local mode state — user hasn't been saved to the store yet at this step
        const script = onboardingScenario ? getOnboardingScript(mode) : undefined;

        if (!script) {
          return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: C.TEXT2 }}>{STRINGS.common.loading}</Text></View>;
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
