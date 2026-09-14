import React, { useEffect, useState } from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  AccessibilityInfo,
  useWindowDimensions,
} from 'react-native';
import type { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import type { LucideIcon } from '../icons';
import { LinearGradient as ExpoGradient } from 'expo-linear-gradient';
import { ANGLE_135 } from '../design/gradients';
import { FONT_HEADING_SEMI } from '../design/tokens';
import { useTheme } from '../../hooks/useTheme';

// ─── Constants ────────────────────────────────────────────────────────────────
/** Width of the moving highlight block. */
const SHIMMER_W = 100;
/** How far it travels past each edge, so it enters and leaves off-button. */
const OVERSHOOT = 160;
/** Full left-to-right sweep. */
const SWEEP_MS = 2400;

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  /** Optional Lucide icon rendered to the right of the label */
  Icon?: LucideIcon;
  /**
   * Required when `children` is not a plain string, because then there is no
   * text for the accessible name to fall back to.
   *
   * This component shipped with NO accessibilityRole, label or state at all,
   * while being the primary action on onboarding steps 2-4 and on all three
   * paywall screens — including "Start Free Trial". A screen reader announced
   * the purchase button as an unlabelled, non-interactive element.
   */
  accessibilityLabel?: string;
}

/**
 * The primary call to action: a gold pill with a highlight sweeping across it.
 *
 * The sweep is the whole point of the component and it had been gone. It was
 * removed in 18065ce ("animation simplification") and nobody noticed, because
 * the button still looked finished without it — a static gold pill reads as
 * complete rather than as broken. Meanwhile the name kept promising a shimmer
 * on every screen that matters: onboarding steps 2-4, the notification opt-in,
 * and all three paywall screens including Start Free Trial.
 *
 * Two things are deliberately different from the version that was removed:
 *
 *   - It does not shimmer while disabled. A control that sparkles and does
 *     nothing when pressed is worse than a flat one; the animation is an
 *     invitation and a disabled button is not inviting anything.
 *   - It respects Reduce Motion. An infinitely repeating animation is the
 *     exact case that setting exists for, and this one runs for as long as the
 *     screen is open.
 */
export function ShimmerButton({
  children,
  onPress,
  style,
  disabled = false,
  Icon,
  accessibilityLabel,
}: Props) {
  const { C, G } = useTheme();
  // Travel distance comes from the window, not from measuring the button.
  //
  // The version that was removed gated the whole sweep on an `onLayout`
  // measurement, and on react-native-web that callback never fires for this
  // element — the node measures 335x50 in the DOM while the state stayed 0, so
  // the shimmer silently did not exist. That is the same failure shape as the
  // FadeIn opacity bug: a decorative animation holding the visible feature
  // hostage to a callback that may not arrive.
  //
  // Every ShimmerButton in this app is full-width inside SCREEN_MARGIN, so the
  // window is within a margin of the true width, and `overflow: hidden` on the
  // pill clips the rest. The sweep is now unconditional.
  const { width: windowWidth } = useWindowDimensions();
  const [reduceMotion, setReduceMotion] = useState(false);
  const tx = useSharedValue(-OVERSHOOT);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (!cancelled) setReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  const shimmering = !disabled && !reduceMotion;

  useEffect(() => {
    if (!shimmering) {
      cancelAnimation(tx);
      // Park it off the left edge so a cancelled sweep does not freeze a bright
      // band across the middle of the button.
      tx.value = -OVERSHOOT;
      return;
    }
    tx.value = -OVERSHOOT;
    tx.value = withRepeat(
      withTiming(windowWidth + OVERSHOOT, { duration: SWEEP_MS, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(tx);
    // tx is a stable Reanimated shared value — intentionally omitted from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shimmering, windowWidth]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
  }));

  const label = typeof children === 'string' ? children : null;
  const isStringChild = label !== null;

  const disabledColors: readonly [string, string] = [C.JADE_ACCENT_DIM, C.JADE_ACCENT_DIM];
  // C.TEXT3 on the disabled wash measures 4.71 dark / 4.94 light. C.BG on it
  // measured 1.10 / 1.04 — no readable label at all.
  const labelColor = disabled ? C.TEXT3 : C.BG;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label ?? undefined}
      accessibilityState={{ disabled }}
      // No blanket `opacity: 0.5` when disabled — same fix as PrimaryButton.
      // It dimmed the label along with the fill, and the label is C.BG, which is
      // meant for the gold gradient and not for a half-faded one. Disabled is a
      // flat muted fill plus a C.TEXT3 label, so the two button components look
      // and measure the same in that state.
      style={({ pressed }) => [
        {
          width: '100%',
          transform: [{ scale: pressed && !disabled ? 0.97 : 1 }],
        },
        style,
      ]}
    >
      <View style={styles.container}>
        {/* ── Layer 1: App Theme Background Gradient ── */}
        <ExpoGradient
          colors={disabled ? disabledColors : (G.GOLD_STOPS as unknown as readonly [string, string])}
          start={ANGLE_135.start}
          end={ANGLE_135.end}
          style={StyleSheet.absoluteFill}
        />

        {/* ── Layer 2: Button content ── */}
        <View style={styles.content} pointerEvents="none">
          {isStringChild ? (
            <>
              <Text style={[styles.text, { color: labelColor }]}>{label}</Text>
              {Icon && <Icon size={18} strokeWidth={1.5} color={labelColor} style={{ marginLeft: 6 }} />}
            </>
          ) : (
            <View style={styles.childWrapper}>{children}</View>
          )}
        </View>

        {/* ── Layer 3: The sweep ──
            Hardcoded white rather than a theme token, and that is not an
            oversight. This is a specular highlight — the light falling on the
            surface, not the surface itself — so it is white in both themes for
            the same reason a reflection is. The fill underneath is GOLD_STOPS
            either way, so there is no dark-mode variant to track.

            It sits above the label so the highlight crosses the text as it
            would on a real glossy surface, at an alpha low enough to leave the
            label's contrast intact (0.25 white over gold at C.BG text). */}
        {shimmering && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Animated.View
              style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, width: SHIMMER_W }, sweepStyle]}
            >
              <ExpoGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.25)', 'rgba(255,255,255,0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[StyleSheet.absoluteFill, { transform: [{ skewX: '-20deg' }] }]}
              />
            </Animated.View>
          </View>
        )}
      </View>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 100,    // Pure pill shape
    overflow: 'hidden',   // Perfectly masks gradient spills
    minHeight: 50,
  },
  content: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    zIndex: 1, // Ensures text remains on top
  },
  text: {
    fontFamily: FONT_HEADING_SEMI,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  childWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
