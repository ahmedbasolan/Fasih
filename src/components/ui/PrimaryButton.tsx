import React, { useCallback } from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';
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
  variant?: Variant;
  style?: ViewStyle;
}

export function PrimaryButton({ children, onPress, disabled, variant = 'gold', style }: Props) {
  const { C, G } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    scale.value = withTiming(PRESS_SCALE, {
      duration: PRESS_DURATION_IN,
      easing: Easing.out(Easing.cubic),
    });
  }, [disabled, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, {
      duration: PRESS_DURATION_OUT,
      easing: Easing.out(Easing.cubic),
    });
  }, [scale]);

  const disabledColors: readonly [string, string] = [C.GOLD_DIM, C.GOLD_DIM];

  return (
    <Animated.View
      style={[{ borderRadius: 100, overflow: 'hidden', opacity: disabled ? 0.5 : 1 }, animatedStyle, style]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
      >
        <LinearGradient
          colors={disabled ? disabledColors : variant === 'gold' ? G.GOLD_STOPS : G.JADE_STOPS}
          start={ANGLE_135.start}
          end={ANGLE_135.end}
          style={{ paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
        >
          {typeof children === 'string' ? (
            <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 15, color: '#FFFFFF' }}>{children}</Text>
          ) : children}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}
