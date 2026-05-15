import { applyChoice, getTone } from '../scenarioEngine';
import type { ScenarioState, ScenarioChoice, ScenarioScene } from '../../types';

// ─── Shared test fixtures ─────────────────────────────────────────────────────

function makeEmptyState(scenarioId = 'test-scenario', sceneId = 'scene-1'): ScenarioState {
  return {
    scenarioId,
    currentSceneId: sceneId,
    flags: new Set(),
    impactByNpc: {},
    totalScore: 0,
    choiceHistory: [],
    scenesVisited: new Set([sceneId]),
    startedAt: '2026-01-01T00:00:00.000Z',
  };
}

function makeChoice(overrides: Partial<ScenarioChoice> = {}): ScenarioChoice {
  return {
    id: 'choice-1',
    text: 'Hello',
    arabic: 'مرحبا',
    roman: 'marhaba',
    score: 5,
    outcome: 'good',
    impact: { trust: 2, respect: 1, culture: 0 },
    ...overrides,
  };
}

function makeScene(overrides: Partial<ScenarioScene> = {}): ScenarioScene {
  return {
    id: 'scene-1',
    charName: 'Ahmed',
    charGender: 'male',
    setting: 'Office lobby',
    arabic: 'أهلا',
    roman: 'ahlan',
    english: 'Welcome',
    choices: [],
    ...overrides,
  };
}

// ─── applyChoice ─────────────────────────────────────────────────────────────

describe('applyChoice', () => {
  it('adds the choice score to totalScore', () => {
    const state = makeEmptyState();
    const choice = makeChoice({ score: 7 });
    const next = applyChoice(state, choice, 'Ahmed');
    expect(next.totalScore).toBe(7);
  });

  it('accumulates scores across multiple choices', () => {
    const state = makeEmptyState();
    const c1 = makeChoice({ id: 'c1', score: 5 });
    const c2 = makeChoice({ id: 'c2', score: 3 });
    const after1 = applyChoice(state, c1, 'Ahmed');
    const after2 = applyChoice(after1, c2, 'Ahmed');
    expect(after2.totalScore).toBe(8);
  });

  it('accumulates impact per NPC', () => {
    const state = makeEmptyState();
    const choice = makeChoice({ impact: { trust: 2, respect: 1, culture: 3 } });
    const next = applyChoice(state, choice, 'Sara');
    expect(next.impactByNpc['Sara']).toEqual({ trust: 2, respect: 1, culture: 3 });
  });

  it('sums impact for the same NPC across multiple choices', () => {
    const state = makeEmptyState();
    const c1 = makeChoice({ id: 'c1', impact: { trust: 1, respect: 0, culture: 2 } });
    const c2 = makeChoice({ id: 'c2', impact: { trust: -1, respect: 2, culture: 1 } });
    const after1 = applyChoice(state, c1, 'Ahmed');
    const after2 = applyChoice(after1, c2, 'Ahmed');
    expect(after2.impactByNpc['Ahmed']).toEqual({ trust: 0, respect: 2, culture: 3 });
  });

  it('tracks impact independently per NPC', () => {
    const state = makeEmptyState();
    const c1 = makeChoice({ id: 'c1', impact: { trust: 3, respect: 0, culture: 0 } });
    const c2 = makeChoice({ id: 'c2', impact: { trust: 0, respect: 2, culture: 1 } });
    const after1 = applyChoice(state, c1, 'Ahmed');
    const after2 = applyChoice(after1, c2, 'Sara');
    expect(after2.impactByNpc['Ahmed']).toEqual({ trust: 3, respect: 0, culture: 0 });
    expect(after2.impactByNpc['Sara']).toEqual({ trust: 0, respect: 2, culture: 1 });
  });

  it('sets a flag when the choice carries one', () => {
    const state = makeEmptyState();
    const choice = makeChoice({ flag: 'GREETED_IN_DIALECT' });
    const next = applyChoice(state, choice, 'Ahmed');
    expect(next.flags.has('GREETED_IN_DIALECT')).toBe(true);
  });

  it('does not mutate the original state', () => {
    const state = makeEmptyState();
    const choice = makeChoice({ score: 10, flag: 'TEST_FLAG' });
    applyChoice(state, choice, 'Ahmed');
    expect(state.totalScore).toBe(0);
    expect(state.flags.size).toBe(0);
  });

  it('appends a record to choiceHistory', () => {
    const state = makeEmptyState();
    const choice = makeChoice({ id: 'choice-99' });
    const fixedTimestamp = '2026-01-01T12:00:00.000Z';
    const next = applyChoice(state, choice, 'Ahmed', fixedTimestamp);
    expect(next.choiceHistory).toHaveLength(1);
    expect(next.choiceHistory[0].choiceId).toBe('choice-99');
    expect(next.choiceHistory[0].npcId).toBe('Ahmed');
    expect(next.choiceHistory[0].sceneId).toBe('scene-1');
    expect(next.choiceHistory[0].timestamp).toBe(fixedTimestamp);
  });

  it('handles a choice with no impact gracefully (impact defaults to 0s)', () => {
    const state = makeEmptyState();
    const choice = makeChoice({ impact: undefined });
    const next = applyChoice(state, choice, 'Ahmed');
    expect(next.impactByNpc['Ahmed']).toEqual({ trust: 0, respect: 0, culture: 0 });
  });
});

// ─── getTone ─────────────────────────────────────────────────────────────────

describe('getTone', () => {
  it('returns neutral when scene has no charDialogue', () => {
    const state = makeEmptyState();
    const scene = makeScene(); // no charDialogue
    expect(getTone(state, 'Ahmed', scene)).toBe('neutral');
  });

  it('returns warm when totalScore meets warmThreshold', () => {
    const state = { ...makeEmptyState(), totalScore: 15 };
    const scene = makeScene({
      warmThreshold: 15,
      coldThreshold: 5,
      charDialogue: {
        warm: { arabic: 'a', roman: 'a', english: 'a' },
        neutral: { arabic: 'b', roman: 'b', english: 'b' },
        cold: { arabic: 'c', roman: 'c', english: 'c' },
      },
    });
    expect(getTone(state, 'Ahmed', scene)).toBe('warm');
  });

  it('returns cold when totalScore is below coldThreshold', () => {
    const state = { ...makeEmptyState(), totalScore: 4 };
    const scene = makeScene({
      warmThreshold: 15,
      coldThreshold: 5,
      charDialogue: {
        warm: { arabic: 'a', roman: 'a', english: 'a' },
        neutral: { arabic: 'b', roman: 'b', english: 'b' },
        cold: { arabic: 'c', roman: 'c', english: 'c' },
      },
    });
    expect(getTone(state, 'Ahmed', scene)).toBe('cold');
  });

  it('returns neutral when score is between cold and warm thresholds', () => {
    const state = { ...makeEmptyState(), totalScore: 10 };
    const scene = makeScene({
      warmThreshold: 15,
      coldThreshold: 5,
      charDialogue: {
        warm: { arabic: 'a', roman: 'a', english: 'a' },
        neutral: { arabic: 'b', roman: 'b', english: 'b' },
        cold: { arabic: 'c', roman: 'c', english: 'c' },
      },
    });
    expect(getTone(state, 'Ahmed', scene)).toBe('neutral');
  });
});
