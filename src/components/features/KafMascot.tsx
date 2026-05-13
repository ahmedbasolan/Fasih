import React from 'react';
import { MotiView } from 'moti';
import Svg, { Circle, Path, Defs, RadialGradient, Stop, G, Ellipse } from 'react-native-svg';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface KafMascotProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  tapCount?: number;
  mood?: 'idle' | 'happy' | 'thinking';
}

const S = { xs: 48, sm: 68, md: 98, lg: 138, xl: 184 };

export function KafMascot({ size = 'md', animate = true, tapCount = 0, mood = 'idle' }: KafMascotProps) {
  const reducedMotion = useReducedMotion();
  const shouldAnimate = animate && !reducedMotion;
  const s = S[size];
  const excited = tapCount > 3;
  const showFace = size !== 'xs';

  // Colors based on mood
  const bodyPrimary = mood === 'happy' ? '#3BD4A0' : '#02B986';
  const bodySecondary = mood === 'happy' ? '#2EA87A' : '#019472';
  const bodyDark = mood === 'happy' ? '#1A8A60' : '#016B4E';
  const accentColor = mood === 'happy' ? '#FFD700' : '#FFD700';
  const cheekColor = mood === 'happy' ? '#2EA87A' : '#5FFFB8';

  return (
    <MotiView
      style={{ width: s, height: s }}
      animate={shouldAnimate ? {
        translateY: excited ? [0, -10, 2, -6, 0] : [0, -4, 0],
        scale: excited ? [1, 1.05, 0.97, 1.03, 1] : 1,
      } : {}}
      transition={shouldAnimate
        ? (excited
          ? { type: 'timing', duration: 900, loop: true }
          : { type: 'timing', duration: 4500, loop: true })
        : { type: 'timing', duration: 0 }
      }
    >
      {/* Outer glow */}
      <MotiView
        style={{
          position: 'absolute',
          top: -s * 0.12,
          left: -s * 0.12,
          right: -s * 0.12,
          bottom: -s * 0.12,
          borderRadius: s * 0.42,
          backgroundColor: bodyPrimary,
          opacity: reducedMotion ? (mood === 'happy' ? 0.22 : 0.13) : undefined,
        }}
        animate={reducedMotion ? undefined : {
          opacity: mood === 'happy' ? [0.15, 0.3, 0.15] : [0.08, 0.18, 0.08],
        }}
        transition={reducedMotion ? undefined : {
          type: 'timing',
          duration: mood === 'happy' ? 1800 : 3000,
          loop: true,
        }}
      />

      {/* Main SVG mascot */}
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="bodyGrad" cx="40%" cy="35%" rx="55%" ry="55%">
            <Stop offset="0" stopColor={bodyPrimary} />
            <Stop offset="0.7" stopColor={bodySecondary} />
            <Stop offset="1" stopColor={bodyDark} />
          </RadialGradient>
          <RadialGradient id="shineGrad" cx="35%" cy="25%" rx="45%" ry="45%">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.35} />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="cheekL" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={cheekColor} stopOpacity={0.5} />
            <Stop offset="1" stopColor={cheekColor} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="cheekR" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={cheekColor} stopOpacity={0.5} />
            <Stop offset="1" stopColor={cheekColor} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Shadow underneath */}
        <Ellipse cx={50} cy={94} rx={28} ry={4} fill="#000000" opacity={0.08} />

        {/* Body — squircle blob shape */}
        <Path
          d="M 50 6 C 72 6 86 10 90 22 C 94 34 94 58 90 72 C 86 86 72 92 50 92 C 28 92 14 86 10 72 C 6 58 6 34 10 22 C 14 10 28 6 50 6 Z"
          fill="url(#bodyGrad)"
        />

        {/* Glossy shine overlay */}
        <Path
          d="M 50 8 C 68 8 80 12 84 22 C 72 14 38 14 20 26 C 24 12 36 8 50 8 Z"
          fill="#FFFFFF"
          opacity={0.2}
        />

        {/* ── Arabic letter ك integrated into the body ── */}
        <G opacity={0.18}>
          {/* Stylised Kaf shape — large, centered, acts as body texture */}
          <Path
            d="M 38 72 C 38 52 40 42 50 38 C 60 42 62 52 62 72"
            stroke="#FFFFFF"
            strokeWidth={2.8}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M 36 72 L 64 72"
            stroke="#FFFFFF"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          {/* The hamza-like dot */}
          <Circle cx={50} cy={32} r={2.5} fill="#FFFFFF" />
        </G>

        {showFace && (
          <G>
            {/* ══════ IDLE FACE ══════ */}
            {mood === 'idle' && (
              <G>
                {/* Left eye — large, cute */}
                <Ellipse cx={36} cy={44} rx={7} ry={7.5} fill="#FFFFFF" />
                <Circle cx={37} cy={44.5} r={4.5} fill="#2D1B69" />
                <Circle cx={38.5} cy={42.5} r={1.8} fill="#FFFFFF" />
                <Circle cx={36} cy={45.5} r={0.8} fill="#FFFFFF" opacity={0.5} />

                {/* Right eye — large, cute */}
                <Ellipse cx={64} cy={44} rx={7} ry={7.5} fill="#FFFFFF" />
                <Circle cx={65} cy={44.5} r={4.5} fill="#2D1B69" />
                <Circle cx={66.5} cy={42.5} r={1.8} fill="#FFFFFF" />
                <Circle cx={64} cy={45.5} r={0.8} fill="#FFFFFF" opacity={0.5} />

                {/* Gentle smile */}
                <Path
                  d="M 42 62 Q 50 68 58 62"
                  stroke="#2D1B69"
                  strokeWidth={2.2}
                  fill="none"
                  strokeLinecap="round"
                />

                {/* Rosy cheeks */}
                <Circle cx={26} cy={56} r={6} fill="url(#cheekL)" />
                <Circle cx={74} cy={56} r={6} fill="url(#cheekR)" />

                {/* Tiny nose */}
                <Ellipse cx={50} cy={54} rx={1.5} ry={1} fill="#2D1B69" opacity={0.25} />
              </G>
            )}

            {/* ══════ HAPPY FACE ══════ */}
            {mood === 'happy' && (
              <G>
                {/* Happy ^^ closed eyes */}
                <Path
                  d="M 29 44 Q 36 36 43 44"
                  stroke="#0A5035"
                  strokeWidth={2.8}
                  fill="none"
                  strokeLinecap="round"
                />
                <Path
                  d="M 57 44 Q 64 36 71 44"
                  stroke="#0A5035"
                  strokeWidth={2.8}
                  fill="none"
                  strokeLinecap="round"
                />

                {/* Big smile with open mouth */}
                <Path
                  d="M 38 60 Q 50 74 62 60"
                  stroke="#0A5035"
                  strokeWidth={2.2}
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Tongue peek */}
                <Ellipse cx={50} cy={66} rx={4} ry={3} fill="#FF7B8A" opacity={0.7} />

                {/* Bright cheeks */}
                <Circle cx={26} cy={54} r={7} fill="url(#cheekL)" />
                <Circle cx={74} cy={54} r={7} fill="url(#cheekR)" />

                {/* Star sparkle top-right */}
                <Path
                  d="M 82 18 L 83.5 22.5 L 88 24 L 83.5 25.5 L 82 30 L 80.5 25.5 L 76 24 L 80.5 22.5 Z"
                  fill={accentColor}
                  opacity={0.9}
                />
                {/* Small sparkle top-left */}
                <Path
                  d="M 18 22 L 19 25 L 22 26 L 19 27 L 18 30 L 17 27 L 14 26 L 17 25 Z"
                  fill={accentColor}
                  opacity={0.7}
                />
              </G>
            )}

            {/* ══════ THINKING FACE ══════ */}
            {mood === 'thinking' && (
              <G>
                {/* Left eye — normal */}
                <Ellipse cx={36} cy={44} rx={7} ry={7.5} fill="#FFFFFF" />
                <Circle cx={35} cy={44.5} r={4.5} fill="#2D1B69" />
                <Circle cx={36.5} cy={42.5} r={1.8} fill="#FFFFFF" />

                {/* Right eye — looking up-right */}
                <Ellipse cx={64} cy={44} rx={7} ry={7.5} fill="#FFFFFF" />
                <Circle cx={66.5} cy={42} r={4.5} fill="#2D1B69" />
                <Circle cx={68} cy={40} r={1.8} fill="#FFFFFF" />

                {/* Raised right eyebrow */}
                <Path
                  d="M 57 32 Q 64 28 72 33"
                  stroke="#2D1B69"
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  opacity={0.7}
                />

                {/* Hmm mouth — wavy */}
                <Path
                  d="M 42 63 Q 46 60 50 63 Q 54 66 58 63"
                  stroke="#2D1B69"
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                />

                {/* Thinking dots (ellipsis bubble) */}
                <G opacity={0.5}>
                  <Circle cx={78} cy={28} r={1.5} fill="#2D1B69" />
                  <Circle cx={82} cy={22} r={2} fill="#2D1B69" />
                  <Circle cx={86} cy={15} r={2.5} fill="#2D1B69" />
                </G>

                {/* Slight cheek blush */}
                <Circle cx={26} cy={56} r={5} fill="url(#cheekL)" />
                <Circle cx={74} cy={56} r={5} fill="url(#cheekR)" />
              </G>
            )}
          </G>
        )}

        {/* XS fallback — just show a simpler face */}
        {!showFace && (
          <G>
            <Circle cx={38} cy={46} r={3.5} fill="#FFFFFF" opacity={0.9} />
            <Circle cx={62} cy={46} r={3.5} fill="#FFFFFF" opacity={0.9} />
            <Path d="M 44 62 Q 50 66 56 62" stroke="#FFFFFF" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.7} />
          </G>
        )}
      </Svg>

      {/* Happy sparkle particles */}
      {mood === 'happy' && showFace && !reducedMotion && (
        <>
          <MotiView
            from={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: [0, 0.9, 0], scale: [0.3, 1, 0.3] }}
            transition={{ type: 'timing', duration: 1400, loop: true, delay: 0 }}
            style={{ position: 'absolute', top: -s * 0.06, right: s * 0.06, width: s * 0.06, height: s * 0.06, borderRadius: s * 0.03, backgroundColor: accentColor }}
          />
          <MotiView
            from={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: [0, 0.8, 0], scale: [0.3, 1, 0.3] }}
            transition={{ type: 'timing', duration: 1400, loop: true, delay: 400 }}
            style={{ position: 'absolute', top: s * 0.15, left: -s * 0.05, width: s * 0.05, height: s * 0.05, borderRadius: s * 0.025, backgroundColor: '#3BD4A0' }}
          />
          <MotiView
            from={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: [0, 0.85, 0], scale: [0.3, 1, 0.3] }}
            transition={{ type: 'timing', duration: 1400, loop: true, delay: 800 }}
            style={{ position: 'absolute', bottom: s * 0.02, right: -s * 0.03, width: s * 0.055, height: s * 0.055, borderRadius: s * 0.028, backgroundColor: accentColor }}
          />
        </>
      )}

      {/* Excited pulse ring */}
      {excited && !reducedMotion && (
        <MotiView
          style={{
            position: 'absolute',
            top: -4,
            left: -4,
            right: -4,
            bottom: -4,
            borderRadius: s * 0.32,
            borderWidth: 1.5,
            borderColor: accentColor,
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
