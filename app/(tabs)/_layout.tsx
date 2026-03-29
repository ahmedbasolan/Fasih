import { Tabs } from 'expo-router';
import { Home, Layers, BookOpen, User } from 'lucide-react-native';
import { C, FONT_LATIN_BOLD } from '../../src/components/design/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(6,6,17,0.97)',
          borderTopColor: C.BORDER,
          borderTopWidth: 1,
        },
        tabBarInactiveTintColor: C.TEXT3,
        tabBarLabelStyle: {
          fontFamily: FONT_LATIN_BOLD,
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarActiveTintColor: C.GOLD,
          tabBarIcon: ({ color }) => <Home size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scenarios"
        options={{
          title: 'Learn',
          tabBarActiveTintColor: C.JADE2,
          tabBarIcon: ({ color }) => <Layers size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarActiveTintColor: C.VIOLET2,
          tabBarIcon: ({ color }) => <BookOpen size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarActiveTintColor: C.GOLD2,
          tabBarIcon: ({ color }) => <User size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}
