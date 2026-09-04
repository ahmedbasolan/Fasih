import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme, FONT_ARABIC_EXTRA, FONT_LATIN } from '../../theme';
import { Settings } from '../icons';
import { STRINGS } from '../../constants/strings';

interface HomeHeaderProps {
  userName: string;
  onSettingsPress?: () => void;
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return STRINGS.home.greeting.morning;
  if (hour >= 12 && hour < 17) return STRINGS.home.greeting.afternoon;
  if (hour >= 17 && hour < 21) return STRINGS.home.greeting.evening;
  return STRINGS.home.greeting.night;
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
        <Text style={styles.arabicGreeting}>{greeting.arabic}</Text>
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
        accessibilityLabel={STRINGS.home.settingsA11y}
      >
        <Settings size={20} color={C.TEXT} />
      </Pressable>
    </View>
  );
}
