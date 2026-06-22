import { parseShellWords as legacyParseShellWords } from '../../src/shared/shell-words.js';
import { parseShellWords as packageParseShellWords } from '../../packages/shared/src/shell-words.js';

describe('parseShellWords', () => {
  it('keeps package-owned and legacy shared shell word parsing aligned', () => {
    const command = "pnpm test --filter '$shared package' --flag=value";

    expect(packageParseShellWords(command)).toEqual(legacyParseShellWords(command));
    expect(packageParseShellWords(command)).toEqual(['pnpm', 'test', '--filter', '$shared package', '--flag=value']);
  });
});
