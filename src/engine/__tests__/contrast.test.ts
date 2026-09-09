import { parseColor, composite, relativeLuminance, contrastRatio } from '../contrast';
import { darkTheme, lightTheme } from '../../components/design/tokens';

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

  it('throws on an out-of-range channel rather than computing with it', () => {
    // Shape is not enough. A transposed digit — 214 becoming 2140 — matches the
    // pattern, and compositing with it puts the luminance outside [0,1] and can
    // produce a ratio ABOVE 4.5, so the token guard would pass on nonsense.
    expect(() => parseColor('rgba(243,233,2140,0.72)')).toThrow(/out of range/);
    expect(() => parseColor('rgb(300, 0, 0)')).toThrow(/out of range/);
  });

  it('throws on an alpha above 1 — a percentage written as a fraction', () => {
    expect(() => parseColor('rgba(0,0,0,72)')).toThrow(/out of range/);
  });

  it('still accepts the boundary values', () => {
    expect(parseColor('rgba(255,255,255,1)')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    expect(parseColor('rgba(0,0,0,0)')).toEqual({ r: 0, g: 0, b: 0, a: 0 });
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

/**
 * Text sitting on a fill made of the accent, rather than on the page ground.
 *
 * This is the app's most-repeated contrast mistake and it has now shipped three
 * times: ShimmerButton and PhraseBuilder both used hardcoded white, and the
 * onboarding unlocked-phrase card used TEXT/TEXT2. All three are cream tokens
 * built for a dark ground, and all three were placed on gold.
 *
 * The card measured 1.25:1 in dark and 2.11:1 in light — on the one screen the
 * whole taster scenario builds towards. C.BG measures 8.24 and 5.37.
 *
 * The tests above check the contrast MATHS. These check the app's actual
 * pairings, which is the part that kept regressing.
 */
describe('text on a gold fill', () => {
  const themes = [
    { name: 'dark', C: darkTheme },
    { name: 'light', C: lightTheme },
  ];

  for (const { name, C } of themes) {
    // The unlocked-phrase card is a [PRIMARY -> JADE] gradient, so a label has
    // to clear BOTH stops — passing against one end is not passing.
    const stops = [
      { at: 'PRIMARY stop', fill: C.PRIMARY },
      { at: 'JADE stop', fill: C.JADE },
    ];

    for (const { at, fill } of stops) {
      it(`${name}: C.BG label clears AA on the ${at}`, () => {
        expect(contrastRatio(C.BG, fill)).toBeGreaterThanOrEqual(4.5);
      });

      it(`${name}: the cream text tokens do NOT clear it, on the ${at}`, () => {
        // Pins the reason C.BG is the convention. If a future palette makes
        // these pass, the rule can be revisited deliberately rather than by
        // someone assuming a text token is safe anywhere text goes.
        expect(contrastRatio(C.TEXT, fill)).toBeLessThan(4.5);
        expect(contrastRatio(C.TEXT2, fill)).toBeLessThan(4.5);
      });
    }
  }
});
