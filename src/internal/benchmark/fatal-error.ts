import { redactSensitiveText } from '../../shared/privacy-redaction.js';

export function formatBenchmarkFatalError(error: unknown): string {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  return `Benchmark runner failed: ${redactSensitiveText(message)}`;
}
