import { execFile } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

import {
  connectRealMcpClient,
  isProcessAlive
} from '../support/real-mcp-client.js';

const execFileAsync = promisify(execFile);
const expectedRecoveryTools = [
  'create_blocked_goal_recovery',
  'consume_blocked_goal_recovery',
  'record_blocked_goal_recovery_decision',
  'prepare_blocked_goal_resume_attempt',
  'intake_blocked_goal_resume_evidence',
  'review_blocked_goal_resume_evidence',
  'close_blocked_goal_resume_attempt',
  'validate_blocked_goal_recovery_lifecycle'
] as const;

describe('external AI IDE MCP configuration consumption', () => {
  it('fails closed without leaking the install path when build outputs are missing', async () => {
    const fixtureRoot = await mkdtemp(join(tmpdir(), 'RepoAssure API_KEY=prebuild-secret '));
    try {
      const isolatedScript = join(fixtureRoot, 'generate-mcp-client-config.mjs');
      await copyFile(resolve('scripts/generate-mcp-client-config.mjs'), isolatedScript);
      let stderr = '';
      try {
        await execFileAsync(process.execPath, [isolatedScript, '--client', 'cursor'], {
          cwd: fixtureRoot
        });
      } catch (error) {
        stderr = String((error as { stderr?: string }).stderr ?? error);
      }

      expect(stderr).toContain('run pnpm build first');
      expect(stderr).not.toContain('prebuild-secret');
      expect(stderr).not.toContain(fixtureRoot);
    } finally {
      await rm(fixtureRoot, { recursive: true, force: true });
    }
  });

  it('keeps the documented pnpm command stdout copy-pasteable', async () => {
    const { stdout, stderr } = await execFileAsync('pnpm', [
      '--silent', 'mcp:config', '--', '--client', 'cursor'
    ], { cwd: resolve('.') });

    expect(stderr).toBe('');
    expect(() => JSON.parse(stdout)).not.toThrow();
    expect(JSON.parse(stdout)).toMatchObject({
      mcpServers: {
        repoassure: {
          command: process.execPath,
          args: [resolve('apps/mcp-server/index.js')]
        }
      }
    });
  });

  it.each(['cursor', 'vscode', 'codex'] as const)(
    'starts the source-checkout app entry from a generated %s configuration outside the repository',
    async (client) => {
      const fixtureRoot = await mkdtemp(join(tmpdir(), 'RepoAssure External AI IDE '));
      const sentinel = 'must-not-appear-in-config-or-server';
      let connection: Awaited<ReturnType<typeof connectRealMcpClient>> | undefined;
      let pid: number | undefined;
      try {
        const sourceCheckout = join(fixtureRoot, 'RepoAssure Source Checkout With Spaces');
        const consumerRoot = join(fixtureRoot, 'External Consumer Workspace');
        await mkdir(consumerRoot, { recursive: true });
        await symlink(resolve('.'), sourceCheckout, 'dir');
        const { stdout, stderr } = await execFileAsync(process.execPath, [
          resolve('scripts/generate-mcp-client-config.mjs'),
          '--client', client,
          '--repo-root', sourceCheckout
        ], {
          cwd: consumerRoot,
          env: { ...process.env, REPOASSURE_EXTERNAL_IDE_SECRET: sentinel }
        });

        expect(stderr).toBe('');
        expect(stdout).not.toContain(sentinel);
        const launch = readLaunchConfiguration(client, stdout);
        expect(launch).toEqual({
          command: process.execPath,
          args: [join(sourceCheckout, 'apps', 'mcp-server', 'index.js')]
        });

        process.env.REPOASSURE_EXTERNAL_IDE_SECRET = sentinel;
        connection = await connectRealMcpClient({ ...launch, cwd: consumerRoot });
        pid = connection.pid;
        const listed = await connection.client.listTools({}, { timeout: 5_000 });
        expect(listed.tools.map((tool) => tool.name)).toEqual(
          expect.arrayContaining([...expectedRecoveryTools])
        );
        expect(connection.client.getInstructions()).toContain(
          'do not execute recovery or resume commands'
        );
        expect(connection.stderr()).toBe('');
      } finally {
        delete process.env.REPOASSURE_EXTERNAL_IDE_SECRET;
        try {
          if (connection) await connection.close();
        } finally {
          await rm(fixtureRoot, { recursive: true, force: true });
        }
      }
      if (pid !== undefined) expect(isProcessAlive(pid)).toBe(false);
    },
    30_000
  );
});

function readLaunchConfiguration(
  client: 'cursor' | 'vscode' | 'codex',
  content: string
): { command: string; args: string[] } {
  if (client === 'cursor') {
    const parsed = JSON.parse(content) as {
      mcpServers: { repoassure: { command: string; args: string[] } };
    };
    return parsed.mcpServers.repoassure;
  }
  if (client === 'vscode') {
    const parsed = JSON.parse(content) as {
      servers: { repoassure: { command: string; args: string[] } };
    };
    return {
      command: parsed.servers.repoassure.command,
      args: parsed.servers.repoassure.args
    };
  }
  const command = content.match(/^command = (.+)$/mu)?.[1];
  const args = content.match(/^args = \[(.+)\]$/mu)?.[1];
  if (!command || !args) throw new Error('Expected Codex stdio launch configuration');
  return {
    command: JSON.parse(command) as string,
    args: [JSON.parse(args) as string]
  };
}
