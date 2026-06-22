import { escapeMarkdownTableCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';

export type GoalAuditItemStatus = 'passed' | 'missing' | 'manual_required';
export type GoalAuditOverallStatus = 'complete' | 'ready_for_user_acceptance' | 'incomplete';

export interface GoalAuditItem {
  requirement: string;
  category: string;
  status: GoalAuditItemStatus;
  evidence: string[];
  nextAction?: string;
}

export interface GoalAuditSummary {
  total: number;
  passed: number;
  missing: number;
  manualRequired: number;
  overallStatus: GoalAuditOverallStatus;
}

export interface BuildGoalAuditMarkdownInput {
  generatedAt: string;
  summary: GoalAuditSummary;
  items: GoalAuditItem[];
}

export function summarizeGoalAudit(items: GoalAuditItem[]): GoalAuditSummary {
  const passed = items.filter((item) => item.status === 'passed').length;
  const missing = items.filter((item) => item.status === 'missing').length;
  const manualRequired = items.filter((item) => item.status === 'manual_required').length;

  return {
    total: items.length,
    passed,
    missing,
    manualRequired,
    overallStatus: missing > 0 ? 'incomplete' : manualRequired > 0 ? 'ready_for_user_acceptance' : 'complete'
  };
}

export function buildGoalAuditMarkdown(input: BuildGoalAuditMarkdownInput): string {
  const sections = Object.entries(groupByCategory(input.items))
    .map(([category, items]) => formatCategorySection(category, items))
    .join('\n\n');

  return `# Goal 完成度审计

生成时间：${input.generatedAt}

## 摘要

| 项目 | 结果 |
| --- | --- |
| 总体状态 | ${formatOverallStatus(input.summary.overallStatus)} |
| 检查项总数 | ${input.summary.total} |
| 已通过 | ${input.summary.passed} |
| 缺失 | ${input.summary.missing} |
| 需要人工确认 | ${input.summary.manualRequired} |

${sections}

## 结论

${formatConclusion(input.summary)}
`;
}

function groupByCategory(items: GoalAuditItem[]): Record<string, GoalAuditItem[]> {
  return items.reduce<Record<string, GoalAuditItem[]>>((groups, item) => {
    groups[item.category] = [...(groups[item.category] ?? []), item];
    return groups;
  }, {});
}

function formatCategorySection(category: string, items: GoalAuditItem[]): string {
  return `## ${formatHeadingText(category)}

| 要求 | 状态 | 证据 | 下一步 |
| --- | --- | --- | --- |
${items.map(formatItemRow).join('\n')}`;
}

function formatItemRow(item: GoalAuditItem): string {
  return `| ${formatAuditTableCell(item.requirement)} | ${formatItemStatus(item.status)} | ${formatAuditTableCell(item.evidence.join('; '))} | ${formatAuditTableCell(item.nextAction ?? '')} |`;
}

function formatAuditTableCell(value: string): string {
  return escapeMarkdownTableCell(redactSensitiveText(value));
}

function formatHeadingText(value: string): string {
  return escapeMarkdownTableCell(redactSensitiveText(value)).replace(/^(#{1,6})(\s+)/gm, '\\$1$2');
}

function formatOverallStatus(status: GoalAuditOverallStatus): string {
  if (status === 'complete') {
    return '完成证据齐全';
  }

  return status === 'ready_for_user_acceptance' ? '已准备好请求用户验收' : '仍有缺失项';
}

function formatItemStatus(status: GoalAuditItemStatus): string {
  if (status === 'passed') {
    return '已通过';
  }

  if (status === 'manual_required') {
    return '需要人工确认';
  }

  return '缺失';
}

function formatConclusion(summary: GoalAuditSummary): string {
  if (summary.overallStatus === 'ready_for_user_acceptance') {
    return '自动可验证范围内没有缺失项；当前不能标记长期 goal complete，因为 `docs/goals/codex-goal.md` 明确要求用户确认 MVP 符合预期，仍需真实项目或用户人工验收结论。';
  }

  if (summary.overallStatus === 'complete') {
    return '自动可验证范围和用户验收结论均已有证据，可以进入长期 goal 完成审计。';
  }

  return '仍有自动可验证缺失项，必须先补齐缺失项，再请求用户验收。';
}
