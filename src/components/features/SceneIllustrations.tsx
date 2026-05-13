import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Rect, Line, Defs, LinearGradient as SvgGradient, Stop, G, Ellipse } from 'react-native-svg';

interface SceneProps {
  width: number;
  height: number;
}

/**
 * Hero card background — Dubai-inspired skyline silhouette
 * with crescent moon, stars, and geometric accents
 */
export function HeroSceneBg({ width, height }: SceneProps) {
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <SvgGradient id="heroSky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#060E18" />
            <Stop offset="0.5" stopColor="#0D1830" />
            <Stop offset="1" stopColor="#162440" />
          </SvgGradient>
          <SvgGradient id="heroGold" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFD700" />
            <Stop offset="1" stopColor="#FFB800" />
          </SvgGradient>
        </Defs>
        {/* Sky fill */}
        <Rect x={0} y={0} width={width} height={height} fill="url(#heroSky)" />

        {/* Stars */}
        {[
          { cx: width * 0.12, cy: height * 0.15, r: 1.2 },
          { cx: width * 0.28, cy: height * 0.08, r: 1.5 },
          { cx: width * 0.42, cy: height * 0.22, r: 1 },
          { cx: width * 0.55, cy: height * 0.12, r: 1.8 },
          { cx: width * 0.72, cy: height * 0.18, r: 1.2 },
          { cx: width * 0.85, cy: height * 0.08, r: 1.4 },
          { cx: width * 0.92, cy: height * 0.25, r: 1 },
          { cx: width * 0.35, cy: height * 0.32, r: 0.8 },
          { cx: width * 0.65, cy: height * 0.28, r: 0.9 },
          { cx: width * 0.18, cy: height * 0.35, r: 1.1 },
        ].map((s, i) => (
          <Circle key={`star-${i}`} cx={s.cx} cy={s.cy} r={s.r} fill="#FFFFFF" opacity={0.3 + (i % 3) * 0.15} />
        ))}

        {/* Crescent moon */}
        <G transform={`translate(${width * 0.78}, ${height * 0.12})`}>
          <Circle cx={0} cy={0} r={14} fill="#FFD700" opacity={0.85} />
          <Circle cx={5} cy={-3} r={12} fill="#0D1830" />
          {/* Small star near moon */}
          <Path d="M18 -8 L19 -5 L22 -5 L19.5 -3 L20.5 0 L18 -2 L15.5 0 L16.5 -3 L14 -5 L17 -5 Z" fill="#FFD700" opacity={0.7} />
        </G>

        {/* Geometric arabesque accent — top-left */}
        <G opacity={0.06}>
          {[0, 1, 2].map(i => {
            const cx0 = width * 0.05 + i * 28;
            const cy0 = height * 0.08;
            return (
              <Path key={`geo-${i}`}
                d={`M ${cx0} ${cy0 - 10} L ${cx0 + 8} ${cy0} L ${cx0} ${cy0 + 10} L ${cx0 - 8} ${cy0} Z`}
                stroke="#FFD700" strokeWidth={0.8} fill="none" />
            );
          })}
        </G>

        {/* Dubai skyline silhouette */}
        <Path
          d={`M 0 ${height}
            L 0 ${height * 0.78}
            L ${width * 0.05} ${height * 0.72}
            L ${width * 0.08} ${height * 0.72}
            L ${width * 0.08} ${height * 0.58}
            L ${width * 0.1} ${height * 0.58}
            L ${width * 0.1} ${height * 0.72}
            L ${width * 0.15} ${height * 0.68}
            L ${width * 0.18} ${height * 0.68}
            L ${width * 0.18} ${height * 0.52}
            L ${width * 0.2} ${height * 0.48}
            L ${width * 0.22} ${height * 0.52}
            L ${width * 0.22} ${height * 0.68}
            L ${width * 0.28} ${height * 0.62}
            L ${width * 0.32} ${height * 0.62}
            L ${width * 0.32} ${height * 0.35}
            L ${width * 0.33} ${height * 0.2}
            L ${width * 0.34} ${height * 0.35}
            L ${width * 0.34} ${height * 0.62}
            L ${width * 0.38} ${height * 0.58}
            L ${width * 0.42} ${height * 0.58}
            L ${width * 0.42} ${height * 0.45}
            L ${width * 0.44} ${height * 0.42}
            L ${width * 0.46} ${height * 0.45}
            L ${width * 0.46} ${height * 0.58}
            L ${width * 0.52} ${height * 0.65}
            L ${width * 0.58} ${height * 0.6}
            L ${width * 0.62} ${height * 0.6}
            L ${width * 0.62} ${height * 0.42}
            L ${width * 0.64} ${height * 0.38}
            L ${width * 0.66} ${height * 0.42}
            L ${width * 0.66} ${height * 0.6}
            L ${width * 0.72} ${height * 0.64}
            L ${width * 0.78} ${height * 0.7}
            L ${width * 0.82} ${height * 0.7}
            L ${width * 0.82} ${height * 0.55}
            L ${width * 0.84} ${height * 0.52}
            L ${width * 0.86} ${height * 0.55}
            L ${width * 0.86} ${height * 0.7}
            L ${width * 0.92} ${height * 0.72}
            L ${width} ${height * 0.78}
            L ${width} ${height} Z`}
          fill="#0A0620"
          opacity={0.6}
        />

        {/* Building window lights */}
        {[
          { x: width * 0.09, y: height * 0.62 },
          { x: width * 0.09, y: height * 0.66 },
          { x: width * 0.19, y: height * 0.55 },
          { x: width * 0.21, y: height * 0.55 },
          { x: width * 0.33, y: height * 0.4 },
          { x: width * 0.33, y: height * 0.48 },
          { x: width * 0.33, y: height * 0.56 },
          { x: width * 0.43, y: height * 0.48 },
          { x: width * 0.45, y: height * 0.48 },
          { x: width * 0.63, y: height * 0.46 },
          { x: width * 0.65, y: height * 0.46 },
          { x: width * 0.63, y: height * 0.54 },
          { x: width * 0.83, y: height * 0.58 },
          { x: width * 0.85, y: height * 0.58 },
        ].map((w, i) => (
          <Rect key={`win-${i}`} x={w.x} y={w.y} width={2} height={2.5} fill="#FFD700" opacity={0.15 + (i % 4) * 0.08} rx={0.5} />
        ))}

        {/* Ground glow */}
        <Ellipse cx={width * 0.5} cy={height} rx={width * 0.6} ry={height * 0.12} fill="#162440" opacity={0.3} />
      </Svg>
    </View>
  );
}


