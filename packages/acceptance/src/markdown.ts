export function escapeMarkdownTableCell(value: string): string {
  return value.replace(/\r?\n|\r/g, ' ').replaceAll('|', '\\|');
}

export function formatMarkdownCodeCell(value: string): string {
  const escaped = escapeMarkdownTableCell(value);
  const fence = '`'.repeat(longestBacktickRun(escaped) + 1);
  const needsPadding = escaped.startsWith('`') || escaped.endsWith('`');
  const padded = needsPadding ? ` ${escaped} ` : escaped;

  return `${fence}${padded}${fence}`;
}

function longestBacktickRun(value: string): number {
  return value.match(/`+/g)?.reduce((longest, run) => Math.max(longest, run.length), 0) ?? 0;
}
