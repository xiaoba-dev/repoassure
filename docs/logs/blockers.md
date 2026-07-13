# 阻塞日志

## 2026年7月1日 - Public release branch protection gate remains blocked by private repo plan

### 背景

Public Release Manual Gate Closure v0.2 对 GitHub repository state 做了只读复核，目的是确认 `main` branch protection 或 equivalent repository ruleset 是否可以作为 public release gate 关闭依据。

### 复核结果

- `gh repo view xiaoba-dev/repoassure --json nameWithOwner,visibility,isPrivate,defaultBranchRef,url`：repository remains `PRIVATE`，default branch 为 `main`。
- `gh api repos/xiaoba-dev/repoassure/branches/main/protection`：返回 `HTTP 403`。
- `gh api repos/xiaoba-dev/repoassure/rulesets`：返回 `HTTP 403`。
- Latest `RepoAssure CI` run `28486178718` 为 `success`，但 CI success 不等于 branch protection 或 equivalent release control。

### 当前阻塞

GitHub 仍返回：

```text
Upgrade to GitHub Pro or make this repository public to enable this feature.
```

仓库必须继续保持 private，不能为了启用 branch protection 而公开仓库。

### 需要的外部条件

满足以下任一条件后才能重新尝试关闭该 gate：

1. GitHub plan 权限允许 private repo branch protection 或 repository rulesets。
2. Maintainer 明确提供可接受的 equivalent release control，并记录 scope、执行方式和风险接受边界。

### 边界

- 该阻塞未解决。
- 不授权 repository visibility change、npm publication、GitHub release、public launch、production marketing announcement、SaaS availability、Team Cloud availability、Enterprise availability 或 hosted dashboard availability claims。

## 2026年6月30日 - Public Website Custom Domain Deployment v0.1 is blocked by missing DNS CNAME records

Resolved on 2026-07-01.

### 背景

用户已在 Cloudflare 购买 `RepoAssure.com`，并授权将 RepoAssure 官网部署到 `repoassure.com` 和 `www.repoassure.com`。

### 已完成

1. `pnpm build:website`：通过。
2. `wrangler pages deploy apps/website/dist --project-name repoassure-preview --branch main --commit-dirty=true --commit-message "RepoAssure custom domain deployment"`：通过。
3. Cloudflare Pages custom domain API 已接受 `repoassure.com` 和 `www.repoassure.com` 两个绑定。
4. Cloudflare zone lookup 确认 `repoassure.com` 已在 `Web3coderman` account 中 active。

### 当前阻塞

Cloudflare Pages custom domain status 曾为 pending：

- `repoassure.com`: `CNAME record not set`
- `www.repoassure.com`: `CNAME record not set`

当前 `CLOUDFLARE_API_TOKEN` 创建 DNS 记录返回：

```text
Authentication error
```

因此 Codex 不能通过 API 添加所需 DNS 记录。

### 解决结果

用户通过 Cloudflare Dashboard 添加 DNS 后，Cloudflare Pages custom domains API 返回：

- `repoassure.com`: active
- `www.repoassure.com`: active

验证结果：

- `https://repoassure.com`: HTTP/2 200 over HTTPS。
- `https://www.repoassure.com`: HTTP/2 200 over HTTPS。
- `REPOASSURE_WEBSITE_URL=https://repoassure.com pnpm verify:website`: passed。
- `REPOASSURE_WEBSITE_URL=https://www.repoassure.com pnpm verify:website`: passed。
- 英文默认、Simplified Chinese 语言切换、desktop/mobile smoke、Trust Ledger、Assurance Graph、artifact tabs、private preview form 和 forbidden-claim custom-domain boundary 均已验证。

### 需要的外部条件

已通过 Cloudflare Dashboard 或等效 DNS 操作添加：

1. `CNAME` / Name `@` / Target `repoassure-preview.pages.dev` / Proxy `Proxied`
2. `CNAME` / Name `www` / Target `repoassure-preview.pages.dev` / Proxy `Proxied`

HTTPS、RepoAssure 页面内容、语言切换和 forbidden-claim boundary 已继续验证并通过。

### 边界

- 该阻塞已解决，但历史记录保留用于审计。
- 不授权 public launch、production marketing announcement、repo public、npm publication、GitHub release、SaaS availability、Team Cloud availability、Enterprise availability 或 hosted dashboard availability claims。

## 2026年6月27日 - Cloudflare Pages + Access private preview execution is blocked before website upload

### 背景

用户已明确授权创建 Cloudflare Pages private preview、上传 RepoAssure 官网构建产物，并使用 Cloudflare Access 保护 reviewer 访问。当前 Cloudflare Wrangler 已登录，账号为 `Web3coderman`，邮箱记录已匿名化为 `maintainer-authenticated-smoke-identity`。

