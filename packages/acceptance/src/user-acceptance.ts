import { escapeMarkdownTableCell, formatMarkdownCodeCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';

export type UserAcceptanceCheckStatus = 'passed' | 'failed' | 'skipped';
export type UserAcceptanceRunStatus = 'passed' | 'failed';
export type UserDecision = 'pending' | 'accepted' | 'changes_requested';

export interface UserAcceptanceCheck {
  name: string;
  required: boolean;
  status: UserAcceptanceCheckStatus;
  evidence: string;
}

export interface UserAcceptanceSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  requiredFailed: number;
  runStatus: UserAcceptanceRunStatus;
}

export interface UserAcceptanceRecord {
  generatedAt: string;
  repoRoot: string;
  mode?: 'browser' | 'cli';
  command: string;
  decision: UserDecision;
  notes: string;
  readinessScore?: number;
  issueCounts?: {
    P0: number;
    P1: number;
    P2: number;
  };
  reportPath?: string;
  findingsPath?: string;
  checks: UserAcceptanceCheck[];
}

export function summarizeUserAcceptanceChecks(checks: UserAcceptanceCheck[]): UserAcceptanceSummary {
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
    runStatus: requiredFailed === 0 ? 'passed' : 'failed'
  };
}

export function buildUserAcceptanceMarkdown(record: UserAcceptanceRecord): string {
  const summary = summarizeUserAcceptanceChecks(record.checks);

  return `# 真实项目用户验收记录

生成时间：${record.generatedAt}

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | ${summary.runStatus === 'passed' ? '通过' : '未通过'} |
| 用户结论 | ${formatDecision(record.decision)} |
| 验收模式 | ${record.mode ?? 'browser'} |
| 真实项目路径 | ${formatUserAcceptanceSummaryPath(record.repoRoot)} |
| 验收命令 | ${formatMarkdownCodeCell(formatUserAcceptanceEvidenceCommand(record.command))} |
| 就绪度评分 | ${record.readinessScore ?? 'n/a'} |
| P0 | ${record.issueCounts?.P0 ?? 'n/a'} |
| P1 | ${record.issueCounts?.P1 ?? 'n/a'} |
| P2 | ${record.issueCounts?.P2 ?? 'n/a'} |
| hardening report | ${record.reportPath ? formatUserAcceptanceSummaryPath(record.reportPath) : 'n/a'} |
| findings | ${record.findingsPath ? formatUserAcceptanceSummaryPath(record.findingsPath) : 'n/a'} |
| 检查总数 | ${summary.total} |
| 通过 | ${summary.passed} |
| 失败 | ${summary.failed} |
| 跳过 | ${summary.skipped} |
| 必需项失败 | ${summary.requiredFailed} |

## Artifact 检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
${record.checks.map(formatCheckRow).join('\n')}

## 用户备注

${formatNotes(record.notes)}

## 验收判定

${formatAcceptanceConclusion(record.decision, summary)}

## 下一步

${formatNextSteps(record.decision, summary, record.mode ?? 'browser')}
`;
}

export function formatUserAcceptanceEvidenceCommand(command: string): string {
  return redactSensitiveText(command);
}

function formatUserAcceptanceSummaryPath(path: string): string {
  return formatMarkdownCodeCell(redactSensitiveText(findRepoPathPlaceholder(path) ?? path));
}

function findRepoPathPlaceholder(repoRoot: string): string | undefined {
  const segments = repoRoot.split(/[\\/]+/);

  return segments.find((segment) => /^<[^<>]+>$/.test(segment));
}

function formatCheckRow(check: UserAcceptanceCheck): string {
  return `| ${escapeMarkdownTableCell(check.name)} | ${check.required ? '是' : '否'} | ${formatStatus(check.status)} | ${escapeMarkdownTableCell(redactSensitiveText(check.evidence))} |`;
}

function formatNotes(notes: string): string {
  if (!notes) {
    return '待用户填写。';
  }

  return redactSensitiveText(notes).replace(/^(#{1,6})(\s+)/gm, '\\$1$2');
}

function formatStatus(status: UserAcceptanceCheckStatus): string {
  if (status === 'passed') {
    return '通过';
  }

  if (status === 'failed') {
    return '失败';
  }

  return '跳过';
}

function formatDecision(decision: UserDecision): string {
  if (decision === 'accepted') {
    return '用户确认通过';
  }

  if (decision === 'changes_requested') {
    return '用户要求修改';
  }

  return '待用户确认';
}

function formatAcceptanceConclusion(decision: UserDecision, summary: UserAcceptanceSummary): string {
  if (summary.runStatus === 'failed') {
    return '真实项目验收运行仍有必需项失败，需要先修复失败项。';
  }

  if (decision === 'accepted') {
    return '真实项目验收运行通过，且用户已明确确认 MVP 符合预期。';
  }

  if (decision === 'changes_requested') {
    return '真实项目验收运行通过，但用户要求修改；应将修改项记录到开发日志或阻塞日志后继续迭代。';
  }

  return '真实项目验收运行通过，但用户结论仍待确认；不能仅凭该记录标记长期 goal complete。';
}

function formatNextSteps(
  decision: UserDecision,
  summary: UserAcceptanceSummary,
  mode: UserAcceptanceRecord['mode']
): string {
  if (summary.runStatus === 'failed') {
    return [
      '- 先修复上方必需项失败。',
      '- 修复后重新运行 `pnpm user:accept`，并保留新的验收记录。',
      '- 用户需要将结论更新为 `accepted` 或 `changes_requested`；不能仅凭该记录标记长期 goal complete。'
    ].join('\n');
  }

  if (decision === 'accepted') {
    return '- 运行 `pnpm goal:audit`。\n- 确认 `docs/acceptance/goal-completion-audit.md` 中的用户验收项已通过，再进入 goal 完成审计。';
  }

  if (decision === 'changes_requested') {
    return '- 把用户备注中的具体修改项写入 `docs/logs/dev-log.md` 或 `docs/logs/blockers.md`。\n- 按备注继续迭代，修复后重新运行真实项目验收。';
  }

  if (mode === 'cli') {
    return '- 用户需要将结论更新为 `accepted` 或 `changes_requested`。\n- 通过后运行 `pnpm user:accept -- --repo <repo> --mode cli --decision accepted --notes "用户确认 Python CLI 验收符合预期"`。';
  }

  return '- 用户需要将结论更新为 `accepted` 或 `changes_requested`。\n- 通过后运行 `pnpm user:accept -- --repo <repo> --browser --validate-generated-tests --decision accepted --notes "用户确认 MVP 符合预期"`。';
}
