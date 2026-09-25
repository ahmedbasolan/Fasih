import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  FONT_ARABIC_EXTRA,
  FONT_HEADING_SEMI,
  FONT_LATIN,
  ARABIC_LINE_HEIGHT_MULTIPLIER,
} from '../design/tokens';
import { SPACE, SCREEN_MARGIN } from '../design/spacing';
import { useTheme } from '../../hooks/useTheme';
import { STRINGS } from '../../constants/strings';

interface Props {
  arabic?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

const ARABIC_SIZE = 44;

/**
 * Sadaf empty state.
 *
 * The old version drew a circle-and-flourish SVG frame around the glyph, with
 * two concentric rings and a pair of decorative bezier flourishes. Sadaf has no
 * decorative frames — the type is the whole thing.
 */
export function EmptyState({
  arabic = 'لا يوجد',
  title = STRINGS.ui.emptyState.title,
  subtitle = STRINGS.ui.emptyState.subtitle,
  icon,
}: Props) {
  const { C } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: SCREEN_MARGIN,
          gap: SPACE.md,
        },
        arabic: {
          fontFamily: FONT_ARABIC_EXTRA,
          fontSize: ARABIC_SIZE,
          lineHeight: ARABIC_SIZE * ARABIC_LINE_HEIGHT_MULTIPLIER,
          color: C.TEXT3,
          writingDirection: 'rtl',
        },
        title: {
          fontFamily: FONT_HEADING_SEMI,
          fontSize: 18,
          color: C.TEXT,
          textAlign: 'center',
        },
        subtitle: {
          fontFamily: FONT_LATIN,
          fontSize: 14,
          lineHeight: 20,
          color: C.TEXT2,
          textAlign: 'center',
          maxWidth: 280,
        },
      }),
    [C],
  );

  return (
    <View style={styles.root}>
      {icon ?? <Text style={styles.arabic}>{arabic}</Text>}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}
