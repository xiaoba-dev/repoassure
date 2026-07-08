import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildAiIdeAuthorizedTargetRepoRepairGoalTaskPackage,
  buildAiIdeAuthorizedTargetRepoRepairGoalTaskPackageMarkdown,
  writeAiIdeAuthorizedTargetRepoRepairGoalTaskPackage,
  writeAiIdeAuthorizedTargetRepoRepairGoalTaskPackageFromDirectory
} from '../../packages/acceptance/src/ai-ide-authorized-target-repo-repair-goal-task-package.js';
import type { AiIdeTargetRepoRepairGoalAuthorizationReceipt } from '../../packages/acceptance/src/ai-ide-target-repo-repair-goal-authorization-receipt.js';

describe('AI IDE authorized target repo repair goal task package', () => {
  it('turns approved authorization receipt scope into a separate repair goal task package', () => {
    const authorizationReceipt = buildAuthorizationReceipt('/private/tmp/repoassure-authorization-TOKEN=secret-value');

    const taskPackage = buildAiIdeAuthorizedTargetRepoRepairGoalTaskPackage({
      generatedAt: '2026-07-09T00:30:00.000Z',
      authorizationReceiptPath: '/private/tmp/repoassure-authorization-TOKEN=secret-value/ai-ide-target-repo-repair-goal-authorization-receipt.json',
      authorizationReceipt
    });
    const markdown = buildAiIdeAuthorizedTargetRepoRepairGoalTaskPackageMarkdown(taskPackage);
    const serialized = JSON.stringify(taskPackage);

    expect(taskPackage.schemaVersion).toBe('repoassure.ai-ide-authorized-target-repo-repair-goal-task-package.v1');
    expect(taskPackage.taskPackageStatus).toBe('ready_for_separate_target_repo_repair_goal');
    expect(taskPackage.sourceAuthorizationReceipt).toMatchObject({
      fileName: 'ai-ide-target-repo-repair-goal-authorization-receipt.json',
      authorizationStatus: 'mixed_decisions',
      approvedTargetRepairGoalScopes: 1
    });
    expect(taskPackage.approvedRepairGoals).toEqual([
      expect.objectContaining({
        goalId: 'target-repo-repair-goal-target_repo_manual_repair_goal',
        scopeId: 'target_repo_manual_repair_goal',
        executionMode: 'separate_authorized_target_repo_repair_goal',
        targetRepoMutationPermission: 'requires_separate_goal_runtime_confirmation',
        verificationRequirements: ['pnpm test', 'pnpm lint']
      })
    ]);
    expect(taskPackage.approvedRepairGoals[0]?.repairGoalInstructions).toContain('Open or use an isolated target repo worktree only inside the separate authorized repair goal.');
    expect(taskPackage.excludedAuthorizationItems).toEqual([
      expect.objectContaining({ scopeId: 'low-confidence-patch', decision: 'reject' }),
      expect.objectContaining({ scopeId: 'unsupported-runtime-repair', decision: 'defer' }),
      expect.objectContaining({ scopeId: 'known-ui-flake', decision: 'accept_risk' })
    ]);
    expect(taskPackage.verificationChecklist).toContain('Run maintainer-provided target repo verification commands after the separately authorized repair goal changes.');
    expect(taskPackage.maintainerReviewBoundary).toContain('must return repair evidence for maintainer review');
    expect(taskPackage.nonAuthorizationBoundary).toContain('does not execute target repo file mutation');
    expect(taskPackage.blockedActions).toContain('target_repo_file_mutation');
    expect(taskPackage.blockedActions).toContain('public_launch');
    expect(markdown).toContain('# RepoAssure AI IDE Authorized Target Repo Repair Goal Task Package');
    expect(markdown).toContain('## Approved Repair Goals');
    expect(markdown).toContain('## Excluded Authorization Items');
    expect(markdown).toContain('## Non-Authorization Boundary');
    expect(serialized).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });

  it('blocks task package readiness when there is no authorized approved scope', () => {
    const authorizationReceipt = buildAuthorizationReceipt('/private/tmp/repoassure-authorization-TOKEN=secret-value');
    authorizationReceipt.authorizationStatus = 'deferred';
    authorizationReceipt.decisionSummary.approvedTargetRepairGoalScopes = 0;
    authorizationReceipt.approvedScope = [];

    const taskPackage = buildAiIdeAuthorizedTargetRepoRepairGoalTaskPackage({
      generatedAt: '2026-07-09T00:30:00.000Z',
      authorizationReceiptPath: '/private/tmp/repoassure-authorization-TOKEN=secret-value/ai-ide-target-repo-repair-goal-authorization-receipt.json',
      authorizationReceipt
    });

    expect(taskPackage.taskPackageStatus).toBe('blocked_or_incomplete');
    expect(taskPackage.approvedRepairGoals).toEqual([]);
    expect(taskPackage.verificationChecklist).toContain('Collect an approved authorization receipt before opening a target repo repair goal.');
  });

  it('writes json and markdown task package artifacts from local files', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-authorized-target-repair-goal-'));
    const authorizationReceiptPath = join(root, 'ai-ide-target-repo-repair-goal-authorization-receipt.json');
    const outputDir = join(root, 'task-package-output');

    await mkdir(root, { recursive: true });
    await writeFile(
      authorizationReceiptPath,
      `${JSON.stringify(buildAuthorizationReceipt(join(root, 'campaign-TOKEN=secret-value')), null, 2)}\n`
    );

    const result = await writeAiIdeAuthorizedTargetRepoRepairGoalTaskPackage({
      generatedAt: '2026-07-09T00:30:00.000Z',
      authorizationReceiptPath,
      outputDir
    });
    const json = await readFile(result.jsonPath, 'utf8');
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(result.jsonPath).toBe(join(outputDir, 'ai-ide-authorized-target-repo-repair-goal-task-package.json'));
    expect(result.markdownPath).toBe(join(outputDir, 'ai-ide-authorized-target-repo-repair-goal-task-package.md'));
    expect(result.taskPackage.taskPackageStatus).toBe('ready_for_separate_target_repo_repair_goal');
    expect(json).toContain('repoassure.ai-ide-authorized-target-repo-repair-goal-task-package.v1');
    expect(markdown).toContain('target-repo-repair-goal-target_repo_manual_repair_goal');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });

  it('writes task package artifacts from an authorization receipt directory', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-authorized-target-repair-goal-dir-'));
    const secretRoot = join(root, 'campaign-TOKEN=secret-value');

    await mkdir(secretRoot, { recursive: true });
    await writeFile(
      join(secretRoot, 'ai-ide-target-repo-repair-goal-authorization-receipt.json'),
      `${JSON.stringify(buildAuthorizationReceipt(secretRoot), null, 2)}\n`
    );

    const result = await writeAiIdeAuthorizedTargetRepoRepairGoalTaskPackageFromDirectory({
      generatedAt: '2026-07-09T00:30:00.000Z',
      inputDir: secretRoot
    });

    expect(result.jsonPath).toBe(join(secretRoot, 'ai-ide-authorized-target-repo-repair-goal-task-package.json'));
    expect(result.markdownPath).toBe(join(secretRoot, 'ai-ide-authorized-target-repo-repair-goal-task-package.md'));
    expect(result.taskPackage.sourceAuthorizationReceipt.path).not.toContain('secret-value');
  });
});

