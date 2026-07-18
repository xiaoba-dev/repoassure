import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatAcceptanceFatalError } from './fatal-error.js';
import { redactSensitiveText } from './redaction.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const defaultOutputDir = 'artifacts/project-graph';
const snapshotFileName = 'project-intelligence-snapshot.json';
const markdownFileName = 'project-intelligence-snapshot.md';
const scanRoots = ['docs', 'apps', 'packages', 'src', 'tests', 'scripts', '.autopilot'] as const;
const ignoredPathPrefixes = [
  '.git/',
  '.hardening/',
  'artifacts/',
  'benchmark-runs/',
  'coverage/',
  'dist/',
  'node_modules/',
  'test-results/'
] as const;

export type ProjectIntelligenceGraphName = 'docsGraph' | 'codeGraph' | 'progressGraph';
export type ProjectIntelligenceNodeType =
  | 'adr'
  | 'app'
  | 'architecture'
  | 'doc'
  | 'goal'
  | 'package'
  | 'progress'
  | 'script'
  | 'source'
  | 'test';
export type ProjectIntelligenceEdgeType = 'active_goal' | 'contains' | 'mentions' | 'tests';
export type ProjectIntelligenceFindingCategory =
  | 'missing_cascade'
  | 'missing_test_link'
  | 'orphan_code'
  | 'progress_state_mismatch';
export type ProjectIntelligenceFindingSeverity = 'high' | 'medium' | 'low';

export interface ProjectIntelligenceSnapshotCliOptions {
  root?: string;
  outputDir?: string;
}

export interface ProjectIntelligenceSnapshotRunInput extends ProjectIntelligenceSnapshotCliOptions {
  generatedAt?: string;
}

export interface ProjectIntelligenceSnapshotRunResult {
  snapshotPath: string;
  markdownPath: string;
  nodeCount: number;
  edgeCount: number;
}

export interface ProjectIntelligenceNode {
  id: string;
  label: string;
  type: ProjectIntelligenceNodeType;
  path?: string;
  owner?: string;
  status?: string;
}

export interface ProjectIntelligenceEdge {
  from: string;
  to: string;
  type: ProjectIntelligenceEdgeType;
}

export interface ProjectIntelligenceGraph {
  nodes: ProjectIntelligenceNode[];
  edges: ProjectIntelligenceEdge[];
}

export interface ProjectIntelligenceFinding {
  id: string;
  category: ProjectIntelligenceFindingCategory;
  severity: ProjectIntelligenceFindingSeverity;
  title: string;
  detail: string;
  path?: string;
  evidence?: string[];
}

export interface ProjectIntelligenceSnapshot {
  schemaVersion: 1;
  generatedAt: string;
  boundary: {
    localOnly: true;
    hostedDashboardImplemented: false;
    telemetryEnabled: false;
    outputDir: string;
    ignoredPrefixes: string[];
  };
  summary: {
    graphs: ProjectIntelligenceGraphName[];
    docsNodes: number;
    codeNodes: number;
    progressNodes: number;
    totalEdges: number;
    outputBytes: number;
    findings: {
      total: number;
      high: number;
      medium: number;
      low: number;
    };
  };
  docsGraph: ProjectIntelligenceGraph;
  codeGraph: ProjectIntelligenceGraph;
  progressGraph: ProjectIntelligenceGraph;
  findings: ProjectIntelligenceFinding[];
  sourceCoverage: {
    rootsScanned: string[];
    filesScanned: number;
    generatedArtifactsIgnored: true;
  };
  redaction: {
    applied: true;
    prohibitedContent: string[];
  };
}

interface SourceFile {
  path: string;
  content: string;
}

interface BuildProjectIntelligenceSnapshotInput {
  generatedAt: string;
  root: string;
  outputDir: string;
  files: SourceFile[];
}

