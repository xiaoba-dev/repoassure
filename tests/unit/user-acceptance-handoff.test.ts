import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  parseUserAcceptanceHandoffArgs as parseLegacyUserAcceptanceHandoffArgs,
  runUserAcceptanceHandoff as runLegacyUserAcceptanceHandoff
} from '../../src/internal/acceptance/run-user-acceptance-handoff.js';
import {
  buildUserAcceptanceHandoffMarkdown as buildLegacyUserAcceptanceHandoffMarkdown
} from '../../src/internal/acceptance/user-acceptance-handoff.js';
import {
  buildUserAcceptanceHandoffRepoPreflightChecks,
  main,
  parseUserAcceptanceHandoffArgs,
  runUserAcceptanceHandoff
} from '../../packages/acceptance/src/run-user-acceptance-handoff.js';
import { buildUserAcceptanceHandoffMarkdown } from '../../packages/acceptance/src/user-acceptance-handoff.js';
import type { GoalAuditItem } from '../../packages/acceptance/src/goal-audit.js';

describe('user acceptance handoff', () => {
  it('keeps package-owned handoff runner helpers compatible with the legacy implementation', async () => {
    expect(parseUserAcceptanceHandoffArgs(['--', '--repo', 'fixtures/benchmark/vite-basic', '--output', 'artifacts/handoff.md']))
      .toEqual(parseLegacyUserAcceptanceHandoffArgs(['--', '--repo', 'fixtures/benchmark/vite-basic', '--output', 'artifacts/handoff.md']));

    const items: GoalAuditItem[] = [
      {
        category: '质量门禁',
        requirement: '完整验收门禁通过',
        status: 'passed',
        evidence: ['docs/acceptance/acceptance-run.md full mode passed']
      },
      {
        category: '用户验收',
        requirement: '用户确认 MVP 符合预期',
        status: 'manual_required',
        evidence: ['manual confirmation is still required'],
        nextAction: '等待用户确认'
      }
    ];

    const runInput = {
      options: {
        outputPath: '/workspace/docs/acceptance/user-acceptance-handoff.md',
        isDefaultOutputPath: false
      },
      generatedAt: '2026-06-20T12:00:00.000Z',
      buildGoalAuditItems: vi.fn().mockResolvedValue(items),
      writeHandoff: vi.fn().mockResolvedValue(undefined),
      writeStdout: vi.fn()
    };
    const legacyRunInput = {
      ...runInput,
      buildGoalAuditItems: vi.fn().mockResolvedValue(items),
      writeHandoff: vi.fn().mockResolvedValue(undefined),
      writeStdout: vi.fn()
    };

    await expect(runUserAcceptanceHandoff(runInput)).resolves.toBe(await runLegacyUserAcceptanceHandoff(legacyRunInput));
    expect(runInput.writeHandoff.mock.calls).toEqual(legacyRunInput.writeHandoff.mock.calls);
    expect(runInput.writeStdout.mock.calls).toEqual(legacyRunInput.writeStdout.mock.calls);
  });

  it('keeps package-owned handoff output compatible with the legacy implementation', () => {
    const input = {
      generatedAt: '2026-06-20T00:00:00.000Z',
      overallStatus: 'ready_for_user_acceptance' as const,
      automaticPassed: 24,
      automaticMissing: 0,
      manualRequired: 1,
      goalAuditPath: 'docs/acceptance/goal-completion-audit.md',
      userAcceptanceRecordPath: 'docs/acceptance/user-acceptance-record.md',
      userAcceptanceGuidePath: 'docs/acceptance/guides/user-acceptance-guide.md',
      acceptanceChecklistPath: 'docs/acceptance/checklists/acceptance-checklist-v0.1.md',
      repoRoot: '/tmp/real-app-API_KEY=sk-handoff-secret',
      qualityGateItem: {
        category: '质量门禁',
        requirement: '完整验收门禁通过',
        status: 'passed' as const,
        evidence: ['docs/acceptance/acceptance-run.md full mode passed']
      },
      userAcceptanceItem: {
        category: '用户验收',
        requirement: '用户确认 MVP 符合预期',
        status: 'manual_required' as const,
        evidence: ['token=handoff-token'],
        nextAction: '等待用户确认'
      },
      repoPreflightChecks: [
        {
          name: 'repo|root',
          required: true,
          status: 'failed' as const,
          evidence: 'missing repo root with client_secret=preflight-secret'
        }
      ]
    };

    expect(buildUserAcceptanceHandoffMarkdown(input)).toBe(buildLegacyUserAcceptanceHandoffMarkdown(input));
    expect(buildUserAcceptanceHandoffMarkdown(input)).not.toContain('sk-handoff-secret');
    expect(buildUserAcceptanceHandoffMarkdown(input)).not.toContain('handoff-token');
    expect(buildUserAcceptanceHandoffMarkdown(input)).not.toContain('preflight-secret');
  });

  it('builds a concise handoff package for the final manual acceptance step', () => {
    const markdown = buildUserAcceptanceHandoffMarkdown({
      generatedAt: '2026-06-19T12:00:00.000Z',
      overallStatus: 'ready_for_user_acceptance',
      automaticPassed: 23,
      automaticMissing: 0,
      manualRequired: 1,
      goalAuditPath: 'docs/acceptance/goal-completion-audit.md',
      userAcceptanceRecordPath: 'docs/acceptance/user-acceptance-record.md',
      userAcceptanceGuidePath: 'docs/acceptance/guides/user-acceptance-guide.md',
      acceptanceChecklistPath: 'docs/acceptance/checklists/acceptance-checklist-v0.1.md',
      qualityGateItem: {
        category: '质量门禁',
        requirement: '完整验收门禁通过',
        status: 'passed',
        evidence: ['docs/acceptance/acceptance-run.md full mode passed and is fresh for the current goal update date']
      },
      architectureItems: [
        {
          category: '架构迁移',
          requirement: 'Acceptance package typed module exports',
          status: 'passed',
          evidence: ['exact package export surface matches acceptancePackageExportEntries; package dist output contract matches acceptancePackageDistOutputEntries including .js.map sourceMapPath; package dist source specs match PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS, PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS, and PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS; package source contract matches acceptancePackageSourceEntries; typed dist entrypoints have no unexpected package exports']
        }
      ],
      userAcceptanceItem: {
        category: '用户验收',
        requirement: '用户确认 MVP 符合预期',
        status: 'manual_required',
        evidence: ['docs/goals/codex-goal.md Success Definition requires user confirmation'],
        nextAction: '等待用户提供真实 Web App repo 或人工验收结论'
      }
    });

    expect(markdown).toContain('# 用户验收交接包');
    expect(markdown).toContain('| 自动证据通过 | 23 |');
    expect(markdown).toContain('| 自动证据缺失 | 0 |');
    expect(markdown).toContain('| 需要人工确认 | 1 |');
    expect(markdown).toContain('当前结论：自动证据已齐，仍需用户验收结论。');
    expect(markdown).toContain('pnpm user:handoff -- --help');
    expect(markdown).toContain('pnpm user:handoff -- --repo <real-web-app-repo>');
    expect(markdown).toContain('pnpm user:handoff -- --output <path>');
    expect(markdown).toContain('pnpm user:accept -- --repo <real-web-app-repo> --browser --validate-generated-tests --decision pending');
    expect(markdown).toContain('pnpm user:accept -- --repo <real-web-app-repo> --browser --validate-generated-tests --decision accepted --notes "用户确认 MVP 符合预期"');
    expect(markdown).toContain('pnpm user:accept -- --repo <real-web-app-repo> --browser --decision changes_requested --notes "补齐登录态探索并降低误报"');
    expect(markdown).not.toContain('--decision changes_requested --notes "<具体修改项>"');
    expect(markdown).toContain('## 自动质量门禁');
    expect(markdown).toContain('| 完整验收门禁通过 | 已通过 | docs/acceptance/acceptance-run.md full mode passed and is fresh for the current goal update date |  |');
    expect(markdown).toContain('## 架构迁移状态');
    expect(markdown).toContain('| Acceptance package typed module exports | 已通过 | exact package export surface matches acceptancePackageExportEntries; package dist output contract matches acceptancePackageDistOutputEntries including .js.map sourceMapPath; package dist source specs match PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS, PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS, and PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS; package source contract matches acceptancePackageSourceEntries; typed dist entrypoints have no unexpected package exports |  |');
    expect(markdown).toContain('## 用户验收状态');
    expect(markdown).toContain('| 用户确认 MVP 符合预期 | 需要人工确认 | docs/goals/codex-goal.md Success Definition requires user confirmation | 等待用户提供真实 Web App repo 或人工验收结论 |');
    expect(markdown).toContain('accepted 验收记录的生成时间必须不早于 `docs/goals/codex-goal.md` 的最后更新日期');
    expect(markdown).toContain('accepted 验收记录必须包含具体确认备注');
    expect(markdown).toContain('generated Playwright spec 执行验证必须通过');
    expect(markdown).toContain('不能由自动脚本代替用户确认');
  });

  it('prints help without generating the handoff package', async () => {
    const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    try {
      await expect(main(['--help'])).resolves.toBe(0);
      const output = stdout.mock.calls.map(([chunk]) => String(chunk)).join('');
      expect(output).toContain('Usage:');
      expect(output).toContain('pnpm user:handoff');
      expect(output).toContain('--mode <browser|cli>');
      expect(output).toContain('--output <path>');
    } finally {
      stdout.mockRestore();
    }
  });

  it('parses explicit CLI handoff mode while preserving browser default', () => {
    expect(parseUserAcceptanceHandoffArgs(['--repo', 'fixtures/benchmark/vite-basic'])).toMatchObject({
      mode: 'browser',
      repoRoot: expect.stringContaining('fixtures/benchmark/vite-basic')
    });

    expect(parseUserAcceptanceHandoffArgs(['--mode', 'cli', '--repo', 'fixtures/python-cli-basic'])).toMatchObject({
      mode: 'cli',
      repoRoot: expect.stringContaining('fixtures/python-cli-basic')
    });
  });

  it('renders CLI-specific preflight and acceptance commands for Python CLI repos', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-python-cli-handoff-'));
    const writes: string[] = [];

    try {
      await writeFile(join(repoRoot, 'pyproject.toml'), [
        '[project]',
        'name = "python-cli-fixture"',
        '',
        '[project.scripts]',
        'python-cli-fixture = "python_cli_fixture:main"'
      ].join('\n'));

      await expect(runUserAcceptanceHandoff({
        options: {
          outputPath: join(repoRoot, 'handoff.md'),
          isDefaultOutputPath: false,
          repoRoot,
          mode: 'cli'
        },
        generatedAt: '2026-06-21T00:00:00.000Z',
        buildGoalAuditItems: vi.fn().mockResolvedValue([
          {
            category: '用户验收',
            requirement: '用户确认 MVP 符合预期',
            status: 'manual_required',
            evidence: ['manual confirmation is still required']
          }
        ]),
        writeHandoff: async (_path, markdown) => {
          writes.push(markdown);
        },
        writeStdout: () => undefined
      })).resolves.toBe(0);

      expect(writes[0]).toContain('| 验收模式 | cli |');
      expect(writes[0]).toContain('| pyproject.toml 是有效文件 | 是 | 通过 |');
      expect(writes[0]).toContain(`pnpm user:accept -- --repo ${repoRoot} --mode cli --decision pending`);
      expect(writes[0]).toContain('--mode cli --decision accepted --notes');
      expect(writes[0]).not.toContain('--browser --validate-generated-tests');
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

  it('writes the handoff package to a custom output path', async () => {
    const outputPath = '/workspace/custom/handoff.md';
    const writes: Array<{ outputPath: string; markdown: string }> = [];

    await expect(runUserAcceptanceHandoff({
      options: {
        outputPath,
        isDefaultOutputPath: false
      },
      generatedAt: '2026-06-20T12:00:00.000Z',
      buildGoalAuditItems: vi.fn().mockResolvedValue([
        {
          category: '用户验收',
          requirement: '用户确认 MVP 符合预期',
          status: 'passed',
          evidence: ['docs/acceptance/user-acceptance-record.md records accepted user decision']
        }
      ]),
      writeHandoff: async (path, markdown) => {
        writes.push({ outputPath: path, markdown });
      },
      writeStdout: () => undefined
    })).resolves.toBe(0);

    expect(writes).toEqual([
      expect.objectContaining({
        outputPath,
        markdown: expect.stringContaining('# 用户验收交接包')
      })
    ]);
    expect(writes[0]?.markdown).toContain('不能由自动脚本代替用户确认');
  });

  it('explains when automatic goal evidence is still incomplete', () => {
    const markdown = buildUserAcceptanceHandoffMarkdown({
      generatedAt: '2026-06-19T12:00:00.000Z',
      overallStatus: 'incomplete',
      automaticPassed: 22,
      automaticMissing: 1,
      manualRequired: 1,
      goalAuditPath: 'docs/acceptance/goal-completion-audit.md',
      userAcceptanceRecordPath: 'docs/acceptance/user-acceptance-record.md',
      userAcceptanceGuidePath: 'docs/acceptance/guides/user-acceptance-guide.md',
      acceptanceChecklistPath: 'docs/acceptance/checklists/acceptance-checklist-v0.1.md'
    });

    expect(markdown).toContain('当前结论：仍有自动可验证缺失项，先修复缺失项后再请求用户验收。');
  });

  it('prioritizes required repo preflight blockers in the current conclusion', () => {
    const markdown = buildUserAcceptanceHandoffMarkdown({
      generatedAt: '2026-06-19T12:00:00.000Z',
      overallStatus: 'ready_for_user_acceptance',
      automaticPassed: 24,
      automaticMissing: 0,
      manualRequired: 1,
      goalAuditPath: 'docs/acceptance/goal-completion-audit.md',
      userAcceptanceRecordPath: 'docs/acceptance/user-acceptance-record.md',
      userAcceptanceGuidePath: 'docs/acceptance/guides/user-acceptance-guide.md',
      acceptanceChecklistPath: 'docs/acceptance/checklists/acceptance-checklist-v0.1.md',
      repoRoot: '/tmp/missing-app',
      repoPreflightChecks: [
        {
          name: 'repo root 是有效目录',
          required: true,
          status: 'failed',
          evidence: 'missing repo root: /tmp/missing-app'
        },
        {
          name: 'package.json 是有效文件',
          required: true,
          status: 'skipped',
          evidence: 'repo root check failed'
        }
      ]
    });

    expect(markdown).toContain('当前结论：Repo 前置检查未通过，先修复 repo 路径或 package.json manifest。');
    expect(markdown).not.toContain('当前结论：自动证据已齐，仍需用户验收结论。');
  });

  it('recomputes the default handoff summary after refreshing the self-referential handoff document', async () => {
    const missingHandoffItems: GoalAuditItem[] = [
      {
        category: '用户验收材料',
        requirement: '用户验收交接包',
        status: 'missing',
        evidence: ['old handoff document is stale']
      },
      {
        category: '用户验收',
        requirement: '用户确认 MVP 符合预期',
        status: 'manual_required',
        evidence: ['manual confirmation is still required']
      }
    ];
    const refreshedItems: GoalAuditItem[] = [
      {
        category: '用户验收材料',
        requirement: '用户验收交接包',
        status: 'passed',
        evidence: ['refreshed handoff document contains the required evidence']
      },
      {
        category: '用户验收',
        requirement: '用户确认 MVP 符合预期',
        status: 'manual_required',
        evidence: ['manual confirmation is still required']
      }
    ];
    const writes: string[] = [];

    await expect(runUserAcceptanceHandoff({
      options: {
        outputPath: '/workspace/docs/acceptance/user-acceptance-handoff.md',
        isDefaultOutputPath: true
      },
      generatedAt: '2026-06-19T12:00:00.000Z',
      buildGoalAuditItems: vi.fn()
        .mockResolvedValueOnce(missingHandoffItems)
        .mockResolvedValueOnce(refreshedItems),
      writeHandoff: async (_outputPath, markdown) => {
        writes.push(markdown);
      },
      writeStdout: () => undefined
    })).resolves.toBe(0);

    expect(writes).toHaveLength(2);
    expect(writes[0]).toContain('| 自动证据通过 | 0 |');
    expect(writes[0]).toContain('| 自动证据缺失 | 1 |');
    expect(writes[1]).toContain('| 自动证据通过 | 1 |');
    expect(writes[1]).toContain('| 自动证据缺失 | 0 |');
  });

  it('refreshes the linked goal audit document when writing the default handoff package', async () => {
    const items: GoalAuditItem[] = [
      {
        category: '用户验收材料',
        requirement: '用户验收交接包',
        status: 'passed',
        evidence: ['handoff document is current']
      },
      {
        category: '用户验收',
        requirement: '用户确认 MVP 符合预期',
        status: 'manual_required',
        evidence: ['manual confirmation is still required']
      }
    ];
    const goalAuditWrites: Array<{ outputPath: string; markdown: string }> = [];

    await expect(runUserAcceptanceHandoff({
      options: {
        outputPath: '/workspace/docs/acceptance/user-acceptance-handoff.md',
        isDefaultOutputPath: true
      },
      generatedAt: '2026-06-19T12:00:00.000Z',
      buildGoalAuditItems: vi.fn().mockResolvedValue(items),
      writeGoalAudit: async (outputPath, markdown) => {
        goalAuditWrites.push({ outputPath, markdown });
      },
      writeHandoff: async () => undefined,
      writeStdout: () => undefined
    })).resolves.toBe(0);

    expect(goalAuditWrites).toEqual([
      expect.objectContaining({
        outputPath: expect.stringContaining('docs/acceptance/goal-completion-audit.md'),
        markdown: expect.stringContaining('| 已通过 | 1 |')
      })
    ]);
    expect(goalAuditWrites[0]?.markdown).toContain('生成时间：2026-06-19T12:00:00.000Z');
  });

  it('renders the current user acceptance status from goal audit items', async () => {
    const items: GoalAuditItem[] = [
      {
        category: '用户验收材料',
        requirement: '用户验收交接包',
        status: 'passed',
        evidence: ['handoff document is current']
      },
      {
        category: '用户验收',
        requirement: '用户确认 MVP 符合预期',
        status: 'missing',
        evidence: ['docs/acceptance/user-acceptance-record.md contains changes_requested with concrete notes'],
        nextAction: '按用户备注继续迭代并重新验收'
      }
    ];
    let stdout = '';

    await expect(runUserAcceptanceHandoff({
      options: {
        outputPath: '/workspace/docs/acceptance/user-acceptance-handoff.md',
        isDefaultOutputPath: false
      },
      generatedAt: '2026-06-19T12:00:00.000Z',
      buildGoalAuditItems: vi.fn().mockResolvedValue(items),
      writeHandoff: async () => undefined,
      writeStdout: (markdown) => {
        stdout = markdown;
      }
    })).resolves.toBe(1);

    expect(stdout).toContain('## 用户验收状态');
    expect(stdout).toContain('| 用户确认 MVP 符合预期 | 缺失 | docs/acceptance/user-acceptance-record.md contains changes_requested with concrete notes | 按用户备注继续迭代并重新验收 |');
  });

  it('renders the current automated quality gate status from goal audit items', async () => {
    const items: GoalAuditItem[] = [
      {
        category: '质量门禁',
        requirement: '完整验收门禁通过',
        status: 'passed',
        evidence: ['docs/acceptance/acceptance-run.md full mode passed and is fresh for the current goal update date']
      },
      {
        category: '用户验收',
        requirement: '用户确认 MVP 符合预期',
        status: 'manual_required',
        evidence: ['manual confirmation is still required'],
        nextAction: '等待用户提供真实 Web App repo 或人工验收结论'
      }
    ];
    let stdout = '';

    await expect(runUserAcceptanceHandoff({
      options: {
        outputPath: '/workspace/docs/acceptance/user-acceptance-handoff.md',
        isDefaultOutputPath: false
      },
      generatedAt: '2026-06-19T12:00:00.000Z',
      buildGoalAuditItems: vi.fn().mockResolvedValue(items),
      writeHandoff: async () => undefined,
      writeStdout: (markdown) => {
        stdout = markdown;
      }
    })).resolves.toBe(0);

    expect(stdout).toContain('## 自动质量门禁');
    expect(stdout).toContain('| 完整验收门禁通过 | 已通过 | docs/acceptance/acceptance-run.md full mode passed and is fresh for the current goal update date |  |');
  });

  it('renders architecture migration status from goal audit items', async () => {
    const items: GoalAuditItem[] = [
      {
        category: '架构迁移',
        requirement: 'Legacy acceptance 兼容 wrapper',
        status: 'passed',
        evidence: ['legacy acceptance wrappers re-export package-owned acceptance modules']
      },
      {
        category: '架构迁移',
        requirement: 'Acceptance package typed module exports',
        status: 'passed',
        evidence: ['exact package export surface matches acceptancePackageExportEntries; package dist output contract matches acceptancePackageDistOutputEntries including .js.map sourceMapPath; package dist source specs match PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS, PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS, and PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS; package source contract matches acceptancePackageSourceEntries; typed dist entrypoints have no unexpected package exports']
      },
      {
        category: '架构迁移',
        requirement: 'Legacy acceptance dist compatibility outputs',
        status: 'passed',
        evidence: ['dist/internal/acceptance/*.js and *.d.ts compatibility outputs all delegate to packages/acceptance/dist package entrypoints; dist/internal/acceptance/*.js.map source maps are present through legacyAcceptanceDistOutputEntries.sourceMapPath and LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS']
      },
      {
        category: '用户验收',
        requirement: '用户确认 MVP 符合预期',
        status: 'manual_required',
        evidence: ['manual confirmation is still required'],
        nextAction: '等待用户提供真实 Web App repo 或人工验收结论'
      }
    ];
    let stdout = '';

    await expect(runUserAcceptanceHandoff({
      options: {
        outputPath: '/workspace/docs/acceptance/user-acceptance-handoff.md',
        isDefaultOutputPath: false
      },
      generatedAt: '2026-06-19T12:00:00.000Z',
      buildGoalAuditItems: vi.fn().mockResolvedValue(items),
      writeHandoff: async () => undefined,
      writeStdout: (markdown) => {
        stdout = markdown;
      }
    })).resolves.toBe(0);

    expect(stdout).toContain('## 架构迁移状态');
    expect(stdout).toContain('| Legacy acceptance 兼容 wrapper | 已通过 | legacy acceptance wrappers re-export package-owned acceptance modules |  |');
    expect(stdout).toContain('| Acceptance package typed module exports | 已通过 | exact package export surface matches acceptancePackageExportEntries; package dist output contract matches acceptancePackageDistOutputEntries including .js.map sourceMapPath; package dist source specs match PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS, PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS, and PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS; package source contract matches acceptancePackageSourceEntries; typed dist entrypoints have no unexpected package exports |  |');
    expect(stdout).toContain('| Legacy acceptance dist compatibility outputs | 已通过 | dist/internal/acceptance/*.js and *.d.ts compatibility outputs all delegate to packages/acceptance/dist package entrypoints; dist/internal/acceptance/*.js.map source maps are present through legacyAcceptanceDistOutputEntries.sourceMapPath and LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS |  |');
  });

  it('parses custom handoff output paths', () => {
    const options = parseUserAcceptanceHandoffArgs(['--output', 'artifacts/handoff.md']);

    expect(options.outputPath).toContain('artifacts/handoff.md');
  });

  it('can build concrete acceptance commands for a provided repo path', () => {
    const markdown = buildUserAcceptanceHandoffMarkdown({
      generatedAt: '2026-06-19T12:00:00.000Z',
      overallStatus: 'ready_for_user_acceptance',
      automaticPassed: 24,
      automaticMissing: 0,
      manualRequired: 1,
      goalAuditPath: 'docs/acceptance/goal-completion-audit.md',
      userAcceptanceRecordPath: 'docs/acceptance/user-acceptance-record.md',
      userAcceptanceGuidePath: 'docs/acceptance/guides/user-acceptance-guide.md',
      acceptanceChecklistPath: 'docs/acceptance/checklists/acceptance-checklist-v0.1.md',
      repoRoot: '/tmp/real app'
    });

    expect(markdown).toContain("pnpm user:handoff -- --repo '/tmp/real app'");
    expect(markdown).toContain("pnpm user:accept -- --repo '/tmp/real app' --browser --validate-generated-tests --decision pending");
    expect(markdown).toContain("pnpm user:accept -- --repo '/tmp/real app' --browser --validate-generated-tests --decision accepted --notes '用户确认 MVP 符合预期'");
    expect(markdown).toContain("pnpm user:accept -- --repo '/tmp/real app' --browser --decision changes_requested --notes '补齐登录态探索并降低误报'");
  });

  it('redacts sensitive repo path values in handoff commands', () => {
    const markdown = buildUserAcceptanceHandoffMarkdown({
      generatedAt: '2026-06-19T12:00:00.000Z',
      overallStatus: 'ready_for_user_acceptance',
      automaticPassed: 24,
      automaticMissing: 0,
      manualRequired: 1,
      goalAuditPath: 'docs/acceptance/goal-completion-audit.md',
      userAcceptanceRecordPath: 'docs/acceptance/user-acceptance-record.md',
      userAcceptanceGuidePath: 'docs/acceptance/guides/user-acceptance-guide.md',
      acceptanceChecklistPath: 'docs/acceptance/checklists/acceptance-checklist-v0.1.md',
      repoRoot: '/tmp/TOKEN=secret-value/real app'
    });

    expect(markdown).toContain("pnpm user:handoff -- --repo '/tmp/TOKEN=[REDACTED] app'");
    expect(markdown).toContain("pnpm user:accept -- --repo '/tmp/TOKEN=[REDACTED] app' --browser --validate-generated-tests --decision pending");
    expect(markdown).not.toContain('TOKEN=secret-value');
  });

  it('warns when displayed handoff commands contain a redacted repo path', () => {
    const markdown = buildUserAcceptanceHandoffMarkdown({
      generatedAt: '2026-06-19T12:00:00.000Z',
      overallStatus: 'ready_for_user_acceptance',
      automaticPassed: 24,
      automaticMissing: 0,
      manualRequired: 1,
      goalAuditPath: 'docs/acceptance/goal-completion-audit.md',
      userAcceptanceRecordPath: 'docs/acceptance/user-acceptance-record.md',
      userAcceptanceGuidePath: 'docs/acceptance/guides/user-acceptance-guide.md',
      acceptanceChecklistPath: 'docs/acceptance/checklists/acceptance-checklist-v0.1.md',
      repoRoot: '/tmp/TOKEN=secret-value/real app'
    });

    expect(markdown).toContain('注意：下方命令中的 repo 路径已脱敏');
    expect(markdown).toContain('请用真实 repo 路径重新运行命令');
  });

  it('parses optional repo paths for concrete handoff commands', () => {
    const options = parseUserAcceptanceHandoffArgs(['--repo', 'fixtures/benchmark/vite-basic']);

    expect(options.repoRoot).toContain('fixtures/benchmark/vite-basic');
  });

  it('documents repo preflight checks when a repo is provided', () => {
    const markdown = buildUserAcceptanceHandoffMarkdown({
      generatedAt: '2026-06-19T12:00:00.000Z',
      overallStatus: 'ready_for_user_acceptance',
      automaticPassed: 24,
      automaticMissing: 0,
      manualRequired: 1,
      goalAuditPath: 'docs/acceptance/goal-completion-audit.md',
      userAcceptanceRecordPath: 'docs/acceptance/user-acceptance-record.md',
      userAcceptanceGuidePath: 'docs/acceptance/guides/user-acceptance-guide.md',
      acceptanceChecklistPath: 'docs/acceptance/checklists/acceptance-checklist-v0.1.md',
      repoRoot: '/tmp/real-app',
      repoPreflightChecks: [
        {
          name: 'repo root 是有效目录',
          required: true,
          status: 'passed',
          evidence: '/tmp/real-app'
        }
      ]
    });

    expect(markdown).toContain('## Repo 前置检查');
    expect(markdown).toContain('| repo root 是有效目录 | 是 | 通过 | /tmp/real-app |');
  });

  it('documents that package.json must be an object manifest before user acceptance runs', () => {
    const markdown = buildUserAcceptanceHandoffMarkdown({
      generatedAt: '2026-06-19T12:00:00.000Z',
      overallStatus: 'ready_for_user_acceptance',
      automaticPassed: 24,
      automaticMissing: 0,
      manualRequired: 1,
      goalAuditPath: 'docs/acceptance/goal-completion-audit.md',
      userAcceptanceRecordPath: 'docs/acceptance/user-acceptance-record.md',
      userAcceptanceGuidePath: 'docs/acceptance/guides/user-acceptance-guide.md',
      acceptanceChecklistPath: 'docs/acceptance/checklists/acceptance-checklist-v0.1.md',
      repoRoot: '/tmp/real-app',
      repoPreflightChecks: [
        {
          name: 'repo root 是有效目录',
          required: true,
          status: 'passed',
          evidence: '/tmp/real-app'
        },
        {
          name: 'package.json 是有效文件',
          required: true,
          status: 'failed',
          evidence: 'invalid package.json: /tmp/real-app/package.json; Unexpected end of JSON input'
        }
      ]
    });

    expect(markdown).toContain('文件型、JSON 对象 manifest 的 `package.json`');
    expect(markdown).toContain('请先修复 repo 路径或 package.json manifest');
    expect(markdown).toContain('修复 repo 路径或 package.json manifest 后，重新生成交接包');
  });

  it('escapes and redacts repo preflight table cells', () => {
    const markdown = buildUserAcceptanceHandoffMarkdown({
      generatedAt: '2026-06-19T12:00:00.000Z',
      overallStatus: 'ready_for_user_acceptance',
      automaticPassed: 24,
      automaticMissing: 0,
      manualRequired: 1,
      goalAuditPath: 'docs/acceptance/goal-completion-audit.md',
      userAcceptanceRecordPath: 'docs/acceptance/user-acceptance-record.md',
      userAcceptanceGuidePath: 'docs/acceptance/guides/user-acceptance-guide.md',
      acceptanceChecklistPath: 'docs/acceptance/checklists/acceptance-checklist-v0.1.md',
      repoRoot: '/tmp/real-app',
      repoPreflightChecks: [
        {
          name: 'repo|root\n## injected',
          required: true,
          status: 'failed',
          evidence: 'missing repo|root\n## injected TOKEN=secret-value'
        }
      ]
    });

    expect(markdown).toContain('| repo\\|root ## injected | 是 | 失败 | missing repo\\|root ## injected TOKEN=[REDACTED] |');
    expect(markdown).not.toContain('\n## injected TOKEN=secret-value');
    expect(markdown).not.toContain('TOKEN=secret-value');
  });

  it('explains that user acceptance commands are blocked when required repo preflight checks fail', () => {
    const markdown = buildUserAcceptanceHandoffMarkdown({
      generatedAt: '2026-06-19T12:00:00.000Z',
      overallStatus: 'ready_for_user_acceptance',
      automaticPassed: 24,
      automaticMissing: 0,
      manualRequired: 1,
      goalAuditPath: 'docs/acceptance/goal-completion-audit.md',
      userAcceptanceRecordPath: 'docs/acceptance/user-acceptance-record.md',
      userAcceptanceGuidePath: 'docs/acceptance/guides/user-acceptance-guide.md',
      acceptanceChecklistPath: 'docs/acceptance/checklists/acceptance-checklist-v0.1.md',
      repoRoot: '/tmp/missing-app',
      repoPreflightChecks: [
        {
          name: 'repo root 是有效目录',
          required: true,
          status: 'failed',
          evidence: 'missing repo root: /tmp/missing-app'
        },
        {
          name: 'package.json 是有效文件',
          required: true,
          status: 'skipped',
          evidence: 'repo root check failed'
        }
      ]
    });

    expect(markdown).toContain('前置检查结论：未通过');
    expect(markdown).toContain('请先修复 repo 路径或 package.json manifest，再运行 `pnpm user:accept`');
    expect(markdown).toContain('修复 repo 路径或 package.json manifest 后，重新生成交接包');
    expect(markdown).not.toContain('pnpm user:accept -- --repo /tmp/missing-app');
  });

  it('builds separate repo root and package.json preflight checks', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-user-handoff-valid-repo-'));

    try {
      await writeFile(join(repoRoot, 'package.json'), '{"scripts":{}}');

      await expect(buildUserAcceptanceHandoffRepoPreflightChecks(repoRoot)).resolves.toEqual([
        {
          name: 'repo root 是有效目录',
          required: true,
          status: 'passed',
          evidence: repoRoot
        },
        {
          name: 'package.json 是有效文件',
          required: true,
          status: 'passed',
          evidence: join(repoRoot, 'package.json')
        }
      ]);
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

  it('fails repo preflight checks when package.json is malformed', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-user-handoff-malformed-package-'));

    try {
      await writeFile(join(repoRoot, 'package.json'), '{"scripts":');

      const checks = await buildUserAcceptanceHandoffRepoPreflightChecks(repoRoot);

      expect(checks[0]).toEqual({
        name: 'repo root 是有效目录',
        required: true,
        status: 'passed',
        evidence: repoRoot
      });
      expect(checks[1]).toEqual(expect.objectContaining({
        name: 'package.json 是有效文件',
        required: true,
        status: 'failed'
      }));
      expect(checks[1]?.evidence).toContain('invalid package.json:');
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

  it('fails repo preflight checks when package.json is valid JSON but not an object manifest', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-user-handoff-non-object-package-'));

    try {
      await writeFile(join(repoRoot, 'package.json'), '[]');

      const checks = await buildUserAcceptanceHandoffRepoPreflightChecks(repoRoot);

      expect(checks[0]).toEqual({
        name: 'repo root 是有效目录',
        required: true,
        status: 'passed',
        evidence: repoRoot
      });
      expect(checks[1]).toEqual(expect.objectContaining({
        name: 'package.json 是有效文件',
        required: true,
        status: 'failed'
      }));
      expect(checks[1]?.evidence).toContain('invalid package.json manifest:');
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

  it('writes concrete commands and exits zero when repo preflight checks pass', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'hardening-user-handoff-main-valid-repo-'));
    const outputPath = join(repoRoot, 'records', 'handoff.md');
    let markdown = '';

    try {
      await writeFile(join(repoRoot, 'package.json'), '{"scripts":{}}');

      await expect(runUserAcceptanceHandoff({
        options: {
          outputPath,
          repoRoot,
          isDefaultOutputPath: false
        },
        generatedAt: '2026-06-20T12:00:00.000Z',
        buildGoalAuditItems: vi.fn().mockResolvedValue([
          {
            category: '用户验收',
            requirement: '用户确认 MVP 符合预期',
            status: 'passed',
            evidence: ['docs/acceptance/user-acceptance-record.md records accepted user decision']
          }
        ]),
        writeHandoff: async (_path, content) => {
          markdown = content;
        },
        writeStdout: () => undefined
      })).resolves.toBe(0);

      expect(markdown).toContain('| repo root 是有效目录 | 是 | 通过 |');
      expect(markdown).toContain('| package.json 是有效文件 | 是 | 通过 |');
      expect(markdown).toContain(`pnpm user:accept -- --repo ${repoRoot}`);
      expect(markdown).toContain('前置检查结论：通过');
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

  it('returns a non-zero exit code when required repo preflight checks fail', async () => {
    const tempRoot = await mkdtemp(join(tmpdir(), 'hardening-user-handoff-invalid-repo-'));
    const missingRepoRoot = join(tempRoot, 'missing-app');
    const outputPath = join(tempRoot, 'handoff.md');
    const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    try {
      await expect(main(['--repo', missingRepoRoot, '--output', outputPath])).resolves.toBe(1);
      const markdown = await readFile(outputPath, 'utf8');
      expect(markdown).toContain('| repo root 是有效目录 | 是 | 失败 |');
      expect(markdown).toContain('| package.json 是有效文件 | 是 | 跳过 | repo root check failed |');
    } finally {
      stdout.mockRestore();
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it('rejects placeholder repo paths before rendering acceptance commands', async () => {
    await expect(buildUserAcceptanceHandoffRepoPreflightChecks('/tmp/<real-web-app-repo>')).resolves.toEqual([
      {
        name: 'repo root 是有效目录',
        required: true,
        status: 'failed',
        evidence: 'replace <real-web-app-repo> with the real Web App repo path'
      },
      {
        name: 'package.json 是有效文件',
        required: true,
        status: 'skipped',
        evidence: 'repo root check failed'
      }
    ]);
  });

  it('keeps placeholder repo refresh commands as placeholders instead of resolved paths', () => {
    const markdown = buildUserAcceptanceHandoffMarkdown({
      generatedAt: '2026-06-19T12:00:00.000Z',
      overallStatus: 'ready_for_user_acceptance',
      automaticPassed: 24,
      automaticMissing: 0,
      manualRequired: 1,
      goalAuditPath: 'docs/acceptance/goal-completion-audit.md',
      userAcceptanceRecordPath: 'docs/acceptance/user-acceptance-record.md',
      userAcceptanceGuidePath: 'docs/acceptance/guides/user-acceptance-guide.md',
      acceptanceChecklistPath: 'docs/acceptance/checklists/acceptance-checklist-v0.1.md',
      repoRoot: '/workspace/<real-web-app-repo>',
      repoPreflightChecks: [
        {
          name: 'repo root 是有效目录',
          required: true,
          status: 'failed',
          evidence: 'replace <real-web-app-repo> with the real Web App repo path'
        },
        {
          name: 'package.json 是有效文件',
          required: true,
          status: 'skipped',
          evidence: 'repo root check failed'
        }
      ]
    });

    expect(markdown).toContain('pnpm user:handoff -- --repo <real-web-app-repo>');
    expect(markdown).not.toContain("pnpm user:handoff -- --repo '/workspace/<real-web-app-repo>'");
  });
});
