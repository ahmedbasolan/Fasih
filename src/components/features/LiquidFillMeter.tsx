import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, LinearGradient, Stop, Path, Ellipse } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  value: number; // 0-100
  max?: number;
  size?: number;
  color?: string;
  showCrest?: boolean;
  strokeWidth?: number;
}

export function LiquidFillMeter({ 
  value, 
  max = 100, 
  size = 80, 
  color,
  showCrest = true,
  strokeWidth = 3
}: Props) {
  const { C } = useTheme();
  const themeColor = color || C.JADE2;
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  // Calculate liquid fill height
  const liquidHeight = (percentage / 100) * size;
  const liquidPath = `M${strokeWidth},${size - liquidHeight} L${size - strokeWidth},${size - liquidHeight} L${size - strokeWidth},${size} L${strokeWidth},${size} Z`;
  
  return (
    <View
      style={[styles.container, { width: size, height: size }]}
    >
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="liquid" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={themeColor} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={themeColor} stopOpacity="0.4" />
          </LinearGradient>
          <LinearGradient id="crest" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={themeColor} stopOpacity="0" />
            <Stop offset="50%" stopColor={themeColor} stopOpacity="0.6" />
            <Stop offset="100%" stopColor={themeColor} stopOpacity="0" />
          </LinearGradient>
          <ClipPath id="meterClip">
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
            />
          </ClipPath>
        </Defs>
        
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={C.BORDER}
          strokeWidth={strokeWidth}
        />
        
        {/* Liquid fill */}
        <View
          style={{ height: liquidHeight }}
        >
          <Path
            d={liquidPath}
            fill="url(#liquid)"
            clipPath="url(#meterClip)"
          />

          {/* Crest highlight — static */}
          {showCrest && percentage > 5 && (
            <Ellipse
              cx={size / 2}
              cy={size - liquidHeight - 5}
              rx={15}
              ry={3}
              fill="url(#crest)"
            />
          )}
        </View>
        
        {/* Progress ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={themeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
