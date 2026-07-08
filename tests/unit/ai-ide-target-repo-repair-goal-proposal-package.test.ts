import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildAiIdeTargetRepoRepairGoalProposalPackage,
  buildAiIdeTargetRepoRepairGoalProposalPackageMarkdown,
  writeAiIdeTargetRepoRepairGoalProposalPackage,
  writeAiIdeTargetRepoRepairGoalProposalPackageFromDirectory
} from '../../packages/acceptance/src/ai-ide-target-repo-repair-goal-proposal-package.js';
import type {
  AiIdeRepairExecutionReplayReadinessReport
} from '../../packages/acceptance/src/ai-ide-repair-execution-replay-readiness.js';

describe('AI IDE target repo repair goal proposal package', () => {
  it('turns replay readiness into a maintainer-authorized repair goal proposal package', () => {
    const proposal = buildAiIdeTargetRepoRepairGoalProposalPackage({
      generatedAt: '2026-07-08T12:30:00.000Z',
      replayReadinessPath: '/private/tmp/repoassure-campaign-TOKEN=secret-value/ai-ide-repair-execution-replay-readiness.json',
      replayReadiness: buildReplayReadiness()
    });
    const markdown = buildAiIdeTargetRepoRepairGoalProposalPackageMarkdown(proposal);
    const serialized = JSON.stringify(proposal);

    expect(proposal.schemaVersion).toBe('repoassure.ai-ide-target-repo-repair-goal-proposal-package.v1');
    expect(proposal.proposalReadiness).toBe('ready_for_maintainer_goal_authorization');
    expect(proposal.sourceReplayReadiness).toMatchObject({
      schemaVersion: 'repoassure.ai-ide-repair-execution-replay-readiness.v1',
      fileName: 'ai-ide-repair-execution-replay-readiness.json',
      replayReadiness: 'ready_for_maintainer_replay_review',
      nextReviewDecision: 'maintainer_review_ready'
    });
    expect(proposal.artifactReadOrder.map((item) => item.fileName)).toEqual([
      'ai-ide-repair-playbook.json',
      'ai-ide-playbook-consumption-report.json',
      'ai-ide-repair-decision-package.json',
      'ai-ide-repair-approval-receipt.json',
      'ai-ide-approved-repair-execution-plan.json',
      'ai-ide-repair-execution-evidence-report.json',
      'ai-ide-repair-execution-replay-readiness.json'
    ]);
    expect(proposal.allowedRepairScope).toEqual([
      expect.objectContaining({
        scopeId: 'target_repo_manual_repair_goal',
        authorizationStatus: 'requires_maintainer_authorization'
      })
    ]);
    expect(proposal.repairTaskBreakdown.map((task) => task.taskId)).toEqual([
      'T0-read-evidence-in-order',
      'T1-open-isolated-target-worktree',
      'T2-apply-maintainer-approved-repair',
      'T3-run-verification-commands',
      'T4-return-maintainer-review-summary'
    ]);
    expect(proposal.verificationCommands).toEqual([
      expect.objectContaining({
        command: '<maintainer-provided target repo verification command>',
        executionMode: 'proposed_not_executed'
      })
    ]);
    expect(proposal.maintainerApprovalBoundary).toContain('separate maintainer approval');
    expect(proposal.nonAuthorizationBoundary).toContain('does not authorize target repo mutation');
    expect(proposal.blockedActions).toContain('target_repo_file_mutation');
    expect(proposal.blockedActions).toContain('public_launch');
    expect(markdown).toContain('# RepoAssure AI IDE Target Repo Repair Goal Proposal Package');
    expect(markdown).toContain('## Repair Task Breakdown');
    expect(markdown).toContain('## Maintainer Approval Boundary');
    expect(serialized).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });

  it('writes json and markdown proposal package artifacts from a replay readiness file', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-target-repair-proposal-'));
    const secretRoot = join(root, 'campaign-TOKEN=secret-value');
    const replayReadinessPath = join(secretRoot, 'ai-ide-repair-execution-replay-readiness.json');
    const outputDir = join(root, 'proposal-output');

    await mkdir(secretRoot, { recursive: true });
    await writeFile(replayReadinessPath, `${JSON.stringify(buildReplayReadiness(), null, 2)}\n`);

    const result = await writeAiIdeTargetRepoRepairGoalProposalPackage({
      generatedAt: '2026-07-08T12:30:00.000Z',
      replayReadinessPath,
      outputDir
    });
    const json = await readFile(result.jsonPath, 'utf8');
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(result.jsonPath).toBe(join(outputDir, 'ai-ide-target-repo-repair-goal-proposal-package.json'));
    expect(result.markdownPath).toBe(join(outputDir, 'ai-ide-target-repo-repair-goal-proposal-package.md'));
    expect(result.package.proposalReadiness).toBe('ready_for_maintainer_goal_authorization');
    expect(json).toContain('repoassure.ai-ide-target-repo-repair-goal-proposal-package.v1');
    expect(markdown).toContain('ready_for_maintainer_goal_authorization');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });

  it('discovers replay readiness from one local campaign directory', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-target-repair-proposal-dir-'));
    const secretRoot = join(root, 'campaign-TOKEN=secret-value');

    await mkdir(secretRoot, { recursive: true });
    await writeFile(
      join(secretRoot, 'ai-ide-repair-execution-replay-readiness.json'),
      `${JSON.stringify(buildReplayReadiness(), null, 2)}\n`
    );

    const result = await writeAiIdeTargetRepoRepairGoalProposalPackageFromDirectory({
      generatedAt: '2026-07-08T12:30:00.000Z',
      inputDir: secretRoot
    });
    const json = await readFile(result.jsonPath, 'utf8');
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(result.jsonPath).toBe(join(secretRoot, 'ai-ide-target-repo-repair-goal-proposal-package.json'));
    expect(result.markdownPath).toBe(join(secretRoot, 'ai-ide-target-repo-repair-goal-proposal-package.md'));
    expect(result.package.artifactReadOrder).toHaveLength(7);
    expect(markdown).toContain('## Verification Commands');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });

  it('blocks proposal readiness when replay is not maintainer-review ready', () => {
    const proposal = buildAiIdeTargetRepoRepairGoalProposalPackage({
      generatedAt: '2026-07-08T12:30:00.000Z',
      replayReadinessPath: '/private/tmp/repoassure-campaign/ai-ide-repair-execution-replay-readiness.json',
      replayReadiness: {
        ...buildReplayReadiness(),
        replayReadiness: 'review_required',
        nextReviewDecision: {
          decision: 'manual_review_required',
          reason: 'Fixture requires manual interpretation.',
          requiredHumanAction: 'review_replay_report_before_target_repo_repair_goal'
        }
      }
    });

    expect(proposal.proposalReadiness).toBe('manual_review_required');
    expect(proposal.repairTaskBreakdown.every((task) => task.authorizationStatus === 'blocked_until_maintainer_authorization')).toBe(true);
  });
});

