import React from 'react';
import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { C, FONT_ARABIC_BLACK } from './design/tokens';

interface KafMascotProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  tapCount?: number;
  mood?: 'idle' | 'happy' | 'thinking';
}

const S = { xs: 48, sm: 68, md: 98, lg: 138, xl: 184 };

export function KafMascot({ size = 'md', animate = true, tapCount = 0, mood = 'idle' }: KafMascotProps) {
  const s = S[size];
  const excited = tapCount > 3;
  const r = s * 0.28;

  return (
    <MotiView
      style={{ width: s, height: s }}
      animate={animate ? {
        translateY: excited ? [0, -10, 2, -6, 0] : [0, -4, 0],
        scale: excited ? [1, 1.05, 0.97, 1.03, 1] : 1,
      } : {}}
      transition={excited
        ? { type: 'timing', duration: 900, loop: true }
        : { type: 'timing', duration: 4500, loop: true }
      }
    >
      {/* Outer glow */}
      <MotiView
        style={{
          position: 'absolute',
          top: -s * 0.15,
          left: -s * 0.15,
          right: -s * 0.15,
          bottom: -s * 0.15,
          borderRadius: r + s * 0.15,
          backgroundColor: 'rgba(200,145,58,0.12)',
        }}
        animate={{
          opacity: [0.12, 0.22, 0.12],
        }}
        transition={{
          type: 'timing',
          duration: 3000,
          loop: true,
        }}
      />

      {/* Body */}
      <LinearGradient
        colors={['#130C26', '#09050F', '#160E2A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          top: 2,
          left: 2,
          right: 2,
          bottom: 2,
          borderRadius: r,
          borderWidth: 1,
          borderColor: 'rgba(200,145,58,0.18)',
        }}
      />

      {/* The ك letter */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', borderRadius: r }}>
        <MotiView
          animate={excited ? { scale: [1, 1.1, 1] } : {}}
          transition={{ type: 'timing', duration: 500, loop: excited }}
        >
          <Text
            style={{
              fontSize: s * 0.46,
              fontFamily: FONT_ARABIC_BLACK,
              color: C.GOLD,
              textShadowColor: 'rgba(200,145,58,0.55)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: excited ? s * 0.08 : s * 0.05,
            }}
          >
            ك
          </Text>
        </MotiView>
      </View>

      {/* Excited pulse ring */}
      {excited && (
        <MotiView
          style={{
            position: 'absolute',
            top: -4,
            left: -4,
            right: -4,
            bottom: -4,
            borderRadius: r + 4,
            borderWidth: 1.5,
            borderColor: C.GOLD,
          }}
          animate={{
            scale: [1, 1.35],
            opacity: [0.7, 0],
          }}
          transition={{
            type: 'timing',
            duration: 800,
            loop: true,
          }}
        />
      )}
    </MotiView>
  );
}
