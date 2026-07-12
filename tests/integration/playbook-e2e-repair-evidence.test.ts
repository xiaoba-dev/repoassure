import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const SCRIPT_TEST_TIMEOUT_MS = 120_000;
const SCRIPT_PATHS = {
  'playbook:generate': 'scripts/generate-ai-ide-repair-playbook.mjs',
  'playbook:consume': 'scripts/generate-ai-ide-playbook-consumption-report.mjs',
  'playbook:decide': 'scripts/generate-ai-ide-repair-decision-package.mjs',
  'playbook:approve': 'scripts/generate-ai-ide-repair-approval-receipt.mjs',
  'playbook:plan-approved': 'scripts/generate-ai-ide-approved-repair-execution-plan.mjs',
  'playbook:evidence': 'scripts/generate-ai-ide-repair-execution-evidence-report.mjs',
  'playbook:bundle': 'scripts/generate-ai-ide-repair-evidence-bundle-manifest.mjs',
  'playbook:contract': 'scripts/generate-ai-ide-repair-evidence-consumer-contract.mjs',
  'playbook:replay': 'scripts/generate-ai-ide-repair-execution-replay-readiness.mjs',
  'playbook:proposal': 'scripts/generate-ai-ide-target-repo-repair-goal-proposal-package.mjs',
  'playbook:authorize': 'scripts/generate-ai-ide-target-repo-repair-goal-authorization-receipt.mjs',
  'playbook:target-repair-goal': 'scripts/generate-ai-ide-authorized-target-repo-repair-goal-task-package.mjs',
  'playbook:target-repair-evidence': 'scripts/generate-ai-ide-target-repo-repair-goal-execution-evidence-intake-report.mjs',
  'playbook:target-repair-review': 'scripts/generate-ai-ide-target-repair-evidence-review-decision-package.mjs',
  'goal:recover': 'scripts/generate-blocked-goal-recovery-package.mjs',
  'goal:recover:consume': 'scripts/generate-blocked-goal-recovery-consumption-report.mjs',
  'goal:recover:decide': 'scripts/generate-blocked-goal-recovery-decision-receipt.mjs'
} as const;
const FIXTURE_PATH = join(
  process.cwd(),
  'fixtures',
  'ai-ide-repair-evidence-campaign',
  'campaign-summary.json'
);

