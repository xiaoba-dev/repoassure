import { spawn } from 'node:child_process';
import { mkdir, rm, rmdir, stat, symlink, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { redactSensitiveText } from './redaction.js';
import { buildPackageJsonManifestCheck, buildPyprojectTomlManifestCheck, buildRepoRootDirectoryCheck } from './repo-preflight.js';
import { shellQuoteArg } from './shell-quote.js';
import type { UserAcceptanceCheck } from './user-acceptance.js';
import type { UserAcceptanceCliOptions, UserAcceptanceMode } from './user-acceptance-args.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const defaultGeneratedTestTimeoutMs = 120_000;

interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface UserAcceptanceArtifactChecksInput {
  repoRoot: string;
  reportPath: string;
  findingsPath: string;
  manifestPath: string;
  repairPlanPath: string;
  repairPlanMarkdownPath: string;
  repairTaskPackagePath: string;
  repairTaskPackageMarkdownPath: string;
  patchDiffPath: string;
  generatedTestFiles: string[];
  artifactFiles: string[];
  browser: boolean;
  validateGeneratedTests: boolean;
  generatedTestTimeoutMs: number;
  baseUrl?: string;
}

export async function buildUserAcceptanceRepoPreflightChecks(
  repoRoot: string,
  options: { mode?: UserAcceptanceMode } = {}
): Promise<UserAcceptanceCheck[]> {
  const repoRootCheck = await buildRepoRootDirectoryCheck(repoRoot);
  const mode = options.mode ?? 'browser';
  const manifestCheckName = mode === 'cli' ? 'pyproject.toml 是有效文件' : 'package.json 是有效文件';

  if (repoRootCheck.status === 'failed') {
    return [
      repoRootCheck,
      {
        name: manifestCheckName,
        required: true,
        status: 'skipped',
        evidence: 'repo root check failed'
      }
    ];
  }

  return [
    repoRootCheck,
    mode === 'cli'
      ? await buildPyprojectTomlPreflightCheck(repoRoot)
      : await buildPackageJsonPreflightCheck(repoRoot)
  ];
}

export async function buildRepoRootPreflightCheck(repoRoot: string): Promise<UserAcceptanceCheck> {
  const checks = await buildUserAcceptanceRepoPreflightChecks(repoRoot);
  return checks.find((check) => check.status === 'failed') ?? checks[0]!;
}

export async function writeUserAcceptanceRecord(outputPath: string, markdown: string): Promise<void> {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, markdown);
}

export async function buildUserAcceptanceArtifactChecks(input: UserAcceptanceArtifactChecksInput): Promise<UserAcceptanceCheck[]> {
  const generatedTestsExist = input.generatedTestFiles.length > 0
    && (await Promise.all(input.generatedTestFiles.map((path) => fileExists(path)))).every(Boolean);
  const browserArtifactsExist = input.artifactFiles.length > 0
    && (await Promise.all(input.artifactFiles.map((path) => fileExists(path)))).every(Boolean);
  const generatedTestValidation = await buildGeneratedTestValidationCheck({
    repoRoot: input.repoRoot,
    generatedTestFiles: input.generatedTestFiles,
    enabled: input.validateGeneratedTests,
    timeoutMs: input.generatedTestTimeoutMs,
    ...(input.baseUrl ? { baseUrl: input.baseUrl } : {})
  });

  return [
    await fileCheck('hardening-report.md 已生成', true, input.reportPath),
    await fileCheck('findings.json 已生成', true, input.findingsPath),
    await fileCheck('run manifest 已生成', true, input.manifestPath),
    await fileCheck('repair-plan.json 已生成', true, input.repairPlanPath),
    await fileCheck('repair-plan.md 已生成', true, input.repairPlanMarkdownPath),
    await fileCheck('repair-task-package.json 已生成', true, input.repairTaskPackagePath),
    await fileCheck('repair-task-package.md 已生成', true, input.repairTaskPackageMarkdownPath),
    await fileCheck('patch.diff 已生成', true, input.patchDiffPath),
    {
      name: 'generated Playwright spec 已生成',
      required: true,
      status: generatedTestsExist ? 'passed' : 'failed',
      evidence: input.generatedTestFiles.length > 0 ? input.generatedTestFiles.join(', ') : 'no generated tests'
    },
    generatedTestValidation,
    {
      name: 'browser artifacts 已生成',
      required: input.browser,
      status: input.browser ? browserArtifactsExist ? 'passed' : 'failed' : 'skipped',
      evidence: input.artifactFiles.length > 0 ? input.artifactFiles.join(', ') : 'browser mode not requested or no artifacts'
    },
    {
      name: 'repo root 已记录',
      required: true,
      status: await fileExists(input.repoRoot) ? 'passed' : 'failed',
      evidence: input.repoRoot
    }
  ];
}

