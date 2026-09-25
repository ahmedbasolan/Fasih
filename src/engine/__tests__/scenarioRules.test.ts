/**
 * Tests for the route-script content rules (src/engine/scenarioRules.ts).
 *
 * One fixture script satisfies every rule; each test breaks exactly one thing
 * and checks the matching rule catches it. The shipped scripts are checked
 * against the same rules in scenarioContent.test.ts.
 */
import { enumerateRuns, greedyRun, routeScriptProblems } from '../scenarioRules';
import type { ChoiceOutcome, ScenarioChoice, ScenarioEnding, ScenarioScene, ScenarioScript } from '../../types';

const IMPACT: Record<number, { trust: number; respect: number; culture: number }> = {
  6: { trust: 2, respect: 2, culture: 2 },
  5: { trust: 2, respect: 2, culture: 1 },
  3: { trust: 1, respect: 1, culture: 1 },
  [-3]: { trust: -1, respect: -1, culture: -1 },
};

function c(id: string, outcome: ChoiceOutcome, total: number, arabic: string, extra: Partial<ScenarioChoice> = {}): ScenarioChoice {
  return { id, text: id, arabic, roman: id, score: total, outcome, impact: IMPACT[total], ...extra };
}

function scene(id: string, kind: ScenarioScene['kind'], choices: ScenarioChoice[], extra: Partial<ScenarioScene> = {}): ScenarioScene {
  return { id, kind, charName: 'Faisal', charGender: 'male', setting: 's', arabic: 'ا', roman: 'a', english: 'a', choices, ...extra };
}

function ending(id: string, min: number, type: ScenarioEnding['type'], extra: Partial<ScenarioEnding> = {}): ScenarioEnding {
  return { id, min, type, title: id, arabic: 'ا', roman: 'a', en: id, desc: 'd', color: '#000000', hint: 'h', ...extra };
}

/**
 * Six decisions on every path: s1 → s2 → s3 (fork) → s4w | s4f → s5 → s6.
 * Greedy play ends at warm-strong; the hidden ending needs HIDDEN_A, which only
 * the second-best choice in s2 sets.
 */
function validScript(): ScenarioScript {
  return {
    id: 'fixture',
    title: 'Fixture',
    routes: [{ id: 'warm', label: 'Warm' }, { id: 'formal', label: 'Formal' }],
    defaultRoute: 'warm',
    scenes: [
      scene('s1', 'language', [c('a', 'excellent', 6, 'اا'), c('b', 'good', 3, 'بببب'), c('c', 'bad', -3, 'ج')]),
      scene('s2', 'judgement', [
        c('a', 'good', 6, 'دد', { route: 'warm' }),
        c('b', 'good', 5, 'ههههه', { route: 'formal', flag: 'HIDDEN_A' }),
        c('c', 'bad', -3, 'و'),
      ]),
      scene('s3', 'judgement', [
        c('a', 'good', 6, 'ز', { route: 'warm' }),
        c('b', 'good', 6, 'حح', { route: 'formal' }),
        c('c', 'bad', -3, 'ططط'),
      ], { nextByRoute: { warm: 's4w', formal: 's4f' } }),
      scene('s4w', 'judgement', [
        c('a', 'good', 6, 'ي', { route: 'warm', next: 's5' }),
        c('b', 'good', 5, 'كككك', { route: 'formal', next: 's5' }),
        c('c', 'bad', -3, 'ل', { next: 's5' }),
      ]),
      scene('s4f', 'judgement', [
        c('a', 'good', 6, 'م', { route: 'formal', next: 's5' }),
        c('b', 'good', 5, 'نننن', { route: 'warm', next: 's5' }),
        c('c', 'bad', -3, 'س', { next: 's5' }),
      ]),
      scene('s5', 'language', [c('a', 'excellent', 6, 'ع', { flag: 'HIDDEN_B' }), c('b', 'good', 3, 'فففف'), c('c', 'bad', -3, 'ص')]),
      scene('s6', 'language', [c('a', 'excellent', 6, 'ق'), c('b', 'good', 3, 'رررر'), c('c', 'bad', -3, 'ش')]),
    ],
    endings: [
      ending('hidden', 30, 'exceptional', { secret: true, requiredFlags: ['HIDDEN_A', 'HIDDEN_B'] }),
      ending('warm-strong', 28, 'success', { route: 'warm', tier: 'strong' }),
      ending('warm-weak', 10, 'mixed', { route: 'warm', tier: 'weak' }),
      ending('formal-strong', 28, 'success', { route: 'formal', tier: 'strong' }),
      ending('formal-weak', 10, 'mixed', { route: 'formal', tier: 'weak' }),
      ending('failure', 0, 'failed', { hint: undefined }),
    ],
    phrases: { core: ['p1'], byEnding: { 'warm-strong': ['p2'] } },
  };
}

