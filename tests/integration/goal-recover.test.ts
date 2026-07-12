import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const SCRIPT_TEST_TIMEOUT_MS = 30_000;

describe('blocked goal recovery package script', () => {
  it('generates a recovery package from one local blocked goal directory', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-goal-recover-'));
    const secretRoot = join(root, 'goal-TOKEN=secret-value');

    await mkdir(secretRoot, { recursive: true });
    await writeFile(
      join(secretRoot, 'blocked-goal-recovery-input.json'),
      `${JSON.stringify(buildRecoveryInput(), null, 2)}\n`
    );

    const { stdout, stderr } = await execFileAsync(
      'pnpm',
      [
        'goal:recover',
        '--',
        '--from-dir',
        secretRoot
      ],
      { cwd: process.cwd(), timeout: SCRIPT_TEST_TIMEOUT_MS }
    );
    const jsonPath = join(secretRoot, 'blocked-goal-recovery-package.json');
    const markdownPath = join(secretRoot, 'blocked-goal-recovery-package.md');
    const json = await readFile(jsonPath, 'utf8');
    const markdown = await readFile(markdownPath, 'utf8');
    const recoveryPackage = JSON.parse(json) as {
      schemaVersion: string;
      recoveryStatus: string;
      blockerSummary: { totalBlockers: number; automaticRecoveryActions: number };
      automaticRecoveryActions: Array<{ command: string }>;
      blockedActions: string[];
    };

    expect(stderr).toBe('');
    expect(stdout).toContain(`Wrote ${jsonPath}`);
    expect(stdout).toContain(`Wrote ${markdownPath}`);
    expect(recoveryPackage.schemaVersion).toBe('repoassure.blocked-goal-recovery-package.v1');
    expect(recoveryPackage.recoveryStatus).toBe('requires_maintainer_or_external_action');
    expect(recoveryPackage.blockerSummary).toMatchObject({
      totalBlockers: 2,
      automaticRecoveryActions: 1
    });
    expect(recoveryPackage.automaticRecoveryActions).toEqual([
      expect.objectContaining({
        command: 'pnpm test -- --testTimeout=15000'
      })
    ]);
    expect(recoveryPackage.blockedActions).toContain('target_repo_pull_request_creation');
    expect(recoveryPackage.blockedActions).toContain('public_launch');
    expect(markdown).toContain('# RepoAssure Blocked Goal Recovery Package');
    expect(markdown).toContain('## Maintainer Decision Requests');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  }, SCRIPT_TEST_TIMEOUT_MS);

  it('reports documented CLI flags when required input is missing', async () => {
    await expect(execFileAsync(
      'node',
      [
        'scripts/generate-blocked-goal-recovery-package.mjs',
        '--output',
        'artifacts/blocked-goal'
      ],
      { cwd: process.cwd(), timeout: SCRIPT_TEST_TIMEOUT_MS }
    )).rejects.toMatchObject({
      stderr: expect.stringContaining('--input or --from-dir is required')
    });
  }, SCRIPT_TEST_TIMEOUT_MS);
});

function buildRecoveryInput() {
  return {
    sourceGoal: {
      title: 'Fixture blocked goal',
      status: 'blocked',
      objective: 'Recover a fixture goal without leaking TOKEN=secret-value.',
      evidenceRefs: ['docs/logs/blockers.md']
    },
    sourceAudit: {
      path: 'docs/acceptance/goal-completion-audit.md',
      status: 'blocked_or_incomplete',
      summary: 'Fixture audit is incomplete.'
    },
    sourceLogs: [
      {
        path: 'docs/logs/blockers.md',
        summary: 'Fixture blockers were recorded.'
      }
    ],
    blockers: [
      {
        blockerId: 'B1-test-timeout',
        category: 'test_instability',
        status: 'retryable',
        summary: 'A slow test exceeded default timeout.',
        attemptedActions: ['Ran full test once.'],
        evidenceRefs: ['Test timed out in 5000ms.'],
        automaticRecoveryActions: [
          {
            actionId: 'A1-rerun-timeout',
            command: 'pnpm test -- --testTimeout=15000',
            rationale: 'Rerun with integration timeout profile.'
          }
        ]
      },
      {
        blockerId: 'B2-maintainer-decision',
        category: 'maintainer_decision_required',
        status: 'blocked',
        summary: 'Maintainer must choose whether to accept risk.',
        attemptedActions: ['Recorded decision options.'],
        evidenceRefs: ['docs/logs/decision-log.md'],
        maintainerDecisionRequests: [
          {
            requestedDecision: 'Approve, defer, or accept risk for the blocked goal.',
            options: ['approve', 'defer', 'accept_risk']
          }
        ]
      }
    ],
    resumeCommands: [
      {
        command: 'codex resume goal',
        purpose: 'Resume after maintainer decision.'
      }
    ],
    redactionBoundary: 'Use sanitized local summaries only.'
  };
}
