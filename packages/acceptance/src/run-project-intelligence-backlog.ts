import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatAcceptanceFatalError } from './fatal-error.js';
import { redactSensitiveText } from './redaction.js';
import type { ProjectIntelligenceFinding, ProjectIntelligenceSnapshot } from './run-project-intelligence-snapshot.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const defaultSnapshotPath = 'artifacts/project-graph/project-intelligence-snapshot.json';
const defaultOutputDir = 'artifacts/project-graph';
const backlogFileName = 'adr-cascade-remediation-backlog.md';

export interface ProjectIntelligenceBacklogCliOptions {
  snapshotPath?: string;
  outputDir?: string;
}

export interface ProjectIntelligenceBacklogRunInput extends ProjectIntelligenceBacklogCliOptions {
  generatedAt?: string;
}

export interface ProjectIntelligenceBacklogRunResult {
  backlogPath: string;
  itemCount: number;
  missingCascadeCount: number;
}

interface ProjectIntelligenceBacklogMarkdownInput {
  generatedAt: string;
  snapshotPath: string;
}

export async function main(args: string[] = process.argv.slice(2)): Promise<number> {
  if (isProjectIntelligenceBacklogHelpRequest(args)) {
    process.stdout.write(projectIntelligenceBacklogHelpText());
    return 0;
  }

  try {
    const result = await runProjectIntelligenceBacklog(parseProjectIntelligenceBacklogArgs(args));
    process.stdout.write(formatProjectIntelligenceBacklogCliSummary(result));
    return 0;
  } catch (error: unknown) {
    process.stderr.write(`${formatAcceptanceFatalError('Project intelligence backlog failed', error)}\n`);
    return 1;
  }
}

export function parseProjectIntelligenceBacklogArgs(args: string[]): ProjectIntelligenceBacklogCliOptions {
  let snapshotPath: string | undefined;
  let outputDir: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg || arg === '--') {
      continue;
    }

    if (arg === '--snapshot' || arg.startsWith('--snapshot=')) {
      const value = readOptionValue(args, index, '--snapshot');
      snapshotPath = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--output' || arg.startsWith('--output=')) {
      const value = readOptionValue(args, index, '--output');
      outputDir = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    throw new Error(`Unknown project intelligence backlog option: ${arg}`);
  }

  return {
    ...(snapshotPath ? { snapshotPath } : {}),
    ...(outputDir ? { outputDir } : {})
  };
}

export function isProjectIntelligenceBacklogHelpRequest(args: string[]): boolean {
  return args.some((arg) => arg === '--help' || arg === '-h');
}

export function projectIntelligenceBacklogHelpText(): string {
  return `hardening project intelligence backlog

Usage:
  pnpm project:intelligence:backlog -- --snapshot <project-intelligence-snapshot.json> --output <artifacts/project-graph>
  pnpm project:intelligence:backlog -- --help

Options:
  --snapshot <path>  Project intelligence snapshot JSON. Defaults to artifacts/project-graph/project-intelligence-snapshot.json.
  --output <dir>     Output directory. Defaults to artifacts/project-graph.
  --help, -h         Show this help.

`;
}

export async function runProjectIntelligenceBacklog(
  input: ProjectIntelligenceBacklogRunInput = {}
): Promise<ProjectIntelligenceBacklogRunResult> {
  const snapshotPath = input.snapshotPath ? resolve(root, input.snapshotPath) : resolve(root, defaultSnapshotPath);
  const outputDir = input.outputDir ? resolve(root, input.outputDir) : resolve(root, defaultOutputDir);
  const snapshot = await readProjectIntelligenceSnapshot(snapshotPath);
  const backlogPath = join(outputDir, backlogFileName);

  await mkdir(outputDir, { recursive: true });
  await writeFile(backlogPath, formatProjectIntelligenceBacklogMarkdown(snapshot, {
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    snapshotPath
  }));

  const missingCascadeCount = missingCascadeFindings(snapshot).length;
  return {
    backlogPath,
    itemCount: missingCascadeCount,
    missingCascadeCount
  };
}

