# hardening-mcp Codex Goal

最后更新：2026年6月23日
状态：已完成，真实项目用户验收已通过
适用范围：长期自动开发目标
关联文档：

- `docs/product/specs/mvp-spec-v0.1.md`
- `docs/product/specs/mvp-spec-v0.2.md`
- `docs/architecture/spikes/technical-spike-plan-v0.1.md`
- `docs/product/research/user-interview-script-v0.1.md`

## Goal Objective

以全自动、TDD 驱动、测试金字塔约束的软件工程流程，开发 `hardening-mcp` 项目，直至完成 MVP、通过质量门禁，并获得用户验收。

目标产品是一个本地优先的 Code Hardening MCP Server + CLI，面向 Cursor、Codex、Claude Code 等 AI IDE 用户，支持现代 Web App 仓库的上线就绪硬化：

```text
analyze_repo -> boot_app -> explore_app -> generate_tests -> harden_report
```

最终交付应包含：

- 可运行的 MCP Server
- 可运行的 CLI
- P0 tools：`analyze_repo`、`boot_app`、`explore_app`、`generate_tests`、`harden_report`
- 单元测试、集成测试、端到端测试
- 本地 artifact 输出
- 项目 README 和使用文档
- 开发日志、阻塞日志、决策日志、验收记录
- 用户验收所需的演示命令和验收清单

## Authorization

用户授权 Codex 在本工作区内全自动执行项目开发，包括：

- 创建和修改项目文件
- 创建和维护文档
- 设计架构
- 编写代码
- 编写测试
- 运行本地测试、lint、typecheck、build 和 demo 命令
- 根据测试失败自动修复
- 根据质量门禁自动重构
- 在不破坏用户数据的前提下清理自身产生的临时文件

仍必须遵守系统和运行环境权限规则：

- 不执行破坏性命令，除非用户明确要求或审批。
- 不重置、覆盖或删除用户未授权的已有工作。
- 网络安装、外部服务访问、工作区外写入或需要提权的命令，按 Codex 环境审批机制执行。
- 不上传用户代码、密钥、环境变量或私有数据。
- 无法自行解决且连续尝试后仍失败的问题，必须记录到日志文档，并在必要时请求用户决策。

## Success Definition

项目完成必须同时满足以下条件：

| 类别 | 通过标准 |
| --- | --- |
| 功能 | P0 tools 全部可通过 CLI 和 MCP 层调用 |
| 工作流 | 可完成 `analyze_repo -> boot_app -> explore_app -> generate_tests -> harden_report` |
| 测试 | 单元、集成、E2E 测试全部通过 |
| 质量 | lint、typecheck、build 全部通过 |
| 文档 | README、使用说明、架构说明、验收说明完整 |
| 日志 | 开发日志、阻塞日志、决策日志持续更新 |
| 安全 | 不硬编码密钥，不上传代码，不泄露 env |
| 验收 | 用户确认 MVP 符合预期，或明确列出剩余修改项 |

## Development Principles

### 1. TDD 必须优先

所有核心功能遵循 Red-Green-Refactor：

1. Red：先写失败测试，明确预期行为。
2. Green：实现最小代码让测试通过。
3. Refactor：在测试保护下整理结构、命名和边界。

禁止在没有测试保护的情况下大规模实现核心逻辑。

例外：

- 初始项目脚手架。
- 类型定义和配置文件。
- 文档。
- 必须先探测第三方库行为的小 spike。

例外必须记录在 `docs/logs/dev-log.md`。

### 2. 测试金字塔

测试投入遵循金字塔结构：

```text
        E2E Tests
     Integration Tests
        Unit Tests
```

目标比例：

| 层级 | 目标 | 说明 |
| --- | --- | --- |
| Unit | 最多 | 纯函数、解析器、检测器、评分逻辑、命令推断 |
| Integration | 适量 | CLI 调用、工具链路、文件 artifact、子进程边界 |
| E2E | 最少但关键 | 完整 hardening run、示例 repo、Playwright smoke path |

覆盖目标：

| 模块 | 目标 |
| --- | --- |
| 纯函数和检测器 | 90%+ |
| CLI 和 tool orchestration | 80%+ |
| artifact/report 生成 | 80%+ |
| browser exploration | 核心路径覆盖，不追求行覆盖率 |
| E2E | 覆盖完整 MVP 主链路 |

不追求机械式 100% 覆盖率。测试应优先覆盖高风险路径和回归风险。

### 3. 小步提交式开发

虽然当前工作区未必是 git repo，但开发节奏按小步提交组织：

1. 一次只实现一个垂直切片或明确模块。
2. 每个切片都有测试。
3. 每个切片完成后运行相关质量门禁。
4. 每个切片更新开发日志。

### 4. 可观测性和可复现性

所有工具都必须产出可复现信息：

- 输入参数
- 推断依据
- 运行日志路径
- artifact 路径
- 错误和 blocker
- 复现步骤

不要只返回“失败”。必须解释失败在哪里、证据是什么、下一步如何处理。

