import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  formatProjectIntelligenceDecisionIntakeMarkdown,
  parseProjectIntelligenceDecisionIntakeArgs,
  runProjectIntelligenceDecisionIntake
} from '../../packages/acceptance/src/run-project-intelligence-decision-intake.js';
import type {
  ProjectIntelligenceDecisionIntake
} from '../../packages/acceptance/src/run-project-intelligence-decision-intake.js';

describe('project intelligence ADR cascade remediation decision intake', () => {
  it('generates maintainer decision intake records from the ADR cascade backlog without repairing docs', async () => {
    const root = join(tmpdir(), `repoassure-project-decision-intake-${randomUUID()}`);
    const outputDir = join(root, 'artifacts', 'project-graph');
    const backlogPath = join(outputDir, 'adr-cascade-remediation-backlog.md');

    await mkdir(outputDir, { recursive: true });
    await writeFile(backlogPath, buildBacklogFixture());

    const result = await runProjectIntelligenceDecisionIntake({
      backlogPath,
      outputDir,
      generatedAt: '2026-07-17T11:45:00.000+08:00'
    });
    const markdown = await readFile(result.decisionIntakePath, 'utf8');
    const json = JSON.parse(await readFile(result.decisionIntakeJsonPath, 'utf8')) as ProjectIntelligenceDecisionIntake;

    expect(result.decisionIntakePath).toBe(join(outputDir, 'adr-cascade-remediation-decision-intake.md'));
    expect(result.decisionIntakeJsonPath).toBe(join(outputDir, 'adr-cascade-remediation-decision-intake.json'));
    expect(result.itemCount).toBe(2);
    expect(markdown).toContain('# Project Intelligence ADR Cascade Remediation Decision Intake');
    expect(markdown).toContain('Status: maintainer_decision_required');
    expect(markdown).toContain('Generated from: adr-cascade-remediation-backlog.md');
    expect(markdown).toContain('## Decision Boundary');
    expect(markdown).toContain('This intake does not authorize automatic ADR/spec/docs edits or repair execution.');
    expect(markdown).toContain('Allowed decisions: approve / defer / accept-risk / repair');
    expect(markdown).toContain('### RA-ADR-CASCADE-001: docs/adr/0001-local-first-mcp-cli.md');
    expect(markdown).toContain('- [ ] Decision: approve / defer / accept-risk / repair');
    expect(markdown).toContain('- [ ] Evidence note:');
    expect(markdown).toContain('- [ ] Follow-up owner:');
    expect(markdown).toContain('- Current decision: pending');
    expect(markdown).not.toContain('sk-local-secret');
    expect(markdown).not.toContain('Authorization: Bearer');
    expect(json.schema).toBe('repoassure.project-intelligence.adr-cascade-decision-intake@1');
    expect(json.status).toBe('maintainer_decision_required');
    expect(json.sourceBacklog).toBe(backlogPath);
    expect(json.items).toHaveLength(2);
    expect(json.items[0]).toEqual(expect.objectContaining({
      id: 'RA-ADR-CASCADE-001',
      path: 'docs/adr/0001-local-first-mcp-cli.md',
      decision: null,
      allowedDecisions: ['approve', 'defer', 'accept-risk', 'repair']
    }));
    expect(json.boundary.automaticDocRewriteAuthorized).toBe(false);
    expect(json.boundary.automaticAdrRepairAuthorized).toBe(false);
    expect(formatProjectIntelligenceDecisionIntakeMarkdown(json, {
      generatedAt: '2026-07-17T11:45:00.000+08:00',
      backlogPath
    })).toContain('maintainer_decision_required');
  });

  it('rejects missing or malformed backlogs and unsupported repair options', async () => {
    const root = join(tmpdir(), `repoassure-project-decision-intake-invalid-${randomUUID()}`);
    const outputDir = join(root, 'artifacts', 'project-graph');
    const malformedBacklogPath = join(outputDir, 'adr-cascade-remediation-backlog.md');

    await mkdir(outputDir, { recursive: true });
    await writeFile(malformedBacklogPath, '# Not the backlog\n\nNo items here.\n');

    await expect(runProjectIntelligenceDecisionIntake({
      backlogPath: join(outputDir, 'missing.md'),
      outputDir
    })).rejects.toThrow('missing ADR cascade backlog');

    await expect(runProjectIntelligenceDecisionIntake({
      backlogPath: malformedBacklogPath,
      outputDir
    })).rejects.toThrow('invalid ADR cascade backlog');

    expect(parseProjectIntelligenceDecisionIntakeArgs([
      '--backlog',
      '/repo/artifacts/project-graph/adr-cascade-remediation-backlog.md',
      '--output',
      '/repo/artifacts/project-graph'
    ])).toEqual({
      backlogPath: '/repo/artifacts/project-graph/adr-cascade-remediation-backlog.md',
      outputDir: '/repo/artifacts/project-graph'
    });
    expect(() => parseProjectIntelligenceDecisionIntakeArgs(['--repair'])).toThrow(
      'Unknown project intelligence decision intake option'
    );
  });
});

function buildBacklogFixture(): string {
  return [
    '# Project Intelligence ADR Cascade Remediation Backlog',
    '',
    'Status: maintainer_review_required',
    'Generated at: 2026-07-17T11:30:00.000+08:00',
    'Generated from: project-intelligence-snapshot.json',
    '',
    '## Decision Boundary',
    '',
    'This backlog does not authorize automatic ADR/spec/docs edits.',
    'Each item needs a maintainer decision: approve / defer / accept-risk / repair.',
    'Generated graph artifacts remain local-only and ignored.',
    '',
    '## Items',
    '',
    '### RA-ADR-CASCADE-001: docs/adr/0001-local-first-mcp-cli.md',
    '',
    '- Severity: medium',
    '- Finding: missing_cascade',
    '- Evidence: docs/adr/0001-local-first-mcp-cli.md',
    '- Suggested action: Add graph-visible downstream cascade evidence or explicitly accept risk.',
    '- [ ] Decision: approve / defer / accept-risk / repair',
    '- [ ] Maintainer notes:',
    '',
    '### RA-ADR-CASCADE-002: docs/adr/0002-shared-cli-mcp-core.md',
    '',
    '- Severity: medium',
    '- Finding: missing_cascade',
    '- Evidence: docs/adr/0002-shared-cli-mcp-core.md, Authorization: Bearer sk-local-secret',
    '- Suggested action: Add graph-visible downstream cascade evidence or explicitly accept risk.',
    '- [ ] Decision: approve / defer / accept-risk / repair',
    '- [ ] Maintainer notes:',
    ''
  ].join('\n');
}