describe('AI IDE repair evidence end-to-end campaign fixture', () => {
  it('carries a local campaign summary through playbook, decisions, approval, plan, and evidence artifacts', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-e2e-repair-evidence-'));
    const outputDir = join(root, 'campaign-output');
    const secretFixtureRoot = join(root, 'campaign-TOKEN=secret-value');
    const campaignSummaryPath = join(secretFixtureRoot, 'campaign-summary.json');

    await mkdir(outputDir, { recursive: true });
    await mkdir(secretFixtureRoot, { recursive: true });
    await writeFile(
      campaignSummaryPath,
      `${(await readFile(FIXTURE_PATH, 'utf8')).replaceAll('__FIXTURE_ROOT__', secretFixtureRoot)}\n`
    );

    await buildAcceptancePackage();
    await runScript([
      'playbook:generate',
      '--',
      '--campaign-summary',
      campaignSummaryPath,
      '--output',
      outputDir
    ]);
    await runScript([
      'playbook:consume',
      '--',
      '--playbook',
      join(outputDir, 'ai-ide-repair-playbook.json'),
      '--output',
      outputDir
    ]);
    await runScript([
      'playbook:decide',
      '--',
      '--consumption-report',
      join(outputDir, 'ai-ide-playbook-consumption-report.json'),
      '--output',
      outputDir
    ]);

    const approvalsPath = join(outputDir, 'approval-decisions.json');
    await writeFile(approvalsPath, `${JSON.stringify({
      decisions: [
        {
          sourceActionId: 'P1-fix-target-regression',
          decision: 'approve',
          evidence: 'Fixture maintainer approved manual repair planning after reading the decision package.',
          approverRole: 'target_repo_maintainer'
        }
      ]
    }, null, 2)}\n`);

    await runScript([
      'playbook:approve',
      '--',
      '--decision-package',
      join(outputDir, 'ai-ide-repair-decision-package.json'),
      '--approvals',
      approvalsPath,
      '--output',
      outputDir
    ]);
    await runScript([
      'playbook:plan-approved',
      '--',
      '--approval-receipt',
      join(outputDir, 'ai-ide-repair-approval-receipt.json'),
      '--output',
      outputDir
    ]);

    const executionPlan = JSON.parse(
      await readFile(join(outputDir, 'ai-ide-approved-repair-execution-plan.json'), 'utf8')
    ) as {
      approvedExecutionItems: Array<{
        sourceActionId: string;
        readOrderPaths: string[];
        verificationChecklist: string[];
      }>;
    };
    const approvedItem = executionPlan.approvedExecutionItems[0];
    const evidencePath = join(outputDir, 'repair-execution-evidence-input.json');

    await writeFile(evidencePath, `${JSON.stringify({
      executionItems: [
        {
          sourceActionId: approvedItem?.sourceActionId,
          executionStatus: 'verified',
          readOrderPathsRead: approvedItem?.readOrderPaths ?? [],
          verificationResults: [
            {
              label: approvedItem?.verificationChecklist[0] ?? 'Rerun target acceptance.',
              status: 'passed',
              evidence: 'Fixture acceptance command passed after maintainer-approved repair planning.'
            }
          ],
          maintainerReviewStatus: 'pending_review',
          notes: 'No target repo branch, commit, pull request, issue, advisory, or file mutation was created.'
        }
      ],
      boundaryEvidence: {
        unauthorizedActions: [],
        notes: 'Fixture evidence records a local report-only loop.'
      }
    }, null, 2)}\n`);

    await runScript([
      'playbook:evidence',
      '--',
      '--execution-plan',
      join(outputDir, 'ai-ide-approved-repair-execution-plan.json'),
      '--evidence',
      evidencePath,
      '--output',
      outputDir
    ]);
    await runScript([
      'playbook:bundle',
      '--',
      '--from-dir',
      outputDir
    ]);
    await runScript([
      'playbook:contract',
      '--',
      '--from-dir',
      outputDir
    ]);
    await runScript([
      'playbook:replay',
      '--',
      '--from-dir',
      outputDir
    ]);
    await runScript([
      'playbook:proposal',
      '--',
      '--from-dir',
      outputDir
    ]);
    const authorizationDecisionsPath = join(outputDir, 'target-repo-repair-goal-authorization-decisions.json');
    await writeFile(authorizationDecisionsPath, `${JSON.stringify({
      decisions: [
        {
          scopeId: 'target_repo_manual_repair_goal',
          decision: 'approve',
          evidence: 'Fixture maintainer approved opening a separate target repo repair goal after reviewing proposal package.',
          approverRole: 'target_repo_maintainer',
          verificationRequirements: ['pnpm test', 'pnpm lint']
        }
      ]
    }, null, 2)}\n`);
    await runScript([
      'playbook:authorize',
      '--',
      '--from-dir',
      outputDir,
      '--decisions',
      authorizationDecisionsPath
    ]);
    await runScript([
      'playbook:target-repair-goal',
      '--',
      '--from-dir',
      outputDir
    ]);
    const targetRepairGoalTaskPackage = JSON.parse(
      await readFile(join(outputDir, 'ai-ide-authorized-target-repo-repair-goal-task-package.json'), 'utf8')
    ) as {
      approvedRepairGoals: Array<{ goalId: string }>;
    };
    const targetRepairEvidencePath = join(outputDir, 'target-repo-repair-goal-execution-evidence-input.json');
    await writeFile(targetRepairEvidencePath, `${JSON.stringify({
      executionResults: [
        {
          goalId: targetRepairGoalTaskPackage.approvedRepairGoals[0]?.goalId,
          executionStatus: 'verified',
          actualMutationSummary: {
            filesChanged: 2,
            linesAdded: 14,
            linesRemoved: 3,
            summary: 'Fixture target repo repair goal changed only maintainer-approved files.',
            evidenceRefs: ['target diff summary', 'verification log']
          },
          verificationResults: [
            {
              command: 'pnpm test',
              status: 'passed',
              evidence: 'Fixture target repo tests passed after separate repair goal.'
            },
            {
              command: 'pnpm lint',
              status: 'passed',
              evidence: 'Fixture target repo lint passed after separate repair goal.'
            }
          ],
          maintainerReviewStatus: 'pending_review',
          notes: 'No target repo branch, commit, pull request, issue, advisory, or release was created by RepoAssure.'
        }
      ],
      boundaryEvidence: {
        unauthorizedActions: [],
        notes: 'Fixture imports evidence from a separately authorized target repo repair goal.'
      }
    }, null, 2)}\n`);
    await runScript([
      'playbook:target-repair-evidence',
      '--',
      '--from-dir',
      outputDir
    ]);
    const targetRepairReviewDecisionsPath = join(outputDir, 'target-repair-evidence-review-decisions.json');
    await writeFile(targetRepairReviewDecisionsPath, `${JSON.stringify({
      decisions: [
        {
          goalId: targetRepairGoalTaskPackage.approvedRepairGoals[0]?.goalId,
          decision: 'accept',
          evidence: 'Fixture maintainer accepted target repair evidence after reading the intake report.',
          reviewerRole: 'target_repo_maintainer',
          acceptedEvidenceScope: ['verified mutation summary', 'passed pnpm test', 'passed pnpm lint'],
          nextRepairGoalRecommendation: 'No additional repair goal is needed for this fixture scope.'
        }
      ]
    }, null, 2)}\n`);
    await runScript([
      'playbook:target-repair-review',
      '--',
      '--from-dir',
      outputDir
    ]);
    await writeFile(join(outputDir, 'blocked-goal-recovery-input.json'), `${JSON.stringify({
      sourceGoal: {
        title: 'Fixture blocked goal recovery',
        status: 'blocked',
        objective: 'Recover a blocked fixture goal without leaking TOKEN=secret-value.',
        evidenceRefs: ['docs/logs/blockers.md']
      },
      sourceAudit: {
        path: 'docs/acceptance/goal-completion-audit.md',
        status: 'blocked_or_incomplete',
        summary: 'Fixture goal audit still has one blocker.'
      },
      sourceLogs: [
        {
          path: 'docs/logs/blockers.md',
          summary: 'Fixture blocker is recorded locally.'
        }
      ],
      blockers: [
        {
          blockerId: 'B1-fixture-timeout',
          category: 'test_instability',
          status: 'retryable',
          summary: 'Fixture full test exceeded default timeout.',
          attemptedActions: ['Ran full test once.'],
          evidenceRefs: ['Test timed out in 5000ms.'],
          automaticRecoveryActions: [
            {
              actionId: 'A1-rerun-timeout',
              command: 'pnpm test -- --testTimeout=15000',
              rationale: 'Rerun using the known integration timeout profile.'
            }
          ]
        },
        {
          blockerId: 'B2-fixture-authorization',
          category: 'maintainer_decision_required',
          status: 'blocked',
          summary: 'Maintainer must choose whether to resume the fixture goal.',
          attemptedActions: ['Recorded resume options.'],
          evidenceRefs: ['docs/logs/decision-log.md'],
          maintainerDecisionRequests: [
            {
              requestedDecision: 'Approve resume, defer, or accept risk.',
              options: ['approve', 'defer', 'accept_risk']
            }
          ]
        }
      ],
      resumeCommands: [
        {
          command: 'codex resume goal',
          purpose: 'Resume the blocked fixture goal after maintainer decision.'
        }
      ],
      redactionBoundary: 'Use sanitized local summaries only.'
    }, null, 2)}\n`);
    await runScript([
      'goal:recover',
      '--',
      '--from-dir',
      outputDir
    ]);
    await runScript([
      'goal:recover:consume',
      '--',
      '--from-dir',
      outputDir
    ]);
    const recoveryConsumptionReport = JSON.parse(
      await readFile(join(outputDir, 'blocked-goal-recovery-consumption-report.json'), 'utf8')
    ) as { actionQueue: Array<{ actionKey: string }> };
    await writeFile(join(outputDir, 'blocked-goal-recovery-decisions.json'), `${JSON.stringify({
      decisions: recoveryConsumptionReport.actionQueue.map((action) => ({
        actionKey: action.actionKey,
        decision: 'approve',
        evidence: 'Fixture action reviewed locally.',
        reviewerRole: 'maintainer'
      }))
    }, null, 2)}\n`);
    await runScript([
      'goal:recover:decide',
      '--',
      '--from-dir',
      outputDir
    ]);

    const outputs = await readArtifacts(outputDir);

    expect(outputs.playbook.schemaVersion).toBe('repoassure.ai-ide-repair-execution-playbook.v1');
    expect(outputs.consumption.schemaVersion).toBe('repoassure.ai-ide-playbook-consumption-report.v1');
    expect(outputs.decision.schemaVersion).toBe('repoassure.ai-ide-repair-decision-package.v1');
    expect(outputs.receipt.schemaVersion).toBe('repoassure.ai-ide-repair-approval-receipt.v1');
    expect(outputs.plan.schemaVersion).toBe('repoassure.ai-ide-approved-repair-execution-plan.v1');
    expect(outputs.evidence.schemaVersion).toBe('repoassure.ai-ide-repair-execution-evidence-report.v1');
    expect(outputs.decision.decisionSummary.manualRepairCandidates).toBe(1);
    expect(outputs.decision.decisionItems).toEqual([
      expect.objectContaining({
        sourceActionId: 'P1-fix-target-regression',
        decisionType: 'manual_repair_candidate'
      })
    ]);
    expect(outputs.receipt.receiptSummary.approvedManualRepairCandidates).toBe(1);
    expect(outputs.plan.executionSummary.approvedExecutionItems).toBe(1);
    expect(outputs.evidence.evidenceSummary).toMatchObject({
      verifiedItems: 1,
      boundaryViolations: 0
    });
    expect(outputs.bundle.schemaVersion).toBe('repoassure.ai-ide-repair-evidence-bundle-manifest.v1');
    expect(outputs.contract.schemaVersion).toBe('repoassure.ai-ide-repair-evidence-consumer-contract.v1');
    expect(outputs.replay.schemaVersion).toBe('repoassure.ai-ide-repair-execution-replay-readiness.v1');
    expect(outputs.proposal.schemaVersion).toBe('repoassure.ai-ide-target-repo-repair-goal-proposal-package.v1');
    expect(outputs.authorization.schemaVersion).toBe('repoassure.ai-ide-target-repo-repair-goal-authorization-receipt.v1');
    expect(outputs.targetRepairGoal.schemaVersion).toBe('repoassure.ai-ide-authorized-target-repo-repair-goal-task-package.v1');
    expect(outputs.bundle.bundleSummary).toMatchObject({
      currentStatus: 'verified_pending_maintainer_review',
      verifiedItems: 1,
      boundaryViolations: 0
    });
    expect(outputs.contract.consumerReadiness).toBe('ready_for_ai_ide_consumption');
    expect(outputs.contract.artifactReadSequence).toHaveLength(6);
    expect(outputs.replay.replayReadiness).toBe('ready_for_maintainer_replay_review');
    expect(outputs.replay.boundaryReplay.blockedActionsEnforced).toBe(true);
    expect(outputs.replay.nextReviewDecision.decision).toBe('maintainer_review_ready');
    expect(outputs.proposal.proposalReadiness).toBe('ready_for_maintainer_goal_authorization');
    expect(outputs.proposal.artifactReadOrder).toHaveLength(7);
    expect(outputs.proposal.repairTaskBreakdown.map((task) => task.taskId)).toContain('T2-apply-maintainer-approved-repair');
    expect(outputs.proposal.verificationCommands[0]).toMatchObject({
      command: '<maintainer-provided target repo verification command>',
      executionMode: 'proposed_not_executed'
    });
    expect(outputs.proposal.blockedActions).toContain('target_repo_file_mutation');
    expect(outputs.proposal.blockedActions).toContain('public_launch');
    expect(outputs.authorization.authorizationStatus).toBe('approved_for_separate_target_repo_repair_goal');
    expect(outputs.authorization.decisionSummary.approvedTargetRepairGoalScopes).toBe(1);
    expect(outputs.authorization.approvedScope).toEqual([
      expect.objectContaining({
        scopeId: 'target_repo_manual_repair_goal',
        authorizedForSeparateTargetRepoRepairGoal: true
      })
    ]);
    expect(outputs.authorization.blockedActions).toContain('target_repo_file_mutation');
    expect(outputs.authorization.blockedActions).toContain('public_launch');
    expect(outputs.targetRepairGoal.taskPackageStatus).toBe('ready_for_separate_target_repo_repair_goal');
    expect(outputs.targetRepairGoal.approvedRepairGoals).toEqual([
      expect.objectContaining({
        goalId: 'target-repo-repair-goal-target_repo_manual_repair_goal',
        executionMode: 'separate_authorized_target_repo_repair_goal'
      })
    ]);
    expect(outputs.targetRepairGoal.blockedActions).toContain('target_repo_file_mutation');
    expect(outputs.targetRepairGoal.blockedActions).toContain('public_launch');
    expect(outputs.targetRepairEvidence.schemaVersion).toBe('repoassure.ai-ide-target-repo-repair-goal-execution-evidence-intake-report.v1');
    expect(outputs.targetRepairEvidence.intakeStatus).toBe('ready_for_maintainer_review');
    expect(outputs.targetRepairEvidence.executionSummary).toMatchObject({
      verifiedGoals: 1,
      boundaryViolations: 0,
      filesChanged: 2
    });
    expect(outputs.targetRepairEvidence.goalReports).toEqual([
      expect.objectContaining({
        goalId: 'target-repo-repair-goal-target_repo_manual_repair_goal',
        verificationStatus: 'passed',
        nonAuthorizationBoundaryMaintained: true
      })
    ]);
    expect(outputs.targetRepairEvidence.blockedActions).toContain('target_repo_commit_creation');
    expect(outputs.targetRepairEvidence.blockedActions).toContain('public_launch');
    expect(outputs.targetRepairReview.schemaVersion).toBe('repoassure.ai-ide-target-repair-evidence-review-decision-package.v1');
    expect(outputs.targetRepairReview.reviewStatus).toBe('accepted_for_target_repo_acceptance');
    expect(outputs.targetRepairReview.decisionSummary).toMatchObject({
      acceptedGoals: 1,
      unreviewedGoals: 0
    });
    expect(outputs.targetRepairReview.acceptedEvidenceScope).toEqual([
      expect.objectContaining({
        goalId: 'target-repo-repair-goal-target_repo_manual_repair_goal',
        acceptedEvidenceScope: ['verified mutation summary', 'passed pnpm test', 'passed pnpm lint']
      })
    ]);
    expect(outputs.targetRepairReview.blockedActions).toContain('target_repo_pull_request_creation');
    expect(outputs.targetRepairReview.blockedActions).toContain('hosted_dashboard_availability_claim');
    expect(outputs.blockedGoalRecovery.schemaVersion).toBe('repoassure.blocked-goal-recovery-package.v1');
    expect(outputs.blockedGoalRecovery.recoveryStatus).toBe('requires_maintainer_or_external_action');
    expect(outputs.blockedGoalRecovery.blockerSummary).toMatchObject({
      totalBlockers: 2,
      automaticRecoveryActions: 1,
      maintainerDecisionRequests: 1
    });
    expect(outputs.blockedGoalRecovery.blockedActions).toContain('target_repo_pull_request_creation');
    expect(outputs.blockedGoalRecovery.blockedActions).toContain('hosted_dashboard_availability_claim');
    expect(outputs.blockedGoalRecoveryConsumption.schemaVersion).toBe('repoassure.blocked-goal-recovery-consumption-report.v1');
    expect(outputs.blockedGoalRecoveryConsumption.resumeReadiness).toBe('waiting_for_maintainer_or_external_action');
    expect(outputs.blockedGoalRecoveryConsumption.boundaryCompliance.recoveryCommandsExecuted).toBe(false);
    expect(outputs.blockedGoalRecoveryConsumption.boundaryCompliance.blockedActionsPreserved).toBe(true);
    expect(outputs.blockedGoalRecoveryConsumption.resumeCommands).toEqual([
      expect.objectContaining({
        command: 'codex resume goal',
        purpose: 'Resume the blocked fixture goal after maintainer decision.'
      })
    ]);
    expect(outputs.blockedGoalRecoveryConsumption.blockedActions).toContain('target_repo_pull_request_creation');
    expect(outputs.blockedGoalRecoveryDecisionReceipt.schemaVersion).toBe('repoassure.blocked-goal-recovery-decision-receipt.v1');
    expect(outputs.blockedGoalRecoveryDecisionReceipt.decisionStatus).toBe('approved_for_separate_resume_attempt');
    expect(outputs.blockedGoalRecoveryDecisionReceipt.boundaryCompliance.resumeCommandsExecuted).toBe(false);
    expect(outputs.blockedGoalRecoveryDecisionReceipt.blockedActions).toContain('pricing_change');
    expect(outputs.bundle.readingOrder.map((item) => item.fileName)).toEqual([
      'ai-ide-repair-playbook.json',
      'ai-ide-playbook-consumption-report.json',
      'ai-ide-repair-decision-package.json',
      'ai-ide-repair-approval-receipt.json',
      'ai-ide-approved-repair-execution-plan.json',
      'ai-ide-repair-execution-evidence-report.json'
    ]);
    expect(outputs.evidence.itemReports).toEqual([
      expect.objectContaining({
        sourceActionId: 'P1-fix-target-regression',
        readOrderCompliance: 'complete',
        nonAuthorizationBoundaryMaintained: true
      })
    ]);
    expect(outputs.consumption.dryRunDecision.blockedActions).toContain('target_repo_file_mutation');
    expect(outputs.evidenceMarkdown).toContain('# RepoAssure AI IDE Repair Execution Evidence Report');
    expect(outputs.evidenceMarkdown).toContain('## Boundary Report');
    expect(outputs.bundleMarkdown).toContain('# RepoAssure AI IDE Repair Evidence Bundle Manifest');
    expect(outputs.bundleMarkdown).toContain('## Artifact Inventory');
    expect(outputs.contractMarkdown).toContain('# RepoAssure AI IDE Repair Evidence Consumer Contract');
    expect(outputs.replayMarkdown).toContain('# RepoAssure AI IDE Repair Execution Replay Readiness');
    expect(outputs.replayMarkdown).toContain('## Next Review Decision');
    expect(outputs.proposalMarkdown).toContain('# RepoAssure AI IDE Target Repo Repair Goal Proposal Package');
    expect(outputs.proposalMarkdown).toContain('## Repair Task Breakdown');
    expect(outputs.proposalMarkdown).toContain('## Maintainer Approval Boundary');
    expect(outputs.authorizationMarkdown).toContain('# RepoAssure AI IDE Target Repo Repair Goal Authorization Receipt');
    expect(outputs.authorizationMarkdown).toContain('## Approved Scope');
    expect(outputs.authorizationMarkdown).toContain('## Non-Authorization Boundary');
    expect(outputs.targetRepairGoalMarkdown).toContain('# RepoAssure AI IDE Authorized Target Repo Repair Goal Task Package');
    expect(outputs.targetRepairGoalMarkdown).toContain('## Approved Repair Goals');
    expect(outputs.targetRepairGoalMarkdown).toContain('## Non-Authorization Boundary');
    expect(outputs.targetRepairEvidenceMarkdown).toContain('# RepoAssure AI IDE Target Repo Repair Goal Execution Evidence Intake Report');
    expect(outputs.targetRepairEvidenceMarkdown).toContain('## Goal Reports');
    expect(outputs.targetRepairEvidenceMarkdown).toContain('## Boundary Report');
    expect(outputs.targetRepairReviewMarkdown).toContain('# RepoAssure AI IDE Target Repair Evidence Review Decision Package');
    expect(outputs.targetRepairReviewMarkdown).toContain('## Review Decisions');
    expect(outputs.targetRepairReviewMarkdown).toContain('## Non-Authorization Boundary');
    expect(outputs.blockedGoalRecoveryMarkdown).toContain('# RepoAssure Blocked Goal Recovery Package');
    expect(outputs.blockedGoalRecoveryMarkdown).toContain('## Blockers');
    expect(outputs.blockedGoalRecoveryMarkdown).toContain('## Resume Commands');
    expect(outputs.blockedGoalRecoveryConsumptionMarkdown).toContain('# RepoAssure Blocked Goal Recovery Consumption Report');
    expect(outputs.blockedGoalRecoveryConsumptionMarkdown).toContain('## Recovery Action Queue');
    expect(outputs.blockedGoalRecoveryConsumptionMarkdown).toContain('## Resume Checklist');
    expect(outputs.blockedGoalRecoveryConsumptionMarkdown).toContain('## Reviewed Resume Commands');
    expect(outputs.evidenceMarkdown).toContain(
      'No target repo branch, commit, pull request, issue, advisory, or file mutation is executed by this report.'
    );
    expect(JSON.stringify(outputs)).not.toContain('secret-value');
    expect(await listExpectedArtifactNames(outputDir)).toEqual([
      'ai-ide-approved-repair-execution-plan.json',
      'ai-ide-approved-repair-execution-plan.md',
      'ai-ide-authorized-target-repo-repair-goal-task-package.json',
      'ai-ide-authorized-target-repo-repair-goal-task-package.md',
      'ai-ide-playbook-consumption-report.json',
      'ai-ide-playbook-consumption-report.md',
      'ai-ide-repair-approval-receipt.json',
      'ai-ide-repair-approval-receipt.md',
      'ai-ide-repair-decision-package.json',
      'ai-ide-repair-decision-package.md',
      'ai-ide-repair-evidence-bundle-manifest.json',
      'ai-ide-repair-evidence-bundle-manifest.md',
      'ai-ide-repair-evidence-consumer-contract.json',
      'ai-ide-repair-evidence-consumer-contract.md',
      'ai-ide-repair-execution-evidence-report.json',
      'ai-ide-repair-execution-evidence-report.md',
      'ai-ide-repair-execution-replay-readiness.json',
      'ai-ide-repair-execution-replay-readiness.md',
      'ai-ide-repair-playbook.json',
      'ai-ide-repair-playbook.md',
      'ai-ide-target-repair-evidence-review-decision-package.json',
      'ai-ide-target-repair-evidence-review-decision-package.md',
      'ai-ide-target-repo-repair-goal-authorization-receipt.json',
      'ai-ide-target-repo-repair-goal-authorization-receipt.md',
      'ai-ide-target-repo-repair-goal-execution-evidence-intake-report.json',
      'ai-ide-target-repo-repair-goal-execution-evidence-intake-report.md',
      'ai-ide-target-repo-repair-goal-proposal-package.json',
      'ai-ide-target-repo-repair-goal-proposal-package.md',
      'blocked-goal-recovery-consumption-report.json',
      'blocked-goal-recovery-consumption-report.md',
      'blocked-goal-recovery-decision-receipt.json',
      'blocked-goal-recovery-decision-receipt.md',
      'blocked-goal-recovery-package.json',
      'blocked-goal-recovery-package.md'
    ]);
  }, SCRIPT_TEST_TIMEOUT_MS);
});

