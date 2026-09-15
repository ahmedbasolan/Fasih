/**
 * Merge rules for reconciling local state with a cloud pull.
 *
 * Pure functions only — no React, no Zustand, no side effects.
 *
 * The rule these all follow: **a merge must never lose a record.** The previous
 * implementation let the cloud win outright, so anything studied offline, or on
 * a second device since its last push, was erased the next time the app pulled.
 * Every function here is union-shaped; the only decisions are which *version* of
 * a record to keep when both sides have one.
 */

import type { PhraseReviewData, JournalEntry, LearningMilestone, PatternProgress, ScenarioRunRecord } from '../types';
import { MAX_RUNS_RECORDED } from './scenarioHistory';

export interface ScenarioRun {
  endingType: string;
  date: string;
}

/**
 * Union of review cards. When both sides have studied a phrase, the card with
 * the later `lastReviewed` wins — it encodes the more recent schedule.
 */
export function mergeReviews(
  local: Record<string, PhraseReviewData>,
  cloud: Record<string, PhraseReviewData>,
): Record<string, PhraseReviewData> {
  const merged: Record<string, PhraseReviewData> = { ...local };
  for (const [id, cloudCard] of Object.entries(cloud)) {
    const localCard = merged[id];
    if (!localCard || cloudCard.lastReviewed > localCard.lastReviewed) {
      merged[id] = cloudCard;
    }
  }
  return merged;
}

/**
 * Union of scenario completions. A scenario stays completed once completed, and
 * the *earlier* date is the true first completion.
 */
export function mergeCompletions(
  local: Record<string, ScenarioRun>,
  cloud: Record<string, ScenarioRun>,
): Record<string, ScenarioRun> {
  const merged: Record<string, ScenarioRun> = { ...local };
  for (const [id, cloudRun] of Object.entries(cloud)) {
    const localRun = merged[id];
    if (!localRun || cloudRun.date < localRun.date) merged[id] = cloudRun;
  }
  return merged;
}

/**
 * Union of journal entries by id, newest first, capped.
 * Entries written offline on another device survive the pull.
 */
export function mergeJournal(
  local: JournalEntry[],
  cloud: JournalEntry[],
  cap = 100,
): JournalEntry[] {
  const localIds = new Set(local.map((e) => e.id));
  return [...local, ...cloud.filter((e) => !localIds.has(e.id))]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, cap);
}

/**
 * Milestones: a reached milestone can never become unreached. Takes the cloud
 * list as the source of shape (so newly-added milestones appear) but keeps any
 * local `reached` the cloud has not caught up with.
 */
export function mergeMilestones(
  local: LearningMilestone[],
  cloud: LearningMilestone[],
): LearningMilestone[] {
  const base = cloud.length ? cloud : local;
  return base.map((m) => {
    const localMatch = local.find((lm) => lm.id === m.id);
    return localMatch?.reached && !m.reached ? localMatch : m;
  });
}

/** Union of a string-id list, order-stable, duplicates removed. */
export function mergeIds(local: string[], cloud: string[]): string[] {
  return Array.from(new Set([...local, ...cloud]));
}

/**
 * Union of Sentence Builder pattern progress. Per pattern, the higher
 * correctBuilds wins — progress made on one device must never regress
 * what another device already recorded.
 */
export function mergePatternProgress(
  local: Record<string, PatternProgress>,
  cloud: Record<string, PatternProgress>,
): Record<string, PatternProgress> {
  const merged: Record<string, PatternProgress> = { ...local };
  for (const [id, cloudEntry] of Object.entries(cloud)) {
    const localEntry = merged[id];
    if (!localEntry || (cloudEntry.correctBuilds ?? 0) > (localEntry.correctBuilds ?? 0)) {
      merged[id] = cloudEntry;
    }
  }
  return merged;
}

/**
 * Union of secret endings earned (scenarioId → ending title). A secret
 * earned on any device is kept. On the rare conflict where both sides
 * recorded a different title for the same scenarioId, local wins — the
 * same tie-break the inline version this was extracted from used.
 */
export function mergeSecretEndings(
  local: Record<string, string>,
  cloud: Record<string, string>,
): Record<string, string> {
  return { ...cloud, ...local };
}

/**
 * Union of endings found (scenarioId → ending ids). The endings collection
 * ("3 of 5 found") only ever grows — a find on either device stays found.
 */
export function mergeEndingsFound(
  local: Record<string, string[]>,
  cloud: Record<string, string[]>,
): Record<string, string[]> {
  const merged: Record<string, string[]> = { ...cloud };
  for (const [id, found] of Object.entries(local)) merged[id] = mergeIds(found, cloud[id] ?? []);
  return merged;
}

/**
 * Completed runs per scenario. Not summed: both sides can already count the
 * same runs from before they diverged. The higher count never under-reports,
 * which is the side that matters for "is this a replay?".
 */
export function mergeScenarioRuns(
  local: Record<string, number>,
  cloud: Record<string, number>,
): Record<string, number> {
  const merged: Record<string, number> = { ...cloud };
  for (const [id, n] of Object.entries(local)) merged[id] = Math.max(n, cloud[id] ?? 0);
  return merged;
}

/**
 * Run history per scenario, merged as a multiset. Both sides usually share the
 * runs from before they diverged, so a run appearing on both is kept once; a
 * run only one side has is added. Identical runs (same ending, same day) are
 * counted, not collapsed — the side with more of them wins — so two real replays
 * on one day survive. The one case this under-counts: each device making the
 * same run on the same day while offline from the other.
 *
 * The result is in date order (a stable sort keeps same-day runs in their
 * recorded order) and keeps the earliest MAX_RUNS_RECORDED.
 */
export function mergeScenarioHistory(
  local: Record<string, ScenarioRunRecord[]>,
  cloud: Record<string, ScenarioRunRecord[]>,
): Record<string, ScenarioRunRecord[]> {
  const merged: Record<string, ScenarioRunRecord[]> = {};
  const key = (r: ScenarioRunRecord) => `${r.on}|${r.endingId}|${r.endingType}`;
  for (const id of new Set([...Object.keys(local), ...Object.keys(cloud)])) {
    // The cloud column is untyped JSONB; a malformed value must not throw mid-merge.
    const localRuns = Array.isArray(local[id]) ? local[id] : [];
    const cloudRuns = Array.isArray(cloud[id]) ? cloud[id] : [];
    const localCount = new Map<string, number>();
    for (const r of localRuns) localCount.set(key(r), (localCount.get(key(r)) ?? 0) + 1);
    const extra: ScenarioRunRecord[] = [];
    const seen = new Map<string, number>();
    for (const r of cloudRuns) {
      const k = key(r);
      seen.set(k, (seen.get(k) ?? 0) + 1);
      if (seen.get(k)! > (localCount.get(k) ?? 0)) extra.push(r);
    }
    merged[id] = [...localRuns, ...extra]
      .sort((a, b) => a.on.localeCompare(b.on))
      .slice(0, MAX_RUNS_RECORDED);
  }
  return merged;
}
