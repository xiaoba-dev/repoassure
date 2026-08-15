import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  formatProjectIntelligenceRecommendationDraftMarkdown,
  parseProjectIntelligenceRecommendationDraftArgs,
  runProjectIntelligenceRecommendationDraft
} from '../../packages/acceptance/src/run-project-intelligence-recommendation-draft.js';
import type {
  ProjectIntelligenceRecommendationDraft
} from '../../packages/acceptance/src/run-project-intelligence-recommendation-draft.js';

describe('project intelligence ADR cascade remediation recommendation draft', () => {
  it('generates maintainer-reviewable recommendation drafts without writing final decisions or repairing docs', async () => {
    const root = join(tmpdir(), `repoassure-project-recommendation-draft-${randomUUID()}`);
    const outputDir = join(root, 'artifacts', 'project-graph');
    const intakePath = join(outputDir, 'adr-cascade-remediation-decision-intake.json');

    await mkdir(outputDir, { recursive: true });
    await writeFile(intakePath, JSON.stringify(buildDecisionIntakeFixture(), null, 2));

    const result = await runProjectIntelligenceRecommendationDraft({
      intakePath,
      outputDir,
      generatedAt: '2026-07-17T15:45:00.000+08:00'
    });
    const markdown = await readFile(result.recommendationDraftPath, 'utf8');
    const json = JSON.parse(
      await readFile(result.recommendationDraftJsonPath, 'utf8')
    ) as ProjectIntelligenceRecommendationDraft;

    expect(result.recommendationDraftPath).toBe(
      join(outputDir, 'adr-cascade-remediation-recommendation-draft.md')
    );
    expect(result.recommendationDraftJsonPath).toBe(
      join(outputDir, 'adr-cascade-remediation-recommendation-draft.json')
    );
    expect(result.itemCount).toBe(2);
    expect(markdown).toContain('# Project Intelligence ADR Cascade Remediation Recommendation Draft');
    expect(markdown).toContain('Status: maintainer_review_required');
    expect(markdown).toContain('Generated from: adr-cascade-remediation-decision-intake.json');
    expect(markdown).toContain('This draft does not write final maintainer decisions.');
    expect(markdown).toContain('This draft does not authorize automatic ADR/spec/docs edits or repair execution.');
    expect(markdown).toContain('### RA-ADR-CASCADE-001: docs/adr/0001-local-first-mcp-cli.md');
    expect(markdown).toContain('- Recommended decision: repair');
    expect(markdown).toContain('- Rationale: Missing cascade evidence should be repaired because downstream docs need graph-visible linkage.');
    expect(markdown).toContain('- Risk: Medium documentation governance risk if left unresolved.');
    expect(markdown).toContain('- Rollback / follow-up: Keep the item pending if maintainer disagrees; no source document is changed by this draft.');
    expect(markdown).toContain('- [ ] Maintainer decision: approve / defer / accept-risk / repair');
    expect(markdown).toContain('- Current final decision: pending');
    expect(markdown).not.toContain('sk-local-secret');
    expect(markdown).not.toContain('Authorization: Bearer');
    expect(json.schema).toBe('repoassure.project-intelligence.adr-cascade-recommendation-draft@1');
    expect(json.status).toBe('maintainer_review_required');
    expect(json.sourceIntake).toBe(intakePath);
    expect(json.summary.items).toBe(2);
    expect(json.summary.recommendedRepair).toBe(2);
    expect(json.boundary.finalMaintainerDecisionWritten).toBe(false);
    expect(json.boundary.automaticDocRewriteAuthorized).toBe(false);
    expect(json.boundary.automaticAdrRepairAuthorized).toBe(false);
    expect(json.boundary.repairExecutionAuthorized).toBe(false);
    expect(json.items[0]).toEqual(expect.objectContaining({
      id: 'RA-ADR-CASCADE-001',
      path: 'docs/adr/0001-local-first-mcp-cli.md',
      currentFinalDecision: null,
      recommendedDecision: 'repair'
    }));
    expect(json.items[0]?.evidence).toEqual(['docs/adr/0001-local-first-mcp-cli.md']);
    expect(formatProjectIntelligenceRecommendationDraftMarkdown(json, {
      generatedAt: '2026-07-17T15:45:00.000+08:00',
      intakePath
    })).toContain('Recommended decision: repair');
  });

  it('rejects missing or malformed intakes and unsupported apply or repair options', async () => {
    const root = join(tmpdir(), `repoassure-project-recommendation-draft-invalid-${randomUUID()}`);
    const outputDir = join(root, 'artifacts', 'project-graph');
    const malformedIntakePath = join(outputDir, 'adr-cascade-remediation-decision-intake.json');

    await mkdir(outputDir, { recursive: true });
    await writeFile(malformedIntakePath, JSON.stringify({ schema: 'wrong' }, null, 2));

    await expect(runProjectIntelligenceRecommendationDraft({
      intakePath: join(outputDir, 'missing.json'),
      outputDir
    })).rejects.toThrow('missing ADR cascade decision intake');

    await expect(runProjectIntelligenceRecommendationDraft({
      intakePath: malformedIntakePath,
      outputDir
    })).rejects.toThrow('invalid ADR cascade decision intake');

    expect(parseProjectIntelligenceRecommendationDraftArgs([
      '--intake',
      '/repo/artifacts/project-graph/adr-cascade-remediation-decision-intake.json',
      '--output',
      '/repo/artifacts/project-graph'
    ])).toEqual({
      intakePath: '/repo/artifacts/project-graph/adr-cascade-remediation-decision-intake.json',
      outputDir: '/repo/artifacts/project-graph'
    });
    expect(() => parseProjectIntelligenceRecommendationDraftArgs(['--apply'])).toThrow(
      'Unknown project intelligence recommendation draft option'
    );
    expect(() => parseProjectIntelligenceRecommendationDraftArgs(['--repair'])).toThrow(
      'Unknown project intelligence recommendation draft option'
    );
  });
});

