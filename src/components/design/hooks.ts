import { useState, useEffect } from 'react';

// ─── useCountUp ──────────────────────────────────────────────────────────────
// Works identically to web version — requestAnimationFrame is available in RN
export function useCountUp(target: number, duration = 1200, delay = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    // `timer` is held in the effect scope so the effect's own cleanup can clear
    // it. Returning a cleanup from inside the setTimeout callback (as this used
    // to) does nothing — setTimeout discards its callback's return value — so
    // the interval outlived the component and kept setting state on it.
    let timer: ReturnType<typeof setInterval> | null = null;
    const timeout = setTimeout(() => {
      const start = Date.now();
      timer = setInterval(() => {
        const p = Math.min((Date.now() - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setCount(Math.round(target * eased));
        if (p >= 1 && timer) clearInterval(timer);
      }, 16);
    }, delay);
    return () => {
      clearTimeout(timeout);
      if (timer) clearInterval(timer);
    };
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
    // Same fix as useCountUp: the interval must be reachable from the effect's
    // cleanup. Previously it was not, so when `text` changed mid-type the old
    // interval kept running against the old closure and raced the new one —
    // two typewriters writing different strings into the same state. That is
    // live on every scene change and translation reveal in ScenarioPlayer.
    let timer: ReturnType<typeof setInterval> | null = null;
    const timeout = setTimeout(() => {
      timer = setInterval(() => {
        if (i < text.length) {
          i++;
          setDisplayed(text.slice(0, i));
        } else {
          if (timer) clearInterval(timer);
          setDone(true);
        }
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(timeout);
      if (timer) clearInterval(timer);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}
