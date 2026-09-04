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
 * cheap. `SceneIllustrations.tsx` is already deleted and recoverable from git
 * history; `KafMascot.tsx` is still on disk only because onboarding has not
 * been migrated yet (step 5), and goes the same way when it is.
 */
export function Companion({ size = 64 }: CompanionProps) {
  const name = useAppStore((s) => s.user?.name) ?? '';
  return <Monogram name={name} size={size} />;
}
