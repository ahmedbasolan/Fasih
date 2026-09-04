import type { ScenarioScript, ScenarioState, ChoiceOutcome } from '../types';

/**
 * Total scenes in the script that present a choice.
 *
 * This is the UPPER BOUND on a run's decisions, not the count of them. Scripts
 * branch: `social_taxi_ride` has 7 choice-scenes but `c2_open`/`c2_effort` and
 * `c3_ronaldo`/`c3_dubai` are mutually exclusive, so any single run passes
 * through 5.
 *
 * That is why the rail's track length comes from `Scenario.decisions` — the
 * authored path length — rather than from here. An earlier draft derived the
 * length from the script and would have drawn a 7-slot rail for a 5-decision
 * run, leaving two slots permanently empty. Use this only to bound-check that
 * metadata.
 *
 * Bonus scenes are excluded: they appear only on the secret-ending path.
 */
export function choiceSceneCount(script: ScenarioScript): number {
  return script.scenes.filter((s) => !s.bonus && s.choices.length > 0).length;
}

export type RailMark =
  | { state: 'filled'; outcome: ChoiceOutcome; npcId: string; sceneId: string }
  | { state: 'empty' };

/**
 * The rail's render model: one mark per decision, in the order they were made.
 *
 * Pure derivation from data that already exists — `choiceHistory` is ordered
 * and complete, and every choice carries an `outcome`. The engine gains no new
 * state for this; the rail simply shows what the run already recorded.
 *
 * `slots` is the scenario's authored decision count (`Scenario.decisions`).
 * Passing it in rather than deriving it is deliberate: see `choiceSceneCount`.
 *
 * Choices beyond `slots` append rather than growing the track mid-run — a
 * bonus scene is not a slot but can be chosen, and resizing would re-animate
 * every mark and destroy the comparability a fixed length exists for.
 */
export function railMarks(
  state: ScenarioState,
  script: ScenarioScript,
  slots: number,
): RailMark[] {
  const outcomeOf = (sceneId: string, choiceId: string): ChoiceOutcome => {
    const scene = script.scenes.find((s) => s.id === sceneId);
    const choice = scene?.choices.find((c) => c.id === choiceId);
    // A run persisted against an older script can reference a choice that no
    // longer exists. It still happened, so it keeps its slot.
    return choice?.outcome ?? 'neutral';
  };

  const filled: RailMark[] = state.choiceHistory.map((h) => ({
    state: 'filled',
    outcome: outcomeOf(h.sceneId, h.choiceId),
    npcId: h.npcId,
    sceneId: h.sceneId,
  }));

  if (filled.length >= slots) return filled;
  return [
    ...filled,
    ...Array.from({ length: slots - filled.length }, () => ({ state: 'empty' as const })),
  ];
}
