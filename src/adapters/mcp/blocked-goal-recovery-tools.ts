import { lstat, realpath } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  writeBlockedGoalRecoveryConsumptionReport,
  writeBlockedGoalRecoveryDecisionReceiptFromDirectory,
  writeBlockedGoalRecoveryLifecycleCampaignSummary,
  writeBlockedGoalRecoveryPackageFromDirectory,
  writeBlockedGoalRecoveryResumeAttemptClosureReceiptFromDirectory,
  writeBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackageFromDirectory,
  writeBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeFromDirectory,
  writeBlockedGoalRecoveryResumeAttemptTaskPackageFromDirectory,
  withBlockedGoalRecoveryDirectoryGuards
} from '@hardening-mcp/acceptance';

type JsonObject = Record<string, unknown>;

export const blockedGoalRecoveryToolNames = [
  'create_blocked_goal_recovery',
  'consume_blocked_goal_recovery',
  'record_blocked_goal_recovery_decision',
  'prepare_blocked_goal_resume_attempt',
  'intake_blocked_goal_resume_evidence',
  'review_blocked_goal_resume_evidence',
  'close_blocked_goal_resume_attempt',
  'validate_blocked_goal_recovery_lifecycle'
] as const;

export type BlockedGoalRecoveryToolName = typeof blockedGoalRecoveryToolNames[number];

const stageByTool: Record<BlockedGoalRecoveryToolName, string> = {
  create_blocked_goal_recovery: 'recovery_package',
  consume_blocked_goal_recovery: 'consumption_report',
  record_blocked_goal_recovery_decision: 'decision_receipt',
  prepare_blocked_goal_resume_attempt: 'resume_attempt_task_package',
  intake_blocked_goal_resume_evidence: 'execution_evidence_intake',
  review_blocked_goal_resume_evidence: 'evidence_review_decision_package',
  close_blocked_goal_resume_attempt: 'closure_receipt',
  validate_blocked_goal_recovery_lifecycle: 'lifecycle_campaign_summary'
};

const titleByTool: Record<BlockedGoalRecoveryToolName, string> = {
  create_blocked_goal_recovery: 'Create Blocked Goal Recovery Package',
  consume_blocked_goal_recovery: 'Consume Blocked Goal Recovery Package',
  record_blocked_goal_recovery_decision: 'Record Blocked Goal Recovery Decision',
  prepare_blocked_goal_resume_attempt: 'Prepare Blocked Goal Resume Attempt',
  intake_blocked_goal_resume_evidence: 'Intake Blocked Goal Resume Evidence',
  review_blocked_goal_resume_evidence: 'Review Blocked Goal Resume Evidence',
  close_blocked_goal_resume_attempt: 'Close Blocked Goal Resume Attempt',
  validate_blocked_goal_recovery_lifecycle: 'Validate Blocked Goal Recovery Lifecycle'
};

const requiredInputsByTool: Record<BlockedGoalRecoveryToolName, string[]> = {
  create_blocked_goal_recovery: ['blocked-goal-recovery-input.json'],
  consume_blocked_goal_recovery: ['blocked-goal-recovery-package.json'],
  record_blocked_goal_recovery_decision: [
    'blocked-goal-recovery-consumption-report.json',
    'blocked-goal-recovery-decisions.json'
  ],
  prepare_blocked_goal_resume_attempt: [
    'blocked-goal-recovery-decision-receipt.json',
    'blocked-goal-recovery-resume-attempt-task-input.json'
  ],
  intake_blocked_goal_resume_evidence: [
    'blocked-goal-recovery-resume-attempt-task-package.json',
    'blocked-goal-recovery-resume-attempt-execution-evidence-input.json'
  ],
  review_blocked_goal_resume_evidence: [
    'blocked-goal-recovery-resume-attempt-task-package.json',
    'blocked-goal-recovery-resume-attempt-execution-evidence-intake.json',
    'blocked-goal-recovery-resume-attempt-evidence-review-decisions.json'
  ],
  close_blocked_goal_resume_attempt: [
    'blocked-goal-recovery-resume-attempt-task-package.json',
    'blocked-goal-recovery-resume-attempt-execution-evidence-intake.json',
    'blocked-goal-recovery-resume-attempt-evidence-review-decision-package.json',
    'blocked-goal-recovery-resume-attempt-closure-input.json'
  ],
  validate_blocked_goal_recovery_lifecycle: ['blocked-goal-recovery-lifecycle-campaign-input.json']
};

