import { readFileSync } from 'node:fs';

import {
  buildGoalAuditMarkdown as buildLegacyGoalAuditMarkdown,
  summarizeGoalAudit as summarizeLegacyGoalAudit
} from '../../src/internal/acceptance/goal-audit.js';
import { buildGoalAuditMarkdown, summarizeGoalAudit, type GoalAuditItem } from '../../packages/acceptance/src/goal-audit.js';
import {
  classifyUserAcceptanceRecord as classifyLegacyUserAcceptanceRecord,
  REQUIRED_DOCUMENT_PATHS as LEGACY_REQUIRED_DOCUMENT_PATHS,
  isAcceptanceRunFreshEnough as isLegacyAcceptanceRunFreshEnough,
  isAcceptedUserAcceptanceRecord as isLegacyAcceptedUserAcceptanceRecord
} from '../../src/internal/acceptance/run-goal-audit.js';
import {
  buildUserAcceptanceGoalRequirement,
  formatUserAcceptanceAuditEvidence,
  formatUserAcceptanceAuditNextAction
} from '../../packages/acceptance/src/goal-audit-user-acceptance.js';
import {
  USER_ACCEPTANCE_MATERIAL_SOURCE_KEYS,
  buildUserAcceptanceMaterialRequirements,
  userAcceptanceMaterialRequirementSpecs
} from '../../packages/acceptance/src/goal-audit-user-acceptance-materials.js';
import {
  GOAL_AUDIT_GROUPED_TEXT_SOURCE_PATHS,
  LEGACY_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS,
  LEGACY_ACCEPTANCE_WRAPPER_SOURCE_SPECS,
  LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS,
  PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS,
  PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS,
  PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS,
  GOAL_AUDIT_TEXT_SOURCE_PATHS,
  readGoalAuditTextSources
} from '../../packages/acceptance/src/goal-audit-sources.js';
import {
  buildDeliveryAndP0GoalAuditItems
} from '../../packages/acceptance/src/goal-audit-delivery.js';
import {
  buildRuntimeGoalAuditItems
} from '../../packages/acceptance/src/goal-audit-runtime.js';
import {
  buildWorkflowAndArtifactGoalAuditItems
} from '../../packages/acceptance/src/goal-audit-workflow-artifacts.js';
import {
  buildObservabilityAndSecurityGoalAuditItems
} from '../../packages/acceptance/src/goal-audit-observability-security.js';
import {
  buildProcessGovernanceGoalAuditItems
} from '../../packages/acceptance/src/goal-audit-process-governance.js';
import {
  buildEvidenceAndDocumentGoalAuditItems
} from '../../packages/acceptance/src/goal-audit-evidence-documents.js';
import {
  buildCurrentGoalAuditItemsFromSources
} from '../../packages/acceptance/src/goal-audit-current-items.js';
import {
  buildCurrentGoalAuditItems,
  buildGoalAuditItemsFromWorkspace,
  classifyUserAcceptanceRecord,
  isAcceptanceRunFreshEnough,
  isAcceptedUserAcceptanceRecord,
  REQUIRED_DOCUMENT_PATHS,
  runGoalAudit
} from '../../packages/acceptance/src/run-goal-audit.js';
import {
  REQUIRED_DOCUMENT_PATHS as PACKAGE_REQUIRED_DOCUMENT_PATHS,
  buildAcceptanceRunQualityGateRequirement,
  buildGoalAuditFileRequirement,
  buildGoalAuditTextRequirement
} from '../../packages/acceptance/src/goal-audit-requirements.js';

