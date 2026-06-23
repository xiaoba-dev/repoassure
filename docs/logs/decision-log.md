# 决策日志

## 2026年6月23日 - browser-explorer package 抽取

### 决策

执行 Phase 2e browser-explorer package 抽取：`packages/browser-explorer/src` 成为 fetch route exploration、Playwright browser exploration、安全交互、截图和 trace evidence 的实现所有者，根 package 通过 `@hardening-mcp/browser-explorer` workspace dependency 引用该包。`src/domain/explore/*` 与 `dist/domain/explore/*` 保留为兼容 wrapper/output，不在本阶段迁移 core 或新增 exploration strategy。

### 原因

- browser explorer 是 RepoAssure 模拟用户操作和 Agent 操作的关键能力，长期需要独立演进。
- explorer 当前边界清晰：上层 tool 通过 `exploreApp` 和 `createPlaywrightBrowserDriver` 消费能力，适合在 core 之前抽成 package。
- `findings.json`、截图、trace、visited routes 和 interactions 是现有 artifact schema 的关键部分，必须先通过 TDD 锁定 package exports、legacy wrappers、dist outputs 和行为 parity。

### 影响

- 新增 `@hardening-mcp/browser-explorer` 包，导出 root、`compatibility`、`explore-app` 和 `playwright-driver` 子路径。
- 根构建脚本改为先 `build:shared`，再 `build:browser-explorer`、`build:repair-planner`、`build:acceptance`，最后 `build:src`。
- README、架构概览、monorepo spec、ADR-0006、dev log 和 goal audit 已级联写入 browser-explorer package ownership 与兼容路径边界。

## 2026年6月23日 - repair-planner package 抽取

### 决策

执行 Phase 2d repair-planner package 抽取：`packages/repair-planner/src` 成为 repair plan 和 executable repair task package 的实现所有者，根 package 通过 `@hardening-mcp/repair-planner` workspace dependency 引用该包。`src/domain/repair-plan/*`、`dist/domain/repair-plan/*`、`src/types/repair-plan.ts` 和 `dist/types/repair-plan.*` 保留为兼容 wrapper/output，不在本阶段迁移 core 或 browser explorer。

### 原因

- repair planner 已经有清晰边界：上层 tool 只调用 `generateRepairPlan`，schema/types 集中在 repair plan 契约。
- `repair-plan.json`、`repair-task-package.json` 和对应 Markdown 是 AI IDE 消费的核心物料，抽包必须先通过行为 parity、package exports、type-smoke 和 legacy dist output 测试锁定。
- acceptance 与 shared 已经证明 compatibility-first package build strategy 可行，repair-planner 是下一步低耦合抽取对象。

### 影响

- 新增 `@hardening-mcp/repair-planner` 包，导出 root、`compatibility`、`generate-repair-plan` 和 `repair-plan` 子路径。
- 根构建脚本改为先 `build:shared`，再 `build:repair-planner`、`build:acceptance`，最后 `build:src`。
- README、架构概览、monorepo spec、ADR-0006、dev log 和 goal audit 已级联写入 repair-planner package ownership 与兼容路径边界。

## 2026年6月23日 - shared package 抽取

### 决策

执行 Phase 2c shared package 抽取：`packages/shared/src` 成为脱敏、shell quoting 和 shell word parsing 的实现所有者，根 package 通过 `@hardening-mcp/shared` workspace dependency 引用该包。`src/shared/*` 与 `dist/shared/*` 保留为兼容 wrapper/output，不在本阶段迁移 core、browser explorer 或 repair planner。

### 原因

- shared 工具被 CLI、MCP、domain、internal 和 acceptance 多处复用，继续由 root `src/shared` 承载会阻塞后续 package 边界清晰化。
- `dist/shared/*` 是既有 build 输出面，必须先通过 TDD 锁定兼容 wrapper、package exports、类型解析和构建顺序。
- shared 的边界小于 core/browser/repair，适合作为 acceptance package 之后的第二个可控抽取。

### 影响

- 新增 `@hardening-mcp/shared` 包，导出 root、`compatibility`、`privacy-redaction`、`shell-quote` 和 `shell-words` 子路径。
- 根构建脚本改为先 `build:shared`，再 `build:acceptance`，最后 `build:src`。
- README、架构概览、monorepo spec 和 ADR-0006 已级联写入 shared package ownership 与兼容路径边界。

