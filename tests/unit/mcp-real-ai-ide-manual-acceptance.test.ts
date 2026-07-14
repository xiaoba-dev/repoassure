import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

describe('blocked goal recovery MCP real AI IDE manual acceptance contract', () => {
  it('provides a bounded maintainer handoff and redacted evidence template', async () => {
    const [plan, operation, template, evidence, checklist, readme, strategy] = await Promise.all([
      readFile('docs/PLAN.md', 'utf8'),
      readFile(
        'docs/operations/blocked-goal-recovery-mcp-real-ai-ide-manual-acceptance-v0.1.md',
        'utf8'
      ),
      readFile(
        'docs/acceptance/templates/blocked-goal-recovery-mcp-real-ai-ide-manual-evidence-v0.1.md',
        'utf8'
      ),
      readFile(
        'docs/acceptance/evidence/blocked-goal-recovery-mcp-real-ai-ide-manual-acceptance-v0.1-2026-07-14.md',
        'utf8'
      ),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8')
    ]);

    expect(plan).toMatch(
      /## Next Codex Goal\n\nPublic Release Manual Gate Closure v0\.2/u
    );
    expect(operation).toContain('Status: completed');
    expect(operation).toContain('pnpm --silent mcp:config -- --client codex');
    expect(operation).toContain('one non-executing fixture call');
    expect(operation).toMatch(/do not execute recovery or resume commands/iu);
    expect(operation).toMatch(/remove or retain the configuration by explicit decision/iu);
    expect(template).toContain('Decision: pending | accepted | changes_requested | deferred');
    expect(template).toContain('Do not include absolute paths, environment values, tokens, or target repository data.');
    expect(template).toMatch(/tool discovery evidence/iu);
    expect(template).toMatch(/non-executing fixture evidence/iu);
    expect(evidence).toContain('Decision: accepted');
    expect(evidence).toContain('Codex CLI 0.144.2');
    expect(evidence).toContain('commandsExecuted: false');
    expect(evidence).toContain('externalStateChanged: false');
    expect(evidence).toContain('targetRepoMutation: false');
    expect(evidence).toContain('Configuration decision after the check: removed');
    expect(evidence).not.toContain('/private/tmp');
    expect(evidence).not.toContain('/Users/');
    expect(checklist).toContain('Blocked Goal Recovery MCP Real AI IDE Manual Acceptance v0.1');
    expect(readme).toContain('Codex 的首次人工验收已接受并保留脱敏证据');
    expect(strategy).toContain('Blocked Goal Recovery MCP Real AI IDE Manual Acceptance v0.1');
  });
});
