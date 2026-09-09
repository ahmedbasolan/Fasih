/**
 * The onboarding flow's screen order.
 *
 * Pure data plus three lookups. No React, no theme — same contract as
 * scenarioEngine.ts.
 *
 * This exists because the order was previously spread across four `switch`
 * statements keyed on bare integers plus a hardcoded list of guarded indices
 * in the swipe gesture. Reordering meant editing all five in step, and a
 * missed guard silently banks a choice the learner never made.
 *
 * With the order here, a resequence is an edit to ONE array.
 */

export type OnboardingScreen =
  | 'welcome'
  | 'mode'
  | 'name'
  | 'role'
  | 'goals'
  | 'commitment'
  | 'notifications'
  | 'phrase'
  | 'scenario'
  | 'paywall-timeline'
  | 'paywall-features'
  | 'paywall-plans';

/**
 * The order the learner sees.
 *
 * Ordered by ask/give rhythm, not by what is convenient to collect. The flow
 * previously ran seven consecutive asks before the first give: mode, name,
 * gender, role, profession, goals, a 2.2-second hold, and a notifications
 * prompt, all before the learner was handed a single Arabic phrase.
 *
 * The phrase and the scenario now sit at 3 and 4 — the earliest legal
 * position, since the scenario needs `mode` and gender — and the profile
 * questions follow them. `role` pays itself off inline rather than banking
 * the answer for later.
 */
export const ONBOARDING_SCREENS: readonly OnboardingScreen[] = [
  'welcome',
  'mode',
  'name',
  'phrase',
  'scenario',
  'role',
  'goals',
  'commitment',
  'notifications',
  'paywall-timeline',
  'paywall-features',
  'paywall-plans',
] as const;

/**
 * Screens a forward swipe must not skip.
 *
 * Named rather than indexed, so they travel with the screen when the order
 * changes. `mode` and `name` guard unmade choices that would otherwise bank a
 * default; `commitment` guards the hold that has not completed.
 */
export const REQUIRES_INTERACTION: readonly OnboardingScreen[] = [
  'mode',
  'name',
  'commitment',
] as const;

/** The screen at an index, or undefined when the index is out of range. */
export function screenAt(index: number): OnboardingScreen | undefined {
  return ONBOARDING_SCREENS[index];
}

/** The index of a screen. Total, because the union cannot name a missing screen. */
export function indexOfScreen(screen: OnboardingScreen): number {
  return ONBOARDING_SCREENS.indexOf(screen);
}

/** Whether the screen at this index requires an explicit interaction to leave. */
export function requiresInteraction(index: number): boolean {
  const screen = screenAt(index);
  return screen !== undefined && REQUIRES_INTERACTION.includes(screen);
}
