import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Monogram } from './Monogram';

interface CompanionProps {
  size?: number;
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
export function Companion({ size = 64 }: CompanionProps) {
  const name = useAppStore((s) => s.user?.name) ?? '';
  return <Monogram name={name} size={size} />;
}
