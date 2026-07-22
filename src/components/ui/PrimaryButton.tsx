import React, { useCallback } from 'react';
import { Pressable, Text, ViewStyle, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { FONT_HEADING_SEMI, PRESS_SCALE, PRESS_DURATION_IN, PRESS_DURATION_OUT } from '../design/tokens';
import { ANGLE_135 } from '../design/gradients';

type Variant = 'gold' | 'jade';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  /** Show a spinner and block interaction. Use during async operations to prevent double-submit. */
  loading?: boolean;
  variant?: Variant;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function PrimaryButton({ children, onPress, disabled, loading, variant = 'gold', style, accessibilityLabel }: Props) {
  const { C, G } = useTheme();
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (isDisabled) return;
    scale.value = withTiming(PRESS_SCALE, {
      duration: PRESS_DURATION_IN,
      easing: Easing.out(Easing.cubic),
    });
  }, [isDisabled, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, {
      duration: PRESS_DURATION_OUT,
      easing: Easing.out(Easing.cubic),
    });
  }, [scale]);

  const disabledColors: readonly [string, string] = [C.JADE_ACCENT_DIM, C.JADE_ACCENT_DIM];

  return (
    <Animated.View
      style={[{ borderRadius: 100, overflow: 'hidden', opacity: isDisabled ? 0.5 : 1, minHeight: 52 }, animatedStyle, style]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      >
        <LinearGradient
          colors={isDisabled ? disabledColors : variant === 'gold' ? G.GOLD_STOPS : G.JADE_STOPS}
          start={ANGLE_135.start}
          end={ANGLE_135.end}
          style={{ paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, minHeight: 52 }}
        >
          {loading ? (
            <ActivityIndicator size="small" color={C.WHITE} />
          ) : typeof children === 'string' ? (
            <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 15, color: C.WHITE }}>{children}</Text>
          ) : children}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}
