export {
  acceptanceCompatibilityContract,
  acceptanceEntrypointFiles,
  acceptancePackageDistOutputEntries,
  acceptancePackageExportEntries,
  acceptancePackageSourceEntries,
  acceptancePackageSubpathSpecifiers,
  acceptanceRuntimeContractSpecifiers,
  acceptanceRunnerMainSpecifiers,
  legacyAcceptanceCompatibilityModules,
  legacyAcceptanceDistOutputEntries,
  legacyAcceptanceWrapperSourceEntries,
  resolveAcceptanceEntrypointUrl,
  runAcceptanceEntrypoint,
  runAcceptanceEntrypointCli,
  type AcceptanceEntrypointKind,
  type AcceptancePackageDistOutputEntry,
  type AcceptancePackageExportEntry,
  type AcceptancePackageSourceEntry,
  type AcceptanceRunnerModule,
  type LegacyAcceptanceCompatibilityModule,
  type LegacyAcceptanceDistOutputEntry,
  type LegacyAcceptanceWrapperSourceEntry
} from './compatibility.js';

export {
  escapeMarkdownTableCell,
  formatMarkdownCodeCell
} from './markdown.js';

export {
  buildAcceptanceMarkdown,
  summarizeAcceptanceChecks,
  type AcceptanceCheck,
  type AcceptanceCheckStatus,
  type AcceptanceOverallStatus,
  type AcceptanceSummary,
  type BuildAcceptanceMarkdownInput
} from './report.js';

export {
  buildGoalAuditMarkdown,
  summarizeGoalAudit,
  type BuildGoalAuditMarkdownInput,
  type GoalAuditItem,
  type GoalAuditItemStatus,
  type GoalAuditOverallStatus,
  type GoalAuditSummary
} from './goal-audit.js';

export {
  REQUIRED_DOCUMENT_PATHS,
  buildAcceptanceRunQualityGateRequirement,
  buildGoalAuditFileRequirement,
  buildGoalAuditTextRequirement,
  type GoalAuditFileRequirementInput,
  type GoalAuditTextRequirementInput
} from './goal-audit-requirements.js';

export {
  buildUserAcceptanceGoalRequirement,
  formatUserAcceptanceAuditEvidence,
  formatUserAcceptanceAuditNextAction
} from './goal-audit-user-acceptance.js';

export {
  USER_ACCEPTANCE_MATERIAL_SOURCE_KEYS,
  buildUserAcceptanceMaterialRequirements,
  userAcceptanceMaterialRequirementSpecs,
  type UserAcceptanceMaterialRequirementSpec,
  type UserAcceptanceMaterialSourceKey,
  type UserAcceptanceMaterialSources
} from './goal-audit-user-acceptance-materials.js';

export {
  GOAL_AUDIT_GROUPED_TEXT_SOURCE_PATHS,
  GOAL_AUDIT_TEXT_SOURCE_PATHS,
  LEGACY_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS,
  LEGACY_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS,
  LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS,
  LEGACY_ACCEPTANCE_WRAPPER_SOURCE_SPECS,
  PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS,
  PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS,
  PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS,
  readGoalAuditTextSources,
  type GoalAuditGroupedTextSourceKey,
  type GoalAuditSourceKey,
  type GoalAuditTextSourceKey,
  type GoalAuditTextSources,
  type ReadGoalAuditTextSourcesInput
} from './goal-audit-sources.js';

export {
  buildDeliveryAndP0GoalAuditItems,
  type BuildDeliveryAndP0GoalAuditItemsInput
} from './goal-audit-delivery.js';

export {
  buildRuntimeGoalAuditItems
} from './goal-audit-runtime.js';

export {
  buildWorkflowAndArtifactGoalAuditItems
} from './goal-audit-workflow-artifacts.js';

export {
  buildObservabilityAndSecurityGoalAuditItems
} from './goal-audit-observability-security.js';

export {
  buildProcessGovernanceGoalAuditItems
} from './goal-audit-process-governance.js';

export {
  buildEvidenceAndDocumentGoalAuditItems,
  type BuildEvidenceAndDocumentGoalAuditItemsInput
} from './goal-audit-evidence-documents.js';

export {
  buildCurrentGoalAuditItemsFromSources,
  type BuildCurrentGoalAuditItemsFromSourcesInput
} from './goal-audit-current-items.js';

export {
  buildV03DistributionRepairLoopGoalAuditItem
} from './goal-audit-v03-distribution.js';

