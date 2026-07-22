import React, { useEffect, useState } from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';
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
const SHIMMER_W   = 100; // Width of the moving gradient block
const OVERSHOOT   = 160; // How far it travels past the edges

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  /** Full L→R sweep duration in ms. Default 2400ms. */
  duration?: number;
  disabled?: boolean;
  /** Optional Lucide icon rendered to the right of the label */
  Icon?: LucideIcon;
}

/**
 * ShimmerButton
 * 
 * Adapts to the app's primary theme gradient.
 * Uses a smooth, realistic glass-like shimmer effect.
 */
export function ShimmerButton({
  children,
  onPress,
  style,
  duration = 2400,
  disabled = false,
  Icon,
}: Props) {
  const { G } = useTheme();
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const tx = useSharedValue(-OVERSHOOT);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDims({ w: width, h: height });
  };

  useEffect(() => {
    if (dims.w <= 0) return;
    tx.value = -OVERSHOOT;
    tx.value = withRepeat(
      withTiming(dims.w + OVERSHOOT, { duration, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(tx);
    // tx is a stable Reanimated shared value — intentionally omitted from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dims.w, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
  }));

  const label = typeof children === 'string' ? children : null;
  const isStringChild = label !== null;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          width: '100%',
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        style,
      ]}
    >
      <View style={styles.container} onLayout={onLayout}>
        {/* ── Layer 1: App Theme Background Gradient ── */}
        <ExpoGradient
          colors={G.GOLD_STOPS as any}
          start={ANGLE_135.start}
          end={ANGLE_135.end}
          style={StyleSheet.absoluteFillObject}
        />

        {/* ── Layer 2: Button content ── */}
        <View style={styles.content} pointerEvents="none">
          {isStringChild ? (
            <>
              <Text style={[styles.text, { color: '#FFFFFF' }]}>{label}</Text>
              {Icon && <Icon size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />}
            </>
          ) : (
            <View style={styles.childWrapper}>{children}</View>
          )}
        </View>

        {/* ── Layer 3: Realistic Shimmer Overlay ── */}
        {dims.w > 0 && dims.h > 0 && (
          <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            <Animated.View
              style={[
                { position: 'absolute', top: 0, bottom: 0, left: 0, width: SHIMMER_W },
                animatedStyle,
              ]}
            >
              <ExpoGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.25)', 'rgba(255,255,255,0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[StyleSheet.absoluteFillObject, { transform: [{ skewX: '-20deg' }] }]}
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
