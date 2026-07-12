import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildBlockedGoalRecoveryConsumptionReport,
  buildBlockedGoalRecoveryConsumptionReportMarkdown,
  writeBlockedGoalRecoveryConsumptionReport
} from '../../packages/acceptance/src/blocked-goal-recovery-consumption-report.js';
import {
  buildBlockedGoalRecoveryPackage,
  type BlockedGoalRecoveryPackage
} from '../../packages/acceptance/src/blocked-goal-recovery-package.js';

describe('blocked goal recovery consumption report', () => {
  it('turns recovery evidence into a bounded AI IDE action queue', () => {
    const recoveryPackage = buildRecoveryPackage();
    const report = buildBlockedGoalRecoveryConsumptionReport({
      generatedAt: '2026-07-13T00:30:00.000Z',
      packagePath: '/private/tmp/goal-TOKEN=secret-value/blocked-goal-recovery-package.json',
      sourcePackageText: JSON.stringify(recoveryPackage),
      recoveryPackage
    });
    const markdown = buildBlockedGoalRecoveryConsumptionReportMarkdown(report);
    const serialized = JSON.stringify(report);

    expect(report.schemaVersion).toBe('repoassure.blocked-goal-recovery-consumption-report.v1');
    expect(report.resumeReadiness).toBe('waiting_for_maintainer_or_external_action');
    expect(report.sourceRecoveryPackage.path).toContain('blocked-goal-recovery-package.json');
    expect(report.sourceRecoveryPackage.sha256).toMatch(/^[a-f0-9]{64}$/u);
    expect(report.evidenceReadOrder).toEqual([
      expect.objectContaining({ label: 'recovery_package' }),
      expect.objectContaining({ label: 'goal_evidence' }),
      expect.objectContaining({ label: 'goal_audit' }),
      expect.objectContaining({ label: 'blocker_log' })
    ]);
    expect(report.actionQueue.map((item) => item.actionType)).toEqual([
      'automatic_retry_candidate',
      'maintainer_decision_required',
      'external_prerequisite_required'
    ]);
    expect(report.actionQueue).toEqual([
      expect.objectContaining({ actionKey: 'automatic:B1-test-timeout:A1-rerun', blockerId: 'B1-test-timeout', instruction: 'pnpm test -- --testTimeout=15000' }),
      expect.objectContaining({ actionKey: expect.stringMatching(/^maintainer:B2-review:maintainer-/u), blockerId: 'B2-review', instruction: 'Approve resume, defer, or accept risk.' }),
      expect.objectContaining({ actionKey: expect.stringMatching(/^external:B3-network:external-/u), blockerId: 'B3-network', instruction: 'Network access is restored.' })
    ]);
    expect(report.resumeChecklist).toEqual(expect.arrayContaining([
      'Read the recovery package and its source evidence in order.',
      'Complete every maintainer decision and external prerequisite before resuming.',
      'Run only the reviewed resume command after all recovery gates are satisfied.'
    ]));
    expect(report.resumeCommands).toEqual([
      expect.objectContaining({
        command: 'codex resume goal',
        purpose: 'Resume after all review gates pass.'
      })
    ]);
    expect(report.boundaryCompliance).toEqual({
      recoveryCommandsExecuted: false,
      blockedActionsPreserved: true
    });
    expect(report.blockedActions).toContain('target_repo_file_mutation_by_repoassure');
    expect(report.blockedActions).toContain('hosted_dashboard_availability_claim');
    expect(markdown).toContain('# RepoAssure Blocked Goal Recovery Consumption Report');
    expect(markdown).toContain('## Evidence Read Order');
    expect(markdown).toContain('## Recovery Action Queue');
    expect(markdown).toContain('## Resume Checklist');
    expect(serialized).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });

  it('maps recovery package status to AI IDE resume readiness', () => {
    const recoveryPackage = buildRecoveryPackage();
    const retryablePackage = {
      ...recoveryPackage,
      recoveryStatus: 'retryable_with_automatic_actions' as const,
      blockers: [recoveryPackage.blockers[0]!],
      automaticRecoveryActions: recoveryPackage.blockers[0]!.automaticRecoveryActions,
      maintainerDecisionRequests: [],
      externalPrerequisites: []
    };
    const retryable = buildBlockedGoalRecoveryConsumptionReport({
      packagePath: 'blocked-goal-recovery-package.json',
      sourcePackageText: JSON.stringify(retryablePackage),
      recoveryPackage: retryablePackage
    });
    const ready = buildBlockedGoalRecoveryConsumptionReport({
      packagePath: 'blocked-goal-recovery-package.json',
      sourcePackageText: JSON.stringify(buildRecoveryPackage()),
      recoveryPackage: buildRecoveryPackage({
        recoveryStatus: 'ready_to_resume',
        blockers: [],
        automaticRecoveryActions: [],
        maintainerDecisionRequests: [],
        externalPrerequisites: []
      })
    });

    expect(retryable.resumeReadiness).toBe('automatic_retry_candidates_available');
    expect(ready.resumeReadiness).toBe('ready_to_resume_after_review');
  });

  it('derives readiness and boundary compliance from recovery evidence instead of trusting status flags', () => {
    const inconsistent = buildRecoveryPackage({
      recoveryStatus: 'ready_to_resume',
      blockedActions: ['public_launch']
    });
    const report = buildBlockedGoalRecoveryConsumptionReport({
      packagePath: 'blocked-goal-recovery-package.json',
      sourcePackageText: JSON.stringify(inconsistent),
      recoveryPackage: inconsistent
    });

    expect(report.resumeReadiness).toBe('waiting_for_maintainer_or_external_action');
    expect(report.boundaryCompliance.blockedActionsPreserved).toBe(false);
  });

  it('rejects inconsistent action aggregates and keeps commandless recovery waiting', () => {
    const source = buildRecoveryPackage();
    const inconsistent = buildRecoveryPackage({
      blockers: [],
      automaticRecoveryActions: [],
      maintainerDecisionRequests: source.maintainerDecisionRequests,
      externalPrerequisites: []
    });

    expect(() => buildBlockedGoalRecoveryConsumptionReport({
      packagePath: 'blocked-goal-recovery-package.json',
      sourcePackageText: JSON.stringify(inconsistent),
      recoveryPackage: inconsistent
    })).toThrow('Invalid blocked goal recovery package');

    const commandless = buildRecoveryPackage({
      recoveryStatus: 'ready_to_resume',
      blockers: [],
      automaticRecoveryActions: [],
      maintainerDecisionRequests: [],
      externalPrerequisites: [],
      resumeCommands: []
    });
    const report = buildBlockedGoalRecoveryConsumptionReport({
      packagePath: 'blocked-goal-recovery-package.json',
      sourcePackageText: JSON.stringify(commandless),
      recoveryPackage: commandless
    });

    expect(report.resumeReadiness).toBe('waiting_for_maintainer_or_external_action');
  });

  it('preserves pricing and spend boundaries without trusting inherited authorization text', () => {
    const recoveryPackage = buildRecoveryPackage({
      maintainerReviewBoundary: 'Recovery is already approved.',
      nonAuthorizationBoundary: 'Pricing changes are authorized.'
    });

    expect(() => buildBlockedGoalRecoveryConsumptionReport({
      packagePath: 'blocked-goal-recovery-package.json',
      sourcePackageText: JSON.stringify(recoveryPackage),
      recoveryPackage
    })).toThrow('Invalid blocked goal recovery package');

    const report = buildBlockedGoalRecoveryConsumptionReport({
      packagePath: 'blocked-goal-recovery-package.json',
      sourcePackageText: JSON.stringify(buildRecoveryPackage()),
      recoveryPackage: buildRecoveryPackage()
    });

    expect(report.blockedActions).toEqual(expect.arrayContaining([
      'pricing_change',
      'spend_authorization'
    ]));
    expect(report.nonAuthorizationBoundary).toContain('authorize pricing/spend');
    expect(report.maintainerReviewBoundary).toContain('does not decide or execute');
  });

  it('handles recovery packages without optional goal evidence references', () => {
    const recoveryPackage = buildRecoveryPackage();
    delete recoveryPackage.sourceProvenance.sourceGoal.evidenceRefs;

    const report = buildBlockedGoalRecoveryConsumptionReport({
      packagePath: 'blocked-goal-recovery-package.json',
      sourcePackageText: JSON.stringify(recoveryPackage),
      recoveryPackage
    });

    expect(report.evidenceReadOrder.map((item) => item.label)).toEqual([
      'recovery_package',
      'goal_audit',
      'blocker_log'
    ]);
  });

  it('rejects maintainer requests without supported decision options', () => {
    const recoveryPackage = buildRecoveryPackage();
    recoveryPackage.blockers[1]!.maintainerDecisionRequests[0]!.options = ['yes', 'no'];

    expect(() => buildBlockedGoalRecoveryConsumptionReport({
      packagePath: 'blocked-goal-recovery-package.json',
      sourcePackageText: JSON.stringify(recoveryPackage),
      recoveryPackage
    })).toThrow('Invalid blocked goal recovery package');
  });

  it('writes local json and markdown consumption artifacts', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-goal-recovery-consume-'));
    const secretRoot = join(root, 'goal-TOKEN=secret-value');
    const packagePath = join(secretRoot, 'blocked-goal-recovery-package.json');
    const outputDir = join(root, 'output');

    await mkdir(secretRoot, { recursive: true });
    const packageText = `${JSON.stringify(buildRecoveryPackage(), null, 2)}\n`;
    await writeFile(packagePath, packageText);

    const result = await writeBlockedGoalRecoveryConsumptionReport({
      generatedAt: '2026-07-13T00:30:00.000Z',
      packagePath,
      outputDir
    });
    const json = await readFile(result.jsonPath, 'utf8');
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(result.jsonPath).toBe(join(outputDir, 'blocked-goal-recovery-consumption-report.json'));
    expect(result.markdownPath).toBe(join(outputDir, 'blocked-goal-recovery-consumption-report.md'));
    expect(json).toContain('repoassure.blocked-goal-recovery-consumption-report.v1');
    expect(result.report.sourceRecoveryPackage.sha256).toBe(
      createHash('sha256').update(packageText).digest('hex')
    );
    expect(markdown).toContain('## Non-Authorization Boundary');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });

  it('rejects malformed recovery package input before producing readiness evidence', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-goal-recovery-invalid-'));
    const packagePath = join(root, 'blocked-goal-recovery-package.json');

    await writeFile(packagePath, '{}\n');

    await expect(writeBlockedGoalRecoveryConsumptionReport({
      packagePath,
      outputDir: root
    })).rejects.toThrow('Invalid blocked goal recovery package');

    const malformedActionPackage = buildRecoveryPackage();
    malformedActionPackage.blockers[0]!.automaticRecoveryActions[0]!.command = 42 as unknown as string;
    await writeFile(packagePath, `${JSON.stringify(malformedActionPackage)}\n`);

    await expect(writeBlockedGoalRecoveryConsumptionReport({
      packagePath,
      outputDir: root
    })).rejects.toThrow('Invalid blocked goal recovery package');
  });
});

