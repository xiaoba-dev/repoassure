# RepoAssure Monorepo Readiness Audit Codex Goal

最后更新：2026年6月25日
状态：已完成
适用范围：v0.3 前置 monorepo 全貌判断、查漏补缺计划和文档级联
关联文档：

- `docs/architecture/specs/monorepo-readiness-audit-v0.1.md`
- `docs/architecture/specs/monorepo-structure-spec-v0.1.md`
- `docs/goals/active/2026-06-25-v0.3-distribution-repair-loop-readiness.md`
- `docs/testing/strategy/test-strategy-v0.1.md`

## Goal Objective

在启动 v0.3 distribution and repair loop readiness 之前，完成一次 monorepo readiness 全貌判断，并把结论级联写入架构、goal、测试策略和日志文档。

本 goal 的目标不是把 repo 一次性改造成成熟 monorepo，而是识别哪些缺口会影响 v0.3，哪些缺口应延期，避免 v0.3 scope 被结构迁移任务污染。

## Authorization

用户授权 Codex 全自动执行本 goal，包括：

- 扫描 repo 当前目录结构、package/app ownership、CI、hygiene、examples、docs taxonomy 和 active goals。
- 新增或更新架构规格、active goal、testing strategy、decision log、dev log。
- 以 TDD 方式新增结构测试，先暴露缺失文档和级联关系，再补齐文档。
- 运行 focused structure tests、repo hygiene、lint、typecheck、goal audit 等低风险自动门禁。

仍必须遵守：

- 不迁移运行时代码。
- 不抽取 `packages/core`。
- 不改变 CLI/MCP bin 或 compatibility wrapper。
- 不新增 GitHub Action wrapper；该任务属于 v0.3。
- 不新增 ADR，除非后续决定改变长期架构方向。
- 遇到无法解决的问题，必须记录到 `docs/logs/blockers.md`。

## TDD Plan

1. Red：新增 `project-structure` 测试，要求存在 monorepo readiness audit、active goal、v0.3 前置条件和日志级联。
2. Green：新增 `monorepo-readiness-audit-v0.1.md` 与本 goal。
3. Green：更新 v0.3 goal、monorepo structure spec、testing strategy、decision log 和 dev log。
4. Refactor：只整理文档措辞、排序和交叉引用，不迁移运行时代码。
5. Final：运行 focused structure test，再按测试金字塔补充 repo hygiene、lint、typecheck 和 goal audit。

## 测试金字塔

| 层级 | 覆盖内容 |
| --- | --- |
| Unit / structure | `project-structure.test.ts` 验证文档存在、前置依赖、monorepo 空位和日志级联 |
| Integration | 不需要新增 integration；本 goal 不改变 runtime flow |
| E2E / acceptance | 不需要新增 E2E；v0.3 实现时再覆盖 GitHub Action wrapper 与 repair loop |

## Success Criteria

| 类别 | 通过标准 |
| --- | --- |
| 架构判断 | 明确记录当前是 phased monorepo，不是成熟完成态 monorepo |
| 排序 | v0.3 goal 明确依赖 monorepo readiness audit |
| Scope 控制 | `packages/core`、app shell 深迁移、dashboard、benchmark ownership 不进入本 goal |
| 文档级联 | architecture spec、goal、testing strategy、decision log、dev log 一致 |
| 门禁 | focused structure test、repo hygiene、lint、typecheck、goal audit 通过 |

## Completion Evidence

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "monorepo readiness"` 因 readiness audit 文档缺失按预期失败。
- Green：补齐 audit 文档、goal 和级联文档后，同一 focused test 通过。
- `pnpm vitest run tests/unit/project-structure.test.ts`：通过，58 个测试。
- `pnpm repo:hygiene`：通过。
- `pnpm lint`：通过。
- `pnpm typecheck`：通过。
- `pnpm goal:audit`：通过，33 项检查、33 项已通过、0 missing、0 需要人工确认。
- `git diff --check`：通过。

## Non-goals

- 不实现 v0.3 功能。
- 不新增 GitHub Action wrapper。
- 不迁移 `packages/core`。
- 不改变 artifact layout。
- 不发布 package、不创建 PR。
