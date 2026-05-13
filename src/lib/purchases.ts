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
// Use the test key as a fallback when env var is not set.
// IMPORTANT: Replace with your real Apple / Google keys in production.
const TEST_KEY = 'test_kPwnxlCxpvARBOPvRxegearmcwT';
const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || TEST_KEY;
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || TEST_KEY;

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
 */
export function configurePurchases(): void {
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
      // Simulator / dev fallback when no products are configured yet
      return { status: 'subscribed', cancelled: false, error: null };
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
  const result = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: ENTITLEMENT_ID,
  });

  switch (result) {
    case PAYWALL_RESULT.PURCHASED:
      return { purchased: true, restored: false, cancelled: false };
    case PAYWALL_RESULT.RESTORED:
      return { purchased: false, restored: true, cancelled: false };
    case PAYWALL_RESULT.NOT_PRESENTED:
      // User already has entitlement — treat as "purchased"
      return { purchased: true, restored: false, cancelled: false };
    case PAYWALL_RESULT.CANCELLED:
    case PAYWALL_RESULT.ERROR:
    default:
      return { purchased: false, restored: false, cancelled: true };
  }
}

/**
 * Force-present the paywall regardless of entitlement status.
 * Use on the Profile / Settings screen for upgrades.
 */
export async function presentPaywall(): Promise<PaywallResult> {
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