export async function main(args: string[] = process.argv.slice(2)): Promise<number> {
  if (isProjectIntelligenceSnapshotHelpRequest(args)) {
    process.stdout.write(projectIntelligenceSnapshotHelpText());
    return 0;
  }

  try {
    const result = await runProjectIntelligenceSnapshot(parseProjectIntelligenceSnapshotArgs(args));
    process.stdout.write(formatProjectIntelligenceSnapshotCliSummary(result));
    return 0;
  } catch (error: unknown) {
    process.stderr.write(`${formatAcceptanceFatalError('Project intelligence snapshot failed', error)}\n`);
    return 1;
  }
}

export function parseProjectIntelligenceSnapshotArgs(args: string[]): ProjectIntelligenceSnapshotCliOptions {
  let repoRoot: string | undefined;
  let outputDir: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg || arg === '--') {
      continue;
    }

    if (arg === '--root' || arg.startsWith('--root=')) {
      const value = readOptionValue(args, index, '--root');
      repoRoot = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--output' || arg.startsWith('--output=')) {
      const value = readOptionValue(args, index, '--output');
      outputDir = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    throw new Error(`Unknown project intelligence snapshot option: ${arg}`);
  }

  return {
    ...(repoRoot ? { root: repoRoot } : {}),
    ...(outputDir ? { outputDir } : {})
  };
}

export function isProjectIntelligenceSnapshotHelpRequest(args: string[]): boolean {
  return args.some((arg) => arg === '--help' || arg === '-h');
}

export function projectIntelligenceSnapshotHelpText(): string {
  return `hardening project intelligence snapshot

Usage:
  pnpm project:intelligence -- --root <repo-root> --output <artifacts/project-graph>
  pnpm project:intelligence -- --help

Options:
  --root <path>      Repository root. Defaults to the current RepoAssure workspace.
  --output <dir>     Output directory. Defaults to artifacts/project-graph under the repo root.
  --help, -h         Show this help.

`;
}

export async function runProjectIntelligenceSnapshot(
  input: ProjectIntelligenceSnapshotRunInput = {}
): Promise<ProjectIntelligenceSnapshotRunResult> {
  const repoRoot = input.root ? resolve(root, input.root) : root;
  const outputDir = input.outputDir ? resolve(root, input.outputDir) : join(repoRoot, defaultOutputDir);
  const files = await readSnapshotSourceFiles(repoRoot);
  const snapshot = buildProjectIntelligenceSnapshot({
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    root: repoRoot,
    outputDir,
    files
  });
  const snapshotPath = join(outputDir, snapshotFileName);
  const markdownPath = join(outputDir, markdownFileName);
  const snapshotJson = `${JSON.stringify(snapshot, null, 2)}\n`;

  await mkdir(outputDir, { recursive: true });
  await writeFile(snapshotPath, snapshotJson);
  await writeFile(markdownPath, formatProjectIntelligenceSnapshotMarkdown(snapshot));

  return {
    snapshotPath,
    markdownPath,
    nodeCount: snapshot.docsGraph.nodes.length + snapshot.codeGraph.nodes.length + snapshot.progressGraph.nodes.length,
    edgeCount: snapshot.summary.totalEdges
  };
}

export function buildProjectIntelligenceSnapshot(
  input: BuildProjectIntelligenceSnapshotInput
): ProjectIntelligenceSnapshot {
  const docsGraph = buildDocsGraph(input.files);
  const codeGraph = buildCodeGraph(input.files);
  const progressGraph = buildProgressGraph(input.files);
  const findings = buildFreshnessFindings(input.files, docsGraph, codeGraph, progressGraph);
  const snapshotWithoutBytes: ProjectIntelligenceSnapshot = {
    schemaVersion: 1,
    generatedAt: input.generatedAt,
    boundary: {
      localOnly: true,
      hostedDashboardImplemented: false,
      telemetryEnabled: false,
      outputDir: input.outputDir,
      ignoredPrefixes: [...ignoredPathPrefixes]
    },
    summary: {
      graphs: ['docsGraph', 'codeGraph', 'progressGraph'],
      docsNodes: docsGraph.nodes.length,
      codeNodes: codeGraph.nodes.length,
      progressNodes: progressGraph.nodes.length,
      totalEdges: docsGraph.edges.length + codeGraph.edges.length + progressGraph.edges.length,
      outputBytes: 0,
      findings: summarizeFindings(findings)
    },
    docsGraph,
    codeGraph,
    progressGraph,
    findings,
    sourceCoverage: {
      rootsScanned: [...scanRoots],
      filesScanned: input.files.length,
      generatedArtifactsIgnored: true
    },
    redaction: {
      applied: true,
      prohibitedContent: ['secret values', 'authorization tokens', 'private generated artifacts']
    }
  };

  return {
    ...snapshotWithoutBytes,
    summary: {
      ...snapshotWithoutBytes.summary,
      outputBytes: Buffer.byteLength(JSON.stringify(snapshotWithoutBytes), 'utf8')
    }
  };
}

