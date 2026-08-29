import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  buildFalsePositiveRegressionCatalogArtifactBundle,
  formatFalsePositiveRegressionCatalogMarkdown,
  parseFalsePositiveRegressionCatalogArgs,
  runFalsePositiveRegressionCatalogArtifacts
} from '../../packages/acceptance/src/run-false-positive-catalog.js';

const generatedAt = '2026-07-22T00:00:00.000+08:00';

describe('false-positive regression catalog artifact generation', () => {
  it('builds a local-only artifact bundle for maintainer and AI IDE consumption', () => {
    const bundle = buildFalsePositiveRegressionCatalogArtifactBundle({
      outputDir: 'artifacts/project-graph',
      generatedAt
    });

    expect(bundle.schema).toBe('repoassure.false-positive-regression-catalog-artifacts@1');
    expect(bundle.generatedAt).toBe(generatedAt);
    expect(bundle.readOrder).toEqual([
      'artifacts/project-graph/false-positive-regression-catalog.json',
      'artifacts/project-graph/false-positive-regression-catalog.md'
    ]);
    expect(bundle.artifacts.catalogJson).toEqual({
      path: 'artifacts/project-graph/false-positive-regression-catalog.json',
      status: 'generated',
      schema: 'repoassure.false-positive-regression-catalog@1'
    });
    expect(bundle.artifacts.catalogMarkdown).toEqual({
      path: 'artifacts/project-graph/false-positive-regression-catalog.md',
      status: 'generated'
    });
    expect(bundle.catalog.entries.length).toBeGreaterThanOrEqual(7);
    expect(bundle.catalog.entries).toEqual(expect.arrayContaining([
      expect.objectContaining({
        findingId: 'real-fixture:react-disabled-save-control',
        fixtureCategory: 'real_world_fixture_regressions',
        fixtureOrigin: 'near_real_public_fixture',
        privacy: {
          nonPrivate: true,
          sourceCodeIncluded: false,
          secretsIncluded: false
        }
      }),
      expect.objectContaining({
        findingId: 'real-fixture:vite-auth-redirect-route',
        fixtureCategory: 'real_world_fixture_regressions',
        fixtureOrigin: 'near_real_public_fixture',
        privacy: {
          nonPrivate: true,
          sourceCodeIncluded: false,
          secretsIncluded: false
        }
      })
    ]));
    expect(bundle.validation.passed).toBe(true);
    expect(bundle.validation.redaction.prohibitedContentPresent).toBe(false);
    expect(bundle.boundary).toEqual(expect.objectContaining({
      localOnly: true,
      targetRepoWriteAuthorized: false,
      runtimeDetectionBehaviorChange: false,
      findingSuppression: false,
      automaticSeverityDowngrade: false,
      hostedDashboardImplemented: false,
      telemetryEnabled: false,
      cloudSyncEnabled: false
    }));
    expect(bundle.boundary.prohibitedActions).toEqual(expect.arrayContaining([
      'runtime_detection_behavior_change',
      'finding_suppression',
      'automatic_severity_downgrade',
      'target_repo_write'
    ]));
    expect(bundle.aiIdeConsumption.maintainerReviewBoundary.allowedActions).toEqual([
      'review expected snapshots',
      'approve fixture classification',
      'reject fixture classification',
      'defer fixture classification',
      'accept risk with notes'
    ]);
    expect(bundle.aiIdeConsumption.maintainerReviewBoundary.prohibitedActions).toEqual(
      expect.arrayContaining(['suppress findings', 'downgrade severity automatically', 'write target repository'])
    );
  });

  it('formats Markdown with read order, review boundary, entries, and redaction metadata', () => {
    const bundle = buildFalsePositiveRegressionCatalogArtifactBundle({
      outputDir: 'artifacts/project-graph',
      generatedAt
    });
    const markdown = formatFalsePositiveRegressionCatalogMarkdown(bundle);

    expect(markdown).toContain('# False-Positive Regression Catalog Artifacts');
    expect(markdown).toContain('Generated at: 2026-07-22T00:00:00.000+08:00');
    expect(markdown).toContain('## AI IDE Read Order');
    expect(markdown).toContain('1. `artifacts/project-graph/false-positive-regression-catalog.json`');
    expect(markdown).toContain('2. `artifacts/project-graph/false-positive-regression-catalog.md`');
    expect(markdown).toContain('## Maintainer Review Boundary');
    expect(markdown).toContain('No runtime detection behavior change');
    expect(markdown).toContain('No finding suppression');
    expect(markdown).toContain('No automatic severity downgrade');
    expect(markdown).toContain('## Fixture Categories');
    expect(markdown).toContain('browser_hardening_findings');
    expect(markdown).toContain('mixed_run_bundle_regressions');
    expect(markdown).toContain('real_world_fixture_regressions');
    expect(markdown).toContain('## Expected Finding Snapshots');
    expect(markdown).toContain('browser:dead-control-save-button');
    expect(markdown).toContain('mixed-run-bundle:conflicting-status-review-required');
    expect(markdown).toContain('real-fixture:react-disabled-save-control');
    expect(markdown).toContain('near_real_public_fixture');
    expect(markdown).toContain('## Redaction');
    expect(markdown).not.toMatch(/sk-live-|ghp_|AKIA|BEGIN PRIVATE KEY/u);
  });

  it('writes generated JSON and Markdown only to the requested local artifact directory', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'repoassure-fp-catalog-'));

    try {
      const result = await runFalsePositiveRegressionCatalogArtifacts({
        outputDir,
        generatedAt
      });

      expect(result.catalogJsonPath.startsWith(outputDir)).toBe(true);
      expect(result.catalogMarkdownPath.startsWith(outputDir)).toBe(true);
      expect(result.entryCount).toBeGreaterThanOrEqual(7);
      expect(result.validationPassed).toBe(true);

      const [rawJson, markdown] = await Promise.all([
        readFile(result.catalogJsonPath, 'utf8'),
        readFile(result.catalogMarkdownPath, 'utf8')
      ]);
      const parsed = JSON.parse(rawJson) as ReturnType<typeof buildFalsePositiveRegressionCatalogArtifactBundle>;

      expect(parsed.schema).toBe('repoassure.false-positive-regression-catalog-artifacts@1');
      expect(parsed.boundary.targetRepoWriteAuthorized).toBe(false);
      expect(parsed.boundary.runtimeDetectionBehaviorChange).toBe(false);
      expect(parsed.boundary.findingSuppression).toBe(false);
      expect(parsed.validation.redaction.prohibitedContentPresent).toBe(false);
      expect(markdown).toContain('False-Positive Regression Catalog Artifacts');
      expect(markdown).toContain('Target repo writes: no');
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });

  it('parses CLI options without authorizing target repo writes', () => {
    expect(parseFalsePositiveRegressionCatalogArgs([
      '--',
      '--output',
      'artifacts/project-graph',
      '--generated-at',
      generatedAt
    ])).toEqual({
      outputDir: 'artifacts/project-graph',
      generatedAt
    });
  });
});
