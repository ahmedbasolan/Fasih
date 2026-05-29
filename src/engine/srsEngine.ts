/**
 * Spaced-repetition scheduling engine.
 *
 * Pure functions only — no React, no Zustand, no side effects.
 * All date arithmetic uses local time so streak days match the user's clock.
 *
 * SRS model:
 *   - Each card has an `ease` multiplier (1.3–2.5) and a scheduled `interval` (days).
 *   - 3-tier rating: 'knew' advances the interval × ease, 'learning' resets to 3 days,
 *     'new' resets to 1 day and reduces ease.
 *   - Binary review (correct/incorrect) uses SM-2-style interval doubling.
 */

import type { PhraseReviewData } from '../types';

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** Returns today's date as an ISO date string (YYYY-MM-DD) in local time. */
export function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Adds `days` to an ISO date string and returns the resulting ISO date string. */
export function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// ─── Card lifecycle ───────────────────────────────────────────────────────────

/** Creates a fresh review card for a phrase that has never been studied. */
export function newReviewCard(phraseId: string): PhraseReviewData {
  const today = todayISO();
  return { phraseId, lastReviewed: today, nextReview: today, interval: 0, ease: 2.0, correct: 0, incorrect: 0 };
}

/**
 * Updates a review card after a binary correct/incorrect rating.
 * Used by quiz and reverse-quiz modes.
 */
export function updateReviewCard(card: PhraseReviewData, correct: boolean): PhraseReviewData {
  const today = todayISO();
  if (correct) {
    const newInterval = Math.max(1, Math.round(card.interval * card.ease));
    const newEase = Math.min(2.5, card.ease + 0.1);
    return { ...card, lastReviewed: today, nextReview: addDays(today, newInterval), interval: newInterval, ease: newEase, correct: card.correct + 1 };
  }
  return { ...card, lastReviewed: today, nextReview: addDays(today, 1), interval: 1, ease: Math.max(1.3, card.ease - 0.2), incorrect: card.incorrect + 1 };
}

// ─── 3-tier flashcard rating ──────────────────────────────────────────────────

/** Fixed SRS intervals for the 3-tier flashcard rating system. */
export const RATING_INTERVALS: Record<'new' | 'learning' | 'knew', number> = {
  new: 1,
  learning: 3,
  knew: 7,
};

/**
 * Updates a review card after a 3-tier flashcard rating.
 * - 'knew'     → interval × ease (progressive doubling), ease +0.1
 * - 'learning' → 3-day fixed interval, ease unchanged
 * - 'new'      → 1-day fixed interval, ease -0.2 (floor 1.3)
 */
export function applyRatingToCard(card: PhraseReviewData, rating: 'new' | 'learning' | 'knew'): PhraseReviewData {
  const today = todayISO();
  if (rating === 'knew') {
    const newInterval = card.interval < 1 ? 7 : Math.round(card.interval * card.ease);
    const newEase = Math.min(2.5, card.ease + 0.1);
    return { ...card, lastReviewed: today, nextReview: addDays(today, newInterval), interval: newInterval, ease: newEase, correct: card.correct + 1 };
  }
  if (rating === 'new') {
    return { ...card, lastReviewed: today, nextReview: addDays(today, RATING_INTERVALS.new), interval: RATING_INTERVALS.new, ease: Math.max(1.3, card.ease - 0.2), incorrect: card.incorrect + 1 };
  }
  // 'learning'
  return { ...card, lastReviewed: today, nextReview: addDays(today, RATING_INTERVALS.learning), interval: RATING_INTERVALS.learning, ease: card.ease };
}
