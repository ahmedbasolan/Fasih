import { ROLE_CATEGORIES, categoriesForRole, phraseCountForRole } from '../roleCategories';
import { PHRASES } from '../../constants/phrases';

// Mirrors PROFESSION_CATEGORIES in ProfileSteps.tsx. Duplicated deliberately:
// the component's list is UI data and this asserts the two agree.
const ROLE_IDS = [
  'hospitality',
  'food_beverage',
  'retail_sales',
  'health_wellness',
  'transport_logistics',
  'property_facilities',
  'office_corporate',
  'education_childcare',
];

describe('role to phrase categories', () => {
  it('maps every role the role screen offers', () => {
    for (const id of ROLE_IDS) {
      expect(Object.keys(ROLE_CATEGORIES)).toContain(id);
    }
  });

  it('maps no role the role screen does not offer', () => {
    // A stale key here renders for nobody and hides a rename.
    expect(Object.keys(ROLE_CATEGORIES).sort()).toEqual([...ROLE_IDS].sort());
  });

  it('gives every role two or three categories', () => {
    for (const id of ROLE_IDS) {
      const n = categoriesForRole(id).length;
      expect(n).toBeGreaterThanOrEqual(2);
      expect(n).toBeLessThanOrEqual(3);
    }
  });

  it('maps only to categories phrases actually carry', () => {
    const real = new Set(PHRASES.map(p => p.category));
    for (const id of ROLE_IDS) {
      for (const cat of categoriesForRole(id)) {
        expect(real.has(cat)).toBe(true);
      }
    }
  });

  it('resolves every role to a non-zero phrase count', () => {
    // The payoff screen shows this number. A role resolving to zero would
    // render an empty boast on the screen meant to prove the app listened.
    for (const id of ROLE_IDS) {
      expect(phraseCountForRole(id)).toBeGreaterThan(0);
    }
  });

  it('leads each role with a category that is not universal', () => {
    // Greetings and Everyday apply to every job, so a mapping that leads with
    // one of them is not personalisation, it is filler.
    const universal = ['Greetings', 'Everyday'];
    for (const id of ROLE_IDS) {
      expect(universal).not.toContain(categoriesForRole(id)[0]);
    }
  });

  it('returns empty for an unknown role rather than throwing', () => {
    expect(categoriesForRole('not_a_role')).toEqual([]);
    expect(phraseCountForRole('not_a_role')).toBe(0);
  });
});
