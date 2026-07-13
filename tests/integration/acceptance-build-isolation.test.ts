import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

import { ensureAcceptanceBuild } from '../../scripts/lib/acceptance-build-coordinator.js';

const execFileAsync = promisify(execFile);
const workerPath = resolve('tests/fixtures/acceptance-build-worker.ts');

describe('acceptance build runtime isolation', () => {
  it('coalesces concurrent processes for the same source fingerprint', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-acceptance-build-'));

    try {
      await Promise.all(Array.from({ length: 8 }, () => runWorker(root, 'source-v1')));

      expect(await buildCount(root)).toBe(1);
      expect(await readFile(join(root, 'dist', 'index.js'), 'utf8')).toContain('source-v1');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }, 15_000);

  it('rebuilds when the source fingerprint changes', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-acceptance-rebuild-'));

    try {
      await runWorker(root, 'source-v1');
      await runWorker(root, 'source-v2');

      expect(await buildCount(root)).toBe(2);
      expect(await readFile(join(root, 'dist', 'index.js'), 'utf8')).toContain('source-v2');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('releases the lock and leaves no reusable state after a failed build', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-acceptance-recovery-'));

    try {
      await expect(runWorker(root, 'source-v1', 'fail')).rejects.toMatchObject({ code: 1 });
      await runWorker(root, 'source-v1');

      expect(await buildCount(root)).toBe(2);
      expect(await readFile(join(root, 'dist', 'index.js'), 'utf8')).toContain('source-v1');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('does not reuse partial output from a failed rebuild after an earlier success', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-acceptance-partial-'));

    try {
      await runWorker(root, 'source-v1');
      await rm(join(root, 'dist', 'index.js'));
      await expect(runWorker(root, 'source-v1', 'fail-partial')).rejects.toMatchObject({ code: 1 });
      await runWorker(root, 'source-v1');

      expect(await buildCount(root)).toBe(3);
      expect(await readFile(join(root, 'dist', 'index.js'), 'utf8')).toContain('source-v1');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('recovers an orphaned lock after the owning process exits', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-acceptance-orphan-'));

    try {
      await expect(runWorker(root, 'source-v1', 'crash')).rejects.toMatchObject({ code: 23 });
      await runWorker(root, 'source-v1');

      expect(await buildCount(root)).toBe(2);
      expect(await readFile(join(root, 'dist', 'index.js'), 'utf8')).toContain('source-v1');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }, 10_000);

  it('fails closed instead of reclaiming an incomplete lock publication by age', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-acceptance-incomplete-lock-'));
    const cacheDir = join(root, 'cache');
    let built = false;

    try {
      await mkdir(cacheDir, { recursive: true });
      await writeFile(join(cacheDir, 'acceptance-build.lock'), '');

      await expect(ensureAcceptanceBuild({
        cacheDir,
        fingerprint: 'source-v1',
        requiredOutputs: [join(root, 'dist', 'index.js')],
        lockTimeoutMs: 50,
        pollIntervalMs: 5,
        build: async () => {
          built = true;
        }
      })).rejects.toThrow('Timed out waiting for acceptance build lock');

      expect(built).toBe(false);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

async function runWorker(root: string, fingerprint: string, mode = 'success'): Promise<void> {
  await execFileAsync(process.execPath, ['--import', 'tsx', workerPath, root, fingerprint, mode], {
    cwd: resolve('.'),
    timeout: 10_000
  });
}

async function buildCount(root: string): Promise<number> {
  const text = await readFile(join(root, 'build-count.log'), 'utf8');
  return text.trim().split('\n').filter(Boolean).length;
}