export {
  buildPublicReleaseReadinessGoalAuditItem
} from './goal-audit-public-release-readiness.js';

export {
  buildUserAcceptanceMarkdown,
  formatUserAcceptanceEvidenceCommand,
  summarizeUserAcceptanceChecks,
  type UserAcceptanceCheck,
  type UserAcceptanceCheckStatus,
  type UserAcceptanceRecord,
  type UserAcceptanceRunStatus,
  type UserAcceptanceSummary,
  type UserDecision
} from './user-acceptance.js';

export {
  buildUserAcceptanceHandoffMarkdown,
  type UserAcceptanceHandoffInput
} from './user-acceptance-handoff.js';

export {
  formatAcceptanceFatalError
} from './fatal-error.js';

export {
  redactSensitiveText
} from './redaction.js';

export {
  buildPackageJsonManifestCheck,
  buildPlaceholderRepoRootCheck,
  buildPyprojectTomlManifestCheck,
  buildRepoRootDirectoryCheck,
  findRepoPathPlaceholder,
  type PackageJsonManifestCheckOptions,
  type PyprojectTomlManifestCheckOptions
} from './repo-preflight.js';

export {
  buildPythonCliProfile,
  writePythonCliProfileArtifact,
  type PythonCliProfile,
  type PythonCliProfileConfidence
} from './python-cli-profile.js';

export {
  buildPythonCliExecutionAcceptanceChecks,
  buildPythonCliSmokeCommands,
  detectPythonCliStaticCheckCommands,
  isSafeCliSmokeCommand,
  runPythonCliCheckCommand,
  runPythonCliCheckCommands,
  type PythonCliCheckCommand,
  type PythonCliCheckCommandResult,
  type PythonCliCheckKind,
  type RunPythonCliCheckCommandsInput
} from './python-cli-checks.js';

export {
  writePythonCliAcceptanceArtifacts,
  type PythonCliAcceptanceArtifacts,
  type PythonCliAcceptanceArtifactsInput
} from './python-cli-artifacts.js';

export {
  buildTargetRepoFeedbackSummary,
  writeTargetRepoFeedbackSummaryArtifact,
  type TargetRepoFeedbackBlockerCategory,
  type TargetRepoFeedbackNextAction,
  type TargetRepoFeedbackRunStatus,
  type TargetRepoFeedbackSummary,
  type TargetRepoFeedbackSummaryInput,
  type TargetRepoMetadataClass,
  type WriteTargetRepoFeedbackSummaryResult
} from './target-repo-feedback-summary.js';

export {
  buildAiIdeHandoffPackage,
  writeAiIdeHandoffPackageArtifact,
  type AiIdeHandoffArtifactInventoryEntry,
  type AiIdeHandoffArtifactKind,
  type AiIdeHandoffPackage,
  type AiIdeHandoffPackageInput,
  type AiIdeHandoffPriority,
  type AiIdeHandoffPriorityAction,
  type AiIdeHandoffReadingEntry,
  type AiIdeHandoffRunStatus,
  type WriteAiIdeHandoffPackageResult
} from './ai-ide-handoff-package.js';

export {
  buildUserValidationEvidenceLoop,
  writeUserValidationEvidenceLoopArtifact,
  type UserValidationDecision,
  type UserValidationEvidenceLoop,
  type UserValidationEvidenceLoopInput,
  type UserValidationEvidenceSource,
  type UserValidationFeedbackEvent,
  type UserValidationFeedbackItem,
  type UserValidationNextAction,
  type UserValidationSource,
  type UserValidationStatus,
  type WriteUserValidationEvidenceLoopResult
} from './user-validation-evidence-loop.js';

export {
  buildAiIdeRepairExecutionPlaybook,
  buildAiIdeRepairExecutionPlaybookMarkdown,
  writeAiIdeRepairExecutionPlaybook,
  type AiIdeRepairExecutionPlaybook,
  type AiIdeRepairPlaybookArtifactKind,
  type AiIdeRepairPlaybookCampaignContext,
  type AiIdeRepairPlaybookExecutionStep,
  type AiIdeRepairPlaybookInput,
  type AiIdeRepairPlaybookReadEntry,
  type AiIdeRepairPlaybookTargetContext,
  type WriteAiIdeRepairPlaybookInput,
  type WriteAiIdeRepairPlaybookResult
} from './ai-ide-repair-playbook.js';

