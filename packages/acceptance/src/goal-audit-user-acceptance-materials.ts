import type { GoalAuditItem } from './goal-audit.js';
import { buildGoalAuditTextRequirement } from './goal-audit-requirements.js';

export const USER_ACCEPTANCE_MATERIAL_SOURCE_KEYS = [
  'packageJson',
  'readme',
  'userAcceptanceGuide',
  'acceptanceChecklist',
  'sampleHardeningReport',
  'userAcceptanceRecord',
  'userAcceptanceArgs',
  'userAcceptanceBuilder',
  'userAcceptanceRunner',
  'userAcceptanceTests',
  'goalAuditTests',
  'blockersLog',
  'spikeResults',
  'userAcceptanceHandoff',
  'userAcceptanceHandoffBuilder',
  'userAcceptanceHandoffRunner',
  'userAcceptanceHandoffTests',
  'repoPreflight',
  'goalAuditSource'
] as const;

export type UserAcceptanceMaterialSourceKey = typeof USER_ACCEPTANCE_MATERIAL_SOURCE_KEYS[number];
export type UserAcceptanceMaterialSources = Partial<Record<UserAcceptanceMaterialSourceKey, string>>;

export interface UserAcceptanceMaterialRequirementSpec {
  requirement: string;
  sourceKeys: readonly UserAcceptanceMaterialSourceKey[];
  needles: readonly string[];
  evidence: readonly string[];
}

