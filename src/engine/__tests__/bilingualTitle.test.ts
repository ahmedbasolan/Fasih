import { splitBilingualTitle } from '../text';
import { GRAMMAR_PATTERNS } from '../../constants/grammar';

describe('splitBilingualTitle', () => {
  it('splits on the em-dash separator', () => {
    expect(splitBilingualTitle('أنا ___ — I am ___')).toEqual({
      arabic: 'أنا ___',
      english: 'I am ___',
    });
  });

  it('keeps a title with no separator whole, as Arabic', () => {
    expect(splitBilingualTitle('كوّن')).toEqual({ arabic: 'كوّن', english: '' });
  });

  it('splits only on the first separator', () => {
    // A gloss may itself contain a dash. Splitting on every one would drop text.
    expect(splitBilingualTitle('مب ___ — not ___ — informal')).toEqual({
      arabic: 'مب ___',
      english: 'not ___ — informal',
    });
  });

  it('trims surrounding whitespace on both halves', () => {
    expect(splitBilingualTitle('يلا ___  —  let us ___')).toEqual({
      arabic: 'يلا ___',
      english: 'let us ___',
    });
  });

  it('handles a Latin-first title without misassigning the halves', () => {
    // `noun + my/your — ___ of mine` starts Latin. The first half is still the
    // pattern side and the second is still the gloss; the function is about
    // position, not script.
    expect(splitBilingualTitle('noun + my/your — ___ of mine')).toEqual({
      arabic: 'noun + my/your',
      english: '___ of mine',
    });
  });

  it('every shipped pattern title splits into two non-empty halves', () => {
    // The real defect: a title rendered as one string lets the bidi algorithm
    // reorder the trailing `?` of the gloss. Splitting is only safe if every
    // title actually has both halves.
    for (const p of GRAMMAR_PATTERNS) {
      const { arabic, english } = splitBilingualTitle(p.title);
      expect(arabic.length).toBeGreaterThan(0);
      expect(english.length).toBeGreaterThan(0);
    }
  });
});
