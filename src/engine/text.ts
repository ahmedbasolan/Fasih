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
