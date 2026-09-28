# Phrase Audio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace device TTS with bundled recorded clips keyed by phrase id and voice gender, removing the app's standing MSA violation even though no clips exist yet.

**Architecture:** A generator script derives the clip catalogue from `phrases.ts` + `scenarios.ts` and emits both the manifest the app imports and the brief a voice actor works from, so the two cannot drift. Lookup is a pure engine function tested against fixture manifests; a thin hook wraps `expo-audio` for playback. The manifest generates **empty** today, so every speaker button hides by construction rather than behind a flag.

**Tech Stack:** TypeScript strict, React Native / Expo ~56, `expo-audio` (replacing `expo-speech`), Jest.

**Spec:** [`docs/superpowers/specs/2026-09-28-phrase-audio-design.md`](../specs/2026-09-28-phrase-audio-design.md)

## Global Constraints

- **No `any`.** TypeScript strict. All shared types in `src/types/index.ts`.
- **All UI copy in `STRINGS`** (`src/constants/strings.ts`). No hardcoded display text.
- **All colours via `C.TOKEN`** from `useTheme()`. No hex literals.
- **`src/engine/` is pure.** No React, no hooks, no side effects, no Zustand.
- **`StyleSheet.create` inside `useMemo` keyed on `C`** in themed components.
- **Stage exact file paths.** Never `git add -A` or `git add .`.
- **`npx tsc --noEmit` must exit 0** before any task is considered done.
- **Branch:** `feat/phrase-audio`, already created off `dev`. PR targets `dev`, never `main`.
- **Untracked files to leave alone:** `docs/superpowers/plans/2026-08-20-generative-grammar.md`, `supabase/.temp/`. Do not stage them.
- **Clip format:** `.m4a`. **Filename:** `<phraseId>.<voice>.m4a`, e.g. `g3.male.m4a`.
- **Audio directory:** `assets/audio/`.
- **62 taught phrases → 124 clips.** Do not hardcode either number; derive it.

---

## Context an implementer needs

### The nine call sites, and what happens to each

`useArabicTTS` is consumed in seven files, nine call sites. **Five keep audio, four lose it.** This split is the single most important thing to get right; it is not a mechanical swap.

| # | File:line | Currently speaks | Keeps audio? | Why |
|---|---|---|---|---|
| 1 | `src/screens/HomeScreenNew.tsx:287` | `phraseOfTheDay.arabic` | **Yes** → `play(phraseOfTheDay.id)` | real phrase |
| 2 | `src/screens/PracticeScreen.tsx:653,654,734,861` | `phrase.arabic` | **Yes** → `play(phrase.id)` / `playSlow(phrase.id)` | real phrase |
| 3 | `src/screens/PhraseLibrary.tsx:88,95` | `p.arabic` | **Yes** → `play(p.id)` / `playSlow(p.id)` | real phrase |
| 4 | `src/components/scenario/ScenarioIntroPhase.tsx:98` | `arabic` | **Yes** → `play(phraseId)` | `playPrimer` **already takes `phraseId`** |
| 5 | `src/screens/ScenarioPlayer.tsx:377` | `arabic` | **Yes** → `play(phraseId)` | `playEndPhrase` **already takes `phraseId`** |
| 6 | `src/screens/ScenarioPlayer.tsx:367` | `arabic` in `playChoice(choiceId, arabic)` | **No — remove** | a choice card is not a library phrase; `choiceId` is not a phrase id, so no clip can ever exist |
| 7 | `src/screens/ScenarioPlayer.tsx:166,229` | `dialogue.arabic` via `speakAs` | **No — remove** | spec §2.10: "Dialogue has no audio" |
| 8 | `src/screens/SentenceBuilder.tsx:129` | `arabic` | **No — remove** | a dynamically composed sentence has no id and cannot be pre-recorded |
| 9 | `src/screens/onboarding/QuickWinSteps.tsx:195` | `STRINGS.onboarding.firstPhraseArabic` | **Yes** → `play('g3')` | the string is `'شلونك؟'`, which is phrase `g3` duplicated as a constant |

### Learner gender

`user.gender` on the Zustand store — `'male' | 'female' | undefined`. Optional: onboarding asks, but a user can reach audio before answering. `clipFor` must handle `undefined`.

### Why the sync test is built the way it is

The generator is plain `.mjs` and parses the TypeScript sources with regexes, because this repo has no TS runner for scripts and adding one is a new dependency. Regex parsing is fragile.

The sync test defends against exactly that: it **imports the real TypeScript modules** through Jest and recomputes the catalogue independently, then asserts the checked-in generated files match. Two independent paths to the same answer. If the regex parser is wrong, the test fails.

Do not "simplify" this by having the test call the generator. That would make both paths the same path and test nothing.

### Known trap: ending keys live in the `phrases` block

Scenario `phrases` maps look like:

```ts
phrases: {
  core: ['fm-s1-1', 'fm-s1-2'],
  byEnding: {
    'the-go-to-colleague': ['core-3', 'core-4', 'h1'],
  },
},
```

A naive "collect every quoted string in this block" picks up `'the-go-to-colleague'` — an **ending id**, not a phrase id. There are 32 such keys. Always intersect against real ids from `phrases.ts`.

---

## Task 1: Audio types and the pure lookup

