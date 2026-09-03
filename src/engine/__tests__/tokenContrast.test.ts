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
