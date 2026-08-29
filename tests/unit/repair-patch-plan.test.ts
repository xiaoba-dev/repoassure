import { mkdir, mkdtemp, readFile, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildPatchPlan,
  formatPatchPlanMarkdown,
  parseRepairPatchPlanArgs,
  runRepairPatchPlan
} from '../../packages/acceptance/src/run-repair-patch-plan.js';
import { runRepairExecute, type RepairExecutionReport } from '../../packages/acceptance/src/run-repair-execute.js';
import { runRepairHandoff, type RepairHandoffPackage } from '../../packages/acceptance/src/run-repair-handoff.js';

function buildExecutionReport(): RepairExecutionReport {
  return {
    schemaVersion: 1,
    generatedAt: '2026-06-21T10:00:00.000Z',
    mode: 'validation-only',
    status: 'failed',
    packagePath: '/tmp/agent-reach/repair-handoff-package.json',
    repoRoot: '/tmp/agent-reach',
    runId: 'run-fixed',
    summary: {
      selectedTasks: 2,
      verificationCommands: 2,
      passed: 0,
      failed: 2,
      skipped: 0
    },
    agentContract: {
      schema: 'repoassure.repair-execution-report.v1',
      readOrder: ['status', 'summary', 'tasks[]', 'tasks[].verificationResults'],
      resultSemantics: {
        planned: 'No verification commands were run.',
        passed: 'All selected verification commands exited zero.',
        failed: 'At least one selected verification command failed or timed out.',
        skipped: 'A selected task had no runnable verification command in this local context.'
      },
      nextCommands: {
        patchPlan: 'hardening repair patch-plan --report <repair-execution-report.json>'
      },
      boundaries: ['Validation-only mode does not modify target repository files.']
    },
    executionPlan: {
      readOrder: ['summary', 'executionPlan', 'patchPreview', 'tasks[]'],
      steps: ['Review selected repairActionQueue tasks before any code change.']
    },
    patchPreview: {
      status: 'preview_only',
      candidateTasks: [
        { taskId: 'pycli-failed-ruff-check', sourceType: 'command_failure', expectedFiles: ['agent_reach/channels/__init__.py'] },
        { taskId: 'pycli-failed-mypy', sourceType: 'command_failure', expectedFiles: ['agent_reach/cookie_extract.py', 'agent_reach/probe.py'] }
      ]
    },
    maintainerReview: {
      requiredBefore: ['changing target repository files'],
      allowedDecisions: ['approve', 'reject', 'defer', 'accept_risk']
    },
    verificationChecklist: {
      commands: ['ruff check .', 'mypy .'],
      completionSignals: ['Maintainer review decision is recorded before any target repo write.']
    },
    noWriteProof: {
      targetRepoWriteAuthorized: false,
      sourceFilesChanged: false,
      prohibitedActions: ['changing target repository files']
    },
    tasks: [
      {
        taskId: 'pycli-failed-ruff-check',
        priority: 'P1',
        sourceType: 'command_failure',
        objective: '修复失败命令：ruff check .',
        executionStatus: 'failed',
        mode: 'validation-only',
        verificationCommands: ['ruff check .'],
        handoffPrompt: 'Fix ruff',
        nextAction: 'Use failed verification output.',
        verificationResults: [
          {
            taskId: 'pycli-failed-ruff-check',
            command: 'ruff check .',
            exitCode: 1,
            timedOut: false,
            stdout: 'I001 [*] Import block is un-sorted or un-formatted --> agent_reach/channels/__init__.py:6:1 Found 46 errors',
            stderr: ''
          }
        ]
      },
      {
        taskId: 'pycli-failed-mypy',
        priority: 'P1',
        sourceType: 'command_failure',
        objective: '修复失败命令：mypy .',
        executionStatus: 'failed',
        mode: 'validation-only',
        verificationCommands: ['mypy .'],
        handoffPrompt: 'Fix mypy',
        nextAction: 'Use failed verification output.',
        verificationResults: [
          {
            taskId: 'pycli-failed-mypy',
            command: 'mypy .',
            exitCode: 1,
            timedOut: false,
            stdout: '',
            stderr: [
              'agent_reach/cookie_extract.py:126: error: Value of type "object" is not indexable [index]',
              'agent_reach/probe.py:76: error: Incompatible return value type (got "ProbeResult | None", expected "ProbeResult") [return-value]',
              'agent_reach/channels/xueqiu.py:88: error: "CookieJar" has no attribute "set" [attr-defined]'
            ].join('\n')
          }
        ]
      }
    ]
  };
}

