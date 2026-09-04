import { computeOnboardingChecklist, computeDailyGoalXP, ONBOARDING_CHECKLIST_ITEMS } from '../onboardingProgress';

describe('computeOnboardingChecklist', () => {
  it('returns empty array when nothing was completed', () => {
    const result = computeOnboardingChecklist({
      profession: '', goalsCount: 0, holdComplete: false, phraseRevealed: false, scenarioCompleted: false,
    });
    expect(result).toEqual([]);
  });

  it('returns all five items when everything was completed', () => {
    const result = computeOnboardingChecklist({
      profession: 'Waiter / Waitress', goalsCount: 2, holdComplete: true, phraseRevealed: true, scenarioCompleted: true,
    });
    expect(result).toEqual([...ONBOARDING_CHECKLIST_ITEMS]);
  });

  it('omits commitment when the hold-to-commit gesture was skipped', () => {
    const result = computeOnboardingChecklist({
      profession: 'Waiter / Waitress', goalsCount: 2, holdComplete: false, phraseRevealed: true, scenarioCompleted: true,
    });
    expect(result).toEqual(['profession', 'goals', 'first_phrase', 'first_scenario']);
  });

  it('treats a whitespace-only profession as not completed', () => {
    const result = computeOnboardingChecklist({
      profession: '   ', goalsCount: 1, holdComplete: false, phraseRevealed: false, scenarioCompleted: false,
    });
    expect(result).toEqual(['goals']);
  });
});

describe('computeDailyGoalXP', () => {
  it('returns Casual (250) for a single social goal', () => {
    expect(computeDailyGoalXP(1, 'social')).toBe(250);
  });

  it('returns Regular (500) for two goals in social mode', () => {
    expect(computeDailyGoalXP(2, 'social')).toBe(500);
  });

  it('returns Regular (500) for a single goal in career mode', () => {
    expect(computeDailyGoalXP(1, 'career')).toBe(500);
  });

  it('returns Intense (750) for four or more goals', () => {
    expect(computeDailyGoalXP(4, 'social')).toBe(750);
  });

  it('returns Intense (750) for three goals in career mode', () => {
    expect(computeDailyGoalXP(3, 'career')).toBe(750);
  });
});
