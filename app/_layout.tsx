import '../global.css';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import * as SecureStore from 'expo-secure-store';
import { ClerkProvider, useAuth } from '@clerk/expo';
import { PostHogProvider } from 'posthog-react-native';
import { posthog } from '../src/lib/analytics';
import { setClerkSupabaseToken } from '../src/lib/supabase';

const tokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },
  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
  async clearToken(key: string) {
    return SecureStore.deleteItemAsync(key);
  },
};
import {
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
  Tajawal_800ExtraBold,
  Tajawal_900Black,
} from '@expo-google-fonts/tajawal';
import {
  PlusJakartaSans_300Light,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from '../src/components/ui/ErrorBoundary';
import { useTheme } from '../src/hooks/useTheme';
import { useAppStore } from '../src/store/useAppStore';
import { setupNotifications } from '../src/lib/notifications';

// Configure notification handler and Android channel at module load time
// (must happen before any scheduleNotificationAsync calls)
setupNotifications();

SplashScreen.preventAutoHideAsync();

/**
 * Keeps the Supabase client's bearer token in sync with Clerk's auth state.
 * Fetches a `{ template: 'supabase' }` JWT on sign-in/sign-out and whenever
 * Clerk swaps sessions, and registers a refresher with the app store so
 * syncService can pull a fresh (short-lived, ~60s) token before each request
 * instead of relying solely on this mount-time/auth-change fetch. Renders
 * nothing — this is a side-effect-only bridge component.
 */
function SupabaseAuthBridge() {
  const { isSignedIn, getToken, sessionId } = useAuth();
  const setSupabaseTokenRefresher = useAppStore((s) => s.setSupabaseTokenRefresher);

  useEffect(() => {
    if (!isSignedIn) {
      setClerkSupabaseToken(null);
      setSupabaseTokenRefresher(null);
      return;
    }

    // Guards against a rapid sign-in→sign-out: if getToken() resolves after
    // this effect has been superseded (deps changed — e.g. the user signed
    // out — or the component unmounted), `cancelled` is already true and we
    // skip re-arming the Supabase client with a stale token.
    let cancelled = false;

    const refresh = async () => {
      try {
        const token = await getToken({ template: 'supabase' });
        if (cancelled) return;
        setClerkSupabaseToken(token);
      } catch {
        // Non-fatal — request proceeds on the anon key / previous token and
        // RLS will simply deny anything it shouldn't allow.
      }
    };

    refresh();
    setSupabaseTokenRefresher(refresh);

    return () => {
      cancelled = true;
      setSupabaseTokenRefresher(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, sessionId]);

  return null;
}

export default function RootLayout() {
  const initSubscription = useAppStore((s) => s.initSubscription);

  const [loaded, error] = useFonts({
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
    Tajawal_800ExtraBold,
    Tajawal_900Black,
    PlusJakartaSans_300Light,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
      initSubscription(); // configure RevenueCat and sync entitlement status
    }
    // initSubscription is a stable Zustand action — intentionally omitted from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, error]);

  const { C, isDark } = useTheme();
  if (!loaded && !error) return null;

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <SupabaseAuthBridge />
      <PostHogProvider client={posthog}>
        <ErrorBoundary>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
              <StatusBar style={isDark ? "light" : "dark"} />
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.BG } }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="sign-in" options={{ animation: 'fade' }} />
                <Stack.Screen name="sign-up" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="forgot-password" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
                <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
                <Stack.Screen
                  name="scenario/[id]"
                  options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
                />
                <Stack.Screen
                  name="practice"
                  options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
                />
              </Stack>
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </ErrorBoundary>
      </PostHogProvider>
    </ClerkProvider>
  );
}
