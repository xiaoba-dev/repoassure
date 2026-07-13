import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  createMcpClientConfig,
  parseMcpClientConfigArgs
} from '../../src/adapters/mcp/client-config.js';

const repoRoot = join('/tmp', 'RepoAssure Install With Spaces');
const nodePath = join('/opt', 'Node Runtime', 'node');
const entryPath = join(repoRoot, 'apps', 'mcp-server', 'index.js');

describe('external AI IDE MCP client configuration', () => {
  it('emits a copy-pasteable Cursor configuration with an argv-safe absolute entry', () => {
    const output = createMcpClientConfig({ client: 'cursor', repoRoot, nodePath });

    expect(JSON.parse(output)).toEqual({
      mcpServers: {
        repoassure: {
          command: nodePath,
          args: [entryPath]
        }
      }
    });
  });

  it('emits the VS Code stdio configuration envelope', () => {
    const output = createMcpClientConfig({ client: 'vscode', repoRoot, nodePath });

    expect(JSON.parse(output)).toEqual({
      servers: {
        repoassure: {
          type: 'stdio',
          command: nodePath,
          args: [entryPath]
        }
      }
    });
  });

  it('emits a Codex TOML table with escaped command and argument values', () => {
    const output = createMcpClientConfig({ client: 'codex', repoRoot, nodePath });

    expect(output).toBe([
      '[mcp_servers.repoassure]',
      `command = ${JSON.stringify(nodePath)}`,
      `args = [${JSON.stringify(entryPath)}]`,
      ''
    ].join('\n'));
  });

  it('parses explicit client and repository root arguments without reading the caller cwd', () => {
    expect(parseMcpClientConfigArgs([
      '--client', 'vscode', '--repo-root', repoRoot
    ], {
      defaultRepoRoot: '/repo/default',
      nodePath
    })).toEqual({
      client: 'vscode',
      repoRoot,
      nodePath
    });
  });

  it('accepts the argument separator forwarded by pnpm scripts', () => {
    expect(parseMcpClientConfigArgs([
      '--', '--client', 'codex', '--repo-root', repoRoot
    ], {
      defaultRepoRoot: '/repo/default',
      nodePath
    })).toEqual({
      client: 'codex',
      repoRoot,
      nodePath
    });
  });

  it('rejects unsupported clients and unexpected argument expansion', () => {
    expect(() => parseMcpClientConfigArgs(['--client', 'unknown'], {
      defaultRepoRoot: repoRoot,
      nodePath
    })).toThrow('Unsupported MCP client: unknown');
    expect(() => parseMcpClientConfigArgs(['--env', 'TOKEN=secret'], {
      defaultRepoRoot: repoRoot,
      nodePath
    })).toThrow('Unexpected argument: --env');
  });
});
