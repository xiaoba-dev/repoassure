#!/usr/bin/env node
import { writeAiIdeApprovedRepairExecutionPlan } from '../packages/acceptance/dist/ai-ide-approved-repair-execution-plan.js';

function printHelp() {
  console.log(`RepoAssure AI IDE approved repair execution plan

Usage:
  pnpm playbook:plan-approved -- --approval-receipt <path> --output <dir>

Example:
  pnpm playbook:plan-approved -- --approval-receipt artifacts/campaign/ai-ide-repair-approval-receipt.json --output artifacts/campaign
`);
}

function parseArgs(argv) {
  if (argv[0] === '--') {
    argv = argv.slice(1);
  }

  const parsed = {
    approvalReceiptPath: '',
    outputDir: ''
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    if (arg === '--approval-receipt') {
      parsed.approvalReceiptPath = argv[index + 1] ?? '';
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

  if (!parsed.approvalReceiptPath) {
    throw new Error('--approval-receipt is required');
  }

  if (!parsed.outputDir) {
    throw new Error('--output is required');
  }

  return parsed;
}

try {
  const options = parseArgs(process.argv.slice(2));
  const result = await writeAiIdeApprovedRepairExecutionPlan({
    approvalReceiptPath: options.approvalReceiptPath,
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
