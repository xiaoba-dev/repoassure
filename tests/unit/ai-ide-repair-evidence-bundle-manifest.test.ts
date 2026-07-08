import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildAiIdeRepairEvidenceBundleManifest,
  buildAiIdeRepairEvidenceBundleManifestMarkdown,
  writeAiIdeRepairEvidenceBundleManifest,
  writeAiIdeRepairEvidenceBundleManifestFromDirectory
} from '../../packages/acceptance/src/ai-ide-repair-evidence-bundle-manifest.js';

describe('AI IDE repair evidence bundle manifest', () => {
  it('summarizes the full repair evidence artifact chain as a single AI IDE entry point', () => {
    const root = '/private/tmp/repoassure-bundle-TOKEN=secret-value';
    const manifest = buildAiIdeRepairEvidenceBundleManifest({
      generatedAt: '2026-07-08T10:00:00.000Z',
      artifacts: buildBundleArtifacts(root)
    });
    const markdown = buildAiIdeRepairEvidenceBundleManifestMarkdown(manifest);
    const serialized = JSON.stringify(manifest);

    expect(manifest.schemaVersion).toBe('repoassure.ai-ide-repair-evidence-bundle-manifest.v1');
    expect(manifest.bundleSummary).toMatchObject({
      totalArtifacts: 6,
      presentArtifacts: 6,
      missingArtifacts: 0,
      manualRepairCandidates: 1,
      approvedManualRepairCandidates: 1,
      approvedExecutionItems: 1,
      verifiedItems: 1,
      boundaryViolations: 0,
      currentStatus: 'verified_pending_maintainer_review'
    });
    expect(manifest.artifacts.map((artifact) => artifact.artifactKind)).toEqual([
      'ai_ide_repair_playbook',
      'ai_ide_playbook_consumption_report',
      'ai_ide_repair_decision_package',
      'ai_ide_repair_approval_receipt',
      'ai_ide_approved_repair_execution_plan',
      'ai_ide_repair_execution_evidence_report'
    ]);
    expect(manifest.artifacts).toEqual([
      expect.objectContaining({
        fileName: 'ai-ide-repair-playbook.json',
        schemaVersion: 'repoassure.ai-ide-repair-execution-playbook.v1',
        sha256: expect.stringMatching(/^[a-f0-9]{64}$/)
      }),
      expect.objectContaining({
        fileName: 'ai-ide-playbook-consumption-report.json',
        schemaVersion: 'repoassure.ai-ide-playbook-consumption-report.v1'
      }),
      expect.objectContaining({
        fileName: 'ai-ide-repair-decision-package.json',
        schemaVersion: 'repoassure.ai-ide-repair-decision-package.v1'
      }),
      expect.objectContaining({
        fileName: 'ai-ide-repair-approval-receipt.json',
        schemaVersion: 'repoassure.ai-ide-repair-approval-receipt.v1'
      }),
      expect.objectContaining({
        fileName: 'ai-ide-approved-repair-execution-plan.json',
        schemaVersion: 'repoassure.ai-ide-approved-repair-execution-plan.v1'
      }),
      expect.objectContaining({
        fileName: 'ai-ide-repair-execution-evidence-report.json',
        schemaVersion: 'repoassure.ai-ide-repair-execution-evidence-report.v1'
      })
    ]);
    expect(manifest.readingOrder).toHaveLength(6);
    expect(manifest.readingOrder[0]).toEqual(expect.objectContaining({
      artifactKind: 'ai_ide_repair_playbook',
      reason: 'Understand campaign context, target matrix, action queue, and required read order.'
    }));
    expect(manifest.readingOrder[5]).toEqual(expect.objectContaining({
      artifactKind: 'ai_ide_repair_execution_evidence_report',
      reason: 'Confirm execution evidence, read-order compliance, verification results, and boundary report before maintainer review.'
    }));
    expect(manifest.nextActions).toContain('Maintainer review may inspect the execution evidence report before any separate target repo merge or release action.');
    expect(manifest.boundaries.blockedActions).toContain('target_repo_file_mutation');
    expect(manifest.boundaries.nonAuthorizationBoundary).toContain('does not authorize target repo mutation');
    expect(markdown).toContain('# RepoAssure AI IDE Repair Evidence Bundle Manifest');
    expect(markdown).toContain('## Reading Order');
    expect(markdown).toContain('## Artifact Inventory');
    expect(markdown).toContain('No target repo branch, commit, pull request, issue, advisory, or file mutation is authorized by this manifest.');
    expect(serialized).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });

  it('writes json and markdown bundle manifest artifacts from local artifact files', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-repair-evidence-bundle-'));
    const secretRoot = join(root, 'campaign-TOKEN=secret-value');
    const outputDir = join(root, 'campaign-output');
    const artifactPaths = await writeBundleArtifactFiles(secretRoot);

    const result = await writeAiIdeRepairEvidenceBundleManifest({
      generatedAt: '2026-07-08T10:00:00.000Z',
      ...artifactPaths,
      outputDir
    });
    const json = await readFile(result.jsonPath, 'utf8');
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(result.jsonPath).toBe(join(outputDir, 'ai-ide-repair-evidence-bundle-manifest.json'));
    expect(result.markdownPath).toBe(join(outputDir, 'ai-ide-repair-evidence-bundle-manifest.md'));
    expect(result.manifest.bundleSummary.currentStatus).toBe('verified_pending_maintainer_review');
    expect(json).toContain('repoassure.ai-ide-repair-evidence-bundle-manifest.v1');
    expect(markdown).toContain('ai-ide-repair-execution-evidence-report.json');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });

  it('discovers the repair evidence artifact chain from one local directory', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-repair-evidence-bundle-dir-'));
    const secretRoot = join(root, 'campaign-TOKEN=secret-value');

    await writeBundleArtifactFiles(secretRoot);

    const result = await writeAiIdeRepairEvidenceBundleManifestFromDirectory({
      generatedAt: '2026-07-08T10:00:00.000Z',
      inputDir: secretRoot
    });
    const json = await readFile(result.jsonPath, 'utf8');
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(result.jsonPath).toBe(join(secretRoot, 'ai-ide-repair-evidence-bundle-manifest.json'));
    expect(result.markdownPath).toBe(join(secretRoot, 'ai-ide-repair-evidence-bundle-manifest.md'));
    expect(result.manifest.readingOrder.map((item) => item.fileName)).toEqual([
      'ai-ide-repair-playbook.json',
      'ai-ide-playbook-consumption-report.json',
      'ai-ide-repair-decision-package.json',
      'ai-ide-repair-approval-receipt.json',
      'ai-ide-approved-repair-execution-plan.json',
      'ai-ide-repair-execution-evidence-report.json'
    ]);
    expect(result.manifest.bundleSummary.currentStatus).toBe('verified_pending_maintainer_review');
    expect(markdown).toContain('## Reading Order');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });
});

