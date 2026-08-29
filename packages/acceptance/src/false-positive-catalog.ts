export type FalsePositiveRegressionCatalogFixtureCategory =
  | 'browser_hardening_findings'
  | 'project_intelligence_findings'
  | 'security_assurance_findings'
  | 'repair_planner_consumption'
  | 'mixed_run_bundle_regressions'
  | 'real_world_fixture_regressions';

export type FalsePositiveExpectedClassification =
  | 'true_positive'
  | 'false_positive_candidate'
  | 'needs_maintainer_review';

export type FalsePositiveMaintainerDecision =
  | 'pending'
  | 'approve'
  | 'defer'
  | 'accept_risk'
  | 'revise_fixture';

export type FalsePositiveRisk = 'low' | 'medium' | 'high';

export type FalsePositiveFixtureOrigin =
  | 'synthetic_baseline'
  | 'near_real_public_fixture'
  | 'real_public_fixture';

export interface FalsePositiveRegressionCatalogBoundary {
  readonly localOnly: true;
  readonly runtimeDetectionBehaviorChange: false;
  readonly findingSuppression: false;
  readonly automaticSeverityDowngrade: false;
  readonly targetRepoWrites: false;
  readonly hostedDashboard: false;
  readonly telemetry: false;
  readonly cloudSync: false;
}

export interface FalsePositiveRegressionCatalogContract {
  readonly schemaVersion: 1;
  readonly fixtureCategories: readonly FalsePositiveRegressionCatalogFixtureCategory[];
  readonly expectedSnapshotFields: readonly string[];
  readonly reviewFields: readonly string[];
  readonly boundary: FalsePositiveRegressionCatalogBoundary;
  readonly prohibitedActions: readonly string[];
}

export interface FalsePositiveExpectedFindingSnapshot {
  readonly finding_id: string;
  readonly source_fixture: string;
  readonly category: string;
  readonly type?: string;
  readonly severity: string;
  readonly path?: string;
  readonly evidence: readonly string[];
  readonly expected_classification: FalsePositiveExpectedClassification;
  readonly false_positive_risk: FalsePositiveRisk;
  readonly rationale: string;
  readonly maintainer_decision: FalsePositiveMaintainerDecision;
  readonly accepted_risk_notes: string | null;
  readonly regression_commands: readonly string[];
}

export interface FalsePositiveRegressionCatalogReview {
  readonly falsePositiveRisk: FalsePositiveRisk;
  readonly rationale: string;
  readonly maintainerDecision: FalsePositiveMaintainerDecision;
  readonly acceptedRiskNotes: string | null;
  readonly ownerNotes?: string;
}

export interface FalsePositiveRegressionCatalogPrivacy {
  readonly nonPrivate: true;
  readonly sourceCodeIncluded: false;
  readonly secretsIncluded: false;
}

export interface FalsePositiveRegressionCatalogEntry {
  readonly findingId: string;
  readonly fixtureCategory: FalsePositiveRegressionCatalogFixtureCategory;
  readonly sourceFixture: string;
  readonly fixtureOrigin: FalsePositiveFixtureOrigin;
  readonly privacy: FalsePositiveRegressionCatalogPrivacy;
  readonly expectedSnapshot: FalsePositiveExpectedFindingSnapshot;
  readonly review: FalsePositiveRegressionCatalogReview;
}

export interface FalsePositiveRegressionCatalog {
  readonly schemaVersion: 1;
  readonly generatedAt: string;
  readonly contract: FalsePositiveRegressionCatalogContract;
  readonly boundary: FalsePositiveRegressionCatalogBoundary;
  readonly entries: readonly FalsePositiveRegressionCatalogEntry[];
}

export interface BuildFalsePositiveRegressionCatalogInput {
  readonly generatedAt: string;
}

export interface FalsePositiveRegressionCatalogValidation {
  readonly passed: boolean;
  readonly errors: readonly string[];
  readonly coveredFixtureCategories: readonly FalsePositiveRegressionCatalogFixtureCategory[];
  readonly redaction: {
    readonly prohibitedContentPresent: boolean;
  };
  readonly boundary: {
    readonly targetRepoWrites: boolean;
    readonly runtimeDetectionBehaviorChange: boolean;
  };
}

