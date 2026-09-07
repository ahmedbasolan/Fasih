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
} from '../lib/syncService';
import {
  CURRENT_SCHEMA_VERSION,
  computeMastery,
  toCloud,
  mergeCloudState,
} from '../engine/syncedProgress';
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
import type { UserProfile, PhraseReviewData, JournalEntry, ScenarioChoice, ScenarioEnding, PatternProgress, PersistableState, EphemeralState } from '../types';
import { DEFAULT_USER_STATS } from '../types';
import { PHRASE_BY_ID } from '../constants/phrases';
import { freshMilestones } from '../constants/milestones';
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
// The other six merge rules are reached through mergeCloudState now; only
// unlockPhrases still needs a merge directly.
import { mergeIds } from '../engine/syncMerge';

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
// DEFAULT_MILESTONES moved to src/constants/milestones.ts so FIELD_POLICY can
// own the sign-out reset value alongside every other field's. The predicates
// below stay here: they read store state.

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

// computeMastery moved to src/engine/syncedProgress.ts — mergeCloudState needs
// it for the derive pass, and the store's write paths import it back from there
// so both compute mastery exactly one way.

// ─── State shape ─────────────────────────────────────────────────────────────
/**
 * Everything the store can *do*. The data it holds lives in `PersistableState`
 * (durable, governed by FIELD_POLICY in src/engine/syncedProgress.ts) and
 * `EphemeralState` (session-only), both in src/types.
 *
 * Keeping data and actions in separate interfaces is what lets the policy table
 * be a mapped type over the data half — see the note on `PersistableState`.
 */
interface AppActions {
  /** Add XP toward today's goal, rolling the counter over at local midnight. */
  addXP: (amount: number) => void;

  // Cloud sync
  syncToCloud: () => Promise<void>;
  syncFromCloud: () => Promise<void>;
  dismissSyncError: () => void;

  // Community stats (key = `scenarioId:sceneId:choiceId` or `scenarioId:endingType`)
  getCommunityChoiceStat: (key: string) => number;
  getCommunityEndingStat: (key: string) => number;
  fetchCommunityStats: (scenarioId: string, sceneId: string) => Promise<void>;
  fetchCommunityEndingStats: (scenarioId: string) => Promise<void>;
  recordChoiceStat: (scenarioId: string, sceneId: string, choiceId: string) => Promise<void>;

  // Notifications
  /** Record the current hour and (re)schedule notifications with updated smart timing. */
  recordSessionHour: () => Promise<void>;
  /** Request permission and schedule initial notifications. Call after sign-in. */
  initNotifications: () => Promise<void>;

  // Anonymous onboarding analytics
  // See docs/superpowers/specs/2026-09-03-onboarding-analytics-design.md
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
  startScenario: (scenarioId: string, firstSceneId: string) => void;
  applyScenarioChoice: (choice: ScenarioChoice, npcId: string) => void;
  advanceScenarioScene: (nextSceneId: string) => void;
  finalizeScenario: (ending: ScenarioEnding) => void;
  abandonScenario: () => void;
}

type AppState = PersistableState & EphemeralState & AppActions;

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
      milestones: freshMilestones(),
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
          const { error } = await pushProgress(s.clerkUserId, toCloud(s));
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

        // Merge strategy: never lose a record. Every rule, and the derive pass
        // that recomputes stats from the merged maps, lives in
        // src/engine/syncedProgress.ts — pure and unit-tested there.
        set({
          ...mergeCloudState(local, data),
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
        // hasOnboarded is intentionally preserved — a returning user lands on
        // sign-in, not onboarding.
        set({
          isAuthenticated: false,
          clerkUserId: null,
          user: null,
          subscriptionStatus: 'free',
          trialStartedAt: null,
          trialPlan: null,
          stats: { ...DEFAULT_USER_STATS },
          phraseReviews: {},
          completedScenarios: {},
          savedPhrases: [],
          unlockedPhraseIds: [],
          favoriteScenarios: [],
          sceneProgress: {},
          lastActiveDate: null,
          streakFreezes: 0,
          dailyXP: { date: todayISO(), xp: 0 },
          journal: [],
          milestones: freshMilestones(),
          activeScenarioState: null,
          communityStatsCache: {},
          lastSyncedAt: null,
          lastSyncError: null,
          recentSessionHours: [],
          notificationsEnabled: false,
        });
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
      partialize: (state) => ({
        user: state.user,
        clerkUserId: state.clerkUserId,
        hasOnboarded: state.hasOnboarded,
        isAuthenticated: state.isAuthenticated,
        subscriptionStatus: state.subscriptionStatus,
        trialStartedAt: state.trialStartedAt,
        trialPlan: state.trialPlan,
        themePreference: state.themePreference,
        stats: state.stats,
        savedPhrases: state.savedPhrases,
        unlockedPhraseIds: state.unlockedPhraseIds,
        favoriteScenarios: state.favoriteScenarios,
        completedScenarios: state.completedScenarios,
        patternProgress: state.patternProgress,
        secretEndingsEarned: state.secretEndingsEarned,
        sceneProgress: state.sceneProgress,
        lastActiveDate: state.lastActiveDate,
        streakFreezes: state.streakFreezes,
        dailyXP: state.dailyXP,
        phraseReviews: state.phraseReviews,
        journal: state.journal,
        milestones: state.milestones,
        recentSessionHours: state.recentSessionHours,
        notificationsEnabled: state.notificationsEnabled,
        analyticsEnabled: state.analyticsEnabled,
        analyticsOnboardingSent: state.analyticsOnboardingSent,
      }),
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
