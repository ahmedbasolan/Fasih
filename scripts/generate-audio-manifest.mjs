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

  // AudioModule is only referenced in the body when at least one clip exists.
  // With zero clips, importing it anyway leaves an unused import that
  // `npx expo lint` flags — so it is only imported when the body uses it.
  const typeImport = clips.length > 0
    ? `import type { AudioManifest, AudioModule } from '../types';`
    : `import type { AudioManifest } from '../types';`;

  return `/**
 * GENERATED FILE — do not edit by hand.
 * Run \`npm run audio:manifest\` after adding or removing clips in assets/audio/.
 *
 * Empty means no clips are present yet, which is the expected state until
 * recordings exist. Speaker buttons render on a clip being found, so an empty
 * manifest hides all of them without a feature flag.
 */
${typeImport}

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
