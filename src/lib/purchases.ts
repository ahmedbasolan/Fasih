/**
 * RevenueCat v9 purchase service for Fasih.
 *
 * ─── RevenueCat Dashboard setup (one-time) ────────────────────────────────
 *  1. Entitlement:  "Fasih Pro"
 *  2. Products (App Store Connect + Google Play):
 *       com.fasih.app.lifetime  →  LIFETIME  package
 *       com.fasih.app.yearly    →  ANNUAL    package
 *       com.fasih.app.monthly   →  MONTHLY   package
 *  3. Offering:  "default"  containing the 3 packages above
 *
 * ─── Env vars (add to .env.local — never commit) ──────────────────────────
 *  EXPO_PUBLIC_REVENUECAT_IOS_KEY=<your_apple_api_key>
 *  EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=<your_google_api_key>
 *
 * ─── Native rebuild (required once after install) ─────────────────────────
 *  npx expo prebuild
 *  npx expo run:ios  |  npx expo run:android
 */

import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { Platform } from 'react-native';
import type { PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import type { SubscriptionStatus } from '../types';

// ─── Config ───────────────────────────────────────────────────────────────────
// RevenueCat API keys must be set via environment variables — never hardcoded.
// Add to your .env.local (never commit):
//   EXPO_PUBLIC_REVENUECAT_IOS_KEY=<your_apple_api_key>
//   EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=<your_google_api_key>
const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';

export const ENTITLEMENT_ID = 'Fasih Pro';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function apiKey(): string {
  return Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;
}

function hasEntitlement(info: CustomerInfo): boolean {
  return typeof info.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
}

function toStatus(info: CustomerInfo): SubscriptionStatus {
  return hasEntitlement(info) ? 'subscribed' : 'free';
}

// ─── Initialization ───────────────────────────────────────────────────────────

/**
 * Call once on app start (in root layout useEffect).
 * Safe to call multiple times — RevenueCat ignores duplicate configures.
 *
 * A missing key isn't a bug the SDK reports as a JS error — Purchases.configure()
 * validates synchronously on the native module thread, so an empty apiKey() takes
 * down the whole app before any React error boundary can catch it (this is what
 * happened when the RevenueCat keys weren't yet in .env). Skip configuring
 * instead: every other function in this file already treats "not configured" as
 * a normal, catchable case and falls back to a safe default.
 */
export function configurePurchases(): void {
  if (!apiKey()) {
    if (__DEV__) {
      console.warn(
        `[purchases] No RevenueCat key for ${Platform.OS} — skipping configure(). ` +
        'Subscription features are disabled until EXPO_PUBLIC_REVENUECAT_IOS_KEY / ' +
        '_ANDROID_KEY are set in .env.',
      );
    }
    return;
  }
  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.ERROR);
  Purchases.configure({ apiKey: apiKey() });
}

/**
 * Link RevenueCat customer record to your Supabase user ID.
 * Call after successful sign-in.
 */
export async function loginPurchasesUser(userId: string): Promise<void> {
  try {
    await Purchases.logIn(userId);
  } catch {
    // non-fatal — anonymous customer info still works
  }
}

/**
 * Reset to anonymous on sign-out.
 */
export async function logoutPurchasesUser(): Promise<void> {
  try {
    await Purchases.logOut();
  } catch {}
}

/**
 * Register a listener for real-time subscription changes.
 * Returns an unsubscribe function — call it on component unmount.
 */
export function addCustomerInfoListener(
  onUpdate: (status: SubscriptionStatus, info: CustomerInfo) => void,
): () => void {
  const listener = (info: CustomerInfo) => onUpdate(toStatus(info), info);
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => Purchases.removeCustomerInfoUpdateListener(listener);
}

// ─── Entitlement checks ───────────────────────────────────────────────────────

/**
 * Single async check — use this on sign-in to sync entitlement status.
 */
export async function getEntitlementStatus(): Promise<SubscriptionStatus> {
  try {
    const info = await Purchases.getCustomerInfo();
    return toStatus(info);
  } catch {
    return 'free';
  }
}

// ─── Offerings / packages ─────────────────────────────────────────────────────

export interface FasihOfferings {
  monthly: PurchasesPackage | null;
  yearly: PurchasesPackage | null;
  lifetime: PurchasesPackage | null;
}

/**
 * Fetch all available packages from the "default" offering.
 */
export async function getOfferings(): Promise<FasihOfferings> {
  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current) return { monthly: null, yearly: null, lifetime: null };

    // RevenueCat naming: current.monthly, current.annual, current.lifetime
    return {
      monthly: current.monthly ?? null,
      yearly: current.annual ?? null,
      lifetime: current.lifetime ?? null,
    };
  } catch {
    return { monthly: null, yearly: null, lifetime: null };
  }
}

// ─── Purchasing ───────────────────────────────────────────────────────────────

export type Plan = 'monthly' | 'yearly' | 'lifetime';

