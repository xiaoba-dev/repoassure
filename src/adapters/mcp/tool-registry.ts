import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';

import { createPlaywrightBrowserDriver } from '../../domain/explore/playwright-driver.js';
import { redactSensitiveText } from '../../shared/privacy-redaction.js';
import { runAnalyzeRepoTool } from '../../tools/analyze-repo-tool.js';
import { runBootAppTool, toSerializableBootResult } from '../../tools/boot-app-tool.js';
import { runExploreAppTool } from '../../tools/explore-app-tool.js';
import { runGenerateTestsTool } from '../../tools/generate-tests-tool.js';
import { runGenerateRepairPlanTool } from '../../tools/generate-repair-plan-tool.js';
import { runHardenReportTool } from '../../tools/harden-report-tool.js';
import { runHardeningTool } from '../../tools/run-hardening-tool.js';
import {
  isBlockedGoalRecoveryToolName,
  listBlockedGoalRecoveryTools,
  runBlockedGoalRecoveryTool,
  type BlockedGoalRecoveryToolName
} from './blocked-goal-recovery-tools.js';
import { bootSessionStore } from './boot-session-store.js';

type JsonObject = Record<string, unknown>;

type HardeningToolName =
  | 'analyze_repo'
  | 'boot_app'
  | 'stop_app'
  | 'explore_app'
  | 'generate_tests'
  | 'generate_repair_plan'
  | 'harden_report'
  | 'run_hardening'
  | BlockedGoalRecoveryToolName;

export function listHardeningTools(): Tool[] {
  return [
    {
      name: 'analyze_repo',
      title: 'Analyze Repository',
      description: 'Analyze a local web repository and write .hardening/run/repo-profile.json.',
      inputSchema: objectSchema(
        {
          root: stringSchema('Absolute or relative repository root path.')
        },
        ['root']
      ),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    {
      name: 'boot_app',
      title: 'Boot App',
      description: 'Start a local development app and write .hardening/run/boot-result.json.',
      inputSchema: objectSchema(
        {
          root: stringSchema('Repository root path.'),
          startCommand: stringSchema('Command used to start the app, for example pnpm dev.'),
          timeoutMs: numberSchema('Boot timeout in milliseconds.')
        },
        ['root', 'startCommand']
      ),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false
      }
    },
    {
      name: 'stop_app',
      title: 'Stop App',
      description: 'Stop a boot_app session created by this MCP server.',
      inputSchema: objectSchema(
        {
          sessionId: stringSchema('Boot session id returned by boot_app.')
        },
        ['sessionId']
      ),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    {
      name: 'explore_app',
      title: 'Explore App',
      description: 'Explore an app URL, classify runtime findings, and write .hardening/run/findings.json.',
      inputSchema: objectSchema(
        {
          root: stringSchema('Repository root path.'),
          url: stringSchema('Application URL to explore.'),
          criticalPaths: arrayStringSchema('Optional path, URL, or short natural-language critical path intents to seed exploration.'),
          maxRoutes: numberSchema('Maximum routes to visit.'),
          maxActionsPerRoute: numberSchema('Maximum interactions per route.'),
          storageStatePath: stringSchema('Optional Playwright storageState JSON path for authenticated exploration.'),
          trace: booleanSchema('Record Playwright trace zip artifacts when true.'),
          workspaceOutputDir: stringSchema('Optional shared multi-repo workspace output directory.'),
          browser: booleanSchema('Use Playwright browser exploration when true.')
        },
        ['root', 'url']
      ),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true
      }
    },
    {
      name: 'generate_tests',
      title: 'Generate Regression Tests',
      description: 'Generate Playwright regression tests from hardening findings.',
      inputSchema: objectSchema(
        {
          findingsPath: stringSchema('Path to .hardening/run/findings.json.'),
          outputDir: stringSchema('Directory where generated tests should be written.'),
          smokeRoutes: arrayStringSchema('Optional path or URL routes that should receive generated smoke tests.'),
          baseUrl: stringSchema('Optional application base URL used as generated spec default and same-origin smoke route boundary.')
        },
        ['findingsPath', 'outputDir']
      ),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false
      }
    },
    {
      name: 'generate_repair_plan',
      title: 'Generate Repair Plan',
      description: 'Generate AI IDE-readable repair-plan.json and repair-plan.md from hardening run artifacts.',
      inputSchema: objectSchema(
        {
          root: stringSchema('Repository root path.'),
          runDir: stringSchema('Optional hardening run directory. Default: <root>/.hardening/latest.')
        },
        ['root']
      ),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    {
      name: 'harden_report',
      title: 'Write Hardening Report',
      description: 'Write the hardening markdown report from run artifacts.',
      inputSchema: objectSchema(
        {
          runDir: stringSchema('Run artifact directory, usually .hardening/run.'),
          outputPath: stringSchema('Markdown report output path.')
        },
        ['runDir', 'outputPath']
      ),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    {
      name: 'run_hardening',
      title: 'Run Hardening Flow',
      description: 'Run analyze, optional boot, explore, test generation, and report in one flow.',
      inputSchema: objectSchema(
        {
          root: stringSchema('Repository root path.'),
          url: stringSchema('Optional already-running application URL.'),
          startCommand: stringSchema('Optional command used when URL is omitted.'),
          bootTimeoutMs: numberSchema('Boot timeout in milliseconds.'),
          criticalPaths: arrayStringSchema('Optional path, URL, or short natural-language critical path intents to seed exploration.'),
          maxRoutes: numberSchema('Maximum routes to visit.'),
          maxActionsPerRoute: numberSchema('Maximum interactions per route.'),
          storageStatePath: stringSchema('Optional Playwright storageState JSON path for authenticated exploration.'),
          trace: booleanSchema('Record Playwright trace zip artifacts when true.'),
          browser: booleanSchema('Use Playwright browser exploration when true.')
        },
        ['root']
      ),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true
      }
    },
    ...listBlockedGoalRecoveryTools()
  ];
}

