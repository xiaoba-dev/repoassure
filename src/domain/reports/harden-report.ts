import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative } from 'node:path';

import { shellQuoteArg } from '../../shared/shell-quote.js';
import { redactSensitiveText } from '../../shared/privacy-redaction.js';
import { isFinding, type HardeningFinding } from '../../types/findings.js';

export interface HardenReportInput {
  runDir: string;
  outputPath: string;
}

export interface IssueCounts {
  P0: number;
  P1: number;
  P2: number;
}

export interface HardenReportResult {
  reportPath: string;
  readinessScore: number;
  issueCounts: IssueCounts;
  patchDiffPath: string;
}

interface RepoProfileSummary {
  framework: string;
  packageManager: string;
  recommendedStartCommand: string | null;
  blockers: string[];
  confidence: string;
}

interface BootResultSummary {
  status: string;
  url: string | null;
  blockers: string[];
  errors: string[];
}

interface TestGenerationSummary {
  createdFiles: string[];
  testCommand: string | null;
  validationStatus: string | null;
  errors: string[];
}

export async function generateHardenReport(
  input: HardenReportInput
): Promise<HardenReportResult> {
  const [repoProfile, bootResult, findings, testGeneration] = await Promise.all([
    readRepoProfile(join(input.runDir, 'repo-profile.json')),
    readBootResult(join(input.runDir, 'boot-result.json')),
    readFindings(join(input.runDir, 'findings.json')),
    readTestGeneration(join(input.runDir, 'test-generation.json'))
  ]);
  const issueCounts = countIssues(findings);
  const readinessScore = calculateReadinessScore({
    repoProfile,
    bootResult,
    findings,
    testGeneration
  });
  const patchDiffPath = join(input.runDir, 'patch.diff');
  const patchDiff = await buildPatchDiff({
    repoRoot: dirname(input.outputPath),
    findings,
    testGeneration,
    bootResult
  });
  const report = buildReport({
    repoProfile,
    bootResult,
    findings,
    testGeneration,
    issueCounts,
    readinessScore,
    patchDiffPath
  });

  await mkdir(dirname(input.outputPath), { recursive: true });
  await mkdir(input.runDir, { recursive: true });
  await writeFile(input.outputPath, report);
  await writeFile(patchDiffPath, patchDiff);

  return {
    reportPath: input.outputPath,
    readinessScore,
    issueCounts,
    patchDiffPath
  };
}

async function buildPatchDiff(input: {
  repoRoot: string;
  findings: HardeningFinding[];
  testGeneration: TestGenerationSummary;
  bootResult: BootResultSummary;
}): Promise<string> {
  const remediationDocPath = 'docs/hardening-remediation.md';
  const sections = [
    buildNewFileDiff(remediationDocPath, buildRemediationDoc(input.findings, input.testGeneration, input.bootResult)),
    ...(await buildGeneratedTestDiffs(input.repoRoot, input.testGeneration.createdFiles))
  ];

  return `${sections.join('\n')}\n`;
}

function buildRemediationDoc(findings: HardeningFinding[], testGeneration: TestGenerationSummary, bootResult: BootResultSummary): string {
  const verificationCommand = buildVerificationCommand(testGeneration, bootResult);
  const findingLines =
    findings.length > 0
      ? findings.flatMap((finding, index) => [
          `## ${index + 1}. ${cleanText(finding.title)}`,
          '',
          `- Severity: ${finding.severity}`,
          `- Type: ${finding.type}`,
          `- Repro: ${formatTextList(finding.reproSteps, ' -> ') || 'None recorded'}`,
          `- Evidence: ${formatTextList(finding.evidence, '；') || 'None recorded'}`,
          '',
          `Recommended next step: fix the affected route or interaction, then run the generated regression test.`,
          ''
        ])
      : ['## No Findings', '', 'No hardening findings were recorded in this run.', ''];
  const testLines =
    testGeneration.createdFiles.length > 0
      ? ['## Regression Tests', '', ...testGeneration.createdFiles.map((file) => `- ${cleanText(file)}`), '']
      : ['## Regression Tests', '', 'No regression tests were generated for this run.', ''];
  const commandLines = [
    '## Verification',
    '',
    `- Test command: ${cleanText(testGeneration.testCommand ?? 'Not recorded')}`,
    `- Verification command: ${cleanText(verificationCommand)}`,
    `- Validation status: ${cleanText(testGeneration.validationStatus ?? 'unknown')}`,
    ''
  ];

  return ['# Hardening Remediation Plan', '', ...findingLines, ...testLines, ...commandLines].join('\n');
}

