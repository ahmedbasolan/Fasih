import { useCallback, useEffect, useRef, useState } from 'react';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { useAppStore } from '../store/useAppStore';
import { clipFor } from '../engine/phraseAudio';
import { AUDIO_MANIFEST } from '../constants/audioManifest';

/** Playback rate for "play slowly". Same clip, no extra recording. */
const SLOW_RATE = 0.7;

/**
 * Plays a recorded clip for a phrase.
 *
 * Replaces useArabicTTS. The old hook took Arabic *text* and synthesised it;
 * this takes a phrase *id* and plays a recording of it, so anything without an
 * id — NPC dialogue, choice cards, Sentence Builder's composed sentences —
 * cannot have audio and no longer offers it.
 *
 * `hasClip` is the render condition for every speaker button. It is false for
 * everything today, and becomes true per phrase as clips land in assets/audio/
 * and the manifest is regenerated. No code changes when that happens.
 */
export function usePhraseAudio() {
  const gender = useAppStore((s) => s.user?.gender);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    // Play even when the ringer switch is silenced: a learner tapping a speaker
    // button has asked for sound explicitly.
    void setAudioModeAsync({ playsInSilentMode: true });
    return () => {
      playerRef.current?.remove();
      playerRef.current = null;
    };
  }, []);

  const start = useCallback((phraseId: string, rate: number) => {
    const clip = clipFor(phraseId, gender, AUDIO_MANIFEST);
    if (!clip) return;

    playerRef.current?.remove();
    const player = createAudioPlayer(clip.module);
    playerRef.current = player;
    setPlayingId(phraseId);

    // No explicit unsubscribe: `playerRef.current?.remove()` above (on the next
    // call or on unmount) tears the whole player down, listeners included.
    player.addListener('playbackStatusUpdate', (status) => {
      // A failed load/decode (bad file, unsupported format, corrupt bundle)
      // never sets didJustFinish, so it needs its own check here — otherwise
      // the speaker button that lit up for this phraseId never turns off.
      if (status.didJustFinish || status.error) setPlayingId(null);
    });

    if (rate !== 1) player.setPlaybackRate(rate);
    player.play();
  }, [gender]);

  const play = useCallback((phraseId: string) => start(phraseId, 1), [start]);
  const playSlow = useCallback((phraseId: string) => start(phraseId, SLOW_RATE), [start]);

  const stop = useCallback(() => {
    playerRef.current?.pause();
    setPlayingId(null);
  }, []);

  const hasClip = useCallback(
    (phraseId: string) => clipFor(phraseId, gender, AUDIO_MANIFEST) !== null,
    [gender],
  );

  return { play, playSlow, stop, isPlaying: playingId !== null, playingId, hasClip };
}
