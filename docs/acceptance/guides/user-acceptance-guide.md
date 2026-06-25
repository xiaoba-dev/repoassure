# 用户验收指南

本文档用于验收 `hardening-mcp` MVP。验收前请先阅读 `README.md`，并确认本机具备 Node.js 22+、pnpm 和 Playwright Chromium。

## 1. 安装与构建

```bash
pnpm install
pnpm build
```

验收标准：

- `pnpm install` 成功。
- `pnpm build` 成功。
- `dist/adapters/cli/index.js` 和 `dist/adapters/mcp/index.js` 存在。

## 2. 质量门禁

```bash
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm typecheck
pnpm lint
pnpm build
```

也可以使用单一验收入口生成 `docs/acceptance/acceptance-run.md`：

```bash
pnpm acceptance
pnpm acceptance -- --help
pnpm acceptance -- -h
pnpm acceptance -- --full
pnpm acceptance -- --full --browser
pnpm goal:audit
pnpm user:accept -- --help
pnpm user:accept -- -h
pnpm user:accept -- --repo <real-web-app-repo> --browser --decision pending
pnpm user:accept -- --repo <real-web-app-repo> --browser --validate-generated-tests --decision pending
pnpm user:accept -- --repo <real-web-app-repo> --url <running-url> --browser --validate-generated-tests --generated-test-timeout-ms 240000 --decision pending
pnpm user:accept -- --mode cli --repo <python-cli-repo> --decision pending
pnpm repair:handoff -- --run <repo>/.hardening/runs/<run-id>
pnpm repair:execute -- --package <repo>/.hardening/runs/<run-id>/repair-handoff-package.json --task <taskId> --dry-run
pnpm repair:execute -- --package <repo>/.hardening/runs/<run-id>/repair-handoff-package.json --task <taskId> --validation-only
pnpm repair:patch-plan -- --report <repo>/.hardening/runs/<run-id>/repair-execution-report.json
```

验收模式：

