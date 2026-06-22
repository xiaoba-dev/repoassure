import { shellQuoteArg as legacyShellQuoteArg } from '../../src/shared/shell-quote.js';
import { shellQuoteArg } from '../../packages/acceptance/src/index.js';
import { shellQuoteArg as packageShellQuoteArg } from '../../packages/shared/src/shell-quote.js';
import { parseShellWords as packageParseShellWords } from '../../packages/shared/src/shell-words.js';

describe('shellQuoteArg', () => {
  it('keeps simple shell arguments unquoted', () => {
    expect(shellQuoteArg('tests/hardening')).toBe('tests/hardening');
  });

  it('single-quotes arguments with spaces', () => {
    expect(shellQuoteArg('tests with spaces/hardening')).toBe("'tests with spaces/hardening'");
  });

  it('uses one-line ANSI-C quoting for control characters', () => {
    expect(shellQuoteArg("first line\nsecond 'line'\tend")).toBe("$'first line\\nsecond \\'line\\'\\tend'");
  });

  it('keeps the package-owned shell quote helper aligned with the shared legacy implementation', () => {
    const samples = [
      'tests/hardening',
      'tests with spaces/hardening',
      "first line\nsecond 'line'\tend",
      'http://127.0.0.1:5173/path?query=value'
    ];

    for (const sample of samples) {
      expect(shellQuoteArg(sample)).toBe(legacyShellQuoteArg(sample));
    }
  });

  it('keeps package-owned and legacy shared shell helpers aligned', () => {
    const quoted = packageShellQuoteArg("first line\nsecond 'line'\tend");

    expect(quoted).toBe(legacyShellQuoteArg("first line\nsecond 'line'\tend"));
    expect(packageParseShellWords(`cmd ${quoted}`)).toEqual(['cmd', "first line\nsecond 'line'\tend"]);
  });
});
