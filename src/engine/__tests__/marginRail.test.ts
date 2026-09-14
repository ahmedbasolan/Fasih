import { choiceSceneCount, railMarks } from '../marginRail';
import { getScenarioScripts, getAllScenarios } from '../../constants/scenarios';
import { darkTheme } from '../../components/design/tokens';
import type { ScenarioScript, ScenarioState, ChoiceOutcome } from '../../types';

const scripts = getScenarioScripts(darkTheme);

describe('choiceSceneCount', () => {
  it('counts scenes that present a choice', () => {
    const script = {
      id: 't', title: 't',
      scenes: [
        { id: 's1', choices: [{ id: 'a' }, { id: 'b' }] },
        { id: 's2', choices: [] },
        { id: 's3', choices: [{ id: 'c' }] },
      ],
      endings: [],
    } as unknown as ScenarioScript;
    expect(choiceSceneCount(script)).toBe(2);
  });

  it('excludes bonus scenes, which only appear on the secret path', () => {
    const script = {
      id: 't', title: 't',
      scenes: [
        { id: 's1', choices: [{ id: 'a' }] },
        { id: 's2', choices: [{ id: 'b' }], bonus: true },
      ],
      endings: [],
    } as unknown as ScenarioScript;
    expect(choiceSceneCount(script)).toBe(1);
  });
});

describe('authored decision counts are within their script', () => {
  /**
   * A BOUND, not an equality.
   *
   * The first draft of this suite asserted `Scenario.decisions` equalled the
   * script's choice-scene count, and it failed on three scenarios. The data
   * was right and the assertion was wrong: scripts branch, so the choice-scene
   * count is the upper bound on a run, not the length of one. `social_taxi_ride`
   * has 7 choice-scenes, of which `c2_open`/`c2_effort` and
   * `c3_ronaldo`/`c3_dubai` are mutually exclusive, so a run makes 5 decisions
   * — exactly what its metadata says.
   *
   * This still catches what it needs to: a decisions count of 0, or one larger
   * than the script could possibly deliver.
   */
  /**
   * Scenarios outside their bound, recorded rather than quietly corrected.
   *
   * Same ratchet as `languageContent.test.ts`: a known violation stays visible
   * in source, and any NEW one fails immediately. The allowlist is asserted to
   * be exactly right, so fixing one without removing it from the list fails
   * too. Emptied when gym-consultation (7 advertised, 6 possible) was cut.
   */
  const KNOWN_OUT_OF_BOUNDS: string[] = [];

  it('every scenario with a script is between 1 and its choice-scene count', () => {
    const bad: string[] = [];
    for (const scenario of getAllScenarios(darkTheme)) {
      const script = scripts[scenario.id];
      if (!script) continue;
      const ceiling = choiceSceneCount(script);
      if (scenario.decisions < 1 || scenario.decisions > ceiling) {
        bad.push(scenario.id);
      }
    }
    expect(bad.sort()).toEqual([...KNOWN_OUT_OF_BOUNDS].sort());
  });
});

function scriptOf(outcomes: Record<string, ChoiceOutcome>): ScenarioScript {
  return {
    id: 't', title: 't', endings: [],
    scenes: [
      { id: 's1', choices: [{ id: 'a', outcome: outcomes.a }, { id: 'b', outcome: outcomes.b }] },
      { id: 's2', choices: [{ id: 'c', outcome: outcomes.c }] },
      { id: 's3', choices: [{ id: 'd', outcome: outcomes.d }] },
    ],
  } as unknown as ScenarioScript;
}

function stateOf(history: { sceneId: string; choiceId: string; npcId: string }[]): ScenarioState {
  return {
    scenarioId: 't', currentSceneId: 's1',
    flags: new Set<string>(), impactByNpc: {}, totalScore: 0, scoreByNpc: {},
    choiceHistory: history.map((h) => ({ ...h, timestamp: '2026-09-04T00:00:00Z' })),
    scenesVisited: new Set<string>(), startedAt: '2026-09-04T00:00:00Z',
  };
}

describe('railMarks', () => {
  const script = scriptOf({ a: 'excellent', b: 'bad', c: 'neutral', d: 'good' });

  it('returns one mark per slot, all empty before any choice', () => {
    const marks = railMarks(stateOf([]), script, 3);
    expect(marks).toHaveLength(3);
    expect(marks.every((m) => m.state === 'empty')).toBe(true);
  });

  it('fills slots in the order the choices were made', () => {
    const marks = railMarks(
      stateOf([
        { sceneId: 's1', choiceId: 'b', npcId: 'Ahmed' },
        { sceneId: 's2', choiceId: 'c', npcId: 'Ahmed' },
      ]),
      script,
      3,
    );
    expect(marks[0]).toEqual({ state: 'filled', outcome: 'bad', npcId: 'Ahmed', sceneId: 's1' });
    expect(marks[1]).toEqual({ state: 'filled', outcome: 'neutral', npcId: 'Ahmed', sceneId: 's2' });
    expect(marks[2]).toEqual({ state: 'empty' });
  });

  it('appends rather than growing the track when history outruns it', () => {
    // A bonus scene is not a slot but can be chosen. Resizing mid-run would
    // re-animate every mark and destroy the comparability a fixed length is for.
    const marks = railMarks(
      stateOf([
        { sceneId: 's1', choiceId: 'a', npcId: 'Ahmed' },
        { sceneId: 's2', choiceId: 'c', npcId: 'Ahmed' },
        { sceneId: 's3', choiceId: 'd', npcId: 'Ahmed' },
        { sceneId: 'bonus', choiceId: 'z', npcId: 'Ahmed' },
      ]),
      script,
      3,
    );
    expect(marks).toHaveLength(4);
    expect(marks[3].state).toBe('filled');
  });

  it('marks a valid judgement choice as chosen, not graded — misstep marks still show', () => {
    // A judgement scene has no single best answer; a graded mark on the rail
    // would give back exactly the signal the scene hides.
    const judged = {
      id: 't', title: 't', endings: [],
      scenes: [
        { id: 'j', kind: 'judgement', choices: [{ id: 'a', outcome: 'excellent' }, { id: 'b', outcome: 'bad' }] },
        { id: 'l', kind: 'language', choices: [{ id: 'c', outcome: 'good' }] },
      ],
    } as unknown as ScenarioScript;
    const marks = railMarks(
      stateOf([
        { sceneId: 'j', choiceId: 'a', npcId: 'Ahmed' },
        { sceneId: 'j', choiceId: 'b', npcId: 'Ahmed' },
        { sceneId: 'l', choiceId: 'c', npcId: 'Ahmed' },
      ]),
      judged,
      3,
    );
    expect(marks.map((m) => (m.state === 'filled' ? m.outcome : 'empty'))).toEqual(['chosen', 'bad', 'good']);
  });

  it('falls back to neutral when a choice id is not in the script', () => {
    // Defensive: a run persisted against an older script version must not crash
    // the player. An unknown choice still occupies its slot.
    const marks = railMarks(
      stateOf([{ sceneId: 's1', choiceId: 'gone', npcId: 'Ahmed' }]),
      script,
      3,
    );
    expect(marks[0]).toEqual({ state: 'filled', outcome: 'neutral', npcId: 'Ahmed', sceneId: 's1' });
  });
});
