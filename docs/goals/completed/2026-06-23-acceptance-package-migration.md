# Acceptance Package Migration Codex Goal

最后更新：2026年6月23日
状态：已完成
适用范围：`packages/acceptance` 后续迁移
关联文档：

- `docs/adr/0005-phased-monorepo-migration.md`
- `docs/adr/0006-package-build-strategy.md`
- `docs/architecture/specs/monorepo-structure-spec-v0.1.md`
- `docs/architecture/specs/docs-taxonomy-spec-v0.1.md`
- `packages/acceptance/README.md`

## Goal Objective

按照 TDD 和测试金字塔原则完成 `packages/acceptance` 后续迁移。

目标是在不破坏现有 CLI/MCP/验收脚本、生成型验收文档路径、`dist/internal/acceptance/*` 兼容输出和完整验收证据的前提下，逐步将 `src/internal/acceptance/*` 中低耦合实现模块迁入 `packages/acceptance/src`，使 `packages/acceptance` 从 wrapper 试点包演进为真正承载 acceptance 能力的 workspace package。

## Authorization

用户授权 Codex 全自动执行该迁移目标，包括：

- 创建、移动和修改项目文件。
- 编写 package API、compatibility wrapper、测试和文档。
- 更新 root scripts、package exports、tsconfig、lint/test ignore、README、ADR、Spec 和日志。
- 运行 unit、integration、E2E、benchmark、acceptance、goal audit、typecheck、lint 和 build。
- 在需要本地端口监听或 Playwright Chromium 权限时按环境规则请求提权。

仍必须遵守以下边界：

- 不破坏 `hardening` 和 `hardening-mcp` bin 入口。
- 不破坏 root scripts：`acceptance`、`goal:audit`、`user:accept`、`user:handoff`。
- 不移动生成型验收输出路径，除非先实现兼容路径或可配置输出路径：
  - `docs/acceptance/acceptance-run.md`
  - `docs/acceptance/goal-completion-audit.md`
  - `docs/acceptance/user-acceptance-handoff.md`
  - `docs/acceptance/user-acceptance-record.md`
- 不删除 `src/internal/acceptance/*` 旧路径；迁移期间旧路径必须作为 compatibility wrapper 或兼容实现存在。
- 不让 `src` root build 反向依赖 package，除非先重构 build strategy 并通过兼容测试。
- 不上传代码、日志、截图、trace、env value、token、cookie 或私有 repo 内容。
- 遇到无法解决的问题，必须记录到 `docs/logs/blockers.md`。

## Completion Evidence

本 goal 已归档为 completed。`packages/acceptance` 当前已经承载 acceptance implementation modules、runner entrypoints、goal audit、user acceptance、user handoff、repo preflight、Python/CLI acceptance mode 和相关 helper；`src/internal/acceptance/*` 与 `dist/internal/acceptance/*` 保留为 compatibility wrapper/output surfaces。

完成证据：

- `packages/acceptance/src` owns acceptance implementation modules and runner entrypoints.
- Root scripts `acceptance`、`goal:audit`、`user:accept`、`user:handoff` execute package-owned dist runners.
- Legacy `src/internal/acceptance/*` and `dist/internal/acceptance/*` compatibility outputs are covered by project structure tests and goal audit.
- `pnpm acceptance -- --full --browser` documented as passing 17/17 in the migration record.
- `pnpm goal:audit` now reports 31 checks, 30 passed, 0 missing, and 1 manual user confirmation boundary.
- Later package extractions for shared、browser-explorer and repair-planner are complete; benchmark report ownership remains intentionally outside this goal.

The remaining user confirmation is not an acceptance-package migration blocker; it is the product-level manual acceptance boundary recorded in `docs/acceptance/goal-completion-audit.md`.

## Current State

已完成：

