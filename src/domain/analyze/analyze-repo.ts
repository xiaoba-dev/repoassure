import { access, readdir, readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

export type Framework = 'nextjs' | 'vite' | 'react' | 'unknown';
export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun' | 'unknown';
export type Confidence = 'high' | 'medium' | 'low';

export interface AnalyzeRepoInput {
  root: string;
}

export interface RepoScripts {
  dev: string | null;
  build: string | null;
  test: string | null;
  start: string | null;
  preview: string | null;
}

export interface RepoProfile {
  framework: Framework;
  packageManager: PackageManager;
  scripts: RepoScripts;
  recommendedStartCommand: string | null;
  appDirectories: string[];
  existingTestDirectories: string[];
  envHints: string[];
  blockers: string[];
  confidence: Confidence;
}

interface PackageJsonShape {
  name: string | null;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  packageManager: string | null;
  workspaces: string[];
}

interface WorkspacePackage {
  directory: string;
  packageName: string;
  packageJson: PackageJsonShape;
  framework: Framework;
}

const DEFAULT_SCRIPTS: RepoScripts = {
  dev: null,
  build: null,
  test: null,
  start: null,
  preview: null
};

const COMMON_APP_DEV_SCRIPTS = [
  'web:dev',
  'app:dev',
  'frontend:dev',
  'dev:web',
  'dev:app',
  'dev:frontend'
];

export async function analyzeRepo(input: AnalyzeRepoInput): Promise<RepoProfile> {
  const blockers: string[] = [];
  const packageJson = await readPackageJson(input.root, blockers);
  const packageManager = await detectPackageManager(input.root, packageJson);
  const workspacePackages = await detectWorkspacePackages(input.root, packageJson);
  const rootFramework = packageJson ? await detectPackageFramework(input.root, packageJson) : 'unknown';
  const framework = detectFramework(rootFramework, workspacePackages);
  const scripts = extractScripts(packageJson);
  const recommendedStartCommand = getRecommendedStartCommand(
    packageManager,
    scripts,
    packageJson?.scripts ?? {},
    workspacePackages,
    rootFramework
  );
  if (
    packageJson &&
    framework === 'unknown' &&
    !recommendedStartCommand &&
    hasStartLikeScripts(scripts, packageJson.scripts, workspacePackages)
  ) {
    blockers.push('No Web App start script detected');
  }
  const [rootAppDirectories, existingTestDirectories, envHints] = await Promise.all([
    detectExistingDirectories(input.root, ['app', 'pages', 'src']),
    detectExistingDirectories(input.root, ['tests', 'test', '__tests__', 'e2e']),
    detectEnvHints(input.root)
  ]);
  const appDirectories = Array.from(
    new Set([
      ...getRootAppDirectories(rootAppDirectories, rootFramework, workspacePackages),
      ...getWorkspaceAppDirectories(workspacePackages)
    ])
  );

  return {
    framework,
    packageManager,
    scripts,
    recommendedStartCommand,
    appDirectories,
    existingTestDirectories,
    envHints,
    blockers,
    confidence: getConfidence({
      packageJson,
      framework,
      packageManager,
      blockers,
      recommendedStartCommand
    })
  };
}

function getRootAppDirectories(
  rootAppDirectories: string[],
  rootFramework: Framework,
  workspacePackages: WorkspacePackage[]
): string[] {
  const hasDetectedWorkspaceApp = workspacePackages.some((workspacePackage) => {
    return workspacePackage.framework !== 'unknown';
  });

  if (rootFramework === 'unknown' && hasDetectedWorkspaceApp) {
    return [];
  }

  return rootAppDirectories;
}

function getWorkspaceAppDirectories(workspacePackages: WorkspacePackage[]): string[] {
  const detectedAppDirectories = workspacePackages
    .filter((workspacePackage) => workspacePackage.framework !== 'unknown')
    .map((workspacePackage) => workspacePackage.directory);

  if (detectedAppDirectories.length > 0) {
    return detectedAppDirectories;
  }

  return workspacePackages.map((workspacePackage) => workspacePackage.directory);
}

async function readPackageJson(
  root: string,
  blockers: string[]
): Promise<PackageJsonShape | null> {
  try {
    const contents = await readFile(join(root, 'package.json'), 'utf8');
    const parsed = JSON.parse(contents) as unknown;
    const record = asRecord(parsed);

    return {
      name: typeof record.name === 'string' ? record.name : null,
      scripts: stringRecord(record.scripts),
      dependencies: stringRecord(record.dependencies),
      devDependencies: stringRecord(record.devDependencies),
      packageManager: typeof record.packageManager === 'string' ? record.packageManager : null,
      workspaces: parseWorkspacePatterns(record.workspaces)
    };
  } catch (error) {
    blockers.push(error instanceof SyntaxError ? 'Invalid package.json' : 'Missing package.json');
    return null;
  }
}

function parseWorkspacePatterns(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string');
  }

  const record = asRecord(value);
  const packages = record.packages;

  if (Array.isArray(packages)) {
    return packages.filter((entry): entry is string => typeof entry === 'string');
  }

  return [];
}

