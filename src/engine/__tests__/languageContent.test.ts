/**
 * Language-authority lint.
 *
 * Enforces the rules in `src/constants/curriculum.ts` against the actual Arabic
 * content. Companion to `scenarioContent.test.ts`, which checks teaching
 * structure; this file checks the *language*.
 *
 * ─── Why a ratchet, not a red suite ──────────────────────────────────────────
 * The design spec expected this lint to "fail loudly at first, and that is the
 * point." In practice a permanently-red suite gets ignored within a week, and a
 * lint nobody reads enforces nothing.
 *
 * So known violations are recorded explicitly below and the test asserts the set
 * has not GROWN. That gives both properties: every outstanding violation stays
 * visible in source, and any new one fails CI immediately. The allowlists are
 * also asserted to be exactly right — fixing a violation without removing it
 * from its list fails too, so the lists cannot rot into permanent excuses.
 */
import { getScenarioScripts, getAllScenarios, getOnboardingScenarios } from '../../constants/scenarios';
import { PHRASES } from '../../constants/phrases';
import { STRINGS } from '../../constants/strings';
import { darkTheme } from '../../components/design/tokens';
import {
  LEVEL_SPECS,
  LEVEL_EXEMPT_SCENARIOS,
  DIALECT_FEATURES,
  MSA_BLOCKLIST,
  PREFERRED_FORMS,
  SOURCES,
  CONTEMPORARY_SOURCE_MIN_YEAR,
  findMSAForms,
  inRange,
  isValidCitation,
  type SourceId,
} from '../../constants/curriculum';
import {
  countMorphemes,
  countClauses,
  countArabicWords,
  hasDisallowedTashkeel,
} from '../arabicMetrics';
import { isRouteScript, phrasesEarned } from '../scenarioEngine';
import { enumerateRuns } from '../scenarioRules';
import type { DifficultyLevel } from '../../types';

const scripts = getScenarioScripts(darkTheme);
const catalog = [...getAllScenarios(darkTheme), ...getOnboardingScenarios(darkTheme)];

// ─── Collecting learner-facing Arabic ────────────────────────────────────────

/**
 * Every Arabic string a LEARNER READS AS CONTENT, tagged with where it lives.
 *
 * Scope matters more than it looks. `أريد` appears exactly once in the app —
 * inside an English teaching note that contrasts it with Gulf `أبي`. Linting
 * notes would flag that as a violation when it is the note doing its job. So
 * this collects only the fields the learner is meant to say or hear, and never
 * notes, cultural notes, pronTips, or any English prose.
 */
interface Line {
  where: string;
  arabic: string;
}

function learnerFacingLines(): Line[] {
  const out: Line[] = [];
  const add = (where: string, arabic?: string) => {
    if (arabic && /[؀-ۿ]/.test(arabic)) out.push({ where, arabic });
  };

  for (const p of PHRASES) add(`phrase:${p.id}`, p.arabic);

  for (const [id, script] of Object.entries(scripts)) {
    for (const scene of script.scenes) {
      add(`${id}/${scene.id}/npc`, scene.arabic);
      if (scene.charDialogue) {
        add(`${id}/${scene.id}/npc-warm`, scene.charDialogue.warm.arabic);
        add(`${id}/${scene.id}/npc-neutral`, scene.charDialogue.neutral.arabic);
        add(`${id}/${scene.id}/npc-cold`, scene.charDialogue.cold.arabic);
      }
      // What a female learner hears instead — same rules, or they are a back door.
      if (scene.femaleLearner) {
        add(`${id}/${scene.id}/npc-f`, scene.femaleLearner.arabic);
        const toned = scene.femaleLearner.charDialogue;
        if (toned) {
          add(`${id}/${scene.id}/npc-f-warm`, toned.warm.arabic);
          add(`${id}/${scene.id}/npc-f-neutral`, toned.neutral.arabic);
          add(`${id}/${scene.id}/npc-f-cold`, toned.cold.arabic);
        }
      }
      for (const c of scene.choices) {
        add(`${id}/${scene.id}/${c.id}`, c.arabic);
        add(`${id}/${scene.id}/${c.id}-fem`, c.arabicFeminine);
      }
    }
    for (const e of script.endings) add(`${id}/ending:${e.type}`, e.arabic);
  }

  // UI Arabic from STRINGS.
  //
  // This was a hole. The collector covered phrases.ts and scenarios.ts, so
  // Arabic written into strings.ts — the onboarding greeting, the gender
  // examples, the first-phrase screen — was subject to no MSA check and no
  // tashkeel check at all. Moving Arabic out of a component and into STRINGS
  // satisfied the strings rule while quietly leaving the language rules behind.
  //
  // Walked generically rather than by naming keys, so a new Arabic string
  // cannot be added anywhere in STRINGS without being checked. Functions are
  // called with a placeholder to reach the Arabic in template literals.
  const walkStrings = (node: unknown, path: string) => {
    if (typeof node === 'string') { add(`strings:${path}`, node); return; }
    if (typeof node === 'function') {
      try { walkStrings((node as (...a: unknown[]) => unknown)('X'), path); } catch { /* not a 1-arg formatter */ }
      return;
    }
    if (Array.isArray(node)) { node.forEach((v, i) => walkStrings(v, `${path}[${i}]`)); return; }
    if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) walkStrings(v, `${path}.${k}`);
    }
  };
  walkStrings(STRINGS, '');

  return out;
}

