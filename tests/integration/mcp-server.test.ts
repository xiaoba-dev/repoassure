import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { LATEST_PROTOCOL_VERSION } from '@modelcontextprotocol/sdk/types.js';

import { createHardeningMcpServer } from '../../src/adapters/mcp/server.js';

describe('hardening MCP server', () => {
  it('lists and calls hardening tools over MCP transport', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-mcp-server-'));
    const { server, transport } = await connectMcpServer();

    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({
        scripts: { dev: 'vite' },
        devDependencies: { vite: '8.0.0' }
      })
    );
    await writeFile(join(root, 'pnpm-lock.yaml'), 'lockfileVersion: 10.0\n');

    transport.receive({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    });
    const listResponse = await waitFor(() => responseFor(transport.sent, 2));

    const tools = readArray(readResult(listResponse).tools).map((tool) => readRecord(tool));

    expect(tools.map((tool) => tool.name)).toContain('analyze_repo');

    transport.receive({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'analyze_repo',
        arguments: { root }
      }
    });
    const callResponse = await waitFor(() => responseFor(transport.sent, 3));

    const structuredContent = readRecord(readResult(callResponse).structuredContent);
    const profile = readRecord(structuredContent.profile);

    expect(profile.framework).toBe('vite');
    await expect(readFile(join(root, '.hardening', 'run', 'repo-profile.json'), 'utf8')).resolves.toContain('"framework": "vite"');
    await server.close();
  });

  it('discovers and imports normalized security evidence over MCP transport', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-mcp-security-transport-'));
    const runDir = join(root, '.hardening', 'runs', 'run-security-transport');
    const { server, transport } = await connectMcpServer();

    try {
      const tools = await listTools(transport, 5);
      expect(tools.map((tool) => tool.name)).toEqual(expect.arrayContaining([
        'list_security_providers',
        'import_security_evidence'
      ]));

      const listed = await callTool(transport, 6, 'list_security_providers', {});
      expect(readArray(listed.providers).map((provider) => readRecord(provider).id)).toContain('codex-security');

      const imported = await callTool(transport, 7, 'import_security_evidence', {
        provider: 'codex-security',
        sourcePath: join(process.cwd(), 'fixtures/security/codex-security-basic'),
        repoRoot: root,
        runDir
      });
      expect(imported.findingCount).toBe(1);
      expect(readRecord(imported.repairPlanningHandoff)).toMatchObject({
        status: 'ready',
        reviewBoundary: { autoApply: false, targetMutation: false, maintainerReviewRequired: true }
      });
      await expect(readFile(join(runDir, 'security', 'security-findings.json'), 'utf8'))
        .resolves.toContain('codex-security');
    } finally {
      await server.close();
    }
  });

  it('runs the P0 hardening tool chain over MCP transport', async () => {
    const root = await createServerRepo();
    const { server, transport } = await connectMcpServer();

    try {
      const tools = await listTools(transport, 10);

      expect(tools.map((tool) => tool.name)).toEqual(expect.arrayContaining([
        'analyze_repo',
        'boot_app',
        'explore_app',
        'generate_tests',
        'harden_report',
        'stop_app'
      ]));

      const analyze = await callTool(transport, 11, 'analyze_repo', { root });
      const boot = await callTool(transport, 12, 'boot_app', {
        root,
        startCommand: 'npm run dev',
        timeoutMs: 30000
      });
      const bootUrl = readString(boot.url);

      expect(readRecord(analyze.profile).framework).toBe('unknown');
      expect(boot.status).toBe('running');
      expect(bootUrl).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);

      const explore = await callTool(transport, 13, 'explore_app', {
        root,
        url: bootUrl,
        maxRoutes: 3,
        maxActionsPerRoute: 0
      });
      const findingsPath = readString(explore.findingsPath);

      expect(readArray(explore.visitedRoutes)).toContain(bootUrl);
      await expect(readFile(findingsPath, 'utf8')).resolves.toContain('"findings"');

      const generateTests = await callTool(transport, 14, 'generate_tests', {
        findingsPath,
        outputDir: join(root, 'tests', 'hardening'),
        smokeRoutes: [new URL('/settings', bootUrl).toString()]
      });
      const createdFiles = readArray(generateTests.createdFiles);

      expect(createdFiles.length).toBe(1);
      await expect(readFile(readString(createdFiles[0]), 'utf8')).resolves.toContain("import { test, expect } from '@playwright/test';");
      await expect(readFile(readString(createdFiles[0]), 'utf8')).resolves.toContain('const targetURL = new URL("/settings", baseURL).toString();');

      const report = await callTool(transport, 15, 'harden_report', {
        runDir: join(root, '.hardening', 'run'),
        outputPath: join(root, 'hardening-report.md')
      });

      await expect(readFile(readString(report.reportPath), 'utf8')).resolves.toContain('# hardening-mcp 硬化报告');
      await expect(readFile(readString(report.patchDiffPath), 'utf8')).resolves.toContain('Hardening Remediation Plan');

      const stop = await callTool(transport, 16, 'stop_app', {
        sessionId: readString(boot.sessionId)
      });

      expect(stop.stopped).toBe(true);
    } finally {
      await server.close();
    }
  }, 45000);

  it('runs the blocked goal recovery evidence lifecycle over MCP without executing commands', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-mcp-recovery-'));
    const { server, transport } = await connectMcpServer();

    try {
      await writeJson(root, 'blocked-goal-recovery-input.json', {
        sourceGoal: {
          title: 'MCP lifecycle fixture', status: 'blocked',
          objective: 'Validate local recovery artifacts over MCP.', evidenceRefs: []
        },
        sourceLogs: [], blockers: [],
        resumeCommands: [{ command: 'codex resume goal', purpose: 'Separate reviewed attempt.' }],
        redactionBoundary: 'Sanitized local fixture evidence only.'
      });

      const recovery = await callTool(transport, 30, 'create_blocked_goal_recovery', { inputDir: root });
      expectRecoveryToolResult(recovery, 'create_blocked_goal_recovery', 'repoassure.blocked-goal-recovery-package.v1');

      const consumption = await callTool(transport, 31, 'consume_blocked_goal_recovery', { inputDir: root });
      expectRecoveryToolResult(
        consumption,
        'consume_blocked_goal_recovery',
        'repoassure.blocked-goal-recovery-consumption-report.v1'
      );
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

      const decision = await callTool(transport, 32, 'record_blocked_goal_recovery_decision', { inputDir: root });
      expectRecoveryToolResult(
        decision,
        'record_blocked_goal_recovery_decision',
        'repoassure.blocked-goal-recovery-decision-receipt.v1'
      );
      const decisionText = await readFile(join(root, 'blocked-goal-recovery-decision-receipt.json'), 'utf8');
      await writeJson(root, 'blocked-goal-recovery-resume-attempt-task-input.json', {
        sourceDecisionReceiptSha256: sha256(decisionText)
      });

      const task = await callTool(transport, 33, 'prepare_blocked_goal_resume_attempt', { inputDir: root });
      expectRecoveryToolResult(
        task,
        'prepare_blocked_goal_resume_attempt',
        'repoassure.blocked-goal-recovery-resume-attempt-task-package.v1'
      );
      const taskText = await readFile(join(root, 'blocked-goal-recovery-resume-attempt-task-package.json'), 'utf8');
      const taskArtifact = JSON.parse(taskText) as {
        actionTasks: Array<{ actionKey: string }>;
        resumeCommandTasks: Array<{ commandId: string }>;
        verificationChecklist: string[];
      };
      await writeJson(root, 'blocked-goal-recovery-resume-attempt-execution-evidence-input.json', {
        sourceTaskPackageSha256: sha256(taskText),
        attemptId: 'mcp-fixture-attempt',
        startedAt: '2026-07-13T09:00:00.000Z',
        completedAt: '2026-07-13T09:01:00.000Z',
        actionResults: taskArtifact.actionTasks.map((item) => ({
          actionKey: item.actionKey, status: 'passed', summary: 'Passed.', evidenceRefs: ['action.log']
        })),
        resumeCommandResults: taskArtifact.resumeCommandTasks.map((item) => ({
          commandId: item.commandId, status: 'passed', exitCode: 0,
          summary: 'Executed in separately authorized fixture.', evidenceRefs: ['resume.log']
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

      const intake = await callTool(transport, 34, 'intake_blocked_goal_resume_evidence', { inputDir: root });
      expectRecoveryToolResult(
        intake,
        'intake_blocked_goal_resume_evidence',
        'repoassure.blocked-goal-recovery-resume-attempt-execution-evidence-intake.v1'
      );
      const intakeText = await readFile(
        join(root, 'blocked-goal-recovery-resume-attempt-execution-evidence-intake.json'),
        'utf8'
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

      const review = await callTool(transport, 35, 'review_blocked_goal_resume_evidence', { inputDir: root });
      expectRecoveryToolResult(
        review,
        'review_blocked_goal_resume_evidence',
        'repoassure.blocked-goal-recovery-resume-attempt-evidence-review-decision-package.v1'
      );
      const reviewText = await readFile(
        join(root, 'blocked-goal-recovery-resume-attempt-evidence-review-decision-package.json'),
        'utf8'
      );
      await writeJson(root, 'blocked-goal-recovery-resume-attempt-closure-input.json', {
        sourceEvidenceReviewPackageSha256: sha256(reviewText),
        closureEvidence: 'MCP fixture closure reviewed.',
        reviewerRole: 'maintainer',
        acknowledgedRiskEvidenceKeys: []
      });

      const closure = await callTool(transport, 36, 'close_blocked_goal_resume_attempt', { inputDir: root });
      expectRecoveryToolResult(
        closure,
        'close_blocked_goal_resume_attempt',
        'repoassure.blocked-goal-recovery-resume-attempt-closure-receipt.v1'
      );
      expect(readRecord(readRecord(closure.output).boundaryCompliance)).toMatchObject({
        commandsExecutedByClosure: false,
        externalGoalClosedByReceipt: false
      });
    } finally {
      await server.close();
    }
  });
});

function expectRecoveryToolResult(
  value: Record<string, unknown>,
  toolName: string,
  outputSchemaVersion: string
): void {
  expect(value).toMatchObject({
    schemaVersion: 'repoassure.mcp-blocked-goal-recovery-tool-result.v1',
    toolName,
    output: { schemaVersion: outputSchemaVersion },
    boundaryCompliance: {
      commandsExecuted: false,
      externalStateChanged: false,
      targetRepoMutation: false
    }
  });
}

async function writeJson(root: string, fileName: string, value: unknown): Promise<void> {
  await writeFile(join(root, fileName), `${JSON.stringify(value, null, 2)}\n`);
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

async function createServerRepo(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'hardening-mcp-chain-'));

  await writeFile(
    join(root, 'package.json'),
    JSON.stringify({
      scripts: { dev: 'node server.mjs' }
    })
  );
  await mkdir(join(root, 'src'), { recursive: true });
  await writeFile(
    join(root, 'server.mjs'),
    `
import http from 'node:http';

const server = http.createServer((request, response) => {
  if (request.url === '/settings') {
    response.writeHead(200, { 'content-type': 'text/html' });
    response.end('<html><body><main>Settings</main></body></html>');
    return;
  }

  response.writeHead(200, { 'content-type': 'text/html' });
  response.end('<html><body><main>Home</main><a href="/settings">Settings</a></body></html>');
});

server.listen(0, '127.0.0.1', () => {
  const address = server.address();
  console.log(\`Local: http://127.0.0.1:\${address.port}\`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
`
  );

  return root;
}

async function connectMcpServer(): Promise<{ server: ReturnType<typeof createHardeningMcpServer>; transport: MemoryTransport }> {
  const transport = new MemoryTransport();
  const server = createHardeningMcpServer();

  await server.connect(transport);
  transport.receive({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: LATEST_PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: 'vitest', version: '0.0.0' }
    }
  });
  await waitFor(() => responseFor(transport.sent, 1));
  transport.receive({
    jsonrpc: '2.0',
    method: 'notifications/initialized'
  });

  return { server, transport };
}

