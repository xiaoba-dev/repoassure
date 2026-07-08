import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildAiIdeTargetRepoRepairGoalAuthorizationReceipt,
  buildAiIdeTargetRepoRepairGoalAuthorizationReceiptMarkdown,
  writeAiIdeTargetRepoRepairGoalAuthorizationReceipt,
  writeAiIdeTargetRepoRepairGoalAuthorizationReceiptFromDirectory
} from '../../packages/acceptance/src/ai-ide-target-repo-repair-goal-authorization-receipt.js';
import type { AiIdeTargetRepoRepairGoalProposalPackage } from '../../packages/acceptance/src/ai-ide-target-repo-repair-goal-proposal-package.js';

describe('AI IDE target repo repair goal authorization receipt', () => {
  it('records maintainer target repair goal decisions without mutating target repos', () => {
    const proposalPackage = buildProposalPackage('/private/tmp/repoassure-proposal-TOKEN=secret-value');

    const receipt = buildAiIdeTargetRepoRepairGoalAuthorizationReceipt({
      generatedAt: '2026-07-08T12:30:00.000Z',
      proposalPackagePath: '/private/tmp/repoassure-proposal-TOKEN=secret-value/ai-ide-target-repo-repair-goal-proposal-package.json',
      proposalPackage,
      authorizationDecisions: [
        buildDecision('target_repo_manual_repair_goal', 'approve', 'Maintainer approves opening a separate target repo repair goal.'),
        buildDecision('unsupported-runtime-repair', 'defer', 'Runtime prerequisite is not available yet.'),
        buildDecision('low-confidence-patch', 'reject', 'Evidence is incomplete.'),
        buildDecision('known-ui-flake', 'accept_risk', 'Maintainer accepts risk for this campaign only.')
      ]
    });
    const markdown = buildAiIdeTargetRepoRepairGoalAuthorizationReceiptMarkdown(receipt);
    const serialized = JSON.stringify(receipt);

    expect(receipt.schemaVersion).toBe('repoassure.ai-ide-target-repo-repair-goal-authorization-receipt.v1');
    expect(receipt.authorizationStatus).toBe('mixed_decisions');
    expect(receipt.sourceProposalPackage).toMatchObject({
      fileName: 'ai-ide-target-repo-repair-goal-proposal-package.json',
      proposalReadiness: 'ready_for_maintainer_goal_authorization'
    });
    expect(receipt.decisionSummary).toMatchObject({
      totalDecisionItems: 4,
      approved: 1,
      rejected: 1,
      deferred: 1,
      acceptedRisk: 1,
      approvedTargetRepairGoalScopes: 1
    });
    expect(receipt.approvedScope).toEqual([
      expect.objectContaining({
        scopeId: 'target_repo_manual_repair_goal',
        decision: 'approve',
        authorizedForSeparateTargetRepoRepairGoal: true
      })
    ]);
    expect(receipt.rejectedItems).toEqual([
      expect.objectContaining({ scopeId: 'low-confidence-patch', decision: 'reject' })
    ]);
    expect(receipt.deferredItems).toEqual([
      expect.objectContaining({ scopeId: 'unsupported-runtime-repair', decision: 'defer' })
    ]);
    expect(receipt.riskAcceptedItems).toEqual([
      expect.objectContaining({ scopeId: 'known-ui-flake', decision: 'accept_risk' })
    ]);
    expect(receipt.verificationRequirements).toContain('pnpm test');
    expect(receipt.maintainerApprovalBoundary).toContain('separate target repo repair goal');
    expect(receipt.nonAuthorizationBoundary).toContain('does not execute target repo file mutation');
    expect(receipt.blockedActions).toContain('target_repo_file_mutation');
    expect(receipt.blockedActions).toContain('public_launch');
    expect(markdown).toContain('# RepoAssure AI IDE Target Repo Repair Goal Authorization Receipt');
    expect(markdown).toContain('## Decision Summary');
    expect(markdown).toContain('## Approved Scope');
    expect(markdown).toContain('## Maintainer Approval Boundary');
    expect(markdown).toContain('## Non-Authorization Boundary');
    expect(markdown).toContain('approve');
    expect(markdown).toContain('accept_risk');
    expect(serialized).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });

  it('writes json and markdown authorization receipt artifacts from local files', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-target-repair-authorization-'));
    const proposalPackagePath = join(root, 'ai-ide-target-repo-repair-goal-proposal-package.json');
    const decisionsPath = join(root, 'authorization-decisions.json');
    const outputDir = join(root, 'authorization-output');

    await mkdir(root, { recursive: true });
    await writeFile(
      proposalPackagePath,
      `${JSON.stringify(buildProposalPackage(join(root, 'campaign-TOKEN=secret-value')), null, 2)}\n`
    );
    await writeFile(decisionsPath, `${JSON.stringify({
      decisions: [
        buildDecision('target_repo_manual_repair_goal', 'approve', 'Maintainer approves opening a separate target repo repair goal.'),
        buildDecision('unsupported-runtime-repair', 'defer', 'Runtime prerequisite is not available yet.')
      ]
    }, null, 2)}\n`);

    const result = await writeAiIdeTargetRepoRepairGoalAuthorizationReceipt({
      generatedAt: '2026-07-08T12:30:00.000Z',
      proposalPackagePath,
      decisionsPath,
      outputDir
    });
    const json = await readFile(result.jsonPath, 'utf8');
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(result.jsonPath).toBe(join(outputDir, 'ai-ide-target-repo-repair-goal-authorization-receipt.json'));
    expect(result.markdownPath).toBe(join(outputDir, 'ai-ide-target-repo-repair-goal-authorization-receipt.md'));
    expect(result.authorizationReceipt.decisionSummary.approved).toBe(1);
    expect(json).toContain('repoassure.ai-ide-target-repo-repair-goal-authorization-receipt.v1');
    expect(markdown).toContain('Separate target repo repair goal may be drafted only for this approved scope.');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });

  it('writes authorization receipt artifacts from a proposal package directory', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-target-repair-authorization-dir-'));
    const secretRoot = join(root, 'campaign-TOKEN=secret-value');
    const decisionsPath = join(root, 'authorization-decisions.json');

    await mkdir(secretRoot, { recursive: true });
    await writeFile(
      join(secretRoot, 'ai-ide-target-repo-repair-goal-proposal-package.json'),
      `${JSON.stringify(buildProposalPackage(secretRoot), null, 2)}\n`
    );
    await writeFile(decisionsPath, `${JSON.stringify({
      decisions: [
        buildDecision('target_repo_manual_repair_goal', 'approve', 'Maintainer approves opening a separate target repo repair goal.')
      ]
    }, null, 2)}\n`);

    const result = await writeAiIdeTargetRepoRepairGoalAuthorizationReceiptFromDirectory({
      generatedAt: '2026-07-08T12:30:00.000Z',
      inputDir: secretRoot,
      decisionsPath
    });

    expect(result.jsonPath).toBe(join(secretRoot, 'ai-ide-target-repo-repair-goal-authorization-receipt.json'));
    expect(result.markdownPath).toBe(join(secretRoot, 'ai-ide-target-repo-repair-goal-authorization-receipt.md'));
    expect(result.authorizationReceipt.authorizationStatus).toBe('approved_for_separate_target_repo_repair_goal');
  });
});

function buildDecision(
  scopeId: string,
  decision: 'approve' | 'reject' | 'defer' | 'accept_risk',
  evidence: string
): {
  scopeId: string;
  decision: 'approve' | 'reject' | 'defer' | 'accept_risk';
  evidence: string;
  approverRole: string;
  verificationRequirements: string[];
} {
  return {
    scopeId,
    decision,
    evidence,
    approverRole: decision === 'approve' ? 'target_repo_maintainer' : 'repoassure_maintainer',
    verificationRequirements: ['pnpm test', 'pnpm lint']
  };
}

function buildProposalPackage(root: string): AiIdeTargetRepoRepairGoalProposalPackage {
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
    prerequisites: [
      'Maintainer reviews the replay readiness report before any target repo repair goal.',
      'Maintainer explicitly authorizes a separate target repo repair goal.'
    ],
    artifactReadOrder: [
      {
        step: 1,
        fileName: 'ai-ide-repair-evidence-consumer-contract.json',
        artifactKind: 'ai_ide_repair_evidence_consumer_contract',
        requiredBeforeTargetRepairGoal: true,
        instruction: 'Read contract before authorization.'
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
