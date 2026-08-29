import * as acceptance from '@hardening-mcp/acceptance';
import * as compatibility from '@hardening-mcp/acceptance/compatibility';
import * as markdown from '@hardening-mcp/acceptance/markdown';
import * as report from '@hardening-mcp/acceptance/report';
import * as goalAudit from '@hardening-mcp/acceptance/goal-audit';
import * as goalAuditRequirements from '@hardening-mcp/acceptance/goal-audit-requirements';
import * as goalAuditUserAcceptance from '@hardening-mcp/acceptance/goal-audit-user-acceptance';
import * as goalAuditUserAcceptanceMaterials from '@hardening-mcp/acceptance/goal-audit-user-acceptance-materials';
import * as goalAuditSources from '@hardening-mcp/acceptance/goal-audit-sources';
import * as goalAuditDelivery from '@hardening-mcp/acceptance/goal-audit-delivery';
import * as goalAuditRuntime from '@hardening-mcp/acceptance/goal-audit-runtime';
import * as goalAuditWorkflowArtifacts from '@hardening-mcp/acceptance/goal-audit-workflow-artifacts';
import * as goalAuditObservabilitySecurity from '@hardening-mcp/acceptance/goal-audit-observability-security';
import * as goalAuditProcessGovernance from '@hardening-mcp/acceptance/goal-audit-process-governance';
import * as goalAuditEvidenceDocuments from '@hardening-mcp/acceptance/goal-audit-evidence-documents';
import * as goalAuditCurrentItems from '@hardening-mcp/acceptance/goal-audit-current-items';
import * as goalAuditV03Distribution from '@hardening-mcp/acceptance/goal-audit-v03-distribution';
import * as goalAuditPublicReleaseReadiness from '@hardening-mcp/acceptance/goal-audit-public-release-readiness';
import * as userAcceptance from '@hardening-mcp/acceptance/user-acceptance';
import * as userAcceptanceHandoff from '@hardening-mcp/acceptance/user-acceptance-handoff';
import * as fatalError from '@hardening-mcp/acceptance/fatal-error';
import * as redaction from '@hardening-mcp/acceptance/redaction';
import * as falsePositiveCatalog from '@hardening-mcp/acceptance/false-positive-catalog';
import * as runFalsePositiveCatalog from '@hardening-mcp/acceptance/run-false-positive-catalog';
import * as runFalsePositiveCatalogConsumption from '@hardening-mcp/acceptance/run-false-positive-catalog-consumption';
import * as runFalsePositiveDetectorCalibrationContract from '@hardening-mcp/acceptance/run-false-positive-detector-calibration-contract';
import * as runFalsePositiveDetectorCalibrationContractConsumption from '@hardening-mcp/acceptance/run-false-positive-detector-calibration-contract-consumption';
import * as runAutopilotProgressConsistency from '@hardening-mcp/acceptance/run-autopilot-progress-consistency';
import * as repoPreflight from '@hardening-mcp/acceptance/repo-preflight';
import * as pythonCliProfile from '@hardening-mcp/acceptance/python-cli-profile';
import * as pythonCliChecks from '@hardening-mcp/acceptance/python-cli-checks';
import * as pythonCliArtifacts from '@hardening-mcp/acceptance/python-cli-artifacts';
import * as userAcceptanceArgs from '@hardening-mcp/acceptance/user-acceptance-args';
import * as shellQuote from '@hardening-mcp/acceptance/shell-quote';
import * as shellWords from '@hardening-mcp/acceptance/shell-words';
import * as userAcceptanceRecord from '@hardening-mcp/acceptance/user-acceptance-record';
import * as userAcceptanceRunnerHelpers from '@hardening-mcp/acceptance/user-acceptance-runner-helpers';
import * as runAcceptance from '@hardening-mcp/acceptance/run-acceptance';
import * as runGoalAudit from '@hardening-mcp/acceptance/run-goal-audit';
import * as runUserAcceptance from '@hardening-mcp/acceptance/run-user-acceptance';
import * as runUserAcceptanceHandoff from '@hardening-mcp/acceptance/run-user-acceptance-handoff';
import * as runRepairHandoff from '@hardening-mcp/acceptance/run-repair-handoff';
import * as runRepairExecute from '@hardening-mcp/acceptance/run-repair-execute';
import * as runRepairPatchPlan from '@hardening-mcp/acceptance/run-repair-patch-plan';
import * as runRepairEvidencePackage from '@hardening-mcp/acceptance/run-repair-evidence-package';
import * as runProjectIntelligenceSnapshot from '@hardening-mcp/acceptance/run-project-intelligence-snapshot';
import * as runProjectIntelligenceViewer from '@hardening-mcp/acceptance/run-project-intelligence-viewer';
import * as runProjectIntelligenceBacklog from '@hardening-mcp/acceptance/run-project-intelligence-backlog';
import * as runProjectIntelligenceDecisionIntake from '@hardening-mcp/acceptance/run-project-intelligence-decision-intake';
import * as runProjectIntelligenceRecommendationDraft from '@hardening-mcp/acceptance/run-project-intelligence-recommendation-draft';
import * as runProjectIntelligenceMaintainerDecision from '@hardening-mcp/acceptance/run-project-intelligence-maintainer-decision';
import * as runProjectIntelligenceControlledRemediationPlan from '@hardening-mcp/acceptance/run-project-intelligence-controlled-remediation-plan';
import * as runProjectIntelligenceAgentContext from '@hardening-mcp/acceptance/run-project-intelligence-agent-context';
import * as runProjectIntelligenceWatch from '@hardening-mcp/acceptance/run-project-intelligence-watch';
import * as runProjectIntelligenceWatchHandoff from '@hardening-mcp/acceptance/run-project-intelligence-watch-handoff';
import * as workspaceRepairSummary from '@hardening-mcp/acceptance/workspace-repair-summary';
import * as workspaceRepairSummaryConsumption
  from '@hardening-mcp/acceptance/workspace-repair-summary-consumption';