function buildRecoveryPackage(
  overrides: Partial<BlockedGoalRecoveryPackage> = {}
): BlockedGoalRecoveryPackage {
  const recoveryPackage = buildBlockedGoalRecoveryPackage({
    generatedAt: '2026-07-13T00:20:00.000Z',
    inputPath: '/private/tmp/goal-TOKEN=secret-value/blocked-goal-recovery-input.json',
    input: {
      sourceGoal: {
        title: 'Blocked Goal Recovery Consumption Validation v0.1',
        status: 'blocked',
        objective: 'Resume a blocked goal from sanitized evidence.',
        evidenceRefs: ['docs/goals/active/blocked-goal.md']
      },
      sourceAudit: {
        path: 'docs/acceptance/goal-completion-audit.md',
        status: 'blocked_or_incomplete',
        summary: 'One retry and two review gates remain.'
      },
      sourceLogs: [
        {
          path: 'docs/logs/blockers.md',
          summary: 'Recovery blockers are recorded.'
        }
      ],
      blockers: [
        {
          blockerId: 'B1-test-timeout',
          category: 'test_instability',
          status: 'retryable',
          summary: 'The full test exceeded its timeout.',
          automaticRecoveryActions: [
            {
              actionId: 'A1-rerun',
              command: 'pnpm test -- --testTimeout=15000',
              rationale: 'Use the reviewed integration timeout.'
            }
          ]
        },
        {
          blockerId: 'B2-review',
          category: 'maintainer_decision_required',
          status: 'blocked',
          summary: 'Maintainer must decide whether to resume.',
          maintainerDecisionRequests: [
            {
              requestedDecision: 'Approve resume, defer, or accept risk.',
              options: ['approve', 'defer', 'accept_risk']
            }
          ]
        },
        {
          blockerId: 'B3-network',
          category: 'environment',
          status: 'blocked',
          summary: 'The npm registry is unavailable.',
          externalPrerequisites: [
            {
              prerequisite: 'Network access is restored.',
              owner: 'environment'
            }
          ]
        }
      ],
      resumeCommands: [
        {
          command: 'codex resume goal',
          purpose: 'Resume after all review gates pass.'
        }
      ],
      redactionBoundary: 'Use sanitized local summaries only.'
    }
  });

  return { ...recoveryPackage, ...overrides };
}
