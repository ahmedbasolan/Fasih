import { useState, useEffect, useRef } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

// ─── useCountUp ──────────────────────────────────────────────────────────────
// Works identically to web version — requestAnimationFrame is available in RN
export function useCountUp(target: number, duration = 1200, delay = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = Date.now();
      const timer = setInterval(() => {
        const p = Math.min((Date.now() - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setCount(Math.round(target * eased));
        if (p >= 1) clearInterval(timer);
      }, 16);
      return () => clearInterval(timer);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return count;
}

// ─── useTypewriter ───────────────────────────────────────────────────────────
// Works identically to web version
export function useTypewriter(text: string, speed = 55, startDelay = 0) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);

    if (!text) return;

    let i = 0;
    const timeout = setTimeout(() => {
      const timer = setInterval(() => {
        if (i < text.length) {
          i++;
          setDisplayed(text.slice(0, i));
        } else {
          clearInterval(timer);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(timer);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

// ─── useHold ────────────────────────────────────────────────────────────────
// Rewritten for React Native using react-native-gesture-handler + reanimated.
// Returns a Gesture object to pass to <GestureDetector gesture={gesture}>.
// Call-site: wrap the hold button in <GestureDetector gesture={gesture}>
export function useHold(onComplete: () => void, duration = 2400) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [complete, setComplete] = useState(false);
  const raf = useRef<number | null>(null);
  const startTime = useRef<number>(0);
  const isComplete = useRef(false);

  const tick = () => {
    // tick runs from requestAnimationFrame, never during render, so this is not
    // the render-path impurity the rule is looking for.
    // eslint-disable-next-line react-hooks/purity
    const p = Math.min((Date.now() - startTime.current) / duration, 1);
    runOnJS(setProgress)(p);
    if (p < 1) {
      raf.current = requestAnimationFrame(tick);
    } else if (!isComplete.current) {
      isComplete.current = true;
      runOnJS(setHolding)(false);
      runOnJS(setComplete)(true);
      runOnJS(onComplete)();
    }
  };

  const gesture = Gesture.Pan()
    .minDistance(0)
    .onBegin(() => {
      if (isComplete.current) return;
      // onBegin is a gesture callback, never during render, so this is not the
      // render-path impurity the rule is looking for.
      // eslint-disable-next-line react-hooks/purity
      startTime.current = Date.now();
      runOnJS(setHolding)(true);
      raf.current = requestAnimationFrame(tick);
    })
    .onFinalize(() => {
      if (isComplete.current) return;
      if (raf.current) cancelAnimationFrame(raf.current);
      runOnJS(setHolding)(false);
      runOnJS(setProgress)(0);
    });

  return { progress, holding, complete, gesture };
}