### 影响

Cloudflare Pages preview deployments are public by default。为了避免在 Access policy 生效前暴露官网构建物，本轮遵循安全顺序：先创建空 Pages project，再配置 Access，最后才上传 build output。当前 Access API 权限不足，因此执行被阻塞在上传前。

### 已尝试方案

1. `wrangler whoami --json`：确认登录态可用，账号为 `Web3coderman`。
2. `wrangler pages project list`：确认此前不存在 `repoassure-preview`。
3. `wrangler pages project create repoassure-preview --production-branch preview`：Successfully created the `repoassure-preview` Pages project；域名为 `repoassure-preview.pages.dev`，但尚无 deployment。
4. `curl -sS -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" https://api.cloudflare.com/client/v4/user/tokens/verify`：确认 API token active。
5. `curl -sS -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" https://api.cloudflare.com/client/v4/accounts/<account-id>/access/apps`：返回 `Authentication error`。测试合同记录为 `accounts/.../access/apps`，避免泄露 account id。
6. `wrangler pages deployment list --project-name repoassure-preview`：返回空列表，确认 No website source or build output was uploaded。

### 当前判断

Pages project 创建权限可用，但当前 Cloudflare API token 缺少 Zero Trust Access application / policy 管理权限，或 Access API 需要在 Cloudflare dashboard 中补充权限配置。由于 Access 未配置，不能执行 `wrangler pages deploy apps/website/dist --project-name repoassure-preview --branch preview`，也不能分享任何 preview URL。

### 需要的用户决策或外部条件

需要满足以下任一条件后再继续：

- 在 Cloudflare dashboard 手工为 `repoassure-preview.pages.dev` 创建 Self-hosted Access application，并配置 allow policy 给 reviewer 邮箱。
- 或更新当前 API token 权限，使其可管理 Cloudflare Zero Trust Access applications and policies，然后重新执行自动配置。

继续前必须先验证：

- Access policy blocks unauthenticated requests。
- Invited reviewer can authenticate。
- No deployment exists for `repoassure-preview` until Access is configured。

### 临时绕过方案

保留空的 `repoassure-preview` Pages project 作为后续受控预览目标；继续使用本地静态预览包作为 review surface。不得上传 website source/build output，不得伪造 preview URL，不得 public launch 或 production deployment。

## 2026年6月26日 - Public website private preview deployment is blocked by Vercel preview target mismatch

### 背景

用户已明确授权将 RepoAssure 官网代码和构建产物上传到 Vercel，用于 private preview deployment。本地 Vercel CLI 已登录，当前账户为 `web3coderman-dev`。`main` 仍保持 private repo 状态，且本地 `pnpm build:website` 通过。

### 影响

当前 Vercel 项目会把多次 CLI 部署尝试提升为 `target production` 并绑定公开 production alias。推送 `main` 后，Vercel Git integration 也曾自动创建 production 环境部署；该 Git integration 已断开。这些 production URL 不满足 ADR-0020 对 private preview deployment、production deployment 和 public launch 三个 gate 的隔离要求，因此不能把它们作为 accepted private preview 交付。

### 已尝试方案

