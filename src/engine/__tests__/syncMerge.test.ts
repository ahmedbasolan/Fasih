import {
  mergeReviews,
  mergeCompletions,
  mergeJournal,
  mergeMilestones,
  mergeIds,
  mergePatternProgress,
  mergeSecretEndings,
  mergeEndingsFound,
  mergeScenarioRuns,
  type ScenarioRun,
} from '../syncMerge';
import type { PhraseReviewData, JournalEntry, LearningMilestone, PatternProgress } from '../../types';

const card = (phraseId: string, lastReviewed: string, extra: Partial<PhraseReviewData> = {}): PhraseReviewData => ({
  phraseId,
  lastReviewed,
  nextReview: lastReviewed,
  interval: 1,
  ease: 2.0,
  correct: 0,
  incorrect: 0,
  ...extra,
});

describe('mergeReviews', () => {
  it('keeps cards that exist only locally — the offline-study case', () => {
    const local = { a: card('a', '2026-09-02') };
    const merged = mergeReviews(local, {});
    expect(merged.a).toBeDefined();
    expect(Object.keys(merged)).toEqual(['a']);
  });

  it('keeps cards that exist only in the cloud — the reinstall case', () => {
    const merged = mergeReviews({}, { b: card('b', '2026-09-01') });
    expect(merged.b).toBeDefined();
  });

  it('keeps the more recently reviewed card when both sides have one', () => {
    const local = { a: card('a', '2026-09-05', { correct: 9 }) };
    const cloud = { a: card('a', '2026-09-01', { correct: 1 }) };
    expect(mergeReviews(local, cloud).a.correct).toBe(9);
    expect(mergeReviews(cloud, local).a.correct).toBe(9);
  });

  it('never drops a phrase present on either side', () => {
    const local = { a: card('a', '2026-09-02'), b: card('b', '2026-09-02') };
    const cloud = { b: card('b', '2026-09-03'), c: card('c', '2026-09-03') };
    expect(Object.keys(mergeReviews(local, cloud)).sort()).toEqual(['a', 'b', 'c']);
  });

  it('does not mutate its inputs', () => {
    const local = { a: card('a', '2026-09-02') };
    const cloud = { a: card('a', '2026-09-09') };
    mergeReviews(local, cloud);
    expect(local.a.lastReviewed).toBe('2026-09-02');
  });
});

describe('mergeCompletions', () => {
  const run = (date: string, endingType = 'success'): ScenarioRun => ({ endingType, date });

  it('keeps the earlier completion date as the true first completion', () => {
    const local = { s1: run('2026-09-05T10:00:00.000Z') };
    const cloud = { s1: run('2026-09-01T10:00:00.000Z', 'exceptional') };
    expect(mergeCompletions(local, cloud).s1.endingType).toBe('exceptional');
  });

  it('is a union — a scenario completed on either device stays completed', () => {
    const merged = mergeCompletions({ a: run('2026-09-01') }, { b: run('2026-09-02') });
    expect(Object.keys(merged).sort()).toEqual(['a', 'b']);
  });

  it('a completed scenario is never un-completed by an empty cloud', () => {
    const local = { a: run('2026-09-01') };
    expect(mergeCompletions(local, {})).toEqual(local);
  });
});

describe('mergeJournal', () => {
  const entry = (id: string, date: string): JournalEntry => ({
    id, date, arabic: 'x', english: 'y', insight: 'z', source: 'scenario', sourceId: 's',
  });

  it('unions by id and sorts newest first', () => {
    const merged = mergeJournal([entry('a', '2026-09-01')], [entry('b', '2026-09-03')]);
    expect(merged.map((e) => e.id)).toEqual(['b', 'a']);
  });

  it('does not duplicate an entry present on both sides', () => {
    const merged = mergeJournal([entry('a', '2026-09-01')], [entry('a', '2026-09-01')]);
    expect(merged).toHaveLength(1);
  });

  it('caps the result', () => {
    const many = Array.from({ length: 150 }, (_, i) => entry(`e${i}`, '2026-09-01'));
    expect(mergeJournal(many, [], 100)).toHaveLength(100);
  });
});

