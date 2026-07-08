#!/usr/bin/env node
import {
  writeAiIdeTargetRepoRepairGoalAuthorizationReceipt,
  writeAiIdeTargetRepoRepairGoalAuthorizationReceiptFromDirectory
} from '../packages/acceptance/dist/ai-ide-target-repo-repair-goal-authorization-receipt.js';

function printHelp() {
  console.log(`RepoAssure AI IDE target repo repair goal authorization receipt

Usage:
  pnpm playbook:authorize -- --proposal-package <path> --decisions <path> --output <dir>
  pnpm playbook:authorize -- --from-dir <dir> --decisions <path> [--output <dir>]

Example:
  pnpm playbook:authorize -- --proposal-package artifacts/campaign/ai-ide-target-repo-repair-goal-proposal-package.json --decisions artifacts/campaign/authorization-decisions.json --output artifacts/campaign
  pnpm playbook:authorize -- --from-dir artifacts/campaign --decisions artifacts/campaign/authorization-decisions.json
`);
}

function parseArgs(argv) {
  if (argv[0] === '--') {
    argv = argv.slice(1);
  }

  const parsed = {
    proposalPackagePath: '',
    decisionsPath: '',
    outputDir: '',
    fromDir: ''
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    if (arg === '--proposal-package') {
      parsed.proposalPackagePath = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (arg === '--decisions') {
      parsed.decisionsPath = argv[index + 1] ?? '';
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

  if (!parsed.proposalPackagePath && !parsed.fromDir) {
    throw new Error('--proposal-package or --from-dir is required');
  }

  if (parsed.proposalPackagePath && parsed.fromDir) {
    throw new Error('Use either --proposal-package or --from-dir, not both');
  }

  if (!parsed.decisionsPath) {
    throw new Error('--decisions is required');
  }

  if (parsed.proposalPackagePath && !parsed.outputDir) {
    throw new Error('--output is required when using --proposal-package');
  }

  return parsed;
}

try {
  const options = parseArgs(process.argv.slice(2));
  const result = options.fromDir
    ? await writeAiIdeTargetRepoRepairGoalAuthorizationReceiptFromDirectory({
      inputDir: options.fromDir,
      decisionsPath: options.decisionsPath,
      ...(options.outputDir ? { outputDir: options.outputDir } : {})
    })
    : await writeAiIdeTargetRepoRepairGoalAuthorizationReceipt({
      proposalPackagePath: options.proposalPackagePath,
      decisionsPath: options.decisionsPath,
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
