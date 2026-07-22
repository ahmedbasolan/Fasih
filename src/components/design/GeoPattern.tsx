import React, { useState } from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import Svg, { Polygon, Circle } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

interface GeoPatternProps {
  opacity?: number;
  color?: string;
  size?: number;
}

// Rewritten using react-native-svg with manual tiling
// (react-native-svg doesn't support SVG <pattern> element)
export function GeoPattern({ opacity = 0.04, color, size = 56 }: GeoPatternProps) {
  const { C } = useTheme();
  const patternColor = color || C.JADE_ACCENT;
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const cx = size / 2;
  const r = size * 0.44;
  const ir = size * 0.22;

  const outerPts = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 - 22.5) * (Math.PI / 180);
    return { x: cx + r * Math.cos(a), y: cx + r * Math.sin(a) };
  });
  const innerPts = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45) * (Math.PI / 180);
    return { x: cx + ir * Math.cos(a), y: cx + ir * Math.sin(a) };
  });

  const toStr = (pts: { x: number; y: number }[]) =>
    pts.map((p) => `${p.x},${p.y}`).join(' ');

  const cols = Math.ceil(dims.width / size) + 1;
  const rows = Math.ceil(dims.height / size) + 1;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setDims({ width, height });
  };

  return (
    <View
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      pointerEvents="none"
      onLayout={onLayout}
    >
      {dims.width > 0 && (
        <Svg width={dims.width} height={dims.height} style={{ opacity }}>
          {Array.from({ length: rows }, (_, row) =>
            Array.from({ length: cols }, (_, col) => (
              <React.Fragment key={`${row}-${col}`}>
                <Polygon
                  points={toStr(
                    outerPts.map((p) => ({ x: p.x + col * size, y: p.y + row * size }))
                  )}
                  fill="none"
                  stroke={patternColor}
                  strokeWidth={0.4}
                />
                <Polygon
                  points={toStr(
                    innerPts.map((p) => ({ x: p.x + col * size, y: p.y + row * size }))
                  )}
                  fill="none"
                  stroke={patternColor}
                  strokeWidth={0.3}
                />
                <Circle
                  cx={cx + col * size}
                  cy={cx + row * size}
                  r={size * 0.06}
                  fill={patternColor}
                  fillOpacity={0.4}
                />
              </React.Fragment>
            ))
          )}
        </Svg>
      )}
    </View>
  );
}
