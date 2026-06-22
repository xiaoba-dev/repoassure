import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import type { PythonCliCheckCommand, PythonCliCheckCommandResult } from './python-cli-checks.js';
import type { PythonCliProfile } from './python-cli-profile.js';
import type { UserAcceptanceCheck } from './user-acceptance.js';

export interface PythonCliAcceptanceArtifactsInput {
  repoRoot: string;
  profile: PythonCliProfile;
  smokeCommands: PythonCliCheckCommand[];
  staticCommands: PythonCliCheckCommand[];
  commandResults?: PythonCliCheckCommandResult[];
  checks?: UserAcceptanceCheck[];
  generatedAt?: string;
}

export interface PythonCliAcceptanceArtifacts {
  runId: string;
  runDir: string;
  pythonCliProfilePath: string;
  reportPath: string;
  manifestPath: string;
  repairPlanPath: string;
  repairPlanMarkdownPath: string;
  repairTaskPackagePath: string;
  repairTaskPackageMarkdownPath: string;
}

export async function writePythonCliAcceptanceArtifacts(input: PythonCliAcceptanceArtifactsInput): Promise<PythonCliAcceptanceArtifacts> {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const runId = `run-${formatRunIdTimestamp(generatedAt)}`;
  const runDir = join(input.repoRoot, '.hardening', 'runs', runId);
  const artifacts: PythonCliAcceptanceArtifacts = {
    runId,
    runDir,
    pythonCliProfilePath: join(runDir, 'python-cli-profile.json'),
    reportPath: join(input.repoRoot, 'hardening-report.md'),
    manifestPath: join(runDir, 'manifest.json'),
    repairPlanPath: join(runDir, 'repair-plan.json'),
    repairPlanMarkdownPath: join(runDir, 'repair-plan.md'),
    repairTaskPackagePath: join(runDir, 'repair-task-package.json'),
    repairTaskPackageMarkdownPath: join(runDir, 'repair-task-package.md')
  };

  await mkdir(runDir, { recursive: true });
  await mkdir(dirname(artifacts.reportPath), { recursive: true });
  await writeFile(artifacts.pythonCliProfilePath, `${JSON.stringify(input.profile, null, 2)}\n`);
  await writeFile(artifacts.reportPath, formatPythonCliReport(input.profile, input.smokeCommands, input.staticCommands, input.commandResults ?? []));
  await writeFile(artifacts.repairPlanPath, `${JSON.stringify(buildRepairPlan(input, artifacts), null, 2)}\n`);
  await writeFile(artifacts.repairPlanMarkdownPath, formatRepairPlanMarkdown(input.profile, input.smokeCommands, input.staticCommands));
  await writeFile(artifacts.repairTaskPackagePath, `${JSON.stringify(buildRepairTaskPackage(input, artifacts), null, 2)}\n`);
  await writeFile(artifacts.repairTaskPackageMarkdownPath, formatRepairTaskPackageMarkdown(input.profile, input.smokeCommands, input.staticCommands, input.commandResults ?? []));
  await writeFile(artifacts.manifestPath, `${JSON.stringify(buildManifest(input, artifacts, generatedAt), null, 2)}\n`);

  return artifacts;
}

function formatPythonCliReport(
  profile: PythonCliProfile,
  smokeCommands: PythonCliCheckCommand[],
  staticCommands: PythonCliCheckCommand[],
  commandResults: PythonCliCheckCommandResult[]
): string {
  return `# Python/CLI Hardening Report

## Profile

| Field | Value |
| --- | --- |
| Project | ${profile.projectName ?? 'n/a'} |
| Requires Python | ${profile.requiresPython ?? 'n/a'} |
| Confidence | ${profile.confidence} |
| Console scripts | ${Object.keys(profile.consoleScripts).join(', ') || 'n/a'} |

## CLI Smoke Checks

${formatCommandList(smokeCommands)}

## Static/Test Checks

${formatCommandList(staticCommands)}

## Execution Results

${formatCommandResultTable(commandResults)}

## Blockers

${profile.blockers.length > 0 ? profile.blockers.map((blocker) => `- ${blocker}`).join('\n') : '- None.'}

## Verification Commands

${formatCommandList([...smokeCommands, ...staticCommands])}
`;
}

function buildRepairPlan(input: PythonCliAcceptanceArtifactsInput, artifacts: PythonCliAcceptanceArtifacts): unknown {
  return {
    schemaVersion: 1,
    mode: 'cli',
    runId: artifacts.runId,
    repoRoot: input.repoRoot,
    profile: {
      projectName: input.profile.projectName,
      confidence: input.profile.confidence,
      blockers: input.profile.blockers
    },
    evidence: {
      type: 'python-cli',
      pythonCliProfilePath: artifacts.pythonCliProfilePath,
      smokeCommands: input.smokeCommands,
      staticCommands: input.staticCommands,
      commandResults: input.commandResults ?? []
    },
    tasks: [
      {
        id: 'PYCLI-001',
        title: formatRepairTaskTitle(input.commandResults ?? []),
        priority: input.profile.blockers.length > 0 || hasFailedCommand(input.commandResults ?? []) ? 'P1' : 'P2',
        verificationCommands: formatCommandValues([...input.smokeCommands, ...input.staticCommands])
      }
    ]
  };
}

