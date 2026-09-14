import { PERSISTED_KEYS, DEVICE_SCOPED_KEYS, pickPersisted, signOutReset } from '../persistedState';
import type { PersistedKey } from '../persistedState';
import type { LearningMilestone } from '../../types';

const MILESTONES: LearningMilestone[] = [
  { id: 'first-scenario', label: 'Cultural Explorer', description: 'x', reached: false },
];

const deviceScoped = new Set<string>(DEVICE_SCOPED_KEYS);

/**
 * The bug this exists to catch: patternProgress and secretEndingsEarned were
 * persisted and synced but missing from the sign-out reset, so the next account
 * on the device inherited the previous learner's Sentence Builder mastery and
 * hidden endings — then pushed them into its own cloud row.
 */
describe('signOutReset covers every persisted key', () => {
  const reset = signOutReset(MILESTONES);

  it('resets every persisted key that is not device-scoped', () => {
    const leaked = PERSISTED_KEYS.filter((k) => !deviceScoped.has(k) && !(k in reset));
    // A failure here names the key. Either add it to signOutReset, or — only if
    // it genuinely belongs to the install — to DEVICE_SCOPED_KEYS with a reason.
    expect(leaked).toEqual([]);
  });

  it('leaves device-scoped keys alone', () => {
    // Wiping these is the opposite bug: a returning user sent back through
    // onboarding, or an analytics opt-out silently switched back on.
    expect(DEVICE_SCOPED_KEYS.filter((k) => k in reset)).toEqual([]);
  });

  it('empties Sentence Builder progress and secret endings', () => {
    expect(reset.patternProgress).toEqual({});
    expect(reset.secretEndingsEarned).toEqual({});
  });

  it('hands back milestone copies, not the defaults themselves', () => {
    // The next learner's first milestone would otherwise mutate the template.
    expect(reset.milestones).toEqual(MILESTONES);
    expect(reset.milestones[0]).not.toBe(MILESTONES[0]);
  });
});

describe('pickPersisted', () => {
  it('picks exactly PERSISTED_KEYS and drops in-memory state', () => {
    const state = Object.fromEntries(
      [...PERSISTED_KEYS, 'isSyncing', '_hydrated'].map((k) => [k, k]),
    ) as Record<PersistedKey, unknown>;
    expect(Object.keys(pickPersisted(state)).sort()).toEqual([...PERSISTED_KEYS].sort());
  });

  it('never persists the active scenario run', () => {
    // It holds Set instances, which do not survive JSON.
    expect(PERSISTED_KEYS).not.toContain('activeScenarioState');
  });
});
