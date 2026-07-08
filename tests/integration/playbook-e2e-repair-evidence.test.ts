import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const SCRIPT_TEST_TIMEOUT_MS = 120_000;
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
    expect(outputs.bundle.bundleSummary).toMatchObject({
      currentStatus: 'verified_pending_maintainer_review',
      verifiedItems: 1,
      boundaryViolations: 0
    });
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
    expect(outputs.evidenceMarkdown).toContain(
      'No target repo branch, commit, pull request, issue, advisory, or file mutation is executed by this report.'
    );
    expect(JSON.stringify(outputs)).not.toContain('secret-value');
    expect(await listExpectedArtifactNames(outputDir)).toEqual([
      'ai-ide-approved-repair-execution-plan.json',
      'ai-ide-approved-repair-execution-plan.md',
      'ai-ide-playbook-consumption-report.json',
      'ai-ide-playbook-consumption-report.md',
      'ai-ide-repair-approval-receipt.json',
      'ai-ide-repair-approval-receipt.md',
      'ai-ide-repair-decision-package.json',
      'ai-ide-repair-decision-package.md',
      'ai-ide-repair-evidence-bundle-manifest.json',
      'ai-ide-repair-evidence-bundle-manifest.md',
      'ai-ide-repair-execution-evidence-report.json',
      'ai-ide-repair-execution-evidence-report.md',
      'ai-ide-repair-playbook.json',
      'ai-ide-repair-playbook.md'
    ]);
  }, SCRIPT_TEST_TIMEOUT_MS);
});

async function runScript(args: string[]): Promise<void> {
  const { stderr } = await execFileAsync('pnpm', args, {
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
  evidenceMarkdown: string;
  bundleMarkdown: string;
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
    evidenceMarkdown: await readFile(join(outputDir, 'ai-ide-repair-execution-evidence-report.md'), 'utf8'),
    bundleMarkdown: await readFile(join(outputDir, 'ai-ide-repair-evidence-bundle-manifest.md'), 'utf8')
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
    'ai-ide-repair-playbook.json',
    'ai-ide-repair-playbook.md'
  ];

  await Promise.all(names.map((name) => readFile(join(outputDir, name), 'utf8')));

  return names.sort();
}
