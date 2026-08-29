import { mkdir, mkdtemp, readFile, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildRepairHandoffPackage,
  formatRepairHandoffMarkdown,
  formatVerificationPlanMarkdown,
  runRepairHandoff
} from '../../packages/acceptance/src/run-repair-handoff.js';

describe('repair handoff', () => {
  it('standardizes failing Python/CLI command results into executable repair tasks', () => {
    const pkg = buildRepairHandoffPackage({
      generatedAt: '2026-06-21T09:00:00.000Z',
      runDir: '/tmp/agent-reach/.hardening/runs/run-fixed',
      manifest: {
        schemaVersion: 1,
        mode: 'cli',
        runId: 'run-fixed',
        repoRoot: '/tmp/agent-reach',
        artifacts: {
          repairTaskPackagePath: '/tmp/agent-reach/.hardening/runs/run-fixed/repair-task-package.json'
        },
        commandResults: [
          { command: 'agent-reach', args: ['--help'], exitCode: 0, stdout: 'usage: agent-reach', stderr: '', timedOut: false },
          { command: 'ruff', args: ['check', '.'], exitCode: 1, stdout: 'Found 46 errors API_KEY=sk-secret', stderr: '', timedOut: false },
          { command: 'mypy', args: ['.'], exitCode: 1, stdout: '', stderr: '15 errors token=abc123', timedOut: false }
        ],
        checks: [
          { name: 'Python CLI check 执行: ruff check .', required: false, status: 'failed', evidence: 'exit=1' },
          { name: 'Python CLI check 执行: mypy .', required: false, status: 'failed', evidence: 'exit=1' }
        ]
      }
    });

    expect(pkg.schemaVersion).toBe(1);
    expect(pkg.mode).toBe('cli');
    expect(pkg.summary).toEqual({
      totalTasks: 2,
      failedCommands: 2,
      requiredFailed: 0,
      requiredBlocked: 0,
      highestPriority: 'P1'
    });
    expect(pkg.agentContract).toMatchObject({
      schema: 'repoassure.repair-handoff.v1',
      primaryReadPath: '.hardening/latest/repair-handoff-package.json',
      nextCommands: {
        dryRun: 'hardening repair execute --package <repair-handoff-package.json> --task <taskId> --dry-run',
        validationOnly: 'hardening repair execute --package <repair-handoff-package.json> --task <taskId> --validation-only',
        patchPlan: 'hardening repair patch-plan --report <repair-execution-report.json>'
      }
    });
    expect(pkg.agentContract.boundaries).toContain('Does not modify target repository files.');
    expect(pkg.agentContract.readOrder).toContain('tasks[].verification.commands');
    expect(pkg.tasks.map((task) => task.taskId)).toEqual([
      'pycli-failed-ruff-check',
      'pycli-failed-mypy'
    ]);
    expect(pkg.tasks[0]?.objective).toContain('修复失败命令：ruff check .');
    expect(pkg.tasks[0]?.evidence.commandResult?.stdout).toContain('API_KEY=[REDACTED]');
    expect(pkg.tasks[0]?.evidence.commandResult?.stdout).not.toContain('sk-secret');
    expect(pkg.tasks[0]?.verification.commands).toContain('ruff check .');
    expect(pkg.tasks[0]?.handoffPrompt).toContain('你是接手目标 repo 的修复 Agent');
    expect(formatRepairHandoffMarkdown(pkg)).toContain('# Repair Handoff Package');
    expect(formatRepairHandoffMarkdown(pkg)).toContain('pycli-failed-ruff-check');
    expect(formatVerificationPlanMarkdown(pkg)).toContain('# Verification Plan');
    expect(formatVerificationPlanMarkdown(pkg)).toContain('ruff check .');
    expect(formatVerificationPlanMarkdown(pkg)).toContain('mypy .');
  });

  it('exposes a deterministic AI IDE repair decision package contract', () => {
    const pkg = buildRepairHandoffPackage({
      generatedAt: '2026-07-16T10:00:00.000Z',
      runDir: '/tmp/app/.hardening/runs/run-ai-ide',
      manifest: {
        schemaVersion: 1,
        mode: 'cli',
        runId: 'run-ai-ide',
        repoRoot: '/tmp/app',
        artifacts: {
          manifestPath: '/tmp/app/.hardening/runs/run-ai-ide/manifest.json',
          repairTaskPackagePath: '/tmp/app/.hardening/runs/run-ai-ide/repair-task-package.json',
          repairPlanPath: '/tmp/app/.hardening/runs/run-ai-ide/repair-plan.json'
        },
        commandResults: [
          { command: 'pytest', args: ['-q'], exitCode: 1, stdout: 'FAILED tests/test_app.py::test_login SECRET_KEY=private', stderr: '', timedOut: false }
        ],
        checks: [
          { name: 'Maintainer acceptance decision', required: true, status: 'failed', evidence: 'decision pending' },
          { name: 'Environment browser smoke', required: false, status: 'blocked', evidence: 'listen EPERM' }
        ]
      }
    });

    expect(pkg.agentContract.readOrder).toEqual([
      'summary',
      'agentContract',
      'repairActionQueue[]',
      'tasks[]',
      'tasks[].evidence',
      'tasks[].recommendedFix',
      'tasks[].verification.commands',
      'maintainerReview',
      'verificationChecklist',
      'redaction'
    ]);
    expect(pkg.agentContract.boundaries).toContain('Must not modify target repository files unless the maintainer separately authorizes a repair execution goal.');
    expect(pkg.agentContract.maintainerReviewBoundary).toEqual({
      requiredBefore: [
        'applying patches',
        'changing target repository files',
        'creating branches, commits, issues, pull requests, or advisories',
        'marking acceptance as passed'
      ],
      allowedDecisions: ['approve', 'reject', 'defer', 'accept_risk']
    });
    expect(pkg.repairActionQueue).toEqual(expect.arrayContaining([
      expect.objectContaining({
        taskId: 'acceptance-check-maintainer-acceptance-decision',
        priority: 'P0',
        status: 'queued',
        requiresMaintainerReview: true
      }),
      expect.objectContaining({
        taskId: 'pycli-failed-pytest-q',
        priority: 'P1',
        status: 'queued',
        requiresMaintainerReview: true
      })
    ]));
    expect(pkg.verificationChecklist.commands).toContain('pytest -q');
    expect(pkg.verificationChecklist.acceptanceCriteria).toContain('acceptance-check-maintainer-acceptance-decision: 验收项 `Maintainer acceptance decision` 状态为 passed。');
    expect(pkg.verificationChecklist.completionSignals).toContain('Maintainer review decision is recorded before any target repo write.');
    expect(pkg.redaction).toMatchObject({
      guarantee: 'All command output, evidence, paths, and prompts are redacted before entering this package.',
      prohibitedContent: expect.arrayContaining(['secrets', 'tokens', 'cookies', 'private keys'])
    });
    expect(pkg.tasks[1]?.evidence.commandResult?.stdout).toContain('SECRET_KEY=[REDACTED]');
    expect(JSON.stringify(pkg)).not.toContain('SECRET_KEY=private');

    const markdown = formatRepairHandoffMarkdown(pkg);
    expect(markdown).toContain('## AI IDE Repair Decision Contract');
    expect(markdown).toContain('## Repair Action Queue');
    expect(markdown).toContain('## Maintainer Review Boundary');
    expect(markdown).toContain('## Verification Checklist');
    expect(markdown).toContain('Must not modify target repository files unless the maintainer separately authorizes a repair execution goal.');
  });

  it('distinguishes passed runs from environment blockers in the AI IDE queue', () => {
    const passed = buildRepairHandoffPackage({
      generatedAt: '2026-07-16T11:00:00.000Z',
      runDir: '/tmp/app/.hardening/runs/run-passed',
      manifest: {
        schemaVersion: 1,
        mode: 'cli',
        runId: 'run-passed',
        repoRoot: '/tmp/app',
        commandResults: [
          { command: 'pytest', args: ['-q'], exitCode: 0, stdout: '3 passed', stderr: '', timedOut: false }
        ],
        checks: [
          { name: 'Required gate', required: true, status: 'passed', evidence: 'ok' }
        ]
      }
    });
    const blocked = buildRepairHandoffPackage({
      generatedAt: '2026-07-16T11:05:00.000Z',
      runDir: '/tmp/app/.hardening/runs/run-blocked',
      manifest: {
        schemaVersion: 1,
        mode: 'browser',
        runId: 'run-blocked',
        repoRoot: '/tmp/app',
        commandResults: [],
        checks: [
          { name: 'Browser smoke', required: true, status: 'blocked', evidence: 'listen EPERM TOKEN=secret' }
        ]
      }
    });

    expect(passed.summary.totalTasks).toBe(0);
    expect(passed.repairActionQueue).toEqual([]);
    expect(passed.verificationChecklist.completionSignals).toContain('No queued repair actions remain.');
    expect(formatRepairHandoffMarkdown(passed)).toContain('- No queued repair actions.');

    expect(blocked.summary.totalTasks).toBe(1);
    expect(blocked.summary.requiredBlocked).toBe(1);
    expect(blocked.tasks[0]).toMatchObject({
      taskId: 'environment-blocker-browser-smoke',
      priority: 'P0',
      sourceType: 'environment_blocker',
      objective: '解除环境阻塞：Browser smoke'
    });
    expect(blocked.tasks[0]?.evidence.check?.evidence).toContain('TOKEN=[REDACTED]');
    expect(JSON.stringify(blocked)).not.toContain('TOKEN=secret');
    expect(blocked.repairActionQueue[0]).toMatchObject({
      taskId: 'environment-blocker-browser-smoke',
      status: 'queued',
      requiresMaintainerReview: true
    });
  });

  it('writes repair handoff artifacts from a run manifest', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-repair-handoff-repo-'));
    const runDir = join(repoRoot, '.hardening', 'runs', 'run-fixed');
    const outputDir = join(repoRoot, '.hardening', 'repair-handoff', 'run-fixed');

    await mkdir(runDir, { recursive: true });
    await writeFile(join(runDir, 'manifest.json'), JSON.stringify({
      schemaVersion: 1,
      mode: 'cli',
      runId: 'run-fixed',
      repoRoot,
      artifacts: {
        repairTaskPackagePath: join(runDir, 'repair-task-package.json')
      },
      commandResults: [
        { command: 'agent-reach', args: ['--help'], exitCode: 0, stdout: 'usage: agent-reach', stderr: '', timedOut: false },
        { command: 'ruff', args: ['check', '.'], exitCode: 1, stdout: 'Found 46 errors', stderr: '', timedOut: false }
      ]
    }, null, 2));

    const result = await runRepairHandoff({
      runDir,
      outputDir,
      generatedAt: '2026-06-21T09:00:00.000Z'
    });

    expect(result.taskCount).toBe(1);
    expect(result.packagePath).toBe(join(outputDir, 'repair-handoff-package.json'));
    await expect(readFile(result.packagePath, 'utf8')).resolves.toContain('"pycli-failed-ruff-check"');
    await expect(readFile(result.markdownPath, 'utf8')).resolves.toContain('Found 46 errors');
    await expect(readFile(result.verificationPlanPath, 'utf8')).resolves.toContain('ruff check .');
  });

  it('consumes a near-real campaign fixture without writing target repo files', async () => {
    const fixtureManifest = JSON.parse(
      await readFile('fixtures/campaigns/ai-ide-repair-decision-package/manifest.json', 'utf8')
    ) as Record<string, unknown>;
    const targetRepo = await mkdtemp(join(tmpdir(), 'repoassure-ai-ide-campaign-target-'));
    const outputRoot = await mkdtemp(join(tmpdir(), 'repoassure-ai-ide-campaign-output-'));
    const runDir = join(outputRoot, 'runs', 'campaign-run-001');
    const targetSourcePath = join(targetRepo, 'src', 'auth', 'password.js');

    await mkdir(join(targetRepo, 'src', 'auth'), { recursive: true });
    await mkdir(runDir, { recursive: true });
    await writeFile(targetSourcePath, 'module.exports = { hash: "sha1" };\n');
    await writeFile(join(runDir, 'manifest.json'), JSON.stringify({
      ...fixtureManifest,
      repoRoot: targetRepo,
      runId: 'campaign-run-001'
    }, null, 2));
    const beforeTargetSource = await readFile(targetSourcePath, 'utf8');
    const beforeTargetSourceStat = await stat(targetSourcePath);

    const result = await runRepairHandoff({
      runDir,
      generatedAt: '2026-07-16T12:00:00.000Z'
    });

    const packageText = await readFile(result.packagePath, 'utf8');
    const markdown = await readFile(result.markdownPath, 'utf8');
    const verificationPlan = await readFile(result.verificationPlanPath, 'utf8');
    const packageJson = JSON.parse(packageText) as {
      agentContract: { readOrder: string[]; boundaries: string[] };
      repairActionQueue: Array<{ taskId: string; sourceType: string; verificationCommands: string[] }>;
      maintainerReview: { requiredBefore: string[] };
      verificationChecklist: { commands: string[]; completionSignals: string[] };
      redaction: { prohibitedContent: string[] };
      summary: { totalTasks: number; requiredBlocked: number };
    };

    expect(packageJson.summary.totalTasks).toBe(4);
    expect(packageJson.summary.requiredBlocked).toBe(1);
    expect(packageJson.agentContract.readOrder).toEqual([
      'summary',
      'agentContract',
      'repairActionQueue[]',
      'tasks[]',
      'tasks[].evidence',
      'tasks[].recommendedFix',
      'tasks[].verification.commands',
      'maintainerReview',
      'verificationChecklist',
      'redaction'
    ]);
    expect(packageJson.repairActionQueue.map((item) => item.sourceType)).toEqual(expect.arrayContaining([
      'environment_blocker',
      'acceptance_check_failure',
      'command_failure'
    ]));
    expect(packageJson.repairActionQueue.flatMap((item) => item.verificationCommands)).toContain('pnpm test -- --runInBand');
    expect(packageJson.maintainerReview.requiredBefore).toContain('changing target repository files');
    expect(packageJson.verificationChecklist.commands).toContain('pnpm test -- --runInBand');
    expect(packageJson.verificationChecklist.completionSignals).toContain('Maintainer review decision is recorded before any target repo write.');
    expect(packageJson.redaction.prohibitedContent).toContain('tokens');
    expect(packageText).not.toContain('ghp_real_secret_token');
    expect(packageText).not.toContain('sessionid=private');
    expect(markdown).toContain('## AI IDE Repair Decision Contract');
    expect(markdown).toContain('## Repair Action Queue');
    expect(markdown).toContain('## Maintainer Review Boundary');
    expect(verificationPlan).toContain('pnpm test -- --runInBand');
    expect(await readFile(targetSourcePath, 'utf8')).toBe(beforeTargetSource);
    expect((await stat(targetSourcePath)).mtimeMs).toBe(beforeTargetSourceStat.mtimeMs);
  });
});
