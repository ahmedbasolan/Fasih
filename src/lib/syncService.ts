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
import type { UserProfile, UserStats, PhraseReviewData, LearningMilestone, JournalEntry, SubscriptionStatus, PatternProgress } from '../types';
import { DEFAULT_USER_STATS } from '../types';
import { reportServiceError } from './analytics';
import { endingPercentages } from '../engine/scenarioPresentation';

/**
 * Coerce whatever the `stats` column holds into a complete UserStats.
 *
 * The column is `JSONB NOT NULL DEFAULT '{}'`, so `{}` is a perfectly ordinary
 * value for a row that was created by anything other than pushProgress. The old
 * code returned it as-is behind a `UserStats` annotation — supabase-js hands back
 * `any`, so nothing type-checked it — and the store then wrote it straight over
 * good local state. The next call after that is checkMilestones(), which reads
 * `stats.scenariosCompleted.length` and threw on the first screen after sign-in.
 *
 * Every field is defaulted individually rather than by a single spread, because
 * a present-but-null field (e.g. `{"scenariosCompleted": null}`) survives a
 * spread and crashes exactly the same way.
 */
function normalizeStats(raw: unknown): UserStats {
  const s = (raw && typeof raw === 'object' ? raw : {}) as Partial<UserStats>;
  return {
    daysActive: typeof s.daysActive === 'number' ? s.daysActive : DEFAULT_USER_STATS.daysActive,
    currentStreak: typeof s.currentStreak === 'number' ? s.currentStreak : DEFAULT_USER_STATS.currentStreak,
    phrasesMastered: typeof s.phrasesMastered === 'number' ? s.phrasesMastered : DEFAULT_USER_STATS.phrasesMastered,
    phrasesStudied: typeof s.phrasesStudied === 'number' ? s.phrasesStudied : DEFAULT_USER_STATS.phrasesStudied,
    scenariosCompleted: Array.isArray(s.scenariosCompleted) ? s.scenariosCompleted : [],
    categoryMastery:
      s.categoryMastery && typeof s.categoryMastery === 'object' ? s.categoryMastery : {},
  };
}

/** Same reasoning as normalizeStats, for the collection-shaped columns. */
function asRecord<T>(raw: unknown): Record<string, T> {
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, T>) : {};
}

function asArray<T>(raw: unknown): T[] {
  return Array.isArray(raw) ? (raw as T[]) : [];
}

/**
 * Increment this when CloudUserData shape changes in a breaking way.
 * pullProgress uses it to detect stale cloud rows.
 * History: 1 = initial; 2 = added schema_version + gender + unlocked_phrase_ids;
 *          3 = added pattern_progress + secret_endings_earned (Sentence Builder);
 *          4 = added endings_found + scenario_runs (replay loop, migration 011)
 */
export const CURRENT_SCHEMA_VERSION = 4;

// ─── Community stats ─────────────────────────────────────────────────────────
// Schema lives in supabase/migrations/001_initial_schema.sql.
// These tables use RPC functions for atomic increments (SECURITY DEFINER).
// RLS is enabled on both tables (007_enable_rls.sql): public SELECT, but
// INSERT/UPDATE require `authenticated`. The RPCs themselves are additionally
// restricted to `authenticated` callers (010_secure_stat_rpcs.sql) — being
// SECURITY DEFINER, they bypass RLS entirely, so that restriction is the
// actual gate, not the table policies.