export const userAcceptanceMaterialRequirementSpecs: readonly UserAcceptanceMaterialRequirementSpec[] = [
  {
    requirement: '演示命令和验收清单',
    sourceKeys: [
      'readme',
      'userAcceptanceGuide',
      'acceptanceChecklist',
      'sampleHardeningReport',
      'userAcceptanceRecord',
      'userAcceptanceArgs',
      'userAcceptanceBuilder',
      'userAcceptanceRunner',
      'userAcceptanceTests',
      'goalAuditTests'
    ],
    needles: [
      'pnpm acceptance -- --full --browser',
      'pnpm goal:audit',
      'docs/testing/samples/sample-hardening-report.md',
      'pnpm user:accept -- --repo <real-web-app-repo> --browser --decision pending',
      'pnpm user:accept -- --repo <real-web-app-repo> --browser --validate-generated-tests --decision pending',
      'pnpm user:accept -- --repo <repo> --browser --validate-generated-tests --decision accepted --notes "用户确认 MVP 符合预期"',
      '--generated-test-timeout-ms <ms>',
      'buildGeneratedTestValidationCheck',
      'generated Playwright spec 执行验证',
      'not requested; pass --validate-generated-tests to execute generated specs against the target app',
      'redacts sensitive URL parameters from generated test validation evidence commands',
      'buildUserAcceptanceRepoPreflightChecks',
      'package.json 是有效文件',
      'repo root check failed',
      'writes a structured failure record when package.json is missing',
      'writes a structured failure record when package.json is malformed',
      'writes a structured failure record when package.json is valid JSON but not an object manifest',
      'invalid package.json manifest:',
      'invalid package.json:',
      '## 下一步',
      'formatNextSteps',
      'renders next steps for pending acceptance records',
      'renders next steps for accepted acceptance records',
      'renders next steps for changes_requested acceptance records',
      'renders next steps for failed acceptance records',
      'documents next steps in the current acceptance record lifecycle state',
      'requires concrete notes when the user accepts the MVP',
      '--notes with concrete acceptance confirmation is required when --decision accepted',
      'requires generated Playwright spec validation when the user accepts the MVP',
      '--validate-generated-tests is required when --decision accepted',
      'does not classify accepted records when generated spec validation is skipped',
      'requires concrete notes when the user requests changes',
      'hasConcreteChangeNotes',
      '--notes with concrete change details is required when --decision changes_requested',
      '真实项目验收运行通过，且用户已明确确认 MVP 符合预期。',
      '确认 `docs/acceptance/goal-completion-audit.md` 中的用户验收项已通过',
      '# 用户验收清单',
      '## 待完整验收',
      '真实项目上的 `hardening run <repo> --browser`',
      '真实项目上的 `pnpm user:accept -- --repo <repo> --browser --validate-generated-tests --decision accepted --notes "用户确认 MVP 符合预期"`'
    ],
    evidence: ['README, user acceptance guide, sample report, and acceptance checklist provide demo commands, goal audit command, real-project acceptance command, report sample, pending checklist items, user:accept can execute generated Playwright specs, user:accept records separate repo root and package.json preflight checks, malformed package.json is rejected before hardening runs, non-object package.json manifests are rejected before hardening runs, generated user acceptance records include next-step guidance, current acceptance record includes lifecycle-appropriate next-step guidance, accepted acceptance commands require concrete confirmation notes, accepted acceptance records require generated spec validation, and changes_requested acceptance commands require concrete notes']
  },
  {
    requirement: '稳定报告样例',
    sourceKeys: ['readme', 'userAcceptanceGuide', 'acceptanceChecklist', 'sampleHardeningReport'],
    needles: [
      '# hardening-mcp 样例硬化报告',
      '来源：本地 benchmark',
      '就绪度评分',
      'P0',
      'P1',
      'P2',
      'Repo Profile',
      '发现项',
      '复现步骤',
      '证据',
      '测试生成',
      'verificationCommand',
      'HARDENING_BASE_URL',
      '修复指导',
      '阻塞项和错误',
      'docs/testing/samples/sample-hardening-report.md'
    ],
    evidence: ['docs/testing/samples/sample-hardening-report.md provides a stable generated report sample linked from README, user acceptance guide, and acceptance checklist']
  },
  {
    requirement: '已知限制和未解决 blocker 列表',
    sourceKeys: ['userAcceptanceGuide', 'acceptanceChecklist', 'blockersLog'],
    needles: [
      '## 8. 已知限制和未解决 blocker',
      '### 8.1 已知限制',
      '### 8.2 未解决 blocker',
      '默认沙箱内完整运行 `pnpm test:integration`',
      '本地监听 `127.0.0.1` 会触发 `listen EPERM`',
      'Playwright 浏览器启动需要沙箱外权限',
      'Chromium',
      '真实项目上的 `hardening run <repo> --browser`',
      '真实项目上的 `pnpm user:accept -- --repo <repo> --browser --validate-generated-tests --decision accepted --notes "用户确认 MVP 符合预期"`',
      '目标完成度审计已覆盖已知限制和未解决 blocker 列表'
    ],
    evidence: ['user acceptance guide, checklist, and blockers log enumerate known limitations, sandbox blockers, real-project acceptance blockers, and required user/external conditions']
  },
  {
    requirement: 'MCP 配置示例和客户端验收步骤',
    sourceKeys: ['readme', 'userAcceptanceGuide', 'acceptanceChecklist'],
    needles: [
      '## 4. MCP 验收',
      'node dist/adapters/mcp/index.js',
      '通用 MCP stdio 配置示例',
      '"mcpServers"',
      '"hardening-mcp"',
      '"command": "node"',
      '"/absolute/path/to/hardening-mcp/dist/adapters/mcp/index.js"',
      'MCP client 能列出以上 tools',
      'analyze_repo',
      'generate_repair_plan',
      'run_hardening',
      'stop_app',
      '目标完成度审计已覆盖 MCP 配置示例和客户端验收步骤'
    ],
    evidence: ['README and user acceptance guide provide an MCP stdio launch command, mcpServers JSON config, tool list including generate_repair_plan, and client validation steps; checklist records this as audited acceptance material']
  },
  {
    requirement: '安装步骤和环境前置条件',
    sourceKeys: ['readme', 'userAcceptanceGuide', 'acceptanceChecklist'],
    needles: [
      '## 安装',
      '环境前置条件',
      'Node.js 22 或更高版本',
      'pnpm',
      'Playwright Chromium',
      'pnpm install',
      'pnpm build',
      'dist/adapters/cli/index.js',
      'dist/adapters/mcp/index.js',
      '目标完成度审计已覆盖安装步骤和环境前置条件'
    ],
    evidence: ['README, user acceptance guide, and checklist document Node.js 22+, pnpm, Playwright Chromium prerequisites, install/build commands, and dist artifact checks']
  },
  {
    requirement: '示例 repo 运行流程',
    sourceKeys: ['readme', 'userAcceptanceGuide', 'acceptanceChecklist', 'spikeResults'],
    needles: [
      '示例 repo 运行流程',
      'pnpm benchmark',
      '5 个本地半真实 benchmark repo',
      'docs/logs/spike-results.md',
      'Go/No-go',
      '完整流程完成数',
      'Repo 结果',
      'vite-basic',
      'hardening-report.md',
      'tests/hardening/*.spec.ts',
      'generated Playwright spec',
      '目标完成度审计已覆盖示例 repo 运行流程'
    ],
    evidence: ['README, user acceptance guide, checklist, and spike results document the sample benchmark repo flow, reports, artifacts, generated tests, and Go criteria']
  },
  {
    requirement: '用户验收交接包',
    sourceKeys: [
      'packageJson',
      'readme',
      'userAcceptanceGuide',
      'acceptanceChecklist',
      'userAcceptanceHandoff',
      'userAcceptanceHandoffBuilder',
      'userAcceptanceHandoffRunner',
      'userAcceptanceHandoffTests',
      'repoPreflight',
      'userAcceptanceRunner',
      'userAcceptanceTests',
      'goalAuditSource',
      'goalAuditTests'
    ],
    needles: [
      '"user:handoff"',
      '# 用户验收交接包',
      'goalAuditOutputPath',
      'writeGoalAuditDocument',
      'buildGoalAuditMarkdown',
      'docs/acceptance/goal-completion-audit.md',
      '同步刷新 `docs/acceptance/goal-completion-audit.md`',
      'pnpm user:handoff -- --repo <real-web-app-repo>',
      'repo root 和文件型、JSON 对象 manifest 的 `package.json` 两个独立前置检查结果',
      '必需前置检查失败时仍会写出交接包并返回非零退出码',
      '请先修复 repo 路径或 package.json manifest，再运行 `pnpm user:accept`',
      'replace <real-web-app-repo> with the real Web App repo path',
      'rejects placeholder repo paths before rendering acceptance commands',
      'documents that package.json must be an object manifest before user acceptance runs',
      'rejects placeholder repo paths with an actionable preflight message',
      'keeps placeholder repo paths as placeholders in displayed acceptance commands',
      'keeps placeholder repo paths as placeholders in summary display',
      '注意：下方命令中的 repo 路径已脱敏',
      'pnpm user:handoff -- --help',
      'pnpm user:handoff -- --mode cli --repo <python-cli-repo>',
      '--output <path>',
      'pnpm user:accept -- --repo <real-web-app-repo> --browser --validate-generated-tests --decision pending',
      'pnpm user:accept -- --mode cli --repo <python-cli-repo> --decision pending',
      'pnpm user:accept -- --repo <real-web-app-repo> --browser --validate-generated-tests --decision accepted --notes "用户确认 MVP 符合预期"',
      'pnpm user:accept -- --repo <real-web-app-repo> --browser --decision changes_requested --notes "补齐登录态探索并降低误报"',
      'writes concrete commands and exits zero when repo preflight checks pass',
      '当前结论：${formatCurrentConclusion(input.overallStatus, input.repoPreflightChecks, mode)}',
      '自动证据已齐，仍需用户验收结论。',
      'Repo 前置检查未通过，先修复 repo 路径或 package.json manifest。',
      '至少一个 CLI smoke 或 configured static/test check 必须通过',
      'explains when automatic goal evidence is still incomplete',
      'prioritizes required repo preflight blockers in the current conclusion',
      'accepted 验收记录的生成时间必须不早于 `docs/goals/codex-goal.md` 的最后更新日期',
      'accepted 验收记录必须包含具体确认备注',
      'generated Playwright spec 执行验证必须通过',
      'goalLastUpdatedText',
      'does not classify accepted records generated before the current goal update date when freshness is required',
      'qualityGateItem',
      '## 自动质量门禁',
      'renders the current automated quality gate status from goal audit items',
      'architectureItems',
      '## 架构迁移状态',
      'renders architecture migration status from goal audit items',
      'userAcceptanceItem',
      '## 用户验收状态',
      'renders the current user acceptance status from goal audit items',
      '不能由自动脚本代替用户确认',
      '目标完成度审计已覆盖用户验收交接包'
    ],
    evidence: ['docs/acceptance/user-acceptance-handoff.md gives the final reviewer one entry point for goal audit, prompts regeneration with a real repo preflight, valid repo handoff exits zero with concrete commands, handoff changes_requested commands use concrete notes, real-project acceptance commands, accepted/changes_requested paths, repo preflight failure exit signaling, handoff package documents package.json object manifest preflight, placeholder repo paths are rejected before user acceptance commands run, displayed user acceptance commands keep placeholder repo paths as placeholders, user acceptance summaries keep placeholder repo paths as placeholders, refreshes docs/acceptance/goal-completion-audit.md, warns when displayed repo command paths are redacted, documents manual confirmation boundaries, confirms accepted user acceptance records must be fresh for the current goal update date, handoff documents accepted confirmation notes as a completion boundary, handoff documents generated spec validation as a completion boundary, handoff summarizes automated quality gate status, handoff summarizes architecture migration status, handoff summarizes current user acceptance status and next action, handoff renders an explicit current conclusion, and handoff current conclusion prioritizes repo preflight blockers']
  }
];

export function buildUserAcceptanceMaterialRequirements(
  sources: UserAcceptanceMaterialSources
): GoalAuditItem[] {
  return userAcceptanceMaterialRequirementSpecs.map((spec) => buildGoalAuditTextRequirement({
    category: '用户验收材料',
    requirement: spec.requirement,
    text: joinSourceText(sources, spec.sourceKeys),
    needles: [...spec.needles],
    evidence: [...spec.evidence]
  }));
}

function joinSourceText(
  sources: UserAcceptanceMaterialSources,
  keys: readonly UserAcceptanceMaterialSourceKey[]
): string {
  return keys.map((key) => sources[key] ?? '').join('\n');
}
