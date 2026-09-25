import type { PhraseCategory } from '../types';
import { PHRASES } from '../constants/phrases';

/**
 * Which phrase categories belong to which job.
 *
 * A PRODUCT decision, not a linguistic one. This groups categories that
 * already exist; it introduces no Arabic and makes no claim about any
 * phrase's form, register or currency, so docs/language/authority.md and the
 * content pipeline are not engaged. Per CLAUDE.md rule 5, mapping a job title
 * to a set of topics is exactly the kind of call Ahmed makes.
 *
 * `Phrase` has no role or profession field, so this is the strongest honest
 * mapping available today. The stronger version — phrases tagged per
 * profession — is content work under the language authority and is out of
 * scope.
 *
 * ORDER MATTERS. The first entry is the role-distinctive category and is what
 * the screen leads with. `Greetings` (23 phrases) and `Everyday` (31) apply to
 * every job and dominate any count they appear in, so they are context and
 * never the headline. Measured across all eight roles the totals land between
 * 46 and 74 of 136 — the categories are the personalisation, the number is
 * only support.
 */
export const ROLE_CATEGORIES: Record<string, readonly PhraseCategory[]> = {
  hospitality:         ['Hospitality', 'Greetings', 'Workplace'],
  food_beverage:       ['Food & Drink', 'Hospitality', 'Greetings'],
  retail_sales:        ['Workplace', 'Gratitude', 'Greetings'],
  health_wellness:     ['Workplace', 'Everyday', 'Greetings'],
  transport_logistics: ['Gratitude', 'Everyday', 'Greetings'],
  property_facilities: ['Workplace', 'Everyday', 'Greetings'],
  office_corporate:    ['Workplace', 'Gratitude', 'Greetings'],
  education_childcare: ['Family', 'Everyday', 'Greetings'],
};

/** Categories for a role, distinctive one first. Empty for an unknown role. */
export function categoriesForRole(roleId: string): readonly PhraseCategory[] {
  return ROLE_CATEGORIES[roleId] ?? [];
}

/**
 * How many phrases the library holds for a role.
 *
 * Counted from PHRASES, never written down. A literal would be a fabricated
 * statistic on a screen whose whole purpose is to prove the app was listening,
 * and it would drift the moment a phrase is added.
 */
export function phraseCountForRole(roleId: string): number {
  const cats = categoriesForRole(roleId);
  if (cats.length === 0) return 0;
  return PHRASES.filter(p => cats.includes(p.category)).length;
}
