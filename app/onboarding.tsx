import { router } from 'expo-router';
import { useAppStore } from '../src/store/useAppStore';
import { OnboardingFlow } from '../src/screens/OnboardingFlow';
import type { UserProfile } from '../src/types';

export default function OnboardingRoute() {
  const setUser = useAppStore((s) => s.setUser);
  const setHasOnboarded = useAppStore((s) => s.setHasOnboarded);
  const purchaseSubscription = useAppStore((s) => s.purchaseSubscription);
  const startTrial = useAppStore((s) => s.startTrial);
  const skipTrial = useAppStore((s) => s.skipTrial);

  const handleComplete = (profile: UserProfile) => {
    setUser(profile);
    setHasOnboarded(true);
    router.replace('/(tabs)');
  };

  // OnboardingFlow calls this when user taps "Start Free Trial".
  // We attempt a real purchase via RevenueCat; if keys aren't set yet (dev build),
  // the purchases service falls back to simulating a successful purchase.
  // On cancellation or error, fall back to marking a trial in local state so
  // the user can still access the app during development and testing.
  const handleStartTrial = async (plan: 'monthly' | 'yearly') => {
    const { cancelled, error } = await purchaseSubscription(plan);
    if (cancelled) return; // user dismissed the sheet — stay on paywall
    if (error) {
      // RevenueCat unavailable (e.g., simulator) — grant local trial as fallback
      startTrial(plan);
    }
    // On success purchaseSubscription already updated the store to 'subscribed'
    // Navigation is handled by OnboardingFlow after this callback returns
  };

  return (
    <OnboardingFlow
      onComplete={handleComplete}
      onStartTrial={handleStartTrial}
      onSkipTrial={skipTrial}
    />
  );
}
