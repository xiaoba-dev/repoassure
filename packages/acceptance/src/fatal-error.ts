import { redactSensitiveText } from './redaction.js';

export function formatAcceptanceFatalError(prefix: string, error: unknown): string {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  return `${prefix}: ${redactSensitiveText(message)}`;
}
