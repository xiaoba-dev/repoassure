import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { version } from '../../index.js';
import { callHardeningTool, listHardeningTools } from './tool-registry.js';

export function createHardeningMcpServer(): Server {
  const server = new Server(
    {
      name: 'hardening-mcp',
      version
    },
    {
      capabilities: {
        tools: {}
      },
      instructions:
        'Use these tools to analyze a local AI-generated web app, boot and explore it, and generate hardening evidence, tests, and repair plans under .hardening. They write local evidence and do not modify target repository source or apply repair patches.'
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: listHardeningTools()
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) =>
    callHardeningTool(request.params.name, request.params.arguments ?? {})
  );

  return server;
}

export async function runStdioHardeningMcpServer(): Promise<void> {
  const server = createHardeningMcpServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);
}
