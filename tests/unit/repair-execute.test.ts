import { chmod, mkdir, mkdtemp, readFile, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildRepairExecutionReport,
  formatRepairExecutionReportMarkdown,
  parseRepairExecuteArgs,
  runRepairExecute
} from '../../packages/acceptance/src/run-repair-execute.js';
import {
  runRepairHandoff,
  type RepairHandoffPackage
} from '../../packages/acceptance/src/run-repair-handoff.js';

function buildPackage(repoRoot: string): RepairHandoffPackage {
  return {
    schemaVersion: 1,
    generatedAt: '2026-06-21T09:00:00.000Z',
    mode: 'cli',
    runId: 'run-fixed',
    repoRoot,
    runDir: join(repoRoot, '.hardening', 'runs', 'run-fixed'),
    sourceArtifacts: {},
    summary: {
      totalTasks: 2,
      failedCommands: 2,
      requiredFailed: 0,
      requiredBlocked: 0,
      highestPriority: 'P1'
    },
    agentContract: {
      schema: 'repoassure.repair-handoff.v1',
      primaryReadPath: '.hardening/latest/repair-handoff-package.json',
      readOrder: ['summary', 'tasks[]', 'tasks[].verification.commands'],
      maintainerReviewBoundary: {
        requiredBefore: [
          'applying patches',
          'changing target repository files',
          'creating branches, commits, issues, pull requests, or advisories',
          'marking acceptance as passed'
        ],
        allowedDecisions: ['approve', 'reject', 'defer', 'accept_risk']
      },
      nextCommands: {
        dryRun: 'hardening repair execute --package <repair-handoff-package.json> --task <taskId> --dry-run',
        validationOnly: 'hardening repair execute --package <repair-handoff-package.json> --task <taskId> --validation-only',
        patchPlan: 'hardening repair patch-plan --report <repair-execution-report.json>'
      },
      boundaries: ['Does not modify target repository files.']
    },
    repairActionQueue: [
      {
        taskId: 'pycli-failed-ruff-check',
        priority: 'P1',
        status: 'queued',
        objective: '修复失败命令：ruff check .',
        sourceType: 'command_failure',
        verificationCommands: ['ruff check .'],
        requiresMaintainerReview: true
      },
      {
        taskId: 'pycli-failed-mypy',
        priority: 'P1',
        status: 'queued',
        objective: '修复失败命令：mypy .',
        sourceType: 'command_failure',
        verificationCommands: ['mypy .'],
        requiresMaintainerReview: true
      }
    ],
    maintainerReview: {
      requiredBefore: [
        'applying patches',
        'changing target repository files',
        'creating branches, commits, issues, pull requests, or advisories',
        'marking acceptance as passed'
      ],
      allowedDecisions: ['approve', 'reject', 'defer', 'accept_risk']
    },
    verificationChecklist: {
      commands: ['ruff check .', 'mypy .'],
      acceptanceCriteria: ['pycli-failed-ruff-check: ruff exits zero', 'pycli-failed-mypy: mypy exits zero'],
      completionSignals: ['Maintainer review decision is recorded before any target repo write.']
    },
    redaction: {
      guarantee: 'All command output, evidence, paths, and prompts are redacted before entering this package.',
      prohibitedContent: ['secrets', 'tokens', 'cookies', 'private keys']
    },
    tasks: [
      {
        taskId: 'pycli-failed-ruff-check',
        priority: 'P1',
        sourceType: 'command_failure',
        objective: '修复失败命令：ruff check .',
        issue: { title: 'Command failed: ruff check .', mode: 'cli', command: 'ruff check .' },
        evidence: { sourceArtifacts: {} },
        impact: 'ruff failed',
        recommendedFix: {
          expectedOutcome: 'ruff passes',
          changeScope: { include: ['fix lint'], exclude: ['no unrelated refactor'] },
          implementationSteps: ['run ruff']
        },
        verification: {
          commands: ['ruff check .'],
          acceptanceCriteria: ['ruff exits zero']
        },
        risks: ['formatting can touch many files'],
        handoffPrompt: 'Fix ruff'
      },
      {
        taskId: 'pycli-failed-mypy',
        priority: 'P1',
        sourceType: 'command_failure',
        objective: '修复失败命令：mypy .',
        issue: { title: 'Command failed: mypy .', mode: 'cli', command: 'mypy .' },
        evidence: { sourceArtifacts: {} },
        impact: 'mypy failed',
        recommendedFix: {
          expectedOutcome: 'mypy passes',
          changeScope: { include: ['fix types'], exclude: ['no API rewrite'] },
          implementationSteps: ['run mypy']
        },
        verification: {
          commands: ['mypy .'],
          acceptanceCriteria: ['mypy exits zero']
        },
        risks: ['type fixes can change behavior'],
        handoffPrompt: 'Fix mypy'
      }
    ]
  };
}

