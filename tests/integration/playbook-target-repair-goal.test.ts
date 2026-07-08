import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const SCRIPT_TEST_TIMEOUT_MS = 30_000;

describe('authorized target repo repair goal task package script', () => {
  it('generates a task package from one local authorization receipt directory', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-playbook-target-repair-goal-'));
    const secretRoot = join(root, 'campaign-TOKEN=secret-value');

    await mkdir(secretRoot, { recursive: true });
    await writeFile(
      join(secretRoot, 'ai-ide-target-repo-repair-goal-authorization-receipt.json'),
      `${JSON.stringify(buildAuthorizationReceipt(secretRoot), null, 2)}\n`
    );

    const { stdout, stderr } = await execFileAsync(
      'pnpm',
      [
        'playbook:target-repair-goal',
        '--',
        '--from-dir',
        secretRoot
      ],
      { cwd: process.cwd(), timeout: SCRIPT_TEST_TIMEOUT_MS }
    );
    const jsonPath = join(secretRoot, 'ai-ide-authorized-target-repo-repair-goal-task-package.json');
    const markdownPath = join(secretRoot, 'ai-ide-authorized-target-repo-repair-goal-task-package.md');
    const json = await readFile(jsonPath, 'utf8');
    const markdown = await readFile(markdownPath, 'utf8');
    const taskPackage = JSON.parse(json) as {
      schemaVersion: string;
      taskPackageStatus: string;
      approvedRepairGoals: Array<{ goalId: string; executionMode: string }>;
      excludedAuthorizationItems: Array<{ scopeId: string; decision: string }>;
      blockedActions: string[];
    };

    expect(stderr).toBe('');
    expect(stdout).toContain(`Wrote ${jsonPath}`);
    expect(stdout).toContain(`Wrote ${markdownPath}`);
    expect(taskPackage.schemaVersion).toBe('repoassure.ai-ide-authorized-target-repo-repair-goal-task-package.v1');
    expect(taskPackage.taskPackageStatus).toBe('ready_for_separate_target_repo_repair_goal');
    expect(taskPackage.approvedRepairGoals).toEqual([
      expect.objectContaining({
        goalId: 'target-repo-repair-goal-target_repo_manual_repair_goal',
        executionMode: 'separate_authorized_target_repo_repair_goal'
      })
    ]);
    expect(taskPackage.excludedAuthorizationItems).toEqual([
      expect.objectContaining({ scopeId: 'unsupported-runtime-repair', decision: 'defer' })
    ]);
    expect(taskPackage.blockedActions).toContain('target_repo_file_mutation');
    expect(taskPackage.blockedActions).toContain('public_launch');
    expect(markdown).toContain('# RepoAssure AI IDE Authorized Target Repo Repair Goal Task Package');
    expect(markdown).toContain('## Approved Repair Goals');
    expect(markdown).toContain('## Excluded Authorization Items');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  }, SCRIPT_TEST_TIMEOUT_MS);

  it('reports the documented CLI flag name when input is missing', async () => {
    await expect(execFileAsync(
      'node',
      [
        'scripts/generate-ai-ide-authorized-target-repo-repair-goal-task-package.mjs',
        '--output',
        'artifacts/campaign'
      ],
      { cwd: process.cwd(), timeout: SCRIPT_TEST_TIMEOUT_MS }
    )).rejects.toMatchObject({
      stderr: expect.stringContaining('--authorization-receipt or --from-dir is required')
    });
  }, SCRIPT_TEST_TIMEOUT_MS);
});

function buildAuthorizationReceipt(root: string) {
  return {
    schemaVersion: 'repoassure.ai-ide-target-repo-repair-goal-authorization-receipt.v1',
    generatedAt: '2026-07-08T12:30:00.000Z',
    authorizationStatus: 'mixed_decisions',
    sourceProposalPackage: {
      schemaVersion: 'repoassure.ai-ide-target-repo-repair-goal-proposal-package.v1',
      fileName: 'ai-ide-target-repo-repair-goal-proposal-package.json',
      path: `${root}/ai-ide-target-repo-repair-goal-proposal-package.json`,
      sha256: 'a'.repeat(64),
      proposalReadiness: 'ready_for_maintainer_goal_authorization'
    },
    decisionSummary: {
      totalDecisionItems: 2,
      approved: 1,
      rejected: 0,
      deferred: 1,
      acceptedRisk: 0,
      approvedTargetRepairGoalScopes: 1
    },
    authorizationItems: [
      buildAuthorizationItem('target_repo_manual_repair_goal', 'approve', true),
      buildAuthorizationItem('unsupported-runtime-repair', 'defer', false)
    ],
    approvedScope: [buildAuthorizationItem('target_repo_manual_repair_goal', 'approve', true)],
    rejectedItems: [],
    deferredItems: [buildAuthorizationItem('unsupported-runtime-repair', 'defer', false)],
    riskAcceptedItems: [],
    verificationRequirements: ['pnpm test', 'pnpm lint'],
    maintainerApprovalBoundary: 'This receipt authorizes only the maintainer-approved scope to be drafted or executed in a separate target repo repair goal.',
    nonAuthorizationBoundary: 'This receipt does not execute target repo file mutation, branch creation, commits, pull requests, issues, advisories, releases, publication, public launch, customer contact, pricing/spend, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.',
    redactionBoundary: 'Use sanitized local summaries only.',
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

function buildAuthorizationItem(scopeId: string, decision: 'approve' | 'defer', authorizedForSeparateTargetRepoRepairGoal: boolean) {
  return {
    scopeId,
    decision,
    evidence: `Maintainer decision evidence for ${scopeId}.`,
    approverRole: decision === 'approve' ? 'target_repo_maintainer' : 'repoassure_maintainer',
    authorizedForSeparateTargetRepoRepairGoal,
    nextAction: authorizedForSeparateTargetRepoRepairGoal
      ? 'Separate target repo repair goal may be drafted only for this approved scope.'
      : 'Defer target repo repair goal execution until the missing prerequisite or maintainer condition is resolved.',
    verificationRequirements: ['pnpm test', 'pnpm lint']
  };
}
