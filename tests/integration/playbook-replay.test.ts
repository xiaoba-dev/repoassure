import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const SCRIPT_TEST_TIMEOUT_MS = 30_000;

describe('repair execution replay readiness script', () => {
  it('generates a replay readiness report from one local consumer contract directory', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-playbook-replay-'));
    const secretRoot = join(root, 'campaign-TOKEN=secret-value');

    await mkdir(secretRoot, { recursive: true });
    await writeFile(
      join(secretRoot, 'ai-ide-repair-evidence-consumer-contract.json'),
      `${JSON.stringify(buildConsumerContract(), null, 2)}\n`
    );

    const { stdout, stderr } = await execFileAsync(
      'pnpm',
      [
        'playbook:replay',
        '--',
        '--from-dir',
        secretRoot
      ],
      { cwd: process.cwd(), timeout: SCRIPT_TEST_TIMEOUT_MS }
    );
    const jsonPath = join(secretRoot, 'ai-ide-repair-execution-replay-readiness.json');
    const markdownPath = join(secretRoot, 'ai-ide-repair-execution-replay-readiness.md');
    const json = await readFile(jsonPath, 'utf8');
    const markdown = await readFile(markdownPath, 'utf8');
    const report = JSON.parse(json) as {
      schemaVersion: string;
      replayReadiness: string;
      artifactReplay: Array<{ artifactKind: string; replayStatus: string }>;
      blockedActions: string[];
      nextReviewDecision: { decision: string };
    };

    expect(stderr).toBe('');
    expect(stdout).toContain(`Wrote ${jsonPath}`);
    expect(stdout).toContain(`Wrote ${markdownPath}`);
    expect(report.schemaVersion).toBe('repoassure.ai-ide-repair-execution-replay-readiness.v1');
    expect(report.replayReadiness).toBe('ready_for_maintainer_replay_review');
    expect(report.artifactReplay).toHaveLength(6);
    expect(report.artifactReplay[0]?.replayStatus).toBe('replayed');
    expect(report.blockedActions).toContain('target_repo_file_mutation');
    expect(report.nextReviewDecision.decision).toBe('maintainer_review_ready');
    expect(markdown).toContain('# RepoAssure AI IDE Repair Execution Replay Readiness');
    expect(markdown).toContain('## Artifact Replay');
    expect(markdown).toContain('## Verification Replay');
    expect(markdown).toContain('## Boundary Replay');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  }, SCRIPT_TEST_TIMEOUT_MS);

  it('reports the documented CLI flag name when input is missing', async () => {
    await expect(execFileAsync(
      'node',
      [
        'scripts/generate-ai-ide-repair-execution-replay-readiness.mjs',
        '--output',
        'artifacts/campaign'
      ],
      { cwd: process.cwd(), timeout: SCRIPT_TEST_TIMEOUT_MS }
    )).rejects.toMatchObject({
      stderr: expect.stringContaining('--contract or --from-dir is required')
    });
  }, SCRIPT_TEST_TIMEOUT_MS);
});

function buildConsumerContract() {
  const artifactKinds = [
    ['ai_ide_repair_playbook', 'ai-ide-repair-playbook.json', 'campaign_context_and_action_queue'],
    ['ai_ide_playbook_consumption_report', 'ai-ide-playbook-consumption-report.json', 'dry_run_understanding_and_blocked_actions'],
    ['ai_ide_repair_decision_package', 'ai-ide-repair-decision-package.json', 'repair_decision_classification'],
    ['ai_ide_repair_approval_receipt', 'ai-ide-repair-approval-receipt.json', 'maintainer_approval_receipt'],
    ['ai_ide_approved_repair_execution_plan', 'ai-ide-approved-repair-execution-plan.json', 'approved_execution_plan'],
    ['ai_ide_repair_execution_evidence_report', 'ai-ide-repair-execution-evidence-report.json', 'execution_evidence_and_boundary_report']
  ] as const;

  return {
    schemaVersion: 'repoassure.ai-ide-repair-evidence-consumer-contract.v1',
    generatedAt: '2026-07-08T11:00:00.000Z',
    consumerReadiness: 'ready_for_ai_ide_consumption',
    sourceManifest: {
      schemaVersion: 'repoassure.ai-ide-repair-evidence-bundle-manifest.v1',
      fileName: 'ai-ide-repair-evidence-bundle-manifest.json',
      path: '/private/tmp/repoassure-campaign-[REDACTED]/ai-ide-repair-evidence-bundle-manifest.json',
      sha256: 'a'.repeat(64),
      currentStatus: 'verified_pending_maintainer_review',
      totalArtifacts: 6,
      presentArtifacts: 6,
      missingArtifacts: 0
    },
    artifactReadSequence: artifactKinds.map(([artifactKind, fileName, role], index) => ({
      step: index + 1,
      artifactKind,
      fileName,
      schemaVersion: `repoassure.${artifactKind}.v1`,
      required: true,
      role,
      consumeBefore: index < artifactKinds.length - 1 ? [artifactKinds[index + 1]![0]] : [],
      consumeAfter: index > 0 ? [artifactKinds[index - 1]![0]] : [],
      instruction: `Read ${fileName} in order.`,
      verificationFocus: [`Verify ${fileName} replay boundary.`]
    })),
    verificationChecklist: [
      'Read artifacts in artifactReadSequence order before proposing any target repo repair action.',
      'Confirm maintainer review remains pending before treating the evidence bundle as accepted.',
      'Confirm blocked actions remain blocked during replay.'
    ],
    maintainerReviewBoundary: 'Maintainer review is still required before any target repo repair action.',
    redactionBoundary: 'Local-only artifact paths and evidence must be redacted.',
    nonAuthorizationBoundary: 'This contract does not authorize target repo mutation, branch creation, commits, releases, publication, customer contact, or commercial availability claims.',
    blockedActions: [
      'target_repo_file_mutation',
      'target_repo_branch_creation',
      'target_repo_commit_creation'
    ]
  };
}
