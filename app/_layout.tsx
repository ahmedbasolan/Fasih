import '../global.css';
import { Sentry } from '../src/lib/analytics'; // must load first — initializes Sentry as early as possible
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import * as SecureStore from 'expo-secure-store';
import { ClerkProvider } from '@clerk/expo';
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

const clerkPublishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  'pk_test_Y2xlcmsuZmFzaWgtbW9iaWxlLmRldiQ';

if (!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  console.warn(
    '⚠️ Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in environment. Using development fallback key.',
  );
}



// Configure notification handler and Android channel at module load time
// (must happen before any scheduleNotificationAsync calls)
setupNotifications();

SplashScreen.preventAutoHideAsync();

function RootLayout() {
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
      publishableKey={clerkPublishableKey}
      tokenCache={tokenCache}
    >
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
    </ClerkProvider>
  );
}

export default Sentry.wrap(RootLayout);