const outputArtifactsByTool: Record<BlockedGoalRecoveryToolName, [string, string]> = {
  create_blocked_goal_recovery: ['blocked-goal-recovery-package.json', 'blocked-goal-recovery-package.md'],
  consume_blocked_goal_recovery: [
    'blocked-goal-recovery-consumption-report.json',
    'blocked-goal-recovery-consumption-report.md'
  ],
  record_blocked_goal_recovery_decision: [
    'blocked-goal-recovery-decision-receipt.json',
    'blocked-goal-recovery-decision-receipt.md'
  ],
  prepare_blocked_goal_resume_attempt: [
    'blocked-goal-recovery-resume-attempt-task-package.json',
    'blocked-goal-recovery-resume-attempt-task-package.md'
  ],
  intake_blocked_goal_resume_evidence: [
    'blocked-goal-recovery-resume-attempt-execution-evidence-intake.json',
    'blocked-goal-recovery-resume-attempt-execution-evidence-intake.md'
  ],
  review_blocked_goal_resume_evidence: [
    'blocked-goal-recovery-resume-attempt-evidence-review-decision-package.json',
    'blocked-goal-recovery-resume-attempt-evidence-review-decision-package.md'
  ],
  close_blocked_goal_resume_attempt: [
    'blocked-goal-recovery-resume-attempt-closure-receipt.json',
    'blocked-goal-recovery-resume-attempt-closure-receipt.md'
  ],
  validate_blocked_goal_recovery_lifecycle: [
    'blocked-goal-recovery-lifecycle-campaign-summary.json',
    'blocked-goal-recovery-lifecycle-campaign-summary.md'
  ]
};

const outputSchemaVersionByTool: Record<BlockedGoalRecoveryToolName, string> = {
  create_blocked_goal_recovery: 'repoassure.blocked-goal-recovery-package.v1',
  consume_blocked_goal_recovery: 'repoassure.blocked-goal-recovery-consumption-report.v1',
  record_blocked_goal_recovery_decision: 'repoassure.blocked-goal-recovery-decision-receipt.v1',
  prepare_blocked_goal_resume_attempt: 'repoassure.blocked-goal-recovery-resume-attempt-task-package.v1',
  intake_blocked_goal_resume_evidence: 'repoassure.blocked-goal-recovery-resume-attempt-execution-evidence-intake.v1',
  review_blocked_goal_resume_evidence:
    'repoassure.blocked-goal-recovery-resume-attempt-evidence-review-decision-package.v1',
  close_blocked_goal_resume_attempt: 'repoassure.blocked-goal-recovery-resume-attempt-closure-receipt.v1',
  validate_blocked_goal_recovery_lifecycle: 'repoassure.blocked-goal-recovery-lifecycle-campaign-summary.v1'
};

const outputFieldsByTool: Record<BlockedGoalRecoveryToolName, readonly string[]> = {
  create_blocked_goal_recovery: [
    'schemaVersion', 'generatedAt', 'recoveryStatus', 'sourceProvenance', 'blockerSummary', 'blockers',
    'automaticRecoveryActions', 'maintainerDecisionRequests', 'externalPrerequisites', 'resumeCommands',
    'maintainerReviewBoundary', 'redactionBoundary', 'nonAuthorizationBoundary', 'blockedActions'
  ],
  consume_blocked_goal_recovery: [
    'schemaVersion', 'generatedAt', 'sourceRecoveryPackage', 'resumeReadiness', 'evidenceReadOrder',
    'actionQueue', 'resumeChecklist', 'resumeCommands', 'boundaryCompliance', 'maintainerReviewBoundary',
    'redactionBoundary', 'nonAuthorizationBoundary', 'blockedActions'
  ],
  record_blocked_goal_recovery_decision: [
    'schemaVersion', 'generatedAt', 'decisionStatus', 'resumeAttemptReadiness', 'sourceConsumptionReport',
    'decisionSummary', 'decisionItems', 'approvedActions', 'rejectedActions', 'deferredActions',
    'riskAcceptedActions', 'resumeCommandDecisionItems', 'boundaryCompliance', 'maintainerReviewBoundary',
    'redactionBoundary', 'nonAuthorizationBoundary', 'blockedActions'
  ],
  prepare_blocked_goal_resume_attempt: [
    'schemaVersion', 'generatedAt', 'taskPackageStatus', 'sourceDecisionReceipt', 'blockedReasons', 'actionTasks',
    'resumeCommandTasks', 'prerequisites', 'verificationChecklist', 'excludedItems', 'boundaryCompliance',
    'maintainerReviewBoundary', 'redactionBoundary', 'nonAuthorizationBoundary', 'blockedActions'
  ],
  intake_blocked_goal_resume_evidence: [
    'schemaVersion', 'generatedAt', 'intakeStatus', 'sourceTaskPackage', 'attempt', 'actionResults',
    'resumeCommandResults', 'verificationResults', 'unresolvedTaskIds', 'boundaryCompliance', 'reviewChecklist',
    'maintainerReviewBoundary', 'redactionBoundary', 'nonAuthorizationBoundary', 'blockedActions'
  ],
  review_blocked_goal_resume_evidence: [
    'schemaVersion', 'generatedAt', 'reviewStatus', 'sourceEvidenceIntake', 'decisionSummary', 'reviewItems',
    'acceptedEvidenceScope', 'unresolvedEvidenceKeys', 'boundaryCompliance', 'maintainerReviewBoundary',
    'redactionBoundary', 'nonAuthorizationBoundary', 'blockedActions'
  ],
  close_blocked_goal_resume_attempt: [
    'schemaVersion', 'generatedAt', 'closureStatus', 'sourceEvidenceReviewPackage', 'closureEvidence',
    'reviewerRole', 'closedEvidenceScope', 'acceptedRiskEvidenceKeys', 'residualRisks', 'verificationSummary',
    'boundaryCompliance', 'maintainerReviewBoundary', 'redactionBoundary', 'nonAuthorizationBoundary',
    'blockedActions'
  ],
  validate_blocked_goal_recovery_lifecycle: [
    'schemaVersion', 'generatedAt', 'campaignId', 'campaignStatus', 'coverage', 'scenarios', 'redactionBoundary',
    'nonAuthorizationBoundary'
  ]
};