const PHRASE_IDS = new Set(['p1', 'p2']);

/** Deep-ish clone so a test can break one thing without touching the others. */
function broken(mutate: (s: ScenarioScript) => void): ScenarioScript {
  const s = validScript();
  mutate(s);
  return s;
}

const sceneOf = (s: ScenarioScript, id: string) => s.scenes.find(x => x.id === id)!;
const endingOf = (s: ScenarioScript, id: string) => s.endings.find(x => x.id === id)!;
const problems = (s: ScenarioScript) => routeScriptProblems(s, PHRASE_IDS);
const hasProblem = (s: ScenarioScript, rule: string) => problems(s).some(p => p.startsWith(`${rule}:`));

describe('enumerateRuns / greedyRun', () => {
  it('walks every path, honouring the fork', () => {
    const runs = enumerateRuns(validScript());
    expect(runs).toHaveLength(3 ** 6);
    expect(runs.every(r => r.steps.length === 6)).toBe(true);
    expect(runs.some(r => r.steps.some(st => st.sceneId === 's4f'))).toBe(true);
    expect(runs.some(r => r.steps.some(st => st.sceneId === 's4w'))).toBe(true);
    expect(runs.some(r => r.steps.some(st => st.sceneId === 's4w') && r.steps.some(st => st.sceneId === 's4f'))).toBe(false);
  });

  it('greedy takes the top-scoring visible choice, first on a tie', () => {
    const run = greedyRun(validScript());
    expect(run.steps.map(st => `${st.sceneId}/${st.choice.id}`)).toEqual(['s1/a', 's2/a', 's3/a', 's4w/a', 's5/a', 's6/a']);
    expect(run.ending.id).toBe('warm-strong');
  });

  it('fails loudly past the run cap instead of checking the rules on a partial set', () => {
    // 3 choices × 11 linear scenes = 177,147 paths.
    const huge = broken(s => {
      s.scenes = Array.from({ length: 11 }, (_, i) => ({ ...sceneOf(s, 's1'), id: `s${i}` }));
    });
    expect(() => enumerateRuns(huge)).toThrow('fixture');
  });
});

