import { formatAcceptanceFatalError } from '../../../packages/acceptance/dist/fatal-error.js';
import {
  isDirectRun as isUserAcceptanceHandoffDirectRun,
  main as runUserAcceptanceHandoffMain
} from '../../../packages/acceptance/dist/run-user-acceptance-handoff.js';

export {
  buildUserAcceptanceHandoffRepoPreflightChecks,
  isDirectRun,
  isUserAcceptanceHandoffHelpRequest,
  main,
  parseUserAcceptanceHandoffArgs,
  runUserAcceptanceHandoff,
  userAcceptanceHandoffHelpText,
  writeGoalAuditDocument,
  writeUserAcceptanceHandoff
} from '../../../packages/acceptance/dist/run-user-acceptance-handoff.js';
export type {
  UserAcceptanceHandoffCliOptions,
  UserAcceptanceHandoffRunInput,
  UserAcceptanceHandoffRunOptions
} from '../../../packages/acceptance/dist/run-user-acceptance-handoff.js';

if (isUserAcceptanceHandoffDirectRun(import.meta.url, process.argv[1])) {
  runUserAcceptanceHandoffMain().then((exitCode) => {
    process.exitCode = exitCode;
  }).catch((error: unknown) => {
    process.stderr.write(`${formatAcceptanceFatalError('User acceptance handoff failed', error)}\n`);
    process.exitCode = 1;
  });
}
