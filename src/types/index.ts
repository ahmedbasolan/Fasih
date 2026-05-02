// ─── Subscription ────────────────────────────────────────────────────────────
export type SubscriptionStatus = 'trial' | 'free' | 'subscribed';

// ─── User ────────────────────────────────────────────────────────────────────
export interface UserProfile {
  name: string;
  mode: 'career' | 'social';
  role: string;
  profession?: string;
  mascot?: 'maya' | 'max';
  goals: string[];
  plan: 'monthly' | 'yearly' | null;
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
  dialect?: string;
  color: string;
  gradientColors: [string, string];
  arabicScene: string;
  kafIntro: string;
  mode: ScenarioMode;
}

export type ChoiceOutcome = 'excellent' | 'good' | 'neutral' | 'bad';

export interface ScenarioChoice {
  id: string;
  text: string;
  arabic: string;
  arabicFeminine?: string;
  roman: string;
  score: number;
  note?: string;
  outcome: ChoiceOutcome;
  flag?: string;
  impact?: { trust: number; respect: number; culture: number };
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
  // Dialogue tone thresholds (totalScore based)
  warmThreshold?: number;  // totalScore >= this triggers warm dialogue
  coldThreshold?: number;  // totalScore < this triggers cold dialogue (neutral in between)
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
  difficulty?: string;  // Difficulty level display text
  estimatedMinutes?: number;  // Estimated completion time
  scenes: ScenarioScene[];
  endings: ScenarioEnding[];
  // IDs of phrases unlocked by completing this scenario (shown as rich cards on end screen)
  phrasesUnlocked?: string[];
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
export type PhraseDifficulty = 'basic' | 'intermediate' | 'advanced';
export type PhraseCategory = 'Greetings' | 'Gratitude' | 'Hospitality' | 'Workplace' | 'Social' | 'Everyday' | 'Food & Drink' | 'Family';
export type PhraseType = 'vocab' | 'phrase' | 'expression';

export interface Phrase {
  id: string;
  arabic: string;
  roman: string;
  english: string;
  category: PhraseCategory;
  culturalNote?: string;
  difficulty: PhraseDifficulty;
  type: PhraseType;
  pronTip?: string;
  // Which scenario this phrase was introduced in (for end-screen traceability)
  scenarioSource?: string;
  // Pre-split word segments for the Phrase Builder tap-to-place game (Phase 2)
  wordTiles?: string[];
}

// ─── Navigation ──────────────────────────────────────────────────────────────
export type MainTab = 'home' | 'scenarios' | 'library' | 'profile';
