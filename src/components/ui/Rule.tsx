import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FONT_LATIN_MEDIUM } from '../design/tokens';
import { SPACE, RADIUS } from '../design/spacing';
import { useTheme } from '../../hooks/useTheme';

interface RuleProps {
  children: React.ReactNode;
  /** Leading index, e.g. "01". Sequence information only — omit when order carries no meaning. */
  index?: string;
  onPress?: () => void;
  /** Draws the top hairline. Set on the first row of a list so the group is bounded. */
  first?: boolean;
  accessibilityLabel?: string;
}

/**
 * The Sadaf list row. Owns the hairline, the vertical rhythm and the press
 * state; knows nothing about content. Entries compose on top of it.
 */
export function Rule({ children, index, onPress, first, accessibilityLabel }: RuleProps) {
  const { C } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: SPACE.md,
          paddingVertical: SPACE.lg,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: C.BORDER,
          borderRadius: RADIUS.flat,
        },
        first: {
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: C.BORDER,
        },
        pressed: {
          backgroundColor: C.JADE_SURFACE,
        },
        index: {
          fontFamily: FONT_LATIN_MEDIUM,
          fontSize: 11,
          letterSpacing: 0.6,
          color: C.TEXT3,
          minWidth: 20,
          paddingTop: SPACE.xs,
          fontVariant: ['tabular-nums'],
        },
        body: {
          flex: 1,
          minWidth: 0,
        },
      }),
    [C],
  );

  const content = (
    <>
      {index ? <Text style={styles.index}>{index}</Text> : null}
      <View style={styles.body}>{children}</View>
    </>
  );

  if (!onPress) {
    return <View style={[styles.row, first && styles.first]}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.row, first && styles.first, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}
