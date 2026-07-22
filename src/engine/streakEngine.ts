/**
 * Pure functions for the streak-freeze / at-risk mechanic.
 * No React, no Zustand, no side effects — same contract as scenarioEngine.ts.
 */

/** True on every 7th consecutive day of a streak — the loyalty reward point. */
export function shouldGrantStreakFreeze(newStreak: number): boolean {
  return newStreak > 0 && newStreak % 7 === 0;
}

/** True when the user has an active streak but hasn't practiced yet today. */
export function isStreakAtRisk(currentStreak: number, lastActiveDate: string | null, today: string): boolean {
  return currentStreak > 0 && lastActiveDate !== today;
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
 */
export function applyStreakFreeze(state: StreakFreezeState, today: string): StreakFreezeResult {
  if (state.streakFreezes <= 0 || state.lastActiveDate === today) {
    return { applied: false, streakFreezes: state.streakFreezes, lastActiveDate: state.lastActiveDate };
  }
  return { applied: true, streakFreezes: state.streakFreezes - 1, lastActiveDate: today };
}
