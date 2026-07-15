import type { GoalAuditItem } from './goal-audit.js';
import { acceptancePackageExportEntries } from './compatibility.js';
import {
  LEGACY_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS,
  LEGACY_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS,
  LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS,
  LEGACY_ACCEPTANCE_WRAPPER_SOURCE_SPECS,
  PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS,
  PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS,
  PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS,
  type GoalAuditTextSources
} from './goal-audit-sources.js';
import { buildGoalAuditTextRequirement } from './goal-audit-requirements.js';

export function buildProcessGovernanceGoalAuditItems(
  sources: Partial<GoalAuditTextSources>
): GoalAuditItem[] {
  return [
    buildGoalAuditTextRequirement({
      category: '开发流程',
      requirement: 'TDD 与测试金字塔执行记录',
      text: `${sources.codexGoal ?? ''}\n${sources.testStrategy ?? ''}\n${sources.devLog ?? ''}`,
      needles: [
        'TDD 必须优先',
        'Red-Green-Refactor',
        '测试金字塔',
        '### TDD 记录',
        'Red：',
        'Green：',
        'pnpm test:unit',
        'pnpm test:integration',
        'pnpm test:e2e',
        '完整 `pnpm test:integration`',
        '真实 Chromium trace E2E'
      ],
      evidence: ['codex goal defines TDD and testing pyramid; test strategy documents unit/integration/E2E layers; dev log records Red/Green slices and full-gate validation points']
    }),
    buildGoalAuditTextRequirement({
      category: '日志治理',
      requirement: '阻塞与决策记录',
      text: `${sources.codexGoal ?? ''}\n${sources.devLog ?? ''}\n${sources.blockersLog ?? ''}\n${sources.decisionLog ?? ''}`,
      needles: [
        '遇到无法解决的问题，立即记录到 `docs/logs/blockers.md`。',
        '任何会影响架构或长期维护的选择，记录到 `docs/logs/decision-log.md`。',
        '# 阻塞日志',
        '### 已尝试方案',
        '### 需要的用户决策或外部条件',
        'listen EPERM',
        'Chromium',
        '# 决策日志',
        '### 决策',
        '### 原因',
        '### 影响',
        'MCP Server 采用 Registry + SDK 薄绑定',
        'Goal 审计不替代用户验收',
        '已记录到 `docs/logs/blockers.md`',
        '决策日志已更新'
      ],
      evidence: ['codex goal defines blocker and decision logging rules; blockers log records environment blockers with attempts and external conditions; decision log records long-lived architecture and acceptance decisions; dev log references blocker and decision-log maintenance']
    }),
    buildGoalAuditTextRequirement({
      category: 'Token 控制',
      requirement: '精准上下文与小步审计',
      text: `${sources.codexGoal ?? ''}\n${sources.devLog ?? ''}\n${sources.goalAuditSource ?? ''}`,
      needles: [
        '## Token Control Policy',
        '优先 `rg`、`sed -n`、`wc -l`',
        '小范围 patch，避免无关重构',
        '聚焦当前切片，不一次性生成大量低价值测试',
        '关键决策写入文档，减少对对话历史的依赖',
        '每个阶段应优先使用局部上下文和项目文档作为长期记忆。',
        '### TDD 记录',
        'Red：',
        'Green：',
        '文档和开发日志更新后复跑 `pnpm goal:audit`',
        'readGoalAuditTextSources',
        'buildCurrentGoalAuditItemsFromSources',
        'buildGoalAuditItemsFromWorkspace',
        'classifyUserAcceptanceRecord',
        'goalLastUpdatedText',
        'pathExists: async'
      ],
      evidence: ['codex goal defines token control rules; dev log records small Red/Green slices and repeated goal-audit checkpoints; goal audit implementation uses explicit targeted evidence files and grouped test-source reads instead of broad repository scans']
    }),
    buildLegacyAcceptanceWrapperGoalAuditItem(sources),
    buildAcceptancePackageTypedModuleExportsGoalAuditItem(sources),
    buildSharedPackageTypedModuleExportsGoalAuditItem(sources),
    buildSecurityAssurancePackageTypedModuleExportsGoalAuditItem(sources),
    buildRepairPlannerPackageTypedModuleExportsGoalAuditItem(sources),
    buildBrowserExplorerPackageTypedModuleExportsGoalAuditItem(sources),
    buildLegacyAcceptanceDistOutputGoalAuditItem(sources)
  ];
}

