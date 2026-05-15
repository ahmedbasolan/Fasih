import type {
  ScenarioState,
  ScenarioChoice,
  ScenarioScene,
  ScenarioScript,
  ScenarioEnding,
  Tone,
  ImpactDelta,
} from '../types';

// ─── applyChoice ─────────────────────────────────────────────────────────────
/**
 * Given the current run state and a choice the user just made, returns a new
 * ScenarioState with:
 *  - the choice's flag added to flags (if it has one)
 *  - the choice's impact merged into impactByNpc[npcId]
 *  - choice.score added to totalScore
 *  - a new record appended to choiceHistory
 *
 * Pure: does not mutate state.
 */
export function applyChoice(
  state: ScenarioState,
  choice: ScenarioChoice,
  npcId: string,
  now: string = new Date().toISOString(),
): ScenarioState {
  const prev: ImpactDelta = state.impactByNpc[npcId] ?? { trust: 0, respect: 0, culture: 0 };
  const delta = choice.impact ?? { trust: 0, respect: 0, culture: 0 };

  const newFlags = new Set(state.flags);
  if (choice.flag) newFlags.add(choice.flag);

  return {
    ...state,
    flags: newFlags,
    totalScore: state.totalScore + choice.score,
    impactByNpc: {
      ...state.impactByNpc,
      [npcId]: {
        trust: prev.trust + delta.trust,
        respect: prev.respect + delta.respect,
        culture: prev.culture + delta.culture,
      },
    },
    choiceHistory: [
      ...state.choiceHistory,
      {
        sceneId: state.currentSceneId,
        choiceId: choice.id,
        npcId,
        timestamp: now,
      },
    ],
  };
}

// ─── getTone ─────────────────────────────────────────────────────────────────
/**
 * Determines NPC warmth for a scene based on accumulated totalScore.
 * totalScore (sum of choice.score) is used — not the T/R/C impact sum —
 * because script authors write warmThreshold/coldThreshold against choice.score.
 *
 * Returns 'neutral' if the scene has no charDialogue variants defined.
 */
export function getTone(
  state: ScenarioState,
  _npcId: string,
  scene: ScenarioScene,
): Tone {
  // _npcId is accepted for future per-NPC tone support. Currently totalScore is a
  // global accumulator and drives warmth for all NPCs — not per-NPC.
  if (!scene.charDialogue) return 'neutral';
  const score = state.totalScore;
  if (scene.warmThreshold !== undefined && score >= scene.warmThreshold) return 'warm';
  if (scene.coldThreshold !== undefined && score < scene.coldThreshold) return 'cold';
  return 'neutral';
}

// ─── resolveNextScene ─────────────────────────────────────────────────────────
/**
 * Returns the ID of the next scene to navigate to.
 * Priority: choice.next (explicit branch) → next scene in script array → null (end of script).
 */
export function resolveNextScene(
  state: ScenarioState,
  choice: ScenarioChoice,
  script: ScenarioScript,
): string | null {
  if (choice.next) return choice.next;
  const idx = script.scenes.findIndex(s => s.id === state.currentSceneId);
  return script.scenes[idx + 1]?.id ?? null;
}

// ─── evaluateEnding ───────────────────────────────────────────────────────────
/**
 * Determines which ending the player earned.
 * Secret endings are checked first (most restrictive).
 * Standard endings are checked in descending min-score order.
 * Falls back to the last ending in the array if nothing matches.
 */
export function evaluateEnding(
  state: ScenarioState,
  script: ScenarioScript,
): ScenarioEnding {
  const score = state.totalScore;

  // Check secret endings first
  for (const ending of script.endings.filter(e => e.secret)) {
    const flagsMet = (ending.requiredFlags ?? []).every(f => state.flags.has(f));
    if (flagsMet && score >= ending.min) return ending;
  }

  // Standard endings — highest min wins
  const standard = [...script.endings]
    .filter(e => !e.secret)
    .sort((a, b) => b.min - a.min);

  return standard.find(e => score >= e.min) ?? standard[standard.length - 1];
}

// ─── isChoiceVisible ─────────────────────────────────────────────────────────
/**
 * All choices are visible in the current build.
 * Butterfly effect is expressed through consequences, not by hiding options.
 * Reserved for flag-gated choices in a future iteration.
 */
export function isChoiceVisible(
  _choice: ScenarioChoice,
  _state: ScenarioState,
): boolean {
  return true;
}