## 2026年6月22日 - 分支保护与发布边界

### 决策

新增 `ADR-0012: Branch Protection and Release Boundary`，将 `main` 分支保护和 private release boundary 固化为仓库 operations 要求。目标状态是要求 `RepoAssure CI` / `Quality Gates` 作为 required status check；在 GitHub plan 不支持 private repo branch protection / rulesets 时，记录 blocker，不允许通过公开仓库绕过限制。

### 原因

- CI 已经通过，但如果 `main` 不受保护，CI 只能提示问题，不能阻止低质量变更进入主分支。
- 当前项目仍处于 private pre-release 阶段，不能添加仓库级 `LICENSE`、发布 package、移除 `package.json` `"private": true` 或公开仓库。
- GitHub API 对 private repo branch protection 和 rulesets 返回 HTTP 403，需要把这个外部限制记录为治理 blocker。

### 影响

- 新增 `docs/operations/branch-protection-release-boundary-v0.1.md`，记录目标保护状态、当前 403 阻塞和手动解除步骤。
- `docs/product/strategy/public-release-checklist-v0.1.md` 增加 main branch protection / equivalent ruleset 检查项。
- PR 模板增加 release boundary 确认项。

## 2026年6月22日 - 私有 GitHub 工程基线

### 决策

新增 `ADR-0011: Private GitHub Engineering Baseline`，将 RepoAssure 私有仓库的协作和自动化基线固化为 GitHub Actions CI、PR 模板、Issue 模板和 `pnpm repo:hygiene` 已追踪文件检查。

### 原因

- 私有仓库已经完成首次推送，后续功能开发需要可重复的 PR 和 CI 质量门禁。
- generated artifacts、build outputs、local hardening runs、env files、private keys 和 local logs 不能依赖人工记忆避免提交。
- `pnpm goal:audit` 能验证自动证据，但不能替代用户人工验收；该边界需要在 PR 和 CI 文档中明确。

### 影响

- 新增 `.github/workflows/ci.yml`，在 PR 和 `main` push 上运行 `pnpm repo:hygiene`、unit、typecheck、lint、build 和 `pnpm goal:audit`。
- 新增 `.github/pull_request_template.md` 与 `.github/ISSUE_TEMPLATE/`，规范 private pre-release backlog 和 PR 审查材料。
- 新增 `docs/architecture/specs/private-github-engineering-baseline-v0.1.md` 作为工程基线操作说明。

## 2026年6月22日 - RepoAssure 品牌定位

### 决策

新增 `ADR-0010: RepoAssure Brand Positioning`，将产品品牌正式确定为 RepoAssure。`hardening-mcp` 暂时保留为当前内部 package、CLI 和 MCP 实现名称；private GitHub repo 优先使用 `repoassure`。

### 原因

- 竞品调研显示 `VibeProof`、`AgentProof`、`CodeGate`、`AgentGate`、`CodeAsure` 和 `VibeCheck` 等相邻命名已经被活跃产品或开源项目占用。
- RepoAssure 更准确表达 repo-level acceptance、repair evidence 和 delivery assurance，不会被限制为 MCP server、安全扫描器、agent 监控或 checklist 工具。
- 品牌需要能覆盖当前 Web/Python CLI acceptance，以及未来 Team Cloud 和 Enterprise/on-prem 场景。

### 影响

- 新增 `docs/product/research/competitive-landscape-v0.1.md` 作为后续开发、定位和命名参考。
- README、MVP spec、commercialization strategy 和 private repo readiness 已级联写入 RepoAssure 品牌。
- 后续 public release 前仍需执行商标、域名、GitHub、npm 和法律 review。

## 2026年6月22日 - ADR 级联对齐

### 决策

将 ADR-0001 至 ADR-0004 的早期架构决策显式级联到 `docs/architecture/overview.md` 和 README，补齐 local-first CLI/MCP、shared CLI/MCP core、target repo hardening artifacts、repair plan/task package 的交叉引用和当前物料链说明。将 ADR-0009 的商业化 follow-up 级联为 `docs/product/strategy/` 下的三个草案文档：commercialization strategy、public release checklist 和 open-core packaging spec。

