// ─── Design Tokens ──────────────────────────────────────────────────────────
// Green/Cyan design language
// Primary: #00FF95, Secondary: #02B986, Tertiary: #00D6FC, Neutral: #F8F9FA
export type ThemeColors = {
  BG: string;
  SURFACE: string;
  SURFACE2: string;
  BORDER: string;
  BORDER2: string;

  // Primary green (main accent)
  JADE_ACCENT: string;
  GOLD2: string;
  GOLD3: string;
  JADE_ACCENT_DIM: string;
  GOLD_BORDER: string;
  GOLD_SURFACE: string;

  // Secondary teal/green (replaces JADE)
  JADE: string;
  JADE2: string;
  JADE3: string;
  JADE_DIM: string;
  JADE_BORDER: string;
  JADE_SURFACE: string;

  // Accent cyan (tertiary color)
  VIOLET: string;
  VIOLET2: string;
  VIOLET_DIM: string;
  VIOLET_BORDER: string;
  VIOLET_SURFACE: string;

  // Cultural accent (traditional gold for cultural notes)
  CULTURAL_GOLD: string;
  CULTURAL_GOLD_DARK: string;

  SAND: string;
  TEXT: string;
  TEXT1_5: string;
  TEXT2: string;
  TEXT3: string;
  TEXT_ON_LIGHT: string; // Muted text for use on light/category-colored backgrounds

  ERROR: string;
  ERROR_SURFACE: string;
  ERROR_BORDER: string;

  // New design system colors
  WHITE: string;
  CARD_BG: string;
  CARD_SHADOW: string;
  TAB_BG: string;
  PRIMARY: string;
  PRIMARY_LIGHT: string;
  PRIMARY_DARK: string;
  SECONDARY: string;
  TERTIARY: string;
  INVERTED: string;
  INVERTED_TEXT: string;
  NEUTRAL_50: string;
  NEUTRAL_100: string;
  NEUTRAL_200: string;
  NEUTRAL_300: string;
  NEUTRAL_400: string;
  NEUTRAL_500: string;
  NEUTRAL_600: string;
  NEUTRAL_700: string;
  NEUTRAL_800: string;
  NEUTRAL_900: string;
  CATEGORY_PINK: string;
  CATEGORY_MINT: string;
  CATEGORY_BLUE: string;
  CATEGORY_PEACH: string;
  CATEGORY_CREAM: string;
  CATEGORY_LAVENDER: string;
};

export const darkTheme: ThemeColors = {
  BG: '#0A0F0C',
  SURFACE: 'rgba(255,255,255,0.06)',
  SURFACE2: 'rgba(255,255,255,0.10)',
  BORDER: 'rgba(255,255,255,0.10)',
  BORDER2: 'rgba(255,255,255,0.16)',

  JADE_ACCENT: '#00FF95',
  GOLD2: '#5FFFB8',
  GOLD3: '#B8FFE0',
  JADE_ACCENT_DIM: 'rgba(0,255,149,0.18)',
  GOLD_BORDER: 'rgba(0,255,149,0.35)',
  GOLD_SURFACE: 'rgba(0,255,149,0.06)',

  JADE: '#02B986',
  JADE2: '#00D69A',
  JADE3: '#5FFFB8',
  JADE_DIM: 'rgba(2,185,134,0.16)',
  JADE_BORDER: 'rgba(2,185,134,0.35)',
  JADE_SURFACE: 'rgba(2,185,134,0.06)',

  VIOLET: '#00D6FC',
  VIOLET2: '#5BE5FF',
  VIOLET_DIM: 'rgba(0,214,252,0.18)',
  VIOLET_BORDER: 'rgba(0,214,252,0.35)',
  VIOLET_SURFACE: 'rgba(0,214,252,0.06)',

  CULTURAL_GOLD: '#FFB800',
  CULTURAL_GOLD_DARK: '#B8860B',

  SAND: '#E0FFF0',
  TEXT: 'rgba(255,255,255,0.92)',
  TEXT1_5: 'rgba(255,255,255,0.7)',
  TEXT2: 'rgba(255,255,255,0.5)',
  TEXT3: 'rgba(255,255,255,0.28)',
  TEXT_ON_LIGHT: 'rgba(10,15,12,0.62)',

  ERROR: '#E8766C',
  ERROR_SURFACE: 'rgba(232,118,108,0.10)',
  ERROR_BORDER: 'rgba(232,118,108,0.25)',

  WHITE: '#FFFFFF',
  CARD_BG: 'rgba(255,255,255,0.06)',
  CARD_SHADOW: 'rgba(0,0,0,0.3)',
  TAB_BG: '#0C0A1C',
  PRIMARY: '#00FF95',
  PRIMARY_LIGHT: '#B8FFE0',
  PRIMARY_DARK: '#02B986',
  SECONDARY: '#02B986',
  TERTIARY: '#00D6FC',
  INVERTED: '#0A0F0C',
  INVERTED_TEXT: '#FFFFFF',
  NEUTRAL_50: '#F8F9FA',
  NEUTRAL_100: '#F0F2F5',
  NEUTRAL_200: '#E8EAED',
  NEUTRAL_300: '#D1D5DB',
  NEUTRAL_400: '#9CA3AF',
  NEUTRAL_500: '#6B7280',
  NEUTRAL_600: '#4B5563',
  NEUTRAL_700: '#374151',
  NEUTRAL_800: '#1F2937',
  NEUTRAL_900: '#0A0F0C',
  CATEGORY_PINK: '#FFE0EC',
  CATEGORY_MINT: '#D5F5EC',
  CATEGORY_BLUE: '#D0F4FF',
  CATEGORY_PEACH: '#FFE8D0',
  CATEGORY_CREAM: '#FFF8E0',
  CATEGORY_LAVENDER: '#E0FFF5',
};