export {
  buildAiIdePlaybookConsumptionReport,
  buildAiIdePlaybookConsumptionReportMarkdown,
  writeAiIdePlaybookConsumptionReport,
  type AiIdePlaybookBlockedAction,
  type AiIdePlaybookCampaignUnderstanding,
  type AiIdePlaybookConsumptionReport,
  type AiIdePlaybookConsumptionReportInput,
  type AiIdePlaybookDryRunDecision,
  type AiIdePlaybookReadOrderCompliance,
  type AiIdePlaybookRepairTaskUnderstanding,
  type AiIdePlaybookTargetDisposition,
  type AiIdePlaybookTargetHandling,
  type WriteAiIdePlaybookConsumptionReportInput,
  type WriteAiIdePlaybookConsumptionReportResult
} from './ai-ide-playbook-consumption-report.js';

export {
  buildAiIdeRepairDecisionPackage,
  buildAiIdeRepairDecisionPackageMarkdown,
  writeAiIdeRepairDecisionPackage,
  type AiIdeRepairDecisionApproval,
  type AiIdeRepairDecisionItem,
  type AiIdeRepairDecisionPackage,
  type AiIdeRepairDecisionPackageInput,
  type AiIdeRepairDecisionSummary,
  type AiIdeRepairDecisionTargetReview,
  type AiIdeRepairDecisionType,
  type AiIdeTargetReviewDecision,
  type WriteAiIdeRepairDecisionPackageInput,
  type WriteAiIdeRepairDecisionPackageResult
} from './ai-ide-repair-decision-package.js';

export {
  buildAiIdeRepairApprovalReceipt,
  buildAiIdeRepairApprovalReceiptMarkdown,
  writeAiIdeRepairApprovalReceipt,
  type AiIdeRepairApprovalDecision,
  type AiIdeRepairApprovalDecisionInput,
  type AiIdeRepairApprovalReceipt,
  type AiIdeRepairApprovalReceiptInput,
  type AiIdeRepairApprovalReceiptItem,
  type AiIdeRepairApprovalReceiptSummary,
  type WriteAiIdeRepairApprovalReceiptInput,
  type WriteAiIdeRepairApprovalReceiptResult
} from './ai-ide-repair-approval-receipt.js';

export {
  buildAiIdeApprovedRepairExecutionPlan,
  buildAiIdeApprovedRepairExecutionPlanMarkdown,
  writeAiIdeApprovedRepairExecutionPlan,
  type AiIdeApprovedRepairExecutionExcludedItem,
  type AiIdeApprovedRepairExecutionItem,
  type AiIdeApprovedRepairExecutionPlan,
  type AiIdeApprovedRepairExecutionPlanInput,
  type AiIdeApprovedRepairExecutionSummary,
  type WriteAiIdeApprovedRepairExecutionPlanInput,
  type WriteAiIdeApprovedRepairExecutionPlanResult
} from './ai-ide-approved-repair-execution-plan.js';

export {
  buildAiIdeRepairExecutionEvidenceReport,
  buildAiIdeRepairExecutionEvidenceReportMarkdown,
  writeAiIdeRepairExecutionEvidenceReport,
  type AiIdeRepairExecutionBoundaryEvidenceInput,
  type AiIdeRepairExecutionBoundaryReport,
  type AiIdeRepairExecutionEvidenceInput,
  type AiIdeRepairExecutionEvidenceItemInput,
  type AiIdeRepairExecutionEvidenceItemReport,
  type AiIdeRepairExecutionEvidenceReport,
  type AiIdeRepairExecutionEvidenceReportInput,
  type AiIdeRepairExecutionEvidenceStatus,
  type AiIdeRepairExecutionEvidenceSummary,
  type AiIdeRepairExecutionMaintainerReviewStatus,
  type AiIdeRepairExecutionReadOrderCompliance,
  type AiIdeRepairExecutionVerificationResult,
  type AiIdeRepairExecutionVerificationStatus,
  type WriteAiIdeRepairExecutionEvidenceReportInput,
  type WriteAiIdeRepairExecutionEvidenceReportResult
} from './ai-ide-repair-execution-evidence-report.js';