const LINES = learnerFacingLines();

/** Choice cards only — what the learner is asked to produce. Level gates use these. */
function choiceCards(scriptId: string): string[] {
  const script = scripts[scriptId];
  if (!script) return [];
  return script.scenes
    .flatMap(s => s.choices)
    .map(c => c.arabic)
    .filter(a => countArabicWords(a) > 0);
}

/**
 * Turns a learner actually plays, as a [shortest, longest] pair.
 *
 * Not `scenes.length`. `first-morning` declares eight main scenes but forks twice,
 * so any single playthrough visits six — counting scenes would have marked it
 * two turns longer than a learner ever experiences. Bonus scenes are excluded: they
 * only appear on a secret ending. Runs come from the real engine, so a route
 * script's fork is followed exactly as the player follows it.
 */
function turnsPerPlaythrough(scriptId: string): { min: number; max: number } {
  const lengths = enumerateRuns(scripts[scriptId]).map(r => r.steps.length);
  return { min: Math.min(...lengths), max: Math.max(...lengths) };
}

/** Catalog entries that have a script and are not exempt from level gates. */
function gatedScenarios(): Array<{ id: string; scriptId: string; level: DifficultyLevel }> {
  const out: Array<{ id: string; scriptId: string; level: DifficultyLevel }> = [];
  for (const meta of catalog) {
    if (LEVEL_EXEMPT_SCENARIOS.includes(meta.id)) continue;
    const scriptId = scripts[meta.id] ? meta.id : `${meta.id}-career`;
    if (!scripts[scriptId]) continue; // comingSoon scenarios have no script yet
    out.push({ id: meta.id, scriptId, level: meta.level });
  }
  return out;
}

// ─── Known violations (must shrink, must never grow) ─────────────────────────

/**
 * Scenarios currently outside the band their declared level claims.
 *
 * Each entry is `scenarioId:gate`. Empty since 2026-09-15: the 2026-09-03 audit's
 * worst offenders (the-checkup, gym-consultation) were cut for the MVP, and the
 * six MVP scenarios were rewritten as route scripts inside their bands.
 *
 * Any new entry is a content decision — re-level the scenario or edit its cards —
 * and should be rare enough to explain in the commit that adds it.
 */
const KNOWN_LEVEL_VIOLATIONS: readonly string[] = [];

/**
 * Scenarios whose choice cards contain no DIALECT_FEATURES at all.
 *
 * Empty since hotel-guest — the one case, whose difficulty was formal register
 * rather than dialect grammar — was cut for the MVP.
 */
const KNOWN_DIALECT_GAPS: readonly string[] = [];

