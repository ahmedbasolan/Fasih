/**
 * A sync request that outlives the session that started it must not write into
 * the next one. signOut clears the store while a pull or push can still be in
 * flight on a slow network; when that request resolves, the store already
 * belongs to nobody (or to the next account), and anything written into it
 * would reach the next account's row on its next push.
 *
 * The push side has a second rule: a push is a full-row upsert, and the merge
 * rules that protect data run on pull. So nothing is pushed before the session
 * has pulled.
 */
import { CURRENT_SCHEMA_VERSION, pullProgress, pushProgress, type CloudUserData } from '../../lib/syncService';
import { useAppStore } from '../useAppStore';

// jest.mock calls are hoisted above the imports by babel-jest.
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
  removeItem: jest.fn(async () => undefined),
}));
// The real syncService, with only the network calls replaced — so exports and
// CURRENT_SCHEMA_VERSION can't drift from what the store actually imports.
// supabase and analytics are stubbed only so the real module can load in jest
// (a live client; Sentry's ESM build).
jest.mock('../../lib/supabase', () => ({ supabase: {} }));
jest.mock('../../lib/analytics', () => ({ reportServiceError: jest.fn() }));
jest.mock('../../lib/syncService', () => ({
  ...jest.requireActual('../../lib/syncService'),
  pushProgress: jest.fn(),
  pullProgress: jest.fn(),
}));
jest.mock('../../lib/purchases', () => ({
  configurePurchases: jest.fn(),
  loginPurchasesUser: jest.fn(),
  logoutPurchasesUser: jest.fn(async () => undefined),
  getEntitlementStatus: jest.fn(),
  purchasePlan: jest.fn(),
  restorePurchases: jest.fn(),
  presentPaywallIfNeeded: jest.fn(),
  presentPaywall: jest.fn(),
  presentCustomerCenter: jest.fn(),
  addCustomerInfoListener: jest.fn(),
}));
jest.mock('../../lib/notifications', () => ({
  requestNotificationPermission: jest.fn(),
  scheduleDailyReminder: jest.fn(),
  scheduleReEngagementIfNeeded: jest.fn(),
  scheduleStreakRiskIfNeeded: jest.fn(),
  cancelAllNotifications: jest.fn(async () => undefined),
  derivePreferredHour: jest.fn(),
}));
jest.mock('../../lib/onboardingAnalytics', () => ({
  recordOnboardingSelection: jest.fn(),
}));

const mockPull = pullProgress as jest.MockedFunction<typeof pullProgress>;
const mockPush = pushProgress as jest.MockedFunction<typeof pushProgress>;

type PullResult = Awaited<ReturnType<typeof pullProgress>>;
type PushResult = Awaited<ReturnType<typeof pushProgress>>;

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

/** Lets a promise chain the test can't await (a push the pull released) run. */
const settle = () => new Promise((r) => setTimeout(r, 0));

const previousLearnerRow: CloudUserData = {
  schema_version: CURRENT_SCHEMA_VERSION,
  user_profile: {
    name: 'Learner A',
    mode: 'career',
    role: 'nurse',
    goals: [],
    plan: 'yearly',
    onboardingChecklist: [],
    dailyGoalXP: 30,
  },
  stats: {
    daysActive: 40,
    currentStreak: 12,
    phrasesMastered: 0,
    phrasesStudied: 0,
    scenariosCompleted: [],
    categoryMastery: {},
  },
  phrase_reviews: {},
  completed_scenarios: { 'scenario-a': { endingType: 'good', date: '2026-09-01' } },
  pattern_progress: {},
  secret_endings_earned: { 'scenario-a': 'The Secret' },
  endings_found: { 'scenario-a': ['ending-1'] },
  scenario_runs: { 'scenario-a': 3 },
  saved_phrases: ['phrase-a'],
  unlocked_phrase_ids: ['phrase-a'],
  milestones: [],
  journal: [],
  last_active_date: '2026-09-13',
  subscription_status: 'subscribed',
  trial_started_at: null,
  trial_plan: null,
};

const signIn = (userId: string) => useAppStore.getState().setClerkUserId(userId);

