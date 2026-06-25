# 测试策略

## 原则

项目采用 TDD 和测试金字塔：

```text
        E2E Tests
     Integration Tests
        Unit Tests
```

## 层级

| 层级 | 用途 | 初始目标 |
| --- | --- | --- |
| Unit | 纯函数、检测器、解析器、评分逻辑 | 最多 |
| Integration | CLI、artifact 写入、工具链路、子进程边界 | 适量 |
| E2E | 完整 hardening run、示例 repo | 最少但关键 |

Browser exploration 的单元测试覆盖截图 artifact、trace artifact、runtime signals、storageState context、基础点击、submit 语义、高风险动作跳过、非敏感表单字段填充、敏感字段跳过，以及 browser finding evidence 写入前脱敏。

Report generation 的单元和集成测试覆盖 readiness score、issue counts、Markdown report、带 `HARDENING_BASE_URL` 的 generated test verification command、敏感值脱敏，以及非空 `patch.diff`。`patch.diff` 当前验证 remediation plan、generated test diffs 和 diff 内容脱敏，不验证自动业务代码修复。

v0.3 distribution and repair loop readiness 的测试必须覆盖 GitHub Action wrapper 结构、local CLI invocation、默认不上传私有 artifact、repair task package / repair handoff / validation-only / patch plan 的 agent-consumption contract，以及 public-release readiness checks。任何未来 auto-fix、PR creation 或 hosted artifact storage 行为都必须先有 ADR，再进入测试策略。

monorepo readiness 的测试使用 unit / structure 层守护，不新增 runtime integration 或 E2E：`project-structure.test.ts` 必须验证 readiness audit 文档存在、v0.3 goal 明确依赖该 audit、`packages/core` 仍是延期抽取项、`apps/cli` 与 `apps/mcp-server` 可继续作为 compatibility shells、`examples/` 与 GitHub Action wrapper 被归入 v0.3 分发缺口，以及 decision/dev logs 已记录排序原因。

隐私脱敏单元测试覆盖 API key、service role、password、private key、Authorization/Proxy-Authorization credential、quoted Authorization/Proxy-Authorization object-literal credential、quoted Cookie/Set-Cookie object value、quoted object key/value 中的 API key、access token、client secret、session token、standalone provider API key、standalone repository/deployment token、standalone cloud provider access key、standalone JWT-looking token、JWT、CSRF、Cookie header、Set-Cookie header、URL userinfo credential、signed URL credential/signature query 参数、URL query 敏感参数和 URL fragment 敏感参数等常见敏感值；CLI options 测试覆盖成功 stdout JSON 和 stderr 错误输出写入前会脱敏；MCP registry 测试覆盖 tool 成功响应和错误响应进入 `content` 与 `structuredContent` 前会脱敏，同时覆盖 `sessionId` 在成功 `structuredContent` 中保留以支持 `stop_app`；MCP fatal error 测试覆盖进程级启动失败写入 stderr 前会脱敏；acceptance fatal error 测试覆盖验收 runner 进程级 fatal stderr 写入前会脱敏；benchmark fatal error 测试覆盖 benchmark runner 进程级 fatal stderr 写入前会脱敏；browser exploration 测试覆盖 console/page error、failed request 和 interaction evidence 进入 findings 前会脱敏，`visitedRoutes` 与 `interactions` 返回给 CLI/MCP 前也会脱敏；run hardening 集成测试覆盖 already-running URL 写入 `boot-result.json` 前会脱敏；boot tool 单元测试覆盖 auto-boot 可序列化结果的 URL、日志路径、blockers 和 errors 写入 artifact 或返回给 MCP 前会脱敏；报告层测试覆盖 boot errors、应用 URL、verification command、finding repro/evidence 以及 generated test diff 内容进入 `hardening-report.md` 和 `patch.diff` 前都会经过脱敏；acceptance report 测试覆盖 `docs/acceptance/acceptance-run.md` 的报告路径、命令和说明列写入前会脱敏；benchmark report 测试覆盖 `docs/logs/spike-results.md` 的运行目录、repo 报告路径和失败原因写入前会脱敏；goal audit 测试覆盖 `docs/acceptance/goal-completion-audit.md` 的分类标题、要求、证据和下一步写入前会脱敏；user acceptance 测试覆盖验收命令、摘要路径、异常摘要、artifact 检查证据、generated spec 验证 evidence/失败摘要和用户备注写入验收记录前会脱敏；generated spec 测试覆盖 route query/fragment 中的 signed URL credential/signature 参数脱敏。