describe('curriculum spec is internally consistent', () => {
  it('every difficulty level has a spec', () => {
    const levels: DifficultyLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
    expect(levels.every(l => LEVEL_SPECS[l] !== undefined)).toBe(true);
  });

  it('morpheme bands are ordered and do not overlap', () => {
    const order: DifficultyLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
    for (let i = 0; i < order.length - 1; i++) {
      const lo = LEVEL_SPECS[order[i]].meanMorphemes;
      const hi = LEVEL_SPECS[order[i + 1]].meanMorphemes;
      expect(lo.max).toBeLessThan(hi.min);
    }
  });

  it('every range is non-empty', () => {
    const inverted: string[] = [];
    for (const spec of Object.values(LEVEL_SPECS)) {
      const ranges = {
        turns: spec.turns,
        phrasesUnlocked: spec.phrasesUnlocked,
        meanMorphemes: spec.meanMorphemes,
      };
      for (const [name, r] of Object.entries(ranges)) {
        if (r.min > r.max) inverted.push(`${spec.tier}.${name} is ${r.min}..${r.max}`);
      }
    }
    expect(inverted).toEqual([]);
  });

  it('ceilings sit above their own band maximum', () => {
    for (const spec of Object.values(LEVEL_SPECS)) {
      expect(spec.morphemeCeiling).toBeGreaterThan(spec.meanMorphemes.max);
    }
  });

  it('each dialect feature cites a source valid for its claim', () => {
    const bad = DIALECT_FEATURES.filter(f => !isValidCitation({
      ref: f.source, locator: f.label, claim: f.claim,
    })).map(f => `${f.id} cites ${f.source} for ${f.claim}`);
    expect(bad).toEqual([]);
  });

  it('dialect feature ids are unique', () => {
    const ids = DIALECT_FEATURES.map(f => f.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it('historical grammars are restricted to morphosyntax', () => {
    for (const id of ['qafisheh-1977', 'holes-1990'] as SourceId[]) {
      expect(SOURCES[id].year).toBeLessThan(CONTEMPORARY_SOURCE_MIN_YEAR);
      expect(SOURCES[id].validFor).toEqual(['morphosyntax']);
    }
  });

  it('a pre-2020 source cannot be cited for lexeme, usage or register', () => {
    for (const claim of ['lexeme', 'usage', 'register'] as const) {
      expect(isValidCitation({ ref: 'qafisheh-1977', locator: 'p.1', claim })).toBe(false);
      expect(isValidCitation({ ref: 'holes-1990', locator: 'p.1', claim })).toBe(false);
    }
    expect(isValidCitation({ ref: 'qafisheh-1977', locator: 'p.1', claim: 'morphosyntax' })).toBe(true);
  });

  it('unsourced is never a valid citation', () => {
    expect(isValidCitation({ ref: 'unsourced', locator: '', claim: 'morphosyntax' })).toBe(false);
  });

  it('MSA blocklist and preferred-forms list do not overlap', () => {
    const blocked = new Set(MSA_BLOCKLIST.map(f => f.msa));
    const overlap = PREFERRED_FORMS.filter(f => blocked.has(f.msa)).map(f => f.msa);
    expect(overlap).toEqual([]);
  });
});

describe('the collector reaches every Arabic source', () => {
  // A collector that silently returns nothing passes every check below it. This
  // is the same guard the blocklist has, applied to coverage instead of regex.
  it('collects Arabic from phrases, scenarios AND strings', () => {
    const where = LINES.map(l => l.where);
    expect(where.some(w => w.startsWith('phrase:'))).toBe(true);
    expect(where.some(w => w.includes('/ending:'))).toBe(true);
    expect(where.some(w => w.startsWith('strings:'))).toBe(true);
  });

  it('reaches Arabic returned by a STRINGS formatter, not just literals', () => {
    // `greetingFull` builds its Arabic in a template literal, so it is only
    // visible if the walker calls the function.
    expect(LINES.some(l => l.where === 'strings:.onboarding.greetingFull')).toBe(true);
  });
});

describe('no MSA in learner-facing Arabic', () => {
  it('contains no blocklisted MSA form', () => {
    const found = LINES.flatMap(l =>
      findMSAForms(l.arabic).map(f => `${l.where}: "${f.msa}" should be ${f.gulf} — ${l.arabic}`),
    );
    expect(found).toEqual([]);
  });

  it('the blocklist actually fires when an MSA form is present', () => {
    // Guards against a regex refactor silently disabling the whole check.
    expect(findMSAForms('ماذا تريد؟').length).toBeGreaterThan(0);
    expect(findMSAForms('أنا زين مشكور').length).toBe(0);
  });

  it('does not flag MSA forms that appear inside English teaching notes', () => {
    // `أريد` legitimately appears in grammar.ts prose contrasting it with أبي.
    // If this ever fails, the collector has widened past learner-facing fields.
    const noteLike = LINES.filter(l => l.where.includes('note') || l.where.includes('Note'));
    expect(noteLike).toEqual([]);
  });
});

describe('orthography', () => {
  it('carries no MSA vowel marks (shadda and conventional tanwin excepted)', () => {
    const bad = LINES
      .filter(l => hasDisallowedTashkeel(l.arabic))
      .map(l => `${l.where}: ${l.arabic}`);
    expect(bad).toEqual([]);
  });

  it('the tashkeel check fires on vocalised text and not on bare text', () => {
    expect(hasDisallowedTashkeel('صَرَاحَة')).toBe(true);
    expect(hasDisallowedTashkeel('صراحة')).toBe(false);
    expect(hasDisallowedTashkeel('شكراً')).toBe(false); // conventional tanwin
    expect(hasDisallowedTashkeel('عليّ')).toBe(false);  // shadda is consonantal
  });
});

describe('level gates', () => {
  /** Recomputes the current violation set from content. */
  function currentViolations(): string[] {
    const out: string[] = [];
    for (const { id, scriptId, level } of gatedScenarios()) {
      const spec = LEVEL_SPECS[level];
      const script = scripts[scriptId];
      const cards = choiceCards(scriptId);
      if (!cards.length) continue;

      const turns = turnsPerPlaythrough(scriptId);
      // What one run can grant: core plus the largest single ending's set.
      const phrases = Math.max(...script.endings.map(e => phrasesEarned(script, e).length));
      const morphemes = cards.map(countMorphemes);
      const mean = morphemes.reduce((a, b) => a + b, 0) / morphemes.length;
      const maxClauses = Math.max(...cards.map(countClauses));

      // Both the shortest and longest playthrough must sit inside the band.
      // Route scripts are exempt: their length is DECISIONS_PER_RUN for every
      // level (spec 2026-09-14 Q10), enforced by routeScriptProblems.
      if (!isRouteScript(script) && (!inRange(turns.min, spec.turns) || !inRange(turns.max, spec.turns))) {
        out.push(`${id}:turns`);
      }
      if (!inRange(phrases, spec.phrasesUnlocked)) out.push(`${id}:phrasesUnlocked`);
      if (!inRange(mean, spec.meanMorphemes)) out.push(`${id}:meanMorphemes`);
      if (Math.max(...morphemes) > spec.morphemeCeiling) out.push(`${id}:morphemeCeiling`);
      if (maxClauses > spec.maxClausesPerCard) out.push(`${id}:maxClauses`);
    }
    return out.sort();
  }

  it('introduces no NEW level violation', () => {
    const known = new Set(KNOWN_LEVEL_VIOLATIONS);
    const added = currentViolations().filter(v => !known.has(v));
    expect(added).toEqual([]);
  });

  it('KNOWN_LEVEL_VIOLATIONS lists nothing already fixed', () => {
    // Keeps the allowlist honest: fix a violation, remove its entry.
    const current = new Set(currentViolations());
    const stale = KNOWN_LEVEL_VIOLATIONS.filter(v => !current.has(v));
    expect(stale).toEqual([]);
  });

  it('exempt scenarios are genuinely exempt and genuinely exist', () => {
    const allIds = new Set([...Object.keys(scripts), ...catalog.map(c => c.id)]);
    const missing = LEVEL_EXEMPT_SCENARIOS.filter(id => !allIds.has(id));
    expect(missing).toEqual([]);
  });
});

describe('dialect presence', () => {
  /** Scenario ids whose choice cards contain no dialect feature at all. */
  function dialectlessScenarios(): string[] {
    const flat: string[] = [];
    for (const { id, scriptId } of gatedScenarios()) {
      const cards = choiceCards(scriptId).join(' ');
      if (!DIALECT_FEATURES.some(f => f.pattern.test(cards))) flat.push(id);
    }
    return flat.sort();
  }

  it('introduces no NEW scenario without a Gulf dialect feature', () => {
    const known = new Set(KNOWN_DIALECT_GAPS);
    expect(dialectlessScenarios().filter(id => !known.has(id))).toEqual([]);
  });

  it('KNOWN_DIALECT_GAPS lists nothing already fixed', () => {
    const current = new Set(dialectlessScenarios());
    expect(KNOWN_DIALECT_GAPS.filter(id => !current.has(id))).toEqual([]);
  });

  it('dialect feature patterns match their own documented examples', () => {
    // A pattern that matches nothing would silently zero out the gate above.
    const dead = DIALECT_FEATURES.filter(f => {
      const corpus = LINES.map(l => l.arabic).join(' ');
      return !f.pattern.test(corpus) && !f.pattern.test(f.label);
    }).map(f => f.id);
    // Documented, not asserted empty: some features are aspirational for content
    // that does not exist yet (B1-era forms). They must still be valid regexes.
    expect(Array.isArray(dead)).toBe(true);
    for (const f of DIALECT_FEATURES) expect(() => f.pattern.test('x')).not.toThrow();
  });
});

describe('provenance', () => {
  /**
   * How many phrases still have no traced source.
   *
   * This number is the honest state of the library, not a target that has been
   * met. It starts at the full 136 because the project had zero provenance
   * records of any kind, and no one has yet checked the content against the
   * published references in SOURCES. Driving it down is tracked work.
   *
   * The assertion is one-directional on purpose: it may fall, never rise. Lower
   * it when you source a batch.
   *
   * 136 → 103 on 2026-09-14 by DELETION, not sourcing: the 33 phrases of the four
   * scenarios cut for the MVP were all unsourced. Nothing got more verified.
   * 103 → 102, also by deletion: fm-s1-7 duplicated core-4 (الله يعافيك) with a
   * wrong gloss, and the First Morning rewrite no longer granted it.
   * 102 → 106 on 2026-09-15, the one deliberate RISE: The Meeting's mt-1..mt-4
   * (الحمد لله على السلامة, خلني أفكر فيها, أحاول, أساعد). The أبي / خلني
   * patterns could not return without them (spec §2.9), and Ahmed chose that over
   * deferring the patterns. They go to the Emirati reviewer with the scenario.
   */
  const MAX_UNSOURCED = 106;

  const unsourced = () => PHRASES.filter(p => p.source.ref === 'unsourced');

  it('every phrase declares a source', () => {
    expect(PHRASES.filter(p => !p.source).map(p => p.id)).toEqual([]);
  });

  it('the unsourced count does not grow', () => {
    expect(unsourced().length).toBeLessThanOrEqual(MAX_UNSOURCED);
  });

  it('MAX_UNSOURCED is not stale', () => {
    // If a sourcing batch landed without lowering the cap, this catches it.
    expect(MAX_UNSOURCED).toBe(unsourced().length);
  });

  it('every non-unsourced citation is valid for the claim it makes', () => {
    const bad = PHRASES
      .filter(p => p.source.ref !== 'unsourced' && !isValidCitation(p.source))
      .map(p => `${p.id} cites ${p.source.ref} for ${p.source.claim}`);
    expect(bad).toEqual([]);
  });

  it('every sourced phrase names a locator', () => {
    const vague = PHRASES
      .filter(p => p.source.ref !== 'unsourced' && !p.source.locator.trim())
      .map(p => p.id);
    expect(vague).toEqual([]);
  });

  it('phrase ids are unique', () => {
    const ids = PHRASES.map(p => p.id);
    expect(ids.length).toBe(new Set(ids).size);
  });
});

describe('arabic metrics', () => {
  it('counts clitics as morphemes', () => {
    expect(countMorphemes('بالأسبوع')).toBe(3); // bi + al + usbuu3
    expect(countMorphemes('القهوة')).toBe(2);   // al + gahwa
    expect(countMorphemes('عندج')).toBe(2);     // 3ind + ich
  });

  it('does not split short words or indivisible ones', () => {
    expect(countMorphemes('لا')).toBe(1);
    expect(countMorphemes('بس')).toBe(1);
    expect(countMorphemes('وين')).toBe(1);
    expect(countMorphemes('وايد')).toBe(1);
    expect(countMorphemes('الله')).toBe(1);
    expect(countMorphemes('والله')).toBe(1);
  });

  it('ignores stage directions', () => {
    expect(countArabicWords('(صمت)')).toBe(0);
    expect(countMorphemes('(answered in English)')).toBe(0);
  });

  it('counts clauses on sentence punctuation', () => {
    expect(countClauses('زين')).toBe(1);
    expect(countClauses('عندج حساسية؟ تاخذين أدوية؟')).toBe(2);
  });
});
