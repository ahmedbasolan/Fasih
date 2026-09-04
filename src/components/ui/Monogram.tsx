import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONT_HEADING_EXTRA } from '../design/tokens';
import { RADIUS } from '../design/spacing';
import { useTheme } from '../../hooks/useTheme';
import { initialFor } from '../../engine/text';

interface MonogramProps {
  name: string;
  size?: number;
}

/**
 * Typographic avatar. Replaces the two fennec PNGs (3.5 MB combined), scales to
 * any user, and carries no gender.
 */
export function Monogram({ name, size = 64 }: MonogramProps) {
  const { C } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          width: size,
          height: size,
          borderRadius: RADIUS.pill,
          borderWidth: 1,
          borderColor: C.PRIMARY,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: C.JADE_SURFACE,
        },
        letter: {
          fontFamily: FONT_HEADING_EXTRA,
          fontSize: size * 0.42,
          lineHeight: size * 0.5,
          color: C.PRIMARY,
        },
      }),
    [C, size],
  );

  return (
    <View style={styles.root} accessibilityElementsHidden importantForAccessibility="no">
      <Text style={styles.letter}>{initialFor(name)}</Text>
    </View>
  );
}
