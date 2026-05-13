import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONT_ARABIC_BLACK } from '../design/tokens';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  glyphs: [string, string, string];
}

export function GhostLetters({ glyphs }: Props) {
  const { isDark, C } = useTheme();

  // Dark mode: neon jade + cyan at 3 % — crisp against deep bg
  // Light mode: jade + gold at 6 % — enough contrast on pale bg
  const p1 = isDark ? `rgba(0,255,149,0.03)` : `${C.JADE}0F`;   // ~6 %
  const p2 = isDark ? `rgba(0,214,252,0.023)` : `${C.CULTURAL_GOLD}0C`; // ~5 %
  const p3 = isDark ? `rgba(0,255,149,0.021)` : `${C.JADE}0A`;  // ~4 %

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Text
        style={[styles.g1, { color: p1 }]}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        {glyphs[0]}
      </Text>
      <Text
        style={[styles.g2, { color: p2 }]}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        {glyphs[1]}
      </Text>
      <Text
        style={[styles.g3, { color: p3 }]}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        {glyphs[2]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  g1: {
    position: 'absolute',
    fontFamily: FONT_ARABIC_BLACK,
    fontSize: 300,
    lineHeight: 300,
    right: -50,
    top: -50,
    transform: [{ rotate: '-6deg' }],
    includeFontPadding: false,
  },
  g2: {
    position: 'absolute',
    fontFamily: FONT_ARABIC_BLACK,
    fontSize: 190,
    lineHeight: 190,
    left: -35,
    top: 310,
    transform: [{ rotate: '5deg' }],
    includeFontPadding: false,
  },
  g3: {
    position: 'absolute',
    fontFamily: FONT_ARABIC_BLACK,
    fontSize: 150,
    lineHeight: 150,
    right: -15,
    bottom: 120,
    transform: [{ rotate: '-10deg' }],
    includeFontPadding: false,
  },
});
