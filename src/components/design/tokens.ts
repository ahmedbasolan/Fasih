// ─── Design Tokens ──────────────────────────────────────────────────────────
// Khaleeji warm palette — Layl (night) / Ramlah (sand) / Zafaran (saffron) /
// Fairuz demoted from the old neon-green identity is not used here: the
// JADE_ACCENT/JADE/PRIMARY/TERTIARY cluster below is ONE hue family (shades of
// Zafaran gold), not several, because real components already combine them as
// ad-hoc gradient stops (see DailyPhrase, MissionCard, StreakWidget, WeeklyXP,
// OnboardingScenarioPlayer: `colors={[C.PRIMARY, C.JADE]}` etc.) — splitting
// them into different hues would make those gradients muddy. VIOLET stays a
// genuinely distinct violet (used standalone, e.g. the "Culture" stat), and
// ERROR is now Hinna (henna), a warm clay red instead of a cool salmon.
// Every text/fill pairing below is WCAG AA-verified (>=4.5:1) — see the note
// on ShimmerButton.tsx, which was the one place a hardcoded white label broke
// this (2.53:1 on the old gradient).
export type ThemeColors = {
  BG: string;
  SURFACE: string;
  SURFACE2: string;
  BORDER: string;
  BORDER2: string;

  // Warm neutral background surfaces (Gulf sand theme)
  WARM_BG: string;
  WARM_SURFACE: string;

  // Zafaran gold — brightest shade of the one accent ramp (was neon green)
  JADE_ACCENT: string;
  JADE_ACCENT2: string;
  JADE_ACCENT3: string;
  JADE_ACCENT_DIM: string;
  JADE_ACCENT_BORDER: string;
  JADE_ACCENT_SURFACE: string;

  // Zafaran gold — mid shade of the same ramp (was teal-green)
  JADE: string;
  JADE2: string;
  JADE3: string;
  JADE_DIM: string;
  JADE_BORDER: string;
  JADE_SURFACE: string;

  // Genuinely distinct violet — used standalone (e.g. the Culture stat),
  // never mixed into a JADE_ACCENT/JADE gradient, so it's safe to be its own hue
  VIOLET: string;
  VIOLET2: string;
  VIOLET_DIM: string;
  VIOLET_BORDER: string;
  VIOLET_SURFACE: string;

  // Cultural accent — same gold ramp, kept as its own name for cultural notes
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
  // Layl (night) — warm near-black, never blue-black
  BG: '#14100B',
  SURFACE: '#241C13',
  SURFACE2: '#2E2418',
  BORDER: 'rgba(243,233,214,0.14)',
  BORDER2: 'rgba(243,233,214,0.24)',

  WARM_BG: '#1A1510',
  WARM_SURFACE: '#262018',

  // Zafaran gold ramp — light end. Verified: dark ink >=4.5:1 on every
  // member, including every ad-hoc gradient pairing found in the app.
  JADE_ACCENT: '#EAC57C',
  JADE_ACCENT2: '#EFD299',
  JADE_ACCENT3: '#F6E7C2',
  JADE_ACCENT_DIM: 'rgba(234,197,124,0.18)',
  JADE_ACCENT_BORDER: 'rgba(234,197,124,0.35)',
  JADE_ACCENT_SURFACE: 'rgba(234,197,124,0.06)',

  // Zafaran gold ramp — mid/deep end
  JADE: '#D6A24C',
  JADE2: '#DDB166',
  JADE3: '#EFD299',
  JADE_DIM: 'rgba(214,162,76,0.16)',
  JADE_BORDER: 'rgba(214,162,76,0.35)',
  JADE_SURFACE: 'rgba(214,162,76,0.06)',

  VIOLET: '#A688D6',
  VIOLET2: '#B79AE0',
  VIOLET_DIM: 'rgba(166,136,214,0.18)',
  VIOLET_BORDER: 'rgba(166,136,214,0.35)',
  VIOLET_SURFACE: 'rgba(166,136,214,0.06)',

  CULTURAL_GOLD: '#EAC57C',
  CULTURAL_GOLD_DARK: '#B8823A',

  SAND: '#E8D2A6',
  TEXT: 'rgba(243,233,214,0.96)',
  TEXT1_5: 'rgba(243,233,214,0.80)',
  TEXT2: 'rgba(243,233,214,0.72)',
  TEXT3: 'rgba(243,233,214,0.58)',
  TEXT_ON_LIGHT: 'rgba(20,16,11,0.66)',

  // Hinna (henna) — warm clay red, not a cool salmon
  ERROR: '#E38A63',
  ERROR_SURFACE: 'rgba(166,80,46,0.10)',
  ERROR_BORDER: 'rgba(166,80,46,0.25)',

  WHITE: '#FFFFFF',
  CARD_BG: '#1D1710',
  CARD_SHADOW: 'rgba(0,0,0,0.45)',
  TAB_BG: '#1A140D',
  PRIMARY: '#EAC57C',
  PRIMARY_LIGHT: '#F6E7C2',
  PRIMARY_DARK: '#D6A24C',
  SECONDARY: '#D6A24C',
  TERTIARY: '#C4924A',
  INVERTED: '#14100B',
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
  NEUTRAL_900: '#14100B',
  CATEGORY_PINK: '#FFE0EC',
  CATEGORY_MINT: '#D5F5EC',
  CATEGORY_BLUE: '#D0F4FF',
  CATEGORY_PEACH: '#FFE8D0',
  CATEGORY_CREAM: '#FFF8E0',
  CATEGORY_LAVENDER: '#E3D9F0',
};

