import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { formatCliJsonOutput, parseGenerateTestsOptions, parseRepoUrlOptions, runCli } from '../../src/adapters/cli/run.js';

async function runCliForTest(args: string[]): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  let stdout = '';
  let stderr = '';
  const exitCode = await runCli(args, {
    writeStdout: (chunk) => {
      stdout += chunk;
    },
    writeStderr: (chunk) => {
      stderr += chunk;
    }
  });

  return { exitCode, stdout, stderr };
}

describe('parseRepoUrlOptions', () => {
  it('parses repo, url, and browser mode', () => {
    expect(parseRepoUrlOptions(['./app', 'http://localhost:3000', '--browser'])).toEqual({
      root: './app',
      url: 'http://localhost:3000',
      useBrowser: true,
      criticalPaths: []
    });
  });

  it('parses hardening flow controls', () => {
    expect(
      parseRepoUrlOptions([
        './app',
        '--browser',
        '--critical-path',
        '/login',
        '--critical-path=/settings',
        '--max-routes',
        '7',
        '--max-actions-per-route=3',
        '--start-command',
        'pnpm preview',
        '--boot-timeout-ms',
        '45000',
        '--storage-state',
        '.auth/user.json',
        '--workspace-output',
        '.hardening-workspace',
        '--trace'
      ])
    ).toEqual({
      root: './app',
      useBrowser: true,
      criticalPaths: ['/login', '/settings'],
      maxRoutes: 7,
      maxActionsPerRoute: 3,
      startCommand: 'pnpm preview',
      bootTimeoutMs: 45000,
      storageStatePath: '.auth/user.json',
      workspaceOutputDir: '.hardening-workspace',
      trace: true
    });
  });

  it('rejects unknown options', () => {
    expect(parseRepoUrlOptions(['./app', 'http://localhost:3000', '--headful'])).toEqual({
      root: './app',
      url: 'http://localhost:3000',
      useBrowser: false,
      criticalPaths: [],
      error: 'Unknown option: --headful'
    });
  });

  it('allows zero max actions to disable browser interactions', () => {
    expect(parseRepoUrlOptions(['./app', '--max-actions-per-route', '0'])).toEqual({
      root: './app',
      useBrowser: false,
      criticalPaths: [],
      maxActionsPerRoute: 0
    });
  });

  it('preserves natural-language critical path intents', () => {
    expect(parseRepoUrlOptions(['./app', '--critical-path', 'login, create a project, then send a chat message'])).toEqual({
      root: './app',
      useBrowser: false,
      criticalPaths: ['login, create a project, then send a chat message']
    });
  });

  it('trims next-argument option values for repo/url commands', () => {
    expect(
      parseRepoUrlOptions([
        './app',
        '--critical-path',
        ' /login ',
        '--start-command',
        ' pnpm preview ',
        '--storage-state',
        ' .auth/user.json '
      ])
    ).toEqual({
      root: './app',
      useBrowser: false,
      criticalPaths: ['/login'],
      startCommand: 'pnpm preview',
      storageStatePath: '.auth/user.json'
    });
  });

  it('rejects invalid numeric options', () => {
    expect(parseRepoUrlOptions(['./app', '--max-routes', '0'])).toEqual({
      root: './app',
      useBrowser: false,
      criticalPaths: [],
      error: 'Invalid positive integer for --max-routes: 0'
    });
  });

  it('rejects extra positional arguments for repo/url commands', () => {
    expect(parseRepoUrlOptions(['./app', 'http://localhost:3000', 'unexpected'])).toEqual({
      root: './app',
      url: 'http://localhost:3000',
      useBrowser: false,
      criticalPaths: [],
      error: 'Unexpected argument: unexpected'
    });
  });
});

