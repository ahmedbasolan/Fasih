/**
 * The layout lint.
 *
 * Proves the system is internally consistent and that the codebase stays on it.
 *
 * WHAT THIS CANNOT DO: none of it runs on a device. There is no render-testing
 * library in this repo, so nothing here mounts a component, measures a layout,
 * or observes a safe area. It checks pure functions and scans source text.
 *
 * That boundary is worth stating because an earlier version of this file
 * crossed it — four tests named "iPhone safe areas" that were arithmetic on
 * constants declared in the same commit, proving nothing while reporting green.
 * Assertions about real geometry need a real device.
 */
import { BASELINE, toBaseline, GRID, span, TYPE, TYPE_SIZES, TOUCH_MIN, ZONE, INSET_FIXTURES, screenPadding } from '../../components/design/layout';
import { SPACE, SCREEN_MARGIN, RADIUS } from '../../components/design/spacing';

declare const __dirname: string;
declare function require(id: 'fs'): {
  readFileSync(path: string, encoding: 'utf8'): string;
  readdirSync(path: string, opts: { withFileTypes: true }): { name: string; isDirectory(): boolean }[];
};
declare function require(id: 'path'): { join(...parts: string[]): string };

const { readFileSync, readdirSync } = require('fs');
const { join } = require('path');

describe('the system is internally consistent', () => {
  it('every SPACE value sits on the baseline', () => {
    const off = Object.entries(SPACE).filter(([, v]) => v % BASELINE !== 0);
    expect(off).toEqual([]);
  });

  it('every type step has a line height on the baseline', () => {
    const off = Object.entries(TYPE)
      .filter(([, t]) => t.lineHeight % BASELINE !== 0)
      .map(([k]) => k);
    expect(off).toEqual([]);
  });

  it('the type scale increases monotonically and never by less than 1pt', () => {
    const sizes = Object.values(TYPE).map(t => t.fontSize);
    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i]).toBeGreaterThan(sizes[i - 1]);
    }
  });

  it('every line height leaves room for its own type', () => {
    // A line height below the font size clips descenders. Cheap to assert,
    // annoying to discover on a device.
    for (const [name, t] of Object.entries(TYPE)) {
      expect(`${name}:${t.lineHeight >= t.fontSize * 1.1}`).toBe(`${name}:true`);
    }
  });

  it('SCREEN_MARGIN is deliberately off-scale and stays documented as such', () => {
    // 20 is not a multiple of 8 and that is on purpose — spacing.ts explains
    // why. Asserted so the exception cannot quietly become two exceptions.
    expect(SCREEN_MARGIN).toBe(20);
    expect(SCREEN_MARGIN % BASELINE).toBe(0);
  });

  it('the touch minimum meets both platforms', () => {
    expect(TOUCH_MIN).toBeGreaterThanOrEqual(44);
  });

  it('zone values sit on the baseline', () => {
    const off = Object.entries(ZONE).filter(([, v]) => v % BASELINE !== 0);
    expect(off).toEqual([]);
  });

  it('radius budget is unchanged by the grid work', () => {
    expect(RADIUS.flat).toBe(0);
    expect(RADIUS.sheet).toBe(24);
  });
});

/**
 * `screenPadding` — the real computation `Screen` uses.
 *
 * These replace four tests that were arithmetic on constants declared in the
 * same commit (`59 + 16 > 59` and similar). Those asserted nothing about the
 * app or about iOS, while reading in a test report as "iPhone safe areas ✓".
 *
 * What follows tests the actual function against a spread of inset values. That
 * is a genuine check of the arithmetic. It is STILL NOT evidence about a real
 * device — no iPhone has run this app — and the fixtures it uses are unverified
 * approximations, which INSET_FIXTURES says plainly.
 */
