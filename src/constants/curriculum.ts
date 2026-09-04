/**
 * The curriculum spec — every checkable number, in one place.
 *
 * ─── Why this file exists ────────────────────────────────────────────────────
 * Fasih's difficulty levels drifted because they referenced nothing. Three
 * separate difficulty vocabularies existed and disagreed with each other:
 * `social_taxi_ride` was `level: 'Beginner'` in the catalog and
 * `difficulty: 'Level 2 (Elementary)'` in its own script at the same time. Two
 * documents both claimed authority over tashkeel and contradicted each other.
 *
 * So: one home per rule. Everything a machine can check lives HERE, and both
 * the app and `languageContent.test.ts` import THIS constant. A threshold
 * cannot drift from its own enforcement because there is only one copy.
 *
 * Prose, rationale and the things a machine cannot check live in
 * `docs/language/`. See `docs/superpowers/specs/2026-09-03-language-authority-design.md`.
 */

import type { DifficultyLevel, CEFRBand, SourceClaim, SourceId, SourceRef } from '../types';

// The language types live in ../types (CLAUDE.md: all shared types in one file),
// which also keeps this module free of a circular import — types/index.ts must
// not depend on constants.
export type { CEFRBand, SourceClaim, SourceId, SourceRef };

/**
 * A citation for content nobody has traced to a published source yet.
 *
 * Shorthand so a phrase line stays readable while still being forced to say
 * something about its provenance. The lint counts these; driving the count down
 * is tracked work, not a silent default.
 */
export const UNSOURCED: SourceRef = { ref: 'unsourced', locator: '', claim: 'lexeme' };

/** Inclusive at both ends. */
export interface Range {
  readonly min: number;
  readonly max: number;
}

export function inRange(value: number, r: Range): boolean {
  return value >= r.min && value <= r.max;
}

export interface LevelSpec {
  readonly tier: DifficultyLevel;
  readonly cefr: CEFRBand;
  /** CEFR-style descriptor. Safe to show in the UI. */
  readonly canDo: string;
  readonly turns: Range;
  readonly phrasesUnlocked: Range;
  /**
   * Mean morphemes per learner choice card. NOT whitespace words — Arabic
   * writes clitics attached, so word count measures spelling as much as
   * complexity. See `src/engine/arabicMetrics.ts`.
   */
  readonly meanMorphemes: Range;
  /** Hard ceiling on any single choice card. */
  readonly morphemeCeiling: number;
  /** Max clauses in one card. Stops a card posing two asks in one breath. */
  readonly maxClausesPerCard: number;
  /** Minimum distinct DIALECT_FEATURES the learner must PRODUCE. */
  readonly productiveDialectFeatures: number;
  readonly receptiveDialects: 'none' | 'recognise' | 'recognise-and-respond';
}

/**
 * Bands calibrated 2026-09-03 against `countMorphemes` in
 * `src/engine/arabicMetrics.ts`, using the ten scripted scenarios. Observed
 * means clustered cleanly into three groups with no scenario on a boundary:
 *
 *   4.3–5.2  social_elevator, social_taxi_ride, cafe-friends, first-morning
 *   6.5–7.1  coffee-invitation, hotel-guest, eid-greeting
 *   8.9–10.3 the-checkup, gym-consultation
 *
 * PROVISIONAL. `countMorphemes` is an orthographic approximation. When
 * `tools/dialect-check.py` lands, recalibrate against real CALIMA-GLF
 * tokenisation and update these numbers together with that commit.
 */
