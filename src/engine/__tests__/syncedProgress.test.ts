/**
 * Tests for the synced-progress policy table and its codecs.
 *
 * The seven merge atoms are covered directly in syncMerge.test.ts — they are an
 * internal seam of this module, and their invariants ("never un-reach a
 * milestone", "never regress correctBuilds") are cheapest to pin there. What
 * had never been tested, and is tested here, is the *composition*: the table
 * itself, the codecs driven by it, and mergeCloudState's two passes.
 */

import {
  FIELD_POLICY,
  CURRENT_SCHEMA_VERSION,
  persistedKeys,
  syncedKeys,
  urgentKeys,
  clearedOnSignOut,
  toCloud,
  fromCloud,
  mergeCloudState,
  computeMastery,
  deriveStats,
  changedSyncedKeys,
  hasUrgentChange,
  syncedFingerprint,
} from '../syncedProgress';
import type { CloudUserData } from '../syncedProgress';
import type { PersistableState, PhraseReviewData } from '../../types';
import { DEFAULT_USER_STATS, DEFAULT_COUNTERS } from '../../types';
import { freshMilestones } from '../../constants/milestones';

// ─── Fixtures ────────────────────────────────────────────────────────────────

function card(phraseId: string, over: Partial<PhraseReviewData> = {}): PhraseReviewData {
  return {
    phraseId,
    lastReviewed: '2026-01-01',
    nextReview: '2026-01-02',
    interval: 1,
    ease: 2.5,
    correct: 1,
    incorrect: 0,
    ...over,
  };
}

function localState(over: Partial<PersistableState> = {}): PersistableState {
  return {
    user: null,
    clerkUserId: null,
    hasOnboarded: false,
    isAuthenticated: false,
    subscriptionStatus: 'free',
    trialStartedAt: null,
    trialPlan: null,
    simulatedEntitlement: false,
    themePreference: 'system',
    counters: { ...DEFAULT_COUNTERS },
    savedPhrases: [],
    unlockedPhraseIds: [],
    favoriteScenarios: [],
    completedScenarios: {},
    patternProgress: {},
    secretEndingsEarned: {},
    sceneProgress: {},
    lastActiveDate: null,
    streakFreezes: 0,
    dailyXP: { date: '2026-01-01', xp: 0 },
    phraseReviews: {},
    journal: [],
    milestones: freshMilestones(),
    recentSessionHours: [],
    notificationsEnabled: false,
    analyticsEnabled: true,
    analyticsOnboardingSent: false,
    ...over,
  };
}

function cloudRow(over: Partial<CloudUserData> = {}): CloudUserData {
  return {
    schema_version: CURRENT_SCHEMA_VERSION,
    user_profile: null,
    stats: { ...DEFAULT_USER_STATS },
    phrase_reviews: {},
    completed_scenarios: {},
    pattern_progress: {},
    secret_endings_earned: {},
    saved_phrases: [],
    unlocked_phrase_ids: [],
    milestones: [],
    journal: [],
    last_active_date: null,
    subscription_status: 'free',
    trial_started_at: null,
    trial_plan: null,
    ...over,
  };
}

// ─── The table ───────────────────────────────────────────────────────────────

describe('FIELD_POLICY', () => {
  // The mapped type already makes a missing key a compile error. These cover
  // what the type cannot express.

  it('gives every synced field a column and a merge rule', () => {
    for (const key of syncedKeys()) {
      const binding = FIELD_POLICY[key].cloud;
      expect(binding).not.toBeNull();
      expect(typeof binding!.column).toBe('string');
      expect(typeof binding!.decode).toBe('function');
      expect(typeof binding!.merge).toBe('function');
    }
  });

  it('never maps two fields to the same column', () => {
    const columns = syncedKeys().map((k) => FIELD_POLICY[k].cloud!.column);
    expect(new Set(columns).size).toBe(columns.length);
  });

  it('gives every cleared field a reset value', () => {
    // Without this a sign-out would silently leave the field untouched, which
    // is the shape of the patternProgress account-bleed bug.
    for (const key of Object.keys(FIELD_POLICY) as (keyof PersistableState)[]) {
      if (FIELD_POLICY[key].clearOnSignOut) {
        expect(typeof FIELD_POLICY[key].reset).toBe('function');
      }
    }
  });

  it('marks exactly the subscription fields urgent', () => {
    // Money state must not wait out the debounce.
    expect([...urgentKeys()].sort()).toEqual(['subscriptionStatus', 'trialPlan', 'trialStartedAt']);
  });

  it('persists every field it declares', () => {
    // No durable field is currently memory-only; if that changes, this is the
    // test to update deliberately rather than discover in production.
    expect(persistedKeys().length).toBe(Object.keys(FIELD_POLICY).length);
  });
});

