#!/usr/bin/env node
import {
  writeBlockedGoalRecoveryResumeAttemptTaskPackage,
  writeBlockedGoalRecoveryResumeAttemptTaskPackageFromDirectory
} from '../packages/acceptance/dist/blocked-goal-recovery-resume-attempt-task-package.js';
import { redactSensitiveText } from '../packages/acceptance/dist/redaction.js';

function printHelp() {
  console.log(`RepoAssure blocked goal recovery resume attempt task package

Usage:
  pnpm --silent goal:recover:prepare-resume -- --receipt <path> --reviewed-sha256 <sha256> --output <dir>
  pnpm --silent goal:recover:prepare-resume -- --from-dir <dir> [--output <dir>]
`);
}

function parseArgs(argv) {
  if (argv[0] === '--') argv = argv.slice(1);
  const parsed = { receiptPath: '', reviewedSourceSha256: '', outputDir: '', fromDir: '' };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') { printHelp(); process.exit(0); }
    if (arg === '--receipt') { parsed.receiptPath = argv[index + 1] ?? ''; index += 1; continue; }
    if (arg === '--reviewed-sha256') { parsed.reviewedSourceSha256 = argv[index + 1] ?? ''; index += 1; continue; }
    if (arg === '--output') { parsed.outputDir = argv[index + 1] ?? ''; index += 1; continue; }
    if (arg === '--from-dir') { parsed.fromDir = argv[index + 1] ?? ''; index += 1; continue; }
    throw new Error(`Unknown argument: ${arg}`);
  }
  if (!parsed.fromDir && (!parsed.receiptPath || !parsed.reviewedSourceSha256 || !parsed.outputDir)) {
    throw new Error('--from-dir or --receipt, --reviewed-sha256, and --output are required');
  }
  if (parsed.fromDir && (parsed.receiptPath || parsed.reviewedSourceSha256)) {
    throw new Error('Use --from-dir or an explicit receipt path, not both');
  }
  return parsed;
}

try {
  const options = parseArgs(process.argv.slice(2));
  const inputDir = options.fromDir;
  const result = inputDir
    ? await writeBlockedGoalRecoveryResumeAttemptTaskPackageFromDirectory({
      inputDir,
      outputDir: options.outputDir || inputDir
    })
    : await writeBlockedGoalRecoveryResumeAttemptTaskPackage({
      receiptPath: options.receiptPath,
      reviewedSourceSha256: options.reviewedSourceSha256,
      outputDir: options.outputDir
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
  return value.replaceAll('\\', '/').split('/').map((segment) => redactSensitiveText(segment)).join('/');
}
