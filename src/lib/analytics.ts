/**
 * analytics.ts
 *
 * Fasih PostHog analytics helper.
 * All event tracking goes through this file — never call PostHog directly from components.
 *
 * Setup: add EXPO_PUBLIC_POSTHOG_API_KEY to your .env file
 * Region: EU cloud (api.eu.posthog.com)
 */

import PostHog from 'posthog-react-native';

// ─── Client ──────────────────────────────────────────────────────────────────

export const posthog = new PostHog(
  process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? '',
  {
    host: 'https://eu.i.posthog.com',
    // Track app lifecycle events (open, background, etc.)
    captureAppLifecycleEvents: true,
  },
);

// ─── User Identity ────────────────────────────────────────────────────────────

/** Call after sign-in or onboarding completion */
export function identifyUser(userId: string, props?: {
  name?: string;
  mode?: string;
  role?: string;
  plan?: string;
}) {
  posthog.identify(userId, props);
}

/** Call on sign-out */
export function resetIdentity() {
  posthog.reset();
}

// ─── Onboarding Events ────────────────────────────────────────────────────────

export function trackOnboardingStarted() {
  posthog.capture('onboarding_started');
}

export function trackOnboardingCompleted(props: {
  name: string;
  mode: string;
  role: string;
  plan: string;
  goals: string[];
}) {
  posthog.capture('onboarding_completed', props);
}

export function trackTrialStarted(plan: string) {
  posthog.capture('trial_started', { plan });
}

export function trackOnboardingSkipped(step: number) {
  posthog.capture('onboarding_skipped', { step });
}

// ─── Scenario Events ──────────────────────────────────────────────────────────

export function trackScenarioStarted(props: {
  scenarioId: string;
  title: string;
  category?: string;
}) {
  posthog.capture('scenario_started', props);
}

export function trackScenarioChoiceMade(props: {
  scenarioId: string;
  sceneId: string;
  choiceText: string;
  flag?: string;
}) {
  posthog.capture('scenario_choice_made', props);
}

export function trackScenarioCompleted(props: {
  scenarioId: string;
  title: string;
  endingType: string;
  endingId: string;
  sceneCount: number;
}) {
  posthog.capture('scenario_completed', props);
}

export function trackScenarioAbandoned(props: {
  scenarioId: string;
  sceneId: string;
}) {
  posthog.capture('scenario_abandoned', props);
}

// ─── Practice / Phrase Events ─────────────────────────────────────────────────

export function trackPracticeSessionStarted(props: {
  category: string;
  deckSize: number;
}) {
  posthog.capture('practice_session_started', props);
}

export function trackPracticeSessionCompleted(props: {
  category: string;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number;
}) {
  posthog.capture('practice_session_completed', props);
}

export function trackPhraseSaved(props: {
  phraseId: string;
  arabic: string;
  category: string;
}) {
  posthog.capture('phrase_saved', props);
}

// ─── Paywall / Subscription Events ────────────────────────────────────────────

export function trackPaywallShown(source: string) {
  posthog.capture('paywall_shown', { source });
}

export function trackSubscriptionPurchased(plan: string) {
  posthog.capture('subscription_purchased', { plan });
}

// ─── Screen View Helper ───────────────────────────────────────────────────────

export function trackScreen(screenName: string, props?: Record<string, unknown>) {
  posthog.capture('$screen', { $screen_name: screenName, ...props });
}

// ─── Error Tracking ───────────────────────────────────────────────────────────

/**
 * Capture a JS error in PostHog as an exception event.
 *
 * Use in:
 *   - ErrorBoundary.componentDidCatch
 *   - catch blocks in lib/ functions (sync, purchases, etc.)
 *   - Any unhandled promise rejection handler
 *
 * PostHog will group these by message/type in the "Exceptions" tab.
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  try {
    posthog.capture('$exception', {
      $exception_message: error.message,
      $exception_type: error.name,
      $exception_stack_trace_raw: error.stack ?? '',
      ...context,
    });
  } catch {
    // Never throw from error reporting — it would cause infinite loops in ErrorBoundary
  }
}

/**
 * Capture a non-fatal error (e.g. a failed sync) without crashing.
 * Shows up in PostHog as a regular event, not an exception.
 */
export function captureError(message: string, context?: Record<string, unknown>): void {
  try {
    posthog.capture('error_occurred', { message, ...context });
  } catch {
    // Swallow — same reasoning as captureException
  }
}
