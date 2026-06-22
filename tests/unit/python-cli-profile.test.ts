import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  buildPythonCliProfile,
  writePythonCliProfileArtifact
} from '../../packages/acceptance/src/python-cli-profile.js';

describe('python CLI profile', () => {
  it('parses pyproject metadata, dependencies, optional dependencies, and console scripts', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-python-cli-profile-'));

    try {
      await writeFile(join(repoRoot, 'pyproject.toml'), [
        '[project]',
        'name = "agent-reach"',
        'requires-python = ">=3.10"',
        'dependencies = [',
        '  "requests>=2.28",',
        '  "yt-dlp>=2024.0"',
        ']',
        '',
        '[project.optional-dependencies]',
        'dev = ["pytest>=8.0", "ruff>=0.8", "mypy>=1.12"]',
        '',
        '[project.scripts]',
        'agent-reach = "agent_reach.cli:main"'
      ].join('\n'));

      await expect(buildPythonCliProfile(repoRoot)).resolves.toEqual({
        repoRoot,
        pyprojectPath: join(repoRoot, 'pyproject.toml'),
        projectName: 'agent-reach',
        requiresPython: '>=3.10',
        dependencies: ['requests>=2.28', 'yt-dlp>=2024.0'],
        optionalDependencies: {
          dev: ['pytest>=8.0', 'ruff>=0.8', 'mypy>=1.12']
        },
        consoleScripts: {
          'agent-reach': 'agent_reach.cli:main'
        },
        blockers: [],
        confidence: 'high'
      });
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

  it('records blockers when pyproject.toml is missing required project metadata', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-python-cli-profile-blocker-'));

    try {
      await writeFile(join(repoRoot, 'pyproject.toml'), [
        '[tool.ruff]',
        'line-length = 100'
      ].join('\n'));

      const profile = await buildPythonCliProfile(repoRoot);

      expect(profile.projectName).toBeNull();
      expect(profile.consoleScripts).toEqual({});
      expect(profile.confidence).toBe('low');
      expect(profile.blockers).toContain('Missing [project].name in pyproject.toml');
      expect(profile.blockers).toContain('No [project.scripts] console entrypoints detected');
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

  it('writes a python-cli-profile artifact under the legacy run directory', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-python-cli-profile-write-'));

    try {
      await writeFile(join(repoRoot, 'pyproject.toml'), [
        '[project]',
        'name = "python-cli-fixture"',
        '',
        '[project.scripts]',
        'python-cli-fixture = "python_cli_fixture:main"'
      ].join('\n'));

      const profile = await buildPythonCliProfile(repoRoot);
      const artifactPath = await writePythonCliProfileArtifact(repoRoot, profile);
      const artifact = JSON.parse(await readFile(artifactPath, 'utf8')) as unknown;

      expect(artifactPath).toBe(join(repoRoot, '.hardening', 'run', 'python-cli-profile.json'));
      expect(artifact).toEqual(expect.objectContaining({
        projectName: 'python-cli-fixture',
        consoleScripts: {
          'python-cli-fixture': 'python_cli_fixture:main'
        }
      }));
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });
});