async function runScript(args: string[]): Promise<void> {
  const command = args[0] as keyof typeof SCRIPT_PATHS;
  const scriptPath = SCRIPT_PATHS[command];

  if (!scriptPath) {
    throw new Error(`Unknown campaign script: ${String(args[0])}`);
  }

  const scriptArgs = args[1] === '--' ? args.slice(2) : args.slice(1);
  const { stderr } = await execFileAsync('node', [scriptPath, ...scriptArgs], {
    cwd: process.cwd(),
    timeout: SCRIPT_TEST_TIMEOUT_MS
  });

  expect(stderr).toBe('');
}

async function buildAcceptancePackage(): Promise<void> {
  const { stderr } = await execFileAsync('pnpm', ['build:acceptance'], {
    cwd: process.cwd(),
    timeout: SCRIPT_TEST_TIMEOUT_MS
  });

  expect(stderr).toBe('');
}

async function readArtifacts(outputDir: string): Promise<{
  playbook: { schemaVersion: string };
  consumption: {
    schemaVersion: string;
    dryRunDecision: { blockedActions: string[] };
  };
  decision: {
    schemaVersion: string;
    decisionSummary: { manualRepairCandidates: number };
    decisionItems: Array<{ sourceActionId: string; decisionType: string }>;
  };
  receipt: {
    schemaVersion: string;
    receiptSummary: { approvedManualRepairCandidates: number };
  };
  plan: {
    schemaVersion: string;
    executionSummary: { approvedExecutionItems: number };
  };
  evidence: {
    schemaVersion: string;
    evidenceSummary: { verifiedItems: number; boundaryViolations: number };
    itemReports: Array<{
      sourceActionId: string;
      readOrderCompliance: string;
      nonAuthorizationBoundaryMaintained: boolean;
    }>;
  };
  bundle: {
    schemaVersion: string;
    bundleSummary: { currentStatus: string; verifiedItems: number; boundaryViolations: number };
    readingOrder: Array<{ fileName: string }>;
  };
  contract: {
    schemaVersion: string;
    consumerReadiness: string;
    artifactReadSequence: Array<{ fileName: string }>;
  };
  replay: {
    schemaVersion: string;
    replayReadiness: string;
    boundaryReplay: { blockedActionsEnforced: boolean };
    nextReviewDecision: { decision: string };
  };
  proposal: {
    schemaVersion: string;
    proposalReadiness: string;
    artifactReadOrder: Array<{ fileName: string }>;
    repairTaskBreakdown: Array<{ taskId: string }>;
    verificationCommands: Array<{ command: string; executionMode: string }>;
    blockedActions: string[];
  };
  authorization: {
    schemaVersion: string;
    authorizationStatus: string;
    decisionSummary: { approvedTargetRepairGoalScopes: number };
    approvedScope: Array<{ scopeId: string; authorizedForSeparateTargetRepoRepairGoal: boolean }>;
    blockedActions: string[];
  };
  targetRepairGoal: {
    schemaVersion: string;
    taskPackageStatus: string;
    approvedRepairGoals: Array<{ goalId: string; executionMode: string }>;
    blockedActions: string[];
  };
  targetRepairEvidence: {
    schemaVersion: string;
    intakeStatus: string;
    executionSummary: { verifiedGoals: number; boundaryViolations: number; filesChanged: number };
    goalReports: Array<{
      goalId: string;
      verificationStatus: string;
      nonAuthorizationBoundaryMaintained: boolean;
    }>;
    blockedActions: string[];
  };
  targetRepairReview: {
    schemaVersion: string;
    reviewStatus: string;
    decisionSummary: { acceptedGoals: number; unreviewedGoals: number };
    acceptedEvidenceScope: Array<{ goalId: string; acceptedEvidenceScope: string[] }>;
    blockedActions: string[];
  };
  blockedGoalRecovery: {
    schemaVersion: string;
    recoveryStatus: string;
    blockerSummary: {
      totalBlockers: number;
      automaticRecoveryActions: number;
      maintainerDecisionRequests: number;
    };
    blockedActions: string[];
  };
  blockedGoalRecoveryConsumption: {
    schemaVersion: string;
    resumeReadiness: string;
    resumeCommands: Array<{ command: string; purpose: string }>;
    boundaryCompliance: { recoveryCommandsExecuted: boolean; blockedActionsPreserved: boolean };
    blockedActions: string[];
  };
  evidenceMarkdown: string;
  bundleMarkdown: string;
  contractMarkdown: string;
  replayMarkdown: string;
  proposalMarkdown: string;
  authorizationMarkdown: string;
  targetRepairGoalMarkdown: string;
  targetRepairEvidenceMarkdown: string;
  targetRepairReviewMarkdown: string;
  blockedGoalRecoveryMarkdown: string;
  blockedGoalRecoveryConsumptionMarkdown: string;
}> {
  return {
    playbook: JSON.parse(await readFile(join(outputDir, 'ai-ide-repair-playbook.json'), 'utf8')) as { schemaVersion: string },
    consumption: JSON.parse(await readFile(join(outputDir, 'ai-ide-playbook-consumption-report.json'), 'utf8')) as {
      schemaVersion: string;
      dryRunDecision: { blockedActions: string[] };
    },
    decision: JSON.parse(await readFile(join(outputDir, 'ai-ide-repair-decision-package.json'), 'utf8')) as {
      schemaVersion: string;
      decisionSummary: { manualRepairCandidates: number };
      decisionItems: Array<{ sourceActionId: string; decisionType: string }>;
    },
    receipt: JSON.parse(await readFile(join(outputDir, 'ai-ide-repair-approval-receipt.json'), 'utf8')) as {
      schemaVersion: string;
      receiptSummary: { approvedManualRepairCandidates: number };
    },
    plan: JSON.parse(await readFile(join(outputDir, 'ai-ide-approved-repair-execution-plan.json'), 'utf8')) as {
      schemaVersion: string;
      executionSummary: { approvedExecutionItems: number };
    },
    evidence: JSON.parse(await readFile(join(outputDir, 'ai-ide-repair-execution-evidence-report.json'), 'utf8')) as {
      schemaVersion: string;
      evidenceSummary: { verifiedItems: number; boundaryViolations: number };
      itemReports: Array<{
        sourceActionId: string;
        readOrderCompliance: string;
        nonAuthorizationBoundaryMaintained: boolean;
      }>;
    },
    bundle: JSON.parse(await readFile(join(outputDir, 'ai-ide-repair-evidence-bundle-manifest.json'), 'utf8')) as {
      schemaVersion: string;
      bundleSummary: { currentStatus: string; verifiedItems: number; boundaryViolations: number };
      readingOrder: Array<{ fileName: string }>;
    },
    contract: JSON.parse(await readFile(join(outputDir, 'ai-ide-repair-evidence-consumer-contract.json'), 'utf8')) as {
      schemaVersion: string;
      consumerReadiness: string;
      artifactReadSequence: Array<{ fileName: string }>;
    },
    replay: JSON.parse(await readFile(join(outputDir, 'ai-ide-repair-execution-replay-readiness.json'), 'utf8')) as {
      schemaVersion: string;
      replayReadiness: string;
      boundaryReplay: { blockedActionsEnforced: boolean };
      nextReviewDecision: { decision: string };
    },
    proposal: JSON.parse(await readFile(join(outputDir, 'ai-ide-target-repo-repair-goal-proposal-package.json'), 'utf8')) as {
      schemaVersion: string;
      proposalReadiness: string;
      artifactReadOrder: Array<{ fileName: string }>;
      repairTaskBreakdown: Array<{ taskId: string }>;
      verificationCommands: Array<{ command: string; executionMode: string }>;
      blockedActions: string[];
    },
    authorization: JSON.parse(await readFile(join(outputDir, 'ai-ide-target-repo-repair-goal-authorization-receipt.json'), 'utf8')) as {
      schemaVersion: string;
      authorizationStatus: string;
      decisionSummary: { approvedTargetRepairGoalScopes: number };
      approvedScope: Array<{ scopeId: string; authorizedForSeparateTargetRepoRepairGoal: boolean }>;
      blockedActions: string[];
    },
    targetRepairGoal: JSON.parse(await readFile(join(outputDir, 'ai-ide-authorized-target-repo-repair-goal-task-package.json'), 'utf8')) as {
      schemaVersion: string;
      taskPackageStatus: string;
      approvedRepairGoals: Array<{ goalId: string; executionMode: string }>;
      blockedActions: string[];
    },
    targetRepairEvidence: JSON.parse(await readFile(join(outputDir, 'ai-ide-target-repo-repair-goal-execution-evidence-intake-report.json'), 'utf8')) as {
      schemaVersion: string;
      intakeStatus: string;
      executionSummary: { verifiedGoals: number; boundaryViolations: number; filesChanged: number };
      goalReports: Array<{
        goalId: string;
        verificationStatus: string;
        nonAuthorizationBoundaryMaintained: boolean;
      }>;
      blockedActions: string[];
    },
    targetRepairReview: JSON.parse(await readFile(join(outputDir, 'ai-ide-target-repair-evidence-review-decision-package.json'), 'utf8')) as {
      schemaVersion: string;
      reviewStatus: string;
      decisionSummary: { acceptedGoals: number; unreviewedGoals: number };
      acceptedEvidenceScope: Array<{ goalId: string; acceptedEvidenceScope: string[] }>;
      blockedActions: string[];
    },
    blockedGoalRecovery: JSON.parse(await readFile(join(outputDir, 'blocked-goal-recovery-package.json'), 'utf8')) as {
      schemaVersion: string;
      recoveryStatus: string;
      blockerSummary: {
        totalBlockers: number;
        automaticRecoveryActions: number;
        maintainerDecisionRequests: number;
      };
      blockedActions: string[];
    },
    blockedGoalRecoveryConsumption: JSON.parse(await readFile(join(outputDir, 'blocked-goal-recovery-consumption-report.json'), 'utf8')) as {
      schemaVersion: string;
      resumeReadiness: string;
      resumeCommands: Array<{ command: string; purpose: string }>;
      boundaryCompliance: { recoveryCommandsExecuted: boolean; blockedActionsPreserved: boolean };
      blockedActions: string[];
    },
    blockedGoalRecoveryDecisionReceipt: JSON.parse(await readFile(join(outputDir, 'blocked-goal-recovery-decision-receipt.json'), 'utf8')) as {
      schemaVersion: string;
      decisionStatus: string;
      boundaryCompliance: { resumeCommandsExecuted: boolean; sourceBoundaryPreserved: boolean };
      blockedActions: string[];
    },
    evidenceMarkdown: await readFile(join(outputDir, 'ai-ide-repair-execution-evidence-report.md'), 'utf8'),
    bundleMarkdown: await readFile(join(outputDir, 'ai-ide-repair-evidence-bundle-manifest.md'), 'utf8'),
    contractMarkdown: await readFile(join(outputDir, 'ai-ide-repair-evidence-consumer-contract.md'), 'utf8'),
    replayMarkdown: await readFile(join(outputDir, 'ai-ide-repair-execution-replay-readiness.md'), 'utf8'),
    proposalMarkdown: await readFile(join(outputDir, 'ai-ide-target-repo-repair-goal-proposal-package.md'), 'utf8'),
    authorizationMarkdown: await readFile(join(outputDir, 'ai-ide-target-repo-repair-goal-authorization-receipt.md'), 'utf8'),
    targetRepairGoalMarkdown: await readFile(join(outputDir, 'ai-ide-authorized-target-repo-repair-goal-task-package.md'), 'utf8'),
    targetRepairEvidenceMarkdown: await readFile(join(outputDir, 'ai-ide-target-repo-repair-goal-execution-evidence-intake-report.md'), 'utf8'),
    targetRepairReviewMarkdown: await readFile(join(outputDir, 'ai-ide-target-repair-evidence-review-decision-package.md'), 'utf8'),
    blockedGoalRecoveryMarkdown: await readFile(join(outputDir, 'blocked-goal-recovery-package.md'), 'utf8'),
    blockedGoalRecoveryConsumptionMarkdown: await readFile(join(outputDir, 'blocked-goal-recovery-consumption-report.md'), 'utf8')
  };
}

