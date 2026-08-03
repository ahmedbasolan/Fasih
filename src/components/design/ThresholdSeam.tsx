import React, { useState } from 'react';
import { View, LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

interface ThresholdSeamProps {
  color?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * The Threshold Seam — a thin gold stitch based on the diamond weave of sadu
 * textiles. Renders directly beneath a primary spoken Arabic line, and
 * nowhere else — the one recurring mark that makes a screenshot
 * recognizably Fasih rather than any other dark-mode app.
 *
 * react-native-svg has no <pattern> element, so the zigzag is tiled by hand
 * (same approach as GeoPattern in this folder).
 */
export function ThresholdSeam({ color, height = 8, style }: ThresholdSeamProps) {
  const { C } = useTheme();
  const seamColor = color ?? C.CULTURAL_GOLD;
  const [width, setWidth] = useState(0);
  const tileWidth = height * 1.8;
  const peakY = height * 0.1;
  const baseY = height * 0.9;
  const dotR = height * 0.11;
  const tiles = Math.ceil(width / tileWidth) + 1;

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={[{ width: '100%', height }, style]} onLayout={onLayout}>
      {width > 0 && (
        <Svg width={width} height={height}>
          {Array.from({ length: tiles }, (_, i) => {
            const x0 = i * tileWidth;
            const xMid = x0 + tileWidth / 2;
            const x1 = x0 + tileWidth;
            return (
              <React.Fragment key={i}>
                <Path
                  d={`M${x0},${baseY} L${xMid},${peakY} L${x1},${baseY}`}
                  fill="none"
                  stroke={seamColor}
                  strokeWidth={height * 0.13}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Circle cx={xMid} cy={peakY} r={dotR} fill={seamColor} />
              </React.Fragment>
            );
          })}
        </Svg>
      )}
    </View>
  );
}
