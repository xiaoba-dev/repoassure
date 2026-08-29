import {
  runRepairHandoff,
  type RepairHandoffRunInput,
  type RepairHandoffRunResult
} from '@hardening-mcp/acceptance/run-repair-handoff';

export interface PrepareRepairHandoffToolInput {
  runDir: string;
  outputDir?: string;
}

export interface PrepareRepairHandoffToolResult extends RepairHandoffRunResult {
  status: 'generated';
}

export async function runPrepareRepairHandoffTool(
  input: PrepareRepairHandoffToolInput
): Promise<PrepareRepairHandoffToolResult> {
  const handoffInput: RepairHandoffRunInput = {
    runDir: input.runDir,
    ...(input.outputDir ? { outputDir: input.outputDir } : {})
  };
  const result = await runRepairHandoff(handoffInput);

  return {
    ...result,
    status: 'generated'
  };
}
