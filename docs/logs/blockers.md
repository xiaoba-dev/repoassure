# 阻塞日志

## 2026年6月22日 - GitHub branch protection and repository rulesets are unavailable for the private repo

### 背景

ADR-0012 要求 `main` 进入分支保护或等价 repository ruleset，并要求 `RepoAssure CI` / `Quality Gates` 作为 required status check。当前仓库必须保持 private，不能通过改 public 解锁功能。

### 影响

GitHub branch protection and repository rulesets are unavailable for the private repo under the current account plan. 在解除该外部条件前，`main` 仍无法由 GitHub 强制要求 CI 通过后再合并。

### 已尝试方案

1. 运行 `gh api repos/xiaoba-dev/repoassure/branches/main/protection`：返回 HTTP 403。
2. 运行 `gh api repos/xiaoba-dev/repoassure/rulesets`：返回 HTTP 403。
3. 运行 `gh api --method PUT repos/xiaoba-dev/repoassure/branches/main/protection`，尝试要求 `Quality Gates` status check：返回 HTTP 403。

错误信息：

```text
Upgrade to GitHub Pro or make this repository public to enable this feature.
```

### 当前判断

这是 GitHub plan / repository feature 权限限制，不是本地配置或 CI 实现缺失。由于 ADR-0009 和 ADR-0012 均要求仓库保持 private，不能通过 make repository public 作为绕过方案。

### 需要的用户决策或外部条件

升级仓库 owner 或组织到支持 private repo branch protection / rulesets 的 GitHub plan。权限可用后，按 `docs/operations/branch-protection-release-boundary-v0.1.md` 配置 `main`，要求 `RepoAssure CI` / `Quality Gates` status check，并重新验证。

## 2026年6月21日 - Agent-Reach CLI mode 真实 repo 复验需要本地路径或网络授权

### 背景

ADR-0008 后续实现已新增显式 Python/CLI acceptance mode，并用 `fixtures/python-cli-basic` 完成可复现验证。用户此前指定的真实 repo 是 `Panniantong/Agent-Reach`。

### 影响

当前 workspace 和桌面扫描未发现本地 Agent-Reach 目录。本轮没有执行网络 clone，因此尚未用真实 Agent-Reach 复跑 `pnpm user:accept -- --mode cli`。

### 已尝试方案

1. 扫描 `/Users/ycn/Desktop/Agent Tester`、`/Users/ycn/Desktop/OPC Lab` 和桌面有限深度目录：未发现 Agent-Reach。
2. 新增 `fixtures/python-cli-basic`，覆盖 `pyproject.toml`、console script 和 optional `pytest`/`ruff` 配置。
3. 运行 `pnpm user:accept -- --mode cli --repo fixtures/python-cli-basic --decision pending --output artifacts/acceptance/python-cli-basic-user-acceptance.md`：通过，13/13 检查通过。
4. 运行 `pnpm user:handoff -- --mode cli --repo fixtures/python-cli-basic --output artifacts/acceptance/python-cli-basic-user-handoff.md`：通过。

### 当前判断

已解除。后续在 `/private/tmp/agent-reach` 完成 Python/CLI acceptance mode 复验；产品 runner 已自动执行 `agent-reach --help`、`pytest`、`ruff check .` 和 `mypy .`，并把结果写入验收记录、report、manifest、repair plan 和 repair task package。

### 需要的用户决策或外部条件

如需验证远端最新提交，仍需要用户授权网络访问后更新或重新 clone `Panniantong/Agent-Reach`。

## 2026年6月18日 - 本地监听测试需要提权

### 背景

`boot_app` 和后续 `explore_app` 的部分集成测试需要启动本地 HTTP fixture server 并监听 `127.0.0.1`。

### 影响

在默认沙箱中运行这些测试时，会出现：

```text
listen EPERM: operation not permitted 127.0.0.1
```

这会影响以下测试的默认沙箱运行：

- `tests/integration/boot-app.test.ts`
- `tests/integration/boot-tool.test.ts`
- 后续 Playwright/E2E 测试

### 已尝试方案

