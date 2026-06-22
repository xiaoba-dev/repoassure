import { redactSensitiveText } from '../../shared/privacy-redaction.js';

export function formatMcpFatalError(error: unknown): string {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  return redactSensitiveText(message);
}
