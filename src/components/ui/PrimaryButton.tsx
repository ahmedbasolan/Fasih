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
import { haptic } from '../../lib/haptics';


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
    haptic.light();
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
    // No blanket `opacity: 0.5` when disabled.
    //
    // It dimmed the LABEL as well as the fill, and the label was C.BG — meant
    // for the gold gradient, not for the pale disabled wash. Measured on the
    // disabled state: 1.10:1 dark and 1.04:1 light, i.e. no readable label at
    // all. Halving everything then capped even C.TEXT2 at 2.94/2.25, so the
    // opacity was the mechanism at fault, not just the colour.
    //
    // Disabled is now carried by the muted fill plus a C.TEXT3 label, which
    // measures 4.71 dark / 4.94 light. This matters more since the mode step's
    // Continue starts disabled by design.
    <Animated.View
      style={[{ borderRadius: 100, overflow: 'hidden', minHeight: 52 }, animatedStyle, style]}
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
            <ActivityIndicator size="small" color={C.BG} />
          ) : typeof children === 'string' ? (
            <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 16, color: isDisabled ? C.TEXT3 : C.BG }}>{children}</Text>
          ) : children}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}
