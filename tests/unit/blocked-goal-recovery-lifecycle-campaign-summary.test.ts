import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  mapBlockedGoalRecoveryScenariosWithConcurrency,
  writeBlockedGoalRecoveryLifecycleCampaignSummary
} from '../../packages/acceptance/src/blocked-goal-recovery-lifecycle-campaign-summary.js';
import { BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS } from '../../packages/acceptance/src/blocked-goal-recovery-package.js';

const outcomes = [
  'accepted', 'accepted_with_risk', 'blocked', 'failed', 'incomplete',
  'environment_blocker', 'boundary_violation', 'rejected_tampered'
] as const;

describe('blocked goal recovery lifecycle campaign summary', () => {
  it('never schedules more than four scenario validations concurrently', async () => {
    let active = 0;
    let maximumActive = 0;
    const results = await mapBlockedGoalRecoveryScenariosWithConcurrency(
      Array.from({ length: 12 }, (_, index) => index),
      4,
      async (value) => {
        active += 1;
        maximumActive = Math.max(maximumActive, active);
        await new Promise((resolve) => setTimeout(resolve, 2));
        active -= 1;
        return value * 2;
      }
    );

    expect(maximumActive).toBe(4);
    expect(results).toEqual(Array.from({ length: 12 }, (_, index) => index * 2));
  });

  it('rejects campaigns with more than 32 scenarios before scheduling artifact reads', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-recovery-lifecycle-too-many-'));
    const scenarios = Array.from({ length: 33 }, (_, index) => ({
      scenarioId: `scenario-${index}`,
      expectedOutcome: outcomes[index % outcomes.length]!,
      artifactDir: `scenario-${index}`
    }));
    await writeCampaignInput(root, scenarios);

    await expect(writeBlockedGoalRecoveryLifecycleCampaignSummary({ inputDir: root, outputDir: root }))
      .rejects.toThrow('Invalid blocked goal recovery lifecycle campaign input');
  });

  it('rejects duplicate artifact directories before scheduling artifact reads', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-recovery-lifecycle-duplicate-dir-'));
    await writeCampaignInput(root, outcomes.map((expectedOutcome, index) => ({
      scenarioId: expectedOutcome,
      expectedOutcome,
      artifactDir: index < 2 ? 'shared' : expectedOutcome
    })));

    await expect(writeBlockedGoalRecoveryLifecycleCampaignSummary({ inputDir: root, outputDir: root }))
      .rejects.toThrow('Invalid blocked goal recovery lifecycle campaign input');
  });

  it('rejects artifact directory aliases before scheduling artifact reads', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-recovery-lifecycle-alias-dir-'));
    await writeCampaignInput(root, outcomes.map((expectedOutcome, index) => ({
      scenarioId: expectedOutcome,
      expectedOutcome,
      artifactDir: index === 0 ? 'shared' : index === 1 ? './shared' : expectedOutcome
    })));

    await expect(writeBlockedGoalRecoveryLifecycleCampaignSummary({ inputDir: root, outputDir: root }))
      .rejects.toThrow('Invalid blocked goal recovery lifecycle campaign input');
  });


  it('rejects a self-consistent but fabricated full outcome matrix', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-recovery-lifecycle-'));
    for (const outcome of outcomes) await writeScenario(join(root, outcome), outcome);
    await writeFile(join(root, 'blocked-goal-recovery-lifecycle-campaign-input.json'), `${JSON.stringify({
      schemaVersion: 'repoassure.blocked-goal-recovery-lifecycle-campaign-input.v1',
      campaignId: 'recovery-lifecycle-v0.1',
      scenarios: outcomes.map((expectedOutcome) => ({
        scenarioId: expectedOutcome, expectedOutcome, artifactDir: expectedOutcome
      }))
    }, null, 2)}\n`);

    await expect(writeBlockedGoalRecoveryLifecycleCampaignSummary({
      inputDir: root, outputDir: root, generatedAt: '2026-07-13T07:50:00.000Z'
    })).rejects.toThrow('Invalid blocked goal recovery lifecycle campaign evidence');
  });

  it('fails when a normal scenario has a broken trust chain or unsafe evidence', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-recovery-lifecycle-invalid-'));
    for (const outcome of outcomes) await writeScenario(join(root, outcome), outcome);
    const closurePath = join(root, 'accepted', 'blocked-goal-recovery-resume-attempt-closure-receipt.json');
    const closure = JSON.parse(await readFile(closurePath, 'utf8')) as Record<string, unknown>;
    (closure.sourceEvidenceReviewPackage as Record<string, unknown>).sha256 = '0'.repeat(64);
    await writeFile(closurePath, `${JSON.stringify(closure, null, 2)}\n`);
    await writeCampaignInput(root, outcomes.map((expectedOutcome) => ({
      scenarioId: expectedOutcome, expectedOutcome, artifactDir: expectedOutcome
    })));
    await expect(writeBlockedGoalRecoveryLifecycleCampaignSummary({ inputDir: root, outputDir: root }))
      .rejects.toThrow('Invalid blocked goal recovery lifecycle campaign evidence');
  });

  it('does not count a missing tampered scenario as a successful rejection', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-recovery-lifecycle-missing-tamper-'));
    for (const outcome of outcomes.filter((item) => item !== 'rejected_tampered')) {
      await writeScenario(join(root, outcome), outcome);
    }
    await writeCampaignInput(root, outcomes.map((expectedOutcome) => ({
      scenarioId: expectedOutcome,
      expectedOutcome,
      artifactDir: expectedOutcome === 'rejected_tampered' ? 'missing' : expectedOutcome
    })));

    await expect(writeBlockedGoalRecoveryLifecycleCampaignSummary({ inputDir: root, outputDir: root }))
      .rejects.toThrow('Invalid blocked goal recovery lifecycle campaign evidence');
  });

  it('requires every lifecycle outcome before a campaign can pass', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-recovery-lifecycle-partial-'));
    await writeScenario(join(root, 'environment'), 'environment_blocker');
    await writeCampaignInput(root, [
      { scenarioId: 'environment', expectedOutcome: 'environment_blocker', artifactDir: 'environment' }
    ]);

    await expect(writeBlockedGoalRecoveryLifecycleCampaignSummary({ inputDir: root, outputDir: root }))
      .rejects.toThrow('Invalid blocked goal recovery lifecycle campaign input');
  });
});

