import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildPatchPlan,
  formatPatchPlanMarkdown,
  parseRepairPatchPlanArgs,
  runRepairPatchPlan
} from '../../packages/acceptance/src/run-repair-patch-plan.js';
import type { RepairExecutionReport } from '../../packages/acceptance/src/run-repair-execute.js';

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
        failed: 'At least one selected verification command failed or timed out.'
      },
      nextCommands: {
        patchPlan: 'pnpm repair:patch-plan -- --report <repair-execution-report.json>'
      },
      boundaries: ['Validation-only mode does not modify target repository files.']
    },
    tasks: [
      {
        taskId: 'pycli-failed-ruff-check',
        priority: 'P1',
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
        validate: 'pnpm repair:execute -- --package <repair-handoff-package.json> --task <taskId> --validation-only'
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
});
