import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { FONT_HEADING_EXTRA, FONT_LATIN_MEDIUM } from '../design/tokens';
import { SPACE } from '../design/spacing';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  onPress?: () => void;
}

/**
 * A stat, flat.
 *
 * Was a rounded card with a pastel fill and a coloured platform shadow. Sadaf
 * gives the sheet the app's only shadow, so a stat is now the number and its
 * label sitting on the page — the figure carries the emphasis, not a tile
 * around it. The `bg` and `color` props are gone with the fills they set.
 */
export function StatCard({ icon, value, label, onPress }: Props) {
  const { C } = useTheme();
  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      style={{ flex: 1, gap: SPACE.sm }}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? `${label}: ${value}` : undefined}
    >
      {icon}
      <Text
        style={{
          fontFamily: FONT_HEADING_EXTRA,
          fontSize: 24,
          color: C.TEXT,
          fontVariant: ['tabular-nums'],
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: FONT_LATIN_MEDIUM,
          fontSize: 10,
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          color: C.TEXT3,
        }}
      >
        {label}
      </Text>
    </Container>
  );
}
