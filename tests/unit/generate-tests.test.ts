import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { generatePlaywrightTests } from '../../src/domain/tests/generate-tests.js';

async function createTempDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), 'hardening-generate-tests-'));
}

describe('generatePlaywrightTests', () => {
  it('creates a Playwright spec from findings', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');

    await writeFile(
      findingsPath,
      JSON.stringify({
        findings: [
          {
            severity: 'P1',
            type: 'broken_route',
            title: 'Settings route returns 500',
            reproSteps: ['Go to /settings'],
            evidence: ['http://localhost:3000/settings']
          }
        ]
      })
    );

    const result = await generatePlaywrightTests({ findingsPath, outputDir });
    const contents = await readFile(result.createdFiles[0] ?? '', 'utf8');

    expect(result.createdFiles).toHaveLength(1);
    expect(result.createdFiles[0]).toBe(join(outputDir, 'generated-findings.spec.ts'));
    expect(result.testCommand).toBe(`npx playwright test ${outputDir}`);
    expect(result.validationStatus).toBe('skipped');
    expect(contents).toContain("import { test, expect } from '@playwright/test';");
    expect(contents).toContain('Settings route returns 500');
    expect(contents).toContain('const targetURL = new URL("/settings", baseURL).toString();');
    expect(contents).toContain('await page.goto(targetURL);');
    expect(contents).toContain('expect(new URL(page.url()).origin).toBe(new URL(targetURL).origin);');
    expect(contents).not.toContain('await expect(page).toHaveURL(targetURL);');
  });

  it('quotes the generated test command when the output path contains spaces', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests with spaces', 'hardening output');

    await writeFile(findingsPath, JSON.stringify({ findings: [] }));

    const result = await generatePlaywrightTests({ findingsPath, outputDir });

    expect(result.testCommand).toBe(`npx playwright test '${outputDir}'`);
  });

  it('uses the provided app base URL origin as the generated spec default', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');

    await writeFile(findingsPath, JSON.stringify({ findings: [] }));

    const result = await generatePlaywrightTests({
      findingsPath,
      outputDir,
      baseUrl: 'http://127.0.0.1:5173/dashboard'
    });
    const contents = await readFile(result.createdFiles[0] ?? '', 'utf8');

    expect(contents).toContain(
      'const baseURL = process.env.HARDENING_BASE_URL ?? "http://127.0.0.1:5173";'
    );
  });

  it('does not leak sensitive app base URL query or fragment values into generated specs', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');

    await writeFile(findingsPath, JSON.stringify({ findings: [] }));

    const result = await generatePlaywrightTests({
      findingsPath,
      outputDir,
      baseUrl: 'https://app.example.test/callback?code=oauth-secret#access_token=fragment-secret'
    });
    const contents = await readFile(result.createdFiles[0] ?? '', 'utf8');

    expect(contents).toContain(
      'const baseURL = process.env.HARDENING_BASE_URL ?? "https://app.example.test";'
    );
    expect(contents).not.toContain('oauth-secret');
    expect(contents).not.toContain('fragment-secret');
  });

  it('does not overwrite an existing generated spec', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');

    await writeFile(findingsPath, JSON.stringify({ findings: [] }));

    await generatePlaywrightTests({ findingsPath, outputDir });
    await writeFile(join(outputDir, 'generated-findings.spec.ts'), 'custom content');

    const result = await generatePlaywrightTests({ findingsPath, outputDir });

    expect(result.createdFiles[0]).toBe(join(outputDir, 'generated-findings-1.spec.ts'));
  });

  it('generates unique Playwright test titles for repeated findings', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');
    const repeatedFinding = {
      severity: 'P1',
      type: 'console_error',
      title: 'Route emitted browser runtime errors',
      reproSteps: ['Go to /'],
      evidence: ['ReferenceError']
    };

    await writeFile(
      findingsPath,
      JSON.stringify({
        findings: [repeatedFinding, repeatedFinding]
      })
    );

    const result = await generatePlaywrightTests({ findingsPath, outputDir });
    const contents = await readFile(result.createdFiles[0] ?? '', 'utf8');

    expect(contents).toContain('test("1. P1 console_error: Route emitted browser runtime errors"');
    expect(contents).toContain('test("2. P1 console_error: Route emitted browser runtime errors"');
  });

  it('extracts route paths from full URLs in repro steps', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');

    await writeFile(
      findingsPath,
      JSON.stringify({
        findings: [
          {
            severity: 'P1',
            type: 'broken_route',
            title: 'Settings route returns 404',
            reproSteps: ['Go to http://localhost:3000/settings?tab=team'],
            evidence: ['status=404']
          }
        ]
      })
    );

    const result = await generatePlaywrightTests({ findingsPath, outputDir });
    const contents = await readFile(result.createdFiles[0] ?? '', 'utf8');

    expect(contents).toContain(
      'const targetURL = new URL("/settings?tab=team", baseURL).toString();'
    );
  });

  it('redacts sensitive query parameters in generated finding routes', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');

    await writeFile(
      findingsPath,
      JSON.stringify({
        findings: [
          {
            severity: 'P1',
            type: 'broken_route',
            title: 'OAuth callback crashes',
            reproSteps: ['Go to http://localhost:3000/callback?code=oauth-secret&state=public-state&access_token=token-secret'],
            evidence: ['status=500']
          }
        ]
      })
    );

    const result = await generatePlaywrightTests({ findingsPath, outputDir });
    const contents = await readFile(result.createdFiles[0] ?? '', 'utf8');

    expect(contents).toContain(
      'const targetURL = new URL("/callback?code=[REDACTED]&state=public-state&access_token=[REDACTED]", baseURL).toString();'
    );
    expect(contents).not.toContain('oauth-secret');
    expect(contents).not.toContain('token-secret');
  });

  it('redacts signed URL query credentials in generated finding routes', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');

    await writeFile(
      findingsPath,
      JSON.stringify({
        findings: [
          {
            severity: 'P1',
            type: 'broken_route',
            title: 'Signed download callback crashes',
            reproSteps: [
              'Go to http://localhost:3000/download?file=report.pdf&X-Amz-Date=20260619T010203Z&X-Amz-Credential=AKIA1234567890ABCDEF%2F20260619%2Fus-east-1&X-Amz-Signature=aws-signature-secret&sig=azure-signature-secret'
            ],
            evidence: ['status=500']
          }
        ]
      })
    );

    const result = await generatePlaywrightTests({ findingsPath, outputDir });
    const contents = await readFile(result.createdFiles[0] ?? '', 'utf8');

    expect(contents).toContain(
      'const targetURL = new URL("/download?file=report.pdf&X-Amz-Date=20260619T010203Z&X-Amz-Credential=[REDACTED]&X-Amz-Signature=[REDACTED]&sig=[REDACTED]", baseURL).toString();'
    );
    expect(contents).not.toContain('AKIA1234567890ABCDEF');
    expect(contents).not.toContain('aws-signature-secret');
    expect(contents).not.toContain('azure-signature-secret');
  });

  it('redacts sensitive fragment parameters in generated finding routes', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');

    await writeFile(
      findingsPath,
      JSON.stringify({
        findings: [
          {
            severity: 'P1',
            type: 'broken_route',
            title: 'OAuth fragment callback crashes',
            reproSteps: ['Go to /callback#code=fragment-code&state=public-state&id_token=id-secret'],
            evidence: ['status=500']
          }
        ]
      })
    );

    const result = await generatePlaywrightTests({ findingsPath, outputDir });
    const contents = await readFile(result.createdFiles[0] ?? '', 'utf8');

    expect(contents).toContain(
      'const targetURL = new URL("/callback#code=[REDACTED]&state=public-state&id_token=[REDACTED]", baseURL).toString();'
    );
    expect(contents).not.toContain('fragment-code');
    expect(contents).not.toContain('id-secret');
  });

  it('preserves and redacts full URL SPA hash routes in generated finding routes', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');

    await writeFile(
      findingsPath,
      JSON.stringify({
        findings: [
          {
            severity: 'P1',
            type: 'broken_route',
            title: 'SPA callback crashes',
            reproSteps: ['Go to http://localhost:3000/#/callback?code=fragment-code&tab=profile'],
            evidence: ['status=500']
          }
        ]
      })
    );

    const result = await generatePlaywrightTests({ findingsPath, outputDir });
    const contents = await readFile(result.createdFiles[0] ?? '', 'utf8');

    expect(contents).toContain(
      'const targetURL = new URL("/#/callback?code=[REDACTED]&tab=profile", baseURL).toString();'
    );
    expect(contents).not.toContain('fragment-code');
    expect(contents).not.toContain('const targetURL = new URL("/", baseURL).toString();');
  });

  it('redacts sensitive values from generated test titles', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');

    await writeFile(
      findingsPath,
      JSON.stringify({
        findings: [
          {
            severity: 'P1',
            type: 'console_error',
            title: 'Console leaked OPENAI_API_KEY=sk-title-secret and Authorization: Bearer title-token',
            reproSteps: ['Go to /settings'],
            evidence: ['console error']
          }
        ]
      })
    );

    const result = await generatePlaywrightTests({ findingsPath, outputDir });
    const contents = await readFile(result.createdFiles[0] ?? '', 'utf8');

    expect(contents).toContain(
      'test("1. P1 console_error: Console leaked OPENAI_API_KEY=[REDACTED] and Authorization: Bearer [REDACTED]"'
    );
    expect(contents).not.toContain('sk-title-secret');
    expect(contents).not.toContain('title-token');
  });

  it('strips trailing punctuation from full URLs in repro steps', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');

    await writeFile(
      findingsPath,
      JSON.stringify({
        findings: [
          {
            severity: 'P1',
            type: 'broken_route',
            title: 'Settings route returns 404',
            reproSteps: ['Go to http://localhost:3000/settings.'],
            evidence: ['status=404']
          }
        ]
      })
    );

    const result = await generatePlaywrightTests({ findingsPath, outputDir });
    const contents = await readFile(result.createdFiles[0] ?? '', 'utf8');

    expect(contents).toContain('const targetURL = new URL("/settings", baseURL).toString();');
    expect(contents).not.toContain('"/settings."');
  });

  it('extracts route paths from evidence text that includes a punctuated URL', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');

    await writeFile(
      findingsPath,
      JSON.stringify({
        findings: [
          {
            severity: 'P1',
            type: 'network_error',
            title: 'Settings request failed',
            reproSteps: ['Open the settings page'],
            evidence: ['Request failed at http://localhost:3000/settings.']
          }
        ]
      })
    );

    const result = await generatePlaywrightTests({ findingsPath, outputDir });
    const contents = await readFile(result.createdFiles[0] ?? '', 'utf8');

    expect(contents).toContain('const targetURL = new URL("/settings", baseURL).toString();');
    expect(contents).not.toContain('const targetURL = new URL("/", baseURL).toString();');
  });

  it('prefers repro route steps over external URLs in evidence', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');

    await writeFile(
      findingsPath,
      JSON.stringify({
        findings: [
          {
            severity: 'P1',
            type: 'network_error',
            title: 'Checkout API request failed',
            reproSteps: ['Go to /checkout'],
            evidence: ['Request failed at https://api.stripe.com/v1/checkout/sessions.']
          }
        ]
      })
    );

    const result = await generatePlaywrightTests({ findingsPath, outputDir });
    const contents = await readFile(result.createdFiles[0] ?? '', 'utf8');

    expect(contents).toContain('const targetURL = new URL("/checkout", baseURL).toString();');
    expect(contents).not.toContain('/v1/checkout/sessions');
  });

  it('does not generate local page tests from external evidence URLs without repro routes', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');

    await writeFile(
      findingsPath,
      JSON.stringify({
        findings: [
          {
            severity: 'P1',
            type: 'network_error',
            title: 'Checkout API request failed',
            reproSteps: ['Clicking checkout fails'],
            evidence: ['Request failed at https://api.stripe.com/v1/checkout/sessions.']
          }
        ]
      })
    );

    const result = await generatePlaywrightTests({ findingsPath, outputDir });
    const contents = await readFile(result.createdFiles[0] ?? '', 'utf8');

    expect(contents).toContain('const targetURL = new URL("/", baseURL).toString();');
    expect(contents).not.toContain('/v1/checkout/sessions');
  });

  it('does not generate local page tests from external URLs in non-navigation repro text', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');

    await writeFile(
      findingsPath,
      JSON.stringify({
        findings: [
          {
            severity: 'P1',
            type: 'network_error',
            title: 'Checkout API request failed',
            reproSteps: ['Click checkout; request failed at https://api.stripe.com/v1/checkout/sessions.'],
            evidence: ['status=500']
          }
        ]
      })
    );

    const result = await generatePlaywrightTests({ findingsPath, outputDir });
    const contents = await readFile(result.createdFiles[0] ?? '', 'utf8');

    expect(contents).toContain('const targetURL = new URL("/", baseURL).toString();');
    expect(contents).not.toContain('/v1/checkout/sessions');
  });

  it('uses local app URLs in non-navigation repro text as fallback routes', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');

    await writeFile(
      findingsPath,
      JSON.stringify({
        findings: [
          {
            severity: 'P1',
            type: 'network_error',
            title: 'Settings request failed',
            reproSteps: ['After clicking settings, request failed at http://localhost:3000/settings.'],
            evidence: ['status=500']
          }
        ]
      })
    );

    const result = await generatePlaywrightTests({ findingsPath, outputDir });
    const contents = await readFile(result.createdFiles[0] ?? '', 'utf8');

    expect(contents).toContain('const targetURL = new URL("/settings", baseURL).toString();');
    expect(contents).not.toContain('const targetURL = new URL("/", baseURL).toString();');
  });

  it('does not generate local page tests from pure external evidence URLs', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');

    await writeFile(
      findingsPath,
      JSON.stringify({
        findings: [
          {
            severity: 'P1',
            type: 'network_error',
            title: 'Analytics request failed',
            reproSteps: ['Open the dashboard'],
            evidence: ['https://api.segment.io/v1/batch']
          }
        ]
      })
    );

    const result = await generatePlaywrightTests({ findingsPath, outputDir });
    const contents = await readFile(result.createdFiles[0] ?? '', 'utf8');

    expect(contents).toContain('const targetURL = new URL("/", baseURL).toString();');
    expect(contents).not.toContain('/v1/batch');
  });

  it('strips trailing punctuation from full URLs in evidence', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');

    await writeFile(
      findingsPath,
      JSON.stringify({
        findings: [
          {
            severity: 'P1',
            type: 'network_error',
            title: 'Settings request failed',
            reproSteps: ['Open the settings page'],
            evidence: ['http://localhost:3000/settings.']
          }
        ]
      })
    );

    const result = await generatePlaywrightTests({ findingsPath, outputDir });
    const contents = await readFile(result.createdFiles[0] ?? '', 'utf8');

    expect(contents).toContain('const targetURL = new URL("/settings", baseURL).toString();');
    expect(contents).not.toContain('"/settings."');
  });

  it('generates smoke tests for explored critical routes when no findings exist', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');

    await writeFile(findingsPath, JSON.stringify({ findings: [] }));

    const result = await generatePlaywrightTests({
      findingsPath,
      outputDir,
      smokeRoutes: ['http://localhost:3000/login', 'http://localhost:3000/projects/new']
    });
    const contents = await readFile(result.createdFiles[0] ?? '', 'utf8');

    expect(contents).toContain('test("1. P2 smoke_route: Critical path route is reachable: /login"');
    expect(contents).toContain('const targetURL = new URL("/login", baseURL).toString();');
    expect(contents).toContain('test("2. P2 smoke_route: Critical path route is reachable: /projects/new"');
    expect(contents).toContain('const targetURL = new URL("/projects/new", baseURL).toString();');
    expect(contents).not.toContain('Generated smoke path');
  });

  it('normalizes smoke routes with surrounding whitespace', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');

    await writeFile(findingsPath, JSON.stringify({ findings: [] }));

    const result = await generatePlaywrightTests({
      findingsPath,
      outputDir,
      smokeRoutes: ['  /login  ', '  http://localhost:3000/settings  ']
    });
    const contents = await readFile(result.createdFiles[0] ?? '', 'utf8');

    expect(contents).toContain('const targetURL = new URL("/login", baseURL).toString();');
    expect(contents).toContain('const targetURL = new URL("/settings", baseURL).toString();');
    expect(contents).not.toContain('Generated smoke path');
  });

  it('accepts IPv6 unspecified local smoke route URLs as local app routes', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');

    await writeFile(findingsPath, JSON.stringify({ findings: [] }));

    const result = await generatePlaywrightTests({
      findingsPath,
      outputDir,
      smokeRoutes: ['http://[::]:3000/dashboard?tab=team']
    });
    const contents = await readFile(result.createdFiles[0] ?? '', 'utf8');

    expect(contents).toContain(
      'const targetURL = new URL("/dashboard?tab=team", baseURL).toString();'
    );
    expect(contents).not.toContain('const targetURL = new URL("/", baseURL).toString();');
  });

  it('redacts sensitive query parameters in generated smoke routes', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');

    await writeFile(findingsPath, JSON.stringify({ findings: [] }));

    const result = await generatePlaywrightTests({
      findingsPath,
      outputDir,
      smokeRoutes: ['/account?session=browser-session&tab=profile&csrf=csrf-secret']
    });
    const contents = await readFile(result.createdFiles[0] ?? '', 'utf8');

    expect(contents).toContain(
      'const targetURL = new URL("/account?session=[REDACTED]&tab=profile&csrf=[REDACTED]", baseURL).toString();'
    );
    expect(contents).not.toContain('browser-session');
    expect(contents).not.toContain('csrf-secret');
  });

  it('does not generate smoke tests from external API URLs', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');

    await writeFile(findingsPath, JSON.stringify({ findings: [] }));

    const result = await generatePlaywrightTests({
      findingsPath,
      outputDir,
      smokeRoutes: ['https://api.stripe.com/v1/checkout/sessions']
    });
    const contents = await readFile(result.createdFiles[0] ?? '', 'utf8');

    expect(contents).toContain('test("1. P2 smoke_route: Generated smoke path"');
    expect(contents).toContain('const targetURL = new URL("/", baseURL).toString();');
    expect(contents).not.toContain('/v1/checkout/sessions');
  });

  it('accepts smoke route URLs that match the configured app base URL origin', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');

    await writeFile(findingsPath, JSON.stringify({ findings: [] }));

    const result = await generatePlaywrightTests({
      findingsPath,
      outputDir,
      baseUrl: 'https://app.example.test/dashboard',
      smokeRoutes: [
        'https://app.example.test/settings?tab=team',
        'https://api.stripe.com/v1/checkout/sessions'
      ]
    });
    const contents = await readFile(result.createdFiles[0] ?? '', 'utf8');

    expect(contents).toContain(
      'const targetURL = new URL("/settings?tab=team", baseURL).toString();'
    );
    expect(contents).not.toContain('/v1/checkout/sessions');
    expect(contents).not.toContain('const targetURL = new URL("/", baseURL).toString();');
  });

  it('redacts sensitive fragment parameters in generated smoke routes', async () => {
    const root = await createTempDir();
    const findingsPath = join(root, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');

    await writeFile(findingsPath, JSON.stringify({ findings: [] }));

    const result = await generatePlaywrightTests({
      findingsPath,
      outputDir,
      smokeRoutes: ['/callback#access_token=fragment-token&state=public-state']
    });
    const contents = await readFile(result.createdFiles[0] ?? '', 'utf8');

    expect(contents).toContain(
      'test("1. P2 smoke_route: Critical path route is reachable: /callback#access_token=[REDACTED]&state=public-state"'
    );
    expect(contents).toContain(
      'const targetURL = new URL("/callback#access_token=[REDACTED]&state=public-state", baseURL).toString();'
    );
    expect(contents).not.toContain('fragment-token');
  });
});
