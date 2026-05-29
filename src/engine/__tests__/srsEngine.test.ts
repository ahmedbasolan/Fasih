import { todayISO, addDays, newReviewCard, updateReviewCard, applyRatingToCard, RATING_INTERVALS } from '../srsEngine';

describe('todayISO', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('addDays', () => {
  it('adds positive days to a date', () => {
    expect(addDays('2026-01-01', 7)).toBe('2026-01-08');
  });

  it('handles month boundaries', () => {
    expect(addDays('2026-01-28', 5)).toBe('2026-02-02');
  });

  it('subtracts days when given a negative number', () => {
    expect(addDays('2026-01-08', -7)).toBe('2026-01-01');
  });
});

describe('newReviewCard', () => {
  it('creates a card with interval 0 and ease 2.0', () => {
    const card = newReviewCard('g1');
    expect(card.phraseId).toBe('g1');
    expect(card.interval).toBe(0);
    expect(card.ease).toBe(2.0);
    expect(card.correct).toBe(0);
    expect(card.incorrect).toBe(0);
  });

  it('sets nextReview to today', () => {
    const card = newReviewCard('g1');
    expect(card.nextReview).toBe(todayISO());
  });
});

describe('updateReviewCard', () => {
  const baseCard = newReviewCard('g1');

  it('increments correct count on correct review', () => {
    const updated = updateReviewCard(baseCard, true);
    expect(updated.correct).toBe(1);
    expect(updated.incorrect).toBe(0);
  });

  it('increases ease on correct review (capped at 2.5)', () => {
    const card = { ...baseCard, ease: 2.4 };
    expect(updateReviewCard(card, true).ease).toBe(2.5);
  });

  it('increments incorrect count on wrong review', () => {
    const updated = updateReviewCard(baseCard, false);
    expect(updated.incorrect).toBe(1);
    expect(updated.correct).toBe(0);
  });

  it('decreases ease on wrong review (floored at 1.3)', () => {
    const card = { ...baseCard, ease: 1.4 };
    expect(updateReviewCard(card, false).ease).toBeCloseTo(1.3);
  });

  it('sets next review to 1 day on wrong review', () => {
    const updated = updateReviewCard(baseCard, false);
    expect(updated.interval).toBe(1);
    expect(updated.nextReview).toBe(addDays(todayISO(), 1));
  });

  it('does not mutate the original card', () => {
    const original = { ...baseCard };
    updateReviewCard(baseCard, true);
    expect(baseCard.correct).toBe(original.correct);
    expect(baseCard.ease).toBe(original.ease);
  });
});

describe('applyRatingToCard', () => {
  const baseCard = newReviewCard('g1');

  it('"new" resets to 1-day interval and reduces ease', () => {
    const card = { ...baseCard, interval: 10, ease: 2.0 };
    const result = applyRatingToCard(card, 'new');
    expect(result.interval).toBe(RATING_INTERVALS.new);
    expect(result.nextReview).toBe(addDays(todayISO(), 1));
    expect(result.incorrect).toBe(1);
    expect(result.ease).toBeCloseTo(1.8);
  });

  it('"learning" resets to 3-day interval without changing ease', () => {
    const card = { ...baseCard, ease: 2.2 };
    const result = applyRatingToCard(card, 'learning');
    expect(result.interval).toBe(RATING_INTERVALS.learning);
    expect(result.ease).toBe(2.2);
  });

  it('"knew" on first review uses 7-day base interval', () => {
    const card = { ...baseCard, interval: 0 };
    const result = applyRatingToCard(card, 'knew');
    expect(result.interval).toBe(7);
  });

  it('"knew" doubles interval using ease multiplier on subsequent reviews', () => {
    const card = { ...baseCard, interval: 7, ease: 2.0 };
    const result = applyRatingToCard(card, 'knew');
    expect(result.interval).toBe(14);
    expect(result.correct).toBe(1);
  });

  it('"knew" caps ease at 2.5', () => {
    const card = { ...baseCard, interval: 7, ease: 2.5 };
    const result = applyRatingToCard(card, 'knew');
    expect(result.ease).toBe(2.5);
  });
});
