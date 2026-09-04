import React from 'react';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  /**
   * Required rather than defaulted. A hardcoded fallback here was invisible —
   * every current call site passes an explicit C.TOKEN color, so a stray
   * off-palette default sat unused until the next call site forgot to pass
   * one. Same reasoning as accessibilityLabel in SwitchButton.tsx.
   */
  color: string;
}

/* ═══════════════════════════════════════════
   ROLE BADGES — Step 3 bento grid
   ═══════════════════════════════════════════ */

/** Hotel — building with a key */
export function HotelIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Background glow */}
      <Circle cx={12} cy={12} r={10} fill={color} opacity={0.11} />
      {/* Building */}
      <Rect x={6} y={5} width={10} height={15} rx={1} stroke={color} strokeWidth={1.5} fill="none" />
      {/* Windows */}
      <Rect x={8} y={8} width={2} height={2} rx={0.3} fill={color} opacity={0.4} />
      <Rect x={12} y={8} width={2} height={2} rx={0.3} fill={color} opacity={0.4} />
      <Rect x={8} y={12} width={2} height={2} rx={0.3} fill={color} opacity={0.4} />
      {/* Key motif beside building */}
      <Circle cx={18} cy={10} r={2} stroke={color} strokeWidth={1.2} opacity={0.6} />
      <Line x1={18} y1={12} x2={18} y2={18} stroke={color} strokeWidth={1.2} opacity={0.6} strokeLinecap="round" />
    </Svg>
  );
}

/** Retail — shopping bag with tag */
export function RetailIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Background glow */}
      <Circle cx={12} cy={12} r={10} fill={color} opacity={0.11} />
      {/* Bag body */}
      <Path d="M7 9 L7 18 C7 19.1 7.9 20 9 20 L15 20 C16.1 20 17 19.1 17 18 L17 9 Z" stroke={color} strokeWidth={1.5} fill="none" strokeLinejoin="round" />
      {/* Handles */}
      <Path d="M9 9 L9 6 C9 4.9 9.9 4 11 4 L13 4 C14.1 4 15 4.9 15 6 L15 9" stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <Path d="M10 13 H14" stroke={color} strokeWidth={1} opacity={0.4} strokeLinecap="round" />
    </Svg>
  );
}

/** Restaurant — plate with fork and knife */
export function RestaurantIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Background glow */}
      <Circle cx={12} cy={12} r={10} fill={color} opacity={0.11} />
      {/* Plate */}
      <Circle cx={12} cy={12} r={7} stroke={color} strokeWidth={1.5} fill="none" />
      <Circle cx={12} cy={12} r={4.5} stroke={color} strokeWidth={0.8} fill="none" opacity={0.25} />
      {/* Cutlery accents */}
      <Line x1={6} y1={12} x2={8} y2={12} stroke={color} strokeWidth={1} opacity={0.5} strokeLinecap="round" />
      <Line x1={16} y1={12} x2={18} y2={12} stroke={color} strokeWidth={1} opacity={0.5} strokeLinecap="round" />
    </Svg>
  );
}

/** Office — briefcase with a star badge */
export function OfficeIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Background glow */}
      <Circle cx={12} cy={12} r={10} fill={color} opacity={0.11} />
      {/* Case body */}
      <Rect x={5} y={9} width={14} height={10} rx={2} stroke={color} strokeWidth={1.5} fill="none" />
      {/* Handle */}
      <Path d="M9 9 V7 C9 6 10 5 11 5 H13 C14 5 15 6 15 7 V9" stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <Line x1={5} y1={14} x2={19} y2={14} stroke={color} strokeWidth={1} opacity={0.2} />
    </Svg>
  );
}

/** Healthcare — heart with pulse line */
export function HealthcareIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Background glow */}
      <Circle cx={12} cy={12} r={10} fill={color} opacity={0.11} />
      {/* Heart outline */}
      <Path d="M12 18 C12 18 6 13 6 9 C6 7 7.5 5.5 9.5 5.5 C10.5 5.5 11.5 6 12 7 C12.5 6 13.5 5.5 14.5 5.5 C16.5 5.5 18 7 18 9 C18 13 12 18 12 18 Z" stroke={color} strokeWidth={1.5} fill="none" strokeLinejoin="round" />
      {/* Pulse pulse line stub */}
      <Path d="M9 10 L10.5 8.5 L12 11.5 L13.5 9 L15 10.5" stroke={color} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
    </Svg>
  );
}

