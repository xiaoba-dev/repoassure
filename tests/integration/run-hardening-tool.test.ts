import { mkdir, mkdtemp, readFile, readlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runHardeningTool } from '../../src/tools/run-hardening-tool.js';

describe('runHardeningTool', () => {
  it('can run the hardening flow with an injected browser driver', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-run-tool-'));

    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({
        scripts: { dev: 'vite' },
        devDependencies: { vite: '8.0.0' }
      })
    );

    const result = await runHardeningTool({
      root,
      url: 'http://localhost:3000/',
      browserDriver: {
        snapshot: async (url) => ({
          url,
          status: 200,
          html: '<html><body><main>Dashboard</main></body></html>',
          bodyText: 'Dashboard',
          links: [],
          consoleErrors: [],
          pageErrors: [],
          failedRequests: [],
          artifactFiles: [join(root, '.hardening', 'artifacts', 'home.png')],
          interactions: []
        }),
        close: async () => undefined
      }
    });

    expect(result.explore.artifactFiles).toEqual([join(root, '.hardening', 'artifacts', 'home.png')]);
    await expect(readFile(result.findingsPath, 'utf8')).resolves.toContain('"findings": []');
    await expect(readFile(result.reportPath, 'utf8')).resolves.toContain('# hardening-mcp 硬化报告');
  });

  it('writes a run-scoped artifact bundle and latest manifest for AI IDE consumers', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-run-tool-bundle-'));
    const artifactPath = join(root, '.hardening', 'artifacts', 'home.png');

    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({
        scripts: { dev: 'vite' },
        devDependencies: { vite: '8.0.0' }
      })
    );

    const result = await runHardeningTool({
      root,
      url: 'http://localhost:3000/',
      browserDriver: {
        snapshot: async (url) => {
          await mkdir(join(root, '.hardening', 'artifacts'), { recursive: true });
          await writeFile(artifactPath, 'png');

          return {
            url,
            status: 200,
            html: '<html><body><main>Dashboard</main></body></html>',
            bodyText: 'Dashboard',
            links: [],
            consoleErrors: [],
            pageErrors: [],
            failedRequests: [],
            artifactFiles: [artifactPath],
            interactions: []
          };
        },
        close: async () => undefined
      }
    });
    const latestTarget = await readlink(join(root, '.hardening', 'latest'));
    const manifest = JSON.parse(
      await readFile(join(root, '.hardening', 'latest', 'manifest.json'), 'utf8')
    ) as {
      runId: string;
      files: {
        report: string;
        repairPlan: string;
        repairPlanMarkdown: string;
        repairTaskPackage: string;
        repairTaskPackageMarkdown: string;
        findings: string;
        generatedTests: string[];
        artifacts: string[];
      };
      legacyPaths: {
        report: string;
        repairPlan: string;
        repairPlanMarkdown: string;
        repairTaskPackage: string;
        repairTaskPackageMarkdown: string;
        generatedTests: string[];
      };
    };

    expect(result.artifactBundle.runId).toMatch(/^run-/);
    expect(result.repairPlan.taskCount).toBe(0);
    expect(latestTarget).toBe(join('runs', result.artifactBundle.runId));
    expect(manifest.runId).toBe(result.artifactBundle.runId);
    expect(manifest.files.report).toBe(join(result.artifactBundle.runDir, 'hardening-report.md'));
    expect(manifest.files.repairPlan).toBe(join(result.artifactBundle.runDir, 'repair-plan.json'));
    expect(manifest.files.repairPlanMarkdown).toBe(join(result.artifactBundle.runDir, 'repair-plan.md'));
    expect(manifest.files.repairTaskPackage).toBe(join(result.artifactBundle.runDir, 'repair-task-package.json'));
    expect(manifest.files.repairTaskPackageMarkdown).toBe(join(result.artifactBundle.runDir, 'repair-task-package.md'));
    expect(manifest.files.findings).toBe(join(result.artifactBundle.runDir, 'findings.json'));
    expect(manifest.files.generatedTests).toEqual([
      join(result.artifactBundle.runDir, 'generated-tests', 'generated-findings.spec.ts')
    ]);
    expect(manifest.files.artifacts).toEqual([
      join(result.artifactBundle.runDir, 'artifacts', 'home.png')
    ]);
    expect(manifest.legacyPaths.report).toBe(join(root, 'hardening-report.md'));
    expect(manifest.legacyPaths.repairPlan).toBe(join(root, '.hardening', 'run', 'repair-plan.json'));
    expect(manifest.legacyPaths.repairPlanMarkdown).toBe(join(root, '.hardening', 'run', 'repair-plan.md'));
    expect(manifest.legacyPaths.repairTaskPackage).toBe(join(root, '.hardening', 'run', 'repair-task-package.json'));
    expect(manifest.legacyPaths.repairTaskPackageMarkdown).toBe(join(root, '.hardening', 'run', 'repair-task-package.md'));
    expect(manifest.legacyPaths.generatedTests).toEqual(result.testGeneration.createdFiles);
    await expect(readFile(manifest.files.report, 'utf8')).resolves.toContain('# hardening-mcp 硬化报告');
    await expect(readFile(manifest.files.repairPlan, 'utf8')).resolves.toContain('"schemaVersion": 1');
    await expect(readFile(manifest.files.repairPlanMarkdown, 'utf8')).resolves.toContain('# Repair Plan');
    await expect(readFile(manifest.files.repairTaskPackage, 'utf8')).resolves.toContain('"tasks": []');
    await expect(readFile(manifest.files.repairTaskPackageMarkdown, 'utf8')).resolves.toContain('# Executable Repair Task Package');
    await expect(readFile(manifest.files.generatedTests[0] ?? '', 'utf8')).resolves.toContain('@playwright/test');
    await expect(readFile(manifest.files.artifacts[0] ?? '', 'utf8')).resolves.toBe('png');
  });

  it('can aggregate multiple repo bundles under one workspace output directory', async () => {
    const workspaceOutputDir = await mkdtemp(join(tmpdir(), 'hardening-workspace-output-'));
    const repoOne = await mkdtemp(join(tmpdir(), 'hardening-alpha-site-'));
    const repoTwo = await mkdtemp(join(tmpdir(), 'hardening-beta-web-'));

    for (const repoRoot of [repoOne, repoTwo]) {
      await writeFile(
        join(repoRoot, 'package.json'),
        JSON.stringify({
          scripts: { dev: 'vite' },
          devDependencies: { vite: '8.0.0' }
        })
      );
    }

    const first = await runHardeningTool({
      root: repoOne,
      url: 'http://localhost:3000/',
      workspaceOutputDir,
      browserDriver: {
        snapshot: async (url) => ({
          url,
          status: 200,
          html: '<html><body><main>one</main></body></html>',
          bodyText: 'one',
          links: [],
          consoleErrors: [],
          pageErrors: [],
          failedRequests: [],
          artifactFiles: [],
          interactions: []
        }),
        close: async () => undefined
      }
    });
    const second = await runHardeningTool({
      root: repoTwo,
      url: 'http://localhost:3001/',
      workspaceOutputDir,
      browserDriver: {
        snapshot: async (url) => ({
          url,
          status: 200,
          html: '<html><body><main>two</main></body></html>',
          bodyText: 'two',
          links: [],
          consoleErrors: [],
          pageErrors: [],
          failedRequests: [],
          artifactFiles: [],
          interactions: []
        }),
        close: async () => undefined
      }
    });
    const workspaceManifest = JSON.parse(
      await readFile(join(workspaceOutputDir, 'manifest.json'), 'utf8')
    ) as {
      repos: Array<{
        repoSlug: string;
        repoRoot: string;
        latestManifest: string;
        latestRunId: string;
      }>;
    };
    const firstWorkspaceBundle = first.workspaceBundle;
    const secondWorkspaceBundle = second.workspaceBundle;

    expect(firstWorkspaceBundle).toBeDefined();
    expect(secondWorkspaceBundle).toBeDefined();

    expect(firstWorkspaceBundle?.manifestPath).toBe(
      join(workspaceOutputDir, 'repos', firstWorkspaceBundle?.repoSlug ?? '', 'runs', firstWorkspaceBundle?.runId ?? '', 'manifest.json')
    );
    expect(secondWorkspaceBundle?.manifestPath).toBe(
      join(workspaceOutputDir, 'repos', secondWorkspaceBundle?.repoSlug ?? '', 'runs', secondWorkspaceBundle?.runId ?? '', 'manifest.json')
    );
    expect(workspaceManifest.repos).toEqual([
      expect.objectContaining({
        repoSlug: firstWorkspaceBundle?.repoSlug,
        repoRoot: repoOne,
        latestManifest: firstWorkspaceBundle?.manifestPath,
        latestRunId: firstWorkspaceBundle?.runId
      }),
      expect.objectContaining({
        repoSlug: secondWorkspaceBundle?.repoSlug,
        repoRoot: repoTwo,
        latestManifest: secondWorkspaceBundle?.manifestPath,
        latestRunId: secondWorkspaceBundle?.runId
      })
    ]);
    await expect(readFile(join(workspaceOutputDir, 'repos', firstWorkspaceBundle?.repoSlug ?? '', 'latest', 'manifest.json'), 'utf8')).resolves.toContain(repoOne);
    await expect(readFile(join(workspaceOutputDir, 'repos', secondWorkspaceBundle?.repoSlug ?? '', 'latest', 'manifest.json'), 'utf8')).resolves.toContain(repoTwo);
    await expect(readFile(join(workspaceOutputDir, 'repos', firstWorkspaceBundle?.repoSlug ?? '', 'latest', 'repair-plan.json'), 'utf8')).resolves.toContain('"schemaVersion": 1');
    await expect(readFile(join(workspaceOutputDir, 'repos', secondWorkspaceBundle?.repoSlug ?? '', 'latest', 'repair-plan.md'), 'utf8')).resolves.toContain('# Repair Plan');
    await expect(readFile(join(workspaceOutputDir, 'repos', firstWorkspaceBundle?.repoSlug ?? '', 'latest', 'repair-task-package.json'), 'utf8')).resolves.toContain('"tasks"');
    await expect(readFile(join(workspaceOutputDir, 'repos', secondWorkspaceBundle?.repoSlug ?? '', 'latest', 'repair-task-package.md'), 'utf8')).resolves.toContain('# Executable Repair Task Package');
  });

  it('passes exploration controls to the browser driver', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-run-tool-controls-'));
    const snapshots: Array<{ url: string; maxActionsPerRoute: number }> = [];

    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({
        scripts: { dev: 'vite' },
        devDependencies: { vite: '8.0.0' }
      })
    );

    const result = await runHardeningTool({
      root,
      url: 'http://localhost:3000/',
      criticalPaths: ['/settings'],
      maxRoutes: 2,
      maxActionsPerRoute: 3,
      browserDriver: {
        snapshot: async (url, options) => {
          snapshots.push({ url, maxActionsPerRoute: options.maxActionsPerRoute });

          return {
            url,
            status: 200,
            html: '<html><body><main>ok</main></body></html>',
            bodyText: 'ok',
            links: [],
            consoleErrors: [],
            pageErrors: [],
            failedRequests: [],
            artifactFiles: [],
            interactions: []
          };
        },
        close: async () => undefined
      }
    });

    expect(result.explore.visitedRoutes).toEqual([
      'http://localhost:3000/',
      'http://localhost:3000/settings'
    ]);
    expect(snapshots).toEqual([
      { url: 'http://localhost:3000/', maxActionsPerRoute: 3 },
      { url: 'http://localhost:3000/settings', maxActionsPerRoute: 3 }
    ]);
    await expect(readFile(result.testGeneration.createdFiles[0] ?? '', 'utf8')).resolves.toContain(
      'const targetURL = new URL("/settings", baseURL).toString();'
    );
  });

  it('generates smoke tests for explored routes on already-running hosted app URLs', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-run-tool-hosted-smoke-'));

    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({
        scripts: { dev: 'vite' },
        devDependencies: { vite: '8.0.0' }
      })
    );

    const result = await runHardeningTool({
      root,
      url: 'https://app.example.test/dashboard',
      maxRoutes: 2,
      browserDriver: {
        snapshot: async (url) => ({
          url,
          status: 200,
          html: '<html><body><main>ok</main></body></html>',
          bodyText: 'ok',
          links: url.endsWith('/settings') ? [] : ['https://app.example.test/settings'],
          consoleErrors: [],
          pageErrors: [],
          failedRequests: [],
          artifactFiles: [],
          interactions: []
        }),
        close: async () => undefined
      }
    });
    const spec = await readFile(result.testGeneration.createdFiles[0] ?? '', 'utf8');

    expect(result.explore.visitedRoutes).toEqual([
      'https://app.example.test/dashboard',
      'https://app.example.test/settings'
    ]);
    expect(spec).toContain('const targetURL = new URL("/dashboard", baseURL).toString();');
    expect(spec).toContain('const targetURL = new URL("/settings", baseURL).toString();');
    expect(spec).not.toContain('Generated smoke path');
  });

  it('records default ports for already-running HTTP and HTTPS URLs', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-run-tool-default-port-'));

    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({
        scripts: { dev: 'vite' },
        devDependencies: { vite: '8.0.0' }
      })
    );

    await runHardeningTool({
      root,
      url: 'https://example.test/dashboard',
      browserDriver: {
        snapshot: async (url) => ({
          url,
          status: 200,
          html: '<html><body><main>ok</main></body></html>',
          bodyText: 'ok',
          links: [],
          consoleErrors: [],
          pageErrors: [],
          failedRequests: [],
          artifactFiles: [],
          interactions: []
        }),
        close: async () => undefined
      }
    });

    const bootResult = JSON.parse(
      await readFile(join(root, '.hardening', 'run', 'boot-result.json'), 'utf8')
    ) as { port: number | null };

    expect(bootResult.port).toBe(443);
  });

  it('redacts sensitive URL parameters from already-running boot result artifacts while exploring the real URL', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-run-tool-redacted-boot-url-'));
    const exploredUrls: string[] = [];

    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({
        scripts: { dev: 'vite' },
        devDependencies: { vite: '8.0.0' }
      })
    );

    await runHardeningTool({
      root,
      url: 'http://localhost:5173/callback?code=oauth-secret&tab=profile#access_token=fragment-secret',
      browserDriver: {
        snapshot: async (url) => {
          exploredUrls.push(url);

          return {
            url,
            status: 200,
            html: '<html><body><main>ok</main></body></html>',
            bodyText: 'ok',
            links: [],
            consoleErrors: [],
            pageErrors: [],
            failedRequests: [],
            artifactFiles: [],
            interactions: []
          };
        },
        close: async () => undefined
      }
    });

    const bootResultText = await readFile(join(root, '.hardening', 'run', 'boot-result.json'), 'utf8');

    expect(exploredUrls).toEqual([
      'http://localhost:5173/callback?code=oauth-secret&tab=profile#access_token=fragment-secret'
    ]);
    expect(bootResultText).toContain('code=[REDACTED]');
    expect(bootResultText).toContain('access_token=[REDACTED]');
    expect(bootResultText).not.toContain('oauth-secret');
    expect(bootResultText).not.toContain('fragment-secret');
  });

  it('normalizes already-running 0.0.0.0 URLs before exploration and reporting', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-run-tool-normalized-url-'));
    const exploredUrls: string[] = [];

    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({
        scripts: { dev: 'vite' },
        devDependencies: { vite: '8.0.0' }
      })
    );

    await runHardeningTool({
      root,
      url: 'http://0.0.0.0:5173/',
      browserDriver: {
        snapshot: async (url) => {
          exploredUrls.push(url);

          return {
            url,
            status: 200,
            html: '<html><body><main>ok</main></body></html>',
            bodyText: 'ok',
            links: [],
            consoleErrors: [],
            pageErrors: [],
            failedRequests: [],
            artifactFiles: [],
            interactions: []
          };
        },
        close: async () => undefined
      }
    });

    const bootResult = JSON.parse(
      await readFile(join(root, '.hardening', 'run', 'boot-result.json'), 'utf8')
    ) as { url: string; port: number | null };

    expect(exploredUrls).toEqual(['http://127.0.0.1:5173']);
    expect(bootResult).toMatchObject({
      url: 'http://127.0.0.1:5173',
      port: 5173
    });
    await expect(readFile(join(root, 'hardening-report.md'), 'utf8')).resolves.toContain(
      '| 应用 URL | http://127.0.0.1:5173 |'
    );
  });

  it('boots the app when url is omitted and stops the boot session after the run', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-run-tool-boot-'));
    const bootResultPath = join(root, '.hardening', 'run', 'boot-result.json');
    let stopped = false;

    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({
        scripts: { dev: 'vite --host 127.0.0.1' },
        devDependencies: { vite: '8.0.0' }
      })
    );
    await writeFile(join(root, 'pnpm-lock.yaml'), 'lockfileVersion: 10.0\n');

    const result = await runHardeningTool({
      root,
      bootApp: async () => {
        await writeFile(
          bootResultPath,
          JSON.stringify({
            status: 'running',
            url: 'http://localhost:5173',
            port: 5173,
            logsPath: join(root, '.hardening', 'run', 'app.log'),
            blockers: [],
            errors: []
          })
        );

        return {
          status: 'running',
          url: 'http://localhost:5173',
          port: 5173,
          logsPath: join(root, '.hardening', 'run', 'app.log'),
          blockers: [],
          errors: [],
          resultPath: bootResultPath,
          stop: async () => {
            stopped = true;
          }
        };
      },
      browserDriver: {
        snapshot: async (url) => ({
          url,
          status: 200,
          html: '<html><body><main>Booted</main></body></html>',
          bodyText: 'Booted',
          links: [],
          consoleErrors: [],
          pageErrors: [],
          failedRequests: [],
          artifactFiles: [],
          interactions: []
        }),
        close: async () => undefined
      }
    });

    expect(stopped).toBe(true);
    expect(result.report.readinessScore).toBe(100);
    await expect(readFile(result.reportPath, 'utf8')).resolves.toContain('| 应用 URL | http://localhost:5173 |');
  });

  it('writes a failure report when boot does not reach running state', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-run-tool-boot-failed-'));
    const bootResultPath = join(root, '.hardening', 'run', 'boot-result.json');
    let stopped = false;

    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({
        scripts: { dev: 'vite --host 127.0.0.1' },
        devDependencies: { vite: '8.0.0' }
      })
    );
    await writeFile(join(root, 'pnpm-lock.yaml'), 'lockfileVersion: 10.0\n');

    const result = await runHardeningTool({
      root,
      bootApp: async () => {
        await writeFile(
          bootResultPath,
          JSON.stringify({
            status: 'failed',
            url: null,
            port: null,
            logsPath: join(root, '.hardening', 'run', 'app.log'),
            blockers: [],
            errors: ['Timed out waiting for app URL']
          })
        );

        return {
          status: 'failed',
          url: null,
          port: null,
          logsPath: join(root, '.hardening', 'run', 'app.log'),
          blockers: [],
          errors: ['Timed out waiting for app URL'],
          resultPath: bootResultPath,
          stop: async () => {
            stopped = true;
          }
        };
      }
    });

    expect(stopped).toBe(true);
    expect(result.report.readinessScore).toBeLessThan(100);
    await expect(readFile(result.findingsPath, 'utf8')).resolves.toContain('"findings": []');
    await expect(readFile(result.reportPath, 'utf8')).resolves.toContain('| 启动状态 | failed |');
    await expect(readFile(result.reportPath, 'utf8')).resolves.toContain('Timed out waiting for app URL');
  });
});
