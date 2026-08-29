import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  runFalsePositiveDetectorCalibrationContractArtifacts
} from '../../packages/acceptance/src/run-false-positive-detector-calibration-contract.js';
import {
  formatFalsePositiveDetectorCalibrationContractConsumptionMarkdown,
  parseFalsePositiveDetectorCalibrationContractConsumptionArgs,
  runFalsePositiveDetectorCalibrationContractConsumptionValidation,
  validateFalsePositiveDetectorCalibrationContractConsumptionArtifacts
} from '../../packages/acceptance/src/run-false-positive-detector-calibration-contract-consumption.js';

const generatedAt = '2026-07-23T09:00:00.000+08:00';

describe('false-positive detector calibration contract consumption validation', () => {
  it('validates generated contract JSON and Markdown in the documented AI IDE read order', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'repoassure-fp-calibration-consumption-'));

    try {
      const generated = await runFalsePositiveDetectorCalibrationContractArtifacts({
        outputDir,
        generatedAt
      });
      const report = await validateFalsePositiveDetectorCalibrationContractConsumptionArtifacts({
        contractJsonPath: generated.contractJsonPath,
        contractMarkdownPath: generated.contractMarkdownPath,
        generatedAt
      });

      expect(report.schema).toBe('repoassure.false-positive-detector-calibration-contract-consumption-validation@1');
      expect(report.status).toBe('passed');
      expect(report.readOrder).toEqual([
        generated.contractJsonPath,
        generated.contractMarkdownPath
      ]);
      expect(report.consumption.aiIdeCanConsume).toBe(true);
      expect(report.consumption.maintainerCanReview).toBe(true);
      expect(report.consumption.calibrationQuestionIds).toEqual(expect.arrayContaining([
        'conditional_dead_control_should_consider_form_dirty_prerequisites',
        'auth_redirect_route_should_preserve_maintainer_review_boundary'
      ]));
      expect(report.consumption.manualGates).toEqual(expect.arrayContaining([
        'maintainer_classification_required_before_detector_change',
        'catalog_fixture_privacy_review_required',
        'expected_snapshot_review_required',
        'confidence_threshold_review_required',
        'regression_artifact_review_required'
      ]));
      expect(report.consumption.futureImplementationAuthorization).toEqual(expect.arrayContaining([
        'runtime_detector_change',
        'finding_suppression',
        'automatic_severity_downgrade',
        'detector_confidence_threshold_change',
        'acceptance_policy_change'
      ]));
      expect(report.boundary.runtimeDetectionBehaviorChange).toBe(false);
      expect(report.boundary.findingSuppression).toBe(false);
      expect(report.boundary.automaticSeverityDowngrade).toBe(false);
      expect(report.boundary.targetRepoWrites).toBe(false);
      expect(report.boundary.prohibitedContentPresent).toBe(false);
      expect(report.checks.every((check) => check.status === 'passed')).toBe(true);
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });

  it('writes local validation JSON and Markdown without authorizing detector changes', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'repoassure-fp-calibration-consumption-run-'));

    try {
      const generated = await runFalsePositiveDetectorCalibrationContractArtifacts({
        outputDir,
        generatedAt
      });
      const result = await runFalsePositiveDetectorCalibrationContractConsumptionValidation({
        contractJsonPath: generated.contractJsonPath,
        contractMarkdownPath: generated.contractMarkdownPath,
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
      const parsed = JSON.parse(rawJson) as Awaited<ReturnType<typeof validateFalsePositiveDetectorCalibrationContractConsumptionArtifacts>>;

      expect(parsed.status).toBe('passed');
      expect(parsed.boundary.targetRepoWrites).toBe(false);
      expect(parsed.boundary.runtimeDetectionBehaviorChange).toBe(false);
      expect(markdown).toContain('# False-Positive Detector Calibration Contract Consumption Validation');
      expect(markdown).toContain('Status: passed');
      expect(markdown).toContain('## AI IDE Read Order');
      expect(markdown).toContain('## Maintainer Review Boundary');
      expect(markdown).toContain('## Future Implementation Authorization Required');
      expect(markdown).toContain('Target repo writes: no');
      expect(markdown).not.toMatch(/sk-live-|ghp_|AKIA|BEGIN PRIVATE KEY/u);
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });

  it('fails closed when contract artifacts imply runtime detector behavior changes', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'repoassure-fp-calibration-consumption-fail-'));

    try {
      const generated = await runFalsePositiveDetectorCalibrationContractArtifacts({
        outputDir,
        generatedAt
      });
      const rawJson = await readFile(generated.contractJsonPath, 'utf8');
      const unsafeContract = JSON.parse(rawJson) as Record<string, unknown>;
      unsafeContract.boundary = {
        ...(unsafeContract.boundary as Record<string, unknown>),
        runtimeDetectionBehaviorChange: true
      };
      const unsafeContractPath = join(outputDir, 'unsafe-contract.json');
      await writeFile(unsafeContractPath, `${JSON.stringify(unsafeContract, null, 2)}\n`);

      const report = await validateFalsePositiveDetectorCalibrationContractConsumptionArtifacts({
        contractJsonPath: unsafeContractPath,
        contractMarkdownPath: generated.contractMarkdownPath,
        generatedAt
      });

      expect(report.status).toBe('failed');
      expect(report.checks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: 'boundary_runtime_detection_behavior_change',
          status: 'failed'
        })
      ]));
      expect(report.boundary.targetRepoWrites).toBe(false);
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });

  it('fails closed when Markdown no longer exposes maintainer review boundaries', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'repoassure-fp-calibration-consumption-md-fail-'));

    try {
      const generated = await runFalsePositiveDetectorCalibrationContractArtifacts({
        outputDir,
        generatedAt
      });
      const brokenMarkdownPath = join(outputDir, 'broken-contract.md');
      await writeFile(brokenMarkdownPath, '# Broken Contract\n\nNo review boundary here.\n');

      const report = await validateFalsePositiveDetectorCalibrationContractConsumptionArtifacts({
        contractJsonPath: generated.contractJsonPath,
        contractMarkdownPath: brokenMarkdownPath,
        generatedAt
      });

      expect(report.status).toBe('failed');
      expect(report.checks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: 'markdown_maintainer_review_boundary',
          status: 'failed'
        })
      ]));
      expect(report.boundary.runtimeDetectionBehaviorChange).toBe(false);
      expect(report.boundary.targetRepoWrites).toBe(false);
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });

  it('formats Markdown for AI IDE and maintainer review consumption', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'repoassure-fp-calibration-consumption-format-'));

    try {
      const generated = await runFalsePositiveDetectorCalibrationContractArtifacts({
        outputDir,
        generatedAt
      });
      const report = await validateFalsePositiveDetectorCalibrationContractConsumptionArtifacts({
        contractJsonPath: generated.contractJsonPath,
        contractMarkdownPath: generated.contractMarkdownPath,
        generatedAt
      });
      const markdown = formatFalsePositiveDetectorCalibrationContractConsumptionMarkdown(report);

      expect(markdown).toContain('# False-Positive Detector Calibration Contract Consumption Validation');
      expect(markdown).toContain('Status: passed');
      expect(markdown).toContain('false-positive-detector-calibration-contract.json');
      expect(markdown).toContain('false-positive-detector-calibration-contract.md');
      expect(markdown).toContain('conditional_dead_control_should_consider_form_dirty_prerequisites');
      expect(markdown).toContain('No finding suppression');
      expect(markdown).toContain('No automatic severity downgrade');
      expect(markdown).toContain('No target repo writes');
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });

  it('parses CLI options and ignores the pnpm argument separator', () => {
    expect(parseFalsePositiveDetectorCalibrationContractConsumptionArgs([
      '--',
      '--contract-json',
      'artifacts/project-graph/false-positive-detector-calibration-contract.json',
      '--contract-md',
      'artifacts/project-graph/false-positive-detector-calibration-contract.md',
      '--output',
      'artifacts/project-graph',
      '--generated-at',
      generatedAt
    ])).toEqual({
      contractJsonPath: 'artifacts/project-graph/false-positive-detector-calibration-contract.json',
      contractMarkdownPath: 'artifacts/project-graph/false-positive-detector-calibration-contract.md',
      outputDir: 'artifacts/project-graph',
      generatedAt
    });
  });
});
