/**
 * Supabase progress sync service.
 *
 * Schema is managed via SQL migrations in supabase/migrations/.
 *
 * ─── Architecture note ──────────────────────────────────────────────────────
 * Fasih uses Clerk for authentication. Supabase is the database only — no
 * Supabase Auth. user_id is a Clerk user ID (TEXT), not a UUID.
 *
 * RLS is currently DISABLED (Option A). All data access is filtered client-side
 * by user_id. Upgrade path: enable Option B in 003_rls.sql once a Clerk → JWT
 * integration is configured (see that file for instructions).
 *
 * ─── Security posture ───────────────────────────────────────────────────────
 * The Supabase anon key is public by design. Without RLS, a malicious client
 * could read or write any row using a crafted user_id. Acceptable for launch;
 * schedule Option B before significant user growth.
 */

import { supabase } from './supabase';
import type { UserProfile, UserStats, PhraseReviewData, LearningMilestone, JournalEntry, SubscriptionStatus } from '../types';

/**
 * Increment this when CloudUserData shape changes in a breaking way.
 * pullProgress uses it to detect stale cloud rows.
 * History: 1 = initial; 2 = added schema_version + gender + unlocked_phrase_ids
 */
export const CURRENT_SCHEMA_VERSION = 2;

// ─── Community stats ─────────────────────────────────────────────────────────
// Schema lives in supabase/migrations/001_initial_schema.sql.
// These tables use RPC functions for atomic increments (SECURITY DEFINER).
// RLS is disabled — reads are open, writes go through the RPCs only.

export interface CloudUserData {
  schema_version: number;
  user_profile: UserProfile | null;
  stats: UserStats;
  phrase_reviews: Record<string, PhraseReviewData>;
  completed_scenarios: Record<string, { endingType: string; date: string }>;
  saved_phrases: string[];
  unlocked_phrase_ids: string[];  // phrases unlocked through scenarios — must sync so reinstalls restore them
  milestones: LearningMilestone[];
  journal: JournalEntry[];
  last_active_date: string | null;
  subscription_status: SubscriptionStatus;
  trial_started_at: string | null;
  trial_plan: 'monthly' | 'yearly' | null;
}

/**
 * Push local state to Supabase (upsert). Silent on error — local data is source of truth.
 */
