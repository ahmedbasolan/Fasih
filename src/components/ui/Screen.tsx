import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SCREEN_MARGIN } from '../design/spacing';
import { screenPadding, ZONE } from '../design/layout';
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
  /**
   * Set on the four screens inside the bottom tab navigator. The tab bar is a
   * flow sibling that already owns the bottom inset, so applying it here too
   * pads against a bar that is not there — see `screenPadding`.
   */
  tabBarHandlesBottomInset?: boolean;
  /**
   * Rendered behind the content, edge to edge and outside the margins —
   * `GhostLetters` and nothing else so far.
   *
   * It goes through this prop rather than as the first child because the
   * watermark is the page's ground, not an item in the content flow: it has to
   * sit under the scroll, ignore SCREEN_MARGIN, and bleed off all four edges.
   *
   * Screen positions it, so whatever is passed cannot take layout space or
   * swallow a touch even if it forgets to say so itself.
   */
  background?: React.ReactNode;
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
  tabBarHandlesBottomInset,
  background,
}: ScreenProps) {
  const { C } = useTheme();
  const insets = useSafeAreaInsets();

  const pad = screenPadding(insets, {
    hasAction: !!action,
    headerHandlesTopInset: !!headerHandlesTopInset,
    tabBarHandlesBottomInset: !!tabBarHandlesBottomInset,
  });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        // The top inset lives on the zone below, not here: an absolutely
        // positioned `background` is laid out against the root's PADDING box,
        // so a paddingTop on the root would push the watermark down out of the
        // status bar it is meant to bleed under.
        root: { flex: 1, backgroundColor: C.BG },
        topZone: { flex: 1, paddingTop: pad.top },
        content: { paddingHorizontal: SCREEN_MARGIN },
        // Only applied when scrolling: a non-scrolling screen must not have its
        // children pushed down by contentContainer padding it cannot see.
        scrollContent: {
          flexGrow: 1,
          paddingHorizontal: SCREEN_MARGIN,
          paddingBottom: pad.scrollBottom,
        },
        action: {
          paddingHorizontal: SCREEN_MARGIN,
          paddingTop: ZONE.actionGap,
          paddingBottom: pad.actionBottom,
          minHeight: ZONE.actionMinHeight,
        },
      }),
    [C, pad.top, pad.scrollBottom, pad.actionBottom],
  );

  return (
    // The pinned action has to move with the keyboard or it is covered by it,
    // and the two platforms disagree about what happens by default: iOS
    // overlays the keyboard so a bottom-pinned view stays underneath, Android
    // usually resizes the window instead. `behavior` differs accordingly —
    // this is the same Platform.OS split the auth screens already carry, which
    // is the evidence that this app has hit the divergence before.
    //
    // Applied unconditionally rather than only for screens with inputs: a
    // screen gains a text field long after its layout is written, and nothing
    // would prompt anyone to come back and wrap it.
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Outside topZone, so the watermark bleeds under the status bar rather
          than starting below it.

          Positioned here rather than trusted to position itself: as a bare
          flow child, a background that forgot `absoluteFill` would consume
          layout height and push the whole screen down — silently, and only on
          the screen that passed it. The wrapper makes that unrepresentable,
          and `pointerEvents="none"` means a decorative layer can never take a
          tap meant for the content under it. */}
      {background ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {background}
        </View>
      ) : null}

      <View style={styles.topZone}>
        {scroll ? (
          // No `removeClippedSubviews`, deliberately. HomeScreenNew carried it
          // before moving here, but it arrived in an unrelated cleanup commit
          // rather than as a measured decision, and Home is under two screens
          // of content — the prop is for long virtualised lists. ScenariosScreen
          // sets it FALSE on purpose to stop a black-square flash on Android,
          // which is the platform this app is actually looked at on. Adding it
          // to every Screen would spread a known Android artefact for no
          // measured gain.
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
      </View>

      {action ? <View style={styles.action}>{action}</View> : null}
    </KeyboardAvoidingView>
  );
}
