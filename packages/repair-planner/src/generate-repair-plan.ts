import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

import { redactSensitiveText } from '@hardening-mcp/shared/privacy-redaction';
import { shellQuoteArg } from '@hardening-mcp/shared/shell-quote';
import {
  findingTypeRepairIntent,
  severityRank,
  type FindingSeverity,
  type FindingType,
  type RepairEvidence,
  type RepairPlan,
  type RepairPlanGenerationResult,
  type RepairTaskPackage,
  type RepairTargetArea,
  type RepairTask,
  type RepairVerification
} from './repair-plan.js';

export type { RepairPlanGenerationResult } from './repair-plan.js';

export interface GenerateRepairPlanInput {
  repoRoot: string;
  runDir: string;
  sourceManifestPath: string;
  runId: string;
  outputJsonPath?: string;
  outputMarkdownPath?: string;
  outputTaskPackageJsonPath?: string;
  outputTaskPackageMarkdownPath?: string;
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

interface HardeningFinding {
  severity: FindingSeverity;
  type: FindingType;
  title: string;
  reproSteps: string[];
  evidence: string[];
}

export async function generateRepairPlan(input: GenerateRepairPlanInput): Promise<RepairPlanGenerationResult> {
  const [findings, testGeneration, bootResult] = await Promise.all([
    readFindings(join(input.runDir, 'findings.json')),
    readTestGeneration(join(input.runDir, 'test-generation.json')),
    readBootResult(join(input.runDir, 'boot-result.json'))
  ]);
  const tasks = buildRepairTasks({
    runDir: input.runDir,
    findings,
    testGeneration,
    bootResult
  });
  const plan: RepairPlan = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    runId: cleanText(input.runId),
    repoRoot: cleanText(input.repoRoot),
    sourceManifest: cleanText(input.sourceManifestPath),
    summary: {
      totalTasks: tasks.length,
      p0: tasks.filter((task) => task.severity === 'P0').length,
      p1: tasks.filter((task) => task.severity === 'P1').length,
      p2: tasks.filter((task) => task.severity === 'P2').length
    },
    tasks
  };
  const repairPlanPath = input.outputJsonPath ?? join(input.runDir, 'repair-plan.json');
  const repairPlanMarkdownPath = input.outputMarkdownPath ?? join(input.runDir, 'repair-plan.md');
  const repairTaskPackagePath = input.outputTaskPackageJsonPath ?? join(input.runDir, 'repair-task-package.json');
  const repairTaskPackageMarkdownPath = input.outputTaskPackageMarkdownPath ?? join(input.runDir, 'repair-task-package.md');
  const taskPackage = buildRepairTaskPackage(plan);

  await mkdir(dirname(repairPlanPath), { recursive: true });
  await mkdir(dirname(repairPlanMarkdownPath), { recursive: true });
  await mkdir(dirname(repairTaskPackagePath), { recursive: true });
  await mkdir(dirname(repairTaskPackageMarkdownPath), { recursive: true });
  await writeFile(repairPlanPath, `${JSON.stringify(plan, null, 2)}\n`);
  await writeFile(repairPlanMarkdownPath, buildRepairPlanMarkdown(plan));
  await writeFile(repairTaskPackagePath, `${JSON.stringify(taskPackage, null, 2)}\n`);
  await writeFile(repairTaskPackageMarkdownPath, buildRepairTaskPackageMarkdown(taskPackage));

  return {
    repairPlanPath,
    repairPlanMarkdownPath,
    repairTaskPackagePath,
    repairTaskPackageMarkdownPath,
    taskCount: tasks.length,
    highestSeverity: tasks[0]?.severity ?? null,
    recommendedNextTaskId: tasks[0]?.taskId ?? null
  };
}

function buildRepairTasks(input: {
  runDir: string;
  findings: HardeningFinding[];
  testGeneration: TestGenerationSummary;
  bootResult: BootResultSummary;
}): RepairTask[] {
  return input.findings
    .map((finding, index) => buildRepairTask({
      runDir: input.runDir,
      finding,
      index,
      testGeneration: input.testGeneration,
      bootResult: input.bootResult
    }))
    .sort((left, right) => {
      const severity = severityRank(left.severity) - severityRank(right.severity);
      return severity === 0 ? left.taskId.localeCompare(right.taskId) : severity;
    });
}

