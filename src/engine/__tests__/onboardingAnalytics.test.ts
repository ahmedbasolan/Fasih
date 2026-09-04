import { shouldRecordOnboarding } from '../onboardingAnalytics';
import { STRINGS } from '../../constants/strings';

/**
 * Jest runs in Node; the app never does. tsconfig sets `types: ["jest"]`
 * deliberately, so `@types/node` is not in global scope and application code
 * cannot reach for `process` or `Buffer` by accident. These two declarations
 * buy back exactly what this file needs without widening that scope.
 */
declare const __dirname: string;
declare function require(id: 'fs'): { readFileSync(path: string, encoding: 'utf8'): string };
declare function require(id: 'path'): { join(...parts: string[]): string };

const { readFileSync } = require('fs');
const { join } = require('path');

const ON = { analyticsEnabled: true, analyticsOnboardingSent: false };
const VALID = { role: 'hospitality', goals: ['professional'] };

describe('shouldRecordOnboarding', () => {
  it('writes for a complete profile with collection on and nothing sent', () => {
    expect(shouldRecordOnboarding(ON, VALID)).toBe(true);
  });

  it('does not write when the learner has opted out', () => {
    expect(shouldRecordOnboarding({ ...ON, analyticsEnabled: false }, VALID)).toBe(false);
  });

  it('does not write twice per install', () => {
    // Rows carry no identifier, so uniqueness cannot be enforced in the
    // database. This flag is the only guard there is.
    expect(shouldRecordOnboarding({ ...ON, analyticsOnboardingSent: true }, VALID)).toBe(false);
  });

  it('opt-out wins over an unsent flag', () => {
    expect(
      shouldRecordOnboarding({ analyticsEnabled: false, analyticsOnboardingSent: false }, VALID),
    ).toBe(false);
  });

  it('skips a profile with no role, which the NOT NULL column would reject', () => {
    expect(shouldRecordOnboarding(ON, { role: undefined, goals: ['culture'] })).toBe(false);
    expect(shouldRecordOnboarding(ON, { role: '', goals: ['culture'] })).toBe(false);
  });

  it('skips empty and oversized goal lists, matching the array_length CHECK', () => {
    expect(shouldRecordOnboarding(ON, { role: 'hospitality', goals: [] })).toBe(false);
    expect(
      shouldRecordOnboarding(ON, {
        role: 'hospitality',
        goals: ['a', 'b', 'c', 'd', 'e', 'f'],
      }),
    ).toBe(false);
  });

  it('accepts the full five goals', () => {
    expect(
      shouldRecordOnboarding(ON, {
        role: 'hospitality',
        goals: ['professional', 'friends', 'culture', 'daily', 'career'],
      }),
    ).toBe(true);
  });
});

/**
 * The drift this exists to catch, stated in the spec and in the migration:
 *
 *   "A ninth role added to the app without being added here fails the check,
 *    and the client drops the write silently rather than breaking onboarding —
 *    so the constraint and the strings file MUST be changed together."
 *
 * Silently is the problem. Without this test, adding a role to STRINGS ships a
 * build where every learner in that role contributes no data at all, and
 * nothing anywhere reports it. The SQL is parsed rather than duplicated,
 * because a hand-copied list in the test is one more thing to drift.
 */
describe('migration CHECK constraints match STRINGS', () => {
  const sql = readFileSync(
    join(__dirname, '../../../supabase/migrations/009_onboarding_selections.sql'),
    'utf8',
  );

  function quotedValuesAfter(marker: string): string[] {
    const at = sql.indexOf(marker);
    expect(at).toBeGreaterThan(-1);
    const close = sql.indexOf(')', at);
    return [...sql.slice(at, close).matchAll(/'([a-z_]+)'/g)].map((m) => m[1]).sort();
  }

  it('the role CHECK lists exactly the STRINGS.onboarding.roles keys', () => {
    expect(quotedValuesAfter('role         text not null')).toEqual(
      Object.keys(STRINGS.onboarding.roles).sort(),
    );
  });

  it('the goals CHECK lists exactly the STRINGS.onboarding.goals keys', () => {
    expect(quotedValuesAfter('and goals <@ array[')).toEqual(
      Object.keys(STRINGS.onboarding.goals).sort(),
    );
  });

  it('the goals CHECK upper bound matches the number of goals offered', () => {
    const bound = sql.match(/array_length\(goals, 1\) between 1 and (\d+)/);
    expect(bound).not.toBeNull();
    expect(Number(bound![1])).toBe(Object.keys(STRINGS.onboarding.goals).length);
  });
});

/**
 * The single most important line in the schema, per the spec: role + goals +
 * an exact second, joined against user_data.created_at, would often identify
 * one person. `date` cannot be joined that way.
 *
 * This is the kind of thing a well-meaning later change ("we should know WHEN")
 * quietly reverses, so it fails a test rather than a review.
 */
describe('completed_on stays a date', () => {
  const sql = readFileSync(
    join(__dirname, '../../../supabase/migrations/009_onboarding_selections.sql'),
    'utf8',
  );

  it('is declared date, not timestamptz', () => {
    expect(sql).toMatch(/completed_on date not null default current_date/);
    expect(sql).not.toMatch(/completed_on\s+timestamp/i);
  });

  it('grants insert and nothing else to authenticated', () => {
    // The whole table's security rests on there being no SELECT policy. A
    // SELECT policy added later would let any signed-in user read every
    // learner's answers.
    expect(sql).toMatch(/GRANT\s+INSERT\s+ON\s+public\.onboarding_selections\s+TO\s+authenticated/);
    expect(sql).toMatch(/REVOKE\s+ALL\s+ON\s+public\.onboarding_selections\s+FROM\s+anon,\s*authenticated/);
    expect(sql).not.toMatch(/FOR\s+SELECT/i);
    expect(sql).not.toMatch(/FOR\s+UPDATE/i);
    expect(sql).not.toMatch(/FOR\s+DELETE/i);
  });
});