describe('parseGenerateTestsOptions', () => {
  it('parses smoke routes for standalone test generation', () => {
    expect(parseGenerateTestsOptions([
      '.hardening/run/findings.json',
      'tests/hardening',
      '--smoke-route',
      '/login',
      '--smoke-route=/settings'
    ])).toEqual({
      findingsPath: '.hardening/run/findings.json',
      outputDir: 'tests/hardening',
      smokeRoutes: ['/login', '/settings']
    });
  });

  it('parses base URL for standalone test generation', () => {
    expect(parseGenerateTestsOptions([
      '.hardening/run/findings.json',
      'tests/hardening',
      '--base-url',
      ' http://127.0.0.1:5173/dashboard '
    ])).toEqual({
      findingsPath: '.hardening/run/findings.json',
      outputDir: 'tests/hardening',
      smokeRoutes: [],
      baseUrl: 'http://127.0.0.1:5173/dashboard'
    });
  });

  it('parses inline base URL for standalone test generation', () => {
    expect(parseGenerateTestsOptions([
      '.hardening/run/findings.json',
      'tests/hardening',
      '--base-url=https://app.example.test/workspace'
    ])).toEqual({
      findingsPath: '.hardening/run/findings.json',
      outputDir: 'tests/hardening',
      smokeRoutes: [],
      baseUrl: 'https://app.example.test/workspace'
    });
  });

  it('rejects unknown generate-tests options', () => {
    expect(parseGenerateTestsOptions([
      '.hardening/run/findings.json',
      'tests/hardening',
      '--critical-path',
      '/login'
    ])).toEqual({
      findingsPath: '.hardening/run/findings.json',
      outputDir: 'tests/hardening',
      smokeRoutes: [],
      error: 'Unknown option: --critical-path'
    });
  });

  it('trims next-argument smoke route values for standalone test generation', () => {
    expect(parseGenerateTestsOptions([
      '.hardening/run/findings.json',
      'tests/hardening',
      '--smoke-route',
      ' /settings '
    ])).toEqual({
      findingsPath: '.hardening/run/findings.json',
      outputDir: 'tests/hardening',
      smokeRoutes: ['/settings']
    });
  });

  it('rejects extra positional arguments for standalone test generation', () => {
    expect(parseGenerateTestsOptions([
      '.hardening/run/findings.json',
      'tests/hardening',
      'unexpected'
    ])).toEqual({
      findingsPath: '.hardening/run/findings.json',
      outputDir: 'tests/hardening',
      smokeRoutes: [],
      error: 'Unexpected argument: unexpected'
    });
  });
});

