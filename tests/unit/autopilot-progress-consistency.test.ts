import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

import {
  parseAutopilotProgressConsistencyArgs,
  runAutopilotProgressConsistency
} from '../../packages/acceptance/src/run-autopilot-progress-consistency.js';

const goal = {
  id: 'repoassure-autopilot-progress-consistency-guard-v0.1',
  title: 'RepoAssure Autopilot Progress Consistency Guard v0.1',
  status: 'ready_to_execute'
} as const;

describe('Autopilot progress consistency guard', () => {
  it('keeps the real RepoAssure active/next goal surfaces aligned', async () => {
    const report = await runAutopilotProgressConsistency({ root: resolve('.') });

    expect(report.status).toBe('consistent');
    expect(report.checks.every((check) => check.status === 'passed')).toBe(true);
  });

  it('passes when machine state and current-goal document surfaces agree', async () => {
    const root = await createFixture();
    const before = await listFiles(root);

    const report = await runAutopilotProgressConsistency({ root });

    expect(report.schema).toBe('repoassure.autopilot-progress-consistency@1');
    expect(report.status).toBe('consistent');
    expect(report.canonicalGoal).toEqual(goal);
    expect(report.checks).toHaveLength(8);
    expect(report.checks.every((check) => check.status === 'passed')).toBe(true);
    expect(report.boundary).toEqual(expect.objectContaining({
      localOnly: true,
      readOnly: true,
      targetRepoWriteAuthorized: false
    }));
    expect(await listFiles(root)).toEqual(before);
  });

  it('fails closed when snapshot state drifts from the goal index', async () => {
    const root = await createFixture({
      snapshot: {
        active_goal: { ...goal, status: 'completed' },
        next_goal: goal
      }
    });

    const report = await runAutopilotProgressConsistency({ root });

    expect(report.status).toBe('inconsistent');
    expect(report.checks).toContainEqual(expect.objectContaining({
      id: 'snapshot_active_goal',
      status: 'failed'
    }));
  });

  it('reports the exact current-goal document surface that drifted', async () => {
    const root = await createFixture({
      documents: {
        'docs/PLAN.md': '## Active / Next Codex Goal\n\nNext Codex Goal: Some Other Goal v0.1 - ready to execute\n'
      }
    });

    const report = await runAutopilotProgressConsistency({ root });

    expect(report.status).toBe('inconsistent');
    expect(report.checks).toContainEqual(expect.objectContaining({
      id: 'plan_next_goal',
      path: 'docs/PLAN.md',
      status: 'failed'
    }));
  });

  it('fails closed with a deterministic check when a required input is missing', async () => {
    const root = await createFixture({
      omit: ['docs/SPEC.md']
    });

    const report = await runAutopilotProgressConsistency({ root });

    expect(report.status).toBe('inconsistent');
    expect(report.checks).toContainEqual(expect.objectContaining({
      id: 'spec_next_goal',
      status: 'failed',
      actual: 'missing'
    }));
  });

  it('accepts only read-only CLI options', () => {
    expect(parseAutopilotProgressConsistencyArgs(['--root', '/repo'])).toEqual({
      root: '/repo',
      json: false
    });
    expect(parseAutopilotProgressConsistencyArgs(['--root=/repo', '--json'])).toEqual({
      root: '/repo',
      json: true
    });

    for (const option of ['--write', '--fix', '--deploy', '--target-repo-write']) {
      expect(() => parseAutopilotProgressConsistencyArgs([option])).toThrow(
        'Unknown Autopilot progress consistency option'
      );
    }
  });
});

interface FixtureOptions {
  readonly snapshot?: {
    readonly active_goal: {
      readonly id: string;
      readonly title: string;
      readonly status: string;
    };
    readonly next_goal: {
      readonly id: string;
      readonly title: string;
      readonly status: string;
    };
  };
  readonly documents?: Readonly<Record<string, string>>;
  readonly omit?: readonly string[];
}

async function createFixture(options: FixtureOptions = {}): Promise<string> {
  const root = join(tmpdir(), `repoassure-progress-consistency-${randomUUID()}`);
  const goalPath = `.autopilot/goals/${goal.id}.json`;
  const documents: Record<string, string> = {
    '.autopilot/goals/index.json': `${JSON.stringify({
      schema: 'project-autopilot/goal-index@1',
      active_goal_id: goal.id,
      goals: [{ id: goal.id, path: goalPath, status: goal.status }]
    }, null, 2)}\n`,
    [goalPath]: `${JSON.stringify({
      schema: 'project-autopilot/goal@1',
      ...goal,
      objective: 'Keep current goal state aligned.'
    }, null, 2)}\n`,
    '.autopilot/progress/snapshot.json': `${JSON.stringify({
      schema: 'project-autopilot/progress-snapshot@1',
      active_goal: options.snapshot?.active_goal ?? goal,
      next_goal: options.snapshot?.next_goal ?? goal
    }, null, 2)}\n`,
    '.autopilot/progress/PROGRESS_SNAPSHOT.md': [
      '# Progress',
      '',
      '## Next Goal',
      '',
      goal.title,
      ''
    ].join('\n'),
    'docs/PLAN.md': `## Active / Next Codex Goal\n\nNext Codex Goal: ${goal.title} - ready to execute\n`,
    'README.md': `## Current Autopilot Status\n\nCurrent next goal: ${goal.title}.\n`,
    'docs/PRD.md': `## Current Product Direction\n\nThe current next goal is ${goal.title}.\n`,
    'docs/SPEC.md': `## Current Implementation Target\n\nThe current next implementation target is ${goal.title}.\n`,
    ...options.documents
  };

  for (const [path, content] of Object.entries(documents)) {
    if (options.omit?.includes(path)) {
      continue;
    }

    const absolutePath = join(root, path);
    await mkdir(join(absolutePath, '..'), { recursive: true });
    await writeFile(absolutePath, content);
  }

  return root;
}

async function listFiles(root: string): Promise<string[]> {
  const entries = await readdir(root, { recursive: true });
  return entries.map(String).sort();
}
