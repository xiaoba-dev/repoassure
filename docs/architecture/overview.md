# 架构说明

## 系统定位

`hardening-mcp` 是一个本地优先的 Code Hardening MCP Server + CLI。它面向 AI IDE 和命令行场景，用同一套核心实现完成 Web App 仓库的分析、启动、浏览器探索、测试生成、报告输出、结构化修复计划生成、修复交接、验证复跑和补丁计划生成。

长期架构决策记录在 `docs/adr/README.md`。本文件描述当前架构状态；ADR 描述为什么选择这些架构方向。

## 主流程

```mermaid
flowchart LR
  A["analyze_repo"] --> B["boot_app"]
  B --> C["explore_app"]
  C --> D["generate_tests"]
  D --> E["harden_report"]
  E --> F["generate_repair_plan"]
  F --> G["repair_handoff"]
  G --> H["repair_execute"]
  H --> I["repair_patch_plan"]
  I --> J["bundle_artifacts"]

  classDef core fill:#dbeafe,stroke:#2563eb,color:#111827
  classDef output fill:#dcfce7,stroke:#16a34a,color:#111827
  class A,B,C,D core
  class E,F,G,H,I,J output
```

| 阶段 | 责任 | 主要产物 |
| --- | --- | --- |
| `analyze_repo` | 识别框架、npm/pnpm/yarn/Bun 包管理器、脚本、启动建议和 env key hints | `.hardening/run/repo-profile.json` |
| `boot_app` | 启动本地 dev server，提取 URL，探测可达性 | `.hardening/run/boot-result.json`、`.hardening/run/app.log` |
| `explore_app` | 探索页面、复用 storageState 登录态、捕获运行时错误、截图、trace、安全交互和表单填充 | `.hardening/run/findings.json`、`.hardening/artifacts/*` |
| `generate_tests` | 将 findings 和 smoke routes 转换为 Playwright regression specs | `tests/hardening/*.spec.ts` |
| `harden_report` | 汇总证据、严重级别、测试和修复指导 | `hardening-report.md`、`.hardening/run/patch.diff` |
| `generate_repair_plan` | 将 findings、测试和启动结果转换为 AI IDE 可执行修复任务 | `.hardening/run/repair-plan.json`、`.hardening/run/repair-plan.md`、`.hardening/runs/<run-id>/repair-task-package.json`、`.hardening/runs/<run-id>/repair-task-package.md` |
| `repair_handoff` | 从 run bundle 汇总失败命令和失败验收项，形成 AI IDE / Agent 交接包 | `.hardening/runs/<run-id>/repair-handoff-package.json`、`.hardening/runs/<run-id>/repair-handoff-package.md`、`.hardening/runs/<run-id>/verification-plan.md` |
| `repair_execute` | 对 repair handoff task 进行 dry-run 或 validation-only 复跑，记录执行证据 | `.hardening/runs/<run-id>/repair-execution-report.json`、`.hardening/runs/<run-id>/repair-execution-report.md` |
| `repair_patch_plan` | 将失败验证证据分类为可审查 patch actions | `.hardening/runs/<run-id>/patch-plan.json`、`.hardening/runs/<run-id>/patch-plan.md` |
| `bundle_artifacts` | 为 AI IDE / Agent 汇总本次 run 的报告、repair plan、task package、handoff、execution report、patch plan、JSON、截图和 generated tests | `.hardening/runs/<run-id>/manifest.json`、`.hardening/latest` |

## ADR cascade map

