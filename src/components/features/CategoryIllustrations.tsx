import React from 'react';
import Svg, { 
  Path, Circle, Ellipse, Rect, G, Defs, 
  LinearGradient as SvgLinearGradient, 
  RadialGradient, Stop, Line, Text as SvgText 
} from 'react-native-svg';

interface IllustrationProps {
  size?: number;
}

/**
 * Greetings — Two hands waving with speech bubble and sparkles
 */
export function GreetingsIllustration({ size = 100 }: IllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        <SvgLinearGradient id="greet_hand" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#FFD4A8" />
          <Stop offset="1" stopColor="#F5B87A" />
        </SvgLinearGradient>
        <SvgLinearGradient id="greet_bubble" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor="#F0F0FF" />
        </SvgLinearGradient>
        <RadialGradient id="greet_glow" cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0" stopColor="#00D6FC" stopOpacity={0.15} />
          <Stop offset="1" stopColor="#00D6FC" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/* Ambient glow */}
      <Circle cx={50} cy={50} r={40} fill="url(#greet_glow)" />

      {/* Speech bubble */}
      <G transform="translate(28, 12)">
        <Path
          d="M0 18 C0 8 8 0 18 0 L30 0 C40 0 48 8 48 18 L48 26 C48 36 40 44 30 44 L20 44 L12 52 L14 44 L18 44 C8 44 0 36 0 26 Z"
          fill="url(#greet_bubble)"
          opacity={0.95}
        />
        {/* Arabic text marks inside bubble */}
        <SvgText x={14} y={22} fontSize={8} fill="#00D6FC" fontWeight="bold" opacity={0.7}>سلام</SvgText>
        <SvgText x={10} y={34} fontSize={7} fill="#00D6FC" opacity={0.4}>عليكم</SvgText>
      </G>

      {/* Right waving hand */}
      <G transform="translate(58, 50)">
        {/* Wrist */}
        <Rect x={4} y={18} width={16} height={14} rx={5} fill="url(#greet_hand)" />
        {/* Palm */}
        <Ellipse cx={12} cy={14} rx={12} ry={14} fill="url(#greet_hand)" />
        {/* Fingers */}
        <Path d="M4 6 Q3 -2 6 -4 Q8 -2 7 6" fill="#FFD4A8" />
        <Path d="M8 3 Q8 -5 11 -7 Q14 -5 13 3" fill="#FFD4A8" />
        <Path d="M14 3 Q14 -5 17 -7 Q20 -5 19 3" fill="#FFD4A8" />
        <Path d="M19 6 Q20 -1 23 -2 Q25 1 23 8" fill="#FFD4A8" />
        {/* Thumb */}
        <Path d="M2 14 Q-3 10 -2 7 Q0 5 3 8 Q4 10 3 14" fill="#F5C490" />
      </G>

      {/* Motion lines for waving */}
      <Line x1={82} y1={42} x2={88} y2={38} stroke="#00D6FC" strokeWidth={2} strokeLinecap="round" opacity={0.3} />
      <Line x1={84} y1={50} x2={92} y2={50} stroke="#00D6FC" strokeWidth={2} strokeLinecap="round" opacity={0.2} />
      <Line x1={82} y1={58} x2={88} y2={62} stroke="#00D6FC" strokeWidth={1.5} strokeLinecap="round" opacity={0.2} />

      {/* Sparkles */}
      <Circle cx={22} cy={60} r={2.5} fill="#00D6FC" opacity={0.2} />
      <Circle cx={18} cy={72} r={1.5} fill="#5BE5FF" opacity={0.3} />
      <Path d="M85 22 L86 18 L87 22 L91 23 L87 24 L86 28 L85 24 L81 23 Z" fill="#FFB800" opacity={0.4} />
      <Path d="M15 42 L16 39 L17 42 L20 43 L17 44 L16 47 L15 44 L12 43 Z" fill="#00D6FC" opacity={0.25} />
    </Svg>
  );
}

/**
 * Gratitude — Heart with Arabic "thanks" and radiating warmth
 */
