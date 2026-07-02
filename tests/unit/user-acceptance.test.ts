import { chmod, mkdir, mkdtemp, readdir, readFile, readlink, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  buildUserAcceptanceMarkdown as buildLegacyUserAcceptanceMarkdown,
  summarizeUserAcceptanceChecks as summarizeLegacyUserAcceptanceChecks
} from '../../src/internal/acceptance/user-acceptance.js';
import {
  buildUserAcceptanceMarkdown,
  summarizeUserAcceptanceChecks,
  type UserAcceptanceCheck
} from '../../packages/acceptance/src/user-acceptance.js';
import {
  formatUserAcceptanceCommand as formatLegacyUserAcceptanceCommand,
  parseUserAcceptanceArgs as parseLegacyUserAcceptanceArgs
} from '../../src/internal/acceptance/user-acceptance-args.js';
import {
  formatUserAcceptanceCommand,
  parseUserAcceptanceArgs
} from '../../packages/acceptance/src/user-acceptance-args.js';
import {
  parseShellWords
} from '../../packages/acceptance/src/shell-words.js';
import {
  buildGeneratedTestValidationCheck as buildLegacyGeneratedTestValidationCheck,
  formatGeneratedTestValidationCommand as formatLegacyGeneratedTestValidationCommand,
  shouldManageGeneratedTestBootSession as shouldLegacyManageGeneratedTestBootSession
} from '../../src/internal/acceptance/run-user-acceptance.js';
import {
  main,
  runUserAcceptance
} from '../../packages/acceptance/src/run-user-acceptance.js';
import {
  buildGeneratedTestValidationCheck,
  buildUserAcceptanceRepoPreflightChecks,
  ensureGeneratedTestPlaywrightDependency,
  formatGeneratedTestValidationFailureEvidence,
  formatGeneratedTestValidationEvidenceCommand,
  formatGeneratedTestValidationCommand,
  selectGeneratedTestValidationBaseUrl,
  shouldManageGeneratedTestBootSession,
  writeUserAcceptanceRecord
} from '../../packages/acceptance/src/user-acceptance-runner-helpers.js';

