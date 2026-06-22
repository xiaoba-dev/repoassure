import {
  formatAcceptanceFatalError as formatLegacyAcceptanceFatalError
} from '../../src/internal/acceptance/fatal-error.js';
import { formatAcceptanceFatalError } from '../../packages/acceptance/src/fatal-error.js';

describe('formatAcceptanceFatalError', () => {
  it('redacts sensitive values from acceptance runner fatal errors', () => {
    const error = new Error('runner crashed API_KEY=sk-acceptance-secret');
    error.stack = [
      'Error: runner crashed API_KEY=sk-acceptance-secret',
      '    at run (http://127.0.0.1:5173/callback?token=url-secret#access_token=fragment-secret)'
    ].join('\n');

    const message = formatAcceptanceFatalError('Acceptance runner failed', error);

    expect(message).toContain('Acceptance runner failed:');
    expect(message).toContain('API_KEY=[REDACTED]');
    expect(message).toContain('token=[REDACTED]');
    expect(message).toContain('access_token=[REDACTED]');
    expect(message).not.toContain('sk-acceptance-secret');
    expect(message).not.toContain('url-secret');
    expect(message).not.toContain('fragment-secret');
  });

  it('keeps package-owned fatal error output compatible with the legacy implementation', () => {
    const error = new Error('runner crashed token=acceptance-fatal-token');

    expect(formatAcceptanceFatalError('Acceptance runner failed', error)).toBe(
      formatLegacyAcceptanceFatalError('Acceptance runner failed', error)
    );
  });
});
