import { importSecurityEvidence, type ImportSecurityEvidenceResult, type SecurityProvider } from '@hardening-mcp/security-assurance/import-security-evidence';

export interface SecurityImportToolInput {
  provider: SecurityProvider;
  sourcePath: string;
  repoRoot: string;
  runDir: string;
  runId?: string;
}

export interface RepairPlanningHandoff {
  status: 'ready';
  securityFindingsPath: string;
  cli: {
    command: 'hardening plan';
    argv: string[];
  };
  mcp: {
    tool: 'generate_repair_plan';
    arguments: {
      root: string;
      runDir: string;
    };
  };
  reviewBoundary: {
    autoApply: false;
    targetMutation: false;
    maintainerReviewRequired: true;
  };
}

export type SecurityImportToolResult = ImportSecurityEvidenceResult & {
  repairPlanningHandoff: RepairPlanningHandoff;
};

export async function runSecurityImportTool(input: SecurityImportToolInput): Promise<SecurityImportToolResult> {
  const result = await importSecurityEvidence({
    provider: input.provider,
    sourcePath: input.sourcePath,
    repoRoot: input.repoRoot,
    runDir: input.runDir,
    runId: input.runId ?? inferRunId(input.runDir)
  });

  return {
    ...result,
    repairPlanningHandoff: {
      status: 'ready',
      securityFindingsPath: result.securityFindingsPath,
      cli: {
        command: 'hardening plan',
        argv: [input.repoRoot, '--run-dir', input.runDir]
      },
      mcp: {
        tool: 'generate_repair_plan',
        arguments: {
          root: input.repoRoot,
          runDir: input.runDir
        }
      },
      reviewBoundary: {
        autoApply: false,
        targetMutation: false,
        maintainerReviewRequired: true
      }
    }
  };
}

function inferRunId(runDir: string): string {
  return runDir.split(/[\\/]/u).filter(Boolean).pop() ?? 'run-security-import';
}
