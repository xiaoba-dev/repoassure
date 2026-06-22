import { createHash } from 'node:crypto';
import { copyFile, mkdir, readdir, readFile, readlink, rm, symlink, writeFile } from 'node:fs/promises';
import { basename, dirname, join, normalize, sep } from 'node:path';

import { runAnalyzeRepoTool, type AnalyzeRepoToolResult } from './analyze-repo-tool.js';
import { runBootAppTool, type BootAppToolSession } from './boot-app-tool.js';
import { runExploreAppTool, type ExploreAppToolResult } from './explore-app-tool.js';
import { runGenerateTestsTool, type GenerateTestsToolResult } from './generate-tests-tool.js';
import { runHardenReportTool } from './harden-report-tool.js';
import { generateRepairPlan } from '../domain/repair-plan/generate-repair-plan.js';
import type { HardenReportResult } from '../domain/reports/harden-report.js';
import type { ExploreBrowserDriver } from '../domain/explore/explore-app.js';
import { normalizeClientUrl, type BootAppInput } from '../domain/boot/boot-app.js';
import { redactSensitiveText } from '../shared/privacy-redaction.js';
import type { RepairPlanGenerationResult } from '../types/repair-plan.js';

export type RunBootApp = (input: BootAppInput) => Promise<BootAppToolSession>;

export interface RunHardeningInput {
  root: string;
  url?: string;
  startCommand?: string;
  bootTimeoutMs?: number;
  criticalPaths?: string[];
  maxRoutes?: number;
  maxActionsPerRoute?: number;
  workspaceOutputDir?: string;
  bootApp?: RunBootApp;
  browserDriver?: ExploreBrowserDriver;
}

export interface RunHardeningResult {
  profilePath: string;
  findingsPath: string;
  reportPath: string;
  artifactBundle: RunArtifactBundle;
  workspaceBundle?: WorkspaceArtifactBundle;
  analyze: AnalyzeRepoToolResult['profile'];
  explore: Omit<ExploreAppToolResult, 'findingsPath'>;
  testGeneration: GenerateTestsToolResult;
  report: HardenReportResult;
  repairPlan: RepairPlanGenerationResult;
}

export interface RunArtifactBundle {
  runId: string;
  runDir: string;
  manifestPath: string;
  latestPath: string;
  repairPlan: RepairPlanGenerationResult;
}

export interface WorkspaceArtifactBundle extends RunArtifactBundle {
  repoSlug: string;
  workspaceManifestPath: string;
}

export async function runHardeningTool(input: RunHardeningInput): Promise<RunHardeningResult> {
  const analyze = await runAnalyzeRepoTool({ root: input.root });
  const bootRunner = input.bootApp ?? runBootAppTool;
  let bootSession: BootAppToolSession | null = null;
  let targetUrl = input.url ? normalizeClientUrl(input.url) : null;

  try {
    if (targetUrl) {
      await writeExternalUrlBootResult(input.root, targetUrl);
    } else {
      const startCommand = input.startCommand ?? analyze.profile.recommendedStartCommand;

      if (!startCommand) {
        await writeFailedBootResult(input.root, 'No URL or start command is available');
        return await runHardeningWithoutExplore({
          root: input.root,
          analyze,
          ...(input.workspaceOutputDir ? { workspaceOutputDir: input.workspaceOutputDir } : {})
        });
      }

      bootSession = await bootRunner({
        root: input.root,
        startCommand,
        timeoutMs: input.bootTimeoutMs ?? 30_000
      });

      if (bootSession.status !== 'running' || !bootSession.url) {
        return await runHardeningWithoutExplore({
          root: input.root,
          analyze,
          ...(input.workspaceOutputDir ? { workspaceOutputDir: input.workspaceOutputDir } : {})
        });
      }

      targetUrl = normalizeClientUrl(bootSession.url);
    }

    return await runHardeningAfterBoot({
      root: input.root,
      url: targetUrl,
      analyze,
      criticalPaths: input.criticalPaths ?? [],
      maxRoutes: input.maxRoutes ?? 20,
      maxActionsPerRoute: input.maxActionsPerRoute ?? 20,
      ...(input.workspaceOutputDir ? { workspaceOutputDir: input.workspaceOutputDir } : {}),
      ...(input.browserDriver ? { browserDriver: input.browserDriver } : {})
    });
  } finally {
    if (bootSession) {
      await bootSession.stop();
    }
  }
}

