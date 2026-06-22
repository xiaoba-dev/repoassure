import { chmod, mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildRepairExecutionReport,
  formatRepairExecutionReportMarkdown,
  parseRepairExecuteArgs,
  runRepairExecute
} from '../../packages/acceptance/src/run-repair-execute.js';
import type { RepairHandoffPackage } from '../../packages/acceptance/src/run-repair-handoff.js';

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
      highestPriority: 'P1'
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
});
