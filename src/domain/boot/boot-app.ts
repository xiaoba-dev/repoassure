import { execFile, spawn, type ChildProcessByStdio } from 'node:child_process';
import { createWriteStream, type WriteStream } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Readable } from 'node:stream';

import { redactSensitiveText } from '../../shared/privacy-redaction.js';
import { parseShellWords } from '../../shared/shell-words.js';

export type BootStatus = 'running' | 'blocked' | 'failed';

export interface BootAppInput {
  root: string;
  startCommand: string;
  timeoutMs: number;
  runDir?: string;
}

export interface ParsedStartCommand {
  command: string;
  args: string[];
  env: Record<string, string>;
}

export interface BootAppResult {
  status: BootStatus;
  url: string | null;
  port: number | null;
  logsPath: string;
  daemon: boolean;
  blockers: string[];
  errors: string[];
}

export interface BootAppSession extends BootAppResult {
  stop: () => Promise<void>;
}

type BootChildProcess = ChildProcessByStdio<null, Readable, Readable>;
const LOCAL_DEV_URL_PATTERN = /https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::\]):\d+(?:\/[^\s]*)?/u;

export function parseStartCommand(startCommand: string): ParsedStartCommand {
  const parts = parseShellWords(startCommand.trim());

  if (!parts) {
    throw new Error('Start command has invalid shell quoting');
  }

  const env: Record<string, string> = {};

  while (parts.length > 0) {
    const assignment = parseInlineEnvAssignment(parts[0] ?? '');

    if (!assignment) {
      break;
    }

    env[assignment.key] = assignment.value;
    parts.shift();
  }

  const [command, ...args] = parts;

  if (!command) {
    throw new Error('Start command is empty');
  }

  return { command, args, env };
}

function parseInlineEnvAssignment(value: string): { key: string; value: string } | null {
  const separatorIndex = value.indexOf('=');

  if (separatorIndex <= 0) {
    return null;
  }

  const key = value.slice(0, separatorIndex);

  if (!/^[A-Za-z_][A-Za-z0-9_]*$/u.test(key)) {
    return null;
  }

  return {
    key,
    value: value.slice(separatorIndex + 1)
  };
}

export function extractUrlFromLog(log: string): string | null {
  const match = log.match(LOCAL_DEV_URL_PATTERN);

  if (!match) {
    return null;
  }

  return normalizeLogUrl(match[0]);
}

function normalizeLogUrl(urlText: string): string {
  return stripRootTrailingSlash(normalizeClientUrl(stripTrailingLogUrlPunctuation(urlText)));
}

function stripTrailingLogUrlPunctuation(value: string): string {
  return value.trim().replace(/[),.;]+$/u, '');
}

function stripRootTrailingSlash(value: string): string {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value);
  } catch {
    return value.replace(/\/$/u, '');
  }

  if (parsedUrl.pathname !== '/' || parsedUrl.search || parsedUrl.hash) {
    return value;
  }

  return value.replace(/\/$/u, '');
}

export function normalizeClientUrl(url: string): string {
  const trimmedUrl = url.trim();
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(trimmedUrl);
  } catch {
    return trimmedUrl;
  }

  if (parsedUrl.hostname !== '0.0.0.0' && parsedUrl.hostname !== '[::]') {
    return trimmedUrl;
  }

  parsedUrl.hostname = '127.0.0.1';
  return parsedUrl.toString().replace(/\/$/, '');
}

