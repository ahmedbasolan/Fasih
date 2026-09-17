/**
 * Per-scenario run history — pure functions only. No React, no Zustand.
 *
 * scenarioId → the runs in order, so a record's position is its run number.
 * It is what lets "did they replay within 7 days?" (the launch success bar,
 * spec 2026-09-14 §2.12) be answered at all: endingsFound has no dates and
 * scenarioRuns is only a count.
 */
import type { ScenarioRunRecord } from '../types';

/**
 * Runs kept per scenario. The early runs carry the metrics — run 1 against
 * run 2 is the replay, and hidden endings are found early or not at all — so a
 * learner's fiftieth run is not worth the row growth. scenarioRuns still counts
 * every run past the cap.
 */
export const MAX_RUNS_RECORDED = 20;

/** Adds a completed run, unless the scenario's history is already at the cap. */
export function appendScenarioRun(
  history: Record<string, ScenarioRunRecord[]>,
  scenarioId: string,
  record: ScenarioRunRecord,
): Record<string, ScenarioRunRecord[]> {
  const runs = history[scenarioId] ?? [];
  if (runs.length >= MAX_RUNS_RECORDED) return history;
  return { ...history, [scenarioId]: [...runs, record] };
}