const packageSubpathModules = [
  acceptance,
  compatibility,
  markdown,
  report,
  goalAudit,
  goalAuditRequirements,
  goalAuditUserAcceptance,
  goalAuditUserAcceptanceMaterials,
  goalAuditSources,
  goalAuditDelivery,
  goalAuditRuntime,
  goalAuditWorkflowArtifacts,
  goalAuditObservabilitySecurity,
  goalAuditProcessGovernance,
  goalAuditEvidenceDocuments,
  goalAuditCurrentItems,
  goalAuditV03Distribution,
  goalAuditPublicReleaseReadiness,
  userAcceptance,
  userAcceptanceHandoff,
  fatalError,
  redaction,
  falsePositiveCatalog,
  runFalsePositiveCatalog,
  runFalsePositiveCatalogConsumption,
  runFalsePositiveDetectorCalibrationContract,
  runFalsePositiveDetectorCalibrationContractConsumption,
  runAutopilotProgressConsistency,
  repoPreflight,
  pythonCliProfile,
  pythonCliChecks,
  pythonCliArtifacts,
  userAcceptanceArgs,
  shellQuote,
  shellWords,
  userAcceptanceRecord,
  userAcceptanceRunnerHelpers,
  runAcceptance,
  runGoalAudit,
  runUserAcceptance,
  runUserAcceptanceHandoff,
  runRepairHandoff,
  runRepairExecute,
  runRepairPatchPlan,
  runRepairEvidencePackage,
  runFalsePositiveCatalog,
  runFalsePositiveCatalogConsumption,
  runFalsePositiveDetectorCalibrationContract,
  runFalsePositiveDetectorCalibrationContractConsumption,
  runProjectIntelligenceBacklog,
  runProjectIntelligenceDecisionIntake,
  runProjectIntelligenceRecommendationDraft,
  runProjectIntelligenceMaintainerDecision,
  runProjectIntelligenceControlledRemediationPlan,
  runProjectIntelligenceAgentContext,
  runProjectIntelligenceWatch,
  runProjectIntelligenceWatchHandoff,
  workspaceRepairSummary,
  workspaceRepairSummaryConsumption,
  runProjectIntelligenceSnapshot,
  runProjectIntelligenceViewer
] as const;

const runnerMains: Array<() => Promise<number>> = [
  runAcceptance.main,
  runGoalAudit.main,
  runUserAcceptance.main,
  runUserAcceptanceHandoff.main,
  runRepairHandoff.main,
  runRepairExecute.main,
  runRepairPatchPlan.main,
  runRepairEvidencePackage.main,
  runFalsePositiveCatalog.main,
  runFalsePositiveCatalogConsumption.main,
  runFalsePositiveDetectorCalibrationContract.main,
  runFalsePositiveDetectorCalibrationContractConsumption.main,
  runAutopilotProgressConsistency.main,
  runProjectIntelligenceBacklog.main,
  runProjectIntelligenceDecisionIntake.main,
  runProjectIntelligenceRecommendationDraft.main,
  runProjectIntelligenceMaintainerDecision.main,
  runProjectIntelligenceControlledRemediationPlan.main,
  runProjectIntelligenceAgentContext.main,
  runProjectIntelligenceWatch.main,
  runProjectIntelligenceWatchHandoff.main,
  runProjectIntelligenceSnapshot.main,
  runProjectIntelligenceViewer.main
];

