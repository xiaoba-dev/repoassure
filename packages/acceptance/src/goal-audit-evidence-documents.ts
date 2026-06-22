import type { GoalAuditItem } from './goal-audit.js';
import type { GoalAuditTextSources } from './goal-audit-sources.js';
import {
  REQUIRED_DOCUMENT_PATHS,
  buildGoalAuditFileRequirement,
  buildGoalAuditTextRequirement
} from './goal-audit-requirements.js';

export interface BuildEvidenceAndDocumentGoalAuditItemsInput {
  sources: Partial<GoalAuditTextSources>;
  pathExists: (path: string) => Promise<boolean>;
}

export async function buildEvidenceAndDocumentGoalAuditItems(
  input: BuildEvidenceAndDocumentGoalAuditItemsInput
): Promise<GoalAuditItem[]> {
  return [
    buildGoalAuditTextRequirement({
      category: 'Benchmark',
      requirement: 'Benchmark 达到 Go 标准',
      text: input.sources.spikeResults ?? '',
      needles: ['| Go/No-go | Go |', '| Benchmark repo 总数 | 5 |', '| 完整流程完成数 | 5 |'],
      evidence: ['docs/logs/spike-results.md reports 5/5 completed and Go']
    }),
    await buildGoalAuditFileRequirement({
      category: '文档与日志',
      requirement: 'Required Documents 已维护',
      paths: [...REQUIRED_DOCUMENT_PATHS],
      evidence: ['README, acceptance guide, acceptance record, architecture, test strategy, checklist, sample report, logs, decisions, benchmark results exist'],
      pathExists: input.pathExists
    })
  ];
}
