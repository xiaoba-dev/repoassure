import { spawn } from 'node:child_process';
import { chmod, mkdir, mkdtemp, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

interface ProcessResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

function runInstalledCli(args: string[], env: NodeJS.ProcessEnv): Promise<ProcessResult> {
  return new Promise((resolveResult, reject) => {
    const child = spawn(process.execPath, [resolve('dist/adapters/cli/index.js'), ...args], {
      cwd: process.cwd(),
      env,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk: string) => {
      stderr += chunk;
    });
    child.once('error', reject);
    child.once('close', (exitCode) => {
      resolveResult({ exitCode, stdout, stderr });
    });
  });
}

function outputPath(stdout: string, key: string): string {
  const summary = JSON.parse(stdout) as Record<string, unknown>;
  const path = summary[key];

  if (typeof path !== 'string') {
    throw new Error(`Missing ${key} path in CLI output:\n${stdout}`);
  }

  return path;
}

describe('installed repair CLI real campaign', () => {
  it('consumes a near-real campaign as an external process without writing target repo files', async () => {
    const fixtureManifest = JSON.parse(
      await readFile('fixtures/campaigns/ai-ide-repair-decision-package/manifest.json', 'utf8')
    ) as Record<string, unknown>;
    const rootDir = await mkdtemp(join(tmpdir(), 'repoassure-installed-repair-cli-'));
    const targetRepo = join(rootDir, 'target-repo');
    const outputRoot = join(rootDir, 'evidence');
    const runDir = join(outputRoot, 'runs', 'campaign-run-001');
    const handoffDir = join(outputRoot, 'handoff');
    const dryRunDir = join(outputRoot, 'dry-run');
    const validationDir = join(outputRoot, 'validation');
    const patchPlanDir = join(outputRoot, 'patch-plan');
    const packageDir = join(outputRoot, 'end-to-end-package');
    const binDir = join(rootDir, 'bin');
    const commandLogPath = join(outputRoot, 'commands.log');
    const targetSourcePath = join(targetRepo, 'src', 'auth', 'password.js');

    await mkdir(join(targetRepo, 'src', 'auth'), { recursive: true });
    await mkdir(runDir, { recursive: true });
    await mkdir(binDir, { recursive: true });
    await writeFile(targetSourcePath, 'module.exports = { hash: "sha1" };\n');
    await writeFile(join(runDir, 'manifest.json'), `${JSON.stringify({
      ...fixtureManifest,
      repoRoot: targetRepo,
      runId: 'campaign-run-001'
    }, null, 2)}\n`);
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

    const env = {
      ...process.env,
      PATH: `${binDir}:${process.env.PATH ?? ''}`,
      REPOASSURE_COMMAND_LOG: commandLogPath
    };
    const beforeSource = await readFile(targetSourcePath, 'utf8');
    const beforeStat = await stat(targetSourcePath);
    const beforeEntries = await readdir(targetRepo, { recursive: true });

    const handoffResult = await runInstalledCli([
      'repair',
      'handoff',
      '--run',
      runDir,
      '--output',
      handoffDir
    ], env);
    expect(handoffResult).toMatchObject({ exitCode: 0, stderr: '' });
    const handoffPackagePath = outputPath(handoffResult.stdout, 'packagePath');
    const handoffMarkdownPath = outputPath(handoffResult.stdout, 'markdownPath');
    const verificationPlanPath = outputPath(handoffResult.stdout, 'verificationPlanPath');
    const handoffText = await readFile(handoffPackagePath, 'utf8');
    const handoff = JSON.parse(handoffText) as {
      schemaVersion: number;
      agentContract: { schema: string; readOrder: string[]; nextCommands: Record<string, string> };
      repairActionQueue: Array<{ taskId: string; requiresMaintainerReview: boolean }>;
      maintainerReview: { allowedDecisions: string[] };
      verificationChecklist: { commands: string[] };
    };

    expect(handoff.schemaVersion).toBe(1);
    expect(handoff.agentContract.schema).toBe('repoassure.repair-handoff.v1');
    expect(handoff.agentContract.readOrder).toContain('repairActionQueue[]');
    expect(handoff.agentContract.nextCommands.dryRun).toMatch(/^hardening repair execute/u);
    expect(handoff.repairActionQueue).toHaveLength(4);
    expect(handoff.repairActionQueue.every((task) => task.requiresMaintainerReview)).toBe(true);
    expect(handoff.maintainerReview.allowedDecisions).toEqual(['approve', 'reject', 'defer', 'accept_risk']);
    expect(handoff.verificationChecklist.commands).toContain('pnpm test -- --runInBand');
    expect(await readFile(handoffMarkdownPath, 'utf8')).toContain('# Repair Handoff Package');
    expect(await readFile(verificationPlanPath, 'utf8')).toContain('# Verification Plan');

    const dryRunResult = await runInstalledCli([
      'repair',
      'execute',
      '--package',
      handoffPackagePath,
      '--all',
      '--dry-run',
      '--output',
      dryRunDir
    ], env);
    expect(dryRunResult).toMatchObject({ exitCode: 0, stderr: '' });
    const dryRunReportPath = outputPath(dryRunResult.stdout, 'reportPath');
    const dryRunMarkdownPath = outputPath(dryRunResult.stdout, 'markdownPath');
    const dryRun = JSON.parse(await readFile(dryRunReportPath, 'utf8')) as {
      mode: string;
      agentContract: { schema: string; readOrder: string[] };
      noWriteProof: { targetRepoWriteAuthorized: boolean; sourceFilesChanged: boolean };
    };
    expect(dryRun.mode).toBe('dry-run');
    expect(dryRun.agentContract.schema).toBe('repoassure.repair-execution-report.v1');
    expect(dryRun.agentContract.readOrder).toContain('tasks[].verificationResults');
    expect(dryRun.noWriteProof).toMatchObject({
      targetRepoWriteAuthorized: false,
      sourceFilesChanged: false
    });
    expect(await readFile(dryRunMarkdownPath, 'utf8')).toContain('# Repair Execution Report');

    const validationResult = await runInstalledCli([
      'repair',
      'execute',
      '--package',
      handoffPackagePath,
      '--all',
      '--validation-only',
      '--output',
      validationDir
    ], env);
    expect(validationResult).toMatchObject({ exitCode: 0, stderr: '' });
    const validationReportPath = outputPath(validationResult.stdout, 'reportPath');
    const validationMarkdownPath = outputPath(validationResult.stdout, 'markdownPath');
    const validationText = await readFile(validationReportPath, 'utf8');
    const validation = JSON.parse(validationText) as {
      status: string;
      summary: { passed: number; failed: number; skipped: number };
      verificationChecklist: { completionSignals: string[] };
      noWriteProof: { targetRepoWriteAuthorized: boolean; sourceFilesChanged: boolean };
    };
    expect(validation.status).toBe('failed');
    expect(validation.summary).toMatchObject({ passed: 1, failed: 1, skipped: 2 });
    expect(validation.verificationChecklist.completionSignals).toContain(
      'Maintainer review decision is recorded before any target repo write.'
    );
    expect(validation.noWriteProof).toMatchObject({
      targetRepoWriteAuthorized: false,
      sourceFilesChanged: false
    });
    expect(await readFile(validationMarkdownPath, 'utf8')).toContain('## Verification Checklist');

    const patchResult = await runInstalledCli([
      'repair',
      'patch-plan',
      '--report',
      validationReportPath,
      '--output',
      patchPlanDir
    ], env);
    expect(patchResult).toMatchObject({ exitCode: 0, stderr: '' });
    const patchPlanPath = outputPath(patchResult.stdout, 'planPath');
    const patchMarkdownPath = outputPath(patchResult.stdout, 'markdownPath');
    const patchPlan = JSON.parse(await readFile(patchPlanPath, 'utf8')) as {
      agentContract: { schema: string; applyPolicy: string; readOrder: string[] };
      actions: unknown[];
      maintainerReview: { allowedDecisions: string[] };
      noWriteProof: { targetRepoWriteAuthorized: boolean; patchesApplied: boolean };
    };
    expect(patchPlan.agentContract).toMatchObject({
      schema: 'repoassure.patch-plan.v1',
      applyPolicy: 'manual-review-only'
    });
    expect(patchPlan.agentContract.readOrder).toContain('actions[].recommendedChange');
    expect(patchPlan.actions.length).toBeGreaterThan(0);
    expect(patchPlan.maintainerReview.allowedDecisions).toEqual(['approve', 'reject', 'defer', 'accept_risk']);
    expect(patchPlan.noWriteProof).toMatchObject({
      targetRepoWriteAuthorized: false,
      patchesApplied: false
    });
    expect(await readFile(patchMarkdownPath, 'utf8')).toContain('## Maintainer Review Boundary');

    const evidenceResult = await runInstalledCli([
      'repair',
      'evidence-package',
      '--handoff',
      handoffPackagePath,
      '--dry-run-report',
      dryRunReportPath,
      '--validation-report',
      validationReportPath,
      '--patch-plan',
      patchPlanPath,
      '--output',
      packageDir
    ], env);
    expect(evidenceResult).toMatchObject({ exitCode: 0, stderr: '' });
    const evidencePackagePath = outputPath(evidenceResult.stdout, 'packagePath');
    const evidenceMarkdownPath = outputPath(evidenceResult.stdout, 'markdownPath');
    const evidenceText = await readFile(evidencePackagePath, 'utf8');
    const evidence = JSON.parse(evidenceText) as {
      schemaVersion: number;
      status: string;
      agentContract: { schema: string; readOrder: string[] };
      repairFlow: Array<{ stage: string }>;
      maintainerReview: { requiredBefore: string[] };
      verificationChecklist: { commands: string[] };
      noWriteProof: {
        targetRepoWriteAuthorized: boolean;
        sourceFilesChanged: boolean;
        patchesApplied: boolean;
      };
    };
    const evidenceMarkdown = await readFile(evidenceMarkdownPath, 'utf8');

    expect(evidence.schemaVersion).toBe(1);
    expect(evidence.status).toBe('review_required');
    expect(evidence.agentContract.schema).toBe('repoassure.repair-evidence-package.v1');
    expect(evidence.agentContract.readOrder).toEqual([
      'summary',
      'artifactIndex',
      'repairFlow',
      'taskMatrix',
      'maintainerReview',
      'verificationChecklist',
      'noWriteProof'
    ]);
    expect(evidence.repairFlow.map((stage) => stage.stage)).toEqual([
      'handoff',
      'dry-run',
      'validation-only',
      'patch-plan',
      'maintainer-review'
    ]);
    expect(evidence.maintainerReview.requiredBefore).toContain('changing target repository files');
    expect(evidence.verificationChecklist.commands).toContain('pnpm test -- --runInBand');
    expect(evidence.noWriteProof).toMatchObject({
      targetRepoWriteAuthorized: false,
      sourceFilesChanged: false,
      patchesApplied: false
    });
    expect(evidenceMarkdown).toContain('# AI IDE Repair Evidence Package');
    expect(evidenceMarkdown).toContain('## Artifact Index');
    expect(evidenceMarkdown).toContain('## Maintainer Review Boundary');
    expect(evidenceMarkdown).toContain('## No-write Proof');

    const combinedOutput = [
      handoffResult.stdout,
      dryRunResult.stdout,
      validationResult.stdout,
      patchResult.stdout,
      evidenceResult.stdout,
      handoffText,
      validationText,
      evidenceText,
      evidenceMarkdown
    ].join('\n');
    expect(combinedOutput).not.toContain('ghp_real_secret_token');
    expect(combinedOutput).not.toContain('sessionid=private');
    expect(combinedOutput).not.toContain('TOKEN=secret');
    expect(await readFile(commandLogPath, 'utf8')).toBe('test -- --runInBand\nlint\n');
    await expect(readFile(targetSourcePath, 'utf8')).resolves.toBe(beforeSource);
    expect((await stat(targetSourcePath)).mtimeMs).toBe(beforeStat.mtimeMs);
    expect(await readdir(targetRepo, { recursive: true })).toEqual(beforeEntries);
  }, 30_000);
});
