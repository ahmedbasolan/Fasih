import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Home, Layers, BookOpen, User } from '../../src/components/icons';
import { FONT_HEADING_SEMI } from '../../src/components/design/tokens';
import { useTheme } from '../../src/hooks/useTheme';

export default function TabsLayout() {
  const { C } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBg = C.TAB_BG;

  // Adapt to the user's phone nav setting.
  // iOS: insets.bottom is ~34 on home-indicator devices, 0 on older iPhones.
  // Android: insets.bottom is ~0 on 3-button nav (system draws its own bar),
  //   and ~24–48 on gesture nav (we need to clear the home indicator/gesture area).
  const BAR_CONTENT_HEIGHT = 60;
  const BOTTOM_INSET_PAD = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        tabBarStyle: {
          backgroundColor: tabBg,
          borderTopWidth: 0,
          elevation: 0,
          height: BAR_CONTENT_HEIGHT + BOTTOM_INSET_PAD,
          paddingTop: 8,
          paddingBottom: BOTTOM_INSET_PAD,
          ...Platform.select({
            ios: {
              shadowColor: C.PRIMARY,
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.06,
              shadowRadius: 12,
            },
            android: { elevation: 8 },
          }),
        },
        tabBarActiveTintColor: C.JADE_ACCENT,
        tabBarInactiveTintColor: C.NEUTRAL_500,
        tabBarLabelStyle: {
          fontFamily: FONT_HEADING_SEMI,
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <MotiView
              animate={{ scale: focused ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              style={focused ? { backgroundColor: C.JADE_ACCENT_DIM, borderRadius: 12, padding: 6 } : { padding: 6 }}
            >
              <Home size={20} color={color} />
            </MotiView>
          ),
        }}
      />
      <Tabs.Screen
        name="scenarios"
        options={{
          title: 'Scenarios',
          tabBarIcon: ({ color, focused }) => (
            <MotiView
              animate={{ scale: focused ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              style={focused ? { backgroundColor: C.JADE_ACCENT_DIM, borderRadius: 12, padding: 6 } : { padding: 6 }}
            >
              <Layers size={20} color={color} />
            </MotiView>
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Phrases',
          tabBarIcon: ({ color, focused }) => (
            <MotiView
              animate={{ scale: focused ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              style={focused ? { backgroundColor: C.JADE_ACCENT_DIM, borderRadius: 12, padding: 6 } : { padding: 6 }}
            >
              <BookOpen size={20} color={color} />
            </MotiView>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <MotiView
              animate={{ scale: focused ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              style={focused ? { backgroundColor: C.JADE_ACCENT_DIM, borderRadius: 12, padding: 6 } : { padding: 6 }}
            >
              <User size={20} color={color} />
            </MotiView>
          ),
        }}
      />
    </Tabs>
  );
}
