// ─── Gradient stop arrays for expo-linear-gradient ───────────────────────────
// Zafaran gold ramp — same family as JADE_ACCENT/JADE/TERTIARY in tokens.ts,
// verified so C.BG works as label ink across every stop, in both themes.
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
  GOLD_STOPS: ['#EAC57C', '#D6A24C', '#C4924A'],
  JADE_STOPS: ['#EFD299', '#DDB166', '#D6A24C'],
  SURFACE_STOPS: ['rgba(234,197,124,0.06)', 'rgba(234,197,124,0.02)'],
  BG_STOPS: ['#1A140D', '#14100B', '#0F0B07'],
  AMBIENT_GOLD_STOPS: ['rgba(234,197,124,0.10)', 'rgba(234,197,124,0.03)', 'transparent'],
  AMBIENT_JADE_STOPS: ['rgba(214,162,76,0.08)', 'rgba(214,162,76,0.02)', 'transparent'],
  AMBIENT_VIOLET_STOPS: ['rgba(166,136,214,0.10)', 'rgba(166,136,214,0.03)', 'transparent'],
  SCENARIO_GOLD_STOPS: ['#241C13', '#14100B'],
  SCENARIO_JADE_STOPS: ['#2A2015', '#1A140D'],
  SCENARIO_VIOLET_STOPS: ['#221A28', '#16121C'],
  MASCOT_STOPS: ['#1A140D', '#14100B', '#0F0B07'],
  PRIMARY_STOPS: ['#EAC57C', '#D6A24C', '#C4924A'],
  HEADER_STOPS: ['#EAC57C', '#C4924A'],
  ONBOARDING_STOPS: ['#6E491A', '#C4924A', '#EAC57C'],
  AVATAR_STOPS: ['#EFD299', '#D6A24C'],
};

export const lightGradients: ThemeGradients = {
  GOLD_STOPS: ['#8A5C1F', '#7A5219', '#6E491A'],
  JADE_STOPS: ['#8A5C1F', '#7A5219', '#6E491A'],
  SURFACE_STOPS: ['rgba(138,92,31,0.04)', 'rgba(138,92,31,0.01)'],
  BG_STOPS: ['#FFFFFF', '#FBF6EC', '#F4EBDB'],
  AMBIENT_GOLD_STOPS: ['rgba(138,92,31,0.06)', 'rgba(138,92,31,0.02)', 'transparent'],
  AMBIENT_JADE_STOPS: ['rgba(122,82,25,0.06)', 'rgba(122,82,25,0.02)', 'transparent'],
  AMBIENT_VIOLET_STOPS: ['rgba(107,79,160,0.06)', 'rgba(107,79,160,0.02)', 'transparent'],
  SCENARIO_GOLD_STOPS: ['#F4EBDB', '#EEDCB2'],
  SCENARIO_JADE_STOPS: ['#F4EBDB', '#EEDCB2'],
  SCENARIO_VIOLET_STOPS: ['#EDE5F5', '#DED0EC'],
  MASCOT_STOPS: ['#FFFFFF', '#FBF6EC', '#F4EBDB'],
  PRIMARY_STOPS: ['#8A5C1F', '#7A5219', '#6E491A'],
  HEADER_STOPS: ['#8A5C1F', '#6E491A'],
  ONBOARDING_STOPS: ['#8A5C1F', '#7A5219', '#6E491A'],
  AVATAR_STOPS: ['#8A5C1F', '#6E491A'],
};

export const ANGLE_135 = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
export const ANGLE_145 = { start: { x: 0, y: 0 }, end: { x: 0.9, y: 1 } };
export const ANGLE_TO_BOTTOM = { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } };
