import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { redactSensitiveText } from '../../shared/privacy-redaction.js';
import { parseFindingsFile, type FindingSeverity, type HardeningFinding } from '../../types/findings.js';

export type EnvironmentVerificationStatus = 'environment_specific' | 'confirmed' | 'unverifiable';

export type FetchUrlStatus = (url: string) => Promise<{ status: number }>;

export interface VerifyEnvironmentInput {
  runDir: string;
  deployedUrl: string;
  fetchUrl?: FetchUrlStatus;
}

export interface CheckedUrl {
  localUrl: string;
  deployedUrl: string;
  status: number | null;
  error?: string;
}

export interface FindingVerification {
  title: string;
  type: string;
  originalSeverity: FindingSeverity;
  severity: FindingSeverity;
  status: EnvironmentVerificationStatus;
  checkedUrls: CheckedUrl[];
}

export interface VerifyEnvironmentResult {
  reportPath: string;
  findingsPath: string;
  originalFindingsPath: string;
  environmentSpecific: number;
  confirmed: number;
  unverifiable: number;
}

/* Only failures a single request can settle. A dead control or a blank render can
   fail for reasons the deployed app would reproduce, so answering them with a
   status code would be guesswork dressed as evidence. */
const URL_SETTLEABLE_TYPES = new Set(['network_error', 'broken_route', 'console_error']);
const URL_PATTERN = /https?:\/\/[^\s"'<>)]+/gu;
const LOOPBACK_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0', '[::1]', '::1']);

export async function verifyEnvironment(input: VerifyEnvironmentInput): Promise<VerifyEnvironmentResult> {
  const findingsPath = join(input.runDir, 'findings.json');
  const originalFindingsPath = join(input.runDir, 'findings.pre-verification.json');
  const reportPath = join(input.runDir, 'environment-verification.json');
  const fetchUrl = input.fetchUrl ?? defaultFetchUrl;
  const deployedOrigin = readOrigin(input.deployedUrl);

  if (!deployedOrigin) {
    throw new Error(`Deployed URL is not a valid absolute URL: ${input.deployedUrl}`);
  }

  const originalFindings = parseFindingsFile(JSON.parse(await readFile(findingsPath, 'utf8'))).findings;
  const localUrl = await readLocalUrl(input.runDir);
  const localOrigin = localUrl ? readOrigin(localUrl) : null;

  const verifications: FindingVerification[] = [];
  const updatedFindings: HardeningFinding[] = [];

  for (const finding of originalFindings) {
    const verification = await verifyFinding({ finding, localOrigin, deployedOrigin, fetchUrl });
    verifications.push(verification);
    updatedFindings.push(applyVerification(finding, verification));
  }

  await writeFile(originalFindingsPath, `${JSON.stringify({ findings: originalFindings }, null, 2)}\n`);
  await writeFile(findingsPath, `${JSON.stringify({ findings: updatedFindings }, null, 2)}\n`);
  await writeFile(
    reportPath,
    `${JSON.stringify(
      {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        deployedUrl: redactSensitiveText(deployedOrigin),
        localUrl: localOrigin ? redactSensitiveText(localOrigin) : null,
        summary: countStatuses(verifications),
        findings: verifications
      },
      null,
      2
    )}\n`
  );

  const summary = countStatuses(verifications);

  return {
    reportPath,
    findingsPath,
    originalFindingsPath,
    environmentSpecific: summary.environmentSpecific,
    confirmed: summary.confirmed,
    unverifiable: summary.unverifiable
  };
}

async function verifyFinding(input: {
  finding: HardeningFinding;
  localOrigin: string | null;
  deployedOrigin: string;
  fetchUrl: FetchUrlStatus;
}): Promise<FindingVerification> {
  const base: Omit<FindingVerification, 'status' | 'severity' | 'checkedUrls'> = {
    title: input.finding.title,
    type: input.finding.type,
    originalSeverity: input.finding.severity
  };

  if (!URL_SETTLEABLE_TYPES.has(input.finding.type)) {
    return { ...base, severity: input.finding.severity, status: 'unverifiable', checkedUrls: [] };
  }

  const localUrls = collectVerifiableUrls(input.finding, input.localOrigin);

  if (localUrls.length === 0) {
    return { ...base, severity: input.finding.severity, status: 'unverifiable', checkedUrls: [] };
  }

  const checkedUrls: CheckedUrl[] = [];

  for (const localUrl of localUrls) {
    checkedUrls.push(await checkUrl(localUrl, input.deployedOrigin, input.fetchUrl));
  }

  /* Every checked url has to pass before the finding is called environmental: one
     still failing means the deployed app reproduces part of it. */
  const allPass = checkedUrls.every((checked) => checked.status !== null && checked.status < 400);
  const status: EnvironmentVerificationStatus = allPass ? 'environment_specific' : 'confirmed';

  return {
    ...base,
    severity: allPass ? 'P2' : input.finding.severity,
    status,
    checkedUrls
  };
}

async function checkUrl(localUrl: string, deployedOrigin: string, fetchUrl: FetchUrlStatus): Promise<CheckedUrl> {
  const deployedUrl = mapToDeployedUrl(localUrl, deployedOrigin);

  try {
    const response = await fetchUrl(deployedUrl);
    return { localUrl, deployedUrl, status: response.status };
  } catch (error) {
    return {
      localUrl,
      deployedUrl,
      status: null,
      error: redactSensitiveText(error instanceof Error ? error.message : 'Unknown error')
    };
  }
}

/* Evidence carries the exact resource that failed; a route-level finding records
   only its status there and keeps the url in the repro steps. Falling back to the
   route is only sound when the evidence named no resource at all — if it named
   one this run cannot re-check, then whether the route loads settles nothing. */
function collectVerifiableUrls(finding: HardeningFinding, localOrigin: string | null): string[] {
  const evidenceUrls = extractUrls(finding.evidence);

  if (evidenceUrls.length > 0) {
    return filterAppUrls(evidenceUrls, localOrigin);
  }

  if (finding.type === 'console_error') {
    return [];
  }

  return filterAppUrls(extractUrls(finding.reproSteps), localOrigin);
}

function extractUrls(values: string[]): string[] {
  return Array.from(new Set(values.flatMap((value) => value.match(URL_PATTERN) ?? [])));
}

function filterAppUrls(urls: string[], localOrigin: string | null): string[] {
  return urls.filter((url) => isAppUrl(url, localOrigin));
}

/* A third-party url is not this app's to re-check: swapping its origin would
   request something that never failed. */
function isAppUrl(url: string, localOrigin: string | null): boolean {
  const parsed = safeUrl(url);

  if (!parsed) {
    return false;
  }

  if (localOrigin) {
    return parsed.origin === localOrigin;
  }

  return LOOPBACK_HOSTNAMES.has(parsed.hostname);
}

function mapToDeployedUrl(localUrl: string, deployedOrigin: string): string {
  const parsed = safeUrl(localUrl);
  const deployed = safeUrl(deployedOrigin);

  if (!parsed || !deployed) {
    return localUrl;
  }

  return `${deployed.origin}${parsed.pathname}${parsed.search}`;
}

function applyVerification(finding: HardeningFinding, verification: FindingVerification): HardeningFinding {
  if (verification.status === 'unverifiable') {
    return finding;
  }

  return {
    ...finding,
    severity: verification.severity,
    evidence: [...finding.evidence, ...verification.checkedUrls.map((checked) => formatCheckedUrl(verification.status, checked))]
  };
}

function formatCheckedUrl(status: EnvironmentVerificationStatus, checked: CheckedUrl): string {
  const outcome = checked.status === null ? `unreachable (${checked.error ?? 'unknown error'})` : String(checked.status);

  return redactSensitiveText(`environment_verification=${status} :: ${checked.deployedUrl} -> ${outcome}`);
}

function countStatuses(verifications: FindingVerification[]): {
  environmentSpecific: number;
  confirmed: number;
  unverifiable: number;
} {
  return {
    environmentSpecific: verifications.filter((entry) => entry.status === 'environment_specific').length,
    confirmed: verifications.filter((entry) => entry.status === 'confirmed').length,
    unverifiable: verifications.filter((entry) => entry.status === 'unverifiable').length
  };
}

async function readLocalUrl(runDir: string): Promise<string | null> {
  try {
    const record = JSON.parse(await readFile(join(runDir, 'boot-result.json'), 'utf8')) as Record<string, unknown>;
    return typeof record.url === 'string' ? record.url : null;
  } catch {
    return null;
  }
}

function readOrigin(url: string): string | null {
  return safeUrl(url)?.origin ?? null;
}

function safeUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

async function defaultFetchUrl(url: string): Promise<{ status: number }> {
  const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15_000) });

  return { status: response.status };
}
