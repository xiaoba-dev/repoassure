import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

describe('repo hygiene checker', () => {
  it('flags tracked generated artifacts, build outputs, logs, env files, and private keys', async () => {
    const { collectHygieneIssues } = await importRepoHygieneModule();

    const issues = collectHygieneIssues([
      'src/index.ts',
      'dist/index.js',
      'packages/acceptance/dist/index.js',
      '.hardening/runs/run-1/manifest.json',
      'artifacts/benchmark-runs/run-1/manifest.json',
      'benchmark-runs/run-1/summary.md',
      'test-results/.last-run.json',
      'debug.log',
      '.env',
      '.env.local',
      'fixtures/private.pem',
      'docs/architecture/overview.md'
    ]);

    expect(issues.map((issue: RepoHygieneIssue) => issue.path)).toEqual([
      'dist/index.js',
      'packages/acceptance/dist/index.js',
      '.hardening/runs/run-1/manifest.json',
      'artifacts/benchmark-runs/run-1/manifest.json',
      'benchmark-runs/run-1/summary.md',
      'test-results/.last-run.json',
      'debug.log',
      '.env',
      '.env.local',
      'fixtures/private.pem'
    ]);
    expect(issues.find((issue: RepoHygieneIssue) => issue.path === '.env')?.reason).toContain('environment');
    expect(issues.find((issue: RepoHygieneIssue) => issue.path === 'dist/index.js')?.reason).toContain('build output');
  });

  it('allows curated source fixtures, docs, and env examples', async () => {
    const { collectHygieneIssues } = await importRepoHygieneModule();

    expect(collectHygieneIssues([
      'src/shared/privacy-redaction.ts',
      'fixtures/python-cli-basic/hardening-report.md',
      'docs/acceptance/user-acceptance-record.md',
      '.env.example',
      'packages/acceptance/src/index.ts'
    ])).toEqual([]);
  });

  it('reads tracked file lists from stdin format and returns issue counts', async () => {
    const { runRepoHygieneCheck } = await importRepoHygieneModule();
    const workspace = await mkdtemp(join(tmpdir(), 'repo-hygiene-'));
    const inputPath = join(workspace, 'tracked.txt');
    await mkdir(join(workspace, 'nested'));
    await writeFile(inputPath, 'src/index.ts\ndist/index.js\n.env.local\n', 'utf8');

    const result = await runRepoHygieneCheck({ inputPath, cwd: workspace });

    expect(result.ok).toBe(false);
    expect(result.issues).toHaveLength(2);
    expect(result.summary).toContain('2 repository hygiene issue(s)');
  });

  it('prints CLI summaries and exits non-zero when tracked file input is unsafe', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'repo-hygiene-cli-'));
    const inputPath = join(workspace, 'tracked.txt');
    await writeFile(inputPath, 'src/index.ts\ndist/index.js\n', 'utf8');

    await expect(execFileAsync(process.execPath, [
      'scripts/check-repo-hygiene.mjs',
      '--input',
      inputPath
    ], {
      cwd: process.cwd()
    })).rejects.toMatchObject({
      code: 1,
      stdout: expect.stringContaining('1 repository hygiene issue(s) found.'),
      stderr: ''
    });
  });
});

async function importRepoHygieneModule() {
  return import(pathToFileURL(join(process.cwd(), 'scripts/check-repo-hygiene.mjs')).href);
}

type RepoHygieneIssue = {
  path: string;
  reason: string;
};
