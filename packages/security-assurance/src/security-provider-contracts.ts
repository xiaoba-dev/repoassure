export type SecurityProvider = 'codex-security' | 'codeql' | 'semgrep' | 'gitleaks' | 'osv' | 'manual-import';

export type SecurityImportErrorCode =
  | 'scan_file_missing'
  | 'scan_json_invalid'
  | 'scan_root_invalid'
  | 'provider_mismatch'
  | 'findings_invalid'
  | 'provider_unsupported';

export interface SecurityProviderDescriptor {
  id: SecurityProvider;
  displayName: string;
  supportStatus: 'normalized-envelope';
  nativeFormatSupport: false;
  inputContract: {
    sourceType: 'scan-dir';
    requiredFile: 'scan.json';
    schema: 'repoassure.normalized-security-scan.v1';
  };
}

export interface FormattedSecurityImportError {
  code: SecurityImportErrorCode | 'import_failed';
  message: string;
  guidance: string;
}

const INPUT_CONTRACT = {
  sourceType: 'scan-dir',
  requiredFile: 'scan.json',
  schema: 'repoassure.normalized-security-scan.v1'
} as const;

const PROVIDERS: readonly SecurityProviderDescriptor[] = [
  providerDescriptor('codex-security', 'Codex Security'),
  providerDescriptor('codeql', 'CodeQL'),
  providerDescriptor('semgrep', 'Semgrep'),
  providerDescriptor('gitleaks', 'Gitleaks'),
  providerDescriptor('osv', 'OSV'),
  providerDescriptor('manual-import', 'Manual import')
];

export class SecurityImportError extends Error {
  constructor(
    public readonly code: SecurityImportErrorCode,
    message: string,
    public readonly guidance: string
  ) {
    super(message);
    this.name = 'SecurityImportError';
  }
}

export function listSecurityProviderDescriptors(): SecurityProviderDescriptor[] {
  return PROVIDERS.map((provider) => ({
    ...provider,
    inputContract: { ...provider.inputContract }
  }));
}

export function parseSecurityProvider(value: unknown): SecurityProvider {
  const provider = PROVIDERS.find((candidate) => candidate.id === value)?.id;
  if (!provider) {
    throw new SecurityImportError(
      'provider_unsupported',
      'The requested security evidence provider is not supported.',
      'List the supported providers, then retry with one of their exact ids and a normalized scan.json envelope.'
    );
  }

  return provider;
}

export function formatSecurityImportError(error: unknown): FormattedSecurityImportError {
  if (error instanceof SecurityImportError) {
    return {
      code: error.code,
      message: error.message,
      guidance: error.guidance
    };
  }

  return {
    code: 'import_failed',
    message: 'Security evidence import failed.',
    guidance: 'Confirm the provider id and normalized scan.json input contract, then retry without exposing source contents.'
  };
}

function providerDescriptor(id: SecurityProvider, displayName: string): SecurityProviderDescriptor {
  return {
    id,
    displayName,
    supportStatus: 'normalized-envelope',
    nativeFormatSupport: false,
    inputContract: INPUT_CONTRACT
  };
}
