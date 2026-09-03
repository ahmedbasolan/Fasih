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
 * KafMascot.tsx is deliberately left on disk, unimported, for that day.
 */
export function Companion({ size = 64 }: CompanionProps) {
  const name = useAppStore((s) => s.user?.name) ?? '';
  return <Monogram name={name} size={size} />;
}
