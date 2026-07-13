#!/usr/bin/env node
import { writeBlockedGoalRecoveryLifecycleCampaignSummary } from '../packages/acceptance/dist/blocked-goal-recovery-lifecycle-campaign-summary.js';
import { redactSensitiveText } from '../packages/acceptance/dist/redaction.js';

function help() {
  console.log(`RepoAssure blocked goal recovery lifecycle campaign validation

Usage:
  pnpm --silent goal:recover:validate-lifecycle -- --from-dir <dir> [--output <dir>]
`);
}
try {
  const args = process.argv.slice(2).filter((item) => item !== '--');
  if (args.includes('--help') || args.includes('-h')) { help(); process.exit(0); }
  let inputDir = ''; let outputDir = '';
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--from-dir') { inputDir = args[++i] ?? ''; continue; }
    if (args[i] === '--output') { outputDir = args[++i] ?? ''; continue; }
    throw new Error(`Unknown argument: ${args[i]}`);
  }
  if (!inputDir) throw new Error('--from-dir is required');
  const result = await writeBlockedGoalRecoveryLifecycleCampaignSummary({
    inputDir, outputDir: outputDir || inputDir
  });
  console.log(`Wrote ${redactPath(result.jsonPath)}`);
  console.log(`Wrote ${redactPath(result.markdownPath)}`);
} catch (error) {
  console.error(redactSensitiveText(error instanceof Error ? error.message : String(error)));
  console.error(''); help(); process.exit(1);
}
function redactPath(value) {
  return value.replaceAll('\\', '/').split('/').map((item) => redactSensitiveText(item)).join('/');
}
