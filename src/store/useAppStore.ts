import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  pushProgress,
  pullProgress,
  recordChoiceStat as rcRecordChoiceStat,
  getChoiceStats,
  recordEndingStat as rcRecordEndingStat,
  getEndingStats,
  deleteAccountData,
  CURRENT_SCHEMA_VERSION,
} from '../lib/syncService';
import {
  configurePurchases,
  loginPurchasesUser,
  logoutPurchasesUser,
  getEntitlementStatus,
  purchasePlan,
  restorePurchases as rcRestorePurchases,
  presentPaywallIfNeeded as rcPresentPaywallIfNeeded,
  presentPaywall as rcPresentPaywall,
  presentCustomerCenter as rcPresentCustomerCenter,
  addCustomerInfoListener,
} from '../lib/purchases';
import type { UserProfile, UserStats, PhraseReviewData, JournalEntry, LearningMilestone, PhraseCategory, CategoryMastery, SubscriptionStatus, ScenarioState, ScenarioChoice, ScenarioEnding, PatternProgress } from '../types';
import { DEFAULT_USER_STATS } from '../types';
import { PHRASE_CATEGORIES, PHRASE_BY_ID, PHRASES_PER_CATEGORY } from '../constants/phrases';
import {
  applyChoice as applyChoiceEngine,
} from '../engine/scenarioEngine';
import {
  todayISO, addDays,
  newReviewCard, updateReviewCard, applyRatingToCard,
} from '../engine/srsEngine';
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  scheduleReEngagementIfNeeded,
  scheduleStreakRiskIfNeeded,
  cancelAllNotifications,
  derivePreferredHour,
} from '../lib/notifications';
import { shouldGrantStreakFreeze, applyStreakFreeze } from '../engine/streakEngine';
import { recordOnboardingSelection } from '../lib/onboardingAnalytics';
import { shouldRecordOnboarding } from '../engine/onboardingAnalytics';
import { pickPersisted, signOutReset } from '../engine/persistedState';
import {
  mergeReviews, mergeCompletions, mergeJournal, mergeMilestones, mergeIds,
  mergePatternProgress, mergeSecretEndings,
} from '../engine/syncMerge';

// ─── Trial duration ───────────────────────────────────────────────────────────
// Single source of truth — used in hasFullAccess AND hasScenarioAccess.
const TRIAL_DAYS = 4;

/** Number of scenarios a free user completes to earn full access. */
const FREE_ACCESS_SCENARIO_COUNT = 3;

/**
 * XP awarded per action, toward the learner's daily goal.
 *
 * The home screen used to show `scenariosCompleted.length * 50` against
 * `dailyGoalXP` — a lifetime total measured against a per-day target, so the
 * ring filled permanently after about ten scenarios and never reset. There was
 * no XP field in UserStats at all. These feed a real per-day counter instead.
 */
export const XP_PER_SCENARIO = 50;
export const XP_PER_PHRASE_REVIEW = 10;

/**
 * Access rules, as pure functions of the fields they read.
 *
 * These exist so the store getters and the React hooks at the bottom of this
 * file cannot drift apart. The getters are convenient outside React; the hooks
 * are the only correct way to read access *inside* a component, because
 * selecting a getter subscribes to the function's identity — which never
 * changes — leaving the component frozen at its first-render answer.
 */
type AccessFields = Pick<AppState, 'subscriptionStatus' | 'trialStartedAt' | 'completedScenarios'>;

function isTrialActive(s: Pick<AppState, 'subscriptionStatus' | 'trialStartedAt'>): boolean {
  if (s.subscriptionStatus !== 'trial' || !s.trialStartedAt) return false;
  const trialEnd = new Date(s.trialStartedAt);
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
  return new Date() < trialEnd;
}

function computeHasFullAccess(s: AccessFields): boolean {
  if (s.subscriptionStatus === 'subscribed') return true;
  if (isTrialActive(s)) return true;
  return Object.keys(s.completedScenarios).length >= FREE_ACCESS_SCENARIO_COUNT;
}

function computeHasScenarioAccess(s: AccessFields, scenarioIndex: number): boolean {
  if (computeHasFullAccess(s)) return true;
  // Otherwise only the first few scenarios are free.
  return scenarioIndex < FREE_ACCESS_SCENARIO_COUNT;
}

// ─── Journal ID counter ───────────────────────────────────────────────────────
// Guards against ID collisions when addJournalEntry is called multiple times
// within the same millisecond (e.g., scenario completion fires several callbacks).
let _journalIdCounter = 0;
const nextJournalId = () => `j-${Date.now()}-${++_journalIdCounter}`;