/** Sign in and finish the session's first pull, which pushes wait for. */
async function signInAndPull(userId: string) {
  signIn(userId);
  mockPull.mockResolvedValueOnce({ data: null, error: null });
  await useAppStore.getState().syncFromCloud();
}

beforeEach(async () => {
  mockPull.mockReset();
  mockPush.mockReset();
  // Defaults, so a request a test didn't plan for resolves and fails an
  // assertion rather than crashing the run on an undefined result.
  mockPull.mockResolvedValue({ data: null, error: null });
  mockPush.mockResolvedValue({ error: null });
  await useAppStore.getState().signOut();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('syncFromCloud across a sign-out', () => {
  it('writes nothing from a pull that resolves after sign-out', async () => {
    const pull = deferred<PullResult>();
    mockPull.mockReturnValueOnce(pull.promise);

    signIn('user_a');
    const syncing = useAppStore.getState().syncFromCloud();
    await useAppStore.getState().signOut();
    signIn('user_b');

    pull.resolve({ data: previousLearnerRow, error: null });
    await syncing;

    const s = useAppStore.getState();
    expect(s.clerkUserId).toBe('user_b');
    expect(s.user).toBeNull();
    expect(s.completedScenarios).toEqual({});
    expect(s.secretEndingsEarned).toEqual({});
    expect(s.savedPhrases).toEqual([]);
    expect(s.subscriptionStatus).toBe('free');
    expect(s.stats.currentStreak).toBe(0);
    expect(s.lastSyncedAt).toBeNull();
    expect(s.isSyncing).toBe(false);
  });

  it('drops it even when the same learner signs straight back in — that session pulls for itself', async () => {
    const pull = deferred<PullResult>();
    mockPull.mockReturnValueOnce(pull.promise);

    signIn('user_a');
    const syncing = useAppStore.getState().syncFromCloud();
    await useAppStore.getState().signOut();
    signIn('user_a');

    pull.resolve({ data: previousLearnerRow, error: null });
    await syncing;

    expect(useAppStore.getState().user).toBeNull();
    expect(useAppStore.getState().completedScenarios).toEqual({});
  });

  it('does not surface the previous session’s pull error', async () => {
    const pull = deferred<PullResult>();
    mockPull.mockReturnValueOnce(pull.promise);

    signIn('user_a');
    const syncing = useAppStore.getState().syncFromCloud();
    await useAppStore.getState().signOut();

    pull.resolve({ data: null, error: 'JWT expired' });
    await syncing;

    expect(useAppStore.getState().lastSyncError).toBeNull();
    expect(useAppStore.getState().isSyncing).toBe(false);
  });

  it('a stale pull does not clear the next session’s isSyncing', async () => {
    const pullA = deferred<PullResult>();
    const pullB = deferred<PullResult>();
    mockPull.mockReturnValueOnce(pullA.promise).mockReturnValueOnce(pullB.promise);

    signIn('user_a');
    const syncingA = useAppStore.getState().syncFromCloud();
    await useAppStore.getState().signOut();
    signIn('user_b');
    const syncingB = useAppStore.getState().syncFromCloud();

    pullA.resolve({ data: previousLearnerRow, error: null });
    await syncingA;
    expect(useAppStore.getState().isSyncing).toBe(true);

    pullB.resolve({ data: null, error: null });
    await syncingB;
    expect(useAppStore.getState().isSyncing).toBe(false);
  });

  it('a pull that throws still clears isSyncing and reports the error', async () => {
    mockPull.mockRejectedValueOnce(new Error('Network request failed'));

    signIn('user_a');
    await useAppStore.getState().syncFromCloud();

    expect(useAppStore.getState().isSyncing).toBe(false);
    expect(useAppStore.getState().lastSyncError).toBe('Network request failed');
  });

  it('still merges for the learner who is signed in', async () => {
    mockPull.mockResolvedValueOnce({ data: previousLearnerRow, error: null });

    signIn('user_a');
    await useAppStore.getState().syncFromCloud();

    const s = useAppStore.getState();
    expect(s.user?.name).toBe('Learner A');
    expect(s.completedScenarios).toEqual(previousLearnerRow.completed_scenarios);
    expect(s.isSyncing).toBe(false);
  });
});

describe('syncToCloud before the session has pulled', () => {
  it('pulls first, then pushes the merged store — never the local one over the row', async () => {
    const pull = deferred<PullResult>();
    mockPull.mockReturnValueOnce(pull.promise);
    mockPush.mockResolvedValue({ error: null });

    signIn('user_a');
    useAppStore.setState({ savedPhrases: ['phrase-local'] });
    await useAppStore.getState().syncToCloud();

    expect(mockPush).not.toHaveBeenCalled();
    expect(mockPull).toHaveBeenCalledWith('user_a');

    pull.resolve({ data: previousLearnerRow, error: null });
    await settle();

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('user_a', expect.objectContaining({
      saved_phrases: expect.arrayContaining(['phrase-local', 'phrase-a']),
      completed_scenarios: previousLearnerRow.completed_scenarios,
    }));
  });

  it('waits for a pull already in flight instead of starting another', async () => {
    const pull = deferred<PullResult>();
    mockPull.mockReturnValueOnce(pull.promise);
    mockPush.mockResolvedValue({ error: null });

    signIn('user_a');
    const syncing = useAppStore.getState().syncFromCloud();
    await useAppStore.getState().syncToCloud();

    pull.resolve({ data: null, error: null });
    await syncing;
    await settle();

    expect(mockPull).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledTimes(1);
  });
});

describe('isSyncing within one session', () => {
  it('stays true until the last request in flight returns', async () => {
    await signInAndPull('user_a');
    const first = deferred<PushResult>();
    const second = deferred<PushResult>();
    mockPush.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);

    const pushingFirst = useAppStore.getState().syncToCloud();
    const pushingSecond = useAppStore.getState().syncToCloud();

    first.resolve({ error: null });
    await pushingFirst;
    expect(useAppStore.getState().isSyncing).toBe(true);

    second.resolve({ error: null });
    await pushingSecond;
    expect(useAppStore.getState().isSyncing).toBe(false);
  });
});

describe('syncToCloud across a sign-out', () => {
  it('does not surface the previous session’s push result', async () => {
    await signInAndPull('user_a');
    const push = deferred<PushResult>();
    mockPush.mockReturnValueOnce(push.promise);

    const syncing = useAppStore.getState().syncToCloud();
    await useAppStore.getState().signOut();

    push.resolve({ error: 'new row violates row-level security policy' });
    await syncing;

    // The payload was snapshotted with its owner, so it can only ever reach A's row.
    expect(mockPush).toHaveBeenCalledWith('user_a', expect.anything());
    expect(useAppStore.getState().lastSyncError).toBeNull();
    expect(useAppStore.getState().isSyncing).toBe(false);
  });

  it('does not surface a push that throws after sign-out', async () => {
    await signInAndPull('user_a');
    const push = deferred<PushResult>();
    mockPush.mockReturnValueOnce(push.promise);

    const syncing = useAppStore.getState().syncToCloud();
    await useAppStore.getState().signOut();

    push.reject(new Error('Network request failed'));
    await syncing;

    expect(useAppStore.getState().lastSyncError).toBeNull();
    expect(useAppStore.getState().isSyncing).toBe(false);
  });
});

describe('a scheduled push across a sign-out', () => {
  it('is cancelled by signOut — it never fires into the next account', async () => {
    await signInAndPull('user_a');
    jest.useFakeTimers();

    useAppStore.getState().toggleSavedPhrase('phrase-a');
    await useAppStore.getState().signOut();
    signIn('user_b');
    await jest.advanceTimersByTimeAsync(5_000);

    expect(mockPush).not.toHaveBeenCalled();
    expect(mockPull).toHaveBeenCalledTimes(1); // signInAndPull's own
  });

  it('is sent at once by flushScheduledSync, and only once', async () => {
    await signInAndPull('user_a');
    jest.useFakeTimers();

    useAppStore.getState().toggleSavedPhrase('phrase-a');
    await useAppStore.getState().flushScheduledSync();
    await jest.advanceTimersByTimeAsync(5_000);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('user_a', expect.objectContaining({ saved_phrases: ['phrase-a'] }));
  });
});
