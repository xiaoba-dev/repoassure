import { createHash } from 'node:crypto';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { inspect } from 'node:util';

import { describe, expect, it } from 'vitest';

import {
  connectRealMcpClient,
  isProcessAlive
} from '../support/real-mcp-client.js';

const recoveryToolNames = [
  'create_blocked_goal_recovery',
  'consume_blocked_goal_recovery',
  'record_blocked_goal_recovery_decision',
  'prepare_blocked_goal_resume_attempt',
  'intake_blocked_goal_resume_evidence',
  'review_blocked_goal_resume_evidence',
  'close_blocked_goal_resume_attempt',
  'validate_blocked_goal_recovery_lifecycle'
] as const;
const MCP_REQUEST_TIMEOUT_MS = 15_000;

describe('real stdio MCP client consumption', () => {
  it('discovers and consumes the reviewed recovery lifecycle through a real child process', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-real-mcp-TOKEN=client-secret-'));
    const connection = await connectRealMcpClient({
      args: [resolve('dist/adapters/mcp/index.js')]
    });
    const pid = connection.pid;

    try {
      const listed = await connection.client.listTools({}, { timeout: MCP_REQUEST_TIMEOUT_MS });
      expect(listed.tools.map((tool) => tool.name)).toEqual(expect.arrayContaining([...recoveryToolNames]));
      expect(connection.client.getInstructions()).toContain('do not execute recovery or resume commands');

      const missing = await connection.client.callTool({
        name: 'consume_blocked_goal_recovery', arguments: { inputDir: root }
      }, undefined, { timeout: MCP_REQUEST_TIMEOUT_MS });
      expect(missing.isError).toBe(true);
      expect(readText(missing)).toBe('Missing input artifact: blocked-goal-recovery-package.json');
      expect(readText(missing)).not.toContain('client-secret');

      await writeJson(root, 'blocked-goal-recovery-input.json', {
        sourceGoal: {
          title: 'Real MCP client fixture', status: 'blocked',
          objective: 'Validate a real stdio client without executing commands.', evidenceRefs: []
        },
        sourceLogs: [], blockers: [],
        resumeCommands: [{ command: 'codex resume goal', purpose: 'Separate reviewed attempt.' }],
        redactionBoundary: 'Sanitized local fixture evidence only.'
      });

      const recovery = await callStage(connection, 'create_blocked_goal_recovery', root);
      expectStage(recovery, 'create_blocked_goal_recovery', 'repoassure.blocked-goal-recovery-package.v1');
      const consumption = await callStage(connection, 'consume_blocked_goal_recovery', root);
      expectStage(consumption, 'consume_blocked_goal_recovery', 'repoassure.blocked-goal-recovery-consumption-report.v1');

      const consumptionText = await readFile(join(root, 'blocked-goal-recovery-consumption-report.json'), 'utf8');
      const consumptionArtifact = JSON.parse(consumptionText) as {
        actionQueue: Array<{ actionKey: string }>;
        resumeCommands: Array<{ commandId: string }>;
      };
      await writeJson(root, 'blocked-goal-recovery-decisions.json', {
        sourceConsumptionReportSha256: sha256(consumptionText),
        decisions: consumptionArtifact.actionQueue.map((item) => ({
          actionKey: item.actionKey, decision: 'approve', evidence: 'Reviewed.', reviewerRole: 'maintainer'
        })),
        resumeCommandDecisions: consumptionArtifact.resumeCommands.map((item) => ({
          commandId: item.commandId, decision: 'approve', evidence: 'Reviewed.', reviewerRole: 'maintainer'
        }))
      });

      const decision = await callStage(connection, 'record_blocked_goal_recovery_decision', root);
      expectStage(decision, 'record_blocked_goal_recovery_decision', 'repoassure.blocked-goal-recovery-decision-receipt.v1');
      const decisionText = await readFile(join(root, 'blocked-goal-recovery-decision-receipt.json'), 'utf8');
      await writeJson(root, 'blocked-goal-recovery-resume-attempt-task-input.json', {
        sourceDecisionReceiptSha256: sha256(decisionText)
      });

      const task = await callStage(connection, 'prepare_blocked_goal_resume_attempt', root);
      expectStage(task, 'prepare_blocked_goal_resume_attempt', 'repoassure.blocked-goal-recovery-resume-attempt-task-package.v1');
      const taskText = await readFile(join(root, 'blocked-goal-recovery-resume-attempt-task-package.json'), 'utf8');
      const taskArtifact = JSON.parse(taskText) as {
        actionTasks: Array<{ actionKey: string }>;
        resumeCommandTasks: Array<{ commandId: string }>;
        verificationChecklist: string[];
      };
      await writeJson(root, 'blocked-goal-recovery-resume-attempt-execution-evidence-input.json', {
        sourceTaskPackageSha256: sha256(taskText),
        attemptId: 'real-client-attempt',
        startedAt: '2026-07-13T10:00:00.000Z', completedAt: '2026-07-13T10:01:00.000Z',
        actionResults: taskArtifact.actionTasks.map((item) => ({
          actionKey: item.actionKey, status: 'passed', summary: 'Passed.', evidenceRefs: ['action.log']
        })),
        resumeCommandResults: taskArtifact.resumeCommandTasks.map((item) => ({
          commandId: item.commandId, status: 'passed', exitCode: 0,
          summary: 'Externally supplied fixture evidence.', evidenceRefs: ['resume.log']
        })),
        verificationResults: taskArtifact.verificationChecklist.map((check) => ({
          checkId: `verification-${sha256(check).slice(0, 16)}`,
          status: 'passed', summary: 'Passed.', evidenceRefs: ['verification.log']
        })),
        boundaryEvidence: {
          unlistedCommandsExecuted: false,
          blockedActionsPreserved: true,
          targetRepoMutationByRepoAssure: false
        },
        redactionBoundary: 'Sanitized local fixture evidence only.'
      });

      const intake = await callStage(connection, 'intake_blocked_goal_resume_evidence', root);
      expectStage(intake, 'intake_blocked_goal_resume_evidence', 'repoassure.blocked-goal-recovery-resume-attempt-execution-evidence-intake.v1');
      const intakeText = await readFile(
        join(root, 'blocked-goal-recovery-resume-attempt-execution-evidence-intake.json'), 'utf8'
      );
      const intakeArtifact = JSON.parse(intakeText) as {
        actionResults: Array<{ actionKey: string }>;
        resumeCommandResults: Array<{ commandId: string }>;
        verificationResults: Array<{ checkId: string }>;
      };
      await writeJson(root, 'blocked-goal-recovery-resume-attempt-evidence-review-decisions.json', {
        sourceEvidenceIntakeSha256: sha256(intakeText),
        decisions: [
          ...intakeArtifact.actionResults.map((item) => `action:${item.actionKey}`),
          ...intakeArtifact.resumeCommandResults.map((item) => `command:${item.commandId}`),
          ...intakeArtifact.verificationResults.map((item) => `verification:${item.checkId}`)
        ].map((evidenceKey) => ({
          evidenceKey, decision: 'accept', evidence: 'Reviewed.', reviewerRole: 'maintainer'
        }))
      });

      const review = await callStage(connection, 'review_blocked_goal_resume_evidence', root);
      expectStage(review, 'review_blocked_goal_resume_evidence', 'repoassure.blocked-goal-recovery-resume-attempt-evidence-review-decision-package.v1');
      const reviewText = await readFile(
        join(root, 'blocked-goal-recovery-resume-attempt-evidence-review-decision-package.json'), 'utf8'
      );
      await writeJson(root, 'blocked-goal-recovery-resume-attempt-closure-input.json', {
        sourceEvidenceReviewPackageSha256: sha256(reviewText),
        closureEvidence: 'Real client fixture closure reviewed.',
        reviewerRole: 'maintainer', acknowledgedRiskEvidenceKeys: []
      });

      const closure = await callStage(connection, 'close_blocked_goal_resume_attempt', root);
      expectStage(closure, 'close_blocked_goal_resume_attempt', 'repoassure.blocked-goal-recovery-resume-attempt-closure-receipt.v1');

      await writeJson(root, 'blocked-goal-recovery-lifecycle-campaign-input.json', {
        schemaVersion: 'repoassure.blocked-goal-recovery-lifecycle-campaign-input.v1',
        campaignId: 'real-client-incomplete-campaign',
        scenarios: [{ scenarioId: 'accepted', expectedOutcome: 'accepted', artifactDir: '.' }]
      });
      const lifecycleError = await connection.client.callTool({
        name: 'validate_blocked_goal_recovery_lifecycle', arguments: { inputDir: root }
      }, undefined, { timeout: MCP_REQUEST_TIMEOUT_MS });
      expect(lifecycleError.isError).toBe(true);
      expect(readText(lifecycleError)).toBe('Invalid blocked goal recovery lifecycle campaign input');

      const expanded = await connection.client.callTool({
        name: 'create_blocked_goal_recovery',
        arguments: { inputDir: root, command: 'codex resume goal' }
      }, undefined, { timeout: MCP_REQUEST_TIMEOUT_MS });
      expect(expanded.isError).toBe(true);
      expect(readText(expanded)).toContain('Unexpected argument: command');
      expect(connection.stderr()).toBe('');
    } finally {
      await connection.close();
    }

    expect(isProcessAlive(pid)).toBe(false);
  }, 60_000);

  it('captures a redacted fatal stderr message when the server exits before initialization', async () => {
    let caught: Error | null = null;
    try {
      await connectRealMcpClient({
        args: [resolve('tests/fixtures/mcp-redacted-early-exit.mjs')],
        connectTimeoutMs: 2_000
      });
    } catch (error) {
      caught = error as Error;
    }

    expect(caught?.message).toContain('API_KEY=[REDACTED]');
    expect(inspect(caught, { depth: null })).not.toContain('early-exit-secret');
    expect(caught?.message).not.toContain('discarded-stderr-prefix');
    expect(caught?.message.length).toBeLessThanOrEqual(64 * 1024 + 256);
  });

  it('times out and terminates a non-responsive stdio child deterministically', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-real-mcp-timeout-'));
    const pidPath = join(root, 'child.pid');
    const environmentPath = join(root, 'environment.txt');
    process.env.REPOASSURE_TEST_SECRET = 'must-not-reach-child';
    const startedAt = Date.now();
    try {
      await expect(connectRealMcpClient({
        args: [
          '-e',
          "const fs=require('node:fs'); fs.writeFileSync(process.argv[1],String(process.pid)); fs.writeFileSync(process.argv[2],process.env.REPOASSURE_TEST_SECRET?'inherited':'absent'); process.stdin.resume()",
          pidPath,
          environmentPath
        ],
        connectTimeoutMs: 2_000
      })).rejects.toThrow(/timed out|timeout/iu);
    } finally {
      delete process.env.REPOASSURE_TEST_SECRET;
    }
    expect(Date.now() - startedAt).toBeLessThan(10_000);
    const pid = Number(await readFile(pidPath, 'utf8'));
    expect(isProcessAlive(pid)).toBe(false);
    await expect(readFile(environmentPath, 'utf8')).resolves.toBe('absent');
  }, 15_000);
});