Generated tests 的路径提取优先使用 `reproSteps` 中的显式页面导航；普通 repro 描述、finding evidence 和 smoke route 中的完整 URL 只接受本地 app URL 或当前被测 app 同源 URL 作为兜底，本地 app URL 包括 `localhost`、`127.0.0.1`、`0.0.0.0`、`[::1]`、`[::]`，避免第三方 API、CDN 或外部资源 URL 被误生成成本地页面 smoke/regression test。生成 spec 前会保留非敏感 query/fragment 参数与 SPA hash route，并脱敏 token、code、session、CSRF 等敏感 query/fragment 参数值；finding title 进入 generated test title 前也会经过敏感值脱敏。

## 初始命令

```text
pnpm test:unit
pnpm vitest run tests/integration/analyze-tool.test.ts tests/integration/cli-analyze.test.ts tests/integration/generate-tests-tool.test.ts tests/integration/harden-report-tool.test.ts tests/integration/cli-generated-artifacts.test.ts tests/integration/explore-tool.test.ts tests/integration/cli-run.test.ts tests/integration/run-hardening-tool.test.ts
pnpm test:e2e
pnpm typecheck
pnpm lint
pnpm build
node dist/adapters/cli/index.js analyze --help
node dist/adapters/cli/index.js explore --help
node dist/adapters/cli/index.js generate-tests --help
node dist/adapters/cli/index.js plan --help
node dist/adapters/cli/index.js report --help
node dist/adapters/cli/index.js run --help
node dist/adapters/cli/index.js run -h
pnpm acceptance
pnpm acceptance -- --help
pnpm acceptance -- -h
pnpm goal:audit
pnpm user:accept -- --repo <real-web-app-repo> --browser --decision pending
pnpm user:accept -- --repo <real-web-app-repo> --browser --validate-generated-tests --decision pending
pnpm user:accept -- --repo <real-web-app-repo> --url <running-url> --browser --validate-generated-tests --generated-test-timeout-ms 240000 --decision pending
pnpm user:accept -- --help
pnpm user:accept -- -h
```

## 当前环境说明

默认沙箱中，本地监听测试会触发 `listen EPERM`。因此当前稳定门禁为：

```text
pnpm test:unit
pnpm vitest run tests/integration/analyze-tool.test.ts tests/integration/cli-analyze.test.ts tests/integration/generate-tests-tool.test.ts tests/integration/harden-report-tool.test.ts tests/integration/cli-generated-artifacts.test.ts tests/integration/explore-tool.test.ts tests/integration/cli-run.test.ts tests/integration/run-hardening-tool.test.ts
pnpm test:e2e
pnpm typecheck
pnpm lint
pnpm build
node dist/adapters/cli/index.js analyze --help
node dist/adapters/cli/index.js explore --help
node dist/adapters/cli/index.js generate-tests --help
node dist/adapters/cli/index.js plan --help
node dist/adapters/cli/index.js report --help
node dist/adapters/cli/index.js run --help
node dist/adapters/cli/index.js run -h
pnpm acceptance
pnpm acceptance -- --help
pnpm acceptance -- -h
pnpm goal:audit
pnpm user:accept -- --repo <real-web-app-repo> --browser --decision pending
pnpm user:accept -- --repo <real-web-app-repo> --browser --validate-generated-tests --decision pending
pnpm user:accept -- --repo <real-web-app-repo> --url <running-url> --browser --validate-generated-tests --generated-test-timeout-ms 240000 --decision pending
pnpm user:accept -- --help
pnpm user:accept -- -h
```