async function writeCampaignInput(
  root: string,
  scenarios: Array<{ scenarioId: string; expectedOutcome: typeof outcomes[number]; artifactDir: string }>
): Promise<void> {
  await writeFile(join(root, 'blocked-goal-recovery-lifecycle-campaign-input.json'), `${JSON.stringify({
    schemaVersion: 'repoassure.blocked-goal-recovery-lifecycle-campaign-input.v1',
    campaignId: 'recovery-lifecycle-v0.1',
    scenarios
  }, null, 2)}\n`);
}

async function writeScenario(dir: string, outcome: typeof outcomes[number]): Promise<void> {
  await mkdir(dir, { recursive: true });
  const recovery = stage('repoassure.blocked-goal-recovery-package.v1', {
    recoveryStatus: outcome === 'environment_blocker' ? 'requires_maintainer_or_external_action' : 'ready_to_resume',
    blockers: outcome === 'environment_blocker' ? [{ category: 'environment' }] : []
  });
  const recoveryText = await writeStage(dir, 'blocked-goal-recovery-package.json', recovery);
  if (outcome === 'environment_blocker') return;

  const consumption = stage('repoassure.blocked-goal-recovery-consumption-report.v1', {
    sourceRecoveryPackage: { sha256: sha256(recoveryText) },
    boundaryCompliance: { recoveryCommandsExecuted: false, blockedActionsPreserved: true }
  });
  const consumptionText = await writeStage(dir, 'blocked-goal-recovery-consumption-report.json', consumption);
  const decision = stage('repoassure.blocked-goal-recovery-decision-receipt.v1', {
    sourceConsumptionReport: { sha256: sha256(consumptionText) },
    decisionStatus: outcome === 'blocked' ? 'deferred' : 'approved_for_separate_resume_attempt',
    boundaryCompliance: { resumeCommandsExecuted: false, sourceBoundaryPreserved: true }
  });
  const decisionText = await writeStage(dir, 'blocked-goal-recovery-decision-receipt.json', decision);
  if (outcome === 'blocked') return;

  const task = stage('repoassure.blocked-goal-recovery-resume-attempt-task-package.v1', {
    sourceDecisionReceipt: { sha256: sha256(decisionText) },
    taskPackageStatus: 'ready_for_separate_resume_attempt',
    boundaryCompliance: { commandsExecuted: false, sourceBoundaryPreserved: true }
  });
  const taskText = await writeStage(dir, 'blocked-goal-recovery-resume-attempt-task-package.json', task);
  const intakeStatus = outcome === 'failed' ? 'failed_or_blocked'
    : outcome === 'incomplete' ? 'incomplete'
      : outcome === 'boundary_violation' ? 'boundary_violation' : 'complete_for_maintainer_review';
  const intake = stage('repoassure.blocked-goal-recovery-resume-attempt-execution-evidence-intake.v1', {
    sourceTaskPackage: { sha256: sha256(taskText) }, intakeStatus,
    boundaryCompliance: {
      commandsExecutedByIntake: false, unlistedCommandsExecuted: outcome === 'boundary_violation',
      blockedActionsPreserved: true, targetRepoMutationByRepoAssure: false,
      sourceBoundaryPreserved: outcome !== 'boundary_violation'
    }
  });
  const intakeText = await writeStage(dir, 'blocked-goal-recovery-resume-attempt-execution-evidence-intake.json', intake);
  if (outcome === 'failed' || outcome === 'incomplete' || outcome === 'boundary_violation') return;

  const reviewStatus = outcome === 'accepted_with_risk' ? 'accepted_with_risk' : 'accepted';
  const review = stage('repoassure.blocked-goal-recovery-resume-attempt-evidence-review-decision-package.v1', {
    sourceEvidenceIntake: { sha256: sha256(intakeText) }, reviewStatus,
    boundaryCompliance: { commandsExecutedByReview: false, sourceBoundaryPreserved: true }
  });
  const reviewText = await writeStage(dir, 'blocked-goal-recovery-resume-attempt-evidence-review-decision-package.json', review);
  const closure = stage('repoassure.blocked-goal-recovery-resume-attempt-closure-receipt.v1', {
    sourceEvidenceReviewPackage: {
      sha256: outcome === 'rejected_tampered' ? '0'.repeat(64) : sha256(reviewText)
    },
    closureStatus: outcome === 'accepted_with_risk' ? 'closed_with_accepted_risk' : 'closed',
    boundaryCompliance: {
      commandsExecutedByClosure: false, externalGoalClosedByReceipt: false, sourceBoundaryPreserved: true
    }
  });
  await writeStage(dir, 'blocked-goal-recovery-resume-attempt-closure-receipt.json', closure);
}

function stage(schemaVersion: string, value: Record<string, unknown>): Record<string, unknown> {
  return { schemaVersion, ...value, blockedActions: [...BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS] };
}
async function writeStage(dir: string, name: string, value: unknown): Promise<string> {
  const text = `${JSON.stringify(value, null, 2)}\n`; await writeFile(join(dir, name), text); return text;
}
function sha256(value: string): string { return createHash('sha256').update(value).digest('hex'); }
