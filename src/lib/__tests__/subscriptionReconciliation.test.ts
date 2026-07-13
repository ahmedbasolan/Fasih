/**
 * Covers Task 1.4 of the security-hardening plan: initSubscription must
 * reconcile subscriptionStatus in BOTH directions using RevenueCat's
 * CustomerInfo as the source of truth, not just upgrade to 'subscribed'.
 *
 * Before this fix, initSubscription only ever set subscriptionStatus to
 * 'subscribed' when RevenueCat confirmed it, and never downgraded back to
 * 'free'. Combined with RLS being disabled on user_data (see
 * supabase/migrations/005_enable_rls.sql), that meant a forged
 * subscription_status written directly via the Supabase anon key would
 * persist forever, even after the write path itself was locked down —
 * because the client never re-checked and corrected it on next launch.
 */

// @react-native-async-storage/async-storage requires native modules that
// aren't available under plain Jest; use the package's official in-memory
// mock so zustand's persist middleware can rehydrate without hitting native
// code (mirrors the pattern used by @react-native-async-storage/async-storage's
// own docs for consumers testing code that depends on it).
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// useAppStore pulls in RevenueCat (native module) and Supabase (throws
// without env vars) via ../lib/purchases and ../lib/syncService. Mock both
// so this test only exercises the reconciliation logic in initSubscription.
jest.mock('../purchases', () => ({
  configurePurchases: jest.fn(),
  loginPurchasesUser: jest.fn().mockResolvedValue(undefined),
  logoutPurchasesUser: jest.fn().mockResolvedValue(undefined),
  getEntitlementStatus: jest.fn(),
  addCustomerInfoListener: jest.fn().mockReturnValue(() => {}),
  purchasePlan: jest.fn(),
  restorePurchases: jest.fn(),
  presentPaywallIfNeeded: jest.fn(),
  presentPaywall: jest.fn(),
  presentCustomerCenter: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../syncService', () => ({
  pushProgress: jest.fn().mockResolvedValue({ error: null }),
  pullProgress: jest.fn().mockResolvedValue({ data: null, error: null }),
  recordChoiceStat: jest.fn().mockResolvedValue(undefined),
  getChoiceStats: jest.fn().mockResolvedValue({}),
  recordEndingStat: jest.fn().mockResolvedValue(undefined),
  getEndingStats: jest.fn().mockResolvedValue({}),
}));

import { useAppStore } from '../../store/useAppStore';
import { getEntitlementStatus } from '../purchases';

const mockGetEntitlementStatus = getEntitlementStatus as jest.MockedFunction<
  typeof getEntitlementStatus
>;

describe('initSubscription — subscription status reconciliation', () => {
  beforeEach(() => {
    mockGetEntitlementStatus.mockReset();
  });

  it('downgrades subscriptionStatus to \'free\' when RevenueCat reports no active entitlement, even if the store previously had \'subscribed\'', async () => {
    // Simulate a forged/stale local state — e.g. a subscription_status of
    // 'subscribed' that was either legitimately set earlier and has since
    // lapsed, or was written directly to Supabase before RLS locked the
    // column down.
    useAppStore.setState({ subscriptionStatus: 'subscribed' });
    mockGetEntitlementStatus.mockResolvedValue('free');

    await useAppStore.getState().initSubscription();

    expect(useAppStore.getState().subscriptionStatus).toBe('free');
  });

  it('sets subscriptionStatus to \'subscribed\' when RevenueCat confirms an active entitlement', async () => {
    useAppStore.setState({ subscriptionStatus: 'free' });
    mockGetEntitlementStatus.mockResolvedValue('subscribed');

    await useAppStore.getState().initSubscription();

    expect(useAppStore.getState().subscriptionStatus).toBe('subscribed');
  });

  it('keeps subscriptionStatus as \'subscribed\' when it already was and RevenueCat still confirms it (no spurious downgrade)', async () => {
    useAppStore.setState({ subscriptionStatus: 'subscribed' });
    mockGetEntitlementStatus.mockResolvedValue('subscribed');

    await useAppStore.getState().initSubscription();

    expect(useAppStore.getState().subscriptionStatus).toBe('subscribed');
  });

  it('leaves subscriptionStatus as \'trial\' when RevenueCat reports \'free\' (trial is local/app-managed and never reported by RevenueCat)', async () => {
    // Trial is a purely local, app-managed grace period (see startTrial()),
    // unrelated to any RevenueCat purchase — getEntitlementStatus() can only
    // ever resolve to 'subscribed' or 'free'. Since initSubscription() runs
    // on every app launch, it must not stomp 'trial' back to 'free'; the
    // existing 4-day expiry logic in hasFullAccess/hasScenarioAccess already
    // handles trial expiration by date.
    useAppStore.setState({ subscriptionStatus: 'trial' });
    mockGetEntitlementStatus.mockResolvedValue('free');

    await useAppStore.getState().initSubscription();

    expect(useAppStore.getState().subscriptionStatus).toBe('trial');
  });
});
