/**
 * WCAG contrast maths. Pure — no React, no theme imports.
 *
 * Exists because the Scenarios meter labels shipped at ~1.0:1: a themed text
 * token (near-white in dark) was placed on a theme-invariant pastel fill, and
 * nobody composited the two before eyeballing it. Estimating from hex values
 * cannot catch that. Measuring can.
 */

export type Rgba = { r: number; g: number; b: number; a: number };

const HEX = /^#([0-9a-f]{6})$/i;
// Each group is a single well-formed number. `[\d.]+` also matched `1.2.3`,
// which `Number()` turns into NaN — so a typo'd token produced a NaN ratio
// that compared false against every threshold instead of throwing below.
const NUM = String.raw`\d+(?:\.\d+)?`;
const RGB = new RegExp(
  `^rgba?\\(\\s*(${NUM})\\s*,\\s*(${NUM})\\s*,\\s*(${NUM})\\s*(?:,\\s*(${NUM})\\s*)?\\)$`,
  'i',
);

export function parseColor(value: string): Rgba {
  const trimmed = value.trim();

  const hex = trimmed.match(HEX);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }

  const rgb = trimmed.match(RGB);
  if (rgb) {
    const parsed = {
      r: Number(rgb[1]),
      g: Number(rgb[2]),
      b: Number(rgb[3]),
      a: rgb[4] === undefined ? 1 : Number(rgb[4]),
    };

    // Shape is not enough — range matters for the same reason `1.2.3` did.
    // `rgba(243,233,2140,0.72)` (a transposed digit) and `rgba(0,0,0,72)` (a
    // percentage written as a fraction) both match the pattern, and `composite`
    // would then blend with an out-of-gamut channel or an alpha above 1,
    // producing a luminance outside [0,1] and a ratio that can land ABOVE 4.5
    // and pass the token guard. This module's whole job is being the thing that
    // cannot be fooled about contrast, so it throws rather than computes.
    const inRange =
      parsed.r <= 255 && parsed.g <= 255 && parsed.b <= 255 && parsed.a <= 1;
    if (!inRange) {
      throw new Error(
        `Colour channel out of range (expected r/g/b 0-255 and alpha 0-1): ${value}`,
      );
    }

    return parsed;
  }

  throw new Error(`Unsupported colour format: ${value}`);
}

/** Blend a (possibly translucent) foreground over an opaque background. */
export function composite(fg: Rgba, bg: Rgba): Rgba {
  const a = fg.a;
  return {
    r: fg.r * a + bg.r * (1 - a),
    g: fg.g * a + bg.g * (1 - a),
    b: fg.b * a + bg.b * (1 - a),
    a: 1,
  };
}

export function relativeLuminance({ r, g, b }: Rgba): number {
  const channel = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * Contrast ratio of `fg` against `bg`. `bg` must be opaque — a translucent
 * background has no defined luminance without knowing what is behind it, and
 * silently treating it as opaque is how wrong numbers get published.
 */
export function contrastRatio(fg: string, bg: string): number {
  const background = parseColor(bg);
  if (background.a !== 1) {
    throw new Error(`Background must be opaque to measure contrast: ${bg}`);
  }

  const foreground = composite(parseColor(fg), background);

  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];

  return (hi + 0.05) / (lo + 0.05);
}
