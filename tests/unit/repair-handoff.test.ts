import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
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
      highestPriority: 'P1'
    });
    expect(pkg.agentContract).toMatchObject({
      schema: 'repoassure.repair-handoff.v1',
      primaryReadPath: '.hardening/latest/repair-handoff-package.json',
      nextCommands: {
        dryRun: 'pnpm repair:execute -- --package <repair-handoff-package.json> --task <taskId> --dry-run',
        validationOnly: 'pnpm repair:execute -- --package <repair-handoff-package.json> --task <taskId> --validation-only',
        patchPlan: 'pnpm repair:patch-plan -- --report <repair-execution-report.json>'
      }
    });
    expect(pkg.agentContract.boundaries).toContain('Does not modify target repository files.');
    expect(pkg.agentContract.boundaries).toContain('Does not auto-apply patches or edit target repository files without maintainer review.');
    expect(pkg.agentContract.readOrder).toContain('tasks[].verification.commands');
    expect(pkg.agentContract.readOrder).toContain('tasks[].actionability');
    expect(pkg.tasks.map((task) => task.taskId)).toEqual([
      'pycli-failed-ruff-check',
      'pycli-failed-mypy'
    ]);
    expect(pkg.tasks[0]?.objective).toContain('修复失败命令：ruff check .');
    expect(pkg.tasks[0]?.evidence.commandResult?.stdout).toContain('API_KEY=[REDACTED]');
    expect(pkg.tasks[0]?.evidence.commandResult?.stdout).not.toContain('sk-secret');
    expect(pkg.tasks[0]?.actionability).toMatchObject({
      dependencies: ['none'],
      patchApplicabilityEvidence: {
        requiresManualReview: true
      }
    });
    expect(pkg.tasks[0]?.actionability.suggestedVerificationCommands[0]).toEqual({
      command: 'ruff check .',
      purpose: 'Re-run the failed acceptance command after the minimal repair.',
      required: true
    });
    expect(pkg.tasks[0]?.actionability.patchApplicabilityEvidence.sourceEvidence.join('\n')).toContain('commandResult');
    expect(pkg.tasks[0]?.actionability.patchApplicabilityEvidence.targetAreas.join('\n')).toContain('command:ruff check .');
    expect(pkg.tasks[0]?.actionability.aiIdeExecutionPrompt).toContain('Do not auto-apply');
    expect(pkg.tasks[0]?.actionability.manualReviewBoundary.join('\n')).toContain('maintainer review');
    expect(pkg.tasks[0]?.actionability.riskNotes.join('\n')).toContain('ruff check .');
    expect(pkg.tasks[0]?.actionability.noAutoApplyBoundary.join('\n')).toContain('Do not auto-apply');
    expect(pkg.tasks[0]?.verification.commands).toContain('ruff check .');
    expect(pkg.tasks[0]?.handoffPrompt).toContain('你是接手目标 repo 的修复 Agent');
    expect(formatRepairHandoffMarkdown(pkg)).toContain('# Repair Handoff Package');
    expect(formatRepairHandoffMarkdown(pkg)).toContain('pycli-failed-ruff-check');
    expect(formatRepairHandoffMarkdown(pkg)).toContain('### Actionability');
    expect(formatRepairHandoffMarkdown(pkg)).toContain('Do not auto-apply');
    expect(formatVerificationPlanMarkdown(pkg)).toContain('# Verification Plan');
    expect(formatVerificationPlanMarkdown(pkg)).toContain('ruff check .');
    expect(formatVerificationPlanMarkdown(pkg)).toContain('mypy .');
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
});