describe('clearedOnSignOut', () => {
  it('wipes the learner account fields', () => {
    const patch = clearedOnSignOut();
    expect(patch.user).toBeNull();
    expect(patch.clerkUserId).toBeNull();
    expect(patch.isAuthenticated).toBe(false);
    expect(patch.phraseReviews).toEqual({});
    expect(patch.completedScenarios).toEqual({});
    expect(patch.counters).toEqual(DEFAULT_COUNTERS);
    expect(patch.subscriptionStatus).toBe('free');
  });

  it('leaves device preferences and the onboarding flag alone', () => {
    // hasOnboarded survives so a returning user lands on sign-in, not
    // onboarding. The analytics pair guards the install, not the account.
    const patch = clearedOnSignOut();
    expect('hasOnboarded' in patch).toBe(false);
    expect('themePreference' in patch).toBe(false);
    expect('analyticsEnabled' in patch).toBe(false);
    expect('analyticsOnboardingSent' in patch).toBe(false);
  });

  it('clears patternProgress and secretEndingsEarned — the account bleed', () => {
    // These two were missing from the hand-written sign-out list, so signing
    // into a second account on one device inherited the first user's Sentence
    // Builder progress and secret endings, then pushed them into their row.
    const patch = clearedOnSignOut();
    expect(patch.patternProgress).toEqual({});
    expect(patch.secretEndingsEarned).toEqual({});
  });

  it('clears the simulated-entitlement flag', () => {
    // Otherwise a dev device would refuse to sync for whoever signs in next.
    expect(clearedOnSignOut().simulatedEntitlement).toBe(false);
  });
});

// ─── Persisted key set ───────────────────────────────────────────────────────

describe('persistedKeys', () => {
  it('matches the exact set that was persisted before the table owned it', () => {
    // Guard against silent data loss. `partialize` is now derived from
    // FIELD_POLICY, so a policy edit that drops a field would quietly stop
    // persisting it and users would lose that data on their next launch with
    // no error anywhere. This list is the pre-refactor `partialize` literal
    // plus simulatedEntitlement; update it only deliberately.
    expect([...persistedKeys()].sort()).toEqual(
      [
        'analyticsEnabled',
        'analyticsOnboardingSent',
        'clerkUserId',
        'completedScenarios',
        'dailyXP',
        'favoriteScenarios',
        'hasOnboarded',
        'isAuthenticated',
        'journal',
        'lastActiveDate',
        'milestones',
        'notificationsEnabled',
        'patternProgress',
        'phraseReviews',
        'recentSessionHours',
        'savedPhrases',
        'sceneProgress',
        'secretEndingsEarned',
        'simulatedEntitlement',
        'counters',
        'streakFreezes',
        'subscriptionStatus',
        'themePreference',
        'trialPlan',
        'trialStartedAt',
        'unlockedPhraseIds',
        'user',
      ].sort(),
    );
  });
});

// ─── Change detection ────────────────────────────────────────────────────────

