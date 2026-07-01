#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import { collectHygieneIssues } from './check-repo-hygiene.mjs';

const execFileAsync = promisify(execFile);

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
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

async function readPackageJson(cwd) {
  const packagePath = join(cwd, 'package.json');
  return JSON.parse(await readFile(packagePath, 'utf8'));
}

function buildCheck(id, status, summary, details = []) {
  return { id, status, summary, details };
}

async function readOptionalText(path) {
  return readFile(path, 'utf8').catch(() => '');
}

function containsAll(text, markers) {
  return markers.every((marker) => text.includes(marker));
}

export async function runPublicReleaseReadinessCheck(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const trackedPaths = options.inputPath
    ? await readTrackedPathsFromFile(options.inputPath)
    : await readTrackedPathsFromGit(cwd);
  const packageJson = await readPackageJson(cwd);
  const hygieneIssues = collectHygieneIssues(trackedPaths);
  const licenseText = await readOptionalText(join(cwd, 'LICENSE'));
  const contributingText = await readOptionalText(join(cwd, 'CONTRIBUTING.md'));
  const securityText = await readOptionalText(join(cwd, 'SECURITY.md'));
  const dependencyAuditText = await readOptionalText(
    join(cwd, 'docs', 'product', 'strategy', 'dependency-license-audit-v0.1.md')
  );
  const releaseNotesText = await readOptionalText(
    join(cwd, 'docs', 'product', 'strategy', 'public-release-notes-v0.1.md')
  );
  const manualAuthorizationExists = await pathExists(
    join(cwd, 'docs', 'product', 'strategy', 'public-release-authorization-v0.1.md')
  );
  const checklistExists = await pathExists(join(cwd, 'docs', 'product', 'strategy', 'public-release-checklist-v0.1.md'));
  const gitignoreText = await readFile(join(cwd, '.gitignore'), 'utf8').catch(() => '');
  const hasApacheLicense = containsAll(licenseText, ['Apache License', 'Version 2.0']);
  const hasContributionPolicy = containsAll(contributingText, [
    'Developer Certificate of Origin',
    'No CLA is required'
  ]);
  const hasSecurityPolicy = containsAll(securityText, ['Report a Vulnerability', 'private']);
  const hasDependencyAudit = containsAll(dependencyAuditText, [
    'No known incompatible dependency licenses',
    'Apache-2.0'
  ]);
  const hasReleaseNotesDraft = containsAll(releaseNotesText, [
    'Public Release Notes v0.1',
    'local-first'
  ]);
  const checks = [
    buildCheck(
      'private-package-boundary',
      packageJson.private === true && packageJson.license === 'Apache-2.0' ? 'passed' : 'not_ready',
      packageJson.private === true
        ? 'package.json keeps npm publication disabled while declaring Apache-2.0 source license metadata'
        : 'package.json private boundary is not enabled'
    ),
    buildCheck(
      'repository-license',
      hasApacheLicense ? 'passed' : 'not_ready',
      hasApacheLicense
        ? 'repository-level Apache-2.0 LICENSE exists'
        : 'repository-level Apache-2.0 LICENSE is missing or incomplete'
    ),
    buildCheck(
      'contribution-policy',
      hasContributionPolicy ? 'passed' : 'not_ready',
      hasContributionPolicy
        ? 'CONTRIBUTING.md records DCO and no-CLA policy'
        : 'CONTRIBUTING.md must record contribution policy, DCO, and CLA decision'
    ),
    buildCheck(
      'security-policy',
      hasSecurityPolicy ? 'passed' : 'not_ready',
      hasSecurityPolicy
        ? 'SECURITY.md records private vulnerability disclosure flow'
        : 'SECURITY.md must define private vulnerability disclosure flow'
    ),
    buildCheck(
      'dependency-license-audit',
      hasDependencyAudit ? 'passed' : 'not_ready',
      hasDependencyAudit
        ? 'dependency license audit is documented'
        : 'dependency license audit document is missing or incomplete'
    ),
    buildCheck(
      'public-release-notes-draft',
      hasReleaseNotesDraft ? 'passed' : 'not_ready',
      hasReleaseNotesDraft
        ? 'public release notes draft is documented'
        : 'public release notes draft is missing'
    ),
    buildCheck(
      'tracked-file-hygiene',
      hygieneIssues.length === 0 ? 'passed' : 'failed',
      hygieneIssues.length === 0
        ? 'tracked files do not include generated artifacts, env files, private keys, or logs'
        : `${hygieneIssues.length} tracked file hygiene issue(s) found`,
      hygieneIssues.map((issue) => `${issue.path}: ${issue.reason}`)
    ),
    buildCheck(
      'generated-artifact-ignore-rules',
      gitignoreText.includes('artifacts/') || gitignoreText.includes('artifacts/benchmark-runs/')
        ? 'passed'
        : 'failed',
      '.gitignore excludes generated artifact directories'
    ),
    buildCheck(
      'public-release-checklist',
      checklistExists ? 'passed' : 'failed',
      checklistExists
        ? 'public release checklist is documented'
        : 'public release checklist is missing'
    ),
    buildCheck(
      'manual-publication-authorization',
      manualAuthorizationExists ? 'passed' : 'not_ready',
      manualAuthorizationExists
        ? 'manual publication authorization record exists'
        : 'branch protection or equivalent repository ruleset remains required before making anything public'
    )
  ];
  const failed = checks.filter((check) => check.status === 'failed');
  const notReady = checks.filter((check) => check.status === 'not_ready');
  const ok = failed.length === 0;
  const releaseReady = ok && notReady.length === 0;

  return {
    ok,
    releaseReady,
    checks,
    cwd: relative(process.cwd(), cwd) || '.',
    summary: ok
      ? 'Public release readiness check passed for automated public release prerequisites.'
      : `${failed.length} public release readiness failure(s) found.`
  };
}

function parseArgs(argv) {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--cwd') {
      const cwd = argv[index + 1];
      if (!cwd) {
        throw new Error('--cwd requires a path');
      }
      options.cwd = cwd;
      index += 1;
    } else if (arg === '--input') {
      const inputPath = argv[index + 1];
      if (!inputPath) {
        throw new Error('--input requires a path');
      }
      options.inputPath = inputPath;
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
  console.log(`Usage: node scripts/check-public-release-readiness.mjs [--cwd <repo>] [--input <tracked-files.txt>]

Checks public-release prerequisites without publishing the repository.
Automated readiness prerequisites can pass while public release ready remains "no" until the blocking manual release gate is closed.`);
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      printHelp();
      return;
    }

    const result = await runPublicReleaseReadinessCheck(options);
    console.log(result.summary);
    console.log(`public release ready: ${result.releaseReady ? 'yes' : 'no'}`);
    for (const check of result.checks) {
      console.log(`- ${check.id}: ${check.status} - ${check.summary}`);
      for (const detail of check.details) {
        console.log(`  - ${detail}`);
      }
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