export function formatProjectIntelligenceSnapshotMarkdown(snapshot: ProjectIntelligenceSnapshot): string {
  return [
    '# Project Intelligence Snapshot',
    '',
    `Generated at: ${snapshot.generatedAt}`,
    '',
    'Boundary: local-only graph snapshot. No hosted dashboard, telemetry, cloud sync, deployment, or target repo write is implemented.',
    '',
    '## Summary',
    '',
    `- Docs nodes: ${snapshot.summary.docsNodes}`,
    `- Code nodes: ${snapshot.summary.codeNodes}`,
    `- Progress nodes: ${snapshot.summary.progressNodes}`,
    `- Total edges: ${snapshot.summary.totalEdges}`,
    `- Output bytes: ${snapshot.summary.outputBytes}`,
    `- Findings: ${snapshot.summary.findings.total} total (${snapshot.summary.findings.high} high, ${snapshot.summary.findings.medium} medium, ${snapshot.summary.findings.low} low)`,
    '',
    '## Freshness and Staleness Findings',
    '',
    ...formatFindingsList(snapshot.findings),
    '',
    '## Docs Graph',
    '',
    ...formatGraphList(snapshot.docsGraph),
    '',
    '## Code Graph',
    '',
    ...formatGraphList(snapshot.codeGraph),
    '',
    '## Progress Graph',
    '',
    ...formatGraphList(snapshot.progressGraph),
    ''
  ].join('\n');
}

function formatGraphList(graph: ProjectIntelligenceGraph): string[] {
  return [
    `- Nodes: ${graph.nodes.length}`,
    `- Edges: ${graph.edges.length}`,
    ...graph.nodes.slice(0, 8).map((node) => `- ${node.type}: ${node.id}`)
  ];
}

function formatFindingsList(findings: ProjectIntelligenceFinding[]): string[] {
  if (findings.length === 0) {
    return ['- No freshness or staleness findings.'];
  }

  return findings.map((finding) =>
    `- ${finding.severity} ${finding.category}: ${finding.id} (${finding.path ?? 'workspace'})`
  );
}

async function readSnapshotSourceFiles(repoRoot: string): Promise<SourceFile[]> {
  const files: SourceFile[] = [];

  for (const scanRoot of scanRoots) {
    await collectSourceFiles(repoRoot, scanRoot, files);
  }

  return files.sort((left, right) => left.path.localeCompare(right.path));
}

async function collectSourceFiles(repoRoot: string, relativePath: string, files: SourceFile[]): Promise<void> {
  const normalizedPath = normalizePath(relativePath);

  if (isIgnoredPath(normalizedPath)) {
    return;
  }

  const absolutePath = join(repoRoot, relativePath);
  let entryStat;

  try {
    entryStat = await stat(absolutePath);
  } catch {
    return;
  }

  if (entryStat.isDirectory()) {
    const entries = await readdir(absolutePath);
    for (const entry of entries) {
      await collectSourceFiles(repoRoot, join(relativePath, entry), files);
    }
    return;
  }

  if (!entryStat.isFile() || !isSnapshotSourceFile(normalizedPath)) {
    return;
  }

  const content = await readFile(absolutePath, 'utf8');
  files.push({ path: normalizedPath, content: redactSensitiveText(content) });
}