| ADR | Decision | Cascaded architecture surface |
| --- | --- | --- |
| [ADR-0001](../adr/0001-local-first-mcp-cli.md) | Local-first MCP and CLI | 本文件的系统定位、本地优先与隐私边界、CLI/MCP 分层；README 的本地优先产品说明和脱敏约束 |
| [ADR-0002](../adr/0002-shared-cli-mcp-core.md) | Shared core for CLI and MCP | CLI 与 MCP 共享 `src/tools/*`、`src/domain/*`、`@hardening-mcp/shared`、`@hardening-mcp/browser-explorer` 和 `@hardening-mcp/repair-planner`；README 的入口追踪说明 |
| [ADR-0003](../adr/0003-target-repo-hardening-artifacts.md) | Target repo hardening artifacts | `.hardening/runs/<run-id>/`、`.hardening/latest`、legacy paths、workspace output 和 manifest 消费规则 |
| [ADR-0004](../adr/0004-repair-plan-and-task-package.md) | Repair plan and executable task package | `repair-plan.json`、`repair-plan.md`、`repair-task-package.json`、`repair-task-package.md`、repair handoff、repair execution 和 patch plan 物料链路 |
| [ADR-0011](../adr/0011-private-github-engineering-baseline.md) | Private GitHub engineering baseline | `.github/workflows/ci.yml`、PR/issue templates、`pnpm repo:hygiene` 和 private pre-release merge boundary |
| [ADR-0012](../adr/0012-branch-protection-and-release-boundary.md) | Branch protection and release boundary | `docs/operations/branch-protection-release-boundary-v0.1.md`、public release checklist、PR release boundary confirmation 和 GitHub plan blocker |
| [ADR-0013](../adr/0013-codex-security-and-security-assurance-lane.md) | Codex Security and Security Assurance Lane | `specs/security-assurance-lane-spec-v0.1.md` defines future provider-backed security evidence import, security finding provenance, and repair-plan integration without repositioning RepoAssure as a generic vulnerability scanner |
| [ADR-0014](../adr/0014-distribution-and-repair-loop-readiness.md) | Distribution and repair loop readiness | `docs/product/specs/mvp-spec-v0.3.md` now records the implemented GitHub Action wrapper, AI IDE repair loop agent contracts, and public-release readiness boundary while preserving local-first and no-default-auto-fix constraints |
| [ADR-0015](../adr/0015-public-release-readiness-boundary.md) | Public release readiness boundary | Apache-2.0 `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, dependency-license audit, release notes draft, and `pnpm release:check` are readiness materials; public publication still requires manual authorization |

## Artifact 布局

`run_hardening` 会保留兼容路径，同时为每次运行创建 run-scoped bundle。AI IDE / Agent 应优先读取最新 manifest。

```text
<repo>/
  .hardening/
    latest -> runs/<run-id>
    runs/
      <run-id>/
        manifest.json
        hardening-report.md
        repo-profile.json
        boot-result.json
        app.log
        findings.json
        test-generation.json
        repair-plan.json
        repair-plan.md
        repair-task-package.json
        repair-task-package.md
        repair-handoff-package.json
        repair-handoff-package.md
        verification-plan.md
        repair-execution-report.json
        repair-execution-report.md
        patch-plan.json
        patch-plan.md
        patch.diff
        artifacts/
        generated-tests/
    run/
      repo-profile.json
      boot-result.json
      app.log
      findings.json
      test-generation.json
      repair-plan.json
      repair-plan.md
      repair-task-package.json
      repair-task-package.md
      patch.diff
    artifacts/
  hardening-report.md
  tests/
    hardening/
      generated-findings*.spec.ts
```

`manifest.json` 中的 `files` 指向 bundle 内的规范化物料，`legacyPaths` 指向原始兼容路径。人类可以继续打开 repo 根目录的 `hardening-report.md`；AI IDE 更适合从 `.hardening/latest/manifest.json` 开始读取，并优先消费 `files.repairPlan`、`files.repairTaskPackage`、repair handoff、repair execution report 和 patch plan。

多 repo 场景可传入 `workspaceOutputDir`，将多个 repo 的 run bundle 复制到同一个中央输出目录。

```text
<workspace-output>/
  manifest.json
  repos/
    <repo-slug>/
      latest -> runs/<run-id>
      runs/
        <run-id>/
          manifest.json
          hardening-report.md
          repo-profile.json
          boot-result.json
          findings.json
          test-generation.json
          repair-plan.json
          repair-plan.md
          repair-task-package.json
          repair-task-package.md
          repair-handoff-package.json
          repair-execution-report.json
          patch-plan.json
          patch.diff
          artifacts/
          generated-tests/
```

workspace 级 `manifest.json` 记录每个 repo 的 `repoSlug`、`repoRoot`、`latestRunId`、`latestRunDir` 和 `latestManifest`。这让 AI IDE 可以先读取一个 workspace manifest，再逐个进入各 repo 的最新 hardening 结果。

## 分层结构

```mermaid
flowchart TB
  U["User / Agent"] --> CLI["CLI"]
  U --> MCP["MCP Server"]
  CLI --> Tools["Tool Wrappers"]
  MCP --> Tools
  Tools --> Core["Core Modules"]
  Core --> Artifacts["Local Artifacts"]

  classDef entry fill:#fef3c7,stroke:#d97706,color:#111827
  classDef logic fill:#e0e7ff,stroke:#4f46e5,color:#111827
  classDef data fill:#dcfce7,stroke:#16a34a,color:#111827
  class CLI,MCP entry
  class Tools,Core logic
  class Artifacts data