### 原因

- 早期 ADR 的实现和语义已经存在，但文档中的显式 ADR 追踪偏弱。
- 架构说明中的 artifact layout 已落后于当前 repair handoff、repair execution 和 patch plan 能力。
- ADR-0009 的 follow-up 需要从自然语言待办沉淀成可追踪文档路径，但不应提前发布 license 或改变当前 private package 状态。

### 影响

- `docs/architecture/overview.md` 增加 ADR cascade map 和当前 artifact flow。
- `docs/architecture/specs/docs-taxonomy-spec-v0.1.md` 增加 `docs/product/strategy/` 文档类别。
- 后续商业化、公开发布和 open-core 边界讨论应优先更新 `docs/product/strategy/*`，再视需要修订 ADR-0009。

## 2026年6月22日 - 商业化与 License 策略

### 决策

新增 `ADR-0009: Commercialization and Licensing Strategy`，将当前产品定位为 AI 代码质量与交付保障层，而不是另一个 AI IDE。未来公开发布时，开源核心目标采用 Apache-2.0，商业化采用 open-core 模式：CLI、MCP、artifact schema、本地验收、repair plan、patch plan 等保留在 open core；Hosted dashboard、多 repo 历史、组织策略、SSO/RBAC、审计留存、高级规则包、行业模板和企业私有化作为商业产品面。

### 原因

- 当前产品的核心价值是把 AI 生成代码转化为可验收、可修复、可交付的工程资产。
- AI IDE 生态已经拥挤，直接竞争会削弱差异化；作为验收与修复证据层更适合与 Cursor、Codex、Claude Code、GitHub Copilot 等工具集成。
- Apache-2.0 有利于开发者和企业采用，并提供专利授权；AGPL、BSL、FSL、SSPL 等限制性协议暂不适合当前需要扩大生态的阶段。
- 商业价值应集中在团队协作、组织治理、合规审计、企业部署和高级规则质量，而不是限制本地核心能力。

### 影响

- 公开发布前必须补充仓库级 `LICENSE` 文件，并评估是否移除 `package.json` 的 `"private": true`。
- 后续 hosted / enterprise 能力需要先定义 public/private module boundary，避免商业功能反向污染 open-core artifact contract。
- 数十个自有 AI 项目应成为内部质量基础设施的第一批使用场景，用真实验收物料反哺产品路线和推广案例。

## 2026年6月18日 - 默认实现栈

### 决策

使用 TypeScript + Node.js 作为 `hardening-mcp` 的默认实现栈。

### 原因

- 目标用户和 MVP 技术栈集中在 Next.js、React、Vite 和 Node.js。
- CLI、MCP Server、Playwright 和前端项目分析都与 Node.js 生态天然适配。
- TypeScript 能提供更稳定的工具契约和重构边界。

### 影响

- 第一阶段优先实现 Node.js repo 分析能力。
- Python、Go、Java 等非 Web 技术栈暂不进入 MVP。

## 2026年6月18日 - 测试和 CLI 结构

### 决策

将 CLI 参数解析逻辑放入 `src/adapters/cli/run.ts`，入口文件 `src/adapters/cli/index.ts` 只负责绑定真实 stdout/stderr 和 exit code。

### 原因

- 便于在集成测试中稳定覆盖 CLI 行为。
- 避免 `tsx` 子进程在当前沙箱中创建 IPC pipe 时触发权限错误。
- 保持 CLI 与未来 MCP tools 共享核心实现。

### 影响

- 集成测试直接调用 `runCli`，覆盖参数解析、stdout、stderr 和 artifact 写入。
- 后续真实 CLI smoke test 可在 build 后使用 `node dist/adapters/cli/index.js` 执行。

## 2026年6月18日 - 依赖安装策略

### 决策

初始阶段只安装 TypeScript、Vitest、tsx、ESLint、Node 类型和 TypeScript ESLint 相关依赖。

### 原因

- 控制依赖面和安装成本。
- `analyze_repo` 不需要 Playwright 或 MCP SDK。
- Playwright 和 MCP SDK 等较重依赖应在进入对应阶段时再引入。

### 影响

- Phase 1 能保持轻量、可快速验证。
- Phase 3 前再引入 Playwright。
- Phase 6 前再引入 MCP SDK。

