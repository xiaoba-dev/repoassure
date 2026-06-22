import type { GoalAuditItem } from './goal-audit.js';
import type { GoalAuditTextSources } from './goal-audit-sources.js';
import { buildGoalAuditTextRequirement } from './goal-audit-requirements.js';

export function buildWorkflowAndArtifactGoalAuditItems(sources: Partial<GoalAuditTextSources>): GoalAuditItem[] {
  return [
    buildGoalAuditTextRequirement({
      category: '完整工作流',
      requirement: '可执行 analyze_repo -> boot_app -> explore_app -> generate_tests -> harden_report -> repair_plan',
      text: sources.runHardening ?? '',
      needles: [
        'runAnalyzeRepoTool',
        'runBootAppTool',
        'runExploreAppTool',
        'runGenerateTestsTool',
        'runHardenReportTool',
        'generateRepairPlan'
      ],
      evidence: ['src/tools/run-hardening-tool.ts orchestrates full hardening flow and emits repair-plan artifacts']
    }),
    buildGoalAuditTextRequirement({
      category: '本地 artifact',
      requirement: '本地 artifact 输出',
      text: [
        sources.runHardening,
        sources.generateTestsTool,
        sources.generateRepairPlanTool,
        sources.repairPlanGenerator,
        sources.hardenReport,
        sources.artifactTests,
        sources.repairPlanTests
      ].join('\n'),
      needles: [
        'boot-result.json',
        'findings.json',
        'test-generation.json',
        'hardening-report.md',
        'repair-plan.json',
        'repair-plan.md',
        'patch.diff',
        'artifactFiles',
        'trace.zip',
        'manifest.json',
        'latestPath',
        'workspaceOutputDir',
        'workspaceManifestPath'
      ],
      evidence: ['hardening flow writes boot, findings, test-generation, report, repair plan, patch diff, screenshot and trace artifacts, run-scoped manifest/latest bundle, and optional multi-repo workspace manifest; integration/E2E tests inspect those outputs']
    })
  ];
}
