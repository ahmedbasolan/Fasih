/**
 * The Sadaf spacing scale.
 *
 * Sadaf has no fills or shadows to hide drift, so every margin, padding and gap
 * comes from here. A value that is not on this scale is a bug, not a choice.
 */
export const SPACE = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
} as const;

/**
 * Screen horizontal margin. Deliberately off-scale — it matches the safe-area
 * gutter the app already uses, and changing it to 24 would reflow every screen
 * for no gain. This is the only exception.
 */
export const SCREEN_MARGIN = 20;

/**
 * Radius budget. `SheetPanel` and interactive pills only; everything else is
 * flat. A radius on every block is what flattens hierarchy.
 */
export const RADIUS = {
  sheet: 24,
  pill: 999,
  flat: 0,
} as const;