### 5. Local-first 和隐私优先

默认所有执行都在本地完成：

- 不上传代码。
- 不上传日志。
- 不上传 screenshots/traces。
- 不读取或输出敏感 env 值。
- 报告中只写 env key 名，不写 env value。

## Token Control Policy

在保证代码质量的前提下，必须精准控制 token 消耗。

执行规则：

| 场景 | 控制策略 |
| --- | --- |
| 阅读文件 | 优先 `rg`、`sed -n`、`wc -l`，避免反复整文件读取 |
| 理解代码 | 先读目录结构和入口文件，再读相关模块 |
| 修改代码 | 小范围 patch，避免无关重构 |
| 写测试 | 聚焦当前切片，不一次性生成大量低价值测试 |
| 调试失败 | 先读错误摘要，再读相关日志片段 |
| 汇报进度 | 简短说明当前阶段、结果和下一步，不重复粘贴长日志 |
| 上下文管理 | 关键决策写入文档，减少对对话历史的依赖 |

禁止：

- 反复读取已经读过且未变化的大文件。
- 为了“全面”而扫描无关目录。
- 生成大段无用解释。
- 在没有失败证据时进行猜测式大改。
- 为低风险代码写过量测试。

每个阶段应优先使用局部上下文和项目文档作为长期记忆。

## Required Documents

开发过程中必须维护以下文档：

| 文档 | 用途 |
| --- | --- |
| `docs/logs/dev-log.md` | 开发日志：阶段、完成内容、测试结果、下一步 |
| `docs/logs/blockers.md` | 阻塞日志：无法解决的问题、尝试记录、所需决策 |
| `docs/logs/decision-log.md` | 技术决策日志：架构、依赖、测试策略、权衡 |
| `docs/testing/strategy/test-strategy-v0.1.md` | 测试策略：金字塔结构、命令、覆盖范围 |
| `docs/acceptance/checklists/acceptance-checklist-v0.1.md` | 用户验收清单 |
| `docs/logs/spike-results.md` | Spike 或 benchmark 结果 |

日志要求：

- 每完成一个阶段更新 `docs/logs/dev-log.md`。
- 遇到无法解决的问题，立即记录到 `docs/logs/blockers.md`。
- 任何会影响架构或长期维护的选择，记录到 `docs/logs/decision-log.md`。
- 不把隐藏推理写入文档，只记录可验证事实、决策和结果。

## Quality Gates

每个实现阶段必须运行与当前变更相关的质量门禁。

最低门禁：

```text
typecheck
lint
unit tests
integration tests
build
```

涉及浏览器或完整链路时，增加：

```text
e2e tests
sample hardening run
artifact inspection
```

涉及安全敏感内容时，增加：

```text
secret scan by code review
env handling review
dependency risk review
```

如果某个门禁暂时无法运行，必须：

1. 记录原因。
2. 记录替代验证方式。
3. 记录后续补跑条件。

## Proposed Implementation Stack

默认技术栈：

| 层 | 选择 |
| --- | --- |
| Runtime | Node.js |
| Language | TypeScript |
| Package manager | pnpm，若环境不支持则 npm |
| Unit test | Vitest |
| Integration test | Vitest + temp fixtures |
| E2E | Playwright |
| CLI | Node executable |
| MCP | TypeScript MCP server |
| Validation | Zod 或轻量 schema 校验 |

如果实际环境不适合以上选择，可以调整，但必须记录到 `docs/logs/decision-log.md`。

## Target Project Structure

建议项目结构：

```text
src/
  cli/
  core/
    analyze/
    boot/
    explore/
    report/
    tests/
  mcp/
  tools/
  types/
  utils/
tests/
  unit/
  integration/
  e2e/
fixtures/
docs/
```

## Development Phases

### Phase 0：项目初始化

目标：

- 创建 TypeScript 项目骨架。
- 配置测试、lint、typecheck、build。
- 创建必要日志文档。
- 确认 CLI 基础入口。

完成标准：

- `package.json` 存在。
- `src/`、`tests/`、`docs/` 结构存在。
- 基础测试可运行。
- `docs/logs/dev-log.md` 记录初始化结果。

### Phase 1：实现 `analyze_repo`

TDD 顺序：

1. 编写 package manager 检测测试。
2. 编写 framework 检测测试。
3. 编写 scripts 解析测试。
4. 编写 env hints 检测测试。
5. 实现最小代码。
6. 接入 CLI：`hardening analyze <repo>`.

完成标准：

- 能识别 Next.js、Vite、React、unknown。
- 能识别 npm、pnpm、yarn、unknown。
- 能输出 `recommendedStartCommand`。
- 能写入 `.hardening/run/repo-profile.json`。
- 单元测试和集成测试通过。

### Phase 2：实现 `boot_app`

TDD 顺序：

1. 测试启动命令构造。
2. 测试端口解析和探测。
3. 测试超时和失败日志。
4. 测试缺失 env blocker 输出。
5. 实现子进程启动和健康检查。

完成标准：