function buildDocsGraph(files: SourceFile[]): ProjectIntelligenceGraph {
  const docFiles = files.filter((file) => file.path.startsWith('docs/') && file.path.endsWith('.md'));
  const docPaths = new Set(docFiles.map((file) => file.path));
  const nodes = docFiles.map((file): ProjectIntelligenceNode => ({
    id: file.path,
    label: titleFromMarkdown(file.content, file.path),
    type: classifyDocNodeType(file.path),
    path: file.path,
    owner: 'docs'
  }));
  const edges = uniqueEdges(docFiles.flatMap((file) =>
    [...docPaths]
      .filter((targetPath) => targetPath !== file.path && file.content.includes(targetPath))
      .map((targetPath): ProjectIntelligenceEdge => ({
        from: file.path,
        to: targetPath,
        type: 'mentions'
      }))
  ));

  return {
    nodes: nodes.sort(compareNodes),
    edges: edges.sort(compareEdges)
  };
}

function buildCodeGraph(files: SourceFile[]): ProjectIntelligenceGraph {
  const nodes = new Map<string, ProjectIntelligenceNode>();
  const edges: ProjectIntelligenceEdge[] = [];

  for (const file of files) {
    const owner = codeOwnerFromPath(file.path);
    if (!owner) {
      continue;
    }

    nodes.set(owner.id, owner);

    if (file.path.startsWith('tests/')) {
      nodes.set(file.path, {
        id: file.path,
        label: basenameLabel(file.path),
        type: 'test',
        path: file.path,
        owner: 'tests'
      });

      for (const target of [...nodes.values()].filter((node) => node.id !== file.path)) {
        if (file.content.includes(target.path ?? target.id)) {
          edges.push({ from: file.path, to: target.id, type: 'tests' });
        }
      }
    } else if (file.path !== owner.path) {
      edges.push({ from: owner.id, to: file.path, type: 'contains' });
      nodes.set(file.path, {
        id: file.path,
        label: basenameLabel(file.path),
        type: file.path.startsWith('scripts/') ? 'script' : 'source',
        path: file.path,
        owner: owner.id
      });
    }
  }

  return {
    nodes: [...nodes.values()].sort(compareNodes),
    edges: uniqueEdges(edges).sort(compareEdges)
  };
}