async function runHardeningWithoutExplore(input: {
  root: string;
  analyze: Awaited<ReturnType<typeof runAnalyzeRepoTool>>;
  workspaceOutputDir?: string;
}): Promise<RunHardeningResult> {
  const explore = await writeEmptyFindings(input.root);
  const testGeneration = await runGenerateTestsTool({
    findingsPath: explore.findingsPath,
    outputDir: join(input.root, 'tests', 'hardening'),
    smokeRoutes: explore.visitedRoutes
  });
  const report = await runHardenReportTool({
    runDir: join(input.root, '.hardening', 'run'),
    outputPath: join(input.root, 'hardening-report.md')
  });
  const artifactBundle = await writeRunArtifactBundle({
    root: input.root,
    profilePath: input.analyze.profilePath,
    findingsPath: explore.findingsPath,
    reportPath: report.reportPath,
    patchDiffPath: report.patchDiffPath,
    artifactFiles: explore.artifactFiles,
    generatedTestFiles: testGeneration.createdFiles
  });
  const workspaceBundle = input.workspaceOutputDir
    ? await writeWorkspaceArtifactBundle({
        root: input.root,
        workspaceOutputDir: input.workspaceOutputDir,
        sourceBundle: artifactBundle
      })
    : undefined;
  const { findingsPath, ...exploreWithoutPath } = explore;

  return {
    profilePath: input.analyze.profilePath,
    findingsPath,
    reportPath: report.reportPath,
    artifactBundle,
    ...(workspaceBundle ? { workspaceBundle } : {}),
    analyze: input.analyze.profile,
    explore: exploreWithoutPath,
    testGeneration,
    report,
    repairPlan: artifactBundle.repairPlan
  };
}

async function runHardeningAfterBoot(input: {
  root: string;
  url: string;
  analyze: Awaited<ReturnType<typeof runAnalyzeRepoTool>>;
  criticalPaths: string[];
  maxRoutes: number;
  maxActionsPerRoute: number;
  workspaceOutputDir?: string;
  browserDriver?: ExploreBrowserDriver;
}): Promise<RunHardeningResult> {
  const explore = await runExploreAppTool({
    root: input.root,
    url: input.url,
    criticalPaths: input.criticalPaths,
    maxRoutes: input.maxRoutes,
    maxActionsPerRoute: input.maxActionsPerRoute,
    ...(input.browserDriver ? { browserDriver: input.browserDriver } : {})
  });
  const testGeneration = await runGenerateTestsTool({
    findingsPath: explore.findingsPath,
    outputDir: join(input.root, 'tests', 'hardening'),
    baseUrl: input.url,
    smokeRoutes: explore.visitedRoutes
  });
  const report = await runHardenReportTool({
    runDir: join(input.root, '.hardening', 'run'),
    outputPath: join(input.root, 'hardening-report.md')
  });
  const artifactBundle = await writeRunArtifactBundle({
    root: input.root,
    profilePath: input.analyze.profilePath,
    findingsPath: explore.findingsPath,
    reportPath: report.reportPath,
    patchDiffPath: report.patchDiffPath,
    artifactFiles: explore.artifactFiles,
    generatedTestFiles: testGeneration.createdFiles
  });
  const workspaceBundle = input.workspaceOutputDir
    ? await writeWorkspaceArtifactBundle({
        root: input.root,
        workspaceOutputDir: input.workspaceOutputDir,
        sourceBundle: artifactBundle
      })
    : undefined;
  const { findingsPath, ...exploreWithoutPath } = explore;

  return {
    profilePath: input.analyze.profilePath,
    findingsPath,
    reportPath: report.reportPath,
    artifactBundle,
    ...(workspaceBundle ? { workspaceBundle } : {}),
    analyze: input.analyze.profile,
    explore: exploreWithoutPath,
    testGeneration,
    report,
    repairPlan: artifactBundle.repairPlan
  };
}