describe('repair patch plan', () => {
  it('classifies failed verification evidence into reviewable patch actions', () => {
    const plan = buildPatchPlan({
      generatedAt: '2026-06-21T11:00:00.000Z',
      executionReportPath: '/tmp/repair-execution-report.json',
      report: buildExecutionReport()
    });

    expect(plan.schemaVersion).toBe(1);
    expect(plan.status).toBe('review_required');
    expect(plan.summary).toEqual({
      totalActions: 4,
      autoFixCandidates: 1,
      manualReviewRequired: 3,
      affectedFiles: 4
    });
    expect(plan.agentContract).toMatchObject({
      schema: 'repoassure.patch-plan.v1',
      applyPolicy: 'manual-review-only',
      nextCommands: {
        validate: 'hardening repair execute --package <repair-handoff-package.json> --task <taskId> --validation-only'
      }
    });
    expect(plan.agentContract.boundaries).toContain('Does not write target repository files.');
    expect(plan.agentContract.reviewWorkflow).toContain('Review each action before applying edits in an AI IDE or editor.');
    expect(plan.actions.map((action) => action.actionType)).toEqual([
      'import-sort',
      'type-fix',
      'type-fix',
      'type-fix'
    ]);
    expect(plan.actions[0]).toMatchObject({
      taskId: 'pycli-failed-ruff-check',
      targetFiles: ['agent_reach/channels/__init__.py'],
      autoFixCandidate: true,
      suggestedCommands: ['ruff check . --fix', 'ruff check .']
    });
    expect(plan.actions[1]).toMatchObject({
      errorCode: 'index',
      targetFiles: ['agent_reach/cookie_extract.py'],
      autoFixCandidate: false
    });
    expect(plan.actions[2]?.rationale).toContain('Optional return');
    expect(formatPatchPlanMarkdown(plan)).toContain('# Patch Plan');
    expect(formatPatchPlanMarkdown(plan)).toContain('agent_reach/channels/__init__.py');
    expect(formatPatchPlanMarkdown(plan)).toContain('Manual review required');
  });

  it('parses patch plan CLI args', () => {
    expect(parseRepairPatchPlanArgs(['--report', '/tmp/repair-execution-report.json'])).toMatchObject({
      reportPath: expect.stringContaining('/tmp/repair-execution-report.json')
    });
    expect(() => parseRepairPatchPlanArgs([])).toThrow('--report <repair-execution-report.json> is required');
  });

  it('writes patch plan artifacts from an execution report', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'hardening-patch-plan-'));
    const reportPath = join(dir, 'repair-execution-report.json');
    const outputDir = join(dir, 'patch-plan');

    await writeFile(reportPath, `${JSON.stringify(buildExecutionReport(), null, 2)}\n`);

    const result = await runRepairPatchPlan({
      reportPath,
      outputDir,
      generatedAt: '2026-06-21T11:00:00.000Z'
    });

    expect(result.actionCount).toBe(4);
    expect(result.autoFixCandidates).toBe(1);
    await expect(readFile(result.planPath, 'utf8')).resolves.toContain('"actionType": "import-sort"');
    await expect(readFile(result.markdownPath, 'utf8')).resolves.toContain('ruff check . --fix');
  });

  it('builds a near-real patch plan from a dry-run execution report without applying patches', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'hardening-patch-plan-campaign-'));
    const targetRepo = join(dir, 'target-repo');
    const sourceFile = join(targetRepo, 'src/auth/password.js');
    const runDir = join(dir, 'runs/campaign-run-001');
    const handoffDir = join(dir, 'handoff');
    const executeDir = join(dir, 'execute');
    const patchPlanDir = join(dir, 'patch-plan');
    const sourceBefore = 'module.exports = { hash: "sha1" };\n';

    await mkdir(join(targetRepo, 'src/auth'), { recursive: true });
    await writeFile(sourceFile, sourceBefore);
    const mtimeBefore = (await stat(sourceFile)).mtimeMs;

    const fixtureManifest = JSON.parse(
      await readFile('fixtures/campaigns/ai-ide-repair-decision-package/manifest.json', 'utf8')
    ) as Record<string, unknown>;
    await mkdir(runDir, { recursive: true });
    await writeFile(
      join(runDir, 'manifest.json'),
      `${JSON.stringify({ ...fixtureManifest, repoRoot: targetRepo }, null, 2)}\n`
    );

    const handoff = await runRepairHandoff({
      runDir,
      outputDir: handoffDir,
      generatedAt: '2026-07-16T13:00:00.000Z'
    });
    const handoffPackage = JSON.parse(await readFile(handoff.packagePath, 'utf8')) as RepairHandoffPackage;
    const taskIds = handoffPackage.repairActionQueue.map((task) => task.taskId);

    const execution = await runRepairExecute({
      packagePath: handoff.packagePath,
      taskIds,
      dryRun: true,
      outputDir: executeDir,
      generatedAt: '2026-07-16T13:05:00.000Z'
    });
    const result = await runRepairPatchPlan({
      reportPath: execution.reportPath,
      outputDir: patchPlanDir,
      generatedAt: '2026-07-16T13:10:00.000Z'
    });

    const plan = JSON.parse(await readFile(result.planPath, 'utf8')) as {
      sourceReportMode: string;
      patchPlanInputs: {
        status: string;
        source: string;
        candidateTasks: Array<{ taskId: string; sourceType: string; expectedFiles: string[]; verificationCommands: string[] }>;
      };
      maintainerReview: { requiredBefore: string[]; allowedDecisions: string[] };
      verificationChecklist: { commands: string[]; completionSignals: string[] };
      noWriteProof: {
        targetRepoWriteAuthorized: boolean;
        patchesApplied: boolean;
        sourceFilesChanged: boolean;
        prohibitedActions: string[];
      };
      agentContract: { readOrder: string[]; applyPolicy: string };
      actions: Array<{ taskId: string; actionType: string; targetFiles: string[]; suggestedCommands: string[]; autoFixCandidate: boolean }>;
    };
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(result.status).toBe('review_required');
    expect(result.actionCount).toBe(taskIds.length);
    expect(result.autoFixCandidates).toBe(0);
    expect(plan.sourceReportMode).toBe('dry-run');
    expect(plan.patchPlanInputs).toMatchObject({
      status: 'inputs_only',
      source: 'patchPreview'
    });
    expect(plan.patchPlanInputs.candidateTasks.map((task) => task.sourceType).sort()).toEqual([
      'acceptance_check_failure',
      'command_failure',
      'command_failure',
      'environment_blocker'
    ].sort());
    expect(plan.patchPlanInputs.candidateTasks.flatMap((task) => task.expectedFiles)).toContain('src/auth/password.js');
    expect(plan.patchPlanInputs.candidateTasks.flatMap((task) => task.verificationCommands)).toContain('pnpm test -- --runInBand');
    expect(plan.actions.every((action) => action.actionType === 'manual-investigation')).toBe(true);
    expect(plan.actions.flatMap((action) => action.targetFiles)).toContain('src/auth/password.js');
    expect(plan.actions.flatMap((action) => action.suggestedCommands)).toContain('pnpm test -- --runInBand');
    expect(plan.actions.every((action) => action.autoFixCandidate === false)).toBe(true);
    expect(plan.maintainerReview.requiredBefore).toContain('changing target repository files');
    expect(plan.verificationChecklist.commands).toContain('pnpm test -- --runInBand');
    expect(plan.noWriteProof).toMatchObject({
      targetRepoWriteAuthorized: false,
      patchesApplied: false,
      sourceFilesChanged: false
    });
    expect(plan.noWriteProof.prohibitedActions).toContain('changing target repository files');
    expect(plan.agentContract.applyPolicy).toBe('manual-review-only');
    expect(plan.agentContract.readOrder).toEqual([
      'status',
      'summary',
      'patchPlanInputs',
      'actions[]',
      'actions[].targetFiles',
      'actions[].recommendedChange',
      'actions[].suggestedCommands',
      'maintainerReview',
      'verificationChecklist',
      'noWriteProof'
    ]);
    expect(markdown).toContain('## Patch Plan Inputs');
    expect(markdown).toContain('## Maintainer Review Boundary');
    expect(markdown).toContain('## Verification Checklist');
    expect(markdown).toContain('## No-write Proof');
    expect(markdown).not.toContain('ghp_real_secret_token');
    expect(markdown).not.toContain('sessionid=private');
    expect(JSON.stringify(plan)).not.toContain('ghp_real_secret_token');
    expect(JSON.stringify(plan)).not.toContain('sessionid=private');
    await expect(readFile(sourceFile, 'utf8')).resolves.toBe(sourceBefore);
    expect((await stat(sourceFile)).mtimeMs).toBe(mtimeBefore);
  });
});
