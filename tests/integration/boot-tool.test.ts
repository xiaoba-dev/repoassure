import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runBootAppTool } from '../../src/tools/boot-app-tool.js';

async function createServerRepo(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'hardening-boot-tool-'));

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
  response.writeHead(200, { 'content-type': 'text/plain' });
  response.end('ok');
});

server.listen(0, '127.0.0.1', () => {
  const address = server.address();
  console.log(\`Local: http://127.0.0.1:\${address.port}\`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
`
  );

  return root;
}

describe('runBootAppTool', () => {
  it('writes a serializable boot result artifact', async () => {
    const root = await createServerRepo();
    const session = await runBootAppTool({
      root,
      startCommand: 'npm run dev',
      timeoutMs: 30000
    });

    try {
      const artifact = JSON.parse(await readFile(session.resultPath, 'utf8')) as Record<string, unknown>;

      expect(session.status).toBe('running');
      expect(session.resultPath).toBe(join(root, '.hardening', 'run', 'boot-result.json'));
      expect(artifact.status).toBe('running');
      expect(artifact.url).toBe(session.url);
      expect(artifact).not.toHaveProperty('stop');
    } finally {
      await session.stop();
    }
  }, 45000);
});