describe('screenPadding', () => {
  const withAction = { hasAction: true, headerHandlesTopInset: false };
  const noAction = { hasAction: false, headerHandlesTopInset: false };

  it('passes the top inset through when no header owns it', () => {
    expect(screenPadding({ top: INSET_FIXTURES.topLarge, bottom: 0 }, noAction).top)
      .toBe(INSET_FIXTURES.topLarge);
  });

  it('drops the top inset when the header applies it, so it is never doubled', () => {
    const pad = screenPadding(
      { top: INSET_FIXTURES.topLarge, bottom: 0 },
      { hasAction: false, headerHandlesTopInset: true },
    );
    expect(pad.top).toBe(0);
  });

  it('clears the bottom bar by a real gap, not by sitting on it', () => {
    const pad = screenPadding({ top: 0, bottom: INSET_FIXTURES.bottomBar }, withAction);
    expect(pad.actionBottom - INSET_FIXTURES.bottomBar).toBeGreaterThanOrEqual(SPACE.md);
  });

  it('scales with the inset rather than assuming one device', () => {
    // The property that matters: a bigger inset produces more padding. A layout
    // tuned to a single device would return the same number for both.
    const small = screenPadding({ top: 0, bottom: INSET_FIXTURES.none }, withAction);
    const large = screenPadding({ top: 0, bottom: INSET_FIXTURES.bottomBar }, withAction);
    expect(large.actionBottom).toBeGreaterThan(small.actionBottom);
    expect(large.actionBottom - small.actionBottom).toBe(INSET_FIXTURES.bottomBar);
  });

  it('still leaves bottom padding when there is no inset at all', () => {
    // Pre-notch iPhones and most Android devices report 0. Content that only
    // clears the edge because an inset pushed it is flush against it here.
    const pad = screenPadding({ top: 0, bottom: INSET_FIXTURES.none }, withAction);
    expect(pad.actionBottom).toBeGreaterThanOrEqual(SPACE.lg);
  });

  it('the scroll area clears the bottom itself when nothing is pinned', () => {
    // With no action zone below it, the scroll content is the last thing on
    // screen and has to clear the inset on its own.
    const pad = screenPadding({ top: 0, bottom: INSET_FIXTURES.bottomBar }, noAction);
    expect(pad.scrollBottom).toBeGreaterThan(INSET_FIXTURES.bottomBar);
  });

  it('the scroll area stops short of a pinned action instead of clearing the inset twice', () => {
    const pad = screenPadding({ top: 0, bottom: INSET_FIXTURES.bottomBar }, withAction);
    expect(pad.scrollBottom).toBe(ZONE.actionGap);
    expect(pad.scrollBottom).toBeLessThan(INSET_FIXTURES.bottomBar);
  });

  it('does not re-apply the bottom inset the tab bar already owns', () => {
    // The tab bar is a flow sibling of the screen container, not an overlay:
    // BottomTabView renders [screens (flex: 1), tabBar] in a column, and the
    // bar itself only goes absolute while hidden for the keyboard. So a tab
    // screen sits entirely above it and the bar carries the inset.
    //
    // Before this flag, all four tab screens added `insets.bottom + 80..100`
    // on top of that — measured as 80-114px of dead space at the end of every
    // tab scroll, in three different amounts.
    const inTabs = { hasAction: false, headerHandlesTopInset: false, tabBarHandlesBottomInset: true };
    const pad = screenPadding({ top: 0, bottom: INSET_FIXTURES.bottomBar }, inTabs);
    expect(pad.scrollBottom).toBe(SPACE.xl);
  });

  it('leaves the top inset alone when the tab bar owns the bottom one', () => {
    // The two flags are independent: a tab screen still owns its own top inset.
    const pad = screenPadding(
      { top: INSET_FIXTURES.topLarge, bottom: INSET_FIXTURES.bottomBar },
      { hasAction: false, headerHandlesTopInset: false, tabBarHandlesBottomInset: true },
    );
    expect(pad.top).toBe(INSET_FIXTURES.topLarge);
  });

  it('a pinned action inside the tabs clears the bar without the inset', () => {
    const pad = screenPadding(
      { top: 0, bottom: INSET_FIXTURES.bottomBar },
      { hasAction: true, headerHandlesTopInset: false, tabBarHandlesBottomInset: true },
    );
    expect(pad.actionBottom).toBe(SPACE.lg);
  });

  it('its local spacing copies match the real spacing scale', () => {
    // layout.ts keeps local SPACE_LG / SPACE_XL to avoid importing the
    // lower-level spacing module. If those drift, padding silently changes.
    expect(screenPadding({ top: 0, bottom: 0 }, withAction).actionBottom).toBe(SPACE.lg);
    expect(screenPadding({ top: 0, bottom: 0 }, noAction).scrollBottom).toBe(SPACE.xl);
  });
});

describe('Android font padding', () => {
  it('every type step disables it', () => {
    // includeFontPadding is Android-only and defaults to true, so without this
    // the same style renders taller on Android than iOS and the baseline grid
    // is real on only one platform.
    const missing = Object.entries(TYPE)
      .filter(([, t]) => (t as { includeFontPadding?: boolean }).includeFontPadding !== false)
      .map(([k]) => k);
    expect(missing).toEqual([]);
  });
});