/**
 * Scene: The First Morning — sunrise horizon with hotel building
 */
let _fmId = 0;
export function FirstMorningScene({ width, height }: SceneProps) {
  const uid = React.useMemo(() => `fm${++_fmId}`, []);
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <SvgGradient id={`${uid}Sky`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#0A1A0F" />
          <Stop offset="0.6" stopColor="#1A2A1F" />
          <Stop offset="1" stopColor="#FFB800" stopOpacity={0.15} />
        </SvgGradient>
        <SvgGradient id={`${uid}Sun`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFD700" />
          <Stop offset="1" stopColor="#FF8C00" />
        </SvgGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill={`url(#${uid}Sky)`} />
      {/* Sunrise glow on horizon */}
      <Ellipse cx={width * 0.7} cy={height * 0.82} rx={width * 0.45} ry={height * 0.25} fill="#FFB800" opacity={0.08} />
      <Ellipse cx={width * 0.7} cy={height * 0.85} rx={width * 0.3} ry={height * 0.12} fill="#FFD700" opacity={0.12} />
      {/* Sun peeking */}
      <Circle cx={width * 0.7} cy={height * 0.78} r={16} fill={`url(#${uid}Sun)`} opacity={0.7} />
      {/* Hotel silhouette */}
      <Rect x={width * 0.1} y={height * 0.4} width={width * 0.25} height={height * 0.6} fill="#050D08" opacity={0.7} rx={2} />
      <Rect x={width * 0.38} y={height * 0.55} width={width * 0.15} height={height * 0.45} fill="#050D08" opacity={0.6} rx={2} />
      {/* Windows */}
      {Array.from({ length: 4 }, (_, r) =>
        Array.from({ length: 3 }, (_, c) => (
          <Rect key={`hw-${r}-${c}`} x={width * 0.14 + c * 14} y={height * 0.46 + r * 16} width={6} height={8} fill="#FFB800" opacity={r < 2 ? 0.25 : 0.12} rx={1} />
        ))
      )}
      {/* Coffee cup silhouette in foreground */}
      <G transform={`translate(${width * 0.65}, ${height * 0.6})`} opacity={0.35}>
        <Path d="M0 10 L0 28 C0 30 2 32 6 32 L18 32 C22 32 24 30 24 28 L24 10 Z" fill="#1A2A1F" stroke="#FFB800" strokeWidth={0.6} />
        <Path d="M24 14 L28 14 C30 14 32 16 32 18 C32 20 30 22 28 22 L24 22" stroke="#FFB800" strokeWidth={0.6} fill="none" />
        <Path d="M8 8 C8 4 10 3 9 0" stroke="#FFB800" strokeWidth={0.6} strokeLinecap="round" opacity={0.5} />
        <Path d="M14 7 C14 3 16 2 15 0" stroke="#FFB800" strokeWidth={0.6} strokeLinecap="round" opacity={0.4} />
      </G>
    </Svg>
  );
}

/**
 * Scene: The Coffee Invitation — Arabic dallah and cups
 */
let _ciId = 0;
export function CoffeeInvitationScene({ width, height }: SceneProps) {
  const uid = React.useMemo(() => `ci${++_ciId}`, []);
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <SvgGradient id={`${uid}Sky`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#1A0F0A" />
          <Stop offset="1" stopColor="#2A1A10" />
        </SvgGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill={`url(#${uid}Sky)`} />
      {/* Warm ambient glow */}
      <Ellipse cx={width * 0.5} cy={height * 0.5} rx={width * 0.35} ry={height * 0.35} fill="#FFB800" opacity={0.05} />
      {/* Arabic dallah (coffee pot) */}
      <G transform={`translate(${width * 0.35}, ${height * 0.2})`}>
        {/* Spout */}
        <Path d="M-4 20 C-12 16 -18 8 -16 2" stroke="#FFD700" strokeWidth={1.2} fill="none" opacity={0.7} />
        {/* Body */}
        <Path d="M0 16 C-6 16 -10 20 -10 30 C-10 42 -4 50 8 52 L22 52 C34 50 40 42 40 30 C40 20 36 16 30 16 Z" fill="#2A1A10" stroke="#FFD700" strokeWidth={0.8} opacity={0.85} />
        {/* Neck */}
        <Rect x={10} y={4} width={10} height={14} fill="#2A1A10" stroke="#FFD700" strokeWidth={0.8} rx={2} />
        {/* Lid knob */}
        <Circle cx={15} cy={4} r={4} fill="#FFD700" opacity={0.5} />
        {/* Handle */}
        <Path d="M30 22 C38 22 42 28 42 34 C42 40 38 44 30 44" stroke="#FFD700" strokeWidth={1} fill="none" opacity={0.6} />
        {/* Decorative band */}
        <Line x1={-6} y1={30} x2={36} y2={30} stroke="#FFD700" strokeWidth={0.6} opacity={0.3} />
        <Line x1={-4} y1={34} x2={34} y2={34} stroke="#FFD700" strokeWidth={0.4} opacity={0.2} />
      </G>
      {/* Small finjan cups */}
      {[0, 1, 2].map(i => (
        <G key={`cup-${i}`} transform={`translate(${width * 0.55 + i * 22}, ${height * 0.68})`}>
          <Path d={`M0 0 L-2 16 L14 16 L12 0 Z`} fill="#2A1A10" stroke="#FFD700" strokeWidth={0.6} opacity={0.7} />
          <Ellipse cx={6} cy={0} rx={7} ry={2} fill="#3A2A18" stroke="#FFD700" strokeWidth={0.4} />
          {/* Steam */}
          <Path d={`M4 -2 C4 -6 6 -8 5 -12`} stroke="#FFD700" strokeWidth={0.4} opacity={0.25} strokeLinecap="round" />
        </G>
      ))}
      {/* Dates plate */}
      <Ellipse cx={width * 0.25} cy={height * 0.78} rx={20} ry={6} fill="#2A1A10" stroke="#FFD700" strokeWidth={0.5} opacity={0.5} />
      {[0, 1, 2].map(i => (
        <Ellipse key={`date-${i}`} cx={width * 0.22 + i * 8} cy={height * 0.76} rx={3} ry={2} fill="#4A2A10" opacity={0.6} />
      ))}
    </Svg>
  );
}

/**
 * Scene: VIP Guest Arrival — grand hotel lobby
 */
let _hlId = 0;
export function HotelLobbyScene({ width, height }: SceneProps) {
  const uid = React.useMemo(() => `hl${++_hlId}`, []);
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <SvgGradient id={`${uid}Fl`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#0A1A14" />
          <Stop offset="1" stopColor="#050F0A" />
        </SvgGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill={`url(#${uid}Fl)`} />
      {/* Grand arch */}
      <Path d={`M ${width * 0.15} ${height} L ${width * 0.15} ${height * 0.3} Q ${width * 0.5} ${-height * 0.1} ${width * 0.85} ${height * 0.3} L ${width * 0.85} ${height}`} stroke="#4ECFA0" strokeWidth={1.5} fill="none" opacity={0.2} />
      {/* Inner arch */}
      <Path d={`M ${width * 0.22} ${height} L ${width * 0.22} ${height * 0.38} Q ${width * 0.5} ${height * 0.05} ${width * 0.78} ${height * 0.38} L ${width * 0.78} ${height}`} stroke="#4ECFA0" strokeWidth={0.8} fill="none" opacity={0.12} />
      {/* Chandelier */}
      <G transform={`translate(${width * 0.5}, ${height * 0.12})`}>
        <Line x1={0} y1={-12} x2={0} y2={0} stroke="#FFD700" strokeWidth={0.6} opacity={0.4} />
        <Ellipse cx={0} cy={6} rx={16} ry={8} fill="none" stroke="#FFD700" strokeWidth={0.5} opacity={0.25} />
        <Ellipse cx={0} cy={10} rx={12} ry={5} fill="none" stroke="#FFD700" strokeWidth={0.4} opacity={0.2} />
        {/* Light drops */}
        {[-12, -6, 0, 6, 12].map(x => (
          <Circle key={`ch-${x}`} cx={x} cy={14} r={1.2} fill="#FFD700" opacity={0.35} />
        ))}
        {/* Glow */}
        <Circle cx={0} cy={8} r={24} fill="#FFD700" opacity={0.03} />
      </G>
      {/* Floor pattern — marble tile lines */}
      <G opacity={0.06}>
        {Array.from({ length: 6 }, (_, i) => (
          <Line key={`fl-${i}`} x1={width * 0.1 + i * width * 0.15} y1={height * 0.75} x2={width * 0.5} y2={height} stroke="#4ECFA0" strokeWidth={0.5} />
        ))}
      </G>
      {/* Pillars */}
      <Rect x={width * 0.18} y={height * 0.32} width={6} height={height * 0.68} fill="#0F2A1F" opacity={0.5} rx={2} />
      <Rect x={width * 0.78} y={height * 0.32} width={6} height={height * 0.68} fill="#0F2A1F" opacity={0.5} rx={2} />
      {/* Door shimmer */}
      <Rect x={width * 0.4} y={height * 0.55} width={width * 0.2} height={height * 0.45} fill="#4ECFA0" opacity={0.04} rx={4} />
    </Svg>
  );
}

/**
 * Scene: Café Connection — cozy coffee shop ambience
 */
let _caId = 0;
export function CafeScene({ width, height }: SceneProps) {
  const uid = React.useMemo(() => `ca${++_caId}`, []);
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <SvgGradient id={`${uid}Bg`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#0A1810" />
          <Stop offset="1" stopColor="#142818" />
        </SvgGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill={`url(#${uid}Bg)`} />
      {/* Warm light bokeh circles */}
      {[
        { cx: width * 0.15, cy: height * 0.2, r: 18 },
        { cx: width * 0.7, cy: height * 0.15, r: 14 },
        { cx: width * 0.9, cy: height * 0.35, r: 10 },
        { cx: width * 0.4, cy: height * 0.1, r: 8 },
        { cx: width * 0.55, cy: height * 0.32, r: 20 },
      ].map((b, i) => (
        <Circle key={`bk-${i}`} cx={b.cx} cy={b.cy} r={b.r} fill="#FFB800" opacity={0.04 + i * 0.01} />
      ))}
      {/* Table surface */}
      <Ellipse cx={width * 0.5} cy={height * 0.78} rx={width * 0.42} ry={height * 0.12} fill="#1A2A1A" opacity={0.6} stroke="#4ECFA0" strokeWidth={0.5} />
      {/* Coffee cup */}
      <G transform={`translate(${width * 0.35}, ${height * 0.52})`}>
        <Rect x={0} y={6} width={20} height={18} fill="#1A2A1A" stroke="#4ECFA0" strokeWidth={0.7} rx={3} />
        <Path d="M20 10 C26 10 28 14 28 16 C28 18 26 22 20 22" stroke="#4ECFA0" strokeWidth={0.6} fill="none" opacity={0.5} />
        <Ellipse cx={10} cy={6} rx={11} ry={3} fill="#2A3A2A" stroke="#4ECFA0" strokeWidth={0.5} />
        {/* Steam */}
        <Path d="M6 4 C6 0 8 -2 7 -6" stroke="#4ECFA0" strokeWidth={0.5} opacity={0.3} strokeLinecap="round" />
        <Path d="M12 3 C12 -1 14 -3 13 -7" stroke="#4ECFA0" strokeWidth={0.5} opacity={0.25} strokeLinecap="round" />
      </G>
      {/* Small plant */}
      <G transform={`translate(${width * 0.72}, ${height * 0.42})`}>
        <Rect x={0} y={10} width={12} height={14} fill="#1A2A1A" stroke="#4ECFA0" strokeWidth={0.5} rx={2} />
        <Path d="M6 10 L6 2" stroke="#4ECFA0" strokeWidth={0.8} />
        <Path d="M6 6 C2 2 0 -2 2 -4 C4 -2 4 2 6 4" fill="#4ECFA0" opacity={0.4} />
        <Path d="M6 4 C10 0 12 -4 10 -6 C8 -4 8 0 6 2" fill="#2EA87A" opacity={0.4} />
      </G>
    </Svg>
  );
}

/**
 * Scene: Eid Greetings — festive crescent and lanterns
 */
let _eiId = 0;
export function EidScene({ width, height }: SceneProps) {
  const uid = React.useMemo(() => `ei${++_eiId}`, []);
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <SvgGradient id={`${uid}Sky`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#1A140A" />
          <Stop offset="0.7" stopColor="#2A1E12" />
          <Stop offset="1" stopColor="#3A2A18" />
        </SvgGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill={`url(#${uid}Sky)`} />
      {/* Large crescent */}
      <G transform={`translate(${width * 0.5}, ${height * 0.22})`}>
        <Circle cx={0} cy={0} r={20} fill="#FFD700" opacity={0.8} />
        <Circle cx={6} cy={-4} r={17} fill="#1A140A" />
        <Path d="M22 -12 L23 -9 L26 -9 L24 -7 L25 -4 L22 -6 L19 -4 L20 -7 L18 -9 L21 -9 Z" fill="#FFD700" opacity={0.65} />
      </G>
      {/* Hanging lanterns */}
      {[0.2, 0.5, 0.8].map((xPct, i) => (
        <G key={`lantern-${i}`} transform={`translate(${width * xPct}, ${height * 0.08 + i * 8})`}>
          <Line x1={0} y1={-10} x2={0} y2={0} stroke="#FFD700" strokeWidth={0.5} opacity={0.3} />
          {/* Lantern body */}
          <Path d={`M-5 0 C-5 -2 -3 -3 0 -3 C3 -3 5 -2 5 0 L4 18 C4 20 2 22 0 22 C-2 22 -4 20 -4 18 Z`}
            fill="#3A2A18" stroke="#FFD700" strokeWidth={0.6} opacity={0.6} />
          {/* Lantern glow */}
          <Ellipse cx={0} cy={10} rx={8} ry={12} fill="#FFB800" opacity={0.06} />
          {/* Inner light */}
          <Circle cx={0} cy={10} r={2} fill="#FFD700" opacity={0.4} />
          {/* Decorative lines */}
          <Line x1={-3} y1={5} x2={3} y2={5} stroke="#FFD700" strokeWidth={0.3} opacity={0.3} />
          <Line x1={-3} y1={15} x2={3} y2={15} stroke="#FFD700" strokeWidth={0.3} opacity={0.3} />
        </G>
      ))}
      {/* Geometric pattern border */}
      <G opacity={0.08}>
        {Array.from({ length: Math.ceil(width / 20) }, (_, i) => (
          <Path key={`geo-e-${i}`}
            d={`M ${i * 20} ${height - 10} L ${i * 20 + 10} ${height - 20} L ${i * 20 + 20} ${height - 10}`}
            stroke="#FFD700" strokeWidth={0.5} fill="none" />
        ))}
      </G>
      {/* Stars scattered */}
      {[0.1, 0.3, 0.65, 0.85, 0.45].map((xPct, i) => (
        <Circle key={`eid-star-${i}`} cx={width * xPct} cy={height * (0.35 + i * 0.06)} r={1} fill="#FFD700" opacity={0.25} />
      ))}
    </Svg>
  );
}


/**
 * Welcome to Fasih — completion celebration scene
 * Large crescent, fireworks/sparkles, doorway motif
 */
export function WelcomeScene({ width, height }: SceneProps) {
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <SvgGradient id="welBg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#110A1C" />
          <Stop offset="0.5" stopColor="#1A1240" />
          <Stop offset="1" stopColor="#0D0828" />
        </SvgGradient>
        <SvgGradient id="welArch" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFD700" />
          <Stop offset="1" stopColor="#FFB800" stopOpacity={0.3} />
        </SvgGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill="url(#welBg)" />

      {/* Grand arch doorway */}
      <Path
        d={`M ${width * 0.25} ${height} L ${width * 0.25} ${height * 0.35} Q ${width * 0.5} ${height * 0.05} ${width * 0.75} ${height * 0.35} L ${width * 0.75} ${height}`}
        stroke="url(#welArch)" strokeWidth={2} fill="none" opacity={0.4}
      />
      {/* Inner arch */}
      <Path
        d={`M ${width * 0.3} ${height} L ${width * 0.3} ${height * 0.4} Q ${width * 0.5} ${height * 0.12} ${width * 0.7} ${height * 0.4} L ${width * 0.7} ${height}`}
        stroke="#FFD700" strokeWidth={1} fill="none" opacity={0.2}
      />
      {/* Light rays through doorway */}
      {[0.38, 0.44, 0.5, 0.56, 0.62].map((xPct, i) => (
        <Line key={`ray-${i}`}
          x1={width * xPct} y1={height * 0.3}
          x2={width * (0.35 + i * 0.08)} y2={height}
          stroke="#FFD700" strokeWidth={0.5} opacity={0.04} />
      ))}

      {/* Celebration sparkles — firework bursts */}
      {[
        { cx: width * 0.2, cy: height * 0.2, c: '#FFD700' },
        { cx: width * 0.8, cy: height * 0.18, c: '#4ECFA0' },
        { cx: width * 0.5, cy: height * 0.12, c: '#00D6FC' },
        { cx: width * 0.15, cy: height * 0.45, c: '#FFB800' },
        { cx: width * 0.85, cy: height * 0.4, c: '#4ECFA0' },
      ].map((burst, bi) => (
        <G key={`burst-${bi}`}>
          <Circle cx={burst.cx} cy={burst.cy} r={2} fill={burst.c} opacity={0.6} />
          {Array.from({ length: 6 }, (_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            const dist = 10 + (bi % 3) * 4;
            return (
              <Circle key={`sp-${bi}-${i}`}
                cx={burst.cx + Math.cos(angle) * dist}
                cy={burst.cy + Math.sin(angle) * dist}
                r={1} fill={burst.c} opacity={0.3} />
            );
          })}
        </G>
      ))}

      {/* Stars */}
      {Array.from({ length: 12 }, (_, i) => (
        <Circle key={`wstar-${i}`}
          cx={width * (0.05 + (i * 0.08) % 0.95)}
          cy={height * (0.08 + ((i * 7) % 50) / 100)}
          r={0.8 + (i % 3) * 0.4}
          fill="#FFFFFF" opacity={0.2 + (i % 4) * 0.08} />
      ))}

      {/* Geometric star pattern at bottom */}
      <G opacity={0.06} transform={`translate(${width * 0.5}, ${height * 0.88})`}>
        <Path d="M0 -16 L4 -4 L16 -4 L6 4 L10 16 L0 8 L-10 16 L-6 4 L-16 -4 L-4 -4 Z" stroke="#FFD700" strokeWidth={0.8} fill="none" />
      </G>
    </Svg>
  );
}
