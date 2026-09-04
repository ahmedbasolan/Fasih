import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@clerk/expo';
import { useAppStore } from '../src/store/useAppStore';
import { loginPurchasesUser } from '../src/lib/purchases';
import { useTheme } from '../src/hooks/useTheme';
import { captureError } from '../src/lib/analytics';

export default function Index() {
  const { C } = useTheme();
  const hydrated = useAppStore((s) => s._hydrated);
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const setClerkUserId = useAppStore((s) => s.setClerkUserId);
  const syncFromCloud = useAppStore((s) => s.syncFromCloud);
  const recordDailyActivity = useAppStore((s) => s.recordDailyActivity);
  const checkMilestones = useAppStore((s) => s.checkMilestones);
  const initNotifications = useAppStore((s) => s.initNotifications);
  const recordSessionHour = useAppStore((s) => s.recordSessionHour);

  const { isLoaded, isSignedIn, userId } = useAuth();

  useEffect(() => {
    if (!isLoaded || !hydrated) return;

    if (isSignedIn && userId) {
      setClerkUserId(userId);
      setAuthenticated(true);

      if (!hasOnboarded) {
        router.replace('/onboarding');
      } else {
        // Navigate immediately; cloud sync + daily tracking run in background.
        // recordDailyActivity and checkMilestones run AFTER syncFromCloud resolves
        // to prevent syncFromCloud from overwriting the streak/lastActiveDate they set.
        router.replace('/(tabs)');
        // recordDailyActivity and checkMilestones must run whether or not the
        // network work above succeeds. Chained bare, a RevenueCat or Supabase
        // failure (offline, simulator, expired token) rejected the promise and
        // silently skipped them — the user opened the app, practised, and lost
        // their streak. The catch reports the failure and still records the day.
        void loginPurchasesUser(userId)
          .then(() => syncFromCloud())
          .catch((e: unknown) => {
            captureError('Startup sync failed', {
              reason: e instanceof Error ? e.message : String(e),
            });
          })
          .finally(() => {
            recordDailyActivity();
            checkMilestones();
          });
        // Smart timing: record this session hour, re-schedule daily notification,
        // and request permission if not yet granted (non-blocking)
        void recordSessionHour();
        void initNotifications();
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
      <ActivityIndicator color={C.JADE_ACCENT} />
    </View>
  );
}
