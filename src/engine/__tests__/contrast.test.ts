import { parseColor, composite, relativeLuminance, contrastRatio } from '../contrast';

describe('parseColor', () => {
  it('parses 6-digit hex', () => {
    expect(parseColor('#14100B')).toEqual({ r: 20, g: 16, b: 11, a: 1 });
  });

  it('parses rgba with alpha', () => {
    expect(parseColor('rgba(243,233,214,0.72)')).toEqual({ r: 243, g: 233, b: 214, a: 0.72 });
  });

  it('parses rgb without alpha as opaque', () => {
    expect(parseColor('rgb(28, 21, 13)')).toEqual({ r: 28, g: 21, b: 13, a: 1 });
  });

  it('throws on an unsupported format rather than guessing', () => {
    expect(() => parseColor('rebeccapurple')).toThrow(/Unsupported/);
  });

  it('throws on a malformed numeric rather than yielding NaN', () => {
    // `1.2.3` is not a number. A looser group matched it, `Number()` gave NaN,
    // and the NaN travelled all the way to a contrast ratio that silently
    // compared false against every threshold. A typo'd token has to fail loudly.
    expect(() => parseColor('rgba(1.2.3,0,0,1)')).toThrow(/Unsupported/);
  });
});

describe('relativeLuminance', () => {
  it('is 0 for black and 1 for white', () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0, a: 1 })).toBeCloseTo(0, 5);
    expect(relativeLuminance({ r: 255, g: 255, b: 255, a: 1 })).toBeCloseTo(1, 5);
  });
});

describe('composite', () => {
  it('blends a translucent foreground onto an opaque ground', () => {
    const out = composite(
      { r: 0, g: 0, b: 0, a: 0.5 },
      { r: 255, g: 255, b: 255, a: 1 },
    );
    expect(out.r).toBeCloseTo(127.5, 4);
    expect(out.a).toBe(1);
  });
});

describe('contrastRatio', () => {
  it('is 21:1 for black on white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 4);
  });

  it('is 1:1 for a colour on itself', () => {
    expect(contrastRatio('#FBF6EC', '#FBF6EC')).toBeCloseTo(1, 4);
  });

  it('is order-independent', () => {
    expect(contrastRatio('#1C150D', '#FBF6EC')).toBeCloseTo(
      contrastRatio('#FBF6EC', '#1C150D'), 6,
    );
  });

  it('composites a translucent foreground before measuring', () => {
    // TEXT2 light on the Sadaf ground. Treating the token as opaque instead of
    // compositing it gives ~16.8 rather than ~6.9, so this pins the step.
    expect(contrastRatio('rgba(28,21,13,0.72)', '#FBF6EC')).toBeCloseTo(6.94, 1);
  });

  it('rejects a translucent background, which cannot be measured against', () => {
    expect(() => contrastRatio('#1C150D', 'rgba(0,0,0,0.5)')).toThrow(/opaque/);
  });
});
