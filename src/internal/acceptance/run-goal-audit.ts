import { formatAcceptanceFatalError } from '../../../packages/acceptance/dist/fatal-error.js';
import {
  isDirectRun as isGoalAuditDirectRun,
  main as runGoalAuditMain
} from '../../../packages/acceptance/dist/run-goal-audit.js';

export { REQUIRED_DOCUMENT_PATHS } from '../../../packages/acceptance/dist/run-goal-audit.js';
export {
  buildCurrentGoalAuditItems,
  buildGoalAuditItemsFromWorkspace,
  classifyUserAcceptanceRecord,
  isAcceptanceRunFreshEnough,
  isAcceptedUserAcceptanceRecord,
  isDirectRun,
  main,
  runGoalAudit,
  writeGoalAuditDocument
} from '../../../packages/acceptance/dist/run-goal-audit.js';
export type {
  GoalAuditRunInput,
  GoalAuditWorkspaceInput,
  UserAcceptanceRecordCheckOptions,
  UserAcceptanceRecordStatus
} from '../../../packages/acceptance/dist/run-goal-audit.js';

if (isGoalAuditDirectRun(import.meta.url, process.argv[1])) {
  runGoalAuditMain().then((exitCode) => {
    process.exitCode = exitCode;
  }).catch((error: unknown) => {
    process.stderr.write(`${formatAcceptanceFatalError('Goal audit failed', error)}\n`);
    process.exitCode = 1;
  });
}
