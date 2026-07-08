#!/usr/bin/env node
import {
  writeAiIdeRepairEvidenceConsumerContract,
  writeAiIdeRepairEvidenceConsumerContractFromDirectory
} from '../packages/acceptance/dist/ai-ide-repair-evidence-consumer-contract.js';

function printHelp() {
  console.log(`RepoAssure AI IDE repair evidence consumer contract

Usage:
  pnpm playbook:contract -- --manifest <path> --output <dir>
  pnpm playbook:contract -- --from-dir <dir> [--output <dir>]

Example:
  pnpm playbook:contract -- --manifest artifacts/campaign/ai-ide-repair-evidence-bundle-manifest.json --output artifacts/campaign
  pnpm playbook:contract -- --from-dir artifacts/campaign
`);
}

function parseArgs(argv) {
  if (argv[0] === '--') {
    argv = argv.slice(1);
  }

  const parsed = {
    manifestPath: '',
    outputDir: '',
    fromDir: ''
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    if (arg === '--manifest') {
      parsed.manifestPath = argv[index + 1] ?? '';
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

  if (!parsed.manifestPath && !parsed.fromDir) {
    throw new Error('--manifest or --from-dir is required');
  }

  if (parsed.manifestPath && parsed.fromDir) {
    throw new Error('Use either --manifest or --from-dir, not both');
  }

  if (parsed.manifestPath && !parsed.outputDir) {
    throw new Error('--output is required when using --manifest');
  }

  return parsed;
}

try {
  const options = parseArgs(process.argv.slice(2));
  const result = options.fromDir
    ? await writeAiIdeRepairEvidenceConsumerContractFromDirectory({
      inputDir: options.fromDir,
      ...(options.outputDir ? { outputDir: options.outputDir } : {})
    })
    : await writeAiIdeRepairEvidenceConsumerContract({
      manifestPath: options.manifestPath,
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
