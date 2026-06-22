import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runCli } from '../../src/adapters/cli/run.js';

const browserIt = process.env.HARDENING_E2E_BROWSER === '1' ? it : it.skip;

describe('hardening browser E2E', () => {
  browserIt('boots a local app, explores it with Playwright, writes artifacts, and stops the app', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-e2e-browser-'));
    let stdout = '';
    let stderr = '';

    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({
        scripts: { dev: 'node server.mjs' }
      })
    );
    await writeFile(join(root, 'package-lock.json'), '{}\n');
    await writeFile(
      join(root, 'server.mjs'),
      `
import http from 'node:http';

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'content-type': 'text/html' });
  response.end('<html><body><main>Ready</main><button>Save</button></body></html>');
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

    const exitCode = await runCli(['run', root, '--browser', '--trace'], {
      writeStdout: (chunk) => {
        stdout += chunk;
      },
      writeStderr: (chunk) => {
        stderr += chunk;
      }
    });
    const output = JSON.parse(stdout) as {
      findingsPath: string;
      reportPath: string;
      explore: { artifactFiles: string[]; interactions: string[] };
    };

    expect(exitCode).toBe(0);
    expect(stderr).toBe('');
    expect(output.explore.artifactFiles.length).toBeGreaterThan(0);
    expect(output.explore.artifactFiles.some((file) => file.endsWith('.trace.zip'))).toBe(true);
    expect(output.explore.interactions).toEqual(['Click "Save"']);
    await expect(readFile(output.findingsPath, 'utf8')).resolves.toContain('dead_control');
    await expect(readFile(output.reportPath, 'utf8')).resolves.toContain('| 启动状态 | running |');
  });
});
