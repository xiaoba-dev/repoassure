import {
  acceptanceCompatibilityContract,
  acceptanceEntrypointFiles,
  acceptanceHelpText,
  formatAcceptanceCommand as formatAcceptanceRunnerCommand,
  isAcceptanceHelpRequest,
  isGoalAuditDirectRun,
  isRepairExecuteDirectRun,
  isRepairExecuteHelpRequest,
  isRepairHandoffDirectRun,
  isRepairHandoffHelpRequest,
  isRepairPatchPlanDirectRun,
  isRepairPatchPlanHelpRequest,
  isUserAcceptanceDirectRun,
  isUserAcceptanceHandoffDirectRun,
  LEGACY_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS,
  LEGACY_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS,
  LEGACY_ACCEPTANCE_WRAPPER_SOURCE_SPECS,
  legacyAcceptanceWrapperSourceEntries,
  parseAcceptanceArgs as parseAcceptanceArgsFromIndex,
  redactSensitiveText,
  resolveAcceptanceEntrypointUrl,
  runAcceptanceCli,
  runRepairExecute,
  runRepairHandoff,
  runRepairPatchPlan,
  shellQuoteArg
} from '../../packages/acceptance/src/index.js';
import { formatAcceptanceFatalError } from '../../packages/acceptance/src/fatal-error.js';
import { buildGoalAuditMarkdown, summarizeGoalAudit } from '../../packages/acceptance/src/goal-audit.js';
import { REQUIRED_DOCUMENT_PATHS, buildGoalAuditTextRequirement } from '../../packages/acceptance/src/goal-audit-requirements.js';
import { buildUserAcceptanceGoalRequirement } from '../../packages/acceptance/src/goal-audit-user-acceptance.js';
import { buildUserAcceptanceMaterialRequirements } from '../../packages/acceptance/src/goal-audit-user-acceptance-materials.js';
import { readGoalAuditTextSources } from '../../packages/acceptance/src/goal-audit-sources.js';
import { buildDeliveryAndP0GoalAuditItems } from '../../packages/acceptance/src/goal-audit-delivery.js';
import { buildRuntimeGoalAuditItems } from '../../packages/acceptance/src/goal-audit-runtime.js';
import { buildWorkflowAndArtifactGoalAuditItems } from '../../packages/acceptance/src/goal-audit-workflow-artifacts.js';
import { buildObservabilityAndSecurityGoalAuditItems } from '../../packages/acceptance/src/goal-audit-observability-security.js';
import { buildProcessGovernanceGoalAuditItems } from '../../packages/acceptance/src/goal-audit-process-governance.js';
import { buildEvidenceAndDocumentGoalAuditItems } from '../../packages/acceptance/src/goal-audit-evidence-documents.js';
import { buildCurrentGoalAuditItemsFromSources } from '../../packages/acceptance/src/goal-audit-current-items.js';
import { escapeMarkdownTableCell, formatMarkdownCodeCell } from '../../packages/acceptance/src/markdown.js';
import { parseArgs as parseAcceptanceArgs } from '../../packages/acceptance/src/run-acceptance.js';
import {
  REQUIRED_DOCUMENT_PATHS as RUNNER_REQUIRED_DOCUMENT_PATHS,
  buildCurrentGoalAuditItems,
  buildGoalAuditItemsFromWorkspace,
  classifyUserAcceptanceRecord as classifyGoalAuditRunnerUserAcceptanceRecord,
  isAcceptanceRunFreshEnough as isGoalAuditRunnerAcceptanceRunFreshEnough,
  isAcceptedUserAcceptanceRecord as isGoalAuditRunnerAcceptedUserAcceptanceRecord,
  runGoalAudit
} from '../../packages/acceptance/src/run-goal-audit.js';
import { buildPlaceholderRepoRootCheck, findRepoPathPlaceholder } from '../../packages/acceptance/src/repo-preflight.js';
import { buildAcceptanceMarkdown, summarizeAcceptanceChecks } from '../../packages/acceptance/src/report.js';
import { parseShellWords } from '../../packages/acceptance/src/shell-words.js';
import { formatUserAcceptanceCommand, parseUserAcceptanceArgs } from '../../packages/acceptance/src/user-acceptance-args.js';
import { buildUserAcceptanceMarkdown, summarizeUserAcceptanceChecks } from '../../packages/acceptance/src/user-acceptance.js';
import { shouldManageGeneratedTestBootSession } from '../../packages/acceptance/src/user-acceptance-runner-helpers.js';
import { isUserAcceptanceHelpRequest } from '../../packages/acceptance/src/run-user-acceptance.js';
import { buildUserAcceptanceHandoffMarkdown } from '../../packages/acceptance/src/user-acceptance-handoff.js';
import { isAcceptedUserAcceptanceRecord } from '../../packages/acceptance/src/user-acceptance-record.js';
import { parseUserAcceptanceHandoffArgs } from '../../packages/acceptance/src/run-user-acceptance-handoff.js';
import { parseRepairHandoffArgs } from '../../packages/acceptance/src/run-repair-handoff.js';
import { parseRepairExecuteArgs } from '../../packages/acceptance/src/run-repair-execute.js';
import { parseRepairPatchPlanArgs } from '../../packages/acceptance/src/run-repair-patch-plan.js';

