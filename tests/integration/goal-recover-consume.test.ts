import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

import { buildBlockedGoalRecoveryPackage } from '../../packages/acceptance/src/blocked-goal-recovery-package.js';

const execFileAsync = promisify(execFile);
const SCRIPT_TEST_TIMEOUT_MS = 30_000;

describe('blocked goal recovery consumption script', () => {
  it('generates a bounded consumption report from one recovery directory', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-goal-recover-consume-'));
    const secretRoot = join(root, 'goal-TOKEN=secret-value');
    const packagePath = join(secretRoot, 'blocked-goal-recovery-package.json');

    await mkdir(secretRoot, { recursive: true });
    await writeFile(packagePath, `${JSON.stringify(buildRecoveryPackage(), null, 2)}\n`);

    const { stdout, stderr } = await execFileAsync(
      'pnpm',
      ['--silent', 'goal:recover:consume', '--', '--from-dir', secretRoot],
      { cwd: process.cwd(), timeout: SCRIPT_TEST_TIMEOUT_MS }
    );
    const jsonPath = join(secretRoot, 'blocked-goal-recovery-consumption-report.json');
    const markdownPath = join(secretRoot, 'blocked-goal-recovery-consumption-report.md');
    const json = await readFile(jsonPath, 'utf8');
    const markdown = await readFile(markdownPath, 'utf8');
    const report = JSON.parse(json) as {
      schemaVersion: string;
      resumeReadiness: string;
      actionQueue: Array<{ actionType: string }>;
      boundaryCompliance: { recoveryCommandsExecuted: boolean };
      blockedActions: string[];
    };

    expect(stderr).toBe('');
    expect(stdout).toContain('Wrote ');
    expect(stdout).toContain('blocked-goal-recovery-consumption-report.json');
    expect(stdout).toContain('blocked-goal-recovery-consumption-report.md');
    expect(stdout).not.toContain('secret-value');
    expect(report.schemaVersion).toBe('repoassure.blocked-goal-recovery-consumption-report.v1');
    expect(report.resumeReadiness).toBe('waiting_for_maintainer_or_external_action');
    expect(report.actionQueue.map((item) => item.actionType)).toEqual([
      'automatic_retry_candidate',
      'maintainer_decision_required'
    ]);
    expect(report.boundaryCompliance.recoveryCommandsExecuted).toBe(false);
    expect(report.blockedActions).toContain('target_repo_pull_request_creation');
    expect(markdown).toContain('## Recovery Action Queue');
    expect(markdown).toContain('## Resume Checklist');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  }, SCRIPT_TEST_TIMEOUT_MS);

  it('redacts secret-like package paths from CLI errors', async () => {
    await expect(execFileAsync(
      'node',
      [
        'scripts/generate-blocked-goal-recovery-consumption-report.mjs',
        '--package',
        '/private/tmp/goal-TOKEN=secret-value/missing.json',
        '--output',
        '/private/tmp/recovery-output'
      ],
      { cwd: process.cwd(), timeout: SCRIPT_TEST_TIMEOUT_MS }
    )).rejects.toMatchObject({
      stderr: expect.not.stringContaining('secret-value')
    });
  }, SCRIPT_TEST_TIMEOUT_MS);

  it('reports documented CLI flags when the recovery package is missing', async () => {
    await expect(execFileAsync(
      'node',
      ['scripts/generate-blocked-goal-recovery-consumption-report.mjs', '--output', 'artifacts/recovery'],
      { cwd: process.cwd(), timeout: SCRIPT_TEST_TIMEOUT_MS }
    )).rejects.toMatchObject({
      stderr: expect.stringContaining('--package or --from-dir is required')
    });
  }, SCRIPT_TEST_TIMEOUT_MS);
});

function buildRecoveryPackage() {
  return buildBlockedGoalRecoveryPackage({
    generatedAt: '2026-07-13T00:30:00.000Z',
    inputPath: '/private/tmp/goal-TOKEN=secret-value/blocked-goal-recovery-input.json',
    input: {
      sourceGoal: {
        title: 'Fixture blocked goal',
        status: 'blocked',
        objective: 'Resume a fixture goal from sanitized evidence.',
        evidenceRefs: ['docs/goals/active/fixture.md']
      },
      sourceAudit: {
        path: 'docs/acceptance/goal-completion-audit.md',
        status: 'blocked_or_incomplete',
        summary: 'Fixture recovery remains gated.'
      },
      sourceLogs: [{ path: 'docs/logs/blockers.md', summary: 'Fixture blockers are recorded.' }],
      blockers: [
        {
          blockerId: 'B1-test-timeout',
          category: 'test_instability',
          status: 'retryable',
          summary: 'A test exceeded its timeout.',
          automaticRecoveryActions: [{
            actionId: 'A1-rerun',
            command: 'pnpm test -- --testTimeout=15000',
            rationale: 'Rerun with the reviewed timeout.'
          }]
        },
        {
          blockerId: 'B2-review',
          category: 'maintainer_decision_required',
          status: 'blocked',
          summary: 'Maintainer review is required.',
          maintainerDecisionRequests: [{
            requestedDecision: 'Approve, defer, or accept risk.',
            options: ['approve', 'defer', 'accept_risk']
          }]
        }
      ],
      resumeCommands: [{ command: 'codex resume goal', purpose: 'Resume after review.' }],
      redactionBoundary: 'Use sanitized local summaries only.'
    }
  });
}
