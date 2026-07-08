import { readdir, readFile, stat } from 'node:fs/promises';

import {
  acceptanceCompatibilityContract,
  acceptancePackageDistOutputEntries,
  legacyAcceptanceDistOutputEntries,
  acceptancePackageExportEntries,
  acceptancePackageSourceEntries,
  acceptancePackageSubpathSpecifiers,
  legacyAcceptanceCompatibilityModules,
  legacyAcceptanceWrapperSourceEntries
} from '../../packages/acceptance/src/index.js';
import {
  legacySharedCompatibilityModules,
  legacySharedDistOutputEntries,
  legacySharedWrapperSourceEntries,
  sharedCompatibilityContract,
  sharedPackageDistOutputEntries,
  sharedPackageExportEntries,
  sharedPackageSourceEntries,
  sharedPackageSubpathSpecifiers
} from '../../packages/shared/src/index.js';
import {
  legacyRepairPlannerCompatibilityModules,
  legacyRepairPlannerDistOutputEntries,
  legacyRepairPlannerWrapperSourceEntries,
  repairPlannerCompatibilityContract,
  repairPlannerPackageDistOutputEntries,
  repairPlannerPackageExportEntries,
  repairPlannerPackageSourceEntries,
  repairPlannerPackageSubpathSpecifiers
} from '../../packages/repair-planner/src/index.js';
import {
  browserExplorerCompatibilityContract,
  browserExplorerPackageDistOutputEntries,
  browserExplorerPackageExportEntries,
  browserExplorerPackageSourceEntries,
  browserExplorerPackageSubpathSpecifiers,
  legacyBrowserExplorerCompatibilityModules,
  legacyBrowserExplorerDistOutputEntries,
  legacyBrowserExplorerWrapperSourceEntries
} from '../../packages/browser-explorer/src/index.js';
import {
  securityAssuranceCompatibilityContract,
  securityAssurancePackageDistOutputEntries,
  securityAssurancePackageExportEntries,
  securityAssurancePackageSourceEntries,
  securityAssurancePackageSubpathSpecifiers
} from '../../packages/security-assurance/src/index.js';

describe('project structure', () => {
  it('routes benchmark artifacts through the artifacts directory while excluding legacy output', async () => {
    const [benchmarkRunner, gitignore, eslintConfig, vitestConfig] = await Promise.all([
      readFile('scripts/run-benchmark.mjs', 'utf8'),
      readFile('.gitignore', 'utf8'),
      readFile('eslint.config.js', 'utf8'),
      readFile('vitest.config.ts', 'utf8')
    ]);

    expect(benchmarkRunner).toContain("join(root, 'artifacts', 'benchmark-runs'");
    expect(benchmarkRunner).toContain("join(root, 'dist', 'adapters', 'cli', 'index.js')");
    expect(gitignore).toContain('artifacts/benchmark-runs/');
    expect(gitignore).toContain('packages/*/dist/');
    expect(gitignore).toContain('apps/*/dist/');
    expect(gitignore).toContain('benchmark-runs/');
    expect(eslintConfig).toContain('artifacts/benchmark-runs/**');
    expect(eslintConfig).toContain('packages/*/dist/**');
    expect(eslintConfig).toContain('apps/*/dist/**');
    expect(eslintConfig).toContain('benchmark-runs/**');
    expect(vitestConfig).toContain('artifacts/benchmark-runs/**');
    expect(vitestConfig).toContain('packages/*/dist/**');
    expect(vitestConfig).toContain('apps/*/dist/**');
    expect(vitestConfig).toContain('benchmark-runs/**');
  });

  it('keeps private GitHub readiness guardrails out of the initial commit surface', async () => {
    const [gitignore, readiness] = await Promise.all([
      readFile('.gitignore', 'utf8'),
      readFile('docs/product/strategy/private-repo-readiness-v0.1.md', 'utf8')
    ]);

    expect(gitignore).toContain('artifacts/acceptance/');
    expect(gitignore).toContain('artifacts/orphaned-runs/');
    expect(gitignore).toContain('.env');
    expect(gitignore).toContain('.env.*');
    expect(gitignore).toContain('!.env.example');
    expect(gitignore).toContain('*.pem');
    expect(gitignore).toContain('*.key');
    expect(readiness).toContain('Private Repo Readiness v0.1');
    expect(readiness).toContain('private GitHub repository');
    expect(readiness).toContain('Do not publish publicly');
    expect(readiness).toContain('artifacts/acceptance/');
    expect(readiness).toContain('artifacts/orphaned-runs/');
    expect(readiness).toContain('public-release-checklist-v0.1.md');
  });

  it('keeps source code grouped by adapters, domain, shared, internal, and tools', async () => {
    await expectPath('src/adapters/cli/run.ts');
    await expectPath('src/adapters/mcp/tool-registry.ts');
    await expectPath('src/domain/analyze/analyze-repo.ts');
    await expectPath('src/domain/boot/boot-app.ts');
    await expectPath('src/domain/explore/explore-app.ts');
    await expectPath('src/domain/repair-plan/generate-repair-plan.ts');
    await expectPath('src/domain/reports/harden-report.ts');
    await expectPath('src/domain/tests/generate-tests.ts');
    await expectPath('src/shared/privacy-redaction.ts');
    await expectPath('src/shared/shell-quote.ts');
    await expectPath('src/shared/shell-words.ts');
    await expectPath('src/internal/acceptance/run-goal-audit.ts');
    await expectPath('src/internal/benchmark/report.ts');
    await expectPath('src/tools/run-hardening-tool.ts');
    await expectPath('src/tools/generate-repair-plan-tool.ts');
  });

  it('declares the completed phase 0 scaffold and current phase 2 acceptance package pilot', async () => {
    const workspace = await readFile('pnpm-workspace.yaml', 'utf8');
    const monorepoSpec = await readFile('docs/architecture/specs/monorepo-structure-spec-v0.1.md', 'utf8');

    expect(workspace).toContain('- "apps/*"');
    expect(workspace).toContain('- "packages/*"');
    expect(monorepoSpec).toContain('Monorepo Structure Spec v0.1');
    expect(monorepoSpec).toContain('Phase 0: Scaffold and Contract');
    expect(monorepoSpec).toContain('Phase 0 status: completed');
    expect(monorepoSpec).toContain('Phase 2 acceptance package pilot, Phase 2c shared package extraction, Phase 2d repair-planner package extraction, Phase 2e browser-explorer package extraction, and Phase 2f security-assurance package extraction are part of the current acceptance criteria');
    expect(monorepoSpec).not.toContain('Status: In progress.');
    expect(monorepoSpec).not.toContain('Do not move runtime code yet');
    expect(monorepoSpec).not.toContain('Existing quality gates continue to pass after Phase 0.');

    await expectPath('apps/cli/README.md');
    await expectPath('apps/mcp-server/README.md');
    await expectPath('packages/core/README.md');
    await expectPath('packages/browser-explorer/README.md');
    await expectPath('packages/repair-planner/README.md');
    await expectPath('packages/acceptance/README.md');
    await expectPath('packages/shared/README.md');
    await expectPath('examples/README.md');
  });

  it('keeps phase 1 app shells separate from compatibility bin wrappers', async () => {
    const [packageJson, cliShell, mcpShell, monorepoSpec] = await Promise.all([
      readFile('package.json', 'utf8'),
      readFile('apps/cli/index.js', 'utf8'),
      readFile('apps/mcp-server/index.js', 'utf8'),
      readFile('docs/architecture/specs/monorepo-structure-spec-v0.1.md', 'utf8')
    ]);

    expect(packageJson).toContain('"hardening": "dist/adapters/cli/index.js"');
    expect(packageJson).toContain('"hardening-mcp": "dist/adapters/mcp/index.js"');
    expect(packageJson).toContain('"app:cli": "node apps/cli/index.js"');
    expect(packageJson).toContain('"app:mcp": "node apps/mcp-server/index.js"');
    expect(cliShell).toContain("import '../../dist/adapters/cli/index.js'");
    expect(mcpShell).toContain("import '../../dist/adapters/mcp/index.js'");
    expect(monorepoSpec).toContain('Phase 1 app shell status: implemented with compatibility wrappers');
  });

  it('documents the phase 2 package split preconditions before moving shared code', async () => {
    const [monorepoSpec, phasedMonorepoAdr, packageBuildAdr] = await Promise.all([
      readFile('docs/architecture/specs/monorepo-structure-spec-v0.1.md', 'utf8'),
      readFile('docs/adr/0005-phased-monorepo-migration.md', 'utf8'),
      readFile('docs/adr/0006-package-build-strategy.md', 'utf8')
    ]);

    expect(monorepoSpec).toContain('Phase 2 status: acceptance package pilot, Phase 2c shared package extraction, Phase 2d repair-planner package extraction, Phase 2e browser-explorer package extraction, and Phase 2f security-assurance package extraction implemented; broader package extraction remains deferred');
    expect(monorepoSpec).toContain('ADR-0006: Package Build Strategy');
    expect(monorepoSpec).toContain('Phase 2c shared package status: implemented with compatibility wrappers');
    expect(monorepoSpec).toContain('`packages/shared/src` owns shared utility implementation modules');
    expect(monorepoSpec).toContain('`src/shared/*` remains as compatibility wrappers');
    expect(monorepoSpec).toContain('`dist/shared/*` remains as compatibility output wrappers');
    expect(monorepoSpec).toContain('Extract `packages/acceptance` first as the Phase 2 pilot');
    expect(monorepoSpec).toContain('Phase 2 acceptance package pilot status: implemented as package-owned runner entrypoints with compatibility outputs');
    expect(phasedMonorepoAdr).toContain('Phase 2 acceptance package pilot is implemented');
    expect(phasedMonorepoAdr).toContain('`packages/acceptance/src` owns acceptance implementation modules');
    expect(phasedMonorepoAdr).toContain('ADR-0006 defines the package build and compatibility strategy');
    expect(phasedMonorepoAdr).toContain('Broader package extraction remains phased');
    expect(phasedMonorepoAdr).not.toContain('Phase 2: Defer physical package extraction until package build strategy and compatibility wrappers can preserve current outputs.');
    expect(phasedMonorepoAdr).not.toContain('For a while, app/package directories are shells or placeholders rather than full source owners.');
    expect(packageBuildAdr).toContain('Use a compatibility-first package build strategy');
    expect(packageBuildAdr).toContain('starting with `packages/acceptance`');
    expect(packageBuildAdr).toContain('Smoke checks for `acceptance`, `user:accept`, and `user:handoff` scripts');
    expect(packageBuildAdr).toContain('Phase 2 implementation modules now live under `packages/acceptance/src`');
    expect(packageBuildAdr).toContain('root scripts call package-owned acceptance runners');
    expect(packageBuildAdr).toContain('legacy `dist/internal/acceptance/*` remains a compatibility output, not the current package execution path');
    expect(packageBuildAdr).toContain('The acceptance package pilot is no longer deferred');
    expect(packageBuildAdr).toContain('Phase 2a is historical context; current acceptance execution targets package-owned runners');
    expect(packageBuildAdr).not.toContain('Phase 2 is intentionally deferred because the current build still treats `src/` as the canonical TypeScript root');
    expect(packageBuildAdr).not.toContain('those wrappers delegate to the existing `dist/internal/acceptance/*` compatibility entrypoints');
    expect(packageBuildAdr).not.toContain('without moving implementation files before compatibility gates are ready');
  });

  it('keeps architecture decision records discoverable', async () => {
    const [readme, architecture] = await Promise.all([
      readFile('README.md', 'utf8'),
      readFile('docs/architecture/overview.md', 'utf8')
    ]);

    expect(readme).toContain('docs/adr/README.md');
    expect(architecture).toContain('docs/adr/README.md');

    await expectPath('docs/adr/README.md');
    await expectPath('docs/adr/template.md');
    await expectPath('docs/adr/0001-local-first-mcp-cli.md');
    await expectPath('docs/adr/0002-shared-cli-mcp-core.md');
    await expectPath('docs/adr/0003-target-repo-hardening-artifacts.md');
    await expectPath('docs/adr/0004-repair-plan-and-task-package.md');
    await expectPath('docs/adr/0005-phased-monorepo-migration.md');
    await expectPath('docs/adr/0006-package-build-strategy.md');
    await expectPath('docs/adr/0007-documentation-taxonomy-and-naming.md');
    await expectPath('docs/adr/0008-repository-acceptance-scope.md');
    await expectPath('docs/adr/0009-commercialization-and-licensing-strategy.md');
    await expectPath('docs/adr/0010-repoassure-brand-positioning.md');
  });

  it('keeps early ADR decisions cascaded into current architecture and user-facing docs', async () => {
    const [readme, architecture] = await Promise.all([
      readFile('README.md', 'utf8'),
      readFile('docs/architecture/overview.md', 'utf8')
    ]);

    expect(architecture).toContain('ADR cascade map');
    expect(architecture).toContain('ADR-0001');
    expect(architecture).toContain('Local-first MCP and CLI');
    expect(architecture).toContain('ADR-0002');
    expect(architecture).toContain('Shared core for CLI and MCP');
    expect(architecture).toContain('ADR-0003');
    expect(architecture).toContain('Target repo hardening artifacts');
    expect(architecture).toContain('ADR-0004');
    expect(architecture).toContain('Repair plan and executable task package');
    expect(architecture).toContain('repair-task-package.json');
    expect(architecture).toContain('repair-handoff-package.json');
    expect(architecture).toContain('repair-execution-report.json');
    expect(architecture).toContain('patch-plan.json');
    expect(readme).toContain('ADR-0001');
    expect(readme).toContain('ADR-0002');
    expect(readme).toContain('ADR-0003');
    expect(readme).toContain('ADR-0004');
  });

  it('records the commercialization and licensing strategy decision', async () => {
    const [adrIndex, commercializationAdr, decisionLog, taxonomySpec, readme] = await Promise.all([
      readFile('docs/adr/README.md', 'utf8'),
      readFile('docs/adr/0009-commercialization-and-licensing-strategy.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/architecture/specs/docs-taxonomy-spec-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8')
    ]);

    expect(adrIndex).toContain('[0009](0009-commercialization-and-licensing-strategy.md)');
    expect(adrIndex).toContain('Commercialization and licensing strategy');
    expect(commercializationAdr).toContain('Position `hardening-mcp` as an AI code quality and delivery assurance layer');
    expect(commercializationAdr).toContain('Release the developer-facing core under Apache-2.0 before public distribution');
    expect(commercializationAdr).toContain('Do not use AGPL, BSL, FSL, SSPL, or Elastic License for the initial public release');
    expect(commercializationAdr).toContain('At decision time, the repository was private in `package.json` and had no repository-level `LICENSE` file');
    expect(decisionLog).toContain('商业化与 License 策略');
    expect(decisionLog).toContain('新增 `ADR-0009: Commercialization and Licensing Strategy`');
    expect(taxonomySpec).toContain('product/strategy/');
    expect(commercializationAdr).toContain('docs/product/strategy/commercialization-strategy-v0.1.md');
    expect(commercializationAdr).toContain('docs/product/strategy/public-release-checklist-v0.1.md');
    expect(commercializationAdr).toContain('docs/product/strategy/open-core-packaging-spec-v0.1.md');
    expect(readme).toContain('docs/product/strategy/commercialization-strategy-v0.1.md');

    await expectPath('docs/product/strategy/commercialization-strategy-v0.1.md');
    await expectPath('docs/product/strategy/public-release-checklist-v0.1.md');
    await expectPath('docs/product/strategy/open-core-packaging-spec-v0.1.md');
  });

  it('records the RepoAssure brand decision and competitive landscape', async () => {
    const [adrIndex, brandAdr, competitorResearch, readme, productSpec, commercialization, readiness, decisionLog] =
      await Promise.all([
        readFile('docs/adr/README.md', 'utf8'),
        readFile('docs/adr/0010-repoassure-brand-positioning.md', 'utf8'),
        readFile('docs/product/research/competitive-landscape-v0.1.md', 'utf8'),
        readFile('README.md', 'utf8'),
        readFile('docs/product/specs/mvp-spec-v0.2.md', 'utf8'),
        readFile('docs/product/strategy/commercialization-strategy-v0.1.md', 'utf8'),
        readFile('docs/product/strategy/private-repo-readiness-v0.1.md', 'utf8'),
        readFile('docs/logs/decision-log.md', 'utf8')
      ]);

    expect(adrIndex).toContain('[0010](0010-repoassure-brand-positioning.md)');
    expect(adrIndex).toContain('RepoAssure brand positioning');
    expect(brandAdr).toContain('Adopt RepoAssure as the product brand');
    expect(brandAdr).toContain('Keep `hardening-mcp` as the current internal package and CLI implementation name');
    expect(brandAdr).toContain('docs/product/research/competitive-landscape-v0.1.md');
    expect(competitorResearch).toContain('Competitive Landscape v0.1');
    expect(competitorResearch).toContain('Vibeproof');
    expect(competitorResearch).toContain('AgentProof');
    expect(competitorResearch).toContain('CodeGate');
    expect(competitorResearch).toContain('AgentGate');
    expect(competitorResearch).toContain('VibeCheck');
    expect(competitorResearch).toContain('RepoAssure');
    expect(readme).toContain('RepoAssure');
    expect(productSpec).toContain('RepoAssure');
    expect(commercialization).toContain('RepoAssure');
    expect(readiness).toContain('repoassure');
    expect(decisionLog).toContain('RepoAssure 品牌定位');
  });

  it('records the private GitHub engineering baseline and CI collaboration surface', async () => {
    const [
      packageJson,
      ciWorkflow,
      prTemplate,
      bugTemplate,
      featureTemplate,
      configTemplate,
      adrIndex,
      engineeringAdr,
      engineeringSpec,
      readme,
      architecture,
      readiness,
      decisionLog
    ] = await Promise.all([
      readFile('package.json', 'utf8'),
      readFile('.github/workflows/ci.yml', 'utf8'),
      readFile('.github/pull_request_template.md', 'utf8'),
      readFile('.github/ISSUE_TEMPLATE/bug_report.yml', 'utf8'),
      readFile('.github/ISSUE_TEMPLATE/feature_request.yml', 'utf8'),
      readFile('.github/ISSUE_TEMPLATE/config.yml', 'utf8'),
      readFile('docs/adr/README.md', 'utf8'),
      readFile('docs/adr/0011-private-github-engineering-baseline.md', 'utf8'),
      readFile('docs/architecture/specs/private-github-engineering-baseline-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/architecture/overview.md', 'utf8'),
      readFile('docs/product/strategy/private-repo-readiness-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8')
    ]);

    expect(packageJson).toContain('"repo:hygiene": "node scripts/check-repo-hygiene.mjs"');
    expect(packageJson).toContain('"packageManager": "pnpm@');
    expect(packageJson).toContain('"test:unit": "pnpm build && vitest run tests/unit"');
    expect(ciWorkflow).toContain('RepoAssure CI');
    expect(ciWorkflow).toContain('pnpm install --frozen-lockfile');
    expect(ciWorkflow).toContain('pnpm test:unit');
    expect(ciWorkflow).toContain('pnpm typecheck');
    expect(ciWorkflow).toContain('pnpm lint');
    expect(ciWorkflow).toContain('pnpm build');
    expect(ciWorkflow).toContain('pnpm goal:audit');
    expect(ciWorkflow).toContain('pnpm repo:hygiene');
    expect(ciWorkflow).toContain('actions/checkout@v7');
    expect(ciWorkflow).toContain('pnpm/action-setup@v6');
    expect(ciWorkflow).toContain('actions/setup-node@v6');
    expect(ciWorkflow).not.toContain('actions/checkout@v4');
    expect(ciWorkflow).not.toContain('pnpm/action-setup@v4');
    expect(ciWorkflow).not.toContain('actions/setup-node@v4');
    expect(prTemplate).toContain('Repository Hygiene');
    expect(prTemplate).toContain('Generated artifacts, build outputs, local hardening runs, env files, and secrets are not committed');
    expect(bugTemplate).toContain('RepoAssure bug report');
    expect(featureTemplate).toContain('RepoAssure feature request');
    expect(configTemplate).toContain('blank_issues_enabled: false');
    expect(adrIndex).toContain('[0011](0011-private-github-engineering-baseline.md)');
    expect(engineeringAdr).toContain('Private GitHub engineering baseline');
    expect(engineeringAdr).toContain('GitHub Actions CI must run the repository hygiene check');
    expect(engineeringSpec).toContain('Private GitHub Engineering Baseline v0.1');
    expect(engineeringSpec).toContain('Manual user acceptance remains outside CI');
    expect(readme).toContain('pnpm repo:hygiene');
    expect(readme).toContain('ADR-0011');
    expect(architecture).toContain('ADR-0011');
    expect(readiness).toContain('pnpm repo:hygiene');
    expect(decisionLog).toContain('私有 GitHub 工程基线');
  });

  it('records branch protection and public release boundary governance', async () => {
    const [
      packageJsonText,
      adrIndex,
      branchProtectionAdr,
      publicReleaseReadinessAdr,
      operationsGuide,
      taxonomySpec,
      publicReleaseChecklist,
      dependencyLicenseAudit,
      releaseNotesDraft,
      privateReadiness,
      contributing,
      securityPolicy,
      licenseText,
      prTemplate,
      blockersLog,
      decisionLog
    ] = await Promise.all([
      readFile('package.json', 'utf8'),
      readFile('docs/adr/README.md', 'utf8'),
      readFile('docs/adr/0012-branch-protection-and-release-boundary.md', 'utf8'),
      readFile('docs/adr/0015-public-release-readiness-boundary.md', 'utf8'),
      readFile('docs/operations/branch-protection-release-boundary-v0.1.md', 'utf8'),
      readFile('docs/architecture/specs/docs-taxonomy-spec-v0.1.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/product/strategy/dependency-license-audit-v0.1.md', 'utf8'),
      readFile('docs/product/strategy/public-release-notes-v0.1.md', 'utf8'),
      readFile('docs/product/strategy/private-repo-readiness-v0.1.md', 'utf8'),
      readFile('CONTRIBUTING.md', 'utf8'),
      readFile('SECURITY.md', 'utf8'),
      readFile('LICENSE', 'utf8'),
      readFile('.github/pull_request_template.md', 'utf8'),
      readFile('docs/logs/blockers.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8')
    ]);
    const packageJson = JSON.parse(packageJsonText) as { private?: boolean; license?: string };

    expect(packageJson.private).toBe(true);
    expect(packageJson.license).toBe('Apache-2.0');
    expect(licenseText).toContain('Apache License');
    expect(licenseText).toContain('Version 2.0');
    expect(adrIndex).toContain('[0015](0015-public-release-readiness-boundary.md)');
    expect(adrIndex).toContain('[0012](0012-branch-protection-and-release-boundary.md)');
    expect(branchProtectionAdr).toContain('Branch protection and release boundary');
    expect(branchProtectionAdr).toContain('Do not make the repository public to unlock branch protection');
    expect(publicReleaseReadinessAdr).toContain('Public release readiness boundary');
    expect(publicReleaseReadinessAdr).toContain('Adding `LICENSE` is readiness preparation, not publication authorization');
    expect(operationsGuide).toContain('Branch Protection and Release Boundary v0.1');
    expect(operationsGuide).toContain('RepoAssure CI');
    expect(operationsGuide).toContain('Quality Gates');
    expect(operationsGuide).toContain('required status check');
    expect(operationsGuide).toContain('GitHub API returned HTTP 403');
    expect(operationsGuide).toContain('Upgrade to GitHub Pro or make this repository public to enable this feature');
    expect(taxonomySpec).toContain('operations/');
    expect(publicReleaseChecklist).toContain('Branch protection or an equivalent repository ruleset is enabled for `main`');
    expect(publicReleaseChecklist).toContain('Add repository-level Apache-2.0 `LICENSE` text as readiness material');
    expect(dependencyLicenseAudit).toContain('No known incompatible dependency licenses');
    expect(releaseNotesDraft).toContain('Public Release Notes v0.1');
    expect(contributing).toContain('Developer Certificate of Origin');
    expect(contributing).toContain('No CLA is required');
    expect(securityPolicy).toContain('Report a Vulnerability');
    expect(privateReadiness).toContain('branch protection and release boundary');
    expect(prTemplate).toContain('Release Boundary');
    expect(prTemplate).toContain('This PR does not publish packages, remove package.json private true, make the repo public, or treat LICENSE presence as publication authorization');
    expect(blockersLog).toContain('GitHub branch protection and repository rulesets are unavailable for the private repo');
    expect(blockersLog).toContain('HTTP 403');
    expect(decisionLog).toContain('分支保护与发布边界');
    expect(decisionLog).toContain('Public release readiness boundary');
  });

  it('records release candidate handoff boundaries before publishing or pushing', async () => {
    const [handoff, readme, publicReleaseChecklist, devLog] = await Promise.all([
      readFile('docs/operations/release-candidate-handoff-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(handoff).toContain('Release Candidate Handoff v0.1');
    expect(handoff).toContain('Review branch: `codex/release-candidate-packaging-v0.1`');
    expect(handoff).toContain('Commit Packaging Plan');
    expect(handoff).toContain('Final Verification Gates');
    expect(handoff).toContain('Manual Gates Still Blocking Public Release');
    expect(handoff).toContain('Do not publish npm packages');
    expect(handoff).toContain('Do not make the repository public');
    expect(handoff).toContain('Do not create a GitHub release');
    expect(handoff).toContain('pnpm acceptance -- --full --browser');
    expect(handoff).toContain('pnpm release:check');
    expect(handoff).toContain('public release ready: no');
    expect(readme).toContain('docs/operations/release-candidate-handoff-v0.1.md');
    expect(publicReleaseChecklist).toContain('release-candidate-handoff-v0.1.md');
    expect(devLog).toContain('Release Candidate Packaging v0.1');

    await expectPath('docs/operations/release-candidate-handoff-v0.1.md');
  });

  it('records public release readiness v0.2 without authorizing publication', async () => {
    const [readiness, readme, releaseChecklist, testingStrategy, acceptanceChecklist, devLog] = await Promise.all([
      readFile('docs/operations/public-release-readiness-v0.2.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(readiness).toContain('Public Release Readiness v0.2');
    expect(readiness).toContain('Status: automated_prerequisites_ready_manual_gates_pending');
    expect(readiness).toContain('public release ready: no');
    expect(readiness).toContain('pnpm release:check');
    expect(readiness).toContain('pnpm repo:hygiene');
    expect(readiness).toContain('pnpm acceptance -- --full --browser');
    expect(readiness).toContain('package.json keeps `"private": true`');
    expect(readiness).toContain('Manual authorization gates');
    expect(readiness).toContain('Branch protection or equivalent repository ruleset');
    expect(readiness).toContain('Legal review');
    expect(readiness).toContain('Trademark/name review');
    expect(readiness).toContain('Final maintainer publication authorization');
    expect(readiness).toContain('No repository visibility change was authorized');
    expect(readiness).toContain('No npm publication was authorized');
    expect(readiness).toContain('No GitHub release was authorized');
    expect(readiness).toContain('No public launch or production marketing announcement was authorized');
    expect(readiness).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was authorized');
    expect(readiness).toContain('Private Preview Feedback Triage Execution v0.1 remains blocked until real reviewer feedback exists');
    expect(readme).toContain('docs/operations/public-release-readiness-v0.2.md');
    expect(releaseChecklist).toContain('Public Release Readiness v0.2');
    expect(testingStrategy).toContain('Public Release Readiness v0.2');
    expect(acceptanceChecklist).toContain('Public Release Readiness v0.2');
    expect(devLog).toContain('Public Release Readiness v0.2');

    await expectPath('docs/operations/public-release-readiness-v0.2.md');
  });

  it('records public release candidate final review without authorizing publication', async () => {
    const [review, readme, releaseChecklist, testingStrategy, acceptanceChecklist, devLog] = await Promise.all([
      readFile('docs/operations/public-release-candidate-final-review-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(review).toContain('Public Release Candidate Final Review v0.1');
    expect(review).toContain('Status: no_go_until_manual_gates_close');
    expect(review).toContain('Final recommendation: no-go for public release');
    expect(review).toContain('public release ready: no');
    expect(review).toContain('All automated local gates passed');
    expect(review).toContain('pnpm acceptance -- --full --browser');
    expect(review).toContain('Real Chromium trace E2E');
    expect(review).toContain('Branch protection or equivalent repository ruleset');
    expect(review).toContain('Legal review');
    expect(review).toContain('Trademark/name review');
    expect(review).toContain('Final maintainer publication authorization');
    expect(review).toContain('Private Preview Feedback Triage Execution v0.1 remains blocked until real reviewer feedback exists');
    expect(review).toContain('No repository visibility change was authorized');
    expect(review).toContain('No npm publication was authorized');
    expect(review).toContain('No GitHub release was authorized');
    expect(review).toContain('No public launch or production marketing announcement was authorized');
    expect(review).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was authorized');
    expect(readme).toContain('docs/operations/public-release-candidate-final-review-v0.1.md');
    expect(releaseChecklist).toContain('Public Release Candidate Final Review v0.1');
    expect(testingStrategy).toContain('Public Release Candidate Final Review v0.1');
    expect(acceptanceChecklist).toContain('Public Release Candidate Final Review v0.1');
    expect(devLog).toContain('Public Release Candidate Final Review v0.1');

    await expectPath('docs/operations/public-release-candidate-final-review-v0.1.md');
  });

  it('records public release manual gate input collection without closing gates', async () => {
    const [gateInputs, readme, releaseChecklist, testingStrategy, acceptanceChecklist, devLog] = await Promise.all([
      readFile('docs/operations/public-release-manual-gate-input-collection-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(gateInputs).toContain('Public Release Manual Gate Input Collection v0.1');
    expect(gateInputs).toContain('Status: collecting_manual_gate_inputs');
    expect(gateInputs).toContain('public release remains no-go');
    expect(gateInputs).toContain('Do not record a gate as passed without explicit maintainer evidence');
    expect(gateInputs).toContain('Legal review');
    expect(gateInputs).toContain('Trademark/name review');
    expect(gateInputs).toContain('Branch protection or equivalent repository ruleset');
    expect(gateInputs).toContain('Final maintainer publication authorization');
    expect(gateInputs).toContain('Private preview reviewer feedback decision');
    expect(gateInputs).toContain('Dependency/license risk confirmation');
    expect(gateInputs).toContain('Secret/customer data exposure confirmation');
    expect(gateInputs).toContain('No repository visibility change was authorized');
    expect(gateInputs).toContain('No npm publication was authorized');
    expect(gateInputs).toContain('No GitHub release was authorized');
    expect(gateInputs).toContain('No public launch or production marketing announcement was authorized');
    expect(gateInputs).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was authorized');
    expect(readme).toContain('Public Release Manual Gate Input Collection v0.1');
    expect(releaseChecklist).toContain('Public Release Manual Gate Input Collection v0.1');
    expect(testingStrategy).toContain('Public Release Manual Gate Input Collection v0.1');
    expect(acceptanceChecklist).toContain('Public Release Manual Gate Input Collection v0.1');
    expect(devLog).toContain('Public Release Manual Gate Input Collection v0.1');

    await expectPath('docs/operations/public-release-manual-gate-input-collection-v0.1.md');
  });

  it('records public release manual gate closure without authorizing release when evidence is missing', async () => {
    const [closure, readme, releaseChecklist, testingStrategy, acceptanceChecklist, devLog] = await Promise.all([
      readFile('docs/operations/public-release-manual-gate-closure-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(closure).toContain('Public Release Manual Gate Closure v0.1');
    expect(closure).toContain('Status: not_closed_missing_manual_evidence');
    expect(closure).toContain('public release remains no-go');
    expect(closure).toContain('No manual gate is marked closed without explicit maintainer evidence');
    expect(closure).toContain('Legal review | not_closed');
    expect(closure).toContain('Trademark/name review | not_closed');
    expect(closure).toContain('Branch protection or equivalent repository ruleset | not_closed');
    expect(closure).toContain('Final maintainer publication authorization | not_closed');
    expect(closure).toContain('Private preview reviewer feedback decision | not_closed');
    expect(closure).toContain('Dependency/license risk confirmation | partially_supported_by_readiness_material');
    expect(closure).toContain('Secret/customer data exposure confirmation | partially_supported_by_automated_scan');
    expect(closure).toContain('Release execution is blocked');
    expect(closure).toContain('No repository visibility change was authorized');
    expect(closure).toContain('No npm publication was authorized');
    expect(closure).toContain('No GitHub release was authorized');
    expect(closure).toContain('No public launch or production marketing announcement was authorized');
    expect(closure).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was authorized');
    expect(readme).toContain('Public Release Manual Gate Closure v0.1');
    expect(releaseChecklist).toContain('Public Release Manual Gate Closure v0.1');
    expect(testingStrategy).toContain('Public Release Manual Gate Closure v0.1');
    expect(acceptanceChecklist).toContain('Public Release Manual Gate Closure v0.1');
    expect(devLog).toContain('Public Release Manual Gate Closure v0.1');

    await expectPath('docs/operations/public-release-manual-gate-closure-v0.1.md');
  });

  it('records public release manual gate closure v0.2 with fresh evidence while keeping release blocked', async () => {
    const [closure, readme, releaseChecklist, testingStrategy, acceptanceChecklist, devLog] = await Promise.all([
      readFile('docs/operations/public-release-manual-gate-closure-v0.2.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(closure).toContain('Public Release Manual Gate Closure v0.2');
    expect(closure).toContain('Status: not_closed_after_fresh_evidence_review');
    expect(closure).toContain('public release remains no-go');
    expect(closure).toContain('Execution authorization is not final publication authorization');
    expect(closure).toContain('Repository visibility: `PRIVATE`');
    expect(closure).toContain('Latest CI run: `28486178718` / `RepoAssure CI` / `success`');
    expect(closure).toContain('Branch protection API: `HTTP 403`');
    expect(closure).toContain('Repository rulesets API: `HTTP 403`');
    expect(closure).toContain('Legal review | not_closed');
    expect(closure).toContain('Trademark/name review | not_closed');
    expect(closure).toContain('Branch protection or equivalent repository ruleset | not_closed');
    expect(closure).toContain('Final maintainer publication authorization | not_closed');
    expect(closure).toContain('Private preview reviewer feedback decision | not_closed');
    expect(closure).toContain('Dependency/license risk confirmation | partially_supported_by_readiness_material');
    expect(closure).toContain('Secret/customer data exposure confirmation | partially_supported_by_automated_scan');
    expect(closure).toContain('Release execution is blocked');
    expect(closure).toContain('No repository visibility change was authorized');
    expect(closure).toContain('No npm publication was authorized');
    expect(closure).toContain('No GitHub release was authorized');
    expect(closure).toContain('No public launch or production marketing announcement was authorized');
    expect(closure).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was authorized');
    expect(readme).toContain('Public Release Manual Gate Closure v0.2');
    expect(releaseChecklist).toContain('Public Release Manual Gate Closure v0.2');
    expect(testingStrategy).toContain('Public Release Manual Gate Closure v0.2');
    expect(acceptanceChecklist).toContain('Public Release Manual Gate Closure v0.2');
    expect(devLog).toContain('Public Release Manual Gate Closure v0.2');

    await expectPath('docs/operations/public-release-manual-gate-closure-v0.2.md');
  });

  it('records public release manual gate evidence intake without inventing missing evidence', async () => {
    const [intake, readme, releaseChecklist, testingStrategy, acceptanceChecklist, devLog] = await Promise.all([
      readFile('docs/operations/public-release-manual-gate-evidence-intake-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(intake).toContain('Public Release Manual Gate Evidence Intake v0.1');
    expect(intake).toContain('Status: evidence_intake_incomplete');
    expect(intake).toContain('public release remains no-go');
    expect(intake).toContain('Do not convert missing manual evidence into a passed gate');
    expect(intake).toContain('Legal review | missing');
    expect(intake).toContain('Trademark/name review | missing');
    expect(intake).toContain('Branch protection or equivalent repository ruleset | missing');
    expect(intake).toContain('Final maintainer publication authorization | missing');
    expect(intake).toContain('Private preview reviewer feedback decision | missing');
    expect(intake).toContain('Dependency/license risk confirmation | automated_readiness_evidence_present');
    expect(intake).toContain('Secret/customer data exposure confirmation | scoped_automated_scan_present');
    expect(intake).toContain('pnpm release:check');
    expect(intake).toContain('pnpm repo:hygiene');
    expect(intake).toContain('CI run 28350237293');
    expect(intake).toContain('No repository visibility change was authorized');
    expect(intake).toContain('No npm publication was authorized');
    expect(intake).toContain('No GitHub release was authorized');
    expect(intake).toContain('No public launch or production marketing announcement was authorized');
    expect(intake).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was authorized');
    expect(readme).toContain('Public Release Manual Gate Evidence Intake v0.1');
    expect(releaseChecklist).toContain('Public Release Manual Gate Evidence Intake v0.1');
    expect(testingStrategy).toContain('Public Release Manual Gate Evidence Intake v0.1');
    expect(acceptanceChecklist).toContain('Public Release Manual Gate Evidence Intake v0.1');
    expect(devLog).toContain('Public Release Manual Gate Evidence Intake v0.1');

    await expectPath('docs/operations/public-release-manual-gate-evidence-intake-v0.1.md');
  });

  it('records public release manual gate evidence completion as incomplete without manual evidence', async () => {
    const [completion, readme, releaseChecklist, testingStrategy, acceptanceChecklist, devLog] = await Promise.all([
      readFile('docs/operations/public-release-manual-gate-evidence-completion-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(completion).toContain('Public Release Manual Gate Evidence Completion v0.1');
    expect(completion).toContain('Status: incomplete_missing_manual_evidence');
    expect(completion).toContain('completion remains incomplete');
    expect(completion).toContain('public release remains no-go');
    expect(completion).toContain('Goal execution authorization is not publication authorization');
    expect(completion).toContain('Legal review | incomplete');
    expect(completion).toContain('Trademark/name review | incomplete');
    expect(completion).toContain('Branch protection or equivalent repository ruleset | incomplete');
    expect(completion).toContain('Final maintainer publication authorization | incomplete');
    expect(completion).toContain('Private preview reviewer feedback decision | incomplete');
    expect(completion).toContain('Dependency/license risk confirmation | incomplete');
    expect(completion).toContain('Secret/customer data exposure confirmation | incomplete');
    expect(completion).toContain('Maintainer Evidence Request Checklist');
    expect(completion).toContain('No gate was completed, closed, or passed');
    expect(completion).toContain('No repository visibility change was authorized');
    expect(completion).toContain('No npm publication was authorized');
    expect(completion).toContain('No GitHub release was authorized');
    expect(completion).toContain('No public launch or production marketing announcement was authorized');
    expect(completion).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was authorized');
    expect(readme).toContain('Public Release Manual Gate Evidence Completion v0.1');
    expect(releaseChecklist).toContain('Public Release Manual Gate Evidence Completion v0.1');
    expect(testingStrategy).toContain('Public Release Manual Gate Evidence Completion v0.1');
    expect(acceptanceChecklist).toContain('Public Release Manual Gate Evidence Completion v0.1');
    expect(devLog).toContain('Public Release Manual Gate Evidence Completion v0.1');

    await expectPath('docs/operations/public-release-manual-gate-evidence-completion-v0.1.md');
  });

  it('records public release manual evidence decisions as pending without release authorization', async () => {
    const [decision, readme, releaseChecklist, testingStrategy, acceptanceChecklist, devLog] = await Promise.all([
      readFile('docs/operations/public-release-manual-evidence-decision-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(decision).toContain('Public Release Manual Evidence Decision v0.1');
    expect(decision).toContain('Status: pending_manual_decisions');
    expect(decision).toContain('public release remains no-go');
    expect(decision).toContain('Execution authorization is not a release decision');
    expect(decision).toContain('Allowed decision values: approve / reject / defer / accept risk');
    expect(decision).toContain('Legal review | pending_decision');
    expect(decision).toContain('Trademark/name review | pending_decision');
    expect(decision).toContain('Branch protection or equivalent repository ruleset | pending_decision');
    expect(decision).toContain('Final maintainer publication authorization | pending_decision');
    expect(decision).toContain('Private preview reviewer feedback decision | pending_decision');
    expect(decision).toContain('Dependency/license risk confirmation | pending_decision');
    expect(decision).toContain('Secret/customer data exposure confirmation | pending_decision');
    expect(decision).toContain('No gate decision was approved in this increment');
    expect(decision).toContain('Public Source Release Execution v0.1 remains blocked');
    expect(decision).toContain('No repository visibility change was authorized');
    expect(decision).toContain('No npm publication was authorized');
    expect(decision).toContain('No GitHub release was authorized');
    expect(decision).toContain('No public launch or production marketing announcement was authorized');
    expect(decision).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was authorized');
    expect(readme).toContain('Public Release Manual Evidence Decision v0.1');
    expect(releaseChecklist).toContain('Public Release Manual Evidence Decision v0.1');
    expect(testingStrategy).toContain('Public Release Manual Evidence Decision v0.1');
    expect(acceptanceChecklist).toContain('Public Release Manual Evidence Decision v0.1');
    expect(devLog).toContain('Public Release Manual Evidence Decision v0.1');

    await expectPath('docs/operations/public-release-manual-evidence-decision-v0.1.md');
  });

  it('records public release manual evidence decision closure as not closed while decisions remain pending', async () => {
    const [closure, readme, releaseChecklist, testingStrategy, acceptanceChecklist, devLog] = await Promise.all([
      readFile('docs/operations/public-release-manual-evidence-decision-closure-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(closure).toContain('Public Release Manual Evidence Decision Closure v0.1');
    expect(closure).toContain('Status: not_closed_pending_decisions');
    expect(closure).toContain('decision closure remains not_closed');
    expect(closure).toContain('public release remains no-go');
    expect(closure).toContain('No approve / reject / defer / accept risk decisions were supplied');
    expect(closure).toContain('Legal review | pending_decision');
    expect(closure).toContain('Trademark/name review | pending_decision');
    expect(closure).toContain('Branch protection or equivalent repository ruleset | pending_decision');
    expect(closure).toContain('Final maintainer publication authorization | pending_decision');
    expect(closure).toContain('Private preview reviewer feedback decision | pending_decision');
    expect(closure).toContain('Dependency/license risk confirmation | pending_decision');
    expect(closure).toContain('Secret/customer data exposure confirmation | pending_decision');
    expect(closure).toContain('No gate decision was closed in this increment');
    expect(closure).toContain('Public Source Release Execution v0.1 remains blocked');
    expect(closure).toContain('No repository visibility change was authorized');
    expect(closure).toContain('No npm publication was authorized');
    expect(closure).toContain('No GitHub release was authorized');
    expect(closure).toContain('No public launch or production marketing announcement was authorized');
    expect(closure).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was authorized');
    expect(readme).toContain('Public Release Manual Evidence Decision Closure v0.1');
    expect(releaseChecklist).toContain('Public Release Manual Evidence Decision Closure v0.1');
    expect(testingStrategy).toContain('Public Release Manual Evidence Decision Closure v0.1');
    expect(acceptanceChecklist).toContain('Public Release Manual Evidence Decision Closure v0.1');
    expect(devLog).toContain('Public Release Manual Evidence Decision Closure v0.1');

    await expectPath('docs/operations/public-release-manual-evidence-decision-closure-v0.1.md');
  });

  it('records public release manual decision input form without prefilled decisions', async () => {
    const [input, readme, releaseChecklist, testingStrategy, acceptanceChecklist, devLog] = await Promise.all([
      readFile('docs/operations/public-release-manual-decision-input-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(input).toContain('Public Release Manual Decision Input v0.1');
    expect(input).toContain('Status: pending_input');
    expect(input).toContain('public release remains no-go');
    expect(input).toContain('No approve / reject / defer / accept risk decision is prefilled');
    expect(input).toContain('Allowed decision values: approve / reject / defer / accept risk');
    expect(input).toContain('Legal review | pending_input');
    expect(input).toContain('Trademark/name review | pending_input');
    expect(input).toContain('Branch protection or equivalent repository ruleset | pending_input');
    expect(input).toContain('Final maintainer publication authorization | pending_input');
    expect(input).toContain('Private preview reviewer feedback decision | pending_input');
    expect(input).toContain('Dependency/license risk confirmation | pending_input');
    expect(input).toContain('Secret/customer data exposure confirmation | pending_input');
    expect(input).toContain('Decision value');
    expect(input).toContain('Evidence');
    expect(input).toContain('Decision date');
    expect(input).toContain('Notes');
    expect(input).toContain('Scope');
    expect(input).toContain('No gate was closed in this increment');
    expect(input).toContain('No repository visibility change was authorized');
    expect(input).toContain('No npm publication was authorized');
    expect(input).toContain('No GitHub release was authorized');
    expect(input).toContain('No public launch or production marketing announcement was authorized');
    expect(input).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was authorized');
    expect(readme).toContain('Public Release Manual Decision Input v0.1');
    expect(releaseChecklist).toContain('Public Release Manual Decision Input v0.1');
    expect(testingStrategy).toContain('Public Release Manual Decision Input v0.1');
    expect(acceptanceChecklist).toContain('Public Release Manual Decision Input v0.1');
    expect(devLog).toContain('Public Release Manual Decision Input v0.1');

    await expectPath('docs/operations/public-release-manual-decision-input-v0.1.md');
  });

  it('records public release manual decision input completion attempt without inventing decisions', async () => {
    const [completion, readme, releaseChecklist, testingStrategy, acceptanceChecklist, devLog] = await Promise.all([
      readFile('docs/operations/public-release-manual-decision-input-completion-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(completion).toContain('Public Release Manual Decision Input Completion v0.1');
    expect(completion).toContain('Status: not_completed_missing_explicit_decisions');
    expect(completion).toContain('public release remains no-go');
    expect(completion).toContain('Goal execution authorization is not a manual release decision');
    expect(completion).toContain('No approve / reject / defer / accept risk decision was supplied');
    expect(completion).toContain('Legal review | not_completed | missing_decision');
    expect(completion).toContain('Trademark/name review | not_completed | missing_decision');
    expect(completion).toContain('Branch protection or equivalent repository ruleset | not_completed | missing_decision');
    expect(completion).toContain('Final maintainer publication authorization | not_completed | missing_decision');
    expect(completion).toContain('Private preview reviewer feedback decision | not_completed | missing_decision');
    expect(completion).toContain('Dependency/license risk confirmation | not_completed | missing_decision');
    expect(completion).toContain('Secret/customer data exposure confirmation | not_completed | missing_decision');
    expect(completion).toContain('No gate was approved, rejected, deferred, risk-accepted, closed, passed, or completed');
    expect(completion).toContain('Public Source Release Execution v0.1 remains blocked');
    expect(completion).toContain('No repository visibility change was authorized');
    expect(completion).toContain('No npm publication was authorized');
    expect(completion).toContain('No GitHub release was authorized');
    expect(completion).toContain('No public launch or production marketing announcement was authorized');
    expect(completion).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was authorized');
    expect(readme).toContain('Public Release Manual Decision Input Completion v0.1');
    expect(releaseChecklist).toContain('Public Release Manual Decision Input Completion v0.1');
    expect(testingStrategy).toContain('Public Release Manual Decision Input Completion v0.1');
    expect(acceptanceChecklist).toContain('Public Release Manual Decision Input Completion v0.1');
    expect(devLog).toContain('Public Release Manual Decision Input Completion v0.1');

    await expectPath('docs/operations/public-release-manual-decision-input-completion-v0.1.md');
  });

  it('records public release manual decision intake v0.2 while keeping source release execution blocked', async () => {
    const [intake, readme, releaseChecklist, testingStrategy, acceptanceChecklist, devLog] = await Promise.all([
      readFile('docs/operations/public-release-manual-decision-intake-v0.2.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(intake).toContain('Public Release Manual Decision Intake v0.2');
    expect(intake).toContain('Status: decisions_recorded_release_execution_blocked');
    expect(intake).toContain('public release remains no-go');
    expect(intake).toContain('Legal review | approve');
    expect(intake).toContain('Trademark/name review | accept risk');
    expect(intake).toContain('Branch protection or equivalent repository ruleset | defer');
    expect(intake).toContain('Final maintainer publication authorization | approve');
    expect(intake).toContain('Private preview reviewer feedback decision | accept risk');
    expect(intake).toContain('Dependency/license risk confirmation | accept risk');
    expect(intake).toContain('Secret/customer data exposure confirmation | approve');
    expect(intake).toContain('conditional approve fallback defer');
    expect(intake).toContain('Branch protection API: `HTTP 403`');
    expect(intake).toContain('Repository rulesets API: `HTTP 403`');
    expect(intake).toContain('Final maintainer publication authorization is recorded, but release execution is blocked by the deferred branch protection gate');
    expect(intake).toContain('Public Source Release Execution v0.1 remains blocked');
    expect(intake).toContain('No repository visibility change was authorized');
    expect(intake).toContain('No npm publication was authorized');
    expect(intake).toContain('No GitHub release was authorized');
    expect(intake).toContain('No public launch or production marketing announcement was authorized');
    expect(intake).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was authorized');
    expect(readme).toContain('Public Release Manual Decision Intake v0.2');
    expect(releaseChecklist).toContain('Public Release Manual Decision Intake v0.2');
    expect(testingStrategy).toContain('Public Release Manual Decision Intake v0.2');
    expect(acceptanceChecklist).toContain('Public Release Manual Decision Intake v0.2');
    expect(devLog).toContain('Public Release Manual Decision Intake v0.2');

    await expectPath('docs/operations/public-release-manual-decision-intake-v0.2.md');
  });

  it('records public release manual decision input review as not ready while inputs remain blank', async () => {
    const [review, readme, releaseChecklist, testingStrategy, acceptanceChecklist, devLog] = await Promise.all([
      readFile('docs/operations/public-release-manual-decision-input-review-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(review).toContain('Public Release Manual Decision Input Review v0.1');
    expect(review).toContain('Status: not_ready_pending_input');
    expect(review).toContain('public release remains no-go');
    expect(review).toContain('Reviewed source: `docs/operations/public-release-manual-decision-input-v0.1.md`');
    expect(review).toContain('No approve / reject / defer / accept risk decision was supplied by the maintainer');
    expect(review).toContain('No decision value, evidence, date, notes, or scope field was filled');
    expect(review).toContain('Legal review | pending_input | missing');
    expect(review).toContain('Trademark/name review | pending_input | missing');
    expect(review).toContain('Branch protection or equivalent repository ruleset | pending_input | missing');
    expect(review).toContain('Final maintainer publication authorization | pending_input | missing');
    expect(review).toContain('Private preview reviewer feedback decision | pending_input | missing');
    expect(review).toContain('Dependency/license risk confirmation | pending_input | missing');
    expect(review).toContain('Secret/customer data exposure confirmation | pending_input | missing');
    expect(review).toContain('No gate was approved, rejected, deferred, risk-accepted, closed, or passed in this review');
    expect(review).toContain('Public Source Release Execution v0.1 remains blocked');
    expect(review).toContain('No repository visibility change was authorized');
    expect(review).toContain('No npm publication was authorized');
    expect(review).toContain('No GitHub release was authorized');
    expect(review).toContain('No public launch or production marketing announcement was authorized');
    expect(review).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was authorized');
    expect(readme).toContain('Public Release Manual Decision Input Review v0.1');
    expect(releaseChecklist).toContain('Public Release Manual Decision Input Review v0.1');
    expect(testingStrategy).toContain('Public Release Manual Decision Input Review v0.1');
    expect(acceptanceChecklist).toContain('Public Release Manual Decision Input Review v0.1');
    expect(devLog).toContain('Public Release Manual Decision Input Review v0.1');

    await expectPath('docs/operations/public-release-manual-decision-input-review-v0.1.md');
  });

  it('reviews public release manual decision intake v0.2 and keeps only the deferred branch gate blocking', async () => {
    const [review, readme, releaseChecklist, testingStrategy, acceptanceChecklist, devLog] = await Promise.all([
      readFile('docs/operations/public-release-manual-decision-input-review-v0.2.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(review).toContain('Public Release Manual Decision Input Review v0.2');
    expect(review).toContain('Status: reviewed_release_execution_still_blocked');
    expect(review).toContain('Reviewed source: `docs/operations/public-release-manual-decision-intake-v0.2.md`');
    expect(review).toContain('public release remains no-go');
    expect(review).toContain('All seven maintainer decisions are present and reviewable');
    expect(review).toContain('Legal review | approve | reviewed_currently_accepted');
    expect(review).toContain('Trademark/name review | accept risk | reviewed_currently_accepted');
    expect(review).toContain('Branch protection or equivalent repository ruleset | defer | blocking');
    expect(review).toContain('Final maintainer publication authorization | approve | reviewed_but_blocked');
    expect(review).toContain('Private preview reviewer feedback decision | accept risk | reviewed_currently_accepted');
    expect(review).toContain('Dependency/license risk confirmation | accept risk | reviewed_currently_accepted');
    expect(review).toContain('Secret/customer data exposure confirmation | approve | reviewed_currently_accepted');
    expect(review).toContain('No equivalent release control is defined in this review');
    expect(review).toContain('Do not make the repository public only to unlock branch protection');
    expect(review).toContain('Current blocking gate: branch protection or equivalent repository ruleset');
    expect(review).toContain('Public Source Release Execution v0.1 remains blocked');
    expect(review).toContain('No repository visibility change was authorized');
    expect(review).toContain('No npm publication was authorized');
    expect(review).toContain('No GitHub release was authorized');
    expect(review).toContain('No public launch or production marketing announcement was authorized');
    expect(review).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was authorized');
    expect(readme).toContain('Public Release Manual Decision Input Review v0.2');
    expect(releaseChecklist).toContain('Public Release Manual Decision Input Review v0.2');
    expect(releaseChecklist).toContain('Current blocking manual gate: branch protection or equivalent repository ruleset');
    expect(testingStrategy).toContain('Public Release Manual Decision Input Review v0.2');
    expect(acceptanceChecklist).toContain('Public Release Manual Decision Input Review v0.2');
    expect(devLog).toContain('Public Release Manual Decision Input Review v0.2');

    await expectPath('docs/operations/public-release-manual-decision-input-review-v0.2.md');
  });

  it('designs an equivalent release control without closing the public release gate', async () => {
    const [
      adrIndex,
      adr,
      operation,
      readme,
      architecture,
      releaseChecklist,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog
    ] = await Promise.all([
      readFile('docs/adr/README.md', 'utf8'),
      readFile('docs/adr/0022-equivalent-release-control.md', 'utf8'),
      readFile('docs/operations/equivalent-release-control-design-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/architecture/overview.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(adrIndex).toContain('[0022](0022-equivalent-release-control.md)');
    expect(adrIndex).toContain('Equivalent release control');
    expect(adr).toContain('ADR-0022: Equivalent Release Control');
    expect(adr).toContain('Status: Accepted');
    expect(adr).toContain('Design an equivalent release control as a fallback candidate');
    expect(adr).toContain('does not close the branch protection gate by itself');
    expect(adr).toContain('Do not make the repository public only to unlock branch protection');
    expect(adr).toContain('Public Source Release Execution remains blocked until the equivalent control is executed and explicitly closed');
    expect(operation).toContain('Equivalent Release Control Design v0.1');
    expect(operation).toContain('Status: designed_not_executed');
    expect(operation).toContain('Required evidence package');
    expect(operation).toContain('Exact release commit SHA');
    expect(operation).toContain('RepoAssure CI / Quality Gates success for the exact SHA');
    expect(operation).toContain('local full test evidence');
    expect(operation).toContain('maintainer approval for equivalent control closure');
    expect(operation).toContain('public release remains no-go');
    expect(operation).toContain('No repository visibility change was authorized');
    expect(operation).toContain('No npm publication was authorized');
    expect(operation).toContain('No GitHub release was authorized');
    expect(readme).toContain('ADR-0022');
    expect(readme).toContain('Equivalent Release Control Design v0.1');
    expect(architecture).toContain('ADR-0022');
    expect(releaseChecklist).toContain('Equivalent Release Control Design v0.1');
    expect(releaseChecklist).toContain('designed_not_executed');
    expect(testingStrategy).toContain('Equivalent Release Control Design v0.1');
    expect(acceptanceChecklist).toContain('Equivalent Release Control Design v0.1');
    expect(decisionLog).toContain('Equivalent release control');
    expect(devLog).toContain('Equivalent Release Control Design v0.1');

    await expectPath('docs/adr/0022-equivalent-release-control.md');
    await expectPath('docs/operations/equivalent-release-control-design-v0.1.md');
  });

  it('closes the equivalent release control without executing public release actions', async () => {
    const [
      closure,
      authorization,
      readme,
      releaseChecklist,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog
    ] = await Promise.all([
      readFile('docs/operations/equivalent-release-control-closure-v0.1.md', 'utf8'),
      readFile('docs/product/strategy/public-release-authorization-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(closure).toContain('Equivalent Release Control Closure v0.1');
    expect(closure).toContain('Status: closed_release_execution_ready');
    expect(closure).toContain('Release candidate SHA: `589bd9eb83bd6cd185f28d029732ee6b98027873`');
    expect(closure).toContain('RepoAssure CI / Quality Gates success for the exact SHA');
    expect(closure).toContain('Local full test evidence');
    expect(closure).toContain('Secret/customer-data exposure scan evidence');
    expect(closure).toContain('Maintainer approval for equivalent control closure');
    expect(closure).toContain('Residual risk accepted');
    expect(closure).toContain('No repository visibility change was authorized');
    expect(closure).toContain('No npm publication was authorized');
    expect(closure).toContain('No GitHub release was authorized');
    expect(closure).toContain('No public launch or production marketing announcement was authorized');
    expect(authorization).toContain('Public Release Authorization v0.1');
    expect(authorization).toContain('Status: ready_for_public_source_release_execution');
    expect(authorization).toContain('does not execute repository visibility change');
    expect(authorization).toContain('does not execute npm publication');
    expect(authorization).toContain('does not execute GitHub release');
    expect(authorization).toContain('does not execute public launch');
    expect(readme).toContain('Equivalent Release Control Closure v0.1');
    expect(readme).toContain('Public Release Authorization v0.1');
    expect(releaseChecklist).toContain('Equivalent Release Control Closure v0.1');
    expect(releaseChecklist).toContain('ready_for_public_source_release_execution');
    expect(testingStrategy).toContain('Equivalent Release Control Closure v0.1');
    expect(acceptanceChecklist).toContain('Equivalent Release Control Closure v0.1');
    expect(decisionLog).toContain('Equivalent release control closure');
    expect(devLog).toContain('Equivalent Release Control Closure v0.1');

    await expectPath('docs/operations/equivalent-release-control-closure-v0.1.md');
    await expectPath('docs/product/strategy/public-release-authorization-v0.1.md');
  });

  it('records public source release execution as repository visibility only', async () => {
    const [execution, readme, releaseChecklist, testingStrategy, acceptanceChecklist, decisionLog, devLog] =
      await Promise.all([
        readFile('docs/operations/public-source-release-execution-v0.1.md', 'utf8'),
        readFile('README.md', 'utf8'),
        readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
        readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
        readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
        readFile('docs/logs/decision-log.md', 'utf8'),
        readFile('docs/logs/dev-log.md', 'utf8')
      ]);

    expect(execution).toContain('Public Source Release Execution v0.1');
    expect(execution).toContain('Status: repository_public_verified');
    expect(execution).toContain('Executed action: repository visibility changed from `PRIVATE` to `PUBLIC`');
    expect(execution).toContain('Repository: `xiaoba-dev/repoassure`');
    expect(execution).toContain('Execution commit SHA: `1593cfb36871ceef08c9711fd21bc59ebcee6bc8`');
    expect(execution).toContain('Post-release GitHub visibility verification: `PUBLIC`');
    expect(execution).toContain('Public read access verification');
    expect(execution).toContain('RepoAssure CI / Quality Gates');
    expect(execution).toContain('pnpm release:check');
    expect(execution).toContain('public release ready: yes');
    expect(execution).toContain('No npm publication was executed');
    expect(execution).toContain('No GitHub release was executed');
    expect(execution).toContain('No public launch or production marketing announcement was executed');
    expect(execution).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was executed');
    expect(readme).toContain('Public Source Release Execution v0.1');
    expect(releaseChecklist).toContain('Public Source Release Execution v0.1');
    expect(testingStrategy).toContain('Public Source Release Execution v0.1');
    expect(acceptanceChecklist).toContain('Public Source Release Execution v0.1');
    expect(decisionLog).toContain('Public source release execution');
    expect(devLog).toContain('Public Source Release Execution v0.1');

    await expectPath('docs/operations/public-source-release-execution-v0.1.md');
  });

  it('records native branch protection enablement for main', async () => {
    const [enablement, readme, releaseChecklist, testingStrategy, acceptanceChecklist, decisionLog, devLog] =
      await Promise.all([
        readFile('docs/operations/native-branch-protection-enablement-v0.1.md', 'utf8'),
        readFile('README.md', 'utf8'),
        readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
        readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
        readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
        readFile('docs/logs/decision-log.md', 'utf8'),
        readFile('docs/logs/dev-log.md', 'utf8')
      ]);

    expect(enablement).toContain('Native Branch Protection Enablement v0.1');
    expect(enablement).toContain('Status: enabled_verified');
    expect(enablement).toContain('Protection mechanism: `GitHub branch protection`');
    expect(enablement).toContain('Protected branch: `main`');
    expect(enablement).toContain('Required status check: `Quality Gates`');
    expect(enablement).toContain('Strict status checks: `true`');
    expect(enablement).toContain('Require pull request before merge');
    expect(enablement).toContain('Required approving reviews: `1`');
    expect(enablement).toContain('Dismiss stale reviews: `true`');
    expect(enablement).toContain('Require conversation resolution: `true`');
    expect(enablement).toContain('Disallow force pushes');
    expect(enablement).toContain('Disallow branch deletion');
    expect(enablement).toContain('Post-enablement verification: `protected: true`');
    expect(enablement).toContain('No npm publication was executed');
    expect(enablement).toContain('No GitHub release was executed');
    expect(enablement).toContain('No public launch or production marketing announcement was executed');
    expect(enablement).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was executed');
    expect(readme).toContain('Native Branch Protection Enablement v0.1');
    expect(releaseChecklist).toContain('Native Branch Protection Enablement v0.1');
    expect(testingStrategy).toContain('Native Branch Protection Enablement v0.1');
    expect(acceptanceChecklist).toContain('Native Branch Protection Enablement v0.1');
    expect(decisionLog).toContain('Native branch protection enablement');
    expect(devLog).toContain('Native Branch Protection Enablement v0.1');

    await expectPath('docs/operations/native-branch-protection-enablement-v0.1.md');
  });

  it('records protected pull request workflow verification', async () => {
    const [verification, readme, testingStrategy, acceptanceChecklist, decisionLog, devLog] = await Promise.all([
      readFile('docs/operations/protected-pr-workflow-verification-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(verification).toContain('Protected PR Workflow Verification v0.1');
    expect(verification).toContain('Status: pr_created_ci_passed_review_required');
    expect(verification).toContain('Workflow branch: `codex/protected-pr-workflow-v0.1`');
    expect(verification).toContain('Base branch: `main`');
    expect(verification).toContain('Pull request: `https://github.com/xiaoba-dev/repoassure/pull/3`');
    expect(verification).toContain('CI evidence: tracked by GitHub PR status and PR evidence comments');
    expect(verification).toContain('Branch protection remains enabled');
    expect(verification).toContain('Required status check: `Quality Gates`');
    expect(verification).toContain('Pull request workflow');
    expect(verification).toContain('Review gate');
    expect(verification).toContain('GitHub rejected self-approval');
    expect(verification).toContain('Review Can not approve your own pull request');
    expect(verification).toContain('No branch protection weakening was executed');
    expect(verification).toContain('No direct push to `main` was executed');
    expect(verification).toContain('No npm publication was executed');
    expect(verification).toContain('No GitHub release was executed');
    expect(verification).toContain('No public launch or production marketing announcement was executed');
    expect(readme).toContain('Protected PR Workflow Verification v0.1');
    expect(testingStrategy).toContain('Protected PR Workflow Verification v0.1');
    expect(acceptanceChecklist).toContain('Protected PR Workflow Verification v0.1');
    expect(decisionLog).toContain('Protected PR workflow verification');
    expect(devLog).toContain('Protected PR Workflow Verification v0.1');

    await expectPath('docs/operations/protected-pr-workflow-verification-v0.1.md');
  });

  it('records solo maintainer branch protection adjustment', async () => {
    const [adr, adjustment, closure, readme, testingStrategy, acceptanceChecklist, decisionLog, devLog] = await Promise.all([
      readFile('docs/adr/0023-solo-maintainer-branch-protection.md', 'utf8'),
      readFile('docs/operations/solo-maintainer-branch-protection-adjustment-v0.1.md', 'utf8'),
      readFile('docs/operations/protected-pr-workflow-closure-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(adr).toContain('ADR-0023: Solo Maintainer Branch Protection');
    expect(adr).toContain('Status: Accepted');
    expect(adr).toContain('Required approving reviews: `0`');
    expect(adr).toContain('Required status check: `Quality Gates`');
    expect(adr).toContain('Do not weaken CI gate');
    expect(adjustment).toContain('Solo Maintainer Branch Protection Adjustment v0.1');
    expect(adjustment).toContain('Status: adjustment_verified_pr3_merged');
    expect(adjustment).toContain('Required approving reviews: `1 -> 0`');
    expect(adjustment).toContain('Keep strict status checks: `true`');
    expect(adjustment).toContain('Keep required status check: `Quality Gates`');
    expect(adjustment).toContain('Keep force pushes disabled');
    expect(adjustment).toContain('Keep branch deletion disabled');
    expect(adjustment).toContain('No direct push to `main` was executed');
    expect(adjustment).toContain('No npm publication was executed');
    expect(adjustment).toContain('No GitHub release was executed');
    expect(closure).toContain('Protected PR Workflow Closure v0.1');
    expect(closure).toContain('Status: pr3_merged_main_ci_passed');
    expect(closure).toContain('Pull request: `https://github.com/xiaoba-dev/repoassure/pull/3`');
    expect(closure).toContain('Merge commit: `c522f3c180ea642d4c531f97ecb287aa061d060f`');
    expect(closure).toContain('Main CI run: `28510634551`');
    expect(closure).toContain('Quality Gates');
    expect(closure).toContain('No direct push to `main` was executed');
    expect(readme).toContain('Solo Maintainer Branch Protection Adjustment v0.1');
    expect(readme).toContain('Protected PR Workflow Closure v0.1');
    expect(testingStrategy).toContain('Solo Maintainer Branch Protection Adjustment v0.1');
    expect(acceptanceChecklist).toContain('Solo Maintainer Branch Protection Adjustment v0.1');
    expect(decisionLog).toContain('Solo maintainer branch protection adjustment');
    expect(devLog).toContain('Solo Maintainer Branch Protection Adjustment v0.1');

    await expectPath('docs/adr/0023-solo-maintainer-branch-protection.md');
    await expectPath('docs/operations/solo-maintainer-branch-protection-adjustment-v0.1.md');
    await expectPath('docs/operations/protected-pr-workflow-closure-v0.1.md');
  });

  it('records public release post-merge hygiene review', async () => {
    const [hygiene, readme, testingStrategy, acceptanceChecklist, decisionLog, devLog] = await Promise.all([
      readFile('docs/operations/public-release-post-merge-hygiene-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(hygiene).toContain('Public Release Post-Merge Hygiene v0.1');
    expect(hygiene).toContain('Status: hygiene_verified');
    expect(hygiene).toContain('Repository visibility: `PUBLIC`');
    expect(hygiene).toContain('Default branch: `main`');
    expect(hygiene).toContain('Branch protection profile: `solo_maintainer`');
    expect(hygiene).toContain('Required status check: `Quality Gates`');
    expect(hygiene).toContain('Main CI run: `28511247860`');
    expect(hygiene).toContain('Package publication boundary: `package.json` keeps `private: true`');
    expect(hygiene).toContain('Website custom domains: `repoassure.com`, `www.repoassure.com`');
    expect(hygiene).toContain('Secret/customer data exposure scan: passed');
    expect(hygiene).toContain('No npm publication was executed');
    expect(hygiene).toContain('No GitHub release was executed');
    expect(hygiene).toContain('No public launch or production marketing announcement was executed');
    expect(readme).toContain('Public Release Post-Merge Hygiene v0.1');
    expect(testingStrategy).toContain('Public Release Post-Merge Hygiene v0.1');
    expect(acceptanceChecklist).toContain('Public Release Post-Merge Hygiene v0.1');
    expect(decisionLog).toContain('Public release post-merge hygiene');
    expect(devLog).toContain('Public Release Post-Merge Hygiene v0.1');

    await expectPath('docs/operations/public-release-post-merge-hygiene-v0.1.md');
  });

  it('records current public source release final verification without reopening launch gates', async () => {
    const [verification, readme, releaseChecklist, testingStrategy, acceptanceChecklist, decisionLog, devLog, contributing] =
      await Promise.all([
        readFile('docs/operations/public-source-release-final-verification-v0.1.md', 'utf8'),
        readFile('README.md', 'utf8'),
        readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
        readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
        readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
        readFile('docs/logs/decision-log.md', 'utf8'),
        readFile('docs/logs/dev-log.md', 'utf8'),
        readFile('CONTRIBUTING.md', 'utf8')
      ]);

    expect(verification).toContain('Public Source Release Final Verification v0.1');
    expect(verification).toContain('Status: public_source_verified_launch_still_blocked');
    expect(verification).toContain('Repository visibility: `PUBLIC`');
    expect(verification).toContain('Latest main head: `e58095fea34d1f8f56941086df1b5be6abf685ce`');
    expect(verification).toContain('Latest main CI run: `28738066002`');
    expect(verification).toContain('Public read access verification: `git ls-remote` returned `e58095fea34d1f8f56941086df1b5be6abf685ce HEAD`');
    expect(verification).toContain('Required status check: `Quality Gates`');
    expect(verification).toContain('Strict status checks: `true`');
    expect(verification).toContain('Admin enforcement: `true`');
    expect(verification).toContain('Conversation resolution: `true`');
    expect(verification).toContain('Linear history: `true`');
    expect(verification).toContain('Required approving reviews: disabled for solo maintainer mode');
    expect(verification).toContain('Remote git tags: none found');
    expect(verification).toContain('GitHub releases: none found');
    expect(verification).toContain('npm package `hardening-mcp`: not found');
    expect(verification).toContain('Package publication boundary: `package.json` keeps `private: true`');
    expect(verification).toContain('`pnpm release:check`: passed');
    expect(verification).toContain('`pnpm repo:hygiene`: passed');
    expect(verification).toContain('`pnpm release:hygiene`: passed');
    expect(verification).toContain('`REPOASSURE_WEBSITE_URL=https://repoassure.com pnpm verify:website`: passed');
    expect(verification).toContain('`REPOASSURE_WEBSITE_URL=https://www.repoassure.com pnpm verify:website`: passed');
    expect(verification).toContain('No npm publication was executed');
    expect(verification).toContain('No GitHub release was executed');
    expect(verification).toContain('No public launch or production marketing announcement was executed');
    expect(verification).toContain('No customer contact was executed');
    expect(verification).toContain('No pricing change or spend was executed');
    expect(verification).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was executed');
    expect(readme).toContain('Public Source Release Final Verification v0.1');
    expect(releaseChecklist).toContain('Public Source Release Final Verification v0.1');
    expect(testingStrategy).toContain('Public Source Release Final Verification v0.1');
    expect(acceptanceChecklist).toContain('Public Source Release Final Verification v0.1');
    expect(decisionLog).toContain('Public source release final verification');
    expect(devLog).toContain('Public Source Release Final Verification v0.1');
    expect(contributing).toContain('The repository is public for source review and contribution');
    expect(contributing).not.toContain('repository remains private');

    await expectPath('docs/operations/public-source-release-final-verification-v0.1.md');
  });

  it('records public launch boundary decision without executing launch actions', async () => {
    const [
      decision,
      readme,
      releaseChecklist,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog
    ] = await Promise.all([
      readFile('docs/operations/public-launch-boundary-decision-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(decision).toContain('Public Launch Boundary Decision v0.1');
    expect(decision).toContain('Status: launch_not_authorized');
    expect(decision).toContain('Current mode: `source_public_website_live`');
    expect(decision).toContain('Decision: `do_not_launch_yet`');
    expect(decision).toContain('Public source repository: `PUBLIC`');
    expect(decision).toContain('Website custom domains: `repoassure.com`, `www.repoassure.com`');
    expect(decision).toContain('Package publication boundary: `package.json` keeps `private: true`');
    expect(decision).toContain('Required next gate: `public_launch_authorization`');
    expect(decision).toContain('No npm publication was executed');
    expect(decision).toContain('No GitHub release was executed');
    expect(decision).toContain('No public launch or production marketing announcement was executed');
    expect(decision).toContain('No customer contact was executed');
    expect(decision).toContain('No pricing change or spend was executed');
    expect(decision).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was executed');
    expect(readme).toContain('Public Launch Boundary Decision v0.1');
    expect(releaseChecklist).toContain('Public Launch Boundary Decision v0.1');
    expect(testingStrategy).toContain('Public Launch Boundary Decision v0.1');
    expect(acceptanceChecklist).toContain('Public Launch Boundary Decision v0.1');
    expect(decisionLog).toContain('Public launch boundary decision');
    expect(devLog).toContain('Public Launch Boundary Decision v0.1');

    await expectPath('docs/operations/public-launch-boundary-decision-v0.1.md');
  });

  it('prepares public launch authorization packet without authorizing launch execution', async () => {
    const [
      packet,
      readme,
      releaseChecklist,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog
    ] = await Promise.all([
      readFile('docs/operations/public-launch-authorization-packet-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(packet).toContain('Public Launch Authorization Packet v0.1');
    expect(packet).toContain('Status: authorization_packet_prepared');
    expect(packet).toContain('Launch authorization status: `not_authorized`');
    expect(packet).toContain('Source decision: `Public Launch Boundary Decision v0.1`');
    expect(packet).toContain('Launch scope');
    expect(packet).toContain('Launch copy');
    expect(packet).toContain('Release notes');
    expect(packet).toContain('Support boundary');
    expect(packet).toContain('Legal/trademark/claim-risk review');
    expect(packet).toContain('Commercial availability wording review');
    expect(packet).toContain('Risk acceptance');
    expect(packet).toContain('Rollback/correction plan');
    expect(packet).toContain('Maintainer approval');
    expect(packet).toContain('This packet is not an Action Authorization Receipt');
    expect(packet).toContain('Required next gate: `public_launch_execution_authorization`');
    expect(packet).toContain('No npm publication was executed');
    expect(packet).toContain('No GitHub release was executed');
    expect(packet).toContain('No public launch or production marketing announcement was executed');
    expect(packet).toContain('No customer contact was executed');
    expect(packet).toContain('No pricing change or spend was executed');
    expect(packet).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was executed');
    expect(readme).toContain('Public Launch Authorization Packet v0.1');
    expect(releaseChecklist).toContain('Public Launch Authorization Packet v0.1');
    expect(testingStrategy).toContain('Public Launch Authorization Packet v0.1');
    expect(acceptanceChecklist).toContain('Public Launch Authorization Packet v0.1');
    expect(decisionLog).toContain('Public launch authorization packet');
    expect(devLog).toContain('Public Launch Authorization Packet v0.1');

    await expectPath('docs/operations/public-launch-authorization-packet-v0.1.md');
  });

  it('records public launch authorization packet completion as deferred without launch authorization', async () => {
    const [
      completion,
      readme,
      releaseChecklist,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog
    ] = await Promise.all([
      readFile('docs/operations/public-launch-authorization-packet-completion-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(completion).toContain('Public Launch Authorization Packet Completion v0.1');
    expect(completion).toContain('Status: completion_recorded_launch_not_authorized');
    expect(completion).toContain('Launch authorization status: `not_authorized`');
    expect(completion).toContain('Completion decision: `defer_launch_authorization`');
    expect(completion).toContain('Source packet: `Public Launch Authorization Packet v0.1`');
    expect(completion).toContain('Launch scope: `defer`');
    expect(completion).toContain('Launch copy: `defer`');
    expect(completion).toContain('Release notes: `defer`');
    expect(completion).toContain('Support boundary: `defer`');
    expect(completion).toContain('Legal/trademark/claim-risk review: `defer`');
    expect(completion).toContain('Commercial availability wording review: `defer`');
    expect(completion).toContain('Risk acceptance: `defer`');
    expect(completion).toContain('Rollback/correction plan: `defer`');
    expect(completion).toContain('Maintainer approval: `defer`');
    expect(completion).toContain('No Action Authorization Receipt was produced');
    expect(completion).toContain('Required next gate: `maintainer_launch_decision_input`');
    expect(completion).toContain('No npm publication was executed');
    expect(completion).toContain('No GitHub release was executed');
    expect(completion).toContain('No public launch or production marketing announcement was executed');
    expect(completion).toContain('No customer contact was executed');
    expect(completion).toContain('No pricing change or spend was executed');
    expect(completion).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was executed');
    expect(readme).toContain('Public Launch Authorization Packet Completion v0.1');
    expect(releaseChecklist).toContain('Public Launch Authorization Packet Completion v0.1');
    expect(testingStrategy).toContain('Public Launch Authorization Packet Completion v0.1');
    expect(acceptanceChecklist).toContain('Public Launch Authorization Packet Completion v0.1');
    expect(decisionLog).toContain('Public launch authorization packet completion');
    expect(devLog).toContain('Public Launch Authorization Packet Completion v0.1');

    await expectPath('docs/operations/public-launch-authorization-packet-completion-v0.1.md');
  });

  it('records maintainer launch decision input as not supplied without authorizing launch', async () => {
    const [
      decisionInput,
      readme,
      releaseChecklist,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog
    ] = await Promise.all([
      readFile('docs/operations/maintainer-launch-decision-input-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(decisionInput).toContain('Maintainer Launch Decision Input v0.1');
    expect(decisionInput).toContain('Status: decision_input_recorded_launch_not_authorized');
    expect(decisionInput).toContain('Launch authorization status: `not_authorized`');
    expect(decisionInput).toContain('Maintainer input decision: `not_supplied`');
    expect(decisionInput).toContain('Launch decision: `defer_launch`');
    expect(decisionInput).toContain('Source packet completion: `Public Launch Authorization Packet Completion v0.1`');
    expect(decisionInput).toContain('Goal execution authorization is not launch authorization');
    expect(decisionInput).toContain('Launch scope input: `not_supplied`');
    expect(decisionInput).toContain('Launch copy input: `not_supplied`');
    expect(decisionInput).toContain('Release notes input: `not_supplied`');
    expect(decisionInput).toContain('Support boundary input: `not_supplied`');
    expect(decisionInput).toContain('Legal/trademark/claim-risk review input: `not_supplied`');
    expect(decisionInput).toContain('Commercial availability wording review input: `not_supplied`');
    expect(decisionInput).toContain('Risk acceptance input: `not_supplied`');
    expect(decisionInput).toContain('Rollback/correction plan input: `not_supplied`');
    expect(decisionInput).toContain('Final launch approval input: `not_supplied`');
    expect(decisionInput).toContain('No Action Authorization Receipt was produced');
    expect(decisionInput).toContain('Required next gate: `explicit_launch_authorization_or_defer_decision`');
    expect(decisionInput).toContain('No npm publication was executed');
    expect(decisionInput).toContain('No GitHub release was executed');
    expect(decisionInput).toContain('No public launch or production marketing announcement was executed');
    expect(decisionInput).toContain('No customer contact was executed');
    expect(decisionInput).toContain('No pricing change or spend was executed');
    expect(decisionInput).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was executed');
    expect(readme).toContain('Maintainer Launch Decision Input v0.1');
    expect(releaseChecklist).toContain('Maintainer Launch Decision Input v0.1');
    expect(testingStrategy).toContain('Maintainer Launch Decision Input v0.1');
    expect(acceptanceChecklist).toContain('Maintainer Launch Decision Input v0.1');
    expect(decisionLog).toContain('Maintainer launch decision input');
    expect(devLog).toContain('Maintainer Launch Decision Input v0.1');

    await expectPath('docs/operations/maintainer-launch-decision-input-v0.1.md');
  });

  it('records explicit launch decision as deferred without authorizing launch execution', async () => {
    const [
      deferDecision,
      readme,
      releaseChecklist,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog
    ] = await Promise.all([
      readFile('docs/operations/explicit-launch-authorization-or-defer-decision-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(deferDecision).toContain('Explicit Launch Authorization or Defer Decision v0.1');
    expect(deferDecision).toContain('Status: explicit_defer_decision_recorded_launch_not_authorized');
    expect(deferDecision).toContain('Launch authorization status: `not_authorized`');
    expect(deferDecision).toContain('Explicit launch decision: `defer_public_launch`');
    expect(deferDecision).toContain('Decision source: `goal_execution_authorization_only`');
    expect(deferDecision).toContain('Source decision input: `Maintainer Launch Decision Input v0.1`');
    expect(deferDecision).toContain('Launch scope: `not_provided`');
    expect(deferDecision).toContain('Launch copy: `not_provided`');
    expect(deferDecision).toContain('Release notes: `not_provided`');
    expect(deferDecision).toContain('Support boundary: `not_provided`');
    expect(deferDecision).toContain('Legal/trademark/claim-risk review: `not_provided`');
    expect(deferDecision).toContain('Commercial availability wording review: `not_provided`');
    expect(deferDecision).toContain('Risk acceptance: `not_provided`');
    expect(deferDecision).toContain('Rollback/correction plan: `not_provided`');
    expect(deferDecision).toContain('Final launch approval: `not_provided`');
    expect(deferDecision).toContain('No Action Authorization Receipt was produced');
    expect(deferDecision).toContain('Required next gate: `future_launch_authorization_packet`');
    expect(deferDecision).toContain('No npm publication was executed');
    expect(deferDecision).toContain('No GitHub release was executed');
    expect(deferDecision).toContain('No public launch or production marketing announcement was executed');
    expect(deferDecision).toContain('No customer contact was executed');
    expect(deferDecision).toContain('No pricing change or spend was executed');
    expect(deferDecision).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was executed');
    expect(readme).toContain('Explicit Launch Authorization or Defer Decision v0.1');
    expect(releaseChecklist).toContain('Explicit Launch Authorization or Defer Decision v0.1');
    expect(testingStrategy).toContain('Explicit Launch Authorization or Defer Decision v0.1');
    expect(acceptanceChecklist).toContain('Explicit Launch Authorization or Defer Decision v0.1');
    expect(decisionLog).toContain('Explicit launch authorization or defer decision');
    expect(devLog).toContain('Explicit Launch Authorization or Defer Decision v0.1');

    await expectPath('docs/operations/explicit-launch-authorization-or-defer-decision-v0.1.md');
  });

  it('records public launch defer closure and redirects follow-up work away from launch gates', async () => {
    const [
      closure,
      readme,
      releaseChecklist,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog
    ] = await Promise.all([
      readFile('docs/operations/public-launch-defer-closure-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(closure).toContain('Public Launch Defer Closure v0.1');
    expect(closure).toContain('Status: launch_gate_closed_deferred');
    expect(closure).toContain('Launch authorization status: `not_authorized`');
    expect(closure).toContain('Closure decision: `close_public_launch_gate_as_deferred`');
    expect(closure).toContain('Source decision: `Explicit Launch Authorization or Defer Decision v0.1`');
    expect(closure).toContain('Source explicit launch decision: `defer_public_launch`');
    expect(closure).toContain('Do not continue repeating launch authorization gates');
    expect(closure).toContain('Future launch entry: `new_future_launch_authorization_packet_required`');
    expect(closure).toContain('Next workstream: `product_website_user_validation_backlog`');
    expect(closure).toContain('No Action Authorization Receipt was produced');
    expect(closure).toContain('No npm publication was executed');
    expect(closure).toContain('No GitHub release was executed');
    expect(closure).toContain('No public launch or production marketing announcement was executed');
    expect(closure).toContain('No customer contact was executed');
    expect(closure).toContain('No pricing change or spend was executed');
    expect(closure).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was executed');
    expect(readme).toContain('Public Launch Defer Closure v0.1');
    expect(releaseChecklist).toContain('Public Launch Defer Closure v0.1');
    expect(testingStrategy).toContain('Public Launch Defer Closure v0.1');
    expect(acceptanceChecklist).toContain('Public Launch Defer Closure v0.1');
    expect(decisionLog).toContain('Public launch defer closure');
    expect(devLog).toContain('Public Launch Defer Closure v0.1');

    await expectPath('docs/operations/public-launch-defer-closure-v0.1.md');
  });

  it('records product website user validation backlog planning after launch defer closure', async () => {
    const [
      backlog,
      readme,
      releaseChecklist,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog
    ] = await Promise.all([
      readFile('docs/operations/product-website-user-validation-backlog-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(backlog).toContain('Product / Website / User Validation Backlog Planning v0.1');
    expect(backlog).toContain('Status: backlog_planned_launch_deferred');
    expect(backlog).toContain('Source closure: `Public Launch Defer Closure v0.1`');
    expect(backlog).toContain('Launch authorization status: `not_authorized`');
    expect(backlog).toContain('Backlog workstream: `product_website_user_validation_backlog`');
    expect(backlog).toContain('Product backlog');
    expect(backlog).toContain('Public website backlog');
    expect(backlog).toContain('User validation backlog');
    expect(backlog).toContain('Release readiness hygiene backlog');
    expect(backlog).toContain('Future launch reopening criteria');
    expect(backlog).toContain('No Action Authorization Receipt was produced');
    expect(backlog).toContain('No npm publication was executed');
    expect(backlog).toContain('No GitHub release was executed');
    expect(backlog).toContain('No public launch or production marketing announcement was executed');
    expect(backlog).toContain('No customer contact was executed');
    expect(backlog).toContain('No pricing change or spend was executed');
    expect(backlog).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was executed');
    expect(readme).toContain('Product / Website / User Validation Backlog Planning v0.1');
    expect(releaseChecklist).toContain('Product / Website / User Validation Backlog Planning v0.1');
    expect(testingStrategy).toContain('Product / Website / User Validation Backlog Planning v0.1');
    expect(acceptanceChecklist).toContain('Product / Website / User Validation Backlog Planning v0.1');
    expect(decisionLog).toContain('Product website user validation backlog planning');
    expect(devLog).toContain('Product / Website / User Validation Backlog Planning v0.1');

    await expectPath('docs/operations/product-website-user-validation-backlog-v0.1.md');
  });

  it('records product backlog prioritization without reopening the public launch gate', async () => {
    const [
      prioritization,
      readme,
      releaseChecklist,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog
    ] = await Promise.all([
      readFile('docs/operations/product-backlog-prioritization-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(prioritization).toContain('Product Backlog Prioritization v0.1');
    expect(prioritization).toContain('Status: product_backlog_prioritized_launch_deferred');
    expect(prioritization).toContain('Source backlog: `Product / Website / User Validation Backlog Planning v0.1`');
    expect(prioritization).toContain('Launch authorization status: `not_authorized`');
    expect(prioritization).toContain('Prioritization decision: `prioritize_product_validation_before_launch`');
    expect(prioritization).toContain('TDD execution order');
    expect(prioritization).toContain('Priority 1: Target repo acceptance feedback loop');
    expect(prioritization).toContain('Priority 2: AI IDE handoff material quality');
    expect(prioritization).toContain('Priority 3: Repair task actionability');
    expect(prioritization).toContain('Priority 4: User validation evidence loop');
    expect(prioritization).toContain('Priority 5: Release readiness hygiene automation');
    expect(prioritization).toContain('Do not reopen public launch gate');
    expect(prioritization).toContain('No Action Authorization Receipt was produced');
    expect(prioritization).toContain('No npm publication was executed');
    expect(prioritization).toContain('No GitHub release was executed');
    expect(prioritization).toContain('No public launch or production marketing announcement was executed');
    expect(prioritization).toContain('No customer contact was executed');
    expect(prioritization).toContain('No pricing change or spend was executed');
    expect(prioritization).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was executed');
    expect(readme).toContain('Product Backlog Prioritization v0.1');
    expect(releaseChecklist).toContain('Product Backlog Prioritization v0.1');
    expect(testingStrategy).toContain('Product Backlog Prioritization v0.1');
    expect(acceptanceChecklist).toContain('Product Backlog Prioritization v0.1');
    expect(decisionLog).toContain('Product backlog prioritization');
    expect(devLog).toContain('Product Backlog Prioritization v0.1');

    await expectPath('docs/operations/product-backlog-prioritization-v0.1.md');
  });

  it('records target repo acceptance feedback loop spec without implementing runtime or launch actions', async () => {
    const [
      feedbackSpec,
      readme,
      releaseChecklist,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog
    ] = await Promise.all([
      readFile('docs/operations/target-repo-acceptance-feedback-loop-spec-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(feedbackSpec).toContain('Target Repo Acceptance Feedback Loop Spec v0.1');
    expect(feedbackSpec).toContain('Status: target_repo_feedback_loop_specified_not_implemented');
    expect(feedbackSpec).toContain('Source priority: `Product Backlog Prioritization v0.1 / Priority 1`');
    expect(feedbackSpec).toContain('Launch authorization status: `not_authorized`');
    expect(feedbackSpec).toContain('Implementation authorization: `spec_only`');
    expect(feedbackSpec).toContain('Acceptance feedback summary contract');
    expect(feedbackSpec).toContain('runStatus');
    expect(feedbackSpec).toContain('targetRepoMetadataClass');
    expect(feedbackSpec).toContain('acceptanceResult');
    expect(feedbackSpec).toContain('blockerCategory');
    expect(feedbackSpec).toContain('nextRecommendedProductAction');
    expect(feedbackSpec).toContain('artifactLinks');
    expect(feedbackSpec).toContain('redactionBoundary');
    expect(feedbackSpec).toContain('maintainerTriageGuidance');
    expect(feedbackSpec).toContain('AI IDE consumption order');
    expect(feedbackSpec).toContain('TDD implementation order');
    expect(feedbackSpec).toContain('No runtime implementation was executed');
    expect(feedbackSpec).toContain('No target repo material was uploaded');
    expect(feedbackSpec).toContain('No secrets or raw private repo content may be stored');
    expect(feedbackSpec).toContain('No public launch or production marketing announcement was executed');
    expect(feedbackSpec).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was executed');
    expect(readme).toContain('Target Repo Acceptance Feedback Loop Spec v0.1');
    expect(releaseChecklist).toContain('Target Repo Acceptance Feedback Loop Spec v0.1');
    expect(testingStrategy).toContain('Target Repo Acceptance Feedback Loop Spec v0.1');
    expect(acceptanceChecklist).toContain('Target Repo Acceptance Feedback Loop Spec v0.1');
    expect(decisionLog).toContain('Target repo acceptance feedback loop spec');
    expect(devLog).toContain('Target Repo Acceptance Feedback Loop Spec v0.1');

    await expectPath('docs/operations/target-repo-acceptance-feedback-loop-spec-v0.1.md');
  });

  it('records target repo acceptance feedback loop runtime without launch actions', async () => {
    const [
      runtime,
      readme,
      releaseChecklist,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog
    ] = await Promise.all([
      readFile('docs/operations/target-repo-acceptance-feedback-loop-runtime-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(runtime).toContain('Target Repo Acceptance Feedback Loop Runtime v0.1');
    expect(runtime).toContain('Status: target_repo_feedback_loop_runtime_implemented');
    expect(runtime).toContain('Source spec: `Target Repo Acceptance Feedback Loop Spec v0.1`');
    expect(runtime).toContain('Implementation status: `implemented_minimal_runtime`');
    expect(runtime).toContain('Launch authorization status: `not_authorized`');
    expect(runtime).toContain('target-repo-feedback-summary.json');
    expect(runtime).toContain('repoassure.target-repo-feedback-summary.v1');
    expect(runtime).toContain('packages/acceptance/src/target-repo-feedback-summary.ts');
    expect(runtime).toContain('packages/acceptance/src/run-user-acceptance.ts');
    expect(runtime).toContain('runStatus');
    expect(runtime).toContain('targetRepoMetadataClass');
    expect(runtime).toContain('acceptanceResult');
    expect(runtime).toContain('blockerCategory');
    expect(runtime).toContain('nextRecommendedProductAction');
    expect(runtime).toContain('artifactLinks');
    expect(runtime).toContain('redactionBoundary');
    expect(runtime).toContain('maintainerTriageGuidance');
    expect(runtime).toContain('relative artifact links');
    expect(runtime).toContain('No target repo material was uploaded');
    expect(runtime).toContain('No secrets or raw private repo content may be stored');
    expect(runtime).toContain('No public launch or production marketing announcement was executed');
    expect(runtime).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was executed');
    expect(readme).toContain('Target Repo Acceptance Feedback Loop Runtime v0.1');
    expect(releaseChecklist).toContain('Target Repo Acceptance Feedback Loop Runtime v0.1');
    expect(testingStrategy).toContain('Target Repo Acceptance Feedback Loop Runtime v0.1');
    expect(acceptanceChecklist).toContain('Target Repo Acceptance Feedback Loop Runtime v0.1');
    expect(decisionLog).toContain('Target repo acceptance feedback loop runtime');
    expect(devLog).toContain('Target Repo Acceptance Feedback Loop Runtime v0.1');

    await expectPath('docs/operations/target-repo-acceptance-feedback-loop-runtime-v0.1.md');
  });

  it('records AI IDE handoff material quality runtime without launch actions', async () => {
    const [
      runtime,
      readme,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog
    ] = await Promise.all([
      readFile('docs/operations/ai-ide-handoff-material-quality-runtime-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(runtime).toContain('AI IDE Handoff Material Quality Runtime v0.1');
    expect(runtime).toContain('ai_ide_handoff_material_quality_runtime_implemented');
    expect(runtime).toContain('Product Backlog Prioritization v0.1 / Priority 2');
    expect(runtime).toContain('Implementation status: `implemented_minimal_runtime`');
    expect(runtime).toContain('Launch authorization status: `not_authorized`');
    expect(runtime).toContain('ai-ide-handoff-package.json');
    expect(runtime).toContain('repoassure.ai-ide-handoff-package.v1');
    expect(runtime).toContain('artifacts.aiIdeHandoffPackagePath');
    expect(runtime).toContain('recommendedReadingOrder');
    expect(runtime).toContain('artifactInventory');
    expect(runtime).toContain('priorityActions');
    expect(runtime).toContain('consumptionGuidance');
    expect(runtime).toContain('qualityGates');
    expect(runtime).toContain('redactionBoundary');
    expect(runtime).toContain('sourceSummary');
    expect(runtime).toContain('packages/acceptance/src/ai-ide-handoff-package.ts');
    expect(runtime).toContain('@hardening-mcp/acceptance/ai-ide-handoff-package');
    expect(runtime).toContain('must not store secrets, raw private repo content');
    expect(runtime).toContain('npm publication');
    expect(runtime).toContain('hosted dashboard availability claims');
    expect(readme).toContain('AI IDE handoff material quality runtime');
    expect(readme).toContain('ai-ide-handoff-package.json');
    expect(testingStrategy).toContain('AI IDE Handoff Material Quality Runtime v0.1');
    expect(acceptanceChecklist).toContain('AI IDE Handoff Material Quality Runtime v0.1');
    expect(decisionLog).toContain('AI IDE handoff material quality runtime');
    expect(devLog).toContain('AI IDE Handoff Material Quality Runtime v0.1');

    await expectPath('docs/operations/ai-ide-handoff-material-quality-runtime-v0.1.md');
  });

  it('records repair task actionability runtime without launch actions', async () => {
    const [
      runtime,
      readme,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog
    ] = await Promise.all([
      readFile('docs/operations/repair-task-actionability-runtime-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(runtime).toContain('Repair Task Actionability Runtime v0.1');
    expect(runtime).toContain('repair_task_actionability_runtime_implemented');
    expect(runtime).toContain('Product Backlog Prioritization v0.1 / Priority 3');
    expect(runtime).toContain('Implementation status: `implemented_minimal_runtime`');
    expect(runtime).toContain('Launch authorization status: `not_authorized`');
    expect(runtime).toContain('actionability');
    expect(runtime).toContain('dependencies');
    expect(runtime).toContain('suggestedVerificationCommands');
    expect(runtime).toContain('patchApplicabilityEvidence');
    expect(runtime).toContain('aiIdeExecutionPrompt');
    expect(runtime).toContain('manualReviewBoundary');
    expect(runtime).toContain('riskNotes');
    expect(runtime).toContain('noAutoApplyBoundary');
    expect(runtime).toContain('packages/repair-planner/src/generate-repair-plan.ts');
    expect(runtime).toContain('packages/acceptance/src/run-repair-handoff.ts');
    expect(runtime).toContain('Do not auto-apply');
    expect(runtime).toContain('npm publication');
    expect(runtime).toContain('hosted dashboard availability claims');
    expect(readme).toContain('Repair task actionability runtime');
    expect(readme).toContain('no-auto-apply boundary');
    expect(testingStrategy).toContain('Repair Task Actionability Runtime v0.1');
    expect(acceptanceChecklist).toContain('Repair Task Actionability Runtime v0.1');
    expect(decisionLog).toContain('Repair task actionability runtime');
    expect(devLog).toContain('Repair Task Actionability Runtime v0.1');

    await expectPath('docs/operations/repair-task-actionability-runtime-v0.1.md');
  });

  it('records user validation evidence loop runtime without launch actions', async () => {
    const [
      runtime,
      readme,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog
    ] = await Promise.all([
      readFile('docs/operations/user-validation-evidence-loop-runtime-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(runtime).toContain('User Validation Evidence Loop Runtime v0.1');
    expect(runtime).toContain('user_validation_evidence_loop_runtime_implemented');
    expect(runtime).toContain('Product Backlog Prioritization v0.1 / Priority 4');
    expect(runtime).toContain('Implementation status: `implemented_minimal_runtime`');
    expect(runtime).toContain('Launch authorization status: `not_authorized`');
    expect(runtime).toContain('user-validation-evidence-loop.json');
    expect(runtime).toContain('repoassure.user-validation-evidence-loop.v1');
    expect(runtime).toContain('artifacts.userValidationEvidenceLoopPath');
    expect(runtime).toContain('feedbackEvents');
    expect(runtime).toContain('evidenceSources');
    expect(runtime).toContain('triage');
    expect(runtime).toContain('qualityGates');
    expect(runtime).toContain('redactionBoundary');
    expect(runtime).toContain('nonAuthorizationBoundary');
    expect(runtime).toContain('packages/acceptance/src/user-validation-evidence-loop.ts');
    expect(runtime).toContain('@hardening-mcp/acceptance/user-validation-evidence-loop');
    expect(runtime).toContain('No reviewer PII');
    expect(runtime).toContain('npm publication');
    expect(runtime).toContain('hosted dashboard availability claims');
    expect(readme).toContain('User validation evidence loop runtime');
    expect(readme).toContain('user-validation-evidence-loop.json');
    expect(testingStrategy).toContain('User Validation Evidence Loop Runtime v0.1');
    expect(acceptanceChecklist).toContain('User Validation Evidence Loop Runtime v0.1');
    expect(decisionLog).toContain('User validation evidence loop runtime');
    expect(devLog).toContain('User Validation Evidence Loop Runtime v0.1');

    await expectPath('docs/operations/user-validation-evidence-loop-runtime-v0.1.md');
  });

  it('records release readiness hygiene automation runtime without launch actions', async () => {
    const [
      runtime,
      readme,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog,
      packageJson
    ] = await Promise.all([
      readFile('docs/operations/release-readiness-hygiene-automation-runtime-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8'),
      readFile('package.json', 'utf8')
    ]);

    expect(runtime).toContain('Release Readiness Hygiene Automation Runtime v0.1');
    expect(runtime).toContain('release_readiness_hygiene_automation_runtime_implemented');
    expect(runtime).toContain('Product Backlog Prioritization v0.1 / Priority 5');
    expect(runtime).toContain('Implementation status: `implemented_minimal_runtime`');
    expect(runtime).toContain('Launch authorization status: `not_authorized`');
    expect(runtime).toContain('release-readiness-hygiene.json');
    expect(runtime).toContain('repoassure.release-readiness-hygiene.v1');
    expect(runtime).toContain('pnpm release:hygiene');
    expect(runtime).toContain('scripts/generate-release-hygiene-evidence.mjs');
    expect(runtime).toContain('release:check');
    expect(runtime).toContain('repo:hygiene');
    expect(runtime).toContain('sensitive-material-scan');
    expect(runtime).toContain('goal:audit');
    expect(runtime).toContain('package.json keeps `private: true`');
    expect(runtime).toContain('No npm publication was executed');
    expect(runtime).toContain('No GitHub release was executed');
    expect(runtime).toContain('No public launch or production marketing announcement was executed');
    expect(readme).toContain('Release readiness hygiene automation runtime');
    expect(readme).toContain('release-readiness-hygiene.json');
    expect(testingStrategy).toContain('Release Readiness Hygiene Automation Runtime v0.1');
    expect(acceptanceChecklist).toContain('Release Readiness Hygiene Automation Runtime v0.1');
    expect(decisionLog).toContain('Release readiness hygiene automation runtime');
    expect(devLog).toContain('Release Readiness Hygiene Automation Runtime v0.1');
    expect(packageJson).toContain('"release:hygiene": "node scripts/generate-release-hygiene-evidence.mjs"');

    await expectPath('docs/operations/release-readiness-hygiene-automation-runtime-v0.1.md');
  });

  it('records real target validation campaign summary without uploading target artifacts', async () => {
    const [
      operation,
      readme,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog,
      packageJson
    ] = await Promise.all([
      readFile('docs/operations/real-target-validation-campaign-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8'),
      readFile('package.json', 'utf8')
    ]);

    expect(operation).toContain('Real Target Repo Validation & Product Hardening Campaign v0.1');
    expect(operation).toContain('Status: campaign_executed_product_hardened');
    expect(operation).toContain('repoassure.validation-campaign-summary.v1');
    expect(operation).toContain('pnpm campaign:summarize');
    expect(operation).toContain('agent-reach');
    expect(operation).toContain('odinsight');
    expect(operation).toContain('openclaw-ui');
    expect(operation).toContain('Passed targets: `1`');
    expect(operation).toContain('Failed targets: `2`');
    expect(operation).toContain('browser requested but no browser artifacts were generated');
    expect(operation).toContain('No target repo material was uploaded');
    expect(operation).toContain('No npm publication was executed');
    expect(operation).toContain('No public launch or production marketing announcement was executed');
    expect(readme).toContain('Real Target Repo Validation Campaign v0.1');
    expect(readme).toContain('campaign-summary.json');
    expect(testingStrategy).toContain('Real Target Repo Validation Campaign v0.1');
    expect(acceptanceChecklist).toContain('Real Target Repo Validation Campaign v0.1');
    expect(decisionLog).toContain('Real target repo validation campaign');
    expect(devLog).toContain('Real Target Repo Validation Campaign v0.1');
    expect(packageJson).toContain('"campaign:summarize": "pnpm build:acceptance && node scripts/summarize-validation-campaign.mjs"');

    await expectPath('docs/operations/real-target-validation-campaign-v0.1.md');
  });

  it('records real target campaign follow-up hardening without uploading target artifacts', async () => {
    const [
      operation,
      readme,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog
    ] = await Promise.all([
      readFile('docs/operations/real-target-campaign-followup-hardening-v0.2.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(operation).toContain('Real Target Campaign Follow-up Hardening v0.2');
    expect(operation).toContain('Status: followup_hardening_implemented');
    expect(operation).toContain('Python/CLI environment prerequisites');
    expect(operation).toContain('agent-reach');
    expect(operation).toContain('openclaw-ui');
    expect(operation).toContain('parent pnpm workspace context');
    expect(operation).toContain('document_target_stack');
    expect(operation).toContain('No target repo material was uploaded');
    expect(operation).toContain('No npm publication was executed');
    expect(operation).toContain('No public launch or production marketing announcement was executed');
    expect(readme).toContain('Real Target Campaign Follow-up Hardening v0.2');
    expect(readme).toContain('Python/CLI environment prerequisites');
    expect(testingStrategy).toContain('Real Target Campaign Follow-up Hardening v0.2');
    expect(acceptanceChecklist).toContain('Real Target Campaign Follow-up Hardening v0.2');
    expect(decisionLog).toContain('Real target campaign follow-up hardening');
    expect(devLog).toContain('Real Target Campaign Follow-up Hardening v0.2');

    await expectPath('docs/operations/real-target-campaign-followup-hardening-v0.2.md');
  });

  it('records real target validation campaign v0.2 execution and product follow-up closure', async () => {
    const [
      operation,
      readme,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog
    ] = await Promise.all([
      readFile('docs/operations/real-target-validation-campaign-v0.2.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(operation).toContain('Real Target Validation Campaign v0.2');
    expect(operation).toContain('Status: campaign_executed_product_gap_closed');
    expect(operation).toContain('Passed targets: `1`');
    expect(operation).toContain('Blocked targets: `2`');
    expect(operation).toContain('Failed targets: `0`');
    expect(operation).toContain('agent-reach');
    expect(operation).toContain('odinsight');
    expect(operation).toContain('openclaw-ui');
    expect(operation).toContain('Node/Web app environment prerequisite');
    expect(operation).toContain('Prepare target app environment');
    expect(operation).toContain('v0.1 had 1 passed / 2 failed; v0.2 has 1 passed / 2 blocked / 0 failed');
    expect(operation).toContain('No target repo material was uploaded');
    expect(operation).toContain('No npm publication was executed');
    expect(operation).toContain('No public launch or production marketing announcement was executed');
    expect(readme).toContain('Real Target Validation Campaign v0.2');
    expect(readme).toContain('Prepare target app environment');
    expect(testingStrategy).toContain('Real Target Validation Campaign v0.2');
    expect(acceptanceChecklist).toContain('Real Target Validation Campaign v0.2');
    expect(decisionLog).toContain('Real target validation campaign v0.2');
    expect(devLog).toContain('Real Target Validation Campaign v0.2');

    await expectPath('docs/operations/real-target-validation-campaign-v0.2.md');
  });

  it('records product validation action queue runtime without launch actions', async () => {
    const [
      operation,
      readme,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog
    ] = await Promise.all([
      readFile('docs/operations/product-validation-action-queue-runtime-v0.3.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(operation).toContain('Product Validation Action Queue Runtime v0.3');
    expect(operation).toContain('Status: product_validation_action_queue_implemented');
    expect(operation).toContain('prioritizedActionQueue');
    expect(operation).toContain('P0-improve-repair-plan');
    expect(operation).toContain('P1-document-target-stack');
    expect(operation).toContain('ownerSurface');
    expect(operation).toContain('recommendedVerification');
    expect(operation).toContain('evidenceRefs');
    expect(operation).toContain('repoassure.validation-campaign-summary.v1');
    expect(operation).toContain('No target repo material was uploaded');
    expect(operation).toContain('No npm publication was executed');
    expect(operation).toContain('No GitHub release was executed');
    expect(operation).toContain('No public launch or production marketing announcement was executed');
    expect(readme).toContain('Product Validation Action Queue Runtime v0.3');
    expect(readme).toContain('prioritizedActionQueue');
    expect(testingStrategy).toContain('Product Validation Action Queue Runtime v0.3');
    expect(acceptanceChecklist).toContain('Product Validation Action Queue Runtime v0.3');
    expect(decisionLog).toContain('Product validation action queue runtime');
    expect(devLog).toContain('Product Validation Action Queue Runtime v0.3');

    await expectPath('docs/operations/product-validation-action-queue-runtime-v0.3.md');
  });

  it('records AI IDE repair execution playbook runtime without target repo mutations or launch actions', async () => {
    const [
      operation,
      readme,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog,
      packageJson,
      script
    ] = await Promise.all([
      readFile('docs/operations/ai-ide-repair-execution-playbook-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8'),
      readFile('package.json', 'utf8'),
      readFile('scripts/generate-ai-ide-repair-playbook.mjs', 'utf8')
    ]);

    expect(operation).toContain('AI IDE Repair Execution Playbook v0.1');
    expect(operation).toContain('Status: ai_ide_repair_execution_playbook_runtime_implemented');
    expect(operation).toContain('repoassure.ai-ide-repair-execution-playbook.v1');
    expect(operation).toContain('ai-ide-repair-playbook.json');
    expect(operation).toContain('ai-ide-repair-playbook.md');
    expect(operation).toContain('prioritizedActionQueue');
    expect(operation).toContain('ai-ide-handoff-package.json');
    expect(operation).toContain('repair-task-package.json');
    expect(operation).toContain('user-validation-evidence-loop.json');
    expect(operation).toContain('packages/acceptance/src/ai-ide-repair-playbook.ts');
    expect(operation).toContain('@hardening-mcp/acceptance/ai-ide-repair-playbook');
    expect(operation).toContain('pnpm playbook:generate');
    expect(operation).toContain('No target repo material was uploaded');
    expect(operation).toContain('No target repo branch, commit, pull request, issue, or advisory was created');
    expect(operation).toContain('No npm publication was executed');
    expect(operation).toContain('No GitHub release was executed');
    expect(operation).toContain('No public launch or production marketing announcement was executed');
    expect(readme).toContain('AI IDE Repair Execution Playbook v0.1');
    expect(readme).toContain('ai-ide-repair-playbook.json');
    expect(testingStrategy).toContain('AI IDE Repair Execution Playbook v0.1');
    expect(acceptanceChecklist).toContain('AI IDE Repair Execution Playbook v0.1');
    expect(decisionLog).toContain('AI IDE repair execution playbook runtime');
    expect(devLog).toContain('AI IDE Repair Execution Playbook v0.1');
    expect(packageJson).toContain('"playbook:generate": "pnpm build:acceptance && node scripts/generate-ai-ide-repair-playbook.mjs"');
    expect(script).toContain('writeAiIdeRepairExecutionPlaybook');
    expect(script).toContain('--campaign-summary');
    expect(script).toContain('--output');

    await expectPath('docs/operations/ai-ide-repair-execution-playbook-v0.1.md');
  });

  it('records AI IDE playbook real campaign consumption validation without target repo mutations or launch actions', async () => {
    const [
      operation,
      readme,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog
    ] = await Promise.all([
      readFile('docs/operations/ai-ide-playbook-real-campaign-consumption-validation-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(operation).toContain('AI IDE Playbook Real Campaign Consumption Validation v0.1');
    expect(operation).toContain('Status: ai_ide_playbook_real_campaign_consumption_validated');
    expect(operation).toContain('campaignContext.targetStatusMatrix');
    expect(operation).toContain('targetContexts');
    expect(operation).toContain('aiIdeConsumptionChecklist');
    expect(operation).toContain('passed / blocked / failed');
    expect(operation).toContain('environment blocker');
    expect(operation).toContain('P0-improve-repair-plan');
    expect(operation).toContain('P1-document-target-stack');
    expect(operation).toContain('pnpm playbook:generate');
    expect(operation).toContain('tests/integration/playbook-generate.test.ts');
    expect(operation).toContain('No target repo material was uploaded');
    expect(operation).toContain('No target repo branch, commit, pull request, issue, or advisory was created');
    expect(operation).toContain('No npm publication was executed');
    expect(operation).toContain('No GitHub release was executed');
    expect(operation).toContain('No public launch or production marketing announcement was executed');
    expect(readme).toContain('AI IDE Playbook Real Campaign Consumption Validation v0.1');
    expect(readme).toContain('campaignContext.targetStatusMatrix');
    expect(testingStrategy).toContain('AI IDE Playbook Real Campaign Consumption Validation v0.1');
    expect(acceptanceChecklist).toContain('AI IDE Playbook Real Campaign Consumption Validation v0.1');
    expect(decisionLog).toContain('AI IDE playbook real campaign consumption validation');
    expect(devLog).toContain('AI IDE Playbook Real Campaign Consumption Validation v0.1');

    await expectPath('docs/operations/ai-ide-playbook-real-campaign-consumption-validation-v0.1.md');
  });

  it('records AI IDE playbook consumption dry-run report without target repo mutations or launch actions', async () => {
    const [
      operation,
      readme,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog,
      packageJson,
      script
    ] = await Promise.all([
      readFile('docs/operations/ai-ide-playbook-consumption-dry-run-report-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8'),
      readFile('package.json', 'utf8'),
      readFile('scripts/generate-ai-ide-playbook-consumption-report.mjs', 'utf8')
    ]);

    expect(operation).toContain('AI IDE Playbook Consumption Dry-Run Report v0.1');
    expect(operation).toContain('Status: ai_ide_playbook_consumption_dry_run_report_implemented');
    expect(operation).toContain('ai-ide-playbook-consumption-report.json');
    expect(operation).toContain('ai-ide-playbook-consumption-report.md');
    expect(operation).toContain('repoassure.ai-ide-playbook-consumption-report.v1');
    expect(operation).toContain('pnpm playbook:consume');
    expect(operation).toContain('campaignUnderstanding');
    expect(operation).toContain('repairTaskUnderstanding');
    expect(operation).toContain('readOrderCompliance');
    expect(operation).toContain('dryRunDecision.blockedActions');
    expect(operation).toContain('tests/integration/playbook-consume.test.ts');
    expect(operation).toContain('No target repo material was uploaded');
    expect(operation).toContain('No target repo branch, commit, pull request, issue, advisory, or file mutation was created');
    expect(operation).toContain('No npm publication was executed');
    expect(operation).toContain('No GitHub release was executed');
    expect(operation).toContain('No public launch or production marketing announcement was executed');
    expect(readme).toContain('AI IDE Playbook Consumption Dry-Run Report v0.1');
    expect(readme).toContain('ai-ide-playbook-consumption-report.json');
    expect(testingStrategy).toContain('AI IDE Playbook Consumption Dry-Run Report v0.1');
    expect(acceptanceChecklist).toContain('AI IDE Playbook Consumption Dry-Run Report v0.1');
    expect(decisionLog).toContain('AI IDE playbook consumption dry-run report');
    expect(devLog).toContain('AI IDE Playbook Consumption Dry-Run Report v0.1');
    expect(packageJson).toContain('"playbook:consume": "pnpm build:acceptance && node scripts/generate-ai-ide-playbook-consumption-report.mjs"');
    expect(script).toContain('writeAiIdePlaybookConsumptionReport');
    expect(script).toContain('--playbook');
    expect(script).toContain('--output');

    await expectPath('docs/operations/ai-ide-playbook-consumption-dry-run-report-v0.1.md');
  });

  it('records AI IDE repair decision package without target repo mutations or launch actions', async () => {
    const [
      operation,
      readme,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog,
      packageJson,
      script
    ] = await Promise.all([
      readFile('docs/operations/ai-ide-repair-decision-package-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8'),
      readFile('package.json', 'utf8'),
      readFile('scripts/generate-ai-ide-repair-decision-package.mjs', 'utf8')
    ]);

    expect(operation).toContain('AI IDE Repair Decision Package v0.1');
    expect(operation).toContain('Status: ai_ide_repair_decision_package_implemented');
    expect(operation).toContain('ai-ide-repair-decision-package.json');
    expect(operation).toContain('ai-ide-repair-decision-package.md');
    expect(operation).toContain('repoassure.ai-ide-repair-decision-package.v1');
    expect(operation).toContain('pnpm playbook:decide');
    expect(operation).toContain('manual_repair_candidate');
    expect(operation).toContain('environment_prerequisite');
    expect(operation).toContain('repoassure_product_improvement');
    expect(operation).toContain('targetReviewSummary');
    expect(operation).toContain('maintainerDecisionChecklist');
    expect(operation).toContain('tests/integration/playbook-decide.test.ts');
    expect(operation).toContain('No target repo material was uploaded');
    expect(operation).toContain('No target repo branch, commit, pull request, issue, advisory, or file mutation was created');
    expect(operation).toContain('No npm publication was executed');
    expect(operation).toContain('No GitHub release was executed');
    expect(operation).toContain('No public launch or production marketing announcement was executed');
    expect(readme).toContain('AI IDE Repair Decision Package v0.1');
    expect(readme).toContain('ai-ide-repair-decision-package.json');
    expect(testingStrategy).toContain('AI IDE Repair Decision Package v0.1');
    expect(acceptanceChecklist).toContain('AI IDE Repair Decision Package v0.1');
    expect(decisionLog).toContain('AI IDE repair decision package');
    expect(devLog).toContain('AI IDE Repair Decision Package v0.1');
    expect(packageJson).toContain('"playbook:decide": "pnpm build:acceptance && node scripts/generate-ai-ide-repair-decision-package.mjs"');
    expect(script).toContain('writeAiIdeRepairDecisionPackage');
    expect(script).toContain('--consumption-report');
    expect(script).toContain('--output');

    await expectPath('docs/operations/ai-ide-repair-decision-package-v0.1.md');
  });

  it('records AI IDE repair approval receipt without target repo mutations or launch actions', async () => {
    const [
      operation,
      readme,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog,
      packageJson,
      script
    ] = await Promise.all([
      readFile('docs/operations/ai-ide-repair-approval-receipt-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8'),
      readFile('package.json', 'utf8'),
      readFile('scripts/generate-ai-ide-repair-approval-receipt.mjs', 'utf8')
    ]);

    expect(operation).toContain('AI IDE Repair Approval Receipt v0.1');
    expect(operation).toContain('Status: ai_ide_repair_approval_receipt_implemented');
    expect(operation).toContain('ai-ide-repair-approval-receipt.json');
    expect(operation).toContain('ai-ide-repair-approval-receipt.md');
    expect(operation).toContain('repoassure.ai-ide-repair-approval-receipt.v1');
    expect(operation).toContain('pnpm playbook:approve');
    expect(operation).toContain('approve');
    expect(operation).toContain('reject');
    expect(operation).toContain('defer');
    expect(operation).toContain('accept_risk');
    expect(operation).toContain('approvalItems');
    expect(operation).toContain('maintainerApprovalChecklist');
    expect(operation).toContain('tests/integration/playbook-approve.test.ts');
    expect(operation).toContain('No target repo material was uploaded');
    expect(operation).toContain('No target repo branch, commit, pull request, issue, advisory, or file mutation was created');
    expect(operation).toContain('No npm publication was executed');
    expect(operation).toContain('No GitHub release was executed');
    expect(operation).toContain('No public launch or production marketing announcement was executed');
    expect(readme).toContain('AI IDE Repair Approval Receipt v0.1');
    expect(readme).toContain('ai-ide-repair-approval-receipt.json');
    expect(testingStrategy).toContain('AI IDE Repair Approval Receipt v0.1');
    expect(acceptanceChecklist).toContain('AI IDE Repair Approval Receipt v0.1');
    expect(decisionLog).toContain('AI IDE repair approval receipt');
    expect(devLog).toContain('AI IDE Repair Approval Receipt v0.1');
    expect(packageJson).toContain('"playbook:approve": "pnpm build:acceptance && node scripts/generate-ai-ide-repair-approval-receipt.mjs"');
    expect(script).toContain('writeAiIdeRepairApprovalReceipt');
    expect(script).toContain('--decision-package');
    expect(script).toContain('--approvals');
    expect(script).toContain('--output');

    await expectPath('docs/operations/ai-ide-repair-approval-receipt-v0.1.md');
  });

  it('records AI IDE approved repair execution plan without target repo mutations or launch actions', async () => {
    const [
      operation,
      readme,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog,
      packageJson,
      script
    ] = await Promise.all([
      readFile('docs/operations/ai-ide-approved-repair-execution-plan-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8'),
      readFile('package.json', 'utf8'),
      readFile('scripts/generate-ai-ide-approved-repair-execution-plan.mjs', 'utf8')
    ]);

    expect(operation).toContain('AI IDE Approved Repair Execution Plan v0.1');
    expect(operation).toContain('Status: ai_ide_approved_repair_execution_plan_implemented');
    expect(operation).toContain('ai-ide-approved-repair-execution-plan.json');
    expect(operation).toContain('ai-ide-approved-repair-execution-plan.md');
    expect(operation).toContain('repoassure.ai-ide-approved-repair-execution-plan.v1');
    expect(operation).toContain('pnpm playbook:plan-approved');
    expect(operation).toContain('approvedExecutionItems');
    expect(operation).toContain('excludedApprovalItems');
    expect(operation).toContain('executionChecklist');
    expect(operation).toContain('rollbackAndReviewChecklist');
    expect(operation).toContain('tests/integration/playbook-plan-approved.test.ts');
    expect(operation).toContain('No target repo material was uploaded');
    expect(operation).toContain('No target repo branch, commit, pull request, issue, advisory, or file mutation was created');
    expect(operation).toContain('No npm publication was executed');
    expect(operation).toContain('No GitHub release was executed');
    expect(operation).toContain('No public launch or production marketing announcement was executed');
    expect(readme).toContain('AI IDE Approved Repair Execution Plan v0.1');
    expect(readme).toContain('ai-ide-approved-repair-execution-plan.json');
    expect(testingStrategy).toContain('AI IDE Approved Repair Execution Plan v0.1');
    expect(acceptanceChecklist).toContain('AI IDE Approved Repair Execution Plan v0.1');
    expect(decisionLog).toContain('AI IDE approved repair execution plan');
    expect(devLog).toContain('AI IDE Approved Repair Execution Plan v0.1');
    expect(packageJson).toContain('"playbook:plan-approved": "pnpm build:acceptance && node scripts/generate-ai-ide-approved-repair-execution-plan.mjs"');
    expect(script).toContain('writeAiIdeApprovedRepairExecutionPlan');
    expect(script).toContain('--approval-receipt');
    expect(script).toContain('--output');

    await expectPath('docs/operations/ai-ide-approved-repair-execution-plan-v0.1.md');
  });

  it('records AI IDE repair execution evidence report without target repo mutations or launch actions', async () => {
    const [
      operation,
      readme,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog,
      packageJson,
      script
    ] = await Promise.all([
      readFile('docs/operations/ai-ide-repair-execution-evidence-report-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8'),
      readFile('package.json', 'utf8'),
      readFile('scripts/generate-ai-ide-repair-execution-evidence-report.mjs', 'utf8')
    ]);

    expect(operation).toContain('AI IDE Repair Execution Evidence Report v0.1');
    expect(operation).toContain('Status: ai_ide_repair_execution_evidence_report_implemented');
    expect(operation).toContain('ai-ide-repair-execution-evidence-report.json');
    expect(operation).toContain('ai-ide-repair-execution-evidence-report.md');
    expect(operation).toContain('repoassure.ai-ide-repair-execution-evidence-report.v1');
    expect(operation).toContain('pnpm playbook:evidence');
    expect(operation).toContain('itemReports');
    expect(operation).toContain('boundaryReport');
    expect(operation).toContain('executionEvidenceChecklist');
    expect(operation).toContain('rollbackAndReviewChecklist');
    expect(operation).toContain('tests/integration/playbook-evidence.test.ts');
    expect(operation).toContain('No target repo material was uploaded');
    expect(operation).toContain('No target repo branch, commit, pull request, issue, advisory, or file mutation was created');
    expect(operation).toContain('No npm publication was executed');
    expect(operation).toContain('No GitHub release was executed');
    expect(operation).toContain('No public launch or production marketing announcement was executed');
    expect(readme).toContain('AI IDE Repair Execution Evidence Report v0.1');
    expect(readme).toContain('ai-ide-repair-execution-evidence-report.json');
    expect(testingStrategy).toContain('AI IDE Repair Execution Evidence Report v0.1');
    expect(acceptanceChecklist).toContain('AI IDE Repair Execution Evidence Report v0.1');
    expect(decisionLog).toContain('AI IDE repair execution evidence report');
    expect(devLog).toContain('AI IDE Repair Execution Evidence Report v0.1');
    expect(packageJson).toContain('"playbook:evidence": "pnpm build:acceptance && node scripts/generate-ai-ide-repair-execution-evidence-report.mjs"');
    expect(script).toContain('writeAiIdeRepairExecutionEvidenceReport');
    expect(script).toContain('--execution-plan');
    expect(script).toContain('--evidence');
    expect(script).toContain('--output');

    await expectPath('docs/operations/ai-ide-repair-execution-evidence-report-v0.1.md');
  });

  it('records AI IDE repair evidence end-to-end campaign fixture without target repo mutations or launch actions', async () => {
    const [
      operation,
      readme,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog,
      fixture,
      integrationTest
    ] = await Promise.all([
      readFile('docs/operations/ai-ide-repair-evidence-e2e-campaign-fixture-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8'),
      readFile('fixtures/ai-ide-repair-evidence-campaign/campaign-summary.json', 'utf8'),
      readFile('tests/integration/playbook-e2e-repair-evidence.test.ts', 'utf8')
    ]);

    expect(operation).toContain('AI IDE Repair Evidence End-to-End Campaign Fixture v0.1');
    expect(operation).toContain('Status: ai_ide_repair_evidence_e2e_campaign_fixture_validated');
    expect(operation).toContain('fixtures/ai-ide-repair-evidence-campaign/campaign-summary.json');
    expect(operation).toContain('tests/integration/playbook-e2e-repair-evidence.test.ts');
    expect(operation).toContain('pnpm playbook:generate');
    expect(operation).toContain('pnpm playbook:consume');
    expect(operation).toContain('pnpm playbook:decide');
    expect(operation).toContain('pnpm playbook:approve');
    expect(operation).toContain('pnpm playbook:plan-approved');
    expect(operation).toContain('pnpm playbook:evidence');
    expect(operation).toContain('ai-ide-repair-playbook.json');
    expect(operation).toContain('ai-ide-playbook-consumption-report.json');
    expect(operation).toContain('ai-ide-repair-decision-package.json');
    expect(operation).toContain('ai-ide-repair-approval-receipt.json');
    expect(operation).toContain('ai-ide-approved-repair-execution-plan.json');
    expect(operation).toContain('ai-ide-repair-execution-evidence-report.json');
    expect(operation).toContain('No target repo material was uploaded');
    expect(operation).toContain('No target repo branch, commit, pull request, issue, advisory, or file mutation was created');
    expect(operation).toContain('No public launch or production marketing announcement was executed');
    expect(readme).toContain('AI IDE Repair Evidence End-to-End Campaign Fixture v0.1');
    expect(readme).toContain('fixtures/ai-ide-repair-evidence-campaign/campaign-summary.json');
    expect(testingStrategy).toContain('AI IDE Repair Evidence End-to-End Campaign Fixture v0.1');
    expect(acceptanceChecklist).toContain('AI IDE Repair Evidence End-to-End Campaign Fixture v0.1');
    expect(decisionLog).toContain('AI IDE repair evidence end-to-end campaign fixture');
    expect(devLog).toContain('AI IDE Repair Evidence End-to-End Campaign Fixture v0.1');
    expect(fixture).toContain('"id": "P1-fix-target-regression"');
    expect(fixture).toContain('"ownerSurface": "maintainer_or_target_repo"');
    expect(fixture).not.toContain('secret-value');
    expect(integrationTest).toContain('playbook:generate');
    expect(integrationTest).toContain('playbook:evidence');
    expect(integrationTest).toContain('secret-value');

    await expectPath('docs/operations/ai-ide-repair-evidence-e2e-campaign-fixture-v0.1.md');
  });

  it('records AI IDE repair evidence bundle manifest without target repo mutations or launch actions', async () => {
    const [
      operation,
      readme,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog,
      packageJson,
      script,
      unitTest,
      integrationTest
    ] = await Promise.all([
      readFile('docs/operations/ai-ide-repair-evidence-bundle-manifest-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8'),
      readFile('package.json', 'utf8'),
      readFile('scripts/generate-ai-ide-repair-evidence-bundle-manifest.mjs', 'utf8'),
      readFile('tests/unit/ai-ide-repair-evidence-bundle-manifest.test.ts', 'utf8'),
      readFile('tests/integration/playbook-bundle.test.ts', 'utf8')
    ]);

    expect(operation).toContain('AI IDE Repair Evidence Bundle Manifest v0.1');
    expect(operation).toContain('Status: ai_ide_repair_evidence_bundle_manifest_implemented');
    expect(operation).toContain('ai-ide-repair-evidence-bundle-manifest.json');
    expect(operation).toContain('ai-ide-repair-evidence-bundle-manifest.md');
    expect(operation).toContain('repoassure.ai-ide-repair-evidence-bundle-manifest.v1');
    expect(operation).toContain('pnpm playbook:bundle');
    expect(operation).toContain('artifact reading order');
    expect(operation).toContain('SHA-256');
    expect(operation).toContain('verified_pending_maintainer_review');
    expect(operation).toContain('tests/unit/ai-ide-repair-evidence-bundle-manifest.test.ts');
    expect(operation).toContain('tests/integration/playbook-bundle.test.ts');
    expect(operation).toContain('No target repo material was uploaded');
    expect(operation).toContain('No target repo branch, commit, pull request, issue, advisory, or file mutation was created');
    expect(operation).toContain('No public launch or production marketing announcement was executed');
    expect(readme).toContain('AI IDE Repair Evidence Bundle Manifest v0.1');
    expect(readme).toContain('ai-ide-repair-evidence-bundle-manifest.json');
    expect(testingStrategy).toContain('AI IDE Repair Evidence Bundle Manifest v0.1');
    expect(acceptanceChecklist).toContain('AI IDE Repair Evidence Bundle Manifest v0.1');
    expect(decisionLog).toContain('AI IDE repair evidence bundle manifest');
    expect(devLog).toContain('AI IDE Repair Evidence Bundle Manifest v0.1');
    expect(packageJson).toContain('"playbook:bundle": "pnpm build:acceptance && node scripts/generate-ai-ide-repair-evidence-bundle-manifest.mjs"');
    expect(script).toContain('writeAiIdeRepairEvidenceBundleManifest');
    expect(script).toContain('--playbook');
    expect(script).toContain('--evidence-report');
    expect(script).toContain('--output');
    expect(unitTest).toContain('repoassure.ai-ide-repair-evidence-bundle-manifest.v1');
    expect(integrationTest).toContain('playbook:bundle');

    await expectPath('docs/operations/ai-ide-repair-evidence-bundle-manifest-v0.1.md');
  });

  it('records AI IDE repair evidence bundle E2E automation without target repo mutations or launch actions', async () => {
    const [
      operation,
      readme,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog,
      script,
      unitTest,
      integrationTest,
      e2eTest
    ] = await Promise.all([
      readFile('docs/operations/ai-ide-repair-evidence-bundle-e2e-automation-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8'),
      readFile('scripts/generate-ai-ide-repair-evidence-bundle-manifest.mjs', 'utf8'),
      readFile('tests/unit/ai-ide-repair-evidence-bundle-manifest.test.ts', 'utf8'),
      readFile('tests/integration/playbook-bundle.test.ts', 'utf8'),
      readFile('tests/integration/playbook-e2e-repair-evidence.test.ts', 'utf8')
    ]);

    expect(operation).toContain('AI IDE Repair Evidence Bundle E2E Automation v0.1');
    expect(operation).toContain('Status: ai_ide_repair_evidence_bundle_e2e_automation_implemented');
    expect(operation).toContain('pnpm playbook:bundle -- --from-dir <dir>');
    expect(operation).toContain('campaign-summary -> playbook -> consume -> decide -> approve -> plan-approved -> evidence -> bundle manifest');
    expect(operation).toContain('ai-ide-repair-evidence-bundle-manifest.json');
    expect(operation).toContain('ai-ide-repair-evidence-bundle-manifest.md');
    expect(operation).toContain('tests/integration/playbook-e2e-repair-evidence.test.ts');
    expect(operation).toContain('No target repo material was uploaded');
    expect(operation).toContain('No target repo branch, commit, pull request, issue, advisory, or file mutation was created');
    expect(operation).toContain('No public launch or production marketing announcement was executed');
    expect(readme).toContain('AI IDE Repair Evidence Bundle E2E Automation v0.1');
    expect(readme).toContain('pnpm playbook:bundle -- --from-dir <dir>');
    expect(testingStrategy).toContain('AI IDE Repair Evidence Bundle E2E Automation v0.1');
    expect(acceptanceChecklist).toContain('AI IDE Repair Evidence Bundle E2E Automation v0.1');
    expect(decisionLog).toContain('AI IDE repair evidence bundle E2E automation');
    expect(devLog).toContain('AI IDE Repair Evidence Bundle E2E Automation v0.1');
    expect(script).toContain('--from-dir');
    expect(script).toContain('writeAiIdeRepairEvidenceBundleManifestFromDirectory');
    expect(unitTest).toContain('writeAiIdeRepairEvidenceBundleManifestFromDirectory');
    expect(integrationTest).toContain('--from-dir');
    expect(e2eTest).toContain('ai-ide-repair-evidence-bundle-manifest.json');

    await expectPath('docs/operations/ai-ide-repair-evidence-bundle-e2e-automation-v0.1.md');
  });

  it('records AI IDE repair evidence bundle consumer contract without target repo mutations or launch actions', async () => {
    const [
      adr,
      adrIndex,
      operation,
      readme,
      prd,
      spec,
      plan,
      architecture,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog,
      packageJson,
      acceptancePackageJson,
      compatibility,
      indexSource,
      script,
      unitTest,
      integrationTest
    ] = await Promise.all([
      readFile('docs/adr/0025-ai-ide-repair-evidence-consumer-contract.md', 'utf8'),
      readFile('docs/adr/README.md', 'utf8'),
      readFile('docs/operations/ai-ide-repair-evidence-consumer-contract-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/PRD.md', 'utf8'),
      readFile('docs/SPEC.md', 'utf8'),
      readFile('docs/PLAN.md', 'utf8'),
      readFile('docs/architecture/overview.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8'),
      readFile('package.json', 'utf8'),
      readFile('packages/acceptance/package.json', 'utf8'),
      readFile('packages/acceptance/src/compatibility.ts', 'utf8'),
      readFile('packages/acceptance/src/index.ts', 'utf8'),
      readFile('scripts/generate-ai-ide-repair-evidence-consumer-contract.mjs', 'utf8'),
      readFile('tests/unit/ai-ide-repair-evidence-consumer-contract.test.ts', 'utf8'),
      readFile('tests/integration/playbook-contract.test.ts', 'utf8')
    ]);

    expect(adr).toContain('ADR-0025: AI IDE Repair Evidence Bundle Consumer Contract');
    expect(adr).toContain('consumer contract');
    expect(adr).toContain('does not authorize target repo mutation');
    expect(adrIndex).toContain('[0025](0025-ai-ide-repair-evidence-consumer-contract.md)');
    expect(operation).toContain('AI IDE Repair Evidence Bundle Consumer Contract v0.1');
    expect(operation).toContain('Status: ai_ide_repair_evidence_consumer_contract_implemented');
    expect(operation).toContain('ai-ide-repair-evidence-consumer-contract.json');
    expect(operation).toContain('ai-ide-repair-evidence-consumer-contract.md');
    expect(operation).toContain('repoassure.ai-ide-repair-evidence-consumer-contract.v1');
    expect(operation).toContain('pnpm playbook:contract');
    expect(operation).toContain('artifactReadSequence');
    expect(operation).toContain('verificationChecklist');
    expect(operation).toContain('maintainerReviewBoundary');
    expect(operation).toContain('No target repo material was uploaded');
    expect(operation).toContain('No target repo branch, commit, pull request, issue, advisory, or file mutation was created');
    expect(operation).toContain('No public launch or production marketing announcement was executed');
    expect(readme).toContain('AI IDE Repair Evidence Bundle Consumer Contract v0.1');
    expect(readme).toContain('pnpm playbook:contract -- --from-dir <dir>');
    expect(prd).toContain('AI IDE Repair Evidence Bundle Consumer Contract v0.1');
    expect(spec).toContain('playbook:contract');
    expect(plan).toContain('AI IDE Repair Evidence Bundle Consumer Contract v0.1');
    expect(architecture).toContain('ADR-0025');
    expect(testingStrategy).toContain('AI IDE Repair Evidence Bundle Consumer Contract v0.1');
    expect(acceptanceChecklist).toContain('AI IDE Repair Evidence Bundle Consumer Contract v0.1');
    expect(decisionLog).toContain('AI IDE repair evidence bundle consumer contract');
    expect(devLog).toContain('AI IDE Repair Evidence Bundle Consumer Contract v0.1');
    expect(packageJson).toContain('"playbook:contract": "pnpm build:acceptance && node scripts/generate-ai-ide-repair-evidence-consumer-contract.mjs"');
    expect(acceptancePackageJson).toContain('"./ai-ide-repair-evidence-consumer-contract"');
    expect(compatibility).toContain('ai-ide-repair-evidence-consumer-contract');
    expect(indexSource).toContain('buildAiIdeRepairEvidenceConsumerContract');
    expect(script).toContain('writeAiIdeRepairEvidenceConsumerContractFromDirectory');
    expect(script).toContain('--manifest');
    expect(script).toContain('--from-dir');
    expect(unitTest).toContain('repoassure.ai-ide-repair-evidence-consumer-contract.v1');
    expect(integrationTest).toContain('playbook:contract');

    await expectPath('docs/adr/0025-ai-ide-repair-evidence-consumer-contract.md');
    await expectPath('docs/operations/ai-ide-repair-evidence-consumer-contract-v0.1.md');
  });

  it('records AI IDE repair execution replay readiness without target repo mutations or launch actions', async () => {
    const [
      adr,
      adrIndex,
      operation,
      readme,
      prd,
      spec,
      plan,
      architecture,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog,
      packageJson,
      acceptancePackageJson,
      compatibility,
      indexSource,
      script,
      unitTest,
      integrationTest
    ] = await Promise.all([
      readFile('docs/adr/0026-ai-ide-repair-execution-replay-readiness.md', 'utf8'),
      readFile('docs/adr/README.md', 'utf8'),
      readFile('docs/operations/ai-ide-repair-execution-replay-readiness-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/PRD.md', 'utf8'),
      readFile('docs/SPEC.md', 'utf8'),
      readFile('docs/PLAN.md', 'utf8'),
      readFile('docs/architecture/overview.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8'),
      readFile('package.json', 'utf8'),
      readFile('packages/acceptance/package.json', 'utf8'),
      readFile('packages/acceptance/src/compatibility.ts', 'utf8'),
      readFile('packages/acceptance/src/index.ts', 'utf8'),
      readFile('scripts/generate-ai-ide-repair-execution-replay-readiness.mjs', 'utf8'),
      readFile('tests/unit/ai-ide-repair-execution-replay-readiness.test.ts', 'utf8'),
      readFile('tests/integration/playbook-replay.test.ts', 'utf8')
    ]);

    expect(adr).toContain('ADR-0026: AI IDE Repair Execution Replay Readiness');
    expect(adr).toContain('replay readiness');
    expect(adr).toContain('does not authorize target repo mutation');
    expect(adrIndex).toContain('[0026](0026-ai-ide-repair-execution-replay-readiness.md)');
    expect(operation).toContain('AI IDE Repair Execution Replay Readiness v0.1');
    expect(operation).toContain('Status: ai_ide_repair_execution_replay_readiness_implemented');
    expect(operation).toContain('ai-ide-repair-execution-replay-readiness.json');
    expect(operation).toContain('ai-ide-repair-execution-replay-readiness.md');
    expect(operation).toContain('repoassure.ai-ide-repair-execution-replay-readiness.v1');
    expect(operation).toContain('pnpm playbook:replay');
    expect(operation).toContain('artifactReplay');
    expect(operation).toContain('verificationReplay');
    expect(operation).toContain('boundaryReplay');
    expect(operation).toContain('No target repo material was uploaded');
    expect(operation).toContain('No target repo branch, commit, pull request, issue, advisory, or file mutation was created');
    expect(operation).toContain('No public launch or production marketing announcement was executed');
    expect(readme).toContain('AI IDE Repair Execution Replay Readiness v0.1');
    expect(readme).toContain('pnpm playbook:replay -- --from-dir <dir>');
    expect(prd).toContain('AI IDE Repair Execution Replay Readiness v0.1');
    expect(spec).toContain('playbook:replay');
    expect(plan).toContain('AI IDE Repair Execution Replay Readiness v0.1');
    expect(architecture).toContain('ADR-0026');
    expect(testingStrategy).toContain('AI IDE Repair Execution Replay Readiness v0.1');
    expect(acceptanceChecklist).toContain('AI IDE Repair Execution Replay Readiness v0.1');
    expect(decisionLog).toContain('AI IDE repair execution replay readiness');
    expect(devLog).toContain('AI IDE Repair Execution Replay Readiness v0.1');
    expect(packageJson).toContain('"playbook:replay": "pnpm build:acceptance && node scripts/generate-ai-ide-repair-execution-replay-readiness.mjs"');
    expect(acceptancePackageJson).toContain('"./ai-ide-repair-execution-replay-readiness"');
    expect(compatibility).toContain('ai-ide-repair-execution-replay-readiness');
    expect(indexSource).toContain('buildAiIdeRepairExecutionReplayReadiness');
    expect(script).toContain('writeAiIdeRepairExecutionReplayReadinessFromDirectory');
    expect(script).toContain('--contract');
    expect(script).toContain('--from-dir');
    expect(unitTest).toContain('repoassure.ai-ide-repair-execution-replay-readiness.v1');
    expect(integrationTest).toContain('playbook:replay');

    await expectPath('docs/adr/0026-ai-ide-repair-execution-replay-readiness.md');
    await expectPath('docs/operations/ai-ide-repair-execution-replay-readiness-v0.1.md');
  });

  it('records AI IDE repair replay real campaign validation without target repo mutations or launch actions', async () => {
    const [
      adr,
      adrIndex,
      operation,
      readme,
      prd,
      spec,
      plan,
      architecture,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog,
      e2eTest,
      replaySource,
      unitTest
    ] = await Promise.all([
      readFile('docs/adr/0027-ai-ide-repair-replay-real-campaign-validation.md', 'utf8'),
      readFile('docs/adr/README.md', 'utf8'),
      readFile('docs/operations/ai-ide-repair-replay-real-campaign-validation-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/PRD.md', 'utf8'),
      readFile('docs/SPEC.md', 'utf8'),
      readFile('docs/PLAN.md', 'utf8'),
      readFile('docs/architecture/overview.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8'),
      readFile('tests/integration/playbook-e2e-repair-evidence.test.ts', 'utf8'),
      readFile('packages/acceptance/src/ai-ide-repair-execution-replay-readiness.ts', 'utf8'),
      readFile('tests/unit/ai-ide-repair-execution-replay-readiness.test.ts', 'utf8')
    ]);

    expect(adr).toContain('ADR-0027: AI IDE Repair Replay Real Campaign Validation');
    expect(adr).toContain('real campaign replay validation');
    expect(adr).toContain('does not authorize target repo mutation');
    expect(adrIndex).toContain('[0027](0027-ai-ide-repair-replay-real-campaign-validation.md)');
    expect(operation).toContain('AI IDE Repair Replay Real Campaign Validation v0.1');
    expect(operation).toContain('Status: ai_ide_repair_replay_real_campaign_validation_implemented');
    expect(operation).toContain('campaign-summary -> playbook -> consume -> decide -> approve -> plan-approved -> evidence -> bundle -> contract -> replay');
    expect(operation).toContain('ai-ide-repair-evidence-consumer-contract.json');
    expect(operation).toContain('ai-ide-repair-execution-replay-readiness.json');
    expect(operation).toContain('No target repo material was uploaded');
    expect(operation).toContain('No target repo branch, commit, pull request, issue, advisory, or file mutation was created');
    expect(operation).toContain('No public launch or production marketing announcement was executed');
    expect(readme).toContain('AI IDE Repair Replay Real Campaign Validation v0.1');
    expect(prd).toContain('AI IDE Repair Replay Real Campaign Validation v0.1');
    expect(spec).toContain('bundle -> contract -> replay');
    expect(plan).toContain('AI IDE Repair Replay Real Campaign Validation v0.1');
    expect(architecture).toContain('ADR-0027');
    expect(testingStrategy).toContain('AI IDE Repair Replay Real Campaign Validation v0.1');
    expect(acceptanceChecklist).toContain('AI IDE Repair Replay Real Campaign Validation v0.1');
    expect(decisionLog).toContain('AI IDE repair replay real campaign validation');
    expect(devLog).toContain('AI IDE Repair Replay Real Campaign Validation v0.1');
    expect(e2eTest).toContain('playbook:contract');
    expect(e2eTest).toContain('playbook:replay');
    expect(e2eTest).toContain('ready_for_maintainer_replay_review');
    expect(replaySource).toContain('describesRedactionBoundary');
    expect(unitTest).toContain('sanitized-summary wording');

    await expectPath('docs/adr/0027-ai-ide-repair-replay-real-campaign-validation.md');
    await expectPath('docs/operations/ai-ide-repair-replay-real-campaign-validation-v0.1.md');
  });

  it('records target repo repair goal proposal package without authorizing target repo mutations', async () => {
    const [
      adr,
      adrIndex,
      operation,
      readme,
      prd,
      spec,
      plan,
      architecture,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog,
      packageJson,
      acceptancePackageJson,
      compatibility,
      indexSource,
      proposalSource,
      script,
      unitTest,
      integrationTest,
      e2eTest,
      typeSmoke
    ] = await Promise.all([
      readFile('docs/adr/0028-target-repo-repair-goal-proposal-package.md', 'utf8'),
      readFile('docs/adr/README.md', 'utf8'),
      readFile('docs/operations/target-repo-repair-goal-proposal-package-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/PRD.md', 'utf8'),
      readFile('docs/SPEC.md', 'utf8'),
      readFile('docs/PLAN.md', 'utf8'),
      readFile('docs/architecture/overview.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8'),
      readFile('package.json', 'utf8'),
      readFile('packages/acceptance/package.json', 'utf8'),
      readFile('packages/acceptance/src/compatibility.ts', 'utf8'),
      readFile('packages/acceptance/src/index.ts', 'utf8'),
      readFile('packages/acceptance/src/ai-ide-target-repo-repair-goal-proposal-package.ts', 'utf8'),
      readFile('scripts/generate-ai-ide-target-repo-repair-goal-proposal-package.mjs', 'utf8'),
      readFile('tests/unit/ai-ide-target-repo-repair-goal-proposal-package.test.ts', 'utf8'),
      readFile('tests/integration/playbook-proposal.test.ts', 'utf8'),
      readFile('tests/integration/playbook-e2e-repair-evidence.test.ts', 'utf8'),
      readFile('tests/type-smoke/acceptance-package-subpaths.ts', 'utf8')
    ]);

    expect(adr).toContain('ADR-0028: Target Repo Repair Goal Proposal Package');
    expect(adr).toContain('target repo repair goal proposal package');
    expect(adr).toContain('does not authorize target repo mutation');
    expect(adrIndex).toContain('[0028](0028-target-repo-repair-goal-proposal-package.md)');
    expect(operation).toContain('Target Repo Repair Goal Proposal Package v0.1');
    expect(operation).toContain('Status: target_repo_repair_goal_proposal_package_implemented');
    expect(operation).toContain('ai-ide-target-repo-repair-goal-proposal-package.json');
    expect(operation).toContain('ai-ide-target-repo-repair-goal-proposal-package.md');
    expect(operation).toContain('repoassure.ai-ide-target-repo-repair-goal-proposal-package.v1');
    expect(operation).toContain('pnpm playbook:proposal');
    expect(operation).toContain('No target repo material was uploaded');
    expect(operation).toContain('No target repo branch, commit, pull request, issue, advisory, or file mutation was created');
    expect(operation).toContain('No public launch or production marketing announcement was executed');
    expect(readme).toContain('Target Repo Repair Goal Proposal Package v0.1');
    expect(readme).toContain('pnpm playbook:proposal -- --from-dir <dir>');
    expect(prd).toContain('Target Repo Repair Goal Proposal Package v0.1');
    expect(spec).toContain('playbook:proposal');
    expect(plan).toContain('Target Repo Repair Goal Proposal Package v0.1');
    expect(architecture).toContain('ADR-0028');
    expect(testingStrategy).toContain('Target Repo Repair Goal Proposal Package v0.1');
    expect(acceptanceChecklist).toContain('Target Repo Repair Goal Proposal Package v0.1');
    expect(decisionLog).toContain('target repo repair goal proposal package');
    expect(devLog).toContain('Target Repo Repair Goal Proposal Package v0.1');
    expect(packageJson).toContain('"playbook:proposal": "pnpm build:acceptance && node scripts/generate-ai-ide-target-repo-repair-goal-proposal-package.mjs"');
    expect(acceptancePackageJson).toContain('"./ai-ide-target-repo-repair-goal-proposal-package"');
    expect(compatibility).toContain('ai-ide-target-repo-repair-goal-proposal-package');
    expect(indexSource).toContain('buildAiIdeTargetRepoRepairGoalProposalPackage');
    expect(proposalSource).toContain('ready_for_maintainer_goal_authorization');
    expect(proposalSource).toContain('does not authorize target repo mutation');
    expect(script).toContain('writeAiIdeTargetRepoRepairGoalProposalPackageFromDirectory');
    expect(script).toContain('--replay-readiness');
    expect(script).toContain('--from-dir');
    expect(unitTest).toContain('repoassure.ai-ide-target-repo-repair-goal-proposal-package.v1');
    expect(integrationTest).toContain('playbook:proposal');
    expect(e2eTest).toContain('playbook:proposal');
    expect(e2eTest).toContain('ready_for_maintainer_goal_authorization');
    expect(typeSmoke).toContain('ai-ide-target-repo-repair-goal-proposal-package');

    await expectPath('docs/adr/0028-target-repo-repair-goal-proposal-package.md');
    await expectPath('docs/operations/target-repo-repair-goal-proposal-package-v0.1.md');
  });

  it('records Autopilot-compatible documentation architecture without moving existing source documents', async () => {
    const [
      adr,
      adrIndex,
      prd,
      spec,
      design,
      plan,
      taxonomy,
      readme,
      architecture,
      testingStrategy,
      acceptanceChecklist,
      decisionLog,
      devLog
    ] = await Promise.all([
      readFile('docs/adr/0024-autopilot-compatible-documentation-architecture.md', 'utf8'),
      readFile('docs/adr/README.md', 'utf8'),
      readFile('docs/PRD.md', 'utf8'),
      readFile('docs/SPEC.md', 'utf8'),
      readFile('docs/DESIGN.md', 'utf8'),
      readFile('docs/PLAN.md', 'utf8'),
      readFile('docs/architecture/specs/docs-taxonomy-spec-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/architecture/overview.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(adr).toContain('ADR-0024: Autopilot-Compatible Documentation Architecture');
    expect(adr).toContain('Source-of-truth gateway');
    expect(adr).toContain('Do not move existing detailed documents');
    expect(adr).toContain('docs/PRD.md');
    expect(adr).toContain('docs/SPEC.md');
    expect(adr).toContain('docs/DESIGN.md');
    expect(adr).toContain('docs/PLAN.md');
    expect(adrIndex).toContain('[0024](0024-autopilot-compatible-documentation-architecture.md)');
    expect(prd).toContain('RepoAssure PRD Gateway');
    expect(prd).toContain('Product intent source-of-truth gateway');
    expect(prd).toContain('docs/product/specs/mvp-spec-v0.3.md');
    expect(prd).toContain('docs/product/strategy/commercialization-strategy-v0.1.md');
    expect(spec).toContain('RepoAssure SPEC Gateway');
    expect(spec).toContain('Solution and implementation boundary source-of-truth gateway');
    expect(spec).toContain('docs/architecture/specs/monorepo-structure-spec-v0.1.md');
    expect(spec).toContain('docs/architecture/specs/security-assurance-lane-spec-v0.1.md');
    expect(design).toContain('RepoAssure DESIGN Gateway');
    expect(design).toContain('Design source-of-truth gateway');
    expect(design).toContain('docs/design/design-system-v0.1.md');
    expect(plan).toContain('RepoAssure PLAN Gateway');
    expect(plan).toContain('Execution order source-of-truth gateway');
    expect(plan).toContain('Next Codex Goal');
    expect(plan).toContain('AI IDE Repair Evidence Bundle Consumer Contract v0.1');
    expect(taxonomy).toContain('Autopilot-compatible source-of-truth gateways');
    expect(taxonomy).toContain('`docs/PRD.md`');
    expect(taxonomy).toContain('`docs/SPEC.md`');
    expect(taxonomy).toContain('`docs/DESIGN.md`');
    expect(taxonomy).toContain('`docs/PLAN.md`');
    expect(taxonomy).toContain('Detailed documents remain in their existing canonical directories');
    expect(readme).toContain('Autopilot-compatible source-of-truth gateways');
    expect(architecture).toContain('ADR-0024');
    expect(architecture).toContain('Source-of-truth gateways');
    expect(testingStrategy).toContain('Autopilot-Compatible Documentation Architecture v0.1');
    expect(acceptanceChecklist).toContain('Autopilot-Compatible Documentation Architecture v0.1');
    expect(decisionLog).toContain('Autopilot-compatible documentation architecture');
    expect(devLog).toContain('Autopilot-Compatible Documentation Architecture v0.1');

    await expectPath('docs/adr/0024-autopilot-compatible-documentation-architecture.md');
    await expectPath('docs/PRD.md');
    await expectPath('docs/SPEC.md');
    await expectPath('docs/DESIGN.md');
    await expectPath('docs/PLAN.md');
  });

  it('records public website release candidate closure without publishing or deploying', async () => {
    const [handoff, readme, acceptanceChecklist, devLog] = await Promise.all([
      readFile('docs/operations/public-website-release-candidate-handoff-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(handoff).toContain('Public Website Release Candidate Handoff v0.1');
    expect(handoff).toContain('Review branch: `codex/public-website-v0.1`');
    expect(handoff).toContain('Website Change Scope');
    expect(handoff).toContain('Screenshot Evidence');
    expect(handoff).toContain('Final Verification Gates');
    expect(handoff).toContain('Private Draft PR Status');
    expect(handoff).toContain('PR Review Closure Status');
    expect(handoff).toContain('PR Merge Closure Status');
    expect(handoff).toContain('https://github.com/xiaoba-dev/repoassure/pull/2');
    expect(handoff).toContain('RepoAssure CI / Quality Gates');
    expect(handoff).toContain('passed');
    expect(handoff).toContain('PR state: `MERGED`');
    expect(handoff).toContain('Merge commit: `b2de16afb42e3afcaa586c8f6edda43c8b64c442`');
    expect(handoff).toContain('Main branch verification');
    expect(handoff).toContain('Ready for Review');
    expect(handoff).toContain('No GitHub PR comments');
    expect(handoff).toContain('No GitHub PR reviews');
    expect(handoff).toContain('Do not merge without explicit merge authorization');
    expect(handoff).toContain('Remaining P3 Backlog');
    expect(handoff).toContain('Non-Authorization Boundary');
    expect(handoff).toContain('desktop-focus-dark.png');
    expect(handoff).toContain('desktop-focus-light.png');
    expect(handoff).toContain('pnpm verify:website');
    expect(handoff).toContain('Do not deploy the website');
    expect(handoff).toContain('Do not claim SaaS availability');
    expect(handoff).toContain('Do not claim Team Cloud or Enterprise availability');
    expect(readme).toContain('public-website-release-candidate-handoff-v0.1.md');
    expect(acceptanceChecklist).toContain('Public Website Release Candidate Closure');
    expect(devLog).toContain('Public Website Release Candidate Closure v0.1');
    expect(devLog).toContain('Public Website Private PR Review v0.1');
    expect(devLog).toContain('Public Website PR #2 Review Closure v0.1');
    expect(devLog).toContain('Public Website PR #2 Merge Closure v0.1');

    await expectPath('docs/operations/public-website-release-candidate-handoff-v0.1.md');
  });

  it('records the repository acceptance scope decision for Web App versus Python CLI repos', async () => {
    const [adrIndex, acceptanceScopeAdr, readme, userGuide, acceptanceChecklist, productSpecV02] = await Promise.all([
      readFile('docs/adr/README.md', 'utf8'),
      readFile('docs/adr/0008-repository-acceptance-scope.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/acceptance/guides/user-acceptance-guide.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/product/specs/mvp-spec-v0.2.md', 'utf8')
    ]);

    expect(adrIndex).toContain('[0008](0008-repository-acceptance-scope.md)');
    expect(adrIndex).toContain('Repository acceptance scope');
    expect(acceptanceScopeAdr).toContain('MVP v0.1 and the current v0.2 repair-plan increment keep `user:accept` scoped to automatically startable Web App repos');
    expect(acceptanceScopeAdr).toContain('Python CLI and Agent capability packages such as `Panniantong/Agent-Reach` are explicit out-of-scope targets for the current browser acceptance flow');
    expect(acceptanceScopeAdr).toContain('Future Python/CLI acceptance mode');
    expect(readme).toContain('ADR-0008');
    expect(readme).toContain('Python CLI / Agent capability repo');
    expect(userGuide).toContain('Repository acceptance scope');
    expect(userGuide).toContain('当前 browser acceptance 范围限定为可自动启动或已提供 URL 的 Web App repo');
    expect(userGuide).toContain('当前已支持显式 Python/CLI acceptance mode');
    expect(acceptanceChecklist).toContain('ADR-0008');
    expect(acceptanceChecklist).toContain('Agent-Reach');
    expect(productSpecV02).toContain('ADR-0008');
    expect(productSpecV02).toContain('Python/CLI acceptance mode');
  });

  it('keeps documentation taxonomy explicit and discoverable', async () => {
    const [readme, taxonomySpec, taxonomyAdr] = await Promise.all([
      readFile('README.md', 'utf8'),
      readFile('docs/architecture/specs/docs-taxonomy-spec-v0.1.md', 'utf8'),
      readFile('docs/adr/0007-documentation-taxonomy-and-naming.md', 'utf8')
    ]);

    expect(readme).toContain('docs/architecture/specs/docs-taxonomy-spec-v0.1.md');
    expect(taxonomyAdr).toContain('stable documents from generated or historical records');
    expect(taxonomySpec).toContain('Documentation Taxonomy Spec v0.1');
    expect(taxonomySpec).toContain('Migration Map');
    expect(taxonomySpec).toContain('Do not move generated acceptance outputs until the owning commands support compatibility paths');

    await expectPath('docs/architecture/overview.md');
    await expectPath('docs/architecture/specs/monorepo-structure-spec-v0.1.md');
    await expectPath('docs/architecture/specs/docs-taxonomy-spec-v0.1.md');
    await expectPath('docs/architecture/spikes/technical-spike-plan-v0.1.md');
    await expectPath('docs/product/specs/mvp-spec-v0.1.md');
    await expectPath('docs/product/specs/mvp-spec-v0.2.md');
    await expectPath('docs/product/research/user-interview-script-v0.1.md');
    await expectPath('docs/acceptance/guides/user-acceptance-guide.md');
    await expectPath('docs/acceptance/checklists/acceptance-checklist-v0.1.md');
    await expectPath('docs/acceptance/records/odinsight/2026-06-20-initial.md');
    await expectPath('docs/acceptance/records/odinsight/2026-06-20-after-repair.md');
    await expectPath('docs/acceptance/records/rotifer-alpha/2026-06-18-initial.md');
    await expectPath('docs/testing/strategy/test-strategy-v0.1.md');
    await expectPath('docs/testing/samples/sample-hardening-report.md');
    await expectPath('docs/goals/completed/2026-06-20-structure-refactor.md');
    await expectPath('docs/goals/completed/2026-06-20-repair-plan-v0.2.md');
  });

  it('records monorepo readiness as a separate prerequisite before v0.3 distribution work', async () => {
    const [
      readinessAudit,
      readinessGoal,
      v03Goal,
      monorepoSpec,
      testingStrategy,
      decisionLog,
      devLog
    ] = await Promise.all([
      readFile('docs/architecture/specs/monorepo-readiness-audit-v0.1.md', 'utf8'),
      readFile('docs/goals/completed/2026-06-25-monorepo-readiness-audit.md', 'utf8'),
      readFile('docs/goals/completed/2026-06-25-v0.3-distribution-repair-loop-readiness.md', 'utf8'),
      readFile('docs/architecture/specs/monorepo-structure-spec-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(readinessAudit).toContain('Monorepo Readiness Audit v0.1');
    expect(readinessAudit).toContain('当前 repo 是可运行的分阶段 monorepo，不是成熟完成态 monorepo');
    expect(readinessAudit).toContain('Before v0.3');
    expect(readinessAudit).toContain('packages/core');
    expect(readinessAudit).toContain('apps/cli');
    expect(readinessAudit).toContain('apps/mcp-server');
    expect(readinessAudit).toContain('examples/');
    expect(readinessAudit).toContain('GitHub Action wrapper');
    expect(readinessAudit).toContain('repo hygiene');
    expect(readinessAudit).toContain('不新增 ADR');
    expect(readinessGoal).toContain('Monorepo Readiness Audit Codex Goal');
    expect(readinessGoal).toContain('状态：已完成');
    expect(readinessGoal).toContain('TDD');
    expect(readinessGoal).toContain('测试金字塔');
    expect(readinessGoal).toContain('Completion Evidence');
    expect(readinessGoal).toContain('v0.3');
    expect(readinessGoal).toContain('不迁移运行时代码');
    expect(v03Goal).toContain('前置条件');
    expect(v03Goal).toContain('monorepo readiness audit');
    expect(monorepoSpec).toContain('monorepo-readiness-audit-v0.1.md');
    expect(monorepoSpec).toContain('Readiness Audit Before v0.3');
    expect(testingStrategy).toContain('monorepo readiness');
    expect(decisionLog).toContain('Monorepo readiness before v0.3');
    expect(devLog).toContain('Monorepo Readiness Audit');

    await expectPath('docs/architecture/specs/monorepo-readiness-audit-v0.1.md');
    await expectPath('docs/goals/completed/2026-06-25-monorepo-readiness-audit.md');
  });

  it('defines a local-first GitHub Action wrapper for v0.3 distribution', async () => {
    const [action, exampleWorkflow, readme, userGuide, v03Spec] = await Promise.all([
      readFile('.github/actions/repoassure/action.yml', 'utf8'),
      readFile('examples/github-actions/repoassure-local-first.yml', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/acceptance/guides/user-acceptance-guide.md', 'utf8'),
      readFile('docs/product/specs/mvp-spec-v0.3.md', 'utf8')
    ]);

    expect(action).toContain('name: RepoAssure Local Hardening');
    expect(action).toContain('description: Run RepoAssure through the checked-out repository local CLI without a hosted service');
    expect(action).toContain('repo-path');
    expect(action).toContain('upload-artifacts');
    expect(action).toContain('default: "false"');
    expect(action).toContain('pnpm install --frozen-lockfile');
    expect(action).toContain('pnpm build');
    expect(action).toContain('node dist/adapters/cli/index.js run');
    expect(action).toContain('does not upload target repo source, logs, screenshots, traces, env values, or private artifacts');
    expect(exampleWorkflow).toContain('uses: ./.github/actions/repoassure');
    expect(exampleWorkflow).toContain('upload-artifacts: "false"');
    expect(exampleWorkflow).toContain('actions/upload-artifact');
    expect(exampleWorkflow).toContain("if: inputs.upload-artifacts == 'true'");
    expect(readme).toContain('pnpm release:check');
    expect(readme).toContain('.github/actions/repoassure/action.yml');
    expect(userGuide).toContain('RepoAssure Local Hardening');
    expect(v03Spec).toContain('GitHub Action wrapper');

    await expectPath('.github/actions/repoassure/action.yml');
    await expectPath('examples/github-actions/repoassure-local-first.yml');
  });

  it('records the Team Cloud and Enterprise commercial edition boundary before implementation', async () => {
    const [
      adrIndex,
      commercialEditionAdr,
      commercialEditionSpec,
      commercialEditionArchitecture,
      commercialization,
      openCorePackaging,
      architecture,
      mvpV03,
      acceptanceChecklist,
      testingStrategy,
      readme,
      decisionLog,
      devLog
    ] = await Promise.all([
      readFile('docs/adr/README.md', 'utf8'),
      readFile('docs/adr/0016-team-cloud-enterprise-boundary.md', 'utf8'),
      readFile('docs/product/specs/team-cloud-enterprise-spec-v0.1.md', 'utf8'),
      readFile('docs/architecture/specs/team-cloud-enterprise-architecture-v0.1.md', 'utf8'),
      readFile('docs/product/strategy/commercialization-strategy-v0.1.md', 'utf8'),
      readFile('docs/product/strategy/open-core-packaging-spec-v0.1.md', 'utf8'),
      readFile('docs/architecture/overview.md', 'utf8'),
      readFile('docs/product/specs/mvp-spec-v0.3.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(adrIndex).toContain('[0016](0016-team-cloud-enterprise-boundary.md)');
    expect(adrIndex).toContain('Team Cloud and Enterprise commercial edition boundary');
    expect(commercialEditionAdr).toContain('Team Cloud and Enterprise commercial edition boundary');
    expect(commercialEditionAdr).toContain('commercial packaging layers over the open artifact contract');
    expect(commercialEditionAdr).toContain('Do not implement hosted paid features in this increment');
    expect(commercialEditionAdr).toContain('No target repo source upload by default');
    expect(commercialEditionAdr).toContain('docs/product/specs/team-cloud-enterprise-spec-v0.1.md');
    expect(commercialEditionAdr).toContain('docs/architecture/specs/team-cloud-enterprise-architecture-v0.1.md');
    expect(commercialEditionSpec).toContain('Team Cloud & Enterprise Spec v0.1');
    expect(commercialEditionSpec).toContain('Hosted dashboard');
    expect(commercialEditionSpec).toContain('Team collaboration');
    expect(commercialEditionSpec).toContain('Enterprise integrations');
    expect(commercialEditionSpec).toContain('Advanced governance');
    expect(commercialEditionSpec).toContain('Roadmap');
    expect(commercialEditionSpec).toContain('No paid cloud implementation in this increment');
    expect(commercialEditionArchitecture).toContain('Team Cloud & Enterprise Architecture v0.1');
    expect(commercialEditionArchitecture).toContain('Open artifact contract');
    expect(commercialEditionArchitecture).toContain('Commercial control plane');
    expect(commercialEditionArchitecture).toContain('No target repo source upload by default');
    expect(commercialization).toContain('team-cloud-enterprise-spec-v0.1.md');
    expect(openCorePackaging).toContain('team-cloud-enterprise-architecture-v0.1.md');
    expect(architecture).toContain('ADR-0016');
    expect(architecture).toContain('Team Cloud and Enterprise');
    expect(mvpV03).toContain('ADR-0016');
    expect(mvpV03).toContain('Team Cloud & Enterprise Spec v0.1');
    expect(acceptanceChecklist).toContain('Team Cloud & Enterprise Spec v0.1');
    expect(acceptanceChecklist).toContain('商业版能力仅完成规划和边界验收，不实现 paid cloud runtime');
    expect(testingStrategy).toContain('Team Cloud & Enterprise Spec');
    expect(testingStrategy).toContain('structure-level tests');
    expect(readme).toContain('team-cloud-enterprise-spec-v0.1.md');
    expect(readme).toContain('ADR-0016');
    expect(decisionLog).toContain('Team Cloud and Enterprise commercial edition boundary');
    expect(devLog).toContain('Team Cloud & Enterprise Spec v0.1');

    await expectPath('docs/adr/0016-team-cloud-enterprise-boundary.md');
    await expectPath('docs/product/specs/team-cloud-enterprise-spec-v0.1.md');
    await expectPath('docs/architecture/specs/team-cloud-enterprise-architecture-v0.1.md');
  });

  it('separates the public website from the internal project intelligence console', async () => {
    const [
      adrIndex,
      surfacesAdr,
      publicWebsiteSpec,
      intelligenceSpec,
      intelligenceArchitecture,
      readme,
      architecture,
      commercialization,
      acceptanceChecklist,
      testingStrategy,
      decisionLog,
      devLog
    ] = await Promise.all([
      readFile('docs/adr/README.md', 'utf8'),
      readFile('docs/adr/0017-public-website-and-project-intelligence-console.md', 'utf8'),
      readFile('docs/product/specs/public-website-spec-v0.1.md', 'utf8'),
      readFile('docs/product/specs/project-intelligence-console-spec-v0.1.md', 'utf8'),
      readFile('docs/architecture/specs/project-intelligence-console-architecture-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/architecture/overview.md', 'utf8'),
      readFile('docs/product/strategy/commercialization-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(adrIndex).toContain('[0017](0017-public-website-and-project-intelligence-console.md)');
    expect(adrIndex).toContain('Public website and internal project intelligence console');
    expect(surfacesAdr).toContain('Public website and internal project intelligence console');
    expect(surfacesAdr).toContain('separate product surfaces');
    expect(surfacesAdr).toContain('does not authorize public release');
    expect(surfacesAdr).toContain('local-only internal observability surface');
    expect(publicWebsiteSpec).toContain('Public Website Spec v0.1');
    expect(publicWebsiteSpec).toContain('responsive design');
    expect(publicWebsiteSpec).toContain('private preview');
    expect(publicWebsiteSpec).toContain('Waitlist');
    expect(publicWebsiteSpec).toContain('does not claim SaaS availability');
    expect(intelligenceSpec).toContain('Project Intelligence Console Spec v0.1');
    expect(intelligenceSpec).toContain('Docs Graph');
    expect(intelligenceSpec).toContain('Code Graph');
    expect(intelligenceSpec).toContain('Project Progress Graph');
    expect(intelligenceSpec).toContain('local-only');
    expect(intelligenceArchitecture).toContain('Project Intelligence Console Architecture v0.1');
    expect(intelligenceArchitecture).toContain('Graph Builder');
    expect(intelligenceArchitecture).toContain('artifacts/project-graph');
    expect(intelligenceArchitecture).toContain('No hosted service dependency');
    expect(readme).toContain('public-website-spec-v0.1.md');
    expect(readme).toContain('project-intelligence-console-spec-v0.1.md');
    expect(architecture).toContain('ADR-0017');
    expect(architecture).toContain('Project Intelligence Console');
    expect(commercialization).toContain('public-website-spec-v0.1.md');
    expect(acceptanceChecklist).toContain('Public Website and Project Intelligence Console planning');
    expect(testingStrategy).toContain('Public Website and Project Intelligence Console');
    expect(decisionLog).toContain('Public website and internal project intelligence console');
    expect(devLog).toContain('Public Website and Project Intelligence Console Planning v0.1');

    await expectPath('docs/adr/0017-public-website-and-project-intelligence-console.md');
    await expectPath('docs/product/specs/public-website-spec-v0.1.md');
    await expectPath('docs/product/specs/project-intelligence-console-spec-v0.1.md');
    await expectPath('docs/architecture/specs/project-intelligence-console-architecture-v0.1.md');
  });

  it('records the public website localization strategy without expanding product runtime scope', async () => {
    const [
      adrIndex,
      localizationAdr,
      publicWebsiteSpec,
      readme,
      architecture,
      commercialization,
      acceptanceChecklist,
      testingStrategy,
      decisionLog,
      devLog
    ] = await Promise.all([
      readFile('docs/adr/README.md', 'utf8'),
      readFile('docs/adr/0018-public-website-localization-strategy.md', 'utf8'),
      readFile('docs/product/specs/public-website-spec-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/architecture/overview.md', 'utf8'),
      readFile('docs/product/strategy/commercialization-strategy-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(adrIndex).toContain('[0018](0018-public-website-localization-strategy.md)');
    expect(adrIndex).toContain('Public website localization strategy');
    expect(localizationAdr).toContain('Default to English and add Simplified Chinese first');
    expect(localizationAdr).toContain('Japanese and Korean are roadmap locales');
    expect(localizationAdr).toContain('Do not treat website localization as product artifact localization');
    expect(localizationAdr).toContain('forbidden-claim checks');
    expect(publicWebsiteSpec).toContain('ADR-0018');
    expect(publicWebsiteSpec).toContain('English + Simplified Chinese first');
    expect(publicWebsiteSpec).toContain('Japanese and Korean are planned roadmap locales');
    expect(publicWebsiteSpec).toContain('localized forbidden-claim checks');
    expect(readme).toContain('ADR-0018');
    expect(architecture).toContain('ADR-0018');
    expect(commercialization).toContain('website localization');
    expect(acceptanceChecklist).toContain('Public Website Localization Strategy');
    expect(testingStrategy).toContain('Public Website Localization Strategy');
    expect(decisionLog).toContain('Public website localization strategy');
    expect(devLog).toContain('Public Website Localization Strategy ADR');

    await expectPath('docs/adr/0018-public-website-localization-strategy.md');
  });

  it('records the public website enterprise design system before redesign implementation', async () => {
    const [
      adrIndex,
      designSystemAdr,
      designSystem,
      publicWebsiteSpec,
      readme,
      architecture,
      acceptanceChecklist,
      testingStrategy,
      decisionLog,
      devLog
    ] = await Promise.all([
      readFile('docs/adr/README.md', 'utf8'),
      readFile('docs/adr/0019-public-website-enterprise-design-system.md', 'utf8'),
      readFile('docs/design/design-system-v0.1.md', 'utf8'),
      readFile('docs/product/specs/public-website-spec-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/architecture/overview.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(adrIndex).toContain('[0019](0019-public-website-enterprise-design-system.md)');
    expect(adrIndex).toContain('Public website enterprise design system');
    expect(designSystemAdr).toContain('security-grade, evidence-first, local-first, enterprise-calm');
    expect(designSystemAdr).toContain('top-tier security company aesthetic');
    expect(designSystemAdr).toContain('does not authorize a visual redesign by itself');
    expect(designSystem).toContain('RepoAssure Design System v0.1');
    expect(designSystem).toContain('Security-grade');
    expect(designSystem).toContain('Evidence-first');
    expect(designSystem).toContain('Trust Ledger');
    expect(designSystem).toContain('Semantic Token Layer');
    expect(designSystem).toContain('Focus Visibility Gate');
    expect(designSystem).toContain('Forbidden Patterns');
    expect(publicWebsiteSpec).toContain('ADR-0019');
    expect(publicWebsiteSpec).toContain('design-system-v0.1.md');
    expect(publicWebsiteSpec).toContain('semantic token layer');
    expect(publicWebsiteSpec).toContain('focus-visible');
    expect(readme).toContain('design-system-v0.1.md');
    expect(architecture).toContain('ADR-0019');
    expect(acceptanceChecklist).toContain('Public Website Enterprise Design System');
    expect(acceptanceChecklist).toContain('Public Website UI/UX Gate');
    expect(testingStrategy).toContain('Public Website Enterprise Design System');
    expect(testingStrategy).toContain('Public Website UI/UX Gate');
    expect(decisionLog).toContain('Public website enterprise design system');
    expect(devLog).toContain('Public Website Enterprise Design System ADR');
    expect(devLog).toContain('Public Website UI/UX Gate');

    await expectPath('docs/adr/0019-public-website-enterprise-design-system.md');
    await expectPath('docs/design/design-system-v0.1.md');
  });

  it('records the public website private preview deployment boundary before execution', async () => {
    const [
      adrIndex,
      deploymentAdr,
      publicWebsiteSpec,
      handoff,
      readme,
      architecture,
      acceptanceChecklist,
      testingStrategy,
      decisionLog,
      devLog
    ] = await Promise.all([
      readFile('docs/adr/README.md', 'utf8'),
      readFile('docs/adr/0020-public-website-private-preview-deployment.md', 'utf8'),
      readFile('docs/product/specs/public-website-spec-v0.1.md', 'utf8'),
      readFile('docs/operations/public-website-release-candidate-handoff-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/architecture/overview.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(adrIndex).toContain('[0020](0020-public-website-private-preview-deployment.md)');
    expect(adrIndex).toContain('Public website private preview deployment boundary');
    expect(deploymentAdr).toContain('Private preview deployment is a separate execution gate');
    expect(deploymentAdr).toContain('does not authorize production deployment');
    expect(deploymentAdr).toContain('does not authorize public launch');
    expect(deploymentAdr).toContain('deployment execution requires a separate Codex goal');
    expect(publicWebsiteSpec).toContain('ADR-0020');
    expect(publicWebsiteSpec).toContain('Private preview deployment planning');
    expect(handoff).toContain('Private Preview Deployment Planning');
    expect(handoff).toContain('Do not deploy from this planning goal');
    expect(readme).toContain('ADR-0020');
    expect(architecture).toContain('ADR-0020');
    expect(acceptanceChecklist).toContain('Public Website Private Preview Deployment Planning');
    expect(testingStrategy).toContain('Public Website Private Preview Deployment Planning');
    expect(decisionLog).toContain('Public website private preview deployment boundary');
    expect(devLog).toContain('Public Website Private Preview Deployment Planning v0.1');

    await expectPath('docs/adr/0020-public-website-private-preview-deployment.md');
  });

  it('records public website private preview deployment preflight while external deployment is blocked', async () => {
    const [vercelConfig, vercelIgnore, blockers, devLog, handoff] = await Promise.all([
      readFile('vercel.json', 'utf8'),
      readFile('.vercelignore', 'utf8'),
      readFile('docs/logs/blockers.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8'),
      readFile('docs/operations/public-website-release-candidate-handoff-v0.1.md', 'utf8')
    ]);

    expect(vercelConfig).toContain('"buildCommand": "pnpm build:website"');
    expect(vercelConfig).toContain('"outputDirectory": "apps/website/dist"');
    expect(vercelConfig).toContain('"installCommand": "pnpm install --frozen-lockfile"');
    expect(vercelIgnore).toContain('node_modules');
    expect(vercelIgnore).toContain('artifacts');
    expect(vercelIgnore).toContain('.git');
    expect(blockers).toContain('RepoAssure 官网代码和构建产物上传到 Vercel');
    expect(blockers).toContain('Public website private preview deployment is blocked by Vercel preview target mismatch');
    expect(blockers).toContain('target production');
    expect(blockers).toContain('Vercel Git integration');
    expect(blockers).toContain('Git push to `main`');
    expect(blockers).toContain('No deployments found');
    expect(blockers).toContain('不得伪造 preview URL');
    expect(blockers).toContain('Resolve Vercel Preview Target Blocker v0.1');
    expect(blockers).toContain('Vercel preview deployment retry');
    expect(devLog).toContain('Public Website Private Preview Deployment Execution v0.1 Blocked');
    expect(devLog).toContain('Vercel data-export 授权已满足');
    expect(devLog).toContain('unintended production deployments and aliases were removed');
    expect(devLog).toContain('Git push to `main` triggered a Vercel production deployment');
    expect(devLog).toContain('Disconnected xiaoba-dev/repoassure');
    expect(devLog).toContain('Resolve Vercel Preview Target Blocker v0.1');
    expect(handoff).toContain('Private Preview Deployment Execution Attempt');
    expect(handoff).toContain('Preview Deployment Retry Status');
    expect(handoff).toContain('No accepted preview URL is active');
    expect(handoff).toContain('Vercel Git integration was disconnected');

    await expectPath('.vercelignore');
    await expectPath('vercel.json');
  });

  it('records the private preview hosting fallback decision after Vercel target mismatch', async () => {
    const [
      adrIndex,
      fallbackAdr,
      publicWebsiteSpec,
      handoff,
      readme,
      architecture,
      acceptanceChecklist,
      testingStrategy,
      decisionLog,
      devLog,
      blockers
    ] = await Promise.all([
      readFile('docs/adr/README.md', 'utf8'),
      readFile('docs/adr/0021-private-preview-hosting-fallback.md', 'utf8'),
      readFile('docs/product/specs/public-website-spec-v0.1.md', 'utf8'),
      readFile('docs/operations/public-website-release-candidate-handoff-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/architecture/overview.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8'),
      readFile('docs/logs/blockers.md', 'utf8')
    ]);

    expect(adrIndex).toContain('[0021](0021-private-preview-hosting-fallback.md)');
    expect(adrIndex).toContain('Private preview hosting fallback decision');
    expect(fallbackAdr).toContain('Cloudflare Pages preview deployments with Cloudflare Access');
    expect(fallbackAdr).toContain('Local static preview bundle remains the interim review surface');
    expect(fallbackAdr).toContain('Do not restore Vercel Git integration');
    expect(fallbackAdr).toContain('does not authorize public launch');
    expect(fallbackAdr).toContain('does not authorize production deployment');
    expect(fallbackAdr).toContain('Cloudflare Pages preview deployments are public by default');
    expect(fallbackAdr).toContain('Enable access policy before sharing any remote preview URL');
    expect(publicWebsiteSpec).toContain('ADR-0021');
    expect(publicWebsiteSpec).toContain('Private preview hosting fallback');
    expect(handoff).toContain('Private Preview Hosting Fallback Decision');
    expect(handoff).toContain('Cloudflare Pages preview deployments with Cloudflare Access');
    expect(readme).toContain('ADR-0021');
    expect(architecture).toContain('ADR-0021');
    expect(acceptanceChecklist).toContain('Private Preview Hosting Fallback Decision');
    expect(testingStrategy).toContain('Private Preview Hosting Fallback Decision');
    expect(decisionLog).toContain('Private preview hosting fallback decision');
    expect(devLog).toContain('Private Preview Hosting Fallback Decision v0.1');
    expect(blockers).toContain('ADR-0021');

    await expectPath('docs/adr/0021-private-preview-hosting-fallback.md');
  });

  it('defines a local static public website preview package without remote hosting', async () => {
    const [packageJson, packageScript, gitignore, previewHandoff, publicWebsiteHandoff, acceptanceChecklist, testingStrategy, devLog] =
      await Promise.all([
        readFile('package.json', 'utf8'),
        readFile('scripts/package-website-preview.mjs', 'utf8'),
        readFile('.gitignore', 'utf8'),
        readFile('docs/operations/local-static-preview-package-v0.1.md', 'utf8'),
        readFile('docs/operations/public-website-release-candidate-handoff-v0.1.md', 'utf8'),
        readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
        readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
        readFile('docs/logs/dev-log.md', 'utf8')
      ]);

    expect(packageJson).toContain('"package:website-preview": "node scripts/package-website-preview.mjs"');
    expect(packageScript).toContain("apps/website/dist");
    expect(packageScript).toContain("artifacts/public-website-preview/local-static-preview");
    expect(packageScript).toContain("forbidden-claims.json");
    expect(packageScript).toContain("manifest.json");
    expect(packageScript).toContain("review-guide.md");
    expect(packageScript).toContain("This package is a local static preview only");
    expect(packageScript).not.toContain('vercel deploy');
    expect(packageScript).not.toContain('cloudflare');
    expect(gitignore).toContain('artifacts/public-website-preview/');
    expect(previewHandoff).toContain('Local Static Preview Package v0.1');
    expect(previewHandoff).toContain('pnpm build:website');
    expect(previewHandoff).toContain('pnpm package:website-preview');
    expect(previewHandoff).toContain('artifacts/public-website-preview/local-static-preview');
    expect(previewHandoff).toContain('No remote hosting provider is used');
    expect(previewHandoff).toContain('does not authorize public launch');
    expect(publicWebsiteHandoff).toContain('Local Static Preview Package');
    expect(acceptanceChecklist).toContain('Local Static Preview Package');
    expect(testingStrategy).toContain('Local Static Preview Package');
    expect(devLog).toContain('Local Static Preview Package v0.1');

    await expectPath('scripts/package-website-preview.mjs');
    await expectPath('docs/operations/local-static-preview-package-v0.1.md');
  });

  it('defines Cloudflare Access remote preview preflight before upload or deployment', async () => {
    const [
      packageJson,
      preflightScript,
      preflightDoc,
      publicWebsiteHandoff,
      acceptanceChecklist,
      testingStrategy,
      devLog
    ] = await Promise.all([
      readFile('package.json', 'utf8'),
      readFile('scripts/preflight-cloudflare-preview.mjs', 'utf8'),
      readFile('docs/operations/cloudflare-access-preview-preflight-v0.1.md', 'utf8'),
      readFile('docs/operations/public-website-release-candidate-handoff-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(packageJson).toContain('"preflight:cloudflare-preview": "node scripts/preflight-cloudflare-preview.mjs"');
    expect(preflightScript).toContain('Cloudflare Access Remote Preview Preflight v0.1');
    expect(preflightScript).toContain('REPOASSURE_CLOUDFLARE_ACCOUNT_ID');
    expect(preflightScript).toContain('REPOASSURE_CLOUDFLARE_PAGES_PROJECT');
    expect(preflightScript).toContain('REPOASSURE_CLOUDFLARE_ACCESS_POLICY');
    expect(preflightScript).toContain('REPOASSURE_REMOTE_PREVIEW_DATA_EXPORT_AUTHORIZED');
    expect(preflightScript).toContain('artifacts/public-website-preview/cloudflare-access-preflight');
    expect(preflightScript).toContain('preflight-report.json');
    expect(preflightScript).toContain('No website source or build output is uploaded by this preflight');
    expect(preflightScript).not.toContain('wrangler pages deploy');
    expect(preflightScript).not.toContain('fetch(');
    expect(preflightScript).not.toContain('vercel deploy');
    expect(preflightDoc).toContain('Cloudflare Access Remote Preview Preflight v0.1');
    expect(preflightDoc).toContain('pnpm preflight:cloudflare-preview');
    expect(preflightDoc).toContain('No website source or build output is uploaded by this preflight');
    expect(preflightDoc).toContain('Cloudflare Pages preview deployments are public by default');
    expect(preflightDoc).toContain('Cloudflare Access policy must be enabled before any preview URL is shared');
    expect(preflightDoc).toContain('does not authorize public launch');
    expect(publicWebsiteHandoff).toContain('Cloudflare Access Remote Preview Preflight');
    expect(acceptanceChecklist).toContain('Cloudflare Access Remote Preview Preflight');
    expect(testingStrategy).toContain('Cloudflare Access Remote Preview Preflight');
    expect(devLog).toContain('Cloudflare Access Remote Preview Preflight v0.1');

    await expectPath('scripts/preflight-cloudflare-preview.mjs');
    await expectPath('docs/operations/cloudflare-access-preview-preflight-v0.1.md');
  });

  it('defines Cloudflare Access private preview reviewer-side acceptance verification', async () => {
    const [packageJson, acceptanceScript, preflightDoc, publicWebsiteHandoff, acceptanceChecklist, testingStrategy, devLog] =
      await Promise.all([
        readFile('package.json', 'utf8'),
        readFile('scripts/verify-cloudflare-access-preview.mjs', 'utf8'),
        readFile('docs/operations/cloudflare-access-preview-preflight-v0.1.md', 'utf8'),
        readFile('docs/operations/public-website-release-candidate-handoff-v0.1.md', 'utf8'),
        readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
        readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
        readFile('docs/logs/dev-log.md', 'utf8')
      ]);

    expect(packageJson).toContain('"verify:cloudflare-preview": "node scripts/verify-cloudflare-access-preview.mjs"');
    expect(acceptanceScript).toContain('Cloudflare Access Private Preview Reviewer Acceptance v0.1');
    expect(acceptanceScript).toContain('REPOASSURE_PRIVATE_PREVIEW_URL');
    expect(acceptanceScript).toContain('www-authenticate');
    expect(acceptanceScript).toContain('Cloudflare-Access');
    expect(acceptanceScript).toContain('manual_required');
    expect(acceptanceScript).toContain('artifacts/public-website-preview/cloudflare-access-acceptance');
    expect(acceptanceScript).not.toContain('wrangler pages deploy');
    expect(preflightDoc).toContain('pnpm verify:cloudflare-preview');
    expect(preflightDoc).toContain('Reviewer-Side Acceptance');
    expect(preflightDoc).toContain('manual_required');
    expect(preflightDoc).toContain('Authenticated Reviewer Acceptance Closure');
    expect(publicWebsiteHandoff).toContain('Private Preview Reviewer-Side Acceptance');
    expect(publicWebsiteHandoff).toContain('pnpm verify:cloudflare-preview');
    expect(publicWebsiteHandoff).toContain('Private Preview Authenticated Reviewer Acceptance Closure');
    expect(publicWebsiteHandoff).toContain('Desktop authenticated content smoke: passed');
    expect(publicWebsiteHandoff).toContain('Mobile-width authenticated responsive smoke: passed');
    expect(acceptanceChecklist).toContain('Private Preview Reviewer-Side Acceptance');
    expect(acceptanceChecklist).toContain('Private Preview Authenticated Reviewer Acceptance Closure');
    expect(testingStrategy).toContain('Private Preview Reviewer-Side Acceptance');
    expect(testingStrategy).toContain('Private Preview Authenticated Reviewer Acceptance Closure');
    expect(devLog).toContain('Cloudflare Access Private Preview Reviewer Acceptance v0.1');
    expect(devLog).toContain('Cloudflare Access Private Preview Authenticated Reviewer Acceptance Closure v0.1');

    await expectPath('scripts/verify-cloudflare-access-preview.mjs');
  });

  it('records public website custom domain deployment as verified after DNS activation', async () => {
    const [operation, readme, acceptanceChecklist, testingStrategy, devLog, blockers] = await Promise.all([
      readFile('docs/operations/public-website-custom-domain-deployment-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8'),
      readFile('docs/logs/blockers.md', 'utf8')
    ]);

    expect(operation).toContain('Public Website Custom Domain Deployment v0.1');
    expect(operation).toContain('Status: verified_custom_domain_active');
    expect(operation).toContain('Verified: 2026-07-01');
    expect(operation).toContain('Cloudflare Pages project: `repoassure-preview`');
    expect(operation).toContain('Custom domains requested: `repoassure.com`, `www.repoassure.com`');
    expect(operation).toContain('Latest deployment URL: `https://9dc5dd8b.repoassure-preview.pages.dev`');
    expect(operation).toContain('Pages custom domain API accepted both domain bindings');
    expect(operation).toContain('Cloudflare Pages custom domain status is active');
    expect(operation).toContain('`repoassure.com`: active.');
    expect(operation).toContain('`www.repoassure.com`: active.');
    expect(operation).toContain('Verification result: `active`');
    expect(operation).toContain('Before manual DNS completion, Pages verification returned `CNAME record not set`');
    expect(operation).toContain('Before manual DNS completion, the available API token returned DNS API result `Authentication error`');
    expect(operation).toContain('Required DNS record: CNAME `@` -> `repoassure-preview.pages.dev`');
    expect(operation).toContain('Required DNS record: CNAME `www` -> `repoassure-preview.pages.dev`');
    expect(operation).toContain('`https://repoassure.com`: HTTP/2 200 over HTTPS');
    expect(operation).toContain('`https://www.repoassure.com`: HTTP/2 200 over HTTPS');
    expect(operation).toContain('Redirect policy verification: both custom domains currently serve the accepted website directly with HTTP/2 200');
    expect(operation).toContain('REPOASSURE_WEBSITE_URL=https://repoassure.com');
    expect(operation).toContain('REPOASSURE_WEBSITE_URL=https://www.repoassure.com');
    expect(operation).toContain('Assure every AI-generated repo before it ships');
    expect(operation).toContain('在交付前保障每个 AI 生成仓库');
    expect(operation).toContain('Forbidden availability claim verification passed');
    expect(operation).toContain('No repository visibility change was authorized');
    expect(operation).toContain('No npm publication was authorized');
    expect(operation).toContain('No GitHub release was authorized');
    expect(operation).toContain('No public launch or production marketing announcement was authorized');
    expect(operation).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was authorized');
    expect(readme).toContain('Public Website Custom Domain Deployment v0.1');
    expect(readme).toContain('verified_custom_domain_active');
    expect(acceptanceChecklist).toContain('Public Website Custom Domain Deployment v0.1');
    expect(acceptanceChecklist).toContain('verified_custom_domain_active');
    expect(testingStrategy).toContain('Public Website Custom Domain Deployment v0.1');
    expect(testingStrategy).toContain('forbidden-claim custom-domain verification');
    expect(testingStrategy).toContain('已通过英文默认');
    expect(devLog).toContain('Public Website Custom Domain Deployment v0.1');
    expect(devLog).toContain('Status: verified_custom_domain_active');
    expect(blockers).toContain('Public Website Custom Domain Deployment v0.1 is blocked by missing DNS CNAME records');
    expect(blockers).toContain('Resolved on 2026-07-01');

    await expectPath('docs/operations/public-website-custom-domain-deployment-v0.1.md');
  });

  it('records public website post-domain polish and launch boundary review', async () => {
    const [operation, readme, acceptanceChecklist, testingStrategy, devLog] = await Promise.all([
      readFile('docs/operations/public-website-post-domain-polish-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(operation).toContain('Public Website Post-Domain Polish & Launch Boundary Review v0.1');
    expect(operation).toContain('Status: verified_post_domain_polish');
    expect(operation).toContain('Canonical URL: `https://repoassure.com/`');
    expect(operation).toContain('Cloudflare Pages production branch: `preview`');
    expect(operation).toContain('Latest polish deployment URL: `https://eb1aa9ff.repoassure-preview.pages.dev`');
    expect(operation).toContain('Open Graph image: `https://repoassure.com/og-image.svg`');
    expect(operation).toContain('Twitter card: `summary_large_image`');
    expect(operation).toContain('Favicon: `/favicon.svg`');
    expect(operation).toContain('Web app manifest: `/site.webmanifest`');
    expect(operation).toContain('Robots: `/robots.txt`');
    expect(operation).toContain('Sitemap: `/sitemap.xml`');
    expect(operation).toContain('Redirect policy: both apex and www serve HTTP/2 200 directly');
    expect(operation).toContain('wrangler pages deploy apps/website/dist --project-name repoassure-preview --branch preview');
    expect(operation).toContain('`REPOASSURE_WEBSITE_URL=https://repoassure.com pnpm verify:website`: passed');
    expect(operation).toContain('`REPOASSURE_WEBSITE_URL=https://www.repoassure.com pnpm verify:website`: passed');
    expect(operation).toContain('No repository visibility change was authorized');
    expect(operation).toContain('No npm publication was authorized');
    expect(operation).toContain('No GitHub release was authorized');
    expect(operation).toContain('No public launch or production marketing announcement was authorized');
    expect(operation).toContain('No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was authorized');
    expect(readme).toContain('Public Website Post-Domain Polish & Launch Boundary Review v0.1');
    expect(readme).toContain('verified_post_domain_polish');
    expect(acceptanceChecklist).toContain('Public Website Post-Domain Polish & Launch Boundary Review v0.1');
    expect(testingStrategy).toContain('Public Website Post-Domain Polish & Launch Boundary Review v0.1');
    expect(devLog).toContain('Public Website Post-Domain Polish & Launch Boundary Review v0.1');

    await expectPath('docs/operations/public-website-post-domain-polish-v0.1.md');
  });

  it('records the private preview reviewer handoff and feedback intake package', async () => {
    const [reviewerHandoff, publicWebsiteHandoff, acceptanceChecklist, testingStrategy, devLog] = await Promise.all([
      readFile('docs/operations/private-preview-reviewer-handoff-v0.1.md', 'utf8'),
      readFile('docs/operations/public-website-release-candidate-handoff-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(reviewerHandoff).toContain('Private Preview Reviewer Handoff & Feedback Intake v0.1');
    expect(reviewerHandoff).toContain('https://repoassure-preview.pages.dev');
    expect(reviewerHandoff).toContain('allowed reviewers only');
    expect(reviewerHandoff).toContain('Do not share deployment subdomains or branch aliases');
    expect(reviewerHandoff).toContain('Feedback Template');
    expect(reviewerHandoff).toContain('Acceptance Questions');
    expect(reviewerHandoff).toContain('Rollback and Shutdown');
    expect(reviewerHandoff).toContain('Feedback Intake Workflow');
    expect(reviewerHandoff).toContain('No OTP, cookie, Access token, or login query-state');
    expect(publicWebsiteHandoff).toContain('Private Preview Reviewer Handoff & Feedback Intake');
    expect(acceptanceChecklist).toContain('Private Preview Reviewer Handoff & Feedback Intake');
    expect(testingStrategy).toContain('Private Preview Reviewer Handoff & Feedback Intake');
    expect(devLog).toContain('Private Preview Reviewer Handoff & Feedback Intake v0.1');

    await expectPath('docs/operations/private-preview-reviewer-handoff-v0.1.md');
  });

  it('records private preview feedback triage and website polish backlog gates', async () => {
    const [triageBacklog, reviewerHandoff, publicWebsiteHandoff, acceptanceChecklist, testingStrategy, devLog] =
      await Promise.all([
        readFile('docs/operations/private-preview-feedback-triage-backlog-v0.1.md', 'utf8'),
        readFile('docs/operations/private-preview-reviewer-handoff-v0.1.md', 'utf8'),
        readFile('docs/operations/public-website-release-candidate-handoff-v0.1.md', 'utf8'),
        readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
        readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
        readFile('docs/logs/dev-log.md', 'utf8')
      ]);

    expect(triageBacklog).toContain('Private Preview Feedback Triage & Website Polish Backlog v0.1');
    expect(triageBacklog).toContain('P0: Stop private preview sharing');
    expect(triageBacklog).toContain('P1: Fix before expanding reviewer group');
    expect(triageBacklog).toContain('P2: Fix before public launch preparation');
    expect(triageBacklog).toContain('P3: Polish backlog');
    expect(triageBacklog).toContain('Expand Private Preview');
    expect(triageBacklog).toContain('Pause Private Preview');
    expect(triageBacklog).toContain('Enter Public Launch Preparation');
    expect(triageBacklog).toContain('Backlog Item Template');
    expect(triageBacklog).toContain('Do not store OTP, cookie, Access token, login query-state');
    expect(reviewerHandoff).toContain('Triage and Backlog');
    expect(publicWebsiteHandoff).toContain('Private Preview Feedback Triage & Website Polish Backlog');
    expect(acceptanceChecklist).toContain('Private Preview Feedback Triage & Website Polish Backlog');
    expect(testingStrategy).toContain('Private Preview Feedback Triage & Website Polish Backlog');
    expect(devLog).toContain('Private Preview Feedback Triage & Website Polish Backlog v0.1');

    await expectPath('docs/operations/private-preview-feedback-triage-backlog-v0.1.md');
  });

  it('records private preview reviewer expansion readiness without widening access policy', async () => {
    const [expansionReadiness, triageBacklog, publicWebsiteHandoff, acceptanceChecklist, testingStrategy, devLog] =
      await Promise.all([
        readFile('docs/operations/private-preview-reviewer-expansion-readiness-v0.1.md', 'utf8'),
        readFile('docs/operations/private-preview-feedback-triage-backlog-v0.1.md', 'utf8'),
        readFile('docs/operations/public-website-release-candidate-handoff-v0.1.md', 'utf8'),
        readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
        readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
        readFile('docs/logs/dev-log.md', 'utf8')
      ]);

    expect(expansionReadiness).toContain('Private Preview Reviewer Expansion Readiness v0.1');
    expect(expansionReadiness).toContain('Readiness Checklist');
    expect(expansionReadiness).toContain('No open P0 findings');
    expect(expansionReadiness).toContain('No open P1 findings');
    expect(expansionReadiness).toContain('Access Boundary Checklist');
    expect(expansionReadiness).toContain('Content and UX Checklist');
    expect(expansionReadiness).toContain('Feedback Operations Checklist');
    expect(expansionReadiness).toContain('Expansion Decision');
    expect(expansionReadiness).toContain('Do not add reviewers to Cloudflare Access');
    expect(expansionReadiness).toContain('No OTP, cookie, Access token, login query-state');
    expect(triageBacklog).toContain('Private Preview Reviewer Expansion Readiness');
    expect(publicWebsiteHandoff).toContain('Private Preview Reviewer Expansion Readiness');
    expect(acceptanceChecklist).toContain('Private Preview Reviewer Expansion Readiness');
    expect(testingStrategy).toContain('Private Preview Reviewer Expansion Readiness');
    expect(devLog).toContain('Private Preview Reviewer Expansion Readiness v0.1');

    await expectPath('docs/operations/private-preview-reviewer-expansion-readiness-v0.1.md');
  });

  it('records private preview second reviewer access execution without widening beyond authorized emails', async () => {
    const [secondReviewerAccess, preflightDoc, publicWebsiteHandoff, acceptanceChecklist, testingStrategy, devLog] =
      await Promise.all([
        readFile('docs/operations/private-preview-second-reviewer-access-execution-v0.1.md', 'utf8'),
        readFile('docs/operations/cloudflare-access-preview-preflight-v0.1.md', 'utf8'),
        readFile('docs/operations/public-website-release-candidate-handoff-v0.1.md', 'utf8'),
        readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
        readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
        readFile('docs/logs/dev-log.md', 'utf8')
      ]);

    expect(secondReviewerAccess).toContain('Private Preview Second Reviewer Access Execution v0.1');
    expect(secondReviewerAccess).toContain('reviewer1@example.com');
    expect(secondReviewerAccess).toContain('reviewer2@example.com');
    expect(secondReviewerAccess).toContain('RepoAssure reviewer allow');
    expect(secondReviewerAccess).toContain('Cloudflare Dashboard UI');
    expect(secondReviewerAccess).toContain('Access API returned `Authentication error`');
    expect(secondReviewerAccess).toContain('pnpm verify:cloudflare-preview');
    expect(secondReviewerAccess).toContain('manual_required');
    expect(secondReviewerAccess).toContain('No OTP, cookie, Access token, login query-state');
    expect(secondReviewerAccess).toContain('does not authorize public launch');
    expect(preflightDoc).toContain('Private Preview Second Reviewer Access Execution');
    expect(preflightDoc).toContain('reviewer1@example.com');
    expect(preflightDoc).toContain('reviewer2@example.com');
    expect(publicWebsiteHandoff).toContain('Private Preview Second Reviewer Access Execution');
    expect(acceptanceChecklist).toContain('Private Preview Second Reviewer Access Execution');
    expect(testingStrategy).toContain('Private Preview Second Reviewer Access Execution');
    expect(devLog).toContain('Private Preview Second Reviewer Access Execution v0.1');

    await expectPath('docs/operations/private-preview-second-reviewer-access-execution-v0.1.md');
  });

  it('records private preview reviewer handoff dispatch readiness without inventing feedback', async () => {
    const [dispatchReadiness, reviewerHandoff, triageBacklog, publicWebsiteHandoff, acceptanceChecklist, testingStrategy, devLog] =
      await Promise.all([
        readFile('docs/operations/private-preview-reviewer-handoff-dispatch-readiness-v0.1.md', 'utf8'),
        readFile('docs/operations/private-preview-reviewer-handoff-v0.1.md', 'utf8'),
        readFile('docs/operations/private-preview-feedback-triage-backlog-v0.1.md', 'utf8'),
        readFile('docs/operations/public-website-release-candidate-handoff-v0.1.md', 'utf8'),
        readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
        readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
        readFile('docs/logs/dev-log.md', 'utf8')
      ]);

    expect(dispatchReadiness).toContain('Private Preview Reviewer Handoff Dispatch & Feedback Intake Readiness v0.1');
    expect(dispatchReadiness).toContain('waiting_for_external_reviewer_identity');
    expect(dispatchReadiness).toContain('reviewer1@example.com');
    expect(dispatchReadiness).toContain('reviewer2@example.com');
    expect(dispatchReadiness).toContain('maintainer-owned access smoke test identities');
    expect(dispatchReadiness).toContain('Handoff Message Template');
    expect(dispatchReadiness).toContain('Feedback Intake Record Template');
    expect(dispatchReadiness).toContain('Do not send email from this goal');
    expect(dispatchReadiness).toContain('Do not create external issues from this goal');
    expect(dispatchReadiness).toContain('Do not invent reviewer feedback');
    expect(dispatchReadiness).toContain('No OTP, cookie, Access token, login query-state');
    expect(reviewerHandoff).toContain('Private Preview Reviewer Handoff Dispatch & Feedback Intake Readiness');
    expect(triageBacklog).toContain('Private Preview Reviewer Handoff Dispatch & Feedback Intake Readiness');
    expect(publicWebsiteHandoff).toContain('Private Preview Reviewer Handoff Dispatch & Feedback Intake Readiness');
    expect(acceptanceChecklist).toContain('Private Preview Reviewer Handoff Dispatch & Feedback Intake Readiness');
    expect(testingStrategy).toContain('Private Preview Reviewer Handoff Dispatch & Feedback Intake Readiness');
    expect(devLog).toContain('Private Preview Reviewer Handoff Dispatch & Feedback Intake Readiness v0.1');

    await expectPath('docs/operations/private-preview-reviewer-handoff-dispatch-readiness-v0.1.md');
  });

  it('reconciles private preview reviewer identities before feedback triage', async () => {
    const [identityReconciliation, secondReviewerAccess, dispatchReadiness, publicWebsiteHandoff, acceptanceChecklist, testingStrategy, devLog] =
      await Promise.all([
        readFile('docs/operations/private-preview-reviewer-identity-reconciliation-v0.1.md', 'utf8'),
        readFile('docs/operations/private-preview-second-reviewer-access-execution-v0.1.md', 'utf8'),
        readFile('docs/operations/private-preview-reviewer-handoff-dispatch-readiness-v0.1.md', 'utf8'),
        readFile('docs/operations/public-website-release-candidate-handoff-v0.1.md', 'utf8'),
        readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
        readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
        readFile('docs/logs/dev-log.md', 'utf8')
      ]);

    expect(identityReconciliation).toContain('Private Preview Reviewer Identity Reconciliation v0.1');
    expect(identityReconciliation).toContain('Maintainer / user');
    expect(identityReconciliation).toContain('Authenticated reviewer identity');
    expect(identityReconciliation).toContain('maintainer-authenticated-smoke-identity');
    expect(identityReconciliation).toContain('Placeholder second-batch reviewer emails');
    expect(identityReconciliation).toContain('reviewer1@example.com');
    expect(identityReconciliation).toContain('reviewer2@example.com');
    expect(identityReconciliation).toContain('placeholder only');
    expect(identityReconciliation).toContain('must be replaced with non-maintainer reviewer emails');
    expect(identityReconciliation).toContain('Do not treat placeholder emails as real reviewer feedback');
    expect(identityReconciliation).toContain('waiting_for_real_reviewer_identity');
    expect(identityReconciliation).toContain('maintainer-owned access smoke test identities');
    expect(identityReconciliation).toContain('No Cloudflare Access policy change is authorized by this reconciliation');
    expect(identityReconciliation).toContain('No OTP, cookie, Access token, login query-state');
    expect(secondReviewerAccess).toContain('Private Preview Reviewer Identity Reconciliation');
    expect(dispatchReadiness).toContain('Private Preview Reviewer Identity Reconciliation');
    expect(publicWebsiteHandoff).toContain('Private Preview Reviewer Identity Reconciliation');
    expect(acceptanceChecklist).toContain('Private Preview Reviewer Identity Reconciliation');
    expect(testingStrategy).toContain('Private Preview Reviewer Identity Reconciliation');
    expect(devLog).toContain('Private Preview Reviewer Identity Reconciliation v0.1');

    await expectPath('docs/operations/private-preview-reviewer-identity-reconciliation-v0.1.md');
  });

  it('records private preview real reviewer replacement before external feedback collection', async () => {
    const [realReviewerReplacement, identityReconciliation, dispatchReadiness, publicWebsiteHandoff, acceptanceChecklist, testingStrategy, devLog] =
      await Promise.all([
        readFile('docs/operations/private-preview-real-reviewer-replacement-v0.1.md', 'utf8'),
        readFile('docs/operations/private-preview-reviewer-identity-reconciliation-v0.1.md', 'utf8'),
        readFile('docs/operations/private-preview-reviewer-handoff-dispatch-readiness-v0.1.md', 'utf8'),
        readFile('docs/operations/public-website-release-candidate-handoff-v0.1.md', 'utf8'),
        readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
        readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
        readFile('docs/logs/dev-log.md', 'utf8')
      ]);

    expect(realReviewerReplacement).toContain('Private Preview Real Reviewer Replacement v0.1');
    expect(realReviewerReplacement).toContain('confirmed-reviewer-1');
    expect(realReviewerReplacement).toContain('confirmed-reviewer-2');
    expect(realReviewerReplacement).toContain('reviewer1@example.com');
    expect(realReviewerReplacement).toContain('reviewer2@example.com');
    expect(realReviewerReplacement).toContain('removed placeholder reviewer emails');
    expect(realReviewerReplacement).toContain('maintainer_test_identity_corrected');
    expect(realReviewerReplacement).toContain('maintainer-owned access smoke test slots');
    expect(realReviewerReplacement).toContain('Reviewer PII is not stored in Git tracked docs');
    expect(realReviewerReplacement).toContain('RepoAssure reviewer allow');
    expect(realReviewerReplacement).toContain('pnpm verify:cloudflare-preview');
    expect(realReviewerReplacement).toContain('Do not send reviewer invitations from this goal');
    expect(realReviewerReplacement).toContain('No OTP, cookie, Access token, login query-state');
    expect(identityReconciliation).toContain('Private Preview Real Reviewer Replacement');
    expect(identityReconciliation).toContain('maintainer_test_identity_corrected');
    expect(dispatchReadiness).toContain('Private Preview Reviewer Identity Correction');
    expect(dispatchReadiness).toContain('confirmed-reviewer-1');
    expect(dispatchReadiness).toContain('confirmed-reviewer-2');
    expect(dispatchReadiness).toContain('maintainer-owned access smoke test identities');
    expect(publicWebsiteHandoff).toContain('Private Preview Real Reviewer Replacement');
    expect(acceptanceChecklist).toContain('Private Preview Real Reviewer Replacement');
    expect(testingStrategy).toContain('Private Preview Real Reviewer Replacement');
    expect(devLog).toContain('Private Preview Real Reviewer Replacement v0.1');

    await expectPath('docs/operations/private-preview-real-reviewer-replacement-v0.1.md');
  });

  it('records private preview reviewer handoff package and pending dispatch execution without reviewer PII', async () => {
    const [handoffDispatch, reviewerHandoff, dispatchReadiness, publicWebsiteHandoff, acceptanceChecklist, testingStrategy, devLog] =
      await Promise.all([
        readFile('docs/operations/private-preview-reviewer-handoff-package-and-dispatch-execution-v0.1.md', 'utf8'),
        readFile('docs/operations/private-preview-reviewer-handoff-v0.1.md', 'utf8'),
        readFile('docs/operations/private-preview-reviewer-handoff-dispatch-readiness-v0.1.md', 'utf8'),
        readFile('docs/operations/public-website-release-candidate-handoff-v0.1.md', 'utf8'),
        readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
        readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
        readFile('docs/logs/dev-log.md', 'utf8')
      ]);

    expect(handoffDispatch).toContain('Private Preview Reviewer Handoff Package and Dispatch Execution v0.1');
    expect(handoffDispatch).toContain('Status: waiting_for_reviewer_feedback');
    expect(handoffDispatch).toContain('Stage 1: Handoff package generated');
    expect(handoffDispatch).toContain('Stage 2: Dispatch execution pending channel confirmation');
    expect(handoffDispatch).toContain('confirmed-reviewer-1');
    expect(handoffDispatch).toContain('confirmed-reviewer-2');
    expect(handoffDispatch).toContain('https://repoassure-preview.pages.dev');
    expect(handoffDispatch).toContain('No outbound message was sent');
    expect(handoffDispatch).toContain('Reviewer PII is not stored in Git tracked docs');
    expect(handoffDispatch).toContain('Do not record OTP, cookie, Access token, login query-state');
    expect(handoffDispatch).toContain('Do not create external issues from this goal');
    expect(handoffDispatch).not.toContain('@gmail.com');
    expect(reviewerHandoff).toContain('Private Preview Reviewer Handoff Package and Dispatch Execution');
    expect(dispatchReadiness).toContain('Private Preview Reviewer Handoff Package and Dispatch Execution');
    expect(publicWebsiteHandoff).toContain('Private Preview Reviewer Handoff Package and Dispatch Execution');
    expect(acceptanceChecklist).toContain('Private Preview Reviewer Handoff Package and Dispatch Execution');
    expect(testingStrategy).toContain('Private Preview Reviewer Handoff Package and Dispatch Execution');
    expect(devLog).toContain('Private Preview Reviewer Handoff Package and Dispatch Execution v0.1');

    await expectPath('docs/operations/private-preview-reviewer-handoff-package-and-dispatch-execution-v0.1.md');
  });

  it('corrects private preview reviewer identities to maintainer-owned access smoke identities', async () => {
    const [
      identityCorrection,
      realReviewerReplacement,
      identityReconciliation,
      dispatchReadiness,
      handoffDispatch,
      publicWebsiteHandoff,
      acceptanceChecklist,
      testingStrategy,
      devLog
    ] = await Promise.all([
      readFile('docs/operations/private-preview-reviewer-identity-correction-v0.1.md', 'utf8'),
      readFile('docs/operations/private-preview-real-reviewer-replacement-v0.1.md', 'utf8'),
      readFile('docs/operations/private-preview-reviewer-identity-reconciliation-v0.1.md', 'utf8'),
      readFile('docs/operations/private-preview-reviewer-handoff-dispatch-readiness-v0.1.md', 'utf8'),
      readFile('docs/operations/private-preview-reviewer-handoff-package-and-dispatch-execution-v0.1.md', 'utf8'),
      readFile('docs/operations/public-website-release-candidate-handoff-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(identityCorrection).toContain('Private Preview Reviewer Identity Correction v0.1');
    expect(identityCorrection).toContain('Status: maintainer_test_identity_corrected');
    expect(identityCorrection).toContain('maintainer-test-email-1');
    expect(identityCorrection).toContain('maintainer-test-email-2');
    expect(identityCorrection).toContain('maintainer-owned access smoke test identities');
    expect(identityCorrection).toContain('not external reviewers');
    expect(identityCorrection).toContain('does not count as external reviewer feedback');
    expect(identityCorrection).toContain('Cloudflare Access/OTP smoke');
    expect(identityCorrection).toContain('No outbound reviewer invitation was sent');
    expect(identityCorrection).toContain('Do not record real reviewer email addresses in Git tracked docs');
    expect(identityCorrection).not.toContain('@gmail.com');
    expect(realReviewerReplacement).toContain('Private Preview Reviewer Identity Correction');
    expect(realReviewerReplacement).toContain('maintainer_test_identity_corrected');
    expect(identityReconciliation).toContain('Private Preview Reviewer Identity Correction');
    expect(identityReconciliation).toContain('maintainer-owned access smoke test identities');
    expect(dispatchReadiness).toContain('maintainer-owned access smoke test identities');
    expect(handoffDispatch).toContain('maintainer-owned access smoke test identities');
    expect(publicWebsiteHandoff).toContain('Private Preview Reviewer Identity Correction');
    expect(acceptanceChecklist).toContain('Private Preview Reviewer Identity Correction');
    expect(testingStrategy).toContain('Private Preview Reviewer Identity Correction');
    expect(devLog).toContain('Private Preview Reviewer Identity Correction v0.1');
  });

  it('plans external reviewer recruitment and dispatch without sending invitations', async () => {
    const [
      recruitmentPlan,
      identityCorrection,
      dispatchReadiness,
      handoffDispatch,
      publicWebsiteHandoff,
      acceptanceChecklist,
      testingStrategy,
      devLog
    ] = await Promise.all([
      readFile('docs/operations/private-preview-external-reviewer-recruitment-and-dispatch-plan-v0.1.md', 'utf8'),
      readFile('docs/operations/private-preview-reviewer-identity-correction-v0.1.md', 'utf8'),
      readFile('docs/operations/private-preview-reviewer-handoff-dispatch-readiness-v0.1.md', 'utf8'),
      readFile('docs/operations/private-preview-reviewer-handoff-package-and-dispatch-execution-v0.1.md', 'utf8'),
      readFile('docs/operations/public-website-release-candidate-handoff-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(recruitmentPlan).toContain('Private Preview External Reviewer Recruitment and Dispatch Plan v0.1');
    expect(recruitmentPlan).toContain('Status: ready_for_external_reviewer_selection');
    expect(recruitmentPlan).toContain('external reviewer');
    expect(recruitmentPlan).toContain('not maintainer-owned');
    expect(recruitmentPlan).toContain('minimum reviewer count: 2');
    expect(recruitmentPlan).toContain('developer builder');
    expect(recruitmentPlan).toContain('engineering lead');
    expect(recruitmentPlan).toContain('security-minded reviewer');
    expect(recruitmentPlan).toContain('manual maintainer email');
    expect(recruitmentPlan).toContain('Resend');
    expect(recruitmentPlan).toContain('No invitation was sent');
    expect(recruitmentPlan).toContain('Do not add reviewers to Cloudflare Access from this goal');
    expect(recruitmentPlan).toContain('Do not record real reviewer email addresses in Git tracked docs');
    expect(recruitmentPlan).toContain('Do not create external issues from this goal');
    expect(recruitmentPlan).toContain('Do not treat maintainer-owned access smoke test identities as external reviewers');
    expect(recruitmentPlan).toContain('waiting_for_reviewer_feedback');
    expect(recruitmentPlan).not.toContain('@gmail.com');
    expect(identityCorrection).toContain('Private Preview External Reviewer Recruitment and Dispatch Plan');
    expect(dispatchReadiness).toContain('Private Preview External Reviewer Recruitment and Dispatch Plan');
    expect(handoffDispatch).toContain('Private Preview External Reviewer Recruitment and Dispatch Plan');
    expect(publicWebsiteHandoff).toContain('Private Preview External Reviewer Recruitment and Dispatch Plan');
    expect(acceptanceChecklist).toContain('Private Preview External Reviewer Recruitment and Dispatch Plan');
    expect(testingStrategy).toContain('Private Preview External Reviewer Recruitment and Dispatch Plan');
    expect(devLog).toContain('Private Preview External Reviewer Recruitment and Dispatch Plan v0.1');
  });

  it('selects external reviewer slots without recording emails or sending invitations', async () => {
    const [
      selection,
      recruitmentPlan,
      dispatchReadiness,
      handoffDispatch,
      publicWebsiteHandoff,
      acceptanceChecklist,
      testingStrategy,
      devLog
    ] = await Promise.all([
      readFile('docs/operations/private-preview-external-reviewer-selection-v0.1.md', 'utf8'),
      readFile('docs/operations/private-preview-external-reviewer-recruitment-and-dispatch-plan-v0.1.md', 'utf8'),
      readFile('docs/operations/private-preview-reviewer-handoff-dispatch-readiness-v0.1.md', 'utf8'),
      readFile('docs/operations/private-preview-reviewer-handoff-package-and-dispatch-execution-v0.1.md', 'utf8'),
      readFile('docs/operations/public-website-release-candidate-handoff-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(selection).toContain('Private Preview External Reviewer Selection v0.1');
    expect(selection).toContain('Status: ready_for_access_update_decision');
    expect(selection).toContain('external-reviewer-1');
    expect(selection).toContain('external-reviewer-2');
    expect(selection).toContain('developer builder');
    expect(selection).toContain('engineering lead');
    expect(selection).toContain('not maintainer-owned');
    expect(selection).toContain('manual maintainer email');
    expect(selection).toContain('Access update decision: required_before_dispatch');
    expect(selection).toContain('No invitation was sent');
    expect(selection).toContain('No Cloudflare Access reviewer was added');
    expect(selection).toContain('Do not record real reviewer email addresses in Git tracked docs');
    expect(selection).toContain('Do not create external issues from this goal');
    expect(selection).toContain('Do not invent reviewer feedback');
    expect(selection).not.toContain('@gmail.com');
    expect(recruitmentPlan).toContain('Private Preview External Reviewer Selection');
    expect(dispatchReadiness).toContain('Private Preview External Reviewer Selection');
    expect(handoffDispatch).toContain('Private Preview External Reviewer Selection');
    expect(publicWebsiteHandoff).toContain('Private Preview External Reviewer Selection');
    expect(acceptanceChecklist).toContain('Private Preview External Reviewer Selection');
    expect(testingStrategy).toContain('Private Preview External Reviewer Selection');
    expect(devLog).toContain('Private Preview External Reviewer Selection v0.1');
  });

  it('records Cloudflare remote preview execution as blocked before website upload when Access is unavailable', async () => {
    const [blockers, devLog, publicWebsiteHandoff, acceptanceChecklist, testingStrategy] = await Promise.all([
      readFile('docs/logs/blockers.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8'),
      readFile('docs/operations/public-website-release-candidate-handoff-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8')
    ]);

    expect(blockers).toContain('Cloudflare Pages + Access private preview execution is blocked before website upload');
    expect(blockers).toContain('repoassure-preview');
    expect(blockers).toContain('repoassure-preview.pages.dev');
    expect(blockers).toContain('accounts/.../access/apps');
    expect(blockers).toContain('Authentication error');
    expect(blockers).toContain('No website source or build output was uploaded');
    expect(blockers).toContain('wrangler pages deployment list --project-name repoassure-preview');
    expect(devLog).toContain('Cloudflare Pages + Access Private Preview Execution v0.1 Blocked');
    expect(devLog).toContain('Successfully created the `repoassure-preview` Pages project');
    expect(devLog).toContain('Access API returned `Authentication error`');
    expect(devLog).toContain('No website source or build output was uploaded');
    expect(publicWebsiteHandoff).toContain('Cloudflare Pages + Access Private Preview Execution Blocked');
    expect(publicWebsiteHandoff).toContain('repoassure-preview.pages.dev');
    expect(publicWebsiteHandoff).toContain('No deployment exists for `repoassure-preview`');
    expect(acceptanceChecklist).toContain('Cloudflare Pages + Access Private Preview Execution Blocked');
    expect(testingStrategy).toContain('Cloudflare Pages + Access Private Preview Execution Blocked');
  });

  it('extracts acceptance command ownership into a workspace package while preserving compatibility outputs', async () => {
    const [rootPackageJson, acceptancePackageJson, acceptanceCompatibility, acceptanceReadme, monorepoSpec] = await Promise.all([
      readFile('package.json', 'utf8'),
      readFile('packages/acceptance/package.json', 'utf8'),
      readFile('packages/acceptance/src/compatibility.ts', 'utf8'),
      readFile('packages/acceptance/README.md', 'utf8'),
      readFile('docs/architecture/specs/monorepo-structure-spec-v0.1.md', 'utf8')
    ]);

    expect(rootPackageJson).toContain('"build": "pnpm build:packages && pnpm build:src && pnpm build:website"');
    expect(rootPackageJson).toContain('"build:website": "pnpm --filter @repoassure/website build"');
    expect(rootPackageJson).toContain('"build:src": "tsc -p tsconfig.build.json"');
    expect(rootPackageJson).toContain('"build:packages": "pnpm build:shared && pnpm build:security-assurance && pnpm build:browser-explorer && pnpm build:repair-planner && pnpm build:acceptance"');
    expect(rootPackageJson).toContain('"build:shared": "tsc -p packages/shared/tsconfig.build.json"');
    expect(rootPackageJson).toContain('"build:security-assurance": "tsc -p packages/security-assurance/tsconfig.build.json"');
    expect(rootPackageJson).toContain('"build:browser-explorer": "tsc -p packages/browser-explorer/tsconfig.build.json"');
    expect(rootPackageJson).toContain('"build:repair-planner": "tsc -p packages/repair-planner/tsconfig.build.json"');
    expect(rootPackageJson).toContain('"build:acceptance": "tsc -p packages/acceptance/tsconfig.build.json"');
    expect(rootPackageJson).toContain('"typecheck": "pnpm build:packages && tsc --noEmit && pnpm typecheck:packages && pnpm typecheck:website"');
    expect(rootPackageJson).toContain('"typecheck:website": "pnpm --filter @repoassure/website typecheck"');
    expect(rootPackageJson).toContain('"typecheck:packages": "pnpm typecheck:shared && pnpm typecheck:security-assurance && pnpm typecheck:browser-explorer && pnpm typecheck:repair-planner && pnpm typecheck:acceptance"');
    expect(rootPackageJson).toContain('"typecheck:shared": "tsc -p packages/shared/tsconfig.json --noEmit"');
    expect(rootPackageJson).toContain('"typecheck:security-assurance": "tsc -p packages/security-assurance/tsconfig.json --noEmit"');
    expect(rootPackageJson).toContain('"typecheck:browser-explorer": "tsc -p packages/browser-explorer/tsconfig.json --noEmit"');
    expect(rootPackageJson).toContain('"typecheck:repair-planner": "tsc -p packages/repair-planner/tsconfig.json --noEmit"');
    expect(rootPackageJson).toContain('"typecheck:acceptance": "tsc -p packages/acceptance/tsconfig.json --noEmit"');
    expect(rootPackageJson).toContain('"@hardening-mcp/acceptance": "workspace:*"');
    expect(rootPackageJson).toContain('"@hardening-mcp/security-assurance": "workspace:*"');
    expect(rootPackageJson).toContain('"acceptance": "node packages/acceptance/dist/run-acceptance.js"');
    expect(rootPackageJson).toContain('"goal:audit": "node packages/acceptance/dist/run-goal-audit.js"');
    expect(rootPackageJson).toContain('"user:accept": "node packages/acceptance/dist/run-user-acceptance.js"');
    expect(rootPackageJson).toContain('"user:handoff": "node packages/acceptance/dist/run-user-acceptance-handoff.js"');
    expect(rootPackageJson).toContain('"hardening": "dist/adapters/cli/index.js"');
    expect(rootPackageJson).toContain('"hardening-mcp": "dist/adapters/mcp/index.js"');

    expect(acceptancePackageJson).toContain('"name": "@hardening-mcp/acceptance"');
    expect(acceptancePackageJson).toContain('"main": "dist/index.js"');
    expect(acceptancePackageJson).toContain('"./compatibility":');
    expectPackageExport(acceptancePackageJson, './run-acceptance', './dist/run-acceptance.d.ts', './dist/run-acceptance.js');
    expectPackageExport(acceptancePackageJson, './run-goal-audit', './dist/run-goal-audit.d.ts', './dist/run-goal-audit.js');
    expectPackageExport(
      acceptancePackageJson,
      './run-user-acceptance',
      './dist/run-user-acceptance.d.ts',
      './dist/run-user-acceptance.js'
    );
    expectPackageExport(
      acceptancePackageJson,
      './run-user-acceptance-handoff',
      './dist/run-user-acceptance-handoff.d.ts',
      './dist/run-user-acceptance-handoff.js'
    );
    expect(acceptancePackageJson).toContain('"./markdown":');
    expect(acceptancePackageJson).toContain('"./report":');
    expect(acceptancePackageJson).toContain('"./goal-audit":');
    expect(acceptancePackageJson).toContain('"./goal-audit-requirements":');
    expect(acceptancePackageJson).toContain('"./goal-audit-user-acceptance":');
    expect(acceptancePackageJson).toContain('"./goal-audit-user-acceptance-materials":');
    expect(acceptancePackageJson).toContain('"./goal-audit-sources":');
    expect(acceptancePackageJson).toContain('"./goal-audit-delivery":');
    expect(acceptancePackageJson).toContain('"./goal-audit-runtime":');
    expect(acceptancePackageJson).toContain('"./goal-audit-workflow-artifacts":');
    expect(acceptancePackageJson).toContain('"./goal-audit-observability-security":');
    expect(acceptancePackageJson).toContain('"./goal-audit-process-governance":');
    expect(acceptancePackageJson).toContain('"./goal-audit-evidence-documents":');
    expect(acceptancePackageJson).toContain('"./goal-audit-current-items":');
    expect(acceptancePackageJson).toContain('"./user-acceptance":');
    expect(acceptancePackageJson).toContain('"./user-acceptance-handoff":');
    expect(acceptancePackageJson).toContain('"./fatal-error":');
    expect(acceptancePackageJson).toContain('"./redaction":');
    expect(acceptancePackageJson).toContain('"./repo-preflight":');
    expect(acceptancePackageJson).toContain('"./user-acceptance-args":');
    expect(acceptancePackageJson).toContain('"./shell-quote":');
    expect(acceptancePackageJson).toContain('"./shell-words":');
    expect(acceptancePackageJson).toContain('"./user-acceptance-record":');
    expect(acceptancePackageJson).toContain('"./user-acceptance-runner-helpers":');
    expect(acceptanceCompatibility).toContain('new URL(acceptanceEntrypointFiles[kind], baseUrl)');
    expect(acceptanceCompatibility).not.toContain('../../../dist/internal/acceptance');
    expect(acceptanceReadme).toContain('Phase 2 acceptance package pilot');
    expect(acceptanceReadme).toContain('Phase 2b package-owned implementation modules');
    expect(acceptanceReadme).toContain('This package owns acceptance implementation modules and runner entrypoints');
    expect(acceptanceReadme).toContain('Own package runner entrypoints for `acceptance`, `goal:audit`, `user:accept`, and `user:handoff`');
    expect(acceptanceReadme).not.toContain('This package owns the acceptance command entrypoint layer');
    expect(acceptanceReadme).not.toContain('Build package-owned wrappers for `acceptance`, `goal:audit`, `user:accept`, and `user:handoff`');
    expect(acceptanceReadme).toContain('`compatibility`');
    expect(acceptanceReadme).toContain('`goal-audit`');
    expect(acceptanceReadme).toContain('`goal-audit-requirements`');
    expect(acceptanceReadme).toContain('`goal-audit-user-acceptance`');
    expect(acceptanceReadme).toContain('`goal-audit-user-acceptance-materials`');
    expect(acceptanceReadme).toContain('`goal-audit-sources`');
    expect(acceptanceReadme).toContain('`goal-audit-delivery`');
    expect(acceptanceReadme).toContain('`goal-audit-runtime`');
    expect(acceptanceReadme).toContain('`goal-audit-workflow-artifacts`');
    expect(acceptanceReadme).toContain('`goal-audit-observability-security`');
    expect(acceptanceReadme).toContain('`goal-audit-process-governance`');
    expect(acceptanceReadme).toContain('`goal-audit-evidence-documents`');
    expect(acceptanceReadme).toContain('`goal-audit-current-items`');
    expect(acceptanceReadme).toContain('`user-acceptance`');
    expect(acceptanceReadme).toContain('`user-acceptance-handoff`');
    expect(acceptanceReadme).toContain('`fatal-error`');
    expect(acceptanceReadme).toContain('`redaction`');
    expect(acceptanceReadme).toContain('`repo-preflight`');
    expect(acceptanceReadme).toContain('`user-acceptance-args`');
    expect(acceptanceReadme).toContain('`run-acceptance`');
    expect(acceptanceReadme).toContain('`run-user-acceptance-handoff`');
    expect(acceptanceReadme).toContain('`shell-quote`');
    expect(acceptanceReadme).toContain('`shell-words`');
    expect(acceptanceReadme).toContain('`user-acceptance-record`');
    expect(acceptanceReadme).toContain('`user-acceptance-runner-helpers`');
    expect(acceptanceReadme).toContain('`run-user-acceptance`');
    expect(acceptanceReadme).toContain('`run-goal-audit`');
    expect(monorepoSpec).toContain('Phase 2 acceptance package pilot status: implemented as package-owned runner entrypoints with compatibility outputs');
    expect(monorepoSpec).toContain('Extract `packages/acceptance` first as the Phase 2 implementation-owner pilot');
    expect(monorepoSpec).not.toContain('Extract `packages/acceptance` first as a compatibility-wrapper pilot');
    expect(monorepoSpec).not.toContain('`packages/acceptance` now owns wrapper entrypoints');
    expect(monorepoSpec).toContain('`compatibility`, `markdown`, `report`, `goal-audit`, `goal-audit-requirements`, `goal-audit-user-acceptance`, `goal-audit-user-acceptance-materials`, `goal-audit-sources`, `goal-audit-delivery`, `goal-audit-runtime`, `goal-audit-workflow-artifacts`, `goal-audit-observability-security`, `goal-audit-process-governance`, `goal-audit-evidence-documents`, `goal-audit-current-items`, `user-acceptance`, `user-acceptance-handoff`, `fatal-error`, `redaction`, `repo-preflight`, `user-acceptance-args`, `run-acceptance`, `run-user-acceptance-handoff`, `shell-quote`, `shell-words`, `user-acceptance-record`, `user-acceptance-runner-helpers`, `run-user-acceptance`, and `run-goal-audit` as implementation modules');

    await expectPath('packages/acceptance/package.json');
    await expectPath('packages/acceptance/tsconfig.json');
    await expectPath('packages/acceptance/tsconfig.build.json');
    await expectPath('packages/acceptance/src/index.ts');
    await expectPath('packages/acceptance/src/compatibility.ts');
    await expectPath('packages/acceptance/src/fatal-error.ts');
    await expectPath('packages/acceptance/src/goal-audit.ts');
    await expectPath('packages/acceptance/src/goal-audit-requirements.ts');
    await expectPath('packages/acceptance/src/goal-audit-user-acceptance.ts');
    await expectPath('packages/acceptance/src/goal-audit-user-acceptance-materials.ts');
    await expectPath('packages/acceptance/src/goal-audit-sources.ts');
    await expectPath('packages/acceptance/src/goal-audit-delivery.ts');
    await expectPath('packages/acceptance/src/goal-audit-runtime.ts');
    await expectPath('packages/acceptance/src/goal-audit-workflow-artifacts.ts');
    await expectPath('packages/acceptance/src/goal-audit-observability-security.ts');
    await expectPath('packages/acceptance/src/goal-audit-process-governance.ts');
    await expectPath('packages/acceptance/src/goal-audit-evidence-documents.ts');
    await expectPath('packages/acceptance/src/goal-audit-current-items.ts');
    await expectPath('packages/acceptance/src/markdown.ts');
    await expectPath('packages/acceptance/src/repo-preflight.ts');
    await expectPath('packages/acceptance/src/report.ts');
    await expectPath('packages/acceptance/src/python-cli-profile.ts');
    await expectPath('packages/acceptance/src/python-cli-checks.ts');
    await expectPath('packages/acceptance/src/python-cli-artifacts.ts');
    await expectPath('packages/acceptance/src/user-acceptance.ts');
    await expectPath('packages/acceptance/src/user-acceptance-args.ts');
    await expectPath('packages/acceptance/src/user-acceptance-handoff.ts');
    await expectPath('packages/acceptance/src/shell-words.ts');
    await expectPath('packages/acceptance/src/user-acceptance-record.ts');
    await expectPath('packages/acceptance/src/user-acceptance-runner-helpers.ts');
    await expectPath('packages/acceptance/src/run-acceptance.ts');
    await expectPath('packages/acceptance/src/run-goal-audit.ts');
    await expectPath('packages/acceptance/src/run-user-acceptance.ts');
    await expectPath('packages/acceptance/src/run-user-acceptance-handoff.ts');
  });

  it('keeps package-owned handoff runner on the package goal audit workspace path', async () => {
    const [handoffRunner, acceptanceReadme, monorepoSpec] = await Promise.all([
      readFile('packages/acceptance/src/run-user-acceptance-handoff.ts', 'utf8'),
      readFile('packages/acceptance/README.md', 'utf8'),
      readFile('docs/architecture/specs/monorepo-structure-spec-v0.1.md', 'utf8')
    ]);

    expect(handoffRunner).toContain("import { buildGoalAuditItemsFromWorkspace } from './run-goal-audit.js'");
    expect(handoffRunner).toContain('buildGoalAuditItemsFromWorkspace({ root })');
    expect(handoffRunner).not.toContain("dist/internal/acceptance/run-goal-audit.js");
    expect(acceptanceReadme).toContain('Run `user:handoff` through the package-owned goal audit workspace builder');
    expect(monorepoSpec).toContain('`user:handoff` now consumes the package-owned goal audit workspace builder');
  });

  it('keeps goal audit source collection pointed at package-owned acceptance implementations', async () => {
    const [goalAuditSources, processGovernance, acceptanceReadme, monorepoSpec] = await Promise.all([
      readFile('packages/acceptance/src/goal-audit-sources.ts', 'utf8'),
      readFile('packages/acceptance/src/goal-audit-process-governance.ts', 'utf8'),
      readFile('packages/acceptance/README.md', 'utf8'),
      readFile('docs/architecture/specs/monorepo-structure-spec-v0.1.md', 'utf8')
    ]);

    expect(goalAuditSources).toContain("userAcceptanceHandoffBuilder: 'packages/acceptance/src/user-acceptance-handoff.ts'");
    expect(goalAuditSources).toContain("userAcceptanceHandoffRunner: 'packages/acceptance/src/run-user-acceptance-handoff.ts'");
    expect(goalAuditSources).toContain("repoPreflight: 'packages/acceptance/src/repo-preflight.ts'");
    expect(goalAuditSources).toContain("userAcceptanceArgs: 'packages/acceptance/src/user-acceptance-args.ts'");
    expect(goalAuditSources).toContain("userAcceptanceBuilder: 'packages/acceptance/src/user-acceptance.ts'");
    expect(goalAuditSources).toContain("userAcceptanceRunner: 'packages/acceptance/src/run-user-acceptance.ts'");
    expect(goalAuditSources).toContain("goalAuditSource: 'packages/acceptance/src/run-goal-audit.ts'");
    expect(goalAuditSources).toContain('LEGACY_ACCEPTANCE_WRAPPER_SOURCE_SPECS');
    expect(goalAuditSources).toContain('buildLegacyAcceptanceTextSourcePaths()');
    expect(goalAuditSources).toContain('legacyAcceptanceWrapperSourceEntries');
    expect(goalAuditSources).not.toContain('`src/internal/acceptance/${moduleName}.ts`');
    expect(goalAuditSources).toContain('legacyAcceptanceDistOutputEntries');
    expect(goalAuditSources).toContain('entry.jsPath');
    expect(goalAuditSources).toContain('entry.declarationPath');
    expect(goalAuditSources).toContain('entry.sourceMapPath');
    expect(goalAuditSources).toContain('PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS');
    expect(goalAuditSources).toContain('LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS');
    expect(goalAuditSources).not.toContain('`dist/internal/acceptance/${moduleName}.js`');
    expect(goalAuditSources).not.toContain('`dist/internal/acceptance/${moduleName}.d.ts`');
    expect(goalAuditSources).not.toContain('`dist/internal/acceptance/${moduleName}.js.map`');
    expect(processGovernance).toContain('acceptancePackageExportEntries');
    expect(processGovernance).toContain('unexpected export');
    expect(processGovernance).not.toContain('acceptanceCompatibilityContract.packageOwnedModules.map');
    expect(processGovernance).not.toContain('as GoalAuditTextSourceKey');
    expect(processGovernance).not.toContain("['./compatibility', './dist/compatibility.d.ts', './dist/compatibility.js']");
    expect(acceptanceReadme).toContain('Collect goal audit source evidence from package-owned acceptance implementation files');
    expect(acceptanceReadme).toContain('Derive `acceptancePackageDistOutputEntries` from `acceptancePackageExportEntries`');
    expect(acceptanceReadme).toContain('including `sourceMapPath` for package `.js.map` outputs');
    expect(acceptanceReadme).toContain('Derive `acceptancePackageSourceEntries` from `acceptanceCompatibilityContract.packageOwnedModules`');
    expect(acceptanceReadme).toContain('Derive `PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS`, `PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS`, and `PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS` from `acceptancePackageDistOutputEntries`');
    expect(acceptanceReadme).toContain('Derive `legacyAcceptanceWrapperSourceEntries` from `legacyAcceptanceCompatibilityModules`');
    expect(acceptanceReadme).toContain('Derive `acceptanceRuntimeContractSpecifiers` from the package name');
    expect(acceptanceReadme).toContain('root plus compatibility subpaths expose the same `acceptancePackageExportEntries`, `acceptancePackageDistOutputEntries`, `acceptancePackageSourceEntries`, `legacyAcceptanceDistOutputEntries`, and `legacyAcceptanceWrapperSourceEntries` runtime contracts');
    expect(acceptanceReadme).toContain('root plus `goal-audit-sources` subpath expose the same `PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS`, `PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS`, `PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS`, and `LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS` runtime contracts');
    expect(acceptanceReadme).toContain('`LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS`, through the published `types` entries');
    expect(acceptanceReadme).toContain('Derive `legacyAcceptanceDistOutputEntries` from `legacyAcceptanceCompatibilityModules`');
    expect(monorepoSpec).toContain('goal audit source collection now reads package-owned acceptance implementation files');
    expect(monorepoSpec).toContain('acceptancePackageDistOutputEntries');
    expect(monorepoSpec).toContain('`acceptancePackageDistOutputEntries` and `legacyAcceptanceDistOutputEntries` include `.js.map` source map paths');
    expect(monorepoSpec).toContain('acceptancePackageSourceEntries');
    expect(monorepoSpec).toContain('PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS');
    expect(monorepoSpec).toContain('PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS');
    expect(monorepoSpec).toContain('PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS');
    expect(monorepoSpec).toContain('root and `goal-audit-sources` package subpaths expose identical package and legacy source map source specs');
    expect(monorepoSpec).toContain('`LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS`, through the package `types` entries');
    expect(monorepoSpec).toContain('legacyAcceptanceWrapperSourceEntries');
  });

  it('keeps the legacy acceptance wrapper source contract synchronized with actual source files', async () => {
    const actualWrapperPaths = (await readdir('src/internal/acceptance'))
      .filter((fileName) => fileName.endsWith('.ts'))
      .map((fileName) => `src/internal/acceptance/${fileName}`)
      .sort();
    const contractWrapperPaths = legacyAcceptanceWrapperSourceEntries
      .map((entry) => entry.path)
      .sort();

    expect(contractWrapperPaths).toEqual(actualWrapperPaths);
    expect(legacyAcceptanceWrapperSourceEntries.map((entry) => entry.moduleName).sort()).toEqual([
      ...legacyAcceptanceCompatibilityModules
    ].sort());
  });

  it('keeps package export surface governance synchronized across migration documents', async () => {
    const [completedMigrationGoal, monorepoSpec, packageBuildAdr, acceptanceReadme] = await Promise.all([
      readFile('docs/goals/completed/2026-06-23-acceptance-package-migration.md', 'utf8'),
      readFile('docs/architecture/specs/monorepo-structure-spec-v0.1.md', 'utf8'),
      readFile('docs/adr/0006-package-build-strategy.md', 'utf8'),
      readFile('packages/acceptance/README.md', 'utf8')
    ]);
    const exactExportSurfaceMarker = 'exact package export surface';

    expect(completedMigrationGoal).toContain(exactExportSurfaceMarker);
    expect(monorepoSpec).toContain(exactExportSurfaceMarker);
    expect(packageBuildAdr).toContain(exactExportSurfaceMarker);
    expect(acceptanceReadme).toContain(exactExportSurfaceMarker);
    expect(completedMigrationGoal).toContain('unexpected `packages/acceptance/package.json` exports');
    expect(monorepoSpec).toContain('unexpected `packages/acceptance/package.json` exports');
    expect(packageBuildAdr).toContain('unexpected `packages/acceptance/package.json` exports');
    expect(completedMigrationGoal).toContain('acceptancePackageSourceEntries');
    expect(completedMigrationGoal).toContain('acceptancePackageDistOutputEntries');
    expect(completedMigrationGoal).toContain('PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS');
    expect(completedMigrationGoal).toContain('PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS');
    expect(completedMigrationGoal).toContain('PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS');
    expect(packageBuildAdr).toContain('acceptancePackageSourceEntries');
    expect(packageBuildAdr).toContain('acceptancePackageDistOutputEntries');
    expect(packageBuildAdr).toContain('PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS');
    expect(packageBuildAdr).toContain('PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS');
    expect(packageBuildAdr).toContain('PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS');
  });

  it('keeps current goal audit item construction owned by the package runner API', async () => {
    const [goalAuditRunner, goalAuditTests, acceptanceReadme, monorepoSpec, packageBuildAdr] = await Promise.all([
      readFile('packages/acceptance/src/run-goal-audit.ts', 'utf8'),
      readFile('tests/unit/goal-audit.test.ts', 'utf8'),
      readFile('packages/acceptance/README.md', 'utf8'),
      readFile('docs/architecture/specs/monorepo-structure-spec-v0.1.md', 'utf8'),
      readFile('docs/adr/0006-package-build-strategy.md', 'utf8')
    ]);

    expect(goalAuditRunner).toContain('export async function buildCurrentGoalAuditItems()');
    expect(goalAuditRunner).toContain('return buildGoalAuditItemsFromWorkspace({ root })');
    expect(goalAuditTests).toContain("from '../../packages/acceptance/src/run-goal-audit.js'");
    expect(goalAuditTests).toContain('buildCurrentGoalAuditItems');
    expect(goalAuditTests).toContain('buildGoalAuditItemsFromWorkspace');
    expect(goalAuditTests).toContain('runGoalAudit');
    expect(goalAuditTests).not.toContain('buildCurrentGoalAuditItems,\n  classifyUserAcceptanceRecord as classifyLegacyUserAcceptanceRecord');
    expect(acceptanceReadme).toContain('Expose `buildCurrentGoalAuditItems()` plus legacy-compatible goal audit helper exports');
    expect(monorepoSpec).toContain('Current goal audit item construction is owned by the package runner API');
    expect(packageBuildAdr).toContain('Current goal audit item construction is exposed from the package runner API');
  });

  it('keeps runner main smoke specifiers derived from acceptance entrypoint files', async () => {
    const [compatibility, acceptanceReadme] = await Promise.all([
      readFile('packages/acceptance/src/compatibility.ts', 'utf8'),
      readFile('packages/acceptance/README.md', 'utf8')
    ]);

    expect(compatibility).toContain('Object.values(acceptanceEntrypointFiles).map((fileName)');
    expect(compatibility).toContain("fileName.replace(/\\.js$/u, '')");
    expect(compatibility).not.toContain("`${acceptanceCompatibilityContract.packageName}/run-acceptance`,");
    expect(compatibility).not.toContain("`${acceptanceCompatibilityContract.packageName}/run-goal-audit`,");
    expect(compatibility).not.toContain("`${acceptanceCompatibilityContract.packageName}/run-user-acceptance`,");
    expect(compatibility).not.toContain("`${acceptanceCompatibilityContract.packageName}/run-user-acceptance-handoff`");
    expect(acceptanceReadme).toContain('Derive `acceptanceRunnerMainSpecifiers` from `acceptanceEntrypointFiles`');
  });

  it('keeps benchmark report ownership outside the acceptance package migration scope', async () => {
    const [completedMigrationGoal, acceptanceReadme, monorepoSpec] = await Promise.all([
      readFile('docs/goals/completed/2026-06-23-acceptance-package-migration.md', 'utf8'),
      readFile('packages/acceptance/README.md', 'utf8'),
      readFile('docs/architecture/specs/monorepo-structure-spec-v0.1.md', 'utf8')
    ]);

    expect(completedMigrationGoal).toContain('benchmark report ownership decision 仍保持在 `src/internal/benchmark`，不属于本 acceptance package 迁移的阻塞项');
    expect(acceptanceReadme).toContain('Benchmark report ownership remains outside this acceptance package migration');
    expect(acceptanceReadme).toContain('Preserve legacy compatibility outputs under `dist/internal/acceptance/*`');
    expect(acceptanceReadme).not.toContain('Preserve legacy implementation outputs under `dist/internal/acceptance/*`');
    expect(acceptanceReadme).not.toContain('Move benchmark report logic out of `src/internal/benchmark`');
    expect(acceptanceReadme).not.toContain('Move additional implementation files out of `src/internal/acceptance`');
    expect(monorepoSpec).toContain('| Acceptance | acceptance, user acceptance, and goal audit | `src/internal/acceptance` | `packages/acceptance` |');
    expect(monorepoSpec).toContain('| Benchmark | benchmark runner and spike report generation | `src/internal/benchmark`, `scripts/run-benchmark.mjs` | Deferred separate package decision |');
    expect(monorepoSpec).toContain('Benchmark report ownership remains outside the acceptance package pilot');
    expect(monorepoSpec).not.toContain('acceptance, user acceptance, goal audit, benchmark reports');
    expect(monorepoSpec).not.toContain('The next safe Phase 2 step is to move selected acceptance implementation modules');
  });

  it('keeps the completed acceptance package migration goal aligned with the current package-owned state', async () => {
    const [completedMigrationGoal, readme, monorepoSpec] = await Promise.all([
      readFile('docs/goals/completed/2026-06-23-acceptance-package-migration.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/architecture/specs/monorepo-structure-spec-v0.1.md', 'utf8')
    ]);

    expect(completedMigrationGoal).toContain('Phase 2 implementation modules now live under `packages/acceptance/src`');
    expect(completedMigrationGoal).toContain('`src/internal/acceptance/*` remains as compatibility wrappers');
    expect(completedMigrationGoal).toContain('`dist/internal/acceptance/*` remains as compatibility outputs');
    expect(completedMigrationGoal).toContain('`pnpm acceptance -- --full --browser` 通过 17/17');
    expect(completedMigrationGoal).toContain('`pnpm goal:audit` 显示自动可验证项 0 missing');
    expect(completedMigrationGoal).not.toContain('仍未完成：');
    expect(completedMigrationGoal).not.toContain('通过 15/15');
    expect(readme).toContain('monorepo 迁移已进入 Phase 2 package extraction');
    expect(readme).toContain('`packages/acceptance/` 已承载验收实现模块');
    expect(readme).toContain('`@hardening-mcp/shared` / `packages/shared/` 已承载脱敏、shell quoting 和 shell word parsing 共享工具实现');
    expect(readme).not.toContain('当前代码仍保持单包运行结构，monorepo 迁移处于 Phase 0 scaffold 阶段');
    expect(monorepoSpec).toContain('The current implementation is a phased monorepo workspace');
    expect(monorepoSpec).toContain('Remaining runtime code still has useful internal boundaries');
    expect(monorepoSpec).toContain('Acceptance runners already live under `packages/acceptance`');
    expect(monorepoSpec).not.toContain('The current implementation is still a single TypeScript package');
    expect(monorepoSpec).not.toContain('internal acceptance tooling, and future package boundaries are still coupled inside one package');
    expect(monorepoSpec).not.toContain('- Move acceptance runners to `packages/acceptance`.');
  });

  it('keeps legacy dist source map compatibility evidence aligned in migration governance docs', async () => {
    const [completedMigrationGoal, monorepoSpec, packageBuildAdr] = await Promise.all([
      readFile('docs/goals/completed/2026-06-23-acceptance-package-migration.md', 'utf8'),
      readFile('docs/architecture/specs/monorepo-structure-spec-v0.1.md', 'utf8'),
      readFile('docs/adr/0006-package-build-strategy.md', 'utf8')
    ]);

    expect(completedMigrationGoal).toContain(
      '`dist/internal/acceptance/*` remains as compatibility outputs, and `.js` runtime wrappers, `.d.ts` declaration re-exports, and `.js.map` source maps are now checked by goal audit.'
    );
    expect(completedMigrationGoal).toContain(
      '`legacyAcceptanceCompatibilityModules` now drives legacy wrapper, legacy dist JavaScript, legacy dist declaration, and legacy dist source map source specs'
    );
    expect(monorepoSpec).toContain(
      'legacy `dist/internal/acceptance/*` remains a compatibility output surface, not the package execution target, and `.js` runtime wrappers, `.d.ts` declaration re-exports, and `.js.map` source maps are checked by goal audit'
    );
    expect(packageBuildAdr).toContain(
      'Goal audit now checks generated `.js` wrappers, `.d.ts` declaration re-exports, and `.js.map` source maps under `dist/internal/acceptance/*`'
    );
  });

  it('records Codex Security strategy ADR cascade in the dev log entry', async () => {
    const [
      devLog,
      adrIndex,
      architectureOverview,
      mvpSpec,
      competitiveLandscape,
      commercializationStrategy,
      readme,
      decisionLog,
      codexSecurityAdr
    ] = await Promise.all([
      readFile('docs/logs/dev-log.md', 'utf8'),
      readFile('docs/adr/README.md', 'utf8'),
      readFile('docs/architecture/overview.md', 'utf8'),
      readFile('docs/product/specs/mvp-spec-v0.2.md', 'utf8'),
      readFile('docs/product/research/competitive-landscape-v0.1.md', 'utf8'),
      readFile('docs/product/strategy/commercialization-strategy-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/adr/0013-codex-security-and-security-assurance-lane.md', 'utf8')
    ]);
    const latestEntryStart = devLog.indexOf('## 2026年6月23日 - Codex Security Strategy ADR');
    const latestEntryEnd = devLog.indexOf('\n## 2026年6月23日 - Browser Explorer Package Phase 2e Extraction');
    const latestEntry = devLog.slice(latestEntryStart, latestEntryEnd);

    expect(latestEntryStart).toBeGreaterThan(devLog.indexOf('## '));
    expect(latestEntryEnd).toBeGreaterThan(latestEntryStart);
    expect(latestEntry).toContain('ADR-0013: Codex Security and Security Assurance Lane');
    expect(latestEntry).toContain('Security Assurance Lane');
    expect(latestEntry).toContain('provider-backed evidence lane');
    expect(latestEntry).toContain('未修改运行时代码');
    expect(latestEntry).toContain('pnpm repo:hygiene');

    expect(adrIndex).toContain('[0013](0013-codex-security-and-security-assurance-lane.md)');
    expect(codexSecurityAdr).toContain('RepoAssure will not position itself as a direct replacement for Codex Security');
    expect(codexSecurityAdr).toContain('Security Provider Interface');
    expect(codexSecurityAdr).toContain('repoassure security import --provider codex-security --scan-dir <scan-dir>');
    expect(architectureOverview).toContain('[ADR-0013](../adr/0013-codex-security-and-security-assurance-lane.md)');
    expect(architectureOverview).toContain('Security Assurance Lane');
    expect(mvpSpec).toContain('ADR-0013 将 Codex Security 视为优先集成的 security provider');
    expect(mvpSpec).toContain('当前已实现 Phase 1 本地 provider scan directory 导入 MVP');
    expect(mvpSpec).toContain('不自研 deep vulnerability scanner');
    expect(competitiveLandscape).toContain('Platform-native security scan');
    expect(competitiveLandscape).toContain('Codex Security');
    expect(competitiveLandscape).toContain('Provider-backed Security Assurance Lane');
    expect(commercializationStrategy).toContain('Do not position the product as a direct Codex Security replacement');
    expect(readme).toContain('ADR-0013 固化 Codex Security 影响下的 Security Assurance Lane 策略');
    expect(decisionLog).toContain('新增 `ADR-0013: Codex Security and Security Assurance Lane`');
  });

  it('keeps post-ADR-0013 governance cleanup and security lane specification current', async () => {
    const [
      activeGoalFiles,
      completedGoalFiles,
      securityLaneSpec,
      openCoreSpec,
      readme,
      architectureOverview,
      decisionLog,
      devLog
    ] = await Promise.all([
      readdir('docs/goals/active'),
      readdir('docs/goals/completed'),
      readFile('docs/architecture/specs/security-assurance-lane-spec-v0.1.md', 'utf8'),
      readFile('docs/product/strategy/open-core-packaging-spec-v0.1.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/architecture/overview.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);

    expect(activeGoalFiles).not.toContain('2026-06-20-acceptance-package-migration.md');
    expect(activeGoalFiles).not.toContain('2026-06-21-python-cli-acceptance-mode.md');
    expect(completedGoalFiles).toContain('2026-06-23-acceptance-package-migration.md');
    expect(completedGoalFiles).toContain('2026-06-21-python-cli-acceptance-mode.md');

    expect(openCoreSpec).toContain('| `packages/browser-explorer` | Open core | Implemented browser and route exploration package |');
    expect(openCoreSpec).toContain('| `packages/repair-planner` | Open core | Implemented repair plan and executable task package package |');
    expect(openCoreSpec).toContain('| `packages/security-assurance` | Open core | Implemented local-first provider security evidence import package |');
    expect(openCoreSpec).toContain('| Security Assurance Lane | Open core interface | Optional provider-backed security evidence import boundary |');
    expect(openCoreSpec).not.toContain('| `packages/browser-explorer` | Open core target | Future browser exploration package |');
    expect(openCoreSpec).not.toContain('| `packages/repair-planner` | Open core target | Future repair plan and task package package |');

    expect(securityLaneSpec).toContain('# Security Assurance Lane Spec v0.1');
    expect(securityLaneSpec).toContain('Status: Draft');
    expect(securityLaneSpec).toContain('Source ADR: [ADR-0013](../../adr/0013-codex-security-and-security-assurance-lane.md)');
    expect(securityLaneSpec).toContain('Codex Security is the preferred first provider');
    expect(securityLaneSpec).toContain('Provider provenance');
    expect(securityLaneSpec).toContain('Local-first evidence handling');
    expect(securityLaneSpec).toContain('Redaction requirements');
    expect(securityLaneSpec).toContain('Artifact layout');
    expect(securityLaneSpec).toContain('Repair plan and repair task package integration');
    expect(securityLaneSpec).toContain('Non-goals');
    expect(securityLaneSpec).toContain('no native deep vulnerability scanner');

    expect(readme).toContain('security-assurance-lane-spec-v0.1.md');
    expect(architectureOverview).toContain('security-assurance-lane-spec-v0.1.md');
    expect(decisionLog).toContain('自动化治理收口与 Security Assurance Lane 规格');
    expect(devLog).toContain('Governance Cleanup and Security Assurance Lane Spec');
  });

  it('keeps Security Assurance Lane Phase 1 package, CLI, and repair integration under structure governance', async () => {
    const [
      rootPackageJsonText,
      securityPackageJsonText,
      securityReadme,
      securityIndex,
      packageSubpathTypeSmoke,
      cliRun,
      repairPlanGenerator,
      monorepoSpec,
      architectureOverview,
      mvpSpec,
      readme,
      securityLaneSpec,
      packageSourceFiles
    ] = await Promise.all([
      readFile('package.json', 'utf8'),
      readFile('packages/security-assurance/package.json', 'utf8'),
      readFile('packages/security-assurance/README.md', 'utf8'),
      readFile('packages/security-assurance/src/index.ts', 'utf8'),
      readFile('tests/type-smoke/security-assurance-package-subpaths.ts', 'utf8'),
      readFile('src/adapters/cli/run.ts', 'utf8'),
      readFile('packages/repair-planner/src/generate-repair-plan.ts', 'utf8'),
      readFile('docs/architecture/specs/monorepo-structure-spec-v0.1.md', 'utf8'),
      readFile('docs/architecture/overview.md', 'utf8'),
      readFile('docs/product/specs/mvp-spec-v0.2.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/architecture/specs/security-assurance-lane-spec-v0.1.md', 'utf8'),
      listFiles('packages/security-assurance/src')
    ]);
    const rootPackageJson = JSON.parse(rootPackageJsonText) as {
      scripts?: Record<string, string>;
      dependencies?: Record<string, string>;
    };
    const securityPackageJson = JSON.parse(securityPackageJsonText) as {
      name?: string;
      main?: string;
      exports?: Record<string, { types?: string; default?: string } | string>;
    };
    const packageModuleNames = packageSourceFiles
      .filter((path) => path.endsWith('.ts'))
      .map((path) => path.replace('packages/security-assurance/src/', '').replace(/\.ts$/u, ''))
      .filter((moduleName) => moduleName !== 'index')
      .sort();

    expect(rootPackageJson.dependencies?.['@hardening-mcp/security-assurance']).toBe('workspace:*');
    expect(rootPackageJson.scripts?.['build:security-assurance']).toBe('tsc -p packages/security-assurance/tsconfig.build.json');
    expect(rootPackageJson.scripts?.['typecheck:security-assurance']).toBe('tsc -p packages/security-assurance/tsconfig.json --noEmit');
    expect(securityPackageJson.name).toBe('@hardening-mcp/security-assurance');
    expect(securityPackageJson.main).toBe('dist/index.js');
    expect(Object.entries(securityPackageJson.exports ?? {}).sort(([left], [right]) => left.localeCompare(right))).toEqual(
      [...securityAssurancePackageExportEntries]
        .map((entry) => [entry.exportPath, { types: entry.types, default: entry.default }])
        .sort(([left], [right]) => String(left).localeCompare(String(right)))
    );
    expect([...securityAssuranceCompatibilityContract.packageOwnedModules].sort()).toEqual(packageModuleNames);
    expect(securityAssurancePackageSourceEntries.map((entry) => entry.path).sort()).toEqual(
      packageSourceFiles.filter((path) => path.endsWith('.ts')).sort()
    );
    for (const entry of securityAssurancePackageDistOutputEntries) {
      expect(entry.jsPath).toContain('packages/security-assurance/dist/');
      expect(entry.declarationPath).toContain('packages/security-assurance/dist/');
      expect(entry.sourceMapPath).toContain('packages/security-assurance/dist/');
    }
    for (const moduleName of securityAssuranceCompatibilityContract.packageOwnedModules) {
      expect(packageSubpathTypeSmoke).toContain(`from '@hardening-mcp/security-assurance/${moduleName}'`);
      expect(securityAssurancePackageSubpathSpecifiers).toContain(`@hardening-mcp/security-assurance/${moduleName}`);
    }
    expect(packageSubpathTypeSmoke).toContain("from '@hardening-mcp/security-assurance'");
    expect(securityIndex).toContain("export * from './import-security-evidence.js'");
    expect(securityReadme).toContain('Security Assurance Lane Phase 1 package');
    expect(cliRun).toContain('hardening security import --provider <provider> --scan-dir <dir> --repo <repo> --run-dir <dir>');
    expect(repairPlanGenerator).toContain("readSecurityFindings(join(input.runDir, 'security', 'security-findings.json'))");
    expect(repairPlanGenerator).toContain("type: 'security'");
    expect(monorepoSpec).toContain('Phase 2f security-assurance package status: implemented');
    expect(architectureOverview).toContain('@hardening-mcp/security-assurance');
    expect(mvpSpec).toContain('Security Assurance Lane Phase 1');
    expect(readme).toContain('hardening security import --provider codex-security');
    expect(securityLaneSpec).toContain('Phase 1 implementation note');

    await expectPath('packages/security-assurance/package.json');
    await expectPath('packages/security-assurance/tsconfig.json');
    await expectPath('packages/security-assurance/tsconfig.build.json');
    await expectPath('packages/security-assurance/src/index.ts');
    await expectPath('packages/security-assurance/src/compatibility.ts');
    await expectPath('packages/security-assurance/src/import-security-evidence.ts');
    await expectPath('src/tools/security-import-tool.ts');
    await expectPath('fixtures/security/codex-security-basic/scan.json');
  });

  it('records current browser explorer package extraction evidence gates in the dev log entry', async () => {
    const devLog = await readFile('docs/logs/dev-log.md', 'utf8');
    const latestEntryStart = devLog.indexOf('## 2026年6月23日 - Browser Explorer Package Phase 2e Extraction');
    const latestEntryEnd = devLog.indexOf('\n## 2026年6月23日 - Repair Planner Package Phase 2d Extraction');
    const latestEntry = devLog.slice(latestEntryStart, latestEntryEnd);

    expect(latestEntryStart).toBeGreaterThan(devLog.indexOf('## '));
    expect(latestEntryEnd).toBeGreaterThan(latestEntryStart);
    expect(latestEntry).toContain('@hardening-mcp/browser-explorer');
    expect(latestEntry).toContain('Phase 2e browser-explorer package');
    expect(latestEntry).toContain('src/domain/explore/*');
    expect(latestEntry).toContain('packages/browser-explorer/dist');
    expect(latestEntry).toContain('Red：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/explore-app.test.ts tests/unit/playwright-driver.test.ts`');
    expect(latestEntry).toContain('3 个测试文件、81 个测试');
    expect(latestEntry).toContain('pnpm test:unit');
    expect(latestEntry).toContain('33 个测试文件、516 个测试');
    expect(latestEntry).toContain('pnpm test:integration');
    expect(latestEntry).toContain('11 个测试文件、27 个测试');
    expect(latestEntry).toContain('pnpm goal:audit');
    expect(latestEntry).toContain('31 项检查、30 项已通过、0 missing、1 项需要人工确认');
  });

  it('keeps legacy acceptance markdown as a package compatibility wrapper', async () => {
    const legacyMarkdown = await readFile('src/internal/acceptance/markdown.ts', 'utf8');

    expect(legacyMarkdown.trim()).toBe("export { escapeMarkdownTableCell, formatMarkdownCodeCell } from '../../../packages/acceptance/dist/markdown.js';");
  });

  it('keeps legacy acceptance fatal error formatting as a package compatibility wrapper', async () => {
    const legacyFatalError = await readFile('src/internal/acceptance/fatal-error.ts', 'utf8');

    expect(legacyFatalError.trim()).toBe("export { formatAcceptanceFatalError } from '../../../packages/acceptance/dist/fatal-error.js';");
  });

  it('keeps legacy acceptance repo preflight as a package compatibility wrapper', async () => {
    const legacyRepoPreflight = await readFile('src/internal/acceptance/repo-preflight.ts', 'utf8');

    expect(legacyRepoPreflight.trim()).toBe([
      'export {',
      '  buildPackageJsonManifestCheck,',
      '  buildPlaceholderRepoRootCheck,',
      '  buildPyprojectTomlManifestCheck,',
      '  buildRepoRootDirectoryCheck,',
      '  findRepoPathPlaceholder',
      "} from '../../../packages/acceptance/dist/repo-preflight.js';",
      'export type {',
      '  PackageJsonManifestCheckOptions,',
      '  PyprojectTomlManifestCheckOptions',
      "} from '../../../packages/acceptance/dist/repo-preflight.js';"
    ].join('\n'));
  });

  it('keeps legacy acceptance report as a package compatibility wrapper', async () => {
    const legacyReport = await readFile('src/internal/acceptance/report.ts', 'utf8');

    expect(legacyReport.trim()).toBe([
      'export {',
      '  buildAcceptanceMarkdown,',
      '  summarizeAcceptanceChecks',
      "} from '../../../packages/acceptance/dist/report.js';",
      'export type {',
      '  AcceptanceCheck,',
      '  AcceptanceCheckStatus,',
      '  AcceptanceOverallStatus,',
      '  AcceptanceSummary,',
      '  BuildAcceptanceMarkdownInput',
      "} from '../../../packages/acceptance/dist/report.js';"
    ].join('\n'));
  });

  it('keeps legacy user acceptance args as a package compatibility wrapper', async () => {
    const legacyUserAcceptanceArgs = await readFile('src/internal/acceptance/user-acceptance-args.ts', 'utf8');

    expect(legacyUserAcceptanceArgs.trim()).toBe([
      'export {',
      '  formatUserAcceptanceCommand,',
      '  parseUserAcceptanceArgs',
      "} from '../../../packages/acceptance/dist/user-acceptance-args.js';",
      'export type {',
      '  UserAcceptanceCliOptions,',
      '  UserAcceptanceMode',
      "} from '../../../packages/acceptance/dist/user-acceptance-args.js';"
    ].join('\n'));
  });

  it('keeps legacy user acceptance Markdown as a package compatibility wrapper', async () => {
    const legacyUserAcceptance = await readFile('src/internal/acceptance/user-acceptance.ts', 'utf8');

    expect(legacyUserAcceptance.trim()).toBe([
      'export {',
      '  buildUserAcceptanceMarkdown,',
      '  formatUserAcceptanceEvidenceCommand,',
      '  summarizeUserAcceptanceChecks',
      "} from '../../../packages/acceptance/dist/user-acceptance.js';",
      'export type {',
      '  UserAcceptanceCheck,',
      '  UserAcceptanceCheckStatus,',
      '  UserAcceptanceRecord,',
      '  UserAcceptanceRunStatus,',
      '  UserAcceptanceSummary,',
      '  UserDecision',
      "} from '../../../packages/acceptance/dist/user-acceptance.js';"
    ].join('\n'));
  });

  it('keeps legacy user acceptance handoff Markdown as a package compatibility wrapper', async () => {
    const legacyUserAcceptanceHandoff = await readFile('src/internal/acceptance/user-acceptance-handoff.ts', 'utf8');

    expect(legacyUserAcceptanceHandoff.trim()).toBe([
      "export { buildUserAcceptanceHandoffMarkdown } from '../../../packages/acceptance/dist/user-acceptance-handoff.js';",
      "export type { UserAcceptanceHandoffInput } from '../../../packages/acceptance/dist/user-acceptance-handoff.js';"
    ].join('\n'));
  });

  it('keeps legacy goal audit Markdown as a package compatibility wrapper', async () => {
    const legacyGoalAudit = await readFile('src/internal/acceptance/goal-audit.ts', 'utf8');

    expect(legacyGoalAudit.trim()).toBe([
      'export {',
      '  buildGoalAuditMarkdown,',
      '  summarizeGoalAudit',
      "} from '../../../packages/acceptance/dist/goal-audit.js';",
      'export type {',
      '  BuildGoalAuditMarkdownInput,',
      '  GoalAuditItem,',
      '  GoalAuditItemStatus,',
      '  GoalAuditOverallStatus,',
      '  GoalAuditSummary',
      "} from '../../../packages/acceptance/dist/goal-audit.js';"
    ].join('\n'));
  });

  it('keeps legacy acceptance runner as a package compatibility wrapper with direct-run support', async () => {
    const legacyAcceptanceRunner = await readFile('src/internal/acceptance/run-acceptance.ts', 'utf8');

    expect(legacyAcceptanceRunner.trim()).toBe([
      'import { formatAcceptanceFatalError } from \'../../../packages/acceptance/dist/fatal-error.js\';',
      'import {',
      '  isDirectRun as isAcceptanceDirectRun,',
      '  main as runAcceptanceMain',
      "} from '../../../packages/acceptance/dist/run-acceptance.js';",
      '',
      'export {',
      '  acceptanceHelpText,',
      '  formatAcceptanceCommand,',
      '  isAcceptanceHelpRequest,',
      '  isDirectRun,',
      '  main,',
      '  parseArgs',
      "} from '../../../packages/acceptance/dist/run-acceptance.js';",
      'export type {',
      '  AcceptanceCliOptions,',
      '  AcceptanceCommand',
      "} from '../../../packages/acceptance/dist/run-acceptance.js';",
      '',
      'if (isAcceptanceDirectRun(import.meta.url, process.argv[1])) {',
      '  runAcceptanceMain().then((exitCode) => {',
      '    process.exitCode = exitCode;',
      '  }).catch((error: unknown) => {',
      "    process.stderr.write(`${formatAcceptanceFatalError('Acceptance runner failed', error)}\\n`);",
      '    process.exitCode = 1;',
      '  });',
      '}'
    ].join('\n'));
  });

  it('keeps legacy user acceptance handoff runner as a package compatibility wrapper with direct-run support', async () => {
    const [packageHandoffRunner, legacyHandoffRunner] = await Promise.all([
      readFile('packages/acceptance/src/run-user-acceptance-handoff.ts', 'utf8'),
      readFile('src/internal/acceptance/run-user-acceptance-handoff.ts', 'utf8')
    ]);

    expect(packageHandoffRunner).toContain('export function isDirectRun(moduleUrl: string, argvPath: string | undefined): boolean');
    expect(legacyHandoffRunner.trim()).toBe([
      'import { formatAcceptanceFatalError } from \'../../../packages/acceptance/dist/fatal-error.js\';',
      'import {',
      '  isDirectRun as isUserAcceptanceHandoffDirectRun,',
      '  main as runUserAcceptanceHandoffMain',
      "} from '../../../packages/acceptance/dist/run-user-acceptance-handoff.js';",
      '',
      'export {',
      '  buildUserAcceptanceHandoffRepoPreflightChecks,',
      '  isDirectRun,',
      '  isUserAcceptanceHandoffHelpRequest,',
      '  main,',
      '  parseUserAcceptanceHandoffArgs,',
      '  runUserAcceptanceHandoff,',
      '  userAcceptanceHandoffHelpText,',
      '  writeGoalAuditDocument,',
      '  writeUserAcceptanceHandoff',
      "} from '../../../packages/acceptance/dist/run-user-acceptance-handoff.js';",
      'export type {',
      '  UserAcceptanceHandoffCliOptions,',
      '  UserAcceptanceHandoffRunInput,',
      '  UserAcceptanceHandoffRunOptions',
      "} from '../../../packages/acceptance/dist/run-user-acceptance-handoff.js';",
      '',
      'if (isUserAcceptanceHandoffDirectRun(import.meta.url, process.argv[1])) {',
      '  runUserAcceptanceHandoffMain().then((exitCode) => {',
      '    process.exitCode = exitCode;',
      '  }).catch((error: unknown) => {',
      "    process.stderr.write(`${formatAcceptanceFatalError('User acceptance handoff failed', error)}\\n`);",
      '    process.exitCode = 1;',
      '  });',
      '}'
    ].join('\n'));
  });

  it('keeps legacy goal audit runner as a package compatibility wrapper with direct-run support', async () => {
    const [packageGoalAuditRunner, legacyGoalAuditRunner] = await Promise.all([
      readFile('packages/acceptance/src/run-goal-audit.ts', 'utf8'),
      readFile('src/internal/acceptance/run-goal-audit.ts', 'utf8')
    ]);

    expect(packageGoalAuditRunner).toContain('export function isDirectRun(moduleUrl: string, argvPath: string | undefined): boolean');
    expect(legacyGoalAuditRunner.trim()).toBe([
      'import { formatAcceptanceFatalError } from \'../../../packages/acceptance/dist/fatal-error.js\';',
      'import {',
      '  isDirectRun as isGoalAuditDirectRun,',
      '  main as runGoalAuditMain',
      "} from '../../../packages/acceptance/dist/run-goal-audit.js';",
      '',
      'export { REQUIRED_DOCUMENT_PATHS } from \'../../../packages/acceptance/dist/run-goal-audit.js\';',
      'export {',
      '  buildCurrentGoalAuditItems,',
      '  buildGoalAuditItemsFromWorkspace,',
      '  classifyUserAcceptanceRecord,',
      '  isAcceptanceRunFreshEnough,',
      '  isAcceptedUserAcceptanceRecord,',
      '  isDirectRun,',
      '  main,',
      '  runGoalAudit,',
      '  writeGoalAuditDocument',
      "} from '../../../packages/acceptance/dist/run-goal-audit.js';",
      'export type {',
      '  GoalAuditRunInput,',
      '  GoalAuditWorkspaceInput,',
      '  UserAcceptanceRecordCheckOptions,',
      '  UserAcceptanceRecordStatus',
      "} from '../../../packages/acceptance/dist/run-goal-audit.js';",
      '',
      'if (isGoalAuditDirectRun(import.meta.url, process.argv[1])) {',
      '  runGoalAuditMain().then((exitCode) => {',
      '    process.exitCode = exitCode;',
      '  }).catch((error: unknown) => {',
      "    process.stderr.write(`${formatAcceptanceFatalError('Goal audit failed', error)}\\n`);",
      '    process.exitCode = 1;',
      '  });',
      '}'
    ].join('\n'));
  });

  it('keeps legacy user acceptance runner as a package compatibility wrapper with direct-run support', async () => {
    const [packageUserAcceptanceRunner, legacyUserAcceptanceRunner] = await Promise.all([
      readFile('packages/acceptance/src/run-user-acceptance.ts', 'utf8'),
      readFile('src/internal/acceptance/run-user-acceptance.ts', 'utf8')
    ]);

    expect(packageUserAcceptanceRunner).toContain('export function isDirectRun(moduleUrl: string, argvPath: string | undefined): boolean');
    expect(legacyUserAcceptanceRunner.trim()).toBe([
      'import { formatAcceptanceFatalError } from \'../../../packages/acceptance/dist/fatal-error.js\';',
      'import {',
      '  isDirectRun as isUserAcceptanceDirectRun,',
      '  main as runUserAcceptanceMain',
      "} from '../../../packages/acceptance/dist/run-user-acceptance.js';",
      '',
      'export {',
      '  formatUserAcceptanceCommand,',
      '  isDirectRun,',
      '  isUserAcceptanceHelpRequest,',
      '  main,',
      '  parseUserAcceptanceArgs,',
      '  runUserAcceptance,',
      '  userAcceptanceHelpText',
      "} from '../../../packages/acceptance/dist/run-user-acceptance.js';",
      'export type {',
      '  BootAppToolSession,',
      '  ExploreBrowserDriver,',
      '  RunBootApp,',
      '  RunHardeningInput,',
      '  RunHardeningResult,',
      '  UserAcceptanceCliOptions,',
      '  UserAcceptanceDependencies',
      "} from '../../../packages/acceptance/dist/run-user-acceptance.js';",
      'export {',
      '  buildGeneratedTestValidationCheck,',
      '  buildRepoRootPreflightCheck,',
      '  buildUserAcceptanceRepoPreflightChecks,',
      '  ensureGeneratedTestPlaywrightDependency,',
      '  formatGeneratedTestValidationCommand,',
      '  formatGeneratedTestValidationEvidenceCommand,',
      '  formatGeneratedTestValidationFailureEvidence,',
      '  selectGeneratedTestValidationBaseUrl,',
      '  shouldManageGeneratedTestBootSession,',
      '  writeUserAcceptanceRecord',
      "} from '../../../packages/acceptance/dist/user-acceptance-runner-helpers.js';",
      '',
      'if (isUserAcceptanceDirectRun(import.meta.url, process.argv[1])) {',
      '  runUserAcceptanceMain().then((exitCode) => {',
      '    process.exitCode = exitCode;',
      '  }).catch((error: unknown) => {',
      "    process.stderr.write(`${formatAcceptanceFatalError('User acceptance runner failed', error)}\\n`);",
      '    process.exitCode = 1;',
      '  });',
      '}'
    ].join('\n'));
  });

  it('keeps every acceptance package source module exported and every legacy acceptance source as a wrapper', async () => {
    const [
      packageJsonText,
      packageIndex,
      packageSubpathTypeSmoke,
      goalAuditSources,
      packageSourceFiles,
      legacySourceFiles
    ] = await Promise.all([
      readFile('packages/acceptance/package.json', 'utf8'),
      readFile('packages/acceptance/src/index.ts', 'utf8'),
      readFile('tests/type-smoke/acceptance-package-subpaths.ts', 'utf8'),
      readFile('packages/acceptance/src/goal-audit-sources.ts', 'utf8'),
      listFiles('packages/acceptance/src'),
      listFiles('src/internal/acceptance')
    ]);
    const packageModuleNames = packageSourceFiles
      .filter((path) => path.endsWith('.ts'))
      .map((path) => path.replace('packages/acceptance/src/', '').replace(/\.ts$/, ''))
      .filter((moduleName) => moduleName !== 'index')
      .sort();
    const packageJson = JSON.parse(packageJsonText) as {
      exports?: Record<string, { types?: string; default?: string } | string>;
    };
    const legacyModules = legacySourceFiles
      .filter((path) => path.endsWith('.ts'))
      .map((path) => path.replace('src/internal/acceptance/', '').replace(/\.ts$/, ''))
      .sort();

    expect(packageModuleNames).toEqual([
      'ai-ide-approved-repair-execution-plan',
      'ai-ide-handoff-package',
      'ai-ide-playbook-consumption-report',
      'ai-ide-repair-approval-receipt',
      'ai-ide-repair-decision-package',
      'ai-ide-repair-evidence-bundle-manifest',
      'ai-ide-repair-evidence-consumer-contract',
      'ai-ide-repair-execution-evidence-report',
      'ai-ide-repair-execution-replay-readiness',
      'ai-ide-repair-playbook',
      'ai-ide-target-repo-repair-goal-proposal-package',
      'campaign-summary',
      'compatibility',
      'fatal-error',
      'goal-audit',
      'goal-audit-current-items',
      'goal-audit-delivery',
      'goal-audit-evidence-documents',
      'goal-audit-observability-security',
      'goal-audit-process-governance',
      'goal-audit-public-release-readiness',
      'goal-audit-requirements',
      'goal-audit-runtime',
      'goal-audit-sources',
      'goal-audit-user-acceptance',
      'goal-audit-user-acceptance-materials',
      'goal-audit-v03-distribution',
      'goal-audit-workflow-artifacts',
      'markdown',
      'python-cli-artifacts',
      'python-cli-checks',
      'python-cli-profile',
      'redaction',
      'repo-preflight',
      'report',
      'run-acceptance',
      'run-goal-audit',
      'run-repair-execute',
      'run-repair-handoff',
      'run-repair-patch-plan',
      'run-user-acceptance',
      'run-user-acceptance-handoff',
      'shell-quote',
      'shell-words',
      'target-repo-feedback-summary',
      'user-acceptance',
      'user-acceptance-args',
      'user-acceptance-handoff',
      'user-acceptance-record',
      'user-acceptance-runner-helpers',
      'user-validation-evidence-loop'
    ]);
    expect([...acceptanceCompatibilityContract.packageOwnedModules].sort()).toEqual(packageModuleNames);
    expect(acceptancePackageSourceEntries.map((entry) => entry.moduleName).sort()).toEqual(packageModuleNames);
    expect(acceptancePackageSourceEntries.map((entry) => entry.path).sort()).toEqual(
      packageModuleNames.map((moduleName) => `packages/acceptance/src/${moduleName}.ts`).sort()
    );
    expect(Object.entries(packageJson.exports ?? {}).sort(([left], [right]) => left.localeCompare(right))).toEqual(
      [...acceptancePackageExportEntries]
        .map((entry) => [entry.exportPath, { types: entry.types, default: entry.default }])
        .sort(([left], [right]) => String(left).localeCompare(String(right)))
    );
    expect(legacyModules).toEqual([
      'fatal-error',
      'goal-audit',
      'markdown',
      'repo-preflight',
      'report',
      'run-acceptance',
      'run-goal-audit',
      'run-user-acceptance',
      'run-user-acceptance-handoff',
      'user-acceptance',
      'user-acceptance-args',
      'user-acceptance-handoff'
    ]);
    expect([...legacyAcceptanceCompatibilityModules].sort()).toEqual(legacyModules);
    expect(goalAuditSources).toContain('buildLegacyAcceptanceTextSourcePaths()');
    expect(goalAuditSources).toContain('buildPackageAcceptanceDistTextSourcePaths()');
    expect(goalAuditSources).toContain('acceptancePackageDistOutputEntries.flatMap((entry) =>');
    expect(goalAuditSources).toContain('packageAcceptanceDistSourceKey(moduleName)');
    expect(goalAuditSources).toContain('packageAcceptanceDistDeclarationSourceKey(moduleName)');
    expect(goalAuditSources).toContain('packageAcceptanceDistSourceMapSourceKey(moduleName)');
    expect(goalAuditSources).toContain('legacyAcceptanceCompatibilityModules.map((moduleName) =>');
    expect(goalAuditSources).toContain('legacyAcceptanceSourceKey(moduleName)');
    expect(goalAuditSources).toContain('legacyDistAcceptanceSourceKey(moduleName)');
    expect(goalAuditSources).toContain('legacyDistAcceptanceDeclarationSourceKey(moduleName)');
    expect(goalAuditSources).toContain('legacyDistAcceptanceSourceMapSourceKey(moduleName)');
    expect(packageIndex).toContain('PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS');
    expect(packageIndex).toContain('PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS');
    expect(packageIndex).toContain('PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS');
    expect(packageIndex).toContain('LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS');
    expect(goalAuditSources).not.toContain("legacyAcceptanceFatalError: 'src/internal/acceptance/fatal-error.ts'");
    expect(goalAuditSources).not.toContain("legacyDistAcceptanceFatalError: 'dist/internal/acceptance/fatal-error.js'");
    expect(goalAuditSources).not.toContain(
      "legacyDistAcceptanceFatalErrorDeclaration: 'dist/internal/acceptance/fatal-error.d.ts'"
    );
    expect(goalAuditSources).not.toContain("{ key: 'legacyAcceptanceFatalError'");
    expect(goalAuditSources).not.toContain("{ key: 'legacyDistAcceptanceFatalError'");
    expect(goalAuditSources).not.toContain("key: 'legacyDistAcceptanceFatalErrorDeclaration'");

    for (const moduleName of packageModuleNames) {
      expectPackageExport(
        packageJsonText,
        `./${moduleName}`,
        `./dist/${moduleName}.d.ts`,
        `./dist/${moduleName}.js`
      );
      expect(packageIndex).toContain(`from './${moduleName}.js'`);
      expect(packageSubpathTypeSmoke).toContain(`from '@hardening-mcp/acceptance/${moduleName}'`);
      expect(acceptancePackageSubpathSpecifiers).toContain(`@hardening-mcp/acceptance/${moduleName}`);
    }
    expect(acceptancePackageSubpathSpecifiers).toContain('@hardening-mcp/acceptance');
    expect(packageSubpathTypeSmoke).toContain("from '@hardening-mcp/acceptance'");
    expect(packageSubpathTypeSmoke).toContain('acceptance.acceptancePackageExportEntries');
    expect(packageSubpathTypeSmoke).toContain('compatibility.acceptancePackageExportEntries');
    expect(packageSubpathTypeSmoke).toContain('acceptance.AcceptancePackageExportEntry');
    expect(packageSubpathTypeSmoke).toContain('compatibility.AcceptancePackageExportEntry');
    expect(packageSubpathTypeSmoke).toContain('packageExportEntryContracts');
    expect(packageSubpathTypeSmoke).toContain('acceptance.AcceptancePackageDistOutputEntry');
    expect(packageSubpathTypeSmoke).toContain('compatibility.AcceptancePackageDistOutputEntry');
    expect(packageSubpathTypeSmoke).toContain('acceptance.acceptancePackageDistOutputEntries');
    expect(packageSubpathTypeSmoke).toContain('compatibility.acceptancePackageDistOutputEntries');
    expect(packageSubpathTypeSmoke).toContain('packageDistOutputEntryContracts');
    expect(packageSubpathTypeSmoke).toContain('packageDistOutputSourceMapContracts');
    expect(packageSubpathTypeSmoke).toContain('acceptance.PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS');
    expect(packageSubpathTypeSmoke).toContain('goalAuditSources.PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS');
    expect(packageSubpathTypeSmoke).toContain('packageDistOutputSourceSpecContracts');
    expect(packageSubpathTypeSmoke).toContain('acceptance.PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS');
    expect(packageSubpathTypeSmoke).toContain('goalAuditSources.PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS');
    expect(packageSubpathTypeSmoke).toContain('packageDistDeclarationSourceSpecContracts');
    expect(packageSubpathTypeSmoke).toContain('acceptance.PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS');
    expect(packageSubpathTypeSmoke).toContain('goalAuditSources.PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS');
    expect(packageSubpathTypeSmoke).toContain('packageDistSourceMapSourceSpecContracts');
    expect(packageSubpathTypeSmoke).toContain('acceptance.AcceptancePackageSourceEntry');
    expect(packageSubpathTypeSmoke).toContain('compatibility.AcceptancePackageSourceEntry');
    expect(packageSubpathTypeSmoke).toContain('acceptance.acceptancePackageSourceEntries');
    expect(packageSubpathTypeSmoke).toContain('compatibility.acceptancePackageSourceEntries');
    expect(packageSubpathTypeSmoke).toContain('packageSourceEntryContracts');
    expect(packageSubpathTypeSmoke).toContain('acceptance.LegacyAcceptanceDistOutputEntry');
    expect(packageSubpathTypeSmoke).toContain('compatibility.LegacyAcceptanceDistOutputEntry');
    expect(packageSubpathTypeSmoke).toContain('acceptance.legacyAcceptanceDistOutputEntries');
    expect(packageSubpathTypeSmoke).toContain('compatibility.legacyAcceptanceDistOutputEntries');
    expect(packageSubpathTypeSmoke).toContain('legacyDistOutputEntryContracts');
    expect(packageSubpathTypeSmoke).toContain('legacyDistOutputSourceMapContracts');
    expect(packageSubpathTypeSmoke).toContain('acceptance.LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS');
    expect(packageSubpathTypeSmoke).toContain('goalAuditSources.LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS');
    expect(packageSubpathTypeSmoke).toContain('legacyDistSourceMapSourceSpecContracts');
    expect(packageSubpathTypeSmoke).toContain('acceptance.LegacyAcceptanceWrapperSourceEntry');
    expect(packageSubpathTypeSmoke).toContain('compatibility.LegacyAcceptanceWrapperSourceEntry');
    expect(packageSubpathTypeSmoke).toContain('acceptance.legacyAcceptanceWrapperSourceEntries');
    expect(packageSubpathTypeSmoke).toContain('compatibility.legacyAcceptanceWrapperSourceEntries');
    expect(packageSubpathTypeSmoke).toContain('legacyWrapperSourceEntryContracts');
    expect(packageSubpathTypeSmoke).toContain('acceptance.acceptanceRuntimeContractSpecifiers');
    expect(packageSubpathTypeSmoke).toContain('compatibility.acceptanceRuntimeContractSpecifiers');
    expect(packageSubpathTypeSmoke).toContain('runtimeContractSpecifierContracts');

    for (const moduleName of legacyModules) {
      const legacySource = await readFile(`src/internal/acceptance/${moduleName}.ts`, 'utf8');

      expect(legacySource).toContain('../../../packages/acceptance/dist/');
      expect(legacySource).not.toContain('../src/');
      expect(legacySource).not.toContain('../../shared/');
      expect(legacySource).not.toContain('../../domain/');
    }
  });

  it('keeps generated package build outputs out of package source directories', async () => {
    const packageSourceFiles = await listFiles('packages/acceptance/src');

    expect(packageSourceFiles.filter((path) => path.endsWith('.js') || path.endsWith('.js.map') || path.endsWith('.d.ts'))).toEqual([]);
  });

  it('keeps generated acceptance package dist outputs described by the package compatibility contract', async () => {
    const packageDistFiles = await listFiles('packages/acceptance/dist');
    const expectedDistPaths = acceptancePackageDistOutputEntries.flatMap((entry) => [
      entry.jsPath,
      entry.declarationPath,
      entry.sourceMapPath
    ]).sort();

    expect(acceptancePackageDistOutputEntries.map((entry) => entry.exportPath).sort()).toEqual(
      acceptancePackageExportEntries.map((entry) => entry.exportPath).sort()
    );
    expect(packageDistFiles.filter((path) => path.endsWith('.js') || path.endsWith('.d.ts') || path.endsWith('.js.map')).sort()).toEqual(expectedDistPaths);
  });

  it('keeps generated legacy acceptance dist outputs described by the package compatibility contract', async () => {
    const distFiles = await listFiles(acceptanceCompatibilityContract.legacyDistRoot);
    const expectedDistPaths = legacyAcceptanceDistOutputEntries.flatMap((entry) => [
      entry.jsPath,
      entry.declarationPath,
      entry.sourceMapPath
    ]).sort();

    expect(legacyAcceptanceDistOutputEntries.map((entry) => entry.moduleName).sort()).toEqual(
      [...legacyAcceptanceCompatibilityModules].sort()
    );
    expect(distFiles.filter((path) => path.endsWith('.js') || path.endsWith('.d.ts') || path.endsWith('.js.map')).sort()).toEqual(expectedDistPaths);

    for (const entry of legacyAcceptanceDistOutputEntries) {
      const [jsOutput, declarationOutput, sourceMapOutput] = await Promise.all([
        readFile(entry.jsPath, 'utf8'),
        readFile(entry.declarationPath, 'utf8'),
        readFile(entry.sourceMapPath, 'utf8')
      ]);

      expect(jsOutput).toContain('../../../packages/acceptance/dist/');
      expect(jsOutput).not.toContain('../src/');
      expect(jsOutput).not.toContain('../../shared/');
      expect(jsOutput).not.toContain('../../domain/');
      expect(declarationOutput).toContain('../../../packages/acceptance/dist/');
      expect(sourceMapOutput).toContain(`"file":"${entry.moduleName}.js"`);
    }
  });

  it('extracts shared utility ownership into a workspace package while preserving compatibility outputs', async () => {
    const [
      rootPackageJsonText,
      sharedPackageJsonText,
      sharedCompatibility,
      sharedReadme,
      packageIndex,
      packageSubpathTypeSmoke,
      monorepoSpec,
      packageBuildAdr,
      readme,
      architecture,
      decisionLog,
      packageSourceFiles,
      legacySourceFiles
    ] = await Promise.all([
      readFile('package.json', 'utf8'),
      readFile('packages/shared/package.json', 'utf8'),
      readFile('packages/shared/src/compatibility.ts', 'utf8'),
      readFile('packages/shared/README.md', 'utf8'),
      readFile('packages/shared/src/index.ts', 'utf8'),
      readFile('tests/type-smoke/shared-package-subpaths.ts', 'utf8'),
      readFile('docs/architecture/specs/monorepo-structure-spec-v0.1.md', 'utf8'),
      readFile('docs/adr/0006-package-build-strategy.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/architecture/overview.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8'),
      listFiles('packages/shared/src'),
      listFiles('src/shared')
    ]);
    const rootPackageJson = JSON.parse(rootPackageJsonText) as {
      scripts?: Record<string, string>;
      dependencies?: Record<string, string>;
    };
    const sharedPackageJson = JSON.parse(sharedPackageJsonText) as {
      name?: string;
      main?: string;
      exports?: Record<string, { types?: string; default?: string } | string>;
    };
    const packageModuleNames = packageSourceFiles
      .filter((path) => path.endsWith('.ts'))
      .map((path) => path.replace('packages/shared/src/', '').replace(/\.ts$/u, ''))
      .filter((moduleName) => moduleName !== 'index')
      .sort();
    const legacyModules = legacySourceFiles
      .filter((path) => path.endsWith('.ts'))
      .map((path) => path.replace('src/shared/', '').replace(/\.ts$/u, ''))
      .sort();

    expect(rootPackageJson.scripts?.['build:packages']).toBe('pnpm build:shared && pnpm build:security-assurance && pnpm build:browser-explorer && pnpm build:repair-planner && pnpm build:acceptance');
    expect(rootPackageJson.scripts?.['build:shared']).toBe('tsc -p packages/shared/tsconfig.build.json');
    expect(rootPackageJson.scripts?.['build:security-assurance']).toBe('tsc -p packages/security-assurance/tsconfig.build.json');
    expect(rootPackageJson.scripts?.['build:browser-explorer']).toBe('tsc -p packages/browser-explorer/tsconfig.build.json');
    expect(rootPackageJson.scripts?.['build:repair-planner']).toBe('tsc -p packages/repair-planner/tsconfig.build.json');
    expect(rootPackageJson.scripts?.['build:acceptance']).toBe('tsc -p packages/acceptance/tsconfig.build.json');
    expect(rootPackageJson.scripts?.['typecheck:packages']).toBe('pnpm typecheck:shared && pnpm typecheck:security-assurance && pnpm typecheck:browser-explorer && pnpm typecheck:repair-planner && pnpm typecheck:acceptance');
    expect(rootPackageJson.scripts?.['typecheck:shared']).toBe('tsc -p packages/shared/tsconfig.json --noEmit');
    expect(rootPackageJson.scripts?.['typecheck:security-assurance']).toBe('tsc -p packages/security-assurance/tsconfig.json --noEmit');
    expect(rootPackageJson.scripts?.['typecheck:browser-explorer']).toBe('tsc -p packages/browser-explorer/tsconfig.json --noEmit');
    expect(rootPackageJson.scripts?.['typecheck:repair-planner']).toBe('tsc -p packages/repair-planner/tsconfig.json --noEmit');
    expect(rootPackageJson.scripts?.['typecheck:acceptance']).toBe('tsc -p packages/acceptance/tsconfig.json --noEmit');
    expect(rootPackageJson.dependencies?.['@hardening-mcp/shared']).toBe('workspace:*');

    expect(sharedPackageJson.name).toBe('@hardening-mcp/shared');
    expect(sharedPackageJson.main).toBe('dist/index.js');
    expectPackageExport(sharedPackageJsonText, '.', './dist/index.d.ts', './dist/index.js');
    expectPackageExport(sharedPackageJsonText, './compatibility', './dist/compatibility.d.ts', './dist/compatibility.js');
    expectPackageExport(sharedPackageJsonText, './privacy-redaction', './dist/privacy-redaction.d.ts', './dist/privacy-redaction.js');
    expectPackageExport(sharedPackageJsonText, './shell-quote', './dist/shell-quote.d.ts', './dist/shell-quote.js');
    expectPackageExport(sharedPackageJsonText, './shell-words', './dist/shell-words.d.ts', './dist/shell-words.js');
    expect(Object.entries(sharedPackageJson.exports ?? {}).sort(([left], [right]) => left.localeCompare(right))).toEqual(
      [...sharedPackageExportEntries]
        .map((entry) => [entry.exportPath, { types: entry.types, default: entry.default }])
        .sort(([left], [right]) => String(left).localeCompare(String(right)))
    );

    expect(sharedCompatibility).toContain('sharedCompatibilityContract');
    expect(sharedCompatibility).toContain('legacySharedWrapperSourceEntries');
    expect(sharedCompatibility).toContain('sharedPackageDistOutputEntries');
    expect(packageModuleNames).toEqual(['compatibility', 'privacy-redaction', 'shell-quote', 'shell-words']);
    expect([...sharedCompatibilityContract.packageOwnedModules].sort()).toEqual(packageModuleNames);
    expect(sharedPackageSourceEntries.map((entry) => entry.path).sort()).toEqual(
      packageModuleNames.map((moduleName) => `packages/shared/src/${moduleName}.ts`).sort()
    );
    expect(legacyModules).toEqual(['privacy-redaction', 'shell-quote', 'shell-words']);
    expect([...legacySharedCompatibilityModules].sort()).toEqual(legacyModules);
    expect(legacySharedWrapperSourceEntries.map((entry) => entry.path).sort()).toEqual(
      legacyModules.map((moduleName) => `src/shared/${moduleName}.ts`).sort()
    );

    for (const moduleName of packageModuleNames) {
      expect(packageIndex).toContain(`from './${moduleName}.js'`);
      expect(packageSubpathTypeSmoke).toContain(`from '@hardening-mcp/shared/${moduleName}'`);
      expect(sharedPackageSubpathSpecifiers).toContain(`@hardening-mcp/shared/${moduleName}`);
    }
    expect(packageSubpathTypeSmoke).toContain("from '@hardening-mcp/shared'");
    expect(packageSubpathTypeSmoke).toContain('shared.sharedPackageExportEntries');
    expect(packageSubpathTypeSmoke).toContain('compatibility.sharedPackageExportEntries');
    expect(packageSubpathTypeSmoke).toContain('shared.SharedPackageExportEntry');
    expect(packageSubpathTypeSmoke).toContain('compatibility.SharedPackageExportEntry');
    expect(packageSubpathTypeSmoke).toContain('sharedPackageExportEntryContracts');
    expect(packageSubpathTypeSmoke).toContain('shared.SharedPackageDistOutputEntry');
    expect(packageSubpathTypeSmoke).toContain('compatibility.SharedPackageDistOutputEntry');
    expect(packageSubpathTypeSmoke).toContain('sharedPackageDistOutputEntryContracts');
    expect(packageSubpathTypeSmoke).toContain('shared.SharedPackageSourceEntry');
    expect(packageSubpathTypeSmoke).toContain('compatibility.SharedPackageSourceEntry');
    expect(packageSubpathTypeSmoke).toContain('sharedPackageSourceEntryContracts');
    expect(packageSubpathTypeSmoke).toContain('shared.LegacySharedDistOutputEntry');
    expect(packageSubpathTypeSmoke).toContain('compatibility.LegacySharedDistOutputEntry');
    expect(packageSubpathTypeSmoke).toContain('legacySharedDistOutputEntryContracts');
    expect(packageSubpathTypeSmoke).toContain('shared.LegacySharedWrapperSourceEntry');
    expect(packageSubpathTypeSmoke).toContain('compatibility.LegacySharedWrapperSourceEntry');
    expect(packageSubpathTypeSmoke).toContain('legacySharedWrapperSourceEntryContracts');

    expect(sharedReadme).toContain('Phase 2c shared package extraction');
    expect(sharedReadme).toContain('This package owns shared utility implementation modules');
    expect(sharedReadme).toContain('`src/shared/*` compatibility wrappers');
    expect(monorepoSpec).toContain('Phase 2c shared package status: implemented with compatibility wrappers');
    expect(monorepoSpec).toContain('`packages/shared/src` owns shared utility implementation modules');
    expect(monorepoSpec).toContain('`src/shared/*` remains as compatibility wrappers');
    expect(packageBuildAdr).toContain('Phase 2c');
    expect(packageBuildAdr).toContain('`packages/shared`');
    expect(packageBuildAdr).toContain('shared package extraction');
    expect(readme).toContain('@hardening-mcp/shared');
    expect(architecture).toContain('@hardening-mcp/shared');
    expect(decisionLog).toContain('shared package 抽取');

    await expectPath('packages/shared/package.json');
    await expectPath('packages/shared/tsconfig.json');
    await expectPath('packages/shared/tsconfig.build.json');
    await expectPath('packages/shared/src/index.ts');
    await expectPath('packages/shared/src/compatibility.ts');
    await expectPath('packages/shared/src/privacy-redaction.ts');
    await expectPath('packages/shared/src/shell-quote.ts');
    await expectPath('packages/shared/src/shell-words.ts');
  });

  it('extracts repair planner ownership into a workspace package while preserving compatibility outputs', async () => {
    const [
      rootPackageJsonText,
      repairPlannerPackageJsonText,
      repairPlannerCompatibility,
      repairPlannerReadme,
      packageIndex,
      packageSubpathTypeSmoke,
      readme,
      monorepoSpec,
      packageBuildAdr,
      architecture,
      decisionLog
    ] = await Promise.all([
      readFile('package.json', 'utf8'),
      readFile('packages/repair-planner/package.json', 'utf8'),
      readFile('packages/repair-planner/src/compatibility.ts', 'utf8'),
      readFile('packages/repair-planner/README.md', 'utf8'),
      readFile('packages/repair-planner/src/index.ts', 'utf8'),
      readFile('tests/type-smoke/repair-planner-package-subpaths.ts', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/architecture/specs/monorepo-structure-spec-v0.1.md', 'utf8'),
      readFile('docs/adr/0006-package-build-strategy.md', 'utf8'),
      readFile('docs/architecture/overview.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8')
    ]);
    const [packageSourceFiles, legacyDomainSourceFiles] = await Promise.all([
      listFiles('packages/repair-planner/src'),
      listFiles('src/domain/repair-plan')
    ]);
    const rootPackageJson = JSON.parse(rootPackageJsonText) as {
      scripts?: Record<string, string>;
      dependencies?: Record<string, string>;
    };
    const repairPlannerPackageJson = JSON.parse(repairPlannerPackageJsonText) as {
      name?: string;
      main?: string;
      dependencies?: Record<string, string>;
      exports?: Record<string, { types?: string; default?: string } | string>;
    };
    const packageModuleNames = packageSourceFiles
      .filter((path) => path.endsWith('.ts'))
      .map((path) => path.replace('packages/repair-planner/src/', '').replace(/\.ts$/u, ''))
      .filter((moduleName) => moduleName !== 'index')
      .sort();
    const legacyModules = [
      ...legacyDomainSourceFiles
        .filter((path) => path.endsWith('.ts'))
        .map((path) => path.replace('src/domain/repair-plan/', '').replace(/\.ts$/u, '')),
      'repair-plan'
    ].sort();

    expect(rootPackageJson.scripts?.['build:packages']).toBe('pnpm build:shared && pnpm build:security-assurance && pnpm build:browser-explorer && pnpm build:repair-planner && pnpm build:acceptance');
    expect(rootPackageJson.scripts?.['build:repair-planner']).toBe('tsc -p packages/repair-planner/tsconfig.build.json');
    expect(rootPackageJson.scripts?.['typecheck:packages']).toBe('pnpm typecheck:shared && pnpm typecheck:security-assurance && pnpm typecheck:browser-explorer && pnpm typecheck:repair-planner && pnpm typecheck:acceptance');
    expect(rootPackageJson.scripts?.['typecheck:repair-planner']).toBe('tsc -p packages/repair-planner/tsconfig.json --noEmit');
    expect(rootPackageJson.dependencies?.['@hardening-mcp/repair-planner']).toBe('workspace:*');

    expect(repairPlannerPackageJson.name).toBe('@hardening-mcp/repair-planner');
    expect(repairPlannerPackageJson.main).toBe('dist/index.js');
    expect(repairPlannerPackageJson.dependencies?.['@hardening-mcp/shared']).toBe('workspace:*');
    expectPackageExport(repairPlannerPackageJsonText, '.', './dist/index.d.ts', './dist/index.js');
    expectPackageExport(repairPlannerPackageJsonText, './compatibility', './dist/compatibility.d.ts', './dist/compatibility.js');
    expectPackageExport(repairPlannerPackageJsonText, './generate-repair-plan', './dist/generate-repair-plan.d.ts', './dist/generate-repair-plan.js');
    expectPackageExport(repairPlannerPackageJsonText, './repair-plan', './dist/repair-plan.d.ts', './dist/repair-plan.js');
    expect(Object.entries(repairPlannerPackageJson.exports ?? {}).sort(([left], [right]) => left.localeCompare(right))).toEqual(
      [...repairPlannerPackageExportEntries]
        .map((entry) => [entry.exportPath, { types: entry.types, default: entry.default }])
        .sort(([left], [right]) => String(left).localeCompare(String(right)))
    );

    expect(repairPlannerCompatibility).toContain('repairPlannerCompatibilityContract');
    expect(repairPlannerCompatibility).toContain('legacyRepairPlannerWrapperSourceEntries');
    expect(repairPlannerCompatibility).toContain('repairPlannerPackageDistOutputEntries');
    expect(packageModuleNames).toEqual(['compatibility', 'generate-repair-plan', 'repair-plan']);
    expect([...repairPlannerCompatibilityContract.packageOwnedModules].sort()).toEqual(packageModuleNames);
    expect(repairPlannerPackageSourceEntries.map((entry) => entry.path).sort()).toEqual(
      packageModuleNames.map((moduleName) => `packages/repair-planner/src/${moduleName}.ts`).sort()
    );
    expect(legacyModules).toEqual(['generate-repair-plan', 'repair-plan']);
    expect([...legacyRepairPlannerCompatibilityModules].sort()).toEqual(legacyModules);
    expect(legacyRepairPlannerWrapperSourceEntries.map((entry) => entry.path).sort()).toEqual([
      'src/domain/repair-plan/generate-repair-plan.ts',
      'src/types/repair-plan.ts'
    ]);

    for (const moduleName of packageModuleNames) {
      expect(packageIndex).toContain(`from './${moduleName}.js'`);
      expect(packageSubpathTypeSmoke).toContain(`from '@hardening-mcp/repair-planner/${moduleName}'`);
      expect(repairPlannerPackageSubpathSpecifiers).toContain(`@hardening-mcp/repair-planner/${moduleName}`);
    }
    expect(packageSubpathTypeSmoke).toContain("from '@hardening-mcp/repair-planner'");
    expect(packageSubpathTypeSmoke).toContain('repairPlanner.repairPlannerPackageExportEntries');
    expect(packageSubpathTypeSmoke).toContain('compatibility.repairPlannerPackageExportEntries');
    expect(packageSubpathTypeSmoke).toContain('repairPlanner.RepairPlannerPackageExportEntry');
    expect(packageSubpathTypeSmoke).toContain('compatibility.RepairPlannerPackageExportEntry');
    expect(packageSubpathTypeSmoke).toContain('repairPlannerPackageExportEntryContracts');
    expect(packageSubpathTypeSmoke).toContain('repairPlanner.RepairPlannerPackageDistOutputEntry');
    expect(packageSubpathTypeSmoke).toContain('compatibility.RepairPlannerPackageDistOutputEntry');
    expect(packageSubpathTypeSmoke).toContain('repairPlannerPackageDistOutputEntryContracts');
    expect(packageSubpathTypeSmoke).toContain('repairPlanner.RepairPlanGenerationResult');
    expect(packageSubpathTypeSmoke).toContain('generateRepairPlan.GenerateRepairPlanInput');
    expect(packageSubpathTypeSmoke).toContain('repairPlan.RepairTaskPackage');

    expect(repairPlannerReadme).toContain('Phase 2d repair-planner package extraction');
    expect(repairPlannerReadme).toContain('This package owns repair plan implementation modules');
    expect(repairPlannerReadme).toContain('`src/domain/repair-plan/*` and `src/types/repair-plan.ts` compatibility wrappers');
    expect(monorepoSpec).toContain('Phase 2d repair-planner package status: implemented with compatibility wrappers');
    expect(monorepoSpec).toContain('`packages/repair-planner/src` owns repair plan and executable repair task package implementation modules');
    expect(monorepoSpec).toContain('`src/domain/repair-plan/*` remains as compatibility wrappers');
    expect(monorepoSpec).toContain('`src/types/repair-plan.ts` remains as a compatibility wrapper');
    expect(packageBuildAdr).toContain('Phase 2d');
    expect(packageBuildAdr).toContain('`packages/repair-planner`');
    expect(packageBuildAdr).toContain('repair-planner package extraction');
    expect(readme).toContain('@hardening-mcp/repair-planner');
    expect(architecture).toContain('@hardening-mcp/repair-planner');
    expect(decisionLog).toContain('repair-planner package 抽取');

    await expectPath('packages/repair-planner/package.json');
    await expectPath('packages/repair-planner/tsconfig.json');
    await expectPath('packages/repair-planner/tsconfig.build.json');
    await expectPath('packages/repair-planner/src/index.ts');
    await expectPath('packages/repair-planner/src/compatibility.ts');
    await expectPath('packages/repair-planner/src/generate-repair-plan.ts');
    await expectPath('packages/repair-planner/src/repair-plan.ts');
  });

  it('extracts browser explorer ownership into a workspace package while preserving compatibility outputs', async () => {
    const [
      rootPackageJsonText,
      browserExplorerPackageJsonText,
      browserExplorerCompatibility,
      browserExplorerReadme,
      packageIndex,
      packageSubpathTypeSmoke,
      readme,
      monorepoSpec,
      packageBuildAdr,
      architecture,
      decisionLog
    ] = await Promise.all([
      readFile('package.json', 'utf8'),
      readFile('packages/browser-explorer/package.json', 'utf8'),
      readFile('packages/browser-explorer/src/compatibility.ts', 'utf8'),
      readFile('packages/browser-explorer/README.md', 'utf8'),
      readFile('packages/browser-explorer/src/index.ts', 'utf8'),
      readFile('tests/type-smoke/browser-explorer-package-subpaths.ts', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/architecture/specs/monorepo-structure-spec-v0.1.md', 'utf8'),
      readFile('docs/adr/0006-package-build-strategy.md', 'utf8'),
      readFile('docs/architecture/overview.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8')
    ]);
    const [packageSourceFiles, legacyDomainSourceFiles] = await Promise.all([
      listFiles('packages/browser-explorer/src'),
      listFiles('src/domain/explore')
    ]);
    const rootPackageJson = JSON.parse(rootPackageJsonText) as {
      scripts?: Record<string, string>;
      dependencies?: Record<string, string>;
    };
    const browserExplorerPackageJson = JSON.parse(browserExplorerPackageJsonText) as {
      name?: string;
      main?: string;
      dependencies?: Record<string, string>;
      exports?: Record<string, { types?: string; default?: string } | string>;
    };
    const packageModuleNames = packageSourceFiles
      .filter((path) => path.endsWith('.ts'))
      .map((path) => path.replace('packages/browser-explorer/src/', '').replace(/\.ts$/u, ''))
      .filter((moduleName) => moduleName !== 'index')
      .sort();
    const legacyModules = legacyDomainSourceFiles
      .filter((path) => path.endsWith('.ts'))
      .map((path) => path.replace('src/domain/explore/', '').replace(/\.ts$/u, ''))
      .sort();

    expect(rootPackageJson.scripts?.['build:packages']).toBe('pnpm build:shared && pnpm build:security-assurance && pnpm build:browser-explorer && pnpm build:repair-planner && pnpm build:acceptance');
    expect(rootPackageJson.scripts?.['build:browser-explorer']).toBe('tsc -p packages/browser-explorer/tsconfig.build.json');
    expect(rootPackageJson.scripts?.['typecheck:packages']).toBe('pnpm typecheck:shared && pnpm typecheck:security-assurance && pnpm typecheck:browser-explorer && pnpm typecheck:repair-planner && pnpm typecheck:acceptance');
    expect(rootPackageJson.scripts?.['typecheck:browser-explorer']).toBe('tsc -p packages/browser-explorer/tsconfig.json --noEmit');
    expect(rootPackageJson.dependencies?.['@hardening-mcp/browser-explorer']).toBe('workspace:*');

    expect(browserExplorerPackageJson.name).toBe('@hardening-mcp/browser-explorer');
    expect(browserExplorerPackageJson.main).toBe('dist/index.js');
    expect(browserExplorerPackageJson.dependencies?.['@hardening-mcp/shared']).toBe('workspace:*');
    expectPackageExport(browserExplorerPackageJsonText, '.', './dist/index.d.ts', './dist/index.js');
    expectPackageExport(browserExplorerPackageJsonText, './compatibility', './dist/compatibility.d.ts', './dist/compatibility.js');
    expectPackageExport(browserExplorerPackageJsonText, './explore-app', './dist/explore-app.d.ts', './dist/explore-app.js');
    expectPackageExport(browserExplorerPackageJsonText, './playwright-driver', './dist/playwright-driver.d.ts', './dist/playwright-driver.js');
    expect(Object.entries(browserExplorerPackageJson.exports ?? {}).sort(([left], [right]) => left.localeCompare(right))).toEqual(
      [...browserExplorerPackageExportEntries]
        .map((entry) => [entry.exportPath, { types: entry.types, default: entry.default }])
        .sort(([left], [right]) => String(left).localeCompare(String(right)))
    );

    expect(browserExplorerCompatibility).toContain('browserExplorerCompatibilityContract');
    expect(browserExplorerCompatibility).toContain('legacyBrowserExplorerWrapperSourceEntries');
    expect(browserExplorerCompatibility).toContain('browserExplorerPackageDistOutputEntries');
    expect(packageModuleNames).toEqual(['compatibility', 'explore-app', 'playwright-driver']);
    expect([...browserExplorerCompatibilityContract.packageOwnedModules].sort()).toEqual(packageModuleNames);
    expect(browserExplorerPackageSourceEntries.map((entry) => entry.path).sort()).toEqual(
      packageModuleNames.map((moduleName) => `packages/browser-explorer/src/${moduleName}.ts`).sort()
    );
    expect(legacyModules).toEqual(['explore-app', 'playwright-driver']);
    expect([...legacyBrowserExplorerCompatibilityModules].sort()).toEqual(legacyModules);
    expect(legacyBrowserExplorerWrapperSourceEntries.map((entry) => entry.path).sort()).toEqual(
      legacyModules.map((moduleName) => `src/domain/explore/${moduleName}.ts`).sort()
    );

    for (const moduleName of packageModuleNames) {
      expect(packageIndex).toContain(`from './${moduleName}.js'`);
      expect(packageSubpathTypeSmoke).toContain(`from '@hardening-mcp/browser-explorer/${moduleName}'`);
      expect(browserExplorerPackageSubpathSpecifiers).toContain(`@hardening-mcp/browser-explorer/${moduleName}`);
    }
    expect(packageSubpathTypeSmoke).toContain("from '@hardening-mcp/browser-explorer'");
    expect(packageSubpathTypeSmoke).toContain('browserExplorer.browserExplorerPackageExportEntries');
    expect(packageSubpathTypeSmoke).toContain('compatibility.browserExplorerPackageExportEntries');
    expect(packageSubpathTypeSmoke).toContain('browserExplorer.BrowserExplorerPackageExportEntry');
    expect(packageSubpathTypeSmoke).toContain('compatibility.BrowserExplorerPackageExportEntry');
    expect(packageSubpathTypeSmoke).toContain('browserExplorerPackageExportEntryContracts');
    expect(packageSubpathTypeSmoke).toContain('browserExplorer.BrowserExplorerPackageDistOutputEntry');
    expect(packageSubpathTypeSmoke).toContain('compatibility.BrowserExplorerPackageDistOutputEntry');
    expect(packageSubpathTypeSmoke).toContain('browserExplorerPackageDistOutputEntryContracts');
    expect(packageSubpathTypeSmoke).toContain('browserExplorer.ExploreAppResult');
    expect(packageSubpathTypeSmoke).toContain('exploreApp.ExploreBrowserDriver');
    expect(packageSubpathTypeSmoke).toContain('playwrightDriver.CreatePlaywrightBrowserDriverInput');

    expect(browserExplorerReadme).toContain('Phase 2e browser-explorer package extraction');
    expect(browserExplorerReadme).toContain('This package owns browser and route exploration implementation modules');
    expect(browserExplorerReadme).toContain('`src/domain/explore/*` compatibility wrappers');
    expect(monorepoSpec).toContain('Phase 2e browser-explorer package status: implemented with compatibility wrappers');
    expect(monorepoSpec).toContain('`packages/browser-explorer/src` owns browser and route exploration implementation modules');
    expect(monorepoSpec).toContain('`src/domain/explore/*` remains as compatibility wrappers');
    expect(packageBuildAdr).toContain('Phase 2e');
    expect(packageBuildAdr).toContain('`packages/browser-explorer`');
    expect(packageBuildAdr).toContain('browser-explorer package extraction');
    expect(readme).toContain('@hardening-mcp/browser-explorer');
    expect(architecture).toContain('@hardening-mcp/browser-explorer');
    expect(decisionLog).toContain('browser-explorer package 抽取');

    await expectPath('packages/browser-explorer/package.json');
    await expectPath('packages/browser-explorer/tsconfig.json');
    await expectPath('packages/browser-explorer/tsconfig.build.json');
    await expectPath('packages/browser-explorer/src/index.ts');
    await expectPath('packages/browser-explorer/src/compatibility.ts');
    await expectPath('packages/browser-explorer/src/explore-app.ts');
    await expectPath('packages/browser-explorer/src/playwright-driver.ts');
  });

  it('keeps generated browser explorer package dist outputs described by the package compatibility contract', async () => {
    const packageDistFiles = await listFiles('packages/browser-explorer/dist');
    const expectedDistPaths = browserExplorerPackageDistOutputEntries.flatMap((entry) => [
      entry.jsPath,
      entry.declarationPath,
      entry.sourceMapPath
    ]).sort();

    expect(browserExplorerPackageDistOutputEntries.map((entry) => entry.exportPath).sort()).toEqual(
      browserExplorerPackageExportEntries.map((entry) => entry.exportPath).sort()
    );
    expect(packageDistFiles.filter((path) => path.endsWith('.js') || path.endsWith('.d.ts') || path.endsWith('.js.map')).sort()).toEqual(expectedDistPaths);
  });

  it('keeps generated legacy browser explorer dist outputs as package compatibility wrappers', async () => {
    const distFiles = await listFiles(browserExplorerCompatibilityContract.legacyDistRoot);
    const expectedDistPaths = legacyBrowserExplorerDistOutputEntries.flatMap((entry) => [
      entry.jsPath,
      entry.declarationPath,
      entry.sourceMapPath
    ]).sort();

    expect(legacyBrowserExplorerDistOutputEntries.map((entry) => entry.moduleName).sort()).toEqual(
      [...legacyBrowserExplorerCompatibilityModules].sort()
    );
    expect(distFiles.filter((path) => path.endsWith('.js') || path.endsWith('.d.ts') || path.endsWith('.js.map')).sort()).toEqual(expectedDistPaths);

    for (const entry of legacyBrowserExplorerDistOutputEntries) {
      const [jsOutput, declarationOutput, sourceMapOutput] = await Promise.all([
        readFile(entry.jsPath, 'utf8'),
        readFile(entry.declarationPath, 'utf8'),
        readFile(entry.sourceMapPath, 'utf8')
      ]);

      expect(jsOutput).toContain('packages/browser-explorer/dist/');
      expect(jsOutput).not.toContain('function classifyRouteResult');
      expect(jsOutput).not.toContain('function collectInteractions');
      expect(jsOutput).not.toContain('function unsafeInteractionReason');
      expect(declarationOutput).toContain('packages/browser-explorer/dist/');
      expect(sourceMapOutput).toContain(`"file":"${entry.moduleName}.js"`);
    }
  });

  it('keeps legacy browser explorer source modules as package compatibility wrappers', async () => {
    for (const entry of legacyBrowserExplorerWrapperSourceEntries) {
      const legacySource = await readFile(entry.path, 'utf8');

      expect(legacySource).toContain('packages/browser-explorer/dist/');
      expect(legacySource).not.toContain('function classifyRouteResult');
      expect(legacySource).not.toContain('function collectInteractions');
      expect(legacySource).not.toContain('function unsafeInteractionReason');
    }
  });

  it('keeps generated repair planner package dist outputs described by the package compatibility contract', async () => {
    const packageDistFiles = await listFiles('packages/repair-planner/dist');
    const expectedDistPaths = repairPlannerPackageDistOutputEntries.flatMap((entry) => [
      entry.jsPath,
      entry.declarationPath,
      entry.sourceMapPath
    ]).sort();

    expect(repairPlannerPackageDistOutputEntries.map((entry) => entry.exportPath).sort()).toEqual(
      repairPlannerPackageExportEntries.map((entry) => entry.exportPath).sort()
    );
    expect(packageDistFiles.filter((path) => path.endsWith('.js') || path.endsWith('.d.ts') || path.endsWith('.js.map')).sort()).toEqual(expectedDistPaths);
  });

  it('keeps generated legacy repair planner dist outputs as package compatibility wrappers', async () => {
    const distFiles = [
      ...(await listFiles('dist/domain/repair-plan')),
      ...(await listFiles('dist/types'))
    ];
    const expectedDistPaths = legacyRepairPlannerDistOutputEntries.flatMap((entry) => [
      entry.jsPath,
      entry.declarationPath,
      entry.sourceMapPath
    ]).sort();

    expect(legacyRepairPlannerDistOutputEntries.map((entry) => entry.moduleName).sort()).toEqual(
      [...legacyRepairPlannerCompatibilityModules].sort()
    );
    expect(distFiles.filter((path) => expectedDistPaths.includes(path)).sort()).toEqual(expectedDistPaths);

    for (const entry of legacyRepairPlannerDistOutputEntries) {
      const [jsOutput, declarationOutput, sourceMapOutput] = await Promise.all([
        readFile(entry.jsPath, 'utf8'),
        readFile(entry.declarationPath, 'utf8'),
        readFile(entry.sourceMapPath, 'utf8')
      ]);

      expect(jsOutput).toContain('packages/repair-planner/dist/');
      expect(jsOutput).not.toContain('function buildRepairTaskPackage');
      expect(jsOutput).not.toContain('function slugify');
      expect(jsOutput).not.toContain('function findingTypeRepairIntent');
      expect(declarationOutput).toContain('packages/repair-planner/dist/');
      expect(sourceMapOutput).toContain(`"file":"${entry.moduleName}.js"`);
    }
  });

  it('keeps legacy repair planner source modules as package compatibility wrappers', async () => {
    for (const entry of legacyRepairPlannerWrapperSourceEntries) {
      const legacySource = await readFile(entry.path, 'utf8');

      expect(legacySource).toContain('packages/repair-planner/dist/');
      expect(legacySource).not.toContain('function buildRepairTaskPackage');
      expect(legacySource).not.toContain('function slugify');
      expect(legacySource).not.toContain('function findingTypeRepairIntent');
    }
  });

  it('keeps generated shared package dist outputs described by the package compatibility contract', async () => {
    const packageDistFiles = await listFiles('packages/shared/dist');
    const expectedDistPaths = sharedPackageDistOutputEntries.flatMap((entry) => [
      entry.jsPath,
      entry.declarationPath,
      entry.sourceMapPath
    ]).sort();

    expect(sharedPackageDistOutputEntries.map((entry) => entry.exportPath).sort()).toEqual(
      sharedPackageExportEntries.map((entry) => entry.exportPath).sort()
    );
    expect(packageDistFiles.filter((path) => path.endsWith('.js') || path.endsWith('.d.ts') || path.endsWith('.js.map')).sort()).toEqual(expectedDistPaths);
  });

  it('keeps generated legacy shared dist outputs as package compatibility wrappers', async () => {
    const distFiles = await listFiles(sharedCompatibilityContract.legacyDistRoot);
    const expectedDistPaths = legacySharedDistOutputEntries.flatMap((entry) => [
      entry.jsPath,
      entry.declarationPath,
      entry.sourceMapPath
    ]).sort();

    expect(legacySharedDistOutputEntries.map((entry) => entry.moduleName).sort()).toEqual(
      [...legacySharedCompatibilityModules].sort()
    );
    expect(distFiles.filter((path) => path.endsWith('.js') || path.endsWith('.d.ts') || path.endsWith('.js.map')).sort()).toEqual(expectedDistPaths);

    for (const entry of legacySharedDistOutputEntries) {
      const [jsOutput, declarationOutput, sourceMapOutput] = await Promise.all([
        readFile(entry.jsPath, 'utf8'),
        readFile(entry.declarationPath, 'utf8'),
        readFile(entry.sourceMapPath, 'utf8')
      ]);

      expect(jsOutput).toContain('../../packages/shared/dist/');
      expect(jsOutput).not.toContain('const redacted =');
      expect(jsOutput).not.toContain('function decodeAnsiCStringEscape');
      expect(declarationOutput).toContain('../../packages/shared/dist/');
      expect(sourceMapOutput).toContain(`"file":"${entry.moduleName}.js"`);
    }
  });

  it('keeps legacy shared source modules as package compatibility wrappers', async () => {
    for (const entry of legacySharedWrapperSourceEntries) {
      const legacySource = await readFile(entry.path, 'utf8');

      expect(legacySource).toContain('../../packages/shared/dist/');
      expect(legacySource).not.toContain('const redacted =');
      expect(legacySource).not.toContain('function decodeAnsiCStringEscape');
    }
  });

  it('keeps MVP closure documents consistent with the current acceptance boundary', async () => {
    const [codexGoal, goalAudit, handoff, userAcceptanceRecord] = await Promise.all([
      readFile('docs/goals/codex-goal.md', 'utf8'),
      readFile('docs/acceptance/goal-completion-audit.md', 'utf8'),
      readFile('docs/acceptance/user-acceptance-handoff.md', 'utf8'),
      readFile('docs/acceptance/user-acceptance-record.md', 'utf8')
    ]);
    const automaticPassed = Number(goalAudit.match(/\| 已通过 \| (?<count>\d+) \|/u)?.groups?.count);
    const handoffAutomaticPassed = Number(handoff.match(/\| 自动证据通过 \| (?<count>\d+) \|/u)?.groups?.count);

    expect(Number.isFinite(automaticPassed)).toBe(true);
    expect(Number.isFinite(handoffAutomaticPassed)).toBe(true);
    const hasAcceptedUserDecision = userAcceptanceRecord.includes('| 用户结论 | 用户确认通过 |');

    expect(handoffAutomaticPassed).toBeGreaterThanOrEqual(automaticPassed);
    expect(handoff).toContain('| 自动证据缺失 | 0 |');

    if (hasAcceptedUserDecision) {
      expect(goalAudit).toContain('| 需要人工确认 | 0 |');
      expect(handoff).toContain('| 需要人工确认 | 0 |');
      expect(handoff).toContain('| 总体状态 | 已完成 |');
      expect(codexGoal).toContain('状态：已完成，真实项目用户验收已通过');
    } else {
      expect(goalAudit).toContain('| 需要人工确认 | 1 |');
      expect(handoff).toContain('| 需要人工确认 | 1 |');
      expect(codexGoal).not.toContain('状态：已完成');
      expect(codexGoal).not.toContain('真实项目用户验收已通过');
      expect(codexGoal).toContain('状态：自动证据已准备好请求用户验收，等待用户最终验收结论');
    }
  });

  it('records the external reviewer access update without storing reviewer email addresses in Git docs', async () => {
    const [
      accessUpdate,
      selection,
      recruitmentPlan,
      handoffReadiness,
      handoffExecution,
      websiteHandoff,
      acceptanceChecklist,
      testStrategy,
      devLog
    ] = await Promise.all([
      readFile('docs/operations/private-preview-external-reviewer-access-update-v0.1.md', 'utf8'),
      readFile('docs/operations/private-preview-external-reviewer-selection-v0.1.md', 'utf8'),
      readFile('docs/operations/private-preview-external-reviewer-recruitment-and-dispatch-plan-v0.1.md', 'utf8'),
      readFile('docs/operations/private-preview-reviewer-handoff-dispatch-readiness-v0.1.md', 'utf8'),
      readFile('docs/operations/private-preview-reviewer-handoff-package-and-dispatch-execution-v0.1.md', 'utf8'),
      readFile('docs/operations/public-website-release-candidate-handoff-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);
    expect(accessUpdate).toContain('Private Preview External Reviewer Access Update v0.1');
    expect(accessUpdate).toContain('Access update status: completed');
    expect(accessUpdate).toContain('Cloudflare Dashboard UI');
    expect(accessUpdate).toContain('RepoAssure reviewer allow');
    expect(accessUpdate).toContain('external-reviewer-1');
    expect(accessUpdate).toContain('external-reviewer-2');
    expect(accessUpdate).toContain('Private Preview External Reviewer Manual Dispatch v0.1 completed');
    expect(accessUpdate).toContain('No real reviewer email address is recorded in Git tracked docs');
    expect(accessUpdate).toContain('pnpm verify:cloudflare-preview');
    expect(selection).toContain('Private Preview External Reviewer Access Update v0.1 completed');
    expect(recruitmentPlan).toContain('waiting_for_reviewer_feedback');
    expect(handoffReadiness).toContain('waiting_for_reviewer_feedback');
    expect(handoffExecution).toContain('waiting_for_reviewer_feedback');
    expect(websiteHandoff).toContain('Private Preview External Reviewer Access Update v0.1');
    expect(acceptanceChecklist).toContain('Private Preview External Reviewer Access Update');
    expect(testStrategy).toContain('pnpm verify:cloudflare-preview');
    expect(devLog).toContain('Private Preview External Reviewer Access Update v0.1');
    expect(accessUpdate).not.toContain('@');
    expect(selection).not.toContain('@');
  });

  it('records external reviewer manual dispatch without storing reviewer email addresses in Git docs', async () => {
    const [
      manualDispatch,
      accessUpdate,
      selection,
      recruitmentPlan,
      handoffReadiness,
      handoffExecution,
      websiteHandoff,
      acceptanceChecklist,
      testStrategy,
      devLog
    ] = await Promise.all([
      readFile('docs/operations/private-preview-external-reviewer-manual-dispatch-v0.1.md', 'utf8'),
      readFile('docs/operations/private-preview-external-reviewer-access-update-v0.1.md', 'utf8'),
      readFile('docs/operations/private-preview-external-reviewer-selection-v0.1.md', 'utf8'),
      readFile('docs/operations/private-preview-external-reviewer-recruitment-and-dispatch-plan-v0.1.md', 'utf8'),
      readFile('docs/operations/private-preview-reviewer-handoff-dispatch-readiness-v0.1.md', 'utf8'),
      readFile('docs/operations/private-preview-reviewer-handoff-package-and-dispatch-execution-v0.1.md', 'utf8'),
      readFile('docs/operations/public-website-release-candidate-handoff-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);
    const trackedDocs = [
      manualDispatch,
      accessUpdate,
      selection,
      recruitmentPlan,
      handoffReadiness,
      handoffExecution,
      websiteHandoff,
      acceptanceChecklist,
      testStrategy,
      devLog
    ].join('\n');

    expect(manualDispatch).toContain('Private Preview External Reviewer Manual Dispatch v0.1');
    expect(manualDispatch).toContain('Dispatch status: sent');
    expect(manualDispatch).toContain('manual maintainer email');
    expect(manualDispatch).toContain('Sent from maintainer email account');
    expect(manualDispatch).toContain('external-reviewer-1');
    expect(manualDispatch).toContain('external-reviewer-2');
    expect(manualDispatch).toContain('Message template version: `private-preview-reviewer-handoff-package-v0.1`');
    expect(manualDispatch).toContain('No real reviewer email address is recorded in Git tracked docs');
    expect(manualDispatch).toContain('No external issue was created');
    expect(manualDispatch).toContain('No reviewer feedback was invented');
    expect(manualDispatch).toContain('waiting_for_reviewer_feedback');
    expect(accessUpdate).toContain('Private Preview External Reviewer Manual Dispatch v0.1 completed');
    expect(selection).toContain('waiting_for_reviewer_feedback');
    expect(recruitmentPlan).toContain('waiting_for_reviewer_feedback');
    expect(handoffReadiness).toContain('waiting_for_reviewer_feedback');
    expect(handoffExecution).toContain('Private Preview External Reviewer Manual Dispatch v0.1');
    expect(websiteHandoff).toContain('Private Preview External Reviewer Manual Dispatch v0.1');
    expect(acceptanceChecklist).toContain('Private Preview External Reviewer Manual Dispatch');
    expect(testStrategy).toContain('Private Preview External Reviewer Manual Dispatch');
    expect(devLog).toContain('Private Preview External Reviewer Manual Dispatch v0.1');
    expect(manualDispatch).not.toContain('@');
    expect(accessUpdate).not.toContain('@');
    expect(selection).not.toContain('@');
    expect(trackedDocs).toContain('No real reviewer email address is recorded in Git tracked docs');
  });

  it('records external reviewer feedback intake readiness without inventing reviewer feedback', async () => {
    const [
      feedbackIntake,
      manualDispatch,
      recruitmentPlan,
      handoffReadiness,
      feedbackTriageBacklog,
      websiteHandoff,
      acceptanceChecklist,
      testStrategy,
      devLog
    ] = await Promise.all([
      readFile('docs/operations/private-preview-external-reviewer-feedback-intake-v0.1.md', 'utf8'),
      readFile('docs/operations/private-preview-external-reviewer-manual-dispatch-v0.1.md', 'utf8'),
      readFile('docs/operations/private-preview-external-reviewer-recruitment-and-dispatch-plan-v0.1.md', 'utf8'),
      readFile('docs/operations/private-preview-reviewer-handoff-dispatch-readiness-v0.1.md', 'utf8'),
      readFile('docs/operations/private-preview-feedback-triage-backlog-v0.1.md', 'utf8'),
      readFile('docs/operations/public-website-release-candidate-handoff-v0.1.md', 'utf8'),
      readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
      readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
      readFile('docs/logs/dev-log.md', 'utf8')
    ]);
    const trackedDocs = [
      feedbackIntake,
      manualDispatch,
      recruitmentPlan,
      handoffReadiness,
      feedbackTriageBacklog,
      websiteHandoff,
      acceptanceChecklist,
      testStrategy,
      devLog
    ].join('\n');

    expect(feedbackIntake).toContain('Private Preview External Reviewer Feedback Intake v0.1');
    expect(feedbackIntake).toContain('Intake status: waiting_for_reviewer_feedback');
    expect(feedbackIntake).toContain('Feedback received: no');
    expect(feedbackIntake).toContain('external-reviewer-1');
    expect(feedbackIntake).toContain('external-reviewer-2');
    expect(feedbackIntake).toContain('No reviewer feedback was invented');
    expect(feedbackIntake).toContain('No feedback triage was started');
    expect(feedbackIntake).toContain('No external issue was created');
    expect(feedbackIntake).toContain('No real reviewer email address is recorded in Git tracked docs');
    expect(feedbackIntake).toContain('Sensitive material redaction gate');
    expect(feedbackIntake).toContain('Private Preview Feedback Triage Execution v0.1');
    expect(manualDispatch).toContain('Private Preview External Reviewer Feedback Intake v0.1');
    expect(recruitmentPlan).toContain('Private Preview External Reviewer Feedback Intake v0.1');
    expect(handoffReadiness).toContain('Private Preview External Reviewer Feedback Intake v0.1');
    expect(feedbackTriageBacklog).toContain('Private Preview External Reviewer Feedback Intake v0.1');
    expect(websiteHandoff).toContain('Private Preview External Reviewer Feedback Intake v0.1');
    expect(acceptanceChecklist).toContain('Private Preview External Reviewer Feedback Intake');
    expect(testStrategy).toContain('Private Preview External Reviewer Feedback Intake');
    expect(devLog).toContain('Private Preview External Reviewer Feedback Intake v0.1');
    expect(feedbackIntake).not.toContain('@');
    expect(trackedDocs).toContain('waiting_for_reviewer_feedback');
    expect(feedbackIntake).not.toContain('accepted / changes_requested / blocked');
  });
});

async function expectPath(path: string): Promise<void> {
  await expect(stat(path)).resolves.toEqual(expect.objectContaining({
    size: expect.any(Number)
  }));
}

function expectPackageExport(packageJsonText: string, exportPath: string, typesPath: string, defaultPath: string): void {
  const packageJson = JSON.parse(packageJsonText) as {
    exports?: Record<string, { types?: string; default?: string } | string>;
  };

  expect(packageJson.exports?.[exportPath]).toEqual({
    types: typesPath,
    default: defaultPath
  });
}

async function listFiles(path: string): Promise<string[]> {
  const entries = await readdir(path, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = `${path}/${entry.name}`;

    return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
  }));

  return nested.flat();
}