1. 默认沙箱运行 `pnpm test:integration`：失败，原因是 `listen EPERM`。
2. 提权运行 `pnpm test:integration`：此前通过，证明实现逻辑可用。
3. 最近一次提权运行被自动审核中断，未继续重复尝试。

### 当前判断

这是执行环境权限限制，不是产品代码逻辑失败。

### 需要的用户决策或外部条件

后续需要完整验证本地 server、Playwright 或 E2E 时，需要允许对应测试命令在可监听本地端口的环境中运行。

### 临时绕过方案

- 继续运行不需要本地监听的单元测试、静态门禁和非监听集成测试。
- 保留本地监听集成测试文件，待权限允许时补跑。
- 不用更窄实现替代最终目标。

## 2026年6月18日 - Playwright 浏览器启动需要沙箱外权限

### 背景

安装 `playwright` 后，默认沙箱内启动 Chromium 会失败。

### 影响

默认沙箱中真实浏览器探索会出现 macOS MachPort 权限错误，核心信息为：

```text
bootstrap_check_in org.chromium.Chromium.MachPortRendezvousServer... Permission denied (1100)
```

### 已尝试方案

1. 安装 Chromium：`pnpm exec playwright install chromium`，提权后成功。
2. 默认沙箱运行 Playwright data URL 探测：失败，原因是 Chromium 启动权限。
3. 提权运行 Playwright data URL 探测：成功，输出 `ok`。
4. 提权运行项目自己的 `createPlaywrightBrowserDriver` data URL 探测：成功，采集到 body text、截图 artifact 和交互结果。

### 当前判断

这是当前执行环境的浏览器进程权限限制，不是 Playwright driver 代码逻辑失败。

### 需要的用户决策或外部条件

真实 Playwright 浏览器 E2E 需要在允许启动 Chromium 的环境中运行，或对相关命令提权执行。

## 2026年6月19日 - 长期 goal 等待真实项目用户验收

### 背景

`docs/goals/codex-goal.md` 的 Success Definition 明确要求“用户确认 MVP 符合预期，或明确列出剩余修改项”。当前 `pnpm goal:audit` 已显示自动可验证范围内没有缺失项，但用户验收项仍为 `需要人工确认`。

### 影响

长期 goal 不能由自动脚本标记完成。当前已在 `openclaw/openclaw` 上生成通过的 pending 真实项目验收记录，但缺少用户验收结论时，仍无法生成可被 `pnpm goal:audit` 判定为完成的 accepted 验收记录，也无法根据 `changes_requested` 继续迭代具体修改项。

### 已尝试方案

1. 刷新 `docs/acceptance/user-acceptance-handoff.md`，集中给出真实项目验收命令、accepted 路径和 changes_requested 路径。
2. 刷新 `docs/acceptance/goal-completion-audit.md`，确认 25 项检查中 24 项自动证据通过、0 项缺失、1 项需人工确认。
3. 加固 `pnpm user:accept -- --decision accepted`，要求具体确认备注和 generated Playwright spec 执行验证通过，避免把不充分记录误判为完成。
4. 同步 README、用户验收指南、验收清单、验收记录模板、开发日志和决策日志中的最终验收边界。
5. 2026年6月21日，使用用户指定的 `openclaw/openclaw` 进行真实项目验收；浅克隆到 `/private/tmp/openclaw-openclaw-shallow`，安装依赖后用 `--start-command "pnpm ui:dev"` 运行 `pnpm user:accept -- --repo /private/tmp/openclaw-openclaw-shallow --browser --validate-generated-tests --decision pending`，验收记录通过 12/12，`generated Playwright spec 执行验证` 和 browser artifact 均通过。

### 当前判断

已解除。用户已给出 `accepted` 结论，随后使用 `openclaw/openclaw` 的真实项目路径写入 accepted 验收记录，12/12 artifact 检查通过，generated Playwright spec 执行验证通过，`pnpm goal:audit` 转为 33/33 通过，并已提交推送 `055ae85 docs: close mvp v0.2 user acceptance`。

### 需要的用户决策或外部条件

无。以下命令保留为历史复现路径。该 repo 的可复现 pending 命令是：