describe('routeScriptProblems', () => {
  it('passes a script that follows every rule', () => {
    expect(problems(validScript())).toEqual([]);
  });

  it('structure: every scene declares a kind', () => {
    expect(hasProblem(broken(s => { delete sceneOf(s, 's1').kind; }), 'kind')).toBe(true);
  });

  it('routes: defaultRoute and every route tag must be declared', () => {
    expect(hasProblem(broken(s => { s.defaultRoute = 'nope'; }), 'route')).toBe(true);
    expect(hasProblem(broken(s => { sceneOf(s, 's2').choices[0].route = 'nope'; }), 'route')).toBe(true);
  });

  it('fork: nextByRoute keys are routes and targets are scenes', () => {
    expect(hasProblem(broken(s => { sceneOf(s, 's3').nextByRoute = { warm: 's4w', nope: 's4f' }; }), 'fork')).toBe(true);
    expect(hasProblem(broken(s => { sceneOf(s, 's3').nextByRoute = { warm: 's4w', formal: 'missing' }; }), 'fork')).toBe(true);
  });

  it('fork: variant scenes route every choice explicitly', () => {
    const s = broken(x => { for (const ch of sceneOf(x, 's4w').choices) delete ch.next; });
    expect(hasProblem(s, 'fork')).toBe(true);
    expect(hasProblem(s, 'decisions')).toBe(true); // s4w now falls through into s4f
  });

  it('endings: one hidden, one failure, a strong+weak pair per route, unique ids', () => {
    expect(hasProblem(broken(s => { s.endings = s.endings.filter(e => e.id !== 'failure'); }), 'endings')).toBe(true);
    expect(hasProblem(broken(s => { s.endings = s.endings.filter(e => e.id !== 'formal-weak'); }), 'endings')).toBe(true);
    expect(hasProblem(broken(s => { s.endings = s.endings.filter(e => !e.secret); }), 'endings')).toBe(true);
    expect(hasProblem(broken(s => { endingOf(s, 'formal-weak').id = 'warm-weak'; }), 'endings')).toBe(true);
    expect(hasProblem(broken(s => { endingOf(s, 'warm-weak').min = 28; }), 'endings')).toBe(true);
  });

  it('endings: type follows the tier', () => {
    expect(hasProblem(broken(s => { endingOf(s, 'warm-weak').type = 'success'; }), 'type')).toBe(true);
  });

  it('endings: every ending except failure carries a hint', () => {
    expect(hasProblem(broken(s => { delete endingOf(s, 'warm-strong').hint; }), 'hint')).toBe(true);
  });

  it('rule 1 — greedy play must not reach the hidden ending', () => {
    const s = broken(x => {
      delete sceneOf(x, 's2').choices[1].flag;
      sceneOf(x, 's2').choices[0].flag = 'HIDDEN_A';
    });
    expect(hasProblem(s, 'greedy')).toBe(true);
  });

  it('rule 2 — the hidden ending needs 2+ flags from different scenes, one off the top choice', () => {
    expect(hasProblem(broken(s => { endingOf(s, 'hidden').requiredFlags = ['HIDDEN_B']; }), 'hidden-flags')).toBe(true);
    expect(hasProblem(broken(s => {
      delete sceneOf(s, 's2').choices[1].flag;
      sceneOf(s, 's5').choices[1].flag = 'HIDDEN_A'; // both flags now set in s5
    }), 'hidden-flags')).toBe(true);
  });

  it('rule 3 — every ending is reachable', () => {
    const s = broken(x => { endingOf(x, 'formal-strong').min = 99; });
    expect(problems(s)).toContain('unreachable: formal-strong');
  });

  it('rule 4 — every path makes the same number of decisions', () => {
    const s = broken(x => { x.scenes = x.scenes.filter(sc => sc.id !== 's6'); });
    expect(hasProblem(s, 'decisions')).toBe(true);
  });

  it('rule 5 — judgement scenes offer 2+ valid choices on different routes', () => {
    expect(hasProblem(broken(s => { sceneOf(s, 's2').choices[1].route = 'warm'; }), 'judgement')).toBe(true);
    expect(hasProblem(broken(s => { delete sceneOf(s, 's2').choices[1].route; }), 'judgement')).toBe(true);
  });

  it('rule 6 — language scenes: no route tags, exactly one excellent', () => {
    expect(hasProblem(broken(s => { sceneOf(s, 's1').choices[0].route = 'warm'; }), 'language')).toBe(true);
    expect(hasProblem(broken(s => { sceneOf(s, 's1').choices[1].outcome = 'excellent'; }), 'language')).toBe(true);
  });

  it('rule 7 — the top choice is not usually the longest line', () => {
    const s = broken(x => {
      for (const sc of x.scenes) sc.choices[0].arabic = 'ــــــــــــــــــ';
    });
    expect(hasProblem(s, 'longest')).toBe(true);
  });

  it('rule 10 — phrases resolve and byEnding keys are real endings', () => {
    expect(hasProblem(broken(s => { s.phrases.core.push('zzz'); }), 'phrases')).toBe(true);
    expect(hasProblem(broken(s => { s.phrases.byEnding.nope = ['p1']; }), 'phrases')).toBe(true);
    expect(hasProblem(broken(s => { s.phrases.core = []; }), 'phrases')).toBe(true);
  });

  it('rule 12 — a scene that addresses the learner has female-learner lines', () => {
    expect(hasProblem(broken(s => { sceneOf(s, 's1').addressesLearner = true; }), 'female')).toBe(true);
    expect(problems(broken(s => {
      sceneOf(s, 's1').addressesLearner = true;
      sceneOf(s, 's1').femaleLearner = { arabic: 'ا', roman: 'a', english: 'a' };
    }))).toEqual([]);
  });

  it('one misstep in an otherwise valid run never fails', () => {
    const s = broken(x => {
      endingOf(x, 'warm-weak').min = 20;
      endingOf(x, 'formal-weak').min = 20;
    });
    expect(hasProblem(s, 'misstep')).toBe(true);
  });
});
