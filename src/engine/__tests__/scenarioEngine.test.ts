import {
  applyChoice,
  getTone,
  resolveNextScene,
  evaluateEnding,
  isChoiceVisible,
  impactTotal,
  npcRelationship,
  relationshipScore,
  leadingRoute,
  phrasesEarned,
  allPhraseIds,
} from '../scenarioEngine';
import type { ScenarioState, ScenarioChoice, ScenarioScene, ScenarioScript, ScenarioEnding } from '../../types';

/** Build an impactByNpc map from plain totals, splitting each across the three meters. */
function impactOf(trust: number, respect: number, culture: number) {
  return { trust, respect, culture };
}

// ─── Shared test fixtures ─────────────────────────────────────────────────────

function makeEmptyState(scenarioId = 'test-scenario', sceneId = 'scene-1'): ScenarioState {
  return {
    scenarioId,
    currentSceneId: sceneId,
    flags: new Set(),
    impactByNpc: {},
    totalScore: 0,
    scoreByNpc: {},
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

describe('relationship scoring helpers', () => {
  it('impactTotal sums the three meters', () => {
    expect(impactTotal({ trust: 2, respect: 3, culture: -1 })).toBe(4);
  });

  it('npcRelationship returns 0 for an NPC not yet met', () => {
    expect(npcRelationship(makeEmptyState(), 'Nobody')).toBe(0);
  });

  it('relationshipScore sums across every NPC', () => {
    const state = {
      ...makeEmptyState(),
      impactByNpc: { Ahmed: impactOf(2, 2, 2), Sara: impactOf(1, 0, -1) },
    };
    expect(relationshipScore(state)).toBe(6);
  });
});

describe('getTone', () => {
  const tonedScene = (warmThreshold: number, coldThreshold: number) =>
    makeScene({
      warmThreshold,
      coldThreshold,
      charDialogue: {
        warm: { arabic: 'a', roman: 'a', english: 'a' },
        neutral: { arabic: 'b', roman: 'b', english: 'b' },
        cold: { arabic: 'c', roman: 'c', english: 'c' },
      },
    });

  it('returns neutral when scene has no charDialogue', () => {
    const state = makeEmptyState();
    const scene = makeScene(); // no charDialogue
    expect(getTone(state, 'Ahmed', scene)).toBe('neutral');
  });

  it('returns warm when the NPC relationship meets warmThreshold', () => {
    const state = { ...makeEmptyState(), impactByNpc: { Ahmed: impactOf(5, 5, 5) } };
    expect(getTone(state, 'Ahmed', tonedScene(15, 5))).toBe('warm');
  });

  it('returns cold when the NPC relationship is below coldThreshold', () => {
    const state = { ...makeEmptyState(), impactByNpc: { Ahmed: impactOf(2, 1, 1) } };
    expect(getTone(state, 'Ahmed', tonedScene(15, 5))).toBe('cold');
  });

  it('returns neutral between the cold and warm thresholds', () => {
    const state = { ...makeEmptyState(), impactByNpc: { Ahmed: impactOf(4, 3, 3) } };
    expect(getTone(state, 'Ahmed', tonedScene(15, 5))).toBe('neutral');
  });

  it('ignores totalScore entirely — only the meters count', () => {
    // A run that banked a big XP score but burned the relationship still reads cold.
    const state = {
      ...makeEmptyState(),
      totalScore: 100,
      scoreByNpc: { Ahmed: 100 },
      impactByNpc: { Ahmed: impactOf(-1, -1, -1) },
    };
    expect(getTone(state, 'Ahmed', tonedScene(15, 5))).toBe('cold');
  });

  it('a trust cost actually changes the tone the learner sees', () => {
    // Two choices with identical XP score but divergent meters must not be equivalent.
    const warmChoice = makeChoice({ score: 5, impact: impactOf(3, 3, 3) });
    const costlyChoice = makeChoice({ score: 5, impact: impactOf(-3, 1, 1) });
    const scene = tonedScene(6, 0);
    expect(getTone(applyChoice(makeEmptyState(), warmChoice, 'Ahmed'), 'Ahmed', scene)).toBe('warm');
    expect(getTone(applyChoice(makeEmptyState(), costlyChoice, 'Ahmed'), 'Ahmed', scene)).toBe('cold');
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
      { id: 'exceptional', min: 20, title: 'Exceptional', arabic: 'ممتاز', roman: 'mumtaz', en: 'Exceptional', desc: 'Excellent outcome', color: '#00FF00', type: 'exceptional' },
      { id: 'good', min: 10, title: 'Good',        arabic: 'جيد',   roman: 'jayid',  en: 'Good',        desc: 'Good outcome',      color: '#FFFF00', type: 'success'     },
      { id: 'mixed', min: 0,  title: 'Mixed',       arabic: 'مقبول', roman: 'maqbul', en: 'Mixed',       desc: 'Mixed outcome',     color: '#FFA500', type: 'mixed'       },
      { id: 'failed', min: -99,title: 'Failed',      arabic: 'فشل',   roman: 'fashal', en: 'Failed',      desc: 'Failed outcome',    color: '#FF0000', type: 'failed'      },
    ],
    phrases: { core: [], byEnding: {} },
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

  // Characterizes existing (surprising) behavior — do not "fix" this without
  // checking callers first: findIndex returns -1 for an unknown sceneId, and
  // -1 + 1 = 0, so this silently returns the FIRST scene's id instead of null.
  it('returns the first scene id (not null) when currentSceneId matches no scene in the script', () => {
    const state = { ...makeEmptyState(), currentSceneId: 'does-not-exist' };
    const choice = makeChoice({ next: undefined });
    const script = makeScript();
    expect(resolveNextScene(state, choice, script)).toBe('scene-1');
  });
});

// ─── evaluateEnding ───────────────────────────────────────────────────────────

/** State whose total relationship score across all NPCs equals `n`. */
function stateWithRelationship(n: number, extra: Partial<ScenarioState> = {}): ScenarioState {
  return { ...makeEmptyState(), impactByNpc: { Ahmed: impactOf(n, 0, 0) }, ...extra };
}

describe('evaluateEnding', () => {
  it('returns exceptional ending when relationship score is 20+', () => {
    const ending = evaluateEnding(stateWithRelationship(22), makeScript());
    expect(ending.type).toBe('exceptional');
  });

  it('returns success ending when relationship score is 10-19', () => {
    const ending = evaluateEnding(stateWithRelationship(12), makeScript());
    expect(ending.type).toBe('success');
  });

  it('returns mixed ending when relationship score is 0-9', () => {
    const ending = evaluateEnding(stateWithRelationship(4), makeScript());
    expect(ending.type).toBe('mixed');
  });

  it('falls back to last ending when no standard ending matches', () => {
    const ending = evaluateEnding(stateWithRelationship(-50), makeScript());
    expect(ending.type).toBe('failed');
  });

  it('sums the relationship across every NPC in the run', () => {
    const state = {
      ...makeEmptyState(),
      impactByNpc: { Ahmed: impactOf(4, 4, 4), Sara: impactOf(4, 3, 3) },
    };
    expect(evaluateEnding(state, makeScript()).type).toBe('exceptional'); // 12 + 10 = 22
  });

  it('ignores totalScore — a high XP run with a burnt relationship still fails', () => {
    const state = { ...stateWithRelationship(-5), totalScore: 90, scoreByNpc: { Ahmed: 90 } };
    expect(evaluateEnding(state, makeScript()).type).toBe('failed');
  });

  it('returns secret ending when requiredFlags met AND score >= min', () => {
    const state = stateWithRelationship(25, { flags: new Set(['FLAG_A', 'FLAG_B']) });
    const script = makeScript({
      endings: [
        ...makeScript().endings,
        {
          id: 'secret', min: 20, title: 'Secret', arabic: 'سري', roman: 'sirri', en: 'Secret',
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
    const state = stateWithRelationship(25, { flags: new Set(['FLAG_A']) });
    const script = makeScript({
      endings: [
        ...makeScript().endings,
        {
          id: 'secret', min: 20, title: 'Secret', arabic: 'سري', roman: 'sirri', en: 'Secret',
          desc: 'Rare ending', color: '#8B00FF', type: 'exceptional' as const,
          secret: true, requiredFlags: ['FLAG_A', 'FLAG_B'],
        },
      ],
    });
    const ending = evaluateEnding(state, script);
    expect(ending.secret).not.toBe(true);
  });

  it('does NOT return secret ending when score is below secret min', () => {
    const state = stateWithRelationship(15, { flags: new Set(['FLAG_A', 'FLAG_B']) });
    const script = makeScript({
      endings: [
        ...makeScript().endings,
        {
          id: 'secret', min: 20, title: 'Secret', arabic: 'سري', roman: 'sirri', en: 'Secret',
          desc: 'Rare ending', color: '#8B00FF', type: 'exceptional' as const,
          secret: true, requiredFlags: ['FLAG_A', 'FLAG_B'],
        },
      ],
    });
    const ending = evaluateEnding(state, script);
    expect(ending.secret).not.toBe(true);
  });

  it('throws when script has no standard (non-secret) endings', () => {
    const state = makeEmptyState();
    const script = makeScript({
      endings: [
        {
          id: 'secret', min: 20, title: 'Secret', arabic: 'سري', roman: 'sirri', en: 'Secret',
          desc: 'Only ending', color: '#8B00FF', type: 'exceptional' as const,
          secret: true, requiredFlags: [],
        },
      ],
    });
    expect(() => evaluateEnding(state, script)).toThrow('evaluateEnding: script "test-scenario" has no standard endings');
  });
});

// ─── isChoiceVisible ─────────────────────────────────────────────────────────

describe('isChoiceVisible', () => {
  it('returns true when choice has no requiredFlag', () => {
    const state = makeEmptyState();
    const choice = makeChoice(); // no requiredFlag
    expect(isChoiceVisible(choice, state)).toBe(true);
  });

  it('returns false when requiredFlag is not in state.flags', () => {
    const state = makeEmptyState(); // flags = empty Set
    const choice = makeChoice({ requiredFlag: 'GREETED_IN_DIALECT' });
    expect(isChoiceVisible(choice, state)).toBe(false);
  });

  it('returns true when requiredFlag IS in state.flags', () => {
    const state = { ...makeEmptyState(), flags: new Set(['GREETED_IN_DIALECT']) };
    const choice = makeChoice({ requiredFlag: 'GREETED_IN_DIALECT' });
    expect(isChoiceVisible(choice, state)).toBe(true);
  });
});

// ─── scoreByNpc ───────────────────────────────────────────────────────────────

describe('applyChoice → scoreByNpc', () => {
  it('accumulates choice.score per NPC into scoreByNpc', () => {
    const state = makeEmptyState();
    const c1 = makeChoice({ id: 'c1', score: 4 });
    const c2 = makeChoice({ id: 'c2', score: 2 });
    const after1 = applyChoice(state, c1, 'Amira');
    const after2 = applyChoice(after1, c2, 'Amira');
    expect(after2.scoreByNpc['Amira']).toBe(6);
  });

  it('tracks scores independently per NPC', () => {
    const state = makeEmptyState();
    const c1 = makeChoice({ id: 'c1', score: 5 });
    const c2 = makeChoice({ id: 'c2', score: 3 });
    const after1 = applyChoice(state, c1, 'Amira');
    const after2 = applyChoice(after1, c2, 'Tariq');
    expect(after2.scoreByNpc['Amira']).toBe(5);
    expect(after2.scoreByNpc['Tariq']).toBe(3);
  });
});

// ─── getTone (per-NPC) ────────────────────────────────────────────────────────

describe('getTone per-NPC', () => {
  const sceneWithDialogue = makeScene({
    warmThreshold: 8,
    coldThreshold: 3,
    charDialogue: {
      warm: { arabic: 'a', roman: 'a', english: 'a' },
      neutral: { arabic: 'b', roman: 'b', english: 'b' },
      cold: { arabic: 'c', roman: 'c', english: 'c' },
    },
  });

  // Amira relationship = 10 (warm), Tariq = 1 (cold). Each NPC judges you on
  // how YOU treated THEM — being liked by one does not warm up the other.
  const twoNpcState: ScenarioState = {
    ...makeEmptyState(),
    impactByNpc: { Amira: impactOf(4, 3, 3), Tariq: impactOf(1, 0, 0) },
  };

  it('reads the scene NPC relationship, not the run total', () => {
    expect(getTone(twoNpcState, 'Amira', sceneWithDialogue)).toBe('warm');
  });

  it('tracks Tariq independently from Amira', () => {
    expect(getTone(twoNpcState, 'Tariq', sceneWithDialogue)).toBe('cold');
  });

  it('treats an NPC not yet met as a blank slate (score 0)', () => {
    expect(getTone(twoNpcState, 'Unknown', sceneWithDialogue)).toBe('cold');
  });
});

// ─── Route scripts (spec 2026-09-14 §2.1) ─────────────────────────────────────

function routeEnding(overrides: Partial<ScenarioEnding> & Pick<ScenarioEnding, 'id' | 'min' | 'type'>): ScenarioEnding {
  return {
    title: overrides.id, arabic: 'ا', roman: 'a', en: overrides.id, desc: 'd', color: '#000000',
    ...overrides,
  };
}

/**
 * s1 → s2 → s3 (fork) → s4w | s4f → s5. Choice `w` leans warm, `f` leans
 * formal, `x` has no route.
 */
function makeRouteScript(overrides: Partial<ScenarioScript> = {}): ScenarioScript {
  const w = makeChoice({ id: 'w', route: 'warm' });
  const f = makeChoice({ id: 'f', route: 'formal' });
  const x = makeChoice({ id: 'x' });
  return {
    id: 'route-scenario',
    title: 'Route Scenario',
    routes: [{ id: 'warm', label: 'Warm' }, { id: 'formal', label: 'Formal' }],
    defaultRoute: 'warm',
    scenes: [
      makeScene({ id: 's1', choices: [w, f, x] }),
      makeScene({ id: 's2', choices: [w, f, x] }),
      makeScene({ id: 's3', choices: [w, f, x], nextByRoute: { warm: 's4w', formal: 's4f' } }),
      makeScene({ id: 's4w', choices: [{ ...w, next: 's5' }] }),
      makeScene({ id: 's4f', choices: [{ ...f, next: 's5' }] }),
      makeScene({ id: 's5', choices: [x] }),
    ],
    endings: [
      routeEnding({ id: 'hidden', min: 20, type: 'exceptional', secret: true, requiredFlags: ['A', 'B'] }),
      routeEnding({ id: 'warm-strong', min: 15, type: 'success', route: 'warm', tier: 'strong' }),
      routeEnding({ id: 'warm-weak', min: 5, type: 'mixed', route: 'warm', tier: 'weak' }),
      routeEnding({ id: 'formal-strong', min: 12, type: 'success', route: 'formal', tier: 'strong' }),
      routeEnding({ id: 'formal-weak', min: 4, type: 'mixed', route: 'formal', tier: 'weak' }),
      routeEnding({ id: 'failure', min: 0, type: 'failed' }),
    ],
    phrases: { core: ['p-core'], byEnding: { 'warm-strong': ['p-warm'], hidden: ['p-hidden', 'p-core'] } },
    ...overrides,
  };
}

/** History of choice ids made at the given scenes, in order. */
function withHistory(state: ScenarioState, picks: [sceneId: string, choiceId: string][]): ScenarioState {
  return {
    ...state,
    choiceHistory: picks.map(([sceneId, choiceId]) => ({ sceneId, choiceId, npcId: 'Ahmed', timestamp: '' })),
  };
}

describe('leadingRoute', () => {
  const script = makeRouteScript();

  it('is null for a legacy script with no routes', () => {
    expect(leadingRoute(makeEmptyState(), makeScript())).toBeNull();
  });

  it('falls back to defaultRoute when no tagged choice has been made', () => {
    expect(leadingRoute(withHistory(makeEmptyState(), [['s1', 'x']]), script)).toBe('warm');
  });

  it('picks the route tagged most often', () => {
    const state = withHistory(makeEmptyState(), [['s1', 'f'], ['s2', 'w'], ['s3', 'f']]);
    expect(leadingRoute(state, script)).toBe('formal');
  });

  it('breaks a tie with the most recent tagged choice', () => {
    expect(leadingRoute(withHistory(makeEmptyState(), [['s1', 'w'], ['s2', 'f']]), script)).toBe('formal');
    expect(leadingRoute(withHistory(makeEmptyState(), [['s1', 'f'], ['s2', 'w']]), script)).toBe('warm');
  });

  it('looks choices up by scene — the same choice id in another scene is a different choice', () => {
    const tagged = makeRouteScript({
      scenes: [
        makeScene({ id: 's1', choices: [makeChoice({ id: 'a', route: 'formal' })] }),
        makeScene({ id: 's2', choices: [makeChoice({ id: 'a' })] }),
      ],
    });
    expect(leadingRoute(withHistory(makeEmptyState(), [['s1', 'a'], ['s2', 'a']]), tagged)).toBe('formal');
  });
});

describe('resolveNextScene — fork', () => {
  const script = makeRouteScript();
  const formal = script.scenes[2].choices[1];
  const warm = script.scenes[2].choices[0];

  it('sends the run to the leading route’s scene, counting the choice being made', () => {
    // One warm tag so far; choosing formal at the fork ties 1–1 and the pending
    // choice is the most recent, so formal wins.
    const state = withHistory({ ...makeEmptyState(), currentSceneId: 's3' }, [['s1', 'w']]);
    expect(resolveNextScene(state, formal, script)).toBe('s4f');
    expect(resolveNextScene(state, warm, script)).toBe('s4w');
  });

  it('uses defaultRoute at the fork when nothing leans anywhere', () => {
    const state = { ...makeEmptyState(), currentSceneId: 's3' };
    expect(resolveNextScene(state, script.scenes[2].choices[2], script)).toBe('s4w');
  });

  it('a choice’s own next still beats the fork', () => {
    const state = { ...makeEmptyState(), currentSceneId: 's3' };
    expect(resolveNextScene(state, { ...formal, next: 's5' }, script)).toBe('s5');
  });

  it('variant scenes merge back through their choices’ next', () => {
    const state = { ...makeEmptyState(), currentSceneId: 's4w' };
    expect(resolveNextScene(state, script.scenes[3].choices[0], script)).toBe('s5');
  });
});

describe('evaluateEnding — route scripts', () => {
  const script = makeRouteScript();
  const run = (score: number, picks: [string, string][], flags: string[] = []) =>
    withHistory(stateWithRelationship(score, { flags: new Set(flags) }), picks);

  it('returns the strong version of the leading destination when the meters clear its min', () => {
    expect(evaluateEnding(run(15, [['s1', 'w']]), script).id).toBe('warm-strong');
    expect(evaluateEnding(run(12, [['s1', 'f']]), script).id).toBe('formal-strong');
  });

  it('returns the weak version below the strong min', () => {
    expect(evaluateEnding(run(14, [['s1', 'w']]), script).id).toBe('warm-weak');
  });

  it('the same score lands on different destinations depending on the route', () => {
    expect(evaluateEnding(run(13, [['s1', 'w']]), script).id).toBe('warm-weak');
    expect(evaluateEnding(run(13, [['s1', 'f']]), script).id).toBe('formal-strong');
  });

  it('returns the failure ending below the destination’s weak min', () => {
    expect(evaluateEnding(run(4, [['s1', 'w']]), script).id).toBe('failure');
    expect(evaluateEnding(run(4, [['s1', 'f']]), script).id).toBe('formal-weak');
  });

  it('the hidden ending still needs its flags AND its score', () => {
    expect(evaluateEnding(run(20, [['s1', 'w']], ['A', 'B']), script).id).toBe('hidden');
    expect(evaluateEnding(run(20, [['s1', 'w']], ['A']), script).id).toBe('warm-strong');
    expect(evaluateEnding(run(19, [['s1', 'w']], ['A', 'B']), script).id).toBe('warm-strong');
  });

  it('uses defaultRoute when the run never leaned anywhere', () => {
    expect(evaluateEnding(run(15, [['s1', 'x']]), script).id).toBe('warm-strong');
  });

  it('throws when the leading route has no strong/weak pair', () => {
    const broken = makeRouteScript({ endings: script.endings.filter(e => e.id !== 'formal-weak') });
    expect(() => evaluateEnding(run(1, [['s1', 'f']]), broken)).toThrow('route-scenario');
  });
});

describe('phrasesEarned / allPhraseIds', () => {
  const script = makeRouteScript();
  const endingById = (id: string) => script.endings.find(e => e.id === id)!;

  it('grants core phrases on any ending, failure included', () => {
    expect(phrasesEarned(script, endingById('failure'))).toEqual(['p-core']);
  });

  it('adds the phrases of the ending reached, without duplicates', () => {
    expect(phrasesEarned(script, endingById('warm-strong'))).toEqual(['p-core', 'p-warm']);
    expect(phrasesEarned(script, endingById('hidden'))).toEqual(['p-core', 'p-hidden']);
  });

  it('allPhraseIds lists everything the scenario can teach, once each', () => {
    expect(allPhraseIds(script)).toEqual(['p-core', 'p-warm', 'p-hidden']);
  });
});