export function GratitudeIllustration({ size = 100 }: IllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        <SvgLinearGradient id="grat_heart" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#FF6B8A" />
          <Stop offset="1" stopColor="#E84D6D" />
        </SvgLinearGradient>
        <RadialGradient id="grat_glow" cx="50%" cy="45%" rx="45%" ry="45%">
          <Stop offset="0" stopColor="#FF6B8A" stopOpacity={0.2} />
          <Stop offset="1" stopColor="#FF6B8A" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/* Glow */}
      <Circle cx={50} cy={46} r={38} fill="url(#grat_glow)" />

      {/* Large heart */}
      <G transform="translate(50, 42) scale(1.2)">
        <Path
          d="M0 10 C0 -4 -18 -12 -18 -2 C-18 6 0 22 0 22 C0 22 18 6 18 -2 C18 -12 0 -4 0 10 Z"
          fill="url(#grat_heart)"
        />
        {/* Inner highlight */}
        <Path
          d="M-4 2 C-4 -6 -14 -10 -14 -4 C-14 0 -4 8 -4 8"
          fill="#FF8BA5"
          opacity={0.4}
        />
      </G>

      {/* Thank you text ribbon below */}
      <G transform="translate(22, 72)">
        <Rect x={0} y={0} width={56} height={18} rx={9} fill="rgba(232,77,109,0.12)" />
        <SvgText x={28} y={13} fontSize={9} fill="#E84D6D" fontWeight="bold" textAnchor="middle" opacity={0.8}>مشكور</SvgText>
      </G>

      {/* Floating sparkles around heart */}
      <Path d="M22 30 L23 26 L24 30 L28 31 L24 32 L23 36 L22 32 L18 31 Z" fill="#FFB800" opacity={0.4} />
      <Path d="M72 28 L73 25 L74 28 L77 29 L74 30 L73 33 L72 30 L69 29 Z" fill="#FF6B8A" opacity={0.3} />
      <Circle cx={80} cy={50} r={2} fill="#FF9BB4" opacity={0.3} />
      <Circle cx={16} cy={50} r={1.5} fill="#FFB800" opacity={0.3} />

      {/* Motion hearts floating up */}
      <Path d="M30 18 C30 15 27 13 27 15 C27 17 30 20 30 20 C30 20 33 17 33 15 C33 13 30 15 30 18" fill="#FF9BB4" opacity={0.3} />
      <Path d="M74 16 C74 14 72 13 72 14 C72 15 74 17 74 17 C74 17 76 15 76 14 C76 13 74 14 74 16" fill="#FF6B8A" opacity={0.2} />
    </Svg>
  );
}

/**
 * Hospitality — Arabic coffee pot (dallah) with cup and steam
 */
export function HospitalityIllustration({ size = 100 }: IllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        <SvgLinearGradient id="hosp_pot" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#D4A45C" />
          <Stop offset="1" stopColor="#B8862D" />
        </SvgLinearGradient>
        <SvgLinearGradient id="hosp_cup" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#F5E6CC" />
          <Stop offset="1" stopColor="#E8D4B0" />
        </SvgLinearGradient>
        <SvgLinearGradient id="hosp_coffee" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0" stopColor="#8B6914" />
          <Stop offset="1" stopColor="#6B4E10" />
        </SvgLinearGradient>
      </Defs>

      {/* Shadow under pot */}
      <Ellipse cx={42} cy={88} rx={22} ry={4} fill="rgba(0,0,0,0.08)" />

      {/* Dallah (Arabic coffee pot) body */}
      <G transform="translate(20, 25)">
        {/* Main body */}
        <Path
          d="M10 60 Q10 64 14 64 L30 64 Q34 64 34 60 L36 30 C36 24 30 18 22 18 C14 18 8 24 8 30 Z"
          fill="url(#hosp_pot)"
        />
        {/* Neck */}
        <Path d="M16 18 Q16 8 22 4 Q28 8 28 18" fill="url(#hosp_pot)" />
        {/* Spout */}
        <Path d="M34 32 Q42 28 46 22 Q48 20 46 18" stroke="#B8862D" strokeWidth={3} strokeLinecap="round" fill="none" />
        {/* Handle */}
        <Path d="M12 26 Q4 30 4 42 Q4 54 10 58" stroke="#B8862D" strokeWidth={3.5} strokeLinecap="round" fill="none" />
        {/* Lid */}
        <Ellipse cx={22} cy={4} rx={4} ry={2} fill="#D4A45C" />
        <Circle cx={22} cy={2} r={2} fill="#E8B84D" />
        {/* Decorative band */}
        <Rect x={10} y={40} width={24} height={3} rx={1.5} fill="#E8B84D" opacity={0.6} />
        <Rect x={12} y={46} width={20} height={2} rx={1} fill="#E8B84D" opacity={0.3} />
      </G>

      {/* Small cup */}
      <G transform="translate(62, 60)">
        <Path d="M0 0 L2 20 Q2 24 8 24 L16 24 Q22 24 22 20 L24 0 Z" fill="url(#hosp_cup)" />
        <Ellipse cx={12} cy={4} rx={12} ry={4} fill="url(#hosp_coffee)" />
        {/* Cup rim highlight */}
        <Ellipse cx={12} cy={0} rx={12} ry={3} fill="none" stroke="#D4A45C" strokeWidth={1} />
        {/* Handle */}
        <Path d="M24 6 Q30 8 30 14 Q30 20 24 20" stroke="#E8D4B0" strokeWidth={2.5} strokeLinecap="round" fill="none" />
      </G>

      {/* Steam */}
      <Path d="M68 56 Q65 48 70 42 Q73 36 68 30" stroke="#5BE5FF" strokeWidth={1.5} strokeLinecap="round" fill="none" opacity={0.3} />
      <Path d="M74 54 Q71 46 76 40 Q79 34 74 28" stroke="#5BE5FF" strokeWidth={1.5} strokeLinecap="round" fill="none" opacity={0.2} />

      {/* Dates on plate */}
      <Ellipse cx={55} cy={90} rx={10} ry={3} fill="#E8D4B0" opacity={0.5} />
      <Ellipse cx={52} cy={88} rx={3} ry={2} fill="#8B5E2B" opacity={0.5} />
      <Ellipse cx={58} cy={87} rx={3} ry={2} fill="#A06B2E" opacity={0.4} />
    </Svg>
  );
}

