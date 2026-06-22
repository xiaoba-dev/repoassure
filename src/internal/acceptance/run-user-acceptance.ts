import { formatAcceptanceFatalError } from '../../../packages/acceptance/dist/fatal-error.js';
import {
  isDirectRun as isUserAcceptanceDirectRun,
  main as runUserAcceptanceMain
} from '../../../packages/acceptance/dist/run-user-acceptance.js';

export {
  formatUserAcceptanceCommand,
  isDirectRun,
  isUserAcceptanceHelpRequest,
  main,
  parseUserAcceptanceArgs,
  runUserAcceptance,
  userAcceptanceHelpText
} from '../../../packages/acceptance/dist/run-user-acceptance.js';
export type {
  BootAppToolSession,
  ExploreBrowserDriver,
  RunBootApp,
  RunHardeningInput,
  RunHardeningResult,
  UserAcceptanceCliOptions,
  UserAcceptanceDependencies
} from '../../../packages/acceptance/dist/run-user-acceptance.js';
export {
  buildGeneratedTestValidationCheck,
  buildRepoRootPreflightCheck,
  buildUserAcceptanceRepoPreflightChecks,
  ensureGeneratedTestPlaywrightDependency,
  formatGeneratedTestValidationCommand,
  formatGeneratedTestValidationEvidenceCommand,
  formatGeneratedTestValidationFailureEvidence,
  selectGeneratedTestValidationBaseUrl,
  shouldManageGeneratedTestBootSession,
  writeUserAcceptanceRecord
} from '../../../packages/acceptance/dist/user-acceptance-runner-helpers.js';

if (isUserAcceptanceDirectRun(import.meta.url, process.argv[1])) {
  runUserAcceptanceMain().then((exitCode) => {
    process.exitCode = exitCode;
  }).catch((error: unknown) => {
    process.stderr.write(`${formatAcceptanceFatalError('User acceptance runner failed', error)}\n`);
    process.exitCode = 1;
  });
}
