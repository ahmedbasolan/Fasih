/**
 * Sentence Builder engine — pure functions only. No React, no Zustand.
 * Mirrors scenarioEngine.ts: deterministic, unit-testable business logic.
 *
 * The "Build free" step is a rearrange-into-correct-order exercise from a mixed
 * tile bank (with distractors), not free typing — so validation is an exact
 * string match against the pattern's canonical forms.
 */
import type {
  GrammarPattern,
  Phrase,
  ScenarioCompletion,
  SentenceResult,
  SoftSkill,
} from '../types';
import { GRAMMAR_PATTERNS, PROFESSION_POOLS } from '../constants/grammar';
import { PHRASE_BY_ID } from '../constants/phrases';

// ─── Availability ─────────────────────────────────────────────────────────────

/**
 * Patterns the learner can currently practice, in a stable order.
 *
 * Gates:
 *  - `unlockedByScenario` must be empty (library basics) or the scenario must
 *    be in completedScenarios.
 *  - `secretUnlock` patterns additionally require the scenario's secret ending
 *    to have been earned (secretEndingsEarned) — never un-gated on replay,
 *    because secretEndingsEarned is never overwritten.
 *
 * Note: `unlockedPhraseIds` is accepted for API stability with future gates but
 * library-basic patterns (unlockedByScenario: '') are available from day one —
 * the store seeds unlockedPhraseIds empty, so an example-unlock filter here
 * would wrongly hide those from new learners.
 *
 * `patterns` defaults to the shipped set; tests pass their own so the gates stay
 * covered while no shipped pattern happens to use one (e.g. secretUnlock).
 */
export function getAvailablePatterns(
  _unlockedPhraseIds: string[],
  completedScenarios: Record<string, ScenarioCompletion>,
  secretEndingsEarned: Record<string, string>,
  patterns: GrammarPattern[] = GRAMMAR_PATTERNS,
): GrammarPattern[] {
  return patterns.filter((p) => {
    if (p.secretUnlock) return !!secretEndingsEarned[p.unlockedByScenario];
    return p.unlockedByScenario === '' || !!completedScenarios[p.unlockedByScenario];
  });
}

/**
 * Candidate tile words per slot, taken from the slot option phrases' wordTiles
 * (falling back to a space-split of the arabic, same fallback as PhraseBuilder).
 * Used by the builder UI to render the tap-to-place tile bank.
 */
export function getWordPool(
  availablePatterns: GrammarPattern[],
  unlockedPhrases: Phrase[],
): Record<string, Record<string, string[]>> {
  const byId = new Map(unlockedPhrases.map((p) => [p.id, p]));
  const pool: Record<string, Record<string, string[]>> = {};

  for (const pattern of availablePatterns) {
    pool[pattern.id] = {};
    for (const slot of pattern.slots) {
      const tiles: string[] = [];
      for (const phraseId of slot.options) {
        const phrase = byId.get(phraseId);
        if (!phrase) continue;
        const phraseTiles =
          phrase.wordTiles && phrase.wordTiles.length > 0
            ? phrase.wordTiles
            : phrase.arabic.split(' ').filter((w) => w.trim().length > 0);
        for (const t of phraseTiles) if (!tiles.includes(t)) tiles.push(t);
      }
      pool[pattern.id][slot.id] = tiles;
    }
  }

  return pool;
}

// ─── Assembly ─────────────────────────────────────────────────────────────────

/**
 * Assemble a sentence from a pattern + chosen slot options.
 *
 * slotChoices maps slotId → phraseId (must be one of the slot's options). Each
 * chosen phrase's arabic fills its `{slotId}` placeholder in the pattern's
 * template. Returns valid=false with empty strings when a choice doesn't
 * resolve, so callers can show a plain-language hint.
 *
 * Gender: feminine variants are applied per-slot only where a pattern defines
 * them (mirrors ScenarioChoice.arabicFeminine). MVP ships gender-neutral frames;
 * titleFeminine handles display titles.
 */
export function buildSentence(
  pattern: GrammarPattern,
  slotChoices: Record<string, string>,
  _speakerGender: 'male' | 'female',
): SentenceResult {
  const slotsById = Object.fromEntries(pattern.slots.map((s) => [s.id, s]));

  // Validate choices before assembling — every slot must be filled, and each
  // choice must be one of the slot's listed options.
  for (const slot of pattern.slots) {
    const phraseId = slotChoices[slot.id];
    if (!phraseId || !slot.options.includes(phraseId)) {
      return { arabic: '', roman: '', english: '', valid: false };
    }
  }

  const resolve = (tokens: string[], pick: (p: Phrase) => string): string =>
    tokens
      .map((token) => {
        if (!token.startsWith('{')) return token;
        const slot = slotsById[token.slice(1, -1)];
        if (!slot) return token;
        const phrase = PHRASE_BY_ID[slotChoices[slot.id]];
        return phrase ? pick(phrase) : '';
      })
      .join(' ')
      .trim();

  return {
    arabic: resolve(pattern.template.arabic, (p) => p.arabic),
    roman: resolve(pattern.template.roman, (p) => p.roman),
    english: resolve(pattern.template.english, (p) => p.english),
    valid: true,
  };
}

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Exact-string match against the pattern's canonical forms.
 *
 * Canonical forms = every example sentence + the template assembled with each
 * valid slot option. The learner's job is to pick the right tiles and order
 * them correctly, so tiles joined with single spaces are compared exactly.
 */
export function validateBuild(
  pattern: GrammarPattern,
  assembledTiles: string[],
): { valid: boolean; explanation?: string } {
  const joined = assembledTiles.join(' ').trim();
  if (joined === '') return { valid: false, explanation: 'No tiles placed yet.' };

  if (canonicalForms(pattern).includes(joined)) return { valid: true };
  return {
    valid: false,
    explanation: 'Check the order — every word belongs, but the arrangement matters.',
  };
}

/**
 * The full set of sentences a learner can legitimately produce for this pattern:
 * the template filled with each combination of slot options. (Example sentences
 * are the "notice" step — their words aren't all in the tile pool, so they are
 * not buildable targets.)
 */
export function canonicalForms(pattern: GrammarPattern): string[] {
  const slotCombos: string[][] = [[]];
  for (const slot of pattern.slots) {
    const next: string[][] = [];
    for (const combo of slotCombos) {
      for (const optionId of slot.options) {
        next.push([...combo, optionId]);
      }
    }
    slotCombos.length = 0;
    slotCombos.push(...next);
  }

  const assembled = slotCombos.map((choices) => {
    const bySlot = Object.fromEntries(pattern.slots.map((s, i) => [s.id, choices[i]]));
    return buildSentence(pattern, bySlot, 'male').arabic;
  });

  return Array.from(new Set(assembled));
}

// ─── Soft-skill classification ────────────────────────────────────────────────

/** Which soft-skill the pattern's good-impression note targets. */
export function classifySoftSkill(pattern: GrammarPattern): SoftSkill {
  return pattern.softSkill;
}

// ─── Profession pools ─────────────────────────────────────────────────────────

/** Word pool for a profession (e.g. barista). Every ID must resolve. */
export function getProfessionPool(profession: string): string[] {
  return PROFESSION_POOLS[profession]?.wordPool ?? [];
}
