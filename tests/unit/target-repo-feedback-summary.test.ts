import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  buildTargetRepoFeedbackSummary,
  writeTargetRepoFeedbackSummaryArtifact
} from '../../packages/acceptance/src/target-repo-feedback-summary.js';
import type { UserAcceptanceCheck } from '../../packages/acceptance/src/user-acceptance.js';

describe('target repo feedback summary', () => {
  it('builds a local AI IDE handoff summary with relative artifact links and privacy boundaries', () => {
    const repoRoot = '/private/tmp/customer-app-API_KEY=sk-private-secret';
    const checks: UserAcceptanceCheck[] = [
      {
        name: 'hardening-report.md 已生成',
        required: true,
        status: 'passed',
        evidence: `${repoRoot}/hardening-report.md?token=report-secret`
      },
      {
        name: 'generated Playwright spec 执行验证',
        required: true,
        status: 'failed',
        evidence: 'failed with Access token=cf-secret and Cookie: sid=session-secret'
      },
      {
        name: 'repair-plan.json 已生成',
        required: true,
        status: 'passed',
        evidence: `${repoRoot}/.hardening/runs/run-2026-07-02T00-00-00-000Z/repair-plan.json`
      },
      {
        name: 'repair-task-package.json 已生成',
        required: true,
        status: 'passed',
        evidence: `${repoRoot}/.hardening/runs/run-2026-07-02T00-00-00-000Z/repair-task-package.json`
      }
    ];

    const summary = buildTargetRepoFeedbackSummary({
      generatedAt: '2026-07-02T00:00:00.000Z',
      mode: 'browser',
      repoRoot,
      runDir: `${repoRoot}/.hardening/runs/run-2026-07-02T00-00-00-000Z`,
      manifestPath: `${repoRoot}/.hardening/runs/run-2026-07-02T00-00-00-000Z/manifest.json`,
      reportPath: `${repoRoot}/hardening-report.md?token=report-secret`,
      findingsPath: `${repoRoot}/.hardening/runs/run-2026-07-02T00-00-00-000Z/findings.json`,
      repairPlanPath: `${repoRoot}/.hardening/runs/run-2026-07-02T00-00-00-000Z/repair-plan.json`,
      repairPlanMarkdownPath: `${repoRoot}/.hardening/runs/run-2026-07-02T00-00-00-000Z/repair-plan.md`,
      repairTaskPackagePath: `${repoRoot}/.hardening/runs/run-2026-07-02T00-00-00-000Z/repair-task-package.json`,
      repairTaskPackageMarkdownPath: `${repoRoot}/.hardening/runs/run-2026-07-02T00-00-00-000Z/repair-task-package.md`,
      patchDiffPath: `${repoRoot}/.hardening/runs/run-2026-07-02T00-00-00-000Z/patch.diff`,
      generatedTestFiles: [`${repoRoot}/tests/generated.spec.ts`],
      artifactFiles: [`${repoRoot}/.hardening/runs/run-2026-07-02T00-00-00-000Z/home.png`],
      checks
    });

    expect(summary.schema).toBe('repoassure.target-repo-feedback-summary.v1');
    expect(summary.runStatus).toBe('failed');
    expect(summary.targetRepoMetadataClass).toBe('private_repo_redacted');
    expect(summary.acceptanceResult.generatedTests).toBe('generated');
    expect(summary.acceptanceResult.generatedTestsValidated).toBe(false);
    expect(summary.acceptanceResult.reportGenerated).toBe(true);
    expect(summary.acceptanceResult.repairArtifactsProduced).toBe(true);
    expect(summary.blockerCategory).toBe('generated_test_validation');
    expect(summary.nextRecommendedProductAction).toBe('improve_generated_tests');
    expect(summary.artifactLinks.report).toBe('../../../hardening-report.md?token=[REDACTED]');
    expect(summary.artifactLinks.manifest).toBe('manifest.json');
    expect(summary.artifactLinks.screenshots).toEqual(['home.png']);
    expect(summary.redactionBoundary).toContain('No secrets or raw private repo content may be stored.');
    expect(summary.maintainerTriageGuidance).toContain('product bug');

    const serialized = JSON.stringify(summary);
    expect(serialized).not.toContain('sk-private-secret');
    expect(serialized).not.toContain('report-secret');
    expect(serialized).not.toContain('cf-secret');
    expect(serialized).not.toContain('session-secret');
    expect(serialized).not.toContain(repoRoot);
  });

  it('writes the summary artifact and links it from the run manifest', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'repoassure-feedback-summary-'));
    const runDir = join(repoRoot, '.hardening', 'runs', 'run-2026-07-02T00-00-00-000Z');
    const manifestPath = join(runDir, 'manifest.json');
    await mkdir(runDir, { recursive: true });
    await writeFile(manifestPath, `${JSON.stringify({ schemaVersion: 1, artifacts: {} }, null, 2)}\n`);

    const result = await writeTargetRepoFeedbackSummaryArtifact({
      generatedAt: '2026-07-02T00:00:00.000Z',
      mode: 'browser',
      repoRoot,
      runDir,
      manifestPath,
      reportPath: join(repoRoot, 'hardening-report.md'),
      findingsPath: join(runDir, 'findings.json'),
      repairPlanPath: join(runDir, 'repair-plan.json'),
      repairPlanMarkdownPath: join(runDir, 'repair-plan.md'),
      repairTaskPackagePath: join(runDir, 'repair-task-package.json'),
      repairTaskPackageMarkdownPath: join(runDir, 'repair-task-package.md'),
      patchDiffPath: join(runDir, 'patch.diff'),
      generatedTestFiles: [],
      artifactFiles: [],
      checks: [
        {
          name: 'hardening-report.md 已生成',
          required: true,
          status: 'passed',
          evidence: join(repoRoot, 'hardening-report.md')
        }
      ]
    });

    const summary = JSON.parse(await readFile(result.summaryPath, 'utf8')) as {
      artifactLinks: { manifest: string };
      targetRepoMetadataClass: string;
    };
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as {
      artifacts: { targetRepoFeedbackSummaryPath?: string };
    };

    expect(result.summaryPath).toBe(join(runDir, 'target-repo-feedback-summary.json'));
    expect(summary.artifactLinks.manifest).toBe('manifest.json');
    expect(summary.targetRepoMetadataClass).toBe('private_repo_redacted');
    expect(manifest.artifacts.targetRepoFeedbackSummaryPath).toBe(result.summaryPath);
  });

  it('classifies missing Python CLI tools as environment blockers with setup guidance', () => {
    const checks: UserAcceptanceCheck[] = [
      {
        name: 'Python CLI check 执行: agent-reach --help',
        required: true,
        status: 'failed',
        evidence: 'exit=1 stderr=spawn agent-reach ENOENT'
      },
      {
        name: 'repair-plan.json 已生成',
        required: true,
        status: 'passed',
        evidence: '/tmp/run/repair-plan.json'
      }
    ];

    const summary = buildTargetRepoFeedbackSummary({
      generatedAt: '2026-07-03T00:00:00.000Z',
      mode: 'cli',
      repoRoot: '/private/tmp/agent-reach',
      runDir: '/private/tmp/agent-reach/.hardening/runs/run-2026-07-03T00-00-00-000Z',
      manifestPath: '/private/tmp/agent-reach/.hardening/runs/run-2026-07-03T00-00-00-000Z/manifest.json',
      repairPlanPath: '/private/tmp/agent-reach/.hardening/runs/run-2026-07-03T00-00-00-000Z/repair-plan.json',
      generatedTestFiles: [],
      artifactFiles: [],
      checks
    });

    expect(summary.runStatus).toBe('blocked');
    expect(summary.blockerCategory).toBe('environment');
    expect(summary.nextRecommendedProductAction).toBe('document_target_stack');
    expect(summary.maintainerTriageGuidance).toContain('Python/CLI environment');
    expect(summary.maintainerTriageGuidance).toContain('.venv');
  });

  it('classifies missing browser app tooling as a Node environment blocker with stack-specific guidance', () => {
    const checks: UserAcceptanceCheck[] = [
      {
        name: 'browser artifacts 已生成',
        required: true,
        status: 'failed',
        evidence: 'browser requested but no browser artifacts were generated; boot-result.json status=failed; details=Process exited before becoming reachable: 1; $ vite; sh: vite: command not found'
      },
      {
        name: 'repair-plan.json 已生成',
        required: true,
        status: 'passed',
        evidence: '/tmp/run/repair-plan.json'
      }
    ];

    const summary = buildTargetRepoFeedbackSummary({
      generatedAt: '2026-07-05T00:00:00.000Z',
      mode: 'browser',
      repoRoot: '/private/tmp/openclaw/ui',
      runDir: '/private/tmp/openclaw/ui/.hardening/runs/run-2026-07-05T00-00-00-000Z',
      manifestPath: '/private/tmp/openclaw/ui/.hardening/runs/run-2026-07-05T00-00-00-000Z/manifest.json',
      repairPlanPath: '/private/tmp/openclaw/ui/.hardening/runs/run-2026-07-05T00-00-00-000Z/repair-plan.json',
      generatedTestFiles: ['tests/hardening/generated-findings.spec.ts'],
      artifactFiles: [],
      checks
    });

    expect(summary.runStatus).toBe('blocked');
    expect(summary.blockerCategory).toBe('environment');
    expect(summary.nextRecommendedProductAction).toBe('document_target_stack');
    expect(summary.maintainerTriageGuidance).toContain('Node/Web app environment');
    expect(summary.maintainerTriageGuidance).toContain('pnpm install');
    expect(summary.maintainerTriageGuidance).toContain('vite');
    expect(summary.maintainerTriageGuidance).not.toContain('Python/CLI');
    expect(summary.maintainerTriageGuidance).not.toContain('.venv');
  });
});
