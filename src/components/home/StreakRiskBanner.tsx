// fasih-mobile/src/components/home/StreakRiskBanner.tsx
import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Flame } from 'lucide-react-native';
import { useTheme, FONT_HEADING_SEMI, FONT_LATIN, FONT_LATIN_SEMI } from '../../theme';
import { STRINGS } from '../../constants/strings';

interface StreakRiskBannerProps {
  streakDays: number;
  freezesLeft: number;
  onPracticeNow: () => void;
  onUseFreeze: () => void;
}

export function StreakRiskBanner({ streakDays, freezesLeft, onPracticeNow, onUseFreeze }: StreakRiskBannerProps) {
  const { C } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginHorizontal: 24,
      marginTop: 14,
      padding: 14,
      borderRadius: 18,
      backgroundColor: C.CARD_BG,
      borderWidth: 1,
      borderColor: C.JADE_ACCENT_BORDER,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: C.JADE_ACCENT_DIM,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textBlock: {
      flex: 1,
    },
    title: {
      fontFamily: FONT_HEADING_SEMI,
      fontSize: 13,
      color: C.TEXT,
    },
    sub: {
      fontFamily: FONT_LATIN,
      fontSize: 11,
      color: C.TEXT2,
      marginTop: 2,
    },
    actions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 10,
    },
    primaryButton: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 10,
      alignItems: 'center',
      backgroundColor: C.PRIMARY,
    },
    primaryButtonText: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 12,
      color: C.BG,
      fontWeight: '600',
    },
    secondaryButton: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: C.BORDER,
    },
    secondaryButtonDisabled: {
      opacity: 0.4,
    },
    secondaryButtonText: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 12,
      color: C.TEXT2,
    },
  }), [C]);

  return (
    <MotiView
      style={styles.container}
      from={{ opacity: 0, translateY: -8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <Flame size={18} color={C.JADE_ACCENT} fill={C.JADE_ACCENT} />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{STRINGS.streakRisk.bannerTitle(streakDays)}</Text>
          <Text style={styles.sub}>{STRINGS.streakRisk.bannerSub}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={onPracticeNow}
          accessibilityRole="button"
          accessibilityLabel="Practice now"
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>{STRINGS.streakRisk.practiceNow}</Text>
        </Pressable>
        <Pressable
          onPress={onUseFreeze}
          disabled={freezesLeft <= 0}
          accessibilityRole="button"
          accessibilityLabel={`Use streak freeze, ${freezesLeft} left`}
          accessibilityState={{ disabled: freezesLeft <= 0 }}
          style={[styles.secondaryButton, freezesLeft <= 0 && styles.secondaryButtonDisabled]}
        >
          <Text style={styles.secondaryButtonText}>{STRINGS.streakRisk.useFreeze(freezesLeft)}</Text>
        </Pressable>
      </View>
    </MotiView>
  );
}
