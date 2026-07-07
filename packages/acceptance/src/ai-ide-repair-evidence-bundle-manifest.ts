import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

import { escapeMarkdownTableCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';

export type AiIdeRepairEvidenceBundleArtifactKind =
  | 'ai_ide_repair_playbook'
  | 'ai_ide_playbook_consumption_report'
  | 'ai_ide_repair_decision_package'
  | 'ai_ide_repair_approval_receipt'
  | 'ai_ide_approved_repair_execution_plan'
  | 'ai_ide_repair_execution_evidence_report';

export type AiIdeRepairEvidenceBundleStatus =
  | 'verified_pending_maintainer_review'
  | 'blocked_or_failed'
  | 'approved_plan_pending_evidence'
  | 'review_required';

export interface AiIdeRepairEvidenceBundleArtifactInput {
  artifactKind: AiIdeRepairEvidenceBundleArtifactKind;
  path: string;
  content: string;
}

export interface AiIdeRepairEvidenceBundleManifestInput {
  generatedAt?: string;
  artifacts: AiIdeRepairEvidenceBundleArtifactInput[];
}

export interface WriteAiIdeRepairEvidenceBundleManifestInput {
  generatedAt?: string;
  playbookPath: string;
  consumptionReportPath: string;
  decisionPackagePath: string;
  approvalReceiptPath: string;
  executionPlanPath: string;
  evidenceReportPath: string;
  outputDir: string;
}

export interface AiIdeRepairEvidenceBundleArtifact {
  artifactKind: AiIdeRepairEvidenceBundleArtifactKind;
  fileName: string;
  path: string;
  schemaVersion: string;
  sha256: string;
  generatedAt: string | null;
}

export interface AiIdeRepairEvidenceBundleReadingOrderItem {
  artifactKind: AiIdeRepairEvidenceBundleArtifactKind;
  fileName: string;
  reason: string;
}

export interface AiIdeRepairEvidenceBundleSummary {
  totalArtifacts: number;
  presentArtifacts: number;
  missingArtifacts: number;
  manualRepairCandidates: number;
  approvedManualRepairCandidates: number;
  approvedExecutionItems: number;
  verifiedItems: number;
  boundaryViolations: number;
  currentStatus: AiIdeRepairEvidenceBundleStatus;
}

export interface AiIdeRepairEvidenceBundleBoundaries {
  approvalBoundary: string;
  executionEvidenceBoundary: string;
  redactionBoundary: string;
  nonAuthorizationBoundary: string;
  blockedActions: string[];
}

export interface AiIdeRepairEvidenceBundleManifest {
  schemaVersion: 'repoassure.ai-ide-repair-evidence-bundle-manifest.v1';
  generatedAt: string;
  bundleSummary: AiIdeRepairEvidenceBundleSummary;
  readingOrder: AiIdeRepairEvidenceBundleReadingOrderItem[];
  artifacts: AiIdeRepairEvidenceBundleArtifact[];
  nextActions: string[];
  boundaries: AiIdeRepairEvidenceBundleBoundaries;
}

export interface WriteAiIdeRepairEvidenceBundleManifestResult {
  jsonPath: string;
  markdownPath: string;
  manifest: AiIdeRepairEvidenceBundleManifest;
}

const requiredReadingOrder: AiIdeRepairEvidenceBundleArtifactKind[] = [
  'ai_ide_repair_playbook',
  'ai_ide_playbook_consumption_report',
  'ai_ide_repair_decision_package',
  'ai_ide_repair_approval_receipt',
  'ai_ide_approved_repair_execution_plan',
  'ai_ide_repair_execution_evidence_report'
];

const nonAuthorizationBoundary =
  'This repair evidence bundle manifest is an index and review entry point only; it does not authorize target repo mutation, branch creation, commits, pull requests, issues, advisories, npm publication, GitHub release, public launch, customer contact, pricing/spend changes, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.';

export function buildAiIdeRepairEvidenceBundleManifest(
  input: AiIdeRepairEvidenceBundleManifestInput
): AiIdeRepairEvidenceBundleManifest {
  const parsedArtifacts = input.artifacts.map(parseArtifactInput);
  const artifactByKind = new Map(parsedArtifacts.map((artifact) => [artifact.artifactKind, artifact]));
  const sortedArtifacts = requiredReadingOrder
    .map((artifactKind) => artifactByKind.get(artifactKind))
    .filter((artifact): artifact is ParsedBundleArtifact => artifact !== undefined);
  const missingArtifacts = requiredReadingOrder.length - sortedArtifacts.length;
  const summary = buildBundleSummary(sortedArtifacts, missingArtifacts);

  return {
    schemaVersion: 'repoassure.ai-ide-repair-evidence-bundle-manifest.v1',
    generatedAt: sanitize(input.generatedAt ?? new Date().toISOString()),
    bundleSummary: summary,
    readingOrder: sortedArtifacts.map((artifact) => ({
      artifactKind: artifact.artifactKind,
      fileName: artifact.fileName,
      reason: readingOrderReason(artifact.artifactKind)
    })),
    artifacts: sortedArtifacts.map((artifact) => ({
      artifactKind: artifact.artifactKind,
      fileName: artifact.fileName,
      path: artifact.path,
      schemaVersion: artifact.schemaVersion,
      sha256: artifact.sha256,
      generatedAt: artifact.generatedAt
    })),
    nextActions: buildNextActions(summary),
    boundaries: buildBoundaries(sortedArtifacts)
  };
}

export async function writeAiIdeRepairEvidenceBundleManifest(
  input: WriteAiIdeRepairEvidenceBundleManifestInput
): Promise<WriteAiIdeRepairEvidenceBundleManifestResult> {
  const artifacts = await Promise.all([
    readArtifact('ai_ide_repair_playbook', input.playbookPath),
    readArtifact('ai_ide_playbook_consumption_report', input.consumptionReportPath),
    readArtifact('ai_ide_repair_decision_package', input.decisionPackagePath),
    readArtifact('ai_ide_repair_approval_receipt', input.approvalReceiptPath),
    readArtifact('ai_ide_approved_repair_execution_plan', input.executionPlanPath),
    readArtifact('ai_ide_repair_execution_evidence_report', input.evidenceReportPath)
  ]);
  const manifest = buildAiIdeRepairEvidenceBundleManifest({
    artifacts,
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {})
  });
  const jsonPath = join(input.outputDir, 'ai-ide-repair-evidence-bundle-manifest.json');
  const markdownPath = join(input.outputDir, 'ai-ide-repair-evidence-bundle-manifest.md');

  await mkdir(input.outputDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(markdownPath, buildAiIdeRepairEvidenceBundleManifestMarkdown(manifest));

  return { jsonPath, markdownPath, manifest };
}

export function buildAiIdeRepairEvidenceBundleManifestMarkdown(
  manifest: AiIdeRepairEvidenceBundleManifest
): string {
  return [
    '# RepoAssure AI IDE Repair Evidence Bundle Manifest',
    '',
    `Generated at: ${manifest.generatedAt}`,
    '',
    '## Bundle Summary',
    '',
    `- totalArtifacts: ${manifest.bundleSummary.totalArtifacts}`,
    `- presentArtifacts: ${manifest.bundleSummary.presentArtifacts}`,
    `- missingArtifacts: ${manifest.bundleSummary.missingArtifacts}`,
    `- manualRepairCandidates: ${manifest.bundleSummary.manualRepairCandidates}`,
    `- approvedManualRepairCandidates: ${manifest.bundleSummary.approvedManualRepairCandidates}`,
    `- approvedExecutionItems: ${manifest.bundleSummary.approvedExecutionItems}`,
    `- verifiedItems: ${manifest.bundleSummary.verifiedItems}`,
    `- boundaryViolations: ${manifest.bundleSummary.boundaryViolations}`,
    `- currentStatus: ${manifest.bundleSummary.currentStatus}`,
    '',
    '## Reading Order',
    '',
    '| Step | Artifact | Reason |',
    '| --- | --- | --- |',
    ...manifest.readingOrder.map((item, index) => `| ${[
      String(index + 1),
      item.fileName,
      item.reason
    ].map((value) => escapeMarkdownTableCell(value)).join(' | ')} |`),
    '',
    '## Artifact Inventory',
    '',
    '| Artifact | Schema | SHA-256 | Path |',
    '| --- | --- | --- | --- |',
    ...manifest.artifacts.map((artifact) => `| ${[
      artifact.fileName,
      artifact.schemaVersion,
      artifact.sha256,
      artifact.path
    ].map((value) => escapeMarkdownTableCell(value)).join(' | ')} |`),
    '',
    '## Next Actions',
    '',
    ...manifest.nextActions.map((action) => `- ${action}`),
    '',
    '## Boundaries',
    '',
    `- approvalBoundary: ${manifest.boundaries.approvalBoundary}`,
    `- executionEvidenceBoundary: ${manifest.boundaries.executionEvidenceBoundary}`,
    `- redactionBoundary: ${manifest.boundaries.redactionBoundary}`,
    `- nonAuthorizationBoundary: ${manifest.boundaries.nonAuthorizationBoundary}`,
    '- No target repo branch, commit, pull request, issue, advisory, or file mutation is authorized by this manifest.',
    '',
    '## Blocked Actions',
    '',
    ...manifest.boundaries.blockedActions.map((action) => `- ${action}`),
    ''
  ].join('\n');
}

interface ParsedBundleArtifact {
  artifactKind: AiIdeRepairEvidenceBundleArtifactKind;
  fileName: string;
  path: string;
  content: string;
  parsed: Record<string, unknown>;
  schemaVersion: string;
  sha256: string;
  generatedAt: string | null;
}

async function readArtifact(
  artifactKind: AiIdeRepairEvidenceBundleArtifactKind,
  path: string
): Promise<AiIdeRepairEvidenceBundleArtifactInput> {
  return {
    artifactKind,
    path,
    content: await readFile(path, 'utf8')
  };
}

function parseArtifactInput(input: AiIdeRepairEvidenceBundleArtifactInput): ParsedBundleArtifact {
  const parsed = JSON.parse(input.content) as Record<string, unknown>;

  return {
    artifactKind: input.artifactKind,
    fileName: sanitize(basename(input.path)),
    path: sanitizePath(input.path),
    content: input.content,
    parsed,
    schemaVersion: stringField(parsed.schemaVersion, 'unknown'),
    sha256: createHash('sha256').update(input.content).digest('hex'),
    generatedAt: typeof parsed.generatedAt === 'string' ? sanitize(parsed.generatedAt) : null
  };
}

function buildBundleSummary(
  artifacts: ParsedBundleArtifact[],
  missingArtifacts: number
): AiIdeRepairEvidenceBundleSummary {
  const decisionPackage = artifactParsed(artifacts, 'ai_ide_repair_decision_package');
  const approvalReceipt = artifactParsed(artifacts, 'ai_ide_repair_approval_receipt');
  const executionPlan = artifactParsed(artifacts, 'ai_ide_approved_repair_execution_plan');
  const evidenceReport = artifactParsed(artifacts, 'ai_ide_repair_execution_evidence_report');
  const verifiedItems = numberField(nestedRecord(evidenceReport, 'evidenceSummary').verifiedItems);
  const boundaryViolations = numberField(nestedRecord(evidenceReport, 'evidenceSummary').boundaryViolations);
  const currentStatus = classifyCurrentStatus({
    missingArtifacts,
    verifiedItems,
    boundaryViolations,
    approvedExecutionItems: numberField(nestedRecord(executionPlan, 'executionSummary').approvedExecutionItems)
  });

  return {
    totalArtifacts: requiredReadingOrder.length,
    presentArtifacts: artifacts.length,
    missingArtifacts,
    manualRepairCandidates: numberField(nestedRecord(decisionPackage, 'decisionSummary').manualRepairCandidates),
    approvedManualRepairCandidates: numberField(nestedRecord(approvalReceipt, 'receiptSummary').approvedManualRepairCandidates),
    approvedExecutionItems: numberField(nestedRecord(executionPlan, 'executionSummary').approvedExecutionItems),
    verifiedItems,
    boundaryViolations,
    currentStatus
  };
}

function buildBoundaries(artifacts: ParsedBundleArtifact[]): AiIdeRepairEvidenceBundleBoundaries {
  const approvalReceipt = artifactParsed(artifacts, 'ai_ide_repair_approval_receipt');
  const executionPlan = artifactParsed(artifacts, 'ai_ide_approved_repair_execution_plan');
  const evidenceReport = artifactParsed(artifacts, 'ai_ide_repair_execution_evidence_report');
  const blockedActions = [
    ...stringArrayField(approvalReceipt.blockedActions),
    ...stringArrayField(executionPlan.blockedActions),
    ...stringArrayField(evidenceReport.blockedActions)
  ];

  return {
    approvalBoundary: firstString([
      approvalReceipt.nonAuthorizationBoundary,
      approvalReceipt.maintainerReviewBoundary,
      'Approval receipt records maintainer decisions only.'
    ]),
    executionEvidenceBoundary: firstString([
      evidenceReport.nonAuthorizationBoundary,
      evidenceReport.maintainerReviewBoundary,
      'Execution evidence report records local evidence only.'
    ]),
    redactionBoundary: firstString([
      evidenceReport.redactionBoundary,
      executionPlan.redactionBoundary,
      approvalReceipt.redactionBoundary,
      'Local-only artifact paths and evidence must be redacted.'
    ]),
    nonAuthorizationBoundary,
    blockedActions: [...new Set(blockedActions.map(sanitize))]
  };
}

function buildNextActions(summary: AiIdeRepairEvidenceBundleSummary): string[] {
  if (summary.boundaryViolations > 0) {
    return [
      'Stop and resolve boundary violations before any maintainer review or target repo repair action.'
    ];
  }

  if (summary.verifiedItems > 0) {
    return [
      'Maintainer review may inspect the execution evidence report before any separate target repo merge or release action.',
      'Regenerate this bundle manifest if any source artifact changes.'
    ];
  }

  if (summary.approvedExecutionItems > 0) {
    return [
      'Collect local execution evidence for approved manual repair candidates, then regenerate the execution evidence report and bundle manifest.'
    ];
  }

  return [
    'Review the decision package and approval receipt before any separate target repo repair goal.'
  ];
}

function readingOrderReason(artifactKind: AiIdeRepairEvidenceBundleArtifactKind): string {
  switch (artifactKind) {
    case 'ai_ide_repair_playbook':
      return 'Understand campaign context, target matrix, action queue, and required read order.';
    case 'ai_ide_playbook_consumption_report':
      return 'Confirm AI IDE dry-run understanding, target handling, blocked actions, and maintainer review boundary.';
    case 'ai_ide_repair_decision_package':
      return 'Review repair decision type, required approval, and manual repair candidate classification.';
    case 'ai_ide_repair_approval_receipt':
      return 'Confirm maintainer decisions before narrowing any item into an approved execution plan.';
    case 'ai_ide_approved_repair_execution_plan':
      return 'Read approved manual repair candidates, read-order paths, verification checklist, and blocked actions.';
    case 'ai_ide_repair_execution_evidence_report':
      return 'Confirm execution evidence, read-order compliance, verification results, and boundary report before maintainer review.';
  }
}

function classifyCurrentStatus(input: {
  missingArtifacts: number;
  verifiedItems: number;
  boundaryViolations: number;
  approvedExecutionItems: number;
}): AiIdeRepairEvidenceBundleStatus {
  if (input.missingArtifacts > 0 || input.boundaryViolations > 0) {
    return 'blocked_or_failed';
  }

  if (input.verifiedItems > 0) {
    return 'verified_pending_maintainer_review';
  }

  if (input.approvedExecutionItems > 0) {
    return 'approved_plan_pending_evidence';
  }

  return 'review_required';
}

function artifactParsed(
  artifacts: ParsedBundleArtifact[],
  artifactKind: AiIdeRepairEvidenceBundleArtifactKind
): Record<string, unknown> {
  return artifacts.find((artifact) => artifact.artifactKind === artifactKind)?.parsed ?? {};
}

function nestedRecord(value: Record<string, unknown>, field: string): Record<string, unknown> {
  const nested = value[field];

  return nested !== null && typeof nested === 'object' && !Array.isArray(nested)
    ? nested as Record<string, unknown>
    : {};
}

function stringField(value: unknown, fallback: string): string {
  return typeof value === 'string' ? sanitize(value) : fallback;
}

function numberField(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function stringArrayField(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function firstString(values: unknown[]): string {
  const found = values.find((value) => typeof value === 'string' && value.trim().length > 0);

  return typeof found === 'string' ? sanitize(found) : '';
}

function sanitize(value: string): string {
  return redactSensitiveText(value).replace(/\s+/gu, ' ').trim();
}

function sanitizePath(value: string): string {
  return value
    .replaceAll('\\', '/')
    .split('/')
    .map((segment) => sanitize(segment))
    .join('/');
}
