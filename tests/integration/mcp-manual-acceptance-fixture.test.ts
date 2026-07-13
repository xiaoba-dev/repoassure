import { cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { connectRealMcpClient } from '../support/real-mcp-client.js';

describe('real AI IDE manual acceptance fixture', () => {
  it('allows only a local, non-executing recovery-package call against the committed fixture', async () => {
    const fixtureRoot = await mkdtemp(join(tmpdir(), 'repoassure-mcp-manual-acceptance-'));
    const connection = await connectRealMcpClient({
      args: [resolve('apps/mcp-server/index.js')]
    });

    try {
      await cp(resolve('examples/mcp-manual-acceptance'), fixtureRoot, { recursive: true });
      const listed = await connection.client.listTools({}, { timeout: 5_000 });
      expect(listed.tools.map((tool) => tool.name)).toContain('create_blocked_goal_recovery');

      const result = await connection.client.callTool(
        {
          name: 'create_blocked_goal_recovery',
          arguments: { inputDir: fixtureRoot }
        },
        undefined,
        { timeout: 5_000 }
      );
      const structured = result.structuredContent as {
        boundaryCompliance?: {
          commandsExecuted?: boolean;
          externalStateChanged?: boolean;
          targetRepoMutation?: boolean;
        };
      };

      expect(result.isError).not.toBe(true);
      expect(structured.boundaryCompliance).toEqual({
        commandsExecuted: false,
        externalStateChanged: false,
        targetRepoMutation: false
      });
      const recoveryPackage = JSON.parse(
        await readFile(join(fixtureRoot, 'blocked-goal-recovery-package.json'), 'utf8')
      ) as { resumeCommands: unknown[] };
      expect(recoveryPackage.resumeCommands).toEqual([]);
    } finally {
      await connection.close();
      await rm(fixtureRoot, { recursive: true, force: true });
    }
  }, 15_000);
});
