// Central theme barrel — import fonts, tokens, gradients, and the theme hook
// from here instead of from src/components/design/* directly.

export {
  darkTheme,
  lightTheme,
  FONT_ARABIC,
  FONT_ARABIC_SEMI,
  FONT_ARABIC_EXTRA,
  FONT_ARABIC_BLACK,
  FONT_HEADING,
  FONT_HEADING_SEMI,
  FONT_HEADING_MEDIUM,
  FONT_HEADING_EXTRA,
  FONT_LATIN,
  FONT_LATIN_LIGHT,
  FONT_LATIN_MEDIUM,
  FONT_LATIN_SEMI,
  FONT_LATIN_BOLD,
} from '../components/design/tokens';
export type { ThemeColors } from '../components/design/tokens';

export {
  darkGradients,
  lightGradients,
  ANGLE_135,
  ANGLE_145,
  ANGLE_TO_BOTTOM,
} from '../components/design/gradients';
export type { ThemeGradients } from '../components/design/gradients';

export { useTheme } from '../hooks/useTheme';

export { SPACE, SCREEN_MARGIN, RADIUS } from '../components/design/spacing';
