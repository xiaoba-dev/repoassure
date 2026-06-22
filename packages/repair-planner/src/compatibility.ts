export const repairPlannerCompatibilityContract = {
  packageName: '@hardening-mcp/repair-planner',
  packageOwnedModules: ['compatibility', 'generate-repair-plan', 'repair-plan']
} as const;

export const legacyRepairPlannerCompatibilityModules = [
  'generate-repair-plan',
  'repair-plan'
] as const;

export type LegacyRepairPlannerCompatibilityModule = typeof legacyRepairPlannerCompatibilityModules[number];

export interface LegacyRepairPlannerWrapperSourceEntry {
  readonly moduleName: LegacyRepairPlannerCompatibilityModule;
  readonly path: string;
}

export const legacyRepairPlannerWrapperSourceEntries: readonly LegacyRepairPlannerWrapperSourceEntry[] = [
  {
    moduleName: 'generate-repair-plan',
    path: 'src/domain/repair-plan/generate-repair-plan.ts'
  },
  {
    moduleName: 'repair-plan',
    path: 'src/types/repair-plan.ts'
  }
];

export interface LegacyRepairPlannerDistOutputEntry {
  readonly moduleName: LegacyRepairPlannerCompatibilityModule;
  readonly jsPath: string;
  readonly declarationPath: string;
  readonly sourceMapPath: string;
}

export const legacyRepairPlannerDistOutputEntries: readonly LegacyRepairPlannerDistOutputEntry[] = [
  {
    moduleName: 'generate-repair-plan',
    jsPath: 'dist/domain/repair-plan/generate-repair-plan.js',
    declarationPath: 'dist/domain/repair-plan/generate-repair-plan.d.ts',
    sourceMapPath: 'dist/domain/repair-plan/generate-repair-plan.js.map'
  },
  {
    moduleName: 'repair-plan',
    jsPath: 'dist/types/repair-plan.js',
    declarationPath: 'dist/types/repair-plan.d.ts',
    sourceMapPath: 'dist/types/repair-plan.js.map'
  }
];

export interface RepairPlannerPackageExportEntry {
  readonly exportPath: string;
  readonly types: string;
  readonly default: string;
  readonly specifier: string;
}

export interface RepairPlannerPackageSourceEntry {
  readonly moduleName: typeof repairPlannerCompatibilityContract.packageOwnedModules[number];
  readonly path: string;
}

export const repairPlannerPackageSourceEntries: readonly RepairPlannerPackageSourceEntry[] =
  repairPlannerCompatibilityContract.packageOwnedModules.map((moduleName): RepairPlannerPackageSourceEntry => ({
    moduleName,
    path: `packages/repair-planner/src/${moduleName}.ts`
  }));

export const repairPlannerPackageExportEntries: readonly RepairPlannerPackageExportEntry[] = [
  {
    exportPath: '.',
    types: './dist/index.d.ts',
    default: './dist/index.js',
    specifier: repairPlannerCompatibilityContract.packageName
  },
  ...repairPlannerCompatibilityContract.packageOwnedModules.map((moduleName): RepairPlannerPackageExportEntry => ({
    exportPath: `./${moduleName}`,
    types: `./dist/${moduleName}.d.ts`,
    default: `./dist/${moduleName}.js`,
    specifier: `${repairPlannerCompatibilityContract.packageName}/${moduleName}`
  }))
];

export interface RepairPlannerPackageDistOutputEntry {
  readonly exportPath: string;
  readonly jsPath: string;
  readonly declarationPath: string;
  readonly sourceMapPath: string;
}

export const repairPlannerPackageDistOutputEntries: readonly RepairPlannerPackageDistOutputEntry[] =
  repairPlannerPackageExportEntries.map((entry): RepairPlannerPackageDistOutputEntry => ({
    exportPath: entry.exportPath,
    jsPath: `packages/repair-planner/${entry.default.replace(/^\.\//u, '')}`,
    declarationPath: `packages/repair-planner/${entry.types.replace(/^\.\//u, '')}`,
    sourceMapPath: `packages/repair-planner/${entry.default.replace(/^\.\//u, '')}.map`
  }));

export const repairPlannerPackageSubpathSpecifiers = repairPlannerPackageExportEntries.map((entry) => entry.specifier);
