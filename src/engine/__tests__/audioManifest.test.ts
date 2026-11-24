import { PHRASES } from '../../constants/phrases';
import { getScenarioScripts, getOnboardingScripts } from '../../constants/scenarios';
import { darkTheme } from '../../components/design/tokens';
import { allPhraseIds } from '../scenarioEngine';
import { AUDIO_MANIFEST } from '../../constants/audioManifest';

/**
 * Jest runs in Node; the app never does. tsconfig sets `types: ["jest"]`
 * deliberately, so `@types/node` is not in global scope. These two
 * declarations buy back exactly what this file needs without widening that
 * scope — same pattern as onboardingAnalytics.test.ts, layout.test.ts and
 * iconBarrel.test.ts.
 */
declare const __dirname: string;
declare function require(id: 'fs'): { readFileSync(path: string, encoding: 'utf8'): string };
declare function require(id: 'path'): { join(...parts: string[]): string };

const { readFileSync } = require('fs');
const { join } = require('path');

/**
 * Recomputes the catalogue by importing the real modules, independently of the
 * .mjs generator's regex parsing, and checks the checked-in artifacts against
 * it. Two separate paths to the same answer on purpose — do not rewrite this to
 * call the generator, which would make both paths the same path.
 *
 * Reuses the engine's own `allPhraseIds` rather than re-deriving core+byEnding,
 * so the brief covers exactly what a player can actually unlock.
 */
function taughtIds(): Set<string> {
  const known = new Set(PHRASES.map(p => p.id));
  const out = new Set<string>();

  // Full scripts: core plus every ending's set. getScenarioScripts takes a
  // theme because scenario metadata carries colours; the content is identical
  // whichever theme is passed. Other content tests pass darkTheme — match them.
  for (const script of Object.values(getScenarioScripts(darkTheme))) {
    for (const id of allPhraseIds(script)) if (known.has(id)) out.add(id);
  }

  // Onboarding scripts are `Pick<ScenarioPhrases, 'core'>` — no endings, so
  // allPhraseIds does not apply.
  for (const script of Object.values(getOnboardingScripts())) {
    for (const id of script.phrases.core) if (known.has(id)) out.add(id);
  }

  return out;
}

const brief = readFileSync(
  join(__dirname, '../../../docs/language/recording-brief.md'),
  'utf8',
);

describe('audio catalogue', () => {
  it('teaches a phrase set the brief covers exactly', () => {
    const taught = taughtIds();
    for (const id of taught) {
      expect(brief).toContain(`\`${id}.male.m4a\``);
      expect(brief).toContain(`\`${id}.female.m4a\``);
    }
  });

  it('states a clip count matching two voices per taught phrase', () => {
    const taught = taughtIds();
    expect(brief).toContain(`**${taught.size} phrases, ${taught.size * 2} clips.**`);
  });

  it('never briefs a phrase no scenario teaches', () => {
    const taught = taughtIds();
    const briefed = [...brief.matchAll(/`([A-Za-z0-9-]+)\.male\.m4a`/g)].map(m => m[1]);
    expect(briefed.sort()).toEqual([...taught].sort());
  });

  it('only manifests clips for phrases that exist', () => {
    const known = new Set(PHRASES.map(p => p.id));
    for (const id of Object.keys(AUDIO_MANIFEST)) expect(known.has(id)).toBe(true);
  });

  it('gives every manifested clip a provenance record', () => {
    // Same discipline as Phrase.source: a clip with no stated origin is the
    // audio equivalent of an invented citation.
    for (const voices of Object.values(AUDIO_MANIFEST)) {
      for (const clip of Object.values(voices)) {
        expect(clip?.provenance.kind).toMatch(/^(human|synthetic)$/);
        expect(clip?.provenance.voice.length).toBeGreaterThan(0);
        expect(clip?.provenance.recordedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });
});