// ─── Debounced cloud sync ─────────────────────────────────────────────────────
// Batches rapid mutations (e.g., reviewing several phrases) into a single push.
let _syncTimer: ReturnType<typeof setTimeout> | null = null;
let _customerInfoUnsub: (() => void) | null = null;
function scheduleSync(fn: () => void, delayMs = 1500) {
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(fn, delayMs);
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
    const greetings = Object.values(s.phraseReviews).filter(r =>
      PHRASE_BY_ID[r.phraseId]?.category === 'Greetings' && r.correct >= 1
    );
    return greetings.length >= 3;
  },
  'hospitality': (s) => {
    const hosp = Object.values(s.phraseReviews).filter(r =>
      PHRASE_BY_ID[r.phraseId]?.category === 'Hospitality' && r.correct >= 1
    );
    return hosp.length >= 2;
  },
  'week-learner': (s) => s.stats.daysActive >= 7,
  'phrases-10': (s) => s.stats.phrasesStudied >= 10,
  'all-categories': (s) => {
    const cats = new Set(
      Object.values(s.phraseReviews)
        .map(r => PHRASE_BY_ID[r.phraseId]?.category)
        .filter(Boolean)
    );
    return cats.size >= 5;
  },
  'scenarios-3': (s) => s.stats.scenariosCompleted.length >= 3,
  'mastered-5': (s) => s.stats.phrasesMastered >= 5,
};

// ─── Mastery computation (extracted to eliminate duplication + O(n²)) ─────────
/**
 * Computes phrasesStudied, phrasesMastered, and categoryMastery from the current
 * review map in a single O(n) pass — replaces the previous O(n × categories × n)
 * nested-filter approach used in both recordPhraseReview and recordPhraseRating.
 */
function computeMastery(reviews: Record<string, PhraseReviewData>): {
  studied: number;
  mastered: number;
  categoryMastery: Record<string, CategoryMastery>;
} {
  const allCards = Object.values(reviews);
  const studied = allCards.length;
  let mastered = 0;

  // Single pass: bucket cards by category and count mastered
  const cardsByCategory: Partial<Record<PhraseCategory, PhraseReviewData[]>> = {};
  for (const card of allCards) {
    const phrase = PHRASE_BY_ID[card.phraseId];
    if (!phrase) continue;
    if (card.correct >= 3 && card.correct / (card.correct + card.incorrect) >= 0.8) mastered++;
    if (!cardsByCategory[phrase.category]) cardsByCategory[phrase.category] = [];
    cardsByCategory[phrase.category]!.push(card);
  }

  const categoryMastery: Record<string, CategoryMastery> = {};
  for (const cat of PHRASE_CATEGORIES) {
    const catCards = cardsByCategory[cat] ?? [];
    const totalCorrect = catCards.reduce((sum, c) => sum + c.correct, 0);
    const totalAttempts = catCards.reduce((sum, c) => sum + c.correct + c.incorrect, 0);
    categoryMastery[cat] = {
      category: cat,
      phrasesStudied: catCards.length,
      phrasesTotal: PHRASES_PER_CATEGORY[cat] ?? 0,
      accuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
    };
  }

  return { studied, mastered, categoryMastery };
}

// ─── State shape ─────────────────────────────────────────────────────────────
interface AppState {
  // Auth & onboarding
  user: UserProfile | null;
  clerkUserId: string | null;
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
  favoriteScenarios: string[];
  completedScenarios: Record<string, { endingType: string; date: string }>;
  /**
   * Pattern ids (grammar.ts) → build progress. Never unset — "masters" at 3
   * correct builds. Persisted + synced.
   */
  patternProgress: Record<string, PatternProgress>;
  /**
   * scenarioId → ending title, set once inside finalizeScenario when the ending
   * is secret. Never overwritten on replay — a replayed run can re-earn it but
   * cannot lose it. Persisted + synced.
   */
  secretEndingsEarned: Record<string, string>;
  sceneProgress: Record<string, number>; // scenarioId → scenes completed count
  lastActiveDate: string | null;
  streakFreezes: number;
  /** XP earned toward today's goal. `date` is a local ISO date; a different
   *  date means the counter has rolled over and `xp` should read as 0. */
  dailyXP: { date: string; xp: number };
  /** Add XP toward today's goal, rolling the counter over at local midnight. */
  addXP: (amount: number) => void;
  phraseReviews: Record<string, PhraseReviewData>;
  journal: JournalEntry[];
  milestones: LearningMilestone[];
  unlockedPhraseIds: string[]; // phrases unlocked through scenarios

  // Cloud sync
  isSyncing: boolean;
  lastSyncedAt: string | null;
  lastSyncError: string | null;
  syncToCloud: () => Promise<void>;
  syncFromCloud: () => Promise<void>;
  dismissSyncError: () => void;

  // Community stats (key = `scenarioId:sceneId:choiceId` or `scenarioId:endingType`)
  communityStatsCache: Record<string, number>;
  getCommunityChoiceStat: (key: string) => number;
  getCommunityEndingStat: (key: string) => number;
  fetchCommunityStats: (scenarioId: string, sceneId: string) => Promise<void>;
  fetchCommunityEndingStats: (scenarioId: string) => Promise<void>;
  recordChoiceStat: (scenarioId: string, sceneId: string, choiceId: string) => Promise<void>;

  // Notifications
  /** Rolling last-7 session hours (0–23, local time). Used for smart notification timing. */
  recentSessionHours: number[];
  /** Whether the user has granted push notification permission. */
  notificationsEnabled: boolean;
  /** Record the current hour and (re)schedule notifications with updated smart timing. */
  recordSessionHour: () => Promise<void>;
  /** Request permission and schedule initial notifications. Call after sign-in. */
  initNotifications: () => Promise<void>;

