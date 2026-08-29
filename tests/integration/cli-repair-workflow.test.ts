import { mkdtemp, readFile, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runCli } from '../../src/adapters/cli/run.js';

interface CliResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

async function runCliForTest(args: string[]): Promise<CliResult> {
  let stdout = '';
  let stderr = '';
  const exitCode = await runCli(args, {
    writeStdout: (chunk) => {
      stdout += chunk;
    },
    writeStderr: (chunk) => {
      stderr += chunk;
    }
  });

  return { exitCode, stdout, stderr };
}

describe('repair workflow CLI', () => {
  it('generates the complete no-write repair evidence chain', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'repoassure-repair-cli-'));
    const runDir = join(repoRoot, '.hardening', 'runs', 'run-cli-repair');
    const sentinelPath = join(repoRoot, 'sentinel.txt');
    const handoffOutput = join(runDir, 'repair');
    const dryRunOutput = join(handoffOutput, 'dry-run');
    const validationOutput = join(handoffOutput, 'validation-only');
    const patchOutput = join(handoffOutput, 'patch-plan');

    await mkdir(runDir, { recursive: true });
    await writeFile(sentinelPath, 'do not change\n');
    await writeFile(join(runDir, 'manifest.json'), `${JSON.stringify({
      schemaVersion: 1,
      mode: 'cli',
      runId: 'run-cli-repair',
      repoRoot,
      artifacts: {
        report: join(runDir, 'hardening-report.md'),
        redactedCredential: 'API_KEY=sk-repair-cli-secret'
      },
      commandResults: [{
        command: 'node',
        args: ['--version'],
        exitCode: 1,
        stdout: '',
        stderr: 'API_KEY=sk-repair-cli-secret',
        timedOut: false
      }],
      checks: []
    }, null, 2)}\n`);

    const handoffResult = await runCliForTest([
      'repair',
      'handoff',
      '--run',
      runDir,
      '--output',
      handoffOutput
    ]);
    expect(handoffResult).toMatchObject({ exitCode: 0, stderr: '' });
    const handoff = JSON.parse(handoffResult.stdout) as {
      packagePath: string;
      taskCount: number;
    };
    const handoffPackage = JSON.parse(await readFile(handoff.packagePath, 'utf8')) as {
      agentContract: {
        readOrder: string[];
        nextCommands: { dryRun: string; validationOnly: string; patchPlan: string };
        boundaries: string[];
      };
      boundaries?: string[];
      noWriteProof?: unknown;
      tasks: Array<{ taskId: string }>;
    };
    const taskId = handoffPackage.tasks[0]?.taskId;

    expect(handoff.taskCount).toBe(1);
    expect(taskId).toBeTruthy();
    expect(handoffPackage.agentContract.readOrder).toContain('tasks[]');
    expect(handoffPackage.agentContract.nextCommands).toEqual({
      dryRun: 'pnpm repair:execute -- --package <repair-handoff-package.json> --task <taskId> --dry-run',
      validationOnly: 'pnpm repair:execute -- --package <repair-handoff-package.json> --task <taskId> --validation-only',
      patchPlan: 'pnpm repair:patch-plan -- --report <repair-execution-report.json>'
    });
    expect(handoffPackage.agentContract.boundaries).toContain('Does not modify target repository files.');
    expect(await readFile(handoff.packagePath, 'utf8')).not.toContain('sk-repair-cli-secret');

    const dryRunResult = await runCliForTest([
      'repair',
      'execute',
      '--package',
      handoff.packagePath,
      '--task',
      taskId ?? '',
      '--dry-run',
      '--output',
      dryRunOutput
    ]);
    expect(dryRunResult).toMatchObject({ exitCode: 0, stderr: '' });
    const dryRun = JSON.parse(dryRunResult.stdout) as { reportPath: string; status: string };
    const dryRunReport = JSON.parse(await readFile(dryRun.reportPath, 'utf8')) as {
      mode: string;
      agentContract: { boundaries: string[] };
    };
    expect(dryRun.status).toBe('planned');
    expect(dryRunReport.mode).toBe('dry-run');
    expect(dryRunReport.agentContract.boundaries.join(' ')).toContain('does not modify target repository files');

    const validationResult = await runCliForTest([
      'repair',
      'execute',
      '--package',
      handoff.packagePath,
      '--task',
      taskId ?? '',
      '--validation-only',
      '--output',
      validationOutput
    ]);
    expect(validationResult).toMatchObject({ exitCode: 0, stderr: '' });
    const validation = JSON.parse(validationResult.stdout) as { reportPath: string; status: string };
    expect(validation.status).toBe('passed');

    const patchResult = await runCliForTest([
      'repair',
      'patch-plan',
      '--report',
      dryRun.reportPath,
      '--output',
      patchOutput
    ]);
    expect(patchResult).toMatchObject({ exitCode: 0, stderr: '' });
    const patchPlan = JSON.parse(patchResult.stdout) as { planPath: string };
    const patchPlanDocument = JSON.parse(await readFile(patchPlan.planPath, 'utf8')) as {
      boundaries: string[];
    };
    expect(patchPlanDocument.boundaries).toContain('This patch plan does not modify target repository files.');

    await expect(readFile(sentinelPath, 'utf8')).resolves.toBe('do not change\n');
  });
});
