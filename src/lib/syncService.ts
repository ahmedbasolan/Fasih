/**
 * Supabase progress sync service.
 *
 * Schema is managed via SQL migrations in supabase/migrations/.
 *
 * ─── Architecture note ──────────────────────────────────────────────────────
 * Fasih uses Clerk for authentication. Supabase is the database only — no
 * Supabase Auth. user_id is a Clerk user ID (TEXT), not a UUID.
 *
 * RLS is enabled (Option B, supabase/migrations/007_enable_rls.sql): the Clerk
 * session JWT is forwarded as the Supabase access token (src/lib/supabase.ts),
 * and Postgres policies read the caller's identity via auth.jwt()->>'sub'. See
 * supabase/migrations/README.md for the full posture and how to verify it.
 *
 * ─── Security posture ───────────────────────────────────────────────────────
 * The Supabase anon key is public by design, but a request carrying it alone —
 * no valid Clerk token — runs as `anon`, which the RLS policies on user_data
 * deny outright. Do not reintroduce client-side user_id filtering as a
 * substitute for this: 003_rls.sql documents why the disabled-RLS posture
 * (Option A) it describes is not shippable.
 */

import { supabase } from './supabase';
import { CURRENT_SCHEMA_VERSION, fromCloud } from '../engine/syncedProgress';
import type { CloudUserData } from '../engine/syncedProgress';

/**
 * The wire shape, the schema version and the per-column decoders all live in
 * `src/engine/syncedProgress.ts` — they are part of the synced-progress
 * contract, not of this transport. Re-exported here so existing importers keep
 * working; new code should import them from the engine directly.
 */
export { CURRENT_SCHEMA_VERSION };
export type { CloudUserData };

// ─── Community stats ─────────────────────────────────────────────────────────
// Schema lives in supabase/migrations/001_initial_schema.sql.
// These tables use RPC functions for atomic increments (SECURITY DEFINER).
// RLS is enabled on both tables (007_enable_rls.sql): public SELECT, but
// INSERT/UPDATE require `authenticated`. The RPCs themselves are additionally
// restricted to `authenticated` callers (010_secure_stat_rpcs.sql) — being
// SECURITY DEFINER, they bypass RLS entirely, so that restriction is the
// actual gate, not the table policies.

/**
 * Push local state to Supabase (upsert). Silent on error — local data is source of truth.
 *
 * `CloudUserData`'s keys are the column names, so the row spreads straight in.
 * The hand-written column list this replaced was the fourth of six copies of
 * the synced field set; `toCloud` in the engine is now the only place the
 * mapping is stated.
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
        ...data,
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

  // Every column runs through its field's decoder in the engine, including the
  // schema_version guard for rows written before that column existed. supabase-js
  // hands back `any`, and a present-but-null column crashes the same way a
  // missing one does — a bare `data.stats` is what used to throw on the first
  // screen after sign-in.
  return { data: fromCloud(data as Record<string, unknown>), error: null };
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

/**
 * Ask the database who it thinks is calling.
 *
 * This is the prerequisite check for enabling RLS. Running
 * `select auth.jwt()->>'sub'` in the Supabase SQL editor always returns NULL —
 * that connection carries no Clerk token — so the check is only meaningful made
 * from the app, signed in, over this same client.
 *
 * Signed in and correctly configured: `{ clerkUserId: 'user_2abc…', jwtRole:
 * 'authenticated' }`. A null clerkUserId means Clerk↔Supabase Third-Party Auth
 * is not connected yet, and enabling RLS would break every write.
 *
 * Requires supabase/migrations/006_auth_check.sql.
 */
export async function checkAuthBridge(): Promise<{
  clerkUserId: string | null;
  jwtRole: string | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase.rpc('whoami').single();
    if (error) return { clerkUserId: null, jwtRole: null, error: error.message };
    const row = data as { clerk_user_id: string | null; jwt_role: string | null } | null;
    return {
      clerkUserId: row?.clerk_user_id ?? null,
      jwtRole: row?.jwt_role ?? null,
      error: null,
    };
  } catch (e) {
    return {
      clerkUserId: null,
      jwtRole: null,
      error: e instanceof Error ? e.message : 'Could not reach the server',
    };
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
