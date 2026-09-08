import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACE, SCREEN_MARGIN } from '../components/design/spacing';
import { MotiView, AnimatePresence } from 'moti';
import { GestureDetector, Gesture, Directions } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { ChevronLeft } from '../components/icons';
import { useTheme } from '../hooks/useTheme';
import { useTypewriter } from '../components/design/hooks';
import { STRINGS } from '../constants/strings';
import { GhostLetters } from '../components/ui';
import type { UserProfile } from '../types';
import { computeOnboardingChecklist, computeDailyGoalXP } from '../engine/onboardingProgress';
import { useUser } from '@clerk/expo';
import { haptic } from '../lib/haptics';
import { PaywallSteps } from './onboarding/PaywallSteps';
import { QuickWinSteps } from './onboarding/QuickWinSteps';
import { ProfileSteps } from './onboarding/ProfileSteps';
import { ModeStep } from './onboarding/ModeStep';
import { IdentityStep } from './onboarding/IdentityStep';
import type { OnboardingStepProps } from './onboarding/types';


interface Props {
  onComplete: (profile: UserProfile) => void;
  onStartTrial: (plan: 'monthly' | 'yearly') => Promise<boolean>;
  onSkipTrial: () => void;
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  const { C } = useTheme();
  const insets = useSafeAreaInsets();
  const [segmentWidth, setSegmentWidth] = React.useState(0);
  return (
    <View
      onLayout={(e) => setSegmentWidth((e.nativeEvent.layout.width - 4 * (total - 1)) / total)}
      style={{ position: 'absolute', top: insets.top + SPACE.md, left: 24, right: 24, zIndex: 20, flexDirection: 'row', gap: 4 }}
      accessibilityLabel={`Step ${step + 1} of ${total}`}
      accessibilityRole="progressbar"
    >
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: C.SURFACE, overflow: 'hidden' }}>
          <MotiView
            animate={{ width: i <= step ? segmentWidth : 0 }}
            transition={{ type: 'timing', duration: 380, delay: i * 40 }}
            style={{ height: 4, borderRadius: 2, backgroundColor: i <= step ? C.PRIMARY : 'transparent' }}
          />
        </View>
      ))}
    </View>
  );
}