function buildBundleArtifacts(root: string): Array<{
  artifactKind:
    | 'ai_ide_repair_playbook'
    | 'ai_ide_playbook_consumption_report'
    | 'ai_ide_repair_decision_package'
    | 'ai_ide_repair_approval_receipt'
    | 'ai_ide_approved_repair_execution_plan'
    | 'ai_ide_repair_execution_evidence_report';
  path: string;
  content: string;
}> {
  const artifactMap = buildArtifactContentMap(root);

  return [
    {
      artifactKind: 'ai_ide_repair_playbook',
      path: join(root, 'ai-ide-repair-playbook.json'),
      content: artifactMap.playbook
    },
    {
      artifactKind: 'ai_ide_playbook_consumption_report',
      path: join(root, 'ai-ide-playbook-consumption-report.json'),
      content: artifactMap.consumptionReport
    },
    {
      artifactKind: 'ai_ide_repair_decision_package',
      path: join(root, 'ai-ide-repair-decision-package.json'),
      content: artifactMap.decisionPackage
    },
    {
      artifactKind: 'ai_ide_repair_approval_receipt',
      path: join(root, 'ai-ide-repair-approval-receipt.json'),
      content: artifactMap.approvalReceipt
    },
    {
      artifactKind: 'ai_ide_approved_repair_execution_plan',
      path: join(root, 'ai-ide-approved-repair-execution-plan.json'),
      content: artifactMap.executionPlan
    },
    {
      artifactKind: 'ai_ide_repair_execution_evidence_report',
      path: join(root, 'ai-ide-repair-execution-evidence-report.json'),
      content: artifactMap.evidenceReport
    }
  ];
}

