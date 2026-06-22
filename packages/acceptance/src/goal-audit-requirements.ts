import { isAcceptanceRunFreshEnough } from './user-acceptance-record.js';
import type { GoalAuditItem } from './goal-audit.js';

export const REQUIRED_DOCUMENT_PATHS = [
  'README.md',
  'docs/acceptance/guides/user-acceptance-guide.md',
  'docs/acceptance/user-acceptance-record.md',
  'docs/architecture/overview.md',
  'docs/testing/strategy/test-strategy-v0.1.md',
  'docs/acceptance/checklists/acceptance-checklist-v0.1.md',
  'docs/acceptance/user-acceptance-handoff.md',
  'docs/testing/samples/sample-hardening-report.md',
  'docs/logs/dev-log.md',
  'docs/logs/blockers.md',
  'docs/logs/decision-log.md',
  'docs/logs/spike-results.md'
] as const;

export interface GoalAuditTextRequirementInput {
  category: string;
  requirement: string;
  text: string;
  needles: string[];
  evidence: string[];
}

export interface GoalAuditFileRequirementInput {
  category: string;
  requirement: string;
  paths: string[];
  extraPassed?: boolean;
  evidence: string[];
  pathExists: (path: string) => Promise<boolean>;
}

export function buildGoalAuditTextRequirement(input: GoalAuditTextRequirementInput): GoalAuditItem {
  const missingNeedles = input.needles.filter((needle) => !input.text.includes(needle));

  return {
    category: input.category,
    requirement: input.requirement,
    status: missingNeedles.length === 0 ? 'passed' : 'missing',
    evidence: missingNeedles.length === 0 ? input.evidence : [`missing text markers: ${missingNeedles.join(', ')}`],
    ...(missingNeedles.length > 0 ? { nextAction: '补齐实现或文档证据后重新运行 goal audit。' } : {})
  };
}

export async function buildGoalAuditFileRequirement(input: GoalAuditFileRequirementInput): Promise<GoalAuditItem> {
  const missingPaths: string[] = [];

  for (const path of input.paths) {
    if (!await input.pathExists(path)) {
      missingPaths.push(path);
    }
  }

  const missing = missingPaths.length > 0 || input.extraPassed === false;

  return {
    category: input.category,
    requirement: input.requirement,
    status: missing ? 'missing' : 'passed',
    evidence: missing ? [`missing: ${missingPaths.join(', ') || 'extra condition failed'}`] : input.evidence,
    ...(missing ? { nextAction: '补齐缺失文件或配置后重新运行 goal audit。' } : {})
  };
}

export function buildAcceptanceRunQualityGateRequirement(input: {
  acceptanceRun: string;
  codexGoal: string;
}): GoalAuditItem {
  const base = buildGoalAuditTextRequirement({
    category: '质量门禁',
    requirement: '完整验收门禁通过',
    text: input.acceptanceRun,
    needles: [
      '| 验收模式 | full |',
      '| 总体结论 | 通过 |',
      'Package subpath import smoke',
      'Package subpath type-resolution smoke',
      'Integration tests',
      'Benchmark',
      'Real Chromium trace E2E'
    ],
    evidence: ['docs/acceptance/acceptance-run.md full mode passed and is fresh for the current goal update date']
  });

  if (base.status === 'missing') {
    return base;
  }

  if (!isAcceptanceRunFreshEnough(input.acceptanceRun, input.codexGoal)) {
    return {
      category: '质量门禁',
      requirement: '完整验收门禁通过',
      status: 'missing',
      evidence: ['stale docs/acceptance/acceptance-run.md: generated before docs/goals/codex-goal.md last update date or missing generated timestamp'],
      nextAction: '重新运行 `pnpm acceptance -- --full --browser` 后再运行 goal audit。'
    };
  }

  return base;
}
