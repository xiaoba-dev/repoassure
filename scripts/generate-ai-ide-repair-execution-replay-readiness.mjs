#!/usr/bin/env node
import {
  writeAiIdeRepairExecutionReplayReadiness,
  writeAiIdeRepairExecutionReplayReadinessFromDirectory
} from '../packages/acceptance/dist/ai-ide-repair-execution-replay-readiness.js';

function printHelp() {
  console.log(`RepoAssure AI IDE repair execution replay readiness

Usage:
  pnpm playbook:replay -- --contract <path> --output <dir>
  pnpm playbook:replay -- --from-dir <dir> [--output <dir>]

Example:
  pnpm playbook:replay -- --contract artifacts/campaign/ai-ide-repair-evidence-consumer-contract.json --output artifacts/campaign
  pnpm playbook:replay -- --from-dir artifacts/campaign
`);
}

function parseArgs(argv) {
  if (argv[0] === '--') {
    argv = argv.slice(1);
  }

  const parsed = {
    contractPath: '',
    outputDir: '',
    fromDir: ''
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    if (arg === '--contract') {
      parsed.contractPath = argv[index + 1] ?? '';
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

  if (!parsed.contractPath && !parsed.fromDir) {
    throw new Error('--contract or --from-dir is required');
  }

  if (parsed.contractPath && parsed.fromDir) {
    throw new Error('Use either --contract or --from-dir, not both');
  }

  if (parsed.contractPath && !parsed.outputDir) {
    throw new Error('--output is required when using --contract');
  }

  return parsed;
}

try {
  const options = parseArgs(process.argv.slice(2));
  const result = options.fromDir
    ? await writeAiIdeRepairExecutionReplayReadinessFromDirectory({
      inputDir: options.fromDir,
      ...(options.outputDir ? { outputDir: options.outputDir } : {})
    })
    : await writeAiIdeRepairExecutionReplayReadiness({
      contractPath: options.contractPath,
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
