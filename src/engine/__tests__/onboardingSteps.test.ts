import {
  ONBOARDING_SCREENS,
  screenAt,
  indexOfScreen,
  requiresInteraction,
  REQUIRES_INTERACTION,
} from '../onboardingSteps';

describe('onboarding step order', () => {
  it('has exactly thirteen screens', () => {
    // TOTAL in OnboardingFlow derives from this array rather than the reverse.
    // Was twelve; `progress` is the thirteenth and is a give, not an ask.
    expect(ONBOARDING_SCREENS).toHaveLength(13);
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

  it('never runs more than three asks back to back', () => {
    // Moving the first give forward fixed the opening and left the ending: the
    // flow closed on five consecutive asks — commitment, notifications and the
    // three paywall screens. Three of those five are the paywall and are not
    // being touched, so the fix is a give before it rather than fewer asks.
    //
    // `welcome` asks nothing, and `role` pays itself off inline, so both break
    // a run.
    const BREAKS_A_RUN: readonly string[] = ['welcome', 'phrase', 'scenario', 'role', 'progress'];

    let run = 0;
    let worst = 0;
    for (const screen of ONBOARDING_SCREENS) {
      run = BREAKS_A_RUN.includes(screen) ? 0 : run + 1;
      worst = Math.max(worst, run);
    }
    expect(worst).toBeLessThanOrEqual(3);
  });

  it('shows progress before the paywall asks the learner not to lose it', () => {
    // The paywall's title, subtitle and CTA all say "don't lose your progress".
    // Nothing had ever shown the learner any. This screen is what makes those
    // three strings true rather than a bluff.
    expect(indexOfScreen('progress')).toBeLessThan(indexOfScreen('paywall-timeline'));
  });

  it('shows progress only after there is progress to show', () => {
    expect(indexOfScreen('progress')).toBeGreaterThan(indexOfScreen('scenario'));
  });
});