export const LEVEL_SPECS: Readonly<Record<DifficultyLevel, LevelSpec>> = {
  Beginner: {
    tier: 'Beginner',
    cefr: 'A1',
    canDo: 'Reply in set exchanges when spoken to slowly.',
    turns: { min: 3, max: 4 },
    phrasesUnlocked: { min: 6, max: 8 },
    meanMorphemes: { min: 3.0, max: 5.9 },
    morphemeCeiling: 10,
    maxClausesPerCard: 3,
    productiveDialectFeatures: 0, // Gulf vocabulary only; no grammar to produce yet
    receptiveDialects: 'none',
  },
  Intermediate: {
    tier: 'Intermediate',
    cefr: 'A1+',
    canDo: 'Handle a routine exchange and hold a turn.',
    turns: { min: 5, max: 6 },
    phrasesUnlocked: { min: 10, max: 12 },
    meanMorphemes: { min: 6.0, max: 7.9 },
    morphemeCeiling: 13,
    maxClausesPerCard: 3,
    productiveDialectFeatures: 3,
    receptiveDialects: 'recognise',
  },
  Advanced: {
    tier: 'Advanced',
    cefr: 'A2',
    canDo: 'Sustain a familiar situation and carry register.',
    turns: { min: 6, max: 7 },
    phrasesUnlocked: { min: 12, max: 16 },
    meanMorphemes: { min: 8.0, max: 12.0 },
    morphemeCeiling: 16,
    maxClausesPerCard: 4,
    productiveDialectFeatures: 5,
    receptiveDialects: 'recognise-and-respond',
  },
};

/**
 * Scenarios exempt from every level gate.
 *
 * Onboarding is two turns by design — it is a first-contact demo, not a rung on
 * the ladder. Note the id mismatch: the catalog carries one entry
 * (`onboarding-cafe`) while the scripts are mode-specific, so all three ids
 * must be listed.
 */
export const LEVEL_EXEMPT_SCENARIOS: readonly string[] = [
  'onboarding-cafe',
  'onboarding-cafe-career',
  'onboarding-cafe-social',
];

// ─── Impact tier bands ───────────────────────────────────────────────────────

/**
 * Allowed total impact (trust + respect + culture) per outcome tier.
 *
 * Lives here because two documents used to disagree about it: the
 * `fasih-scenario-review` checklist said good +3..+6 and bad −3..−9, while
 * `scenarioContent.test.ts` encoded good +3..+7 and bad −1..−9. The suite
 * therefore passed with "bad" choices costing only −2.
 *
 * Reconciled per-band rather than by picking one document wholesale:
 *
 *   good  — the TEST was right. Adjacent tiers overlap on purpose: a +6 can be
 *           a strong "good" or a modest "excellent", and forcing a hard boundary
 *           would make authors round choices toward the tier edges.
 *   bad   — the CHECKLIST was right. A "bad" choice that costs the learner one
 *           point teaches nothing; the cultural lesson attached to it is a lie if
 *           making the mistake is nearly free.
 */
export const TIER_BANDS: Readonly<Record<string, Range>> = {
  excellent: { min: 6, max: 9 },
  good: { min: 3, max: 7 },
  neutral: { min: -2, max: 2 },
  bad: { min: -9, max: -3 },
};

// ─── Sources ─────────────────────────────────────────────────────────────────

export interface SourceEntry {
  readonly id: SourceId;
  readonly title: string;
  /** Publication year. Drives the contemporaneity rule below. */
  readonly year: number;
  /** Claim types this source may be cited for, on its own. */
  readonly validFor: readonly SourceClaim[];
  readonly note?: string;
}

/**
 * Sources that may be cited, and what each may be cited FOR.
 *
 * Note `qafisheh-1977` and `holes-1990`: both are standard references and both
 * are restricted to `morphosyntax`. They describe Gulf speech from before the
 * UAE's population multiplied roughly twentyfold. Citing them for word choice
 * would teach learners to sound like their grandparents' generation.
 */
