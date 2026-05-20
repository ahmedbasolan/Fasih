import React from 'react';
import { MotiView } from 'moti';
import type { ViewStyle } from 'react-native';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
}

export function FadeIn({ children, delay = 0, style }: FadeInProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 350, delay }}
      style={style}
    >
      {children}
    </MotiView>
  );
}
