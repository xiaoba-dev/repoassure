#!/usr/bin/env node
import { writeAiIdePlaybookConsumptionReport } from '../packages/acceptance/dist/ai-ide-playbook-consumption-report.js';

function printHelp() {
  console.log(`RepoAssure AI IDE playbook consumption dry-run report

Usage:
  pnpm playbook:consume -- --playbook <path> --output <dir>

Example:
  pnpm playbook:consume -- --playbook artifacts/campaign/ai-ide-repair-playbook.json --output artifacts/campaign
`);
}

function parseArgs(argv) {
  if (argv[0] === '--') {
    argv = argv.slice(1);
  }

  const parsed = {
    playbookPath: '',
    outputDir: ''
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    if (arg === '--playbook') {
      parsed.playbookPath = argv[index + 1] ?? '';
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

  if (!parsed.playbookPath) {
    throw new Error('--playbook is required');
  }

  if (!parsed.outputDir) {
    throw new Error('--output is required');
  }

  return parsed;
}

try {
  const options = parseArgs(process.argv.slice(2));
  const result = await writeAiIdePlaybookConsumptionReport({
    playbookPath: options.playbookPath,
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