| 模式 | 覆盖范围 |
| --- | --- |
| `pnpm acceptance` | 快速本地门禁：unit、E2E smoke、typecheck、lint、build、all-subpath package import smoke，以及关键文档/产物检查。 |
| `pnpm acceptance -- --help` | 输出验收门禁参数说明，不运行检查。 |
| `pnpm acceptance -- -h` | 输出验收门禁参数说明，不运行检查；用于验证 pnpm 短参数转发写法。 |
| `pnpm acceptance -- --full` | 在快速门禁基础上，额外运行完整 integration tests 和 benchmark。 |
| `pnpm acceptance -- --full --browser` | 在 full 基础上，额外运行真实 Chromium trace E2E。 |
| `pnpm goal:audit` | 生成 `docs/acceptance/goal-completion-audit.md`，将长期目标成功条件映射到当前证据；`accepted` 必须带具体确认备注且 generated Playwright spec 执行验证通过，才会被判定为完成；`changes_requested` 会被识别为有效修改反馈并要求继续迭代。 |
| `pnpm user:accept -- --help` | 输出真实项目验收参数说明，不要求提供 repo。 |
| `pnpm user:accept -- -h` | 输出真实项目验收参数说明，不要求提供 repo；用于验证 pnpm 短参数转发写法。 |
| `pnpm user:accept -- --repo <repo>` | 先把 repo root 和 `package.json` 作为两个独立前置检查记录，再对真实项目运行 hardening flow，检查 report/findings/repair-plan/repair-task-package/patch/generated tests/browser artifacts，并生成 `docs/acceptance/user-acceptance-record.md`；待验收模板和生成记录都会给出下一步，生成记录会按 failed、pending、accepted、changes_requested 四类状态给出下一步；`--decision accepted` 和 `--decision changes_requested` 都必须同时提供具体 `--notes`，不能留空或使用占位符；如果误传入 `<real-web-app-repo>` 这类占位符，会在访问文件系统前提示替换为真实 Web App repo 路径，验收记录中的真实项目路径和可见命令都会保留占位符而不是展示解析后的假绝对路径；无效 repo、缺失 `package.json`、`package.json` JSON 语法错误、非对象 package manifest 或 hardening flow 非预期异常会生成结构化失败记录且不会创建目标目录；摘要路径、异常摘要、artifact 检查证据和用户备注会脱敏。 |
| `pnpm user:accept -- --mode cli --repo <repo>` | 显式 Python/CLI 验收模式；校验 repo root 和 `pyproject.toml`，生成 `.hardening/run/python-cli-profile.json`、run-scoped `python-cli-profile.json`、`hardening-report.md`、`manifest.json`、`repair-plan.json` / `repair-plan.md`、`repair-task-package.json` / `repair-task-package.md`；不会启动浏览器 hardening flow，也不会要求 generated Playwright spec validation。 |
| `pnpm repair:handoff -- --run <run-dir>` | 从指定 run bundle 的 `manifest.json` 生成 `repair-handoff-package.json`、`repair-handoff-package.md` 和 `verification-plan.md`；会把失败命令和失败验收项标准化成 AI IDE / Agent 可执行任务，并对命令输出中的敏感值脱敏。 |
| `pnpm repair:execute -- --package <package> --task <taskId>` | 读取 `repair-handoff-package.json` 并选择指定 task；`--dry-run` 只生成执行计划，`--validation-only` 只复跑 verification commands 并生成 `repair-execution-report.json` / `.md`；当前不会自动修改目标 repo 代码。 |
| `pnpm repair:patch-plan -- --report <report>` | 读取 `repair-execution-report.json`，生成 `patch-plan.json` / `.md`；当前只把失败验证证据分类为可审查 patch actions，不写源码、不运行 formatter、不创建 PR。 |
| `--validate-generated-tests` | 与 `pnpm user:accept` 配合使用，执行生成的 Playwright spec；最终 `--decision accepted` 必须启用该项。未传 `--url` 时会保持自动启动的 app 运行到验证结束，已运行服务可通过 `--url` 复用。 |
| `--generated-test-timeout-ms <ms>` | 与 `--validate-generated-tests` 配合使用，调整 generated spec 执行超时；默认 120000ms，适合慢启动或慢登录的真实项目。 |

验收 runner 和 benchmark runner 的进程级 fatal stderr 写入前会脱敏敏感值。

### Repository acceptance scope

当前 browser acceptance 范围限定为可自动启动或已提供 URL 的 Web App repo。该范围由 ADR-0008（`docs/adr/0008-repository-acceptance-scope.md`）固化：`pnpm user:accept` 的浏览器验收流要求 repo root 是有效目录，并且具备文件型、JSON 对象 `package.json` manifest。通过 `--repo` 指向 monorepo 内部 Web App 子项目是支持路径；通过 `--url <running-url>` 复用已启动 Web App 也是支持路径。

Python CLI、Agent capability package、纯库、后端服务、移动端等非浏览器 UI 项目不属于 browser acceptance 范围。例如 `Panniantong/Agent-Reach` 只有 `pyproject.toml` 和 Python CLI entrypoint，没有根目录 `package.json`，因此默认 browser mode 应在 repo preflight 阶段生成结构化失败记录，而不是进入 browser artifact 或 generated Playwright spec 验证。当前已支持显式 Python/CLI acceptance mode：使用 `--mode cli` 后，runner 会改用 `pyproject.toml` preflight、Python/CLI profile、CLI smoke/static/test check execution results、report、manifest、repair plan 和 repair task package 作为证据。

当前已验证结果：

