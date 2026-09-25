import { scenarioConfidenceWeight, ENDING_WEIGHTS } from '../situationalConfidence';
import type { ScenarioEnding } from '../../types';

const endings: Pick<ScenarioEnding, 'id' | 'type'>[] = [
  { id: 'hidden', type: 'exceptional' },
  { id: 'a-strong', type: 'success' },
  { id: 'a-weak', type: 'mixed' },
  { id: 'b-strong', type: 'success' },
  { id: 'b-weak', type: 'mixed' },
  { id: 'failure', type: 'failed' },
];

describe('scenarioConfidenceWeight', () => {
  it('is null for a scenario never completed', () => {
    expect(scenarioConfidenceWeight(endings, [], undefined)).toBeNull();
  });

  it('a first run counts the weight of the ending reached, and nothing more', () => {
    expect(scenarioConfidenceWeight(endings, ['a-weak'], undefined)).toBe(ENDING_WEIGHTS.mixed);
  });

  it('uses the best ending reached, not the latest — a replay never lowers it', () => {
    // Strong first, then a replay that failed while hunting the hidden ending.
    const afterReplay = scenarioConfidenceWeight(endings, ['a-strong', 'failure'], undefined)!;
    expect(afterReplay).toBeGreaterThan(ENDING_WEIGHTS.success);
  });

  it('each ending found adds to it, up to the full bonus for all of them', () => {
    const two = scenarioConfidenceWeight(endings, ['a-strong', 'a-weak'], undefined)!;
    const all = scenarioConfidenceWeight(endings, endings.map(e => e.id), undefined)!;
    expect(two).toBeGreaterThan(ENDING_WEIGHTS.success);
    expect(all).toBeGreaterThan(two);
    expect(all).toBeCloseTo(ENDING_WEIGHTS.exceptional + 0.3);
  });

  it('ignores found ids the script no longer has', () => {
    expect(scenarioConfidenceWeight(endings, ['a-weak', 'deleted-ending'], undefined)).toBe(ENDING_WEIGHTS.mixed);
  });

  it('a completion recorded before endings were collected still counts', () => {
    expect(scenarioConfidenceWeight(endings, [], 'success')).toBe(ENDING_WEIGHTS.success);
    expect(scenarioConfidenceWeight(endings, ['a-weak'], 'success')).toBe(ENDING_WEIGHTS.success);
  });
});