describe('runCli argument validation', () => {
  it('prints global help with help and version options', async () => {
    await expect(runCliForTest(['--help'])).resolves.toEqual({
      exitCode: 0,
      stdout: expect.stringContaining('--help, -h'),
      stderr: ''
    });
    await expect(runCliForTest(['--help'])).resolves.toEqual({
      exitCode: 0,
      stdout: expect.stringContaining('--version, -v'),
      stderr: ''
    });
  });

  it.each([
    ['analyze', 'hardening analyze <repo>'],
    ['explore', 'hardening explore <repo> <url>'],
    ['generate-tests', 'hardening generate-tests <findingsPath> <outputDir>'],
    ['plan', 'hardening plan <repo>'],
    ['report', 'hardening report <runDir> <outputPath>'],
    ['security', 'hardening security import --provider <provider> --scan-dir <dir> --repo <repo> --run-dir <dir>'],
    ['run', 'hardening run <repo> [url]']
  ])('prints command help for %s without running the command', async (command, usage) => {
    await expect(runCliForTest([command, '--help'])).resolves.toEqual({
      exitCode: 0,
      stdout: expect.stringContaining(usage),
      stderr: ''
    });
  });

  it.each(['analyze', 'explore', 'generate-tests', 'plan', 'report', 'security', 'run'])(
    'prints short command help for %s with the help option documented',
    async (command) => {
      await expect(runCliForTest([command, '-h'])).resolves.toEqual({
        exitCode: 0,
        stdout: expect.stringContaining('--help, -h'),
        stderr: ''
      });
    }
  );

  it('rejects extra positional arguments for analyze', async () => {
    await expect(runCliForTest(['analyze', './app', 'unexpected'])).resolves.toEqual({
      exitCode: 1,
      stdout: '',
      stderr: 'Unexpected argument: unexpected\n'
    });
  });

  it('redacts sensitive values from CLI validation errors', async () => {
    const result = await runCliForTest([
      'analyze',
      './app',
      'API_KEY=sk-cli-secret',
      'http://127.0.0.1:5173/callback?token=url-secret'
    ]);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe('');
    expect(result.stderr).toContain('API_KEY=[REDACTED]');
    expect(result.stderr).not.toContain('sk-cli-secret');
    expect(result.stderr).not.toContain('url-secret');
  });

  it('rejects extra positional arguments for report', async () => {
    await expect(runCliForTest(['report', '.hardening/run', 'hardening-report.md', 'unexpected'])).resolves.toEqual({
      exitCode: 1,
      stdout: '',
      stderr: 'Unexpected argument: unexpected\n'
    });
  });

  it('imports local security evidence from the CLI without running a scanner', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'repoassure-cli-security-repo-'));
    const runDir = join(repoRoot, '.hardening', 'runs', 'run-cli-security');
    const result = await runCliForTest([
      'security',
      'import',
      '--provider',
      'codex-security',
      '--scan-dir',
      join(process.cwd(), 'fixtures/security/codex-security-basic'),
      '--repo',
      repoRoot,
      '--run-dir',
      runDir
    ]);
    const output = JSON.parse(result.stdout) as {
      securitySummaryPath: string;
      securityFindingsPath: string;
      findingCount: number;
      highestSeverity: string;
      repairPlanningHandoff: {
        status: string;
        securityFindingsPath: string;
        cli: { command: string; argv: string[] };
        mcp: { tool: string; arguments: { root: string; runDir: string } };
        reviewBoundary: { autoApply: boolean; targetMutation: boolean; maintainerReviewRequired: boolean };
      };
    };

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe('');
    expect(output.findingCount).toBe(1);
    expect(output.highestSeverity).toBe('P1');
    expect(output.repairPlanningHandoff).toEqual({
      status: 'ready',
      securityFindingsPath: output.securityFindingsPath,
      cli: {
        command: 'hardening plan',
        argv: [repoRoot, '--run-dir', runDir]
      },
      mcp: {
        tool: 'generate_repair_plan',
        arguments: { root: repoRoot, runDir }
      },
      reviewBoundary: {
        autoApply: false,
        targetMutation: false,
        maintainerReviewRequired: true
      }
    });
    await expect(readFile(output.securitySummaryPath, 'utf8')).resolves.toContain('"providerCount": 1');
    await expect(readFile(output.securityFindingsPath, 'utf8')).resolves.toContain('"provider": "codex-security"');
  });

  it('lists every supported security provider and its honest normalized input contract', async () => {
    const result = await runCliForTest(['security', 'providers']);
    const output = JSON.parse(result.stdout) as {
      providers: Array<{ id: string; nativeFormatSupport: boolean; inputContract: { requiredFile: string; schema: string } }>;
    };

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe('');
    expect(output.providers.map((provider) => provider.id)).toEqual([
      'codex-security',
      'codeql',
      'semgrep',
      'gitleaks',
      'osv',
      'manual-import'
    ]);
    expect(output.providers.every((provider) => provider.nativeFormatSupport === false)).toBe(true);
    expect(output.providers[0]?.inputContract).toEqual({
      sourceType: 'scan-dir',
      requiredFile: 'scan.json',
      schema: 'repoassure.normalized-security-scan.v1'
    });
  });

  it('documents provider discovery and the normalized-envelope boundary in security help', async () => {
    const result = await runCliForTest(['security', '--help']);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('hardening security providers');
    expect(result.stdout).toContain('repoassure.normalized-security-scan.v1');
    expect(result.stdout).toContain('Native provider formats are not accepted');
  });

  it('names only the missing security import options', async () => {
    const result = await runCliForTest(['security', 'import', '--provider', 'codex-security', '--repo', '/tmp/repo']);

    expect(result).toEqual({
      exitCode: 1,
      stdout: '',
      stderr: 'Missing required options: --scan-dir, --run-dir\n'
    });
  });

  it('guides unsupported providers to the provider catalog', async () => {
    const result = await runCliForTest(['security', 'import', '--provider', 'native-sarif']);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe('');
    expect(result.stderr).toContain('provider_unsupported');
    expect(result.stderr).toContain('hardening security providers');
    expect(result.stderr).toContain('normalized scan.json');
  });

  it('returns a stable redacted import error with actionable guidance', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'repoassure-cli-security-error-repo-'));
    const scanDir = join(repoRoot, 'scan-sk-cli-secret');
    const result = await runCliForTest([
      'security',
      'import',
      '--provider',
      'codex-security',
      '--scan-dir',
      scanDir,
      '--repo',
      repoRoot,
      '--run-dir',
      join(repoRoot, '.hardening', 'runs', 'run-error')
    ]);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe('');
    expect(result.stderr).toContain('scan_file_missing');
    expect(result.stderr).toContain('Guidance:');
    expect(result.stderr).not.toContain(scanDir);
    expect(result.stderr).not.toContain('sk-cli-secret');
  });
});

describe('formatCliJsonOutput', () => {
  it('redacts sensitive values from successful CLI JSON output', () => {
    const output = formatCliJsonOutput({
      reportPath: '/tmp/app/hardening-report.md?token=path-secret',
      nested: {
        evidence: 'API_KEY=sk-stdout-secret',
        url: 'http://127.0.0.1:5173/callback?code=oauth-secret#access_token=fragment-secret'
      }
    });

    expect(output).toContain('token=[REDACTED]');
    expect(output).toContain('API_KEY=[REDACTED]');
    expect(output).toContain('code=[REDACTED]');
    expect(output).toContain('access_token=[REDACTED]');
    expect(output).not.toContain('path-secret');
    expect(output).not.toContain('sk-stdout-secret');
    expect(output).not.toContain('oauth-secret');
    expect(output).not.toContain('fragment-secret');
  });
});