**Files:**
- Modify: `src/types/index.ts` (append a new section near the other domain types)
- Create: `src/engine/phraseAudio.ts`
- Test: `src/engine/__tests__/phraseAudio.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `VoiceGender`, `AudioModule`, `AudioProvenance`, `AudioClip`, `AudioManifest` (from `src/types`); `clipFor(phraseId: string, voice: VoiceGender | undefined, manifest: AudioManifest): AudioClip | null` (from `src/engine/phraseAudio`).

- [ ] **Step 1: Add the types**

In `src/types/index.ts`, append:

```ts
// ─── Phrase audio ────────────────────────────────────────────────────────────

export type VoiceGender = 'male' | 'female';

/** What `require()` returns for a bundled asset in React Native. */
export type AudioModule = number;

/**
 * Where a clip came from. Required on every clip, for the same reason
 * `Phrase.source` is required on every phrase: a recording presented as Emirati
 * speech when it is a synthesiser reading MSA is the audio equivalent of a
 * fabricated citation, and nobody downstream can hear the difference either
 * (authority rule 5 / §0).
 */
export interface AudioProvenance {
  /** 'human' = a person recorded it. 'synthetic' = any TTS or AI generator. */
  kind: 'human' | 'synthetic';
  /** Speaker name for human; `vendor:voice-id` for synthetic. */
  voice: string;
  /** ISO date the clip was produced. */
  recordedAt: string;
  note?: string;
}

export interface AudioClip {
  module: AudioModule;
  voice: VoiceGender;
  provenance: AudioProvenance;
}

/** phraseId → the clips that exist for it. Either voice may be absent. */
export type AudioManifest = Record<string, Partial<Record<VoiceGender, AudioClip>>>;
```

- [ ] **Step 2: Write the failing test**

Create `src/engine/__tests__/phraseAudio.test.ts`:

```ts
import { clipFor } from '../phraseAudio';
import type { AudioManifest, AudioClip, VoiceGender } from '../../types';

function clip(voice: VoiceGender, module: number): AudioClip {
  return {
    module,
    voice,
    provenance: { kind: 'human', voice: 'test', recordedAt: '2026-09-28' },
  };
}

const both: AudioManifest = {
  'g3': { male: clip('male', 1), female: clip('female', 2) },
};
const femaleOnly: AudioManifest = { 'g3': { female: clip('female', 2) } };
const maleOnly: AudioManifest = { 'g3': { male: clip('male', 1) } };

describe('clipFor', () => {
  it('is null when the manifest is empty — the state this branch ships in', () => {
    expect(clipFor('g3', 'male', {})).toBeNull();
  });

  it('is null for a phrase with no clips', () => {
    expect(clipFor('does-not-exist', 'male', both)).toBeNull();
  });

  it('returns the clip matching the learner voice', () => {
    expect(clipFor('g3', 'male', both)?.module).toBe(1);
    expect(clipFor('g3', 'female', both)?.module).toBe(2);
  });

  it('falls back to the other voice rather than silence', () => {
    // Half-recorded is a real state during a rollout. The other voice saying
    // the right words beats no audio at all.
    expect(clipFor('g3', 'male', femaleOnly)?.module).toBe(2);
    expect(clipFor('g3', 'female', maleOnly)?.module).toBe(1);
  });

  it('prefers male deterministically when the learner has no gender set', () => {
    // Onboarding asks, but audio is reachable before it is answered. The rule
    // only needs to be stable, not meaningful.
    expect(clipFor('g3', undefined, both)?.module).toBe(1);
  });

  it('still resolves with no gender set when only one voice exists', () => {
    expect(clipFor('g3', undefined, femaleOnly)?.module).toBe(2);
  });

  it('is null when the phrase key exists but holds no clips', () => {
    expect(clipFor('g3', 'male', { 'g3': {} })).toBeNull();
  });
});
```

- [ ] **Step 3: Run it and verify it fails**

```bash
npx jest src/engine/__tests__/phraseAudio.test.ts
```

Expected: FAIL — `Cannot find module '../phraseAudio'`.

- [ ] **Step 4: Implement**

Create `src/engine/phraseAudio.ts`:

```ts
import type { AudioClip, AudioManifest, VoiceGender } from '../types';

/** Stable order used when the learner has no gender set, or theirs is missing. */
const PREFERENCE: VoiceGender[] = ['male', 'female'];

/**
 * The clip to play for a phrase, or null when none exists.
 *
 * Returning null is the normal case, not an error: the manifest is generated
 * from the files actually present in assets/audio/, and today that is none.
 * Callers render their speaker button on this being non-null, which is what
 * makes the buttons disappear without a feature flag.
 */