export interface CloudUserData {
  schema_version: number;
  user_profile: UserProfile | null;
  stats: UserStats;
  phrase_reviews: Record<string, PhraseReviewData>;
  completed_scenarios: Record<string, { endingType: string; date: string }>;
  pattern_progress: Record<string, PatternProgress>;  // Sentence Builder progress — must sync so reinstalls restore it
  secret_endings_earned: Record<string, string>;      // scenarioId → ending title; never lost on replay or reinstall
  endings_found: Record<string, string[]>;            // scenarioId → ending ids ever reached ("3 of 5 found")
  scenario_runs: Record<string, number>;              // scenarioId → completed runs (replays = runs > 1)
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
        pattern_progress: data.pattern_progress,
        secret_endings_earned: data.secret_endings_earned,
        endings_found: data.endings_found,
        scenario_runs: data.scenario_runs,
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
      stats: normalizeStats(data.stats),
      phrase_reviews: asRecord<PhraseReviewData>(data.phrase_reviews),
      completed_scenarios: asRecord<{ endingType: string; date: string }>(data.completed_scenarios),
      // Grammar-engine columns get the same treatment as everything else here:
      // `?? {}` only guards null, and these arrive from the same untyped
      // supabase-js payload that made a bare `data.stats` crash the app.
      pattern_progress: asRecord<PatternProgress>(data.pattern_progress),
      secret_endings_earned: asRecord<string>(data.secret_endings_earned),
      endings_found: asRecord<string[]>(data.endings_found),
      scenario_runs: asRecord<number>(data.scenario_runs),
      saved_phrases: asArray<string>(data.saved_phrases),
      unlocked_phrase_ids: asArray<string>(data.unlocked_phrase_ids),
      milestones: asArray<LearningMilestone>(data.milestones),
      journal: asArray<JournalEntry>(data.journal),
      last_active_date: data.last_active_date ?? null,
      subscription_status: data.subscription_status ?? 'free',
      trial_started_at: data.trial_started_at ?? null,
      trial_plan: data.trial_plan ?? null,
    },
    error: null,
  };
}

// ─── Community stat helpers ───────────────────────────────────────────────────

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
    // A Postgres-level refusal is not an exception, so it never reaches the
    // catch below. Reported here because a deletion that fails for everyone —
    // a dropped RPC, a permissions change — is a compliance problem that
    // otherwise surfaces only as one confused support email at a time.
    if (error) reportServiceError(error, 'syncService.deleteAccount');
    return { error: error?.message ?? null };
  } catch (e) {
    reportServiceError(e, 'syncService.deleteAccount');
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
  } catch {
    // Deliberately silent, and deliberately NOT reported to Sentry. Community
    // stats are a nice-to-have aggregate; a dropped write costs one row out of
    // many and the learner is unaffected. Wiring reportServiceError in here
    // would report once per choice made, offline or not.
  }
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

/**
 * Atomically increment the reach count for a scenario ending (fire-and-forget).
 * Pass the ending id — the column is named ending_type for history, see getEndingStats.
 */
export async function recordEndingStat(
  scenarioId: string,
  endingId: string,
): Promise<void> {
  try {
    await supabase.rpc('increment_ending_stat', {
      p_scenario_id: scenarioId,
      p_ending_type: endingId,
    });
  } catch {
    // Deliberately silent, and deliberately NOT reported to Sentry. Community
    // stats are a nice-to-have aggregate; a dropped write costs one row out of
    // many and the learner is unaffected. Wiring reportServiceError in here
    // would report once per choice made, offline or not.
  }
}

/**
 * Reach percentages for a scenario's endings, keyed by ending id (0–100).
 *
 * The `ending_type` column holds the ending id since the route scripts (spec
 * 2026-09-14): two destinations can share a type, so a type-keyed percentage
 * would describe neither. Older type-keyed rows are ignored rather than mixed
 * in. Empty until the scenario clears MIN_COMPLETIONS_FOR_STATS — see
 * endingPercentages for why.
 */
export async function getEndingStats(
  scenarioId: string,
  endingIds: string[],
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('scenario_ending_stats')
    .select('ending_type, reach_count')
    .eq('scenario_id', scenarioId);

  if (error || !data?.length) return {};
  return endingPercentages(
    data.map(row => ({ ending: row.ending_type as string, count: row.reach_count as number })),
    endingIds,
  );
}
