import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONT_ARABIC_BLACK } from '../design/tokens';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  glyphs: [string, string, string];
}

/**
 * The Sadaf watermark.
 *
 * Each screen carries a triliteral root naming what it is for — ع ل م learn,
 * ق و ل say, ف ك ر think, ك ل م speak. This is the app's identity device, and
 * it previously rendered at 2–6% opacity, rotated, where nobody could see it.
 *
 * Set upright and aligned to the margin, like a folio mark in a printed
 * reference. Ink, not accent: the watermark is part of the page, not a
 * decoration laid on top of it.
 */
export function GhostLetters({ glyphs }: Props) {
  const { C, isDark } = useTheme();

  // Ink at low alpha rather than a tinted accent. Dark needs less, because a
  // light glyph on a dark ground reads stronger at equal alpha.
  const opacity = isDark ? 0.05 : 0.08;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {glyphs.map((glyph, i) => (
        <Text
          key={`${glyph}-${i}`}
          style={[styles[`g${i}` as 'g0' | 'g1' | 'g2'], { color: C.TEXT, opacity }]}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          {glyph}
        </Text>
      ))}
    </View>
  );
}

// Upright, no rotation. Aligned to the page margin.
const styles = StyleSheet.create({
  g0: {
    position: 'absolute',
    fontFamily: FONT_ARABIC_BLACK,
    fontSize: 260,
    lineHeight: 260,
    right: -40,
    top: -30,
    includeFontPadding: false,
  },
  g1: {
    position: 'absolute',
    fontFamily: FONT_ARABIC_BLACK,
    fontSize: 170,
    lineHeight: 170,
    left: -20,
    top: 320,
    includeFontPadding: false,
  },
  g2: {
    position: 'absolute',
    fontFamily: FONT_ARABIC_BLACK,
    fontSize: 140,
    lineHeight: 140,
    right: -10,
    bottom: 140,
    includeFontPadding: false,
  },
});