describe('user acceptance record', () => {
  it('summarizes required artifact checks', () => {
    const checks: UserAcceptanceCheck[] = [
      { name: 'report', required: true, status: 'passed', evidence: 'hardening-report.md' },
      { name: 'browser artifacts', required: true, status: 'failed', evidence: 'no artifacts' },
      { name: 'optional note', required: false, status: 'skipped', evidence: 'not requested' }
    ];

    expect(summarizeUserAcceptanceChecks(checks)).toEqual({
      total: 3,
      passed: 1,
      failed: 1,
      skipped: 1,
      requiredFailed: 1,
      runStatus: 'failed'
    });
  });

  it('keeps package-owned user acceptance output compatible with the legacy implementation', () => {
    const record = {
      generatedAt: '2026-06-20T00:00:00.000Z',
      repoRoot: '/workspace/<real-web-app-repo>',
      command: 'pnpm user:accept -- --repo <real-web-app-repo> --url http://127.0.0.1:5173/callback?token=command-secret --decision pending',
      decision: 'pending' as const,
      notes: 'reviewed with API_KEY=sk-user-acceptance-secret\n## fake heading',
      reportPath: '/tmp/report.md?access_token=report-secret',
      findingsPath: '/tmp/findings.json#token=findings-secret',
      checks: [
        {
          name: 'artifact|check',
          required: true,
          status: 'failed' as const,
          evidence: 'failed with client_secret=evidence-secret'
        }
      ]
    };

    expect(summarizeUserAcceptanceChecks(record.checks)).toEqual(summarizeLegacyUserAcceptanceChecks(record.checks));
    expect(buildUserAcceptanceMarkdown(record)).toBe(buildLegacyUserAcceptanceMarkdown(record));
    expect(buildUserAcceptanceMarkdown(record)).not.toContain('sk-user-acceptance-secret');
    expect(buildUserAcceptanceMarkdown(record)).not.toContain('command-secret');
    expect(buildUserAcceptanceMarkdown(record)).not.toContain('report-secret');
    expect(buildUserAcceptanceMarkdown(record)).not.toContain('findings-secret');
    expect(buildUserAcceptanceMarkdown(record)).not.toContain('evidence-secret');
  });

  it('keeps acceptance pending when user has not confirmed the result', () => {
    const markdown = buildUserAcceptanceMarkdown({
      generatedAt: '2026-06-18T12:00:00.000Z',
      repoRoot: '/tmp/real-app',
      command: 'pnpm user:accept -- --repo /tmp/real-app --browser',
      decision: 'pending',
      notes: '',
      readinessScore: 85,
      issueCounts: { P0: 0, P1: 1, P2: 0 },
      reportPath: '/tmp/real-app/hardening-report.md',
      findingsPath: '/tmp/real-app/.hardening/run/findings.json',
      checks: [
        { name: 'hardening-report.md 已生成', required: true, status: 'passed', evidence: '/tmp/real-app/hardening-report.md' },
        { name: 'generated Playwright spec 执行验证', required: false, status: 'skipped', evidence: 'not requested' }
      ]
    });

    expect(markdown).toContain('# 真实项目用户验收记录');
    expect(markdown).toContain('| 用户结论 | 待用户确认 |');
    expect(markdown).toContain('不能仅凭该记录标记长期 goal complete');
  });

  it('renders next steps for pending acceptance records', () => {
    const markdown = buildUserAcceptanceMarkdown({
      generatedAt: '2026-06-18T12:00:00.000Z',
      repoRoot: '/tmp/real-app',
      command: 'pnpm user:accept -- --repo /tmp/real-app --browser --decision pending',
      decision: 'pending',
      notes: '',
      checks: [
        { name: 'hardening-report.md 已生成', required: true, status: 'passed', evidence: '/tmp/real-app/hardening-report.md' }
      ]
    });

    expect(markdown).toContain('## 下一步');
    expect(markdown).toContain('用户需要将结论更新为 `accepted` 或 `changes_requested`');
    expect(markdown).toContain('pnpm user:accept -- --repo <repo> --browser --validate-generated-tests --decision accepted --notes "用户确认 MVP 符合预期"');
  });

  it('renders the acceptance mode in the summary', () => {
    const markdown = buildUserAcceptanceMarkdown({
      generatedAt: '2026-06-18T12:00:00.000Z',
      repoRoot: '/tmp/python-cli',
      mode: 'cli',
      command: 'pnpm user:accept -- --mode cli --repo /tmp/python-cli --decision pending',
      decision: 'pending',
      notes: '',
      checks: [
        { name: 'python-cli-profile.json 已生成', required: true, status: 'passed', evidence: '/tmp/python-cli/.hardening/run/python-cli-profile.json' }
      ]
    });

    expect(markdown).toContain('| 验收模式 | cli |');
    expect(markdown).toContain('pnpm user:accept -- --repo <repo> --mode cli --decision accepted --notes "用户确认 Python CLI 验收符合预期"');
    expect(markdown).not.toContain('--browser --validate-generated-tests --decision accepted');
  });

  it('renders next steps for accepted acceptance records', () => {
    const markdown = buildUserAcceptanceMarkdown({
      generatedAt: '2026-06-18T12:00:00.000Z',
      repoRoot: '/tmp/real-app',
      command: 'pnpm user:accept -- --repo /tmp/real-app --browser --decision accepted',
      decision: 'accepted',
      notes: '用户确认 MVP 符合预期',
      checks: [
        { name: 'hardening-report.md 已生成', required: true, status: 'passed', evidence: '/tmp/real-app/hardening-report.md' }
      ]
    });

    expect(markdown).toContain('## 下一步');
    expect(markdown).toContain('pnpm goal:audit');
    expect(markdown).toContain('确认 `docs/acceptance/goal-completion-audit.md` 中的用户验收项已通过');
  });

  it('renders next steps for changes_requested acceptance records', () => {
    const markdown = buildUserAcceptanceMarkdown({
      generatedAt: '2026-06-18T12:00:00.000Z',
      repoRoot: '/tmp/real-app',
      command: 'pnpm user:accept -- --repo /tmp/real-app --browser --decision changes_requested',
      decision: 'changes_requested',
      notes: '补齐登录态探索并降低误报',
      checks: [
        { name: 'hardening-report.md 已生成', required: true, status: 'passed', evidence: '/tmp/real-app/hardening-report.md' }
      ]
    });

    expect(markdown).toContain('## 下一步');
    expect(markdown).toContain('把用户备注中的具体修改项写入 `docs/logs/dev-log.md` 或 `docs/logs/blockers.md`');
    expect(markdown).toContain('修复后重新运行真实项目验收');
  });

  it('renders next steps for failed acceptance records', () => {
    const markdown = buildUserAcceptanceMarkdown({
      generatedAt: '2026-06-18T12:00:00.000Z',
      repoRoot: '/tmp/real-app',
      command: 'pnpm user:accept -- --repo /tmp/real-app --browser --decision pending',
      decision: 'pending',
      notes: '',
      checks: [
        { name: 'hardening-report.md 已生成', required: true, status: 'failed', evidence: 'missing report' }
      ]
    });

    expect(markdown).toContain('## 下一步');
    expect(markdown).toContain('先修复上方必需项失败');
    expect(markdown).toContain('重新运行 `pnpm user:accept`');
    expect(markdown).toContain('用户需要将结论更新为 `accepted` 或 `changes_requested`');
    expect(markdown).toContain('不能仅凭该记录标记长期 goal complete');
  });

  it('documents either the placeholder changes_requested path or the final accepted record', async () => {
    const record = await readFile('docs/acceptance/user-acceptance-record.md', 'utf8');

    if (record.includes('| 用户结论 | 用户确认通过 |')) {
      expect(record).toContain('--decision accepted');
      expect(record).toContain('用户确认 MVP 符合预期');
      return;
    }

    if (record.includes('| 用户结论 | 待用户确认 |')) {
      expect(record).toContain('--decision pending');
      expect(record).toContain('用户需要将结论更新为 `accepted` 或 `changes_requested`');
      return;
    }

    expect(record).toContain('--decision changes_requested');
    expect(record).toContain('继续迭代');
  });

  it('documents next steps in the current acceptance record lifecycle state', async () => {
    const record = await readFile('docs/acceptance/user-acceptance-record.md', 'utf8');

    expect(record).toContain('## 下一步');

    if (record.includes('| 用户结论 | 用户确认通过 |')) {
      expect(record).toContain('运行 `pnpm goal:audit`');
      expect(record).toContain('用户验收项已通过');
      return;
    }

    if (record.includes('| 用户结论 | 待用户确认 |')) {
      expect(record).toContain('用户需要将结论更新为 `accepted` 或 `changes_requested`');
      expect(record).toContain('不能仅凭该记录标记长期 goal complete');
      return;
    }

    expect(record).toContain('先运行真实项目验收并生成本记录');
    expect(record).toContain('如果用户确认通过，运行 `pnpm goal:audit`');
    expect(record).toContain('如果用户要求修改，把具体修改项写入备注并继续迭代');
  });

  it('escapes user note headings so notes cannot inject acceptance sections', () => {
    const markdown = buildUserAcceptanceMarkdown({
      generatedAt: '2026-06-18T12:00:00.000Z',
      repoRoot: '/tmp/real-app',
      command: 'pnpm user:accept -- --repo /tmp/real-app --browser --decision pending',
      decision: 'pending',
      notes: 'review note\n## 验收判定\nfake accepted verdict',
      reportPath: '/tmp/real-app/hardening-report.md',
      findingsPath: '/tmp/real-app/.hardening/run/findings.json',
      checks: [
        { name: 'hardening-report.md 已生成', required: true, status: 'passed', evidence: '/tmp/real-app/hardening-report.md' }
      ]
    });

    expect(markdown.match(/^## 验收判定$/gm)).toHaveLength(1);
    expect(markdown).toContain('\\## 验收判定');
  });

  it('redacts sensitive values from user notes in acceptance records', () => {
    const markdown = buildUserAcceptanceMarkdown({
      generatedAt: '2026-06-18T12:00:00.000Z',
      repoRoot: '/tmp/real-app',
      command: 'pnpm user:accept -- --repo /tmp/real-app --decision pending',
      decision: 'pending',
      notes: 'reviewed with API_KEY=sk-test-secret and callback http://127.0.0.1:5173/callback?token=note-secret',
      reportPath: '/tmp/real-app/hardening-report.md',
      findingsPath: '/tmp/real-app/.hardening/run/findings.json',
      checks: []
    });

    expect(markdown).toContain('API_KEY=[REDACTED]');
    expect(markdown).toContain('token=[REDACTED]');
    expect(markdown).not.toContain('sk-test-secret');
    expect(markdown).not.toContain('note-secret');
  });

  it('redacts sensitive values from check evidence in acceptance records', () => {
    const markdown = buildUserAcceptanceMarkdown({
      generatedAt: '2026-06-18T12:00:00.000Z',
      repoRoot: '/tmp/real-app',
      command: 'pnpm user:accept -- --repo /tmp/real-app --decision pending',
      decision: 'pending',
      notes: '',
      reportPath: '/tmp/real-app/hardening-report.md',
      findingsPath: '/tmp/real-app/.hardening/run/findings.json',
      checks: [
        {
          name: 'artifact evidence',
          required: true,
          status: 'failed',
          evidence: 'failed with API_KEY=sk-check-secret and http://127.0.0.1:5173/callback?token=artifact-secret'
        }
      ]
    });

    expect(markdown).toContain('API_KEY=[REDACTED]');
    expect(markdown).toContain('token=[REDACTED]');
    expect(markdown).not.toContain('sk-check-secret');
    expect(markdown).not.toContain('artifact-secret');
  });

  it('writes target repo feedback summary during browser user acceptance runs', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'repoassure-user-acceptance-feedback-'));
    const outputPath = join(repoRoot, 'acceptance-record.md');
    const runDir = join(repoRoot, '.hardening', 'runs', 'run-2026-07-02T00-00-00-000Z');
    const manifestPath = join(runDir, 'manifest.json');
    const reportPath = join(repoRoot, 'hardening-report.md');
    const findingsPath = join(runDir, 'findings.json');
    const repairPlanPath = join(runDir, 'repair-plan.json');
    const repairPlanMarkdownPath = join(runDir, 'repair-plan.md');
    const repairTaskPackagePath = join(runDir, 'repair-task-package.json');
    const repairTaskPackageMarkdownPath = join(runDir, 'repair-task-package.md');
    const patchDiffPath = join(runDir, 'patch.diff');
    const generatedTestPath = join(repoRoot, 'tests', 'generated.spec.ts');
    const screenshotPath = join(runDir, 'home.png');
    await mkdir(join(repoRoot, 'tests'), { recursive: true });
    await mkdir(runDir, { recursive: true });
    await writeFile(join(repoRoot, 'package.json'), '{"scripts":{"dev":"vite"}}\n');
    await Promise.all([
      writeFile(manifestPath, '{"schemaVersion":1,"artifacts":{}}\n'),
      writeFile(reportPath, '# Report\n'),
      writeFile(findingsPath, '{"findings":[]}\n'),
      writeFile(repairPlanPath, '{"tasks":[]}\n'),
      writeFile(repairPlanMarkdownPath, '# Repair Plan\n'),
      writeFile(repairTaskPackagePath, '{"tasks":[]}\n'),
      writeFile(repairTaskPackageMarkdownPath, '# Repair Task Package\n'),
      writeFile(patchDiffPath, ''),
      writeFile(generatedTestPath, 'import { test } from "@playwright/test";\n'),
      writeFile(screenshotPath, 'png')
    ]);

    const exitCode = await runUserAcceptance({
      repoRoot,
      mode: 'browser',
      browser: true,
      trace: false,
      validateGeneratedTests: false,
      criticalPaths: [],
      decision: 'pending',
      notes: '',
      outputPath
    }, {
      createBrowserDriver: async () => ({
        close: async () => {}
      }),
      runBootApp: async () => ({
        url: 'http://127.0.0.1:5173',
        stop: async () => {}
      }),
      runHardening: async () => ({
        reportPath,
        findingsPath,
        artifactBundle: { manifestPath },
        repairPlan: {
          repairPlanPath,
          repairPlanMarkdownPath,
          repairTaskPackagePath,
          repairTaskPackageMarkdownPath
        },
        testGeneration: { createdFiles: [generatedTestPath] },
        explore: { artifactFiles: [screenshotPath] },
        report: {
          readinessScore: 92,
          issueCounts: { P0: 0, P1: 0, P2: 1 },
          patchDiffPath
        }
      })
    });

    const summaryPath = join(runDir, 'target-repo-feedback-summary.json');
    const handoffPackagePath = join(runDir, 'ai-ide-handoff-package.json');
    const summary = JSON.parse(await readFile(summaryPath, 'utf8')) as {
      runStatus: string;
      targetRepoMetadataClass: string;
      artifactLinks: { report: string; screenshots: string[] };
    };
    const handoffPackage = JSON.parse(await readFile(handoffPackagePath, 'utf8')) as {
      schemaVersion: string;
      recommendedReadingOrder: Array<{ artifactKind: string; path: string }>;
      sourceSummary: { targetRepoFeedbackSummary: string };
    };
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as {
      artifacts: {
        aiIdeHandoffPackagePath?: string;
        targetRepoFeedbackSummaryPath?: string;
      };
    };
    const markdown = await readFile(outputPath, 'utf8');

    expect(exitCode).toBe(0);
    expect(summary.runStatus).toBe('passed');
    expect(summary.targetRepoMetadataClass).toBe('private_repo_redacted');
    expect(summary.artifactLinks.report).toBe('../../../hardening-report.md');
    expect(summary.artifactLinks.screenshots).toEqual(['home.png']);
    expect(handoffPackage.schemaVersion).toBe('repoassure.ai-ide-handoff-package.v1');
    expect(handoffPackage.recommendedReadingOrder[0]).toMatchObject({
      artifactKind: 'target_repo_feedback_summary',
      path: 'target-repo-feedback-summary.json'
    });
    expect(handoffPackage.sourceSummary.targetRepoFeedbackSummary).toBe('target-repo-feedback-summary.json');
    expect(manifest.artifacts.targetRepoFeedbackSummaryPath).toBe(summaryPath);
    expect(manifest.artifacts.aiIdeHandoffPackagePath).toBe(handoffPackagePath);
    expect(markdown).toContain('target-repo-feedback-summary.json 已生成');
    expect(markdown).toContain('ai-ide-handoff-package.json 已生成');
    expect(markdown).toContain(summaryPath);
    expect(markdown).toContain(handoffPackagePath);
  });

  it('escapes summary table cells in user acceptance records', () => {
    const markdown = buildUserAcceptanceMarkdown({
      generatedAt: '2026-06-18T12:00:00.000Z',
      repoRoot: '/tmp/real|app\ncopy',
      command: 'pnpm user:accept -- --repo /tmp/real|app\r\ncopy',
      decision: 'pending',
      notes: '',
      readinessScore: 100,
      issueCounts: { P0: 0, P1: 0, P2: 0 },
      reportPath: '/tmp/real|app/hardening-report.md',
      findingsPath: '/tmp/real|app/.hardening/run/findings.json',
      checks: []
    });

    expect(markdown).toContain('| 真实项目路径 | `/tmp/real\\|app copy` |');
    expect(markdown).toContain('| 验收命令 | `pnpm user:accept -- --repo /tmp/real\\|app copy` |');
    expect(markdown).toContain('| hardening report | `/tmp/real\\|app/hardening-report.md` |');
    expect(markdown).toContain('| findings | `/tmp/real\\|app/.hardening/run/findings.json` |');
  });

  it('redacts sensitive URL parameters from the displayed acceptance command', () => {
    const command = 'pnpm user:accept -- --repo /tmp/real-app --url http://127.0.0.1:5173/callback?code=oauth-secret&tab=profile#access_token=fragment-secret --decision pending';
    const markdown = buildUserAcceptanceMarkdown({
      generatedAt: '2026-06-18T12:00:00.000Z',
      repoRoot: '/tmp/real-app',
      command,
      decision: 'pending',
      notes: '',
      reportPath: '/tmp/real-app/hardening-report.md',
      findingsPath: '/tmp/real-app/.hardening/run/findings.json',
      checks: []
    });

    expect(command).toContain('oauth-secret');
    expect(command).toContain('fragment-secret');
    expect(markdown).toContain('code=[REDACTED]');
    expect(markdown).toContain('access_token=[REDACTED]');
    expect(markdown).not.toContain('oauth-secret');
    expect(markdown).not.toContain('fragment-secret');
  });

  it('redacts sensitive values from summary paths in acceptance records', () => {
    const markdown = buildUserAcceptanceMarkdown({
      generatedAt: '2026-06-18T12:00:00.000Z',
      repoRoot: '/tmp/real-app-API_KEY=sk-path-secret',
      command: 'pnpm user:accept -- --repo /tmp/real-app --decision pending',
      decision: 'pending',
      notes: '',
      reportPath: '/tmp/real-app/hardening-report.md?token=report-secret',
      findingsPath: '/tmp/real-app/.hardening/run/findings.json#access_token=findings-secret',
      checks: []
    });

    expect(markdown).toContain('API_KEY=[REDACTED]');
    expect(markdown).toContain('token=[REDACTED]');
    expect(markdown).toContain('access_token=[REDACTED]');
    expect(markdown).not.toContain('sk-path-secret');
    expect(markdown).not.toContain('report-secret');
    expect(markdown).not.toContain('findings-secret');
  });

  it('uses longer markdown code spans when summary values contain backticks', () => {
    const markdown = buildUserAcceptanceMarkdown({
      generatedAt: '2026-06-18T12:00:00.000Z',
      repoRoot: '/tmp/real`app',
      command: 'pnpm user:accept -- --repo /tmp/real`app',
      decision: 'pending',
      notes: '',
      reportPath: '/tmp/report``path.md',
      findingsPath: '/tmp/findings.json',
      checks: []
    });

    expect(markdown).toContain('| 真实项目路径 | ``/tmp/real`app`` |');
    expect(markdown).toContain('| 验收命令 | ``pnpm user:accept -- --repo /tmp/real`app`` |');
    expect(markdown).toContain('| hardening report | ```/tmp/report``path.md``` |');
  });

  it('pads markdown code spans when summary values start or end with backticks', () => {
    const markdown = buildUserAcceptanceMarkdown({
      generatedAt: '2026-06-18T12:00:00.000Z',
      repoRoot: '`/tmp/real-app`',
      command: 'pnpm user:accept -- --repo `/tmp/real-app`',
      decision: 'pending',
      notes: '',
      reportPath: '`/tmp/report.md',
      findingsPath: '/tmp/findings.json`',
      checks: []
    });

    expect(markdown).toContain('| 真实项目路径 | `` `/tmp/real-app` `` |');
    expect(markdown).toContain('| 验收命令 | `` pnpm user:accept -- --repo `/tmp/real-app` `` |');
    expect(markdown).toContain('| hardening report | `` `/tmp/report.md `` |');
    expect(markdown).toContain('| findings | `` /tmp/findings.json` `` |');
  });

  it('keeps placeholder repo paths as placeholders in summary display', () => {
    const markdown = buildUserAcceptanceMarkdown({
      generatedAt: '2026-06-18T12:00:00.000Z',
      repoRoot: '/workspace/<real-web-app-repo>',
      command: 'pnpm user:accept -- --repo <real-web-app-repo> --decision pending',
      decision: 'pending',
      notes: '',
      checks: [
        {
          name: 'repo root 是有效目录',
          required: true,
          status: 'failed',
          evidence: 'replace <real-web-app-repo> with the real Web App repo path'
        }
      ]
    });

    expect(markdown).toContain('| 真实项目路径 | `<real-web-app-repo>` |');
    expect(markdown).not.toContain('| 真实项目路径 | `/workspace/<real-web-app-repo>` |');
  });

  it('parses pnpm-forwarded real project acceptance arguments', () => {
    const options = parseUserAcceptanceArgs([
      '--',
      '--repo',
      'fixtures/benchmark/vite-basic',
      '--url=http://127.0.0.1:5173',
      '--browser',
      '--trace',
      '--validate-generated-tests',
      '--critical-path',
      '/login',
      '--max-routes=8',
      '--max-actions-per-route',
      '0',
      '--generated-test-timeout-ms',
      '240000',
      '--decision',
      'changes_requested',
      '--notes',
      '需要改进登录流'
    ]);

    expect(options).toMatchObject({
      mode: 'browser',
      browser: true,
      trace: true,
      validateGeneratedTests: true,
      url: 'http://127.0.0.1:5173',
      criticalPaths: ['/login'],
      maxRoutes: 8,
      maxActionsPerRoute: 0,
      generatedTestTimeoutMs: 240000,
      decision: 'changes_requested',
      notes: '需要改进登录流'
    });
    expect(options.repoRoot).toContain('fixtures/benchmark/vite-basic');
  });

  it('parses explicit Python CLI acceptance mode without changing browser defaults', () => {
    const defaultOptions = parseUserAcceptanceArgs([
      '--repo',
      'fixtures/benchmark/vite-basic'
    ]);
    const cliOptions = parseUserAcceptanceArgs([
      '--repo',
      'fixtures/python-cli-basic',
      '--mode',
      'cli'
    ]);

    expect(defaultOptions.mode).toBe('browser');
    expect(cliOptions.mode).toBe('cli');
    expect(formatUserAcceptanceCommand(cliOptions)).toContain('--mode cli');
  });

  it('rejects unknown user acceptance modes', () => {
    expect(() => parseUserAcceptanceArgs([
      '--repo',
      'fixtures/python-cli-basic',
      '--mode',
      'mobile'
    ])).toThrow('--mode must be browser or cli');
  });

  it('keeps package-owned user acceptance args compatible with the legacy implementation', () => {
    const args = [
      '--',
      '--repo',
      '<real-web-app-repo>',
      '--url',
      ' http://127.0.0.1:5173 ',
      '--browser',
      '--trace',
      '--validate-generated-tests',
      '--critical-path',
      'login, create a project',
      '--max-routes=8',
      '--max-actions-per-route',
      '0',
      '--start-command',
      'pnpm dev --host 127.0.0.1',
      '--boot-timeout-ms',
      '120000',
      '--storage-state',
      'playwright/.auth/user.json',
      '--output',
      'artifacts/acceptance/user record.md',
      '--generated-test-timeout-ms',
      '240000',
      '--decision',
      'changes_requested',
      '--notes',
      '补齐登录态探索并降低误报'
    ];

    const packageOptions = parseUserAcceptanceArgs(args);
    const legacyOptions = parseLegacyUserAcceptanceArgs(args);

    expect(packageOptions).toMatchObject(legacyOptions);
    expect(packageOptions.mode).toBe('browser');
    expect(formatUserAcceptanceCommand(packageOptions)).toBe(formatLegacyUserAcceptanceCommand(legacyOptions));
  });

  it('keeps package-owned user acceptance runner helpers compatible with the legacy implementation', async () => {
    await expect(buildGeneratedTestValidationCheck({
      repoRoot: '/tmp/real-app',
      generatedTestFiles: ['/tmp/real-app/tests/hardening/generated-findings.spec.ts'],
      enabled: false
    })).resolves.toEqual(await buildLegacyGeneratedTestValidationCheck({
      repoRoot: '/tmp/real-app',
      generatedTestFiles: ['/tmp/real-app/tests/hardening/generated-findings.spec.ts'],
      enabled: false
    }));
    expect(formatGeneratedTestValidationCommand({
      baseUrl: 'http://127.0.0.1:5173',
      nodePath: '/tmp/Agent Tester/node_modules',
      playwrightPath: '/tmp/Agent Tester/node_modules/.bin/playwright',
      repoRoot: '/tmp/Real App',
      relativeTestFiles: ['tests/hardening/generated findings.spec.ts']
    })).toBe(formatLegacyGeneratedTestValidationCommand({
      baseUrl: 'http://127.0.0.1:5173',
      nodePath: '/tmp/Agent Tester/node_modules',
      playwrightPath: '/tmp/Agent Tester/node_modules/.bin/playwright',
      repoRoot: '/tmp/Real App',
      relativeTestFiles: ['tests/hardening/generated findings.spec.ts']
    }));
    expect(shouldManageGeneratedTestBootSession({
      validateGeneratedTests: true
    })).toBe(shouldLegacyManageGeneratedTestBootSession({
      validateGeneratedTests: true
    }));
  });

  it('trims surrounding whitespace from user acceptance option values', () => {
    const options = parseUserAcceptanceArgs([
      '--repo',
      ' fixtures/benchmark/vite-basic ',
      '--url',
      ' http://127.0.0.1:5173 ',
      '--validate-generated-tests',
      '--decision',
      ' accepted ',
      '--critical-path',
      ' /login ',
      '--notes',
      ' user accepted '
    ]);

    expect(options.repoRoot).toContain('fixtures/benchmark/vite-basic');
    expect(options.repoRoot.endsWith(' ')).toBe(false);
    expect(options.url).toBe('http://127.0.0.1:5173');
    expect(options.decision).toBe('accepted');
    expect(options.criticalPaths).toEqual(['/login']);
    expect(options.notes).toBe('user accepted');
  });

  it('requires concrete notes when the user requests changes', () => {
    expect(() => parseUserAcceptanceArgs([
      '--repo',
      'fixtures/benchmark/vite-basic',
      '--decision',
      'changes_requested'
    ])).toThrow('--notes with concrete change details is required when --decision changes_requested');

    expect(() => parseUserAcceptanceArgs([
      '--repo',
      'fixtures/benchmark/vite-basic',
      '--decision',
      'changes_requested',
      '--notes',
      '<具体修改项>'
    ])).toThrow('--notes with concrete change details is required when --decision changes_requested');
  });

  it('requires concrete notes when the user accepts the MVP', () => {
    expect(() => parseUserAcceptanceArgs([
      '--repo',
      'fixtures/benchmark/vite-basic',
      '--decision',
      'accepted'
    ])).toThrow('--notes with concrete acceptance confirmation is required when --decision accepted');

    expect(() => parseUserAcceptanceArgs([
      '--repo',
      'fixtures/benchmark/vite-basic',
      '--decision',
      'accepted',
      '--notes',
      '待用户填写'
    ])).toThrow('--notes with concrete acceptance confirmation is required when --decision accepted');
  });

  it('requires generated Playwright spec validation when the user accepts the MVP', () => {
    expect(() => parseUserAcceptanceArgs([
      '--repo',
      'fixtures/benchmark/vite-basic',
      '--decision',
      'accepted',
      '--notes',
      '用户确认 MVP 符合预期'
    ])).toThrow('--validate-generated-tests is required when --decision accepted');
  });

  it('allows accepted CLI mode without generated Playwright spec validation', () => {
    expect(parseUserAcceptanceArgs([
      '--mode',
      'cli',
      '--repo',
      'fixtures/python-cli-basic',
      '--decision',
      'accepted',
      '--notes',
      '用户确认 Python CLI 验收符合预期'
    ])).toMatchObject({
      mode: 'cli',
      decision: 'accepted',
      validateGeneratedTests: false
    });
  });

  it('requires an explicit repo path', () => {
    expect(() => parseUserAcceptanceArgs(['--browser'])).toThrow('Missing required option: --repo <path>');
  });

  it('prints user acceptance help without requiring a repo path', async () => {
    const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    try {
      await expect(main(['--help'])).resolves.toBe(0);
      const output = stdout.mock.calls.map(([chunk]) => String(chunk)).join('');
      expect(output).toContain('Usage:');
      expect(output).toContain('pnpm user:accept -- --repo <repo>');
      expect(output).toContain('pnpm user:accept -- -h');
      expect(output).toContain('--validate-generated-tests');
      expect(output).toContain('--generated-test-timeout-ms <ms>');
      expect(output).toContain('required for accepted and changes_requested');
    } finally {
      stdout.mockRestore();
    }
  });

  it('writes a structured failure record without creating a missing repo root', async () => {
    const tempRoot = await mkdtemp(join(tmpdir(), 'hardening-user-acceptance-missing-'));
    const missingRepo = join(tempRoot, 'missing-real-app');
    const outputPath = join(tempRoot, 'records', 'user-acceptance.md');
    const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    try {
      await expect(main([
        '--repo',
        missingRepo,
        '--output',
        outputPath
      ])).resolves.toBe(1);
      await expect(stat(missingRepo)).rejects.toThrow();
      const markdown = await readFile(outputPath, 'utf8');
      expect(markdown).toContain('| repo root 是有效目录 | 是 | 失败 |');
      expect(markdown).toContain('| package.json 是有效文件 | 是 | 跳过 | repo root check failed |');
    } finally {
      stdout.mockRestore();
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it('writes a structured failure record when repo root is a file', async () => {
    const tempRoot = await mkdtemp(join(tmpdir(), 'hardening-user-acceptance-file-'));
    const repoFile = join(tempRoot, 'not-a-directory');
    const outputPath = join(tempRoot, 'records', 'user-acceptance.md');
    const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    try {
      await writeFile(repoFile, 'not a repo');

      await expect(main([
        '--repo',
        repoFile,
        '--output',
        outputPath
      ])).resolves.toBe(1);
      const markdown = await readFile(outputPath, 'utf8');
      expect(markdown).toContain('| repo root 是有效目录 | 是 | 失败 |');
      expect(markdown).toContain('| package.json 是有效文件 | 是 | 跳过 | repo root check failed |');
    } finally {
      stdout.mockRestore();
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it('writes a structured failure record when package.json is missing', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-user-acceptance-empty-'));
    const outputPath = join(repoRoot, '..', 'records', 'user-acceptance.md');
    const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    try {
      await expect(main([
        '--repo',
        repoRoot,
        '--output',
        outputPath
      ])).resolves.toBe(1);
      const markdown = await readFile(outputPath, 'utf8');
      expect(markdown).toContain('| repo root 是有效目录 | 是 | 通过 |');
      expect(markdown).toContain('| package.json 是有效文件 | 是 | 失败 |');
    } finally {
      stdout.mockRestore();
      await rm(repoRoot, { recursive: true, force: true });
      await rm(join(repoRoot, '..', 'records'), { recursive: true, force: true });
    }
  });

  it('writes a structured failure record when package.json is malformed', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-user-acceptance-malformed-package-'));
    const outputPath = join(repoRoot, '..', 'records', 'user-acceptance.md');
    const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    try {
      await writeFile(join(repoRoot, 'package.json'), '{"scripts":');

      await expect(main([
        '--repo',
        repoRoot,
        '--output',
        outputPath
      ])).resolves.toBe(1);
      const markdown = await readFile(outputPath, 'utf8');
      expect(markdown).toContain('| repo root 是有效目录 | 是 | 通过 |');
      expect(markdown).toContain('| package.json 是有效文件 | 是 | 失败 |');
      expect(markdown).toContain('invalid package.json:');
    } finally {
      stdout.mockRestore();
      await rm(repoRoot, { recursive: true, force: true });
      await rm(join(repoRoot, '..', 'records'), { recursive: true, force: true });
    }
  });

  it('writes a structured failure record when package.json is valid JSON but not an object manifest', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-user-acceptance-non-object-package-'));
    const outputPath = join(repoRoot, '..', 'records', 'user-acceptance.md');
    const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    try {
      await writeFile(join(repoRoot, 'package.json'), '[]');

      await expect(main([
        '--repo',
        repoRoot,
        '--output',
        outputPath
      ])).resolves.toBe(1);
      const markdown = await readFile(outputPath, 'utf8');
      expect(markdown).toContain('| repo root 是有效目录 | 是 | 通过 |');
      expect(markdown).toContain('| package.json 是有效文件 | 是 | 失败 |');
      expect(markdown).toContain('invalid package.json manifest:');
    } finally {
      stdout.mockRestore();
      await rm(repoRoot, { recursive: true, force: true });
      await rm(join(repoRoot, '..', 'records'), { recursive: true, force: true });
    }
  });

  it('rejects placeholder repo paths with an actionable preflight message', async () => {
    await expect(buildUserAcceptanceRepoPreflightChecks('/tmp/<real-web-app-repo>')).resolves.toEqual([
      {
        name: 'repo root 是有效目录',
        required: true,
        status: 'failed',
        evidence: 'replace <real-web-app-repo> with the real Web App repo path'
      },
      {
        name: 'package.json 是有效文件',
        required: true,
        status: 'skipped',
        evidence: 'repo root check failed'
      }
    ]);
  });

  it('uses pyproject.toml preflight for explicit CLI acceptance mode', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-python-cli-preflight-'));

    try {
      await writeFile(join(repoRoot, 'pyproject.toml'), [
        '[project]',
        'name = "python-cli-fixture"',
        '',
        '[project.scripts]',
        'python-cli-fixture = "python_cli_fixture:main"'
      ].join('\n'));

      await expect(buildUserAcceptanceRepoPreflightChecks(repoRoot, { mode: 'cli' })).resolves.toEqual([
        {
          name: 'repo root 是有效目录',
          required: true,
          status: 'passed',
          evidence: repoRoot
        },
        {
          name: 'pyproject.toml 是有效文件',
          required: true,
          status: 'passed',
          evidence: join(repoRoot, 'pyproject.toml')
        }
      ]);
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

  it('writes a Python CLI acceptance record without running web hardening', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-python-cli-acceptance-'));
    const outputPath = join(repoRoot, 'records', 'user-acceptance.md');
    const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    try {
      await writeFile(join(repoRoot, 'pyproject.toml'), [
        '[project]',
        'name = "python-cli-fixture"',
        'requires-python = ">=3.11"',
        '',
        '[project.scripts]',
        'python-cli-fixture = "python_cli_fixture:main"',
        '',
        '[project.optional-dependencies]',
        'dev = ["pytest", "ruff"]'
      ].join('\n'));
      await mkdir(join(repoRoot, '.venv', 'bin'), { recursive: true });
      await writeFile(join(repoRoot, '.venv', 'bin', 'python-cli-fixture'), '#!/bin/sh\necho "usage: python-cli-fixture"\n');
      await writeFile(join(repoRoot, '.venv', 'bin', 'pytest'), '#!/bin/sh\necho "3 passed"\n');
      await writeFile(join(repoRoot, '.venv', 'bin', 'ruff'), '#!/bin/sh\necho "Found 2 errors"\nexit 1\n');
      await chmod(join(repoRoot, '.venv', 'bin', 'python-cli-fixture'), 0o755);
      await chmod(join(repoRoot, '.venv', 'bin', 'pytest'), 0o755);
      await chmod(join(repoRoot, '.venv', 'bin', 'ruff'), 0o755);

      await expect(runUserAcceptance({
        repoRoot,
        mode: 'cli',
        outputPath,
        browser: false,
        trace: false,
        validateGeneratedTests: false,
        criticalPaths: [],
        decision: 'pending',
        notes: ''
      }, {
        runHardening: async () => {
          throw new Error('web hardening should not run for cli mode');
        }
      })).resolves.toBe(0);

      const record = await readFile(outputPath, 'utf8');
      expect(record).toContain('| 验收模式 | cli |');
      expect(record).toContain('| python-cli-profile.json 已生成 | 是 | 通过 |');
      expect(record).toContain('| Python CLI console entrypoint 已检测 | 是 | 通过 |');
      expect(record).toContain('| Python CLI smoke check plan 已生成 | 是 | 通过 |');
      expect(record).toContain('| Python CLI check 执行: python-cli-fixture --help | 是 | 通过 |');
      expect(record).toContain('| Python CLI check 执行: pytest | 否 | 通过 |');
      expect(record).toContain('| Python CLI check 执行: ruff check . | 否 | 失败 |');
      expect(record).toContain('Found 2 errors');
      expect(record).toContain('| hardening-report.md 已生成 | 是 | 通过 |');
      expect(record).toContain('| repair-task-package.json 已生成 | 是 | 通过 |');
      expect(record).not.toContain('generated Playwright spec 执行验证');
      expect((await stat(join(repoRoot, '.hardening', 'run', 'python-cli-profile.json'))).isFile()).toBe(true);
      expect((await stat(join(repoRoot, 'hardening-report.md'))).isFile()).toBe(true);
      expect((await stat(join(repoRoot, '.hardening', 'runs'))).isDirectory()).toBe(true);
      const [runId] = await readdir(join(repoRoot, '.hardening', 'runs'));
      const runDir = join(repoRoot, '.hardening', 'runs', runId ?? '');
      const handoffPackagePath = join(runDir, 'ai-ide-handoff-package.json');
      const manifestPath = join(runDir, 'manifest.json');
      const handoffPackage = JSON.parse(await readFile(handoffPackagePath, 'utf8')) as {
        mode: string;
        recommendedReadingOrder: Array<{ artifactKind: string; path: string }>;
        sourceSummary: { targetRepoFeedbackSummary: string };
      };
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as {
        artifacts: {
          aiIdeHandoffPackagePath?: string;
          targetRepoFeedbackSummaryPath?: string;
        };
      };

      expect(record).toContain('| ai-ide-handoff-package.json 已生成 | 是 | 通过 |');
      expect(handoffPackage.mode).toBe('cli');
      expect(handoffPackage.recommendedReadingOrder[0]).toMatchObject({
        artifactKind: 'target_repo_feedback_summary',
        path: 'target-repo-feedback-summary.json'
      });
      expect(handoffPackage.sourceSummary.targetRepoFeedbackSummary).toBe('target-repo-feedback-summary.json');
      expect(manifest.artifacts.targetRepoFeedbackSummaryPath).toBe(join(runDir, 'target-repo-feedback-summary.json'));
      expect(manifest.artifacts.aiIdeHandoffPackagePath).toBe(handoffPackagePath);
    } finally {
      stdout.mockRestore();
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

  it('writes a structured failure record when the hardening flow fails unexpectedly', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-user-acceptance-flow-error-'));
    const outputPath = join(repoRoot, 'records', 'user-acceptance.md');
    const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    try {
      await writeFile(join(repoRoot, 'package.json'), '{"scripts":{}}');

      await expect(runUserAcceptance({
        repoRoot,
        mode: 'browser',
        outputPath,
        browser: false,
        trace: false,
        validateGeneratedTests: false,
        criticalPaths: [],
        decision: 'pending',
        notes: ''
      }, {
        runHardening: async () => {
          throw new Error('fixture hardening failure with SECRET_TOKEN=abc123');
        }
      })).resolves.toBe(1);

      const record = await readFile(outputPath, 'utf8');
      expect(record).toContain('| hardening flow 执行完成 | 是 | 失败 |');
      expect(record).toContain('fixture hardening failure');
      expect(record).not.toContain('SECRET_TOKEN=abc123');
    } finally {
      stdout.mockRestore();
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

  it('closes browser drivers that were created for hardening runs without exploration', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-user-acceptance-browser-cleanup-'));
    const outputPath = join(repoRoot, 'records', 'user-acceptance.md');
    const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const close = vi.fn(async () => undefined);

    try {
      await writeFile(join(repoRoot, 'package.json'), '{"scripts":{}}');
      const runDir = join(repoRoot, '.hardening', 'run');
      const reportPath = join(repoRoot, 'hardening-report.md');
      const findingsPath = join(runDir, 'findings.json');
      const patchDiffPath = join(runDir, 'patch.diff');
      const generatedSpecPath = join(repoRoot, 'tests', 'hardening', 'generated.spec.ts');
      const manifestPath = join(repoRoot, '.hardening', 'runs', 'run-test', 'manifest.json');
      const repairPlanPath = join(repoRoot, '.hardening', 'runs', 'run-test', 'repair-plan.json');
      const repairPlanMarkdownPath = join(repoRoot, '.hardening', 'runs', 'run-test', 'repair-plan.md');
      const repairTaskPackagePath = join(repoRoot, '.hardening', 'runs', 'run-test', 'repair-task-package.json');
      const repairTaskPackageMarkdownPath = join(repoRoot, '.hardening', 'runs', 'run-test', 'repair-task-package.md');
      await mkdir(runDir, { recursive: true });
      await mkdir(join(repoRoot, '.hardening', 'runs', 'run-test'), { recursive: true });
      await mkdir(join(repoRoot, 'tests', 'hardening'), { recursive: true });
      await writeFile(reportPath, '# report\n');
      await writeFile(findingsPath, '{"findings":[]}\n');
      await writeFile(patchDiffPath, 'diff\n');
      await writeFile(manifestPath, '{}\n');
      await writeFile(repairPlanPath, '{"schemaVersion":1}\n');
      await writeFile(repairPlanMarkdownPath, '# Repair Plan\n');
      await writeFile(repairTaskPackagePath, '{"schemaVersion":1,"tasks":[]}\n');
      await writeFile(repairTaskPackageMarkdownPath, '# Executable Repair Task Package\n');
      await writeFile(generatedSpecPath, 'import { test } from "@playwright/test";\n');

      await expect(runUserAcceptance({
        repoRoot,
        mode: 'browser',
        outputPath,
        browser: true,
        trace: false,
        validateGeneratedTests: false,
        criticalPaths: [],
        decision: 'pending',
        notes: ''
      }, {
        createBrowserDriver: async () => ({
          snapshot: async () => {
            throw new Error('snapshot should not be called');
          },
          close
        }),
        runHardening: async () => ({
          profilePath: join(runDir, 'repo-profile.json'),
          findingsPath,
          reportPath,
          artifactBundle: {
            runId: 'run-test',
            runDir: join(repoRoot, '.hardening', 'runs', 'run-test'),
            manifestPath,
            latestPath: join(repoRoot, '.hardening', 'latest'),
            repairPlan: {
              repairPlanPath,
              repairPlanMarkdownPath,
              repairTaskPackagePath,
              repairTaskPackageMarkdownPath,
              taskCount: 0,
              highestSeverity: null,
              recommendedNextTaskId: null
            }
          },
          analyze: {
            framework: 'unknown',
            packageManager: 'npm',
            scripts: { dev: null, build: null, test: null, start: null, preview: null },
            recommendedStartCommand: null,
            appDirectories: [],
            existingTestDirectories: [],
            envHints: [],
            blockers: ['No Web App start script detected'],
            confidence: 'low'
          },
          explore: {
            visitedRoutes: [],
            interactions: [],
            findings: [],
            artifactsDir: join(repoRoot, '.hardening', 'artifacts'),
            artifactFiles: []
          },
          testGeneration: {
            createdFiles: [generatedSpecPath],
            testCommand: 'npx playwright test tests/hardening',
            verificationCommand: 'npx playwright test tests/hardening',
            validationStatus: 'skipped',
            errors: [],
            resultPath: join(runDir, 'test-generation.json')
          },
          report: {
            reportPath,
            readinessScore: 60,
            issueCounts: { P0: 0, P1: 0, P2: 0 },
            patchDiffPath
          },
          repairPlan: {
            repairPlanPath,
            repairPlanMarkdownPath,
            repairTaskPackagePath,
            repairTaskPackageMarkdownPath,
            taskCount: 0,
            highestSeverity: null,
            recommendedNextTaskId: null
          }
        })
      })).resolves.toBe(1);

      expect(close).toHaveBeenCalledTimes(1);
    } finally {
      stdout.mockRestore();
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

  it('keeps an auto-booted app alive when generated tests need validation', () => {
    const options = parseUserAcceptanceArgs([
      '--repo',
      'fixtures/benchmark/vite-basic',
      '--validate-generated-tests'
    ]);

    expect(options.url).toBeUndefined();
    expect(options.validateGeneratedTests).toBe(true);
    expect(shouldManageGeneratedTestBootSession(options)).toBe(true);
  });

  it('does not manage boot sessions when validation has a provided url or is disabled', () => {
    expect(shouldManageGeneratedTestBootSession({
      validateGeneratedTests: true,
      url: 'http://127.0.0.1:5173'
    })).toBe(false);
    expect(shouldManageGeneratedTestBootSession({
      validateGeneratedTests: false
    })).toBe(false);
  });

  it('normalizes the base URL used for generated test validation', () => {
    expect(selectGeneratedTestValidationBaseUrl('http://0.0.0.0:5173/', undefined)).toBe(
      'http://127.0.0.1:5173'
    );
    expect(selectGeneratedTestValidationBaseUrl(undefined, 'http://[::]:5173/')).toBe(
      'http://127.0.0.1:5173'
    );
  });

  it('formats generated acceptance commands so paths and intent prompts remain runnable', () => {
    const options = parseUserAcceptanceArgs([
      '--repo',
      'fixtures/benchmark/vite-basic',
      '--critical-path',
      'login, create a project, then send a chat message',
      '--start-command',
      'pnpm dev --host 127.0.0.1',
      '--notes',
      'needs reviewer confirmation'
    ]);
    const command = formatUserAcceptanceCommand(options);
    const words = parseShellWords(command);

    expect(words?.[words.indexOf('--repo') + 1]).toBe(options.repoRoot);
    expect(command).toContain("--critical-path 'login, create a project, then send a chat message'");
    expect(command).toContain("--start-command 'pnpm dev --host 127.0.0.1'");
    expect(command).toContain("--notes 'needs reviewer confirmation'");
  });

  it('keeps placeholder repo paths as placeholders in displayed acceptance commands', () => {
    const options = parseUserAcceptanceArgs([
      '--repo',
      '<real-web-app-repo>',
      '--output',
      '/private/tmp/user-acceptance.md'
    ]);
    const command = formatUserAcceptanceCommand(options);

    expect(command).toContain('--repo <real-web-app-repo>');
    expect(command).not.toContain(`--repo '${options.repoRoot}'`);
  });

  it('keeps generated acceptance commands on one line when notes contain newlines', () => {
    const options = parseUserAcceptanceArgs([
      '--repo',
      'fixtures/benchmark/vite-basic',
      '--notes',
      'first line\nsecond line'
    ]);
    const command = formatUserAcceptanceCommand(options);

    expect(command).not.toContain('\n');
    expect(command).toContain("--notes $'first line\\nsecond line'");
  });

  it('includes custom output paths in generated acceptance commands', () => {
    const options = parseUserAcceptanceArgs([
      '--repo',
      'fixtures/benchmark/vite-basic',
      '--output',
      'artifacts/acceptance/user record.md'
    ]);
    const command = formatUserAcceptanceCommand(options);

    expect(command).toContain(`--output '${options.outputPath}'`);
  });

  it('includes generated test timeout in generated acceptance commands', () => {
    const options = parseUserAcceptanceArgs([
      '--repo',
      'fixtures/benchmark/vite-basic',
      '--validate-generated-tests',
      '--generated-test-timeout-ms',
      '240000'
    ]);
    const command = formatUserAcceptanceCommand(options);

    expect(options.generatedTestTimeoutMs).toBe(240000);
    expect(command).toContain('--generated-test-timeout-ms 240000');
  });

  it('rejects invalid generated test timeout values', () => {
    expect(() => parseUserAcceptanceArgs([
      '--repo',
      'fixtures/benchmark/vite-basic',
      '--generated-test-timeout-ms',
      '0'
    ])).toThrow('--generated-test-timeout-ms must be a positive integer');
  });

  it('skips generated test validation unless requested', async () => {
    await expect(buildGeneratedTestValidationCheck({
      repoRoot: '/tmp/real-app',
      generatedTestFiles: ['/tmp/real-app/tests/hardening/generated-findings.spec.ts'],
      enabled: false
    })).resolves.toEqual({
      name: 'generated Playwright spec 执行验证',
      required: false,
      status: 'skipped',
      evidence: 'not requested; pass --validate-generated-tests to execute generated specs against the target app'
    });
  });

  it('fails generated test validation when requested without a running url', async () => {
    await expect(buildGeneratedTestValidationCheck({
      repoRoot: '/tmp/real-app',
      generatedTestFiles: ['/tmp/real-app/tests/hardening/generated-findings.spec.ts'],
      enabled: true
    })).resolves.toEqual({
      name: 'generated Playwright spec 执行验证',
      required: true,
      status: 'failed',
      evidence: '--validate-generated-tests requires a running target URL; pass --url or let user:accept auto-boot the app'
    });
  });

  it('quotes generated test validation commands with spaces in paths', () => {
    expect(formatGeneratedTestValidationCommand({
      baseUrl: 'http://127.0.0.1:5173',
      nodePath: '/tmp/Agent Tester/node_modules',
      playwrightPath: '/tmp/Agent Tester/node_modules/.bin/playwright',
      repoRoot: '/tmp/Real App',
      relativeTestFiles: [
        'tests/hardening/generated findings.spec.ts',
        'tests/hardening/login.spec.ts'
      ]
    })).toBe("cd '/tmp/Real App' && HARDENING_BASE_URL=http://127.0.0.1:5173 NODE_PATH='/tmp/Agent Tester/node_modules' '/tmp/Agent Tester/node_modules/.bin/playwright' test 'tests/hardening/generated findings.spec.ts' tests/hardening/login.spec.ts --reporter=line");
  });

  it('creates and removes a temporary Playwright dependency resolver for generated specs', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-user-acceptance-repo-'));
    const testDir = join(repoRoot, 'tests', 'hardening');
    const nodeModulesDir = join(testDir, 'node_modules');
    const packageLink = join(testDir, 'node_modules', '@playwright', 'test');

    await mkdir(testDir, { recursive: true });

    const resolver = await ensureGeneratedTestPlaywrightDependency({
      repoRoot,
      relativeTestFiles: ['tests/hardening/generated-findings.spec.ts']
    });

    await expect(readlink(packageLink)).resolves.toContain('node_modules/@playwright/test');

    await resolver.cleanup();

    await expect(stat(packageLink)).rejects.toThrow();
    await expect(stat(nodeModulesDir)).rejects.toThrow();
  });

  it('redacts sensitive URL parameters from generated test validation evidence commands', () => {
    const command = formatGeneratedTestValidationCommand({
      baseUrl: 'http://127.0.0.1:5173/callback?code=oauth-secret&tab=profile#access_token=fragment-secret',
      nodePath: '/tmp/Agent Tester/node_modules',
      playwrightPath: '/tmp/Agent Tester/node_modules/.bin/playwright',
      repoRoot: '/tmp/Real App',
      relativeTestFiles: ['tests/hardening/generated findings.spec.ts']
    });
    const evidenceCommand = formatGeneratedTestValidationEvidenceCommand(command);

    expect(command).toContain('oauth-secret');
    expect(command).toContain('fragment-secret');
    expect(evidenceCommand).toContain('code=[REDACTED]');
    expect(evidenceCommand).toContain('access_token=[REDACTED]');
    expect(evidenceCommand).not.toContain('oauth-secret');
    expect(evidenceCommand).not.toContain('fragment-secret');
  });

  it('redacts sensitive values from generated test validation failure evidence', () => {
    const stderrEvidence = formatGeneratedTestValidationFailureEvidence({
      command: 'cd /tmp/app && HARDENING_BASE_URL=http://localhost:3000/callback?code=oauth-secret playwright test',
      exitCode: 1,
      stdout: 'OPENAI_API_KEY=sk-stdout-secret',
      stderr: 'Authorization: Bearer stderr-token\nsession=browser-session-secret'
    });
    const stdoutEvidence = formatGeneratedTestValidationFailureEvidence({
      command: 'cd /tmp/app && playwright test',
      exitCode: 1,
      stdout: 'OPENAI_API_KEY=sk-stdout-secret',
      stderr: ''
    });

    expect(stderrEvidence).toContain('cd /tmp/app && HARDENING_BASE_URL=http://localhost:3000/callback?code=[REDACTED] playwright test; ');
    expect(stderrEvidence).toContain('Authorization: Bearer [REDACTED]');
    expect(stderrEvidence).toContain('session=[REDACTED]');
    expect(stderrEvidence).not.toContain('oauth-secret');
    expect(stderrEvidence).not.toContain('stderr-token');
    expect(stderrEvidence).not.toContain('browser-session-secret');
    expect(stdoutEvidence).toContain('OPENAI_API_KEY=[REDACTED]');
    expect(stdoutEvidence).not.toContain('sk-stdout-secret');
  });

  it('creates nested output directories when writing user acceptance records', async () => {
    const tempRoot = await mkdtemp(join(tmpdir(), 'hardening-user-acceptance-'));
    const outputPath = join(tempRoot, 'nested', 'records', 'user-acceptance.md');

    try {
      await writeUserAcceptanceRecord(outputPath, '# User Acceptance\n');

      await expect(readFile(outputPath, 'utf8')).resolves.toBe('# User Acceptance\n');
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});