describe('changedSyncedKeys', () => {
  it('sees a replaced synced field', () => {
    const a = localState();
    const b = { ...a, phraseReviews: { g1: card('g1') } };
    expect(changedSyncedKeys(a, b)).toEqual(['phraseReviews']);
  });

  it('ignores a changed device-local field', () => {
    // Changing a favourite must not cost a network round-trip.
    const a = localState();
    const b = { ...a, favoriteScenarios: ['x'], themePreference: 'dark' as const };
    expect(changedSyncedKeys(a, b)).toEqual([]);
  });

  it('reports nothing when nothing moved', () => {
    const a = localState();
    expect(changedSyncedKeys(a, { ...a })).toEqual([]);
  });
});

describe('hasUrgentChange', () => {
  it('is true for a subscription change', () => {
    const a = localState();
    expect(hasUrgentChange(a, { ...a, subscriptionStatus: 'subscribed' })).toBe(true);
  });

  it('is false for ordinary learning progress', () => {
    // A rated card can wait out the debounce; a purchase cannot.
    const a = localState();
    expect(hasUrgentChange(a, { ...a, phraseReviews: { g1: card('g1') } })).toBe(false);
  });
});

describe('syncedFingerprint', () => {
  it('is equal for two payloads built from the same state', () => {
    const s = localState({ savedPhrases: ['g1'], phraseReviews: { g1: card('g1') } });
    expect(syncedFingerprint(toCloud(s))).toBe(syncedFingerprint(toCloud(s)));
  });

  it('differs once a synced field changes', () => {
    const s = localState();
    const before = syncedFingerprint(toCloud(s));
    expect(syncedFingerprint(toCloud({ ...s, savedPhrases: ['g1'] }))).not.toBe(before);
  });

  it('is unchanged by a device-local field', () => {
    // The whole point of the comparison: a favourite toggle must not cost a push.
    const s = localState();
    expect(syncedFingerprint(toCloud({ ...s, favoriteScenarios: ['x'] })))
      .toBe(syncedFingerprint(toCloud(s)));
  });
});

// ─── Codecs ──────────────────────────────────────────────────────────────────

describe('toCloud', () => {
  it('stamps the current schema version', () => {
    expect(toCloud(localState()).schema_version).toBe(CURRENT_SCHEMA_VERSION);
  });

  it('maps every synced field onto its column', () => {
    const row = toCloud(localState({ savedPhrases: ['g1'], lastActiveDate: '2026-05-01' }));
    expect(row.saved_phrases).toEqual(['g1']);
    expect(row.last_active_date).toBe('2026-05-01');
  });

  it('omits device-local fields', () => {
    const row = toCloud(localState({ favoriteScenarios: ['x'], streakFreezes: 3 }));
    expect(row).not.toHaveProperty('favoriteScenarios');
    expect(row).not.toHaveProperty('streak_freezes');
  });

  it('writes a full stats blob, derived, so older clients read a whole object', () => {
    // The column still carries every field; the derived half is recomputed at
    // push time rather than taken from whatever the store happens to hold.
    const row = toCloud(
      localState({
        counters: { daysActive: 4, currentStreak: 2 },
        phraseReviews: { g1: card('g1'), g2: card('g2') },
        completedScenarios: { 'first-morning': { endingType: 'success', date: '2026-01-01' } },
      }),
    );
    expect(row.stats.phrasesStudied).toBe(2);
    expect(row.stats.scenariosCompleted).toEqual(['first-morning']);
    expect(row.stats.daysActive).toBe(4);
    expect(row.stats.currentStreak).toBe(2);
  });
});

