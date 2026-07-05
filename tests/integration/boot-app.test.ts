import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { bootApp } from '../../src/domain/boot/boot-app.js';

async function createServerRepo(responseStatus = 200): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'hardening-boot-'));

  await writeFile(
    join(root, 'package.json'),
    JSON.stringify({
      scripts: { dev: 'node server.mjs' }
    })
  );
  await writeFile(
    join(root, 'server.mjs'),
    `
import http from 'node:http';

const server = http.createServer((_, response) => {
  response.writeHead(${responseStatus}, { 'content-type': 'text/plain' });
  response.end(process.env.HARDENING_BOOT_GREETING ?? 'missing');
});

server.listen(0, '127.0.0.1', () => {
  const address = server.address();
  console.log(\`Local: http://127.0.0.1:\${address.port}\`);
  console.error('OPENAI_API_KEY=sk-local-secret Authorization: Bearer bearer-secret');
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
`
  );

  return root;
}

describe('bootApp', () => {
  it('starts a local app, captures logs, and exposes a stop function', async () => {
    const root = await createServerRepo();
    const session = await bootApp({
      root,
      startCommand: "HARDENING_BOOT_GREETING='ok from env' npm run dev",
      timeoutMs: 30000
    });

    try {
      expect(session.status).toBe('running');
      expect(session.url).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
      expect(session.port).toBeGreaterThan(0);

      const response = await fetch(session.url ?? '');
      const logs = await readFile(session.logsPath, 'utf8');

      expect(response.status).toBe(200);
      expect(await response.text()).toBe('ok from env');
      expect(logs).toContain('Local: http://127.0.0.1:');
      expect(logs).toContain('OPENAI_API_KEY=[REDACTED]');
      expect(logs).toContain('Authorization: Bearer [REDACTED]');
      expect(logs).not.toContain('sk-local-secret');
      expect(logs).not.toContain('bearer-secret');
    } finally {
      await session.stop();
    }
  }, 45000);

  it('treats HTTP 404 responses as reachable once the dev server is listening', async () => {
    const root = await createServerRepo(404);
    const session = await bootApp({
      root,
      startCommand: 'npm run dev',
      timeoutMs: 10000
    });

    try {
      expect(session.status).toBe('running');
      expect(session.url).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);

      const response = await fetch(session.url ?? '');

      expect(response.status).toBe(404);
    } finally {
      await session.stop();
    }
  }, 10000);
});
