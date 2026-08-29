import {
  runRepairExecute,
  type RepairExecuteRunInput
} from '@hardening-mcp/acceptance/run-repair-execute';

export interface PreviewRepairExecutionToolInput {
  packagePath: string;
  taskIds?: string[];
  all?: true;
  outputDir?: string;
}

export interface PreviewRepairExecutionToolResult {
  reportPath: string;
  markdownPath: string;
  taskCount: number;
  status: 'planned';
}

export async function runPreviewRepairExecutionTool(
  input: PreviewRepairExecutionToolInput
): Promise<PreviewRepairExecutionToolResult> {
  const runInput: RepairExecuteRunInput = {
    packagePath: input.packagePath,
    ...(input.taskIds ? { taskIds: input.taskIds } : {}),
    ...(input.all ? { all: true } : {}),
    dryRun: true,
    validationOnly: false,
    ...(input.outputDir ? { outputDir: input.outputDir } : {})
  };
  const result = await runRepairExecute(runInput);

  if (result.status !== 'planned') {
    throw new Error(`Repair execution preview returned unexpected status: ${result.status}`);
  }

  return {
    reportPath: result.reportPath,
    markdownPath: result.markdownPath,
    taskCount: result.taskCount,
    status: result.status
  };
}