async function buildGeneratedTestDiffs(repoRoot: string, createdFiles: string[]): Promise<string[]> {
  const diffs: string[] = [];

  for (const createdFile of createdFiles) {
    const resolvedPath = isAbsolute(createdFile) ? createdFile : join(repoRoot, createdFile);
    const relativePath = normalizeDiffPath(relative(repoRoot, resolvedPath));

    if (!relativePath || relativePath.startsWith('../')) {
      continue;
    }

    try {
      diffs.push(buildNewFileDiff(relativePath, await readFile(resolvedPath, 'utf8')));
    } catch {
      continue;
    }
  }

  return diffs;
}

function buildNewFileDiff(path: string, content: string): string {
  const safeContent = redactSensitiveText(content);
  const lines = safeContent.endsWith('\n') ? safeContent.slice(0, -1).split('\n') : safeContent.split('\n');
  const normalizedPath = normalizeDiffPath(path);

  return [
    `diff --git a/${normalizedPath} b/${normalizedPath}`,
    'new file mode 100644',
    'index 0000000..0000000',
    '--- /dev/null',
    `+++ b/${normalizedPath}`,
    `@@ -0,0 +1,${Math.max(lines.length, 1)} @@`,
    ...lines.map((line) => `+${line}`)
  ].join('\n');
}

function normalizeDiffPath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\/+/, '');
}

function countIssues(findings: HardeningFinding[]): IssueCounts {
  return findings.reduce<IssueCounts>(
    (counts, finding) => {
      counts[finding.severity] += 1;
      return counts;
    },
    { P0: 0, P1: 0, P2: 0 }
  );
}

function calculateReadinessScore(input: {
  repoProfile: RepoProfileSummary;
  bootResult: BootResultSummary;
  findings: HardeningFinding[];
  testGeneration: TestGenerationSummary;
}): number {
  const issueCounts = countIssues(input.findings);
  let score = 100;

  if (input.bootResult.status !== 'running') {
    score -= 25;
  }

  score -= input.repoProfile.blockers.length * 10;
  score -= input.bootResult.blockers.length * 10;
  score -= input.bootResult.errors.length * 5;
  score -= issueCounts.P0 * 35;
  score -= issueCounts.P1 * 15;
  score -= issueCounts.P2 * 5;

  if (input.testGeneration.createdFiles.length === 0) {
    score -= 15;
  }

  return Math.max(0, Math.min(100, score));
}

function buildReport(input: {
  repoProfile: RepoProfileSummary;
  bootResult: BootResultSummary;
  findings: HardeningFinding[];
  testGeneration: TestGenerationSummary;
  issueCounts: IssueCounts;
  readinessScore: number;
  patchDiffPath: string;
}): string {
  const verificationCommand = buildVerificationCommand(input.testGeneration, input.bootResult);

  return `# hardening-mcp 硬化报告

## 摘要

| 项目 | 结果 |
| --- | --- |
| 就绪度评分 | ${input.readinessScore} |
| P0 | ${input.issueCounts.P0} |
| P1 | ${input.issueCounts.P1} |
| P2 | ${input.issueCounts.P2} |
| 启动状态 | ${formatTableCell(input.bootResult.status)} |
| 应用 URL | ${formatTableCell(input.bootResult.url ?? '未检测到')} |

## Repo Profile

| 字段 | 值 |
| --- | --- |
| framework | ${formatTableCell(input.repoProfile.framework)} |
| packageManager | ${formatTableCell(input.repoProfile.packageManager)} |
| recommendedStartCommand | ${formatTableCell(input.repoProfile.recommendedStartCommand ?? '未知')} |
| confidence | ${formatTableCell(input.repoProfile.confidence)} |

## 发现项

${formatFindings(input.findings)}

## 测试生成

| 字段 | 值 |
| --- | --- |
| createdFiles | ${formatTableCell(formatTextList(input.testGeneration.createdFiles, ', ') || '无')} |
| testCommand | ${formatTableCell(input.testGeneration.testCommand ?? '无')} |
| verificationCommand | ${formatTableCell(verificationCommand)} |
| validationStatus | ${formatTableCell(input.testGeneration.validationStatus ?? '未知')} |

## 修复指导

- 优先处理 P0 和 P1 问题。
- 运行生成的 Playwright 测试以复现关键路径。
- 补丁 diff 路径：\`${input.patchDiffPath}\`

## 阻塞项和错误

${formatBlockersAndErrors(input.repoProfile, input.bootResult, input.testGeneration)}
`;
}

