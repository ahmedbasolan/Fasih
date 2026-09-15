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

// ─── Routes ──────────────────────────────────────────────────────────────────
// Route scripts (spec 2026-09-14 §2.1) split an outcome in two: route tags on
// choices decide WHERE the run ends up, the meters decide HOW WELL. Routes are
// never shown during play — that is what keeps the destination non-obvious,
// where the visible meters alone would give it away.

/**
 * The route this run leans toward: the route tagged most often in
 * choiceHistory; a tie goes to the most recently tagged; no tags at all falls
 * back to `defaultRoute`.
 */
export function leadingRoute(state: ScenarioState, script: ScenarioScript): string {
  return leadingRouteOf(state.choiceHistory, script);
}

/** A choice made at a scene — all the route tally needs from a history entry. */
type ChoiceMade = Pick<ScenarioState['choiceHistory'][number], 'sceneId' | 'choiceId'>;

function leadingRouteOf(picks: readonly ChoiceMade[], script: ScenarioScript): string {
  const sceneById = new Map(script.scenes.map(s => [s.id, s]));
  const count = new Map<string, number>();
  const lastSeen = new Map<string, number>();

  picks.forEach(({ sceneId, choiceId }, i) => {
    const route = sceneById.get(sceneId)?.choices.find(c => c.id === choiceId)?.route;
    if (!route) return;
    count.set(route, (count.get(route) ?? 0) + 1);
    lastSeen.set(route, i);
  });

  let best: string | null = null;
  for (const [route, n] of count) {
    if (best === null) { best = route; continue; }
    const bestN = count.get(best) ?? 0;
    if (n > bestN || (n === bestN && (lastSeen.get(route) ?? -1) > (lastSeen.get(best) ?? -1))) best = route;
  }
  return best ?? script.defaultRoute;
}

// ─── resolveNextScene ─────────────────────────────────────────────────────────
/**
 * Returns the ID of the next scene to navigate to.
 * Priority: choice.next (explicit branch) → the fork (scene.nextByRoute, for
 * the leading route) → next scene in script array → null (end of script).
 *
 * Takes the state from BEFORE `choice` is applied, as ScenarioPlayer calls it.
 * The fork counts the pending choice itself, so the decision made at the fork
 * scene can tip which way the run goes.
 */
export function resolveNextScene(
  state: ScenarioState,
  choice: ScenarioChoice,
  script: ScenarioScript,
): string | null {
  if (choice.next !== undefined) return choice.next;
  const idx = script.scenes.findIndex(s => s.id === state.currentSceneId);
  if (idx < 0) return null;
  const fork = script.scenes[idx].nextByRoute;
  if (fork) {
    const route = leadingRouteOf(
      [...state.choiceHistory, { sceneId: state.currentSceneId, choiceId: choice.id }],
      script,
    );
    if (fork[route]) return fork[route];
  }
  return script.scenes[idx + 1]?.id ?? null;
}

// ─── Main path & bonus scene ─────────────────────────────────────────────────

/**
 * A resolved scene id as the main path sees it: bonus scenes are stepped over
 * (they live in the same array as everything else), so a target that is — or
 * is followed only by — bonus scenes means the main path is over.
 */
export function mainPathTarget(script: ScenarioScript, target: string | null): string | null {
  if (target === null) return null;
  let idx = script.scenes.findIndex(s => s.id === target);
  if (idx < 0) return null;
  while (idx < script.scenes.length && script.scenes[idx].bonus) idx++;
  return script.scenes[idx]?.id ?? null;
}

/**
 * Where the player goes after the current choice: the next main-path scene,
 * the bonus scene if the main path just ended on the hidden ending, or null
 * for the result screen.
 *
 * `state` is the state AFTER the choice was applied (flags and score count);
 * `resolved` is what resolveNextScene returned for it. Previously the player
 * followed `resolved` directly, so a bonus scene next in the array was played
 * by everyone and the hidden-ending gate never decided anything.
 */
export function sceneAfterChoice(
  state: ScenarioState,
  resolved: string | null,
  script: ScenarioScript,
): string | null {
  const current = script.scenes.find(s => s.id === state.currentSceneId);
  if (current?.bonus) return null;

  const next = mainPathTarget(script, resolved);
  if (next !== null) return next;

  const secret = script.endings.find(e => e.secret);
  const bonus = script.scenes.find(s => s.bonus);
  const earned =
    !!secret && !!bonus &&
    (secret.requiredFlags ?? []).every(f => state.flags.has(f)) &&
    relationshipScore(state) >= secret.min;
  return earned ? bonus.id : null;
}

// ─── evaluateEnding ───────────────────────────────────────────────────────────
/**
 * Determines which ending the player earned.
 *
 * Secret endings are checked first (flags AND relationship score). Otherwise
 * the leading route picks the destination: its strong version if the
 * relationship score clears the strong ending's `min`, its weak version if it
 * clears the weak ending's `min`, otherwise the failure ending.
 */
export function evaluateEnding(
  state: ScenarioState,
  script: ScenarioScript,
): ScenarioEnding {
  const score = relationshipScore(state);

  for (const ending of script.endings.filter(e => e.secret)) {
    const flagsMet = (ending.requiredFlags ?? []).every(f => state.flags.has(f));
    if (flagsMet && score >= ending.min) return ending;
  }

  const route = leadingRoute(state, script);
  const open = script.endings.filter(e => !e.secret);
  const strong = open.find(e => e.route === route && e.tier === 'strong');
  const weak = open.find(e => e.route === route && e.tier === 'weak');
  const failure = open.find(e => !e.route);
  if (!strong || !weak || !failure) {
    throw new Error(`evaluateEnding: script "${script.id}" needs strong + weak endings for route "${route}" and a failure ending`);
  }
  if (score >= strong.min) return strong;
  if (score >= weak.min) return weak;
  return failure;
}

// ─── Phrases ─────────────────────────────────────────────────────────────────

/** Phrase ids a run grants: the core set (failure included) plus the ending's own. */
export function phrasesEarned(script: ScenarioScript, ending: ScenarioEnding): string[] {
  return Array.from(new Set([...script.phrases.core, ...(script.phrases.byEnding[ending.id] ?? [])]));
}

/** Every phrase id the scenario can teach across all its endings. */
export function allPhraseIds(script: ScenarioScript): string[] {
  return Array.from(new Set([...script.phrases.core, ...Object.values(script.phrases.byEnding).flat()]));
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