export async function bootApp(input: BootAppInput): Promise<BootAppSession> {
  const parsed = parseStartCommand(input.startCommand);
  const runDir = input.runDir ?? join(input.root, '.hardening', 'run');
  const logsPath = join(runDir, 'app.log');

  await mkdir(runDir, { recursive: true });
  await writeFile(logsPath, '');

  const logStream = createWriteStream(logsPath, { flags: 'a' });
  const child = spawn(parsed.command, parsed.args, {
    cwd: input.root,
    env: {
      ...process.env,
      ...parsed.env
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    /* Own process group, so stop() can sweep the whole tree instead of only the
       direct child (package managers run the real dev server as a grandchild). */
    detached: process.platform !== 'win32'
  });

  return waitForBoot({ child, logStream, logsPath, timeoutMs: input.timeoutMs });
}

function waitForBoot(input: {
  child: BootChildProcess;
  logStream: WriteStream;
  logsPath: string;
  timeoutMs: number;
}): Promise<BootAppSession> {
  const chunks: string[] = [];
  const errors: string[] = [];
  let settled = false;
  let childExited = false;
  let childExitCode: number | null = null;
  let probing = false;

  return new Promise((resolve) => {
    const settle = (session: BootAppSession): void => {
      settled = true;
      clearTimeout(timeout);
      resolve(session);
    };

    const timeout = setTimeout(() => {
      if (settled) {
        return;
      }

      input.child.kill('SIGTERM');
      settle(
        buildSession({
          status: 'failed',
          url: null,
          logsPath: input.logsPath,
          daemon: false,
          blockers: [],
          errors: ['Timed out waiting for app URL'],
          child: input.child,
          logStream: input.logStream
        })
      );
    }, input.timeoutMs);

    const settleExitedUnreachable = (): void => {
      settle(
        buildSession({
          status: 'failed',
          url: null,
          logsPath: input.logsPath,
          daemon: false,
          blockers: [],
          errors: [`Process exited before becoming reachable: ${childExitCode ?? 'unknown'}`, ...errors],
          child: input.child,
          logStream: input.logStream
        })
      );
    };

    const probe = async (url: string): Promise<void> => {
      const reachable = await waitForReachable(url);

      if (settled) {
        return;
      }

      if (reachable) {
        if (!childExited) {
          /* Daemonizing dev servers exit moments after printing their URL; give
             that exit a short window so the daemon flag is recorded truthfully. */
          await waitForExit(input.child, 250);
        }

        if (settled) {
          return;
        }

        settle(
          buildSession({
            status: 'running',
            url,
            logsPath: input.logsPath,
            /* Parent already gone but the app answers: the dev server daemonized
               (e.g. astro dev). The listener outlives our process group, so stop()
               must clean it up by port. */
            daemon: childExited,
            blockers: [],
            errors: [],
            child: input.child,
            logStream: input.logStream
          })
        );
        return;
      }

      if (childExited) {
        settleExitedUnreachable();
        return;
      }

      probing = false;
    };

    const onData = (buffer: Buffer): void => {
      const text = buffer.toString('utf8');
      const safeText = redactSensitiveText(text);
      chunks.push(text);
      input.logStream.write(safeText);

      const url = extractUrlFromLog(chunks.join(''));

      if (!url || settled || probing) {
        return;
      }

      probing = true;
      void probe(url);
    };

    input.child.stdout.on('data', onData);
    input.child.stderr.on('data', (buffer: Buffer) => {
      const text = buffer.toString('utf8');
      errors.push(redactSensitiveText(text).trim());
      onData(buffer);
    });

    input.child.on('exit', (code) => {
      childExited = true;
      childExitCode = code;

      if (settled || probing) {
        /* A reachability probe is still running: a daemonizing dev server exits 0
           after its detached listener is up, so the probe outcome decides. */
        return;
      }

      settleExitedUnreachable();
    });
  });
}

async function waitForReachable(url: string): Promise<boolean> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.status >= 100) {
        return true;
      }
    } catch {
      // Not accepting connections yet.
    }

    await delay(100);
  }

  return false;
}

