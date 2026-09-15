import { appendScenarioRun, MAX_RUNS_RECORDED } from '../scenarioHistory';
import type { ScenarioRunRecord } from '../../types';

const run = (endingId: string, on = '2026-09-15'): ScenarioRunRecord => ({ endingId, endingType: 'success', on });

describe('appendScenarioRun', () => {
  it('starts a scenario\'s history with run 1', () => {
    expect(appendScenarioRun({}, 'a', run('x'))).toEqual({ a: [run('x')] });
  });

  it('adds later runs after earlier ones, so array position is the run number', () => {
    const history = appendScenarioRun(appendScenarioRun({}, 'a', run('x', '2026-09-01')), 'a', run('y', '2026-09-03'));
    expect(history.a.map((r) => r.endingId)).toEqual(['x', 'y']);
  });

  it('leaves other scenarios and the input untouched', () => {
    const before = { b: [run('z')] };
    const after = appendScenarioRun(before, 'a', run('x'));
    expect(after.b).toBe(before.b);
    expect(before).toEqual({ b: [run('z')] });
  });

  it('stops recording at the cap — the early runs are the ones replay is measured on', () => {
    const full = { a: Array.from({ length: MAX_RUNS_RECORDED }, (_, i) => run(`r${i}`)) };
    expect(appendScenarioRun(full, 'a', run('late'))).toBe(full);
  });
});
