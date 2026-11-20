import { clipFor } from '../phraseAudio';
import type { AudioManifest, AudioClip, VoiceGender } from '../../types';

function clip(voice: VoiceGender, module: number): AudioClip {
  return {
    module,
    voice,
    provenance: { kind: 'human', voice: 'test', recordedAt: '2026-09-28' },
  };
}

const both: AudioManifest = {
  'g3': { male: clip('male', 1), female: clip('female', 2) },
};
const femaleOnly: AudioManifest = { 'g3': { female: clip('female', 2) } };
const maleOnly: AudioManifest = { 'g3': { male: clip('male', 1) } };

describe('clipFor', () => {
  it('is null when the manifest is empty — the state this branch ships in', () => {
    expect(clipFor('g3', 'male', {})).toBeNull();
  });

  it('is null for a phrase with no clips', () => {
    expect(clipFor('does-not-exist', 'male', both)).toBeNull();
  });

  it('returns the clip matching the learner voice', () => {
    expect(clipFor('g3', 'male', both)?.module).toBe(1);
    expect(clipFor('g3', 'female', both)?.module).toBe(2);
  });

  it('falls back to the other voice rather than silence', () => {
    // Half-recorded is a real state during a rollout. The other voice saying
    // the right words beats no audio at all.
    expect(clipFor('g3', 'male', femaleOnly)?.module).toBe(2);
    expect(clipFor('g3', 'female', maleOnly)?.module).toBe(1);
  });

  it('prefers male deterministically when the learner has no gender set', () => {
    // Onboarding asks, but audio is reachable before it is answered. The rule
    // only needs to be stable, not meaningful.
    expect(clipFor('g3', undefined, both)?.module).toBe(1);
  });

  it('still resolves with no gender set when only one voice exists', () => {
    expect(clipFor('g3', undefined, femaleOnly)?.module).toBe(2);
  });

  it('is null when the phrase key exists but holds no clips', () => {
    expect(clipFor('g3', 'male', { 'g3': {} })).toBeNull();
  });
});