export {
  buildAiIdeRepairEvidenceBundleManifest,
  buildAiIdeRepairEvidenceBundleManifestMarkdown,
  writeAiIdeRepairEvidenceBundleManifest,
  writeAiIdeRepairEvidenceBundleManifestFromDirectory,
  type AiIdeRepairEvidenceBundleArtifact,
  type AiIdeRepairEvidenceBundleArtifactInput,
  type AiIdeRepairEvidenceBundleArtifactKind,
  type AiIdeRepairEvidenceBundleBoundaries,
  type AiIdeRepairEvidenceBundleManifest,
  type AiIdeRepairEvidenceBundleManifestInput,
  type AiIdeRepairEvidenceBundleReadingOrderItem,
  type AiIdeRepairEvidenceBundleStatus,
  type AiIdeRepairEvidenceBundleSummary,
  type WriteAiIdeRepairEvidenceBundleManifestInput,
  type WriteAiIdeRepairEvidenceBundleManifestResult
} from './ai-ide-repair-evidence-bundle-manifest.js';

export {
  buildAiIdeRepairEvidenceConsumerContract,
  buildAiIdeRepairEvidenceConsumerContractMarkdown,
  writeAiIdeRepairEvidenceConsumerContract,
  writeAiIdeRepairEvidenceConsumerContractFromDirectory,
  type AiIdeRepairEvidenceConsumerArtifactReadItem,
  type AiIdeRepairEvidenceConsumerArtifactRole,
  type AiIdeRepairEvidenceConsumerContract,
  type AiIdeRepairEvidenceConsumerContractInput,
  type AiIdeRepairEvidenceConsumerReadiness,
  type AiIdeRepairEvidenceConsumerSourceManifest,
  type WriteAiIdeRepairEvidenceConsumerContractFromDirectoryInput,
  type WriteAiIdeRepairEvidenceConsumerContractInput,
  type WriteAiIdeRepairEvidenceConsumerContractResult
} from './ai-ide-repair-evidence-consumer-contract.js';

export {
  buildAiIdeRepairExecutionReplayReadiness,
  buildAiIdeRepairExecutionReplayReadinessMarkdown,
  writeAiIdeRepairExecutionReplayReadiness,
  writeAiIdeRepairExecutionReplayReadinessFromDirectory,
  type AiIdeRepairExecutionBoundaryReplay,
  type AiIdeRepairExecutionReplayArtifact,
  type AiIdeRepairExecutionReplayNextDecision,
  type AiIdeRepairExecutionReplayNextReviewDecision,
  type AiIdeRepairExecutionReplayReadinessInput,
  type AiIdeRepairExecutionReplayReadinessReport,
  type AiIdeRepairExecutionReplayReadinessStatus,
  type AiIdeRepairExecutionReplaySourceConsumerContract,
  type AiIdeRepairExecutionReplayStatus,
  type AiIdeRepairExecutionVerificationReplay,
  type WriteAiIdeRepairExecutionReplayReadinessFromDirectoryInput,
  type WriteAiIdeRepairExecutionReplayReadinessInput,
  type WriteAiIdeRepairExecutionReplayReadinessResult
} from './ai-ide-repair-execution-replay-readiness.js';

export {
  buildAiIdeTargetRepoRepairGoalProposalPackage,
  buildAiIdeTargetRepoRepairGoalProposalPackageMarkdown,
  writeAiIdeTargetRepoRepairGoalProposalPackage,
  writeAiIdeTargetRepoRepairGoalProposalPackageFromDirectory,
  type AiIdeTargetRepoRepairAllowedScope,
  type AiIdeTargetRepoRepairGoalProposalAuthorizationStatus,
  type AiIdeTargetRepoRepairGoalProposalPackage,
  type AiIdeTargetRepoRepairGoalProposalPackageInput,
  type AiIdeTargetRepoRepairGoalProposalReadOrderItem,
  type AiIdeTargetRepoRepairGoalProposalReadiness,
  type AiIdeTargetRepoRepairGoalProposalSourceReplayReadiness,
  type AiIdeTargetRepoRepairGoalProposalTask,
  type AiIdeTargetRepoRepairGoalProposalVerificationCommand,
  type WriteAiIdeTargetRepoRepairGoalProposalPackageFromDirectoryInput,
  type WriteAiIdeTargetRepoRepairGoalProposalPackageInput,
  type WriteAiIdeTargetRepoRepairGoalProposalPackageResult
} from './ai-ide-target-repo-repair-goal-proposal-package.js';

