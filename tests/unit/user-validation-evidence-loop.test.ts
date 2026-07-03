import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildUserValidationEvidenceLoop,
  writeUserValidationEvidenceLoopArtifact
} from '../../packages/acceptance/src/user-validation-evidence-loop.js';

describe('user validation evidence loop', () => {
  it('builds redacted local evidence for maintainer and reviewer decisions', () => {
    const runDir = '/private/tmp/customer-app/.hardening/runs/run-fixed';
    const evidenceLoop = buildUserValidationEvidenceLoop({
      generatedAt: '2026-07-03T08:00:00.000Z',
      mode: 'browser',
      runDir,
      manifestPath: `${runDir}/manifest.json`,
      userAcceptanceRecordPath: `${runDir}/../../../../docs/acceptance/user-acceptance-record.md`,
      targetRepoFeedbackSummaryPath: `${runDir}/target-repo-feedback-summary.json`,
      aiIdeHandoffPackagePath: `${runDir}/ai-ide-handoff-package.json`,
      decision: 'changes_requested',
      notes: 'Reviewer jane@example.com asks to fix login. API_KEY=sk-secret Cookie: sid=session-secret',
      checks: [
        { name: 'hardening-report.md 已生成', required: true, status: 'passed', evidence: `${runDir}/hardening-report.md` },
        { name: 'generated Playwright spec 执行验证', required: false, status: 'skipped', evidence: 'not requested' }
      ],
      feedbackItems: [
        {
          source: 'external_reviewer',
          decision: 'accept_risk',
          summary: 'External reviewer a@example.com accepts low risk token=feedback-secret',
          evidence: ['private preview form', 'manual note by reviewer@example.com']
        },
        {
          source: 'maintainer',
          decision: 'defer',
          summary: 'Maintainer defers launch until validation loop is complete',
          evidence: ['launch gate deferred']
        }
      ]
    });
    const serialized = JSON.stringify(evidenceLoop);

    expect(evidenceLoop.schemaVersion).toBe('repoassure.user-validation-evidence-loop.v1');
    expect(evidenceLoop.mode).toBe('browser');
    expect(evidenceLoop.validationStatus).toBe('changes_requested');
    expect(evidenceLoop.feedbackEvents.map((event) => event.decision)).toEqual([
      'changes_requested',
      'accept_risk',
      'defer'
    ]);
    expect(evidenceLoop.triage.nextAction).toBe('continue_iteration');
    expect(evidenceLoop.triage.launchAuthorization).toBe('not_authorized');
    expect(evidenceLoop.evidenceSources.map((source) => source.path)).toContain('target-repo-feedback-summary.json');
    expect(evidenceLoop.evidenceSources.map((source) => source.path)).toContain('ai-ide-handoff-package.json');
    expect(evidenceLoop.qualityGates.requiredChecksPassed).toBe(1);
    expect(evidenceLoop.consumptionGuidance.doNotDo).toContain('Do not treat reviewer feedback as public launch authorization.');
    expect(evidenceLoop.redactionBoundary).toContain('No reviewer PII');
    expect(evidenceLoop.nonAuthorizationBoundary).toContain('public launch');
    expect(serialized).not.toContain('/private/tmp/customer-app');
    expect(serialized).not.toContain('jane@example.com');
    expect(serialized).not.toContain('a@example.com');
    expect(serialized).not.toContain('reviewer@example.com');
    expect(serialized).not.toContain('sk-secret');
    expect(serialized).not.toContain('session-secret');
    expect(serialized).not.toContain('feedback-secret');
  });

  it('writes the evidence loop artifact and links it from the manifest', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'repoassure-user-validation-loop-'));
    const runDir = join(repoRoot, '.hardening', 'runs', 'run-fixed');
    const manifestPath = join(runDir, 'manifest.json');

    await mkdir(runDir, { recursive: true });
    await writeFile(manifestPath, JSON.stringify({ schemaVersion: 1, artifacts: {} }, null, 2));

    const result = await writeUserValidationEvidenceLoopArtifact({
      generatedAt: '2026-07-03T08:00:00.000Z',
      mode: 'cli',
      runDir,
      manifestPath,
      userAcceptanceRecordPath: join(repoRoot, 'docs', 'acceptance', 'user-acceptance-record.md'),
      targetRepoFeedbackSummaryPath: join(runDir, 'target-repo-feedback-summary.json'),
      aiIdeHandoffPackagePath: join(runDir, 'ai-ide-handoff-package.json'),
      decision: 'accepted',
      notes: '用户确认 Python CLI 验收符合预期',
      checks: [
        { name: 'hardening-report.md 已生成', required: true, status: 'passed', evidence: join(runDir, 'hardening-report.md') }
      ]
    });
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as {
      artifacts: { userValidationEvidenceLoopPath?: string };
    };

    expect(result.evidenceLoopPath).toBe(join(runDir, 'user-validation-evidence-loop.json'));
    expect(result.evidenceLoop.validationStatus).toBe('accepted');
    expect(manifest.artifacts.userValidationEvidenceLoopPath).toBe(result.evidenceLoopPath);
    await expect(readFile(result.evidenceLoopPath, 'utf8')).resolves.toContain('repoassure.user-validation-evidence-loop.v1');
  });
});
