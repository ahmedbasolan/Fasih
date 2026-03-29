import { useState, useCallback, useRef } from 'react';
import * as Speech from 'expo-speech';

interface UseTTSReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
}

/**
 * Hook for Arabic text-to-speech using expo-speech.
 * Uses the device's built-in Arabic voice when available.
 */
export function useArabicTTS(): UseTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const speak = useCallback((text: string) => {
    // Stop any current speech first
    Speech.stop();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setIsSpeaking(true);

    Speech.speak(text, {
      language: 'ar',
      rate: 0.85,
      pitch: 1.0,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
    });

    // Safety timeout — reset state after 10s max in case callbacks don't fire
    timeoutRef.current = setTimeout(() => {
      setIsSpeaking(false);
    }, 10000);
  }, []);

  const stop = useCallback(() => {
    Speech.stop();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking };
}