  // Anonymous onboarding analytics
  // See docs/superpowers/specs/2026-09-03-onboarding-analytics-design.md
  /**
   * Opt-out state for the anonymous onboarding aggregate. On by default; the
   * Profile toggle turns it off. It can only stop FUTURE writes — an anonymous
   * row cannot be found again to delete, and the toggle copy must not imply
   * otherwise.
   */
  analyticsEnabled: boolean;
  /**
   * Fire-once guard, so a row is written at most once per install. Rows carry
   * no identifier, so uniqueness cannot be enforced in the database and a
   * reinstall produces a second row. Not tamper-proof and not meant to be:
   * these counts inform authoring decisions, not billing.
   */
  analyticsOnboardingSent: boolean;
  /**
   * Both fields deliberately survive `signOut` and `deleteAccount` — both are
   * DEVICE_SCOPED_KEYS in engine/persistedState.ts, and deleteAccount resets
   * only hasOnboarded on top. `analyticsEnabled` is a device preference like the
   * theme, and `analyticsOnboardingSent` guards the install, not the account.
   * Nor is there anything for `deleteAccount` to erase: the row carries no
   * identifier, which is the whole point and the basis for not honouring
   * erasure against that table.
   */
  setAnalyticsEnabled: (value: boolean) => void;
  /**
   * Write the anonymous onboarding row, at most once, if collection is on.
   * Fire-and-forget: never throws, never blocks the transition out of
   * onboarding, never retries.
   */
  recordOnboardingAnalytics: (profile: UserProfile) => void;

  // Auth actions
  setUser: (user: UserProfile) => void;
  setUserMode: (mode: 'career' | 'social') => void;
  setUserGender: (gender: 'male' | 'female') => void;
  setDailyGoalXP: (xp: number) => void;
  setHasOnboarded: (value: boolean) => void;
  setAuthenticated: (value: boolean) => void;
  setClerkUserId: (id: string | null) => void;
  signOut: () => Promise<void>;
  /**
   * Erase the user's cloud data, then wipe local state. Returns an error string
   * if the cloud delete failed — the caller MUST abort and leave the Clerk
   * account intact in that case, or the row is stranded with no way to retry.
   */
  deleteAccount: () => Promise<{ error: string | null }>;

  // UI Actions
  setTheme: (theme: 'system' | 'light' | 'dark') => void;

  // Subscription actions
  startTrial: (plan: 'monthly' | 'yearly') => void;
  skipTrial: () => void;
  purchaseSubscription: (plan: 'monthly' | 'yearly' | 'lifetime') => Promise<{ subscribed: boolean; cancelled: boolean; error: string | null }>;
  restorePurchases: () => Promise<{ restored: boolean; error: string | null }>;
  presentPaywall: () => Promise<{ purchased: boolean }>;
  presentPaywallIfNeeded: () => Promise<{ purchased: boolean }>;
  openCustomerCenter: () => Promise<void>;
  initSubscription: () => Promise<void>;
  hasFullAccess: () => boolean;
  hasScenarioAccess: (scenarioIndex: number) => boolean;
  scenariosCompletedCount: () => number;

  // Learning actions
  recordDailyActivity: () => void;
  grantStreakFreeze: (count: number) => void;
  spendStreakFreeze: () => boolean;
  recordPhraseReview: (phraseId: string, correct: boolean) => void;
  // 3-tier flashcard rating — maps directly to SRS intervals (1 / 3 / 7 days)
  recordPhraseRating: (phraseId: string, rating: 'new' | 'learning' | 'knew') => void;
  /**
   * Record a Sentence Builder build. Correct builds accumulate on the pattern's
   * PatternProgress; a pattern "masters" at 3 correct builds.
   */
  recordPatternBuild: (patternId: string, correct: boolean) => void;
  /**
   * @deprecated Use finalizeScenario() instead. This action is superseded by
   * finalizeScenario which handles persistence, cloud sync, and analytics in one place.
   * Will be removed in a future cleanup.
   */
  completeScenario: (scenarioId: string, endingType: string) => void;
  recordSceneProgress: (scenarioId: string, sceneIndex: number) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
  checkMilestones: () => void;

  // Phrase library
  toggleSavedPhrase: (phraseId: string) => void;
  isPhraseSaved: (phraseId: string) => boolean;
  unlockPhrase: (phraseId: string) => void;
  /** Unlock several phrases in one state update. Prefer this over looping
   *  unlockPhrase — a scenario grants up to eight at once, and one set() per
   *  phrase means eight re-renders while the result screen is animating in. */
  unlockPhrases: (phraseIds: string[]) => void;
  isPhraseUnlocked: (phraseId: string) => boolean;

  // Scenario favourites
  toggleFavoriteScenario: (scenarioId: string) => void;
  isFavoriteScenario: (scenarioId: string) => boolean;

  // Computed helpers
  getDueReviews: () => PhraseReviewData[];

