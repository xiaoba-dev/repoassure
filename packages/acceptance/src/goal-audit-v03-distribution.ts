import type { GoalAuditItem } from './goal-audit.js';
import type { GoalAuditTextSources } from './goal-audit-sources.js';

export function buildV03DistributionRepairLoopGoalAuditItem(
  sources: Partial<GoalAuditTextSources>
): GoalAuditItem {
  const missingMarkers = [
    ...findMissingMarkers(sources.githubActionWrapper ?? '', [
      'name: RepoAssure Local Hardening',
      'node dist/adapters/cli/index.js run',
      'does not upload target repo source, logs, screenshots, traces, env values, or private artifacts'
    ]),
    ...findMissingMarkers(sources.githubActionExample ?? '', [
      'uses: ./.github/actions/repoassure',
      "if: inputs.upload-artifacts == 'true'",
      'actions/upload-artifact'
    ]),
    ...findMissingMarkers(`${sources.packageJson ?? ''}\n${sources.publicReleaseReadinessScript ?? ''}`, [
      '"release:check": "node scripts/check-public-release-readiness.mjs"',
      'runPublicReleaseReadinessCheck'
    ]),
    ...findMissingMarkers(sources.publicReleaseReadinessTests ?? '', [
      'public release readiness checker',
      'private pre-release boundary',
      'tracked files contain generated artifacts or secret-like paths'
    ]),
    ...findMissingMarkers(sources.repairHandoffRunner ?? '', ['repoassure.repair-handoff.v1']),
    ...findMissingMarkers(sources.repairExecuteRunner ?? '', ['repoassure.repair-execution-report.v1']),
    ...findMissingMarkers(sources.repairPatchPlanRunner ?? '', ['repoassure.patch-plan.v1']),
    ...findMissingMarkers(`${sources.readme ?? ''}\n${sources.userAcceptanceGuide ?? ''}`, [
      '.github/actions/repoassure/action.yml',
      'pnpm release:check',
      'RepoAssure Local Hardening'
    ])
  ];

  return {
    category: 'v0.3 分发与修复闭环',
    requirement: 'GitHub Action、agent contract 与 release readiness',
    status: missingMarkers.length === 0 ? 'passed' : 'missing',
    evidence: missingMarkers.length === 0
      ? [
        'v0.3 local-first GitHub Action wrapper exists; repair handoff/execution/patch plan expose agentContract schemas; release:check runs public-release readiness checks without publishing'
      ]
      : [`missing v0.3 readiness markers: ${missingMarkers.join(', ')}`],
    ...(missingMarkers.length > 0
      ? { nextAction: '补齐 GitHub Action wrapper、agentContract、release readiness checks 或文档证据后重新运行 goal audit。' }
      : {})
  };
}

function findMissingMarkers(text: string, markers: string[]): string[] {
  return markers.filter((marker) => !text.includes(marker));
}

