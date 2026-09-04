import { shouldGrantStreakFreeze, isStreakAtRisk, applyStreakFreeze } from '../streakEngine';

describe('shouldGrantStreakFreeze', () => {
  it('grants a freeze on day 7', () => {
    expect(shouldGrantStreakFreeze(7)).toBe(true);
  });

  it('grants a freeze on day 14', () => {
    expect(shouldGrantStreakFreeze(14)).toBe(true);
  });

  it('does not grant a freeze on day 6', () => {
    expect(shouldGrantStreakFreeze(6)).toBe(false);
  });

  it('does not grant a freeze on day 0', () => {
    expect(shouldGrantStreakFreeze(0)).toBe(false);
  });
});

describe('isStreakAtRisk', () => {
  it('is at risk when the streak is active and today has not been logged', () => {
    expect(isStreakAtRisk(5, '2026-07-03', '2026-07-04')).toBe(true);
  });

  it('is not at risk when today has already been logged', () => {
    expect(isStreakAtRisk(5, '2026-07-04', '2026-07-04')).toBe(false);
  });

  it('is not at risk when there is no active streak', () => {
    expect(isStreakAtRisk(0, '2026-07-03', '2026-07-04')).toBe(false);
  });

  it('is not at risk when the streak has already lapsed for more than a day', () => {
    // lastActiveDate is three weeks stale — the streak is already broken, not "at risk".
    expect(isStreakAtRisk(12, '2026-08-01', '2026-09-04')).toBe(false);
  });
});

describe('applyStreakFreeze', () => {
  it('applies a freeze when one is available and today is not yet logged', () => {
    const result = applyStreakFreeze({ streakFreezes: 2, lastActiveDate: '2026-07-03' }, '2026-07-04');
    expect(result).toEqual({ applied: true, streakFreezes: 1, lastActiveDate: '2026-07-04' });
  });

  it('does not apply when there are no freezes left', () => {
    const result = applyStreakFreeze({ streakFreezes: 0, lastActiveDate: '2026-07-03' }, '2026-07-04');
    expect(result).toEqual({ applied: false, streakFreezes: 0, lastActiveDate: '2026-07-03' });
  });

  it('does not apply (and does not double-spend) when today is already logged', () => {
    const result = applyStreakFreeze({ streakFreezes: 2, lastActiveDate: '2026-07-04' }, '2026-07-04');
    expect(result).toEqual({ applied: false, streakFreezes: 2, lastActiveDate: '2026-07-04' });
  });

  it('does not apply — and does not resurrect a stale streak — when the gap is more than one day', () => {
    // Regression: a freeze used to bridge any gap, so one freeze could revive
    // a streak that had already been dead for weeks.
    const result = applyStreakFreeze({ streakFreezes: 1, lastActiveDate: '2026-08-01' }, '2026-09-04');
    expect(result).toEqual({ applied: false, streakFreezes: 1, lastActiveDate: '2026-08-01' });
  });
});