describe('fromCloud', () => {
  it('round-trips every column except the derived half of stats', () => {
    const state = localState({
      counters: { daysActive: 3, currentStreak: 1 },
      savedPhrases: ['g1', 'g2'],
      unlockedPhraseIds: ['g3'],
      phraseReviews: { g1: card('g1') },
      lastActiveDate: '2026-05-01',
      subscriptionStatus: 'subscribed',
    });
    const row = toCloud(state);
    const decoded = fromCloud(row as unknown as Record<string, unknown>);

    expect({ ...decoded, stats: undefined }).toEqual({ ...row, stats: undefined });
    // stats narrows on the way back: only the two counters are read out of it.
    expect(decoded.stats).toEqual({ daysActive: 3, currentStreak: 1 });
  });

  it('survives a row of empty JSONB defaults', () => {
    // `NOT NULL DEFAULT '{}'` means {} is ordinary for any row not written by
    // toCloud. A bare read used to crash on the first screen after sign-in.
    const decoded = fromCloud({ stats: {}, phrase_reviews: {}, journal: {} });
    expect(decoded.stats).toEqual(DEFAULT_COUNTERS);
    expect(decoded.phrase_reviews).toEqual({});
    expect(decoded.journal).toEqual([]);
  });

  it('survives present-but-null columns', () => {
    // A null survives a spread and crashes exactly like a missing key does.
    const decoded = fromCloud({
      stats: { daysActive: null, currentStreak: null },
      saved_phrases: null,
      milestones: null,
      subscription_status: null,
    });
    expect(decoded.stats.daysActive).toBe(0);
    expect(decoded.stats.currentStreak).toBe(0);
    expect(decoded.saved_phrases).toEqual([]);
    expect(decoded.milestones).toEqual([]);
    expect(decoded.subscription_status).toBe('free');
  });

  it('treats a missing schema_version as version 1', () => {
    expect(fromCloud({}).schema_version).toBe(1);
  });
});

// ─── The merge ───────────────────────────────────────────────────────────────

describe('mergeCloudState', () => {
  it('keeps records that exist only locally — the offline-study case', () => {
    const patch = mergeCloudState(
      localState({ phraseReviews: { g1: card('g1') } }),
      cloudRow(),
    );
    expect(Object.keys(patch.phraseReviews!)).toEqual(['g1']);
  });

  it('keeps records that exist only in the cloud — the reinstall case', () => {
    const patch = mergeCloudState(
      localState(),
      cloudRow({ phrase_reviews: { g2: card('g2') } }),
    );
    expect(Object.keys(patch.phraseReviews!)).toEqual(['g2']);
  });

  it('unions both sides rather than letting either win', () => {
    const patch = mergeCloudState(
      localState({ phraseReviews: { g1: card('g1') }, savedPhrases: ['a'] }),
      cloudRow({ phrase_reviews: { g2: card('g2') }, saved_phrases: ['b'] }),
    );
    expect(Object.keys(patch.phraseReviews!).sort()).toEqual(['g1', 'g2']);
    expect(patch.savedPhrases!.sort()).toEqual(['a', 'b']);
  });

  it('leaves no stats in the patch — they are not state any more', () => {
    // Nothing to reconcile: phrasesStudied and friends are views over the maps
    // the merge just produced, so useStats() reads them straight off those.
    const patch = mergeCloudState(
      localState({ phraseReviews: { g1: card('g1') } }),
      cloudRow({ phrase_reviews: { g2: card('g2') } }),
    );
    expect('stats' in patch).toBe(false);
  });

  it('takes the higher of the two independent counters', () => {
    // Neither daysActive nor currentStreak can legitimately go backwards, and
    // neither can be reconstructed from anything else, so they are stored.
    const patch = mergeCloudState(
      localState({ counters: { daysActive: 9, currentStreak: 2 } }),
      cloudRow({ stats: { ...DEFAULT_USER_STATS, daysActive: 4, currentStreak: 7 } }),
    );
    expect(patch.counters).toEqual({ daysActive: 9, currentStreak: 7 });
  });

  it('never moves lastActiveDate backwards', () => {
    // The offline case: this device practised more recently than its last push.
    const patch = mergeCloudState(
      localState({ lastActiveDate: '2026-05-10' }),
      cloudRow({ last_active_date: '2026-05-01' }),
    );
    expect(patch.lastActiveDate).toBe('2026-05-10');
  });

  it('takes the cloud lastActiveDate when it is the later one', () => {
    const patch = mergeCloudState(
      localState({ lastActiveDate: '2026-05-01' }),
      cloudRow({ last_active_date: '2026-05-10' }),
    );
    expect(patch.lastActiveDate).toBe('2026-05-10');
  });

  it('keeps local values when the cloud has none', () => {
    const patch = mergeCloudState(
      localState({ subscriptionStatus: 'trial', trialStartedAt: '2026-05-01' }),
      // A row whose optional scalars are absent, as an older row's would be.
      cloudRow({ subscription_status: null as never, trial_started_at: null }),
    );
    expect(patch.subscriptionStatus).toBe('trial');
    expect(patch.trialStartedAt).toBe('2026-05-01');
  });

  it('leaves device-local fields out of the patch entirely', () => {
    const patch = mergeCloudState(
      localState({ favoriteScenarios: ['x'], streakFreezes: 2, themePreference: 'dark' }),
      cloudRow(),
    );
    expect('favoriteScenarios' in patch).toBe(false);
    expect('streakFreezes' in patch).toBe(false);
    expect('themePreference' in patch).toBe(false);
  });

  it('does not mutate its inputs', () => {
    const local = localState({ phraseReviews: { g1: card('g1') }, savedPhrases: ['a'] });
    const cloud = cloudRow({ phrase_reviews: { g2: card('g2') }, saved_phrases: ['b'] });
    const localCopy = JSON.parse(JSON.stringify(local));
    const cloudCopy = JSON.parse(JSON.stringify(cloud));
    mergeCloudState(local, cloud);
    expect(local).toEqual(localCopy);
    expect(cloud).toEqual(cloudCopy);
  });

  it('patches exactly the synced keys plus nothing else', () => {
    const patch = mergeCloudState(localState(), cloudRow());
    expect(Object.keys(patch).sort()).toEqual([...syncedKeys()].sort());
  });
});

