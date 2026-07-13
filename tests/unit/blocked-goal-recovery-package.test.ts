import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rename, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

import {
  buildBlockedGoalRecoveryPackage,
  buildBlockedGoalRecoveryPackageMarkdown,
  readBlockedGoalRecoveryLocalArtifact,
  withBlockedGoalRecoveryDirectoryGuards,
  writeBlockedGoalRecoveryPackage,
  writeBlockedGoalRecoveryPackageFromDirectory,
  type BlockedGoalRecoveryInput
} from '../../packages/acceptance/src/blocked-goal-recovery-package.js';

const execFileAsync = promisify(execFile);

describe('blocked goal recovery package', () => {
  it('rejects oversized local recovery inputs before reading them into memory', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-recovery-oversized-'));
    const inputPath = join(root, 'oversized.json');
    await writeFile(inputPath, Buffer.alloc((8 * 1024 * 1024) + 1, 0x20));

    await expect(readBlockedGoalRecoveryLocalArtifact(inputPath)).rejects.toThrow(
      'Blocked goal recovery input exceeds 8388608 bytes'
    );
  });

  it('rejects FIFO inputs without waiting for a writer', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-recovery-fifo-'));
    const inputPath = join(root, 'blocked-goal-recovery-input.json');
    await execFileAsync('mkfifo', [inputPath]);

    await expect(readBlockedGoalRecoveryLocalArtifact(inputPath)).rejects.toThrow(
      'Blocked goal recovery input must be a regular file: blocked-goal-recovery-input.json'
    );
  });

  it('rejects I/O after a guarded directory identity is replaced', async () => {
    const parent = await mkdtemp(join(tmpdir(), 'repoassure-recovery-identity-'));
    const root = join(parent, 'root');
    const movedRoot = join(parent, 'moved-root');
    const outside = join(parent, 'outside');
    await mkdir(root);
    await mkdir(outside);
    await writeFile(join(root, 'input.json'), '{}');
    await writeFile(join(outside, 'input.json'), '{"outside":true}');

    await withBlockedGoalRecoveryDirectoryGuards([root], async () => {
      await rename(root, movedRoot);
      await symlink(outside, root, 'dir');
      await expect(readBlockedGoalRecoveryLocalArtifact(join(root, 'input.json'))).rejects.toThrow(
        `Blocked goal recovery directory identity changed: ${root}`
      );
    });
  });

  it('normalizes blocked, incomplete, deferred, and retryable blockers into a local recovery package', () => {
    const recoveryPackage = buildBlockedGoalRecoveryPackage({
      generatedAt: '2026-07-12T01:00:00.000Z',
      inputPath: '/private/tmp/repoassure-blocked-TOKEN=secret-value/blocked-goal-recovery-input.json',
      input: buildRecoveryInput()
    });
    const markdown = buildBlockedGoalRecoveryPackageMarkdown(recoveryPackage);
    const serialized = JSON.stringify(recoveryPackage);

    expect(recoveryPackage.schemaVersion).toBe('repoassure.blocked-goal-recovery-package.v1');
    expect(recoveryPackage.recoveryStatus).toBe('requires_maintainer_or_external_action');
    expect(recoveryPackage.sourceProvenance.sourceGoal).toMatchObject({
      title: 'Blocked Goal Recovery Package v0.1',
      status: 'blocked'
    });
    expect(recoveryPackage.blockerSummary).toMatchObject({
      totalBlockers: 4,
      blocked: 1,
      incomplete: 1,
      deferred: 1,
      retryable: 1,
      automaticRecoveryActions: 2,
      maintainerDecisionRequests: 1,
      externalPrerequisites: 1
    });
    expect(recoveryPackage.blockers).toEqual([
      expect.objectContaining({
        blockerId: 'B1-registry-network',
        category: 'environment',
        status: 'retryable',
        evidenceRefs: ['pnpm install ENOTFOUND registry.npmjs.org']
      }),
      expect.objectContaining({
        blockerId: 'B2-branch-rule',
        category: 'authorization_required',
        status: 'blocked'
      }),
      expect.objectContaining({
        blockerId: 'B3-product-scope',
        category: 'product_scope',
        status: 'deferred'
      }),
      expect.objectContaining({
        blockerId: 'B4-test-flake',
        category: 'test_instability',
        status: 'incomplete'
      })
    ]);
    expect(recoveryPackage.automaticRecoveryActions).toEqual([
      expect.objectContaining({
        blockerId: 'B1-registry-network',
        command: 'pnpm install --frozen-lockfile'
      }),
      expect.objectContaining({
        blockerId: 'B4-test-flake',
        command: 'pnpm test -- --testTimeout=15000'
      })
    ]);
    expect(recoveryPackage.maintainerDecisionRequests).toEqual([
      expect.objectContaining({
        blockerId: 'B2-branch-rule',
        requestedDecision: 'Approve equivalent release control or configure branch protection.'
      })
    ]);
    expect(recoveryPackage.externalPrerequisites).toEqual([
      expect.objectContaining({
        blockerId: 'B1-registry-network',
        prerequisite: 'Network access to npm registry is available.'
      })
    ]);
    expect(recoveryPackage.resumeCommands).toEqual(expect.arrayContaining([
      expect.objectContaining({
        command: 'pnpm goal:recover -- --from-dir artifacts/blocked-goal'
      })
    ]));
    expect(recoveryPackage.nonAuthorizationBoundary).toContain('does not modify target repo files');
    expect(recoveryPackage.blockedActions).toContain('target_repo_pull_request_creation');
    expect(recoveryPackage.blockedActions).toContain('hosted_dashboard_availability_claim');
    expect(recoveryPackage.blockedActions).toContain('pricing_change');
    expect(recoveryPackage.blockedActions).toContain('spend_authorization');
    expect(markdown).toContain('# RepoAssure Blocked Goal Recovery Package');
    expect(markdown).toContain('## Blockers');
    expect(markdown).toContain('## Resume Commands');
    expect(serialized).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });

  it('marks a package retryable when all blockers can be recovered automatically', () => {
    const input = buildRecoveryInput({
      blockers: [
        {
          blockerId: 'B1-test-timeout',
          category: 'test_instability',
          status: 'retryable',
          summary: 'Default timeout was too low.',
          attemptedActions: ['Ran the targeted test once.'],
          evidenceRefs: ['Test timed out in 5000ms.'],
          automaticRecoveryActions: [
            {
              actionId: 'A1-rerun-timeout',
              command: 'pnpm test -- --testTimeout=15000',
              rationale: 'Rerun with timeout matching integration test profile.'
            }
          ]
        }
      ]
    });

    const recoveryPackage = buildBlockedGoalRecoveryPackage({
      generatedAt: '2026-07-12T01:00:00.000Z',
      inputPath: 'blocked-goal-recovery-input.json',
      input
    });

    expect(recoveryPackage.recoveryStatus).toBe('retryable_with_automatic_actions');
    expect(recoveryPackage.blockerSummary).toMatchObject({
      totalBlockers: 1,
      retryable: 1,
      automaticRecoveryActions: 1,
      maintainerDecisionRequests: 0,
      externalPrerequisites: 0
    });
  });

  it('marks a package ready to resume when there are no blockers', () => {
    const recoveryPackage = buildBlockedGoalRecoveryPackage({
      generatedAt: '2026-07-12T01:00:00.000Z',
      inputPath: 'blocked-goal-recovery-input.json',
      input: buildRecoveryInput({ blockers: [] })
    });

    expect(recoveryPackage.recoveryStatus).toBe('ready_to_resume');
    expect(recoveryPackage.blockerSummary.totalBlockers).toBe(0);
    expect(recoveryPackage.resumeCommands).toEqual(expect.arrayContaining([
      expect.objectContaining({
        command: 'codex resume goal'
      })
    ]));
  });

  it('derives stable opaque IDs and rejects duplicate explicit IDs', () => {
    const build = (requests: Array<{ requestedDecision: string; options: string[]; actionId?: string }>) => (
      buildBlockedGoalRecoveryPackage({
        inputPath: 'blocked-goal-recovery-input.json',
        input: {
          sourceGoal: { title: 'Stable IDs', status: 'blocked', objective: 'Review actions.' },
          blockers: [{
            blockerId: 'B-TOKEN=secret-value',
            category: 'maintainer_decision_required',
            status: 'blocked',
            summary: 'Review requests.',
            maintainerDecisionRequests: requests
          }],
          resumeCommands: [{ command: 'codex resume goal', purpose: 'Resume after review.' }],
          redactionBoundary: 'Use sanitized evidence.'
        }
      })
    );
    const left = build([
      { requestedDecision: 'Approve A.', options: ['approve', 'defer'] },
      { requestedDecision: 'Approve B.', options: ['approve', 'defer'] }
    ]);
    const right = build([
      { requestedDecision: 'Approve B.', options: ['approve', 'defer'] },
      { requestedDecision: 'Approve A.', options: ['approve', 'defer'] }
    ]);
    const idsByRequest = (value: typeof left) => Object.fromEntries(
      value.maintainerDecisionRequests.map((item) => [item.requestedDecision, item.actionId])
    );

    expect(idsByRequest(left)).toEqual(idsByRequest(right));
    expect(JSON.stringify(left)).not.toContain('secret-value');
    expect(() => build([
      { actionId: 'same-id', requestedDecision: 'Approve A.', options: ['approve'] },
      { actionId: 'same-id', requestedDecision: 'Approve B.', options: ['approve'] }
    ])).toThrow('duplicate action or command IDs');
  });

  it('writes json and markdown recovery package artifacts from local files', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-blocked-goal-recovery-'));
    const inputPath = join(root, 'blocked-goal-recovery-input.json');
    const outputDir = join(root, 'recovery-output');

    await mkdir(root, { recursive: true });
    await writeFile(inputPath, `${JSON.stringify(buildRecoveryInput(), null, 2)}\n`);

    const result = await writeBlockedGoalRecoveryPackage({
      generatedAt: '2026-07-12T01:00:00.000Z',
      inputPath,
      outputDir
    });
    const json = await readFile(result.jsonPath, 'utf8');
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(result.jsonPath).toBe(join(outputDir, 'blocked-goal-recovery-package.json'));
    expect(result.markdownPath).toBe(join(outputDir, 'blocked-goal-recovery-package.md'));
    expect(result.recoveryPackage.schemaVersion).toBe('repoassure.blocked-goal-recovery-package.v1');
    expect(json).toContain('requires_maintainer_or_external_action');
    expect(markdown).toContain('## Maintainer Decision Requests');
  });

  it('writes recovery package artifacts from a directory', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-blocked-goal-recovery-dir-'));
    const secretRoot = join(root, 'goal-TOKEN=secret-value');

    await mkdir(secretRoot, { recursive: true });
    await writeFile(
      join(secretRoot, 'blocked-goal-recovery-input.json'),
      `${JSON.stringify(buildRecoveryInput(), null, 2)}\n`
    );

    const result = await writeBlockedGoalRecoveryPackageFromDirectory({
      generatedAt: '2026-07-12T01:00:00.000Z',
      inputDir: secretRoot
    });

    expect(result.jsonPath).toBe(join(secretRoot, 'blocked-goal-recovery-package.json'));
    expect(result.markdownPath).toBe(join(secretRoot, 'blocked-goal-recovery-package.md'));
    expect(result.recoveryPackage.sourceProvenance.input.path).not.toContain('secret-value');
  });
});

