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
/**
 * `includeFontPadding: false` is on every step, and it is not cosmetic.
 *
 * The property is ANDROID-ONLY (React Native declares it in `TextStyleAndroid`)
 * and defaults to TRUE, so Android adds ascender/descender padding above and
 * below every line box that iOS does not. Identical style objects therefore
 * render at different heights on the two platforms.
 *
 * That silently broke the central claim of this file. A baseline grid whose
 * line heights are multiples of 4 lands on the grid on iOS and lands near it on
 * Android — and Android is the only platform anyone here looks at, while iOS is
 * the one being shipped. Turning the padding off makes the two agree.
 *
 * It lives inside each step rather than in a global Text default so it travels
 * with every `...TYPE.body` spread and cannot be forgotten at a call site.
 */
const NO_ANDROID_FONT_PADDING = { includeFontPadding: false } as const;

export const TYPE = {
  /** Eyebrows, badge text, tabular labels. */
  micro: { fontSize: 11, lineHeight: 16, ...NO_ANDROID_FONT_PADDING },
  /** Captions, secondary metadata. */
  caption: { fontSize: 12, lineHeight: 16, ...NO_ANDROID_FONT_PADDING },
  /** Default body. */
  body: { fontSize: 14, lineHeight: 20, ...NO_ANDROID_FONT_PADDING },
  /** Body that needs to carry a paragraph. */
  bodyLarge: { fontSize: 16, lineHeight: 24, ...NO_ANDROID_FONT_PADDING },
  /** Row titles, card headings. */
  subhead: { fontSize: 18, lineHeight: 24, ...NO_ANDROID_FONT_PADDING },
  /** Section titles. */
  title: { fontSize: 22, lineHeight: 28, ...NO_ANDROID_FONT_PADDING },
  /** Screen titles. */
  headline: { fontSize: 28, lineHeight: 36, ...NO_ANDROID_FONT_PADDING },
  /** The one big statement per screen. */
  display: { fontSize: 34, lineHeight: 40, ...NO_ANDROID_FONT_PADDING },
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
 * Inset fixtures for tests. NOT verified against hardware.
 *
 * ⚠ These are approximate figures typed from memory, not measured on a device
 * and not cited from Apple's HIG. Nobody in this project has run the app on an
 * iPhone, and the web preview reports no insets at all, so nothing here has
 * been confirmed. The notch value in particular varies across the X-14 range
 * rather than being one number.
 *
 * They exist ONLY so `screenPadding` can be exercised across a realistic
 * spread of inset values — small, large, and zero. Do not read them at
 * runtime, do not quote them as fact, and do not treat a test that uses them
 * as evidence about iOS.
 *
 * An earlier version of this block presented them as authoritative and had
 * four tests built on top of them that were pure arithmetic on these very
 * constants. That is the failure mode this comment exists to prevent.
 */
export const INSET_FIXTURES = {
  /** Roughly a Dynamic Island device. */
  topLarge: 59,
  /** Roughly a notch device. */
  topSmall: 47,
  /** Roughly a home indicator. */
  bottomBar: 34,
  /** No inset. Pre-notch iPhones and most Android devices. Layout must survive it. */
  none: 0,
} as const;

/**
 * The padding `Screen` applies, as a pure function.
 *
 * Extracted from the component so it can actually be tested. The values used
 * to live inline in a `StyleSheet.create` call, which meant the only way to
 * check them was to render — and with no render-testing library in this repo,
 * "check them" degenerated into asserting arithmetic on constants.
 *
 * This is still not evidence about a real device. It is evidence that the
 * arithmetic is right for a given inset, which is the part that can be checked
 * without one.
 */
export function screenPadding(
  insets: { top: number; bottom: number },
  opts: {
    hasAction: boolean;
    headerHandlesTopInset: boolean;
    /**
     * Set on a screen inside the bottom tab navigator.
     *
     * The tab bar is a normal-flow sibling of the screen container, not an
     * overlay — `BottomTabView` renders `[screens (flex: 1), tabBar]` in a
     * column, and `BottomTabBar` only sets `position: 'absolute'` while it is
     * hidden for the keyboard. Confirmed in
     * `expo-router/build/react-navigation/bottom-tabs/views/`, on both
     * platforms, rather than assumed.
     *
     * So the screen already ends above the bar, and the bar already carries
     * the bottom inset. A tab screen that adds `insets.bottom` again is
     * padding against a bar that is not there. All four tab screens did, with
     * three different numbers (80, 90, 100) — measured as 80–114px of dead
     * space at the end of every tab scroll.
     */
    tabBarHandlesBottomInset?: boolean;
  },
): { top: number; scrollBottom: number; actionBottom: number } {
  const bottomInset = opts.tabBarHandlesBottomInset ? 0 : insets.bottom;
  return {
    top: opts.headerHandlesTopInset ? 0 : insets.top,
    // With an action pinned below, the scroll area stops short of it. Without
    // one, the scroll area itself has to clear the bottom inset.
    scrollBottom: opts.hasAction ? ZONE.actionGap : bottomInset + SPACE_XL,
    actionBottom: bottomInset + SPACE_LG,
  };
}

// Local copies so layout.ts does not import spacing.ts and create a cycle —
// spacing.ts is the lower-level module. Asserted equal in the lint.
const SPACE_LG = 16;
const SPACE_XL = 24;

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
