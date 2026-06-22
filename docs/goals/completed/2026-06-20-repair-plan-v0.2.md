# hardening-mcp Repair Plan v0.2 Codex Goal

最后更新：2026年6月20日
状态：已完成
适用范围：Spec v0.2 `repair-plan` 能力开发

## Goal Objective

在不破坏 v0.1 CLI、MCP、`run_hardening`、验收记录和现有物料兼容路径的前提下，实现 v0.2 `repair-plan` 能力。

该能力必须把 v0.1 的诊断材料转化为 AI IDE / Agent 可直接消费的结构化修复任务：

```text
findings.json + test-generation.json + boot-result.json
  -> repair-plan.json
  -> repair-plan.md
  -> manifest.files.repairPlan
  -> AI IDE / Agent 执行修复
```

## Authorization

用户授权 Codex 全自动执行本 goal，包括：

- 修改 TypeScript 源码、测试、README 和验收文档。
- 新增 `src/domain/repair-plan/`、类型、tool、CLI 和 MCP 入口。
- 更新 run bundle manifest、workspace bundle、用户验收检查和 goal audit。
- 按 TDD 运行相关 unit、integration、E2E、acceptance 和 goal audit。

仍必须遵守：

- 不默认自动修改目标 repo 业务代码。
- 不上传代码、日志、截图、trace 或 repair plan。
- 不写入 env value、token、cookie、授权头或 URL 敏感参数原值。
- 无法解决的问题必须记录到 `docs/logs/blockers.md`。

## Scope

### Must Have

- `repair-plan.json`：机器可读 schema，包含 `schemaVersion`、`runId`、`repoRoot`、`sourceManifest`、`summary` 和 `tasks`。
- `repair-plan.md`：人类可读修复计划。
- `run_hardening`：完整流程自动生成 repair plan。
- Manifest：`.hardening/runs/<run-id>/manifest.json` 的 `files` 和 `entrypoints` 引用 repair plan。
- Legacy path：`.hardening/run/repair-plan.json` 和 `.hardening/run/repair-plan.md` 继续方便人工查看。
- CLI：`hardening plan <repo>`。
- MCP：`generate_repair_plan`。
- Workspace：多 repo bundle 保留每个 repo 的 repair plan。
- 验收：user acceptance、README、user guide、acceptance checklist 和 goal audit 都把 repair plan 纳入核心物料。

### Non-goals

- 不自动改代码。
- 不自动提交 Git diff 或创建 PR。
- 不接入 LLM。
- 不做复杂代码定位或静态依赖图推断；`suggestedFiles` 在 v0.2 可保持空数组。

## TDD Plan

1. Red：新增 `tests/unit/repair-plan.test.ts`，定义 deterministic schema、排序、脱敏和空 findings 行为。
2. Red：扩展 `run-hardening-tool` 集成测试，要求 run bundle 和 manifest 包含 repair plan。
3. Red：扩展 CLI/MCP 测试，要求 `plan` 和 `generate_repair_plan` 可用。
4. Green：实现 domain generator、tool wrapper、CLI/MCP 入口和 `run_hardening` 集成。
5. Refactor：把用户验收、README、acceptance checklist、goal audit 同步到 v0.2。
6. Final：运行完整质量门禁。

## Success Criteria

| 类别 | 通过标准 |
| --- | --- |
| Schema | `repair-plan.json` 结构稳定且含 summary/tasks |
| 任务质量 | findings 能转成带 severity、evidence、repairIntent、verification、agentPrompt 的任务 |
| 隐私 | repair plan 脱敏敏感值 |
| CLI | `hardening plan <repo>` 可从 latest run 生成 repair plan |
| MCP | `generate_repair_plan` 可通过 tool registry 调用 |
| Bundle | `.hardening/latest/manifest.json` 引用 repair plan |
| Workspace | 多 repo workspace bundle 保留 repair plan |
| 验收 | user acceptance 检查 repair plan artifacts |
| 门禁 | typecheck、lint、unit、integration、E2E、acceptance、goal audit 通过 |

## Completion Evidence

- `repair-plan.json` 和 `repair-plan.md` 已由 `run_hardening` 自动生成，并复制到 run-scoped bundle 与 legacy `.hardening/run`。
- CLI 新增 `hardening plan <repo>`。
- MCP 新增 `generate_repair_plan`。
- `.hardening/latest/manifest.json` 的 `entrypoints` 和 `files` 均引用 repair plan。
- 用户验收检查新增 `repair-plan.json` 和 `repair-plan.md`。
- Benchmark runner 的旧 dist path 回归已修复，并有结构测试守护。
- 最终验证通过：
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm test:unit`
  - `pnpm test:integration`（提权）
  - `pnpm test:e2e`
  - `pnpm benchmark`（提权）
  - `pnpm acceptance -- --full --browser`（提权）
  - `pnpm goal:audit`