- Phase 2a：root scripts 通过 `packages/acceptance/dist/*` 执行 acceptance runners。
- Phase 2b：Phase 2 implementation modules now live under `packages/acceptance/src` for acceptance report, goal audit, user acceptance, user acceptance handoff, repo preflight, shell parsing, generated-test validation helpers, and runner entrypoints.
- `src/internal/acceptance/*` remains as compatibility wrappers that delegate to `packages/acceptance/dist/*`.
- `dist/internal/acceptance/*` remains as compatibility outputs, and `.js` runtime wrappers, `.d.ts` declaration re-exports, and `.js.map` source maps are now checked by goal audit.
- `packages/acceptance/package.json` exposes typed package subpath exports for all package-owned acceptance implementation modules and runner entrypoints.
- `acceptanceCompatibilityContract.packageOwnedModules` now drives package subpath specifiers and structure tests, reducing drift between source modules, package exports, root API re-exports, and import smoke coverage.
- `acceptancePackageSourceEntries` is derived from `acceptanceCompatibilityContract.packageOwnedModules` and now drives package source file structure tests, package import smoke runtime contract checks, and package type-resolution smoke checks.
- `acceptancePackageDistOutputEntries` is derived from `acceptancePackageExportEntries` and now drives package dist output structure tests, package import smoke runtime contract checks, and package type-resolution smoke checks.
- `PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS`, `PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS`, and `PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS` are derived from `acceptancePackageDistOutputEntries` and now drive goal audit source collection, process governance checks, package import smoke runtime contract checks, and package type-resolution smoke checks through the package root and `goal-audit-sources` subpath.
- Goal audit typed package export checks are derived from `acceptancePackageExportEntries` and now enforce an exact package export surface: missing, mismatched, or unexpected `packages/acceptance/package.json` exports are reported before architecture migration evidence can pass.
- `legacyAcceptanceCompatibilityModules` now drives legacy wrapper, legacy dist JavaScript, legacy dist declaration, and legacy dist source map source specs while preserving existing compatibility source order.
- `legacyAcceptanceWrapperSourceEntries` is derived from `legacyAcceptanceCompatibilityModules` and now drives legacy wrapper source paths for goal audit source collection, structure tests, package import smoke runtime contract checks, and package type-resolution smoke checks.
- Legacy `GOAL_AUDIT_TEXT_SOURCE_PATHS` entries for source wrappers, runtime outputs, declaration outputs, and source map outputs are generated from compatibility contract entries.
- `pnpm acceptance -- --full --browser` 当前通过 17/17；额外的 all-subpath package import smoke 和 package subpath type-resolution smoke 已纳入标准验收门禁。
- `pnpm goal:audit` 当前为 31 项检查、30 项自动证据通过、0 项缺失、1 项需用户人工确认。

剩余外部条件：

- 用户人工验收结论仍未提供；自动脚本不能代替用户确认 MVP 符合预期。
- benchmark report ownership decision 仍保持在 `src/internal/benchmark`，不属于本 acceptance package 迁移的阻塞项。

## Migration Strategy

### Phase 0 - Baseline Audit

目标：确认当前迁移起点稳定。

任务：

- 读取 `src/internal/acceptance/*` imports 和 exports。
- 标注模块耦合级别：
  - low：纯函数或仅依赖 package-owned helper。
  - medium：依赖 `src/shared/*` 或 acceptance sibling types。
  - high：依赖 root、filesystem、runner、CLI args、toolchain 或 browser/runtime。
- 更新迁移顺序。

门禁：

```bash
pnpm test:unit
pnpm typecheck
pnpm lint
pnpm build
```

### Phase 1 - Low-Coupling Modules

优先迁移低耦合实现模块：

1. `report.ts`
2. `goal-audit.ts`
3. `user-acceptance.ts`

TDD 顺序：

1. Red：新增 package API 测试，直接从 `packages/acceptance/src/*` import。
2. Red：新增 legacy compatibility 测试，证明旧 `src/internal/acceptance/*` 行为仍与 package API 一致。
3. Green：迁入 package-owned implementation。
4. Green：更新 package exports。
5. Refactor：只在测试保护下整理命名和边界。

最小门禁：

```bash
pnpm vitest run tests/unit/acceptance-package.test.ts
pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts
pnpm typecheck
pnpm lint
pnpm build
```

### Phase 2 - Medium-Coupling Modules