async function writeRunArtifactBundle(input: {
  root: string;
  profilePath: string;
  findingsPath: string;
  reportPath: string;
  patchDiffPath: string;
  artifactFiles: string[];
  generatedTestFiles: string[];
}): Promise<RunArtifactBundle> {
  const runId = createRunId();
  const hardeningDir = join(input.root, '.hardening');
  const bundleDir = join(hardeningDir, 'runs', runId);
  const artifactsDir = join(bundleDir, 'artifacts');
  const generatedTestsDir = join(bundleDir, 'generated-tests');
  const latestPath = join(hardeningDir, 'latest');

  await mkdir(bundleDir, { recursive: true });
  await mkdir(artifactsDir, { recursive: true });
  await mkdir(generatedTestsDir, { recursive: true });

  const files = {
    report: await copyExistingFile(input.reportPath, join(bundleDir, 'hardening-report.md')),
    repoProfile: await copyExistingFile(input.profilePath, join(bundleDir, 'repo-profile.json')),
    bootResult: await copyExistingFile(join(input.root, '.hardening', 'run', 'boot-result.json'), join(bundleDir, 'boot-result.json')),
    appLog: await copyExistingFile(join(input.root, '.hardening', 'run', 'app.log'), join(bundleDir, 'app.log')),
    findings: await copyExistingFile(input.findingsPath, join(bundleDir, 'findings.json')),
    testGeneration: await copyExistingFile(join(input.root, '.hardening', 'run', 'test-generation.json'), join(bundleDir, 'test-generation.json')),
    patchDiff: await copyExistingFile(input.patchDiffPath, join(bundleDir, 'patch.diff')),
    generatedTests: await copyFilesToDirectory(input.generatedTestFiles, generatedTestsDir),
    artifacts: await copyFilesToDirectory(await listExistingArtifactFiles(input.artifactFiles, join(input.root, '.hardening', 'artifacts')), artifactsDir)
  };
  const manifestPath = join(bundleDir, 'manifest.json');
  const repairPlan = await generateRepairPlan({
    repoRoot: input.root,
    runDir: bundleDir,
    sourceManifestPath: manifestPath,
    runId
  });
  const legacyRepairPlan = await copyExistingFile(repairPlan.repairPlanPath, join(input.root, '.hardening', 'run', 'repair-plan.json'));
  const legacyRepairPlanMarkdown = await copyExistingFile(repairPlan.repairPlanMarkdownPath, join(input.root, '.hardening', 'run', 'repair-plan.md'));
  const legacyRepairTaskPackage = await copyExistingFile(repairPlan.repairTaskPackagePath, join(input.root, '.hardening', 'run', 'repair-task-package.json'));
  const legacyRepairTaskPackageMarkdown = await copyExistingFile(repairPlan.repairTaskPackageMarkdownPath, join(input.root, '.hardening', 'run', 'repair-task-package.md'));
  const filesWithRepairPlan = {
    ...files,
    repairPlan: repairPlan.repairPlanPath,
    repairPlanMarkdown: repairPlan.repairPlanMarkdownPath,
    repairTaskPackage: repairPlan.repairTaskPackagePath,
    repairTaskPackageMarkdown: repairPlan.repairTaskPackageMarkdownPath
  };
  const manifest = {
    schemaVersion: 1,
    runId,
    generatedAt: new Date().toISOString(),
    repoRoot: input.root,
    entrypoints: {
      manifest: manifestPath,
      report: files.report,
      repairPlan: repairPlan.repairPlanPath,
      repairPlanMarkdown: repairPlan.repairPlanMarkdownPath,
      repairTaskPackage: repairPlan.repairTaskPackagePath,
      repairTaskPackageMarkdown: repairPlan.repairTaskPackageMarkdownPath,
      findings: files.findings,
      generatedTestsDir,
      artifactsDir
    },
    files: filesWithRepairPlan,
    legacyPaths: {
      report: input.reportPath,
      repairPlan: legacyRepairPlan,
      repairPlanMarkdown: legacyRepairPlanMarkdown,
      repairTaskPackage: legacyRepairTaskPackage,
      repairTaskPackageMarkdown: legacyRepairTaskPackageMarkdown,
      runDir: join(input.root, '.hardening', 'run'),
      artifactsDir: join(input.root, '.hardening', 'artifacts'),
      generatedTests: input.generatedTestFiles
    }
  };

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  await updateLatestSymlink({
    hardeningDir,
    latestPath,
    runId
  });

  return {
    runId,
    runDir: bundleDir,
    manifestPath,
    latestPath,
    repairPlan
  };
}

