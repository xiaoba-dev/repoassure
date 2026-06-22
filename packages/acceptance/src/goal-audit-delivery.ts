import type { GoalAuditItem } from './goal-audit.js';
import type { GoalAuditTextSources } from './goal-audit-sources.js';
import {
  buildGoalAuditFileRequirement,
  buildGoalAuditTextRequirement
} from './goal-audit-requirements.js';

export interface BuildDeliveryAndP0GoalAuditItemsInput {
  sources: Partial<GoalAuditTextSources>;
  pathExists: (path: string) => Promise<boolean>;
}

export async function buildDeliveryAndP0GoalAuditItems(
  input: BuildDeliveryAndP0GoalAuditItemsInput
): Promise<GoalAuditItem[]> {
  const packageJson = input.sources.packageJson ?? '';
  const toolRegistry = input.sources.toolRegistry ?? '';
  const mcpServerTest = input.sources.mcpServerTest ?? '';
  const cliRun = input.sources.cliRun ?? '';

  return [
    await buildGoalAuditFileRequirement({
      category: '交付物',
      requirement: '可运行的 CLI',
      paths: ['src/adapters/cli/index.ts', 'src/adapters/cli/run.ts', 'dist/adapters/cli/index.js'],
      extraPassed: packageJson.includes('"hardening": "dist/adapters/cli/index.js"'),
      evidence: ['package.json bin.hardening -> dist/adapters/cli/index.js'],
      pathExists: input.pathExists
    }),
    await buildGoalAuditFileRequirement({
      category: '交付物',
      requirement: '可运行的 MCP Server',
      paths: ['src/adapters/mcp/index.ts', 'src/adapters/mcp/server.ts', 'dist/adapters/mcp/index.js'],
      extraPassed: packageJson.includes('"hardening-mcp": "dist/adapters/mcp/index.js"'),
      evidence: ['package.json bin.hardening-mcp -> dist/adapters/mcp/index.js'],
      pathExists: input.pathExists
    }),
    buildGoalAuditTextRequirement({
      category: 'P0 Tools',
      requirement: 'P0 tools 通过 MCP 层暴露',
      text: `${toolRegistry}\n${mcpServerTest}`,
      needles: [
        'analyze_repo',
        'boot_app',
        'explore_app',
        'generate_tests',
        'harden_report',
        'runs the P0 hardening tool chain over MCP transport'
      ],
      evidence: ['src/adapters/mcp/tool-registry.ts lists all P0 tools; tests/integration/mcp-server.test.ts calls the P0 chain over MCP transport']
    }),
    buildGoalAuditTextRequirement({
      category: 'P0 Tools',
      requirement: 'P0 tools 通过 CLI 层调用',
      text: cliRun,
      needles: [
        'runAnalyzeRepoTool',
        'runExploreAppTool',
        'runGenerateTestsTool',
        'runHardenReportTool',
        'runHardeningTool'
      ],
      evidence: ['src/adapters/cli/run.ts dispatches analyze/explore/generate-tests/report/run']
    })
  ];
}
