import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatAcceptanceFatalError } from './fatal-error.js';
import { redactSensitiveText } from './redaction.js';
import type {
  ProjectIntelligenceFinding,
  ProjectIntelligenceGraph,
  ProjectIntelligenceGraphName,
  ProjectIntelligenceSnapshot
} from './run-project-intelligence-snapshot.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const defaultSnapshotPath = 'artifacts/project-graph/project-intelligence-snapshot.json';
const defaultOutputDir = 'artifacts/project-graph';
const viewerFileName = 'project-intelligence-viewer.html';

export interface ProjectIntelligenceViewerCliOptions {
  snapshotPath?: string;
  outputDir?: string;
}

export type ProjectIntelligenceViewerRunInput = ProjectIntelligenceViewerCliOptions;

export interface ProjectIntelligenceViewerRunResult {
  viewerPath: string;
  nodeCount: number;
  edgeCount: number;
}

export async function main(args: string[] = process.argv.slice(2)): Promise<number> {
  if (isProjectIntelligenceViewerHelpRequest(args)) {
    process.stdout.write(projectIntelligenceViewerHelpText());
    return 0;
  }

  try {
    const result = await runProjectIntelligenceViewer(parseProjectIntelligenceViewerArgs(args));
    process.stdout.write(formatProjectIntelligenceViewerCliSummary(result));
    return 0;
  } catch (error: unknown) {
    process.stderr.write(`${formatAcceptanceFatalError('Project intelligence viewer failed', error)}\n`);
    return 1;
  }
}

export function parseProjectIntelligenceViewerArgs(args: string[]): ProjectIntelligenceViewerCliOptions {
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

    throw new Error(`Unknown project intelligence viewer option: ${arg}`);
  }

  return {
    ...(snapshotPath ? { snapshotPath } : {}),
    ...(outputDir ? { outputDir } : {})
  };
}

export function isProjectIntelligenceViewerHelpRequest(args: string[]): boolean {
  return args.some((arg) => arg === '--help' || arg === '-h');
}

export function projectIntelligenceViewerHelpText(): string {
  return `hardening project intelligence viewer

Usage:
  pnpm project:intelligence:view -- --snapshot <project-intelligence-snapshot.json> --output <artifacts/project-graph>
  pnpm project:intelligence:view -- --help

Options:
  --snapshot <path>  Project intelligence snapshot JSON. Defaults to artifacts/project-graph/project-intelligence-snapshot.json.
  --output <dir>     Output directory. Defaults to artifacts/project-graph.
  --help, -h         Show this help.

`;
}

export async function runProjectIntelligenceViewer(
  input: ProjectIntelligenceViewerRunInput = {}
): Promise<ProjectIntelligenceViewerRunResult> {
  const snapshotPath = input.snapshotPath ? resolve(root, input.snapshotPath) : resolve(root, defaultSnapshotPath);
  const outputDir = input.outputDir ? resolve(root, input.outputDir) : resolve(root, defaultOutputDir);
  const snapshot = await readProjectIntelligenceSnapshot(snapshotPath);
  const viewerPath = join(outputDir, viewerFileName);

  await mkdir(outputDir, { recursive: true });
  await writeFile(viewerPath, formatProjectIntelligenceViewerHtml(snapshot));

  return {
    viewerPath,
    nodeCount: snapshot.summary.docsNodes + snapshot.summary.codeNodes + snapshot.summary.progressNodes,
    edgeCount: snapshot.summary.totalEdges
  };
}

/**
 * The console previously reported exceptions only, so in the steady state it rendered
 * "No findings" above hundreds of dependency files. State and confidence are what a
 * maintainer opens it for.
 */
function formatVerdict(snapshot: ProjectIntelligenceSnapshot): string {
  const { total, high, medium, low } = snapshot.summary.findings;
  const clear = total === 0;
  const headline = clear
    ? 'No freshness or staleness findings in this snapshot.'
    : `${total} finding${total === 1 ? '' : 's'} need review.`;
  const detail = clear
    ? `${snapshot.sourceCoverage?.filesScanned ?? 0} source files scanned across ${snapshot.sourceCoverage?.rootsScanned?.length ?? 0} roots. Docs, code, and progress graphs are internally consistent.`
    : `${high} high, ${medium} medium, ${low} low. Highest severity first below.`;

  return [
    `<section class="verdict" data-state="${clear ? 'clear' : 'attention'}" aria-label="Snapshot verdict">`,
    `<p class="verdict-state">${escapeHtml(headline)}</p>`,
    `<p class="verdict-detail">${escapeHtml(detail)}</p>`,
    `<p class="verdict-next"><span>Next</span> ${escapeHtml(formatNextAction(snapshot, clear))}</p>`,
    '</section>'
  ].join('\n');
}

