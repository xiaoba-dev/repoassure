import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { callHardeningTool, listHardeningTools } from '../../src/adapters/mcp/tool-registry.js';

describe('MCP tool registry', () => {
  it('lists the P0 hardening tools', () => {
    expect(listHardeningTools().map((tool) => tool.name)).toEqual([
      'analyze_repo',
      'boot_app',
      'stop_app',
      'explore_app',
      'generate_tests',
      'generate_repair_plan',
      'harden_report',
      'run_hardening'
    ]);
  });

  it('exposes storage state inputs for browser exploration tools', () => {
    const tools = listHardeningTools();
    const exploreApp = tools.find((tool) => tool.name === 'explore_app');
    const runHardening = tools.find((tool) => tool.name === 'run_hardening');
    const exploreProperties = (exploreApp?.inputSchema as { properties?: Record<string, unknown> } | undefined)?.properties;
    const runProperties = (runHardening?.inputSchema as { properties?: Record<string, unknown> } | undefined)?.properties;

    expect(exploreProperties).toHaveProperty('storageStatePath');
    expect(exploreProperties).toHaveProperty('trace');
    expect(runProperties).toHaveProperty('storageStatePath');
    expect(runProperties).toHaveProperty('trace');
  });

  it('exposes baseUrl input for standalone generated tests', () => {
    const generateTests = listHardeningTools().find((tool) => tool.name === 'generate_tests');
    const properties = (generateTests?.inputSchema as { properties?: Record<string, unknown> } | undefined)?.properties;

    expect(properties).toHaveProperty('baseUrl');
  });

  it('exposes generate_repair_plan over MCP tool calls', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-mcp-repair-'));
    const runDir = join(root, '.hardening', 'run');
    await mkdir(runDir, { recursive: true });
    await writeFile(join(runDir, 'findings.json'), JSON.stringify({ findings: [] }));
    await writeFile(join(runDir, 'test-generation.json'), JSON.stringify({ createdFiles: [], testCommand: null, validationStatus: 'skipped', errors: [] }));
    await writeFile(join(runDir, 'boot-result.json'), JSON.stringify({ status: 'failed', url: null, blockers: [], errors: [] }));

    const result = await callHardeningTool('generate_repair_plan', { root, runDir });

    expect(result.isError).toBe(false);
    expect(result.structuredContent).toMatchObject({
      taskCount: 0,
      highestSeverity: null,
      recommendedNextTaskId: null
    });
    await expect(readFile(join(runDir, 'repair-plan.json'), 'utf8')).resolves.toContain('"schemaVersion": 1');
  });

  it('passes baseUrl to generate_tests over MCP tool calls', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-mcp-generate-'));
    const runDir = join(root, '.hardening', 'run');
    const findingsPath = join(runDir, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');
    await mkdir(runDir, { recursive: true });
    await writeFile(findingsPath, JSON.stringify({ findings: [] }));

    const result = await callHardeningTool('generate_tests', {
      findingsPath,
      outputDir,
      baseUrl: 'http://127.0.0.1:5173/dashboard'
    });

    expect(result.isError).toBe(false);
    await expect(readFile(join(outputDir, 'generated-findings.spec.ts'), 'utf8')).resolves.toContain(
      'const baseURL = process.env.HARDENING_BASE_URL ?? "http://127.0.0.1:5173";'
    );
  });

  it('calls analyze_repo and returns structured content', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-mcp-analyze-'));

    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({
        scripts: { dev: 'vite' },
        devDependencies: { vite: '8.0.0' }
      })
    );
    await writeFile(join(root, 'pnpm-lock.yaml'), 'lockfileVersion: 10.0\n');

    const result = await callHardeningTool('analyze_repo', { root });

    expect(result.isError).toBe(false);
    expect(result.structuredContent).toMatchObject({
      profile: {
        framework: 'vite',
        packageManager: 'pnpm',
        recommendedStartCommand: 'pnpm dev'
      }
    });
    await expect(readFile(join(root, '.hardening', 'run', 'repo-profile.json'), 'utf8')).resolves.toContain('"framework": "vite"');
  });

  it('returns a tool error for unknown tools', async () => {
    const result = await callHardeningTool('missing_tool', {});

    expect(result.isError).toBe(true);
    expect(result.structuredContent).toEqual({
      error: 'Unknown tool: missing_tool'
    });
  });

  it('redacts sensitive values from MCP tool errors', async () => {
    const result = await callHardeningTool('missing_tool API_KEY=sk-tool-secret token=query-secret', {});
    const serialized = JSON.stringify(result);

    expect(result.isError).toBe(true);
    expect(serialized).toContain('API_KEY=[REDACTED]');
    expect(serialized).toContain('token=[REDACTED]');
    expect(serialized).not.toContain('sk-tool-secret');
    expect(serialized).not.toContain('query-secret');
  });

  it('redacts sensitive values from successful MCP tool content and structured content', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-mcp-API_KEY=sk-success-secret-token=query-secret-'));

    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({
        scripts: { dev: 'vite' },
        devDependencies: { vite: '8.0.0' }
      })
    );

    const result = await callHardeningTool('analyze_repo', { root });
    const serialized = JSON.stringify(result);

    expect(result.isError).toBe(false);
    expect(serialized).toContain('API_KEY=[REDACTED]');
    expect(serialized).not.toContain('sk-success-secret');
    expect(serialized).not.toContain('query-secret');
  });

  it('rejects invalid positive integer controls before running a tool', async () => {
    const result = await callHardeningTool('run_hardening', {
      root: '.',
      maxRoutes: 0
    });

    expect(result.isError).toBe(true);
    expect(result.structuredContent).toEqual({
      error: 'Invalid positive integer argument: maxRoutes'
    });
  });

  it('rejects negative interaction limits before running a tool', async () => {
    const result = await callHardeningTool('run_hardening', {
      root: '.',
      maxActionsPerRoute: -1
    });

    expect(result.isError).toBe(true);
    expect(result.structuredContent).toEqual({
      error: 'Invalid non-negative integer argument: maxActionsPerRoute'
    });
  });
});
