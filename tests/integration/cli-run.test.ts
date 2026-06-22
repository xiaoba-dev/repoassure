import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runCli } from '../../src/adapters/cli/run.js';

describe('CLI run', () => {
  it('runs analyze, explore, generate-tests, and report for a provided URL', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-cli-run-'));
    let stdout = '';
    let stderr = '';

    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({
        scripts: { dev: 'vite' },
        devDependencies: { vite: '8.0.0' }
      })
    );

    const exitCode = await runCli(['run', root, 'data:text/html,<html><body>ok</body></html>'], {
      writeStdout: (chunk) => {
        stdout += chunk;
      },
      writeStderr: (chunk) => {
        stderr += chunk;
      }
    });
    const output = JSON.parse(stdout) as {
      profilePath: string;
      findingsPath: string;
      reportPath: string;
      repairPlan: {
        repairPlanPath: string;
        repairPlanMarkdownPath: string;
        repairTaskPackagePath: string;
        repairTaskPackageMarkdownPath: string;
        taskCount: number;
      };
      testGeneration: { createdFiles: string[] };
    };

    expect(exitCode).toBe(0);
    expect(stderr).toBe('');
    expect(output.profilePath).toBe(join(root, '.hardening', 'run', 'repo-profile.json'));
    expect(output.findingsPath).toBe(join(root, '.hardening', 'run', 'findings.json'));
    expect(output.reportPath).toBe(join(root, 'hardening-report.md'));
    expect(output.repairPlan.repairPlanPath).toContain(join(root, '.hardening', 'runs'));
    expect(output.repairPlan.repairPlanPath.endsWith('repair-plan.json')).toBe(true);
    expect(output.repairPlan.repairTaskPackagePath.endsWith('repair-task-package.json')).toBe(true);
    expect(output.repairPlan.taskCount).toBe(0);
    expect(output.testGeneration.createdFiles[0]).toBe(join(root, 'tests', 'hardening', 'generated-findings.spec.ts'));
    await expect(readFile(output.reportPath, 'utf8')).resolves.toContain('# hardening-mcp 硬化报告');
    await expect(readFile(output.repairPlan.repairPlanPath, 'utf8')).resolves.toContain('"schemaVersion": 1');
    await expect(readFile(output.repairPlan.repairTaskPackageMarkdownPath, 'utf8')).resolves.toContain('# Executable Repair Task Package');
  });

  it('generates a repair plan from the latest run through the plan command', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-cli-plan-'));
    let stdout = '';
    let stderr = '';

    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({
        scripts: { dev: 'vite' },
        devDependencies: { vite: '8.0.0' }
      })
    );

    await runCli(['run', root, 'data:text/html,<html><body>ok</body></html>'], {
      writeStdout: () => undefined,
      writeStderr: () => undefined
    });

    const exitCode = await runCli(['plan', root], {
      writeStdout: (chunk) => {
        stdout += chunk;
      },
      writeStderr: (chunk) => {
        stderr += chunk;
      }
    });
    const output = JSON.parse(stdout) as {
      repairPlanPath: string;
      repairPlanMarkdownPath: string;
      repairTaskPackagePath: string;
      repairTaskPackageMarkdownPath: string;
      taskCount: number;
    };

    expect(exitCode).toBe(0);
    expect(stderr).toBe('');
    expect(output.taskCount).toBe(0);
    expect(output.repairPlanPath).toBe(join(root, '.hardening', 'latest', 'repair-plan.json'));
    expect(output.repairPlanMarkdownPath).toBe(join(root, '.hardening', 'latest', 'repair-plan.md'));
    expect(output.repairTaskPackagePath).toBe(join(root, '.hardening', 'latest', 'repair-task-package.json'));
    expect(output.repairTaskPackageMarkdownPath).toBe(join(root, '.hardening', 'latest', 'repair-task-package.md'));
    await expect(readFile(output.repairPlanMarkdownPath, 'utf8')).resolves.toContain('# Repair Plan');
    await expect(readFile(output.repairTaskPackageMarkdownPath, 'utf8')).resolves.toContain('# Executable Repair Task Package');
  });
});
