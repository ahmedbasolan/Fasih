import { Tabs, usePathname } from 'expo-router';
import { View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Layers, BookOpen, User } from 'lucide-react-native';
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { FONT_HEADING_SEMI } from '../../src/components/design/tokens';
import { useTheme } from '../../src/hooks/useTheme';

// Tab order for determining slide direction (left to right)
const TAB_ORDER = ['index', 'scenarios', 'library', 'profile'];

// Context for tab slide animation direction
interface TabAnimationContextType {
  direction: 'left' | 'right' | null;
  triggerAnimation: (direction: 'left' | 'right') => void;
}

export const TabAnimationContext = createContext<TabAnimationContextType>({
  direction: null,
  triggerAnimation: () => {},
});

// Hook for tab screens to use animation
export function useTabAnimation() {
  return useContext(TabAnimationContext);
}

export default function TabsLayout() {
  const { C, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const tabBg = isDark ? '#0C0A1C' : '#FFFFFF';

  // Track tab navigation direction for animations
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const prevTabIndex = useRef<number>(0);

  const triggerAnimation = useCallback((direction: 'left' | 'right') => {
    setSlideDirection(direction);
  }, []);

  // Determine slide direction based on tab change
  useEffect(() => {
    const currentTab = pathname.split('/')[1] || 'index';
    const currentIndex = TAB_ORDER.indexOf(currentTab);

    if (currentIndex !== -1 && prevTabIndex.current !== currentIndex) {
      const direction = currentIndex > prevTabIndex.current ? 'right' : 'left';
      setSlideDirection(direction);
      prevTabIndex.current = currentIndex;
    }
  }, [pathname]);

  // Adapt to the user's phone nav setting.
  // iOS: insets.bottom is ~34 on home-indicator devices, 0 on older iPhones.
  // Android: insets.bottom is ~0 on 3-button nav (system draws its own bar),
  //   and ~24–48 on gesture nav (we need to clear the home indicator/gesture area).
  const BAR_CONTENT_HEIGHT = 60;
  const BOTTOM_INSET_PAD = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0);

  return (
    <TabAnimationContext.Provider value={{ direction: slideDirection, triggerAnimation }}>
      <Tabs
        screenOptions={{
          headerShown: false,
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
          tabBarActiveTintColor: '#00FF95',
          tabBarInactiveTintColor: '#6B7280',
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
              <View style={focused ? { backgroundColor: C.JADE_ACCENT_DIM, borderRadius: 12, padding: 6 } : { padding: 6 }}>
                <Home size={20} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="scenarios"
          options={{
            title: 'Scenarios',
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? { backgroundColor: C.JADE_ACCENT_DIM, borderRadius: 12, padding: 6 } : { padding: 6 }}>
                <Layers size={20} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Phrases',
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? { backgroundColor: C.JADE_ACCENT_DIM, borderRadius: 12, padding: 6 } : { padding: 6 }}>
                <BookOpen size={20} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? { backgroundColor: C.JADE_ACCENT_DIM, borderRadius: 12, padding: 6 } : { padding: 6 }}>
                <User size={20} color={color} />
              </View>
            ),
          }}
        />
      </Tabs>
    </TabAnimationContext.Provider>
  );
}

