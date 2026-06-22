import { readFileSync } from 'node:fs';

import {
  buildAcceptanceMarkdown as buildLegacyAcceptanceMarkdown,
  summarizeAcceptanceChecks as summarizeLegacyAcceptanceChecks
} from '../../src/internal/acceptance/report.js';
import {
  acceptanceEntrypointFiles,
  acceptancePackageExportEntries,
  acceptancePackageDistOutputEntries,
  acceptancePackageSourceEntries,
  acceptancePackageSubpathSpecifiers,
  acceptanceRunnerMainSpecifiers,
  LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS,
  PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS,
  PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS,
  PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS,
  legacyAcceptanceWrapperSourceEntries,
  buildPackageSubpathTypeResolutionSmokeCommand,
  formatAcceptanceCommand,
  buildPackageSubpathImportSmokeCommand,
  isAcceptanceDirectRun,
  parseAcceptanceArgs,
  runAcceptanceCli,
  buildAcceptanceMarkdown,
  summarizeAcceptanceChecks,
  type AcceptanceCheck
} from '../../packages/acceptance/src/index.js';
import {
  formatAcceptanceCommand as formatLegacyAcceptanceCommand,
  parseArgs as parseLegacyAcceptanceArgs
} from '../../src/internal/acceptance/run-acceptance.js';

