import { chmod, mkdir, mkdtemp, readFile, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { runRepairEvidencePackage } from '../../packages/acceptance/src/run-repair-evidence-package.js';
import { runRepairExecute } from '../../packages/acceptance/src/run-repair-execute.js';
import { runRepairHandoff, type RepairHandoffPackage } from '../../packages/acceptance/src/run-repair-handoff.js';
import { runRepairPatchPlan } from '../../packages/acceptance/src/run-repair-patch-plan.js';

describe('repair evidence package', () => {
  it('aggregates the AI IDE repair loop into a readable end-to-end evidence package without writing target repo files', async () => {
    const fixtureManifest = JSON.parse(
      await readFile('fixtures/campaigns/ai-ide-repair-decision-package/manifest.json', 'utf8')
    ) as Record<string, unknown>;
    const rootDir = await mkdtemp(join(tmpdir(), 'repoassure-ai-ide-evidence-package-'));
    const targetRepo = join(rootDir, 'target-repo');
    const outputRoot = join(rootDir, 'evidence');
    const runDir = join(outputRoot, 'runs', 'campaign-run-001');
    const handoffDir = join(outputRoot, 'handoff');
    const dryRunDir = join(outputRoot, 'dry-run');
    const validationDir = join(outputRoot, 'validation');
    const patchPlanDir = join(outputRoot, 'patch-plan');
    const packageDir = join(outputRoot, 'end-to-end-package');
    const binDir = join(targetRepo, 'bin');
    const commandLogPath = join(outputRoot, 'commands.log');
    const targetSourcePath = join(targetRepo, 'src', 'auth', 'password.js');

    await mkdir(join(targetRepo, 'src', 'auth'), { recursive: true });
    await mkdir(runDir, { recursive: true });
    await mkdir(binDir, { recursive: true });
    await writeFile(targetSourcePath, 'module.exports = { hash: "sha1" };\n');
    await writeFile(join(runDir, 'manifest.json'), JSON.stringify({
      ...fixtureManifest,
      repoRoot: targetRepo,
      runId: 'campaign-run-001'
    }, null, 2));
    await writeFile(join(binDir, 'pnpm'), [
      '#!/bin/sh',
      'printf "%s\\n" "$*" >> "$REPOASSURE_COMMAND_LOG"',
      'case "$*" in',
      '  "test -- --runInBand") echo "tests passed"; exit 0 ;;',
      '  "lint") echo "src/auth/password.js:42 weak hash algorithm TOKEN=secret" >&2; exit 1 ;;',
      '  *) echo "unexpected command: $*" >&2; exit 99 ;;',
      'esac',
      ''
    ].join('\n'));
    await chmod(join(binDir, 'pnpm'), 0o755);
    const beforeTargetSource = await readFile(targetSourcePath, 'utf8');
    const beforeTargetStat = await stat(targetSourcePath);

    const handoff = await runRepairHandoff({
      runDir,
      outputDir: handoffDir,
      generatedAt: '2026-07-16T16:00:00.000Z'
    });
    const handoffPackage = JSON.parse(await readFile(handoff.packagePath, 'utf8')) as RepairHandoffPackage;
    const taskIds = handoffPackage.repairActionQueue.map((task) => task.taskId);
    const dryRun = await runRepairExecute({
      packagePath: handoff.packagePath,
      taskIds,
      dryRun: true,
      outputDir: dryRunDir,
      generatedAt: '2026-07-16T16:05:00.000Z'
    });
    const validation = await runRepairExecute({
      packagePath: handoff.packagePath,
      taskIds,
      validationOnly: true,
      outputDir: validationDir,
      generatedAt: '2026-07-16T16:10:00.000Z',
      timeoutMs: 10_000,
      maxOutputChars: 500,
      env: {
        ...process.env,
        PATH: `${binDir}:${process.env.PATH ?? ''}`,
        REPOASSURE_COMMAND_LOG: commandLogPath
      }
    });
    const patchPlan = await runRepairPatchPlan({
      reportPath: validation.reportPath,
      outputDir: patchPlanDir,
      generatedAt: '2026-07-16T16:15:00.000Z'
    });

    const result = await runRepairEvidencePackage({
      handoffPackagePath: handoff.packagePath,
      dryRunReportPath: dryRun.reportPath,
      validationReportPath: validation.reportPath,
      patchPlanPath: patchPlan.planPath,
      outputDir: packageDir,
      generatedAt: '2026-07-16T16:20:00.000Z'
    });

    const packageText = await readFile(result.packagePath, 'utf8');
    const markdown = await readFile(result.markdownPath, 'utf8');
    const evidencePackage = JSON.parse(packageText) as {
      schemaVersion: number;
      status: string;
      runId: string;
      repoRoot: string;
      summary: {
        queuedTasks: number;
        dryRunPlanned: number;
        validationPassed: number;
        validationFailed: number;
        validationSkipped: number;
        patchActions: number;
      };
      agentContract: {
        schema: string;
        primaryReadPath: string;
        readOrder: string[];
        boundaries: string[];
      };
      artifactIndex: Array<{ role: string; path: string; schema: string; status: string; readAfter: string[] }>;
      repairFlow: Array<{ stage: string; status: string; artifactRole: string }>;
      taskMatrix: Array<{
        taskId: string;
        priority: string;
        dryRunStatus: string;
        validationStatus: string;
        patchActionCount: number;
        nextAction: string;
      }>;
      maintainerReview: { requiredBefore: string[]; allowedDecisions: string[] };
      verificationChecklist: { commands: string[]; completionSignals: string[] };
      noWriteProof: {
        targetRepoWriteAuthorized: boolean;
        sourceFilesChanged: boolean;
        patchesApplied: boolean;
        evidenceSources: string[];
      };
    };

    expect(result.status).toBe('review_required');
    expect(evidencePackage.schemaVersion).toBe(1);
    expect(evidencePackage.status).toBe('review_required');
    expect(evidencePackage.runId).toBe('campaign-run-001');
    expect(evidencePackage.repoRoot).toBe(targetRepo);
    expect(evidencePackage.summary).toMatchObject({
      queuedTasks: taskIds.length,
      dryRunPlanned: taskIds.length,
      validationPassed: 1,
      validationFailed: 1,
      validationSkipped: 2,
      patchActions: patchPlan.actionCount
    });
    expect(evidencePackage.agentContract).toMatchObject({
      schema: 'repoassure.repair-evidence-package.v1',
      primaryReadPath: 'ai-ide-repair-evidence-package.json'
    });
    expect(evidencePackage.agentContract.readOrder).toEqual([
      'summary',
      'artifactIndex',
      'repairFlow',
      'taskMatrix',
      'maintainerReview',
      'verificationChecklist',
      'noWriteProof'
    ]);
    expect(evidencePackage.agentContract.boundaries).toContain('This package is evidence for AI IDE and maintainer consumption, not permission to modify the target repository.');
    expect(evidencePackage.artifactIndex.map((artifact) => artifact.role)).toEqual([
      'repair-handoff',
      'repair-execution-dry-run',
      'repair-execution-validation-only',
      'repair-patch-plan'
    ]);
    expect(evidencePackage.artifactIndex.find((artifact) => artifact.role === 'repair-patch-plan')?.readAfter)
      .toContain('repair-execution-validation-only');
    expect(evidencePackage.repairFlow.map((stage) => stage.stage)).toEqual([
      'handoff',
      'dry-run',
      'validation-only',
      'patch-plan',
      'maintainer-review'
    ]);
    expect(evidencePackage.taskMatrix.some((task) => task.validationStatus === 'failed' && task.patchActionCount > 0)).toBe(true);
    expect(evidencePackage.taskMatrix.some((task) => task.validationStatus === 'skipped' && task.nextAction.includes('manual'))).toBe(true);
    expect(evidencePackage.maintainerReview.requiredBefore).toContain('changing target repository files');
    expect(evidencePackage.maintainerReview.allowedDecisions).toEqual(['approve', 'reject', 'defer', 'accept_risk']);
    expect(evidencePackage.verificationChecklist.commands).toContain('pnpm test -- --runInBand');
    expect(evidencePackage.verificationChecklist.completionSignals).toContain('Maintainer review decision is recorded before any target repo write.');
    expect(evidencePackage.noWriteProof).toMatchObject({
      targetRepoWriteAuthorized: false,
      sourceFilesChanged: false,
      patchesApplied: false
    });
    expect(evidencePackage.noWriteProof.evidenceSources).toEqual([
      'repair-execution-dry-run',
      'repair-execution-validation-only',
      'repair-patch-plan'
    ]);
    expect(packageText).not.toContain('TOKEN=secret');
    expect(packageText).not.toContain('ghp_real_secret_token');
    expect(packageText).not.toContain('sessionid=private');
    expect(markdown).toContain('# AI IDE Repair Evidence Package');
    expect(markdown).toContain('## Artifact Index');
    expect(markdown).toContain('## Repair Flow');
    expect(markdown).toContain('## Task Matrix');
    expect(markdown).toContain('## Maintainer Review Boundary');
    expect(markdown).toContain('## No-write Proof');
    expect(markdown).not.toContain('TOKEN=secret');
    await expect(readFile(targetSourcePath, 'utf8')).resolves.toBe(beforeTargetSource);
    expect((await stat(targetSourcePath)).mtimeMs).toBe(beforeTargetStat.mtimeMs);
  });
});
