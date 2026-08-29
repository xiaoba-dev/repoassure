import {
  buildFalsePositiveRegressionCatalog,
  falsePositiveRegressionCatalogContract,
  validateFalsePositiveRegressionCatalog
} from '../../packages/acceptance/src/false-positive-catalog.js';

describe('false-positive regression catalog contract', () => {
  it('defines the local-only catalog boundary and required fixture categories', () => {
    expect(falsePositiveRegressionCatalogContract.schemaVersion).toBe(1);
    expect(falsePositiveRegressionCatalogContract.boundary).toEqual({
      localOnly: true,
      runtimeDetectionBehaviorChange: false,
      findingSuppression: false,
      automaticSeverityDowngrade: false,
      targetRepoWrites: false,
      hostedDashboard: false,
      telemetry: false,
      cloudSync: false
    });
    expect(falsePositiveRegressionCatalogContract.fixtureCategories).toEqual(expect.arrayContaining([
      'browser_hardening_findings',
      'project_intelligence_findings',
      'security_assurance_findings',
      'repair_planner_consumption',
      'mixed_run_bundle_regressions',
      'real_world_fixture_regressions'
    ]));
    expect(falsePositiveRegressionCatalogContract.expectedSnapshotFields).toEqual(expect.arrayContaining([
      'finding_id',
      'source_fixture',
      'category',
      'severity',
      'expected_classification',
      'rationale',
      'maintainer_decision',
      'fixture_origin',
      'privacy_non_private',
      'privacy_source_code_included',
      'privacy_secrets_included'
    ]));
    expect(falsePositiveRegressionCatalogContract.reviewFields).toEqual(expect.arrayContaining([
      'false_positive_risk',
      'rationale',
      'maintainer_decision',
      'accepted_risk_notes'
    ]));
  });

  it('builds representative expected finding snapshots without changing detection behavior', () => {
    const catalog = buildFalsePositiveRegressionCatalog({
      generatedAt: '2026-07-22T00:00:00.000+08:00'
    });

    expect(catalog.schemaVersion).toBe(1);
    expect(catalog.generatedAt).toBe('2026-07-22T00:00:00.000+08:00');
    expect(catalog.boundary.runtimeDetectionBehaviorChange).toBe(false);
    expect(catalog.boundary.targetRepoWrites).toBe(false);
    expect(catalog.entries.map((entry) => entry.fixtureCategory)).toEqual(expect.arrayContaining([
      'browser_hardening_findings',
      'project_intelligence_findings',
      'security_assurance_findings',
      'repair_planner_consumption',
      'mixed_run_bundle_regressions',
      'real_world_fixture_regressions'
    ]));

    for (const entry of catalog.entries) {
      expect(entry.findingId.length).toBeGreaterThan(0);
      expect(entry.sourceFixture).toMatch(/^fixtures\//u);
      expect(entry.expectedSnapshot).toEqual(expect.objectContaining({
        finding_id: entry.findingId,
        source_fixture: entry.sourceFixture,
        category: expect.any(String),
        severity: expect.any(String),
        expected_classification: expect.stringMatching(/^(true_positive|false_positive_candidate|needs_maintainer_review)$/u),
        rationale: expect.any(String),
        maintainer_decision: expect.stringMatching(/^(pending|approve|defer|accept_risk|revise_fixture)$/u)
      }));
      expect(entry.review.falsePositiveRisk).toMatch(/^(low|medium|high)$/u);
      expect(entry.review.rationale.length).toBeGreaterThan(20);
      expect(entry.review.maintainerDecision).toBe('pending');
      expect(entry.fixtureOrigin).toMatch(/^(synthetic_baseline|near_real_public_fixture|real_public_fixture)$/u);
      expect(entry.privacy).toEqual(expect.objectContaining({
        nonPrivate: true,
        sourceCodeIncluded: false,
        secretsIncluded: false
      }));
    }
  });

  it('includes near-real public fixture candidates without authorizing detector changes', () => {
    const catalog = buildFalsePositiveRegressionCatalog({
      generatedAt: '2026-07-22T00:00:00.000+08:00'
    });
    const nearRealEntries = catalog.entries.filter((entry) => (
      entry.fixtureCategory === 'real_world_fixture_regressions'
    ));

    expect(nearRealEntries.length).toBeGreaterThanOrEqual(2);

    for (const entry of nearRealEntries) {
      expect(entry.fixtureOrigin).toBe('near_real_public_fixture');
      expect(entry.privacy).toEqual({
        nonPrivate: true,
        sourceCodeIncluded: false,
        secretsIncluded: false
      });
      expect(entry.sourceFixture).toMatch(/^fixtures\/false-positive-catalog\/real-world\//u);
      expect(entry.expectedSnapshot.expected_classification).toMatch(
        /^(false_positive_candidate|needs_maintainer_review)$/u
      );
      expect(`${entry.expectedSnapshot.evidence} ${entry.expectedSnapshot.rationale} ${entry.review.rationale}`)
        .toMatch(/near-real public fixture/u);
      expect(entry.expectedSnapshot.regression_commands).toEqual(expect.arrayContaining([
        'pnpm vitest run tests/unit/false-positive-catalog.test.ts'
      ]));
    }

    expect(catalog.boundary.runtimeDetectionBehaviorChange).toBe(false);
    expect(catalog.boundary.findingSuppression).toBe(false);
    expect(catalog.boundary.automaticSeverityDowngrade).toBe(false);
    expect(catalog.boundary.targetRepoWrites).toBe(false);
  });

  it('validates catalog shape, redaction, and no target repo write boundary', () => {
    const catalog = buildFalsePositiveRegressionCatalog({
      generatedAt: '2026-07-22T00:00:00.000+08:00'
    });
    const validation = validateFalsePositiveRegressionCatalog(catalog);

    expect(validation.passed).toBe(true);
    expect(validation.errors).toEqual([]);
    expect(validation.coveredFixtureCategories).toEqual(expect.arrayContaining([
      'browser_hardening_findings',
      'project_intelligence_findings',
      'security_assurance_findings',
      'repair_planner_consumption',
      'mixed_run_bundle_regressions',
      'real_world_fixture_regressions'
    ]));
    expect(validation.redaction.prohibitedContentPresent).toBe(false);
    expect(validation.boundary.targetRepoWrites).toBe(false);
    expect(validation.boundary.runtimeDetectionBehaviorChange).toBe(false);
  });
});