function buildSecurityAssurancePackageTypedModuleExportsGoalAuditItem(
  sources: Partial<GoalAuditTextSources>
): GoalAuditItem {
  const rootPackageJson = sources.packageJson ?? '';
  const securityAssurancePackageJson = sources.securityAssurancePackageJson ?? '';
  const missingMarkers = [
    ...findMissingMarkers(rootPackageJson, ['"@hardening-mcp/security-assurance": "workspace:*"']),
    ...findMissingSecurityAssuranceTypedPackageExportMarkers(securityAssurancePackageJson),
    ...findMissingMarkers(sources.securityAssuranceTypeSmoke ?? '', [
      "from '@hardening-mcp/security-assurance'",
      "from '@hardening-mcp/security-assurance/compatibility'",
      "from '@hardening-mcp/security-assurance/import-security-evidence'",
      "from '@hardening-mcp/security-assurance/security-provider-contracts'"
    ])
  ];

  return {
    category: '架构迁移',
    requirement: 'Security assurance package typed module exports',
    status: missingMarkers.length === 0 ? 'passed' : 'missing',
    evidence: missingMarkers.length === 0
      ? ['root package depends on @hardening-mcp/security-assurance workspace package; packages/security-assurance exports typed root, compatibility, import-security-evidence, and security-provider-contracts subpaths; type-smoke covers root and subpath resolution']
      : [`missing security assurance package markers: ${missingMarkers.join(', ')}`],
    ...(missingMarkers.length > 0
      ? { nextAction: '补齐 root workspace dependency、packages/security-assurance typed exports 和 type-smoke 后重新运行 goal audit。' }
      : {})
  };
}

function buildLegacyAcceptanceWrapperGoalAuditItem(
  sources: Partial<GoalAuditTextSources>
): GoalAuditItem {
  const missingPaths = LEGACY_ACCEPTANCE_WRAPPER_SOURCE_SPECS
    .filter((spec) => !isLegacyAcceptanceWrapper(sources[spec.key]))
    .map((spec) => spec.path);

  return {
    category: '架构迁移',
    requirement: 'Legacy acceptance 兼容 wrapper',
    status: missingPaths.length === 0 ? 'passed' : 'missing',
    evidence: missingPaths.length === 0
      ? ['src/internal/acceptance/*.ts all delegate to packages/acceptance/dist compatibility wrappers']
      : [`non-wrapper legacy acceptance files: ${missingPaths.join(', ')}`],
    ...(missingPaths.length > 0 ? { nextAction: '将列出的 legacy 文件改为 package dist wrapper 后重新运行 goal audit。' } : {})
  };
}

function isLegacyAcceptanceWrapper(sourceText: string | undefined): boolean {
  return sourceText !== undefined && sourceText.includes('packages/acceptance/dist');
}

function buildLegacyAcceptanceDistOutputGoalAuditItem(
  sources: Partial<GoalAuditTextSources>
): GoalAuditItem {
  const missingWrapperPaths = [
    ...LEGACY_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS,
    ...LEGACY_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS
  ]
    .filter((spec) => !isLegacyAcceptanceWrapper(sources[spec.key]))
    .map((spec) => spec.path);
  const missingSourceMapPaths = LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS
    .filter((spec) => !isSourceMapForJsOutput(sources[spec.key], spec.path))
    .map((spec) => spec.path);
  const missingPaths = [...missingWrapperPaths, ...missingSourceMapPaths];

  return {
    category: '架构迁移',
    requirement: 'Legacy acceptance dist compatibility outputs',
    status: missingPaths.length === 0 ? 'passed' : 'missing',
    evidence: missingPaths.length === 0
      ? ['dist/internal/acceptance/*.js and *.d.ts compatibility outputs all delegate to packages/acceptance/dist package entrypoints; dist/internal/acceptance/*.js.map source maps are present through legacyAcceptanceDistOutputEntries.sourceMapPath and LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS']
      : [`non-compatible legacy dist acceptance outputs: ${missingPaths.join(', ')}`],
    ...(missingPaths.length > 0
      ? { nextAction: '运行 pnpm build 并确认 dist/internal/acceptance/*.js、*.d.ts 和 *.js.map 仍满足 legacy dist 兼容输出合同后重新运行 goal audit。' }
      : {})
  };
}

