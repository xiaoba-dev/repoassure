import { spawn } from 'node:child_process';
import { chmod, mkdir, mkdtemp, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';

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

function outputPath(stdout: string, key: string): string {
  const summary = JSON.parse(stdout) as Record<string, unknown>;
  const path = summary[key];

  if (typeof path !== 'string') {
    throw new Error(`Missing ${key} path in CLI output:\n${stdout}`);
  }

  return path;
}

describe('packed CLI installation', () => {
  it('installs the local tarball and runs the hardening bin without a source-workspace dependency', async () => {
    const workspaceRoot = process.cwd();
    const rootDir = await mkdtemp(join(tmpdir(), 'repoassure-packed-cli-'));
    const packDir = join(rootDir, 'pack');
    const extractDir = join(rootDir, 'extract');
    const consumerDir = join(rootDir, 'consumer');
    const targetRepo = join(rootDir, 'target-repo');
    const runDir = join(rootDir, 'campaign-run');
    const outputDir = join(rootDir, 'handoff');
    const targetSourcePath = join(targetRepo, 'src', 'auth', 'password.js');

    await mkdir(packDir, { recursive: true });
    await mkdir(extractDir, { recursive: true });
    await mkdir(consumerDir, { recursive: true });
    await mkdir(join(targetRepo, 'src', 'auth'), { recursive: true });
    await mkdir(runDir, { recursive: true });
    await writeFile(join(consumerDir, 'package.json'), `${JSON.stringify({
      name: 'repoassure-packed-cli-consumer',
      version: '1.0.0',
      private: true
    }, null, 2)}\n`);
    await writeFile(targetSourcePath, 'module.exports = { hash: "sha1" };\n');

    const fixtureManifest = JSON.parse(
      await readFile(join(workspaceRoot, 'fixtures/campaigns/ai-ide-repair-decision-package/manifest.json'), 'utf8')
    ) as Record<string, unknown>;
    await writeFile(join(runDir, 'manifest.json'), `${JSON.stringify({
      ...fixtureManifest,
      repoRoot: targetRepo,
      runId: 'packed-cli-run-001'
    }, null, 2)}\n`);

    const beforeSource = await readFile(targetSourcePath, 'utf8');
    const beforeStat = await stat(targetSourcePath);
    const beforeEntries = await readdir(targetRepo, { recursive: true });

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
    expect(packedFiles).toContain('dist/adapters/cli/index.js');
    expect(packedFiles).toContain('dist/adapters/cli/run.js');
    expect(packedFiles).toContain('LICENSE');
    expect(packedFiles).toContain('README.md');
    expect(packedFiles).not.toContain('tests');
    expect(packedFiles).not.toContain('.autopilot');

    const packedManifest = JSON.parse(
      await readFile(join(extractDir, 'package', 'package.json'), 'utf8')
    ) as {
      bin?: Record<string, string>;
      dependencies?: Record<string, string>;
    };
    expect(packedManifest.bin?.hardening).toBe('dist/adapters/cli/index.js');
    expect(packedManifest.dependencies).not.toEqual(
      expect.objectContaining({
        '@hardening-mcp/acceptance': expect.stringMatching(/^workspace:/u)
      })
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

    const installedBin = join(consumerDir, 'node_modules', '.bin', 'hardening');
    await chmod(installedBin, 0o755);
    const helpResult = await runProcess(installedBin, ['repair', '--help'], consumerDir);
    expect(helpResult).toMatchObject({ exitCode: 0, stderr: '' });
    expect(helpResult.stdout).toContain('hardening repair <subcommand>');
    expect(helpResult.stdout).toContain('handoff');
    expect(helpResult.stdout).toContain('execute');

    const handoffResult = await runProcess(installedBin, [
      'repair',
      'handoff',
      '--run',
      runDir,
      '--output',
      outputDir
    ], consumerDir);
    expect(handoffResult).toMatchObject({ exitCode: 0, stderr: '' });
    const handoffPackagePath = outputPath(handoffResult.stdout, 'packagePath');
    const handoffText = await readFile(handoffPackagePath, 'utf8');
    expect(handoffText).toContain('repoassure.repair-handoff.v1');
    expect(handoffText).not.toContain('ghp_real_secret_token');
    expect(handoffText).not.toContain('sessionid=private');

    await expect(readFile(targetSourcePath, 'utf8')).resolves.toBe(beforeSource);
    expect((await stat(targetSourcePath)).mtimeMs).toBe(beforeStat.mtimeMs);
    expect(await readdir(targetRepo, { recursive: true })).toEqual(beforeEntries);
  }, 120_000);
});
