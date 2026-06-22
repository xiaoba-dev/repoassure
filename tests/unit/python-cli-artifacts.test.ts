import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildPythonCliSmokeCommands, detectPythonCliStaticCheckCommands } from '../../packages/acceptance/src/python-cli-checks.js';
import {
  writePythonCliAcceptanceArtifacts
} from '../../packages/acceptance/src/python-cli-artifacts.js';
import type { PythonCliProfile } from '../../packages/acceptance/src/python-cli-profile.js';

describe('python cli artifacts', () => {
  it('writes report, repair plan, task package, manifest, and run-scoped profile artifacts', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-python-cli-artifacts-'));
    const profile: PythonCliProfile = {
      repoRoot,
      pyprojectPath: join(repoRoot, 'pyproject.toml'),
      projectName: 'agent-reach',
      requiresPython: '>=3.11',
      dependencies: ['requests'],
      optionalDependencies: { dev: ['pytest', 'ruff'] },
      consoleScripts: { 'agent-reach': 'agent_reach.cli:main' },
      blockers: [],
      confidence: 'high'
    };

    try {
      const smokeCommands = buildPythonCliSmokeCommands(profile);
      const staticCommands = detectPythonCliStaticCheckCommands(profile);
      const artifacts = await writePythonCliAcceptanceArtifacts({
        repoRoot,
        profile,
        smokeCommands,
        staticCommands,
        commandResults: [
          { command: 'agent-reach', args: ['--help'], exitCode: 0, stdout: 'usage: agent-reach', stderr: '', timedOut: false },
          { command: 'pytest', args: [], exitCode: 0, stdout: '162 passed', stderr: '', timedOut: false },
          { command: 'ruff', args: ['check', '.'], exitCode: 1, stdout: 'Found 46 errors', stderr: '', timedOut: false }
        ],
        generatedAt: '2026-06-21T00:00:00.000Z'
      });

      await expect(readFile(artifacts.reportPath, 'utf8')).resolves.toContain('# Python/CLI Hardening Report');
      await expect(readFile(artifacts.reportPath, 'utf8')).resolves.toContain('`agent-reach --help`');
      await expect(readFile(artifacts.reportPath, 'utf8')).resolves.toContain('| `ruff check .` | failed | 1 |');
      await expect(readFile(artifacts.repairPlanPath, 'utf8')).resolves.toContain('"mode": "cli"');
      await expect(readFile(artifacts.repairPlanPath, 'utf8')).resolves.toContain('"exitCode": 1');
      await expect(readFile(artifacts.repairTaskPackagePath, 'utf8')).resolves.toContain('CLI-oriented task handoff');
      await expect(readFile(artifacts.repairTaskPackageMarkdownPath, 'utf8')).resolves.toContain('ruff check .');
      await expect(readFile(artifacts.repairTaskPackageMarkdownPath, 'utf8')).resolves.toContain('Found 46 errors');
      await expect(readFile(artifacts.manifestPath, 'utf8')).resolves.toContain('"pythonCliProfilePath"');
      await expect(readFile(artifacts.manifestPath, 'utf8')).resolves.toContain('"commandResults"');
      await expect(readFile(artifacts.pythonCliProfilePath, 'utf8')).resolves.toContain('"projectName": "agent-reach"');
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });
});
