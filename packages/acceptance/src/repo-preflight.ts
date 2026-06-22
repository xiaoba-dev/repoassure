import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

import type { UserAcceptanceCheck } from './user-acceptance.js';

export interface PackageJsonManifestCheckOptions {
  formatEvidence?: (evidence: string) => string;
}

export interface PyprojectTomlManifestCheckOptions {
  formatEvidence?: (evidence: string) => string;
}

export function buildPlaceholderRepoRootCheck(repoRoot: string): UserAcceptanceCheck | undefined {
  const placeholder = findRepoPathPlaceholder(repoRoot);

  if (!placeholder) {
    return undefined;
  }

  return {
    name: 'repo root 是有效目录',
    required: true,
    status: 'failed',
    evidence: `replace ${placeholder} with the real Web App repo path`
  };
}

export function findRepoPathPlaceholder(repoRoot: string): string | undefined {
  const segments = repoRoot.split(/[\\/]+/);

  return segments.find((segment) => /^<[^<>]+>$/.test(segment));
}

export async function buildRepoRootDirectoryCheck(repoRoot: string): Promise<UserAcceptanceCheck> {
  const placeholderCheck = buildPlaceholderRepoRootCheck(repoRoot);
  if (placeholderCheck) {
    return placeholderCheck;
  }

  try {
    const repoRootStat = await stat(repoRoot);

    if (repoRootStat.isDirectory()) {
      return {
        name: 'repo root 是有效目录',
        required: true,
        status: 'passed',
        evidence: repoRoot
      };
    }

    return {
      name: 'repo root 是有效目录',
      required: true,
      status: 'failed',
      evidence: `not a directory: ${repoRoot}`
    };
  } catch {
    return {
      name: 'repo root 是有效目录',
      required: true,
      status: 'failed',
      evidence: `missing repo root: ${repoRoot}`
    };
  }
}

export async function buildPackageJsonManifestCheck(
  repoRoot: string,
  options: PackageJsonManifestCheckOptions = {}
): Promise<UserAcceptanceCheck> {
  const packageJsonPath = join(repoRoot, 'package.json');
  const formatEvidence = options.formatEvidence ?? ((evidence: string) => evidence);

  try {
    const packageJsonStat = await stat(packageJsonPath);

    if (packageJsonStat.isFile()) {
      const packageJsonCheck = await validatePackageJsonManifest(packageJsonPath, formatEvidence);
      if (packageJsonCheck) {
        return packageJsonCheck;
      }

      return {
        name: 'package.json 是有效文件',
        required: true,
        status: 'passed',
        evidence: packageJsonPath
      };
    }

    return {
      name: 'package.json 是有效文件',
      required: true,
      status: 'failed',
      evidence: formatEvidence(`not a file: ${packageJsonPath}`)
    };
  } catch {
    return {
      name: 'package.json 是有效文件',
      required: true,
      status: 'failed',
      evidence: formatEvidence(`missing package.json: ${packageJsonPath}`)
    };
  }
}

export async function buildPyprojectTomlManifestCheck(
  repoRoot: string,
  options: PyprojectTomlManifestCheckOptions = {}
): Promise<UserAcceptanceCheck> {
  const pyprojectPath = join(repoRoot, 'pyproject.toml');
  const formatEvidence = options.formatEvidence ?? ((evidence: string) => evidence);

  try {
    const pyprojectStat = await stat(pyprojectPath);

    if (!pyprojectStat.isFile()) {
      return {
        name: 'pyproject.toml 是有效文件',
        required: true,
        status: 'failed',
        evidence: formatEvidence(`not a file: ${pyprojectPath}`)
      };
    }

    const content = await readFile(pyprojectPath, 'utf8');
    if (content.trim().length === 0) {
      return {
        name: 'pyproject.toml 是有效文件',
        required: true,
        status: 'failed',
        evidence: formatEvidence(`invalid pyproject.toml: ${pyprojectPath}; empty manifest`)
      };
    }

    return {
      name: 'pyproject.toml 是有效文件',
      required: true,
      status: 'passed',
      evidence: pyprojectPath
    };
  } catch {
    return {
      name: 'pyproject.toml 是有效文件',
      required: true,
      status: 'failed',
      evidence: formatEvidence(`missing pyproject.toml: ${pyprojectPath}`)
    };
  }
}

async function validatePackageJsonManifest(
  packageJsonPath: string,
  formatEvidence: (evidence: string) => string
): Promise<UserAcceptanceCheck | undefined> {
  try {
    const manifest = JSON.parse(await readFile(packageJsonPath, 'utf8'));
    if (!isPackageJsonManifest(manifest)) {
      return {
        name: 'package.json 是有效文件',
        required: true,
        status: 'failed',
        evidence: formatEvidence(`invalid package.json manifest: ${packageJsonPath}; expected a JSON object`)
      };
    }

    return undefined;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    return {
      name: 'package.json 是有效文件',
      required: true,
      status: 'failed',
      evidence: formatEvidence(`invalid package.json: ${packageJsonPath}; ${message}`)
    };
  }
}

function isPackageJsonManifest(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
