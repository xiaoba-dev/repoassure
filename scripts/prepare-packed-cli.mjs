import { readFile, writeFile } from 'node:fs/promises';

const rewrites = [
  {
    path: 'dist/adapters/cli/run.js',
    from: "from '@hardening-mcp/acceptance';",
    to: "from '../../../packages/acceptance/dist/index.js';"
  },
  {
    path: 'dist/tools/security-import-tool.js',
    from: "from '@hardening-mcp/security-assurance/import-security-evidence';",
    to: "from '../../packages/security-assurance/dist/import-security-evidence.js';"
  },
  {
    path: 'dist/tools/prepare-repair-handoff-tool.js',
    from: "from '@hardening-mcp/acceptance/run-repair-handoff';",
    to: "from '../../packages/acceptance/dist/run-repair-handoff.js';"
  },
  {
    path: 'dist/tools/preview-repair-execution-tool.js',
    from: "from '@hardening-mcp/acceptance/run-repair-execute';",
    to: "from '../../packages/acceptance/dist/run-repair-execute.js';"
  },
  {
    path: 'dist/tools/generate-repair-patch-plan-tool.js',
    from: "from '@hardening-mcp/acceptance/run-repair-patch-plan';",
    to: "from '../../packages/acceptance/dist/run-repair-patch-plan.js';"
  },
  {
    path: 'dist/tools/assemble-repair-evidence-package-tool.js',
    from: "from '@hardening-mcp/acceptance/run-repair-evidence-package';",
    to: "from '../../packages/acceptance/dist/run-repair-evidence-package.js';"
  },
  {
    path: 'packages/browser-explorer/dist/explore-app.js',
    from: "from '@hardening-mcp/shared/privacy-redaction';",
    to: "from '../../shared/dist/privacy-redaction.js';"
  },
  {
    path: 'packages/repair-planner/dist/generate-repair-plan.js',
    from: "from '@hardening-mcp/shared/privacy-redaction';",
    to: "from '../../shared/dist/privacy-redaction.js';"
  },
  {
    path: 'packages/repair-planner/dist/generate-repair-plan.js',
    from: "from '@hardening-mcp/shared/shell-quote';",
    to: "from '../../shared/dist/shell-quote.js';"
  },
  {
    path: 'packages/security-assurance/dist/import-security-evidence.js',
    from: "from '@hardening-mcp/shared/privacy-redaction';",
    to: "from '../../shared/dist/privacy-redaction.js';"
  }
];

for (const rewrite of rewrites) {
  const source = await readFile(rewrite.path, 'utf8');

  if (source.includes(rewrite.from)) {
    await writeFile(rewrite.path, source.replace(rewrite.from, rewrite.to));
    continue;
  }

  if (!source.includes(rewrite.to)) {
    throw new Error(`Packed CLI rewrite source was not found in ${rewrite.path}: ${rewrite.from}`);
  }
}
