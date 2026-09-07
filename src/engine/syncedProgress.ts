/**
 * The learner's synced progress — one owner for what persists, what syncs, and
 * what a sign-out clears.
 *
 * Pure functions and data only. No React, no Zustand, no network. See
 * docs/superpowers/plans/2026-09-07-synced-progress-module.md.
 *
 * ─── Why this exists ────────────────────────────────────────────────────────
 * The set of synced fields used to be declared six times: the store's state
 * interface, `partialize`, the `syncToCloud` payload, `pushProgress`'s column
 * list, `pullProgress`'s coercion, and the `syncFromCloud` merge — plus a
 * seventh hand-written list in `signOut`. Adding a field meant editing six
 * files, and missing one was silent: the field simply never synced, or never
 * cleared. Two bugs were already sitting in those gaps.
 *
 * `FIELD_POLICY` below is now the only place any of it is stated. It is typed
 * as a mapped type over `PersistableState`, so a new durable field is a
 * compile error until its policy is declared.
 *
 * ─── Reading the table ──────────────────────────────────────────────────────
 * Each field declares:
 *   persist         — survives an app restart (feeds `partialize`)
 *   clearOnSignOut  — wiped when the user signs out (feeds `clearedOnSignOut`)
 *   reset           — the value it is wiped to; required when clearOnSignOut
 *   cloud           — null, or how it maps to and merges from the cloud row
 *
 * A field with `cloud: null` is device-local: it persists, but a reinstall or a
 * second device will not see it.
 */

import type {
  PersistableState,
  ScenarioCompletion,
  UserProfile,
  UserStats,
  PhraseReviewData,
  LearningMilestone,
  JournalEntry,
  SubscriptionStatus,
  PatternProgress,
  CategoryMastery,
  PhraseCategory,
} from '../types';
import { DEFAULT_USER_STATS } from '../types';
import { PHRASE_CATEGORIES, PHRASE_BY_ID, PHRASES_PER_CATEGORY } from '../constants/phrases';
import { freshMilestones } from '../constants/milestones';
import { todayISO } from './srsEngine';
import {
  mergeReviews,
  mergeCompletions,
  mergeJournal,
  mergeMilestones,
  mergeIds,
  mergePatternProgress,
  mergeSecretEndings,
} from './syncMerge';

// ─── Wire shape ──────────────────────────────────────────────────────────────

/**
 * Increment when CloudUserData changes shape in a breaking way. `pullProgress`
 * uses it to detect stale cloud rows.
 *
 * History: 1 = initial; 2 = added schema_version + gender + unlocked_phrase_ids;
 *          3 = added pattern_progress + secret_endings_earned (Sentence Builder)
 *
 * Lives here rather than in `src/lib/syncService.ts` because the wire shape is
 * part of this module's contract; the service is only the transport for it.
 */
export const CURRENT_SCHEMA_VERSION = 3;

/** One row of `user_data`, decoded. Column names are the database's. */
export interface CloudUserData {
  schema_version: number;
  user_profile: UserProfile | null;
  stats: UserStats;
  phrase_reviews: Record<string, PhraseReviewData>;
  completed_scenarios: Record<string, ScenarioCompletion>;
  pattern_progress: Record<string, PatternProgress>;
  secret_endings_earned: Record<string, string>;
  saved_phrases: string[];
  unlocked_phrase_ids: string[];
  milestones: LearningMilestone[];
  journal: JournalEntry[];
  last_active_date: string | null;
  subscription_status: SubscriptionStatus;
  trial_started_at: string | null;
  trial_plan: 'monthly' | 'yearly' | null;
}

/** Every column except the version marker, which no state field owns. */
export type CloudColumn = Exclude<keyof CloudUserData, 'schema_version'>;

// ─── Decoders ────────────────────────────────────────────────────────────────
// supabase-js hands back `any`, and every JSONB column is `NOT NULL DEFAULT
// '{}'`, so `{}` is an ordinary value for a row created by anything other than
// pushProgress. Each of these defaults field-by-field rather than by a single
// spread, because a present-but-null field (`{"scenariosCompleted": null}`)
// survives a spread and crashes exactly the same way. This is the coercion that
// used to live in syncService.

