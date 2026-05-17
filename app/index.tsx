import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '../src/store/useAppStore';
import { supabase } from '../src/lib/supabase';
import { useTheme } from '../src/hooks/useTheme';

export default function Index() {
  const { C } = useTheme();
  const hydrated = useAppStore((s) => s._hydrated);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);

  const recordDailyActivity = useAppStore((s) => s.recordDailyActivity);
  const checkMilestones = useAppStore((s) => s.checkMilestones);
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const setSupabaseUserId = useAppStore((s) => s.setSupabaseUserId);

  useEffect(() => {
    void (async () => {
      if (!hydrated) return;

      if (isAuthenticated) {
        // Signed in users: onboarding -> home (if completed) or onboarding -> finish
        if (!hasOnboarded) {
          router.replace('/onboarding');
        } else {
          // Verify the stored session is still valid before routing to protected tabs.
          // If it's expired, reset auth and send to sign-in instead of tabs.
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            setAuthenticated(false);
            setSupabaseUserId(null);
            router.replace('/sign-in');
            return;
          }
          recordDailyActivity();
          checkMilestones();
          router.replace('/(tabs)');
        }
      } else {
        // Not signed in: check if they've onboarded before (returning user)
        const hasCompletedOnboardingBefore = hasOnboarded;
        if (hasCompletedOnboardingBefore) {
          // Returning user who completed onboarding but not signed in
          router.replace('/sign-in');
        } else {
          // New user: start with onboarding, sign up comes at the end
          router.replace('/onboarding');
        }
      }
    })();
    // Zustand actions (setAuthenticated, setSupabaseUserId, checkMilestones, recordDailyActivity)
    // are stable references — intentionally omitted from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, isAuthenticated, hasOnboarded]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setAuthenticated(true);
        setSupabaseUserId(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setAuthenticated(false);
        setSupabaseUserId(null);
      }
    });

    return () => subscription.unsubscribe();
    // setAuthenticated / setSupabaseUserId are stable Zustand actions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: C.BG, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={C.GOLD} />
    </View>
  );
}
