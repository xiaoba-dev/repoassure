import { isAbsolute, relative, resolve } from 'node:path';

import { parseShellWords } from './shell-words.js';
import { parseUserAcceptanceArgs } from './user-acceptance-args.js';

export interface UserAcceptanceRecordCheckOptions {
  pathExists?: (path: string) => boolean;
  goalLastUpdatedText?: string;
}

export type UserAcceptanceRecordStatus = 'accepted' | 'changes_requested' | 'pending_or_invalid';

export function classifyUserAcceptanceRecord(
  markdown: string,
  options: UserAcceptanceRecordCheckOptions = {}
): UserAcceptanceRecordStatus {
  if (isValidUserAcceptanceRecord(markdown, 'accepted', options) && hasConcreteAcceptedUserNotes(markdown)) {
    return 'accepted';
  }

  if (isValidUserAcceptanceRecord(markdown, 'changes_requested', options) && hasConcreteUserChangeNotes(markdown)) {
    return 'changes_requested';
  }

  return 'pending_or_invalid';
}

export function isAcceptedUserAcceptanceRecord(
  markdown: string,
  options: UserAcceptanceRecordCheckOptions = {}
): boolean {
  return classifyUserAcceptanceRecord(markdown, options) === 'accepted';
}

export function isAcceptanceRunFreshEnough(acceptanceRun: string, codexGoal: string): boolean {
  const acceptanceRunDate = extractIsoDateOrdinal(acceptanceRun.match(/生成时间：(\d{4}-\d{2}-\d{2})T/u)?.[1]);
  const goalLastUpdatedDate = extractChineseDateOrdinal(
    codexGoal.match(/最后更新：(\d{4})年(\d{1,2})月(\d{1,2})日/u)
  );

  return acceptanceRunDate !== undefined
    && goalLastUpdatedDate !== undefined
    && acceptanceRunDate >= goalLastUpdatedDate;
}

function isValidUserAcceptanceRecord(
  markdown: string,
  decision: 'accepted' | 'changes_requested',
  options: UserAcceptanceRecordCheckOptions
): boolean {
  const summary = parseUserAcceptanceSummary(markdown);
  const conclusion = readLastMarkdownSection(markdown, '验收判定');
  const artifactChecks = parseUserAcceptanceArtifactChecks(markdown);
  const requiredArtifactChecks = artifactChecks.filter((check) => check.required);
  const pathExists = options.pathExists ?? (() => true);
  const repoRoot = normalizeSummaryValue(summary.get('真实项目路径'));
  const command = normalizeSummaryValue(summary.get('验收命令'));
  const reportPath = normalizeSummaryValue(summary.get('hardening report'));
  const findingsPath = normalizeSummaryValue(summary.get('findings'));

  return markdown.includes('# 真实项目用户验收记录')
    && isFreshUserAcceptanceRecord(markdown, options.goalLastUpdatedText)
    && conclusion.includes(formatExpectedUserAcceptanceConclusion(decision))
    && summary.get('验收运行状态') === '通过'
    && summary.get('用户结论') === formatExpectedUserAcceptanceDecision(decision)
    && isExistingUserAcceptanceRepo(repoRoot, pathExists)
    && isConcreteUserAcceptanceCommand(command, repoRoot, decision)
    && isExistingUserAcceptanceArtifactPath(reportPath, repoRoot, pathExists)
    && isExistingUserAcceptanceArtifactPath(findingsPath, repoRoot, pathExists)
    && summary.get('必需项失败') === '0'
    && requiredArtifactChecks.length > 0
    && (decision !== 'accepted' || hasPassedGeneratedSpecValidation(artifactChecks))
    && requiredArtifactChecks.every((check) => (
      check.status === '通过'
      && hasVerifiableArtifactEvidence(check, repoRoot, pathExists)
    ));
}

function isFreshUserAcceptanceRecord(markdown: string, goalLastUpdatedText: string | undefined): boolean {
  return goalLastUpdatedText === undefined || isAcceptanceRunFreshEnough(markdown, goalLastUpdatedText);
}

function formatExpectedUserAcceptanceConclusion(decision: 'accepted' | 'changes_requested'): string {
  if (decision === 'accepted') {
    return '真实项目验收运行通过，且用户已明确确认 MVP 符合预期。';
  }

  return '真实项目验收运行通过，但用户要求修改；应将修改项记录到开发日志或阻塞日志后继续迭代。';
}