export {
  buildAiIdeTargetRepoRepairGoalAuthorizationReceipt,
  buildAiIdeTargetRepoRepairGoalAuthorizationReceiptMarkdown,
  writeAiIdeTargetRepoRepairGoalAuthorizationReceipt,
  writeAiIdeTargetRepoRepairGoalAuthorizationReceiptFromDirectory,
  type AiIdeTargetRepoRepairGoalAuthorizationDecision,
  type AiIdeTargetRepoRepairGoalAuthorizationDecisionInput,
  type AiIdeTargetRepoRepairGoalAuthorizationDecisionSummary,
  type AiIdeTargetRepoRepairGoalAuthorizationItem,
  type AiIdeTargetRepoRepairGoalAuthorizationReceipt,
  type AiIdeTargetRepoRepairGoalAuthorizationReceiptInput,
  type AiIdeTargetRepoRepairGoalAuthorizationSourceProposalPackage,
  type AiIdeTargetRepoRepairGoalAuthorizationStatus,
  type WriteAiIdeTargetRepoRepairGoalAuthorizationReceiptFromDirectoryInput,
  type WriteAiIdeTargetRepoRepairGoalAuthorizationReceiptInput,
  type WriteAiIdeTargetRepoRepairGoalAuthorizationReceiptResult
} from './ai-ide-target-repo-repair-goal-authorization-receipt.js';

export {
  buildAiIdeAuthorizedTargetRepoRepairGoalTaskPackage,
  buildAiIdeAuthorizedTargetRepoRepairGoalTaskPackageMarkdown,
  writeAiIdeAuthorizedTargetRepoRepairGoalTaskPackage,
  writeAiIdeAuthorizedTargetRepoRepairGoalTaskPackageFromDirectory,
  type AiIdeAuthorizedTargetRepoRepairGoalExcludedItem,
  type AiIdeAuthorizedTargetRepoRepairGoalExecutionMode,
  type AiIdeAuthorizedTargetRepoRepairGoalMutationPermission,
  type AiIdeAuthorizedTargetRepoRepairGoalSourceAuthorizationReceipt,
  type AiIdeAuthorizedTargetRepoRepairGoalTask,
  type AiIdeAuthorizedTargetRepoRepairGoalTaskPackage,
  type AiIdeAuthorizedTargetRepoRepairGoalTaskPackageInput,
  type AiIdeAuthorizedTargetRepoRepairGoalTaskPackageStatus,
  type WriteAiIdeAuthorizedTargetRepoRepairGoalTaskPackageFromDirectoryInput,
  type WriteAiIdeAuthorizedTargetRepoRepairGoalTaskPackageInput,
  type WriteAiIdeAuthorizedTargetRepoRepairGoalTaskPackageResult
} from './ai-ide-authorized-target-repo-repair-goal-task-package.js';

export {
  buildAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport,
  buildAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReportMarkdown,
  writeAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport,
  writeAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReportFromDirectory,
  type AiIdeTargetRepoRepairGoalActualMutationSummary,
  type AiIdeTargetRepoRepairGoalBoundaryEvidenceInput,
  type AiIdeTargetRepoRepairGoalBoundaryReport,
  type AiIdeTargetRepoRepairGoalExecutionEvidenceInput,
  type AiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport,
  type AiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReportInput,
  type AiIdeTargetRepoRepairGoalExecutionIntakeStatus,
  type AiIdeTargetRepoRepairGoalExecutionResultInput,
  type AiIdeTargetRepoRepairGoalExecutionStatus,
  type AiIdeTargetRepoRepairGoalExecutionSummary,
  type AiIdeTargetRepoRepairGoalMaintainerReviewStatus,
  type AiIdeTargetRepoRepairGoalReport,
  type AiIdeTargetRepoRepairGoalSourceTaskPackage,
  type AiIdeTargetRepoRepairGoalVerificationResult,
  type AiIdeTargetRepoRepairGoalVerificationStatus,
  type WriteAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReportFromDirectoryInput,
  type WriteAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReportInput,
  type WriteAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReportResult
} from './ai-ide-target-repo-repair-goal-execution-evidence-intake-report.js';

