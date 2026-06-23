import type { GoalAuditItem } from './goal-audit.js';
import type { GoalAuditTextSources } from './goal-audit-sources.js';
import type { UserAcceptanceRecordStatus } from './user-acceptance-record.js';
import { buildDeliveryAndP0GoalAuditItems } from './goal-audit-delivery.js';
import { buildRuntimeGoalAuditItems } from './goal-audit-runtime.js';
import { buildWorkflowAndArtifactGoalAuditItems } from './goal-audit-workflow-artifacts.js';
import { buildObservabilityAndSecurityGoalAuditItems } from './goal-audit-observability-security.js';
import { buildProcessGovernanceGoalAuditItems } from './goal-audit-process-governance.js';
import { buildEvidenceAndDocumentGoalAuditItems } from './goal-audit-evidence-documents.js';
import { buildUserAcceptanceMaterialRequirements } from './goal-audit-user-acceptance-materials.js';
import { buildUserAcceptanceGoalRequirement } from './goal-audit-user-acceptance.js';
import { buildAcceptanceRunQualityGateRequirement } from './goal-audit-requirements.js';

export interface BuildCurrentGoalAuditItemsFromSourcesInput {
  sources: Partial<GoalAuditTextSources>;
  pathExists: (path: string) => Promise<boolean>;
  userAcceptanceStatus: UserAcceptanceRecordStatus;
}

export async function buildCurrentGoalAuditItemsFromSources(
  input: BuildCurrentGoalAuditItemsFromSourcesInput
): Promise<GoalAuditItem[]> {
  const deliveryAndP0Items = await buildDeliveryAndP0GoalAuditItems({
    sources: input.sources,
    pathExists: input.pathExists
  });
  const runtimeItems = buildRuntimeGoalAuditItems(input.sources);
  const workflowAndArtifactItems = buildWorkflowAndArtifactGoalAuditItems(input.sources);
  const observabilityAndSecurityItems = buildObservabilityAndSecurityGoalAuditItems(input.sources);
  const processGovernanceItems = buildProcessGovernanceGoalAuditItems(input.sources);
  const evidenceAndDocumentItems = await buildEvidenceAndDocumentGoalAuditItems({
    sources: input.sources,
    pathExists: input.pathExists
  });
  const userAcceptanceMaterialItems = buildUserAcceptanceMaterialRequirements(input.sources);

  return [
    deliveryAndP0Items[0],
    deliveryAndP0Items[1],
    deliveryAndP0Items[2],
    runtimeItems[0],
    deliveryAndP0Items[3],
    runtimeItems[1],
    ...workflowAndArtifactItems,
    observabilityAndSecurityItems[0],
    buildAcceptanceRunQualityGateRequirement({
      acceptanceRun: input.sources.acceptanceRun ?? '',
      codexGoal: input.sources.codexGoal ?? ''
    }),
    ...processGovernanceItems,
    ...evidenceAndDocumentItems,
    observabilityAndSecurityItems[1],
    observabilityAndSecurityItems[2],
    observabilityAndSecurityItems[3],
    ...userAcceptanceMaterialItems,
    buildUserAcceptanceGoalRequirement(input.userAcceptanceStatus)
  ].filter(isGoalAuditItem);
}

function isGoalAuditItem(item: GoalAuditItem | undefined): item is GoalAuditItem {
  return item !== undefined;
}