function formatExpectedUserAcceptanceDecision(decision: 'accepted' | 'changes_requested'): string {
  return decision === 'accepted' ? '用户确认通过' : '用户要求修改';
}

function hasConcreteAcceptedUserNotes(markdown: string): boolean {
  return hasConcreteUserNotes(markdown)
    && !readMarkdownSection(markdown, '用户备注').includes('<用户确认>');
}

function hasConcreteUserChangeNotes(markdown: string): boolean {
  return hasConcreteUserNotes(markdown)
    && !readMarkdownSection(markdown, '用户备注').includes('<具体修改项>');
}

function hasConcreteUserNotes(markdown: string): boolean {
  const notes = readMarkdownSection(markdown, '用户备注').trim();

  return notes.length > 0
    && notes !== '待用户填写'
    && notes !== '待用户填写。';
}

function isConcreteUserAcceptanceRepo(value: string): boolean {
  return value.length > 0
    && value !== '待提供'
    && value !== 'n/a'
    && !value.includes('<real-web-app-repo>');
}

function isExistingUserAcceptanceRepo(
  value: string,
  pathExists: (path: string) => boolean
): boolean {
  return isConcreteUserAcceptanceRepo(value)
    && isAbsolute(value)
    && pathExists(value);
}

function isConcreteUserAcceptanceCommand(
  value: string,
  repoRoot: string,
  expectedDecision: 'accepted' | 'changes_requested'
): boolean {
  const words = parseShellWords(value);

  if (!words) {
    return false;
  }

  const commandOptions = parseUserAcceptanceCommandOptions(words.slice(3));

  return isUserAcceptanceCommandPrefix(words)
    && commandOptions?.decision === expectedDecision
    && !value.includes('<real-web-app-repo>')
    && commandOptions.repoRoot !== undefined
    && resolve(commandOptions.repoRoot) === resolve(repoRoot);
}

function isUserAcceptanceCommandPrefix(words: string[]): boolean {
  return words[0] === 'pnpm'
    && words[1] === 'user:accept'
    && words[2] === '--';
}

function isConcreteUserAcceptanceArtifactPath(value: string): boolean {
  return value.length > 0
    && value !== '待生成'
    && value !== '待提供'
    && value !== 'n/a'
    && !value.includes('<');
}

function isExistingUserAcceptanceArtifactPath(
  value: string,
  repoRoot: string,
  pathExists: (path: string) => boolean
): boolean {
  return isConcreteUserAcceptanceArtifactPath(value)
    && isPathWithinRepoRoot(value, repoRoot)
    && pathExists(value);
}

function isPathWithinRepoRoot(path: string, repoRoot: string): boolean {
  if (!isAbsolute(path) || !isAbsolute(repoRoot)) {
    return false;
  }

  const relativePath = relative(resolve(repoRoot), resolve(path));

  return relativePath === ''
    || (!relativePath.startsWith('..') && !isAbsolute(relativePath));
}