| 命令 | 当前状态 |
| --- | --- |
| `pnpm vitest run tests/unit/markdown-format.test.ts` | 1 个测试文件，3 个测试通过 |
| `pnpm vitest run tests/unit/cli-options.test.ts` | 1 个测试文件，29 个测试通过 |
| `pnpm vitest run tests/unit/acceptance-report.test.ts` | 1 个测试文件，14 个测试通过 |
| `pnpm vitest run tests/unit/goal-audit.test.ts` | 1 个测试文件，105 个测试通过 |
| `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts` | 1 个测试文件，28 个测试通过 |
| `pnpm vitest run tests/unit/repo-preflight.test.ts` | 1 个测试文件，10 个测试通过 |
| `pnpm vitest run tests/unit/analyze-repo.test.ts` | 1 个测试文件，29 个测试通过 |
| `pnpm test:unit` | 25 个测试文件，454 个测试通过 |
| `pnpm test:integration` | 提权环境 11 个测试文件，27 个测试通过 |
| `pnpm test:e2e` | 1 个测试通过，1 个可选 browser E2E 跳过 |
| `HARDENING_E2E_BROWSER=1 pnpm vitest run tests/e2e/run-browser.e2e.test.ts` | 提权环境 1 个真实 Chromium trace E2E 通过 |
| `pnpm test` | 提权环境 34 个测试文件通过、1 个可选 browser E2E 文件跳过；366 个测试通过，1 个跳过 |
| `pnpm typecheck` | 通过 |
| `pnpm lint` | 通过 |
| `pnpm build` | 通过 |
| `pnpm acceptance -- --full --browser` | 17/17 检查通过，包含 all-subpath package import smoke 和 package subpath type-resolution smoke，生成 `docs/acceptance/acceptance-run.md` |
| `pnpm goal:audit` | 当前 33 项检查中 33 项自动和用户验收证据通过、0 项缺失、0 项需用户人工确认；accepted 验收记录必须不早于当前 goal 最后更新日期、包含具体确认备注，且 generated Playwright spec 执行验证通过；`changes_requested` 且包含具体用户备注时会转为缺失项并指向继续迭代 |
| `pnpm user:handoff` | 生成 `docs/acceptance/user-acceptance-handoff.md`，集中呈现最终验收入口、当前结论、自动质量门禁、架构迁移状态、当前用户验收状态、下一步、真实项目验收命令和人工确认边界；默认输出会在写入后重算 goal audit 摘要，并同步刷新 `docs/acceptance/goal-completion-audit.md`，避免旧交接包或旧审计文件导致一次性失败；默认交接包会提示用 `--repo <real-web-app-repo>` 重新生成带 repo 前置检查的交接包；支持 `--repo <repo>`、`--help` 和 `--output <path>`；传入 `--repo` 时会显示 repo root 和文件型、JSON 对象 manifest 的 `package.json` 两个独立前置检查结果；误传占位符 repo 时会先提示替换为真实 Web App repo 路径；必需前置检查失败时仍会写出交接包并返回非零退出码，当前结论会优先提示修复 repo 路径或 package.json manifest，且不会展示带失败 repo 的 `pnpm user:accept` 命令，只提示先修复 repo 路径或 package.json manifest 后重新生成交接包；通过前置检查时会生成可直接执行的 `accepted` 和 `changes_requested` 命令，两者都使用可被 CLI 接受的具体备注；如果展示命令中的 repo 路径因敏感值被脱敏，交接包会提醒用户用真实 repo 路径重新运行 |
| `pnpm vitest run tests/unit/user-acceptance.test.ts` | 1 个测试文件，48 个测试通过 |

说明：默认沙箱可能禁止本地监听和 Chromium 启动。遇到 `listen EPERM` 或 Chromium MachPort 权限错误时，请在允许本地 server 和浏览器进程的环境中运行。

## 3. CLI 验收

每个 CLI 子命令都提供零副作用帮助入口：

```bash
node dist/adapters/cli/index.js analyze --help
node dist/adapters/cli/index.js explore --help
node dist/adapters/cli/index.js generate-tests --help
node dist/adapters/cli/index.js plan --help
node dist/adapters/cli/index.js report --help
node dist/adapters/cli/index.js run --help
node dist/adapters/cli/index.js run -h
```

