/**
 * RevenueCat purchase service.
 *
 * Setup checklist (one-time):
 *  1. Create products in App Store Connect: com.fasih.app.yearly / com.fasih.app.monthly
 *  2. Create products in Google Play Console: fasih_yearly / fasih_monthly
 *  3. In RevenueCat dashboard:
 *     - Create entitlement: "premium"
 *     - Create offering: "default" with two packages (ANNUAL + MONTHLY)
 *     - Link the App Store / Play Store products above
 *  4. Add EXPO_PUBLIC_REVENUECAT_IOS_KEY and EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
 *     to your .env.local (never commit these)
 *  5. Add plugin to app.json:
 *       "plugins": ["react-native-purchases/expo", ...]
 *  6. Run: npx expo prebuild && npx expo run:ios (or run:android)
 */

import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';
import type { SubscriptionStatus } from '../types';

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';
const ENTITLEMENT_ID = 'premium';

/** Call once at app start (before sign-in). */
export function configurePurchases() {
  const apiKey = Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;
  if (!apiKey) return; // keys not set yet — skip (dev builds without RevenueCat)
  Purchases.setLogLevel(LOG_LEVEL.ERROR);
  Purchases.configure({ apiKey });
}

/** Link RevenueCat customer record to a Supabase user ID. */
export async function loginPurchasesUser(userId: string) {
  if (!IOS_KEY && !ANDROID_KEY) return;
  try {
    await Purchases.logIn(userId);
  } catch {
    // non-fatal — purchase history still works anonymously
  }
}

/** Unlink on sign-out (reset to anonymous). */
export async function logoutPurchasesUser() {
  if (!IOS_KEY && !ANDROID_KEY) return;
  try {
    await Purchases.logOut();
  } catch {}
}

/** Returns 'subscribed' if user has an active premium entitlement, otherwise 'free'. */
export async function getEntitlementStatus(): Promise<SubscriptionStatus> {
  if (!IOS_KEY && !ANDROID_KEY) return 'free';
  try {
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active[ENTITLEMENT_ID] ? 'subscribed' : 'free';
  } catch {
    return 'free';
  }
}

export interface Offerings {
  monthly: PurchasesPackage | null;
  yearly: PurchasesPackage | null;
}

/** Fetches available subscription packages from RevenueCat. */
export async function getOfferings(): Promise<Offerings> {
  if (!IOS_KEY && !ANDROID_KEY) return { monthly: null, yearly: null };
  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current) return { monthly: null, yearly: null };
    return {
      monthly: current.monthly ?? null,
      yearly: current.annual ?? null,
    };
  } catch {
    return { monthly: null, yearly: null };
  }
}

export interface PurchaseResult {
  status: SubscriptionStatus;
  cancelled: boolean;
  error: string | null;
}

/** Triggers the native purchase sheet for a given plan. */
export async function purchasePlan(plan: 'monthly' | 'yearly'): Promise<PurchaseResult> {
  if (!IOS_KEY && !ANDROID_KEY) {
    // Dev mode fallback: simulate a successful purchase for testing
    return { status: 'subscribed', cancelled: false, error: null };
  }
  try {
    const { monthly, yearly } = await getOfferings();
    const pkg = plan === 'yearly' ? yearly : monthly;
    if (!pkg) return { status: 'free', cancelled: false, error: 'No package available' };

    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const active = customerInfo.entitlements.active[ENTITLEMENT_ID];
    return { status: active ? 'subscribed' : 'free', cancelled: false, error: null };
  } catch (err: any) {
    if (err?.userCancelled) return { status: 'free', cancelled: true, error: null };
    return { status: 'free', cancelled: false, error: err?.message ?? 'Purchase failed' };
  }
}

/** Restores previous purchases (required by App Store guidelines). */
export async function restorePurchases(): Promise<PurchaseResult> {
  if (!IOS_KEY && !ANDROID_KEY) return { status: 'free', cancelled: false, error: null };
  try {
    const info = await Purchases.restorePurchases();
    const active = info.entitlements.active[ENTITLEMENT_ID];
    return { status: active ? 'subscribed' : 'free', cancelled: false, error: null };
  } catch (err: any) {
    return { status: 'free', cancelled: false, error: err?.message ?? 'Restore failed' };
  }
}
