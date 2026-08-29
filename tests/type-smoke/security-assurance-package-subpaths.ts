import {
  importSecurityEvidence,
  securityAssuranceCompatibilityContract
} from '@hardening-mcp/security-assurance';
import {
  securityAssurancePackageExportEntries
} from '@hardening-mcp/security-assurance/compatibility';
import type {
  ImportSecurityEvidenceInput,
  ImportSecurityEvidenceResult
} from '@hardening-mcp/security-assurance/import-security-evidence';
import {
  formatSecurityImportError,
  listSecurityProviderDescriptors,
  parseSecurityProvider,
  SecurityImportError
} from '@hardening-mcp/security-assurance/security-provider-contracts';

const input: ImportSecurityEvidenceInput = {
  provider: 'codex-security',
  sourcePath: 'fixtures/security/codex-security-basic',
  repoRoot: '/tmp/repo',
  runDir: '/tmp/repo/.hardening/runs/run-1',
  runId: 'run-1'
};

const importer: (value: ImportSecurityEvidenceInput) => Promise<ImportSecurityEvidenceResult> = importSecurityEvidence;

void input;
void importer;
void securityAssuranceCompatibilityContract;
void securityAssurancePackageExportEntries;
void formatSecurityImportError;
void listSecurityProviderDescriptors;
void parseSecurityProvider;
void SecurityImportError;
