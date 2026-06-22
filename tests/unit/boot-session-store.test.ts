import { BootSessionStore } from '../../src/adapters/mcp/boot-session-store.js';

describe('BootSessionStore', () => {
  it('registers and stops boot sessions', async () => {
    const store = new BootSessionStore();
    let stopped = false;
    const sessionId = store.register({
      status: 'running',
      url: 'http://localhost:3000',
      port: 3000,
      logsPath: '/tmp/app.log',
      blockers: [],
      errors: [],
      resultPath: '/tmp/boot-result.json',
      stop: async () => {
        stopped = true;
      }
    });

    expect(store.has(sessionId)).toBe(true);
    expect(await store.stop(sessionId)).toEqual({
      stopped: true,
      sessionId
    });
    expect(stopped).toBe(true);
    expect(store.has(sessionId)).toBe(false);
  });

  it('reports unknown sessions without throwing', async () => {
    const store = new BootSessionStore();

    await expect(store.stop('missing')).resolves.toEqual({
      stopped: false,
      sessionId: 'missing',
      error: 'Unknown boot session: missing'
    });
  });
});
