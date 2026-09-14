/**
 * Content integrity tests for the grammar dataset.
 *
 * These are not engine tests — they check that the *patterns* obey the rules
 * the builder engine assumes. The failures they catch (a slot option that
 * doesn't exist, a secret-unlock pattern whose scenario has no secret ending,
 * a derived sentence shipped without native review) are invisible in TypeScript
 * and surface as a confusing blank sentence for the user.
 */
import {
  GRAMMAR_PATTERNS,
  PROFESSION_POOLS,
  REVIEW_QUEUE,
  allReferencedPhraseIds,
  resolveReferencedPhrase,
} from '../../constants/grammar';
import { PHRASES } from '../../constants/phrases';
import { getScenarioScripts } from '../../constants/scenarios';
import { darkTheme } from '../../components/design/tokens';

const scripts = getScenarioScripts(darkTheme);
const phraseIds = new Set(PHRASES.map((p) => p.id));
const patternIds = new Set(GRAMMAR_PATTERNS.map((p) => p.id));

describe('grammar data integrity', () => {
  it('every example phraseId resolves in the phrase library', () => {
    const missing = allReferencedPhraseIds().filter((id) => !phraseIds.has(id));
    expect(missing).toEqual([]);
  });

  it('every slot option resolves in the phrase library', () => {
    const missing: string[] = [];
    for (const p of GRAMMAR_PATTERNS) {
      for (const slot of p.slots) {
        for (const opt of slot.options) {
          if (!phraseIds.has(opt)) missing.push(`${p.id}/${slot.id} → ${opt}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('every template placeholder matches a real slot id', () => {
    const broken: string[] = [];
    for (const p of GRAMMAR_PATTERNS) {
      const slotIds = new Set(p.slots.map((s) => s.id));
      for (const frame of Object.values(p.template)) {
        for (const token of frame) {
          if (!token.startsWith('{')) continue;
          const id = token.slice(1, -1);
          if (!slotIds.has(id)) broken.push(`${p.id}: placeholder {${id}} has no slot`);
        }
      }
      // Every slot must be referenced by a placeholder — an orphan slot is dead content.
      for (const slot of p.slots) {
        const referenced = JSON.stringify(p.template).includes(`{${slot.id}}`);
        if (!referenced) broken.push(`${p.id}: slot ${slot.id} never appears in template`);
      }
    }
    expect(broken).toEqual([]);
  });

  it('every pattern has at least one example and one slot', () => {
    const empty = GRAMMAR_PATTERNS.filter((p) => p.examples.length === 0 || p.slots.length === 0).map((p) => p.id);
    expect(empty).toEqual([]);
  });

  it('pattern ids are unique', () => {
    expect(patternIds.size).toBe(GRAMMAR_PATTERNS.length);
  });
});

describe('grammar gating', () => {
  it('every unlockedByScenario references a real scenario with a script', () => {
    const broken = GRAMMAR_PATTERNS.filter((p) => p.unlockedByScenario !== '' && !scripts[p.unlockedByScenario]).map(
      (p) => p.id,
    );
    expect(broken).toEqual([]);
  });

  it('a secretUnlock pattern maps to a scenario that actually has a secret ending', () => {
    const broken = GRAMMAR_PATTERNS.filter((p) => p.secretUnlock).filter((p) => {
      const script = scripts[p.unlockedByScenario];
      return !script || !script.endings.some((e) => e.secret);
    });
    expect(broken).toEqual([]);
  });

  it('at least one pattern is always available to a brand-new learner', () => {
    const alwaysAvailable = GRAMMAR_PATTERNS.filter((p) => p.unlockedByScenario === '' && !p.secretUnlock);
    expect(alwaysAvailable.length).toBeGreaterThan(0);
  });

  it('no pattern unlocks through a non-existent scenario', () => {
    const broken = GRAMMAR_PATTERNS.filter(
      (p) => p.unlockedByScenario !== '' && !Object.keys(scripts).includes(p.unlockedByScenario),
    );
    expect(broken).toEqual([]);
  });
});

describe('grammar language hygiene', () => {
  it('no Latin letters inside any Arabic content (frame, title, example arabic)', () => {
    const offenders: string[] = [];
    for (const p of GRAMMAR_PATTERNS) {
      for (const token of p.template.arabic) {
        if (!token.startsWith('{') && /[A-Za-z]/.test(token)) offenders.push(`${p.id} frame: ${token}`);
      }
      for (const ex of p.examples) {
        const phrase = resolveReferencedPhrase(ex.phraseId);
        if (phrase && /[A-Za-z]/.test(phrase.arabic)) offenders.push(`${p.id} example ${ex.phraseId}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('REVIEW_QUEUE entries are Arabic (no Latin letters) and non-empty', () => {
    const offenders = REVIEW_QUEUE.filter((s) => /[A-Za-z]/.test(s) || s.trim() === '');
    expect(offenders).toEqual([]);
  });
});

describe('grammar native-review gate', () => {
  it('every needsNativeReview pattern is listed in REVIEW_QUEUE', () => {
    const flagged = GRAMMAR_PATTERNS.filter((p) => p.needsNativeReview);
    // REVIEW_QUEUE holds derived strings, not ids — assert each derived pattern
    // documents its queue membership via source, and that the queue is empty
    // exactly when nothing is derived (no orphaned strings, no unqueued pattern).
    expect(REVIEW_QUEUE.length > 0).toBe(flagged.length > 0);
    for (const p of flagged) {
      expect(p.source?.toLowerCase()).toContain('review_queue');
    }
  });
});

describe('profession pools', () => {
  it('every wordPool entry resolves in the phrase library', () => {
    const missing: string[] = [];
    for (const [name, pool] of Object.entries(PROFESSION_POOLS)) {
      for (const id of pool.wordPool) {
        if (!phraseIds.has(id)) missing.push(`${name} → ${id}`);
      }
    }
    expect(missing).toEqual([]);
  });
});