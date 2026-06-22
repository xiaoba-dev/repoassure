#!/usr/bin/env node
import { formatMcpFatalError } from './fatal-error.js';
import { runStdioHardeningMcpServer } from './server.js';

runStdioHardeningMcpServer().catch((error: unknown) => {
  process.stderr.write(`${formatMcpFatalError(error)}\n`);
  process.exit(1);
});