export const lightTheme: ThemeColors = {
  BG: '#F8F9FA',
  SURFACE: '#FFFFFF',
  SURFACE2: '#F0F2F5',
  BORDER: 'rgba(0,0,0,0.08)',
  BORDER2: 'rgba(0,0,0,0.12)',

  JADE_ACCENT: '#00FF95',
  GOLD2: '#5FFFB8',
  GOLD3: '#B8FFE0',
  JADE_ACCENT_DIM: 'rgba(0,255,149,0.12)',
  GOLD_BORDER: 'rgba(0,255,149,0.25)',
  GOLD_SURFACE: 'rgba(0,255,149,0.06)',

  JADE: '#02B986',
  JADE2: '#00D69A',
  JADE3: '#5FFFB8',
  JADE_DIM: 'rgba(2,185,134,0.10)',
  JADE_BORDER: 'rgba(2,185,134,0.25)',
  JADE_SURFACE: 'rgba(2,185,134,0.04)',

  VIOLET: '#00D6FC',
  VIOLET2: '#5BE5FF',
  VIOLET_DIM: 'rgba(0,214,252,0.10)',
  VIOLET_BORDER: 'rgba(0,214,252,0.25)',
  VIOLET_SURFACE: 'rgba(0,214,252,0.04)',

  CULTURAL_GOLD: '#FFB800',
  CULTURAL_GOLD_DARK: '#B8860B',

  SAND: '#E0FFF0',
  TEXT: '#0A0F0C',
  TEXT1_5: '#1A2520',
  TEXT2: 'rgba(10,15,12,0.55)',
  TEXT3: 'rgba(10,15,12,0.35)',
  TEXT_ON_LIGHT: 'rgba(10,15,12,0.62)',

  ERROR: '#D64545',
  ERROR_SURFACE: 'rgba(214,69,69,0.06)',
  ERROR_BORDER: 'rgba(214,69,69,0.20)',

  WHITE: '#FFFFFF',
  CARD_BG: '#FFFFFF',
  CARD_SHADOW: 'rgba(0,0,0,0.06)',
  TAB_BG: '#FFFFFF',
  PRIMARY: '#00FF95',
  PRIMARY_LIGHT: '#B8FFE0',
  PRIMARY_DARK: '#02B986',
  SECONDARY: '#02B986',
  TERTIARY: '#00D6FC',
  INVERTED: '#0A0F0C',
  INVERTED_TEXT: '#FFFFFF',
  NEUTRAL_50: '#F8F9FA',
  NEUTRAL_100: '#F0F2F5',
  NEUTRAL_200: '#E8EAED',
  NEUTRAL_300: '#D1D5DB',
  NEUTRAL_400: '#9CA3AF',
  NEUTRAL_500: '#6B7280',
  NEUTRAL_600: '#4B5563',
  NEUTRAL_700: '#374151',
  NEUTRAL_800: '#1F2937',
  NEUTRAL_900: '#111827',
  CATEGORY_PINK: '#FFE8F0',
  CATEGORY_MINT: '#E0FFF0',
  CATEGORY_BLUE: '#E0FAFF',
  CATEGORY_PEACH: '#FFF0E0',
  CATEGORY_CREAM: '#FFF8E8',
  CATEGORY_LAVENDER: '#E8FFF5',
};

export const SPRING = { type: 'spring', stiffness: 420, damping: 30, mass: 0.6 } as const;
export const SPRING_SLOW = { type: 'spring', stiffness: 200, damping: 28 } as const;

export const SMOOTH = { type: 'timing', duration: 380 } as const;
export const SMOOTH_FAST = { type: 'timing', duration: 220 } as const;
export const SMOOTH_SLOW = { type: 'timing', duration: 600 } as const;

export const PRESS_SCALE = 0.96;
export const PRESS_DURATION_IN = 120;
export const PRESS_DURATION_OUT = 220;

// ─── React Native Font Names (loaded via @expo-google-fonts) ─────────────────
// Arabic fonts (Tajawal)
export const FONT_ARABIC = 'Tajawal_700Bold';
export const FONT_ARABIC_SEMI = 'Tajawal_500Medium';
export const FONT_ARABIC_EXTRA = 'Tajawal_800ExtraBold';
export const FONT_ARABIC_BLACK = 'Tajawal_900Black';

// Plus Jakarta Sans - Primary font for all Latin text (Headline, Body, Label)
export const FONT_HEADING = 'PlusJakartaSans_700Bold';
export const FONT_HEADING_SEMI = 'PlusJakartaSans_600SemiBold';
export const FONT_HEADING_MEDIUM = 'PlusJakartaSans_500Medium';
export const FONT_HEADING_EXTRA = 'PlusJakartaSans_800ExtraBold';

export const FONT_LATIN = 'PlusJakartaSans_400Regular';
export const FONT_LATIN_LIGHT = 'PlusJakartaSans_300Light';
export const FONT_LATIN_MEDIUM = 'PlusJakartaSans_500Medium';
export const FONT_LATIN_SEMI = 'PlusJakartaSans_600SemiBold';
export const FONT_LATIN_BOLD = 'PlusJakartaSans_700Bold';
