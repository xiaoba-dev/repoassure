import { redactSensitiveText } from './redaction.js';
import { shellQuoteArg } from './shell-quote.js';
import { escapeMarkdownTableCell } from './markdown.js';
import type { GoalAuditItem, GoalAuditItemStatus } from './goal-audit.js';
import type { UserAcceptanceCheck } from './user-acceptance.js';
import type { UserAcceptanceMode } from './user-acceptance-args.js';

export interface UserAcceptanceHandoffInput {
  generatedAt: string;
  overallStatus: 'complete' | 'ready_for_user_acceptance' | 'incomplete';
  automaticPassed: number;
  automaticMissing: number;
  manualRequired: number;
  goalAuditPath: string;
  userAcceptanceRecordPath: string;
  userAcceptanceGuidePath: string;
  acceptanceChecklistPath: string;
  qualityGateItem?: GoalAuditItem;
  architectureItems?: GoalAuditItem[];
  userAcceptanceItem?: GoalAuditItem;
  mode?: UserAcceptanceMode;
  repoRoot?: string;
  repoPreflightChecks?: UserAcceptanceCheck[];
}

export function buildUserAcceptanceHandoffMarkdown(input: UserAcceptanceHandoffInput): string {
  const mode = input.mode ?? 'browser';
  const placeholderRepo = mode === 'cli' ? '<python-cli-repo>' : '<real-web-app-repo>';
  const repoArg = input.repoRoot ? formatRepoCommandArg(input.repoRoot) : placeholderRepo;
  const refreshRepoArg = input.repoRoot ? formatRefreshRepoCommandArg(input.repoRoot) : placeholderRepo;
  const redactedRepoNotice = input.repoRoot && isRepoRootRedacted(input.repoRoot)
    ? '注意：下方命令中的 repo 路径已脱敏，仅用于安全展示；请用真实 repo 路径重新运行命令。\n\n'
    : '';
  const refreshCommands = formatRefreshCommands(input, refreshRepoArg);

  return `# 用户验收交接包

生成时间：${input.generatedAt}

## 当前状态

| 项目 | 结果 |
| --- | --- |
| 总体状态 | ${formatOverallStatus(input.overallStatus)} |
| 自动证据通过 | ${input.automaticPassed} |
| 自动证据缺失 | ${input.automaticMissing} |
| 需要人工确认 | ${input.manualRequired} |
| 验收模式 | ${mode} |
| 目标完成度审计 | \`${input.goalAuditPath}\` |
| 真实项目验收记录 | \`${input.userAcceptanceRecordPath}\` |
| 用户验收指南 | \`${input.userAcceptanceGuidePath}\` |
| 用户验收清单 | \`${input.acceptanceChecklistPath}\` |

当前结论：${formatCurrentConclusion(input.overallStatus, input.repoPreflightChecks, mode)}

${formatGoalAuditItemSection('自动质量门禁', input.qualityGateItem)}
${formatGoalAuditItemsSection('架构迁移状态', input.architectureItems)}
${formatUserAcceptanceStatus(input.userAcceptanceItem)}
## Repo 参数行为

${formatRepoParameterBehavior(mode, placeholderRepo)}

${redactedRepoNotice}
${formatRepoPreflightChecks(input.repoPreflightChecks, mode)}
## 刷新交接包

\`\`\`bash
pnpm user:handoff -- --help
${refreshCommands}
\`\`\`

${formatRecommendedAcceptanceFlow(input, repoArg, refreshRepoArg, mode)}

## 验收重点

- CLI 与 MCP Server 是否都能完成 P0 hardening flow。
- 报告是否能解释启动、探索、生成测试、发现项、artifact 路径和复现命令。
- 生成的 Playwright spec 是否可在真实项目上执行或给出明确失败证据。
- 报告、日志和验收记录是否没有泄露 env value、token、secret 或用户私有数据。
- 已知限制是否可以接受，或已经作为 \`changes_requested\` 备注记录。

## 完成边界

当前交接包只整理自动证据和用户操作入口，不能由自动脚本代替用户确认。长期 goal 只有在真实项目验收通过、用户结论为 \`accepted\`、accepted 验收记录必须包含具体确认备注、${formatCompletionBoundary(mode)}，且 accepted 验收记录的生成时间必须不早于 \`docs/goals/codex-goal.md\` 的最后更新日期时，才能标记完成。
`;
}

function formatOverallStatus(status: UserAcceptanceHandoffInput['overallStatus']): string {
  if (status === 'complete') {
    return '已完成';
  }

  if (status === 'ready_for_user_acceptance') {
    return '已准备好请求用户验收';
  }

  return '仍有自动可验证缺失项';
}

