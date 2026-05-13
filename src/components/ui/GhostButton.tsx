import React, { useCallback } from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { FONT_LATIN, PRESS_SCALE, PRESS_DURATION_IN, PRESS_DURATION_OUT } from '../design/tokens';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  children: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export function GhostButton({ children, onPress, style }: Props) {
  const { C } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(PRESS_SCALE, {
      duration: PRESS_DURATION_IN,
      easing: Easing.out(Easing.cubic),
    });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, {
      duration: PRESS_DURATION_OUT,
      easing: Easing.out(Easing.cubic),
    });
  }, [scale]);

  return (
    <Animated.View
      style={[styles.root, { backgroundColor: C.SURFACE, borderColor: C.BORDER }, animatedStyle, style]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        style={styles.pressable}
      >
        <Text style={[styles.text, { color: C.TEXT2 }]}>{children}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pressable: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  text: { fontFamily: FONT_LATIN, fontSize: 14 },
});
