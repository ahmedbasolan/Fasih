/**
 * Route-script content rules — pure functions only. No React, no Zustand.
 *
 * Spec 2026-09-14 §4. These catch what TypeScript cannot and a playtest would
 * only catch by luck: a hidden ending that greedy play stumbles into, a
 * destination nobody can reach, an answer given away by being the longest line.
 *
 * Runs are simulated with the real engine (applyChoice / resolveNextScene /
 * evaluateEnding), so a rule failing here means the shipped player would
 * behave that way too — not that a test-only re-implementation disagrees.
 */
import type { ScenarioChoice, ScenarioEnding, ScenarioScene, ScenarioScript, ScenarioState } from '../types';
import { applyChoice, evaluateEnding, impactTotal, isChoiceVisible, mainPathTarget, resolveNextScene } from './scenarioEngine';
import { DECISIONS_PER_RUN, MAX_BEST_IS_LONGEST_SHARE } from '../constants/curriculum';

export interface PlayedRun {
  steps: { sceneId: string; choice: ScenarioChoice }[];
  state: ScenarioState;
  ending: ScenarioEnding;
}

/** Hard ceiling on enumerated runs; well above 4 choices × 6 decisions × a fork. */
const MAX_RUNS = 60000;
const MAX_DEPTH = 30;

const impactOf = (c: ScenarioChoice) => (c.impact ? impactTotal(c.impact) : 0);

function startState(script: ScenarioScript, firstSceneId: string): ScenarioState {
  return {
    scenarioId: script.id,
    currentSceneId: firstSceneId,
    flags: new Set(),
    impactByNpc: {},
    totalScore: 0,
    scoreByNpc: {},
    choiceHistory: [],
    scenesVisited: new Set([firstSceneId]),
    startedAt: '',
  };
}

type Picker = (visible: ScenarioChoice[]) => ScenarioChoice[];

function walk(script: ScenarioScript, pick: Picker): PlayedRun[] {
  const runs: PlayedRun[] = [];
  const byId = new Map(script.scenes.map(s => [s.id, s]));
  const first = script.scenes.find(s => !s.bonus);
  if (!first) return runs;

  const step = (state: ScenarioState, steps: PlayedRun['steps'], depth: number) => {
    if (runs.length >= MAX_RUNS) return;
    const scene = byId.get(state.currentSceneId);
    const visible = scene ? scene.choices.filter(c => isChoiceVisible(c, state)) : [];
    if (!scene || visible.length === 0 || depth >= MAX_DEPTH) {
      runs.push({ steps, state, ending: evaluateEnding(state, script) });
      return;
    }
    for (const choice of pick(visible)) {
      // Main path only — the bonus scene is not a decision the rules count.
      const target = mainPathTarget(script, resolveNextScene(state, choice, script));
      const applied = applyChoice(state, choice, scene.charName, '');
      const nextSteps = [...steps, { sceneId: scene.id, choice }];
      if (target === null) {
        runs.push({ steps: nextSteps, state: applied, ending: evaluateEnding(applied, script) });
        continue;
      }
      step(
        { ...applied, currentSceneId: target, scenesVisited: new Set([...applied.scenesVisited, target]) },
        nextSteps,
        depth + 1,
      );
    }
  };

  step(startState(script, first.id), [], 0);
  return runs;
}

/** Every main-path run through the script (bonus scenes excluded). */
export function enumerateRuns(script: ScenarioScript): PlayedRun[] {
  return walk(script, visible => visible);
}

/** The run a player gets by always taking the top-scoring visible choice (first on a tie). */
export function greedyRun(script: ScenarioScript): PlayedRun {
  return walk(script, visible => {
    const best = Math.max(...visible.map(impactOf));
    return [visible.find(c => impactOf(c) === best)!];
  })[0];
}

const TYPE_FOR_TIER = { strong: 'success', weak: 'mixed' } as const;

/**
 * Every rule a route script breaks, as `rule: detail` strings. Empty = clean.
 * `phraseIds` is the phrase library's id set.
 */