/** Not one element of the previous console answered "what do I do now". */
function formatNextAction(snapshot: ProjectIntelligenceSnapshot, clear: boolean): string {
  if (!clear) {
    return 'Triage the findings below, then re-run `pnpm project:intelligence` to confirm they close.';
  }
  const activeGoal = snapshot.progressGraph.nodes.find((node) => node.status === 'ready_to_execute');
  if (activeGoal) {
    return `Execute the active goal: ${activeGoal.label}.`;
  }
  return 'Select the next goal from docs/PLAN.md.';
}

/** Severity was computed and then discarded; only the total reached the page. */
function formatFindingsSummary(findings: { total: number; high: number; medium: number; low: number }): string {
  if (findings.total === 0) {
    return '0';
  }
  return `${findings.total} · ${findings.high} high · ${findings.medium} medium · ${findings.low} low`;
}

/** Bound to the snapshot rather than restated as prose that cannot drift-check. */
function formatBoundary(snapshot: ProjectIntelligenceSnapshot): string {
  const boundary = snapshot.boundary as Record<string, unknown> | undefined;
  const claims: string[] = [];
  const deny = (key: string, label: string) => {
    if (boundary && boundary[key] === false) {
      claims.push(label);
    }
  };
  deny('hostedDashboardImplemented', 'No hosted dashboard');
  deny('telemetryEnabled', 'No telemetry');
  deny('cloudSyncEnabled', 'No cloud sync');
  deny('deploymentPerformed', 'No deployment');
  deny('targetRepoWrites', 'No target repo writes');
  return escapeHtml(
    claims.length > 0
      ? `${claims.join('. ')}.`
      : 'No hosted dashboard. No telemetry. No cloud sync. No deployment. No target repo writes.'
  );
}

export function formatProjectIntelligenceViewerHtml(snapshot: ProjectIntelligenceSnapshot): string {
  const docs = formatGraphSection('Docs Graph', 'docsGraph', snapshot.docsGraph);
  const code = formatGraphSection('Code Graph', 'codeGraph', snapshot.codeGraph);
  const progress = formatGraphSection('Progress Graph', 'progressGraph', snapshot.progressGraph);
  const findings = formatFindingsSection(snapshot.findings);

  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="robots" content="noindex,nofollow">',
    '<title>Project Intelligence Console</title>',
    '<style>',
    css(),
    '</style>',
    '</head>',
    '<body data-local-only="true">',
    '<main class="shell">',
    '<header class="hero">',
    '<p class="eyebrow">RepoAssure Internal</p>',
    '<h1>Project Intelligence Console</h1>',
    '<p class="lede">local-only static viewer for docs, code, and progress graph snapshots.</p>',
    /* Bound to snapshot.boundary rather than hardcoded prose. The strongest trust claim
       on the page was previously the least verifiable one. */
    `<div class="boundary">${formatBoundary(snapshot)}</div>`,
    '</header>',
    /* A console whose only actionable section is the findings list is empty exactly when
       the project is healthy — which is its normal state. Lead with the verdict. */
    formatVerdict(snapshot),
    '<section class="summary" aria-label="Snapshot summary">',
    summaryCard('Findings', formatFindingsSummary(snapshot.summary.findings)),
    summaryCard('Source files scanned', String(snapshot.sourceCoverage?.filesScanned ?? 0)),
    summaryCard('Docs nodes', String(snapshot.summary.docsNodes)),
    summaryCard('Code nodes', String(snapshot.summary.codeNodes)),
    summaryCard('Progress nodes', String(snapshot.summary.progressNodes)),
    summaryCard('Edges', String(snapshot.summary.totalEdges)),
    '</section>',
    '<nav class="tabs" aria-label="Graph sections">',
    ...snapshot.summary.graphs.map((graphName) => `<a href="#${escapeHtml(graphName)}">${escapeHtml(formatGraphName(graphName))}</a>`),
    '</nav>',
    findings,
    docs,
    code,
    progress,
    '<footer>',
    'Generated from local snapshot artifacts. This viewer is an ignored local artifact and is not a hosted product surface.',
    '</footer>',
    '</main>',
    '</body>',
    '</html>',
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
    && isGraph(candidate.docsGraph)
    && isGraph(candidate.codeGraph)
    && isGraph(candidate.progressGraph)
    && isFindings(candidate.findings);
}