完整 `pnpm test:integration`、MCP 纵向链路和真实 `pnpm test:e2e` 需要本地监听权限与浏览器运行条件。

`artifacts/benchmark-runs/**` 是当前 benchmark 产物目录，旧的 `benchmark-runs/**` 仍从 Vitest 扫描中排除，避免生成的 Playwright specs 被 Vitest 当作自身测试执行。

## 可选真实浏览器 E2E

在允许启动本地 server 和 Chromium 的环境中运行：

```text
HARDENING_E2E_BROWSER=1 pnpm vitest run tests/e2e/run-browser.e2e.test.ts
```

该测试会启动 fixture app，执行 `hardening run <repo> --browser`，验证截图 artifact、交互 findings 和报告。

## Benchmark

```text
pnpm build
pnpm benchmark
```

Benchmark 会运行 `fixtures/benchmark/*` 下的 5 个本地半真实 repo，生成 `docs/logs/spike-results.md`，并将每个 repo 的运行产物写入 `artifacts/benchmark-runs/`。

当前 benchmark 还会为每个 repo 重启 fixture app，并实际执行生成的 `tests/hardening/*.spec.ts`，验证 findings 回归测试和已探索关键路径 smoke tests 不只是落盘，而是可由 Playwright runner 执行。

## 验收入口

```text
pnpm acceptance
pnpm acceptance -- --help
pnpm acceptance -- -h
pnpm acceptance -- --full
pnpm acceptance -- --full --browser
```

`pnpm acceptance -- --help` 和 `pnpm acceptance -- -h` 会输出验收门禁参数说明，不运行检查。`pnpm acceptance` 汇总快速本地门禁、关键文档和产物检查，并写入 `docs/acceptance/acceptance-run.md`。`--full` 额外运行完整 integration tests 与 benchmark；`--browser` 额外运行真实 Chromium trace E2E。

`pnpm goal:audit` 生成 `docs/acceptance/goal-completion-audit.md`，用于审计 `docs/goals/codex-goal.md` 的显式成功条件是否都有当前证据。该命令只证明自动可验证范围，不把用户确认自动判定为完成；`accepted` 必须包含真实项目通过记录、可验证 artifact、匹配的验收命令、具体确认备注和 generated Playwright spec 执行验证通过证据才会被判定为完成，`changes_requested` 必须包含真实项目通过记录、可验证 artifact、匹配的验收命令和具体用户备注，随后会被归类为继续迭代输入。

CLI 子命令帮助入口属于低成本回归项。`node dist/adapters/cli/index.js <command> --help` 和 `node dist/adapters/cli/index.js <command> -h` 应返回对应命令 Usage，并且不触发 repo 分析、浏览器探索或 artifact 写入；帮助文本应自描述 `--help, -h`。

`pnpm user:accept` 是真实项目验收入口。该命令不属于默认本地门禁，因为它需要用户提供真实 Web App repo，且通常需要本地 server 与 Chromium 权限。`pnpm user:accept -- --help` 和 `pnpm user:accept -- -h` 可直接输出参数说明，不要求提供 repo。runner 会先校验 `--repo` 是已存在目录且包含文件型 `package.json`；无效路径或缺失 `package.json` 会生成结构化失败记录并返回非零退出码，不进入 hardening flow。若 hardening flow 发生非预期异常，runner 同样写入结构化失败记录，摘要路径、异常摘要、artifact 检查证据和用户备注会先经过敏感信息脱敏。

`--validate-generated-tests` 会执行 generated Playwright spec。未提供 `--url` 时，`pnpm user:accept` 会保持自动 boot 的应用运行到 generated spec 验证结束；如果目标应用已由用户或 CI 启动，则可通过 `--url <running-url>` 复用现有服务。验证阶段复用 client URL 归一化规则，将 `0.0.0.0` 和 `[::]` 转换为 loopback URL，避免探索阶段与 generated spec 验证阶段访问不同地址。慢登录或复杂真实项目可用 `--generated-test-timeout-ms <ms>` 覆盖默认 120000ms 验证超时。
