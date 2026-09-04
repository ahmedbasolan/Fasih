import { SPACE, SCREEN_MARGIN, RADIUS } from '../../components/design/spacing';

describe('spacing scale', () => {
  it('is exactly the scale the spec fixes', () => {
    expect(Object.values(SPACE)).toEqual([4, 8, 12, 16, 24, 32, 48, 64]);
  });

  it('ascends with no duplicates', () => {
    const values = Object.values(SPACE);
    expect([...values].sort((a, b) => a - b)).toEqual(values);
    expect(new Set(values).size).toBe(values.length);
  });

  it('keeps the screen margin off-scale and documented', () => {
    // 20 is deliberately not on the scale — it matches the existing safe-area
    // gutter. It is the only exception the spec allows.
    expect(SCREEN_MARGIN).toBe(20);
    expect(Object.values(SPACE)).not.toContain(SCREEN_MARGIN);
  });
});

describe('radius budget', () => {
  it('allows only the sheet, the pill, and flat', () => {
    expect(RADIUS).toEqual({ sheet: 24, pill: 999, flat: 0 });
  });
});
