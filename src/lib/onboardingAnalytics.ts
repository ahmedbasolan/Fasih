import * as Application from 'expo-application';
import { supabase } from './supabase';

/**
 * The anonymous onboarding aggregate.
 *
 * One row per completed onboarding carrying mode, role and goals TOGETHER. The
 * useful question is not "how many picked Hospitality" but "how many
 * Hospitality users picked Social" — a scenario is written for the combination,
 * so per-option totals could not answer it.
 *
 * Spec: docs/superpowers/specs/2026-09-03-onboarding-analytics-design.md
 * Schema and RLS: supabase/migrations/009_onboarding_selections.sql
 *
 * The row carries no user identifier and no value that can be joined back to
 * one. The request that writes it IS authenticated (supabase.ts forwards the
 * Clerk token on every request); Postgres simply does not persist that identity
 * on the row. Anonymous at rest, not anonymous in transit.
 */

export interface OnboardingSelection {
  mode: 'career' | 'social';
  /** A `STRINGS.onboarding.roles` key. Constrained by a CHECK in the migration. */
  role: string;
  /** `STRINGS.onboarding.goals` keys, 1-5 of them. Also CHECK-constrained. */
  goals: string[];
}

/**
 * Fire-and-forget. Never throws, never blocks, never retries.
 *
 * A network failure, an RLS rejection or a check-constraint violation is caught
 * and dropped. A lost row is acceptable; a learner stuck on a spinner because
 * an analytics insert timed out is not. Nothing is queued — a queue would mean
 * holding the data somewhere, which is exactly what this design avoids.
 *
 * The caller is responsible for the two guards (`analyticsEnabled === true`,
 * `analyticsOnboardingSent === false`); they live in the store because the
 * fire-once flag has to be persisted.
 */
export async function recordOnboardingSelection(selection: OnboardingSelection): Promise<void> {
  try {
    // Empty goals would fail the array_length CHECK server-side. Dropping it
    // here saves a round trip and keeps the failure mode identical either way.
    if (selection.goals.length === 0) return;

    // Note the two distinct failure paths. supabase-js RESOLVES with `{ error }`
    // for an RLS denial or a CHECK violation rather than rejecting, so the
    // try/catch below covers only transport-level faults. Both are ignored, but
    // a reader should not think the catch is what handles a rejected policy.
    await supabase.from('onboarding_selections').insert({
      mode: selection.mode,
      role: selection.role,
      goals: selection.goals,
      app_version: Application.nativeApplicationVersion ?? null,
      // completed_on is DEFAULT current_date and is deliberately NOT sent from
      // the client. A client-supplied timestamp is exactly the re-identification
      // vector the date column exists to avoid.
    });
  } catch {
    // Deliberately silent. See above.
  }
}
