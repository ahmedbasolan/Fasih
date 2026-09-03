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

import type { PhraseReviewData, JournalEntry, LearningMilestone } from '../types';

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
