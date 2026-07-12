#!/usr/bin/env node
import {
  writeBlockedGoalRecoveryPackage,
  writeBlockedGoalRecoveryPackageFromDirectory
} from '../packages/acceptance/dist/blocked-goal-recovery-package.js';

function printHelp() {
  console.log(`RepoAssure blocked goal recovery package

Usage:
  pnpm goal:recover -- --input <path> --output <dir>
  pnpm goal:recover -- --from-dir <dir> [--output <dir>]

Example:
  pnpm goal:recover -- --input artifacts/blocked-goal/blocked-goal-recovery-input.json --output artifacts/blocked-goal
  pnpm goal:recover -- --from-dir artifacts/blocked-goal
`);
}

function parseArgs(argv) {
  if (argv[0] === '--') {
    argv = argv.slice(1);
  }

  const parsed = {
    inputPath: '',
    outputDir: '',
    fromDir: ''
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    if (arg === '--input') {
      parsed.inputPath = argv[index + 1] ?? '';
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

  if (!parsed.inputPath && !parsed.fromDir) {
    throw new Error('--input or --from-dir is required');
  }

  if (parsed.inputPath && parsed.fromDir) {
    throw new Error('Use either --input or --from-dir, not both');
  }

  if (parsed.inputPath && !parsed.outputDir) {
    throw new Error('--output is required when using --input');
  }

  return parsed;
}

try {
  const options = parseArgs(process.argv.slice(2));
  const result = options.fromDir
    ? await writeBlockedGoalRecoveryPackageFromDirectory({
      inputDir: options.fromDir,
      ...(options.outputDir ? { outputDir: options.outputDir } : {})
    })
    : await writeBlockedGoalRecoveryPackage({
      inputPath: options.inputPath,
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