function buildAuthorizationReceipt(root: string): AiIdeTargetRepoRepairGoalAuthorizationReceipt {
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
      totalDecisionItems: 4,
      approved: 1,
      rejected: 1,
      deferred: 1,
      acceptedRisk: 1,
      approvedTargetRepairGoalScopes: 1
    },
    authorizationItems: [
      buildAuthorizationItem('target_repo_manual_repair_goal', 'approve', true),
      buildAuthorizationItem('low-confidence-patch', 'reject', false),
      buildAuthorizationItem('unsupported-runtime-repair', 'defer', false),
      buildAuthorizationItem('known-ui-flake', 'accept_risk', false)
    ],
    approvedScope: [buildAuthorizationItem('target_repo_manual_repair_goal', 'approve', true)],
    rejectedItems: [buildAuthorizationItem('low-confidence-patch', 'reject', false)],
    deferredItems: [buildAuthorizationItem('unsupported-runtime-repair', 'defer', false)],
    riskAcceptedItems: [buildAuthorizationItem('known-ui-flake', 'accept_risk', false)],
    verificationRequirements: ['pnpm test', 'pnpm lint'],
    maintainerApprovalBoundary: 'This receipt authorizes only the maintainer-approved scope to be drafted or executed in a separate target repo repair goal.',
    nonAuthorizationBoundary: 'This receipt does not execute target repo file mutation, branch creation, commits, pull requests, issues, advisories, releases, publication, public launch, customer contact, pricing/spend, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.',
    redactionBoundary: 'Use sanitized local summaries only.',
    blockedActions: [
      'target_repo_file_mutation',
      'target_repo_branch_creation',
      'target_repo_commit_creation',
      'target_repo_pull_request_creation',
      'public_launch',
      'customer_contact',
      'commercial_availability_claim'
    ]
  };
}

function buildAuthorizationItem(
  scopeId: string,
  decision: AiIdeTargetRepoRepairGoalAuthorizationReceipt['authorizationItems'][number]['decision'],
  authorizedForSeparateTargetRepoRepairGoal: boolean
): AiIdeTargetRepoRepairGoalAuthorizationReceipt['authorizationItems'][number] {
  return {
    scopeId,
    decision,
    evidence: `Maintainer decision evidence for ${scopeId}.`,
    approverRole: decision === 'approve' ? 'target_repo_maintainer' : 'repoassure_maintainer',
    authorizedForSeparateTargetRepoRepairGoal,
    nextAction: authorizedForSeparateTargetRepoRepairGoal
      ? 'Separate target repo repair goal may be drafted only for this approved scope.'
      : 'Do not treat this item as target repo repair authorization.',
    verificationRequirements: ['pnpm test', 'pnpm lint']
  };
}
