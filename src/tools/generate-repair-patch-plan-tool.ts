import {
  runRepairPatchPlan,
  type RepairPatchPlanRunInput
} from '@hardening-mcp/acceptance/run-repair-patch-plan';

export interface GenerateRepairPatchPlanToolInput {
  reportPath: string;
  outputDir?: string;
}

export interface GenerateRepairPatchPlanToolResult {
  planPath: string;
  markdownPath: string;
  actionCount: number;
  autoFixCandidates: number;
  status: 'no_actions' | 'review_required';
}

export async function runGenerateRepairPatchPlanTool(
  input: GenerateRepairPatchPlanToolInput
): Promise<GenerateRepairPatchPlanToolResult> {
  const runInput: RepairPatchPlanRunInput = {
    reportPath: input.reportPath,
    ...(input.outputDir ? { outputDir: input.outputDir } : {})
  };
  const result = await runRepairPatchPlan(runInput);

  return {
    planPath: result.planPath,
    markdownPath: result.markdownPath,
    actionCount: result.actionCount,
    autoFixCandidates: result.autoFixCandidates,
    status: result.status
  };
}