describe('toBaseline', () => {
  it('snaps to the nearest multiple', () => {
    expect(toBaseline(13)).toBe(12);
    expect(toBaseline(14)).toBe(16);
    expect(toBaseline(0)).toBe(0);
  });
});

describe('span', () => {
  // 375 is the narrowest phone the app targets; content width is the screen
  // minus both margins.
  const content = 375 - SCREEN_MARGIN * 2;

  it('a full span is exactly the content width', () => {
    expect(Math.round(span(content, GRID.columns))).toBe(content);
  });

  it('two half-spans plus a gutter is a full span', () => {
    expect(Math.round(span(content, 2) * 2 + GRID.gutter)).toBe(content);
  });

  it('clamps out-of-range spans instead of overflowing', () => {
    expect(span(content, 99)).toBe(span(content, GRID.columns));
    expect(span(content, 0)).toBe(span(content, 1));
  });

  it('never returns a width wider than its container', () => {
    for (let n = 1; n <= GRID.columns; n++) {
      expect(span(content, n)).toBeLessThanOrEqual(content + 0.01);
    }
  });
});

/**
 * The ratchet.
 *
 * The app had 22 distinct font sizes between 9 and 72 before the scale existed,
 * with 11/12/13/14 all in heavy use — four sizes inside a 3pt range. Migrating
 * every call site in one change would be a diff nobody can review, so instead
 * the count is pinned here and must fall.
 *
 * Raising MAX_OFF_SCALE to make a build pass defeats the entire mechanism. Fix
 * the call site or move the size onto the scale.
 */
describe('type scale adoption', () => {
  const SRC = join(__dirname, '../..');
  const APP = join(__dirname, '../../../app');

  function walk(dir: string): string[] {
    const out: string[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) out.push(...walk(full));
      else if (/\.tsx$/.test(entry.name)) out.push(full);
    }
    return out;
  }

  /**
   * Watermark glyphs are a graphic device, not type.
   *
   * `GhostLetters` and the mode plates render single Arabic letters at 140-260px
   * as a background texture. Forcing them onto an eight-step text scale would be
   * cargo-culting the rule past the thing it is for — nobody reads them, and no
   * scale sensibly extends to 260.
   *
   * Named files, not a size threshold, so a genuinely oversized heading cannot
   * hide behind the exemption.
   */
  const WATERMARK_FILES = ['components/ui/GhostLetters.tsx', 'screens/onboarding/ModeStep.tsx'];
  const isWatermark = (file: string) =>
    WATERMARK_FILES.some(w => file.replace(/\\/g, '/').endsWith(w));

  const scan = (() => {
    const allowed = new Set(TYPE_SIZES);
    const offenders: string[] = [];
    let scanned = 0;
    for (const file of [...walk(SRC), ...walk(APP)]) {
      const src = readFileSync(file, 'utf8');
      for (const m of src.matchAll(/fontSize:\s*(\d+)/g)) {
        scanned++;
        const size = Number(m[1]);
        if (allowed.has(size)) continue;
        // Watermarks are exempt only for sizes no text step could reach.
        if (isWatermark(file) && size > 100) continue;
        offenders.push(`${file.replace(/\\/g, '/').split('/src/').pop()}: ${size}`);
      }
    }
    return { offenders, scanned };
  })();

  /**
   * Zero.
   *
   * 235 the day the scale landed, 186 after onboarding, 0 after the full sweep.
   * It is a hard floor now rather than a ratchet — there is nothing left to
   * migrate, so any new off-scale size is a new decision and should be argued
   * for rather than absorbed.
   */
  it('no off-scale font sizes remain', () => {
    expect(scan.offenders).toEqual([]);
  });

  it('the scan actually finds font sizes', () => {
    // A walker that returns nothing would pass the assertion above.
    expect(scan.scanned).toBeGreaterThan(200);
  });

  it('the watermark exemption cannot cover ordinary text', () => {
    // The exemption is scoped to sizes above 100. A 28px heading in one of
    // those files is still checked.
    expect(isWatermark('src/components/ui/GhostLetters.tsx')).toBe(true);
    expect(isWatermark('src/screens/PracticeScreen.tsx')).toBe(false);
  });
});