  // ─── Active scenario run (not persisted) ─────────────────────────────────────
  activeScenarioState: ScenarioState | null;
  startScenario: (scenarioId: string, firstSceneId: string) => void;
  applyScenarioChoice: (choice: ScenarioChoice, npcId: string) => void;
  advanceScenarioScene: (nextSceneId: string) => void;
  finalizeScenario: (ending: ScenarioEnding) => void;
  abandonScenario: () => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Defaults
      user: null,
      clerkUserId: null,
      hasOnboarded: false,
      isAuthenticated: false,
      _hydrated: false,
      subscriptionStatus: 'free',
      trialStartedAt: null,
      trialPlan: null,
      themePreference: 'system',
      stats: { ...DEFAULT_USER_STATS },
      savedPhrases: [],
      favoriteScenarios: [],
      completedScenarios: {},
      patternProgress: {},
      secretEndingsEarned: {},
      sceneProgress: {},
      lastActiveDate: null,
      streakFreezes: 0,
      dailyXP: { date: todayISO(), xp: 0 },
      phraseReviews: {},
      journal: [],
      milestones: DEFAULT_MILESTONES.map(m => ({ ...m })),
      unlockedPhraseIds: [],
      activeScenarioState: null,

      // Notifications
      recentSessionHours: [],
      notificationsEnabled: false,

      // Anonymous onboarding analytics
      analyticsEnabled: true,
      analyticsOnboardingSent: false,

      // Sync state
      isSyncing: false,
      lastSyncedAt: null,
      lastSyncError: null,

      dismissSyncError: () => set({ lastSyncError: null }),

      // Cloud sync
      syncToCloud: async () => {
        const s = get();
        if (!s.clerkUserId) return;
        set({ isSyncing: true });
        try {
          const { error } = await pushProgress(s.clerkUserId, {
            schema_version: CURRENT_SCHEMA_VERSION,
            user_profile: s.user,
            stats: s.stats,
            phrase_reviews: s.phraseReviews,
            completed_scenarios: s.completedScenarios,
            pattern_progress: s.patternProgress,
            secret_endings_earned: s.secretEndingsEarned,
            saved_phrases: s.savedPhrases,
            unlocked_phrase_ids: s.unlockedPhraseIds,
            milestones: s.milestones,
            journal: s.journal,
            last_active_date: s.lastActiveDate,
            subscription_status: s.subscriptionStatus,
            trial_started_at: s.trialStartedAt,
            trial_plan: s.trialPlan,
          });
          if (error) {
            set({ isSyncing: false, lastSyncError: error });
          } else {
            set({ isSyncing: false, lastSyncedAt: new Date().toISOString(), lastSyncError: null });
          }
        } catch (e) {
          set({ isSyncing: false, lastSyncError: e instanceof Error ? e.message : 'Sync failed' });
        }
      },

      syncFromCloud: async () => {
        const s = get();
        if (!s.clerkUserId) return;
        set({ isSyncing: true });
        const { data, error } = await pullProgress(s.clerkUserId);
        if (error) {
          set({ isSyncing: false, lastSyncError: error });
          return;
        }
        set({ isSyncing: false, lastSyncError: null });
        if (!data) return;

        // Additive-only changes (a new column defaulting via asRecord/asArray)
        // merge safely even from a stale row. A future shape-changing migration
        // will not — this warning exists so that stops being a silent surprise.
        // See supabase/migrations/README.md's schema version table.
        if (data.schema_version < CURRENT_SCHEMA_VERSION) {
          console.warn(
            `[sync] Cloud row is schema_version ${data.schema_version}, current is ` +
            `${CURRENT_SCHEMA_VERSION}. Merging anyway — this is safe only as long as every ` +
            'version bump so far has been purely additive.',
          );
        }

        // Re-read local state AFTER the network round-trip. `s` above is a
        // snapshot taken before the await; the app navigates to the tabs
        // immediately and this runs in the background, so a learner can finish
        // a card while the request is in flight. Merging against the stale
        // snapshot would drop exactly the write we are here to protect.
        const local = get();

        // Merge strategy: never lose a record. See src/engine/syncMerge.ts —
        // the rules are pure and unit-tested there. The old code let the cloud
        // win outright for phraseReviews and completedScenarios, so anything
        // studied offline, or on a second device since its last push, was
        // silently erased the next time this ran.
        const mergedMilestones = mergeMilestones(local.milestones, data.milestones);
        const mergedUnlocked = mergeIds(local.unlockedPhraseIds, data.unlocked_phrase_ids);
        const mergedJournal = mergeJournal(local.journal, data.journal);
        const mergedReviews = mergeReviews(local.phraseReviews, data.phrase_reviews);
        const mergedCompleted = mergeCompletions(local.completedScenarios, data.completed_scenarios);

        // stats is derived from the two maps above, so recompute it rather than
        // trusting either side's snapshot. daysActive and currentStreak are the
        // only genuinely independent counters — take the higher, since neither
        // can legitimately go backwards on a merge.
        const { studied, mastered, categoryMastery } = computeMastery(mergedReviews);
        const mergedStats: UserStats = {
          daysActive: Math.max(local.stats.daysActive, data.stats.daysActive),
          currentStreak: Math.max(local.stats.currentStreak, data.stats.currentStreak),
          phrasesStudied: studied,
          phrasesMastered: mastered,
          categoryMastery,
          scenariosCompleted: Object.keys(mergedCompleted),
        };

        // lastActiveDate follows the same "cannot go backwards" rule as the two
        // counters above. Taking the cloud's value outright would push the
        // streak date back whenever the local device had practised more
        // recently than its last successful push — which is precisely the
        // offline case. ISO dates compare correctly as strings.
        const mergedLastActive =
          [local.lastActiveDate, data.last_active_date].filter(Boolean).sort().pop() ?? null;

        // patternProgress/secretEndingsEarned merges: see src/engine/syncMerge.ts —
        // pulled out of this file (and unit-tested there) alongside their five
        // siblings above, rather than staying the two hand-written exceptions.
        // Reads from `local`, not `s` — `s` is the snapshot taken before the
        // network round-trip, so seeding from it would discard any pattern
        // practised while the request was in flight. Same reason every other
        // merge on this path was moved off `s`.
        const mergedPatternProgress = mergePatternProgress(local.patternProgress, data.pattern_progress ?? {});
        const mergedSecrets = mergeSecretEndings(local.secretEndingsEarned, data.secret_endings_earned ?? {});

        set({
          user: data.user_profile ?? local.user,
          stats: mergedStats,
          phraseReviews: mergedReviews,
          completedScenarios: mergedCompleted,
          patternProgress: mergedPatternProgress,
          secretEndingsEarned: mergedSecrets,
          // Union, consistent with the rule above: a save made on either device
          // survives. The trade-off is that un-saving while offline can be
          // undone by a cloud copy that predates it — recoverable with one tap,
          // where a lost save is silent.
          savedPhrases: mergeIds(local.savedPhrases, data.saved_phrases),
          unlockedPhraseIds: mergedUnlocked,
          milestones: mergedMilestones,
          journal: mergedJournal,
          lastActiveDate: mergedLastActive,
          subscriptionStatus: data.subscription_status ?? local.subscriptionStatus,
          trialStartedAt: data.trial_started_at ?? local.trialStartedAt,
          trialPlan: data.trial_plan ?? local.trialPlan,
          lastSyncedAt: new Date().toISOString(),
        });
      },

