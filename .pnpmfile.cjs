/* global module */

const packedInternalDependencies = [
  '@hardening-mcp/acceptance',
  '@hardening-mcp/browser-explorer',
  '@hardening-mcp/repair-planner',
  '@hardening-mcp/security-assurance',
  '@hardening-mcp/shared',
  '@repoassure/design-system'
];

function beforePacking(pkg) {
  if (pkg.name !== 'hardening-mcp') {
    return pkg;
  }

  const dependencies = { ...pkg.dependencies };

  for (const dependency of packedInternalDependencies) {
    delete dependencies[dependency];
  }

  return {
    ...pkg,
    dependencies
  };
}

module.exports = {
  hooks: {
    beforePacking
  }
};