const requiredExpectedSnapshotFields = [
  'finding_id',
  'source_fixture',
  'category',
  'type',
  'severity',
  'path',
  'evidence',
  'expected_classification',
  'false_positive_risk',
  'rationale',
  'maintainer_decision',
  'accepted_risk_notes',
  'regression_commands',
  'fixture_origin',
  'privacy_non_private',
  'privacy_source_code_included',
  'privacy_secrets_included'
] as const;

const requiredReviewFields = [
  'false_positive_risk',
  'rationale',
  'maintainer_decision',
  'accepted_risk_notes',
  'owner_notes'
] as const;

const requiredFixtureCategories = [
  'browser_hardening_findings',
  'project_intelligence_findings',
  'security_assurance_findings',
  'repair_planner_consumption',
  'mixed_run_bundle_regressions',
  'real_world_fixture_regressions'
] as const;

export const falsePositiveRegressionCatalogContract: FalsePositiveRegressionCatalogContract = {
  schemaVersion: 1,
  fixtureCategories: requiredFixtureCategories,
  expectedSnapshotFields: requiredExpectedSnapshotFields,
  reviewFields: requiredReviewFields,
  boundary: {
    localOnly: true,
    runtimeDetectionBehaviorChange: false,
    findingSuppression: false,
    automaticSeverityDowngrade: false,
    targetRepoWrites: false,
    hostedDashboard: false,
    telemetry: false,
    cloudSync: false
  },
  prohibitedActions: [
    'runtime_detection_behavior_change',
    'finding_suppression',
    'automatic_severity_downgrade',
    'target_repo_write',
    'hosted_dashboard',
    'telemetry',
    'cloud_sync',
    'deployment',
    'public_release'
  ]
};

