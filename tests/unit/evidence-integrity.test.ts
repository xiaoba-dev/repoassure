import { createHash } from 'node:crypto';
import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildArtifactIntegrity,
  verifyArtifactIntegrity
} from '../../src/domain/integrity/artifact-integrity.js';

async function createRun(files: Record<string, string>): Promise<{
  runDir: string;
  manifestPath: string;
  paths: Record<string, string>;
}> {
  const runDir = await mkdtemp(join(tmpdir(), 'repoassure-integrity-'));
  await mkdir(runDir, { recursive: true });

  const paths: Record<string, string> = {};
  for (const [key, contents] of Object.entries(files)) {
    const filePath = join(runDir, `${key}.txt`);
    await writeFile(filePath, contents, 'utf8');
    paths[key] = filePath;
  }

  const manifestPath = join(runDir, 'manifest.json');
  const integrity = await buildArtifactIntegrity(paths);
  await writeFile(
    manifestPath,
    `${JSON.stringify({ schemaVersion: 1, runId: 'run-test', files: paths, integrity }, null, 2)}\n`,
    'utf8'
  );

  return { runDir, manifestPath, paths };
}

function fixturePath(paths: Record<string, string>, key: string): string {
  const value = paths[key];
  if (!value) {
    throw new Error(`Test fixture is missing a path for "${key}"`);
  }
  return value;
}

describe('artifact integrity', () => {
  it('records a sha256 and byte count for every indexed artifact', async () => {
    const { manifestPath } = await createRun({
      report: '# hardening report\n',
      findings: '{"findings":[]}\n'
    });

    const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as {
      integrity: {
        algorithm: string;
        files: Record<string, { sha256: string; bytes: number }>;
      };
    };

    expect(manifest.integrity.algorithm).toBe('sha256');
    expect(Object.keys(manifest.integrity.files).sort()).toEqual(['findings', 'report']);

    const report = manifest.integrity.files.report;
    expect(report?.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(report?.bytes).toBe(Buffer.byteLength('# hardening report\n'));
    // A full digest, not the truncated slice the repo previously used for slugs and ids.
    expect(report?.sha256).toBe(
      createHash('sha256').update('# hardening report\n').digest('hex')
    );
  });

  it('reports every artifact as matching when nothing has changed', async () => {
    const { manifestPath } = await createRun({
      report: '# hardening report\n',
      findings: '{"findings":[]}\n'
    });

    const result = await verifyArtifactIntegrity(manifestPath);

    expect(result.ok).toBe(true);
    expect(result.matched).toBe(2);
    expect(result.mismatched).toBe(0);
    expect(result.missing).toBe(0);
    expect(result.entries.every((entry) => entry.status === 'match')).toBe(true);
  });

  it('detects a modified artifact', async () => {
    const { manifestPath, paths } = await createRun({
      report: '# hardening report\n',
      findings: '{"findings":[]}\n'
    });

    // A reviewer receiving this bundle must be able to tell that the score was edited
    // after the run produced it. That is the entire point of the claim.
    await writeFile(fixturePath(paths, 'report'), '# hardening report\nreadiness: 100\n', 'utf8');

    const result = await verifyArtifactIntegrity(manifestPath);

    expect(result.ok).toBe(false);
    expect(result.mismatched).toBe(1);
    expect(result.matched).toBe(1);

    const report = result.entries.find((entry) => entry.key === 'report');
    expect(report?.status).toBe('mismatch');
    expect(report?.actualSha256).toBeDefined();
    expect(report?.actualSha256).not.toBe(report?.expectedSha256);
  });

  it('detects a removed artifact', async () => {
    const { manifestPath, paths } = await createRun({ report: '# hardening report\n' });

    await rm(fixturePath(paths, 'report'));

    const result = await verifyArtifactIntegrity(manifestPath);

    expect(result.ok).toBe(false);
    expect(result.missing).toBe(1);
    expect(result.entries[0]?.status).toBe('missing');
  });

  it('verifies a bundle that has been moved to another location', async () => {
    const { manifestPath, runDir } = await createRun({
      report: '# hardening report\n',
      findings: '{"findings":[]}\n'
    });

    // The recorded `files` paths are absolute and belong to the machine that produced
    // the run. Handing the bundle to a reviewer is the whole point, so verification
    // must resolve relative to the manifest instead.
    const movedDir = join(await mkdtemp(join(tmpdir(), 'repoassure-moved-')), 'bundle');
    await cp(runDir, movedDir, { recursive: true });

    const result = await verifyArtifactIntegrity(join(movedDir, 'manifest.json'));

    expect(result.ok).toBe(true);
    expect(result.matched).toBe(2);
    expect(result.entries.every((entry) => entry.path.startsWith(movedDir))).toBe(true);
    expect(manifestPath).not.toContain(movedDir);
  });

  it('skips artifacts that did not exist when the run finished', async () => {
    const runDir = await mkdtemp(join(tmpdir(), 'repoassure-integrity-'));
    const present = join(runDir, 'report.md');
    await writeFile(present, '# hardening report\n', 'utf8');

    const integrity = await buildArtifactIntegrity({
      report: present,
      // Optional artifacts are not always produced; indexing a hash for a file that was
      // never written would make every verification fail.
      trace: join(runDir, 'never-written.zip')
    });

    expect(Object.keys(integrity.files)).toEqual(['report']);
  });

  it('fails verification when the manifest carries no integrity block', async () => {
    const runDir = await mkdtemp(join(tmpdir(), 'repoassure-integrity-'));
    const manifestPath = join(runDir, 'manifest.json');
    await writeFile(
      manifestPath,
      `${JSON.stringify({ schemaVersion: 1, runId: 'run-legacy', files: {} }, null, 2)}\n`,
      'utf8'
    );

    // Bundles produced before hashing existed cannot be verified. Reporting them as
    // passing would be worse than reporting nothing.
    await expect(verifyArtifactIntegrity(manifestPath)).rejects.toThrow(/integrity/i);
  });
});