async function writeBundleArtifactFiles(root: string): Promise<{
  playbookPath: string;
  consumptionReportPath: string;
  decisionPackagePath: string;
  approvalReceiptPath: string;
  executionPlanPath: string;
  evidenceReportPath: string;
}> {
  await mkdir(root, { recursive: true });
  const artifactMap = buildArtifactContentMap(root);
  const paths = {
    playbookPath: join(root, 'ai-ide-repair-playbook.json'),
    consumptionReportPath: join(root, 'ai-ide-playbook-consumption-report.json'),
    decisionPackagePath: join(root, 'ai-ide-repair-decision-package.json'),
    approvalReceiptPath: join(root, 'ai-ide-repair-approval-receipt.json'),
    executionPlanPath: join(root, 'ai-ide-approved-repair-execution-plan.json'),
    evidenceReportPath: join(root, 'ai-ide-repair-execution-evidence-report.json')
  };

  await writeFile(paths.playbookPath, artifactMap.playbook);
  await writeFile(paths.consumptionReportPath, artifactMap.consumptionReport);
  await writeFile(paths.decisionPackagePath, artifactMap.decisionPackage);
  await writeFile(paths.approvalReceiptPath, artifactMap.approvalReceipt);
  await writeFile(paths.executionPlanPath, artifactMap.executionPlan);
  await writeFile(paths.evidenceReportPath, artifactMap.evidenceReport);

  return paths;
}