function buildReplayReadiness(): AiIdeRepairExecutionReplayReadinessReport {
  return {
    schemaVersion: 'repoassure.ai-ide-repair-execution-replay-readiness.v1',
    generatedAt: '2026-07-08T12:00:00.000Z',
    replayReadiness: 'ready_for_maintainer_replay_review',
    sourceConsumerContract: {
      schemaVersion: 'repoassure.ai-ide-repair-evidence-consumer-contract.v1',
      fileName: 'ai-ide-repair-evidence-consumer-contract.json',
      path: '/private/tmp/repoassure-campaign-[REDACTED]/ai-ide-repair-evidence-consumer-contract.json',
      sha256: 'a'.repeat(64),
      consumerReadiness: 'ready_for_ai_ide_consumption',
      artifactCount: 6
    },
    artifactReplay: ([
      ['ai_ide_repair_playbook', 'ai-ide-repair-playbook.json', 'campaign_context_and_action_queue'],
      ['ai_ide_playbook_consumption_report', 'ai-ide-playbook-consumption-report.json', 'dry_run_understanding_and_blocked_actions'],
      ['ai_ide_repair_decision_package', 'ai-ide-repair-decision-package.json', 'repair_decision_classification'],
      ['ai_ide_repair_approval_receipt', 'ai-ide-repair-approval-receipt.json', 'maintainer_approval_receipt'],
      ['ai_ide_approved_repair_execution_plan', 'ai-ide-approved-repair-execution-plan.json', 'approved_execution_plan'],
      ['ai_ide_repair_execution_evidence_report', 'ai-ide-repair-execution-evidence-report.json', 'execution_evidence_and_boundary_report']
    ] as const).map(([artifactKind, fileName, role], index) => ({
      step: index + 1,
      artifactKind,
      role,
      replayStatus: 'replayed',
      required: true,
      fileName,
      verificationFocus: [`Verify ${fileName} before target repair goal authorization.`]
    })),
    verificationReplay: {
      checklistTotal: 3,
      replayedChecklist: [
        'Read artifacts in artifactReadSequence order before proposing any target repo repair action.',
        'Confirm maintainer review remains pending before treating the evidence bundle as accepted.',
        'Confirm blocked actions remain blocked during replay.'
      ],
      blockedActionChecks: [
        'target_repo_file_mutation',
        'target_repo_branch_creation',
        'target_repo_commit_creation'
      ]
    },
    boundaryReplay: {
      maintainerReviewBoundaryMaintained: true,
      redactionBoundaryMaintained: true,
      nonAuthorizationBoundaryMaintained: true,
      blockedActionsEnforced: true,
      unauthorizedActions: []
    },
    nextReviewDecision: {
      decision: 'maintainer_review_ready',
      reason: 'Consumer contract replay is complete and boundaries remain enforced.',
      requiredHumanAction: 'review_replay_report_before_target_repo_repair_goal'
    },
    blockedActions: [
      'target_repo_file_mutation',
      'target_repo_branch_creation',
      'target_repo_commit_creation'
    ],
    maintainerReviewBoundary: 'Maintainer review is still required before any target repo repair action.',
    redactionBoundary: 'Local-only artifact paths and evidence must be redacted.',
    nonAuthorizationBoundary: 'This replay readiness does not authorize target repo mutation, branch creation, commits, releases, publication, customer contact, or commercial availability claims.'
  };
}
