import {
  escapeMarkdownTableCell as escapeLegacyMarkdownTableCell,
  formatMarkdownCodeCell as formatLegacyMarkdownCodeCell
} from '../../src/internal/acceptance/markdown.js';
import {
  escapeMarkdownTableCell,
  formatMarkdownCodeCell
} from '../../packages/acceptance/src/markdown.js';

describe('markdown formatting helpers', () => {
  it('escapes table separators and normalizes all newline forms', () => {
    expect(escapeMarkdownTableCell('alpha|beta\r\ngamma\rdelta\nepsilon')).toBe('alpha\\|beta gamma delta epsilon');
  });

  it('formats markdown code cells with dynamic fences and boundary padding', () => {
    expect(formatMarkdownCodeCell('/tmp/real`app')).toBe('``/tmp/real`app``');
    expect(formatMarkdownCodeCell('`/tmp/report.md')).toBe('`` `/tmp/report.md ``');
    expect(formatMarkdownCodeCell('/tmp/findings.json`')).toBe('`` /tmp/findings.json` ``');
    expect(formatMarkdownCodeCell('/tmp/report``path.md')).toBe('```/tmp/report``path.md```');
  });

  it('escapes table characters before wrapping code cells', () => {
    expect(formatMarkdownCodeCell('pnpm test -- --grep `route|smoke`\nnext')).toBe("``pnpm test -- --grep `route\\|smoke` next``");
  });

  it('keeps the legacy src compatibility helper aligned with the package implementation', () => {
    const samples = [
      'alpha|beta\r\ngamma',
      '/tmp/real`app',
      '`/tmp/report.md',
      '/tmp/report``path.md',
      'pnpm test -- --grep `route|smoke`\nnext'
    ];

    for (const sample of samples) {
      expect(escapeLegacyMarkdownTableCell(sample)).toBe(escapeMarkdownTableCell(sample));
      expect(formatLegacyMarkdownCodeCell(sample)).toBe(formatMarkdownCodeCell(sample));
    }
  });
});
