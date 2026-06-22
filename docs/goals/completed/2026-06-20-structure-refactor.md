# hardening-mcp 结构治理 Codex Goal

最后更新：2026年6月20日
状态：已完成
适用范围：项目文件夹结构优化与长期可维护性治理

## Goal Objective

在不降低现有功能、测试、验收证据和文档可追溯性的前提下，全自动优化 `hardening-mcp` 项目文件夹结构，使仓库边界更清晰、运行产物更可控、文档更易检索、源码层次更适合 v0.2 `repair-plan` 能力演进。

该 goal 的最终交付必须满足：

- 顶层目录只保留源码、配置、文档入口和必要项目文件。
- 运行产物统一进入 `artifacts/` 或明确忽略目录。
- `docs/` 按产品、架构、测试、验收、日志和归档分层。
- `src/` 明确区分领域逻辑、工具编排、入口适配器、共享工具和内部治理脚本。
- 所有脚本、测试、文档引用和 goal audit 证据在迁移后仍可通过。
- `pnpm acceptance -- --full --browser` 和 `pnpm goal:audit` 最终通过。

## Authorization

用户授权 Codex 全自动执行该结构治理，包括：

- 创建、移动和修改项目文件。
- 更新 imports、脚本路径、文档链接、测试引用和审计规则。
- 运行 typecheck、lint、unit、integration、E2E、benchmark、acceptance 和 goal audit。
- 清理 Codex 自身产生的无价值临时运行产物。

仍必须遵守以下边界：

- 不删除用户未授权的源代码、文档和最终验收记录。
- 不破坏 `docs/acceptance/user-acceptance-record.md`、`docs/acceptance/acceptance-run.md`、`docs/acceptance/goal-completion-audit.md` 的历史证据价值；若迁移，必须保留明确入口或更新所有引用。
- 不把敏感路径、env value、token、cookie 或私有 repo 内容写入新文档。
- 对大规模目录迁移采取小步执行，迁移后立即运行相关测试。

## Target Structure

目标结构如下：

```text
.
├── src/
│   ├── domain/
│   │   ├── analyze/
│   │   ├── boot/
│   │   ├── explore/
│   │   ├── reports/
│   │   ├── tests/
│   │   └── repair-plan/
│   ├── tools/
│   ├── adapters/
│   │   ├── cli/
│   │   └── mcp/
│   ├── shared/
│   └── internal/
│       ├── acceptance/
│       └── benchmark/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── fixtures/
├── docs/
│   ├── product/
│   ├── architecture/
│   ├── testing/
│   ├── acceptance/
│   ├── logs/
│   └── archive/
├── scripts/
├── artifacts/
│   ├── benchmark-runs/
│   └── test-results/
└── dist/
```

## Migration Strategy

### Phase 0 - Structure Contract

先落地本文档，并在 `docs/logs/dev-log.md`、`docs/logs/decision-log.md` 记录本次结构治理目标。

验收：

- goal 文档存在。
- 迁移原则和目标结构明确。
- 不改运行时代码。

### Phase 1 - 顶层运行产物治理

将顶层运行产物从项目根目录移出或标记为可清理：

- `benchmark-runs/` 迁移为 `artifacts/benchmark-runs/`。
- `test-results/` 迁移为 `artifacts/test-results/`。
- `.pnpm-store/` 继续作为本地 package store 忽略。
- `--help/` 判定为误生成目录；若仅包含 hardening 运行产物且没有源代码价值，可删除或迁入 `artifacts/orphaned-runs/--help/`。

兼容要求：

- benchmark runner 默认写入 `artifacts/benchmark-runs/`。
- `.gitignore`、ESLint ignore、Vitest exclude 同步更新。
- 文档和测试中关于 benchmark 运行目录的说明同步更新。

### Phase 2 - docs 分层

将文档按职责拆分：

```text
docs/product/
  mvp-spec-v0.1.md
  mvp-spec-v0.2.md
  user-interview-script.md

docs/architecture/
  architecture.md
  technical-spike-plan.md

docs/testing/
  test-strategy.md
  sample-hardening-report.md

docs/acceptance/
  acceptance-checklist.md
  acceptance-run.md
  goal-completion-audit.md
  user-acceptance-guide.md
  user-acceptance-handoff.md
  user-acceptance-record.md
  user-acceptance-record.rotifer-alpha.md

docs/logs/
  dev-log.md
  blockers.md
  decision-log.md
  spike-results.md

docs/goals/
  codex-goal.md
  codex-goal-structure-refactor.md
```

兼容要求：

