import { createServer, type Server } from 'node:http';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runCli } from '../../src/adapters/cli/run.js';

async function startDeployedStub(): Promise<{ server: Server; origin: string }> {
  const server = createServer((request, response) => {
    if (request.url === '/api/stats') {
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end('{"ok":true}');
      return;
    }

    response.writeHead(404);
    response.end('missing');
  });

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;

  return { server, origin: `http://127.0.0.1:${port}` };
}

describe('CLI verify-env', () => {
  it('separates an environment gap from a defect against a deployed url', async () => {
    const runDir = await mkdtemp(join(tmpdir(), 'hardening-cli-verify-env-'));
    const { server, origin } = await startDeployedStub();
    let stdout = '';
    let stderr = '';

    await writeFile(
      join(runDir, 'boot-result.json'),
      JSON.stringify({ status: 'running', url: 'http://localhost:4321', port: 4321, environment: 'self-booted', blockers: [], errors: [] })
    );
    await writeFile(
      join(runDir, 'findings.json'),
      JSON.stringify({
        findings: [
          {
            severity: 'P1',
            type: 'network_error',
            title: 'Route emitted failed network requests',
            reproSteps: ['Go to http://localhost:4321/'],
            evidence: ['GET http://localhost:4321/api/stats :: 404 (fetch)']
          },
          {
            severity: 'P1',
            type: 'network_error',
            title: 'Route emitted failed network requests',
            reproSteps: ['Go to http://localhost:4321/'],
            evidence: ['GET http://localhost:4321/api/really-missing :: 404 (fetch)']
          }
        ]
      })
    );

    try {
      const exitCode = await runCli(['verify-env', runDir, '--deployed-url', origin], {
        writeStdout: (chunk) => {
          stdout += chunk;
        },
        writeStderr: (chunk) => {
          stderr += chunk;
        }
      });
      const output = JSON.parse(stdout) as { environmentSpecific: number; confirmed: number };
      const findings = JSON.parse(await readFile(join(runDir, 'findings.json'), 'utf8')) as {
        findings: Array<{ severity: string }>;
      };

      expect(exitCode).toBe(0);
      expect(stderr).toBe('');
      expect(output.environmentSpecific).toBe(1);
      expect(output.confirmed).toBe(1);
      expect(findings.findings.map((finding) => finding.severity)).toEqual(['P2', 'P1']);
    } finally {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
  }, 30000);
});
