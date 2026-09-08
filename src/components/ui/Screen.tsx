import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACE, SCREEN_MARGIN } from '../design/spacing';
import { ZONE } from '../design/layout';
import { useTheme } from '../../hooks/useTheme';

interface ScreenProps {
  children: React.ReactNode;
  /**
   * Pinned to the bottom, inside the safe area and within thumb reach. The
   * screen's primary action goes here — not at the end of `children`, where it
   * scrolls away.
   */
  action?: React.ReactNode;
  /**
   * Content scrolls by default. Set false for a screen that must not scroll,
   * like a full-bleed chooser.
   */
  scroll?: boolean;
  /** Applied to the content zone. Layout only — no colours. */
  contentStyle?: ViewStyle;
  /**
   * Set when the screen renders its own `ScreenHeader`, which already applies
   * the top inset. Without this the inset would be applied twice.
   */
  headerHandlesTopInset?: boolean;
}

/**
 * The screen frame: safe areas, margins, and the content/action split.
 *
 * Exists because every screen was doing this by hand and disagreeing. Sentence
 * Builder forgot the top inset entirely and put its back button under the
 * notch; three other screens each applied it at a different level. Onboarding
 * steps each invented their own `paddingTop: insets.top + <a number>`.
 *
 * The rules this makes unrepresentable:
 *   - content never runs under the status bar or the home indicator
 *   - the primary action is always reachable and never scrolls away
 *   - horizontal margin is SCREEN_MARGIN everywhere, once
 *
 * A screen that needs to break these should not reach around this component —
 * it should say why in a comment and lay itself out explicitly, the way the
 * mode plates do for their deliberate full-bleed.
 */
export function Screen({
  children,
  action,
  scroll = true,
  contentStyle,
  headerHandlesTopInset,
}: ScreenProps) {
  const { C } = useTheme();
  const insets = useSafeAreaInsets();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          backgroundColor: C.BG,
          paddingTop: headerHandlesTopInset ? 0 : insets.top,
        },
        content: {
          paddingHorizontal: SCREEN_MARGIN,
        },
        // Only applied when scrolling: a non-scrolling screen must not have its
        // children pushed down by contentContainer padding it cannot see.
        scrollContent: {
          flexGrow: 1,
          paddingHorizontal: SCREEN_MARGIN,
          paddingBottom: action ? ZONE.actionGap : insets.bottom + SPACE.xl,
        },
        action: {
          paddingHorizontal: SCREEN_MARGIN,
          paddingTop: ZONE.actionGap,
          paddingBottom: insets.bottom + SPACE.lg,
          minHeight: ZONE.actionMinHeight,
        },
      }),
    [C, insets.top, insets.bottom, headerHandlesTopInset, action],
  );

  return (
    <View style={styles.root}>
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, styles.content, contentStyle]}>{children}</View>
      )}

      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}
