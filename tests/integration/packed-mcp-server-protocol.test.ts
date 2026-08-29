import { spawn } from 'node:child_process';
import { chmod, mkdir, mkdtemp, readFile, readdir, realpath, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { describe, expect, it } from 'vitest';

interface ProcessResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

function runProcess(command: string, args: string[], cwd: string, env: NodeJS.ProcessEnv = process.env): Promise<ProcessResult> {
  return new Promise((resolveResult, reject) => {
    const child = spawn(command, args, {
      cwd,
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

describe('packed MCP server installation and protocol', () => {
  it('installs the local tarball and serves the existing registry over real stdio MCP', async () => {
    const workspaceRoot = process.cwd();
    const rootDir = await mkdtemp(join(tmpdir(), 'repoassure-packed-mcp-'));
    const packDir = join(rootDir, 'pack');
    const extractDir = join(rootDir, 'extract');
    const consumerDir = join(rootDir, 'consumer');
    const untouchedRepo = join(rootDir, 'untouched-repo');
    const untouchedSourcePath = join(untouchedRepo, 'src', 'index.js');
    const runDir = join(rootDir, 'campaign', 'run-fixed');
    const outputDir = join(rootDir, 'campaign', 'handoff');
    const previewOutputDir = join(rootDir, 'campaign', 'preview');
    const validationOutputDir = join(rootDir, 'campaign', 'validation');
    const patchOutputDir = join(rootDir, 'campaign', 'patch-plan');
    const evidenceOutputDir = join(rootDir, 'campaign', 'evidence-package');

    await mkdir(packDir, { recursive: true });
    await mkdir(extractDir, { recursive: true });
    await mkdir(consumerDir, { recursive: true });
    await mkdir(join(untouchedRepo, 'src'), { recursive: true });
    await mkdir(runDir, { recursive: true });
    await writeFile(join(consumerDir, 'package.json'), `${JSON.stringify({
      name: 'repoassure-packed-mcp-consumer',
      version: '1.0.0',
      private: true
    }, null, 2)}\n`);
    await writeFile(untouchedSourcePath, 'export const untouched = true;\n');
    await writeFile(join(runDir, 'manifest.json'), `${JSON.stringify({
      schemaVersion: 1,
      mode: 'cli',
      runId: 'run-fixed',
      repoRoot: untouchedRepo,
      artifacts: {},
      commandResults: [
        {
          command: 'ruff',
          args: ['check', '.'],
          exitCode: 1,
          stdout: 'Found 1 error',
          stderr: '',
          timedOut: false
        }
      ]
    }, null, 2)}\n`);

    const packResult = await runProcess('pnpm', ['pack', '--pack-destination', packDir], workspaceRoot);
    expect(packResult.exitCode, packResult.stderr || packResult.stdout).toBe(0);

    const tarballName = packResult.stdout
      .trim()
      .split('\n')
      .map((line) => line.trim())
      .reverse()
      .find((line) => line.endsWith('.tgz'));
    expect(tarballName).toBeDefined();
    const tarballPath = resolve(workspaceRoot, tarballName ?? '');
    expect(basename(tarballPath)).toMatch(/^hardening-mcp-0\.1\.0\.tgz$/u);

    const extractResult = await runProcess('tar', ['-xzf', tarballPath, '-C', extractDir], workspaceRoot);
    expect(extractResult.exitCode, extractResult.stderr).toBe(0);
    const packedFiles = await readdir(join(extractDir, 'package'), { recursive: true });
    expect(packedFiles).toContain('dist/adapters/mcp/index.js');
    expect(packedFiles).toContain('dist/adapters/mcp/server.js');
    expect(packedFiles).toContain('dist/adapters/mcp/tool-registry.js');

    const packedManifest = JSON.parse(
      await readFile(join(extractDir, 'package', 'package.json'), 'utf8')
    ) as {
      bin?: Record<string, string>;
      dependencies?: Record<string, string>;
    };
    expect(packedManifest.bin?.['hardening-mcp']).toBe('dist/adapters/mcp/index.js');
    expect(Object.values(packedManifest.dependencies ?? {})).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/^workspace:/u)])
    );

    const installResult = await runProcess(
      'pnpm',
      ['add', '--prefer-offline', '--ignore-scripts', tarballPath],
      consumerDir,
      {
        ...process.env,
        PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '1'
      }
    );
    expect(installResult.exitCode, installResult.stderr || installResult.stdout).toBe(0);

    const installedPackage = join(consumerDir, 'node_modules', 'hardening-mcp');
    const installedBin = join(consumerDir, 'node_modules', '.bin', 'hardening-mcp');
    await chmod(installedBin, 0o755);
    const installedNodeModules = await realpath(join(consumerDir, 'node_modules'));
    expect(await realpath(installedPackage)).toMatch(
      new RegExp(`^${escapeRegExp(installedNodeModules)}`)
    );

    const beforeSource = await readFile(untouchedSourcePath, 'utf8');
    const beforeStat = await stat(untouchedSourcePath);
    const beforeEntries = await readdir(untouchedRepo, { recursive: true });
    const transport = new StdioClientTransport({
      command: installedBin,
      cwd: consumerDir,
      stderr: 'pipe'
    });
    const client = new Client(
      { name: 'repoassure-packed-mcp-acceptance', version: '0.1.0' },
      { capabilities: {} }
    );
    let stderr = '';

    transport.stderr?.on('data', (chunk) => {
      stderr += String(chunk);
    });

    try {
      await client.connect(transport, { timeout: 10_000 });
    } catch (error) {
      const serverPid = transport.pid;
      await client.close().catch(() => undefined);
      if (serverPid !== null) {
        await expectProcessExit(serverPid);
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Packed MCP initialize failed: ${message}\n${stderr.trim()}`, {
        cause: error
      });
    }

    const serverPid = transport.pid;
    expect(serverPid).toEqual(expect.any(Number));

    try {
      const serverVersion = client.getServerVersion();
      expect(serverVersion).toEqual({
        name: 'hardening-mcp',
        version: '0.1.0'
      });

      const listResult = await client.listTools();
      expect(listResult.tools.map((tool) => tool.name)).toEqual([
        'analyze_repo',
        'boot_app',
        'stop_app',
        'explore_app',
        'generate_tests',
        'generate_repair_plan',
        'prepare_repair_handoff',
        'preview_repair_execution',
        'generate_repair_patch_plan',
        'assemble_repair_evidence_package',
        'harden_report',
        'run_hardening'
      ]);
      expect(listResult.tools.find((tool) => tool.name === 'prepare_repair_handoff')).toMatchObject({
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false
        }
      });
      expect(listResult.tools.find((tool) => tool.name === 'preview_repair_execution')).toMatchObject({
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false
        }
      });
      expect(listResult.tools.find((tool) => tool.name === 'generate_repair_patch_plan')).toMatchObject({
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false
        },
        inputSchema: {
          required: ['reportPath']
        }
      });
      expect(listResult.tools.find((tool) => tool.name === 'assemble_repair_evidence_package')).toMatchObject({
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false
        },
        inputSchema: {
          required: [
            'handoffPackagePath',
            'dryRunReportPath',
            'validationReportPath',
            'patchPlanPath'
          ]
        }
      });

      const callResult = await client.callTool({
        name: 'stop_app',
        arguments: {
          sessionId: 'boot_missing_acceptance_session'
        }
      });
      expect(callResult.isError).toBe(false);
      expect(callResult.structuredContent).toEqual({
        sessionId: 'boot_missing_acceptance_session',
        stopped: false,
        error: 'Unknown boot session: [REDACTED]'
      });
      expect(JSON.stringify(callResult.structuredContent)).not.toContain(
        'Unknown boot session: boot_missing_acceptance_session'
      );

      const handoffResult = await client.callTool({
        name: 'prepare_repair_handoff',
        arguments: {
          runDir,
          outputDir
        }
      });
      expect(handoffResult.isError).toBe(false);
      expect(handoffResult.structuredContent).toEqual({
        packagePath: join(outputDir, 'repair-handoff-package.json'),
        markdownPath: join(outputDir, 'repair-handoff-package.md'),
        verificationPlanPath: join(outputDir, 'verification-plan.md'),
        taskCount: 1,
        highestPriority: 'P1',
        status: 'generated'
      });
      await expect(readFile(join(outputDir, 'repair-handoff-package.json'), 'utf8')).resolves.toContain(
        '"maintainerReview"'
      );

      const previewResult = await client.callTool({
        name: 'preview_repair_execution',
        arguments: {
          packagePath: join(outputDir, 'repair-handoff-package.json'),
          all: true,
          outputDir: previewOutputDir
        }
      });
      expect(previewResult.isError).toBe(false);
      expect(previewResult.structuredContent).toEqual({
        reportPath: join(previewOutputDir, 'repair-execution-report.json'),
        markdownPath: join(previewOutputDir, 'repair-execution-report.md'),
        taskCount: 1,
        status: 'planned'
      });
      await expect(readFile(join(previewOutputDir, 'repair-execution-report.json'), 'utf8')).resolves.toContain(
        '"mode": "dry-run"'
      );

      const patchPlanResult = await client.callTool({
        name: 'generate_repair_patch_plan',
        arguments: {
          reportPath: join(previewOutputDir, 'repair-execution-report.json'),
          outputDir: patchOutputDir
        }
      });
      expect(patchPlanResult.isError).toBe(false);
      expect(patchPlanResult.structuredContent).toEqual({
        planPath: join(patchOutputDir, 'patch-plan.json'),
        markdownPath: join(patchOutputDir, 'patch-plan.md'),
        actionCount: 1,
        autoFixCandidates: 0,
        status: 'review_required'
      });
      await expect(readFile(join(patchOutputDir, 'patch-plan.json'), 'utf8')).resolves.toContain(
        '"targetRepoWriteAuthorized": false'
      );
      await expect(readFile(join(patchOutputDir, 'patch-plan.md'), 'utf8')).resolves.toContain(
        'Maintainer Review'
      );

      const dryRunReport = JSON.parse(
        await readFile(join(previewOutputDir, 'repair-execution-report.json'), 'utf8')
      ) as {
        summary: Record<string, number>;
        tasks: Array<Record<string, unknown>>;
      };
      const validationReportPath = join(validationOutputDir, 'repair-execution-report.json');
      await mkdir(validationOutputDir, { recursive: true });
      await writeFile(validationReportPath, `${JSON.stringify({
        ...dryRunReport,
        mode: 'validation-only',
        status: 'skipped',
        summary: {
          ...dryRunReport.summary,
          verificationCommands: 0,
          passed: 0,
          failed: 0,
          skipped: 1
        },
        tasks: dryRunReport.tasks.map((task) => ({
          ...task,
          mode: 'validation-only',
          executionStatus: 'skipped',
          verificationResults: []
        }))
      }, null, 2)}\n`);

      const evidencePackageResult = await client.callTool({
        name: 'assemble_repair_evidence_package',
        arguments: {
          handoffPackagePath: join(outputDir, 'repair-handoff-package.json'),
          dryRunReportPath: join(previewOutputDir, 'repair-execution-report.json'),
          validationReportPath,
          patchPlanPath: join(patchOutputDir, 'patch-plan.json'),
          outputDir: evidenceOutputDir
        }
      });
      expect(evidencePackageResult.isError).toBe(false);
      expect(evidencePackageResult.structuredContent).toEqual({
        packagePath: join(evidenceOutputDir, 'ai-ide-repair-evidence-package.json'),
        markdownPath: join(evidenceOutputDir, 'ai-ide-repair-evidence-package.md'),
        taskCount: 1,
        status: 'review_required'
      });
      await expect(
        readFile(join(evidenceOutputDir, 'ai-ide-repair-evidence-package.json'), 'utf8')
      ).resolves.toContain('"patchesApplied": false');
      await expect(
        readFile(join(evidenceOutputDir, 'ai-ide-repair-evidence-package.md'), 'utf8')
      ).resolves.toContain('Verification Checklist');
    } finally {
      await client.close().catch(() => undefined);
      await expectProcessExit(serverPid);
    }

    expect(stderr).toBe('');
    await expect(readFile(untouchedSourcePath, 'utf8')).resolves.toBe(beforeSource);
    expect((await stat(untouchedSourcePath)).mtimeMs).toBe(beforeStat.mtimeMs);
    expect(await readdir(untouchedRepo, { recursive: true })).toEqual(beforeEntries);
  }, 120_000);
});

async function expectProcessExit(pid: number | null): Promise<void> {
  if (pid === null) {
    throw new Error('Expected MCP server process id');
  }

  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      process.kill(pid, 0);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ESRCH') {
        return;
      }

      throw error;
    }

    await new Promise((resolveDelay) => {
      setTimeout(resolveDelay, 10);
    });
  }

  throw new Error(`MCP server process ${pid} did not exit`);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}
