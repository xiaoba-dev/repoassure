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
import * as repoPreflight from '@hardening-mcp/acceptance/repo-preflight';
import * as pythonCliProfile from '@hardening-mcp/acceptance/python-cli-profile';
import * as pythonCliChecks from '@hardening-mcp/acceptance/python-cli-checks';
import * as pythonCliArtifacts from '@hardening-mcp/acceptance/python-cli-artifacts';
import * as targetRepoFeedbackSummary from '@hardening-mcp/acceptance/target-repo-feedback-summary';
import * as aiIdeHandoffPackage from '@hardening-mcp/acceptance/ai-ide-handoff-package';
import * as userValidationEvidenceLoop from '@hardening-mcp/acceptance/user-validation-evidence-loop';
import * as aiIdeRepairPlaybook from '@hardening-mcp/acceptance/ai-ide-repair-playbook';
import * as aiIdePlaybookConsumptionReport from '@hardening-mcp/acceptance/ai-ide-playbook-consumption-report';
import * as aiIdeRepairDecisionPackage from '@hardening-mcp/acceptance/ai-ide-repair-decision-package';
import * as campaignSummary from '@hardening-mcp/acceptance/campaign-summary';
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
  repoPreflight,
  pythonCliProfile,
  pythonCliChecks,
  pythonCliArtifacts,
  targetRepoFeedbackSummary,
  aiIdeHandoffPackage,
  userValidationEvidenceLoop,
  aiIdeRepairPlaybook,
  aiIdePlaybookConsumptionReport,
  aiIdeRepairDecisionPackage,
  campaignSummary,
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
  runRepairPatchPlan
] as const;

const runnerMains: Array<() => Promise<number>> = [
  runAcceptance.main,
  runGoalAudit.main,
  runUserAcceptance.main,
  runUserAcceptanceHandoff.main,
  runRepairHandoff.main,
  runRepairExecute.main,
  runRepairPatchPlan.main
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
  runnerMains,
  runtimeContractSpecifierContracts
};