function buildRepairTask(input: {
  runDir: string;
  finding: HardeningFinding;
  index: number;
  testGeneration: TestGenerationSummary;
  bootResult: BootResultSummary;
}): RepairTask {
  const findingId = buildFindingId(input.finding, input.index);
  const verification = buildVerification(input.testGeneration, input.bootResult);
  const targetAreas = extractTargetAreas(input.finding);
  const title = cleanText(input.finding.title);

  return {
    taskId: buildTaskId(input.finding),
    severity: input.finding.severity,
    status: 'todo',
    title,
    rootCauseHypothesis: buildRootCauseHypothesis(input.finding),
    repairIntent: findingTypeRepairIntent(input.finding.type),
    findingIds: [findingId],
    evidence: buildEvidence({
      runDir: input.runDir,
      finding: input.finding,
      testGeneration: input.testGeneration,
      bootResult: input.bootResult
    }),
    targetAreas,
    suggestedFiles: [],
    verification,
    agentPrompt: buildAgentPrompt(input.finding.severity, title, verification.commands)
  };
}

function buildTaskId(finding: HardeningFinding): string {
  const base = `${finding.severity}-${finding.type}-${finding.title}`;
  return slugify(base);
}

function buildFindingId(finding: HardeningFinding, index: number): string {
  return `${slugify(`${finding.type}-${finding.title}`)}-${String(index + 1).padStart(3, '0')}`;
}

function buildRootCauseHypothesis(finding: HardeningFinding): string {
  const evidence = finding.evidence[0] ? `证据显示：${cleanText(finding.evidence[0])}` : '当前发现项缺少更细证据。';
  return `${evidence} 初步判断该问题与 ${finding.type} 类型的用户路径或运行时状态有关。`;
}

function buildEvidence(input: {
  runDir: string;
  finding: HardeningFinding;
  testGeneration: TestGenerationSummary;
  bootResult: BootResultSummary;
}): RepairEvidence[] {
  const evidence: RepairEvidence[] = [
    {
      type: 'finding',
      path: join(input.runDir, 'findings.json'),
      summary: [
        cleanText(input.finding.title),
        ...input.finding.evidence.map((item) => cleanText(item))
      ].join(' | ')
    }
  ];

  if (input.testGeneration.createdFiles.length > 0) {
    evidence.push({
      type: 'test',
      path: join(input.runDir, 'test-generation.json'),
      summary: `Generated regression tests: ${input.testGeneration.createdFiles.map((file) => cleanText(file)).join(', ')}`
    });
  }

  if (input.bootResult.status !== 'unknown') {
    evidence.push({
      type: 'boot',
      path: join(input.runDir, 'boot-result.json'),
      summary: `Boot status: ${cleanText(input.bootResult.status)}${input.bootResult.url ? ` ${cleanText(input.bootResult.url)}` : ''}`
    });
  }

  return evidence;
}

function extractTargetAreas(finding: HardeningFinding): RepairTargetArea[] {
  const areas = new Map<string, RepairTargetArea>();
  const candidates = [...finding.reproSteps, ...finding.evidence];

  for (const candidate of candidates) {
    const route = extractRoute(candidate);
    if (route) {
      areas.set(`route:${route}`, { kind: 'route', value: route });
      continue;
    }

    const interaction = extractInteraction(candidate);
    if (interaction) {
      areas.set(`interaction:${interaction}`, { kind: 'interaction', value: interaction });
    }
  }

  return areas.size > 0 ? [...areas.values()] : [{ kind: 'unknown', value: 'unknown' }];
}

