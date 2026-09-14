/**
 * Which store keys persist, and which of those signOut wipes.
 *
 * A phone can change hands: sign out, sign in as someone else. Any persisted
 * key that belongs to the first learner and survives the reset is inherited by
 * the second — then pushed into *their* cloud row on the next sync, where the
 * only-grow merge rules make it permanent. patternProgress and
 * secretEndingsEarned leaked exactly that way: added to persist and sync, never
 * added to the reset, because the two lists lived far apart in the store.
 *
 * So the split lives here, in one place. Every key in PERSISTED_KEYS is either
 * in DEVICE_SCOPED_KEYS (survives, with a reason) or reset by signOutReset().
 * src/engine/__tests__/persistedState.test.ts fails when a key is neither.
 */
import { DEFAULT_USER_STATS } from '../types';
import type { LearningMilestone } from '../types';
import { todayISO } from './srsEngine';

/** Every store key written to AsyncStorage. The store's `partialize` picks exactly these. */
export const PERSISTED_KEYS = [
  'user',
  'clerkUserId',
  'hasOnboarded',
  'isAuthenticated',
  'subscriptionStatus',
  'trialStartedAt',
  'trialPlan',
  'themePreference',
  'stats',
  'savedPhrases',
  'unlockedPhraseIds',
  'favoriteScenarios',
  'completedScenarios',
  'patternProgress',
  'secretEndingsEarned',
  'endingsFound',
  'scenarioRuns',
  'sceneProgress',
  'lastActiveDate',
  'streakFreezes',
  'dailyXP',
  'phraseReviews',
  'journal',
  'milestones',
  'recentSessionHours',
  'notificationsEnabled',
  'analyticsEnabled',
  'analyticsOnboardingSent',
] as const;

export type PersistedKey = (typeof PERSISTED_KEYS)[number];

/**
 * Persisted keys that belong to the install, not the learner, so signOut
 * leaves them alone. Each one needs a reason to be here:
 *
 * - hasOnboarded: a returning user lands on sign-in, not onboarding.
 *   deleteAccount clears it itself — a deleted account has no "returning".
 * - themePreference: a display choice for whoever is holding the phone.
 * - analyticsEnabled: a device opt-out, like the theme. Resetting it would
 *   silently turn collection back on for someone who turned it off.
 * - analyticsOnboardingSent: guards the install, not the account. The row it
 *   guards carries no identifier, so resetting it can only double-count.
 */
export const DEVICE_SCOPED_KEYS = [
  'hasOnboarded',
  'themePreference',
  'analyticsEnabled',
  'analyticsOnboardingSent',
] as const satisfies readonly PersistedKey[];

/** The store's `partialize`: exactly PERSISTED_KEYS, so nothing else reaches AsyncStorage. */
export function pickPersisted<T extends Record<PersistedKey, unknown>>(state: T): Pick<T, PersistedKey> {
  const picked = {} as Pick<T, PersistedKey>;
  for (const key of PERSISTED_KEYS) picked[key] = state[key];
  return picked;
}

/**
 * The state signOut writes: every persisted key that isn't device-scoped, plus
 * the in-memory session state (active run, sync status, community cache) that
 * would otherwise still describe the previous learner.
 */
export function signOutReset(defaultMilestones: readonly LearningMilestone[]) {
  return {
    isAuthenticated: false,
    clerkUserId: null,
    user: null,
    subscriptionStatus: 'free' as const,
    trialStartedAt: null,
    trialPlan: null,
    stats: { ...DEFAULT_USER_STATS },
    phraseReviews: {},
    completedScenarios: {},
    patternProgress: {},
    secretEndingsEarned: {},
    endingsFound: {},
    scenarioRuns: {},
    savedPhrases: [],
    unlockedPhraseIds: [],
    favoriteScenarios: [],
    sceneProgress: {},
    lastActiveDate: null,
    streakFreezes: 0,
    dailyXP: { date: todayISO(), xp: 0 },
    journal: [],
    milestones: defaultMilestones.map((m) => ({ ...m })),
    activeScenarioState: null,
    communityStatsCache: {},
    lastSyncedAt: null,
    lastSyncError: null,
    recentSessionHours: [],
    notificationsEnabled: false,
  };
}
