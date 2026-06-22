export type FindingSeverity = 'P0' | 'P1' | 'P2';

export type FindingType =
  | 'white_screen'
  | 'broken_route'
  | 'dead_control'
  | 'form_failure'
  | 'console_error'
  | 'network_error';

export interface HardeningFinding {
  severity: FindingSeverity;
  type: FindingType;
  title: string;
  reproSteps: string[];
  evidence: string[];
}

export interface FindingsFile {
  findings: HardeningFinding[];
}

export function parseFindingsFile(value: unknown): FindingsFile {
  if (!isRecord(value) || !Array.isArray(value.findings)) {
    return { findings: [] };
  }

  return {
    findings: value.findings.flatMap((finding) => (isFinding(finding) ? [finding] : []))
  };
}

export function isFinding(value: unknown): value is HardeningFinding {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isSeverity(value.severity) &&
    isFindingType(value.type) &&
    typeof value.title === 'string' &&
    Array.isArray(value.reproSteps) &&
    value.reproSteps.every((step) => typeof step === 'string') &&
    Array.isArray(value.evidence) &&
    value.evidence.every((evidence) => typeof evidence === 'string')
  );
}

export function isSeverity(value: unknown): value is FindingSeverity {
  return value === 'P0' || value === 'P1' || value === 'P2';
}

export function isFindingType(value: unknown): value is FindingType {
  return (
    value === 'white_screen' ||
    value === 'broken_route' ||
    value === 'dead_control' ||
    value === 'form_failure' ||
    value === 'console_error' ||
    value === 'network_error'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
