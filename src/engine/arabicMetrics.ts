/**
 * Arabic content metrics — the measurements the curriculum gates are expressed in.
 *
 * Pure functions only. No React, no Zustand, no side effects.
 *
 * ─── Why morphemes, not words ────────────────────────────────────────────────
 * Arabic writes clitics attached: `بالأسبوع` is one whitespace token but three
 * morphemes (bi- + al- + usbuu'). So "words per card" measures spelling as much
 * as it measures complexity, and any orthography change silently moves the
 * numbers underneath the gates calibrated on them.
 *
 * Measured across Fasih's ten scripted scenarios, the morpheme-to-whitespace
 * inflation ratio ranges from x1.29 (social_taxi_ride) to x1.82 (hotel-guest) —
 * a 41% spread. Two scenarios with the same word count can differ by half again
 * in real morphological load. Hence every length gate in curriculum.ts is
 * expressed in morphemes.
 *
 * ─── Stated limit ────────────────────────────────────────────────────────────
 * `countMorphemes` is a deterministic ORTHOGRAPHIC APPROXIMATION, not a
 * morphological analysis. It detects the clitics that are unambiguous in
 * writing and deliberately declines the ambiguous ones. It will undercount
 * (internal morphology: broken plurals, verb templates) and it is not a
 * substitute for CALIMA-GLF.
 *
 * The curriculum's provisional bands were calibrated against THIS function, so
 * they are self-consistent today. When tools/dialect-check.py lands, recalibrate
 * the bands against real CAMeL tokenisation — see the design spec, §4.3.
 */

/** Any Arabic-script codepoint. */
const ARABIC = /[؀-ۿ]/;

/** Combining vowel marks. Duplicated deliberately from arabic.ts: that module
 *  owns normalisation for comparison, this one owns measurement, and coupling
 *  them would make a change to either silently move the other. */
const TASHKEEL_G = /[ً-ْٰ]/g;

/** Parenthesised stage directions — `(silence)`, `(answered in English)`. Never content. */
const STAGE_DIRECTION = /\([^)]*\)/g;

/** Dashes used as prosodic pauses in the content, not as morphemes. */
const PAUSE_DASH = /[—–-]/g;

/**
 * Proclitics that are unambiguous in writing.
 *
 * Ordered longest-first so `لل` is tried before `ل`. Each entry carries the
 * minimum stem length that must REMAIN after stripping — without it, `لا` (no)
 * would be read as ل + ا, and `بس` (just) as ب + س.
 */
const PROCLITICS: ReadonlyArray<{ form: string; minStem: number }> = [
  { form: 'وال', minStem: 3 },   // wa-al-
  { form: 'بال', minStem: 3 },   // bi-al-
  { form: 'كال', minStem: 3 },   // ka-al-
  { form: 'لل',  minStem: 3 },   // li-l-
  { form: 'ال',  minStem: 3 },   // al-
];

/**
 * Single-letter proclitics. Far more ambiguous than the above — `و` opens plenty
 * of ordinary words (وين، وايد، ولد) — so these require a longer surviving stem
 * and are only counted when the remainder is itself plausible.
 */
const SINGLE_PROCLITICS: ReadonlyArray<{ form: string; minStem: number }> = [
  { form: 'ب', minStem: 4 },
  { form: 'ل', minStem: 4 },
];

/**
 * Enclitic object/possessive pronouns.
 *
 * `ـج` is the Emirati 2nd-person feminine (عندج, لج) — the feature that makes
 * this dialect audibly itself. Longest-first again so `هم` beats `ه`.
 */
const ENCLITICS: ReadonlyArray<{ form: string; minStem: number }> = [
  { form: 'كم', minStem: 3 },
  { form: 'هم', minStem: 3 },
  { form: 'ها', minStem: 3 },
  { form: 'نا', minStem: 3 },
  { form: 'ج',  minStem: 3 },
  { form: 'ك',  minStem: 3 },
  { form: 'ه',  minStem: 3 },
];