export function listBlockedGoalRecoveryTools(): Tool[] {
  return blockedGoalRecoveryToolNames.map((name) => ({
    name,
    title: titleByTool[name],
    description: `${titleByTool[name]} from local artifacts; writes bounded local evidence and does not execute recovery or resume commands, mutate target repos, or change external state.`,
    inputSchema: directoryInputSchema(),
    outputSchema: recoveryOutputSchema(name),
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: false
    }
  }));
}

export function isBlockedGoalRecoveryToolName(value: string): value is BlockedGoalRecoveryToolName {
  return blockedGoalRecoveryToolNames.includes(value as BlockedGoalRecoveryToolName);
}

export async function runBlockedGoalRecoveryTool(
  name: BlockedGoalRecoveryToolName,
  args: JsonObject
): Promise<JsonObject> {
  assertExactArguments(args);
  const inputDir = readRequiredString(args, 'inputDir');
  const outputDir = readOptionalString(args, 'outputDir');
  const directories = await resolveContainedDirectories(inputDir, outputDir);
  return withBlockedGoalRecoveryDirectoryGuards(
    [directories.inputDir, directories.outputDir],
    async (): Promise<JsonObject> => {
      await assertContainedInputArtifacts(name, directories.inputDir);
      await assertSafeOutputArtifacts(name, directories.outputDir);

      if (name === 'create_blocked_goal_recovery') {
        const result = await writeBlockedGoalRecoveryPackageFromDirectory(directories);
        return toolResult(name, result.jsonPath, result.markdownPath, result.recoveryPackage);
      }
      if (name === 'consume_blocked_goal_recovery') {
        const result = await writeBlockedGoalRecoveryConsumptionReport({
          packagePath: join(directories.inputDir, 'blocked-goal-recovery-package.json'),
          outputDir: directories.outputDir
        });
        return toolResult(name, result.jsonPath, result.markdownPath, result.report);
      }
      if (name === 'record_blocked_goal_recovery_decision') {
        const result = await writeBlockedGoalRecoveryDecisionReceiptFromDirectory(directories);
        return toolResult(name, result.jsonPath, result.markdownPath, result.receipt);
      }
      if (name === 'prepare_blocked_goal_resume_attempt') {
        const result = await writeBlockedGoalRecoveryResumeAttemptTaskPackageFromDirectory(directories);
        return toolResult(name, result.jsonPath, result.markdownPath, result.taskPackage);
      }
      if (name === 'intake_blocked_goal_resume_evidence') {
        const result = await writeBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeFromDirectory(directories);
        return toolResult(name, result.jsonPath, result.markdownPath, result.intake);
      }
      if (name === 'review_blocked_goal_resume_evidence') {
        const result = await writeBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackageFromDirectory(directories);
        return toolResult(name, result.jsonPath, result.markdownPath, result.reviewPackage);
      }
      if (name === 'close_blocked_goal_resume_attempt') {
        const result = await writeBlockedGoalRecoveryResumeAttemptClosureReceiptFromDirectory(directories);
        return toolResult(name, result.jsonPath, result.markdownPath, result.receipt);
      }

      const result = await writeBlockedGoalRecoveryLifecycleCampaignSummary({
        inputDir: directories.inputDir,
        outputDir: directories.outputDir
      });
      return toolResult(name, result.jsonPath, result.markdownPath, result.summary);
    }
  );
}

