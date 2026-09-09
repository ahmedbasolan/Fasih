import {
  ONBOARDING_SCREENS,
  screenAt,
  indexOfScreen,
  requiresInteraction,
  REQUIRES_INTERACTION,
} from '../onboardingSteps';

describe('onboarding step order', () => {
  it('has exactly twelve screens', () => {
    // TOTAL in OnboardingFlow is 12 and this array is now the source of it.
    expect(ONBOARDING_SCREENS).toHaveLength(12);
  });

  it('names every screen uniquely', () => {
    expect(new Set(ONBOARDING_SCREENS).size).toBe(ONBOARDING_SCREENS.length);
  });

  it('round-trips a screen through its index', () => {
    for (const screen of ONBOARDING_SCREENS) {
      expect(screenAt(indexOfScreen(screen))).toBe(screen);
    }
  });

  it('returns undefined past the end rather than throwing', () => {
    expect(screenAt(ONBOARDING_SCREENS.length)).toBeUndefined();
    expect(screenAt(-1)).toBeUndefined();
  });

  it('opens on welcome and ends on the last paywall screen', () => {
    expect(ONBOARDING_SCREENS[0]).toBe('welcome');
    expect(ONBOARDING_SCREENS[ONBOARDING_SCREENS.length - 1]).toBe('paywall-plans');
  });

  it('gates the three screens that must not be swiped past', () => {
    // Swiping past an unmade choice banks a default silently. These three are
    // the screens where that would happen.
    expect([...REQUIRES_INTERACTION].sort()).toEqual(['commitment', 'mode', 'name']);
  });

  it('derives the guard from the order, so a reorder cannot desync it', () => {
    for (const screen of REQUIRES_INTERACTION) {
      expect(requiresInteraction(indexOfScreen(screen))).toBe(true);
    }
    expect(requiresInteraction(indexOfScreen('goals'))).toBe(false);
  });
});