1. 新增 `vercel.json`，指定 `pnpm build:website`、`pnpm install --frozen-lockfile` 和 `apps/website/dist`。
2. `vercel link --yes --project repoassure`：创建并链接 `web3coderman-devs-projects/repoassure`，本地 `.vercel/` 已加入 `.gitignore`，不提交项目 ID。
3. 首次 `vercel --yes`：因上传文件数超过限制失败；随后新增 `.vercelignore`，排除 `node_modules`、构建输出、本地 artifacts、`.git` 和敏感 env/key 文件。
4. 重试 `vercel --yes`：部署成功但 Vercel 返回 `target production`，并绑定 `repoassure.vercel.app` 等 alias；已移除 aliases 和 deployment。
5. 尝试 `vercel --yes --target preview --skip-domain`：返回 `target preview`，但状态为 `UNKNOWN`，无法完成 logs、smoke、screenshot 或内容验证；已移除该 deployment。
6. 尝试 `vercel --yes --target preview --force --logs`：仍返回 `target production`；已移除 aliases 和 deployment。
7. 尝试 `vercel deploy --yes --target=preview --force --logs`：仍返回 `target production`；已移除 aliases 和 deployment。
8. 在临时分支 `codex/vercel-preview-deployment` 尝试 `vercel deploy --yes --force --logs`：仍返回 `target production`；已移除 aliases 和 deployment。
9. 推送 `main` 后，Vercel Git integration 自动创建 Git push to `main` 对应的 production deployment，并绑定 `repoassure-git-main-web3coderman-devs-projects.vercel.app`；已移除 alias 和 deployment。
10. 运行 `vercel git disconnect --yes`，CLI 返回 `Disconnected xiaoba-dev/repoassure`，后续 push 不应再自动创建 Vercel deployments。
11. 清理后运行 `vercel ls repoassure`，结果为 `No deployments found`。
12. Resolve Vercel Preview Target Blocker v0.1：确认 `main` clean、latest `RepoAssure CI` success、Vercel project settings 与 `vercel.json` 一致、Git integration disconnected、`vercel ls repoassure` 为 `No deployments found`。
13. Vercel preview deployment retry：在 `main` 上执行 `vercel deploy --yes --force --logs`，Vercel 仍返回 `Production`、`target production`，并绑定 production aliases；已移除 aliases 和 deployment `dpl_6qQkuqRBRtGtS3Y1zvJK8AwGyiLG`。
14. Vercel preview deployment retry：在 `main` 上执行 `vercel deploy --yes --target preview --skip-domain --force --logs`，Vercel 仍返回 `Production`、`target production`；已移除 aliases 和 deployment `dpl_5n9tj9sHgRQLvRLHvWEnNopDBDbc`。
15. Vercel preview deployment retry：在临时非 main 分支 `codex/vercel-preview-target-retry` 上执行 `vercel deploy --yes --force --logs`，Vercel 仍返回 `Production`、`target production`；已移除 aliases 和 deployment `dpl_3DrDKRnDrjH8yUpBuXDZn718eAyM`。
16. 清理后再次运行 `vercel ls repoassure`，结果为 `No deployments found`。

### 当前判断

Vercel data-export 授权和 CLI 认证已满足，Git integration 已断开，本地 main / 非 main 分支差异已排除。当前 blocker 已从“缺少授权”转为“链接后的 Vercel project / CLI deployment target 不满足 private preview 边界”。在没有一个 `Ready`、访问受控、非 production alias 的 preview deployment 前，不得伪造 preview URL，不得把 production URL 当成 private preview，不得继续 public launch 或 production gate。

### 需要的用户决策或外部条件

需要在 Vercel dashboard 或项目配置中确认为什么 CLI deployment 被自动提升为 production；也可以选择一个可证明生成 private preview URL 的替代托管路径。Vercel Git integration 已断开，不能在未重新评估 private preview 边界前恢复。继续前需要满足以下条件：

- 部署目标 inspect 必须显示 `target preview` 或等效访问受控目标。
- 部署状态必须为 `Ready`。
- 不得绑定 public production alias。
- 能完成 smoke/content/screenshot/forbidden-claim verification。
- 验证完成前不得将该部署视为 accepted private preview。

ADR-0021 已接受 private preview hosting fallback decision：现有 Vercel project 在 target mismatch 修复前暂停用于 remote private preview；local static preview bundle 是临时 review surface；远程 fallback 优先选择 Cloudflare Pages preview deployments with Cloudflare Access 或等效访问受控静态托管。Cloudflare Pages preview deployments are public by default，必须先启用 access policy 再分享任何 remote preview URL。

### 临时绕过方案

保留 `vercel.json` 和 `.vercelignore` 作为部署前置配置；继续本地 build、文档、测试和部署配置审计。不得伪造 preview URL，也不得用其他第三方托管绕过 access-control、verification 和 post-deployment boundary 要求。

## 2026年6月26日 - Public website private preview deployment requires explicit Vercel data-export approval

### 背景

用户已授权执行 Public Website Private Preview Deployment Execution v0.1。当前默认部署路径选择 Vercel preview deployment，因为 ADR-0020 允许在单独 deployment execution goal 中选择 Vercel preview 或等效访问受控静态托管。

### 影响

真实 Vercel 部署会把 RepoAssure private repo 的 website source/build output 上传到 Vercel。当前环境中，Vercel CLI 登录态已恢复为 `web3coderman-dev`；Vercel MCP 部署工具此前拒绝执行，因为缺少对具体第三方目的地和数据披露风险的明确确认。

### 已尝试方案

1. `vercel whoami`：失败，提示 specified token is not valid。
2. 检查 `VERCEL_*` 环境变量：当前进程没有 Vercel 环境变量。
3. `env -u VERCEL_TOKEN vercel whoami`：失败，提示 No existing credentials found。
4. 尝试使用 Vercel MCP deployment tool：被拒绝，原因是会向未明确确认的第三方服务导出 private repository website code/build output。
5. 补充 `vercel.json` 部署前置配置，明确 `pnpm build:website`、`pnpm install --frozen-lockfile` 和 `apps/website/dist`，但不执行上传或部署。
6. 运行 `vercel login` 并完成 OAuth device flow；`vercel whoami` 返回 `web3coderman-dev`。

