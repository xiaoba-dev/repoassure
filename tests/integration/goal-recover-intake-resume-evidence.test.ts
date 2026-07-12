import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

import { BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS } from '../../packages/acceptance/src/blocked-goal-recovery-package.js';
import type { BlockedGoalRecoveryResumeAttemptTaskPackage } from '../../packages/acceptance/src/blocked-goal-recovery-resume-attempt-task-package.js';

const execFileAsync = promisify(execFile);
const TIMEOUT_MS = 30_000;

describe('blocked goal recovery resume evidence intake script', () => {
  it('writes local intake artifacts without executing task commands', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-resume-evidence-cli-'));
    const inputDir = join(root, 'TOKEN=secret-value');
    await mkdir(inputDir, { recursive: true });
    const taskText = `${JSON.stringify(buildTaskPackage(), null, 2)}\n`;
    await writeFile(join(inputDir, 'blocked-goal-recovery-resume-attempt-task-package.json'), taskText);
    await writeFile(join(inputDir, 'blocked-goal-recovery-resume-attempt-execution-evidence-input.json'), `${JSON.stringify({
      sourceTaskPackageSha256: createHash('sha256').update(taskText).digest('hex'),
      attemptId: 'attempt-1', startedAt: '2026-07-13T05:40:00.000Z', completedAt: '2026-07-13T05:41:00.000Z',
      actionResults: [{ actionKey: 'automatic:B1:A1', status: 'passed', summary: 'Passed.', evidenceRefs: ['evidence/action.log'] }],
      resumeCommandResults: [{ commandId: 'resume-1', status: 'passed', exitCode: 0, summary: 'Passed.', evidenceRefs: ['evidence/resume.log'] }],
      verificationResults: [{ checkId: 'tests', status: 'passed', summary: 'Passed.', evidenceRefs: ['evidence/tests.log'] }],
      boundaryEvidence: { unlistedCommandsExecuted: false, blockedActionsPreserved: true, targetRepoMutationByRepoAssure: false },
      redactionBoundary: 'Sanitized evidence only.'
    }, null, 2)}\n`);

    const { stdout, stderr } = await execFileAsync('pnpm', [
      '--silent', 'goal:recover:intake-resume-evidence', '--', '--from-dir', inputDir
    ], { cwd: process.cwd(), timeout: TIMEOUT_MS });
    const json = await readFile(join(inputDir, 'blocked-goal-recovery-resume-attempt-execution-evidence-intake.json'), 'utf8');
    const intake = JSON.parse(json) as { schemaVersion: string; intakeStatus: string; boundaryCompliance: { commandsExecutedByIntake: boolean } };

    expect(stderr).toBe('');
    expect(stdout).not.toContain('secret-value');
    expect(intake.schemaVersion).toBe('repoassure.blocked-goal-recovery-resume-attempt-execution-evidence-intake.v1');
    expect(intake.intakeStatus).toBe('complete_for_maintainer_review');
    expect(intake.boundaryCompliance.commandsExecutedByIntake).toBe(false);
    expect(json).not.toContain('secret-value');
  }, TIMEOUT_MS);

  it('redacts missing secret-like paths from failures', async () => {
    await expect(execFileAsync('node', [
      'scripts/generate-blocked-goal-recovery-resume-attempt-execution-evidence-intake.mjs',
      '--from-dir', '/private/tmp/TOKEN=secret-value/missing'
    ], { cwd: process.cwd(), timeout: TIMEOUT_MS })).rejects.toMatchObject({
      stderr: expect.stringMatching(/^(?![\s\S]*secret-value)(?=[\s\S]*ENOENT)(?=[\s\S]*TOKEN=\[REDACTED\])[\s\S]*$/u)
    });
  }, TIMEOUT_MS);
});

function buildTaskPackage(): BlockedGoalRecoveryResumeAttemptTaskPackage {
  return {
    schemaVersion: 'repoassure.blocked-goal-recovery-resume-attempt-task-package.v1', generatedAt: '2026-07-13T05:39:00.000Z',
    taskPackageStatus: 'ready_for_separate_resume_attempt',
    sourceDecisionReceipt: { schemaVersion: 'repoassure.blocked-goal-recovery-decision-receipt.v1', fileName: 'receipt.json', path: 'receipt.json', sha256: 'a'.repeat(64), decisionStatus: 'approved_for_separate_resume_attempt', resumeAttemptReadiness: 'ready_for_separate_resume_attempt' },
    blockedReasons: [],
    actionTasks: [{ order: 1, actionKey: 'automatic:B1:A1', blockerId: 'B1', actionType: 'automatic_retry_candidate', instruction: 'pnpm test', context: 'Retry.', sourceDecision: 'approve', sourceEvidence: 'Reviewed.', executionMode: 'separate_reviewed_attempt' }],
    resumeCommandTasks: [{ order: 1, commandId: 'resume-1', command: 'codex resume goal', purpose: 'Resume.', sourceDecision: 'approve', sourceEvidence: 'Reviewed.', executionMode: 'separate_reviewed_attempt', executed: false }],
    prerequisites: ['Isolated worktree.'], verificationChecklist: ['Run tests.'], excludedItems: [],
    boundaryCompliance: { commandsExecuted: false, sourceBoundaryPreserved: true }, maintainerReviewBoundary: 'Separate attempt.',
    redactionBoundary: 'Sanitized evidence only.', nonAuthorizationBoundary: 'No external authorization.',
    blockedActions: [...BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS]
  };
}