function buildDecisionIntakeFixture(): unknown {
  return {
    schema: 'repoassure.project-intelligence.adr-cascade-decision-intake@1',
    status: 'maintainer_decision_required',
    generatedAt: '2026-07-17T15:30:00.000+08:00',
    sourceBacklog: '/repo/artifacts/project-graph/adr-cascade-remediation-backlog.md',
    summary: {
      items: 2,
      pending: 2
    },
    boundary: {
      automaticDocRewriteAuthorized: false,
      automaticAdrRepairAuthorized: false,
      repairExecutionAuthorized: false,
      hostedDashboardImplemented: false,
      telemetryEnabled: false
    },
    items: [
      {
        id: 'RA-ADR-CASCADE-001',
        path: 'docs/adr/0001-local-first-mcp-cli.md',
        severity: 'medium',
        finding: 'missing_cascade',
        evidence: ['docs/adr/0001-local-first-mcp-cli.md'],
        suggestedAction: 'Add graph-visible downstream cascade evidence or explicitly accept risk.',
        allowedDecisions: ['approve', 'defer', 'accept-risk', 'repair'],
        decision: null,
        evidenceNote: null,
        followUpOwner: null
      },
      {
        id: 'RA-ADR-CASCADE-002',
        path: 'docs/adr/0002-shared-cli-mcp-core.md',
        severity: 'medium',
        finding: 'missing_cascade',
        evidence: ['docs/adr/0002-shared-cli-mcp-core.md', 'Authorization: Bearer sk-local-secret'],
        suggestedAction: 'Add graph-visible downstream cascade evidence or explicitly accept risk.',
        allowedDecisions: ['approve', 'defer', 'accept-risk', 'repair'],
        decision: null,
        evidenceNote: null,
        followUpOwner: null
      }
    ]
  };
}