### 当前判断

这是明确第三方 data-export 授权 blocker，不是 website build、产品代码或 Vercel CLI 认证问题。已确认 `pnpm build:website` 在本地通过，且 Vercel CLI 已登录；但真实 private preview deployment 不能在缺少明确 Vercel 上传授权的情况下继续。

### 需要的用户决策或外部条件

用户需要明确授权以下内容后才能继续：

```text
我明确授权将 RepoAssure 官网代码和构建产物上传到 Vercel，用于 private preview deployment。
```

认证条件当前已满足：本地 Vercel CLI 已完成 `vercel login`，当前账户为 `web3coderman-dev`。

### 临时绕过方案

在明确授权和认证可用前，只能继续本地 build、文档规划、部署配置设计和非联网测试；不得伪造 preview URL、不得使用其他第三方托管绕过该限制。

## 2026年6月25日 - Public release manual gates remain before publication

### 背景

ADR-0015 允许在 private repo 中加入 Apache-2.0 `LICENSE`、贡献政策、安全披露、dependency license audit 和 public release notes draft，作为 public release readiness material。

### 影响

`pnpm release:check` 的自动项已经可以通过，但仍报告 `public release ready: no`。在人工发布授权完成前，不能公开 repo、发布 npm package、打公开 release、公开公告或发布外部 case study。

### 已尝试方案

1. 添加 repository-level Apache-2.0 `LICENSE`。
2. 添加 `CONTRIBUTING.md`，记录 Developer Certificate of Origin 和 no-CLA 初始策略。
3. 添加 `SECURITY.md`，记录 private vulnerability disclosure 边界。
4. 添加 `docs/product/strategy/dependency-license-audit-v0.1.md` 和 `docs/product/strategy/public-release-notes-v0.1.md`。
5. 扩展 `pnpm release:check`，检查 readiness materials，并保留 `manual-publication-authorization` not_ready gate。

### 当前判断

这是人工/外部发布 gate，不是本地代码缺陷。自动 readiness materials 已准备好；公开发布仍需要法律 review、trademark/name review、branch protection 或等效 repository ruleset，以及最终 maintainer publication authorization。

### 需要的用户决策或外部条件

完成法律和商标 review；解决 GitHub branch protection / ruleset 权限；由 maintainer 明确授权是否 make repository public、publish npm package、create public release、announce publicly 或 publish external case studies。

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

## 2026年7月13日 - full Vitest parallel dist rebuild race

Resolution status: resolved

### 背景

标准 `pnpm test` 会并行运行多个 integration files；其中多条 CLI package scripts 各自执行 `build:acceptance`，并共同重写 `packages/acceptance/dist`。MCP/CLI 子进程可能在重写窗口读取到半成品 ESM modules。

### 影响

两次标准 full run 分别在既有 resume-evidence intake 和新增 external MCP consumer 中出现 `does not provide an export named ...`，每次涉及不同、源码与最终 dist 中都真实存在的 export。专用 `pnpm test:mcp-external-config` 11/11 稳定通过；失败用例聚焦重跑也通过，因此不是本 Goal 的配置/runtime 行为回归，但标准 full test 目前存在非确定性。

### 已尝试方案

1. 检查 source 和最终 dist export：一致。
2. 聚焦重跑首次失败的 intake integration：2/2 passed。
3. 重跑标准 full suite：错误转移到另一个同时读取 acceptance dist 的 MCP child，确认共享 dist 重建竞态。
4. 保留 dedicated CI gate，并使用 serialized full Vitest 作为当前可靠全量验收路径。

### 当前判断

不在 External AI IDE Configuration Validation 的产品范围内临时修改 acceptance build architecture。需要独立的 Parallel Test Runtime Build Isolation v0.1 Execution Goal：让 integration scripts 消费一次性预构建或隔离输出，并让标准 `pnpm test` 可重复稳定通过。

### 临时边界

在该 Goal 完成前，最终本地 full evidence 使用无文件并行的 Vitest；GitHub CI 的 unit、real MCP client 和 external config dedicated gates保持顺序执行。该 workaround 不等于竞态已修复。

### 解决记录

Parallel Test Runtime Build Isolation v0.1 已让标准 `pnpm test` 在 Vitest collection 前完成 package/root runtime build，并通过 source fingerprint、跨进程 single-flight lock、成功后状态写入和 orphan-owner recovery 阻止并发 `tsc` 改写 `packages/acceptance/dist`。原 serialized workaround 不再作为完成证据；最终验收改为连续三轮标准 file-parallel full suite。