## 2026年6月18日 - explore_app 分阶段实现

### 决策

先交付基于 `fetch` 的轻量路由探索，再进入 Playwright 版本。

### 原因

- 轻量实现可先验证 finding schema、artifact 写入、CLI 输出、测试生成和报告链路。
- 当前沙箱对本地监听和浏览器类测试存在权限限制，过早接入 Playwright 会放大环境噪声。
- 分阶段实现能保持 TDD 步长小，并让 `run` 编排尽早形成可测试闭环。

### 影响

- `explore_app` 当前能发现基本 HTTP 层问题，但不能代表最终 MVP 的真实人类/Agent 操作模拟能力。
- 下一阶段必须替换或增强为 Playwright 驱动，补齐点击、表单、控制台错误、截图、trace 和 E2E 验证。

## 2026年6月18日 - Playwright 作为默认浏览器自动化底座

### 决策

使用 Playwright 作为 MVP 的默认浏览器自动化依赖，并通过可注入 driver 保持核心逻辑可测试。

### 原因

- Playwright 能覆盖 Chromium 浏览器访问、截图、控制台错误、网络失败、交互和 trace。
- 与目标 Web 技术栈和生成 Playwright 回归测试的产品闭环一致。
- 可注入 driver 允许单元/集成测试使用 fake driver，避免每次测试都依赖真实浏览器环境。

### 影响

- `playwright` 进入运行依赖。
- CLI 增加 `--browser` 模式；默认无 flag 时仍保留轻量 fetch 探索路径。
- 后续 E2E 需要浏览器二进制和本地监听权限。

## 2026年6月18日 - run 命令支持外部 URL 与自动 boot 双模式

### 决策

`hardening run` 同时支持 `run <repo> <url>` 和 `run <repo>`。

### 原因

- 外部 URL 模式便于用户或 Agent 复用已经启动的开发服务器，验证成本低。
- 自动 boot 模式更接近最终产品体验，可由工具自己分析 repo、启动应用、探索、生成测试和报告。
- 双模式能在受限环境中继续测试核心编排，同时保留完整本地运行能力。

### 影响

- `url` 在 `runHardeningTool` 中变为可选。
- 自动 boot 必须保证进程清理，当前通过 `finally -> stop()` 实现。
- 后续需要改进 boot 失败报告，避免失败时缺少最终 hardening report。

## 2026年6月18日 - MCP Server 采用 Registry + SDK 薄绑定

### 决策

将 hardening 工具实现为独立 registry，再通过官方 MCP SDK 暴露为 stdio server。

### 原因

- Registry 可直接单元测试，不依赖 MCP transport。
- SDK 绑定层保持很薄，只处理 `tools/list` 和 `tools/call`。
- 这种结构便于未来同时服务 CLI、MCP、IDE skill 或其他 Agent runtime。

### 影响

- `@modelcontextprotocol/sdk` 进入运行依赖。
- `hardening-mcp` 可作为 MCP stdio server bin 使用。
- 后续需要补 session 管理，尤其是独立 `boot_app` 的进程生命周期。

## 2026年6月18日 - 独立 boot_app 必须配套 stop_app

### 决策

MCP Server 暴露 `boot_app` 时同时暴露 `stop_app`。

### 原因

- `boot_app` 会创建长期进程；没有停止入口会导致资源泄漏。
- Agent/IDE 可能按 tool-by-tool 方式调用，而不是只调用 run-scoped flow。
- `run_hardening` 内部仍使用 `finally` 自动清理，`stop_app` 主要服务独立 `boot_app` 调用。

### 影响

- MCP tool 列表包含 `stop_app`。
- `boot_app` 返回 `sessionId`。
- 后续可以扩展 `list_sessions` 或 server shutdown 自动清理。

## 2026年6月18日 - Benchmark 产物目录排除出 Vitest 扫描

### 决策

`benchmark-runs/**` 作为本地 benchmark 输出目录加入 `.gitignore`、ESLint ignore 和 Vitest exclude。

### 原因

- Benchmark 会在临时 repo 中生成 `tests/hardening/*.spec.ts`。
- 这些文件是被测项目的 Playwright 测试，不是 hardening-mcp 自身的 Vitest 测试。
- 如果不排除，聚合 `pnpm test` 会扫描 benchmark 产物并错误尝试用 Vitest 执行 Playwright spec。