async function assertSafeOutputArtifacts(toolName: BlockedGoalRecoveryToolName, outputRoot: string): Promise<void> {
  for (const fileName of outputArtifactsByTool[toolName]) {
    try {
      const metadata = await lstat(join(outputRoot, fileName));
      if (metadata.isSymbolicLink()) {
        throw new Error(`Output artifact must not be a symbolic link: ${fileName}`);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
}

async function assertContainedInputArtifacts(
  toolName: BlockedGoalRecoveryToolName,
  inputRoot: string
): Promise<void> {
  for (const fileName of requiredInputsByTool[toolName]) {
    const artifactPath = await realpath(join(inputRoot, fileName));
    if (artifactPath !== inputRoot && !artifactPath.startsWith(`${inputRoot}${sep}`)) {
      throw new Error(`Input artifact must resolve within inputDir: ${fileName}`);
    }
  }
}

function toolResult(
  toolName: BlockedGoalRecoveryToolName,
  jsonPath: string,
  markdownPath: string,
  output: object
): JsonObject {
  return {
    schemaVersion: 'repoassure.mcp-blocked-goal-recovery-tool-result.v1',
    toolName,
    stage: stageByTool[toolName],
    artifacts: { jsonPath, markdownPath },
    output,
    boundaryCompliance: {
      commandsExecuted: false,
      externalStateChanged: false,
      targetRepoMutation: false
    }
  };
}

async function resolveContainedDirectories(
  inputDir: string,
  outputDir: string | null
): Promise<{ inputDir: string; outputDir: string }> {
  const inputRoot = await realpath(resolve(inputDir));
  const outputRoot = outputDir ? await realpath(resolve(outputDir)) : inputRoot;
  if (outputRoot !== inputRoot && !outputRoot.startsWith(`${inputRoot}${sep}`)) {
    throw new Error('outputDir must resolve within inputDir');
  }
  return { inputDir: inputRoot, outputDir: outputRoot };
}

function assertExactArguments(args: JsonObject): void {
  const allowed = new Set(['inputDir', 'outputDir']);
  const unexpected = Object.keys(args).find((key) => !allowed.has(key));
  if (unexpected) throw new Error(`Unexpected argument: ${unexpected}`);
  if (args.outputDir !== undefined && readOptionalString(args, 'outputDir') === null) {
    throw new Error('Invalid optional string argument: outputDir');
  }
}

function readRequiredString(args: JsonObject, key: string): string {
  const value = readOptionalString(args, key);
  if (!value) throw new Error(`Missing required string argument: ${key}`);
  return value;
}

function readOptionalString(args: JsonObject, key: string): string | null {
  const value = args[key];
  return typeof value === 'string' && value.trim() ? value : null;
}

function directoryInputSchema(): Tool['inputSchema'] {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      inputDir: { type: 'string', description: 'Existing local directory containing stage input artifacts.' },
      outputDir: { type: 'string', description: 'Optional existing output directory contained by inputDir.' }
    },
    required: ['inputDir']
  };
}

function recoveryOutputSchema(name: BlockedGoalRecoveryToolName): NonNullable<Tool['outputSchema']> {
  const [jsonFileName, markdownFileName] = outputArtifactsByTool[name];
  const outputFields = outputFieldsByTool[name];
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      schemaVersion: { type: 'string', const: 'repoassure.mcp-blocked-goal-recovery-tool-result.v1' },
      toolName: { type: 'string', const: name },
      stage: { type: 'string', const: stageByTool[name] },
      artifacts: {
        type: 'object',
        additionalProperties: false,
        properties: {
          jsonPath: { type: 'string', pattern: `(?:^|[\\\\/])${escapeRegExp(jsonFileName)}$` },
          markdownPath: { type: 'string', pattern: `(?:^|[\\\\/])${escapeRegExp(markdownFileName)}$` }
        },
        required: ['jsonPath', 'markdownPath']
      },
      output: {
        type: 'object',
        additionalProperties: false,
        properties: Object.fromEntries(outputFields.map((field) => [
          field,
          field === 'schemaVersion'
            ? { type: 'string', const: outputSchemaVersionByTool[name] }
            : {}
        ])),
        required: [...outputFields]
      },
      boundaryCompliance: {
        type: 'object',
        additionalProperties: false,
        properties: {
          commandsExecuted: { type: 'boolean', const: false },
          externalStateChanged: { type: 'boolean', const: false },
          targetRepoMutation: { type: 'boolean', const: false }
        },
        required: ['commandsExecuted', 'externalStateChanged', 'targetRepoMutation']
      }
    },
    required: ['schemaVersion', 'toolName', 'stage', 'artifacts', 'output', 'boundaryCompliance']
  };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}
