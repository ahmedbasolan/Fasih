/**
 * Content integrity + score-path tests for the scenario dataset.
 *
 * These are not engine tests — they check that the *scripts* obey the teaching
 * rules the engine assumes. They exist because the failures they catch (a phrase
 * that unlocks nothing, an ending nobody can reach, a "good" choice that costs
 * the learner points) are invisible in TypeScript and only surface as a confusing
 * lesson for the user.
 */
import {
  getScenarioScripts,
  getAllScenarios,
  isScenarioAvailableFor,
  filterScenariosForLearner,
} from '../../constants/scenarios';
import { PHRASES } from '../../constants/phrases';
import { darkTheme } from '../../components/design/tokens';
import { allPhraseIds, isRouteScript, relationshipScore } from '../scenarioEngine';
import { enumerateRuns, routeScriptProblems, type PlayedRun } from '../scenarioRules';
import type { ScenarioScript, ScenarioScene, ScenarioChoice } from '../../types';

const scripts = getScenarioScripts(darkTheme);
const scriptEntries = Object.entries(scripts);
const phraseIds = new Set(PHRASES.map(p => p.id));

const impactOf = (c: ScenarioChoice) =>
  (c.impact?.trust ?? 0) + (c.impact?.respect ?? 0) + (c.impact?.culture ?? 0);

/**
 * Impact bands now live in `src/constants/curriculum.ts`, imported here.
 *
 * They used to be declared locally, which let this file and the
 * `fasih-scenario-review` checklist disagree about what a "bad" choice costs —
 * the checklist said −3..−9, this file said −1..−9, and the suite passed with
 * three "bad" choices costing only −2. One home per rule.
 */
import { TIER_BANDS } from '../../constants/curriculum';

/**
 * Choices whose impact sits outside its tier band, recorded rather than fixed.
 * New offenders fail; this list may only shrink. Emptied when gym-consultation
 * and the-checkup — the only offenders — were cut for the MVP.
 */
const KNOWN_TIER_BAND_VIOLATIONS: readonly string[] = [];

const eachChoice = (fn: (c: ScenarioChoice, s: ScenarioScene, script: ScenarioScript, id: string) => void) => {
  for (const [id, script] of scriptEntries) {
    for (const scene of script.scenes) {
      for (const choice of scene.choices) fn(choice, scene, script, id);
    }
  }
};

/** The only endingType values the app is allowed to branch on. */
const ENDING_TYPES = ['exceptional', 'success', 'mixed', 'failed'] as const;