export function clipFor(
  phraseId: string,
  voice: VoiceGender | undefined,
  manifest: AudioManifest,
): AudioClip | null {
  const entry = manifest[phraseId];
  if (!entry) return null;

  const order: VoiceGender[] = voice
    ? [voice, ...PREFERENCE.filter(v => v !== voice)]
    : PREFERENCE;

  for (const v of order) {
    const found = entry[v];
    if (found) return found;
  }
  return null;
}
```

- [ ] **Step 5: Run the tests and typecheck**

```bash
npx jest src/engine/__tests__/phraseAudio.test.ts
```
Expected: PASS, 7 tests.

```bash
npx tsc --noEmit
```
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/types/index.ts src/engine/phraseAudio.ts src/engine/__tests__/phraseAudio.test.ts
git commit -m "feat(audio): pure clip lookup keyed by phrase id and voice

Returning null is the normal case: the manifest is generated from the files
present in assets/audio/, and today there are none. Call sites render their
speaker button on a non-null clip, which is what hides every button without
needing a feature flag.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 2: The generator — manifest and recording brief

**Files:**
- Create: `scripts/generate-audio-manifest.mjs`
- Create: `src/constants/audioManifest.ts` (generated output, checked in)
- Create: `docs/language/recording-brief.md` (generated output, checked in)
- Create: `assets/audio/.gitkeep`
- Modify: `package.json` (add the `audio:manifest` script)
- Test: `src/engine/__tests__/audioManifest.test.ts`

**Interfaces:**
- Consumes: `AudioManifest`, `AudioClip` (Task 1).
- Produces: `AUDIO_MANIFEST: AudioManifest` exported from `src/constants/audioManifest.ts`; `npm run audio:manifest`.

- [ ] **Step 1: Create the audio directory placeholder**

```bash
mkdir -p assets/audio
printf '# Recorded phrase clips land here as <phraseId>.<voice>.m4a\n' > assets/audio/.gitkeep
```

- [ ] **Step 2: Write the generator**

Create `scripts/generate-audio-manifest.mjs`:

```js
/**
 * Generates the audio manifest and the recording brief from the phrase library.
 *
 * Single source of truth: run this, never hand-edit either output. Two lists
 * that have to be kept in agreement by hand have already gone stale twice in
 * this repo (MAX_UNSOURCED, the six duplicated sync field lists).
 *
 * This parses TypeScript with regexes because the repo has no TS runner for
 * scripts and adding one is a new dependency. That is fragile on purpose-built
 * input and it is guarded: audioManifest.test.ts recomputes the same catalogue
 * by importing the real modules through Jest and fails if the two disagree.
 *
 * Usage: npm run audio:manifest
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const VOICES = ['male', 'female'];

/** Every phrase id declared in the library, in file order. */
function allPhrases() {
  const src = read('src/constants/phrases.ts');
  const out = [];
  for (const m of src.matchAll(/^\s*\{ id: '([^']+)'.*$/gm)) {
    const line = m[0];
    const field = (name) => {
      const f = line.match(new RegExp(`${name}: '((?:[^'\\\\]|\\\\.)*)'`));
      return f ? f[1].replace(/\\'/g, "'") : '';
    };
    out.push({
      id: m[1],
      arabic: field('arabic'),
      roman: field('roman'),
      english: field('english'),
      category: field('category'),
      pronTip: field('pronTip'),
    });
  }
  return out;
}

/**
 * Phrase ids any scenario teaches.
 *
 * Ending ids live in the same `phrases:` block under `byEnding`, so every
 * candidate is intersected against real phrase ids. Skipping that pulls in 32
 * ending keys like 'the-go-to-colleague'.
 */
function taughtIds(known) {
  const src = read('src/constants/scenarios.ts');
  const found = new Set();
  const re = /phrases:\s*\{/g;
  let m;
  while ((m = re.exec(src))) {
    let i = re.lastIndex - 1;
    let depth = 0;
    let end = i;
    for (; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }
    for (const q of src.slice(re.lastIndex, end).matchAll(/'([A-Za-z0-9-]+)'/g)) {
      if (known.has(q[1])) found.add(q[1]);
    }
  }
  return found;
}

/** Clips actually present on disk, with their required provenance. */
function presentClips() {
  const dir = path.join(ROOT, 'assets/audio');
  const files = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.endsWith('.m4a'))
    : [];

  const sourcesPath = path.join(dir, 'SOURCES.json');
  const sources = fs.existsSync(sourcesPath)
    ? JSON.parse(fs.readFileSync(sourcesPath, 'utf8'))
    : {};

  const clips = [];
  const missing = [];
  for (const file of files) {
    const m = file.match(/^(.+)\.(male|female)\.m4a$/);
    if (!m) { missing.push(`${file} — filename must be <phraseId>.<voice>.m4a`); continue; }
    if (!sources[file]) { missing.push(`${file} — no entry in assets/audio/SOURCES.json`); continue; }
    clips.push({ file, phraseId: m[1], voice: m[2], provenance: sources[file] });
  }
  if (missing.length) {
    console.error('Refusing to generate. Every clip needs provenance:\n  ' + missing.join('\n  '));
    process.exit(1);
  }
  return clips;
}

function renderManifest(clips) {
  const byPhrase = new Map();
  for (const c of clips) {
    if (!byPhrase.has(c.phraseId)) byPhrase.set(c.phraseId, {});
    byPhrase.get(c.phraseId)[c.voice] = c;
  }

  const entries = [...byPhrase.entries()].sort(([a], [b]) => a.localeCompare(b));
  const body = entries.map(([id, voices]) => {
    const inner = VOICES.filter((v) => voices[v]).map((v) => {
      const c = voices[v];
      const p = c.provenance;
      return `    ${v}: {
      module: require('../../assets/audio/${c.file}') as AudioModule,
      voice: '${v}',
      provenance: { kind: '${p.kind}', voice: ${JSON.stringify(p.voice)}, recordedAt: '${p.recordedAt}'${p.note ? `, note: ${JSON.stringify(p.note)}` : ''} },
    },`;
    }).join('\n');
    return `  '${id}': {\n${inner}\n  },`;
  }).join('\n');

  return `/**
 * GENERATED FILE — do not edit by hand.
 * Run \`npm run audio:manifest\` after adding or removing clips in assets/audio/.
 *
 * Empty means no clips are present yet, which is the expected state until
 * recordings exist. Speaker buttons render on a clip being found, so an empty
 * manifest hides all of them without a feature flag.
 */
import type { AudioManifest, AudioModule } from '../types';

export const AUDIO_MANIFEST: AudioManifest = {
${body}
};
`;
}

function renderBrief(phrases, taught) {
  const rows = phrases.filter((p) => taught.has(p.id));
  const lines = rows.flatMap((p) =>
    VOICES.map((v) => `| \`${p.id}.${v}.m4a\` | ${v} | ${p.arabic} | ${p.roman} | ${p.english.replace(/\|/g, '\\|')} | ${(p.pronTip || '').replace(/\|/g, '\\|')} |`),
  );

  return `# Recording brief

GENERATED FILE — do not edit by hand. Run \`npm run audio:manifest\`.

**${rows.length} phrases, ${lines.length} clips.**

## How to record

- Two voices, recorded separately: one male, one female, both young urban
  Emirati speakers (Dubai/Abu Dhabi, roughly 20–35).
- Every phrase is recorded by **both** voices, saying the same Arabic. The voice
  matches the learner, not the addressee.
- **Say it the way you would say it**, not the way it is written. The Arabic
  column is bare script with no vowel marks. The **romanisation column is
  authoritative** for pronunciation — it is the Gulf form. Where the two seem to
  disagree, the romanisation wins: قهوة is *gahwa*, never *qahwa*.
- Natural pace, as in conversation. Do not over-enunciate; the app slows clips
  down itself when the learner asks.
- One phrase per file, minimal leading and trailing silence.
- Format: \`.m4a\`, mono, 44.1kHz.
- Filename exactly as the first column. Case-sensitive.

## Delivery

Drop the files in \`assets/audio/\` and add one entry per file to
\`assets/audio/SOURCES.json\` recording who or what produced it. The generator
refuses to run without it.

## Clips

| File | Voice | Arabic | Romanisation (authoritative) | English | Note |
|---|---|---|---|---|---|
${lines.join('\n')}
`;
}

const phrases = allPhrases();
const known = new Set(phrases.map((p) => p.id));
const taught = taughtIds(known);
const clips = presentClips();

fs.writeFileSync(path.join(ROOT, 'src/constants/audioManifest.ts'), renderManifest(clips));
fs.writeFileSync(path.join(ROOT, 'docs/language/recording-brief.md'), renderBrief(phrases, taught));

console.log(`phrases in library : ${phrases.length}`);
console.log(`taught by scenarios: ${taught.size}`);
console.log(`clips needed       : ${taught.size * 2}`);
console.log(`clips present      : ${clips.length}`);
```

- [ ] **Step 3: Add the npm script**

In `package.json`, inside `"scripts"`, after `"lint"`:

```json
    "audio:manifest": "node scripts/generate-audio-manifest.mjs",
```

- [ ] **Step 4: Run the generator**

```bash
npm run audio:manifest
```

Expected output:
```
phrases in library : 106
taught by scenarios: 62
clips needed       : 124
clips present      : 0
```

It writes `src/constants/audioManifest.ts` with an empty `AUDIO_MANIFEST` and `docs/language/recording-brief.md` with 124 rows.

- [ ] **Step 5: Write the sync test**

Create `src/engine/__tests__/audioManifest.test.ts`:

```ts
import fs from 'node:fs';
import path from 'node:path';
import { PHRASES } from '../../constants/phrases';
import { getScenarioScripts, getOnboardingScripts } from '../../constants/scenarios';
import { darkTheme } from '../../components/design/tokens';
import { allPhraseIds } from '../scenarioEngine';
import { AUDIO_MANIFEST } from '../../constants/audioManifest';

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

const brief = fs.readFileSync(
  path.join(__dirname, '../../../docs/language/recording-brief.md'),
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
```

- [ ] **Step 6: Run the tests**

```bash
npx jest src/engine/__tests__/audioManifest.test.ts
```
Expected: PASS, 5 tests.

If "teaches a phrase set the brief covers exactly" fails, the generator's regex parse disagrees with the real data — fix the generator, not the test.

The imports above are verified against the current tree: `getScenarioScripts(C: ThemeColors)` and `getOnboardingScripts()` both return a `Record`, not an array; `darkTheme` comes from `src/components/design/tokens`; `allPhraseIds` is exported from `src/engine/scenarioEngine.ts`. `ScenarioScript.phrases` is `{ core: string[]; byEnding: Record<string, string[]> }` and is required; `OnboardingScript.phrases` is `Pick<ScenarioPhrases, 'core'>`.

- [ ] **Step 7: Typecheck and commit**

```bash
npx tsc --noEmit
git add scripts/generate-audio-manifest.mjs src/constants/audioManifest.ts docs/language/recording-brief.md assets/audio/.gitkeep package.json src/engine/__tests__/audioManifest.test.ts
git commit -m "feat(audio): generate the manifest and recording brief from the library

One script emits both, so the list the app loads and the list a voice actor
works from cannot disagree. The brief is the artifact that actually unblocks
this branch — the code was never the blocker.

Generates empty today: 106 phrases in the library, 62 taught by scenarios,
124 clips needed, 0 present.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 3: The playback hook

**Files:**
- Create: `src/hooks/usePhraseAudio.ts`
- Modify: `package.json` (add `expo-audio`)

**Interfaces:**
- Consumes: `clipFor` (Task 1), `AUDIO_MANIFEST` (Task 2).
- Produces: `usePhraseAudio(): { play(phraseId): void; playSlow(phraseId): void; stop(): void; isPlaying: boolean; playingId: string | null; hasClip(phraseId): boolean }`.

- [ ] **Step 1: Install expo-audio**

```bash
npx expo install expo-audio
```

Approved in the design doc. `expo-speech` is removed in Task 7, so the dependency count does not move.

- [ ] **Step 2: Write the hook**

Create `src/hooks/usePhraseAudio.ts`:

```ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { useAppStore } from '../store/useAppStore';
import { clipFor } from '../engine/phraseAudio';
import { AUDIO_MANIFEST } from '../constants/audioManifest';

/** Playback rate for "play slowly". Same clip, no extra recording. */
const SLOW_RATE = 0.7;

/**
 * Plays a recorded clip for a phrase.
 *
 * Replaces useArabicTTS. The old hook took Arabic *text* and synthesised it;
 * this takes a phrase *id* and plays a recording of it, so anything without an
 * id — NPC dialogue, choice cards, Sentence Builder's composed sentences —
 * cannot have audio and no longer offers it.
 *
 * `hasClip` is the render condition for every speaker button. It is false for
 * everything today, and becomes true per phrase as clips land in assets/audio/
 * and the manifest is regenerated. No code changes when that happens.
 */
export function usePhraseAudio() {
  const gender = useAppStore((s) => s.user?.gender);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    // Play even when the ringer switch is silenced: a learner tapping a speaker
    // button has asked for sound explicitly.
    void setAudioModeAsync({ playsInSilentMode: true });
    return () => {
      playerRef.current?.remove();
      playerRef.current = null;
    };
  }, []);

  const start = useCallback((phraseId: string, rate: number) => {
    const clip = clipFor(phraseId, gender, AUDIO_MANIFEST);
    if (!clip) return;

    playerRef.current?.remove();
    const player = createAudioPlayer(clip.module);
    playerRef.current = player;
    setPlayingId(phraseId);

    player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) setPlayingId(null);
    });

    if (rate !== 1) player.setPlaybackRate(rate);
    player.play();
  }, [gender]);

  const play = useCallback((phraseId: string) => start(phraseId, 1), [start]);
  const playSlow = useCallback((phraseId: string) => start(phraseId, SLOW_RATE), [start]);

  const stop = useCallback(() => {
    playerRef.current?.pause();
    setPlayingId(null);
  }, []);

  const hasClip = useCallback(
    (phraseId: string) => clipFor(phraseId, gender, AUDIO_MANIFEST) !== null,
    [gender],
  );

  return { play, playSlow, stop, isPlaying: playingId !== null, playingId, hasClip };
}
```

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```
Expected: exit 0.

If `expo-audio`'s API differs in this SDK version (method names on `AudioPlayer`, the status event name, `setPlaybackRate`'s signature), read `node_modules/expo-audio/build/*.d.ts` and adjust. Do not add `any` to paper over it.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/usePhraseAudio.ts package.json package-lock.json
git commit -m "feat(audio): hook that plays recorded clips instead of synthesising

Takes a phrase id rather than Arabic text. hasClip is the render condition for
every speaker button: false everywhere today, true per phrase as clips land,
with no code change needed when they do.

playSlow reuses the same clip at 0.7x, so slow playback costs no extra
recordings.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 4: Swap the five call sites that keep audio

**Files:**
- Modify: `src/screens/HomeScreenNew.tsx:25,97,287`
- Modify: `src/components/home/DailyPhrase.tsx:24,34` (new `canPlay` prop)
- Modify: `src/screens/PracticeScreen.tsx:288,653,654,734,861`
- Modify: `src/screens/PhraseLibrary.tsx:52,85-97`
- Modify: `src/components/scenario/ScenarioIntroPhase.tsx:33,95-103`
- Modify: `src/screens/onboarding/QuickWinSteps.tsx:28,195`

**Interfaces:**
- Consumes: `usePhraseAudio` (Task 3).
- Produces: nothing.

Each site swaps `useArabicTTS()` for `usePhraseAudio()`, passes an id instead of text, and gates its button on `hasClip`.

- [ ] **Step 1: HomeScreenNew**

Line 25 — replace the import:
```ts
import { usePhraseAudio } from '../hooks/usePhraseAudio';
```
Line 97:
```ts
  const { play, hasClip } = usePhraseAudio();
```
Line ~287 — pass the id:
```tsx
          onPlay={() => play(phraseOfTheDay.id)}
          canPlay={hasClip(phraseOfTheDay.id)}
```

`onPlay` alone is **not** enough. `DailyPhrase` already types `onPlay` as optional but renders its play button unconditionally and calls `onPlay?.()` (`src/components/home/DailyPhrase.tsx:160`), so passing `undefined` leaves a live button that fires its ripple animation and plays nothing. Add the prop:

In `src/components/home/DailyPhrase.tsx`, add to the props interface near line 24:
```ts
  /** False when no recording exists for this phrase — the button is not rendered. */
  canPlay?: boolean;
```
Destructure it near line 34 with `canPlay = true` as the default, so every other caller is unaffected, and wrap the play `Pressable` in `{canPlay && ( ... )}`.

- [ ] **Step 2: PhraseLibrary**

Line 17:
```ts
import { usePhraseAudio } from '../hooks/usePhraseAudio';
```
Line 52:
```ts
  const { play: playClip, playSlow: playClipSlow, playingId, hasClip } = usePhraseAudio();
```
Delete the local `playingId` state (line 53) and the `playTimeoutRef` (line 56) — the hook owns both now, and the 4s/6s guess timers exist only because `expo-speech` gave no completion callback. `expo-audio` does.

Replace lines 85–97:
```ts
  const play = useCallback((p: Phrase) => playClip(p.id), [playClip]);
  const playSlow = useCallback((p: Phrase) => playClipSlow(p.id), [playClipSlow]);
```
Delete the `useEffect` at lines 99–103 that cleared `playTimeoutRef`.

Wrap the "play slowly" `Pressable` (lines ~148–159) so it only renders with a clip:
```tsx
            {hasClip(p.id) && (
              <Pressable
                /* ...unchanged... */
              </Pressable>
            )}
```
Do the same for the main play control inside `PhraseEntry` — pass `canPlay={hasClip(p.id)}` and render its speaker button only when true.

- [ ] **Step 3: PracticeScreen**

Line 14:
```ts
import { usePhraseAudio } from '../hooks/usePhraseAudio';
```
Line 288:
```ts
  const { play, playSlow, isPlaying, hasClip } = usePhraseAudio();
```
Lines 653–654:
```tsx
              onSpeak={hasClip(phrase.id) ? () => play(phrase.id) : undefined}
              onSpeakSlow={hasClip(phrase.id) ? () => playSlow(phrase.id) : undefined}
```
Lines 734 and 861 — wrap each `Pressable` in `{hasClip(phrase.id) && ( ... )}`.

- [ ] **Step 4: ScenarioIntroPhase**

Line 11:
```ts
import { usePhraseAudio } from '../../hooks/usePhraseAudio';
```
Line 33:
```ts
  const { play, playingId, hasClip } = usePhraseAudio();
```
Replace `playPrimer` (lines 95–103) — `phraseId` was already in the signature, `arabic` is dead:
```ts
  const playPrimer = (phraseId: string) => play(phraseId);
```
Delete `primerTimerRef` (line 89), its `useEffect` (lines 91–93), and the local `playingId` state. Update the call site to pass only `p.id`, and render each primer's speaker icon behind `hasClip(p.id)`.

- [ ] **Step 5: QuickWinSteps**

Line 10:
```ts
import { usePhraseAudio } from '../../hooks/usePhraseAudio';
```
Line 28:
```ts
  const { play, hasClip } = usePhraseAudio();
```
Line 195 — `STRINGS.onboarding.firstPhraseArabic` is `'شلونك؟'`, which is phrase `g3`:
```ts
                  play('g3');
```
Add a comment above it, because the literal is otherwise unexplained:
```ts
                  // STRINGS.onboarding.firstPhraseArabic duplicates phrase g3's
                  // Arabic. The clip is keyed by id, so the id is what plays.
                  play('g3');
```
The "hear it" button also reveals the phrase, so keep it rendered when there is no clip — only the audio is conditional. `play('g3')` is already a no-op without a clip, so no guard is needed here; leave the button as is.

- [ ] **Step 6: Typecheck and test**

```bash
npx tsc --noEmit && npx jest --silent
```
Expected: exit 0, all suites pass.

- [ ] **Step 7: Commit**

```bash
git add src/screens/HomeScreenNew.tsx src/screens/PracticeScreen.tsx src/screens/PhraseLibrary.tsx src/components/scenario/ScenarioIntroPhase.tsx src/screens/onboarding/QuickWinSteps.tsx
git commit -m "refactor(audio): play clips by phrase id at the five real-phrase sites

Also drops the 4s and 6s guess timers these screens used to clear their own
playing indicator. Those existed because expo-speech gave no completion
callback; expo-audio does, so the hook owns playing state now.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 5: Remove audio from the four sites that cannot have it

**Files:**
- Modify: `src/screens/ScenarioPlayer.tsx` (lines 21, 156, 166, 229, 290, 364–372)
- Modify: `src/screens/SentenceBuilder.tsx` (lines 21, 79, 129)

**Interfaces:**
- Consumes: nothing.
- Produces: nothing.

These have no phrase id and can never have a clip. They are deletions, not ports.

- [ ] **Step 1: ScenarioPlayer — remove NPC dialogue audio**

Spec §2.10: "Dialogue has no audio; romanisation carries pronunciation."

- Line 156: delete `const { speakAs, isSpeaking: playingAudio } = useArabicTTS();`
- Line 166: delete the `speakAs(dialogue.arabic, scene.charGender);` call and whatever wrapper function contains it if that becomes empty.
- Line ~229: delete the `Pressable` whose `onPress` is `speakAs(...)`, including its icon child.
- Remove any now-unused `playingAudio` references and the icon import if nothing else uses it.

- [ ] **Step 2: ScenarioPlayer — remove choice-card audio**

`playChoice(choiceId, arabic)` at lines 364–372: `choiceId` is a choice id, not a phrase id. Choice cards are not library phrases and have no clips.

- Delete `playChoice` entirely, plus `choiceTtsTimerRef`, `playingChoiceId` state, and its cleanup.
- Delete the speaker control on each choice card that called it.

- [ ] **Step 3: ScenarioPlayer — keep the end-screen phrase audio**

`playEndPhrase(phraseId, arabic)` at lines 374–382 **stays** — those are real unlocked phrases. Convert it:

Line 21:
```ts
import { usePhraseAudio } from '../hooks/usePhraseAudio';
```
Line 290:
```ts
  const { play, playingId, hasClip } = usePhraseAudio();
```
Replace lines 374–382:
```ts
  const playEndPhrase = useCallback((phraseId: string) => play(phraseId), [play]);
```
Delete `phraseTtsTimerRef`, the local `playingPhraseId` state and its cleanup; use the hook's `playingId`. Update the call site to pass only the id, and render each end-screen phrase's speaker icon behind `hasClip(id)`.

- [ ] **Step 4: SentenceBuilder — remove audio entirely**

A built sentence is composed at runtime and has no id, so it can never be pre-recorded.

- Line 21: delete the `useArabicTTS` import.
- Line 79: delete `const { speak } = useArabicTTS();`
- Line 129: delete the `speak(arabic);` call and the control that triggers it.
- Remove the now-unused icon import if nothing else uses it.

- [ ] **Step 5: Typecheck, lint and test**

```bash
npx tsc --noEmit && npx expo lint && npx jest --silent
```
Expected: exit 0 on all three. Lint catches imports left unused by the deletions.

- [ ] **Step 6: Commit**

```bash
git add src/screens/ScenarioPlayer.tsx src/screens/SentenceBuilder.tsx
git commit -m "feat(audio): drop audio where no recording can exist

NPC dialogue goes per spec 2.10 — romanisation carries pronunciation there.
Choice cards and Sentence Builder's composed sentences go because neither has
a phrase id, so neither can ever be keyed to a clip.

The end-screen phrase list keeps its audio: those are real unlocked phrases.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 6: Delete the TTS hook and the dependency

**Files:**
- Delete: `src/hooks/useArabicTTS.ts`
- Modify: `package.json` (remove `expo-speech`)

**Interfaces:**
- Consumes: nothing.
- Produces: nothing.

- [ ] **Step 1: Verify nothing still imports it**

```bash
grep -rn "useArabicTTS\|expo-speech" --include=*.ts --include=*.tsx src app
```
Expected: **no output**. If anything remains, finish Tasks 4 and 5 before continuing.

- [ ] **Step 2: Delete the hook and drop the dependency**

```bash
git rm src/hooks/useArabicTTS.ts
npm uninstall expo-speech
```

- [ ] **Step 3: Full verification**

```bash
npx tsc --noEmit && npx expo lint && npx jest --silent
```
Expected: exit 0, all suites pass.

Then verify from a clean tree, per the project's git discipline — a compile that only passes because of an uncommitted file is not a passing compile:

```bash
git stash push -u -m "pre-clean-check"
npx tsc --noEmit
git stash pop
```
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add -u src/hooks package.json package-lock.json
git commit -m "feat(audio): remove device TTS

Closes the standing violation of language-authority rule 1. ar-AE is a locale
tag, not a dialect model: device Arabic voices are MSA-trained whatever region
tag they carry, so the app said qahwa while the card taught gahwa, mangled
shloonak because the word is not MSA, and could not produce ch at all.

The app is silent until recordings land. That is the intended state — audio
that contradicts the card teaches against it, and romanisation is already the
authoritative pronunciation channel.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 7: Provenance file and the synthetic-audio diagnostic

**Files:**
- Create: `assets/audio/SOURCES.json`
- Create: `docs/language/audio-diagnostic.md`
- Modify: `docs/language/authority.md` (add the audio-provenance rule)

**Interfaces:**
- Consumes: the generator (Task 2), which already refuses to run on a clip with no `SOURCES.json` entry.
- Produces: nothing code-facing.

**Why this task exists:** clips are to be sourced from an AI audio generator rather than hired human voices. Commercial Arabic TTS is MSA-trained — the same failure this branch removes, bought at a higher price. This task does not block that, it makes it **testable before money is spent** and **recorded after**.

- [ ] **Step 1: Seed the provenance file**

Create `assets/audio/SOURCES.json`:

```json
{
  "_comment": "One entry per .m4a in this directory. The generator refuses to run without one, for the same reason Phrase.source is required: a clip presented as Emirati speech when it is a synthesiser reading MSA is the audio equivalent of an invented citation, and nobody downstream can hear the difference. kind is 'human' or 'synthetic'. voice is a speaker name, or vendor:voice-id for synthetic."
}
```

The generator ignores keys with no matching `.m4a`, so the comment is harmless.

- [ ] **Step 2: Write the diagnostic**

Create `docs/language/audio-diagnostic.md`:

```markdown
# Audio vendor diagnostic

Run this **before** paying for a batch. It takes ten minutes and decides whether
a generator is usable at all.

## Why

`ar-AE` is a locale tag, not a dialect model. Arabic TTS — device voices and
commercial AI generators alike — is trained on Modern Standard Arabic whatever
region tag it carries. Voice cloning does not fix this: cloning transfers timbre,
not dialect phonology, so a cloned Emirati voice still reads the script with MSA
vowels. Gulf-dialect TTS is an open research problem, not a solved product.

So the question is not "does this sound like a real person" — modern generators
all pass that. It is "does it say the Gulf form or the MSA form".

## The test

Generate these six, then compare each against its romanisation. The romanisation
is what the app teaches and what the learner reads on the card.

| Arabic | App teaches | MSA generator will say | Listen for |
|---|---|---|---|
| قهوة | **gahwa** | qahwa | first consonant: hard g, not q |
| شلونك؟ | **shloonak** | mangled, letter-by-letter | it is not an MSA word at all |
| وايد | **waayid** | waajid / rejected | the j |
| يديد | **yediid** | jadiid | first consonant: y, not j |
| چ (in any word carrying it) | **ch** | silence or k | absent from the MSA inventory |
| لو سمحت | **law samaht** | law samaht | should pass — a control |

## Passing

**All five diagnostics plus the control.** Not "close enough on most". A
generator that says *qahwa* is the problem this branch exists to remove, and
buying 124 clips of it reintroduces the violation at a higher price.

## If it fails

Do not buy the batch. Options, in order of preference:

1. Hire the two Emirati voices as originally specified. This is the known-good path.
2. Record a Gulf speaker and use speech-to-speech voice conversion — the
   phonology comes from the human, the timbre from the model. Still needs a Gulf
   speaker, so it saves studio quality, not hiring.
3. Ship silent. Romanisation already carries pronunciation and is documented as
   the authoritative channel. This is the current state and it is honest.

## Whatever is chosen

Record it per clip in `assets/audio/SOURCES.json`. `kind: "synthetic"` is an
acceptable, honest value. Presenting a synthesised clip as an Emirati recording
is not.
```

- [ ] **Step 3: Add the rule to authority.md**

In `docs/language/authority.md`, in the audio section, append:

```markdown
### Audio provenance

Every clip states its origin in `assets/audio/SOURCES.json`; the manifest
generator refuses to run without it. `kind: "synthetic"` is a permitted and
honest value — presenting a synthesised clip as a human Emirati recording is
not, and is the same failure as an invented page number (§0).

Before buying any batch of generated audio, run
[`audio-diagnostic.md`](audio-diagnostic.md). Arabic TTS is MSA-trained
regardless of locale tag, and a generator that says *qahwa* reintroduces the
exact violation the audio work exists to remove.
```

- [ ] **Step 4: Verify the generator still refuses correctly**

```bash
printf 'not audio' > assets/audio/zz-test.male.m4a
npm run audio:manifest
```
Expected: **exit 1**, with `zz-test.male.m4a — no entry in assets/audio/SOURCES.json`.

```bash
rm assets/audio/zz-test.male.m4a
npm run audio:manifest
```
Expected: exit 0, `clips present : 0`.

- [ ] **Step 5: Commit**

```bash
git add assets/audio/SOURCES.json docs/language/audio-diagnostic.md docs/language/authority.md
git commit -m "docs(audio): require clip provenance, and a vendor test before buying

Clips are to come from an AI generator rather than hired voices. Commercial
Arabic TTS is MSA-trained, so that risks buying the exact violation this branch
removes, at a higher price.

The diagnostic is six phrases whose Gulf and MSA pronunciations differ audibly
— gahwa vs qahwa, yediid vs jadiid — plus a control. Ten minutes, before any
batch is paid for.

Provenance is required per clip for the same reason Phrase.source is required:
a synthesised clip presented as Emirati speech is an invented citation nobody
downstream can hear.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 8: Open the PR

- [ ] **Step 1: Final full verification**

```bash
npx tsc --noEmit && npx expo lint && npx jest --silent
```
Expected: exit 0, all suites pass.

- [ ] **Step 2: Confirm the app runs and the buttons are gone**

```bash
npm run audio:manifest
```
Expected: `clips present : 0`.

Start the dev server and check Phrase Library, Practice and a scenario end screen: no speaker buttons anywhere, no crash, romanisation still shown.

- [ ] **Step 3: Push and open the PR**

```bash
git push -u origin feat/phrase-audio
```

PR to `dev`, titled `feat(audio): recorded phrase clips, device TTS removed`. Body must state: the app ships silent, that this is intended, the 62/124 figure against the spec's ~90/~180, the 44 never-taught phrases as an open content question, and that the recording brief is the deliverable that unblocks the branch.

---

## Deliberately not in this plan

- **The 44 never-taught phrases** (spec §3.1). They lose their speaker button permanently here. Cut them, teach them, or record all 106 — a content decision, not an audio one.
- **Form-gender variants.** Promoting the 9 `pronTip` alternates into an `arabicFeminine` field on `Phrase` (spec §2.2). Note `g3` — the onboarding phrase — is one of them, so a female learner hears a female voice saying the masculine form. Worth fixing, not here.
- **Disclosing synthetic audio in the UI.** If clips end up synthetic, whether a learner is told is a product call, not something to implement silently. Provenance is recorded either way; surfacing it is a separate decision.
