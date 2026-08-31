# CLAUDE.md

本文件为 Claude Code 在本仓库工作时提供指引。

## 项目定位

RepoAssure 是一个 local-first 的 AI 代码验收与交付保障层：以 CLI + MCP Server 两种入口，分析 / 启动 / 探索 AI 生成的 Web 应用，产出硬化报告、回归测试草案、修复计划和 AI IDE 可消费的交接物料。工作区 package 名仍为 `hardening-mcp`（`package.json` `"private": true`，未发布 npm）。

## 常用命令

命令来源：`package.json` scripts、`.github/workflows/ci.yml`、`CONTRIBUTING.md`。包管理器固定为 `pnpm@10.28.1`，Node `>=22`。

```bash
pnpm install                 # 安装依赖（CI 用 --frozen-lockfile）
pnpm build                   # tokens → packages → src(tsc) → website
pnpm dev <command> ...       # tsx 直跑 CLI，等价 node dist/adapters/cli/index.js
pnpm dev:website             # 只跑官网 vite dev
pnpm typecheck               # build:packages + tsc --noEmit + packages + website
pnpm lint                    # eslint .
pnpm test                    # build:packages + build:src + vitest run（全量）
pnpm test:unit               # pnpm build + vitest run tests/unit
pnpm test:integration        # vitest run tests/integration
pnpm test:e2e                # vitest run tests/e2e
pnpm repo:hygiene            # 已追踪文件卫生检查（禁 artifacts/env/私钥入库）
pnpm goal:audit              # 目标审计，CI 最后一道门
```

CLI 子命令（`src/adapters/cli/run.ts`）：`analyze`、`explore`、`generate-tests`、`plan`、`report`、`verify`、`verify-env`、`security`、`run`、`repair <handoff|execute|patch-plan>`。每个子命令的 `--help` / `-h` 在任何文件写入前返回。

MCP 相关：

```bash
node dist/adapters/mcp/index.js          # stdio MCP server（需先 pnpm build）
pnpm app:mcp                             # apps/mcp-server/index.js 同一入口
pnpm --silent mcp:config -- --client cursor|vscode|codex   # 只写 stdout，不改客户端配置
pnpm test:mcp-real-client                # 真实 stdio 客户端集成验证
pnpm test:mcp-external-config            # 外部 AI IDE 配置验证
```

验收 / playbook 类命令数量很多（`pnpm acceptance`、`pnpm playbook:*`、`pnpm goal:recover:*`、`pnpm project:intelligence:*`），实现在 `packages/acceptance/src/`，入口脚本在 `scripts/generate-*.mjs`。它们依赖 `pre*` 钩子先构建，因此 `.npmrc` 固定了 `enable-pre-post-scripts=true` —— 不要移除。

## 架构速览

分阶段迁移中的 pnpm monorepo（`pnpm-workspace.yaml`: `apps/*`、`packages/*`）。

- `src/adapters/cli/` + `src/adapters/mcp/` — 两个入口适配器；MCP 工具清单与参数校验集中在 `src/adapters/mcp/tool-registry.ts`。
- `src/tools/` — CLI 与 MCP 共享的工具编排层（每个 MCP tool 一个 `*-tool.ts`）。
- `src/domain/` — 领域逻辑：`analyze/`、`boot/`、`tests/`、`reports/`、`verify-environment/`、`integrity/`；`explore/` 与 `repair-plan/` 已是兼容 wrapper。
- `packages/` — 已抽出的实现包：`shared`（脱敏、shell quoting）、`security-assurance`（本地安全证据导入）、`browser-explorer`（Playwright/fetch 探索）、`repair-planner`（修复计划与任务包）、`acceptance`（验收/playbook/goal-recovery 全部 stage writer）、`design-system`（预构建产物）、`core`（仅 README 占位）。
- `apps/cli`、`apps/mcp-server` — 复用兼容 bin 的 app shell；`apps/website` — React 19 + Vite 官网（`@repoassure/website`）。
- MCP 暴露 13 个 tool：`analyze_repo`、`boot_app`、`stop_app`、`explore_app`、`generate_tests`、`generate_repair_plan`、`prepare_repair_handoff`、`preview_repair_execution`、`generate_repair_patch_plan`、`list_security_providers`、`import_security_evidence`、`harden_report`、`run_hardening`。

产物写入目标 repo 的 `.hardening/`：`.hardening/latest/manifest.json` 指向 `.hardening/runs/<run-id>/` 下的 `hardening-report.md`、`findings.json`、`repair-plan.json`、`ai-ide-handoff-package.json` 等。

## 测试与验证

- 框架：Vitest（`vitest.config.ts`，node 环境、globals、`maxWorkers: 4`）；浏览器侧用 Playwright。
- 位置：`tests/unit/`（约 80 个 `*.test.ts`）、`tests/integration/`（约 41 个）、`tests/e2e/`（`*.e2e.test.ts`）、`tests/type-smoke/`（类型冒烟，非 test 文件）、`tests/support/real-mcp-client.ts`、`tests/fixtures/`。
- 真实 Chromium E2E 由环境变量 `HARDENING_E2E_BROWSER=1` 开启（CI 在 "Full test suite" 步骤设置）。
- 跑单个文件：`pnpm vitest run tests/unit/<name>.test.ts`（先 `pnpm build:packages && pnpm build:src`）。

## 项目约定

- TypeScript ESM（`"type": "module"`），`module/moduleResolution: NodeNext`，相对 import 必须带 `.js` 后缀。
- `tsconfig.json` 开了 `strict`、`noUncheckedIndexedAccess`、`exactOptionalPropertyTypes` —— 可选字段用 `...(x ? { x } : {})` 展开传入，是全仓通行写法。
- ESLint 强制：`@typescript-eslint/no-explicit-any: error`、`consistent-type-imports: error`、`no-console`（只允许 `warn` / `error`）。
- 命名：文件 kebab-case；MCP tool 名 snake_case；npm scripts 用 `域:动作`（`playbook:*`、`goal:recover:*`）；跨包引用走 `@hardening-mcp/*` workspace 别名。
- 隐私边界：CLI stdout/stderr 与 MCP `content`/`structuredContent` 写出前一律脱敏（`src/shared/privacy-redaction.ts`、`redactMcpStructuredContent`）；repair 侧禁止 `--apply` / `--write` / `--auto-fix` / `--commit` / `--push` / `--pull-request`，不改目标 repo、不建 branch/commit/PR。
- 文档真相源入口：`docs/PRD.md`、`docs/SPEC.md`、`docs/DESIGN.md`、`docs/PLAN.md`；架构决策在 `docs/adr/`（49 份），运维记录在 `docs/operations/`，目标在 `docs/goals/`。

## CI 与发布

- CI：`.github/workflows/ci.yml`（PR + `main` push），单 job `Quality Gates`，顺序为 install → `repo:hygiene` → `test:unit` → `test:mcp-real-client` → `test:mcp-external-config` → 安装/缓存 Playwright Chromium → `pnpm test`（带 `HARDENING_E2E_BROWSER=1`）→ `typecheck` → `lint` → `build` → `goal:audit`。
- `main` 受保护，必需检查为 `Quality Gates`；变更走 PR，贡献需 DCO 签名（`git commit -s`，见 `CONTRIBUTING.md`）。
- 提交前建议：`pnpm repo:hygiene && pnpm lint && pnpm typecheck && pnpm build && pnpm test:unit && pnpm goal:audit`；影响运行时/浏览器/产物时补 `pnpm acceptance -- --full --browser`。
- 分发：`.github/actions/repoassure/action.yml` 是 local-first composite action（checkout 内 install + build + `node dist/adapters/cli/index.js run`），示例见 `examples/github-actions/repoassure-local-first.yml`。
- 官网构建配置：`vercel.json`（`buildCommand: pnpm build:website`，`outputDirectory: apps/website/dist`）；另有 `pnpm package:website-preview` / `preflight:cloudflare-preview` / `verify:cloudflare-preview` 一组预览脚本。
- npm 发布未执行：`package.json` 为 `private: true`；`bin` 声明为 `hardening` 与 `hardening-mcp`，`prepack` 走 `scripts/prepare-packed-cli.mjs`。
