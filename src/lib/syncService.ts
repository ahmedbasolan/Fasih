/**
 * Supabase progress sync service.
 *
 * Required Supabase table (run once in your Supabase SQL editor):
 *
 *   CREATE TABLE user_data (
 *     user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 *     user_profile  JSONB NOT NULL DEFAULT '{}',
 *     stats         JSONB NOT NULL DEFAULT '{}',
 *     phrase_reviews        JSONB NOT NULL DEFAULT '{}',
 *     completed_scenarios   JSONB NOT NULL DEFAULT '{}',
 *     saved_phrases         TEXT[] NOT NULL DEFAULT '{}',
 *     milestones    JSONB NOT NULL DEFAULT '[]',
 *     journal       JSONB NOT NULL DEFAULT '[]',
 *     last_active_date      TEXT,
 *     subscription_status   TEXT NOT NULL DEFAULT 'free',
 *     trial_started_at      TEXT,
 *     trial_plan    TEXT,
 *     updated_at    TIMESTAMPTZ DEFAULT NOW()
 *   );
 *
 *   ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
 *
 *   CREATE POLICY "Users own their data" ON user_data
 *     FOR ALL USING (auth.uid() = user_id);
 */

import { supabase } from './supabase';
import type { UserProfile, UserStats, PhraseReviewData, LearningMilestone, JournalEntry, SubscriptionStatus } from '../types';

// ─── Community stats ─────────────────────────────────────────────────────────
//
// Required Supabase tables + RPC functions (run once in SQL editor):
//
//   CREATE TABLE scenario_choice_stats (
//     scenario_id TEXT NOT NULL,
//     scene_id    TEXT NOT NULL,
//     choice_id   TEXT NOT NULL,
//     pick_count  BIGINT NOT NULL DEFAULT 1,
//     PRIMARY KEY (scenario_id, scene_id, choice_id)
//   );
//   ALTER TABLE scenario_choice_stats ENABLE ROW LEVEL SECURITY;
//   CREATE POLICY "Public read" ON scenario_choice_stats FOR SELECT USING (true);
//   CREATE POLICY "Auth write" ON scenario_choice_stats FOR ALL USING (auth.uid() IS NOT NULL);
//
//   CREATE TABLE scenario_ending_stats (
//     scenario_id TEXT NOT NULL,
//     ending_type TEXT NOT NULL,
//     reach_count BIGINT NOT NULL DEFAULT 1,
//     PRIMARY KEY (scenario_id, ending_type)
//   );
//   ALTER TABLE scenario_ending_stats ENABLE ROW LEVEL SECURITY;
//   CREATE POLICY "Public read" ON scenario_ending_stats FOR SELECT USING (true);
//   CREATE POLICY "Auth write" ON scenario_ending_stats FOR ALL USING (auth.uid() IS NOT NULL);
//
//   CREATE OR REPLACE FUNCTION increment_choice_stat(
//     p_scenario_id TEXT, p_scene_id TEXT, p_choice_id TEXT
//   ) RETURNS void LANGUAGE sql AS $$
//     INSERT INTO scenario_choice_stats(scenario_id, scene_id, choice_id, pick_count)
//     VALUES (p_scenario_id, p_scene_id, p_choice_id, 1)
//     ON CONFLICT (scenario_id, scene_id, choice_id)
//     DO UPDATE SET pick_count = scenario_choice_stats.pick_count + 1;
//   $$;
//
//   CREATE OR REPLACE FUNCTION increment_ending_stat(
//     p_scenario_id TEXT, p_ending_type TEXT
//   ) RETURNS void LANGUAGE sql AS $$
//     INSERT INTO scenario_ending_stats(scenario_id, ending_type, reach_count)
//     VALUES (p_scenario_id, p_ending_type, 1)
//     ON CONFLICT (scenario_id, ending_type)
//     DO UPDATE SET reach_count = scenario_ending_stats.reach_count + 1;
//   $$;

export interface CloudUserData {
  user_profile: UserProfile | null;
  stats: UserStats;
  phrase_reviews: Record<string, PhraseReviewData>;
  completed_scenarios: Record<string, { endingType: string; date: string }>;
  saved_phrases: string[];
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
        user_profile: data.user_profile,
        stats: data.stats,
        phrase_reviews: data.phrase_reviews,
        completed_scenarios: data.completed_scenarios,
        saved_phrases: data.saved_phrases,
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

  return {
    data: {
      user_profile: data.user_profile ?? null,
      stats: data.stats ?? {},
      phrase_reviews: data.phrase_reviews ?? {},
      completed_scenarios: data.completed_scenarios ?? {},
      saved_phrases: data.saved_phrases ?? [],
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