### 影响

- `pnpm test` 只运行 hardening-mcp 自身测试。
- Benchmark 产物仍保留在 `benchmark-runs/`，用于人工检查和结果复现。

## 2026年6月18日 - Generated Playwright Test 标题强制唯一

### 决策

生成的 Playwright test title 使用序号前缀，例如 `1. P1 console_error: ...`。

### 原因

- 同一页面可能产生多个相同类型和标题的 finding。
- Playwright 不允许同一文件内出现重复 test title。
- Benchmark 验证 generated specs 时暴露了重复标题导致 runner 失败的问题。

### 影响

- generated spec 更稳定，可直接执行。
- 报告标题仍保留 severity、type 和原始 finding title。

## 2026年6月18日 - Goal 审计不替代用户验收

### 决策

新增 `pnpm goal:audit` 作为自动证据审计入口，但不允许它把“用户确认 MVP 符合预期”自动判为完成。

### 原因

- `docs/goals/codex-goal.md` 的 Success Definition 明确要求用户确认 MVP 符合预期，或明确列出剩余修改项。
- 自动测试、benchmark 和文档检查只能证明工程准备状态，不能证明真实用户项目上的主观验收结论。
- 保守审计能避免因为本地 fixture 全绿而过早标记长期 goal complete。

### 影响

- `docs/acceptance/goal-completion-audit.md` 可以显示“已准备好请求用户验收”。
- 长期 goal 仍保持 active，直到用户提供真实项目验收结论或明确确认 MVP 通过。
- 后续若真实项目验收失败，失败项进入 `docs/logs/dev-log.md` 或 `docs/logs/blockers.md`，再继续迭代。

## 2026年6月18日 - 真实项目验收记录采用显式用户结论

### 决策

新增 `pnpm user:accept`，但验收记录默认 `decision=pending`。只有用户显式传入 `--decision accepted` 时，`pnpm goal:audit` 才能将用户验收项判定为已通过。

### 原因

- 真实项目 hardening flow 通过只能证明工具运行和 artifact 生成成功。
- `docs/goals/codex-goal.md` 要求的是用户确认 MVP 符合预期，这需要明确的人类结论。
- 将运行状态和用户结论拆开，可以避免自动脚本伪造验收。

### 影响

- `docs/acceptance/user-acceptance-record.md` 成为最终用户验收证据入口。
- 用户可以先用 `--decision pending` 运行检查，再在人工确认后用 `--decision accepted` 覆盖记录。
- 如果用户要求修改，用 `--decision changes_requested` 记录，后续继续迭代。

## 2026年6月18日 - 生成测试同时覆盖故障与关键路径

### 决策

`run_hardening` 在生成 Playwright specs 时，将 `explore_app` 实际访问过的 routes 作为 smoke routes 传入 `generate_tests`。生成器会先为 findings 生成回归测试，再为尚未被 finding 覆盖的已探索关键路径生成 smoke tests。

### 原因

- MVP 规格要求“故障或关键路径可以转换为 Playwright 测试”。
- 只从 findings 生成测试会漏掉“关键路径无明显故障但仍应持续守护”的场景。
- 使用 `explore_app` 的 `visitedRoutes` 比重新解析 CLI/MCP 参数更可靠，能覆盖明确 path、URL 和自然语言 critical path 展开的结果。

### 影响

- 生成的 `tests/hardening/*.spec.ts` 同时包含故障复现测试和关键路径 smoke tests。
- 生成器基于 path 去重，避免同一路由同时因 finding 和 smoke route 重复生成。
- Benchmark 和 `--validate-generated-tests` 会实际执行这些生成测试。

## 2026年6月19日 - Accepted 验收必须验证 generated spec

### 决策

`pnpm user:accept -- --decision accepted` 必须同时传入 `--validate-generated-tests` 和具体 `--notes`。`pnpm goal:audit` 只有在 accepted 验收记录包含 generated Playwright spec 执行验证通过证据时，才把用户验收项判定为完成。

### 原因

- MVP 的用户验收重点包括生成的 Playwright spec 是否可在真实项目上执行或给出明确失败证据。
- 只生成 spec 不能证明它能在真实项目环境中回放。
- accepted 是最终完成证据，应比 pending 检查更严格，避免用户在未验证 generated spec 的情况下误标完成。

