/**
 * A sync request that outlives the session that started it must not write into
 * the next one. signOut clears the store while a pull or push can still be in
 * flight on a slow network; when that request resolves, the store already
 * belongs to nobody (or to the next account), and the only-grow merge rules
 * would make anything written into it permanent on the next push.
 */
import { pullProgress, pushProgress, type CloudUserData } from '../../lib/syncService';
import { useAppStore } from '../useAppStore';

// jest.mock calls are hoisted above the imports by babel-jest.
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
  removeItem: jest.fn(async () => undefined),
}));
jest.mock('../../lib/syncService', () => ({
  pushProgress: jest.fn(),
  pullProgress: jest.fn(),
  recordChoiceStat: jest.fn(),
  getChoiceStats: jest.fn(),
  recordEndingStat: jest.fn(),
  getEndingStats: jest.fn(),
  deleteAccountData: jest.fn(),
  CURRENT_SCHEMA_VERSION: 3,
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

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => { resolve = r; });
  return { promise, resolve };
}

const previousLearnerRow: CloudUserData = {
  schema_version: 3,
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
  saved_phrases: ['phrase-a'],
  unlocked_phrase_ids: ['phrase-a'],
  milestones: [],
  journal: [],
  last_active_date: '2026-09-13',
  subscription_status: 'subscribed',
  trial_started_at: null,
  trial_plan: null,
};

beforeEach(async () => {
  mockPull.mockReset();
  mockPush.mockReset();
  await useAppStore.getState().signOut();
  useAppStore.setState({ isSyncing: false });
});

describe('syncFromCloud across a sign-out', () => {
  it('writes nothing from a pull that resolves after sign-out', async () => {
    const pull = deferred<Awaited<ReturnType<typeof pullProgress>>>();
    mockPull.mockReturnValue(pull.promise);

    useAppStore.getState().setClerkUserId('user_a');
    const syncing = useAppStore.getState().syncFromCloud();
    await useAppStore.getState().signOut();
    useAppStore.getState().setClerkUserId('user_b');

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

  it('does not surface the previous session’s pull error', async () => {
    const pull = deferred<Awaited<ReturnType<typeof pullProgress>>>();
    mockPull.mockReturnValue(pull.promise);

    useAppStore.getState().setClerkUserId('user_a');
    const syncing = useAppStore.getState().syncFromCloud();
    await useAppStore.getState().signOut();

    pull.resolve({ data: null, error: 'JWT expired' });
    await syncing;

    expect(useAppStore.getState().lastSyncError).toBeNull();
    expect(useAppStore.getState().isSyncing).toBe(false);
  });

  it('still merges when the same learner is signed in', async () => {
    mockPull.mockResolvedValue({ data: previousLearnerRow, error: null });

    useAppStore.getState().setClerkUserId('user_a');
    await useAppStore.getState().syncFromCloud();

    const s = useAppStore.getState();
    expect(s.user?.name).toBe('Learner A');
    expect(s.completedScenarios).toEqual(previousLearnerRow.completed_scenarios);
    expect(s.isSyncing).toBe(false);
  });
});

describe('syncToCloud across a sign-out', () => {
  it('does not surface the previous session’s push result', async () => {
    const push = deferred<Awaited<ReturnType<typeof pushProgress>>>();
    mockPush.mockReturnValue(push.promise);

    useAppStore.getState().setClerkUserId('user_a');
    const syncing = useAppStore.getState().syncToCloud();
    await useAppStore.getState().signOut();

    push.resolve({ error: 'new row violates row-level security policy' });
    await syncing;

    // The payload was snapshotted with its owner, so it can only ever reach A's row.
    expect(mockPush).toHaveBeenCalledWith('user_a', expect.anything());
    expect(useAppStore.getState().lastSyncError).toBeNull();
    expect(useAppStore.getState().isSyncing).toBe(false);
  });
});
