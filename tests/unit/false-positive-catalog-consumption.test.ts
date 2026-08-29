import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  runFalsePositiveRegressionCatalogArtifacts
} from '../../packages/acceptance/src/run-false-positive-catalog.js';
import {
  formatFalsePositiveRegressionCatalogConsumptionMarkdown,
  parseFalsePositiveRegressionCatalogConsumptionArgs,
  runFalsePositiveRegressionCatalogConsumptionValidation,
  validateFalsePositiveRegressionCatalogConsumptionArtifacts
} from '../../packages/acceptance/src/run-false-positive-catalog-consumption.js';

const generatedAt = '2026-07-22T00:00:00.000+08:00';

describe('false-positive regression catalog consumption validation', () => {
  it('validates generated JSON and Markdown consumption in the documented read order', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'repoassure-fp-catalog-consumption-'));

    try {
      const generated = await runFalsePositiveRegressionCatalogArtifacts({
        outputDir,
        generatedAt
      });
      const report = await validateFalsePositiveRegressionCatalogConsumptionArtifacts({
        catalogJsonPath: generated.catalogJsonPath,
        catalogMarkdownPath: generated.catalogMarkdownPath,
        generatedAt
      });

      expect(report.schema).toBe('repoassure.false-positive-regression-catalog-consumption-validation@1');
      expect(report.status).toBe('passed');
      expect(report.readOrder).toEqual([
        generated.catalogJsonPath,
        generated.catalogMarkdownPath
      ]);
      expect(report.consumption.aiIdeCanConsume).toBe(true);
      expect(report.consumption.maintainerCanReview).toBe(true);
      expect(report.consumption.fixtureCategoriesCovered).toEqual(expect.arrayContaining([
        'browser_hardening_findings',
        'project_intelligence_findings',
        'security_assurance_findings',
        'repair_planner_consumption',
        'mixed_run_bundle_regressions',
        'real_world_fixture_regressions'
      ]));
      expect(report.consumption.expectedSnapshotFields).toEqual(expect.arrayContaining([
        'finding_id',
        'source_fixture',
        'severity',
        'expected_classification',
        'maintainer_decision',
        'regression_commands'
      ]));
      expect(report.consumption.reviewFields).toEqual(expect.arrayContaining([
        'false_positive_risk',
        'rationale',
        'maintainer_decision',
        'accepted_risk_notes'
      ]));
      expect(report.boundary.targetRepoWrites).toBe(false);
      expect(report.boundary.runtimeDetectionBehaviorChange).toBe(false);
      expect(report.boundary.findingSuppression).toBe(false);
      expect(report.boundary.automaticSeverityDowngrade).toBe(false);
      expect(report.boundary.prohibitedContentPresent).toBe(false);
      expect(report.checks.every((check) => check.status === 'passed')).toBe(true);
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });

  it('writes local validation JSON and Markdown without authorizing target repo writes', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'repoassure-fp-catalog-consumption-run-'));

    try {
      const generated = await runFalsePositiveRegressionCatalogArtifacts({
        outputDir,
        generatedAt
      });
      const result = await runFalsePositiveRegressionCatalogConsumptionValidation({
        catalogJsonPath: generated.catalogJsonPath,
        catalogMarkdownPath: generated.catalogMarkdownPath,
        outputDir,
        generatedAt
      });

      expect(result.validationPassed).toBe(true);
      expect(result.validationJsonPath.startsWith(outputDir)).toBe(true);
      expect(result.validationMarkdownPath.startsWith(outputDir)).toBe(true);

      const [rawJson, markdown] = await Promise.all([
        readFile(result.validationJsonPath, 'utf8'),
        readFile(result.validationMarkdownPath, 'utf8')
      ]);
      const parsed = JSON.parse(rawJson) as Awaited<ReturnType<typeof validateFalsePositiveRegressionCatalogConsumptionArtifacts>>;

      expect(parsed.status).toBe('passed');
      expect(parsed.boundary.targetRepoWrites).toBe(false);
      expect(parsed.boundary.runtimeDetectionBehaviorChange).toBe(false);
      expect(markdown).toContain('# False-Positive Regression Catalog Consumption Validation');
      expect(markdown).toContain('Status: passed');
      expect(markdown).toContain('## AI IDE Read Order');
      expect(markdown).toContain('## Maintainer Review Boundary');
      expect(markdown).toContain('Target repo writes: no');
      expect(markdown).not.toMatch(/sk-live-|ghp_|AKIA|BEGIN PRIVATE KEY/u);
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });

  it('fails closed when Markdown no longer exposes the maintainer review boundary', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'repoassure-fp-catalog-consumption-fail-'));

    try {
      const generated = await runFalsePositiveRegressionCatalogArtifacts({
        outputDir,
        generatedAt
      });
      const brokenMarkdownPath = join(outputDir, 'broken-catalog.md');
      await writeFile(brokenMarkdownPath, '# Broken Catalog\n\nNo review boundary here.\n');

      const report = await validateFalsePositiveRegressionCatalogConsumptionArtifacts({
        catalogJsonPath: generated.catalogJsonPath,
        catalogMarkdownPath: brokenMarkdownPath,
        generatedAt
      });

      expect(report.status).toBe('failed');
      expect(report.checks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: 'markdown_maintainer_review_boundary',
          status: 'failed'
        })
      ]));
      expect(report.boundary.targetRepoWrites).toBe(false);
      expect(report.boundary.runtimeDetectionBehaviorChange).toBe(false);
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });

  it('formats Markdown for AI IDE and maintainer consumption', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'repoassure-fp-catalog-consumption-md-'));

    try {
      const generated = await runFalsePositiveRegressionCatalogArtifacts({
        outputDir,
        generatedAt
      });
      const report = await validateFalsePositiveRegressionCatalogConsumptionArtifacts({
        catalogJsonPath: generated.catalogJsonPath,
        catalogMarkdownPath: generated.catalogMarkdownPath,
        generatedAt
      });
      const markdown = formatFalsePositiveRegressionCatalogConsumptionMarkdown(report);

      expect(markdown).toContain('# False-Positive Regression Catalog Consumption Validation');
      expect(markdown).toContain('Status: passed');
      expect(markdown).toContain('1. `');
      expect(markdown).toContain('false-positive-regression-catalog.json');
      expect(markdown).toContain('2. `');
      expect(markdown).toContain('false-positive-regression-catalog.md');
      expect(markdown).toContain('No finding suppression');
      expect(markdown).toContain('No automatic severity downgrade');
      expect(markdown).toContain('mixed_run_bundle_regressions');
      expect(markdown).toContain('real_world_fixture_regressions');
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });

  it('parses CLI options and ignores the pnpm argument separator', () => {
    expect(parseFalsePositiveRegressionCatalogConsumptionArgs([
      '--',
      '--catalog-json',
      'artifacts/project-graph/false-positive-regression-catalog.json',
      '--catalog-md',
      'artifacts/project-graph/false-positive-regression-catalog.md',
      '--output',
      'artifacts/project-graph',
      '--generated-at',
      generatedAt
    ])).toEqual({
      catalogJsonPath: 'artifacts/project-graph/false-positive-regression-catalog.json',
      catalogMarkdownPath: 'artifacts/project-graph/false-positive-regression-catalog.md',
      outputDir: 'artifacts/project-graph',
      generatedAt
    });
  });
});
