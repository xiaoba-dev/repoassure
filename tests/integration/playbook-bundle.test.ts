import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const SCRIPT_TEST_TIMEOUT_MS = 30_000;

describe('repair evidence bundle manifest script', () => {
  it('generates a single AI IDE bundle manifest from local repair evidence artifacts', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-playbook-bundle-'));
    const outputDir = join(root, 'campaign-output');
    const secretRoot = join(root, 'campaign-TOKEN=secret-value');
    const artifactPaths = await writeArtifacts(secretRoot);

    await mkdir(outputDir, { recursive: true });

    const { stdout, stderr } = await execFileAsync(
      'pnpm',
      [
        'playbook:bundle',
        '--',
        '--playbook',
        artifactPaths.playbookPath,
        '--consumption-report',
        artifactPaths.consumptionReportPath,
        '--decision-package',
        artifactPaths.decisionPackagePath,
        '--approval-receipt',
        artifactPaths.approvalReceiptPath,
        '--execution-plan',
        artifactPaths.executionPlanPath,
        '--evidence-report',
        artifactPaths.evidenceReportPath,
        '--output',
        outputDir
      ],
      { cwd: process.cwd(), timeout: SCRIPT_TEST_TIMEOUT_MS }
    );
    const jsonPath = join(outputDir, 'ai-ide-repair-evidence-bundle-manifest.json');
    const markdownPath = join(outputDir, 'ai-ide-repair-evidence-bundle-manifest.md');
    const json = await readFile(jsonPath, 'utf8');
    const markdown = await readFile(markdownPath, 'utf8');
    const manifest = JSON.parse(json) as {
      schemaVersion: string;
      bundleSummary: { currentStatus: string; verifiedItems: number; boundaryViolations: number };
      artifacts: Array<{ fileName: string; sha256: string }>;
      nextActions: string[];
    };

    expect(stderr).toBe('');
    expect(stdout).toContain(`Wrote ${jsonPath}`);
    expect(stdout).toContain(`Wrote ${markdownPath}`);
    expect(manifest.schemaVersion).toBe('repoassure.ai-ide-repair-evidence-bundle-manifest.v1');
    expect(manifest.bundleSummary).toMatchObject({
      currentStatus: 'verified_pending_maintainer_review',
      verifiedItems: 1,
      boundaryViolations: 0
    });
    expect(manifest.artifacts).toHaveLength(6);
    expect(manifest.artifacts[0]).toEqual(expect.objectContaining({
      fileName: 'ai-ide-repair-playbook.json',
      sha256: expect.stringMatching(/^[a-f0-9]{64}$/)
    }));
    expect(manifest.nextActions).toContain('Maintainer review may inspect the execution evidence report before any separate target repo merge or release action.');
    expect(markdown).toContain('# RepoAssure AI IDE Repair Evidence Bundle Manifest');
    expect(markdown).toContain('## Reading Order');
    expect(markdown).toContain('ai-ide-repair-execution-evidence-report.json');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  }, SCRIPT_TEST_TIMEOUT_MS);

  it('reports the documented CLI flag name when output is missing', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-playbook-bundle-missing-output-'));
    const artifactPaths = await writeArtifacts(root);

    await expect(execFileAsync(
      'node',
      [
        'scripts/generate-ai-ide-repair-evidence-bundle-manifest.mjs',
        '--playbook',
        artifactPaths.playbookPath,
        '--consumption-report',
        artifactPaths.consumptionReportPath,
        '--decision-package',
        artifactPaths.decisionPackagePath,
        '--approval-receipt',
        artifactPaths.approvalReceiptPath,
        '--execution-plan',
        artifactPaths.executionPlanPath,
        '--evidence-report',
        artifactPaths.evidenceReportPath
      ],
      { cwd: process.cwd(), timeout: SCRIPT_TEST_TIMEOUT_MS }
    )).rejects.toMatchObject({
      stderr: expect.stringContaining('--output is required')
    });
  }, SCRIPT_TEST_TIMEOUT_MS);
});

async function writeArtifacts(root: string): Promise<{
  playbookPath: string;
  consumptionReportPath: string;
  decisionPackagePath: string;
  approvalReceiptPath: string;
  executionPlanPath: string;
  evidenceReportPath: string;
}> {
  await mkdir(root, { recursive: true });
  const paths = {
    playbookPath: join(root, 'ai-ide-repair-playbook.json'),
    consumptionReportPath: join(root, 'ai-ide-playbook-consumption-report.json'),
    decisionPackagePath: join(root, 'ai-ide-repair-decision-package.json'),
    approvalReceiptPath: join(root, 'ai-ide-repair-approval-receipt.json'),
    executionPlanPath: join(root, 'ai-ide-approved-repair-execution-plan.json'),
    evidenceReportPath: join(root, 'ai-ide-repair-execution-evidence-report.json')
  };

  await writeFile(paths.playbookPath, json({
    schemaVersion: 'repoassure.ai-ide-repair-execution-playbook.v1',
    generatedAt: '2026-07-08T09:00:00.000Z',
    campaignContext: { totalTargets: 1, targetStatusMatrix: [] },
    redactionBoundary: 'Local-only playbook.',
    nonAuthorizationBoundary: 'Playbook only.'
  }));
  await writeFile(paths.consumptionReportPath, json({
    schemaVersion: 'repoassure.ai-ide-playbook-consumption-report.v1',
    generatedAt: '2026-07-08T09:05:00.000Z',
    dryRunDecision: { blockedActions: ['target_repo_file_mutation'] },
    redactionBoundary: 'Local-only consumption report.',
    nonAuthorizationBoundary: 'Dry-run report only.'
  }));
  await writeFile(paths.decisionPackagePath, json({
    schemaVersion: 'repoassure.ai-ide-repair-decision-package.v1',
    generatedAt: '2026-07-08T09:10:00.000Z',
    decisionSummary: { manualRepairCandidates: 1 },
    redactionBoundary: 'Local-only decision package.',
    nonAuthorizationBoundary: 'Decision package only.'
  }));
  await writeFile(paths.approvalReceiptPath, json({
    schemaVersion: 'repoassure.ai-ide-repair-approval-receipt.v1',
    generatedAt: '2026-07-08T09:15:00.000Z',
    receiptSummary: { approvedManualRepairCandidates: 1 },
    blockedActions: ['target_repo_file_mutation'],
    redactionBoundary: 'Local-only approval receipt.',
    nonAuthorizationBoundary: 'Approval receipt only.'
  }));
  await writeFile(paths.executionPlanPath, json({
    schemaVersion: 'repoassure.ai-ide-approved-repair-execution-plan.v1',
    generatedAt: '2026-07-08T09:20:00.000Z',
    executionSummary: { approvedExecutionItems: 1 },
    blockedActions: ['target_repo_file_mutation'],
    redactionBoundary: 'Local-only execution plan.',
    nonAuthorizationBoundary: 'Execution plan only.'
  }));
  await writeFile(paths.evidenceReportPath, json({
    schemaVersion: 'repoassure.ai-ide-repair-execution-evidence-report.v1',
    generatedAt: '2026-07-08T09:25:00.000Z',
    evidenceSummary: { verifiedItems: 1, boundaryViolations: 0 },
    blockedActions: ['target_repo_file_mutation'],
    redactionBoundary: 'Local-only evidence report.',
    nonAuthorizationBoundary: 'Evidence report only.'
  }));

  return paths;
}

function json(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}
