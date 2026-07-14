export type FindingSeverity = 'P0' | 'P1' | 'P2' | 'P3';

export type FindingType =
  | 'white_screen'
  | 'broken_route'
  | 'dead_control'
  | 'form_failure'
  | 'console_error'
  | 'network_error';

export type RepairTaskStatus = 'todo';
export type RepairEvidenceType = 'finding' | 'test' | 'boot' | 'security';
export type RepairTargetAreaKind = 'route' | 'interaction' | 'file' | 'unknown';
export type RepairTaskPackageStatus = 'todo';

export interface RepairPlan {
  schemaVersion: 1;
  generatedAt: string;
  runId: string;
  repoRoot: string;
  sourceManifest: string;
  summary: RepairPlanSummary;
  tasks: RepairTask[];
}

export interface RepairPlanSummary {
  totalTasks: number;
  p0: number;
  p1: number;
  p2: number;
  p3: number;
}

export interface RepairTask {
  taskId: string;
  severity: FindingSeverity;
  status: RepairTaskStatus;
  trustBoundary?: string;
  title: string;
  rootCauseHypothesis: string;
  repairIntent: string;
  findingIds: string[];
  evidence: RepairEvidence[];
  targetAreas: RepairTargetArea[];
  suggestedFiles: RepairSuggestedFile[];
  verification: RepairVerification;
  agentPrompt: string;
}

export interface RepairEvidence {
  type: RepairEvidenceType;
  path: string;
  summary: string;
}

export interface RepairTargetArea {
  kind: RepairTargetAreaKind;
  value: string;
}

export interface RepairSuggestedFile {
  path: string;
  confidence: 'low' | 'medium' | 'high';
  reason: string;
}

export interface RepairVerification {
  commands: string[];
  generatedTests: string[];
  validationStatus: string | null;
}

export interface RepairPlanGenerationResult {
  repairPlanPath: string;
  repairPlanMarkdownPath: string;
  repairTaskPackagePath: string;
  repairTaskPackageMarkdownPath: string;
  taskCount: number;
  highestSeverity: FindingSeverity | null;
  recommendedNextTaskId: string | null;
}

export interface RepairTaskPackage {
  schemaVersion: 1;
  generatedAt: string;
  runId: string;
  repoRoot: string;
  sourceManifest: string;
  summary: RepairPlanSummary;
  tasks: ExecutableRepairTask[];
}

export interface ExecutableRepairTask {
  taskId: string;
  severity: FindingSeverity;
  status: RepairTaskPackageStatus;
  trustBoundary?: string;
  title: string;
  objective: string;
  context: RepairTaskContext;
  recommendedFix: RepairTaskRecommendedFix;
  verification: RepairTaskPackageVerification;
  actionability: RepairTaskActionability;
  handoffPrompt: string;
}

export interface RepairTaskContext {
  findingIds: string[];
  evidence: RepairEvidence[];
  targetAreas: RepairTargetArea[];
  rootCauseHypothesis: string;
}

export interface RepairTaskRecommendedFix {
  repairIntent: string;
  expectedOutcome: string;
  changeScope: {
    include: string[];
    exclude: string[];
  };
  implementationSteps: string[];
}

export interface RepairTaskPackageVerification {
  commands: string[];
  generatedTests: string[];
  acceptanceCriteria: string[];
}

export interface RepairTaskActionability {
  dependencies: string[];
  suggestedVerificationCommands: RepairTaskSuggestedVerificationCommand[];
  patchApplicabilityEvidence: RepairTaskPatchApplicabilityEvidence;
  aiIdeExecutionPrompt: string;
  manualReviewBoundary: string[];
  riskNotes: string[];
  noAutoApplyBoundary: string[];
}

export interface RepairTaskSuggestedVerificationCommand {
  command: string;
  purpose: string;
  required: boolean;
}

export interface RepairTaskPatchApplicabilityEvidence {
  sourceEvidence: string[];
  targetAreas: string[];
  requiresManualReview: boolean;
  notes: string[];
}

export function severityRank(severity: FindingSeverity): number {
  if (severity === 'P0') {
    return 0;
  }

  if (severity === 'P1') {
    return 1;
  }

  if (severity === 'P2') {
    return 2;
  }

  return 3;
}

export function findingTypeRepairIntent(type: FindingType): string {
  switch (type) {
    case 'white_screen':
      return '修复导致页面空白的渲染、路由、数据加载或运行时异常，并保留可见错误态。';
    case 'broken_route':
      return '修复断裂路由、跳转目标或路由 fallback，确保关键路径可访问。';
    case 'dead_control':
      return '修复无响应控件的事件处理、禁用状态、提交逻辑或可见反馈。';
    case 'form_failure':
      return '修复表单校验、提交、错误反馈或成功态，确保用户可以完成流程。';
    case 'console_error':
      return '修复触发 console error 的运行时异常、缺失依赖或错误数据形态。';
    case 'network_error':
      return '修复失败请求对应的 API、代理、mock fallback 或前端错误态处理。';
  }
}