export function formatProjectIntelligenceBacklogMarkdown(
  snapshot: ProjectIntelligenceSnapshot,
  input: ProjectIntelligenceBacklogMarkdownInput
): string {
  const items = missingCascadeFindings(snapshot);

  return [
    '# Project Intelligence ADR Cascade Remediation Backlog',
    '',
    'Status: maintainer_review_required',
    `Generated at: ${input.generatedAt}`,
    `Generated from: ${basename(input.snapshotPath)}`,
    '',
    '## Decision Boundary',
    '',
    'This backlog does not authorize automatic ADR/spec/docs edits.',
    'Each item needs a maintainer decision: approve / defer / accept-risk / repair.',
    'Generated graph artifacts remain local-only and ignored.',
    '',
    '## Summary',
    '',
    `- Backlog items: ${items.length}`,
    `- Source findings: ${snapshot.summary.findings.total}`,
    `- Missing cascade findings: ${items.length}`,
    '',
    '## Items',
    '',
    ...items.flatMap((finding, index) => formatBacklogItem(finding, index)),
    ''
  ].join('\n');
}

async function readProjectIntelligenceSnapshot(snapshotPath: string): Promise<ProjectIntelligenceSnapshot> {
  let raw: string;

  try {
    raw = await readFile(snapshotPath, 'utf8');
  } catch {
    throw new Error(`missing project intelligence snapshot: ${snapshotPath}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`invalid project intelligence snapshot: ${message}`, { cause: error });
  }

  if (!isProjectIntelligenceSnapshot(parsed)) {
    throw new Error('invalid project intelligence snapshot: expected local-only repoassure.project-intelligence snapshot');
  }

  return sanitizeSnapshot(parsed);
}

function isProjectIntelligenceSnapshot(value: unknown): value is ProjectIntelligenceSnapshot {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Partial<ProjectIntelligenceSnapshot>;
  return candidate.schemaVersion === 1
    && candidate.boundary?.localOnly === true
    && candidate.boundary.hostedDashboardImplemented === false
    && candidate.boundary.telemetryEnabled === false
    && Array.isArray(candidate.findings)
    && typeof candidate.summary?.findings?.total === 'number';
}

function sanitizeSnapshot(snapshot: ProjectIntelligenceSnapshot): ProjectIntelligenceSnapshot {
  const json = redactSensitiveText(JSON.stringify(snapshot));
  return JSON.parse(json) as ProjectIntelligenceSnapshot;
}

function missingCascadeFindings(snapshot: ProjectIntelligenceSnapshot): ProjectIntelligenceFinding[] {
  return snapshot.findings
    .filter((finding) => finding.category === 'missing_cascade')
    .sort((left, right) => (left.path ?? left.id).localeCompare(right.path ?? right.id));
}

function formatBacklogItem(finding: ProjectIntelligenceFinding, index: number): string[] {
  const itemId = `RA-ADR-CASCADE-${String(index + 1).padStart(3, '0')}`;
  const path = finding.path ?? finding.id.replace(/^missing-cascade:/u, '');
  return [
    `### ${itemId}: ${path}`,
    '',
    `- Severity: ${finding.severity}`,
    `- Finding: ${finding.category}`,
    `- Evidence: ${finding.evidence?.join(', ') ?? path}`,
    '- Suggested action: Add graph-visible downstream cascade evidence or explicitly accept risk.',
    '- [ ] Decision: approve / defer / accept-risk / repair',
    '- [ ] Maintainer notes:',
    ''
  ].map(redactSensitiveText);
}

function readOptionValue(args: string[], index: number, optionName: string): { value: string; consumedNext: boolean } {
  const current = args[index] ?? '';
  const inlinePrefix = `${optionName}=`;

  if (current.startsWith(inlinePrefix)) {
    const value = current.slice(inlinePrefix.length);
    if (!value) {
      throw new Error(`${optionName} requires a value`);
    }

    return { value, consumedNext: false };
  }

  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`${optionName} requires a value`);
  }

  return { value, consumedNext: true };
}

function formatProjectIntelligenceBacklogCliSummary(result: ProjectIntelligenceBacklogRunResult): string {
  return [
    'Project intelligence ADR cascade backlog generated.',
    `Backlog: ${result.backlogPath}`,
    `Items: ${result.itemCount}`,
    `Missing cascade findings: ${result.missingCascadeCount}`,
    ''
  ].join('\n');
}

export function isDirectRun(metaUrl: string = import.meta.url, argvPath: string | undefined = process.argv[1]): boolean {
  return Boolean(argvPath && metaUrl === new URL(`file://${resolve(argvPath)}`).href);
}

if (isDirectRun()) {
  process.exitCode = await main();
}
