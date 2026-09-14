import React from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { SPACE } from '../design/spacing';

type Gap = keyof typeof SPACE;

interface StackProps {
  children: React.ReactNode;
  /** Gap between children. A key of SPACE — an arbitrary number is not accepted. */
  gap?: Gap;
  style?: ViewStyle;
}

/**
 * Vertical rhythm, as a component.
 *
 * The point is the type of `gap`: it is a key of `SPACE`, so
 * `<Stack gap={13}>` does not compile. Spacing drift in this app has never come
 * from anyone deciding 13 was correct — it comes from `marginBottom: 13` being
 * as easy to write as `marginBottom: 12`, and nothing objecting.
 *
 * Prefer this over `marginBottom` on children. A margin belongs to the
 * relationship between two elements, not to one of them, which is why moving a
 * component between screens so often drags the wrong spacing along with it.
 */
export function Stack({ children, gap = 'lg', style }: StackProps) {
  return <View style={[{ gap: SPACE[gap] }, style]}>{children}</View>;
}

interface RowProps extends StackProps {
  /** Cross-axis alignment. Defaults to centre, which is right for nearly every row. */
  align?: 'center' | 'flex-start' | 'flex-end' | 'baseline';
  justify?: 'flex-start' | 'space-between' | 'center' | 'flex-end';
}

/** The horizontal counterpart. Same gap contract. */
export function Row({ children, gap = 'md', align = 'center', justify, style }: RowProps) {
  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: align, justifyContent: justify, gap: SPACE[gap] },
        style,
      ]}
    >
      {children}
    </View>
  );
}
