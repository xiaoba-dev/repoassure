#!/usr/bin/env node
import { writeAiIdeRepairEvidenceBundleManifest } from '../packages/acceptance/dist/ai-ide-repair-evidence-bundle-manifest.js';

function printHelp() {
  console.log(`RepoAssure AI IDE repair evidence bundle manifest

Usage:
  pnpm playbook:bundle -- --playbook <path> --consumption-report <path> --decision-package <path> --approval-receipt <path> --execution-plan <path> --evidence-report <path> --output <dir>

Example:
  pnpm playbook:bundle -- --playbook artifacts/campaign/ai-ide-repair-playbook.json --consumption-report artifacts/campaign/ai-ide-playbook-consumption-report.json --decision-package artifacts/campaign/ai-ide-repair-decision-package.json --approval-receipt artifacts/campaign/ai-ide-repair-approval-receipt.json --execution-plan artifacts/campaign/ai-ide-approved-repair-execution-plan.json --evidence-report artifacts/campaign/ai-ide-repair-execution-evidence-report.json --output artifacts/campaign
`);
}

function parseArgs(argv) {
  if (argv[0] === '--') {
    argv = argv.slice(1);
  }

  const parsed = {
    playbookPath: '',
    consumptionReportPath: '',
    decisionPackagePath: '',
    approvalReceiptPath: '',
    executionPlanPath: '',
    evidenceReportPath: '',
    outputDir: ''
  };
  const requiredFlags = {
    playbookPath: '--playbook',
    consumptionReportPath: '--consumption-report',
    decisionPackagePath: '--decision-package',
    approvalReceiptPath: '--approval-receipt',
    executionPlanPath: '--execution-plan',
    evidenceReportPath: '--evidence-report',
    outputDir: '--output'
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    if (arg === '--playbook') {
      parsed.playbookPath = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (arg === '--consumption-report') {
      parsed.consumptionReportPath = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (arg === '--decision-package') {
      parsed.decisionPackagePath = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (arg === '--approval-receipt') {
      parsed.approvalReceiptPath = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (arg === '--execution-plan') {
      parsed.executionPlanPath = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (arg === '--evidence-report') {
      parsed.evidenceReportPath = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (arg === '--output') {
      parsed.outputDir = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  for (const [key, value] of Object.entries(parsed)) {
    if (!value) {
      throw new Error(`${requiredFlags[key]} is required`);
    }
  }

  return parsed;
}

try {
  const options = parseArgs(process.argv.slice(2));
  const result = await writeAiIdeRepairEvidenceBundleManifest({
    playbookPath: options.playbookPath,
    consumptionReportPath: options.consumptionReportPath,
    decisionPackagePath: options.decisionPackagePath,
    approvalReceiptPath: options.approvalReceiptPath,
    executionPlanPath: options.executionPlanPath,
    evidenceReportPath: options.evidenceReportPath,
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