describe('acceptance package', () => {
  it('declares compatibility entrypoints for existing acceptance runners', () => {
    expect(acceptanceCompatibilityContract.packageName).toBe('@hardening-mcp/acceptance');
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('compatibility');
    expect(acceptanceEntrypointFiles).toEqual({
      acceptance: 'run-acceptance.js',
      goalAudit: 'run-goal-audit.js',
      userAcceptance: 'run-user-acceptance.js',
      userHandoff: 'run-user-acceptance-handoff.js',
      repairHandoff: 'run-repair-handoff.js',
      repairExecute: 'run-repair-execute.js',
      repairPatchPlan: 'run-repair-patch-plan.js'
    });
  });

  it('preserves current generated acceptance output paths as compatibility outputs', () => {
    expect(acceptanceCompatibilityContract.outputPaths).toEqual({
      acceptanceRun: 'docs/acceptance/acceptance-run.md',
      goalCompletionAudit: 'docs/acceptance/goal-completion-audit.md',
      userAcceptanceHandoff: 'docs/acceptance/user-acceptance-handoff.md',
      userAcceptanceRecord: 'docs/acceptance/user-acceptance-record.md'
    });
  });

  it('resolves package runner calls to package-owned dist entrypoints', () => {
    const baseUrl = 'file:///repo/packages/acceptance/dist/index.js';

    expect(resolveAcceptanceEntrypointUrl('acceptance', baseUrl).href)
      .toBe('file:///repo/packages/acceptance/dist/run-acceptance.js');
    expect(resolveAcceptanceEntrypointUrl('goalAudit', baseUrl).href)
      .toBe('file:///repo/packages/acceptance/dist/run-goal-audit.js');
    expect(resolveAcceptanceEntrypointUrl('userAcceptance', baseUrl).href)
      .toBe('file:///repo/packages/acceptance/dist/run-user-acceptance.js');
    expect(resolveAcceptanceEntrypointUrl('userHandoff', baseUrl).href)
      .toBe('file:///repo/packages/acceptance/dist/run-user-acceptance-handoff.js');
    expect(resolveAcceptanceEntrypointUrl('repairHandoff', baseUrl).href)
      .toBe('file:///repo/packages/acceptance/dist/run-repair-handoff.js');
  });

  it('exports markdown helpers as the first package-owned implementation module', () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('markdown');
    expect(escapeMarkdownTableCell('alpha|beta\ngamma')).toBe('alpha\\|beta gamma');
    expect(formatMarkdownCodeCell('/tmp/report``path.md')).toBe('```/tmp/report``path.md```');
  });

  it('exports acceptance report helpers as package-owned implementation', () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('report');
    const summary = summarizeAcceptanceChecks([
      { name: 'Unit tests', category: '质量门禁', required: true, status: 'passed' }
    ]);

    expect(summary.status).toBe('passed');
    expect(buildAcceptanceMarkdown({
      generatedAt: '2026-06-20T00:00:00.000Z',
      mode: 'standard',
      outputPath: '/tmp/acceptance-run.md',
      summary,
      checks: [{ name: 'Unit tests', category: '质量门禁', required: true, status: 'passed' }]
    })).toContain('# MVP 验收运行报告');
  });

  it('exports goal audit helpers as package-owned implementation', () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('goal-audit');
    const summary = summarizeGoalAudit([
      { category: '质量', requirement: '质量门禁', status: 'passed', evidence: ['acceptance-run'] }
    ]);

    expect(summary.overallStatus).toBe('complete');
    expect(buildGoalAuditMarkdown({
      generatedAt: '2026-06-20T00:00:00.000Z',
      summary,
      items: [{ category: '质量', requirement: '质量门禁', status: 'passed', evidence: ['acceptance-run'] }]
    })).toContain('# Goal 完成度审计');
  });

  it('exports goal audit requirement helpers as package-owned implementation', () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('goal-audit-requirements');
    expect(buildGoalAuditTextRequirement({
      category: '质量',
      requirement: 'Marker',
      text: 'alpha beta',
      needles: ['alpha'],
      evidence: ['alpha found']
    })).toEqual(expect.objectContaining({
      status: 'passed'
    }));
  });

  it('exports goal audit user acceptance helpers as package-owned implementation', () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('goal-audit-user-acceptance');
    expect(buildUserAcceptanceGoalRequirement('pending_or_invalid')).toEqual(expect.objectContaining({
      category: '用户验收',
      requirement: '用户确认 MVP 符合预期',
      status: 'manual_required'
    }));
  });

  it('exports user acceptance material requirement helpers as package-owned implementation', () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('goal-audit-user-acceptance-materials');
    expect(buildUserAcceptanceMaterialRequirements({})).toHaveLength(7);
  });

  it('exports goal audit source collection helpers as package-owned implementation', async () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('goal-audit-sources');
    expect(legacyAcceptanceWrapperSourceEntries.map((entry) => entry.path)).toContain(
      'src/internal/acceptance/run-user-acceptance.ts'
    );
    expect(LEGACY_ACCEPTANCE_WRAPPER_SOURCE_SPECS.map((spec) => spec.path)).toContain(
      'src/internal/acceptance/run-user-acceptance.ts'
    );
    expect(LEGACY_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS.map((spec) => spec.path)).toContain(
      'dist/internal/acceptance/run-user-acceptance.js'
    );
    expect(LEGACY_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS.map((spec) => spec.path)).toContain(
      'dist/internal/acceptance/run-user-acceptance.d.ts'
    );
    await expect(readGoalAuditTextSources({
      root: '/repo',
      readText: async (path) => path
    })).resolves.toEqual(expect.objectContaining({
      packageJson: '/repo/package.json',
      legacyDistAcceptanceRunAcceptance: '/repo/dist/internal/acceptance/run-acceptance.js',
      legacyDistAcceptanceRunAcceptanceDeclaration: '/repo/dist/internal/acceptance/run-acceptance.d.ts',
      cliSmokeTests: expect.stringContaining('/repo/tests/integration/cli-run.test.ts')
    }));
  });

  it('exports delivery and P0 goal audit builders as package-owned implementation', async () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('goal-audit-delivery');
    await expect(buildDeliveryAndP0GoalAuditItems({
      sources: {},
      pathExists: async () => false
    })).resolves.toHaveLength(4);
  });

  it('exports MCP and CLI runtime goal audit builders as package-owned implementation', () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('goal-audit-runtime');
    expect(buildRuntimeGoalAuditItems({})).toHaveLength(2);
  });

  it('exports workflow and artifact goal audit builders as package-owned implementation', () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('goal-audit-workflow-artifacts');
    expect(buildWorkflowAndArtifactGoalAuditItems({})).toHaveLength(2);
  });

  it('exports observability and security goal audit builders as package-owned implementation', () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('goal-audit-observability-security');
    expect(buildObservabilityAndSecurityGoalAuditItems({})).toHaveLength(3);
  });

  it('exports process governance goal audit builders as package-owned implementation', () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('goal-audit-process-governance');
    expect(buildProcessGovernanceGoalAuditItems({})).toHaveLength(9);
  });

  it('exports evidence and document goal audit builders as package-owned implementation', async () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('goal-audit-evidence-documents');
    await expect(buildEvidenceAndDocumentGoalAuditItems({
      sources: {},
      pathExists: async () => false
    })).resolves.toHaveLength(2);
  });

  it('exports current goal audit item composer as package-owned implementation', async () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('goal-audit-current-items');
    await expect(buildCurrentGoalAuditItemsFromSources({
      sources: {},
      pathExists: async () => false,
      userAcceptanceStatus: 'pending_or_invalid'
    })).resolves.toHaveLength(31);
  });

  it('exports user acceptance helpers as package-owned implementation', () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('user-acceptance');
    const summary = summarizeUserAcceptanceChecks([
      { name: 'hardening-report.md 已生成', required: true, status: 'passed', evidence: 'hardening-report.md' }
    ]);

    expect(summary.runStatus).toBe('passed');
    expect(buildUserAcceptanceMarkdown({
      generatedAt: '2026-06-20T00:00:00.000Z',
      repoRoot: '/tmp/real-app',
      command: 'pnpm user:accept -- --repo /tmp/real-app --decision pending',
      decision: 'pending',
      notes: '',
      checks: [{ name: 'hardening-report.md 已生成', required: true, status: 'passed', evidence: 'hardening-report.md' }]
    })).toContain('# 真实项目用户验收记录');
  });

  it('exports user acceptance handoff helpers as package-owned implementation', () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('user-acceptance-handoff');

    expect(buildUserAcceptanceHandoffMarkdown({
      generatedAt: '2026-06-20T00:00:00.000Z',
      overallStatus: 'ready_for_user_acceptance',
      automaticPassed: 24,
      automaticMissing: 0,
      manualRequired: 1,
      goalAuditPath: 'docs/acceptance/goal-completion-audit.md',
      userAcceptanceRecordPath: 'docs/acceptance/user-acceptance-record.md',
      userAcceptanceGuidePath: 'docs/acceptance/guides/user-acceptance-guide.md',
      acceptanceChecklistPath: 'docs/acceptance/checklists/acceptance-checklist-v0.1.md'
    })).toContain('# 用户验收交接包');
  });

  it('exports fatal error formatting as package-owned implementation', () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('fatal-error');
    expect(formatAcceptanceFatalError('Acceptance runner failed', new Error('token=secret'))).toContain(
      'token=[REDACTED]'
    );
  });

  it('exports repo preflight helpers as package-owned implementation', () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('repo-preflight');
    expect(findRepoPathPlaceholder('/tmp/<real-web-app-repo>')).toBe('<real-web-app-repo>');
    expect(buildPlaceholderRepoRootCheck('/tmp/<real-web-app-repo>')).toEqual(expect.objectContaining({
      name: 'repo root 是有效目录',
      required: true,
      status: 'failed'
    }));
  });

  it('exports user acceptance args as package-owned implementation', () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('user-acceptance-args');
    const options = parseUserAcceptanceArgs(['--repo', '<real-web-app-repo>']);

    expect(formatUserAcceptanceCommand(options)).toContain('--repo <real-web-app-repo>');
  });

  it('owns the acceptance runner implementation in the package', () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('run-acceptance');
    expect(runAcceptanceCli).toEqual(expect.any(Function));
    expect(isAcceptanceHelpRequest(['--help'])).toBe(true);
    expect(acceptanceHelpText()).toContain('pnpm acceptance');
    expect(formatAcceptanceRunnerCommand({
      name: 'Example command',
      category: '质量门禁',
      required: true,
      command: 'pnpm',
      args: ['test:unit'],
      timeoutMs: 1000
    })).toBe('pnpm test:unit');
    expect(parseAcceptanceArgsFromIndex(['--', '--full', '--browser'])).toMatchObject({
      mode: 'full',
      browser: true
    });
    expect(parseAcceptanceArgs(['--', '--full', '--browser'])).toMatchObject({
      mode: 'full',
      browser: true
    });
  });

  it('owns the goal audit runner implementation in the package', () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('run-goal-audit');
    expect(runGoalAudit).toEqual(expect.any(Function));
    expect(isGoalAuditDirectRun('file:///tmp/Agent%20Tester/dist/internal/acceptance/run-goal-audit.js', '/tmp/Agent Tester/dist/internal/acceptance/run-goal-audit.js')).toBe(true);
    expect(buildCurrentGoalAuditItems).toEqual(expect.any(Function));
    expect(buildGoalAuditItemsFromWorkspace).toEqual(expect.any(Function));
    expect(classifyGoalAuditRunnerUserAcceptanceRecord).toEqual(expect.any(Function));
    expect(isGoalAuditRunnerAcceptanceRunFreshEnough).toEqual(expect.any(Function));
    expect(isGoalAuditRunnerAcceptedUserAcceptanceRecord).toEqual(expect.any(Function));
    expect(RUNNER_REQUIRED_DOCUMENT_PATHS).toEqual(REQUIRED_DOCUMENT_PATHS);
  });

  it('owns the user acceptance handoff runner implementation in the package', () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('run-user-acceptance-handoff');
    expect(isUserAcceptanceHandoffDirectRun('file:///tmp/Agent%20Tester/dist/internal/acceptance/run-user-acceptance-handoff.js', '/tmp/Agent Tester/dist/internal/acceptance/run-user-acceptance-handoff.js')).toBe(true);
    expect(parseUserAcceptanceHandoffArgs(['--', '--repo', 'fixtures/benchmark/vite-basic'])).toMatchObject({
      repoRoot: expect.stringContaining('fixtures/benchmark/vite-basic')
    });
  });

  it('owns the repair handoff runner implementation in the package', () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('run-repair-handoff');
    expect(isRepairHandoffDirectRun('file:///tmp/Agent%20Tester/packages/acceptance/dist/run-repair-handoff.js', '/tmp/Agent Tester/packages/acceptance/dist/run-repair-handoff.js')).toBe(true);
    expect(isRepairHandoffHelpRequest(['--help'])).toBe(true);
    expect(runRepairHandoff).toEqual(expect.any(Function));
    expect(parseRepairHandoffArgs(['--', '--run', 'fixtures/run'])).toMatchObject({
      runDir: expect.stringContaining('fixtures/run')
    });
  });

  it('owns the repair execute runner implementation in the package', () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('run-repair-execute');
    expect(isRepairExecuteDirectRun('file:///tmp/Agent%20Tester/packages/acceptance/dist/run-repair-execute.js', '/tmp/Agent Tester/packages/acceptance/dist/run-repair-execute.js')).toBe(true);
    expect(isRepairExecuteHelpRequest(['--help'])).toBe(true);
    expect(runRepairExecute).toEqual(expect.any(Function));
    expect(parseRepairExecuteArgs(['--', '--package', 'repair-handoff-package.json', '--task', 'pycli-failed-ruff-check', '--dry-run'])).toMatchObject({
      packagePath: expect.stringContaining('repair-handoff-package.json'),
      taskIds: ['pycli-failed-ruff-check'],
      dryRun: true
    });
  });

  it('owns the repair patch plan runner implementation in the package', () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('run-repair-patch-plan');
    expect(isRepairPatchPlanDirectRun('file:///tmp/Agent%20Tester/packages/acceptance/dist/run-repair-patch-plan.js', '/tmp/Agent Tester/packages/acceptance/dist/run-repair-patch-plan.js')).toBe(true);
    expect(isRepairPatchPlanHelpRequest(['--help'])).toBe(true);
    expect(runRepairPatchPlan).toEqual(expect.any(Function));
    expect(parseRepairPatchPlanArgs(['--', '--report', 'repair-execution-report.json'])).toMatchObject({
      reportPath: expect.stringContaining('repair-execution-report.json')
    });
  });

  it('exports redaction, shell quote, shell words, and user acceptance record helpers as package-owned implementations', () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('redaction');
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('shell-quote');
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('shell-words');
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('user-acceptance-record');
    expect(redactSensitiveText('OPENAI_API_KEY=sk-live-secret')).toBe('OPENAI_API_KEY=[REDACTED]');
    expect(shellQuoteArg('tests with spaces/hardening')).toBe("'tests with spaces/hardening'");
    expect(parseShellWords("pnpm user:accept -- --repo '/tmp/real app'")).toEqual([
      'pnpm',
      'user:accept',
      '--',
      '--repo',
      '/tmp/real app'
    ]);
    expect(isAcceptedUserAcceptanceRecord('# 真实项目用户验收记录')).toBe(false);
  });

  it('exports user acceptance runner helpers as package-owned implementation', () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('user-acceptance-runner-helpers');
    expect(shouldManageGeneratedTestBootSession({
      validateGeneratedTests: true
    })).toBe(true);
  });

  it('owns the user acceptance runner implementation in the package', () => {
    expect(acceptanceCompatibilityContract.packageOwnedModules).toContain('run-user-acceptance');
    expect(isUserAcceptanceDirectRun('file:///tmp/Agent%20Tester/dist/internal/acceptance/run-user-acceptance.js', '/tmp/Agent Tester/dist/internal/acceptance/run-user-acceptance.js')).toBe(true);
    expect(isUserAcceptanceHelpRequest(['--help'])).toBe(true);
  });
});
