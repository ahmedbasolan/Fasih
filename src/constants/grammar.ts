/**
 * Generative Grammar content — single source of truth for the Sentence Builder.
 *
 * ─── Source rule (non-negotiable) ────────────────────────────────────────────
 * Every pattern example and every slot option is a `phraseId` that resolves in
 * phrases.ts, or a `scenarioId:sceneId` reference in `source`. No invented
 * content. Derived content is flagged `needsNativeReview` and listed in
 * REVIEW_QUEUE — shipping it requires native-speaker sign-off.
 *
 * Romanisation (from scenarios.ts header): ' = ع · kh = خ · gh = غ · g = ق ·
 * h = ح · sh = ش · aa/ii/uu = long vowels · no tashkeel.
 */
import type { GrammarPattern, SoftSkill } from '../types';
import { PHRASE_BY_ID } from './phrases';

// ─── REVIEW QUEUE — derived/new Arabic strings needing native-speaker sign-off ─
// Release-blocking: nothing here ships until a native Gulf Arabic speaker has
// confirmed it. Add to this list whenever new content is authored.
//
// Empty since gym-consultation was cut for the MVP: its derived b-future
// sentences (بنبدا خفيف / بنبدا حديد) went with it. See git history.
export const REVIEW_QUEUE: string[] = [];

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
// 9 patterns. abi-verb (أبي ___) was cut with gym-consultation and returned with
// The Meeting, alongside khalni-verb (خلني ___), both built on its verb phrases
// (spec 2026-09-14 §2.9). b-future (بـ + verb) is still out until a rewrite
// grants phrases to build it from. Continuous قاعد stays deferred until a
// scenario's dialogue naturally contains it.
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
    unlockedByScenario: 'office-meeting',
    softSkill: 'request',
    goodImpressionNote:
      'أبي is the everyday Gulf "I want" (not أريد). In a meeting, أبي plus a verb is a clear ask — direct without being rude.',
    examples: [{ phraseId: 'f8' }], // أبي آكل
    source: 'office-meeting:scene3 أبي أمسكها بنفسي',
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
        options: ['mt-3', 'mt-4'], // أحاول، أساعد
      },
    ],
  },

  {
    id: 'khalni-verb',
    title: 'خلني ___ — let me ___',
    titleFeminine: 'خلني ___ — let me ___',
    unlockedByScenario: 'office-meeting',
    softSkill: 'offer',
    goodImpressionNote:
      'خلني is the Gulf "let me". خلني أساعد offers help without pushing; خلني أحاول asks permission and offers a plan in one breath.',
    examples: [{ phraseId: 'mt-2' }], // خلني أفكر فيها
    source: 'office-meeting:scene4-sponsor خلني أساعدك فيها / scene4-voice خلني أحاول شهر واحد / scene6-voice خلني أفكر فيها',
    template: {
      arabic: ['خلني', '{verb}'],
      roman: ['khallni', '{verb}'],
      english: ['let me', '{verb}'],
    },
    slots: [
      {
        id: 'verb',
        label: 'something you offer to do',
        accepts: 'verb',
        options: ['mt-3', 'mt-4'], // أحاول، أساعد
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
    title: 'شو / وين / ليش — what? where? why?',
    titleFeminine: 'شو / وين / ليش — what? where? why?',
    unlockedByScenario: '',
    softSkill: 'question',
    // Glosses only, from e9–e12 in phrases.ts (UNSOURCED). The earlier note made
    // a claim about what asking signals in the Gulf, with nothing behind it.
    goodImpressionNote:
      'شو (what), وين (where), ليش (why) and متى (when) — each works on its own as a one-word question, as in the examples.',
    examples: [
      { phraseId: 'e9' }, // شو؟
      { phraseId: 'e11' }, // وين؟
      { phraseId: 'e10' }, // ليش؟
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
        options: ['e9', 'e10', 'e11', 'e12'],
      },
    ],
  },

  {
    id: 'imperative-polite',
    title: 'عطني / تفضل — give me / please',
    titleFeminine: 'عطني / تفضلي — give me / please',
    // Re-homed to Eid (spec §2.9), where Uncle Salem's تفضل runs through every
    // scene. Was a gym-consultation secret unlock, then a library basic.
    unlockedByScenario: 'eid-greeting',
    source: 'eid-greeting:scene2 تفضل، اقعد هني / scene4-honoured تفضل مكاني يا عمي',
    softSkill: 'offer',
    // Glosses only, from a6 and h1 in phrases.ts (UNSOURCED). The earlier note made
    // a claim about how an offer reads as hospitality, with nothing behind it.
    goodImpressionNote:
      'عطني (give me) asks for something; تفضل (please / here you go / come in) offers it — تفضلي to a woman.',
    examples: [{ phraseId: 'a6' }, { phraseId: 'h1' }], // عطني / تفضل
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
        options: ['a6', 'h1'],
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
