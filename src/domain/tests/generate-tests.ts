import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { redactSensitiveText } from '../../shared/privacy-redaction.js';
import { shellQuoteArg } from '../../shared/shell-quote.js';
import { parseFindingsFile, type HardeningFinding } from '../../types/findings.js';

export interface GenerateTestsInput {
  findingsPath: string;
  outputDir: string;
  smokeRoutes?: string[];
  baseUrl?: string;
}

export interface GenerateTestsResult {
  createdFiles: string[];
  testCommand: string;
  validationStatus: 'passed' | 'failed' | 'skipped';
  errors: string[];
}

export async function generatePlaywrightTests(
  input: GenerateTestsInput
): Promise<GenerateTestsResult> {
  const findings = await readFindings(input.findingsPath);
  const targetFile = await nextAvailableFile(input.outputDir, 'generated-findings.spec.ts');
  const spec = buildPlaywrightSpec(findings, input.smokeRoutes ?? [], input.baseUrl);

  await mkdir(input.outputDir, { recursive: true });
  await writeFile(targetFile, spec);

  return {
    createdFiles: [targetFile],
    testCommand: `npx playwright test ${shellQuoteArg(input.outputDir)}`,
    validationStatus: 'skipped',
    errors: ['Validation skipped because Playwright execution is handled in the E2E phase.']
  };
}

async function readFindings(findingsPath: string): Promise<HardeningFinding[]> {
  const parsed = JSON.parse(await readFile(findingsPath, 'utf8')) as unknown;
  const findingsFile = parseFindingsFile(parsed);
  return findingsFile.findings;
}

async function nextAvailableFile(outputDir: string, fileName: string): Promise<string> {
  const [baseName, extension] = splitExtension(fileName);
  let index = 0;

  while (true) {
    const suffix = index === 0 ? '' : `-${index}`;
    const candidate = join(outputDir, `${baseName}${suffix}${extension}`);

    try {
      await readFile(candidate, 'utf8');
      index += 1;
    } catch {
      return candidate;
    }
  }
}

function splitExtension(fileName: string): [string, string] {
  if (fileName.endsWith('.spec.ts')) {
    return [fileName.slice(0, -'.spec.ts'.length), '.spec.ts'];
  }

  if (fileName.endsWith('.test.ts')) {
    return [fileName.slice(0, -'.test.ts'.length), '.test.ts'];
  }

  const dotIndex = fileName.lastIndexOf('.');

  if (dotIndex === -1) {
    return [fileName, ''];
  }

  return [fileName.slice(0, dotIndex), fileName.slice(dotIndex)];
}

function buildPlaywrightSpec(findings: HardeningFinding[], smokeRoutes: string[], baseUrl?: string): string {
  const tests = buildGeneratedTestCases(findings, smokeRoutes, baseUrl);
  const defaultBaseUrl = readDefaultBaseUrl(baseUrl);

  return `import { test, expect } from '@playwright/test';

const baseURL = process.env.HARDENING_BASE_URL ?? ${JSON.stringify(defaultBaseUrl)};

${tests.map((testCase, index) => buildRouteTest(testCase, index)).join('\n\n')}
`;
}

interface GeneratedRouteTestCase {
  title: string;
  path: string;
}

function buildGeneratedTestCases(
  findings: HardeningFinding[],
  smokeRoutes: string[],
  baseUrl?: string
): GeneratedRouteTestCase[] {
  const cases: GeneratedRouteTestCase[] = findings.map((finding) => {
    const path = extractPath(finding) ?? '/';
    return {
      title: redactSensitiveText(`${finding.severity} ${finding.type}: ${finding.title}`),
      path
    };
  });
  const coveredPaths = new Set(cases.map((testCase) => testCase.path));

  for (const smokeRoute of smokeRoutes) {
    const path = extractPathFromRoute(smokeRoute, baseUrl);

    if (!path || coveredPaths.has(path)) {
      continue;
    }

    coveredPaths.add(path);
    cases.push({
      title: `P2 smoke_route: Critical path route is reachable: ${path}`,
      path
    });
  }

  return cases.length > 0 ? cases : [defaultSmokeTestCase()];
}

function buildRouteTest(testCase: GeneratedRouteTestCase, index: number): string {
  const title = `${index + 1}. ${testCase.title}`;

  return `test(${JSON.stringify(title)}, async ({ page }) => {
  const targetURL = new URL(${JSON.stringify(testCase.path)}, baseURL).toString();
  await page.goto(targetURL);
  await expect(page.locator('body')).toBeVisible();
  expect(new URL(page.url()).origin).toBe(new URL(targetURL).origin);
});`;
}

function extractPath(finding: HardeningFinding): string | null {
  for (const step of finding.reproSteps) {
    const stepPath = extractPathFromReproText(step);
    if (stepPath) {
      return stepPath;
    }
  }

  for (const evidence of finding.evidence) {
    const localUrlPath = extractPathFromUrlText(evidence, { localOnly: true });
    if (localUrlPath) {
      return localUrlPath;
    }

    const urlPath = extractPathFromUrl(evidence, { localOnly: true });
    if (urlPath) {
      return urlPath;
    }

    const stepPath = evidence.match(/(?:Go to|Visit|Open)\s+(\/[^\s]*)/i)?.[1];
    if (stepPath) {
      return sanitizeGeneratedRoutePath(stripTrailingRoutePunctuation(stepPath));
    }
  }

  return null;
}