function formatRepairPlanMarkdown(
  profile: PythonCliProfile,
  smokeCommands: PythonCliCheckCommand[],
  staticCommands: PythonCliCheckCommand[]
): string {
  return `# Python/CLI Repair Plan

- Mode: cli
- Project: ${profile.projectName ?? 'n/a'}
- Blockers: ${profile.blockers.length}
- Verification commands: ${formatCommandValues([...smokeCommands, ...staticCommands]).join('; ') || 'n/a'}
`;
}

function buildRepairTaskPackage(input: PythonCliAcceptanceArtifactsInput, artifacts: PythonCliAcceptanceArtifacts): unknown {
  return {
    schemaVersion: 1,
    mode: 'cli',
    title: 'CLI-oriented task handoff',
    prompt: [
      'Use the Python/CLI profile, smoke command plan, static/test command plan, command execution results, and blockers to improve the target repository.',
      'Do not add browser-only assumptions unless the repository exposes a browser UI.'
    ].join(' '),
    sourceArtifacts: {
      pythonCliProfilePath: artifacts.pythonCliProfilePath,
      reportPath: artifacts.reportPath,
      repairPlanPath: artifacts.repairPlanPath
    },
    commandResults: input.commandResults ?? [],
    verificationCommands: formatCommandValues([...input.smokeCommands, ...input.staticCommands])
  };
}

function formatRepairTaskPackageMarkdown(
  profile: PythonCliProfile,
  smokeCommands: PythonCliCheckCommand[],
  staticCommands: PythonCliCheckCommand[],
  commandResults: PythonCliCheckCommandResult[]
): string {
  return `# CLI-oriented Task Handoff

Project: ${profile.projectName ?? 'n/a'}

Use this package to improve Python CLI behavior, then verify with:

${formatCommandList([...smokeCommands, ...staticCommands])}

## Current Execution Results

${formatCommandResultList(commandResults)}
`;
}

function buildManifest(
  input: PythonCliAcceptanceArtifactsInput,
  artifacts: PythonCliAcceptanceArtifacts,
  generatedAt: string
): unknown {
  return {
    schemaVersion: 1,
    mode: 'cli',
    generatedAt,
    runId: artifacts.runId,
    repoRoot: input.repoRoot,
    artifacts: {
      pythonCliProfilePath: artifacts.pythonCliProfilePath,
      reportPath: artifacts.reportPath,
      repairPlanPath: artifacts.repairPlanPath,
      repairPlanMarkdownPath: artifacts.repairPlanMarkdownPath,
      repairTaskPackagePath: artifacts.repairTaskPackagePath,
      repairTaskPackageMarkdownPath: artifacts.repairTaskPackageMarkdownPath
    },
    commandResults: input.commandResults ?? [],
    checks: input.checks ?? []
  };
}

function formatCommandList(commands: PythonCliCheckCommand[]): string {
  const values = formatCommandValues(commands);

  return values.length > 0 ? values.map((command) => `- \`${command}\``).join('\n') : '- n/a';
}

function formatCommandValues(commands: PythonCliCheckCommand[]): string[] {
  return commands.map((command) => `${command.command} ${command.args.join(' ')}`.trim());
}

function formatRunIdTimestamp(value: string): string {
  return value.replace(/[:.]/gu, '-');
}

function formatCommandResultTable(results: PythonCliCheckCommandResult[]): string {
  if (results.length === 0) {
    return 'No commands executed.';
  }

  return [
    '| Command | Status | Exit Code | Evidence |',
    '| --- | --- | --- | --- |',
    ...results.map((result) => `| \`${formatCommandResultValue(result)}\` | ${formatCommandStatus(result)} | ${result.exitCode} | ${formatCommandEvidence(result)} |`)
  ].join('\n');
}

function formatCommandResultList(results: PythonCliCheckCommandResult[]): string {
  if (results.length === 0) {
    return '- No commands executed.';
  }

  return results.map((result) => `- \`${formatCommandResultValue(result)}\`: ${formatCommandStatus(result)} exit=${result.exitCode} ${formatCommandEvidence(result)}`).join('\n');
}

function formatCommandResultValue(result: PythonCliCheckCommandResult): string {
  return `${result.command} ${result.args.join(' ')}`.trim();
}

function formatCommandStatus(result: PythonCliCheckCommandResult): 'passed' | 'failed' {
  return result.exitCode === 0 && !result.timedOut ? 'passed' : 'failed';
}

function formatCommandEvidence(result: PythonCliCheckCommandResult): string {
  const output = (result.stdout || result.stderr).replace(/\s+/gu, ' ').trim();
  const timeout = result.timedOut ? ' timedOut=true' : '';

  return output ? `${timeout} ${output}`.trim() : timeout.trim() || 'n/a';
}

function hasFailedCommand(results: PythonCliCheckCommandResult[]): boolean {
  return results.some((result) => result.exitCode !== 0 || result.timedOut);
}

function formatRepairTaskTitle(results: PythonCliCheckCommandResult[]): string {
  return hasFailedCommand(results)
    ? 'Fix failing Python/CLI acceptance checks'
    : 'Review Python/CLI acceptance findings and harden CLI behavior';
}