// ─── Derived stats ───────────────────────────────────────────────────────────

describe('deriveStats', () => {
  it('carries the two stored counters through untouched', () => {
    const s = deriveStats(localState({ counters: { daysActive: 12, currentStreak: 5 } }));
    expect(s.daysActive).toBe(12);
    expect(s.currentStreak).toBe(5);
  });

  it('derives scenariosCompleted from the completion map', () => {
    const s = deriveStats(
      localState({
        completedScenarios: {
          'first-morning': { endingType: 'success', date: '2026-01-01' },
          'cafe-friends': { endingType: 'mixed', date: '2026-01-02' },
        },
      }),
    );
    expect(s.scenariosCompleted.sort()).toEqual(['cafe-friends', 'first-morning']);
  });

  it('derives phrasesStudied from the review map', () => {
    const s = deriveStats(localState({ phraseReviews: { g1: card('g1'), g2: card('g2') } }));
    expect(s.phrasesStudied).toBe(2);
  });

  it('cannot disagree with the maps, however stale the caller', () => {
    // The whole point of the split. There is no stored copy to go stale: the
    // three write paths that each recomputed their own slice are gone, and a
    // cloud row's derived half is never read.
    const base = localState({ phraseReviews: { g1: card('g1') } });
    const after = { ...base, phraseReviews: { ...base.phraseReviews, g2: card('g2') } };
    expect(deriveStats(base).phrasesStudied).toBe(1);
    expect(deriveStats(after).phrasesStudied).toBe(2);
  });
});

describe('computeMastery', () => {
  it('counts a card as mastered at 3+ correct and >=80% accuracy', () => {
    const { mastered } = computeMastery({
      good: card('g1', { correct: 4, incorrect: 1 }),   // 80%
      weak: card('g2', { correct: 3, incorrect: 2 }),   // 60%
      few: card('g3', { correct: 2, incorrect: 0 }),    // 100% but only 2
    });
    expect(mastered).toBe(1);
  });

  it('ignores review cards whose phrase no longer exists', () => {
    const { studied, categoryMastery } = computeMastery({ ghost: card('no-such-phrase') });
    expect(studied).toBe(1); // still studied
    // …but contributes to no category
    expect(Object.values(categoryMastery).every((c) => c.phrasesStudied === 0)).toBe(true);
  });
});
