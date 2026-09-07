import type { LearningMilestone } from '../types';

/**
 * The milestone list every new install starts from.
 *
 * Moved out of `useAppStore` so `FIELD_POLICY` (src/engine/syncedProgress.ts)
 * can own the sign-out reset value for `milestones` alongside every other
 * field's. A reset value that lived in the store would keep the sign-out list
 * split across two files, which is the drift the policy table exists to stop.
 *
 * `MILESTONE_CHECKS` — the predicates that decide when each of these is
 * reached — deliberately stays in the store: it reads store state, whereas this
 * is inert data.
 */
export const DEFAULT_MILESTONES: LearningMilestone[] = [
  { id: 'first-scenario', label: 'Cultural Explorer', description: 'You completed your first cultural scenario', reached: false },
  { id: 'greetings-3', label: 'Three Ways to Say Hello', description: 'You can now greet someone in 3 different ways', reached: false },
  { id: 'hospitality', label: 'Emirati Hospitality', description: 'You\'ve learned the art of Emirati hospitality phrases', reached: false },
  { id: 'week-learner', label: 'One Week of Learning', description: 'You\'ve been learning for 7 days', reached: false },
  { id: 'phrases-10', label: 'Growing Vocabulary', description: 'You\'ve studied 10 unique phrases', reached: false },
  { id: 'all-categories', label: 'Well-Rounded Learner', description: 'You\'ve explored phrases from every category', reached: false },
  { id: 'scenarios-3', label: 'Story Weaver', description: 'You\'ve navigated 3 different cultural conversations', reached: false },
  { id: 'mastered-5', label: 'Building Confidence', description: '5 phrases are now part of your active vocabulary', reached: false },
];

/** A fresh copy — callers mutate their own milestone objects, so never share these. */
export const freshMilestones = (): LearningMilestone[] =>
  DEFAULT_MILESTONES.map((m) => ({ ...m }));
