/**
 * Generative Grammar content — single source of truth for the Sentence Builder.
 *
 * ─── Source rule (non-negotiable) ────────────────────────────────────────────
 * Every pattern example and every slot option is a `phraseId` that resolves in
 * phrases.ts, or a `scenarioId:sceneId` reference in `source`. No invented
 * content. Derived content (pattern `b-future`) is flagged `needsNativeReview`
 * and listed in REVIEW_QUEUE — shipping it requires native-speaker sign-off.
 *
 * Romanisation (from scenarios.ts header): ' = ع · kh = خ · gh = غ · g = ق ·
 * h = ح · sh = ش · aa/ii/uu = long vowels · no tashkeel.
 */
import type { GrammarPattern, SoftSkill } from '../types';
import { PHRASE_BY_ID } from './phrases';

// ─── REVIEW QUEUE — derived/new Arabic strings needing native-speaker sign-off ─
// Release-blocking: nothing here ships until a native Gulf Arabic speaker has
// confirmed it. Add to this list whenever new content is authored.
export const REVIEW_QUEUE: string[] = [
  // Pattern: b-future. Derived from the gym dialogue line "ونبدا خفيف"
  // (scenarios.ts scene4 choice a): ونبدا (w-nibda, "and we start") → بنبدا
  // (b-nibda, "we will start") — the b- prefix marks the future in Gulf Arabic.
  'بنبدا خفيف', // assembled: ب + نبدا + خفيف
  'بنبدا حديد', // assembled: ب + نبدا + حديد (حديد sourced from phrase gym-4)
];

// ─── Profession pools ────────────────────────────────────────────────────────
// Mechanism demonstration, MVP. Each future scenario feeds its own pool from its
// own dialogue + phrasesUnlocked. Every ID resolves in phrases.ts.
export const PROFESSION_POOLS: Record<string, { label: string; wordPool: string[] }> = {
  barista: {
    label: 'Barista / Coffee',
    wordPool: ['f1', 'f2', 'f3', 'f8', 's1'], // قهوة، شاي، ماي، أبي آكل، يلا نشرب قهوة
  },
};

