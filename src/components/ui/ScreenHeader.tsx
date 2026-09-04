import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { FONT_HEADING_EXTRA, FONT_LATIN, FONT_LATIN_MEDIUM } from '../design/tokens';
import { SPACE, SCREEN_MARGIN, RADIUS } from '../design/spacing';
import { useTheme } from '../../hooks/useTheme';
import { STRINGS } from '../../constants/strings';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /**
   * Small uppercase label above the title. This is the running-head slot —
   * it carries the Career/Social mode until step 5 builds a dedicated
   * RunningHead component.
   */
  eyebrow?: string;
  onBack?: () => void;
}

/**
 * The one header primitive.
 *
 * Back, title and subtitle each get their own row. Sentence Builder previously
 * centred its subtitle across the full width, where it collided with the back
 * button; a shared primitive makes that arrangement unrepresentable.
 */
export function ScreenHeader({ title, subtitle, eyebrow, onBack }: ScreenHeaderProps) {
  const { C } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          paddingHorizontal: SCREEN_MARGIN,
          paddingTop: SPACE.lg,
          paddingBottom: SPACE.xl,
          backgroundColor: C.BG,
        },
        backRow: {
          height: 44,
          justifyContent: 'center',
          marginLeft: -SPACE.md,
          marginBottom: SPACE.sm,
        },
        back: {
          width: 44,
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: RADIUS.pill,
        },
        eyebrow: {
          fontFamily: FONT_LATIN_MEDIUM,
          fontSize: 10,
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          color: C.TEXT3,
          marginBottom: SPACE.sm,
        },
        title: {
          fontFamily: FONT_HEADING_EXTRA,
          fontSize: 28,
          letterSpacing: -0.5,
          color: C.TEXT,
        },
        subtitle: {
          fontFamily: FONT_LATIN,
          fontSize: 14,
          lineHeight: 20,
          color: C.TEXT2,
          marginTop: SPACE.sm,
        },
      }),
    [C],
  );

  return (
    <View style={styles.root}>
      {onBack ? (
        <View style={styles.backRow}>
          <Pressable
            onPress={onBack}
            style={styles.back}
            accessibilityRole="button"
            accessibilityLabel={STRINGS.ui.back}
          >
            <ChevronLeft size={24} strokeWidth={1.5} color={C.TEXT} />
          </Pressable>
        </View>
      ) : null}

      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}