/**
 * Workplace — Briefcase with Arabic calligraphy and meeting elements
 */
export function WorkplaceIllustration({ size = 100 }: IllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        <SvgLinearGradient id="work_brief" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#02B986" />
          <Stop offset="1" stopColor="#016B4E" />
        </SvgLinearGradient>
        <SvgLinearGradient id="work_doc" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor="#F0FFF8" />
        </SvgLinearGradient>
      </Defs>

      {/* Shadow */}
      <Ellipse cx={50} cy={88} rx={30} ry={5} fill="rgba(2,185,134,0.08)" />

      {/* Briefcase */}
      <G transform="translate(18, 34)">
        {/* Main body */}
        <Rect x={0} y={10} width={64} height={42} rx={8} fill="url(#work_brief)" />
        {/* Handle */}
        <Path d="M22 10 L22 4 Q22 0 26 0 L38 0 Q42 0 42 4 L42 10" stroke="#5FFFB8" strokeWidth={3} fill="none" strokeLinecap="round" />
        {/* Clasp */}
        <Rect x={26} y={26} width={12} height={8} rx={3} fill="#5FFFB8" />
        <Circle cx={32} cy={30} r={2} fill="#016B4E" />
        {/* Decorative lines */}
        <Line x1={10} y1={38} x2={54} y2={38} stroke="#5FFFB8" strokeWidth={1} opacity={0.3} />
      </G>

      {/* Floating document */}
      <G transform="translate(64, 18) rotate(12)">
        <Rect x={0} y={0} width={24} height={30} rx={3} fill="url(#work_doc)" />
        {/* Text lines */}
        <Line x1={4} y1={8} x2={20} y2={8} stroke="#02B986" strokeWidth={1.5} opacity={0.2} />
        <Line x1={4} y1={13} x2={16} y2={13} stroke="#02B986" strokeWidth={1.5} opacity={0.15} />
        <Line x1={4} y1={18} x2={18} y2={18} stroke="#02B986" strokeWidth={1.5} opacity={0.1} />
        {/* Check mark */}
        <Path d="M14 22 L17 25 L22 18" stroke="#22C993" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </G>

      {/* Clock icon */}
      <G transform="translate(8, 18)">
        <Circle cx={10} cy={10} r={10} fill="rgba(255,184,0,0.15)" />
        <Circle cx={10} cy={10} r={8} fill="none" stroke="#FFB800" strokeWidth={1.5} />
        <Line x1={10} y1={5} x2={10} y2={10} stroke="#FFB800" strokeWidth={1.5} strokeLinecap="round" />
        <Line x1={10} y1={10} x2={14} y2={12} stroke="#FFB800" strokeWidth={1.5} strokeLinecap="round" />
      </G>

      {/* Sparkle */}
      <Path d="M88 60 L89 56 L90 60 L94 61 L90 62 L89 66 L88 62 L84 61 Z" fill="#FFB800" opacity={0.35} />
    </Svg>
  );
}

/**
 * Social — People together with chat bubbles
 */
