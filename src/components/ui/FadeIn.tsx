import React from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';
import type { ViewStyle } from 'react-native';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
}

/**
 * Entrance animation for onboarding. Slides up; does NOT fade.
 *
 * It used to animate `opacity: 0 -> 1`, which made a decorative animation
 * load-bearing for visibility: whenever the animation did not run, the content
 * stayed at its `from` value and the screen was blank. That is not theoretical
 * — on web, every reload leaves Reanimated's driver stalled with the wrapper
 * pinned at opacity 0 (measured: unchanged across 2.5s of sampling, no console
 * error). There are 41 of these across the five onboarding files, so the whole
 * flow rendered as an empty page.
 *
 * Now the opacity never leaves 1 and only `translateY` animates. The stagger
 * still reads, because the delays are unchanged and the eye follows movement.
 * If the driver dies the content simply sits 14px low — a cosmetic offset
 * instead of a blank product.
 *
 * The plain `View` wrapper carries the layout style so a failed animation
 * cannot affect layout either.
 */
export function FadeIn({ children, delay = 0, style }: FadeInProps) {
  return (
    <View style={style}>
      <MotiView
        from={{ translateY: 14 }}
        animate={{ translateY: 0 }}
        transition={{ type: 'timing', duration: 380, delay }}
      >
        {children}
      </MotiView>
    </View>
  );
}
