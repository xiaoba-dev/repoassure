#!/usr/bin/env node
import { writeAiIdeRepairApprovalReceipt } from '../packages/acceptance/dist/ai-ide-repair-approval-receipt.js';

function printHelp() {
  console.log(`RepoAssure AI IDE repair approval receipt

Usage:
  pnpm playbook:approve -- --decision-package <path> --approvals <path> --output <dir>

Example:
  pnpm playbook:approve -- --decision-package artifacts/campaign/ai-ide-repair-decision-package.json --approvals artifacts/campaign/approval-decisions.json --output artifacts/campaign
`);
}

function parseArgs(argv) {
  if (argv[0] === '--') {
    argv = argv.slice(1);
  }

  const parsed = {
    decisionPackagePath: '',
    approvalsPath: '',
    outputDir: ''
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    if (arg === '--decision-package') {
      parsed.decisionPackagePath = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (arg === '--approvals') {
      parsed.approvalsPath = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (arg === '--output') {
      parsed.outputDir = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!parsed.decisionPackagePath) {
    throw new Error('--decision-package is required');
  }

  if (!parsed.approvalsPath) {
    throw new Error('--approvals is required');
  }

  if (!parsed.outputDir) {
    throw new Error('--output is required');
  }

  return parsed;
}

try {
  const options = parseArgs(process.argv.slice(2));
  const result = await writeAiIdeRepairApprovalReceipt({
    decisionPackagePath: options.decisionPackagePath,
    approvalsPath: options.approvalsPath,
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
