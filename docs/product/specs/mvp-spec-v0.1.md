# hardening-mcp MVP 规格 v0.1

最后更新：2026年6月18日
状态：草案
范围：MVP

## TL;DR

`hardening-mcp` 是一个面向 AI IDE 用户的本地优先代码硬化 MCP Server。它通过启动应用、模拟真实用户路径、发现故障、生成 Playwright 回归测试，并产出可执行的补丁 diff，帮助独立开发者和 AI 交付工作室将 vibe coding 生成的现代 Web 应用推进到生产级质量。

## 产品定位

### 一句话定位

一个 MCP-native 的代码硬化层，用于将 AI 生成的 Web 应用转化为生产级软件。

### MVP 定位

对于 Cursor、Codex、Claude Code 以及类似 AI IDE 的用户，`hardening-mcp` 在本地针对现代 Web 应用仓库运行，并回答一个实际问题：

> 真实用户路径会不会在上线前出问题？

该 MVP 不是 SaaS 平台，不是企业治理产品，也不是完整的软件保障套件。它是一个聚焦于 AI 生成 Web 应用上线就绪硬化的本地工具。

## 目标用户

| 用户 | 核心痛点 | MVP 价值 |
| --- | --- | --- |
| 独立开发者 | AI 生成的应用可以运行，但上线风险不清楚 | 发现真实用户会遇到的故障，并生成回归测试 |
| AI 交付工作室 | 需要交付大量 AI 生成的客户项目，并提供质量背书 | 在交付前产出可重复的报告、测试和修复指导 |

## 支持的技术栈

MVP 从现代 Web 应用开始：

- Next.js
- React
- Vite
- Node.js 项目
- npm、pnpm 和 yarn

v0.1 不支持：

- Python
- Rails
- Java
- Go
- .NET
- 移动应用
- 桌面应用
- 智能合约
- 纯基础设施仓库

## 入口

| 入口 | 优先级 | 用途 |
| --- | --- | --- |
| MCP Server | P0 | AI IDE 工作流的主入口 |
| CLI | P0 | 调试、本地运行以及非 MCP 场景 |
| GitHub App | 后续 | 团队和 CI 工作流 |
| SaaS Dashboard | 后续 | 组织级报告和治理 |

## 核心工作流

```mermaid
flowchart LR
  A["AI IDE"] --> B["hardening-mcp"]
  B --> C["分析 Repo"]
  C --> D["启动应用"]
  D --> E["探索路径"]
  E --> F["发现故障"]
  F --> G["生成测试"]
  G --> H["补丁 Diff"]
  H --> I["硬化报告"]

  classDef entry fill:#eef2ff,stroke:#4f46e5,color:#111827
  classDef engine fill:#ecfeff,stroke:#0891b2,color:#111827
  classDef output fill:#dcfce7,stroke:#16a34a,color:#111827

  class A,B entry
  class C,D,E,F,G,H engine
  class I output
```

备用说明：

| 步骤 | 说明 |
| --- | --- |
| 分析 Repo | 识别框架、包管理器、脚本、可能的应用入口点以及现有测试配置 |
| 启动应用 | 安装或复用依赖，启动 dev server，检测本地端口并验证健康状态 |
| 探索路径 | 使用 Playwright 浏览页面、点击控件、填写表单并捕获运行时信号 |
| 发现故障 | 检测白屏、断路由、无效控件、表单失败、console 错误和网络失败 |
| 生成测试 | 将可复现故障或关键路径转换为 Playwright 测试规格 |
| 补丁 Diff | 产出可人工审查的补丁 diff 或精确修复指导 |
| 硬化报告 | 写入证据、复现步骤、严重级别、测试和就绪度评分 |

## P0 MCP Tools

| Tool | 用途 | 输出 |
| --- | --- | --- |
| `analyze_repo` | 识别框架、包管理器、脚本、应用结构和测试配置 | Repo profile 和建议命令 |
| `boot_app` | 在本地启动应用并验证是否可访问 | Server URL、日志、健康状态、启动失败信息 |
| `explore_app` | 使用 Playwright 探索页面和交互 | 已发现路由、交互、截图、console 和网络发现项 |
| `generate_tests` | 为关键路径和可复现故障生成 Playwright 回归测试 | `tests/hardening/*.spec.ts` |
| `harden_report` | 产出最终报告和修复指导 | `hardening-report.md`、就绪度评分、补丁 diff |

## P0 硬化定义

MVP 聚焦用户路径可靠性，而不是广泛的架构清理。

P0 检查项：

- 应用可以在本地启动。
- 首页和主要已发现路由不会白屏。
- 链接和导航不会指向明显损坏的路由。
- 按钮和表单没有明显失效。
- 严重 console 错误被捕获。
- 失败的网络请求、4xx 响应和 5xx 响应被捕获。
- 至少可以为一个关键路径或故障生成一条可复现的 Playwright 测试。
- 报告包含清晰的复现步骤，以及补丁 diff 或可执行的修复指导。

## 用户提供的路径

