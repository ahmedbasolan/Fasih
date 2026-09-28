import type { AudioClip, AudioManifest, VoiceGender } from '../types';

/** Stable order used when the learner has no gender set, or theirs is missing. */
const PREFERENCE: VoiceGender[] = ['male', 'female'];

/**
 * The clip to play for a phrase, or null when none exists.
 *
 * Returning null is the normal case, not an error: the manifest is generated
 * from the files actually present in assets/audio/, and today that is none.
 * Callers render their speaker button on this being non-null, which is what
 * makes the buttons disappear without a feature flag.
 */
export function clipFor(
  phraseId: string,
  voice: VoiceGender | undefined,
  manifest: AudioManifest,
): AudioClip | null {
  const entry = manifest[phraseId];
  if (!entry) return null;

  const order: VoiceGender[] = voice
    ? [voice, ...PREFERENCE.filter(v => v !== voice)]
    : PREFERENCE;

  for (const v of order) {
    const found = entry[v];
    if (found) return found;
  }
  return null;
}