验收标准：

- 返回退出码 0。
- stdout 包含对应子命令的 Usage、Arguments、可用 Options，并自描述 `--help, -h`。
- 不进入参数校验、repo 分析、浏览器探索或文件写入流程。
- CLI 成功 stdout JSON 和 stderr 错误输出写入前会脱敏敏感值。

### 3.1 分析仓库

```bash
node dist/adapters/cli/index.js analyze <repo>
```

验收标准：

- stdout 返回 repo profile JSON。
- `<repo>/.hardening/run/repo-profile.json` 被写入。
- 能识别 framework、package manager、scripts、`package.json#workspaces` 或 `pnpm-workspace.yaml` 子包和 recommended start command；`pnpm-workspace.yaml` 支持多行列表和简单 inline array，例如 `packages: ["apps/*"]`；包管理器支持 npm、pnpm、yarn 和 Bun，优先按 lockfile 判断，缺失时读取 `package.json#packageManager`；启动建议按 `dev`、`start`、`preview` 顺序选择可用脚本，缺失标准脚本时会尝试常见 app/web/frontend dev 脚本，例如 `web:dev`，也会从 workspace 子包生成类似 `pnpm --filter web dev` 或 `bun --filter web dev` 的启动命令，并优先选择通过依赖、`next.config.*`、`vite.config.*` 或 framework 启动脚本识别为 Web app 的子包而不是库包；当根脚本只是 `turbo`、`nx`、`lerna` 这类通用 workspace 编排器时，会优先推荐已识别 Web app 子包的直接启动命令；`appDirectories` 会优先列出已识别的 Web app 子包，并在根项目本身不是 Web app 时过滤根 `src` 这类噪声信号。
- 能从 `.env.example`、`.env.local` 和 `.env` 提取 env key hints；支持 `export KEY=value`，且不输出 env value。

### 3.2 已运行 URL 的完整硬化

```bash
node dist/adapters/cli/index.js run <repo> <url> --browser --critical-path /login --max-routes 20 --max-actions-per-route 20
```

验收标准：

- 输出包含 `profilePath`、`findingsPath`、`reportPath`。
- 生成 `hardening-report.md`。
- 生成 `tests/hardening/*.spec.ts`。
- 生成 `.hardening/artifacts/*` 截图。
- 对 `http://...` 或 `https://...` 这类未显式写端口的外部 URL，`boot-result.json` 会记录默认端口 80 或 443；写入的 URL、日志路径、blockers 和 errors 会脱敏敏感 query/fragment 参数或常见 credential。

### 3.3 自动启动应用的完整硬化

```bash
node dist/adapters/cli/index.js run <repo> --browser --start-command "pnpm dev" --boot-timeout-ms 30000
```

验收标准：

- 工具能从 repo profile 推断启动命令。
- 传入 `--start-command` 时优先使用用户指定命令。
- 能启动本地 app、探索、生成测试、生成报告。
- 运行结束后自动停止自身启动的 app。

### 3.4 探索控制参数

| 参数 | 说明 | 验收关注点 |
| --- | --- | --- |
| `--critical-path <path-or-intent>` | 添加必须探索的路径、同源 URL 或短自然语言意图，可重复传入；外部 origin 会被忽略。 | 报告和 findings 中应覆盖这些关键路径；例如 `/login` 或 `"测试登录、创建项目并发送一条聊天消息"`。 |
| `--max-routes <n>` | 限制最多访问路由数。 | 大型项目运行时间可控。 |
| `--max-actions-per-route <n>` | 限制每个路由的基础点击/提交交互数；传 `0` 可禁用交互。 | 避免在未知项目中过度操作。 |
| `--storage-state <path>` | 使用 Playwright storageState JSON 复用登录态。 | 已登录页面可被探索，但不读取浏览器个人资料。 |
| `--trace` | 为每个 browser snapshot 输出 Playwright trace zip。 | 可用 Playwright trace viewer 回放复杂前端问题。 |
| `--start-command <command>` | URL 省略时指定启动命令，支持开头的 inline env，例如 `NODE_ENV=development pnpm dev`。 | monorepo、非标准脚本或需要临时 env 的启动命令可手动覆盖。 |
| `--boot-timeout-ms <ms>` | URL 省略时指定启动超时。 | 慢启动项目可提高超时。 |

