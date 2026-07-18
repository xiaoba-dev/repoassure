import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  formatProjectIntelligenceControlledRemediationPlanMarkdown,
  parseProjectIntelligenceControlledRemediationPlanArgs,
  runProjectIntelligenceControlledRemediationPlan
} from '../../packages/acceptance/src/run-project-intelligence-controlled-remediation-plan.js';
import type {
  ProjectIntelligenceControlledRemediationPlan
} from '../../packages/acceptance/src/run-project-intelligence-controlled-remediation-plan.js';

describe('project intelligence ADR cascade controlled remediation plan', () => {
  it('generates a reviewable controlled remediation plan without executing repairs', async () => {
    const root = join(tmpdir(), `repoassure-controlled-remediation-${randomUUID()}`);
    const outputDir = join(root, 'artifacts', 'project-graph');
    const decisionRecordPath = join(outputDir, 'adr-cascade-maintainer-decision-record.json');

    await mkdir(outputDir, { recursive: true });
    await writeFile(decisionRecordPath, JSON.stringify(buildMaintainerDecisionRecordFixture(), null, 2));

    const result = await runProjectIntelligenceControlledRemediationPlan({
      decisionRecordPath,
      outputDir,
      generatedAt: '2026-07-18T20:00:00.000+08:00'
    });
    const markdown = await readFile(result.controlledRemediationPlanPath, 'utf8');
    const json = JSON.parse(
      await readFile(result.controlledRemediationPlanJsonPath, 'utf8')
    ) as ProjectIntelligenceControlledRemediationPlan;

    expect(result.controlledRemediationPlanPath).toBe(
      join(outputDir, 'adr-cascade-controlled-remediation-plan.md')
    );
    expect(result.controlledRemediationPlanJsonPath).toBe(
      join(outputDir, 'adr-cascade-controlled-remediation-plan.json')
    );
    expect(result.itemCount).toBe(2);
    expect(markdown).toContain('# Project Intelligence ADR Cascade Controlled Remediation Plan');
    expect(markdown).toContain('Status: controlled_remediation_plan_ready');
    expect(markdown).toContain('Generated from: adr-cascade-maintainer-decision-record.json');
    expect(markdown).toContain('This plan does not authorize automatic ADR/spec/docs edits or repair execution.');
    expect(markdown).toContain('- Plan items: 2');
    expect(markdown).toContain('- Repair decisions included: 2');
    expect(markdown).toContain('- Repair execution authorized: no');
    expect(markdown).toContain('## Proposed Execution Order');
    expect(markdown).toContain('1. RA-ADR-CASCADE-001 -> docs/adr/0001-local-first-mcp-cli.md');
    expect(markdown).toContain('### RA-ADR-CASCADE-001: docs/adr/0001-local-first-mcp-cli.md');
    expect(markdown).toContain('- Proposed action: Add explicit cascade links from this ADR to canonical product, spec, plan, testing, acceptance, and log surfaces.');
    expect(markdown).toContain('- Review boundary: Maintainer must approve concrete file edits before execution.');
    expect(markdown).toContain('- Verification checklist:');
    expect(markdown).toContain('  - Confirm ADR cascade references are accurate.');
    expect(markdown).toContain('  - Run project intelligence snapshot/freshness checks after the separate remediation execution goal.');
    expect(markdown).toContain('- Rollback note: Revert only the cascade-link edits for this ADR and rerun project intelligence checks.');
    expect(markdown).not.toContain('sk-local-secret');
    expect(markdown).not.toContain('Authorization: Bearer');
    expect(json.schema).toBe('repoassure.project-intelligence.adr-cascade-controlled-remediation-plan@1');
    expect(json.status).toBe('controlled_remediation_plan_ready');
    expect(json.sourceMaintainerDecisionRecord).toBe(decisionRecordPath);
    expect(json.summary.items).toBe(2);
    expect(json.summary.repairDecisionsIncluded).toBe(2);
    expect(json.boundary.automaticDocRewriteAuthorized).toBe(false);
    expect(json.boundary.automaticAdrRepairAuthorized).toBe(false);
    expect(json.boundary.repairExecutionAuthorized).toBe(false);
    expect(json.boundary.requiresSeparateExecutionAuthorization).toBe(true);
    expect(json.executionOrder).toEqual(['RA-ADR-CASCADE-001', 'RA-ADR-CASCADE-002']);
    expect(json.items[0]).toEqual(expect.objectContaining({
      id: 'RA-ADR-CASCADE-001',
      path: 'docs/adr/0001-local-first-mcp-cli.md',
      maintainerDecision: 'repair',
      proposedAction: 'Add explicit cascade links from this ADR to canonical product, spec, plan, testing, acceptance, and log surfaces.',
      reviewBoundary: 'Maintainer must approve concrete file edits before execution.',
      repairExecutionAuthorized: false
    }));
    expect(json.items[1]?.evidence).toEqual(['[REDACTED_AUTHORIZATION]']);
    expect(formatProjectIntelligenceControlledRemediationPlanMarkdown(json, {
      generatedAt: '2026-07-18T20:00:00.000+08:00',
      decisionRecordPath
    })).toContain('Controlled Remediation Boundary');
  });

  it('rejects missing or malformed decision records and execution options', async () => {
    const root = join(tmpdir(), `repoassure-controlled-remediation-invalid-${randomUUID()}`);
    const outputDir = join(root, 'artifacts', 'project-graph');
    const malformedRecordPath = join(outputDir, 'adr-cascade-maintainer-decision-record.json');

    await mkdir(outputDir, { recursive: true });
    await writeFile(malformedRecordPath, JSON.stringify({ schema: 'wrong' }, null, 2));

    await expect(runProjectIntelligenceControlledRemediationPlan({
      decisionRecordPath: join(outputDir, 'missing.json'),
      outputDir
    })).rejects.toThrow('missing ADR cascade maintainer decision record');

    await expect(runProjectIntelligenceControlledRemediationPlan({
      decisionRecordPath: malformedRecordPath,
      outputDir
    })).rejects.toThrow('invalid ADR cascade maintainer decision record');

    expect(parseProjectIntelligenceControlledRemediationPlanArgs([
      '--decision-record',
      '/repo/artifacts/project-graph/adr-cascade-maintainer-decision-record.json',
      '--output',
      '/repo/artifacts/project-graph'
    ])).toEqual({
      decisionRecordPath: '/repo/artifacts/project-graph/adr-cascade-maintainer-decision-record.json',
      outputDir: '/repo/artifacts/project-graph'
    });
    expect(() => parseProjectIntelligenceControlledRemediationPlanArgs(['--apply'])).toThrow(
      'Unknown project intelligence controlled remediation option'
    );
    expect(() => parseProjectIntelligenceControlledRemediationPlanArgs(['--repair-execute'])).toThrow(
      'Unknown project intelligence controlled remediation option'
    );
  });
});

