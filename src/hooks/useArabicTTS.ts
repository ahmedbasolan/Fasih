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

const SUKUN = 'ْ'; // ـْ — tells TTS: no case vowel after this letter
// Long vowels and ta marbuta that naturally close a syllable — skip sukūn on these
const SKIP_SUKUN = new Set(['ا', 'و', 'ي', 'ى', 'ة']);

/**
 * Strips existing harakat then adds sukūn to word-final consonants.
 * Prevents Arabic TTS engines from appending MSA case vowels (-u/-i/-an)
 * so the output sounds like spoken Gulf Arabic instead of formal MSA.
 */
function toGulfSpeech(text: string): string {
  // Remove all existing harakat (diacritics) to avoid double-marking
  const clean = text.replace(/[ً-ٰٟ]/g, '');
  // Add sukūn after any Arabic consonant that sits immediately before
  // whitespace, punctuation, or end-of-string
  return clean.replace(/([ء-ي])(?=[\s!-/:-@،؛؟ـ،؟!]|$)/g, (_, char) => {
    if (SKIP_SUKUN.has(char)) return char;
    return char + SUKUN;
  });
}

/**
 * Hook for Arabic text-to-speech using expo-speech.
 * Queries device for available Arabic voices and selects actual male/female
 * voices when available. Falls back to pitch differentiation otherwise.
 * Uses ar-AE (UAE Arabic) locale for Khaleeji/Emirati accent.
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

    // Preprocess: add sukūn to word-final consonants so the TTS engine does not
    // inject MSA case vowels (-u/-i/-an). Gulf Arabic drops all case endings.
    const gulfText = toGulfSpeech(text);

    const opts: Speech.SpeechOptions = {
      language: 'ar-AE',
      rate,
      pitch,
      ...(voiceId ? { voice: voiceId } : {}),
      onDone: () => setIsSpeaking(false),
      onError: () => {
        // Fallback to generic Arabic if ar-AE is not available
        Speech.speak(gulfText, {
          language: 'ar',
          rate,
          pitch,
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
          onStopped: () => setIsSpeaking(false),
        });
      },
      onStopped: () => setIsSpeaking(false),
    };

    Speech.speak(gulfText, opts);

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
