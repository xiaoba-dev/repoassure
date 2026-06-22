import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { generateRepairPlan as packageGenerateRepairPlan } from '../../packages/repair-planner/src/generate-repair-plan.js';
import { generateRepairPlan as legacyGenerateRepairPlan } from '../../src/domain/repair-plan/generate-repair-plan.js';

async function createRunDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), 'hardening-repair-plan-'));
}

describe('generateRepairPlan', () => {
  it('keeps package-owned and legacy repair plan generators aligned', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-repair-parity-repo-'));
    const runDir = await createRunDir();
    const sourceManifestPath = join(repoRoot, 'manifest.json');

    const findings = JSON.stringify({
      findings: [
        {
          severity: 'P1',
          type: 'dead_control',
          title: 'Submit button does nothing',
          reproSteps: ['Go to /settings', 'click Save changes'],
          evidence: ['console: TypeError token=secret-token']
        }
      ]
    });
    const testGeneration = JSON.stringify({
      createdFiles: ['tests/hardening/generated-settings.spec.ts'],
      testCommand: 'npx playwright test tests/hardening/generated-settings.spec.ts --reporter=line',
      validationStatus: 'passed',
      errors: []
    });
    const bootResult = JSON.stringify({
      status: 'running',
      url: 'http://localhost:4173/settings?code=secret-code',
      blockers: [],
      errors: []
    });

    await Promise.all([
      writeFile(join(runDir, 'findings.json'), findings),
      writeFile(join(runDir, 'test-generation.json'), testGeneration),
      writeFile(join(runDir, 'boot-result.json'), bootResult)
    ]);

    const legacyResult = await legacyGenerateRepairPlan({
      repoRoot,
      runDir,
      sourceManifestPath,
      runId: 'run-parity',
      outputJsonPath: join(runDir, 'legacy-repair-plan.json'),
      outputMarkdownPath: join(runDir, 'legacy-repair-plan.md'),
      outputTaskPackageJsonPath: join(runDir, 'legacy-repair-task-package.json'),
      outputTaskPackageMarkdownPath: join(runDir, 'legacy-repair-task-package.md')
    });
    const packageResult = await packageGenerateRepairPlan({
      repoRoot,
      runDir,
      sourceManifestPath,
      runId: 'run-parity',
      outputJsonPath: join(runDir, 'package-repair-plan.json'),
      outputMarkdownPath: join(runDir, 'package-repair-plan.md'),
      outputTaskPackageJsonPath: join(runDir, 'package-repair-task-package.json'),
      outputTaskPackageMarkdownPath: join(runDir, 'package-repair-task-package.md')
    });
    const legacyPlan = normalizeGeneratedAt(JSON.parse(await readFile(legacyResult.repairPlanPath, 'utf8')) as Record<string, unknown>);
    const packagePlan = normalizeGeneratedAt(JSON.parse(await readFile(packageResult.repairPlanPath, 'utf8')) as Record<string, unknown>);
    const legacyTaskPackage = normalizeGeneratedAt(JSON.parse(await readFile(legacyResult.repairTaskPackagePath, 'utf8')) as Record<string, unknown>);
    const packageTaskPackage = normalizeGeneratedAt(JSON.parse(await readFile(packageResult.repairTaskPackagePath, 'utf8')) as Record<string, unknown>);

    expect(packageResult).toMatchObject({
      taskCount: legacyResult.taskCount,
      highestSeverity: legacyResult.highestSeverity,
      recommendedNextTaskId: legacyResult.recommendedNextTaskId
    });
    expect(packagePlan).toEqual(legacyPlan);
    expect(packageTaskPackage).toEqual(legacyTaskPackage);
    await expect(readFile(packageResult.repairPlanMarkdownPath, 'utf8')).resolves.toContain('p1-dead-control-submit-button-does-nothing');
    await expect(readFile(packageResult.repairTaskPackageMarkdownPath, 'utf8')).resolves.toContain('Executable Repair Task Package');
  });

  it('generates deterministic JSON and markdown repair plans from findings', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-repair-repo-'));
    const runDir = await createRunDir();
    const sourceManifestPath = join(runDir, 'manifest.json');

    await writeFile(
      join(runDir, 'findings.json'),
      JSON.stringify({
        findings: [
          {
            severity: 'P1',
            type: 'network_error',
            title: 'GET /api/skills fails with API_KEY=sk-live-secret',
            reproSteps: ['Go to /arena', 'Trigger skills panel'],
            evidence: ['request: GET /api/skills 500 token=url-secret']
          },
          {
            severity: 'P0',
            type: 'white_screen',
            title: 'Dashboard white screen',
            reproSteps: ['Go to /dashboard'],
            evidence: ['screenshot: dashboard.png']
          }
        ]
      })
    );
    await writeFile(
      join(runDir, 'test-generation.json'),
      JSON.stringify({
        createdFiles: ['tests/hardening/generated-findings.spec.ts'],
        testCommand: 'npx playwright test tests/hardening/generated-findings.spec.ts --reporter=line',
        validationStatus: 'passed',
        errors: []
      })
    );
    await writeFile(
      join(runDir, 'boot-result.json'),
      JSON.stringify({
        status: 'running',
        url: 'http://localhost:5173/dashboard?code=oauth-secret',
        blockers: [],
        errors: []
      })
    );

    const first = await legacyGenerateRepairPlan({ repoRoot, runDir, sourceManifestPath, runId: 'run-fixed' });
    const second = await legacyGenerateRepairPlan({ repoRoot, runDir, sourceManifestPath, runId: 'run-fixed' });
    const planText = await readFile(first.repairPlanPath, 'utf8');
    const markdown = await readFile(first.repairPlanMarkdownPath, 'utf8');
    const plan = JSON.parse(planText) as {
      schemaVersion: number;
      runId: string;
      repoRoot: string;
      sourceManifest: string;
      summary: { totalTasks: number; p0: number; p1: number; p2: number };
      tasks: Array<{
        taskId: string;
        severity: string;
        title: string;
        evidence: Array<{ type: string; path: string; summary: string }>;
        targetAreas: Array<{ kind: string; value: string }>;
        verification: { commands: string[]; generatedTests: string[] };
        agentPrompt: string;
      }>;
    };
    const taskPackage = JSON.parse(await readFile(first.repairTaskPackagePath, 'utf8')) as {
      schemaVersion: number;
      tasks: Array<{
        taskId: string;
        objective: string;
        context: { rootCauseHypothesis: string };
        recommendedFix: {
          expectedOutcome: string;
          changeScope: { include: string[]; exclude: string[] };
          implementationSteps: string[];
        };
        verification: { acceptanceCriteria: string[]; commands: string[] };
        handoffPrompt: string;
      }>;
    };
    const taskPackageMarkdown = await readFile(first.repairTaskPackageMarkdownPath, 'utf8');

    expect(first.taskCount).toBe(2);
    expect(first.highestSeverity).toBe('P0');
    expect(first.recommendedNextTaskId).toBe(plan.tasks[0]?.taskId);
    expect(first.repairTaskPackagePath).toBe(join(runDir, 'repair-task-package.json'));
    expect(first.repairTaskPackageMarkdownPath).toBe(join(runDir, 'repair-task-package.md'));
    expect(second.recommendedNextTaskId).toBe(first.recommendedNextTaskId);
    expect(plan).toMatchObject({
      schemaVersion: 1,
      runId: 'run-fixed',
      repoRoot,
      sourceManifest: sourceManifestPath,
      summary: { totalTasks: 2, p0: 1, p1: 1, p2: 0 }
    });
    expect(plan.tasks.map((task) => task.severity)).toEqual(['P0', 'P1']);
    expect(plan.tasks[0]?.taskId).toBe('p0-white-screen-dashboard-white-screen');
    expect(plan.tasks[0]?.targetAreas).toContainEqual({ kind: 'route', value: '/dashboard' });
    expect(plan.tasks[0]?.verification.generatedTests).toEqual(['tests/hardening/generated-findings.spec.ts']);
    expect(plan.tasks[0]?.verification.commands[0]).toContain('HARDENING_BASE_URL=');
    expect(plan.tasks[0]?.agentPrompt).toContain('最小改动');
    expect(planText).toContain('code=[REDACTED]');
    expect(planText).toContain('API_KEY=[REDACTED]');
    expect(planText).toContain('token=[REDACTED]');
    expect(planText).not.toContain('oauth-secret');
    expect(planText).not.toContain('sk-live-secret');
    expect(planText).not.toContain('url-secret');
    expect(markdown).toContain('# Repair Plan');
    expect(markdown).toContain('p0-white-screen-dashboard-white-screen');
    expect(taskPackage.schemaVersion).toBe(1);
    expect(taskPackage.tasks[0]?.taskId).toBe('p0-white-screen-dashboard-white-screen');
    expect(taskPackage.tasks[0]?.objective).toContain('修复 P0 问题');
    expect(taskPackage.tasks[0]?.recommendedFix.expectedOutcome).toContain('不再复现该问题');
    expect(taskPackage.tasks[0]?.recommendedFix.changeScope.exclude).toContain('不要扩大到无关重构、格式化全仓代码或改变非相关业务行为。');
    expect(taskPackage.tasks[0]?.recommendedFix.implementationSteps).toContain('确认 acceptanceCriteria 全部满足后，再提交修复说明。');
    expect(taskPackage.tasks[0]?.verification.acceptanceCriteria.join('\n')).toContain('不再出现在重新生成的 findings 中');
    expect(taskPackage.tasks[0]?.handoffPrompt).toContain('你是接手目标 repo 的修复 Agent');
    expect(taskPackageMarkdown).toContain('# Executable Repair Task Package');
    expect(taskPackageMarkdown).toContain('### Handoff Prompt');
  });

  it('generates a no-op plan when no findings exist', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-repair-empty-repo-'));
    const runDir = await createRunDir();
    await mkdir(runDir, { recursive: true });
    await writeFile(join(runDir, 'findings.json'), JSON.stringify({ findings: [] }));
    await writeFile(
      join(runDir, 'test-generation.json'),
      JSON.stringify({ createdFiles: [], testCommand: null, validationStatus: 'skipped', errors: [] })
    );
    await writeFile(join(runDir, 'boot-result.json'), JSON.stringify({ status: 'failed', url: null, blockers: [], errors: [] }));

    const result = await legacyGenerateRepairPlan({
      repoRoot,
      runDir,
      sourceManifestPath: join(runDir, 'manifest.json'),
      runId: 'run-empty'
    });
    const plan = JSON.parse(await readFile(result.repairPlanPath, 'utf8')) as { summary: { totalTasks: number }; tasks: unknown[] };

    expect(result.taskCount).toBe(0);
    expect(result.highestSeverity).toBe(null);
    expect(result.recommendedNextTaskId).toBe(null);
    expect(plan.summary.totalTasks).toBe(0);
    expect(plan.tasks).toEqual([]);
    await expect(readFile(result.repairTaskPackageMarkdownPath, 'utf8')).resolves.toContain('No Executable Repair Tasks');
  });
});

function normalizeGeneratedAt<T extends Record<string, unknown>>(value: T): T {
  return {
    ...value,
    generatedAt: '<generated-at>'
  };
}
