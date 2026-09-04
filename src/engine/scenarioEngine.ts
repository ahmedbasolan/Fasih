import type {
  ScenarioState,
  ScenarioChoice,
  ScenarioScene,
  ScenarioScript,
  ScenarioEnding,
  Tone,
  ImpactDelta,
} from '../types';

// ─── Relationship scoring ────────────────────────────────────────────────────
// The three meters the learner sees (trust / respect / culture) ARE the currency.
// Tone and endings are both derived from them, so the bar on screen and the
// outcome the learner earns can never disagree.
//
// `choice.score` is retained only as an XP / analytics figure. It is never read
// by getTone or evaluateEnding — a choice that costs trust must actually cost
// the learner something, or the cultural lesson attached to it is a lie.

const ZERO_IMPACT: ImpactDelta = { trust: 0, respect: 0, culture: 0 };

/** Sum of a single relationship delta. */
export function impactTotal(delta: ImpactDelta): number {
  return delta.trust + delta.respect + delta.culture;
}

/** Accumulated relationship standing with one specific NPC. */
export function npcRelationship(state: ScenarioState, npcId: string): number {
  return impactTotal(state.impactByNpc[npcId] ?? ZERO_IMPACT);
}

/** Accumulated relationship standing across every NPC met in this run. */
export function relationshipScore(state: ScenarioState): number {
  return Object.values(state.impactByNpc).reduce((sum, d) => sum + impactTotal(d), 0);
}

// ─── applyChoice ─────────────────────────────────────────────────────────────
/**
 * Given the current run state and a choice the user just made, returns a new
 * ScenarioState with:
 *  - the choice's flag added to flags (if it has one)
 *  - the choice's impact merged into impactByNpc[npcId]  ← drives tone + endings
 *  - choice.score added to totalScore                    ← XP / analytics only
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
  const prev: ImpactDelta = state.impactByNpc[npcId] ?? ZERO_IMPACT;
  const delta = choice.impact ?? ZERO_IMPACT;

  const newFlags = new Set(state.flags);
  if (choice.flag) newFlags.add(choice.flag);

  return {
    ...state,
    flags: newFlags,
    totalScore: state.totalScore + choice.score,
    scoreByNpc: {
      ...state.scoreByNpc,
      [npcId]: (state.scoreByNpc[npcId] ?? 0) + choice.score,
    },
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
 * Determines NPC warmth for a scene from the learner's standing with THAT NPC
 * (trust + respect + culture accumulated so far), so a character you have
 * treated well greets you warmly even if another character in the same run
 * has been alienated.
 *
 * Returns 'neutral' if the scene has no charDialogue variants defined.
 */
export function getTone(
  state: ScenarioState,
  npcId: string,
  scene: ScenarioScene,
): Tone {
  if (!scene.charDialogue) return 'neutral';
  const score = npcRelationship(state, npcId);
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
  if (choice.next !== undefined) return choice.next;
  const idx = script.scenes.findIndex(s => s.id === state.currentSceneId);
  return script.scenes[idx + 1]?.id ?? null;
}

// ─── evaluateEnding ───────────────────────────────────────────────────────────
/**
 * Determines which ending the player earned, from their total relationship
 * standing across all NPCs.
 * Secret endings are checked first (most restrictive).
 * Standard endings are checked in descending min-score order.
 * Falls back to the last ending in the array if nothing matches.
 */
export function evaluateEnding(
  state: ScenarioState,
  script: ScenarioScript,
): ScenarioEnding {
  const score = relationshipScore(state);

  // Check secret endings first
  for (const ending of script.endings.filter(e => e.secret)) {
    const flagsMet = (ending.requiredFlags ?? []).every(f => state.flags.has(f));
    if (flagsMet && score >= ending.min) return ending;
  }

  // Standard endings — highest min wins
  const standard = [...script.endings]
    .filter(e => !e.secret)
    .sort((a, b) => b.min - a.min);

  if (standard.length === 0) throw new Error(`evaluateEnding: script "${script.id}" has no standard endings`);

  return standard.find(e => score >= e.min) ?? standard[standard.length - 1];
}

// ─── isChoiceVisible ─────────────────────────────────────────────────────────
/**
 * Returns true if this choice should be rendered for the player.
 *
 * A choice with requiredFlag is only shown when that flag has already been set
 * by a previous choice. This enables branching dialogue paths where an option
 * only appears after a specific cultural action has been taken earlier.
 *
 * Choices without a requiredFlag are always visible.
 */
export function isChoiceVisible(
  choice: ScenarioChoice,
  state: ScenarioState,
): boolean {
  if (!choice.requiredFlag) return true;
  return state.flags.has(choice.requiredFlag);
}
