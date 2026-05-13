import React from 'react';
import { MotiView } from 'moti';
import type { ViewStyle } from 'react-native';
import { SPRING_SLOW } from '../design/tokens';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
}

/**
 * Reusable micro-animation component for consistent onboarding transitions.
 * Behavior: Opacity (0 -> 1), translateY (50 -> 0).
 */
export function FadeIn({ children, delay = 0, style }: FadeInProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 50 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        ...SPRING_SLOW,
        delay,
      }}
      style={style}
    >
      {children}
    </MotiView>
  );
}
