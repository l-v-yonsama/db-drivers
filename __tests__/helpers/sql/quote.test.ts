import {
  quoteIdentifier,
  quoteStringLiteral,
  wrapDoubleQuote,
  wrapSingleQuote,
} from '../../../src';

describe('quote helpers', () => {
  it('quotes raw string values that already look quoted', () => {
    expect(quoteStringLiteral("'abc'")).toBe("'''abc'''");
  });

  it('quotes raw identifiers that already look quoted', () => {
    expect(quoteIdentifier('"name"')).toBe('"""name"""');
  });

  it('keeps the existing idempotent wrap behavior', () => {
    expect(wrapSingleQuote("'abc'")).toBe("'abc'");
    expect(wrapDoubleQuote('"name"')).toBe('"name"');
  });
});
