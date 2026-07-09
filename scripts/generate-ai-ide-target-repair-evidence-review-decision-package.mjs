#!/usr/bin/env node
import {
  writeAiIdeTargetRepairEvidenceReviewDecisionPackage,
  writeAiIdeTargetRepairEvidenceReviewDecisionPackageFromDirectory
} from '../packages/acceptance/dist/ai-ide-target-repair-evidence-review-decision-package.js';

function printHelp() {
  console.log(`RepoAssure AI IDE target repair evidence review decision package

Usage:
  pnpm playbook:target-repair-review -- --intake-report <path> --decisions <path> --output <dir>
  pnpm playbook:target-repair-review -- --from-dir <dir> [--output <dir>]

Example:
  pnpm playbook:target-repair-review -- --intake-report artifacts/campaign/ai-ide-target-repo-repair-goal-execution-evidence-intake-report.json --decisions artifacts/campaign/target-repair-evidence-review-decisions.json --output artifacts/campaign
  pnpm playbook:target-repair-review -- --from-dir artifacts/campaign
`);
}

function parseArgs(argv) {
  if (argv[0] === '--') {
    argv = argv.slice(1);
  }

  const parsed = {
    intakeReportPath: '',
    decisionsPath: '',
    outputDir: '',
    fromDir: ''
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    if (arg === '--intake-report') {
      parsed.intakeReportPath = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (arg === '--decisions') {
      parsed.decisionsPath = argv[index + 1] ?? '';
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

  if (!parsed.intakeReportPath && !parsed.fromDir) {
    throw new Error('--intake-report or --from-dir is required');
  }

  if (parsed.intakeReportPath && parsed.fromDir) {
    throw new Error('Use either --intake-report or --from-dir, not both');
  }

  if (parsed.intakeReportPath && !parsed.decisionsPath) {
    throw new Error('--decisions is required when using --intake-report');
  }

  if (parsed.intakeReportPath && !parsed.outputDir) {
    throw new Error('--output is required when using --intake-report');
  }

  return parsed;
}

try {
  const options = parseArgs(process.argv.slice(2));
  const result = options.fromDir
    ? await writeAiIdeTargetRepairEvidenceReviewDecisionPackageFromDirectory({
      inputDir: options.fromDir,
      ...(options.outputDir ? { outputDir: options.outputDir } : {})
    })
    : await writeAiIdeTargetRepairEvidenceReviewDecisionPackage({
      intakeReportPath: options.intakeReportPath,
      decisionsPath: options.decisionsPath,
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