export const SOURCES: Readonly<Record<SourceId, SourceEntry>> = {
  'leung-2024': {
    id: 'leung-2024',
    title: 'Leung, Ntelitheos & Al Kaabi — Basic Emirati Arabic: A Grammar and Workbook (Routledge)',
    year: 2024,
    validFor: ['morphosyntax', 'lexeme', 'usage', 'register'],
    note: 'Emirati-specific, current, IPA + Arabic script, examples from native speakers.',
  },
  'routledge-comprehensive': {
    id: 'routledge-comprehensive',
    title: 'Emirati Arabic: A Comprehensive Grammar (Routledge)',
    year: 2022,
    validFor: ['morphosyntax', 'lexeme', 'usage', 'register'],
  },
  alramsa: {
    id: 'alramsa',
    title: 'Al Ramsa Institute published materials (Dubai)',
    year: 2023,
    validFor: ['morphosyntax', 'lexeme', 'usage', 'register'],
    note: 'Nine levels, A1–B3, scenario-organised. Taught to expats in Dubai now.',
  },
  'ramsa-corpus-2026': {
    id: 'ramsa-corpus-2026',
    title: 'Ramsa: Emirati Arabic Speech Corpus (arXiv:2603.08125), CC BY 4.0',
    year: 2026,
    validFor: ['morphosyntax', 'lexeme', 'usage', 'register'],
    note: '41h, 157 speakers, Urban/Bedouin/Shihhi. Attested contemporary speech, and the only free source in the contemporary tier.',
  },
  'emirati-social-media-2024': {
    id: 'emirati-social-media-2024',
    title: 'Towards Gulf Emirati Dialect Corpus from Social Media (Springer)',
    year: 2024,
    validFor: ['lexeme', 'usage'],
    note: 'Contemporary written Emirati.',
  },
  'qafisheh-1977': {
    id: 'qafisheh-1977',
    title: 'Qafisheh — A Short Reference Grammar of Gulf Arabic (Abu Dhabi-based)',
    year: 1977,
    validFor: ['morphosyntax'],
    note: 'RESTRICTED: structure only. Not acceptable as a sole citation for word choice, register or usage.',
  },
  'holes-1990': {
    id: 'holes-1990',
    title: 'Holes — Gulf Arabic (Routledge)',
    year: 1990,
    validFor: ['morphosyntax'],
    note: 'RESTRICTED: structure only, as above.',
  },
  'fasih-internal': {
    id: 'fasih-internal',
    title: "Fasih's own already-cited content (grammar.ts patterns, existing sourced phrases)",
    year: 2026,
    validFor: ['morphosyntax', 'lexeme', 'usage', 'register'],
    note: 'Use only to keep content internally consistent with something already sourced. Never a primary authority — it cannot make an unsourced claim sourced.',
  },
};

/**
 * A source cited for anything except `morphosyntax` must be contemporary.
 * See SOURCES notes on qafisheh-1977 / holes-1990.
 */
export const CONTEMPORARY_SOURCE_MIN_YEAR = 2020;

export function isValidCitation(ref: SourceRef): boolean {
  if (ref.ref === 'unsourced') return false;
  const src = SOURCES[ref.ref];
  if (!src.validFor.includes(ref.claim)) return false;
  if (ref.claim !== 'morphosyntax' && src.year < CONTEMPORARY_SOURCE_MIN_YEAR) return false;
  return true;
}

// ─── Dialect features ────────────────────────────────────────────────────────

/**
 * The closed set of Emirati/Gulf grammar features a learner can be said to
 * PRODUCE. `LevelSpec.productiveDialectFeatures` counts distinct entries from
 * this list; without an enumerated set that field would be unenforceable.
 *
 * Patterns are deliberately conservative — a false positive here inflates a
 * scenario's apparent dialect richness, which is worse than undercounting.
 */
export interface DialectFeature {
  readonly id: string;
  readonly label: string;
  readonly pattern: RegExp;
  readonly claim: SourceClaim;
  readonly source: SourceId;
}