```

| 层 | 目录 | 说明 |
| --- | --- | --- |
| CLI | `src/adapters/cli/` | 参数解析、stdout/stderr 输出、命令入口 |
| MCP | `src/adapters/mcp/` | stdio MCP Server、tool registry、boot session store |
| Tool Wrappers | `src/tools/` | 将核心能力封装成可调用工具，并写入 artifact |
| Domain | `src/domain/` | 分析、启动、测试生成、报告生成；explore 和 repair plan 旧路径保留为兼容 wrapper |
| Repair Planner | `@hardening-mcp/repair-planner` / `packages/repair-planner/` | repair plan 与 executable repair task package 实现；`src/domain/repair-plan/`、`dist/domain/repair-plan/` 和 `src/types/repair-plan.ts` / `dist/types/repair-plan.*` 保留兼容 wrapper/output |
| Browser Explorer | `@hardening-mcp/browser-explorer` / `packages/browser-explorer/` | fetch route exploration、Playwright browser exploration、安全交互、截图和 trace evidence 实现；`src/domain/explore/` 与 `dist/domain/explore/` 保留兼容 wrapper/output |
| Shared | `@hardening-mcp/shared` / `packages/shared/` | 脱敏、shell quoting、shell word parsing 等共享 helper；`src/shared/` 与 `dist/shared/` 保留兼容 wrapper/output |
| Security Assurance Lane | `@hardening-mcp/security-assurance` / `packages/security-assurance/` | 按 ADR-0013 和 `docs/architecture/specs/security-assurance-lane-spec-v0.1.md` 作为 provider-backed evidence lane；Phase 1 已支持本地 provider scan directory 导入、provider provenance 保留、security artifact 生成和 repair-plan integration，但不运行 scanner、不联网、不上传目标 repo，也不是当前 acceptance workflow 的替代或必需门槛 |
| Internal | `src/internal/` | acceptance、goal audit、benchmark 等项目治理工具 |
| Shared Types | `src/types/` | findings、repair plan 等共享契约 |
| Benchmark | `src/internal/benchmark/`、`scripts/run-benchmark.mjs` | benchmark 汇总与 `docs/logs/spike-results.md` 生成 |

## CLI 与 MCP 共享实现

CLI 和 MCP 不各自实现业务逻辑。它们都调用 `src/tools/*`，而 tool wrappers 再调用 `src/domain/*`、`@hardening-mcp/shared`、`@hardening-mcp/security-assurance`、`@hardening-mcp/browser-explorer` 和 `@hardening-mcp/repair-planner`；迁移窗口内的旧 `src/shared/*` import 会通过 wrapper 指向 `packages/shared/dist/*`，旧 `src/domain/explore/*` import 会通过 wrapper 指向 `packages/browser-explorer/dist/*`，旧 `src/domain/repair-plan/*` 与 `src/types/repair-plan.ts` import 会通过 wrapper 指向 `packages/repair-planner/dist/*`。

这样做的目的：

- 避免 CLI 与 MCP 行为分叉。
- 让测试可以直接覆盖核心逻辑、工具封装和协议层。
- 后续扩展 IDE skill、HTTP server 或其他 Agent runtime 时，可继续复用 tool wrappers。

## 本地优先与隐私边界

- 默认读取本地仓库和本地 artifact。
- 不上传代码、日志、截图、trace 或 env value。
- env 检测只记录 key hint，不读取或输出 secret value。
- benchmark 产物写入 `artifacts/benchmark-runs/`，该目录已加入 `.gitignore`、ESLint ignore 和 Vitest exclude；旧的 `benchmark-runs/` 继续被忽略，避免历史产物被扫描。
- 私有 GitHub CI 通过 `pnpm repo:hygiene` 检查已追踪文件，阻止 generated artifacts、build outputs、local hardening runs、env files、private keys 和 local logs 进入提交；完整规则见 `docs/architecture/specs/private-github-engineering-baseline-v0.1.md`。

## 进程生命周期

`run_hardening` / `hardening run` 内部自动管理 boot session：

```mermaid
flowchart LR
  S["start app"] --> R["run hardening flow"]
  R --> F["finally"]
  F --> X["stop app"]

  classDef lifecycle fill:#fce7f3,stroke:#db2777,color:#111827
  class S,R,F,X lifecycle
```

独立 MCP `boot_app` 会返回 `sessionId`。调用方必须使用 `stop_app` 清理该 session。

## 测试金字塔

| 层级 | 当前覆盖 |
| --- | --- |
| Unit | 分析器、启动解析、探索分类、测试生成、报告、repair plan、MCP registry、benchmark report |
| Integration | CLI、tool artifact、boot 子进程、MCP protocol、run 编排 |
| E2E | data URL 完整链路、可选真实 browser hardening run |
| Benchmark | 5 个本地半真实 repo，完整 `run --browser`，并实际执行 generated Playwright specs |
