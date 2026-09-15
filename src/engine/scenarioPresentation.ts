/**
 * What the player shows about a run — pure functions only. No React, no Zustand.
 *
 * Spec 2026-09-14 §2.4–2.7. Kept out of the components so each rule (never
 * grade a valid judgement choice; hints only for endings not found; no stats
 * below the completion floor) is decided once and tested, not re-derived in JSX.
 */
import type {
  ChoiceOutcome,
  ScenarioChoice,
  ScenarioEnding,
  ScenarioScene,
  ScenarioScript,
  ScenarioState,
  Tone,
  TonedDialogue,
} from '../types';

// ─── Feedback after a choice ─────────────────────────────────────────────────

export type ChoiceFeedback =
  /** A cultural misstep, in any kind of scene. Named right away. */
  | { kind: 'misstep' }
  /** Language scene, the right form. */
  | { kind: 'correct' }
  /** Language scene, a near miss — shown alongside the right form. */
  | { kind: 'not-quite'; correct: ScenarioChoice | undefined }
  /** Judgement scene, a valid choice: the NPC reacts, nothing is graded. */
  | { kind: 'reaction' }
  /** The bonus scene, which is not one of the run's decisions: a plain outcome label. */
  | { kind: 'graded'; outcome: ChoiceOutcome };

export function choiceFeedback(scene: ScenarioScene, choice: ScenarioChoice): ChoiceFeedback {
  if (!scene.kind) return { kind: 'graded', outcome: choice.outcome };
  if (choice.outcome === 'bad') return { kind: 'misstep' };
  if (scene.kind === 'judgement') return { kind: 'reaction' };
  if (choice.outcome === 'excellent') return { kind: 'correct' };
  return { kind: 'not-quite', correct: scene.choices.find(c => c.outcome === 'excellent') };
}

// ─── NPC lines ───────────────────────────────────────────────────────────────

/** The NPC's line at this tone, as this learner hears it. */
export function npcLine(scene: ScenarioScene, tone: Tone, gender: 'male' | 'female' | undefined): TonedDialogue {
  const female = gender === 'female' ? scene.femaleLearner : undefined;
  const toned = female ? female.charDialogue : scene.charDialogue;
  if (toned && tone !== 'neutral') return toned[tone];
  if (female) return { arabic: female.arabic, roman: female.roman, english: female.english };
  return { arabic: scene.arabic, roman: scene.roman, english: scene.english };
}

// ─── Endings collection ──────────────────────────────────────────────────────

export interface EndingsProgress {
  found: number;
  total: number;
  hidden: number;
  hiddenFound: boolean;
}

/** "3 of 5 found · 1 hidden". Found ids no longer in the script don't count. */
export function endingsProgress(script: Pick<ScenarioScript, 'endings'>, foundIds: readonly string[]): EndingsProgress {
  const found = new Set(foundIds);
  const present = script.endings.filter(e => found.has(e.id));
  const hidden = script.endings.filter(e => e.secret);
  return {
    found: present.length,
    total: script.endings.length,
    hidden: hidden.length,
    hiddenFound: hidden.some(e => found.has(e.id)),
  };
}

/**
 * The choices this run made that leaned toward the ending's destination, in
 * order — "the moments that sent you here". Empty for an ending with no route.
 */
export function destinationMoments(
  history: ScenarioState['choiceHistory'],
  script: Pick<ScenarioScript, 'scenes'>,
  ending: ScenarioEnding,
): ScenarioChoice[] {
  if (!ending.route) return [];
  return history
    .map(h => script.scenes.find(s => s.id === h.sceneId)?.choices.find(c => c.id === h.choiceId))
    .filter((c): c is ScenarioChoice => c?.route === ending.route);
}

export interface EndingHint {
  endingId: string;
  hint: string;
  hidden: boolean;
}

/**
 * Hints toward endings the learner hasn't found: never the ending just reached,
 * never one without a hint (the failure ending). Hidden last —
 * it is the one worth saving for.
 */
export function hintsToShow(
  script: Pick<ScenarioScript, 'endings'>,
  foundIds: readonly string[],
  currentEndingId: string | undefined,
): EndingHint[] {
  const found = new Set(foundIds);
  return script.endings
    .filter(e => e.hint && !found.has(e.id) && e.id !== currentEndingId)
    .map(e => ({ endingId: e.id, hint: e.hint as string, hidden: !!e.secret }))
    .sort((a, b) => Number(a.hidden) - Number(b.hidden));
}

// ─── Community stats ─────────────────────────────────────────────────────────

/**
 * Completions a scenario needs before "X% of players reach this" shows. Below
 * it a percentage is noise dressed as a fact — from 4 players, as misleading
 * as the invented "Only 8%" it replaced.
 */
export const MIN_COMPLETIONS_FOR_STATS = 100;

/**
 * Reach percentages by ending id. Rows for ids the script doesn't have (old
 * type-keyed rows, deleted endings) are ignored entirely — they neither count
 * toward the floor nor show.
 *
 * Not rounded: 0.3 rounded to 0, and 0 is what hides the line — so the rarest
 * endings, the ones the "you just did" copy exists for, never showed one. The
 * STRINGS formatters round, and say "fewer than 1%" below it.
 */
export function endingPercentages(
  rows: readonly { ending: string; count: number }[],
  knownEndingIds: readonly string[],
  minCompletions = MIN_COMPLETIONS_FOR_STATS,
): Record<string, number> {
  const known = new Set(knownEndingIds);
  const counted = rows.filter(r => known.has(r.ending));
  const total = counted.reduce((sum, r) => sum + r.count, 0);
  if (total < minCompletions) return {};
  return Object.fromEntries(counted.map(r => [r.ending, (r.count / total) * 100]));
}