export {
  buildAiIdeTargetRepairEvidenceReviewDecisionPackage,
  buildAiIdeTargetRepairEvidenceReviewDecisionPackageMarkdown,
  writeAiIdeTargetRepairEvidenceReviewDecisionPackage,
  writeAiIdeTargetRepairEvidenceReviewDecisionPackageFromDirectory,
  type AiIdeTargetRepairEvidenceAcceptedScope,
  type AiIdeTargetRepairEvidenceChangeRequest,
  type AiIdeTargetRepairEvidenceDeferredItem,
  type AiIdeTargetRepairEvidenceNextRepairGoalRecommendation,
  type AiIdeTargetRepairEvidenceReviewDecision,
  type AiIdeTargetRepairEvidenceReviewDecisionInput,
  type AiIdeTargetRepairEvidenceReviewDecisionInputItem,
  type AiIdeTargetRepairEvidenceReviewDecisionPackage,
  type AiIdeTargetRepairEvidenceReviewDecisionPackageInput,
  type AiIdeTargetRepairEvidenceReviewDecisionReadiness,
  type AiIdeTargetRepairEvidenceReviewDecisionSummary,
  type AiIdeTargetRepairEvidenceReviewItem,
  type AiIdeTargetRepairEvidenceReviewStatus,
  type AiIdeTargetRepairEvidenceRiskAcceptedItem,
  type AiIdeTargetRepairEvidenceSourceIntakeReport,
  type WriteAiIdeTargetRepairEvidenceReviewDecisionPackageFromDirectoryInput,
  type WriteAiIdeTargetRepairEvidenceReviewDecisionPackageInput,
  type WriteAiIdeTargetRepairEvidenceReviewDecisionPackageResult
} from './ai-ide-target-repair-evidence-review-decision-package.js';

export {
  buildBlockedGoalRecoveryPackage,
  buildBlockedGoalRecoveryPackageMarkdown,
  BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS,
  writeBlockedGoalRecoveryPackage,
  writeBlockedGoalRecoveryPackageFromDirectory,
  type BlockedGoalAutomaticRecoveryAction,
  type BlockedGoalAutomaticRecoveryActionInput,
  type BlockedGoalBlocker,
  type BlockedGoalBlockerCategory,
  type BlockedGoalBlockerInput,
  type BlockedGoalBlockerStatus,
  type BlockedGoalBlockerSummary,
  type BlockedGoalExternalPrerequisite,
  type BlockedGoalExternalPrerequisiteInput,
  type BlockedGoalInputProvenance,
  type BlockedGoalMaintainerDecisionRequest,
  type BlockedGoalMaintainerDecisionRequestInput,
  type BlockedGoalRecoveryInput,
  type BlockedGoalRecoveryPackage,
  type BlockedGoalRecoveryStatus,
  type BlockedGoalResumeCommand,
  type BlockedGoalResumeCommandInput,
  type BlockedGoalSourceAuditInput,
  type BlockedGoalSourceGoalInput,
  type BlockedGoalSourceLogInput,
  type BlockedGoalSourceProvenance,
  type BuildBlockedGoalRecoveryPackageInput,
  type WriteBlockedGoalRecoveryPackageFromDirectoryInput,
  type WriteBlockedGoalRecoveryPackageInput,
  type WriteBlockedGoalRecoveryPackageResult
} from './blocked-goal-recovery-package.js';

export {
  buildBlockedGoalRecoveryConsumptionReport,
  buildBlockedGoalRecoveryConsumptionReportMarkdown,
  writeBlockedGoalRecoveryConsumptionReport,
  type BlockedGoalRecoveryActionType,
  type BlockedGoalRecoveryAllowedDecision,
  type BlockedGoalRecoveryConsumptionAction,
  type BlockedGoalRecoveryConsumptionReport,
  type BlockedGoalRecoveryEvidenceReadOrderItem,
  type BlockedGoalResumeReadiness,
  type BuildBlockedGoalRecoveryConsumptionReportInput,
  type WriteBlockedGoalRecoveryConsumptionReportInput,
  type WriteBlockedGoalRecoveryConsumptionReportResult
} from './blocked-goal-recovery-consumption-report.js';

export {
  BLOCKED_GOAL_RECOVERY_DECISION_RECEIPT_MAINTAINER_REVIEW_BOUNDARY,
  BLOCKED_GOAL_RECOVERY_DECISION_RECEIPT_NON_AUTHORIZATION_BOUNDARY,
  buildBlockedGoalRecoveryDecisionReceipt,
  buildBlockedGoalRecoveryDecisionReceiptMarkdown,
  writeBlockedGoalRecoveryDecisionReceipt,
  writeBlockedGoalRecoveryDecisionReceiptFromDirectory,
  type BlockedGoalRecoveryDecision,
  type BlockedGoalRecoveryDecisionInputItem,
  type BlockedGoalRecoveryDecisionItem,
  type BlockedGoalRecoveryDecisionReceipt,
  type BlockedGoalRecoveryDecisionStatus,
  type BlockedGoalRecoveryRecordedDecision,
  type BlockedGoalRecoveryResumeAttemptReadiness,
  type BlockedGoalRecoveryResumeCommandDecisionInputItem,
  type BlockedGoalRecoveryResumeCommandDecisionItem,
  type BuildBlockedGoalRecoveryDecisionReceiptInput,
  type WriteBlockedGoalRecoveryDecisionReceiptFromDirectoryInput,
  type WriteBlockedGoalRecoveryDecisionReceiptInput,
  type WriteBlockedGoalRecoveryDecisionReceiptResult
} from './blocked-goal-recovery-decision-receipt.js';

