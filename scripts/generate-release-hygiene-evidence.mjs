#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import { runPublicReleaseReadinessCheck } from './check-public-release-readiness.mjs';
import { runRepoHygieneCheck } from './check-repo-hygiene.mjs';

const execFileAsync = promisify(execFile);

const schemaVersion = 'repoassure.release-readiness-hygiene.v1';

export async function generateReleaseHygieneEvidence(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const outputDir = options.outputDir ?? join(cwd, 'artifacts', 'release-readiness-hygiene');
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const trackedPaths = options.inputPath
    ? await readTrackedPathsFromFile(options.inputPath)
    : await readTrackedPathsFromGit(cwd);
  const [repoHygiene, releaseReadiness, packageJson] = await Promise.all([
    runRepoHygieneCheck({ cwd, inputPath: options.inputPath }),
    runPublicReleaseReadinessCheck({ cwd, inputPath: options.inputPath }),
    readPackageJson(cwd)
  ]);
  const sensitiveScan = await runSensitiveMaterialScan({ cwd, trackedPaths });
  const checks = [
    {
      id: 'repo-hygiene',
      status: repoHygiene.ok ? 'passed' : 'failed',
      summary: repoHygiene.summary,
      evidence: ['pnpm repo:hygiene'],
      details: repoHygiene.issues.map((issue) => `${issue.path}: ${issue.reason}`)
    },
    {
      id: 'release-readiness',
      status: releaseReadiness.ok ? 'passed' : 'failed',
      summary: releaseReadiness.releaseReady
        ? 'Automated release readiness prerequisites are satisfied as evidence only.'
        : 'Automated release readiness evidence has remaining not-ready items.',
      evidence: ['pnpm release:check'],
      details: releaseReadiness.checks.map((check) => `${check.id}: ${check.status} - ${check.summary}`)
    },
    {
      id: 'package-publication-boundary',
      status: packageJson.private === true ? 'passed' : 'failed',
      summary: packageJson.private === true
        ? 'package.json keeps `private: true`; npm publication remains disabled.'
        : 'package.json does not keep `private: true`.',
      evidence: ['package.json'],
      details: []
    },
    {
      id: 'sensitive-material-scan',
      status: sensitiveScan.ok ? 'passed' : 'failed',
      summary: sensitiveScan.summary,
      evidence: ['tracked release hygiene material scan'],
      details: sensitiveScan.findings.map((finding) => `${finding.path}: ${finding.kind} - ${finding.sample}`)
    },
    {
      id: 'launch-boundary',
      status: 'passed',
      summary: 'Launch authorization remains `not_authorized`; hygiene evidence is not launch permission.',
      evidence: ['nonAuthorizationBoundary'],
      details: [
        'No npm publication was executed.',
        'No GitHub release was executed.',
        'No public launch or production marketing announcement was executed.',
        'No customer contact, pricing change, spend, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was executed.'
      ]
    },
    {
      id: 'goal-audit-command',
      status: 'manual_review',
      summary: '`pnpm goal:audit` remains the maintainer-reviewable goal evidence refresh command.',
      evidence: ['pnpm goal:audit'],
      details: ['This runtime records the command; it does not treat goal audit output as launch authorization.']
    }
  ];
  const failed = checks.filter((check) => check.status === 'failed');
  const evidence = {
    schemaVersion,
    generatedAt: redactText(generatedAt),
    status: failed.length > 0
      ? 'failed'
      : releaseReadiness.releaseReady
        ? 'ready_evidence_only'
        : 'not_ready_evidence_only',
    localOnly: true,
    launchAuthorization: 'not_authorized',
    cwd: relative(process.cwd(), cwd) || '.',
    checks,
    rerunCommands: [
      'pnpm release:check',
      'pnpm repo:hygiene',
      'pnpm goal:audit',
      'pnpm release:hygiene'
    ],
    consumptionGuidance: {
      forMaintainer: 'Review failed checks and manual_review checks before deciding the next release-readiness step.',
      forAiIde: 'Use checks and details to update docs or scripts; do not publish, launch, contact customers, or claim commercial availability.',
      doNotDo: [
        'Do not upload target repo material, private artifacts, reviewer feedback, customer data, or raw private repo content.',
        'Do not treat this evidence package as npm publication, GitHub release, public launch, or production marketing authorization.',
        'Do not store secrets, cookies, access tokens, reviewer credentials, raw private source, or customer data in this package.'
      ]
    },
    redactionBoundary: 'Sensitive findings are redacted before they are written; raw emails, secrets, cookies, access tokens, customer data, and private repo content must not be stored.',
    nonAuthorizationBoundary: 'This evidence package does not authorize npm publication, GitHub release, public launch, production marketing announcement, customer contact, pricing change or spend, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.'
  };
  const packagePath = join(outputDir, 'release-readiness-hygiene.json');
  const markdownPath = join(outputDir, 'release-readiness-hygiene.md');

  await mkdir(outputDir, { recursive: true });
  await writeFile(packagePath, `${JSON.stringify(evidence, null, 2)}\n`);
  await writeFile(markdownPath, renderMarkdown(evidence));

  return { packagePath, markdownPath, evidence };
}

