// ─── Gradient stop arrays for expo-linear-gradient ───────────────────────────
// Usage: <LinearGradient colors={GOLD_STOPS} start={ANGLE_135.start} end={ANGLE_135.end} />

export const GOLD_STOPS = ['#C8913A', '#E0AE5C', '#F5CE80'] as const;
export const JADE_STOPS = ['#1A9070', '#22B58C', '#30D4A8'] as const;
export const SURFACE_STOPS = ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)'] as const;
export const BG_STOPS = ['#0F0828', '#060611', '#08101A'] as const;

// Directional vectors (approximate CSS angle equivalents)
export const ANGLE_135 = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
export const ANGLE_145 = { start: { x: 0, y: 0 }, end: { x: 0.9, y: 1 } };
export const ANGLE_TO_BOTTOM = { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } };

// Scenario card gradients
export const SCENARIO_GOLD_STOPS = ['#1A0F0A', '#0D0608'] as const;
export const SCENARIO_JADE_STOPS = ['#0A1A14', '#050F0A'] as const;
export const SCENARIO_VIOLET_STOPS = ['#110A1C', '#080510'] as const;
