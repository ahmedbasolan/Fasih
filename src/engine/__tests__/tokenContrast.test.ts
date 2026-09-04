/**
 * The guard.
 *
 * Every foreground/background pairing the app actually renders is measured
 * here. This is the test that would have caught the ~1.0:1 Scenarios meter
 * labels, and it is why the CATEGORY_* pastels cannot come back: they are
 * theme-invariant fills, so a themed ink token on top of them fails in one
 * theme by construction.
 */
import { contrastRatio } from '../contrast';
import { lightTheme, darkTheme, type ThemeColors } from '../../components/design/tokens';

const AA_TEXT = 4.5;
const AA_LARGE = 3.0;

type Pair = { fg: keyof ThemeColors; bg: keyof ThemeColors; min: number; note: string };

/** Text pairings. Every one of these renders somewhere in the app. */
const TEXT_PAIRS: Pair[] = [
  { fg: 'TEXT',    bg: 'BG',      min: AA_TEXT, note: 'body ink on the page' },
  { fg: 'TEXT2',   bg: 'BG',      min: AA_TEXT, note: 'secondary text on the page' },
  { fg: 'TEXT3',   bg: 'BG',      min: AA_TEXT, note: 'tertiary text, incl. tab bar inactive' },
  { fg: 'PRIMARY', bg: 'BG',      min: AA_TEXT, note: 'accent used as literal text' },
  { fg: 'TEXT',    bg: 'SURFACE', min: AA_TEXT, note: 'ink inside the sheet' },
  { fg: 'TEXT2',   bg: 'SURFACE', min: AA_TEXT, note: 'secondary inside the sheet' },
  { fg: 'PRIMARY', bg: 'SURFACE', min: AA_TEXT, note: 'accent inside the sheet' },
  { fg: 'ERROR',   bg: 'BG',      min: AA_TEXT, note: 'error text on the page' },
  { fg: 'VIOLET',  bg: 'BG',      min: AA_TEXT, note: 'Culture metric label' },
];

/**
 * Non-text pairings that carry MEANING and therefore need 3:1.
 *
 * Deliberately NOT in this list: the `BORDER` / `BORDER2` hairlines. A divider
 * between list entries is decoration, not a UI component under WCAG 1.4.11 —
 * entries are already separated by content and rhythm. Light BORDER2 measures
 * 1.76:1, and forcing it to 3:1 would mean heavy black rules on every row,
 * which is precisely the look Sadaf exists to remove.
 *
 * Sadaf's active/selected state is a PRIMARY border, and PRIMARY is already
 * asserted above as text. That is the boundary that actually encodes state.
 */
const BOUNDARY_PAIRS: Pair[] = [
  { fg: 'PRIMARY', bg: 'BG', min: AA_LARGE, note: 'active-state border' },
];

describe.each([
  ['light', lightTheme],
  ['dark', darkTheme],
])('%s theme', (_name, theme) => {
  it.each(TEXT_PAIRS)('$fg on $bg passes AA text — $note', ({ fg, bg, min }) => {
    const ratio = contrastRatio(theme[fg], theme[bg]);
    expect(ratio).toBeGreaterThanOrEqual(min);
  });

  it.each(BOUNDARY_PAIRS)('$fg on $bg passes AA non-text — $note', ({ fg, bg, min }) => {
    const ratio = contrastRatio(theme[fg], theme[bg]);
    expect(ratio).toBeGreaterThanOrEqual(min);
  });
});

/**
 * The shape the original defect actually had.
 *
 * Every pairing above is token-against-token, and both sides of a token pairing
 * move together when the theme flips — so a token pairing can be wrong, but it
 * cannot be wrong *by construction* the way the meter labels were. Those put a
 * themed ink token on a **theme-invariant literal fill**: near-white `TEXT2` in
 * the dark theme, composited over the near-white pastel `#E0FFF0`, measured
 * ~1.0:1 while the same pair in light theme looked fine.
 *
 * This block pins that the maths catches that shape, using the real deleted
 * pastel as the fill. It is a proof about the measurement, not a scan of the
 * codebase.
 *
 * What the guard as a whole covers: every token pairing the app renders, in
 * both themes, plus the 22 tokens staying deleted.
 *
 * What it does NOT cover: a hardcoded colour literal introduced somewhere in a
 * component. Nothing here reads the component tree, so a new `#E0FFF0` written
 * inline under themed text would still ship. Closing that gap is the hex lint
 * in spec §8.4 (step 8), not this file.
 */
describe('themed ink on a theme-invariant literal fill', () => {
  // The deleted CATEGORY_MINT, kept as a fixture. Both theme objects carried a
  // near-white value for it — '#D5F5EC' in dark and '#E0FFF0' in light — and
  // that is the whole point: the fill did not move when the theme did, so the
  // ink landed on a near-white ground in dark mode no matter which one shipped.
  const PASTEL = '#E0FFF0';

  it('fails AA in the dark theme — the ~1.0:1 meter-label bug', () => {
    const ratio = contrastRatio(darkTheme.TEXT2, PASTEL);
    expect(ratio).toBeLessThan(AA_TEXT);
    // Not just "below AA" — near-invisible. Stated so a change that merely
    // nudges it over 4.5 cannot be read as having fixed anything.
    expect(ratio).toBeLessThan(1.2);
  });

  it('also fails AA for the primary ink token, not only the secondary one', () => {
    expect(contrastRatio(darkTheme.TEXT, PASTEL)).toBeLessThan(AA_TEXT);
  });

  it('passes in the light theme, which is why eyeballing one theme missed it', () => {
    // The same literal fill under the light theme's ink is fine. A fill that is
    // safe in the theme the developer happened to be running is exactly how the
    // pairing survived review.
    expect(contrastRatio(lightTheme.TEXT2, PASTEL)).toBeGreaterThanOrEqual(AA_TEXT);
  });
});

describe('deleted tokens stay deleted', () => {
  // Sadaf removes these. A future edit that reintroduces one should fail here
  // with an explanation, not silently restore the pastel layer.
  const FORBIDDEN = [
    'CATEGORY_PINK', 'CATEGORY_MINT', 'CATEGORY_BLUE',
    'CATEGORY_PEACH', 'CATEGORY_CREAM', 'CATEGORY_LAVENDER',
    'NEUTRAL_50', 'NEUTRAL_100', 'NEUTRAL_200', 'NEUTRAL_300', 'NEUTRAL_400',
    'NEUTRAL_500', 'NEUTRAL_600', 'NEUTRAL_700', 'NEUTRAL_800', 'NEUTRAL_900',
    'SAND', 'SECONDARY', 'PRIMARY_LIGHT', 'INVERTED_TEXT', 'WARM_BG', 'WARM_SURFACE',
  ];

  it.each([['light', lightTheme], ['dark', darkTheme]] as const)(
    '%s theme has none of the 22 removed tokens',
    (_name, theme) => {
      const present = FORBIDDEN.filter((key) => key in theme);
      expect(present).toEqual([]);
    },
  );
});
