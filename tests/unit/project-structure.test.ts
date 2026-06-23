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
    expect(gitignore).toContain('benchmark-runs/');
    expect(eslintConfig).toContain('artifacts/benchmark-runs/**');
    expect(eslintConfig).toContain('packages/*/dist/**');
    expect(eslintConfig).toContain('benchmark-runs/**');
    expect(vitestConfig).toContain('artifacts/benchmark-runs/**');
    expect(vitestConfig).toContain('packages/*/dist/**');
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
    expect(monorepoSpec).toContain('Phase 2 acceptance package pilot, Phase 2c shared package extraction, Phase 2d repair-planner package extraction, and Phase 2e browser-explorer package extraction are part of the current acceptance criteria');
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

    expect(monorepoSpec).toContain('Phase 2 status: acceptance package pilot, Phase 2c shared package extraction, Phase 2d repair-planner package extraction, and Phase 2e browser-explorer package extraction implemented; broader package extraction remains deferred');
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
    expect(commercializationAdr).toContain('The repository is currently private in `package.json` and has no repository-level `LICENSE` file');
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
    expect(ciWorkflow).toContain('actions/checkout@v4');
    expect(ciWorkflow).toContain('actions/setup-node@v4');
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
      operationsGuide,
      taxonomySpec,
      publicReleaseChecklist,
      privateReadiness,
      prTemplate,
      blockersLog,
      decisionLog
    ] = await Promise.all([
      readFile('package.json', 'utf8'),
      readFile('docs/adr/README.md', 'utf8'),
      readFile('docs/adr/0012-branch-protection-and-release-boundary.md', 'utf8'),
      readFile('docs/operations/branch-protection-release-boundary-v0.1.md', 'utf8'),
      readFile('docs/architecture/specs/docs-taxonomy-spec-v0.1.md', 'utf8'),
      readFile('docs/product/strategy/public-release-checklist-v0.1.md', 'utf8'),
      readFile('docs/product/strategy/private-repo-readiness-v0.1.md', 'utf8'),
      readFile('.github/pull_request_template.md', 'utf8'),
      readFile('docs/logs/blockers.md', 'utf8'),
      readFile('docs/logs/decision-log.md', 'utf8')
    ]);
    const packageJson = JSON.parse(packageJsonText) as { private?: boolean };

    expect(packageJson.private).toBe(true);
    await expect(stat('LICENSE')).rejects.toMatchObject({ code: 'ENOENT' });
    expect(adrIndex).toContain('[0012](0012-branch-protection-and-release-boundary.md)');
    expect(branchProtectionAdr).toContain('Branch protection and release boundary');
    expect(branchProtectionAdr).toContain('Do not make the repository public to unlock branch protection');
    expect(operationsGuide).toContain('Branch Protection and Release Boundary v0.1');
    expect(operationsGuide).toContain('RepoAssure CI');
    expect(operationsGuide).toContain('Quality Gates');
    expect(operationsGuide).toContain('required status check');
    expect(operationsGuide).toContain('GitHub API returned HTTP 403');
    expect(operationsGuide).toContain('Upgrade to GitHub Pro or make this repository public to enable this feature');
    expect(taxonomySpec).toContain('operations/');
    expect(publicReleaseChecklist).toContain('Branch protection or an equivalent repository ruleset is enabled for `main`');
    expect(privateReadiness).toContain('branch protection and release boundary');
    expect(prTemplate).toContain('Release Boundary');
    expect(prTemplate).toContain('This PR does not add a repository-level LICENSE, publish packages, remove package.json private true, or make the repo public');
    expect(blockersLog).toContain('GitHub branch protection and repository rulesets are unavailable for the private repo');
    expect(blockersLog).toContain('HTTP 403');
    expect(decisionLog).toContain('分支保护与发布边界');
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

  it('extracts acceptance command ownership into a workspace package while preserving compatibility outputs', async () => {
    const [rootPackageJson, acceptancePackageJson, acceptanceCompatibility, acceptanceReadme, monorepoSpec] = await Promise.all([
      readFile('package.json', 'utf8'),
      readFile('packages/acceptance/package.json', 'utf8'),
      readFile('packages/acceptance/src/compatibility.ts', 'utf8'),
      readFile('packages/acceptance/README.md', 'utf8'),
      readFile('docs/architecture/specs/monorepo-structure-spec-v0.1.md', 'utf8')
    ]);

    expect(rootPackageJson).toContain('"build": "pnpm build:packages && pnpm build:src"');
    expect(rootPackageJson).toContain('"build:src": "tsc -p tsconfig.build.json"');
    expect(rootPackageJson).toContain('"build:packages": "pnpm build:shared && pnpm build:browser-explorer && pnpm build:repair-planner && pnpm build:acceptance"');
    expect(rootPackageJson).toContain('"build:shared": "tsc -p packages/shared/tsconfig.build.json"');
    expect(rootPackageJson).toContain('"build:browser-explorer": "tsc -p packages/browser-explorer/tsconfig.build.json"');
    expect(rootPackageJson).toContain('"build:repair-planner": "tsc -p packages/repair-planner/tsconfig.build.json"');
    expect(rootPackageJson).toContain('"build:acceptance": "tsc -p packages/acceptance/tsconfig.build.json"');
    expect(rootPackageJson).toContain('"typecheck": "pnpm build:packages && tsc --noEmit && pnpm typecheck:packages"');
    expect(rootPackageJson).toContain('"typecheck:packages": "pnpm typecheck:shared && pnpm typecheck:browser-explorer && pnpm typecheck:repair-planner && pnpm typecheck:acceptance"');
    expect(rootPackageJson).toContain('"typecheck:shared": "tsc -p packages/shared/tsconfig.json --noEmit"');
    expect(rootPackageJson).toContain('"typecheck:browser-explorer": "tsc -p packages/browser-explorer/tsconfig.json --noEmit"');
    expect(rootPackageJson).toContain('"typecheck:repair-planner": "tsc -p packages/repair-planner/tsconfig.json --noEmit"');
    expect(rootPackageJson).toContain('"typecheck:acceptance": "tsc -p packages/acceptance/tsconfig.json --noEmit"');
    expect(rootPackageJson).toContain('"@hardening-mcp/acceptance": "workspace:*"');
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
    const [activeMigrationGoal, monorepoSpec, packageBuildAdr, acceptanceReadme] = await Promise.all([
      readFile('docs/goals/active/2026-06-20-acceptance-package-migration.md', 'utf8'),
      readFile('docs/architecture/specs/monorepo-structure-spec-v0.1.md', 'utf8'),
      readFile('docs/adr/0006-package-build-strategy.md', 'utf8'),
      readFile('packages/acceptance/README.md', 'utf8')
    ]);
    const exactExportSurfaceMarker = 'exact package export surface';

    expect(activeMigrationGoal).toContain(exactExportSurfaceMarker);
    expect(monorepoSpec).toContain(exactExportSurfaceMarker);
    expect(packageBuildAdr).toContain(exactExportSurfaceMarker);
    expect(acceptanceReadme).toContain(exactExportSurfaceMarker);
    expect(activeMigrationGoal).toContain('unexpected `packages/acceptance/package.json` exports');
    expect(monorepoSpec).toContain('unexpected `packages/acceptance/package.json` exports');
    expect(packageBuildAdr).toContain('unexpected `packages/acceptance/package.json` exports');
    expect(activeMigrationGoal).toContain('acceptancePackageSourceEntries');
    expect(activeMigrationGoal).toContain('acceptancePackageDistOutputEntries');
    expect(activeMigrationGoal).toContain('PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS');
    expect(activeMigrationGoal).toContain('PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS');
    expect(activeMigrationGoal).toContain('PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS');
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
    const [activeMigrationGoal, acceptanceReadme, monorepoSpec] = await Promise.all([
      readFile('docs/goals/active/2026-06-20-acceptance-package-migration.md', 'utf8'),
      readFile('packages/acceptance/README.md', 'utf8'),
      readFile('docs/architecture/specs/monorepo-structure-spec-v0.1.md', 'utf8')
    ]);

    expect(activeMigrationGoal).toContain('benchmark report ownership decision 仍保持在 `src/internal/benchmark`，不属于本 acceptance package 迁移的阻塞项');
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

  it('keeps the active acceptance package migration goal aligned with the current package-owned state', async () => {
    const [activeMigrationGoal, readme, monorepoSpec] = await Promise.all([
      readFile('docs/goals/active/2026-06-20-acceptance-package-migration.md', 'utf8'),
      readFile('README.md', 'utf8'),
      readFile('docs/architecture/specs/monorepo-structure-spec-v0.1.md', 'utf8')
    ]);

    expect(activeMigrationGoal).toContain('Phase 2 implementation modules now live under `packages/acceptance/src`');
    expect(activeMigrationGoal).toContain('`src/internal/acceptance/*` remains as compatibility wrappers');
    expect(activeMigrationGoal).toContain('`dist/internal/acceptance/*` remains as compatibility outputs');
    expect(activeMigrationGoal).toContain('`pnpm acceptance -- --full --browser` 通过 17/17');
    expect(activeMigrationGoal).toContain('`pnpm goal:audit` 显示自动可验证项 0 missing');
    expect(activeMigrationGoal).not.toContain('仍未完成：');
    expect(activeMigrationGoal).not.toContain('通过 15/15');
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
    const [activeMigrationGoal, monorepoSpec, packageBuildAdr] = await Promise.all([
      readFile('docs/goals/active/2026-06-20-acceptance-package-migration.md', 'utf8'),
      readFile('docs/architecture/specs/monorepo-structure-spec-v0.1.md', 'utf8'),
      readFile('docs/adr/0006-package-build-strategy.md', 'utf8')
    ]);

    expect(activeMigrationGoal).toContain(
      '`dist/internal/acceptance/*` remains as compatibility outputs, and `.js` runtime wrappers, `.d.ts` declaration re-exports, and `.js.map` source maps are now checked by goal audit.'
    );
    expect(activeMigrationGoal).toContain(
      '`legacyAcceptanceCompatibilityModules` now drives legacy wrapper, legacy dist JavaScript, legacy dist declaration, and legacy dist source map source specs'
    );
    expect(monorepoSpec).toContain(
      'legacy `dist/internal/acceptance/*` remains a compatibility output surface, not the package execution target, and `.js` runtime wrappers, `.d.ts` declaration re-exports, and `.js.map` source maps are checked by goal audit'
    );
    expect(packageBuildAdr).toContain(
      'Goal audit now checks generated `.js` wrappers, `.d.ts` declaration re-exports, and `.js.map` source maps under `dist/internal/acceptance/*`'
    );
  });

  it('records Codex Security strategy ADR cascade in the latest dev log entry', async () => {
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

    expect(latestEntryStart).toBe(devLog.indexOf('## '));
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
    expect(mvpSpec).toContain('ADR-0013 将 Codex Security 视为未来优先集成的 security provider');
    expect(mvpSpec).toContain('当前 v0.2 不自研 deep vulnerability scanner');
    expect(competitiveLandscape).toContain('Platform-native security scan');
    expect(competitiveLandscape).toContain('Codex Security');
    expect(competitiveLandscape).toContain('Provider-backed Security Assurance Lane');
    expect(commercializationStrategy).toContain('Do not position the product as a direct Codex Security replacement');
    expect(readme).toContain('ADR-0013 固化 Codex Security 影响下的 Security Assurance Lane 策略');
    expect(decisionLog).toContain('新增 `ADR-0013: Codex Security and Security Assurance Lane`');
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
      'compatibility',
      'fatal-error',
      'goal-audit',
      'goal-audit-current-items',
      'goal-audit-delivery',
      'goal-audit-evidence-documents',
      'goal-audit-observability-security',
      'goal-audit-process-governance',
      'goal-audit-requirements',
      'goal-audit-runtime',
      'goal-audit-sources',
      'goal-audit-user-acceptance',
      'goal-audit-user-acceptance-materials',
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
      'user-acceptance',
      'user-acceptance-args',
      'user-acceptance-handoff',
      'user-acceptance-record',
      'user-acceptance-runner-helpers'
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

    expect(rootPackageJson.scripts?.['build:packages']).toBe('pnpm build:shared && pnpm build:browser-explorer && pnpm build:repair-planner && pnpm build:acceptance');
    expect(rootPackageJson.scripts?.['build:shared']).toBe('tsc -p packages/shared/tsconfig.build.json');
    expect(rootPackageJson.scripts?.['build:browser-explorer']).toBe('tsc -p packages/browser-explorer/tsconfig.build.json');
    expect(rootPackageJson.scripts?.['build:repair-planner']).toBe('tsc -p packages/repair-planner/tsconfig.build.json');
    expect(rootPackageJson.scripts?.['build:acceptance']).toBe('tsc -p packages/acceptance/tsconfig.build.json');
    expect(rootPackageJson.scripts?.['typecheck:packages']).toBe('pnpm typecheck:shared && pnpm typecheck:browser-explorer && pnpm typecheck:repair-planner && pnpm typecheck:acceptance');
    expect(rootPackageJson.scripts?.['typecheck:shared']).toBe('tsc -p packages/shared/tsconfig.json --noEmit');
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

    expect(rootPackageJson.scripts?.['build:packages']).toBe('pnpm build:shared && pnpm build:browser-explorer && pnpm build:repair-planner && pnpm build:acceptance');
    expect(rootPackageJson.scripts?.['build:repair-planner']).toBe('tsc -p packages/repair-planner/tsconfig.build.json');
    expect(rootPackageJson.scripts?.['typecheck:packages']).toBe('pnpm typecheck:shared && pnpm typecheck:browser-explorer && pnpm typecheck:repair-planner && pnpm typecheck:acceptance');
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

    expect(rootPackageJson.scripts?.['build:packages']).toBe('pnpm build:shared && pnpm build:browser-explorer && pnpm build:repair-planner && pnpm build:acceptance');
    expect(rootPackageJson.scripts?.['build:browser-explorer']).toBe('tsc -p packages/browser-explorer/tsconfig.build.json');
    expect(rootPackageJson.scripts?.['typecheck:packages']).toBe('pnpm typecheck:shared && pnpm typecheck:browser-explorer && pnpm typecheck:repair-planner && pnpm typecheck:acceptance');
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