### 3.5 独立生成测试

```bash
node dist/adapters/cli/index.js generate-tests <findingsPath> <outputDir> --smoke-route /login --base-url http://127.0.0.1:5173
```

验收标准：

- `--smoke-route` 可重复传入，为已知关键路径额外生成 smoke tests。
- `--base-url` 会把应用 URL 的安全 origin 写入 generated spec 默认 `baseURL`，path、query 和 fragment 不会进入 spec。
- 运行时仍可通过 `HARDENING_BASE_URL` 覆盖目标地址。

## 4. MCP 验收

构建后使用 stdio MCP Server：

```bash
node dist/adapters/mcp/index.js
```

通用 MCP stdio 配置示例：

```json
{
  "mcpServers": {
    "hardening-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/hardening-mcp/dist/adapters/mcp/index.js"]
    }
  }
}
```

可用 tools：

- `analyze_repo`
- `boot_app`
- `stop_app`
- `explore_app`
- `generate_tests`
- `generate_repair_plan`
- `harden_report`
- `run_hardening`

验收标准：

- MCP client 能列出以上 tools。
- `analyze_repo` 可返回 structuredContent。
- tool 成功响应和错误响应写入 `content` 与 `structuredContent` 前都会脱敏敏感值；`sessionId` 作为 `stop_app` 所需操作句柄会保留在成功响应的 `structuredContent` 中。
- MCP Server 进程级启动失败写入 stderr 前会脱敏敏感值。
- `run_hardening` 可生成与 CLI 相同的 artifacts。
- `explore_app` / `run_hardening` 可接受 `criticalPaths`、`maxRoutes`、`maxActionsPerRoute`、`storageStatePath`、`trace` 和 `browser`；显式 full URL critical path 会限制在目标应用同源范围内。
- `generate_tests` 可接受 `smokeRoutes`，为关键路径额外生成 smoke tests。
- `generate_tests` 可接受 `baseUrl`，为独立生成的 Playwright spec 写入安全默认 origin。
- `generate_repair_plan` 默认读取 `<repo>/.hardening/latest`，也可传 `runDir` 刷新指定 run 的 `repair-plan.json`、`repair-plan.md`、`repair-task-package.json` 和 `repair-task-package.md`。
- generated Playwright spec 会把被测 app 的安全 origin 写作默认 baseURL，并仍支持 `HARDENING_BASE_URL` 覆盖，避免非 3000 端口或 HTTPS 目标复制运行时误连默认 localhost。
- `run_hardening` 可接受 `startCommand`、`bootTimeoutMs` 和 `workspaceOutputDir`；传入 `workspaceOutputDir` 时，会把多个 repo 的 run bundle 汇总到同一个中央输出目录，并更新 workspace manifest；完整流程会自动生成 repair plan 和可执行修复任务包。
- 独立调用 `boot_app` 后，可使用返回的 `sessionId` 调用 `stop_app`。

客户端验收步骤：

1. 在 MCP client 中加入上述 `mcpServers.hardening-mcp` 配置，并将 `args` 改为本机绝对路径。
2. 重启或刷新 MCP client。
3. 确认 client 能列出 `analyze_repo`、`boot_app`、`stop_app`、`explore_app`、`generate_tests`、`generate_repair_plan`、`harden_report` 和 `run_hardening`。
4. 调用 `analyze_repo` 指向一个本地 Web App repo，确认返回 structuredContent 且不包含 env value。
5. 如独立调用 `boot_app`，记录返回的 `sessionId`，验收结束后调用 `stop_app` 清理进程。