      // Auth
      setUser: (user) => set({ user }),
      setUserMode: (mode) => set((state) => ({ user: state.user ? { ...state.user, mode } : null })),
      setUserGender: (gender) => set((state) => ({ user: state.user ? { ...state.user, gender } : null })),
      setDailyGoalXP: (xp) => set((state) => ({ user: state.user ? { ...state.user, dailyGoalXP: xp } : null })),
      setHasOnboarded: (value) => set({ hasOnboarded: value }),

      setAnalyticsEnabled: (value) => set({ analyticsEnabled: value }),

      recordOnboardingAnalytics: (profile) => {
        const { analyticsEnabled, analyticsOnboardingSent } = get();
        // The guard order lives in engine/onboardingAnalytics so it is testable
        // without a store or a network.
        if (!shouldRecordOnboarding({ analyticsEnabled, analyticsOnboardingSent }, profile)) return;

        // Flag set BEFORE the write, not after. The write is fire-and-forget
        // with no error path, so there is no moment at which "did it land?" is
        // knowable — and a flag set on success would re-fire on every launch
        // for anyone permanently offline.
        set({ analyticsOnboardingSent: true });

        void recordOnboardingSelection({
          mode: profile.mode,
          role: profile.role,
          goals: profile.goals,
        });
      },
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setClerkUserId: (id) => set({ clerkUserId: id }),
      signOut: async () => {
        await logoutPurchasesUser();
        await cancelAllNotifications();
        // Drop the RevenueCat listener too. Left registered, it keeps firing
        // after sign-out and can write a subscriptionStatus for the anonymous
        // customer into the freshly-cleared store.
        if (_customerInfoUnsub) {
          _customerInfoUnsub();
          _customerInfoUnsub = null;
        }
        // Clear all user-specific data so the next sign-in starts clean.
        // What gets wiped — and why hasOnboarded, the theme and the analytics
        // flags survive — lives in engine/persistedState.ts, where a test fails
        // if a persisted key is neither reset nor kept on purpose.
        set(signOutReset(DEFAULT_MILESTONES));
      },

      deleteAccount: async () => {
        // Cloud data FIRST. delete_my_account() authenticates with the live
        // Clerk session token, so removing the Clerk user before this point
        // would revoke that token and strand the row — owned by nobody, with
        // no way for the user (or anyone) to retry the deletion.
        const { error } = await deleteAccountData();
        if (error) return { error };

        // Cloud row is gone; tear down everything local.
        await get().signOut();

        // signOut deliberately preserves hasOnboarded so a returning user lands
        // on sign-in. A deleted account has no "returning" — reset it so the
        // next launch starts from onboarding as a genuinely new user.
        set({ hasOnboarded: false });

        return { error: null };
      },

