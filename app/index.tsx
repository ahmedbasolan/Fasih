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

      // Navigate immediately; cloud sync + daily tracking run in background.
      router.replace(hasOnboarded ? '/(tabs)' : '/onboarding');

      // The pull runs on BOTH paths, including onboarding. It is what arms the
      // push scheduler (src/lib/syncScheduler.ts), which starts disarmed so
      // that rehydrating from AsyncStorage cannot push a thin local row over
      // good cloud data before the first merge. Skipping it for a
      // not-yet-onboarded user left the scheduler disarmed for the whole
      // session, so nothing they did during onboarding ever reached the cloud.
      // A brand-new user has no row; syncFromCloud arms and pushes to create one.
      //
      // recordDailyActivity and checkMilestones run AFTER syncFromCloud resolves,
      // so the pull cannot overwrite the streak/lastActiveDate they set — and in
      // `finally`, so they still run when the network work fails. Chained bare, a
      // RevenueCat or Supabase failure (offline, simulator, expired token)
      // rejected the promise and silently skipped them: the user opened the app,
      // practised, and lost their streak.
      void loginPurchasesUser(userId)
        .then(() => syncFromCloud())
        .catch((e: unknown) => {
          captureError('Startup sync failed', {
            reason: e instanceof Error ? e.message : String(e),
          });
        })
        .finally(() => {
          // Onboarded users only, unchanged from before. Starting a streak for
          // someone still picking their role would be a behaviour change this
          // refactor has no business making. (A user finishing onboarding gets
          // their first recordDailyActivity on the next launch — pre-existing,
          // and not this branch's problem to fix.)
          if (hasOnboarded) {
            recordDailyActivity();
            checkMilestones();
          }
        });

      // Smart timing: record this session hour, re-schedule daily notification,
      // and request permission if not yet granted (non-blocking)
      void recordSessionHour();
      void initNotifications();
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
