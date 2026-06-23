import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { importSecurityEvidence } from '../../packages/security-assurance/src/import-security-evidence.js';
import { generateRepairPlan } from '../../packages/repair-planner/src/generate-repair-plan.js';

describe('security assurance evidence import', () => {
  it('imports a local Codex Security scan directory into redacted run-scoped security artifacts', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'repoassure-security-repo-'));
    const runDir = join(repoRoot, '.hardening', 'runs', 'run-security-fixture');

    const result = await importSecurityEvidence({
      provider: 'codex-security',
      sourcePath: join(process.cwd(), 'fixtures/security/codex-security-basic'),
      repoRoot,
      runDir,
      runId: 'run-security-fixture'
    });
    const summary = JSON.parse(await readFile(result.securitySummaryPath, 'utf8')) as {
      providerCount: number;
      findingCount: number;
      highestSeverity: string;
      providers: string[];
    };
    const findings = JSON.parse(await readFile(result.securityFindingsPath, 'utf8')) as {
      findings: Array<{
        findingId: string;
        providerFindingId: string;
        provider: string;
        severity: string;
        affectedLocations: Array<{ path: string; startLine?: number; endLine?: number }>;
        evidence: string[];
        provenance: { provider: string; sourcePath: string; targetRevision?: string };
      }>;
    };
    const manifest = JSON.parse(await readFile(result.importManifestPath, 'utf8')) as {
      provider: string;
      sourceType: string;
      sourcePath: string;
    };
    const findingsText = await readFile(result.securityFindingsPath, 'utf8');

    expect(result.findingCount).toBe(1);
    expect(result.highestSeverity).toBe('P1');
    expect(summary).toMatchObject({
      providerCount: 1,
      findingCount: 1,
      highestSeverity: 'P1',
      providers: ['codex-security']
    });
    expect(manifest).toMatchObject({
      provider: 'codex-security',
      sourceType: 'scan-dir',
      sourcePath: join(process.cwd(), 'fixtures/security/codex-security-basic')
    });
    expect(findings.findings[0]).toMatchObject({
      findingId: 'security-codex-security-cs-001',
      providerFindingId: 'CS-001',
      provider: 'codex-security',
      severity: 'P1',
      affectedLocations: [{ path: 'src/auth.ts', startLine: 42, endLine: 45 }],
      provenance: {
        provider: 'codex-security',
        sourcePath: join(process.cwd(), 'fixtures/security/codex-security-basic'),
        targetRevision: 'abc1234'
      }
    });
    expect(findings.findings[0]?.evidence.join('\n')).toContain('Authorization: Bearer [REDACTED]');
    expect(findingsText).not.toContain('sk-live-secret');
  });

  it('feeds imported security findings into repair plan and executable task package outputs', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'repoassure-security-repair-repo-'));
    const runDir = join(repoRoot, '.hardening', 'runs', 'run-security-repair');

    await importSecurityEvidence({
      provider: 'codex-security',
      sourcePath: join(process.cwd(), 'fixtures/security/codex-security-basic'),
      repoRoot,
      runDir,
      runId: 'run-security-repair'
    });
    await writeFile(join(runDir, 'findings.json'), JSON.stringify({ findings: [] }));
    await writeFile(join(runDir, 'test-generation.json'), JSON.stringify({ createdFiles: [], testCommand: null, validationStatus: 'skipped', errors: [] }));
    await writeFile(join(runDir, 'boot-result.json'), JSON.stringify({ status: 'unknown', url: null, blockers: [], errors: [] }));

    const result = await generateRepairPlan({
      repoRoot,
      runDir,
      sourceManifestPath: join(runDir, 'manifest.json'),
      runId: 'run-security-repair'
    });
    const planText = await readFile(result.repairPlanPath, 'utf8');
    const plan = JSON.parse(planText) as {
      summary: { totalTasks: number; p1: number };
      tasks: Array<{
        taskId: string;
        title: string;
        evidence: Array<{ type: string; path: string; summary: string }>;
        targetAreas: Array<{ kind: string; value: string }>;
        verification: { commands: string[] };
      }>;
    };
    const taskPackage = JSON.parse(await readFile(result.repairTaskPackagePath, 'utf8')) as {
      tasks: Array<{ context: { evidence: Array<{ type: string }> }; handoffPrompt: string }>;
    };

    expect(result.taskCount).toBe(1);
    expect(result.highestSeverity).toBe('P1');
    expect(plan.summary).toMatchObject({ totalTasks: 1, p1: 1 });
    expect(plan.tasks[0]?.taskId).toBe('p1-security-jwt-accepted-without-audience-validation');
    expect(plan.tasks[0]?.title).toBe('JWT accepted without audience validation');
    expect(plan.tasks[0]?.evidence).toContainEqual(expect.objectContaining({
      type: 'security',
      path: join(runDir, 'security', 'security-findings.json')
    }));
    expect(plan.tasks[0]?.targetAreas).toContainEqual({ kind: 'file', value: 'src/auth.ts' });
    expect(plan.tasks[0]?.verification.commands).toEqual(['pnpm test auth']);
    expect(taskPackage.tasks[0]?.context.evidence).toContainEqual(expect.objectContaining({ type: 'security' }));
    expect(taskPackage.tasks[0]?.handoffPrompt).toContain('provider provenance');
    expect(planText).not.toContain('sk-live-secret');
  });
});
