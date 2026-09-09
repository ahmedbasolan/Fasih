/** Pure string helpers. No React, no theme. */

/**
 * First character of a name, uppercased, for the monogram avatar.
 *
 * Uses the string iterator rather than `name[0]` so an astral-plane first
 * character (an emoji, some scripts) is not split into a broken surrogate half.
 */
export function initialFor(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length === 0) return '—';
  const [first] = [...trimmed];
  return first.toUpperCase();
}

/**
 * Unicode directional isolates. U+2066 LEFT-TO-RIGHT ISOLATE opens a run whose
 * base direction is LTR; U+2069 POP DIRECTIONAL ISOLATE closes it.
 *
 * "Isolate" rather than "embedding" (U+202A/U+202C) because an isolate also
 * stops the run from influencing the direction of text around it, which is the
 * behaviour wanted here and the reason the isolate characters were added to
 * Unicode 6.3 to supersede the embedding ones.
 */
const LRI = '⁦';
const PDI = '⁩';

/** Arabic, Arabic Supplement, Extended-A, and the presentation forms. */
const ARABIC = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

/**
 * Pin an English sentence to left-to-right, for prose that quotes Arabic inline.
 *
 * Teaching notes, outcome notes and cultural notes are English sentences with
 * Arabic embedded mid-sentence — `'لو سمحت is the Gulf "please" — what you will
 * actually hear in Dubai, where من فضلك sounds like a textbook.'`
 *
 * The Unicode bidirectional algorithm resolves a paragraph's base direction
 * from its FIRST STRONG character. When an author happens to open a note with
 * the Arabic being discussed, that character is RTL and the entire English
 * sentence is laid out right-to-left: clauses reorder and the full stop lands
 * at the start of the last line. 16 of the 128 scenario notes begin with Arabic
 * today, so 16 render mangled and the rest render correctly — by accident of
 * word order, not by anything the renderer decided.
 *
 * Wrapping in an isolate sets that base direction explicitly, so the result
 * stops depending on which word the author started with. The Arabic inside is
 * NOT forced left-to-right: the algorithm still resolves each run, so embedded
 * Arabic reads correctly within a left-to-right paragraph, which is what these
 * sentences are.
 *
 * Done in the text rather than with `writingDirection` because that style prop
 * is not dependable on Android, which is the platform this app is actually
 * looked at on. Control characters are resolved by the bidi algorithm itself,
 * so they behave the same on both.
 *
 * This is not editing the content. The stored string is untouched and the
 * language authority still governs it; the isolate is added at render time, the
 * same way `splitBilingualTitle` reshapes a title for display without changing
 * what is stored.
 *
 * Returns the input unchanged when there is no Arabic in it — most notes are
 * pure English and need no wrapper — and when it is already wrapped, so a
 * string that passes through twice is not nested twice.
 */
export function ltrParagraph(text: string): string {
  if (!ARABIC.test(text)) return text;
  if (text.startsWith(LRI) && text.endsWith(PDI)) return text;
  return `${LRI}${text}${PDI}`;
}

/** The separator used in `GrammarPattern.title`: an em dash with spaces either side. */
const TITLE_SEPARATOR = ' — ';

/**
 * Split a bilingual pattern title into its two halves.
 *
 * Titles are stored as one string — `'كم / وين / شو — how much? where? what?'`.
 * Rendered in a single Text, the Unicode bidirectional algorithm resolves the
 * paragraph direction from the first strong character (Arabic), and the
 * trailing `?` of the Latin gloss is a neutral, so it is placed by RTL rules
 * and lands on the wrong side: `how much? ?where? what`. The string is not
 * wrong; rendering it as one run is.
 *
 * Splitting lets each half render in its own Text with an explicit direction,
 * which is the only reliable fix short of embedding directional control
 * characters in the content — and the content is governed by the language
 * authority, so it does not get edited for a rendering problem.
 *
 * Splits on the FIRST separator only: a gloss may contain its own dash.
 */
export function splitBilingualTitle(title: string): { arabic: string; english: string } {
  const at = title.indexOf(TITLE_SEPARATOR);
  if (at === -1) return { arabic: title.trim(), english: '' };
  return {
    arabic: title.slice(0, at).trim(),
    english: title.slice(at + TITLE_SEPARATOR.length).trim(),
  };
}