export async function callHardeningTool(name: string, args: unknown): Promise<CallToolResult> {
  try {
    if (!isHardeningToolName(name)) {
      return toToolError(`Unknown tool: ${name}`);
    }

    const record = asRecord(args);
    const result = await runNamedTool(name, record);
    return toToolResult(result);
  } catch (error) {
    return toToolError(error instanceof Error ? error.message : 'Unknown hardening tool error');
  }
}

async function runNamedTool(name: HardeningToolName, args: JsonObject): Promise<JsonObject> {
  if (isBlockedGoalRecoveryToolName(name)) {
    return runBlockedGoalRecoveryTool(name, args);
  }
  switch (name) {
    case 'analyze_repo':
      return toJsonObject(
        await runAnalyzeRepoTool({
          root: readRequiredString(args, 'root')
        })
      );
    case 'boot_app': {
      const session = await runBootAppTool({
        root: readRequiredString(args, 'root'),
        startCommand: readRequiredString(args, 'startCommand'),
        timeoutMs: readOptionalPositiveInteger(args, 'timeoutMs') ?? 30_000
      });
      const sessionId = bootSessionStore.register(session);

      return {
        ...toSerializableBootResult(session),
        resultPath: session.resultPath,
        sessionId
      };
    }
    case 'stop_app':
      return toJsonObject(await bootSessionStore.stop(readRequiredString(args, 'sessionId')));
    case 'explore_app': {
      const storageStatePath = readOptionalString(args, 'storageStatePath');
      const trace = readOptionalBoolean(args, 'trace');
      const browserDriver = readOptionalBoolean(args, 'browser')
        ? await createPlaywrightBrowserDriver({
            ...(storageStatePath ? { storageStatePath } : {}),
            ...(trace ? { trace: true } : {})
          })
        : undefined;
      return toJsonObject(
        await runExploreAppTool({
          root: readRequiredString(args, 'root'),
          url: readRequiredString(args, 'url'),
          criticalPaths: readOptionalStringArray(args, 'criticalPaths') ?? [],
          maxRoutes: readOptionalPositiveInteger(args, 'maxRoutes') ?? 20,
          maxActionsPerRoute: readOptionalNonNegativeInteger(args, 'maxActionsPerRoute') ?? 20,
          ...(browserDriver ? { browserDriver } : {})
        })
      );
    }
    case 'generate_tests': {
      const smokeRoutes = readOptionalStringArray(args, 'smokeRoutes');
      const baseUrl = readOptionalString(args, 'baseUrl');
      return toJsonObject(
        await runGenerateTestsTool({
          findingsPath: readRequiredString(args, 'findingsPath'),
          outputDir: readRequiredString(args, 'outputDir'),
          ...(smokeRoutes ? { smokeRoutes } : {}),
          ...(baseUrl ? { baseUrl } : {})
        })
      );
    }
    case 'generate_repair_plan': {
      const runDir = readOptionalString(args, 'runDir');
      return toJsonObject(
        await runGenerateRepairPlanTool({
          root: readRequiredString(args, 'root'),
          ...(runDir ? { runDir } : {})
        })
      );
    }
    case 'harden_report':
      return toJsonObject(
        await runHardenReportTool({
          runDir: readRequiredString(args, 'runDir'),
          outputPath: readRequiredString(args, 'outputPath')
        })
      );
    case 'run_hardening': {
      const storageStatePath = readOptionalString(args, 'storageStatePath');
      const trace = readOptionalBoolean(args, 'trace');
      const browserDriver = readOptionalBoolean(args, 'browser')
        ? await createPlaywrightBrowserDriver({
            ...(storageStatePath ? { storageStatePath } : {}),
            ...(trace ? { trace: true } : {})
          })
        : undefined;
      const url = readOptionalString(args, 'url');
      const startCommand = readOptionalString(args, 'startCommand');
      const bootTimeoutMs = readOptionalPositiveInteger(args, 'bootTimeoutMs');
      const criticalPaths = readOptionalStringArray(args, 'criticalPaths');
      const maxRoutes = readOptionalPositiveInteger(args, 'maxRoutes');
      const maxActionsPerRoute = readOptionalNonNegativeInteger(args, 'maxActionsPerRoute');
      const workspaceOutputDir = readOptionalString(args, 'workspaceOutputDir');

      return toJsonObject(
        await runHardeningTool({
          root: readRequiredString(args, 'root'),
          ...(url ? { url } : {}),
          ...(startCommand ? { startCommand } : {}),
          ...(bootTimeoutMs ? { bootTimeoutMs } : {}),
          ...(criticalPaths ? { criticalPaths } : {}),
          ...(maxRoutes ? { maxRoutes } : {}),
          ...(maxActionsPerRoute !== null ? { maxActionsPerRoute } : {}),
          ...(workspaceOutputDir ? { workspaceOutputDir } : {}),
          ...(browserDriver ? { browserDriver } : {})
        })
      );
    }
  }
}

