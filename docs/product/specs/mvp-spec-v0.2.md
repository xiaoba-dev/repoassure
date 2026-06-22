# RepoAssure MVP 规格 v0.2

最后更新：2026年6月21日
状态：已实现；已追加 Executable Repair Task Package、Repair Handoff、Auto Repair Execution 和 Auto Patch Plan 原型增量，待真实项目新一轮用户验收
范围：v0.1 之后的下一阶段 MVP 增量

品牌决策：ADR-0010 已将产品品牌确定为 RepoAssure；`hardening-mcp` 暂时保留为当前内部 package、CLI 和 MCP 实现名称。

## TL;DR

v0.2 的核心目标是把 v0.1 产出的报告、findings、generated tests 和 run manifest，进一步转化为 AI IDE / Agent 可直接消费的结构化修复计划。

v0.1 回答“真实用户路径哪里会坏”；v0.2 回答“AI IDE 应按什么顺序、基于哪些证据、用哪些验证命令去修”。

授权增量：在 `repair-plan` 基础上增加 `repair-task-package.json` 和 `repair-task-package.md`，把每个 finding 或失败命令对应的修复任务进一步包装为可直接交给 AI IDE / Agent 执行的任务包。进一步增加 `repair:handoff`，从既有 run bundle 汇总生成 `repair-handoff-package.json`、`repair-handoff-package.md` 和 `verification-plan.md`。再增加 `repair:execute` 原型，支持 task selection、dry-run 和 validation-only，输出 `repair-execution-report.json` / `.md`。最后增加 `repair:patch-plan` 原型，把失败验证证据分类成 `patch-plan.json` / `.md`。当前原型不自动修改目标 repo 代码、不运行 formatter、不创建 PR。

## 产品定位

### 一句话定位

RepoAssure 是一个面向 AI IDE 的本地代码验收与交付保障层，将测试发现转化为可执行、可验证、可追踪的修复任务。

### v0.2 定位

v0.2 不是默认自动改代码的 Agent，也不是 SaaS 工作流。它是在 v0.1 本地 hardening run 之后，生成一份规范化 `repair-plan`，让 Cursor、Codex、Claude Code 或其他 AI IDE 能按任务粒度进行修复。

当前执行 goal：`docs/goals/completed/2026-06-20-repair-plan-v0.2.md`。

### 当前 repo 验收范围

ADR-0008 固化当前真实项目验收边界：v0.1 和当前 v0.2 repair-plan 增量的 `user:accept` browser acceptance flow 只覆盖可自动启动的 Web App repo，或已经通过 `--url` 提供运行地址的 Web App。Python CLI、Agent capability package、纯库、后端服务、移动端等非浏览器 UI repo 不会被静默降级到 browser flow。

`Panniantong/Agent-Reach` 这类只有 `pyproject.toml`、没有根目录 `package.json` 的 repo 是默认 browser acceptance 的范围外目标，应在 browser mode repo preflight 阶段生成结构化失败记录。当前已新增显式 Python/CLI acceptance mode：`--mode cli` 使用 `pyproject.toml`、Python/CLI profile、CLI smoke/static/test check execution results、report、manifest、repair plan 和 repair task package 作为验收证据；它不能通过放宽 Web App preflight 隐式触发。

## 背景

v0.1 已完成：

- 本地 repo 分析、应用启动、浏览器探索、findings 生成。
- Playwright 回归测试生成和验证。
- run-scoped artifact bundle：`.hardening/runs/<run-id>/manifest.json`。
- 可选 multi-repo workspace output。
- 真实项目 `rotifer-alpha/site` 用户验收闭环。

但 v0.1 的输出仍偏“诊断材料”。人类可以读报告并判断下一步，AI IDE 也可以读，但缺少稳定的任务契约。

v0.2 要补齐这个契约。

## 目标用户

| 用户 | v0.1 价值 | v0.2 新增价值 |
| --- | --- | --- |
| 独立开发者 | 知道应用哪里坏，并获得回归测试 | 一键交给 AI IDE 按任务修复 |
| AI 交付工作室 | 交付前获得质量报告和证据 | 将客户项目问题转成可追踪修复 backlog |
| AI IDE / Agent | 可读取报告、findings 和 generated tests | 可读取结构化 repair plan，减少上下文猜测 |

## 核心工作流

```mermaid
flowchart LR
  A["Run Bundle"] --> B["提取 Findings"]
  B --> C["归并根因"]
  C --> D["生成任务"]
  D --> E["排序优先级"]
  E --> F["写入 Repair Plan"]
  F --> G["AI IDE 执行修复"]
  G --> H["回放验证命令"]

  classDef input fill:#eef2ff,stroke:#4f46e5,color:#111827
  classDef process fill:#ecfeff,stroke:#0891b2,color:#111827
  classDef output fill:#dcfce7,stroke:#16a34a,color:#111827

  class A input
  class B,C,D,E process
  class F,G,H output
```

