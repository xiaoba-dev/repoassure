import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { delimiter, join } from 'node:path';

import { redactSensitiveText } from './redaction.js';
import type { PythonCliProfile } from './python-cli-profile.js';
import type { UserAcceptanceCheck } from './user-acceptance.js';

export type PythonCliCheckKind = 'cli-smoke' | 'static' | 'test';

export interface PythonCliCheckCommand {
  kind: PythonCliCheckKind;
  command: string;
  args: string[];
  required: boolean;
  reason: string;
}

export interface PythonCliCheckCommandResult {
  command: string;
  args: string[];
  exitCode: number;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

export interface RunPythonCliCheckCommandsInput {
  commands: PythonCliCheckCommand[];
  cwd: string;
  timeoutMs: number;
  maxOutputChars: number;
}

export function buildPythonCliSmokeCommands(profile: PythonCliProfile): PythonCliCheckCommand[] {
  return Object.keys(profile.consoleScripts).map((command): PythonCliCheckCommand => ({
    kind: 'cli-smoke',
    command,
    args: ['--help'],
    required: true,
    reason: 'console script help smoke'
  }));
}

export function isSafeCliSmokeCommand(input: { command: string; args: string[] }): boolean {
  return input.command.trim().length > 0
    && input.args.length === 1
    && ['--help', '-h', '--version', '-V'].includes(input.args[0]!);
}

export function detectPythonCliStaticCheckCommands(profile: PythonCliProfile): PythonCliCheckCommand[] {
  const devDependencies = new Set(Object.values(profile.optionalDependencies).flat().map(packageBaseName));
  const commands: PythonCliCheckCommand[] = [];

  if (devDependencies.has('pytest')) {
    commands.push({ kind: 'test', command: 'pytest', args: [], required: false, reason: 'configured dev dependency' });
  }

  if (devDependencies.has('ruff')) {
    commands.push({ kind: 'static', command: 'ruff', args: ['check', '.'], required: false, reason: 'configured dev dependency' });
  }

  if (devDependencies.has('mypy')) {
    commands.push({ kind: 'static', command: 'mypy', args: ['.'], required: false, reason: 'configured dev dependency' });
  }

  return commands;
}

export function runPythonCliCheckCommand(input: {
  command: string;
  args: string[];
  cwd: string;
  timeoutMs: number;
  maxOutputChars: number;
  env?: NodeJS.ProcessEnv;
}): Promise<PythonCliCheckCommandResult> {
  return new Promise((resolveCommand) => {
    const child = spawn(input.command, input.args, {
      cwd: input.cwd,
      env: input.env,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) {
        return;
      }

      settled = true;
      child.kill('SIGTERM');
      resolveCommand(formatCommandResult({
        command: input.command,
        args: input.args,
        exitCode: 124,
        stdout,
        stderr: stderr || `Timed out after ${input.timeoutMs}ms`,
        timedOut: true,
        maxOutputChars: input.maxOutputChars
      }));
    }, input.timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString('utf8');
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString('utf8');
    });
    child.on('error', (error) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      resolveCommand(formatCommandResult({
        command: input.command,
        args: input.args,
        exitCode: 1,
        stdout,
        stderr: error.message,
        timedOut: false,
        maxOutputChars: input.maxOutputChars
      }));
    });
    child.on('exit', (code) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      resolveCommand(formatCommandResult({
        command: input.command,
        args: input.args,
        exitCode: code ?? 1,
        stdout,
        stderr,
        timedOut: false,
        maxOutputChars: input.maxOutputChars
      }));
    });
  });
}

export async function runPythonCliCheckCommands(input: RunPythonCliCheckCommandsInput): Promise<PythonCliCheckCommandResult[]> {
  const homeDir = join(input.cwd, '.hardening', 'python-cli-home');
  await mkdir(homeDir, { recursive: true });
  const env = buildPythonCliCheckEnvironment(input.cwd);
  const results: PythonCliCheckCommandResult[] = [];

  for (const command of input.commands) {
    results.push(await runPythonCliCheckCommand({
      command: command.command,
      args: command.args,
      cwd: input.cwd,
      timeoutMs: input.timeoutMs,
      maxOutputChars: input.maxOutputChars,
      env
    }));
  }

  return results;
}

export function buildPythonCliExecutionAcceptanceChecks(
  commands: PythonCliCheckCommand[],
  results: PythonCliCheckCommandResult[]
): UserAcceptanceCheck[] {
  return commands.map((command, index): UserAcceptanceCheck => {
    const result = results[index];
    const status = result && result.exitCode === 0 && !result.timedOut ? 'passed' : 'failed';

    return {
      name: `Python CLI check 执行: ${formatCommandValue(command.command, command.args)}`,
      required: command.required,
      status,
      evidence: result ? formatExecutionEvidence(result) : 'not executed'
    };
  });
}

function packageBaseName(packageSpecifier: string): string {
  return packageSpecifier.split(/[<>=!~\s[]/u)[0] ?? packageSpecifier;
}

function formatCommandResult(input: PythonCliCheckCommandResult & { maxOutputChars: number }): PythonCliCheckCommandResult {
  return {
    command: input.command,
    args: input.args,
    exitCode: input.exitCode,
    stdout: truncateText(redactSensitiveText(input.stdout), input.maxOutputChars),
    stderr: truncateText(redactSensitiveText(input.stderr), input.maxOutputChars),
    timedOut: input.timedOut
  };
}

function truncateText(value: string, maxOutputChars: number): string {
  return value.length > maxOutputChars ? `${value.slice(0, maxOutputChars)}...` : value;
}

function buildPythonCliCheckEnvironment(cwd: string): NodeJS.ProcessEnv {
  const venvBin = join(cwd, '.venv', 'bin');
  const path = process.env.PATH ? `${venvBin}${delimiter}${process.env.PATH}` : venvBin;

  return {
    ...process.env,
    HOME: join(cwd, '.hardening', 'python-cli-home'),
    PATH: path,
    AGENT_REACH_CONFIG: '',
    ANTHROPIC_API_KEY: '',
    API_KEY: '',
    GROQ_API_KEY: '',
    GITHUB_TOKEN: '',
    OPENAI_API_KEY: '',
    TOKEN: ''
  };
}

function formatExecutionEvidence(result: PythonCliCheckCommandResult): string {
  const output = result.stdout || result.stderr;
  const timeout = result.timedOut ? ' timedOut=true' : '';

  return output
    ? `exit=${result.exitCode}${timeout} ${result.stdout ? 'stdout' : 'stderr'}=${formatSingleLine(output)}`
    : `exit=${result.exitCode}${timeout}`;
}

function formatSingleLine(value: string): string {
  return value.replace(/\s+/gu, ' ').trim();
}

function formatCommandValue(command: string, args: string[]): string {
  return `${command} ${args.join(' ')}`.trim();
}