/** Driver — steering wheel */
export function DriverIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Background glow */}
      <Circle cx={12} cy={12} r={10} fill={color} opacity={0.11} />
      {/* Outer wheel */}
      <Circle cx={12} cy={12} r={8} stroke={color} strokeWidth={1.5} fill="none" />
      {/* Center hub */}
      <Circle cx={12} cy={12} r={1.5} fill={color} opacity={0.4} />
      {/* Spokes simplified */}
      <Line x1={12} y1={10.5} x2={12} y2={6} stroke={color} strokeWidth={1.2} opacity={0.5} />
      <Line x1={10.5} y1={13} x2={7} y2={16} stroke={color} strokeWidth={1.2} opacity={0.5} />
      <Line x1={13.5} y1={13} x2={17} y2={16} stroke={color} strokeWidth={1.2} opacity={0.5} />
    </Svg>
  );
}

/** Security — shield with checkmark */
export function SecurityIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Background glow */}
      <Circle cx={12} cy={12} r={10} fill={color} opacity={0.11} />
      {/* Shield */}
      <Path d="M12 5 L18 8 L18 12 C18 15.5 15.5 18.5 12 19.5 C8.5 18.5 6 15.5 6 12 L6 8 Z" stroke={color} strokeWidth={1.5} fill="none" strokeLinejoin="round" />
      {/* Checkmark */}
      <Path d="M9.5 12 L11.5 14 L14.5 10" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
    </Svg>
  );
}


/* ═══════════════════════════════════════════
   GOAL ICONS — Step 4
   ═══════════════════════════════════════════ */

/** Professional — ascending stairs */
export function ProfessionalIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Background glow */}
      <Circle cx={12} cy={12} r={10} fill={color} opacity={0.11} />
      {/* Ascending stairs */}
      <Path d="M5 18 H7 V15 H11 V12 H15 V8 H19" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={19} cy={7} r={1.5} fill={color} />
    </Svg>
  );
}

/** Friends — two connected people */
export function FriendsIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Background glow */}
      <Circle cx={12} cy={12} r={10} fill={color} opacity={0.11} />
      {/* Person 1 head */}
      <Circle cx={8} cy={8} r={3} stroke={color} strokeWidth={1.5} fill="none" />
      {/* Person 1 body */}
      <Path d="M4 18 C4 16 6 14 8 14" stroke={color} strokeWidth={1.5} strokeLinecap="round" fill="none" />
      {/* Person 2 head */}
      <Circle cx={16} cy={8} r={3} stroke={color} strokeWidth={1.5} fill="none" />
      {/* Person 2 body */}
      <Path d="M20 18 C20 16 18 14 16 14" stroke={color} strokeWidth={1.5} strokeLinecap="round" fill="none" />
      {/* Connection heart */}
      <Path d="M12 13 C12 13 11 12 11 11.5 C11 11 11.5 10.5 12 10.5 C12.5 10.5 13 11 13 11.5 C13 12 12 13 12 13 Z" fill={color} opacity={0.5} />
    </Svg>
  );
}

/** Culture — mosque dome silhouette */
export function CultureIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Background glow */}
      <Circle cx={12} cy={12} r={10} fill={color} opacity={0.11} />
      {/* Dome */}
      <Path d="M7 14 C7 10 9.5 7 12 6 C14.5 7 17 10 17 14" stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      {/* Base */}
      <Line x1={5} y1={19} x2={19} y2={19} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M11 19 V16 C11 15.5 11.5 15 12 15 C12.5 15 13 15.5 13 16 V19" stroke={color} strokeWidth={1.2} opacity={0.5} />
    </Svg>
  );
}

/** Daily Life — compass/navigation */
export function DailyLifeIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Background glow */}
      <Circle cx={12} cy={12} r={10} fill={color} opacity={0.11} />
      {/* Outer ring */}
      <Circle cx={12} cy={12} r={8} stroke={color} strokeWidth={1.5} fill="none" />
      {/* Compass needle */}
      <Path d="M12 7 L14 12 L12 17 L10 12 Z" stroke={color} strokeWidth={1} fill="none" opacity={0.4} />
      <Path d="M12 7 L14 12 L12 12 Z" fill={color} opacity={0.6} />
    </Svg>
  );
}

/** Career — trophy with rising arrow */
export function CareerIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Background glow */}
      <Circle cx={12} cy={12} r={10} fill={color} opacity={0.11} />
      {/* Trophy cup */}
      <Path d="M9 6 L15 6 L14 12 C14 14 13 15 12 15 C11 15 10 14 10 12 Z" stroke={color} strokeWidth={1.5} fill="none" strokeLinejoin="round" />
      {/* Handles */}
      <Path d="M9 8 H7 Q6 8 6 9 Q6 11 7 11 H10" stroke={color} strokeWidth={1} fill="none" opacity={0.4} />
      <Path d="M15 8 H17 Q18 8 18 9 Q18 11 17 11 H14" stroke={color} strokeWidth={1} fill="none" opacity={0.4} />
      {/* Base */}
      <Line x1={12} y1={15} x2={12} y2={18} stroke={color} strokeWidth={1.5} />
      <Line x1={9} y1={18} x2={15} y2={18} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}