export function SocialIllustration({ size = 100 }: IllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        <SvgLinearGradient id="soc_person1" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#E86735" />
          <Stop offset="1" stopColor="#FF8C42" />
        </SvgLinearGradient>
        <SvgLinearGradient id="soc_person2" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#22C993" />
          <Stop offset="1" stopColor="#34D9A5" />
        </SvgLinearGradient>
      </Defs>

      {/* Person 1 (left) */}
      <G transform="translate(22, 42)">
        <Circle cx={10} cy={0} r={10} fill="url(#soc_person1)" />
        <Path d="M-4 20 Q-4 12 10 12 Q24 12 24 20 L24 36 Q24 40 20 40 L0 40 Q-4 40 -4 36 Z" fill="url(#soc_person1)" />
      </G>

      {/* Person 2 (right) */}
      <G transform="translate(56, 42)">
        <Circle cx={10} cy={0} r={10} fill="url(#soc_person2)" />
        <Path d="M-4 20 Q-4 12 10 12 Q24 12 24 20 L24 36 Q24 40 20 40 L0 40 Q-4 40 -4 36 Z" fill="url(#soc_person2)" />
      </G>

      {/* Chat bubble left */}
      <G transform="translate(14, 14)">
        <Path
          d="M0 12 C0 5 5 0 12 0 L28 0 C35 0 40 5 40 12 L40 16 C40 23 35 28 28 28 L14 28 L8 34 L10 28 C4 28 0 23 0 16 Z"
          fill="rgba(232,103,53,0.15)"
        />
        <SvgText x={14} y={18} fontSize={8} fill="#E86735" fontWeight="bold" opacity={0.6}>هلا!</SvgText>
      </G>

      {/* Chat bubble right */}
      <G transform="translate(56, 8)">
        <Path
          d="M0 10 C0 4 4 0 10 0 L28 0 C34 0 38 4 38 10 L38 14 C38 20 34 24 28 24 L14 24 L8 29 L10 24 C4 24 0 20 0 14 Z"
          fill="rgba(34,201,147,0.15)"
        />
        <SvgText x={10} y={16} fontSize={8} fill="#22C993" fontWeight="bold" opacity={0.6}>أهلاً</SvgText>
      </G>

      {/* Connection sparkles */}
      <Circle cx={50} cy={58} r={3} fill="#FFB800" opacity={0.25} />
      <Path d="M48 54 L49 51 L50 54 L53 55 L50 56 L49 59 L48 56 L45 55 Z" fill="#FFB800" opacity={0.3} />
    </Svg>
  );
}

/**
 * Everyday — Shopping bag + phone with daily items
 */
export function EverydayIllustration({ size = 100 }: IllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        <SvgLinearGradient id="every_bag" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#22C993" />
          <Stop offset="1" stopColor="#1AB387" />
        </SvgLinearGradient>
        <SvgLinearGradient id="every_phone" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#0A2E1A" />
          <Stop offset="1" stopColor="#051A0E" />
        </SvgLinearGradient>
      </Defs>

      {/* Shopping bag */}
      <G transform="translate(14, 28)">
        <Path d="M4 20 L0 62 Q0 66 4 66 L40 66 Q44 66 44 62 L40 20 Z" fill="url(#every_bag)" />
        {/* Handles */}
        <Path d="M12 20 Q12 8 22 8 Q32 8 32 20" stroke="#5FFFB8" strokeWidth={3} fill="none" strokeLinecap="round" />
        {/* Decorative */}
        <Rect x={14} y={32} width={16} height={2} rx={1} fill="#5FFFB8" opacity={0.4} />
        <Rect x={16} y={38} width={12} height={2} rx={1} fill="#5FFFB8" opacity={0.3} />
        {/* Arabic text on bag */}
        <SvgText x={22} y={52} fontSize={9} fill="#FFFFFF" fontWeight="bold" textAnchor="middle" opacity={0.6}>يلّا</SvgText>
      </G>

      {/* Phone */}
      <G transform="translate(60, 20)">
        <Rect x={0} y={0} width={26} height={48} rx={5} fill="url(#every_phone)" />
        {/* Screen */}
        <Rect x={2} y={6} width={22} height={36} rx={2} fill="#F0FFF8" />
        {/* Screen content - location pin */}
        <Circle cx={13} cy={18} r={4} fill="#02B986" opacity={0.2} />
        <Path d="M13 14 L13 22" stroke="#02B986" strokeWidth={1} opacity={0.3} />
        <Circle cx={13} cy={14} r={2} fill="#02B986" opacity={0.4} />
        {/* Text lines */}
        <Line x1={6} y1={28} x2={20} y2={28} stroke="#02B986" strokeWidth={1} opacity={0.15} />
        <Line x1={6} y1={32} x2={16} y2={32} stroke="#02B986" strokeWidth={1} opacity={0.1} />
        {/* Top notch */}
        <Rect x={8} y={2} width={10} height={2} rx={1} fill="#016B4E" opacity={0.5} />
      </G>

      {/* Keys */}
      <G transform="translate(68, 72)">
        <Circle cx={8} cy={4} r={6} fill="none" stroke="#FFB800" strokeWidth={2} opacity={0.4} />
        <Line x1={14} y1={4} x2={22} y2={12} stroke="#FFB800" strokeWidth={2} strokeLinecap="round" opacity={0.4} />
        <Line x1={18} y1={8} x2={20} y2={6} stroke="#FFB800" strokeWidth={2} strokeLinecap="round" opacity={0.3} />
      </G>

      {/* Sparkles */}
      <Circle cx={52} cy={14} r={2} fill="#22C993" opacity={0.3} />
      <Path d="M90 40 L91 37 L92 40 L95 41 L92 42 L91 45 L90 42 L87 41 Z" fill="#FFB800" opacity={0.3} />
    </Svg>
  );
}