describe('bonus scenes', () => {
  // ScenarioScene.bonus is documented as "only shown for secret ending". Bonus
  // scenes live in the same scenes[] array as the main path, so linear
  // progression used to walk straight into them — every player saw the bonus
  // scene and the secret-ending gate could never fire. ScenarioPlayer.next()
  // now skips them; these guard the content side of that contract.

  it('a script with a bonus scene also has a secret ending to unlock it', () => {
    const offenders: string[] = [];
    for (const [id, script] of scriptEntries) {
      if (!script.scenes.some(s => s.bonus === true)) continue;
      if (!script.endings.some(e => e.secret)) {
        offenders.push(`${id}: has a bonus scene but no secret ending — it is unreachable`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('no script is made entirely of bonus scenes', () => {
    const offenders: string[] = [];
    for (const [id, script] of scriptEntries) {
      if (script.scenes.filter(s => s.bonus !== true).length === 0) {
        offenders.push(`${id}: has no non-bonus scenes`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('no choice branches directly into a bonus scene', () => {
    // A bonus scene is earned by the secret-ending gate, not routed to by a
    // choice — a `next` pointing at one would bypass the flag/score check.
    for (const [id, script] of scriptEntries) {
      const bonusIds = new Set(script.scenes.filter(s => s.bonus === true).map(s => s.id));
      if (bonusIds.size === 0) continue;
      for (const scene of script.scenes) {
        for (const choice of scene.choices) {
          if (choice.next && bonusIds.has(choice.next)) {
            throw new Error(`"${id}" scene "${scene.id}" choice "${choice.id}" branches into bonus scene "${choice.next}"`);
          }
        }
      }
    }
  });
});

describe('ending types', () => {
  // SituationalConfidence branched on 'success_strong', which is not a member of
  // ScenarioEnding['type']. TypeScript could not catch it because the store
  // widens completedScenarios to `endingType: string`. This is the guard.
  it('every ending declares a known type', () => {
    const offenders: string[] = [];
    for (const [id, script] of scriptEntries) {
      for (const ending of script.endings) {
        if (!(ENDING_TYPES as readonly string[]).includes(ending.type)) {
          offenders.push(`${id} / "${ending.title}": unknown type "${ending.type}"`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

// ─── Data integrity ──────────────────────────────────────────────────────────

describe('scenario data integrity', () => {
  it('every phrase a scenario can grant exists in the phrase library', () => {
    const missing: string[] = [];
    for (const [id, script] of scriptEntries) {
      for (const pid of allPhraseIds(script)) {
        if (!phraseIds.has(pid)) missing.push(`${id} → ${pid}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('every scenario grants at least one core phrase — failure included', () => {
    const empty = scriptEntries
      .filter(([, s]) => s.phrases.core.length === 0)
      .map(([id]) => id);
    expect(empty).toEqual([]);
  });

  it('every primerPhrase resolves and is a core phrase (2-3 chips)', () => {
    const broken: string[] = [];
    for (const [id, script] of scriptEntries) {
      // Core only: a primer promises a phrase the learner will earn this run,
      // whichever ending they reach.
      const core = script.phrases.core;
      for (const pid of script.primerPhrases ?? []) {
        if (!phraseIds.has(pid)) broken.push(`${id} primer → ${pid} not in library`);
        if (!core.includes(pid)) broken.push(`${id} primer → ${pid} not in phrases.core`);
      }
      const n = (script.primerPhrases ?? []).length;
      if (n > 0 && (n < 2 || n > 3)) broken.push(`${id} has ${n} primer phrases (want 2-3)`);
    }
    expect(broken).toEqual([]);
  });

  it('every playable scenario has a primer (hear now → earn later)', () => {
    const missing = scriptEntries
      .filter(([, s]) => !s.id.startsWith('onboarding') && (s.primerPhrases ?? []).length === 0)
      .map(([id]) => id);
    expect(missing).toEqual([]);
  });

  it('every choice.next points at a real scene in the same script', () => {
    const broken: string[] = [];
    for (const [id, script] of scriptEntries) {
      const ids = new Set(script.scenes.map(s => s.id));
      for (const scene of script.scenes) {
        for (const choice of scene.choices) {
          if (choice.next && !ids.has(choice.next)) broken.push(`${id}/${scene.id}/${choice.id} → ${choice.next}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it('every requiredFlag is actually set by some earlier choice in the same script', () => {
    const orphans: string[] = [];
    for (const [id, script] of scriptEntries) {
      const settable = new Set(script.scenes.flatMap(s => s.choices.map(c => c.flag).filter(Boolean)));
      for (const scene of script.scenes) {
        for (const choice of scene.choices) {
          if (choice.requiredFlag && !settable.has(choice.requiredFlag)) {
            orphans.push(`${id}/${scene.id}/${choice.id} needs ${choice.requiredFlag}`);
          }
        }
      }
    }
    expect(orphans).toEqual([]);
  });

  it('every secret ending requiredFlag is settable in its script', () => {
    const orphans: string[] = [];
    for (const [id, script] of scriptEntries) {
      const settable = new Set(script.scenes.flatMap(s => s.choices.map(c => c.flag).filter(Boolean)));
      for (const ending of script.endings.filter(e => e.secret)) {
        for (const f of ending.requiredFlags ?? []) {
          if (!settable.has(f)) orphans.push(`${id} secret ending needs ${f}`);
        }
      }
    }
    expect(orphans).toEqual([]);
  });

  it('catalog metadata matches the real ending count', () => {
    const mismatches: string[] = [];
    for (const meta of getAllScenarios(darkTheme)) {
      const script = scripts[meta.id];
      if (!script) continue; // comingSoon scenarios have no script yet
      if (meta.endings !== script.endings.length) {
        mismatches.push(`${meta.id}: catalog says ${meta.endings}, script has ${script.endings.length}`);
      }
    }
    expect(mismatches).toEqual([]);
  });
});

// ─── Gender gating ───────────────────────────────────────────────────────────

describe('gender-restricted scenarios', () => {
  const catalog = getAllScenarios(darkTheme);

  it('an unrestricted scenario is available to everyone, gender unknown included', () => {
    expect(isScenarioAvailableFor({}, undefined)).toBe(true);
    expect(isScenarioAvailableFor({}, 'male')).toBe(true);
    expect(isScenarioAvailableFor({}, 'female')).toBe(true);
  });

  it('a restricted scenario is hidden when the gender is unknown — never guessed', () => {
    expect(isScenarioAvailableFor({ requiresGender: 'female' }, undefined)).toBe(false);
  });

  it('a restricted scenario shows only to the matching gender', () => {
    expect(isScenarioAvailableFor({ requiresGender: 'female' }, 'female')).toBe(true);
    expect(isScenarioAvailableFor({ requiresGender: 'female' }, 'male')).toBe(false);
  });

  it('filterScenariosForLearner drops exactly the restricted entries', () => {
    // Fixture list: no MVP scenario is gender-restricted, but the gate must keep working.
    const list = [
      { id: 'open' },
      { id: 'women-only', requiresGender: 'female' as const },
      { id: 'men-only', requiresGender: 'male' as const },
    ];
    expect(filterScenariosForLearner(list, undefined).map(s => s.id)).toEqual(['open']);
    expect(filterScenariosForLearner(list, 'female').map(s => s.id)).toEqual(['open', 'women-only']);
    expect(filterScenariosForLearner(list, 'male').map(s => s.id)).toEqual(['open', 'men-only']);
  });

  // MVP rule (spec 2026-09-14 §2.8): the same six scenarios for every learner.
  it('no MVP scenario is gender-restricted', () => {
    expect(catalog.filter(s => s.requiresGender).map(s => s.id)).toEqual([]);
  });

  // Both mechanisms solving the same problem in one script means one of them is
  // dead code and the two will drift apart.
  const genderContradictions = (
    list: { id: string; requiresGender?: 'male' | 'female' }[],
    byId: Record<string, { scenes: { id: string; choices: { id: string; arabicFeminine?: string }[] }[] }>,
  ): string[] => {
    const contradictions: string[] = [];
    for (const meta of list.filter(s => s.requiresGender)) {
      const script = byId[meta.id];
      if (!script) continue;
      for (const scene of script.scenes) {
        for (const choice of scene.choices) {
          if (choice.arabicFeminine) contradictions.push(`${meta.id}/${scene.id}/${choice.id}`);
        }
      }
    }
    return contradictions;
  };

  it('a gender-restricted script does not also carry arabicFeminine variants', () => {
    expect(genderContradictions(catalog, scripts)).toEqual([]);
  });

  // With nothing in the MVP catalog restricted, the check above runs an empty
  // loop and would pass even if broken. This keeps it proving something.
  it('the contradiction check catches a restricted script that has feminine variants', () => {
    const fixture = { scenes: [{ id: 's1', choices: [{ id: 'a' }, { id: 'b', arabicFeminine: 'x' }] }] };
    expect(genderContradictions([{ id: 'fx', requiresGender: 'female' }], { fx: fixture })).toEqual(['fx/s1/b']);
  });
});

// ─── Language hygiene ────────────────────────────────────────────────────────

describe('language hygiene', () => {
  // Catches English typed into an Arabic field ("قود مورننق", "وعساكum") — which
  // would be read aloud by the Arabic TTS and taught as if it were Arabic.
  it('no Latin letters inside Arabic fields', () => {
    const offenders: string[] = [];
    const check = (label: string, value: string | undefined) => {
      if (!value) return;
      const stripped = value.replace(/\[name\]/g, '').replace(/HIIT/g, '');
      if (/[A-Za-z]/.test(stripped)) offenders.push(`${label}: ${value}`);
    };
    for (const [id, script] of scriptEntries) {
      for (const scene of script.scenes) {
        check(`${id}/${scene.id} scene`, scene.arabic);
        for (const tone of ['warm', 'neutral', 'cold'] as const) {
          check(`${id}/${scene.id} ${tone}`, scene.charDialogue?.[tone]?.arabic);
        }
        for (const choice of scene.choices) {
          check(`${id}/${scene.id}/${choice.id}`, choice.arabic);
          check(`${id}/${scene.id}/${choice.id} fem`, choice.arabicFeminine);
        }
      }
      for (const ending of script.endings) check(`${id} ending "${ending.title}"`, ending.arabic);
    }
    expect(offenders).toEqual([]);
  });

  it('no stray double-quote artefacts in romanisation', () => {
    const offenders: string[] = [];
    eachChoice((c, s, _script, id) => {
      if (c.roman.includes('"')) offenders.push(`${id}/${s.id}/${c.id}: ${c.roman}`);
    });
    expect(offenders).toEqual([]);
  });

  it('every choice carries an explicit impact', () => {
    const missing: string[] = [];
    eachChoice((c, s, _script, id) => {
      if (!c.impact) missing.push(`${id}/${s.id}/${c.id}`);
    });
    expect(missing).toEqual([]);
  });
});

// ─── Scoring discipline ──────────────────────────────────────────────────────

describe('scoring discipline', () => {
  /** Choice keys currently outside their tier band. */
  const bandOffenders = (): string[] => {
    const out: string[] = [];
    eachChoice((c, s, _script, id) => {
      const band = TIER_BANDS[c.outcome];
      const total = impactOf(c);
      if (total < band.min || total > band.max) out.push(`${id}/${s.id}/${c.id}`);
    });
    return out.sort();
  };

  it('introduces no NEW choice outside its outcome tier band', () => {
    const known = new Set(KNOWN_TIER_BAND_VIOLATIONS);
    const added = bandOffenders().filter(k => !known.has(k));
    expect(added).toEqual([]);
  });

  it('KNOWN_TIER_BAND_VIOLATIONS lists nothing already fixed', () => {
    const current = new Set(bandOffenders());
    expect(KNOWN_TIER_BAND_VIOLATIONS.filter(k => !current.has(k))).toEqual([]);
  });

  it('no "good" or "excellent" choice has a negative total', () => {
    const offenders: string[] = [];
    eachChoice((c, s, _script, id) => {
      if ((c.outcome === 'good' || c.outcome === 'excellent') && impactOf(c) < 0) {
        offenders.push(`${id}/${s.id}/${c.id}`);
      }
    });
    expect(offenders).toEqual([]);
  });

  it('every scenario has at least one divergent choice (meters move opposite ways)', () => {
    const flat: string[] = [];
    for (const [id, script] of scriptEntries) {
      const hasDivergence = script.scenes.some(s =>
        s.choices.some(c => {
          const v = [c.impact?.trust ?? 0, c.impact?.respect ?? 0, c.impact?.culture ?? 0];
          return v.some(x => x > 0) && v.some(x => x < 0);
        }),
      );
      if (!hasDivergence) flat.push(id);
    }
    expect(flat).toEqual([]);
  });
});

// ─── Score-path table (every ending must be reachable) ───────────────────────
// Runs come from the real engine (scenarioRules.enumerateRuns), so fork routing,
// route endings and bonus-scene skipping match the shipped player exactly.

const tally = (run: PlayedRun) => ({
  steps: run.steps.length,
  excellents: run.steps.filter(s => s.choice.outcome === 'excellent').length,
  goods: run.steps.filter(s => s.choice.outcome === 'good').length,
  bads: run.steps.filter(s => s.choice.outcome === 'bad').length,
});

describe('score paths', () => {
  const table = scriptEntries.map(([id, script]) => {
    const runs = enumerateRuns(script);
    return { id, script, runs, reached: new Set(runs.map(r => r.ending.id)) };
  });
  // Legacy scripts rank endings on one ladder; route scripts get their own
  // rules below (routeScriptProblems), which cover reachability and missteps.
  const legacy = table.filter(t => !isRouteScript(t.script));

  it.each(legacy)('$id — every ending is reachable by some play-through', ({ script, reached }) => {
    const unreachable = script.endings.map(e => e.id).filter(id => !reached.has(id));
    expect(unreachable).toEqual([]);
  });

  it.each(legacy)('$id — the top ending does not require a flawless run', ({ script, runs }) => {
    const top = [...script.endings].filter(e => !e.secret).sort((a, b) => b.min - a.min)[0];
    const imperfect = runs.filter(r => tally(r).excellents < r.steps.length && r.ending.id === top.id);
    expect(imperfect.length).toBeGreaterThan(0);
  });

  // One bad moment in an otherwise strong run must not tank the learner. Runs
  // that were bad AND passive (bad + coasting on neutrals) legitimately can.
  it.each(legacy)('$id — one mistake in an otherwise good run does not reach the worst ending', ({ script, runs }) => {
    const standard = [...script.endings].filter(e => !e.secret).sort((a, b) => b.min - a.min);
    const worst = standard[standard.length - 1];
    const oneMistakeOtherwiseStrong = runs.filter(r => {
      const t = tally(r);
      return t.bads === 1 && t.goods + t.excellents === t.steps - 1 && r.ending.id === worst.id;
    });
    expect(oneMistakeOtherwiseStrong).toHaveLength(0);
  });

  it.each(table.filter(t => t.script.endings.some(e => e.secret)))(
    '$id — the secret ending is strictly harder than the best standard ending',
    ({ script, runs }) => {
      const secret = script.endings.find(e => e.secret)!;
      expect(runs.some(r => r.ending.id === secret.id)).toBe(true);
      // Holding the flags alone must not be enough.
      const flaggedButPoor = runs.filter(
        r => (secret.requiredFlags ?? []).every(f => r.state.flags.has(f)) && relationshipScore(r.state) < secret.min,
      );
      expect(flaggedButPoor.length).toBeGreaterThan(0);
    },
  );
});

// ─── Route scripts (spec 2026-09-14 §4) ──────────────────────────────────────

describe('route scripts', () => {
  // One test over all route scripts rather than it.each: until the first
  // rewrite lands there are none, and it.each([]) is an error, not a pass.
  it('every route script follows every route-script rule', () => {
    const problems = scriptEntries
      .filter(([, s]) => isRouteScript(s))
      .flatMap(([id, script]) => routeScriptProblems(script, phraseIds).map(p => `${id} — ${p}`));
    expect(problems).toEqual([]);
  });

  it('every script has unique, non-empty ending ids', () => {
    const offenders: string[] = [];
    for (const [id, script] of scriptEntries) {
      const ids = script.endings.map(e => e.id);
      if (ids.some(x => !x.trim())) offenders.push(`${id}: empty ending id`);
      if (new Set(ids).size !== ids.length) offenders.push(`${id}: duplicate ending ids`);
    }
    expect(offenders).toEqual([]);
  });

  // Rule 11. "Only 8% of users discover this" was invented. Rarity claims need
  // real data, and real data lives in community stats, never in authored copy.
  it('no ending text makes a percentage or rarity claim', () => {
    const claim = /%|\brare\b|\bfew (players|people|learners)\b|\bmost (players|people|learners)\b/i;
    const offenders: string[] = [];
    for (const [id, script] of scriptEntries) {
      for (const e of script.endings) {
        for (const text of [e.title, e.en, e.desc, e.hint ?? '', ...(e.culturalJourney ?? [])]) {
          if (claim.test(text)) offenders.push(`${id}/${e.id}: ${text.slice(0, 60)}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