function isGraph(value: unknown): value is ProjectIntelligenceGraph {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Partial<ProjectIntelligenceGraph>;
  return Array.isArray(candidate.nodes) && Array.isArray(candidate.edges);
}

function sanitizeSnapshot(snapshot: ProjectIntelligenceSnapshot): ProjectIntelligenceSnapshot {
  const json = redactSensitiveText(JSON.stringify(snapshot));
  return JSON.parse(json) as ProjectIntelligenceSnapshot;
}

function isFindings(value: unknown): value is ProjectIntelligenceFinding[] {
  return Array.isArray(value)
    && value.every((finding) => typeof finding === 'object' && finding !== null && !Array.isArray(finding));
}

function formatFindingsSection(findings: ProjectIntelligenceFinding[]): string {
  return [
    '<section class="graph findings" id="findings">',
    '<div class="graph-heading">',
    '<h2>Freshness and Staleness Findings</h2>',
    `<p>${findings.length} findings</p>`,
    '</div>',
    '<ol class="list">',
    ...(findings.length > 0
      ? findings.slice(0, 80).map((finding) => [
        '<li>',
        `<strong>${escapeHtml(finding.severity)} · ${escapeHtml(finding.category)}</strong>`,
        `<span>${escapeHtml(finding.title)}</span>`,
        `<span>${escapeHtml(finding.detail)}</span>`,
        finding.path ? `<em>${escapeHtml(finding.path)}</em>` : '',
        '</li>'
      ].join(''))
      : ['<li><strong>No findings</strong><span>The current snapshot has no freshness or staleness findings.</span></li>']),
    '</ol>',
    '</section>'
  ].join('\n');
}

const listLimit = 80;

/**
 * The list cap was silent: a heading read "2502 nodes" above eighty rows with nothing
 * saying the rest existed, which reads as complete coverage when it is 3%.
 */
function formatTruncationNote(total: number, limit: number): string {
  return total > limit ? ` <small class="truncated">showing ${limit} of ${total}</small>` : '';
}

function formatGraphSection(title: string, id: ProjectIntelligenceGraphName, graph: ProjectIntelligenceGraph): string {
  return [
    `<section class="graph" id="${escapeHtml(id)}">`,
    '<div class="graph-heading">',
    `<h2>${escapeHtml(title)}</h2>`,
    `<p>${graph.nodes.length} nodes / ${graph.edges.length} edges</p>`,
    '</div>',
    '<div class="grid">',
    '<div>',
    `<h3>Nodes${formatTruncationNote(graph.nodes.length, listLimit)}</h3>`,
    '<ol class="list">',
    ...graph.nodes.slice(0, listLimit).map((node) => [
      '<li>',
      `<strong>${escapeHtml(node.label)}</strong>`,
      `<span>${escapeHtml(node.type)} · ${escapeHtml(node.path ?? node.id)}</span>`,
      /* `owner` is populated on every node and was rendered nowhere, so the console
         could not answer "who owns this capability" — one of its stated questions. */
      node.owner ? `<b class="owner">${escapeHtml(node.owner)}</b>` : '',
      node.status ? `<em>${escapeHtml(node.status)}</em>` : '',
      '</li>'
    ].join('')),
    '</ol>',
    '</div>',
    '<div>',
    `<h3>Edges${formatTruncationNote(graph.edges.length, listLimit)}</h3>`,
    '<ol class="list">',
    ...graph.edges.slice(0, listLimit).map((edge) => [
      '<li>',
      `<strong>${escapeHtml(edge.type)}</strong>`,
      `<span>${escapeHtml(edge.from)} -> ${escapeHtml(edge.to)}</span>`,
      '</li>'
    ].join('')),
    '</ol>',
    '</div>',
    '</div>',
    '</section>'
  ].join('\n');
}

function summaryCard(label: string, value: string): string {
  return [
    '<article>',
    `<span>${escapeHtml(label)}</span>`,
    `<strong>${escapeHtml(value)}</strong>`,
    '</article>'
  ].join('');
}

