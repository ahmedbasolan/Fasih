import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Reflects the OS-level "Reduce Motion" accessibility setting.
 * iOS:  Settings → Accessibility → Motion → Reduce Motion
 * Android: Settings → Accessibility → Remove animations / Animator duration scale
 *
 * When enabled, consumers should skip purely decorative transitions
 * (entrance cascades, mascot bobs, ambient loops) and jump straight to the
 * final rendered state.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((val) => { if (mounted) setReduced(val); })
      .catch(() => { /* noop — feature detection failure, assume animations on */ });

    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      mounted = false;
      sub?.remove?.();
    };
  }, []);

  return reduced;
}
