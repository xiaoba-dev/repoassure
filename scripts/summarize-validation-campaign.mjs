#!/usr/bin/env node
import { writeValidationCampaignSummary } from '../packages/acceptance/dist/campaign-summary.js';

function printHelp() {
  console.log(`RepoAssure validation campaign summary

Usage:
  pnpm campaign:summarize -- --output <dir> --target <id>|<repoRoot>|<acceptanceRecordPath> [--target ...]

Example:
  pnpm campaign:summarize -- --output artifacts/campaign --target odinsight|/tmp/odinsight|artifacts/campaign/odinsight/user-acceptance.md
`);
}

function parseArgs(argv) {
  if (argv[0] === '--') {
    argv = argv.slice(1);
  }

  const parsed = {
    outputDir: '',
    targets: []
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    if (arg === '--output') {
      parsed.outputDir = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (arg === '--target') {
      const value = argv[index + 1] ?? '';
      const [targetId, repoRoot, acceptanceRecordPath] = value.split('|');

      if (!targetId || !repoRoot) {
        throw new Error(`Invalid --target value: ${value}`);
      }

      parsed.targets.push({
        targetId,
        repoRoot,
        ...(acceptanceRecordPath ? { acceptanceRecordPath } : {})
      });
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!parsed.outputDir) {
    throw new Error('--output is required');
  }

  if (parsed.targets.length === 0) {
    throw new Error('At least one --target is required');
  }

  return parsed;
}

try {
  const options = parseArgs(process.argv.slice(2));
  const result = await writeValidationCampaignSummary({
    outputDir: options.outputDir,
    targets: options.targets
  });

  console.log(`Wrote ${result.jsonPath}`);
  console.log(`Wrote ${result.markdownPath}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  console.error('');
  printHelp();
  process.exit(1);
}