MVP 支持两类路径来源：

| 路径来源 | 优先级 | 示例 |
| --- | --- | --- |
| 自动探索 | P0 | 发现页面、链接、按钮、表单和常见流程 |
| 自然语言关键路径 | P0 | “测试登录、创建项目并发送一条聊天消息” |

v0.1 不支持：

- 强制要求 `hardening.yaml`
- 用户录制测试路径 UI
- 完整产品分析数据导入

## 输出物

每次运行都应产出：

- `hardening-report.md`
- `tests/hardening/*.spec.ts`
- 补丁 diff 或精确修复指导
- 就绪度评分
- 复现步骤
- 可用时提供截图或 Playwright trace 证据
- 问题严重级别：P0、P1、P2

## 就绪度评分

就绪度评分有价值，但应作为辅助信息。它应支撑报告，而不是替代证据。

初始评分维度：

| 维度 | 权重 | 说明 |
| --- | ---: | --- |
| 启动健康度 | 25 | 应用可以启动并提供可访问页面 |
| 路由健康度 | 20 | 首页和已发现路由不会出现致命渲染失败 |
| 交互健康度 | 20 | 按钮、表单和导航在已测试路径上可用 |
| 运行时错误健康度 | 15 | 严重 console 和网络故障不存在或已解释 |
| 可测试性 | 20 | 可复现的 Playwright 测试已生成且可运行 |

## 明确非目标

MVP v0.1 不包含：

- SaaS dashboard
- 云端执行
- 代码上传
- 企业 SSO、RBAC、审计日志或管理控制台
- 金融、医疗、政府或军用合规 profile
- 自动创建 GitHub PR
- 深度架构重构
- 完整安全审计
- 性能优化平台
- 超出现代 Web 应用之外的多语言技术栈支持
- 移动端测试自动化

## 本地优先原则

MVP 默认在本地运行。

理由：

- 用户仓库可能包含敏感代码。
- 环境变量和本地数据库具有敏感性。
- AI 生成的应用通常依赖仅存在于本地的配置。
- 本地执行更容易在首批用户群体中建立信任。

只有在本地工作流被证明可靠之后，才考虑云端和团队执行能力。

## 2 周技术 Spike 成功标准

| 指标 | 目标 |
| --- | --- |
| 真实 repo 跑通率 | 5 个 vibe-coded repo 中至少 3 个完成完整流程 |
| Bug 发现能力 | 每个完成流程的 repo 至少发现 2 个真实问题 |
| 测试生成能力 | 每个完成流程的 repo 至少生成 1 条可运行 Playwright 测试 |
| 报告有用性 | 用户认为报告可执行，而不是泛泛建议 |
| 首份报告耗时 | 15 分钟内产出首份报告 |

## Benchmark Repos

使用五个真实或接近真实的 vibe-coded repo：

| Repo 类型 | 原因 |
| --- | --- |
| 带 auth 的 Next.js landing page | 常见的 AI 生成上线应用 |
| CRUD dashboard | 常见的内部工具和客户交付形态 |
| AI chat app | 常见的 AI 产品原型 |
| Payment 或 checkout mock app | 高风险用户路径 |
| Supabase 或 Firebase app | 常见的后端即服务依赖 |

## 风险

| 风险 | 影响 | 缓解措施 |
| --- | --- | --- |
| 应用启动不一致 | 高 | 从狭窄的技术栈识别和清晰日志开始 |
| 缺失 env vars 阻塞执行 | 高 | 检测缺失环境变量，并清晰报告配置阻塞项 |
| Playwright 探索产生噪声 | 中 | 限制范围、对发现项排序，优先可复现故障 |
| 生成的测试不稳定 | 中 | 使用稳定 locator、trace，并仅在合理场景使用 retry |
| 补丁 diff 质量较低 | 高 | 保持 diff 可人工审查，MVP 阶段绝不自动提交 |
| 用户期待完整代码清理 | 中 | 将定位保持在上线就绪硬化 |

## 未来产品方向

MVP 是进入更大产品方向的切入点：

| 阶段 | 定位 | 能力 |
| --- | --- | --- |
| MVP | AI IDE Code Hardening MCP Server | 面向现代 Web 应用的本地上线就绪检查 |
| V1 | 生产级硬化工具 | GitHub 集成、CI mode、更好的补丁、持久化项目历史 |
| V2 | Enterprise-ready 硬化平台 | 团队策略、审计日志、RBAC、SSO、私有部署 |
| V3 | Regulated-ready 软件保障 | 合规证据、审批工作流、敏感数据策略检查 |
| V4 | Mission-critical 保障层 | 离线部署、供应链安全、强隔离、高级来源追踪 |

## v0.1 之后的开放决策

- 产品名称和 package name。
- CLI 应作为 MCP tools 的轻量封装，还是一等入口。
- Playwright 应该内置、作为 peer dependency 安装，还是注入到目标 repo。
- 如何在不进行不安全自动修改的前提下表示补丁 diff。
- V1 是否引入轻量级 `hardening.config.*` 文件。