## 5. Benchmark 验收

```bash
pnpm build
pnpm benchmark
```

示例 repo 运行流程：

1. 运行 `pnpm build`，确保 CLI 和 MCP dist 产物已生成。
2. 运行 `pnpm benchmark`，对 5 个本地半真实 benchmark repo 执行完整 `run --browser`。
3. 打开 `docs/logs/spike-results.md`，确认 `Go/No-go` 为 `Go`，`完整流程完成数` 至少为 3，当前已验证为 5。
4. 从 `Repo 结果` 表中选择一个 completed repo，例如 `vite-basic`。
5. 打开该 repo 的 `hardening-report.md`、`.hardening/latest/repair-plan.md` 和 `.hardening/latest/repair-task-package.md`，检查评分、findings、repair tasks、handoff prompt、artifacts、generated tests 和 verification command。
6. 检查对应 `artifacts/benchmark-runs/<run-id>/<repo>/tests/hardening/*.spec.ts`，确认 generated Playwright spec 已生成且验证状态为 `passed`。

当前已验证结果：

- 5/5 benchmark repo 完成完整流程。
- 5/5 生成 Playwright spec 实际执行通过。
- 总耗时约 17 秒，低于 15 分钟目标。
- 结果文件：`docs/logs/spike-results.md`。

验收标准：

- `docs/logs/spike-results.md` 的 Go/No-go 为 `Go`。
- 至少 3/5 repo 为 `completed`。
- 每个 completed repo 至少生成 1 个 Playwright spec。
- `generatedTestValidation` 为 `passed`。

## 6. 报告样例

稳定样例见：

```bash
docs/testing/samples/sample-hardening-report.md
```

Benchmark 运行后可打开任一报告，例如：

```bash
open artifacts/benchmark-runs/<run-id>/vite-basic/hardening-report.md
```

报告应包含：

- 就绪度评分。
- P0/P1/P2 汇总。
- 启动状态与应用 URL。
- repo profile。
- findings 的严重级别、类型、复现步骤和证据。
- 生成测试信息，包括 findings 回归测试和已探索关键路径的 smoke tests。
- 带 `HARDENING_BASE_URL` 的 generated test verification command。
- 修复指导。
- blocker 和错误。

## 7. 真实项目验收

请指定一个真实 Web App repo，然后运行：

```bash
pnpm build
node dist/adapters/cli/index.js run <repo> --browser --critical-path / --max-routes 20 --max-actions-per-route 20
```

也可以使用真实项目验收 runner 生成验收记录：

```bash
pnpm user:accept -- --help
pnpm user:accept -- --repo <repo> --browser --critical-path / --max-routes 20 --max-actions-per-route 20 --decision pending
```

`<repo>` 必须是已存在目录，且目录下必须有文件型、JSON 语法有效、解析结果为对象的 `package.json`；runner 会在验收记录中分别显示 repo root 和 `package.json` 两个前置检查。如果路径不存在或指向普通文件，`package.json` 检查会标记为跳过；如果目录存在但缺少 `package.json`，repo root 会标记为通过且 `package.json` 标记为失败；如果 `package.json` 语法错误，会在 hardening flow 启动前标记为失败并写入 `invalid package.json` 证据；如果 `package.json` 是数组、字符串、数字、布尔值或 `null` 这类合法 JSON 但不是对象 manifest，会写入 `invalid package.json manifest` 证据。任一必需前置检查失败时，runner 会返回非零退出码，不会创建目标 repo 目录。若前置校验通过但 hardening flow 发生非预期异常，runner 也会写入结构化失败记录，错误摘要会先经过敏感信息脱敏。验收记录中的摘要路径、artifact 检查证据和用户备注同样会脱敏。

若需要验证生成的 Playwright spec 实际可执行，可直接使用自动启动模式：

