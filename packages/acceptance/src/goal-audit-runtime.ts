import type { GoalAuditItem } from './goal-audit.js';
import type { GoalAuditTextSources } from './goal-audit-sources.js';
import { buildGoalAuditTextRequirement } from './goal-audit-requirements.js';

export function buildRuntimeGoalAuditItems(sources: Partial<GoalAuditTextSources>): GoalAuditItem[] {
  return [
    buildGoalAuditTextRequirement({
      category: 'MCP 可运行性',
      requirement: '协议级 list/call、P0 链路与 session 清理',
      text: [
        sources.packageJson,
        sources.mcpServerSource,
        sources.toolRegistry,
        sources.readme,
        sources.userAcceptanceGuide,
        sources.mcpProtocolTests
      ].join('\n'),
      needles: [
        '"hardening-mcp": "dist/adapters/mcp/index.js"',
        'runStdioHardeningMcpServer',
        'StdioServerTransport',
        'ListToolsRequestSchema',
        'CallToolRequestSchema',
        'tools/list',
        'tools/call',
        'lists and calls hardening tools over MCP transport',
        'runs the P0 hardening tool chain over MCP transport',
        'stop_app',
        'sessionId',
        'redacts sensitive values from MCP tool errors',
        'redacts sensitive values from successful MCP tool content and structured content',
        'redacts sensitive values from MCP startup failures',
        'MCP client 能列出以上 tools'
      ],
      evidence: ['package.json exposes hardening-mcp stdio bin; src/adapters/mcp/server.ts binds list/call handlers to the registry; integration tests exercise tools/list, tools/call, the P0 MCP chain and stop_app session cleanup; registry/fatal-error tests cover argument validation and redaction']
    }),
    buildGoalAuditTextRequirement({
      category: 'CLI 可运行性',
      requirement: '子命令、帮助入口与 artifact smoke',
      text: [
        sources.packageJson,
        sources.cliRun,
        sources.readme,
        sources.acceptanceChecklist,
        sources.cliSmokeTests
      ].join('\n'),
      needles: [
        '"hardening": "dist/adapters/cli/index.js"',
        'hardening analyze <repo>',
        'hardening explore <repo> <url>',
        'hardening generate-tests <findingsPath> <outputDir>',
        'hardening plan <repo>',
        'hardening report <runDir> <outputPath>',
        'hardening run <repo> [url]',
        '--help, -h',
        'CLI 子命令提供零副作用帮助入口',
        'prints command help for %s without running the command',
        'prints short command help for %s with the help option documented',
        'prints the repo profile and writes the artifact',
        'runs explore from the CLI handler',
        'runs generate-tests from the CLI handler',
        'generates a repair plan from the latest run through the plan command',
        'runs report from the CLI handler',
        'runs analyze, explore, generate-tests, and report for a provided URL'
      ],
      evidence: ['package.json exposes hardening CLI; src/adapters/cli/run.ts documents subcommand usage including plan; unit tests cover global and per-command help without running commands; integration tests smoke analyze/explore/generate-tests/plan/report/run and inspect artifacts']
    })
  ];
}
