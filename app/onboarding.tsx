import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '../src/store/useAppStore';
import { OnboardingFlow } from '../src/screens/OnboardingFlow';
import { STRINGS } from '../src/constants/strings';
import type { UserProfile } from '../src/types';
import {
  trackOnboardingCompleted,
  trackTrialStarted,
} from '../src/lib/analytics';

export default function OnboardingRoute() {
  const setUser = useAppStore((s) => s.setUser);
  const setHasOnboarded = useAppStore((s) => s.setHasOnboarded);
  const grantStreakFreeze = useAppStore((s) => s.grantStreakFreeze);
  const purchaseSubscription = useAppStore((s) => s.purchaseSubscription);
  const presentPaywall = useAppStore((s) => s.presentPaywall);
  const startTrial = useAppStore((s) => s.startTrial);
  const skipTrial = useAppStore((s) => s.skipTrial);

  const handleComplete = (profile: UserProfile) => {
    setUser(profile);
    setHasOnboarded(true);
    grantStreakFreeze(1);
    trackOnboardingCompleted({
      name: profile.name,
      mode: profile.mode,
      role: profile.role,
      plan: profile.plan ?? 'none',
      goals: profile.goals,
    });
    router.replace('/(tabs)');
  };

  // Called when user taps "Start Free Trial" on the paywall step.
  // Strategy:
  //   1. Try RevenueCat's hosted paywall first (best UX, handles all 3 plans).
  //   2. If paywall UI is unavailable (no internet / simulator), fall back to
  //      direct purchase of the selected plan.
  //   3. If that also fails: in dev, grant a local trial so testing isn't
  //      blocked. In production, never grant free access on a failed
  //      purchase — trials must go through a real payment method (App
  //      Store / Play Store require one for any subscription trial), so a
  //      transient RevenueCat/store error should surface as a retryable
  //      error, not a silent free trial.
  const handleStartTrial = async (plan: 'monthly' | 'yearly') => {
    // Attempt RevenueCat hosted paywall (shows all plans including lifetime)
    const paywallResult = await presentPaywall();
    if (paywallResult.purchased) {
      trackTrialStarted(plan);
      return;
    }

    // Fallback: direct purchase of the plan the user selected in the UI
    const { cancelled, error } = await purchaseSubscription(plan);
    if (cancelled) return; // user dismissed — stay on paywall step

    if (error) {
      if (__DEV__) {
        // Store / RevenueCat unreachable (e.g., simulator) — grant local trial
        startTrial(plan);
        trackTrialStarted(plan);
      } else {
        Alert.alert(STRINGS.onboarding.purchaseErrorTitle, STRINGS.onboarding.purchaseErrorMessage);
      }
      return;
    }

    // On success, purchaseSubscription already set status to 'subscribed'
    trackTrialStarted(plan);
  };

  return (
    <OnboardingFlow
      onComplete={handleComplete}
      onStartTrial={handleStartTrial}
      onSkipTrial={skipTrial}
    />
  );
}