function buildVerificationCommand(testGeneration: TestGenerationSummary, bootResult: BootResultSummary): string {
  if (!testGeneration.testCommand) {
    return 'Not recorded';
  }

  if (!bootResult.url) {
    return testGeneration.testCommand;
  }

  return `HARDENING_BASE_URL=${shellQuoteArg(bootResult.url)} ${testGeneration.testCommand}`;
}

function formatFindings(findings: HardeningFinding[]): string {
  if (findings.length === 0) {
    return '当前没有记录到发现项。\n';
  }

  return findings
    .map(
      (finding, index) => `### ${index + 1}. ${cleanText(finding.title)}

- 严重级别：${finding.severity}
- 类型：${finding.type}
- 复现步骤：${formatTextList(finding.reproSteps, ' -> ') || '无'}
- 证据：${formatTextList(finding.evidence, '；') || '无'}
`
    )
    .join('\n');
}

function formatBlockersAndErrors(
  repoProfile: RepoProfileSummary,
  bootResult: BootResultSummary,
  testGeneration: TestGenerationSummary
): string {
  const items = [
    ...repoProfile.blockers.map((blocker) => `- repo blocker: ${cleanText(blocker)}`),
    ...bootResult.blockers.map((blocker) => `- boot blocker: ${cleanText(blocker)}`),
    ...bootResult.errors.map((error) => `- boot error: ${cleanText(error)}`),
    ...testGeneration.errors.map((error) => `- test generation error: ${cleanText(error)}`)
  ];

  return items.length > 0 ? items.join('\n') : '当前没有记录到阻塞项或错误。';
}

function formatTextList(values: string[], separator: string): string {
  return values.map((value) => cleanText(value)).join(separator);
}

function formatTableCell(value: string): string {
  return cleanText(value).replace(/\r?\n|\r/g, ' ').replaceAll('|', '\\|');
}

function cleanText(value: string): string {
  const ansiPattern = new RegExp(`${String.fromCharCode(27)}\\[[0-9;?]*[ -/]*[@-~]`, 'g');
  const cleaned = Array.from(value.replace(ansiPattern, ''))
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127);
    })
    .join('');

  return redactSensitiveText(cleaned);
}

async function readRepoProfile(path: string): Promise<RepoProfileSummary> {
  const record = await readJsonRecord(path);
  return {
    framework: readString(record.framework, 'unknown'),
    packageManager: readString(record.packageManager, 'unknown'),
    recommendedStartCommand:
      typeof record.recommendedStartCommand === 'string' ? record.recommendedStartCommand : null,
    blockers: readStringArray(record.blockers),
    confidence: readString(record.confidence, 'low')
  };
}

async function readBootResult(path: string): Promise<BootResultSummary> {
  const record = await readJsonRecord(path);
  return {
    status: readString(record.status, 'unknown'),
    url: typeof record.url === 'string' ? record.url : null,
    blockers: readStringArray(record.blockers),
    errors: readStringArray(record.errors)
  };
}

async function readFindings(path: string): Promise<HardeningFinding[]> {
  const record = await readJsonRecord(path);

  if (!Array.isArray(record.findings)) {
    return [];
  }

  return record.findings.flatMap((finding) => (isFinding(finding) ? [finding] : []));
}

async function readTestGeneration(path: string): Promise<TestGenerationSummary> {
  const record = await readJsonRecord(path);
  return {
    createdFiles: readStringArray(record.createdFiles),
    testCommand: typeof record.testCommand === 'string' ? record.testCommand : null,
    validationStatus: typeof record.validationStatus === 'string' ? record.validationStatus : null,
    errors: readStringArray(record.errors)
  };
}

async function readJsonRecord(path: string): Promise<Record<string, unknown>> {
  try {
    const parsed = JSON.parse(await readFile(path, 'utf8')) as unknown;
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