describe('goal audit', () => {
  it('reports ready for user acceptance when only manual confirmation remains', () => {
    const items: GoalAuditItem[] = [
      { category: '功能', requirement: 'P0 tools', status: 'passed', evidence: ['tool registry'] },
      { category: '用户验收', requirement: '用户确认 MVP 符合预期', status: 'manual_required', evidence: ['requires user confirmation'] }
    ];

    expect(summarizeGoalAudit(items)).toEqual({
      total: 2,
      passed: 1,
      missing: 0,
      manualRequired: 1,
      overallStatus: 'ready_for_user_acceptance'
    });
  });

  it('reports incomplete when any automatic requirement is missing', () => {
    const items: GoalAuditItem[] = [
      { category: '质量', requirement: 'lint', status: 'passed', evidence: ['acceptance-run'] },
      { category: '文档', requirement: 'README', status: 'missing', evidence: ['missing README.md'], nextAction: '补齐 README' },
      { category: '用户验收', requirement: '用户确认 MVP 符合预期', status: 'manual_required', evidence: ['requires user confirmation'] }
    ];

    expect(summarizeGoalAudit(items)).toMatchObject({
      missing: 1,
      manualRequired: 1,
      overallStatus: 'incomplete'
    });
  });

  it('reports complete when no checks are missing and no manual confirmation remains', () => {
    const items: GoalAuditItem[] = [
      { category: '质量', requirement: '质量门禁', status: 'passed', evidence: ['acceptance-run'] },
      { category: '用户验收', requirement: '用户确认 MVP 符合预期', status: 'passed', evidence: ['user accepted'] }
    ];

    expect(summarizeGoalAudit(items)).toMatchObject({
      missing: 0,
      manualRequired: 0,
      overallStatus: 'complete'
    });
  });

  it('keeps package-owned goal audit output compatible with the legacy implementation', () => {
    const items: GoalAuditItem[] = [
      {
        category: '# 安全|验收',
        requirement: 'Goal audit|report',
        status: 'passed',
        evidence: ['API_KEY=sk-goal-audit-secret', 'token=goal-token\r\nnext line'],
        nextAction: 'none'
      },
      {
        category: '用户验收',
        requirement: '用户确认 MVP 符合预期',
        status: 'manual_required',
        evidence: ['docs/goals/codex-goal.md']
      }
    ];
    const summary = summarizeGoalAudit(items);
    const input = {
      generatedAt: '2026-06-20T00:00:00.000Z',
      summary,
      items
    };

    expect(summary).toEqual(summarizeLegacyGoalAudit(items));
    expect(buildGoalAuditMarkdown(input)).toBe(buildLegacyGoalAuditMarkdown(input));
    expect(buildGoalAuditMarkdown(input)).not.toContain('sk-goal-audit-secret');
    expect(buildGoalAuditMarkdown(input)).not.toContain('goal-token');
  });

  it('builds the user acceptance goal requirement from package-owned status helpers', () => {
    expect(buildUserAcceptanceGoalRequirement('accepted')).toEqual({
      category: '用户验收',
      requirement: '用户确认 MVP 符合预期',
      status: 'passed',
      evidence: ['docs/acceptance/user-acceptance-record.md records a passing run and accepted user decision']
    });

    expect(buildUserAcceptanceGoalRequirement('changes_requested')).toEqual({
      category: '用户验收',
      requirement: '用户确认 MVP 符合预期',
      status: 'missing',
      evidence: ['docs/acceptance/user-acceptance-record.md records a passing run and concrete user-requested changes'],
      nextAction: '按 docs/acceptance/user-acceptance-record.md 的用户备注继续迭代，并在修复后重新运行真实项目验收。'
    });

    expect(buildUserAcceptanceGoalRequirement('pending_or_invalid')).toEqual({
      category: '用户验收',
      requirement: '用户确认 MVP 符合预期',
      status: 'manual_required',
      evidence: ['docs/goals/codex-goal.md Success Definition requires user confirmation or explicit remaining changes'],
      nextAction: '等待用户提供真实 Web App repo 或人工验收结论；不能由自动脚本代替。'
    });
  });

  it('formats user acceptance audit evidence and next actions as package-owned helpers', () => {
    expect(formatUserAcceptanceAuditEvidence('accepted')).toEqual([
      'docs/acceptance/user-acceptance-record.md records a passing run and accepted user decision'
    ]);
    expect(formatUserAcceptanceAuditNextAction('changes_requested')).toContain('继续迭代');
    expect(formatUserAcceptanceAuditNextAction('pending_or_invalid')).toContain('不能由自动脚本代替');
  });

  it('builds user acceptance material requirements as package-owned grouped text checks', () => {
    const allNeedles = userAcceptanceMaterialRequirementSpecs
      .flatMap((spec) => spec.needles)
      .join('\n');
    const sources = Object.fromEntries(
      USER_ACCEPTANCE_MATERIAL_SOURCE_KEYS.map((key) => [key, allNeedles])
    );

    const items = buildUserAcceptanceMaterialRequirements(sources);

    expect(items.map((item) => item.requirement)).toEqual([
      '演示命令和验收清单',
      '稳定报告样例',
      '已知限制和未解决 blocker 列表',
      'MCP 配置示例和客户端验收步骤',
      '安装步骤和环境前置条件',
      '示例 repo 运行流程',
      '用户验收交接包'
    ]);
    expect(items.every((item) => item.category === '用户验收材料')).toBe(true);
    expect(items.every((item) => item.status === 'passed')).toBe(true);
    expect(items.find((item) => item.requirement === '用户验收交接包')?.evidence.join('\n')).toContain(
      'handoff summarizes current user acceptance status and next action'
    );
    expect(items.find((item) => item.requirement === '用户验收交接包')?.evidence.join('\n')).toContain(
      'handoff summarizes architecture migration status'
    );
  });

  it('reports missing user acceptance material markers from package-owned grouped text checks', () => {
    const [demoItem] = buildUserAcceptanceMaterialRequirements({
      readme: 'pnpm acceptance -- --full --browser'
    });

    expect(demoItem).toEqual(expect.objectContaining({
      category: '用户验收材料',
      requirement: '演示命令和验收清单',
      status: 'missing',
      nextAction: '补齐实现或文档证据后重新运行 goal audit。'
    }));
    expect(demoItem?.evidence.join('\n')).toContain('missing text markers:');
  });

  it('reads goal audit text sources through a package-owned source collection plan', async () => {
    const reads: string[] = [];
    const sources = await readGoalAuditTextSources({
      root: '/repo',
      readText: async (path) => {
        reads.push(path);
        return `content:${path}`;
      }
    });

    expect(GOAL_AUDIT_TEXT_SOURCE_PATHS.packageJson).toBe('package.json');
    expect(GOAL_AUDIT_TEXT_SOURCE_PATHS.userAcceptanceHandoff).toBe('docs/acceptance/user-acceptance-handoff.md');
    expect(GOAL_AUDIT_TEXT_SOURCE_PATHS.userAcceptanceHandoffBuilder).toBe('packages/acceptance/src/user-acceptance-handoff.ts');
    expect(GOAL_AUDIT_TEXT_SOURCE_PATHS.userAcceptanceHandoffRunner).toBe('packages/acceptance/src/run-user-acceptance-handoff.ts');
    expect(GOAL_AUDIT_TEXT_SOURCE_PATHS.repoPreflight).toBe('packages/acceptance/src/repo-preflight.ts');
    expect(GOAL_AUDIT_TEXT_SOURCE_PATHS.userAcceptanceArgs).toBe('packages/acceptance/src/user-acceptance-args.ts');
    expect(GOAL_AUDIT_TEXT_SOURCE_PATHS.userAcceptanceBuilder).toBe('packages/acceptance/src/user-acceptance.ts');
    expect(GOAL_AUDIT_TEXT_SOURCE_PATHS.userAcceptanceRunner).toBe('packages/acceptance/src/run-user-acceptance.ts');
    expect(GOAL_AUDIT_TEXT_SOURCE_PATHS.goalAuditSource).toBe('packages/acceptance/src/run-goal-audit.ts');
    expect(LEGACY_ACCEPTANCE_WRAPPER_SOURCE_SPECS.map((spec) => spec.path)).toEqual([
      'src/internal/acceptance/fatal-error.ts',
      'src/internal/acceptance/goal-audit.ts',
      'src/internal/acceptance/markdown.ts',
      'src/internal/acceptance/repo-preflight.ts',
      'src/internal/acceptance/report.ts',
      'src/internal/acceptance/run-acceptance.ts',
      'src/internal/acceptance/run-goal-audit.ts',
      'src/internal/acceptance/run-user-acceptance-handoff.ts',
      'src/internal/acceptance/run-user-acceptance.ts',
      'src/internal/acceptance/user-acceptance-args.ts',
      'src/internal/acceptance/user-acceptance-handoff.ts',
      'src/internal/acceptance/user-acceptance.ts'
    ]);
    expect(PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS.map((spec) => spec.path)).toContain(
      'packages/acceptance/dist/index.js'
    );
    expect(PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS.map((spec) => spec.path)).toContain(
      'packages/acceptance/dist/run-acceptance.js'
    );
    expect(PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS.map((spec) => spec.path)).toContain(
      'packages/acceptance/dist/index.d.ts'
    );
    expect(PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS.map((spec) => spec.path)).toContain(
      'packages/acceptance/dist/run-acceptance.d.ts'
    );
    expect(PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS.map((spec) => spec.path)).toContain(
      'packages/acceptance/dist/run-acceptance.js.map'
    );
    expect(LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS.map((spec) => spec.path)).toContain(
      'dist/internal/acceptance/run-acceptance.js.map'
    );
    expect(GOAL_AUDIT_GROUPED_TEXT_SOURCE_PATHS.cliSmokeTests).toEqual([
      'tests/unit/cli-options.test.ts',
      'tests/integration/cli-analyze.test.ts',
      'tests/integration/cli-generated-artifacts.test.ts',
      'tests/integration/cli-run.test.ts'
    ]);
    expect(reads).toContain('/repo/package.json');
    expect(reads).toContain('/repo/tests/integration/cli-run.test.ts');
    expect(reads).toContain('/repo/src/internal/acceptance/run-user-acceptance.ts');
    expect(reads).toContain('/repo/packages/acceptance/dist/index.js');
    expect(reads).toContain('/repo/packages/acceptance/dist/index.d.ts');
    expect(sources.packageJson).toBe('content:/repo/package.json');
    expect(sources.packageAcceptanceDistIndex).toBe('content:/repo/packages/acceptance/dist/index.js');
    expect(sources.packageAcceptanceDistIndexDeclaration).toBe(
      'content:/repo/packages/acceptance/dist/index.d.ts'
    );
    expect(sources.legacyAcceptanceRunUserAcceptance).toBe(
      'content:/repo/src/internal/acceptance/run-user-acceptance.ts'
    );
    expect(sources.cliSmokeTests).toContain('content:/repo/tests/unit/cli-options.test.ts');
    expect(sources.cliSmokeTests).toContain('content:/repo/tests/integration/cli-run.test.ts');
    expect(sources.cliSmokeTests.split('\n')).toHaveLength(4);
  });

  it('covers user acceptance material source keys in the package-owned goal audit source collection', () => {
    const availableSourceKeys = new Set([
      ...Object.keys(GOAL_AUDIT_TEXT_SOURCE_PATHS),
      ...Object.keys(GOAL_AUDIT_GROUPED_TEXT_SOURCE_PATHS)
    ]);

    expect(USER_ACCEPTANCE_MATERIAL_SOURCE_KEYS.every((key) => availableSourceKeys.has(key))).toBe(true);
  });

  it('builds delivery and P0 goal audit items as package-owned builders', async () => {
    const items = await buildDeliveryAndP0GoalAuditItems({
      sources: {
        packageJson: '"hardening": "dist/adapters/cli/index.js"\n"hardening-mcp": "dist/adapters/mcp/index.js"',
        toolRegistry: 'analyze_repo boot_app explore_app generate_tests harden_report',
        mcpServerTest: 'runs the P0 hardening tool chain over MCP transport',
        cliRun: 'runAnalyzeRepoTool runExploreAppTool runGenerateTestsTool runHardenReportTool runHardeningTool'
      },
      pathExists: async () => true
    });

    expect(items.map((item) => `${item.category}:${item.requirement}`)).toEqual([
      '交付物:可运行的 CLI',
      '交付物:可运行的 MCP Server',
      'P0 Tools:P0 tools 通过 MCP 层暴露',
      'P0 Tools:P0 tools 通过 CLI 层调用'
    ]);
    expect(items.every((item) => item.status === 'passed')).toBe(true);
    expect(items[0]?.evidence).toEqual(['package.json bin.hardening -> dist/adapters/cli/index.js']);
    expect(items[3]?.evidence).toEqual(['src/adapters/cli/run.ts dispatches analyze/explore/generate-tests/report/run']);
  });

  it('marks delivery and P0 goal audit items missing when required evidence is absent', async () => {
    const items = await buildDeliveryAndP0GoalAuditItems({
      sources: {
        packageJson: '',
        toolRegistry: 'analyze_repo',
        mcpServerTest: '',
        cliRun: ''
      },
      pathExists: async (path) => path !== 'dist/adapters/cli/index.js'
    });

    expect(items[0]).toEqual(expect.objectContaining({
      category: '交付物',
      requirement: '可运行的 CLI',
      status: 'missing',
      nextAction: '补齐缺失文件或配置后重新运行 goal audit。'
    }));
    expect(items[2]).toEqual(expect.objectContaining({
      category: 'P0 Tools',
      requirement: 'P0 tools 通过 MCP 层暴露',
      status: 'missing',
      nextAction: '补齐实现或文档证据后重新运行 goal audit。'
    }));
  });

  it('builds MCP and CLI runtime goal audit items as package-owned builders', () => {
    const items = buildRuntimeGoalAuditItems({
      packageJson: '"hardening": "dist/adapters/cli/index.js"\n"hardening-mcp": "dist/adapters/mcp/index.js"',
      mcpServerSource: 'runStdioHardeningMcpServer StdioServerTransport ListToolsRequestSchema CallToolRequestSchema',
      toolRegistry: 'stop_app sessionId',
      readme: 'hardening analyze <repo> hardening explore <repo> <url> hardening generate-tests <findingsPath> <outputDir> hardening plan <repo> hardening report <runDir> <outputPath> hardening run <repo> [url]',
      userAcceptanceGuide: 'MCP client 能列出以上 tools',
      mcpProtocolTests: 'tools/list tools/call lists and calls hardening tools over MCP transport runs the P0 hardening tool chain over MCP transport redacts sensitive values from MCP tool errors redacts sensitive values from successful MCP tool content and structured content redacts sensitive values from MCP startup failures',
      cliRun: '--help, -h',
      acceptanceChecklist: 'CLI 子命令提供零副作用帮助入口',
      cliSmokeTests: 'prints command help for %s without running the command prints short command help for %s with the help option documented prints the repo profile and writes the artifact runs explore from the CLI handler runs generate-tests from the CLI handler generates a repair plan from the latest run through the plan command runs report from the CLI handler runs analyze, explore, generate-tests, and report for a provided URL'
    });

    expect(items).toEqual([
      expect.objectContaining({
        category: 'MCP 可运行性',
        requirement: '协议级 list/call、P0 链路与 session 清理',
        status: 'passed',
        evidence: ['package.json exposes hardening-mcp stdio bin; src/adapters/mcp/server.ts binds list/call handlers to the registry; integration tests exercise tools/list, tools/call, the P0 MCP chain and stop_app session cleanup; registry/fatal-error tests cover argument validation and redaction']
      }),
      expect.objectContaining({
        category: 'CLI 可运行性',
        requirement: '子命令、帮助入口与 artifact smoke',
        status: 'passed',
        evidence: ['package.json exposes hardening CLI; src/adapters/cli/run.ts documents subcommand usage including plan; unit tests cover global and per-command help without running commands; integration tests smoke analyze/explore/generate-tests/plan/report/run and inspect artifacts']
      })
    ]);
  });

  it('marks MCP and CLI runtime goal audit items missing when text markers are absent', () => {
    const items = buildRuntimeGoalAuditItems({});

    expect(items).toEqual([
      expect.objectContaining({
        category: 'MCP 可运行性',
        requirement: '协议级 list/call、P0 链路与 session 清理',
        status: 'missing',
        nextAction: '补齐实现或文档证据后重新运行 goal audit。'
      }),
      expect.objectContaining({
        category: 'CLI 可运行性',
        requirement: '子命令、帮助入口与 artifact smoke',
        status: 'missing',
        nextAction: '补齐实现或文档证据后重新运行 goal audit。'
      })
    ]);
  });

  it('builds workflow and artifact goal audit items as package-owned builders', () => {
    const items = buildWorkflowAndArtifactGoalAuditItems({
      runHardening: 'runAnalyzeRepoTool runBootAppTool runExploreAppTool runGenerateTestsTool runHardenReportTool generateRepairPlan boot-result.json findings.json test-generation.json hardening-report.md repair-plan.json repair-plan.md patch.diff artifactFiles trace.zip manifest.json latestPath workspaceOutputDir workspaceManifestPath',
      generateTestsTool: 'test-generation.json',
      generateRepairPlanTool: 'repair-plan.json repair-plan.md patch.diff',
      repairPlanGenerator: 'workspaceManifestPath',
      hardenReport: 'hardening-report.md',
      artifactTests: 'artifactFiles trace.zip manifest.json latestPath workspaceOutputDir',
      repairPlanTests: 'repair-plan.json repair-plan.md patch.diff'
    });

    expect(items).toEqual([
      expect.objectContaining({
        category: '完整工作流',
        requirement: '可执行 analyze_repo -> boot_app -> explore_app -> generate_tests -> harden_report -> repair_plan',
        status: 'passed',
        evidence: ['src/tools/run-hardening-tool.ts orchestrates full hardening flow and emits repair-plan artifacts']
      }),
      expect.objectContaining({
        category: '本地 artifact',
        requirement: '本地 artifact 输出',
        status: 'passed',
        evidence: ['hardening flow writes boot, findings, test-generation, report, repair plan, patch diff, screenshot and trace artifacts, run-scoped manifest/latest bundle, and optional multi-repo workspace manifest; integration/E2E tests inspect those outputs']
      })
    ]);
  });

  it('marks workflow and artifact goal audit items missing when text markers are absent', () => {
    const items = buildWorkflowAndArtifactGoalAuditItems({});

    expect(items).toEqual([
      expect.objectContaining({
        category: '完整工作流',
        requirement: '可执行 analyze_repo -> boot_app -> explore_app -> generate_tests -> harden_report -> repair_plan',
        status: 'missing',
        nextAction: '补齐实现或文档证据后重新运行 goal audit。'
      }),
      expect.objectContaining({
        category: '本地 artifact',
        requirement: '本地 artifact 输出',
        status: 'missing',
        nextAction: '补齐实现或文档证据后重新运行 goal audit。'
      })
    ]);
  });

  it('builds observability and security goal audit items as package-owned builders', () => {
    const items = buildObservabilityAndSecurityGoalAuditItems({
      codexGoal: '所有工具都必须产出可复现信息 输入参数 推断依据 运行日志路径 artifact 路径 错误和 blocker 复现步骤 不上传代码。 不上传日志。 不上传 screenshots/traces。 报告中只写 env key 名，不写 env value。',
      readme: '本地优先 不读取浏览器个人资料 工具是否没有输出 env value 或敏感信息',
      userAcceptanceGuide: '本地优先 不读取浏览器个人资料 工具是否没有输出 env value 或敏感信息',
      analyzeRepo: 'envHints',
      privacyRedaction: 'redactSensitiveText sensitiveKeyValuePattern',
      playwrightDriver: 'fills safe form fields and skips sensitive fields before submit interactions destructive_or_sensitive_action',
      bootAppTool: 'profilePath resultPath logsPath blockers errors',
      exploreAppTool: 'visitedRoutes artifactFiles',
      runHardening: 'profilePath findingsPath reportPath resultPath logsPath artifactFiles',
      generateTestsTool: 'createdFiles',
      hardenReport: 'reproSteps evidence verificationCommand formatBlockersAndErrors',
      cliRun: 'redactSensitiveText',
      toolRegistry: 'redactSensitiveText',
      securityTests: 'redacts sensitive values from successful CLI JSON output redacts sensitive values from successful MCP tool content and structured content redacts sensitive values from boot errors in reports and patch diffs redacts sensitive values from user notes in acceptance records redacts sensitive repo path values in handoff commands fills safe form fields and skips sensitive fields before submit interactions destructive_or_sensitive_action',
      observabilityTests: 'writes a serializable boot result artifact prints the repo profile and writes the artifact boots a local app, explores it with Playwright, writes artifacts, and stops the app'
    });

    expect(items).toEqual([
      expect.objectContaining({
        category: '可观测性',
        requirement: '可复现信息与失败证据',
        status: 'passed',
        evidence: ['tool outputs expose profile/findings/report/result/log paths, findings include repro steps and evidence, reports include verification command plus blockers/errors, and integration/E2E tests inspect those artifacts']
      }),
      expect.objectContaining({
        category: 'Local-first 与隐私',
        requirement: '报告和验收文档声明本地优先与敏感信息边界',
        status: 'passed',
        evidence: ['README and user acceptance guide document local-first and env-value handling']
      }),
      expect.objectContaining({
        category: '安全边界',
        requirement: '不硬编码密钥、不上传代码、不泄露 env value',
        status: 'passed',
        evidence: ['codex goal documents local-only boundaries; analyze_repo returns env key hints; shared redaction is used by CLI, MCP, report and acceptance paths; handoff commands redact sensitive repo path values; browser tests skip sensitive fields and destructive actions']
      })
    ]);
  });

  it('marks observability and security goal audit items missing when text markers are absent', () => {
    const items = buildObservabilityAndSecurityGoalAuditItems({});

    expect(items).toEqual([
      expect.objectContaining({
        category: '可观测性',
        requirement: '可复现信息与失败证据',
        status: 'missing',
        nextAction: '补齐实现或文档证据后重新运行 goal audit。'
      }),
      expect.objectContaining({
        category: 'Local-first 与隐私',
        requirement: '报告和验收文档声明本地优先与敏感信息边界',
        status: 'missing',
        nextAction: '补齐实现或文档证据后重新运行 goal audit。'
      }),
      expect.objectContaining({
        category: '安全边界',
        requirement: '不硬编码密钥、不上传代码、不泄露 env value',
        status: 'missing',
        nextAction: '补齐实现或文档证据后重新运行 goal audit。'
      })
    ]);
  });

  it('builds process governance goal audit items as package-owned builders', () => {
    const packageAcceptanceDistSources = Object.fromEntries([
      ...PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS,
      ...PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS,
      ...PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS
    ].map((spec) => [spec.key, 'package dist output']));
    const legacyDistSourceMapSources = Object.fromEntries(
      LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS.map((spec) => {
        const fileName = spec.path.split('/').pop()?.replace(/\.map$/u, '') ?? '';

        return [spec.key, `{"version":3,"file":"${fileName}"}`];
      })
    );
    const processGovernanceSources = {
      codexGoal: 'TDD 必须优先 Red-Green-Refactor 测试金字塔 遇到无法解决的问题，立即记录到 `docs/logs/blockers.md`。 任何会影响架构或长期维护的选择，记录到 `docs/logs/decision-log.md`。 ## Token Control Policy 优先 `rg`、`sed -n`、`wc -l` 小范围 patch，避免无关重构 聚焦当前切片，不一次性生成大量低价值测试 关键决策写入文档，减少对对话历史的依赖 每个阶段应优先使用局部上下文和项目文档作为长期记忆。',
      testStrategy: '测试金字塔 pnpm test:unit pnpm test:integration pnpm test:e2e',
      devLog: '### TDD 记录 Red： Green： 完整 `pnpm test:integration` 真实 Chromium trace E2E 已记录到 `docs/logs/blockers.md` 决策日志已更新 文档和开发日志更新后复跑 `pnpm goal:audit`',
      blockersLog: '# 阻塞日志 ### 已尝试方案 ### 需要的用户决策或外部条件 listen EPERM Chromium',
      decisionLog: '# 决策日志 ### 决策 ### 原因 ### 影响 MCP Server 采用 Registry + SDK 薄绑定 Goal 审计不替代用户验收',
      goalAuditSource: 'readGoalAuditTextSources buildCurrentGoalAuditItemsFromSources buildGoalAuditItemsFromWorkspace classifyUserAcceptanceRecord goalLastUpdatedText pathExists: async',
      packageJson: readFileSync('package.json', 'utf8'),
      acceptancePackageJson: readFileSync('packages/acceptance/package.json', 'utf8'),
      sharedPackageJson: readFileSync('packages/shared/package.json', 'utf8'),
      legacySharedPrivacyRedaction: 'packages/shared/dist',
      legacySharedShellQuote: 'packages/shared/dist',
      legacySharedShellWords: 'packages/shared/dist',
      legacyAcceptanceFatalError: 'packages/acceptance/dist',
      legacyAcceptanceGoalAudit: 'packages/acceptance/dist',
      legacyAcceptanceMarkdown: 'packages/acceptance/dist',
      legacyAcceptanceRepoPreflight: 'packages/acceptance/dist',
      legacyAcceptanceReport: 'packages/acceptance/dist',
      legacyAcceptanceRunAcceptance: 'packages/acceptance/dist',
      legacyAcceptanceRunGoalAudit: 'packages/acceptance/dist',
      legacyAcceptanceRunUserAcceptanceHandoff: 'packages/acceptance/dist',
      legacyAcceptanceRunUserAcceptance: 'packages/acceptance/dist',
      legacyAcceptanceUserAcceptanceArgs: 'packages/acceptance/dist',
      legacyAcceptanceUserAcceptanceHandoff: 'packages/acceptance/dist',
      legacyAcceptanceUserAcceptance: 'packages/acceptance/dist',
      legacyDistAcceptanceFatalError: 'packages/acceptance/dist',
      legacyDistAcceptanceGoalAudit: 'packages/acceptance/dist',
      legacyDistAcceptanceMarkdown: 'packages/acceptance/dist',
      legacyDistAcceptanceRepoPreflight: 'packages/acceptance/dist',
      legacyDistAcceptanceReport: 'packages/acceptance/dist',
      legacyDistAcceptanceRunAcceptance: 'packages/acceptance/dist',
      legacyDistAcceptanceRunGoalAudit: 'packages/acceptance/dist',
      legacyDistAcceptanceRunUserAcceptanceHandoff: 'packages/acceptance/dist',
      legacyDistAcceptanceRunUserAcceptance: 'packages/acceptance/dist',
      legacyDistAcceptanceUserAcceptanceArgs: 'packages/acceptance/dist',
      legacyDistAcceptanceUserAcceptanceHandoff: 'packages/acceptance/dist',
      legacyDistAcceptanceUserAcceptance: 'packages/acceptance/dist',
      legacyDistAcceptanceFatalErrorDeclaration: 'packages/acceptance/dist',
      legacyDistAcceptanceGoalAuditDeclaration: 'packages/acceptance/dist',
      legacyDistAcceptanceMarkdownDeclaration: 'packages/acceptance/dist',
      legacyDistAcceptanceRepoPreflightDeclaration: 'packages/acceptance/dist',
      legacyDistAcceptanceReportDeclaration: 'packages/acceptance/dist',
      legacyDistAcceptanceRunAcceptanceDeclaration: 'packages/acceptance/dist',
      legacyDistAcceptanceRunGoalAuditDeclaration: 'packages/acceptance/dist',
      legacyDistAcceptanceRunUserAcceptanceHandoffDeclaration: 'packages/acceptance/dist',
      legacyDistAcceptanceRunUserAcceptanceDeclaration: 'packages/acceptance/dist',
      legacyDistAcceptanceUserAcceptanceArgsDeclaration: 'packages/acceptance/dist',
      legacyDistAcceptanceUserAcceptanceHandoffDeclaration: 'packages/acceptance/dist',
      legacyDistAcceptanceUserAcceptanceDeclaration: 'packages/acceptance/dist',
      ...legacyDistSourceMapSources,
      ...packageAcceptanceDistSources
    };
    const items = buildProcessGovernanceGoalAuditItems(processGovernanceSources);

    expect(items).toEqual([
      expect.objectContaining({
        category: '开发流程',
        requirement: 'TDD 与测试金字塔执行记录',
        status: 'passed',
        evidence: ['codex goal defines TDD and testing pyramid; test strategy documents unit/integration/E2E layers; dev log records Red/Green slices and full-gate validation points']
      }),
      expect.objectContaining({
        category: '日志治理',
        requirement: '阻塞与决策记录',
        status: 'passed',
        evidence: ['codex goal defines blocker and decision logging rules; blockers log records environment blockers with attempts and external conditions; decision log records long-lived architecture and acceptance decisions; dev log references blocker and decision-log maintenance']
      }),
      expect.objectContaining({
        category: 'Token 控制',
        requirement: '精准上下文与小步审计',
        status: 'passed',
        evidence: ['codex goal defines token control rules; dev log records small Red/Green slices and repeated goal-audit checkpoints; goal audit implementation uses explicit targeted evidence files and grouped test-source reads instead of broad repository scans']
      }),
      expect.objectContaining({
        category: '架构迁移',
        requirement: 'Legacy acceptance 兼容 wrapper',
        status: 'passed',
        evidence: ['src/internal/acceptance/*.ts all delegate to packages/acceptance/dist compatibility wrappers']
      }),
      expect.objectContaining({
        category: '架构迁移',
        requirement: 'Acceptance package typed module exports',
        status: 'passed',
        evidence: ['root package depends on @hardening-mcp/acceptance workspace package; exact package export surface matches acceptancePackageExportEntries; package dist output contract matches acceptancePackageDistOutputEntries including .js.map sourceMapPath; package dist source specs match PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS, PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS, and PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS; package source contract matches acceptancePackageSourceEntries; typed dist entrypoints have no unexpected package exports']
      }),
      expect.objectContaining({
        category: '架构迁移',
        requirement: 'Shared package typed module exports and legacy wrappers',
        status: 'passed',
        evidence: ['root package depends on @hardening-mcp/shared workspace package; packages/shared exports typed root, compatibility, privacy-redaction, shell-quote, and shell-words subpaths; src/shared/*.ts all delegate to packages/shared/dist compatibility wrappers']
      }),
      expect.objectContaining({
        category: '架构迁移',
        requirement: 'Legacy acceptance dist compatibility outputs',
        status: 'passed',
        evidence: ['dist/internal/acceptance/*.js and *.d.ts compatibility outputs all delegate to packages/acceptance/dist package entrypoints; dist/internal/acceptance/*.js.map source maps are present through legacyAcceptanceDistOutputEntries.sourceMapPath and LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS']
      })
    ]);
  });

  it('marks process governance goal audit items missing when text markers are absent', () => {
    const items = buildProcessGovernanceGoalAuditItems({});

    expect(items).toEqual([
      expect.objectContaining({
        category: '开发流程',
        requirement: 'TDD 与测试金字塔执行记录',
        status: 'missing',
        nextAction: '补齐实现或文档证据后重新运行 goal audit。'
      }),
      expect.objectContaining({
        category: '日志治理',
        requirement: '阻塞与决策记录',
        status: 'missing',
        nextAction: '补齐实现或文档证据后重新运行 goal audit。'
      }),
      expect.objectContaining({
        category: 'Token 控制',
        requirement: '精准上下文与小步审计',
        status: 'missing',
        nextAction: '补齐实现或文档证据后重新运行 goal audit。'
      }),
      expect.objectContaining({
        category: '架构迁移',
        requirement: 'Legacy acceptance 兼容 wrapper',
        status: 'missing',
        nextAction: '将列出的 legacy 文件改为 package dist wrapper 后重新运行 goal audit。'
      }),
      expect.objectContaining({
        category: '架构迁移',
        requirement: 'Acceptance package typed module exports',
        status: 'missing',
        nextAction: '补齐 root workspace dependency 和 packages/acceptance module typed exports 后重新运行 goal audit。'
      }),
      expect.objectContaining({
        category: '架构迁移',
        requirement: 'Shared package typed module exports and legacy wrappers',
        status: 'missing',
        nextAction: '补齐 root workspace dependency、packages/shared typed exports 和 src/shared legacy wrappers 后重新运行 goal audit。'
      }),
      expect.objectContaining({
        category: '架构迁移',
        requirement: 'Legacy acceptance dist compatibility outputs',
        status: 'missing',
        nextAction: '运行 pnpm build 并确认 dist/internal/acceptance/*.js、*.d.ts 和 *.js.map 仍满足 legacy dist 兼容输出合同后重新运行 goal audit。'
      })
    ]);
  });

  it('marks acceptance package typed exports missing when package.json exposes modules outside the compatibility contract', () => {
    const packageJson = JSON.parse(readFileSync('packages/acceptance/package.json', 'utf8')) as {
      exports: Record<string, unknown>;
    };
    const items = buildProcessGovernanceGoalAuditItems({
      packageJson: readFileSync('package.json', 'utf8'),
      acceptancePackageJson: JSON.stringify({
        ...packageJson,
        exports: {
          ...packageJson.exports,
          './experimental': {
            types: './dist/experimental.d.ts',
            default: './dist/experimental.js'
          }
        }
      })
    });

    const packageExportsItem = items.find((item) => item.requirement === 'Acceptance package typed module exports');

    expect(packageExportsItem).toEqual(expect.objectContaining({
      category: '架构迁移',
      requirement: 'Acceptance package typed module exports',
      status: 'missing'
    }));
    expect(packageExportsItem?.evidence.join('\n')).toContain('unexpected export ./experimental');
  });

  it('builds evidence and document goal audit items as package-owned builders', async () => {
    const items = await buildEvidenceAndDocumentGoalAuditItems({
      sources: {
        spikeResults: '| Go/No-go | Go |\n| Benchmark repo 总数 | 5 |\n| 完整流程完成数 | 5 |'
      },
      pathExists: async () => true
    });

    expect(items).toEqual([
      expect.objectContaining({
        category: 'Benchmark',
        requirement: 'Benchmark 达到 Go 标准',
        status: 'passed',
        evidence: ['docs/logs/spike-results.md reports 5/5 completed and Go']
      }),
      expect.objectContaining({
        category: '文档与日志',
        requirement: 'Required Documents 已维护',
        status: 'passed',
        evidence: ['README, acceptance guide, acceptance record, architecture, test strategy, checklist, sample report, logs, decisions, benchmark results exist']
      })
    ]);
  });

  it('marks evidence and document goal audit items missing when evidence is absent', async () => {
    const items = await buildEvidenceAndDocumentGoalAuditItems({
      sources: {
        spikeResults: '| Go/No-go | No-go |'
      },
      pathExists: async (path) => path !== 'docs/logs/blockers.md'
    });

    expect(items).toEqual([
      expect.objectContaining({
        category: 'Benchmark',
        requirement: 'Benchmark 达到 Go 标准',
        status: 'missing',
        nextAction: '补齐实现或文档证据后重新运行 goal audit。'
      }),
      expect.objectContaining({
        category: '文档与日志',
        requirement: 'Required Documents 已维护',
        status: 'missing',
        evidence: ['missing: docs/logs/blockers.md'],
        nextAction: '补齐缺失文件或配置后重新运行 goal audit。'
      })
    ]);
  });

  it('composes the current goal audit item sequence from package-owned builders', async () => {
    const materialNeedles = userAcceptanceMaterialRequirementSpecs
      .flatMap((spec) => spec.needles)
      .join('\n');
    const sharedMarkers = [
      '"hardening": "dist/adapters/cli/index.js"',
      '"hardening-mcp": "dist/adapters/mcp/index.js"',
      'analyze_repo',
      'boot_app',
      'explore_app',
      'generate_tests',
      'harden_report',
      'runs the P0 hardening tool chain over MCP transport',
      'runStdioHardeningMcpServer',
      'StdioServerTransport',
      'ListToolsRequestSchema',
      'CallToolRequestSchema',
      'tools/list',
      'tools/call',
      'lists and calls hardening tools over MCP transport',
      'stop_app',
      'sessionId',
      'redacts sensitive values from MCP tool errors',
      'redacts sensitive values from successful MCP tool content and structured content',
      'redacts sensitive values from MCP startup failures',
      'MCP client 能列出以上 tools',
      'runAnalyzeRepoTool',
      'runExploreAppTool',
      'runGenerateTestsTool',
      'runHardenReportTool',
      'runHardeningTool',
      'hardening analyze <repo>',
      'hardening explore <repo> <url>',
      'hardening generate-tests <findingsPath> <outputDir>',
      'hardening plan <repo>',
      'hardening report <runDir> <outputPath>',
      'hardening run <repo> [url]',
      '--help, -h',
      'CLI 子命令提供零副作用帮助入口',
      'prints command help for %s without running the command',
      'prints short command help for %s with the help option documented',
      'prints the repo profile and writes the artifact',
      'runs explore from the CLI handler',
      'runs generate-tests from the CLI handler',
      'generates a repair plan from the latest run through the plan command',
      'runs report from the CLI handler',
      'runs analyze, explore, generate-tests, and report for a provided URL',
      'runBootAppTool',
      'runHardenReportTool',
      'generateRepairPlan',
      'boot-result.json',
      'findings.json',
      'test-generation.json',
      'hardening-report.md',
      'repair-plan.json',
      'repair-plan.md',
      'patch.diff',
      'artifactFiles',
      'trace.zip',
      'manifest.json',
      'latestPath',
      'workspaceOutputDir',
      'workspaceManifestPath',
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
      'createdFiles',
      'verificationCommand',
      'formatBlockersAndErrors',
      'writes a serializable boot result artifact',
      'boots a local app, explores it with Playwright, writes artifacts, and stops the app',
      'TDD 必须优先',
      'Red-Green-Refactor',
      '测试金字塔',
      '### TDD 记录',
      'Red：',
      'Green：',
      'pnpm test:unit',
      'pnpm test:integration',
      'pnpm test:e2e',
      '完整 `pnpm test:integration`',
      '真实 Chromium trace E2E',
      '遇到无法解决的问题，立即记录到 `docs/logs/blockers.md`。',
      '任何会影响架构或长期维护的选择，记录到 `docs/logs/decision-log.md`。',
      '# 阻塞日志',
      '### 已尝试方案',
      '### 需要的用户决策或外部条件',
      'listen EPERM',
      'Chromium',
      '# 决策日志',
      '### 决策',
      '### 原因',
      '### 影响',
      'MCP Server 采用 Registry + SDK 薄绑定',
      'Goal 审计不替代用户验收',
      '已记录到 `docs/logs/blockers.md`',
      '决策日志已更新',
      '## Token Control Policy',
      '优先 `rg`、`sed -n`、`wc -l`',
      '小范围 patch，避免无关重构',
      '聚焦当前切片，不一次性生成大量低价值测试',
      '关键决策写入文档，减少对对话历史的依赖',
      '每个阶段应优先使用局部上下文和项目文档作为长期记忆。',
      '文档和开发日志更新后复跑 `pnpm goal:audit`',
      'readGoalAuditTextSources',
      'buildCurrentGoalAuditItemsFromSources',
      'buildGoalAuditItemsFromWorkspace',
      'classifyUserAcceptanceRecord',
      'goalLastUpdatedText',
      'pathExists: async',
      'packages/acceptance/dist',
      '"@hardening-mcp/acceptance": "workspace:*"',
      '"./run-acceptance"',
      '"types": "./dist/run-acceptance.d.ts"',
      '"default": "./dist/run-acceptance.js"',
      '"./run-goal-audit"',
      '"types": "./dist/run-goal-audit.d.ts"',
      '"default": "./dist/run-goal-audit.js"',
      '"./run-user-acceptance"',
      '"types": "./dist/run-user-acceptance.d.ts"',
      '"default": "./dist/run-user-acceptance.js"',
      '"./run-user-acceptance-handoff"',
      '"types": "./dist/run-user-acceptance-handoff.d.ts"',
      '"default": "./dist/run-user-acceptance-handoff.js"',
      '本地优先',
      '不读取浏览器个人资料',
      '工具是否没有输出 env value 或敏感信息',
      '不上传代码。',
      '不上传日志。',
      '不上传 screenshots/traces。',
      '报告中只写 env key 名，不写 env value。',
      'envHints',
      'redactSensitiveText',
      'sensitiveKeyValuePattern',
      'redacts sensitive values from successful CLI JSON output',
      'redacts sensitive values from boot errors in reports and patch diffs',
      'redacts sensitive values from user notes in acceptance records',
      'redacts sensitive repo path values in handoff commands',
      'fills safe form fields and skips sensitive fields before submit interactions',
      'destructive_or_sensitive_action',
      materialNeedles
    ].join('\n');

    const items = await buildCurrentGoalAuditItemsFromSources({
      sources: {
        packageJson: readFileSync('package.json', 'utf8'),
        acceptancePackageJson: readFileSync('packages/acceptance/package.json', 'utf8'),
        sharedPackageJson: readFileSync('packages/shared/package.json', 'utf8'),
        codexGoal: `最后更新：2026年6月21日\n${sharedMarkers}`,
        toolRegistry: sharedMarkers,
        mcpServerSource: sharedMarkers,
        mcpServerTest: sharedMarkers,
        cliRun: sharedMarkers,
        analyzeRepo: sharedMarkers,
        privacyRedaction: sharedMarkers,
        playwrightDriver: sharedMarkers,
        bootAppTool: sharedMarkers,
        exploreAppTool: sharedMarkers,
        runHardening: sharedMarkers,
        generateTestsTool: sharedMarkers,
        generateRepairPlanTool: sharedMarkers,
        repairPlanGenerator: sharedMarkers,
        repairPlanTests: sharedMarkers,
        hardenReport: sharedMarkers,
        acceptanceRun: '生成时间：2026-06-21T00:00:00.000Z\n| 验收模式 | full |\n| 总体结论 | 通过 |\nPackage subpath import smoke\nPackage subpath type-resolution smoke\nIntegration tests\nBenchmark\nReal Chromium trace E2E',
        spikeResults: '| Go/No-go | Go |\n| Benchmark repo 总数 | 5 |\n| 完整流程完成数 | 5 |',
        readme: sharedMarkers,
        userAcceptanceGuide: sharedMarkers,
        sampleHardeningReport: sharedMarkers,
        testStrategy: sharedMarkers,
        acceptanceChecklist: sharedMarkers,
        userAcceptanceHandoff: sharedMarkers,
        userAcceptanceHandoffBuilder: sharedMarkers,
        userAcceptanceHandoffRunner: sharedMarkers,
        userAcceptanceHandoffTests: sharedMarkers,
        repoPreflight: sharedMarkers,
        userAcceptanceArgs: sharedMarkers,
        userAcceptanceBuilder: sharedMarkers,
        userAcceptanceRunner: sharedMarkers,
        userAcceptanceTests: sharedMarkers,
        devLog: sharedMarkers,
        blockersLog: sharedMarkers,
        decisionLog: sharedMarkers,
        goalAuditSource: sharedMarkers,
        goalAuditTests: sharedMarkers,
        userAcceptanceRecord: sharedMarkers,
        legacySharedPrivacyRedaction: 'packages/shared/dist',
        legacySharedShellQuote: 'packages/shared/dist',
        legacySharedShellWords: 'packages/shared/dist',
        ...Object.fromEntries([
          ...PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS,
          ...PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS,
          ...PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS
        ].map((spec) => [spec.key, sharedMarkers])),
        legacyAcceptanceFatalError: sharedMarkers,
        legacyAcceptanceGoalAudit: sharedMarkers,
        legacyAcceptanceMarkdown: sharedMarkers,
        legacyAcceptanceRepoPreflight: sharedMarkers,
        legacyAcceptanceReport: sharedMarkers,
        legacyAcceptanceRunAcceptance: sharedMarkers,
        legacyAcceptanceRunGoalAudit: sharedMarkers,
        legacyAcceptanceRunUserAcceptanceHandoff: sharedMarkers,
        legacyAcceptanceRunUserAcceptance: sharedMarkers,
        legacyAcceptanceUserAcceptanceArgs: sharedMarkers,
        legacyAcceptanceUserAcceptanceHandoff: sharedMarkers,
        legacyAcceptanceUserAcceptance: sharedMarkers,
        legacyDistAcceptanceFatalError: sharedMarkers,
        legacyDistAcceptanceGoalAudit: sharedMarkers,
        legacyDistAcceptanceMarkdown: sharedMarkers,
        legacyDistAcceptanceRepoPreflight: sharedMarkers,
        legacyDistAcceptanceReport: sharedMarkers,
        legacyDistAcceptanceRunAcceptance: sharedMarkers,
        legacyDistAcceptanceRunGoalAudit: sharedMarkers,
        legacyDistAcceptanceRunUserAcceptanceHandoff: sharedMarkers,
        legacyDistAcceptanceRunUserAcceptance: sharedMarkers,
        legacyDistAcceptanceUserAcceptanceArgs: sharedMarkers,
        legacyDistAcceptanceUserAcceptanceHandoff: sharedMarkers,
        legacyDistAcceptanceUserAcceptance: sharedMarkers,
        legacyDistAcceptanceFatalErrorDeclaration: sharedMarkers,
        legacyDistAcceptanceGoalAuditDeclaration: sharedMarkers,
        legacyDistAcceptanceMarkdownDeclaration: sharedMarkers,
        legacyDistAcceptanceRepoPreflightDeclaration: sharedMarkers,
        legacyDistAcceptanceReportDeclaration: sharedMarkers,
        legacyDistAcceptanceRunAcceptanceDeclaration: sharedMarkers,
        legacyDistAcceptanceRunGoalAuditDeclaration: sharedMarkers,
        legacyDistAcceptanceRunUserAcceptanceHandoffDeclaration: sharedMarkers,
        legacyDistAcceptanceRunUserAcceptanceDeclaration: sharedMarkers,
        legacyDistAcceptanceUserAcceptanceArgsDeclaration: sharedMarkers,
        legacyDistAcceptanceUserAcceptanceHandoffDeclaration: sharedMarkers,
        legacyDistAcceptanceUserAcceptanceDeclaration: sharedMarkers,
        ...Object.fromEntries(
          LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS.map((spec) => {
            const fileName = spec.path.split('/').pop()?.replace(/\.map$/u, '') ?? '';

            return [spec.key, `{"version":3,"file":"${fileName}"}`];
          })
        ),
        cliSmokeTests: sharedMarkers,
        mcpProtocolTests: sharedMarkers,
        securityTests: sharedMarkers,
        artifactTests: sharedMarkers,
        observabilityTests: sharedMarkers
      },
      pathExists: async () => true,
      userAcceptanceStatus: 'pending_or_invalid'
    });

    expect(items).toHaveLength(29);
    expect(items.map((item) => `${item.category}:${item.requirement}`)).toEqual([
      '交付物:可运行的 CLI',
      '交付物:可运行的 MCP Server',
      'P0 Tools:P0 tools 通过 MCP 层暴露',
      'MCP 可运行性:协议级 list/call、P0 链路与 session 清理',
      'P0 Tools:P0 tools 通过 CLI 层调用',
      'CLI 可运行性:子命令、帮助入口与 artifact smoke',
      '完整工作流:可执行 analyze_repo -> boot_app -> explore_app -> generate_tests -> harden_report -> repair_plan',
      '本地 artifact:本地 artifact 输出',
      '可观测性:可复现信息与失败证据',
      '质量门禁:完整验收门禁通过',
      '开发流程:TDD 与测试金字塔执行记录',
      '日志治理:阻塞与决策记录',
      'Token 控制:精准上下文与小步审计',
      '架构迁移:Legacy acceptance 兼容 wrapper',
      '架构迁移:Acceptance package typed module exports',
      '架构迁移:Shared package typed module exports and legacy wrappers',
      '架构迁移:Legacy acceptance dist compatibility outputs',
      'Benchmark:Benchmark 达到 Go 标准',
      '文档与日志:Required Documents 已维护',
      'Local-first 与隐私:报告和验收文档声明本地优先与敏感信息边界',
      '安全边界:不硬编码密钥、不上传代码、不泄露 env value',
      '用户验收材料:演示命令和验收清单',
      '用户验收材料:稳定报告样例',
      '用户验收材料:已知限制和未解决 blocker 列表',
      '用户验收材料:MCP 配置示例和客户端验收步骤',
      '用户验收材料:安装步骤和环境前置条件',
      '用户验收材料:示例 repo 运行流程',
      '用户验收材料:用户验收交接包',
      '用户验收:用户确认 MVP 符合预期'
    ]);
    expect(items.slice(0, -1).every((item) => item.status === 'passed')).toBe(true);
    expect(items.at(-1)).toEqual(expect.objectContaining({
      category: '用户验收',
      requirement: '用户确认 MVP 符合预期',
      status: 'manual_required'
    }));
  });

  it('builds current goal audit items from workspace sources through the package runner', async () => {
    const reads: string[] = [];
    const pathChecks: string[] = [];

    const items = await buildGoalAuditItemsFromWorkspace({
      root: '/repo',
      readText: async (path) => {
        reads.push(path);

        return '';
      },
      pathExists: async (path) => {
        pathChecks.push(path);

        return true;
      }
    });

    expect(items).toHaveLength(29);
    expect(items.at(-1)).toEqual(expect.objectContaining({
      category: '用户验收',
      requirement: '用户确认 MVP 符合预期',
      status: 'manual_required'
    }));
    expect(reads).toContain('/repo/package.json');
    expect(reads).toContain('/repo/packages/acceptance/package.json');
    expect(reads).toContain('/repo/dist/internal/acceptance/run-acceptance.js');
    expect(reads).toContain('/repo/dist/internal/acceptance/run-acceptance.d.ts');
    expect(reads).toContain('/repo/docs/acceptance/user-acceptance-record.md');
    expect(reads).toContain('/repo/tests/integration/cli-run.test.ts');
    expect(pathChecks).toContain('/repo/README.md');
    expect(pathChecks).toContain('/repo/dist/adapters/cli/index.js');
  });

  it('tracks legacy dist acceptance declaration outputs as package compatibility evidence', () => {
    expect(LEGACY_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS.map((spec) => spec.path)).toEqual([
      'dist/internal/acceptance/fatal-error.d.ts',
      'dist/internal/acceptance/goal-audit.d.ts',
      'dist/internal/acceptance/markdown.d.ts',
      'dist/internal/acceptance/repo-preflight.d.ts',
      'dist/internal/acceptance/report.d.ts',
      'dist/internal/acceptance/run-acceptance.d.ts',
      'dist/internal/acceptance/run-goal-audit.d.ts',
      'dist/internal/acceptance/run-user-acceptance-handoff.d.ts',
      'dist/internal/acceptance/run-user-acceptance.d.ts',
      'dist/internal/acceptance/user-acceptance-args.d.ts',
      'dist/internal/acceptance/user-acceptance-handoff.d.ts',
      'dist/internal/acceptance/user-acceptance.d.ts'
    ]);
  });

  it('writes a package-owned goal audit document from injected audit items', async () => {
    const writes: Array<{ outputPath: string; markdown: string }> = [];
    let stdout = '';

    await expect(runGoalAudit({
      generatedAt: '2026-06-21T00:00:00.000Z',
      buildGoalAuditItems: vi.fn().mockResolvedValue([
        {
          category: '质量门禁',
          requirement: '完整验收门禁通过',
          status: 'passed',
          evidence: ['docs/acceptance/acceptance-run.md full mode passed']
        },
        {
          category: '用户验收',
          requirement: '用户确认 MVP 符合预期',
          status: 'manual_required',
          evidence: ['manual confirmation is still required']
        }
      ]),
      writeGoalAudit: async (outputPath, markdown) => {
        writes.push({ outputPath, markdown });
      },
      writeStdout: (markdown) => {
        stdout = markdown;
      }
    })).resolves.toBe(0);

    expect(writes).toEqual([
      expect.objectContaining({
        outputPath: expect.stringContaining('docs/acceptance/goal-completion-audit.md'),
        markdown: expect.stringContaining('# Goal 完成度审计')
      })
    ]);
    expect(writes[0]?.markdown).toContain('| 需要人工确认 | 1 |');
    expect(stdout).toBe(writes[0]?.markdown);
  });

  it('keeps package-owned user acceptance record classification compatible with the legacy implementation', () => {
    const record = `# 真实项目用户验收记录

生成时间：2026-06-20T12:00:00.000Z

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | 通过 |
| 用户结论 | 用户确认通过 |
| 真实项目路径 | \`/tmp/real-app\` |
| 验收命令 | \`pnpm user:accept -- --repo /tmp/real-app --decision accepted\` |
| hardening report | \`/tmp/real-app/hardening-report.md\` |
| findings | \`/tmp/real-app/findings.json\` |
| 必需项失败 | 0 |

## Artifact 检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
| hardening report 已生成 | 是 | 通过 | /tmp/real-app/hardening-report.md |
| findings 已记录 | 是 | 通过 | /tmp/real-app/findings.json |
| generated Playwright spec 执行验证 | 是 | 通过 | HARDENING_BASE_URL=http://127.0.0.1:3000 npx playwright test generated.spec.ts |

## 用户备注

用户确认 MVP 符合预期。

## 验收判定

真实项目验收运行通过，且用户已明确确认 MVP 符合预期。
`;
    const options = {
      pathExists: (path: string) => path.startsWith('/tmp/real-app')
    };

    expect(classifyUserAcceptanceRecord(record, options)).toBe(classifyLegacyUserAcceptanceRecord(record, options));
    expect(isAcceptedUserAcceptanceRecord(record, options)).toBe(isLegacyAcceptedUserAcceptanceRecord(record, options));
    expect(isAcceptanceRunFreshEnough('生成时间：2026-06-20T00:00:00.000Z', '最后更新：2026年6月20日'))
      .toBe(isLegacyAcceptanceRunFreshEnough('生成时间：2026-06-20T00:00:00.000Z', '最后更新：2026年6月20日'));
  });

  it('audits the user acceptance record as a required goal document', () => {
    expect(REQUIRED_DOCUMENT_PATHS).toContain('docs/acceptance/user-acceptance-record.md');
  });

  it('keeps package-owned required document paths compatible with legacy goal audit', () => {
    expect(PACKAGE_REQUIRED_DOCUMENT_PATHS).toEqual(REQUIRED_DOCUMENT_PATHS);
    expect(LEGACY_REQUIRED_DOCUMENT_PATHS).toEqual(REQUIRED_DOCUMENT_PATHS);
  });

  it('builds package-owned text and file goal audit requirements', async () => {
    expect(buildGoalAuditTextRequirement({
      category: '文档',
      requirement: 'README marker',
      text: 'README includes install and acceptance commands',
      needles: ['install', 'acceptance'],
      evidence: ['README includes required markers']
    })).toEqual({
      category: '文档',
      requirement: 'README marker',
      status: 'passed',
      evidence: ['README includes required markers']
    });

    expect(buildGoalAuditTextRequirement({
      category: '文档',
      requirement: 'Missing marker',
      text: 'README includes install',
      needles: ['install', 'acceptance'],
      evidence: ['README includes required markers']
    })).toEqual({
      category: '文档',
      requirement: 'Missing marker',
      status: 'missing',
      evidence: ['missing text markers: acceptance'],
      nextAction: '补齐实现或文档证据后重新运行 goal audit。'
    });

    await expect(buildGoalAuditFileRequirement({
      category: '交付物',
      requirement: 'Required files',
      paths: ['README.md', 'missing.md'],
      evidence: ['all files exist'],
      pathExists: async (path) => path === 'README.md'
    })).resolves.toEqual({
      category: '交付物',
      requirement: 'Required files',
      status: 'missing',
      evidence: ['missing: missing.md'],
      nextAction: '补齐缺失文件或配置后重新运行 goal audit。'
    });
  });

  it('builds package-owned acceptance run quality gate requirements with freshness checks', () => {
    const freshAcceptanceRun = `# MVP 验收运行报告

生成时间：2026-06-21T00:00:00.000Z

| 验收模式 | full |
| 总体结论 | 通过 |

Package subpath import smoke
Package subpath type-resolution smoke
Integration tests
Benchmark
Real Chromium trace E2E
`;
    const missingPackageSubpathSmoke = freshAcceptanceRun.replace('Package subpath import smoke\n', '');
    const missingPackageSubpathTypeResolutionSmoke = freshAcceptanceRun.replace(
      'Package subpath type-resolution smoke\n',
      ''
    );
    const staleAcceptanceRun = freshAcceptanceRun.replace('2026-06-21T00:00:00.000Z', '2026-06-20T00:00:00.000Z');
    const codexGoal = '最后更新：2026年6月21日';

    expect(buildAcceptanceRunQualityGateRequirement({
      acceptanceRun: freshAcceptanceRun,
      codexGoal
    })).toEqual({
      category: '质量门禁',
      requirement: '完整验收门禁通过',
      status: 'passed',
      evidence: ['docs/acceptance/acceptance-run.md full mode passed and is fresh for the current goal update date']
    });
    expect(buildAcceptanceRunQualityGateRequirement({
      acceptanceRun: missingPackageSubpathSmoke,
      codexGoal
    })).toEqual({
      category: '质量门禁',
      requirement: '完整验收门禁通过',
      status: 'missing',
      evidence: ['missing text markers: Package subpath import smoke'],
      nextAction: '补齐实现或文档证据后重新运行 goal audit。'
    });
    expect(buildAcceptanceRunQualityGateRequirement({
      acceptanceRun: missingPackageSubpathTypeResolutionSmoke,
      codexGoal
    })).toEqual({
      category: '质量门禁',
      requirement: '完整验收门禁通过',
      status: 'missing',
      evidence: ['missing text markers: Package subpath type-resolution smoke'],
      nextAction: '补齐实现或文档证据后重新运行 goal audit。'
    });
    expect(buildAcceptanceRunQualityGateRequirement({
      acceptanceRun: staleAcceptanceRun,
      codexGoal
    })).toEqual({
      category: '质量门禁',
      requirement: '完整验收门禁通过',
      status: 'missing',
      evidence: ['stale docs/acceptance/acceptance-run.md: generated before docs/goals/codex-goal.md last update date or missing generated timestamp'],
      nextAction: '重新运行 `pnpm acceptance -- --full --browser` 后再运行 goal audit。'
    });
  });

  it('audits a stable sample hardening report as a required goal document', () => {
    expect(REQUIRED_DOCUMENT_PATHS).toContain('docs/testing/samples/sample-hardening-report.md');
  });

  it('audits local artifact output as an explicit goal deliverable', async () => {
    const items = await buildCurrentGoalAuditItems();
    const item = items.find((candidate) => (
      candidate.category === '本地 artifact'
      && candidate.requirement === '本地 artifact 输出'
    ));

    expect(item).toEqual(expect.objectContaining({
      category: '本地 artifact',
      requirement: '本地 artifact 输出',
      status: 'passed'
    }));
    expect(item?.evidence.join('\n')).toContain('multi-repo workspace manifest');
  });

  it('audits runnable CLI smoke coverage as explicit goal evidence', async () => {
    const items = await buildCurrentGoalAuditItems();

    expect(items).toContainEqual(expect.objectContaining({
      category: 'CLI 可运行性',
      requirement: '子命令、帮助入口与 artifact smoke',
      status: 'passed'
    }));
  });

  it('audits runnable MCP protocol coverage as explicit goal evidence', async () => {
    const items = await buildCurrentGoalAuditItems();

    expect(items).toContainEqual(expect.objectContaining({
      category: 'MCP 可运行性',
      requirement: '协议级 list/call、P0 链路与 session 清理',
      status: 'passed'
    }));
  });

  it('audits demo commands and acceptance checklist as explicit user acceptance materials', async () => {
    const items = await buildCurrentGoalAuditItems();

    expect(items).toContainEqual(expect.objectContaining({
      category: '用户验收材料',
      requirement: '演示命令和验收清单',
      status: 'passed'
    }));
  });

  it('audits the generated report sample as explicit user acceptance material', async () => {
    const items = await buildCurrentGoalAuditItems();

    expect(items).toContainEqual(expect.objectContaining({
      category: '用户验收材料',
      requirement: '稳定报告样例',
      status: 'passed'
    }));
  });

  it('audits known limitations and unresolved blockers as explicit user acceptance material', async () => {
    const items = await buildCurrentGoalAuditItems();

    expect(items).toContainEqual(expect.objectContaining({
      category: '用户验收材料',
      requirement: '已知限制和未解决 blocker 列表',
      status: 'passed'
    }));
  });

  it('audits MCP client configuration and validation steps as explicit user acceptance material', async () => {
    const items = await buildCurrentGoalAuditItems();

    expect(items).toContainEqual(expect.objectContaining({
      category: '用户验收材料',
      requirement: 'MCP 配置示例和客户端验收步骤',
      status: 'passed'
    }));
  });

  it('audits installation steps and environment prerequisites as explicit user acceptance material', async () => {
    const items = await buildCurrentGoalAuditItems();

    expect(items).toContainEqual(expect.objectContaining({
      category: '用户验收材料',
      requirement: '安装步骤和环境前置条件',
      status: 'passed'
    }));
  });

  it('audits the sample repo run flow as explicit user acceptance material', async () => {
    const items = await buildCurrentGoalAuditItems();

    expect(items).toContainEqual(expect.objectContaining({
      category: '用户验收材料',
      requirement: '示例 repo 运行流程',
      status: 'passed'
    }));
  });

  it('audits the user acceptance handoff package as explicit user acceptance material', async () => {
    const items = await buildCurrentGoalAuditItems();

    expect(items).toContainEqual(expect.objectContaining({
      category: '用户验收材料',
      requirement: '用户验收交接包',
      status: 'passed'
    }));
  });

  it('audits that the default user acceptance handoff refreshes the linked goal audit document', async () => {
    const items = await buildCurrentGoalAuditItems();
    const handoffItem = items.find((item) => item.category === '用户验收材料' && item.requirement === '用户验收交接包');

    expect(handoffItem).toBeDefined();
    expect(handoffItem?.status).toBe('passed');
    expect(handoffItem?.evidence.join('\n')).toContain('refreshes docs/acceptance/goal-completion-audit.md');
  });

  it('audits accepted user acceptance record freshness in user acceptance materials', async () => {
    const items = await buildCurrentGoalAuditItems();
    const handoffItem = items.find((item) => item.category === '用户验收材料' && item.requirement === '用户验收交接包');

    expect(handoffItem).toBeDefined();
    expect(handoffItem?.status).toBe('passed');
    expect(handoffItem?.evidence.join('\n')).toContain('accepted user acceptance records must be fresh for the current goal update date');
  });

  it('audits that the handoff documents accepted confirmation notes as a completion boundary', async () => {
    const items = await buildCurrentGoalAuditItems();
    const handoffItem = items.find((item) => item.category === '用户验收材料' && item.requirement === '用户验收交接包');

    expect(handoffItem).toBeDefined();
    expect(handoffItem?.status).toBe('passed');
    expect(handoffItem?.evidence.join('\n')).toContain('handoff documents accepted confirmation notes as a completion boundary');
  });

  it('audits that the handoff documents generated spec validation as a completion boundary', async () => {
    const items = await buildCurrentGoalAuditItems();
    const handoffItem = items.find((item) => item.category === '用户验收材料' && item.requirement === '用户验收交接包');

    expect(handoffItem).toBeDefined();
    expect(handoffItem?.status).toBe('passed');
    expect(handoffItem?.evidence.join('\n')).toContain('handoff documents generated spec validation as a completion boundary');
  });

  it('audits that the handoff package summarizes the current user acceptance status and next action', async () => {
    const items = await buildCurrentGoalAuditItems();
    const handoffItem = items.find((item) => item.category === '用户验收材料' && item.requirement === '用户验收交接包');

    expect(handoffItem).toBeDefined();
    expect(handoffItem?.status).toBe('passed');
    expect(handoffItem?.evidence.join('\n')).toContain('handoff summarizes current user acceptance status and next action');
  });

  it('audits that the handoff package summarizes the automated quality gate status', async () => {
    const items = await buildCurrentGoalAuditItems();
    const handoffItem = items.find((item) => item.category === '用户验收材料' && item.requirement === '用户验收交接包');

    expect(handoffItem).toBeDefined();
    expect(handoffItem?.status).toBe('passed');
    expect(handoffItem?.evidence.join('\n')).toContain('handoff summarizes automated quality gate status');
  });

  it('audits that the handoff package summarizes the architecture migration status', async () => {
    const items = await buildCurrentGoalAuditItems();
    const handoffItem = items.find((item) => item.category === '用户验收材料' && item.requirement === '用户验收交接包');

    expect(handoffItem).toBeDefined();
    expect(handoffItem?.status).toBe('passed');
    expect(handoffItem?.evidence.join('\n')).toContain('handoff summarizes architecture migration status');
  });

  it('audits that the handoff package renders an explicit current conclusion', async () => {
    const items = await buildCurrentGoalAuditItems();
    const handoffItem = items.find((item) => item.category === '用户验收材料' && item.requirement === '用户验收交接包');

    expect(handoffItem).toBeDefined();
    expect(handoffItem?.status).toBe('passed');
    expect(handoffItem?.evidence.join('\n')).toContain('handoff renders an explicit current conclusion');
  });

  it('audits that the handoff current conclusion prioritizes repo preflight blockers', async () => {
    const items = await buildCurrentGoalAuditItems();
    const handoffItem = items.find((item) => item.category === '用户验收材料' && item.requirement === '用户验收交接包');

    expect(handoffItem).toBeDefined();
    expect(handoffItem?.status).toBe('passed');
    expect(handoffItem?.evidence.join('\n')).toContain('handoff current conclusion prioritizes repo preflight blockers');
  });

  it('audits local-first security and sensitive-data boundaries as explicit goal evidence', async () => {
    const items = await buildCurrentGoalAuditItems();

    expect(items).toContainEqual(expect.objectContaining({
      category: '安全边界',
      requirement: '不硬编码密钥、不上传代码、不泄露 env value',
      status: 'passed'
    }));
  });

  it('audits sensitive repo path redaction in user acceptance handoff commands', async () => {
    const items = await buildCurrentGoalAuditItems();
    const securityItem = items.find((item) => item.category === '安全边界' && item.requirement === '不硬编码密钥、不上传代码、不泄露 env value');

    expect(securityItem).toBeDefined();
    expect(securityItem?.status).toBe('passed');
    expect(securityItem?.evidence.join('\n')).toContain('handoff commands redact sensitive repo path values');
  });

  it('audits the handoff warning for redacted repo command paths', async () => {
    const items = await buildCurrentGoalAuditItems();
    const handoffItem = items.find((item) => item.category === '用户验收材料' && item.requirement === '用户验收交接包');

    expect(handoffItem).toBeDefined();
    expect(handoffItem?.status).toBe('passed');
    expect(handoffItem?.evidence.join('\n')).toContain('warns when displayed repo command paths are redacted');
  });

  it('audits the default handoff command for regenerating with a real repo preflight', async () => {
    const items = await buildCurrentGoalAuditItems();
    const handoffItem = items.find((item) => item.category === '用户验收材料' && item.requirement === '用户验收交接包');

    expect(handoffItem).toBeDefined();
    expect(handoffItem?.status).toBe('passed');
    expect(handoffItem?.evidence.join('\n')).toContain('prompts regeneration with a real repo preflight');
  });

  it('audits the valid repo handoff CLI success path with concrete commands', async () => {
    const items = await buildCurrentGoalAuditItems();
    const handoffItem = items.find((item) => item.category === '用户验收材料' && item.requirement === '用户验收交接包');

    expect(handoffItem).toBeDefined();
    expect(handoffItem?.status).toBe('passed');
    expect(handoffItem?.evidence.join('\n')).toContain('valid repo handoff exits zero with concrete commands');
  });

  it('audits that handoff changes_requested commands use concrete notes', async () => {
    const items = await buildCurrentGoalAuditItems();
    const handoffItem = items.find((item) => item.category === '用户验收材料' && item.requirement === '用户验收交接包');

    expect(handoffItem).toBeDefined();
    expect(handoffItem?.status).toBe('passed');
    expect(handoffItem?.evidence.join('\n')).toContain('handoff changes_requested commands use concrete notes');
  });

  it('audits placeholder repo path rejection before user acceptance commands run', async () => {
    const items = await buildCurrentGoalAuditItems();
    const handoffItem = items.find((item) => item.category === '用户验收材料' && item.requirement === '用户验收交接包');

    expect(handoffItem).toBeDefined();
    expect(handoffItem?.status).toBe('passed');
    expect(handoffItem?.evidence.join('\n')).toContain('placeholder repo paths are rejected before user acceptance commands run');
  });

  it('audits that displayed user acceptance commands keep placeholder repo paths as placeholders', async () => {
    const items = await buildCurrentGoalAuditItems();
    const handoffItem = items.find((item) => item.category === '用户验收材料' && item.requirement === '用户验收交接包');

    expect(handoffItem).toBeDefined();
    expect(handoffItem?.status).toBe('passed');
    expect(handoffItem?.evidence.join('\n')).toContain('displayed user acceptance commands keep placeholder repo paths as placeholders');
  });

  it('audits that user acceptance summaries keep placeholder repo paths as placeholders', async () => {
    const items = await buildCurrentGoalAuditItems();
    const handoffItem = items.find((item) => item.category === '用户验收材料' && item.requirement === '用户验收交接包');

    expect(handoffItem).toBeDefined();
    expect(handoffItem?.status).toBe('passed');
    expect(handoffItem?.evidence.join('\n')).toContain('user acceptance summaries keep placeholder repo paths as placeholders');
  });

  it('audits that the handoff package documents package.json object manifest preflight', async () => {
    const items = await buildCurrentGoalAuditItems();
    const handoffItem = items.find((item) => item.category === '用户验收材料' && item.requirement === '用户验收交接包');

    expect(handoffItem).toBeDefined();
    expect(handoffItem?.status).toBe('passed');
    expect(handoffItem?.evidence.join('\n')).toContain('handoff package documents package.json object manifest preflight');
  });

  it('audits separate repo root and package.json preflight checks in user acceptance records', async () => {
    const items = await buildCurrentGoalAuditItems();
    const demoItem = items.find((item) => item.category === '用户验收材料' && item.requirement === '演示命令和验收清单');

    expect(demoItem).toBeDefined();
    expect(demoItem?.status).toBe('passed');
    expect(demoItem?.evidence.join('\n')).toContain('user:accept records separate repo root and package.json preflight checks');
  });

  it('audits malformed package.json rejection in user acceptance preflight checks', async () => {
    const items = await buildCurrentGoalAuditItems();
    const demoItem = items.find((item) => item.category === '用户验收材料' && item.requirement === '演示命令和验收清单');

    expect(demoItem).toBeDefined();
    expect(demoItem?.status).toBe('passed');
    expect(demoItem?.evidence.join('\n')).toContain('malformed package.json is rejected before hardening runs');
  });

  it('audits non-object package.json manifest rejection in user acceptance preflight checks', async () => {
    const items = await buildCurrentGoalAuditItems();
    const demoItem = items.find((item) => item.category === '用户验收材料' && item.requirement === '演示命令和验收清单');

    expect(demoItem).toBeDefined();
    expect(demoItem?.status).toBe('passed');
    expect(demoItem?.evidence.join('\n')).toContain('non-object package.json manifests are rejected before hardening runs');
  });

  it('audits generated Playwright spec execution validation in user acceptance materials', async () => {
    const items = await buildCurrentGoalAuditItems();
    const demoItem = items.find((item) => item.category === '用户验收材料' && item.requirement === '演示命令和验收清单');

    expect(demoItem).toBeDefined();
    expect(demoItem?.status).toBe('passed');
    expect(demoItem?.evidence.join('\n')).toContain('user:accept can execute generated Playwright specs');
  });

  it('audits next-step guidance in generated user acceptance records', async () => {
    const items = await buildCurrentGoalAuditItems();
    const demoItem = items.find((item) => item.category === '用户验收材料' && item.requirement === '演示命令和验收清单');

    expect(demoItem).toBeDefined();
    expect(demoItem?.status).toBe('passed');
    expect(demoItem?.evidence.join('\n')).toContain('generated user acceptance records include next-step guidance');
  });

  it('audits next-step guidance in the current user acceptance record lifecycle state', async () => {
    const items = await buildCurrentGoalAuditItems();
    const demoItem = items.find((item) => item.category === '用户验收材料' && item.requirement === '演示命令和验收清单');

    expect(demoItem).toBeDefined();
    expect(demoItem?.status).toBe('passed');
    expect(demoItem?.evidence.join('\n')).toContain('current acceptance record includes lifecycle-appropriate next-step guidance');
  });

  it('audits that changes_requested acceptance commands require concrete notes', async () => {
    const items = await buildCurrentGoalAuditItems();
    const demoItem = items.find((item) => item.category === '用户验收材料' && item.requirement === '演示命令和验收清单');

    expect(demoItem).toBeDefined();
    expect(demoItem?.status).toBe('passed');
    expect(demoItem?.evidence.join('\n')).toContain('changes_requested acceptance commands require concrete notes');
  });

  it('audits that accepted acceptance commands require concrete confirmation notes', async () => {
    const items = await buildCurrentGoalAuditItems();
    const demoItem = items.find((item) => item.category === '用户验收材料' && item.requirement === '演示命令和验收清单');

    expect(demoItem).toBeDefined();
    expect(demoItem?.status).toBe('passed');
    expect(demoItem?.evidence.join('\n')).toContain('accepted acceptance commands require concrete confirmation notes');
  });

  it('audits that accepted acceptance records require generated spec validation', async () => {
    const items = await buildCurrentGoalAuditItems();
    const demoItem = items.find((item) => item.category === '用户验收材料' && item.requirement === '演示命令和验收清单');

    expect(demoItem).toBeDefined();
    expect(demoItem?.status).toBe('passed');
    expect(demoItem?.evidence.join('\n')).toContain('accepted acceptance records require generated spec validation');
  });

  it('audits TDD and testing pyramid execution as explicit goal evidence', async () => {
    const items = await buildCurrentGoalAuditItems();

    expect(items).toContainEqual(expect.objectContaining({
      category: '开发流程',
      requirement: 'TDD 与测试金字塔执行记录',
      status: 'passed'
    }));
  });

  it('audits reproducible observability outputs as explicit goal evidence', async () => {
    const items = await buildCurrentGoalAuditItems();

    expect(items).toContainEqual(expect.objectContaining({
      category: '可观测性',
      requirement: '可复现信息与失败证据',
      status: 'passed'
    }));
  });

  it('rejects stale acceptance-run evidence generated before the current goal update date', () => {
    expect(isAcceptanceRunFreshEnough(
      '生成时间：2026-06-18T23:59:59.999Z',
      '最后更新：2026年6月19日'
    )).toBe(false);
    expect(isAcceptanceRunFreshEnough(
      '生成时间：2026-06-19T00:00:00.000Z',
      '最后更新：2026年6月19日'
    )).toBe(true);
  });

  it('audits blocker and decision logs as explicit goal evidence', async () => {
    const items = await buildCurrentGoalAuditItems();

    expect(items).toContainEqual(expect.objectContaining({
      category: '日志治理',
      requirement: '阻塞与决策记录',
      status: 'passed'
    }));
  });

  it('audits token-control discipline as explicit goal evidence', async () => {
    const items = await buildCurrentGoalAuditItems();

    expect(items).toContainEqual(expect.objectContaining({
      category: 'Token 控制',
      requirement: '精准上下文与小步审计',
      status: 'passed'
    }));
  });

  it('accepts user acceptance records only when the run passed, the user accepted, and no required checks failed', () => {
    expect(isAcceptedUserAcceptanceRecord(`# 真实项目用户验收记录

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | 通过 |
| 用户结论 | 用户确认通过 |
| 真实项目路径 | \`/tmp/real-app\` |
| 验收命令 | \`pnpm user:accept -- --repo /tmp/real-app --browser --validate-generated-tests --decision accepted --notes "用户确认 MVP 符合预期"\` |
| hardening report | \`/tmp/real-app/hardening-report.md\` |
| findings | \`/tmp/real-app/.hardening/run/findings.json\` |
| 必需项失败 | 0 |

## Artifact 检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
| hardening-report.md 已生成 | 是 | 通过 | /tmp/real-app/hardening-report.md |
| findings.json 已生成 | 是 | 通过 | /tmp/real-app/.hardening/run/findings.json |
| generated Playwright spec 已生成 | 是 | 通过 | /tmp/real-app/tests/hardening/generated.spec.ts |
| generated Playwright spec 执行验证 | 是 | 通过 | cd /tmp/real-app && HARDENING_BASE_URL=http://127.0.0.1:3000 playwright test tests/hardening/generated.spec.ts --reporter=line |

## 用户备注

用户确认 MVP 符合预期

## 验收判定

真实项目验收运行通过，且用户已明确确认 MVP 符合预期。
`)).toBe(true);

    expect(isAcceptedUserAcceptanceRecord(`| 验收运行状态 | 通过 |
| 用户结论 | 用户确认通过 |
| 必需项失败 | 1 |
`)).toBe(false);

    expect(isAcceptedUserAcceptanceRecord(`| 验收运行状态 | 通过 |
| 用户结论 | 用户确认通过 |
| 必需项失败 | 0 |
`)).toBe(false);

    expect(isAcceptedUserAcceptanceRecord(`| 验收运行状态 | 通过 |
| 用户结论 | 待用户确认 |
| 必需项失败 | 0 |
`)).toBe(false);
  });

  it('classifies changes_requested records only when the run passed and concrete change notes are present', () => {
    const record = `# 真实项目用户验收记录

生成时间：2026-06-19T00:00:00.000Z

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | 通过 |
| 用户结论 | 用户要求修改 |
| 真实项目路径 | \`/tmp/real-app\` |
| 验收命令 | \`pnpm user:accept -- --repo /tmp/real-app --browser --decision changes_requested --notes "补齐登录态探索并降低误报"\` |
| hardening report | \`/tmp/real-app/hardening-report.md\` |
| findings | \`/tmp/real-app/.hardening/run/findings.json\` |
| 必需项失败 | 0 |

## Artifact 检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
| hardening-report.md 已生成 | 是 | 通过 | /tmp/real-app/hardening-report.md |
| findings.json 已生成 | 是 | 通过 | /tmp/real-app/.hardening/run/findings.json |
| generated Playwright spec 已生成 | 是 | 通过 | /tmp/real-app/tests/hardening/generated.spec.ts |

## 用户备注

补齐登录态探索并降低误报。

## 验收判定

真实项目验收运行通过，但用户要求修改；应将修改项记录到开发日志或阻塞日志后继续迭代。
`;

    expect(classifyUserAcceptanceRecord(record, {
      pathExists: (path) => path.startsWith('/tmp/real-app')
    })).toBe('changes_requested');
    expect(isAcceptedUserAcceptanceRecord(record, {
      pathExists: (path) => path.startsWith('/tmp/real-app')
    })).toBe(false);

    expect(classifyUserAcceptanceRecord(
      record.replace('--decision changes_requested', '--decision accepted'),
      { pathExists: (path) => path.startsWith('/tmp/real-app') }
    )).toBe('pending_or_invalid');
  });

  it('does not classify accepted records generated before the current goal update date when freshness is required', () => {
    const record = `# 真实项目用户验收记录

生成时间：2026-06-18T23:59:59.999Z

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | 通过 |
| 用户结论 | 用户确认通过 |
| 真实项目路径 | \`/tmp/real-app\` |
| 验收命令 | \`pnpm user:accept -- --repo /tmp/real-app --browser --validate-generated-tests --decision accepted --notes "用户确认 MVP 符合预期"\` |
| hardening report | \`/tmp/real-app/hardening-report.md\` |
| findings | \`/tmp/real-app/.hardening/run/findings.json\` |
| 必需项失败 | 0 |

## Artifact 检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
| hardening-report.md 已生成 | 是 | 通过 | /tmp/real-app/hardening-report.md |
| findings.json 已生成 | 是 | 通过 | /tmp/real-app/.hardening/run/findings.json |
| generated Playwright spec 已生成 | 是 | 通过 | /tmp/real-app/tests/hardening/generated.spec.ts |
| generated Playwright spec 执行验证 | 是 | 通过 | cd /tmp/real-app && HARDENING_BASE_URL=http://127.0.0.1:3000 playwright test tests/hardening/generated.spec.ts --reporter=line |

## 用户备注

用户确认 MVP 符合预期

## 验收判定

真实项目验收运行通过，且用户已明确确认 MVP 符合预期。
`;

    expect(classifyUserAcceptanceRecord(record, {
      pathExists: (path) => path.startsWith('/tmp/real-app'),
      goalLastUpdatedText: '最后更新：2026年6月19日'
    })).toBe('pending_or_invalid');
    expect(classifyUserAcceptanceRecord(record.replace('2026-06-18T23:59:59.999Z', '2026-06-19T00:00:00.000Z'), {
      pathExists: (path) => path.startsWith('/tmp/real-app'),
      goalLastUpdatedText: '最后更新：2026年6月19日'
    })).toBe('accepted');
  });

  it('does not classify accepted records when concrete acceptance notes are missing', () => {
    const record = `# 真实项目用户验收记录

生成时间：2026-06-19T00:00:00.000Z

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | 通过 |
| 用户结论 | 用户确认通过 |
| 真实项目路径 | \`/tmp/real-app\` |
| 验收命令 | \`pnpm user:accept -- --repo /tmp/real-app --browser --decision accepted\` |
| hardening report | \`/tmp/real-app/hardening-report.md\` |
| findings | \`/tmp/real-app/.hardening/run/findings.json\` |
| 必需项失败 | 0 |

## Artifact 检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
| hardening-report.md 已生成 | 是 | 通过 | /tmp/real-app/hardening-report.md |
| findings.json 已生成 | 是 | 通过 | /tmp/real-app/.hardening/run/findings.json |
| generated Playwright spec 已生成 | 是 | 通过 | /tmp/real-app/tests/hardening/generated.spec.ts |

## 用户备注

待用户填写。

## 验收判定

真实项目验收运行通过，且用户已明确确认 MVP 符合预期。
`;

    expect(classifyUserAcceptanceRecord(record, {
      pathExists: (path) => path.startsWith('/tmp/real-app')
    })).toBe('pending_or_invalid');
  });

  it('does not classify accepted records when generated spec validation is skipped', () => {
    const record = `# 真实项目用户验收记录

生成时间：2026-06-19T00:00:00.000Z

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | 通过 |
| 用户结论 | 用户确认通过 |
| 真实项目路径 | \`/tmp/real-app\` |
| 验收命令 | \`pnpm user:accept -- --repo /tmp/real-app --browser --validate-generated-tests --decision accepted --notes "用户确认 MVP 符合预期"\` |
| hardening report | \`/tmp/real-app/hardening-report.md\` |
| findings | \`/tmp/real-app/.hardening/run/findings.json\` |
| 必需项失败 | 0 |

## Artifact 检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
| hardening-report.md 已生成 | 是 | 通过 | /tmp/real-app/hardening-report.md |
| findings.json 已生成 | 是 | 通过 | /tmp/real-app/.hardening/run/findings.json |
| generated Playwright spec 已生成 | 是 | 通过 | /tmp/real-app/tests/hardening/generated.spec.ts |
| generated Playwright spec 执行验证 | 否 | 跳过 | not requested |

## 用户备注

用户确认 MVP 符合预期

## 验收判定

真实项目验收运行通过，且用户已明确确认 MVP 符合预期。
`;

    expect(classifyUserAcceptanceRecord(record, {
      pathExists: (path) => path.startsWith('/tmp/real-app')
    })).toBe('pending_or_invalid');
  });

  it('accepts generated spec validation evidence that quotes the Playwright executable path', () => {
    const record = `# 真实项目用户验收记录

生成时间：2026-06-20T03:17:07.361Z

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | 通过 |
| 用户结论 | 用户确认通过 |
| 真实项目路径 | \`/tmp/real-app\` |
| 验收命令 | \`pnpm user:accept -- --repo /tmp/real-app --browser --validate-generated-tests --decision accepted --notes '用户确认 MVP 符合预期'\` |
| hardening report | \`/tmp/real-app/hardening-report.md\` |
| findings | \`/tmp/real-app/.hardening/run/findings.json\` |
| 必需项失败 | 0 |

## Artifact 检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
| hardening-report.md 已生成 | 是 | 通过 | /tmp/real-app/hardening-report.md |
| findings.json 已生成 | 是 | 通过 | /tmp/real-app/.hardening/run/findings.json |
| run manifest 已生成 | 是 | 通过 | /tmp/real-app/.hardening/runs/run-2026-06-20T03-15-45-204Z/manifest.json |
| generated Playwright spec 已生成 | 是 | 通过 | /tmp/real-app/tests/hardening/generated.spec.ts |
| generated Playwright spec 执行验证 | 是 | 通过 | cd /tmp/real-app && HARDENING_BASE_URL=http://127.0.0.1:3000 NODE_PATH='/tmp/agent tester/node_modules' '/tmp/agent tester/node_modules/.bin/playwright' test tests/hardening/generated.spec.ts --reporter=line |
| repo root 已记录 | 是 | 通过 | /tmp/real-app |

## 用户备注

用户确认 MVP 符合预期

## 验收判定

真实项目验收运行通过，且用户已明确确认 MVP 符合预期。
`;

    expect(classifyUserAcceptanceRecord(record, {
      pathExists: (path) => path.startsWith('/tmp/real-app'),
      goalLastUpdatedText: '最后更新：2026年6月20日'
    })).toBe('accepted');
  });

  it('does not classify changes_requested records when change notes are empty or placeholder text', () => {
    const record = `# 真实项目用户验收记录

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | 通过 |
| 用户结论 | 用户要求修改 |
| 真实项目路径 | \`/tmp/real-app\` |
| 验收命令 | \`pnpm user:accept -- --repo /tmp/real-app --browser --decision changes_requested\` |
| hardening report | \`/tmp/real-app/hardening-report.md\` |
| findings | \`/tmp/real-app/.hardening/run/findings.json\` |
| 必需项失败 | 0 |

## Artifact 检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
| hardening-report.md 已生成 | 是 | 通过 | /tmp/real-app/hardening-report.md |
| findings.json 已生成 | 是 | 通过 | /tmp/real-app/.hardening/run/findings.json |
| generated Playwright spec 已生成 | 是 | 通过 | /tmp/real-app/tests/hardening/generated.spec.ts |

## 用户备注

待用户填写。

## 验收判定

真实项目验收运行通过，但用户要求修改；应将修改项记录到开发日志或阻塞日志后继续迭代。
`;

    expect(classifyUserAcceptanceRecord(record, {
      pathExists: (path) => path.startsWith('/tmp/real-app')
    })).toBe('pending_or_invalid');
  });

  it('does not accept records that still contain placeholder repo or command values', () => {
    expect(isAcceptedUserAcceptanceRecord(`# 真实项目用户验收记录

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | 通过 |
| 用户结论 | 用户确认通过 |
| 真实项目路径 | <real-web-app-repo> |
| 验收命令 | \`pnpm user:accept -- --repo <real-web-app-repo> --browser --decision accepted\` |
| 必需项失败 | 0 |

## Artifact 检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
| hardening-report.md 已生成 | 是 | 通过 | /tmp/report.md |

## 验收判定

真实项目验收运行通过，且用户已明确确认 MVP 符合预期。
`)).toBe(false);
  });

  it('does not accept records without concrete report and findings paths', () => {
    expect(isAcceptedUserAcceptanceRecord(`# 真实项目用户验收记录

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | 通过 |
| 用户结论 | 用户确认通过 |
| 真实项目路径 | \`/tmp/real-app\` |
| 验收命令 | \`pnpm user:accept -- --repo /tmp/real-app --browser --decision accepted\` |
| hardening report | n/a |
| findings | 待生成 |
| 必需项失败 | 0 |

## Artifact 检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
| hardening-report.md 已生成 | 是 | 通过 | /tmp/report.md |

## 验收判定

真实项目验收运行通过，且用户已明确确认 MVP 符合预期。
`)).toBe(false);
  });

  it('does not accept records when report or findings paths do not exist', () => {
    expect(isAcceptedUserAcceptanceRecord(`# 真实项目用户验收记录

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | 通过 |
| 用户结论 | 用户确认通过 |
| 真实项目路径 | \`/tmp/real-app\` |
| 验收命令 | \`pnpm user:accept -- --repo /tmp/real-app --browser --decision accepted\` |
| hardening report | \`/tmp/real-app/hardening-report.md\` |
| findings | \`/tmp/real-app/.hardening/run/findings.json\` |
| 必需项失败 | 0 |

## Artifact 检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
| hardening-report.md 已生成 | 是 | 通过 | /tmp/real-app/hardening-report.md |

## 验收判定

真实项目验收运行通过，且用户已明确确认 MVP 符合预期。
`, {
      pathExists: (path) => path === '/tmp/real-app/hardening-report.md'
    })).toBe(false);
  });

  it('does not accept records when required artifact evidence paths do not exist', () => {
    expect(isAcceptedUserAcceptanceRecord(`# 真实项目用户验收记录

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | 通过 |
| 用户结论 | 用户确认通过 |
| 真实项目路径 | \`/tmp/real-app\` |
| 验收命令 | \`pnpm user:accept -- --repo /tmp/real-app --browser --decision accepted\` |
| hardening report | \`/tmp/real-app/hardening-report.md\` |
| findings | \`/tmp/real-app/.hardening/run/findings.json\` |
| 必需项失败 | 0 |

## Artifact 检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
| hardening-report.md 已生成 | 是 | 通过 | /tmp/real-app/hardening-report.md |
| findings.json 已生成 | 是 | 通过 | /tmp/real-app/.hardening/run/findings.json |
| generated Playwright spec 已生成 | 是 | 通过 | /tmp/real-app/tests/hardening/missing.spec.ts |
| generated Playwright spec 执行验证 | 是 | 通过 | cd /tmp/real-app && HARDENING_BASE_URL=http://127.0.0.1:3000 playwright test tests/hardening/missing.spec.ts --reporter=line |

## 验收判定

真实项目验收运行通过，且用户已明确确认 MVP 符合预期。
`, {
      pathExists: (path) => path !== '/tmp/real-app/tests/hardening/missing.spec.ts'
    })).toBe(false);
  });

  it('does not accept records when artifact paths are outside the real repo root', () => {
    expect(isAcceptedUserAcceptanceRecord(`# 真实项目用户验收记录

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | 通过 |
| 用户结论 | 用户确认通过 |
| 真实项目路径 | \`/tmp/real-app\` |
| 验收命令 | \`pnpm user:accept -- --repo /tmp/real-app --browser --decision accepted\` |
| hardening report | \`/tmp/other-app/hardening-report.md\` |
| findings | \`/tmp/real-app/.hardening/run/findings.json\` |
| 必需项失败 | 0 |

## Artifact 检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
| hardening-report.md 已生成 | 是 | 通过 | /tmp/other-app/hardening-report.md |
| findings.json 已生成 | 是 | 通过 | /tmp/real-app/.hardening/run/findings.json |
| generated Playwright spec 已生成 | 是 | 通过 | /tmp/real-app/tests/hardening/generated.spec.ts |

## 验收判定

真实项目验收运行通过，且用户已明确确认 MVP 符合预期。
`, {
      pathExists: () => true
    })).toBe(false);
  });

  it('does not accept records when the command repo differs from the summary repo', () => {
    expect(isAcceptedUserAcceptanceRecord(`# 真实项目用户验收记录

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | 通过 |
| 用户结论 | 用户确认通过 |
| 真实项目路径 | \`/tmp/real-app\` |
| 验收命令 | \`pnpm user:accept -- --repo /tmp/other-app --browser --decision accepted\` |
| hardening report | \`/tmp/real-app/hardening-report.md\` |
| findings | \`/tmp/real-app/.hardening/run/findings.json\` |
| 必需项失败 | 0 |

## Artifact 检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
| hardening-report.md 已生成 | 是 | 通过 | /tmp/real-app/hardening-report.md |
| findings.json 已生成 | 是 | 通过 | /tmp/real-app/.hardening/run/findings.json |
| generated Playwright spec 已生成 | 是 | 通过 | /tmp/real-app/tests/hardening/generated.spec.ts |

## 验收判定

真实项目验收运行通过，且用户已明确确认 MVP 符合预期。
`, {
      pathExists: () => true
    })).toBe(false);
  });

  it('does not accept records when accepted appears only outside the decision option', () => {
    expect(isAcceptedUserAcceptanceRecord(`# 真实项目用户验收记录

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | 通过 |
| 用户结论 | 用户确认通过 |
| 真实项目路径 | \`/tmp/real-app\` |
| 验收命令 | \`pnpm user:accept -- --repo /tmp/real-app --browser --decision pending --notes "--decision accepted after review"\` |
| hardening report | \`/tmp/real-app/hardening-report.md\` |
| findings | \`/tmp/real-app/.hardening/run/findings.json\` |
| 必需项失败 | 0 |

## Artifact 检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
| hardening-report.md 已生成 | 是 | 通过 | /tmp/real-app/hardening-report.md |
| findings.json 已生成 | 是 | 通过 | /tmp/real-app/.hardening/run/findings.json |
| generated Playwright spec 已生成 | 是 | 通过 | /tmp/real-app/tests/hardening/generated.spec.ts |

## 验收判定

真实项目验收运行通过，且用户已明确确认 MVP 符合预期。
`, {
      pathExists: () => true
    })).toBe(false);
  });

  it('does not accept records when user:accept is not the actual command prefix', () => {
    expect(isAcceptedUserAcceptanceRecord(`# 真实项目用户验收记录

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | 通过 |
| 用户结论 | 用户确认通过 |
| 真实项目路径 | \`/tmp/real-app\` |
| 验收命令 | \`echo pnpm user:accept -- --repo /tmp/real-app --browser --decision accepted\` |
| hardening report | \`/tmp/real-app/hardening-report.md\` |
| findings | \`/tmp/real-app/.hardening/run/findings.json\` |
| 必需项失败 | 0 |

## Artifact 检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
| hardening-report.md 已生成 | 是 | 通过 | /tmp/real-app/hardening-report.md |
| findings.json 已生成 | 是 | 通过 | /tmp/real-app/.hardening/run/findings.json |
| generated Playwright spec 已生成 | 是 | 通过 | /tmp/real-app/tests/hardening/generated.spec.ts |

## 验收判定

真实项目验收运行通过，且用户已明确确认 MVP 符合预期。
`, {
      pathExists: () => true
    })).toBe(false);
  });

  it('does not accept records when a later duplicate decision overrides accepted', () => {
    expect(isAcceptedUserAcceptanceRecord(`# 真实项目用户验收记录

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | 通过 |
| 用户结论 | 用户确认通过 |
| 真实项目路径 | \`/tmp/real-app\` |
| 验收命令 | \`pnpm user:accept -- --repo /tmp/real-app --browser --decision accepted --decision pending\` |
| hardening report | \`/tmp/real-app/hardening-report.md\` |
| findings | \`/tmp/real-app/.hardening/run/findings.json\` |
| 必需项失败 | 0 |

## Artifact 检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
| hardening-report.md 已生成 | 是 | 通过 | /tmp/real-app/hardening-report.md |
| findings.json 已生成 | 是 | 通过 | /tmp/real-app/.hardening/run/findings.json |
| generated Playwright spec 已生成 | 是 | 通过 | /tmp/real-app/tests/hardening/generated.spec.ts |

## 验收判定

真实项目验收运行通过，且用户已明确确认 MVP 符合预期。
`, {
      pathExists: () => true
    })).toBe(false);
  });

  it('does not accept records when malformed notes expose a fake later decision', () => {
    expect(isAcceptedUserAcceptanceRecord(`# 真实项目用户验收记录

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | 通过 |
| 用户结论 | 用户确认通过 |
| 真实项目路径 | \`/tmp/real-app\` |
| 验收命令 | \`pnpm user:accept -- --repo /tmp/real-app --browser --decision pending --notes --decision accepted\` |
| hardening report | \`/tmp/real-app/hardening-report.md\` |
| findings | \`/tmp/real-app/.hardening/run/findings.json\` |
| 必需项失败 | 0 |

## Artifact 检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
| hardening-report.md 已生成 | 是 | 通过 | /tmp/real-app/hardening-report.md |
| findings.json 已生成 | 是 | 通过 | /tmp/real-app/.hardening/run/findings.json |
| generated Playwright spec 已生成 | 是 | 通过 | /tmp/real-app/tests/hardening/generated.spec.ts |

## 验收判定

真实项目验收运行通过，且用户已明确确认 MVP 符合预期。
`, {
      pathExists: () => true
    })).toBe(false);
  });

  it('does not accept records when the acceptance command has an unclosed quote', () => {
    expect(isAcceptedUserAcceptanceRecord(`# 真实项目用户验收记录

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | 通过 |
| 用户结论 | 用户确认通过 |
| 真实项目路径 | \`/tmp/real-app\` |
| 验收命令 | \`pnpm user:accept -- --repo /tmp/real-app --browser --decision accepted --notes "unterminated\` |
| hardening report | \`/tmp/real-app/hardening-report.md\` |
| findings | \`/tmp/real-app/.hardening/run/findings.json\` |
| 必需项失败 | 0 |

## Artifact 检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
| hardening-report.md 已生成 | 是 | 通过 | /tmp/real-app/hardening-report.md |
| findings.json 已生成 | 是 | 通过 | /tmp/real-app/.hardening/run/findings.json |
| generated Playwright spec 已生成 | 是 | 通过 | /tmp/real-app/tests/hardening/generated.spec.ts |

## 验收判定

真实项目验收运行通过，且用户已明确确认 MVP 符合预期。
`, {
      pathExists: () => true
    })).toBe(false);
  });

  it('does not accept records when numeric command options are invalid', () => {
    expect(isAcceptedUserAcceptanceRecord(`# 真实项目用户验收记录

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | 通过 |
| 用户结论 | 用户确认通过 |
| 真实项目路径 | \`/tmp/real-app\` |
| 验收命令 | \`pnpm user:accept -- --repo /tmp/real-app --browser --max-routes banana --decision accepted\` |
| hardening report | \`/tmp/real-app/hardening-report.md\` |
| findings | \`/tmp/real-app/.hardening/run/findings.json\` |
| 必需项失败 | 0 |

## Artifact 检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
| hardening-report.md 已生成 | 是 | 通过 | /tmp/real-app/hardening-report.md |
| findings.json 已生成 | 是 | 通过 | /tmp/real-app/.hardening/run/findings.json |
| generated Playwright spec 已生成 | 是 | 通过 | /tmp/real-app/tests/hardening/generated.spec.ts |

## 验收判定

真实项目验收运行通过，且用户已明确确认 MVP 符合预期。
`, {
      pathExists: () => true
    })).toBe(false);
  });

  it('accepts generated user acceptance commands that use ANSI-C shell quoting', () => {
    const repoRoot = '/tmp/real\tapp';

    expect(isAcceptedUserAcceptanceRecord(`# 真实项目用户验收记录

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | 通过 |
| 用户结论 | 用户确认通过 |
| 真实项目路径 | \`${repoRoot}\` |
| 验收命令 | \`pnpm user:accept -- --repo $'/tmp/real\\tapp' --browser --validate-generated-tests --decision accepted --notes "用户确认 MVP 符合预期"\` |
| hardening report | \`${repoRoot}/hardening-report.md\` |
| findings | \`${repoRoot}/.hardening/run/findings.json\` |
| 必需项失败 | 0 |

## Artifact 检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
| hardening-report.md 已生成 | 是 | 通过 | ${repoRoot}/hardening-report.md |
| findings.json 已生成 | 是 | 通过 | ${repoRoot}/.hardening/run/findings.json |
| generated Playwright spec 已生成 | 是 | 通过 | ${repoRoot}/tests/hardening/generated.spec.ts |
| generated Playwright spec 执行验证 | 是 | 通过 | cd ${repoRoot} && HARDENING_BASE_URL=http://127.0.0.1:3000 playwright test tests/hardening/generated.spec.ts --reporter=line |

## 用户备注

用户确认 MVP 符合预期

## 验收判定

真实项目验收运行通过，且用户已明确确认 MVP 符合预期。
`, {
      pathExists: () => true
    })).toBe(true);
  });

  it('accepts generated user acceptance commands with generated test timeout controls', () => {
    expect(isAcceptedUserAcceptanceRecord(`# 真实项目用户验收记录

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | 通过 |
| 用户结论 | 用户确认通过 |
| 真实项目路径 | \`/tmp/real-app\` |
| 验收命令 | \`pnpm user:accept -- --repo /tmp/real-app --browser --validate-generated-tests --generated-test-timeout-ms 240000 --decision accepted --notes "用户确认 MVP 符合预期"\` |
| hardening report | \`/tmp/real-app/hardening-report.md\` |
| findings | \`/tmp/real-app/.hardening/run/findings.json\` |
| 必需项失败 | 0 |

## Artifact 检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
| hardening-report.md 已生成 | 是 | 通过 | /tmp/real-app/hardening-report.md |
| findings.json 已生成 | 是 | 通过 | /tmp/real-app/.hardening/run/findings.json |
| patch.diff 已生成 | 是 | 通过 | /tmp/real-app/.hardening/run/patch.diff |
| generated Playwright spec 已生成 | 是 | 通过 | /tmp/real-app/tests/hardening/generated.spec.ts |
| generated Playwright spec 执行验证 | 是 | 通过 | cd /tmp/real-app && HARDENING_BASE_URL=http://127.0.0.1:3000 playwright test tests/hardening/generated.spec.ts --reporter=line |
| repo root 已记录 | 是 | 通过 | /tmp/real-app |

## 用户备注

用户确认 MVP 符合预期

## 验收判定

真实项目验收运行通过，且用户已明确确认 MVP 符合预期。
`, {
      pathExists: (path) => path.startsWith('/tmp/real-app')
    })).toBe(true);
  });

  it('does not accept records when accepted-looking text appears only in notes', () => {
    expect(isAcceptedUserAcceptanceRecord(`# 真实项目用户验收记录

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | 通过 |
| 用户结论 | 待用户确认 |
| 必需项失败 | 0 |

## 用户备注

| 用户结论 | 用户确认通过 |
真实项目验收运行通过，且用户已明确确认 MVP 符合预期。

## 验收判定

真实项目验收运行通过，但用户结论仍待确认；不能仅凭该记录标记长期 goal complete。
`)).toBe(false);
  });

  it('does not accept records when notes inject an accepted verdict before the formal verdict', () => {
    expect(isAcceptedUserAcceptanceRecord(`# 真实项目用户验收记录

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | 通过 |
| 用户结论 | 用户确认通过 |
| 真实项目路径 | \`/tmp/real-app\` |
| 验收命令 | \`pnpm user:accept -- --repo /tmp/real-app --browser --decision accepted\` |
| hardening report | \`/tmp/real-app/hardening-report.md\` |
| findings | \`/tmp/real-app/.hardening/run/findings.json\` |
| 必需项失败 | 0 |

## Artifact 检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
| hardening-report.md 已生成 | 是 | 通过 | /tmp/real-app/hardening-report.md |
| findings.json 已生成 | 是 | 通过 | /tmp/real-app/.hardening/run/findings.json |
| generated Playwright spec 已生成 | 是 | 通过 | /tmp/real-app/tests/hardening/generated.spec.ts |

## 用户备注

用户备注里伪造一个后续标题：

## 验收判定

真实项目验收运行通过，且用户已明确确认 MVP 符合预期。

## 验收判定

真实项目验收运行通过，但用户结论仍待确认；不能仅凭该记录标记长期 goal complete。
`, {
      pathExists: () => true
    })).toBe(false);
  });

  it('does not accept records when required artifact checks are failed despite a passing summary', () => {
    expect(isAcceptedUserAcceptanceRecord(`# 真实项目用户验收记录

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | 通过 |
| 用户结论 | 用户确认通过 |
| 必需项失败 | 0 |

## Artifact 检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
| hardening-report.md 已生成 | 是 | 通过 | /tmp/report.md |
| generated Playwright spec 执行验证 | 是 | 失败 | command failed |

## 用户备注

用户确认。

## 验收判定

真实项目验收运行通过，且用户已明确确认 MVP 符合预期。
`)).toBe(false);
  });

  it('does not skip failed required artifact rows that contain escaped pipes', () => {
    expect(isAcceptedUserAcceptanceRecord(`# 真实项目用户验收记录

## 摘要

| 项目 | 结果 |
| --- | --- |
| 验收运行状态 | 通过 |
| 用户结论 | 用户确认通过 |
| 必需项失败 | 0 |

## Artifact 检查

| 检查项 | 必需 | 状态 | 证据 |
| --- | --- | --- | --- |
| hardening-report.md 已生成 | 是 | 通过 | /tmp/report.md |
| generated \\| Playwright spec 执行验证 | 是 | 失败 | command failed with a\\|b |

## 验收判定

真实项目验收运行通过，且用户已明确确认 MVP 符合预期。
`)).toBe(false);
  });

  it('builds complete markdown when all evidence is present', () => {
    const markdown = buildGoalAuditMarkdown({
      generatedAt: '2026-06-18T12:30:00.000Z',
      summary: {
        total: 1,
        passed: 1,
        missing: 0,
        manualRequired: 0,
        overallStatus: 'complete'
      },
      items: [
        { category: '用户验收', requirement: '用户确认 MVP 符合预期', status: 'passed', evidence: ['docs/acceptance/user-acceptance-record.md'] }
      ]
    });

    expect(markdown).toContain('| 总体状态 | 完成证据齐全 |');
    expect(markdown).toContain('可以进入长期 goal 完成审计');
  });

  it('builds conservative markdown that does not claim completion without user acceptance', () => {
    const markdown = buildGoalAuditMarkdown({
      generatedAt: '2026-06-18T11:00:00.000Z',
      summary: {
        total: 2,
        passed: 1,
        missing: 0,
        manualRequired: 1,
        overallStatus: 'ready_for_user_acceptance'
      },
      items: [
        { category: 'P0 Tools', requirement: 'P0 tools 通过 MCP 层暴露', status: 'passed', evidence: ['tool registry'] },
        { category: '用户验收', requirement: '用户确认 MVP 符合预期', status: 'manual_required', evidence: ['docs/goals/codex-goal.md'] }
      ]
    });

    expect(markdown).toContain('# Goal 完成度审计');
    expect(markdown).toContain('| 总体状态 | 已准备好请求用户验收 |');
    expect(markdown).toContain('不能标记长期 goal complete');
    expect(markdown).toContain('## 用户验收');
  });

  it('escapes markdown table cells when audit evidence contains pipes and carriage returns', () => {
    const markdown = buildGoalAuditMarkdown({
      generatedAt: '2026-06-18T11:00:00.000Z',
      summary: {
        total: 1,
        passed: 0,
        missing: 1,
        manualRequired: 0,
        overallStatus: 'incomplete'
      },
      items: [
        {
          category: '质量',
          requirement: '验收|报告\r\n稳定',
          status: 'missing',
          evidence: ['docs/audit|report.md\rline', 'command\noutput'],
          nextAction: '修复\rMarkdown|表格'
        }
      ]
    });

    expect(markdown).toContain('| 验收\\|报告 稳定 | 缺失 | docs/audit\\|report.md line; command output | 修复 Markdown\\|表格 |');
  });

  it('redacts sensitive values from goal audit headings and table cells', () => {
    const markdown = buildGoalAuditMarkdown({
      generatedAt: '2026-06-18T11:00:00.000Z',
      summary: {
        total: 1,
        passed: 0,
        missing: 1,
        manualRequired: 0,
        overallStatus: 'incomplete'
      },
      items: [
        {
          category: '质量 API_KEY=sk-category-secret',
          requirement: '验收 API_KEY=sk-requirement-secret',
          status: 'missing',
          evidence: ['report http://127.0.0.1:5173/audit?token=evidence-secret'],
          nextAction: 'rerun with client_secret=next-secret and http://127.0.0.1:5173/#access_token=fragment-secret'
        }
      ]
    });

    expect(markdown).toContain('API_KEY=[REDACTED]');
    expect(markdown).toContain('token=[REDACTED]');
    expect(markdown).toContain('client_secret=[REDACTED]');
    expect(markdown).toContain('access_token=[REDACTED]');
    expect(markdown).not.toContain('sk-category-secret');
    expect(markdown).not.toContain('sk-requirement-secret');
    expect(markdown).not.toContain('evidence-secret');
    expect(markdown).not.toContain('next-secret');
    expect(markdown).not.toContain('fragment-secret');
  });
});