async function runSensitiveMaterialScan({ cwd, trackedPaths }) {
  const findings = [];
  const scannedPaths = trackedPaths.filter(shouldScanPath);

  for (const trackedPath of scannedPaths) {
    const text = await readFile(join(cwd, trackedPath), 'utf8').catch(() => '');
    if (!text) {
      continue;
    }
    findings.push(...findSensitiveText(trackedPath, text));
  }

  return {
    ok: findings.length === 0,
    summary: findings.length === 0
      ? 'No sensitive release hygiene material was found in scanned tracked files.'
      : `${findings.length} sensitive release hygiene finding(s) found.`,
    findings
  };
}

function shouldScanPath(path) {
  const normalized = path.replaceAll('\\', '/');
  if (
    normalized.startsWith('node_modules/') ||
    normalized.startsWith('dist/') ||
    normalized.startsWith('packages/') ||
    normalized.startsWith('tests/') ||
    normalized.startsWith('fixtures/') ||
    normalized.startsWith('apps/website/dist/')
  ) {
    return false;
  }

  return (
    normalized === 'README.md' ||
    normalized === 'package.json' ||
    normalized === '.gitignore' ||
    normalized === 'LICENSE' ||
    normalized === 'CONTRIBUTING.md' ||
    normalized === 'SECURITY.md' ||
    normalized.startsWith('docs/product/strategy/') ||
    normalized.startsWith('docs/acceptance/checklists/') ||
    normalized.startsWith('docs/testing/strategy/') ||
    normalized.startsWith('scripts/')
  );
}

function findSensitiveText(path, text) {
  const findings = [];
  const lines = text.split(/\r?\n/u);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const sample = redactText(line);
    if (hasNonExampleEmail(line)) {
      findings.push({ path, kind: 'raw-email', line: index + 1, sample });
    }
    if (hasSecretLikeValue(line)) {
      findings.push({ path, kind: 'secret-like-value', line: index + 1, sample });
    }
  }

  return findings;
}

function hasNonExampleEmail(value) {
  const emails = value.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu) ?? [];
  return emails.some((email) => !/@example\.(?:com|org|net)$/iu.test(email));
}

function hasSecretLikeValue(value) {
  if (/\[REDACTED_(?:SECRET|EMAIL|VALUE)\]/u.test(value)) {
    return false;
  }

  return /\b(?:API[_-]?KEY|OPENAI_API_KEY|TOKEN|SECRET|PASSWORD)\s*=\s*[^\s]+/iu.test(value) ||
    /^\s*(?:Cookie|Set-Cookie|Authorization)\s*:\s*[^\r\n]+/iu.test(value) ||
    /\b(?:sk|pk|ghp|gho|ghu|github_pat)_[A-Za-z0-9_-]{8,}/u.test(value);
}

function redactText(value) {
  return value
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu, '[REDACTED_EMAIL]')
    .replace(/\b((?:API[_-]?KEY|OPENAI_API_KEY|TOKEN|SECRET|PASSWORD)\s*=\s*)[^\s]+/giu, '$1[REDACTED_SECRET]')
    .replace(/\b((?:Cookie|Set-Cookie|Authorization)\s*:\s*)[^\r\n]+/giu, '$1[REDACTED_SECRET]')
    .replace(/\b(?:sk|pk|ghp|gho|ghu|github_pat)_[A-Za-z0-9_-]{8,}/gu, '[REDACTED_SECRET]')
    .trim();
}

function renderMarkdown(evidence) {
  const rows = evidence.checks
    .map((check) => `| ${check.id} | ${check.status} | ${escapeCell(check.summary)} |`)
    .join('\n');

  return `# Release Readiness Hygiene Evidence

Generated: ${evidence.generatedAt}

Schema: \`${evidence.schemaVersion}\`

Status: \`${evidence.status}\`

Launch authorization: \`${evidence.launchAuthorization}\`

## Checks

| Check | Status | Summary |
| --- | --- | --- |
${rows}

## Rerun Commands

${evidence.rerunCommands.map((command) => `- \`${command}\``).join('\n')}

## Boundary

${evidence.nonAuthorizationBoundary}
`;
}

function escapeCell(value) {
  return String(value).replaceAll('|', '\\|').replace(/\s+/gu, ' ').trim();
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
  return JSON.parse(await readFile(join(cwd, 'package.json'), 'utf8'));
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
    } else if (arg === '--output') {
      const outputDir = argv[index + 1];
      if (!outputDir) {
        throw new Error('--output requires a path');
      }
      options.outputDir = outputDir;
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
  console.log(`Usage: node scripts/generate-release-hygiene-evidence.mjs [--cwd <repo>] [--input <tracked-files.txt>] [--output <dir>]

Generates local release readiness hygiene evidence without publishing, launching, uploading artifacts, or contacting customers.`);
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      printHelp();
      return;
    }

    const result = await generateReleaseHygieneEvidence(options);
    console.log('Release readiness hygiene evidence generated.');
    console.log(`JSON: ${result.packagePath}`);
    console.log(`Markdown: ${result.markdownPath}`);
    console.log(`status: ${result.evidence.status}`);
    if (result.evidence.status === 'failed') {
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
