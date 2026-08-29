import { mkdir, mkdtemp, readFile, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  callHardeningTool,
  listHardeningTools,
  redactMcpStructuredContent
} from '../../src/adapters/mcp/tool-registry.js';

describe('MCP tool registry', () => {
  it('lists the P0 hardening tools', () => {
    expect(listHardeningTools().map((tool) => tool.name)).toEqual([
      'analyze_repo',
      'boot_app',
      'stop_app',
      'explore_app',
      'generate_tests',
      'generate_repair_plan',
      'prepare_repair_handoff',
      'preview_repair_execution',
      'generate_repair_patch_plan',
      'list_security_providers',
      'import_security_evidence',
      'harden_report',
      'run_hardening',
    ]);
  });

  it('exposes the additive repair handoff contract without changing existing tool annotations', () => {
    const tools = listHardeningTools();
    const repairHandoff = tools.find((tool) => tool.name === 'prepare_repair_handoff');

    expect(repairHandoff).toMatchObject({
      name: 'prepare_repair_handoff',
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false
      },
      inputSchema: {
        type: 'object',
        required: ['runDir'],
        properties: {
          runDir: {
            type: 'string'
          },
          outputDir: {
            type: 'string'
          }
        }
      }
    });
    expect(tools.filter((tool) => (
      tool.name !== 'prepare_repair_handoff'
      && tool.name !== 'preview_repair_execution'
      && tool.name !== 'generate_repair_patch_plan'
      && tool.name !== 'assemble_repair_evidence_package'
    )).map((tool) => ({
      name: tool.name,
      annotations: tool.annotations
    }))).toEqual([
      {
        name: 'analyze_repo',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false
        }
      },
      {
        name: 'boot_app',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false
        }
      },
      {
        name: 'stop_app',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false
        }
      },
      {
        name: 'explore_app',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true
        }
      },
      {
        name: 'generate_tests',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false
        }
      },
      {
        name: 'generate_repair_plan',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false
        }
      },
      {
        name: 'list_security_providers',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false
        }
      },
      {
        name: 'import_security_evidence',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false
        }
      },
      {
        name: 'harden_report',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false
        }
      },
      {
        name: 'run_hardening',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true
        }
      }
    ]);
  });

  it('exposes the additive repair execution preview contract without changing existing tool annotations', () => {
    const tools = listHardeningTools();
    const repairPreview = tools.find((tool) => tool.name === 'preview_repair_execution');

    expect(repairPreview).toMatchObject({
      name: 'preview_repair_execution',
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false
      },
      inputSchema: {
        type: 'object',
        required: ['packagePath'],
        properties: {
          packagePath: {
            type: 'string'
          },
          taskIds: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          all: {
            type: 'boolean'
          },
          outputDir: {
            type: 'string'
          }
        }
      }
    });
    expect(repairPreview?.inputSchema.properties).not.toHaveProperty('validationOnly');
    expect(tools.filter((tool) => tool.name !== 'preview_repair_execution').map((tool) => ({
      name: tool.name,
      inputSchema: tool.inputSchema,
      annotations: tool.annotations
    }))).toHaveLength(12);
  });

  it('fails closed when repair preview task selection is missing, ambiguous, or unsafe', async () => {
    const packagePath = '/tmp/repair-handoff-package.json';
    const cases = [
      {
        args: { packagePath },
        error: 'Exactly one of non-empty taskIds or all=true is required'
      },
      {
        args: { packagePath, taskIds: [] },
        error: 'Invalid non-empty string array argument: taskIds'
      },
      {
        args: { packagePath, taskIds: ['repair-task-1'], all: true },
        error: 'Exactly one of non-empty taskIds or all=true is required'
      },
      {
        args: { packagePath, all: false },
        error: 'Exactly one of non-empty taskIds or all=true is required'
      },
      {
        args: { packagePath, all: true, validationOnly: true },
        error: 'Unsupported argument for preview_repair_execution: validationOnly'
      },
      {
        args: { packagePath, all: true, command: 'rm -rf .' },
        error: 'Unsupported argument for preview_repair_execution: command'
      }
    ];

    for (const testCase of cases) {
      const result = await callHardeningTool('preview_repair_execution', testCase.args);

      expect(result.isError).toBe(true);
      expect(result.structuredContent).toBeUndefined();
      expect(result.content).toEqual([{ type: 'text', text: testCase.error }]);
    }
  });

  it('exposes the additive repair patch plan contract without changing existing tool annotations', () => {
    const tools = listHardeningTools();
    const repairPatchPlan = tools.find((tool) => tool.name === 'generate_repair_patch_plan');

    expect(repairPatchPlan).toMatchObject({
      name: 'generate_repair_patch_plan',
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false
      },
      inputSchema: {
        type: 'object',
        required: ['reportPath'],
        properties: {
          reportPath: {
            type: 'string'
          },
          outputDir: {
            type: 'string'
          }
        }
      }
    });
    expect(repairPatchPlan?.inputSchema.properties).not.toHaveProperty('validationOnly');
    expect(repairPatchPlan?.inputSchema.properties).not.toHaveProperty('command');
    expect(tools.filter((tool) => tool.name !== 'generate_repair_patch_plan')).toHaveLength(12);
  });

  it('fails closed for missing, unsupported, or sensitive repair patch plan inputs', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-mcp-patch-error-'));
    const cases = [
      {
        args: {},
        error: 'Missing required string argument: reportPath'
      },
      {
        args: { reportPath: '/tmp/repair-execution-report.json', validationOnly: true },
        error: 'Unsupported argument for generate_repair_patch_plan: validationOnly'
      },
      {
        args: { reportPath: '/tmp/repair-execution-report.json', command: 'rm -rf .' },
        error: 'Unsupported argument for generate_repair_patch_plan: command'
      },
      {
        args: { reportPath: '/tmp/repair-execution-report.json', apply: true },
        error: 'Unsupported argument for generate_repair_patch_plan: apply'
      }
    ];

    for (const testCase of cases) {
      const result = await callHardeningTool('generate_repair_patch_plan', testCase.args);

      expect(result.isError).toBe(true);
      expect(result.structuredContent).toBeUndefined();
      expect(result.content).toEqual([{ type: 'text', text: testCase.error }]);
    }

    const sensitiveResult = await callHardeningTool('generate_repair_patch_plan', {
      reportPath: join(root, 'token=patch-secret')
    });
    const serialized = JSON.stringify(sensitiveResult);

    expect(sensitiveResult.isError).toBe(true);
    expect(serialized).toContain('token=[REDACTED]');
    expect(serialized).not.toContain('patch-secret');
  });

  it('fails closed and redacts repair handoff errors before creating output', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-mcp-handoff-error-'));
    const runDir = join(root, 'token=query-secret');
    const outputDir = join(root, 'output');

    const result = await callHardeningTool('prepare_repair_handoff', {
      runDir,
      outputDir
    });
    const serialized = JSON.stringify(result);

    expect(result.isError).toBe(true);
    expect(serialized).toContain('token=[REDACTED]');
    expect(serialized).not.toContain('query-secret');
    await expect(stat(outputDir)).rejects.toMatchObject({
      code: 'ENOENT'
    });
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

    expectToolError(result, 'Unknown tool: missing_tool');
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

  it('redacts structured credential values regardless of their JSON type without erasing governance fields', () => {
    expect(redactMcpStructuredContent({
      apiKeys: ['first', 'second'],
      token: 12345,
      authorization: { value: 'opaque' },
      authorizationStatus: 'approved',
      nonAuthorizationBoundary: 'This is evidence, not authorization.',
      sessionId: 'local-session-reference',
      jsonPath: '/tmp/TOKEN=opaque/repair-task-package.json'
    })).toEqual({
      apiKeys: '[REDACTED]',
      token: '[REDACTED]',
      authorization: '[REDACTED]',
      authorizationStatus: 'approved',
      nonAuthorizationBoundary: 'This is evidence, not authorization.',
      sessionId: 'local-session-reference',
      jsonPath: '/tmp/TOKEN=[REDACTED]/repair-task-package.json'
    });
  });

  it('rejects invalid positive integer controls before running a tool', async () => {
    const result = await callHardeningTool('run_hardening', {
      root: '.',
      maxRoutes: 0
    });

    expectToolError(result, 'Invalid positive integer argument: maxRoutes');
  });

  it('rejects negative interaction limits before running a tool', async () => {
    const result = await callHardeningTool('run_hardening', {
      root: '.',
      maxActionsPerRoute: -1
    });

    expectToolError(result, 'Invalid non-negative integer argument: maxActionsPerRoute');
  });
});

function expectToolError(result: Awaited<ReturnType<typeof callHardeningTool>>, message: string): void {
  expect(result.isError).toBe(true);
  expect(result.structuredContent).toBeUndefined();
  expect(result.content).toEqual([{ type: 'text', text: message }]);
}
