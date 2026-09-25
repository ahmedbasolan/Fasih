import { initialFor, ltrParagraph } from '../text';

const LRI = '⁦';
const PDI = '⁩';

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

/**
 * The defect: a note's rendered direction depended on which word its author
 * happened to start with. A note opening with the Arabic it discusses laid the
 * whole English sentence out right-to-left.
 */
describe('ltrParagraph', () => {
  // The real shape of the bug, from the onboarding café scenario.
  const opensWithArabic =
    'لو سمحت is the Gulf "please" — what you will actually hear in Dubai, ' +
    'where من فضلك sounds like a textbook.';

  it('isolates a note that opens with Arabic', () => {
    // Without the isolate, this string's first strong character is Arabic, so
    // the bidi algorithm makes the whole English paragraph RTL.
    expect(ltrParagraph(opensWithArabic)).toBe(`${LRI}${opensWithArabic}${PDI}`);
  });

  it('isolates a note that only mentions Arabic mid-sentence', () => {
    // These render correctly today, by luck. Wrapping them too is what makes
    // the result independent of word order rather than independent of it only
    // for the notes that currently happen to be fine.
    const midSentence = 'Omar uses شنو for "what" — you will hear it constantly.';
    expect(ltrParagraph(midSentence)).toBe(`${LRI}${midSentence}${PDI}`);
  });

  it('leaves pure English untouched', () => {
    const english = 'Omar hands you the coffee with a polite smile.';
    expect(ltrParagraph(english)).toBe(english);
  });

  it('preserves the original text inside the wrapper', () => {
    // The isolate is presentation. The stored string is governed by the
    // language authority and must survive unmodified.
    expect(ltrParagraph(opensWithArabic).replaceAll(LRI, '').replaceAll(PDI, ''))
      .toBe(opensWithArabic);
  });

  it('is idempotent, so a double-wrapped note is not double-isolated', () => {
    // Already-wrapped text still contains Arabic, so a naive implementation
    // would nest a second isolate every time it passed through.
    const once = ltrParagraph(opensWithArabic);
    expect(ltrParagraph(once)).toBe(once);
  });

  it('handles an empty note without wrapping it', () => {
    expect(ltrParagraph('')).toBe('');
  });
});
