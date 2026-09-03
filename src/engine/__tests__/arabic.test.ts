import {
  normalizeForCompare,
  normalizeForSearch,
  arabicAnswerMatches,
  arabicIncludes,
} from '../arabic';

describe('normalizeForCompare — formatting only', () => {
  it('strips vowel marks', () => {
    // السَّلام (with shadda + fatha) reduces to السلام
    expect(normalizeForCompare('السَّلام')).toBe('السلام');
  });

  it('strips tatweel', () => {
    expect(normalizeForCompare('سـلام')).toBe('سلام');
  });

  it('collapses and trims whitespace', () => {
    expect(normalizeForCompare('  صباح   الخير  ')).toBe('صباح الخير');
  });

  it('preserves letter identity — alef forms are NOT folded', () => {
    // Grading must not accept a different letter as correct.
    expect(normalizeForCompare('أهلا')).not.toBe(normalizeForCompare('اهلا'));
  });

  it('preserves ta marbuta vs ha', () => {
    expect(normalizeForCompare('مدرسة')).not.toBe(normalizeForCompare('مدرسه'));
  });

  it('leaves Latin text alone', () => {
    expect(normalizeForCompare('  ahlan   wa sahlan ')).toBe('ahlan wa sahlan');
  });
});

describe('normalizeForSearch — folds letter families too', () => {
  it('folds the alef family to bare alef', () => {
    expect(normalizeForSearch('أهلا')).toBe(normalizeForSearch('اهلا'));
    expect(normalizeForSearch('إسلام')).toBe(normalizeForSearch('اسلام'));
    expect(normalizeForSearch('آسف')).toBe(normalizeForSearch('اسف'));
  });

  it('folds ta marbuta to ha', () => {
    expect(normalizeForSearch('مدرسة')).toBe(normalizeForSearch('مدرسه'));
  });

  it('folds alef maqsura to ya', () => {
    expect(normalizeForSearch('على')).toBe(normalizeForSearch('علي'));
  });

  it('folds hamza seats to their base letters', () => {
    expect(normalizeForSearch('مسؤول')).toBe(normalizeForSearch('مسوول'));
    expect(normalizeForSearch('قائل')).toBe(normalizeForSearch('قايل'));
  });

  it('still strips vowel marks', () => {
    expect(normalizeForSearch('السَّلام')).toBe(normalizeForSearch('السلام'));
  });
});

describe('arabicAnswerMatches — grading', () => {
  it('accepts a correct answer typed without stored vowel marks', () => {
    expect(arabicAnswerMatches('السلام عليكم', 'السَّلام عليكم')).toBe(true);
  });

  it('accepts extra or double spacing between words', () => {
    // The Phrase Builder joins tiles with a single space; the stored phrase may
    // not match that exactly. That must not decide a correct answer.
    expect(arabicAnswerMatches('صباح  الخير', 'صباح الخير')).toBe(true);
    expect(arabicAnswerMatches(' صباح الخير ', 'صباح الخير')).toBe(true);
  });

  it('still rejects a genuinely different letter', () => {
    expect(arabicAnswerMatches('مدرسه', 'مدرسة')).toBe(false);
  });

  it('still rejects wrong word order', () => {
    expect(arabicAnswerMatches('الخير صباح', 'صباح الخير')).toBe(false);
  });
});

describe('arabicIncludes — search', () => {
  it('matches despite a missing hamza on the alef', () => {
    expect(arabicIncludes('أهلا وسهلا', 'اهلا')).toBe(true);
  });

  it('matches despite vowel marks in the stored phrase', () => {
    expect(arabicIncludes('السَّلام عليكم', 'السلام')).toBe(true);
  });

  it('matches a partial word', () => {
    expect(arabicIncludes('صباح الخير', 'صباح')).toBe(true);
  });

  it('does not match unrelated text', () => {
    expect(arabicIncludes('صباح الخير', 'مساء')).toBe(false);
  });

  it('an empty or whitespace query matches everything', () => {
    expect(arabicIncludes('صباح الخير', '')).toBe(true);
    expect(arabicIncludes('صباح الخير', '   ')).toBe(true);
  });

  it('handles Latin queries unharmed', () => {
    expect(arabicIncludes('ahlan wa sahlan', 'AHLAN')).toBe(true);
    expect(arabicIncludes('ahlan wa sahlan', 'zzz')).toBe(false);
  });
});
