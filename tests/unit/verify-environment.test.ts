import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { verifyEnvironment } from '../../src/domain/verify-environment/verify-environment.js';

interface FindingsFileShape {
  findings: Array<{ severity: string; type: string; title: string; evidence: string[] }>;
}

async function createRunDir(findings: unknown, bootUrl = 'http://localhost:4321'): Promise<string> {
  const runDir = await mkdtemp(join(tmpdir(), 'hardening-verify-env-'));

  await writeFile(join(runDir, 'findings.json'), JSON.stringify({ findings }));
  await writeFile(
    join(runDir, 'boot-result.json'),
    JSON.stringify({ status: 'running', url: bootUrl, port: 4321, environment: 'self-booted', blockers: [], errors: [] })
  );

  return runDir;
}

async function readFindings(path: string): Promise<FindingsFileShape> {
  return JSON.parse(await readFile(path, 'utf8')) as FindingsFileShape;
}

describe('verifyEnvironment', () => {
  it('downgrades a finding whose failing resource works against the deployed url', async () => {
    const runDir = await createRunDir([
      {
        severity: 'P1',
        type: 'network_error',
        title: 'Route emitted failed network requests',
        reproSteps: ['Go to http://localhost:4321/'],
        evidence: ['GET http://localhost:4321/api/stats :: 404 (fetch)']
      }
    ]);
    const requested: string[] = [];

    const result = await verifyEnvironment({
      runDir,
      deployedUrl: 'https://app.example.test',
      fetchUrl: async (url) => {
        requested.push(url);
        return { status: 200 };
      }
    });
    const findings = await readFindings(join(runDir, 'findings.json'));

    expect(requested).toEqual(['https://app.example.test/api/stats']);
    expect(result.environmentSpecific).toBe(1);
    expect(result.confirmed).toBe(0);
    expect(findings.findings[0]?.severity).toBe('P2');
    expect(findings.findings[0]?.evidence).toContain(
      'environment_verification=environment_specific :: https://app.example.test/api/stats -> 200'
    );
  });

  it('keeps a finding that fails against the deployed url too', async () => {
    const runDir = await createRunDir([
      {
        severity: 'P1',
        type: 'network_error',
        title: 'Route emitted failed network requests',
        reproSteps: ['Go to http://localhost:4321/'],
        evidence: ['GET http://localhost:4321/api/broken :: 500 (fetch)']
      }
    ]);

    const result = await verifyEnvironment({
      runDir,
      deployedUrl: 'https://app.example.test',
      fetchUrl: async () => ({ status: 500 })
    });
    const findings = await readFindings(join(runDir, 'findings.json'));

    expect(result.confirmed).toBe(1);
    expect(result.environmentSpecific).toBe(0);
    expect(findings.findings[0]?.severity).toBe('P1');
    expect(findings.findings[0]?.evidence).toContain(
      'environment_verification=confirmed :: https://app.example.test/api/broken -> 500'
    );
  });

  it('verifies a broken route through the url in its repro steps', async () => {
    const runDir = await createRunDir([
      {
        severity: 'P1',
        type: 'broken_route',
        title: 'Route returned HTTP 404',
        reproSteps: ['Go to http://localhost:4321/api/stats'],
        evidence: ['status=404']
      }
    ]);
    const requested: string[] = [];

    const result = await verifyEnvironment({
      runDir,
      deployedUrl: 'https://app.example.test/',
      fetchUrl: async (url) => {
        requested.push(url);
        return { status: 200 };
      }
    });

    expect(requested).toEqual(['https://app.example.test/api/stats']);
    expect(result.environmentSpecific).toBe(1);
  });

  it('leaves findings a request cannot settle untouched', async () => {
    const runDir = await createRunDir([
      {
        severity: 'P1',
        type: 'dead_control',
        title: 'Interaction did not produce an observable result',
        reproSteps: ['Go to http://localhost:4321/', 'Click "Save"'],
        evidence: ['url_unchanged=true', 'body_text_unchanged=true']
      },
      {
        severity: 'P1',
        type: 'console_error',
        title: 'Route emitted browser runtime errors',
        reproSteps: ['Go to http://localhost:4321/'],
        evidence: ['TypeError: widget is not a function']
      }
    ]);
    const requested: string[] = [];

    const result = await verifyEnvironment({
      runDir,
      deployedUrl: 'https://app.example.test',
      fetchUrl: async (url) => {
        requested.push(url);
        return { status: 200 };
      }
    });
    const findings = await readFindings(join(runDir, 'findings.json'));

    expect(requested).toEqual([]);
    expect(result.unverifiable).toBe(2);
    expect(findings.findings.map((finding) => finding.severity)).toEqual(['P1', 'P1']);
  });

  it('preserves the pre-verification findings and records both environments', async () => {
    const runDir = await createRunDir([
      {
        severity: 'P1',
        type: 'network_error',
        title: 'Route emitted failed network requests',
        reproSteps: ['Go to http://localhost:4321/'],
        evidence: ['GET http://localhost:4321/api/stats :: 404 (fetch)']
      }
    ]);

    const result = await verifyEnvironment({
      runDir,
      deployedUrl: 'https://app.example.test',
      fetchUrl: async () => ({ status: 200 })
    });
    const original = await readFindings(result.originalFindingsPath);
    const verification = JSON.parse(await readFile(result.reportPath, 'utf8')) as {
      deployedUrl: string;
      localUrl: string | null;
      findings: Array<{ status: string; checkedUrls: Array<{ localUrl: string; deployedUrl: string; status: number | null }> }>;
    };

    expect(original.findings[0]?.severity).toBe('P1');
    expect(verification.deployedUrl).toBe('https://app.example.test');
    expect(verification.localUrl).toBe('http://localhost:4321');
    expect(verification.findings[0]?.status).toBe('environment_specific');
    expect(verification.findings[0]?.checkedUrls).toEqual([
      {
        localUrl: 'http://localhost:4321/api/stats',
        deployedUrl: 'https://app.example.test/api/stats',
        status: 200
      }
    ]);
  });

  it('treats a request that cannot reach the deployed url as still failing', async () => {
    const runDir = await createRunDir([
      {
        severity: 'P1',
        type: 'network_error',
        title: 'Route emitted failed network requests',
        reproSteps: ['Go to http://localhost:4321/'],
        evidence: ['GET http://localhost:4321/api/stats :: 404 (fetch)']
      }
    ]);

    const result = await verifyEnvironment({
      runDir,
      deployedUrl: 'https://app.example.test',
      fetchUrl: async () => {
        throw new Error('getaddrinfo ENOTFOUND app.example.test');
      }
    });
    const findings = await readFindings(join(runDir, 'findings.json'));

    expect(result.confirmed).toBe(1);
    expect(findings.findings[0]?.severity).toBe('P1');
    expect(findings.findings[0]?.evidence.join(' ')).toContain('ENOTFOUND');
  });

  it('ignores urls that are not served by the app under test', async () => {
    const runDir = await createRunDir([
      {
        severity: 'P1',
        type: 'network_error',
        title: 'Route emitted failed network requests',
        reproSteps: ['Go to http://localhost:4321/'],
        evidence: ['GET https://cdn.vendor.test/widget.js :: 404 (script)']
      }
    ]);
    const requested: string[] = [];

    const result = await verifyEnvironment({
      runDir,
      deployedUrl: 'https://app.example.test',
      fetchUrl: async (url) => {
        requested.push(url);
        return { status: 200 };
      }
    });

    expect(requested).toEqual([]);
    expect(result.unverifiable).toBe(1);
  });
});
