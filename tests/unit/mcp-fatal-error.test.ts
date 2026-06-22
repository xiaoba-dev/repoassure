import { formatMcpFatalError } from '../../src/adapters/mcp/fatal-error.js';

describe('formatMcpFatalError', () => {
  it('redacts sensitive values from MCP startup failures', () => {
    const error = new Error('boot failed API_KEY=sk-mcp-secret');
    error.stack = [
      'Error: boot failed API_KEY=sk-mcp-secret',
      '    at start (http://127.0.0.1:5173/callback?token=url-secret)'
    ].join('\n');

    const message = formatMcpFatalError(error);

    expect(message).toContain('API_KEY=[REDACTED]');
    expect(message).toContain('token=[REDACTED]');
    expect(message).not.toContain('sk-mcp-secret');
    expect(message).not.toContain('url-secret');
  });
});