/**
 * Words that must never be clitic-split.
 *
 * `الله` ends in ه and is four letters, so it satisfies the generic enclitic
 * guard and would be read as `الل` + `ه`. It is one morpheme, and it is among
 * the most frequent words in the content — every blessing formula contains it.
 * Religious formulae resist analysis generally; this is the set that actually
 * occurs.
 */
const INDIVISIBLE = new Set(['الله', 'والله', 'بالله', 'لله', 'تالله', 'اللهم', 'اللّه']);

/** Strips stage directions, pause dashes and vowel marks; collapses whitespace. */
function clean(input: string): string {
  return input
    .replace(STAGE_DIRECTION, ' ')
    .replace(TASHKEEL_G, '')
    .replace(PAUSE_DASH, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Whitespace-delimited tokens that contain at least one Arabic letter. */
export function arabicTokens(input: string): string[] {
  const c = clean(input);
  if (!c) return [];
  return c.split(' ').filter(t => ARABIC.test(t));
}

/**
 * Whitespace word count. Kept because it is what a reader sees on the card, and
 * because reporting both makes the inflation ratio visible. Not used as a gate.
 */
export function countArabicWords(input: string): number {
  return arabicTokens(input).length;
}

/** Morphemes in one already-cleaned token. Always at least 1. */
function morphemesInToken(token: string): number {
  // Punctuation is not a morpheme.
  let stem = token.replace(/[^؀-ۿ]/g, '');
  if (!stem) return 0;
  if (INDIVISIBLE.has(stem)) return 1;

  let count = 1;

  for (const { form, minStem } of PROCLITICS) {
    if (stem.startsWith(form) && stem.length - form.length >= minStem) {
      count += form === 'وال' || form === 'بال' || form === 'كال' ? 2 : 1;
      stem = stem.slice(form.length);
      break;
    }
  }

  if (count === 1) {
    for (const { form, minStem } of SINGLE_PROCLITICS) {
      if (stem.startsWith(form) && stem.length - form.length >= minStem) {
        count += 1;
        stem = stem.slice(form.length);
        break;
      }
    }
  }

  for (const { form, minStem } of ENCLITICS) {
    if (stem.endsWith(form) && stem.length - form.length >= minStem) {
      count += 1;
      break;
    }
  }

  return count;
}

/**
 * Approximate morpheme count for an Arabic utterance.
 *
 * See the module header for what this does and does not detect.
 */
export function countMorphemes(input: string): number {
  return arabicTokens(input).reduce((n, t) => n + morphemesInToken(t), 0);
}

/**
 * Clauses in an utterance, split on sentence-final and clause-separating
 * punctuation. A "clause" here is a unit of asking — the metric exists to stop
 * an A1 card from posing two questions in one breath, which is exactly what
 * the-checkup's 4-clause card does today.
 */
export function countClauses(input: string): number {
  const c = clean(input);
  if (!c) return 0;
  return c
    .split(/[!?.،؟:]+/)
    .filter(s => ARABIC.test(s) && s.trim().length > 1)
    .length;
}

/**
 * True if the string carries MSA vowel marks.
 *
 * Fasih writes bare Arabic script (design spec §3.4): the harakat encode MSA's
 * three-vowel system and cannot represent the Emirati mid vowels in `شلون` or
 * `زين`, so vocalising dialect means inventing conventions — and importing MSA
 * machinery into an app whose first rule is that it contains no MSA.
 *
 * Two marks are deliberately ALLOWED, because neither is MSA vowel machinery:
 *
 *   • shadda (ّ) marks gemination, a consonant-length distinction that is
 *     phonemic in Emirati exactly as it is in MSA. It also does real
 *     disambiguating work in the content — `عليّ` ('alayy, "on me") against
 *     `علي` ('ali, a name) — which bare script cannot express.
 *   • tanwīn fatḥa (ً) on `شكراً / أهلاً / دايماً / طبعاً` is simply how those
 *     words are conventionally spelled, by everyone, dialect or not. Treating
 *     it as vocalisation would flag ordinary spelling as a violation.
 */
export function hasDisallowedTashkeel(input: string): boolean {
  const withoutAllowedMarks = input.replace(/[ًّ]/g, '');
  return /[ٌٍَُِْٰ]/.test(withoutAllowedMarks);
}