- README 必须更新到新路径。
- `run-acceptance`、`run-goal-audit`、`run-user-acceptance`、`run-user-acceptance-handoff` 的默认输出路径同步更新，或明确保留旧路径入口。
- goal audit 的 required document 清单必须对应新结构。

### Phase 3 - src 边界整理

迁移源码边界：

- `src/core/*` -> `src/domain/*`。
- `src/shared/privacy-redaction.ts`、`shell-quote.ts`、`shell-words.ts` -> `src/shared/*`。
- `src/adapters/cli/*` -> `src/adapters/cli/*`。
- `src/adapters/mcp/*` -> `src/adapters/mcp/*`。
- `src/internal/acceptance/*` -> `src/internal/acceptance/*`。
- `src/internal/benchmark/*` -> `src/internal/benchmark/*`。
- `src/tools/*` 暂时保留，作为 domain 与 adapters 的 tool orchestration 层。

兼容要求：

- package `bin` 输出仍为 `dist/adapters/cli/index.js` 和 `dist/adapters/mcp/index.js`，或者保留旧 dist wrapper。
- 所有 imports 必须通过 typecheck。
- 测试路径命名可以后续优化，但测试内容必须继续通过。

### Phase 4 - README 与开发者入口

更新 README 的目录说明，明确：

- 用户入口。
- 开发者入口。
- 运行产物入口。
- 文档入口。
- AI IDE 应读取的 artifacts 和 repair-plan 未来入口。

### Phase 5 - 完整验收

最终必须运行：

```bash
pnpm typecheck
pnpm lint
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm acceptance -- --full --browser
pnpm goal:audit
```

若浏览器相关命令因 sandbox 权限失败，必须用提权方式重跑，并在 `docs/logs/blockers.md` 或迁移日志中记录原因。

## TDD Policy

本 goal 仍按 TDD 和测试金字塔执行：

- 目录迁移前先补或调整测试，证明目标路径和兼容路径的预期。
- 每个迁移阶段只改一类边界。
- 单测优先覆盖路径解析、默认输出、文档清单和 audit 证据。
- 集成测试覆盖 CLI/MCP 路径不被破坏。
- E2E 和 acceptance 在阶段末尾验证。

## Success Criteria

| 类别 | 通过标准 |
| --- | --- |
| 顶层结构 | 根目录不再堆放 benchmark/test 运行产物 |
| 文档结构 | docs 按职责分层，README 指向新入口 |
| 源码结构 | domain/adapters/shared/internal/tools 边界清晰 |
| 兼容性 | CLI、MCP、acceptance、goal audit 均可运行 |
| 证据 | 最终 acceptance 和 goal audit 全绿 |
| 日志 | dev-log、decision-log、blockers 持续记录迁移过程 |

## Completion Evidence

- `benchmark-runs/`、`test-results/` 和误生成的 `--help/` 已迁移到 `artifacts/` 下，runner、ignore 和测试排除规则同步更新。
- `docs/` 已按 product、architecture、testing、acceptance、logs、goals 分层，默认输出路径和 README 入口同步更新。
- `src/` 已按 adapters、domain、shared、internal、tools 拆分，CLI/MCP bin 和 acceptance scripts 指向新构建路径。
- `dist/` 已清理迁移前残留目录并重新构建，构建产物只保留新结构目录。
- 最终验证通过：
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm test:unit`
  - `pnpm test:integration`
  - `pnpm test:e2e`
  - `pnpm acceptance -- --full --browser`
  - `pnpm goal:audit`

## Non-goals

本 goal 不做：

- v0.2 repair-plan 业务实现。
- 改变 MCP tool 行为。
- 改变 hardening report schema。
- 重写测试框架。
- 引入 monorepo。
- 引入新构建工具。

## Risk Controls

| 风险 | 控制策略 |
| --- | --- |
| 路径引用大量断裂 | 先 `rg` 建索引，小步迁移后立即测试 |
| 历史验收证据丢失 | 迁移到 `docs/acceptance/`，不删除 |
| dist bin 路径变化破坏 package bin | 优先保留 wrapper 或同步 package bin 和测试 |
| goal audit 自举失败 | 先调整 audit 测试，再调整 audit 实现 |
| 大量 artifacts 移动耗时 | 只迁移最新必要产物，历史大目录可先忽略或归档 |

## Completion Boundary

只有当以下条件同时满足，才能标记该 goal 完成：

1. 结构治理文档和日志已更新。
2. 目标目录结构已经落地，或明确记录延期项。
3. 所有默认路径和 README 已更新。
4. `pnpm acceptance -- --full --browser` 通过。
5. `pnpm goal:audit` 通过。
6. 用户可以从 README 清楚理解源码、文档和运行产物位置。
