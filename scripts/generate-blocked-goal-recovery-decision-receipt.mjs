#!/usr/bin/env node
import { join } from 'node:path';

import { writeBlockedGoalRecoveryDecisionReceipt } from '../packages/acceptance/dist/blocked-goal-recovery-decision-receipt.js';
import { redactSensitiveText } from '../packages/acceptance/dist/redaction.js';

function printHelp() {
  console.log(`RepoAssure blocked goal recovery decision receipt

Usage:
  pnpm --silent goal:recover:decide -- --report <path> --decisions <path> --output <dir>
  pnpm --silent goal:recover:decide -- --from-dir <dir> [--output <dir>]
`);
}

function parseArgs(argv) {
  if (argv[0] === '--') argv = argv.slice(1);
  const parsed = { reportPath: '', decisionsPath: '', outputDir: '', fromDir: '' };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') { printHelp(); process.exit(0); }
    if (arg === '--report') { parsed.reportPath = argv[index + 1] ?? ''; index += 1; continue; }
    if (arg === '--decisions') { parsed.decisionsPath = argv[index + 1] ?? ''; index += 1; continue; }
    if (arg === '--output') { parsed.outputDir = argv[index + 1] ?? ''; index += 1; continue; }
    if (arg === '--from-dir') { parsed.fromDir = argv[index + 1] ?? ''; index += 1; continue; }
    throw new Error(`Unknown argument: ${arg}`);
  }
  if (!parsed.fromDir && (!parsed.reportPath || !parsed.decisionsPath || !parsed.outputDir)) {
    throw new Error('--from-dir or --report, --decisions, and --output are required');
  }
  if (parsed.fromDir && (parsed.reportPath || parsed.decisionsPath)) {
    throw new Error('Use --from-dir or explicit report and decisions paths, not both');
  }
  return parsed;
}

try {
  const options = parseArgs(process.argv.slice(2));
  const inputDir = options.fromDir;
  const result = await writeBlockedGoalRecoveryDecisionReceipt({
    consumptionReportPath: inputDir
      ? join(inputDir, 'blocked-goal-recovery-consumption-report.json')
      : options.reportPath,
    decisionsPath: inputDir
      ? join(inputDir, 'blocked-goal-recovery-decisions.json')
      : options.decisionsPath,
    outputDir: options.outputDir || inputDir
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
