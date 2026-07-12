#!/usr/bin/env node
import {
  writeBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake,
  writeBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeFromDirectory
} from '../packages/acceptance/dist/blocked-goal-recovery-resume-attempt-execution-evidence-intake.js';
import { redactSensitiveText } from '../packages/acceptance/dist/redaction.js';

function help() {
  console.log(`RepoAssure blocked goal recovery resume attempt execution evidence intake

Usage:
  pnpm --silent goal:recover:intake-resume-evidence -- --from-dir <dir> [--output <dir>]
  pnpm --silent goal:recover:intake-resume-evidence -- --task-package <path> --evidence <path> --output <dir>
`);
}

function parseArgs(argv) {
  if (argv[0] === '--') argv = argv.slice(1);
  const out = { fromDir: '', taskPackagePath: '', evidenceInputPath: '', outputDir: '' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') { help(); process.exit(0); }
    if (arg === '--from-dir') { out.fromDir = argv[++i] ?? ''; continue; }
    if (arg === '--task-package') { out.taskPackagePath = argv[++i] ?? ''; continue; }
    if (arg === '--evidence') { out.evidenceInputPath = argv[++i] ?? ''; continue; }
    if (arg === '--output') { out.outputDir = argv[++i] ?? ''; continue; }
    throw new Error(`Unknown argument: ${arg}`);
  }
  if (!out.fromDir && (!out.taskPackagePath || !out.evidenceInputPath || !out.outputDir)) {
    throw new Error('--from-dir or --task-package, --evidence, and --output are required');
  }
  if (out.fromDir && (out.taskPackagePath || out.evidenceInputPath)) {
    throw new Error('Use --from-dir or explicit input paths, not both');
  }
  return out;
}

try {
  const options = parseArgs(process.argv.slice(2));
  const result = options.fromDir
    ? await writeBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeFromDirectory({
      inputDir: options.fromDir, outputDir: options.outputDir || options.fromDir
    })
    : await writeBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake({
      taskPackagePath: options.taskPackagePath,
      evidenceInputPath: options.evidenceInputPath,
      outputDir: options.outputDir
    });
  console.log(`Wrote ${redactPath(result.jsonPath)}`);
  console.log(`Wrote ${redactPath(result.markdownPath)}`);
} catch (error) {
  console.error(redactSensitiveText(error instanceof Error ? error.message : String(error)));
  console.error('');
  help();
  process.exit(1);
}

function redactPath(value) {
  return value.replaceAll('\\', '/').split('/').map((item) => redactSensitiveText(item)).join('/');
}
