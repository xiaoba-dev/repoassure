#!/usr/bin/env node
import {
  writeAiIdeTargetRepoRepairGoalProposalPackage,
  writeAiIdeTargetRepoRepairGoalProposalPackageFromDirectory
} from '../packages/acceptance/dist/ai-ide-target-repo-repair-goal-proposal-package.js';

function printHelp() {
  console.log(`RepoAssure AI IDE target repo repair goal proposal package

Usage:
  pnpm playbook:proposal -- --replay-readiness <path> --output <dir>
  pnpm playbook:proposal -- --from-dir <dir> [--output <dir>]

Example:
  pnpm playbook:proposal -- --replay-readiness artifacts/campaign/ai-ide-repair-execution-replay-readiness.json --output artifacts/campaign
  pnpm playbook:proposal -- --from-dir artifacts/campaign
`);
}

function parseArgs(argv) {
  if (argv[0] === '--') {
    argv = argv.slice(1);
  }

  const parsed = {
    replayReadinessPath: '',
    outputDir: '',
    fromDir: ''
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    if (arg === '--replay-readiness') {
      parsed.replayReadinessPath = argv[index + 1] ?? '';
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

  if (!parsed.replayReadinessPath && !parsed.fromDir) {
    throw new Error('--replay-readiness or --from-dir is required');
  }

  if (parsed.replayReadinessPath && parsed.fromDir) {
    throw new Error('Use either --replay-readiness or --from-dir, not both');
  }

  if (parsed.replayReadinessPath && !parsed.outputDir) {
    throw new Error('--output is required when using --replay-readiness');
  }

  return parsed;
}

try {
  const options = parseArgs(process.argv.slice(2));
  const result = options.fromDir
    ? await writeAiIdeTargetRepoRepairGoalProposalPackageFromDirectory({
      inputDir: options.fromDir,
      ...(options.outputDir ? { outputDir: options.outputDir } : {})
    })
    : await writeAiIdeTargetRepoRepairGoalProposalPackage({
      replayReadinessPath: options.replayReadinessPath,
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