function normalizeSummaryValue(value: string | undefined): string {
  if (!value) {
    return '';
  }

  const trimmed = value.trim();
  const fence = trimmed.match(/^(`+)/)?.[1];

  if (fence && trimmed.endsWith(fence)) {
    return trimmed.slice(fence.length, -fence.length).trim();
  }

  return trimmed;
}

function parseUserAcceptanceSummary(markdown: string): Map<string, string> {
  const summary = new Map<string, string>();
  const section = readMarkdownSection(markdown, '摘要');

  for (const line of section.split(/\r?\n/)) {
    const cells = parseMarkdownTableRow(line);
    const [key, value] = cells;

    if (cells.length !== 2 || !key || !value || key === '项目' || /^-+$/.test(key) || /^-+$/.test(value)) {
      continue;
    }

    summary.set(key, value);
  }

  return summary;
}

function hasVerifiableArtifactEvidence(
  check: { name: string; evidence: string },
  repoRoot: string,
  pathExists: (path: string) => boolean
): boolean {
  if (!requiresExistingArtifactEvidencePath(check.name)) {
    return true;
  }

  const paths = parseArtifactEvidencePaths(check.evidence);

  return paths.length > 0
    && paths.every((path) => isExistingUserAcceptanceArtifactPath(path, repoRoot, pathExists));
}

function hasPassedGeneratedSpecValidation(
  artifactChecks: Array<{ name: string; required: boolean; status: string; evidence: string }>
): boolean {
  const validationCheck = artifactChecks.find((check) => check.name === 'generated Playwright spec 执行验证');

  return validationCheck !== undefined
    && validationCheck.required
    && validationCheck.status === '通过'
    && hasVerifiableGeneratedSpecValidationEvidence(validationCheck.evidence);
}

function hasVerifiableGeneratedSpecValidationEvidence(evidence: string): boolean {
  const words = parseShellWords(evidence);

  return words !== undefined
    && words.some((word) => word.startsWith('HARDENING_BASE_URL='))
    && words.some((word, index) => isPlaywrightTestCommand(word, words[index + 1]));
}

function isPlaywrightTestCommand(command: string, nextWord: string | undefined): boolean {
  if (nextWord !== 'test') {
    return false;
  }

  const executableName = command.replaceAll('\\', '/').split('/').pop();

  return executableName === 'playwright' || executableName === 'playwright.cmd';
}

function requiresExistingArtifactEvidencePath(name: string): boolean {
  return name.includes('已生成') || name.includes('已记录');
}

function parseArtifactEvidencePaths(evidence: string): string[] {
  return evidence
    .split(',')
    .map((path) => normalizeSummaryValue(path))
    .filter((path) => path.length > 0);
}

function parseUserAcceptanceCommandOptions(words: string[]): { repoRoot: string; decision: string } | undefined {
  try {
    const options = parseUserAcceptanceArgs(words);

    return {
      repoRoot: options.repoRoot,
      decision: options.decision
    };
  } catch {
    return undefined;
  }
}

function parseUserAcceptanceArtifactChecks(markdown: string): Array<{
  name: string;
  required: boolean;
  status: string;
  evidence: string;
}> {
  const section = readMarkdownSection(markdown, 'Artifact 检查');
  const checks: Array<{ name: string; required: boolean; status: string; evidence: string }> = [];

  for (const line of section.split(/\r?\n/)) {
    const cells = parseMarkdownTableRow(line);
    const [name, required, status, evidence] = cells;

    if (cells.length !== 4 || required === '必需' || !required || !status || /^-+$/.test(required) || /^-+$/.test(status)) {
      continue;
    }

    checks.push({
      name: name ?? '',
      required: required === '是',
      status,
      evidence: evidence ?? ''
    });
  }

  return checks;
}

function readMarkdownSection(markdown: string, heading: string): string {
  const pattern = new RegExp(`^## ${escapeRegExp(heading)}\\s*$`, 'm');
  const match = pattern.exec(markdown);

  if (!match) {
    return '';
  }

  const start = match.index + match[0].length;
  const rest = markdown.slice(start);
  const nextHeading = /^## /m.exec(rest);

  return (nextHeading ? rest.slice(0, nextHeading.index) : rest).trim();
}

function readLastMarkdownSection(markdown: string, heading: string): string {
  const matches = [...markdown.matchAll(new RegExp(`^## ${escapeRegExp(heading)}\\s*$`, 'gm'))];
  const match = matches.at(-1);

  if (!match) {
    return '';
  }

  const start = match.index + match[0].length;
  const rest = markdown.slice(start);
  const nextHeading = /^## /m.exec(rest);

  return (nextHeading ? rest.slice(0, nextHeading.index) : rest).trim();
}

function parseMarkdownTableRow(line: string): string[] {
  const trimmed = line.trim();

  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) {
    return [];
  }

  const cells: string[] = [];
  let current = '';
  const content = trimmed.slice(1, -1);

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index] ?? '';

    if (character === '\\' && content[index + 1] === '|') {
      current += '|';
      index += 1;
      continue;
    }

    if (character === '|') {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += character;
  }

  cells.push(current.trim());

  return cells;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractIsoDateOrdinal(value: string | undefined): number | undefined {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/u);
  if (!match) {
    return undefined;
  }

  return dateOrdinal(Number(match[1]), Number(match[2]), Number(match[3]));
}

function extractChineseDateOrdinal(match: RegExpMatchArray | null): number | undefined {
  if (!match) {
    return undefined;
  }

  return dateOrdinal(Number(match[1]), Number(match[2]), Number(match[3]));
}

function dateOrdinal(year: number, month: number, day: number): number | undefined {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return undefined;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return undefined;
  }

  return year * 10_000 + month * 100 + day;
}