const defaultEntries: readonly FalsePositiveRegressionCatalogEntry[] = [
  buildEntry({
    findingId: 'browser:dead-control-save-button',
    fixtureCategory: 'browser_hardening_findings',
    sourceFixture: 'fixtures/false-positive-catalog/browser/dead-control-save-button.json',
    category: 'browser_hardening',
    type: 'dead_control',
    severity: 'P1',
    path: '/settings',
    evidence: ['Save button click timed out after 1000ms in a local browser exploration fixture.'],
    expectedClassification: 'true_positive',
    falsePositiveRisk: 'medium',
    rationale: 'The fixture keeps the control visible and enabled while omitting a successful post-click state, so the finding should remain actionable until reviewed.',
    regressionCommands: ['pnpm vitest run tests/unit/false-positive-catalog.test.ts']
  }),
  buildEntry({
    findingId: 'project-intelligence:orphan-code-nested-readme',
    fixtureCategory: 'project_intelligence_findings',
    sourceFixture: 'fixtures/false-positive-catalog/project-intelligence/nested-readme.json',
    category: 'orphan_code',
    severity: 'medium',
    path: 'apps/nested-readme',
    evidence: ['apps/nested-readme/docs/README.md exists, but apps/nested-readme/README.md is absent.'],
    expectedClassification: 'true_positive',
    falsePositiveRisk: 'low',
    rationale: 'The calibrated ownership rule requires the package or app root README, so a nested README should not clear this finding.',
    regressionCommands: ['pnpm vitest run tests/unit/project-intelligence-snapshot.test.ts']
  }),
  buildEntry({
    findingId: 'security-assurance:provider-evidence-redacted-secret',
    fixtureCategory: 'security_assurance_findings',
    sourceFixture: 'fixtures/false-positive-catalog/security/provider-evidence-redacted-secret.json',
    category: 'security_assurance',
    type: 'provider_security_evidence',
    severity: 'P1',
    path: 'security/normalized-findings.json',
    evidence: ['Provider evidence must be redacted before catalog review; synthetic secret token is represented as [REDACTED].'],
    expectedClassification: 'needs_maintainer_review',
    falsePositiveRisk: 'medium',
    rationale: 'Provider-backed security findings need maintainer review because redacted evidence can hide contextual details while still preserving provenance.',
    regressionCommands: ['pnpm vitest run tests/unit/false-positive-catalog.test.ts']
  }),
  buildEntry({
    findingId: 'repair-planner:network-error-repair-intent',
    fixtureCategory: 'repair_planner_consumption',
    sourceFixture: 'fixtures/false-positive-catalog/repair-planner/network-error-repair-intent.json',
    category: 'repair_planner',
    type: 'network_error',
    severity: 'P2',
    path: '.hardening/runs/run-fixed/repair-plan.json',
    evidence: ['A network_error finding should produce a repair task without applying patches or writing target repo files.'],
    expectedClassification: 'true_positive',
    falsePositiveRisk: 'low',
    rationale: 'This fixture verifies downstream consumption of a known finding shape rather than changing the upstream detector.',
    regressionCommands: ['pnpm vitest run tests/unit/repair-plan.test.ts']
  }),
  buildEntry({
    findingId: 'mixed-run-bundle:conflicting-status-review-required',
    fixtureCategory: 'mixed_run_bundle_regressions',
    sourceFixture: 'fixtures/false-positive-catalog/mixed-run-bundles/conflicting-status-review-required.json',
    category: 'mixed_run_bundle',
    type: 'cross_artifact_status_conflict',
    severity: 'P2',
    path: '.hardening/runs/run-fixed/manifest.json',
    evidence: ['A mixed bundle can contain passed acceptance evidence and a blocked repair queue, so the catalog keeps it in maintainer review instead of suppressing it.'],
    expectedClassification: 'needs_maintainer_review',
    falsePositiveRisk: 'high',
    rationale: 'Cross-artifact bundle conflicts are easy to misclassify, so the regression catalog must preserve a maintainer decision boundary.',
    regressionCommands: ['pnpm vitest run tests/unit/false-positive-catalog.test.ts']
  }),
  buildEntry({
    findingId: 'real-fixture:react-disabled-save-control',
    fixtureCategory: 'real_world_fixture_regressions',
    sourceFixture: 'fixtures/false-positive-catalog/real-world/react-disabled-save-control.json',
    fixtureOrigin: 'near_real_public_fixture',
    category: 'browser_hardening',
    type: 'conditional_dead_control',
    severity: 'P2',
    path: 'examples/public-react-settings/src/SettingsForm.tsx',
    evidence: [
      'A near-real public fixture disables Save until the form becomes dirty, so a dead-control finding can be a false-positive candidate.'
    ],
    expectedClassification: 'false_positive_candidate',
    falsePositiveRisk: 'medium',
    rationale: 'The near-real public fixture models a common React settings form where disabled state is intentional, so calibration must preserve maintainer review instead of suppressing the detector.',
    regressionCommands: ['pnpm vitest run tests/unit/false-positive-catalog.test.ts']
  }),
  buildEntry({
    findingId: 'real-fixture:vite-auth-redirect-route',
    fixtureCategory: 'real_world_fixture_regressions',
    sourceFixture: 'fixtures/false-positive-catalog/real-world/vite-auth-redirect-route.json',
    fixtureOrigin: 'near_real_public_fixture',
    category: 'browser_hardening',
    type: 'auth_redirect_route',
    severity: 'P2',
    path: 'examples/public-vite-auth/src/routes/admin.tsx',
    evidence: [
      'A near-real public fixture redirects unauthenticated users before the protected route renders, so an unreachable-page finding needs maintainer review.'
    ],
    expectedClassification: 'needs_maintainer_review',
    falsePositiveRisk: 'medium',
    rationale: 'The near-real public fixture represents a normal authenticated route boundary, so the catalog should capture review context without changing route or browser detectors.',
    regressionCommands: ['pnpm vitest run tests/unit/false-positive-catalog.test.ts']
  })
];

export function buildFalsePositiveRegressionCatalog(
  input: BuildFalsePositiveRegressionCatalogInput
): FalsePositiveRegressionCatalog {
  return {
    schemaVersion: 1,
    generatedAt: input.generatedAt,
    contract: falsePositiveRegressionCatalogContract,
    boundary: falsePositiveRegressionCatalogContract.boundary,
    entries: defaultEntries
  };
}

export function validateFalsePositiveRegressionCatalog(
  catalog: FalsePositiveRegressionCatalog
): FalsePositiveRegressionCatalogValidation {
  const errors: string[] = [];
  const coveredFixtureCategories = [...new Set(catalog.entries.map((entry) => entry.fixtureCategory))];

  for (const category of requiredFixtureCategories) {
    if (!coveredFixtureCategories.includes(category)) {
      errors.push(`Missing fixture category: ${category}`);
    }
  }

  for (const entry of catalog.entries) {
    validateEntry(entry, errors);
  }

  if (catalog.boundary.targetRepoWrites !== false) {
    errors.push('Catalog boundary must not allow target repo writes.');
  }

  if (catalog.boundary.runtimeDetectionBehaviorChange !== false) {
    errors.push('Catalog boundary must not change runtime detection behavior.');
  }

  const serialized = JSON.stringify(catalog);
  const prohibitedContentPresent = /sk-live-|ghp_|AKIA|BEGIN PRIVATE KEY/u.test(serialized);
  if (prohibitedContentPresent) {
    errors.push('Catalog contains prohibited secret-like content.');
  }

  return {
    passed: errors.length === 0,
    errors,
    coveredFixtureCategories,
    redaction: {
      prohibitedContentPresent
    },
    boundary: {
      targetRepoWrites: catalog.boundary.targetRepoWrites,
      runtimeDetectionBehaviorChange: catalog.boundary.runtimeDetectionBehaviorChange
    }
  };
}