```bash
pnpm user:accept -- --repo /private/tmp/openclaw-openclaw-shallow --browser --validate-generated-tests --start-command "pnpm ui:dev" --boot-timeout-ms 120000 --decision pending
```

如果结果符合预期，再写入最终通过结论：

```bash
pnpm user:accept -- --repo /private/tmp/openclaw-openclaw-shallow --browser --validate-generated-tests --start-command "pnpm ui:dev" --boot-timeout-ms 120000 --decision accepted --notes "用户确认 MVP 符合预期"
pnpm goal:audit
```

如果需要继续修改，则写入具体修改项：

```bash
pnpm user:accept -- --repo /private/tmp/openclaw-openclaw-shallow --browser --start-command "pnpm ui:dev" --boot-timeout-ms 120000 --decision changes_requested --notes "补齐登录态探索并降低误报"
pnpm goal:audit
```

## 2026年6月21日 - Agent-Reach 是 Python CLI repo，不是当前 Web App 验收目标

### 背景

用户提供 `Panniantong/Agent-Reach` 作为新的真实 repo 测试目标。该 repo 已浅克隆到 `/private/tmp/agent-reach`。

### 影响

该 repo 根目录存在 `pyproject.toml`，项目类型为 Python CLI/capability package，入口为 `agent-reach = "agent_reach.cli:main"`，但不存在当前 `user:accept` repo preflight 所要求的 `package.json`。因此当前 MVP 无法对它执行 Web App 启动、浏览器探索、browser artifact 和 generated Playwright spec 执行验证。

### 已尝试方案

1. `gh repo view Panniantong/Agent-Reach --json nameWithOwner,defaultBranchRef,description,isPrivate`：确认仓库公开，默认分支为 `main`。
2. `git clone --depth 1 https://github.com/Panniantong/Agent-Reach.git /private/tmp/agent-reach`：成功。
3. 检查 `/private/tmp/agent-reach/pyproject.toml`：确认项目名 `agent-reach`、Python 版本要求 `>=3.10`、CLI 入口 `agent-reach = "agent_reach.cli:main"`。
4. `pnpm user:handoff -- --repo /private/tmp/agent-reach --output /private/tmp/agent-reach-user-handoff-preflight.md`：按预期失败，repo root 通过，`package.json` 必需项失败。
5. `pnpm user:accept -- --repo /private/tmp/agent-reach --browser --validate-generated-tests --decision pending`：按预期失败并刷新 `docs/acceptance/user-acceptance-record.md`，2 项检查中 1 项通过、1 项失败，必需失败项为 `missing package.json: /private/tmp/agent-reach/package.json`。

### 当前判断

这是目标 repo 类型与当前 MVP 产品范围不匹配，不是自动质量门禁回归。当前产品可以明确拒绝并记录非 Web App repo 的 preflight 失败，但尚不支持 Python/CLI repo 的专用验收流。

### 需要的用户决策或外部条件

如果希望支持 `Agent-Reach` 这类 repo，需要进入 Spec v0.2 设计 Python/CLI acceptance mode，例如检测 `pyproject.toml`、运行 `pytest`/`ruff`/`mypy`、CLI smoke、网络访问 mock、输出 CLI 任务包和修复建议。若继续验证当前 MVP，请提供可自动启动的 Web App repo 或已运行的 Web URL。

## 2026年6月19日 - rotifer-playground 不是可自动启动的 Web App repo

### 背景

用户提供 `rotifer-protocol/rotifer-playground` 作为真实验收 repo。该 repo 已克隆到 `/private/tmp/rotifer-playground` 并完成依赖安装。

### 影响

该 repo 的根项目是 CLI/tooling 项目，不是当前 MVP 目标中的现代 Web App repo。`package.json` 中 `dev` 为 `tsc --watch`，`start` 为 `node dist/index.js`，不会提供本地 HTTP URL。因此 `user:accept --browser --validate-generated-tests` 无法生成 accepted 验收证据。

### 已尝试方案