      // ─── Notifications ──────────────────────────────────────────────────────
      initNotifications: async () => {
        const granted = await requestNotificationPermission();
        if (!granted) return;
        set({ notificationsEnabled: true });
        const s = get();
        const hour = derivePreferredHour(s.recentSessionHours);
        const dueCount = Object.values(s.phraseReviews).filter(r => r.nextReview <= todayISO()).length;
        await scheduleDailyReminder(hour, s.stats.currentStreak, dueCount);
        await scheduleReEngagementIfNeeded(s.lastActiveDate, s.user?.name ?? '');
        await scheduleStreakRiskIfNeeded(s.lastActiveDate, s.stats.currentStreak);
      },

      recordSessionHour: async () => {
        const hour = new Date().getHours();
        set(s => ({
          recentSessionHours: [...s.recentSessionHours, hour].slice(-7), // keep last 7
        }));
        // Re-schedule with updated smart timing (non-blocking)
        const s = get();
        if (!s.notificationsEnabled) return;
        const preferredHour = derivePreferredHour(s.recentSessionHours);
        const dueCount = Object.values(s.phraseReviews).filter(r => r.nextReview <= todayISO()).length;
        await scheduleDailyReminder(preferredHour, s.stats.currentStreak, dueCount).catch(() => {});
      },

      // UI
      setTheme: (theme) => set({ themePreference: theme }),

      // Subscription
      startTrial: (plan) => {
        set({ subscriptionStatus: 'trial', trialStartedAt: new Date().toISOString(), trialPlan: plan });
        get().syncToCloud();
      },
      skipTrial: () => set({ subscriptionStatus: 'free', trialStartedAt: null, trialPlan: null }),

      purchaseSubscription: async (plan) => {
        const result = await purchasePlan(plan);
        const subscribed = result.status === 'subscribed';
        if (subscribed) {
          set({ subscriptionStatus: 'subscribed', trialStartedAt: null });
          // A dev-simulated purchase unlocks the app locally but must never
          // reach the cloud row — otherwise a release build pulls it down and
          // grants permanent free Pro to a real account.
          if (!result.simulated) get().syncToCloud();
        }
        return { subscribed, cancelled: result.cancelled, error: result.error };
      },

      restorePurchases: async () => {
        const result = await rcRestorePurchases();
        if (result.status === 'subscribed') {
          set({ subscriptionStatus: 'subscribed', trialStartedAt: null });
          get().syncToCloud();
          return { restored: true, error: null };
        }
        return { restored: false, error: result.error };
      },

      presentPaywall: async () => {
        const result = await rcPresentPaywall();
        if (result.purchased || result.restored) {
          set({ subscriptionStatus: 'subscribed', trialStartedAt: null });
          get().syncToCloud();
          return { purchased: true };
        }
        return { purchased: false };
      },

      presentPaywallIfNeeded: async () => {
        const result = await rcPresentPaywallIfNeeded();
        if (result.purchased || result.restored) {
          set({ subscriptionStatus: 'subscribed', trialStartedAt: null });
          get().syncToCloud();
          return { purchased: true };
        }
        return { purchased: false };
      },

      openCustomerCenter: async () => {
        await rcPresentCustomerCenter();
      },

      initSubscription: async () => {
        configurePurchases();
        const userId = get().clerkUserId;
        if (userId) await loginPurchasesUser(userId);

        // Check current entitlement status against RevenueCat, the source of
        // truth for 'subscribed' vs 'free'. 'trial' is local-only and never
        // touched here — RevenueCat has no concept of it.
        const status = await getEntitlementStatus();
        const previousStatus = get().subscriptionStatus;
        if (status === 'subscribed' && previousStatus !== 'subscribed') {
          set({ subscriptionStatus: 'subscribed' });
          get().syncToCloud();
        } else if (status === 'free' && previousStatus === 'subscribed') {
          // Cancelled, refunded, or charged back outside the app — without this
          // branch a stale 'subscribed' from a previous launch was never
          // corrected unless the CustomerInfo listener happened to fire a live
          // change event during this session.
          set({ subscriptionStatus: 'free' });
          get().syncToCloud();
        }

        // Set up real-time listener for subscription changes (e.g., renewal, cancellation).
        // Deregister any previous listener to prevent accumulation across hot-reloads.
        if (_customerInfoUnsub) _customerInfoUnsub();
        _customerInfoUnsub = addCustomerInfoListener((newStatus) => {
          const current = get().subscriptionStatus;
          if (newStatus !== current) {
            set({ subscriptionStatus: newStatus });
            get().syncToCloud();
          }
        });
      },

      hasFullAccess: () => computeHasFullAccess(get()),
      hasScenarioAccess: (scenarioIndex: number) => computeHasScenarioAccess(get(), scenarioIndex),
      scenariosCompletedCount: () => Object.keys(get().completedScenarios).length,

      // Learning
      recordDailyActivity: () => {
        set((s) => {
          const today = todayISO();
          if (s.lastActiveDate === today) return {};

          const yesterday = addDays(today, -1);
          const isConsecutive = s.lastActiveDate === yesterday;
          const newStreak = isConsecutive ? s.stats.currentStreak + 1 : 1;
          const freezeBonus = shouldGrantStreakFreeze(newStreak) ? 1 : 0;

          return {
            lastActiveDate: today,
            stats: { ...s.stats, currentStreak: newStreak, daysActive: s.stats.daysActive + 1 },
            streakFreezes: s.streakFreezes + freezeBonus,
          };
        });
        scheduleSync(() => get().syncToCloud());
      },

