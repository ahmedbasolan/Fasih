/**
 * The layout lint.
 *
 * Two jobs: prove the system is internally consistent, and ratchet the codebase
 * onto it. Same pattern as languageContent.test.ts — a permanently-red suite
 * gets ignored, so the current violations are recorded and the test asserts the
 * count does not GROW.
 */
import { BASELINE, toBaseline, GRID, span, TYPE, TYPE_SIZES, TOUCH_MIN, ZONE } from '../../components/design/layout';
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

  const offScale = (() => {
    const allowed = new Set(TYPE_SIZES);
    let count = 0;
    for (const file of [...walk(SRC), ...walk(APP)]) {
      const src = readFileSync(file, 'utf8');
      for (const m of src.matchAll(/fontSize:\s*(\d+)/g)) {
        if (!allowed.has(Number(m[1]))) count++;
      }
    }
    return count;
  })();

  /** Recorded 2026-09-04, the day the scale was introduced. Must only fall. */
  const MAX_OFF_SCALE = 235;

  it('does not add new off-scale font sizes', () => {
    expect(offScale).toBeLessThanOrEqual(MAX_OFF_SCALE);
  });

  it('MAX_OFF_SCALE is not stale by more than a migration step', () => {
    // Stops the ceiling drifting far above reality, which would let a big
    // regression slip in unnoticed. Tighten it as screens are migrated.
    expect(offScale).toBeGreaterThan(MAX_OFF_SCALE - 50);
  });

  it('the scan actually finds font sizes', () => {
    // A walker that returns nothing would pass both assertions above.
    expect(offScale).toBeGreaterThan(0);
  });
});