function formatGraphName(graphName: ProjectIntelligenceGraphName): string {
  const names: Record<ProjectIntelligenceGraphName, string> = {
    docsGraph: 'Docs Graph',
    codeGraph: 'Code Graph',
    progressGraph: 'Progress Graph'
  };

  return names[graphName];
}

function escapeHtml(value: string): string {
  return redactSensitiveText(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function css(): string {
  return `
.verdict{border:1px solid rgba(148,163,184,.16);border-radius:12px;padding:22px 24px;margin:0 0 22px;background:#101f31}
.verdict[data-state="clear"]{border-left:3px solid #52d290}
.verdict[data-state="attention"]{border-left:3px solid #f0ab3a}
.verdict-state{margin:0 0 6px;font-size:19px;font-weight:600;color:#e7edf5}
.verdict-detail{margin:0 0 14px;font-size:14px;color:#8698ad}
.verdict-next{margin:0;font-size:14px;color:#e7edf5;display:flex;gap:10px;align-items:baseline}
.verdict-next span{font-size:10px;letter-spacing:.09em;text-transform:uppercase;color:#52d290;flex:none}
.truncated{font-weight:400;font-size:11px;color:#8698ad;letter-spacing:.03em}
.list .owner{display:block;font-weight:500;font-size:11px;color:#8ce4b6;letter-spacing:.02em}

:root {
  color-scheme: dark;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #0a1420;
  color: #e7edf5;
}
body {
  margin: 0;
  background: #0a1420;
}
.shell {
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
  padding: 56px 0;
}
.hero {
  border: 1px solid rgba(148,163,184,.16);
  padding: 32px;
  background: #101f31;
}
.eyebrow {
  color: #52d290;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
}
h1, h2, h3, p {
  margin-top: 0;
}
h1 {
  font-size: 44px;
  line-height: 1.05;
}
.lede, footer {
  color: #8698ad;
}
.boundary {
  color: #8ce4b6;
  font-weight: 700;
}
.summary {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  border: 1px solid rgba(148,163,184,.16);
  border-top: 0;
}
.summary article {
  padding: 18px;
  border-right: 1px solid rgba(148,163,184,.16);
}
.summary article:last-child {
  border-right: 0;
}
.summary span,
.list span,
.list em {
  display: block;
  color: #8698ad;
}
.summary strong {
  display: block;
  margin-top: 8px;
  font-size: 20px;
}
.tabs {
  display: flex;
  gap: 10px;
  margin: 24px 0;
}
.tabs a {
  color: #e7edf5;
  border: 1px solid rgba(148,163,184,.16);
  padding: 10px 14px;
  text-decoration: none;
}
.graph {
  border: 1px solid rgba(148,163,184,.16);
  margin-bottom: 24px;
  background: #101f31;
}
.graph-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 24px;
  padding: 24px;
  border-bottom: 1px solid rgba(148,163,184,.16);
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.grid > div {
  padding: 24px;
}
.grid > div + div {
  border-left: 1px solid rgba(148,163,184,.16);
}
.list {
  display: grid;
  gap: 12px;
  padding-left: 22px;
}
.list li {
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(148,163,184,.10);
}
footer {
  padding: 24px 0;
}
@media (max-width: 820px) {
  .shell {
    width: calc(100% - 28px);
    padding: 28px 0;
  }
  h1 {
    font-size: 34px;
  }
  .summary,
  .grid {
    grid-template-columns: 1fr;
  }
  .summary article,
  .grid > div + div {
    border-right: 0;
    border-left: 0;
    border-top: 1px solid rgba(148,163,184,.16);
  }
  .tabs,
  .graph-heading {
    flex-direction: column;
  }
}
`;
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

function formatProjectIntelligenceViewerCliSummary(result: ProjectIntelligenceViewerRunResult): string {
  return [
    'Project intelligence viewer generated.',
    `Viewer: ${result.viewerPath}`,
    `Nodes: ${result.nodeCount}`,
    `Edges: ${result.edgeCount}`,
    ''
  ].join('\n');
}

export function isDirectRun(metaUrl: string = import.meta.url, argvPath: string | undefined = process.argv[1]): boolean {
  return Boolean(argvPath && metaUrl === new URL(`file://${resolve(argvPath)}`).href);
}

if (isDirectRun()) {
  process.exitCode = await main();
}