      grantStreakFreeze: (count) => set((s) => ({ streakFreezes: s.streakFreezes + count })),

      addXP: (amount) =>
        set((s) => {
          const today = todayISO();
          const base = s.dailyXP.date === today ? s.dailyXP.xp : 0;
          return { dailyXP: { date: today, xp: base + amount } };
        }),

      spendStreakFreeze: () => {
        const s = get();
        const result = applyStreakFreeze({ streakFreezes: s.streakFreezes, lastActiveDate: s.lastActiveDate }, todayISO());
        if (result.applied) {
          set({ streakFreezes: result.streakFreezes, lastActiveDate: result.lastActiveDate });
          scheduleSync(() => get().syncToCloud());
        }
        return result.applied;
      },

      recordPhraseReview: (phraseId, correct) => {
        set((s) => {
          const existing = s.phraseReviews[phraseId];
          const card = updateReviewCard(existing ?? newReviewCard(phraseId), correct);
          const newReviews = { ...s.phraseReviews, [phraseId]: card };
          const { studied, mastered, categoryMastery } = computeMastery(newReviews);
          return { phraseReviews: newReviews, stats: { ...s.stats, phrasesStudied: studied, phrasesMastered: mastered, categoryMastery } };
        });
        scheduleSync(() => get().syncToCloud());
      },

      recordPhraseRating: (phraseId, rating) => {
        get().addXP(XP_PER_PHRASE_REVIEW);
        set((s) => {
          const existing = s.phraseReviews[phraseId];
          const card = applyRatingToCard(existing ?? newReviewCard(phraseId), rating);
          const newReviews = { ...s.phraseReviews, [phraseId]: card };
          const { studied, mastered, categoryMastery } = computeMastery(newReviews);
          return { phraseReviews: newReviews, stats: { ...s.stats, phrasesStudied: studied, phrasesMastered: mastered, categoryMastery } };
        });
        scheduleSync(() => get().syncToCloud());
      },

      recordPatternBuild: (patternId, correct) => {
        set((s) => {
          const existing = s.patternProgress[patternId];
          const next: PatternProgress = {
            correctBuilds: (existing?.correctBuilds ?? 0) + (correct ? 1 : 0),
            lastBuilt: new Date().toISOString(),
          };
          return { patternProgress: { ...s.patternProgress, [patternId]: next } };
        });
        scheduleSync(() => get().syncToCloud());
      },

      /**
       * @deprecated Use finalizeScenario() instead. This action is superseded by
       * finalizeScenario which handles persistence, cloud sync, and analytics in one place.
       * Will be removed in a future cleanup.
       */
      completeScenario: (scenarioId, endingType) => {
        set((s) => {
          const completed = { ...s.completedScenarios, [scenarioId]: { endingType, date: new Date().toISOString() } };
          return { completedScenarios: completed, stats: { ...s.stats, scenariosCompleted: Object.keys(completed) } };
        });
        scheduleSync(() => get().syncToCloud());
        void rcRecordEndingStat(scenarioId, endingType);
      },

      recordSceneProgress: (scenarioId, sceneIndex) => {
        set((s) => {
          const current = s.sceneProgress[scenarioId] ?? 0;
          if (sceneIndex + 1 <= current) return {}; // never go backwards
          return { sceneProgress: { ...s.sceneProgress, [scenarioId]: sceneIndex + 1 } };
        });
      },

      // Community stats — Supabase-backed with in-memory cache
      communityStatsCache: {},

      getCommunityChoiceStat: (key: string) => get().communityStatsCache[key] ?? 0,

      getCommunityEndingStat: (key: string) => get().communityStatsCache[key] ?? 0,

      fetchCommunityStats: async (scenarioId: string, sceneId: string) => {
        const stats = await getChoiceStats(scenarioId, sceneId);
        const entries: Record<string, number> = {};
        for (const [choiceId, pct] of Object.entries(stats)) {
          entries[`${scenarioId}:${sceneId}:${choiceId}`] = pct;
        }
        set((s) => ({ communityStatsCache: { ...s.communityStatsCache, ...entries } }));
      },

      fetchCommunityEndingStats: async (scenarioId: string) => {
        const stats = await getEndingStats(scenarioId);
        const entries: Record<string, number> = {};
        for (const [endingType, pct] of Object.entries(stats)) {
          entries[`${scenarioId}:${endingType}`] = pct;
        }
        set((s) => ({ communityStatsCache: { ...s.communityStatsCache, ...entries } }));
      },

      recordChoiceStat: async (scenarioId: string, sceneId: string, choiceId: string) => {
        await rcRecordChoiceStat(scenarioId, sceneId, choiceId);
      },

