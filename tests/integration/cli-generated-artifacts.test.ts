import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runCli } from '../../src/adapters/cli/run.js';

describe('CLI artifact commands', () => {
  it('runs explore from the CLI handler', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-cli-explore-'));
    let stdout = '';
    let stderr = '';

    const exitCode = await runCli(['explore', root, 'data:text/html,<html><body>ok</body></html>'], {
      writeStdout: (chunk) => {
        stdout += chunk;
      },
      writeStderr: (chunk) => {
        stderr += chunk;
      }
    });
    const output = JSON.parse(stdout) as { findingsPath: string; findings: unknown[] };

    expect(exitCode).toBe(0);
    expect(stderr).toBe('');
    expect(output.findingsPath).toBe(join(root, '.hardening', 'run', 'findings.json'));
    expect(output.findings).toEqual([]);
  });

  it('runs generate-tests from the CLI handler', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-cli-generate-'));
    const findingsPath = join(root, '.hardening', 'run', 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');
    let stdout = '';
    let stderr = '';

    await mkdir(join(root, '.hardening', 'run'), { recursive: true });
    await writeFile(findingsPath, JSON.stringify({ findings: [] }));

    const exitCode = await runCli(['generate-tests', findingsPath, outputDir, '--smoke-route', '/login'], {
      writeStdout: (chunk) => {
        stdout += chunk;
      },
      writeStderr: (chunk) => {
        stderr += chunk;
      }
    });
    const output = JSON.parse(stdout) as { createdFiles: string[] };

    expect(exitCode).toBe(0);
    expect(stderr).toBe('');
    expect(output.createdFiles[0]).toBe(join(outputDir, 'generated-findings.spec.ts'));
    await expect(readFile(output.createdFiles[0] ?? '', 'utf8')).resolves.toContain(
      'const targetURL = new URL("/login", baseURL).toString();'
    );
  });

  it('runs report from the CLI handler', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-cli-report-'));
    const runDir = join(root, '.hardening', 'run');
    const outputPath = join(root, 'hardening-report.md');
    let stdout = '';
    let stderr = '';

    await mkdir(runDir, { recursive: true });
    await writeFile(join(runDir, 'repo-profile.json'), JSON.stringify({ blockers: [], confidence: 'high' }));
    await writeFile(join(runDir, 'boot-result.json'), JSON.stringify({ status: 'running', blockers: [], errors: [] }));
    await writeFile(join(runDir, 'findings.json'), JSON.stringify({ findings: [] }));
    await writeFile(join(runDir, 'test-generation.json'), JSON.stringify({ createdFiles: [] }));

    const exitCode = await runCli(['report', runDir, outputPath], {
      writeStdout: (chunk) => {
        stdout += chunk;
      },
      writeStderr: (chunk) => {
        stderr += chunk;
      }
    });
    const output = JSON.parse(stdout) as { reportPath: string };
    const report = await readFile(outputPath, 'utf8');

    expect(exitCode).toBe(0);
    expect(stderr).toBe('');
    expect(output.reportPath).toBe(outputPath);
    expect(report).toContain('# hardening-mcp 硬化报告');
  });
});
