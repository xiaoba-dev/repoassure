import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { generateHardenReport } from '../../src/domain/reports/harden-report.js';

async function createRunDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), 'hardening-report-'));
}

describe('generateHardenReport', () => {
  it('generates a markdown report with score and issue counts', async () => {
    const runDir = await createRunDir();
    const outputPath = join(runDir, 'hardening-report.md');

    await writeFile(
      join(runDir, 'repo-profile.json'),
      JSON.stringify({
        framework: 'nextjs',
        packageManager: 'pnpm',
        recommendedStartCommand: 'pnpm dev',
        blockers: [],
        confidence: 'high'
      })
    );
    await writeFile(
      join(runDir, 'boot-result.json'),
      JSON.stringify({
        status: 'running',
        url: 'http://localhost:3000',
        port: 3000,
        blockers: [],
        errors: []
      })
    );
    await writeFile(
      join(runDir, 'findings.json'),
      JSON.stringify({
        findings: [
          {
            severity: 'P0',
            type: 'white_screen',
            title: 'Home page is blank',
            reproSteps: ['Go to /'],
            evidence: ['screenshot: home.png']
          },
          {
            severity: 'P2',
            type: 'console_error',
            title: 'Console warning on settings',
            reproSteps: ['Go to /settings'],
            evidence: ['console: \u001b[31mwarning\u001b[0m']
          }
        ]
      })
    );
    await writeFile(
      join(runDir, 'test-generation.json'),
      JSON.stringify({
        createdFiles: ['tests/hardening/generated-findings.spec.ts'],
        testCommand: 'npx playwright test tests/hardening',
        validationStatus: 'skipped',
        errors: []
      })
    );
    await mkdir(join(runDir, 'tests', 'hardening'), { recursive: true });
    await writeFile(
      join(runDir, 'tests', 'hardening', 'generated-findings.spec.ts'),
      "import { test } from '@playwright/test';\n\ntest('regression', async () => {});\n"
    );

    const result = await generateHardenReport({ runDir, outputPath });
    const report = await readFile(outputPath, 'utf8');
    const patchDiff = await readFile(result.patchDiffPath, 'utf8');

    expect(result.reportPath).toBe(outputPath);
    expect(result.readinessScore).toBeLessThan(100);
    expect(result.issueCounts).toEqual({ P0: 1, P1: 0, P2: 1 });
    expect(result.patchDiffPath).toBe(join(runDir, 'patch.diff'));
    expect(report).toContain('# hardening-mcp 硬化报告');
    expect(report).toContain('Home page is blank');
    expect(report).not.toContain('\u001b[');
    expect(report).toContain('npx playwright test tests/hardening');
    expect(report).toContain('HARDENING_BASE_URL=http://localhost:3000 npx playwright test tests/hardening');
    expect(patchDiff).toContain('diff --git a/docs/hardening-remediation.md b/docs/hardening-remediation.md');
    expect(patchDiff).toContain('Home page is blank');
    expect(patchDiff).not.toContain('\u001b[');
    expect(patchDiff).toContain('console: warning');
    expect(patchDiff).toContain('HARDENING_BASE_URL=http://localhost:3000 npx playwright test tests/hardening');
    expect(patchDiff).toContain('diff --git a/tests/hardening/generated-findings.spec.ts b/tests/hardening/generated-findings.spec.ts');
  });

  it('escapes markdown table cells in report metadata', async () => {
    const runDir = await createRunDir();
    const outputPath = join(runDir, 'hardening-report.md');

    await writeFile(
      join(runDir, 'repo-profile.json'),
      JSON.stringify({
        framework: 'nextjs | vite',
        packageManager: 'pnpm',
        recommendedStartCommand: 'pnpm dev |\ncat',
        blockers: [],
        confidence: 'high | reviewed'
      })
    );
    await writeFile(
      join(runDir, 'boot-result.json'),
      JSON.stringify({
        status: 'running',
        url: 'http://localhost:3000/?mode=a|b',
        port: 3000,
        blockers: [],
        errors: []
      })
    );
    await writeFile(join(runDir, 'findings.json'), JSON.stringify({ findings: [] }));
    await writeFile(
      join(runDir, 'test-generation.json'),
      JSON.stringify({
        createdFiles: ['tests/hardening/generated | findings.spec.ts'],
        testCommand: "npx playwright test 'tests | hardening'",
        validationStatus: 'passed | generated',
        errors: []
      })
    );

    await generateHardenReport({ runDir, outputPath });
    const report = await readFile(outputPath, 'utf8');

    expect(report).toContain('| framework | nextjs \\| vite |');
    expect(report).toContain('| recommendedStartCommand | pnpm dev \\| cat |');
    expect(report).toContain('| confidence | high \\| reviewed |');
    expect(report).toContain('| 应用 URL | http://localhost:3000/?mode=a\\|b |');
    expect(report).toContain('| createdFiles | tests/hardening/generated \\| findings.spec.ts |');
    expect(report).toContain("| testCommand | npx playwright test 'tests \\| hardening' |");
    expect(report).toContain("| verificationCommand | HARDENING_BASE_URL='http://localhost:3000/?mode=a\\|b' npx playwright test 'tests \\| hardening' |");
    expect(report).toContain('| validationStatus | passed \\| generated |');
  });

  it('redacts sensitive query parameters from app URLs and verification commands', async () => {
    const runDir = await createRunDir();
    const outputPath = join(runDir, 'hardening-report.md');

    await writeFile(
      join(runDir, 'repo-profile.json'),
      JSON.stringify({
        framework: 'nextjs',
        packageManager: 'pnpm',
        recommendedStartCommand: 'pnpm dev',
        blockers: [],
        confidence: 'high'
      })
    );
    await writeFile(
      join(runDir, 'boot-result.json'),
      JSON.stringify({
        status: 'running',
        url: 'http://localhost:3000/callback?code=oauth-secret&state=public-state&access_token=token-secret',
        port: 3000,
        blockers: [],
        errors: []
      })
    );
    await writeFile(join(runDir, 'findings.json'), JSON.stringify({ findings: [] }));
    await writeFile(
      join(runDir, 'test-generation.json'),
      JSON.stringify({
        createdFiles: [],
        testCommand: 'npx playwright test tests/hardening',
        validationStatus: 'skipped',
        errors: []
      })
    );

    await generateHardenReport({ runDir, outputPath });
    const report = await readFile(outputPath, 'utf8');

    expect(report).toContain(
      '| 应用 URL | http://localhost:3000/callback?code=[REDACTED]&state=public-state&access_token=[REDACTED] |'
    );
    expect(report).toContain(
      "HARDENING_BASE_URL='http://localhost:3000/callback?code=[REDACTED]&state=public-state&access_token=[REDACTED]' npx playwright test tests/hardening"
    );
    expect(report).not.toContain('oauth-secret');
    expect(report).not.toContain('token-secret');
  });

  it('redacts sensitive fragment parameters from app URLs and verification commands', async () => {
    const runDir = await createRunDir();
    const outputPath = join(runDir, 'hardening-report.md');

    await writeFile(
      join(runDir, 'repo-profile.json'),
      JSON.stringify({
        framework: 'vite',
        packageManager: 'pnpm',
        recommendedStartCommand: 'pnpm dev',
        blockers: [],
        confidence: 'high'
      })
    );
    await writeFile(
      join(runDir, 'boot-result.json'),
      JSON.stringify({
        status: 'running',
        url: 'http://localhost:3000/callback#code=fragment-code&state=public-state',
        port: 3000,
        blockers: [],
        errors: []
      })
    );
    await writeFile(join(runDir, 'findings.json'), JSON.stringify({ findings: [] }));
    await writeFile(
      join(runDir, 'test-generation.json'),
      JSON.stringify({
        createdFiles: [],
        testCommand: 'npx playwright test tests/hardening',
        validationStatus: 'skipped',
        errors: []
      })
    );

    await generateHardenReport({ runDir, outputPath });
    const report = await readFile(outputPath, 'utf8');

    expect(report).toContain(
      '| 应用 URL | http://localhost:3000/callback#code=[REDACTED]&state=public-state |'
    );
    expect(report).toContain(
      "HARDENING_BASE_URL='http://localhost:3000/callback#code=[REDACTED]&state=public-state' npx playwright test tests/hardening"
    );
    expect(report).not.toContain('fragment-code');
  });

  it('redacts sensitive values from boot errors in reports and patch diffs', async () => {
    const runDir = await createRunDir();
    const outputPath = join(runDir, 'hardening-report.md');

    await writeFile(
      join(runDir, 'repo-profile.json'),
      JSON.stringify({
        framework: 'nextjs',
        packageManager: 'pnpm',
        recommendedStartCommand: 'pnpm dev',
        blockers: [],
        confidence: 'high'
      })
    );
    await writeFile(
      join(runDir, 'boot-result.json'),
      JSON.stringify({
        status: 'failed',
        url: null,
        port: null,
        blockers: [],
        errors: ['OPENAI_API_KEY=sk-live-secret Authorization: Bearer bearer-secret']
      })
    );
    await writeFile(join(runDir, 'findings.json'), JSON.stringify({ findings: [] }));
    await writeFile(
      join(runDir, 'test-generation.json'),
      JSON.stringify({
        createdFiles: [],
        testCommand: null,
        validationStatus: null,
        errors: []
      })
    );

    const result = await generateHardenReport({ runDir, outputPath });
    const report = await readFile(outputPath, 'utf8');
    const patchDiff = await readFile(result.patchDiffPath, 'utf8');

    expect(report).toContain('OPENAI_API_KEY=[REDACTED]');
    expect(report).toContain('Authorization: Bearer [REDACTED]');
    expect(report).not.toContain('sk-live-secret');
    expect(report).not.toContain('bearer-secret');
    expect(patchDiff).not.toContain('sk-live-secret');
    expect(patchDiff).not.toContain('bearer-secret');
  });

  it('redacts non-bearer authorization headers from boot errors in reports and patch diffs', async () => {
    const runDir = await createRunDir();
    const outputPath = join(runDir, 'hardening-report.md');

    await writeFile(
      join(runDir, 'repo-profile.json'),
      JSON.stringify({
        framework: 'nextjs',
        packageManager: 'pnpm',
        recommendedStartCommand: 'pnpm dev',
        blockers: [],
        confidence: 'high'
      })
    );
    await writeFile(
      join(runDir, 'boot-result.json'),
      JSON.stringify({
        status: 'failed',
        url: null,
        port: null,
        blockers: [],
        errors: [
          'Authorization: Basic dXNlcjpwYXNz',
          'Proxy-Authorization: Digest digest-secret'
        ]
      })
    );
    await writeFile(join(runDir, 'findings.json'), JSON.stringify({ findings: [] }));
    await writeFile(
      join(runDir, 'test-generation.json'),
      JSON.stringify({
        createdFiles: [],
        testCommand: null,
        validationStatus: null,
        errors: []
      })
    );

    const result = await generateHardenReport({ runDir, outputPath });
    const report = await readFile(outputPath, 'utf8');
    const patchDiff = await readFile(result.patchDiffPath, 'utf8');

    expect(report).toContain('Authorization: Basic [REDACTED]');
    expect(report).toContain('Proxy-Authorization: Digest [REDACTED]');
    expect(report).not.toContain('dXNlcjpwYXNz');
    expect(report).not.toContain('digest-secret');
    expect(patchDiff).not.toContain('dXNlcjpwYXNz');
    expect(patchDiff).not.toContain('digest-secret');
  });

  it('redacts session and cookie values from finding evidence in reports and patch diffs', async () => {
    const runDir = await createRunDir();
    const outputPath = join(runDir, 'hardening-report.md');

    await writeFile(
      join(runDir, 'repo-profile.json'),
      JSON.stringify({
        framework: 'nextjs',
        packageManager: 'pnpm',
        recommendedStartCommand: 'pnpm dev',
        blockers: [],
        confidence: 'high'
      })
    );
    await writeFile(
      join(runDir, 'boot-result.json'),
      JSON.stringify({
        status: 'running',
        url: 'http://localhost:3000',
        port: 3000,
        blockers: [],
        errors: []
      })
    );
    await writeFile(
      join(runDir, 'findings.json'),
      JSON.stringify({
        findings: [
          {
            severity: 'P1',
            type: 'network_error',
            title: 'Checkout request failed',
            reproSteps: ['Go to /checkout?session=checkout-session-secret'],
            evidence: ['Cookie: session=browser-session-secret; csrftoken=csrf-secret']
          }
        ]
      })
    );
    await writeFile(
      join(runDir, 'test-generation.json'),
      JSON.stringify({
        createdFiles: [],
        testCommand: null,
        validationStatus: null,
        errors: []
      })
    );

    const result = await generateHardenReport({ runDir, outputPath });
    const report = await readFile(outputPath, 'utf8');
    const patchDiff = await readFile(result.patchDiffPath, 'utf8');

    expect(report).toContain('session=[REDACTED]');
    expect(report).toContain('csrftoken=[REDACTED]');
    expect(report).not.toContain('checkout-session-secret');
    expect(report).not.toContain('browser-session-secret');
    expect(report).not.toContain('csrf-secret');
    expect(patchDiff).not.toContain('checkout-session-secret');
    expect(patchDiff).not.toContain('browser-session-secret');
    expect(patchDiff).not.toContain('csrf-secret');
  });

  it('redacts generic cookie header values from finding evidence', async () => {
    const runDir = await createRunDir();
    const outputPath = join(runDir, 'hardening-report.md');

    await writeFile(
      join(runDir, 'repo-profile.json'),
      JSON.stringify({
        framework: 'nextjs',
        packageManager: 'pnpm',
        recommendedStartCommand: 'pnpm dev',
        blockers: [],
        confidence: 'high'
      })
    );
    await writeFile(
      join(runDir, 'boot-result.json'),
      JSON.stringify({
        status: 'running',
        url: 'http://localhost:3000',
        port: 3000,
        blockers: [],
        errors: []
      })
    );
    await writeFile(
      join(runDir, 'findings.json'),
      JSON.stringify({
        findings: [
          {
            severity: 'P1',
            type: 'network_error',
            title: 'Profile request failed',
            reproSteps: ['Go to /profile'],
            evidence: ['Cookie: theme=dark; sid=abc123; visitor_id=visitor-secret']
          }
        ]
      })
    );
    await writeFile(
      join(runDir, 'test-generation.json'),
      JSON.stringify({
        createdFiles: [],
        testCommand: null,
        validationStatus: null,
        errors: []
      })
    );

    const result = await generateHardenReport({ runDir, outputPath });
    const report = await readFile(outputPath, 'utf8');
    const patchDiff = await readFile(result.patchDiffPath, 'utf8');

    expect(report).toContain('theme=[REDACTED]');
    expect(report).toContain('sid=[REDACTED]');
    expect(report).toContain('visitor_id=[REDACTED]');
    expect(report).not.toContain('dark');
    expect(report).not.toContain('abc123');
    expect(report).not.toContain('visitor-secret');
    expect(patchDiff).not.toContain('dark');
    expect(patchDiff).not.toContain('abc123');
    expect(patchDiff).not.toContain('visitor-secret');
  });

  it('redacts URL userinfo credentials from reports and patch diffs', async () => {
    const runDir = await createRunDir();
    const outputPath = join(runDir, 'hardening-report.md');

    await writeFile(
      join(runDir, 'repo-profile.json'),
      JSON.stringify({
        framework: 'nextjs',
        packageManager: 'pnpm',
        recommendedStartCommand: 'pnpm dev',
        blockers: [],
        confidence: 'high'
      })
    );
    await writeFile(
      join(runDir, 'boot-result.json'),
      JSON.stringify({
        status: 'failed',
        url: null,
        port: null,
        blockers: [],
        errors: ['DATABASE_URL=postgres://db_user:db-pass@db.example.com/app']
      })
    );
    await writeFile(
      join(runDir, 'findings.json'),
      JSON.stringify({
        findings: [
          {
            severity: 'P1',
            type: 'network_error',
            title: 'Private endpoint request failed',
            reproSteps: ['Go to /private'],
            evidence: ['GET https://alice:browser-pass@example.com/private failed']
          }
        ]
      })
    );
    await writeFile(
      join(runDir, 'test-generation.json'),
      JSON.stringify({
        createdFiles: [],
        testCommand: null,
        validationStatus: null,
        errors: []
      })
    );

    const result = await generateHardenReport({ runDir, outputPath });
    const report = await readFile(outputPath, 'utf8');
    const patchDiff = await readFile(result.patchDiffPath, 'utf8');

    expect(report).toContain('postgres://[REDACTED]@db.example.com/app');
    expect(report).toContain('https://[REDACTED]@example.com/private');
    expect(report).not.toContain('db_user:db-pass');
    expect(report).not.toContain('alice:browser-pass');
    expect(patchDiff).not.toContain('db_user:db-pass');
    expect(patchDiff).not.toContain('alice:browser-pass');
  });

  it('redacts sensitive generated test diff content from patch diffs', async () => {
    const runDir = await createRunDir();
    const outputPath = join(runDir, 'hardening-report.md');

    await writeFile(
      join(runDir, 'repo-profile.json'),
      JSON.stringify({
        framework: 'nextjs',
        packageManager: 'pnpm',
        recommendedStartCommand: 'pnpm dev',
        blockers: [],
        confidence: 'high'
      })
    );
    await writeFile(
      join(runDir, 'boot-result.json'),
      JSON.stringify({
        status: 'running',
        url: 'http://localhost:3000',
        port: 3000,
        blockers: [],
        errors: []
      })
    );
    await writeFile(join(runDir, 'findings.json'), JSON.stringify({ findings: [] }));
    await writeFile(
      join(runDir, 'test-generation.json'),
      JSON.stringify({
        createdFiles: ['tests/hardening/generated-findings.spec.ts'],
        testCommand: 'npx playwright test tests/hardening',
        validationStatus: 'skipped',
        errors: []
      })
    );
    await mkdir(join(runDir, 'tests', 'hardening'), { recursive: true });
    await writeFile(
      join(runDir, 'tests', 'hardening', 'generated-findings.spec.ts'),
      [
        "test('leaky generated test', async ({ page }) => {",
        "  const apiKey = 'OPENAI_API_KEY=sk-generated-secret';",
        "  await page.setExtraHTTPHeaders({ Authorization: 'Basic dXNlcjpwYXNz' });",
        "  await page.goto('https://alice:browser-pass@example.com/private');",
        '});',
        ''
      ].join('\n')
    );

    const result = await generateHardenReport({ runDir, outputPath });
    const patchDiff = await readFile(result.patchDiffPath, 'utf8');

    expect(patchDiff).toContain('diff --git a/tests/hardening/generated-findings.spec.ts b/tests/hardening/generated-findings.spec.ts');
    expect(patchDiff).toContain('const apiKey = [REDACTED];');
    expect(patchDiff).toContain("Authorization: 'Basic [REDACTED]'");
    expect(patchDiff).toContain('https://[REDACTED]@example.com/private');
    expect(patchDiff).not.toContain('OPENAI_API_KEY=sk-generated-secret');
    expect(patchDiff).not.toContain('sk-generated-secret');
    expect(patchDiff).not.toContain('dXNlcjpwYXNz');
    expect(patchDiff).not.toContain('alice:browser-pass');
  });
});
