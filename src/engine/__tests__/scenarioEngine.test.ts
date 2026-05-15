import { applyChoice, getTone, resolveNextScene, evaluateEnding, isChoiceVisible } from '../scenarioEngine';
import type { ScenarioState, ScenarioChoice, ScenarioScene, ScenarioScript, ScenarioEnding } from '../../types';

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

// ─── Shared script fixture ────────────────────────────────────────────────────

function makeScript(overrides: Partial<ScenarioScript> = {}): ScenarioScript {
  return {
    id: 'test-scenario',
    title: 'Test Scenario',
    scenes: [
      { ...makeScene(), id: 'scene-1', choices: [makeChoice()] },
      { ...makeScene(), id: 'scene-2', choices: [makeChoice()] },
      { ...makeScene(), id: 'scene-3', choices: [makeChoice()] },
    ],
    endings: [
      { min: 20, title: 'Exceptional', arabic: 'ممتاز', roman: 'mumtaz', en: 'Exceptional', desc: 'Excellent outcome', color: '#00FF00', type: 'exceptional' },
      { min: 10, title: 'Good',        arabic: 'جيد',   roman: 'jayid',  en: 'Good',        desc: 'Good outcome',      color: '#FFFF00', type: 'success'     },
      { min: 0,  title: 'Mixed',       arabic: 'مقبول', roman: 'maqbul', en: 'Mixed',       desc: 'Mixed outcome',     color: '#FFA500', type: 'mixed'       },
      { min: -99,title: 'Failed',      arabic: 'فشل',   roman: 'fashal', en: 'Failed',      desc: 'Failed outcome',    color: '#FF0000', type: 'failed'      },
    ],
    ...overrides,
  };
}

// ─── resolveNextScene ─────────────────────────────────────────────────────────

describe('resolveNextScene', () => {
  it('returns choice.next when the choice specifies an explicit branch', () => {
    const state = { ...makeEmptyState(), currentSceneId: 'scene-1' };
    const choice = makeChoice({ next: 'scene-3' });
    const script = makeScript();
    expect(resolveNextScene(state, choice, script)).toBe('scene-3');
  });

  it('returns the next scene in order when choice has no next', () => {
    const state = { ...makeEmptyState(), currentSceneId: 'scene-1' };
    const choice = makeChoice({ next: undefined });
    const script = makeScript();
    expect(resolveNextScene(state, choice, script)).toBe('scene-2');
  });

  it('returns null when on the last scene and choice has no next', () => {
    const state = { ...makeEmptyState(), currentSceneId: 'scene-3' };
    const choice = makeChoice({ next: undefined });
    const script = makeScript();
    expect(resolveNextScene(state, choice, script)).toBeNull();
  });
});

// ─── evaluateEnding ───────────────────────────────────────────────────────────

describe('evaluateEnding', () => {
  it('returns exceptional ending when totalScore is 20+', () => {
    const state = { ...makeEmptyState(), totalScore: 22 };
    const ending = evaluateEnding(state, makeScript());
    expect(ending.type).toBe('exceptional');
  });

  it('returns success ending when totalScore is 10-19', () => {
    const state = { ...makeEmptyState(), totalScore: 12 };
    const ending = evaluateEnding(state, makeScript());
    expect(ending.type).toBe('success');
  });

  it('returns mixed ending when totalScore is 0-9', () => {
    const state = { ...makeEmptyState(), totalScore: 4 };
    const ending = evaluateEnding(state, makeScript());
    expect(ending.type).toBe('mixed');
  });

  it('falls back to last ending when no standard ending matches', () => {
    const state = { ...makeEmptyState(), totalScore: -50 };
    const ending = evaluateEnding(state, makeScript());
    expect(ending.type).toBe('failed');
  });

  it('returns secret ending when requiredFlags met AND score >= min', () => {
    const state = {
      ...makeEmptyState(),
      totalScore: 25,
      flags: new Set(['FLAG_A', 'FLAG_B']),
    };
    const script = makeScript({
      endings: [
        ...makeScript().endings,
        {
          min: 20, title: 'Secret', arabic: 'سري', roman: 'sirri', en: 'Secret',
          desc: 'Rare ending', color: '#8B00FF', type: 'exceptional' as const,
          secret: true, requiredFlags: ['FLAG_A', 'FLAG_B'],
        },
      ],
    });
    const ending = evaluateEnding(state, script);
    expect(ending.secret).toBe(true);
    expect(ending.title).toBe('Secret');
  });

  it('does NOT return secret ending when requiredFlags not all set', () => {
    const state = {
      ...makeEmptyState(),
      totalScore: 25,
      flags: new Set(['FLAG_A']),
    };
    const script = makeScript({
      endings: [
        ...makeScript().endings,
        {
          min: 20, title: 'Secret', arabic: 'سري', roman: 'sirri', en: 'Secret',
          desc: 'Rare ending', color: '#8B00FF', type: 'exceptional' as const,
          secret: true, requiredFlags: ['FLAG_A', 'FLAG_B'],
        },
      ],
    });
    const ending = evaluateEnding(state, script);
    expect(ending.secret).not.toBe(true);
  });

  it('does NOT return secret ending when score is below secret min', () => {
    const state = {
      ...makeEmptyState(),
      totalScore: 15,
      flags: new Set(['FLAG_A', 'FLAG_B']),
    };
    const script = makeScript({
      endings: [
        ...makeScript().endings,
        {
          min: 20, title: 'Secret', arabic: 'سري', roman: 'sirri', en: 'Secret',
          desc: 'Rare ending', color: '#8B00FF', type: 'exceptional' as const,
          secret: true, requiredFlags: ['FLAG_A', 'FLAG_B'],
        },
      ],
    });
    const ending = evaluateEnding(state, script);
    expect(ending.secret).not.toBe(true);
  });
});

// ─── isChoiceVisible ─────────────────────────────────────────────────────────

describe('isChoiceVisible', () => {
  it('returns true for any choice (all choices visible in current implementation)', () => {
    const state = makeEmptyState();
    const choice = makeChoice();
    expect(isChoiceVisible(choice, state)).toBe(true);
  });
});
