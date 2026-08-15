import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  formatProjectIntelligenceMaintainerDecisionRecordMarkdown,
  parseProjectIntelligenceMaintainerDecisionArgs,
  runProjectIntelligenceMaintainerDecisionRecord
} from '../../packages/acceptance/src/run-project-intelligence-maintainer-decision.js';
import type {
  ProjectIntelligenceMaintainerDecisionRecord
} from '../../packages/acceptance/src/run-project-intelligence-maintainer-decision.js';

describe('project intelligence ADR cascade maintainer decision recording', () => {
  it('records explicit maintainer repair decisions without executing repairs or rewriting ADRs', async () => {
    const root = join(tmpdir(), `repoassure-project-maintainer-decision-${randomUUID()}`);
    const outputDir = join(root, 'artifacts', 'project-graph');
    const draftPath = join(outputDir, 'adr-cascade-remediation-recommendation-draft.json');

    await mkdir(outputDir, { recursive: true });
    await writeFile(draftPath, JSON.stringify(buildRecommendationDraftFixture(), null, 2));

    const result = await runProjectIntelligenceMaintainerDecisionRecord({
      recommendationDraftPath: draftPath,
      outputDir,
      decision: 'repair',
      evidenceNote: 'Owner authorized execution in Codex conversation on 2026-07-18.',
      maintainer: 'owner',
      generatedAt: '2026-07-18T09:15:00.000+08:00'
    });
    const markdown = await readFile(result.maintainerDecisionRecordPath, 'utf8');
    const json = JSON.parse(
      await readFile(result.maintainerDecisionRecordJsonPath, 'utf8')
    ) as ProjectIntelligenceMaintainerDecisionRecord;

    expect(result.maintainerDecisionRecordPath).toBe(
      join(outputDir, 'adr-cascade-maintainer-decision-record.md')
    );
    expect(result.maintainerDecisionRecordJsonPath).toBe(
      join(outputDir, 'adr-cascade-maintainer-decision-record.json')
    );
    expect(result.itemCount).toBe(2);
    expect(markdown).toContain('# Project Intelligence ADR Cascade Maintainer Decision Record');
    expect(markdown).toContain('Status: maintainer_decisions_recorded');
    expect(markdown).toContain('Generated from: adr-cascade-remediation-recommendation-draft.json');
    expect(markdown).toContain('This record captures maintainer decisions only.');
    expect(markdown).toContain('This record does not authorize automatic ADR/spec/docs edits or repair execution.');
    expect(markdown).toContain('- Final maintainer decisions written: 2');
    expect(markdown).toContain('- Repair decisions recorded: 2');
    expect(markdown).toContain('### RA-ADR-CASCADE-001: docs/adr/0001-local-first-mcp-cli.md');
    expect(markdown).toContain('- Recommendation: repair');
    expect(markdown).toContain('- Maintainer decision: repair');
    expect(markdown).toContain('- Evidence note: Owner authorized execution in Codex conversation on 2026-07-18.');
    expect(markdown).toContain('- Repair execution authorized: no');
    expect(markdown).not.toContain('sk-local-secret');
    expect(markdown).not.toContain('Authorization: Bearer');
    expect(json.schema).toBe('repoassure.project-intelligence.adr-cascade-maintainer-decision-record@1');
    expect(json.status).toBe('maintainer_decisions_recorded');
    expect(json.sourceRecommendationDraft).toBe(draftPath);
    expect(json.summary.items).toBe(2);
    expect(json.summary.finalDecisionsWritten).toBe(2);
    expect(json.summary.repairDecisionsRecorded).toBe(2);
    expect(json.boundary.finalMaintainerDecisionWritten).toBe(true);
    expect(json.boundary.automaticDocRewriteAuthorized).toBe(false);
    expect(json.boundary.automaticAdrRepairAuthorized).toBe(false);
    expect(json.boundary.repairExecutionAuthorized).toBe(false);
    expect(json.items[0]).toEqual(expect.objectContaining({
      id: 'RA-ADR-CASCADE-001',
      path: 'docs/adr/0001-local-first-mcp-cli.md',
      recommendedDecision: 'repair',
      maintainerDecision: 'repair',
      repairExecutionAuthorized: false
    }));
    expect(json.items[1]?.evidence).toEqual(['[REDACTED_AUTHORIZATION]']);
    expect(formatProjectIntelligenceMaintainerDecisionRecordMarkdown(json, {
      generatedAt: '2026-07-18T09:15:00.000+08:00',
      recommendationDraftPath: draftPath
    })).toContain('Maintainer decision: repair');
  });

  it('rejects missing or malformed drafts and unsupported apply or repair-execute options', async () => {
    const root = join(tmpdir(), `repoassure-project-maintainer-decision-invalid-${randomUUID()}`);
    const outputDir = join(root, 'artifacts', 'project-graph');
    const malformedDraftPath = join(outputDir, 'adr-cascade-remediation-recommendation-draft.json');

    await mkdir(outputDir, { recursive: true });
    await writeFile(malformedDraftPath, JSON.stringify({ schema: 'wrong' }, null, 2));

    await expect(runProjectIntelligenceMaintainerDecisionRecord({
      recommendationDraftPath: join(outputDir, 'missing.json'),
      outputDir,
      decision: 'repair',
      evidenceNote: 'Owner authorized execution in Codex conversation on 2026-07-18.',
      maintainer: 'owner'
    })).rejects.toThrow('missing ADR cascade recommendation draft');

    await expect(runProjectIntelligenceMaintainerDecisionRecord({
      recommendationDraftPath: malformedDraftPath,
      outputDir,
      decision: 'repair',
      evidenceNote: 'Owner authorized execution in Codex conversation on 2026-07-18.',
      maintainer: 'owner'
    })).rejects.toThrow('invalid ADR cascade recommendation draft');

    expect(parseProjectIntelligenceMaintainerDecisionArgs([
      '--draft',
      '/repo/artifacts/project-graph/adr-cascade-remediation-recommendation-draft.json',
      '--output',
      '/repo/artifacts/project-graph',
      '--decision',
      'repair',
      '--evidence-note',
      'Owner authorized execution in Codex conversation on 2026-07-18.',
      '--maintainer',
      'owner'
    ])).toEqual({
      recommendationDraftPath: '/repo/artifacts/project-graph/adr-cascade-remediation-recommendation-draft.json',
      outputDir: '/repo/artifacts/project-graph',
      decision: 'repair',
      evidenceNote: 'Owner authorized execution in Codex conversation on 2026-07-18.',
      maintainer: 'owner'
    });
    expect(() => parseProjectIntelligenceMaintainerDecisionArgs(['--apply'])).toThrow(
      'Unknown project intelligence maintainer decision option'
    );
    expect(() => parseProjectIntelligenceMaintainerDecisionArgs(['--repair-execute'])).toThrow(
      'Unknown project intelligence maintainer decision option'
    );
    expect(() => parseProjectIntelligenceMaintainerDecisionArgs(['--decision', 'invalid'])).toThrow(
      'Unsupported maintainer decision'
    );
  });
});

