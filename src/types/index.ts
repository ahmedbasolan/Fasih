// ─── Subscription ────────────────────────────────────────────────────────────
export type SubscriptionStatus = 'trial' | 'free' | 'subscribed';

// ─── User ────────────────────────────────────────────────────────────────────
export interface UserProfile {
  name: string;
  mode: 'career' | 'social';
  role: string;
  profession?: string;
  gender?: 'male' | 'female';
  mascot?: 'maya' | 'max';
  goals: string[];
  plan: 'monthly' | 'yearly' | null;
  /** Which onboarding steps the user actually completed — drives day-one progress display. */
  onboardingChecklist: string[];
  /** Adaptive daily XP target, inferred from onboarding signals — user-editable in Profile settings. */
  dailyGoalXP: number;
}

export interface CategoryMastery {
  category: PhraseCategory;
  phrasesStudied: number;
  phrasesTotal: number;
  accuracy: number;  // 0-100, rolling average from practice
}

export interface PhraseReviewData {
  phraseId: string;
  lastReviewed: string;   // ISO date
  nextReview: string;     // ISO date
  interval: number;       // days until next review
  ease: number;           // 1.3–2.5 multiplier
  correct: number;
  incorrect: number;
}

export interface JournalEntry {
  id: string;
  date: string;           // ISO date
  arabic: string;
  english: string;
  insight: string;        // cultural note or personal reflection
  source: 'scenario' | 'phrase' | 'practice';
  sourceId: string;
}

export interface LearningMilestone {
  id: string;
  label: string;
  description: string;
  reached: boolean;
  dateReached?: string;
}

export interface UserStats {
  daysActive: number;
  currentStreak: number;
  phrasesMastered: number;    // phrases with accuracy >= 80%
  phrasesStudied: number;     // total unique phrases seen
  scenariosCompleted: string[];
  categoryMastery: Record<string, CategoryMastery>;
}

export const DEFAULT_USER_STATS: UserStats = {
  daysActive: 0,
  currentStreak: 0,
  phrasesMastered: 0,
  phrasesStudied: 0,
  scenariosCompleted: [],
  categoryMastery: {},
};

// ─── Scenarios ───────────────────────────────────────────────────────────────
export type ScenarioMode = 'career' | 'social';
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type ImpactMetrics = { trust: number; respect: number; culture: number };

export interface Scenario {
  id: string;
  iconName: string;
  title: string;
  subtitle: string;
  decisions: number;
  endings: number;
  phrases: string;
  level: DifficultyLevel;
  /**
   * Behind the paywall for this learner. Computed by the screen listing it, from
   * hasScenarioAccess — never authored in the catalog. An authored value
   * disagreed with the paywall (eid-greeting said locked while sitting in a free
   * slot) and Home trusted it.
   */
  locked?: boolean;
  comingSoon?: boolean;
  isOnboarding?: boolean;
  dialect?: string;
  /**
   * Restricts the scenario to learners of this gender. Set when the situation
   * itself would be culturally wrong for the other gender to rehearse — not for
   * cosmetic reasons. Scenarios with this set are hidden until the learner's
   * gender is known.
   */
  requiresGender?: 'male' | 'female';
  color: string;
  gradientColors: [string, string];
  arabicScene: string;
  kafIntro: string;
  mode: ScenarioMode;
  /**
   * The scenario's signature Arabic line, shown in the browse list so the
   * learner sees Arabic before opening anything. Bare script, no tashkeel —
   * see docs/language/authority.md.
   *
   * One optional PAIR rather than two independent optionals: romanisation is
   * the authoritative pronunciation channel for an audience that mostly cannot
   * read the script, so an Arabic line without one is the single combination
   * that must not ship. As two optionals the type permitted exactly that, and
   * the only thing forbidding it was a comment.
   *
   * Deliberately unpopulated for now: writing these is content work that goes
   * through docs/language/pipeline.md, not a design task.
   */
  keyLine?: { arabic: string; roman: string };
}

export type ChoiceOutcome = 'excellent' | 'good' | 'neutral' | 'bad';

export interface ScenarioChoice {
  id: string;
  text: string;
  arabic: string;
  arabicFeminine?: string;  // Alternate Arabic phrasing for female learners (rendered when user.gender === 'female')
  roman: string;
  score: number;
  note?: string;
  outcome: ChoiceOutcome;
  flag?: string;            // Flag set in state.flags when this choice is made
  requiredFlag?: string;    // If set, choice is only shown when this flag is already in state.flags
  impact?: ImpactMetrics;
  /**
   * Explicit next scene. `null` ends the main path — needed by a route-variant
   * scene that is the last decision, which would otherwise fall through into
   * its sibling variant next in the array.
   */
  next?: string | null;
  teachingHighlight?: string;
  /**
   * Route this choice leans toward, in a route script (see ScenarioScript.routes).
   * The route chosen most often decides the destination; it is never shown
   * during play. Only valid judgement-scene choices carry one.
   */
  route?: string;
}