function buildAcceptancePackageTypedModuleExportsGoalAuditItem(
  sources: Partial<GoalAuditTextSources>
): GoalAuditItem {
  const rootPackageJson = sources.packageJson ?? '';
  const acceptancePackageJson = sources.acceptancePackageJson ?? '';
  const missingMarkers = [
    ...findMissingMarkers(rootPackageJson, ['"@hardening-mcp/acceptance": "workspace:*"']),
    ...findMissingTypedPackageExportMarkers(acceptancePackageJson),
    ...findMissingPackageDistOutputMarkers(sources)
  ];

  return {
    category: '架构迁移',
    requirement: 'Acceptance package typed module exports',
    status: missingMarkers.length === 0 ? 'passed' : 'missing',
    evidence: missingMarkers.length === 0
      ? ['root package depends on @hardening-mcp/acceptance workspace package; exact package export surface matches acceptancePackageExportEntries; package dist output contract matches acceptancePackageDistOutputEntries including .js.map sourceMapPath; package dist source specs match PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS, PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS, and PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS; package source contract matches acceptancePackageSourceEntries; typed dist entrypoints have no unexpected package exports']
      : [`missing package export markers: ${missingMarkers.join(', ')}`],
    ...(missingMarkers.length > 0
      ? { nextAction: '补齐 root workspace dependency 和 packages/acceptance module typed exports 后重新运行 goal audit。' }
      : {})
  };
}

function buildSharedPackageTypedModuleExportsGoalAuditItem(
  sources: Partial<GoalAuditTextSources>
): GoalAuditItem {
  const rootPackageJson = sources.packageJson ?? '';
  const sharedPackageJson = sources.sharedPackageJson ?? '';
  const missingMarkers = [
    ...findMissingMarkers(rootPackageJson, ['"@hardening-mcp/shared": "workspace:*"']),
    ...findMissingSharedTypedPackageExportMarkers(sharedPackageJson),
    ...findMissingSharedLegacyWrapperMarkers(sources)
  ];

  return {
    category: '架构迁移',
    requirement: 'Shared package typed module exports and legacy wrappers',
    status: missingMarkers.length === 0 ? 'passed' : 'missing',
    evidence: missingMarkers.length === 0
      ? ['root package depends on @hardening-mcp/shared workspace package; packages/shared exports typed root, compatibility, privacy-redaction, shell-quote, and shell-words subpaths; src/shared/*.ts all delegate to packages/shared/dist compatibility wrappers']
      : [`missing shared package markers: ${missingMarkers.join(', ')}`],
    ...(missingMarkers.length > 0
      ? { nextAction: '补齐 root workspace dependency、packages/shared typed exports 和 src/shared legacy wrappers 后重新运行 goal audit。' }
      : {})
  };
}

function buildRepairPlannerPackageTypedModuleExportsGoalAuditItem(
  sources: Partial<GoalAuditTextSources>
): GoalAuditItem {
  const rootPackageJson = sources.packageJson ?? '';
  const repairPlannerPackageJson = sources.repairPlannerPackageJson ?? '';
  const missingMarkers = [
    ...findMissingMarkers(rootPackageJson, ['"@hardening-mcp/repair-planner": "workspace:*"']),
    ...findMissingRepairPlannerTypedPackageExportMarkers(repairPlannerPackageJson),
    ...findMissingRepairPlannerLegacyWrapperMarkers(sources)
  ];

  return {
    category: '架构迁移',
    requirement: 'Repair planner package typed module exports and legacy wrappers',
    status: missingMarkers.length === 0 ? 'passed' : 'missing',
    evidence: missingMarkers.length === 0
      ? ['root package depends on @hardening-mcp/repair-planner workspace package; packages/repair-planner exports typed root, compatibility, generate-repair-plan, and repair-plan subpaths; src/domain/repair-plan/*.ts and src/types/repair-plan.ts delegate to packages/repair-planner/dist compatibility wrappers']
      : [`missing repair planner package markers: ${missingMarkers.join(', ')}`],
    ...(missingMarkers.length > 0
      ? { nextAction: '补齐 root workspace dependency、packages/repair-planner typed exports 和 repair planner legacy wrappers 后重新运行 goal audit。' }
      : {})
  };
}

