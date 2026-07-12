#!/usr/bin/env node
import { join } from 'node:path';

import { writeBlockedGoalRecoveryConsumptionReport } from '../packages/acceptance/dist/blocked-goal-recovery-consumption-report.js';
import { redactSensitiveText } from '../packages/acceptance/dist/redaction.js';

function printHelp() {
  console.log(`RepoAssure blocked goal recovery consumption report

Usage:
  pnpm --silent goal:recover:consume -- --package <path> --output <dir>
  pnpm --silent goal:recover:consume -- --from-dir <dir> [--output <dir>]

Example:
  pnpm --silent goal:recover:consume -- --from-dir artifacts/blocked-goal
`);
}

function parseArgs(argv) {
  if (argv[0] === '--') {
    argv = argv.slice(1);
  }

  const parsed = {
    packagePath: '',
    outputDir: '',
    fromDir: ''
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    if (arg === '--package') {
      parsed.packagePath = argv[index + 1] ?? '';
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

  if (!parsed.packagePath && !parsed.fromDir) {
    throw new Error('--package or --from-dir is required');
  }

  if (parsed.packagePath && parsed.fromDir) {
    throw new Error('Use either --package or --from-dir, not both');
  }

  if (parsed.packagePath && !parsed.outputDir) {
    throw new Error('--output is required when using --package');
  }

  return parsed;
}

try {
  const options = parseArgs(process.argv.slice(2));
  const packagePath = options.fromDir
    ? join(options.fromDir, 'blocked-goal-recovery-package.json')
    : options.packagePath;
  const outputDir = options.outputDir || options.fromDir;
  const result = await writeBlockedGoalRecoveryConsumptionReport({
    packagePath,
    outputDir
  });

  console.log(`Wrote ${redactOutputPath(result.jsonPath)}`);
  console.log(`Wrote ${redactOutputPath(result.markdownPath)}`);
} catch (error) {
  console.error(redactSensitiveText(error instanceof Error ? error.message : String(error)));
  console.error('');
  printHelp();
  process.exit(1);
}

function redactOutputPath(value) {
  return value
    .replaceAll('\\', '/')
    .split('/')
    .map((segment) => redactSensitiveText(segment))
    .join('/');
}
