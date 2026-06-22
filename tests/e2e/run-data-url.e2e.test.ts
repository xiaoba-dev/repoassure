import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runCli } from '../../src/adapters/cli/run.js';

describe('hardening run E2E', () => {
  it('runs the full hardening flow against an already-running URL', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-e2e-run-'));
    let stdout = '';
    let stderr = '';

    await mkdir(join(root, 'src'), { recursive: true });
    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({
        scripts: { dev: 'vite', test: 'vitest' },
        devDependencies: { vite: '8.0.0', vitest: '4.1.9' }
      })
    );
    await writeFile(join(root, 'pnpm-lock.yaml'), 'lockfileVersion: 10.0\n');
    await writeFile(join(root, 'src', 'main.ts'), 'console.log("fixture")\n');

    const exitCode = await runCli(['run', root, 'data:text/html,<html><body><main>Ready</main></body></html>'], {
      writeStdout: (chunk) => {
        stdout += chunk;
      },
      writeStderr: (chunk) => {
        stderr += chunk;
      }
    });
    const output = JSON.parse(stdout) as {
      findingsPath: string;
      reportPath: string;
      testGeneration: { createdFiles: string[] };
    };

    expect(exitCode).toBe(0);
    expect(stderr).toBe('');
    await expect(readFile(output.findingsPath, 'utf8')).resolves.toContain('"findings": []');
    await expect(readFile(output.reportPath, 'utf8')).resolves.toContain('# hardening-mcp 硬化报告');
    await expect(readFile(output.testGeneration.createdFiles[0]!, 'utf8')).resolves.toContain("import { test, expect } from '@playwright/test'");
  });
});
