#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const forbiddenRules = [
  {
    reason: 'generated local hardening run output must not be committed',
    matches: (path) => path === '.hardening' || path.startsWith('.hardening/')
  },
  {
    reason: 'generated acceptance artifact must not be committed',
    matches: (path) => path === 'artifacts/acceptance' || path.startsWith('artifacts/acceptance/')
  },
  {
    reason: 'generated benchmark artifact must not be committed',
    matches: (path) =>
      path === 'artifacts/benchmark-runs' ||
      path.startsWith('artifacts/benchmark-runs/') ||
      path === 'benchmark-runs' ||
      path.startsWith('benchmark-runs/')
  },
  {
    reason: 'generated orphaned run artifact must not be committed',
    matches: (path) => path === 'artifacts/orphaned-runs' || path.startsWith('artifacts/orphaned-runs/')
  },
  {
    reason: 'generated test result artifact must not be committed',
    matches: (path) =>
      path === 'artifacts/test-results' ||
      path.startsWith('artifacts/test-results/') ||
      path === 'test-results' ||
      path.startsWith('test-results/')
  },
  {
    reason: 'build output must not be committed',
    matches: (path) =>
      path === 'dist' ||
      path.startsWith('dist/') ||
      path === 'coverage' ||
      path.startsWith('coverage/') ||
      /^packages\/[^/]+\/dist(?:\/|$)/u.test(path)
  },
  {
    reason: 'local log file must not be committed',
    matches: (path) => path.endsWith('.log')
  },
  {
    reason: 'environment files must not be committed; use .env.example for documented keys',
    matches: (path) => path === '.env' || (path.startsWith('.env.') && path !== '.env.example')
  },
  {
    reason: 'private key, certificate, or provisioning file must not be committed',
    matches: (path) => /\.(?:pem|key|p12|mobileprovision)$/u.test(path)
  }
];

function normalizeTrackedPath(path) {
  return path.replaceAll('\\', '/').replace(/^\.\//u, '');
}

export function collectHygieneIssues(paths) {
  const issues = [];

  for (const rawPath of paths) {
    const path = normalizeTrackedPath(rawPath.trim());
    if (path.length === 0) {
      continue;
    }

    const rule = forbiddenRules.find((candidate) => candidate.matches(path));
    if (rule) {
      issues.push({ path, reason: rule.reason });
    }
  }

  return issues;
}

async function readTrackedPathsFromGit(cwd) {
  const { stdout } = await execFileAsync('git', ['ls-files', '-z'], {
    cwd,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024
  });

  return stdout.split('\0').filter(Boolean);
}

async function readTrackedPathsFromFile(inputPath) {
  const contents = await readFile(inputPath, 'utf8');
  return contents.split(/\r?\n/u).filter(Boolean);
}

export async function runRepoHygieneCheck(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const trackedPaths = options.inputPath
    ? await readTrackedPathsFromFile(options.inputPath)
    : await readTrackedPathsFromGit(cwd);
  const issues = collectHygieneIssues(trackedPaths);
  const summary = issues.length === 0
    ? 'Repository hygiene check passed.'
    : `${issues.length} repository hygiene issue(s) found.`;

  return {
    ok: issues.length === 0,
    issues,
    summary,
    cwd: relative(process.cwd(), cwd) || '.'
  };
}

function parseArgs(argv) {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--input') {
      const inputPath = argv[index + 1];
      if (!inputPath) {
        throw new Error('--input requires a path');
      }
      options.inputPath = inputPath;
      index += 1;
    } else if (arg === '--cwd') {
      const cwd = argv[index + 1];
      if (!cwd) {
        throw new Error('--cwd requires a path');
      }
      options.cwd = cwd;
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/check-repo-hygiene.mjs [--cwd <repo>] [--input <tracked-files.txt>]

Checks tracked files for generated artifacts, build outputs, env files, private keys, and local logs.
By default it reads tracked files from git ls-files.`);
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      printHelp();
      return;
    }

    const result = await runRepoHygieneCheck(options);
    console.log(result.summary);
    for (const issue of result.issues) {
      console.log(`- ${issue.path}: ${issue.reason}`);
    }
    if (!result.ok) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