async function writeWorkspaceArtifactBundle(input: {
  root: string;
  workspaceOutputDir: string;
  sourceBundle: RunArtifactBundle;
}): Promise<WorkspaceArtifactBundle> {
  const repoSlug = createRepoSlug(input.root);
  const repoDir = join(input.workspaceOutputDir, 'repos', repoSlug);
  const runDir = join(repoDir, 'runs', input.sourceBundle.runId);
  const latestPath = join(repoDir, 'latest');
  const manifestPath = join(runDir, 'manifest.json');
  const workspaceManifestPath = join(input.workspaceOutputDir, 'manifest.json');

  await copyBundleDirectory(input.sourceBundle.runDir, runDir);
  await rewriteBundleManifest({
    manifestPath,
    repoRoot: input.root,
    runId: input.sourceBundle.runId,
    runDir,
    legacyManifestPath: input.sourceBundle.manifestPath
  });
  await updateLatestSymlink({
    hardeningDir: repoDir,
    latestPath,
    runId: input.sourceBundle.runId
  });
  await updateWorkspaceManifest({
    workspaceOutputDir: input.workspaceOutputDir,
    manifestPath: workspaceManifestPath,
    repoSlug,
    repoRoot: input.root,
    runId: input.sourceBundle.runId,
    runDir,
    latestManifest: manifestPath
  });

  return {
    repoSlug,
    runId: input.sourceBundle.runId,
    runDir,
    manifestPath,
    latestPath,
    workspaceManifestPath,
    repairPlan: {
      ...input.sourceBundle.repairPlan,
      repairPlanPath: join(runDir, 'repair-plan.json'),
      repairPlanMarkdownPath: join(runDir, 'repair-plan.md'),
      repairTaskPackagePath: join(runDir, 'repair-task-package.json'),
      repairTaskPackageMarkdownPath: join(runDir, 'repair-task-package.md')
    }
  };
}

async function copyBundleDirectory(sourceDir: string, destinationDir: string): Promise<void> {
  await mkdir(destinationDir, { recursive: true });

  for (const entry of await readdir(sourceDir, { withFileTypes: true })) {
    const source = join(sourceDir, entry.name);
    const destination = join(destinationDir, entry.name);

    if (entry.isDirectory()) {
      await copyBundleDirectory(source, destination);
      continue;
    }

    if (entry.isFile()) {
      await copyExistingFile(source, destination);
    }
  }
}

