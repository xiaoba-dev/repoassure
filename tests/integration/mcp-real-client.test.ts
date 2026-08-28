import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  connectRealMcpClient,
  isProcessAlive
} from '../support/real-mcp-client.js';

describe('real stdio MCP client consumption', () => {
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

