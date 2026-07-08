import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const SCRIPT_TEST_TIMEOUT_MS = 30_000;

describe('repair evidence consumer contract script', () => {
  it('generates an AI IDE consumer contract from one local repair evidence bundle directory', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-playbook-contract-'));
    const secretRoot = join(root, 'campaign-TOKEN=secret-value');

    await mkdir(secretRoot, { recursive: true });
    await writeFile(
      join(secretRoot, 'ai-ide-repair-evidence-bundle-manifest.json'),
      `${JSON.stringify(buildBundleManifest(), null, 2)}\n`
    );

    const { stdout, stderr } = await execFileAsync(
      'pnpm',
      [
        'playbook:contract',
        '--',
        '--from-dir',
        secretRoot
      ],
      { cwd: process.cwd(), timeout: SCRIPT_TEST_TIMEOUT_MS }
    );
    const jsonPath = join(secretRoot, 'ai-ide-repair-evidence-consumer-contract.json');
    const markdownPath = join(secretRoot, 'ai-ide-repair-evidence-consumer-contract.md');
    const json = await readFile(jsonPath, 'utf8');
    const markdown = await readFile(markdownPath, 'utf8');
    const contract = JSON.parse(json) as {
      schemaVersion: string;
      consumerReadiness: string;
      artifactReadSequence: Array<{ artifactKind: string; role: string }>;
      blockedActions: string[];
    };

    expect(stderr).toBe('');
    expect(stdout).toContain(`Wrote ${jsonPath}`);
    expect(stdout).toContain(`Wrote ${markdownPath}`);
    expect(contract.schemaVersion).toBe('repoassure.ai-ide-repair-evidence-consumer-contract.v1');
    expect(contract.consumerReadiness).toBe('ready_for_ai_ide_consumption');
    expect(contract.artifactReadSequence.map((item) => item.artifactKind)).toEqual([
      'ai_ide_repair_playbook',
      'ai_ide_playbook_consumption_report',
      'ai_ide_repair_decision_package',
      'ai_ide_repair_approval_receipt',
      'ai_ide_approved_repair_execution_plan',
      'ai_ide_repair_execution_evidence_report'
    ]);
    expect(contract.artifactReadSequence[0]?.role).toBe('campaign_context_and_action_queue');
    expect(contract.blockedActions).toContain('target_repo_file_mutation');
    expect(markdown).toContain('# RepoAssure AI IDE Repair Evidence Consumer Contract');
    expect(markdown).toContain('## Artifact Read Sequence');
    expect(markdown).toContain('## Verification Checklist');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  }, SCRIPT_TEST_TIMEOUT_MS);

  it('reports the documented CLI flag name when input is missing', async () => {
    await expect(execFileAsync(
      'node',
      [
        'scripts/generate-ai-ide-repair-evidence-consumer-contract.mjs',
        '--output',
        'artifacts/campaign'
      ],
      { cwd: process.cwd(), timeout: SCRIPT_TEST_TIMEOUT_MS }
    )).rejects.toMatchObject({
      stderr: expect.stringContaining('--manifest or --from-dir is required')
    });
  }, SCRIPT_TEST_TIMEOUT_MS);
});

function buildBundleManifest() {
  const artifactKinds = [
    ['ai_ide_repair_playbook', 'ai-ide-repair-playbook.json', 'repoassure.ai-ide-repair-execution-playbook.v1'],
    ['ai_ide_playbook_consumption_report', 'ai-ide-playbook-consumption-report.json', 'repoassure.ai-ide-playbook-consumption-report.v1'],
    ['ai_ide_repair_decision_package', 'ai-ide-repair-decision-package.json', 'repoassure.ai-ide-repair-decision-package.v1'],
    ['ai_ide_repair_approval_receipt', 'ai-ide-repair-approval-receipt.json', 'repoassure.ai-ide-repair-approval-receipt.v1'],
    ['ai_ide_approved_repair_execution_plan', 'ai-ide-approved-repair-execution-plan.json', 'repoassure.ai-ide-approved-repair-execution-plan.v1'],
    ['ai_ide_repair_execution_evidence_report', 'ai-ide-repair-execution-evidence-report.json', 'repoassure.ai-ide-repair-execution-evidence-report.v1']
  ] as const;

  return {
    schemaVersion: 'repoassure.ai-ide-repair-evidence-bundle-manifest.v1',
    generatedAt: '2026-07-08T10:00:00.000Z',
    bundleSummary: {
      totalArtifacts: 6,
      presentArtifacts: 6,
      missingArtifacts: 0,
      manualRepairCandidates: 1,
      approvedManualRepairCandidates: 1,
      approvedExecutionItems: 1,
      verifiedItems: 1,
      boundaryViolations: 0,
      currentStatus: 'verified_pending_maintainer_review'
    },
    readingOrder: artifactKinds.map(([artifactKind, fileName]) => ({
      artifactKind,
      fileName,
      reason: `Read ${fileName} in order.`
    })),
    artifacts: artifactKinds.map(([artifactKind, fileName, schemaVersion], index) => ({
      artifactKind,
      fileName,
      path: `/private/tmp/repoassure-campaign-TOKEN=secret-value/${fileName}`,
      schemaVersion,
      sha256: String(index).repeat(64),
      generatedAt: '2026-07-08T09:00:00.000Z'
    })),
    nextActions: [
      'Maintainer review may inspect the execution evidence report before any separate target repo merge or release action.'
    ],
    boundaries: {
      approvalBoundary: 'Approval receipt records maintainer decisions only.',
      executionEvidenceBoundary: 'Execution evidence report records local evidence only.',
      redactionBoundary: 'Local-only artifact paths and evidence must be redacted.',
      nonAuthorizationBoundary: 'This repair evidence bundle manifest is an index and review entry point only; it does not authorize target repo mutation, branch creation, commits, pull requests, issues, advisories, npm publication, GitHub release, public launch, customer contact, pricing/spend changes, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.',
      blockedActions: [
        'target_repo_file_mutation',
        'target_repo_branch_creation',
        'target_repo_commit_creation'
      ]
    }
  };
}
