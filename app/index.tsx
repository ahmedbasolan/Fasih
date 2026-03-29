import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '../src/store/useAppStore';
import { supabase } from '../src/lib/supabase';
import { C } from '../src/components/design/tokens';

export default function Index() {
  const hydrated = useAppStore((s) => s._hydrated);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);

  const recordDailyActivity = useAppStore((s) => s.recordDailyActivity);
  const checkMilestones = useAppStore((s) => s.checkMilestones);
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const setSupabaseUserId = useAppStore((s) => s.setSupabaseUserId);

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated) {
      router.replace('/sign-in');
    } else if (!hasOnboarded) {
      router.replace('/onboarding');
    } else {
      recordDailyActivity();
      checkMilestones();
      router.replace('/(tabs)');
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
