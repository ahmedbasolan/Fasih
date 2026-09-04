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
 *
 * Tightening `bad` to −3 (a mistake the learner barely pays for teaches nothing)
 * surfaced three pre-existing choices at −2. Re-scoring them changes how those
 * scenarios play, which is a content decision and not this commit's business.
 * New offenders still fail; this list may only shrink.
 */
const KNOWN_TIER_BAND_VIOLATIONS: readonly string[] = [
  'gym-consultation/scene1/d',
  'gym-consultation/scene4/d',
  'the-checkup/scene1/d',
];

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
  it('every phrase in phrasesUnlocked exists in the phrase library', () => {
    const missing: string[] = [];
    for (const [id, script] of scriptEntries) {
      for (const pid of script.phrasesUnlocked ?? []) {
        if (!phraseIds.has(pid)) missing.push(`${id} → ${pid}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('every scenario unlocks at least one phrase', () => {
    const empty = scriptEntries
      .filter(([, s]) => (s.phrasesUnlocked ?? []).length === 0)
      .map(([id]) => id);
    expect(empty).toEqual([]);
  });

  it('every primerPhrase resolves and is a subset of phrasesUnlocked (2-3 chips)', () => {
    const broken: string[] = [];
    for (const [id, script] of scriptEntries) {
      const unlocked = script.phrasesUnlocked ?? [];
      for (const pid of script.primerPhrases ?? []) {
        if (!phraseIds.has(pid)) broken.push(`${id} primer → ${pid} not in library`);
        if (!unlocked.includes(pid)) broken.push(`${id} primer → ${pid} not in phrasesUnlocked`);
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
    const restricted = catalog.filter(s => s.requiresGender);
    expect(restricted.length).toBeGreaterThan(0); // guards the rule from silently lapsing
    expect(filterScenariosForLearner(catalog, undefined)).toHaveLength(catalog.length - restricted.length);
    expect(filterScenariosForLearner(catalog, 'female').map(s => s.id)).toEqual(
      expect.arrayContaining(restricted.filter(s => s.requiresGender === 'female').map(s => s.id)),
    );
  });

  // Café Connection stages a one-on-one encounter with an unrelated Emirati woman
  // ending in a personal number exchange. It is written for a female learner and
  // must not be served to a male one.
  it('cafe-friends is restricted to female learners', () => {
    expect(catalog.find(s => s.id === 'cafe-friends')?.requiresGender).toBe('female');
  });

  it('a gender-restricted script does not also carry arabicFeminine variants', () => {
    // Both mechanisms solving the same problem in one script means one of them
    // is dead code and the two will drift apart.
    const contradictions: string[] = [];
    for (const meta of catalog.filter(s => s.requiresGender)) {
      const script = scripts[meta.id];
      if (!script) continue;
      for (const scene of script.scenes) {
        for (const choice of scene.choices) {
          if (choice.arabicFeminine) contradictions.push(`${meta.id}/${scene.id}/${choice.id}`);
        }
      }
    }
    expect(contradictions).toEqual([]);
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

type Path = { total: number; flags: Set<string>; excellents: number; goods: number; bads: number; steps: number };

/** Walk every route through a script, honouring branches and flag-gated choices. */
function enumeratePaths(script: ScenarioScript): Path[] {
  const byId = new Map(script.scenes.map(s => [s.id, s]));
  const order = script.scenes.map(s => s.id);
  const out: Path[] = [];

  const walk = (sceneId: string | null, path: Path, depth: number) => {
    if (!sceneId || depth > 24 || out.length > 60000) {
      out.push(path);
      return;
    }
    const scene = byId.get(sceneId);
    if (!scene) {
      out.push(path);
      return;
    }
    const visible = scene.choices.filter(c => !c.requiredFlag || path.flags.has(c.requiredFlag));
    if (visible.length === 0) {
      out.push(path);
      return;
    }
    for (const choice of visible) {
      const flags = new Set(path.flags);
      if (choice.flag) flags.add(choice.flag);
      const next: Path = {
        total: path.total + impactOf(choice),
        flags,
        excellents: path.excellents + (choice.outcome === 'excellent' ? 1 : 0),
        goods: path.goods + (choice.outcome === 'good' ? 1 : 0),
        bads: path.bads + (choice.outcome === 'bad' ? 1 : 0),
        steps: path.steps + 1,
      };
      const idx = order.indexOf(sceneId);
      const linear: string | null = order[idx + 1] ?? null;
      let target: string | null = choice.next ?? linear;
      // Bonus scenes are gated by the secret ending in ScenarioPlayer, not by
      // linear progression — only continue into one when the secret is earned.
      if (target && byId.get(target)?.bonus) {
        const secret = script.endings.find(e => e.secret);
        const earned =
          !!secret &&
          (secret.requiredFlags ?? []).every(f => next.flags.has(f)) &&
          next.total >= secret.min;
        if (!earned) target = null;
      }
      walk(target, next, depth + 1);
    }
  };

  const first = script.scenes.find(s => !s.bonus);
  walk(first?.id ?? null, { total: 0, flags: new Set(), excellents: 0, goods: 0, bads: 0, steps: 0 }, 0);
  return out;
}

/** Mirrors evaluateEnding, resolving a path to the ending title it earns. */
function endingFor(script: ScenarioScript, path: Path): string {
  for (const e of script.endings.filter(x => x.secret)) {
    if ((e.requiredFlags ?? []).every(f => path.flags.has(f)) && path.total >= e.min) return e.title;
  }
  const standard = [...script.endings].filter(e => !e.secret).sort((a, b) => b.min - a.min);
  return (standard.find(e => path.total >= e.min) ?? standard[standard.length - 1]).title;
}

describe('score paths', () => {
  const table = scriptEntries.map(([id, script]) => {
    const paths = enumeratePaths(script);
    return { id, script, paths, reached: new Set(paths.map(p => endingFor(script, p))) };
  });

  it.each(table)('$id — every ending is reachable by some play-through', ({ script, reached }) => {
    const unreachable = script.endings.map(e => e.title).filter(t => !reached.has(t));
    expect(unreachable).toEqual([]);
  });

  it.each(table)('$id — the top ending does not require a flawless run', ({ script, paths }) => {
    const top = [...script.endings].filter(e => !e.secret).sort((a, b) => b.min - a.min)[0];
    const imperfect = paths.filter(p => p.excellents < p.steps && endingFor(script, p) === top.title);
    expect(imperfect.length).toBeGreaterThan(0);
  });

  // One bad moment in an otherwise strong run must not tank the learner. Runs
  // that were bad AND passive (bad + coasting on neutrals) legitimately can.
  it.each(table)('$id — one mistake in an otherwise good run does not reach the worst ending', ({ script, paths }) => {
    const standard = [...script.endings].filter(e => !e.secret).sort((a, b) => b.min - a.min);
    const worst = standard[standard.length - 1];
    const oneMistakeOtherwiseStrong = paths.filter(
      p => p.bads === 1 && p.goods + p.excellents === p.steps - 1 && endingFor(script, p) === worst.title,
    );
    expect(oneMistakeOtherwiseStrong).toHaveLength(0);
  });

  it.each(table.filter(t => t.script.endings.some(e => e.secret)))(
    '$id — the secret ending is strictly harder than the best standard ending',
    ({ script, paths }) => {
      const secret = script.endings.find(e => e.secret)!;
      const secretPaths = paths.filter(p => endingFor(script, p) === secret.title);
      expect(secretPaths.length).toBeGreaterThan(0);
      // Holding the flags alone must not be enough.
      const flaggedButPoor = paths.filter(
        p => (secret.requiredFlags ?? []).every(f => p.flags.has(f)) && p.total < secret.min,
      );
      expect(flaggedButPoor.length).toBeGreaterThan(0);
    },
  );
});
