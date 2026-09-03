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