/** Coerce whatever the `stats` column holds into a complete UserStats. */
export function normalizeStats(raw: unknown): UserStats {
  const s = (raw && typeof raw === 'object' ? raw : {}) as Partial<UserStats>;
  return {
    daysActive: typeof s.daysActive === 'number' ? s.daysActive : DEFAULT_USER_STATS.daysActive,
    currentStreak: typeof s.currentStreak === 'number' ? s.currentStreak : DEFAULT_USER_STATS.currentStreak,
    phrasesMastered: typeof s.phrasesMastered === 'number' ? s.phrasesMastered : DEFAULT_USER_STATS.phrasesMastered,
    phrasesStudied: typeof s.phrasesStudied === 'number' ? s.phrasesStudied : DEFAULT_USER_STATS.phrasesStudied,
    scenariosCompleted: Array.isArray(s.scenariosCompleted) ? s.scenariosCompleted : [],
    categoryMastery:
      s.categoryMastery && typeof s.categoryMastery === 'object' ? s.categoryMastery : {},
  };
}

/** Same reasoning as normalizeStats, for the map-shaped columns. */
export function asRecord<T>(raw: unknown): Record<string, T> {
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, T>) : {};
}

/** Same reasoning as normalizeStats, for the array-shaped columns. */
export function asArray<T>(raw: unknown): T[] {
  return Array.isArray(raw) ? (raw as T[]) : [];
}

// ─── Derived stats ───────────────────────────────────────────────────────────

/**
 * Compute phrasesStudied, phrasesMastered and categoryMastery from a review map
 * in a single O(n) pass.
 *
 * Lives here because `mergeCloudState` needs it: `stats` is derived from the
 * merged review and completion maps, not taken from either side's snapshot.
 * The store imports it for the same reason on its own write paths.
 */
