import { formatBenchmarkFatalError } from '../../src/internal/benchmark/fatal-error.js';

describe('formatBenchmarkFatalError', () => {
  it('redacts sensitive values from benchmark runner fatal errors', () => {
    const error = new Error('benchmark crashed API_KEY=sk-benchmark-secret');
    error.stack = [
      'Error: benchmark crashed API_KEY=sk-benchmark-secret',
      '    at run (http://127.0.0.1:5173/callback?token=url-secret#access_token=fragment-secret)'
    ].join('\n');

    const message = formatBenchmarkFatalError(error);

    expect(message).toContain('Benchmark runner failed:');
    expect(message).toContain('API_KEY=[REDACTED]');
    expect(message).toContain('token=[REDACTED]');
    expect(message).toContain('access_token=[REDACTED]');
    expect(message).not.toContain('sk-benchmark-secret');
    expect(message).not.toContain('url-secret');
    expect(message).not.toContain('fragment-secret');
  });
});
