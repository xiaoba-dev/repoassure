import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);

describe('public release readiness checker', () => {
  it('passes the private pre-release boundary while reporting public release is not ready', async () => {
    const { runPublicReleaseReadinessCheck } = await importReadinessModule();
    const workspace = await buildWorkspace();
    const inputPath = join(workspace, 'tracked.txt');
    await writeFile(inputPath, 'package.json\n.gitignore\ndocs/product/strategy/public-release-checklist-v0.1.md\n', 'utf8');

    const result = await runPublicReleaseReadinessCheck({ cwd: workspace, inputPath });

    expect(result.ok).toBe(true);
    expect(result.releaseReady).toBe(false);
    expect(result.summary).toContain('automated public release prerequisites');
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'private-package-boundary', status: 'passed' }),
      expect.objectContaining({ id: 'repository-license', status: 'not_ready' }),
      expect.objectContaining({ id: 'tracked-file-hygiene', status: 'passed' })
    ]));
  });

  it('fails when tracked files contain generated artifacts or secret-like paths', async () => {
    const { runPublicReleaseReadinessCheck } = await importReadinessModule();
    const workspace = await buildWorkspace();
    const inputPath = join(workspace, 'tracked.txt');
    await writeFile(inputPath, 'package.json\n.env.local\nartifacts/benchmark-runs/run-1/manifest.json\n', 'utf8');

    const result = await runPublicReleaseReadinessCheck({ cwd: workspace, inputPath });

    expect(result.ok).toBe(false);
    expect(result.releaseReady).toBe(false);
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'tracked-file-hygiene', status: 'failed' })
    ]));
  });

  it('prints a CLI summary for CI usage', async () => {
    const workspace = await buildWorkspace();
    const inputPath = join(workspace, 'tracked.txt');
    await writeFile(inputPath, 'package.json\n.gitignore\n', 'utf8');

    const { stdout } = await execFileAsync(process.execPath, [
      'scripts/check-public-release-readiness.mjs',
      '--cwd',
      workspace,
      '--input',
      inputPath
    ], {
      cwd: process.cwd()
    });

    expect(stdout).toContain('Public release readiness check passed for automated public release prerequisites.');
    expect(stdout).toContain('public release ready: no');
    expect(stdout).toContain('branch protection or equivalent repository ruleset remains required before making anything public');
  });

  it('checks public release policy materials before reporting automated prerequisites ready', async () => {
    const { runPublicReleaseReadinessCheck } = await importReadinessModule();
    const workspace = await buildWorkspace({
      license: true,
      contributing: true,
      security: true,
      dependencyAudit: true,
      releaseNotes: true
    });
    const inputPath = join(workspace, 'tracked.txt');
    await writeFile(
      inputPath,
      [
        'package.json',
        '.gitignore',
        'LICENSE',
        'CONTRIBUTING.md',
        'SECURITY.md',
        'docs/product/strategy/dependency-license-audit-v0.1.md',
        'docs/product/strategy/public-release-checklist-v0.1.md',
        'docs/product/strategy/public-release-notes-v0.1.md'
      ].join('\n'),
      'utf8'
    );

    const result = await runPublicReleaseReadinessCheck({ cwd: workspace, inputPath });

    expect(result.ok).toBe(true);
    expect(result.releaseReady).toBe(false);
    expect(result.summary).toContain('automated public release prerequisites');
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'repository-license', status: 'passed' }),
      expect.objectContaining({ id: 'contribution-policy', status: 'passed' }),
      expect.objectContaining({ id: 'security-policy', status: 'passed' }),
      expect.objectContaining({ id: 'dependency-license-audit', status: 'passed' }),
      expect.objectContaining({ id: 'public-release-notes-draft', status: 'passed' }),
      expect.objectContaining({
        id: 'manual-publication-authorization',
        status: 'not_ready',
        summary: 'branch protection or equivalent repository ruleset remains required before making anything public'
      })
    ]));
  });

  it('reports public release readiness when the manual authorization record exists', async () => {
    const { runPublicReleaseReadinessCheck } = await importReadinessModule();
    const workspace = await buildWorkspace({
      license: true,
      contributing: true,
      security: true,
      dependencyAudit: true,
      releaseNotes: true,
      authorization: true
    });
    const inputPath = join(workspace, 'tracked.txt');
    await writeFile(
      inputPath,
      [
        'package.json',
        '.gitignore',
        'LICENSE',
        'CONTRIBUTING.md',
        'SECURITY.md',
        'docs/product/strategy/dependency-license-audit-v0.1.md',
        'docs/product/strategy/public-release-authorization-v0.1.md',
        'docs/product/strategy/public-release-checklist-v0.1.md',
        'docs/product/strategy/public-release-notes-v0.1.md'
      ].join('\n'),
      'utf8'
    );

    const result = await runPublicReleaseReadinessCheck({ cwd: workspace, inputPath });

    expect(result.ok).toBe(true);
    expect(result.releaseReady).toBe(true);
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'manual-publication-authorization',
        status: 'passed',
        summary: 'manual publication authorization record exists'
      })
    ]));
  });
});

async function buildWorkspace(options: {
  license?: boolean;
  contributing?: boolean;
  security?: boolean;
  dependencyAudit?: boolean;
  releaseNotes?: boolean;
  authorization?: boolean;
} = {}): Promise<string> {
  const workspace = await mkdtemp(join(tmpdir(), 'public-release-readiness-'));
  await mkdir(join(workspace, 'docs', 'product', 'strategy'), { recursive: true });
  await writeFile(join(workspace, 'package.json'), `${JSON.stringify({
    name: 'repoassure-fixture',
    private: true,
    license: 'Apache-2.0'
  }, null, 2)}\n`);
  await writeFile(join(workspace, '.gitignore'), '.env*\nartifacts/\ndist/\n');
  await writeFile(
    join(workspace, 'docs', 'product', 'strategy', 'public-release-checklist-v0.1.md'),
    '# Public Release Checklist\n'
  );
  if (options.license) {
    await writeFile(join(workspace, 'LICENSE'), 'Apache License\nVersion 2.0, January 2004\n', 'utf8');
  }
  if (options.contributing) {
    await writeFile(
      join(workspace, 'CONTRIBUTING.md'),
      '# Contributing\n\nDeveloper Certificate of Origin\n\nNo CLA is required.\n',
      'utf8'
    );
  }
  if (options.security) {
    await writeFile(
      join(workspace, 'SECURITY.md'),
      '# Security Policy\n\n## Report a Vulnerability\n\nReport vulnerabilities through a private channel.\n',
      'utf8'
    );
  }
  if (options.dependencyAudit) {
    await writeFile(
      join(workspace, 'docs', 'product', 'strategy', 'dependency-license-audit-v0.1.md'),
      '# Dependency License Audit\n\nNo known incompatible dependency licenses.\n\nApache-2.0\n',
      'utf8'
    );
  }
  if (options.releaseNotes) {
    await writeFile(
      join(workspace, 'docs', 'product', 'strategy', 'public-release-notes-v0.1.md'),
      '# Public Release Notes v0.1\n\nlocal-first behavior and non-goals.\n',
      'utf8'
    );
  }
  if (options.authorization) {
    await writeFile(
      join(workspace, 'docs', 'product', 'strategy', 'public-release-authorization-v0.1.md'),
      '# Public Release Authorization v0.1\n\nStatus: ready_for_public_source_release_execution\n',
      'utf8'
    );
  }
  return workspace;
}

async function importReadinessModule() {
  return import(pathToFileURL(join(process.cwd(), 'scripts/check-public-release-readiness.mjs')).href);
}