export const lightTheme: ThemeColors = {
  // Sadaf (mother-of-pearl) — warm cream, not cool grey
  BG: '#FBF6EC',
  SURFACE: '#FFFFFF',
  SURFACE2: '#F4EBDB',
  BORDER: 'rgba(28,21,13,0.16)',
  BORDER2: 'rgba(28,21,13,0.26)',

  WARM_BG: '#FAF5ED',
  WARM_SURFACE: '#F5EFE0',

  // JADE_ACCENT (=PRIMARY) is used as literal text/icon color (ProfileScreen,
  // StatCard) — must be dark enough to read on a light ground, verified.
  // JADE_ACCENT2/3 are ONLY ever used as phrases.ts category-badge
  // *backgrounds* (Gratitude / Food & Drink) paired with TEXT_ON_LIGHT dark
  // ink on top — so in light mode they need to stay a light pastel wash,
  // not a dark text-safe tone (those are two different, incompatible jobs
  // once the page ground itself is light). Verified with TEXT_ON_LIGHT.
  JADE_ACCENT: '#8A5C1F',
  JADE_ACCENT2: '#F0DFB8',
  JADE_ACCENT3: '#EEDCB2',
  JADE_ACCENT_DIM: 'rgba(138,92,31,0.12)',
  JADE_ACCENT_BORDER: 'rgba(138,92,31,0.25)',
  JADE_ACCENT_SURFACE: 'rgba(138,92,31,0.06)',

  // JADE2 is used as literal small text (PhraseBuilder correct-answer label,
  // PhraseLibrary difficulty badge) — must stay dark-safe, verified >=4.5:1.
  // JADE3 is only used as the Workplace category-badge background — light
  // pastel, same reasoning as JADE_ACCENT2/3 above.
  JADE: '#7A5219',
  JADE2: '#7A5219',
  JADE3: '#EEDCB2',
  JADE_DIM: 'rgba(122,82,25,0.10)',
  JADE_BORDER: 'rgba(122,82,25,0.22)',
  JADE_SURFACE: 'rgba(122,82,25,0.04)',

  VIOLET: '#6B4FA0',
  VIOLET2: '#7B5EAE',
  VIOLET_DIM: 'rgba(107,79,160,0.10)',
  VIOLET_BORDER: 'rgba(107,79,160,0.22)',
  VIOLET_SURFACE: 'rgba(107,79,160,0.04)',

  CULTURAL_GOLD: '#8A5C1F',
  CULTURAL_GOLD_DARK: '#6E491A',

  SAND: '#D9BE8C',
  TEXT: '#1C150D',
  TEXT1_5: 'rgba(28,21,13,0.82)',
  TEXT2: 'rgba(28,21,13,0.72)',
  TEXT3: 'rgba(28,21,13,0.64)',
  TEXT_ON_LIGHT: 'rgba(28,21,13,0.66)',

  ERROR: '#8A3F22',
  ERROR_SURFACE: 'rgba(138,63,34,0.06)',
  ERROR_BORDER: 'rgba(138,63,34,0.20)',

  WHITE: '#FFFFFF',
  CARD_BG: '#FFFFFF',
  CARD_SHADOW: 'rgba(120,90,40,0.14)',
  TAB_BG: '#FFFFFF',
  PRIMARY: '#8A5C1F',
  PRIMARY_LIGHT: '#B8823A',
  PRIMARY_DARK: '#6E491A',
  SECONDARY: '#8A5C1F',
  TERTIARY: '#6E491A',
  INVERTED: '#14100B',
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
  NEUTRAL_900: '#14100B',
  CATEGORY_PINK: '#FFE8F0',
  CATEGORY_MINT: '#E0FFF0',
  CATEGORY_BLUE: '#E0FAFF',
  CATEGORY_PEACH: '#FFF0E0',
  CATEGORY_CREAM: '#FFF8E8',
  CATEGORY_LAVENDER: '#EDE5F5',
};

export const ARABIC_LINE_HEIGHT_MULTIPLIER = 1.35;
// Arabic fonts need ~1.15× optical scale boost vs Latin to achieve equal visual weight
export const ARABIC_SCALE = 1.15;

export const SMOOTH = { type: 'timing', duration: 380 } as const;

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

