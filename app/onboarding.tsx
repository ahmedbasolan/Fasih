import { router } from 'expo-router';
import { useAppStore } from '../src/store/useAppStore';
import { OnboardingFlow } from '../src/screens/OnboardingFlow';
import type { UserProfile } from '../src/types';

export default function OnboardingRoute() {
  const setUser = useAppStore((s) => s.setUser);
  const setHasOnboarded = useAppStore((s) => s.setHasOnboarded);

  const handleComplete = (profile: UserProfile) => {
    setUser(profile);
    setHasOnboarded(true);
    router.replace('/(tabs)');
  };

  return <OnboardingFlow onComplete={handleComplete} />;
}
