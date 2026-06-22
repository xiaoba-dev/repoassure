import { buildBenchmarkMarkdown, summarizeBenchmarkResults } from '../../src/internal/benchmark/report.js';

describe('benchmark report', () => {
  it('summarizes benchmark pass criteria', () => {
    const summary = summarizeBenchmarkResults(
      [
        { name: 'a', status: 'completed', durationMs: 1000, generatedTests: 1, generatedTestValidation: 'passed', findings: 0, artifacts: 1 },
        { name: 'b', status: 'completed', durationMs: 1000, generatedTests: 2, generatedTestValidation: 'passed', findings: 1, artifacts: 1 },
        { name: 'c', status: 'completed', durationMs: 1000, generatedTests: 1, generatedTestValidation: 'passed', findings: 2, artifacts: 1 },
        { name: 'd', status: 'failed', durationMs: 1000, generatedTests: 0, generatedTestValidation: 'skipped', findings: 0, artifacts: 0, error: 'boot failed' },
        { name: 'e', status: 'failed', durationMs: 1000, generatedTests: 0, generatedTestValidation: 'skipped', findings: 0, artifacts: 0, error: 'timeout' }
      ],
      5000
    );

    expect(summary).toEqual({
      total: 5,
      completed: 3,
      failed: 2,
      passThreshold: 3,
      timeBudgetMs: 900000,
      totalDurationMs: 5000,
      withinTimeBudget: true,
      status: 'passed'
    });
  });

  it('builds a markdown benchmark report with go/no-go status', () => {
    const markdown = buildBenchmarkMarkdown({
      generatedAt: '2026-06-18T08:00:00.000Z',
      runDir: '/tmp/benchmark-run',
      summary: {
        total: 5,
        completed: 3,
        failed: 2,
        passThreshold: 3,
        timeBudgetMs: 900000,
        totalDurationMs: 5000,
        withinTimeBudget: true,
        status: 'passed'
      },
      results: [
        {
          name: 'vite-basic',
          status: 'completed',
          durationMs: 1000,
          reportPath: '/tmp/benchmark-run/vite-basic/hardening-report.md',
          generatedTests: 1,
          generatedTestValidation: 'passed',
          findings: 1,
          artifacts: 1,
          readinessScore: 85
        }
      ]
    });

    expect(markdown).toContain('# Spike 与 Benchmark 结果');
    expect(markdown).toContain('| Go/No-go | Go |');
    expect(markdown).toContain('| vite-basic | completed | 1 | passed | 1 | 1 | 85 |');
  });

  it('redacts sensitive values from benchmark paths and failure reasons', () => {
    const markdown = buildBenchmarkMarkdown({
      generatedAt: '2026-06-18T08:00:00.000Z',
      runDir: '/tmp/benchmark-API_KEY=sk-run-secret',
      summary: {
        total: 2,
        completed: 1,
        failed: 1,
        passThreshold: 3,
        timeBudgetMs: 900000,
        totalDurationMs: 5000,
        withinTimeBudget: true,
        status: 'failed'
      },
      results: [
        {
          name: 'vite-basic',
          status: 'completed',
          durationMs: 1000,
          reportPath: '/tmp/benchmark-run/vite-basic/hardening-report.md?token=report-secret',
          generatedTests: 1,
          generatedTestValidation: 'passed',
          findings: 1,
          artifacts: 1,
          readinessScore: 85
        },
        {
          name: 'next-error',
          status: 'failed',
          durationMs: 1000,
          generatedTests: 0,
          generatedTestValidation: 'skipped',
          findings: 0,
          artifacts: 0,
          error: 'boot failed with client_secret=error-secret and callback http://127.0.0.1:5173/#access_token=fragment-secret'
        }
      ]
    });

    expect(markdown).toContain('API_KEY=[REDACTED]');
    expect(markdown).toContain('token=[REDACTED]');
    expect(markdown).toContain('client_secret=[REDACTED]');
    expect(markdown).toContain('access_token=[REDACTED]');
    expect(markdown).not.toContain('sk-run-secret');
    expect(markdown).not.toContain('report-secret');
    expect(markdown).not.toContain('error-secret');
    expect(markdown).not.toContain('fragment-secret');
  });
});
