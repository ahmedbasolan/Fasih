import React, { useCallback } from 'react';
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { PRESS_DURATION_IN, PRESS_DURATION_OUT, PRESS_SCALE } from '../design/tokens';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  /** Show green left-edge accent bar. Use on interactive content cards. */
  hasAccent?: boolean;
  /** hero: richer dark-green bg for featured content. stat: no accent, flat. */
  variant?: 'standard' | 'hero' | 'stat';
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'none';
}

export function SoukCard({
  children,
  onPress,
  style,
  contentStyle,
  hasAccent = false,
  variant = 'standard',
  accessibilityLabel,
  accessibilityRole,
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (!onPress) return;
    scale.value = withTiming(PRESS_SCALE, {
      duration: PRESS_DURATION_IN,
      easing: Easing.out(Easing.cubic),
    });
  }, [onPress, scale]);

  const handlePressOut = useCallback(() => {
    if (!onPress) return;
    scale.value = withTiming(1, {
      duration: PRESS_DURATION_OUT,
      easing: Easing.out(Easing.cubic),
    });
  }, [onPress, scale]);

  return (
    <Animated.View
      style={[
        styles.card,
        variant === 'hero' && styles.heroCard,
        animatedStyle,
        style,
      ]}
    >
      {/* Top shimmer gradient line */}
      <LinearGradient
        colors={['transparent', 'rgba(0,255,149,0.38)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.shimmer}
        pointerEvents="none"
      />

      {/* Left accent bar — interactive content cards */}
      {hasAccent && <View style={styles.accent} pointerEvents="none" />}

      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole={accessibilityRole ?? (onPress ? 'button' : undefined)}
        accessibilityLabel={accessibilityLabel}
        style={[styles.pressable, contentStyle]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  heroCard: {
    borderRadius: 18,
    backgroundColor: '#001F14',
    borderColor: 'rgba(0,255,149,0.12)',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: '12%',
    right: '12%',
    height: 1,
    zIndex: 1,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 14,
    bottom: 14,
    width: 2,
    borderRadius: 2,
    backgroundColor: '#00FF95',
    opacity: 0.6,
    zIndex: 1,
  },
  pressable: {
    flex: 1,
  },
});