// Branching tone: same scene, NPC warmth adapts to accumulated score
export interface TonedDialogue {
  arabic: string;
  roman: string;
  english: string;
}

/**
 * `language` scenes have a right form (صباح النور answers صباح الخير).
 * `judgement` scenes are social strategy: valid choices lead different ways.
 */
export type SceneKind = 'language' | 'judgement';

/** NPC lines as a female learner hears them, for scenes that address the learner. */
export interface FemaleLearnerLines extends TonedDialogue {
  charDialogue?: {
    warm: TonedDialogue;
    neutral: TonedDialogue;
    cold: TonedDialogue;
  };
}

/** A destination a route script can end at. */
export interface ScenarioRoute {
  id: string;
  label: string;
}

export type EndingTier = 'strong' | 'weak';

/**
 * One native-speaker review of a script's Arabic (spec 2026-09-14 §2.10).
 *
 * Absent means unreviewed — the state of every script until a reviewer working
 * from docs/language/reviewer-brief.md signs off. Kept apart from phrase
 * `source` on purpose: a source says where a form is attested, a review says a
 * native speaker read these lines in context. Never record one on the project
 * owner's approval (docs/language/authority.md, rule 5).
 */
export interface NativeReview {
  dialect: 'emirati' | 'egyptian' | 'levantine';
  /** Pseudonymous handle from the review log — not a real name. */
  reviewer: string;
  /** ISO date the review was completed. */
  date: string;
  scope: 'learner-lines' | 'npc-lines' | 'all-lines';
}

/** Phrases a scenario grants: `core` on any completion, plus the set for the ending reached. */
export interface ScenarioPhrases {
  core: string[];
  /** Keyed by ScenarioEnding.id. */
  byEnding: Record<string, string[]>;
}

export interface ScenarioScene {
  id: string;
  charName: string;
  charGender: 'male' | 'female';
  setting: string;
  // Legacy single-tone fields (still used by existing scripts for backward compat)
  arabic: string;
  roman: string;
  english: string;
  // Optional warm / neutral / cold tones (Phase 3 — new scripts use these)
  charDialogue?: {
    warm: TonedDialogue;
    neutral: TonedDialogue;
    cold: TonedDialogue;
  };
  // Dialogue tone thresholds, measured against the learner's accumulated
  // trust + respect + culture with THIS scene's NPC (see npcRelationship()).
  warmThreshold?: number;  // relationship >= this triggers warm dialogue
  coldThreshold?: number;  // relationship < this triggers cold dialogue (neutral in between)
  // Teaching content for this scene
  teachingNote?: string;
  choices: ScenarioChoice[];
  bonus?: boolean; // True if this is a bonus scene only shown for secret ending
  /** Required on every decision scene of a ScenarioScript; absent on bonus and onboarding scenes. */
  kind?: SceneKind;
  /**
   * The fork: after this scene, go to the scene for the leading route (counting
   * the choice just made). A choice's own `next` still wins.
   */
  nextByRoute?: Record<string, string>;
  /** The NPC speaks to the learner in gendered forms here; requires `femaleLearner`. */
  addressesLearner?: boolean;
  femaleLearner?: FemaleLearnerLines;
}

/**
 * A scenario's completion record (`completedScenarios`): that it was finished,
 * with an ending type and a timestamp. Not one run — see ScenarioRunRecord.
 */
export interface ScenarioCompletion {
  endingType: string;
  date: string;
}

/**
 * One completed run of a scenario. Its position in the scenario's history is
 * the run number. Kept for the learner and for replay metrics (spec 2026-09-14
 * §2.12; queries in supabase/queries/scenario_metrics.sql).
 */
export interface ScenarioRunRecord {
  endingId: string;
  endingType: ScenarioEnding['type'];
  /**
   * Local calendar day, YYYY-MM-DD. A day, never a timestamp: enough to tell a
   * replay within 7 days, too coarse to line up against anything else.
   */
  on: string;
}

