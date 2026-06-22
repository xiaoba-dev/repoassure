export const sharedCompatibilityContract = {
  packageName: '@hardening-mcp/shared',
  legacyDistRoot: 'dist/shared',
  packageOwnedModules: ['compatibility', 'privacy-redaction', 'shell-quote', 'shell-words']
} as const;

export const legacySharedCompatibilityModules = [
  'privacy-redaction',
  'shell-quote',
  'shell-words'
] as const;

export type LegacySharedCompatibilityModule = typeof legacySharedCompatibilityModules[number];

export interface LegacySharedWrapperSourceEntry {
  readonly moduleName: LegacySharedCompatibilityModule;
  readonly path: string;
}

export const legacySharedWrapperSourceEntries: readonly LegacySharedWrapperSourceEntry[] =
  legacySharedCompatibilityModules.map((moduleName): LegacySharedWrapperSourceEntry => ({
    moduleName,
    path: `src/shared/${moduleName}.ts`
  }));

export interface LegacySharedDistOutputEntry {
  readonly moduleName: LegacySharedCompatibilityModule;
  readonly jsPath: string;
  readonly declarationPath: string;
  readonly sourceMapPath: string;
}

export const legacySharedDistOutputEntries: readonly LegacySharedDistOutputEntry[] =
  legacySharedCompatibilityModules.map((moduleName): LegacySharedDistOutputEntry => ({
    moduleName,
    jsPath: `${sharedCompatibilityContract.legacyDistRoot}/${moduleName}.js`,
    declarationPath: `${sharedCompatibilityContract.legacyDistRoot}/${moduleName}.d.ts`,
    sourceMapPath: `${sharedCompatibilityContract.legacyDistRoot}/${moduleName}.js.map`
  }));

export interface SharedPackageExportEntry {
  readonly exportPath: string;
  readonly types: string;
  readonly default: string;
  readonly specifier: string;
}

export interface SharedPackageSourceEntry {
  readonly moduleName: typeof sharedCompatibilityContract.packageOwnedModules[number];
  readonly path: string;
}

export const sharedPackageSourceEntries: readonly SharedPackageSourceEntry[] =
  sharedCompatibilityContract.packageOwnedModules.map((moduleName): SharedPackageSourceEntry => ({
    moduleName,
    path: `packages/shared/src/${moduleName}.ts`
  }));

export const sharedPackageExportEntries: readonly SharedPackageExportEntry[] = [
  {
    exportPath: '.',
    types: './dist/index.d.ts',
    default: './dist/index.js',
    specifier: sharedCompatibilityContract.packageName
  },
  ...sharedCompatibilityContract.packageOwnedModules.map((moduleName): SharedPackageExportEntry => ({
    exportPath: `./${moduleName}`,
    types: `./dist/${moduleName}.d.ts`,
    default: `./dist/${moduleName}.js`,
    specifier: `${sharedCompatibilityContract.packageName}/${moduleName}`
  }))
];

export interface SharedPackageDistOutputEntry {
  readonly exportPath: string;
  readonly jsPath: string;
  readonly declarationPath: string;
  readonly sourceMapPath: string;
}

export const sharedPackageDistOutputEntries: readonly SharedPackageDistOutputEntry[] =
  sharedPackageExportEntries.map((entry): SharedPackageDistOutputEntry => ({
    exportPath: entry.exportPath,
    jsPath: `packages/shared/${entry.default.replace(/^\.\//u, '')}`,
    declarationPath: `packages/shared/${entry.types.replace(/^\.\//u, '')}`,
    sourceMapPath: `packages/shared/${entry.default.replace(/^\.\//u, '')}.map`
  }));

export const sharedPackageSubpathSpecifiers = sharedPackageExportEntries.map((entry) => entry.specifier);
