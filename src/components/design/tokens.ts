// ─── Design Tokens ──────────────────────────────────────────────────────────
export const C = {
  BG: '#060611',
  SURFACE: 'rgba(255,255,255,0.03)',
  SURFACE2: 'rgba(255,255,255,0.055)',
  BORDER: 'rgba(255,255,255,0.07)',
  BORDER2: 'rgba(255,255,255,0.12)',

  GOLD: '#C8913A',
  GOLD2: '#E0AE5C',
  GOLD3: '#F5CE80',
  GOLD_DIM: 'rgba(200,145,58,0.12)',
  GOLD_BORDER: 'rgba(200,145,58,0.28)',

  JADE: '#1A9070',
  JADE2: '#22B58C',
  JADE3: '#30D4A8',
  JADE_DIM: 'rgba(26,144,112,0.12)',
  JADE_BORDER: 'rgba(26,144,112,0.28)',

  VIOLET: '#5B46C8',
  VIOLET2: '#7A65E0',
  VIOLET_DIM: 'rgba(91,70,200,0.14)',
  VIOLET_BORDER: 'rgba(91,70,200,0.3)',

  SAND: '#E8D5B0',
  TEXT: 'rgba(255,255,255,0.9)',
  TEXT2: 'rgba(255,255,255,0.5)',
  TEXT3: 'rgba(255,255,255,0.25)',
} as const;

export const SPRING = { type: 'spring', stiffness: 420, damping: 30, mass: 0.6 } as const;
export const SPRING_SLOW = { type: 'spring', stiffness: 200, damping: 28 } as const;

// ─── React Native Font Names (loaded via @expo-google-fonts) ─────────────────
export const FONT_ARABIC = 'Cairo_700Bold';
export const FONT_ARABIC_SEMI = 'Cairo_600SemiBold';
export const FONT_ARABIC_EXTRA = 'Cairo_800ExtraBold';
export const FONT_ARABIC_BLACK = 'Cairo_900Black';
export const FONT_LATIN = 'Inter_400Regular';
export const FONT_LATIN_LIGHT = 'Inter_300Light';
export const FONT_LATIN_MEDIUM = 'Inter_500Medium';
export const FONT_LATIN_SEMI = 'Inter_600SemiBold';
export const FONT_LATIN_BOLD = 'Inter_700Bold';

// ─── Kept for reference (not usable directly in RN — use gradients.ts instead)
export const GOLD_GRADIENT = `linear-gradient(135deg, ${C.GOLD}, ${C.GOLD2}, ${C.GOLD3})`;
export const JADE_GRADIENT = `linear-gradient(135deg, ${C.JADE}, ${C.JADE2}, ${C.JADE3})`;
export const SURFACE_GRADIENT = `linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))`;
