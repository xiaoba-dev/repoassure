import * as repairPlanner from '@hardening-mcp/repair-planner';
import * as compatibility from '@hardening-mcp/repair-planner/compatibility';
import * as generateRepairPlan from '@hardening-mcp/repair-planner/generate-repair-plan';
import * as repairPlan from '@hardening-mcp/repair-planner/repair-plan';

const repairPlannerPackageSubpathModules = [
  repairPlanner,
  compatibility,
  generateRepairPlan,
  repairPlan
] as const;

type RootRepairPlannerPackageExportEntry = repairPlanner.RepairPlannerPackageExportEntry;
type CompatibilityRepairPlannerPackageExportEntry = compatibility.RepairPlannerPackageExportEntry;
type RootRepairPlannerPackageDistOutputEntry = repairPlanner.RepairPlannerPackageDistOutputEntry;
type CompatibilityRepairPlannerPackageDistOutputEntry = compatibility.RepairPlannerPackageDistOutputEntry;
type RootRepairPlannerPackageSourceEntry = repairPlanner.RepairPlannerPackageSourceEntry;
type CompatibilityRepairPlannerPackageSourceEntry = compatibility.RepairPlannerPackageSourceEntry;
type RootLegacyRepairPlannerDistOutputEntry = repairPlanner.LegacyRepairPlannerDistOutputEntry;
type CompatibilityLegacyRepairPlannerDistOutputEntry = compatibility.LegacyRepairPlannerDistOutputEntry;
type RootLegacyRepairPlannerWrapperSourceEntry = repairPlanner.LegacyRepairPlannerWrapperSourceEntry;
type CompatibilityLegacyRepairPlannerWrapperSourceEntry = compatibility.LegacyRepairPlannerWrapperSourceEntry;

type PackageGenerateRepairPlanInput = generateRepairPlan.GenerateRepairPlanInput;
type RootRepairPlanGenerationResult = repairPlanner.RepairPlanGenerationResult;
type PackageRepairPlanGenerationResult = generateRepairPlan.RepairPlanGenerationResult;
type PackageRepairTaskPackage = repairPlan.RepairTaskPackage;
type RootRepairTaskPackage = repairPlanner.RepairTaskPackage;

const repairPlannerPackageExportEntryContracts: readonly [
  readonly RootRepairPlannerPackageExportEntry[],
  readonly CompatibilityRepairPlannerPackageExportEntry[]
] = [
  repairPlanner.repairPlannerPackageExportEntries,
  compatibility.repairPlannerPackageExportEntries
];

const repairPlannerPackageDistOutputEntryContracts: readonly [
  readonly RootRepairPlannerPackageDistOutputEntry[],
  readonly CompatibilityRepairPlannerPackageDistOutputEntry[]
] = [
  repairPlanner.repairPlannerPackageDistOutputEntries,
  compatibility.repairPlannerPackageDistOutputEntries
];

const repairPlannerPackageSourceEntryContracts: readonly [
  readonly RootRepairPlannerPackageSourceEntry[],
  readonly CompatibilityRepairPlannerPackageSourceEntry[]
] = [
  repairPlanner.repairPlannerPackageSourceEntries,
  compatibility.repairPlannerPackageSourceEntries
];

const legacyRepairPlannerDistOutputEntryContracts: readonly [
  readonly RootLegacyRepairPlannerDistOutputEntry[],
  readonly CompatibilityLegacyRepairPlannerDistOutputEntry[]
] = [
  repairPlanner.legacyRepairPlannerDistOutputEntries,
  compatibility.legacyRepairPlannerDistOutputEntries
];

const legacyRepairPlannerWrapperSourceEntryContracts: readonly [
  readonly RootLegacyRepairPlannerWrapperSourceEntry[],
  readonly CompatibilityLegacyRepairPlannerWrapperSourceEntry[]
] = [
  repairPlanner.legacyRepairPlannerWrapperSourceEntries,
  compatibility.legacyRepairPlannerWrapperSourceEntries
];

const repairPlannerInputSmoke: PackageGenerateRepairPlanInput = {
  repoRoot: '/tmp/repo',
  runDir: '/tmp/repo/artifacts/repoassure/run-fixed',
  sourceManifestPath: '/tmp/repo/artifacts/repoassure/run-fixed/manifest.json',
  runId: 'run-fixed'
};
const severityRankSmoke: number = repairPlan.severityRank('P1');
const intentSmoke: string = repairPlan.findingTypeRepairIntent('white_screen');

const repairPlanResultContracts: readonly [
  RootRepairPlanGenerationResult | undefined,
  PackageRepairPlanGenerationResult | undefined
] = [
  undefined,
  undefined
];

const repairTaskPackageContracts: readonly [
  RootRepairTaskPackage | undefined,
  PackageRepairTaskPackage | undefined
] = [
  undefined,
  undefined
];

export {
  intentSmoke,
  legacyRepairPlannerDistOutputEntryContracts,
  legacyRepairPlannerWrapperSourceEntryContracts,
  repairPlanResultContracts,
  repairPlannerInputSmoke,
  repairPlannerPackageDistOutputEntryContracts,
  repairPlannerPackageExportEntryContracts,
  repairPlannerPackageSourceEntryContracts,
  repairPlannerPackageSubpathModules,
  repairTaskPackageContracts,
  severityRankSmoke
};