export function OnboardingFlow({ onComplete, onStartTrial, onSkipTrial }: Props) {
  const { C } = useTheme();
  const { user: clerkUser } = useUser();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');

  useEffect(() => {
    if (clerkUser?.firstName && !name) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(clerkUser.firstName);
    }
  }, [clerkUser, name]);
  const [mode, setMode] = useState<'career' | 'social'>('career');
  // See OnboardingDraft.modeChosen: `mode` keeps a valid default so the profile
  // and the analytics row are always well-formed, but the mode screen must not
  // present a pre-made choice as if the learner made it.
  const [modeChosen, setModeChosen] = useState(false);
  const chooseMode = useCallback((m: 'career' | 'social') => {
    setMode(m);
    setModeChosen(true);
  }, []);
  // Arabic marks the speaker's own gender, so we need this to teach the right
  // forms — it also gates scenarios that only work for one gender.
  const [gender, setGender] = useState<'male' | 'female' | undefined>(undefined);
  const [role, setRole] = useState('');
  const [profession, setProfession] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');
  const holdProgress = useSharedValue(0);
  const [holdComplete, setHoldComplete] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [phraseRevealed, setPhraseRevealed] = useState(false);
  const [phraseEverRevealed, setPhraseEverRevealed] = useState(false);
  const [scenarioCompleted, setScenarioCompleted] = useState(false);
  // Notification toggles for Step 6 — default all on to feel welcoming
  const [toggleNotifs, setToggleNotifs] = useState([true, true, true]);
  // Haptic pulses and completion, scheduled once per hold rather than checked
  // every frame. Cleared on release and on unmount.
  const holdTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  
  const TOTAL = 12; // 0-6 setup, 7 quick win, 8 scenario, 9 paywall (timeline), 10 features, 11 paywall (plans)
  const HOLD_DURATION = 2200;

  // Compute Arabic greeting for name input
  const arabicGreeting =
    name.length === 0 ? ''
    : name.length < 3 ? STRINGS.onboarding.greetingStub
    : name.length < 5 ? STRINGS.onboarding.greetingShort
    : STRINGS.onboarding.greetingFull(name);
  
  // Character-by-character typewriter effect for Arabic
  const { displayed: typedGreeting } = useTypewriter(arabicGreeting, 80, 0);

  const finish = useCallback(() => {
    const onboardingChecklist = computeOnboardingChecklist({
      profession, goalsCount: selectedGoals.length, holdComplete, phraseRevealed: phraseEverRevealed, scenarioCompleted,
    });
    const dailyGoalXP = computeDailyGoalXP(selectedGoals.length, mode);
    onComplete({ name: name || 'Guest', mode, gender, role, profession, goals: selectedGoals, plan, onboardingChecklist, dailyGoalXP });
  }, [onComplete, name, mode, gender, role, profession, selectedGoals, plan, holdComplete, phraseEverRevealed, scenarioCompleted]);
  const finishWithTrial = useCallback(async () => {
    haptic.success();
    const shouldFinish = await onStartTrial(plan);
    if (shouldFinish) finish();
  }, [onStartTrial, plan, finish]);
  const next = useCallback(() => {
    haptic.light();
    if (step < TOTAL - 1) setStep(s => s + 1);
    else finishWithTrial();
  }, [step, finishWithTrial]);
  const back = useCallback(() => {
    if (step > 0) {
      haptic.light();
      setStep(s => s - 1);
    }
  }, [step]);
  const skip = useCallback(() => {
    Alert.alert(
      STRINGS.onboarding.skipWarningTitle,
      STRINGS.onboarding.skipWarningMessage,
      [
        {
          text: STRINGS.onboarding.skipWarningCancel,
          style: 'cancel',
        },
        {
          text: STRINGS.onboarding.skipWarningConfirm,
          onPress: () => {
            onSkipTrial();
            finish();
          },
        },
      ]
    );
  }, [onSkipTrial, finish]);

  const toggleGoal = (id: string) => {
    haptic.selection();
    setSelectedGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  /**
   * Start the hold.
   *
   * The ring is driven by a shared value on the UI thread; the state machine is
   * driven by four timers. Nothing re-renders between press-in and press-out.
   *
   * This replaced a 16ms `setInterval` that called `setHoldProgress` — roughly
   * 137 re-renders of this whole tree per hold, each one rebuilding `stepProps`
   * and re-running every case in ProfileSteps. That was the stutter.
   *
   * Completion stays on a JS timer rather than an animation callback, so if the
   * animation driver is unavailable the ring simply does not fill — the hold
   * still completes and the flow still advances.
   */
  const startHold = useCallback(() => {
    if (holdComplete) return;
    setIsHolding(true);
    holdProgress.value = withTiming(1, {
      duration: HOLD_DURATION,
      easing: Easing.linear,
    });

    // Haptics as scheduled pulses instead of a per-frame percentage check.
    holdTimers.current = [33, 66].map((pct) =>
      setTimeout(() => haptic.medium(), HOLD_DURATION * (pct / 100)),
    );
    holdTimers.current.push(
      setTimeout(() => {
        haptic.medium();
        setHoldComplete(true);
        setIsHolding(false);
        setTimeout(() => nextRef.current(), 700);
      }, HOLD_DURATION),
    );
  }, [holdComplete, holdProgress]);

  const clearHoldTimers = useCallback(() => {
    holdTimers.current.forEach(clearTimeout);
    holdTimers.current = [];
  }, []);

  const endHold = useCallback(() => {
    if (holdComplete) return;
    clearHoldTimers();
    setIsHolding(false);
    // Springs back rather than snapping, so an accidental lift reads as
    // "released" instead of as a glitch.
    holdProgress.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.quad) });
  }, [holdComplete, clearHoldTimers, holdProgress]);

  useEffect(() => clearHoldTimers, [clearHoldTimers]);

  const circum = 2 * Math.PI * 52;
  
  // -- Stable State Refs for Gestures --
  const stepRef = useRef(step);
  const nameRef = useRef(name);
  const genderRef = useRef(gender);
  const modeChosenRef = useRef(modeChosen);
  const holdCompleteRef = useRef(holdComplete);
  const nextRef = useRef(next);
  const backRef = useRef(back);

  useEffect(() => {
    stepRef.current = step;
    nameRef.current = name;
    genderRef.current = gender;
    modeChosenRef.current = modeChosen;
    holdCompleteRef.current = holdComplete;
    nextRef.current = next;
    backRef.current = back;
  }, [step, name, gender, modeChosen, holdComplete, next, back]);

  useEffect(() => {
    setPhraseRevealed(false);
  }, [step]);

  // -- Swipe Gesture Logic (Memoized) --
  const composedGesture = useMemo(() => {
    const swipeNext = () => {
      // Block swiping next on steps that require explicit interaction.
      // Step 1 is here for the same reason its Continue button is disabled:
      // a swipe past an unmade mode choice would bank the default silently.
      if (stepRef.current === 1 && !modeChosenRef.current) return;
      if (stepRef.current === 2 && (!nameRef.current.trim() || !genderRef.current)) return;
      if (stepRef.current === 5 && !holdCompleteRef.current) return;
      nextRef.current();
    };

    const leftFling = Gesture.Fling()
      .direction(Directions.LEFT)
      .onEnd(() => {
        runOnJS(swipeNext)();
      });

    // Mirrors swipeNext: a plain JS closure that dereferences the ref when it
    // runs. `runOnJS(backRef.current)()` would read .current at the point the
    // gesture callback is constructed rather than inside the JS-thread call,
    // which is the kind of asymmetry that works until RNGH decides to treat
    // this callback as a worklet.
    const swipeBack = () => {
      backRef.current();
    };

    const rightFling = Gesture.Fling()
      .direction(Directions.RIGHT)
      .onEnd(() => {
        runOnJS(swipeBack)();
      });

    return Gesture.Exclusive(leftFling, rightFling);
    // Created once on purpose: next/back are reached through nextRef/backRef,
    // which are kept current by the effect above, so this closure never goes
    // stale and has no reactive dependencies to declare.
  }, []);

  // The contract every step component receives. Assembled once here so the
  // switch below reads as routing rather than as twelve different call shapes.
  const stepProps: OnboardingStepProps = {
    step,
    next,
    skip,
    finishWithTrial,
    draft: {
      name, setName, mode, setMode, modeChosen, chooseMode, gender, setGender, role, setRole,
      profession, setProfession, selectedGoals, toggleGoal, plan, setPlan,
      typedGreeting,
    },
    hold: { holdProgress, holdComplete, isHolding, startHold, endHold, circum },
    quickWin: {
      phraseRevealed, setPhraseRevealed, setPhraseEverRevealed,
      setScenarioCompleted, toggleNotifs, setToggleNotifs,
    },
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <IdentityStep {...stepProps} />;

      case 1:
        return <ModeStep {...stepProps} />;

      // Steps 2-5: name, role, goals, hold-to-commit. See ProfileSteps.
      case 2:
      case 3:
      case 4:
      case 5:
        return <ProfileSteps {...stepProps} />;


      // Steps 6-8: the quick win -- notifications, the first phrase, and the
      // taster scenario. See QuickWinSteps.
      case 6:
      case 7:
      case 8:
        return <QuickWinSteps {...stepProps} />;

      // Steps 9-11: the paywall. See PaywallSteps -- next advances the three
      // screens, finishWithTrial subscribes, skip leaves without subscribing.
      case 9:
      case 10:
      case 11:
        return <PaywallSteps {...stepProps} />;

      default:
        return null;
    }
  };

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={{ flex: 1, backgroundColor: C.BG }}>
        <GhostLetters glyphs={['ب', 'د', 'أ']} />
        {step > 0 && step < 11 && <ProgressBar step={step} total={11} />}
        
        <AnimatePresence>
          {step > 0 && (
            <MotiView
              key="back-btn"
              from={{ opacity: 0, translateX: -10 }}
              animate={{ opacity: 1, translateX: 0 }}
              exit={{ opacity: 0, translateX: -10 }}
              transition={{ type: 'timing', duration: 250 }}
              style={{ position: 'absolute', top: insets.top + SPACE.xl, left: SCREEN_MARGIN, zIndex: 30 }}
            >
              <Pressable
                onPress={back}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ChevronLeft size={28} color={C.TEXT3} />
              </Pressable>
            </MotiView>
          )}
        </AnimatePresence>

        {renderStep()}
      </View>
    </GestureDetector>
  );
}
