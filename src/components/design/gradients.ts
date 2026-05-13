// ─── Gradient stop arrays for expo-linear-gradient ───────────────────────────
// Green/Cyan design language: Primary #00FF95, Secondary #02B986, Tertiary #00D6FC
// Usage: <LinearGradient colors={GOLD_STOPS} start={ANGLE_135.start} end={ANGLE_135.end} />

export type ThemeGradients = {
  GOLD_STOPS: readonly [string, string, string];
  JADE_STOPS: readonly [string, string, string];
  SURFACE_STOPS: readonly [string, string];
  BG_STOPS: readonly [string, string, string];
  AMBIENT_GOLD_STOPS: readonly [string, string, string];
  AMBIENT_JADE_STOPS: readonly [string, string, string];
  AMBIENT_VIOLET_STOPS: readonly [string, string, string];
  SCENARIO_GOLD_STOPS: readonly [string, string];
  SCENARIO_JADE_STOPS: readonly [string, string];
  SCENARIO_VIOLET_STOPS: readonly [string, string];
  MASCOT_STOPS: readonly [string, string, string];
  // New design system gradients
  PRIMARY_STOPS: readonly [string, string, string];
  HEADER_STOPS: readonly [string, string];
  ONBOARDING_STOPS: readonly [string, string, string];
  AVATAR_STOPS: readonly [string, string];
};

export const darkGradients: ThemeGradients = {
  GOLD_STOPS: ['#02B986', '#019472', '#016B4E'],
  JADE_STOPS: ['#22C993', '#34D9A5', '#5EE6BC'],
  SURFACE_STOPS: ['rgba(0,255,149,0.06)', 'rgba(0,255,149,0.02)'],
  BG_STOPS: ['#0A1A10', '#0A0F0C', '#060C08'],
  AMBIENT_GOLD_STOPS: ['rgba(0,255,149,0.10)', 'rgba(0,255,149,0.03)', 'transparent'],
  AMBIENT_JADE_STOPS: ['rgba(34,201,147,0.08)', 'rgba(34,201,147,0.02)', 'transparent'],
  AMBIENT_VIOLET_STOPS: ['rgba(0,214,252,0.10)', 'rgba(0,214,252,0.03)', 'transparent'],
  SCENARIO_GOLD_STOPS: ['#0A1F14', '#0A0F0C'],
  SCENARIO_JADE_STOPS: ['#0E2418', '#081A10'],
  SCENARIO_VIOLET_STOPS: ['#0A1A1F', '#08131A'],
  MASCOT_STOPS: ['#0A1A10', '#0A0F0C', '#060C08'],
  PRIMARY_STOPS: ['#02B986', '#019472', '#016B4E'],
  HEADER_STOPS: ['#02B986', '#016B4E'],
  ONBOARDING_STOPS: ['#012E20', '#016B4E', '#02B986'],
  AVATAR_STOPS: ['#5FFFB8', '#02B986'],
};

export const lightGradients: ThemeGradients = {
  GOLD_STOPS: ['#02B986', '#019472', '#016B4E'],
  JADE_STOPS: ['#22C993', '#1AB387', '#34D9A5'],
  SURFACE_STOPS: ['rgba(0,255,149,0.04)', 'rgba(0,255,149,0.01)'],
  BG_STOPS: ['#FFFFFF', '#F0FFF8', '#E8FFF5'],
  AMBIENT_GOLD_STOPS: ['rgba(0,255,149,0.06)', 'rgba(0,255,149,0.02)', 'transparent'],
  AMBIENT_JADE_STOPS: ['rgba(34,201,147,0.06)', 'rgba(34,201,147,0.02)', 'transparent'],
  AMBIENT_VIOLET_STOPS: ['rgba(0,214,252,0.06)', 'rgba(0,214,252,0.02)', 'transparent'],
  SCENARIO_GOLD_STOPS: ['#E8FFF0', '#D0FFE8'],
  SCENARIO_JADE_STOPS: ['#ECFDF5', '#D1FAE5'],
  SCENARIO_VIOLET_STOPS: ['#E0FAFF', '#D0F4FF'],
  MASCOT_STOPS: ['#FFFFFF', '#F0FFF8', '#E8FFF5'],
  PRIMARY_STOPS: ['#02B986', '#019472', '#016B4E'],
  HEADER_STOPS: ['#02B986', '#019472'],
  ONBOARDING_STOPS: ['#02B986', '#019472', '#016B4E'],
  AVATAR_STOPS: ['#02B986', '#5FFFB8'],
};

export const ANGLE_135 = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
export const ANGLE_145 = { start: { x: 0, y: 0 }, end: { x: 0.9, y: 1 } };
export const ANGLE_TO_BOTTOM = { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } };
