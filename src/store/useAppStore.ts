import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { pushProgress, pullProgress } from '../lib/syncService';
import type { UserProfile, UserStats, PhraseReviewData, JournalEntry, LearningMilestone, PhraseCategory, SubscriptionStatus } from '../types';
import { DEFAULT_USER_STATS } from '../types';
import { PHRASES, PHRASE_CATEGORIES } from '../constants/phrases';

// ─── Debounced cloud sync ─────────────────────────────────────────────────────
// Batches rapid mutations (e.g., reviewing several phrases) into a single push.
let _syncTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSync(fn: () => void, delayMs = 1500) {
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(fn, delayMs);
}

// ─── Spaced repetition helpers ───────────────────────────────────────────────
function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function newReviewCard(phraseId: string): PhraseReviewData {
  const today = todayISO();
  return { phraseId, lastReviewed: today, nextReview: today, interval: 0, ease: 2.0, correct: 0, incorrect: 0 };
}

function updateReviewCard(card: PhraseReviewData, correct: boolean): PhraseReviewData {
  const today = todayISO();
  if (correct) {
    const newInterval = Math.max(1, Math.round(card.interval * card.ease));
    const newEase = Math.min(2.5, card.ease + 0.1);
    return { ...card, lastReviewed: today, nextReview: addDays(today, newInterval), interval: newInterval, ease: newEase, correct: card.correct + 1 };
  }
  return { ...card, lastReviewed: today, nextReview: addDays(today, 1), interval: 1, ease: Math.max(1.3, card.ease - 0.2), incorrect: card.incorrect + 1 };
}

// 3-tier rating → fixed SRS intervals per guidelines:
// 'new' = resurfaces in 1 day, 'learning' = 3 days, 'knew' = 7 days
// Each subsequent 'knew' doubles the interval (handled by updateReviewCard ease multiplier)
const RATING_INTERVALS: Record<'new' | 'learning' | 'knew', number> = {
  new: 1,
  learning: 3,
  knew: 7,
};

function applyRatingToCard(card: PhraseReviewData, rating: 'new' | 'learning' | 'knew'): PhraseReviewData {
  const today = todayISO();
  if (rating === 'knew') {
    // On 'knew', use the ease multiplier to progressively double intervals
    const newInterval = card.interval < 1 ? 7 : Math.round(card.interval * card.ease);
    const newEase = Math.min(2.5, card.ease + 0.1);
    return { ...card, lastReviewed: today, nextReview: addDays(today, newInterval), interval: newInterval, ease: newEase, correct: card.correct + 1 };
  }
  if (rating === 'new') {
    return { ...card, lastReviewed: today, nextReview: addDays(today, RATING_INTERVALS.new), interval: RATING_INTERVALS.new, ease: Math.max(1.3, card.ease - 0.2), incorrect: card.incorrect + 1 };
  }
  // 'learning'
  return { ...card, lastReviewed: today, nextReview: addDays(today, RATING_INTERVALS.learning), interval: RATING_INTERVALS.learning, ease: card.ease };
}

// ─── Milestones ──────────────────────────────────────────────────────────────
const DEFAULT_MILESTONES: LearningMilestone[] = [
  { id: 'first-scenario', label: 'Cultural Explorer', description: 'You completed your first cultural scenario', reached: false },
  { id: 'greetings-3', label: 'Three Ways to Say Hello', description: 'You can now greet someone in 3 different ways', reached: false },
  { id: 'hospitality', label: 'Emirati Hospitality', description: 'You\'ve learned the art of Emirati hospitality phrases', reached: false },
  { id: 'week-learner', label: 'One Week of Learning', description: 'You\'ve been learning for 7 days', reached: false },
  { id: 'phrases-10', label: 'Growing Vocabulary', description: 'You\'ve studied 10 unique phrases', reached: false },
  { id: 'all-categories', label: 'Well-Rounded Learner', description: 'You\'ve explored phrases from every category', reached: false },
  { id: 'scenarios-3', label: 'Story Weaver', description: 'You\'ve navigated 3 different cultural conversations', reached: false },
  { id: 'mastered-5', label: 'Building Confidence', description: '5 phrases are now part of your active vocabulary', reached: false },
];

type MilestoneChecker = (s: Pick<AppState, 'stats' | 'completedScenarios' | 'phraseReviews'>) => boolean;

const MILESTONE_CHECKS: Record<string, MilestoneChecker> = {
  'first-scenario': (s) => s.stats.scenariosCompleted.length >= 1,
  'greetings-3': (s) => {
    const greetings = Object.values(s.phraseReviews).filter(r => {
      const p = PHRASES.find(ph => ph.id === r.phraseId);
      return p?.category === 'Greetings' && r.correct >= 1;
    });
    return greetings.length >= 3;
  },
  'hospitality': (s) => {
    const hosp = Object.values(s.phraseReviews).filter(r => {
      const p = PHRASES.find(ph => ph.id === r.phraseId);
      return p?.category === 'Hospitality' && r.correct >= 1;
    });
    return hosp.length >= 2;
  },
  'week-learner': (s) => s.stats.daysActive >= 7,
  'phrases-10': (s) => s.stats.phrasesStudied >= 10,
  'all-categories': (s) => {
    const cats = new Set(Object.values(s.phraseReviews).map(r => {
      const p = PHRASES.find(ph => ph.id === r.phraseId);
      return p?.category;
    }).filter(Boolean));
    return cats.size >= 5;
  },
  'scenarios-3': (s) => s.stats.scenariosCompleted.length >= 3,
  'mastered-5': (s) => s.stats.phrasesMastered >= 5,
};

// ─── State shape ─────────────────────────────────────────────────────────────
interface AppState {
  // Auth & onboarding
  user: UserProfile | null;
  supabaseUserId: string | null;
  hasOnboarded: boolean;
  isAuthenticated: boolean;
  _hydrated: boolean;

  // Subscription
  subscriptionStatus: SubscriptionStatus;
  trialStartedAt: string | null;
  trialPlan: 'monthly' | 'yearly' | null;

  // UI State
  themePreference: 'system' | 'light' | 'dark';

  // Progress & learning

  stats: UserStats;
  savedPhrases: string[];
  completedScenarios: Record<string, { endingType: string; date: string }>;
  lastActiveDate: string | null;
  phraseReviews: Record<string, PhraseReviewData>;
  journal: JournalEntry[];
  milestones: LearningMilestone[];

  // Cloud sync
  isSyncing: boolean;
  lastSyncedAt: string | null;
  syncToCloud: () => Promise<void>;
  syncFromCloud: () => Promise<void>;

  // Auth actions
  // --- Phase 2: Community Stats ---
  getCommunityChoiceStat: (choiceId: string) => number;
  getCommunityEndingStat: (endingType: string) => number;
  setUser: (user: UserProfile) => void;
  setHasOnboarded: (value: boolean) => void;
  setAuthenticated: (value: boolean) => void;
  setSupabaseUserId: (id: string | null) => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;

  // UI Actions
  setTheme: (theme: 'system' | 'light' | 'dark') => void;

  // Subscription actions
  startTrial: (plan: 'monthly' | 'yearly') => void;
  skipTrial: () => void;
  hasFullAccess: () => boolean;
  scenariosCompletedCount: () => number;

  // Learning actions
  recordDailyActivity: () => void;
  recordPhraseReview: (phraseId: string, correct: boolean) => void;
  // 3-tier flashcard rating — maps directly to SRS intervals (1 / 3 / 7 days)
  recordPhraseRating: (phraseId: string, rating: 'new' | 'learning' | 'knew') => void;
  completeScenario: (scenarioId: string, endingType: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
  checkMilestones: () => void;

  // Phrase library
  toggleSavedPhrase: (phraseId: string) => void;
  isPhraseSaved: (phraseId: string) => boolean;

  // Computed helpers
  getDueReviews: () => PhraseReviewData[];
}

// ─── Store ───────────────────────────────────────────────────────────────────
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Defaults
      user: null,
      supabaseUserId: null,
      hasOnboarded: false,
      isAuthenticated: false,
      _hydrated: false,
      subscriptionStatus: 'free',
      trialStartedAt: null,
      trialPlan: null,
      themePreference: 'system',
      stats: { ...DEFAULT_USER_STATS },
      savedPhrases: [],
      completedScenarios: {},
      lastActiveDate: null,
      phraseReviews: {},
      journal: [],
      milestones: DEFAULT_MILESTONES.map(m => ({ ...m })),

      // Sync state
      isSyncing: false,
      lastSyncedAt: null,

      // Cloud sync
      syncToCloud: async () => {
        const s = get();
        if (!s.supabaseUserId) return;
        set({ isSyncing: true });
        await pushProgress(s.supabaseUserId, {
          user_profile: s.user,
          stats: s.stats,
          phrase_reviews: s.phraseReviews,
          completed_scenarios: s.completedScenarios,
          saved_phrases: s.savedPhrases,
          milestones: s.milestones,
          journal: s.journal,
          last_active_date: s.lastActiveDate,
          subscription_status: s.subscriptionStatus,
          trial_started_at: s.trialStartedAt,
          trial_plan: s.trialPlan,
        });
        set({ isSyncing: false, lastSyncedAt: new Date().toISOString() });
      },

      syncFromCloud: async () => {
        const s = get();
        if (!s.supabaseUserId) return;
        set({ isSyncing: true });
        const { data, error } = await pullProgress(s.supabaseUserId);
        set({ isSyncing: false });
        if (error || !data) return;

        // Merge strategy: cloud wins for progress data (so reinstalls restore history).
        // Milestones: keep any locally-reached ones the cloud doesn't have yet.
        const mergedMilestones = (data.milestones?.length ? data.milestones : s.milestones).map(
          (m: LearningMilestone) => {
            const local = s.milestones.find(lm => lm.id === m.id);
            return local?.reached && !m.reached ? local : m;
          },
        );

        set({
          user: data.user_profile ?? s.user,
          stats: data.stats ?? s.stats,
          phraseReviews: data.phrase_reviews ?? s.phraseReviews,
          completedScenarios: data.completed_scenarios ?? s.completedScenarios,
          savedPhrases: data.saved_phrases ?? s.savedPhrases,
          milestones: mergedMilestones,
          journal: data.journal ?? s.journal,
          lastActiveDate: data.last_active_date ?? s.lastActiveDate,
          subscriptionStatus: data.subscription_status ?? s.subscriptionStatus,
          trialStartedAt: data.trial_started_at ?? s.trialStartedAt,
          trialPlan: data.trial_plan ?? s.trialPlan,
          lastSyncedAt: new Date().toISOString(),
        });
      },

      // Auth
      setUser: (user) => set({ user }),
      setHasOnboarded: (value) => set({ hasOnboarded: value }),
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setSupabaseUserId: (id) => set({ supabaseUserId: id }),
      signIn: async (email, password) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          const userId = data.user?.id || null;
          set({ isAuthenticated: true, supabaseUserId: userId });
          // Restore progress from cloud on every sign-in
          if (userId) await get().syncFromCloud();
          return { success: true };
        } catch (err: any) {
          return { success: false, error: err.message || 'Sign in failed' };
        }
      },
      signUp: async (email, password, fullName) => {
        try {
          const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
          if (error) throw error;
          const userId = data.user?.id || null;
          set({ isAuthenticated: true, supabaseUserId: userId });
          // Push local onboarding state to cloud for new users
          if (userId) await get().syncToCloud();
          return { success: true };
        } catch (err: any) {
          return { success: false, error: err.message || 'Sign up failed' };
        }
      },
      signOut: async () => {
        await supabase.auth.signOut();
        set({ isAuthenticated: false, supabaseUserId: null });
      },

      // UI
      setTheme: (theme) => set({ themePreference: theme }),

      // Subscription
      startTrial: (plan) => {
        set({ subscriptionStatus: 'trial', trialStartedAt: new Date().toISOString(), trialPlan: plan });
        get().syncToCloud();
      },
      skipTrial: () => set({ subscriptionStatus: 'free', trialStartedAt: null, trialPlan: null }),
      hasFullAccess: () => {
        const s = get();
        if (s.subscriptionStatus === 'trial' && s.trialStartedAt) {
          const trialEnd = new Date(s.trialStartedAt);
          trialEnd.setDate(trialEnd.getDate() + 3);
          if (new Date() < trialEnd) return true;
        }
        // Free users unlock after completing 3 scenarios
        return Object.keys(s.completedScenarios).length >= 3;
      },
      scenariosCompletedCount: () => Object.keys(get().completedScenarios).length,

      // Learning
      recordDailyActivity: () => {
        set((s) => {
          const today = todayISO();
          if (s.lastActiveDate === today) return {};

          const yesterday = addDays(today, -1);
          const isConsecutive = s.lastActiveDate === yesterday;
          const newStreak = isConsecutive ? s.stats.currentStreak + 1 : 1;

          return {
            lastActiveDate: today,
            stats: { ...s.stats, currentStreak: newStreak, daysActive: s.stats.daysActive + 1 },
          };
        });
        scheduleSync(() => get().syncToCloud());
      },

      recordPhraseReview: (phraseId, correct) => {
        set((s) => {
          const existing = s.phraseReviews[phraseId];
          const card = updateReviewCard(existing ?? newReviewCard(phraseId), correct);
          const newReviews = { ...s.phraseReviews, [phraseId]: card };
          const allCards = Object.values(newReviews);
          const studied = allCards.length;
          const mastered = allCards.filter(c => c.correct >= 3 && c.correct / (c.correct + c.incorrect) >= 0.8).length;
          const categoryMastery: Record<string, { category: PhraseCategory; phrasesStudied: number; phrasesTotal: number; accuracy: number }> = {};
          for (const cat of PHRASE_CATEGORIES) {
            const phrasesInCat = PHRASES.filter(p => p.category === cat);
            const catCards = allCards.filter(c => {
              const p = PHRASES.find(ph => ph.id === c.phraseId);
              return p?.category === cat;
            });
            const totalCorrect = catCards.reduce((sum, c) => sum + c.correct, 0);
            const totalAttempts = catCards.reduce((sum, c) => sum + c.correct + c.incorrect, 0);
            categoryMastery[cat] = { category: cat, phrasesStudied: catCards.length, phrasesTotal: phrasesInCat.length, accuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0 };
          }
          return { phraseReviews: newReviews, stats: { ...s.stats, phrasesStudied: studied, phrasesMastered: mastered, categoryMastery } };
        });
        scheduleSync(() => get().syncToCloud());
      },

      recordPhraseRating: (phraseId, rating) => {
        set((s) => {
          const existing = s.phraseReviews[phraseId];
          const card = applyRatingToCard(existing ?? newReviewCard(phraseId), rating);
          const newReviews = { ...s.phraseReviews, [phraseId]: card };
          const allCards = Object.values(newReviews);
          const studied = allCards.length;
          const mastered = allCards.filter(c => c.correct >= 3 && c.correct / (c.correct + c.incorrect) >= 0.8).length;
          const categoryMastery: Record<string, { category: PhraseCategory; phrasesStudied: number; phrasesTotal: number; accuracy: number }> = {};
          for (const cat of PHRASE_CATEGORIES) {
            const phrasesInCat = PHRASES.filter(p => p.category === cat);
            const catCards = allCards.filter(c => {
              const p = PHRASES.find(ph => ph.id === c.phraseId);
              return p?.category === cat;
            });
            const totalCorrect = catCards.reduce((sum, c) => sum + c.correct, 0);
            const totalAttempts = catCards.reduce((sum, c) => sum + c.correct + c.incorrect, 0);
            categoryMastery[cat] = { category: cat, phrasesStudied: catCards.length, phrasesTotal: phrasesInCat.length, accuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0 };
          }
          return { phraseReviews: newReviews, stats: { ...s.stats, phrasesStudied: studied, phrasesMastered: mastered, categoryMastery } };
        });
        scheduleSync(() => get().syncToCloud());
      },

      completeScenario: (scenarioId, endingType) => {
        set((s) => {
          const completed = { ...s.completedScenarios, [scenarioId]: { endingType, date: new Date().toISOString() } };
          return { completedScenarios: completed, stats: { ...s.stats, scenariosCompleted: Object.keys(completed) } };
        });
        scheduleSync(() => get().syncToCloud());
      },

      // --- Phase 2: Community Stats Mocks ---
      getCommunityChoiceStat: (choiceId: string) => {
        // Seeded data for first-morning choices
        const MOCKS: Record<string, number> = {
          // Scene 1
          'a': 34, 'b': 45, 'c': 15, 'd': 6,
          // Scene 2
          'scene2-a': 22, 'scene2-b': 58, 'scene2-c': 15, 'scene2-d': 5,
          // Scene 3
          'scene3-a': 42, 'scene3-b': 28, 'scene3-c': 20, 'scene3-d': 10,
          // Scene 4
          'scene4-a': 15, 'scene4-b': 65, 'scene4-c': 12, 'scene4-d': 8,
        };
        return MOCKS[choiceId] || Math.floor(Math.random() * 30) + 10;
      },

      getCommunityEndingStat: (endingType: string) => {
        // Seeded data for endings
        const MOCKS: Record<string, number> = {
          'exceptional': 12,
          'good': 48,
          'neutral': 28,
          'bad': 12,
        };
        return MOCKS[endingType] || 25;
      },

      addJournalEntry: (entry) => set((s) => ({
        journal: [
          { ...entry, id: `j-${Date.now()}`, date: todayISO() },
          ...s.journal,
        ].slice(0, 100), // keep last 100
      })),

      checkMilestones: () => set((s) => {
        const today = todayISO();
        const updated = s.milestones.map(m => {
          if (m.reached) return m;
          const check = MILESTONE_CHECKS[m.id];
          if (check && check(s)) return { ...m, reached: true, dateReached: today };
          return m;
        });
        const changed = updated.some((m, i) => m.reached !== s.milestones[i].reached);
        return changed ? { milestones: updated } : {};
      }),

      // Phrases
      toggleSavedPhrase: (phraseId) => {
        set((s) => {
          const exists = s.savedPhrases.includes(phraseId);
          return { savedPhrases: exists ? s.savedPhrases.filter((id) => id !== phraseId) : [...s.savedPhrases, phraseId] };
        });
        scheduleSync(() => get().syncToCloud());
      },

      isPhraseSaved: (phraseId) => get().savedPhrases.includes(phraseId),

      getDueReviews: () => {
        const today = todayISO();
        return Object.values(get().phraseReviews).filter(r => r.nextReview <= today);
      },
    }),
    {
      name: 'fasih-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => {
        useAppStore.setState({ _hydrated: true });
      },
      partialize: (state) => ({
        user: state.user,
        supabaseUserId: state.supabaseUserId,
        hasOnboarded: state.hasOnboarded,
        isAuthenticated: state.isAuthenticated,
        subscriptionStatus: state.subscriptionStatus,
        trialStartedAt: state.trialStartedAt,
        trialPlan: state.trialPlan,
        themePreference: state.themePreference,
        stats: state.stats,
        savedPhrases: state.savedPhrases,
        completedScenarios: state.completedScenarios,
        lastActiveDate: state.lastActiveDate,
        phraseReviews: state.phraseReviews,
        journal: state.journal,
        milestones: state.milestones,
      }),
    }
  )
);
