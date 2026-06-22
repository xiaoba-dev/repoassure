import { formatAcceptanceFatalError } from '../../../packages/acceptance/dist/fatal-error.js';
import {
  isDirectRun as isAcceptanceDirectRun,
  main as runAcceptanceMain
} from '../../../packages/acceptance/dist/run-acceptance.js';

export {
  acceptanceHelpText,
  formatAcceptanceCommand,
  isAcceptanceHelpRequest,
  isDirectRun,
  main,
  parseArgs
} from '../../../packages/acceptance/dist/run-acceptance.js';
export type {
  AcceptanceCliOptions,
  AcceptanceCommand
} from '../../../packages/acceptance/dist/run-acceptance.js';

if (isAcceptanceDirectRun(import.meta.url, process.argv[1])) {
  runAcceptanceMain().then((exitCode) => {
    process.exitCode = exitCode;
  }).catch((error: unknown) => {
    process.stderr.write(`${formatAcceptanceFatalError('Acceptance runner failed', error)}\n`);
    process.exitCode = 1;
  });
}