export function routeScriptProblems(script: ScenarioScript, phraseIds: ReadonlySet<string>): string[] {
  const out: string[] = [];
  const routes = new Set(script.routes.map(r => r.id));
  const sceneIds = new Set(script.scenes.map(s => s.id));
  const mainScenes = script.scenes.filter(s => !s.bonus);

  // ── Structure ──
  if (!script.defaultRoute || !routes.has(script.defaultRoute)) {
    out.push(`route: defaultRoute "${script.defaultRoute}" is not a declared route`);
  }
  for (const scene of script.scenes) {
    if (!scene.bonus && !scene.kind) out.push(`kind: ${scene.id} has no kind`);
    for (const choice of scene.choices) {
      if (choice.route !== undefined && !routes.has(choice.route)) {
        out.push(`route: ${scene.id}/${choice.id} leans to undeclared route "${choice.route}"`);
      }
    }
    if (scene.addressesLearner) {
      if (!scene.femaleLearner) out.push(`female: ${scene.id} addresses the learner but has no femaleLearner lines`);
      else if (scene.charDialogue && !scene.femaleLearner.charDialogue) {
        out.push(`female: ${scene.id} has toned dialogue but no toned femaleLearner lines`);
      }
    }
  }

  // ── Fork ──
  for (const scene of script.scenes) {
    if (!scene.nextByRoute) continue;
    for (const [route, target] of Object.entries(scene.nextByRoute)) {
      if (!routes.has(route)) out.push(`fork: ${scene.id} forks on undeclared route "${route}"`);
      if (!sceneIds.has(target)) { out.push(`fork: ${scene.id} → "${target}" is not a scene`); continue; }
      const variant = script.scenes.find(s => s.id === target)!;
      const loose = variant.choices.filter(c => c.next === undefined).map(c => c.id);
      if (loose.length) out.push(`fork: variant ${target} choices [${loose.join(', ')}] have no next`);
    }
  }

  // ── Endings ──
  const ids = script.endings.map(e => e.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) out.push(`endings: duplicate ids [${Array.from(new Set(dupes)).join(', ')}]`);
  const hidden = script.endings.filter(e => e.secret);
  const failures = script.endings.filter(e => !e.secret && !e.route);
  if (hidden.length !== 1) out.push(`endings: needs exactly one hidden ending, has ${hidden.length}`);
  if (failures.length !== 1) out.push(`endings: needs exactly one failure ending, has ${failures.length}`);
  for (const route of routes) {
    const strong = script.endings.filter(e => !e.secret && e.route === route && e.tier === 'strong');
    const weak = script.endings.filter(e => !e.secret && e.route === route && e.tier === 'weak');
    if (strong.length !== 1 || weak.length !== 1) {
      out.push(`endings: route "${route}" needs one strong and one weak ending`);
    } else if (strong[0].min <= weak[0].min) {
      out.push(`endings: route "${route}" strong min must be above weak min`);
    }
  }
  for (const e of script.endings) {
    const expected = e.secret ? 'exceptional' : e.route && e.tier ? TYPE_FOR_TIER[e.tier] : !e.route ? 'failed' : undefined;
    if (expected && e.type !== expected) out.push(`type: ${e.id} is "${e.type}", should be "${expected}"`);
    if (e.route && !routes.has(e.route)) out.push(`endings: ${e.id} belongs to undeclared route "${e.route}"`);
    const isFailure = !e.secret && !e.route;
    if (!isFailure && !e.hint?.trim()) out.push(`hint: ${e.id} has no hint`);
  }

  // ── Phrases (rule 10) ──
  if (script.phrases.core.length === 0) out.push('phrases: core is empty');
  for (const [endingId, list] of Object.entries(script.phrases.byEnding)) {
    if (!ids.includes(endingId)) out.push(`phrases: byEnding key "${endingId}" is not an ending`);
    for (const pid of list) if (!phraseIds.has(pid)) out.push(`phrases: ${endingId} → unknown phrase ${pid}`);
  }
  for (const pid of script.phrases.core) if (!phraseIds.has(pid)) out.push(`phrases: core → unknown phrase ${pid}`);

  // ── Scene kinds (rules 5, 6) ──
  for (const scene of mainScenes) {
    if (scene.kind === 'language') {
      if (scene.choices.some(c => c.route)) out.push(`language: ${scene.id} has route-tagged choices`);
      const excellent = scene.choices.filter(c => c.outcome === 'excellent').length;
      if (excellent !== 1) out.push(`language: ${scene.id} needs exactly one excellent choice, has ${excellent}`);
    }
    if (scene.kind === 'judgement') {
      const valid = scene.choices.filter(c => c.outcome !== 'bad');
      const untagged = valid.filter(c => !c.route).map(c => c.id);
      if (untagged.length) out.push(`judgement: ${scene.id} valid choices [${untagged.join(', ')}] have no route`);
      if (new Set(valid.map(c => c.route).filter(Boolean)).size < 2) {
        out.push(`judgement: ${scene.id} needs valid choices on at least two routes`);
      }
    }
  }

  // ── Rule 7: length is not a tell ──
  let tells = 0;
  for (const scene of mainScenes) {
    const best = Math.max(...scene.choices.map(impactOf));
    const top = scene.choices.filter(c => impactOf(c) === best);
    const longest = [...scene.choices].sort((a, b) => b.arabic.length - a.arabic.length)[0];
    if (top.length === 1 && longest === top[0]) tells++;
  }
  if (mainScenes.length && tells / mainScenes.length > MAX_BEST_IS_LONGEST_SHARE) {
    out.push(`longest: the top choice is the longest line in ${tells} of ${mainScenes.length} scenes`);
  }

  // Path rules need a well-formed script to simulate; stop if the ending set can't evaluate.
  if (out.some(p => p.startsWith('endings:') || p.startsWith('route:'))) return out;

  // ── Hidden ending (rules 1, 2) ──
  const secret = hidden[0];
  if (secret) {
    if (greedyRun(script).ending.id === secret.id) out.push('greedy: always taking the top choice reaches the hidden ending');
    const flags = secret.requiredFlags ?? [];
    const settersOf = (flag: string) =>
      mainScenes.flatMap(s => s.choices.filter(c => c.flag === flag).map(c => ({ scene: s, choice: c })));
    const scenesSetting = new Set(flags.flatMap(f => settersOf(f).map(x => x.scene.id)));
    const isTop = (scene: ScenarioScene, choice: ScenarioChoice) =>
      impactOf(choice) === Math.max(...scene.choices.map(impactOf));
    const offTop = flags.some(f => {
      const setters = settersOf(f);
      return setters.length > 0 && setters.every(x => !isTop(x.scene, x.choice));
    });
    if (flags.length < 2 || scenesSetting.size < 2 || !offTop) {
      out.push('hidden-flags: needs 2+ flags set in different scenes, at least one only by a non-top choice');
    }
  }

  // ── Paths (rules 3, 4, misstep) ──
  const runs = enumerateRuns(script);
  const reached = new Set(runs.map(r => r.ending.id));
  for (const e of script.endings) if (!reached.has(e.id)) out.push(`unreachable: ${e.id}`);

  const lengths = new Set(runs.map(r => r.steps.length));
  if (lengths.size !== 1 || !lengths.has(DECISIONS_PER_RUN)) {
    out.push(`decisions: paths make [${Array.from(lengths).sort().join(', ')}] decisions, every path must make ${DECISIONS_PER_RUN}`);
  }

  const failure = failures[0];
  const failedAfterOneSlip = runs.some(r => {
    const bads = r.steps.filter(st => st.choice.outcome === 'bad').length;
    const solid = r.steps.filter(st => st.choice.outcome === 'good' || st.choice.outcome === 'excellent').length;
    return bads === 1 && solid === r.steps.length - 1 && r.ending.id === failure?.id;
  });
  if (failedAfterOneSlip) out.push('misstep: a run with one misstep and otherwise valid choices reaches the failure ending');

  return out;
}
