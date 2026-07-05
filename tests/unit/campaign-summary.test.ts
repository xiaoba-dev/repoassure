import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildValidationCampaignSummary,
  writeValidationCampaignSummary
} from '../../packages/acceptance/src/campaign-summary.js';

describe('validation campaign summary', () => {
  it('summarizes multi-repo local evidence without copying target repo material', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-campaign-summary-'));
    const browserRepo = join(root, 'browser-app');
    const cliRepo = join(root, 'python-cli');
    const blockedRepo = join(root, 'blocked-web-app');
    const browserRunDir = join(browserRepo, '.hardening', 'runs', 'run-2026-07-03T10-00-00-000Z');
    const cliRunDir = join(cliRepo, '.hardening', 'runs', 'run-2026-07-03T10-05-00-000Z');
    const blockedRunDir = join(blockedRepo, '.hardening', 'runs', 'run-2026-07-03T10-06-00-000Z');
    const browserRecordPath = join(root, 'artifacts', 'browser-app.md');
    const cliRecordPath = join(root, 'artifacts', 'python-cli.md');
    const blockedRecordPath = join(root, 'artifacts', 'blocked-web-app.md');

    await mkdir(browserRunDir, { recursive: true });
    await mkdir(cliRunDir, { recursive: true });
    await mkdir(blockedRunDir, { recursive: true });
    await mkdir(join(root, 'artifacts'), { recursive: true });
    await writeFile(browserRecordPath, '# Browser app\nAPI_KEY=sk-secret\n');
    await writeFile(cliRecordPath, '# Python CLI\n');
    await writeFile(blockedRecordPath, '# Blocked web app\n');
    await writeFile(join(browserRunDir, 'target-repo-feedback-summary.json'), JSON.stringify({
      schema: 'repoassure.target-repo-feedback-summary.v1',
      mode: 'browser',
      runStatus: 'passed',
      acceptanceResult: { requiredChecksFailed: 0 },
      blockerCategory: 'none',
      nextRecommendedProductAction: 'no_action',
      artifactLinks: {
        report: '../../../hardening-report.md',
        repairTaskPackage: 'repair-task-package.json',
        screenshots: ['../../artifacts/home.png']
      }
    }));
    await writeFile(join(browserRunDir, 'ai-ide-handoff-package.json'), '{"schemaVersion":"repoassure.ai-ide-handoff-package.v1"}\n');
    await writeFile(join(browserRunDir, 'user-validation-evidence-loop.json'), '{"schemaVersion":"repoassure.user-validation-evidence-loop.v1"}\n');
    await writeFile(join(cliRunDir, 'target-repo-feedback-summary.json'), JSON.stringify({
      schema: 'repoassure.target-repo-feedback-summary.v1',
      mode: 'cli',
      runStatus: 'failed',
      acceptanceResult: { requiredChecksFailed: 1 },
      blockerCategory: 'unknown',
      nextRecommendedProductAction: 'improve_repair_plan',
      artifactLinks: {
        report: '../../../hardening-report.md',
        repairTaskPackage: 'repair-task-package.json',
        screenshots: []
      }
    }));
    await writeFile(join(blockedRunDir, 'target-repo-feedback-summary.json'), JSON.stringify({
      schema: 'repoassure.target-repo-feedback-summary.v1',
      mode: 'browser',
      runStatus: 'blocked',
      acceptanceResult: { requiredChecksFailed: 1 },
      blockerCategory: 'environment',
      nextRecommendedProductAction: 'document_target_stack',
      artifactLinks: {
        report: '../../../hardening-report.md',
        repairTaskPackage: 'repair-task-package.json',
        screenshots: []
      }
    }));

    const summary = await buildValidationCampaignSummary({
      generatedAt: '2026-07-03T10:10:00.000Z',
      targets: [
        { targetId: 'browser-app', repoRoot: browserRepo, acceptanceRecordPath: browserRecordPath },
        { targetId: 'python-cli', repoRoot: cliRepo, acceptanceRecordPath: cliRecordPath },
        { targetId: 'blocked-web-app', repoRoot: blockedRepo, acceptanceRecordPath: blockedRecordPath }
      ]
    });
    const serialized = JSON.stringify(summary);

    expect(summary.schemaVersion).toBe('repoassure.validation-campaign-summary.v1');
    expect(summary.campaignStatus.totalTargets).toBe(3);
    expect(summary.campaignStatus.passedTargets).toBe(1);
    expect(summary.campaignStatus.failedTargets).toBe(1);
    expect(summary.campaignStatus.blockedTargets).toBe(1);
    expect(summary.campaignStatus.productFollowUpActions).toEqual(['improve_repair_plan', 'document_target_stack']);
    expect(summary.targets).toEqual([
      expect.objectContaining({
        targetId: 'browser-app',
        mode: 'browser',
        runStatus: 'passed',
        latestRunId: 'run-2026-07-03T10-00-00-000Z',
        evidence: expect.objectContaining({
          targetRepoFeedbackSummary: join(browserRunDir, 'target-repo-feedback-summary.json'),
          aiIdeHandoffPackage: join(browserRunDir, 'ai-ide-handoff-package.json'),
          userValidationEvidenceLoop: join(browserRunDir, 'user-validation-evidence-loop.json')
        })
      }),
      expect.objectContaining({
        targetId: 'python-cli',
        mode: 'cli',
        runStatus: 'failed',
        blockerCategory: 'unknown',
        nextRecommendedProductAction: 'improve_repair_plan'
      }),
      expect.objectContaining({
        targetId: 'blocked-web-app',
        mode: 'browser',
        runStatus: 'blocked',
        blockerCategory: 'environment',
        nextRecommendedProductAction: 'document_target_stack'
      })
    ]);
    expect(serialized).not.toContain('sk-secret');

    const written = await writeValidationCampaignSummary({
      outputDir: join(root, 'campaign-output'),
      generatedAt: '2026-07-03T10:10:00.000Z',
      targets: [
        { targetId: 'browser-app', repoRoot: browserRepo, acceptanceRecordPath: browserRecordPath },
        { targetId: 'python-cli', repoRoot: cliRepo, acceptanceRecordPath: cliRecordPath },
        { targetId: 'blocked-web-app', repoRoot: blockedRepo, acceptanceRecordPath: blockedRecordPath }
      ]
    });

    await expect(readFile(written.jsonPath, 'utf8')).resolves.toContain('repoassure.validation-campaign-summary.v1');
    await expect(readFile(written.markdownPath, 'utf8')).resolves.toContain('- Blocked targets: 1');
    await expect(readFile(written.markdownPath, 'utf8')).resolves.toContain('| python-cli | cli | failed |');
  });
});
