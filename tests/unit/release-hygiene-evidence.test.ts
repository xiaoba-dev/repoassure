import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);

describe('release readiness hygiene evidence', () => {
  it('builds a local evidence package without turning readiness into launch authorization', async () => {
    const { generateReleaseHygieneEvidence } = await importReleaseHygieneModule();
    const workspace = await buildWorkspace({ authorization: true });
    const inputPath = join(workspace, 'tracked.txt');
    const outputDir = join(workspace, 'artifacts', 'release-hygiene');
    await writeFile(inputPath, [
      'package.json',
      '.gitignore',
      'LICENSE',
      'CONTRIBUTING.md',
      'SECURITY.md',
      'docs/product/strategy/dependency-license-audit-v0.1.md',
      'docs/product/strategy/public-release-authorization-v0.1.md',
      'docs/product/strategy/public-release-checklist-v0.1.md',
      'docs/product/strategy/public-release-notes-v0.1.md'
    ].join('\n'));

    const result = await generateReleaseHygieneEvidence({
      cwd: workspace,
      inputPath,
      outputDir,
      generatedAt: '2026-07-03T09:30:00.000Z'
    });

    expect(result.packagePath).toBe(join(outputDir, 'release-readiness-hygiene.json'));
    expect(result.markdownPath).toBe(join(outputDir, 'release-readiness-hygiene.md'));
    expect(result.evidence.schemaVersion).toBe('repoassure.release-readiness-hygiene.v1');
    expect(result.evidence.status).toBe('ready_evidence_only');
    expect(result.evidence.launchAuthorization).toBe('not_authorized');
    expect(result.evidence.localOnly).toBe(true);
    expect(result.evidence.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'repo-hygiene', status: 'passed' }),
      expect.objectContaining({ id: 'release-readiness', status: 'passed' }),
      expect.objectContaining({ id: 'package-publication-boundary', status: 'passed' }),
      expect.objectContaining({ id: 'sensitive-material-scan', status: 'passed' }),
      expect.objectContaining({ id: 'launch-boundary', status: 'passed' }),
      expect.objectContaining({ id: 'goal-audit-command', status: 'manual_review' })
    ]));
    expect(result.evidence.rerunCommands).toEqual([
      'pnpm release:check',
      'pnpm repo:hygiene',
      'pnpm goal:audit',
      'pnpm release:hygiene'
    ]);
    expect(result.evidence.nonAuthorizationBoundary).toContain('does not authorize npm publication');
    await expect(readFile(result.packagePath, 'utf8')).resolves.toContain('repoassure.release-readiness-hygiene.v1');
    await expect(readFile(result.markdownPath, 'utf8')).resolves.toContain('Release Readiness Hygiene Evidence');
  });

  it('redacts sensitive material findings in the generated evidence package', async () => {
    const { generateReleaseHygieneEvidence } = await importReleaseHygieneModule();
    const workspace = await buildWorkspace();
    const inputPath = join(workspace, 'tracked.txt');
    const secretDoc = join(workspace, 'docs', 'product', 'strategy', 'private-feedback.md');
    await writeFile(secretDoc, 'Reviewer maintainer@private.test pasted OPENAI_API_KEY=sk-secret Cookie: sid=session-secret\n');
    await writeFile(inputPath, [
      'package.json',
      '.gitignore',
      'docs/product/strategy/private-feedback.md'
    ].join('\n'));

    const result = await generateReleaseHygieneEvidence({
      cwd: workspace,
      inputPath,
      outputDir: join(workspace, 'artifacts', 'release-hygiene'),
      generatedAt: '2026-07-03T09:30:00.000Z'
    });
    const serialized = JSON.stringify(result.evidence);
    const checks = result.evidence.checks as Array<{ id: string; status: string }>;
    const sensitiveCheck = checks.find((check) => check.id === 'sensitive-material-scan');

    expect(sensitiveCheck).toMatchObject({ status: 'failed' });
    expect(serialized).toContain('[REDACTED_EMAIL]');
    expect(serialized).toContain('[REDACTED_SECRET]');
    expect(serialized).not.toContain('maintainer@private.test');
    expect(serialized).not.toContain('sk-secret');
    expect(serialized).not.toContain('session-secret');
  });

  it('does not fail sensitive material scan for already redacted examples', async () => {
    const { generateReleaseHygieneEvidence } = await importReleaseHygieneModule();
    const workspace = await buildWorkspace({ authorization: true });
    const inputPath = join(workspace, 'tracked.txt');
    const docsPath = join(workspace, 'docs', 'logs.md');
    await writeFile(docsPath, 'Examples: Authorization: [REDACTED_SECRET]\nOPENAI_API_KEY=[REDACTED_SECRET]\nreviewer [REDACTED_EMAIL]\n');
    await writeFile(inputPath, [
      'package.json',
      '.gitignore',
      'LICENSE',
      'CONTRIBUTING.md',
      'SECURITY.md',
      'docs/logs.md',
      'docs/product/strategy/dependency-license-audit-v0.1.md',
      'docs/product/strategy/public-release-authorization-v0.1.md',
      'docs/product/strategy/public-release-checklist-v0.1.md',
      'docs/product/strategy/public-release-notes-v0.1.md'
    ].join('\n'));

    const result = await generateReleaseHygieneEvidence({
      cwd: workspace,
      inputPath,
      outputDir: join(workspace, 'artifacts', 'release-hygiene'),
      generatedAt: '2026-07-03T09:30:00.000Z'
    });

    expect(result.evidence.checks).toContainEqual(expect.objectContaining({
      id: 'sensitive-material-scan',
      status: 'passed'
    }));
    expect(result.evidence.status).toBe('ready_evidence_only');
  });

  it('keeps historical logs outside the default release hygiene scan scope', async () => {
    const { generateReleaseHygieneEvidence } = await importReleaseHygieneModule();
    const workspace = await buildWorkspace({ authorization: true });
    const inputPath = join(workspace, 'tracked.txt');
    await mkdir(join(workspace, 'docs', 'logs'), { recursive: true });
    await writeFile(
      join(workspace, 'docs', 'logs', 'dev-log.md'),
      'Historical redaction test before fix: Authorization: Bearer old-token\n'
    );
    await writeFile(inputPath, [
      'package.json',
      '.gitignore',
      'LICENSE',
      'CONTRIBUTING.md',
      'SECURITY.md',
      'docs/logs/dev-log.md',
      'docs/product/strategy/dependency-license-audit-v0.1.md',
      'docs/product/strategy/public-release-authorization-v0.1.md',
      'docs/product/strategy/public-release-checklist-v0.1.md',
      'docs/product/strategy/public-release-notes-v0.1.md'
    ].join('\n'));

    const result = await generateReleaseHygieneEvidence({
      cwd: workspace,
      inputPath,
      outputDir: join(workspace, 'artifacts', 'release-hygiene'),
      generatedAt: '2026-07-03T09:30:00.000Z'
    });

    expect(result.evidence.checks).toContainEqual(expect.objectContaining({
      id: 'sensitive-material-scan',
      status: 'passed'
    }));
    expect(JSON.stringify(result.evidence)).not.toContain('old-token');
  });

  it('prints CLI output paths for maintainer inspection', async () => {
    const workspace = await buildWorkspace({ authorization: true });
    const inputPath = join(workspace, 'tracked.txt');
    const outputDir = join(workspace, 'release-hygiene-output');
    await writeFile(inputPath, 'package.json\n.gitignore\nLICENSE\nCONTRIBUTING.md\nSECURITY.md\ndocs/product/strategy/dependency-license-audit-v0.1.md\ndocs/product/strategy/public-release-authorization-v0.1.md\ndocs/product/strategy/public-release-checklist-v0.1.md\ndocs/product/strategy/public-release-notes-v0.1.md\n');

    const { stdout } = await execFileAsync(process.execPath, [
      'scripts/generate-release-hygiene-evidence.mjs',
      '--cwd',
      workspace,
      '--input',
      inputPath,
      '--output',
      outputDir
    ], {
      cwd: process.cwd()
    });

    expect(stdout).toContain('Release readiness hygiene evidence generated.');
    expect(stdout).toContain(join(outputDir, 'release-readiness-hygiene.json'));
    expect(stdout).toContain(join(outputDir, 'release-readiness-hygiene.md'));
  });
});

