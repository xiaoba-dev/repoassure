import type { GoalAuditItem } from './goal-audit.js';
import type { UserAcceptanceRecordStatus } from './user-acceptance-record.js';

export function buildUserAcceptanceGoalRequirement(status: UserAcceptanceRecordStatus): GoalAuditItem {
  return {
    category: '用户验收',
    requirement: '用户确认 MVP 符合预期',
    status: status === 'accepted' ? 'passed' : status === 'changes_requested' ? 'missing' : 'manual_required',
    evidence: formatUserAcceptanceAuditEvidence(status),
    ...(status === 'accepted' ? {} : { nextAction: formatUserAcceptanceAuditNextAction(status) })
  };
}

export function formatUserAcceptanceAuditEvidence(status: UserAcceptanceRecordStatus): string[] {
  if (status === 'accepted') {
    return ['docs/acceptance/user-acceptance-record.md records a passing run and accepted user decision'];
  }

  if (status === 'changes_requested') {
    return ['docs/acceptance/user-acceptance-record.md records a passing run and concrete user-requested changes'];
  }

  return ['docs/goals/codex-goal.md Success Definition requires user confirmation or explicit remaining changes'];
}

export function formatUserAcceptanceAuditNextAction(status: UserAcceptanceRecordStatus): string {
  if (status === 'changes_requested') {
    return '按 docs/acceptance/user-acceptance-record.md 的用户备注继续迭代，并在修复后重新运行真实项目验收。';
  }

  return '等待用户提供真实 Web App repo 或人工验收结论；不能由自动脚本代替。';
}
