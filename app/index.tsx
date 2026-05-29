import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@clerk/expo';
import { useAppStore } from '../src/store/useAppStore';
import { loginPurchasesUser } from '../src/lib/purchases';
import { useTheme } from '../src/hooks/useTheme';

export default function Index() {
  const { C } = useTheme();
  const hydrated = useAppStore((s) => s._hydrated);
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const setClerkUserId = useAppStore((s) => s.setClerkUserId);
  const syncFromCloud = useAppStore((s) => s.syncFromCloud);
  const recordDailyActivity = useAppStore((s) => s.recordDailyActivity);
  const checkMilestones = useAppStore((s) => s.checkMilestones);

  const { isLoaded, isSignedIn, userId } = useAuth();

  useEffect(() => {
    if (!isLoaded || !hydrated) return;

    if (isSignedIn && userId) {
      setClerkUserId(userId);
      setAuthenticated(true);

      if (!hasOnboarded) {
        router.replace('/onboarding');
      } else {
        // Navigate immediately so the user doesn't wait on cloud sync.
        // recordDailyActivity and checkMilestones run AFTER syncFromCloud resolves
        // to prevent syncFromCloud from overwriting the streak/lastActiveDate they set.
        router.replace('/(tabs)');
        void loginPurchasesUser(userId)
          .then(() => syncFromCloud())
          .then(() => {
            recordDailyActivity();
            checkMilestones();
          });
      }
    } else {
      setAuthenticated(false);
      setClerkUserId(null);
      if (hasOnboarded) {
        router.replace('/sign-in');
      } else {
        router.replace('/onboarding');
      }
    }
    // Zustand actions and Clerk state — stable references intentionally omitted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, userId, hydrated, hasOnboarded]);

  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: C.BG }}>
      <ActivityIndicator color={C.GOLD} />
    </View>
  );
}
