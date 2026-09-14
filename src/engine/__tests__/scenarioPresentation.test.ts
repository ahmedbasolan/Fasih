/**
 * Tests for what the player shows about a run (src/engine/scenarioPresentation.ts).
 */
import {
  choiceFeedback,
  npcLine,
  endingsProgress,
  destinationMoments,
  hintsToShow,
  endingPercentages,
  MIN_COMPLETIONS_FOR_STATS,
} from '../scenarioPresentation';
import type { ChoiceOutcome, ScenarioChoice, ScenarioEnding, ScenarioScene, ScenarioScript } from '../../types';

const choice = (id: string, outcome: ChoiceOutcome, extra: Partial<ScenarioChoice> = {}): ScenarioChoice => ({
  id, text: id, arabic: 'ا', roman: id, score: 0, outcome, ...extra,
});

const scene = (extra: Partial<ScenarioScene> = {}): ScenarioScene => ({
  id: 's1', charName: 'Faisal', charGender: 'male', setting: 's',
  arabic: 'شلونك؟', roman: 'shloonak?', english: 'How are you?', choices: [], ...extra,
});

const ending = (id: string, extra: Partial<ScenarioEnding> = {}): ScenarioEnding => ({
  id, min: 0, title: id, arabic: 'ا', roman: 'a', en: id, desc: 'd', color: '#000000', type: 'mixed', ...extra,
});

describe('choiceFeedback', () => {
  it('language scene: the excellent choice is correct', () => {
    const correct = choice('a', 'excellent');
    expect(choiceFeedback(scene({ kind: 'language', choices: [correct] }), correct)).toEqual({ kind: 'correct' });
  });

  it('language scene: any other valid choice is not quite, and carries the right form', () => {
    const correct = choice('a', 'excellent');
    const near = choice('b', 'good');
    expect(choiceFeedback(scene({ kind: 'language', choices: [correct, near] }), near)).toEqual({ kind: 'not-quite', correct });
  });

  it('a bad choice is a misstep in either kind of scene', () => {
    const bad = choice('c', 'bad');
    expect(choiceFeedback(scene({ kind: 'language', choices: [bad] }), bad)).toEqual({ kind: 'misstep' });
    expect(choiceFeedback(scene({ kind: 'judgement', choices: [bad] }), bad)).toEqual({ kind: 'misstep' });
  });

  it('judgement scene: a valid choice gets a reaction, never a grade', () => {
    const top = choice('a', 'excellent', { route: 'warm' });
    const other = choice('b', 'neutral', { route: 'formal' });
    expect(choiceFeedback(scene({ kind: 'judgement', choices: [top, other] }), top)).toEqual({ kind: 'reaction' });
    expect(choiceFeedback(scene({ kind: 'judgement', choices: [top, other] }), other)).toEqual({ kind: 'reaction' });
  });

  it('a legacy scene with no kind keeps its graded label', () => {
    const good = choice('a', 'good');
    expect(choiceFeedback(scene({ choices: [good] }), good)).toEqual({ kind: 'graded', outcome: 'good' });
  });
});

describe('npcLine', () => {
  const toned = {
    warm: { arabic: 'w', roman: 'w', english: 'w' },
    neutral: { arabic: 'n', roman: 'n', english: 'n' },
    cold: { arabic: 'c', roman: 'c', english: 'c' },
  };
  const femaleToned = {
    warm: { arabic: 'wf', roman: 'wf', english: 'wf' },
    neutral: { arabic: 'nf', roman: 'nf', english: 'nf' },
    cold: { arabic: 'cf', roman: 'cf', english: 'cf' },
  };

  it('uses the base line at neutral tone and the toned line otherwise', () => {
    const s = scene({ charDialogue: toned });
    expect(npcLine(s, 'neutral', 'male').arabic).toBe('شلونك؟');
    expect(npcLine(s, 'warm', 'male').arabic).toBe('w');
  });

  it('gives a female learner her lines when the scene has them', () => {
    const s = scene({
      charDialogue: toned,
      femaleLearner: { arabic: 'شلونج؟', roman: 'shloonich?', english: 'How are you?', charDialogue: femaleToned },
    });
    expect(npcLine(s, 'neutral', 'female').arabic).toBe('شلونج؟');
    expect(npcLine(s, 'cold', 'female').arabic).toBe('cf');
    expect(npcLine(s, 'cold', 'male').arabic).toBe('c');
  });

  it('an unknown gender hears the default lines', () => {
    const s = scene({ femaleLearner: { arabic: 'شلونج؟', roman: 'shloonich?', english: 'How are you?' } });
    expect(npcLine(s, 'neutral', undefined).arabic).toBe('شلونك؟');
  });
});

