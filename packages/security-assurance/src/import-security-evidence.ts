import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { lstat, mkdir, open, realpath, writeFile } from 'node:fs/promises';
import { basename, isAbsolute, join, relative, resolve, sep } from 'node:path';

import { redactSensitiveText } from '@hardening-mcp/shared/privacy-redaction';

import {
  NORMALIZED_SECURITY_SCAN_SCHEMA,
  parseSecurityProvider,
  SecurityImportError,
  type SecurityProvider
} from './security-provider-contracts.js';

export type { SecurityProvider } from './security-provider-contracts.js';
export type SecuritySeverity = 'P0' | 'P1' | 'P2' | 'P3';
export type SecurityValidationStatus = 'validated' | 'suspected' | 'suppressed' | 'not_applicable' | 'deferred';

const MAX_SCAN_FILE_BYTES = 10 * 1024 * 1024;

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
  schema?: unknown;
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
  const outputBoundary = await validateRunDirectory(input.repoRoot, input.runDir);
  const scan = await readProviderScan(input.sourcePath, provider);
  const providerVersion = cleanOptionalText(scan.providerVersion);
  const targetRevision = cleanOptionalText(scan.targetRevision);
  const sourcePath = cleanText(input.sourcePath);
  const findings = readProviderFindings(scan.findings).map((finding) => normalizeFinding({
    finding,
    provider,
    sourcePath,
    ...(providerVersion ? { providerVersion } : {}),
    ...(targetRevision ? { targetRevision } : {})
  }));
  const securityDir = join(outputBoundary.runDir, 'security');
  const providerDir = join(securityDir, 'providers', provider);
  const securitySummaryPath = join(securityDir, 'security-summary.json');
  const securityFindingsPath = join(securityDir, 'security-findings.json');
  const importManifestPath = join(providerDir, 'import-manifest.json');
  const normalizedFindingsPath = join(providerDir, 'normalized-findings.json');
  const importedAt = new Date().toISOString();
  const highestSeverity = findHighestSeverity(findings);

  try {
    await assertSafeOutputPath(outputBoundary, providerDir, true);
    await mkdir(providerDir, { recursive: true });
    await Promise.all([
      assertSafeOutputPath(outputBoundary, importManifestPath, false),
      assertSafeOutputPath(outputBoundary, normalizedFindingsPath, false),
      assertSafeOutputPath(outputBoundary, securitySummaryPath, false),
      assertSafeOutputPath(outputBoundary, securityFindingsPath, false)
    ]);
    await writeJson(importManifestPath, {
      schemaVersion: 1,
      provider,
      ...(providerVersion ? { providerVersion } : {}),
      sourceType: 'scan-dir',
      sourcePath,
      importedAt,
      targetRepoRoot: cleanText(input.repoRoot),
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
      runId: cleanText(input.runId),
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
      runId: cleanText(input.runId),
      importedAt,
      findings
    });
  } catch (error) {
    if (error instanceof SecurityImportError) {
      throw error;
    }
    throw new SecurityImportError(
      'output_write_failed',
      'Security evidence artifacts could not be written inside the approved run directory.',
      'Confirm that the repo-local .hardening run directory is writable and contains no symbolic-link output targets, then retry.'
    );
  }

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
  let scanHandle: Awaited<ReturnType<typeof open>> | undefined;
  try {
    scanHandle = await open(scanPath, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    const details = await scanHandle.stat();
    if (!details.isFile()) {
      throw unreadableScanFile();
    }
    if (details.size > MAX_SCAN_FILE_BYTES) {
      throw new SecurityImportError(
        'scan_file_too_large',
        'The security evidence scan.json file exceeds the supported size limit.',
        'Reduce scan.json to 10 MiB or less by removing raw provider output and retaining only normalized findings, then retry.'
      );
    }
    scanText = await scanHandle.readFile({ encoding: 'utf8' });
  } catch (error) {
    if (error instanceof SecurityImportError) {
      throw error;
    }
    if (isNodeError(error) && error.code === 'ENOENT') {
      throw new SecurityImportError(
        'scan_file_missing',
        'The security evidence directory does not contain scan.json.',
        'Create scan.json using the RepoAssure normalized security scan envelope, then retry the import.'
      );
    }
    throw unreadableScanFile();
  } finally {
    await scanHandle?.close().catch(() => undefined);
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
  if (parsed.schema !== NORMALIZED_SECURITY_SCAN_SCHEMA) {
    throw new SecurityImportError(
      'scan_schema_invalid',
      'The security evidence scan.json file does not declare the supported normalized schema.',
      `Set schema to ${NORMALIZED_SECURITY_SCAN_SCHEMA}, then retry the import.`
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
  if (!parsed.findings.every((finding) => isRecord(finding) && !Array.isArray(finding))) {
    throw new SecurityImportError(
      'findings_invalid',
      'Every security evidence finding must be an object.',
      'Remove malformed entries or convert each finding to a normalized object, then retry the import.'
    );
  }
  for (const finding of parsed.findings) {
    const providerFinding = finding as ProviderFindingRecord;
    normalizeSeverity(providerFinding.severity);
    validateProviderFinding(providerFinding);
  }

  return parsed;
}

function validateProviderFinding(finding: ProviderFindingRecord): void {
  const requiredStrings = [finding.title, finding.category, finding.path];
  const hasRequiredStrings = requiredStrings.every((value) => typeof value === 'string' && value.trim().length > 0);
  const hasEvidence = isStringArray(finding.evidence);
  const hasValidVerification = finding.verification === undefined || isStringArray(finding.verification);
  const hasValidOptionalStrings = [finding.id, finding.attackPath, finding.remediation]
    .every((value) => value === undefined || typeof value === 'string');
  const hasValidLines = [finding.startLine, finding.endLine]
    .every((value) => value === undefined || (typeof value === 'number' && Number.isInteger(value) && value > 0));
  const hasValidStatus = finding.validationStatus === undefined || normalizeValidationStatus(finding.validationStatus) !== undefined;

  if (!hasRequiredStrings || !hasEvidence || !hasValidVerification || !hasValidOptionalStrings || !hasValidLines || !hasValidStatus) {
    throw new SecurityImportError(
      'findings_invalid',
      'A normalized security finding does not satisfy the supported field contract.',
      'Provide non-empty title, category, and path strings; an evidence string array; and correctly typed optional fields, then retry the import.'
    );
  }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function readProviderFindings(value: unknown): ProviderFindingRecord[] {
  return Array.isArray(value) ? value as ProviderFindingRecord[] : [];
}

function normalizeFinding(input: {
  finding: ProviderFindingRecord;
  provider: SecurityProvider;
  providerVersion?: string;
  sourcePath: string;
  targetRevision?: string;
}): NormalizedSecurityFinding {
  const rawProviderFindingId = readOptionalString(input.finding.id) ?? deterministicProviderFindingId(input.finding);
  const providerFindingId = cleanText(rawProviderFindingId);
  const title = cleanText(readOptionalString(input.finding.title) ?? 'Untitled security finding');
  const severity = normalizeSeverity(input.finding.severity);
  const validationStatus = normalizeValidationStatus(input.finding.validationStatus);
  const affectedLocation = readAffectedLocation(input.finding);
  const verification = readStringArray(input.finding.verification).map(cleanText);
  const provenance: SecurityFindingProvenance = {
    provider: input.provider,
    ...(input.providerVersion ? { providerVersion: cleanText(input.providerVersion) } : {}),
    sourceType: 'scan-dir',
    sourcePath: cleanText(input.sourcePath),
    ...(input.targetRevision ? { targetRevision: cleanText(input.targetRevision) } : {})
  };

  return {
    findingId: `security-${slugify(input.provider)}-${safeFindingIdSegment(rawProviderFindingId, providerFindingId)}`,
    providerFindingId,
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
  if (normalized === 'critical' || normalized === 'p0') {
    return 'P0';
  }
  if (normalized === 'high' || normalized === 'p1') {
    return 'P1';
  }
  if (normalized === 'medium' || normalized === 'moderate' || normalized === 'p2') {
    return 'P2';
  }
  if (normalized === 'low' || normalized === 'info' || normalized === 'informational' || normalized === 'p3') {
    return 'P3';
  }
  throw new SecurityImportError(
    'severity_invalid',
    'A security evidence finding has a missing or unsupported severity.',
    'Use P0, P1, P2, P3, critical, high, medium, moderate, low, info, or informational, then retry the import.'
  );
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
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(redactSensitiveText(JSON.stringify(value))) as unknown;
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

function cleanOptionalText(value: unknown): string | undefined {
  const text = readOptionalString(value);
  return text ? cleanText(text) : undefined;
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

function safeFindingIdSegment(rawProviderFindingId: string, providerFindingId: string): string {
  const digest = createHash('sha256').update(rawProviderFindingId).digest('hex').slice(0, 12);
  if (rawProviderFindingId === providerFindingId) {
    return `${slugify(providerFindingId)}-${digest}`;
  }

  return `redacted-${digest}`;
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' });
}

interface OutputBoundary {
  runDir: string;
  repoRoot: string;
  canonicalRepoRoot: string;
}

async function validateRunDirectory(repoRoot: string, runDir: string): Promise<OutputBoundary> {
  const resolvedRepoRoot = resolve(repoRoot);
  const resolvedRunDir = resolve(runDir);
  const hardeningRoot = join(resolvedRepoRoot, '.hardening');
  const runRelativeToHardening = relative(hardeningRoot, resolvedRunDir);
  if (
    !runRelativeToHardening ||
    runRelativeToHardening === '..' ||
    runRelativeToHardening.startsWith(`..${sep}`) ||
    isAbsolute(runRelativeToHardening)
  ) {
    throw invalidRunDirectory();
  }

  let canonicalRepoRoot: string;
  try {
    canonicalRepoRoot = await realpath(resolvedRepoRoot);
  } catch {
    throw invalidRunDirectory();
  }

  const boundary = { runDir: resolvedRunDir, repoRoot: resolvedRepoRoot, canonicalRepoRoot };
  await assertSafeOutputPath(boundary, resolvedRunDir, true);
  return boundary;
}

async function assertSafeOutputPath(boundary: OutputBoundary, outputPath: string, finalMustBeDirectory: boolean): Promise<void> {
  const relativeOutputPath = relative(boundary.repoRoot, resolve(outputPath));
  if (
    !relativeOutputPath ||
    relativeOutputPath === '..' ||
    relativeOutputPath.startsWith(`..${sep}`) ||
    isAbsolute(relativeOutputPath)
  ) {
    throw invalidRunDirectory();
  }

  const canonicalOutputPath = resolve(boundary.canonicalRepoRoot, relativeOutputPath);
  const segments = relative(boundary.canonicalRepoRoot, canonicalOutputPath).split(sep).filter(Boolean);
  let currentPath = boundary.canonicalRepoRoot;
  for (const [index, segment] of segments.entries()) {
    currentPath = join(currentPath, segment);
    let details;
    try {
      details = await lstat(currentPath);
    } catch (error) {
      if (isNodeError(error) && error.code === 'ENOENT') {
        return;
      }
      throw invalidRunDirectory();
    }

    if (details.isSymbolicLink()) {
      throw invalidRunDirectory();
    }
    const isFinal = index === segments.length - 1;
    if ((!isFinal || finalMustBeDirectory) && !details.isDirectory()) {
      throw invalidRunDirectory();
    }
    if (isFinal && !finalMustBeDirectory && !details.isFile()) {
      throw invalidRunDirectory();
    }
    if (isFinal && !finalMustBeDirectory) {
      throw outputAlreadyExists();
    }
  }
}

function invalidRunDirectory(): SecurityImportError {
  return new SecurityImportError(
    'run_dir_invalid',
    'The security evidence output directory is outside the approved repo-local boundary or contains a symbolic link.',
    'Use a real directory below <repo>/.hardening/ and remove symbolic links from the output path before retrying.'
  );
}

function outputAlreadyExists(): SecurityImportError {
  return new SecurityImportError(
    'output_write_failed',
    'Security evidence output already exists and will not be overwritten.',
    'Choose a new repo-local .hardening run directory or archive the existing evidence before retrying.'
  );
}

function unreadableScanFile(): SecurityImportError {
  return new SecurityImportError(
    'scan_file_unreadable',
    'The security evidence scan.json file could not be read as a regular non-symbolic-link file.',
    'Confirm that scan.json is a readable regular file inside the input directory, then retry without exposing its path or contents.'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNodeError(value: unknown): value is NodeJS.ErrnoException {
  return value instanceof Error && 'code' in value;
}