function buildMaintainerDecisionRecordFixture(): unknown {
  return {
    schema: 'repoassure.project-intelligence.adr-cascade-maintainer-decision-record@1',
    status: 'maintainer_decisions_recorded',
    generatedAt: '2026-07-18T19:25:00.000+08:00',
    sourceRecommendationDraft: '/repo/artifacts/project-graph/adr-cascade-remediation-recommendation-draft.json',
    summary: {
      items: 2,
      finalDecisionsWritten: 2,
      repairDecisionsRecorded: 2
    },
    boundary: {
      finalMaintainerDecisionWritten: true,
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
        recommendedDecision: 'repair',
        maintainerDecision: 'repair',
        evidenceNote: 'Owner authorized execution in Codex conversation on 2026-07-18.',
        maintainer: 'owner',
        rationale: 'Missing cascade evidence should be repaired because downstream docs need graph-visible linkage.',
        risk: 'Medium documentation governance risk if left unresolved.',
        followUp: 'Keep the item pending if maintainer disagrees; no source document is changed by this draft.',
        repairExecutionAuthorized: false
      },
      {
        id: 'RA-ADR-CASCADE-002',
        path: 'docs/adr/0002-shared-cli-mcp-core.md',
        severity: 'medium',
        finding: 'missing_cascade',
        evidence: ['Authorization: Bearer sk-local-secret'],
        recommendedDecision: 'repair',
        maintainerDecision: 'repair',
        evidenceNote: 'Owner authorized execution in Codex conversation on 2026-07-18.',
        maintainer: 'owner',
        rationale: 'Missing cascade evidence should be repaired because downstream docs need graph-visible linkage.',
        risk: 'Medium documentation governance risk if left unresolved.',
        followUp: 'Keep the item pending if maintainer disagrees; no source document is changed by this draft.',
        repairExecutionAuthorized: false
      }
    ]
  };
}
