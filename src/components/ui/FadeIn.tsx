import React from 'react';
import { MotiView } from 'moti';
import type { ViewStyle } from 'react-native';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
}

/**
 * Reusable micro-animation component for consistent onboarding transitions.
 * Behavior: Opacity (0 -> 1), translateY (14 -> 0). Subtle timing fade, no bounce.
 */
export function FadeIn({ children, delay = 0, style }: FadeInProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: 380,
        delay,
      }}
      style={style}
    >
      {children}
    </MotiView>
  );
}