// ─── Patterns ────────────────────────────────────────────────────────────────
// MVP: 9 patterns + 1 deferred (continuous قاعد — ships only when a scenario's
// dialogue naturally contains it; grep-verified absent today).
//
// `template` — assembly frame. Each entry is a fixed word or `{slotId}` in
// Arabic-reading order (right to left in Arabic, left to right in roman/english).
// `slots` — one per {slotId} placeholder; options are phrase IDs whose arabic
// fills the slot. Whole-phrase patterns use a single `{slotId}` frame.
export const GRAMMAR_PATTERNS: GrammarPattern[] = [
  {
    id: 'ana-adj',
    title: 'أنا ___ — I am ___',
    titleFeminine: 'أنا ___ — I am ___',
    unlockedByScenario: 'first-morning',
    softSkill: 'identity',
    goodImpressionNote:
      'Introducing yourself with أنا and a Gulf word (يديد for "new") tells people you learned Arabic here, not in a classroom.',
    examples: [{ phraseId: 'fm-s1-5' }], // أنا يديد هني — "I'm new here"
    template: {
      arabic: ['أنا', '{adj}'],
      roman: ['ana', '{adj}'],
      english: ['I am', '{adj}'],
    },
    slots: [
      {
        id: 'adj',
        label: 'word to describe yourself',
        accepts: 'adjective',
        options: ['e1', 'e15', 'f4', 'f5'], // زين، حلو، يووعان، عطشان
      },
    ],
  },

  {
    id: 'abi-verb',
    title: 'أبي ___ — I want to ___',
    titleFeminine: 'أبي ___ — I want to ___',
    unlockedByScenario: 'gym-consultation',
    softSkill: 'request',
    goodImpressionNote:
      'أبي is the everyday Khaleeji "I want" (not أريد). A request with أبي plus لو سمحت lands as polite and direct — same words, better trust impact.',
    examples: [{ phraseId: 'f8' }], // أبي آكل
    source:
      'gym-consultation:scene2 أبي أنزل عشر كيلو (line 442) / أبي أبدأ جدي (line 446); the-checkup:scene4 أبي أعرف (line 642)',
    template: {
      arabic: ['أبي', '{verb}'],
      roman: ['abi', '{verb}'],
      english: ['I want to', '{verb}'],
    },
    slots: [
      {
        id: 'verb',
        label: 'something you want to do',
        accepts: 'verb',
        options: ['gym-2'], // أنحف
      },
    ],
  },

  {
    id: 'b-future',
    title: 'بـ + verb — we will ___',
    unlockedByScenario: 'gym-consultation',
    needsNativeReview: true,
    softSkill: 'suggest',
    goodImpressionNote:
      'Gulf Arabic marks the future with بـ stuck onto the verb: ونبدا ("and we start") becomes بنبدا ("we will start"). It turns a promise into a plan.',
    examples: [{ phraseId: 'gym-10' }], // خلنا نبدا خفيف — the ear anchor for نبدا
    source:
      'gym-consultation:scene4 choice a "ونبدا خفيف" (line 483) — b- prefix derived; see REVIEW_QUEUE',
    template: {
      arabic: ['بنبدا', '{object}'],
      roman: ['b-nibda', '{object}'],
      english: ["We'll start", '{object}'],
    },
    slots: [
      {
        id: 'object',
        label: 'what we start with',
        accepts: 'noun',
        options: ['gym-4'], // حديد — "playing iron" = weightlifting in the Gulf
      },
    ],
  },

  {
    id: 'ma-verb',
    title: 'ما ___ — I don\'t ___',
    titleFeminine: 'ما ___ — I don\'t ___',
    unlockedByScenario: '',
    softSkill: 'reassure',
    goodImpressionNote:
      'ما negates verbs in Khaleeji: ما أدري (I don\'t know), ما يخالف (it doesn\'t matter). Reassuring someone with a ما phrase is softer than a flat "no".',
    examples: [{ phraseId: 'a5' }, { phraseId: 's7' }, { phraseId: 'a1' }], // ما أدري / ما يخالف / ما عليه
    template: {
      arabic: ['{clause}'],
      roman: ['{clause}'],
      english: ['{clause}'],
    },
    slots: [
      {
        id: 'clause',
        label: 'what you don\'t do / doesn\'t matter',
        accepts: 'phrase',
        options: ['a5', 's7', 'a1'],
      },
    ],
  },

  {
    id: 'mub-adj',
    title: 'مب ___ — not ___',
    titleFeminine: 'مب ___ — not ___',
    unlockedByScenario: '',
    softSkill: 'reassure',
    goodImpressionNote:
      'مب (mub) is the Khaleeji "not" for adjectives and nouns: مب زين (not good). Softening a complaint with مب reads as honest but not harsh.',
    examples: [{ phraseId: 'e16' }], // مب زين
    template: {
      arabic: ['مب', '{adj}'],
      roman: ['mub', '{adj}'],
      english: ['not', '{adj}'],
    },
    slots: [
      {
        id: 'adj',
        label: 'word to describe the thing',
        accepts: 'adjective',
        options: ['e1'], // زين
      },
    ],
  },

  {
    id: 'possessive',
    title: 'noun + my/your — ___ of mine, ___ of yours',
    titleFeminine: 'noun + my/your (f) — ___ of mine, ___ of yours',
    unlockedByScenario: '',
    softSkill: 'identity',
    goodImpressionNote:
      'Ownership is a suffix, not a word: يدي (my grandfather), بيتك (your home), شلونك (your state). Attaching the right suffix — -i, -ak, or -ich — is how you claim people as yours.',
    examples: [{ phraseId: 'fm2' }, { phraseId: 'h3' }, { phraseId: 'g3' }], // يدي / البيت بيتك / شلونك
    template: {
      arabic: ['{phrase}'],
      roman: ['{phrase}'],
      english: ['{phrase}'],
    },
    slots: [
      {
        id: 'phrase',
        label: 'word with a possession suffix',
        accepts: 'phrase',
        options: ['fm2', 'h3', 'g3'],
      },
    ],
  },

  {
    id: 'question-words',
    title: 'كم / وين / شو — how much? where? what?',
    titleFeminine: 'كم / وين / شو — how much? where? what?',
    unlockedByScenario: '',
    softSkill: 'question',
    goodImpressionNote:
      'كم (how much), وين (where), شو (what) open conversations the Gulf way — asking about weight, height, or plans shows you care enough to ask.',
    examples: [
      { phraseId: 'gym-9' }, // كم وزنك الحين؟
      { phraseId: 'checkup-2' }, // كم طولك؟
      { phraseId: 'e9' }, // شو؟
    ],
    template: {
      arabic: ['{question}'],
      roman: ['{question}'],
      english: ['{question}'],
    },
    slots: [
      {
        id: 'question',
        label: 'question word or full question',
        accepts: 'questionWord',
        options: ['gym-9', 'checkup-2', 'e9', 'e10', 'e11', 'e12'],
      },
    ],
  },

  {
    id: 'imperative-polite',
    title: 'عطني / تفضل / خلني — give me / please / let me',
    titleFeminine: 'عطني / تفضلي / خليني — give me / please / let me',
    unlockedByScenario: 'gym-consultation',
    secretUnlock: true,
    softSkill: 'offer',
    goodImpressionNote:
      'خلني (let me) signals initiative — خلني أجهز لك عرض سعر is the phrase that turns a conversation into a deal. Offering to prepare something in writing proves you run a real operation.',
    examples: [{ phraseId: 'a6' }, { phraseId: 'h1' }, { phraseId: 'gym-13-secret' }], // عطني / تفضل / خلني أجهز لك عرض سعر
    template: {
      arabic: ['{phrase}'],
      roman: ['{phrase}'],
      english: ['{phrase}'],
    },
    slots: [
      {
        id: 'phrase',
        label: 'polite request or offer',
        accepts: 'phrase',
        options: ['a6', 'h1', 'gym-13-secret'],
      },
    ],
  },

  {
    id: 'yalla-verb',
    title: 'يلا ___ — let\'s ___',
    titleFeminine: 'يلا ___ — let\'s ___',
    unlockedByScenario: '',
    softSkill: 'action',
    goodImpressionNote:
      'يلا is the most versatile word in Gulf Arabic — "let\'s go", "come on", "alright". Opening an invitation with يلا makes it feel warm and casual, never pressured.',
    examples: [{ phraseId: 's1' }, { phraseId: 's2' }, { phraseId: 'fm-s1-8' }], // يلا نشرب قهوة / يلا بينا / يلا بالتوفيق
    template: {
      arabic: ['{phrase}'],
      roman: ['{phrase}'],
      english: ['{phrase}'],
    },
    slots: [
      {
        id: 'phrase',
        label: 'the invitation',
        accepts: 'phrase',
        options: ['s1', 's2', 'fm-s1-8'],
      },
    ],
  },
];

// ─── Content integrity helpers (used by the engine + tests) ──────────────────

/** All phrase IDs referenced anywhere in the patterns (examples + slots). */
export function allReferencedPhraseIds(): string[] {
  const ids = new Set<string>();
  for (const p of GRAMMAR_PATTERNS) {
    for (const ex of p.examples) ids.add(ex.phraseId);
    for (const slot of p.slots) for (const opt of slot.options) ids.add(opt);
  }
  return Array.from(ids);
}

/** Resolve a referenced phrase ID to its Phrase, or null if it doesn't exist. */
export function resolveReferencedPhrase(phraseId: string) {
  return PHRASE_BY_ID[phraseId] ?? null;
}

/** Every derived/new Arabic string in the app that awaits native sign-off. */

/** The 9 shipped soft-skill tags (used by classifySoftSkill). */
export const SOFT_SKILLS: SoftSkill[] = [
  'offer', 'request', 'suggest', 'confirm', 'reassure', 'question', 'identity', 'action',
];
