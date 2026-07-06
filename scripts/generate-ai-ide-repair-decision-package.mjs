#!/usr/bin/env node
import { writeAiIdeRepairDecisionPackage } from '../packages/acceptance/dist/ai-ide-repair-decision-package.js';

function printHelp() {
  console.log(`RepoAssure AI IDE repair decision package

Usage:
  pnpm playbook:decide -- --consumption-report <path> --output <dir>

Example:
  pnpm playbook:decide -- --consumption-report artifacts/campaign/ai-ide-playbook-consumption-report.json --output artifacts/campaign
`);
}

function parseArgs(argv) {
  if (argv[0] === '--') {
    argv = argv.slice(1);
  }

  const parsed = {
    consumptionReportPath: '',
    outputDir: ''
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    if (arg === '--consumption-report') {
      parsed.consumptionReportPath = argv[index + 1] ?? '';
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

  if (!parsed.consumptionReportPath) {
    throw new Error('--consumption-report is required');
  }

  if (!parsed.outputDir) {
    throw new Error('--output is required');
  }

  return parsed;
}

try {
  const options = parseArgs(process.argv.slice(2));
  const result = await writeAiIdeRepairDecisionPackage({
    consumptionReportPath: options.consumptionReportPath,
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
