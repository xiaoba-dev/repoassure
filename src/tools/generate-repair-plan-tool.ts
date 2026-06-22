import { realpath } from 'node:fs/promises';
import { join } from 'node:path';

import {
  generateRepairPlan,
  type GenerateRepairPlanInput
} from '../domain/repair-plan/generate-repair-plan.js';
import type { RepairPlanGenerationResult } from '../types/repair-plan.js';

export interface GenerateRepairPlanToolInput {
  root: string;
  runDir?: string;
  sourceManifestPath?: string;
  runId?: string;
}

export async function runGenerateRepairPlanTool(input: GenerateRepairPlanToolInput): Promise<RepairPlanGenerationResult> {
  const runDir = input.runDir ?? join(input.root, '.hardening', 'latest');
  const resolvedRunDir = await resolveRunDir(runDir);
  const sourceManifestPath = input.sourceManifestPath ?? join(runDir, 'manifest.json');
  const repairInput: GenerateRepairPlanInput = {
    repoRoot: input.root,
    runDir,
    sourceManifestPath,
    runId: input.runId ?? inferRunId(resolvedRunDir)
  };

  return generateRepairPlan(repairInput);
}

async function resolveRunDir(runDir: string): Promise<string> {
  try {
    return await realpath(runDir);
  } catch {
    return runDir;
  }
}

function inferRunId(runDir: string): string {
  const match = /(?:^|[/\\])(run-[^/\\]+)$/.exec(runDir);
  return match?.[1] ?? 'latest';
}