async function rewriteBundleManifest(input: {
  manifestPath: string;
  repoRoot: string;
  runId: string;
  runDir: string;
  legacyManifestPath: string;
}): Promise<void> {
  const artifactsDir = join(input.runDir, 'artifacts');
  const generatedTestsDir = join(input.runDir, 'generated-tests');
  const artifacts = await listFiles(artifactsDir);
  const generatedTests = await listFiles(generatedTestsDir);
  const manifest = {
    schemaVersion: 1,
    runId: input.runId,
    generatedAt: new Date().toISOString(),
    repoRoot: input.repoRoot,
    entrypoints: {
      manifest: input.manifestPath,
      report: join(input.runDir, 'hardening-report.md'),
      repairPlan: join(input.runDir, 'repair-plan.json'),
      repairPlanMarkdown: join(input.runDir, 'repair-plan.md'),
      repairTaskPackage: join(input.runDir, 'repair-task-package.json'),
      repairTaskPackageMarkdown: join(input.runDir, 'repair-task-package.md'),
      findings: join(input.runDir, 'findings.json'),
      generatedTestsDir,
      artifactsDir
    },
    files: {
      report: await existingPathOrNull(join(input.runDir, 'hardening-report.md')),
      repairPlan: await existingPathOrNull(join(input.runDir, 'repair-plan.json')),
      repairPlanMarkdown: await existingPathOrNull(join(input.runDir, 'repair-plan.md')),
      repairTaskPackage: await existingPathOrNull(join(input.runDir, 'repair-task-package.json')),
      repairTaskPackageMarkdown: await existingPathOrNull(join(input.runDir, 'repair-task-package.md')),
      repoProfile: await existingPathOrNull(join(input.runDir, 'repo-profile.json')),
      bootResult: await existingPathOrNull(join(input.runDir, 'boot-result.json')),
      appLog: await existingPathOrNull(join(input.runDir, 'app.log')),
      findings: await existingPathOrNull(join(input.runDir, 'findings.json')),
      testGeneration: await existingPathOrNull(join(input.runDir, 'test-generation.json')),
      patchDiff: await existingPathOrNull(join(input.runDir, 'patch.diff')),
      generatedTests,
      artifacts
    },
    legacyPaths: {
      manifest: input.legacyManifestPath
    }
  };

  await writeFile(input.manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function updateWorkspaceManifest(input: {
  workspaceOutputDir: string;
  manifestPath: string;
  repoSlug: string;
  repoRoot: string;
  runId: string;
  runDir: string;
  latestManifest: string;
}): Promise<void> {
  const existing = await readWorkspaceManifest(input.manifestPath);
  const repos = existing.repos.filter((repo) => repo.repoSlug !== input.repoSlug);

  repos.push({
    repoSlug: input.repoSlug,
    repoRoot: input.repoRoot,
    latestRunId: input.runId,
    latestRunDir: input.runDir,
    latestManifest: input.latestManifest
  });
  repos.sort((left, right) => left.repoRoot.localeCompare(right.repoRoot));

  await mkdir(input.workspaceOutputDir, { recursive: true });
  await writeFile(
    input.manifestPath,
    `${JSON.stringify({
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      workspaceOutputDir: input.workspaceOutputDir,
      repos
    }, null, 2)}\n`
  );
}

interface WorkspaceManifest {
  repos: Array<{
    repoSlug: string;
    repoRoot: string;
    latestRunId: string;
    latestRunDir: string;
    latestManifest: string;
  }>;
}

async function readWorkspaceManifest(manifestPath: string): Promise<WorkspaceManifest> {
  try {
    const parsed = JSON.parse(await readFile(manifestPath, 'utf8')) as unknown;

    if (isWorkspaceManifest(parsed)) {
      return parsed;
    }
  } catch {
    return { repos: [] };
  }

  return { repos: [] };
}

function isWorkspaceManifest(value: unknown): value is WorkspaceManifest {
  return typeof value === 'object'
    && value !== null
    && Array.isArray((value as WorkspaceManifest).repos);
}

function createRepoSlug(repoRoot: string): string {
  const normalized = normalize(repoRoot);
  const segments = normalized.split(sep).filter(Boolean);
  const base = segments.slice(-2).join('-') || basename(normalized) || 'repo';
  const safeBase = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'repo';
  const hash = createHash('sha256').update(normalized).digest('hex').slice(0, 8);

  return `${safeBase}-${hash}`;
}

async function listFiles(directory: string): Promise<string[]> {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => join(directory, entry.name))
      .sort();
  } catch {
    return [];
  }
}