describe('acceptance report', () => {
  it('passes when all required checks pass and optional checks are skipped', () => {
    const checks: AcceptanceCheck[] = [
      { name: 'Unit tests', category: '质量门禁', required: true, status: 'passed', durationMs: 1000, command: 'pnpm test:unit' },
      { name: 'Browser E2E', category: '完整验收', required: false, status: 'skipped', detail: 'not requested' }
    ];

    expect(summarizeAcceptanceChecks(checks)).toEqual({
      total: 2,
      passed: 1,
      failed: 0,
      skipped: 1,
      requiredFailed: 0,
      status: 'passed'
    });
  });

  it('fails when a required check fails', () => {
    const checks: AcceptanceCheck[] = [
      { name: 'Lint', category: '质量门禁', required: true, status: 'failed', command: 'pnpm lint', detail: 'exitCode=1' },
      { name: 'Benchmark', category: '完整验收', required: true, status: 'passed', command: 'pnpm benchmark' }
    ];

    expect(summarizeAcceptanceChecks(checks)).toMatchObject({
      failed: 1,
      requiredFailed: 1,
      status: 'failed'
    });
  });

  it('builds grouped markdown with commands and conclusion', () => {
    const markdown = buildAcceptanceMarkdown({
      generatedAt: '2026-06-18T10:00:00.000Z',
      mode: 'full',
      outputPath: '/tmp/acceptance-run.md',
      summary: {
        total: 2,
        passed: 2,
        failed: 0,
        skipped: 0,
        requiredFailed: 0,
        status: 'passed'
      },
      checks: [
        { name: 'Build', category: '质量门禁', required: true, status: 'passed', durationMs: 5000, command: 'pnpm build' },
        { name: 'Benchmark 结果为 Go', category: '产物检查', required: true, status: 'passed', detail: 'docs/logs/spike-results.md' }
      ]
    });

    expect(markdown).toContain('# MVP 验收运行报告');
    expect(markdown).toContain('| 验收模式 | full |');
    expect(markdown).toContain('| 总体结论 | 通过 |');
    expect(markdown).toContain('## 质量门禁');
    expect(markdown).toContain('`pnpm build`');
    expect(markdown).toContain('## 产物检查');
  });

  it('escapes code cells in acceptance report summary and command rows', () => {
    const markdown = buildAcceptanceMarkdown({
      generatedAt: '2026-06-18T10:00:00.000Z',
      mode: 'standard',
      outputPath: '`/tmp/acceptance|run.md\ncopy`',
      summary: {
        total: 2,
        passed: 2,
        failed: 0,
        skipped: 0,
        requiredFailed: 0,
        status: 'passed'
      },
      checks: [
        {
          name: 'Command with table chars',
          category: '质量门禁',
          required: true,
          status: 'passed',
          command: 'pnpm test -- --grep `route|smoke`\nnext'
        },
        {
          name: 'Boundary backtick command',
          category: '质量门禁',
          required: true,
          status: 'passed',
          command: '`pnpm build`'
        }
      ]
    });

    expect(markdown).toContain('| 报告路径 | `` `/tmp/acceptance\\|run.md copy` `` |');
    expect(markdown).toContain('| Command with table chars | 是 | 通过 | n/a | ``pnpm test -- --grep `route\\|smoke` next`` |');
    expect(markdown).toContain('| Boundary backtick command | 是 | 通过 | n/a | `` `pnpm build` `` |');
  });

  it('redacts sensitive values from acceptance report paths, commands, and details', () => {
    const markdown = buildAcceptanceMarkdown({
      generatedAt: '2026-06-18T10:00:00.000Z',
      mode: 'full',
      outputPath: '/tmp/acceptance-API_KEY=sk-output-secret/run.md',
      summary: {
        total: 1,
        passed: 0,
        failed: 1,
        skipped: 0,
        requiredFailed: 1,
        status: 'failed'
      },
      checks: [
        {
          name: 'Command leaked secret',
          category: '质量门禁',
          required: true,
          status: 'failed',
          command: 'API_KEY=sk-command-secret pnpm test -- --url http://127.0.0.1:5173/callback?token=command-token',
          detail: 'failed with client_secret=detail-secret and callback http://127.0.0.1:5173/#access_token=detail-token'
        }
      ]
    });

    expect(markdown).toContain('API_KEY=[REDACTED]');
    expect(markdown).toContain('token=[REDACTED]');
    expect(markdown).toContain('client_secret=[REDACTED]');
    expect(markdown).toContain('access_token=[REDACTED]');
    expect(markdown).not.toContain('sk-output-secret');
    expect(markdown).not.toContain('sk-command-secret');
    expect(markdown).not.toContain('command-token');
    expect(markdown).not.toContain('detail-secret');
    expect(markdown).not.toContain('detail-token');
  });

  it('keeps the legacy src report implementation aligned with the package implementation', () => {
    const checks: AcceptanceCheck[] = [
      {
        name: 'Command leaked secret',
        category: '质量门禁',
        required: true,
        status: 'failed',
        durationMs: 5100,
        command: 'API_KEY=sk-command-secret pnpm test -- --url http://127.0.0.1:5173/callback?token=command-token',
        detail: 'failed with client_secret=detail-secret and callback http://127.0.0.1:5173/#access_token=detail-token'
      },
      {
        name: 'Benchmark 结果为 Go',
        category: '产物检查',
        required: false,
        status: 'skipped',
        detail: 'not requested'
      }
    ];
    const summary = summarizeAcceptanceChecks(checks);
    const input = {
      generatedAt: '2026-06-18T10:00:00.000Z',
      mode: 'full' as const,
      outputPath: '/tmp/acceptance-API_KEY=sk-output-secret/run.md',
      summary,
      checks
    };

    expect(summarizeLegacyAcceptanceChecks(checks)).toEqual(summary);
    expect(buildLegacyAcceptanceMarkdown(input)).toBe(buildAcceptanceMarkdown(input));
  });

  it('quotes generated acceptance commands with env values and args that contain spaces', () => {
    expect(formatAcceptanceCommand({
      name: 'Example command',
      category: '质量门禁',
      required: true,
      command: '/tmp/Agent Tester/bin/tool',
      args: ['run', 'tests/e2e/generated spec.ts'],
      timeoutMs: 1000,
      env: {
        EXAMPLE_PATH: '/tmp/Agent Tester/cache',
        MODE: 'full'
      }
    })).toBe("EXAMPLE_PATH='/tmp/Agent Tester/cache' MODE=full '/tmp/Agent Tester/bin/tool' run 'tests/e2e/generated spec.ts'");
  });

  it('defines a package subpath import smoke command for acceptance gates', () => {
    const command = buildPackageSubpathImportSmokeCommand();
    const packageJson = JSON.parse(readFileSync('packages/acceptance/package.json', 'utf8')) as {
      exports?: Record<string, unknown>;
    };
    const expectedSpecifiers = Object.keys(packageJson.exports ?? {})
      .map((exportPath) => exportPath === '.' ? '@hardening-mcp/acceptance' : `@hardening-mcp/acceptance/${exportPath.slice(2)}`)
      .sort();
    const expectedExportEntries = Object.entries(packageJson.exports ?? {})
      .map(([exportPath, value]) => {
        expect(value).toEqual(expect.objectContaining({
          types: expect.any(String),
          default: expect.any(String)
        }));
        const typedValue = value as { types: string; default: string };

        return {
          exportPath,
          types: typedValue.types,
          default: typedValue.default,
          specifier: exportPath === '.' ? '@hardening-mcp/acceptance' : `@hardening-mcp/acceptance/${exportPath.slice(2)}`
        };
      })
      .sort((a, b) => a.exportPath.localeCompare(b.exportPath));
    const commandScript = command.args.join('\n');

    expect([...acceptancePackageExportEntries].sort((a, b) => a.exportPath.localeCompare(b.exportPath))).toEqual(expectedExportEntries);
    expect([...acceptancePackageSubpathSpecifiers].sort()).toEqual(expectedSpecifiers);
    expect(acceptanceRunnerMainSpecifiers).toEqual(
      Object.values(acceptanceEntrypointFiles).map((fileName) => `@hardening-mcp/acceptance/${fileName.replace(/\.js$/u, '')}`)
    );
    expect(command).toEqual(expect.objectContaining({
      name: 'Package subpath import smoke',
      category: '质量门禁',
      required: true,
      command: 'node'
    }));
    expect(command.args).toEqual(expect.arrayContaining(['--input-type=module', '-e']));
    for (const specifier of expectedSpecifiers) {
      expect(commandScript).toContain(specifier);
    }
    expect(commandScript).toContain("runnerMainSpecifiers = [");
    expect(commandScript).toContain('@hardening-mcp/acceptance/run-acceptance');
    expect(commandScript).toContain('@hardening-mcp/acceptance/run-goal-audit');
    expect(commandScript).toContain('@hardening-mcp/acceptance/run-user-acceptance');
    expect(commandScript).toContain('@hardening-mcp/acceptance/run-user-acceptance-handoff');
    expect(commandScript).toContain('Object.keys(mod).length === 0');
    expect(commandScript).toContain('runtimeContractSpecifiers');
    expect(commandScript).not.toContain("['@hardening-mcp/acceptance', '@hardening-mcp/acceptance/compatibility']");
    expect(commandScript).toContain('expectedExportEntries');
    expect(commandScript).toContain('expectedSpecifiers');
    expect(commandScript).toContain('specifier list drift');
    expect(commandScript).toContain('expectedPackageDistOutputEntries');
    expect(commandScript).toContain('mod.acceptancePackageDistOutputEntries');
    expect(commandScript).toContain('acceptancePackageDistOutputEntries drift');
    expect(commandScript).toContain(acceptancePackageDistOutputEntries[0]?.jsPath ?? '');
    expect(commandScript).toContain('expectedPackageDistOutputSourceSpecs');
    expect(commandScript).toContain('mod.PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS');
    expect(commandScript).toContain('PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS drift');
    expect(commandScript).toContain(PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS[0]?.path ?? '');
    expect(commandScript).toContain('expectedPackageDistDeclarationSourceSpecs');
    expect(commandScript).toContain('mod.PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS');
    expect(commandScript).toContain('PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS drift');
    expect(commandScript).toContain(PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS[0]?.path ?? '');
    expect(commandScript).toContain('expectedPackageDistSourceMapSourceSpecs');
    expect(commandScript).toContain('mod.PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS');
    expect(commandScript).toContain('PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS drift');
    expect(commandScript).toContain(PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS[0]?.path ?? '');
    expect(commandScript).toContain('expectedLegacyDistSourceMapSourceSpecs');
    expect(commandScript).toContain('mod.LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS');
    expect(commandScript).toContain('LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS drift');
    expect(commandScript).toContain(LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS[0]?.path ?? '');
    expect(commandScript).toContain('expectedPackageSourceEntries');
    expect(commandScript).toContain('mod.acceptancePackageSourceEntries');
    expect(commandScript).toContain('acceptancePackageSourceEntries drift');
    expect(commandScript).toContain(acceptancePackageSourceEntries[0]?.path ?? '');
    expect(commandScript).toContain('mod.acceptancePackageExportEntries');
    expect(commandScript).toContain('acceptancePackageExportEntries drift');
    expect(commandScript).toContain('expectedLegacyDistOutputEntries');
    expect(commandScript).toContain('mod.legacyAcceptanceDistOutputEntries');
    expect(commandScript).toContain('legacyAcceptanceDistOutputEntries drift');
    expect(commandScript).toContain('expectedLegacyWrapperSourceEntries');
    expect(commandScript).toContain('mod.legacyAcceptanceWrapperSourceEntries');
    expect(commandScript).toContain('legacyAcceptanceWrapperSourceEntries drift');
    expect(commandScript).toContain(legacyAcceptanceWrapperSourceEntries[0]?.path ?? '');
    expect(formatAcceptanceCommand(command)).toContain('Package subpath imports ok');
  });

  it('defines a package subpath type-resolution smoke command for acceptance gates', () => {
    const command = buildPackageSubpathTypeResolutionSmokeCommand();

    expect(command).toEqual(expect.objectContaining({
      name: 'Package subpath type-resolution smoke',
      category: '质量门禁',
      required: true,
      command: 'node'
    }));
    expect(command.args).toEqual(expect.arrayContaining([
      'node_modules/typescript/bin/tsc',
      '--ignoreConfig',
      '--noEmit',
      '--module',
      'NodeNext',
      '--moduleResolution',
      'NodeNext',
      'tests/type-smoke/acceptance-package-subpaths.ts'
    ]));
    expect(formatAcceptanceCommand(command)).toContain('tests/type-smoke/acceptance-package-subpaths.ts');
  });

  it('keeps package-owned acceptance runner helpers compatible with the legacy implementation', () => {
    const args = ['--', '--full', '--browser', '--output', 'docs/custom-acceptance.md'];
    const command = {
      name: 'Example command',
      category: '质量门禁',
      required: true,
      command: '/tmp/Agent Tester/bin/tool',
      args: ['run', 'tests/e2e/generated spec.ts'],
      timeoutMs: 1000,
      env: {
        EXAMPLE_PATH: '/tmp/Agent Tester/cache',
        MODE: 'full'
      }
    };

    expect(parseAcceptanceArgs(args)).toEqual(parseLegacyAcceptanceArgs(args));
    expect(formatAcceptanceCommand(command)).toBe(formatLegacyAcceptanceCommand(command));
  });

  it('detects direct execution when the file path contains spaces', () => {
    expect(isAcceptanceDirectRun('file:///tmp/Agent%20Tester/dist/internal/acceptance/run-acceptance.js', '/tmp/Agent Tester/dist/internal/acceptance/run-acceptance.js')).toBe(true);
    expect(isAcceptanceDirectRun('file:///tmp/Agent%20Tester/dist/internal/acceptance/run-acceptance.js', '/tmp/Other/dist/internal/acceptance/run-acceptance.js')).toBe(false);
  });

  it('parses pnpm forwarded args with separator', () => {
    expect(parseAcceptanceArgs(['--', '--full', '--browser'])).toMatchObject({
      mode: 'full',
      browser: true
    });
  });

  it('prints acceptance help without running checks', async () => {
    const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    try {
      await expect(runAcceptanceCli(['--help'])).resolves.toBe(0);
      const output = stdout.mock.calls.map(([chunk]) => String(chunk)).join('');
      expect(output).toContain('Usage:');
      expect(output).toContain('pnpm acceptance -- [--full] [--browser]');
      expect(output).toContain('pnpm acceptance -- -h');
      expect(output).toContain('--output <path>');
    } finally {
      stdout.mockRestore();
    }
  });

  it('trims surrounding whitespace from acceptance output values', () => {
    const separated = parseAcceptanceArgs(['--output', ' docs/custom-acceptance.md ']);
    const inline = parseAcceptanceArgs(['--output= docs/inline-acceptance.md ']);

    expect(separated.outputPath).toMatch(/docs\/custom-acceptance\.md$/);
    expect(inline.outputPath).toMatch(/docs\/inline-acceptance\.md$/);
    expect(separated.outputPath).not.toContain(' custom-acceptance.md ');
    expect(inline.outputPath).not.toContain(' inline-acceptance.md ');
  });

  it('rejects acceptance output when the next token is another option', () => {
    expect(() => parseAcceptanceArgs(['--output', '--full'])).toThrow('Missing value for --output');
    expect(() => parseAcceptanceArgs(['--output', ' --browser '])).toThrow('Missing value for --output');
  });
});