1. 默认沙箱运行 `npm ci`：失败，npm registry 访问被 `connect EPERM 127.0.0.1:7897` 拦截。
2. 提权运行 `npm ci`：成功，npm audit 报 1 个 moderate vulnerability。
3. 运行 `node dist/adapters/cli/index.js analyze /private/tmp/rotifer-playground`：识别为 `framework: unknown`、`packageManager: npm`。
4. 首次验收暴露 `tsc --watch` 被误推荐为 start command；已通过 TDD 修复 analyzer。
5. 修复后重跑 `pnpm user:accept -- --repo /private/tmp/rotifer-playground --browser --validate-generated-tests --boot-timeout-ms 10000 --decision pending`（提权）：正常退出并生成失败记录，报告阻塞项为 `No Web App start script detected` 和 `No URL or start command is available`。

### 当前判断

这是目标 repo 类型与 MVP 验收范围不匹配，不是 hardening-mcp 自动质量门禁缺失。修复后的工具已能更准确地报告该 repo 不可作为 Web App 自动验收对象。

### 需要的用户决策或外部条件

继续完成 accepted 用户验收需要以下二选一：

1. 用户提供一个可自动启动的真实 Web App repo。
2. 用户为 `rotifer-playground` 提供一个已运行的 Web UI URL 和对应启动方式，再用 `--url <running-url>` 或 `--start-command <command>` 重新运行验收。

## 2026年6月19日 - rotifer-alpha pending 验收已通过，等待用户最终结论

### 背景

用户提供 `rotifer-protocol/rotifer-alpha` 后，真实 Web App 子项目 `/private/tmp/rotifer-alpha/site` 已完成 pending 用户验收运行。

### 影响

自动可验证的真实项目验收链路已经通过，但 `docs/goals/codex-goal.md` 的 Success Definition 仍要求用户明确确认 MVP 是否符合预期。因此长期 goal 不能仅凭 pending 记录标记为 complete。

### 已尝试方案

1. `pnpm user:handoff -- --repo /private/tmp/rotifer-alpha/site`：通过 preflight。
2. `node dist/adapters/cli/index.js analyze /private/tmp/rotifer-alpha/site`：识别为 Vite Web App，推荐 `npm run dev`。
3. `npm ci` 和 `npm run build`：目标 repo 通过。
4. `npm run lint`：目标 repo 自身未通过，46 个既有问题，已记录为被测项目质量发现。
5. 首次 pending 验收暴露 generated spec 无法解析 `@playwright/test`；已通过 TDD 修复平台验证器。
6. 修复后重跑 `pnpm user:accept -- --repo /private/tmp/rotifer-alpha/site --browser --validate-generated-tests --decision pending --output docs/acceptance/user-acceptance-record.rotifer-alpha.md`：通过，7/7 artifact 检查通过，readiness score 0，P1 75。

### 当前判断

剩余阻塞为用户验收结论，不是自动质量门禁或真实项目运行缺失。`rotifer-alpha/site` 的报告显示平台能够发现目标应用后端代理缺失、网络错误和不可见/无效交互等问题。

### 需要的用户决策或外部条件

如果该结果符合 MVP 预期，授权写入最终 accepted 记录：

```bash
pnpm user:accept -- --repo /private/tmp/rotifer-alpha/site --browser --validate-generated-tests --decision accepted --notes "用户确认 MVP 符合预期"
pnpm goal:audit
```

如果不符合预期，请给出具体修改项，并写入 changes_requested 记录后继续迭代。

## 2026年6月20日 - rotifer-alpha 用户验收阻塞已解除

### 背景

用户已明确确认当前 MVP 符合预期，并授权完成验收闭环。

### 处理结果

1. 已运行 accepted 验收命令，`docs/acceptance/user-acceptance-record.md` 记录真实项目验收通过和用户确认通过。
2. 已修复 `pnpm goal:audit` 对 quoted Playwright executable 验证命令的误判。
3. `pnpm goal:audit` 已通过 25/25 项检查，缺失 0 项，需要人工确认 0 项。

### 当前判断

该阻塞已解除。v0.1 长期 goal 可进入完成审计，后续工作转入 Spec v0.2。
