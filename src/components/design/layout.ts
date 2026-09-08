/**
 * The layout system: baseline, grid, type scale, zones.
 *
 * `spacing.ts` gave the app a spacing scale. This gives it the rest of the
 * low-level design layer — the part that decides where something is ALLOWED to
 * sit, rather than leaving each screen to place things by eye.
 *
 * Everything here derives from one number, `BASELINE`. Spacing, line heights
 * and zone heights are all multiples of it, so type and boxes land on the same
 * rhythm instead of near it.
 */

/**
 * The unit everything is a multiple of.
 *
 * 4, not 8. Android's density buckets and iOS's point grid both resolve cleanly
 * at 4, and an 8 baseline forces either 16px or 24px line heights on 11-13px
 * type — 16 is tight and 24 is loose. `SPACE` in spacing.ts is 4·8·12·16·24·32
 * and is already a subset of this.
 */
export const BASELINE = 4;

/** Rounds any value onto the baseline. Use for computed heights, never literals. */
export const toBaseline = (v: number): number => Math.round(v / BASELINE) * BASELINE;

/**
 * The column grid.
 *
 * Four columns, not twelve. A phone at 360-430dp cannot show twelve meaningful
 * columns, and pretending otherwise produces sub-30dp cells nothing fits in.
 * Four gives halves, quarters and thirds-by-eye, which covers every layout in
 * this app: the role grid (2-up), the goal list (1-up), the feature grid (2-up).
 *
 * `SCREEN_MARGIN` lives in spacing.ts and is the outer gutter.
 */
export const GRID = {
  columns: 4,
  /** Space between columns. One SPACE.md. */
  gutter: 12,
} as const;

/**
 * Column width for an `n`-column span, given the usable content width.
 *
 * `contentWidth` is the screen width MINUS both screen margins — pass
 * `width - SCREEN_MARGIN * 2`, not the raw window width. Getting that wrong is
 * the usual cause of a grid that overflows by exactly one margin.
 */
export function span(contentWidth: number, n: number): number {
  const total = GRID.columns;
  const cols = Math.min(Math.max(n, 1), total);
  const gutters = GRID.gutter * (total - 1);
  const colWidth = (contentWidth - gutters) / total;
  return colWidth * cols + GRID.gutter * (cols - 1);
}

/**
 * The type scale.
 *
 * The app had TWENTY-TWO distinct font sizes between 9 and 72, with 11, 12, 13
 * and 14 all in heavy use — four sizes inside a 3pt range, which is not a scale,
 * it is an absence of one. Nothing downstream could be consistent because there
 * was nothing to be consistent with.
 *
 * Eight steps, each line height a multiple of BASELINE so blocks of text stack
 * on the same rhythm regardless of size.
 *
 * Arabic is NOT in this scale. It needs more leading than Latin at the same
 * optical size — see ARABIC_LINE_HEIGHT_MULTIPLIER and ARABIC_SCALE in
 * tokens.ts, which are applied on top of a chosen size.
 */
export const TYPE = {
  /** Eyebrows, badge text, tabular labels. */
  micro: { fontSize: 11, lineHeight: 16 },
  /** Captions, secondary metadata. */
  caption: { fontSize: 12, lineHeight: 16 },
  /** Default body. */
  body: { fontSize: 14, lineHeight: 20 },
  /** Body that needs to carry a paragraph. */
  bodyLarge: { fontSize: 16, lineHeight: 24 },
  /** Row titles, card headings. */
  subhead: { fontSize: 18, lineHeight: 24 },
  /** Section titles. */
  title: { fontSize: 22, lineHeight: 28 },
  /** Screen titles. */
  headline: { fontSize: 28, lineHeight: 36 },
  /** The one big statement per screen. */
  display: { fontSize: 34, lineHeight: 40 },
} as const;

export type TypeStep = keyof typeof TYPE;

/** Every size the scale allows, for the lint. */
export const TYPE_SIZES: readonly number[] = Object.values(TYPE).map(t => t.fontSize);

/**
 * Minimum touch target, per both platforms' guidance (44pt iOS, 48dp Android —
 * 44 with hitSlop satisfies both).
 *
 * A control smaller than this needs `hitSlop` to make up the difference, not a
 * bigger icon.
 */
export const TOUCH_MIN = 44;

/**
 * iPhone safe-area reference figures.
 *
 * The app LAUNCHES on iOS and is VERIFIED on Android, so iOS geometry is
 * structurally unobserved — the web preview has no safe areas at all, and
 * nobody is going to eyeball an iPhone before submission. These exist so
 * inset-dependent layout can be reasoned about and asserted rather than
 * checked by looking.
 *
 * Do not read insets from these at runtime. `useSafeAreaInsets()` is the
 * source of truth on device; these are the numbers to design against and to
 * write tests with.
 */
export const IOS_INSETS = {
  /** Dynamic Island (14 Pro and later). The largest top inset shipping. */
  topDynamicIsland: 59,
  /** Notch (X through 14). */
  topNotch: 47,
  /** Home indicator. Present on every notch/Island device. */
  bottomHomeIndicator: 34,
  /** Touch ID era — no top or bottom inset at all. The layout must survive 0. */
  legacyNone: 0,
} as const;

/**
 * The three vertical zones of a screen.
 *
 * Placement rules, so a screen cannot invent its own arrangement:
 *
 *   header   Back, title, subtitle. Owns the top safe-area inset. `ScreenHeader`
 *            is the only thing that should render here.
 *   content  Scrolls. Everything else.
 *   action   The primary action, pinned to the bottom within thumb reach, and
 *            owning the bottom safe-area inset.
 *
 * The reason this is written down: the onboarding steps each hand-rolled their
 * own padding, which is how Sentence Builder ended up with its back button
 * under the notch and how three screens disagreed about who applies insets.
 */
export const ZONE = {
  /** Space between the header block and the content below it. */
  headerGap: 24,
  /** Space between content and a pinned action. */
  actionGap: 16,
  /** Minimum height of the action zone, so it never collapses onto content. */
  actionMinHeight: 52,
} as const;
