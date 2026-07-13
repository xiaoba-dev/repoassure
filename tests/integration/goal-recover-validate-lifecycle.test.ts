import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

import { BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS } from '../../packages/acceptance/src/blocked-goal-recovery-package.js';

const execFileAsync = promisify(execFile);

describe('blocked goal recovery lifecycle validation CLI', () => {
  it('rejects incomplete coverage without exposing a secret-like input path', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-lifecycle-cli-'));
    const secretDir = join(root, 'TOKEN=secret-value');
    const scenarioDir = join(secretDir, 'environment');
    await mkdir(scenarioDir, { recursive: true });
    await writeFile(join(scenarioDir, 'blocked-goal-recovery-package.json'), `${JSON.stringify({
      schemaVersion: 'repoassure.blocked-goal-recovery-package.v1',
      recoveryStatus: 'requires_maintainer_or_external_action', blockers: [{ category: 'environment' }],
      blockedActions: [...BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS]
    }, null, 2)}\n`);
    await writeFile(join(secretDir, 'blocked-goal-recovery-lifecycle-campaign-input.json'), `${JSON.stringify({
      schemaVersion: 'repoassure.blocked-goal-recovery-lifecycle-campaign-input.v1', campaignId: 'cli-smoke',
      scenarios: [{ scenarioId: 'environment', expectedOutcome: 'environment_blocker', artifactDir: 'environment' }]
    }, null, 2)}\n`);

    try {
      await execFileAsync('pnpm', [
        '--silent', 'goal:recover:validate-lifecycle', '--', '--from-dir', secretDir
      ], { cwd: process.cwd(), timeout: 30_000 });
      throw new Error('Expected lifecycle validation to reject partial coverage');
    } catch (error) {
      const result = error as { stdout?: string; stderr?: string; message: string };
      expect(`${result.stdout ?? ''}${result.stderr ?? ''}`).not.toContain('secret-value');
      expect(result.stderr).toContain('Invalid blocked goal recovery lifecycle campaign input');
    }
  }, 30_000);
});
