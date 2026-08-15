import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';

export const INTEGRITY_ALGORITHM = 'sha256';

export interface ArtifactIntegrityEntry {
  /** Path relative to the manifest, so a bundle stays verifiable after it is moved. */
  path: string;
  sha256: string;
  bytes: number;
}

export interface ArtifactIntegrity {
  algorithm: typeof INTEGRITY_ALGORITHM;
  files: Record<string, ArtifactIntegrityEntry>;
}

export type ArtifactVerificationStatus = 'match' | 'mismatch' | 'missing';

export interface ArtifactVerificationEntry {
  key: string;
  path: string;
  status: ArtifactVerificationStatus;
  expectedSha256: string;
  expectedBytes: number;
  actualSha256?: string;
  actualBytes?: number;
}

export interface ArtifactVerificationResult {
  manifestPath: string;
  algorithm: string;
  entries: ArtifactVerificationEntry[];
  matched: number;
  mismatched: number;
  missing: number;
  ok: boolean;
}

function hash(contents: Buffer): string {
  return createHash(INTEGRITY_ALGORITHM).update(contents).digest('hex');
}

async function readIfPresent(path: string): Promise<Buffer | undefined> {
  try {
    return await readFile(path);
  } catch {
    return undefined;
  }
}

/**
 * Hashes each indexed artifact so a reviewer can confirm the bundle was not edited
 * after the run produced it.
 *
 * Artifacts that were never written are skipped rather than recorded: not every run
 * produces every optional artifact, and indexing a hash for a file that does not exist
 * would make verification fail on a perfectly good bundle.
 */
export async function buildArtifactIntegrity(
  files: Record<string, unknown>,
  options: { baseDir?: string } = {}
): Promise<ArtifactIntegrity> {
  const entries: Record<string, ArtifactIntegrityEntry> = {};

  const sortedFiles = Object.entries(files).sort(([left], [right]) => left.localeCompare(right));

  for (const [key, filePath] of sortedFiles) {
    if (typeof filePath !== 'string' || filePath.length === 0) {
      continue;
    }

    const contents = await readIfPresent(filePath);
    if (!contents) {
      continue;
    }

    const baseDir = options.baseDir ?? dirname(filePath);
    const relativePath = isAbsolute(filePath) ? relative(baseDir, filePath) : filePath;

    entries[key] = {
      path: relativePath,
      sha256: hash(contents),
      bytes: contents.byteLength
    };
  }

  return { algorithm: INTEGRITY_ALGORITHM, files: entries };
}

/**
 * Recomputes every recorded hash and reports per-file match, mismatch, or missing.
 *
 * Paths resolve relative to the manifest, not to the absolute paths recorded at run
 * time, so a bundle handed to a reviewer on another machine still verifies.
 */
export async function verifyArtifactIntegrity(
  manifestPath: string
): Promise<ArtifactVerificationResult> {
  const manifestContents = await readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestContents) as { integrity?: ArtifactIntegrity };
  const integrity = manifest.integrity;

  if (!integrity || typeof integrity !== 'object' || !integrity.files) {
    throw new Error(
      `Manifest has no integrity block, so it cannot be verified: ${manifestPath}. ` +
        'Bundles produced before artifact hashing existed cannot be checked, and ' +
        'reporting them as passing would be worse than reporting nothing.'
    );
  }

  const manifestDir = dirname(manifestPath);
  const entries: ArtifactVerificationEntry[] = [];

  const expectedEntries = Object.entries(integrity.files).sort(([left], [right]) =>
    left.localeCompare(right)
  );

  for (const [key, expected] of expectedEntries) {
    const resolvedPath = resolve(manifestDir, expected.path);
    const contents = await readIfPresent(resolvedPath);

    if (!contents) {
      entries.push({
        key,
        path: resolvedPath,
        status: 'missing',
        expectedSha256: expected.sha256,
        expectedBytes: expected.bytes
      });
      continue;
    }

    const actualSha256 = hash(contents);
    entries.push({
      key,
      path: resolvedPath,
      status: actualSha256 === expected.sha256 ? 'match' : 'mismatch',
      expectedSha256: expected.sha256,
      expectedBytes: expected.bytes,
      actualSha256,
      actualBytes: contents.byteLength
    });
  }

  const matched = entries.filter((entry) => entry.status === 'match').length;
  const mismatched = entries.filter((entry) => entry.status === 'mismatch').length;
  const missing = entries.filter((entry) => entry.status === 'missing').length;

  return {
    manifestPath,
    algorithm: integrity.algorithm ?? INTEGRITY_ALGORITHM,
    entries,
    matched,
    mismatched,
    missing,
    ok: mismatched === 0 && missing === 0
  };
}
