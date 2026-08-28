import { spawn } from 'node:child_process';
import { chmod, mkdir, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

/* Everything above the workspace boundary is only ever exercised from inside the
   workspace, where every dependency resolves because pnpm links it. The failure this
   guards against is invisible there: a `workspace:` dependency that survives into the
   published manifest resolves locally and throws ERR_MODULE_NOT_FOUND on every installed
   copy. It shipped once already — the Project Intelligence Console imported the design
   system, a private workspace package the tarball does not carry.

   So this packs the CLI, installs the tarball into a directory that has no workspace at
   all, and runs the binary from there. */

interface ProcessResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

function runProcess(
  command: string,
  args: string[],
  cwd: string,
  env: NodeJS.ProcessEnv = process.env
): Promise<ProcessResult> {
  return new Promise((resolveResult, reject) => {
    const child = spawn(command, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', (exitCode) => {
      resolveResult({ exitCode, stdout, stderr });
    });
  });
}

describe('packed CLI installation', () => {
  it('installs the local tarball and runs the hardening bin without a source-workspace dependency', async () => {
    const workspaceRoot = process.cwd();
    const rootDir = await mkdtemp(join(tmpdir(), 'repoassure-packed-cli-'));
    const packDir = join(rootDir, 'pack');
    const extractDir = join(rootDir, 'extract');
    const consumerDir = join(rootDir, 'consumer');

    await mkdir(packDir, { recursive: true });
    await mkdir(extractDir, { recursive: true });
    await mkdir(consumerDir, { recursive: true });

    /* A bare package.json and nothing else: no pnpm-workspace.yaml, no link to the
       source tree. If the tarball needs the workspace, it cannot hide it here. */
    await writeFile(
      join(consumerDir, 'package.json'),
      `${JSON.stringify({ name: 'repoassure-packed-cli-consumer', version: '1.0.0', private: true }, null, 2)}\n`
    );

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

    /* The publication boundary, asserted rather than assumed. Without a `files` field the
       tarball carries the whole repository, including the local governance state. */
    const packedFiles = await readdir(join(extractDir, 'package'), { recursive: true });
    expect(packedFiles).toContain('dist/adapters/cli/index.js');
    expect(packedFiles).toContain('dist/adapters/mcp/index.js');
    expect(packedFiles).toContain('LICENSE');
    expect(packedFiles).toContain('README.md');
    expect(packedFiles).not.toContain('tests');
    expect(packedFiles).not.toContain('scripts');
    expect(packedFiles).not.toContain('.autopilot');

    const packedManifest = JSON.parse(await readFile(join(extractDir, 'package', 'package.json'), 'utf8')) as {
      bin?: Record<string, string>;
      dependencies?: Record<string, string>;
    };
    expect(packedManifest.bin?.hardening).toBe('dist/adapters/cli/index.js');

    /* The precise shape of the shipped failure: a dependency the registry cannot resolve.
       Listing every offender rather than a single name keeps the guard useful when a new
       workspace package is added. */
    const workspaceDependencies = Object.entries(packedManifest.dependencies ?? {})
      .filter(([, range]) => range.startsWith('workspace:'))
      .map(([name]) => name);
    expect(workspaceDependencies, 'published manifest must not depend on workspace-only packages').toEqual([]);

    const installResult = await runProcess(
      'pnpm',
      ['add', '--prefer-offline', '--ignore-scripts', tarballPath],
      consumerDir,
      { ...process.env, PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '1' }
    );
    expect(installResult.exitCode, installResult.stderr || installResult.stdout).toBe(0);

    const installedBin = join(consumerDir, 'node_modules', '.bin', 'hardening');
    await chmod(installedBin, 0o755);

    const versionResult = await runProcess(installedBin, ['--version'], consumerDir);
    expect(versionResult.exitCode, versionResult.stderr).toBe(0);
    expect(versionResult.stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/u);

    /* --help alone would not load much. `verify` pulls the artifact-integrity module in,
       so a broken module graph surfaces here rather than at a user's first real run. */
    const verifyResult = await runProcess(installedBin, ['verify'], consumerDir);
    expect(verifyResult.stderr).not.toMatch(/ERR_MODULE_NOT_FOUND/u);
    expect(verifyResult.stderr).toContain('Missing required argument');

    const helpResult = await runProcess(installedBin, ['--help'], consumerDir);
    expect(helpResult.exitCode, helpResult.stderr).toBe(0);
    expect(helpResult.stdout).toContain('hardening run');
    expect(helpResult.stderr).not.toMatch(/ERR_MODULE_NOT_FOUND/u);
  }, 240_000);
});