function buildArtifactContentMap(root: string): {
  playbook: string;
  consumptionReport: string;
  decisionPackage: string;
  approvalReceipt: string;
  executionPlan: string;
  evidenceReport: string;
} {
  return {
    playbook: toJson({
      schemaVersion: 'repoassure.ai-ide-repair-execution-playbook.v1',
      generatedAt: '2026-07-08T09:00:00.000Z',
      campaignContext: {
        totalTargets: 1,
        passedTargets: 0,
        blockedTargets: 0,
        failedTargets: 1,
        missingEvidenceTargets: 0,
        targetStatusMatrix: [
          {
            targetId: 'agent-reach',
            mode: 'cli',
            runStatus: 'failed',
            blockerCategory: 'unknown',
            nextRecommendedProductAction: 'fix_target_regression'
          }
        ]
      },
      executionPlan: [
        {
          sourceActionId: 'P1-fix-target-regression',
          targetIds: ['agent-reach'],
          readOrder: [
            {
              artifactKind: 'repair_task_package',
              path: join(root, 'agent-reach', 'repair-task-package.json')
            }
          ]
        }
      ],
      aiIdeConsumptionChecklist: ['Review campaignContext.targetStatusMatrix before editing target repos.'],
      maintainerReviewBoundary: 'Stop before modifying target repo files.',
      redactionBoundary: 'Local-only playbook.',
      nonAuthorizationBoundary: 'This playbook is guidance only.'
    }),
    consumptionReport: toJson({
      schemaVersion: 'repoassure.ai-ide-playbook-consumption-report.v1',
      generatedAt: '2026-07-08T09:05:00.000Z',
      campaignUnderstanding: {
        totalTargets: 1,
        passedTargets: 0,
        blockedTargets: 0,
        failedTargets: 1,
        missingEvidenceTargets: 0,
        targetDispositions: [
          {
            targetId: 'agent-reach',
            runStatus: 'failed',
            blockerCategory: 'unknown',
            nextRecommendedProductAction: 'fix_target_regression',
            recommendedHandling: 'repair_candidate_after_maintainer_review'
          }
        ]
      },
      repairTaskUnderstanding: [
        {
          sourceActionId: 'P1-fix-target-regression',
          targetIds: ['agent-reach'],
          maintainerReviewRequired: true
        }
      ],
      dryRunDecision: {
        blockedActions: [
          'target_repo_file_mutation',
          'target_repo_branch_creation',
          'target_repo_commit_creation'
        ]
      },
      maintainerReviewBoundary: 'Stop before modifying target repo files.',
      redactionBoundary: 'Local-only consumption report.',
      nonAuthorizationBoundary: 'This report is dry-run evidence only.'
    }),
    decisionPackage: toJson({
      schemaVersion: 'repoassure.ai-ide-repair-decision-package.v1',
      generatedAt: '2026-07-08T09:10:00.000Z',
      decisionSummary: {
        totalDecisionItems: 1,
        manualRepairCandidates: 1,
        environmentPrerequisites: 0,
        repoassureProductImprovements: 0,
        deferredOrBlocked: 0,
        noActionTargets: 0
      },
      decisionItems: [
        {
          sourceActionId: 'P1-fix-target-regression',
          decisionType: 'manual_repair_candidate'
        }
      ],
      maintainerReviewBoundary: 'Stop before modifying target repo files.',
      redactionBoundary: 'Local-only decision package.',
      nonAuthorizationBoundary: 'Decision package is review guidance only.'
    }),
    approvalReceipt: toJson({
      schemaVersion: 'repoassure.ai-ide-repair-approval-receipt.v1',
      generatedAt: '2026-07-08T09:15:00.000Z',
      receiptSummary: {
        totalApprovalItems: 1,
        approved: 1,
        rejected: 0,
        deferred: 0,
        acceptedRisk: 0,
        pending: 0,
        approvedManualRepairCandidates: 1
      },
      approvalItems: [
        {
          sourceActionId: 'P1-fix-target-regression',
          approvalDecision: 'approve',
          approvedForManualRepairExecution: true
        }
      ],
      blockedActions: ['target_repo_file_mutation'],
      maintainerReviewBoundary: 'Stop before modifying target repo files.',
      redactionBoundary: 'Local-only approval receipt.',
      nonAuthorizationBoundary: 'Approval receipt records decisions only.'
    }),
    executionPlan: toJson({
      schemaVersion: 'repoassure.ai-ide-approved-repair-execution-plan.v1',
      generatedAt: '2026-07-08T09:20:00.000Z',
      executionSummary: {
        totalApprovalItems: 1,
        approvedExecutionItems: 1,
        excludedApprovalItems: 0,
        blockedActions: 3
      },
      approvedExecutionItems: [
        {
          sourceActionId: 'P1-fix-target-regression',
          executionMode: 'plan_only',
          readOrderPaths: [join(root, 'agent-reach', 'repair-task-package.json')]
        }
      ],
      blockedActions: [
        'target_repo_file_mutation',
        'target_repo_branch_creation',
        'target_repo_commit_creation'
      ],
      maintainerReviewBoundary: 'Stop before modifying target repo files.',
      redactionBoundary: 'Local-only approved repair execution plan.',
      nonAuthorizationBoundary: 'This approved repair execution plan is planning evidence only.'
    }),
    evidenceReport: toJson({
      schemaVersion: 'repoassure.ai-ide-repair-execution-evidence-report.v1',
      generatedAt: '2026-07-08T09:25:00.000Z',
      evidenceSummary: {
        totalApprovedExecutionItems: 1,
        verifiedItems: 1,
        blockedItems: 0,
        failedItems: 0,
        notStartedItems: 0,
        boundaryViolations: 0,
        blockedActions: 3
      },
      itemReports: [
        {
          sourceActionId: 'P1-fix-target-regression',
          executionStatus: 'verified',
          readOrderCompliance: 'complete',
          maintainerReviewStatus: 'pending_review',
          nonAuthorizationBoundaryMaintained: true
        }
      ],
      boundaryReport: {
        boundaryViolations: 0,
        unauthorizedActions: [],
        targetRepoMutationProhibited: true,
        notes: 'Local evidence only.'
      },
      blockedActions: [
        'target_repo_file_mutation',
        'target_repo_branch_creation',
        'target_repo_commit_creation'
      ],
      maintainerReviewBoundary: 'Stop before modifying target repo files.',
      redactionBoundary: 'Local-only execution evidence report.',
      nonAuthorizationBoundary: 'This repair execution evidence report records local evidence only.'
    })
  };
}

function toJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}