function buildRecoveryInput(overrides: Partial<BlockedGoalRecoveryInput> = {}): BlockedGoalRecoveryInput {
  return {
    ...baseRecoveryInput(),
    ...overrides
  };
}

function baseRecoveryInput(): BlockedGoalRecoveryInput {
  return {
    sourceGoal: {
      title: 'Blocked Goal Recovery Package v0.1',
      status: 'blocked',
      objective: 'Recover a blocked goal without leaking TOKEN=secret-value.',
      evidenceRefs: ['docs/logs/blockers.md', '/private/tmp/goal-TOKEN=secret-value/run.log']
    },
    sourceAudit: {
      path: 'docs/acceptance/goal-completion-audit.md',
      status: 'blocked_or_incomplete',
      summary: 'Goal audit identified unresolved blockers.'
    },
    sourceLogs: [
      {
        path: 'docs/logs/blockers.md',
        summary: 'Network and maintainer authorization blockers were recorded.'
      }
    ],
    blockers: [
      {
        blockerId: 'B1-registry-network',
        category: 'environment',
        status: 'retryable',
        summary: 'npm registry DNS failed in sandbox.',
        attemptedActions: ['Ran pnpm install inside sandbox.', 'Retried after waiting for DNS.'],
        evidenceRefs: ['pnpm install ENOTFOUND registry.npmjs.org'],
        automaticRecoveryActions: [
          {
            actionId: 'A1-install-with-network',
            command: 'pnpm install --frozen-lockfile',
            rationale: 'Retry in an environment with registry access.'
          }
        ],
        externalPrerequisites: [
          {
            prerequisite: 'Network access to npm registry is available.',
            owner: 'environment'
          }
        ]
      },
      {
        blockerId: 'B2-branch-rule',
        category: 'authorization_required',
        status: 'blocked',
        summary: 'Branch protection decision requires maintainer approval.',
        attemptedActions: ['Documented equivalent release control option.'],
        evidenceRefs: ['docs/operations/equivalent-release-control-design-v0.1.md'],
        maintainerDecisionRequests: [
          {
            requestedDecision: 'Approve equivalent release control or configure branch protection.',
            options: ['approve', 'defer', 'accept_risk']
          }
        ]
      },
      {
        blockerId: 'B3-product-scope',
        category: 'product_scope',
        status: 'deferred',
        summary: 'Hosted dashboard scope is out of current release.',
        attemptedActions: ['Recorded commercial availability boundary.'],
        evidenceRefs: ['docs/adr/0016-team-cloud-enterprise-boundary.md']
      },
      {
        blockerId: 'B4-test-flake',
        category: 'test_instability',
        status: 'incomplete',
        summary: 'A slow test exceeded the default timeout.',
        attemptedActions: ['Ran the full test suite once.'],
        evidenceRefs: ['Test timed out in 5000ms.'],
        automaticRecoveryActions: [
          {
            actionId: 'A2-rerun-timeout',
            command: 'pnpm test -- --testTimeout=15000',
            rationale: 'Rerun with the known integration timeout profile.'
          }
        ]
      }
    ],
    resumeCommands: [
      {
        command: 'pnpm goal:recover -- --from-dir artifacts/blocked-goal',
        purpose: 'Regenerate recovery evidence after prerequisites are met.'
      },
      {
        command: 'codex resume goal',
        purpose: 'Resume the blocked Codex goal after maintainer review.'
      }
    ],
    redactionBoundary: 'Use sanitized local summaries only.'
  };
}