function toToolResult(value: JsonObject): CallToolResult {
  const safeValue = redactMcpStructuredContent(value);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(safeValue, null, 2)
      }
    ],
    structuredContent: safeValue,
    isError: false
  };
}

function toToolError(message: string): CallToolResult {
  const safeMessage = redactSensitiveText(message);

  return {
    content: [
      {
        type: 'text',
        text: safeMessage
      }
    ],
    isError: true
  };
}

function isHardeningToolName(value: string): value is HardeningToolName {
  return listHardeningTools().some((tool) => tool.name === value);
}

function readRequiredString(record: JsonObject, key: string): string {
  const value = readOptionalString(record, key);

  if (!value) {
    throw new Error(`Missing required string argument: ${key}`);
  }

  return value;
}

function readOptionalString(record: JsonObject, key: string): string | null {
  const value = record[key];
  return typeof value === 'string' && value.trim() ? value : null;
}

function readOptionalNumber(record: JsonObject, key: string): number | null {
  const value = record[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readOptionalPositiveInteger(record: JsonObject, key: string): number | null {
  const value = readOptionalNumber(record, key);

  if (value === null) {
    return null;
  }

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid positive integer argument: ${key}`);
  }

  return value;
}

function readOptionalNonNegativeInteger(record: JsonObject, key: string): number | null {
  const value = readOptionalNumber(record, key);

  if (value === null) {
    return null;
  }

  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Invalid non-negative integer argument: ${key}`);
  }

  return value;
}

function readOptionalBoolean(record: JsonObject, key: string): boolean {
  return record[key] === true;
}

function readOptionalStringArray(record: JsonObject, key: string): string[] | null {
  const value = record[key];

  if (!Array.isArray(value)) {
    return null;
  }

  return value.flatMap((item) => (typeof item === 'string' ? [item] : []));
}

function asRecord(value: unknown): JsonObject {
  return typeof value === 'object' && value !== null ? (value as JsonObject) : {};
}

function toJsonObject(value: unknown): JsonObject {
  return asRecord(value);
}

export function redactMcpStructuredContent(value: JsonObject): JsonObject {
  return asRecord(redactJsonValue(value));
}

function redactJsonValue(value: unknown, key = ''): unknown {
  if (key && key !== 'sessionId' && isSensitiveOutputKey(key)) {
    return '[REDACTED]';
  }
  if (typeof value === 'string') {
    if (key === 'sessionId') return value;
    if (key === 'jsonPath' || key === 'markdownPath') return redactPathPreservingBasename(value);
    return redactSensitiveText(value);
  }
  if (Array.isArray(value)) return value.map((item) => redactJsonValue(item));
  if (!isObjectRecord(value)) return value;
  return Object.fromEntries(Object.entries(value).map(([entryKey, entryValue]) => [
    entryKey,
    redactJsonValue(entryValue, entryKey)
  ]));
}

function redactPathPreservingBasename(value: string): string {
  const separatorIndex = Math.max(value.lastIndexOf('/'), value.lastIndexOf('\\'));
  if (separatorIndex < 0) return redactSensitiveText(value);
  return `${redactSensitiveText(value.slice(0, separatorIndex))}${value[separatorIndex]}${value.slice(separatorIndex + 1)}`;
}

function isSensitiveOutputKey(key: string): boolean {
  if (
    key === 'nonAuthorizationBoundary'
    || key === 'maintainerReviewBoundary'
    || key === 'redactionBoundary'
    || key === 'authorizationStatus'
  ) {
    return false;
  }
  const normalized = key.toLowerCase().replace(/[^a-z0-9]/gu, '');
  return normalized === 'authorization'
    || normalized === 'proxyauthorization'
    || normalized === 'cookie'
    || normalized === 'setcookie'
    || /(?:apikeys?|tokens?|secrets?|password|passcode|jwt|csrf|privatekey|servicerole)$/u.test(normalized);
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function objectSchema(properties: Record<string, object>, required: string[]): Tool['inputSchema'] {
  return {
    type: 'object',
    properties,
    required
  };
}

function stringSchema(description: string): object {
  return { type: 'string', description };
}

function numberSchema(description: string): object {
  return { type: 'number', description };
}

function booleanSchema(description: string): object {
  return { type: 'boolean', description };
}

function arrayStringSchema(description: string): object {
  return {
    type: 'array',
    description,
    items: { type: 'string' }
  };
}