export const DIALECT_FEATURES: readonly DialectFeature[] = [
  {
    id: 'neg-mub',
    label: 'مب — Gulf negative copula (vs MSA ليس)',
    pattern: /(^|[^؀-ۿ])مب([^؀-ۿ]|$)/,
    claim: 'morphosyntax',
    source: 'routledge-comprehensive',
  },
  {
    id: 'fem-2sg-ch',
    label: 'ـج — Emirati 2nd person feminine suffix (عندج، لج)',
    pattern: /(?:لج|عندج|بيتج|شلونج|عليج|منج|حالج|أسألج|يعافيج)(?![؀-ۿ])/,
    claim: 'morphosyntax',
    source: 'leung-2024',
  },
  {
    id: 'now-alheen',
    label: 'الحين — Gulf "now" (vs MSA الآن)',
    pattern: /الحين/,
    claim: 'lexeme',
    source: 'alramsa',
  },
  {
    id: 'intensifier-waayid',
    label: 'وايد — Gulf intensifier (vs MSA جداً/كثيراً)',
    pattern: /وايد/,
    claim: 'lexeme',
    source: 'alramsa',
  },
  {
    id: 'recent-taw',
    label: 'تو / توني — Gulf recent-past marker',
    pattern: /(^|[^؀-ۿ])تو(?:ني|ك|ه|ج)?([^؀-ۿ]|$)/,
    claim: 'morphosyntax',
    source: 'routledge-comprehensive',
  },
  {
    id: 'g-to-y-shift',
    label: 'ج → ي shift (يديد for جديد، ياب for جاب)',
    pattern: /(?:يديد|يديدة|ياب|يابت|يايب)/,
    claim: 'morphosyntax',
    source: 'leung-2024',
  },
  {
    id: 'want-abi',
    label: 'أبي / أبغي — Gulf "I want" (vs MSA أريد)',
    pattern: /(^|[^؀-ۿ])(?:أبي|ابي|أبغي|ابغي|تبي|تبغي|يبي|يبغي)([^؀-ۿ]|$)/,
    claim: 'lexeme',
    source: 'alramsa',
  },
  {
    id: 'good-zain',
    label: 'زين — Gulf "good/fine" (vs MSA حسناً/جيد)',
    pattern: /(^|[^؀-ۿ])زين([^؀-ۿ]|$)/,
    claim: 'lexeme',
    source: 'alramsa',
  },
  {
    id: 'here-hini',
    label: 'هني — Emirati "here" (vs pan-Arabic هنا)',
    pattern: /(^|[^؀-ۿ])هني([^؀-ۿ]|$)/,
    claim: 'lexeme',
    source: 'leung-2024',
  },
  {
    id: 'what-shu',
    label: 'شو / وش — Gulf "what" (vs MSA ماذا)',
    pattern: /(^|[^؀-ۿ])(?:شو|وش|شنو)([^؀-ۿ]|$)/,
    claim: 'lexeme',
    source: 'alramsa',
  },
  {
    id: 'how-shloon',
    label: 'شلون — Gulf "how" (vs MSA كيف)',
    pattern: /شلون/,
    claim: 'lexeme',
    source: 'alramsa',
  },
  {
    id: 'relative-illi',
    label: 'اللي — Gulf relative pronoun (vs MSA الذي/التي)',
    pattern: /(^|[^؀-ۿ])اللي([^؀-ۿ]|$)/,
    claim: 'morphosyntax',
    source: 'qafisheh-1977',
  },
];

// ─── MSA blocklist ───────────────────────────────────────────────────────────

/**
 * MSA forms that must never appear in learner-facing Arabic.
 *
 * Fasih's first rule is that it contains no Modern Standard Arabic, in any
 * channel. Arabic is diglossic; MSA is nobody's native spoken register, and
 * teaching an expat MSA to survive in Dubai is the classic failure mode.
 *
 * ─── How this list was built ─────────────────────────────────────────────────
 * Every candidate was run against all 457 Arabic strings in the app before
 * being admitted, so this ships already checked rather than guessed at. Four
 * candidates were REJECTED on evidence and are recorded below with the reason,
 * because the next person to look at this will otherwise re-propose them:
 *
 *   هنا       — pan-Gulf and widely used; `هني` is the Emirati preference but
 *               `هنا` is not MSA-only. Demoted to PREFERRED_FORMS.
 *   من فضلك   — genuinely used across the Gulf. The app's own phrase `e_new1`
 *               documents it as "the universal Gulf way to make a polite request."
 *   نعم       — ambiguous in bare script between نَعَم ("yes", MSA) and نِعْمَ
 *               ("what excellent", a praise construction). Disambiguating needs
 *               vowels, which this app does not write. Manual review only.
 *   أريد      — appears once, inside an English teaching note that explicitly
 *               contrasts it with Gulf أبي. Hence the scoping rule below.
 *
 * ─── Scope ───────────────────────────────────────────────────────────────────
 * This list applies ONLY to learner-facing Arabic — choice.arabic,
 * choice.arabicFeminine, scene.arabic, charDialogue.*.arabic, ending.arabic,
 * phrase.arabic. It must NEVER be applied to notes, cultural notes, pronTips or
 * any English prose, which legitimately cite MSA forms in order to contrast them.
 */
