/**
 * Pure functions for deriving onboarding-completion state.
 * No React, no Zustand, no side effects — same contract as scenarioEngine.ts.
 */

export const ONBOARDING_CHECKLIST_ITEMS = [
  'profession',
  'goals',
  'commitment',
  'first_phrase',
  'first_scenario',
] as const;

export type ChecklistItem = typeof ONBOARDING_CHECKLIST_ITEMS[number];

export interface OnboardingProgressInput {
  profession: string;
  goalsCount: number;
  holdComplete: boolean;
  phraseRevealed: boolean;
  scenarioCompleted: boolean;
}

/** Returns the subset of ONBOARDING_CHECKLIST_ITEMS the user actually completed. */
export function computeOnboardingChecklist(input: OnboardingProgressInput): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  if (input.profession.trim().length > 0) items.push('profession');
  if (input.goalsCount > 0) items.push('goals');
  if (input.holdComplete) items.push('commitment');
  if (input.phraseRevealed) items.push('first_phrase');
  if (input.scenarioCompleted) items.push('first_scenario');
  return items;
}

/**
 * Adaptive daily XP goal — inferred from onboarding signals already collected,
 * never asked as a direct question.
 * score <= 1 -> Casual (250), score 2-3 -> Regular (500, matches the old
 * hardcoded default), score >= 4 -> Intense (750).
 */
export function computeDailyGoalXP(goalsCount: number, mode: 'career' | 'social'): number {
  const score = goalsCount + (mode === 'career' ? 1 : 0);
  if (score <= 1) return 250;
  if (score <= 3) return 500;
  return 750;
}
