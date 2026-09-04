import { initialFor } from '../text';

describe('initialFor', () => {
  it('uppercases the first letter', () => {
    expect(initialFor('ahmed')).toBe('A');
  });

  it('ignores leading whitespace', () => {
    expect(initialFor('  maya')).toBe('M');
  });

  it('falls back for an empty or whitespace-only name', () => {
    expect(initialFor('')).toBe('—');
    expect(initialFor('   ')).toBe('—');
  });

  it('handles a non-Latin first character', () => {
    // Arabic has no case, so uppercasing is a no-op rather than a corruption.
    expect(initialFor('أحمد')).toBe('أ');
  });

  it('takes the whole first code point, not the first UTF-16 unit', () => {
    expect(initialFor('🙂 hello')).toBe('🙂');
  });
});
