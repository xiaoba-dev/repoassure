import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const SCRIPT_TEST_TIMEOUT_MS = 30_000;

describe('target repair evidence review decision package script', () => {
  it('generates a review decision package from one local intake report directory', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-playbook-target-repair-review-'));
    const secretRoot = join(root, 'campaign-TOKEN=secret-value');

    await mkdir(secretRoot, { recursive: true });
    await writeFile(
      join(secretRoot, 'ai-ide-target-repo-repair-goal-execution-evidence-intake-report.json'),
      `${JSON.stringify(buildIntakeReport(), null, 2)}\n`
    );
    await writeFile(
      join(secretRoot, 'target-repair-evidence-review-decisions.json'),
      `${JSON.stringify({
        decisions: [
          {
            goalId: 'target-repo-repair-goal-target_repo_manual_repair_goal',
            decision: 'accept',
            evidence: 'Fixture maintainer accepted target repair evidence after local review.',
            reviewerRole: 'target_repo_maintainer',
            acceptedEvidenceScope: ['verified mutation summary', '/private/tmp/repo-TOKEN=secret-value/verification.log']
          }
        ]
      }, null, 2)}\n`
    );

    const { stdout, stderr } = await execFileAsync(
      'pnpm',
      [
        'playbook:target-repair-review',
        '--',
        '--from-dir',
        secretRoot
      ],
      { cwd: process.cwd(), timeout: SCRIPT_TEST_TIMEOUT_MS }
    );
    const jsonPath = join(secretRoot, 'ai-ide-target-repair-evidence-review-decision-package.json');
    const markdownPath = join(secretRoot, 'ai-ide-target-repair-evidence-review-decision-package.md');
    const json = await readFile(jsonPath, 'utf8');
    const markdown = await readFile(markdownPath, 'utf8');
    const decisionPackage = JSON.parse(json) as {
      schemaVersion: string;
      reviewStatus: string;
      decisionSummary: { acceptedGoals: number; unreviewedGoals: number };
      acceptedEvidenceScope: Array<{ goalId: string; acceptedEvidenceScope: string[] }>;
      blockedActions: string[];
    };

    expect(stderr).toBe('');
    expect(stdout).toContain(`Wrote ${jsonPath}`);
    expect(stdout).toContain(`Wrote ${markdownPath}`);
    expect(decisionPackage.schemaVersion).toBe('repoassure.ai-ide-target-repair-evidence-review-decision-package.v1');
    expect(decisionPackage.reviewStatus).toBe('accepted_for_target_repo_acceptance');
    expect(decisionPackage.decisionSummary).toMatchObject({
      acceptedGoals: 1,
      unreviewedGoals: 0
    });
    expect(decisionPackage.acceptedEvidenceScope).toEqual([
      expect.objectContaining({
        goalId: 'target-repo-repair-goal-target_repo_manual_repair_goal',
        acceptedEvidenceScope: ['verified mutation summary', '/private/tmp/repo-TOKEN=[REDACTED]/verification.log']
      })
    ]);
    expect(decisionPackage.blockedActions).toContain('target_repo_pull_request_creation');
    expect(decisionPackage.blockedActions).toContain('public_launch');
    expect(markdown).toContain('# RepoAssure AI IDE Target Repair Evidence Review Decision Package');
    expect(markdown).toContain('## Review Decisions');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  }, SCRIPT_TEST_TIMEOUT_MS);

  it('reports documented CLI flags when required input is missing', async () => {
    await expect(execFileAsync(
      'node',
      [
        'scripts/generate-ai-ide-target-repair-evidence-review-decision-package.mjs',
        '--output',
        'artifacts/campaign'
      ],
      { cwd: process.cwd(), timeout: SCRIPT_TEST_TIMEOUT_MS }
    )).rejects.toMatchObject({
      stderr: expect.stringContaining('--intake-report or --from-dir is required')
    });
  }, SCRIPT_TEST_TIMEOUT_MS);
});

function buildIntakeReport() {
  return {
    schemaVersion: 'repoassure.ai-ide-target-repo-repair-goal-execution-evidence-intake-report.v1',
    generatedAt: '2026-07-09T02:00:00.000Z',
    intakeStatus: 'ready_for_maintainer_review',
    sourceTaskPackage: {
      schemaVersion: 'repoassure.ai-ide-authorized-target-repo-repair-goal-task-package.v1',
      fileName: 'ai-ide-authorized-target-repo-repair-goal-task-package.json',
      path: '/private/tmp/repoassure-target-review-TOKEN=secret-value/ai-ide-authorized-target-repo-repair-goal-task-package.json',
      sha256: 'a'.repeat(64),
      taskPackageStatus: 'ready_for_separate_target_repo_repair_goal',
      approvedRepairGoals: 1
    },
    executionSummary: {
      totalApprovedRepairGoals: 1,
      verifiedGoals: 1,
      blockedGoals: 0,
      failedGoals: 0,
      notStartedGoals: 0,
      boundaryViolations: 0,
      filesChanged: 2,
      linesAdded: 14,
      linesRemoved: 3
    },
    goalReports: [
      {
        goalId: 'target-repo-repair-goal-target_repo_manual_repair_goal',
        scopeId: 'target_repo_manual_repair_goal',
        executionStatus: 'verified',
        verificationStatus: 'passed',
        verificationRequirements: ['pnpm test', 'pnpm lint'],
        verificationResults: [
          {
            command: 'pnpm test',
            status: 'passed',
            evidence: 'Target repo tests passed.'
          }
        ],
        actualMutationSummary: {
          filesChanged: 2,
          linesAdded: 14,
          linesRemoved: 3,
          summary: 'Patched target login validation.',
          evidenceRefs: ['target diff summary']
        },
        maintainerReviewStatus: 'pending_review',
        nonAuthorizationBoundaryMaintained: true,
        notes: 'No target repo branch, commit, pull request, issue, advisory, or release was created.'
      }
    ],
    boundaryReport: {
      boundaryViolations: 0,
      unauthorizedActions: [],
      targetRepoMutationNotPerformedByRepoAssure: true,
      notes: 'No boundary violation.'
    },
    reviewChecklist: ['Confirm verification results before accepting evidence.'],
    maintainerReviewBoundary: 'Imported evidence must be reviewed by maintainer.',
    nonAuthorizationBoundary: 'This intake report records evidence only.',
    redactionBoundary: 'Use sanitized local summaries only.',
    blockedActions: [
      'target_repo_file_mutation_by_repoassure',
      'target_repo_branch_creation',
      'target_repo_commit_creation',
      'public_launch'
    ]
  };
}
