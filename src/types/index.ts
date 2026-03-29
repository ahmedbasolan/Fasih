// ─── User ────────────────────────────────────────────────────────────────────
export interface UserProfile {
  name: string;
  mode: 'career' | 'social';
  role: string;
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
  color: string;
  gradientColors: [string, string];
  arabicScene: string;
  mode: ScenarioMode;
}

export type ChoiceOutcome = 'excellent' | 'good' | 'neutral' | 'bad';

export interface ScenarioChoice {
  id: string;
  text: string;
  arabic?: string;
  roman?: string;
  impact: { trust: number; respect: number; culture: number };
  note?: string;
  outcome: ChoiceOutcome;
}

export interface ScenarioScene {
  id: string;
  charName: string;
  setting: string;
  arabic: string;
  roman: string;
  english: string;
  choices: ScenarioChoice[];
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
}

export interface ScenarioScript {
  id: string;
  title: string;
  scenes: ScenarioScene[];
  endings: ScenarioEnding[];
}

// ─── Phrases ─────────────────────────────────────────────────────────────────
export type PhraseDifficulty = 'basic' | 'intermediate' | 'advanced';
export type PhraseCategory = 'Greetings' | 'Gratitude' | 'Hospitality' | 'Workplace' | 'Social';

export interface Phrase {
  id: string;
  arabic: string;
  roman: string;
  english: string;
  category: PhraseCategory;
  culturalNote?: string;
  difficulty: PhraseDifficulty;
}

// ─── Navigation ──────────────────────────────────────────────────────────────
export type MainTab = 'home' | 'scenarios' | 'library' | 'profile';