function formatCurrentConclusion(
  status: UserAcceptanceHandoffInput['overallStatus'],
  repoPreflightChecks: UserAcceptanceCheck[] | undefined,
  mode: UserAcceptanceMode
): string {
  if (hasRequiredRepoPreflightBlocker(repoPreflightChecks)) {
    return `Repo 前置检查未通过，先修复 repo 路径或 ${formatManifestName(mode)} manifest。`;
  }

  if (status === 'complete') {
    return '自动证据和用户验收结论均已具备，可以进入 goal 完成审计。';
  }

  if (status === 'ready_for_user_acceptance') {
    return '自动证据已齐，仍需用户验收结论。';
  }

  return '仍有自动可验证缺失项，先修复缺失项后再请求用户验收。';
}

function formatUserAcceptanceStatus(item: UserAcceptanceHandoffInput['userAcceptanceItem']): string {
  return formatGoalAuditItemSection('用户验收状态', item);
}

function formatGoalAuditItemSection(title: string, item: GoalAuditItem | undefined): string {
  if (item === undefined) {
    return '';
  }

  return formatGoalAuditItemsSection(title, [item]);
}

function formatGoalAuditItemsSection(title: string, items: GoalAuditItem[] | undefined): string {
  if (!items || items.length === 0) {
    return '';
  }

  return `## ${title}

| 要求 | 状态 | 证据 | 下一步 |
| --- | --- | --- | --- |
${items.map((item) => `| ${formatTableCell(item.requirement)} | ${formatGoalAuditItemStatus(item.status)} | ${formatTableCell(item.evidence.join('; '))} | ${formatTableCell(item.nextAction ?? '')} |`).join('\n')}

`;
}

function formatRepoPreflightChecks(checks: UserAcceptanceCheck[] | undefined, mode: UserAcceptanceMode): string {
  if (!checks || checks.length === 0) {
    return '';
  }

  const requiredBlocker = checks.some((check) => check.required && check.status !== 'passed');
  const conclusion = requiredBlocker
    ? `前置检查结论：未通过。请先修复 repo 路径或 ${formatManifestName(mode)} manifest，再运行 \`pnpm user:accept\`。`
    : '前置检查结论：通过。可以继续运行下方 `pnpm user:accept` 命令。';

  return `## Repo 前置检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
${checks.map((check) => `| ${formatTableCell(check.name)} | ${check.required ? '是' : '否'} | ${formatCheckStatus(check.status)} | ${formatTableCell(check.evidence)} |`).join('\n')}

${conclusion}

`;
}

function formatRecommendedAcceptanceFlow(
  input: UserAcceptanceHandoffInput,
  repoArg: string,
  refreshRepoArg: string,
  mode: UserAcceptanceMode
): string {
  if (hasRequiredRepoPreflightBlocker(input.repoPreflightChecks)) {
    return `## 建议验收顺序

1. 打开 \`${input.goalAuditPath}\`，确认自动可验证项没有缺失。
2. 修复 repo 路径或 ${formatManifestName(mode)} manifest 后，重新生成交接包：

\`\`\`bash
pnpm user:handoff -- ${formatModeArg(mode)}--repo ${refreshRepoArg}
\`\`\`

3. 只有当 \`Repo 前置检查\` 全部通过后，再运行真实项目验收命令。
`;
  }

  const acceptedNotesArg = input.repoRoot ? shellQuoteArg('用户确认 MVP 符合预期') : '"用户确认 MVP 符合预期"';
  const changesRequestedNotesArg = input.repoRoot ? shellQuoteArg('补齐登录态探索并降低误报') : '"补齐登录态探索并降低误报"';
  const modeArg = formatModeArg(mode);
  const pendingCommand = mode === 'cli'
    ? `pnpm user:accept -- --repo ${repoArg} ${modeArg}--decision pending`
    : `pnpm user:accept -- --repo ${repoArg} --browser --validate-generated-tests --decision pending`;
  const acceptedCommand = mode === 'cli'
    ? `pnpm user:accept -- --repo ${repoArg} ${modeArg}--decision accepted --notes ${acceptedNotesArg}`
    : `pnpm user:accept -- --repo ${repoArg} --browser --validate-generated-tests --decision accepted --notes ${acceptedNotesArg}`;
  const changesRequestedCommand = mode === 'cli'
    ? `pnpm user:accept -- --repo ${repoArg} ${modeArg}--decision changes_requested --notes ${changesRequestedNotesArg}`
    : `pnpm user:accept -- --repo ${repoArg} --browser --decision changes_requested --notes ${changesRequestedNotesArg}`;
  const environment = mode === 'cli'
    ? 'Python、项目 CLI 依赖和可执行 entrypoint'
    : 'Node.js、pnpm 和 Playwright Chromium';

  return `## 建议验收顺序

1. 打开 \`${input.goalAuditPath}\`，确认自动可验证项没有缺失。
2. 打开 \`${input.userAcceptanceGuidePath}\`，按真实项目环境准备 ${environment}。
3. 在一个真实 repo 上运行真实项目验收：

\`\`\`bash
${pendingCommand}
\`\`\`

4. 如果结果符合预期，写入用户通过结论并复跑目标审计：

\`\`\`bash
${acceptedCommand}
pnpm goal:audit
\`\`\`

5. 如果需要继续修改，写入具体修改项并复跑目标审计：

\`\`\`bash
${changesRequestedCommand}
pnpm goal:audit
\`\`\`
`;
}

