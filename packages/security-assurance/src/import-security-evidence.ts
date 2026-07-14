import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

import { redactSensitiveText } from '@hardening-mcp/shared/privacy-redaction';

import {
  parseSecurityProvider,
  SecurityImportError,
  type SecurityProvider
} from './security-provider-contracts.js';

export type { SecurityProvider } from './security-provider-contracts.js';
export type SecuritySeverity = 'P0' | 'P1' | 'P2' | 'P3';
export type SecurityValidationStatus = 'validated' | 'suspected' | 'suppressed' | 'not_applicable' | 'deferred';

export interface ImportSecurityEvidenceInput {
  provider: SecurityProvider;
  sourcePath: string;
  repoRoot: string;
  runDir: string;
  runId: string;
}

export interface ImportSecurityEvidenceResult {
  securitySummaryPath: string;
  securityFindingsPath: string;
  importManifestPath: string;
  normalizedFindingsPath: string;
  findingCount: number;
  highestSeverity: SecuritySeverity | null;
}

export interface NormalizedSecurityFinding {
  findingId: string;
  providerFindingId: string;
  provider: SecurityProvider;
  title: string;
  severity: SecuritySeverity;
  category: string;
  affectedLocations: SecurityAffectedLocation[];
  evidence: string[];
  attackPath?: string;
  validationStatus?: SecurityValidationStatus;
  remediation?: string;
  verification: string[];
  provenance: SecurityFindingProvenance;
}

export interface SecurityAffectedLocation {
  path: string;
  startLine?: number;
  endLine?: number;
}

export interface SecurityFindingProvenance {
  provider: SecurityProvider;
  providerVersion?: string;
  sourceType: 'scan-dir';
  sourcePath: string;
  targetRevision?: string;
}

interface ProviderScanFile {
  provider?: unknown;
  providerVersion?: unknown;
  targetRevision?: unknown;
  coverage?: unknown;
  findings?: unknown;
}

interface ProviderFindingRecord {
  id?: unknown;
  title?: unknown;
  severity?: unknown;
  category?: unknown;
  path?: unknown;
  startLine?: unknown;
  endLine?: unknown;
  evidence?: unknown;
  attackPath?: unknown;
  validationStatus?: unknown;
  remediation?: unknown;
  verification?: unknown;
}

export async function importSecurityEvidence(input: ImportSecurityEvidenceInput): Promise<ImportSecurityEvidenceResult> {
  const provider = parseSecurityProvider(input.provider);
  const scan = await readProviderScan(input.sourcePath, provider);
  const providerVersion = readOptionalString(scan.providerVersion);
  const targetRevision = readOptionalString(scan.targetRevision);
  const findings = readProviderFindings(scan.findings).map((finding) => normalizeFinding({
    finding,
    provider,
    sourcePath: input.sourcePath,
    ...(providerVersion ? { providerVersion } : {}),
    ...(targetRevision ? { targetRevision } : {})
  }));
  const securityDir = join(input.runDir, 'security');
  const providerDir = join(securityDir, 'providers', provider);
  const securitySummaryPath = join(securityDir, 'security-summary.json');
  const securityFindingsPath = join(securityDir, 'security-findings.json');
  const importManifestPath = join(providerDir, 'import-manifest.json');
  const normalizedFindingsPath = join(providerDir, 'normalized-findings.json');
  const importedAt = new Date().toISOString();
  const highestSeverity = findHighestSeverity(findings);

  await mkdir(providerDir, { recursive: true });
  await writeJson(importManifestPath, {
    schemaVersion: 1,
    provider,
    ...(providerVersion ? { providerVersion } : {}),
    sourceType: 'scan-dir',
    sourcePath: input.sourcePath,
    importedAt,
    targetRepoRoot: redactSensitiveText(input.repoRoot),
    ...(targetRevision ? { targetRevision } : {}),
    findingCount: findings.length
  });
  await writeJson(normalizedFindingsPath, {
    schemaVersion: 1,
    provider,
    importedAt,
    findings
  });
  await writeJson(securitySummaryPath, {
    schemaVersion: 1,
    runId: redactSensitiveText(input.runId),
    importedAt,
    providerCount: 1,
    providers: [provider],
    findingCount: findings.length,
    highestSeverity,
    validationStatusCounts: countValidationStatuses(findings),
    coverage: sanitizeUnknown(scan.coverage)
  });
  await writeJson(securityFindingsPath, {
    schemaVersion: 1,
    runId: redactSensitiveText(input.runId),
    importedAt,
    findings
  });

  return {
    securitySummaryPath,
    securityFindingsPath,
    importManifestPath,
    normalizedFindingsPath,
    findingCount: findings.length,
    highestSeverity
  };
}