export interface PurchaseResult {
  status: SubscriptionStatus;
  cancelled: boolean;
  error: string | null;
  /**
   * True when `status` came from a dev-only simulation rather than a real
   * store transaction. The caller must not persist or cloud-sync a simulated
   * entitlement: doing so wrote `subscription_status = 'subscribed'` to the
   * real Supabase row for that Clerk user, and a later release build pulled it
   * back down and granted permanent free Pro.
   */
  simulated?: boolean;
}

/**
 * Purchase a specific plan via the native payment sheet.
 * On simulator/dev without store access, returns a simulated success.
 */
export async function purchasePlan(plan: Plan): Promise<PurchaseResult> {
  try {
    const offerings = await getOfferings();
    const pkg =
      plan === 'lifetime' ? offerings.lifetime
      : plan === 'yearly'  ? offerings.yearly
      :                       offerings.monthly;

    if (!pkg) {
      // In dev/simulator (no App Store products configured yet), simulate a
      // successful purchase so the app is usable for testing — flagged so the
      // store keeps it local instead of syncing it to the real cloud row.
      if (__DEV__) return { status: 'subscribed', cancelled: false, error: null, simulated: true };
      return { status: 'free', cancelled: false, error: 'Product not available' };
    }

    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { status: toStatus(customerInfo), cancelled: false, error: null };
  } catch (err: any) {
    if (err?.userCancelled) return { status: 'free', cancelled: true, error: null };
    return { status: 'free', cancelled: false, error: err?.message ?? 'Purchase failed' };
  }
}

/**
 * Restore previous App Store / Play Store purchases.
 * Required by App Store Review Guidelines.
 */
export async function restorePurchases(): Promise<PurchaseResult> {
  try {
    const info = await Purchases.restorePurchases();
    return { status: toStatus(info), cancelled: false, error: null };
  } catch (err: any) {
    return { status: 'free', cancelled: false, error: err?.message ?? 'Restore failed' };
  }
}

// ─── RevenueCat Paywall UI ────────────────────────────────────────────────────

export interface PaywallResult {
  purchased: boolean;
  restored: boolean;
  cancelled: boolean;
}

/**
 * Present the RevenueCat-hosted paywall modally.
 * Only shows if the user does NOT already have the "Fasih Pro" entitlement.
 * Returns whether the user ended up with access.
 */
export async function presentPaywallIfNeeded(): Promise<PaywallResult> {
  try {
    const result = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: ENTITLEMENT_ID,
    });

    switch (result) {
      case PAYWALL_RESULT.PURCHASED:
        return { purchased: true, restored: false, cancelled: false };
      case PAYWALL_RESULT.RESTORED:
        return { purchased: false, restored: true, cancelled: false };
      case PAYWALL_RESULT.NOT_PRESENTED:
        // "Not presented" means only that no paywall was shown. Already having
        // the entitlement is one reason; a missing or misconfigured paywall on
        // the offering is another. This used to return purchased: true for
        // both, so a dashboard misconfiguration granted — and cloud-synced —
        // free Pro access. Ask RevenueCat what the entitlement actually is.
        return {
          purchased: (await getEntitlementStatus()) === 'subscribed',
          restored: false,
          cancelled: false,
        };
      case PAYWALL_RESULT.CANCELLED:
      case PAYWALL_RESULT.ERROR:
      default:
        return { purchased: false, restored: false, cancelled: true };
    }
  } catch {
    // configurePurchases() deliberately skips configure() when no API key is
    // set, which is exactly when this rejects. Every other function in this
    // file already treats "not configured" as a normal, catchable case; these
    // two did not, so the caller's documented fallback chain never ran.
    return { purchased: false, restored: false, cancelled: true };
  }
}

/**
 * Force-present the paywall regardless of entitlement status.
 * Use on the Profile / Settings screen for upgrades.
 */
export async function presentPaywall(): Promise<PaywallResult> {
  try {
    const result = await RevenueCatUI.presentPaywall();

    switch (result) {
      case PAYWALL_RESULT.PURCHASED:
        return { purchased: true, restored: false, cancelled: false };
      case PAYWALL_RESULT.RESTORED:
        return { purchased: false, restored: true, cancelled: false };
      case PAYWALL_RESULT.CANCELLED:
      case PAYWALL_RESULT.ERROR:
      default:
        return { purchased: false, restored: false, cancelled: true };
    }
  } catch {
    // See presentPaywallIfNeeded — rejecting here used to take out the whole
    // fallback chain in the onboarding trial handler.
    return { purchased: false, restored: false, cancelled: true };
  }
}

// ─── Customer Center ──────────────────────────────────────────────────────────

/**
 * Present the RevenueCat Customer Center — allows users to manage
 * subscriptions, request refunds, and restore purchases.
 * Required by App Store guidelines for apps with subscriptions.
 */
export async function presentCustomerCenter(): Promise<void> {
  await RevenueCatUI.presentCustomerCenter({
    callbacks: {
      onRestoreCompleted: () => {
        // Handled by the addCustomerInfoUpdateListener registered at startup
      },
      onRestoreFailed: () => {
        // Error handling is done via the listener
      },
      onManagementOptionSelected: () => {
        // Option handling is done via the listener
      },
    },
  });
}
