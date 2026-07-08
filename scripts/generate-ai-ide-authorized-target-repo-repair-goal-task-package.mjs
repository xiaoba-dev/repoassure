#!/usr/bin/env node
import {
  writeAiIdeAuthorizedTargetRepoRepairGoalTaskPackage,
  writeAiIdeAuthorizedTargetRepoRepairGoalTaskPackageFromDirectory
} from '../packages/acceptance/dist/ai-ide-authorized-target-repo-repair-goal-task-package.js';

function printHelp() {
  console.log(`RepoAssure AI IDE authorized target repo repair goal task package

Usage:
  pnpm playbook:target-repair-goal -- --authorization-receipt <path> --output <dir>
  pnpm playbook:target-repair-goal -- --from-dir <dir> [--output <dir>]

Example:
  pnpm playbook:target-repair-goal -- --authorization-receipt artifacts/campaign/ai-ide-target-repo-repair-goal-authorization-receipt.json --output artifacts/campaign
  pnpm playbook:target-repair-goal -- --from-dir artifacts/campaign
`);
}

function parseArgs(argv) {
  if (argv[0] === '--') {
    argv = argv.slice(1);
  }

  const parsed = {
    authorizationReceiptPath: '',
    outputDir: '',
    fromDir: ''
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    if (arg === '--authorization-receipt') {
      parsed.authorizationReceiptPath = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (arg === '--output') {
      parsed.outputDir = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (arg === '--from-dir') {
      parsed.fromDir = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!parsed.authorizationReceiptPath && !parsed.fromDir) {
    throw new Error('--authorization-receipt or --from-dir is required');
  }

  if (parsed.authorizationReceiptPath && parsed.fromDir) {
    throw new Error('Use either --authorization-receipt or --from-dir, not both');
  }

  if (parsed.authorizationReceiptPath && !parsed.outputDir) {
    throw new Error('--output is required when using --authorization-receipt');
  }

  return parsed;
}

try {
  const options = parseArgs(process.argv.slice(2));
  const result = options.fromDir
    ? await writeAiIdeAuthorizedTargetRepoRepairGoalTaskPackageFromDirectory({
      inputDir: options.fromDir,
      ...(options.outputDir ? { outputDir: options.outputDir } : {})
    })
    : await writeAiIdeAuthorizedTargetRepoRepairGoalTaskPackage({
      authorizationReceiptPath: options.authorizationReceiptPath,
      outputDir: options.outputDir
    });

  console.log(`Wrote ${result.jsonPath}`);
  console.log(`Wrote ${result.markdownPath}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  console.error('');
  printHelp();
  process.exit(1);
}
