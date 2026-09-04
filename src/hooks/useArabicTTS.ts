import { useState, useCallback, useRef, useEffect } from 'react';
import * as Speech from 'expo-speech';

export type VoiceGender = 'male' | 'female';

interface UseTTSReturn {
  speak: (text: string) => void;
  speakSlow: (text: string) => void;
  speakMale: (text: string) => void;
  speakFemale: (text: string) => void;
  speakAs: (text: string, gender: VoiceGender) => void;
  stop: () => void;
  isSpeaking: boolean;
  hasArabicVoice: boolean;
}

// Wider pitch gap for clearer male/female distinction when no native voice selection
const PITCH_MALE = 0.7;
const PITCH_FEMALE = 1.3;
const PITCH_DEFAULT = 1.0;

/**
 * Hook for Arabic text-to-speech using expo-speech.
 *
 * Queries the device for available Arabic voices and selects actual male/female
 * voices when available. Falls back to pitch differentiation otherwise.
 *
 * ─── This speaks MSA, not Khaleeji. Read before trusting it. ─────────────────
 * An earlier version of this comment claimed `ar-AE` gives "a Khaleeji/Emirati
 * accent." That is false, and it mattered: `ar-AE` is a LOCALE TAG, not a
 * dialect model. Device Arabic voices are trained on Modern Standard Arabic
 * whatever region tag they carry, so the synthesiser will say:
 *
 *   قهوة  as  *qahwa*   while the card teaches  gahwa
 *   شلونك as  a mangled MSA reading — the word is not MSA
 *   چ     not at all — it is absent from the MSA inventory
 *
 * Fasih's first rule is that it contains no MSA in any channel, so audio is
 * currently a standing violation of that rule rather than a feature that works.
 * We still request `ar-AE` first, because an Arabic voice mispronouncing a
 * dialect word is closer than no Arabic voice at all — but it is a fallback,
 * not the intended teaching channel.
 *
 * Romanisation is the authoritative pronunciation channel until real Emirati
 * audio exists (see docs/language/authority.md). Phrases whose pronTip teaches a
 * dialect-specific sound — g for ق, ch for ك, y for ج — need human recordings;
 * synthesis actively contradicts the lesson on exactly those.
 *
 * Emirati TTS is a known open problem, not something a locale tag solved: the
 * Ramsa corpus paper (arXiv:2603.08125) exists in part to benchmark it.
 */
export function useArabicTTS(): UseTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasArabicVoice, setHasArabicVoice] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voicesRef = useRef<{ male?: string; female?: string; fallback?: string }>({});

  // Query available Arabic voices on mount
  useEffect(() => {
    (async () => {
      try {
        const all = await Speech.getAvailableVoicesAsync();
        const arabic = all.filter(v => v.language?.startsWith('ar'));

        // Prefer ar-AE voices, fall back to any Arabic
        const aeVoices = arabic.filter(v => v.language === 'ar-AE');
        const pool = aeVoices.length > 0 ? aeVoices : arabic;

        // Try to find gendered voices by identifier keywords
        const maleVoice = pool.find(v =>
          /male/i.test(v.identifier) && !/female/i.test(v.identifier)
        );
        const femaleVoice = pool.find(v => /female/i.test(v.identifier));

        voicesRef.current = {
          male: maleVoice?.identifier,
          female: femaleVoice?.identifier,
          fallback: pool[0]?.identifier,
        };
        setHasArabicVoice(arabic.length > 0);
      } catch {
        // Voice query failed — pitch fallback will be used
        setHasArabicVoice(false);
      }
    })();
  }, []);

  const speakCore = useCallback((text: string, rate: number, pitch: number, voiceId?: string) => {
    // Stop any current speech first
    Speech.stop();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setIsSpeaking(true);

    const opts: Speech.SpeechOptions = {
      language: 'ar-AE',
      rate,
      pitch,
      ...(voiceId ? { voice: voiceId } : {}),
      onDone: () => setIsSpeaking(false),
      onError: () => {
        // Fallback to generic Arabic if ar-AE is not available
        Speech.speak(text, {
          language: 'ar',
          rate,
          pitch,
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
          onStopped: () => setIsSpeaking(false),
        });
        // Re-arm the safety timeout for the fallback speech so isSpeaking isn't
        // cleared early by the original (longer) timeout while audio still plays.
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setIsSpeaking(false);
        }, 15000);
      },
      onStopped: () => setIsSpeaking(false),
    };

    Speech.speak(text, opts);

    // Safety timeout — reset state after 15s max in case callbacks don't fire
    timeoutRef.current = setTimeout(() => {
      setIsSpeaking(false);
    }, 15000);
  }, []);

  const speak = useCallback((text: string) => {
    speakCore(text, 0.6, PITCH_DEFAULT, voicesRef.current.fallback);
  }, [speakCore]);

  const speakSlow = useCallback((text: string) => {
    speakCore(text, 0.4, PITCH_DEFAULT, voicesRef.current.fallback);
  }, [speakCore]);

  const speakMale = useCallback((text: string) => {
    const v = voicesRef.current;
    speakCore(text, 0.6, v.male ? PITCH_DEFAULT : PITCH_MALE, v.male || v.fallback);
  }, [speakCore]);

  const speakFemale = useCallback((text: string) => {
    const v = voicesRef.current;
    speakCore(text, 0.6, v.female ? PITCH_DEFAULT : PITCH_FEMALE, v.female || v.fallback);
  }, [speakCore]);

  const speakAs = useCallback((text: string, gender: VoiceGender) => {
    const v = voicesRef.current;
    if (gender === 'male') {
      speakCore(text, 0.6, v.male ? PITCH_DEFAULT : PITCH_MALE, v.male || v.fallback);
    } else {
      speakCore(text, 0.6, v.female ? PITCH_DEFAULT : PITCH_FEMALE, v.female || v.fallback);
    }
  }, [speakCore]);

  const stop = useCallback(() => {
    Speech.stop();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    return () => {
      Speech.stop();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { speak, speakSlow, speakMale, speakFemale, speakAs, stop, isSpeaking, hasArabicVoice };
}