/**
 * Food & Drink — Coffee cup, dates, and karak chai
 */
export function FoodDrinkIllustration({ size = 100 }: IllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        <SvgLinearGradient id="food_cup" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#FF8C42" />
          <Stop offset="1" stopColor="#E67635" />
        </SvgLinearGradient>
        <SvgLinearGradient id="food_tea" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0" stopColor="#D4700A" />
          <Stop offset="1" stopColor="#B05C0A" />
        </SvgLinearGradient>
        <SvgLinearGradient id="food_plate" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#F5E8D0" />
          <Stop offset="1" stopColor="#E8D4B0" />
        </SvgLinearGradient>
      </Defs>

      {/* Plate with dates */}
      <G transform="translate(8, 55)">
        <Ellipse cx={28} cy={18} rx={28} ry={8} fill="url(#food_plate)" />
        <Ellipse cx={28} cy={14} rx={26} ry={7} fill="#FAF0E0" />
        {/* Dates */}
        <Ellipse cx={18} cy={12} rx={5} ry={3.5} fill="#8B5E2B" />
        <Ellipse cx={28} cy={10} rx={5} ry={3.5} fill="#A06B2E" />
        <Ellipse cx={38} cy={12} rx={5} ry={3.5} fill="#8B5E2B" />
        {/* Highlight on dates */}
        <Ellipse cx={17} cy={11} rx={2} ry={1} fill="#A07840" opacity={0.6} />
      </G>

      {/* Karak chai cup */}
      <G transform="translate(52, 22)">
        {/* Glass shape */}
        <Path d="M2 0 L0 40 Q0 46 6 46 L30 46 Q36 46 36 40 L34 0 Z" fill="url(#food_cup)" opacity={0.9} />
        {/* Tea liquid */}
        <Path d="M4 8 L2 40 Q2 44 6 44 L30 44 Q34 44 34 40 L32 8 Z" fill="url(#food_tea)" opacity={0.7} />
        {/* Glass highlight */}
        <Path d="M6 4 L5 36 Q5 38 6 38 L10 38 L12 4 Z" fill="white" opacity={0.15} />
        {/* Rim */}
        <Ellipse cx={18} cy={0} rx={16} ry={3} fill="#FF8C42" />
        <Ellipse cx={18} cy={0} rx={14} ry={2.5} fill="url(#food_tea)" opacity={0.5} />
        {/* Handle */}
        <Path d="M36 12 Q44 14 44 24 Q44 34 36 36" stroke="#FF8C42" strokeWidth={3} strokeLinecap="round" fill="none" />
      </G>

      {/* Steam */}
      <Path d="M62 18 Q58 10 64 4" stroke="#5BE5FF" strokeWidth={1.5} strokeLinecap="round" fill="none" opacity={0.25} />
      <Path d="M70 16 Q66 8 72 2" stroke="#5BE5FF" strokeWidth={1.5} strokeLinecap="round" fill="none" opacity={0.2} />
      <Path d="M78 20 Q75 14 79 8" stroke="#5BE5FF" strokeWidth={1} strokeLinecap="round" fill="none" opacity={0.15} />

      {/* Small Arabic coffee cup */}
      <G transform="translate(10, 32)">
        <Path d="M0 0 L2 16 Q2 20 6 20 L14 20 Q18 20 18 16 L20 0 Z" fill="#F5E0C0" />
        <Ellipse cx={10} cy={2} rx={10} ry={3} fill="#8B6914" opacity={0.5} />
        <Rect x={2} y={6} width={16} height={1.5} rx={0.75} fill="#D4A45C" opacity={0.3} />
      </G>

      {/* Sparkle */}
      <Path d="M46 12 L47 8 L48 12 L52 13 L48 14 L47 18 L46 14 L42 13 Z" fill="#FFB800" opacity={0.35} />
    </Svg>
  );
}

