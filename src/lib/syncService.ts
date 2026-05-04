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
