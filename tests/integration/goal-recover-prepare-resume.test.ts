import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

import { buildBlockedGoalRecoveryConsumptionReport } from '../../packages/acceptance/src/blocked-goal-recovery-consumption-report.js';
import { buildBlockedGoalRecoveryDecisionReceipt } from '../../packages/acceptance/src/blocked-goal-recovery-decision-receipt.js';
import { buildBlockedGoalRecoveryPackage } from '../../packages/acceptance/src/blocked-goal-recovery-package.js';

const execFileAsync = promisify(execFile);
const TIMEOUT_MS = 30_000;

describe('blocked goal recovery prepare resume script', () => {
  it('writes a bounded resume attempt task package without executing commands', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-goal-recover-prepare-resume-'));
    const secretRoot = join(root, 'goal-TOKEN=secret-value');
    await mkdir(secretRoot, { recursive: true });
    const receipt = buildReceipt();
    const receiptText = `${JSON.stringify(receipt, null, 2)}\n`;
    await writeFile(
      join(secretRoot, 'blocked-goal-recovery-decision-receipt.json'),
      receiptText
    );
    await writeFile(join(secretRoot, 'blocked-goal-recovery-resume-attempt-task-input.json'), `${JSON.stringify({
      sourceDecisionReceiptSha256: createHash('sha256').update(receiptText).digest('hex')
    }, null, 2)}\n`);

    const { stdout, stderr } = await execFileAsync(
      'pnpm',
      ['--silent', 'goal:recover:prepare-resume', '--', '--from-dir', secretRoot],
      { cwd: process.cwd(), timeout: TIMEOUT_MS }
    );
    const json = await readFile(
      join(secretRoot, 'blocked-goal-recovery-resume-attempt-task-package.json'),
      'utf8'
    );
    const markdown = await readFile(
      join(secretRoot, 'blocked-goal-recovery-resume-attempt-task-package.md'),
      'utf8'
    );
    const taskPackage = JSON.parse(json) as {
      schemaVersion: string;
      taskPackageStatus: string;
      actionTasks: Array<{ order: number }>;
      resumeCommandTasks: Array<{ executed: boolean }>;
      boundaryCompliance: { commandsExecuted: boolean };
    };

    expect(stderr).toBe('');
    expect(stdout).toContain('blocked-goal-recovery-resume-attempt-task-package.json');
    expect(stdout).not.toContain('secret-value');
    expect(taskPackage.schemaVersion).toBe('repoassure.blocked-goal-recovery-resume-attempt-task-package.v1');
    expect(taskPackage.taskPackageStatus).toBe('ready_for_separate_resume_attempt');
    expect(taskPackage.actionTasks.map((item) => item.order)).toEqual([1]);
    expect(taskPackage.resumeCommandTasks).toEqual([expect.objectContaining({ executed: false })]);
    expect(taskPackage.boundaryCompliance.commandsExecuted).toBe(false);
    expect(markdown).toContain('## Resume Command Tasks');
    expect(json).not.toContain('secret-value');
  }, TIMEOUT_MS);

  it('redacts secret-like input paths from CLI failures', async () => {
    await expect(execFileAsync(
      'node',
      [
        'scripts/generate-blocked-goal-recovery-resume-attempt-task-package.mjs',
        '--from-dir',
        '/private/tmp/goal-TOKEN=secret-value/missing'
      ],
      { cwd: process.cwd(), timeout: TIMEOUT_MS }
    )).rejects.toMatchObject({
      stderr: expect.stringMatching(/^(?![\s\S]*secret-value)(?=[\s\S]*ENOENT)(?=[\s\S]*TOKEN=\[REDACTED\])[\s\S]*$/u)
    });
  }, TIMEOUT_MS);
});

function buildReceipt() {
  const recoveryPackage = buildBlockedGoalRecoveryPackage({
    inputPath: 'blocked-goal-recovery-input.json',
    input: {
      sourceGoal: { title: 'Fixture', status: 'blocked', objective: 'Resume safely.' },
      blockers: [{
        blockerId: 'B1', category: 'test_instability', status: 'retryable', summary: 'Retry.',
        automaticRecoveryActions: [{ actionId: 'A1', command: 'pnpm test', rationale: 'Reviewed retry.' }]
      }],
      resumeCommands: [{ command: 'codex resume goal', purpose: 'Resume after review.' }],
      redactionBoundary: 'Use sanitized evidence.'
    }
  });
  const report = buildBlockedGoalRecoveryConsumptionReport({
    packagePath: 'blocked-goal-recovery-package.json',
    sourcePackageText: JSON.stringify(recoveryPackage),
    recoveryPackage
  });
  const reportText = JSON.stringify(report);
  return buildBlockedGoalRecoveryDecisionReceipt({
    consumptionReportPath: 'blocked-goal-recovery-consumption-report.json',
    sourceConsumptionReportText: reportText,
    reviewedSourceSha256: createHash('sha256').update(reportText).digest('hex'),
    consumptionReport: report,
    decisions: report.actionQueue.map((item) => ({
      actionKey: item.actionKey,
      decision: 'approve',
      evidence: 'Reviewed locally.',
      reviewerRole: 'maintainer'
    })),
    resumeCommandDecisions: report.resumeCommands.map((item) => ({
      commandId: item.commandId,
      decision: 'approve',
      evidence: 'Resume command reviewed locally.',
      reviewerRole: 'maintainer'
    }))
  });
}
