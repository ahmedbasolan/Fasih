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
  // Returns whether onboarding should proceed to completion — the caller
  // must await this and only navigate away when it resolves true, so a
  // cancelled or failed purchase leaves the user on the paywall step
  // instead of being onboarded with no subscription.
  const handleStartTrial = async (plan: 'monthly' | 'yearly'): Promise<boolean> => {
    // Attempt RevenueCat hosted paywall (shows all plans including lifetime)
    const paywallResult = await presentPaywall();
    if (paywallResult.purchased) {
      trackTrialStarted(plan);
      return true;
    }

    // Fallback: direct purchase of the plan the user selected in the UI
    const { subscribed, cancelled } = await purchaseSubscription(plan);
    if (cancelled) return false; // user dismissed — stay on paywall step

    if (subscribed) {
      trackTrialStarted(plan);
      return true;
    }

    // Purchase didn't result in an active subscription — either a real
    // error, or (rarely) a completed call with no active entitlement yet.
    // Either way, never grant free access in production.
    if (__DEV__) {
      // Store / RevenueCat unreachable (e.g., simulator) — grant local trial
      startTrial(plan);
      trackTrialStarted(plan);
      return true;
    }
    Alert.alert(STRINGS.onboarding.purchaseErrorTitle, STRINGS.onboarding.purchaseErrorMessage);
    return false;
  };

  return (
    <OnboardingFlow
      onComplete={handleComplete}
      onStartTrial={handleStartTrial}
      onSkipTrial={skipTrial}
    />
  );
}
