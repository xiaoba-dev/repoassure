import { mkdir, mkdtemp, readFile, readdir, stat, writeFile } from 'node:fs/promises';
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
      'prepare_repair_handoff',
      'preview_repair_execution',
      'generate_repair_patch_plan',
      'assemble_repair_evidence_package',
      'harden_report',
      'run_hardening'
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
    }))).toHaveLength(11);
  });

  it('previews selected repair tasks without running commands or modifying target repository files', async () => {
    const targetRepo = await mkdtemp(join(tmpdir(), 'hardening-mcp-preview-target-'));
    const campaignRoot = await mkdtemp(join(tmpdir(), 'hardening-mcp-preview-campaign-'));
    const packagePath = join(campaignRoot, 'repair-handoff-package.json');
    const outputDir = join(campaignRoot, 'preview');
    const sourcePath = join(targetRepo, 'src', 'index.js');
    const commandMarkerPath = join(targetRepo, 'verification-command-ran.txt');

    await mkdir(join(targetRepo, 'src'), { recursive: true });
    await writeFile(sourcePath, 'export const untouched = true;\n');
    await writeRepairPreviewPackage(packagePath, targetRepo, commandMarkerPath);
    const beforeSource = await readFile(sourcePath, 'utf8');
    const beforeStat = await stat(sourcePath);
    const beforeEntries = await readdir(targetRepo, { recursive: true });

    const result = await callHardeningTool('preview_repair_execution', {
      packagePath,
      taskIds: ['repair-task-1'],
      outputDir
    });

    expect(result.isError).toBe(false);
    expect(result.structuredContent).toEqual({
      reportPath: join(outputDir, 'repair-execution-report.json'),
      markdownPath: join(outputDir, 'repair-execution-report.md'),
      taskCount: 1,
      status: 'planned'
    });
    expect(JSON.parse(String(result.content[0]?.type === 'text' ? result.content[0].text : ''))).toEqual(
      result.structuredContent
    );
    await expect(readFile(join(outputDir, 'repair-execution-report.json'), 'utf8')).resolves.toContain(
      '"mode": "dry-run"'
    );
    await expect(readFile(join(outputDir, 'repair-execution-report.json'), 'utf8')).resolves.toContain(
      '"verificationCommands": 0'
    );
    await expect(readFile(join(outputDir, 'repair-execution-report.md'), 'utf8')).resolves.toContain(
      'Maintainer Review Boundary'
    );
    await expect(stat(commandMarkerPath)).rejects.toMatchObject({
      code: 'ENOENT'
    });
    await expect(readFile(sourcePath, 'utf8')).resolves.toBe(beforeSource);
    expect((await stat(sourcePath)).mtimeMs).toBe(beforeStat.mtimeMs);
    expect(await readdir(targetRepo, { recursive: true })).toEqual(beforeEntries);
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
      expect(result.structuredContent).toEqual({
        error: testCase.error
      });
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
    expect(tools.filter((tool) => tool.name !== 'generate_repair_patch_plan')).toHaveLength(11);
  });

  it('generates a bounded repair patch plan without running commands or modifying target repository files', async () => {
    const targetRepo = await mkdtemp(join(tmpdir(), 'hardening-mcp-patch-target-'));
    const campaignRoot = await mkdtemp(join(tmpdir(), 'hardening-mcp-patch-campaign-'));
    const packagePath = join(campaignRoot, 'repair-handoff-package.json');
    const previewDir = join(campaignRoot, 'preview');
    const patchDir = join(campaignRoot, 'patch-plan');
    const sourcePath = join(targetRepo, 'src', 'index.js');
    const commandMarkerPath = join(targetRepo, 'verification-command-ran.txt');

    await mkdir(join(targetRepo, 'src'), { recursive: true });
    await writeFile(sourcePath, 'export const untouched = true;\n');
    await writeRepairPreviewPackage(packagePath, targetRepo, commandMarkerPath);

    const preview = await callHardeningTool('preview_repair_execution', {
      packagePath,
      all: true,
      outputDir: previewDir
    });
    expect(preview.isError).toBe(false);

    const beforeSource = await readFile(sourcePath, 'utf8');
    const beforeStat = await stat(sourcePath);
    const beforeEntries = await readdir(targetRepo, { recursive: true });
    const result = await callHardeningTool('generate_repair_patch_plan', {
      reportPath: join(previewDir, 'repair-execution-report.json'),
      outputDir: patchDir
    });

    expect(result.isError).toBe(false);
    expect(result.structuredContent).toEqual({
      planPath: join(patchDir, 'patch-plan.json'),
      markdownPath: join(patchDir, 'patch-plan.md'),
      actionCount: 1,
      autoFixCandidates: 0,
      status: 'review_required'
    });
    expect(JSON.parse(String(result.content[0]?.type === 'text' ? result.content[0].text : ''))).toEqual(
      result.structuredContent
    );

    const patchPlan = JSON.parse(await readFile(join(patchDir, 'patch-plan.json'), 'utf8')) as {
      maintainerReview: unknown;
      verificationChecklist: unknown;
      noWriteProof: unknown;
    };
    expect(patchPlan.maintainerReview).toBeDefined();
    expect(patchPlan.verificationChecklist).toBeDefined();
    expect(patchPlan.noWriteProof).toMatchObject({
      targetRepoWriteAuthorized: false,
      patchesApplied: false
    });
    await expect(readFile(join(patchDir, 'patch-plan.md'), 'utf8')).resolves.toContain(
      'Maintainer Review'
    );
    await expect(readFile(join(patchDir, 'patch-plan.md'), 'utf8')).resolves.toContain(
      'Verification Checklist'
    );
    await expect(stat(commandMarkerPath)).rejects.toMatchObject({
      code: 'ENOENT'
    });
    await expect(readFile(sourcePath, 'utf8')).resolves.toBe(beforeSource);
    expect((await stat(sourcePath)).mtimeMs).toBe(beforeStat.mtimeMs);
    expect(await readdir(targetRepo, { recursive: true })).toEqual(beforeEntries);
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
      expect(result.structuredContent).toEqual({
        error: testCase.error
      });
    }

    const sensitiveResult = await callHardeningTool('generate_repair_patch_plan', {
      reportPath: join(root, 'token=patch-secret')
    });
    const serialized = JSON.stringify(sensitiveResult);

    expect(sensitiveResult.isError).toBe(true);
    expect(serialized).toContain('token=[REDACTED]');
    expect(serialized).not.toContain('patch-secret');
  });

  it('exposes the additive repair evidence package contract without changing existing tool annotations', () => {
    const tools = listHardeningTools();
    const repairEvidencePackage = tools.find((tool) => tool.name === 'assemble_repair_evidence_package');

    expect(repairEvidencePackage).toMatchObject({
      name: 'assemble_repair_evidence_package',
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false
      },
      inputSchema: {
        type: 'object',
        required: [
          'handoffPackagePath',
          'dryRunReportPath',
          'validationReportPath',
          'patchPlanPath'
        ],
        properties: {
          handoffPackagePath: {
            type: 'string'
          },
          dryRunReportPath: {
            type: 'string'
          },
          validationReportPath: {
            type: 'string'
          },
          patchPlanPath: {
            type: 'string'
          },
          outputDir: {
            type: 'string'
          }
        }
      }
    });
    expect(repairEvidencePackage?.inputSchema.properties).not.toHaveProperty('validationOnly');
    expect(repairEvidencePackage?.inputSchema.properties).not.toHaveProperty('command');
    expect(tools.filter((tool) => tool.name !== 'assemble_repair_evidence_package')).toHaveLength(11);
  });

  it('assembles bounded repair evidence without running validation commands or modifying target repository files', async () => {
    const targetRepo = await mkdtemp(join(tmpdir(), 'hardening-mcp-evidence-target-'));
    const campaignRoot = await mkdtemp(join(tmpdir(), 'hardening-mcp-evidence-campaign-'));
    const packagePath = join(campaignRoot, 'repair-handoff-package.json');
    const previewDir = join(campaignRoot, 'preview');
    const validationDir = join(campaignRoot, 'validation');
    const patchDir = join(campaignRoot, 'patch-plan');
    const evidenceDir = join(campaignRoot, 'evidence-package');
    const sourcePath = join(targetRepo, 'src', 'index.js');
    const commandMarkerPath = join(targetRepo, 'verification-command-ran.txt');

    await mkdir(join(targetRepo, 'src'), { recursive: true });
    await mkdir(validationDir, { recursive: true });
    await writeFile(sourcePath, 'export const untouched = true;\n');
    await writeRepairPreviewPackage(packagePath, targetRepo, commandMarkerPath);

    const preview = await callHardeningTool('preview_repair_execution', {
      packagePath,
      all: true,
      outputDir: previewDir
    });
    expect(preview.isError).toBe(false);

    const dryRunReportPath = join(previewDir, 'repair-execution-report.json');
    const dryRunReport = JSON.parse(await readFile(dryRunReportPath, 'utf8')) as {
      generatedAt: string;
      mode: string;
      status: string;
      summary: Record<string, number>;
      tasks: Array<Record<string, unknown> & { taskId: string }>;
    };
    const validationReportPath = join(validationDir, 'repair-execution-report.json');
    await writeFile(validationReportPath, `${JSON.stringify({
      ...dryRunReport,
      generatedAt: '2026-07-25T08:05:00.000Z',
      mode: 'validation-only',
      status: 'failed',
      summary: {
        ...dryRunReport.summary,
        verificationCommands: 1,
        passed: 0,
        failed: 1,
        skipped: 0
      },
      tasks: dryRunReport.tasks.map((task) => ({
        ...task,
        mode: 'validation-only',
        executionStatus: 'failed',
        verificationResults: [
          {
            taskId: task.taskId,
            command: `node -e "require('node:fs').writeFileSync('${commandMarkerPath}', 'ran')"`,
            exitCode: 1,
            timedOut: false,
            stdout: '',
            stderr: 'fixture evidence only; command was not executed'
          }
        ]
      }))
    }, null, 2)}\n`);

    const patchPlan = await callHardeningTool('generate_repair_patch_plan', {
      reportPath: validationReportPath,
      outputDir: patchDir
    });
    expect(patchPlan.isError).toBe(false);

    const beforeSource = await readFile(sourcePath, 'utf8');
    const beforeStat = await stat(sourcePath);
    const beforeEntries = await readdir(targetRepo, { recursive: true });
    const result = await callHardeningTool('assemble_repair_evidence_package', {
      handoffPackagePath: packagePath,
      dryRunReportPath,
      validationReportPath,
      patchPlanPath: join(patchDir, 'patch-plan.json'),
      outputDir: evidenceDir
    });

    expect(result.isError, JSON.stringify(result)).toBe(false);
    expect(result.structuredContent).toEqual({
      packagePath: join(evidenceDir, 'ai-ide-repair-evidence-package.json'),
      markdownPath: join(evidenceDir, 'ai-ide-repair-evidence-package.md'),
      taskCount: 1,
      status: 'review_required'
    });
    expect(JSON.parse(String(result.content[0]?.type === 'text' ? result.content[0].text : ''))).toEqual(
      result.structuredContent
    );

    const evidencePackage = JSON.parse(
      await readFile(join(evidenceDir, 'ai-ide-repair-evidence-package.json'), 'utf8')
    ) as {
      maintainerReview: unknown;
      verificationChecklist: unknown;
      noWriteProof: unknown;
    };
    expect(evidencePackage.maintainerReview).toBeDefined();
    expect(evidencePackage.verificationChecklist).toBeDefined();
    expect(evidencePackage.noWriteProof).toMatchObject({
      targetRepoWriteAuthorized: false,
      sourceFilesChanged: false,
      patchesApplied: false
    });
    await expect(readFile(join(evidenceDir, 'ai-ide-repair-evidence-package.md'), 'utf8')).resolves.toContain(
      'Maintainer Review'
    );
    await expect(readFile(join(evidenceDir, 'ai-ide-repair-evidence-package.md'), 'utf8')).resolves.toContain(
      'Verification Checklist'
    );
    await expect(stat(commandMarkerPath)).rejects.toMatchObject({
      code: 'ENOENT'
    });
    await expect(readFile(sourcePath, 'utf8')).resolves.toBe(beforeSource);
    expect((await stat(sourcePath)).mtimeMs).toBe(beforeStat.mtimeMs);
    expect(await readdir(targetRepo, { recursive: true })).toEqual(beforeEntries);
  });

  it('fails closed for missing, unsupported, or sensitive repair evidence package inputs', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-mcp-evidence-error-'));
    const validPaths = {
      handoffPackagePath: '/tmp/repair-handoff-package.json',
      dryRunReportPath: '/tmp/repair-execution-dry-run.json',
      validationReportPath: '/tmp/repair-execution-validation.json',
      patchPlanPath: '/tmp/patch-plan.json'
    };
    const cases = [
      {
        args: {},
        error: 'Missing required string argument: handoffPackagePath'
      },
      {
        args: { ...validPaths, validationOnly: true },
        error: 'Unsupported argument for assemble_repair_evidence_package: validationOnly'
      },
      {
        args: { ...validPaths, command: 'pnpm test' },
        error: 'Unsupported argument for assemble_repair_evidence_package: command'
      },
      {
        args: { ...validPaths, apply: true },
        error: 'Unsupported argument for assemble_repair_evidence_package: apply'
      }
    ];

    for (const testCase of cases) {
      const result = await callHardeningTool('assemble_repair_evidence_package', testCase.args);

      expect(result.isError).toBe(true);
      expect(result.structuredContent).toEqual({
        error: testCase.error
      });
    }

    const sensitiveResult = await callHardeningTool('assemble_repair_evidence_package', {
      ...validPaths,
      handoffPackagePath: join(root, 'token=evidence-secret')
    });
    const serialized = JSON.stringify(sensitiveResult);

    expect(sensitiveResult.isError).toBe(true);
    expect(serialized).toContain('token=[REDACTED]');
    expect(serialized).not.toContain('evidence-secret');
  });

  it('prepares a bounded repair handoff package without modifying target repository files', async () => {
    const targetRepo = await mkdtemp(join(tmpdir(), 'hardening-mcp-handoff-target-'));
    const campaignRoot = await mkdtemp(join(tmpdir(), 'hardening-mcp-handoff-campaign-'));
    const runDir = join(campaignRoot, 'run-fixed');
    const outputDir = join(campaignRoot, 'handoff');
    const sourcePath = join(targetRepo, 'src', 'index.js');

    await mkdir(join(targetRepo, 'src'), { recursive: true });
    await mkdir(runDir, { recursive: true });
    await writeFile(sourcePath, 'export const untouched = true;\n');
    await writeFile(join(runDir, 'manifest.json'), JSON.stringify({
      schemaVersion: 1,
      mode: 'cli',
      runId: 'run-fixed',
      repoRoot: targetRepo,
      artifacts: {
        repairTaskPackagePath: join(runDir, 'repair-task-package.json')
      },
      commandResults: [
        {
          command: 'ruff',
          args: ['check', '.'],
          exitCode: 1,
          stdout: 'Found 1 error',
          stderr: '',
          timedOut: false
        }
      ]
    }));
    const beforeSource = await readFile(sourcePath, 'utf8');
    const beforeStat = await stat(sourcePath);
    const beforeEntries = await readdir(targetRepo, { recursive: true });

    const result = await callHardeningTool('prepare_repair_handoff', {
      runDir,
      outputDir
    });

    expect(result.isError).toBe(false);
    expect(result.structuredContent).toEqual({
      packagePath: join(outputDir, 'repair-handoff-package.json'),
      markdownPath: join(outputDir, 'repair-handoff-package.md'),
      verificationPlanPath: join(outputDir, 'verification-plan.md'),
      taskCount: 1,
      highestPriority: 'P1',
      status: 'generated'
    });
    expect(JSON.parse(String(result.content[0]?.type === 'text' ? result.content[0].text : ''))).toEqual(
      result.structuredContent
    );
    await expect(readFile(join(outputDir, 'repair-handoff-package.json'), 'utf8')).resolves.toContain(
      '"maintainerReview"'
    );
    await expect(readFile(join(outputDir, 'verification-plan.md'), 'utf8')).resolves.toContain(
      'ruff check .'
    );
    await expect(readFile(sourcePath, 'utf8')).resolves.toBe(beforeSource);
    expect((await stat(sourcePath)).mtimeMs).toBe(beforeStat.mtimeMs);
    expect(await readdir(targetRepo, { recursive: true })).toEqual(beforeEntries);
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

async function writeRepairPreviewPackage(
  packagePath: string,
  repoRoot: string,
  commandMarkerPath: string
): Promise<void> {
  await writeFile(packagePath, `${JSON.stringify({
    schemaVersion: 1,
    generatedAt: '2026-07-25T13:00:00.000+08:00',
    mode: 'cli',
    runId: 'run-preview',
    repoRoot,
    runDir: join(repoRoot, '.hardening', 'runs', 'run-preview'),
    summary: {
      totalTasks: 1,
      failedCommands: 1,
      requiredFailed: 0,
      requiredBlocked: 0,
      highestPriority: 'P1'
    },
    agentContract: {
      schema: 'repoassure.repair-handoff.v1',
      primaryReadPath: 'repair-handoff-package.json',
      readOrder: ['repairActionQueue', 'tasks', 'maintainerReview', 'verificationChecklist'],
      maintainerReviewBoundary: {
        requiredBefore: ['changing target repository files'],
        allowedDecisions: ['approve', 'reject', 'defer', 'accept_risk']
      },
      nextCommands: {
        dryRun: 'hardening repair execute --dry-run',
        validationOnly: 'hardening repair execute --validation-only',
        patchPlan: 'hardening repair patch-plan'
      },
      boundaries: ['No target repository writes.']
    },
    maintainerReview: {
      requiredBefore: ['changing target repository files'],
      allowedDecisions: ['approve', 'reject', 'defer', 'accept_risk']
    },
    verificationChecklist: {
      commands: [`node -e "require('node:fs').writeFileSync('${commandMarkerPath}', 'executed')"`],
      acceptanceCriteria: ['verification command exits zero'],
      completionSignals: ['Maintainer review is recorded before target repository writes.']
    },
    repairActionQueue: [
      {
        taskId: 'repair-task-1',
        priority: 'P1',
        status: 'queued',
        objective: 'Preview one bounded repair task.',
        sourceType: 'command_failure',
        verificationCommands: [
          `node -e "require('node:fs').writeFileSync('${commandMarkerPath}', 'executed')"`
        ],
        requiresMaintainerReview: true
      }
    ],
    tasks: [
      {
        taskId: 'repair-task-1',
        priority: 'P1',
        sourceType: 'command_failure',
        objective: 'Preview one bounded repair task.',
        evidence: {
          sourceArtifacts: {
            source: join(repoRoot, 'src', 'index.js')
          }
        },
        verification: {
          commands: [`node -e "require('node:fs').writeFileSync('${commandMarkerPath}', 'executed')"`],
          acceptanceCriteria: ['verification command exits zero']
        },
        handoffPrompt: 'Review this task without applying changes.'
      }
    ]
  }, null, 2)}\n`);
}
