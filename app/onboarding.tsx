import { router } from 'expo-router';
import { useAppStore } from '../src/store/useAppStore';
import { OnboardingFlow } from '../src/screens/OnboardingFlow';
import type { UserProfile } from '../src/types';
import {
  trackOnboardingCompleted,
  trackTrialStarted,
  trackOnboardingSkipped,
} from '../src/lib/analytics';

export default function OnboardingRoute() {
  const setUser = useAppStore((s) => s.setUser);
  const setHasOnboarded = useAppStore((s) => s.setHasOnboarded);
  const purchaseSubscription = useAppStore((s) => s.purchaseSubscription);
  const presentPaywall = useAppStore((s) => s.presentPaywall);
  const startTrial = useAppStore((s) => s.startTrial);
  const skipTrial = useAppStore((s) => s.skipTrial);

  const handleComplete = (profile: UserProfile) => {
    setUser(profile);
    setHasOnboarded(true);
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
  //   3. If that also fails, grant a local trial so the user isn't blocked.
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
      // Store / RevenueCat unreachable (e.g., simulator) — grant local trial
      startTrial(plan);
    }
    trackTrialStarted(plan);
    // On success, purchaseSubscription already set status to 'subscribed'
  };

  return (
    <OnboardingFlow
      onComplete={handleComplete}
      onStartTrial={handleStartTrial}
      onSkipTrial={skipTrial}
    />
  );
}
