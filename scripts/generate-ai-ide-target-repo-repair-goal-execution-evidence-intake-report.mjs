#!/usr/bin/env node
import {
  writeAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport,
  writeAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReportFromDirectory
} from '../packages/acceptance/dist/ai-ide-target-repo-repair-goal-execution-evidence-intake-report.js';

function printHelp() {
  console.log(`RepoAssure AI IDE target repo repair goal execution evidence intake report

Usage:
  pnpm playbook:target-repair-evidence -- --task-package <path> --evidence <path> --output <dir>
  pnpm playbook:target-repair-evidence -- --from-dir <dir> [--output <dir>]

Example:
  pnpm playbook:target-repair-evidence -- --task-package artifacts/campaign/ai-ide-authorized-target-repo-repair-goal-task-package.json --evidence artifacts/campaign/target-repo-repair-goal-execution-evidence-input.json --output artifacts/campaign
  pnpm playbook:target-repair-evidence -- --from-dir artifacts/campaign
`);
}

function parseArgs(argv) {
  if (argv[0] === '--') {
    argv = argv.slice(1);
  }

  const parsed = {
    taskPackagePath: '',
    evidencePath: '',
    outputDir: '',
    fromDir: ''
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    if (arg === '--task-package') {
      parsed.taskPackagePath = argv[index + 1] ?? '';
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

    if (arg === '--from-dir') {
      parsed.fromDir = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!parsed.taskPackagePath && !parsed.fromDir) {
    throw new Error('--task-package or --from-dir is required');
  }

  if (parsed.taskPackagePath && parsed.fromDir) {
    throw new Error('Use either --task-package or --from-dir, not both');
  }

  if (parsed.taskPackagePath && !parsed.evidencePath) {
    throw new Error('--evidence is required when using --task-package');
  }

  if (parsed.taskPackagePath && !parsed.outputDir) {
    throw new Error('--output is required when using --task-package');
  }

  return parsed;
}

try {
  const options = parseArgs(process.argv.slice(2));
  const result = options.fromDir
    ? await writeAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReportFromDirectory({
      inputDir: options.fromDir,
      ...(options.outputDir ? { outputDir: options.outputDir } : {})
    })
    : await writeAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport({
      taskPackagePath: options.taskPackagePath,
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