export {
  buildBlockedGoalRecoveryResumeAttemptTaskPackage,
  buildBlockedGoalRecoveryResumeAttemptTaskPackageMarkdown,
  writeBlockedGoalRecoveryResumeAttemptTaskPackage,
  writeBlockedGoalRecoveryResumeAttemptTaskPackageFromDirectory,
  type BlockedGoalRecoveryResumeAttemptActionTask,
  type BlockedGoalRecoveryResumeAttemptCommandTask,
  type BlockedGoalRecoveryResumeAttemptTaskPackage,
  type BlockedGoalRecoveryResumeAttemptTaskPackageStatus,
  type BuildBlockedGoalRecoveryResumeAttemptTaskPackageInput,
  type WriteBlockedGoalRecoveryResumeAttemptTaskPackageFromDirectoryInput,
  type WriteBlockedGoalRecoveryResumeAttemptTaskPackageInput,
  type WriteBlockedGoalRecoveryResumeAttemptTaskPackageResult
} from './blocked-goal-recovery-resume-attempt-task-package.js';

export {
  assertBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake,
  buildBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake,
  buildBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeMarkdown,
  writeBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake,
  writeBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeFromDirectory,
  type BlockedGoalRecoveryResumeAttemptEvidenceResultStatus,
  type BlockedGoalRecoveryResumeAttemptExecutionEvidenceInput,
  type BlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake,
  type BlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeStatus,
  type BlockedGoalRecoveryResumeAttemptExecutionResultInput,
  type BuildBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeInput,
  type WriteBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeFromDirectoryInput,
  type WriteBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeInput,
  type WriteBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeResult
} from './blocked-goal-recovery-resume-attempt-execution-evidence-intake.js';

export {
  buildBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage,
  buildBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackageMarkdown,
  writeBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage,
  writeBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackageFromDirectory,
  type BlockedGoalRecoveryResumeAttemptEvidenceRecordedDecision,
  type BlockedGoalRecoveryResumeAttemptEvidenceReviewDecision,
  type BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionInput,
  type BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionInputItem,
  type BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage,
  type BlockedGoalRecoveryResumeAttemptEvidenceReviewItem,
  type BlockedGoalRecoveryResumeAttemptEvidenceReviewStatus,
  type BuildBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackageInput,
  type WriteBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackageFromDirectoryInput,
  type WriteBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackageInput,
  type WriteBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackageResult
} from './blocked-goal-recovery-resume-attempt-evidence-review-decision-package.js';

export {
  buildValidationCampaignSummary,
  buildValidationCampaignSummaryMarkdown,
  writeValidationCampaignSummary,
  type ValidationCampaignSummary,
  type ValidationCampaignSummaryInput,
  type ValidationCampaignSummaryTarget,
  type ValidationCampaignTargetInput
} from './campaign-summary.js';

export {
  formatUserAcceptanceCommand,
  parseUserAcceptanceArgs,
  type UserAcceptanceCliOptions,
  type UserAcceptanceMode
} from './user-acceptance-args.js';

export {
  acceptanceHelpText,
  buildPackageSubpathImportSmokeCommand,
  buildPackageSubpathTypeResolutionSmokeCommand,
  formatAcceptanceCommand,
  isAcceptanceHelpRequest,
  isDirectRun as isAcceptanceDirectRun,
  main as runAcceptanceCli,
  parseArgs as parseAcceptanceArgs,
  type AcceptanceCliOptions,
  type AcceptanceCommand
} from './run-acceptance.js';

export {
  shellQuoteArg
} from './shell-quote.js';

export {
  parseShellWords
} from './shell-words.js';