async function buildWorkspace(options: { authorization?: boolean } = {}): Promise<string> {
  const workspace = await mkdtemp(join(tmpdir(), 'release-hygiene-evidence-'));
  await mkdir(join(workspace, 'docs', 'product', 'strategy'), { recursive: true });
  await writeFile(join(workspace, 'package.json'), `${JSON.stringify({
    name: 'repoassure-fixture',
    private: true,
    license: 'Apache-2.0'
  }, null, 2)}\n`);
  await writeFile(join(workspace, '.gitignore'), '.env*\nartifacts/\ndist/\n');
  await writeFile(join(workspace, 'LICENSE'), 'Apache License\nVersion 2.0, January 2004\n');
  await writeFile(join(workspace, 'CONTRIBUTING.md'), 'Developer Certificate of Origin\n\nNo CLA is required\n');
  await writeFile(join(workspace, 'SECURITY.md'), 'Report a Vulnerability\n\nUse a private disclosure channel.\n');
  await writeFile(
    join(workspace, 'docs', 'product', 'strategy', 'dependency-license-audit-v0.1.md'),
    'No known incompatible dependency licenses.\nApache-2.0\n'
  );
  await writeFile(
    join(workspace, 'docs', 'product', 'strategy', 'public-release-checklist-v0.1.md'),
    '# Public Release Checklist\n'
  );
  await writeFile(
    join(workspace, 'docs', 'product', 'strategy', 'public-release-notes-v0.1.md'),
    '# Public Release Notes v0.1\nlocal-first\n'
  );
  if (options.authorization) {
    await writeFile(
      join(workspace, 'docs', 'product', 'strategy', 'public-release-authorization-v0.1.md'),
      '# Public Release Authorization v0.1\n'
    );
  }
  return workspace;
}

async function importReleaseHygieneModule() {
  return import(pathToFileURL(join(process.cwd(), 'scripts/generate-release-hygiene-evidence.mjs')).href);
}