export interface ScenarioEnding {
  /** Stable id — what endingsFound and phrases.byEnding key on. Never reuse. */
  id: string;
  min: number;
  title: string;
  arabic: string;
  roman: string;
  en: string;
  desc: string;
  color: string;
  type: 'exceptional' | 'success' | 'mixed' | 'failed';
  // 3-4 key cultural moments shown in the cultural journey summary on end screen
  culturalJourney?: string[];
  secret?: boolean; // True if this is a secret ending requiring all flags + score threshold
  requiredFlags?: string[]; // Flag IDs required for secret ending (e.g., ['FLAG_1', 'FLAG_2'])
  /** Route scripts: the destination this ending belongs to. Absent on the failure and hidden endings. */
  route?: string;
  /** Route scripts: strong or weak version of the destination. */
  tier?: EndingTier;
  /** Cultural hint pointing a replaying learner toward this ending. */
  hint?: string;
}

/**
 * The onboarding café: two linear scenes played by OnboardingScenarioPlayer.
 * No endings and no routes — it is a first-contact demo, not a scenario run.
 */
export interface OnboardingScript {
  id: string;
  title: string;
  subtitle?: string;  // Setting description (e.g., "Airport → Hotel, nighttime")
  kafIntro?: string;  // Kaf's introduction text for this scenario
  iconName?: string;  // Icon identifier for the scenario card
  estimatedMinutes?: number;  // Estimated completion time
  scenes: ScenarioScene[];
  phrases: Pick<ScenarioPhrases, 'core'>;
}

/**
 * A playable scenario: destination by route tags, quality by meters (spec
 * 2026-09-14 §2.1).
 */
export interface ScenarioScript extends OnboardingScript {
  phrases: ScenarioPhrases;
  endings: ScenarioEnding[];
  routes: ScenarioRoute[];
  /** Route used when a run reaches the fork or the end without leaning anywhere. */
  defaultRoute: string;
  /** Native-speaker reviews of this script's Arabic. Absent = unreviewed. */
  nativeReviews?: NativeReview[];
  // 2-3 phrase IDs from phrases.core previewed as tap-to-hear chips in the
  // scenario intro — listen-only priming, no quiz. Hear now → earn later.
  primerPhrases?: string[];
}

// Community stats (Phase 2 — Community Choice Distribution)
export interface ScenarioChoiceStats {
  scenarioId: string;
  sceneIndex: number;
  choiceIndex: number;
  count: number;
}

export interface ScenarioEndingStats {
  scenarioId: string;
  endingType: string;
  count: number;
}

// ─── Phrases ─────────────────────────────────────────────────────────────────
/**
 * CEFR band a phrase or scenario sits in. Stops at A2 deliberately: Fasih's
 * entire content is A1-A2, and labelling a seven-turn scripted scenario B1
 * would overclaim what a learner can actually do. See curriculum.ts.
 */
export type CEFRBand = 'A1' | 'A1+' | 'A2';

/** What kind of claim a citation supports. Grammar ages slowly, words fast. */
export type SourceClaim = 'morphosyntax' | 'lexeme' | 'usage' | 'register';

/** Publications Fasih may cite. The table lives in constants/curriculum.ts. */
export type SourceId =
  | 'leung-2024'
  | 'routledge-comprehensive'
  | 'alramsa'
  | 'ramsa-paper-2026'
  | 'emirati-social-media-2024'
  | 'qafisheh-1977'
  | 'holes-1990'
  | 'ntelitheos-idrissi-2017'
  | 'szreder-derrick-2024'
  | 'wiktionary-gulf-arabic'
  | 'fasih-internal';

/**
 * Provenance for one Arabic string. 'unsourced' is a permitted, honest value —
 * the lint counts them rather than letting the gap hide.
 */
export interface SourceRef {
  ref: SourceId | 'unsourced';
  locator: string;
  claim: SourceClaim;
}

/**
 * Is this still said? Younger Emiratis have shed much distinctly Emirati
 * vocabulary for a pan-Gulf koine, so 'dated' is a real risk, not a nicety.
 * 'heritage' is culturally valuable but not daily speech — it belongs in the
 * cultural journal, not in a 'say this tomorrow' card.
 */
export type PhraseCurrency = 'current' | 'dated' | 'heritage' | 'unknown';

/** Produce it, or only understand it when someone else says it. */
export type PhraseUse = 'produce' | 'recognise' | 'unknown';

export type PhraseOrigin = 'emirati' | 'gulf-koine' | 'non-gulf' | 'unknown';

/** PROVISIONAL — pin against a source before hardening. */
export type PhraseRegister = 'neutral' | 'deferential' | 'unknown';
export type PhraseCategory = 'Greetings' | 'Gratitude' | 'Hospitality' | 'Workplace' | 'Social' | 'Everyday' | 'Food & Drink' | 'Family';
export type PhraseType = 'vocab' | 'phrase' | 'expression';