备用说明：

| 步骤 | 说明 |
| --- | --- |
| Run Bundle | 从 `.hardening/latest/manifest.json` 或 workspace manifest 读取本次运行物料 |
| 提取 Findings | 读取 `findings.json`、report、generated tests 和 browser artifacts |
| 归并根因 | 将重复网络错误、断路由、无效控件等合并成更少的修复任务 |
| 生成任务 | 为每个任务绑定证据、目标文件线索、验证命令和 Agent prompt |
| 排序优先级 | 按 P0/P1/P2、用户路径影响、可复现性和阻塞程度排序 |
| 写入 Repair Plan | 生成机器可读 JSON 和人类可读 Markdown |
| AI IDE 执行修复 | AI IDE 读取 repair plan，逐任务修改目标 repo |
| 回放验证命令 | 使用 generated Playwright spec、lint、build 或自定义命令验证修复 |

## P0 能力

| 能力 | 优先级 | 输出 |
| --- | --- | --- |
| `repair-plan.json` | P0 | AI IDE 可读任务清单 |
| `repair-plan.md` | P0 | 人类可读修复计划 |
| `repair-task-package.json` | P0 | AI IDE / Agent 可执行修复任务包 |
| `repair-task-package.md` | P0 | 人类可读任务交接包 |
| `repair-handoff-package.json` | P0 | 从 run bundle 生成的统一 AI IDE / Agent 修复交接包 |
| `verification-plan.md` | P0 | 修复后必须执行的验证命令和通过标准 |
| `repair-execution-report.json` | P0 | dry-run 或 validation-only 后的执行证据 |
| `patch-plan.json` | P0 | 失败验证证据分类后的可审查补丁动作计划 |
| manifest 集成 | P0 | run manifest 中引用 repair plan 路径 |
| CLI 入口 | P0 | `hardening plan <repo>` 或 `hardening run --repair-plan` |
| Repair handoff 入口 | P0 | `pnpm repair:handoff -- --run <run-dir>` |
| Repair execute 入口 | P0 | `pnpm repair:execute -- --package <package> --task <taskId> --dry-run|--validation-only` |
| Repair patch-plan 入口 | P0 | `pnpm repair:patch-plan -- --report <repair-execution-report.json>` |
| MCP 入口 | P0 | `generate_repair_plan` 或 `run_hardening` 可返回 repair plan |
| workspace 聚合 | P0 | multi-repo manifest 可引用每个 repo 的 latest repair plan |

## 非目标

v0.2 不默认包含：

- 自动修改代码并提交。
- 自动创建 GitHub PR。
- 云端执行和云端存储。
- 企业审批流、RBAC、SSO 或组织级治理。
- 安全审计、性能优化或合规证明的完整替代。
- 对非 Web 技术栈的全面支持。
- 对非 Web 技术栈的全面支持；当前只新增显式 Python/CLI acceptance mode 的最小验收闭环，不覆盖移动端、桌面端、智能合约、数据管道或完整 Agent tool invocation。

## Repair Plan 数据契约

`repair-plan.json` 应稳定、可版本化、可被 AI IDE 直接读取。

