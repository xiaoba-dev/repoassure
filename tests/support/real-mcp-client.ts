import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import {
  getDefaultEnvironment,
  StdioClientTransport
} from '@modelcontextprotocol/sdk/client/stdio.js';
import { redactSensitiveText } from '@hardening-mcp/shared';

const MAX_STDERR_BYTES = 64 * 1024;
const DEFAULT_CONNECT_TIMEOUT_MS = 15_000;

export interface ConnectRealMcpClientOptions {
  command?: string;
  args: string[];
  cwd?: string;
  connectTimeoutMs?: number;
}

export interface RealMcpClientConnection {
  client: Client;
  pid: number;
  stderr: () => string;
  close: () => Promise<void>;
}

export async function connectRealMcpClient(
  options: ConnectRealMcpClientOptions
): Promise<RealMcpClientConnection> {
  const transport = new StdioClientTransport({
    command: options.command ?? process.execPath,
    args: options.args,
    cwd: options.cwd ?? process.cwd(),
    env: getDefaultEnvironment(),
    stderr: 'pipe'
  });
  let stderrText = '';
  transport.stderr?.on('data', (chunk: Buffer | string) => {
    stderrText = `${stderrText}${chunk.toString()}`.slice(-MAX_STDERR_BYTES);
  });
  const client = new Client(
    { name: 'repoassure-real-client-validation', version: '0.1.0' },
    { capabilities: {} }
  );
  let observedPid: number | null = null;
  const pidWatcher = setInterval(() => {
    observedPid ??= transport.pid;
  }, 5);
  pidWatcher.unref();

  try {
    await client.connect(transport, { timeout: options.connectTimeoutMs ?? DEFAULT_CONNECT_TIMEOUT_MS });
  } catch (error) {
    const failedPid = transport.pid ?? observedPid;
    clearInterval(pidWatcher);
    await transport.close().catch(() => undefined);
    if (failedPid !== null) await terminateChild(failedPid);
    const safeError = redactSensitiveText(error instanceof Error ? error.message : String(error));
    const safeStderr = redactSensitiveText(stderrText).trim();
    // The original cause may contain credentials in spawn paths or stderr.
    /* eslint-disable preserve-caught-error */
    throw new Error(safeStderr ? `${safeError}: ${safeStderr}` : safeError, {
      cause: new Error(safeError)
    });
    /* eslint-enable preserve-caught-error */
  }
  clearInterval(pidWatcher);

  const pid = transport.pid;
  if (pid === null) {
    await client.close().catch(() => undefined);
    throw new Error('Real MCP stdio transport did not expose a child process id');
  }

  let closed = false;
  return {
    client,
    pid,
    stderr: () => redactSensitiveText(stderrText).trim(),
    close: async () => {
      if (closed) return;
      closed = true;
      let closeError: unknown;
      try { await client.close(); } catch (error) { closeError = error; }
      await terminateChild(pid);
      if (closeError) {
        throw new Error(`Real MCP client close failed: ${redactSensitiveText(String(closeError))}`, {
          cause: new Error(redactSensitiveText(closeError instanceof Error ? closeError.message : String(closeError)))
        });
      }
    }
  };
}

export function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code !== 'ESRCH';
  }
}

async function terminateChild(pid: number): Promise<void> {
  if (await waitForExit(pid, 500)) return;
  if (!signalProcess(pid, 'SIGTERM')) return;
  if (await waitForExit(pid, 1_000)) return;
  if (!signalProcess(pid, 'SIGKILL')) return;
  if (!await waitForExit(pid, 1_000)) {
    throw new Error(`Real MCP child process did not exit after SIGKILL: ${pid}`);
  }
}

export function signalProcess(
  pid: number,
  signal: NodeJS.Signals,
  kill: typeof process.kill = process.kill
): boolean {
  try {
    kill(pid, signal);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ESRCH') return false;
    throw error;
  }
}

async function waitForExit(pid: number, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!isProcessAlive(pid)) return true;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  return !isProcessAlive(pid);
}
