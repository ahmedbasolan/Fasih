/**
 * Whether to write the anonymous onboarding row.
 *
 * Pure, so the guard order is testable without a store or a network. The order
 * matters and is easy to get subtly wrong:
 *
 *   1. Collection must be ON. Off is an opt-out, and it means no write at all —
 *      not a write with fields blanked.
 *   2. It must not already have fired. Rows carry no identifier, so uniqueness
 *      cannot be enforced in the database; this per-install flag is the only
 *      guard there is.
 *   3. The row must be able to satisfy the schema. `role` is NOT NULL and
 *      `goals` must hold 1-5 values, so a profile with neither would be
 *      rejected server-side anyway — and an onboarding that produced neither is
 *      not worth a row.
 *
 * Spec: docs/superpowers/specs/2026-09-03-onboarding-analytics-design.md
 */
export interface OnboardingAnalyticsGate {
  analyticsEnabled: boolean;
  analyticsOnboardingSent: boolean;
}

export interface OnboardingAnalyticsPayload {
  role?: string;
  goals: string[];
}

export function shouldRecordOnboarding(
  gate: OnboardingAnalyticsGate,
  profile: OnboardingAnalyticsPayload,
): boolean {
  if (!gate.analyticsEnabled) return false;
  if (gate.analyticsOnboardingSent) return false;
  if (!profile.role) return false;
  if (profile.goals.length === 0 || profile.goals.length > 5) return false;
  return true;
}