      addJournalEntry: (entry) => set((s) => ({
        journal: [
          { ...entry, id: nextJournalId(), date: todayISO() },
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

      unlockPhrase: (phraseId) => {
        set((s) => {
          const exists = s.unlockedPhraseIds.includes(phraseId);
          return { unlockedPhraseIds: exists ? s.unlockedPhraseIds : [...s.unlockedPhraseIds, phraseId] };
        });
        scheduleSync(() => get().syncToCloud());
      },

      unlockPhrases: (phraseIds) => {
        set((s) => {
          const merged = mergeIds(s.unlockedPhraseIds, phraseIds);
          // Bail out of the update entirely when nothing is new, so replaying a
          // completed scenario doesn't churn state or queue a pointless push.
          return merged.length === s.unlockedPhraseIds.length ? {} : { unlockedPhraseIds: merged };
        });
        scheduleSync(() => get().syncToCloud());
      },

      isPhraseUnlocked: (phraseId) => get().unlockedPhraseIds.includes(phraseId),

      toggleFavoriteScenario: (scenarioId) => {
        set((s) => {
          const exists = s.favoriteScenarios.includes(scenarioId);
          return { favoriteScenarios: exists ? s.favoriteScenarios.filter((id) => id !== scenarioId) : [...s.favoriteScenarios, scenarioId] };
        });
      },
      isFavoriteScenario: (scenarioId) => get().favoriteScenarios.includes(scenarioId),

      getDueReviews: () => {
        const today = todayISO();
        return Object.values(get().phraseReviews).filter(r => r.nextReview <= today);
      },

      // ─── Active scenario run ────────────────────────────────────────────────────
      startScenario: (scenarioId, firstSceneId) => {
        const current = get().activeScenarioState;
        // If there is already an active run for a different scenario, abandon it first
        if (current && current.scenarioId !== scenarioId) {
          get().abandonScenario();
        }
        set({
          activeScenarioState: {
            scenarioId,
            currentSceneId: firstSceneId,
            flags: new Set<string>(),
            impactByNpc: {},
            totalScore: 0,
            scoreByNpc: {},
            choiceHistory: [],
            scenesVisited: new Set<string>([firstSceneId]),
            startedAt: new Date().toISOString(),
          },
        });
      },

      applyScenarioChoice: (choice, npcId) =>
        set(s => ({
          activeScenarioState: s.activeScenarioState
            ? applyChoiceEngine(s.activeScenarioState, choice, npcId)
            : null,
        })),

      advanceScenarioScene: (nextSceneId) =>
        set(s => {
          if (!s.activeScenarioState) return {};
          const visited = new Set(s.activeScenarioState.scenesVisited);
          visited.add(nextSceneId);
          return {
            activeScenarioState: {
              ...s.activeScenarioState,
              currentSceneId: nextSceneId,
              scenesVisited: visited,
            },
          };
        }),

      finalizeScenario: (ending) => {
        const s = get();
        if (!s.activeScenarioState) return;
        const { scenarioId } = s.activeScenarioState;
        const completed = {
          ...s.completedScenarios,
          [scenarioId]: {
            endingType: ending.type,
            date: new Date().toISOString(),
          },
        };
        // Secret endings are captured once and never overwritten — replaying the
        // scenario can re-earn but cannot lose the pattern unlock.
        const secrets =
          ending.secret && !s.secretEndingsEarned[scenarioId]
            ? { ...s.secretEndingsEarned, [scenarioId]: ending.title }
            : s.secretEndingsEarned;
        set({
          completedScenarios: completed,
          secretEndingsEarned: secrets,
          stats: { ...s.stats, scenariosCompleted: Object.keys(completed) },
          activeScenarioState: null,
        });
        // Fire milestone checks immediately so first-scenario and scenarios-3
        // milestones appear in the same session they are earned (not next app open).
        get().checkMilestones();
        get().addXP(XP_PER_SCENARIO);
        scheduleSync(() => get().syncToCloud());
        void rcRecordEndingStat(scenarioId, ending.type);
      },

      abandonScenario: () => set({ activeScenarioState: null }),
    }),
    {
      name: 'fasih-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => {
        useAppStore.setState({ _hydrated: true });
      },
      // The key list lives in engine/persistedState.ts, next to the sign-out
      // reset, so adding a persisted key without deciding whether signOut
      // wipes it fails a test instead of leaking to the next account.
      partialize: (state) => pickPersisted(state),
    }
  )
);

// ─── Access hooks ─────────────────────────────────────────────────────────────
// Use these in components instead of calling the store getters. Selecting a
// getter (`useAppStore(s => s.hasFullAccess)`) subscribes to the function's
// identity, which is stable for the life of the store — so the component never
// re-renders when the access answer actually changes, and gates stay frozen at
// whatever they were on first mount. These select the underlying state, so they
// re-render correctly when a subscription starts or a scenario is completed.

/** True when the learner has full access: subscribed, in trial, or 3+ scenarios done. */
export const useHasFullAccess = (): boolean =>
  useAppStore((s) => computeHasFullAccess(s));

/** True when this scenario index is playable for the current learner. */
export const useHasScenarioAccess = (scenarioIndex: number): boolean =>
  useAppStore((s) => computeHasScenarioAccess(s, scenarioIndex));

/** Number of scenarios completed — subscribes to the map, unlike the getter. */
export const useScenariosCompletedCount = (): number =>
  useAppStore((s) => Object.keys(s.completedScenarios).length);
