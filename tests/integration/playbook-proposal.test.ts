import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const SCRIPT_TEST_TIMEOUT_MS = 30_000;

describe('target repo repair goal proposal package script', () => {
  it('generates a proposal package from one local replay readiness directory', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-playbook-proposal-'));
    const secretRoot = join(root, 'campaign-TOKEN=secret-value');

    await mkdir(secretRoot, { recursive: true });
    await writeFile(
      join(secretRoot, 'ai-ide-repair-execution-replay-readiness.json'),
      `${JSON.stringify(buildReplayReadiness(), null, 2)}\n`
    );

    const { stdout, stderr } = await execFileAsync(
      'pnpm',
      [
        'playbook:proposal',
        '--',
        '--from-dir',
        secretRoot
      ],
      { cwd: process.cwd(), timeout: SCRIPT_TEST_TIMEOUT_MS }
    );
    const jsonPath = join(secretRoot, 'ai-ide-target-repo-repair-goal-proposal-package.json');
    const markdownPath = join(secretRoot, 'ai-ide-target-repo-repair-goal-proposal-package.md');
    const json = await readFile(jsonPath, 'utf8');
    const markdown = await readFile(markdownPath, 'utf8');
    const proposal = JSON.parse(json) as {
      schemaVersion: string;
      proposalReadiness: string;
      artifactReadOrder: Array<{ fileName: string }>;
      repairTaskBreakdown: Array<{ taskId: string }>;
      verificationCommands: Array<{ command: string; executionMode: string }>;
      blockedActions: string[];
    };

    expect(stderr).toBe('');
    expect(stdout).toContain(`Wrote ${jsonPath}`);
    expect(stdout).toContain(`Wrote ${markdownPath}`);
    expect(proposal.schemaVersion).toBe('repoassure.ai-ide-target-repo-repair-goal-proposal-package.v1');
    expect(proposal.proposalReadiness).toBe('ready_for_maintainer_goal_authorization');
    expect(proposal.artifactReadOrder).toHaveLength(7);
    expect(proposal.repairTaskBreakdown.map((task) => task.taskId)).toContain('T2-apply-maintainer-approved-repair');
    expect(proposal.verificationCommands[0]).toMatchObject({
      command: '<maintainer-provided target repo verification command>',
      executionMode: 'proposed_not_executed'
    });
    expect(proposal.blockedActions).toContain('target_repo_file_mutation');
    expect(proposal.blockedActions).toContain('public_launch');
    expect(markdown).toContain('# RepoAssure AI IDE Target Repo Repair Goal Proposal Package');
    expect(markdown).toContain('## Maintainer Approval Boundary');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  }, SCRIPT_TEST_TIMEOUT_MS);

  it('reports the documented CLI flag name when input is missing', async () => {
    await expect(execFileAsync(
      'node',
      [
        'scripts/generate-ai-ide-target-repo-repair-goal-proposal-package.mjs',
        '--output',
        'artifacts/campaign'
      ],
      { cwd: process.cwd(), timeout: SCRIPT_TEST_TIMEOUT_MS }
    )).rejects.toMatchObject({
      stderr: expect.stringContaining('--replay-readiness or --from-dir is required')
    });
  }, SCRIPT_TEST_TIMEOUT_MS);
});

function buildReplayReadiness() {
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
    artifactReplay: [
      ['ai_ide_repair_playbook', 'ai-ide-repair-playbook.json', 'campaign_context_and_action_queue'],
      ['ai_ide_playbook_consumption_report', 'ai-ide-playbook-consumption-report.json', 'dry_run_understanding_and_blocked_actions'],
      ['ai_ide_repair_decision_package', 'ai-ide-repair-decision-package.json', 'repair_decision_classification'],
      ['ai_ide_repair_approval_receipt', 'ai-ide-repair-approval-receipt.json', 'maintainer_approval_receipt'],
      ['ai_ide_approved_repair_execution_plan', 'ai-ide-approved-repair-execution-plan.json', 'approved_execution_plan'],
      ['ai_ide_repair_execution_evidence_report', 'ai-ide-repair-execution-evidence-report.json', 'execution_evidence_and_boundary_report']
    ].map(([artifactKind, fileName, role], index) => ({
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