type RealConnection = Awaited<ReturnType<typeof connectRealMcpClient>>;
type ToolResult = Awaited<ReturnType<RealConnection['client']['callTool']>>;

async function callStage(connection: RealConnection, name: string, inputDir: string): Promise<ToolResult> {
  return connection.client.callTool(
    { name, arguments: { inputDir } },
    undefined,
    { timeout: MCP_REQUEST_TIMEOUT_MS }
  );
}

function expectStage(result: ToolResult, toolName: string, outputSchemaVersion: string): void {
  expect(result.isError).not.toBe(true);
  const structured = readRecord(result.structuredContent);
  expect(structured).toMatchObject({
    schemaVersion: 'repoassure.mcp-blocked-goal-recovery-tool-result.v1',
    toolName,
    output: { schemaVersion: outputSchemaVersion },
    boundaryCompliance: {
      commandsExecuted: false, externalStateChanged: false, targetRepoMutation: false
    }
  });
  expect(JSON.parse(readText(result))).toEqual(structured);
}

function readText(result: ToolResult): string {
  const item = readArray(result.content)
    .map((entry) => readRecord(entry))
    .find((entry) => entry.type === 'text');
  if (!item || typeof item.text !== 'string') throw new Error('Expected MCP text content');
  return item.text;
}

function readRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected object');
  return value as Record<string, unknown>;
}

function readArray(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new Error('Expected array');
  return value;
}

async function writeJson(root: string, fileName: string, value: unknown): Promise<void> {
  await writeFile(join(root, fileName), `${JSON.stringify(value, null, 2)}\n`);
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