### 影响

- 用户可以先用 `--decision pending` 运行快速真实项目检查。
- 最终 accepted 命令使用 `--validate-generated-tests --decision accepted --notes "用户确认 MVP 符合预期"`。
- 需要登录态或慢启动的项目应配合 `--url`、`--storage-state` 或 `--generated-test-timeout-ms` 完成验证。

## 2026年6月19日 - 未知框架不推荐纯编译 watch 脚本

### 决策

当 `analyze_repo` 无法识别 Web 框架时，不再把 `tsc --watch`、`tsup --watch` 等纯编译或构建类脚本推荐为 Web App start command。若 repo 只有这类脚本或明显 CLI 入口，则 `recommendedStartCommand` 返回 `null`，并记录 `No Web App start script detected` blocker。

### 原因

- `rotifer-protocol/rotifer-playground` 是 CLI/tooling repo，`dev` 脚本为 `tsc --watch`，不会输出可访问的本地 Web URL。
- 将纯编译 watch 误当成 dev server 会让 `boot_app` 等待 URL 超时，并让用户误以为是应用启动慢或浏览器问题。
- MVP 面向现代 Web App repo；非 Web repo 应清晰报告不适用，而不是伪造启动建议。

### 影响

- Vite、Next.js、React 等已识别 Web 框架的脚本推荐行为不变。
- 简单 `node server.mjs` 这类明确 server fixture 仍可通过显式 `--start-command` 或 boot tool 运行。
- 真实项目验收会更早暴露“该 repo 不是可自动 hardening 的 Web App”这一事实。

## 2026年6月19日 - Generated spec 验证使用平台自带 Playwright 依赖

### 决策

`pnpm user:accept -- --validate-generated-tests` 在执行目标 repo 下的 generated Playwright spec 时，由 hardening 平台临时提供 `@playwright/test` 解析入口，验证结束后清理，不要求被测 repo 预先安装 Playwright。

### 原因

- 真实 Web App repo 可能没有 `@playwright/test` 依赖；MVP 目标是“拿来即测”，不能把测试依赖安装作为隐性前提。
- Node ESM bare import 不可靠地支持 `NODE_PATH`，`rotifer-alpha/site` 验收时暴露了 generated spec 无法解析 `@playwright/test` 的问题。
- 验证依赖应归属于 hardening 平台；被测 repo 只承载生成的回归 spec 和 hardening artifacts。

### 影响

- generated spec 仍保持标准 `import { test, expect } from '@playwright/test';` 形式，便于用户后续纳入项目自己的测试体系。
- 验收验证阶段会在 generated spec 目录下短暂创建 `node_modules/@playwright/test` symlink，并在验证完成后删除。
- 如果用户希望长期保留这些测试，只需在目标项目中正式安装 Playwright 依赖或按项目规范迁移测试文件。

## 2026年6月19日 - Run-scoped artifact bundle 成为 AI IDE 首选入口

### 决策

`run_hardening` 在保留原有兼容路径的同时，为每次运行创建 `.hardening/runs/<run-id>/` 物料包，并将 `.hardening/latest` 指向最新运行。AI IDE / Agent 应优先读取 `.hardening/latest/manifest.json`。

### 原因

- 旧布局分散在 repo 根目录、`.hardening/run`、`.hardening/artifacts` 和 `tests/hardening`，人类可读但不利于 Agent 稳定集成。
- run-scoped bundle 能避免多次运行混淆，并让每次测试的报告、JSON、截图和 generated tests 形成可归档单元。
- 保留 legacy paths 可以兼容已有 CLI、MCP、测试和用户习惯。

### 影响

- 新增 `.hardening/runs/<run-id>/manifest.json`，其中 `files` 指向 bundle 内规范化物料，`legacyPaths` 指向旧路径。
- `.hardening/latest` 是最新 run 的稳定入口。
- 目标项目仍会保留根目录 `hardening-report.md` 和 `tests/hardening/*.spec.ts`，方便人工查看和纳入项目 CI。

## 2026年6月20日 - 多 repo workspace output 作为可选聚合层

### 决策