/**
 * Family — Two adults and a child silhouette with home & warmth
 */
export function FamilyIllustration({ size = 100 }: IllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        <SvgLinearGradient id="fam_adult1" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#4A7FE0" />
          <Stop offset="1" stopColor="#2E5FC0" />
        </SvgLinearGradient>
        <SvgLinearGradient id="fam_adult2" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#22C993" />
          <Stop offset="1" stopColor="#1AB387" />
        </SvgLinearGradient>
        <SvgLinearGradient id="fam_child" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#FFB800" />
          <Stop offset="1" stopColor="#E8A000" />
        </SvgLinearGradient>
        <RadialGradient id="fam_glow" cx="50%" cy="60%" rx="40%" ry="35%">
          <Stop offset="0" stopColor="#4A7FE0" stopOpacity={0.1} />
          <Stop offset="1" stopColor="#4A7FE0" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/* Warm glow behind */}
      <Circle cx={50} cy={58} r={38} fill="url(#fam_glow)" />

      {/* House silhouette behind */}
      <G transform="translate(25, 8)" opacity={0.08}>
        <Path d="M25 0 L0 22 L4 22 L4 44 L46 44 L46 22 L50 22 Z" fill="#4A7FE0" />
      </G>

      {/* Adult 1 (left - taller) */}
      <G transform="translate(18, 36)">
        <Circle cx={14} cy={0} r={10} fill="url(#fam_adult1)" />
        <Path d="M0 18 Q0 12 14 12 Q28 12 28 18 L28 44 Q28 48 24 48 L4 48 Q0 48 0 44 Z" fill="url(#fam_adult1)" />
        {/* Arm reaching */}
        <Path d="M26 22 Q36 24 38 30" stroke="#4A7FE0" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.6} />
      </G>

      {/* Adult 2 (right - slightly shorter) */}
      <G transform="translate(56, 40)">
        <Circle cx={14} cy={0} r={9} fill="url(#fam_adult2)" />
        <Path d="M2 16 Q2 10 14 10 Q26 10 26 16 L26 40 Q26 44 22 44 L6 44 Q2 44 2 40 Z" fill="url(#fam_adult2)" />
        {/* Arm reaching */}
        <Path d="M2 20 Q-8 22 -10 28" stroke="#22C993" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.6} />
      </G>

      {/* Child (center) */}
      <G transform="translate(40, 54)">
        <Circle cx={8} cy={0} r={7} fill="url(#fam_child)" />
        <Path d="M0 12 Q0 8 8 8 Q16 8 16 12 L16 28 Q16 32 13 32 L3 32 Q0 32 0 28 Z" fill="url(#fam_child)" />
      </G>

      {/* Heart above */}
      <G transform="translate(46, 18)">
        <Path d="M4 3 C4 0 0 -2 0 1 C0 3 4 7 4 7 C4 7 8 3 8 1 C8 -2 4 0 4 3" fill="#FF6B8A" opacity={0.4} />
      </G>

      {/* Sparkles */}
      <Circle cx={14} cy={28} r={1.5} fill="#FFB800" opacity={0.3} />
      <Circle cx={88} cy={44} r={2} fill="#5BE5FF" opacity={0.25} />
      <Path d="M82 30 L83 27 L84 30 L87 31 L84 32 L83 35 L82 32 L79 31 Z" fill="#22C993" opacity={0.25} />
    </Svg>
  );
}

// Map category names to their illustration components
export const CATEGORY_ILLUSTRATIONS: Record<string, React.FC<IllustrationProps>> = {
  'Greetings': GreetingsIllustration,
  'Gratitude': GratitudeIllustration,
  'Hospitality': HospitalityIllustration,
  'Workplace': WorkplaceIllustration,
  'Social': SocialIllustration,
  'Everyday': EverydayIllustration,
  'Food & Drink': FoodDrinkIllustration,
  'Family': FamilyIllustration,
};
