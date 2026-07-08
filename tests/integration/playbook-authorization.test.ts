import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const SCRIPT_TEST_TIMEOUT_MS = 30_000;

describe('target repo repair goal authorization receipt script', () => {
  it('generates an authorization receipt from one local proposal package directory', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-playbook-authorization-'));
    const secretRoot = join(root, 'campaign-TOKEN=secret-value');
    const decisionsPath = join(root, 'authorization-decisions.json');

    await mkdir(secretRoot, { recursive: true });
    await writeFile(
      join(secretRoot, 'ai-ide-target-repo-repair-goal-proposal-package.json'),
      `${JSON.stringify(buildProposalPackage(secretRoot), null, 2)}\n`
    );
    await writeFile(decisionsPath, `${JSON.stringify({
      decisions: [
        {
          scopeId: 'target_repo_manual_repair_goal',
          decision: 'approve',
          evidence: 'Fixture maintainer approved a separate target repo repair goal.',
          approverRole: 'target_repo_maintainer',
          verificationRequirements: ['pnpm test', 'pnpm lint']
        }
      ]
    }, null, 2)}\n`);

    const { stdout, stderr } = await execFileAsync(
      'pnpm',
      [
        'playbook:authorize',
        '--',
        '--from-dir',
        secretRoot,
        '--decisions',
        decisionsPath
      ],
      { cwd: process.cwd(), timeout: SCRIPT_TEST_TIMEOUT_MS }
    );
    const jsonPath = join(secretRoot, 'ai-ide-target-repo-repair-goal-authorization-receipt.json');
    const markdownPath = join(secretRoot, 'ai-ide-target-repo-repair-goal-authorization-receipt.md');
    const json = await readFile(jsonPath, 'utf8');
    const markdown = await readFile(markdownPath, 'utf8');
    const receipt = JSON.parse(json) as {
      schemaVersion: string;
      authorizationStatus: string;
      decisionSummary: { approvedTargetRepairGoalScopes: number };
      approvedScope: Array<{ scopeId: string; authorizedForSeparateTargetRepoRepairGoal: boolean }>;
      blockedActions: string[];
    };

    expect(stderr).toBe('');
    expect(stdout).toContain(`Wrote ${jsonPath}`);
    expect(stdout).toContain(`Wrote ${markdownPath}`);
    expect(receipt.schemaVersion).toBe('repoassure.ai-ide-target-repo-repair-goal-authorization-receipt.v1');
    expect(receipt.authorizationStatus).toBe('approved_for_separate_target_repo_repair_goal');
    expect(receipt.decisionSummary.approvedTargetRepairGoalScopes).toBe(1);
    expect(receipt.approvedScope).toEqual([
      expect.objectContaining({
        scopeId: 'target_repo_manual_repair_goal',
        authorizedForSeparateTargetRepoRepairGoal: true
      })
    ]);
    expect(receipt.blockedActions).toContain('target_repo_file_mutation');
    expect(receipt.blockedActions).toContain('public_launch');
    expect(markdown).toContain('# RepoAssure AI IDE Target Repo Repair Goal Authorization Receipt');
    expect(markdown).toContain('## Non-Authorization Boundary');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  }, SCRIPT_TEST_TIMEOUT_MS);

  it('reports documented CLI flag names when required input is missing', async () => {
    await expect(execFileAsync(
      'node',
      [
        'scripts/generate-ai-ide-target-repo-repair-goal-authorization-receipt.mjs',
        '--output',
        'artifacts/campaign'
      ],
      { cwd: process.cwd(), timeout: SCRIPT_TEST_TIMEOUT_MS }
    )).rejects.toMatchObject({
      stderr: expect.stringContaining('--proposal-package or --from-dir is required')
    });

    await expect(execFileAsync(
      'node',
      [
        'scripts/generate-ai-ide-target-repo-repair-goal-authorization-receipt.mjs',
        '--from-dir',
        'artifacts/campaign'
      ],
      { cwd: process.cwd(), timeout: SCRIPT_TEST_TIMEOUT_MS }
    )).rejects.toMatchObject({
      stderr: expect.stringContaining('--decisions is required')
    });
  }, SCRIPT_TEST_TIMEOUT_MS);
});

function buildProposalPackage(root: string) {
  return {
    schemaVersion: 'repoassure.ai-ide-target-repo-repair-goal-proposal-package.v1',
    generatedAt: '2026-07-08T12:00:00.000Z',
    proposalReadiness: 'ready_for_maintainer_goal_authorization',
    sourceReplayReadiness: {
      schemaVersion: 'repoassure.ai-ide-repair-execution-replay-readiness.v1',
      fileName: 'ai-ide-repair-execution-replay-readiness.json',
      path: `${root}/ai-ide-repair-execution-replay-readiness.json`,
      sha256: 'a'.repeat(64),
      replayReadiness: 'ready_for_maintainer_replay_review',
      nextReviewDecision: 'maintainer_review_ready'
    },
    prerequisites: ['Maintainer explicitly authorizes a separate target repo repair goal.'],
    artifactReadOrder: [
      {
        step: 1,
        fileName: 'ai-ide-repair-execution-replay-readiness.json',
        artifactKind: 'ai_ide_repair_execution_replay_readiness',
        requiredBeforeTargetRepairGoal: true,
        instruction: 'Read replay readiness before authorization.'
      }
    ],
    allowedRepairScope: [
      {
        scopeId: 'target_repo_manual_repair_goal',
        authorizationStatus: 'requires_maintainer_authorization',
        allowedActions: ['Draft a separate target repo repair goal for maintainer approval.'],
        prohibitedActions: ['target_repo_file_mutation', 'public_launch']
      }
    ],
    repairTaskBreakdown: [
      {
        taskId: 'T2-apply-maintainer-approved-repair',
        title: 'Apply only maintainer-approved repair changes.',
        authorizationStatus: 'requires_maintainer_authorization',
        requiredInputs: ['Maintainer target repo repair goal authorization'],
        completionEvidence: ['Verification command results']
      }
    ],
    verificationCommands: [
      {
        command: '<maintainer-provided target repo verification command>',
        executionMode: 'proposed_not_executed',
        requiredBeforeMaintainerAcceptance: true,
        source: 'maintainer_provided'
      }
    ],
    maintainerApprovalBoundary: 'This package requires separate maintainer approval before any target repo repair goal execution.',
    nonAuthorizationBoundary: 'This package does not authorize target repo mutation, release, launch, customer contact, or commercial availability claims.',
    redactionBoundary: 'Use sanitized summaries only.',
    blockedActions: [
      'target_repo_file_mutation',
      'target_repo_branch_creation',
      'target_repo_commit_creation',
      'public_launch',
      'customer_contact',
      'commercial_availability_claim'
    ]
  };
}