function buildBrowserExplorerPackageTypedModuleExportsGoalAuditItem(
  sources: Partial<GoalAuditTextSources>
): GoalAuditItem {
  const rootPackageJson = sources.packageJson ?? '';
  const browserExplorerPackageJson = sources.browserExplorerPackageJson ?? '';
  const missingMarkers = [
    ...findMissingMarkers(rootPackageJson, ['"@hardening-mcp/browser-explorer": "workspace:*"']),
    ...findMissingBrowserExplorerTypedPackageExportMarkers(browserExplorerPackageJson),
    ...findMissingBrowserExplorerLegacyWrapperMarkers(sources)
  ];

  return {
    category: '架构迁移',
    requirement: 'Browser explorer package typed module exports and legacy wrappers',
    status: missingMarkers.length === 0 ? 'passed' : 'missing',
    evidence: missingMarkers.length === 0
      ? ['root package depends on @hardening-mcp/browser-explorer workspace package; packages/browser-explorer exports typed root, compatibility, explore-app, and playwright-driver subpaths; src/domain/explore/*.ts delegates to packages/browser-explorer/dist compatibility wrappers']
      : [`missing browser explorer package markers: ${missingMarkers.join(', ')}`],
    ...(missingMarkers.length > 0
      ? { nextAction: '补齐 root workspace dependency、packages/browser-explorer typed exports 和 browser explorer legacy wrappers 后重新运行 goal audit。' }
      : {})
  };
}

function findMissingBrowserExplorerTypedPackageExportMarkers(packageJsonText: string): string[] {
  const packageJson = parsePackageJson(packageJsonText);
  const exports = packageJson?.exports;

  if (!exports || typeof exports !== 'object' || Array.isArray(exports)) {
    return ['browser explorer exports object'];
  }

  const expectedExports = [
    { exportPath: '.', types: './dist/index.d.ts', default: './dist/index.js' },
    { exportPath: './compatibility', types: './dist/compatibility.d.ts', default: './dist/compatibility.js' },
    { exportPath: './explore-app', types: './dist/explore-app.d.ts', default: './dist/explore-app.js' },
    { exportPath: './playwright-driver', types: './dist/playwright-driver.d.ts', default: './dist/playwright-driver.js' }
  ] as const;
  const expectedExportPaths = new Set<string>(expectedExports.map(({ exportPath }) => exportPath));
  const unexpectedExportMarkers = Object.keys(exports)
    .filter((exportPath) => !expectedExportPaths.has(exportPath))
    .sort()
    .map((exportPath) => `unexpected browser explorer export ${exportPath}`);
  const missingExpectedExportMarkers = expectedExports.flatMap(({ exportPath, types, default: defaultPath }) => {
    const value = (exports as Record<string, unknown>)[exportPath];

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return [exportPath];
    }

    const typedExport = value as { types?: unknown; default?: unknown };
    const missing: string[] = [];

    if (typedExport.types !== types) {
      missing.push(`${exportPath} types ${types}`);
    }

    if (typedExport.default !== defaultPath) {
      missing.push(`${exportPath} default ${defaultPath}`);
    }

    return missing;
  });

  return [...unexpectedExportMarkers, ...missingExpectedExportMarkers];
}

function findMissingSecurityAssuranceTypedPackageExportMarkers(packageJsonText: string): string[] {
  const packageJson = parsePackageJson(packageJsonText);
  const exports = packageJson?.exports;

  if (!exports || typeof exports !== 'object' || Array.isArray(exports)) {
    return ['security assurance exports object'];
  }

  const expectedExports = [
    { exportPath: '.', types: './dist/index.d.ts', default: './dist/index.js' },
    { exportPath: './compatibility', types: './dist/compatibility.d.ts', default: './dist/compatibility.js' },
    { exportPath: './import-security-evidence', types: './dist/import-security-evidence.d.ts', default: './dist/import-security-evidence.js' },
    { exportPath: './security-provider-contracts', types: './dist/security-provider-contracts.d.ts', default: './dist/security-provider-contracts.js' }
  ] as const;
  const expectedExportPaths = new Set<string>(expectedExports.map(({ exportPath }) => exportPath));
  const unexpectedExportMarkers = Object.keys(exports)
    .filter((exportPath) => !expectedExportPaths.has(exportPath))
    .sort()
    .map((exportPath) => `unexpected security assurance export ${exportPath}`);
  const missingExpectedExportMarkers = expectedExports.flatMap(({ exportPath, types, default: defaultPath }) => {
    const value = (exports as Record<string, unknown>)[exportPath];

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return [exportPath];
    }

    const typedExport = value as { types?: unknown; default?: unknown };
    const missing: string[] = [];

    if (typedExport.types !== types) {
      missing.push(`${exportPath}.types=${types}`);
    }

    if (typedExport.default !== defaultPath) {
      missing.push(`${exportPath}.default=${defaultPath}`);
    }

    return missing;
  });

  return [...unexpectedExportMarkers, ...missingExpectedExportMarkers];
}