describe('mergeMilestones', () => {
  const ms = (id: string, reached: boolean): LearningMilestone => ({
    id, label: id, description: '', reached,
  });

  it('a reached milestone is never un-reached by a stale cloud', () => {
    const merged = mergeMilestones([ms('m1', true)], [ms('m1', false)]);
    expect(merged[0].reached).toBe(true);
  });

  it('takes newly-added milestones from the cloud', () => {
    const merged = mergeMilestones([ms('m1', false)], [ms('m1', false), ms('m2', false)]);
    expect(merged.map((m) => m.id)).toEqual(['m1', 'm2']);
  });

  it('falls back to local shape when the cloud has none', () => {
    expect(mergeMilestones([ms('m1', true)], [])).toEqual([ms('m1', true)]);
  });
});

describe('mergeIds', () => {
  it('unions without duplicates and keeps local order first', () => {
    expect(mergeIds(['a', 'b'], ['b', 'c'])).toEqual(['a', 'b', 'c']);
  });
});

describe('mergePatternProgress', () => {
  const progress = (correctBuilds: number, lastBuilt?: string): PatternProgress => ({
    correctBuilds,
    ...(lastBuilt ? { lastBuilt } : {}),
  });

  it('keeps patterns practised only locally', () => {
    const merged = mergePatternProgress({ p1: progress(2) }, {});
    expect(merged.p1).toEqual(progress(2));
  });

  it('keeps patterns practised only in the cloud — the reinstall case', () => {
    const merged = mergePatternProgress({}, { p1: progress(3) });
    expect(merged.p1).toEqual(progress(3));
  });

  it('keeps the higher correctBuilds when both sides have progress — never regresses', () => {
    expect(mergePatternProgress({ p1: progress(1) }, { p1: progress(3) }).p1.correctBuilds).toBe(3);
    expect(mergePatternProgress({ p1: progress(3) }, { p1: progress(1) }).p1.correctBuilds).toBe(3);
  });

  it('does not mutate its inputs', () => {
    const local = { p1: progress(1) };
    mergePatternProgress(local, { p1: progress(5) });
    expect(local.p1.correctBuilds).toBe(1);
  });
});

describe('mergeSecretEndings', () => {
  it('is a union — a secret earned on either device is kept', () => {
    const merged = mergeSecretEndings({ a: 'The Diplomat' }, { b: 'The Local' });
    expect(merged).toEqual({ a: 'The Diplomat', b: 'The Local' });
  });

  it('a secret earned locally is never lost to an empty cloud', () => {
    expect(mergeSecretEndings({ a: 'The Diplomat' }, {})).toEqual({ a: 'The Diplomat' });
  });

  it('local wins on a same-scenario conflict', () => {
    const merged = mergeSecretEndings({ a: 'Local Title' }, { a: 'Cloud Title' });
    expect(merged.a).toBe('Local Title');
  });
});

describe('mergeEndingsFound', () => {
  it('unions ending ids per scenario — an ending found on either device stays found', () => {
    const merged = mergeEndingsFound({ a: ['x', 'y'], b: ['z'] }, { a: ['y', 'w'], c: ['v'] });
    expect(merged).toEqual({ a: ['x', 'y', 'w'], b: ['z'], c: ['v'] });
  });

  it('an empty cloud never erases local finds', () => {
    expect(mergeEndingsFound({ a: ['x'] }, {})).toEqual({ a: ['x'] });
  });
});

describe('mergeScenarioRuns', () => {
  // Counts can't be summed safely — both sides may already include the same
  // runs from before they diverged. The larger count never under-reports.
  it('keeps the higher run count per scenario', () => {
    expect(mergeScenarioRuns({ a: 3, b: 1 }, { a: 2, b: 4, c: 1 })).toEqual({ a: 3, b: 4, c: 1 });
  });
});
