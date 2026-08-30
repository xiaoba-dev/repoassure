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

async function createDaemonRepo(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'hardening-boot-daemon-'));

  await writeFile(
    join(root, 'package.json'),
    JSON.stringify({
      scripts: { dev: 'node daemon.mjs' }
    })
  );
  await writeFile(
    join(root, 'server-daemon.mjs'),
    `
import http from 'node:http';
import { rename, writeFile } from 'node:fs/promises';

const server = http.createServer((_, response) => {
  response.writeHead(200, { 'content-type': 'text/plain' });
  response.end('daemon ok');
});

server.listen(0, '127.0.0.1', async () => {
  // Publish the port atomically: a poller that sees the final name must also see
  // its contents. Writing in place lets existsSync observe the file between
  // creation and the content reaching it, which reads back as an empty port.
  const tmpPath = new URL('./port.txt.tmp', import.meta.url);
  await writeFile(tmpPath, String(server.address().port));
  await rename(tmpPath, new URL('./port.txt', import.meta.url));
});
`
  );
  await writeFile(
    join(root, 'daemon.mjs'),
    `
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';

const child = spawn(process.execPath, [new URL('./server-daemon.mjs', import.meta.url).pathname], {
  detached: true,
  stdio: 'ignore'
});
child.unref();

const portPath = new URL('./port.txt', import.meta.url).pathname;
const deadline = Date.now() + 20000;
let port = '';
while (!port) {
  if (existsSync(portPath)) {
    port = readFileSync(portPath, 'utf8').trim();
  }
  if (port) {
    break;
  }
  if (Date.now() > deadline) {
    process.exit(1);
  }
  await delay(25);
}
console.log(\`Dev server running at http://127.0.0.1:\${port} (pid \${child.pid})\`);
process.exit(0);
`
  );

  return root;
}

async function waitForPortClosed(url: string, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      await fetch(url, { signal: AbortSignal.timeout(500) });
    } catch {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return false;
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

  it('treats a daemonizing dev server as running and cleans up its listener on stop', async () => {
    const root = await createDaemonRepo();
    const session = await bootApp({
      root,
      startCommand: 'npm run dev',
      timeoutMs: 30000
    });

    try {
      // The errors ride along so a CI-only failure says why, instead of only
      // that 'failed' was not 'running'.
      expect({ status: session.status, errors: session.errors }).toEqual({
        status: 'running',
        errors: []
      });
      expect(session.daemon).toBe(true);
      expect(session.url).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);

      const response = await fetch(session.url ?? '');
      expect(response.status).toBe(200);
      expect(await response.text()).toBe('daemon ok');
    } finally {
      await session.stop();
    }

    expect(await waitForPortClosed(session.url ?? '', 10000)).toBe(true);
  }, 45000);

  it('fails when the process exits after printing a URL nothing listens on', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-boot-ghost-url-'));
    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({ scripts: { dev: 'node ghost.mjs' } })
    );
    await writeFile(
      join(root, 'ghost.mjs'),
      "console.log('Dev server running at http://127.0.0.1:59912');\nprocess.exit(0);\n"
    );

    const session = await bootApp({
      root,
      startCommand: 'npm run dev',
      timeoutMs: 30000
    });

    try {
      expect(session.status).toBe('failed');
      expect(session.daemon).toBe(false);
      expect(session.errors.join(' ')).toContain('Process exited before becoming reachable: 0');
    } finally {
      await session.stop();
    }
  }, 45000);

  it('fails fast when the process exits without ever printing a URL', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-boot-early-exit-'));
    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({ scripts: { dev: 'node crash.mjs' } })
    );
    await writeFile(join(root, 'crash.mjs'), "console.error('boom');\nprocess.exit(2);\n");

    const session = await bootApp({
      root,
      startCommand: 'npm run dev',
      timeoutMs: 30000
    });

    try {
      expect(session.status).toBe('failed');
      expect(session.errors.join(' ')).toContain('Process exited before becoming reachable: 2');
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
