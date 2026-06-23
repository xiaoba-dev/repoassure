export const securityAssuranceCompatibilityContract = {
  packageName: '@hardening-mcp/security-assurance',
  packageOwnedModules: ['compatibility', 'import-security-evidence']
} as const;

export const securityAssurancePackageSubpathSpecifiers = [
  '@hardening-mcp/security-assurance',
  '@hardening-mcp/security-assurance/compatibility',
  '@hardening-mcp/security-assurance/import-security-evidence'
] as const;

export const securityAssurancePackageExportEntries = [
  { exportPath: '.', types: './dist/index.d.ts', default: './dist/index.js' },
  { exportPath: './compatibility', types: './dist/compatibility.d.ts', default: './dist/compatibility.js' },
  { exportPath: './import-security-evidence', types: './dist/import-security-evidence.d.ts', default: './dist/import-security-evidence.js' }
] as const;

export const securityAssurancePackageSourceEntries = [
  { moduleName: 'index', path: 'packages/security-assurance/src/index.ts' },
  ...securityAssuranceCompatibilityContract.packageOwnedModules.map((moduleName) => ({
    moduleName,
    path: `packages/security-assurance/src/${moduleName}.ts`
  }))
] as const;

export const securityAssurancePackageDistOutputEntries = securityAssurancePackageExportEntries.map((entry) => ({
  exportPath: entry.exportPath,
  jsPath: `packages/security-assurance/${entry.default.replace(/^\.\//u, '')}`,
  declarationPath: `packages/security-assurance/${entry.types.replace(/^\.\//u, '')}`,
  sourceMapPath: `packages/security-assurance/${entry.default.replace(/^\.\//u, '')}.map`
})) as Array<{
  exportPath: string;
  jsPath: string;
  declarationPath: string;
  sourceMapPath: string;
}>;
