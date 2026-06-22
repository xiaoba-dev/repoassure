import { escapeMarkdownTableCell, formatMarkdownCodeCell } from '../acceptance/markdown.js';
import { redactSensitiveText } from '../../shared/privacy-redaction.js';

export type BenchmarkStatus = 'completed' | 'failed';
export type BenchmarkGoNoGo = 'passed' | 'failed';
export type GeneratedTestValidationStatus = 'passed' | 'failed' | 'skipped';

export interface BenchmarkRepoResult {
  name: string;
  status: BenchmarkStatus;
  durationMs: number;
  generatedTests: number;
  generatedTestValidation: GeneratedTestValidationStatus;
  findings: number;
  artifacts: number;
  readinessScore?: number;
  reportPath?: string;
  findingsPath?: string;
  error?: string;
}

export interface BenchmarkSummary {
  total: number;
  completed: number;
  failed: number;
  passThreshold: number;
  timeBudgetMs: number;
  totalDurationMs: number;
  withinTimeBudget: boolean;
  status: BenchmarkGoNoGo;
}

export interface BuildBenchmarkMarkdownInput {
  generatedAt: string;
  runDir: string;
  summary: BenchmarkSummary;
  results: BenchmarkRepoResult[];
}

const DEFAULT_PASS_THRESHOLD = 3;
const DEFAULT_TIME_BUDGET_MS = 15 * 60 * 1000;

export function summarizeBenchmarkResults(
  results: BenchmarkRepoResult[],
  totalDurationMs: number,
  passThreshold = DEFAULT_PASS_THRESHOLD,
  timeBudgetMs = DEFAULT_TIME_BUDGET_MS
): BenchmarkSummary {
  const completed = results.filter((result) => result.status === 'completed').length;
  const failed = results.length - completed;
  const withinTimeBudget = totalDurationMs <= timeBudgetMs;

  return {
    total: results.length,
    completed,
    failed,
    passThreshold,
    timeBudgetMs,
    totalDurationMs,
    withinTimeBudget,
    status: completed >= passThreshold && withinTimeBudget ? 'passed' : 'failed'
  };
}

export function buildBenchmarkMarkdown(input: BuildBenchmarkMarkdownInput): string {
  return `# Spike 与 Benchmark 结果

生成时间：${input.generatedAt}

## 摘要

| 项目 | 结果 |
| --- | --- |
| Go/No-go | ${input.summary.status === 'passed' ? 'Go' : 'No-go'} |
| Benchmark repo 总数 | ${input.summary.total} |
| 完整流程完成数 | ${input.summary.completed} |
| 失败数 | ${input.summary.failed} |
| 通过阈值 | ${input.summary.passThreshold} |
| 总耗时 | ${formatDuration(input.summary.totalDurationMs)} |
| 15 分钟内完成 | ${input.summary.withinTimeBudget ? '是' : '否'} |
| 运行目录 | ${formatBenchmarkCodeCell(input.runDir)} |

## Repo 结果

| Repo | 状态 | 生成测试数 | 生成测试验证 | 发现项 | artifacts | readiness | 报告 |
| --- | --- | ---: | --- | ---: | ---: | ---: | --- |
${input.results.map(formatResultRow).join('\n')}

## 失败原因

${formatFailures(input.results)}

## 结论

${input.summary.status === 'passed' ? 'Benchmark 达到 3/5 完整流程和 15 分钟内产出报告的 Go 标准。' : 'Benchmark 未达到 Go 标准，需要继续修复失败项。'}
`;
}

function formatResultRow(result: BenchmarkRepoResult): string {
  return `| ${escapeMarkdownTableCell(result.name)} | ${result.status} | ${result.generatedTests} | ${result.generatedTestValidation} | ${result.findings} | ${result.artifacts} | ${result.readinessScore ?? 'n/a'} | ${result.reportPath ? formatBenchmarkCodeCell(result.reportPath) : 'n/a'} |`;
}

function formatFailures(results: BenchmarkRepoResult[]): string {
  const failures = results.filter((result) => result.status === 'failed');

  if (failures.length === 0) {
    return '当前没有失败 repo。';
  }

  return failures
    .map((failure) => `- ${redactSensitiveText(failure.name)}: ${redactSensitiveText(failure.error ?? 'unknown error')}`)
    .join('\n');
}

function formatBenchmarkCodeCell(value: string): string {
  return formatMarkdownCodeCell(redactSensitiveText(value));
}

function formatDuration(durationMs: number): string {
  const seconds = Math.round(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
}