function extractRoute(value: string): string | null {
  const route = /(?:^|\s)(\/[A-Za-z0-9._~!$&'()*+,;=:@%/-]*)/.exec(value)?.[1];
  if (!route) {
    return null;
  }

  return route.replace(/[),.;]+$/g, '') || null;
}

function extractInteraction(value: string): string | null {
  const match = /(?:click|submit|trigger|press|type)\s+(.+)$/i.exec(value);
  return match?.[1] ? cleanText(match[1]).slice(0, 120) : null;
}

function buildVerification(testGeneration: TestGenerationSummary, bootResult: BootResultSummary): RepairVerification {
  const commands = testGeneration.testCommand
    ? [buildVerificationCommand(testGeneration.testCommand, bootResult.url)]
    : [];

  return {
    commands,
    generatedTests: testGeneration.createdFiles.map((file) => cleanText(file)),
    validationStatus: testGeneration.validationStatus
  };
}

function buildVerificationCommand(testCommand: string, appUrl: string | null): string {
  if (!appUrl) {
    return cleanText(testCommand);
  }

  return cleanText(`HARDENING_BASE_URL=${shellQuoteArg(appUrl)} ${testCommand}`);
}

function buildAgentPrompt(severity: FindingSeverity, title: string, commands: string[]): string {
  const verification = commands.length > 0
    ? `修复后运行 verification.commands：${commands.join(' && ')}。`
    : '修复后运行项目现有测试，并重新执行 hardening run。';

  return cleanText(`请基于 evidence 修复该 ${severity} 问题：${title}。保持最小改动，不扩大无关重构；${verification}`);
}

function buildRepairTaskPackage(plan: RepairPlan): RepairTaskPackage {
  return {
    schemaVersion: 1,
    generatedAt: plan.generatedAt,
    runId: plan.runId,
    repoRoot: plan.repoRoot,
    sourceManifest: plan.sourceManifest,
    summary: plan.summary,
    tasks: plan.tasks.map((task) => ({
      taskId: task.taskId,
      severity: task.severity,
      status: 'todo',
      title: task.title,
      objective: cleanText(`修复 ${task.severity} 问题：${task.title}`),
      context: {
        findingIds: task.findingIds,
        evidence: task.evidence,
        targetAreas: task.targetAreas,
        rootCauseHypothesis: task.rootCauseHypothesis
      },
      recommendedFix: {
        repairIntent: task.repairIntent,
        expectedOutcome: buildExpectedOutcome(task),
        changeScope: {
          include: buildIncludedChangeScope(task),
          exclude: [
            '不要扩大到无关重构、格式化全仓代码或改变非相关业务行为。',
            '不要删除现有测试、验收产物或 hardening evidence。',
            '不要引入明文 secret、token、cookie 或本地私有路径。'
          ]
        },
        implementationSteps: buildImplementationSteps(task)
      },
      verification: {
        commands: task.verification.commands,
        generatedTests: task.verification.generatedTests,
        acceptanceCriteria: buildAcceptanceCriteria(task)
      },
      handoffPrompt: buildHandoffPrompt(task)
    }))
  };
}

function buildExpectedOutcome(task: RepairTask): string {
  const target = task.targetAreas
    .map((area) => `${area.kind}:${area.value}`)
    .join(', ');

  return cleanText(`用户路径或运行状态 ${target || 'unknown'} 不再复现该问题；相关生成测试和项目既有质量门禁通过。`);
}

function buildIncludedChangeScope(task: RepairTask): string[] {
  return [
    task.repairIntent,
    `优先检查目标区域：${task.targetAreas.map((area) => `${area.kind}:${area.value}`).join(', ') || 'unknown'}`,
    `保留并复用证据文件：${task.evidence.map((item) => item.path).join(', ')}`
  ].map(cleanText);
}

function buildImplementationSteps(task: RepairTask): string[] {
  return [
    '读取 context.evidence 中列出的 findings、boot result、test-generation 和生成测试。',
    '在最小影响范围内定位根因，先补充或调整能复现该 finding 的测试。',
    `按 recommendedFix.repairIntent 修复：${task.repairIntent}`,
    '运行 verification.commands；如果为空，运行项目既有 unit、lint、typecheck、build 和 hardening run。',
    '确认 acceptanceCriteria 全部满足后，再提交修复说明。'
  ].map(cleanText);
}

function buildAcceptanceCriteria(task: RepairTask): string[] {
  const criteria = [
    `${task.severity} finding ${task.taskId} 不再出现在重新生成的 findings 中。`,
    '修复没有引入新的 P0/P1 hardening finding。',
    '相关页面或交互有可见成功态、错误态或稳定反馈。',
    '源码中没有新增明文 secret 或敏感路径。'
  ];

  if (task.verification.generatedTests.length > 0) {
    criteria.push(`生成测试通过：${task.verification.generatedTests.join(', ')}`);
  }

  if (task.verification.commands.length > 0) {
    criteria.push(`验收命令通过：${task.verification.commands.join(' && ')}`);
  }

  return criteria.map(cleanText);
}

function buildHandoffPrompt(task: RepairTask): string {
  const commandText = task.verification.commands.length > 0
    ? `修复后运行：${task.verification.commands.join(' && ')}。`
    : '修复后运行项目既有测试和 hardening run。';

  return cleanText([
    `你是接手目标 repo 的修复 Agent。请修复 ${task.severity} 任务 ${task.taskId}：${task.title}。`,
    `先读取 evidence 和 generatedTests，基于 rootCauseHypothesis 定位根因。`,
    `保持最小改动，只修改与 targetAreas 和 repairIntent 直接相关的代码。`,
    commandText,
    `满足 acceptanceCriteria 后输出修改摘要、测试结果和剩余风险。`
  ].join(' '));
}

function buildRepairPlanMarkdown(plan: RepairPlan): string {
  const taskLines = plan.tasks.length > 0
    ? plan.tasks.flatMap((task, index) => [
        `## ${index + 1}. ${task.taskId}`,
        '',
        `- Severity: ${task.severity}`,
        `- Status: ${task.status}`,
        `- Title: ${task.title}`,
        `- Repair intent: ${task.repairIntent}`,
        `- Evidence: ${task.evidence.map((item) => item.summary).join('；')}`,
        `- Verification: ${task.verification.commands.join(' && ') || 'Not recorded'}`,
        '',
        task.agentPrompt,
        ''
      ])
    : ['## No Repair Tasks', '', 'No hardening findings were recorded in this run.', ''];

  return [
    '# Repair Plan',
    '',
    `- Run ID: ${plan.runId}`,
    `- Total tasks: ${plan.summary.totalTasks}`,
    `- P0/P1/P2: ${plan.summary.p0}/${plan.summary.p1}/${plan.summary.p2}`,
    '',
    ...taskLines
  ].join('\n');
}

function buildRepairTaskPackageMarkdown(taskPackage: RepairTaskPackage): string {
  const taskLines = taskPackage.tasks.length > 0
    ? taskPackage.tasks.flatMap((task, index) => [
        `## ${index + 1}. ${task.taskId}`,
        '',
        `- Severity: ${task.severity}`,
        `- Objective: ${task.objective}`,
        `- Expected outcome: ${task.recommendedFix.expectedOutcome}`,
        `- Change scope: ${task.recommendedFix.changeScope.include.join('；')}`,
        `- Do not: ${task.recommendedFix.changeScope.exclude.join('；')}`,
        `- Acceptance criteria: ${task.verification.acceptanceCriteria.join('；')}`,
        `- Verification: ${task.verification.commands.join(' && ') || 'Not recorded'}`,
        '',
        '### Handoff Prompt',
        '',
        task.handoffPrompt,
        ''
      ])
    : ['## No Executable Repair Tasks', '', 'No hardening findings were recorded in this run.', ''];

  return [
    '# Executable Repair Task Package',
    '',
    `- Run ID: ${taskPackage.runId}`,
    `- Total tasks: ${taskPackage.summary.totalTasks}`,
    `- P0/P1/P2: ${taskPackage.summary.p0}/${taskPackage.summary.p1}/${taskPackage.summary.p2}`,
    '',
    ...taskLines
  ].join('\n');
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

async function readBootResult(path: string): Promise<BootResultSummary> {
  const record = await readJsonRecord(path);
  return {
    status: readString(record.status, 'unknown'),
    url: typeof record.url === 'string' ? record.url : null,
    blockers: readStringArray(record.blockers),
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

function isFinding(value: unknown): value is HardeningFinding {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isSeverity(value.severity) &&
    isFindingType(value.type) &&
    typeof value.title === 'string' &&
    Array.isArray(value.reproSteps) &&
    value.reproSteps.every((step) => typeof step === 'string') &&
    Array.isArray(value.evidence) &&
    value.evidence.every((evidence) => typeof evidence === 'string')
  );
}

function isSeverity(value: unknown): value is FindingSeverity {
  return value === 'P0' || value === 'P1' || value === 'P2';
}

function isFindingType(value: unknown): value is FindingType {
  return (
    value === 'white_screen' ||
    value === 'broken_route' ||
    value === 'dead_control' ||
    value === 'form_failure' ||
    value === 'console_error' ||
    value === 'network_error'
  );
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

function slugify(value: string): string {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 96) || basename(value) || 'repair-task';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