function buildEntry(input: {
  readonly findingId: string;
  readonly fixtureCategory: FalsePositiveRegressionCatalogFixtureCategory;
  readonly sourceFixture: string;
  readonly fixtureOrigin?: FalsePositiveFixtureOrigin;
  readonly category: string;
  readonly type?: string;
  readonly severity: string;
  readonly path: string;
  readonly evidence: readonly string[];
  readonly expectedClassification: FalsePositiveExpectedClassification;
  readonly falsePositiveRisk: FalsePositiveRisk;
  readonly rationale: string;
  readonly regressionCommands: readonly string[];
}): FalsePositiveRegressionCatalogEntry {
  const fixtureOrigin = input.fixtureOrigin ?? 'synthetic_baseline';
  const privacy: FalsePositiveRegressionCatalogPrivacy = {
    nonPrivate: true,
    sourceCodeIncluded: false,
    secretsIncluded: false
  };
  const expectedSnapshot: FalsePositiveExpectedFindingSnapshot = {
    finding_id: input.findingId,
    source_fixture: input.sourceFixture,
    category: input.category,
    severity: input.severity,
    evidence: input.evidence,
    expected_classification: input.expectedClassification,
    false_positive_risk: input.falsePositiveRisk,
    rationale: input.rationale,
    maintainer_decision: 'pending',
    accepted_risk_notes: null,
    regression_commands: input.regressionCommands,
    ...(input.type === undefined ? {} : { type: input.type }),
    ...(input.path === undefined ? {} : { path: input.path })
  };

  return {
    findingId: input.findingId,
    fixtureCategory: input.fixtureCategory,
    sourceFixture: input.sourceFixture,
    fixtureOrigin,
    privacy,
    expectedSnapshot,
    review: {
      falsePositiveRisk: input.falsePositiveRisk,
      rationale: input.rationale,
      maintainerDecision: 'pending',
      acceptedRiskNotes: null
    }
  };
}

function validateEntry(entry: FalsePositiveRegressionCatalogEntry, errors: string[]): void {
  if (!entry.findingId) {
    errors.push('Catalog entry missing findingId.');
  }

  if (!entry.sourceFixture.startsWith('fixtures/')) {
    errors.push(`Catalog entry ${entry.findingId} sourceFixture must be under fixtures/.`);
  }

  if (entry.expectedSnapshot.finding_id !== entry.findingId) {
    errors.push(`Catalog entry ${entry.findingId} finding_id mismatch.`);
  }

  if (entry.expectedSnapshot.source_fixture !== entry.sourceFixture) {
    errors.push(`Catalog entry ${entry.findingId} source_fixture mismatch.`);
  }

  if (entry.review.maintainerDecision !== 'pending') {
    errors.push(`Catalog entry ${entry.findingId} must start with pending maintainer decision.`);
  }

  if (entry.review.rationale.trim().length < 20) {
    errors.push(`Catalog entry ${entry.findingId} rationale is too short.`);
  }

  if (entry.privacy.nonPrivate !== true) {
    errors.push(`Catalog entry ${entry.findingId} must be marked non-private.`);
  }

  if (entry.privacy.sourceCodeIncluded !== false) {
    errors.push(`Catalog entry ${entry.findingId} must not include source code.`);
  }

  if (entry.privacy.secretsIncluded !== false) {
    errors.push(`Catalog entry ${entry.findingId} must not include secrets.`);
  }

  if (
    entry.fixtureCategory === 'real_world_fixture_regressions'
    && entry.fixtureOrigin !== 'near_real_public_fixture'
    && entry.fixtureOrigin !== 'real_public_fixture'
  ) {
    errors.push(`Catalog entry ${entry.findingId} real-world fixture origin must be public.`);
  }
}
