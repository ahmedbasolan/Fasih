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
} from '../syncedProgress';
import type { CloudUserData } from '../syncedProgress';
import type { PersistableState, PhraseReviewData } from '../../types';
import { DEFAULT_USER_STATS } from '../../types';
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
    themePreference: 'system',
    stats: { ...DEFAULT_USER_STATS },
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
    expect(urgentKeys().sort()).toEqual(['subscriptionStatus', 'trialPlan', 'trialStartedAt']);
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
    expect(patch.stats).toEqual(DEFAULT_USER_STATS);
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

  it('does NOT yet clear patternProgress or secretEndingsEarned', () => {
    // Documents the account-bleed bug as it stands today: signing into a second
    // account on one device inherits the first user's Sentence Builder progress
    // and secret endings. PR1 ports behaviour verbatim; PR2 fixes it, and this
    // expectation flips to `true` then.
    const patch = clearedOnSignOut();
    expect('patternProgress' in patch).toBe(false);
    expect('secretEndingsEarned' in patch).toBe(false);
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

  it('recomputes the derived half of stats rather than trusting the store', () => {
    // A stale stats blob must not reach the cloud.
    const row = toCloud(
      localState({
        phraseReviews: { g1: card('g1'), g2: card('g2') },
        completedScenarios: { 'first-morning': { endingType: 'success', date: '2026-01-01' } },
        stats: { ...DEFAULT_USER_STATS, phrasesStudied: 999, scenariosCompleted: [] },
      }),
    );
    expect(row.stats.phrasesStudied).toBe(2);
    expect(row.stats.scenariosCompleted).toEqual(['first-morning']);
  });
});

describe('fromCloud', () => {
  it('round-trips a row produced by toCloud', () => {
    const state = localState({
      savedPhrases: ['g1', 'g2'],
      unlockedPhraseIds: ['g3'],
      phraseReviews: { g1: card('g1') },
      lastActiveDate: '2026-05-01',
      subscriptionStatus: 'subscribed',
    });
    const row = toCloud(state);
    expect(fromCloud(row as unknown as Record<string, unknown>)).toEqual(row);
  });

  it('survives a row of empty JSONB defaults', () => {
    // `NOT NULL DEFAULT '{}'` means {} is ordinary for any row not written by
    // toCloud. A bare read used to crash on the first screen after sign-in.
    const decoded = fromCloud({ stats: {}, phrase_reviews: {}, journal: {} });
    expect(decoded.stats).toEqual(DEFAULT_USER_STATS);
    expect(decoded.phrase_reviews).toEqual({});
    expect(decoded.journal).toEqual([]);
  });

  it('survives present-but-null columns', () => {
    // A null survives a spread and crashes exactly like a missing key does.
    const decoded = fromCloud({
      stats: { scenariosCompleted: null, daysActive: null },
      saved_phrases: null,
      milestones: null,
      subscription_status: null,
    });
    expect(decoded.stats.scenariosCompleted).toEqual([]);
    expect(decoded.stats.daysActive).toBe(0);
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

  it('derives stats from the merged maps, not from either snapshot', () => {
    // This is the pass that makes the counters incapable of disagreeing with
    // the records they count.
    const patch = mergeCloudState(
      localState({
        phraseReviews: { g1: card('g1') },
        stats: { ...DEFAULT_USER_STATS, phrasesStudied: 1 },
      }),
      cloudRow({
        phrase_reviews: { g2: card('g2') },
        completed_scenarios: { 'first-morning': { endingType: 'success', date: '2026-01-01' } },
        stats: { ...DEFAULT_USER_STATS, phrasesStudied: 1, scenariosCompleted: [] },
      }),
    );
    expect(patch.stats!.phrasesStudied).toBe(2);
    expect(patch.stats!.scenariosCompleted).toEqual(['first-morning']);
  });

  it('takes the higher of the two independent counters', () => {
    // Neither daysActive nor currentStreak can legitimately go backwards.
    const patch = mergeCloudState(
      localState({ stats: { ...DEFAULT_USER_STATS, daysActive: 9, currentStreak: 2 } }),
      cloudRow({ stats: { ...DEFAULT_USER_STATS, daysActive: 4, currentStreak: 7 } }),
    );
    expect(patch.stats!.daysActive).toBe(9);
    expect(patch.stats!.currentStreak).toBe(7);
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
