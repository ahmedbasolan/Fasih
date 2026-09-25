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
  /**
   * Set `false` when the row CONTAINS its own focusable controls.
   *
   * A Pressable defaults to `accessible`, which collapses its whole subtree
   * into one accessibility element. `PhraseEntry` nests Play and Save buttons
   * inside this row, and with the default they were not reachable by a screen
   * reader at all — the two actions that screen exists for. Opting out here
   * keeps the row tappable by touch while leaving its children focusable, so
   * the row must then provide its own focusable affordance for `onPress`.
   */
  accessible?: boolean;
}

/**
 * The Sadaf list row. Owns the hairline, the vertical rhythm and the press
 * state; knows nothing about content. Entries compose on top of it.
 */
export function Rule({ children, index, onPress, first, accessibilityLabel, accessible }: RuleProps) {
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
    // The label has to be applied here too. It was previously only passed on
    // the Pressable branch, so a caller that set it on a non-pressable row —
    // exactly the rows that most need explaining, like a coming-soon scenario —
    // had it silently dropped, and the prop looked like it worked.
    return (
      <View
        style={[styles.row, first && styles.first]}
        accessible={accessibilityLabel ? true : undefined}
        accessibilityLabel={accessibilityLabel}
      >
        {content}
      </View>
    );
  }

  // With `accessible={false}` the row is still tappable but is no longer an
  // accessibility element, so role and label would describe nothing. Omitting
  // them keeps the tree honest — the caller supplies the focusable affordance.
  const isAccessible = accessible !== false;

  return (
    <Pressable
      onPress={onPress}
      accessible={accessible}
      accessibilityRole={isAccessible ? 'button' : undefined}
      accessibilityLabel={isAccessible ? accessibilityLabel : undefined}
      style={({ pressed }) => [styles.row, first && styles.first, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}