```bash
pnpm user:accept -- --repo <repo> --browser --validate-generated-tests --decision pending
```

若应用已由用户或 CI 启动，也可以复用现有 URL：

```bash
pnpm user:accept -- --repo <repo> --url <running-url> --browser --validate-generated-tests --generated-test-timeout-ms 240000 --decision pending
```

用户确认 MVP 符合预期后，可写入接受结论：

```bash
pnpm user:accept -- --repo <repo> --browser --validate-generated-tests --critical-path / --decision accepted --notes "用户确认 MVP 符合预期"
pnpm goal:audit
```

`pnpm goal:audit` 只会把当前 goal 的 accepted 验收记录判定为完成证据：accepted 验收记录的生成时间必须不早于 `docs/goals/codex-goal.md` 的最后更新日期，必须包含具体确认备注，且 generated Playwright spec 执行验证必须通过。若 goal 文档更新过，请重新运行 `pnpm user:accept -- --repo <repo> --browser --validate-generated-tests --decision accepted --notes "用户确认 MVP 符合预期"` 并再次执行 `pnpm goal:audit`。

如果用户要求修改，应把具体修改项写入备注。`pnpm user:accept` 会拒绝缺少具体 `--notes` 或仍使用 `<具体修改项>` 占位符的 `changes_requested` 命令；`pnpm goal:audit` 会识别有效记录为修改反馈，但不会标记长期 goal 完成；后续应按备注继续迭代并重新验收：

```bash
pnpm user:accept -- --repo <repo> --browser --decision changes_requested --notes "补齐登录态探索并降低误报"
pnpm goal:audit
```

如项目启动脚本不是默认 `dev`，请显式传入：

```bash
node dist/adapters/cli/index.js run <repo> --browser --start-command "pnpm dev --host 127.0.0.1"
pnpm user:accept -- --repo <repo> --browser --start-command "pnpm dev --host 127.0.0.1"
```

如需要验收已登录页面，请先用 Playwright 生成 storageState JSON，再传入：

```bash
node dist/adapters/cli/index.js run <repo> --browser --storage-state .auth/user.json
```

如需要回放复杂前端问题，请开启 trace：

```bash
node dist/adapters/cli/index.js run <repo> --browser --trace
```

验收时请检查：

- 应用是否能自动启动。
- 报告是否指出真实可复现问题。
- `.hardening/latest/manifest.json` 是否存在，且 `files` 指向本次 run bundle 内的报告、repair plan、repair task package、findings、generated tests 和 artifacts。
- 多 repo 场景传入 `--workspace-output <dir>` 或 MCP `workspaceOutputDir` 后，中央 `<dir>/manifest.json` 是否列出每个 repo 的 `latestManifest`。
- `.hardening/latest/repair-plan.json` 和 `.hardening/latest/repair-plan.md` 是否存在，且任务包含 severity、evidence、repairIntent、verification 和 agentPrompt。
- `.hardening/latest/repair-task-package.json` 和 `.hardening/latest/repair-task-package.md` 是否存在，且每个任务包含 objective、context、recommendedFix、acceptanceCriteria 和 handoffPrompt。
- 生成的 Playwright tests 是否可人工运行和修改。
- `.hardening/run/patch.diff` 是否包含 remediation plan 和 generated tests diff。
- `.hardening/artifacts` 中截图是否对定位问题有帮助。
- 开启 `--trace` 时，`.hardening/artifacts` 中是否生成 `.trace.zip`。
- 工具是否没有输出 env value 或敏感信息；CLI 成功 stdout JSON、CLI stderr 错误输出、MCP tool 成功响应和错误响应、MCP 进程级启动失败 stderr、验收 runner 进程级 fatal stderr、benchmark runner 进程级 fatal stderr、`boot-result.json` 的 URL、日志路径、blockers 和 errors、探索返回的 `visitedRoutes`/`interactions`、`findings.json`、报告、repair plan、`patch.diff`、`docs/acceptance/acceptance-run.md` 的报告路径/命令/说明列、`docs/logs/spike-results.md` 的运行目录/报告路径/失败原因、`docs/acceptance/goal-completion-audit.md` 的分类标题/要求/证据/下一步、验收命令、验收记录摘要路径、artifact 检查证据、用户备注、generated spec 验证命令 evidence 和验证失败摘要会脱敏 API key、token、password、session、JWT、CSRF、Cookie/Set-Cookie value、Authorization/Proxy-Authorization credential、standalone repository/deployment token、standalone cloud provider access key、URL userinfo credential、signed URL credential/signature 参数和 URL query/fragment 中的敏感参数值，generated spec 会脱敏 route query/fragment 中的 signed URL credential/signature 参数以及 test title 中的敏感值。

