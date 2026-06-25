# Monorepo Readiness Audit v0.1

最后更新：2026年6月25日
状态：Accepted for pre-v0.3 planning
适用范围：RepoAssure monorepo 全貌判断、v0.3 前置排序和查漏补缺计划

## 结论

当前 repo 是可运行的分阶段 monorepo，不是成熟完成态 monorepo。

它已经具备 `apps/*`、`packages/*`、package-first build、兼容 wrapper、CI、goal audit、acceptance 文档和多 package ownership；但 `packages/core` 仍是未来占位，`apps/cli` 与 `apps/mcp-server` 仍通过 built `dist/adapters/*` 兼容入口运行，`examples/` 仍未承载真实示例，GitHub Action wrapper 尚未实现，repo hygiene 仍主要检查路径级别的 generated/private artifact 入库风险。

因此，v0.3 可以继续推进，但必须在正式开发 v0.3 distribution and repair loop 之前完成本审计落档，并把未完成项纳入明确优先级。v0.3 不应吸收所有 monorepo 成熟化工作；它只处理与分发、repair loop 和 public-release readiness 直接相关的缺口。

## Scan Basis

本审计基于以下当前 repo 事实：

- `pnpm-workspace.yaml` 已声明 `apps/*` 与 `packages/*`。
- `packages/acceptance`、`packages/shared`、`packages/security-assurance`、`packages/browser-explorer`、`packages/repair-planner` 已成为 package-owned 实现边界。
- `packages/core` 只有 README，占位为未来 orchestration primitives。
- `apps/cli` 和 `apps/mcp-server` 是 compatibility app shells，仍导入 `dist/adapters/cli/index.js` 与 `dist/adapters/mcp/index.js`。
- `.github/workflows/ci.yml` 已覆盖 repo hygiene、unit、typecheck、lint、build、goal audit，但尚无 RepoAssure GitHub Action wrapper。
- `examples/README.md` 仍为 reserved 状态。
- `.gitignore` 已排除 artifacts、dist、test-results、env、private key 类文件。
- `scripts/check-repo-hygiene.mjs` 已做 tracked path hygiene，不是完整 secret/content scanner。
- `docs/architecture/specs/monorepo-structure-spec-v0.1.md` 已定义 phased monorepo，而不是一次性完成迁移。

## Before v0.3

v0.3 distribution and repair loop readiness 启动前必须满足：

| 优先级 | 项目 | 判断 | 处理方式 |
| --- | --- | --- | --- |
| P0 | monorepo readiness audit 落档 | 当前已识别但未固化 | 本文档固化判断与排序 |
| P0 | v0.3 goal 前置依赖 | v0.3 不能绕过结构全貌判断 | 在 v0.3 goal 中加入前置条件 |
| P0 | structure tests | 文档级联需要自动守护 | `project-structure.test.ts` 覆盖本审计、v0.3 前置条件和日志 |
| P0 | 当前文档治理变更 | 存在多份未提交文档更新 | 执行 v0.3 前应先完成验证并由用户决定是否提交 |
| P1 | `packages/core` | 仍为空壳 | 仅在降低 v0.3 分发或 repair loop 风险时迁移；否则延期 |
| P1 | `apps/cli` / `apps/mcp-server` | 仍为 dist compatibility shells | v0.3 可继续复用；不作为 blocker |
| P1 | GitHub Action wrapper | 尚未实现 | 属于 v0.3 P0 scope |
| P1 | `examples/` | 尚无可运行示例 | 属于 v0.3 distribution docs/examples scope |
| P1 | repo hygiene | 路径级检查已存在，内容级 secret scan 不完整 | 属于 v0.3 public-release readiness checks |
| P2 | benchmark package ownership | 仍在 root internal/scripts | 非 v0.3 blocker |
| P2 | `artifacts/user-acceptance-runs/` | 仍为 future target | 多 repo history 或 hosted dashboard 前再处理 |
| P2 | `apps/web-dashboard` | 仍为 future target | hosted/dashboard ADR 前不启动 |

## Architecture Implications

- 不新增 ADR：本轮没有改变 ADR-0005、ADR-0006 或 ADR-0014 的长期架构方向，只是把 v0.3 前置审计和排序落档。
- 不迁移运行时代码：本审计不抽取 `packages/core`，不改变 CLI/MCP bin，不移动 benchmark，不改变 generated artifact contract。
- 维持 compatibility-first：现有 root `src/*` 与 package-owned modules 的兼容 wrapper 策略继续有效。
- v0.3 实现时优先补齐分发面和 repair loop contract，而不是追求“成熟 monorepo”形式完整。

## 查漏补缺计划

1. 将本审计纳入 `docs/architecture/specs/`，作为 v0.3 前置架构事实。
2. 新增并归档 Codex goal，明确 monorepo readiness 的 TDD、测试金字塔、完成证据和非代码迁移边界。
3. 更新 v0.3 goal，显式依赖 monorepo readiness audit。
4. 更新 monorepo structure spec，将 readiness audit before v0.3 加入 migration contract。
5. 更新 testing strategy，使结构测试覆盖 goal 排序、package/app 空位和文档级联。
6. 更新 decision/dev logs，保留为什么 v0.3 前要先做全貌判断的过程证据。
7. 后续执行 v0.3 时，只把 GitHub Action wrapper、examples、repo hygiene/public-release checks 和 repair-loop contract 当作 v0.3 直接任务；`packages/core` 抽取需要独立判断。

## Acceptance Criteria

- `docs/architecture/specs/monorepo-readiness-audit-v0.1.md` 存在，并记录当前 repo 不是成熟完成态 monorepo。
- `docs/goals/completed/2026-06-25-monorepo-readiness-audit.md` 存在，并定义 TDD、测试金字塔和完成证据。
- v0.3 active goal 明确包含 `monorepo readiness audit` 前置条件。
- `monorepo-structure-spec-v0.1.md` 引用本审计。
- `test-strategy-v0.1.md` 说明 monorepo readiness 结构测试职责。
- `decision-log.md` 和 `dev-log.md` 记录本次排序决策与执行内容。
- Focused `project-structure` 测试通过。