export interface MSAForm {
  readonly msa: string;
  /** What the learner should see instead. */
  readonly gulf: string;
}

export const MSA_BLOCKLIST: readonly MSAForm[] = [
  { msa: 'ماذا', gulf: 'شو / وش' },
  { msa: 'لماذا', gulf: 'ليش' },
  { msa: 'أين', gulf: 'وين' },
  { msa: 'ليس', gulf: 'ما / مب' },
  { msa: 'لست', gulf: 'ما ... / مب' },
  { msa: 'سوف', gulf: 'بـ (bi- prefix)' },
  { msa: 'الآن', gulf: 'الحين' },
  { msa: 'أريد', gulf: 'أبي / أبغي' },
  { msa: 'تريد', gulf: 'تبي / تبغي' },
  { msa: 'يمكنني', gulf: 'أقدر' },
  { msa: 'يمكنك', gulf: 'تقدر' },
  { msa: 'الذي', gulf: 'اللي' },
  { msa: 'التي', gulf: 'اللي' },
  { msa: 'الذين', gulf: 'اللي' },
  { msa: 'عندما', gulf: 'لما / يوم' },
  { msa: 'جداً', gulf: 'وايد' },
  { msa: 'جدا', gulf: 'وايد' },
  { msa: 'كثيراً', gulf: 'وايد' },
  { msa: 'كثيرا', gulf: 'وايد' },
  { msa: 'هؤلاء', gulf: 'هاذوله' },
  { msa: 'ذلك', gulf: 'ذاك' },
  { msa: 'هذه', gulf: 'هاي / هاذي' },
  { msa: 'لدي', gulf: 'عندي' },
  { msa: 'لا يزال', gulf: 'باقي' },
  { msa: 'ما زال', gulf: 'باقي' },
  { msa: 'كذلك', gulf: 'بعد' },
  { msa: 'سيكون', gulf: 'بيكون' },
  { msa: 'أيضاً', gulf: 'بعد' },
  { msa: 'ايضا', gulf: 'بعد' },
  { msa: 'كيف حالك', gulf: 'شلونك / شخبارك' },
  { msa: 'شكرا جزيلا', gulf: 'مشكور' },
  { msa: 'حسناً', gulf: 'زين' },
  { msa: 'حسنا', gulf: 'زين' },
];

/**
 * Forms that are not wrong, but not what this app teaches. A warning, never a
 * failure — `هنا` is perfectly good Gulf Arabic; it is just inconsistent for the
 * NPC to say it while the phrase library teaches `هني` two screens away.
 */
export const PREFERRED_FORMS: readonly MSAForm[] = [
  { msa: 'هنا', gulf: 'هني' },
  { msa: 'كيف', gulf: 'شلون' },
];

/** Matches a whole word — Arabic has no `\b`, so guard with non-Arabic or edge. */
export function containsForm(haystack: string, form: string): boolean {
  const escaped = form.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^؀-ۿ])${escaped}($|[^؀-ۿ])`).test(haystack);
}

export function findMSAForms(arabic: string): MSAForm[] {
  return MSA_BLOCKLIST.filter(f => containsForm(arabic, f.msa));
}

export function findDispreferredForms(arabic: string): MSAForm[] {
  return PREFERRED_FORMS.filter(f => containsForm(arabic, f.msa));
}
