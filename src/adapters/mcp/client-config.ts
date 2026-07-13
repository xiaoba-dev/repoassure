import { stat } from 'node:fs/promises';
import { isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const mcpClientIds = ['cursor', 'vscode', 'codex'] as const;
export type McpClientId = typeof mcpClientIds[number];

export interface McpClientConfigOptions {
  client: McpClientId;
  repoRoot: string;
  nodePath: string;
}

interface McpClientConfigDefaults {
  defaultRepoRoot: string;
  nodePath: string;
}

export function createMcpClientConfig(options: McpClientConfigOptions): string {
  const repoRoot = resolveAbsolutePath(options.repoRoot, 'repository root');
  const nodePath = resolveAbsolutePath(options.nodePath, 'Node.js executable');
  const entryPath = join(repoRoot, 'apps', 'mcp-server', 'index.js');

  if (options.client === 'cursor') {
    return formatJson({
      mcpServers: {
        repoassure: { command: nodePath, args: [entryPath] }
      }
    });
  }
  if (options.client === 'vscode') {
    return formatJson({
      servers: {
        repoassure: { type: 'stdio', command: nodePath, args: [entryPath] }
      }
    });
  }
  if (options.client === 'codex') {
    return [
      '[mcp_servers.repoassure]',
      `command = ${JSON.stringify(nodePath)}`,
      `args = [${JSON.stringify(entryPath)}]`,
      ''
    ].join('\n');
  }
  throw new Error(`Unsupported MCP client: ${String(options.client)}`);
}

export function parseMcpClientConfigArgs(
  args: string[],
  defaults: McpClientConfigDefaults
): McpClientConfigOptions {
  let client: McpClientId = 'cursor';
  let repoRoot = defaults.defaultRepoRoot;

  const firstArgumentIndex = args[0] === '--' ? 1 : 0;
  for (let index = firstArgumentIndex; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--client') {
      const value = readValue(args, ++index, '--client');
      if (!isMcpClientId(value)) throw new Error(`Unsupported MCP client: ${value}`);
      client = value;
      continue;
    }
    if (argument === '--repo-root') {
      repoRoot = readValue(args, ++index, '--repo-root');
      continue;
    }
    throw new Error(`Unexpected argument: ${argument}`);
  }

  return {
    client,
    repoRoot: resolveAbsolutePath(repoRoot, 'repository root'),
    nodePath: resolveAbsolutePath(defaults.nodePath, 'Node.js executable')
  };
}

export function defaultMcpRepoRoot(): string {
  return fileURLToPath(new URL('../../../', import.meta.url));
}

export async function assertMcpRuntimeReady(repoRoot: string): Promise<void> {
  const root = resolveAbsolutePath(repoRoot, 'repository root');
  await assertRegularFile(
    join(root, 'apps', 'mcp-server', 'index.js'),
    'RepoAssure MCP app entry is missing'
  );
  await assertRegularFile(
    join(root, 'dist', 'adapters', 'mcp', 'index.js'),
    'RepoAssure MCP build output is missing; run pnpm build first'
  );
}

function isMcpClientId(value: string): value is McpClientId {
  return mcpClientIds.some((client) => client === value);
}

function readValue(args: string[], index: number, flag: string): string {
  const value = args[index];
  if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}`);
  return value;
}

function resolveAbsolutePath(value: string, label: string): string {
  if (!isAbsolute(value)) throw new Error(`${label} must be an absolute path`);
  return resolve(value);
}

async function assertRegularFile(path: string, message: string): Promise<void> {
  try {
    const file = await stat(path);
    if (file.isFile()) return;
  } catch {
    // Keep caller paths out of user-facing errors.
  }
  throw new Error(message);
}

function formatJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}
