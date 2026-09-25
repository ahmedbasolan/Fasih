/**
 * How much a scenario counts toward Situational Confidence — pure functions
 * only. No React, no Zustand.
 *
 * Spec 2026-09-14 §2.9: confidence comes from the best tier reached plus the
 * endings found. It read the latest completion instead, which a replay
 * overwrites — so hunting the hidden ending (a lower-scoring run, by design)
 * made confidence drop, and a sync pull could flip it back to the first run.
 */
import type { ScenarioEnding } from '../types';

/**
 * Weight of a completed scenario, by the best ending type reached.
 *
 * Keyed by ScenarioEnding['type']. The old inline ladder tested for
 * 'success_strong', which is not a member of that union — the branch was dead
 * and plain 'success', the most common good outcome, silently fell through to
 * the neutral 1.0. `src/engine/__tests__/scenarioContent.test.ts` asserts every
 * authored ending uses a known type.
 */
export const ENDING_WEIGHTS: Record<string, number> = {
  exceptional: 1.2,
  success: 1.1,
  mixed: 1.0,
  failed: 0.6,
};

/**
 * Added on top of the best weight once every ending is found, in proportion
 * before that. A first run gets none of it, so a single completion weighs
 * exactly what it always did.
 */
const ALL_ENDINGS_BONUS = 0.3;

/**
 * The scenario's weight toward its situation, or null if it was never completed.
 *
 * `completedType` is the completion record's ending type. It counts toward the
 * best tier so a completion recorded before endings were collected still shows.
 */
export function scenarioConfidenceWeight(
  endings: readonly Pick<ScenarioEnding, 'id' | 'type'>[],
  foundIds: readonly string[],
  completedType: string | undefined,
): number | null {
  const found = endings.filter(e => foundIds.includes(e.id));
  const types = [...found.map(e => e.type), ...(completedType ? [completedType] : [])];
  if (types.length === 0) return null;

  const best = Math.max(...types.map(t => ENDING_WEIGHTS[t] ?? 1));
  const extraFound = endings.length > 1 ? Math.max(found.length - 1, 0) / (endings.length - 1) : 0;
  return best + ALL_ENDINGS_BONUS * extraFound;
}
