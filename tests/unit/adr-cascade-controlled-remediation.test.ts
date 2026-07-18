import { readFile } from 'node:fs/promises';

const adrCascadePaths = [
  'docs/adr/0001-local-first-mcp-cli.md',
  'docs/adr/0002-shared-cli-mcp-core.md',
  'docs/adr/0003-target-repo-hardening-artifacts.md',
  'docs/adr/0004-repair-plan-and-task-package.md',
  'docs/adr/0005-phased-monorepo-migration.md',
  'docs/adr/0006-package-build-strategy.md',
  'docs/adr/0008-repository-acceptance-scope.md',
  'docs/adr/0013-codex-security-and-security-assurance-lane.md',
  'docs/adr/0018-public-website-localization-strategy.md',
  'docs/adr/0020-public-website-private-preview-deployment.md',
  'docs/adr/0021-private-preview-hosting-fallback.md'
];

const sharedCascadeTargets = [
  'docs/PRD.md',
  'docs/SPEC.md',
  'docs/PLAN.md',
  'docs/testing/strategy/test-strategy-v0.1.md',
  'docs/acceptance/checklists/acceptance-checklist-v0.1.md',
  'docs/logs/decision-log.md',
  'docs/logs/dev-log.md',
  'docs/product/specs/project-intelligence-console-spec-v0.1.md',
  'docs/architecture/specs/project-intelligence-console-architecture-v0.1.md'
];

describe('ADR cascade controlled remediation execution', () => {
  it.each(adrCascadePaths)('adds authorized cascade evidence to %s', async (adrPath) => {
    const adr = await readFile(adrPath, 'utf8');
    const cascadeEvidence = adr.split('## Cascade Evidence')[1] ?? '';

    expect(cascadeEvidence).toContain('Project Intelligence ADR Cascade Controlled Remediation Execution v0.1');
    expect(cascadeEvidence).toContain('Repair execution: authorized by Project Intelligence ADR Cascade Controlled Remediation Execution v0.1.');

    for (const target of sharedCascadeTargets) {
      expect(cascadeEvidence).toContain(target);
    }

    expect(cascadeEvidence).not.toMatch(/pending authorization/i);
  });

  it('records the execution in canonical docs and autopilot state', async () => {
    const [
      operationDoc,
      productRequirements,
      productSpec,
      plan,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog,
      productIntelligenceSpec,
      projectIntelligenceArchitecture,
      goalRecord,
      goalIndex,
      progressSnapshot,
      progressMarkdown
    ] = await Promise.all([
      readFile('docs/operations/project-intelligence-adr-cascade-controlled-remediation-execution-v0.1.md', 'utf8'),
      readFile('docs/PRD.md', 'utf8'),
      readFile('docs/SPEC.md', 'utf8'),
      readFile('docs/PLAN.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8'),
      readFile('docs/product/specs/project-intelligence-console-spec-v0.1.md', 'utf8'),
      readFile('docs/architecture/specs/project-intelligence-console-architecture-v0.1.md', 'utf8'),
      readFile('.autopilot/goals/project-intelligence-adr-cascade-controlled-remediation-execution-v0.1.json', 'utf8'),
      readFile('.autopilot/goals/index.json', 'utf8'),
      readFile('.autopilot/progress/snapshot.json', 'utf8'),
      readFile('.autopilot/progress/PROGRESS_SNAPSHOT.md', 'utf8')
    ]);

    const goal = JSON.parse(goalRecord) as {
      status?: string;
      completed_at?: string;
      controlled_remediation_execution_summary?: {
        adr_items_repaired?: number;
        cascade_evidence_sections_added?: number;
        repair_execution_authorized_by_owner?: boolean;
      };
    };
    const index = JSON.parse(goalIndex) as {
      active_goal_id?: string;
      goals?: Array<{ id: string; status: string }>;
    };
    const progress = JSON.parse(progressSnapshot) as {
      active_goal?: { id?: string; status?: string };
      next_goal?: { id?: string; status?: string };
      requeued_goals?: Array<{ id: string; reason: string }>;
    };

    for (const doc of [
      operationDoc,
      productRequirements,
      productSpec,
      plan,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog,
      productIntelligenceSpec,
      projectIntelligenceArchitecture,
      progressMarkdown
    ]) {
      expect(doc).toContain('Project Intelligence ADR Cascade Controlled Remediation Execution v0.1');
      expect(doc).toContain('11');
    }

    expect(operationDoc).toContain('Status: completed');
    expect(operationDoc).toContain('Repair execution authorized: yes');
    expect(operationDoc).toContain('Rollback boundary');
    expect(goal.status).toBe('completed');
    expect(goal.completed_at).toBeTruthy();
    expect(goal.controlled_remediation_execution_summary?.adr_items_repaired).toBe(11);
    expect(goal.controlled_remediation_execution_summary?.cascade_evidence_sections_added).toBe(11);
    expect(goal.controlled_remediation_execution_summary?.repair_execution_authorized_by_owner).toBe(true);
    expect(index.goals?.find((item) => item.id === 'project-intelligence-adr-cascade-controlled-remediation-execution-v0.1')?.status).toBe('completed');
    expect(
      index.goals?.find((item) => item.id === 'project-intelligence-adr-cascade-remediation-closure-v0.1')
        ?.status
    ).toBe('ready_to_execute');
    expect(progressMarkdown).toContain('Project Intelligence ADR Cascade Remediation Closure v0.1');
    // The closure goal was re-queued behind the design sequence and has since become
    // active. Assert it is still tracked somewhere legitimate rather than pinning which
    // bucket it currently sits in.
    const closureId = 'project-intelligence-adr-cascade-remediation-closure-v0.1';
    const tracked =
      progress.active_goal?.id === closureId ||
      (progress.requeued_goals ?? []).some((item) => item.id === closureId);
    expect(tracked).toBe(true);
  });
});