## 8. 已知限制和未解决 blocker

### 8.1 已知限制

- 默认沙箱可能无法监听 `127.0.0.1`。
- 默认沙箱可能无法启动 Chromium。
- 当前 browser exploration 覆盖基础链接、按钮、submit 控件交互、非敏感文本字段填充、storageState 登录态和可选 trace，并默认跳过高风险动作。
- 复杂多步业务流仍是后续增强方向。
- `repair-plan.json` 当前生成结构化修复任务；`repair-task-package.json` 将每个任务进一步包装为 AI IDE / Agent 可执行任务包，包含 expected outcome、change scope、implementation steps、acceptance criteria 和 handoff prompt；两者都不自动修改业务代码，写入前会统一脱敏敏感值。
- `patch.diff` 当前生成 remediation plan 和 generated tests diff，不自动修改业务代码；写入前会统一脱敏敏感值。
- `run_hardening` 会同时保留旧路径和 run-scoped bundle；AI IDE / Agent 应优先读取 `.hardening/latest/manifest.json`、`files.repairPlan` 和 `files.repairTaskPackage`，人工查看可继续打开 repo 根目录 `hardening-report.md`。
- 多 repo workspace 输出是可选能力；不传 `workspaceOutputDir` 时，只写目标 repo 本地 `.hardening` 物料区。

### 8.2 未解决 blocker

| Blocker | 当前影响 | 用户或外部条件 |
| --- | --- | --- |
| 默认沙箱内完整运行 `pnpm test:integration` | 默认沙箱本地监听 `127.0.0.1` 会触发 `listen EPERM`；提权环境完整 integration tests 已通过。 | 在允许监听本地端口的环境中运行，或按需批准相关测试命令。 |
| Playwright 浏览器启动需要沙箱外权限 | 默认沙箱可能无法启动 Chromium；提权环境的 data URL 探测和真实 Chromium trace E2E 已通过。 | 在允许启动 Chromium 的环境中运行，或按需批准 browser/E2E 命令。 |
| 真实项目上的 `hardening run <repo> --browser` | 已在多个真实项目上运行；`openclaw/openclaw` accepted 验收已通过。 | 若要扩展覆盖登录态或后端完整联调，可提供 storageState、运行 URL 或 worker 启动方式后复跑。 |
| 真实项目上的 `pnpm user:accept -- --repo <repo> --browser --validate-generated-tests --decision accepted --notes "用户确认 MVP 符合预期"` | 已在 `openclaw/openclaw` 上通过 accepted 验收，12/12 artifact 检查通过，generated Playwright spec 执行验证通过，`pnpm goal:audit` 已转为 33/33 通过。 | 后续 v0.3 验收应覆盖 GitHub Action wrapper、repair loop contract 和 public-release readiness checks。 |

详细历史见 `docs/logs/blockers.md`。

## 9. 验收结论模板

```markdown
## 用户验收结论

- 验收项目：<repo 或 benchmark>
- 验收命令：<command>
- 是否通过：是 / 否
- 必须修复项：
  - 
- 可后续优化项：
  - 
```
