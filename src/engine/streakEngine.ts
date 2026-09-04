/**
 * Pure functions for the streak-freeze / at-risk mechanic.
 * No React, no Zustand, no side effects — same contract as scenarioEngine.ts.
 */

import { addDays } from './srsEngine';

/** True on every 7th consecutive day of a streak — the loyalty reward point. */
export function shouldGrantStreakFreeze(newStreak: number): boolean {
  return newStreak > 0 && newStreak % 7 === 0;
}

/**
 * True when the streak is still intact (practiced yesterday) but today's
 * practice hasn't happened yet. Requires an exact one-day gap — a streak that
 * has already lapsed for two or more days is not "at risk", it's already
 * broken, and recordDailyActivity's own isConsecutive check will reset it to
 * 1 on the next real activity rather than this flagging it as salvageable.
 */
export function isStreakAtRisk(currentStreak: number, lastActiveDate: string | null, today: string): boolean {
  return currentStreak > 0 && lastActiveDate !== today && lastActiveDate === addDays(today, -1);
}

export interface StreakFreezeState {
  streakFreezes: number;
  lastActiveDate: string | null;
}

export interface StreakFreezeResult {
  applied: boolean;
  streakFreezes: number;
  lastActiveDate: string | null;
}

/**
 * Spends one streak freeze to cover today without requiring practice.
 * currentStreak is deliberately left out of the result — a freeze preserves
 * the existing streak count, it never increments or resets it.
 *
 * Only bridges a true one-day gap (lastActiveDate was yesterday). A freeze is
 * meant to cover the single day it's spent on, not resurrect a streak that
 * has already sat broken for longer than that — otherwise one freeze could
 * revive a streak that lapsed weeks ago.
 */
export function applyStreakFreeze(state: StreakFreezeState, today: string): StreakFreezeResult {
  const yesterday = addDays(today, -1);
  if (state.streakFreezes <= 0 || state.lastActiveDate === today || state.lastActiveDate !== yesterday) {
    return { applied: false, streakFreezes: state.streakFreezes, lastActiveDate: state.lastActiveDate };
  }
  return { applied: true, streakFreezes: state.streakFreezes - 1, lastActiveDate: today };
}
