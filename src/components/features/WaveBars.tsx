import React, { useEffect, useState } from 'react';
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
  const [animationKey, setAnimationKey] = useState(0);
  const config = BAR_CONFIGS[size];

  useEffect(() => {
    if (isPlaying) {
      setAnimationKey(prev => prev + 1);
    }
  }, [isPlaying]);

  return (
    <View style={[styles.container, { height: config.height, gap: config.gap }]}>
      {Array.from({ length: barCount }, (_, i) => (
        <MotiView
          key={`${animationKey}-${i}`}
          from={{ height: config.height * 0.3, opacity: 0.4 }}
          animate={isPlaying ? {
            height: [
              config.height * 0.3,
              config.height * (0.4 + Math.random() * 0.6),
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
