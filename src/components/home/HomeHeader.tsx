import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme, FONT_ARABIC_EXTRA, FONT_LATIN } from '../../theme';
import { Settings } from 'lucide-react-native';
import { MotiView } from 'moti';

interface HomeHeaderProps {
  userName: string;
  onSettingsPress?: () => void;
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return { arabic: 'صباح الخير', english: 'Good morning' };
  }
  if (hour >= 12 && hour < 17) {
    return { arabic: 'مرحبا', english: 'Hello' };
  }
  if (hour >= 17 && hour < 21) {
    return { arabic: 'مساء الخير', english: 'Good evening' };
  }
  return { arabic: 'تصبح على خير', english: 'Good night' };
}

export function HomeHeader({ userName, onSettingsPress }: HomeHeaderProps) {
  const { C } = useTheme();
  const greeting = getTimeGreeting();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: 24,
      paddingVertical: 20,
    },
    leftSection: {
      flex: 1,
    },
    arabicGreeting: {
      fontFamily: FONT_ARABIC_EXTRA,
      fontSize: 32,
      color: C.CULTURAL_GOLD,
      marginBottom: 4,
      textAlign: 'right',
      writingDirection: 'rtl',
      textShadowColor: 'rgba(255,184,0,0.3)',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
    },
    subtitle: {
      fontFamily: FONT_LATIN,
      fontSize: 14,
      color: C.TEXT2,
    },
    settingsButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: C.CARD_BG,
      borderWidth: 1,
      borderColor: C.BORDER,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }), [C]);

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <MotiView
          animate={{ opacity: [0.85, 1, 0.85] }}
          transition={{ type: 'timing', duration: 2500, loop: true }}
        >
          <Text style={styles.arabicGreeting}>{greeting.arabic}</Text>
        </MotiView>
        <Text style={styles.subtitle}>
          {greeting.english}, <Text style={{ color: C.TEXT, fontWeight: '600' }}>{userName}</Text>
        </Text>
      </View>

      <Pressable
        onPress={onSettingsPress}
        style={({ pressed }) => [
          styles.settingsButton,
          pressed && { opacity: 0.7 },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Settings"
      >
        <Settings size={20} color={C.TEXT} />
      </Pressable>
    </View>
  );
}
