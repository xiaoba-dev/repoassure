import type { GoalAuditItem } from './goal-audit.js';
import type { GoalAuditTextSources } from './goal-audit-sources.js';

export function buildPublicReleaseReadinessGoalAuditItem(
  sources: Partial<GoalAuditTextSources>
): GoalAuditItem {
  const missingMarkers = [
    ...findMissingMarkers(sources.packageJson ?? '', [
      '"private": true',
      '"license": "Apache-2.0"',
      '"release:check": "node scripts/check-public-release-readiness.mjs"'
    ]),
    ...findMissingMarkers(sources.license ?? '', ['Apache License', 'Version 2.0']),
    ...findMissingMarkers(sources.contributing ?? '', [
      'Developer Certificate of Origin',
      'No CLA is required'
    ]),
    ...findMissingMarkers(sources.securityPolicy ?? '', ['Report a Vulnerability', 'private']),
    ...findMissingMarkers(sources.dependencyLicenseAudit ?? '', [
      'No known incompatible dependency licenses',
      'Apache-2.0'
    ]),
    ...findMissingMarkers(sources.publicReleaseNotes ?? '', [
      'Public Release Notes v0.1',
      'local-first'
    ]),
    ...findMissingMarkers(sources.publicReleaseReadinessAdr ?? '', [
      'Public release readiness boundary',
      'Adding `LICENSE` is readiness preparation, not publication authorization'
    ]),
    ...findMissingMarkers(sources.publicReleaseReadinessScript ?? '', [
      'manual-publication-authorization',
      'repository-license',
      'contribution-policy',
      'security-policy'
    ]),
    ...findMissingMarkers(sources.publicReleaseReadinessTests ?? '', [
      'checks public release policy materials before reporting automated prerequisites ready'
    ]),
    ...findMissingMarkers(sources.publicReleaseChecklist ?? '', [
      'Final maintainer authorization exists before changing visibility'
    ])
  ];

  return {
    category: 'Public Release Readiness',
    requirement: 'license、policy、dependency audit 与 manual authorization gate',
    status: missingMarkers.length === 0 ? 'passed' : 'missing',
    evidence: missingMarkers.length === 0
      ? [
        'Apache-2.0 LICENSE, contribution policy, security policy, dependency license audit, release notes draft, and manual authorization gate are documented and checked without publishing'
      ]
      : [`missing public release readiness markers: ${missingMarkers.join(', ')}`],
    ...(missingMarkers.length > 0
      ? { nextAction: '补齐 public release readiness materials、release checker 或人工授权边界文档后重新运行 goal audit。' }
      : {})
  };
}

function findMissingMarkers(text: string, markers: string[]): string[] {
  return markers.filter((marker) => !text.includes(marker));
}
