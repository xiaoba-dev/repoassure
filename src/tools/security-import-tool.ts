import { importSecurityEvidence, type ImportSecurityEvidenceResult, type SecurityProvider } from '@hardening-mcp/security-assurance/import-security-evidence';

export interface SecurityImportToolInput {
  provider: SecurityProvider;
  sourcePath: string;
  repoRoot: string;
  runDir: string;
  runId?: string;
}

export type SecurityImportToolResult = ImportSecurityEvidenceResult;

export async function runSecurityImportTool(input: SecurityImportToolInput): Promise<SecurityImportToolResult> {
  return importSecurityEvidence({
    provider: input.provider,
    sourcePath: input.sourcePath,
    repoRoot: input.repoRoot,
    runDir: input.runDir,
    runId: input.runId ?? inferRunId(input.runDir)
  });
}

function inferRunId(runDir: string): string {
  return runDir.split(/[\\/]/u).filter(Boolean).pop() ?? 'run-security-import';
}
