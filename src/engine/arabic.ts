/**
 * Arabic text normalisation.
 *
 * Pure functions only — no React, no Zustand, no side effects.
 *
 * ─── Why this exists (Postel's law) ──────────────────────────────────────────
 * "Be liberal in what you accept." Fasih was strict about Arabic in the two
 * places where strictness costs a learner the most:
 *
 *   • Phrase search compared the raw query against the raw stored string, so a
 *     learner who typed a form they had seen elsewhere — with vowel marks, or
 *     with a bare alef where the library stores a hamzated one — got no results
 *     and no explanation.
 *   • The Phrase Builder scored a built sentence with `constructed === arabic`,
 *     so a correct arrangement could be marked wrong over a double space or a
 *     stored diacritic.
 *
 * ─── Two levels, deliberately ────────────────────────────────────────────────
 * Being liberal is not the same as being permissive, and a teaching app has to
 * hold that line:
 *
 *   normalizeForCompare — formatting only. Strips vowel marks and tatweel and
 *     collapses whitespace. Letter identity is preserved, because ا / أ and
 *     ه / ة really are different letters. Accepting those as equal in an
 *     exercise would tell a learner they had written something correctly when
 *     they had not.
 *
 *   normalizeForSearch — everything above, plus folding the letter families a
 *     learner is most likely to type differently from how we store them. Search
 *     has no wrong answer to protect, so it should match as widely as possible.
 */

/**
 * Combining marks that carry no letter identity.
 *   U+064B–U+0652  tanwin, harakat, shadda, sukun
 *   U+0653–U+0655  maddah and hamza above/below
 *   U+0656–U+065F  extended Quranic marks
 *   U+0670         superscript alef (dagger alef)
 *   U+06D6–U+06ED  Quranic annotation marks
 */
const TASHKEEL = /[ً-ٰٟۖ-ۭ]/g;

/** Kashida / tatweel — a pure typographic stretch, never meaningful. */
const TATWEEL = /ـ/g;

/** Zero-width joiners and marks that survive copy-paste and break comparison. */
const ZERO_WIDTH = /[​-‏‪-‮﻿]/g;

/**
 * Strips formatting that carries no meaning, without changing any letter.
 *
 * Use for checking a learner's answer: forgiving about how the text was typed,
 * unforgiving about which letters were chosen.
 */
export function normalizeForCompare(input: string): string {
  return input
    .replace(ZERO_WIDTH, '')
    .replace(TASHKEEL, '')
    .replace(TATWEEL, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Everything normalizeForCompare does, plus folding the letter families
 * learners most often type differently from the stored form.
 *
 * Use for search only — never for grading.
 */
export function normalizeForSearch(input: string): string {
  return normalizeForCompare(input)
    // Alef family → bare alef. A learner types ا far more often than أ/إ/آ.
    .replace(/[أإآٱ]/g, 'ا')
    // Alef maqsura → ya. Frequently interchanged in casual typing.
    .replace(/ى/g, 'ي')
    // Ta marbuta → ha. Often typed as ه, and indistinguishable when spoken.
    .replace(/ة/g, 'ه')
    // Hamza seats → their base letters.
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    // Standalone hamza carries no seat to fold to; drop it for matching.
    .replace(/ء/g, '')
    .toLowerCase();
}

/**
 * True when a learner's Arabic matches the expected answer.
 *
 * Compares on formatting-normalised text, so spacing and stored vowel marks
 * never decide a correct answer, while letter choice still does.
 */
export function arabicAnswerMatches(actual: string, expected: string): boolean {
  return normalizeForCompare(actual) === normalizeForCompare(expected);
}

/**
 * True when `haystack` contains `needle`, both loosely normalised.
 *
 * Handles the mixed-script reality of the search box: an empty or
 * whitespace-only query matches everything, and Latin queries fall through the
 * same path unharmed because the folds above only touch Arabic code points.
 */
export function arabicIncludes(haystack: string, needle: string): boolean {
  const n = normalizeForSearch(needle);
  if (!n) return true;
  return normalizeForSearch(haystack).includes(n);
}
