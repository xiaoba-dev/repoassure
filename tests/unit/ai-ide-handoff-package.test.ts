import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  buildAiIdeHandoffPackage,
  writeAiIdeHandoffPackageArtifact
} from '../../packages/acceptance/src/ai-ide-handoff-package.js';
import type { UserAcceptanceCheck } from '../../packages/acceptance/src/user-acceptance.js';

describe('AI IDE handoff package', () => {
  it('builds a local handoff index with ordered artifact guidance and redacted relative links', () => {
    const repoRoot = '/private/tmp/customer-app-API_KEY=sk-private-secret';
    const runDir = `${repoRoot}/.hardening/runs/run-2026-07-02T00-00-00-000Z`;
    const checks: UserAcceptanceCheck[] = [
      {
        name: 'hardening-report.md 已生成',
        required: true,
        status: 'passed',
        evidence: `${repoRoot}/hardening-report.md?token=report-secret`
      },
      {
        name: 'generated Playwright spec 执行验证',
        required: true,
        status: 'failed',
        evidence: 'failed with Access token=cf-secret and Cookie: sid=session-secret'
      },
      {
        name: 'target-repo-feedback-summary.json 已生成',
        required: true,
        status: 'passed',
        evidence: `${runDir}/target-repo-feedback-summary.json`
      }
    ];

    const handoffPackage = buildAiIdeHandoffPackage({
      generatedAt: '2026-07-02T00:00:00.000Z',
      mode: 'browser',
      runDir,
      manifestPath: `${runDir}/manifest.json`,
      targetRepoFeedbackSummaryPath: `${runDir}/target-repo-feedback-summary.json`,
      reportPath: `${repoRoot}/hardening-report.md?token=report-secret`,
      findingsPath: `${runDir}/findings.json`,
      repairPlanPath: `${runDir}/repair-plan.json`,
      repairPlanMarkdownPath: `${runDir}/repair-plan.md`,
      repairTaskPackagePath: `${runDir}/repair-task-package.json`,
      repairTaskPackageMarkdownPath: `${runDir}/repair-task-package.md`,
      patchDiffPath: `${runDir}/patch.diff`,
      generatedTestFiles: [`${repoRoot}/tests/generated.spec.ts`],
      artifactFiles: [`${runDir}/home.png`],
      checks
    });

    expect(handoffPackage.schemaVersion).toBe('repoassure.ai-ide-handoff-package.v1');
    expect(handoffPackage.runStatus).toBe('failed');
    expect(handoffPackage.recommendedReadingOrder.map((entry) => entry.artifactKind)).toEqual([
      'target_repo_feedback_summary',
      'hardening_report',
      'repair_task_package',
      'repair_plan',
      'patch_diff',
      'generated_tests',
      'browser_artifacts'
    ]);
    expect(handoffPackage.recommendedReadingOrder[0]).toMatchObject({
      path: 'target-repo-feedback-summary.json',
      reason: expect.stringContaining('start here')
    });
    expect(handoffPackage.artifactInventory).toContainEqual(expect.objectContaining({
      artifactKind: 'hardening_report',
      path: '../../../hardening-report.md?token=[REDACTED]',
      available: true,
      requiredForAiIde: true
    }));
    expect(handoffPackage.priorityActions[0]).toMatchObject({
      priority: 'P0',
      source: 'generated Playwright spec 执行验证'
    });
    expect(handoffPackage.qualityGates).toMatchObject({
      localOnly: true,
      requiredChecksFailed: 1,
      missingRequiredArtifacts: []
    });
    expect(handoffPackage.consumptionGuidance.forAiIde).toContain('Follow recommendedReadingOrder');
    expect(handoffPackage.sourceSummary).toMatchObject({
      generatedTestsCount: 1,
      browserArtifactCount: 1
    });

    const serialized = JSON.stringify(handoffPackage);
    expect(serialized).not.toContain('sk-private-secret');
    expect(serialized).not.toContain('report-secret');
    expect(serialized).not.toContain('cf-secret');
    expect(serialized).not.toContain('session-secret');
    expect(serialized).not.toContain(repoRoot);
  });

  it('writes the handoff package artifact and links it from the run manifest', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'repoassure-ai-ide-handoff-'));
    const runDir = join(repoRoot, '.hardening', 'runs', 'run-2026-07-02T00-00-00-000Z');
    const manifestPath = join(runDir, 'manifest.json');
    await mkdir(runDir, { recursive: true });
    await writeFile(manifestPath, `${JSON.stringify({ schemaVersion: 1, artifacts: {} }, null, 2)}\n`);

    const result = await writeAiIdeHandoffPackageArtifact({
      generatedAt: '2026-07-02T00:00:00.000Z',
      mode: 'cli',
      runDir,
      manifestPath,
      targetRepoFeedbackSummaryPath: join(runDir, 'target-repo-feedback-summary.json'),
      reportPath: join(repoRoot, 'hardening-report.md'),
      findingsPath: join(runDir, 'python-cli-profile.json'),
      repairPlanPath: join(runDir, 'repair-plan.json'),
      repairPlanMarkdownPath: join(runDir, 'repair-plan.md'),
      repairTaskPackagePath: join(runDir, 'repair-task-package.json'),
      repairTaskPackageMarkdownPath: join(runDir, 'repair-task-package.md'),
      generatedTestFiles: [],
      artifactFiles: [],
      checks: [
        {
          name: 'hardening-report.md 已生成',
          required: true,
          status: 'passed',
          evidence: join(repoRoot, 'hardening-report.md')
        }
      ]
    });

    const handoffPackage = JSON.parse(await readFile(result.handoffPackagePath, 'utf8')) as {
      schemaVersion: string;
      sourceSummary: { targetRepoFeedbackSummary: string };
    };
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as {
      artifacts: { aiIdeHandoffPackagePath?: string };
    };

    expect(result.handoffPackagePath).toBe(join(runDir, 'ai-ide-handoff-package.json'));
    expect(handoffPackage.schemaVersion).toBe('repoassure.ai-ide-handoff-package.v1');
    expect(handoffPackage.sourceSummary.targetRepoFeedbackSummary).toBe('target-repo-feedback-summary.json');
    expect(manifest.artifacts.aiIdeHandoffPackagePath).toBe(result.handoffPackagePath);
  });
});