type RootPackageExportEntry = acceptance.AcceptancePackageExportEntry;
type CompatibilityPackageExportEntry = compatibility.AcceptancePackageExportEntry;
type RootPackageDistOutputEntry = acceptance.AcceptancePackageDistOutputEntry;
type CompatibilityPackageDistOutputEntry = compatibility.AcceptancePackageDistOutputEntry;
type RootPackageSourceEntry = acceptance.AcceptancePackageSourceEntry;
type CompatibilityPackageSourceEntry = compatibility.AcceptancePackageSourceEntry;
type RootLegacyAcceptanceDistOutputEntry = acceptance.LegacyAcceptanceDistOutputEntry;
type CompatibilityLegacyAcceptanceDistOutputEntry = compatibility.LegacyAcceptanceDistOutputEntry;
type RootLegacyAcceptanceWrapperSourceEntry = acceptance.LegacyAcceptanceWrapperSourceEntry;
type CompatibilityLegacyAcceptanceWrapperSourceEntry = compatibility.LegacyAcceptanceWrapperSourceEntry;
type RootFalsePositiveRegressionCatalog = acceptance.FalsePositiveRegressionCatalog;
type SubpathFalsePositiveRegressionCatalog = falsePositiveCatalog.FalsePositiveRegressionCatalog;
type RootFalsePositiveRegressionCatalogArtifactBundle = acceptance.FalsePositiveRegressionCatalogArtifactBundle;
type SubpathFalsePositiveRegressionCatalogArtifactBundle =
  runFalsePositiveCatalog.FalsePositiveRegressionCatalogArtifactBundle;
type RootFalsePositiveRegressionCatalogConsumptionReport =
  acceptance.FalsePositiveRegressionCatalogConsumptionValidationReport;
type SubpathFalsePositiveRegressionCatalogConsumptionReport =
  runFalsePositiveCatalogConsumption.FalsePositiveRegressionCatalogConsumptionValidationReport;
type RootFalsePositiveDetectorCalibrationContract = acceptance.FalsePositiveDetectorCalibrationContract;
type SubpathFalsePositiveDetectorCalibrationContract =
  runFalsePositiveDetectorCalibrationContract.FalsePositiveDetectorCalibrationContract;
type RootFalsePositiveDetectorCalibrationContractConsumptionReport =
  acceptance.FalsePositiveDetectorCalibrationContractConsumptionValidationReport;
type SubpathFalsePositiveDetectorCalibrationContractConsumptionReport =
  runFalsePositiveDetectorCalibrationContractConsumption.FalsePositiveDetectorCalibrationContractConsumptionValidationReport;

const falsePositiveCatalogContractSmoke = falsePositiveCatalog.falsePositiveRegressionCatalogContract;
const falsePositiveCatalogSmoke: RootFalsePositiveRegressionCatalog | SubpathFalsePositiveRegressionCatalog =
  falsePositiveCatalog.buildFalsePositiveRegressionCatalog({
    generatedAt: '2026-07-22T00:00:00.000+08:00'
  });
const falsePositiveCatalogArtifactSmoke:
  RootFalsePositiveRegressionCatalogArtifactBundle | SubpathFalsePositiveRegressionCatalogArtifactBundle =
    runFalsePositiveCatalog.buildFalsePositiveRegressionCatalogArtifactBundle({
      generatedAt: '2026-07-22T00:00:00.000+08:00'
    });
const falsePositiveCatalogConsumptionReportSmoke:
  RootFalsePositiveRegressionCatalogConsumptionReport | SubpathFalsePositiveRegressionCatalogConsumptionReport = {
    schema: 'repoassure.false-positive-regression-catalog-consumption-validation@1',
    generatedAt: '2026-07-22T00:00:00.000+08:00',
    status: 'passed',
    readOrder: [],
    inputArtifacts: {
      catalogJsonPath: '',
      catalogMarkdownPath: ''
    },
    consumption: {
      aiIdeCanConsume: true,
      maintainerCanReview: true,
      fixtureCategoriesCovered: [],
      expectedSnapshotFields: [],
      reviewFields: [],
      verificationChecklist: []
    },
    boundary: {
      localOnly: true,
      targetRepoWrites: false,
      runtimeDetectionBehaviorChange: false,
      findingSuppression: false,
      automaticSeverityDowngrade: false,
      hostedDashboardImplemented: false,
      telemetryEnabled: false,
      cloudSyncEnabled: false,
      prohibitedContentPresent: false
    },
    checks: []
  };
const falsePositiveDetectorCalibrationContractSmoke:
  RootFalsePositiveDetectorCalibrationContract | SubpathFalsePositiveDetectorCalibrationContract =
    runFalsePositiveDetectorCalibrationContract.buildFalsePositiveDetectorCalibrationContract({
      generatedAt: '2026-07-23T08:00:00.000+08:00'
    });
