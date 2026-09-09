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

/**
 * The reason this change exists.
 *
 * Screens either ASK the learner for something or GIVE them something. The
 * flow shipped with seven consecutive asks before the first give, which is
 * what "boring to go through" described.
 */
describe('ask/give rhythm', () => {
  const GIVES: readonly string[] = ['phrase', 'scenario'];

  const firstGiveIndex = () =>
    ONBOARDING_SCREENS.findIndex(s => GIVES.includes(s));

  it('reaches the first give within three screens', () => {
    // Was 7. The scenario depends on mode and gender, so 4 is the earliest
    // legal position for it and the phrase sits immediately before it.
    expect(firstGiveIndex()).toBeLessThanOrEqual(3);
  });

  it('opens with at most two asks', () => {
    // Screen 0 is the welcome splash and asks nothing.
    expect(firstGiveIndex() - 1).toBeLessThanOrEqual(2);
  });

  it('plays the phrase immediately before the scenario', () => {
    // The phrase is the primer — hear now, earn later. It is only priming if
    // it lands first.
    expect(indexOfScreen('scenario') - indexOfScreen('phrase')).toBe(1);
  });

  it('asks for a commitment only after something has been given', () => {
    // A 2.2-second hold placed before any payoff is the flow's most demanding
    // interaction asked at its least earned moment.
    expect(indexOfScreen('commitment')).toBeGreaterThan(firstGiveIndex());
  });

  it('keeps the scenario after the two things it depends on', () => {
    // getScenarioScript takes mode; gender gates scenarios via requiresGender.
    expect(indexOfScreen('scenario')).toBeGreaterThan(indexOfScreen('mode'));
    expect(indexOfScreen('scenario')).toBeGreaterThan(indexOfScreen('name'));
  });

  it('pays the role question off on the same screen, so goals may follow it', () => {
    expect(indexOfScreen('goals')).toBeGreaterThan(indexOfScreen('role'));
  });
});