export {
  classifyUserAcceptanceRecord,
  isAcceptanceRunFreshEnough,
  isAcceptedUserAcceptanceRecord,
  type UserAcceptanceRecordCheckOptions,
  type UserAcceptanceRecordStatus
} from './user-acceptance-record.js';

export {
  buildGeneratedTestValidationCheck,
  buildRepoRootPreflightCheck,
  buildUserAcceptanceArtifactChecks,
  buildUserAcceptanceRepoPreflightChecks,
  ensureGeneratedTestPlaywrightDependency,
  formatGeneratedTestValidationCommand,
  formatGeneratedTestValidationEvidenceCommand,
  formatGeneratedTestValidationFailureEvidence,
  selectGeneratedTestValidationBaseUrl,
  shouldManageGeneratedTestBootSession,
  writeUserAcceptanceRecord,
  type UserAcceptanceArtifactChecksInput
} from './user-acceptance-runner-helpers.js';

export {
  buildUserAcceptanceHandoffRepoPreflightChecks,
  buildUserAcceptanceHandoffRepoPreflightChecksForMode,
  isDirectRun as isUserAcceptanceHandoffDirectRun,
  isUserAcceptanceHandoffHelpRequest,
  main as runUserAcceptanceHandoffCli,
  parseUserAcceptanceHandoffArgs,
  runUserAcceptanceHandoff,
  userAcceptanceHandoffHelpText,
  writeGoalAuditDocument,
  writeUserAcceptanceHandoff,
  type UserAcceptanceHandoffCliOptions,
  type UserAcceptanceHandoffRunInput,
  type UserAcceptanceHandoffRunOptions
} from './run-user-acceptance-handoff.js';

export {
  buildRepairHandoffPackage,
  formatRepairHandoffMarkdown,
  formatVerificationPlanMarkdown,
  isDirectRun as isRepairHandoffDirectRun,
  isRepairHandoffHelpRequest,
  main as runRepairHandoffCli,
  parseRepairHandoffArgs,
  repairHandoffHelpText,
  runRepairHandoff,
  type RepairHandoffCliOptions,
  type RepairHandoffManifest,
  type RepairHandoffMode,
  type RepairHandoffPackage,
  type RepairHandoffPriority,
  type RepairHandoffRunInput,
  type RepairHandoffRunResult,
  type RepairHandoffTask
} from './run-repair-handoff.js';

export {
  buildRepairExecutionReport,
  formatRepairExecutionReportMarkdown,
  isDirectRun as isRepairExecuteDirectRun,
  isRepairExecuteHelpRequest,
  main as runRepairExecuteCli,
  parseRepairExecuteArgs,
  repairExecuteHelpText,
  runRepairExecute,
  type RepairExecuteCliOptions,
  type RepairExecuteMode,
  type RepairExecuteRunInput,
  type RepairExecuteRunResult,
  type RepairExecutionReport,
  type RepairExecutionStatus,
  type RepairExecutionTaskReport,
  type RepairVerificationCommandResult
} from './run-repair-execute.js';

export {
  buildPatchPlan,
  formatPatchPlanMarkdown,
  isDirectRun as isRepairPatchPlanDirectRun,
  isRepairPatchPlanHelpRequest,
  main as runRepairPatchPlanCli,
  parseRepairPatchPlanArgs,
  repairPatchPlanHelpText,
  runRepairPatchPlan,
  type PatchAction,
  type PatchActionType,
  type PatchPlan,
  type PatchPlanStatus,
  type PatchRisk,
  type RepairPatchPlanCliOptions,
  type RepairPatchPlanRunInput,
  type RepairPatchPlanRunResult
} from './run-repair-patch-plan.js';

export {
  isDirectRun as isUserAcceptanceDirectRun,
  isUserAcceptanceHelpRequest,
  main as runUserAcceptanceCli,
  runUserAcceptance,
  userAcceptanceHelpText,
  type BootAppToolSession,
  type ExploreBrowserDriver,
  type RunBootApp,
  type RunHardeningInput,
  type RunHardeningResult,
  type UserAcceptanceDependencies
} from './run-user-acceptance.js';

export {
  buildCurrentGoalAuditItems,
  buildGoalAuditItemsFromWorkspace,
  isDirectRun as isGoalAuditDirectRun,
  main as runGoalAuditCli,
  runGoalAudit,
  writeGoalAuditDocument as writeGoalAuditRunnerDocument,
  type GoalAuditRunInput,
  type GoalAuditWorkspaceInput
} from './run-goal-audit.js';
