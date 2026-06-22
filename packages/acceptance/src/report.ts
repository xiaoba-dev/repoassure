import { escapeMarkdownTableCell, formatMarkdownCodeCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';

export type AcceptanceCheckStatus = 'passed' | 'failed' | 'skipped';
export type AcceptanceOverallStatus = 'passed' | 'failed';

export interface AcceptanceCheck {
  name: string;
  category: string;
  required: boolean;
  status: AcceptanceCheckStatus;
  durationMs?: number;
  command?: string;
  detail?: string;
}

export interface AcceptanceSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  requiredFailed: number;
  status: AcceptanceOverallStatus;
}

export interface BuildAcceptanceMarkdownInput {
  generatedAt: string;
  mode: 'standard' | 'full';
  outputPath: string;
  summary: AcceptanceSummary;
  checks: AcceptanceCheck[];
}

export function summarizeAcceptanceChecks(checks: AcceptanceCheck[]): AcceptanceSummary {
  const passed = checks.filter((check) => check.status === 'passed').length;
  const failed = checks.filter((check) => check.status === 'failed').length;
  const skipped = checks.filter((check) => check.status === 'skipped').length;
  const requiredFailed = checks.filter((check) => check.required && check.status === 'failed').length;

  return {
    total: checks.length,
    passed,
    failed,
    skipped,
    requiredFailed,
    status: requiredFailed === 0 ? 'passed' : 'failed'
  };
}

export function buildAcceptanceMarkdown(input: BuildAcceptanceMarkdownInput): string {
  const groupedChecks = groupChecksByCategory(input.checks);
  const checkSections = Object.entries(groupedChecks)
    .map(([category, checks]) => formatCheckSection(category, checks))
    .join('\n\n');

  return `# MVP 验收运行报告

生成时间：${input.generatedAt}

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收模式 | ${input.mode === 'full' ? 'full' : 'standard'} |
| 总体结论 | ${input.summary.status === 'passed' ? '通过' : '未通过'} |
| 检查总数 | ${input.summary.total} |
| 通过 | ${input.summary.passed} |
| 失败 | ${input.summary.failed} |
| 跳过 | ${input.summary.skipped} |
| 必需项失败 | ${input.summary.requiredFailed} |
| 报告路径 | ${formatAcceptanceCodeCell(input.outputPath)} |

${checkSections}

## 判定规则

只有必需项全部通过时，本次验收运行才视为通过。跳过项不计为失败，但必须在人工验收时确认是否需要补跑。
`;
}

function groupChecksByCategory(checks: AcceptanceCheck[]): Record<string, AcceptanceCheck[]> {
  return checks.reduce<Record<string, AcceptanceCheck[]>>((groups, check) => {
    groups[check.category] = [...(groups[check.category] ?? []), check];
    return groups;
  }, {});
}

function formatCheckSection(category: string, checks: AcceptanceCheck[]): string {
  return `## ${category}

| 检查项 | 必需 | 状态 | 耗时 | 命令 | 说明 |
| --- | --- | --- | ---: | --- | --- |
${checks.map(formatCheckRow).join('\n')}`;
}

function formatCheckRow(check: AcceptanceCheck): string {
  return `| ${escapeMarkdownTableCell(check.name)} | ${check.required ? '是' : '否'} | ${formatStatus(check.status)} | ${formatDuration(check.durationMs)} | ${check.command ? formatAcceptanceCodeCell(check.command) : 'n/a'} | ${escapeMarkdownTableCell(redactSensitiveText(check.detail ?? ''))} |`;
}

function formatAcceptanceCodeCell(value: string): string {
  return formatMarkdownCodeCell(redactSensitiveText(value));
}

function formatStatus(status: AcceptanceCheckStatus): string {
  if (status === 'passed') {
    return '通过';
  }

  if (status === 'failed') {
    return '失败';
  }

  return '跳过';
}

function formatDuration(durationMs: number | undefined): string {
  if (durationMs === undefined) {
    return 'n/a';
  }

  const seconds = Math.round(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
}
