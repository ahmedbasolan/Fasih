import '../global.css';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
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

SplashScreen.preventAutoHideAsync();

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
  );
}
