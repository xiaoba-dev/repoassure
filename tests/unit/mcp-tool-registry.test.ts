import { mkdir, mkdtemp, readFile, symlink, writeFile } from 'node:fs/promises';
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
      'harden_report',
      'run_hardening',
      'create_blocked_goal_recovery',
      'consume_blocked_goal_recovery',
      'record_blocked_goal_recovery_decision',
      'prepare_blocked_goal_resume_attempt',
      'intake_blocked_goal_resume_evidence',
      'review_blocked_goal_resume_evidence',
      'close_blocked_goal_resume_attempt',
      'validate_blocked_goal_recovery_lifecycle'
    ]);
  });

  it('publishes strict non-executing recovery tool contracts', () => {
    const recoveryTools = listHardeningTools().slice(8);

    expect(recoveryTools).toHaveLength(8);
    for (const tool of recoveryTools) {
      expect(tool.inputSchema).toMatchObject({
        type: 'object',
        required: ['inputDir'],
        additionalProperties: false,
        properties: {
          inputDir: { type: 'string' },
          outputDir: { type: 'string' }
        }
      });
      expect(tool.outputSchema).toMatchObject({
        type: 'object',
        additionalProperties: false,
        required: ['schemaVersion', 'toolName', 'stage', 'artifacts', 'output', 'boundaryCompliance']
      });
      expect(tool.outputSchema?.properties).toMatchObject({
        schemaVersion: { const: 'repoassure.mcp-blocked-goal-recovery-tool-result.v1' },
        toolName: { const: tool.name },
        artifacts: {
          type: 'object',
          additionalProperties: false,
          required: ['jsonPath', 'markdownPath'],
          properties: {
            jsonPath: { type: 'string', pattern: expect.stringContaining('\\.json$') },
            markdownPath: { type: 'string', pattern: expect.stringContaining('\\.md$') }
          }
        },
        output: {
          type: 'object',
          additionalProperties: false,
          properties: { schemaVersion: { type: 'string', const: expect.stringMatching(/^repoassure\./u) } }
        },
        boundaryCompliance: {
          type: 'object',
          additionalProperties: false,
          required: ['commandsExecuted', 'externalStateChanged', 'targetRepoMutation'],
          properties: {
            commandsExecuted: { const: false },
            externalStateChanged: { const: false },
            targetRepoMutation: { const: false }
          }
        }
      });
      const requiredOutputFields = (tool.outputSchema?.properties?.output as { required?: string[] }).required;
      expect(requiredOutputFields).toContain('schemaVersion');
      expect(requiredOutputFields?.length).toBeGreaterThan(7);
      expect(tool.annotations).toMatchObject({
        readOnlyHint: false,
        destructiveHint: true,
        openWorldHint: false
      });
      expect(tool.description).toContain('does not execute');
    }
  });

  it('creates a local recovery package over MCP without exposing secret paths or erasing boundaries', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-mcp-TOKEN=secret-value-'));
    await writeFile(join(root, 'blocked-goal-recovery-input.json'), JSON.stringify({
      sourceGoal: {
        title: 'MCP fixture recovery', status: 'blocked',
        objective: 'Create local recovery evidence only.', evidenceRefs: []
      },
      sourceLogs: [], blockers: [],
      resumeCommands: [{ command: 'codex resume goal', purpose: 'Separate reviewed attempt.' }],
      redactionBoundary: 'Sanitized local evidence only.'
    }));

    const result = await callHardeningTool('create_blocked_goal_recovery', { inputDir: root });
    const serialized = JSON.stringify(result);

    expect(result.isError).toBe(false);
    expect(result.structuredContent).toMatchObject({
      schemaVersion: 'repoassure.mcp-blocked-goal-recovery-tool-result.v1',
      toolName: 'create_blocked_goal_recovery',
      stage: 'recovery_package',
      output: { schemaVersion: 'repoassure.blocked-goal-recovery-package.v1' },
      boundaryCompliance: {
        commandsExecuted: false,
        externalStateChanged: false,
        targetRepoMutation: false
      }
    });
    expect(serialized).not.toContain('secret-value');
    expect(serialized).toContain('nonAuthorizationBoundary');
    expect(serialized).toContain('does not modify target repo files');
    await expect(readFile(join(root, 'blocked-goal-recovery-package.json'), 'utf8'))
      .resolves.toContain('repoassure.blocked-goal-recovery-package.v1');
  });

  it('rejects recovery tool argument expansion before writing artifacts', async () => {
    const result = await callHardeningTool('create_blocked_goal_recovery', {
      inputDir: '.', command: 'codex resume goal'
    });

    expect(result.isError).toBe(true);
    expect(result.structuredContent).toEqual({ error: 'Unexpected argument: command' });
  });

  it('rejects output directories that escape inputDir through a symlink', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-mcp-contained-'));
    const outside = await mkdtemp(join(tmpdir(), 'repoassure-mcp-outside-'));
    const escapedOutput = join(root, 'escaped-output');
    await symlink(outside, escapedOutput, 'dir');
    await writeFile(join(root, 'blocked-goal-recovery-input.json'), JSON.stringify({
      sourceGoal: { title: 'Fixture', status: 'blocked', objective: 'Local evidence only.' },
      blockers: [], resumeCommands: [], redactionBoundary: 'Sanitized local evidence only.'
    }));

    const result = await callHardeningTool('create_blocked_goal_recovery', {
      inputDir: root,
      outputDir: escapedOutput
    });

    expect(result.isError).toBe(true);
    expect(result.structuredContent).toEqual({ error: 'outputDir must resolve within inputDir' });
    await expect(readFile(join(outside, 'blocked-goal-recovery-package.json'), 'utf8')).rejects.toMatchObject({
      code: 'ENOENT'
    });
  });

  it('rejects stage input artifacts that escape inputDir through a symlink', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-mcp-input-contained-'));
    const outside = await mkdtemp(join(tmpdir(), 'repoassure-mcp-input-outside-'));
    const outsideInput = join(outside, 'recovery-input.json');
    await writeFile(outsideInput, JSON.stringify({
      sourceGoal: { title: 'Outside fixture', status: 'blocked', objective: 'Must not be read.' },
      blockers: [], resumeCommands: [], redactionBoundary: 'Sanitized evidence only.'
    }));
    await symlink(outsideInput, join(root, 'blocked-goal-recovery-input.json'), 'file');

    const result = await callHardeningTool('create_blocked_goal_recovery', { inputDir: root });

    expect(result.isError).toBe(true);
    expect(result.structuredContent).toEqual({
      error: 'Input artifact must resolve within inputDir: blocked-goal-recovery-input.json'
    });
    await expect(readFile(join(root, 'blocked-goal-recovery-package.json'), 'utf8')).rejects.toMatchObject({
      code: 'ENOENT'
    });
  });

  it('rejects existing output artifact symlinks without changing their targets', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-mcp-output-link-'));
    const outside = await mkdtemp(join(tmpdir(), 'repoassure-mcp-output-target-'));
    const sentinel = join(outside, 'sentinel.json');
    await writeFile(sentinel, 'do-not-change');
    await writeFile(join(root, 'blocked-goal-recovery-input.json'), JSON.stringify({
      sourceGoal: { title: 'Output link attack', status: 'blocked', objective: 'Reject link.', evidenceRefs: [] },
      sourceLogs: [], blockers: [], resumeCommands: [], redactionBoundary: 'Local only.'
    }));
    await symlink(sentinel, join(root, 'blocked-goal-recovery-package.json'), 'file');

    const result = await callHardeningTool('create_blocked_goal_recovery', { inputDir: root });

    expect(result.isError).toBe(true);
    expect(result.structuredContent).toEqual({
      error: 'Output artifact must not be a symbolic link: blocked-goal-recovery-package.json'
    });
    await expect(readFile(sentinel, 'utf8')).resolves.toBe('do-not-change');
  });

  it('rejects non-string recovery directories before reading artifacts', async () => {
    const result = await callHardeningTool('create_blocked_goal_recovery', {
      inputDir: '.', outputDir: 42
    });

    expect(result.isError).toBe(true);
    expect(result.structuredContent).toEqual({ error: 'Invalid optional string argument: outputDir' });
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

  it('redacts structured credential values regardless of their JSON type without erasing governance fields', () => {
    expect(redactMcpStructuredContent({
      apiKeys: ['first', 'second'],
      token: 12345,
      authorization: { value: 'opaque' },
      authorizationStatus: 'approved',
      nonAuthorizationBoundary: 'This is evidence, not authorization.',
      sessionId: 'local-session-reference'
    })).toEqual({
      apiKeys: '[REDACTED]',
      token: '[REDACTED]',
      authorization: '[REDACTED]',
      authorizationStatus: 'approved',
      nonAuthorizationBoundary: 'This is evidence, not authorization.',
      sessionId: 'local-session-reference'
    });
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
