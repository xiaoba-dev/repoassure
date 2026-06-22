import { spawn, type ChildProcessByStdio } from 'node:child_process';
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
  const runDir = join(input.root, '.hardening', 'run');
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
    stdio: ['ignore', 'pipe', 'pipe']
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

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      if (settled) {
        return;
      }

      settled = true;
      input.child.kill('SIGTERM');
      resolve(
        buildSession({
          status: 'failed',
          url: null,
          logsPath: input.logsPath,
          blockers: [],
          errors: ['Timed out waiting for app URL'],
          child: input.child,
          logStream: input.logStream
        })
      );
    }, input.timeoutMs);

    const onData = (buffer: Buffer): void => {
      const text = buffer.toString('utf8');
      const safeText = redactSensitiveText(text);
      chunks.push(text);
      input.logStream.write(safeText);

      const url = extractUrlFromLog(chunks.join(''));

      if (!url || settled) {
        return;
      }

      void resolveWhenReachable({
        url,
        child: input.child,
        logStream: input.logStream,
        logsPath: input.logsPath,
        timeout,
        resolve,
        markSettled: () => {
          settled = true;
        },
        isSettled: () => settled
      });
    };

    input.child.stdout.on('data', onData);
    input.child.stderr.on('data', (buffer: Buffer) => {
      const text = buffer.toString('utf8');
      errors.push(redactSensitiveText(text).trim());
      onData(buffer);
    });

    input.child.on('exit', (code) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      resolve(
        buildSession({
          status: 'failed',
          url: null,
          logsPath: input.logsPath,
          blockers: [],
          errors: [`Process exited before becoming reachable: ${code ?? 'unknown'}`, ...errors],
          child: input.child,
          logStream: input.logStream
        })
      );
    });
  });
}

async function resolveWhenReachable(input: {
  url: string;
  child: BootChildProcess;
  logStream: WriteStream;
  logsPath: string;
  timeout: NodeJS.Timeout;
  resolve: (session: BootAppSession) => void;
  markSettled: () => void;
  isSettled: () => boolean;
}): Promise<void> {
  const reachable = await waitForReachable(input.url);

  if (!reachable || input.isSettled()) {
    return;
  }

  input.markSettled();
  clearTimeout(input.timeout);
  input.resolve(
    buildSession({
      status: 'running',
      url: input.url,
      logsPath: input.logsPath,
      blockers: [],
      errors: [],
      child: input.child,
      logStream: input.logStream
    })
  );
}

async function waitForReachable(url: string): Promise<boolean> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.status >= 100) {
        return true;
      }
    } catch {
      await delay(100);
    }
  }

  return false;
}

function buildSession(input: {
  status: BootStatus;
  url: string | null;
  logsPath: string;
  blockers: string[];
  errors: string[];
  child: BootChildProcess;
  logStream: WriteStream;
}): BootAppSession {
  return {
    status: input.status,
    url: input.url,
    port: input.url ? Number(new URL(input.url).port) : null,
    logsPath: input.logsPath,
    blockers: input.blockers,
    errors: input.errors.filter(Boolean),
    stop: async () => {
      await stopProcess(input.child);
      await closeStream(input.logStream);
    }
  };
}

async function stopProcess(child: BootChildProcess): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  child.kill('SIGTERM');

  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill('SIGKILL');
      }
      resolve();
    }, 1000);

    child.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
  });
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