export function computeMastery(reviews: Record<string, PhraseReviewData>): {
  studied: number;
  mastered: number;
  categoryMastery: Record<string, CategoryMastery>;
} {
  const allCards = Object.values(reviews);
  const studied = allCards.length;
  let mastered = 0;

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

// ─── Policy ──────────────────────────────────────────────────────────────────

/** How one field maps to, and merges from, the cloud row. */
export interface CloudBinding<K extends keyof PersistableState> {
  column: CloudColumn;
  /**
   * Push immediately instead of waiting out the debounce. Reserved for state
   * that costs money to get wrong — a subscription that fails to reach the
   * cloud is a user who paid and stayed locked out.
   *
   * Read by the push subscriber, which does not exist yet (PR2).
   */
  urgent: boolean;
  decode: (raw: unknown) => PersistableState[K];
  merge: (local: PersistableState[K], cloud: PersistableState[K]) => PersistableState[K];
}

/** What happens to one field of PersistableState. */
export interface FieldPolicy<K extends keyof PersistableState> {
  persist: boolean;
  clearOnSignOut: boolean;
  /** The value a sign-out wipes this field to. Required when clearOnSignOut. */
  reset?: () => PersistableState[K];
  cloud: CloudBinding<K> | null;
}

export type PolicyTable = { [K in keyof PersistableState]: FieldPolicy<K> };

/** Take the later of two ISO dates; neither side may move the date backwards. */
const laterISO = (a: string | null, b: string | null): string | null =>
  [a, b].filter(Boolean).sort().pop() ?? null;

/** Cloud value wins when present, otherwise keep local. */
const cloudWins = <T>(local: T, cloud: T): T => cloud ?? local;

/**
 * The single declaration of what happens to every durable field.
 *
 * The mapped type means adding a field to `PersistableState` without adding it
 * here will not compile.
 */
export const FIELD_POLICY: PolicyTable = {
  // ─── Auth & onboarding ─────────────────────────────────────────────────────
  user: {
    persist: true,
    clearOnSignOut: true,
    reset: () => null,
    cloud: {
      column: 'user_profile',
      urgent: false,
      decode: (raw) => (raw ?? null) as UserProfile | null,
      merge: cloudWins,
    },
  },
  clerkUserId: { persist: true, clearOnSignOut: true, reset: () => null, cloud: null },
  /**
   * Deliberately survives sign-out: a returning user lands on sign-in, not
   * onboarding. `deleteAccount` resets it explicitly — a deleted account has no
   * "returning".
   */
  hasOnboarded: { persist: true, clearOnSignOut: false, cloud: null },
  isAuthenticated: { persist: true, clearOnSignOut: true, reset: () => false, cloud: null },

  // ─── Subscription ──────────────────────────────────────────────────────────
  subscriptionStatus: {
    persist: true,
    clearOnSignOut: true,
    reset: () => 'free',
    cloud: {
      column: 'subscription_status',
      urgent: true,
      decode: (raw) => (raw ?? 'free') as SubscriptionStatus,
      merge: cloudWins,
    },
  },
  trialStartedAt: {
    persist: true,
    clearOnSignOut: true,
    reset: () => null,
    cloud: {
      column: 'trial_started_at',
      urgent: true,
      decode: (raw) => (raw ?? null) as string | null,
      merge: cloudWins,
    },
  },
  trialPlan: {
    persist: true,
    clearOnSignOut: true,
    reset: () => null,
    cloud: {
      column: 'trial_plan',
      urgent: true,
      decode: (raw) => (raw ?? null) as 'monthly' | 'yearly' | null,
      merge: cloudWins,
    },
  },

  // ─── UI preference ─────────────────────────────────────────────────────────
  /** A device preference, like the theme it is. Never cloud, never cleared. */
  themePreference: { persist: true, clearOnSignOut: false, cloud: null },

  // ─── Progress & learning ───────────────────────────────────────────────────
  /**
   * `merge` only reconciles the two independent counters. The mastery fields
   * and `scenariosCompleted` are overwritten by the derive pass in
   * `mergeCloudState`, because they are functions of the merged review and
   * completion maps rather than of either side's stats snapshot.
   */
  stats: {
    persist: true,
    clearOnSignOut: true,
    reset: () => ({ ...DEFAULT_USER_STATS }),
    cloud: {
      column: 'stats',
      urgent: false,
      decode: normalizeStats,
      merge: (local, cloud) => ({
        ...local,
        daysActive: Math.max(local.daysActive, cloud.daysActive),
        currentStreak: Math.max(local.currentStreak, cloud.currentStreak),
      }),
    },
  },
  /**
   * Union, like every other id list: a save made on either device survives. The
   * trade-off is that un-saving while offline can be undone by a cloud copy
   * that predates it — recoverable with one tap, where a lost save is silent.
   */
  savedPhrases: {
    persist: true,
    clearOnSignOut: true,
    reset: () => [],
    cloud: { column: 'saved_phrases', urgent: false, decode: asArray<string>, merge: mergeIds },
  },
  unlockedPhraseIds: {
    persist: true,
    clearOnSignOut: true,
    reset: () => [],
    cloud: { column: 'unlocked_phrase_ids', urgent: false, decode: asArray<string>, merge: mergeIds },
  },
  favoriteScenarios: { persist: true, clearOnSignOut: true, reset: () => [], cloud: null },
  completedScenarios: {
    persist: true,
    clearOnSignOut: true,
    reset: () => ({}),
    cloud: {
      column: 'completed_scenarios',
      urgent: false,
      decode: asRecord<ScenarioCompletion>,
      merge: mergeCompletions,
    },
  },
  /**
   * NOT cleared on sign-out, and that is a bug — signing into a second account
   * on the same device inherits the first user's Sentence Builder progress and
   * pushes it into their cloud row. Ported verbatim here so PR1 changes no
   * behaviour; PR2 flips this to `true` with a `reset`.
   */
  patternProgress: {
    persist: true,
    clearOnSignOut: false,
    cloud: {
      column: 'pattern_progress',
      urgent: false,
      decode: asRecord<PatternProgress>,
      merge: mergePatternProgress,
    },
  },
  /** Same account-bleed bug as `patternProgress`. Fixed in PR2. */
  secretEndingsEarned: {
    persist: true,
    clearOnSignOut: false,
    cloud: {
      column: 'secret_endings_earned',
      urgent: false,
      decode: asRecord<string>,
      merge: mergeSecretEndings,
    },
  },
  sceneProgress: { persist: true, clearOnSignOut: true, reset: () => ({}), cloud: null },
  /**
   * Follows the same "cannot go backwards" rule as the streak counters. Taking
   * the cloud's value outright would push the date back whenever this device
   * had practised more recently than its last successful push — precisely the
   * offline case. ISO dates compare correctly as strings.
   */
  lastActiveDate: {
    persist: true,
    clearOnSignOut: true,
    reset: () => null,
    cloud: {
      column: 'last_active_date',
      urgent: false,
      decode: (raw) => (raw ?? null) as string | null,
      merge: laterISO,
    },
  },
  streakFreezes: { persist: true, clearOnSignOut: true, reset: () => 0, cloud: null },
  dailyXP: {
    persist: true,
    clearOnSignOut: true,
    reset: () => ({ date: todayISO(), xp: 0 }),
    cloud: null,
  },
  phraseReviews: {
    persist: true,
    clearOnSignOut: true,
    reset: () => ({}),
    cloud: {
      column: 'phrase_reviews',
      urgent: false,
      decode: asRecord<PhraseReviewData>,
      merge: mergeReviews,
    },
  },
  journal: {
    persist: true,
    clearOnSignOut: true,
    reset: () => [],
    cloud: {
      column: 'journal',
      urgent: false,
      decode: asArray<JournalEntry>,
      merge: (local, cloud) => mergeJournal(local, cloud),
    },
  },
  milestones: {
    persist: true,
    clearOnSignOut: true,
    reset: freshMilestones,
    cloud: {
      column: 'milestones',
      urgent: false,
      decode: asArray<LearningMilestone>,
      merge: mergeMilestones,
    },
  },

  // ─── Notifications ─────────────────────────────────────────────────────────
  recentSessionHours: { persist: true, clearOnSignOut: true, reset: () => [], cloud: null },
  notificationsEnabled: { persist: true, clearOnSignOut: true, reset: () => false, cloud: null },

  // ─── Anonymous onboarding analytics ────────────────────────────────────────
  /**
   * Both deliberately survive sign-out AND account deletion. `analyticsEnabled`
   * is a device preference; `analyticsOnboardingSent` guards the install, not
   * the account. Nor is there anything for a deletion to erase: the row carries
   * no identifier, which is the whole point.
   */
  analyticsEnabled: { persist: true, clearOnSignOut: false, cloud: null },
  analyticsOnboardingSent: { persist: true, clearOnSignOut: false, cloud: null },
};

// ─── Derived views of the table ──────────────────────────────────────────────

const ALL_KEYS = Object.keys(FIELD_POLICY) as (keyof PersistableState)[];

/** Keys that survive an app restart. Feeds the store's `partialize`. */
export function persistedKeys(): (keyof PersistableState)[] {
  return ALL_KEYS.filter((k) => FIELD_POLICY[k].persist);
}

/** Keys that travel to the cloud. */
export function syncedKeys(): (keyof PersistableState)[] {
  return ALL_KEYS.filter((k) => FIELD_POLICY[k].cloud !== null);
}

/** Keys whose change should skip the debounce and push straight away. */
export function urgentKeys(): (keyof PersistableState)[] {
  return ALL_KEYS.filter((k) => FIELD_POLICY[k].cloud?.urgent === true);
}

/**
 * The patch a sign-out applies. Every field marked `clearOnSignOut` gets its
 * `reset` value; nothing else is touched.
 *
 * Ephemeral state (`activeScenarioState`, `communityStatsCache`, the sync
 * status fields) is not in the table and stays the store's business.
 */
export function clearedOnSignOut(): Partial<PersistableState> {
  const patch: Record<string, unknown> = {};
  for (const key of ALL_KEYS) {
    const policy = FIELD_POLICY[key];
    if (policy.clearOnSignOut && policy.reset) patch[key] = policy.reset();
  }
  return patch as Partial<PersistableState>;
}

// ─── Codecs ──────────────────────────────────────────────────────────────────

/**
 * Project local state onto a cloud row.
 *
 * `stats` is the one field this does not read straight off the table: it ships
 * as a complete blob so older app versions still read a full object, which
 * means recomputing the derived half at push time rather than trusting whatever
 * the store happens to be holding.
 */
export function toCloud(state: PersistableState): CloudUserData {
  const row: Record<string, unknown> = { schema_version: CURRENT_SCHEMA_VERSION };
  for (const key of ALL_KEYS) {
    const binding = FIELD_POLICY[key].cloud;
    if (binding) row[binding.column] = state[key];
  }
  row.stats = deriveStats(state);
  return row as unknown as CloudUserData;
}

/**
 * Decode a raw `user_data` row. Every column runs through its field's `decode`,
 * so a row created by anything other than `toCloud` — including one with a
 * present-but-null column — still produces a complete, typed shape.
 *
 * Rows written before `schema_version` existed have it null; that is treated as
 * version 1 and left for the caller to decide about.
 */
export function fromCloud(raw: Record<string, unknown>): CloudUserData {
  const row: Record<string, unknown> = {
    schema_version: (raw.schema_version as number | null) ?? 1,
  };
  for (const key of ALL_KEYS) {
    const binding = FIELD_POLICY[key].cloud;
    if (binding) row[binding.column] = binding.decode(raw[binding.column]);
  }
  return row as unknown as CloudUserData;
}

// ─── Merge ───────────────────────────────────────────────────────────────────

/**
 * Recompute the derived half of `stats` from the maps it is a function of.
 *
 * `daysActive` and `currentStreak` are the only genuinely independent counters
 * and are carried through untouched; everything else here is a view over
 * `phraseReviews` and `completedScenarios`.
 */
function deriveStats(state: Pick<PersistableState, 'stats' | 'phraseReviews' | 'completedScenarios'>): UserStats {
  const { studied, mastered, categoryMastery } = computeMastery(state.phraseReviews);
  return {
    daysActive: state.stats.daysActive,
    currentStreak: state.stats.currentStreak,
    phrasesStudied: studied,
    phrasesMastered: mastered,
    categoryMastery,
    scenariosCompleted: Object.keys(state.completedScenarios),
  };
}

/**
 * Reconcile a cloud row against local state and return the patch to apply.
 *
 * Two passes. First every field with a cloud binding runs its own merge rule —
 * all of them union-shaped, because **a merge must never lose a record**; the
 * only decision is which version to keep when both sides have one. Then a
 * derive pass recomputes `stats` from the merged maps, so the counters can
 * never disagree with the records they count.
 *
 * Callers must pass local state read *after* the network round-trip, not a
 * snapshot taken before it: the app keeps running while the request is in
 * flight, and merging against a stale snapshot drops exactly the write this
 * function exists to protect.
 */
export function mergeCloudState(
  local: PersistableState,
  cloud: CloudUserData,
): Partial<PersistableState> {
  const patch: Record<string, unknown> = {};

  for (const key of ALL_KEYS) {
    const binding = FIELD_POLICY[key].cloud;
    if (!binding) continue;
    // The loop erases the per-key link between `local[key]`, the column's type
    // and `merge`'s parameters — the table's own declarations are what keep
    // them aligned, and they are checked at the point of declaration above.
    const mergeFn = binding.merge as (a: unknown, b: unknown) => unknown;
    patch[key] = mergeFn(local[key], (cloud as unknown as Record<string, unknown>)[binding.column]);
  }

  patch.stats = deriveStats({
    stats: patch.stats as UserStats,
    phraseReviews: patch.phraseReviews as Record<string, PhraseReviewData>,
    completedScenarios: patch.completedScenarios as Record<string, ScenarioCompletion>,
  });

  return patch as Partial<PersistableState>;
}
