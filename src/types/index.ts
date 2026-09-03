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
  locked: boolean;
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
  impactPreview?: ImpactMetrics;
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
  next?: string;
  teachingHighlight?: string;
}

// Branching tone: same scene, NPC warmth adapts to accumulated score
export interface TonedDialogue {
  arabic: string;
  roman: string;
  english: string;
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
}

export interface ScenarioEnding {
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
}

export interface ScenarioScript {
  id: string;
  title: string;
  subtitle?: string;  // Setting description (e.g., "Airport → Hotel, nighttime")
  kafIntro?: string;  // Kaf's introduction text for this scenario
  iconName?: string;  // Icon identifier for the scenario card
  estimatedMinutes?: number;  // Estimated completion time
  scenes: ScenarioScene[];
  endings: ScenarioEnding[];
  // IDs of phrases unlocked by completing this scenario (shown as rich cards on end screen)
  phrasesUnlocked?: string[];
  // 2-3 phrase IDs from phrasesUnlocked previewed as tap-to-hear chips in the
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
