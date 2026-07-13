import { describe, expect, it, vi } from 'vitest';

import { signalProcess } from '../support/real-mcp-client.js';

describe('real MCP client process signaling', () => {
  it('treats ESRCH as an already-exited process', () => {
    const error = Object.assign(new Error('missing process'), { code: 'ESRCH' });
    const kill = vi.fn(() => { throw error; }) as unknown as typeof process.kill;

    expect(signalProcess(123, 'SIGTERM', kill)).toBe(false);
  });

  it('fails closed when the operating system rejects process signaling', () => {
    const error = Object.assign(new Error('operation not permitted'), { code: 'EPERM' });
    const kill = vi.fn(() => { throw error; }) as unknown as typeof process.kill;

    expect(() => signalProcess(123, 'SIGKILL', kill)).toThrow(error);
  });
});