async function listTools(transport: MemoryTransport, id: number): Promise<Record<string, unknown>[]> {
  transport.receive({
    jsonrpc: '2.0',
    id,
    method: 'tools/list',
    params: {}
  });
  const response = await waitFor(() => responseFor(transport.sent, id));

  return readArray(readResult(response).tools).map((tool) => readRecord(tool));
}

async function callTool(transport: MemoryTransport, id: number, name: string, args: Record<string, unknown>): Promise<Record<string, unknown>> {
  transport.receive({
    jsonrpc: '2.0',
    id,
    method: 'tools/call',
    params: {
      name,
      arguments: args
    }
  });
  const response = await waitFor(() => responseFor(transport.sent, id));

  return readRecord(readResult(response).structuredContent);
}

class MemoryTransport implements Transport {
  sent: JSONRPCMessage[] = [];

  onmessage: NonNullable<Transport['onmessage']> = () => undefined;
  onclose: () => void = () => undefined;
  onerror: (error: Error) => void = () => undefined;

  async start(): Promise<void> {
    return undefined;
  }

  async send(message: JSONRPCMessage): Promise<void> {
    this.sent.push(message);
  }

  async close(): Promise<void> {
    this.onclose?.();
  }

  receive(message: JSONRPCMessage): void {
    this.onmessage?.(message);
  }
}

async function waitFor<T>(read: () => T | null): Promise<T> {
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const value = read();

    if (value) {
      return value;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 10);
    });
  }

  throw new Error('Timed out waiting for MCP response');
}

function responseFor(messages: JSONRPCMessage[], id: number): JSONRPCMessage | null {
  return messages.find((message) => 'id' in message && message.id === id) ?? null;
}

function readResult(message: JSONRPCMessage): Record<string, unknown> {
  if (!('result' in message) || typeof message.result !== 'object' || !message.result) {
    throw new Error(`Expected JSON-RPC result: ${JSON.stringify(message)}`);
  }

  return message.result as Record<string, unknown>;
}

function readRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || !value) {
    throw new Error(`Expected object: ${JSON.stringify(value)}`);
  }

  return value as Record<string, unknown>;
}

function readArray(value: unknown): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`Expected array: ${JSON.stringify(value)}`);
  }

  return value;
}

function readString(value: unknown): string {
  if (typeof value !== 'string') {
    throw new Error(`Expected string: ${JSON.stringify(value)}`);
  }

  return value;
}
