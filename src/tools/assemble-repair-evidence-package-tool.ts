import {
  runRepairEvidencePackage,
  type RepairEvidencePackageRunInput
} from '@hardening-mcp/acceptance/run-repair-evidence-package';

export interface AssembleRepairEvidencePackageToolInput {
  handoffPackagePath: string;
  dryRunReportPath: string;
  validationReportPath: string;
  patchPlanPath: string;
  outputDir?: string;
}

export interface AssembleRepairEvidencePackageToolResult {
  packagePath: string;
  markdownPath: string;
  taskCount: number;
  status: 'no_actions' | 'review_required';
}

export async function runAssembleRepairEvidencePackageTool(
  input: AssembleRepairEvidencePackageToolInput
): Promise<AssembleRepairEvidencePackageToolResult> {
  const runInput: RepairEvidencePackageRunInput = {
    handoffPackagePath: input.handoffPackagePath,
    dryRunReportPath: input.dryRunReportPath,
    validationReportPath: input.validationReportPath,
    patchPlanPath: input.patchPlanPath,
    ...(input.outputDir ? { outputDir: input.outputDir } : {})
  };
  const result = await runRepairEvidencePackage(runInput);

  return {
    packagePath: result.packagePath,
    markdownPath: result.markdownPath,
    taskCount: result.taskCount,
    status: result.status
  };
}
