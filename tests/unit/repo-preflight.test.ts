import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  buildPackageJsonManifestCheck as buildLegacyPackageJsonManifestCheck,
  buildPlaceholderRepoRootCheck as buildLegacyPlaceholderRepoRootCheck,
  buildRepoRootDirectoryCheck as buildLegacyRepoRootDirectoryCheck,
  findRepoPathPlaceholder as findLegacyRepoPathPlaceholder
} from '../../src/internal/acceptance/repo-preflight.js';
import {
  buildPackageJsonManifestCheck,
  buildPlaceholderRepoRootCheck,
  buildPyprojectTomlManifestCheck,
  buildRepoRootDirectoryCheck,
  findRepoPathPlaceholder
} from '../../packages/acceptance/src/repo-preflight.js';

describe('repo preflight', () => {
  it('keeps package-owned repo preflight output compatible with the legacy implementation', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-repo-preflight-compat-'));

    try {
      await writeFile(join(repoRoot, 'package.json'), '[]');

      expect(findRepoPathPlaceholder('/tmp/<real-web-app-repo>')).toBe(
        findLegacyRepoPathPlaceholder('/tmp/<real-web-app-repo>')
      );
      expect(buildPlaceholderRepoRootCheck('/tmp/<real-web-app-repo>')).toEqual(
        buildLegacyPlaceholderRepoRootCheck('/tmp/<real-web-app-repo>')
      );
      await expect(buildRepoRootDirectoryCheck(repoRoot)).resolves.toEqual(
        await buildLegacyRepoRootDirectoryCheck(repoRoot)
      );
      await expect(buildPackageJsonManifestCheck(repoRoot)).resolves.toEqual(
        await buildLegacyPackageJsonManifestCheck(repoRoot)
      );
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

  it('detects placeholder repo path segments before filesystem access', () => {
    expect(findRepoPathPlaceholder('/tmp/<real-web-app-repo>')).toBe('<real-web-app-repo>');
    expect(buildPlaceholderRepoRootCheck('/tmp/<real-web-app-repo>')).toEqual({
      name: 'repo root 是有效目录',
      required: true,
      status: 'failed',
      evidence: 'replace <real-web-app-repo> with the real Web App repo path'
    });
  });

  it('fails repo root directory preflight before filesystem access when path contains placeholders', async () => {
    await expect(buildRepoRootDirectoryCheck('/tmp/<real-web-app-repo>')).resolves.toEqual({
      name: 'repo root 是有效目录',
      required: true,
      status: 'failed',
      evidence: 'replace <real-web-app-repo> with the real Web App repo path'
    });
  });

  it('passes repo root directory preflight when the path is a directory', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-repo-root-valid-'));

    try {
      await expect(buildRepoRootDirectoryCheck(repoRoot)).resolves.toEqual({
        name: 'repo root 是有效目录',
        required: true,
        status: 'passed',
        evidence: repoRoot
      });
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

  it('fails repo root directory preflight when the path is missing', async () => {
    const tempRoot = await mkdtemp(join(tmpdir(), 'hardening-repo-root-missing-'));
    const repoRoot = join(tempRoot, 'missing-app');

    try {
      await expect(buildRepoRootDirectoryCheck(repoRoot)).resolves.toEqual({
        name: 'repo root 是有效目录',
        required: true,
        status: 'failed',
        evidence: `missing repo root: ${repoRoot}`
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it('fails repo root directory preflight when the path is not a directory', async () => {
    const tempRoot = await mkdtemp(join(tmpdir(), 'hardening-repo-root-file-'));
    const repoRoot = join(tempRoot, 'package.json');

    try {
      await writeFile(repoRoot, '{}');

      await expect(buildRepoRootDirectoryCheck(repoRoot)).resolves.toEqual({
        name: 'repo root 是有效目录',
        required: true,
        status: 'failed',
        evidence: `not a directory: ${repoRoot}`
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it('passes package.json when the manifest is a JSON object', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-repo-preflight-valid-'));

    try {
      await writeFile(join(repoRoot, 'package.json'), '{"scripts":{}}');

      await expect(buildPackageJsonManifestCheck(repoRoot)).resolves.toEqual({
        name: 'package.json 是有效文件',
        required: true,
        status: 'passed',
        evidence: join(repoRoot, 'package.json')
      });
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

  it('fails package.json preflight when the file is missing', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-repo-preflight-missing-'));

    try {
      await expect(buildPackageJsonManifestCheck(repoRoot)).resolves.toEqual({
        name: 'package.json 是有效文件',
        required: true,
        status: 'failed',
        evidence: `missing package.json: ${join(repoRoot, 'package.json')}`
      });
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

  it('fails package.json preflight when JSON syntax is invalid', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-repo-preflight-malformed-'));

    try {
      await writeFile(join(repoRoot, 'package.json'), '{"scripts":');

      const check = await buildPackageJsonManifestCheck(repoRoot);

      expect(check).toEqual(expect.objectContaining({
        name: 'package.json 是有效文件',
        required: true,
        status: 'failed'
      }));
      expect(check.evidence).toContain('invalid package.json:');
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

  it('fails package.json preflight when parsed JSON is not an object manifest', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-repo-preflight-non-object-'));

    try {
      await writeFile(join(repoRoot, 'package.json'), '[]');

      const check = await buildPackageJsonManifestCheck(repoRoot);

      expect(check).toEqual(expect.objectContaining({
        name: 'package.json 是有效文件',
        required: true,
        status: 'failed'
      }));
      expect(check.evidence).toContain('invalid package.json manifest:');
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

  it('applies a caller-provided evidence formatter to package.json failures', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-repo-preflight-formatted-'));

    try {
      const check = await buildPackageJsonManifestCheck(repoRoot, {
        formatEvidence: (evidence) => `formatted: ${evidence}`
      });

      expect(check.evidence).toContain('formatted: missing package.json:');
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

  it('passes pyproject.toml preflight when the Python project manifest exists', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-pyproject-valid-'));

    try {
      await writeFile(join(repoRoot, 'pyproject.toml'), [
        '[project]',
        'name = "python-cli-fixture"'
      ].join('\n'));

      await expect(buildPyprojectTomlManifestCheck(repoRoot)).resolves.toEqual({
        name: 'pyproject.toml 是有效文件',
        required: true,
        status: 'passed',
        evidence: join(repoRoot, 'pyproject.toml')
      });
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

  it('fails pyproject.toml preflight when the Python project manifest is missing', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-pyproject-missing-'));

    try {
      await expect(buildPyprojectTomlManifestCheck(repoRoot)).resolves.toEqual({
        name: 'pyproject.toml 是有效文件',
        required: true,
        status: 'failed',
        evidence: `missing pyproject.toml: ${join(repoRoot, 'pyproject.toml')}`
      });
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });
});
