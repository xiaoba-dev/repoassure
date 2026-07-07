#!/usr/bin/env node
import { writeAiIdeRepairExecutionEvidenceReport } from '../packages/acceptance/dist/ai-ide-repair-execution-evidence-report.js';

function printHelp() {
  console.log(`RepoAssure AI IDE repair execution evidence report

Usage:
  pnpm playbook:evidence -- --execution-plan <path> --evidence <path> --output <dir>

Example:
  pnpm playbook:evidence -- --execution-plan artifacts/campaign/ai-ide-approved-repair-execution-plan.json --evidence artifacts/campaign/repair-execution-evidence-input.json --output artifacts/campaign
`);
}

function parseArgs(argv) {
  if (argv[0] === '--') {
    argv = argv.slice(1);
  }

  const parsed = {
    executionPlanPath: '',
    evidencePath: '',
    outputDir: ''
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    if (arg === '--execution-plan') {
      parsed.executionPlanPath = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (arg === '--evidence') {
      parsed.evidencePath = argv[index + 1] ?? '';
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

  if (!parsed.executionPlanPath) {
    throw new Error('--execution-plan is required');
  }

  if (!parsed.evidencePath) {
    throw new Error('--evidence is required');
  }

  if (!parsed.outputDir) {
    throw new Error('--output is required');
  }

  return parsed;
}

try {
  const options = parseArgs(process.argv.slice(2));
  const result = await writeAiIdeRepairExecutionEvidenceReport({
    executionPlanPath: options.executionPlanPath,
    evidencePath: options.evidencePath,
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