function hasRequiredRepoPreflightBlocker(checks: UserAcceptanceCheck[] | undefined): boolean {
  return checks?.some((check) => check.required && check.status !== 'passed') ?? false;
}

function formatCheckStatus(status: UserAcceptanceCheck['status']): string {
  if (status === 'passed') {
    return '通过';
  }

  if (status === 'failed') {
    return '失败';
  }

  return '跳过';
}

function formatGoalAuditItemStatus(status: GoalAuditItemStatus): string {
  if (status === 'passed') {
    return '已通过';
  }

  if (status === 'manual_required') {
    return '需要人工确认';
  }

  return '缺失';
}

function formatTableCell(value: string): string {
  return escapeMarkdownTableCell(redactSensitiveText(value));
}

function formatRepoCommandArg(repoRoot: string): string {
  return shellQuoteArg(redactSensitiveText(repoRoot));
}

function formatRefreshRepoCommandArg(repoRoot: string): string {
  return findRepoPathPlaceholder(repoRoot) ?? formatRepoCommandArg(repoRoot);
}

function findRepoPathPlaceholder(repoRoot: string): string | undefined {
  const segments = repoRoot.split(/[\\/]+/);

  return segments.find((segment) => /^<[^<>]+>$/.test(segment));
}

function isRepoRootRedacted(repoRoot: string): boolean {
  return redactSensitiveText(repoRoot) !== repoRoot;
}

function formatRefreshCommands(input: UserAcceptanceHandoffInput, repoArg: string): string {
  const mode = input.mode ?? 'browser';
  if (input.repoRoot) {
    return `pnpm user:handoff -- ${formatModeArg(mode)}--repo ${repoArg}`;
  }

  return [
    `pnpm user:handoff -- ${formatModeArg(mode)}--repo ${mode === 'cli' ? '<python-cli-repo>' : '<real-web-app-repo>'}`,
    'pnpm user:handoff -- --output <path>'
  ].join('\n');
}

function formatRepoParameterBehavior(mode: UserAcceptanceMode, placeholderRepo: string): string {
  if (mode === 'browser') {
    return '使用 `--repo <repo>` 刷新交接包时，会显示 repo root 和文件型、JSON 对象 manifest 的 `package.json` 两个独立前置检查结果；如果传入 `<real-web-app-repo>` 这类占位符，会在访问文件系统前提示替换为真实路径；必需前置检查失败时仍会写出交接包并返回非零退出码。如果报告显示未通过，请先修复 repo 路径或 package.json manifest，再运行 `pnpm user:accept`。';
  }

  const manifest = formatManifestName(mode);

  return `使用 \`--repo <repo>\` 刷新交接包时，会显示 repo root 和文件型 ${manifest} manifest 两个独立前置检查结果；如果传入 \`${placeholderRepo}\` 这类占位符，会在访问文件系统前提示替换为真实路径；必需前置检查失败时仍会写出交接包并返回非零退出码。如果报告显示未通过，请先修复 repo 路径或 ${manifest} manifest，再运行 \`pnpm user:accept\`。当前模式目标是 Python/CLI repo。`;
}

function formatManifestName(mode: UserAcceptanceMode): string {
  return mode === 'cli' ? 'pyproject.toml' : 'package.json';
}

function formatModeArg(mode: UserAcceptanceMode): string {
  return mode === 'cli' ? '--mode cli ' : '';
}

function formatCompletionBoundary(mode: UserAcceptanceMode): string {
  return mode === 'cli'
    ? '至少一个 CLI smoke 或 configured static/test check 必须通过'
    : 'generated Playwright spec 执行验证必须通过';
}
