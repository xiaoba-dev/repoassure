import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  buildFalsePositiveDetectorCalibrationContract,
  formatFalsePositiveDetectorCalibrationContractMarkdown,
  parseFalsePositiveDetectorCalibrationContractArgs,
  runFalsePositiveDetectorCalibrationContractArtifacts,
  validateFalsePositiveDetectorCalibrationContract
} from '../../packages/acceptance/src/run-false-positive-detector-calibration-contract.js';

const generatedAt = '2026-07-23T08:00:00.000+08:00';

describe('false-positive detector calibration contract artifact generation', () => {
  it('builds a local-only contract from real fixture calibration questions', () => {
    const contract = buildFalsePositiveDetectorCalibrationContract({
      generatedAt,
      outputDir: 'artifacts/project-graph'
    });

    expect(contract.schema).toBe('repoassure.false-positive-detector-calibration-contract@1');
    expect(contract.generatedAt).toBe(generatedAt);
    expect(contract.sourcePlanningRecord).toBe(
      'docs/operations/product-false-positive-regression-catalog-detector-calibration-planning-v0.1.md'
    );
    expect(contract.sourceCatalog.artifacts).toEqual([
      'artifacts/project-graph/false-positive-regression-catalog.json',
      'artifacts/project-graph/false-positive-regression-catalog.md',
      'artifacts/project-graph/false-positive-regression-catalog-consumption-validation.json',
      'artifacts/project-graph/false-positive-regression-catalog-consumption-validation.md'
    ]);
    expect(contract.readOrder).toEqual([
      'docs/operations/product-false-positive-regression-catalog-detector-calibration-planning-v0.1.md',
      'artifacts/project-graph/false-positive-regression-catalog.json',
      'artifacts/project-graph/false-positive-regression-catalog-consumption-validation.json',
      'artifacts/project-graph/false-positive-detector-calibration-contract.json',
      'artifacts/project-graph/false-positive-detector-calibration-contract.md'
    ]);
    expect(contract.calibrationQuestions).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'conditional_dead_control_should_consider_form_dirty_prerequisites',
        fixtureId: 'real-fixture:react-disabled-save-control',
        detectorArea: 'conditional_dead_control',
        requiredMaintainerDecision: true,
        proposedAction: 'review_only'
      }),
      expect.objectContaining({
        id: 'auth_redirect_route_should_preserve_maintainer_review_boundary',
        fixtureId: 'real-fixture:vite-auth-redirect-route',
        detectorArea: 'auth_redirect_route',
        requiredMaintainerDecision: true,
        proposedAction: 'review_only'
      })
    ]));
    expect(contract.manualGates).toEqual(expect.arrayContaining([
      'maintainer_classification_required_before_detector_change',
      'catalog_fixture_privacy_review_required',
      'expected_snapshot_review_required',
      'confidence_threshold_review_required',
      'regression_artifact_review_required'
    ]));
    expect(contract.futureImplementationAuthorization).toEqual(expect.arrayContaining([
      'runtime_detector_change',
      'finding_suppression',
      'automatic_severity_downgrade',
      'detector_confidence_threshold_change',
      'acceptance_policy_change'
    ]));
    expect(contract.boundary).toEqual(expect.objectContaining({
      localOnly: true,
      runtimeDetectionBehaviorChange: false,
      findingSuppression: false,
      automaticSeverityDowngrade: false,
      targetRepoWrites: false,
      hostedDashboardImplemented: false,
      telemetryEnabled: false,
      cloudSyncEnabled: false
    }));
    expect(contract.validation.prohibitedContentPresent).toBe(false);
    expect(contract.aiIdeConsumption.verificationChecklist).toEqual(expect.arrayContaining([
      'Confirm every calibration question remains review_only before any detector implementation goal.',
      'Do not suppress findings, downgrade severity, or change detector behavior from this contract.'
    ]));
  });

  it('validates manual gates, future authorization, redaction, and no runtime behavior change', () => {
    const contract = buildFalsePositiveDetectorCalibrationContract({ generatedAt });
    const validation = validateFalsePositiveDetectorCalibrationContract(contract);

    expect(validation.passed).toBe(true);
    expect(validation.errors).toEqual([]);
    expect(validation.coveredFixtureIds).toEqual([
      'real-fixture:react-disabled-save-control',
      'real-fixture:vite-auth-redirect-route'
    ]);
    expect(validation.boundary.runtimeDetectionBehaviorChange).toBe(false);
    expect(validation.boundary.targetRepoWrites).toBe(false);

    expect(validateFalsePositiveDetectorCalibrationContract({
      ...contract,
      boundary: {
        ...contract.boundary,
        runtimeDetectionBehaviorChange: true
      }
    }).errors).toContain('Calibration contract must not change runtime detection behavior.');

    expect(validateFalsePositiveDetectorCalibrationContract({
      ...contract,
      manualGates: contract.manualGates.filter(
        (gate) => gate !== 'maintainer_classification_required_before_detector_change'
      )
    }).errors).toContain('Missing manual gate: maintainer_classification_required_before_detector_change');
  });

  it('formats Markdown with AI IDE read order, calibration questions, and review boundary', () => {
    const contract = buildFalsePositiveDetectorCalibrationContract({
      generatedAt,
      outputDir: 'artifacts/project-graph'
    });
    const markdown = formatFalsePositiveDetectorCalibrationContractMarkdown(contract);

    expect(markdown).toContain('# False-Positive Detector Calibration Contract');
    expect(markdown).toContain('## AI IDE Read Order');
    expect(markdown).toContain(
      '1. `docs/operations/product-false-positive-regression-catalog-detector-calibration-planning-v0.1.md`'
    );
    expect(markdown).toContain('## Calibration Questions');
    expect(markdown).toContain('conditional_dead_control_should_consider_form_dirty_prerequisites');
    expect(markdown).toContain('auth_redirect_route_should_preserve_maintainer_review_boundary');
    expect(markdown).toContain('## Manual Gates');
    expect(markdown).toContain('## Future Implementation Authorization Required');
    expect(markdown).toContain('## Boundary');
    expect(markdown).toContain('- Runtime detection behavior change: no');
    expect(markdown).toContain('- Finding suppression: no');
    expect(markdown).toContain('- Target repo writes: no');
    expect(markdown).not.toMatch(/sk-live-|ghp_|AKIA|BEGIN PRIVATE KEY/u);
  });

  it('writes generated JSON and Markdown to the requested local artifact directory', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'repoassure-fp-calibration-contract-'));

    try {
      const result = await runFalsePositiveDetectorCalibrationContractArtifacts({
        outputDir,
        generatedAt
      });

      expect(result.contractJsonPath.startsWith(outputDir)).toBe(true);
      expect(result.contractMarkdownPath.startsWith(outputDir)).toBe(true);
      expect(result.validationPassed).toBe(true);
      expect(result.calibrationQuestionCount).toBe(2);

      const [rawJson, markdown] = await Promise.all([
        readFile(result.contractJsonPath, 'utf8'),
        readFile(result.contractMarkdownPath, 'utf8')
      ]);
      const parsed = JSON.parse(rawJson) as ReturnType<typeof buildFalsePositiveDetectorCalibrationContract>;

      expect(parsed.schema).toBe('repoassure.false-positive-detector-calibration-contract@1');
      expect(parsed.boundary.runtimeDetectionBehaviorChange).toBe(false);
      expect(parsed.boundary.findingSuppression).toBe(false);
      expect(parsed.validation.prohibitedContentPresent).toBe(false);
      expect(markdown).toContain('False-Positive Detector Calibration Contract');
      expect(markdown).toContain('Target repo writes: no');
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });

  it('parses CLI options without authorizing detector changes', () => {
    expect(parseFalsePositiveDetectorCalibrationContractArgs([
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