async function readProviderScan(sourcePath: string, provider: SecurityProvider): Promise<ProviderScanFile> {
  const scanPath = join(sourcePath, 'scan.json');
  let scanText: string;
  try {
    scanText = await readFile(scanPath, 'utf8');
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      throw new SecurityImportError(
        'scan_file_missing',
        'The security evidence directory does not contain scan.json.',
        'Create scan.json using the RepoAssure normalized security scan envelope, then retry the import.'
      );
    }
    throw error;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(scanText) as unknown;
  } catch {
    throw new SecurityImportError(
      'scan_json_invalid',
      'The security evidence scan.json file is not valid JSON.',
      'Correct the JSON syntax without including secrets, then retry the import.'
    );
  }

  if (!isRecord(parsed) || Array.isArray(parsed)) {
    throw new SecurityImportError(
      'scan_root_invalid',
      'The security evidence scan.json root must be an object.',
      'Wrap provider metadata and findings in one normalized JSON object, then retry the import.'
    );
  }
  if (parsed.provider !== undefined && parsed.provider !== provider) {
    throw new SecurityImportError(
      'provider_mismatch',
      'The requested provider does not match the provider declared by scan.json.',
      'Use the provider id declared by the normalized envelope or regenerate scan.json with the intended provider id.'
    );
  }
  if (!Array.isArray(parsed.findings)) {
    throw new SecurityImportError(
      'findings_invalid',
      'The security evidence scan.json findings field must be an array.',
      'Provide findings as an array, using an empty array when the scan has no findings, then retry the import.'
    );
  }

  return parsed;
}

function readProviderFindings(value: unknown): ProviderFindingRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord);
}

function normalizeFinding(input: {
  finding: ProviderFindingRecord;
  provider: SecurityProvider;
  providerVersion?: string;
  sourcePath: string;
  targetRevision?: string;
}): NormalizedSecurityFinding {
  const providerFindingId = readOptionalString(input.finding.id) ?? deterministicProviderFindingId(input.finding);
  const title = cleanText(readOptionalString(input.finding.title) ?? 'Untitled security finding');
  const severity = normalizeSeverity(input.finding.severity);
  const validationStatus = normalizeValidationStatus(input.finding.validationStatus);
  const affectedLocation = readAffectedLocation(input.finding);
  const verification = readStringArray(input.finding.verification).map(cleanText);
  const provenance: SecurityFindingProvenance = {
    provider: input.provider,
    ...(input.providerVersion ? { providerVersion: input.providerVersion } : {}),
    sourceType: 'scan-dir',
    sourcePath: input.sourcePath,
    ...(input.targetRevision ? { targetRevision: input.targetRevision } : {})
  };

  return {
    findingId: `security-${slugify(input.provider)}-${slugify(providerFindingId)}`,
    providerFindingId: cleanText(providerFindingId),
    provider: input.provider,
    title,
    severity,
    category: cleanText(readOptionalString(input.finding.category) ?? 'security'),
    affectedLocations: affectedLocation ? [affectedLocation] : [],
    evidence: readStringArray(input.finding.evidence).map(cleanText),
    ...(readOptionalString(input.finding.attackPath) ? { attackPath: cleanText(readOptionalString(input.finding.attackPath) ?? '') } : {}),
    ...(validationStatus ? { validationStatus } : {}),
    ...(readOptionalString(input.finding.remediation) ? { remediation: cleanText(readOptionalString(input.finding.remediation) ?? '') } : {}),
    verification,
    provenance
  };
}

function readAffectedLocation(finding: ProviderFindingRecord): SecurityAffectedLocation | null {
  const path = readOptionalString(finding.path);
  if (!path) {
    return null;
  }

  const startLine = readPositiveInteger(finding.startLine);
  const endLine = readPositiveInteger(finding.endLine);
  return {
    path: cleanText(path),
    ...(startLine ? { startLine } : {}),
    ...(endLine ? { endLine } : {})
  };
}

function normalizeSeverity(value: unknown): SecuritySeverity {
  const normalized = typeof value === 'string' ? value.toLowerCase() : '';
  if (normalized === 'critical') {
    return 'P0';
  }
  if (normalized === 'high') {
    return 'P1';
  }
  if (normalized === 'medium' || normalized === 'moderate') {
    return 'P2';
  }
  return 'P3';
}

function normalizeValidationStatus(value: unknown): SecurityValidationStatus | undefined {
  if (
    value === 'validated' ||
    value === 'suspected' ||
    value === 'suppressed' ||
    value === 'not_applicable' ||
    value === 'deferred'
  ) {
    return value;
  }

  return undefined;
}

function findHighestSeverity(findings: NormalizedSecurityFinding[]): SecuritySeverity | null {
  return findings.map((finding) => finding.severity).sort((left, right) => securitySeverityRank(left) - securitySeverityRank(right))[0] ?? null;
}

function countValidationStatuses(findings: NormalizedSecurityFinding[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const finding of findings) {
    const status = finding.validationStatus ?? 'deferred';
    counts[status] = (counts[status] ?? 0) + 1;
  }

  return counts;
}

function sanitizeUnknown(value: unknown): unknown {
  if (typeof value === 'string') {
    return cleanText(value);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeUnknown);
  }
  if (isRecord(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, sanitizeUnknown(entry)]));
  }

  return value;
}

function securitySeverityRank(severity: SecuritySeverity): number {
  if (severity === 'P0') {
    return 0;
  }
  if (severity === 'P1') {
    return 1;
  }
  if (severity === 'P2') {
    return 2;
  }
  return 3;
}

function readStringArray(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value];
  }
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function readPositiveInteger(value: unknown): number | undefined {
  return Number.isInteger(value) && Number(value) > 0 ? Number(value) : undefined;
}

function deterministicProviderFindingId(value: ProviderFindingRecord): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 12);
}

function cleanText(value: string): string {
  return redactSensitiveText(value);
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || basename(value) || 'finding';
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNodeError(value: unknown): value is NodeJS.ErrnoException {
  return value instanceof Error && 'code' in value;
}