const falsePositiveDetectorCalibrationContractConsumptionReportSmoke:
  RootFalsePositiveDetectorCalibrationContractConsumptionReport
  | SubpathFalsePositiveDetectorCalibrationContractConsumptionReport = {
    schema: 'repoassure.false-positive-detector-calibration-contract-consumption-validation@1',
    generatedAt: '2026-07-23T09:00:00.000+08:00',
    status: 'passed',
    readOrder: [],
    inputArtifacts: {
      contractJsonPath: '',
      contractMarkdownPath: ''
    },
    consumption: {
      aiIdeCanConsume: true,
      maintainerCanReview: true,
      calibrationQuestionIds: [],
      manualGates: [],
      futureImplementationAuthorization: [],
      verificationChecklist: []
    },
    boundary: {
      localOnly: true,
      targetRepoWrites: false,
      runtimeDetectionBehaviorChange: false,
      findingSuppression: false,
      automaticSeverityDowngrade: false,
      hostedDashboardImplemented: false,
      telemetryEnabled: false,
      cloudSyncEnabled: false,
      prohibitedContentPresent: false
    },
    checks: []
  };

const packageExportEntryContracts: readonly [
  readonly RootPackageExportEntry[],
  readonly CompatibilityPackageExportEntry[]
] = [
  acceptance.acceptancePackageExportEntries,
  compatibility.acceptancePackageExportEntries
];

const packageDistOutputEntryContracts: readonly [
  readonly RootPackageDistOutputEntry[],
  readonly CompatibilityPackageDistOutputEntry[]
] = [
  acceptance.acceptancePackageDistOutputEntries,
  compatibility.acceptancePackageDistOutputEntries
];

const packageDistOutputSourceMapContracts: readonly string[] = [
  ...acceptance.acceptancePackageDistOutputEntries.map((entry) => entry.sourceMapPath),
  ...compatibility.acceptancePackageDistOutputEntries.map((entry) => entry.sourceMapPath)
];

const packageSourceEntryContracts: readonly [
  readonly RootPackageSourceEntry[],
  readonly CompatibilityPackageSourceEntry[]
] = [
  acceptance.acceptancePackageSourceEntries,
  compatibility.acceptancePackageSourceEntries
];

const legacyDistOutputEntryContracts: readonly [
  readonly RootLegacyAcceptanceDistOutputEntry[],
  readonly CompatibilityLegacyAcceptanceDistOutputEntry[]
] = [
  acceptance.legacyAcceptanceDistOutputEntries,
  compatibility.legacyAcceptanceDistOutputEntries
];

const legacyDistOutputSourceMapContracts: readonly string[] = [
  ...acceptance.legacyAcceptanceDistOutputEntries.map((entry) => entry.sourceMapPath),
  ...compatibility.legacyAcceptanceDistOutputEntries.map((entry) => entry.sourceMapPath)
];

const legacyWrapperSourceEntryContracts: readonly [
  readonly RootLegacyAcceptanceWrapperSourceEntry[],
  readonly CompatibilityLegacyAcceptanceWrapperSourceEntry[]
] = [
  acceptance.legacyAcceptanceWrapperSourceEntries,
  compatibility.legacyAcceptanceWrapperSourceEntries
];

const packageDistOutputSourceSpecContracts = [
  acceptance.PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS,
  goalAuditSources.PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS
] as const;

const packageDistDeclarationSourceSpecContracts = [
  acceptance.PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS,
  goalAuditSources.PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS
] as const;

const packageDistSourceMapSourceSpecContracts = [
  acceptance.PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS,
  goalAuditSources.PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS
] as const;

const legacyDistSourceMapSourceSpecContracts = [
  acceptance.LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS,
  goalAuditSources.LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS
] as const;

const runtimeContractSpecifierContracts: readonly [readonly string[], readonly string[]] = [
  acceptance.acceptanceRuntimeContractSpecifiers,
  compatibility.acceptanceRuntimeContractSpecifiers
];

export {
  legacyDistOutputEntryContracts,
  legacyDistOutputSourceMapContracts,
  legacyWrapperSourceEntryContracts,
  packageDistDeclarationSourceSpecContracts,
  packageDistOutputEntryContracts,
  packageDistOutputSourceMapContracts,
  packageDistOutputSourceSpecContracts,
  packageDistSourceMapSourceSpecContracts,
  packageExportEntryContracts,
  packageSourceEntryContracts,
  packageSubpathModules,
  legacyDistSourceMapSourceSpecContracts,
  falsePositiveCatalogContractSmoke,
  falsePositiveCatalogArtifactSmoke,
  falsePositiveCatalogConsumptionReportSmoke,
  falsePositiveDetectorCalibrationContractSmoke,
  falsePositiveDetectorCalibrationContractConsumptionReportSmoke,
  falsePositiveCatalogSmoke,
  runnerMains,
  runtimeContractSpecifierContracts
};