describe('endingsProgress', () => {
  const script = { endings: [ending('a'), ending('b'), ending('h', { secret: true })] } as ScenarioScript;

  it('counts distinct found endings that still exist in the script', () => {
    expect(endingsProgress(script, ['a', 'a', 'gone'])).toEqual({ found: 1, total: 3, hidden: 1, hiddenFound: false });
  });

  it('knows when the hidden ending has been found', () => {
    expect(endingsProgress(script, ['h'])).toEqual({ found: 1, total: 3, hidden: 1, hiddenFound: true });
  });
});

describe('destinationMoments', () => {
  const s1 = scene({ id: 's1', choices: [choice('a', 'good', { route: 'warm' }), choice('b', 'good', { route: 'formal' })] });
  const s2 = scene({ id: 's2', choices: [choice('a', 'excellent'), choice('b', 'good', { route: 'warm' })] });
  const script = { scenes: [s1, s2] } as ScenarioScript;
  const history = [
    { sceneId: 's1', choiceId: 'a', npcId: 'Faisal', timestamp: '' },
    { sceneId: 's2', choiceId: 'b', npcId: 'Faisal', timestamp: '' },
  ];

  it('lists the choices that leaned toward the ending’s destination, in order', () => {
    expect(destinationMoments(history, script, ending('warm-strong', { route: 'warm' })).map(c => c.id)).toEqual(['a', 'b']);
    expect(destinationMoments(history, script, ending('formal-weak', { route: 'formal' }))).toEqual([]);
  });

  it('is empty for an ending with no destination', () => {
    expect(destinationMoments(history, script, ending('failure'))).toEqual([]);
  });
});

describe('hintsToShow', () => {
  const script = {
    endings: [
      ending('warm-strong', { route: 'warm', hint: 'warm hint' }),
      ending('formal-strong', { route: 'formal', hint: 'formal hint' }),
      ending('hidden', { secret: true, hint: 'hidden hint' }),
      ending('failure', { type: 'failed' }),
      ending('legacy'),
    ],
  } as ScenarioScript;

  it('shows hints for endings not found yet, skipping the one just reached and endings with no hint', () => {
    expect(hintsToShow(script, ['warm-strong'], 'formal-strong')).toEqual([
      { endingId: 'hidden', hint: 'hidden hint', hidden: true },
    ]);
  });

  it('lists the hidden ending last', () => {
    expect(hintsToShow(script, [], undefined).map(h => h.endingId)).toEqual(['warm-strong', 'formal-strong', 'hidden']);
  });
});

describe('endingPercentages', () => {
  const known = ['a', 'b'];

  it('shows nothing until the scenario has enough completions', () => {
    expect(endingPercentages([{ ending: 'a', count: MIN_COMPLETIONS_FOR_STATS - 1 }], known)).toEqual({});
  });

  it('returns rounded percentages by ending id once it does', () => {
    expect(endingPercentages([{ ending: 'a', count: 75 }, { ending: 'b', count: 25 }], known)).toEqual({ a: 75, b: 25 });
  });

  it('ignores rows for endings the script no longer has — they neither count nor show', () => {
    const rows = [{ ending: 'a', count: 60 }, { ending: 'success', count: 500 }];
    expect(endingPercentages(rows, known)).toEqual({});
  });
});