export interface Phrase {
  id: string;
  arabic: string;
  roman: string;
  english: string;
  category: PhraseCategory;
  culturalNote?: string;
  /**
   * CEFR band. Replaces the old 'basic'|'intermediate'|'advanced' scale so the
   * app carries ONE difficulty vocabulary instead of three that disagreed.
   */
  cefr: CEFRBand;
  /**
   * Where this Arabic came from. Required, so a new phrase must declare its
   * provenance at compile time — even when that declaration is honestly
   * `UNSOURCED`. The project previously had zero provenance records anywhere.
   */
  source: SourceRef;
  currency?: PhraseCurrency;
  use?: PhraseUse;
  origin?: PhraseOrigin;
  register?: PhraseRegister;
  type: PhraseType;
  pronTip?: string;
  // Which scenario this phrase was introduced in (for end-screen traceability)
  scenarioSource?: string;
  // Pre-split word segments for the Phrase Builder tap-to-place game (Phase 2)
  wordTiles?: string[];
}

// ─── Generative Grammar ─────────────────────────────────────────────────────
export type SoftSkill = 'offer' | 'request' | 'suggest' | 'confirm' | 'reassure' | 'question' | 'identity' | 'action';

export interface GrammarSlot {
  id: string;
  label: string;                 // e.g. "verb you want to do"
  accepts: 'verb' | 'noun' | 'adjective' | 'questionWord' | 'phrase';
  /** Phrase IDs that may fill this slot. All must exist in phrases.ts or be flagged needsNativeReview. */
  options: string[];
}

export interface GrammarPattern {
  id: string;
  title: string;                 // e.g. "أبي ___ — I want to ___"
  titleFeminine?: string;        // rendered when user.gender === 'female'
  unlockedByScenario: string;    // scenario ID; empty string = available from library basics
  secretUnlock?: boolean;        // true = requires the scenario's secret ending (one per scenario)
  softSkill: SoftSkill;
  goodImpressionNote: string;    // the cultural "impression" lesson
  examples: { phraseId: string }[];       // 2-3 already-unlocked phrases that reveal the slot
  slots: GrammarSlot[];
  needsNativeReview?: boolean;   // true = listed in REVIEW_QUEUE
  source?: string;               // provenance for derived patterns
  /**
   * Assembly frame for buildSentence — fixed words plus `{slotId}` placeholders
   * in Arabic-reading order. One placeholder per slot, IDs must match slot ids.
   */
  template: {
    arabic: string[];
    roman: string[];
    english: string[];
  };
}

export interface SentenceResult {
  arabic: string;
  roman: string;
  english: string;
  valid: boolean;
}

export interface PatternProgress {
  correctBuilds: number;         // pattern "masters" at 3 correct builds
  lastBuilt?: string;            // ISO date
}

// ─── Navigation ──────────────────────────────────────────────────────────────
export type MainTab = 'home' | 'scenarios' | 'library' | 'profile';

// ─── Scenario State Engine ────────────────────────────────────────────────────

/** Per-NPC running totals for trust, respect, and culture dimensions */
export interface ImpactDelta {
  trust: number;    // negative allowed (e.g. -2 to +3 per choice)
  respect: number;
  culture: number;
}

/** NPC dialogue warmth level, derived from accumulated ImpactDelta */
export type Tone = 'warm' | 'neutral' | 'cold';

/**
 * Complete runtime state for one scenario run.
 * Lives in Zustand as activeScenarioState — NOT persisted between sessions.
 * Sets are used internally; the field is excluded from AsyncStorage partialize.
 */
export interface ScenarioState {
  scenarioId: string;
  currentSceneId: string;
  /** Flag IDs set by choices so far (e.g. 'GREETED_IN_DIALECT') */
  flags: Set<string>;
  /** Per-NPC accumulated impact — keyed by charName (must be unique per scenario) */
  impactByNpc: Record<string, ImpactDelta>;
  /**
   * Sum of choice.score values — XP / analytics only. NOT read by getTone or
   * evaluateEnding; those are driven entirely by impactByNpc (see
   * relationshipScore / npcRelationship in scenarioEngine.ts). warmThreshold /
   * coldThreshold are written against the trust+respect+culture sum, not this.
   */
  totalScore: number;
  /** Per-NPC sum of choice.score — XP / analytics only, same caveat as totalScore. */
  scoreByNpc: Record<string, number>;
  /** Ordered history of every choice made in this run */
  choiceHistory: {
    sceneId: string;
    choiceId: string;
    npcId: string;   // charName of the NPC in that scene
    timestamp: string; // ISO date-time
  }[];
  /** All scene IDs visited so far (for completeness tracking) */
  scenesVisited: Set<string>;
  startedAt: string; // ISO date-time
}