function findMissingBrowserExplorerLegacyWrapperMarkers(sources: Partial<GoalAuditTextSources>): string[] {
  return [
    { label: 'legacy browser explorer explore-app wrapper', sourceText: sources.legacyBrowserExplorerExploreApp },
    { label: 'legacy browser explorer playwright-driver wrapper', sourceText: sources.legacyBrowserExplorerPlaywrightDriver }
  ]
    .filter(({ sourceText }) => typeof sourceText !== 'string' || !sourceText.includes('packages/browser-explorer/dist'))
    .map(({ label }) => label);
}

function findMissingPackageDistOutputMarkers(sources: Partial<GoalAuditTextSources>): string[] {
  return [
    ...PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS,
    ...PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS,
    ...PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS
  ]
    .filter((spec) => sources[spec.key]?.trim() === '')
    .map((spec) => `empty package dist output ${spec.path}`)
    .concat(
      [
        ...PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS,
        ...PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS,
        ...PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS
      ]
        .filter((spec) => sources[spec.key] === undefined)
        .map((spec) => `missing package dist output ${spec.path}`)
    );
}

function isSourceMapForJsOutput(sourceText: string | undefined, sourceMapPath: string): boolean {
  if (sourceText === undefined) {
    return false;
  }

  const fileName = sourceMapPath.split('/').pop()?.replace(/\.map$/u, '') ?? '';

  return sourceText.includes('"version":3') && sourceText.includes(`"file":"${fileName}"`);
}

function findMissingTypedPackageExportMarkers(packageJsonText: string): string[] {
  const packageJson = parsePackageJson(packageJsonText);
  const exports = packageJson?.exports;

  if (!exports || typeof exports !== 'object' || Array.isArray(exports)) {
    return ['exports object'];
  }

  const expectedExportPaths = new Set(acceptancePackageExportEntries.map((entry) => entry.exportPath));
  const unexpectedExportMarkers = Object.keys(exports)
    .filter((exportPath) => !expectedExportPaths.has(exportPath))
    .sort()
    .map((exportPath) => `unexpected export ${exportPath}`);
  const missingExpectedExportMarkers = acceptancePackageExportEntries.flatMap(({ exportPath, types, default: defaultPath }) => {
    const value = (exports as Record<string, unknown>)[exportPath];

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return [exportPath];
    }

    const typedExport = value as { types?: unknown; default?: unknown };
    const missing: string[] = [];

    if (typedExport.types !== types) {
      missing.push(`${exportPath}.types=${types}`);
    }

    if (typedExport.default !== defaultPath) {
      missing.push(`${exportPath}.default=${defaultPath}`);
    }

    return missing;
  });

  return [...missingExpectedExportMarkers, ...unexpectedExportMarkers];
}