- 能启动 fixture app。
- 能检测 URL 和端口。
- 能写入 `.hardening/run/app.log`。
- 能清晰报告 blocked/failed/running。

### Phase 3：实现 `explore_app`

TDD 顺序：

1. 测试 route queue 和去重逻辑。
2. 测试 console/network finding 归类。
3. 测试 destructive action guardrails。
4. 添加 Playwright 集成测试。

完成标准：

- 能访问首页和发现路由。
- 能捕获 console error。
- 能捕获 4xx/5xx 或 failed request。
- 能生成 screenshots 或 trace artifacts。
- 不点击明显破坏性动作。

### Phase 4：实现 `generate_tests`

TDD 顺序：

1. 测试 finding 到 Playwright spec 的转换。
2. 测试 smoke spec 生成。
3. 测试不覆盖现有测试。
4. 测试生成测试可运行。

完成标准：

- 能写入 `tests/hardening/*.spec.ts`。
- 至少生成一个可运行 smoke test。
- 生成内容稳定、可读、可人工修改。

### Phase 5：实现 `harden_report`

TDD 顺序：

1. 测试 score 计算。
2. 测试 severity 汇总。
3. 测试 Markdown 报告生成。
4. 测试 artifact 链接和复现步骤。

完成标准：

- 能写入 `hardening-report.md`。
- 报告包含证据、复现步骤、严重级别、测试信息和修复指导。
- 就绪度评分有明确依据。

### Phase 6：MCP Server 集成

目标：

- 将核心能力暴露为 MCP tools。
- CLI 和 MCP 共享同一核心实现。
- 工具输入输出符合 `docs/architecture/spikes/technical-spike-plan-v0.1.md`。

完成标准：

- P0 tools 可由 MCP 层调用。
- 输入输出经过 schema 校验。
- 错误返回结构稳定。

### Phase 7：完整链路与 benchmark

目标：

- 执行完整 hardening run。
- 使用 fixture repo 和真实/半真实 benchmark repo 验证。
- 生成 `docs/logs/spike-results.md`。

完成标准：

- 至少 3/5 个 benchmark repo 完成完整流程，或清晰记录无法完成原因。
- 每个完成流程的 repo 至少产出 1 条可运行 Playwright 测试。
- 报告在 15 分钟内产出。

### Phase 8：用户验收准备

目标：

- 准备演示命令。
- 更新 README。
- 创建验收清单。
- 修复验收前发现的问题。

完成标准：

- `docs/acceptance/checklists/acceptance-checklist-v0.1.md` 完整。
- 用户可以按 README 运行 demo。
- 所有质量门禁通过。
- 等待用户验收。

## Blocker Handling

遇到无法解决的问题时，必须记录到 `docs/logs/blockers.md`，格式如下：

```markdown
## [日期] [阻塞标题]

### 背景

### 影响

### 已尝试方案
1.
2.
3.

### 当前判断

### 需要的用户决策或外部条件

### 临时绕过方案
```

只有当同一阻塞条件连续出现至少三次、且无法继续取得有意义进展时，才将长期 Goal 标记为 blocked。

## User Acceptance

用户验收前必须提供：

- 安装步骤
- CLI 使用示例
- MCP 配置示例
- 示例 repo 运行流程
- 生成的报告样例
- 测试命令和结果
- 已知限制
- 未解决 blocker 列表

验收清单至少包含：

```markdown
- [ ] 可以安装依赖
- [ ] 可以运行 typecheck
- [ ] 可以运行 lint
- [ ] 可以运行 unit tests
- [ ] 可以运行 integration tests
- [ ] 可以运行 e2e tests
- [ ] 可以执行 `hardening analyze`
- [ ] 可以执行完整 `hardening run`
- [ ] 可以生成 `hardening-report.md`
- [ ] 可以生成 `tests/hardening/*.spec.ts`
- [ ] MCP tools 可用
- [ ] 文档足够用户独立试用
```

## Operating Loop

每个自动开发循环遵循：

```text
读取当前目标
  -> 选择最小可交付切片
  -> 写失败测试
  -> 实现最小代码
  -> 运行相关测试
  -> 修复失败
  -> 重构
  -> 运行质量门禁
  -> 更新日志
  -> 判断继续/停止/请求验收
```

## Stop Conditions

Codex 应继续自动执行，直到出现以下情况之一：

| 停止条件 | 动作 |
| --- | --- |
| MVP 全部完成并通过质量门禁 | 请求用户验收 |
| 用户明确要求暂停或停止 | 停止执行并总结状态 |
| 同一阻塞连续出现至少三次 | 记录 blocker 并标记 blocked |
| 需要违反权限或安全边界才能继续 | 请求用户授权或调整方案 |
| 发现 MVP 规格存在根本矛盾 | 记录决策点并请求用户确认 |

## Final Deliverable

最终交付时，必须输出：

- 完成内容摘要
- 关键文件路径
- 运行过的验证命令
- 测试结果
- 已知限制
- 阻塞或未完成项
- 用户验收入口

不得声称完成未验证的能力。