function buildSession(input: {
  status: BootStatus;
  url: string | null;
  logsPath: string;
  daemon: boolean;
  blockers: string[];
  errors: string[];
  child: BootChildProcess;
  logStream: WriteStream;
}): BootAppSession {
  const port = input.url ? Number(new URL(input.url).port) : null;

  return {
    status: input.status,
    url: input.url,
    port,
    logsPath: input.logsPath,
    daemon: input.daemon,
    blockers: input.blockers,
    errors: input.errors.filter(Boolean),
    stop: async () => {
      await stopProcess(input.child);

      /* Not gated on the daemon flag: any listener that survived the group kill
         (daemonized or double-forked) is ours to clean up. */
      if (input.url && port) {
        await stopLingeringListener({
          url: input.url,
          port,
          logStream: input.logStream
        });
      }

      await closeStream(input.logStream);
    }
  };
}

async function stopProcess(child: BootChildProcess): Promise<void> {
  killProcessTree(child, 'SIGTERM');

  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      if (child.exitCode === null && child.signalCode === null) {
        killProcessTree(child, 'SIGKILL');
      }
      resolve();
    }, 1000);

    child.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
  });
}

function killProcessTree(child: BootChildProcess, signal: NodeJS.Signals): void {
  if (typeof child.pid === 'number' && process.platform !== 'win32') {
    try {
      /* Negative pid targets the process group the detached spawn created, which
         also reaches grandchildren the direct kill below would miss. */
      process.kill(-child.pid, signal);
      return;
    } catch {
      // Group already gone or unavailable; fall back to the direct child.
    }
  }

  try {
    child.kill(signal);
  } catch {
    // Child already exited.
  }
}

async function waitForExit(child: BootChildProcess, timeoutMs: number): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  await new Promise<void>((resolve) => {
    const timeout = setTimeout(resolve, timeoutMs);
    child.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
  });
}

/* A daemonized dev server re-parents away from our process group, so the only
   handle left is the port we verified it was serving. Best effort: never throws,
   and records the outcome in app.log for the run evidence. */
async function stopLingeringListener(input: {
  url: string;
  port: number;
  logStream: WriteStream;
}): Promise<void> {
  if (!(await isUrlReachable(input.url))) {
    return;
  }

  if (process.platform === 'win32') {
    input.logStream.write(`[hardening] listener cleanup skipped on win32; port ${input.port} may still be listening\n`);
    return;
  }

  const pids = await findListenerPids(input.port);

  for (const pid of pids) {
    try {
      process.kill(pid, 'SIGTERM');
    } catch {
      // Listener already exited.
    }
  }

  await delay(500);

  if (await isUrlReachable(input.url)) {
    for (const pid of pids) {
      try {
        process.kill(pid, 'SIGKILL');
      } catch {
        // Listener already exited.
      }
    }
    await delay(200);
  }

  const stillListening = await isUrlReachable(input.url);
  input.logStream.write(
    stillListening
      ? `[hardening] daemon cleanup failed: port ${input.port} is still listening (pids tried: ${pids.join(', ') || 'none found'})\n`
      : `[hardening] daemon cleanup: stopped listener on port ${input.port} (pids: ${pids.join(', ') || 'already gone'})\n`
  );
}

async function isUrlReachable(url: string): Promise<boolean> {
  try {
    await fetch(url, { signal: AbortSignal.timeout(750) });
    return true;
  } catch {
    return false;
  }
}

async function findListenerPids(port: number): Promise<number[]> {
  try {
    const stdout = await new Promise<string>((resolve, reject) => {
      execFile('lsof', ['-ti', `tcp:${port}`], { timeout: 5000 }, (error, output) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(output);
      });
    });

    return stdout
      .split('\n')
      .map((line) => Number.parseInt(line.trim(), 10))
      .filter((pid) => Number.isInteger(pid) && pid > 1 && pid !== process.pid);
  } catch {
    /* lsof exits 1 when nothing listens, or may be missing entirely. */
    return [];
  }
}

async function closeStream(stream: WriteStream): Promise<void> {
  await new Promise<void>((resolve) => {
    stream.end(resolve);
  });
}

async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
