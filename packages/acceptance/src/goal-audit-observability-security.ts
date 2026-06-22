import type { GoalAuditItem } from './goal-audit.js';
import type { GoalAuditTextSources } from './goal-audit-sources.js';
import { buildGoalAuditTextRequirement } from './goal-audit-requirements.js';

export function buildObservabilityAndSecurityGoalAuditItems(
  sources: Partial<GoalAuditTextSources>
): GoalAuditItem[] {
  return [
    buildGoalAuditTextRequirement({
      category: '可观测性',
      requirement: '可复现信息与失败证据',
      text: [
        sources.codexGoal,
        sources.readme,
        sources.userAcceptanceGuide,
        sources.bootAppTool,
        sources.exploreAppTool,
        sources.runHardening,
        sources.generateTestsTool,
        sources.hardenReport,
        sources.observabilityTests
      ].join('\n'),
      needles: [
        '所有工具都必须产出可复现信息',
        '输入参数',
        '推断依据',
        '运行日志路径',
        'artifact 路径',
        '错误和 blocker',
        '复现步骤',
        'profilePath',
        'findingsPath',
        'reportPath',
        'resultPath',
        'logsPath',
        'blockers',
        'errors',
        'reproSteps',
        'evidence',
        'visitedRoutes',
        'artifactFiles',
        'createdFiles',
        'verificationCommand',
        'formatBlockersAndErrors',
        'writes a serializable boot result artifact',
        'prints the repo profile and writes the artifact',
        'boots a local app, explores it with Playwright, writes artifacts, and stops the app'
      ],
      evidence: ['tool outputs expose profile/findings/report/result/log paths, findings include repro steps and evidence, reports include verification command plus blockers/errors, and integration/E2E tests inspect those artifacts']
    }),
    buildGoalAuditTextRequirement({
      category: 'Local-first 与隐私',
      requirement: '报告和验收文档声明本地优先与敏感信息边界',
      text: `${sources.readme ?? ''}\n${sources.userAcceptanceGuide ?? ''}`,
      needles: ['本地优先', '不读取浏览器个人资料', '工具是否没有输出 env value 或敏感信息'],
      evidence: ['README and user acceptance guide document local-first and env-value handling']
    }),
    buildGoalAuditTextRequirement({
      category: '安全边界',
      requirement: '不硬编码密钥、不上传代码、不泄露 env value',
      text: [
        sources.codexGoal,
        sources.readme,
        sources.userAcceptanceGuide,
        sources.analyzeRepo,
        sources.privacyRedaction,
        sources.playwrightDriver,
        sources.cliRun,
        sources.toolRegistry,
        sources.hardenReport,
        sources.securityTests
      ].join('\n'),
      needles: [
        '不上传代码。',
        '不上传日志。',
        '不上传 screenshots/traces。',
        '报告中只写 env key 名，不写 env value。',
        'envHints',
        'redactSensitiveText',
        'sensitiveKeyValuePattern',
        'redacts sensitive values from successful CLI JSON output',
        'redacts sensitive values from successful MCP tool content and structured content',
        'redacts sensitive values from boot errors in reports and patch diffs',
        'redacts sensitive values from user notes in acceptance records',
        'redacts sensitive repo path values in handoff commands',
        'fills safe form fields and skips sensitive fields before submit interactions',
        'destructive_or_sensitive_action'
      ],
      evidence: ['codex goal documents local-only boundaries; analyze_repo returns env key hints; shared redaction is used by CLI, MCP, report and acceptance paths; handoff commands redact sensitive repo path values; browser tests skip sensitive fields and destructive actions']
    })
  ];
}