export async function buildGeneratedTestValidationCheck(input: {
  repoRoot: string;
  generatedTestFiles: string[];
  enabled: boolean;
  timeoutMs?: number;
  baseUrl?: string;
}): Promise<UserAcceptanceCheck> {
  if (!input.enabled) {
    return {
      name: 'generated Playwright spec 执行验证',
      required: false,
      status: 'skipped',
      evidence: 'not requested; pass --validate-generated-tests to execute generated specs against the target app'
    };
  }

  if (!input.baseUrl) {
    return {
      name: 'generated Playwright spec 执行验证',
      required: true,
      status: 'failed',
      evidence: '--validate-generated-tests requires a running target URL; pass --url or let user:accept auto-boot the app'
    };
  }

  if (input.generatedTestFiles.length === 0) {
    return {
      name: 'generated Playwright spec 执行验证',
      required: true,
      status: 'failed',
      evidence: 'no generated tests'
    };
  }

  const playwrightPath = join(root, 'node_modules', '.bin', 'playwright');
  const nodePath = join(root, 'node_modules');
  const relativeTestFiles = input.generatedTestFiles.map((file) => relative(input.repoRoot, file));
  const dependencyResolver = await ensureGeneratedTestPlaywrightDependency({
    repoRoot: input.repoRoot,
    relativeTestFiles
  });
  const command = formatGeneratedTestValidationCommand({
    baseUrl: input.baseUrl,
    nodePath,
    playwrightPath,
    repoRoot: input.repoRoot,
    relativeTestFiles
  });

  const result = await runCommand(playwrightPath, ['test', ...relativeTestFiles, '--reporter=line'], {
    cwd: input.repoRoot,
    env: {
      ...process.env,
      NODE_PATH: nodePath,
      HARDENING_BASE_URL: input.baseUrl
    },
    timeoutMs: input.timeoutMs ?? defaultGeneratedTestTimeoutMs
  }).finally(async () => {
    await dependencyResolver.cleanup();
  });

  return {
    name: 'generated Playwright spec 执行验证',
    required: true,
    status: result.exitCode === 0 ? 'passed' : 'failed',
    evidence: result.exitCode === 0
      ? formatGeneratedTestValidationEvidenceCommand(command)
      : formatGeneratedTestValidationFailureEvidence({ command, ...result })
  };
}

export async function ensureGeneratedTestPlaywrightDependency(input: {
  repoRoot: string;
  relativeTestFiles: string[];
}): Promise<{ cleanup: () => Promise<void> }> {
  const playwrightTestPackage = join(root, 'node_modules', '@playwright', 'test');
  const createdLinks: string[] = [];
  const cleanupDirs = new Set<string>();
  const testDirs = new Set(
    input.relativeTestFiles.map((file) => dirname(join(input.repoRoot, file)))
  );

  for (const testDir of testDirs) {
    const nodeModulesDir = join(testDir, 'node_modules');
    const scopeDir = join(nodeModulesDir, '@playwright');
    const packageLink = join(scopeDir, 'test');

    if (await fileExists(packageLink)) {
      continue;
    }

    await mkdir(scopeDir, { recursive: true });
    await symlink(playwrightTestPackage, packageLink, 'dir');
    createdLinks.push(packageLink);
    cleanupDirs.add(scopeDir);
    cleanupDirs.add(nodeModulesDir);
  }

  return {
    cleanup: async () => {
      for (const link of createdLinks) {
        await rm(link, { force: true });
      }

      for (const dir of [...cleanupDirs].sort((left, right) => right.length - left.length)) {
        await rmdir(dir).catch(() => {});
      }
    }
  };
}

export function formatGeneratedTestValidationFailureEvidence(input: {
  command: string;
  exitCode: number;
  stdout: string;
  stderr: string;
}): string {
  const output = input.stderr || input.stdout || `exitCode=${input.exitCode}`;

  return `${formatGeneratedTestValidationEvidenceCommand(input.command)}; ${truncateText(redactSensitiveText(output))}`;
}

export function formatGeneratedTestValidationEvidenceCommand(command: string): string {
  return redactSensitiveText(command);
}

export function formatGeneratedTestValidationCommand(input: {
  baseUrl: string;
  nodePath: string;
  playwrightPath: string;
  repoRoot: string;
  relativeTestFiles: string[];
}): string {
  return [
    'cd',
    shellQuoteArg(input.repoRoot),
    '&&',
    `HARDENING_BASE_URL=${shellQuoteArg(input.baseUrl)}`,
    `NODE_PATH=${shellQuoteArg(input.nodePath)}`,
    shellQuoteArg(input.playwrightPath),
    'test',
    ...input.relativeTestFiles.map((file) => shellQuoteArg(file)),
    '--reporter=line'
  ].join(' ');
}

export function shouldManageGeneratedTestBootSession(options: Pick<UserAcceptanceCliOptions, 'url' | 'validateGeneratedTests'>): boolean {
  return options.validateGeneratedTests && !options.url;
}

export function selectGeneratedTestValidationBaseUrl(optionsUrl: string | undefined, bootUrl: string | undefined): string | undefined {
  const baseUrl = optionsUrl ?? bootUrl;

  return baseUrl ? normalizeClientUrl(baseUrl) : undefined;
}

function normalizeClientUrl(url: string): string {
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
  return parsedUrl.toString().replace(/\/$/u, '');
}

async function buildPackageJsonPreflightCheck(repoRoot: string): Promise<UserAcceptanceCheck> {
  return buildPackageJsonManifestCheck(repoRoot, { formatEvidence: truncateText });
}

async function buildPyprojectTomlPreflightCheck(repoRoot: string): Promise<UserAcceptanceCheck> {
  return buildPyprojectTomlManifestCheck(repoRoot, { formatEvidence: truncateText });
}

async function fileCheck(name: string, required: boolean, path: string): Promise<UserAcceptanceCheck> {
  return {
    name,
    required,
    status: await fileExists(path) ? 'passed' : 'failed',
    evidence: path
  };
}

function runCommand(command: string, args: string[], options: {
  cwd: string;
  env: NodeJS.ProcessEnv;
  timeoutMs: number;
}): Promise<CommandResult> {
  return new Promise((resolveCommand) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
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
      resolveCommand({
        exitCode: 124,
        stdout,
        stderr: stderr || `Timed out after ${options.timeoutMs}ms`
      });
    }, options.timeoutMs);

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
      resolveCommand({
        exitCode: 1,
        stdout,
        stderr: error.message
      });
    });
    child.on('exit', (code) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      resolveCommand({
        exitCode: code ?? 1,
        stdout,
        stderr
      });
    });
  });
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function truncateText(value: string): string {
  return value.replaceAll('\n', ' ').slice(0, 500);
}