function buildProgressGraph(files: SourceFile[]): ProjectIntelligenceGraph {
  const nodes = new Map<string, ProjectIntelligenceNode>();
  const edges: ProjectIntelligenceEdge[] = [];
  const progressSnapshot = parseJsonFile(files.find((file) => file.path === '.autopilot/progress/snapshot.json'));

  nodes.set('progress:current-stage', {
    id: 'progress:current-stage',
    label: readString(progressSnapshot?.current_stage) ?? 'Current stage',
    type: 'progress',
    status: 'current'
  });

  for (const file of files.filter((candidate) => candidate.path.startsWith('.autopilot/goals/') && candidate.path.endsWith('.json'))) {
    const goal = parseJsonFile(file);
    const id = readString(goal?.id) ?? file.path.replace(/^\.autopilot\/goals\//u, '').replace(/\.json$/u, '');
    const goalNodeId = `goal:${id}`;
    nodes.set(goalNodeId, {
      id: goalNodeId,
      label: readString(goal?.title) ?? id,
      type: 'goal',
      status: readString(goal?.status) ?? 'unknown'
    });
  }

  const activeGoalId = readString(readObject(progressSnapshot?.active_goal)?.id);
  if (activeGoalId && nodes.has(`goal:${activeGoalId}`)) {
    edges.push({
      from: 'progress:current-stage',
      to: `goal:${activeGoalId}`,
      type: 'active_goal'
    });
  }

  return {
    nodes: [...nodes.values()].sort(compareNodes),
    edges: uniqueEdges(edges).sort(compareEdges)
  };
}

function buildFreshnessFindings(
  files: SourceFile[],
  docsGraph: ProjectIntelligenceGraph,
  codeGraph: ProjectIntelligenceGraph,
  progressGraph: ProjectIntelligenceGraph
): ProjectIntelligenceFinding[] {
  return [
    ...findMissingCascadeDocs(docsGraph),
    ...findOrphanCodeEntries(codeGraph),
    ...findMissingTestLinks(codeGraph),
    ...findProgressStateMismatches(files, progressGraph)
  ].sort(compareFindings);
}

function findMissingCascadeDocs(docsGraph: ProjectIntelligenceGraph): ProjectIntelligenceFinding[] {
  const outgoingDocsEdges = new Set(docsGraph.edges.map((edge) => edge.from));
  return docsGraph.nodes
    .filter((node) => node.type === 'adr' && !node.id.endsWith('/template.md') && !outgoingDocsEdges.has(node.id))
    .map((node): ProjectIntelligenceFinding => ({
      id: `missing-cascade:${node.id}`,
      category: 'missing_cascade',
      severity: 'medium',
      title: 'ADR lacks cascade evidence',
      detail: 'ADR has no outgoing docsGraph edge to a downstream spec, acceptance record, test strategy, or log.',
      path: node.path ?? node.id,
      evidence: [node.id]
    }));
}

function findOrphanCodeEntries(codeGraph: ProjectIntelligenceGraph): ProjectIntelligenceFinding[] {
  const outgoingContains = new Map<string, string[]>();
  for (const edge of codeGraph.edges.filter((candidate) => candidate.type === 'contains')) {
    outgoingContains.set(edge.from, [...(outgoingContains.get(edge.from) ?? []), edge.to]);
  }

  return codeGraph.nodes
    .filter((node) => node.type === 'app')
    .filter((node) => !(outgoingContains.get(node.id) ?? []).some((path) => path.endsWith('/README.md')))
    .map((node): ProjectIntelligenceFinding => ({
      id: `orphan-code:${node.id}`,
      category: 'orphan_code',
      severity: 'medium',
      title: 'App entry lacks local ownership documentation',
      detail: 'App owner has source files but no README node in the code graph, which makes ownership harder to review.',
      path: node.path ?? node.id,
      evidence: outgoingContains.get(node.id) ?? []
    }));
}

function findMissingTestLinks(codeGraph: ProjectIntelligenceGraph): ProjectIntelligenceFinding[] {
  const testedTargets = new Set(codeGraph.edges.filter((edge) => edge.type === 'tests').map((edge) => edge.to));
  const sourceOwners = new Set(
    codeGraph.edges
      .filter((edge) => edge.type === 'contains' && /\.(ts|tsx|js|jsx|mjs)$/u.test(edge.to))
      .map((edge) => edge.from)
  );

  return codeGraph.nodes
    .filter((node) => node.type === 'package' && sourceOwners.has(node.id) && !testedTargets.has(node.id))
    .map((node): ProjectIntelligenceFinding => ({
      id: `missing-test-link:${node.id}`,
      category: 'missing_test_link',
      severity: 'medium',
      title: 'Package lacks graph-linked test evidence',
      detail: 'Package has source files but no tests edge in the code graph.',
      path: node.path ?? node.id,
      evidence: [...sourceOwners].filter((owner) => owner === node.id)
    }));
}

function findProgressStateMismatches(files: SourceFile[], progressGraph: ProjectIntelligenceGraph): ProjectIntelligenceFinding[] {
  const progressSnapshot = parseJsonFile(files.find((file) => file.path === '.autopilot/progress/snapshot.json'));
  const activeGoalId = readString(readObject(progressSnapshot?.active_goal)?.id);
  if (!activeGoalId || progressGraph.nodes.some((node) => node.id === `goal:${activeGoalId}`)) {
    return [];
  }

  return [{
    id: 'progress-state-mismatch:missing-active-goal',
    category: 'progress_state_mismatch',
    severity: 'high',
    title: 'Active goal is missing from goal records',
    detail: 'The progress snapshot active_goal id does not have a matching .autopilot/goals record.',
    path: '.autopilot/progress/snapshot.json',
    evidence: [activeGoalId]
  }];
}

function summarizeFindings(findings: ProjectIntelligenceFinding[]): ProjectIntelligenceSnapshot['summary']['findings'] {
  return {
    total: findings.length,
    high: findings.filter((finding) => finding.severity === 'high').length,
    medium: findings.filter((finding) => finding.severity === 'medium').length,
    low: findings.filter((finding) => finding.severity === 'low').length
  };
}

function codeOwnerFromPath(path: string): ProjectIntelligenceNode | undefined {
  const parts = path.split('/');

  if (parts[0] === 'apps' && parts[1]) {
    return { id: `apps/${parts[1]}`, label: parts[1], type: 'app', path: `apps/${parts[1]}`, owner: 'app' };
  }

  if (parts[0] === 'packages' && parts[1]) {
    return { id: `packages/${parts[1]}`, label: parts[1], type: 'package', path: `packages/${parts[1]}`, owner: 'package' };
  }

  if (parts[0] === 'src') {
    return { id: 'src', label: 'src', type: 'source', path: 'src', owner: 'runtime' };
  }

  if (parts[0] === 'tests') {
    return { id: 'tests', label: 'tests', type: 'test', path: 'tests', owner: 'test' };
  }

  if (parts[0] === 'scripts') {
    return { id: 'scripts', label: 'scripts', type: 'script', path: 'scripts', owner: 'script' };
  }

  return undefined;
}

function classifyDocNodeType(path: string): ProjectIntelligenceNodeType {
  if (path.startsWith('docs/adr/')) {
    return 'adr';
  }

  if (path.startsWith('docs/architecture/')) {
    return 'architecture';
  }

  return 'doc';
}

function titleFromMarkdown(content: string, fallbackPath: string): string {
  const title = content.split('\n').find((line) => line.startsWith('# '))?.replace(/^#\s+/u, '').trim();
  return redactSensitiveText(title || basenameLabel(fallbackPath));
}

function parseJsonFile(file: SourceFile | undefined): Record<string, unknown> | undefined {
  if (!file) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(file.content);
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : undefined;
  } catch {
    return undefined;
  }
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? redactSensitiveText(value) : undefined;
}

function readObject(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function isSnapshotSourceFile(path: string): boolean {
  return /\.(json|md|mjs|ts|tsx|js|jsx|yaml|yml)$/u.test(path);
}

function isIgnoredPath(path: string): boolean {
  return ignoredPathPrefixes.some((prefix) => path === prefix.slice(0, -1) || path.startsWith(prefix));
}

function normalizePath(path: string): string {
  return path.split('\\').join('/');
}

function basenameLabel(path: string): string {
  return path.split('/').at(-1) ?? path;
}

function uniqueEdges(edges: ProjectIntelligenceEdge[]): ProjectIntelligenceEdge[] {
  const seen = new Set<string>();
  return edges.filter((edge) => {
    const key = `${edge.from}\u0000${edge.to}\u0000${edge.type}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function compareNodes(left: ProjectIntelligenceNode, right: ProjectIntelligenceNode): number {
  return left.id.localeCompare(right.id);
}

function compareEdges(left: ProjectIntelligenceEdge, right: ProjectIntelligenceEdge): number {
  return `${left.from}:${left.type}:${left.to}`.localeCompare(`${right.from}:${right.type}:${right.to}`);
}

function compareFindings(left: ProjectIntelligenceFinding, right: ProjectIntelligenceFinding): number {
  return left.id.localeCompare(right.id);
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

function formatProjectIntelligenceSnapshotCliSummary(result: ProjectIntelligenceSnapshotRunResult): string {
  return [
    'Project intelligence snapshot generated.',
    `Snapshot: ${result.snapshotPath}`,
    `Markdown: ${result.markdownPath}`,
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
