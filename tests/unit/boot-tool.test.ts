import { toSerializableBootResult } from '../../src/tools/boot-app-tool.js';

describe('toSerializableBootResult', () => {
  it('removes the stop function and keeps stable boot fields', () => {
    const result = toSerializableBootResult({
      status: 'running',
      url: 'http://localhost:3000',
      port: 3000,
      logsPath: '/tmp/app.log',
      blockers: [],
      errors: [],
      stop: async () => {}
    });

    expect(result).toEqual({
      status: 'running',
      url: 'http://localhost:3000',
      port: 3000,
      logsPath: '/tmp/app.log',
      blockers: [],
      errors: []
    });
    expect(result).not.toHaveProperty('stop');
  });

  it('redacts sensitive URL parameters from serializable boot results', () => {
    const sessionUrl = 'http://localhost:3000/callback?code=oauth-secret&tab=profile#access_token=fragment-secret';
    const result = toSerializableBootResult({
      status: 'running',
      url: sessionUrl,
      port: 3000,
      logsPath: '/tmp/app.log',
      blockers: [],
      errors: [],
      stop: async () => {}
    });

    expect(sessionUrl).toContain('oauth-secret');
    expect(sessionUrl).toContain('fragment-secret');
    expect(result.url).toContain('code=[REDACTED]');
    expect(result.url).toContain('access_token=[REDACTED]');
    expect(result.url).not.toContain('oauth-secret');
    expect(result.url).not.toContain('fragment-secret');
  });

  it('redacts sensitive values from serializable boot metadata', () => {
    const result = toSerializableBootResult({
      status: 'failed',
      url: null,
      port: null,
      logsPath: '/tmp/app.log?token=log-secret',
      blockers: ['blocked by API_KEY=sk-blocker-secret'],
      errors: ['startup failed with client_secret=error-secret'],
      stop: async () => {}
    });

    expect(result.logsPath).toContain('token=[REDACTED]');
    expect(result.logsPath).not.toContain('log-secret');
    expect(result.blockers).toEqual(['blocked by API_KEY=[REDACTED]']);
    expect(result.errors).toEqual(['startup failed with client_secret=[REDACTED]']);
    expect(JSON.stringify(result)).not.toContain('sk-blocker-secret');
    expect(JSON.stringify(result)).not.toContain('error-secret');
  });
});