在单 repo `.hardening` 输出之外，`run_hardening` 新增可选 `workspaceOutputDir`，CLI 对应 `--workspace-output <dir>`。传入后，每个 repo 的 run bundle 会复制到同一个中央输出目录的 `repos/<repo-slug>/runs/<run-id>/` 下，并维护 workspace 级 `manifest.json`。

### 原因

- 单 repo 输出适合本地项目自包含，但 AI IDE 工作区可能同时管理多个 repo。
- 中央输出目录让 IDE 只需读取一个 workspace manifest，就能发现每个 repo 的最新 hardening 结果。
- 该能力必须保持可选，避免默认把用户项目输出搬离 repo，也避免破坏现有 CI 和人工查看路径。

### 影响

- 默认行为不变：不传 `workspaceOutputDir` 时，只写目标 repo 的 `.hardening`。
- 多 repo 模式下，中央 `manifest.json` 记录每个 repo 的 `repoSlug`、`repoRoot`、`latestRunId`、`latestRunDir` 和 `latestManifest`。
- CLI、MCP 和核心 `runHardeningTool` 都支持该参数。

## 2026年6月20日 - 验收审计解析 Playwright 命令结构

### 决策

`pnpm goal:audit` 判定 generated Playwright spec 执行验证证据时，解析 shell words，确认存在 `HARDENING_BASE_URL=` 环境变量，并确认 Playwright 可执行文件后跟 `test` 子命令；不再依赖固定字符串 `playwright test`。

### 原因

- 真实验收命令可能使用平台自带 Playwright 绝对路径，例如 `'/Users/.../node_modules/.bin/playwright' test`。
- 路径包含空格时，命令生成器会自动加引号；固定字符串匹配会把有效证据误判为无效。
- 审计规则应验证命令结构和关键约束，而不是验证某一种显示格式。

### 影响

- accepted 用户验收记录可以正确支持带引号的 Playwright executable path。
- 仍要求 generated spec 验证使用 `HARDENING_BASE_URL=`，避免把普通命令误判为真实回放验证。
- 单元测试覆盖 quoted executable、单引号 notes 和新鲜度校验组合。

## 2026年6月20日 - 结构治理采用分阶段迁移

### 决策

项目文件夹结构优化采用分阶段迁移：先治理顶层运行产物，再整理 `docs/` 分层，最后调整 `src/` 边界。每个阶段都必须更新路径测试和质量门禁，不进行一次性大规模搬迁。

### 原因

- 当前 README、goal audit、acceptance runner、benchmark runner 和测试中存在大量硬编码路径。
- 直接移动 `docs/` 或 `src/` 会同时破坏文档证据、默认输出路径、package bin、测试 imports 和审计规则。
- 运行产物治理风险最低，可以优先降低根目录噪声，并为后续迁移建立路径兼容模式。

### 影响

- 新增 `docs/goals/codex-goal-structure-refactor.md` 作为结构治理的执行契约。
- 后续迁移必须先保证旧证据可追溯，再更新默认路径。
- v0.2 `repair-plan` 实现应在结构治理完成后进入，避免继续堆叠到旧目录结构。

## 2026年6月20日 - v0.2 先做结构化 Repair Plan，不自动改代码

### 决策

v0.2 的核心能力是生成 `repair-plan.json` 和 `repair-plan.md`，并把它们接入 CLI、MCP、run bundle、workspace bundle 和验收材料。系统不会默认修改目标 repo 业务代码，也不会自动创建 PR。

### 原因

- v0.1 已能发现问题、生成报告和回归测试，但 AI IDE 仍缺少稳定的任务契约。
- 结构化 repair plan 能让 Cursor、Codex、Claude Code 等 Agent 明确读取 severity、evidence、repairIntent、verification 和 agentPrompt，减少上下文猜测。
- 自动改代码会显著扩大风险面；应等 repair plan 的任务质量和验收闭环稳定后再进入 v0.3。

### 影响

- `run_hardening` 默认生成 repair plan。
- 新增 CLI `hardening plan <repo>` 和 MCP `generate_repair_plan`。
- `.hardening/latest/manifest.json` 的 `files.repairPlan` 成为 AI IDE 修复任务首选入口。
- 用户验收必须检查 `repair-plan.json` 和 `repair-plan.md`。
