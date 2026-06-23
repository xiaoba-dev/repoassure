export const browserExplorerCompatibilityContract = {
  packageName: '@hardening-mcp/browser-explorer',
  legacyDistRoot: 'dist/domain/explore',
  packageOwnedModules: ['compatibility', 'explore-app', 'playwright-driver']
} as const;

export const legacyBrowserExplorerCompatibilityModules = [
  'explore-app',
  'playwright-driver'
] as const;

export type LegacyBrowserExplorerCompatibilityModule = typeof legacyBrowserExplorerCompatibilityModules[number];

export interface LegacyBrowserExplorerWrapperSourceEntry {
  readonly moduleName: LegacyBrowserExplorerCompatibilityModule;
  readonly path: string;
}

export const legacyBrowserExplorerWrapperSourceEntries: readonly LegacyBrowserExplorerWrapperSourceEntry[] =
  legacyBrowserExplorerCompatibilityModules.map((moduleName): LegacyBrowserExplorerWrapperSourceEntry => ({
    moduleName,
    path: `src/domain/explore/${moduleName}.ts`
  }));

export interface LegacyBrowserExplorerDistOutputEntry {
  readonly moduleName: LegacyBrowserExplorerCompatibilityModule;
  readonly jsPath: string;
  readonly declarationPath: string;
  readonly sourceMapPath: string;
}

export const legacyBrowserExplorerDistOutputEntries: readonly LegacyBrowserExplorerDistOutputEntry[] =
  legacyBrowserExplorerCompatibilityModules.map((moduleName): LegacyBrowserExplorerDistOutputEntry => ({
    moduleName,
    jsPath: `${browserExplorerCompatibilityContract.legacyDistRoot}/${moduleName}.js`,
    declarationPath: `${browserExplorerCompatibilityContract.legacyDistRoot}/${moduleName}.d.ts`,
    sourceMapPath: `${browserExplorerCompatibilityContract.legacyDistRoot}/${moduleName}.js.map`
  }));

export interface BrowserExplorerPackageExportEntry {
  readonly exportPath: string;
  readonly types: string;
  readonly default: string;
  readonly specifier: string;
}

export interface BrowserExplorerPackageSourceEntry {
  readonly moduleName: typeof browserExplorerCompatibilityContract.packageOwnedModules[number];
  readonly path: string;
}

export const browserExplorerPackageSourceEntries: readonly BrowserExplorerPackageSourceEntry[] =
  browserExplorerCompatibilityContract.packageOwnedModules.map((moduleName): BrowserExplorerPackageSourceEntry => ({
    moduleName,
    path: `packages/browser-explorer/src/${moduleName}.ts`
  }));

export const browserExplorerPackageExportEntries: readonly BrowserExplorerPackageExportEntry[] = [
  {
    exportPath: '.',
    types: './dist/index.d.ts',
    default: './dist/index.js',
    specifier: browserExplorerCompatibilityContract.packageName
  },
  ...browserExplorerCompatibilityContract.packageOwnedModules.map((moduleName): BrowserExplorerPackageExportEntry => ({
    exportPath: `./${moduleName}`,
    types: `./dist/${moduleName}.d.ts`,
    default: `./dist/${moduleName}.js`,
    specifier: `${browserExplorerCompatibilityContract.packageName}/${moduleName}`
  }))
];

export interface BrowserExplorerPackageDistOutputEntry {
  readonly exportPath: string;
  readonly jsPath: string;
  readonly declarationPath: string;
  readonly sourceMapPath: string;
}

export const browserExplorerPackageDistOutputEntries: readonly BrowserExplorerPackageDistOutputEntry[] =
  browserExplorerPackageExportEntries.map((entry): BrowserExplorerPackageDistOutputEntry => ({
    exportPath: entry.exportPath,
    jsPath: `packages/browser-explorer/${entry.default.replace(/^\.\//u, '')}`,
    declarationPath: `packages/browser-explorer/${entry.types.replace(/^\.\//u, '')}`,
    sourceMapPath: `packages/browser-explorer/${entry.default.replace(/^\.\//u, '')}.map`
  }));

export const browserExplorerPackageSubpathSpecifiers = browserExplorerPackageExportEntries.map((entry) => entry.specifier);
