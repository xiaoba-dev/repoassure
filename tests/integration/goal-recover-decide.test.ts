import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

import { buildBlockedGoalRecoveryConsumptionReport } from '../../packages/acceptance/src/blocked-goal-recovery-consumption-report.js';
import { buildBlockedGoalRecoveryPackage } from '../../packages/acceptance/src/blocked-goal-recovery-package.js';

const execFileAsync = promisify(execFile);
const TIMEOUT_MS = 30_000;

describe('blocked goal recovery decision receipt script', () => {
  it('writes a local decision receipt without executing resume commands', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-goal-recover-decide-'));
    const secretRoot = join(root, 'goal-TOKEN=secret-value');
    await mkdir(secretRoot, { recursive: true });
    const report = buildReport();
    await writeFile(join(secretRoot, 'blocked-goal-recovery-consumption-report.json'), `${JSON.stringify(report, null, 2)}\n`);
    await writeFile(join(secretRoot, 'blocked-goal-recovery-decisions.json'), `${JSON.stringify({
      decisions: report.actionQueue.map((action) => ({
        actionKey: action.actionKey,
        decision: 'approve',
        evidence: 'Reviewed locally.',
        reviewerRole: 'maintainer'
      }))
    }, null, 2)}\n`);

    const { stdout, stderr } = await execFileAsync(
      'pnpm',
      ['--silent', 'goal:recover:decide', '--', '--from-dir', secretRoot],
      { cwd: process.cwd(), timeout: TIMEOUT_MS }
    );
    const json = await readFile(join(secretRoot, 'blocked-goal-recovery-decision-receipt.json'), 'utf8');
    const markdown = await readFile(join(secretRoot, 'blocked-goal-recovery-decision-receipt.md'), 'utf8');
    const receipt = JSON.parse(json) as {
      schemaVersion: string;
      decisionStatus: string;
      boundaryCompliance: { resumeCommandsExecuted: boolean };
    };

    expect(stderr).toBe('');
    expect(stdout).toContain('blocked-goal-recovery-decision-receipt.json');
    expect(stdout).not.toContain('secret-value');
    expect(receipt.schemaVersion).toBe('repoassure.blocked-goal-recovery-decision-receipt.v1');
    expect(receipt.decisionStatus).toBe('approved_for_separate_resume_attempt');
    expect(receipt.boundaryCompliance.resumeCommandsExecuted).toBe(false);
    expect(markdown).toContain('## Recovery Decisions');
    expect(markdown).toContain('Executed |');
    expect(json).not.toContain('secret-value');
  }, TIMEOUT_MS);
});

function buildReport() {
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
  return buildBlockedGoalRecoveryConsumptionReport({
    packagePath: 'blocked-goal-recovery-package.json',
    sourcePackageText: JSON.stringify(recoveryPackage),
    recoveryPackage
  });
}
