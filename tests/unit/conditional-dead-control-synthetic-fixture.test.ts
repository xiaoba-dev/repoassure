import { readFile } from 'node:fs/promises';

const fixtureDirectory = 'tests/fixtures/conditional-dead-control-synthetic';

type JsonRecord = Record<string, unknown>;

async function readJsonFixture(fileName: string): Promise<JsonRecord> {
  return JSON.parse(
    await readFile(`${fixtureDirectory}/${fileName}`, 'utf8')
  ) as JsonRecord;
}

describe('conditional dead control synthetic fixture', () => {
  it('records original local-only provenance and the completed explicit manual review', async () => {
    const manifest = await readJsonFixture('fixture-manifest.json');

    expect(manifest).toEqual({
      schema: 'repoassure.conditional-dead-control.synthetic-fixture-manifest@1',
      fixtureId: 'conditional-dead-control-synthetic-v0.1',
      fixtureVersion: '0.1',
      sourceCategory: 'synthetic_local',
      provenance: 'repoassure_authored_from_bounded_plan',
      externalSourceCopied: false,
      licenseStatus: 'not_applicable_original_synthetic',
      localOnly: true,
      networkDependency: false,
      targetRepositoryDependency: false,
      privacy: {
        containsCredentials: false,
        containsTokens: false,
        containsCookies: false,
        containsPrivateSource: false,
        containsPersonalContactData: false,
        containsProductionValues: false
      },
      review: {
        status: 'approved_manual_review',
        reviewer: 'maintainer',
        reviewedAt: '2026-07-29',
        evidenceLocation: 'tests/unit/conditional-dead-control-synthetic-fixture.test.ts'
      },
      requiredStateIds: [
        'initial_disabled_before_dirty',
        'safe_dirty_transition_available',
        'enabled_after_safe_dirty_transition',
        'still_disabled_after_safe_dirty_transition',
        'dirty_transition_not_safely_observable'
      ],
      manualGates: {
        total: 5,
        completed: 5,
        entries: [
          {
            id: 'maintainer_classification_required_before_detector_change',
            status: 'completed'
          },
          {
            id: 'fixture_privacy_confirmation_required',
            status: 'completed'
          },
          {
            id: 'expected_snapshot_confirmation_required',
            status: 'completed'
          },
          {
            id: 'confidence_threshold_review_required',
            status: 'completed'
          },
          {
            id: 'regression_artifact_review_required',
            status: 'completed'
          }
        ]
      },
      excludedCalibrationQuestion: {
        id: 'auth_redirect_route_should_preserve_maintainer_review_boundary',
        decision: 'request_revision',
        excludedFromImplementation: true
      }
    });
  });

  it('represents the five required states with explicit deterministic fields', async () => {
    const states = await readJsonFixture('form-dirty-states.json');

    expect(states.records).toEqual([
      {
        stateId: 'initial_disabled_before_dirty',
        initialDirty: false,
        initialDisabled: true,
        transitionKind: 'none',
        transitionSafe: false,
        afterDirty: false,
        afterDisabled: true,
        observable: true
      },
      {
        stateId: 'safe_dirty_transition_available',
        initialDirty: false,
        initialDisabled: true,
        transitionKind: 'controlled_local_input_available',
        transitionSafe: true,
        afterDirty: true,
        afterDisabled: null,
        observable: true
      },
      {
        stateId: 'enabled_after_safe_dirty_transition',
        initialDirty: false,
        initialDisabled: true,
        transitionKind: 'controlled_local_input',
        transitionSafe: true,
        afterDirty: true,
        afterDisabled: false,
        observable: true
      },
      {
        stateId: 'still_disabled_after_safe_dirty_transition',
        initialDirty: false,
        initialDisabled: true,
        transitionKind: 'controlled_local_input',
        transitionSafe: true,
        afterDirty: true,
        afterDisabled: true,
        observable: true
      },
      {
        stateId: 'dirty_transition_not_safely_observable',
        initialDirty: false,
        initialDisabled: true,
        transitionKind: 'unavailable_or_unsafe',
        transitionSafe: false,
        afterDirty: null,
        afterDisabled: null,
        observable: false
      }
    ]);
  });

  it('pins literal positive, counter, and fail-closed expected snapshots', async () => {
    const states = await readJsonFixture('form-dirty-states.json');

    expect(states.snapshots).toEqual({
      positive: {
        statePath: [
          'initial_disabled_before_dirty',
          'safe_dirty_transition_available',
          'enabled_after_safe_dirty_transition'
        ],
        transitionExecuted: true,
        findingVisible: true,
        classification: 'false_positive_candidate',
        prerequisiteEvidence: {
          initialDisabled: true,
          safeDirtyTransitionObserved: true,
          enabledAfterTransition: true
        },
        formStateInferred: false
      },
      counter: {
        statePath: [
          'initial_disabled_before_dirty',
          'safe_dirty_transition_available',
          'still_disabled_after_safe_dirty_transition'
        ],
        transitionExecuted: true,
        findingVisible: true,
        classification: 'actionable_conditional_dead_control',
        prerequisiteEvidence: {
          initialDisabled: true,
          safeDirtyTransitionObserved: true,
          stillDisabledAfterTransition: true
        },
        formStateInferred: false
      },
      failClosed: {
        statePath: [
          'initial_disabled_before_dirty',
          'dirty_transition_not_safely_observable'
        ],
        transitionExecuted: false,
        findingVisible: true,
        classification: 'needs_maintainer_review',
        prerequisiteEvidence: {
          initialDisabled: true,
          safeDirtyTransitionObserved: false,
          postTransitionStateKnown: false
        },
        formStateInferred: false
      }
    });
  });

  it('keeps the finding visible without detector, suppression, severity, threshold, or policy changes', async () => {
    const [manifest, states] = await Promise.all([
      readJsonFixture('fixture-manifest.json'),
      readJsonFixture('form-dirty-states.json')
    ]);
    const serializedFixture = JSON.stringify({ manifest, states });

    expect(states.findingPolicy).toEqual({
      findingVisibility: 'visible_in_all_snapshots',
      detectorBehaviorChanged: false,
      findingSuppressionAuthorized: false,
      automaticSeverityDowngradeAuthorized: false,
      confidenceThresholdChangeAuthorized: false,
      acceptancePolicyChangeAuthorized: false
    });
    expect(serializedFixture).not.toMatch(
      /sk-live-|ghp_|AKIA[0-9A-Z]{16}|BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/u
    );
  });
});