async function detectPackageManager(root: string, packageJson: PackageJsonShape | null): Promise<PackageManager> {
  if (await exists(join(root, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }

  if (await exists(join(root, 'yarn.lock'))) {
    return 'yarn';
  }

  if (await exists(join(root, 'package-lock.json'))) {
    return 'npm';
  }

  if ((await exists(join(root, 'bun.lock'))) || (await exists(join(root, 'bun.lockb')))) {
    return 'bun';
  }

  return parsePackageManagerField(packageJson?.packageManager ?? null);
}

function parsePackageManagerField(value: string | null): PackageManager {
  if (!value) {
    return 'unknown';
  }

  const [name] = value.split('@');

  if (name === 'npm' || name === 'pnpm' || name === 'yarn' || name === 'bun') {
    return name;
  }

  return 'unknown';
}

function detectFramework(
  rootFramework: Framework,
  workspacePackages: WorkspacePackage[]
): Framework {
  if (rootFramework !== 'unknown') {
    return rootFramework;
  }

  for (const workspacePackage of workspacePackages) {
    if (workspacePackage.framework !== 'unknown') {
      return workspacePackage.framework;
    }
  }

  return 'unknown';
}

async function detectPackageFramework(
  root: string,
  packageJson: PackageJsonShape
): Promise<Framework> {
  const packages = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  const scriptFramework = detectPackageFrameworkFromScripts(packageJson.scripts);

  if ('next' in packages || scriptFramework === 'nextjs' || (await hasNextConfig(root))) {
    return 'nextjs';
  }

  if ('vite' in packages || scriptFramework === 'vite' || (await hasViteConfig(root))) {
    return 'vite';
  }

  if ('react' in packages || scriptFramework === 'react') {
    return 'react';
  }

  return 'unknown';
}

function detectPackageFrameworkFromScripts(scripts: Record<string, string>): Framework {
  const scriptCommands = Object.values(scripts);

  if (scriptCommands.some((script) => hasCommandToken(script, 'next'))) {
    return 'nextjs';
  }

  if (scriptCommands.some((script) => hasCommandToken(script, 'vite'))) {
    return 'vite';
  }

  if (scriptCommands.some((script) => hasCommandToken(script, 'react-scripts'))) {
    return 'react';
  }

  return 'unknown';
}

function hasCommandToken(script: string, command: string): boolean {
  return new RegExp(`(^|\\s)${escapeRegExp(command)}(\\s|$)`, 'u').test(script);
}

async function detectWorkspacePackages(
  root: string,
  packageJson: PackageJsonShape | null
): Promise<WorkspacePackage[]> {
  if (!packageJson) {
    return [];
  }

  const workspacePatterns = [
    ...packageJson.workspaces,
    ...(await readPnpmWorkspacePatterns(root))
  ];

  if (workspacePatterns.length === 0) {
    return [];
  }

  const candidates = await Promise.all(
    workspacePatterns.map((pattern) => detectWorkspacePackagesForPattern(root, pattern))
  );

  return candidates.flat();
}

async function readPnpmWorkspacePatterns(root: string): Promise<string[]> {
  try {
    const contents = await readFile(join(root, 'pnpm-workspace.yaml'), 'utf8');
    return parsePnpmWorkspacePackages(contents);
  } catch {
    return [];
  }
}

function parsePnpmWorkspacePackages(contents: string): string[] {
  const patterns: string[] = [];
  let insidePackages = false;

  for (const rawLine of contents.split(/\r?\n/)) {
    const withoutComment = rawLine.replace(/\s+#.*$/u, '');
    const trimmed = withoutComment.trim();

    if (!trimmed) {
      continue;
    }

    if (/^[A-Za-z0-9_-]+:/u.test(trimmed) && !trimmed.startsWith('-')) {
      const [key, ...valueParts] = trimmed.split(':');
      const value = valueParts.join(':').trim();
      insidePackages = key === 'packages';

      if (insidePackages && value) {
        patterns.push(...parseYamlInlineStringArray(value));
      }

      continue;
    }

    if (!insidePackages || !trimmed.startsWith('-')) {
      continue;
    }

    const pattern = unquoteYamlScalar(trimmed.slice(1).trim());

    if (pattern && !pattern.startsWith('!')) {
      patterns.push(pattern);
    }
  }

  return patterns;
}

function parseYamlInlineStringArray(value: string): string[] {
  if (!value.startsWith('[') || !value.endsWith(']')) {
    return [];
  }

  return value
    .slice(1, -1)
    .split(',')
    .map((entry) => unquoteYamlScalar(entry.trim()))
    .filter((entry) => entry.length > 0 && !entry.startsWith('!'));
}

function unquoteYamlScalar(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

async function detectWorkspacePackagesForPattern(
  root: string,
  pattern: string
): Promise<WorkspacePackage[]> {
  const wildcardIndex = pattern.indexOf('*');

  if (wildcardIndex === -1 || pattern.indexOf('*', wildcardIndex + 1) !== -1) {
    return [];
  }

  const prefix = pattern.slice(0, wildcardIndex).replace(/\/+$/u, '');
  const suffix = pattern.slice(wildcardIndex + 1).replace(/^\/+/u, '');

  if (suffix) {
    return [];
  }

  const baseDirectory = prefix || '.';
  const basePath = join(root, baseDirectory);

  try {
    const entries = await readdir(basePath, { withFileTypes: true });
    const workspacePackages = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => readWorkspacePackage(root, join(baseDirectory, entry.name)))
    );

    return workspacePackages.filter((workspacePackage): workspacePackage is WorkspacePackage => {
      return workspacePackage !== null;
    });
  } catch {
    return [];
  }
}

async function readWorkspacePackage(
  root: string,
  directory: string
): Promise<WorkspacePackage | null> {
  const normalizedDirectory = directory === '.' ? '' : directory;
  const packageJson = await readPackageJson(join(root, normalizedDirectory), []);

  if (!packageJson) {
    return null;
  }

  const framework = await detectPackageFramework(join(root, normalizedDirectory), packageJson);

  return {
    directory: normalizedDirectory,
    packageName: packageJson.name ?? basename(normalizedDirectory),
    packageJson,
    framework
  };
}

function extractScripts(packageJson: PackageJsonShape | null): RepoScripts {
  if (!packageJson) {
    return { ...DEFAULT_SCRIPTS };
  }

  return {
    dev: packageJson.scripts.dev ?? null,
    build: packageJson.scripts.build ?? null,
    test: packageJson.scripts.test ?? null,
    start: packageJson.scripts.start ?? null,
    preview: packageJson.scripts.preview ?? null
  };
}

function getRecommendedStartCommand(
  packageManager: PackageManager,
  scripts: RepoScripts,
  allScripts: Record<string, string>,
  workspacePackages: WorkspacePackage[],
  rootFramework: Framework
): string | null {
  const scriptName = selectStartScript(scripts, allScripts, rootFramework);

  if (packageManager === 'unknown') {
    return null;
  }

  const workspaceStartCommand = getWorkspaceStartCommand(packageManager, workspacePackages);

  if (!scriptName) {
    return workspaceStartCommand;
  }

  if (
    workspaceStartCommand &&
    isGenericWorkspaceOrchestrationScript(allScripts[scriptName] ?? '')
  ) {
    return workspaceStartCommand;
  }

  if (packageManager === 'npm') {
    return `npm run ${scriptName}`;
  }

  if (packageManager === 'bun') {
    return `bun run ${scriptName}`;
  }

  return `${packageManager} ${scriptName}`;
}

function isGenericWorkspaceOrchestrationScript(script: string): boolean {
  return ['turbo', 'nx', 'lerna'].some((command) => hasCommandToken(script, command));
}

function getWorkspaceStartCommand(
  packageManager: PackageManager,
  workspacePackages: WorkspacePackage[]
): string | null {
  const appWorkspacePackage = workspacePackages.find((workspacePackage) => {
    return (
      workspacePackage.framework !== 'unknown' &&
      selectStartScript(
        extractScripts(workspacePackage.packageJson),
        workspacePackage.packageJson.scripts,
        workspacePackage.framework
      )
    );
  });
  const candidates = appWorkspacePackage
    ? [appWorkspacePackage]
    : workspacePackages;

  for (const workspacePackage of candidates) {
    const command = getWorkspacePackageStartCommand(packageManager, workspacePackage);

    if (command) {
      return command;
    }
  }

  return null;
}

function getWorkspacePackageStartCommand(
  packageManager: PackageManager,
  workspacePackage: WorkspacePackage
): string | null {
  const scriptName = selectStartScript(
    extractScripts(workspacePackage.packageJson),
    workspacePackage.packageJson.scripts,
    workspacePackage.framework
  );

  if (!scriptName) {
    return null;
  }

  if (packageManager === 'pnpm') {
    return `pnpm --filter ${workspacePackage.packageName} ${scriptName}`;
  }

  if (packageManager === 'yarn') {
    return `yarn workspace ${workspacePackage.packageName} ${scriptName}`;
  }

  if (packageManager === 'bun') {
    return `bun --filter ${workspacePackage.packageName} ${scriptName}`;
  }

  return `npm run ${scriptName} --workspace ${workspacePackage.packageName}`;
}

function selectStartScript(
  scripts: RepoScripts,
  allScripts: Record<string, string>,
  framework: Framework
): string | null {
  if (scripts.dev && isRunnableWebStartScript(scripts.dev, framework)) {
    return 'dev';
  }

  if (scripts.start && isRunnableWebStartScript(scripts.start, framework)) {
    return 'start';
  }

  if (scripts.preview && isRunnableWebStartScript(scripts.preview, framework)) {
    return 'preview';
  }

  for (const scriptName of COMMON_APP_DEV_SCRIPTS) {
    if (allScripts[scriptName] && isRunnableWebStartScript(allScripts[scriptName], framework)) {
      return scriptName;
    }
  }

  return null;
}

function isRunnableWebStartScript(script: string, framework: Framework): boolean {
  if (framework !== 'unknown') {
    return true;
  }

  if (isNonServingScript(script)) {
    return false;
  }

  return [
    'vite',
    'next',
    'react-scripts',
    'astro',
    'nuxt',
    'remix',
    'svelte-kit',
    'serve',
    'http-server',
    'wrangler'
  ].some((command) => hasCommandToken(script, command))
    || /\bnode\s+.*(?:server|app|www)\.[cm]?[jt]s\b/u.test(script)
    || /\btsx\s+.*(?:server|app|www)\.[cm]?[jt]s\b/u.test(script);
}

function isNonServingScript(script: string): boolean {
  return [
    'tsc',
    'tsup',
    'rollup',
    'esbuild',
    'swc',
    'vite build',
    'vitest',
    'jest',
    'eslint',
    'prettier'
  ].some((command) => hasCommandToken(script, command));
}

function hasStartLikeScripts(
  scripts: RepoScripts,
  allScripts: Record<string, string>,
  workspacePackages: WorkspacePackage[]
): boolean {
  return Boolean(scripts.dev || scripts.start || scripts.preview)
    || COMMON_APP_DEV_SCRIPTS.some((scriptName) => Boolean(allScripts[scriptName]))
    || workspacePackages.some((workspacePackage) => {
      const workspaceScripts = extractScripts(workspacePackage.packageJson);
      return Boolean(workspaceScripts.dev || workspaceScripts.start || workspaceScripts.preview);
    });
}

async function detectExistingDirectories(root: string, candidates: string[]): Promise<string[]> {
  const existing = await Promise.all(
    candidates.map(async (candidate) => ((await exists(join(root, candidate))) ? candidate : null))
  );

  return existing.filter((directory): directory is string => directory !== null);
}

async function detectEnvHints(root: string): Promise<string[]> {
  const envFiles = ['.env.example', '.env.local', '.env'];
  const keys = new Set<string>();

  await Promise.all(
    envFiles.map(async (envFile) => {
      const path = join(root, envFile);

      if (!(await exists(path))) {
        return;
      }

      const contents = await readFile(path, 'utf8');

      for (const rawLine of contents.split(/\r?\n/)) {
        const normalizedKey = parseEnvHintKey(rawLine);

        if (normalizedKey) {
          keys.add(normalizedKey);
        }
      }
    })
  );

  return Array.from(keys).sort();
}

function parseEnvHintKey(rawLine: string): string | null {
  const line = rawLine.trim();

  if (!line || line.startsWith('#')) {
    return null;
  }

  const assignment = line.startsWith('export ') ? line.slice('export '.length).trimStart() : line;
  const separatorIndex = assignment.indexOf('=');

  if (separatorIndex <= 0) {
    return null;
  }

  const key = assignment.slice(0, separatorIndex).trim();
  return /^[A-Z0-9_]+$/u.test(key) ? key : null;
}

async function hasViteConfig(root: string): Promise<boolean> {
  return hasConfigFile(root, /^vite\.config\.[cm]?[jt]s$/);
}

async function hasNextConfig(root: string): Promise<boolean> {
  return hasConfigFile(root, /^next\.config\.[cm]?[jt]s$/);
}

async function hasConfigFile(root: string, pattern: RegExp): Promise<boolean> {
  try {
    const entries = await readdir(root);
    return entries.some((entry) => pattern.test(entry));
  } catch {
    return false;
  }
}

function getConfidence(input: {
  packageJson: PackageJsonShape | null;
  framework: Framework;
  packageManager: PackageManager;
  blockers: string[];
  recommendedStartCommand: string | null;
}): Confidence {
  if (!input.packageJson || input.blockers.length > 0) {
    return 'low';
  }

  if (
    input.framework !== 'unknown' &&
    input.packageManager !== 'unknown' &&
    input.recommendedStartCommand
  ) {
    return 'high';
  }

  return 'medium';
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function stringRecord(value: unknown): Record<string, string> {
  const record = asRecord(value);
  const output: Record<string, string> = {};

  for (const [key, nestedValue] of Object.entries(record)) {
    if (typeof nestedValue === 'string') {
      output[key] = nestedValue;
    }
  }

  return output;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
