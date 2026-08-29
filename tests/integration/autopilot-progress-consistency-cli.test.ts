import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

import { describe, expect, it } from 'vitest';

const runnerPath = resolve('packages/acceptance/dist/run-autopilot-progress-consistency.js');
const goal = {
  id: 'progress-guard-v0.1',
  title: 'Progress Guard v0.1',
  status: 'ready_to_execute'
};

describe('Autopilot progress consistency CLI', () => {
  it('returns zero with a structured report for a consistent local fixture', async () => {
    const root = await createFixture();

    const result = spawnSync(process.execPath, [runnerPath, '--root', root, '--json'], {
      encoding: 'utf8'
    });
    const report = JSON.parse(result.stdout) as { status: string; checks: unknown[] };

    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(report.status).toBe('consistent');
    expect(report.checks).toHaveLength(8);
  });

  it('returns one when a current-goal document assertion drifts', async () => {
    const root = await createFixture({
      plan: '## Active / Next Codex Goal\n\nNext Codex Goal: Old Goal v0.1 - ready to execute\n'
    });

    const result = spawnSync(process.execPath, [runnerPath, '--root', root, '--json'], {
      encoding: 'utf8'
    });
    const report = JSON.parse(result.stdout) as {
      status: string;
      checks: Array<{ id: string; status: string }>;
    };

    expect(result.status).toBe(1);
    expect(report.status).toBe('inconsistent');
    expect(report.checks).toContainEqual(expect.objectContaining({
      id: 'plan_next_goal',
      status: 'failed'
    }));
  });
});

async function createFixture(input: { plan?: string } = {}): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'repoassure-progress-cli-'));
  const goalPath = `.autopilot/goals/${goal.id}.json`;
  const files: Record<string, string> = {
    '.autopilot/goals/index.json': json({
      active_goal_id: goal.id,
      goals: [{ id: goal.id, path: goalPath, status: goal.status }]
    }),
    [goalPath]: json(goal),
    '.autopilot/progress/snapshot.json': json({
      active_goal: goal,
      next_goal: goal
    }),
    '.autopilot/progress/PROGRESS_SNAPSHOT.md': `## Next Goal\n\n${goal.title}\n`,
    'docs/PLAN.md': input.plan
      ?? `## Active / Next Codex Goal\n\nNext Codex Goal: ${goal.title} - ready to execute\n`,
    'README.md': `## Current Autopilot Status\n\nCurrent next goal: ${goal.title}.\n`,
    'docs/PRD.md': `The current next goal is ${goal.title}.\n`,
    'docs/SPEC.md': `The current next implementation target is ${goal.title}.\n`
  };

  for (const [path, content] of Object.entries(files)) {
    const absolutePath = join(root, path);
    await mkdir(join(absolutePath, '..'), { recursive: true });
    await writeFile(absolutePath, content);
  }

  return root;
}

function json(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}
