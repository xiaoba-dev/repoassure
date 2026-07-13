import { createHash, randomUUID } from 'node:crypto';
import {
  access,
  link,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  writeFile
} from 'node:fs/promises';
import { join, relative } from 'node:path';

export interface AcceptanceBuildOptions {
  cacheDir: string;
  fingerprint: string;
  requiredOutputs: string[];
  build: () => Promise<void>;
  lockTimeoutMs?: number;
  pollIntervalMs?: number;
}

export type AcceptanceBuildResult = 'built' | 'reused';

const STATE_FILE = 'acceptance-build-state.json';
const LOCK_FILE = 'acceptance-build.lock';

export async function ensureAcceptanceBuild(
  options: AcceptanceBuildOptions
): Promise<AcceptanceBuildResult> {
  const lockTimeoutMs = options.lockTimeoutMs ?? 60_000;
  const pollIntervalMs = options.pollIntervalMs ?? 25;
  const statePath = join(options.cacheDir, STATE_FILE);
  const lockPath = join(options.cacheDir, LOCK_FILE);

  await mkdir(options.cacheDir, { recursive: true });

  if (await isFreshBuild(statePath, options.fingerprint, options.requiredOutputs)) {
    return 'reused';
  }

  const leaseToken = await acquireLock(lockPath, lockTimeoutMs, pollIntervalMs);

  try {
    if (await isFreshBuild(statePath, options.fingerprint, options.requiredOutputs)) {
      return 'reused';
    }

    await rm(statePath, { force: true });
    await options.build();
    await assertOutputs(options.requiredOutputs);
    await writeStateAtomically(statePath, options.fingerprint);
    return 'built';
  } finally {
    await releaseLock(lockPath, leaseToken);
  }
}

export async function calculateAcceptanceBuildFingerprint(repoRoot: string): Promise<string> {
  const sourceRoot = join(repoRoot, 'packages', 'acceptance', 'src');
  const inputPaths = [
    join(repoRoot, 'package.json'),
    join(repoRoot, 'pnpm-lock.yaml'),
    join(repoRoot, 'tsconfig.json'),
    join(repoRoot, 'packages', 'acceptance', 'package.json'),
    join(repoRoot, 'packages', 'acceptance', 'tsconfig.json'),
    join(repoRoot, 'packages', 'acceptance', 'tsconfig.build.json'),
    join(repoRoot, 'scripts', 'build-acceptance.ts'),
    join(repoRoot, 'scripts', 'lib', 'acceptance-build-coordinator.ts'),
    ...(await listFiles(sourceRoot))
  ].sort();
  const hash = createHash('sha256');

  for (const path of inputPaths) {
    hash.update(relative(repoRoot, path));
    hash.update('\0');
    hash.update(await readFile(path));
    hash.update('\0');
  }

  return hash.digest('hex');
}

export async function calculateAcceptanceBuildOutputs(repoRoot: string): Promise<string[]> {
  const sourceRoot = join(repoRoot, 'packages', 'acceptance', 'src');
  const outputRoot = join(repoRoot, 'packages', 'acceptance', 'dist');
  const sourcePaths = (await listFiles(sourceRoot)).filter((path) => path.endsWith('.ts'));

  return sourcePaths.flatMap((sourcePath) => {
    const outputBase = join(outputRoot, relative(sourceRoot, sourcePath).slice(0, -3));
    return [`${outputBase}.js`, `${outputBase}.d.ts`, `${outputBase}.js.map`];
  }).sort();
}

async function acquireLock(
  lockPath: string,
  lockTimeoutMs: number,
  pollIntervalMs: number
): Promise<string> {
  const startedAt = Date.now();
  const leaseToken = randomUUID();
  const candidatePath = `${lockPath}.candidate-${leaseToken}`;
  const lease = `${JSON.stringify({
    token: leaseToken,
    pid: process.pid,
    acquiredAt: new Date().toISOString()
  })}\n`;

  while (true) {
    await writeFile(candidatePath, lease, { flag: 'wx' });
    try {
      await link(candidatePath, lockPath);
      await rm(candidatePath, { force: true });
      return leaseToken;
    } catch (error) {
      await rm(candidatePath, { force: true });
      if (!isAlreadyExistsError(error)) {
        throw error;
      }
    }

    if (await recoverOrphanedLock(lockPath)) {
      continue;
    }

    if (Date.now() - startedAt >= lockTimeoutMs) {
      throw new Error(`Timed out waiting for acceptance build lock after ${lockTimeoutMs}ms`);
    }

    await delay(pollIntervalMs);
  }
}

async function isFreshBuild(
  statePath: string,
  fingerprint: string,
  requiredOutputs: string[]
): Promise<boolean> {
  try {
    const state = JSON.parse(await readFile(statePath, 'utf8')) as { fingerprint?: unknown };
    if (state.fingerprint !== fingerprint) {
      return false;
    }
    await assertOutputs(requiredOutputs);
    return true;
  } catch {
    return false;
  }
}

async function assertOutputs(paths: string[]): Promise<void> {
  await Promise.all(paths.map((path) => access(path)));
}

async function writeStateAtomically(statePath: string, fingerprint: string): Promise<void> {
  const temporaryPath = `${statePath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(
    temporaryPath,
    `${JSON.stringify({ fingerprint, completedAt: new Date().toISOString() })}\n`
  );
  await rename(temporaryPath, statePath);
}

async function recoverOrphanedLock(lockPath: string): Promise<boolean> {
  let recoverable: boolean;

  try {
    const owner = JSON.parse(await readFile(lockPath, 'utf8')) as {
      pid?: unknown;
    };
    recoverable = typeof owner.pid === 'number' && !isProcessAlive(owner.pid);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return true;
    }
    return false;
  }

  if (!recoverable) {
    return false;
  }

  const quarantinePath = `${lockPath}.orphan-${process.pid}-${Date.now()}`;
  try {
    await rename(lockPath, quarantinePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return true;
    }
    return false;
  }

  await rm(quarantinePath, { force: true });
  return true;
}

async function releaseLock(lockPath: string, leaseToken: string): Promise<void> {
  try {
    const owner = JSON.parse(await readFile(lockPath, 'utf8')) as { token?: unknown };
    if (owner.token === leaseToken) {
      await rm(lockPath, { force: true });
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(path)));
    } else if (entry.isFile()) {
      files.push(path);
    }
  }

  return files;
}

function isAlreadyExistsError(error: unknown): boolean {
  return (error as NodeJS.ErrnoException).code === 'EEXIST';
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code !== 'ESRCH';
  }
}

function delay(durationMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}