describe('repair execute', () => {
  it('requires explicit task selection for execution commands', () => {
    expect(() => parseRepairExecuteArgs(['--package', '/tmp/repair-handoff-package.json']))
      .toThrow('--task <taskId> or --all is required');
    expect(parseRepairExecuteArgs(['--package', '/tmp/repair-handoff-package.json', '--task', 'pycli-failed-ruff-check', '--validation-only'])).toMatchObject({
      packagePath: expect.stringContaining('/tmp/repair-handoff-package.json'),
      taskIds: ['pycli-failed-ruff-check'],
      validationOnly: true
    });
  });

  it('builds a dry-run report without verification command results', () => {
    const pkg = buildPackage('/tmp/agent-reach');
    const report = buildRepairExecutionReport({
      generatedAt: '2026-06-21T10:00:00.000Z',
      packagePath: '/tmp/repair-handoff-package.json',
      mode: 'dry-run',
      pkg,
      selectedTaskIds: ['pycli-failed-ruff-check'],
      verificationResults: []
    });

    expect(report.status).toBe('planned');
    expect(report.summary).toEqual({
      selectedTasks: 1,
      verificationCommands: 0,
      passed: 0,
      failed: 0,
      skipped: 1
    });
    expect(report.agentContract).toMatchObject({
      schema: 'repoassure.repair-execution-report.v1',
      resultSemantics: {
        planned: 'No verification commands were run.',
        passed: 'All selected verification commands exited zero.',
        failed: 'At least one selected verification command failed or timed out.'
      },
      nextCommands: {
        patchPlan: 'hardening repair patch-plan --report <repair-execution-report.json>'
      }
    });
    expect(report.agentContract.boundaries).toContain('Validation-only mode does not modify target repository files.');
    expect(report.tasks[0]?.taskId).toBe('pycli-failed-ruff-check');
    expect(report.tasks[0]?.executionStatus).toBe('planned');
    expect(formatRepairExecutionReportMarkdown(report)).toContain('# Repair Execution Report');
    expect(formatRepairExecutionReportMarkdown(report)).toContain('pycli-failed-ruff-check');
  });

  it('runs selected validation commands and writes execution reports', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-repair-execute-repo-'));
    const binDir = join(repoRoot, 'bin');
    const packagePath = join(repoRoot, 'repair-handoff-package.json');
    const outputDir = join(repoRoot, 'execution');

    await mkdir(binDir, { recursive: true });
    await writeFile(join(binDir, 'ruff'), '#!/bin/sh\necho "Found 46 errors TOKEN=secret"\nexit 1\n');
    await chmod(join(binDir, 'ruff'), 0o755);
    await writeFile(packagePath, `${JSON.stringify(buildPackage(repoRoot), null, 2)}\n`);

    const result = await runRepairExecute({
      packagePath,
      taskIds: ['pycli-failed-ruff-check'],
      validationOnly: true,
      outputDir,
      generatedAt: '2026-06-21T10:00:00.000Z',
      timeoutMs: 10_000,
      maxOutputChars: 500,
      env: {
        ...process.env,
        PATH: `${binDir}:${process.env.PATH ?? ''}`
      }
    });

    expect(result.status).toBe('failed');
    await expect(readFile(result.reportPath, 'utf8')).resolves.toContain('"status": "failed"');
    await expect(readFile(result.markdownPath, 'utf8')).resolves.toContain('ruff check .');
    await expect(readFile(result.markdownPath, 'utf8')).resolves.toContain('TOKEN=[REDACTED]');
    await expect(readFile(result.markdownPath, 'utf8')).resolves.not.toContain('TOKEN=secret');
  });

  it('dry-runs a near-real repair decision package without writing target repo files', async () => {
    const fixtureManifest = JSON.parse(
      await readFile('fixtures/campaigns/ai-ide-repair-decision-package/manifest.json', 'utf8')
    ) as Record<string, unknown>;
    const targetRepo = await mkdtemp(join(tmpdir(), 'repoassure-ai-ide-repair-execute-target-'));
    const outputRoot = await mkdtemp(join(tmpdir(), 'repoassure-ai-ide-repair-execute-output-'));
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

    const handoff = await runRepairHandoff({
      runDir,
      generatedAt: '2026-07-16T13:00:00.000Z'
    });
    const handoffPackage = JSON.parse(await readFile(handoff.packagePath, 'utf8')) as RepairHandoffPackage;
    const queuedTaskIds = handoffPackage.repairActionQueue.map((item) => item.taskId);
    const result = await runRepairExecute({
      packagePath: handoff.packagePath,
      taskIds: queuedTaskIds,
      dryRun: true,
      outputDir: join(outputRoot, 'repair-execute'),
      generatedAt: '2026-07-16T13:05:00.000Z'
    });

    const reportText = await readFile(result.reportPath, 'utf8');
    const markdown = await readFile(result.markdownPath, 'utf8');
    const report = JSON.parse(reportText) as {
      mode: string;
      status: string;
      summary: { selectedTasks: number; skipped: number; verificationCommands: number };
      executionPlan: { readOrder: string[]; steps: string[] };
      patchPreview: { status: string; candidateTasks: Array<{ taskId: string; sourceType: string; expectedFiles: string[] }> };
      maintainerReview: { requiredBefore: string[]; allowedDecisions: string[] };
      verificationChecklist: { commands: string[]; completionSignals: string[] };
      noWriteProof: { targetRepoWriteAuthorized: boolean; sourceFilesChanged: boolean; prohibitedActions: string[] };
      tasks: Array<{ taskId: string; executionStatus: string; verificationCommands: string[] }>;
    };

    expect(result.status).toBe('planned');
    expect(report.mode).toBe('dry-run');
    expect(report.status).toBe('planned');
    expect(report.summary.selectedTasks).toBe(queuedTaskIds.length);
    expect(report.summary.skipped).toBe(queuedTaskIds.length);
    expect(report.summary.verificationCommands).toBe(0);
    expect(report.executionPlan.readOrder).toEqual([
      'summary',
      'executionPlan',
      'patchPreview',
      'tasks[]',
      'tasks[].verificationCommands',
      'maintainerReview',
      'verificationChecklist',
      'noWriteProof'
    ]);
    expect(report.executionPlan.steps).toContain('Review selected repairActionQueue tasks before any code change.');
    expect(report.patchPreview.status).toBe('preview_only');
    expect(report.patchPreview.candidateTasks.map((task) => task.sourceType)).toEqual(expect.arrayContaining([
      'environment_blocker',
      'acceptance_check_failure',
      'command_failure'
    ]));
    expect(report.patchPreview.candidateTasks.flatMap((task) => task.expectedFiles)).toContain('src/auth/password.js');
    expect(report.maintainerReview.requiredBefore).toContain('changing target repository files');
    expect(report.verificationChecklist.commands).toContain('pnpm test -- --runInBand');
    expect(report.verificationChecklist.completionSignals).toContain('Maintainer review decision is recorded before any target repo write.');
    expect(report.noWriteProof).toMatchObject({
      targetRepoWriteAuthorized: false,
      sourceFilesChanged: false
    });
    expect(report.noWriteProof.prohibitedActions).toContain('changing target repository files');
    expect(report.tasks.every((task) => task.executionStatus === 'planned')).toBe(true);
    expect(reportText).not.toContain('ghp_real_secret_token');
    expect(reportText).not.toContain('sessionid=private');
    expect(markdown).toContain('## Execution Plan');
    expect(markdown).toContain('## Patch Preview');
    expect(markdown).toContain('## Maintainer Review Boundary');
    expect(markdown).toContain('## Verification Checklist');
    expect(markdown).toContain('## No-write Proof');
    expect(await readFile(targetSourcePath, 'utf8')).toBe(beforeTargetSource);
    expect((await stat(targetSourcePath)).mtimeMs).toBe(beforeTargetSourceStat.mtimeMs);
  });

  it('runs validation-only near-real campaign commands while skipping placeholder checks without writing target repo files', async () => {
    const fixtureManifest = JSON.parse(
      await readFile('fixtures/campaigns/ai-ide-repair-decision-package/manifest.json', 'utf8')
    ) as Record<string, unknown>;
    const targetRepo = await mkdtemp(join(tmpdir(), 'repoassure-ai-ide-validation-target-'));
    const outputRoot = await mkdtemp(join(tmpdir(), 'repoassure-ai-ide-validation-output-'));
    const runDir = join(outputRoot, 'runs', 'campaign-run-001');
    const binDir = join(targetRepo, 'bin');
    const targetSourcePath = join(targetRepo, 'src', 'auth', 'password.js');

    await mkdir(join(targetRepo, 'src', 'auth'), { recursive: true });
    await mkdir(runDir, { recursive: true });
    await mkdir(binDir, { recursive: true });
    await writeFile(targetSourcePath, 'module.exports = { hash: "sha1" };\n');
    await writeFile(join(runDir, 'manifest.json'), JSON.stringify({
      ...fixtureManifest,
      repoRoot: targetRepo,
      runId: 'campaign-run-001'
    }, null, 2));
    await writeFile(join(binDir, 'pnpm'), [
      '#!/bin/sh',
      'printf "%s\\n" "$*" >> "$REPOASSURE_COMMAND_LOG"',
      'case "$*" in',
      '  "test -- --runInBand") echo "tests passed"; exit 0 ;;',
      '  "lint") echo "src/auth/password.js:42 weak hash algorithm TOKEN=secret" >&2; exit 1 ;;',
      '  *) echo "unexpected command: $*" >&2; exit 99 ;;',
      'esac',
      ''
    ].join('\n'));
    await chmod(join(binDir, 'pnpm'), 0o755);
    const commandLogPath = join(outputRoot, 'commands.log');
    const beforeTargetSource = await readFile(targetSourcePath, 'utf8');
    const beforeTargetSourceStat = await stat(targetSourcePath);

    const handoff = await runRepairHandoff({
      runDir,
      generatedAt: '2026-07-16T15:30:00.000Z'
    });
    const handoffPackage = JSON.parse(await readFile(handoff.packagePath, 'utf8')) as RepairHandoffPackage;
    const queuedTaskIds = handoffPackage.repairActionQueue.map((item) => item.taskId);
    const result = await runRepairExecute({
      packagePath: handoff.packagePath,
      taskIds: queuedTaskIds,
      validationOnly: true,
      outputDir: join(outputRoot, 'repair-execute-validation'),
      generatedAt: '2026-07-16T15:35:00.000Z',
      timeoutMs: 10_000,
      maxOutputChars: 500,
      env: {
        ...process.env,
        PATH: `${binDir}:${process.env.PATH ?? ''}`,
        REPOASSURE_COMMAND_LOG: commandLogPath
      }
    });

    const reportText = await readFile(result.reportPath, 'utf8');
    const markdown = await readFile(result.markdownPath, 'utf8');
    const report = JSON.parse(reportText) as {
      mode: string;
      status: string;
      summary: { selectedTasks: number; verificationCommands: number; passed: number; failed: number; skipped: number };
      noWriteProof: { targetRepoWriteAuthorized: boolean; sourceFilesChanged: boolean; prohibitedActions: string[] };
      tasks: Array<{
        taskId: string;
        sourceType: string;
        executionStatus: string;
        verificationCommands: string[];
        verificationResults: Array<{ command: string; exitCode: number | null; stdout: string; stderr: string }>;
        nextAction: string;
      }>;
    };
    const commandLog = await readFile(commandLogPath, 'utf8');

    expect(result.status).toBe('failed');
    expect(report.mode).toBe('validation-only');
    expect(report.status).toBe('failed');
    expect(report.summary).toMatchObject({
      selectedTasks: queuedTaskIds.length,
      verificationCommands: 2,
      passed: 1,
      failed: 1,
      skipped: 2
    });
    expect(report.tasks.filter((task) => task.executionStatus === 'passed')).toHaveLength(1);
    expect(report.tasks.filter((task) => task.executionStatus === 'failed')).toHaveLength(1);
    expect(report.tasks.filter((task) => task.executionStatus === 'skipped')).toHaveLength(2);
    expect(report.tasks.find((task) => task.executionStatus === 'failed')?.verificationResults[0]?.stderr)
      .toContain('TOKEN=[REDACTED]');
    expect(report.tasks.filter((task) => task.executionStatus === 'skipped').every((task) => task.verificationResults.length === 0)).toBe(true);
    expect(report.tasks.filter((task) => task.executionStatus === 'skipped').every((task) => task.nextAction.includes('placeholder'))).toBe(true);
    expect(commandLog).toContain('test -- --runInBand');
    expect(commandLog).toContain('lint');
    expect(commandLog).not.toContain('user:accept');
    expect(report.noWriteProof).toMatchObject({
      targetRepoWriteAuthorized: false,
      sourceFilesChanged: false
    });
    expect(report.noWriteProof.prohibitedActions).toContain('changing target repository files');
    expect(reportText).not.toContain('TOKEN=secret');
    expect(reportText).not.toContain('ghp_real_secret_token');
    expect(reportText).not.toContain('sessionid=private');
    expect(markdown).toContain('passed');
    expect(markdown).toContain('failed');
    expect(markdown).toContain('skipped');
    expect(markdown).toContain('TOKEN=[REDACTED]');
    expect(await readFile(targetSourcePath, 'utf8')).toBe(beforeTargetSource);
    expect((await stat(targetSourcePath)).mtimeMs).toBe(beforeTargetSourceStat.mtimeMs);
  });
});