export async function pushProgress(
  userId: string,
  data: CloudUserData,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('user_data')
    .upsert(
      {
        user_id: userId,
        schema_version: data.schema_version,
        user_profile: data.user_profile,
        stats: data.stats,
        phrase_reviews: data.phrase_reviews,
        completed_scenarios: data.completed_scenarios,
        saved_phrases: data.saved_phrases,
        unlocked_phrase_ids: data.unlocked_phrase_ids,
        milestones: data.milestones,
        journal: data.journal,
        last_active_date: data.last_active_date,
        subscription_status: data.subscription_status,
        trial_started_at: data.trial_started_at,
        trial_plan: data.trial_plan,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

  return { error: error?.message ?? null };
}

/**
 * Pull cloud state for a user. Returns null data if no row exists yet (new user).
 */
export async function pullProgress(
  userId: string,
): Promise<{ data: CloudUserData | null; error: string | null }> {
  const { data, error } = await supabase
    .from('user_data')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // PGRST116 = no rows returned — this is a new user, not a real error
    if (error.code === 'PGRST116') return { data: null, error: null };
    return { data: null, error: error.message };
  }

  // Migration guard: rows written before schema_version was introduced will
  // have schema_version = null (column DEFAULT 1 handles new inserts).
  // We treat null as version 1 and let the caller decide what to do with it.
  const cloudVersion: number = (data.schema_version as number | null) ?? 1;

  return {
    data: {
      schema_version: cloudVersion,
      user_profile: data.user_profile ?? null,
      stats: data.stats ?? {},
      phrase_reviews: data.phrase_reviews ?? {},
      completed_scenarios: data.completed_scenarios ?? {},
      saved_phrases: data.saved_phrases ?? [],
      unlocked_phrase_ids: data.unlocked_phrase_ids ?? [],
      milestones: data.milestones ?? [],
      journal: data.journal ?? [],
      last_active_date: data.last_active_date ?? null,
      subscription_status: data.subscription_status ?? 'free',
      trial_started_at: data.trial_started_at ?? null,
      trial_plan: data.trial_plan ?? null,
    },
    error: null,
  };
}

// ─── Community stat helpers ───────────────────────────────────────────────────

// Seed percentages used when Supabase has no real data yet (pre-launch / empty DB).
// Values represent realistic completion distributions. Replaced automatically once
// real users accumulate — Supabase data always takes precedence.
const ENDING_STAT_SEEDS: Record<string, Record<string, number>> = {
  'first-morning':      { exceptional: 34, success: 41, mixed: 17, failed: 8 },
  'coffee-invitation':  { exceptional: 28, success: 38, mixed: 24, failed: 10 },
  'hotel-guest':        { exceptional: 31, success: 39, mixed: 21, failed: 9 },
  'office-meeting':     { exceptional: 27, success: 37, mixed: 26, failed: 10 },
  'ramadan-shift':      { exceptional: 24, success: 36, mixed: 28, failed: 12 },
  'gym-consultation':   { exceptional: 30, success: 40, mixed: 21, failed: 9 },
  'the-checkup':        { exceptional: 29, success: 40, mixed: 22, failed: 9 },
  'social_taxi_ride':   { exceptional: 38, success: 35, mixed: 19, failed: 8 },
  'social_elevator':    { exceptional: 32, success: 37, mixed: 22, failed: 9 },
  'cafe-friends':       { exceptional: 26, success: 40, mixed: 23, failed: 11 },
  'eid-greeting':       { exceptional: 33, success: 38, mixed: 20, failed: 9 },
  'weekend-invite':     { exceptional: 25, success: 38, mixed: 25, failed: 12 },
  'neighborhood':       { exceptional: 29, success: 39, mixed: 22, failed: 10 },
};

/**
 * Permanently delete the signed-in user's cloud row.
 *
 * Calls the delete_my_account() RPC (supabase/migrations/005_account_deletion.sql)
 * rather than a plain .delete() — DELETE on user_data is revoked from the client
 * roles on purpose, so the RPC is the only sanctioned path. It takes no arguments:
 * the row to delete is derived from the Clerk session token server-side, so this
 * cannot be pointed at another user's account.
 *
 * ⚠ Requires a live Clerk session. Deleting the Clerk user first would revoke the
 * token this call authenticates with and strand the row permanently — always call
 * this BEFORE removing the Clerk account.
 *
 * Unlike the fire-and-forget stat helpers, errors are surfaced: the caller must
 * abort deletion rather than tell someone their data is gone when it isn't.
 */
export async function deleteAccountData(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.rpc('delete_my_account');
    return { error: error?.message ?? null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Could not reach the server' };
  }
}

/** Atomically increment the pick count for one choice (fire-and-forget). */
export async function recordChoiceStat(
  scenarioId: string,
  sceneId: string,
  choiceId: string,
): Promise<void> {
  try {
    await supabase.rpc('increment_choice_stat', {
      p_scenario_id: scenarioId,
      p_scene_id: sceneId,
      p_choice_id: choiceId,
    });
  } catch { /* non-fatal */ }
}

/**
 * Fetch pick counts for every choice in a scene and return them as percentages.
 * Returns a map of choiceId → percentage (0–100).
 */
export async function getChoiceStats(
  scenarioId: string,
  sceneId: string,
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('scenario_choice_stats')
    .select('choice_id, pick_count')
    .eq('scenario_id', scenarioId)
    .eq('scene_id', sceneId);

  if (error || !data?.length) return {};

  const total = data.reduce((sum, row) => sum + (row.pick_count as number), 0);
  if (total === 0) return {};

  return Object.fromEntries(
    data.map(row => [
      row.choice_id as string,
      Math.round(((row.pick_count as number) / total) * 100),
    ]),
  );
}

/** Atomically increment the reach count for a scenario ending (fire-and-forget). */
export async function recordEndingStat(
  scenarioId: string,
  endingType: string,
): Promise<void> {
  try {
    await supabase.rpc('increment_ending_stat', {
      p_scenario_id: scenarioId,
      p_ending_type: endingType,
    });
  } catch { /* non-fatal */ }
}

/**
 * Fetch reach counts for every ending of a scenario and return them as percentages.
 * Returns a map of endingType → percentage (0–100).
 */
export async function getEndingStats(
  scenarioId: string,
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('scenario_ending_stats')
    .select('ending_type, reach_count')
    .eq('scenario_id', scenarioId);

  if (!error && data?.length) {
    const total = data.reduce((sum, row) => sum + (row.reach_count as number), 0);
    if (total > 0) {
      return Object.fromEntries(
        data.map(row => [
          row.ending_type as string,
          Math.round(((row.reach_count as number) / total) * 100),
        ]),
      );
    }
  }

  // No real data yet — return seed stats so the result screen is never empty
  return ENDING_STAT_SEEDS[scenarioId] ?? {};
}
