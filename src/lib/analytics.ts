/**
 * analytics.ts
 *
 * Fasih error & event tracking helper (Sentry-backed).
 * All error reporting and event tracking goes through this file — never call Sentry directly from components.
 *
 * Setup: add EXPO_PUBLIC_SENTRY_DSN to your .env file
 */

import * as Sentry from '@sentry/react-native';

// ─── Client ──────────────────────────────────────────────────────────────────

if (!process.env.EXPO_PUBLIC_SENTRY_DSN) {
  console.warn('⚠️ Missing EXPO_PUBLIC_SENTRY_DSN in environment. Sentry will run disabled (no events sent).');
}

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,
  enableAutoSessionTracking: true,
  integrations: [Sentry.expoRouterIntegration()],
});

export { Sentry };

// ─── User Identity ────────────────────────────────────────────────────────────

/** Call after sign-in or onboarding completion */
export function identifyUser(userId: string, props?: {
  name?: string;
  mode?: string;
  role?: string;
  plan?: string;
}) {
  Sentry.setUser({ id: userId, ...props });
}

/** Call on sign-out */
export function resetIdentity() {
  Sentry.setUser(null);
}

// ─── Product event breadcrumbs ────────────────────────────────────────────────
// Sentry has no PostHog-style event dashboard — these attach as breadcrumbs so
// they show up as context leading up to any crash/error report, rather than
// disappearing silently. For funnel/analytics dashboards, a dedicated product
// analytics tool would need to be added separately.

function track(event: string, data?: Record<string, unknown>) {
  Sentry.addBreadcrumb({ category: 'app', message: event, data, level: 'info' });
}

// ─── Onboarding Events ────────────────────────────────────────────────────────

export function trackOnboardingStarted() {
  track('onboarding_started');
}

export function trackOnboardingCompleted(props: {
  name: string;
  mode: string;
  role: string;
  plan: string;
  goals: string[];
}) {
  track('onboarding_completed', props);
}

export function trackTrialStarted(plan: string) {
  track('trial_started', { plan });
}

export function trackOnboardingSkipped(step: number) {
  track('onboarding_skipped', { step });
}

// ─── Scenario Events ──────────────────────────────────────────────────────────

export function trackScenarioStarted(props: {
  scenarioId: string;
  title: string;
  category?: string;
}) {
  track('scenario_started', props);
}

export function trackScenarioChoiceMade(props: {
  scenarioId: string;
  sceneId: string;
  choiceText: string;
  flag?: string;
}) {
  track('scenario_choice_made', props);
}

export function trackScenarioCompleted(props: {
  scenarioId: string;
  title: string;
  endingType: string;
  endingId: string;
  sceneCount: number;
}) {
  track('scenario_completed', props);
}

export function trackScenarioAbandoned(props: {
  scenarioId: string;
  sceneId: string;
}) {
  track('scenario_abandoned', props);
}

// ─── Practice / Phrase Events ─────────────────────────────────────────────────

export function trackPracticeSessionStarted(props: {
  category: string;
  deckSize: number;
}) {
  track('practice_session_started', props);
}

export function trackPracticeSessionCompleted(props: {
  category: string;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number;
}) {
  track('practice_session_completed', props);
}

export function trackPhraseSaved(props: {
  phraseId: string;
  arabic: string;
  category: string;
}) {
  track('phrase_saved', props);
}

// ─── Paywall / Subscription Events ────────────────────────────────────────────

export function trackPaywallShown(source: string) {
  track('paywall_shown', { source });
}

export function trackSubscriptionPurchased(plan: string) {
  track('subscription_purchased', { plan });
}

// ─── Screen View Helper ───────────────────────────────────────────────────────

export function trackScreen(screenName: string, props?: Record<string, unknown>) {
  track('$screen', { $screen_name: screenName, ...props });
}

// ─── Error Tracking ───────────────────────────────────────────────────────────

/**
 * Capture a JS error in Sentry as an exception event.
 *
 * Use in:
 *   - ErrorBoundary.componentDidCatch
 *   - catch blocks in lib/ functions (sync, purchases, etc.)
 *   - Any unhandled promise rejection handler
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  try {
    Sentry.captureException(error, { extra: context });
  } catch {
    // Never throw from error reporting — it would cause infinite loops in ErrorBoundary
  }
}

/**
 * Capture a non-fatal error (e.g. a failed sync) without crashing.
 * Shows up in Sentry as a message event, not an exception.
 */
export function captureError(message: string, context?: Record<string, unknown>): void {
  try {
    Sentry.captureMessage(message, { level: 'error', extra: context });
  } catch {
    // Swallow — same reasoning as captureException
  }
}