function buildRecommendationDraftFixture(): unknown {
  return {
    schema: 'repoassure.project-intelligence.adr-cascade-recommendation-draft@1',
    status: 'maintainer_review_required',
    generatedAt: '2026-07-17T15:45:00.000+08:00',
    sourceIntake: '/repo/artifacts/project-graph/adr-cascade-remediation-decision-intake.json',
    summary: {
      items: 2,
      recommendedRepair: 2,
      finalDecisionsWritten: 0
    },
    boundary: {
      finalMaintainerDecisionWritten: false,
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
        currentFinalDecision: null,
        recommendedDecision: 'repair',
        rationale: 'Missing cascade evidence should be repaired because downstream docs need graph-visible linkage.',
        risk: 'Medium documentation governance risk if left unresolved.',
        followUp: 'Keep the item pending if maintainer disagrees; no source document is changed by this draft.'
      },
      {
        id: 'RA-ADR-CASCADE-002',
        path: 'docs/adr/0002-shared-cli-mcp-core.md',
        severity: 'medium',
        finding: 'missing_cascade',
        evidence: ['Authorization: Bearer sk-local-secret'],
        currentFinalDecision: null,
        recommendedDecision: 'repair',
        rationale: 'Missing cascade evidence should be repaired because downstream docs need graph-visible linkage.',
        risk: 'Medium documentation governance risk if left unresolved.',
        followUp: 'Keep the item pending if maintainer disagrees; no source document is changed by this draft.'
      }
    ]
  };
}
