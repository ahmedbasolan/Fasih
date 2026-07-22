import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  isPlaying: boolean;
  color?: string;
  barCount?: number;
  size?: 'sm' | 'md' | 'lg';
}

const BAR_CONFIGS = {
  sm: { width: 3, height: 16, gap: 2 },
  md: { width: 4, height: 24, gap: 3 },
  lg: { width: 5, height: 32, gap: 4 },
};

export function WaveBars({ 
  isPlaying, 
  color, 
  barCount = 5, 
  size = 'md' 
}: Props) {
  const { C } = useTheme();
  const themeColor = color || C.JADE2;
  const config = BAR_CONFIGS[size];

  // Give each bar its own peak so the wave looks uneven. Math.random() must not
  // run during render — that makes render impure and re-rolls the heights on
  // every re-render (the bars visibly jitter). A lazy state initializer runs
  // exactly once per mount, and unlike useMemo React will never discard it.
  // Stored as fractions of the container height so a `size` change rescales
  // them instead of leaving stale pixel values behind.
  const [peakFractions] = useState(() =>
    Array.from({ length: barCount }, () => 0.4 + Math.random() * 0.6),
  );

  return (
    <View style={[styles.container, { height: config.height, gap: config.gap }]}>
      {Array.from({ length: barCount }, (_, i) => (
        <MotiView
          key={`${isPlaying}-${i}`}
          from={{ height: config.height * 0.3, opacity: 0.4 }}
          animate={isPlaying ? {
            height: [
              config.height * 0.3,
              config.height * (peakFractions[i] ?? 0.7),
              config.height * 0.3,
            ],
            opacity: [0.4, 1, 0.4],
          } : {
            height: config.height * 0.3,
            opacity: 0.4,
          }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 80,
            repeat: isPlaying ? -1 : 0,
            delay: i * 100,
          }}
          style={[
            styles.bar,
            {
              width: config.width,
              backgroundColor: themeColor,
              borderRadius: config.width / 2,
            }
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {},
});