async function listExpectedArtifactNames(outputDir: string): Promise<string[]> {
  const names = [
    'ai-ide-approved-repair-execution-plan.json',
    'ai-ide-approved-repair-execution-plan.md',
    'ai-ide-playbook-consumption-report.json',
    'ai-ide-playbook-consumption-report.md',
    'ai-ide-repair-approval-receipt.json',
    'ai-ide-repair-approval-receipt.md',
    'ai-ide-repair-decision-package.json',
    'ai-ide-repair-decision-package.md',
    'ai-ide-repair-execution-evidence-report.json',
    'ai-ide-repair-execution-evidence-report.md',
    'ai-ide-repair-evidence-bundle-manifest.json',
    'ai-ide-repair-evidence-bundle-manifest.md',
    'ai-ide-repair-evidence-consumer-contract.json',
    'ai-ide-repair-evidence-consumer-contract.md',
    'ai-ide-repair-execution-replay-readiness.json',
    'ai-ide-repair-execution-replay-readiness.md',
    'ai-ide-authorized-target-repo-repair-goal-task-package.json',
    'ai-ide-authorized-target-repo-repair-goal-task-package.md',
    'ai-ide-target-repo-repair-goal-execution-evidence-intake-report.json',
    'ai-ide-target-repo-repair-goal-execution-evidence-intake-report.md',
    'ai-ide-target-repo-repair-goal-authorization-receipt.json',
    'ai-ide-target-repo-repair-goal-authorization-receipt.md',
    'ai-ide-target-repo-repair-goal-proposal-package.json',
    'ai-ide-target-repo-repair-goal-proposal-package.md',
    'ai-ide-target-repair-evidence-review-decision-package.json',
    'ai-ide-target-repair-evidence-review-decision-package.md',
    'blocked-goal-recovery-consumption-report.json',
    'blocked-goal-recovery-consumption-report.md',
    'blocked-goal-recovery-decision-receipt.json',
    'blocked-goal-recovery-decision-receipt.md',
    'blocked-goal-recovery-package.json',
    'blocked-goal-recovery-package.md',
    'ai-ide-repair-playbook.json',
    'ai-ide-repair-playbook.md'
  ];

  await Promise.all(names.map((name) => readFile(join(outputDir, name), 'utf8')));

  return names.sort();
}