迁移依赖 acceptance sibling types 或 shared helpers 的模块：

1. `user-acceptance-handoff.ts`
2. `repo-preflight.ts`
3. `user-acceptance-args.ts`

前置决策：

- 若仅依赖 acceptance package 内部模块，直接迁入。
- 若依赖 `src/shared/*`，先决定：
  - 临时保持旧路径兼容；
  - 或先推进 `packages/shared`；
  - 或在 `packages/acceptance` 中注入 formatter/redaction 函数，避免深层依赖。

TDD 顺序同 Phase 1。

最小门禁：

```bash
pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/repo-preflight.test.ts tests/unit/user-acceptance.test.ts
pnpm typecheck
pnpm lint
pnpm build
```

### Phase 3 - Runner Ownership

迁移 runner modules：

1. `run-acceptance.ts`
2. `run-goal-audit.ts`
3. `run-user-acceptance.ts`
4. `run-user-acceptance-handoff.ts`

兼容要求：

- root scripts 继续通过 `packages/acceptance/dist/*` 执行。
- `dist/internal/acceptance/*` 继续存在，作为旧路径 wrapper。
- help smoke 必须继续通过：

```bash
node packages/acceptance/dist/run-acceptance.js --help
node packages/acceptance/dist/run-user-acceptance.js --help
node packages/acceptance/dist/run-user-acceptance-handoff.js --help
```

### Phase 4 - Generated Output Compatibility

目标：决定是否迁移生成型验收输出路径。

默认策略：

- 不迁移当前默认输出路径。
- 只允许新增可配置路径或 manifest。
- 若未来需要迁移到 `docs/acceptance/records/` 或 `artifacts/acceptance-runs/`，必须先实现兼容 alias 或明确文档入口。

### Phase 5 - Full Validation

最终必须通过：

```bash
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm typecheck
pnpm lint
pnpm build
pnpm acceptance -- --full --browser
pnpm goal:audit
```

如果当前环境阻止本地监听或 Chromium 启动，应按权限规则提权运行；如果提权仍失败，记录到 `docs/logs/blockers.md`，并保留已通过的非浏览器门禁证据。

## Testing Pyramid

### Unit Tests

必须覆盖：

- package-owned implementation API。
- legacy compatibility behavior。
- Markdown/report formatting。
- goal audit summary and markdown。
- user acceptance summary and markdown。
- handoff markdown。
- args parsing。
- repo preflight edge cases。
- privacy/redaction boundaries。

### Integration Tests

必须覆盖：

- root scripts 调用 package wrappers。
- package wrappers 调用 compatibility entrypoints。
- generated acceptance outputs 仍写到兼容路径。
- CLI/MCP 主链路不受 acceptance package 迁移影响。

### E2E Tests

必须覆盖：

- `pnpm acceptance -- --full --browser`
- real Chromium trace E2E
- benchmark Go
- `pnpm goal:audit` 自动可验证项 0 missing

## Success Definition

该 goal 只有在以下条件全部满足时才能标记完成：

- `packages/acceptance` 承载 acceptance implementation modules，而不只是 command wrapper。
- 所有迁移模块都有 package API 测试和旧路径兼容测试。
- root scripts 和旧 `dist/internal/acceptance/*` 路径仍可用。
- 生成型验收文档路径未破坏。
- `pnpm acceptance -- --full --browser` 通过 17/17。
- `pnpm goal:audit` 显示自动可验证项 0 missing。
- README、ADR、monorepo spec、package README 和 dev-log 已同步。
- 若存在未解决 blocker，已记录到 `docs/logs/blockers.md`，并明确下一步。

## Non-Goals

- 不迁移 CLI/MCP app shell。
- 不迁移 `packages/core`、`packages/browser-explorer`、`packages/repair-planner`。
- 不迁移 `packages/shared`，除非 acceptance 迁移被其阻塞且已有明确 ADR 或 spec 更新。
- 不改变用户可见 acceptance report 格式，除非先写测试并说明兼容影响。
- 不把目标 repo hardening artifacts 移入本 repo 源码目录。