function extractPathFromReproText(value: string): string | null {
  const stepUrl = value.match(/(?:Go to|Visit|Open)\s+(https?:\/\/[^\s]+)/i)?.[1];
  if (stepUrl) {
    const path = extractPathFromUrl(stripTrailingRoutePunctuation(stepUrl));
    if (path) {
      return path;
    }
  }

  const stepPath = value.match(/(?:Go to|Visit|Open)\s+(\/[^\s]*)/i)?.[1];
  if (stepPath) {
    return sanitizeGeneratedRoutePath(stripTrailingRoutePunctuation(stepPath));
  }

  const urlPath = extractPathFromUrl(value);
  if (urlPath) {
    return urlPath;
  }

  const embeddedLocalUrlPath = extractPathFromUrlText(value, { localOnly: true });
  if (embeddedLocalUrlPath) {
    return embeddedLocalUrlPath;
  }

  return null;
}

interface UrlExtractionOptions {
  localOnly?: boolean;
  appBaseUrl?: string;
}

function extractPathFromUrlText(value: string, options: UrlExtractionOptions = {}): string | null {
  const urlText = value.match(/https?:\/\/[^\s]+/i)?.[0];

  return urlText
    ? extractPathFromUrl(stripTrailingRoutePunctuation(urlText), options)
    : null;
}

function stripTrailingRoutePunctuation(value: string): string {
  return value.trim().replace(/[),.;]+$/u, '');
}

function extractPathFromUrl(value: string, options: UrlExtractionOptions = {}): string | null {
  try {
    const url = new URL(value);
    if (options.localOnly === true && !isAllowedAppUrl(url, options.appBaseUrl)) {
      return null;
    }
    return sanitizeGeneratedRoutePath(`${url.pathname}${url.search}${url.hash}` || '/');
  } catch {
    return null;
  }
}

function isAllowedAppUrl(url: URL, appBaseUrl?: string): boolean {
  if (isLocalAppHostname(url.hostname)) {
    return true;
  }

  if (!appBaseUrl) {
    return false;
  }

  try {
    return url.origin === new URL(appBaseUrl).origin;
  } catch {
    return false;
  }
}

function readDefaultBaseUrl(baseUrl: string | undefined): string {
  if (!baseUrl) {
    return 'http://localhost:3000';
  }

  try {
    return new URL(baseUrl).origin;
  } catch {
    return 'http://localhost:3000';
  }
}

function isLocalAppHostname(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '[::1]' ||
    hostname === '[::]'
  );
}

function extractPathFromRoute(value: string, baseUrl?: string): string | null {
  const route = value.trim();
  const fromUrl = extractPathFromUrl(
    route,
    baseUrl ? { appBaseUrl: baseUrl, localOnly: true } : { localOnly: true }
  );
  if (fromUrl) {
    return fromUrl;
  }

  if (route.startsWith('/')) {
    return sanitizeGeneratedRoutePath(route);
  }

  return null;
}

function sanitizeGeneratedRoutePath(path: string): string {
  const queryStart = path.indexOf('?');
  const hashStart = path.indexOf('#');

  if (queryStart === -1 || (hashStart !== -1 && hashStart < queryStart)) {
    return sanitizeGeneratedRouteFragment(path);
  }

  const pathname = path.slice(0, queryStart);
  const query = path.slice(queryStart + 1, hashStart === -1 ? path.length : hashStart);
  const hash = hashStart === -1 ? '' : sanitizeRouteFragment(path.slice(hashStart));
  const sanitizedQuery = sanitizeRouteParameterString(query);

  return `${pathname}?${sanitizedQuery}${hash}`;
}

function sanitizeGeneratedRouteFragment(path: string): string {
  const hashStart = path.indexOf('#');

  if (hashStart === -1) {
    return path;
  }

  const pathname = path.slice(0, hashStart);
  const hash = sanitizeRouteFragment(path.slice(hashStart));

  return `${pathname}${hash}`;
}

function sanitizeRouteFragment(hash: string): string {
  const fragment = hash.slice(1);
  const fragmentQueryStart = fragment.indexOf('?');

  if (fragmentQueryStart !== -1) {
    const route = fragment.slice(0, fragmentQueryStart);
    const query = fragment.slice(fragmentQueryStart + 1);

    return `#${route}?${sanitizeRouteParameterString(query)}`;
  }

  if (!fragment.includes('=')) {
    return hash;
  }

  return `#${sanitizeRouteParameterString(fragment)}`;
}

function sanitizeRouteParameterString(value: string): string {
  return value
    .split('&')
    .map((part) => sanitizeQueryPart(part))
    .join('&');
}

function sanitizeQueryPart(part: string): string {
  const equalsIndex = part.indexOf('=');
  const key = equalsIndex === -1 ? part : part.slice(0, equalsIndex);

  if (!isSensitiveQueryKey(key)) {
    return part;
  }

  return equalsIndex === -1 ? key : `${key}=[REDACTED]`;
}

function isSensitiveQueryKey(key: string): boolean {
  const normalizedKey = safeDecodeURIComponent(key).toLowerCase().replace(/[^a-z0-9]/gu, '');

  return (
    normalizedKey === 'code' ||
    normalizedKey === 'sig' ||
    normalizedKey === 'signature' ||
    normalizedKey === 'xamzcredential' ||
    normalizedKey === 'xamzsignature' ||
    normalizedKey === 'awsaccesskeyid' ||
    /(?:apikey|token|secret|password|passcode|session|jwt|csrf|privatekey|servicerole|authorization)/u.test(
      normalizedKey
    )
  );
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function defaultSmokeTestCase(): GeneratedRouteTestCase {
  return {
    title: 'P2 smoke_route: Generated smoke path',
    path: '/'
  };
}
