import React from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  /** Fill fraction 0–1. Values outside range are clamped. */
  value: number;
  /** Bar height in points. Default: 6 */
  height?: number;
  /** Fill color. Defaults to C.JADE2. */
  color?: string;
  /** Track (background) color. Defaults to C.BORDER2. */
  trackColor?: string;
  /** Border radius of both track and fill. Default: 99 (pill) */
  borderRadius?: number;
  /** Animation duration in ms. Default: 400. Pass 0 to disable. */
  duration?: number;
  accessibilityLabel?: string;
}

/**
 * Shared progress bar used across Fasih for streaks, category mastery,
 * scenario progress, and subscription banners.
 *
 * Replaces the scattered inline View-based progress bars that were copy-pasted
 * across ProfileScreen, HomeScreenNew, StreakWidget, and ScenariosScreen.
 */
export function ProgressBar({
  value,
  height = 6,
  color,
  trackColor,
  borderRadius = 99,
  duration = 400,
  accessibilityLabel,
}: Props) {
  const { C } = useTheme();
  const pct = Math.min(Math.max(value, 0), 1) * 100;

  return (
    <View
      style={{ height, borderRadius, backgroundColor: trackColor ?? C.BORDER2, overflow: 'hidden' }}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
    >
      <MotiView
        animate={{ width: `${pct}%` as `${number}%` }}
        transition={{ type: 'timing', duration }}
        style={{ height, borderRadius, backgroundColor: color ?? C.JADE2 }}
      />
    </View>
  );
}