function findMissingSharedTypedPackageExportMarkers(packageJsonText: string): string[] {
  const expectedSharedExports = [
    { exportPath: '.', types: './dist/index.d.ts', default: './dist/index.js' },
    { exportPath: './compatibility', types: './dist/compatibility.d.ts', default: './dist/compatibility.js' },
    { exportPath: './privacy-redaction', types: './dist/privacy-redaction.d.ts', default: './dist/privacy-redaction.js' },
    { exportPath: './shell-quote', types: './dist/shell-quote.d.ts', default: './dist/shell-quote.js' },
    { exportPath: './shell-words', types: './dist/shell-words.d.ts', default: './dist/shell-words.js' }
  ] as const;
  const packageJson = parsePackageJson(packageJsonText);
  const exports = packageJson?.exports;

  if (!exports || typeof exports !== 'object' || Array.isArray(exports)) {
    return ['shared exports object'];
  }

  const expectedExportPaths = new Set<string>(expectedSharedExports.map(({ exportPath }) => exportPath));
  const unexpectedExportMarkers = Object.keys(exports)
    .filter((exportPath) => !expectedExportPaths.has(exportPath))
    .sort()
    .map((exportPath) => `unexpected shared export ${exportPath}`);
  const missingExpectedExportMarkers = expectedSharedExports.flatMap(({ exportPath, types, default: defaultPath }) => {
    const value = (exports as Record<string, unknown>)[exportPath];

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return [exportPath];
    }

    const typedExport = value as { types?: unknown; default?: unknown };
    const missing: string[] = [];

    if (typedExport.types !== types) {
      missing.push(`${exportPath}.types=${types}`);
    }

    if (typedExport.default !== defaultPath) {
      missing.push(`${exportPath}.default=${defaultPath}`);
    }

    return missing;
  });

  return [...missingExpectedExportMarkers, ...unexpectedExportMarkers];
}

function findMissingRepairPlannerTypedPackageExportMarkers(packageJsonText: string): string[] {
  const packageJson = parsePackageJson(packageJsonText);
  const exports = packageJson?.exports;

  if (!exports || typeof exports !== 'object' || Array.isArray(exports)) {
    return ['repair planner exports object'];
  }

  const expectedExports = [
    { exportPath: '.', types: './dist/index.d.ts', default: './dist/index.js' },
    { exportPath: './compatibility', types: './dist/compatibility.d.ts', default: './dist/compatibility.js' },
    { exportPath: './generate-repair-plan', types: './dist/generate-repair-plan.d.ts', default: './dist/generate-repair-plan.js' },
    { exportPath: './repair-plan', types: './dist/repair-plan.d.ts', default: './dist/repair-plan.js' }
  ] as const;
  const expectedExportPaths = new Set<string>(expectedExports.map(({ exportPath }) => exportPath));
  const unexpectedExportMarkers = Object.keys(exports)
    .filter((exportPath) => !expectedExportPaths.has(exportPath))
    .sort()
    .map((exportPath) => `unexpected repair planner export ${exportPath}`);
  const missingExpectedExportMarkers = expectedExports.flatMap(({ exportPath, types, default: defaultPath }) => {
    const value = (exports as Record<string, unknown>)[exportPath];

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return [exportPath];
    }

    const typedExport = value as { types?: unknown; default?: unknown };
    const missing: string[] = [];

    if (typedExport.types !== types) {
      missing.push(`${exportPath} types ${types}`);
    }

    if (typedExport.default !== defaultPath) {
      missing.push(`${exportPath} default ${defaultPath}`);
    }

    return missing;
  });

  return [...unexpectedExportMarkers, ...missingExpectedExportMarkers];
}

function findMissingRepairPlannerLegacyWrapperMarkers(sources: Partial<GoalAuditTextSources>): string[] {
  return [
    { label: 'legacy repair plan generator wrapper', sourceText: sources.legacyRepairPlanGenerator },
    { label: 'legacy repair plan types wrapper', sourceText: sources.legacyRepairPlanTypes }
  ]
    .filter(({ sourceText }) => typeof sourceText !== 'string' || !sourceText.includes('packages/repair-planner/dist'))
    .map(({ label }) => label);
}

function findMissingSharedLegacyWrapperMarkers(sources: Partial<GoalAuditTextSources>): string[] {
  const wrapperSources: Array<{ label: string; sourceText: string | undefined }> = [
    { label: 'legacy shared privacy-redaction wrapper', sourceText: sources.legacySharedPrivacyRedaction },
    { label: 'legacy shared shell-quote wrapper', sourceText: sources.legacySharedShellQuote },
    { label: 'legacy shared shell-words wrapper', sourceText: sources.legacySharedShellWords }
  ];

  return wrapperSources
    .filter(({ sourceText }) => typeof sourceText !== 'string' || !sourceText.includes('packages/shared/dist'))
    .map(({ label }) => label);
}

function parsePackageJson(sourceText: string): { exports?: unknown } | undefined {
  try {
    const parsed = JSON.parse(sourceText) as { exports?: unknown };

    return parsed;
  } catch {
    return undefined;
  }
}

function findMissingMarkers(sourceText: string, markers: string[]): string[] {
  return markers.filter((marker) => !sourceText.includes(marker));
}