建议结构：

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-06-20T00:00:00.000Z",
  "runId": "run-2026-06-20T03-15-45-204Z",
  "repoRoot": "/path/to/repo",
  "sourceManifest": "/path/to/repo/.hardening/latest/manifest.json",
  "summary": {
    "totalTasks": 3,
    "p0": 0,
    "p1": 2,
    "p2": 1
  },
  "tasks": [
    {
      "taskId": "P1-network-api-skills-001",
      "severity": "P1",
      "status": "todo",
      "title": "修复 /api/skills 失败请求",
      "rootCauseHypothesis": "前端调用了不存在或未启动的 API 代理",
      "repairIntent": "为该路径补齐后端代理、mock fallback 或前端错误态处理",
      "findingIds": ["network-/api/skills-500"],
      "evidence": [
        {
          "type": "network",
          "path": "/path/to/repo/.hardening/latest/findings.json",
          "summary": "GET /api/skills 返回 500"
        }
      ],
      "targetAreas": [
        {
          "kind": "route",
          "value": "/arena"
        }
      ],
      "suggestedFiles": [],
      "verification": {
        "commands": [
          "npm run build",
          "npx playwright test tests/hardening/generated-findings.spec.ts --reporter=line"
        ],
        "generatedTests": [
          "tests/hardening/generated-findings.spec.ts"
        ]
      },
      "agentPrompt": "请基于 evidence 和 verification 修复该 P1 问题。保持最小改动，修复后运行 verification.commands。"
    }
  ]
}
```

## 任务生成规则

| 规则 | 要求 |
| --- | --- |
| 稳定 ID | 相同 run 内同类 finding 生成确定性 `taskId` |
| 优先级 | P0 阻塞启动和白屏；P1 用户路径失败；P2 可用性或质量建议 |
| 去重 | 同一路由、同一 API、同一控件的重复 finding 应合并 |
| 证据绑定 | 每个任务必须引用原始 finding、截图、trace 或 generated test 中至少一种证据 |
| 验证绑定 | 每个 P0/P1 任务必须包含至少一个可运行验证命令或明确说明验证阻塞 |
| 隐私 | 不写入 env value、token、cookie、授权头或用户输入敏感值 |
| Agent 可执行 | `repairIntent` 和 `agentPrompt` 必须具体到下一步行动，避免泛泛建议 |

## CLI / MCP 行为

### CLI

建议新增：

```bash
hardening plan <repo>
hardening run <repo> --repair-plan
```

行为：

- 默认从 `<repo>/.hardening/latest/manifest.json` 读取最新 run。
- 如果不存在 latest manifest，提示先运行 `hardening run`。
- 输出 `repair-plan.json`、`repair-plan.md`、`repair-task-package.json` 和 `repair-task-package.md` 到当前 run bundle。
- 保留兼容路径：`<repo>/.hardening/latest/repair-plan.json`。

### MCP

建议新增或扩展：

| Tool | 行为 |
| --- | --- |
| `generate_repair_plan` | 读取 run manifest，生成 repair plan |
| `run_hardening` | 可选 `generateRepairPlan: true`，在完整流程末尾生成 repair plan |

MCP 返回值应包含：

- `repairPlanPath`
- `repairPlanMarkdownPath`
- `repairTaskPackagePath`
- `repairTaskPackageMarkdownPath`
- `taskCount`
- `highestSeverity`
- `recommendedNextTaskId`

## Workspace 输出

multi-repo 模式下：

```text
<workspace-output>/
  manifest.json
  repair-plan.json
  repos/
    <repo-slug>/
      latest
      runs/
        <run-id>/
          manifest.json
          repair-plan.json
          repair-plan.md
          repair-task-package.json
          repair-task-package.md
```

workspace 级 `repair-plan.json` 应只做索引和汇总，不复制全部任务正文，避免文件过大。

## 验收标准

v0.2 完成必须满足：

| 类别 | 标准 |
| --- | --- |
| Schema | `repair-plan.json` 有版本号、runId、repoRoot、sourceManifest、summary 和 tasks |
| 任务质量 | P0/P1 findings 能生成可执行任务，且每个任务绑定证据和验证命令 |
| 稳定性 | 相同输入重复生成相同 taskId 和排序 |
| 集成 | run manifest 引用 repair plan；CLI 和 MCP 返回 repair plan 路径 |
| Workspace | 多 repo 输出能汇总每个 repo 的 latest repair plan |
| 隐私 | repair plan 不泄露 env value、cookie、token 或敏感 header |
| 测试 | 单元、集成和至少一个真实 repo 回归验收通过 |

## 测试策略

| 层级 | 覆盖重点 |
| --- | --- |
| Unit | taskId 生成、finding 归并、优先级排序、redaction、schema validation |
| Integration | run bundle 读取、repair plan 写入、manifest 更新、CLI/MCP 返回值 |
| E2E | fixture repo 完整 hardening run 后生成 repair plan |
| User Acceptance | 对 `rotifer-alpha/site` 生成 repair plan，并确认 AI IDE 可按任务读取 |

## 开发里程碑

| 阶段 | 内容 | 验证 |
| --- | --- | --- |
| Phase 1 | 定义 repair plan schema 和类型 | schema/unit tests |
| Phase 2 | 从 findings 生成任务 | task generation tests |
| Phase 3 | 写入 run bundle 和 manifest | integration tests |
| Phase 4 | 增加 CLI/MCP 入口 | CLI/MCP tests |
| Phase 5 | 支持 workspace 汇总 | multi-repo integration tests |
| Phase 6 | 真实 repo 验收 | `rotifer-alpha/site` acceptance |

## 风险与缓解

| 风险 | 影响 | 缓解 |
| --- | --- | --- |
| 任务过碎 | AI IDE 修复成本上升 | 按根因归并，限制默认任务数量 |
| 任务过大 | 修复不可控 | 每个任务只覆盖一个主要根因或用户路径 |
| suggestedFiles 不准确 | 误导 Agent | v0.2 可先留空或标为低置信度 |
| prompt 过度命令式 | Agent 可能大改 | 明确“最小改动”和验证命令 |
| findings 噪声 | 生成低价值任务 | 只默认输出 P0/P1，P2 可折叠 |

## v0.2 之后

如果 v0.2 验证成功，下一阶段可以进入：

- `apply_repair_plan`：在用户授权下逐任务生成补丁。
- GitHub PR mode：把 repair plan 转成 issues 或 PR checklist。
- CI mode：每次 PR 自动生成 hardening report 和 repair plan。
- Team mode：多 repo 历史趋势和修复闭环追踪。
