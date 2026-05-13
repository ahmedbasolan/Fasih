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
    if (!hydrated) return;

    if (isAuthenticated) {
      // Signed in users: onboarding -> home (if completed) or onboarding -> finish
      if (!hasOnboarded) {
        router.replace('/onboarding');
      } else {
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
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: C.BG, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={C.GOLD} />
    </View>
  );
}
