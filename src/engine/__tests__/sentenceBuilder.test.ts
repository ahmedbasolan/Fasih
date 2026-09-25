/**
 * Engine tests for the Sentence Builder (src/engine/sentenceBuilder.ts).
 * Pure-function behaviour only — gating, assembly, validation, pools.
 * Content rules (slot options resolve, gating maps to real scenarios) live in
 * grammarContent.test.ts.
 */
import {
  buildSentence,
  canonicalForms,
  classifySoftSkill,
  getAvailablePatterns,
  getProfessionPool,
  getWordPool,
  validateBuild,
} from '../sentenceBuilder';
import { GRAMMAR_PATTERNS, PROFESSION_POOLS } from '../../constants/grammar';
import { PHRASES } from '../../constants/phrases';
import type { Phrase } from '../../types';

const patternById = (id: string) => {
  const p = GRAMMAR_PATTERNS.find((x) => x.id === id);
  if (!p) throw new Error(`test pattern ${id} missing`);
  return p;
};

const phraseById = (id: string): Phrase => {
  const p = PHRASES.find((x) => x.id === id);
  if (!p) throw new Error(`test phrase ${id} missing`);
  return p;
};

const scenario = (id: string) => ({ endingType: 'success', date: '2026-01-01' });

describe('getAvailablePatterns', () => {
  it('a brand-new learner gets only the library-basic patterns', () => {
    const ids = getAvailablePatterns([], {}, {}).map((p) => p.id);
    const expected = GRAMMAR_PATTERNS.filter((p) => p.unlockedByScenario === '').map((p) => p.id);
    expect(ids).toEqual(expected);
  });

  it('completing first-morning unlocks its pattern (ana-adj)', () => {
    const ids = getAvailablePatterns([], { 'first-morning': scenario('first-morning') }, {}).map((p) => p.id);
    expect(ids).toContain('ana-adj');
  });

  // No shipped pattern is secret-gated right now, so the gate runs on fixtures.
  const fixtures = [
    { ...patternById('ma-verb'), id: 'fx-scenario', unlockedByScenario: 'fx' },
    { ...patternById('mub-adj'), id: 'fx-secret', unlockedByScenario: 'fx', secretUnlock: true },
  ];

  it('completing a scenario unlocks its pattern but NOT its secret pattern', () => {
    const ids = getAvailablePatterns([], { fx: scenario('fx') }, {}, fixtures).map((p) => p.id);
    expect(ids).toContain('fx-scenario');
    expect(ids).not.toContain('fx-secret');
  });

  it('the secret-unlock pattern appears only after the secret ending is earned', () => {
    const unlocked = getAvailablePatterns([], { fx: scenario('fx') }, { fx: 'secret title' }, fixtures);
    expect(unlocked.some((p) => p.id === 'fx-secret')).toBe(true);
  });

  it('a secret ending without a completed scenario still unlocks the pattern (replay edge)', () => {
    const ids = getAvailablePatterns([], {}, { fx: 'secret title' }, fixtures).map((p) => p.id);
    expect(ids).toContain('fx-secret');
  });
});

describe('buildSentence', () => {
  it('assembles the frame + chosen option into a valid sentence', () => {
    const result = buildSentence(patternById('ana-adj'), { adj: 'e1' }, 'male');
    expect(result).toEqual({
      arabic: 'أنا زين',
      roman: 'ana zain',
      english: 'I am Good / OK / Fine',
      valid: true,
    });
  });

  it('keeps the speaker gender as a parameter but applies neutral frames (MVP)', () => {
    const male = buildSentence(patternById('ana-adj'), { adj: 'f4' }, 'male');
    const female = buildSentence(patternById('ana-adj'), { adj: 'f4' }, 'female');
    expect(male.arabic).toBe('أنا جوعان');
    expect(female.arabic).toBe(male.arabic);
  });

  it('whole-phrase patterns pass the option through unchanged', () => {
    const result = buildSentence(patternById('ma-verb'), { clause: 'a5' }, 'male');
    expect(result.arabic).toBe('ما أدري');
    expect(result.english).toBe("I don't know");
    expect(result.valid).toBe(true);
  });

  it('returns valid=false when a choice is not one of the slot options', () => {
    const result = buildSentence(patternById('ana-adj'), { adj: 'f8' }, 'male');
    expect(result.valid).toBe(false);
    expect(result.arabic).toBe('');
  });

  it('returns valid=false when a required slot is missing', () => {
    const result = buildSentence(patternById('ana-adj'), {}, 'male');
    expect(result.valid).toBe(false);
  });
});

describe('validateBuild', () => {
  it('accepts an exact canonical arrangement', () => {
    const pattern = patternById('ana-adj');
    expect(validateBuild(pattern, ['أنا', 'زين']).valid).toBe(true);
  });

  it('rejects a wrong order', () => {
    const result = validateBuild(patternById('ana-adj'), ['زين', 'أنا']);
    expect(result.valid).toBe(false);
    expect(result.explanation).toBeTruthy();
  });

  it('rejects an empty build with a hint', () => {
    const result = validateBuild(patternById('ma-verb'), []);
    expect(result.valid).toBe(false);
    expect(result.explanation).toBe('No tiles placed yet.');
  });

  it('accepts every canonical form for the pattern (whole-phrase patterns)', () => {
    const pattern = patternById('ma-verb');
    for (const form of canonicalForms(pattern)) {
      expect(validateBuild(pattern, form.split(' ')).valid).toBe(true);
    }
  });
});

describe('canonicalForms', () => {
  it('lists every frame+option combination', () => {
    const forms = canonicalForms(patternById('mub-adj'));
    expect(forms).toContain('مب زين');
  });

  it('dedupes when options produce identical strings', () => {
    const forms = canonicalForms(patternById('ana-adj'));
    expect(new Set(forms).size).toBe(forms.length);
  });
});

describe('getWordPool', () => {
  it('only includes tiles from phrases the learner owns', () => {
    const pattern = patternById('ana-adj');
    const owned = [phraseById('e1')]; // زين only — e15/f4/f5 not owned
    const pool = getWordPool([pattern], owned);
    expect(pool['ana-adj'].adj).toEqual(['زين']);
  });

  it('falls back to a space-split when a phrase has no wordTiles', () => {
    // e1 has no wordTiles → tiles come from splitting its arabic.
    expect(phraseById('e1').wordTiles).toBeUndefined();
    const pool = getWordPool([patternById('ana-adj')], [phraseById('e1')]);
    expect(pool['ana-adj'].adj).toContain('زين');
  });
});

describe('classifySoftSkill & pools', () => {
  it('returns the pattern soft skill', () => {
    expect(classifySoftSkill(patternById('ana-adj'))).toBe('identity');
    expect(classifySoftSkill(patternById('question-words'))).toBe('question');
    expect(classifySoftSkill(patternById('yalla-verb'))).toBe('action');
  });

  it('getProfessionPool resolves the barista pool to real phrases', () => {
    expect(getProfessionPool('barista')).toEqual(PROFESSION_POOLS.barista.wordPool);
  });

  it('unknown professions return an empty pool', () => {
    expect(getProfessionPool('nobody')).toEqual([]);
  });
});
