import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Monogram } from './Monogram';

interface CompanionProps {
  size?: number;
  /**
   * Overrides the stored name. Onboarding needs this: the learner's name lives
   * in local step state until `onComplete` writes the profile, so the store's
   * user is still null while the name is being typed. Without it the avatar
   * showed the empty-name placeholder — a dash — on the very screen asking for
   * the name, and kept showing it for the rest of the flow.
   */
  name?: string;
}

/**
 * The mascot seam.
 *
 * Character art is retired from Sadaf, but Ahmed may reintroduce it. Every
 * former KafMascot / foxy* call site renders this instead, so bringing a
 * character back is a change to THIS FILE ONLY — not to six screens.
 *
 * That seam, not any surviving artefact, is what makes the reintroduction
 * cheap. `KafMascot.tsx`, `SceneIllustrations.tsx` and the four mascot/mode
 * PNGs are all deleted and all recoverable from git history. Nine call sites
 * now route through this one function.
 */
export function Companion({ size = 64, name }: CompanionProps) {
  const storedName = useAppStore((s) => s.user?.name) ?? '';
  return <Monogram name={name ?? storedName} size={size} />;
}