async function existingPathOrNull(path: string): Promise<string | null> {
  try {
    await readFile(path);
    return path;
  } catch {
    return null;
  }
}

function createRunId(): string {
  return `run-${new Date().toISOString().replace(/[:.]/g, '-')}`;
}

async function copyExistingFile(source: string, destination: string): Promise<string | null> {
  try {
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(source, destination);
    return destination;
  } catch {
    return null;
  }
}

async function copyFilesToDirectory(sourceFiles: string[], outputDir: string): Promise<string[]> {
  const copiedFiles: string[] = [];

  for (const sourceFile of sourceFiles) {
    const destination = join(outputDir, basename(sourceFile));
    const copiedFile = await copyExistingFile(sourceFile, destination);

    if (copiedFile) {
      copiedFiles.push(copiedFile);
    }
  }

  return copiedFiles;
}

async function listExistingArtifactFiles(recordedFiles: string[], artifactsDir: string): Promise<string[]> {
  const files = new Set(recordedFiles);

  try {
    for (const entry of await readdir(artifactsDir)) {
      files.add(join(artifactsDir, entry));
    }
  } catch {
    return [...files];
  }

  return [...files];
}

async function updateLatestSymlink(input: {
  hardeningDir: string;
  latestPath: string;
  runId: string;
}): Promise<void> {
  await rm(input.latestPath, { force: true, recursive: true });
  await symlink(join('runs', input.runId), input.latestPath, 'dir');
  await readlink(input.latestPath);
}

async function writeEmptyFindings(root: string): Promise<ExploreAppToolResult> {
  const runDir = join(root, '.hardening', 'run');
  const artifactsDir = join(root, '.hardening', 'artifacts');
  const findingsPath = join(runDir, 'findings.json');

  await mkdir(runDir, { recursive: true });
  await mkdir(artifactsDir, { recursive: true });
  await writeFile(findingsPath, `${JSON.stringify({ findings: [] }, null, 2)}\n`);

  return {
    visitedRoutes: [],
    interactions: [],
    findings: [],
    artifactsDir,
    artifactFiles: [],
    findingsPath
  };
}

async function writeExternalUrlBootResult(root: string, url: string): Promise<void> {
  const runDir = join(root, '.hardening', 'run');
  const resultPath = join(runDir, 'boot-result.json');

  await mkdir(runDir, { recursive: true });
  await writeFile(
    resultPath,
    `${JSON.stringify(
      {
        status: 'running',
        url: redactSensitiveText(url),
        port: readPort(url),
        logsPath: '',
        blockers: [],
        errors: []
      },
      null,
      2
    )}\n`
  );
}

async function writeFailedBootResult(root: string, error: string): Promise<void> {
  const runDir = join(root, '.hardening', 'run');
  const resultPath = join(runDir, 'boot-result.json');

  await mkdir(runDir, { recursive: true });
  await writeFile(
    resultPath,
    `${JSON.stringify(
      {
        status: 'failed',
        url: null,
        port: null,
        logsPath: '',
        blockers: [],
        errors: [error]
      },
      null,
      2
    )}\n`
  );
}

function readPort(url: string): number | null {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.port) {
      return Number(parsedUrl.port);
    }

    if (parsedUrl.protocol === 'http:') {
      return 80;
    }

    if (parsedUrl.protocol === 'https:') {
      return 443;
    }

    return null;
  } catch {
    return null;
  }
}
