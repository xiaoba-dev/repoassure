#!/usr/bin/env node
import { writeAiIdeRepairExecutionPlaybook } from '../packages/acceptance/dist/ai-ide-repair-playbook.js';

function printHelp() {
  console.log(`RepoAssure AI IDE repair execution playbook

Usage:
  pnpm playbook:generate -- --campaign-summary <path> --output <dir>

Example:
  pnpm playbook:generate -- --campaign-summary artifacts/campaign/campaign-summary.json --output artifacts/campaign
`);
}

function parseArgs(argv) {
  if (argv[0] === '--') {
    argv = argv.slice(1);
  }

  const parsed = {
    campaignSummaryPath: '',
    outputDir: ''
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    if (arg === '--campaign-summary') {
      parsed.campaignSummaryPath = argv[index + 1] ?? '';
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

  if (!parsed.campaignSummaryPath) {
    throw new Error('--campaign-summary is required');
  }

  if (!parsed.outputDir) {
    throw new Error('--output is required');
  }

  return parsed;
}

try {
  const options = parseArgs(process.argv.slice(2));
  const result = await writeAiIdeRepairExecutionPlaybook({
    campaignSummaryPath: options.campaignSummaryPath,
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
